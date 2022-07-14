---
layout: post
title: Automating jekyll with dotnet
tags: [blog,jekyll,c#,markdown]
featured_image: /assets/images/2022-03-04-Automating-jekyll-with-dotnet.webp
image: /assets/images/2022-03-04-Automating-jekyll-with-dotnet.webp
featured: False
hidden: False
published: 04/03/2022
ispublished: True
---
Recently I was inspired by [@buhakmeh](https://twitter.com/buhakmeh)'s blog post, [Supercharge Blogging With .NET and Ruby Frankenblog](https://khalidabuhakmeh.com/supercharge-blogging-with-frankenblog) to write something similar, both as an exercise and excuse to blog about _something_, and as a way of tidying up the metadata on my existing blog posts and adding header images to old posts.

## High level requirements
The initial high level requirements I want to support are:

1. Cross-platform. This blog is jekyll based, and as such is written in markdown. Any tool I write for automation purposes should be cross-platform.
2. Easily add posts from the command line, and have some default/initial yaml header metadata automatically added.
3. See a high level overview of the current status of my blog. This should include things like the most recent post, how many days I've been lazy and not published a post, available drafts etc
4. Publish posts from the command line, which should update the post with published status and add the published date to the yaml header and filename.
5. Create a customised post header for each post on the blog, containing some kind of blog branding template and the post title, and update or add the appropriate yaml header metadata to each post. This idea also comes from another [@buhakmeh's post](https://khalidabuhakmeh.com/youtube-thumbnails-imagesharp-dotnet-core).
6. The blog has many years of blog posts, spread across several different blogging platforms before settling on Jekyll. As such, some of the yaml metadata for each blog post is... not consistent. Some effort should go into correcting this.
7. Automaticlly notify Twitter of published posts.

## Next steps
The next series of posts will cover implementing the above requirements... not necessarily in that order. First I will go over setting up the project and configuring Oakton.

After that I will probably cover implementing fixes to the existing blog metadata, as I think that is going to be something that will be required in order for any sort of Info function to work properly, as all of the yaml metadata will need to be consistent.

Then I think I'll tackle the image stuff, which should be fairly interesting, and should give a nice look to the existing posts, as having prominent images for posts is part of the theme for the blog, which I've not really taken full advantage of.

I'll try to update this post with links to future posts, or else make it all a big series.

{% highlight console %}
dotnet new console --name BlogHelper9000
{% endhighlight %}