---
layout: post
title: Git plus dropbox
description: 
tags: ['Dropbox','Git','Source Control']
featured_image: 
hidden: False
published: 04/03/2010
ispublished: True
---
<a title="Link to earlier blog post." href="http://temporalcohesion.co.uk/2008/08/29/source-control-using-dropbox/" target="_self">Some time ago</a>, I wrote about using <a title="Link to dropbox.com" href="https://www.dropbox.com/" target="_blank">Dropbox </a>as a version control system. I now realise how naive  and short-sighted that thought was. At the time, it was my belief that a dropbox account could be suitable for maintaining version history, and after a fashion, it can be, because using the web client to view your files, you can see previous versions of  the files in your dropbox.

However, there are problems with this approach. Consider that you've changed several files, but then you realise that the changes you have made are not good enough, or just don't work. With svn, or vss (*vomit*), you can undo-checkout to get the previous version back, with dropbox you can roll back to the previous version - one file at a time. There is no branching, no merging, no tagging. Nothing like a traditional SCM tool should have.

Dropbox is after all, essentially just a folder that is backed up "to the cloud". If we use the right tool, we can take advantage of this properly.
<h1>Enter Git</h1>
What is <a title="Git SCM" href="http://git-scm.com/" target="_blank">Git</a>? Well, surely you must have at least heard of Git by now? If not, I refer you to the <a title="Wikipedia article about git" href="http://en.wikipedia.org/wiki/Git_(software)" target="_blank">wikipedia page</a> about Git. Ok? You're back?

The key aspect of Git which we can take advantage of is essentially the very nature of Git itself. Every Git clone is a full-repository, containing the full commit  history and full revision tracking capability for the project, and it does not rely on network access nor a central server.

Basically, the idea is that you initialise an empty, bare repository inside your dropbox folder, and then somewhere else on your filesystem, perhaps a development folder where you store all your projects, you clone the repo from dropbox, and do all your work on that clone. Then when you call 'git push origin master', your changes are pushed into the dropbox repo, ready to be synced up on other computers you use.
<blockquote>Note: This is not a substitue for having a proper hosted Git repository, such as a project on Github, or somewhere else. However, it useful if you are working on something you aren't ready to put into the public domain, or you haven't yet decided to purchase an account on a private repository provider.</blockquote>
<h1>Setup</h1>
Setting it up is fairly simple, but, I am going to assume that you have Dropbox and a dropbox account, Git and (if you are on Windows) GitExtensions, correctly installed already.
<blockquote>Note: I have only tested this on Windows 7, but I wouldn't expect it to not work on any other system. As always YMMV.</blockquote>
First, create a folder in your dropbox folder to house your projects, e.g. C:UsersStuartDocumentsMy Dropboxprojects or just store it in the root of your Dropbox, it's upto you. Don't forget to include quotes around any path that has a space in, or else it won't work.

[sourcecode language="bash"]

Stuart@LAPTOP ~/Documents/My Dropbox/projects
$ mkdir example

Stuart@LAPTOP ~/Documents/My Dropbox/projects
$ cd example

Stuart@LAPTOP ~/Documents/My Dropboxprojects/example
$ mkdir .git

Stuart@LAPTOP ~/Documents/My Dropbox/projects/example
$ cd .git/

Stuart@LAPTOP ~/Documents/My Dropbox/projects/example/example.git
$ git init --bare
Initialized empty Git repository in c:/Users/Stuart/Documents/My Dropbox/projects/example
/example.git/

[/sourcecode]

Then, in your development folder clone that repo.

[sourcecode language="bash"]
Stuart@LAPTOP /c/development/examples
$ git clone -v &quot;C:/Users/Stuart/Documents/My Dropbox/projects/example/.git&quot;
Initialized empty Git repository in c:/development/examples/example/.git/

Stuart@LAPTOP /c/development/examples
$ cd example/

Stuart@LAPTOP /c/development/examples/example (master)
$ touch example.txt

Stuart@STUART-LAPTOP /c/development/examples/example (master)
$ git add example.txt

Stuart@LAPTOP /c/development/examples/example (master)
$ git commit -m &quot;Added example file to initial commit&quot;
[master e9ac78d] Added example file to initial commit
 0 files changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 example.txt

Stuart@LAPTOP /c/development/examples/example (master)
$ git push origin master
Counting objects: 3, done.
Delta compression using up to 2 threads.
Compressing objects: 100% (2/2), done.
Writing objects: 100% (2/2), 253 bytes, done.
Total 2 (delta 0), reused 0 (delta 0)
Unpacking objects: 100% (2/2), done.
To C:/Users/Stuart/Documents/My Dropbox/projects/example/.git
 1e38d4e..e9ac78d  master -&gt; master
[/sourcecode]

Dropbox will sync the files into the cloud. On your other computer, the git repo will sync, then you can clone it, and find that you have all your history for your project as you would expect.
