---
layout: post
title: "Test Driven Development: Implementing Freecell - part 2"
description: Developing a Freecell rules engine, using Test Driven Development in csharp - part 2
---
# Introduction
In the previous post in this series, we had finished up with a very basic unit test, which didn't really test much, which we had ran using `dotnet xunit` in a console, and saw some lovely output.

We'll continue to write some more unit tests to try and understand what kind of API we need in a class (or classes) which can help us satisfy the first rule of our Freecell engine implementation. As a reminder, our first rule is: _There is one standard deck of cards, shuffled_.

I'm trying to write both the code and the blog posts as I go along, so I have no idea what the final code will look like when I've finished. This means I'll probably make mistakes and make some poor design decisions, but the whole point of TDD is that you can get a feel for that as you go along, because the tests will tell you. 

# Don't try to TDD without some sort of plan
Whilst we obey [the 3 Laws of TDD](http://butunclebob.com/ArticleS.UncleBob.TheThreeRulesOfTdd), that doesn't mean that we can't or shouldn't doodle a design and some notes on a whiteboard or a notebook about the way our API could look. I always find that having some idea of where you want to go and what you want to achieve aids the TDD process, because then the unit tests should kick in and you'll get a feel for whether things are going well or the conceptual design you had is not working.

With that in mind, we know that we will want to define a `Card` object, and that there are going to be four suits of cards, so that gives us a hint that we'll need an `enum` to define them. Unless we want to play the same game of Freecell over and over again, then we'll need to randomly generate the cards in the deck. We also know that we will need to iterate over the deck when it comes to building the _Cascades_, but the `Deck` should not be concerned with that.

With that in mind, we can start writing some more tests.

# To a functioning `Deck` class

First things first, I think that I really like the idea of having the `Deck` class enumerable, so I'll start with testing that.
{% highlight csharp %}

[Fact]
public void Should_BeAbleToEnumerateCards()
{
    foreach (var card in new Deck())
    {
    }
}
{% endhighlight %}

This is enough to make the test fail, because the `Deck` class doesn't yet have a public definition for `GetEnumerator`, but it gives us a feel for how the class is going to be used. To make the test pass, we can do the simplest thing to make the compiler happy, and give the `Deck` class a `GetEnumerator` definition.

{% highlight csharp %}
public IEnumerator<object> GetEnumerator()
{
    return Enumerable.Empty<object>().GetEnumerator();
}
{% endhighlight %}

I'm using the generic type of `object` in the method, because I haven't yet decided on what that type is going to be, because to do so would violate the three rules of TDD, and it hasn't yet been necessary.

Now that we can enumerate the `Deck` class, we can start making things a little more interesting. Given that it is a deck of cards, it should be reasonable to expect that we could expect to be able to select a suit of cards from the deck and get a collection which has 13 cards in it. Remember, we only need to write as much of this next test as is sufficient to get the test to fail.

{% highlight csharp %}
[Fact]
public void Should_BeAbleToSelectSuitOfCardsFromDeck()
{
    var deck = new Deck();

    var hearts = deck.Where();
}
{% endhighlight %}

It turns out we can't even get to the point in the test of asserting something because we get a compiler failure. The compiler can't find a method or extension method for `Where`. But, the previous test where we enumerate the `Deck` in a `foreach` passes. Well, we only wrote as much code to make that test pass as we needed to, and that only involved adding the `GetEnumerator` method to the class. We need to write more code to get this current test to pass, such that we can keep the previous test passing too.

This is easy to do by implementing `IEnumerable<>` on the `Deck` class:

{% highlight csharp %}
public class Deck : IEnumerable<object>
{
    public IEnumerator<object> GetEnumerator()
    {
        foreach (var card in _cards)
        {
            yield return card;
        }
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}
{% endhighlight %}

I've cut some of the other code out of the class so that you can see just the detail of the implementation. The second explicitly implemented `IEnumerable.GetEnumerator` is there because `IEnumerable<>` inherits from it, so it must be implemented, but as you can see, we can just fastward to the genericly implemented method. With that done, we can now add `using System.Linq;` to the `Deck` class so that we can use the `Where` method.

{% highlight csharp %}
var deck = new Deck();

var hearts = deck.Where(x => x.Suit == Suit.Hearts);
{% endhighlight %}

This is where the implementation is going to start getting a little more complicated that the actual tests. Obviously in order to make the test pass, we need to add an actual `Card` class and give it a property which can use to select the correct suit of cards.

{% highlight csharp %}
public enum Suit
{
    Clubs,
    Diamonds,
    Hearts,
    Spades
}

public class Card
{
    public Suit Suit { get; set; }
}
{% endhighlight %}

After writing this, we can then change the enumerable implementation in the `Deck` class to `public class Deck : IEnumerable<Deck>`, and the test will now compile. Now we can actually assert the intent of the test:

{% highlight csharp %}
[Fact]
public void Should_BeAbleToSelectSuitOfCardsFromDeck()
{
    var deck = new Deck();

    var hearts = deck.Select(x => x.Suit == Suit.Hearts);

    hearts.Should().HaveCount(13);
}
{% endhighlight %}

# Conclusion
In this post, I talked through several iterations of the TDD loop, based on the 3 Rules of TDD, in some detail. An interesting discussion that always rears its head at this point is: Do you need to follow the 3 rules so excruciatingly religously? I don't really know the answer to that. Certainly I always had it in my head that I would need a `Card` class, and that would necessitate a `Suit` enum, as these are pretty obvious things when thinking about the concept of a class which models a deck of cards. Could I have taken a short cut, written everything and then wrote the tests to test the implementation (as it stands)? Probably, for something so trivial.

In the next post, I will write some more tests to continue building the `Deck` class.
