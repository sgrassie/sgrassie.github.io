---
layout: post
title: 'Making the English Premier League Generator immutable'
tags: [F#]
featured_image_thumbnail: /assets/images/posts/2020/footballs-3597192_640.jpg
featured_image: /assets/images/posts/2020/footballs-3597192_1920.jpg
featured: false
hidden: false
---
In the previous post, I displayed my fledgling understandin of F# by writing a script which can parse the CSV set of results of the English Premier League to generate the league table. The script does this primarily by using a mutable BCL `Dictionary`. F# is immutable by default, and whilst that is itself not immutable, you have to go out of your way to enable it. I'll try to save repeating [Scott Wlashin](https://fsharpforfunandprofit.com/posts/correctness-immutability/).

There are some improvements that can be made to the script. I'll highlight them here and then link to the full script as a gist.

First a note on pattern matching. In the previous post I mentioned that I thought I could use pattern matching in a particular place, and obviously I can:

{% highlight fsharp %}
let fullTimeResult =
        match row.FTR with
        | "H" -> Home
        | "A" -> Away
        | _ -> Draw
{% endhighlight %}

Rather than if/then/else. Here, the "_" is equal to the `default` in a C# switch statement, if it's not a Home or Away (win), then it _must_ be a draw.

## Making things immutable
To start making things immutable, we can update the `updateTeam` function from the previous post, and pass in a `Map<string, LeagueRow>`:

{% highlight fsharp %}
let updateTeam (league : Map<string, LeagueRow>, team : string, points : int, forGoals : int, againstGoals: int, won : int, drawn, lost: int) =
    if league.ContainsKey team then
        let existing = league.[team]
        let updated = {existing with Played = existing.Played + 1; Won = existing.Won + won; Drawn = existing.Drawn + drawn; Lost = existing.Lost + lost; For = existing.For + forGoals; Against = existing.Against + againstGoals; Points = existing.Points + points}
        league.Add(team, updated)
    else
        let leagueRow = {Team = team; Played = 1; Won = won; Drawn = drawn; Lost = lost; GD = 0; For = forGoals; Against = againstGoals; Points = points}
        league.Add(team, leagueRow)
{% endhighlight %}

The code is almost the same as the previous version, except that we no longer use the `<-` operator to update the mutable dictionary. What's going on instead is that F# creates a new instance of the `LeagueRow`, with updated values, and adds that to the `Map`, by key, which has the side-effect of creating a new instance of the whole `Map`, with the league row identified by the key replaced with the updated version.

The `updateHomeWin` function becomes:

{% highlight fsharp %}
let updateHomeWin (league : Map<string, LeagueRow>, result : MatchResult) =
    let league = updateTeam(league, result.HomeTeam, 3, result.HomeGoals, result.AwayGoals, 1, 0, 0)
    let league = updateTeam(league, result.AwayTeam, 0, result.AwayGoals, result.HomeGoals, 0, 0, 1)
    league
{% endhighlight %}

This again replaces the BCL Dictionary with the Map, and simply passes the league map through each `updateTeam` call, and then returns the updated league object.

`processMatchResult` is also updated to pass in a `Map`, and calling the fold with it and a default map is straightforward:

{% highlight fsharp %}
|> Seq.fold processMatchResult (Map<string, LeagueRow> [])
{% endhighlight %}

This makes the script much more 'the way of things' in F#, which is to say it's using an immutable data structure.