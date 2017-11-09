---
layout: post
title: "Test Driven Development: Implementing Freecell - part 2"
description: Developing a Freecell rules engine, using Test Driven Development in csharp - part 2
---
# Introduction
In the previous post in this series, we had finished up with a very basic unit test, which didn't really test anything, which we had ran using `dotnet test` in console, and saw some lovely output.

We'll continue to write some more unit tests to try and understand what kind of API we need in a class (or classes) which can help us satisfy the first rule of our Freecell engine implementation. As a reminder, our first rule is: _There is one standard deck of cards, shuffled_.

# Shuffling cards
To keep Uncle Bob happy, we obey [the 3 Laws of TDD](http://butunclebob.com/ArticleS.UncleBob.TheThreeRulesOfTdd), but that doesn't mean that we can't doodle a design and some notes on a whiteboard or a notebook about the way our API could look. I always find that having some idea of where you want to go and what you want to achieve aids the TDD process, because then the unit tests should kick in and you'll get a feel for whether things are going well or the conceptual design you had in mind is rubbish and your imposter syndrome kicks in big time.

## Continual feedback
I am a big fan of [NCrunch](http://www.ncrunch.net), and the rapid and immediate feedback which it provides when coding in Visual Studio. Sadly, it's not available for macOS, so in order to replicate the functionality it provides, we can make a few tweaks to our test project and watch our code for changes which are then automatically compiled and the tests ran. I'm going to also take this opportunity to start using the `dotnet xunit` command which is available to us, but that isn't (currently) as straight forward as it perhaps will become.

Firstly, there isn't yet a `dotnet-cli` command to update packages. But you achieve this by adding an already existing package, which if you don't specify a version will update it to the latest version. Why they don't just add a `dotnet update package --all` command beats me.

{% highlight bash %}
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
{% highlight bash%}
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
Hang on just a minute, the computer is lying to me, I clearly just added the `dotnet-xunit` package, which provides the `dotnet xunit` command. What gives? Well, the gotcha here is that the `.csproj` needs to be updated and told that the `dotnet-xunit` package is a special and unique snowflake. To be fair, this is documented in the [xUnit documentation](https://xunit.github.io/docs/getting-started-dotnet-core#create-project), and I think this is something that in the future will probably be automatic. For the time being we have to to it ourselves. If we now run `dotnet xunit` again:
{% highlight bash %}
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
I'm also going to get rid of the xUnit Visual Studio runner now as well, as it is somthing the `dotnet new xunit` template installed for us, but it's just noise to me, and I personally don't use the test runner in VS anyway. Executing `dotnet remove package xunit.runner.visualstudio` does this for us.

In order to get the _NCrunch_-like functionality, we need to add the `dotnet watch` cli command. This is fairly straightforward.
{% highlight bash %}
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
Make sure you remember to make the same edit to the `.csproj` file again so that `dotnet` understands that this is a CLI command. This is kind of the [opposite to the way Hansleman showed it](https://www.hanselman.com/blog/CommandLineUsingDotnetWatchTestForContinuousTestingWithNETCore10AndXUnitnet.aspx), but it achieves the same end goal.

Now we can watch our unit test code for changes:
{% highlight bash %}
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
