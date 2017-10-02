<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
<script type="text/x-mathjax-config">
  MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}});
</script>

  Here you see how the stereographic projection of the earth onto a plane is obtained. For each point on the surface, a ray from the north-pole through this point is constructed. The intersection of the ray with the plane is the projected point.
  
##### Controls
  
  You can press **R** to show the ray from the north-pole through the earth to the plane.
  
  If you press **I** the sphere is reversed. Mathematically, this corresponds to the map $z \mapsto \frac{1}{z}$ on the Riemann Sphere.
  
  With **A** and **B** you can adjust the height of the earth.
  
  If you have a spherical camera (such as the Ricoh Theta), then you can also switch to the camera input feed via **C** and use the spherical footage instead of the earth.
  

##### Software: <a href="http://cindyjs.org">CindyJS</a><br>
  Deformation made possible by connecting CindyJS to
  WebGL and calculating transformations on the GPU.

##### Widget Author:
  Aaron Montag, Texture from <a href="http://planetpixelemporium.com/earth.html">http://planetpixelemporium.com</a>
