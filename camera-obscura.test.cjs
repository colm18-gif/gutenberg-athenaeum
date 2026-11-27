const test=require('node:test'),assert=require('node:assert'),fs=require('fs');
const src=fs.readFileSync('camera-obscura.js','utf8'),game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
test('the camera obscura is a turret on the roof garden, wired like the other rooms',()=>{
  assert.match(html,/startupScript\('camera-obscura\.js'\)/);
  assert.match(src,/const DOOR=\{x:16\.66,y:10\.0,z:58\.3,yaw:-Math\.PI\/2\}/,'on the east parapet, south of the lavender bed');
  assert.match(game,/'camera-obscura':cameraObscura&&\(\(\)=>\{buildRoofGarden\(\);cameraObscura\.enter\(\)\}\)/);
  assert.match(game,/\['camera-obscura','The camera obscura'\]/);
  assert.match(game,/'bindery','camera-obscura',/,'the Wandering Door can open on it');
  assert.match(fs.readFileSync('room-ambience.js','utf8'),/'camera-obscura':\{beds:/);
  assert.match(src,/label:'THE ROOF GARDEN',onward:'towards the Grand Hall'/);
});
test('the table shows the Grand Hall live, drawn a few times a second while the reader is inside',()=>{
  assert.match(src,/renderer\.setRenderTarget\(target\)/);assert.match(src,/if\(t>=drawAt\)\{drawAt=t\+DRAW_EVERY;drawTable\(\)\}/);
  assert.match(src,/if\(!inside\|\|!root\)return;/,'never drawn from outside the room');
  const views=src.match(/const VIEWS=\[([\s\S]*?)\n  \];/)[1].match(/\{key:'/g);assert.equal(views.length,4);
  // the views stay in the Grand Hall, which is always built (the wings and rooms are not drawn from far away)
  for(const [,x,z] of src.matchAll(/eye:\[(-?[\d.]+),[\d.]+,(-?[\d.]+)\]/g)){assert(Math.abs(+x)<18.7&&+z>-30&&+z<30.45,`a view's eye stands in the hall: ${x},${z}`)}
});
test('the figure walks to a door not yet opened, and its book and the shelf come from the new books',()=>{
  assert.match(src,/const unseen=doors\.filter\(d=>!placeKnown\(d\[0\]\)\)/);
  assert.match(game,/doors:exploration\?\.doors\|\|\[\]/);
  const nb=fs.readFileSync('data/new-books.js','utf8');
  assert((nb.match(/'obscura-books'/g)||[]).length>=8);assert.match(nb,/\[23169,'The Diamond Lens','Fitz James O’Brien','Fiction','obscura-figure'/);
});
