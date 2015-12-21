---
title: CindyJS Overview
---

**CindyJS is a framework to create interactive
(mathematical) content for the web.**

It aims to be compatible with [Cinderella](http://cinderella.de/),
providing an interpreter for the scripting language CindyScript
as well as a set of geometric operations which can be used to describe
constructions.
Together, these components make it very easy to visualize various
concepts, from geometry in particular and mathematics in general,
but also from various other fields.

## Examples

Examples on the web can be seen [here](http://science-to-touch.com/CJS/).

There is also [an `examples` directory](/examples/)
inside the repository, demonstrating individual functions and operations.

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
   <script type="text/javascript" src="http://cinderella.de/CindyJS/latest/Cindy.js"></script>
   ```
   This adds a function called `createCindy` to the global scope.
2. Invoke that function, providing an object with further content description.
   See [the `createCindy` documentation](/ref/createCindy.html) for details.
   Usually you don't have to ensure that the document is fully loaded
   by the time you make that invocation;
   CindyJS will postpone initialization appropriately.
3. For custom actions beyond simple dynamic geometry,
   you can write CindyScript code encosed in HTML `<script>` tags.
   Some CindyScript documentation is [available](/ref/),
   but it often refers to functionality of Cinderella, not CindyJS.

## Bugs and feature requests

If something doesn't work the way you want it or need it,
feel free to [file an issue](https://github.com/CindyJS/CindyJS/issues)
in our GitHub ticket system.
Be sure to check for known issues first, though.

## License

CindyJS is licensed under the
[Apache 2 license](/license.html).
