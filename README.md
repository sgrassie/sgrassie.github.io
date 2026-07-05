My blog.

## Working locally

```sh
script/setup   # install gems (one-off)
script/serve   # preview at http://localhost:4000 with live reload
script/build   # build into _site/
```

Both `serve` and `build` pass extra arguments through to Jekyll, e.g. `script/serve --drafts` to preview drafts. The scripts select the Ruby 3.0.3 toolchain the site builds with.

To promote a post on the home page, set `featured: true` in its front matter — the most recent featured post is pinned to the top of page one with a "Featured" label.

All content is Copyright (c) 2017 Stuart Grassie, except for any published source code, where, unless otherwise stated, is licensed under the MIT License, Copyright (c) 2017 Stuart Grassie.

The source code used to publish the blog is licensed under the MIT License (c) 2017 Stuart Grassie.

Points of interest:

- The _includes/series.html is taken from https://github.com/digitaldrummerj/jekyllforblogseries/blob/master/_includes/series.html
