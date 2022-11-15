---
layout: post
title: Simple YAML Parser Refactoring
tags: [C#,yaml]
featured_image: /assets/images/simple-yaml-parser-refactoring.webp
image: /assets/images/simple-yaml-parser-refactoring.webp
featured: False
hidden: False
published: 15/11/2022
ispublished: True
---
After reviewing the code for the simple YAML parser I wrote, I decided it was getting a little messy, so before continuing, I decided to refactor it a little bit.

The simples thing to do was to separate the serialisation and the deserialisation into separate classes, and simple call those from within the `YamlConvert` class in the existing methods. This approach tends to be what other JSON and YAML libraries do, with added functionality such as being able to control aspects of the serialisation/deserialisation process for specific types.

I currently don't need, or want, to do that, as I'm taking a much more brute force approach - however it is something to consider for a future refactor. Maybe.

I ended up with the following for the `YamlConvert`:

{% highlight csharp %}
public static class YamlConvert
{
    private static YamlSerialiser Serialiser;
    private static YamlDeserialiser Deserialiser;
    
    static YamlConvert()
    {
        Serialiser = new YamlSerialiser();
        Deserialiser = new YamlDeserialiser();
    }
    
    public static string Serialise(YamlHeader header)
    {
        return Serialiser.Serialise(header);
    }

    public static YamlHeader Deserialise(string filePath)
    {
        if (!File.Exists(filePath)) throw new FileNotFoundException("Unable to find specified file", filePath);

        var content = File.ReadAllLines(filePath);

        return Deserialise(content);
    }

    public static YamlHeader Deserialise(string[] rawHeader)
    {
        return Deserialiser.Deserialise(rawHeader);
    }
}
{% endhighlight %}

It works quite well, as it did before, and looks a lot better. There is no dependency configuration to worry about, as I mentioned above I'm not worried about swapping out the serialisation/deserialisation process at any time.