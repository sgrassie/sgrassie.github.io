---
layout: post
title: Updating git submodules
description: updating git submodules
tags: ['Git']
featured_image: /assets/images/2014-02-15-updating-git-submodules.png
image: /assets/images/2014-02-15-updating-git-submodules.png
hidden: False
published: 15/02/2014
ispublished: True
---
I'm writing this up mostly for my own benefit so that I don't have to go searching for it again in future.

When you have a git repository which has a few submodules (.e.g. a vim dotfiles repo), you may find that you'll notice one day that they all point to ancient commits in their parent repositories. Consequently, you want to update them, to get the new shiny things.

To do so is fairly straightforward (from your parent repository):

    git submodule update --recursive --remote

This tells git that you want to update the submodules to the latest commit on the submodules remote tracking branch (```--remote```) and to do it recursively (```--recursive```) on all of the submodules (and their submodules if any).

Then if you check the ```git status``` you should see something like this:

<pre><code>
M:\vimfiles [master +0 ~9 -0]> git status
# On branch master
# Changes not staged for commit:
#   (use "git add <file>..." to update what will be committed)
#   (use "git checkout -- <file>..." to discard changes in working directory)
#
#       modified:   bundle/ctrlp (new commits)
#       modified:   bundle/delimitmate (new commits)
#       modified:   bundle/nerdtree (new commits)
#       modified:   bundle/tagbar (new commits)
#       modified:   bundle/vim-jade (new commits)
#       modified:   bundle/vim-javascript.git (new commits)
#       modified:   bundle/vim-pathogen (new commits)
#       modified:   bundle/vim-powerline (new commits)
#       modified:   bundle/vim-ps1 (new commits)
#
no changes added to commit (use "git add" and/or "git commit -a")
</code></pre>

You may find this confusing, as you have just updated all the submodules to the latest commit. Why are are there new commits? If you do a ```diff``` on one of them, you'll see something like this:

<pre><code>
M:\vimfiles [master +0 ~9 -0]> git diff bundle/ctrlp
diff --git a/bundle/ctrlp b/bundle/ctrlp
index be5842a..b5d3fe6 160000
--- a/bundle/ctrlp
+++ b/bundle/ctrlp
@@ -1 +1 @@
-Subproject commit be5842a376f16c16c5dc4cc1879d7168a074f7de
+Subproject commit b5d3fe66a58a13d2ff8b6391f4387608496a030f
</code></pre>

Which makes sense, because you have asked git to update the submodule(s) to the latest commit, so it is therefore unsuprising that your repo now knows that its submodules have changed. You need to tell your repository to actually use the latest commit of the submodules, and then commit everything:

<pre><code>
git submodule update
git commit -am "Updated submodules to latest"
</code></pre>

Hope that helps someone.
