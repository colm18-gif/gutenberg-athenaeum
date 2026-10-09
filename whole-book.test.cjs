const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');

const html=fs.readFileSync('index.html','utf8'),fine=fs.readFileSync('fine-books.js','utf8'),analytics=fs.readFileSync('analytics.js','utf8');
const context={window:{},Math,setTimeout};vm.runInNewContext(fs.readFileSync('whole-book.js','utf8'),context);for(const f of ['fine-books.js','kells-book.js','vesalius-book.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),context);
const books={kells:context.window.KELLS_BOOK.whole,fabrica:context.window.VESALIUS_BOOK.whole};

test('the whole-book reader loads before the fine books and the game, and its event is allowed',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert(order.indexOf('whole-book.js')>=0&&order.indexOf('whole-book.js')<order.indexOf('fine-books.js')&&order.indexOf('fine-books.js')<order.indexOf('game.js'));
  assert.match(analytics,/'Whole Book Opened'/);assert.match(analytics,/whole: label/);
  assert.match(fine,/spec\.whole&&window\.createWholeBook\?'<button type="button" class="kv-whole" data-act="whole">The whole book<\/button>'/);
  assert.match(fine,/get isOpen\(\)\{return open\|\|!!whole\?\.isOpen\}/,'the world stays still while the whole book is open');
});

test('each whole book names a complete public-domain scan on Commons, at the address Commons serves its pages from',()=>{
  for(const [id,book] of Object.entries(books)){
    assert.equal(book.id,id);assert(book.pages>600,`${id}: the whole book`);assert.match(book.commons,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.equal(decodeURIComponent(book.commons.split('File:')[1]),book.file.replace(/ /g,'_'),`${id}: the credit links the file read`);
    const md5=crypto.createHash('md5').update(book.file.replace(/ /g,'_')).digest('hex');assert.equal(book.hash,`${md5[0]}/${md5.slice(0,2)}`,`${id}: the folders are the name's MD5`);
    // Commons refuses other widths (it answered 400 for 640): 960 and 1280 are among those it serves.
    for(const w of book.widths)assert([960,1280].includes(w),`${id}: ${w} is a width Commons serves`);
    const url=context.window.wholeBookPageUrl(book,5,book.widths[0]);assert(url.startsWith(`https://upload.wikimedia.org/wikipedia/commons/thumb/${book.hash}/`));assert.match(url,new RegExp(`/page5-${book.widths[0]}px-[^/]+\\.pdf\\.jpg$`));
    for(const [label,page] of book.marks){assert(label);assert(Number.isInteger(page)&&page>=1&&page<=book.pages,`${id}: ${label} is in the book`)}
    assert(book.label(1)&&book.start>=1&&book.start<=book.pages);
  }
});

test('the facsimile opens the whole book at the page it lies open at',()=>{
  const k=books.kells,f=books.fabrica;
  assert.equal(k.pageFor('034r'),68,'the Chi Rho, as seen');assert.equal(k.pageFor('032v'),65);assert.equal(k.pageFor('114r'),230);assert.equal(k.pageFor('292r'),586);
  assert.equal(k.pageFor('title'),null,'a drawn page has no place in the scan');
  assert.equal(f.pageFor('title'),11);assert.equal(f.pageFor('p164'),186,'the thinking skeleton, as seen');assert.equal(f.pageFor('paste-front'),null);
  for(const key of Object.keys(context.window.KELLS_BOOK.FOLIOS)){const p=k.pageFor(key);assert(p>=1&&p<=k.pages,key)}
  for(const key of Object.keys(context.window.VESALIUS_BOOK.FOLIOS)){const p=f.pageFor(key);assert(p>=1&&p<=f.pages,key)}
});
