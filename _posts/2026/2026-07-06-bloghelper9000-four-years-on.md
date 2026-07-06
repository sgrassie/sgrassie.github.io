---
layout: post
title: BlogHelper9000, four years on
tags: [c#,dotnet,blog,jekyll,bloghelper9000]
featured_image: /assets/images/bloghelper9000-four-years-on.webp
image: /assets/images/bloghelper9000-four-years-on.webp
featured: False
hidden: False
published: 06/07/2026
ispublished: True
---

In March 2022 I wrote a post called *Automating jekyll with dotnet*, laid out seven requirements for a little CLI tool, ran `dotnet new console --name BlogHelper9000`, and promised a series of follow-up posts.

You may have noticed the follow-up posts didn't entirely materialise. The tool did, though, and it kept growing in the background while the blog sat quiet — the `info` command informs me the gap since the last post reached 609 days, which is a number I'd rather not dwell on. The best way I can think of to break that streak is to finally write the series I promised, about the tool that's been quietly accumulating features the whole time.

## The 2022 scorecard

The original requirements, and how they went:

1. **Cross-platform** — yes. It's all .NET (now on .NET 10), developed on macOS, run on Linux in CI, and nothing in it cares which.
2. **Add posts from the command line** — yes, `bloghelper add "My new post"` has worked since the early days.
3. **A blog status overview** — yes. The `info` command reports post counts, drafts, and the aforementioned days-since-last-post shame counter.
4. **Publish from the command line** — yes, including the filename dance Jekyll requires.
5. **Generated featured images with branding** — yes, via ImageSharp and Unsplash. This one was the most fun.
6. **Fix years of inconsistent metadata** — done, and it's the subject of its own post.
7. **Notify Twitter of new posts** — no. Twitter stopped being Twitter, the API stopped being free, and I stopped caring. The only requirement I'm formally abandoning.

Not a bad hit rate, if you ignore the four-year delivery window.

## What it actually became

The 2022 plan was a console app. What exists now is a small ecosystem that I didn't plan so much as it naturally grew:

- **A CLI** (`bloghelper`), rewritten from Oakton onto TimeWarp.Nuru, installable as a dotnet tool.
- **A TUI workspace** built on Terminal.Gui v2 — file browser, command palette, status bar — with a full Neovim instance *embedded inside it* as the editor, speaking MsgPack-RPC to a `nvim --embed` child process.
- **An MCP server**, so an LLM can drive the same blog operations by talking to the exact domain services the CLI uses. The first draft of this post was created by it, which is either delightful or unsettling depending on your disposition.
- **A core library** underneath all three, with the YAML front matter parser I wrote back in the 2022 posts still doing the actual work.

The interesting part, looking back, isn't any single feature. It's that the 2022 decision to keep domain logic separate from the console frontend — made at the time as a result of my experience — is the only reason the TUI and the MCP server were cheap to add. Each new frontend has been a thin adapter over the same `PostManager` and `BlogService` classes.

## The plan, such as it is

Over the next year I'm going to write the whole thing up properly: the solution structure, the command-line framework migration, the YAML parsing, the testing approach, the image pipeline, the build, the MCP server, and a long stretch on the Neovim embedding, which turned out to be the deepest rabbit hole of the lot.

One or two posts a week. The tooling that generates the posts will be dogfooding itself the entire way, and if the days-since-last-post counter climbs back into triple digits, you have my permission to laugh at me.
