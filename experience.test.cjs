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
  assert.match(game,/destination:'verne',spawn:\[170,0,46\]/);
  assert.match(game,/key:'verne',cx:170,cz:46/);
  assert.match(game,/themeRoomKeys=new Set\([^\n]*'verne'/);
  assert.match(game,/def\.books=books\.filter\(book=>book\.author==='Jules Verne'\)/);
  assert.match(game,/function verneRoomDetails/);
  assert.match(game,/A model of the Nautilus/);
  assert.match(game,/memoryDoor\(170,39,'mainhall'/);
});
