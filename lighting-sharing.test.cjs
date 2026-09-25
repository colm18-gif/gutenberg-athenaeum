const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('index.html','utf8');
const game=fs.readFileSync('game.js','utf8');

test('the Grand Hall floor carries painted contact shadows and lamp pools',()=>{
  assert.match(game,/const hallLightmap=new URLSearchParams\(location\.search\)\.has\('nolightmap'\)\?null:/);
  assert.match(game,/for\(const c of colliders\)\{if\(c\.inactive/,'shadows come from the real furniture footprints');
  assert.match(game,/const pools=lampSpots\.filter/);
  assert.match(game,/shadow:plane\(shade,\.028,\{\}\),light:plane\(glow,\.03,\{blending:THREE\.AdditiveBlending\}\)/,'both layers sit above the rugs (.021)');
});

test('links to the library unfurl with a title, description and picture',()=>{
  for(const tag of ['og:title','og:description','og:image','og:url','og:image:width','og:image:height'])assert.match(html,new RegExp(`property="${tag}"`));
  for(const tag of ['twitter:card','twitter:title','twitter:description','twitter:image'])assert.match(html,new RegExp(`name="${tag}"`));
  assert.match(html,/content="https:\/\/libraryafterdark\.space\/assets\/share-card\.jpg"/);
  const jpg=fs.readFileSync('assets/share-card.jpg');assert.equal(jpg.readUInt16BE(0),0xffd8);assert.ok(jpg.length<300000,'small enough for every preview crawler');
});

test('a passage can be shared as a square image, as text, or through the device share sheet',()=>{
  for(const id of ['shareQuote','quoteShare','quoteText','quoteCanvas','quoteSend','quoteDownload','quoteCopy'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/<canvas id="quoteCanvas" width="1080" height="1080"/);
  assert.match(game,/const chosen=selectedText\(\),page=book\.pages\?\.\[book\.page\|\|0\]\|\|'';text\.value=\(chosen\|\|openingLines\(page\)\)/);
  assert.match(game,/navigator\.canShare&&navigator\.canShare\(\{files:/,'the share button only appears where images can be shared');
  assert.match(game,/if\(e\.target===text\|\|dialog\.contains\(e\.target\)\)e\.stopImmediatePropagation\(\)/,'typing does not turn pages');
  assert.match(game,/libraryafterdark\.space/);
});
