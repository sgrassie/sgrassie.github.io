---
layout: post
title: 'Offline NuGet restore with Cake and TeamCity'
description: 
tags: [Cake,Teamcity,Devops]
featured_image: /assets/images/2020-07-13-offline-nuget-restore-with-cake-and-teamcity.png
image: /assets/images/2020-07-13-offline-nuget-restore-with-cake-and-teamcity.png
featured_image_thumbnail: 
featured: False
hidden: False
published: 13/07/2020
ispublished: True
---
I've been upgrading part of our build infrastructure to handle the ongoing upgrade to .net core, and as part of that, I've had to update the Cake build script to handle doing the restore in an offline environment, on the build server.

There is a great [post on the Octopus blog](https://octopus.com/blog/cake-build-scripts) about writing a Cake build script for .net core, I encourage you to check that out, I'm not going to repeat too much of that.

My specific requirement is that the `DotNetCoreRestore' needs to succeed on an 'offline' build server, that is, a build server that has no access to the internet.

In order for this to succeed, you are going to need provide a way for NuGet to get the packages, usually this is done by maintaining an offline NuGet cache which you can point NuGet at, or even checking the packages into the repository. I'd always recommend going with the first option, although there are scenarios were the second option might be required.

However you do it, you need to tell NuGet where they are. The easiest thing to do is to use a `NuGet.Config` local to the `.sln`, but it is possible to code a location into the script.

Here is the restore task:

{% highlight csharp %}
Task("Restore")
    .IsDependentOn("Clean")
    .Does(() =>
    {
        var settings = new DotNetCoreRestoreSettings();

        if(BuildSystem.IsRunningOnTeamCity)
        {
            settings.PackagesDirectory = "./packages";
            settings.IgnoreFailedSources = true
            //optionally
            //settings.Sources = new[] { "http://someinternalfeed/nuget" }
        }

        foreach(var project in projects)
        {
            DotNetCoreRestore(project.FullPath, settings);
        }
    });
{% endhighlight %}

This project uses a `NuGet.config` to add the paths of internal package sources, and sets the location of the packages folder to be local to the `.sln` - we've found this cuts down on conflicts on developer machines.