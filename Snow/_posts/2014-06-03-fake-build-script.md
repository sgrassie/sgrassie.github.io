---
title: A FAKE build script
published: draft
layout: post
category: f#, FAKE, build script
metadescription: f#, FAKE, build script
---
> On any significantly sized application (and even small ones), having an automated build script in place is a must for any lazy developer. Consistent, reproducible builds save time, effort and heartache.

I've written before on this blog about utilising build scripts, back then my choice was psake, a relatively new (at the time) build system that uses PowerShell scripts to do its thing. I also spent a while writing custom MSBuild scripts. At my last job, we used the full power and glory of TFS, and I didn't have anything to do with building the project, and it was nice.

At my latest adventure, I'm back taking care of my own build infrastructure, so that means I get to write build scripts again. My new favourite tool of choice is FAKE. I say that it is MY new favour tool of choice, it turns out that FAKE has been around for quite a while, it just seems to only just be getting the kind of traction it deserves as a default tool of choice for the discerning OSS .NET developer, and corporate developer drone who needs to automate stuff as quickly and simply as possible just to claw back precious moments of time to do actual work instead of attend hours of pointless and mandatory meetings, which do nothing useful except massage the egoes of the people who organise them.

I digress. (My new job is nothing like a corporate hell hole).

## F# in my C#

