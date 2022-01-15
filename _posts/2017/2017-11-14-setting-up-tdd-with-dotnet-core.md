---
layout: post
title: Setting up a TDD environment in dotnet core
description: A tutorial on how to setup a TDD environment in dotnet core
tags: []
featured_image: /assets/images/2017-11-14-setting-up-tdd-with-dotnet-core.png
image: /assets/images/2017-11-14-setting-up-tdd-with-dotnet-core.png
hidden: False
published: 14/11/2017
ispublished: True
---
# Introduction
In a future post, I'm going to write about Test Driven Development, with the aim of writing a Freecell clone. In this post I'll walk through setting up a dotnet core solution with a class library which will hold the Freecell rules engine, a class library for our unit tests and show to set up an environment for immediate feedback, which is one of the key benefits of TDD. I'll also demonstrate using some basic git commands to setup our source control.

As you'll notice from the command line output below, I'm doing all this on a Mac, but things should not be any different if you are following along on Linux. Or even Windows.

# dotnet new
We need to new up two projects: one for our rules engine; one for the tests. It is a good idea to keep the unit tests separate from the code under test - in a real world application you _really_ do not want test data to get mixed in with production code.
{% highlight console %}
nostromo:dev stuart$ mkdir freecell
nostromo:dev stuart$ dotnet new classlib -o freecell/Freecell.Engine -n Freecell.Engine
The template "Class library" was created successfully.

Processing post-creation actions...
Running 'dotnet restore' on freecell/Freecell.Engine/Freecell.Engine.csproj...
  Restoring packages for /Users/stuart/dev/freecell/Freecell.Engine/Freecell.Engine.csproj...
  Generating MSBuild file /Users/stuart/dev/freecell/Freecell.Engine/obj/Freecell.Engine.csproj.nuget.g.props.
  Generating MSBuild file /Users/stuart/dev/freecell/Freecell.Engine/obj/Freecell.Engine.csproj.nuget.g.targets.
  Restore completed in 133.35 ms for /Users/stuart/dev/freecell/Freecell.Engine/Freecell.Engine.csproj.


Restore succeeded.
{% endhighlight %}
The command `dotnet new console` instructs the framework to create a new console application. The `-o` option allows an output directory to be specified and the `-n` allows the project name to be specified. If you don't specify these options, the projet will be created in and named after the current folder. You can see more details on the command on [Microsoft's documentation](https://docs.microsoft.com/en-us/dotnet/core/tools/dotnet-new?tabs=netcore2x).

Then create the second project to hold the unit tests. I like to use [xUnit](https://xunit.github.io/), and the dotnet framework team do too. It's pretty telling that the dotnet framework team using xUnit instead of using MSTest - which was exactly the basis of my arguement when I moved a team from MSTest to xUnit last year.
{% highlight console %}
nostromo:dev stuart$ dotnet new xunit -o freecell/Freecell.Engine.Tests -n Freecell.Engine.Tests
The template "xUnit Test Project" was created successfully.

...

Restore succeeded.
{% endhighlight %}

We should also add a reference into our test project to the `Freecell.Engine` project, as it is that which contains the code we want to test.
{% highlight console%}
nostromo:freecell stuart$ cd Freecell.Engine.Tests/
nostromo:Freecell.Engine.Tests stuart$ dotnet add reference ../Freecell.Engine/Freecell.Engine.csproj 
Reference `..\Freecell.Engine\Freecell.Engine.csproj` added to the project.
{% endhighlight %}

With that all done, now is a good time to initialise a git repository to hold the code and make the first commit.
{% highlight console %}
nostromo:dev stuart$ cd freecell/
nostromo:freecell stuart$ git init
Initialized empty Git repository in /Users/stuart/dev/freecell/.git/
nostromo:freecell stuart$ git add --all
nostromo:freecell stuart$ git commit -m "Initial commit"
[master (root-commit) 2cc150c] Initial commit
 12 files changed, 6025 insertions(+)
 create mode 100644 Freecell.Engine.Tests/Freecell.Engine.Tests.csproj
 create mode 100644 Freecell.Engine.Tests/UnitTest1.cs
 create mode 100644 Freecell.Engine.Tests/obj/Freecell.Engine.Tests.csproj.nuget.cache
 create mode 100644 Freecell.Engine.Tests/obj/Freecell.Engine.Tests.csproj.nuget.g.props
 create mode 100644 Freecell.Engine.Tests/obj/Freecell.Engine.Tests.csproj.nuget.g.targets
 create mode 100644 Freecell.Engine.Tests/obj/project.assets.json
 create mode 100644 Freecell.Engine/Class1.cs
 create mode 100644 Freecell.Engine/Freecell.Engine.csproj
 create mode 100644 Freecell.Engine/obj/Freecell.Engine.csproj.nuget.cache
 create mode 100644 Freecell.Engine/obj/Freecell.Engine.csproj.nuget.g.props
 create mode 100644 Freecell.Engine/obj/Freecell.Engine.csproj.nuget.g.targets
 create mode 100644 Freecell.Engine/obj/project.assets.json
nostromo:freecell stuart$ 
{% endhighlight%}

# dotnet new sln
Although it doesn't matter to me as I'm coding this on a Mac using Visual Studio Code, for everyone's convenience, we should add a solution file. This will also help later on when it comes to talking about build scripts and using Continuous Integration, as it's usually easier to target a single solution file for building all the projects.
{% highlight console %}
nostromo:freecell stuart$ dotnet new sln -n Freecell.Engine
The template "Solution File" was created successfully.
nostromo:freecell stuart$ dotnet sln add Freecell.Engine/Freecell.Engine.csproj 
Project `Freecell.Engine/Freecell.Engine.csproj` added to the solution.
nostromo:freecell stuart$ dotnet sln add Freecell.Engine.Tests/Freecell.Engine.Tests.csproj 
Project `Freecell.Engine.Tests/Freecell.Engine.Tests.csproj` added to the solution.
{% endhighlight %}

# dotnet xUnit
I'm going also going to start using the `dotnet xunit` command which is available to us, but this isn't (currently) as straight forward as it perhaps will become. Firstly we need to update the version of `xUnit` which the `dotnet new xunit` command installed into the project, as it's still `2.2.0`, and to use `dotnet xunit` it needs to be the same version. Secondly, there isn't yet a `dotnet-cli` command to update packages. But you can achieve this by adding an already existing package, which if you don't specify a version will update it to the latest version. Why they don't just add a `dotnet update package --all` command beats me.

If version numbers have changed since this post was written/published, don't worry. All you need to do is make sure that the xUnit package and the dotnet xUnit command package are the same verisons. You can't really go wrong as the `dotnet xunit` command will tell you if there is a version mismatch.

{% highlight console %}
nostromo:freecell stuart$ cd Freecell.Engine.Tests/
nostromo:Freecell.Engine.Tests stuart$ dotnet add package xunit
  Writing /var/folders/xc/xshvfj214z18xn0t5y1vzty80000gn/T/tmpr93zFG.tmp
info : Adding PackageReference for package 'xunit' into project '/Users/stuart/dev/freecell/Freecell.Engine.Tests/Freecell.Engine.Tests.csproj'.
log  : Restoring packages for /Users/stuart/dev/freecell/Freecell.Engine.Tests/Freecell.Engine.Tests.csproj...
info :   CACHE https://api.nuget.org/v3-flatcontainer/xunit/index.json
info : Package 'xunit' is compatible with all the specified frameworks in project '/Users/stuart/dev/freecell/Freecell.Engine.Tests/Freecell.Engine.Tests.csproj'.
info : PackageReference for package 'xunit' version '2.3.1' updated in file '/Users/stuart/dev/freecell/Freecell.Engine.Tests/Freecell.Engine.Tests.csproj'.
nostromo:Freecell.Engine.Tests stuart$ 
{% endhighlight %}

With that done, we can now add the `dotnet-xunit` cli command package, and start using it:
{% highlight console%}
nostromo:Freecell.Engine.Tests stuart$ dotnet add package dotnet-xunit
  Writing /var/folders/xc/xshvfj214z18xn0t5y1vzty80000gn/T/tmp6wUvtG.tmp
info : Adding PackageReference for package 'dotnet-xunit' into project '/Users/stuart/dev/freecell/Freecell.Engine.Tests/Freecell.Engine.Tests.csproj'.
log  : Restoring packages for /Users/stuart/dev/freecell/Freecell.Engine.Tests/Freecell.Engine.Tests.csproj...
info :   GET https://api.nuget.org/v3-flatcontainer/dotnet-xunit/index.json
info :   OK https://api.nuget.org/v3-flatcontainer/dotnet-xunit/index.json 639ms
info : Package 'dotnet-xunit' is compatible with all the specified frameworks in project '/Users/stuart/dev/freecell/Freecell.Engine.Tests/Freecell.Engine.Tests.csproj'.
info : PackageReference for package 'dotnet-xunit' version '2.3.1' added to file '/Users/stuart/dev/freecell/Freecell.Engine.Tests/Freecell.Engine.Tests.csproj'.
nostromo:Freecell.Engine.Tests stuart$ dotnet xunit
No executable found matching command "dotnet-xunit"
nostromo:Freecell.Engine.Tests stuart$ 
{% endhighlight%}
Hang on just a minute, the computer is lying to me, I clearly just added the `dotnet-xunit` package, which provides the `dotnet xunit` command. What gives? Well, the gotcha here is that the `.csproj` needs to be updated and told that the `dotnet-xunit` package is a special and unique snowflake. Instead of `PackageReference`, it needs to be `DotNetCliToolReference`. To be fair, this is documented in the [xUnit documentation](https://xunit.github.io/docs/getting-started-dotnet-core#create-project), and I think this is something that in the future will probably be automatic. For the time being we have to to it ourselves. If we now run `dotnet xunit` again:
{% highlight console %}
nostromo:Freecell.Engine.Tests stuart$ dotnet xunit
Detecting target frameworks in Freecell.Engine.Tests.csproj...
Building for framework netcoreapp2.0...
  Freecell.Engine -> /Users/stuart/dev/freecell/Freecell.Engine/bin/Debug/netstandard2.0/Freecell.Engine.dll
  Freecell.Engine.Tests -> /Users/stuart/dev/freecell/Freecell.Engine.Tests/bin/Debug/netcoreapp2.0/Freecell.Engine.Tests.dll
Running .NET Core 2.0.0 tests for framework netcoreapp2.0...
xUnit.net Console Runner (64-bit .NET Core 4.6.00001.0)
  Discovering: Freecell.Engine.Tests
  Discovered:  Freecell.Engine.Tests
  Starting:    Freecell.Engine.Tests
  Finished:    Freecell.Engine.Tests
=== TEST EXECUTION SUMMARY ===
   Freecell.Engine.Tests  Total: 1, Errors: 0, Failed: 0, Skipped: 0, Time: 0.156s
nostromo:Freecell.Engine.Tests stuart$ 
{% endhighlight %}
As you can see, we get much nicer output than if we just used the standard `dotnet test` command. Using this command also has the added benefit of being able to produce xml output which can be consumed by a CI server to show details about the unit tests, but that isn't somethin that I'm going to get into just yet.

I'm also going to update the xUnit Visual Studio runner now as well, as it is required to make VS Code debug our tests, which will come in handy later on. Executing `dotnet add package xunit.runner.visualstudio` does this for us.

# dotnet watch
I am a big fan of [NCrunch](http://www.ncrunch.net), and the rapid and immediate feedback which it provides when coding in Visual Studio. Sadly, it's not available for Visual Studio Code, or indeed for macOS, so in order to replicate the functionality it provides, we can make a few tweaks to our test project and watch our code for changes which are then automatically compiled and the tests ran.  In order to get the _NCrunch_-like functionality, we need to add the `dotnet watch` cli command. This is fairly straightforward.
{% highlight console %}
nostromo:Freecell.Engine.Tests stuart$ dotnet add package Microsoft.DotNet.Watcher.Tools
  Writing /var/folders/xc/xshvfj214z18xn0t5y1vzty80000gn/T/tmpFpRFyo.tmp
info : Adding PackageReference for package 'Microsoft.DotNet.Watcher.Tools' into project '/Users/stuart/dev/freecell/Freecell.Engine.Tests/Freecell.Engine.Tests.csproj'.
log  : Restoring packages for /Users/stuart/dev/freecell/Freecell.Engine.Tests/Freecell.Engine.Tests.csproj...
info :   GET https://api.nuget.org/v3-flatcontainer/microsoft.dotnet.watcher.tools/index.json
info :   OK https://api.nuget.org/v3-flatcontainer/microsoft.dotnet.watcher.tools/index.json 1418ms
info : Package 'Microsoft.DotNet.Watcher.Tools' is compatible with all the specified frameworks in project '/Users/stuart/dev/freecell/Freecell.Engine.Tests/Freecell.Engine.Tests.csproj'.
info : PackageReference for package 'Microsoft.DotNet.Watcher.Tools' version '2.0.0' added to file '/Users/stuart/dev/freecell/Freecell.Engine.Tests/Freecell.Engine.Tests.csproj'.
nostromo:Freecell.Engine.Tests stuart$ dotnet watch xunit
Version for package `Microsoft.DotNet.Watcher.Tools` could not be resolved.
nostromo:Freecell.Engine.Tests stuart$ dotnet restore
  Restoring packages for /Users/stuart/dev/freecell/Freecell.Engine.Tests/Freecell.Engine.Tests.csproj...
  Restoring packages for /Users/stuart/dev/freecell/Freecell.Engine.Tests/Freecell.Engine.Tests.csproj...
  Restore completed in 13.12 ms for /Users/stuart/dev/freecell/Freecell.Engine/Freecell.Engine.csproj.
  Restore completed in 26.52 ms for /Users/stuart/dev/freecell/Freecell.Engine.Tests/Freecell.Engine.Tests.csproj.
  Restore completed in 148.11 ms for /Users/stuart/dev/freecell/Freecell.Engine.Tests/Freecell.Engine.Tests.csproj.
  Restore completed in 393.99 ms for /Users/stuart/dev/freecell/Freecell.Engine.Tests/Freecell.Engine.Tests.csproj.
{% endhighlight %}
Make sure you remember to make the same edit to the `.csproj` file again so that `dotnet` understands that this is a CLI command. This is kind of [opposite to the way Hansleman showed it](https://www.hanselman.com/blog/CommandLineUsingDotnetWatchTestForContinuousTestingWithNETCore10AndXUnitnet.aspx), but it achieves the same end goal.

Now we can watch our unit test code for changes:
{% highlight console %}
nostromo:Freecell.Engine.Tests stuart$ dotnet watch xunit
watch : Started
Detecting target frameworks in Freecell.Engine.Tests.csproj...
Building for framework netcoreapp2.0...
  Freecell.Engine -> /Users/stuart/dev/freecell/Freecell.Engine/bin/Debug/netstandard2.0/Freecell.Engine.dll
  Freecell.Engine.Tests -> /Users/stuart/dev/freecell/Freecell.Engine.Tests/bin/Debug/netcoreapp2.0/Freecell.Engine.Tests.dll
Running .NET Core 2.0.0 tests for framework netcoreapp2.0...
xUnit.net Console Runner (64-bit .NET Core 4.6.00001.0)
  Discovering: Freecell.Engine.Tests
  Discovered:  Freecell.Engine.Tests
  Starting:    Freecell.Engine.Tests
  Finished:    Freecell.Engine.Tests
=== TEST EXECUTION SUMMARY ===
   Freecell.Engine.Tests  Total: 1, Errors: 0, Failed: 0, Skipped: 0, Time: 0.147s
watch : Exited
watch : Waiting for a file to change before restarting dotnet...
{% endhighlight %}

# Conclusion
In this post I have walked through setting up a class library and unit test library using dotnet core, how to create a solution file and add the projects to it and how an immediate feedback cycle for TDD can be setup in a fairly easy and straightforward manner. I also demonstrated some basic git usage and initialised a repository for the code.
