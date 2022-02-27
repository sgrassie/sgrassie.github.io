---
layout: post
title: Learning ReactiveUI for fun and profit&#58; Hello, World!
description: 
tags: ['Reactiveui']
featured_image: /assets/images/2013-11-17-learning-reactiveui-for-fun-and-profit-hello-world.webp
image: /assets/images/2013-11-17-learning-reactiveui-for-fun-and-profit-hello-world.webp
hidden: False
published: 17/11/2013
ispublished: True
---
# Introduction
I want to start learning how to use ReactiveUI to develop a WPF desktop application, and I have experience with building MVVM applications with Prism and Caliburn.Micro, so the challenge for me is learning RxUi's opinions and how to do stuff in an asynchronous fashion. I'm going to assume that anyone reading this has some understanding of WPF, XAML, MVVM and some familiarity with C#.

##Baby Steps
Our goal here is simple: Create a basic WPF application, configure ReactiveUI and display a view with a label on it which says "Hello, World!". Not very original, but it should enable us to get a very basic grasp of the library.

Ok?

Start a new WPF application, and add ReactiveUI to it via NuGet. Make sure to add ReactiveUI-Xaml to it, as that will allow us to exciting things with WPF.
