const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('index.html','utf8');
const game=fs.readFileSync('game.js','utf8');
const css=fs.readFileSync('styles.css','utf8');

test('entry offers comfort settings and a recoverable WebGL failure',()=>{
  for(const id of ['entryVolume','entryReducedMotion','entryLowBandwidth','entryHighContrast','entryLargeText'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/webglAvailable/);
  assert.match(html,/Retry opening/);
  assert.match(html,/cdn\.jsdelivr\.net[\s\S]*unpkg\.com/);
  assert.match(html,/reloadOnRetry/);
});

test('exploration remains prompted and discovery-led',()=>{
  assert.match(html,/id="exploreNudge"/);
  assert.match(game,/athenaeum-exploration-prompt-seen/);
  assert.match(html,/id="journalMap"/);
  assert.match(game,/athenaeum-explored-rooms/);
  assert.match(css,/\.map-place\.unknown/);
});

test('books warm their editions without presenting a catalogue',()=>{
  assert.match(game,/caches\.open\('athenaeum-editions-v1'\)/);
  assert.match(game,/queueFocusedPrefetch/);
  assert.match(game,/prefetchBook\(bm\.userData\.book\)/);
  assert.doesNotMatch(html,/id="(?:catalogue|catalog|bookSearch|searchBooks)"/i);
});

test('leave at desk persists a central-stand copy and has a working control',()=>{
  assert.match(game,/let deskBooks=new Set\(\)/);
  assert.match(game,/localStorage\.setItem\('athenaeum-desk-books'/);
  assert.match(game,/function leaveSelectedAtDesk\(\)/);
  assert.match(game,/deskBooks\.has\(id\)\|\|b\.progress>\.02/);
  assert.match(game,/\$\('#leaveBook'\)\.addEventListener\('click',leaveSelectedAtDesk\)/);
});

test('librarian and Quill can physically guide a visitor',()=>{
  assert.match(game,/function guideLibrarian/);
  assert.match(game,/librarianGuideTarget/);
  assert.match(game,/Walk with me/);
  assert.match(game,/catGuideTarget\?1\.45/);
  assert.match(game,/looks directly at you/);
});

test('Quill only meows after direct interaction',()=>{
  const catUpdate=game.match(/function updateCat\([\s\S]*?function updateLibrarian/)?.[0]||'';
  assert.doesNotMatch(catUpdate,/meow\(\)/);
  assert.match(game,/function petCat\([\s\S]*?meow\(\)/);
});

test('neglected rooms progressively disorder their books',()=>{
  assert.match(game,/function curatedShelf\(ids,x,z,rot=0,neglect=0\)/);
  assert.match(game,/fallen=neglect>=2/);
  assert.match(game,/quiet[^;]*,0,1\)/);
  assert.match(game,/unread[^;]*,0,2\)/);
  assert.match(game,/function repositoryRack[\s\S]*fallen=i>=7/);
  assert.match(game,/if\(fallen\)bm\.position\.y=\.14/);
});

test('held books stay fully visible above world geometry',()=>{
  assert.match(game,/function setHeldBookRendering/);
  assert.match(game,/material\.depthTest=false/);
  assert.match(game,/material\.depthWrite=false/);
  assert.match(game,/renderOrder=1000/);
  assert.match(game,/new THREE\.Vector3\(sway,-\.075\+bob,-1\.95\)/);
  assert.match(game,/new THREE\.Vector3\(\.98,\.98,\.98\)/);
  assert.doesNotMatch(html,/loadScript\('held-book-fix\.js'\)/);
});

test('Jules Verne has a concealed author-only voyages room',()=>{
  assert.match(game,/function vernePortalTexture/);
  assert.match(game,/destination:'verne',spawn:\[170,0,42\]/);
  assert.match(game,/key:'verne',cx:170,cz:46/);
  assert.match(game,/themeRoomKeys=new Set\([^\n]*'verne'/);
  assert.match(game,/authorRooms=\{verne:'Jules Verne'/);
  assert.match(game,/def\.books=books\.filter\(book=>book\.author===authorRooms\[def\.key\]\)/);
  assert.match(game,/function verneRoomDetails/);
  assert.match(game,/A model of the Nautilus/);
  assert.match(game,/memoryDoor\(170,55,'mainhall'/);
  for(const id of [164,103,4552,1268,18857,46597,1842,16457,10339,3808])assert.match(game,new RegExp(`\\[${id},[^\\n]+Jules Verne`));
  assert.match(game,/An old engraving of impossible voyages/);
  assert.match(game,/nineteenth-century steel engraving/);
});

test('Haggard and Conan Doyle have concealed author rooms with distinct period entrances',()=>{
  assert.match(game,/function haggardPortalTexture/);
  assert.match(game,/action:'TRACE ROUTE'/);
  assert.match(game,/image:'assets\/painting-haggard-lost-kingdom\.jpg'/);
  assert.match(game,/function hiddenEvidenceCase/);
  assert.match(game,/action:'ALIGN CLUES'/);
  assert.match(game,/hiddenEvidenceCase\(23\.5,4,-13\.65,0,/);
  assert.doesNotMatch(game,/hiddenEvidenceCase\(36\.65,4,-1,/);
  assert.match(game,/image:'assets\/painting-doyle-consulting-room\.jpg'/);
  for(const asset of ['assets/painting-haggard-lost-kingdom.jpg','assets/painting-doyle-consulting-room.jpg'])assert(fs.statSync(asset).size>100000,`${asset} should be a detailed oil painting`);
  assert.match(game,/destination:'haggard',spawn:\[108,0,68\]/);
  assert.match(game,/destination:'doyle',spawn:\[138,0,68\]/);
  assert.match(game,/key:'haggard',cx:108,cz:72/);
  assert.match(game,/key:'doyle',cx:138,cz:72/);
  assert.match(game,/authorRooms=\{verne:'Jules Verne',haggard:'H\. Rider Haggard',doyle:'Arthur Conan Doyle'\}/);
  assert.match(game,/function haggardRoomDetails/);
  assert.match(game,/function doyleRoomDetails/);
  assert.match(game,/memoryDoor\(108,81,'mainhall'/);
  assert.match(game,/memoryDoor\(138,81,'mainhall'/);
  for(const id of [3155,2166,711,5228,6769,1207,2769,2721,5746,2841])assert.match(game,new RegExp('\\['+id+',[^\\r\\n]*H\\. Rider Haggard'));
  for(const id of [1661,244,2097,221,2852,834,139,126,439,1638])assert.match(game,new RegExp('\\['+id+',[^\\r\\n]*Arthur Conan Doyle'));
});

test('hidden doors preserve the configured arrival yaw',()=>{
  assert.match(game,/const hp=\{progress:0,destination:opts\.destination,spawn:opts\.spawn,yaw:opts\.yaw,apply:p=>\{panel\.rotation\.y/);
  assert.doesNotMatch(game,/yaw:opts\.y,/);
});

test('themed-room exits face clear south walls and return beside their discoveries',()=>{
  assert.match(game,/function memoryDoor\([^\n]+rot=0\)[^\n]+group\.rotation\.y=rot/);
  const exits=[
    ['gothic',95,22,0,-27],['inquiry',120,22,14,-27],['chart',145,22,-33,9],
    ['drawing',95,54,-33,-8],['study',120,54,30,-10.5],['garden',145,54,33,-9],
    ['verne',170,55,34.5,5],['haggard',108,81,-34.5,5],['doyle',138,81,23.5,-10.5]
  ];
  for(const [name,x,z,sx,sz] of exits){
    assert.match(game,new RegExp(`memoryDoor\\(${x},${z},'mainhall',\\[${sx},0,${sz}\\][^;]+Math\\.PI/2\\)`),`${name} exit should be aligned with its south wall`);
  }
  for(const oldCall of ["memoryDoor(95,20,'mainhall'","memoryDoor(95,40,'mainhall'","memoryDoor(170,39,'mainhall'","memoryDoor(108,63,'mainhall'","memoryDoor(138,63,'mainhall'"])assert.doesNotMatch(game,new RegExp(oldCall.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  assert.match(game,/memoryDoor\(138,81,'mainhall',\[23\.5,0,-10\.5\]/);
});

test('reading-room seats face their shelves and benches use Gothic upholstery',()=>{
  assert.match(game,/chair\(room\.cx,room\.cz\+3,0,Object\.assign/);
  assert.match(game,/chair\(contested\.cx,contested\.cz\+3,0,/);
  assert.match(game,/options\.model\|\|'sofa'/);
  assert.doesNotMatch(game,/bench\([^;\n]*model:'paintedSofa'/);
});
