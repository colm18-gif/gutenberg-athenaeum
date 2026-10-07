const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const game=fs.readFileSync('game.js','utf8'),list=fs.readFileSync('data/new-books.js','utf8');
const entries=[...list.matchAll(/^\s*\[(\d+|null),'((?:[^'\\]|\\.)+)','(?:[^'\\]|\\.)+','(?:[^'\\]|\\.)+','([a-z-]+)','((?:[^'\\]|\\.)+)'\]/gm)];

// The single-copy register shows each book once, and the Restricted Catalogue's copies beat this room's, so the room
// stood nearly empty when its books were the ones on those shelves. Its stock must be books held nowhere else.
test('The Unwelcome Spines is stocked with banned books that stand on no other shelf',()=>{
  const own=entries.filter(m=>m[3]==='contested'),others=entries.filter(m=>m[3]!=='contested');
  assert(own.length>=20,'enough to fill the north cases');
  const elsewhere=[game,...fs.readdirSync('data').filter(f=>f.endsWith('.js')&&!f.startsWith('new-books')&&!f.startsWith('daily-room')).map(f=>fs.readFileSync('data/'+f,'utf8'))].join('\n');
  for(const [,id,title,,note] of own){
    assert(note.split(/[.!?”](?:\s|$)/).filter(Boolean).length>=2,`${title} has a librarian’s note`);
    assert(!others.some(m=>m[2]===title),`${title} is on no other new-arrivals shelf`);
    const quoted=title.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');assert(!new RegExp(`\\[\\d+,'${quoted}'|title:'${quoted}'`).test(elsewhere),`${title} is in no other catalogue`);
    if(id!=='null')assert(!new RegExp(`\\[${id},'`).test(game)&&!others.some(m=>m[1]===id),`${title} (${id}) is not already in the library`);
  }
  assert.match(fs.readFileSync('scripts/new-books.mjs','utf8'),/'contested'/);
});

test('the room shelves its own arrivals first, in three cases, and keeps the old list only as a fallback',()=>{
  assert.match(game,/contestedArrivals=newArrivals\.list\('contested'\)/);
  assert.match(game,/contestedArrivals\.length\?\[\.\.\.contestedAcquisitions,\.\.\.contestedArrivals\]/);
  assert.equal((game.match(/curatedShelf\(contestedBooks\.slice\(/g)||[]).length,3);
  assert.match(game,/curatedShelf\(contestedBooks\.slice\(20,30\),contested\.cx\+contested\.w\/2-\.55,contested\.cz-\.6,-Math\.PI\/2\)/,'the third case stands on the east wall, facing in');
});
