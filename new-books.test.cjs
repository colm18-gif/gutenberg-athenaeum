const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const load=(file,name)=>{const context={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),context);return context.window[name]};
const list=[...load('data/new-books.js','ATHENAEUM_NEW_BOOKS'),...load('data/new-books-wing.js','ATHENAEUM_NEW_BOOKS_WING')];
const inRoom=room=>list.filter(entry=>entry[4]===room);

test('every new book is well formed and brings a librarian’s note',async()=>{
  const {validate,ROOMS}=await import('./scripts/new-books.mjs');
  assert.deepEqual(validate(list),[]);
  for(const [,title,,,room,note] of list){
    assert.ok(ROOMS.includes(room),title);
    // Chinese says in 60 characters what English needs 120 letters for.
    if(note){assert.ok(note.length>=(room==='chinese'?60:120),`${title}: the note is too short`);assert.match(note,/[.!?”»。」]$/,`${title}: the note should end a sentence`)}
  }
  assert.ok(validate([[1,'A','B','C','nowhere','note']]).some(error=>/unknown room/.test(error)));
  assert.ok(validate([[1,'A','B','C','secret','']]).some(error=>/librarian's note/.test(error)));
  assert.ok(validate([[1,'Poems','A. Writer','Poetry','secret','note'],[2,'Poems','B. Poet','Poetry','shelves','note']]).some(error=>/same title/.test(error)),'two books with one title would share one text');
});

test('each room gets as many books as it has room for',()=>{
  assert.equal(inRoom('secret').length,16,'the secret bookcase has four full columns of four');
  assert.ok(inRoom('shelves').length>=22,'enough to replace every repeated book on the general bookcases');
  // The Evening Room holds 10, 10 and 16 books (evening-room.js); these join the ones already there.
  const evening=fs.readFileSync('evening-room.js','utf8'),groups=[...evening.matchAll(/ids:\[([\d,]+)\]/g)].map(m=>m[1].split(',').length);
  assert.match(evening,/ROOM_FOR=\[10,10,16\]/);
  ['evening-quick','evening-hour','evening-evening'].forEach((room,i)=>assert.ok(groups[i]+inRoom(room).length<=[10,10,16][i],room));
  for(const room of ['signal','tide'])assert.ok(inRoom(room).length>=6&&inRoom(room).length<=10,room);
  for(const room of ['learners-1','learners-2','learners-3','learners-4','learners-short'])assert.ok(inRoom(room).length>=2,room);
});

test('words are counted from the story, not the Gutenberg header and licence',async()=>{
  const {countWords}=await import('./scripts/new-books.mjs');
  const text='Title: X\nThe Project Gutenberg eBook\n*** START OF THE PROJECT GUTENBERG EBOOK X ***\nOnce upon a time, there wasn’t much.\n*** END OF THE PROJECT GUTENBERG EBOOK X ***\nLicence words here.';
  assert.equal(countWords(text),7);
});

test('the new books reach the shelves and rooms, and their texts are kept for good',async()=>{
  const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),daily=fs.readFileSync('scripts/daily-room.mjs','utf8');
  assert.match(game,/const newArrivals=\(\(\)=>\{const resolved=window\.ATHENAEUM_NEW_BOOKS_RESOLVED\?\.books/);
  assert.match(game,/secretFill=secret\?newArrivals\.list\('secret'\)/);
  assert.match(game,/nextShelfArrival\(\)\|\|books\[36\+/);
  assert.match(game,/arrivals:\{1:arrivalIds\('learners-1'\)/);
  assert.match(game,/arrivals:\{quick:arrivalIds\('evening-quick'\)/);
  assert.match(game,/arrivals:\{signal:newArrivals\.list\('signal'\),tide:newArrivals\.list\('tide'\)\}/);
  assert.match(fs.readFileSync('night-train.js','utf8'),/THE STATION SHELF/);
  assert.match(fs.readFileSync('learners-room.js','utf8'),/arrivals\[i\+1\]/);
  assert.ok(html.indexOf("startupScript('data/new-books.js')")<html.indexOf("startupScript('game.js')"));
  assert.match(html,/startupScript\('data\/new-books-resolved\.js'\)/);
  assert.match(daily,/keptForGood\(\)/);
  const {resolvedKey}=await import('./scripts/new-books.mjs');
  const resolved=load('data/new-books-resolved.js','ATHENAEUM_NEW_BOOKS_RESOLVED');
  assert.ok(resolved&&typeof resolved.books==='object'&&Array.isArray(resolved.missing));
  for(const [title,book] of Object.entries(resolved.books)){
    assert.ok(list.some(entry=>resolvedKey(entry[1],entry[4])===title),`${title} is not in data/new-books.js`);
    assert.ok(fs.existsSync(`texts/bundled-gzip/pg${book.id}.txt.gz`)||fs.existsSync(`texts/pg${book.id}.txt`),`${title}: its text should be bundled`);
    assert.ok(book.words>0,`${title}: words`);
  }
});
