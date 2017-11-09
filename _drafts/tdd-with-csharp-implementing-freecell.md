---
layout: post
title: "Test Driven Development: Implementing Freecell"
description: Developing a Freecell rules engine, using Test Driven Development in csharp
---
# Introduction
I thought Freecell would make a fine basis for talking about Test Driven Development. It is a game which I enjoy playing. I have an app for it on my phone, and it's been available on Windows for as long as I can remember, although I'm writing this on a Mac, which does not by default have a Freecell game.

The rules are fairly simple:

- The is one standard deck of cards, shuffled.
- There are four "Free" _Cell_ piles, which may each have any one card stored in it.
- There are four _Foundation_ piles, one for each suit.
- The cards are dealt face-up left-to-right into eight _cascades_
    - The cards must alternate in colour.
    - The result of the deal is that the first four _cascades_ will have seven cards, the final four will have six cards.
- The top most card of a _cascade_ beings a _tableau_.
- A _tableaux_ must be built down by alternating colours.
- A card in _cell_ may be moved onto a _tableau_ subject to the previous rule.
- A _tableaux_ may be recursively moved onto another _tableaux_, or to an empty _cascade_ only if there is enough free space in _Cells_ or empty _cascades_ to use as intermediate locations.
- The game is won when all four _Foundation_ piles are built up in suit, Ace to King.

These rules will form the basis of a Frecell Rules Engine. Note that we're not interested in a UI at the moment.

# Our first test
Before we can write our first test, we need to set the project up. I'm writing this on a Mac, but thanks to the wonder of modern C#, things should work just the same on Linux, or even Windows.

We need to new up two projects, one for our rules engine, and one for the tests.
{% highlight bash %}
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

nostromo:dev stuart$ dotnet new xunit -o freecell/Freecell.Engine.Tests -n Freecell.Engine.Tests
The template "xUnit Test Project" was created successfully.

Processing post-creation actions...
Running 'dotnet restore' on freecell/Freecell.Engine.Tests/Freecell.Engine.Tests.csproj...
  Restoring packages for /Users/stuart/dev/freecell/Freecell.Engine.Tests/Freecell.Engine.Tests.csproj...
  Generating MSBuild file /Users/stuart/dev/freecell/Freecell.Engine.Tests/obj/Freecell.Engine.Tests.csproj.nuget.g.props.
  Generating MSBuild file /Users/stuart/dev/freecell/Freecell.Engine.Tests/obj/Freecell.Engine.Tests.csproj.nuget.g.targets.
  Restore completed in 1.43 sec for /Users/stuart/dev/freecell/Freecell.Engine.Tests/Freecell.Engine.Tests.csproj.


Restore succeeded.

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
The command `dotnet new console` instructs the framework to create a new console application. The `-o` option allows an output directory to be specified and the `-n` allows the project name to be specified. You can see more details on the command on [Microsoft's documentation](https://docs.microsoft.com/en-us/dotnet/core/tools/dotnet-new?tabs=netcore2x).

As you can see, I also initialised a git repository and made an initial commit. We still have a little more to do before we can write our first test though. For our convenience, we should add a solution file, and then because we want to unit test our `Freecell.Engine`, we need to add it as a reference to the unit test project.
{% highlight bash %}
nostromo:freecell stuart$ dotnet new sln -n Freecell.Engine
The template "Solution File" was created successfully.
nostromo:freecell stuart$ dotnet sln add Freecell.Engine/Freecell.Engine.csproj 
Project `Freecell.Engine/Freecell.Engine.csproj` added to the solution.
nostromo:freecell stuart$ dotnet sln add Freecell.Engine.Tests/Freecell.Engine.Tests.csproj 
Project `Freecell.Engine.Tests/Freecell.Engine.Tests.csproj` added to the solution.
nostromo:freecell stuart$ git add .
nostromo:freecell stuart$ git commit -m "Add solution file"
[master b10cf9a] Add solution file
 1 file changed, 48 insertions(+)
 create mode 100644 Freecell.Engine.sln
nostromo:freecell stuart$ 
nostromo:freecell stuart$ cd Freecell.Engine.Tests/
nostromo:Freecell.Engine.Tests stuart$ dotnet add reference ../Freecell.Engine/Freecell.Engine.csproj 
Reference `..\Freecell.Engine\Freecell.Engine.csproj` added to the project.
nostromo:Freecell.Engine.Tests stuart$ 
nostromo:Freecell.Engine.Tests stuart$ cd ..
nostromo:freecell stuart$ git add .
nostromo:freecell stuart$ git commit -m "Add reference to project under to test to unit test library"
[master 727bfe9] Add reference to project under to test to unit test library
 1 file changed, 19 insertions(+), 15 deletions(-)
nostromo:freecell stuart$ 
{% endhighlight %}
We create a new solution file named `Freecell.Engine`, and then add both of the projects we've created to it. Moving into the test project folder, we add a reference to the project under test, and then moving back up to the parent folder we commit all our changes. And we still haven't written a unit test.

# Actually writing our first test
We know from the rules that we need a standard deck of cards to work with, so our initial test could assert that we can create an array, of some type that is yet to be determined, which has a length of 51.
{% highlight csharp %}
[Fact]
public void Should_CreateAStandardDeckOfCards()
{
    var sut = new Deck();

}
{% endhighlight %}
There! Our first test. It fails (by not compiling). We've obeyed [The 3 Laws of TDD](http://butunclebob.com/ArticleS.UncleBob.TheThreeRulesOfTdd): We've not written any production code and we've only written enough of the unit test to make it fail. We can make the test pass by creating a `Deck` class in the `Freecell.Engine` project. Time for another commit:

{% highlight bash %}
nostromo:freecell stuart$ git status
On branch master
Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

	deleted:    Freecell.Engine.Tests/UnitTest1.cs

Untracked files:
  (use "git add <file>..." to include in what will be committed)

	.vscode/
	Freecell.Engine.Tests/DeckTests.cs
	Freecell.Engine.Tests/obj/Debug/
	Freecell.Engine/obj/Debug/

no changes added to commit (use "git add" and/or "git commit -a")
nostromo:freecell stuart$ 
{% endhighlight %}
Something I forgot to do (and I nearly always forget this) is to create a `.gitignore` file, so folders and files that we don't care about don't get added to our repository. As it's C#, we can just use the [Visual Studio](https://github.com/github/gitignore/blob/master/VisualStudio.gitignore) file on github, which is fairly standard.
{% highlight bash %}
nostromo:freecell stuart$ wget -O .gitignore https://raw.githubusercontent.com/github/gitignore/master/VisualStudio.gitignore
--2017-11-07 21:45:09--  https://raw.githubusercontent.com/github/gitignore/master/VisualStudio.gitignore
Resolving raw.githubusercontent.com... 151.101.16.133
Connecting to raw.githubusercontent.com|151.101.16.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 2323 (2.3K) [text/plain]
Saving to: '.gitignore'

.gitignore          100%[===================>]   2.27K  --.-KB/s    in 0s      

2017-11-07 21:45:14 (10.4 MB/s) - '.gitignore' saved [5070]

nostromo:freecell stuart$ echo ".vscode" >> .gitignore 
nostromo:freecell stuart$ git add --all
nostromo:freecell stuart$ git status
On branch master
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

	new file:   .gitignore
	renamed:    Freecell.Engine.Tests/UnitTest1.cs -> Freecell.Engine.Tests/DeckTests.cs

nostromo:freecell stuart$ 
{% endhighlight %}
Using wget to download the file and renaming it on the fly to `.gitignore`, and then also appending another directory to it to ignore. We can then stage all our changes, using the `--all` option, which makes git understand that we renamed a file. We can `git commit` our staged changes, and all is well.

Except we still need to make our first test pass. This is trivial, as all we need to do is create a new class in our `Freecell.Engine` project, and our test passes as it now compiles. We can prove this by instructing `dotnet` to run our unit tests for us:
{% highlight bash %}
nostromo:freecell stuart$ dotnet test Freecell.Engine.Tests/Freecell.Engine.Tests.csproj 
Build started, please wait...
Build completed.

Test run for /Users/stuart/dev/freecell/Freecell.Engine.Tests/bin/Debug/netcoreapp2.0/Freecell.Engine.Tests.dll(.NETCoreApp,Version=v2.0)
Microsoft (R) Test Execution Command Line Tool Version 15.3.0-preview-20170628-02
Copyright (c) Microsoft Corporation.  All rights reserved.

Starting test execution, please wait...
[xUnit.net 00:00:00.6338560]   Discovering: Freecell.Engine.Tests
[xUnit.net 00:00:00.7194760]   Discovered:  Freecell.Engine.Tests
[xUnit.net 00:00:00.7610890]   Starting:    Freecell.Engine.Tests
[xUnit.net 00:00:00.9166210]   Finished:    Freecell.Engine.Tests

Total tests: 1. Passed: 1. Failed: 0. Skipped: 0.
Test Run Successful.
Test execution time: 1.7611 Seconds
nostromo:freecell stuart$ 
{% endhighlight %}

# Conclusion
In this post I reminded you of the rules of Freecell and demonstrated how to setup a dotnet core class library project, xunit test project and add them to a solution. I showed some simple git commands to initialise a new repository and get our project into source control, and how we can use `wget` to download a file for us (I could just have easily done `File > Save As` on the raw file in Firefox, but using `wget` is more fun).

Next time, we'll concentrate more on writing unit tests to explore the API of our `Deck` class.
