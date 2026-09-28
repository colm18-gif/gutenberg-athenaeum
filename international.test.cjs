const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');

const wing=fs.readFileSync('international-wing.js','utf8'),game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
const load=(file,name)=>{const c={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),c);return c.window[name]};
const shelves=[...load('data/new-books.js','ATHENAEUM_NEW_BOOKS'),...load('data/new-books-wing.js','ATHENAEUM_NEW_BOOKS_WING')],spanish=shelves.filter(entry=>entry[4]==='spanish'),portuguese=shelves.filter(entry=>entry[4]==='portuguese');

test('the Spanish Reading Room has its classics, each with a note in Spanish',()=>{
  assert.ok(spanish.length>=40,`${spanish.length} Spanish books`);
  assert.equal(new Set(spanish.map(entry=>entry[1])).size,spanish.length,'each title once');
  for(const [,title,,,,note] of spanish){
    assert.ok(note&&note.length>=80,`${title} needs a librarian’s note`);
    assert.match(note,/\b(el|la|los|las|de|que|en|un|una)\b/,`${title}: the note should be in Spanish`);
    assert.doesNotMatch(note,/\b(the|and|which|with)\b/i,`${title}: the note should be in Spanish`);
  }
  // There is a place on the racks for every book (ten across three tiers on the north wall, six on the west).
  assert.match(wing,/for\(let row=0;row<3;row\+\+\)for\(let i=0;i<10;i\+\+\)/);assert.match(wing,/for\(let row=0;row<3;row\+\+\)for\(let i=0;i<6;i\+\+\)/);
  assert.ok(spanish.length<=48,'more books than places on the racks');
});

test('the Portuguese Reading Room has its classics, each with a note in Portuguese',async()=>{
  const {ROOMS,ROOM_LANGUAGES}=await import('./scripts/new-books.mjs');assert.ok(ROOMS.includes('portuguese'));assert.equal(ROOM_LANGUAGES.portuguese,'pt');
  assert.ok(portuguese.length>=35&&portuguese.length<=48,`${portuguese.length} Portuguese books`);
  assert.equal(new Set(portuguese.map(entry=>entry[1])).size,portuguese.length,'each title once');
  for(const [id,title,,,,note] of portuguese){
    assert.ok(Number.isInteger(id),`${title}: give its number from Gutenberg's catalogue`);
    assert.ok(note&&note.length>=80,`${title} needs a librarian’s note`);
    assert.match(note,/\b(o|a|os|as|de|que|em|um|uma|do|da)\b/,`${title}: the note should be in Portuguese`);
    assert.doesNotMatch(note,/\b(the|and|which|with)\b/i,`${title}: the note should be in Portuguese`);
  }
  // Titles are shared with no other Portuguese book: data/new-books-resolved.js is keyed by title and language.
  for(const [,title,,,room] of shelves)if(room!=='portuguese')assert.ok(!portuguese.some(entry=>entry[1]===title),title);
});

test('the pipeline looks for Spanish books in Spanish, and counts accented words whole',async()=>{
  const {ROOMS,ROOM_LANGUAGES,countWords}=await import('./scripts/new-books.mjs');
  assert.ok(ROOMS.includes('spanish'));assert.equal(ROOM_LANGUAGES.spanish,'es');
  assert.equal(countWords('*** START OF THE PROJECT GUTENBERG EBOOK X ***\nLa canción del pirata, ¡qué alegría!\n*** END OF THE PROJECT GUTENBERG EBOOK X ***'),6);
  const newBooks=fs.readFileSync('scripts/new-books.mjs','utf8'),daily=fs.readFileSync('scripts/daily-room.mjs','utf8');
  assert.match(newBooks,/const language=ROOM_LANGUAGES\[room\]\|\|'en'/);assert.match(newBooks,/\{language\}\)/);
  // A translation cannot stand in for the Spanish text: the text's own Language line must say Spanish.
  const {textMatches}=await import('./scripts/daily-room.mjs'),head=lang=>`Title: Marianela\nAuthor: Benito Pérez Galdós\nLanguage: ${lang}\n`;
  assert.ok(textMatches(head('Spanish'),'Marianela','Benito Pérez Galdós','es'));assert.ok(!textMatches(head('English'),'Marianela','Benito Pérez Galdós','es'));assert.ok(textMatches(head('English'),'Marianela','Benito Pérez Galdós'));
  assert.match(daily,/gutendex\.com\/books\?languages=\$\{language\}/);
  const {authorMatches}=await import('./scripts/daily-room.mjs');assert.ok(authorMatches('Anónimo','Anonymous'));
  assert.match(fs.readFileSync('.github/workflows/new-books.yml','utf8'),/branches: \[main, 'claude\/\*\*'\]/);
});

test('the International Wing is a room behind its own door, built only when needed',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert.ok(order.indexOf('international-wing.js')>-1&&order.indexOf('international-wing.js')<order.indexOf('game.js'));
  assert.match(wing,/const DOOR=\{x:8\.6,z:30\.45,yaw:Math\.PI\}/,'on the Grand Hall’s south wall, beside the visitors’ book');
  // Well away from the other rooms behind doors (all at x -330).
  assert.match(wing,/spanish:\{cx:-410,cz:100,w:24,d:15,h:6,language:'es'/);assert.match(wing,/portuguese:\{cx:-410,cz:132,w:24,d:15,h:6,language:'pt'/);
  // Each room is built on approach and freed on its own; the wing's two lamps follow the reader instead of multiplying.
  assert.match(wing,/if\(key!==here&&t-lastNeeded\[key\]>KEEP&&!isHolding\(\)/);assert.match(wing,/function placeLamps\(key\)\{\s*if\(!lamps\)/);
  assert.doesNotMatch(wing.slice(wing.indexOf('function buildRoom'),wing.indexOf('function placeLamps')),/PointLight/,'rooms borrow the wing’s lamps');
  assert.match(wing,/type:'intl-go',room:'portuguese'/);assert.match(wing,/中文閱覽室/);
  assert.match(game,/const internationalWing=window\.createInternationalWing\?\.\(/);
  assert.match(game,/arrivals:room=>newArrivals\.list\(room\)/);
  assert.match(game,/if\(internationalWing\?\.contains\(x,z\)\)return 'international-wing';/);
  assert.match(game,/\['international-wing','The International Wing'\]/);
  assert.match(game,/internationalWing\?\.update\(t\)/);
  assert.match(game,/'international-wing':internationalWing&&\(\(\)=>enterWing\('spanish'\)\),'portuguese-room':internationalWing&&\(\(\)=>enterWing\('portuguese'\)\)/);
  assert.match(game,/pt:'portuguese-room',portuguese:'portuguese-room'/);
  assert.match(game,/spanish:'international-wing',espanol:'international-wing',es:'international-wing'/);
  assert.match(fs.readFileSync('room-ambience.js','utf8'),/'international-wing':\{beds:/);
  // A link into the wing is greeted in Spanish on the entry screen.
  assert.match(html,/rooms:\['es','spanish','espanol','español','international-wing','international'\]/);assert.match(html,/rooms:\['pt','portuguese','portugues','português','portuguese-room'\]/);
  assert.match(html,/enter:'Entrar en la biblioteca'/);assert.match(html,/enter:'Entrar na biblioteca'/);assert.match(html,/<a href="\/es\/">Libros en español<\/a>/);
});

test('Spanish books are known to be Spanish: word help steps aside, and their pages are in Spanish',()=>{
  assert.match(game,/ROOM_LANGUAGES=\{spanish:'es',portuguese:'pt'[,}]/);assert.match(game,/if\(ROOM_LANGUAGES\[room\]\)book\.language=ROOM_LANGUAGES\[room\]/);
  const help=fs.readFileSync('word-help.js','utf8');
  assert.match(help,/function enabled\(\)\{return !foreign&&/);assert.match(help,/foreign=!!book\?\.language&&book\.language!=='en'/);
  const out=fs.mkdtempSync(path.join(os.tmpdir(),'intl-pages-'));
  execFileSync(process.execPath,['scripts/book-pages.mjs'],{env:{...process.env,OUT:out}});
  const landing=fs.readFileSync(path.join(out,'es/index.html'),'utf8');
  assert.match(landing,/<html lang="es">/);assert.match(landing,/<h1>Libros en español<\/h1>/);assert.match(landing,/href="\/\?room=international-wing"/);
  assert.match(fs.readFileSync(path.join(out,'sitemap.xml'),'utf8'),/<loc>https:\/\/libraryafterdark\.space\/es\/<\/loc>/);
  assert.equal(fs.readFileSync('es/index.html','utf8'),landing,'run: node scripts/book-pages.mjs');
  const pt=fs.readFileSync(path.join(out,'pt/index.html'),'utf8');
  assert.match(pt,/<html lang="pt">/);assert.match(pt,/<h1>Livros em português<\/h1>/);assert.match(pt,/href="\/\?room=portuguese-room"/);
  assert.equal(fs.readFileSync('pt/index.html','utf8'),pt,'run: node scripts/book-pages.mjs');
  const resolved=load('data/new-books-resolved.js','ATHENAEUM_NEW_BOOKS_RESOLVED')?.books||{};
  const found=spanish.map(entry=>resolved[`${entry[1]} [es]`]).find(Boolean);
  if(found){
    const page=fs.readdirSync(path.join(out,'book')).find(f=>f.startsWith(`${found.id}-`)),text=fs.readFileSync(path.join(out,'book',page),'utf8');
    assert.match(text,/<html lang="es">/);assert.match(text,/<cite>La bibliotecaria<\/cite>/);assert.match(text,/"inLanguage":"es"/);
    assert.match(text,/<a href="\/\?room=international-wing">El ala internacional: Sala de lectura en español<\/a>/);assert.doesNotMatch(text,/<p class="shelf">(Society|Comedy|Poetry|History)<\/p>/);
  }
});

test('the Chinese Reading Room: classics in Chinese behind the red door, matched and counted by the character',async()=>{
  const chinese=shelves.filter(entry=>entry[4]==='chinese');
  const {ROOMS,ROOM_LANGUAGES,countWords}=await import('./scripts/new-books.mjs');assert.ok(ROOMS.includes('chinese'));assert.equal(ROOM_LANGUAGES.chinese,'zh');
  assert.ok(chinese.length>=35&&chinese.length<=48,`${chinese.length} Chinese books`);
  assert.equal(new Set(chinese.map(entry=>entry[1])).size,chinese.length,'each title once');
  for(const [id,title,author,,,note] of chinese){
    assert.ok(Number.isInteger(id),`${title}: give its number from Gutenberg's catalogue`);
    assert.match(author,/^\p{Script=Han}+ \([A-Za-z' ]+\)$/u,`${title}: write the author as 曹雪芹 (Cao Xueqin), so the pinyin in the text's header can be checked`);
    assert.ok(note&&note.length>=40,`${title} needs a librarian’s note`);assert.match(note,/[。」]$/,`${title}: the note should be in Chinese`);
    assert.doesNotMatch(note,/[简这说书们对]/,`${title}: the note should be in traditional characters`);
  }
  const {textMatches}=await import('./scripts/daily-room.mjs'),head=(title,author,lang)=>`Title: ${title}\nAuthor: ${author}\nLanguage: ${lang}\n`;
  assert.ok(textMatches(head('紅樓夢','Xueqin Cao','Chinese'),'紅樓夢','曹雪芹 (Cao Xueqin)','zh'));
  assert.ok(!textMatches(head('紅樓夢','Xueqin Cao','English'),'紅樓夢','曹雪芹 (Cao Xueqin)','zh'),'a translation is not the text');
  assert.ok(!textMatches(head('三國志演義','Guanzhong Luo','Chinese'),'紅樓夢','曹雪芹 (Cao Xueqin)','zh'));
  assert.ok(!textMatches(head('紅樓夢','Guanzhong Luo','Chinese'),'紅樓夢','曹雪芹 (Cao Xueqin)','zh'));
  assert.equal(countWords('*** START OF THE PROJECT GUTENBERG EBOOK X ***\n滿紙荒唐言，一把辛酸淚。\n*** END OF THE PROJECT GUTENBERG EBOOK X ***'),10,'Chinese is counted by the character');
  // The red door in the Spanish room opens now, onto a room of its own.
  assert.match(wing,/chinese:\{cx:-470,cz:100,w:24,d:15,h:6,language:'zh'/);assert.match(wing,/type:'intl-go',room:'chinese'/);assert.doesNotMatch(wing,/intl-coming/);
  assert.match(game,/ROOM_LANGUAGES=\{spanish:'es',portuguese:'pt',chinese:'zh'[,}]/);
  assert.match(game,/zh:'chinese-room',chinese:'chinese-room'/);assert.match(game,/'chinese-room':internationalWing&&\(\(\)=>enterWing\('chinese'\)\)/);
  // The reader breaks Chinese lines between characters, since there are no spaces to break at.
  assert.match(game,/if\(CJK_CHAR\.test\(paragraph\)\)/);
  assert.match(html,/rooms:\['zh','chinese','zhongwen','chinese-room'\]/);assert.match(html,/enter:'進入圖書館'/);
  const out=fs.mkdtempSync(path.join(os.tmpdir(),'zh-pages-'));
  execFileSync(process.execPath,['scripts/book-pages.mjs'],{env:{...process.env,OUT:out}});
  const zh=fs.readFileSync(path.join(out,'zh/index.html'),'utf8');
  assert.match(zh,/<html lang="zh-Hant">/);assert.match(zh,/<h1>中文書<\/h1>/);assert.match(zh,/href="\/\?room=chinese-room"/);
  assert.equal(fs.readFileSync('zh/index.html','utf8'),zh,'run: node scripts/book-pages.mjs');
  assert.match(fs.readFileSync(path.join(out,'sitemap.xml'),'utf8'),/<loc>https:\/\/libraryafterdark\.space\/zh\/<\/loc>/);
  const {readingTime,slug}=await import('./scripts/book-pages.mjs');assert.equal(readingTime(700000,'zh-Hant'),'33 小時 20 分鐘');assert.equal(slug('紅樓夢'),'紅樓夢');
});

test('the French Reading Room: classics in French behind the blue door, kept apart from the English editions',async()=>{
  const french=shelves.filter(entry=>entry[4]==='french');
  const {ROOMS,ROOM_LANGUAGES,resolvedKey}=await import('./scripts/new-books.mjs');assert.ok(ROOMS.includes('french'));assert.equal(ROOM_LANGUAGES.french,'fr');
  assert.ok(french.length>=35&&french.length<=48,`${french.length} French books`);
  assert.equal(new Set(french.map(entry=>entry[1])).size,french.length,'each title once');
  for(const [id,title,,,,note] of french){
    assert.ok(Number.isInteger(id),`${title}: give its number from Gutenberg's catalogue`);
    assert.ok(note&&note.length>=80,`${title} needs a librarian’s note`);
    assert.match(note,/\b(le|la|les|de|du|des|et|un|une|qui)\b/,`${title}: the note should be in French`);
    assert.doesNotMatch(note,/\b(the|and|which|with)\b/i,`${title}: the note should be in French`);
  }
  // Madame Bovary is on the English shelves too: the two editions are kept under different keys.
  assert.notEqual(resolvedKey('Madame Bovary','french'),resolvedKey('Madame Bovary','shelves'));
  assert.equal(resolvedKey('Madame Bovary','french'),'Madame Bovary [fr]');
  assert.match(game,/resolved\[ROOM_LANGUAGES\[room\]\?`\$\{title\} \[\$\{ROOM_LANGUAGES\[room\]\}\]`:title\]/);
  const {textMatches}=await import('./scripts/daily-room.mjs'),head=lang=>`Title: Madame Bovary\nAuthor: Gustave Flaubert\nLanguage: ${lang}\n`;
  assert.ok(textMatches(head('French'),'Madame Bovary','Gustave Flaubert','fr'));assert.ok(!textMatches(head('English'),'Madame Bovary','Gustave Flaubert','fr'));
  // The blue door stands between the green and the red in the Spanish room's east wall.
  assert.match(wing,/french:\{cx:-470,cz:132,w:24,d:15,h:6,language:'fr'/);assert.match(wing,/type:'intl-go',room:'french'/);
  assert.match(wing,/ROOM_DOORS=\{portuguese:\{x:EAST,z:ROOM\.cz-4\.7,yaw:-Math\.PI\/2\},french:\{x:EAST,z:ROOM\.cz,yaw:-Math\.PI\/2\},\s*chinese:\{x:EAST,z:ROOM\.cz\+4\.7,yaw:-Math\.PI\/2\}/);
  assert.match(game,/fr:'french-room',french:'french-room',francais:'french-room'/);assert.match(game,/'french-room':internationalWing&&\(\(\)=>enterWing\('french'\)\)/);
  assert.match(html,/rooms:\['fr','french','francais','français','french-room'\]/);assert.match(html,/enter:'Entrer dans la bibliothèque'/);
  const out=fs.mkdtempSync(path.join(os.tmpdir(),'fr-pages-'));
  execFileSync(process.execPath,['scripts/book-pages.mjs'],{env:{...process.env,OUT:out}});
  const fr=fs.readFileSync(path.join(out,'fr/index.html'),'utf8');
  assert.match(fr,/<html lang="fr">/);assert.match(fr,/<h1>Livres en français<\/h1>/);assert.match(fr,/href="\/\?room=french-room"/);
  assert.equal(fs.readFileSync('fr/index.html','utf8'),fr,'run: node scripts/book-pages.mjs');
  assert.match(fs.readFileSync(path.join(out,'sitemap.xml'),'utf8'),/<loc>https:\/\/libraryafterdark\.space\/fr\/<\/loc>/);
  const {readingTime}=await import('./scripts/book-pages.mjs');assert.equal(readingTime(15000,'fr'),'une heure');assert.equal(readingTime(30000,'fr'),'2 heures');
});

test('the wing’s rooms stand clear of every other place, Crusoe’s island included',()=>{
  const rooms=[...wing.matchAll(/(\w+):\{cx:(-?\d+),cz:(-?\d+),w:(\d+),d:(\d+)/g)].map(m=>({key:m[1],cx:+m[2],cz:+m[3],w:+m[4],d:+m[5]}));
  assert.equal(rooms.length,5);
  const isle=fs.readFileSync('crusoe-island.js','utf8'),[,ix,iz]=isle.match(/ISLE=\{x:(-?\d+),z:(-?\d+)/),[,rx,rz]=isle.match(/SAND=\{rx:(\d+),rz:(\d+)\}/);
  for(const a of rooms){
    // The nearest point of the room to the island's centre must lie outside its sand.
    const px=Math.max(a.cx-a.w/2,Math.min(+ix,a.cx+a.w/2)),pz=Math.max(a.cz-a.d/2,Math.min(+iz,a.cz+a.d/2));
    assert.ok(((px-ix)/rx)**2+((pz-iz)/rz)**2>1.05,`${a.key} overlaps Crusoe’s island`);
    for(const b of rooms)if(a!==b)assert.ok(Math.abs(a.cx-b.cx)>=(a.w+b.w)/2+2||Math.abs(a.cz-b.cz)>=(a.d+b.d)/2+2,`${a.key} and ${b.key} overlap`);
  }
  // Their chairs can be sat in, and open one of the room's own books.
  assert.match(wing,/registerSeat\(\[seat,back\],chair,new THREE\.Vector3\(0,1\.28,\.08\),yaw\+Math\.PI,\{title:def\.seat\[0\],author:def\.seat\[1\],bookIds,wingRoom:key\}\);room\.ours\.push\(seat,back\)/);
  assert.match(game,/isHolding:\(\)=>!!selected,registerSeat,/);
  assert.match(game,/bm\?\.userData\?\.seatCopy\?seated\?\.seat\?\.wingRoom/);
});

test('the Latin Reading Room: Latin texts behind a stone door in the south wall, with notes and pages in English',async()=>{
  const latin=shelves.filter(entry=>entry[4]==='latin');
  const {ROOMS,ROOM_LANGUAGES}=await import('./scripts/new-books.mjs');assert.ok(ROOMS.includes('latin'));assert.equal(ROOM_LANGUAGES.latin,'la');
  assert.ok(latin.length>=30&&latin.length<=48,`${latin.length} Latin books`);
  assert.equal(new Set(latin.map(entry=>entry[1])).size,latin.length,'each title once');
  for(const [id,title] of latin)assert.ok(Number.isInteger(id),`${title}: give its number from Gutenberg's catalogue`);
  const {textMatches}=await import('./scripts/daily-room.mjs'),head=lang=>`Title: Aeneidos\nAuthor: Virgil\nLanguage: ${lang}\n`;
  assert.ok(textMatches(head('Latin'),'Aeneidos','Virgil','la'));assert.ok(!textMatches(head('English'),'Aeneidos','Virgil','la'),'a translation is not the text');
  assert.match(wing,/latin:\{cx:-470,cz:164,w:24,d:15,h:6,language:'la'/);assert.match(wing,/latin:\{x:ROOM\.cx\+7,z:SOUTH,yaw:0\}/);assert.match(wing,/room:'latin'/);
  assert.match(game,/la:'latin-room',latin:'latin-room',latina:'latin-room'/);assert.match(game,/'latin-room':internationalWing&&\(\(\)=>enterWing\('latin'\)\)/);
  const out=fs.mkdtempSync(path.join(os.tmpdir(),'la-pages-'));
  execFileSync(process.execPath,['scripts/book-pages.mjs'],{env:{...process.env,OUT:out}});
  const la=fs.readFileSync(path.join(out,'la/index.html'),'utf8');
  assert.match(la,/<html lang="en">/);assert.match(la,/<h1>Libri Latini<\/h1>/);assert.match(la,/href="\/\?room=latin-room"/);
  assert.equal(fs.readFileSync('la/index.html','utf8'),la,'run: node scripts/book-pages.mjs');
  assert.match(fs.readFileSync(path.join(out,'sitemap.xml'),'utf8'),/<loc>https:\/\/libraryafterdark\.space\/la\/<\/loc>/);
});

test('the wing’s books load only on the way there, or on a link that may lead there',()=>{
  const main=load('data/new-books.js','ATHENAEUM_NEW_BOOKS'),wingList=load('data/new-books-wing.js','ATHENAEUM_NEW_BOOKS_WING');
  const WING=new Set(['spanish','portuguese','french','latin','chinese']);
  assert.ok(main.every(entry=>!WING.has(entry[4])),'the wing’s books belong in data/new-books-wing.js');
  assert.ok(wingList.length>150&&wingList.every(entry=>WING.has(entry[4])),'only the wing’s books in data/new-books-wing.js');
  // Not among the files every visitor downloads: only for a ?book= or a ?room= in the wing.
  assert.match(html,/if\(q\.has\('book'\)\|\|\/\^\(international\|international-wing\|es\|[^)]*latin-room\|zh[^)]*\)\$\/\.test\(room\)\)startupScript\('data\/new-books-wing\.js'\)/);
  assert.match(html,/window\.libraryVersionedSource=src=>versionedSource\(src\)/);
  // In the library: fetched within 9 m of the door (the reader starts 10.7 m away), at one of the wing's doors, or before a link enters a room.
  assert.match(game,/add\(window\.ATHENAEUM_NEW_BOOKS\);add\(window\.ATHENAEUM_NEW_BOOKS_WING\);/);
  assert.match(game,/script\.onload=\(\)=>\{newArrivals\.add\(window\.ATHENAEUM_NEW_BOOKS_WING\);this\.ready=true;done\(\)\}/);
  assert.match(game,/<9\)this\.load\(\)/);assert.match(game,/function enterWing\(key\)\{wingBooks\.load\(\)\.then\(\(\)=>internationalWing\.enter\(key\)\)\}/);
  assert.match(game,/\(wingBooks\.ready\?internationalWing\?\.update\(t\):wingBooks\.near\(\)\)/);
  assert.match(game,/!wingBooks\.ready&&String\(focus\.userData\?\.type\)\.startsWith\('intl-'\)/);
  assert.match(fs.readFileSync('.github/workflows/new-books.yml','utf8'),/'data\/new-books-wing\.js'/);
});

test('every chair in the rooms can be sat in',()=>{
  // The rooms behind doors pass their chairs to the library's seats and free them with the room.
  for(const [file,count] of [['evening-room.js',1],['periodicals-room.js',1],['daily-room.js',1]]){
    const source=fs.readFileSync(file,'utf8');
    assert.match(source,/registerSeat=null\}=options;/,`${file} takes registerSeat`);
    assert.equal((source.match(/registerSeat\(\[/g)||[]).length,count,`${file} registers its chairs`);
    assert.match(source,/Object\.defineProperty\(data,'bookIds',\{get:/,`${file}: a seat opens one of the room's own books`);
  }
  for(const key of ['createDailyRoom','createEveningRoom','createPeriodicalsRoom'])assert.match(game,new RegExp(`window\\.${key}\\?\\.\\(\\{THREE,scene,MAT,player,interactables,registerSeat,`),key);
  // Watson's chair and the broken chairs of the forgotten rooms are seats too, not only notes.
  assert.match(game,/registerSeat\(\[chair\],at,new THREE\.Vector3\(-\.1,1\.3,0\),-Math\.PI\/2,\{title:'Watson’s chair'/);
  assert.match(game,/const data=registerSeat\(\[seat,back\],g,new THREE\.Vector3\(0,1\.36,\.12\),0,/);
  assert.doesNotMatch(game,/note\(chair,'Watson’s chair'/);
});
