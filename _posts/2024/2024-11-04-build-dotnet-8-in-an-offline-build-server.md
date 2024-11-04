---
layout: post
title: build dotnet 8 in an offline build server
tags: [dotnet,build server]
featured_image: /assets/images/build-dotnet-8-in-an-offline-build-server.webp
image: /assets/images/build-dotnet-8-in-an-offline-build-server.webp
featured: False
hidden: False
published: 04/11/2024
ispublished: True
---
In a corporate environment, the build server you have access to, and might even be responsible for, is almost usually 'offline' - which is to say that for annoyingly sensible security reasons, it is not reachable by the outside internet, and it does not have access to the outside internet.

Building dotnet 8 applications in such an environment is fairly straightforward, but does mean that you need to run `dotnet restore` and `dotnet build` separately.

You must configure a package source which is reachable internally, either on a drive, network share or internal feed - as long as it is accessible via a URI.

The source can be configured in a `Nuget.config`, or can be passed by the `--source` option.

Typically, I've been running:

```
dotnet restore --nologo --source <the-source-uri>
```

As we have a single source where we keep all packages. If we had multiple source locations, I would use the `Nuget.confg` option and specify the sources in there.

The build step becomes:

```
dotnet build --no-restore --nologo --configuration Release
```

We make sure to disable the restore on the build, because we've already done it. 

Nice and easy.