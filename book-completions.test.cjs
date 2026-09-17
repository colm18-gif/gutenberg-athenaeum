const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),zlib=require('node:zlib');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
const data={window:{},Math};vm.runInNewContext(fs.readFileSync('data/book-completions.js','utf8'),data);
let raw=game.slice(game.indexOf('const books=')+12);raw=raw.slice(0,raw.indexOf('].map')+1);
const books=vm.runInNewContext(raw).map(b=>({id:b[0],title:b[1],author:b[2],index:0})).concat(JSON.parse(fs.readFileSync('data/open-access-catalog.json','utf8')).books.filter(b=>b.status==='published'));
const originalNotes=JSON.parse(fs.readFileSync('data/librarian-notes.json','utf8')),covers={};for(let i=0;i<9;i++)Object.assign(covers,JSON.parse(fs.readFileSync(`covers/shard_${i}.json`,'utf8')));
test('every current book and the expedition copy has a librarian note without overwriting originals',()=>{
  const merged={...data.window.ATHENAEUM_EXTRA_NOTES,...originalNotes};for(const b of books.concat({id:3748}))assert(merged[b.id]?.length>50,`missing note ${b.id}`);for(const [id,note]of Object.entries(originalNotes))assert.equal(merged[id],note);assert.match(game,/librarianNotes=\{[^\n]+\.\.\.await res\.json\(\)/);
});
test('every uncached cover has a local illustrated design, including in low-bandwidth mode',()=>{
  const designs=data.window.ATHENAEUM_COVER_DESIGNS,missing=books.filter(b=>!covers[b.id]);assert(missing.length>=35);for(const b of missing)assert(designs[b.id],`missing cover ${b.id}`);
  const coverCode=game.split('\n').find(l=>l.includes('function coverTexture(book)'));
  const ctx=new Proxy({measureText:s=>({width:s.length*12})},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});let emblems=0;
  const runtime={window:{...data.window,drawAthenaeumCoverEmblem:(...args)=>{emblems++;data.window.drawAthenaeumCoverEmblem(...args)}},coverTextureCache:new Map(),lowBandwidth:true,realCovers:covers,bookPalettes:[['#123456','#abcdef']],canvasTexture:draw=>{draw(ctx,384,560);return{}},wrapText:()=>{}};
  vm.runInNewContext(coverCode+';this.cover=coverTexture;',runtime);for(const b of missing)runtime.cover(b);assert.equal(emblems,missing.length);assert.match(html,/loadScript\('data\/book-completions\.js'\)/);
});
test('new Haggard and Conan Doyle books have locally cached scanned covers',()=>{
  for(const id of [711,5228,6769,1207,2769,2721,5746,2841,1690,126,439,1638])assert(covers[id]?.length>3000,`missing scanned cover ${id}`);
});
test('every Gutenberg catalogue book has a complete local reading copy',()=>{
  for(const book of books.filter(book=>book.id<900000)){
    const direct=`texts/pg${book.id}.txt`,compressed=`texts/bundled-gzip/pg${book.id}.txt.gz`;let edition;if(fs.existsSync(direct))edition=fs.readFileSync(direct);else{assert(fs.existsSync(compressed),`missing local edition ${book.id}`);edition=zlib.gunzipSync(fs.readFileSync(compressed))}assert(edition.length>10000,`local edition ${book.id} is too short`);assert.match(edition.subarray(0,2048).toString(),/Project Gutenberg/i,`local edition ${book.id} has no Gutenberg header`);assert.match(edition.subarray(-65536).toString(),/END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK/i,`local edition ${book.id} is incomplete`)
  }
  assert.match(game,/fetchBundledEdition\(book\.id\)/);assert.match(game,/DecompressionStream\('gzip'\)/);
});
test('Nautilus hull and plinth are blocked but its surrounding walkways and other floor levels remain open',()=>{
  const call=game.match(/collider\(room\.cx,room\.cz,4\.2,1\.95,'Nautilus display',-1,2\.4\)/)?.[0];assert(call);
  const colliders=[],runtime={room:{cx:170,cz:46},collider:(x,z,w,d,name,minY,maxY)=>colliders.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY,maxY}),colliders,player:{radius:.42},floorHeight:()=>0,memoryZoneAt:()=>null,themeZoneAt:()=>({}),secretOpen:0,tunnelOpen:0,finalDoorOpen:0};
  vm.runInNewContext(call+';'+game.split('\n').find(l=>l.includes('function allowed(x,z,y='))+';this.walk=allowed;',runtime);
  assert(!runtime.walk(170,46));assert(!runtime.walk(171.9,46));assert(runtime.walk(172.7,46));assert(runtime.walk(170,47.6));assert(runtime.walk(170,44.4));
  const arrival=game.match(/destination:'verne',spawn:\[([\d.,]+)\]/)[1].split(',').map(Number);
  assert(runtime.walk(arrival[0],arrival[2]),'Verne arrival must not overlap the Nautilus display');
  for(const [dx,dz]of [[.15,0],[-.15,0],[0,.15],[0,-.15]])assert(runtime.walk(arrival[0]+dx,arrival[2]+dz),'Verne arrival must allow movement in every direction');
  runtime.floorHeight=()=>3;assert(runtime.walk(170,46));
});
test('stairway panel uses the existing licensed creak, with fallback, without replaying the bell sound',()=>{
  const code=game.split('\n').find(l=>l.includes("interact=function(){if(verneDescent.returning)"));let samples=0,tones=0;
  const runtime={focus:{userData:{type:'verne-descent-panel'}},selected:null,verneDescent:{returning:false,interact:()=>true},playSample:(name,volume,rate)=>{assert.equal(name,'secretDoor');assert.equal(volume,.85);assert.equal(rate,.92);samples++;return true},sound:()=>tones++,libraryInteract:()=>{}};
  vm.runInNewContext(code,runtime);runtime.interact();assert.equal(samples,1);assert.equal(tones,0);runtime.playSample=()=>false;runtime.interact();assert.equal(tones,1);runtime.focus.userData.type='verne-return-bell';runtime.interact();assert.equal(tones,1);assert(fs.statSync('assets/audio/secret-door.ogg').size>1000);
});
