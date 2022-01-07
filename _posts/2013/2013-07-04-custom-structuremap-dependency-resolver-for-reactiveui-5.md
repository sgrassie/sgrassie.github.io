---
layout: post
title: Custom Structuremap Dependency Resolver for ReactiveUI 5
description: custom-structuremap-dependency-resolver-for-reactiveui-5
tags: ['Uncategorized']
featured_image: 
hidden: False
published: 04/07/2013
ispublished: True
---
<a title="ReactiveUI" href="http://reactiveui.net" target="_blank">ReactiveUI</a> 5 has just been released (although I've been playing with the -pre-release alpha for a while), and one of the shiny new things it brings is a simplified Service Location model. This is fine in the most part, for most applications. But, when you have some complicated dependencies between objects (ignoring the fact you might be heading towards a constructor over-injection anti-pattern), you may feel you need to use a full IoC container, like Structuremap, to do the heavy work.

All we need to do first is implement {csharp}IMutableDependencyResolver{/csharp}, and replace the default implementation in ReactiveUi with our new one.

<pre><code>
    public class StructureMapDependencyResolver : IMutableDependencyResolver
    {
        public StructureMapDependencyResolver()
        {
            ObjectFactory.Initialize(init =&gt; init.Scan(scan =&gt;
                          {
                              scan.TheCallingAssembly();
                              scan.LookForRegistries();
                              scan.WithDefaultConventions();
                          }));

        }

        public void Dispose()
        {
        }

        public object GetService(Type serviceType, string contract = null)
        {
            return string.IsNullOrEmpty(contract)
                       ? ObjectFactory.GetInstance(serviceType)
                       : ObjectFactory.GetNamedInstance(serviceType, contract);
        }

        public IEnumerable&lt;object&gt; GetServices(Type serviceType, string contract = null)
        {
            return ObjectFactory.GetAllInstances(serviceType).Cast&lt;object&gt;();
        }

        public void Register(Func&lt;object&gt; factory, Type serviceType, string contract = null)
        {
            ObjectFactory.Configure(x =&gt; x.For(serviceType).Use(factory()));
        }
    }
</code></pre>

Then, make ReactiveUI use it.
<pre><code>
var resolver = new StructureMapDependencyResolver();
RxApp.InitializeCustomResolver((o, type) =&gt; resolver.Register(() =&gt; o, type));
RxApp.DependencyResolver = resolver;
</code></pre>
The second line there is very important: ReactiveUi uses the DependecyResolver internally, so if you use your own, you need to initialise it with the default ReactiveUi types, or else The Bad Things will happen.
