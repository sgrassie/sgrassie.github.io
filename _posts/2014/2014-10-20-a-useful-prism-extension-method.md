---
layout: post
title: A useful PRISM extension method
description: Why isn't this included by default?
tags: [Prism,C#,Mvvm]
featured_image: 
hidden: False
published: 20/10/2014
ispublished: True
---
I'm doing some work with Microsoft [Prism](http://msdn.microsoft.com/en-us/library/gg406140.aspx) at the moment, and once again I've gotten annoyed that ```RequestNavigate``` doesn't have a generic overload.

Naturally I had to write it, again:

<pre><code>
public static class RegionManagerExtensions
{
    public void RequestNavigate<TView>(this IRegionManager regionManager, string regionName)
    {
        regionManager.RequestNavigate(regionName, new Uri(typeof(TView), UriKind.Relative).Name));
    }
}
</pre></code>

the ```new Uri(typeof(TView)...)``` works because of the view locator conventions I've implemented.
