---
layout: post
title: source control systems
tags: [Coding]
hidden: False
published: 20/08/2007
ispublished: True
---
The other day, I watched the Linus Torvalds <a href="http://www.youtube.com/watch?v=4XpnKHJAok8" title="Linus Torvald's tech talk on git" target="_blank">tech talk</a> at google, which he gave on source control systems. It was mostly (biased) about how great <a href="http://git.or.cz/" target="_blank">git</a> is, and how other source control systems, with a few exceptions, have mostly got it wrong. This all got me thinking about source control systems I have used.

Now, I use Microsoft's <a href="http://msdn2.microsoft.com/en-us/vstudio/aa718670.aspx" target="_blank">Visual Sourcesafe</a> every day at work, and let me tell you: it's shit. The only (slightly) good thing about it, is the integration with VS.Net 2005, which is unsurprisingly very good. I know that I'm not really offering much of an argument as to exactly why VSS is a horrible pile of dog turd, but anyone whose ever used will understand.

Anyway. I digress.

I never really thought that the creator of Linux would be such an engaging and humorous speaker - aren't stereotypes fun - but he was. It kind of got me thinking about source control. I've used CVS and SVN before on a few open source projects I've contributed to, or just wanted to get the latest source for.

I've mostly only ever used CVS or SVN, arguably the two most popular version control systems currently in use today. Better than VSS in every way, but still lacking quite a lot. For instance it's a well known fact that merges in CVS are a horrible nightmare, and that merges in SVN aren't much better. Thankfully I've never had to do them. And I know enough about VSS to know that merges are just generally avoided. Like you'd try to avoid an STI.

So, over the weekend (you'll notice how much of my free time is "over the weekend") I decided to have a little play with with some distributed version control systems. Now, I'm not going to go on about what one of those is, nor how great they are, as you can use google for that. But suffice to say that they are fucking ace.

I had to discount Git pretty much straight away - for various reasons (development being primary) I've installed Winxp back onto my laptop, and I'm playing with Windows Server 2003 R2 on my dev server, so I road tested Mercurial and Bazaar-ng. I spent a great deal of time researching the two systems, and ultimately decided to go with bazaar.  I've not really got down to much development with bazaar yet, but early results look promising.

After about 10 minutes fannying around, I had Bazaar installed, and a shared repository set-up on my dev server, which I checked out and branched a few times on my laptop (3 branches: dev, testing and stable). With bazaar I can make as many dev branches as I like, for each crazy idea I have, and easily merge them upstream as they become awesomely realised ideas, or deleted and forgotten about like a red-headed step-child.

This is all on my laptop, and I can easily push my working code onto my desktop if I want to code on there, or back onto my server for safe keeping, or publish it on a website. Or any combination of those. I'll post some more about Bazaar after I've been using it for a while.
