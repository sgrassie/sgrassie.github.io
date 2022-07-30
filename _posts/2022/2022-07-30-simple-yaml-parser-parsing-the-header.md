---
layout: post
title: Simple YAML parser - parsing the header
tags: [C#,yaml]
featured_image: /assets/images/simple-yaml-parser-parsing-the-header.webp
image: /assets/images/simple-yaml-parser-parsing-the-header.webp
featured: False
hidden: False
published: 30/07/2022
ispublished: True
---
Previously we left off with a method which could parse the YAML header in one of our markdown files, and it was collecting each line between the `---` header marker, for further processing.

One of the main requirements for the overall `BlogHelper9000` utility is to be able to standardise the YAML headers in each source markdown file for a post. Some of the posts had a mix of different tags, that were essentially doing the same thing, so one of the aims is to be able to collect those, and transform the values into the correct tags.

In order to achieve this, we can specify a collection of the valid header properties up front, and also a collection of the 'other' properties that we find, which we can hold for further in the process when we've written the code to handle those properties. The `YamlHeader` class has already been defined, and we can use a little reflection to load that class up and pick the properties out.

{% highlight csharp %}
private static Dictionary<string, object?> GetYamlHeaderProperties(YamlHeader? header = null)
{
    var yamlHeader = header ?? new YamlHeader();
    return yamlHeader.GetType()
        .GetProperties(BindingFlags.DeclaredOnly | BindingFlags.Public | BindingFlags.Instance)
        .Where(p => p.GetCustomAttribute<YamlIgnoreAttribute>() is null)
        .ToDictionary(p =>
        {
            var attr = p.GetCustomAttribute<YamlNameAttribute>();

            return attr is not null ? attr.Name.ToLower() : p.Name.ToLower();
        }, p => p.GetValue(yamlHeader, null));
}
{% endhighlight %}

We need to be careful to ignore collecting properties that are not part of the YAML header in markdown files, but that we use in the `YamlHeader` that we can use when doing further processing - such as holding the 'extra' properties that we'll need to match up with their valid counterparts in a further step. Thus we have the custom `YamlIgnoreAttribute` that we can use to ensure we drop properties that we don't care about. We also need to ensure that we can match up C# property names with the actual YAML header name, so we also have the `YamlNameAttribute` to handle this.

Then we just need a way of parsing the individual lines and pulling the header name and the value out.

{% highlight csharp %}
(string property, string value) ParseHeaderTag(string tag)
{
    tag = tag.Trim();
    var index = tag.IndexOf(':');
    var property = tag.Substring(0, index);
    var value = tag.Substring(index+1).Trim();
    return (property, value);
}
{% endhighlight %}

Here we just return a simple tuple after doing some simple substring manipulation, which is greatly helped by the header and its value always being seperated by ':'.

Then if we put all that together we can start to parse the header properties.

{% highlight csharp %}
private static YamlHeader ParseYamlHeader(IEnumerable<string> yamlHeader)
{
    var parsedHeaderProperties = new Dictionary<string, object>();
    var extraHeaderProperties = new Dictionary<string, string>();
    var headerProperties = GetYamlHeaderProperties();

    foreach (var line in yamlHeader)
    {
        var propertyValue = ParseHeaderTag(line);

        if (headerProperties.ContainsKey(propertyValue.property))
        {
            parsedHeaderProperties.Add(propertyValue.property, propertyValue.value);
        }
        else
        {
            extraHeaderProperties.Add(propertyValue.property, propertyValue.value);
        }
    }

    return ToYamlHeader(parsedHeaderProperties, extraHeaderProperties);
{% endhighlight %}

All we need to do is, to setup up some dictionaries to hold the header properties, get the dictionary of valid header properties, and then loop through each line, parsing the header tag and verifying whether the property is a 'valid' one that we definitely know we want to keep, and or one we need to hold for further processing. You'll noticed in the above code, that it's missing an end brace: this is deliberate, because the `ParseHeaderTag` method and `ToYamlHeader` method are both nested methods.

Reading through the code to write this post has made me realise that we can do some refactoring to make this look a little nicer.

So we'll look at that next.