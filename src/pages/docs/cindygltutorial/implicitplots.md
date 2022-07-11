---
title: Implicit Plots
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
<script id="csinit" type="text/x-cindyscript">
drawcmd() := (
  colorplot([0.7,0.3,0]);
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
window.onload = function() {
  var cdy = CindyJS({
    ports: [{
      id: "CSCanvas",
      transform: [{visibleRect:[-2,2,2,-2]}],
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
    value: `colorplot( sin(1/#.x) - #.y );`,
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


## Three ways to do implicit plots


This will check for small difference between f(x) and y.
```cindyscript
f(x):= sin(1/x);
colorplot( if(|(f(#.x)-#.y)|<.1,0,1) ); 
```

This will check for sign changes
```cindyscript
pixel = 512; h = 4; step = h/pixel; f(x):= sin(1/x);
colorplot( if( (f(#.x)-#.y)*(f(#.x)-#.y-step) < 0 ,0,1)); 
```

This will check both in x and y direction:
```cindyscript
pixel = 512; h = 4; step = h/pixel; f(x):= sin(1/x);
colorplot(
 if( (f(#.x)-#.y)*(f(#.x)-#.y-step) < 0 %
     (f(#.x)-#.y)*(f(#.x-step)-#.y) < 0    ,0,1) ); 
```

## Wrapping Up

CindyGL basically supports a colorplot command that colorizes each pixel within an applet. `colorplot` takes an CindyScript-program that and will be transcompiled to the GPU. The pixel coordinate within `colorplot` can be accessed through `#`.

[You can continue our tutorial by learning how to build real applets here.](creatingapplets.html)
