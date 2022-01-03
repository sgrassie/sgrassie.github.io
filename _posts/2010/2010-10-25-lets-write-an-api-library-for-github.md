---
layout: post
title: Let's write an API library for Github
description: lets-write-an-api-library-for-github
tags: ['C#','Coding']
hidden: False
published: 25/10/2010
ispublished: True
---
Let's write a C# API library for <a title="Github.com" href="http://www.github.com">github.com</a>.

Github has a <a title="Representational State Transfer on Wikipedia" href="http://en.wikipedia.org/wiki/Representational_State_Transfer">REST</a> base API, the details of which are available at develop.github.com. Before continuing, I should point out that there is an <a title="GitHubSharp on github.com" href="http://github.com/erikzaadi/GithubSharp">existing C# library already available</a>, if you want to use that.

We'll leverage John Sheehan's excellent <a title="johnsheehan's RestSharp on github.com" href="http://github.com/johnsheehan/RestSharp" target="_blank">RestSharp</a> library to do most of the heavy lifting.

Before we can really do anything, the first task at hand is to learn how to work with RestSharp, and how we can make a request and receive a response. Fortunately, RestSharp makes it really easy, and there are excellent resources on the project's wiki page which explain how to do things. Let's see a quick example:
<pre class="brush: csharp">[Test]
public void MakeBasicRequestToTwitterWithRestSharp()
{
	var client = new RestClient("http://api.twitter.com");
	client.UserAgent = "TemporalCohesion.TwitterApi";

	var request = new RestRequest();
	request.Resource = "statuses/public_timeline.json";

	var response = client.Execute(request);

	if (response.StatusCode == HttpStatusCode.OK)
	{
		String content = response.Content;

		Assert.That(content, Is.Not.Null);
	}
	else
	{
		Assert.Fail(response.StatusDescription);
	}
}</pre>
Here we are making an authenticated request to Twitter, asking for the public timeline in JSON format, but, the same code can easily be applied to github.com. We'll see more of that later. First we create the client object, and then create the request object - telling it what resource to actually request, and then we execute the request using the client, and then do something with the response. Pretty straightforward, huh?

There is quite a lot that we can do with the Github API at this point, although you'll quickly see that to do anything really interesting (i.e. modifying your github account, or creating/forking repo's) requires you to be authenticated. Fortunately for us, Github uses HTTP Basic Authentication, and, RestSharp has a HttpBasicAuthenticator class, and if you put the two together, you can make an authenticated request to Github like this:
<pre class="brush: csharp">var client = new RestClient
				 {
					 BaseUrl = "https://github.com/api/v2/json",
					 Authenticator = new HttpBasicAuthenticator("test", "test")
				 };</pre>
After we set the authenticator, RestSharp takes care of making sure that the headers of the requests we make to Github's API contain the necessary authentication which identifies us to Github. You'll note that the BaseUrl here is set to https://github.com/..., so that we can take advantage of SSL. You can can access public data via normal http://, but if we are going to do anything that requires authentication, it will be best if we choose to use https://

Github also provide us with an API key. This is a unique key which identifies us to Github, and give our requests a little bit more security. We can't set this key with RestSharp, as we need to modify the way the authorization header is generated when we make a request. What we can do though, is to implement our own <a title="RestSharp's IAuthenticator class" href="http://github.com/johnsheehan/RestSharp/blob/master/RestSharp/Authenticators/IAuthenticator.cs" target="_blank">IAuthenticator</a> to do handle it for us. You can see <a title="GitHubAuthenticator in the csharp-github-api" href="http://github.com/sgrassie/csharp-github-api/blob/master/csharp-github-api/GitHubAuthenticator.cs" target="_blank">my implementation</a> up on Github. It's fairly straightforward - I still wanted to allow basic username:password authentication, as well as username/token: authentication for Github.com. Let's create a unit test to check everything is working OK.

How do we know if we have made an authenticated request successfully? If you make a request to Github for a user, and you are authenticated as that user, then as well as the standard user response, there is some additional information included in the responses that only you, as the authenticated user, can see. And we can check for this information in the response:
<pre class="brush: csharp">[Test]
public void MakeAuthenticatedRequest()
{
	var restRequest = new RestRequest
            {
                Resource = "/user/show/sgrassie"
            };

	var client = new RestClient
					 {
						 BaseUrl = "http://github.com/api/v2/json",
						 Authenticator = new GitHubAuthenticator(_secretsHandler.Username, _secretsHandler.Password, true)
					 };

	var response = client.Execute(restRequest);

	Assert.That(response.Content, Is.StringContaining("total_private_repo_count"));
}</pre>
The unit test is pretty straightforward, I make a request object which will get my user account, I authenticate the request and then execute it. Then I can simply check that the response content contains "total_private_repo_count" - this would only be returned if the request was an authenticated request.

One thing you might notice in the test is that in the GitHubAuthenticator constructor, I get my username and password/api token from the <em>_secretsHandler</em> object, an instance of a class I've written which will load my username, password and api key from an XML file. This is so that I don't have to put my Github.com password and API key into the project's Github repo, because that would be bad.
