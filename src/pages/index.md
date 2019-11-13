# What is <span style="font-weight:400">Cindy</span><span style="font-weight:700">JS</span>?

**CindyJS is a framework to create interactive
(mathematical) content for the web.**

It aims to be compatible with [Cinderella](http://cinderella.de/),
providing an interpreter for the scripting language CindyScript
as well as a set of geometric operations which can be used to describe
constructions.
Together, these components make it very easy to visualize various
concepts, from geometry in particular and mathematics in general,
but also from various other fields.

<div class="examplel">
  <h5>Use CindyJS for your own interactive physics simulations</h5>
  <div id="Bouncer" class="example"></div>
  <div>
    <h5>Use CindyJS for your own interactive physics simulations</h5>
    Freely experiment with masses, springs, charges
    and fields! Liberated from the constraints of
    reality, scenarios ranging from atom physics,
    classical mechanic to planetary orbits may be
    examined. Effortlessly sketch experiments using
    the mouse and bring them to life with a simple
    click.
  </div>
</div>

<div class="exampler">
  <h5>Add brain power to your applications with <i>CindyScript</i></h5>
  <div id="Tree" class="example"></div>
  <div>
    <h5>Add brain power to your applications with <i>CindyScript</i></h5>
    <p>CindyJS has its own easy-to-learn scripting language <i>CindyScript</i>, which can be used for a variety of smart applets.</p>
    <p>Have you ever explained something to another mathematician, while sitting in
    a loud pub and having nothing but a pen and a napkin?
    <i>CindyScript</i> is the programming equivalent of the napkin. In other words, <i>CindyScript</i> has been designed to be expressible in sketchy, sometimes non-formal, nevertheless complete
    and most of all understandable way.</p>
    <p>It allows for a high level implementation of mathematical concepts.</p>
  </div>
</div>


<div class="examplel">
  <h5>Use the GPU without learning WebGL</h5>
  <div id="ComplexPlot" class="example"></div>
  <div>
    <h5>Use the GPU without learning WebGL</h5>
    <p>CindyJS provides the high-level mathematically oriented user with access to the shader language of the GPU without learning a shader language.</p>
    <p>Here you see an GPU rendered example of a complex phase portrait rendered in CindyJS. You can enter any arbitrary complex function or chose a predefined  function and view its complex phase portrait.</p>

<p>f(z) = <input type="text" id="inp" value="z^5-1"  onkeypress="if((event.which ? event.which : event.keyCode)==13) { cdy.complexPlot.evokeCS('f(z) := (' + this.value + '); forcerecompile();'); }" style="font-size:18px"> <select id="sel" onchange="document.getElementById('inp').value = this.value; cdy.complexPlot.evokeCS('f(z) := (' + this.value + '); forcerecompile();');">
<option>(z^5-1)</option>
<option>(z^(-5)-1)</option>
<option>(z-1)/(z+1)</option>
<option>z^(1+i)</option>
<option>z=2\*z+pi/2(sin(z-i)/sin(z+i))^(1+i)</option>
<option value="repeat(11, z = z - (z^3-1)/(3*z^2));">Newton</option>
</select>
</p>
  <p>For more WebGL-related content, visit our <a href="/gallery/cindygl/">CindyGL-Gallery</a>.</p>
  <p>If you want to learn how to program your CindyGL applications you can check out <a href="/docs/cindygltutorial/">our CindyGL-tutorial</a>.</p>
</div></div>




## Examples

Selected examples can be seen [in our showcase-gallery](/gallery/main/).

A wider set of examples is available in our [thematically sorted gallery](/gallery/).

## Getting started

The [Documentation](/docs/) contains a section to get you started
using CindyJS.

## Bugs and feature requests

If something doesn't work the way you want it or need it,
feel free to [file an issue](https://github.com/CindyJS/CindyJS/issues)
in our GitHub ticket system.
Be sure to check for known issues first, though.

## License

CindyJS is licensed under the
[Apache 2 license](/license.html).

<script type="text/javascript" src="/dist/v0.7/Cindy.js"></script>
<script type="text/javascript" src="/dist/v0.7/CindyGL.js"></script>

<script type="text/javascript">
var cdy = {
  tree: CindyJS.newInstance({
    scripts: "tree*",
    geometry: [
      { name: "A", type: "Free", pos: [0, -1.75], color: [1, 0, 0], pinned: false, size: 6, alpha: .3 },
      { name: "B", type: "Free", pos: [0, -.8], color: [1, 0, 0], pinned: false, size: 6, alpha: .3 },
      { name: "C", type: "Free", pos: [-.34, -.18], color: [1, 0, 0], pinned: false, size: 6, alpha: .3 },
      { name: "D", type: "Free", pos: [.34, -.18], color: [1, 0, 0], pinned: false, size: 6, alpha: .3 }
    ],
    animation: { autoplay: true },
    ports: [{
      id: "Tree",
      width: 300,
      height: 300,
      transform: [{ visibleRect: [-3, -2.5, 3, 3.5] }]
    }]
  }),
  bouncer: CindyJS.newInstance({
    defaultAppearance: { dimDependent: 0.7 },
    movescript: "csmove",
    initscript: "init",
    geometry: [
      { name: "A", type: "Free", pos: [-5, 5], color: [1, .5, .5] },
      { name: "B", type: "Free", pos: [-9, 7], color: [0, 0, 0], size: 3 },
      { name: "C", type: "Free", pos: [-7, -8], color: [0, 0, 0], size: 3 },
      { name: "D", type: "Free", pos: [7, -8], color: [0, 0, 0], size: 3 },
      { name: "E", type: "Free", pos: [9, 7], color: [0, 0, 0], size: 3 },
      { name: "F", type: "Free", pos: [-3, -4], color: [0, 0, 0], size: 3 },
      { name: "G", type: "Free", pos: [1, -2], color: [0, 0, 0], size: 3 },
      { name: "a", type: "Segment", args: ["B", "C"], color: [0, 0, 0], size: 1 },
      { name: "b", type: "Segment", args: ["C", "D"], color: [0, 0, 0], size: 1 },
      { name: "c", type: "Segment", args: ["D", "E"], color: [0, 0, 0], size: 1 },
      { name: "d", type: "Segment", args: ["F", "G"], color: [0, 0, 0], size: 1 }
    ],
    behavior: [
      { behavior: { type: "Environment", gravity: -.2 } },
      { name: "A", behavior: { type: "Mass", friction: 0.0, vx: 0.3 } },
      { name: "a", behavior: { type: "Bouncer" } },
      { name: "b", behavior: { type: "Bouncer" } },
      { name: "c", behavior: { type: "Bouncer" } },
      { name: "d", behavior: { type: "Bouncer" } }
    ],
    autoplay: true,
    ports: [{
      id: "Bouncer",
      width: 300,
      height: 300,
      transform: [{ visibleRect: [-10, -10, 10, 10] }]
    }]
  }),
  complexPlot: CindyJS.newInstance({
    ports: [{
      id: "ComplexPlot",
      width: 300,
      height: 300,
      transform: [{ visibleRect: [-1.5, -1.5, 1.5, 1.5] }]
    }],
    scripts: "complex*",
    geometry: [],
    animation: { autoplay: true },
    use: ["CindyGL"]
  })
};


var doingsth = false;

document.addEventListener('DOMContentLoaded', function(event) {
  updateVisibility();
});

window.addEventListener('scroll', function(e) {
  if (!doingsth) {
    window.requestAnimationFrame(function() {
      updateVisibility();
      doingsth = false;
    }, 10); //10 ms delay
  }
  doingsth = true;
});


function updateVisibility() {
  for (var i in cdy) {
    var rect = document.getElementById(cdy[i].config.ports[0].id)
      .getBoundingClientRect();
    if (rect.bottom >= 0 && rect.top <= window.innerHeight) { //rect is visible
      if (!cdy[i].started) {
        cdy[i].startup();
        cdy[i].started = true;
      }
      cdy[i].play();
    } else {
      if (cdy[i].started) cdy[i].pause();
    }
  }
}

</script>


<script id="treeinit" type="text/x-cindyscript">
  N = 5;
  imagetime = 1.8; //time for a single image to be displayed
  forall(0..N-1,
    createimage("tree"+#, 600, 600); //supersampling
  );
  forall(0..1,
    createimage("out"+#, 600, 600);
  );
  it = 1;
  o1(it) := "tree" + mod(it - 1, N);
  o2(it) := "tree" + mod(floor(it - 2 - (N-3)*random()), N);
  rp() := ((random(), random()) - (.5, .5))*.25;
  
  L = (-3,-2.5);
  R = (3,-2.5);
  
  lastsecond = -1;
  cnt = 0;
</script>

<script id="treedraw" type="text/x-cindyscript">
  if(cnt < 10,
    it = mod(it + 1, N);

    f1 = map(A, B, B, C + rp());
    f2 = map(A, B, B, D + rp());
    
    clearimage("tree"+it);
    canvas(L, R, "tree"+it,
      draw(A, B, color->[0,0,0], size->13);
      drawimage(f1*L.homog, f1*R.homog, o1(it), alpha->.55+random()/2);
      drawimage(f2*L.homog, f2*R.homog, o2(it), alpha->.55+random()/2);
    );
  );
  
  m = mod(floor(seconds()/imagetime),2);
  
  if(floor(seconds()/imagetime) > lastsecond,
    clearimage("out"+m);
    canvas(L, R, "out"+m, drawimage(L, R, "tree" + it));
    lastsecond = floor(seconds()/imagetime);
    cnt = 0;
  );
  f = (1-cos(mod(seconds()/imagetime, 1)*pi))*.5;
  drawimage(L, R, "out" + m, alpha -> f);
  drawimage(L, R, "out" + (1-m), alpha -> (1-f));
</script>

<script id='init' type='text/x-cindyscript'>
l=[];

</script>

<script id='csmove' type='text/x-cindyscript'>
l=l++[A.xy];
if(length(l)>80,l=apply(2..length(l),l_#));
damp=.95;
al=damp^(length(l));
forall(1..length(l),
draw(l_#,alpha->al,color->(1,.5,.5),size->7*al);
al=al/damp);
</script>


<script id="complexinit" type="text/x-cindyscript">
f(z) := z^5-1;

t0 = seconds();
</script>
<script id="complexdraw" type="text/x-cindyscript">
hsvToRGB(h, s, v) := (
  regional(j, p, q, t, f);
  
  h = (h-floor(h))*6;
  
  j = floor(h);
  f = h - j;
  
  p = 1 - s;
  q = 1 - s*f;
  t = 1 - s*(1-f);

  if(j == 0, [1, t, p],
  if(j == 1, [q, 1, p],
  if(j == 2, [p, 1, t],
  if(j == 3, [p, q, 1],
  if(j == 4, [t, p, 1],
  if(j == 5, [1, p, q]))))))*v
);


time = t0-seconds();


color(z) := ( //what color should be given to a complex number z?
  regional(n, grey1, grey2);
  
  n = 12;
  z = log(z)/2/pi + i*time*.1;
  
  zfract = n*z - floor(n*z); //value of n*z in C mod Z[i]
  
  grey1 = im(zfract);
  grey2 = 1;//re(zfract);
  
  hsvToRGB(im(z), 1., .5+.5*re(sqrt(grey1*grey2)))
);

colorplot(
  z = complex(#);
  color(f(z))
);
</script>
