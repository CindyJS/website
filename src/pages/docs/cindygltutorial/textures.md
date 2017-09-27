---
title: CindyGL Tutorial - Textures (with Live Coding)
---
<script src="https://codemirror.net/lib/codemirror.js"></script>
<script src="https://codemirror.net/mode/clike/clike.js"></script>
<script src="https://codemirror.net/addon/edit/matchbrackets.js"></script>
<script src="https://codemirror.net/addon/edit/closebrackets.js"></script>
<link rel="stylesheet" property="stylesheet" type="text/css" href="https://codemirror.net/lib/codemirror.css">
<link rel="stylesheet" property="stylesheet" type="text/css" href="https://codemirror.net/theme/zenburn.css">
<link rel="stylesheet" property="stylesheet" type="text/css" href="livecoding.css">
<script type="text/javascript" async  src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-MML-AM_CHTML">
</script>
<script type="text/x-mathjax-config">
MathJax.Hub.Config({
tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}
});
</script>
<script type="text/javascript" src="/dist/snapshot/Cindy.js"></script>
<script type="text/javascript" src="/dist/snapshot/CindyGL.js"></script>
<script id="csinit" type="text/x-cindyscript">
createimage("plot", 800, 800);
colorplot("plot", [0,0,0]);
drawcmd() := (
  drawimage((-1,0), (1,-1), "earth");
);
resetclock();
</script>
<script id="csdraw" type="text/x-cindyscript">
drawcmd();
</script>
<div id="appletcontainer">
  <div id="applet">
    <div id="code"></div>
    <div id="CSCanvas"></div>
    <button id="fs">Enter fullscreen</button>
  </div>
</div>
<script type="text/javascript">
var cdy;
window.onload = function() {
  cdy = CindyJS({
    ports: [{
      id: "CSCanvas",
      transform: [{visibleRect:[-1.1,-1.1,1.1,1.1]}],
      background: "rgb(100,100,100)"
    }],
    scripts: "cs*",
    autoplay: true,
    images: {"earth": "earth.jpg"},
    use: ["CindyGL"],
    language: "en"
  });

  var btn = document.getElementById("fs");
  var div = document.getElementById("applet");
  btn.onclick = function() {
    (div.requestFullscreen ||
     div.webkitRequestFullscreen ||
     div.mozRequestFullScreen ||
     div.msRequestFullscreen ||
     function(){}).call(div);
  };
  
  
  var myCodeMirror = CodeMirror(document.getElementById("code"), {
    value: `drawimage((-1,0), (1,-1), "earth");`,
    autoCloseBrackets: true,
    matchBrackets: true,
    //lineNumbers: true,
    lineWrapping: true,
    theme: "zenburn"
  });

  myCodeMirror.on("change", function(cm, change) {
    console.log("something changed! (" + change.origin + ")");
    cdy.evokeCS(`drawcmd() := (
      ${cm.getValue()}
      )`);
  });

  var codes = document.getElementsByClassName("lang-cindyscript");
  for(i in codes) {
    codes[i].parentElement.onclick = function(e) {
      console.log(this.innerText);
      myCodeMirror.setValue(this.innerText.trim())
    }
  }
}
</script>


In this tutorial, you will learn how to read from textures or the webcam. Then you will also learn how to write to textures, and we will build an application that uses a feedback loop for an efficient rendering procedure.

## Prerequisites

In this tutorial, we assume that you have already seen [how to create basic fundamental CindyJS applets that use `colorplot`](creatingapplets.html).

## Loading a texture to CindyJS

When you are [creating an HTML applet](creatingapplets.html), then you can load images. First, put a picture you want to load to CindyJS in a folder. For this tutorial, we will use the free texture [earth.jpg](earth.jpg) (from [http://planetpixelemporium.com/earth.html](http://planetpixelemporium.com/earth.html)). If you want to create an applet that loads the image, which has to be stored in the *same folder* where you want to create your applet, you can copy&paste the following code and save `loadimage.html`:
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
      drawimage(A, B, "earth");
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
      images: {"earth": "earth.jpg"}
    });
    </script>
  </body>
</html>
```
If you open the HTML-file you will see [this applet](loadimage.html):

<iframe src="loadimage.html" width="530" height="330"></iframe>

The important part of this source is the configuration `images: {"earth": "earth.jpg"}`, which loads the local image that can be accessed via the string `"earth"`. [The command `drawimage(A, B, "earth");`](/ref/Image_Manipulation_and_Rendering.html#drawimage$3) draws the picture on the canvas by pinning the lower left and lower right corner to the position of the points A and B.

## Live-Coding within this tutorial

You can also do some live coding within this tutorial. Whenever you click on the large yellow boxes with CindyScript code is copies and evaluated as draw-`script` on the applet on the right. You can assume that the applet on the right has [earth.jpg](earth.jpg) loaded in `"earth"`. The drawing-area covers all points with coordinates between $-1.1$ and $1.1$.

For example, you can make the image dance if you use this code:
```cindyscript
drawimage((-1,sin(seconds())), (1,cos(seconds())), "earth");
```

### Reading at a given pixel-coordinate

Instead of accessing the whole picture via `drawimage`, its colors at a given pixel-coordinate can be read of with [the `imagergb`-function](/ref/Image_Manipulation_and_Rendering.html#imagergb$4).

If one talks about a certain pixel-coordinate, one needs to specify a coordinate system. The function `imagergb(‹pos›,‹pos›,‹imagename›,‹pos›)` returns the color of the at the coordinate given as the fourth argument while assuming that the lower left and right corner coincide with the first two arguments respectively. The result is encoded as a 3-component vector with each entry ranging from 0 to 1, representing the RGB-value. You can think of pinning the given image on the drawing canvas and accessing the given position from that.

The following code reads the color beyound the mouse position:
```cindyscript
drawimage((-1,-1), (1,-1), "earth");
rgb = imagergb((-1,-1), (1,-1), "earth", mouse());
draw(mouse(), color->rgb, size->30);
drawtext(mouse(), rgb, color->[1,1,1]);
```


Also if one wants to access images within `colorplot`, there is no way avoiding this `imagergb`.


Let us use `imagergb` within a `colorplot` and replace the `draw`-script of [loadimage.html](loadimage.html) with

```cindyscript
colorplot(
  imagergb((-1,-1), (1,-1), "earth", #+0.03*(sin(40*#.x), cos(40*#.y)))
);
```
Then a similar image is rendered, which will read our image at a individual coordinate. The  additional term `+0.3*(sin(4*#.x), cos(4*#.y))` distorts the image.

An often useful modifier for the `imagergb`-command is `repeat->true`. When a color outside the actual image is read, this modifier will take care that the image is interpreted as it was repeated again and again in both directions:
```cindyscript
colorplot(
  imagergb((0,0), (1,0), "earth", #, repeat->true)
)
```

# Mapping a texture to a sphere

Our aim is to map this map of the earth onto a sphere:
<iframe src="earth.html" width="530" height="530"></iframe>

How can such a three-dimensional image of the earth obtained via a `colorplot`? You can consider this as a primer in ray-marching with `colorplot`. Let us imagine that behind each pixel with pixel-coordinate `#` is a ray. This ray will or will not intersect the sphere. If the ray eventually intersects the sphere, we compute the first intersection point between ray and sphere. Then, we apply a time-dependent rotation to the intersection point on the sphere and calculate the sphere-coordinate of the rotated point. We can determine which piece of earth lays at that sphere-coordinate by looking it up in the texture [earth.jpg](earth.jpg) we will display the corresponding color at position `#`.

For mathematical simplicity, we will think of the earth as a the unit sphere, which is the set of all points
$$S^2 = \\{ s \in \mathbb{R}^2 \mid s_1^2 + s_2^2 + s_3^2=1 \\}.$$

Furthermore, let us agree on the convention that in the three-dimensional space the $x$- and $y$-axes lie flat, while the $z$-axis points to the top. Hence the $z$-axis will intersect both the north- and south-pole of our earth.

To make things easy, we will set our two-dimensional drawing-area to contain all points from $-1.$1 to $1.1$ in both coordinates, and we will use the [ortographic projection](https://en.wikipedia.org/wiki/Orthographic_projection). So by the definition of our axes, we imagine that the ray 
$$r_{\text{#}}(t) = (\text{#}.x, t, \text{#}.y)$$
lays behind a pixel with coordinates `#`.

Where does this ray $r_{\text{#}}$ intersect the unit sphere $S^2$ first? It is clear that it will intersect the unit-sphere iff $|\text{#}|<1$. Any intersection point `s` must fulfill $s_1^2 + s_2^2 + s_3^2=1$. We can use `s = (#.x, -re(sqrt(1-#*#)), #.y)`. The product `#*#` is an abbreviation for the dot-product of $\text{#}$ with itself and is equivalent to $x^2+y^2$ if $\text{#}=(x,y)$. The given `s` lays on the sphere because it fullfills
$$s_1^2+s_2^2+s_3^2 = x^2 + (1-(x^2+y^2)) + y^2 = 1.$$
We took the negative sign in the second component `-re(sqrt(1-#*#))` to obtain the first intersection of the ray with the sphere. Let us start with the following toy-code:
```cindyscript
colorplot(
  if(|#|<1,
    s = (#.x, -re(sqrt(1-#*#)), #.y); //point on S^2 "behind" pixel
    grey(s*[0,-1,1]) //scalar product of normal and some random vector
    ,
    red(1) //use red if no sphere-intersection
  )
);
```
Let us compute the coordinates of `s` on the sphere using inverse trigonometric functions with `lon = arctan2([s.x, s.y]);` and `lat = re(arcsin(s.z));`. We obtain angles $lon\in (-\pi, pi)$ and $lat\in (-\tfrac{\pi}{2}, \tfrac{\pi}{2})$. We want to read of the pixel from our texture [earth.jpg](earth.jpg), which is an [equirectangular projection](https://en.wikipedia.org/wiki/Equirectangular_projection) of our earth. In order to read the correct coordinates, we pin the lower left and lower right corner to $(-\pi, -\tfrac{\pi}{2})$ and $(\pi, -\tfrac{\pi}{2})$ respectively. In CindyScript this means, we take the color with `imagergb((-pi, (-pi/2)), (pi, (-pi/2)), "earth", (lon, lat))`.

Altogether, we now have:
```cindyscript
colorplot(
  if(|#|<1,
    s = (#.x, -re(sqrt(1-#*#)), #.y); //point on S^2 "behind" pixel
    lon = arctan2([s.x, s.y]);
    lat = re(arcsin(s.z));
    imagergb((-pi, (-pi/2)), (pi, (-pi/2)), "earth", (lon, lat))
    ,
    red(1) //use red if no sphere-intersection
  )
);
```

Now let us make the applet look a bit nicer than this. Obviously, this red background is terrible. Do we want to have a black background? This can be done by replacing `red(1)` with `red(0)` or `[0,0,0]`.

To make everything more interesting and simulate the sunlight, we also compute a light-factor `light = (max(0.1, s*[-.3,-1,0.1]));` based on the dot product between the normal-vector `s` and the randomly choosen sun-direction `[-.3,-1,0.1]`. If we multiply our color output with this factor, we get some shading:

```cindyscript
colorplot( if(|#|<1,
  s = (#.x, -re(sqrt(1-#*#)), #.y);
  light = (max(0.1, s*[-.3,-1,0.1]));
  lon = arctan2([s.x, s.y]);
  lat = re(arcsin(s.z));
  imagergb((-pi, (-pi/2)), (pi, (-pi/2)), "earth", (lon, lat))*light;
  , [0,0,0]
));
```

We are missing animation! Let us rotate `s` around the z-axis to obtain another point on the sphere, which later will determine the color. The rotation around the z-axis can be done with a [rotation matrix](https://en.wikipedia.org/wiki/Rotation_matrix#Basic_rotations). Matrices are natively supported within CindyJS:
```cindyscript
colorplot( if(|#|<1,
  s = (#.x, -re(sqrt(1-#*#)), #.y);
  light = (max(0.1, s*[-.3,-1,0.1]));
  s = [[cos(seconds()), sin(seconds()), 0],
       [-sin(seconds()), cos(seconds()), 0],
       [0,0,1]]*s; //matrix*vector
  lon = arctan2([s.x, s.y]);
  lat = re(arcsin(s.z));
  imagergb((-pi, (-pi/2)), (pi, (-pi/2)), "earth", (lon, lat))*light;
  , [0,0,0]
));
```
The direction of the rotation was chosen such that the "sun" will rise in "the east". 


Altogether, if you would create it [as an HTML-Applet](earth.html) one could have the following source:
```
<!DOCTYPE html>
<html>
  <head>
    <script type="text/javascript" src="https://cindyjs.org/dist/snapshot/Cindy.js"></script>
    <title>A spinning earth</title>
  </head>

  <body>
    <div id="CSCanvas"></div>
    <script id="csdraw" type="text/x-cindyscript">
      R = [
        [cos(seconds()), sin(seconds()), 0],
        [-sin(seconds()), cos(seconds()), 0],
        [0,0,1]
      ];
           
      colorplot(
        if(|#|<1,
          s = (#.x, -re(sqrt(1-#*#)), #.y); //point on S^2 "behind" pixel
          light = (max(0.1, s*[-.3,-1,0.1]));
          s = R*s;
          lon = arctan2([s.x, s.y]);
          lat = re(arcsin(s.z));
          light*imagergb((-pi, (-pi/2)), (pi, (-pi/2)), "earth", (lon, lat));
          ,
          [0,0,0]
        );
      )
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
          visibleRect: [-1.1, 1.1, 1.1, -1.1]
        }]
      }],
      images: {"earth": "earth.jpg"}
    });
    </script>
  </body>
</html>

```

### Accessing the Webcam

If you want to use the camera, you have to evoke `video = cameravideo();` once. Usually, this is done in the `init`-script. If you have a webcam, and you want to play around with it in live-coding, please **click** <a href="#accessing-the-webcam" onclick="cdy.evokeCS('video = cameravideo();')">here to evoke `video = cameravideo();`</a> in the live-coding app and accept to access your webcam, **otherwise the code snippets in this section will not work**. Several browsers indicate that the webcam is active in their address bar.

Now if you use the code
```cindyscript
drawimage((-1,0), (1,-1), video);
```
you should see your webcam video-stream.

If you read the stream `video` within `colorplot` through `imagergb`, you can mess up yourself however you like. You can deform yourself:
```cindyscript
colorplot(
  imagergb((-1,-.5),(1,-.5), video, #*|#|^2);
);
```

Or you can operate on the colorspace and show yourself in inverted colors:
```cindyscript
colorplot(
    [1,1,1]-imagergb((-1,0),(1,0), video, #, repeat->true);
);
```
Can you map yourself on the spinning earth above?

It is also possible to load videos to a CindyJS applet by adding an option `videos: {"video": "videoname.mp4"}`. Then after running `playvideo("video")`, you can access the image in the same way. If you want to see an example, there is a [CindyJS applet deforming a video shot by Henry Segerman with a spherical camera](/gallery/main/Jugglers/).

## Writing to Textures
`colorplot` can, instead of drawing to the whole drawing screen, plot to a texture. 

One can create a texture with `createimage(‹imagename›,‹int›,‹int›)` as described in [the reference](/ref/Image_Manipulation_and_Rendering.html#createimage$3).

Then one can plot to a texture via [`colorplot(‹pos›,‹pos›,‹imagename›,‹expr›)`](/ref/Function_Plotting.html#colorplot$3) where the two first arguments specify the coordinates of the lower left and lower right point again. `‹imagename›` is the target texture, and `‹expr›` is the program that is executed for each pixel of the target texture depending on the pixel coordinate `#`.

In this live coding applet, a texture has automatically created in the init script via `createimage("plot", 800, 800)`.

We can write something on this texture and output it as follows:
```cindyscript
A = (-1,-0.5);
B = (.2,-1);
colorplot(A, B, "plot", //renders to "plot"
  grey(.5 + .5*sin(20*(#*#)))
); 
drawimage(A, B, "plot");
```
You can change the coordinates $A$ and $B$. However you always should see the section of essentially the same plot, because `colorplot` and `drawimage` have the same coordinate-system.

Both the commands `colorplot` and `imagergb` can be used with only a texture as an argument. Then CindyGL tries to fit the texture with the entire visible drawing area and uses the coordinates of this environment.

If one reads and write to the same texture with some deformations in between, a little mirracle occurs: 
```cindyscript
c = 0.12;
colorplot("plot", // plots to texture
 z = complex(#*1.5);
 if(|z|<2, // if |z|<2 take the color at z^2+c 
  imagergb("plot", z^2+c)// and make
   + (0.01, 0.02, 0.03),  // it brighter
  (0, 0, 0) // otherwise: display black.
 )
);
colorplot(imagergba("plot", #));
```
Using this technique to render the Julia set is inspired by [Felix Woitzel](https://experiments.withgoogle.com/chrome/progressive-julia-fractal).

Try to replace `c = 0.12;` with `c = complex(mouse());` to obtain some interactivity. A more sophisticated version of this applet can be found [in our gallery](/gallery/main/JuliaConjugated/). Also, [IFS were rendered in CindyGL](/gallery/main/Barnsley/) with this technique.
