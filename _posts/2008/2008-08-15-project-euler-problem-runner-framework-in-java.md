---
layout: post
title: Project Euler problem runner framework in Java
description: 
tags: [Coding,Java,Project Euler]
featured_image: /assets/images/2008-08-15-project-euler-problem-runner-framework-in-java.png
image: /assets/images/2008-08-15-project-euler-problem-runner-framework-in-java.png
hidden: False
published: 15/08/2008
ispublished: True
---
Recently, I've been working on the problems on <a title="Projec Euler!" href="http://projecteuler.net/" target="_blank">Project Euler</a>, and I've done the first 16 problems (in Java), although I will freely admit that I had help on two of the most difficult ones. I do intend on continuing to do the problems, and I am currently working on problem 17, however I paused to write the problem runner framework I'm going to talk about in this post.

What I had started to do, was to write each solution in it's own Class, and have the main(String[] args) method output the answer. This was fine for the first few problems, and I could have continued to do it like that for all of the problems - however I wanted to be able to run all the problems at once, or a specific problem, and get the answer(s), or not show the answers but still get the timings.

After chatting with one of the Senior Dev's at my job, he pointed out that what I wanted to do was basically the <a title="Command Pattern on Wikipedia" href="http://en.wikipedia.org/wiki/Command_pattern" target="_blank">Command</a> pattern. He sent me some example code, although once he'd said "Command pattern" I knew exactly what it was that I needed to do.

Thus, my problem runner framework was born, and whilst fairly simple, it does employ some techniques that the beginning Java developer might not be aware of. So, what I am going to (try) to do over the next few weeks is write a series of posts that show how I wrote it, partly just to have some content on my blog (which I am really, really lazy at updating), secondly to see how good I am at explaining something like this, and thirdly - it might actually be useful to someone.

The output of the problem runner framework looks like this:

{% highlight console %}
C:development&gt;java -jar euler.jar -noanswers
Project Euler : Problem Runner - http://projecteuler.net/

Problem: 1. Time: 0.0s
Problem: 2. Time: 0.0s
Problem: 3. Time: 0.347s
Problem: 4. Time: 0.307s
Problem: 5. Time: 63.803s
Problem: 6. Time: 0.0s
Problem: 7. Time: 0.335s
Problem: 8. Time: 0.0020s
Problem: 9. Time: 34.178s
Problem: 10. Time: 0.369s
Problem: 11. Time: 1.218275999017E9s
Problem: 12. Time: 0.021s
Problem: 13. Time: 0.0s
Problem: 14. Time: 21.717s
Problem: 15. Time: 0.0s
Problem: 16. Time: 0.0010s
{% endhighlight %}

As you can see, I have output a list of the problems, and the time taken to solve the problem, but I haven't shown the answer.

Well, you didn't think I was going to tell you the answers... Did you?

This also shows that I need to work on problem 5, 9 and 14 to try and optimise the solution to speed up performance, Project Euler says that problems "should" take under a minute to solve, however I'd still like to improve the code.
