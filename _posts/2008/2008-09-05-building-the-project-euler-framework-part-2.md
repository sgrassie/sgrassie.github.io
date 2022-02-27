---
layout: post
title: Building the Project Euler framework, part 2
description: 
tags: [Coding,Java,Project Euler]
featured_image: /assets/images/2008-09-05-building-the-project-euler-framework-part-2.webp
image: /assets/images/2008-09-05-building-the-project-euler-framework-part-2.webp
hidden: False
published: 05/09/2008
ispublished: True
---
In Part 1, I showed a basic problem runner framework for Project Euler, however there are a number of ways in which we can improve it. For example:
<ul>
	<li>How can we run a specific problem?</li>
	<li>How can we hide the answer, but still run the problem?</li>
	<li>How can we avoid manually adding problems to the List of problems?</li>
	<li>Not really to do with the framework, but how can we automate building everything?</li>
</ul>
I'll demonstrate some ways that we can do all that, except for the 4th option, which is handled by Ant.
<h2>Improving the framework</h2>
The first thing that we can do is to add a utility function that handles showing the answers, this way we only have one place in the code that we need to update when we want to change how the answers are shown.

{% highlight java %}
private void showAnswers(Problem problem){
	System.out.println("Problem: " + problem.id() + ". Answer: "
			+ problem.answer() + ". Time: " + problem.time() + "s");</pre>
}
{% endhighlight %}

To run a specific problem, we need to overload the <em>run()</em> function to access the problem we want, and show the answer.

{% highlight java %}
public void run(int i) {
	try{
		Problem problem = (Problem) problems.get(i);/* problem list starts at 0 */

		if (problem != null) {
			showAnswers(problem);
		}
		else {
			System.out.println("There doesn't appear to be an answer for problem " + i);
		}

	} catch (IndexOutOfBoundsException e){
		System.err.println("There doesn't appear to be an answer for problem " + i);
	}

}
{% endhighlight %}

As you can see, we get the specified problem out of the list, and use our new <em>showAnswers()</em> function to display the answer.  I've tried to include some good error checking - we might try to get a problem that doesn't exist.

In order to prevent the answer from being shown, we can add a boolean parameter to the <em>run()</em> and <em>showAnswers()</em> functions.

{% highlight java %}
private void showAnswers(Problem problem, boolean showAnswers){
	if(showAnswers){
		System.out.println("Problem: " + problem.id() + ". Answer: "
				+ problem.answer() + ". Time: " + problem.time() + "s");
		}
		else {
			problem.answer(); /* we still need to work out the answer */
			System.out.println("Problem: " + problem.id() + ". Time: " + problem.time() + "s");
		}
}

public void run(boolean showAnswers) {
	for (Problem problem : problems) {
		if (problem != null) {
			showAnswers(problem, showAnswers);
		}
	}
}
{% endhighlight %}

Dont't forget to change the overloaded <em>run(int i)</em> to <em>run(int i, boolean showAnswers)</em>. This way we can control exactly  whether to show the answers when we run all the problems, or to show the answer if we run a specific problem.

One thing remains to do, and that is to correctly parse the command line arguments to control whether the answers are shown or not. We want to handle something like this:

{% highlight console %}
C:developmenteuler&gt;java -jar ProjectEuler.jar 42 -noanswer
{% endhighlight %}

Where 42 is problem 42, and -noanswer clearly specifies not to show the answer. We'll also need to handle all combinations of this as well, such as:

{% highlight console %}
C:developmenteuler&gt;java -jar ProjectEuler.jar 42
{% endhighlight %}

Which should show the answer. I'm not going to show my code for parsing the command line arguements, I'll leave that as an exercise for the reader, as I believe that it is adequately covered elsewhere on the internet, and in any number of Java books.

The more astute among you will notice that I've not mentioned how we are going to avoid manually adding problems to the List of problems. I'll cover that next time.
