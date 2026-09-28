const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const out=fs.mkdtempSync(path.join(os.tmpdir(),'book-pages-'));
execFileSync(process.execPath,['scripts/book-pages.mjs'],{env:{...process.env,OUT:out}});
const pages=fs.readdirSync(path.join(out,'book')).filter(f=>/^\d+-.+\.html$/.test(f));

test('every book in the library has a page with its note and a way in',()=>{
  assert.ok(pages.length>=700,`${pages.length} pages`);
  const titles=new Set();
  for(const file of pages){
    const html=fs.readFileSync(path.join(out,'book',file),'utf8'),id=file.split('-')[0];
    assert.match(html,new RegExp(`<link rel="canonical" href="https://libraryafterdark\\.space/book/${file}">`),file);
    assert.match(html,new RegExp(`<a class="read" href="/\\?book=${id}">`),file);
    assert.match(html,/<blockquote><p>.{40,}<\/p><cite>(The librarian|La bibliotecaria|A bibliotecária|La bibliothécaire|館員)<\/cite><\/blockquote>/s,`${file} has the librarian’s note`);
    assert.match(html,/<meta name="description" content=".{20,}">/,file);
    const ld=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);assert.equal(ld['@type'],'Book');
    const title=html.match(/<title>(.*?)<\/title>/)[1];assert.ok(!titles.has(title),`two pages share the title ${title}`);titles.add(title);
  }
});

test('the catalogue, authors index, sitemap and robots.txt list the pages',()=>{
  const catalogue=fs.readFileSync(path.join(out,'book/index.html'),'utf8'),sitemap=fs.readFileSync(path.join(out,'sitemap.xml'),'utf8');
  for(const file of pages.slice(0,50)){assert.ok(catalogue.includes(`/book/${file}`),file);assert.ok(sitemap.includes(`/book/${encodeURI(file)}</loc>`),file)}
  assert.match(fs.readFileSync(path.join(out,'robots.txt'),'utf8'),/Sitemap: https:\/\/libraryafterdark\.space\/sitemap\.xml/);
  assert.match(fs.readFileSync(path.join(out,'book/authors.html'),'utf8'),/<h1>Authors<\/h1>/);
});

test('the published pages are up to date with the catalogue',()=>{
  const published=fs.readdirSync('book').filter(f=>/^\d+-.+\.html$/.test(f)).sort();
  assert.deepEqual(published,[...pages].sort(),'run: node scripts/book-pages.mjs');
  for(const file of ['index.html','authors.html',...pages.slice(0,40)])assert.equal(fs.readFileSync(path.join('book',file),'utf8'),fs.readFileSync(path.join(out,'book',file),'utf8'),file);
});

test('a link from a book page opens that book in the reader',()=>{
  const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
  assert.match(game,/const linkedBook=\(\(\)=>\{try\{const id=Number\(new URLSearchParams\(location\.search\)\.get\('book'\)\)/);
  assert.match(game,/if\(linkedBook\)openLinkedBook\(\);else if\(!\(linkedRoom&&goToLinkedRoom\(\)\)\)tour\?\.begin\(\);/);
  assert.match(game,/selectBook\(bm\);openReader\(\)/);
  assert.match(html,/<a href="\/book\/">Browse the catalogue<\/a>/);
});

test('room links take the reader straight to a room, and book pages use them',()=>{
  const game=fs.readFileSync('game.js','utf8');
  assert.match(game,/const linkedRoom=\(\(\)=>\{try\{return \(new URLSearchParams\(location\.search\)\.get\('room'\)/);
  for(const key of ['boathouse','evening-room','learners-room','periodicals-room','daily-room','mars','moon','rocket-hall'])assert.ok(game.includes(`'${key}':`)||game.includes(`${key}:`),key);
  assert.match(game,/'consulting-room':'doyle'/);
  const page=fs.readFileSync(path.join(out,'book/62-a-princess-of-mars.html'),'utf8');
  assert.match(page,/<a href="\/\?room=mars">The Reading Room of Helium, on Mars<\/a>/);
});
