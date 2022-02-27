---
layout: post
title: 'Offline VS Build Tools still tries to download?'
description: 
tags: ['Build Tools']
featured_image: /assets/images/2021-04-01-offline-vs-build-tools-still-tries-to-download.webp
image: /assets/images/2021-04-01-offline-vs-build-tools-still-tries-to-download.webp
featured: False
hidden: False
published: 01/04/2021
ispublished: True
---
I'm leaving this here so I can find it again easily.

We had a problem updating the Visual Studio 2019 Build Tools on a server, after updating an already existing offline layout.

I won't go into that here, because it's covered extensively on Microsoft's Documentation website.

The installation kept failing, even when using `--noweb`. It turns out that when your server is completely cut off from the internet, as was the case here, you also need to pass `--noUpdateInstaller`.

This is because (so it would seem) that even though `--noweb` correctly tells the installer to use the offline cache, it doesn't prevent the installer from trying to update itself, which will obviously fail in a totally disconnected environment.