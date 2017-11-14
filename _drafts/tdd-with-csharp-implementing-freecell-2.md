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
To keep Uncle Bob happy, we obey [the 3 Laws of TDD](http://butunclebob.com/ArticleS.UncleBob.TheThreeRulesOfTdd), but that doesn't mean that we can't doodle a design and some notes on a whiteboard or a notebook about the way our API could look. I always find that having some idea of where you want to go and what you want to achieve aids the TDD process, because then the unit tests should kick in and you'll get a feel for whether things are going well or the conceptual design you had in mind is rubbish and your imposter syndrome kicks in big time.

With that in mind, we know that we will want to define a `Card` object, and that there are going to be four suits of cards, so that gives us a hint that we'll need an `enum` to define them. Unless we want to play the same game of Freecell over and over again, then we'll need to randomly generate the cards in the deck. We also know that we will need to iterate over the deck when it comes to building the _Cascades_, but the `Deck` should not be concerned with that.

With that in mind, we can start writing some more tests.

# To a functioning `Deck` class

First things first, I think that I really like the idea of having the `Deck` class enumerable, so I'll start with testing that.
{% highlight csharp %}

{% endhighlight %}
