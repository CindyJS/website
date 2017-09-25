---
title: Creating CindyGL-applets
---
<script type="text/javascript" async  src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-MML-AM_CHTML">
</script>
<script type="text/x-mathjax-config">
MathJax.Hub.Config({
tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}
});
</script>

In this tutorial, we will demonstrate, how a basic CindyGL-applet can be built and how it can interact with CindyJS-geometry.

## Prerequisites

We assume that you already have seen some CindyScript and the core functionality of the colorplot-command, for example in [the CindyGL live coding tutorial](livecoding.html). 

Some basic knowledge in *HTML* or *JavaScript* is favourable to create applets, but not essential.

## Generating Applets with Cinderella
If you have [a recent version of Cinderella](https://cinderella.de) installed, you can create an applet there and export them as CindyJS file via File->Export to CindyJS. In Cinderella, scripts can be added via Scripting->Edit Scripts. In most cases, the `draw` script is the most suitable place for a `colorplot` command.

However, if you have a `colorplot` within Cinderella, it might run comparingly slow there, because, in contrast to CindyJS, Cinderella calculates the colorplot on the CPU instead of the GPU. Also, it is not guaranteed whether the exported `colorplot` will work, because CindyJS only supports a limited subset of CindyScript Code, see [the CindyJS reference manual for a list of supported operations](ref/Function_Plotting.html#colorplots).

Nevertheless, if you have a complicated geometric construction involved, Cinderella is the best choice to generate Boilerplate-HTML via its CindyJS-Export. Then the exported HTML file can be enhanced by manual editing.

## Writing your Boilerplate-HTML
A CindyJS-applet usually is embedded in an HTML File. If you want to create (and understand) an applet from scratch, then a good starting point is the presented minified Code, which then can be deformed in any CindyGL-applet you wish to create.

In this tutorial, we will demonstrate how a minimal HTML file can be generated that renders a colored area. 

 You can either copy and paste the following Code in your favourite text editor and save it as `boilerplate.html` (or any file-name ending with `.html` you like):
```
<!DOCTYPE html>
<html>
  <head>
    <script type="text/javascript" src="https://cindyjs.org/dist/latest/Cindy.js"></script>
    <title>A CindyJS-Applet</title>
  </head>

  <body>
    <div id="CSCanvas"></div>

    <script id="csdraw" type="text/x-cindyscript">
      colorplot( [#.x, #.y, (1+sin(seconds()))/2 ] );
    </script>

    <script type="text/javascript">
    CindyJS({
      scripts: "cs*",
      autoplay: true,
      ports: [{
        id: "CSCanvas",
        width: 500,
        height: 500,
        transform: [{
          visibleRect: [0, 1, 1, 0]
        }]
      }]
    });
    </script>
  </body>
</html>


```
You can open [the file `boilerplate.html`](boilerplate.html) with your browser. And hurray! You should see a fancy colored rectangle as below:
<iframe src="boilerplate.html" width="530" height="530"></iframe>

Let me walk through the file and shortly the significant parts this file.

At the top we have:
```
  <script type="text/javascript" src="https://cindyjs.org/dist/latest/Cindy.js"></script>
```
It loads the most recently released version of CindyJS. That means, whenever a new version of CindyJS is released, then the referred .js-file might change. If you want to keep the version fixed, then open [https://cindyjs.org/dist/latest/Cindy.js](https://cindyjs.org/dist/latest/Cindy.js) and the URL will automatically convert to its current version. At the state of writing, this is [https://cindyjs.org/dist/v0.8.5/Cindy.js](https://cindyjs.org/dist/v0.8.5/Cindy.js). You can include this file instead by replacing the address behind `src="`. Or you even can download a local copy of this file and refer to this local file instead.

If you download a local file of CindyJS, then you might also need some files for each required plugin. For instance, if you use `colorplot` in one of the scripts, then you also need to download the .js-file for the CindyGL-plugin and save it in the same directory. The CindyGL-plugin can be downloaded from following URL: [https://cindyjs.org/dist/latest/CindyGL.js](https://cindyjs.org/dist/latest/CindyGL.js).

Using a fixed version guarantees your generated applet will never change.


Another important part of the HTML-file is the drawing-canvas:
```
<div id="CSCanvas"></div>
```
A CindyJS-applet always needs a `<div>`-element, which is the target for rendering. That is the place where the content of the applet will be displayed. It can be put anywhere in your generated page. The `<div>`-element can also be modified with CSS parameters.

Similiar to javaScript-scripts, also CindyScript can be embedded in the html:
```
<script id="csdraw" type="text/x-cindyscript">
  colorplot( [#.x, #.y, (1+sin(seconds()))/2 ] );
</script>
```
All the code between the two `<script>`-tags is CindyScript code that will be evaluated for every frame that is drawn. It is possible to have also other scripts for other events within a CindyJS-applet. [In the reference manual](ref/createCindy.html#scripts), all of them are described. [Later](#interaction-with-geometry) we will use a `init`-script for CindyScript code that is executed once at the initialization.

Here it is a colorplot, that colorizes each pixel according to its pixel coordinate `#` and the current time.

With the code explained so far, all the CindyJS-specific details would not cause Anything. CindyJS has to be initialized via JavaScript:
```
<script type="text/javascript">
CindyJS({
  scripts: "cs*",
  autoplay: true,
  ports: [{
    id: "CSCanvas",
    width: 500,
    height: 500,
    transform: [{
      visibleRect: [0, 1, 1, 0]
    }]
  }]
});
</script>
```
The initialization function `CindyJS` takes an dictionary of several options. The option `scripts: "cs*"` says that all scripts that start with `cs` will be used for the applets. In the example so far, it is only `csdraw`, which will be interpreted as a script for the *draw*-event. [Other follow TODO].

`autoplay:true` says that the applet should trigger its draw-script always when a new frame is rendered. Without this option, the picture is only redrawn when something changes in the construction. In our example, `seconds()` continuously changes, and therefore `autoplay:true` makes sense.

The option `ports` specifies the (output) ports:
```
ports: [{
  id: "CSCanvas",
  width: 500,
  height: 500,
  transform: [{
    visibleRect: [0, 1, 1, 0]
  }]
}]
```
Usually one only has one port. `id: "CSCanvas"` refers to `<div id="CSCanvas">` that has been somewhere else in the HTML file. In the next two lines `width` and `height` of the output-element are specified. If these options are omitted, those that are specified via CSS or HTML for the output element will be taken. This makes often sense, if one wants to build a page filling applet with `<div id="CSCanvas" style="width:100vw; height:100vh;">`. The `transform` option can be used to specify the visible area. Here `visibleRect: [0, 1, 1, 0]` means that both coordinates of the CindyJS-user space lie between $0$ and $1$. The given coordinates are left, top, right and bottom coordinates of a visible rectangle, specified in user coordinates. The coordinate system is chosen in such a way that this rectangle will be fully visible and centered within the widget. If no `transform`-option is specified, per default all coordinates between $-10$ and $+10$ will be visible.

More options are available in [the reference manual](ref/createCindy.html)

## Interaction with geometry.

Now we aim to create an applet that shows two interfering waves as in [the previous tutorial](livecoding.html#interference-of-two-waves), but we want the sources of the waves to be draggable points:
<iframe src="interference.html" width="530" height="530"></iframe>

How can be a HTML-file with this applet be generated? Again, we start with the `boilerplate.html` from above and modify it until we see our desired result.

The geometry can be specified via the `geometry` option in the initialization. We want to add two, freely movable points. This can be done with:
```
  geometry: [
    {name:"A", kind:"P", type:"Free", pos:[-4,4]},
    {name:"B", kind:"P", type:"Free", pos:[3,-8]},
  ],
```
This addes two points at the positions `[-4,4]` and `[3,-8]`. However, they will be freely movable. If you want to add more complicated geometry, using [Cinderella](https://cinderella.de/), or copying code from [the examples](/examples) might be a good idea.

We will drop the `transform` configuration from the ports because we want to have standard-coordinates between $-10$ and $+10$.

The `csdraw`-script will basically show the contents of [the wave interference-example of the tutorial](livecoding.html#interference-of-two-waves). Only `p0` and `p1` is replaced with the points `A` and `B` from our geometry:
```
<script id="csdraw" type="text/x-cindyscript">
  W(x, t, p) := sin(5*|x-p|-t); //helper function
  
  colorplot(
    u = W(#, seconds(), A) + W(#, seconds(), B);
    gray(1/2+u/4) //the last line is the return value!
  );
</script>
```
If you opened this file in a browser now, everything would be black. The reason for that is that `seconds()` returns a number that is too huge for the floating-point numbers of the GPU (in fact `seconds()` returns the Unix timestep, the (fractional) number of seconds after the 01.01.1970). For that, we want to execute the CindyScript command `resetclock()` in the very beginning of the execution. How can this be obtained? For that, we need an `init`-script. It can be added to the applet with the following script-block:

```
<script id="csinit" type="text/x-cindyscript">
  W(x, t, p) := sin(5*|x-p|-t); //helper function
  
  colorplot(
    u = W(#, seconds(), A) + W(#, seconds(), B);
    gray(1/2+u/4) //the last line is the return value!
  );
</script>
```

Altogether, we have the following source:
```
<!DOCTYPE html>
<html>
  <head>
    <script type="text/javascript" src="https://cindyjs.org/dist/latest/Cindy.js"></script>
    <title>Interference of two circular waves</title>
  </head>

  <body>
    <div id="CSCanvas"></div>
    
    <script id="csinit" type="text/x-cindyscript">
      resetclock();
    </script>
    <script id="csdraw" type="text/x-cindyscript">
      W(x, t, p) := sin(5*|x-p|-t); //helper function
      
      colorplot(
        u = W(#, seconds(), A) + W(#, seconds(), B);
        gray(1/2+u/4) //the last line is the return value!
      );
    </script>

    <script type="text/javascript">
    CindyJS({
      scripts: "cs*",
      autoplay: true,
      geometry: [
        {name:"A", kind:"P", type:"Free", pos:[-4,4]},
        {name:"B", kind:"P", type:"Free", pos:[3,-8]},
      ],
      ports: [{
        id: "CSCanvas",
        width: 500,
        height: 500,
        //no transform specified => visible area: [-10,10]^2
      }]
    });
    </script>
  </body>
</html>
```
If you copy and paste it in a html-file, you will get an page that only displayes [this applet](interference.html).
