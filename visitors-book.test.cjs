const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const worker=()=>import('./worker/visitors-book/worker.js');
const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),workflow=fs.readFileSync('.github/workflows/visitors-book.yml','utf8');
function client(fetchImpl,{language='en-IE',day='2026-09-27'}={}){
  const store=new Map(),context={window:{},Intl,Date,JSON,Promise,setTimeout};vm.runInNewContext(fs.readFileSync('visitors-book.js','utf8'),context);
  const books=[{id:11,title:'Alice’s Adventures in Wonderland'},{id:46,title:'A Christmas Carol'}],signedNotes=[];
  const vb=context.window.createVisitorsBook({endpoint:'https://vb.test/',books:()=>books,fetchImpl,language:()=>language,today:()=>new Date(day+'T20:00:00Z'),
    storage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},onSigned:e=>signedNotes.push(e)});
  return {vb,store,signedNotes,rules:context.window.ATHENAEUM_VISITORS_BOOK_RULES};
}

test('a signature is only a name, a country, a book and a line from the list',async()=>{
  const {validate,cleanName,PHRASES}=await worker();
  for(const ok of ['Aoife','Dickens','Fanny','Yoshitaka','Draper','Jean-Luc','Ó Súilleabháin','F. Scott','李','Ngozi'])assert.equal(cleanName(ok),ok,ok);
  for(const bad of ['','fuck','Sh1t head','x@y.com','12','https://spam','A'.repeat(25),'  ','Mr Wanker'])assert.equal(cleanName(bad),null,bad);
  assert.deepEqual(validate({name:'Aoife',country:'ie',book:11,phrase:0}).entry,{n:'Aoife',c:'IE',b:11,p:0});
  assert.match(validate({name:'Aoife',country:'XX',book:11,phrase:0}).error,/country/);
  assert.match(validate({name:'Aoife',country:'IE',book:11,phrase:PHRASES.length}).error,/line/);
  assert.match(validate({name:'Aoife',country:'IE',book:-1,phrase:0}).error,/book/);
});

test('the service keeps signatures, stops repeat signing and only lets the owner remove one',async()=>{
  const {handle}=await worker(),kv=new Map(),env={BOOK:{get:async k=>kv.get(k)??null,put:async(k,v)=>{kv.set(k,v)}},ADMIN_TOKEN:'secret'};
  const req=(method,path,body,headers={})=>new Request('https://vb.test'+path,{method,headers:{Origin:'https://libraryafterdark.space','CF-Connecting-IP':'1.1.1.1',...headers},body:body&&JSON.stringify(body)});
  assert.equal((await handle(req('POST','/sign',{name:'Aoife',country:'IE',book:11,phrase:1}),env)).status,201);
  assert.equal((await handle(req('POST','/sign',{name:'Aoife',country:'IE',book:11,phrase:1}),env)).status,429,'once every ten minutes');
  assert.equal((await handle(req('POST','/sign',{name:'Kofi',country:'GH',book:0,phrase:5},{'CF-Connecting-IP':'2.2.2.2'}),env)).status,201);
  assert.equal((await handle(req('POST','/sign',{name:'Spam',country:'GH',book:0,phrase:5},{Origin:'https://elsewhere.example','CF-Connecting-IP':'3.3.3.3'}),env)).status,403,'only from the library');
  const got=await (await handle(req('GET','/entries'),env)).json();assert.equal(got.count,2);assert.deepEqual(got.entries.map(e=>e.n),['Kofi','Aoife']);
  assert(![...kv.keys()].some(k=>k.includes('1.1.1.1')),'addresses are never stored');
  assert.equal((await handle(req('DELETE','/entries/'+got.entries[0].id),env)).status,401);
  assert.equal((await handle(req('DELETE','/entries/'+got.entries[0].id,null,{Authorization:'Bearer secret'}),env)).status,200);
  assert.equal((await (await handle(req('GET','/entries'),env)).json()).count,1);
});

test('the library and the service agree on the countries and the lines',async()=>{
  const w=await worker(),{rules}=client(async()=>({ok:true,json:async()=>({entries:[]})}));
  assert.deepEqual([...rules.PHRASES],w.PHRASES);assert.deepEqual([...rules.COUNTRIES],w.COUNTRIES);assert(w.COUNTRIES.length>=240);
});

test('signing from the library sends only the chosen values, and remembers it for the night',async()=>{
  const sent=[];const fetchImpl=async(url,init)=>{if(init?.method==='POST'){const body=JSON.parse(init.body);sent.push({url,body});return {ok:true,json:async()=>({entry:{id:'abc12345',n:body.name,c:body.country,b:body.book,p:body.phrase,d:'2026-09-27'}})}}
    return {ok:true,json:async()=>({entries:[{id:'x1',n:'Kofi',c:'GH',b:46,p:5,d:'2026-09-26'}]})}};
  const {vb,store,signedNotes}=client(fetchImpl);
  const listed=await vb.refresh();assert.equal(listed[0].name,'Kofi');assert.equal(listed[0].place,'Ghana');assert.equal(listed[0].book,'A Christmas Carol');assert.equal(listed[0].note,'Greetings from a fellow reader.');
  assert.match((await vb.sign({name:'',country:'IE',phrase:0})).error,/name/);
  assert.match((await vb.sign({name:'Aoife',country:'IE',book:'Not a real book',phrase:0})).error,/book/);
  const done=await vb.sign({name:'  Aoife ',country:'IE',book:'alice’s adventures in wonderland',phrase:'2'});
  assert.equal(done.entry.name,'Aoife');assert.deepEqual(sent[0].body,{name:'Aoife',country:'IE',book:11,phrase:2});assert.equal(sent[0].url,'https://vb.test/sign');
  assert.equal(vb.entries[0].name,'Aoife');assert.equal(signedNotes.length,1);assert.equal(store.get('athenaeum-visitors-signed'),'2026-09-27');
  const refused=client(async()=>({ok:false,json:async()=>({error:'The ink is still wet on your last signature.'})}));
  assert.match((await refused.vb.sign({name:'Aoife',country:'IE',phrase:0})).error,/ink is still wet/);
});

test('the real book only appears once the service is set up, and is wired into the game',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  for(const f of ['data/visitors-book-config.js','visitors-book.js'])assert(order.indexOf(f)>=0&&order.indexOf(f)<order.indexOf('game.js'));
  const config={window:{}};vm.runInNewContext(fs.readFileSync('data/visitors-book-config.js','utf8'),config);assert.equal(typeof config.window.ATHENAEUM_VISITORS_BOOK.endpoint,'string');
  assert.match(game,/const visitorsBook=window\.ATHENAEUM_VISITORS_BOOK\?\.endpoint\?window\.createVisitorsBook\?\.\(/);
  assert.match(game,/gameActive=function\(\)\{return !visitorsBook\.isOpen&&preBookActive\(\)\}/);
  assert.match(workflow,/CLOUDFLARE_API_TOKEN/);assert.match(workflow,/wrangler@4 deploy/);assert.match(workflow,/data\/visitors-book-config\.js/);
});

test('reading cards: a code of four words, bookmarks merged by the later visit, and only from the library',async()=>{
  const {handle,cleanCode,cleanBooks,mergeBooks,CARD_WORDS}=await worker(),kv=new Map(),env={BOOK:{get:async k=>kv.get(k)??null,put:async(k,v)=>{kv.set(k,v)}}};
  const req=(method,path,body,headers={})=>new Request('https://vb.test'+path,{method,headers:{Origin:'https://libraryafterdark.space','CF-Connecting-IP':'1.1.1.1',...headers},body:body&&JSON.stringify(body)});
  assert(CARD_WORDS.length>=100&&new Set(CARD_WORDS).size===CARD_WORDS.length);
  // The card is made an hour before the visits below, whatever today's date (it was made "now", and stopped saving once now passed them).
  const t0=Date.parse('2026-10-01T10:00:00Z');
  const made=await handle(req('POST','/card'),env,new Date(t0-3600000));assert.equal(made.status,201);const {code}=await made.json();
  assert.match(code,/^[a-z]+(-[a-z]+){3}-\d{2}$/);assert.equal(cleanCode(code.toUpperCase().replace(/-/g,' ')),code,'typed in capitals or with spaces');
  assert(![...kv.keys()].some(k=>k.includes(code)),'the code itself is never stored');
  assert.equal((await handle(req('POST','/card'),env)).status,429,'one card a minute from one place');
  assert.equal((await handle(req('POST','/card',null,{Origin:'https://elsewhere.example','CF-Connecting-IP':'9.9.9.9'}),env)).status,403);
  let r=await handle(req('PUT','/card/'+code,{books:{345:{p:.4,t:t0},11:{p:.9,t:t0}}}),env,new Date(t0+60000));assert.equal(r.status,200);assert.equal((await r.json()).saved,true);
  // A second device, which read Dracula later but Alice earlier: each book keeps its later visit.
  r=await handle(req('PUT','/card/'+code,{books:{345:{p:.6,t:t0+5000},11:{p:.2,t:t0-5000},1342:{p:.1,t:t0}}}),env,new Date(t0+120000));
  const books=(await r.json()).books;assert.deepEqual(books[345],{p:.6,t:t0+5000});assert.deepEqual(books[11],{p:.9,t:t0});assert.deepEqual(books[1342],{p:.1,t:t0});
  assert.deepEqual((await (await handle(req('GET','/card/'+code,null,{Origin:''}),env)).json()).books,books,'read from anywhere with the code');
  assert.equal((await handle(req('GET','/card/oak-oak-oak-oak-00'),env)).status,404);assert.equal((await handle(req('GET','/card/not-a-code'),env)).status,400);
  assert.equal((await handle(req('PUT','/card/'+code,{books:{2:{p:.5,t:t0+9e5}}},{Origin:'https://elsewhere.example'}),env)).status,403);
  assert.deepEqual(cleanBooks({abc:{p:.5,t:1},5:{p:2,t:1},6:{p:.5,t:'x'},7:{p:.25,t:3,extra:'dropped'}}),{7:{p:.25,t:3}},'only book numbers, fractions and times');
  assert.equal(Object.keys(mergeBooks({},Object.fromEntries(Array.from({length:700},(_,i)=>[i+1,{p:.5,t:i+1}])))).length,600,'at most 600 books, the most recent kept');
});

test('the library and the plain reader keep their bookmarks on the card',async()=>{
  const store=new Map(),calls=[],card={books:{}};
  const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
  const fetchImpl=async(url,opts)=>{calls.push([opts.method,url]);const body=opts.body?JSON.parse(opts.body):null;
    if(opts.method==='POST')return new Response(JSON.stringify({code:'oak-wren-harp-pine-07'}),{status:201});
    if(opts.method==='PUT'){for(const [id,v] of Object.entries(body.books))if(!card.books[id]||v.t>card.books[id].t)card.books[id]=v}
    return new Response(JSON.stringify({books:card.books}),{status:200})};
  const proxy=new Proxy(localStorage,{ownKeys:()=>[...store.keys()],getOwnPropertyDescriptor:()=>({enumerable:true,configurable:true})});
  const context={window:{ATHENAEUM_VISITORS_BOOK:{endpoint:'https://vb.test/'}},localStorage:proxy,fetch:fetchImpl,Response,JSON,Object,Number,String,Date,setInterval:()=>1,addEventListener:()=>{},document:{visibilityState:'visible'}};
  vm.runInNewContext(fs.readFileSync('reading-card.js','utf8'),context);const c=context.window.AthenaeumCard;
  store.set('athenaeum-progress-345',JSON.stringify({p:.3,n:200,t:1000}));
  assert.equal(await c.make(),'oak-wren-harp-pine-07');assert.deepEqual(card.books[345],{p:.3,t:1000},'this device’s bookmark goes to the card');
  card.books[11]={p:.5,t:2000};card.books[345]={p:.7,t:3000};const result=await c.sync();assert.equal(result.pulled,2);
  assert.deepEqual(JSON.parse(store.get('athenaeum-progress-345')),{p:.7,n:200,t:3000},'the later visit from another device wins, keeping this device’s page count');
  assert.equal(JSON.parse(store.get('athenaeum-progress-11')).p,.5);
  const before=calls.length;await c.sync();assert.equal(calls.at(-1)[0],'GET','nothing new to send, so it only asks');assert.equal(calls.length,before+1);
  await assert.rejects(c.use('not a code'),/four words and two digits/);c.forget();assert.equal(c.code,null);
  const game=fs.readFileSync('game.js','utf8'),page=fs.readFileSync('index.html','utf8');
  assert.match(game,/JSON\.stringify\(\{p:prog,n:book\.pages\.length,t:Date\.now\(\)\}\)/,'the 3D reader stamps each bookmark with the time');
  assert.match(page,/startupScript\('reading-card\.js'\)/);assert.match(page,/<section class="card-sync" id="cardSync" hidden>/);
  assert.match(game,/e\.code==='KeyO'&&e\.target\?\.type!=='text'/,'typing an o in the code does not close the settings');
});
