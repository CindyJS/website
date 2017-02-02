Non-algebraic functions are approximated by polynomials.
Roots are isolated by Descartes Method in Bernstein basis.

You can enter your own implicit surfaces or select one of the following list:
<select id="sel" size="15" style="width:20em;"><option data-a="1" value="(x^2+y^2+z^2-(0.5+a)^2)^2-(3*((0.5+a)^2)-1)/(3-((0.5+a)^2))*(1-z-sqrt(2)*x)*(1-z+sqrt(2)*x)*(1+z+sqrt(2)*y)*(1+z-sqrt(2)*y)">Kummer Quartic</option>
  <option data-a="1" value="4*((a*(1+sqrt(5))/2)^2*x^2-y^2)*((a*(1+sqrt(5))/2)^2*y^2-z^2)*((a*(1+sqrt(5))/2)^2*z^2-x^2)-1*(1+2*(a*(1+sqrt(5))/2))*(x^2+y^2+z^2-1)^2">Barth Sextic</option>
  <option data-a="0" value="-2*a/125+x^8+y^8+z^8-2*x^6-2*y^6-2*z^6+1.25*x^4+1.25*y^4+1.25*z^4-0.25*x^2-0.25*y^2-0.25*z^2+0.03125">Chmutov Octic</option>
  <option data-a="1" data-zoom="-.1" value="a*(-1/4*(1-sqrt(2))*(x^2+y^2)^2+(x^2+y^2)*((1-1/sqrt(2))*z^2+1/8*(2-7*sqrt(2)))-z^4+(0.5+sqrt(2))*z^2-1/16*(1-12*sqrt(2)))^2-(cos(0*pi/4)*x+sin(0*pi/4)*y-1)*(cos(pi/4)*x+sin(pi/4)*y-1)*(cos(2*pi/4)*x+sin(2*pi/4)*y-1)*(cos(3*pi/4)*x+sin(3*pi/4)*y-1)*(cos(4*pi/4)*x+sin(4*pi/4)*y-1)*(cos(5*pi/4)*x+sin(5*pi/4)*y-1)*(cos(6*pi/4)*x+sin(6*pi/4)*y-1)*(cos(7*pi/4)*x+sin(7*pi/4)*y-1)">
    Endraß Octic
  </option>
  <option data-zoom=".2" value="x^2+y^2+z^2-1">Ball</option>
  <option data-zoom=".2" value="k = 6; x^k+y^k+z^k-1">Cube</option>
  <option data-zoom=".2" value="x^2+z^2-1/3*(1+y)^3*(1-y)^3">Citric</option>
  <option data-zoom=".1" value="x^2+y^2+z^3-z^2">Ding Dong</option>
  <option data-zoom="0" value="x^3+x^2*z^2-y^2">Hummingbird</option>
  <option data-zoom=".2" value="x^2-x^3+y^2+y^4+z^3-z^4">Vis a Vis</option>
  <option data-zoom=".1" value="(x^2+9/4*y^2+z^2-1)^3-x^2*z^3-9/80*y^2*z^3">Sweet</option>
  <option data-zoom=".2" data-a="1/4" value="k=a*2;(x+(k/2-1))*(x^2+y^2+z^2-k^2/4)+z^2">Parabolic Ring Cyclide</option>
  <option data-a="0" data-zoom="-.15" value="cos(x)*sin(y) + cos(y)*sin(z) + cos(z)*sin(x) + a">Gyroid</option>
  <option data-a="0" data-zoom="-.15" value="cos(x)+cos(y)+cos(z)+a">Schwarz P</option>
  <option data-a=".5" data-zoom=".1"  value="r=a; R=1; (x^2+y^2+z^2+R^2-r^2)^2-4*R^2*(x^2+y^2)">Torus</option>
  <option data-a=".4" data-zoom="-.1" value = "r=a/2; R=.9; ((sin(x)^2+y^2+z^2+R^2-r^2)^2-4*R^2*(sin(x)^2+y^2))*((cos(x)^2+y^2+z^2+R^2-r^2)^2-4*R^2*(cos(x)^2+z^2))">Interleaved Tori</option>
</select>
<script type="text/javascript">
var select = document.getElementById("sel");
select.addEventListener('change', function(event) {
  document.getElementById('inp').value = this.value;
  cdy.evokeCS('fun(x,y,z) := (' + this.value + '); init();');
  
  var a = this.options[this.selectedIndex].getAttribute("data-a") || .5;
  cdy.evokeCS('seta(' + a + ')');
  
  var zoom = this.options[this.selectedIndex].getAttribute("data-zoom");
  if(zoom) cdy.evokeCS('setzoom(' + zoom + ')');
  
}, false);
</script>
