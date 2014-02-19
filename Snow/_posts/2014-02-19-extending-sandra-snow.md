---
title: Extending Sandra.Snow
published: 19/02/2014
layout: post
category: snow
metadatadescription: extending sandra snow
---
After switching my blog over to use [Sandra.Snow](https://github.com/Sandra/Sandra.Snow), I noticed that in at least one feed aggregator that my blog shows up in, it wasn't displaying correct. The escaped html in the feed generator from the markdown by Snow wasn't getting rendered in the aggregator correctly. After a little digging it was apparant to me that the ```RssResponse``` in Snow was not correctly setting it's content type.

I could have left it there, or submitted a small patch to fix the issue (I still will), but I noticed that the feed it generates isn't a pure atom feed, so I basically copied the relevant classes (changing 'rss' to 'atom') in the class names, and did a little configuration, and swapped over the feed to use atom.

Even though I know that the atom feed validates, this post is in part a test to see what happens...
