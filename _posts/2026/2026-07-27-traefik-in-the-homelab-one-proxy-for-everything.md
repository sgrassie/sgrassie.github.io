---
layout: post
title: "Traefik in the homelab: one proxy for everything"
description: "How every self-hosted service in my homelab ended up behind a single Traefik instance: names instead of ports, and HTTPS everywhere on a LAN."
tags: [traefik,homelab,docker]
featured_image: /assets/images/2026-07-27-traefik-in-the-homelab-one-proxy-for-everything.webp
image: /assets/images/2026-07-27-traefik-in-the-homelab-one-proxy-for-everything.webp
featured: False
hidden: False
published: 27/07/2026
ispublished: True
---

Everything self-hosted on my network now sits behind a single Traefik instance. This post kicks off a series about how that happened, what the setup looks like, and the assorted yaks that got shaved along the way (there is a home-made certificate authority in this series; you have been warned).

## The problem

The homelab grew the way homelabs do. One service becomes four, four becomes a dozen, and suddenly nothing is memorable: this thing is on port 8096, that one is on 5002, a third is on 3000 but only over plain HTTP. Bookmarks help until they don't. What I wanted was names, `chesskit.cybertron.lan` rather than an IP and a port, and I wanted HTTPS everywhere, even though nothing here is reachable from the internet.

## Why Traefik

The short version: everything I run is already in Docker, and Traefik's Docker provider means a service declares its own routing in the compose file that deploys it. A handful of labels, restart the container, and the proxy knows about it. No central nginx config to edit, no reload step to forget.

The labels for a typical service look like this:

```yaml
labels:
  - traefik.enable=true
  - traefik.http.routers.chesskit.rule=Host(`chesskit.cybertron.lan`)
  - traefik.http.routers.chesskit.entrypoints=websecure
  - traefik.http.routers.chesskit.tls=true
  - traefik.http.services.chesskit.loadbalancer.server.port=80
```

That is the whole integration. The service and the proxy never share a compose file; they share a Docker network and a naming convention.

## The shape of the thing

The pieces, each of which gets its own post:

- **One Traefik container**, with the Docker socket mounted read-only, watching for labelled containers.
- **An external Docker network called `proxy`** that Traefik and every fronted service join.
- **Wildcard DNS** so `*.cybertron.lan` resolves to the box Traefik runs on.
- **An internal certificate authority** issuing a wildcard cert for `*.cybertron.lan`, because HTTPS on a LAN is worth having and Let's Encrypt doesn't hand out certificates for `.lan`.
- **A private registry on the NAS** that built images get pushed to.

None of this is exotic. Most of it is the standard homelab Traefik arrangement you'll find in a hundred blog posts, and this series will not pretend otherwise. What I'll try to add is the reasoning, the mistakes, and the specific sharp edges I hit, because the hundred blog posts mostly skip those.

## What this series is not

It is not a Kubernetes series. It is not a "zero trust homelab" series. It is one proxy, on one network, run by one person, and deliberately so. The whole point of the exercise was to make the lab nicer to live with, not to give myself a second job operating it.

Next post: What you need to actually understand Traefik: routers, services and entrypoints.