---
layout: post
title: 'Configuring SignalR in StructureMap'
description: 
tags: [Signalr,Structuremap]
featured_image: /assets/images/2015-06-04-structuremap-and-signalr.webp
image: /assets/images/2015-06-04-structuremap-and-signalr.webp
hidden: False
published: 04/06/2015
ispublished: True
---
Configuring [SignalR](http://signalr.net/) in ASP.NET MVC, using [StructureMap](http://structuremap.github.io/structuremap/) as the IoC container is fairly straightforward, but not without some subtleties that caught me out.

For the purposes of this post, I'm going to assume that you are familiar with both SignalR and StructureMap, and that you know how to configure them in an ASP.NET MVC application. I will also assume that through some google-fu you have seen the [Dependency Injection in SignalR](http://www.asp.net/signalr/overview/advanced/dependency-injection) guidance, and have worked through it and got to the "Using IoC Containers in SignalR" section.

I would assume, although I've not tested it, that much of this could also be applied to a self-hosted SignalR server.

## Library versions used

This post is based on:

- Asp.Net MVC 5.2.3
- SignalR 2.2.0
- StructureMap 3.1.5.154
- StructureMap.MVC5 3.1.1.134

Follow the guidance up to the section on using Ninject, at which point we now want to configure StructureMap.

## Replace the SignalR Dependency Resolver

The implementation is nearly identical, with some obvious StructureMap specific differences:

{% highlight csharp %}
public class StructureMapSignalRDependencyResolver : DefaultDependencyResolver
{
    private readonly IContainer _container;

    public StructureMapSignalRDependencyResolver(IContainer container)
    {
   	    _container = container;
    }
    
    public override object GetService(Type serviceType)
    {
        return _container.TryGetInstance(serviceType) ?? base.GetService(serviceType);
    }
    
    public override IEnumerable<object> GetServices(Type serviceType)
    {
        var objects = _container.GetAllInstances(serviceType).Cast<object>();
        return objects.Concat(base.GetServices(serviceType));
    }
}
{% endhighlight %}    

The behaviour is fairly similar. `TryGetInstance` will attempt to resolve the type, and if it doesn't know about it, will return null, in which case we call the base resolver, which does.

Register this with StructureMap:

{% highlight csharp %}
For<IDependencyResolver>().Singleton().Use<StructureMapSignalRDependencyResolver>();
{% endhighlight %}    

In your `Startup`, where you configure SignalR, we need to use this new resolver implementation:

{% highlight csharp %}
var resolver = DependencyResolver.Current.GetService<Microsoft.AspNet.SignalR.IDependencyResolver>();
    
var hubConfiguration = new HubConfiguration
{
    Resolver = resolver

    /* other options as required */
};
{% endhighlight %}    

Here, we are using the MVC DependencyResolver, which has already been replaced by StructureMap thanks to StructureMap.MVC5, to resolve an instance of the SignalR dependency resolver we've registered, which we then tell SignalR to use with a hub configuration object.

Now we just need to configure the StructureMap registry, and teach it how to resolve `IHubConnectionContext<dynamic>`:

{% highlight csharp %}
For<IConnectionManager>().Use<ConnectionManager>();
For<IStockTicker>()
    .Singleton()
    .Use<StockTicker>()
    .Ctor<IHubConnectionContext<dynamic>>()
    .Is(ctx => ctx.GetInstance<IDependencyResolver>()
        .Resolve<IConnectionManager>()
        .GetHubContext<StockTickerHub>().Clients);
{% endhighlight %}    

As in the guidance, we want the `StockTicker` instance to be a singleton, and we have specify how to resolve the `IHubConnectionContext<dynamic>` which the `StockTicker` requires. In the `Is`, I'm using the context to resolve the default SignalR connection manager we've registered. This isn't in the guidance, but I couldn't get it work without doing this.

If anyone has comments/improvements on this, I'd love to hear them.

