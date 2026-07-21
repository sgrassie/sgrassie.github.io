---
layout: post
title: Using TimeWarp.Nuru as a command-line parser
tags: [c#,dotnet,cli,bloghelper9000]
featured_image: /assets/images/2026-07-21-using-timewarp.webp
image: /assets/images/2026-07-21-using-timewarp.webp
featured: False
hidden: False
published: 21/07/2026
ispublished: True
---

The CLI is the oldest frontend in [BlogHelper9000](https://github.com/sgrassie/BlogHelper9000), and its command-line parsing is done by [TimeWarp.Nuru](https://github.com/TimeWarpEngineering/timewarp-nuru), a route-based CLI framework that brings web-style routing and the mediator pattern to console apps. What I get out of it is that the CLI behaves like any other .NET application: commands are classes, logic lives in handlers, and dependencies arrive through `Microsoft.Extensions.DependencyInjection`. What I pay for it is riding a 3.0 beta with some genuinely sharp edges, and I'll show both.

At the time of writing BlogHelper9000 is on `TimeWarp.Nuru` version `3.0.0-beta.71`.

## Setting up the application

The entry point looks like a minimal ASP.NET Core app, with one important difference I'll get to:

```csharp
var builder = NuruApp.CreateBuilder()
    .UseMicrosoftDependencyInjection()
    .AddConfiguration(args);

builder.ConfigureServices(services =>
{
    services.AddSingleton<IConfiguration>(_ => new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json", optional: true)
        .AddEnvironmentVariables()
        .Build());
    services.AddLogging(logging => logging.AddConsole());
    services.AddOptions<BlogHelperOptions>().BindConfiguration("BlogHelperOptions");
    services.AddSingleton<IFileSystem, FileSystem>();
    services.AddSingleton<PostManager>();
    // ... more service registrations
});

NuruApp app = builder
    .DiscoverEndpoints()
    .Build();

return await app.RunAsync(args);
```

`DiscoverEndpoints()` scans the assembly for command classes, and `RunAsync(args)` parses the arguments and dispatches to the right handler. Routing is source-generated, so the project file needs the Nuru interceptors namespace or none of it works:

```xml
<InterceptorsNamespaces>$(InterceptorsNamespaces);TimeWarp.Nuru.Generated</InterceptorsNamespaces>
```

The important difference is that `ConfigureServices` block. The obvious thing, registering services directly on `builder.Services` the way ASP.NET Core has trained everyone to, compiles cleanly and then throws `InvalidOperationException` at startup for every single command. The source generator only recognises registrations made inside `ConfigureServices`. It also inlines that lambda into a static method, so the lambda can't capture anything from `Program`; that's why the `IConfiguration` is rebuilt inside it from the same sources the host uses, and why logging is registered by hand. The generator registers neither for you.

## Defining a command

Each command is a plain C# class that implements `ICommand<TResult>`. For commands that don't return a value, `TResult` is `Unit`. Routing is declared with the `[NuruRoute]` attribute:

```csharp
[NuruRoute("add", Description = "Add a new post")]
public sealed class AddCommand : ICommand<Unit>
{
    [Parameter(Description = "The title of the post to add.")]
    public string Title { get; set; }

    [Parameter(Description = "Comma-separated list of tags for the post.")]
    public string Tags { get; set; }

    [Option("is-draft", "d", Description = "Indicates whether the post is a draft.")]
    public bool IsDraft { get; set; }

    [Option("featured-image", "i", Description = "The path to the featured image for the post.")]
    public string FeaturedImage { get; set; }

    // ...
}
```

`[Parameter]` maps to positional arguments and `[Option(longName, shortName)]` maps to named flags, so this is `bloghelper add "My new post" csharp,dotnet --is-draft`.

The attribute is not optional, and this is the sharpest edge in the current beta. A command class without `[NuruRoute]` isn't an error or a warning: `DiscoverEndpoints()` silently skips it, it disappears from `--help`, and no guessed route reaches it. Related, `[NuruRouteGroup]` is silently ignored by the generator in beta.71, which is why the schedule commands are flat hyphenated routes (`schedule-list`, `schedule-import`, `schedule-stats`) rather than proper `schedule list` subcommands. There's a comment in the source saying exactly that, so future me knows the flat names are a workaround and not a design choice.

## The handler pattern

The logic lives in a nested `Handler` class implementing `ICommandHandler<TCommand, TResult>`, with dependencies injected through the constructor exactly like any other service:

```csharp
public sealed class Handler(ILogger<Handler> logger, IBlogService blogService, IScheduleService scheduleService)
    : ICommandHandler<AddCommand, Unit>
{
    public ValueTask<Unit> Handle(AddCommand request, CancellationToken cancellationToken)
    {
        var tags = string.IsNullOrWhiteSpace(request.Tags)
            ? null
            : request.Tags.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);

        var filePath = blogService.AddPost(request.Title, request.IsDraft, request.IsFeatured,
            request.IsHidden, request.FeaturedImage, tags);

        if (filePath is null)
        {
            logger.LogError("Could not add post '{Title}' — a post already exists at the target path", request.Title);
            return default;
        }

        logger.LogInformation("Added new post at {File}", filePath);
        // ... add the post to a schedule series, if one was supplied
        return default;
    }
}
```

An asynchronous command just changes the signature to `async ValueTask<Unit>` and returns `default` at the end as before; the image handler awaits the Unsplash download and the ImageSharp processing that way.

Because commands are plain classes and handlers receive everything through the constructor, the tests don't need any framework support: `IFileSystem` is swapped for `MockFileSystem` from `System.IO.Abstractions.TestingHelpers`, `TimeProvider` is pinned to a fixed time, and the remaining services are substituted with NSubstitute. The command and handler code doesn't change at all to accommodate this.

## Packaging as a .NET global tool

None of this interferes with packaging the CLI as a .NET tool. Three lines in the `.csproj`:

```xml
<PackAsTool>true</PackAsTool>
<ToolCommandName>bloghelper</ToolCommandName>
<PackageOutputPath>./releases</PackageOutputPath>
```

and installing locally from source is:

```bash
> dotnet tool install --global --add-source ./releases bloghelper
```

which makes `bloghelper add "My new post" --is-draft` available everywhere.

Would I recommend a beta command-line parser for a work project? No. For a personal tool, the trade is fine: the mediator pattern keeps each command self-contained and testable, the DI container is the same one the rest of the solution uses, and the sharp edges are the kind you hit once, write a comment about, and move on.

Next up: From Oakton to TimeWarp.Nuru, or how this CLI has now survived three command-line parsers.
