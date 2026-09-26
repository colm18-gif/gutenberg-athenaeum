const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');

test('the audiobook job matches recordings by Gutenberg id, prefers solo readings and writes chapter lists',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'audiobooks-'));
  fs.mkdirSync(path.join(dir,'scripts'));fs.mkdirSync(path.join(dir,'data'));
  for(const file of ['scripts/audiobooks.mjs','scripts/daily-room.mjs'])fs.copyFileSync(file,path.join(dir,file));
  fs.writeFileSync(path.join(dir,'game.js'),"const books=[\n[345,'Dracula','Bram Stoker','Gothic',90],[84,'Frankenstein','Mary Shelley','Gothic',100],[5,'A Book Nobody Recorded','Nobody','X',1]].map((b,i)=>({id:b[0]}));");
  fs.writeFileSync(path.join(dir,'data/extra-books.js'),"window.ATHENAEUM_EXTRA_BOOKS=[{id:11,title:\"Alice's Adventures in Wonderland\",author:'Lewis Carroll'},{id:950001,title:'Not Gutenberg',author:'X'}];");
  // Fake LibriVox: Dracula has a group reading and a solo one; Frankenstein has only a German reading and a
  // dramatic one listed against its Gutenberg id; Alice is matched by title because no text source is given.
  const catalogue=[
    {id:10,title:'Dracula',language:'English',url_text_source:'http://www.gutenberg.org/etext/345',authors:[{first_name:'Bram',last_name:'Stoker'}],totaltimesecs:55000},
    {id:11,title:'Dracula (version 2)',language:'English',url_text_source:'https://www.gutenberg.org/ebooks/345',authors:[{first_name:'Bram',last_name:'Stoker'}],totaltimesecs:56000},
    {id:20,title:'Frankenstein',language:'German',url_text_source:'http://www.gutenberg.org/etext/84',authors:[{first_name:'Mary',last_name:'Shelley'}]},
    {id:21,title:'Frankenstein (Dramatic Reading)',language:'English',url_text_source:'http://www.gutenberg.org/etext/84',authors:[{first_name:'Mary',last_name:'Shelley'}]},
    {id:30,title:"Alice's Adventures in Wonderland",language:'English',url_text_source:'',authors:[{first_name:'Lewis',last_name:'Carroll'}],totaltimesecs:10000}];
  const sections=id=>id===10?[1,2].map(n=>({section_number:String(n),title:'Chapter '+n,listen_url:`http://www.archive.org/download/dracula/d_${n}_64kb.mp3`,playtime:'1800',readers:[{display_name:n===1?'Ann':'Bob'}]})):id===11?[2,1,3].map(n=>({section_number:String(n),title:'Chapter '+n,listen_url:`http://www.archive.org/download/dracula2/d_${n}_64kb.mp3`,playtime:'00:30:00',readers:[{display_name:'Carol'}]})):[{section_number:'1',title:'Down the Rabbit-Hole',listen_url:'https://archive.org/download/alice/a_1.mp3',playtime:'900',readers:[{display_name:'Dee'}]}];
  const mock=path.join(dir,'mock.mjs');
  fs.writeFileSync(mock,`const catalogue=${JSON.stringify(catalogue)},sections=${sections.toString()};
    globalThis.fetch=async url=>{url=new URL(String(url));const json=body=>({ok:true,status:200,json:async()=>body});
      if(url.searchParams.get('extended')){const id=Number(url.searchParams.get('id'));const book=catalogue.find(b=>b.id===id);return json({books:[{...book,sections:sections(id)}]})}
      const offset=Number(url.searchParams.get('offset')||0);return json({books:offset?[]:catalogue})};`);
  const r=spawnSync(process.execPath,['--import',mock,path.join(dir,'scripts/audiobooks.mjs')],{encoding:'utf8',env:{...process.env,AUDIOBOOKS_PAUSE_MS:'0'}});
  assert.equal(r.status,0,r.stderr+r.stdout);
  const index=vm.runInNewContext(fs.readFileSync(path.join(dir,'data/audiobooks.js'),'utf8')+';window',{window:{}}).ATHENAEUM_AUDIOBOOKS;
  assert.deepEqual(Object.keys(index).sort(),['11','345'],'Frankenstein has no usable English reading; the unrecorded book and non-Gutenberg ids are skipped');
  assert.equal(JSON.stringify(index[345]),JSON.stringify([56000,'Carol',3]),'the solo reading wins over the group one');
  const dracula=JSON.parse(fs.readFileSync(path.join(dir,'data/audio/345.json'),'utf8'));
  assert.deepEqual(dracula.chapters.map(chapter=>chapter.title),['Chapter 1','Chapter 2','Chapter 3'],'chapters are in order');
  assert.match(dracula.chapters[0].url,/^https:\/\//,'chapters stream over https');
  assert.equal(dracula.chapters[0].seconds,1800);
  assert.equal(index[11][1],'Dee','a recording without a text source is matched by title and author');
  assert.match(r.stdout,/4 books: 2 with a recording \(1 matched by title\), 2 without/);
  fs.rmSync(dir,{recursive:true,force:true});
});
