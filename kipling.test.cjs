const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('kipling-shelf.js','utf8'),game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
const load=(file,name)=>{const context={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),context);return context.window[name]};

test('the Kipling bookcase holds books of his that no other shelf holds, and has room for them all',()=>{
  const list=[...load('data/new-books.js','ATHENAEUM_NEW_BOOKS'),...load('data/new-books-wing.js','ATHENAEUM_NEW_BOOKS_WING')],shelf=list.filter(e=>e[4]==='kipling');
  assert.ok(shelf.length>=8&&shelf.length<=12,'four shelves of three');
  for(const [,title,author] of shelf){assert.equal(author,'Rudyard Kipling');assert.equal(list.filter(e=>e[1]===title).length,1,`${title} is on one shelf only`)}
  const elsewhere=[game,...['data/curious-rooms-books.js','data/daily-rooms.js'].map(f=>fs.readFileSync(f,'utf8'))].join('\n');
  for(const [,title] of shelf)assert.ok(!elsewhere.includes(`'${title}'`),`${title} is not already in the library`);
});

test('the case stands clear of the column, the corner and the hidden door',()=>{
  const c=Object.fromEntries([...source.match(/const CASE=\{([^}]*)\}/)[1].matchAll(/(\w+):(-?[\d.]+)/g)].map(m=>[m[1],Number(m[2])]));
  assert.ok(c.x+c.d/2<=-18.75+c.d+.01,'its back is against the west wall');
  assert.ok(c.z-c.w/2>=27.7,'clear of the column at (-17, 27)');assert.ok(c.z+c.w/2<=30.4,'clear of the south wall');
});

test('the library wires the Kipling bookcase in, before game.js, with a link straight to it',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert.ok(order.indexOf('kipling-shelf.js')>-1&&order.indexOf('kipling-shelf.js')<order.indexOf('game.js'));
  assert.match(game,/const kiplingShelf=window\.createKiplingShelf\?\.\(\{[^}]*books:newArrivals\.list\('kipling'\)/);
  assert.match(game,/if\(focus&&!selected&&kiplingShelf\.interact\(focus\)\)/);
  assert.match(game,/kipling:\(\)=>moveReaderTo\(/);
});
