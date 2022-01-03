---
layout: post
title: Is this thing on?
tags: ['Uncategorized']
hidden: False
published: 26/09/2011
ispublished: True
---
Despite many months of not posting anything on this blog (OK, nearly a year) I am returning with another post about my on/off project to write a C# library to access the Github REST API. Much like my blogging schedule, which can arguably be said to be none-existent, my pet-projects suffer from the same cruel lack of... habit.

To recap this particular project, you may like to browse some of the earlier posts on it, wherein I grandly proclaim my intent to write a Github API in C#. Which I should really have finished by now. As you will have no doubt realised, I do suffer from a certain amount of laziness. That is a subject for another blog post. To my shame, I can tell you that the amount of Githubs REST API which Im covering is minimal, limited to a subset of the available User related commands.

Moving swiftly along, with no trace of irony.

In the months since the start of this project, Github has release v3 of their REST API, which contains many updated and/or new methods to access the whole plethora of the functionality available on Github. Indeed, they have even gone as far as to release a desktop client for Macs, and for all I know are working on a Windows version, which would then render this effort of mine (because thats what Ive always intended) redundant.

So, despite not blogging about it, and despite going months between commits, I have been working on the library. The RestSharp git sub-module is gone (I mean, who likes sub-modules anyway?) in favour of the NuGet package. The authentication has been reworked slightly (still no OAuth yet) and the API is a little more fluenty.

Of course, it still doesnt actually let you do very much, I mean even after a year, you still cant perform all of the actions available to a user. This is terrible, and speaks volumes about me, as a person. Procrastination is my enemy.
