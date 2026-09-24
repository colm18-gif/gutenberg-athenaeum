const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('index.html','utf8');
const game=fs.readFileSync('game.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const train=fs.readFileSync('night-train.js','utf8');

test('the way back to the Grand Hall is offered everywhere and when the reader seems stuck',()=>{
  assert.match(html,/id="resetPosition">Return to the Grand Hall</);
  assert.match(html,/id="touchReturn"[^>]*aria-label="Return to the Grand Hall">⌂</);
  assert.match(html,/id="journalHome"/);
  assert.match(game,/\$\('#journalHome'\)\.addEventListener\('click',\(\)=>resetPosition\(\)\)/);
  assert.match(game,/movePlayer\.stuckFor>3/);
  assert.match(game,/Stuck\? Press R to return to the Grand Hall\./);
});

test('reading comfort: size, typeface, page tone and spacing are chosen, applied and remembered',()=>{
  for(const id of ['readerStyle','readerPrefs','readerScaleLabel'])assert.match(html,new RegExp(`id="${id}"`));
  for(const [group,values] of Object.entries({face:['classic','garamond','clear'],tone:['parchment','sepia','night'],leading:['snug','comfortable','airy']})){
    assert.match(html,new RegExp(`data-group="${group}"`));for(const value of values)assert.match(html,new RegExp(`data-value="${value}"`));
  }
  assert.match(game,/localStorage\.setItem\('athenaeum-reader-prefs'/);
  assert.match(game,/document\.fonts\?\.load\?\.\(/,'pages are measured with the chosen face once it has loaded');
  // Every page-size rule, including phones and tablets, honours the chosen scale and spacing.
  const pageRules=[...css.matchAll(/\.page\{[^}]*font-size:[^}]*\}/g)].map(m=>m[0]);
  assert.ok(pageRules.length>=4);
  for(const rule of pageRules){assert.match(rule,/var\(--reader-scale,1\)/,rule);assert.match(rule,/var\(--reader-leading,1\)/,rule)}
  assert.match(css,/font-family:var\(--reader-face,Georgia,serif\)/);
  for(const tone of ['sepia','night'])assert.match(css,new RegExp(`#reader\\.tone-${tone}`));
  assert.match(css,/\.pages\{touch-action:none\}/,'pinch reaches the page instead of zooming the browser');
});

test('touch reading turns pages by swipe or edge tap and resizes text by pinching',()=>{
  assert.match(game,/if\(touches\.size===2\)\{swipeId=null;pinch=\{distance:pinchDistance\(\),scale:readerPrefs\.scale\}\}/);
  assert.match(game,/setReaderScale\(pinch\.scale\*pinchDistance\(\)\/pinch\.distance,false\)/);
  assert.match(game,/if\(f>\.68\)pageStep\(1\);else if\(f<\.32\)pageStep\(-1\)/);
});

test('the map and the finder know every room, including those reached by train, stair and secret door',()=>{
  const listed=new Set([...game.matchAll(/\['([a-z-]+)','[^']+'\]/g)].map(m=>m[1]));
  for(const key of ['returning','quiet','unread','repository'])assert.ok(listed.has(key),`memory room ${key}`);
  for(const key of ['curious-parlour','curious-conservatory','curious-horologist','curious-attic','afterdark-sorting','afterdark-departures','moon','rocket','high-staircase','verne-descent','librarian-office','contested'])assert.ok(listed.has(key),key);
  assert.match(game,/themeRoomDefs\.map\(def=>\[def\.key,titleCase\(def\.sign\[0\]\)\]\)/,'every reading room is listed from its own definition');
  const railKeys=[...train.matchAll(/key:'([a-z-]+)',a:/g)].map(m=>m[1]);
  const railMap=game.match(/const RAIL_PLACES=\{([^}]*)\}/)[1];
  for(const key of railKeys)assert.ok(railMap.includes(key.includes('-')?`'${key}'`:key),`railway region ${key} has a place`);
  assert.match(game,/function analyticsRoom\(\)\{return placeAt\(player\.pos\.x,player\.pos\.y,player\.pos\.z\)\}/);
  assert.match(game,/found\.add\(placeAt\(at\.x,floorHeight\(at\.x,at\.z\),at\.z\)\)/,'shelved books are placed by the floor they stand on');
});

test('the finder searches the whole catalogue, shows where books live and can bring one to read',()=>{
  for(const id of ['tab-discoveries','tab-map','tab-find','panel-map','panel-find','bookSearch','searchResults','hallPlan','journalMap','discoveryStats'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(game,/words\.every\(word=>hay\.includes\(word\)\)/);
  assert.match(game,/function bringBookToReader\(book\)\{closeJournal\(\);if\(selected\)returnSelected\(false\);/);
  assert.match(game,/seatCopy:true/);
  assert.match(game,/if\(e\.target\?\.id==='bookSearch'&&e\.code!=='Escape'\)e\.stopImmediatePropagation\(\)/,'typing a J or WASD in the search box does not close the journal or walk');
  assert.match(game,/'Shelved somewhere you have not found yet'/,'undiscovered rooms are not revealed by the finder');
});

test('the discovery journal tallies rooms, secrets, books, mysteries, keepsakes and reasons',()=>{
  for(const label of ['Rooms found','Secret places','Books opened','Books finished','Mysteries solved','Keepsakes','Reasons found'])assert.ok(game.includes(`['${label}',`),label);
  assert.match(game,/New room charted: \$\{info\.label\}/);
  assert.match(game,/renderDiscoveryStats\?\.\(\)/);
  assert.match(game,/var renderLibraryAtlas=function/,'declared with var so early journal renders before it exists are harmless');
});
