---
title: Learning ReactiveUI for fun and profit: Hello, World!
published: 17/11/2013
layout: post
category: Uncategorized
metadescription: Learning ReactiveUI for fun and profit: Hello, World!
---
<h1>Introduction</h1>
I want to start learning how to use ReactiveUI to develop a WPF desktop application, and I have experience with building MVVM applications with Prism and Caliburn.Micro, so the challenge for me is learning RxUi's opinions and how to do stuff in an asynchronous fashion. I'm going to assume that anyone reading this has some understanding of WPF, XAML, MVVM and some familiarity with C#.
<h1>Baby Steps</h1>
Our goal here is simple: Create a basic WPF application, configure ReactiveUI and display a view with a label on it which says "Hello, World!". Not very original, but it should enable us to get a very basic grasp of the library.

Ok?

Start a new WPF application, and add ReactiveUI to it via NuGet. Make sure to add ReactiveUI-Xaml to it, as that will allow us to exciting things with WPF.
