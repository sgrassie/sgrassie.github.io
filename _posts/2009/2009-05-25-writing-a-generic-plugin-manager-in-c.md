---
layout: post
title: Writing a generic plugin manager in C#
description: writing-a-generic-plugin-manager-in-c
tags: ['C#','Coding','Plugin Manager']
featured_image: /assets/images/2009-05-25-writing-a-generic-plugin-manager-in-c.png
image: /assets/images/2009-05-25-writing-a-generic-plugin-manager-in-c.png
hidden: False
published: 25/05/2009
ispublished: True
---
<h4>Update:</h4>
I have written another post on this subject with some code examples  here: <a title="More on the generic plugin manager" href="http://temporalcohesion.co.uk/2009/11/02/more-on-the-generic-plugin-manager/" target="_self">http://temporalcohesion.co.uk/2009/11/02/more-on-the-generic-plugin-manager/</a>
<h4>Update 2:</h4>
There is another follow on post here: <a href="http://temporalcohesion.co.uk/2010/03/17/even-more-on-the-generic-plugin-manager/">http://temporalcohesion.co.uk/2010/03/17/even-more-on-the-generic-plugin-manager/</a> where I talk about what I've learned.

One of my current long term hobby project is a  map/world editor that I'm writing for Andy's (work in progress) game engine. It is still in a quite rudimentary stage, however, I have gotten an important aspect of the application into a fairly mature state already, and that is the plugin system.

I don't want to get into too much detail over things that are available via some simple searches on google, so don't expect too much code. There are some good articles <a title="http://msdn.microsoft.com/en-us/library/ms972962.aspx" href="http://" target="_blank">here</a>, <a title="http://www.codeproject.com/KB/macros/PluginsManager.aspx?display=Print" href="http://" target="_blank">here </a>and <a title="http://www.codeproject.com/KB/cs/Plugin_Basics.aspx" href="http://" target="_blank">here</a>, which delve quite deeply into this, and how to develop a plugin framework in general. I developed my plugin framework based on the code in <a title="http://www.amazon.com/2008-NET-Platform-Fourth-Windows-Net/dp/1590598849" href="http://" target="_blank">this book</a>, which incidentally is a very good book.

Also, in my own google searches on this subject, a lot of the articles I found are getting to be four years old, in a few instances even older. Not that this automatically makes them invalid as sources of information, it's just that they may not reflect best practices in modern C#. (Not that I am claiming to be a <a title="http://msmvps.com/blogs/jon_skeet/default.aspx" href="http://" target="_blank">Jon Skeet</a>-like C# guru). Also, quite a few of the ones I found make use of an XML configuration file to hold a reference to the plugins. I'm not a big fan of this type of thing, I much prefer convention over configuration.

<strong>Why Generic?</strong>

I've written a plugin system for the Editor because I want to provide a way to make it easily extendible in the future, without having to change the core application, to enable it to perform actions that are above and beyond it's core capabilities. Byond that basic requirement, there are a couple of other reasons to make it a generic plugin framework.

Firstly, I've made it generic because I wanted to make a distinction between different types of plugins, such as a type of plugin for resources, and a type of plugin which adds functionality into the application (such as tools, UI widgets etc).

Secondly, and perhaps most important (to me, anyway), is that I'll never need to write a C# plugin framework again, for any of my personal projects. I've had a go at writing a plugin framework before, a few times for none-work projects and once for a project at work, and I finally realised what my problem was - reinventing the wheel each time.

The plugin framework I've written ensures that I don't have to worry about this the next time one of my pet projects needs a plugin system. The Editor will in fact have two types of plugins available, one to extend the types of data sources it can load in resources from, and another to provide additional functionality, like tools.

I'm fairly pleased with the way that it has turned out, and it works quite well in practice.
