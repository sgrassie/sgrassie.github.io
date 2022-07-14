---
layout: post
title: Calling SSRS Reports with dotnet 6
tags: [ssrs,dotnet,svcutil]
featured_image: /assets/images/2022-01-11-calling-ssrs-reports-with-dotnet-6.webp
image: /assets/images/2022-01-11-calling-ssrs-reports-with-dotnet-6.webp
featured: False
hidden: False
published: 11/01/2022
ispublished: True
---
At work, we have recently been porting our internal web framework into .net 6. Yes, we are late to the party on this, for reasons. Suffice it to say I currently work in an inherently risk averse industry.

Anyway, one part of the framework is responsible for getting reports from SSRS.

The way it did this is to use a wrapper class around a SOAP client generated from good old `ReportService2005.asmx?wsdl`, using our faithful friend `svcutil.exe`. The wrapper class used some `TaskCompletionSource` magic on the events in the client to make the `client.LoadReportAsync` and the other `*Async` methods actually async, as the generated client was not truely async.

Fast forward to the _modern times_, and we need to upgrade it. How do we do that?

Obviously, Microsoft are a step ahead: `svcutil` has a dotnet version - `dotnet-svcutil`. We can install it and get going:

{% highlight console %}
dotnet too install --global dotnet-svcutil
{% endhighlight %}

Once installed, we can call it against the endpoint:
{% include note.html content="Make sure you call this command in the root of the project where the service should go" %}
{% highlight console %}
dotnet-svcutil http://server/ReportServer/ReportService2005.asmx?wsdl
{% endhighlight %}

In our wrapper class, the initialisation of the client has to change slightly, because the generated client is different to the original `svcutil` implementation. Looking at the diff between the two files, it's because the newer version of the client users more modern .net functionality.

The wrapper class constructor has to be changed slightly:

{% highlight csharp %}
public Wrapper(string url, NetworkCredential credentials)
{
    var binding = new BasicHttpBinding(BasicHttpSecurityMode.TransportCredentialOnly);
    binding.Security.Transport.ClientCredentialType = HttpClientCredentialType.Ntlm;
    binding.MaxReceivedMessageSize = 10485760; // this is a 10mb limit
    var address = new EndpointAddress(url);

    _client = new ReportExecutionServiceSoapClient(binding, address);
    _client.ClientCredentials.Windows.AllowedInpersonationLevel = TokenImpersonationLevel.Impersonation;
    _client.ClientCredentials.Windows.ClientCredential = credentials;
}
{% endhighlight %}

Then, the code which actually generates the report can be updated to remove all of the `TaskCompletionSource`, which actually simplifies it a great deal:

{% highlight csharp %}
public async Task<byte[]> RenderReport(string reportPath, string reportFormat, ParameterValue[] parameterValues)
{
    await _client.LoadReportAsync(null, reportPath, null);
    await _client.SetExecutionParametersAsync(null, null, parameterValues, "en-gb");
    var deviceInfo = @"<DeviceInfo><Toolbar>False</ToolBar></DeviceInfo>";
    var request = new RenderRequest(null, null, reportFormat, deviceInfo);
    var response = await _client.RenderAsync(request);
    return response.Result;
}
{% endhighlight %}

You can then do whatever you like with the `byte[]`, like return it in an `IActionResult` or load it into a `MemoryStream` and write it to disk as the file.

{% include note.html content="Much of the detail of this post is sourced from various places around the web, but I've forgotten all of the places I gleaned the information from." %}