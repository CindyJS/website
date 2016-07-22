(function(){
'use strict';var c3d_resources = {"common_frag":"uniform mat4 uProjectionMatrix;\n\nbool gDiscard=false;\n\nvec3 sphere(in vec3 ray,in vec3 center,in float radius,in float face){\n\nvec3 dir=normalize(ray);\n\n\n\n\nfloat b=dot(center,dir);\nfloat c=dot(center,center) -radius*radius;\nfloat d=b*b-c;\nif(d<0.0)gDiscard=true;\nfloat lambda=b+face*sqrt(d);\nif(lambda<0.0)gDiscard=true;\n\n\nreturn lambda*dir;\n}\n\nvoid finish(in vec3 pos,in vec3 normal,in vec3 flatPos){\nif(gDiscard){\nif(uDemoHack>1.0){\ngl_FragColor=vec4(0.0,0.0,1.0,uDemoHack-1.0);\n}else{\ndiscard;\n}\n}else{\nshade(pos,normal);\n#ifdef GL_EXT_frag_depth\nvec4 projPoint=uProjectionMatrix*vec4(pos,1);\nif(uDemoHack>1.0)\nprojPoint=uProjectionMatrix*vec4(flatPos,1);\ngl_FragDepthEXT= (projPoint.z/projPoint.w+1.0) /2.0;\n#endif\n}\n}\n", 
"cylinder_frag":"varying vec3 vPoint1;\n\nvarying vec3 vPoint2;\n\nvarying vec3 vPos;\n\nvarying float vRadius;\n\nvec3 endcaps(in float mu,inout vec3 pos){\nvec3 center;\nif(mu<0.0){\ncenter=vPoint1;\n}else if(mu>1.0){\ncenter=vPoint2;\n}else{\nreturn(1.0-mu)*vPoint1+mu*vPoint2;\n}\npos=sphere(vPos,center,vRadius, -1.0);\nreturn center;\n}\n\n\n\n\nvoid main(){\n\n\nvec3 ba=vPoint2-vPoint1;\nvec3 u=ba/dot(ba,ba);\nvec3 v=vPos-dot(vPos,ba)*u;\nvec3 w=dot(vPoint1,ba)*u-vPoint1;\nfloat a=dot(v,v);\nfloat b=2.0*dot(v,w);\nfloat c=dot(w,w) -vRadius*vRadius;\nfloat d=b*b-4.0*a*c;\nif(d<0.0)\ngDiscard=true;\nfloat lambda= (b+sqrt(d))/(-2.0*a);\nvec3 pointOnSurface=lambda*vPos;\nfloat mu=dot(pointOnSurface-vPoint1,u);\nvec3 center=endcaps(mu,pointOnSurface);\nvec3 normal=normalize(pointOnSurface-center);\nfinish(pointOnSurface,normal,vPos);\n}\n", 
"cylinder_vert":"uniform mat4 uProjectionMatrix;\n\nuniform mat4 uModelViewMatrix;\n\nuniform mat4 uRefMatrix;\nuniform mat4 uRefMatrixInverse;\nuniform float uDemoHack;\n\nattribute vec4 aPoint1;\n\nattribute vec4 aPoint2;\n\nattribute vec4 aColor;\n\nattribute vec4 aRelativeRadius;\n\nattribute vec4 aShininess;\n\nvarying vec3 vPoint1;\n\nvarying vec3 vPoint2;\n\nvarying vec3 vPos;\n\nvarying vec4 vColor;\n\nvarying float vRadius;\n\n\n\n\nvoid main(){\n\nvec4 hom;\nhom=uModelViewMatrix*aPoint1;\nif(uDemoHack>0.5)\nhom=uRefMatrix*aPoint1;\nvPoint1=hom.xyz/hom.w;\nhom=uModelViewMatrix*aPoint2;\nif(uDemoHack>0.5)\nhom=uRefMatrix*aPoint2;\nvPoint2=hom.xyz/hom.w;\nvec3 dir=normalize(vPoint2-vPoint1);\n\n\nvec3 d2,d3;\nif(abs(dir.x) <abs(dir.y))\nd2=vec3(1,0,0);\nelse\nd2=vec3(0,1,0);\nd2=normalize(cross(dir,d2));\nd3=normalize(cross(dir,d2));\n\nvPos=aRelativeRadius.w*(mat3(dir,d2,d3)*aRelativeRadius.xyz)\n+0.5*((vPoint2+vPoint1) +aRelativeRadius.x*(vPoint2-vPoint1));\n\n\nvColor=aColor;\nvShininess=aShininess.x;\nvRadius=aRelativeRadius.w;\n\n\ngl_Position=uProjectionMatrix*vec4(vPos,1);\nif(uDemoHack>0.5){\ngl_Position=uProjectionMatrix*uModelViewMatrix*\nuRefMatrixInverse*vec4(vPos,1);\n}\n}\n", 
"lighting1":"uniform vec3 uAmbient;\nuniform mat4 uModelViewMatrix;\nuniform mat4 uModelViewMatrixInverse;\nuniform mat4 uRefMatrix;\nuniform float uDemoHack;\n\nvarying vec4 vColor;\nvarying float vShininess;\n\nvec3 gPos;\nvec3 gEye;\nvec3 gNormal;\nvec3 gAccumDiffuse;\nvec3 gAccumSpecular;\n\nvoid commonLight(in vec4 lightPos,out vec3 lightDir,\nout float diffuseFactor,out float specularFactor){\nvec3 halfVector;\nfloat specularDot;\n\nlightDir=normalize(lightPos.xyz-lightPos.w*gPos);\nhalfVector=normalize(lightDir+gEye);\ndiffuseFactor=max(0.0,dot(gNormal,lightDir));\nspecularDot=max(0.0,dot(gNormal,halfVector));\n\n\nif(diffuseFactor==0.0)\nspecularFactor=0.0;\nelse\nspecularFactor=pow(specularDot,vShininess);\n}\n\nvec4 flipY(in vec4 v){\nreturn vec4(v.x, -v.y,v.z,v.w);\n}\n\nvoid pointLight(in vec4 lightPos,in vec3 diffuse,in vec3 specular){\nvec3 lightDir;\nfloat diffuseFactor;\nfloat specularFactor;\n\ncommonLight(lightPos,lightDir,diffuseFactor,specularFactor);\n\n\ngAccumDiffuse +=diffuse*diffuseFactor;\ngAccumSpecular+=specular*specularFactor;\n}\n\nvoid cameraPointLight(in vec4 lightPos,in vec3 diffuse,in vec3 specular){\npointLight(flipY(lightPos),diffuse,specular);\n}\n\nvoid worldPointLight(in vec4 lightPos,in vec3 diffuse,in vec3 specular){\npointLight(-uModelViewMatrix*lightPos,diffuse,specular);\n}\n\nvoid spotLight(\nin vec4 lightPos,in vec4 spotPos,in float spotCosCutoff,\nin float spotExponent,in vec3 diffuse,in vec3 specular)\n{\nvec3 lightDir;\nfloat diffuseFactor;\nfloat specularFactor;\nvec3 spotDir;\nfloat spotCosAngle;\nfloat spotAttenuation;\n\ncommonLight(lightPos,lightDir,diffuseFactor,specularFactor);\n\nspotDir=lightPos.w*spotPos.xyz-spotPos.w*lightPos.xyz;\nspotCosAngle=dot(-lightDir,normalize(spotDir));\nspotAttenuation=\nstep(spotCosCutoff,spotCosAngle) *pow(spotCosAngle,spotExponent);\n\n\ngAccumDiffuse +=spotAttenuation*diffuse*diffuseFactor;\ngAccumSpecular+=spotAttenuation*specular*specularFactor;\n}\n\nvoid cameraSpotLight(\nin vec4 lightPos,in vec4 spotPos,in float spotCosCutoff,\nin float spotExponent,in vec3 diffuse,in vec3 specular)\n{\nspotLight(\nflipY(lightPos),flipY(spotPos),\nspotCosCutoff,spotExponent,diffuse,specular);\n}\n\nvoid worldSpotLight(\nin vec4 lightPos,in vec4 spotPos,in float spotCosCutoff,\nin float spotExponent,in vec3 diffuse,in vec3 specular)\n{\nspotLight(\n-uModelViewMatrix*lightPos, -uModelViewMatrix*spotPos,\nspotCosCutoff,spotExponent,diffuse,specular);\n}\n", 
"lighting2":"\n\n\n\n\n\nvoid shade(in vec3 position,in vec3 normal){\n\ngAccumDiffuse=vec3(0.0);\ngAccumSpecular=vec3(0.0);\n\n\ngPos=position;\nif(uDemoHack>0.5){\nvec4 hom=vec4(position,1.0);\nhom=uRefMatrix*uModelViewMatrixInverse*hom;\ngPos=hom.xyz/hom.w;\n}\ngEye= -normalize(position);\ngNormal=sign(dot(gEye,normal))*normal;\n\n\nlightScene();\n\n\n\nvec3 color= (uAmbient+gAccumDiffuse) *vColor.xyz\n+gAccumSpecular;\n\ncolor=clamp(color,0.0,1.0);\ngl_FragColor=vec4(color.xyz,vColor.w);\n}\n", 
"sphere_frag":"\nuniform float sphereMode;\n\n\nvarying vec3 vViewSpacePos;\n\nvarying vec3 vViewSpaceCenter;\n\nvarying float vRadius;\n\n\n\n\nvoid main(){\nvec3 pointOnSphere=\nsphere(vViewSpacePos,vViewSpaceCenter,vRadius,sphereMode);\nvec3 normal=normalize(pointOnSphere-vViewSpaceCenter);\nfinish(pointOnSphere,normal,vViewSpacePos);\n}\n", "sphere_vert":"uniform mat4 uProjectionMatrix;\n\nuniform mat4 uModelViewMatrix;\n\nuniform mat4 uRefMatrix;\nuniform mat4 uRefMatrixInverse;\nuniform float uDemoHack;\n\nattribute vec4 aCenter;\n\nattribute vec4 aColor;\n\nattribute vec4 aRelativeShininessRadius;\n\nvarying vec3 vViewSpacePos;\n\nvarying vec3 vViewSpaceCenter;\n\nvarying vec4 vColor;\n\nvarying float vRadius;\n\n\n\n\nvoid main(){\n\nvec4 viewPosHom=uModelViewMatrix*aCenter;\nif(uDemoHack>0.5)\nviewPosHom=uRefMatrix*aCenter;\nvViewSpaceCenter=viewPosHom.xyz/viewPosHom.w;\nvec3 dir=normalize(-vViewSpaceCenter);\nvec3 right=normalize(cross(dir,vec3(0,1,0)));\nvec3 up=normalize(cross(right,dir));\n\n\nvColor=aColor;\nvShininess=aRelativeShininessRadius.z;\nvRadius=aRelativeShininessRadius.w;\n\n\nvViewSpacePos=vViewSpaceCenter+\nvRadius*(right*aRelativeShininessRadius.x+\nup*aRelativeShininessRadius.y+dir);\n\n\ngl_Position=uProjectionMatrix*vec4(vViewSpacePos,1);\nif(uDemoHack>0.5){\ngl_Position=uProjectionMatrix*uModelViewMatrix*\nuRefMatrixInverse*vec4(vViewSpacePos,1);\n}\n}\n", 
"texq_frag":"precision mediump float;\n\nuniform sampler2D uTexture;\nvarying vec2 vPos;\n\nvoid main(){\ngl_FragColor=texture2D(uTexture,vPos);\n}\n", "texq_vert":"precision mediump float;\n\nattribute vec4 aPos;\nvarying vec2 vPos;\n\nvoid main(){\nvPos=aPos.zw;\ngl_Position=vec4(aPos.xy,0,1);\n}\n", "triangle_frag":"varying vec4 vPos;\nvarying vec4 vNormal;\n\nvoid main(){\nfinish(vPos.xyz/vPos.w,normalize(vNormal.xyz),vPos.xyz/vPos.w);\n}\n", "triangle_vert":"uniform mat4 uProjectionMatrix;\nuniform mat4 uModelViewMatrix;\n\nattribute vec4 aPos;\nattribute vec4 aNormalAndShininess;\nattribute vec4 aColor;\n\nvarying vec4 vPos;\nvarying vec4 vNormal;\nvarying vec4 vColor;\n\nvoid main(){\nvPos=uModelViewMatrix*aPos;\ngl_Position=uProjectionMatrix*vPos;\nvNormal=uModelViewMatrix*vec4(aNormalAndShininess.xyz,0.0);\nvShininess=aNormalAndShininess.w;\nvColor=aColor;\n}\n"};
function GlError(message) {
  this.message = message;
}
GlError.prototype.toString = function() {
  return this.message;
};
function ShaderProgram(gl, vertexShaderCode, fragmentShaderCode) {
  this.handle = gl.createProgram();
  this.vs = this.createShader(gl, gl.VERTEX_SHADER, vertexShaderCode);
  this.fs = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderCode);
  this.link(gl);
  this.detectUniforms(gl);
}
ShaderProgram.prototype.handle;
ShaderProgram.prototype.vs;
ShaderProgram.prototype.fs;
ShaderProgram.prototype.uniform;
ShaderProgram.prototype.attrib;
ShaderProgram.prototype.createShader = function(gl, kind, code) {
  var shader = gl.createShader(kind);
  gl.shaderSource(shader, code);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(code.split("\n"));
    throw new GlError("Error compiling shader:\n" + gl.getShaderInfoLog(shader));
  }
  gl.attachShader(this.handle, shader);
  return shader;
};
ShaderProgram.prototype.use = function(gl) {
  gl.useProgram(this.handle);
  return this;
};
ShaderProgram.prototype.link = function(gl) {
  var handle = this.handle;
  gl.linkProgram(handle);
  if (!gl.getProgramParameter(handle, gl.LINK_STATUS)) {
    throw new GlError("Error linking shader:\n" + gl.getProgramInfoLog(handle));
  }
  gl.validateProgram(handle);
  if (!gl.getProgramParameter(handle, gl.VALIDATE_STATUS)) {
    throw new GlError("Error validating shader:\n" + gl.getProgramInfoLog(handle));
  }
};
ShaderProgram.prototype.dispose = function(gl) {
  gl.detachShader(this.handle, this.vs);
  gl.deleteShader(this.vs);
  gl.detachShader(this.handle, this.fs);
  gl.deleteShader(this.fs);
  gl.deleteProgram(this.handle);
};
ShaderProgram.prototype.detectUniforms = function(gl) {
  this.uniform = this.detectImpl(gl, true);
};
ShaderProgram.prototype.detectAttributes = function(gl) {
  this.attrib = this.detectImpl(gl, false);
};
ShaderProgram.prototype.detectImpl = function(gl, uniform) {
  var i, n, handle = this.handle, info;
  var name, match, root = {}, node, base, idx, leaf;
  var size, j, arr, name2;
  if (uniform) {
    n = (gl.getProgramParameter(handle, gl.ACTIVE_UNIFORMS));
  } else {
    n = (gl.getProgramParameter(handle, gl.ACTIVE_ATTRIBUTES));
  }
  for (i = 0;i < n;++i) {
    if (uniform) {
      info = gl.getActiveUniform(handle, i);
    } else {
      info = gl.getActiveAttrib(handle, i);
    }
    if (info === null) {
      continue;
    }
    name = info.name.replace(/\]/g, "");
    if (!name) {
      continue;
    }
    node = root;
    while ((match = /[.\[]/.exec(name)) !== null) {
      base = name.substr(0, match.index);
      if (node.hasOwnProperty(base)) {
        node = node[base];
      } else {
        if (match[0] === ".") {
          node = node[base] = {};
        } else {
          node = node[base] = [];
        }
      }
      name = name.substr(match.index + 1);
    }
    if (info.size > 1) {
      size = info.size;
      arr = Array(size);
      for (j = 0;j < size;++j) {
        name2 = info.name + "[" + j + "]";
        if (uniform) {
          leaf = this.uniformSetter(gl, name2, info);
        } else {
          leaf = this.attribFactory(gl, name2, info);
        }
        arr[j] = leaf;
      }
      node[name] = arr;
    } else {
      if (uniform) {
        leaf = this.uniformSetter(gl, info.name, info);
      } else {
        leaf = this.attribFactory(gl, info.name, info);
      }
      node[name] = leaf;
    }
  }
  return root;
};
ShaderProgram.prototype.uniformSetter = function(gl, name, info) {
  var handle = this.handle, loc;
  loc = gl.getUniformLocation(handle, name);
  switch(info.type) {
    case gl.FLOAT:
      return gl.uniform1fv.bind(gl, loc);
    case gl.FLOAT_VEC2:
      return gl.uniform2fv.bind(gl, loc);
    case gl.FLOAT_VEC3:
      return gl.uniform3fv.bind(gl, loc);
    case gl.FLOAT_VEC4:
      return gl.uniform4fv.bind(gl, loc);
    case gl.BOOL:
    ;
    case gl.INT:
    ;
    case gl.SAMPLER_2D:
    ;
    case gl.SAMPLER_CUBE:
      return gl.uniform1iv.bind(gl, loc);
    case gl.BOOL_VEC2:
    ;
    case gl.INT_VEC2:
      return gl.uniform2iv.bind(gl, loc);
    case gl.BOOL_VEC3:
    ;
    case gl.INT_VEC3:
      return gl.uniform3iv.bind(gl, loc);
    case gl.BOOL_VEC4:
    ;
    case gl.INT_VEC4:
      return gl.uniform4iv.bind(gl, loc);
    case gl.FLOAT_MAT2:
      return gl.uniformMatrix2fv.bind(gl, loc, false);
    case gl.FLOAT_MAT3:
      return gl.uniformMatrix3fv.bind(gl, loc, false);
    case gl.FLOAT_MAT4:
      return gl.uniformMatrix4fv.bind(gl, loc, false);
    default:
      throw new GlError("Unknown data type for uniform " + name);;
  }
};
ShaderProgram.prototype.attribFactory = function(gl, name, info) {
  var handle = this.handle, loc;
  loc = gl.getAttribLocation(handle, name);
  switch(info.type) {
    case gl.FLOAT:
      return new VertexAttribute(gl, loc, gl.vertexAttrib1fv.bind(gl, loc));
    case gl.FLOAT_VEC2:
      return new VertexAttribute(gl, loc, gl.vertexAttrib2fv.bind(gl, loc));
    case gl.FLOAT_VEC3:
      return new VertexAttribute(gl, loc, gl.vertexAttrib3fv.bind(gl, loc));
    case gl.FLOAT_VEC4:
      return new VertexAttribute(gl, loc, gl.vertexAttrib4fv.bind(gl, loc));
    default:
      throw new GlError("Unknown data type for vertex attribute " + name);;
  }
};
function VertexAttribute(gl, location, setter) {
  this.gl = gl;
  this.location = location;
  this.set = setter;
}
;function norm3(v) {
  var x = v[0], y = v[1], z = v[2];
  return Math.sqrt(x * x + y * y + z * z);
}
function normalized3(v) {
  var x = v[0], y = v[1], z = v[2];
  var f = 1 / Math.sqrt(x * x + y * y + z * z);
  return [f * x, f * y, f * z];
}
function dehom3(v) {
  var f = 1 / v[3];
  return [f * v[0], f * v[1], f * v[2]];
}
function scale3(f, v) {
  return [f * v[0], f * v[1], f * v[2]];
}
function transpose3(m) {
  return [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]];
}
function transpose4(m) {
  return [m[0], m[4], m[8], m[12], m[1], m[5], m[9], m[13], m[2], m[6], m[10], m[14], m[3], m[7], m[11], m[15]];
}
function adj3(m) {
  return [m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4], m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5], m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]];
}
function adj4(m) {
  return [-m[7] * m[10] * m[13] + m[6] * m[11] * m[13] + m[7] * m[9] * m[14] - m[5] * m[11] * m[14] - m[6] * m[9] * m[15] + m[5] * m[10] * m[15], m[3] * m[10] * m[13] - m[2] * m[11] * m[13] - m[3] * m[9] * m[14] + m[1] * m[11] * m[14] + m[2] * m[9] * m[15] - m[1] * m[10] * m[15], -m[3] * m[6] * m[13] + m[2] * m[7] * m[13] + m[3] * m[5] * m[14] - m[1] * m[7] * m[14] - m[2] * m[5] * m[15] + m[1] * m[6] * m[15], m[3] * m[6] * m[9] - m[2] * m[7] * m[9] - m[3] * m[5] * m[10] + m[1] * m[7] * m[10] + m[2] * 
  m[5] * m[11] - m[1] * m[6] * m[11], m[7] * m[10] * m[12] - m[6] * m[11] * m[12] - m[7] * m[8] * m[14] + m[4] * m[11] * m[14] + m[6] * m[8] * m[15] - m[4] * m[10] * m[15], -m[3] * m[10] * m[12] + m[2] * m[11] * m[12] + m[3] * m[8] * m[14] - m[0] * m[11] * m[14] - m[2] * m[8] * m[15] + m[0] * m[10] * m[15], m[3] * m[6] * m[12] - m[2] * m[7] * m[12] - m[3] * m[4] * m[14] + m[0] * m[7] * m[14] + m[2] * m[4] * m[15] - m[0] * m[6] * m[15], -m[3] * m[6] * m[8] + m[2] * m[7] * m[8] + m[3] * m[4] * m[10] - 
  m[0] * m[7] * m[10] - m[2] * m[4] * m[11] + m[0] * m[6] * m[11], -m[7] * m[9] * m[12] + m[5] * m[11] * m[12] + m[7] * m[8] * m[13] - m[4] * m[11] * m[13] - m[5] * m[8] * m[15] + m[4] * m[9] * m[15], m[3] * m[9] * m[12] - m[1] * m[11] * m[12] - m[3] * m[8] * m[13] + m[0] * m[11] * m[13] + m[1] * m[8] * m[15] - m[0] * m[9] * m[15], -m[3] * m[5] * m[12] + m[1] * m[7] * m[12] + m[3] * m[4] * m[13] - m[0] * m[7] * m[13] - m[1] * m[4] * m[15] + m[0] * m[5] * m[15], m[3] * m[5] * m[8] - m[1] * m[7] * 
  m[8] - m[3] * m[4] * m[9] + m[0] * m[7] * m[9] + m[1] * m[4] * m[11] - m[0] * m[5] * m[11], m[6] * m[9] * m[12] - m[5] * m[10] * m[12] - m[6] * m[8] * m[13] + m[4] * m[10] * m[13] + m[5] * m[8] * m[14] - m[4] * m[9] * m[14], -m[2] * m[9] * m[12] + m[1] * m[10] * m[12] + m[2] * m[8] * m[13] - m[0] * m[10] * m[13] - m[1] * m[8] * m[14] + m[0] * m[9] * m[14], m[2] * m[5] * m[12] - m[1] * m[6] * m[12] - m[2] * m[4] * m[13] + m[0] * m[6] * m[13] + m[1] * m[4] * m[14] - m[0] * m[5] * m[14], -m[2] * m[5] * 
  m[8] + m[1] * m[6] * m[8] + m[2] * m[4] * m[9] - m[0] * m[6] * m[9] - m[1] * m[4] * m[10] + m[0] * m[5] * m[10]];
}
function det4(m) {
  return m[3] * m[6] * m[9] * m[12] - m[2] * m[7] * m[9] * m[12] - m[3] * m[5] * m[10] * m[12] + m[1] * m[7] * m[10] * m[12] + m[2] * m[5] * m[11] * m[12] - m[1] * m[6] * m[11] * m[12] - m[3] * m[6] * m[8] * m[13] + m[2] * m[7] * m[8] * m[13] + m[3] * m[4] * m[10] * m[13] - m[0] * m[7] * m[10] * m[13] - m[2] * m[4] * m[11] * m[13] + m[0] * m[6] * m[11] * m[13] + m[3] * m[5] * m[8] * m[14] - m[1] * m[7] * m[8] * m[14] - m[3] * m[4] * m[9] * m[14] + m[0] * m[7] * m[9] * m[14] + m[1] * m[4] * m[11] * 
  m[14] - m[0] * m[5] * m[11] * m[14] - m[2] * m[5] * m[8] * m[15] + m[1] * m[6] * m[8] * m[15] + m[2] * m[4] * m[9] * m[15] - m[0] * m[6] * m[9] * m[15] - m[1] * m[4] * m[10] * m[15] + m[0] * m[5] * m[10] * m[15];
}
function inv4(m) {
  var f = 1 / det4(m);
  return adj4(m).map(function(a) {
    return f * a;
  });
}
function sub3(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function add3(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
function add4(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]];
}
function cross3(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function mul4mm(a, b) {
  return [a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12], a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13], a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14], a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15], a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12], a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13], a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14], a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15], a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + 
  a[11] * b[12], a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13], a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14], a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15], a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12], a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13], a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14], a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15]];
}
function mul3mv(m, v) {
  return [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];
}
function transform4to3(m, v) {
  var x = m[0] * v[0] + m[1] * v[1] + m[2] * v[2] + m[3] * v[3];
  var y = m[4] * v[0] + m[5] * v[1] + m[6] * v[2] + m[7] * v[3];
  var z = m[8] * v[0] + m[9] * v[1] + m[10] * v[2] + m[11] * v[3];
  var f = 1 / (m[12] * v[0] + m[13] * v[1] + m[14] * v[2] + m[15] * v[3]);
  return [x * f, y * f, z * f];
}
;function Camera(width, height) {
  this.width = width;
  this.height = height;
  this.fieldOfView = 45 * (Math.PI / 360);
  this.zNear = .1;
  this.zFar = 100;
  this.updatePerspective();
  this.setCamera([0, 0, 5], [0, 0, 0], [0, 1, 0]);
}
Camera.prototype.width;
Camera.prototype.height;
Camera.prototype.fieldOfView;
Camera.prototype.zNear;
Camera.prototype.zFar;
Camera.prototype.viewDist;
Camera.prototype.projectionMatrix;
Camera.prototype.modelMatrix;
Camera.prototype.viewMatrix;
Camera.prototype.mvMatrix;
Camera.prototype.updatePerspective = function() {
  var f = 1 / Math.tan(this.fieldOfView);
  var nearMinusFar = this.zNear - this.zFar;
  this.projectionMatrix = [f * this.height / this.width, 0, 0, 0, 0, f, 0, 0, 0, 0, (this.zFar + this.zNear) / nearMinusFar, -1, 0, 0, 2 * this.zFar * this.zNear / nearMinusFar, 0];
};
Camera.prototype.setCamera = function(position, lookAt, up) {
  var viewDir = sub3(position, lookAt);
  this.viewDist = norm3(viewDir);
  var z2 = normalized3(viewDir);
  var x2 = normalized3(cross3(up, z2));
  var y2 = cross3(z2, x2);
  var m1 = [x2[0], y2[0], z2[0], x2[1], y2[1], z2[1], x2[2], y2[2], z2[2]];
  var m2 = adj3(m1);
  var t = mul3mv(m2, lookAt);
  this.modelMatrix = [m2[0], m2[1], m2[2], -t[0], m2[3], m2[4], m2[5], -t[1], m2[6], m2[7], m2[8], -t[2], 0, 0, 0, 1];
  this.viewMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -this.viewDist, 0, 0, 0, 1];
  this.mvMatrix = mul4mm(this.viewMatrix, this.modelMatrix);
};
Camera.ORBIT_SENSITIVITY = .01;
Camera.prototype.orbitXY = function(dx, dy) {
  var ax = Camera.ORBIT_SENSITIVITY * dx, ay = Camera.ORBIT_SENSITIVITY * dy;
  var cx = Math.cos(ax), cy = Math.cos(ay);
  var sx = Math.sin(ax), sy = Math.sin(ay);
  var mx = [cx, 0, sx, 0, 0, 1, 0, 0, -sx, 0, cx, 0, 0, 0, 0, 1];
  var my = [1, 0, 0, 0, 0, cy, -sy, 0, 0, sy, cy, 0, 0, 0, 0, 1];
  this.modelMatrix = mul4mm(mul4mm(mx, my), this.modelMatrix);
  this.mvMatrix = mul4mm(this.viewMatrix, this.modelMatrix);
};
Camera.ROTATE_SENSITIVITY = -.01;
Camera.prototype.rotateXY = function(dx, dy) {
  var ax = Camera.ROTATE_SENSITIVITY * dx, ay = Camera.ROTATE_SENSITIVITY * dy;
  var cx = Math.cos(ax), cy = Math.cos(ay);
  var sx = Math.sin(ax), sy = Math.sin(ay);
  var mx = [cx, 0, sx, 0, 0, 1, 0, 0, -sx, 0, cx, 0, 0, 0, 0, 1];
  var my = [1, 0, 0, 0, 0, cy, -sy, 0, 0, sy, cy, 0, 0, 0, 0, 1];
  var mv = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, this.viewDist, 0, 0, 0, 1];
  this.mvMatrix = mul4mm(mul4mm(mx, my), this.mvMatrix);
  this.modelMatrix = mul4mm(mv, this.mvMatrix);
};
Camera.PAN_SENSITIVITY = .002;
Camera.prototype.translateXY = function(dx, dy) {
  var f = Camera.PAN_SENSITIVITY * this.viewDist, ax = f * dx, ay = -f * dy;
  var m = [1, 0, 0, ax, 0, 1, 0, ay, 0, 0, 1, 0, 0, 0, 0, 1];
  this.modelMatrix = mul4mm(m, this.modelMatrix);
  this.mvMatrix = mul4mm(this.viewMatrix, this.modelMatrix);
};
Camera.prototype.zoom = function(dy) {
  this.viewDist = this.viewDist * Math.pow(1.01, dy);
  this.viewMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -this.viewDist, 0, 0, 0, 1];
  this.mvMatrix = mul4mm(this.viewMatrix, this.modelMatrix);
};
Camera.DOLLY_SENSITIVITY = .02;
Camera.prototype.translateZ = function(dy) {
  var az = -Camera.DOLLY_SENSITIVITY * this.viewDist * dy;
  var m = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, az, 0, 0, 0, 1];
  this.modelMatrix = mul4mm(m, this.modelMatrix);
  this.mvMatrix = mul4mm(this.viewMatrix, this.modelMatrix);
};
Camera.prototype.rotateZ = function(dy) {
  var a = Camera.ROTATE_SENSITIVITY * dy;
  var c = Math.cos(a), s = Math.sin(a);
  var m = [c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  this.modelMatrix = mul4mm(m, this.modelMatrix);
  this.mvMatrix = mul4mm(this.viewMatrix, this.modelMatrix);
};
Camera.prototype.demohack = function() {
  this.refMatrix = this.mvMatrix;
};
Camera.prototype.refMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
var Appearance = {};
Appearance.Triple;
Appearance.Stack;
Appearance.POINT_SCALE = .05;
Appearance.createReal = function(color, alpha, shininess, size) {
  return {color:color, alpha:alpha, shininess:shininess, size:size};
};
Appearance.createScaled = function(color, alpha, shininess, size) {
  return {color:color, alpha:alpha, shininess:shininess, size:size * Appearance.POINT_SCALE};
};
Appearance.colorWithAlpha = function(appearance) {
  var color = appearance.color;
  return [color[0], color[1], color[2], appearance.alpha];
};
Appearance.clone = function(a) {
  return Appearance.createReal(a.color, a.alpha, a.shininess, a.size);
};
Appearance.mkTriple = function(p, l, s) {
  return {point:Appearance.clone(p), line:Appearance.clone(l), surface:Appearance.clone(s)};
};
function Viewer(name, ccOpts, opts, addEventListener) {
  var canvas = (document.getElementById(name));
  if (!canvas) {
    throw new GlError("No canvas element with id " + name);
  }
  var errorInfo = "Unknown";
  function onContextCreationError(e) {
    canvas.removeEventListener("webglcontextcreationerror", onContextCreationError, false);
    if (e.statusMessage) {
      errorInfo = e.statusMessage;
    }
  }
  canvas.addEventListener("webglcontextcreationerror", onContextCreationError, false);
  var gl = (canvas.getContext("webgl", ccOpts));
  if (!gl) {
    gl = (canvas.getContext("experimental-webgl", ccOpts));
  }
  if (!gl) {
    throw new GlError("Could not obtain a WebGL context.\nReason: " + errorInfo);
  }
  canvas.removeEventListener("webglcontextcreationerror", onContextCreationError, false);
  gl.depthFunc(gl.LEQUAL);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  this.canvas = canvas;
  this.width = canvas.width;
  this.height = canvas.height;
  this.demohack = opts.demohack ? 1 : 0;
  this.gl = gl;
  if (/[?&]frag_depth=0/.test(window.location.search) || opts.demohack) {
    this.glExtFragDepth = null;
  } else {
    this.glExtFragDepth = gl.getExtension("EXT_frag_depth");
    if (!this.glExtFragDepth) {
      console.log("EXT_frag_depth extension not supported, " + "will render with reduced quality.");
    }
  }
  this.ssFactor = 1;
  if (opts && opts.superSample) {
    this.ssFactor = opts.superSample | 0;
    if (this.ssFactor < 1) {
      this.ssFactor = 1;
    }
  }
  if (this.ssFactor !== 1) {
    var ssArea = this.width * this.height * this.ssFactor;
    var ssSize = 64;
    while (ssSize * ssSize < ssArea) {
      ssSize *= 2;
    }
    this.ssWidth = this.ssHeight = ssSize;
    this.ssTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.ssTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.hint(gl.GENERATE_MIPMAP_HINT, gl.NICEST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, this.ssWidth, this.ssHeight, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    this.ssDepthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.ssDepthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.ssWidth, this.ssHeight);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    this.ssFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.ssFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.ssTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.ssDepthBuffer);
    var ssStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (ssStatus !== gl.FRAMEBUFFER_COMPLETE) {
      throw new GlError("Failed to create supersampling framebuffer. " + "glCheckFramebufferStatus returned " + ssStatus);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.ssArrayBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.ssArrayBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 1, 1, 1, -1, 1, 0, 1, 1, -1, 1, 0, -1, -1, 0, 0]), gl.STATIC_DRAW);
    this.textureQuadProgram = new ShaderProgram(gl, c3d_resources.texq_vert, c3d_resources.texq_frag);
    this.textureQuadAttrib = gl.getAttribLocation(this.textureQuadProgram.handle, "aPos");
  } else {
    this.ssWidth = this.width;
    this.ssHeight = this.height;
  }
  this.lighting = new Lighting;
  this.lightingCode = c3d_resources.lighting1 + this.lighting.shaderCode() + c3d_resources.lighting2;
  this.camera = new Camera(this.width, this.height);
  this.spheres = new Spheres(this);
  this.cylinders = new Cylinders(this);
  this.triangles = new Triangles(this);
  this.pointAppearance = Appearance.clone(Viewer.defaultAppearances.point);
  this.lineAppearance = Appearance.clone(Viewer.defaultAppearances.line);
  this.surfaceAppearance = Appearance.clone(Viewer.defaultAppearances.surface);
  this.appearanceStack = [];
  this.backgroundColor = [1, 1, 1, 1];
  this.renderTimeout = null;
  if (!addEventListener) {
    addEventListener = (function(target, name, listener, useCapture) {
      target.addEventListener(name, listener, !!useCapture);
    });
  }
  this.setupListeners(addEventListener);
}
Viewer.defaultAppearances = Appearance.mkTriple(Appearance.createScaled([1, 0, 0], 1, 60, 1), Appearance.createScaled([0, 0, 1], 1, 60, 1), Appearance.createScaled([0, 1, 0], 1, 60, 1));
Viewer.prototype.ssFactor;
Viewer.prototype.ssWidth;
Viewer.prototype.ssHeight;
Viewer.prototype.ssTexture;
Viewer.prototype.ssDepthBuffer;
Viewer.prototype.ssFramebuffer;
Viewer.prototype.ssArrayBuffer;
Viewer.prototype.textureQuadProgram;
Viewer.prototype.textureQuadAttrib;
Viewer.prototype.lighting;
Viewer.prototype.lightingCode;
Viewer.prototype.spheres;
Viewer.prototype.cylinders;
Viewer.prototype.triangles;
Viewer.prototype.canvas;
Viewer.prototype.width;
Viewer.prototype.height;
Viewer.prototype.gl;
Viewer.prototype.glExtFragDepth;
Viewer.prototype.camera;
Viewer.prototype.pointAppearance;
Viewer.prototype.lineAppearance;
Viewer.prototype.surfaceAppearance;
Viewer.prototype.appearanceStack;
Viewer.prototype.backgroundColor;
Viewer.prototype.renderTimeout;
Viewer.prototype.setupListeners = function(addEventListener) {
  var canvas = this.canvas, mx = Number.NaN, my = Number.NaN, mdown = false;
  var camera = this.camera, render = this.scheduleRender.bind(this);
  addEventListener(canvas, "mousedown", function(evnt) {
    if (evnt.button === 0) {
      mdown = true;
    }
    if (evnt.buttons === undefined ? mdown : evnt.buttons & 1) {
      mx = evnt.screenX;
      my = evnt.screenY;
    }
  });
  addEventListener(canvas, "mousemove", function(evnt) {
    if (evnt.buttons === undefined ? mdown : evnt.buttons & 1) {
      if (!isNaN(mx)) {
        var dx = evnt.screenX - mx, dy = evnt.screenY - my;
        if (evnt.shiftKey) {
          camera.rotateXY(dx, dy);
        } else {
          if (evnt.altKey || evnt.ctrlKey || evnt.metaKey) {
            camera.translateXY(dx, dy);
          } else {
            camera.orbitXY(dx, dy);
          }
        }
        render();
      }
      mx = evnt.screenX;
      my = evnt.screenY;
    }
  });
  addEventListener(canvas, "mouseup", function(evnt) {
    if (evnt.button === 0) {
      mdown = false;
    }
  });
  addEventListener(canvas, "mouseleave", function(evnt) {
    mdown = false;
    mx = my = Number.NaN;
  });
  addEventListener(canvas, "wheel", function(evnt) {
    var d = evnt.deltaY;
    if (d) {
      if (evnt.shiftKey) {
        camera.rotateZ(d);
      } else {
        if (evnt.altKey || evnt.ctrlKey || evnt.metaKey) {
          camera.translateZ(d);
        } else {
          camera.zoom(d);
        }
      }
      render();
    }
    evnt.preventDefault();
  });
};
Viewer.prototype.clear = function() {
  this.spheres.clear();
  this.cylinders.clear();
  this.triangles.clear();
};
Viewer.prototype.scheduleRender = function() {
  if (this.renderTimeout === null) {
    this.renderTimeout = setTimeout(this.render.bind(this), 0);
  }
};
Viewer.prototype.render = function() {
  this.renderTimeout = null;
  if (this.lighting.modified) {
    this.lightingCode = c3d_resources.lighting1 + this.lighting.shaderCode() + c3d_resources.lighting2;
    this.spheres.recompileShader(this);
    this.cylinders.recompileShader(this);
    this.triangles.recompileShader(this);
  }
  if (this.ssFactor === 1) {
    this.renderAliased();
  } else {
    this.renderAntiAliased();
  }
  this.gl.flush();
};
Viewer.prototype.renderAntiAliased = function() {
  var gl = this.gl;
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.ssFramebuffer);
  this.renderAliased();
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, this.width, this.height);
  gl.disable(gl.DEPTH_TEST);
  gl.bindTexture(gl.TEXTURE_2D, this.ssTexture);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.ssArrayBuffer);
  gl.enableVertexAttribArray(this.textureQuadAttrib);
  gl.vertexAttribPointer(this.textureQuadAttrib, 4, gl.FLOAT, false, 4 * 4, 0);
  this.textureQuadProgram.use(gl);
  this.textureQuadProgram.uniform["uTexture"]([0]);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.disableVertexAttribArray(this.textureQuadAttrib);
  gl.bindTexture(gl.TEXTURE_2D, null);
};
Viewer.prototype.renderAliased = function() {
  var gl = this.gl;
  gl.viewport(0, 0, this.ssWidth, this.ssHeight);
  gl.clearColor.apply(gl, this.backgroundColor);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  if (this.spheres.opaque && this.cylinders.opaque && this.triangles.opaque) {
    gl.disable(gl.BLEND);
    gl.depthMask(true);
    gl.enable(gl.DEPTH_TEST);
    this.renderPrimitives(true);
  } else {
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.depthMask(false);
    this.renderPrimitives(false);
    this.renderPrimitives(false);
    gl.depthMask(true);
    gl.enable(gl.DEPTH_TEST);
    this.renderPrimitives(false);
  }
};
Viewer.prototype.renderPrimitives = function(opaque) {
  if (!opaque && !(this.demohack > .5)) {
    this.spheres.render(this, +1);
  }
  this.triangles.render(this);
  this.cylinders.render(this);
  this.spheres.render(this, -1);
};
Viewer.prototype.setUniforms = function(u) {
  u["uProjectionMatrix"](this.camera.projectionMatrix);
  u["uModelViewMatrix"](transpose4(this.camera.mvMatrix));
  u["uModelViewMatrixInverse"](transpose4(inv4(this.camera.mvMatrix)));
  u["uRefMatrix"](transpose4(this.camera.refMatrix));
  if (u["uRefMatrixInverse"]) {
    u["uRefMatrixInverse"](transpose4(inv4(this.camera.refMatrix)));
  }
  u["uDemoHack"]([this.demohack]);
  this.lighting.setUniforms(u);
};
function Lighting() {
  this.ambient = [0, 0, 0];
  this.lights = [new CameraPointLight([0, 0, 0, 1], [1, 1, 1], [1, 1, 1])];
  this.modified = false;
}
Lighting.prototype.ambient;
Lighting.prototype.lights;
Lighting.prototype.modified;
Lighting.prototype.setLight = function(i, l) {
  this.modified = !l !== !this.lights[i] || !!l && this.lights[i].type !== l.type;
  this.lights[i] = l;
};
Lighting.prototype.shaderCode = function() {
  var vars = "", code = "";
  for (var i = 0;i < this.lights.length;++i) {
    if (this.lights[i]) {
      vars += this.lights[i].shaderVars(i);
      code += this.lights[i].shaderCode(i);
    }
  }
  return vars + "void lightScene() {\n" + code + "}";
};
Lighting.prototype.setUniforms = function(u) {
  u["uAmbient"](this.ambient);
  for (var i = 0;i < this.lights.length;++i) {
    if (this.lights[i]) {
      this.lights[i].setUniforms(u, i);
    }
  }
};
function Light(type, args) {
  this.type = type;
  this.args = args;
}
Light.prototype.type;
Light.prototype.args;
Light.prototype.typeMap = {"uDiffuse":"vec3", "uSpecular":"vec3", "uLightPos":"vec4", "uSpotPos":"vec4", "uSpotCosCutoff":"float", "uSpotExponent":"float"};
Light.prototype.shaderCode = function(i) {
  return "  " + this.type + "(" + this.args.map(function(a) {
    return a + i;
  }).join(", ") + ");\n";
};
Light.prototype.shaderVars = function(i) {
  var $jscomp$this = this;
  return this.args.map(function(a) {
    return "uniform " + $jscomp$this.typeMap[a] + " " + a + i + ";\n";
  }).join("");
};
Light.prototype.setUniforms = function(u, i) {
  var $jscomp$this = this;
  this.args.forEach(function(a) {
    return u[a + i]($jscomp$this[a]);
  });
};
function CameraPointLight(pos, diffuse, specular) {
  this["uLightPos"] = pos;
  this["uDiffuse"] = diffuse;
  this["uSpecular"] = specular;
}
CameraPointLight.prototype = new Light("cameraPointLight", ["uLightPos", "uDiffuse", "uSpecular"]);
function WorldPointLight(pos, diffuse, specular) {
  this["uLightPos"] = pos;
  this["uDiffuse"] = diffuse;
  this["uSpecular"] = specular;
}
WorldPointLight.prototype = new Light("worldPointLight", ["uLightPos", "uDiffuse", "uSpecular"]);
var PointLights = {"camera":CameraPointLight, "world":WorldPointLight};
function CameraSpotLight(lightPos, spotPos, cutoff, exponent, diffuse, specular) {
  this["uLightPos"] = lightPos;
  this["uSpotPos"] = spotPos;
  this["uSpotCosCutoff"] = [cutoff];
  this["uSpotExponent"] = [exponent];
  this["uDiffuse"] = diffuse;
  this["uSpecular"] = specular;
}
CameraSpotLight.prototype = new Light("cameraSpotLight", ["uLightPos", "uSpotPos", "uSpotCosCutoff", "uSpotExponent", "uDiffuse", "uSpecular"]);
function WorldSpotLight(lightPos, spotPos, cutoff, exponent, diffuse, specular) {
  this["uLightPos"] = lightPos;
  this["uSpotPos"] = spotPos;
  this["uSpotCosCutoff"] = [cutoff];
  this["uSpotExponent"] = [exponent];
  this["uDiffuse"] = diffuse;
  this["uSpecular"] = specular;
}
WorldSpotLight.prototype = new Light("worldSpotLight", ["uLightPos", "uSpotPos", "uSpotCosCutoff", "uSpotExponent", "uDiffuse", "uSpecular"]);
var SpotLights = {"camera":CameraSpotLight, "world":WorldSpotLight};
var vec4Length = 4;
var float32ByteCount = 4;
var indexByteCount = 2;
function PrimitiveRenderer(attributes, elements) {
  var numAttributes = attributes.length, numElements = elements.length;
  var numVertices = Math.max.apply(null, elements) + 1, tmp;
  this.attributes = attributes;
  this.numAttributes = numAttributes;
  this.numVertices = numVertices;
  this.elements = elements;
  this.numElements = numElements;
  this.itemLength = vec4Length * numVertices * numAttributes;
  this.vertexByteCount = vec4Length * float32ByteCount * numAttributes;
  this.itemAttribByteCount = tmp = numVertices * this.vertexByteCount;
  this.itemTotalByteCount = tmp + numElements * indexByteCount;
}
PrimitiveRenderer.prototype.initialCapacity = 16;
PrimitiveRenderer.prototype.attributes;
PrimitiveRenderer.prototype.numAttributes;
PrimitiveRenderer.prototype.numVertices;
PrimitiveRenderer.prototype.elements;
PrimitiveRenderer.prototype.numElements;
PrimitiveRenderer.prototype.itemLength;
PrimitiveRenderer.prototype.vertexByteCount;
PrimitiveRenderer.prototype.itemAttribByteCount;
PrimitiveRenderer.prototype.itemTotalByteCount;
PrimitiveRenderer.prototype.useFragDepth = true;
PrimitiveRenderer.prototype.vertexShaderCode;
PrimitiveRenderer.prototype.fragmentShaderCode;
PrimitiveRenderer.prototype.init = function(mode, viewer) {
  var c = this.initialCapacity, d;
  this.mode = mode;
  this.count = 0;
  this.opaque = true;
  this.capacity = c;
  this.data = new ArrayBuffer(c * this.itemTotalByteCount);
  this.dataAttribs = new Float32Array(this.data, 0, c * this.itemLength);
  d = new Uint16Array(this.data, c * this.itemAttribByteCount);
  this.dataIndices = d;
  var i, j, k = 0, o, e = this.elements;
  for (i = 0;i < c;++i) {
    o = i * this.numVertices;
    for (j = 0;j < e.length;++j) {
      d[k++] = e[j] + o;
    }
  }
  this.bufferAttribs = viewer.gl.createBuffer();
  this.bufferIndices = viewer.gl.createBuffer();
  this.bufferCapacity = -1;
  this.shaderProgram = null;
  this.recompileShader(viewer);
};
PrimitiveRenderer.prototype.mode;
PrimitiveRenderer.prototype.count;
PrimitiveRenderer.prototype.capacity;
PrimitiveRenderer.prototype.data;
PrimitiveRenderer.prototype.dataAttribs;
PrimitiveRenderer.prototype.dataIndices;
PrimitiveRenderer.prototype.bufferAttribs;
PrimitiveRenderer.prototype.bufferIndices;
PrimitiveRenderer.prototype.bufferCapacity;
PrimitiveRenderer.prototype.shaderProgram;
PrimitiveRenderer.prototype.attribLocations;
PrimitiveRenderer.prototype.recompileShader = function(viewer) {
  var gl = viewer.gl;
  if (this.shaderProgram !== null) {
    this.shaderProgram.dispose(gl);
  }
  var vs = ["precision mediump float;", "varying float vShininess;", this.vertexShaderCode].join("\n");
  var fs = ["precision mediump float;", viewer.lightingCode, this.fragmentShaderCode].join("\n");
  if (this.useFragDepth && viewer.glExtFragDepth && viewer.demohack < .5) {
    fs = "#extension GL_EXT_frag_depth : enable\n" + fs;
  }
  this.shaderProgram = new ShaderProgram(gl, vs, fs);
  var sp = this.shaderProgram.handle;
  this.attribLocations = this.attributes.map(function(a) {
    return gl.getAttribLocation(sp, a);
  });
};
PrimitiveRenderer.prototype.addPrimitive = function(attributes) {
  if (attributes.length !== this.itemLength) {
    throw new GlError("Wrong number of attributes given");
  }
  if (this.count == this.capacity) {
    var c = this.capacity * 2, nd, nda, ndi, i, j, k, o, e = this.elements;
    nd = new ArrayBuffer(c * this.itemTotalByteCount);
    nda = new Float32Array(nd, 0, c * this.itemLength);
    ndi = new Uint16Array(nd, c * this.itemAttribByteCount);
    nda.set(this.dataAttribs);
    ndi.set(this.dataIndices);
    k = this.dataIndices.length;
    for (i = this.capacity;i < c;++i) {
      o = i * this.numVertices;
      for (j = 0;j < e.length;++j) {
        ndi[k++] = e[j] + o;
      }
    }
    this.capacity = c;
    this.data = nd;
    this.dataAttribs = nda;
    this.dataIndices = ndi;
  }
  this.dataAttribs.set(attributes, this.count++ * this.itemLength);
};
PrimitiveRenderer.prototype.renderPrimitives = function(gl, setUniforms) {
  if (this.count === 0) {
    return;
  }
  var shaderProgram = this.shaderProgram, u = shaderProgram.uniform;
  shaderProgram.use(gl);
  setUniforms(u);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferAttribs);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferIndices);
  if (this.bufferCapacity !== this.capacity) {
    gl.bufferData(gl.ARRAY_BUFFER, this.dataAttribs, gl.STATIC_DRAW);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.dataIndices, gl.STATIC_DRAW);
    this.bufferCapacity = this.capacity;
  } else {
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.data, 0, this.count * this.itemLength));
  }
  var i;
  for (i = 0;i < this.numAttributes;++i) {
    var loc = this.attribLocations[i];
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, vec4Length, gl.FLOAT, false, this.vertexByteCount, vec4Length * float32ByteCount * i);
  }
  gl.drawElements(this.mode, this.numElements * this.count, gl.UNSIGNED_SHORT, 0);
  for (i = 0;i < this.numAttributes;++i) {
    gl.disableVertexAttribArray(this.attribLocations[i]);
  }
};
PrimitiveRenderer.prototype.clear = function() {
  this.count = 0;
  this.opaque = true;
};
function Spheres(viewer) {
  this.init(viewer.gl.TRIANGLES, viewer);
}
Spheres.prototype = new PrimitiveRenderer(["aCenter", "aColor", "aRelativeShininessRadius"], [0, 1, 2, 2, 1, 3]);
Spheres.prototype.vertexShaderCode = c3d_resources.sphere_vert;
Spheres.prototype.fragmentShaderCode = c3d_resources.common_frag + "\n" + c3d_resources.sphere_frag;
Spheres.prototype.add = function(pos, radius, appearance) {
  var x = pos[0], y = pos[1], z = pos[2], w = pos[3];
  var color = appearance.color, s = appearance.shininess;
  var r = color[0], g = color[1], b = color[2], a = appearance.alpha;
  if (a < 1) {
    this.opaque = false;
  }
  this.addPrimitive([x, y, z, w, r, g, b, a, 1, 1, s, radius, x, y, z, w, r, g, b, a, -1, 1, s, radius, x, y, z, w, r, g, b, a, 1, -1, s, radius, x, y, z, w, r, g, b, a, -1, -1, s, radius]);
};
Spheres.prototype.render = function(viewer, mode) {
  this.renderPrimitives(viewer.gl, function(u) {
    viewer.setUniforms(u);
    u["sphereMode"]([mode]);
  });
};
function Cylinders(viewer) {
  this.init(viewer.gl.TRIANGLE_STRIP, viewer);
}
Cylinders.prototype = new PrimitiveRenderer(["aPoint1", "aPoint2", "aColor", "aRelativeRadius", "aShininess"], [0, 0, 2, 4, 6, 7, 2, 3, 1, 7, 5, 4, 1, 0, 2, 2]);
Cylinders.prototype.vertexShaderCode = c3d_resources.cylinder_vert;
Cylinders.prototype.fragmentShaderCode = c3d_resources.common_frag + "\n" + c3d_resources.cylinder_frag;
Cylinders.prototype.add = function(pos1, pos2, appearance) {
  var x1 = pos1[0], y1 = pos1[1], z1 = pos1[2], w1 = pos1[3];
  var x2 = pos2[0], y2 = pos2[1], z2 = pos2[2], w2 = pos2[3];
  var color = appearance.color, s = appearance.shininess;
  var radius = appearance.size;
  var r = color[0], g = color[1], b = color[2], a = appearance.alpha;
  if (a < 1) {
    this.opaque = false;
  }
  this.addPrimitive([x1, y1, z1, w1, x2, y2, z2, w2, r, g, b, a, 1, 1, 1, radius, s, 0, 0, 0, x1, y1, z1, w1, x2, y2, z2, w2, r, g, b, a, 1, 1, -1, radius, s, 0, 0, 0, x1, y1, z1, w1, x2, y2, z2, w2, r, g, b, a, 1, -1, 1, radius, s, 0, 0, 0, x1, y1, z1, w1, x2, y2, z2, w2, r, g, b, a, 1, -1, -1, radius, s, 0, 0, 0, x1, y1, z1, w1, x2, y2, z2, w2, r, g, b, a, -1, 1, 1, radius, s, 0, 0, 0, x1, y1, z1, w1, x2, y2, z2, w2, r, g, b, a, -1, 1, -1, radius, s, 0, 0, 0, x1, y1, z1, w1, x2, y2, z2, w2, r, 
  g, b, a, -1, -1, 1, radius, s, 0, 0, 0, x1, y1, z1, w1, x2, y2, z2, w2, r, g, b, a, -1, -1, -1, radius, s, 0, 0, 0]);
};
Cylinders.prototype.render = function(viewer) {
  if (this.count === 0) {
    return;
  }
  var gl = viewer.gl;
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  this.renderPrimitives(gl, viewer.setUniforms.bind(viewer));
  gl.disable(gl.CULL_FACE);
};
function Triangles(viewer) {
  this.init(viewer.gl.TRIANGLES, viewer);
}
Triangles.prototype = new PrimitiveRenderer(["aPos", "aNormalAndShininess", "aColor"], [0, 1, 2]);
Triangles.prototype.vertexShaderCode = c3d_resources.triangle_vert;
Triangles.prototype.fragmentShaderCode = c3d_resources.common_frag + "\n" + c3d_resources.triangle_frag;
Triangles.prototype.addWithNormals = function(p1, p2, p3, n1, n2, n3, appearance) {
  var color = appearance.color, s = appearance.shininess;
  var r = color[0], g = color[1], b = color[2], a = appearance.alpha;
  if (a < 1) {
    this.opaque = false;
  }
  this.addPrimitive([p1[0], p1[1], p1[2], p1[3], n1[0], n1[1], n1[2], s, r, g, b, a, p2[0], p2[1], p2[2], p2[3], n2[0], n2[1], n2[2], s, r, g, b, a, p3[0], p3[1], p3[2], p3[3], n3[0], n3[1], n3[2], s, r, g, b, a]);
};
Triangles.prototype.addWithNormalsAndColors = function(p1, p2, p3, n1, n2, n3, c1, c2, c3, appearance) {
  var s = appearance.shininess, a = appearance.alpha;
  if (a < 1) {
    this.opaque = false;
  }
  this.addPrimitive([p1[0], p1[1], p1[2], p1[3], n1[0], n1[1], n1[2], s, c1[0], c1[1], c1[2], a, p2[0], p2[1], p2[2], p2[3], n2[0], n2[1], n2[2], s, c2[0], c2[1], c2[2], a, p3[0], p3[1], p3[2], p3[3], n3[0], n3[1], n3[2], s, c3[0], c3[1], c3[2], a]);
};
Triangles.prototype.addAutoNormal = function(pos1, pos2, pos3, appearance) {
  var p1 = dehom3(pos1), v = sub3(dehom3(pos2), p1), w = sub3(dehom3(pos3), p1);
  var n = normalized3(cross3(v, w));
  this.addWithNormals(pos1, pos2, pos3, n, n, n, appearance);
};
Triangles.prototype.addPolygonAutoNormal = function(pos, appearance) {
  if (pos.length == 3) {
    return this.addAutoNormal(pos[0], pos[1], pos[2], appearance);
  }
  var k = pos.length, p = Array(k + 2), i, n = [0, 0, 0];
  for (i = 0;i < k;++i) {
    p[i] = dehom3(pos[i]);
  }
  p[k] = p[0];
  p[k + 1] = p[1];
  for (i = 1;i <= k;++i) {
    n = add3(n, cross3(sub3(p[i], p[i - 1]), sub3(p[i], p[i + 1])));
  }
  if (k == 4) {
    this.addWithNormals(pos[0], pos[1], pos[3], n, n, n, appearance);
    this.addWithNormals(pos[3], pos[1], pos[2], n, n, n, appearance);
    return;
  }
  var center = [0, 0, 0, 0], prev = pos[k - 1];
  for (i = 0;i < k;++i) {
    center = add4(center, pos[i]);
  }
  for (i = 0;i < k;++i) {
    this.addWithNormals(prev, pos[i], center, n, n, n, appearance);
    prev = pos[i];
  }
};
Triangles.prototype.addPolygonWithNormals = function(pos, n, appearance) {
  if (pos.length == 3) {
    return this.addWithNormals(pos[0], pos[1], pos[2], n[0], n[1], n[2], appearance);
  }
  if (pos.length == 4) {
    this.addWithNormals(pos[0], pos[1], pos[3], n[0], n[1], n[3], appearance);
    this.addWithNormals(pos[3], pos[1], pos[2], n[3], n[1], n[2], appearance);
    return;
  }
  var k = pos.length, i, center = [0, 0, 0, 0], cn = [0, 0, 0];
  for (i = 0;i < k;++i) {
    center = add4(center, pos[i]);
    cn = add3(cn, n[i]);
  }
  var pp = pos[k - 1], pn = n[k - 1];
  for (i = 0;i < k;++i) {
    this.addWithNormals(pp, pos[i], center, pn, n[i], cn, appearance);
    pp = pos[i];
    pn = n[i];
  }
};
Triangles.prototype.addPolygonWithNormalsAndColors = function(pos, n, c, appearance) {
  if (pos.length == 3) {
    return this.addWithNormalsAndColors(pos[0], pos[1], pos[2], n[0], n[1], n[2], c[0], c[1], c[2], appearance);
  }
  if (pos.length == 4) {
    this.addWithNormalsAndColors(pos[0], pos[1], pos[3], n[0], n[1], n[3], c[0], c[1], c[3], appearance);
    this.addWithNormalsAndColors(pos[3], pos[1], pos[2], n[3], n[1], n[2], c[3], c[1], c[2], appearance);
    return;
  }
  console.error("addPolygonWithNormalsAndColors not supported for more than 4 corners");
};
Triangles.prototype.render = function(viewer) {
  this.renderPrimitives(viewer.gl, viewer.setUniforms.bind(viewer));
};
var coerce = {};
coerce.toList = function(arg, def) {
  def = def === undefined ? null : def;
  if (arg["ctype"] !== "list") {
    console.log("argument is not a list");
    return def;
  }
  return (arg["value"]);
};
coerce.toHomog = function(arg, def) {
  def = def === undefined ? [0, 0, 0, 0] : def;
  var lst1 = coerce.toList(arg);
  if (lst1 === null) {
    return def;
  }
  var lst = lst1.map(coerce.toReal);
  if (lst.length > 4) {
    console.log("Coordinate vector too long.");
    lst = lst.slice(0, 4);
  }
  while (lst.length < 3) {
    lst.push(0);
  }
  if (lst.length === 3) {
    lst.push(1);
  }
  return lst;
};
coerce.toDirection = function(arg, def) {
  def = def === undefined ? [0, 0, 0] : def;
  var lst1 = coerce.toList(arg);
  if (lst1 === null) {
    return def;
  }
  var lst = lst1.map(coerce.toReal);
  if (lst.length > 3) {
    console.log("Coordinate vector too long.");
    lst = lst.slice(0, 3);
  }
  while (lst.length < 3) {
    lst.push(0);
  }
  return lst;
};
coerce.toDirectionPoint = function(arg, def) {
  def = def === undefined ? [0, 0, 0, 0] : def;
  var lst = coerce.toDirection(arg, def);
  if (lst !== def) {
    lst[3] = 0;
  }
  return lst;
};
coerce.toColor = function(arg, def) {
  def = def === undefined ? [.5, .5, .5] : def;
  if (arg.ctype === "number") {
    var c = coerce.toInterval(0, 1, arg);
    if (!isNaN(c)) {
      return [c, c, c];
    }
  }
  var lst = coerce.toList(arg);
  if (lst === null) {
    return def;
  }
  if (lst.length != 3) {
    console.log("Not an RGB color vector");
    return def;
  }
  return lst.map(function(c) {
    return coerce.toInterval(0, 1, c);
  });
};
coerce.toReal = function(arg, def) {
  def = def === undefined ? Number.NaN : def;
  if (arg["ctype"] !== "number") {
    console.log("argument is not a number");
    return def;
  }
  var val = arg["value"], r = val["real"], i = val["imag"];
  if (i !== 0) {
    console.log("complex number is not real");
  }
  return r;
};
coerce.toInt = function(arg, def) {
  def = def === undefined ? Number.NaN : def;
  if (arg["ctype"] !== "number") {
    console.log("argument is not a number");
    return def;
  }
  var val = arg["value"], r = val["real"], i = val["imag"];
  if (i !== 0) {
    console.log("complex number is not real");
  }
  i = Math.round(r);
  if (i !== r) {
    console.log("number is not an integer");
  }
  return i;
};
coerce.clamp = function(min, max, arg) {
  return arg < min ? min : arg > max ? max : arg;
};
coerce.toInterval = function(min, max, arg, def) {
  def = def === undefined ? Number.NaN : def;
  return coerce.clamp(min, max, coerce.toReal(arg, def));
};
coerce.toString = function(arg, def) {
  def = def === undefined ? null : def;
  if (arg["ctype"] === "string") {
    return arg["value"];
  }
  console.log("argument is not a string");
  return def;
};
coerce.toEnum = function(names, arg, def) {
  def = def === undefined ? null : def;
  var str = coerce.toString(arg, def);
  if (str !== def && names.indexOf(str) !== -1) {
    return str;
  }
  console.log("argument is not one of " + names.join(", "));
  return def;
};
coerce.toBool = function(arg, def) {
  if (arg["ctype"] === "boolean") {
    return arg["value"];
  }
  console.log("argument is not boolean");
  return def;
};
CindyJS.registerPlugin(1, "Cindy3D-demohack", function(api) {
  var nada = api.nada;
  var evaluate = api.evaluate;
  var defOp = api.defineFunction;
  function handleModifs(modifs, handlers) {
    var key, handler;
    for (key in modifs) {
      handler = handlers[key];
      if (handler) {
        handler(evaluate(modifs[key]));
      } else {
        console.log("Modifier " + key + " not supported");
      }
    }
  }
  function handleModifsAppearance(appearance, modifs, handlers) {
    handlers = handlers === undefined ? null : handlers;
    var color = appearance.color;
    var alpha = appearance.alpha;
    var shininess = appearance.shininess;
    var size = appearance.size;
    var combined = {"color":function(a) {
      return color = coerce.toColor(a);
    }, "alpha":function(a) {
      return alpha = coerce.toInterval(0, 1, a);
    }, "shininess":function(a) {
      return shininess = coerce.toInterval(0, 128, a);
    }, "size":function(a) {
      return size = coerce.toReal(a) * Appearance.POINT_SCALE;
    }};
    var key;
    if (handlers) {
      for (key in handlers) {
        combined[key] = handlers[key];
      }
    }
    handleModifs(modifs, combined);
    return Appearance.createReal(color, alpha, shininess, size);
  }
  var instances = {};
  var currentInstance;
  defOp("begin3d", 0, function(args, modifs) {
    var name = "Cindy3D";
    var ccOpts = {}, opts = {};
    handleModifs(modifs, {"name":function(a) {
      return name = (coerce.toString(a, name));
    }, "antialias":function(a) {
      return ccOpts["antialias"] = coerce.toBool(a, false);
    }, "supersample":function(a) {
      return opts.superSample = coerce.toReal(a, 1);
    }, "demohack":function(a) {
      return opts.demohack = coerce.toBool(a, true);
    }});
    currentInstance = instances[name];
    if (!currentInstance) {
      instances[name] = currentInstance = new Viewer(name, ccOpts, opts, api.addAutoCleaningEventListener);
    }
    currentInstance.clear();
    return nada;
  });
  defOp("end3d", 0, function(args, modifs) {
    currentInstance.render();
    currentInstance = null;
    return nada;
  });
  defOp("gsave3d", 0, function(args, modifs) {
    currentInstance.appearanceStack.push(Appearance.mkTriple(currentInstance.pointAppearance, currentInstance.lineAppearance, currentInstance.surfaceAppearance));
    return nada;
  });
  defOp("grestore3d", 0, function(args, modifs) {
    var s = currentInstance.appearanceStack;
    if (s.length > 0) {
      var t = s.pop();
      currentInstance.pointAppearance = t.point;
      currentInstance.lineAppearance = t.line;
      currentInstance.surfaceAppearance = t.surface;
    } else {
      var t$0 = Viewer.defaultAppearances;
      currentInstance.pointAppearance = Appearance.clone(t$0.point);
      currentInstance.lineAppearance = Appearance.clone(t$0.line);
      currentInstance.surfaceAppearance = Appearance.clone(t$0.surface);
    }
    return nada;
  });
  defOp("color3d", 1, function(args, modifs) {
    var color = coerce.toColor(evaluate(args[0]), null);
    if (color) {
      currentInstance.pointAppearance.color = color;
      currentInstance.lineAppearance.color = color;
      currentInstance.surfaceAppearance.color = color;
    }
    return nada;
  });
  defOp("pointcolor3d", 1, function(args, modifs) {
    var color = coerce.toColor(evaluate(args[0]), null);
    if (color) {
      currentInstance.pointAppearance.color = color;
    }
    return nada;
  });
  defOp("linecolor3d", 1, function(args, modifs) {
    var color = coerce.toColor(evaluate(args[0]), null);
    if (color) {
      currentInstance.lineAppearance.color = color;
    }
    return nada;
  });
  defOp("surfacecolor3d", 1, function(args, modifs) {
    var color = coerce.toColor(evaluate(args[0]), null);
    if (color) {
      currentInstance.surfaceAppearance.color = color;
    }
    return nada;
  });
  function surfacealpha3d(args, modifs) {
    currentInstance.surfaceAppearance.alpha = coerce.toInterval(0, 1, evaluate(args[0]), 1);
    return nada;
  }
  defOp("alpha3d", 1, surfacealpha3d);
  defOp("surfacealpha3d", 1, surfacealpha3d);
  defOp("shininess3d", 1, function(args, modifs) {
    var shininess = coerce.toInterval(0, 128, evaluate(args[0]));
    if (!isNaN(shininess)) {
      currentInstance.pointAppearance.shininess = shininess;
      currentInstance.lineAppearance.shininess = shininess;
      currentInstance.surfaceAppearance.shininess = shininess;
    }
    return nada;
  });
  defOp("pointshininess3d", 1, function(args, modifs) {
    var shininess = coerce.toInterval(0, 128, evaluate(args[0]));
    if (!isNaN(shininess)) {
      currentInstance.pointAppearance.shininess = shininess;
    }
    return nada;
  });
  defOp("lineshininess3d", 1, function(args, modifs) {
    var shininess = coerce.toInterval(0, 128, evaluate(args[0]));
    if (!isNaN(shininess)) {
      currentInstance.lineAppearance.shininess = shininess;
    }
    return nada;
  });
  defOp("surfaceshininess3d", 1, function(args, modifs) {
    var shininess = coerce.toInterval(0, 128, evaluate(args[0]));
    if (!isNaN(shininess)) {
      currentInstance.surfaceAppearance.shininess = shininess;
    }
    return nada;
  });
  defOp("size3d", 1, function(args, modifs) {
    var size = coerce.toReal(evaluate(args[0]), -1) * Appearance.POINT_SCALE;
    if (size >= 0) {
      currentInstance.pointAppearance.size = size;
      currentInstance.lineAppearance.size = size;
    }
    return nada;
  });
  defOp("pointsize3d", 1, function(args, modifs) {
    var size = coerce.toReal(evaluate(args[0]), -1) * Appearance.POINT_SCALE;
    if (size >= 0) {
      currentInstance.pointAppearance.size = size;
    }
    return nada;
  });
  defOp("linesize3d", 1, function(args, modifs) {
    var size = coerce.toReal(evaluate(args[0]), -1) * Appearance.POINT_SCALE;
    if (size >= 0) {
      currentInstance.lineAppearance.size = size;
    }
    return nada;
  });
  defOp("draw3d", 1, function(args, modifs) {
    var pos = coerce.toHomog(evaluate(args[0]));
    var appearance = handleModifsAppearance(currentInstance.pointAppearance, modifs);
    currentInstance.spheres.add(pos, appearance.size, appearance);
    return nada;
  });
  defOp("draw3d", 2, function(args, modifs) {
    var pos1 = coerce.toHomog(evaluate(args[0]));
    var pos2 = coerce.toHomog(evaluate(args[1]));
    var appearance = handleModifsAppearance(currentInstance.lineAppearance, modifs);
    currentInstance.cylinders.add(pos1, pos2, appearance);
    return nada;
  });
  defOp("connect3d", 1, function(args, modifs) {
    var lst = coerce.toList(evaluate(args[0]));
    var appearance = handleModifsAppearance(currentInstance.lineAppearance, modifs);
    if (lst.length < 2) {
      return nada;
    }
    var pos1 = coerce.toHomog(lst[0]);
    for (var i = 1;i < lst.length;++i) {
      var pos2 = coerce.toHomog(lst[i]);
      currentInstance.cylinders.add(pos1, pos2, appearance);
      pos1 = pos2;
    }
    return nada;
  });
  defOp("drawpoly3d", 1, function(args, modifs) {
    var lst = coerce.toList(evaluate(args[0]));
    var appearance = handleModifsAppearance(currentInstance.lineAppearance, modifs);
    if (lst.length < 2) {
      return nada;
    }
    var pos1 = coerce.toHomog(lst[lst.length - 1]);
    for (var i = 0;i < lst.length;++i) {
      var pos2 = coerce.toHomog(lst[i]);
      currentInstance.cylinders.add(pos1, pos2, appearance);
      pos1 = pos2;
    }
    return nada;
  });
  defOp("fillpoly3d", 1, function(args, modifs) {
    var lst = coerce.toList(evaluate(args[0]));
    var appearance = handleModifsAppearance(currentInstance.surfaceAppearance, modifs);
    if (lst.length < 2) {
      return nada;
    }
    var pos = lst.map(function(elt) {
      return coerce.toHomog(elt);
    });
    currentInstance.triangles.addPolygonAutoNormal(pos, appearance);
    return nada;
  });
  defOp("fillpoly3d", 2, function(args, modifs) {
    var lst1 = coerce.toList(evaluate(args[0]));
    var lst2 = coerce.toList(evaluate(args[1]));
    var appearance = handleModifsAppearance(currentInstance.surfaceAppearance, modifs);
    if (lst1.length < 2 || lst1.length != lst2.length) {
      return nada;
    }
    var pos = lst1.map(function(elt) {
      return coerce.toHomog(elt);
    });
    var n = lst2.map(function(elt) {
      return coerce.toDirection(elt);
    });
    currentInstance.triangles.addPolygonWithNormals(pos, n, appearance);
    return nada;
  });
  defOp("fillcircle3d", 3, function(args, modifs) {
    return nada;
  });
  defOp("drawsphere3d", 2, function(args, modifs) {
    var pos = coerce.toHomog(evaluate(args[0]));
    var radius = coerce.toReal(evaluate(args[1]));
    var appearance = handleModifsAppearance(currentInstance.surfaceAppearance, modifs);
    currentInstance.spheres.add(pos, radius, appearance);
    return nada;
  });
  function iterMesh(m, n, tcr, tcc, callback) {
    var k = 0;
    for (var i = 1;i < m;++i) {
      for (var j = 1;j < n;++j) {
        callback(k, k + 1, k + n + 1, k + n);
        ++k;
      }
      if (tcr) {
        callback(k, k + 1 - n, k + 1, k + n);
      }
      ++k;
    }
    if (tcc) {
      for (var j$1 = 1;j$1 < n;++j$1) {
        callback(k, k + 1, j$1, j$1 - 1);
        ++k;
      }
      if (tcr) {
        callback(k, k + 1 - n, 0, n - 1);
      }
    }
  }
  function meshWithNormals(m, n, tcr, tcc, pos, normals, colors, colortype, appearance) {
    var cf;
    if (colors === null) {
      cf = function(perface, pervertex) {
        return appearance.color;
      };
    } else {
      if (colortype === "perface") {
        cf = function(perface, pervertex) {
          return colors[perface];
        };
      } else {
        cf = function(perface, pervertex) {
          return colors[pervertex];
        };
      }
    }
    iterMesh(m, n, tcr, tcc, function(i1, i2, i3, i4) {
      return currentInstance.triangles.addPolygonWithNormalsAndColors([pos[i1], pos[i2], pos[i3], pos[i4]], [normals[i1], normals[i2], normals[i3], normals[i4]], [cf(i1, i1), cf(i1, i2), cf(i1, i3), cf(i1, i4)], appearance);
    });
  }
  function mesh3dImpl(args, modifs) {
    var m = coerce.toInt(evaluate(args[0]));
    var n = coerce.toInt(evaluate(args[1]));
    var pos = coerce.toList(evaluate(args[2])).map(function(elt) {
      return coerce.toHomog(elt);
    });
    var normaltype = "perface";
    var colortype = "pervertex";
    var topology = "open";
    var colors = null;
    var appearance = handleModifsAppearance(currentInstance.surfaceAppearance, modifs, {"normaltype":function(a) {
      return normaltype = coerce.toString(a, normaltype).toLowerCase();
    }, "colortype":function(a) {
      return colortype = coerce.toString(a, colortype).toLowerCase();
    }, "topology":function(a) {
      return topology = coerce.toString(a, normaltype).toLowerCase();
    }, "colors":function(a) {
      return colors = coerce.toList(a).map(function(elt) {
        return coerce.toColor(elt);
      });
    }});
    if (pos.length !== m * n) {
      return nada;
    }
    if (colors !== null && colors.length !== m * n) {
      return nada;
    }
    var tcr = topology === "closerows" || topology === "closeboth";
    var tcc = topology === "closecolumns" || topology === "closeboth";
    var pc = null, normal = null, normalcnt = 0;
    function donormal(p1, p2) {
      var c = cross3(sub3(p1, pc), sub3(p2, pc));
      normal[0] += c[0];
      normal[1] += c[1];
      normal[2] += c[2];
      ++normalcnt;
    }
    if (args.length === 4) {
      var normals = coerce.toList(evaluate(args[3])).map(function(elt) {
        return coerce.toDirection(elt);
      });
      if (normals.length !== m * n) {
        return nada;
      }
      meshWithNormals(m, n, tcr, tcc, pos, normals, colors, colortype, appearance);
    } else {
      if (normaltype === "pervertex") {
        var normals$2 = Array(m * n);
        var mn = m * n, p = pos.map(dehom3);
        for (var i = 0, k = 0;i < m;++i) {
          for (var j = 0;j < n;++j) {
            var kmn = k + mn;
            pc = p[k];
            var pw = p[(kmn - 1) % mn], pe = p[(kmn + 1) % mn];
            var ps = p[(kmn - n) % mn], pn = p[(kmn + n) % mn];
            normal = [0, 0, 0];
            normalcnt = 0;
            if ((tcc || i > 0) && (tcr || j > 0)) {
              donormal(pw, ps);
            }
            if ((tcc || i + 1 < m) && (tcr || j > 0)) {
              donormal(pn, pw);
            }
            if ((tcc || i + 1 < m) && (tcr || j + 1 < n)) {
              donormal(pe, pn);
            }
            if ((tcc || i > 0) && (tcr || j + 1 < n)) {
              donormal(ps, pe);
            }
            normals$2[k++] = scale3(4 / normalcnt, normal);
          }
        }
        meshWithNormals(m, n, tcr, tcc, pos, normals$2, colors, colortype, appearance);
      } else {
        iterMesh(m, n, tcr, tcc, function(i1, i2, i3, i4) {
          return currentInstance.triangles.addPolygonAutoNormal([pos[i1], pos[i2], pos[i3], pos[i4]], appearance);
        });
      }
    }
    return nada;
  }
  defOp("mesh3d", 3, function(args, modifs) {
    return mesh3dImpl(args, modifs);
  });
  defOp("mesh3d", 4, function(args, modifs) {
    return mesh3dImpl(args, modifs);
  });
  defOp("background3d", 1, function(args, modifs) {
    var color = coerce.toColor(evaluate(args[0]), null);
    if (color) {
      color.push(1);
      currentInstance.backgroundColor = color;
    }
    return nada;
  });
  defOp("lookat3d", 3, function(args, modifs) {
    var position = coerce.toHomog(evaluate(args[0]), null);
    var lookAt = coerce.toHomog(evaluate(args[1]), null);
    var up = coerce.toDirection(evaluate(args[2]), null);
    if (position && lookAt && up) {
      currentInstance.camera.setCamera(dehom3(position), dehom3(lookAt), up);
    }
    return nada;
  });
  defOp("fieldofview3d", 1, function(args, modifs) {
    var fov = coerce.toInterval(.01, 3.13, evaluate(args[0]), 0);
    if (fov > 0) {
      currentInstance.camera.fieldOfView = fov;
      currentInstance.camera.updatePerspective();
    }
    return nada;
  });
  defOp("depthrange3d", 2, function(args, modifs) {
    var near = coerce.toReal(evaluate(args[0]), -1);
    var far = coerce.toReal(evaluate(args[1]), -1);
    if (near >= 0 && far > near) {
      currentInstance.camera.zNear = near;
      currentInstance.camera.zFar = far;
      currentInstance.camera.updatePerspective();
    }
    return nada;
  });
  defOp("renderhints3d", 0, function(args, modifs) {
    return nada;
  });
  defOp("pointlight3d", 1, function(args, modifs) {
    var index = coerce.toInt(evaluate(args[0]), 0);
    var position = [0, 0, 0, 1], diffuse = [1, 1, 1], specular = [1, 1, 1];
    var frame = "camera";
    handleModifs(modifs, {"position":function(a) {
      return position = coerce.toHomog(a, position);
    }, "diffuse":function(a) {
      return diffuse = coerce.toColor(a, diffuse);
    }, "specular":function(a) {
      return specular = coerce.toColor(a, specular);
    }, "frame":function(a) {
      return frame = coerce.toEnum(["camera", "world"], a, frame);
    }});
    currentInstance.lighting.setLight(index, new PointLights[frame](position, diffuse, specular));
    return nada;
  });
  defOp("directionallight3d", 1, function(args, modifs) {
    var index = coerce.toInt(evaluate(args[0]), 0);
    var direction = [0, -1, 0, 0], diffuse = [1, 1, 1], specular = [1, 1, 1];
    var frame = "camera";
    handleModifs(modifs, {"direction":function(a) {
      return direction = coerce.toDirectionPoint(a, direction);
    }, "diffuse":function(a) {
      return diffuse = coerce.toColor(a, diffuse);
    }, "specular":function(a) {
      return specular = coerce.toColor(a, specular);
    }, "frame":function(a) {
      return frame = coerce.toEnum(["camera", "world"], a, frame);
    }});
    currentInstance.lighting.setLight(index, new PointLights[frame](direction, diffuse, specular));
    return nada;
  });
  defOp("spotlight3d", 1, function(args, modifs) {
    var index = coerce.toInt(evaluate(args[0]), 0);
    var position = [0, 0, 0, 1], direction = [0, -1, 0, 0];
    var cutoff = Math.PI / 4, exponent = 0;
    var diffuse = [1, 1, 1], specular = [1, 1, 1];
    var frame = "camera";
    handleModifs(modifs, {"position":function(a) {
      return position = coerce.toHomog(a, position);
    }, "direction":function(a) {
      return direction = coerce.toDirectionPoint(a, direction);
    }, "cutoffangle":function(a) {
      return cutoff = coerce.toInterval(0, Math.PI, a, cutoff);
    }, "exponent":function(a) {
      return exponent = coerce.toReal(a, exponent);
    }, "diffuse":function(a) {
      return diffuse = coerce.toColor(a, diffuse);
    }, "specular":function(a) {
      return specular = coerce.toColor(a, specular);
    }, "frame":function(a) {
      return frame = coerce.toEnum(["camera", "world"], a, frame);
    }});
    currentInstance.lighting.setLight(index, new SpotLights[frame](position, direction, Math.cos(cutoff), exponent, diffuse, specular));
    return nada;
  });
  defOp("disablelight3d", 1, function(args, modifs) {
    var index = coerce.toInt(evaluate(args[0]), 0);
    currentInstance.lighting.setLight(index, null);
    return nada;
  });
  defOp("ambientlight3d", 1, function(args, modifs) {
    var color = coerce.toColor(evaluate(args[0]));
    if (color) {
      currentInstance.lighting.ambient = color;
    }
    return nada;
  });
  defOp("hackflat3d", 1, function(args, modifs) {
    var o = currentInstance.demohack;
    var n = currentInstance.demohack = coerce.toReal(evaluate(args[0]), 1);
    if (o === 0 !== (n === 0)) {
      currentInstance.lighting.modified = true;
      currentInstance.glExtFragDepth = !(n === 0);
    }
    return nada;
  });
  defOp("hackcam3d", 0, function(args, modifs) {
    currentInstance.camera.demohack();
    return nada;
  });
});

})();//# sourceMappingURL=Cindy3D.js.map

