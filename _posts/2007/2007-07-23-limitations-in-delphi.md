---
layout: post
title: Limitations in Delphi
tags: [delphi]
hidden: False
published: 23/07/2007
ispublished: True
---
One of the things in Delphi that frustrates me is the inability to match on strings in case statements. For those people who haven't done delphi before, case statements are very similar to c++ switch statements, and only opererate on ordinal types.. Now I've not done any Java, but as I understand it you can't switch on strings in that language either. You can in c# though.

I think C# is generally better, but that said I have it on good authority that templates are still much better in C++ than generics are in C#.

Anyway, that's enough rambling. On to the solution.

What you need to do in order to get around this limitation is cheat. Well, it's not really cheating. The tricks is to use a look up function that accepts a string, one that you are expecting, which you have in a string array. Then all you need do is return which element of the array has been matched, and use that in the case statement.

{% highlight delphi %}
function TClassName.lookupFunction(lookup: string): integer;
const
  ARRAY = ['one', 'two', 'three', 'four', 'five'];
var
  i: integer;
begin
  for i := 0 to Length(ARRAY) do
    if lookup = ARRAY[i] then
    begin
      Result := i;
      break;
    end
end

procedure TClassName.someProc(somestring: string);
begin
  case LookupFunction(somestring)
  1 : //code that does stuff for 'one'
  2 : //code that does stuff for 'two'
  3 : //code that does stuff for 'three'
  4 : //code that does stuff for 'four'
  5 : //code that does stuff for 'five'
end
{% endhighlight %}

See! That's how simple it is.

Maybe in a future version of delphi borland/codegear will introduce native string support for case statements. I won't hold my breather though.
