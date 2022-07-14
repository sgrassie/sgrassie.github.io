---
layout: post
title: Introduction to command line parsing with Oakton
description: Starting a jekyll blog automation too and parsing the command line with Oakton
tags: [c#,oakton,command line]
featured_image: /assets/images/introduction-to-command-line-parsing-with-oakton.webp
image: /assets/images/introduction-to-command-line-parsing-with-oakton.webp
featured: False
hidden: False
published: 14/07/2022
ispublished: True
---
In the introductory post to this series, I ended with issuing a command to initialise a new console project, `BlogHelper9000`. It doesn't matter how you create your project, be it from Visual Studio, Rider or the terminal, the end result is the same, as the templates are all the same.

With the new .net 6 templates, the resulting `Program.cs` is somewhat sparse, if you discount the single comment then all you get in the file is a comment and a `Console.WriteLine("Hello, World!");`, thanks to all the new wizardry in the latest versions of the language and the framework.

Thanks to this new fangled sorcery, the app still has a static main method, you just don't need to see it, and as such, the `args` string array is still there. For very simple applications, this is all you really need to do. However, once you get past a few commands, with a few optional flags, things can get complicated, fast. This can into a maintenance headache.

In the past I've written my own command line parsing abstractions, I've used Mono.Options and other libraries, and I think I've finally settled on [Oakton](https://jasperfx.github.io/oakton/) as my go to library for quickly and easily adding command line parsing to a console application. It's intuitive, easy to use and easy to maintain. This means you can easily introduce it into a team environment and have everyone understand it immediately.

## Setup Command loading
After following Oakton's [getting started documentation](https://jasperfx.github.io/oakton/documentation/getting_started/), you can see how easy it is to get going with a basic implementation. I recommended introducing the ability to have both synchronous and asynchronous commands able to be executed, and you achieve this by a small tweak to the `Program.cs` and taking into consideration the top-level statements in .net 6, like this:

{% highlight csharp %}
using System.Reflection;

var executor = CommandExecutor.For(_ =>{
    _.RegisterCommands(typeof(Program).GetTypeInfo().Assembly);
});

var result = await executor.ExecuteAsync(args);
return result;
{% endhighlight %}

In .net 5, or if you don't like top-level statements and have a `static int Main` you can make it `static Task<int> Main` instead and return the `executor.ExecuteAsync` instead of awaiting it.

## Base classes
In some console applications, different commands can have the same optional flags, and I like to put mine in a class called `BaseInput`. Because I know I'm going to have several commands in this application, I'm going to add some base classes so that the different commands can share some of the same functionality. I've also used this in the past to, for example, create a database instance in the base class, which is then passed into each inheriting command. It's also a good place to add some common argument/flag validation.

What I like to do is have an abstract base class, which inherits from the Oakton command, and add an abstract `Run` method to it, and usually a `virtual bool ValidateInput` too; these can then be overriden in our actual Command implementations and have a lot of nice functionality automated for us in a way that can be used across all Commands. 

Some of the detail of these classes are elided, to stop this from being a super long post, you can see all the details in the Github repo.

{% highlight csharp %}
public abstract class BaseCommand<TInput> : OaktonCommand<TInput>
    where TInput : BaseInput
{
    public override bool Execute(TInput input)
    {
        return ValidateInput(input) && Run(input);
    }

    protected abstract bool Run(TInput input);

    protected virtual bool ValidateInput(TInput input)
    {
        /* ... */
    }
}
{% endhighlight %}

This ensures that all the Commands we implement can optionally decide to validate the inputs that they take in, simply by overriding `ValidateInput`.

The async version is exactly the same... except async:

{% highlight csharp %}
public abstract class AsyncBaseCommand<TInput> : OaktonAsyncCommand<TInput>
    where TInput : BaseInput
{
    public override Task<bool> Execute(TInput input)
    {
        return ValidateInput(input) && Run(input);
    }

    protected abstract Task<bool> Run(TInput input);

    protected virtual Task<bool> ValidateInput(TInput input)
    {
        /* ... */
    }
}
{% endhighlight %}

There is an additional class I've not yet shown, which adds some further reusable functionality between each base class, and that's the `BaseHelper` class. I've got a pretty good idea that any commands I write for the app are going to operate on posts or post drafts, which in jekyll are stored in `_posts` and `_drafts` respectively. Consequently, the commands need an easy way of having these paths to hand, so a little internal helper class is a good place to put this shared logic.

{% highlight csharp %}
internal class BaseHelper<TInput> where TInput : BaseInput
{
    public string DraftsPath { get; }

    public string PostsPath { get;  }

    private BaseHelper(TInput input)
    {
        DraftsPath = Path.Combine(input.BaseDirectoryFlag, "_drafts");
        PostsPath = Path.Combine(input.BaseDirectoryFlag, "_posts");
    }

    public static BaseHelper<TInput> Initialise(TInput input)
    {
        return new BaseHelper<TInput>(input);
    }

    public bool ValidateInput(TInput input)
    {
        if (!Directory.Exists(DraftsPath))
        {
            ConsoleWriter.Write(ConsoleColor.Red, "Unable to find blog _drafts folder");
            return false;
        }

        if (!Directory.Exists(PostsPath))
        {
            ConsoleWriter.Write(ConsoleColor.Red, "Unable to find blog _posts folder");
            return false;
        }

        return true;
    }
}
{% endhighlight %}

This means that our base class implementations can now become:

{% highlight csharp %}
private BaseHelper<TInput> _baseHelper = null!;
protected string DraftsPath => _baseHelper.DraftsPath;
protected string PostsPath => _baseHelper.PostsPath;

public override bool Execute(TInput input)
{
    _baseHelper = BaseHelper<TInput>.Initialise(input);
    return ValidateInput(input) && Run(input);
}

protected virtual bool ValidateInput(TInput input)
{
    return _baseHelper.ValidateInput(input);
}
{% endhighlight %}

{% include note.html content="Note the `null!`, where I am telling the compiler to ignore the fact that `_baseHelper` is being initialised to null, as I know better." %}

This allows each command implementation to hook into this method and validate itself automatically.

## First Command

Now that we have some base classes to work with, we can start to write our first command. If you check the history in the repo, you'll see this wasn't the first command I actually wrote... but it probably should have been. In any case, it only serves to illustrate our first real command implementation.

{% highlight csharp %}
public class InfoCommand : BaseCommand<BaseInput>
{
    public InfoCommand()
    {
        Usage("Info");
    }

    protected override bool Run(BaseInput input)
    {
        var posts = LoadsPosts();
        var blogDetails = new Details();

        DeterminePostCount(posts, blogDetails);
        DetermineDraftsInfo(posts, blogDetails);
        DetermineRecentPosts(posts, blogDetails);
        DetermineDaysSinceLastPost(blogDetails);

        RenderDetails(blogDetails);

        return true;
    }

    /**...*/
}
{% endhighlight %}

`LoadPosts` is a method in the base class which is responsible for loading the posts into memory, so that we can process them and extract meaningful details about the posts. We put store this information in a `Details` class, which is what we ultimately use to render the details to the console. You can see the details of these methods in the github repository, however they all boil down to simple Linq queries.

## Summary
In this post we've seen how to setup Oakton and configure a base class to extend the functionality and give us more flexibility, and an initial command. In subsequent posts, we'll cover more commands and I'll start to use the utility to tidy up metadata across all the posts in the blog and fix things like images for posts.