<input type="text" id="inp" value="(x^2+y^2+z^2-(0.5+a)^2)^2-(3*((0.5+a)^2)-1)/(3-((0.5+a)^2))*(1-z-sqrt(2)*x)*(1-z+sqrt(2)*x)*(1+z+sqrt(2)*y)*(1+z-sqrt(2)*y)"  onkeypress="if((event.which ? event.which : event.keyCode)==13) { cdy.evokeCS('fun(x,y,z) := (' + this.value + '); init();'); }" size="80" style="font-size:18px">
<select id="sel" onchange="document.getElementById('inp').value = this.value; cdy.evokeCS('fun(x,y,z) := (' + this.value + '); init();');" style="width:20em;">  
  <option value="(x^2+y^2+z^2-(0.5+a)^2)^2-(3*((0.5+a)^2)-1)/(3-((0.5+a)^2))*(1-z-sqrt(2)*x)*(1-z+sqrt(2)*x)*(1+z+sqrt(2)*y)*(1+z-sqrt(2)*y)">Kummer Quartic</option>
  <option value="4*((a*(1+sqrt(5))/2)^2*x^2-y^2)*((a*(1+sqrt(5))/2)^2*y^2-z^2)*((a*(1+sqrt(5))/2)^2*z^2-x^2)-1*(1+2*(a*(1+sqrt(5))/2))*(x^2+y^2+z^2-1)^2">Barth Sextic</option>
  <option value="-2*a/125+x^8+y^8+z^8-2*x^6-2*y^6-2*z^6+1.25*x^4+1.25*y^4+1.25*z^4-0.25*x^2-0.25*y^2-0.25*z^2+0.03125">Chmutov Octic</option>
  <option value="a*(-1/4*(1-sqrt(2))*(x^2+y^2)^2+(x^2+y^2)*((1-1/sqrt(2))*z^2+1/8*(2-7*sqrt(2)))-z^4+(0.5+sqrt(2))*z^2-1/16*(1-12*sqrt(2)))^2-(cos(0*pi/4)*x+sin(0*pi/4)*y-1)*(cos(pi/4)*x+sin(pi/4)*y-1)*(cos(2*pi/4)*x+sin(2*pi/4)*y-1)*(cos(3*pi/4)*x+sin(3*pi/4)*y-1)*(cos(4*pi/4)*x+sin(4*pi/4)*y-1)*(cos(5*pi/4)*x+sin(5*pi/4)*y-1)*(cos(6*pi/4)*x+sin(6*pi/4)*y-1)*(cos(7*pi/4)*x+sin(7*pi/4)*y-1)">
    Endraß Octic
  </option>
  <option value="x^2+y^2+z^2-1">Ball</option>
  <option value="k = 6; x^k+y^k+z^k-1">Cube</option>
  <option value="x^2+z^2-1/3*(1+y)^3*(1-y)^3">Citric</option>
  <option value="x^2+y^2+z^3-z^2">Ding Dong</option>
  <option value="x^3+x^2*z^2-y^2">Hummingbird</option>
  <option value="x^2-x^3+y^2+y^4+z^3-z^4">Vis a Vis</option>
  <option value="(x^2+9/4*y^2+z^2-1)^3-x^2*z^3-9/80*y^2*z^3">Sweet</option>
  <option value="k=a*2;(x+(k/2-1))*(x^2+y^2+z^2-k^2/4)+z^2">Parabolic Ring Cyclide</option>
  <option value="cos(2*x)*sin(2*y) + cos(2*y)*sin(2*z) + cos(2*z)*sin(2*x)+a">Gyroid</option>
  <option value="cos(2*x)+cos(2*y)+cos(2*z)+a">Schwarz P</option>
</select>
</div>
    Non-algebraic functions are approximated by polynomials.
    Roots are isolated by Descartes Method in Bernstein basis.
    
