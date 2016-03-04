---
title: Github C# API&#58; Handling the response with RestSharp
published: 01/11/2010
layout: post
category: C#,Coding,RestSharp
metadescription: github-c-api-handling-the-response-with-restsharp
---
Once we make a request to Github.com with <a title="RestSharp.org" href="http://restsharp.org/" target="_blank">RestSharp</a>, we get a response, and RestSharp gives us a <a title="RestResponse class in RestSharp on github.com" href="http://github.com/johnsheehan/RestSharp/blob/master/RestSharp/RestResponse.cs" target="_blank">RestResponse</a> object, with which we can do something with the content. The content will be in the format that we specified when we made the request, either JSON, XML or YAML.

Oh crap, complicated string parsing...

RestSharp to the rescue! We don't have to worry about parsing the response content, because RestSharp can do it for us.

What we need to do, is model the response content into a POCO (Plain Old Clr Object):
<pre class="brush: csharp">public class User
{
	public virtual int Id { get; set; }
	public virtual string Login { get; set; }
	public virtual string Name { get; set;}

	...
}</pre>
Note that in this <a title="User class in the csharp-github-api project" href="http://github.com/sgrassie/csharp-github-api/blob/master/csharp-github-api/Models/User.cs" target="_blank">User</a> class, I've made the properties virtual, this is not necessary for RestSharp to function correctly, it's more habit on my part from working with NHibernate; however it does mean you can reuse the same models with NHibernate (if you wanted to do something like store the response in a database, for example).

Then we need to modify our client such that when we execute the request, we instruct RestSharp to construct an instance of the User object. Create the client in the usual way and also create the request in the usual way. The magic is in how the client executes the request:
<pre class="brush: csharp">var request = new RestRequest
				  {
					  Resource = string.Format("/user/show/{0}", username),
					  RootElement = "user"
				  };

var response = client.Execute&lt;User&gt;(request);

var user = response.Data;</pre>
As you can see, the Execute method has a generic overload. Internally, RestSharp detects that because we have used this overload, we want to deserialise the response content into an object of the given type, and it performs the deserialisation and constructs an instance of the object. The way that it does this is by looking at the Content-Type header in the response, and it uses the correct deserialiser depending upon the Content-Type. You can see more detail about this on <a href="http://github.com/johnsheehan/RestSharp/blob/master/RestSharp/RestClient.cs" target="_blank">RestSharp's Github project pages</a>.

It is really easy to work with the response from your REST request with RestSharp, you can access the raw string content of the response, or deserialise it into a POCO - it's up to you.
