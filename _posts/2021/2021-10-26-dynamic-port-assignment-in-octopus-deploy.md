---
layout: post
title: 'Dynamic port assignment in Octopus Deploy'
tags: ['build tools','octopus deploy']
featured_image: /assets/images/posts/2020/artem-sapegin-b18TRXc8UPQ-unsplash.jpg
featured: False
hidden: False
published: 26/10/2021
ispublished: True
---
Recently we realised that we had quite a few applications being deployed through Octopus Deploy, and that we had a number of Environments, and a number of Channels, and that managing the ports being used in Dev/QA/UAT across different servers/channels was becoming... problematic.

When looking at this problem, it's immediately clear that you need some way of dynamically allocating a port number on each deployment. This [blog post](https://octopus.com/blog/changing-website-port-on-each-deployment) from Paul Stovell shows the way, using a custom Powershell build step.

As we'd lost track of what sites were using what ports, and that we also have ad-hoc websites in IIS that aren't managed by Octopus Deploy, we thought that asking IIS "Hey, what ports are the sites you know about using?" might be a way forward. We also had the additional requirement that on some of our servers, we also might have some arbitary services also using a port and that we might bump into a situation where a port was chosen that was already being used by a non-IIS application/website.

Researching the first situation, it's quickly apparent that you can do this in Powershell, using the `Webadministration` module. Based on the answers to [this question](https://stackoverflow.com/q/15528492) on Stackoverflow, we came up with this:

{% highlight powershell %}
Import-Module Webadministration

function Get-IIS-Used-Ports()
{
    $Websites = Get-ChildItem IIS:\Sites

    $ports = foreach($Site in $Websites)
    {
        $Binding = $Site.bindings
        [string]$BindingInfo = $Binding.Collection
        [string]$Port = $BindingInfo.SubString($BindingInfo.IndexOf(":")+1,$BindingInfo.LastIndexOf(":")-$BindingInfo.IndexOf(":")-1)

        $Port -as [int]
    }

    return $ports
}
{% endhighlight %}

To get the list of ports on a machine that are not being used is also fairly straightforward in Powershell:

{% highlight Powershell %}
function Get-Free-Ports()
{
    $availablePorts = @(49000-65000)
    $usedPorts = @(Get-NetTCPConnection | Select -ExpandProperty LocalPort | Sort -Descending | Where { $_ -ge 49000})

    $unusedPorts = foreach($possiblePort in $usedPorts)
    {
        $unused = $possiblePort -notin $usedPorts
        if($unused)
        {
            $possiblePort
        }
    }

    return $unusedPorts
}
{% endhighlight %}

With those two functions in hand, you can work out what free ports are available to be used as the 'next port' on a server. It's worth pointing out that if a site in IIS is stopped, then IIS won't allow that port to be used in another website (in IIS), but the port also doesn't show up as a used port in `netstat -a`, which is kind of what `Get-NetTCPConnection` does.

{% highlight Powershell %}
function Get-Next-Port()
{
    $iisUsedPorts = Get-IIS-Used-Ports
    $freePorts = Get-Free-Ports

    $port = $freePorts | Where-Object { $iisUsedPorts -notcontains $_} | Sort-Object | Select-Object First 1

    Set-OctopusVariable -Name "Port" -Value "$port"
}
{% endhighlight %}

Then you just have to call it at the end of the script:


{% highlight Powershell %}
Get-Next-Port
{% endhighlight %}

You'd also want to have various `Write-Host` or other logging messages so that you get some useful output in the build step when you're running it.