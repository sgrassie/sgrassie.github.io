---
layout: post
title: linux adventures
description: 
tags: [Linux]
featured_image: /assets/images/2007-08-05-linux-adventures.webp
image: /assets/images/2007-08-05-linux-adventures.webp
hidden: False
published: 05/08/2007
ispublished: True
---
I spent much of the weekend fucking around installing linux on my laptop. I like linux, it's free, and there's loads of cool software available. I tried:
<ul>
	<li>Ubuntu 7.04</li>
	<li>Fedora 7</li>
	<li>opensuse 10.2</li>
</ul>
The actual installations themselves went pretty painlessly, just pop the disk in, and boot from it, and click install. These modern installations are pretty cool, not like the good old days of installing redhat/slackware/debian from multiple floppy discs.

The only problem I had was getting my 3Com 3crwe62092b wireless lan pcmcia card to work. What a pain in the fucking arse that was. Ubuntu Feistey Fawn 7.04 wouldn't even detect it, and Fedora 7 detected it, but it wouldn't work.

Needless to say, I was getting frustrated at this point, and I downloaded opensuse 10.2, specifically a 44mb network install disk. And fuck me, it asked me for wlan details, and connected to my wireless network first time. Ace.

But - and theres always a but - when it rebooted there was a problem. The wireless stopped working. I managed to get the rest of the installation completed using a wired connection. After some further googling, it turns out that the solution to my problem was to download the atmel-firmware, and copy the *.bin's to /lib/firmware. Rebooted and the wireless came up straightway. Hurrah!

I suspect that armed with this new knowledge I should be able to install Ubuntu/Fedora and get the card to work on them, but I'm liking opensuse enough that I'm not sure I can be bothered to reinstall a different distribution again.

This is also the reason that linux isn't ready for the desktop yet - the average person wouldn't spend time googling and recompiling kernels and installing different distributions just to get wireless working on their laptop. It should just work, with no effort. This is the advantage that windows has over linux, the driver support is significantly better.

But it works for me, so fuck em.
