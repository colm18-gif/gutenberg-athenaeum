const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');

const wing=fs.readFileSync('international-wing.js','utf8'),game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
const load=(file,name)=>{const c={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),c);return c.window[name]};
const spanish=load('data/new-books.js','ATHENAEUM_NEW_BOOKS').filter(entry=>entry[4]==='spanish');

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
  assert.match(wing,/const ROOM=\{cx:-410,cz:100,w:24,d:15,h:6\}/);
  assert.match(wing,/if\(inside\|\|near\)activate\(\);\s*else if\(root&&t-lastNeeded>KEEP/);
  assert.match(wing,/SALA DE LEITURA EM PORTUGUÊS/);assert.match(wing,/中文閱覽室/);
  assert.match(game,/const internationalWing=window\.createInternationalWing\?\.\(/);
  assert.match(game,/arrivals:\(\)=>newArrivals\.list\('spanish'\)/);
  assert.match(game,/if\(internationalWing\?\.contains\(x,z\)\)return 'international-wing';/);
  assert.match(game,/\['international-wing','The International Wing'\]/);
  assert.match(game,/internationalWing\?\.update\(t\)/);
  assert.match(game,/'international-wing':internationalWing&&\(\(\)=>internationalWing\.enter\(\)\)/);
  assert.match(game,/spanish:'international-wing',espanol:'international-wing',es:'international-wing'/);
  assert.match(fs.readFileSync('room-ambience.js','utf8'),/'international-wing':\{beds:/);
  // A link into the wing is greeted in Spanish on the entry screen.
  assert.match(html,/\['es','spanish','espanol','español','international-wing','international'\]\.includes\(room\)/);
  assert.match(html,/set\('#enter','Entrar en la biblioteca'\)/);assert.match(html,/<a href="\/es\/">Libros en español<\/a>/);
});

test('Spanish books are known to be Spanish: word help steps aside, and their pages are in Spanish',()=>{
  assert.match(game,/ROOM_LANGUAGES=\{spanish:'es'\}/);assert.match(game,/if\(ROOM_LANGUAGES\[room\]\)book\.language=ROOM_LANGUAGES\[room\]/);
  const help=fs.readFileSync('word-help.js','utf8');
  assert.match(help,/function enabled\(\)\{return !foreign&&/);assert.match(help,/foreign=!!book\?\.language&&book\.language!=='en'/);
  const out=fs.mkdtempSync(path.join(os.tmpdir(),'intl-pages-'));
  execFileSync(process.execPath,['scripts/book-pages.mjs'],{env:{...process.env,OUT:out}});
  const landing=fs.readFileSync(path.join(out,'es/index.html'),'utf8');
  assert.match(landing,/<html lang="es">/);assert.match(landing,/<h1>Libros en español<\/h1>/);assert.match(landing,/href="\/\?room=international-wing"/);
  assert.match(fs.readFileSync(path.join(out,'sitemap.xml'),'utf8'),/<loc>https:\/\/libraryafterdark\.space\/es\/<\/loc>/);
  assert.equal(fs.readFileSync('es/index.html','utf8'),landing,'run: node scripts/book-pages.mjs');
  const resolved=load('data/new-books-resolved.js','ATHENAEUM_NEW_BOOKS_RESOLVED')?.books||{};
  const found=spanish.map(entry=>resolved[entry[1]]).find(Boolean);
  if(found){
    const page=fs.readdirSync(path.join(out,'book')).find(f=>f.startsWith(`${found.id}-`)),text=fs.readFileSync(path.join(out,'book',page),'utf8');
    assert.match(text,/<html lang="es">/);assert.match(text,/<cite>La bibliotecaria<\/cite>/);assert.match(text,/"inLanguage":"es"/);
    assert.match(text,/<a href="\/\?room=international-wing">The International Wing<\/a>/);
  }
});
