const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');

// Project Gutenberg ids are assigned by Gutenberg, so they are unique per work.
// Ids from 900000 upward are assigned by this library for books from other sources.
// Two different books must never share one: notes, covers, local editions and reading
// progress are all stored by id, so a clash silently mixes the two books together.
function everyCataloguedBook(){
  const window={ATHENAEUM_EXTRA_NOTES:{},ATHENAEUM_COVER_DESIGNS:{}};
  for(const file of fs.readdirSync('data').filter(name=>name.endsWith('.js')).sort())vm.runInNewContext(fs.readFileSync(`data/${file}`,'utf8'),{window,Math});
  const found=[];
  const add=(source,id,title)=>found.push({source,id:Number(id),title:String(title||'')});
  for(const [name,value] of Object.entries(window)){
    if(!Array.isArray(value))continue;
    for(const entry of value){
      if(Array.isArray(entry))add(name,entry[0],entry[1]);
      else if(entry&&typeof entry==='object'&&'id'in entry)add(name,entry.id,entry.title);
    }
  }
  if(window.ATHENAEUM_FOG_BOOK)add('ATHENAEUM_FOG_BOOK',window.ATHENAEUM_FOG_BOOK.id,window.ATHENAEUM_FOG_BOOK.title);
  const game=fs.readFileSync('game.js','utf8');let raw=game.slice(game.indexOf('const books=')+12);raw=raw.slice(0,raw.indexOf('].map')+1);
  for(const entry of vm.runInNewContext(raw))add('game.js books',entry[0],entry[1]);
  return found;
}

test('library-assigned ids (900000+) each belong to exactly one book',()=>{
  const byId=new Map();
  for(const book of everyCataloguedBook().filter(book=>book.id>=900000)){
    const titles=byId.get(book.id)||new Map();titles.set(book.title.toLowerCase(),book.source);byId.set(book.id,titles);
  }
  assert(byId.size>=10,'expected the open-access and fog books to be found');
  for(const [id,titles] of byId)assert.equal(titles.size,1,`id ${id} is shared by: ${[...titles].map(([title,source])=>`${title} (${source})`).join(', ')}`);
});

test('each library-assigned id has its own local edition of the right book',()=>{
  const window={ATHENAEUM_EXTRA_NOTES:{},ATHENAEUM_COVER_DESIGNS:{}};
  for(const file of ['data/open-access-catalog.js','data/lost-in-the-fog.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),{window,Math});
  const books=window.ATHENAEUM_OPEN_ACCESS_BOOKS.concat(window.ATHENAEUM_FOG_BOOK).filter(book=>book.textPath);
  assert(books.length>=10);
  for(const book of books){
    const local={window:{}};vm.runInNewContext(fs.readFileSync(`texts/local/pg${book.id}.js`,'utf8'),local);
    const text=local.window.ATHENAEUM_LOCAL_TEXTS[book.id]||'';
    assert.equal(text.replace(/\r\n/g,'\n'),fs.readFileSync(book.textPath,'utf8').replace(/\r\n/g,'\n'),`texts/local/pg${book.id}.js does not match ${book.textPath} (${book.title})`);
  }
});

test('the local-book build refuses an open-access id already used by Lost in the Fog',()=>{
  const script=fs.readFileSync('build-local-books.mjs','utf8');
  assert.match(script,/readFile\(path\.resolve\("data\/lost-in-the-fog\.js"\), "utf8"\)/);
  assert.match(script,/seenIds\.add\(fogId\)/);
  assert(script.indexOf('seenIds.add(fogId)')<script.indexOf('for (const record of catalogue.books'),'the fog id must be reserved before catalogue records are checked');
});
