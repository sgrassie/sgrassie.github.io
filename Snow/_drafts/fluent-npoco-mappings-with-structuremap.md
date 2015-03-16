I like using NPoco, it's a really nice library that allows you stop having to write raw ADO.NET. Recently I just switched one of my projects at work to use the Fluent Mapping features, essentially so that my POCO's do not need to have the mapping attributes in them.

I started wth the example on the NPoco wiki of creating a database factory, and adding the mapping class to the fluent configuration. As the number of mapping classes has grown, this has quickly become a little unwieldy, and a bit of a maintainance issue.

As I already utilise Structuremap in the application, I wanted to configure it to automatically pick up my mapping classes and build the configuration object for me. This is easy to in the registry:

'''
		public DefaultRegistry()
		{
			Scan(
				scan =>
				{
					scan.TheCallingAssembly();
					scan.WithDefaultConventions();
					scan.With(new ControllerConvention());
					scan.AddAllTypesOf<IMap>();
				});

			For<FluentConfig>().Use(context => FluentMappingConfiguration.Configure(context.GetAllInstances<IMap>().ToArray()));
			For<DatabaseFactory>().Singleton().Use<DatabaseFactory>();
			For<IDatabase>().HttpContextScoped().Use(context => context.GetInstance<DatabaseFactory>().GetDatabase());
		}
'''
The mapping classes must inherit from `Map<T>`, which itself inherits from `IMap`. Thus we can confidently add all types of `IMap` in the scan.

Then an instance of `FluentConfig` must be registered, which can be done with an overload of `.Use`, from which we get the StructureMap context and pull out all the types of IMap which have been found and pass it to the static `.Configure` method of the `FluentMappingConfiguration`, which constructs the instance.

The `DatabaseFactory` (see below) is then registered, and it accepts a 'FluentConfig' instance in its constructor. As per the original example on the NPoco wiki, it is marked as a singleton to ensure that only one instance is created, so that the mappings do not get registered more than once. I don't know what would happen if the mappings were to be registered more than once, but I assume that it would be a Bad Thing&trade;.

Then, for the NPoco `IDatabase` instance that we register, we want to always create it using the instance of the `DatabaseFactory` that has already been registered, which again is accessible using the overload of `.Use` to get the Structuremap context. It's marked as `.HttpContextScoped()`, but I'm honestly not sure if that's required or not given that I'm using `Structuremap.MVC5` nested containers.

'''
	public class DatabaseFactory
	{
		private static NPoco.DatabaseFactory _internalFactory;

		public DatabaseFactory(FluentConfig fluentConfig)
		{
			Configure(fluentConfig);
		}

		private static void Configure(FluentConfig fluentConfiguration)
		{
			_internalFactory = NPoco.DatabaseFactory.Config(x =>
			{
				x.UsingDatabase(() => new ProfiledDatabase("ConnectionString"));
				x.WithFluentConfig(fluentConfiguration);
			});
		}

		public NPoco.Database GetDatabase()
		{
			return _internalFactory.GetDatabase();
		}
	}
'''
