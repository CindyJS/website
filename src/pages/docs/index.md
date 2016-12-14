---
title: Documentation
---

## Getting started

There are essentially two ways to create CindyJS content.
Either you edit the HTML file manually,
or you create the content in [Cinderella](http://cinderella.de/).

### Exporting from Cinderella

In recent versions of Cinderella, the “File” menu has an entry called
“Export to CindyJS” which will create an HTML file with CindyJS content in it.
You can either directly publish that, add descriptive text,
or edit the exported document as described below.

Be aware that not all features of Cinderella will be supported by CindyJS yet.
So have a look at the
[list of known compatibility issues](https://github.com/CindyJS/CindyJS/labels/Cinderella%20compat.)
and test the exported file.
Also be sure that if something (like some geometric element or some label)
vanished by exporting, you don't rely on the fact that it did vanish.
We might add support for that feature later on, causing it to suddenly reappear.

### Manual HTML editing

If you want to build the HTML file manually, it might be best to start
by adapting an [existing example](/examples/).
There are three relevant parts to most CindyJS widgets:

1. Reference the `Cindy.js` script in your HTML file,
   by adding the following line to the header of your file:
   ```html
   <script type="text/javascript" src="/dist/v0.7/Cindy.js"></script>
   ```
   This adds a function called `CindyJS` to the global scope.
2. Invoke that function, providing an object with further content description.
   See [the JavaScript API documentation](/ref/createCindy.html) for details.
   Usually you don't have to ensure that the document is fully loaded
   by the time you make that invocation;
   CindyJS will postpone initialization appropriately.
3. For custom actions beyond simple dynamic geometry,
   you can write CindyScript code encosed in HTML `<script>` tags.
   Some CindyScript documentation is [available](/ref/),
   but it often refers to functionality of Cinderella, not CindyJS.

## Further documentation

### Tutorials

At this point there are no official tutorials for CindyJS.
If you want to write one, please contact the development team.
If you follow the route of exporting content from Cinderella, one of
[Cinderella's tutorials](http://doc.cinderella.de/tiki-index.php?page=Introduction+to+the+Tutorials)
might appeal to you.

### Manuals

The [reference manual](/ref/)
[should](https://github.com/CindyJS/CindyJS/issues/220)
contain a description
of all the CindyScript functions you can use inside your scripts.
It is intended as a reference manual so the descriptions there
may at times be somewhat technical and concentrate on corner cases.
This is the right source to quickly look something up once you know
how CindyJS works in general.
The reference document on
how to [create a CindyJS widget](/ref/createCindy.html) instance
from within your JavaScript code is of particular importance.

A somewhat less technical version which is still very similar is
[the CindyScript documentation for Cinderella](http://doc.cinderella.de/tiki-index.php?page=CindyScript).
The reference manual started out as a copy of this,
but has developed with a slightly different goal since then,
adding technical descriptions and testable examples.
Some other parts of [the Cinderella documentation](http://doc.cinderella.de/)
might be applicable to CindyJS users as well,
particularly if you export content from Cinderella.
If you prefer to hold paper in your hands, the Cinderella manual
has also been released as [a book](https://www.amazon.com/Cinderella-2-Manual-Interactive-Geometry-Software/dp/3540349243).
