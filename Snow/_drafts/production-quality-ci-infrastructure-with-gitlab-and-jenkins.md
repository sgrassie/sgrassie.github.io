---
layout: post
published: private
title: A continuous integration infrastructure with Gitlab and Jenkins
category: CI, gitlab, jenkins
metadescription: Production quality CI infrastructure with Gitlab and Jenkins
---
I think that the setup I describe below is good enough for a lone developer working at home to a small team of developers in a startup or corporate setting. Remember: Some teams of developers work in places were every penny counts, where the budgets are small or nonexistant.

## Hardware

Luckily, I do have some decent hardware to play with. I have two dedicated virtual servers. Both run 8gb of RAM, with quad-core 2GHz processors. One runs Ubuntu 14.04, and one runs Windows Server 2012 R2. The Linux box runs Gitlab; the windows server runs Jenkins and also hosts the test IIS server.

I also have access to a dedicated NAS, which has an iSCSI share mounted in the Linux box, which is where the git repositories are stored. This is also backed up to tape.

## Gitlab

Gitlab is the community edition, and it was originally installed from source, although I wouldn't recommend doing it that way now. If I were to set it up again, I would instead use the Omnibus packages, as updating to new versions is consierably easier than it is with upgrading a source-install.

It's configured to talk to our Active Directory, and I've written about that in the past, so I won't repeat the same information here.

## Jenkins

Jenkins runs on port 80 on the window server (the IIS test server is on port 8080), and is usually kept on the latest version. It has various plugins installed, listing them here would take up too much room and destract from the point of this post. Suffice to say that Jenkins primarily builds windows applications and ASP.NET websites. I might write about how I do code coverage and static analysis of some my projects.

## Continuous Integration

The one Jenkins plugin I will mention is the [Gitlab Plugin](https://wiki.jenkins-ci.org/display/JENKINS/GitLab+Plugin), which makes Gitlab think that Jenkins is a Gitlab CI. Once you have this installed, and you follow the fairly simple instructions, it really is incredibly straightforward.
