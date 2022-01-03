---
layout: post
title: Moved blog to snow and github
description: Moved blog to snow and github
tags: ['blog','nancy','sandra.snow']
hidden: False
published: 08/02/2014
ispublished: True
---
# No longed bound to wordpress
For most of the time I've been blogging, I've used Wordpress. It's very good software, but kind of requires
somewhere to host it. Either on your own custom hosting, or wordpress.com. For a long time, I paid for my own
hosting provider. But the times they are a changing, and I'm no longer prepared to pay for my own hosting.

## Enter snow
Github provide a way of hosting a website, for free, it's called Github Pages. Using a tool called Jekyll, it is
possible to take a series of Markdown files and generate a static html website from them. The only drawback to Jekyll
is that that it's written in Ruby, it can be a pain to configure on Windows, and I'm primarily a windows kind of guy. 

It's also true that the vast majority of guides/tutorials out there for running a blog with Jekyll assume that you'll
be doing it on either a Mac or a Linux machine. I work entirely on Windows, and there is no way I'm going to try to
configure Ruby on all the machines I use (or might use).

[Sandra.Snow](https://github.com/Sandra/Sandra.Snow) is written in C#, and uses [Nancyfx](https://github.com/nancyFx/Nancy) to process the markdown into static html, exactly like Jekyll. I'm
not sure about the name myself, but there you go.

Over the next few posts I'll go over how I switched my blog from a hosted Wordpress to a staticly generated site using Snow.
