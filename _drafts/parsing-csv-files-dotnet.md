---
layout: post
title: Parsing CSV files with dotnet
---
#Introduction
Parsing CSV files is the bread and butter of a developer who makes line of business applications. It is a simple (usually) data format that is used to exchange data from one system to another. Usually this is for a data migration from an old legacy system to the new shiny system. Often it is for data exchange between two applications that have no other way of sharing data.

I've seen CSV parsing be used as an interview question, from both sides of the table, and it is suprising just how many people will apply for a position and then fail even the most basic task of opening a file for reading and reading a few lines, or even be able to discuss it.

When it comes to data exchange, particularly when it comes to data migration from one system to another, it is important to take the time to make sure that you do as thorough a job as possible, and cover all the eventualalities, as a mistake here will cost you time and effort to fix in the future. 

#The way I would do it for an interview
When faced with this task in a coding test, or having to talk about it in an interview, I would definitely write everything by hand:

- Opening a file stream and stream reader
- Reading a line
- string.split on the line to break the csv into chunks
- process the chunks into some POCO
