---
layout: post 
published: true
title: About those view locator conventions
category: wpf, prism
metadescription: PRISM view locator conventions
---
As I mentioned in a previous post, I do not like some of the default PRISM view location conventions.

As a refresher, these are:

- View models to be located in a folder called ViewModel, named MyAwesomeViewModel
- Views to be located in a folder called Views, named MyAwesome

It's the view naming that I don't like: In my world (which is based on Caliburn.Micro and ReactiveUI), views should be named MyAwesomeView. This is a simple distinction, but an important one for me because I automatically expect view names to end in View.

Fortunately in PRISM 5, this is easy to change:

    ViewModelLocationProvider.SetDefaultViewTypeToViewModelTypeResolver(viewType =>
    {
        var viewName = viewType.FullName;
        var viewAssemblyName = viewType.GetTypeInfo().Assembly.FullName;
        var viewModelName = string.Format(CultureInfo.InvariantCulture, " {0}Model, {1} ", viewName.Replace("Views", "ViewModels"), viewAssemblyName);
        return Type.GetType(viewModelName);
    });

We get the full name of the view, and the full name of the assembly, and then replace "Views" for the "ViewModels" folder, and add "Model" to the end. I would call this somewhere in your applications startup, such as in the bootstrapper ```Run```.

## Autowiring
Something else that you can do in PRISM 5, is autowire the view model and view such that the ```DataContext``` of the view is automatically populated. 

    ViewModelLocationProvider.SetDefaultViewModelFactory(type => Container.GetInstance(type));

I'm using StructureMap here (of which I am a big fan), but you should be able to get to work with your favourite IoC library.

This though, means that you have to tell StructureMap about all your views in order for it to be able to resolve them. That's too much messing about remembering having to update a ```Registry``` everytime I add a view. StructureMap can solve that for us no problem:

    public class ViewRegistrationConvention : IRegistrationConvention
    {
        public void Process(Type type, Registry registry)
        {
            if (!type.Name.EndsWith("View") || ! type.IsConcrete()) return ;

            registry.For(typeof(object)).Use(type).Named(type.Name);
        }
    }

Here we say that if the name of the type being resolved ends with "View", and it is a concrete type (i.e. not an abstract class or interface), then add it to the registry.
The trick with PRISM is that it is asking to resolve an ```object``` with a specific name, it doesn't try to resolve the type of the view, so adding something to the registry as ```For<MyAwesomeView>().Use<MyAwesomeView>()``` won't work, you have to use ```For(typeof(object))``` and make it a named instance, using the name of the type. 

 And then just register the convention when you configure the container:

    Container.Configure(configure =>
    {
        configure.Scan(scan =>
        {
            ...
            scan.Convention<ViewRegistrationConvention>();
        });
    });

Then from the region manager, you can ```RequestNavigate("AwesomeRegion", new Uri(typeof(MyAwesomeView)))```, or use the extension method in my previous post. 
