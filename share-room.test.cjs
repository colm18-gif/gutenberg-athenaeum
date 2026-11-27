const test=require('node:test'),assert=require('node:assert'),fs=require('fs');
const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),css=fs.readFileSync('styles.css','utf8'),analytics=fs.readFileSync('analytics.js','utf8');
test('a share button stands beside the return-home button and in the pause menu',()=>{
  assert.match(html,/id="touchShare"[^>]*aria-label="Share this room"/);
  assert.match(html,/id="pauseShare"/);
  assert.match(css,/#touchShare\{right:calc\(176px/);
  assert.match(game,/function shareRoom\(\)/);
  assert.match(game,/navigator\.share/);
  assert.match(game,/libraryafterdark\.space\/\$\{key\?'\?room='\+key:''\}/);
  assert.match(analytics,/'Room Shared'/);
});
