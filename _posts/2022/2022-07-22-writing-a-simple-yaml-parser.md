---
layout: post
title: Writing a simple YAML parser
tags: [c#,yaml,parsing]
featured_image: /assets/images/writing-a-simple-yaml-parser.webp
image: /assets/images/writing-a-simple-yaml-parser.webp
featured: False
hidden: False
published: 22/07/2022
ispublished: True
---
The next thing to do to get BlogHelper9000 functional is to write a command which provides some information about the posts in the blog. I want to know:

- How many published posts there are
- How many drafts there are
- A short list of recent posts
- How long it's been since a post was published

I also know that I want to introduce a command which will allow me to fix the metadata in the posts, which is a little messy. I've been inconsistently blogging since 2007, originally starting off on a self-hosted python blog I've forgot the name of before migrating to Wordpress, and then migrating to a short lived .net static site generator before switching over to Jekyll.

Obviously, Markdown powered blogs like Jekyll have to provide non-markdown metadata in each post, and for Jekyll (and most markdown powered blogs) that means: YAML.

## Parse that YAML
There are a couple of options when it comes to parsing YAML. One would be to use [YamlDotNet](https://github.com/aaubry/YamlDotNet) which is a stable library which conforms with V1.1 and v1.2 of the YAML specifications.

But where is the fun in that?

I've defined a POCO called `YamlHeader` which I'm going to use to use as the in-memory object to represent the YAML metadata header at the top of a markdown file.

If we take a leaf from different JSON converters, we can define a `YamlConvert` class like this:

{% highlight csharp %}
public static class YamlConvert
{
    public static string Serialise(YamlHeader header)
    {
    }

    public static YamlHeader Deserialise(string filePath)
    {
    }
}
{% endhighlight %}

With this, we can easily serialise a `YamlHeader` into a string, and deserialise a file into a `YamlHeader`.

###Deserialise
Deserialising is the slight more complicated of the two, so lets start with that.

Our first unit test looks like this:

{% highlight csharp %}
    [Fact]
    public void Should_Deserialise_YamlHeader()
    {
        var yaml = @"---
layout: post
title: 'Dynamic port assignment in Octopus Deploy'
tags: ['build tools', 'octopus deploy']
featured_image: /assets/images/posts/2020/artem-sapegin-b18TRXc8UPQ-unsplash.jpg
featured: false
hidden: false
---
post content that's not parsed";
        
        var yamlObject = YamlConvert.Deserialise(yaml.Split(Environment.NewLine));

        yamlObject.Layout.Should().Be("post");
        yamlObject.Tags.Should().NotBeEmpty();
    }

{% endhighlight %}

This immediately requires us to add an overload for `Deserialise` to the `YamlConvert` class, which takes a `string[]`. This means our implementation for the first `Deserialise` method is simply:

{% highlight csharp %}
public static YamlHeader Deserialise(string filePath)
{
    if (!File.Exists(filePath)) throw new FileNotFoundException("Unable to find specified file", filePath);

    var content = File.ReadAllLines(filePath);

    return Deserialise(content);
}
{% endhighlight %}

Now we get into the fun part. And a big caveat: I'm not sure if this is the best way of doing this, but it works for me and that's all I care about.

Anyway. A YAML header block is identified by a single line of only `---` followd by `n` lines of YAML which is signified to have ended by another single line of only `---`. You can see this in the unit test above.

The algorithm I came up with goes like this:

{% highlight console %}
For each line in lines:
  if line is '---' then
    if header start marker not found then
      header start marker found
      continue
     break loop
    store line
  parse each line of found header
{% endhighlight %}

So in a nutshell, it loops through each line in the file, look for the first `---` to identify the start of the header, and then until it hits another `---`, it gathers the lines for further processing.

Translated into C#, the code looks like this:

{% highlight csharp %}
public static YamlHeader Deserialise(string[] fileContent)
{
    var headerStartMarkerFound = false;
    var yamlBlock = new List<string>();

    foreach (var line in fileContent)
    {
        if (line.Trim() == "---")
        {
            if (!headerStartMarkerFound)
            {
                headerStartMarkerFound = true;
                continue;
            }

            break;
        }

        yamlBlock.Add(line);
    }
        
    return ParseYamlHeader(yamlBlock);
}
{% endhighlight %}
This is fairly straightforward, and isn't where I think some of the problems with the way it works actually are - all that is hidden behind `ParseYamlHeader`, and is worth a post on its own.