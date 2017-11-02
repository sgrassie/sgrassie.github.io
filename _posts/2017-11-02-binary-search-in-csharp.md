---
layout: post
title: Binary search in C#
---
# Introduction
Binary search is the classic search algorithm, and I remember implementing it in C at University. As an experiment I'm going to implement it in C# to see if the line of business applications I usually build have rotted my brain.

# Algorithm
As [Wikipedia explains](https://en.wikipedia.org/wiki/Binary_search_algorithm#Procedure), Binary Search follows this procedure:

Given an array A of n elements with values or records A0, A1, ..., An−1, sorted such that A0 ≤ A1 ≤ ... ≤ An−1, and target value T, the following subroutine uses binary search to find the index of T in A.

1. Set L to 0 and R to n − 1.
2. If L > R, the search terminates as unsuccessful.
3. Set m (the position of the middle element) to the floor (the largest previous integer) of (L + R) / 2.
4. If Am < T, set L to m + 1 and go to step 2.
5. If Am > T, set R to m − 1 and go to step 2.
6. Now Am = T, the search is done; return m.

This is actually Knuth's algorithm, from _The Art of Computer Programming_ as stated in the footnote on the Wikipedia article.

# Implementation

It's worth noting that this is merely a fun exercise, and that .net has an implementation in [Array.BinarySearch](https://docs.microsoft.com/en-gb/dotnet/api/system.array.binarysearch?view=netframework-4.7.1#System_Array_BinarySearch_System_Array_System_Object_) which is much better than the implementation below and I would always use that instead.

It's also worth mentioning that I'm cheating a little bit and assuming that the array is _already_ sorted, and that it only works on ```int```'s.

## My implementation

{% highlight csharp %}
public class BinarySearch
{
    private int[] _array;

    public BinarySearch(int[] array) => _array = array;

    public int Search(int term)
    {
        var l = 0;
        var r = _array.Length - 1;

        while (l <= r)
        {
            var mid = (l + r) / 2;

            if(_array[mid] < term)
            {
                l = mid+1;
            }
            else if (_array[mid] > term)
            {
                r = mid - 1;
            }
            else
            {
                return mid;
            }
        }

        return -1;
    }
}
{% endhighlight %}    

## Console runner

Here is the console runner:

{% highlight csharp %}
class Program
{
    static string _message = "Found term {0} at position {1}";

    static void Main(string[] args)
    {
        var integers = new []{1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        var searcher = new BinarySearch(integers);

        var result = searcher.Search(11);
        Console.WriteLine(_message, 11, result);

        result = searcher.Search(0);
        Console.WriteLine(_message, 0, result);

        result = searcher.Search(6);
        Console.WriteLine(_message, 6, result);
    }
}
{% endhighlight %}    

Here is the output:

{% highlight bash %}
nostromo:sandbox stuart$ dotnet run
Found term 11 at position -1
Found term 0 at position -1
Found term 6 at position 5
nostromo:sandbox stuart$
{% endhighlight %}
