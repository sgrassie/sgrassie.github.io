---
layout: post
title: Vim in a corporate environment
tags: [vim]
featured_image: /assets/images/2022-03-11-vim-in-a-corporate-environment.webp
image: /assets/images/2022-03-11-vim-in-a-corporate-environment.webp
featured: False
hidden: False
published: 11/03/2022
ispublished: True
---
I just had to setup my `vimrc` and `vimfiles` on a new laptop for work, and had some fun with Vim, mostly as it's been years since I had to do it. I keep my `vimfiles` folder in my github, so I can grab it wherever I need it.

To recap, one of the places that Vim will look for things is `$HOME/vimfiles/vimrc`, where `$HOME` is actually the same as `%USERPROFILE%`. In most corporate environments, the `%USERPROFILE%` is actually stored in a networked folder location, to enable roaming profile support and help when a user gets a new computer.

So you can put your `vimfiles` there, but, it's a network folder - it's slow to start an instance of Vim. Especially if you have a few plugins.

Instead, what you can do is to edit the `_vimrc` file in the Vim installation folder (usually in `C:\Program Files (x86)\vim`), delete the entire contents and replace it with:

{% highlight console %}
set rpt+=C:\path\to\your\vimfiles
set viminfo+=nC:\path\to\your\vimfiles\or\whatever
source C:\path\to\your\vimfiles\vimrc
{% endhighlight %}

What this does is:

1. Sets the runtime path to be the path to your vimfiles
2. Tells vim where to store/update the viminfo file (which stores useful history state amongst other things)
3. Source your `vimrc` file and uses that 

This post largely serves as a memory aid for myself when I need to do this again in future I won't spend longer than I probably needed to googling it to find out how to do it, but I hope it helps someone else.