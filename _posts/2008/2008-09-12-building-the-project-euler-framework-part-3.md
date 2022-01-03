---
layout: post
title: Building the Project Euler framework, part 3
tags: [Coding,Java,Project Euler]
hidden: False
published: 12/09/2008
ispublished: True
---
In part 2, I showed you an improved, although still pretty basic problem runner framework for Project Euler. I did leave out some things though, and I'm going to try and explain them now.

Firstly, I haven't really shown how I use the Problem interface. You can see it in part 1 of this series of posts. In Eclipse, you can create a new class in a package, which should bring up the "New Java Class" dialog. Give the class a name - for Project Euler problems I've chosen to name them "One", "Two", "Three" etc. You can then add an interface that the class is to implement, click 'Add', and type in Problem. You can also choose some methods to stub out, tick 'public static void main(String[] args)'. Click Ok, and you should get something like this:

{% highlight java %}
package co.uk.temporalcohesion.euler.problems;

import co.uk.temporalcohesion.euler.interfaces.Problem;

public class One implements Problem {

	public String answer() {
		// TODO Auto-generated method stub
		return null;
	}

	public int id() {
		// TODO Auto-generated method stub
		return 0;
	}

	public double time() {
		// TODO Auto-generated method stub
		return 0;
	}

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub

	}

}
{% endhighlight %}

I can hear you asking why am I including then main(String[] args) function if we already have a class that is capable of running the problems (the main Euler class)? Well, what I do to create is to create a Euler object in the problems main method, and get it to run the problem, like this:

{% highlight java %}
/**
* @param args
*/
public static void main(String[] args) {
	new Euler().run(1, true);
}
{% endhighlight %}

So the problem class is running itself using the Euler object, which knows how to find the problem, instantiate it and run it. I find doing things this way is easier when working on the problem, as you can simply run the problem as a java application, and it will output the result in a standard format we are expecting to to the console in Eclipse.

Thinking about it, you might be wondering - what's the point of all this, it seems a little excessive for something that can be done fairly easily? Well - I've done it like this because the whole point of me doing the problems on Project Euler, is to practice problem solving and become more comfortable in my use of Java. So I think what I've done is pretty valid in that regard.
