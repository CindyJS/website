---
title: CindyGL Tutorial - Rendering 3D Scenes
---
<script src="codemirror/lib/codemirror.js"></script>
<script src="codemirror/mode/clike/clike.js"></script>
<script src="codemirror/addon/edit/matchbrackets.js"></script>
<script src="codemirror/addon/edit/closebrackets.js"></script>
<link rel="stylesheet" property="stylesheet" type="text/css" href="codemirror/lib/codemirror.css">
<link rel="stylesheet" property="stylesheet" type="text/css" href="codemirror/theme/zenburn.css">
<link rel="stylesheet" property="stylesheet" type="text/css" href="livecoding.css">
<link rel="stylesheet" property="stylesheet" type="text/css" href="centerimg.css">
<script type="text/javascript" async  src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-MML-AM_CHTML">
</script>
<script type="text/x-mathjax-config">
MathJax.Hub.Config({
tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}
});
</script>
<script type="text/javascript" src="/dist/snapshot/Cindy.js"></script>
<script type="text/javascript" src="/dist/snapshot/CindyGL.js"></script>
<script id="csmousedown" type="text/x-cindyscript">
  lastmouse = mouse();
</script>
<script id="csmousedrag" type="text/x-cindyscript">
  d = mouse()-lastmouse;
  lambda = lambda-d.x;
  phi = phi-d.y;
  lastmouse = mouse();
</script>
<script id="csinit" type="text/x-cindyscript">
drawcmd() := (
  origin = [0,1,-3];
colorplot(
  dir = [#.x,#.y,1]; //ray(t):=origin+t*dir
  //intersection with floor:
  //ray(floort).y=0 <=> origin.y+floort*dir.y=0
  floort = -origin.y/dir.y;
  if(floort>0,
    [1,1,1]*exp(-|floort|*.2), //ray hits floor
    [.8,.8,1]*exp(-.3*dir.y) //sky
  );
);
);
ray(t):= origin+t*dir;
updatehit(t, normal, color) := if(t>0 & t < hitt,
     hitt = t;
     hitpos = ray(t);
     hitnormal = normal;
     hitcolor = color;
);
light = [0,2,0];
hitray():=(
  hitt = 1e8; hitpos = hitnormal = hitcolor = [0,0,0];
  //floor
  updatehit((-origin.y)/dir.y, [0,1,0], [1,1,1]);
  //wall
  updatehit((4-origin.z)/dir.z, [0,0,-1], [1,1,0.6]);
  //polynomial for |ray(t)|^2=1: sphere
  a = (dir*dir); b = 2*(origin*dir); c = origin*origin-1;
  D = b^2-4*a*c; //discriminant of polynomial a t^2 + b t + c
  if(D>0,
     spheret = (-b-re(sqrt(D)))/(2*a);
     updatehit(spheret, ray(spheret), [1,0,0]);
    );
  lightdir = (light-hitpos)/|light-hitpos|;
  max(0,lightdir*hitnormal)*hitcolor;
);
resetclock();
phi = 0.3;
lambda = 0.1;
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
window.onload = function() {
  var cdy = CindyJS({
    ports: [{
      id: "CSCanvas",
      transform: [{visibleRect:[-1,1,1,-1]}],
      background: "rgb(100,100,100)"
    }],
    scripts: "cs*",
    autoplay: true,
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
    value: `origin = [0,1,-3];
colorplot(
  dir = [#.x,#.y,1]; //ray(t):=origin+t*dir
  //intersection with floor:
  //ray(floort).y=0 <=> origin.y+floort*dir.y=0
  floort = -origin.y/dir.y;
  if(floort>0,
    [1,1,1]*exp(-|floort|*.2), //ray hits floor
    [.8,.8,1]*exp(-.3*dir.y) //sky
  );
);`,
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
  var codes = document.getElementsByClassName("language-cindyscript");
  for(i in codes) {
    codes[i].parentElement.onclick = function(e) {
      console.log(this.innerText);
      myCodeMirror.setValue(this.innerText.trim())
    }
  }
}
</script>

In this tutorial, we want to render a three-dimensional scene with `colorplot` in CindyJS. We will demonstrate the basic indigents that can be used to build complex three-dimensional scenes or to investigate various rendering approaches.

We will build an applet [3d.html](3d.html), which renders a 3D scene that can be rotated by dragging the mouse:
<iframe src="3d.html" width="530" height="530"></iframe>

## Prerequisites

We assume that you already have seen some CindyScript and the core functionality of the `colorplot`-command, for example in [the CindyGL live coding tutorial](livecoding.html). For the last part, it is good to know how to [create your CindyJS-applets](creatingapplets.html) or having some experience with the [CindyJS editor](https://cindyjs.org/editor/).

## Basic concepts of Raytracing

Let us assume that a camera is located at a particular position, for instance at `origin = [0,1,-3]` and we are looking along the $z$-axis. For the beginning, let us try to render the plane $y=0$.

How can this be archived through a `colorplot` on the GPU?

The key idea is that with each pixel a direction `dir` is associated, which varies for each pixel. The pixel in the middle of the rendered screen should "look" along the z-axis, hence for it, we have `dir = [0,0,1]`. For pixels that are slightly right of the pixel in the middle, this variable could take the value `dir = [0,0.1,1]`, meaning that the associated direction points slightly more to the right. 

More general, we can write `dir = [#.x, #.y, 1]`, where `#` is the coordinate of the current pixel.

We will say that behind this pixel lies a ray
```
ray(t) := origin + t*dir
```
This ray will eventually intersect the scene for some $t>0$. 
Now, if we want to render the intersection of each ray with the plane $y=0$. We can solve $(\mathrm{origin} + t \cdot \mathrm{dir}).y = 0$ for $t$ and obtain
```
tfloor = -origin.y/dir.y;
```
If the computed `tfloor>0`, then the ray behind the current pixel eventually will intersect the plane $y=0$, otherwise it wont intersect it (and we will display the color of a sky, for instance). Let us put this together:

```cindyscript
origin = [0,1,-3];
colorplot(
  dir = [#.x,#.y,1]; //ray(t):=origin+t*dir
  //intersection with floor:
  //ray(floort).y=0 <=> origin.y+floort*dir.y=0
  floort = -origin.y/dir.y;
  if(floort>0,
    [1,1,1]*exp(-|floort|*.2), //ray hits floor
    [.8,.8,1]*exp(-.3*dir.y) //sky
  );
);
```

## Rendering a sphere

Now, instead of the floor, let us render a sphere. For simplicity, let us display the unit sphere located at (0,0,0).

When does `ray(t):=origin+t*dir` intersect this sphere? This can be reformulated into the solution a quadratic polynomial:

$$
\begin{eqnarray} 
\|\| \mathrm{ray}(t) \|\| = 1 &\Leftrightarrow& \|\| \mathrm{ray}(t) \|\|^2 = 1 \Leftrightarrow \langle \mathrm{ray}(t), \mathrm{ray}(t) \rangle = 1  \\\\
&\Leftrightarrow &
\langle \mathrm{origin}, \mathrm{origin} \rangle + 2 t \langle \mathrm{origin}, \mathrm{dir} \rangle  + t^2 \langle \mathrm{dir}, \mathrm{dir} \rangle= 1 \\\\
&\Leftrightarrow& a t^2 + b t + c = 0 \text{ for $a=\langle \mathrm{dir}, \mathrm{dir} \rangle$, $b=2 \langle \mathrm{origin}, \mathrm{dir} \rangle$ and $c=\langle \mathrm{origin}, \mathrm{origin} \rangle$}\\
\end{eqnarray} 
$$
Hence, whenever the [discriminant](https://en.wikipedia.org/wiki/Discriminant) $D=b^2-4 a c$ of the polynomial $a t^2 + b t + c$ is non-negative, the ray intersects the sphere. Scalar products can be computed in CindyScript via `*`. The two intersection points can be computed as $t_{1,2} = \frac{-b \pm \sqrt{b^2-4 a c}}{2 a}$. This can be used for the following program that "renders" a sphere:
```cindyscript
origin = [0,1,-3];
colorplot(
  dir = [#.x,#.y,1];
  a = (dir*dir);
  b = 2*(origin*dir);
  c = origin*origin-1;
  D = b^2-4*a*c; //discriminant
  if(D>0, //there is some intersection
     [1,.3,.3], //some reddish color
     [.8,.8,1]*exp(-.3*dir.y) //sky
    );
);
```

How can we colorize the sphere, which now shown as a reddish circle only, properly? One trick is that the coordinate on the unit sphere itself is already the normal of the sphere at this position. The normal can be used for approximating some [diffuse reflection](https://en.wikipedia.org/wiki/Diffuse_reflection).

```cindyscript
ray(t):= origin+t*dir;
origin = [0,1,-3];
colorplot(
  dir = [#.x,#.y,1];
  a = (dir*dir);
  b = 2*(origin*dir);
  c = origin*origin-1;
  D = b^2-4*a*c; //discriminant
  if(D>0, //there is some intersection
     normal = ray((-b-re(sqrt(D)))/(2*a));
     (normal*[1,1,-1])*[1,.3,.3],
     [.8,.8,1]*exp(-.3*dir.y) //sky
    );
);
```

## Combining multiple elements in a scene

Now, let us combine multiple elements within one scene. For each object $i$ we compute an intersection value $t_i$, i.e. the smallest value such that $\mathrm{ray}(t_i)$ intersects the object. For the corresponding pixel, we display the object $i$ which has the smallest non-negative value $t_i$. We might also say that each object has some different color and also the normal of each object should be taken into consideration. This could be programmed in CindyScript with the following helper function that is executed for each element:
```
updatehit(t, normal, color) := if(t>0 & t < hitt,
     hitt = t;
     hitpos = ray(t);
     hitnormal = normal;
     hitcolor = color;
);
```
If `updatehit(t, normal, color)` is called, it will update the variables `hitt`, `hitpos`, `hitnormal` and `hitcolor` whenever the current parameters correspond to the so far closest object. The variable `hitt` has to be initialized to $\infty$, within colorplot. Since there is no Infinity in CindyScript, we just choose a large float-value such as `1e8`=$1\cdot 10^8$. Alltogether we can use the following code to render a scene consisting of a floor and a wall:

```cindyscript
light = [cos(seconds()),2, sin(seconds())-1];
origin = [0,1,-3];
colorplot(
  dir = [#.x,#.y,1];
  //default values (if no hit)
  hitt = 1e8; hitpos = hitnormal = hitcolor = [0,0,0];
  //intersect with floor
  updatehit((-origin.y)/dir.y, [0,1,0], [1,1,1]);
  //intersect with wall at z=4:
  updatehit((4-origin.z)/dir.z, [0,0,-1], [1,1,0.6]);
  lightdir = (light-hitpos)/|light-hitpos|;
  max(0,lightdir*hitnormal)*hitcolor;
);
```
Furthermore, we introduced a vector `light`, which indicates the (moving) source of the light. Click "Enter Fullscreen" if the code covers your entire screen.

We can use the same scheme to futher add the unit-sphere with center $(0,0,0)$ as follows:
```cindyscript
light = [cos(seconds()),2, sin(seconds())-1];
origin = [0,1,-3];
colorplot(
  dir = [#.x,#.y,1];
  //default values (if no hit)
  hitt = 1e8; hitpos = hitnormal = hitcolor = [0,0,0];
  updatehit((-origin.y)/dir.y, [0,1,0], [1,1,1]);
  updatehit((4-origin.z)/dir.z, [0,0,-1], [1,1,0.6]);
  //polynomial for |ray(t)|^2=1: sphere
  a = (dir*dir); b = 2*(origin*dir); c = origin*origin-1;
  D = b^2-4*a*c; //discriminant of polynomial a t^2 + b t + c
  if(D>0,
     spheret = (-b-re(sqrt(D)))/(2*a);
     updatehit(spheret, ray(spheret), [1,0,0]);
    );
  lightdir = (light-hitpos)/|light-hitpos|;
  max(0,lightdir*hitnormal)*hitcolor;
);
```
## Moving the camera
In order to avoid a lot of distracting code, we have encapsulated the code above into a helper-function `hitray()` that is defined as follows and returns the color based on the set variables `dir` and `origin`
```
hitray() := (
  hitt = 1e8; hitpos = hitnormal = hitcolor = [0,0,0];
  
  //floor
  updatehit((-origin.y)/dir.y, [0,1,0], [1,1,1]);
  //wall
  updatehit((4-origin.z)/dir.z, [0,0,-1], [1,1,0.6]);
  //sphere; polynomial for |ray(t)|^2=1
  a = (dir*dir); b = 2*(origin*dir); c = origin*origin-1;
  D = b^2-4*a*c; //discriminant of polynomial a t^2 + b t + c
  if(D>0,
     spheret = (-b-re(sqrt(D)))/(2*a);
     updatehit(spheret, ray(spheret), [1,0,0]);
    );
  lightdir = (light-hitpos)/|light-hitpos|;
  max(0,lightdir*hitnormal)*hitcolor;
);
```

and the entire scene can be now rendered as

```cindyscript
origin = [0,1,-3];
colorplot(
  dir = [#.x,#.y,1];
  hitray() //computes the color of the intersection of ray(t):=origin+t*dir with the scene
);

```

Let us move the camera! A simple way of moving the is to change the variable `origin`. In the examples above, you could replace `origin = [0,1,-3];` with  `origin = [0,2+sin(seconds()),-3]` for instance:

```cindyscript
origin = [0,2+sin(seconds()),-3];
colorplot(
  dir = [#.x,#.y,1];
  hitray() //computes the color of the intersection of ray(t):=origin+t*dir with the scene
);

```
## Pointing the camera to a target

How can point the camera to a certain target coordinate? Let us introduce a second variable
`target = [0,0,0];`
and demand that `dir` for the pixel in the middle of the screen should be the vector pointing from `origin` to `target`. Let us compute this vector as `mdir = (target-origin)/|(target-origin)|;`. Further, we can compute a orthogonal basis `(v,w,mdir)` and and set `dir = mdir + #.x*v + #.y*w;`. In order to build such a orthogonal basis, we have a freedom in rotating `v` and `w` along `mdir`.

In this context, a good orthogonal basis has the vector `w` pointing upwards such that the vertical lines on the screen align with the vertical lines in the image (no "[Dutch angle](https://en.wikipedia.org/wiki/Dutch_angle)"). Such a orthogonal basis can be computed with cross-products as follows:

```cindyscript
target = [0,0,0];
origin = [cos(seconds())*2, sin(seconds()/3)+2, sin(seconds())*2];
mdir = (target-origin)/|(target-origin)|;
v = cross([0,1,0], mdir);
w = cross(mdir, v);
v = v/|v|;
w = w/|w|;
colorplot(
  dir = mdir + #.x*v + #.y*w;
  hitray();
);
```
Once this code is executed, the target at $(0,0,0)$ remains at the center of the screen.

## Interaction with the mouse

For many visualizations, it is good to let the user how to watch something. Suppose, we want to study a particular object at the `target = [0,0,0]` and modify `origin` with the mouse (by dragging). How can we do this?

The aim is to build an applet such as [3d.html](3d.html), which renders a 3D scene that can be rotated by dragging the mouse.

In order to build this applet we set origin to be a point on a sphere specified by the coordinates `(lambda, phi)`:
```cindyscript
target = [0,0,0];
origin = 2*[cos(lambda)*cos(phi),
          sin(phi),
          sin(lambda)*cos(phi)
        ];
mdir = (target-origin)/|(target-origin)|;
v = cross([0,1,0], mdir);
w = cross(mdir, v);
v = v/|v|;
w = w/|w|;
colorplot(
  dir = mdir + #.x*v + #.y*w;
  hitray();
);
```
The values of `lambda` and `phi` are controlled essentially via the `mousedrag`-script. In the live-editor of the tutorial you cannot modify these special scripts. 
For this purpose, you can use the CindyJS online editor available at [https://cindyjs.org/editor/](https://cindyjs.org/editor/).
Alternatively, if you are [building your own applet](creatingapplets.html) based on a file such as [boilerplate.html](boilerplate.html), you can either add some HTML-code
```
<script id="csmousedrag" type="text/x-cindyscript">
your code
</script>
```
The `mousedrag` script is always executed if the browser notices that the mouse is moved while the button is pressed.

In this example we have set the `mousedrag`-script to the following:
```
d = mouse()-lastmouse;
lambda = lambda-d.x;
phi = phi-d.y;
lastmouse = mouse();
```
Which means that whenever the mouse is dragged, the distance traveled by the mouse is also subtracted to the coordinates `(lambda, phi)`. The script should always be well defined. So, in the `mousedown`-script we should also set

```
lastmouse = mouse();
```

and in the `init`-script we should assign some starting values to `lambda` and `phi`.
