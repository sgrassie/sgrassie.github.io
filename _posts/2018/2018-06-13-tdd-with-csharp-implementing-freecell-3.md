---
layout: post
title: "Test Driven Development: Implementing Freecell - Part 3"
description: Developing a Freecell rules engine, using Test Driven Development in csharp - Part 3
series: "TDD: Implementing Freecell"
---
# Introduction
In the last post we were left with some tests that exercised some very basic functionality of the `Deck` class. In this post, we will continue to add unit tests and write production code to make those tests pass, until we get a class which is able to produce a randomised deck of 52 cards.

# Test Refactoring
You can, and should, refactor your tests where appropriate. For instance, on the last test in the last post, we only asserted that we could get all the cards for a particular suit. What about the other three? With most modern test frameworks, that is very easy.

{% highlight csharp %}
[InlineData(Suit.Clubs)]
[InlineData(Suit.Diamonds)]
[InlineData(Suit.Hearts)]
[InlineData(Suit.Spades)]
public void Should_BeAbleToSelectSuitOfCardsFromDeck(Suit suit)
{
    var deck = new Deck();

    var cards = deck.Where(x => x.Suit == suit);

    cards.Should().HaveCount(13);
}
{% endhighlight %}

# More Cards
We are going to want actual cards with values to work with. And for the next test, we can literally copy and past the previous test to use as a starter.

{% highlight csharp %}
[Theory]
[InlineData(Suit.Clubs)]
[InlineData(Suit.Diamonds)]
[InlineData(Suit.Hearts)]
[InlineData(Suit.Spades)]
public void Should_BuildAllCardsInDeck(Suit suit)
{
    var deck = new Deck();

    var cards = deck.Where(x => x.Suit == suit);

    cards.Should().Contain(new List<Card> 
    { 
        new Card(suit, "A"), new Card(suit, "2"), new Card(suit, "3"), new Card(suit, "4"),
        new Card(suit, "5"), new Card(suit, "6"), new Card(suit, "7"), new Card(suit, "8"),
        new Card(suit, "9"), new Card(suit, "10"), new Card(suit, "J"), new Card(suit, "Q"),
        new Card(suit, "K")
    });
}
{% endhighlight %}

Now that I've written this, when I compare it to the previous one, it's testing the exact same thing, in slightly more detail. So we can delete the previous test, it's just noise.

The test is currently failing because it can't compile, due to there not being a constructor which takes a string. Lets fix that.

{% highlight csharp %}
public struct Card
{
    private Suit _suit;
    private string _value;

    public Card(Suit suit, string value)
    {
        _suit = suit;
        _value = value;
    }

    public Suit Suit { get { return _suit; } }
    public string Value { get { return _value; } }

    public override string ToString()
    {
        return $"{Suit}";
    }
}
{% endhighlight %}

There are a couple of changes to this class. Firstly, I added the constructor, and private variables which hold the two defining variables, with properties with only public getters. I changed it from being a `class` to being a `struct`, and it's now an immutable value type, which makes sense. In a deck of cards, there can, for example, only be one Ace of Spades.

These changes mean that are tests don't work, as the `Deck` class is now broken, because the code which builds set of thirteen cards for a given suit is broken - it now doesn't understand the `Card` constructor, or the fact that the `.Suit` property is now read-only.

Here is my first attempt at fixing the code, which I don't currently think is all that bad:

{% highlight csharp %}
private string _ranks = "A23456789XJQK";

private List<Card> BuildSuit(Suit suit)
{
    var cards = new List<Card>(_suitSize);

    for (var i = 1; i <= _suitSize; i++)
    {
        var rank = _ranks[i-1].ToString();
        var card = new Card(suit, rank);
        cards.Add(card);
    }

    return cards;
}
{% endhighlight %}

This now builds us four suites of thirteen cards. I realised as I was writing the production code that handling "10" as a value would be straightforward, so I opted for the simpler (and common) approach of using "X" to represent "10". The test pass four times, once for each suit. This is _probably_ unnecessary, but it protects us in future from inadvertantly adding any code which may affect the way that cards are generated for a particular suit.

# Every day I'm (randomly) shuffling
It's occured to me as I write this that the `Deck` class is funtionally complete, as it produces a deck of 52 cards when it is instantiated. You will however recall that we want a randomly shuffled deck of cards. If we consider, and invoke the Single Responsibility Principal, then we should add a `Dealer` class; we are modeling a real world event and a pack of cards cannot shuffle itself, that's what the dealer does.

# Conclusion
In this post I've completed the walk through of developing a class to create a deck of 52 cards using some basic TDD techniques. I realised adding the ability to shuffle the pack to the `Deck` class would be a violation of SRP, as the `Deck` class should not be concerned or have any knowledge about how it is shuffled. In the next post I will discuss how we can implement a `Dealer` class, and illustrate some techniques swapping the randomisation algorithim around.