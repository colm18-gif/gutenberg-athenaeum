const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const game=fs.readFileSync('game.js','utf8'),list=fs.readFileSync('data/new-books.js','utf8');
const entries=[...list.matchAll(/^\s*\[(\d+|null),'((?:[^'\\]|\\.)+)','(?:[^'\\]|\\.)+','(?:[^'\\]|\\.)+','([a-z-]+)','((?:[^'\\]|\\.)+)'\]/gm)];

test('The Unwelcome Spines is stocked with banned books',()=>{
  const own=entries.filter(m=>m[3]==='contested'),others=entries.filter(m=>m[3]!=='contested');
  assert(own.length>=20,'enough to fill the north cases');
  for(const [,id,title,,note] of own){
    assert(note.split(/[.!?”](?:\s|$)/).filter(Boolean).length>=2,`${title} has a librarian’s note`);
  }
  assert.match(fs.readFileSync('scripts/new-books.mjs','utf8'),/'contested'/);
});

test('the room shelves its own arrivals first, in three cases, and keeps the old list only as a fallback',()=>{
  assert.match(game,/contestedArrivals=newArrivals\.list\('contested'\)/);
  assert.match(game,/contestedArrivals\.length\?\[\.\.\.contestedAcquisitions,\.\.\.contestedArrivals\]/);
  assert.equal((game.match(/curatedShelf\(contestedBooks\.slice\(/g)||[]).length,3);
  assert.match(game,/curatedShelf\(contestedBooks\.slice\(20,30\),contested\.cx\+contested\.w\/2-\.55,contested\.cz-\.6,-Math\.PI\/2\)/,'the third case stands on the east wall, facing in');
});

test('the door to the Unwelcome Spines is bound in banned books, on both sides', () => {
  const game = fs.readFileSync('game.js', 'utf8'), kit = fs.readFileSync('library-doors.js', 'utf8');
  assert.match(game, /const BOUND_DOOR=\{style:'banned'/);
  assert.match(game, /memoryDoor\(56\.5,-2,'contested'[^\n]+BOUND_DOOR\)/, 'the Restricted Catalogue side');
  assert.match(game, /memoryDoor\(contested\.cx,22,'mainhall'[^\n]+\{style:'banned'/, 'the room side');
  assert.match(kit, /const banned=style==='banned'/);
  assert.match(kit, /if\(banned\)bannedFrame\(group,width,height\)/, 'the frame is built of books');
  assert.match(kit, /leafMaterial=banned\?pagesMap\(\)/, 'the leaf is pasted with pages');
  // The spines carry the room's own books.
  for (const title of ['AREOPAGITICA', 'RIGHTS OF MAN', 'THE DECAMERON', 'NANA', 'SALOME']) assert.ok(kit.includes(`['${title}'`), title);
});

test('the Unwelcome Spines is dressed, and its Milton is Milton', () => {
  const game = fs.readFileSync('game.js', 'utf8'), zlib = require('zlib');
  assert.match(game, /dressContestedRoom\(contested,contestedLight\)/);
  for (const part of ['The brazier', 'Index Librorum Prohibitorum', 'Heinrich Heine, Almansor', 'The censor’s desk']) assert.ok(game.includes(`title:'${part}'`), part);
  const milton = game.match(/const CONTESTED_MILTON='([^\n]+?)';/)[1].replace(/\\'/g, "'");
  const text = zlib.gunzipSync(fs.readFileSync('texts/bundled-gzip/pg608.txt.gz')).toString('utf8').replace(/\s+/g, ' ');
  assert.ok(text.includes(milton), 'Areopagitica');
  assert.match(fs.readFileSync('room-ambience.js', 'utf8'), /contested:\{beds:\[\['fire'/, 'the embers crackle');
});
