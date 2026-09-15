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
