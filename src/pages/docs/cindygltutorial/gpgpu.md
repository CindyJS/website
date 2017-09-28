---
title: CindyGL Tutorial - basic GPGPU through colorplots
---
<script type="text/javascript" async  src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-MML-AM_CHTML">
</script>
<script type="text/x-mathjax-config">
MathJax.Hub.Config({
tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}
});
</script>

In this tutorial, we want to build an applet that simulates the reaction-diffusion equation on the GPU. As a primer, we will first simulate [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) on the GPU.
The trick in all these applications is to store the data on textures. Using `colorplot` one can write to a texture and using `imagergb`, one can read from a texture.

## Prerequisites

We assume that you already have seen [how one can create texture-feedback loops in CindyGL](textures.html#feedback-loops) and you know how to [create your own CindyJS-applets](creatingapplets.html).

## Conway's Game of Life

[Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) is an example of a [celluar automaton](https://en.wikipedia.org/wiki/Cellular_automaton) that has a big grid of cells as domain. Every cell is either living or dead. Each cell has eight neighbors that determine its new state. If a living cell
* has fewer than two living neighbours it dies because of by underpopulation.
* has two or three living neighbours it will continue to live
* has more than three living neighbours it dies because of overpopulation.

A dead cell can become a living cells if it has exactly three live neighbors (A birth needs a mother, a father and a midwife)

All these transitions happen at the same time. We will build an applet [gol.html](gol.html), which simulates the celluar automaton on the GPU (if it good stuck in a short period, then reload the page):
<iframe src="gol.html" width="530" height="530"></iframe>

We want to simulate this automaton via `colorplot` on the GPU. It is obvious, that we can use a texture that represents the state of the cells through the colors of each pixel (which conveniently also lay in such a grid).

If you want to program along, you can start with [boilerplate.html](boilerplate.html) and modify it while reading this tutorial.

Suppose, we want to "play" the game of life on a 128x128 texture (Powers of two are always good, because the textures fix nicely in the texture-buffer; However other dimensions should work as well.). So we will create in the `init`-script a texture via
```
createimage("gol", 128, 128);
```

Now, if we want to access the cell, which is in column `x` and row `y` (from the bottom), we could use `imagergb((0,0), (128,0), "gol", (x,y), interpolate->false)`. We need the modifier `interpolate->false`, because otherwise the pixel (1,1) would be interpreted as the average of the four pixels $(0,0), (0,1), (1,0), (1,1)$, which have their centers at $(0.5, 0.5), (0.5, 1.5), (1.5, 0.5), (1.5, 1.5)$:

![pixel coordinates](pixels.png "pixel coordinates")

With `interpolate->false` the function `imagergb` returns the color of the pixel that is closest to the given coordinate. To solve the issue one could offset everything with $(0.5,0.5)$, but conveniently with `interpolate->false` any coordinate will be rounded down to the closest pixel center, so our call `imagergb((0,0), (128,0), "gol", (x,y), interpolate->false)` remains readable and gives the desired answers.

Another advantage of `interpolate->false` is that it makes `imagergb` and the whole program a bit faster.

The code `imagergb((0,0), (128,0), "gol", (x,y), interpolate->false)` can be simplified to `imagergb("gol", (x,y), interpolate->false)` if we specify that the global drawing domain just has the same domain. This can be done by adding the option
```
transform: [{
  visibleRect: [0, 128, 128, 0]
}]
```
to the `CindyJS`-initialization function.

Let us define a helper function
```
get(x, y) :=  imagergb("gol", (x,y), interpolate->false, repeat->true).r;
```
that returns only the red-value of the corresponding pixel. This number, which will either be $0$ or $1$, will be the state of $(x,y)$.

In order to initialize the texture `"gol"`, we will add some random values via

```
colorplot("gol", if(random()>.6,1,0)); //random stuff as starting image
```

`random()` is a function that returns, intependent for every pixel, a random value between $0$ and $1$. So with $60\%$- probability a pixel gets color $1$, otherwise $0$. Color $1$? You should wonder, because $1$ is a number, but not a 3-component RGB color vector! CindyGL will interpret a number `number` as output-variable automatically as `gray(number)=[number, number, number]`.


Now let us proceed with to the `draw`-script:
For each pixel `#` we need to count the number of neighbors and then color the pixel accordingly.

We will overwrite the old texture "gol" with a new texture via
```
colorplot("gol", newstate(#.x, #.y)); //overwrite texture "gol"
```
where `newstate(x, y)` is defined as follows:

```
newstate(x, y) := (
  number = countneighbors(x, y); //number of living neighbors
  if(get(x, y) == 1,
  
    //if the cell lives then it will die if it has less than 2 neighbours or more than 3 neighbours
    if((number < 2) % (number > 3), 0, 1),
    
    //if cell was dead then 3 are required to be born
    if(number == 3, 1, 0)
  )
);
```

This basically implements the rules from above where `1` stands for living and `0` for dead.

Only the funciotn `countneighbors` is missing. It should go through all 8 neighbour cells of `(x, y)` and count those neighbours `(nx, ny)` that have `get(nx, ny)==1`. One could write the sum of 8 terms, one could use two nested `repeat`, loops. CindyJS also has list-operations that simplify this:
```
nbhds = [(-1,-1), (-1,0), (-1,+1), (0,-1),  (0,+1), (+1,-1), (+1,0), (+1,+1)];
countneighbors(x, y) := sum( apply(nbhds, delta, get(delta.x + x, delta.y + y)
```
`apply` converts the list of deltas in `nbhds` in a list of `get`-values that are either `0` or `1`. `sum` computes the sum of all those values.

After running in the `draw`-script
```
colorplot("gol", newstate(#.x, #.y)); //overwrite texture "gol"
```
we also want to output the image. One could use `drawimage( (0,0), (0, 128), "gol")`, which however looks blurry, because drawimage uses interpolation for its output. To avoid this function, we use a colorplot that simply uses our `get`-function:
```
colorplot( get(#.x, #.y) );
```

Altogether we have the following source:
```
<!DOCTYPE html>
<html>
  <head>
    <script type="text/javascript" src="https://cindyjs.org/dist/latest/Cindy.js"></script>
    <script type="text/javascript" src="https://cindyjs.org/dist/latest/CindyGL.js"></script>
    <title>Conway's Game of Life in CindyGL</title>
  </head>

  <body>
    <div id="CSCanvas"></div>
    
    <script id="csinit" type="text/x-cindyscript">
      createimage("gol", 128, 128);
      colorplot("gol", if(random()>.6,1,0)); //random stuff as starting image
      
      get(x, y) :=  imagergb("gol", (x,y), interpolate->false, repeat->true).r; //Tourus world
      
      nbhds = [(-1,-1), (-1,0), (-1,+1), (0,-1),  (0,+1), (+1,-1), (+1,0), (+1,+1)];
      countneighbors(x, y) := sum( apply(nbhds, delta, get(delta.x + x, delta.y + y)));
      
      newstate(x, y) := (
        number = countneighbors(x, y); //number of living neighbors
        if(get(x, y) == 1,
        
          //if the cell lives then it will die if it has less than 2 neighbours or more than 3 neighbours
          if((number < 2) % (number > 3), 0, 1),
          
          //if cell was dead then 3 are required to be born
          if(number == 3, 1, 0)
        )
      );
    </script>
    
    <script id="csdraw" type="text/x-cindyscript">
      colorplot("gol", newstate(#.x, #.y)); //overwrite texture "gol"
      colorplot( get(#.x, #.y) );
    </script>

    <script type="text/javascript">
    CindyJS({
      scripts: "cs*",
      autoplay: true,
      ports: [{
        id: "CSCanvas",
        width: 512,
        height: 512,
        transform: [{
          visibleRect: [0, 128, 128, 0]
        }]
      }]
    });
    </script>
  </body>
</html>
```
A CindyGL implementation of the Game of Life with a bit more interaction can be found [here](https://cindyjs.org/examples/cindygl/10_gol_sumapply.html).

## Numerical simulation of a reaction-diffusion equation

We want to create a simulation of a [Reaction–diffusion system](https://en.wikipedia.org/wiki/Reaction%E2%80%93diffusion_system), more precisiely the Gray-Scott model, as it can be seen in [reactdiff.html](reactdiff.html):
<iframe src="reactdiff.html" width="530" height="530"></iframe>

We start with [gol.html](gol.html) and adopt the code until we have [reactdiff.html](reactdiff.html), because the schemes are very similiar.

However, we need a higher resolution than we had for the Game of Life. To increase the resolution from 128 to 512 you can search and replace every 128 with a 512. Furthermore, we like to call our texture `"state"` instead of `"gol"`, so let us perform another search&replace.

We have two chemicals $a$, $b$ that react with each other through the following equations

$$\partial a=d_{a} \nabla^{2}a - a b^2 + f\cdot (1-a)$$

and 

$$\partial b=d_{b} \nabla^{2}b - a b^2 + (k+f)\cdot b$$

Karl Sims gives a good and comprehensible explaination for these equations [on his website](http://www.karlsims.com/rd.html).


The applet [reactdiff.html](reactdiff.html) has the following source:
```

```
