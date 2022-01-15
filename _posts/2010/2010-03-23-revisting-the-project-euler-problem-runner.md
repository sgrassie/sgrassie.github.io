---
layout: post
title: Revisting the Project Euler problem runner
description: 
tags: ['Design Patterns','Euler','Java','Project Euler']
featured_image: /assets/images/2010-03-23-revisting-the-project-euler-problem-runner.png
image: /assets/images/2010-03-23-revisting-the-project-euler-problem-runner.png
hidden: False
published: 23/03/2010
ispublished: True
---
I'm sure that you must have heard about <a title="Project Euler website" href="http://projecteuler.net/" target="_blank">Project Euler</a>, which "is a series of challenging mathematical/computer programming problems that  will require more than just mathematical insights to solve". I have blogged about tackling the Project Euler problems <a href="http://temporalcohesion.co.uk/2008/08/22/building-the-project-euler-framework-part-1/">before</a>, and at the time, I developed a simple program to try to automate running the problems.

That was about 18 months ago, I've learned a lot since then and I think that it is high time to take a look back at the code and see if I can spot if there is any room for improvement.
<h2>The current project</h2>
[caption id="attachment_191" align="alignleft" width="240" caption="Current structure"]<a href="http://temporalcohesion.co.uk/wp-content/uploads/2010/03/eulerprojectold.png"><img class="size-medium wp-image-191 " title="eulerprojectold" src="http://temporalcohesion.co.uk/wp-content/uploads/2010/03/eulerprojectold-300x241.png" alt="The current structure of the project" width="240" height="193" /></a>[/caption]

Let's have a look at how I structured the project when I set it up. The first thing that you will notice, is that I messed up the package names. It should be "uk.co", and not "co.uk", according to the <a title="Java Language specification on sun.com" href="http://java.sun.com/docs/books/jls/third_edition/html/packages.html#7.7" target="_blank">Java language specification</a>. A minor point, and not really a big deal, we can easily sort it out.

Something else I did, was lump everything together into the same project and package - the runner program, the utils (e.g. helper classes that you write as you progress through problems), resources and the problems themselves.

I don't think that this was necessarily a bad idea at the time, I don't think that it is inherintly a bad idea now, it's logical for everything to share the same package. Or should I say, it <em>was </em>logical for everything to share the same package.

I am going to put the code for the problem runner onto Github, but I don't want to share the answers to the problems. To answer your question, I think that it goes against the point of Project Euler, that of having a set of problems that the inquisitive person can solve with some math and programming. I have also found that the problems also help in getting comfortable with the syntax of a new programming language - after all the solutions to the problems remain the same, however the implementation is subtley different depending on the language being used.
<h2>Re-Design</h2>
Examining the current code and design, we can immediately identify some changes which we are going to make  I'm going to seperate the uk.co.temporalcohesion.euler package into three packages, which are more distinct from each other, but still keep them all in the same project. Why? Well, it is obvious that there are three tasks which we have to manage:
<ol>
	<li>Running problems.</li>
	<li>Provide an API to run the problems.</li>
	<li>Store the problems somewhere</li>
</ol>
To shed some light on my thinking here, lets examine these in more detail. This will also identify areas of possible improvement in the design.

1. I want someway of consistenly running a problem (or group of problems) to test the solution(s) to (a) Project Euler problem(s). This is basically our console runner application, which doesn't have to know exactly how this happens, it recieves input, and returns output - how that output is generated is irrelevant to it.

2. I want an easy to use API which I can leverage to easily implement the solution to a Project Euler problem, so that I don't have to worry about re-writing all the input/output code over and over again. I also want to be able to share this API, without sharing the answers to the problems themselves.

3. I need to have somewhere I can put the answers to the problems, and associated helper classes (Prime number generators, etc) which I can easly backup, and easily run the problems from.

These are sounding a bit like user stories, and I suppose they are. They can be formalised as so:
<blockquote>
<p style="text-align: left;">As a Problem Solver, I want to run the solution, or group of solutions, to a Project Euler problem.</p>
<p style="text-align: left;">As a problem solver, I want to concentrate implementing the solution to a euler problem, not on implementing input/output for the problem.</p>
<p style="text-align: left;">As a problem solver, I want a place to develop and store the problems, from which I can run the problems to test the solution.</p>
</blockquote>
<p style="text-align: left;">Fairly concise and simple requirements, which we will revisit later. We still have to examine the code in a little more detail so that we can identify exactly what it is we are going to refactor.</p>

<h2 style="text-align: left;">Code review</h2>
The main class to examine is Euler, in Euler.java.  The first to say without even looking at the code, is that the name is fairly awful. Then when we examine the code in more detail, we can see the name is even worse. The class has the main entry point for the program, as well as all the code to actually run the problems. This class is doing everything, there is definately no Seperation of Concerns. It is responsible for accepting user input, loading and running the problems and displaying the output. Wow.

The class is designed around the <a title="Command Patter on Wikipedia" href="http://en.wikipedia.org/wiki/Command_pattern" target="_blank">Command Pattern</a>, and it has worked quite well. Looking at it now, a further two patterns could be used, namely <a title="Strategy patter on Wikipedia" href="http://en.wikipedia.org/wiki/Strategy_pattern" target="_blank">Strategy </a>and <a title="Template method pattern on Wikipedia" href="http://en.wikipedia.org/wiki/Template_method_pattern" target="_blank">Template method</a>.I'm still in two minds about refactoring the design pattern in use, but that discussion can be put off for the time being, as I have other things to concern me.

There are 144 SLoC, not a massive amount, but when you consider the above and what the class should be doing, then it is clearly a bit weighty. There are 7 functions in total, not counting the constructor, not a massive count, but as the SLoC count indicates, some of those functions are a bit long. The worst offender is the following method.

<pre class="lang:java decode:1 " >

private void loadClasses() {
 InputStream fis = null;

 Properties p = new Properties();

 try {
 fis = ClassLoader
 .getSystemResourceAsStream(&amp;quot;co/uk/temporalcohesion/euler/resources/problems.properties&amp;quot;);
 p.load(fis);

 Enumeration&amp;lt;?&amp;gt; e = p.propertyNames();
 while (e.hasMoreElements()) {
 String key = (String) e.nextElement();
 String value = (String) p.getProperty(key);

 Object o = Class.forName(value).newInstance();
 if( ( o != null) &amp;amp;&amp;amp; (o instanceof Problem)){
 Problem problem = (Problem)o;
 problems.put(Integer.parseInt(key), problem);
 }
 }
 }

 catch (FileNotFoundException e) {
 e.printStackTrace();
 } catch (IOException e) {
 e.printStackTrace();
 } catch (ClassNotFoundException e) {
 e.printStackTrace();
 } catch (InstantiationException e) {
 e.printStackTrace();
 } catch (IllegalAccessException e) {
 e.printStackTrace();
 } catch (ClassCastException e) {

 }
 finally {
 try {
 fis.close();
 } catch (IOException e) {
 e.printStackTrace();
 }
 }
 }

</pre>


Wow, that's a lot of code for something which is relatively straightforward. It's not exactly easy to read, and it violoates the Single Responsibility Principle: by loading in and enumerating over a properties file, instantiating new instances of problem classes, and handling all the exceptions which can be thrown. There will definately be some room for improvement there.

Getting back to the main <em>Euler </em>class as a whole, there is an even worse problem...

There are no unit tests!

This is a disastrous situation, because it means I cannot refactor the class with any confidence. The me of 18 months ago has a lot to answer for. I've got a bit of work to do. Check back next time to see how I've progressed things.
<p style="text-align: left;"></p>
