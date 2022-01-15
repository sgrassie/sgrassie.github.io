---
layout: post
title: 'Parsing Yaml Frontmatter in F#'
description: 'Using F# to parse Yaml frontmatter block from a Jekyll blog using YamlDotNet'
tags: [F#,Jekyll,Yaml]
featured_image: /assets/images/2020-08-03-parsing-yaml-frontmatter-in-fsharp.png
image: /assets/images/2020-08-03-parsing-yaml-frontmatter-in-fsharp.png
featured_image_thumbnail: 
featured: False
hidden: False
published: 03/08/2020
ispublished: True
---
As part of modernisng, updating and generally overhauling my blog, I thought it would be nice to add some consistancy to the Yaml front matter used by Jekyll. For those who do not know, Jekyll uses Yaml front matter blocks to process any file which contains one as a special file. The front matter can contain variables in the form `foo: value`. Jekyll itself defines some predefined globabl variables and variables for posts, but anything else is valid and can be use in Liquid tags.

I wondered if I could write some F# to:

1. Load all the markdown files.
2. Parse all the front matter.
3. Modify the front matter to drop variables no longer required by a theme.
4. Update the front matter with new variables which are understand by the current theme.
5. Randomly assign a path to a header image file for each post which doesn't already have one.
4. Write the front matter back to its post.

Fairly straightforward requirements.

## Loading and parsing the front matter
I'm using [YamlDotNet](https://github.com/aaubry/YamlDotNet) to do most of the heavy lifting. I think could also have used the [FSharp.Configuration Type Provider](https://fsprojects.github.io/FSharp.Configuration/YamlConfigProvider.html), but I'm not sure that it would have done exaclty what I wanted.

I'm just writing this in an F# script, hosted in a project. After adding the YamlDotNet NuGet package, we can reference it and get to work:

{% highlight fsharp %}
#r "../../.nuget/packages/YamlDotNet/8.1.2/lib/netstandard2.1/YamlDotNet.dll"

open System.IO
open System.Text.RegularExpressions
open YamlDotNet.Serialization
open YamlDotNet.Serialization.NamingConventions

let path = "../sgrassie.github.io/_posts"
{% endhighlight %}
Here, we reference the package, and then open various namespaces for use later on. The code for my blog is kept in a separate folder, relative to the project which has got the fsharp scripts I'm writing abot in it. This is nice and easy.

{% highlight fsharp %}
type FrontMatter() =
    member val Title = "" with get, set
    member val Description = "" with get, set
    member val Layout = "" with get, set
    member val Tags = [|""|] with get, set
    member val Published = "" with get, set
    member val Category = "" with get, set
    member val Categories = "" with get, set
    member val Metadescription = "" with get, set
    member val Series = "" with get, set
    member val Featured = false with get, set
    member val Hidden = false with get, set
    member val Image = "" with get, set
    [<YamlMember(Alias = "featured_image", ApplyNamingConventions = false)>]
    member val FeaturedImage = "" with get, set
    [<YamlMember(Alias = "featured_image_thumbnail", ApplyNamingConventions = false)>]
    member val FeaturedImageThumbnail = "" with get, set
    [<YamlIgnore>]
    member val MarkdownFilePath = "" with get, set
{% endhighlight %}

This is a class with auto-implemented properties. You can see three attributes in use. The `YamlMember` attribute allows us to alias a property in Yaml which doesn't follow the CamelCase convention we configured the deserialiser with. I think that a C# version of this would look pretty much the same.

{% highlight fsharp %}
let deserializer = DeserializerBuilder()
                     .WithNamingConvention(CamelCaseNamingConvention.Instance)
                     .Build()
{% endhighlight %}
This initialises the YamlDotNet deserialiser, and is pretty much almost exactly how you would do this in C#. To deserialise something, we need some Yaml. When I was testing this, I got an error in YamlDotNet that was pretty weird and essentially means that it can't parse the file, and it turns out it's because all the other stuff outside the Yaml front matter that is upsetting it.

{% highlight fsharp %}
let expression = "(?:---)(?<yaml>[\\s\\S]*?)(?:---)"
{% endhighlight %}

Oh regex, I do love thee.

Very simply, this regex will parse everything in a file between two `---` blocks, into a named `Yaml` group. We now have actual front matter, we still need to parse into an object.

{% highlight fsharp %}
let extractFrontmatter filePath =
    let file = File.ReadAllText(filePath)
    let result = Regex.Match(file, expression).Groups.["yaml"].Value
    let frontMatter =
        let frontMatter = deserializer.Deserialize<FrontMatter>(result)
        frontMatter.MarkdownFilePath <- filePath
        frontMatter
    frontMatter
{% endhighlight %}
This is a bit more complex so lets unpack it:
1. Pass in the `filePath`.
2. Read all of the text from it.
3. Strip only the front matter from the text.
4. Parse the front matter test with an inner function, which uses the `deserializer`, and return it. Here, we also keep track of the file path (we will need this later).

We also need to load all of the markdown files:

{% highlight fsharp %}
let loadMarkdownFiles path = Directory.EnumerateFiles(path, "*.md", SearchOption.AllDirectories) 
{% endhighlight %}

Notice how those last couple of functions are using 'currying'. It lets us do all of the work in one pipeline:

{% highlight fsharp %}
path |> loadMarkdownFiles |> Seq.map extractFrontmatter |> Seq.iter (fun x -> printfn "%s - %s" x.MarkdownFilePath x.Title)
{% endhighlight %}

This gives us a dataset to work with. Next time we'll continue with the rest of the requirements.