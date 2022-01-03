---
layout: post
title: Even more on the generic plugin manager
description: even-more-on-the-generic-plugin-manager
tags: ['C#','Coding','DI','IoC','Plugin Manager']
hidden: False
published: 17/03/2010
ispublished: True
---
I've <a title="Writing a generic plugin manager in C# @ Temporal Cohesion" href="http://temporalcohesion.co.uk/2009/05/25/writing-a-generic-plugin-manager-in-c/" target="_self">written </a><a title="More on the generic plugin manager" href="http://temporalcohesion.co.uk/2009/11/02/more-on-the-generic-plugin-manager/" target="_self">previously</a> about writing your own generic plugin manager/framework.

I believe that this is a worthwhile exercise for the beginning programmer, because it firstly teaches you a lot about reflection, and secondly teaches you the advantages that proper use of interfaces can bring to your code. Thirdly it can also teach you to think about how your API might be used by someone else when they write a plugin for your program. In short I think it's a great exercise.

While writing and using my own plugin framework has been a great learning experience for me, I've found that I have outgrown it's usefulness to me. What made me see this was when I started to think about and begin implementing a way for me to use the framework as a <a title="Dependency Injection on Wikipedia" href="http://en.wikipedia.org/wiki/Dependency_injection" target="_blank">IoC/Dependency Injection</a> tool. This led me off on some Googling and I found <a title="Funq DI container on Codeplex" href="http://funq.codeplex.com/" target="_blank">Funq</a>, and the the <a href="http://www.clariusconsulting.net/blogs/kzu/archive/2009/02/02/116399.aspx" target="_blank">associated screencasts by Cazzulino</a>.

This got me to thinking about <a title="Don't Repeat Yourself on Wikipedia" href="http://en.wikipedia.org/wiki/Don%27t_repeat_yourself" target="_blank">DRY</a>. Don't Repeat Yourself can just as easily mean Don't Repeat Work Other People Have Already Done (If You Don't Have To), but DRWOPHADIYDHT doesn't sound/look nice as an acronym. Perhaps a better way to express that sentiment is "lazyDRY", or "The re-use of prexisting libraries and code can save you a lot of time, and which effort you can put into your application at a higher level."

Or in other words, it is foolish to ignore the work that other people have done, unless you have a compelling reason to do so. If you really want to write your own IoC/DI container, then great, knock yourself out. No one is going to stop you.

I'm lazy though. Nanos gigantium humeris insidentes.

Depending on the blogs in your feed reader, or who you follow on Twitter, or just in general googling, you will probably come across references to the same group of IoC/DI containers. Chiefly:
<ul>
	<li><a title="StructureMap on Github" href="http://structuremap.github.com/structuremap/index.html" target="_blank">StructureMap</a></li>
	<li><a title="Castle Windsor" href="http://www.castleproject.org/" target="_blank">Castle Windsor</a></li>
	<li><a title="AutoFac on Google code" href="http://code.google.com/p/autofac/" target="_blank">AutoFac</a></li>
	<li><a title="Ninject" href="http://ninject.org/" target="_blank">Ninject</a></li>
	<li><a href="http://www.codeplex.com/MEF/" target="_blank">MEF</a></li>
	<li><a href="http://msdn.com/unity">Unity</a></li>
	<li><a href="http://www.springframework.net/">Spring.net</a></li>
</ul>
There are others, but it would seem hardly anyone uses them. Of those above, I have so far only used StructureMap and Ninject, and have really liked using both of them. I will try out the others at some point, but so far I've liked what I've seen in StructureMap and Ninject, I honestly don't think that any of the others will have anything better to offer me. Besides which, StructureMap has a built in method of using it as a plugin framework. Win.
<h2>In Conclusion</h2>
What can I draw from all this? I don't think that I wasted any of my time or effort in writing my own plugin framework. It was a worthwhile exercise which taught me a lot of things, and I urge you to do the same.
