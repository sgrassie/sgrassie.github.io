---
title: How I moved my blog from wordpress to snow, part one
published: draft
layout: post
category: blog, sandra.snow
series:
    name: 201402001
    current: 1
    part: How I moved my blog from wordpress to snow, part one
    part: How I moved my blog from wordpress to snow, part two
    part: How I moved my blog from wordpress to snow, part three
metadescription: How I moved by blog from wordpress to snow, part one
---

Wherein I show you how I moved my blog from Wordpress, to a statically generated html hosted on github. I will assume that you have a wordpress blog, hosted on either Wordpress.com or your own hosting. If you don't have a wordpress based blog, then that's ok, most of this will still apply.

We can identify a pretty broad set of tasks straightaway:

1. Export posts from wordpress into markdown.
2. Configure Sandra.Snow to publish our markdown.
3. Make it look nice.
4. Setup github to publish our new site.
5. Update our DNS settings.

## Liberating content from Wordpress
<img src="../../../../../images/wordpress-export.png" alt="Export wordpress content" class="pull-left" style="padding: 5px;">
Jekyll has some tooling that enables auto-exporting of your blog and its contents into markdown for you, but as it is still (relativly) early days for Sandra.Snow, there is no such tooling for us to leverage.

Wordpress makes it fairly easy to export your blog posts, pages, comments and some other meta-information, packaging everything up into a single XML file, that depending on the number of blog post and other content you have, can be fairly large.

When you click export, you'll be able to download the XML file containing your content. Now we just have to pull out what we want.

## wp2md
I looked around for something that would do the conversion of my wordpress content into markdown, but I couldn't find one that I liked, or that worked exactly the way that I wanted it to. So naturally, [I wrote my own](https://github.com/sgrassie/wp2md.net).

The export file format isn't documented anywhere that I could find online, there were a few bits and pieces here and there on blogs and on some forums, but, honestly, it's just an xml file, it's not all that difficult. The only thing that may trip you up is the number of xml namespaces it uses, although if like me you've had a job maintaining software which manages complex xml, then it's no big deal.

I found it has a root ```<rss>``` element, followed by ```<channel>``` and then ```<item>``` where an item is a post, comment or even a page. An item is then broken down into further child elements which include things like the title of the post (or page, or comment), the url, publication date, actual content of the post, and various other pieces of meta data about the post. For example:

<pre><code>
<item>
				<title>Definitely given up on my github-csharp-api project</title>
		<link>http://temporalcohesion.co.uk/2013/11/07/definitely-given-up-on-my-github-csharp-api-project/</link>
		<pubDate>Thu, 07 Nov 2013 21:08:19 +0000</pubDate>
		<dc:creator><![CDATA[stuart]]></dc:creator>
		<guid isPermaLink="false">http://temporalcohesion.co.uk/?p=394</guid>
		<description></description>
		<content:encoded><![CDATA[Not that I'd spent much time working on it lately. The fine folks at github have released Ocktokit.net, a C# library for accessing the github api. It's an official api - it renders my crappy project useless, so I'm putting it down completely.

I will not work on it anymore.]]></content:encoded>
		<excerpt:encoded><![CDATA[]]></excerpt:encoded>
		<wp:post_id>394</wp:post_id>
		<wp:post_date>2013-11-07 21:08:19</wp:post_date>
		<wp:post_date_gmt>2013-11-07 21:08:19</wp:post_date_gmt>
		......
</code></pre>


