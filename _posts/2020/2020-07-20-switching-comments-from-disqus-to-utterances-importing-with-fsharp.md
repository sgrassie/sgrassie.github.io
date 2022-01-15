---
layout: post
title: 'Switching comments from Disqus to utteranc.es and importing to Github with F#'
description: 'Shows how to export blog comments from Disqus into Github Issues and integrate utterance.es'
tags: [Blog,F#]
featured_image: /assets/images/2020-07-20-switching-comments-from-disqus-to-utterances-importing-with-fsharp.png
image: /assets/images/2020-07-20-switching-comments-from-disqus-to-utterances-importing-with-fsharp.png
featured_image_thumbnail: 
featured: False
hidden: False
published: 20/07/2020
ispublished: True
---
There are lots of blog comment systems, and this blog has used Disqus as the comment system for a long time. I'm not going to go into all the reasons to move away from Disqus, but page load times and wanting more control over your data and being able to respect your readers privacy figure highly. 

Also, this blog is a technical blog focused on software development and associated topics, and this means that anyone who wants to comment on my blog is almost certain to be familar with Github and have an account, and also be as uncomfortable using Disqus as I have been.

I did investigate rolling my own code based on examples from other blogs, who have used some jekyll liquid templates and javascript to pull from the Github API and use it to post comments back to the repo hosting the blog. This has some attraction, but also has a big drawback, which is the authorisation situation to the Github API, as you don't really want your client id and client secret exposed in the repo.

## Enter [utteranc.es](https://utteranc.es)
You can get around this by hosting an app in heroku to use as the postback url so that you can hide the client id and client secret, and there is also [staticman](https://staticman.net/), but none of these seemed as simple as just using utteranc.es

To configure utteranc.es, head over to the website and follow the instructions, and fill out the form to suit you. For the blog post to issue mapping, I chose 'Issue title contains page title', and I also chose to have utteranc.es add a 'Comment' label to the issue it creates in the blog repository. After you do that, you'll get a code snippet generated for you that looks somewhat like this:

{% highlight html %}
<script src="https://utteranc.es/client.js"
        repo="sgrassie/sgrassie.github.io"
        issue-term="title"
        label="Comment"
        theme="github-light"
        crossorigin="anonymous"
        async>
</script>
{% endhighlight %}

Add this to a jekyll include, for example `utterances.html` and then include it in your `post.html` layout at the position you want the blog comments to appear. Most jekyll blog templates have Disqus support, so it will probably just be a simple case of finding where in the layout that Disqus is included, and replacing it.

## Exporting existing comments
If your existing comments are not important to you, then at this point you can stop and enjoy your new Github powered comment system. Personally for me, it's the principle of the thing, and the fact that the comments on my blog belong to me, and the author of the comment. So, we can do something about it.

Disqus allows you to [export your comments](https://help.disqus.com/en/articles/1717164-comments-export), and once you do so, you will get your comments emailed to the email registered with your Disqus account. I've done a lot of work with XML in a previous role, and I think that the Disqus XML export looks... odd. The reason I say that is that each post on your blog appears to be mapped to a `<thread>` element, which contains a bunch of expected metadata about the blog post. I would expect each individual comment to be a nested in a `<comments>` element, but this is not the case. Instead, each individual comment has an entry as a `<post>` element at the same level as the `<thread>`, and they are mapped to each other using and attribute id. I don't think that makes any sense, I'm sure there must be good reasons. I just can't think what might be.

A comment then, looks like this:

{% highlight xml %}
<thread dsq:id="1467739952">
    <id>218 http://temporalcohesion.co.uk/?p=218</id>
    <forum>temporalcohesion</forum>
    <category dsq:id="2467491" />
    <link>http://temporalcohesion.co.uk/2010/10/25/lets-write-an-api-library-for-github/</link>
    <title>Let&amp;#8217;s write an API library for Github</title>
    <message />
    <createdAt>2010-10-25T12:00:24Z</createdAt>
    <author>
        <name>Stuart Grassie</name>
        <isAnonymous>false</isAnonymous>
        <username>stuartgrassie</username>
    </author>
    <isClosed>false</isClosed>
    <isDeleted>false</isDeleted>
</thread>
{% endhighlight %}

An actual comment on this post looks like:

{% highlight xml %}
<post dsq:id="952258229">
    <id>wp_id=25</id>
    <message><![CDATA[<p>Great post Stu!</p>]]></message>
    <createdAt>2010-10-25T22:47:44Z</createdAt>
    <isDeleted>false</isDeleted>
    <isSpam>false</isSpam>
    <author>
        <name>John Sheehan</name>
        <isAnonymous>true</isAnonymous>
    </author>
    <thread dsq:id="1467739952" />
{% endhighlight %}

You can see the way that the `post` element is mapped back to the containing `thread` using the `dsq:id` attribute.

## Parsing the XML
The strange structure of the XML makes it less straightforward to parse the XML, as it means we'll have to do a little bit of work in matching up blog posts and the comments on them. Also very annoying is the fact that a `thread` element doesn't know if it actually has any associated `post` comments.

We can acomplish this fairly easily with a little bit of F# and the FSharp.Data XmlProvider. Setting the provider up is straightforward, here I'm just using a direct reference to the assembly which I'd previously added via NuGet.

{% highlight fsharp %}
#r "../../.nuget/packages/fsharp.data/3.3.3/lib/netstandard2.0/FSharp.Data.dll
open FSharp.Data

type Disqus = XmlProvider<"/Users/stuart/Downloads/temporalcohesion-2020-07-13T20 27 09.014136-all.xml">

type Comment = { Author: string; Message: string; Created: System.DateTimeOffset; ParentThreadId: int64; }
type BlogPost = { Title: string; Url: string; Author: string; ThreadId: int64; Comments : Comment list }

let data = Disqus.Load("/Users/stuart/Downloads/temporalcohesion-2020-07-13T20 27 09.014136-all.xml")
{% endhighlight %}

If you are new to F# (and I'm still fairly new) this might look scary, but it really isn't. After referencing the assembly in the script, we open the FSharp.Data namespace, and then initialise an XmlProvider by passing it the XML the file we're going to parse.

{% include note.html content="Do not do this for really big XML files! See the XmlProvider documentation for more details." %}

That enables the XmlProvider to infer a lot of things about the XML in the file, and then the XmlProvider loads the actual data from the file. Two records are also defined to hold the details about the Threads/Posts that are going to imported, and how multiple comments map refer to a single blog post. These records are analagous to simple C# POCO classes with getters and setters.

With these types ready, we can define a couple of functions to convert the XML into them, and thus do a way with a lot of the extraneous noise from the XML, that we don't really care about.

{% highlight fsharp %}
let toComments posts =
    posts
    |> Seq.filter (fun (post : Disqus.Post) -> not post.IsSpam || not post.IsDeleted)
    |> Seq.map (fun (post : Disqus.Post) -> {Author = post.Author.Name; Message = post.Message; Created = post.CreatedAt; ParentThreadId = post.Thread.Id})
    |> Seq.toArray

let toBlogPosts posts =
    posts
    |> Seq.filter (fun (thread : Disqus.Thread) -> not thread.IsDeleted)
    |> Seq.map (fun (thread : Disqus.Thread) -> {Title = thread.Title; Url = thread.Link.Substring(0, thread.Link.Length - 1); Author = thread.Author.Name; ThreadId = thread.Id; Comments = [] })
{% endhighlight %}

These functions use [currying](https://fsharpforfunandprofit.com/posts/currying/), which as a longtime C# developer I'm still getting the hang of, and that will come in handy shortly. They map the `Disqus` types generated by the XmlProvider into the custom types I defined, taking care to filter out comments we don't want to import and not importing any blog posts which Disqus says have been deleted.

{%include note.html content="I'm not sure the `Seq.filter` in the `toComments` function worked correctly, as I still had to go and manually delete a couple of comments that were marked as spam from the Github Issues" %}

With those functions defined, we need a way of mapping the comments to the correct blog post.

{% highlight fsharp %}
let mapBlogToComments(post, comments) =
    let commentsOnPost = comments 
                         |> Array.filter (fun comment -> comment.ParentThreadId = post.ThreadId) 
                         |> Array.toList
    {post with Comments = commentsOnPost}
{% endhighlight %}

Here we take a single post, and all of the comments, and then use a nested function to grab the set of comments associated to that post, by way of the `ThreadId`. With that written, we can use some more currying to create another function that will do a lot of hard work for us:

{% highlight fsharp %}
let addCommentsToTheirPosts comments = data.Threads |> toBlogPosts |> Seq.map (fun post -> mapBlogToComments(post, comments))
{% endhighlight %}

This function will take the threads, use the `toBlogPosts` method to turn them into `BlogPost` and then map each blog post to the correct comments using the method we've just defined to do that. But where do the `comments` come from? Well, it turns out this currying thing is really quite useful, as it enables all this magic looking `|>`, or 'piping' to happen. 

{% highlight fsharp %}
let toImport = data.Posts
               |> toComments
               |> addCommentsToTheirPosts 
               |> Seq.filter (fun x -> x.Comments.Length > 0)
{% endhighlight %}

Take all the posts data, turn them all into comments, and then pipe that to the `addCommentsToTheirPosts` function, and then filter out blog posts which don't have any comments, as importing those is pointless. All for around 24 lines of code. I know full well the C# it would take do all that, and whilst with C# 8 you could probably get close, I doubt you'd equal 24 lines.

{% include info.html content="Whilst googling for clarification on an aspect of the Octokit.net api, I came across [Removing Disqus and adding GitHub Issue Comments](https://asp.net-hacker.rocks/2018/11/19/github-comments.html), which is essentially what I'm doing here, just in C#." %}

Just to be on the safe side, it's probably a good idea to look through each of the posts and comments that we've now got to just to see if things are matching up correctly.

{% highlight fsharp %}
toImport |> Seq.iter (fun post -> printfn "%s - %s - comments: %d" post.Title post.Url post.Comments.Length)
{% endhighlight %}

Running that will give you an idea of what blog posts are going to be imported, and the number of comments. The first time I ran this, I found some of the blog posts in the Disqus XML import did not have the posts title set, so I was getting duplicated post titles. As there were only three instances of this error, I just manually corrected the XML and re-reran the script to check I had everything correct.

## Uploading to GitHub
So far, so good. Now comes the fun part and something I've yet to do in F#, which is interop with a C# library. It turns out that it's not so hard, but that makes perfect sense when you understand that F# is a .net language, just like C#. A long time ago I started to write an API library for GitHub, but I gave it up in favour of Octokit.net.

{% include warning.html content="The F# which follows looks horrible, and I am certain there must be a cleaner way of doing what I'm about to show, but I don't know what it is." %}

We can easily reference Octokit and open the namespace as before:

{% highlight fsharp %}
#r "../../.nuget/packages/octokit/0.48.0/lib/netstandard2.0/Octokit.dll"
open Octokit
{% endhighlight %}

Then we just need to setup a few variables:

{% highlight fsharp %}
let repo = "sgrassie.github.io"
let githubApp = "foo"
let token = "<your-personal-access-token-here>"
let credentials = Credentials(token)
let header = ProductHeaderValue(githubApp)
let client = GitHubClient(header, Credentials = credentials) 
{% endhighlight %}

These just get us a client to work with, and all I did was just register a new Personal Access Token on my account to use as the password. Notice how with F# you don't need to `new` anything, even though they are classes from a C# assembly. These can then be used in the following function, which I'm gonna prefix with this warning:

{% include warning.html content="I'm still new at F#, I've no idea if what you're avout to see is 'good' F#." %}

It does work though, so just... use at your own caution.

{% highlight fsharp %}
let exportToGithub posts =
    for post in posts do
        System.Threading.Thread.Sleep(2000)
        let issuebody = sprintf "Comment thread for the post [%s](%s)" post.Title post.Url
        printfn "%s" issuebody
        let newIssue = NewIssue(post.Title, Body = issuebody)
        let issue = client.Issue.Create("sgrassie", repo, newIssue) |> Async.AwaitTask |> Async.RunSynchronously
        printfn "New issue created for %s" post.Title
        for comment in post.Comments do
           System.Threading.Thread.Sleep(2000)
           let message = sprintf "Comment by **%s** on **%s** (imported from Disqus):\r\n\r\n%s" comment.Author (comment.Created.ToString("f")) comment.Message
           let newComment = client.Issue.Comment.Create("sgrassie", repo, issue.Number, message) |> Async.AwaitTask |> Async.RunSynchronously
           printfn "    New comment created for %s" comment.Author

toImport |> exportToGithub 
{% endhighlight %}

I'm sure that a more experienced F# person is going to look at that and be like "WTF", but as I said, it does work. I left the `printfn` log messages in, but essentially it loops over each post, waits a couple of seconds and then creates the new issue, and then loops over all of the comments for that post and adds then as comments to the issue. I put the `Thread.Sleep`'s in the there just so I didn't hammer the Github API, but honestly there was that few to import I doubt it would have trigged the rate limit, but I imagine a more popular blog with more comments on the posts woould.