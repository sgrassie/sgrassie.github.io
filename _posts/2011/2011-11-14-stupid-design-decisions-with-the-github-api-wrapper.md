---
layout: post
title: Stupid design decisions with the Github API wrapper
description: stupid-design-decisions-with-the-github-api-wrapper
tags: ['C#','Github-Api']
featured_image: /assets/images/2011-11-14-stupid-design-decisions-with-the-github-api-wrapper.webp
image: /assets/images/2011-11-14-stupid-design-decisions-with-the-github-api-wrapper.webp
hidden: False
published: 14/11/2011
ispublished: True
---
Whilst writing some blog posts about the authentication which I've been implementing, I've come to the realization, almost as an after thought, that even though I've still not got a lot of the main Github API implemented, the way I've envisioned the API working, from a user point of view, is sort of a bit shit.
<pre class="brush:applescript">var userApi = new UserApi();
var user = userApi.GetUser("example");</pre>
Pretty straightforward, right? What about the as yet unwritten GistApi?
<pre class="brush:csharp">var gistApi = new GistApi();
var gist = gistApi.GetGist(...);</pre>
Again, pretty straightforward. But I see a pattern forming. What am I going to do when it comes to the RepositoryApi?
<pre class="brush:csharp">var reposApi = new RepositoryApi();
var repo = reposApi.GetRepository(...);</pre>
Well, that is starting to look pretty fucking stupid. I've caught myself doing it with other methods as well. I simply cannot believe I've let myself be so stupid. At least there is not that much implemented where I'll have to refactor loads of shit.
