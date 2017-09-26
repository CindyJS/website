---
title: CindyGL Tutorial - Textures
---
<script type="text/javascript" async  src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-MML-AM_CHTML">
</script>
<script type="text/x-mathjax-config">
MathJax.Hub.Config({
tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}
});
</script>

In this tutorial, you will learn how to read from textures, movies or the webcam. Then you will also learn how to write to textures and we will build an application that uses a feedback loops for an efficient rendering procedure.

# Loading a texture to CindyScript

When you are [creating an HTML applet](creatingapplets.html), then you can load images that are stored in the same folder. First put an image you want to load to CindyJS in a folder. For this tutorial, we will use the file [world.jpg](world.jpg). Then open your editor of your choice and copy&paste the following code into it and save a file `loadimage.html` in the same folder:
```
<!DOCTYPE html>
<html>
  <head>
    <script type="text/javascript" src="https://cindyjs.org/dist/latest/Cindy.js"></script>
    <title>Loading Images in CindyJS</title>
  </head>

  <body>
    <div id="CSCanvas"></div>

    <script id="csdraw" type="text/x-cindyscript">
      drawimage(A, B, "image");
    </script>

    <script type="text/javascript">
    CindyJS({
      scripts: "cs*",
      geometry: [
        {name:"A", kind:"P", type:"Free", pos:[-9, -8]},
        {name:"B", kind:"P", type:"Free", pos:[9, -9]},
      ],
      ports: [{
        id: "CSCanvas",
        width: 500,
        height: 300,
      }],
      images: {"image": "world.jpg"}
    });
    </script>
  </body>
</html>
```
If you open the HTML-file you will see [this applet](loadimage.html):

<iframe src="loadimage.html" width="530" height="330"></iframe>

The important part of this source is the configuration `images: {"image": "world.jpg"}`, which loads the local image. [The command `drawimage(A, B, "image");`](/ref/Image_Manipulation_and_Rendering.html#drawimage$3) draws the picture on the canvas by pinning the lower left and lower right corner to the position of the points A and B.

### Reading at a given pixel-coordinate

Instead of accessing the whoole picture via `drawimage`, its colors at a given pixel can be read of with [the `imagergb`-function](/Image_Manipulation_and_Rendering.html#imagergb$4). One needs this function within `colorplot` if one wants to access images.

The function `imagergb(‹pos›,‹pos›,‹imagename›,‹pos›)` returns the color of the at the coordinate given as forth argument while assuming that the lower left and right corner coincide with the first two arguments respectively. The result is encoded as a 3-component vector with each entry ranging from 0 to 1, representing the rgb-value. You can think of pinning the given image on the drawing canvas and accessing the given position from that.


Let us use `imagergb` within a `colorplot` and replace the `draw`-script of [loadimage.html](loadimage.html) with

```
<script id="csdraw" type="text/x-cindyscript">
colorplot(
  imagergb(A, B, "image", #+0.3*(sin(4*#.x), cos(4*#.y)))
);
</script>
```
Then a similar image is rendered, which will read our image at a individual coordinate. Using the  additional term `+0.3*(sin(4*#.x), cos(4*#.y))` it was easy to distort the image:

<iframe src="imagecolorplot.html" width="530" height="330"></iframe>

# Maping the texture to a sphere

Our aim is to map this map of the world onto a sphere:
<iframe src="world.html" width="530" height="530"></iframe>
