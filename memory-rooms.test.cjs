const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const game=fs.readFileSync('game.js','utf8'),list=fs.readFileSync('data/new-books.js','utf8');
const entries=[...list.matchAll(/^\s*\[(\d+|null),'((?:[^'\\]|\\.)+)','(?:[^'\\]|\\.)+','(?:[^'\\]|\\.)+','([a-z-]+)','((?:[^'\\]|\\.)+)'\]/gm)];
const ROOMS={returning:10,quiet:10,unread:10,repository:30};

test('the memory rooms below the catalogue are stocked',()=>{
  for(const [room,least] of Object.entries(ROOMS)){
    const own=entries.filter(m=>m[3]===room),others=entries.filter(m=>m[3]!==room);
    assert(own.length>=least,`${room} has ${own.length} books, wants ${least}`);
    for(const [,id,title,,note] of own){
      assert(note.split(/[.!?”](?:\s|$)/).filter(Boolean).length>=2,`${title} has a librarian’s note`);
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

// Oliver Onions died in 1961: his books are public domain in the US but in copyright in Ireland and the EU until 2032.
// Ray Russell of Tartarus Press pointed this out, and Widdershins left The Longer Silence for Freeman's stories.
test('no book by Oliver Onions is on the shelves',()=>{
  const all=[game,...fs.readdirSync('data').filter(f=>f.endsWith('.js')).map(f=>fs.readFileSync('data/'+f,'utf8'))].join('\n');
  assert.doesNotMatch(all,/Oliver Onions|Widdershins/);
  assert(!fs.existsSync('texts/bundled-gzip/pg14168.txt.gz'));
});
