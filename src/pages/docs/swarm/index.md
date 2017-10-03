---
title: CindyJS - A Simple Swarm Simulation
---
<script src="https://codemirror.net/lib/codemirror.js"></script>
<script src="https://codemirror.net/mode/clike/clike.js"></script>
<script src="https://codemirror.net/addon/edit/matchbrackets.js"></script>
<script src="https://codemirror.net/addon/edit/closebrackets.js"></script>
<link rel="stylesheet" property="stylesheet" type="text/css" href="https://codemirror.net/lib/codemirror.css">
<link rel="stylesheet" property="stylesheet" type="text/css" href="https://codemirror.net/theme/zenburn.css">
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
drawcmd() := (
  
);
resetclock();
</script>
<script id="csdraw" type="text/x-cindyscript">
drawcmd();
</script>
<div id="CSCanvas"></div>
<div style="width:100%; display: flex;">
  <div style="width:49%; margin: 10px;">
    <h5>csdraw:</h5>
    <div id="drawcode"></div>
  </div>
  <div style="width:49%; margin: 10px;">
    <h5>execute code once (instead of csinit):</h5>
    <div id="execcode"></div>
    <button id="exec">execute code!</button>
  </div>
</div>
<script type="text/javascript">
var cdy;
var spoilers;

window.onload = function() {
geo=[
    {name: "A", type: "Free", pos: [4.0, -4.0, -0.4], color: [0.0, 0.0, 0.0], labeled: true, size: 3.0},
    {name: "B", type: "Free", pos: [4.0, 4.0, -0.4], color: [0.0, 0.0, 0.0], labeled: true, size: 3.0},
    {name: "a", type: "Segment", color: [0.0, 0.0, 0.0], args: ["A", "B"], size: 2},
    {name: "C", type: "Free", pos: [4.0, -4.0, 0.4], color: [0.0, 0.0, 0.0], labeled: true, size: 3.0},
    {name: "b", type: "Segment", color: [0.0, 0.0, 0.0], args: ["B", "C"], size: 2},
    {name: "D", type: "Free", pos: [4.0, 4.0, 0.4], color: [0.0, 0.0, 0.0], labeled: true, size: 3.0},
    {name: "c", type: "Segment", color: [0.0, 0.0, 0.0], args: ["C", "D"], size: 2},
    {name: "d", type: "Segment", color: [0.0, 0.0, 0.0], args: ["D", "A"], size: 2}
  ];
beh=[
    {type: "Environment", charges: true, balls:false},
    {geo: ["a", "A", "B"], type: "Bouncer"},
    {geo: ["b", "B", "C"], type: "Bouncer"},
    {geo: ["c", "C", "D"], type: "Bouncer"},
    {geo: ["d", "D", "A"], type: "Bouncer"}
  ];

for(i=1;i<30;i++) {
geo.push(
    {name: "M"+i, type: "Free", 
                  pos: [(Math.random()-.5)*20,(Math.random()-.5)*20], 
                  color: [1.0, 0.0, 0.0], 
                  labeled: false, size: 4.0}
  );
beh.push(
    {geo: ["M"+i], type: "Mass", charge: 1,mass:1},

  );
};



cdy = CindyJS({
  scripts: "cs*",
  defaultAppearance: {
    dimDependent: 0.7,
    fontFamily: "sans-serif",
    lineSize: 1,
    pointSize: 5.0,
    textsize: 12.0
  },
  angleUnit: "°",
  geometry: geo,
  behavior: beh,
  animation: {autoplay: false, controls: true, speed: 0.7},
  autoplay: false,
  animcontrols: true,
  ports: [{
    id: "CSCanvas",
    width: 916,
    height: 628,
    transform: [{visibleRect: [-11.47210843373494, 10.544638554216867, 20.863795180722896, -11.624518072289158]}],
    background: "rgb(168,176,192)"
  }],
  cinderella: {build: 1872, version: [2, 9, 1872]}
});
  
  var myCodeMirror = CodeMirror(document.getElementById("drawcode"), {
    value: ``,
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
  
  var myECodeMirror = CodeMirror(document.getElementById("execcode"), {
    value: `masses=allmasses();  // get a list of all masses
forall(masses,m,    // loop over all masses m
    m.v=(0,1);      // set the velocity
);  `,
    autoCloseBrackets: true,
    matchBrackets: true,
    //lineNumbers: true,
    lineWrapping: true,
    theme: "zenburn"
  });

  var btn = document.getElementById("exec");
  btn.onclick = function() {
    cdy.evokeCS(`( ${myECodeMirror.getValue()} )`);
    //myECodeMirror.setValue("");
  };
  
  
  var codes = document.getElementsByClassName("lang-cindyscript");
  for(i in codes) {
    codes[i].parentElement.onclick = function(e) {
      console.log(this.innerText);
      myCodeMirror.setValue(this.innerText.trim())
    }
  }
}
</script>



# CindyJS - a simple swarm simulation 

## Setup
Before we begin with programming, please download the initial Swarm0.html (the URL will be announced during the course). It contains the boilerplate code for our yet to be programmed swarm: A bunch of charged particles in a box. They will naturally repel each other. We will start out with this particle simulation and then add more and more "intelligent" behavior. 

## Basic physics manipulation
To influence physical properties of the particles (velocity, position, force, mass, ...) via CindyScript, we insert into the drawing script `csdraw` the following:
```cindyscript
    masses=allmasses();  // get a list of all masses
    forall(masses,m,    // loop over all masses m
        m.v=(1,1);      // set the velocity
    );                  // end of loop
```

Save the HTML file and reload to see what happens.

## Code slots
CindyJS distinguishes different points in time when to apply scripts. `csdraw` is executed each time right before all drawing commands are issued, which is a good time to influence the velocity. Actually, we only want to set the velocity once: at the start of the simulation. In order to do so please move the first line of the program to `csinit`, which is executed on initialization (so masses is properly set up and accessible throughout the program). And move the rest of the program to `cssimulationstart`. What variation in behavior can one observe?

## Mixing
Instead of assigning to all particles the same direction, we would rather have random directions to start with. For this purpose, you can use the function `random()` which yields random numbers in the range of 0 to 1. With an appropriate calculation one can assign velocities to all(!) direction.

## Average Joe
We want to make sure that the particles behave like a swarm and adjust their respective directions in order to stay in the swarm. All particles will later alter their directions a bit by imitating the Average Joe. 
Therefore, we modify the velocity of the particles in `csdraw`. Firstly, we need the average position of all particles. Calculate the position of the Average Joe in the `csdraw` script and display it in the simulation. The following commands might be useful:
```
    sum(<list>,<variable>,<value>)      // sum over a list
    length(<list>)                      // number of elements in a list
    <point>.xy                          // Euclidean coordinates of a point 
    draw(<vec>)                         // draw a point
```

> Use the following script for `csdraw`:
> ```cindyscript
>
> masses=allmasses();
> n=length(masses);
> average=sum(masses,#.xy)/n;
> draw(average);
> ```



## Pushing particles 
The velocity of each particle is represented by a two dimensional vector, whose absolute value represents the speed.
Now we want to alter the velocity vector of all particles such that they slightly adopt the average direction. Add a loop over all masses to `csdraw` which changes the velocity to the average. Therefore use code inspired by the following:
```
  m.v=m.v+0.1*(average-m.xy);
```
What is the purpose of the last summand?

> Use the following script for `csdraw`:
> ```cindyscript
> 
> masses=allmasses();
> n=length(masses);
> average=sum(masses,#.xy)/n;
> draw(average);
>
> forall(masses, m,
>  m.v=m.v+0.1*(average-m.xy);
> );
> ```

## Speed limit
Particles may become unnaturally fast. Use the absolute value `|m.v|` of the velocity to limit the speed of every particle. It might be useful to look up the control structure `if(...)` of CindyScript.

You can now safely increase the parameter `0.1` of the previous exercise to `0.3`.

> Use the following script for `csdraw`:
> ```cindyscript
> n=length(masses);
> average=sum(masses,#.xy)/n;
> draw(average);
>  forall(masses,m,
>     m.v=m.v+0.3*(average-m.xy);
>     if(|m.v|>1,m.v=m.v/|m.v|);
>  );
> ```


## Flocking
To achieve a swarm behavior, the direction of movement should be more synchronous. Calculate the average speed of all particles and then employ a loop to adapt it towards the average. Use code of the following style: `m.v=m.v+0.3*averagespeed;`.

> Use the following script for `csdraw`:
> ```cindyscript
> n=length(masses);
> average=sum(masses,#.xy)/n;
> averagespeed=sum(masses,#.v)/n;
> draw(average);
>  forall(masses,m,
>     m.v=m.v+0.3*(average-m.xy);
>     m.v=m.v+0.3*averagespeed;
>     if(|m.v|>1,m.v=m.v/|m.v|);
>  );
> ```

## Build a lab
We now want to get more control on the behavior for this we want to add three sliders to our view. CindyJS does so far not have from-the-shelf sliders. So we have to create them by hand. For this we first create three new free points to our view. By adding lines like
```
    {name: "S1", type: "Free", pos: [0,0], 
    color: [0.0, 0.0, 0.0], labeled: false, size: 3.0},
```
to the list of `geo` objects in the CindyJS definition part. Make sure that every point has a different name. These points will be converted to sliders.
For this we set them to initial positions in the `csinit` script (like `S1.xy=(12,8)`).
Now in the `csinit` we can adjust the `x,y` values so that everything behaves like a slider. A code fragment like
```
S1.y=8;
draw((12,8),(18,8));
S1.x=max(12,min(S1.x,18));
```
is helpful. Now make a few calculations to assign slider values between 0 and 1 to three parameters `par1` up to `par3`.

## For control freaks
Now lets make use of the sliders. use the parameters `par1` and `par2` to set the influence of the `average position` and the `averagespeed` to the individual points. Enjoy!

## A social network (pro exercise)
It is pretty unrealistic that fish sees all other fish in a swarm (water can be cloudy, attention can be limited). So we will restrict the awareness to the `k` closest neighbors. For this first calculate an integer between 1 and 20 from the parameter `par3` by using the `round(...)` function. Now you have to modify you main program considerably. Move the calculation of the average position and speed into the loop. 
Then make this calculation only dependent form a list of points called `others`. This list `others` should only contain then `k` closest neighbors of the current point `m`. To get that make your self familiar with the `sort(...)` function and with the possibility to get partial lists by providing an index list. After sorting code fragments like
```
others=l_(2..k);
```
might be very helpful.

Experiment!!!

## Make it pretty
Final step: make it look a bit nicer. Try to attach a small line whose direction and size indicates the velocity to each of the masses. This should be an easy exercise by now.


<script type="text/javascript">
//spoilers = document.getElementsByClassName("spoiler");
spoilers = document.getElementsByTagName("blockquote");
for(var i in spoilers) {
  var spoiler = spoilers[i];
  var button = document.createElement("button");
  var node = document.createTextNode("Show solution");
  button.appendChild(node);
  console.log(spoiler);
  spoiler.parentElement.insertBefore(button, spoiler);
  button.spoiler = spoiler;
  button.onclick = function() {
    this.spoiler.style.display = 'block';
  };
  
  spoiler.style.display = 'none';
}
</script>
