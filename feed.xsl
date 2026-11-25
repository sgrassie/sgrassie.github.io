<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>RSS Feed — <xsl:value-of select="/rss/channel/title"/></title>
        <style>
          :root {
            --bg: #faf7f1; --surface: #ffffff; --text: #2b2620;
            --text-2: #5c5449; --text-3: #6f6659; --border: #e5decf;
            --accent: #96591b; --accent-2: #c08a3e;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #191813; --surface: #201e18; --text: #e8e3d6;
              --text-2: #aaa192; --text-3: #968e7e; --border: #35322a;
              --accent: #d9a65c; --accent-2: #c08a3e;
            }
          }
          * { box-sizing: border-box; margin: 0; }
          body {
            background: var(--bg); color: var(--text);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
            line-height: 1.6; padding: 2.5rem 1.25rem 4rem;
          }
          .wrap { max-width: 44rem; margin: 0 auto; }
          .notice {
            padding: 1.25rem 1.4rem; background: var(--surface);
            border: 1px solid var(--border); border-left: 3px solid var(--accent-2);
            border-radius: 8px; margin-bottom: 2.5rem;
          }
          .overline {
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase;
            color: var(--text-3);
          }
          h1 { font-size: 1.75rem; margin-top: 0.35rem; line-height: 1.2; }
          .desc { color: var(--text-2); margin-top: 0.5rem; font-size: 0.98rem; }
          .feed-bar {
            display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: center;
            margin-top: 1rem;
          }
          .feed-url {
            flex: 1 1 16rem; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 0.82rem; padding: 0.55rem 0.75rem; background: var(--bg);
            border: 1px solid var(--border); border-radius: 6px; color: var(--text);
          }
          .btn {
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 0.78rem; padding: 0.55rem 0.9rem; border-radius: 6px;
            border: 1px solid var(--accent-2); background: var(--surface);
            color: var(--accent); cursor: pointer; text-decoration: none;
          }
          .btn:hover { background: var(--bg); }
          h2 { font-size: 0.75rem; margin-bottom: 0.75rem; }
          ol { list-style: none; padding: 0; }
          li {
            padding: 1rem 0; border-bottom: 1px solid var(--border);
          }
          li a {
            color: var(--text); text-decoration: none; font-weight: 600; font-size: 1.05rem;
          }
          li a:hover { color: var(--accent); text-decoration: underline; }
          .meta {
            display: block; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 0.72rem; color: var(--text-3); margin-bottom: 0.25rem;
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="notice">
            <p class="overline">RSS Feed</p>
            <h1><xsl:value-of select="/rss/channel/title"/></h1>
            <p class="desc">
              This is an RSS feed. Copy the URL below into your feed reader (such as NetNewsWire, Feedly, Inoreader, or Miniflux) to follow new posts.
            </p>
            <div class="feed-bar">
              <input id="feed-url" class="feed-url" type="text" readonly="readonly">
                <xsl:attribute name="value">
                  <xsl:value-of select="/rss/channel/atom:link/@href"/>
                </xsl:attribute>
              </input>
              <button id="copy-feed" class="btn" type="button">Copy URL</button>
              <a class="btn">
                <xsl:attribute name="href">
                  <xsl:value-of select="/rss/channel/link"/>
                </xsl:attribute>
                Visit blog &#8594;
              </a>
            </div>
          </div>

          <h2 class="overline">Recent articles</h2>
          <ol>
            <xsl:for-each select="/rss/channel/item">
              <li>
                <span class="meta"><xsl:value-of select="pubDate"/></span>
                <a>
                  <xsl:attribute name="href">
                    <xsl:value-of select="link"/>
                  </xsl:attribute>
                  <xsl:value-of select="title"/>
                </a>
              </li>
            </xsl:for-each>
          </ol>
        </div>
        <script>
          (function () {
            var btn = document.getElementById('copy-feed');
            var inp = document.getElementById('feed-url');
            if (!btn || !inp) return;
            btn.addEventListener('click', function () {
              if (navigator.clipboard &amp;&amp; navigator.clipboard.writeText) {
                navigator.clipboard.writeText(inp.value).then(function () {
                  btn.textContent = 'Copied';
                  setTimeout(function () { btn.textContent = 'Copy URL'; }, 2000);
                });
              } else {
                inp.select();
                document.execCommand('copy');
                btn.textContent = 'Copied';
                setTimeout(function () { btn.textContent = 'Copy URL'; }, 2000);
              }
            });
          })();
        </script>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
