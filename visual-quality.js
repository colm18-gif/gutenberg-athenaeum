// Visual quality layer for The Library After Dark.
//
// Adds three things on top of the existing scene without changing any room code:
//   1. A warm, lamp-lit environment map so varnished wood, brass, glass and leather
//      pick up soft reflections instead of looking flat.
//   2. A small HDR post pipeline: MSAA scene target, lamp bloom, gentle vignette,
//      a warm filmic grade, light film grain and dithering against banding in the dark.
//   3. Quality tiers that step down on their own when frames run slow, so weaker
//      machines keep a smooth walk rather than a pretty slideshow.
//
// Everything here is optional: if WebGL2 or half-float targets are unavailable the
// module falls back to plain renderer.render(scene,camera).
(function(){
  'use strict';
  const TIERS=['off','low','medium','high'];

  window.createVisualQuality=function({THREE,renderer,scene,camera,initialTier='high',reducedMotion=()=>false}){
    const gl=renderer.getContext(),isWebGL2=!!renderer.capabilities.isWebGL2;
    const canFloat=isWebGL2;
    let tierIndex=Math.max(0,TIERS.indexOf(initialTier));
    if(!canFloat)tierIndex=Math.min(tierIndex,TIERS.indexOf('off'));
    const maxAnisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy?.()||1);

    // ---------- Environment lighting ----------
    // A dim timber room lit by a few warm lamp panels and one cool moonlit window.
    // Dark overall so it adds reflections and a little bounce rather than brightening rooms.
    let environment=null;
    function buildEnvironment(){
      if(environment)return environment;
      const envScene=new THREE.Scene(),room=new THREE.BoxGeometry(1,1,1);
      const shell=new THREE.Mesh(room,new THREE.MeshBasicMaterial({color:0x1a120b,side:THREE.BackSide}));shell.scale.set(24,9,24);shell.position.y=3.5;envScene.add(shell);
      const floor=new THREE.Mesh(room,new THREE.MeshBasicMaterial({color:0x2b1a10}));floor.scale.set(23.5,.2,23.5);floor.position.y=-.9;envScene.add(floor);
      const panel=(color,strength,x,y,z,sx,sy,sz)=>{const m=new THREE.Mesh(room,new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(strength)}));m.position.set(x,y,z);m.scale.set(sx,sy,sz);envScene.add(m)};
      // Warm reading lamps and a chandelier glow.
      panel(0xffc27a,5.5,0,7.6,0,3.2,.2,3.2);
      panel(0xffb866,3.2,-7,3,-6,1.2,1.2,1.2);panel(0xffb866,3.2,7,3,-6,1.2,1.2,1.2);
      panel(0xffb866,2.6,-7,3,7,1.1,1.1,1.1);panel(0xffb866,2.6,7,3,7,1.1,1.1,1.1);
      // Hearth low on one wall and a cool rain-lit window opposite.
      panel(0xff7a2e,3.4,-11.7,1.2,0,.2,1.6,3.4);
      panel(0x8fb2d6,1.1,11.7,4.5,0,.2,4.5,5.5);
      // Rows of shelving: dark with faint leather tints to break up reflections.
      for(let i=-2;i<=2;i++){panel(0x3a1a12,1,i*4.2,2.5,-11.7,3.4,4.5,.2);panel(0x1d2a22,1,i*4.2,2.5,11.7,3.4,4.5,.2)}
      const pmrem=new THREE.PMREMGenerator(renderer);
      environment=pmrem.fromScene(envScene,.035).texture;
      pmrem.dispose();room.dispose();envScene.traverse(o=>{if(o.material)o.material.dispose()});
      return environment;
    }

    // ---------- Post-processing ----------
    const fullscreen=new THREE.Scene(),postCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1),quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));quad.frustumCulled=false;fullscreen.add(quad);
    const vertexShader='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
    const brightMaterial=new THREE.ShaderMaterial({uniforms:{tDiffuse:{value:null},threshold:{value:1.05},knee:{value:.55}},vertexShader,fragmentShader:`
      uniform sampler2D tDiffuse;uniform float threshold,knee;varying vec2 vUv;
      void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;float l=max(max(c.r,c.g),c.b);
        float soft=clamp(l-threshold+knee,0.,2.*knee);soft=soft*soft/(4.*knee+1e-4);
        float w=max(soft,l-threshold)/max(l,1e-4);gl_FragColor=vec4(min(c*w,vec3(24.)),1.);}`,depthTest:false,depthWrite:false,toneMapped:false});
    const blurMaterial=new THREE.ShaderMaterial({uniforms:{tDiffuse:{value:null},direction:{value:new THREE.Vector2()}},vertexShader,fragmentShader:`
      uniform sampler2D tDiffuse;uniform vec2 direction;varying vec2 vUv;
      void main(){vec3 c=texture2D(tDiffuse,vUv).rgb*.2270270270;
        c+=texture2D(tDiffuse,vUv+direction*1.3846153846).rgb*.3162162162;c+=texture2D(tDiffuse,vUv-direction*1.3846153846).rgb*.3162162162;
        c+=texture2D(tDiffuse,vUv+direction*3.2307692308).rgb*.0702702703;c+=texture2D(tDiffuse,vUv-direction*3.2307692308).rgb*.0702702703;
        gl_FragColor=vec4(c,1.);}`,depthTest:false,depthWrite:false,toneMapped:false});
    const compositeMaterial=new THREE.ShaderMaterial({uniforms:{tDiffuse:{value:null},tBloomA:{value:null},tBloomB:{value:null},bloomStrength:{value:.32},vignette:{value:.42},grain:{value:.022},time:{value:0},useBloom:{value:1}},vertexShader,fragmentShader:`
      uniform sampler2D tDiffuse,tBloomA,tBloomB;uniform float bloomStrength,vignette,grain,time,useBloom;varying vec2 vUv;
      float hash(vec2 p){p=fract(p*vec2(443.897,441.423));p+=dot(p,p.yx+19.19);return fract((p.x+p.y)*p.x);}
      void main(){
        vec3 color=texture2D(tDiffuse,vUv).rgb;
        if(useBloom>.5){vec3 bloom=texture2D(tBloomA,vUv).rgb*.6+texture2D(tBloomB,vUv).rgb*.4;color+=bloom*bloomStrength*vec3(1.,.92,.8);}
        // Warm grade: keep midtones, sink the deepest shadows slightly toward umber.
        // Gentle contrast around mid-grey restores depth that the bright fill light flattens.
        color=.18*pow(max(color,vec3(0.))/.18,vec3(1.12));
        float luma=dot(color,vec3(.2126,.7152,.0722));
        color=mix(color,color*vec3(1.05,.98,.88),smoothstep(.0,.4,luma)*.45);
        color=mix(vec3(luma),color,1.06);
        // Oval vignette that follows the screen shape.
        vec2 d=(vUv-.5)*vec2(1.,.82);float v=1.-smoothstep(.28,.9,length(d)*1.18);color*=mix(1.,v,vignette);
        gl_FragColor=vec4(max(color,0.),1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        // Grain and dithering after display conversion, where banding actually shows.
        float n=hash(gl_FragCoord.xy+fract(time)*vec2(97.,53.));
        gl_FragColor.rgb+=(n-.5)*(grain+1./255.);
      }`,depthTest:false,depthWrite:false,toneMapped:true});

    let sceneTarget=null,brightTarget=null,blurA=null,blurB=null,blurC=null,blurD=null,width=1,height=1,time=0;
    const size=new THREE.Vector2();
    function disposeTargets(){for(const target of [sceneTarget,brightTarget,blurA,blurB,blurC,blurD])target?.dispose();sceneTarget=brightTarget=blurA=blurB=blurC=blurD=null}
    function makeTarget(w,h,samples=0){const target=new THREE.WebGLRenderTarget(Math.max(1,w),Math.max(1,h),{type:THREE.HalfFloatType,depthBuffer:samples>=0,stencilBuffer:false});if(samples>0&&isWebGL2)target.samples=samples;target.texture.generateMipmaps=false;target.texture.minFilter=THREE.LinearFilter;target.texture.magFilter=THREE.LinearFilter;return target}
    function buildTargets(){
      disposeTargets();const tier=TIERS[tierIndex];if(tier==='off')return;
      renderer.getDrawingBufferSize(size);width=size.x;height=size.y;
      sceneTarget=makeTarget(width,height,tier==='high'?4:tier==='medium'?2:0);
      if(tier!=='low'){const hw=width>>1,hh=height>>1,qw=width>>2,qh=height>>2,ew=width>>3,eh=height>>3;brightTarget=makeTarget(hw,hh,-1);blurA=makeTarget(qw,qh,-1);blurB=makeTarget(qw,qh,-1);blurC=makeTarget(ew,eh,-1);blurD=makeTarget(ew,eh,-1)}
    }
    function pass(material,target){quad.material=material;renderer.setRenderTarget(target);renderer.render(fullscreen,postCamera)}
    function blur(source,temp,dest){const w=dest.width,h=dest.height;blurMaterial.uniforms.tDiffuse.value=source.texture;blurMaterial.uniforms.direction.value.set(1/w,0);pass(blurMaterial,temp);blurMaterial.uniforms.tDiffuse.value=temp.texture;blurMaterial.uniforms.direction.value.set(0,1/h);pass(blurMaterial,dest)}

    function applyEnvironment(){scene.environment=buildEnvironment()}
    // Sharper textures at grazing angles (floors, long shelves) where the hardware allows it.
    // Re-uploading a texture costs a little, so the work is spread over several frames.
    const tunedTextures=new WeakSet(),pendingTextures=[];
    function collectTextures(){if(maxAnisotropy<=1)return;scene.traverse(object=>{const material=object.material;if(!material)return;for(const m of Array.isArray(material)?material:[material]){for(const key of ['map','normalMap','roughnessMap']){const texture=m[key];if(!texture||tunedTextures.has(texture))continue;tunedTextures.add(texture);if((texture.anisotropy||1)<maxAnisotropy)pendingTextures.push(texture)}}})}
    function tuneSomeTextures(limit){while(limit-->0&&pendingTextures.length){const texture=pendingTextures.pop();texture.anisotropy=maxAnisotropy;if(texture.image&&texture.version>0)texture.needsUpdate=true}}

    function render(dt=0){
      const tier=TIERS[tierIndex];
      if(tier==='off'||!sceneTarget){renderer.setRenderTarget(null);renderer.render(scene,camera);return}
      renderer.getDrawingBufferSize(size);if(size.x!==width||size.y!==height)buildTargets();
      time=(time+dt)%1000;
      renderer.setRenderTarget(sceneTarget);renderer.render(scene,camera);
      const bloom=tier!=='low'&&brightTarget;
      if(bloom){brightMaterial.uniforms.tDiffuse.value=sceneTarget.texture;pass(brightMaterial,brightTarget);blur(brightTarget,blurA,blurB);blur(blurB,blurC,blurD)}
      const u=compositeMaterial.uniforms;u.tDiffuse.value=sceneTarget.texture;u.tBloomA.value=bloom?blurB.texture:null;u.tBloomB.value=bloom?blurD.texture:null;u.useBloom.value=bloom?1:0;u.time.value=reducedMotion()?0:time;u.grain.value=reducedMotion()?.008:.022;
      pass(compositeMaterial,null);
    }

    function setTier(name){const index=TIERS.indexOf(name);if(index<0||(!canFloat&&index>0))return;tierIndex=index;buildTargets();applyEnvironment()}
    // Called by the adaptive-quality loop once render scale alone is not enough.
    function stepDown(){if(tierIndex<=0)return false;setTier(TIERS[tierIndex-1]);return true}

    let collectTimer=1,tuneTimer=0;
    function update(dt){collectTimer-=dt;if(collectTimer<=0){collectTimer=4;collectTextures()}tuneTimer-=dt;if(tuneTimer<=0){tuneTimer=.2;tuneSomeTextures(3)}}

    setTier(TIERS[tierIndex]);
    return {render,update,setTier,stepDown,resize:buildTargets,get tier(){return TIERS[tierIndex]},get environment(){return scene.environment}};
  };
})();
