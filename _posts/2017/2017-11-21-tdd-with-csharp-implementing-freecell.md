---
layout: post
title: "Test Driven Development: Implementing Freecell"
description: Developing a Freecell rules engine, using Test Driven Development in csharp
tags: []
featured_image: /assets/images/2017-11-21-tdd-with-csharp-implementing-freecell.webp
image: /assets/images/2017-11-21-tdd-with-csharp-implementing-freecell.webp
hidden: False
published: 21/11/2017
ispublished: True
series: "TDD: Implementing Freecell"
---
# Introduction
I thought Freecell would make a fine basis for talking about Test Driven Development. It is a game which I enjoy playing. I have an app for it on my phone, and it's been available on Windows for as long as I can remember, although I'm writing this on a Mac, which does not by default have a Freecell game.

The rules are fairly simple:

- There is one standard deck of cards, shuffled.
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

This post is a follow on from my previous post of how to setup a dotnet core environment for doing TDD.

# red - first test
We know from the rules that we need a standard deck of cards to work with, so our initial test could assert that we can create an array, of some type that is yet to be determined, which has a length of 51.
{% highlight csharp %}
[Fact]
public void Should_CreateAStandardDeckOfCards()
{
    var sut = new Deck();

}
{% endhighlight %}
There! Our first test. It fails (by not compiling). We've obeyed [The 3 Laws of TDD](http://butunclebob.com/ArticleS.UncleBob.TheThreeRulesOfTdd): We've not written any production code and we've only written enough of the unit test to make it fail. We can make the test pass by creating a `Deck` class in the `Freecell.Engine` project. Time for another commit:

# green - it passes
It is trivial to make our first test pass, as all we need to do is create a new class in our `Freecell.Engine` project, and our test passes as it now compiles. We can prove this by instructing `dotnet` to run our unit tests for us:
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
   Freecell.Engine.Tests  Total: 1, Errors: 0, Failed: 0, Skipped: 0, Time: 0.142s
watch : Exited
watch : Waiting for a file to change before restarting dotnet...
{% endhighlight %}
It is important to make sure to run `dotnet xunit` from within the test project folder, you can't pass the path to the test project like you can with `dotnet test`. As you can see, I've also started watching xunit, and the runner is now going to wait until I make and save a change before automatically compiling and running the tests.

# red, green
This first unit test still doesn't really test very much, and because we are obeying the 3 TDD rules, it forces us to think a little before we write any test code. When looking at the rules, I think we will probably want the ability to move through our deck of cards and have the ability to remove cards from the deck. So, with this in mind, the most logical thing to do is to make the `Deck` class enumerable. We could test that by checking a length property. Still in our first test, we can add this:
{% highlight csharp %}
var sut = new Deck();

var length = sut.Length;
{% endhighlight %}
If I switch over to our `dotnet watch` window, we get the immediate feedback that this has failed:
{% highlight bash %}
Detecting target frameworks in Freecell.Engine.Tests.csproj...
Building for framework netcoreapp2.0...
  Freecell.Engine -> /Users/stuart/dev/freecell/Freecell.Engine/bin/Debug/netstandard2.0/Freecell.Engine.dll
DeckTests.cs(13,30): error CS1061: 'Deck' does not contain a definition for 'Length' and no extension method 'Length' accepting a first argument of type 'Deck' could be found (are you missing a using directive or an assembly reference?) [/Users/stuart/dev/freecell/Freecell.Engine.Tests/Freecell.Engine.Tests.csproj]
Build failed!
watch : Exited with error code 1
watch : Waiting for a file to change before restarting dotnet...
{% endhighlight %}
We know that we have a pretty good idea that we're going to make the `Deck` class enumerable, and probably make it in implement `IEnumerable<>`, then we could add some sort of internal array to hold another type, probably a `Card` and then right a bunch more code that will make our test pass.

But that would violate the 3rd rule, so instead, we simply add a `Length` property to the `Deck` class:
{% highlight csharp %}
public class Deck 
{
    public int Length {get;}
}
{% endhighlight %}
This makes our test happy, because it compiles again. But it still doesn't assert anything. Let's fix that, and assert that the `Length` property actually has a length that we would expect a deck of cards to have, namely 52:
{% highlight csharp %}
var sut = new Deck();

var length = sut.Length;

length.Should().Be(51);
{% endhighlight %}
The last line of the test asserts through the use of [FluentAssertions](http://fluentassertions.com/) that the `Length` property should be 51. I like FluentAssertions, I think it looks a lot cleaner than writing something like `Assert.True(sut.Length, 51)`, and it's quite easy to read and understand: 'Length' should be 51. I love it. We can add it with the command `dotnet add package FluentAssertions`. Fix the using reference in the test class so that it compiles, and then check our watch window:
{% highlight bash %}
Detecting target frameworks in Freecell.Engine.Tests.csproj...
Building for framework netcoreapp2.0...
  Freecell.Engine -> /Users/stuart/dev/freecell/Freecell.Engine/bin/Debug/netstandard2.0/Freecell.Engine.dll
  Freecell.Engine.Tests -> /Users/stuart/dev/freecell/Freecell.Engine.Tests/bin/Debug/netcoreapp2.0/Freecell.Engine.Tests.dll
Running .NET Core 2.0.0 tests for framework netcoreapp2.0...
xUnit.net Console Runner (64-bit .NET Core 4.6.00001.0)
  Discovering: Freecell.Engine.Tests
  Discovered:  Freecell.Engine.Tests
  Starting:    Freecell.Engine.Tests
    Freecell.Engine.Tests.DeckTests.Should_CreateAStandardDeckOfCards [FAIL]
      Expected value to be 51, but found 0.
      Stack Trace:
           at FluentAssertions.Execution.XUnit2TestFramework.Throw(String message)
           at FluentAssertions.Execution.AssertionScope.FailWith(String message, Object[] args)
           at FluentAssertions.Numeric.NumericAssertions`1.Be(T expected, String because, Object[] becauseArgs)
        /Users/stuart/dev/freecell/Freecell.Engine.Tests/DeckTests.cs(16,0): at Freecell.Engine.Tests.DeckTests.Should_CreateAStandardDeckOfCards()
  Finished:    Freecell.Engine.Tests
=== TEST EXECUTION SUMMARY ===
   Freecell.Engine.Tests  Total: 1, Errors: 0, Failed: 1, Skipped: 0, Time: 0.201s
watch : Exited with error code 1
watch : Waiting for a file to change before restarting dotnet...
{% endhighlight %}

Now to make our test past, we could again just start implementing `IEnumerable<>`, but that's not TDD, and Uncle Bob might get upset at me. Instead, we will do the simplest thing that will make the test pass:
{% highlight csharp %}
public class Deck
{
    public int Length { get { return new string[51].Length; }}
}
{% endhighlight %}

# refactor
Now that we have a full test with an assertion that passes, we can about the refactor stage of the red/gree/refactor TDD cycle. As it stands, our simple classes passes our test but we can see right away that newing up an array in the getter of the `Length` property is not going to be something that is going to serve our interests well in the long run, so we should do something about that. Making it a member variable seems to be the most logical thing to do at the moment, so we'll do that. We don't need to make any changes to our test on the refactor stage. If we do, that's a design smell that would indicate that something is wrong.
{% highlight csharp %}
ublic class Deck
{
    private const int _size = 51;
    private string[] _cards = new string[_size];
    public int Length { get { return _cards.Length; }}
}
{% endhighlight %}

# Conclusion
In this post, we've fleshed out our `Deck` class a little more, and gone through the full red/green/refactor TDD cycle. I also introduced `FluentAssertions`, and showed the output from the watch window as it showed the test failing
