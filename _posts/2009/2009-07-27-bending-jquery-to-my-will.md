---
layout: post
title: Bending jQuery to my will
description: bending-jquery-to-my-will
tags: ['Coding','Jquery']
featured_image: 
hidden: False
published: 27/07/2009
ispublished: True
---
Like many people, I have a vanity domain name, www.stuart-grassie.co.uk. Many moons ago I used to host my blog on there, but for a variety of reasons I bought this domain and switched my blog here. So I put up a basic index page, listing a few interesting factoids about me, and what I do. When I say a "basic" page, I mean basic - black text on a white background, almost as if it was just few words typed into a text file - although there was semantically correct and valid xhtml behind it.

The other day I came across a link,<a title="30 Examples of Extreme Minimalism in web design" href="http://singlefunction.com/30-examples-of-extreme-minimalism-in-web-design/" target="_blank"> 30 Examples of Extreme Minimalism in web design</a> and it inspired me to do a small make-over on my vanity domain name site. Which I think has turned out fairly ok. Athough that isn't the point of this blog post.

As there is not a massive amount of information (after all it's just a "here I am, here's some information about me, here's how you can contact me" site, all of it is on one page. I'm using jQuery to hide everything, until the user clicks a link to see the information they want. I used jQuery UI, to use a couple of basic slide in/out effects. The actual effects are "clip" and "blind", using "toggle" to turn them on/off. All the other content apart from the "frontpage" is hidden.

Initially, I had it working so that you could click a link, and the requested "page" would transition into view, the "frontpage" would transition out of view, then I had a &lt;span&gt;&lt;back&lt;/span&gt;, which I made react to mouse clicks, using jQuery, and you could then click back to the "frontpage".
<pre lang="html">
<div id="main">
Maybe you would like to read this <a id="examplelink" href="#example">example</a> page.</div>
<div id="example">

This is some example content.</div></pre>
<pre lang="javascript">$(document).ready(function(){
    $("#example").hide(); // Hide the example on page load
});

// detect when the link is clicked, and toggle the two<div>'s
$(function() {
    $("#examplelink").click(function() {
	$("#example").toggle("clip", {}, 500);
        $("#main").toggle("blind", {}, 500);
	return false;
    });
});</pre>
In my excitement to get this learned and done (I've never used jQuery before), I've lost the original code, but that's essentially what I had, without the code to detect when the fake back button <span>back</span> is clicked - all it did was to run the toggle again, which returned the user to the "frontpage". I had to to do it this way, because the browser forward/back doesn't work.

Clearly, this is not an ideal situation, because it has broken one of the cardinal web design guidelines, by breaking the users browser, by rendering the forward/back buttons inoperable.

I'll show you what I did next time.
