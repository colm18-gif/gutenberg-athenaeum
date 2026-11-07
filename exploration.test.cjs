const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('exploration.js','utf8'),ambience=fs.readFileSync('room-ambience.js','utf8');
const context={window:{},Math,JSON,Date};vm.runInNewContext(source,context);
const X=context.window.createExploration;
// A text as one line, with the typographer's quotes made plain, so a quotation can be looked for in it.
const plain=s=>s.replace(/\s+/g,' ').replace(/[’‘]/g,"'").replace(/[“”]/g,'"');
const text=id=>{const loose=`texts/${id}.txt`,gz=`texts/bundled-gzip/${id}.txt.gz`;return plain(fs.existsSync(loose)?fs.readFileSync(loose,'utf8'):require('zlib').gunzipSync(fs.readFileSync(gz)).toString('utf8'))};
const places=new Set([...game.matchAll(/\['([a-z-]+)','[^']+'\]/g)].map(m=>m[1]));

test('exploration loads before the back ways and the game, and is wired in like a room',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert.equal(order.indexOf('exploration.js'),order.indexOf('passages.js')-1);
  assert.match(game,/var exploration=window\.createExploration\?\.\(/);
  assert.match(game,/exploration\.anteroom\.floorAt\(x,z\)\?\?preExploreFloor\(x,z\)/);
  assert.match(game,/if\(exploration\.blocks\(x,z\)\)return false;if\(exploration\.anteroom\.contains\(x,z\)\)/);
  assert.match(game,/exploration\.interact\(focus\)/);assert.match(game,/exploration\.onSelect\(bm\)/);assert.match(game,/exploration\.update\(t,dt\)/);
  assert.match(game,/if\(exploration\)svg\.push\(exploration\.planOverlay\(/,'the plan draws the route, the compass and the dragons');
  assert.match(game,/leak:reading\?null:exploration\?\.doorLeak\(\)/,'rooms not yet found are heard through their doors');
});

test('every door a room is heard through has a sound of its own, and a way to find it',()=>{
  for(const [place,x,z,ax,az] of X.DOORS){
    assert.ok(places.has(place),`${place} is a place in the journal`);
    assert.match(ambience,new RegExp(`(^|\\s|')${place}'?:\\{beds`,'m'),`${place} has an ambience to leak`);
    assert.ok(X.HINTS[place],`${place} has a slip from the stacks`);
    assert.ok(Math.hypot(ax-x,az-z)<4.5,`${place}'s lantern stops in front of its door`);
  }
  // The room behind the door is muffled, quieter than the room the reader is in, and only one is heard at a time.
  assert.match(ambience,/muffle\.type='lowpass'/);assert.match(ambience,/on\?1:heard\?leak\.level:0/);
  for(const [place,[,before]] of Object.entries(X.HINTS)){assert.ok(places.has(place),`${place} is a place`);if(before)assert.ok(places.has(before),`${before} is a place`)}
  for(const [,place] of X.MARGINS)assert.ok(places.has(place),`${place} is a place`);
});

test('the stopped clocks are stopped where their books say, and the Conrad is Conrad',()=>{
  for(const clock of X.CLOCKS){
    assert.ok(text(clock.source).includes(plain(clock.quote)),`${clock.key}: the quotation is in ${clock.source}`);
    assert.ok(plain(clock.text).includes(plain(clock.quote)),`${clock.key}: the card quotes it`);
  }
  const [havisham,hatter,ebony]=X.CLOCKS;assert.deepEqual([havisham.h,havisham.m,hatter.h,hatter.m,ebony.h,ebony.m],[8,40,6,0,12,0]);
  assert.ok(text('pg219').includes(plain(`I would put my finger on it and say, ‘${X.CONRAD}’`)),'Heart of Darkness');
  // On the hall's columns (x ±11, radius 0.45), facing out.
  for(const c of X.CLOCKS){const col=[[11,-5],[11,27],[-11,-25]].find(([x,z])=>Math.hypot(c.x-x,c.z-z)<.6);assert.ok(col,`${c.key} hangs on a column`)}
});

test('closing time dims the west wing, then the east, then the hall, and morning brings them back',()=>{
  const at=(h,m=0)=>new Date(2026,10,7,h,m);
  const west=-28,east=28,hall=0;
  for(const x of [west,east,hall])assert.equal(X.dimFor(x,0,at(21)),1,'all lit at nine');
  assert.ok(X.dimFor(west,0,at(23,15))<1&&X.dimFor(east,0,at(23,15))===1&&X.dimFor(hall,0,at(23,15))===1,'the west wing first');
  assert.ok(X.dimFor(east,0,at(0,15))<1&&X.dimFor(hall,0,at(0,15))===1,'then the east');
  for(const x of [west,east,hall])assert.ok(Math.abs(X.dimFor(x,0,at(2))-.55)<1e-9,'never darker than this');
  for(const x of [west,east,hall])assert.equal(X.dimFor(x,0,at(7)),1,'lit again by seven');
});

test('the moonlight follows the real moon',()=>{
  const phase=iso=>X.moonPhase(Date.parse(iso));
  const near=(a,b)=>Math.min(Math.abs(a-b),1-Math.abs(a-b))<.04;
  assert.ok(near(phase('2024-04-08T18:21Z'),0),'new moon, 8 April 2024');
  assert.ok(near(phase('2024-04-23T23:49Z'),.5),'full moon, 23 April 2024');
  assert.ok(near(phase('2026-11-24T14:53Z'),.5),'full moon, 24 November 2026');
});

test('no lights of their own, but the anteroom’s one lamp; nothing new for analytics',()=>{
  assert.equal((source.match(/new THREE\.PointLight\(/g)||[]).length,1);
  const allowed=fs.readFileSync('analytics.js','utf8');
  for(const [,name] of source.matchAll(/track\?\.\('([^']+)'/g))assert.ok(allowed.includes(`'${name}'`),`${name} is an allowed event`);
  // The anteroom is a room like the others: in the journal, with a sound, and a link.
  assert.match(game,/\['explorers-anteroom','The explorers’ anteroom'\]/);
  assert.match(ambience,/'explorers-anteroom':\{beds/);
  assert.match(game,/explorers:'explorers-anteroom'/);
  // Far from everything else: the camera reaches 130 m.
  const ante={x:1320,z:320};for(const [x,z] of [[1000,200],[1100,700],[1200,-600],[900,-100],[800,400],[1260,-620]])assert.ok(Math.hypot(ante.x-x,ante.z-z)>200,`clear of ${x},${z}`);
});

test('the ledger’s departures are dated, and the trolley and capsules only point to rooms that exist',()=>{
  assert.ok(X.DEPARTURES.length>=6);for(const [when,where,who] of X.DEPARTURES){assert.match(when,/\b1[5-9]\d\d$/);assert.ok(where&&who)}
  for(const [,,ax,az] of X.DOORS.map(d=>[d[0],0,d[3],d[4]]))assert.ok(Number.isFinite(ax)&&Number.isFinite(az));
  for(const id of Object.keys(X.DRAUGHTS))assert.match(game,new RegExp(`\\['${id}','`),`${id} is one of the mysteries`);
});
