---
layout: post
title: More on the generic plugin manager
description: more-on-the-generic-plugin-manager
tags: ['C#','Coding','Plugin Manager']
featured_image: /assets/images/2009-11-02-more-on-the-generic-plugin-manager.webp
image: /assets/images/2009-11-02-more-on-the-generic-plugin-manager.webp
hidden: False
published: 02/11/2009
ispublished: True
---
<h4>Update:</h4>
I've written some more about what I've learned whilst working on my plugin manager here: <a href="http://temporalcohesion.co.uk/2010/03/17/even-more-on-the-generic-plugin-manager/" target="_self">http://temporalcohesion.co.uk/2010/03/17/even-more-on-the-generic-plugin-manager/</a>

A few months ago <a title="Writing a generic plugin manager" href="http://temporalcohesion.co.uk/2009/05/25/writing-a-generic-plugin-manager-in-c/" target="_self">I wrote about</a> writing a generic plugin loader/manager in C#, where I offered links to several articles and referenced a rather excellent book about C# which I had used to base my plugin loader on. I hadn't really given it much thought since then, but according to Google Analytic's, it's one of the most hit posts on my blog. Recently I had a request to release the source code.

Now when I first wrote that post, I was hesitant to include any code, and I still am - not because I think there is something new and unique with what I've done - but, rather that what I have written is not terribly difficult to write. I do not mean to sound snobbish or arrogant at all, I'm just telling you how it is, all I've done is to do a bit of reflection on assemblies in a folder, and load instances of certain interfaces.

Anyway...

The scenario is that you want to provide a way for for 3rd parties to be able to add additional functionality to your application at run time. We need to provide a common way for 3rd parties to be able to register their new functionality into our application, in order that the user can take advantage of the exciting new feature being added to the application.

Straight away, you should be thinking to yourself: Interface!

<pre class="lang:csharp decode:1 " >

public interface IPlugin
 {
 /// &amp;lt;summary&amp;gt;
 /// Does what ever It is.
 /// &amp;lt;/summary&amp;gt;
 void Do(Action it);
 }

</pre>

Anyone who now wants to create a plugin for our application must implement our IPlugin interface, as it defines the contract to which our application is bound to, in order to recognise and load plugins. Thus any assembly, that has a class which implements IPlugin is considered by our application to be a plugin which is capable of offering additional functionality.

We can now attempt to load our plugins. We need to have a class which can scan a folder for assemblies, scan those assemblies for types which implement IPlugin, and then create instances of them which our application can use. Loading the assemblies is easy:

<pre class="lang:csharp decode:1 " >
public class PluginLoader&amp;lt;T&amp;gt;
{
 private IList&amp;lt;T&amp;gt; pluginsList = new List&amp;lt;T&amp;gt;();
 ...
}

...

public virtual IList&amp;lt;T&amp;gt; LoadPlugins()
 {
 foreach (string file in Directory.GetFiles(this.pluginFolderPath, &amp;quot;*.dll&amp;quot;, SearchOption.AllDirectories))
 {
 Assembly assembly = Assembly.LoadFile(file);
 this.LoadObjects(assembly);
 }

 return this.pluginsList;
 }
</pre>

We create a generic class, so we can use it with any type of plugin, and not just ones which implement IPlugin, then it's just simple directory recursion to load all the files in the specified folder which have a file extension of .dll. The real magic happens in the LoadObjects() method.

<pre class="lang:csharp decode:1 " >
var types = from t in assembly.GetTypes()
 where t.IsClass &amp;amp;&amp;amp;
 (t.GetInterface(typeof(T).Name) != null)
 select t;

 foreach (Type t in types)
 {
 T plugin = (T)assembly.CreateInstance(t.FullName, true);
 this.pluginsList.Add(plugin);
 }
</pre>

Using LINQ, we extract all the types from the assembly which are classes, which implement the interface which is a typeof(T) - T being the type we specified when we instantiated the class. You could just as easily here specify the type should inherit from some other type, and you could also check to see if a class has some assembly level attribute.

Why would you want to do that? Well, we can use an assembly level attribute to decorate the plugin class with meta-data about the plugin, such as the author, a short description, the name of the plugin, and it's version.

<pre class="lang:csharp decode:1 " >
public virtual KeyValuePair&amp;lt;string, List&amp;lt;KeyValuePair&amp;lt;string, string&amp;gt;&amp;gt;&amp;gt; GetPluginInformation(Type type)
 {
 var attributeInfo = from pa in type.GetCustomAttributes(false)
 where (pa.GetType() == typeof(PluginAttribute))
 select pa;

 foreach (PluginAttribute p in attributeInfo)
 {
 data.Add(new KeyValuePair&amp;lt;string, string&amp;gt;(&amp;quot;Author&amp;quot;, p.Author));
 data.Add(new KeyValuePair&amp;lt;string, string&amp;gt;(&amp;quot;Description&amp;quot;, p.Description));
 data.Add(new KeyValuePair&amp;lt;string, string&amp;gt;(&amp;quot;Name&amp;quot;, p.Name));
 name = p.Name;
 data.Add(new KeyValuePair&amp;lt;string, string&amp;gt;(&amp;quot;Type&amp;quot;, p.Type.ToString()));
 data.Add(new KeyValuePair&amp;lt;string, string&amp;gt;(&amp;quot;Version&amp;quot;, p.Version));
 }

 this.attributeInformation = new KeyValuePair&amp;lt;string, List&amp;lt;KeyValuePair&amp;lt;string, string&amp;gt;&amp;gt;&amp;gt;(name, data);

 return this.attributeInformation;
 }
</pre>

Or you could create a struct to use as a DTO for the plugin meta-data, it's up to you.

I've removed all the comments and exception handling from the code I've posted purely just to save space, you'd really want to include that - especially the exception handling. But that's really all there is to it, you might want to have a property to access the actual plugin list, or return it from a LoadPlugins method, it's up to you.

You'll notice I've made the methods virtual, you may want to use this class as a base class in another class. For instance I've got an additional class which inherits from my plugin loader class which does specific tasks for a particular type of plugin, and another which does different tasks for a different type of plugin.
