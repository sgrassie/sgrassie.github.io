---
layout: post
title: Github API - Handling authentication
description: 
tags: ['C#','Coding','Github-Api']
featured_image: 
hidden: False
published: 31/10/2011
ispublished: True
---
With v3 of the Github REST API, calling a certain methods when unauthenticated will return a limited set of information, and when authenticated will return extra information. One of the things I wanted to do was to make it easy, in a fluent manner, to add authentication to a request. For example:
<pre class="brush:csharp">var a = new UserApi();
var user = a.WithAuthentication(authenticationObject).GetUser("example");
var b = new UserApi().WithAuthentication(authenticationObject);
user = b.GetUser("example");</pre>
Thus making it possible to instantiate an API object without having to authenticate, then when authorization for an action is required, the authentication can be provided. When that actually happens is, I think , something that is an implementation detail best left to future consumers of the library. Assuming I get it finished.

I got bogged down over the course of several months in trying to wrap my head around a clean way of implementing this. Initially I had a good inheritance from an Api base class to the UserApi class - this is sensible, the base Api class does after all contain methods which are going to be common to different classes, such as GistsApi, RepositoriesApi etc.

Then things got a little screwy.

At that point I had the following implemented:
<pre class="brush:csharp">var github = new Github(authenticator);
var user = gitHub.User.GetUser("example");
user.Authenticated.AddEmail("example@example.com");</pre>
Which doesn't seem all that bad. The User property on the Github object was an instance of UserApi. When the example User is fetched, the UserApi object was added an internal instance on the User object. Then the Authenticated property on the User object returned a new AuthenticatedUser, which acted as a wrapper to the internal UserApi instance where the actual AddEmail was hidden as internal.

Needless to say, I knew something was wrong with that, and I spent far too long in coming up with a more elegant solution.

In my second stab at things, I tried to implement Decorator to solve this problem, that is, decorate the UserApi with the additional functionality to add the authentication. The trouble is that the way I wanted to implement the pattern wouldn't have lent itself exceedingly well to having specific functionality for the different parts of the api.

Then I thought to myself, wouldn't it be great if I could intercept the method in the base class which gets the RestClient and add the authentication to it on the fly. A little Googling taught me that this is idealised as the Proxy pattern, from which it was but a short leap to the <a title="The Castle Project" href="http://www.google.co.uk/url?sa=t&amp;source=web&amp;cd=1&amp;ved=0CCUQFjAA&amp;url=http%3A%2F%2Fwww.castleproject.org%2F&amp;rct=j&amp;q=castle%20project&amp;ei=5hqHTu3bCKnH0QXsgPXvDw&amp;usg=AFQjCNEUSLcxGcsnLhC_LQOSuUFdNZLizw&amp;cad=rja" target="_blank">Castle project </a>and <a title="Castle DynamicProxy" href="http://www.castleproject.org/dynamicproxy/index.html" target="_blank">DynamicProxy</a>.

&nbsp;
