---
layout: post
title: Adding logging to an application
description: 
tags: ['C#','Coding','Log4net','Logging']
featured_image: 
hidden: False
published: 25/07/2009
ispublished: True
---
Nearly every application I have ever used has produced some sort of log output, usually to record details of exactly what the application was doing when an error was encountered. To be perfectly truthful, it is not something that I have ever really given very much consideration to in either my own or work applications, there have always been more pressing things to attend to, such as meeting (unrealistic) deadlines, or implementing some interesting new feature. I've used log4j before in a work application, mostly because someone else had already done all the configuration.

However, the application that is currently occupying the main focus of my attention at work had (almost) no logging in it what-s0-ever, but given the nature of the application, it can be very difficult to debug exactly what is happening internally using breakpoints. Again, the nature of the application doesn't really lend itself well to showing MessageBox's all the over the place.
<pre lang="csharp">MessageBox.Show("Log message");

// or..

Console.WriteLine("Log message");</pre>
How many times have you done that, or the equivalent, in an application? If you are like me, then you'll have done it hundreds of times, probably in the same application. It's really quick and easy to do, and can be very useful. You just have to remember to take it out of the Release build. What a pain.

<strong>A better way</strong>

Using a proper logging library (as I have now discovered) allows you much greater freedom. Freedom to not have to (overly) worry about leaving in <em>Log.Debug("Some message")</em> all over the code. Freedom to be able to configure what is logged, where it is logged to and how it is displayed. Freedom to receive concrete data on how your application is behaving in the real world, which will enable you to find and fix bugs faster than you would have thought possible.

There are a multitude of logging libraries available:
<ul>
	<li>Write your own</li>
	<li>System.Diagnostics.Trace and System.Diagnostics.Debug</li>
	<li>The Logging Application block from the <a title="Microsoft Enterprise Library" href="http://www.codeplex.com/entlib" target="_self">Enterprise Library</a></li>
	<li>Bitfactory.Logging from <a title="Bitfactory.Logging from theobjectguy" href="http://www.theobjectguy.com/dotnetlog/" target="_blank">http://www.theobjectguy.com/dotnetlog/</a></li>
	<li><a title="NLog C# logging library" href="http://csharp-source.net/open-source/logging/nlog" target="_blank">NLog</a></li>
	<li> Plus many more that you can find via google or on Stack Overflow.</li>
</ul>
Now, while it would probably be an interesting exercise to write a small logging library, the world doesn't need another one, so I immediately discounted that option.

I've used System.Diagnostics here and there, and an ex-colleague wrote a small logging library based around using Trace and Debug, but that is getting dangerously close to writing your own logging library, so again that's out.

The Logging application block from the Enterprise Library just seems too weighty, and too much of a pain to configure (I can probably be proved wrong though), so I discounted that as well.

The object guy's logging library seems pretty good, but the documentation and examples kind of suck, and it doesn't look like it's been updated in a while, so after playing with it a little bit (and not really liking it all that much to be perfectly honest), I discounted that as well, although it does seem to have a lot of fans on Stack Overflow.

NLog has plenty of documentation, and seems pretty straightforward to use, and it too has a lot of fans on Stack Overflow, but again, it's not been updated in a while, so I discounted that too.

<strong>Log4Net to the rescue</strong>

Log4Net is part of the <a title="Apache Logging Services" href="http://logging.apache.org/" target="_self">Apache Logging Services</a> project, along with Log4j, and Log4Cxx. It is a C# port of Log4j, and works amazingly well. I am not going to write about how to set it up and configure it, as <a title="log4net info on beefycode.com" href="http://www.beefycode.com/category/log4net.aspx">others have done that already</a>, and the documentation is excellent.

I've read here and there on some blogs, a few message boards and some email lists, that log4net is difficult and time consuming to set-up, and that it is hard to use. Which is nonsense, because after ten minutes (which included downloading the latest version) I had my first small test application up and running and outputting debug messages to the Output window in Visual Studio. Pretty swish indeed.  I did spend some time reading about the best ways to use log4net, and I still do, but I didn't find the initial set-up to be inordinately difficult at all.

On the whole, I am impressed with it's ease of use, I'm now starting to use it in my own personal projects, and it is proving to be invaluable at work.
