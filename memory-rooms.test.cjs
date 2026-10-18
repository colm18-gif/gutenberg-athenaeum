const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const game=fs.readFileSync('game.js','utf8'),list=fs.readFileSync('data/new-books.js','utf8');
const entries=[...list.matchAll(/^\s*\[(\d+|null),'((?:[^'\\]|\\.)+)','(?:[^'\\]|\\.)+','(?:[^'\\]|\\.)+','([a-z-]+)','((?:[^'\\]|\\.)+)'\]/gm)];
const ROOMS={returning:10,quiet:10,unread:10,repository:30};

// The single-copy register shows each book once, and the hidden reading room's shelves, built first, held the same
// books as the four memory rooms below the catalogue, which stood empty. Their stock must be books held nowhere else.
test('the memory rooms below the catalogue are stocked with books no other shelf holds',()=>{
  const elsewhere=[game,...fs.readdirSync('data').filter(f=>f.endsWith('.js')&&!f.startsWith('new-books')&&!f.startsWith('daily-room')).map(f=>fs.readFileSync('data/'+f,'utf8'))].join('\n');
  for(const [room,least] of Object.entries(ROOMS)){
    const own=entries.filter(m=>m[3]===room),others=entries.filter(m=>m[3]!==room);
    assert(own.length>=least,`${room} has ${own.length} books, wants ${least}`);
    for(const [,id,title,,note] of own){
      assert(note.split(/[.!?”](?:\s|$)/).filter(Boolean).length>=2,`${title} has a librarian’s note`);
      assert(!others.some(m=>m[2]===title),`${title} is on no other new-arrivals shelf`);
      const quoted=title.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');assert(!new RegExp(`\\[\\d+,'${quoted}'|title:'${quoted}'`).test(elsewhere),`${title} is in no other catalogue`);
      if(id!=='null')assert(!new RegExp(`\\[${id},'`).test(game)&&!others.some(m=>m[1]===id),`${title} (${id}) is not already in the library`);
    }
    assert.match(fs.readFileSync('scripts/new-books.mjs','utf8'),new RegExp(`'${room}'`));
  }
});

test('each room shelves its own arrivals first, and the Repository’s racks hold distinct books',()=>{
  assert.match(game,/arrivals=newArrivals\.list\(key\)/);
  assert.match(game,/arrivals\.length\?\[\.\.\.acquisitions,\.\.\.arrivals\]/);
  assert.match(game,/slice\(0,key==='repository'\?37:10\)/);
  assert.match(game,/const b=memoryBooks\.repository\[1\+offset\+i\];if\(!b\)continue;/,'no rack repeats a book');
  assert.match(game,/repositoryRack\(147,-29,0\);repositoryRack\(157,-29,9\);repositoryRack\(147,-20,18\);repositoryRack\(157,-20,27\);/);
  assert.match(game,/requestBook=looseBook\(memoryBooks\.repository\[0\]/);
});
