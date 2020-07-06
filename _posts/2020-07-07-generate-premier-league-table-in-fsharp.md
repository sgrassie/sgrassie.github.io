---
layout: post
title: 'Generating the Premier League Table in F#'
tags: [F#]
featured_image_thumbnail: assets/images/posts/2020/footballs-3597192_640.jpg
featured_image: assets/images/posts/2020/footballs-3597192_1920.jpg
featured: false
hidden: false
---
During lockdown, I've made another effort at learning F#. This time I think I've had a bit more success. Processing data is something that we as developers do on a weekly or even daily basis, so it seems quite natural to practice that in F#. As a big football fan, I've decided to use the English Premier League results for season 2019/2020, as it's a dataset I implicitly understand.

The EPL results set is available in CSV format from football-data.co.uk, and rather than having to parse it all by hand or hitting up [CsvHelper](https://joshclose.github.io/CsvHelper/) and still having to write some C# code to actually use it, in F# we can use a Type Provider, specifically the [CsvProvider](https://fsharp.github.io/FSharp.Data/library/CsvProvider.html) from [FSharp.Data](https://fsharp.github.io/FSharp.Data/).

{% include warning.html content="It's worth pointing out at this point that I've been learning for about two weeks, so the following F# should not be taken as a definitive example of good, idiomatic code." %}

## Loading and parsing the data
FSharp.Data is easily added via NuGet, and using an `.fsx` script, we can easily reference the assembly and open the namespace:

{% highlight fsharp %}
#r "../../.nuget/packages/fsharp.data/3.3.3/lib/netstandard2.0/FSharp.Data.dll"
open FSharp.Data
open System.Collections.Generic
{% endhighlight %}

I didn't have any luck in the script with referencing a more local copy of the assembly, such as one in the `/bin` folder, due to it complaining about not being able to find the `FSharp.Data.DesignTime.dll`, but going directly to the assembly in the NuGet packages folder seems to work just fine. It is also worth noting that I'm writing this on a Mac (in VS Code), so your path syntax might vary. Also note that we also open the BCL `System.Collections.Generic` namespace. We'll need that later.

Next, comes the part that blows my mind. Here is how we generate a type which knows how to load and parse a CSV file of a given structure:

{% highlight fsharp %}
type Results = CsvProvider<"../../Downloads/epl1920.csv">
{% endhighlight %}

That's it. It's pretty amazing. The `Results` type is now also type safe, and it's had a guess at infering what the types are for each column of the data. We could probably do something similar to this in C# using `CsvHelper` and either `Castle.DynamicProxy` or some magic with the new Roslyn compiler, but I think it would take quite a bit of code to create something that came close to what this can do.

Skipping over some important stuff that we'll get to in just short a while, we can now easily load the full results set:

{% highlight fsharp %}
Results.Load("../../Downloads/epl1920.csv")
{% endhighlight %}

This is fairly straightforward, and does exactly what it looks like. The data loaded from the file is available in a `.Rows` property, that we'll use shortly.

## Parsing the data
All good so far, but now things get a little more complicated. Now we need to think somewhat about the data, and if you look in the file... it's got a LOT of information. Mostly related to betting information for the match, but there is also quite a lot of information about the match itself. For the purposes of calculating the league, most of thie information in the file is redundant. In order to just get the information we need, we can define a Record to hold to that information. A Record in F# is somewhat analagous to a C# POCO class, but with automatic type safety and full equality comparisons out of the box.

{% highlight fsharp %}
type FullTimeResult = | Home | Away | Draw
type MatchResult = {HomeTeam : string; AwayTeam: string; HomeGoals: int; AwayGoals: int; Result: FullTimeResult}
{% endhighlight %}

The `FullTimeResult` type is just like a C# enum, and is easier to read than the 'A', 'H' or 'D' we get from the CSV file for the FTR (Full Time Result) column. I think it also looks nicer to read when it comes to the pattern matching, but we'll get to that. With those types defined, we can get to the real meat of this and actually parse the data:

{% highlight fsharp %}
let league = Results.Load("../../Downloads/epl1920.csv")
                .Rows
                |> Seq.map toMatchResult
                |> Seq.fold processMatchResult (Dictionary<string, LeagueRow>())
                |> Seq.sortByDescending (fun (KeyValue(_, v)) -> v.Points)
{% endhighlight %}

Here, we load the file as we discussed earlier, but now, we forward pipe the data returned from the `.Rows` property to `Seq.map` through the `toMatchResult` function, which takes a `Row` and extracts the data we're interested in and returns a new `MatchResult`. In C# this is the same as doing `.Rows.Select(new MatchResult {...})`. Then, the resulting sequence of `MatchResult`s is piped forward through the `processMatchResult` function, using the scary sounding `Seq.fold`, and it also passed a new instance of a BCL `Dictionary`, with a `string` key and a `LeagueRow` type as the value. I've not yet mentioned the `LeagueRow` type... it's not super important to proceedings, it just a type which holds all the data you would expect to see in a football league table. For reference it's included below in the full script.

Amazingly, those five lines load the file, process all the data, and provide an object which contains a fairly accurate version of the English Premier League table. Obviously things are a little more involved than that.

## Examing the parsing in more detail
As you'll recall, the there is a lot of data in the CSV file that is irrelevant when it comes to generating the league table. We can map all the data we need into the `MatchResult` type, which we do by forward piping the data through `Seq.map` and the `toMatchResult` function:

{% highlight fsharp %}
let toMatchResult (row: Results.Row) =
    let fullTimeResult = 
        if row.FTR = "H" then FullTimeResult.Home
        elif row.FTR = "A" then FullTimeResult.Away
        else FullTimeResult.Draw
    {
        HomeTeam = row.HomeTeam
        AwayTeam = row.AwayTeam
        HomeGoals = row.FTHG
        AwayGoals = row.FTAG
        Result = fullTimeResult
    }
{% endhighlight %}

This is mostly just a simple mapping from the results row into the new `MatchResult` type. You'll notice we don't need to explicitly 'new' anything up, don't forget, we're in a functional world now, so the `MatchResult` is returned as a side affect of what we're doing. We also define a nested method which processes the full time result using a simple if/else construct. I _think_ I could also have used pattern matching, but it's simple enough that I'm not going to worry about it.

Next, comes the scarying sounding fold. The method looks like this:

{% highlight fsharp %}
let processMatchResult (league : Dictionary<string, LeagueRow>) result  =
    match result.Result with
    | Home -> updateHomeWin(league, result)
    | Away -> updateAwayWin(league, result)
    | Draw -> updateDraw(league, result)
    league
{% endhighlight %}

What happens is that we tell `Seq.fold` to use this method to do the folding, and we give it an initial state of a new and empty `Dictionary<string, LeagueRow>()`. `Seq.fold` carries the state over to each subseqent 'fold' over the sequence of `MatchResults` it was piped. You'll note that the final thing returned as a side effect of the method is the same dictionary which was passed in. This essentially forms the core of the algorithm to produce the league. The pattern matching of `match <thing> with` is equivalent to a C# switch statement on steroids. I am barely scratching the surface of what can be done with pattern matching in F#.

The patten patch decides what kind of result we are dealing with, and delegates further processing to the relevant method. Here is the definition for `updateHomeWin`. The other two methods are exactly the same, except they distribute the points/goals/wins/losses/draws accordingly, so I won't go into those in detail.

{% highlight fsharp %}
let updateHomeWin (league : Dictionary<string, LeagueRow>, result : MatchResult) =
    updateTeam(league, result.HomeTeam, 3, result.HomeGoals, result.AwayGoals, 1, 0, 0)
    updateTeam(league, result.AwayTeam, 0, result.AwayGoals, result.HomeGoals, 0, 0, 1)
{% endhighlight %}

Each `MatchResult` consists of two teams, and we have to update each entry in the league for both of these teams, with the correct number of points, goals for, goals against, win, draw and loss. The real part of this is in the `updateTeam` function:

{% highlight fsharp %}
let updateTeam (league : Dictionary<string, LeagueRow>, team : string, points : int, forGoals : int, againstGoals: int, won : int, drawn, lost: int) =
    if league.ContainsKey team then
        let existing = league.[team]
        let updated = {existing with Played = existing.Played + 1; Won = existing.Won + won; Drawn = existing.Drawn + drawn; Lost = existing.Lost + lost; For = existing.For + forGoals; Against = existing.Against + againstGoals; Points = existing.Points + points}
        league.[team] <- updated
    else
        let leagueRow = {Team = team; Played = 1; Won = won; Drawn = drawn; Lost = lost; GD = 0; For = forGoals; Against = againstGoals; Points = points}
        league.Add(team, leagueRow)
{% endhighlight %}

This is just a simple dictionary update where we check if a team already has an entry, and if so, update it, otherwise we create it. Things of note here are that whilst F# is mostly immutable, types from `System.Collections.Generic` are mutable, which is how this whole thing works. I'm sure that someone much better at F# can come along and tell me how to do this with immutable F# collections. Also of note is the collection access of `league.[team]`, which is different than in C#. We also update the value in the dictionary by using `<-`.

After that, we can define a simple method to print out a row from the league for us, and then iterate through the entries in the dictionary, to get a league table:

{% highlight fsharp %}
let print league =
    printfn "Team: %s | Played: %d | Won: %d | Lost: %d | Drawn: %d | For: %d | Against: %d | GD: %d | Points: %d" league.Team league.Played league.Won league.Lost league.Drawn league.For league.Against (league.For - league.Against) league.Points

league
|> Seq.iter (fun (KeyValue(_, v)) -> print v)
{% endhighlight %}

The `KeyValue` is an active pattern, which matches values of `KeyValuePair` objects from the BCL Dictionary, and this produces (with data correct as at the publication of this post):

{% highlight console %}
Team: Liverpool | Played: 33 | Won: 29 | Lost: 2 | Drawn: 2 | For: 72 | Against: 25 | GD: 47 | Points: 89
Team: Man City | Played: 33 | Won: 21 | Lost: 9 | Drawn: 3 | For: 81 | Against: 34 | GD: 47 | Points: 66
Team: Leicester | Played: 33 | Won: 17 | Lost: 9 | Drawn: 7 | For: 63 | Against: 31 | GD: 32 | Points: 58
Team: Chelsea | Played: 33 | Won: 17 | Lost: 10 | Drawn: 6 | For: 60 | Against: 44 | GD: 16 | Points: 57
Team: Man United | Played: 33 | Won: 15 | Lost: 8 | Drawn: 10 | For: 56 | Against: 33 | GD: 23 | Points: 55
{% endhighlight %}

For completeness here is a gist of the full script:

{% gist f4838399edbc27891f7a6ff1057a7fd5 generatepremierleaguetable.fsx %}