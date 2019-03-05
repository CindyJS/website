<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
<script type="text/x-mathjax-config">
  MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}});
</script>

Complex functions $ f:\mathbb{C}\to\mathbb{C} $ can be visualized by plotting the function $\tilde f: \mathbb{R^2} \to \mathbb{R}$ with $\tilde f(x,y) = \|f(x + i y)\|$ in 3D. The color of a patch $(x, y, \|f(x + i y)\|)$ indicates [the phase](../ComplexExplorer) of the complex number $f(x + i y)$.

You can enter your own function $f$ or select one function of the following list:
<p><select id="sel" size="5" style="width:20em;">
<option data-a="1" data-p="z">z</option>
<option data-zoom=".15" data-p="z^2">z^2</option>
<option data-a="1" data-zoom="0.1" data-q="z">1/z</option>
<option data-a="1" data-zoom="0.1" data-q="z^3">1/z^3</option>
<option data-zoom="0.1" data-p="z^7+z+2">z^7+z+2</option>
<option data-a="1" data-zoom="0.1" data-q="z^5-1">1/(z^5-1)</option>
<option data-a="1" data-zoom="0.1" data-p="z^5+1" data-q="z^5-1">(z^5+1)/(z^5-1)</option>
<option data-a="1" data-p="z-1" data-q="z*z+1">(z-1)/(z^2+1)</option>
<option data-a="1" data-p="z*z+1" data-q="z*z-1">(z^2+1)/(z^2-1)</option>
<option data-a="1" data-q="z^round(20*a-10)-1">1/(z^round(20*a-10)-1)</option>
<option data-a="1" data-p="sqrt(z)">sqrt(z)</option>
<option data-a="1" data-p="log(z)">log(z)</option>
<option data-a="1" data-p="sin(z)">sin(z)</option>
<option data-a="1" data-p="exp(z)">exp(z)</option>
<option data-a="1" data-p="sqrt(1-z*z)">sqrt(1-z*z)</option>
<option data-a="1" data-zoom="0" data-p="sin(z)" data-q="cos(z)">tan(z)</option>
<option data-a=".2" data-p="sin(z+3*a)" data-q="sin(z+i)">sin(z+3*a)/sin(z+i)</option>
<option data-a="1/3" data-zoom="0.1" data-q="sin(pi*a+z^3)">1/sin(pi*a+z^3)</option>
<option data-a="1" data-zoom="0.1" data-q="sin((z+1)/(z-1))">1/sin((z+1)/(z-1))</option>
<option data-a="1" data-zoom="-.2" data-p="z^z">z^z</option>
<option data-a="1" data-zoom="-.2" data-p="log(z^z)" data-q="z">log(z^z)/z</option>
</select></p>

<script type="text/javascript">
var select = document.getElementById("sel");
select.addEventListener('change', function(event) {
var p = this.options[this.selectedIndex].getAttribute("data-p") || "1";
var q = this.options[this.selectedIndex].getAttribute("data-q") || "1";

document.getElementById('inp').value = this.value;
//document.getElementById('inpp').innerHTML = p;
//document.getElementById('inpq').innerHTML = q;

cdy.evokeCS('p(z) := (' + p + '); q(z) := (' + q + '); init();');

var a = this.options[this.selectedIndex].getAttribute("data-a") || .5;
cdy.evokeCS('seta(' + a + ')');

var zoom = this.options[this.selectedIndex].getAttribute("data-zoom");
if(zoom) cdy.evokeCS('setzoom(' + zoom + ')');

}, false);
</script>

##### Software: <a href="http://cindyjs.org">CindyJS</a><br>
  Computations are performed on the GPU through CindyGL.
  User defined input is parsed by <a href="http://algebrite.org/">Algebrite</a>.

##### Widget Author:
  Aaron Montag
