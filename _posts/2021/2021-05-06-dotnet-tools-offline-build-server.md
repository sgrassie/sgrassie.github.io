---
layout: post
title: dotnet tools on an offline build server
description: A brief guide for running builds with dotnet tools on an offline build server
tags: ['Dotnet','Devops']
featured_image: /assets/images/2021-05-06-dotnet-tools-offline-build-server.webp
image: /assets/images/2021-05-06-dotnet-tools-offline-build-server.webp
featured: False
hidden: False
published: 06/05/2021
ispublished: True
---
If you found this because you have a build server which is 'offline', without any external internet access because of _reasons_, and you can't get your build to work because dotnet fails to restore the tool you require for your build process because of said lack of external internet access, then this is for you.

>In hindsight, this may be obvious for most people, but it wasn't for me, so here it is.

In this situation, you just need to shy away from local tools completely, because as of yet, I've been unable to find anyway of telling dotnet not to try to restore them, and they fail every build.

Instead, I've installed the tool(s) as a global tool, in a specific folder, e.g. `C:\dotnet-tools`, which I've then added to the system path on the server. You may need to restart the build server for it to pick up the changes to the environment variable.

One challenge that remains is how to ensure the dotnet tools are consistent on both the developer machine, and the build server. I leave that as an exercise for the reader.