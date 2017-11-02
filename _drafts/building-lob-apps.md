---
layout: post
title: Building Line of Business Applications
---
#Introduction
Like eighty percent of developers (I'm guessing), I spend most of my time programming by building line of business applications. 

From the feeling I get reading through the enormous list of developer blogs that I follow in Feedly (RIP Google Reader), not many of them deal with the day-to-day activities of your average developer. We don't all work in start ups after all.

This is a series of posts which demonstrates how I would go about writing a LOB application. I'm going to concentrate on the development/coding side of things, and leave any mention/discussion of Project Management stuff for another time.

#What is a LOB application?
[Wikipedia](https://en.wikipedia.org/wiki/Line_of_business#Computer_applications) defines a LOB application as such:

>In the context of computing, a "line-of-business application" is one of the set of critical computer applications perceived as vital to running an enterprise.

A LOB application can be the very foundation that an enterprise builds its entire revenue stream from, or an application which, whilst useful, doesn't add or subtract from the companies profits.

It is my experience that I spend most of my time staring at shitty VB6 or classic ASP applications which have chugged along quite happily for well over fifteen years and are now reaching the end of their useful life, either through PCI (non)compliance, or hardware failure, Windows 98' being nearly twenty years ago etc etc.

#The Scenario
Because I don't have a handy LOB application which I'm allowed to put on the internet and re-write, I'm going to invent one: Let's imagine I'm a developer for a business which cares deeply about processing the statistics for English Premier League football, and the twenty year old VB6 application and out of date Oracle database that is years old and costs a fortune in licenses is now no longer good enough to for day-to-day business activities, and it's been decided by someone in management that a rewrite is in order.

Let's further imagine that we've had all the meetings and it's been decided that the new application will be web based, with a front-end React based client and a back end REST API.

What's next?

First things first, we need to do something about the horrendous Oracle database that no one wants to support, upgrade or pay for. So we get our pet Oracle DBA to do an export for us. Which gives us a bunch of CSV files for each season of the EPL, going back to 1992. Great.

#In Reality
The source of this data is actually from the good people at [football-data.co.uk](http://www.football-data.co.uk/), where you can download CSVs of the results.
