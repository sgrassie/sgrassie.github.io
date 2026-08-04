---
layout: post
title: "What I'm building: a football data platform for one"
description: "The start of a series on building a football data platform in .NET 10: match data, bookmaker odds, a Dixon-Coles model, and ruthless evaluation."
tags: [footballdata,dotnet,postgresql]
featured_image: /assets/images/2026-08-03-what-im-building-a-football-data-platform-for-one.webp
image: /assets/images/2026-08-03-what-im-building-a-football-data-platform-for-one.webp
featured: False
hidden: False
published: 03/08/2026
ispublished: True
---

For the last while I've been building a football data platform. It collects match results and statistics, stores bookmaker odds, fits a statistical model to predict match outcomes, and then compares what the model thinks against what the market thinks. This post is the start of a long series about how it works.

The obvious first question is why.

Partly because football is the sport I actually watch, and I wanted better answers to questions like "is this team actually good or just lucky?". Partly because the problem has a lovely shape for a side project: real-world data that's messy in interesting ways, some genuinely fun maths, and a clear way to keep score. If your model says a result is 55% likely and the bookmaker says 45%, one of you is wrong, and the fixture list will eventually tell you which.

I also wanted a proper excuse to use .NET 10, PostgreSQL and Entity Framework Core on something with real data volume, rather than another todo app.

## What it actually does

The pipeline, end to end:

1. Import historical match results and statistics.
2. Ingest bookmaker odds from The Odds API into a canonical form.
3. Fit a team strength model (a simplified Dixon-Coles, more on that in a later post) that turns past results into attack and defence ratings.
4. Convert those ratings into expected goals, then into probabilities for match outcomes: home/draw/away, over/under goals, both teams to score.
5. Compare the model's probabilities against the bookmaker's prices and flag where they disagree.
6. Evaluate everything ruthlessly: Brier scores, log loss, calibration curves, simulated staking with drawdown tracking.

One thing I want to state plainly at the outset, because it shapes a surprising amount of the design: **this system never places a bet**. There is no code path that stakes money, and there never will be. All the staking and bankroll machinery is simulation, there to answer the question "would this model have made money?" rather than to make any. That constraint turns out to be liberating. When nothing real is at stake you can be honest about your results, and honest evaluation is the whole point.

## The stack

- .NET 10 / C#, because it's what I write all day and the newer language versions are pleasant.
- PostgreSQL with Npgsql, because match data is relational to its bones and Postgres does everything I need, including materialized views for the heavier analytics.
- EF Core 10 with a single `DbContext` covering multiple schemas. That decision has some interesting consequences I'll cover in its own post.
- NodaTime, because a fixture happens on a *date* and an odds observation happens at an *instant*, and `DateTime` is a bad model for both.
- Blazor Server with Radzen components for the UI, which is called Jeff. Every project needs a Jeff.
- TickerQ for background jobs, and a CLI for the batch work.

## What this series will cover

Over the coming months I'll write about the architecture (there's a one-way dependency rule I'm quite pleased with), the betting maths from first principles (what an overround is, why raw bookmaker odds lie to you, Shin's method for un-lying them), the Poisson goals model, and the evaluation machinery. There will be a lot of C#.

If you know .NET but nothing about betting markets, you're the reader I have in mind. I knew nothing about them either when I started; most of this series is me writing up what I had to learn.

Next up: how the solution is laid out, and the dependency rule that keeps it honest.