---
title: Adding authentication on the fly to a RestSharp client request
published: 07/11/2011
layout: post
category: C#,Coding,github-api
metadescription: adding-authentication-on-the-fly-to-a-restsharp-client-request
---
<h1>The Basics</h1>
The typical way that you'd make a request with RestSharp:
<ol>
	<li>Create a RestRequest</li>
	<li>Create a RestClient</li>
	<li>Execute the request with the client</li>
	<li>Do something with the response.</li>
</ol>
It's at the point that you get the client object that you may wish to add authentication. For example with a REST API such as Githubs, certain methods behave differently if the request is authenticated or not, so being able to magically turn on authentication is desirable.

To authenticate a request with RestSharp, it is a simple case of creating a RestRequest, RestClient and an IAuthenticator instance for the authenticating mechanism you want to use. For example:
<pre class="brush:csharp">var client = new RestClient
             {
                 BaseUrl ="https://api.github.com",
                 Authenticator = new HttpBasicAuthenticator(username, password)
             };</pre>
This is pretty straightforward and standard RestSharp usage. You may have a class to encapsulate this functionality, with a method which returns the RestClient instance, probably in a base class in order to inherit this common functionality in other classes.
<pre class="brush:csharp">public abstract class BaseApi
{
    RestClient GetRestClient()
    {
        ...
    }
}</pre>
<h1>Options</h1>
There are several methods which we can use to add authentication dynamically to the RestClient instance, ranging from the trivial to the more involved.

The trivial solution is to add the IAuthenticator as a parameter to the method, which is then assigned to the RestClient when it is created. Easy. Also fairly easy is just make it abstract or virtual and override it in an inheriting class, although this breaks SRP.

Alternatively, we can implement the Decorator pattern, and introduce the authentication in a class which is solely responsible for handing it. I'm not going to go into this in too much detail, there is a wealth of information on implementing this pattern already available on the web. Using a Decorator is valid in a lot of situations, particularly when re-factoring someone else's mess, as you can adhere to the same interface and not risk breaking some important business function. In other cases, it is better to intercept.
<h1>Interception</h1>
A pattern which lends itself to this is called Proxy, and if you spend any time with Google and search terms like "c# proxy pattern" you'll quickly end up finding a lot of information about implementing it. You'll also find interesting stuff about Castle.DynamicProxy, and you may quickly realise this is an excellent way of adding the ability to dynamically intercept a method to add additional functionality on the fly. I've implemented an interceptor in the Github API library, with the core magic being:
<pre class="brush:csharp">public void Intercept(IInvocation invocation)
{
    invocation.Proceed(); // let the RestClient be instantiated as normal.
    var restClient = (RestClient)invocation.ReturnValue;
    restClient.Authenticator = _authenticator; // add the authenticator
    invocation.ReturnValue = restClient;
 }</pre>
I then wrap the interception up in a static class, which is a technique I <a href="http://geekswithblogs.net/BlackRabbitCoder/archive/2010/05/06/c-why-decorate-when-you-can-intercept.aspx">saw on another website</a>, which I then wrap in a extension method which with a little bit of generics hangs off API classes in a fluent manner.
<pre class="brush:csharp">var api = new UserApi(GitHubUrl).WithAuthentication(authenticator);</pre>
I feel like it is the best way to do this sort of thing, and I will certainly starting using more of it, where necessary, in all my projects.
