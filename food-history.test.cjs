// Foundation checks for the first Gastronomic Athenaeum wing.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('food-history-wing.js','utf8');
const game=fs.readFileSync('game.js','utf8');
const index=fs.readFileSync('index.html','utf8');
test('the wing loads before game.js and registers its room factory',()=>{
  assert.ok(index.includes("startupScript('food-history-wing.js')"));
  assert.ok(index.indexOf("startupScript('food-history-wing.js')")<index.indexOf("startupScript('game.js')"));
  assert.ok(source.includes('window.createFoodHistoryWing=function(options)')||source.includes('window.createFoodHistoryWing=function(o)'));
  assert.ok(game.includes('window.createFoodHistoryWing?.('));
});
test('entry, return, deep link, collision and world update are wired',()=>{
  for(const term of ["'food-history':foodHistoryWing","foodHistoryWing.floorAt","foodHistoryWing.allowed","foodHistoryWing.interact","foodHistoryWing.update"])
    assert.ok(game.includes(term),term);
  for(const term of ['food-history-door','food-history-exit','function enter()','function unload()'])
    assert.ok(source.includes(term),term);
});
test('food collections have working Gutenberg record link patterns',()=>{
  for(const id of [10136,12815,12519,6501,22790,8102,19031,12350,15464,12238,29728,24407,44915,16035])
    assert.ok(source.includes(String(id)),String(id));
  assert.ok(source.includes('https://www.gutenberg.org/ebooks/'));
  assert.ok(source.includes('THE HISTORICAL COOKBOOK GALLERY'));
  assert.ok(source.includes('THE PRESERVATION VAULT'));
  assert.ok(source.includes('THE GLOBAL SPICE EXCHANGE'));
});
test('wing geometry is built on entry rather than immediately',()=>{
  const factory=source.slice(source.indexOf('window.createFoodHistoryWing=function'));
  const beforeReturn=factory.slice(0,factory.indexOf('return {enter,interact'));
  assert.ok(beforeReturn.includes('function activate(){if(!root)build()'));
  assert.ok(beforeReturn.includes('else if(root&&t-lastNeeded>KEEP'));
});
