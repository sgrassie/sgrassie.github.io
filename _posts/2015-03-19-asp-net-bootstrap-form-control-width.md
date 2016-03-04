---
layout: post 
published: 19/03/2015
title: ASP.Net Bootstrap 3 form control width
category: asp.net, bootstrap 
metadescription: asp.net, bootstrap, form-control, width
---
Having just been stumped on this for longer than I care to admit, and only finding the answer to my problem buried in a [comment](http://stackoverflow.com/questions/11232627/perfect-100-width-of-parent-container-for-a-bootstrap-input#comment41021912_11232628) on StackOverflow, I'm posting it here for my own future reference:

Q: Using ASP.Net MVC with Bootstrap 3, why won't my `<input>` stretch to the full width of a `<div class="form-group">`, even though I am putting `form-control` on the css class?

A: Because Microsoft override `input`, `select` and `textarea` to have `max-width: 280px` in the default `Site.css` which is added to new projects. Removing this will allow the 100% width from `form-control`.
