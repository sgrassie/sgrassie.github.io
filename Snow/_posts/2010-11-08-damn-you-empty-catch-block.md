---
title: Damn you empty catch block
published: 08/11/2010
layout: post
category: annoyance,C#,C#,Coding,exception
metadescription: damn-you-empty-catch-block
---
In the code I help maintain in my day job, I see a lot of the following code:
<pre class="brush:csharp">
try
{
/* code */
}
catch(Exception)
{
}
</pre>
I see it in several different languages almost daily. It really frustrates me that my colleagues and predecessors did this. I stamp it out ruthlessly.

<a href="http://blogs.msdn.com/b/clrteam/archive/2009/02/19/why-catch-exception-empty-catch-is-bad.aspx">Here is a great post</a> on why empty catch blocks are bad. Here is a <a href="http://stackoverflow.com/questions/183589/c-windows-forms-best-practice-exception-handling" target="_blank">great question and series of answers</a> on StackOverflow about best practices for exception handling.
