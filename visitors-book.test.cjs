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
