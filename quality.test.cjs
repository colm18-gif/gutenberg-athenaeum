const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const game=fs.readFileSync('game.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const visual=fs.readFileSync('visual-quality.js','utf8');
const sound=fs.readFileSync('soundscape.js','utf8');

test('visual and sound layers load before the game and are optional',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(match=>match[1]);
  assert.ok(order.indexOf('visual-quality.js')>=0&&order.indexOf('visual-quality.js')<order.indexOf('game.js'));
  assert.ok(order.indexOf('soundscape.js')>=0&&order.indexOf('soundscape.js')<order.indexOf('game.js'));
  assert.match(game,/window\.createVisualQuality\?\.\(/);
  assert.match(game,/if\(visual\)\{visual\.update\(dt\);visual\.render\(dt\)\}else renderer\.render\(scene,camera\)/);
  assert.match(game,/soundscape=window\.createSoundscape\?\.\(/);
});

test('the number of active lights stays constant so walking never recompiles shaders',()=>{
  assert.match(game,/LIGHT_BUDGET=lowPowerDevice\?6:touchMode\?8:12/);
  assert.match(game,/lightCandidates\[i\]\.visible=i<LIGHT_BUDGET/);
  assert.match(game,/light\.parent===camera\?Infinity/,'the reader lantern is never dropped');
});

test('post-processing tone maps once, dithers, and steps down on slow machines',()=>{
  assert.match(visual,/#include <tonemapping_fragment>/);
  assert.match(visual,/#include <colorspace_fragment>/);
  assert.match(visual,/function stepDown\(\)/);
  assert.match(game,/adaptiveRenderScale<=adaptiveQualityFloor&&!visualTierPinned&&visual\?\.stepDown\(\)/);
  assert.match(visual,/scene\.environment=buildEnvironment\(\)/);
});

test('visual quality renders directly when post-processing is off',()=>{
  let direct=0,targets=0;
  const Base=class{constructor(){this.position={set(){},y:0};this.scale={set(){}};this.material=null}add(){}traverse(){}dispose(){}};
  const THREE={Scene:Base,Mesh:Base,BoxGeometry:Base,PlaneGeometry:Base,OrthographicCamera:Base,MeshBasicMaterial:Base,Color:class{multiplyScalar(){return this}},ShaderMaterial:class{constructor(p){Object.assign(this,p)}},Vector2:class{set(){return this}},WebGLRenderTarget:class{constructor(){targets++;this.texture={}}dispose(){}},PMREMGenerator:class{fromScene(){return {texture:{}}}dispose(){}},BackSide:1,HalfFloatType:1,LinearFilter:1};
  const renderer={getContext:()=>({}),capabilities:{isWebGL2:true,getMaxAnisotropy:()=>8},render:()=>direct++,setRenderTarget(){},getDrawingBufferSize:v=>v};
  const scene={traverse(){},environment:null},context={window:{}};
  vm.runInNewContext(visual,context);
  const quality=context.window.createVisualQuality({THREE,renderer,scene,camera:{},initialTier:'off'});
  quality.render(.016);
  assert.equal(direct,1);assert.equal(targets,0);assert.equal(quality.tier,'off');
  assert.ok(scene.environment,'reflections stay on even without post-processing');
});

test('recorded effects prefer low-latency buffers but keep the HTML audio fallback',()=>{
  assert.match(game,/if\(soundscape&&name!=='trainRumble'&&soundscape\.play\(name,/);
  assert.match(game,/const audio=entry\.pool\[entry\.index\+\+%entry\.pool\.length\]/);
  assert.match(game,/soundscape\?\.stop\(footstepNames\)/);
  assert.match(game,/soundscape\?\.setMuted\(muted\)/);
  assert.match(sound,/source\.start\(now\);\n\s+if\(maxDuration\)/,'a source must start before a stop is scheduled');
});

test('lightning respects reduced motion and head bob follows the footstep cadence',()=>{
  assert.match(game,/function flashLightning\(strength\)\{if\(reducedMotion\)return;/);
  assert.match(game,/headBobAmount=THREE\.MathUtils\.damp\(headBobAmount,reducedMotion\|\|/);
  assert.match(game,/headBobPhase\+=dt\*Math\.PI\/stepSeconds/);
});

test('self-hosted typefaces ship with their licences',()=>{
  for(const file of ['im-fell-english-sc-latin-400-normal.woff2','cormorant-garamond-latin-400-normal.woff2','cormorant-garamond-latin-500-normal.woff2','cormorant-garamond-latin-600-normal.woff2','cormorant-garamond-latin-400-italic.woff2','OFL-IM-Fell.txt','OFL-Cormorant.txt'])assert.ok(fs.statSync(`assets/fonts/${file}`).size>1000,file);
  assert.match(fs.readFileSync('styles.css','utf8'),/@font-face\{font-family:'IM Fell English SC'/);
});

test('tablets render sharply with smoothing and lamp glow, and only weak hardware starts lighter',()=>{
  assert.match(game,/pixelRatioCap=touchMode\?\(lowPowerDevice\?1:1\.5\)/,'modern tablets are no longer rendered below their CSS resolution');
  assert.match(game,/automaticTier=lowPowerDevice\?'low':touchMode\?'medium':'high'/);
  assert.match(game,/lowPowerDevice=weakHardware\|\|\(!touchMode&&/,'being a touch device no longer implies low power');
  assert.match(visual,/sceneTarget=makeTarget\(width,height,tier==='high'\?4:2\)/,'every post tier multisamples');
  assert.match(game,/antialias:visualTier==='off',/);
});
