(function(){
  const runway = document.getElementById('whirlpoolRunway');
  const stage = document.getElementById('stage');
  const canvas = document.getElementById('whirlpoolCanvas');
  const heroCopy = document.getElementById('heroCopy');
  if (!runway || !stage || !canvas) return;

  const image = new Image();
  image.src = 'assets/whirlpool-ocean.jpg';
  const pendingHash = window.location.hash && window.location.hash !== '#top' ? window.location.hash : '';
  const revealCopy = () => { if (heroCopy) heroCopy.classList.add('show'); };
  let unlocked = false;
  let draw = function(){};
  let scrollFrame = 0;

  document.body.classList.add('whirlpool-locked');
  if (pendingHash && window.history && window.history.replaceState){
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    requestAnimationFrame(() => document.documentElement.style.removeProperty('scroll-behavior'));
  }

  function getProgress(){
    // The whirlpool finishes spinning at 65% of the runway; the rest is a
    // hold so the greeting has time to appear before the page moves on.
    const range = Math.max(1, (runway.offsetHeight - window.innerHeight) * 0.65);
    const travelled = Math.max(0, -runway.getBoundingClientRect().top);
    return Math.min(1, travelled / range);
  }

  function unlockPortfolio(){
    if (unlocked || getProgress() < 0.995) return;
    unlocked = true;
    document.body.classList.remove('whirlpool-locked');
    revealCopy();
    if (pendingHash){
      const destination = document.querySelector(pendingHash);
      window.history.replaceState(null, '', window.location.pathname + window.location.search + pendingHash);
      if (destination) destination.scrollIntoView({ behavior:'auto', block:'start' });
    }
  }

  window.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      draw();
      unlockPortfolio();
    });
  }, { passive:true });

  document.addEventListener('click', event => {
    if (unlocked || runway.contains(event.target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  const gl = canvas.getContext('webgl', { alpha:false, antialias:false, powerPreference:'high-performance' });

  if (!gl){
    stage.classList.add('whirlpool-fallback');
    stage.style.backgroundImage = 'url("assets/whirlpool-ocean.jpg")';
    unlockPortfolio();
    return;
  }

  const vertexSource = `attribute vec2 a_position; varying vec2 v_uv; void main(){ v_uv=a_position*0.5+0.5; gl_Position=vec4(a_position,0.0,1.0); }`;
  const fragmentSource = `
    precision highp float;
    uniform sampler2D u_ocean;
    uniform vec2 u_resolution;
    uniform vec2 u_imageSize;
    uniform float u_progress;
    varying vec2 v_uv;
    void main(){
      float screenAspect=u_resolution.x/u_resolution.y;
      float imageAspect=u_imageSize.x/u_imageSize.y;
      vec2 uv=v_uv;
      if(screenAspect>imageAspect) uv.y=(uv.y-0.5)*(imageAspect/screenAspect)+0.5;
      else uv.x=(uv.x-0.5)*(screenAspect/imageAspect)+0.5;
      vec2 center=vec2(0.5);
      vec2 delta=uv-center;
      delta.x*=screenAspect;
      float radius=length(delta);
      float influence=1.0-smoothstep(0.015,0.82,radius);
      float progress=clamp(u_progress,0.0,1.0);
      float angle=progress*9.0*influence;
      float sine=sin(angle), cosine=cos(angle);
      vec2 rotated=vec2(delta.x*cosine-delta.y*sine,delta.x*sine+delta.y*cosine);
      rotated*=1.0-progress*0.2*influence;
      rotated.x/=screenAspect;
      vec2 warped=center+rotated;
      float ripple=sin(radius*42.0-progress*18.0)*0.004*progress*influence;
      warped+=normalize(uv-center+vec2(0.00001))*ripple;
      gl_FragColor=texture2D(u_ocean,clamp(warped,0.001,0.999));
    }
  `;

  function compile(type, source){
    const shader=gl.createShader(type);
    if(!shader) return null;
    gl.shaderSource(shader,source);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
      console.error('Whirlpool shader failed:',gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertex=compile(gl.VERTEX_SHADER,vertexSource);
  const fragment=compile(gl.FRAGMENT_SHADER,fragmentSource);
  if(!vertex||!fragment){
    stage.classList.add('whirlpool-fallback');
    stage.style.backgroundImage='url("assets/whirlpool-ocean.jpg")';
    unlockPortfolio();
    return;
  }

  const program=gl.createProgram();
  gl.attachShader(program,vertex);
  gl.attachShader(program,fragment);
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
    console.error('Whirlpool program failed:',gl.getProgramInfoLog(program));
    stage.classList.add('whirlpool-fallback');
    stage.style.backgroundImage='url("assets/whirlpool-ocean.jpg")';
    unlockPortfolio();
    return;
  }

  gl.useProgram(program);
  const buffer=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'a_position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);

  const texture=gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.uniform1i(gl.getUniformLocation(program,'u_ocean'),0);
  const resolution=gl.getUniformLocation(program,'u_resolution');
  const imageSize=gl.getUniformLocation(program,'u_imageSize');
  const progressUniform=gl.getUniformLocation(program,'u_progress');

  draw=function(){
    if(!image.complete||!image.naturalWidth) return;
    gl.uniform1f(progressUniform,getProgress());
    gl.drawArrays(gl.TRIANGLES,0,6);
  };
  function resize(){
    const ratio=Math.min(window.devicePixelRatio||1,2);
    const width=Math.max(1,Math.round(stage.clientWidth*ratio));
    const height=Math.max(1,Math.round(stage.clientHeight*ratio));
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}
    gl.uniform2f(resolution,canvas.width,canvas.height);
    gl.uniform2f(imageSize,image.naturalWidth,image.naturalHeight);
    draw();
  }
  image.onload=()=>{
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    resize();
    unlockPortfolio();
  };
  image.onerror=()=>{stage.classList.add('whirlpool-fallback');stage.style.backgroundImage='url("assets/whirlpool-ocean.jpg")';unlockPortfolio();};
  if(image.complete&&image.naturalWidth) image.onload();
  window.addEventListener('resize',resize,{passive:true});
})();
