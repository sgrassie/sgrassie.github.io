---
layout: post
title: "Building the Project Euler framework, part 1"
description: 
tags: [Coding,Java,Project Euler]
featured_image: /assets/images/2008-08-22-building-the-project-euler-framework-part-1.png
image: /assets/images/2008-08-22-building-the-project-euler-framework-part-1.png
hidden: False
published: 22/08/2008
ispublished: True
---
As promised, here is the first part of the series of posts I hope to write demonstrating how I wrote my problem runner framework for <a title="Project Euler!" href="http://projecteuler.net/" target="_blank">Project Euler</a>.

Firstly, before you continue reading, I suggest that you research the <a title="The Command pattern on Wikipedia" href="http://en.wikipedia.org/wiki/Command_pattern" target="_blank">Command</a> pattern, Google will also provide you with some good sources in your research.

Done? Ok then. It shouldn't matter what IDE you use, I am using Eclipse (ganymede), any IDE should do. If you don't know what an IDE is, then go and find out, and then come back.

<h2>Start Coding</h2>
In your IDE, and following the <a title="Java package naming conventions" href="http://java.sun.com/docs/codeconv/html/CodeConventions.doc8.html" target="_blank">Java package naming conventions</a>, create a package to hold the Project Euler code, for example: co.uk.temporalcohesion.euler.problems. Because we are going to need an interface, also create a package to hold those, as this can help keep things more organised, for example: co.uk.temporalcohesion.euler.interfaces

Let's define that interface

{% highlight java %}
public interface Problem {

	/**
	 * Answer method. Returns the answer for the problem
	 * @return - the integer answer to the problem
	 */
	String answer();

	/**
	 * The problem number.
	 * @return - The number of the problem
	 */
	int id();

	/**
	 * How long does it take to work out the answer?
	 * @return - The time in seconds it takes to work out the answer to the problem
	 */
	double time();
}
{% endhighlight %}

Before we move on an implement that interface in a problem, let's write the basic problem runner itself. We'll need a way to register an instance of a problem, and a way to run the problem and get the answer.

{% highlight java %}
public class Euler {
	private List<Problem> problems = new ArrayList();

	public Euler() {
		problems.add(new One());
	}

	private void run() {
		for (Problem prob : problems) {
			System.out.println("Problem " + prob.id() + ": " + prob.answer());
		}
	}

	public static void main(String[] args) {
		new Euler().run();
	}
}
{% endhighlight %}

That's pretty much all you need for a basic problem runner. You just register an instance of each problem you write into the problems List object in the constructor, and run the program, and it iterates through each Problem in the List, and outputs the answer.

I'm not going to give you the code to problem one, however it is pretty trivial if you know what the modulus operator is used for...

As you can see, the problem runner itself is fairly basic, and does present some immediate areas of improvement, such as running a specific problem.

I'll cover that next time.
