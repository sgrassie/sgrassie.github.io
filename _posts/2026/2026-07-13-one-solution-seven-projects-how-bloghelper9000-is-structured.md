---
layout: post
title: "One solution, seven projects: how BlogHelper9000 is structured"
tags: [c#,dotnet,architecture,bloghelper9000]
featured_image: /assets/images/one-solution-seven-projects-how-bloghelper9000-is-structured.webp
image: /assets/images/one-solution-seven-projects-how-bloghelper9000-is-structured.webp
featured: False
hidden: False
published: 13/07/2026
ispublished: True
---

BlogHelper9000 began life as a single console project. It's now seven non-test projects plus four test projects. One of those seven, `BlogHelper9000.TestHelpers`, only exists to support the tests, but it's useful enough to count in its own right.

The number is less interesting than how it got there. I didn't start with a diagram and divide the code into boxes. Each split followed a second consumer, an awkward dependency, or something that had become needlessly difficult to test. This post is the map for the rest of the series.

```
BlogHelper9000.sln
  BlogHelper9000.Core/       domain logic, YAML parsing, post management
  BlogHelper9000.Imaging/    ImageSharp, Unsplash, featured image generation
  BlogHelper9000/            the CLI (exe), references Core + Imaging
  BlogHelper9000.Nvim/       embedded Neovim client via MsgPack-RPC
  BlogHelper9000.Tui/        Terminal.Gui workspace (exe), references Core + Imaging + Nvim
  BlogHelper9000.Mcp/        MCP server (exe), references Core + Imaging
  BlogHelper9000.TestHelpers/ shared test infrastructure
```

## Why each cut exists

Core holds the operations that make BlogHelper9000 more than a collection of frontends. `PostManager` knows the Jekyll directory layout, `MarkdownHandler` reads and rewrites post files, `YamlConvert` parses front matter, and `BlogService` composes them into operations such as publishing a post. The scheduling database also lives here, which is why Core now references `Microsoft.Data.Sqlite` as well as `System.IO.Abstractions` and a few `Microsoft.Extensions` packages. It has no UI dependencies.

Imaging keeps ImageSharp, Unsplash and the featured-image pipeline out of Core. ImageSharp requires a licence key to build this project, which is a good enough reason not to make it part of the library that parses every post. The CLI, TUI and MCP server all use Imaging now, but `Core` and `Nvim` don't need to know it exists.

Nvim is the embedded Neovim client: process management, MsgPack-RPC and the screen grid. It's separate from the TUI project for one reason: testability. `BlogHelper9000.Nvim.Tests` exercises RPC framing and grid logic without Terminal.Gui anywhere in sight, and without starting a real `nvim` process.

The three executable projects are the CLI, TUI and MCP server. They contain the interaction each frontend needs, but shared blog operations stay in Core. When I added the MCP server, most of the project was tool definitions and a `Program.cs`; the operations behind those tools already existed in Core and Imaging. The DI registrations are much the same in all three:

```csharp
builder.Services.AddSingleton<IFileSystem, FileSystem>();
builder.Services.AddSingleton<MarkdownHandler>();
builder.Services.AddSingleton<PostManager>();
builder.Services.AddSingleton<TimeProvider>(TimeProvider.System);
builder.Services.AddSingleton<IBlogService, BlogService>();
```

That block appears, with minor variations, in all three entry points. I could extract it. I haven't, because three copies of fifteen lines are cheaper than the wrong abstraction. The registrations already differ: the TUI needs `NvimClient`, while the MCP server does not.

## Where the boundary actually is

The rule is not that frontends never touch the file system. The TUI's file browser enumerates drafts and posts, its editor reads and writes the current document, and its copy, move and delete commands are implemented in the TUI. Moving those operations into `BlogService` would make Core aware of behaviour that only one frontend has.

The boundary is about meaning. Publishing a post, parsing its front matter and finding author branding are blog operations, so frontends ask `PostManager` or `BlogService` to do them. Selecting a file in a Terminal.Gui tree is TUI behaviour, so it stays there. Both sides use `IFileSystem` rather than static `File` and `Directory` calls, which lets the tests use `MockFileSystem` instead of a real disk.

That is a less tidy rule than "frontends never touch the file system", but it matches the code. Not every file operation deserves a domain service. The ones that express how the blog works do.

## What I'd tell 2022 me

Split Core out on day one. It happened around the time the metadata fixing got serious, and the refactor was tedious. Do not split anything else until a second consumer shows up or the existing boundary gets in the way of testing.

I would also name the projects properly from the start. Renaming a .NET project means updating the solution, its test project and any `InternalsVisibleTo` attributes that point at it. I've done enough of that for one tool.

Next up: using TimeWarp.Nuru as the command-line parser behind the CLI.
