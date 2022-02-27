---
layout: post
title: Unit Testing Events
description: 
tags: ['C#','Coding']
featured_image: /assets/images/2010-07-21-unit-testing-events.webp
image: /assets/images/2010-07-21-unit-testing-events.webp
hidden: False
published: 21/07/2010
ispublished: True
---
Recently I have had to unit test some events in an application I work on. I came up with a workable solution, but I didnt really like the way it was working, and it just looked ugly. So I did a little digging on Google, and <a href="http://stackoverflow.com/questions/248989/unit-testing-that-an-event-is-raised-in-c">found this helpful question on StackOverflow</a>.

Here is my take it. Im putting it here so I can find easily find it again. Basically its the same, but Im using a lambda to create my anonymous delegate:
<pre class="brush: csharp">[Test]
public void UnitTestNodeChanged()
{
 var receivedEvents = new List&lt;XmlNodeChangedEventArgs&gt;();
 var document = new XmlDocument();

 document.NodeChanged += ((sender, e) =&gt; receivedEvents.Add(e));
 document.Load("C:file.xml");

 Assert.That(receivedEvents.Count, Is.EqualTo(1));
}</pre>
Nice and short, and to the point. We can test the fact that the event was raised (or not); how many times the event was raised; and, we can test the event arguments.

I like it. Some people may not, but it suits my purposes.
