---
layout: post
title: 'Interview Coding Test Solution'
description: 'An interview coding test and solution'
tags: [Csharp]
featured_image: /assets/images/2020-07-27-interview-coding-test-solution.png
image: /assets/images/2020-07-27-interview-coding-test-solution.png
featured_image_thumbnail: /assets/images/posts/2020/artem-sapegin-b18TRXc8UPQ-unsplash.jpg
featured: False
hidden: False
published: 27/07/2020
ispublished: True
---
Many years ago, after working in my first programming job for a couple of years the company was taken over, and coding tests for new hires were introduced. The incumbent developers all decided to take the test, and it was seen as a fun diversion for a couple of hours. 

I don't have access to the actual wording of the requirements given to candidates, but the test required a text file containing around 100k words to be loaded and sorted into the largest set of the longest anagram. For example in the words file I'm using in this blog post, there are 466544 words in the file, 406627 of which are anagrams. The largest set is for a 7 letter anagram, of whih there are 15 words. There are smaller sets of longer anagrams, we're not interested in those. And, it had to run in in less a second. They had three hours to write it, on a computer not connected to the internet. They had access to Java, through Eclipse, C/C++/C# through Visual Studio and Delphi through Embarcadero Studio.

I don't know where the test originally came from - I think it originated in a different company which had been acquired by the same company I now worked for, but I'm not sure. I think the intent of the test was to in part gauge how the candiate reacted to the deadline pressure, part how they could understand the requirements given to them, and lastly what sort of code they wrote.

As it has been a long time and the company no longer recruits after moving most development overseas, so, I'm going to present my solution.

{% include note.html content="Making people sit coding tests during interviews is not good for anyone, and doesn't always guarantee that you'll hire the best person for the job." %}

## The Solution

First we have to load the file, and figure out to generate the anagram and keep track of how many instances of that anagram there are. It turned out for the candidates taking the test that this was the bit that most got stuck on, specifically the short mental leap it took to working out you needed to sort the letters of the word alphabetically to create the key.

{% highlight csharp %}
private static string CreateKey(string word)
{
    var lowerCharArray = word.ToLowerInvariant().ToCharArray();
    Array.Sort(lowerCharArray);
    return new string(lowerCharArray);
}

private static void LoadWords(string filePath, Dictionary<string, List<string>> words)
{
    using (var streamReader = File.OpenText(filePath))
    {
        string s;

        while ((s = streamReader.ReadLine()) != null)
        {
            var key = CreateKey(s);

            if (words.TryGetValue(key, out var set))
            {
                set.Add(s);
            }
            else
        
                var newSet = new List<string> {s};
                words.Add(key, newSet);
            }
        }
    }
}
{% endhighlight %}

`words` is a `Dictionary<string, List<string>>`, which we use to track the count of anagrams. The rest of the file loading is a fairly standard `while` loop over the reader `ReadLine` method, checking the dictionary to see if the anagram has already been found, and if so add the new word to the set, otherwise, add the anagram and create a new list to hold the word(s).

Once we have all the words loaded and matched into sets of anagrams, we can process them to work out which is the largest set with the longest word.


{% highlight csharp %}
private static KeyValuePair<string, List<string>> ProcessAnagrams(Dictionary<string, List<string>> words)
{
    var largestSet = 0;
    var longestWord = 0;
    var foundSet = new KeyValuePair<string, List<string>>();

    foreach (var set in words)
    {
        if (set.Value.Count >= largestSet)
        {
            largestSet = set.Value.Count;

            if (set.Key.Length > longestWord)
            {
                longestWord = set.Key.Length;
                foundSet = set;
            }
            else
            {
                longestWord = 0;
            }
        }
    }

    return foundSet;
}
{% endhighlight %}

Here we simply bruteforce check all of the entries in the dictionary to find the answer. It's not elegant, but it gets the job done. Running it on my Macbook Pro gives:

{% highlight console %}
406627 anagrams processed from 466544 in 00:02:850
File read and key generation in 00:02:829
Anagrams searched in: 00:00:021
Found: 
Key: AEINRST (7), Count: 15
aeinrst
antsier
asterin
eranist
nastier
ratines
resiant
restain
retains
retinas
retsina
stainer
starnie
stearin
Tersina
{% endhighlight %}