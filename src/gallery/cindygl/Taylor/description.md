On the left, a phase portrait of a complex function is displayed.
On the right, one can see the approximation of the function through it's Taylor polynomials at the red base point.

The complex function, the base point, the order of the polynomial and the zoom can be modified.

You can also select one function of the following list:
<select size="5" id="sel" onchange="cdy.evokeCS(this.value);" style="width:10em;">
  <option value='Input.text = "1/z";'>1/z</option>
  <option value='Input.text = "z^(1/2)";'>square root</option>
  <option value='Input.text = "log(z)";'>logarithm</option>
  <option value='Input.text = "sin(z)";'>sine</option>
  <option value='Input.text = "sin(z)/cos(z)";'>tangens</option>
  <option value='Input.text = "exp(z)";'>exponential function</option>
</select>
