---
title: A psake build script example
layout: post
category: build script,C#,Coding,Powershell,psake
metadescription: a-psake-build-script-example
---
I have recently started using psake to do some build automation at work, and I've found that there is not a great deal of information about how to write a build script using psake available on the internet. It isn't all that amazingly difficult if truth be told, however there are a couple of 'gotchas', and I would like to share what I have learned in the hopes that it benefits someone.

If you have not heard of it, <a title="psake project on Google Code" href="http://code.google.com/p/psake/" target="_blank">psake</a> is a"...build automation tool written in PowerShell", started by <a title="James Kovacs' blog" href="http://codebetter.com/blogs/james.kovacs/default.aspx" target="_blank">James Kovacs</a>. With it, you can write build scripts, with which you can automate the build and deployment of your .NET project. Recently the version <a title="psake 2.00 release annoucement" href="http://codebetter.com/blogs/james.kovacs/archive/2009/10/14/releasing-psake-v1-00-amp-psake-v2-00.aspx">1.00 and 2.0<strong> </strong>0 version were released</a>. Why two versions? Well, the 1.00 version is primarily for PowerShell 1.0, but psake 1.00 is being "retired". This article assumes the reader is using psake 2.01 and PowerShell 2.0.

A quick note here, I should point out the primary example I based my first build script on is <a title="Ayende Rahien Rhino Mocks build script" href="http://ayende.com/Blog/archive/2009/08/30/on-psake.aspx" target="_blank">Ayende Rahien's build script for Rhino Mocks</a>.
<h2>Our first psake build script</h2>
First, I have to make two assumptions:
<ol>
	<li>I have to assume that you have PowerShell installed, if you are running Vista/Windows 7 then it's installed by default, if you are on XP, then it is a manual install.</li>
	<li>You have installed the psake module into Powershell - see the release announcement linked to above for details on how to do this.</li>
</ol>
[caption id="attachment_120" align="alignleft" width="137" caption="Example solution"]<a href="http://temporalcohesion.co.uk/wp-content/uploads/2009/10/psake_example_solution.png"><img class="size-full wp-image-120    " title="psake_example_solution" src="http://temporalcohesion.co.uk/wp-content/uploads/2009/10/psake_example_solution.png" alt="Example solution" width="137" height="161" /></a>[/caption]

With those assumptions out of the way, we are going to write a build script to automate the building of a simple C# solution, containing a Windows Forms application, and two class library assemblies.

Hopefully this should be simple enough to easily follow along with what is happening in the build script, but complex enough that you can see how sophisticated your build scripts can be.

You can see that I have already taken the liberty of adding an extra file to the solution, "build.ps1", this is our build script, with which we can command psake to do great things for us.

With our solution setup, we can now write our first build script:

<pre class="lang:powershell decode:1 " >
properties {
 $base_dir = Resolve-Path .
 $sln_file = &amp;quot;$base_dirWindowsFormsApplication.sln&amp;quot;
}

Task default -depends Compile

Task Compile {
 msbuild &amp;quot;$sln_file&amp;quot;
}
</pre>

Open a command prompt into the directory containing the .sln file, which is where your build.ps1 script
should be, and run this command: invoke-psake .build.ps1 -taskList Compile

[caption id="attachment_123" align="aligncenter" width="300" caption="psake Compile task output"]<a href="http://temporalcohesion.co.uk/wp-content/uploads/2009/10/psake_Compile.png"><img class="size-medium wp-image-123" title="psake_Compile" src="http://temporalcohesion.co.uk/wp-content/uploads/2009/10/psake_Compile-300x296.png" alt="psake Compile task output" width="300" height="296" /></a>[/caption]

You should receive some output to the console window like the above.What the script does is to work out where on the file system the script is running, and gets the path to that folder, and builds the path to the specified solution file, and runs msbuild, passing the full path to the solution file as a parameter.

The script as it is has some drawbacks though. In it's current form, msbuild will only build the default configuration of the solution. What if we want to build a Debug version, or a Release version, or some other configuration we've created? Additionally, it doesn't let us specify a directory to put the built binaries, they just get put in the default locations as specified in the projects contained in the solution - what if we want to put them in a custom location?

If we modify our build script slightly, we can introduce this functionality. Firstly, we need to specify some additional properties:

<pre class="lang:powershell decode:1 " >
properties {
 $base_dir = Resolve-Path .
 $build_dir = &amp;quot;$base_dirbuild&amp;quot;
 $sln_file = &amp;quot;$base_dirWindowsFormsApplication.sln&amp;quot;
 $debug_dir = &amp;quot;$build_dirDebug\&amp;quot;
 $release_dir = &amp;quot;$build_dirRelease\&amp;quot;;
}
</pre>

Notice the double backslash, msbuild requires a trailing slash when paths are specified, and it seems to require the additional backslash as well, or else it doesn't work. With those additional properties in place, we can introduce two new tasks to our build script:

<pre class="lang:powershell decode:1 " >
Task Clean {
 remove-item -force -recurse $debug_dir -ErrorAction SilentlyContinue
 remove-item -force -recurse $release_dir -ErrorAction SilentlyContinue
}

Task Init -depends Clean {
 new-item $debug_dir -itemType directory
 new-item $release_dir -itemType directory
}
</pre>

Powershell's easy to read syntax should make it easy to follow with what is happening now. In the Clean task, we forcefully and recursively remove any files and the folder from the specified path, and if there are any errors then they are not displayed. Now that we know that those folders are going to be cleaned and created, we can create two further tasks, where we can create Debug and Release versions of our solution:

<pre class="lang:powershell decode:1 " >
Task Debug -depends Init {
 msbuild $sln_file &amp;quot;/nologo&amp;quot; &amp;quot;/t:Rebuild&amp;quot; &amp;quot;/p:Configuration=Debug&amp;quot; &amp;quot;/p:OutDir=&amp;quot;&amp;quot;$debug_dir&amp;quot;&amp;quot;&amp;quot;
}

Task Release -depends Init {
 msbuild $sln_file &amp;quot;/nologo&amp;quot; &amp;quot;/t:Rebuild&amp;quot; &amp;quot;/p:Configuration=Release&amp;quot; &amp;quot;/p:OutDir=&amp;quot;&amp;quot;$release_dir&amp;quot;&amp;quot;&amp;quot;
</pre>

Again, the syntax here is relatively straightforward to follow along with, we execute msbuild, passing it the solution file to build, specify not to show the logo (suppressing the output of "copyright microsoft msbuild etc), tell it to execute the rebuild target and to build the Debug configuration, copying the output to the specified debug directory. Notice that that there are no spaces in the paramters that we pass to msbuild. For example, if we passed the parameters like this: "/p:Configuration=Release /p:OutDir=""$release_dir""", then it would fail and we would get a msbuild parse error saying it was invalid.

[caption id="attachment_129" align="alignleft" width="196" caption="Build script output for Debug task"]<a href="http://temporalcohesion.co.uk/wp-content/uploads/2009/10/psake_example_debug.png"><img class="size-medium wp-image-129" title="psake_example_debug" src="http://temporalcohesion.co.uk/wp-content/uploads/2009/10/psake_example_debug-196x300.png" alt="Build script output for Debug task" width="196" height="300" /></a>[/caption]
<h2>Summary</h2>
In a relatively short amount of code, less than 30 lines, we have accomplished quite a lot. We can now issue the command: invoke-psake .build.ps1 -taskList Debug, and psake will automatically clean the output folders, do a full rebuild of the Debug configuration and copy the output to a custom location on our filesystem. What's more, the build script we have written is small, compact, easy to read, easy to maintain and easy to build/extend upon in the future.

As this is getting a bit long already, I'm going to cut things short here, however, there are some additional things that you can do as part of the build script that are very nice, such as automatically versioning the assembly before you do the full build. If you take a look at <a title="Ayende Rahien Rhino Mocks build script" href="http://ayende.com/Blog/archive/2009/08/30/on-psake.aspx" target="_blank">Ayende Rahien's example</a> from Rhino Mocks, that is covered there.

Also in the new version of psake, there are pre and post conditions and actions that you can add onto your tasks, although I haven't had the opportunity to use them yet. I'll try to cover those in a future blog post though.
