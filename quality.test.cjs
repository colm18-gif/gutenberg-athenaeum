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
  assert.match(game,/LIGHT_BUDGET=lowPowerDevice\?4:touchMode\?6:7/);
  assert.match(game,/const on=i<LIGHT_BUDGET;lightCandidates\[i\]\.visible=on/);
  // Where fewer lamps are near than the budget allows, dark fillers make up the number, so the count never changes.
  assert.match(game,/const budgetFillers=Array\.from\(\{length:LIGHT_BUDGET\}/);
  assert.match(game,/budgetFillers\[i\]\.visible=i<LIGHT_BUDGET-shownPoints/);
  assert.match(game,/!object\.userData\.budgetFiller&&!known\.has\(object\)/,'fillers are never budgeted themselves');
  assert.match(game,/light\.parent===camera\?Infinity/,'the reader lantern is never dropped');
});

test('post-processing tone maps once, dithers, and steps down on slow machines',()=>{
  assert.match(visual,/#include <tonemapping_fragment>/);
  assert.match(visual,/#include <colorspace_fragment>/);
  assert.match(visual,/function stepDown\(\)/);
  assert.match(game,/adaptiveRenderScale<=adaptiveQualityFloor&&!visualTierPinned&&visual\?\.stepDown\(\)/);
  assert.match(visual,/scene\.environment=buildEnvironment\(\)/);
});

function plainQuality(isWebGL2){
  const counts={renders:0,targets:0,targetRenders:0};let bound=null;
  const Base=class{constructor(){this.position={set(){},y:0};this.scale={set(){}};this.material=null}add(){}traverse(){}dispose(){}};
  const THREE={Scene:Base,Mesh:Base,BoxGeometry:Base,PlaneGeometry:Base,OrthographicCamera:Base,MeshBasicMaterial:Base,Color:class{multiplyScalar(){return this}},ShaderMaterial:class{constructor(p){Object.assign(this,p)}},Vector2:class{set(){return this}},WebGLRenderTarget:class{constructor(){counts.targets++;this.texture={}}dispose(){}},PMREMGenerator:class{fromScene(){return {texture:{}}}dispose(){}},BackSide:1,HalfFloatType:1,LinearFilter:1};
  const renderer={getContext:()=>({}),capabilities:{isWebGL2,getMaxAnisotropy:()=>8},render:()=>{counts.renders++;if(bound)counts.targetRenders++},setRenderTarget(target){bound=target},getDrawingBufferSize:v=>v};
  const scene={traverse(){},environment:null},context={window:{}};
  vm.runInNewContext(visual,context);
  const quality=context.window.createVisualQuality({THREE,renderer,scene,camera:{},initialTier:'off'});
  quality.render(.016);
  return {quality,scene,counts};
}

test('without post-processing the scene is still drawn into a target, so stepping down compiles nothing new',()=>{
  const {quality,scene,counts}=plainQuality(true);
  assert.equal(quality.tier,'off');assert.equal(counts.targets,1,'one scene target, no bloom targets');
  assert.equal(counts.targetRenders,1,'the scene is drawn into the target');assert.equal(counts.renders,2,'then copied to the screen');
  assert.ok(scene.environment,'reflections stay on even without post-processing');
  assert.match(visual,/if\(tier==='off'\)\{copyMaterial\.uniforms\.tDiffuse\.value=sceneTarget\.texture;pass\(copyMaterial,null\);return\}/);
  assert.match(visual,/function bindSceneTarget\(\)\{renderer\.setRenderTarget\(sceneTarget\|\|null\)\}/);
});

test('WebGL1 draws straight to the screen',()=>{
  const {counts}=plainQuality(false);
  assert.equal(counts.targets,0);assert.equal(counts.renders,1);assert.equal(counts.targetRenders,0);
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
  assert.match(game,/antialias:!window\.WebGL2RenderingContext,/,'edges are smoothed in the scene target instead');
});
