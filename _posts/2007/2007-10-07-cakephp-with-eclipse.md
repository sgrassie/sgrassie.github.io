---
title: cakePHP with Eclipse
layout: post
tags: [PHP]
---

After chatting with one of my friends who is earning loads of cash doing php web development, I've decided that I'm going  relearn PHP, not because I want a change of career, I'm happy where I am, but because... I just want to.

Because I've become a bit of a snob, used to having intellisense and and all the wonders that IDE's such as Visual Studio and Borland Delphi provide, I wanted to do my PHP development in a proper IDE. Since I've been doing a lot of Java at work - enter <a href="http://www.eclipse.org" title="The Eclipse IDE" target="_blank">Eclipse</a>, and the <a href="http://www.eclipse.org/pdt/" title="Eclipse PDT plugins" target="_blank">Eclipse PHP</a> plugins.

As you can see in the screenshot above (which shows some code from the <a href="http://www.cakephp.org" title="A Nice Piece of Cake!">cakePHP</a> 15 minute blog tutorial), the plugins provide an awesome amount of functionality, such as:
<ul>
	<li>Code folding</li>
	<li>Intellisense/code completion</li>
	<li>Syntax highlighting/colouring</li>
	<li>API Documentation tool-tips</li>
</ul>
All this functionality is pretty easy to set up, and there is a pretty good guide available in <a href="http://bakery.cakephp.org/articles/view/setting-up-eclipse-to-work-with-cake" target="_blank">The Bakery</a> that covers just about everything you need to know to get going. There was a little bit of configuration that I did that was slightly different to that guide:

Firstly, I don't believe that you need to set up cakePHP as a project in order to get the code completion to work. If you expand your project, and right click on your project include paths, you should be on the PHP Include path dialog, in the projects properties. If you add an external folder, and browse to the cake core directory (for me: C:xampphtdocscake), and click ok, you should now have code completion and all the associated awesomeness in your project, with the added benefit that for any different projects in your workspace, you can set up different versions of cakePHP or (I haven't tried this though) a different framework such as <a href="http://www.symfony-project.com">Symfony</a>.

Secondly, for code completion in Models, you just have to do something like this:
{% highlight php %}
class PostsController extends AppController{var $name = 'Posts';

/**

* @var Post

*/

var $Post;

...code

}
{% endhighlight %}

Hope this is of use to somebody :)
