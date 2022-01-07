---
layout: post
title: You don't always need an IOC library
description: A brief discussion about not always needing an IOC library
tags: ['Programming']
featured_image: 
hidden: False
published: 08/10/2015
ispublished: True
---
The principle of YAGNI should always apply, and I was recently reminded of that when I had to build a small application to give to a user for a small one off task. We're talking a single screen application with a single button on it. Idiot proof.

So, `File > New > Winforms application` - doesn't have to be anything fancy. Then I caught myself: My first instinct was to add [StructureMap](http://structuremap.github.io) to it. 

I thought to myself that it's only going to have a few classes, I mean just because it's a small winforms app doesn't mean I'm going to shit up the code behind with business logic and data access, so why bother with the overhead of adding a IOC library?

It doesn't mean I don't have to use dependency injection. [Mark Seemann](https://twitter.com/ploeh) calls this "Poor Man's DI".

{% highlight csharp %}
static class Program
{
    [STAThread]
    static void Main()
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);

        var service = new Service(new Database(), new Other());
        Application.Run(new Main(service));
    }
}
{% endhighlight %}

It's short and sweet, and there is no IOC container configuration to worry about. Because I don't need to.

What about when....

Requirements change. "Can it just do this as well...?" More dependencies required, perhaps another form, maybe another service or two. I think I'd see how far I could push Poor Man's DI before I brought in a proper IOC container to help manage things.
