// Checks every text bundled in texts/bundled-gzip, and replaces any that is damaged.
//
// A bundled text must decompress, and must really be the book the catalogue says it is (its own "Title:" and
// "Author:" lines are checked, as the Room of the Day does). A damaged one is downloaded again from Project
// Gutenberg or its mirrors, checked the same way, and written back. Then every Gutenberg book in the catalogue that
// has no bundled text yet is downloaded, checked the same way and bundled, so that no reader depends on a live fetch
// from gutenberg.org (which fails often enough that readers were finding "offline shelf copies"). A run stops starting
// new downloads after MISSING_BUDGET_MS, and the next run carries on. Run by .github/workflows/repair-texts.yml.
//
//   node scripts/repair-texts.mjs           check, and repair what is damaged
//   node scripts/repair-texts.mjs --check   check only (no network); exits 1 if anything is damaged
//   node scripts/repair-texts.mjs --missing list the catalogue's Gutenberg books that have no bundled text
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {download,textMatches,titleMatches,header,surname,languageMatches} from './daily-room.mjs';
import {loadCatalogue} from './book-pages.mjs';

const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..'),BUNDLED=path.join(root,'texts/bundled-gzip');

export function damaged(){
  const out=[];
  for(const file of fs.readdirSync(BUNDLED).filter(f=>/^pg\d+\.txt\.gz$/.test(f)).sort()){
    let text=null;try{text=zlib.gunzipSync(fs.readFileSync(path.join(BUNDLED,file))).toString('utf8')}catch(error){}
    if(!text||text.length<2000)out.push({file,id:Number(file.match(/\d+/)[0]),reason:text?'too short':'does not decompress'});
  }
  return out;
}

// Gutenberg books in the catalogue with no text of their own in the repository. Books with a textPath (Standard Ebooks,
// Wikisource, the Internet Archive) and Wikisource numbers from 950000 are read from their own files instead.
export function missing(books=loadCatalogue().books){
  return books.filter(book=>Number.isInteger(book.id)&&book.id<900000&&!book.textPath&&!fs.existsSync(path.join(BUNDLED,`pg${book.id}.txt.gz`))&&!fs.existsSync(path.join(root,`texts/pg${book.id}.txt`)));
}
// An anthology's header names its editor, not each contributor; one of its writers' books is accepted when the title
// matches and the writer is named in its opening pages (its contents), so a wrong number still cannot slip through.
export function bundleMatches(text,book){
  if(textMatches(text,book.title,book.author,book.language||'en'))return true;
  const name=surname(book.author);
  return !!name&&titleMatches(book.title,header(text).title)&&languageMatches(text,book.language||'en')&&new RegExp(`\\b${name}\\b`,'i').test(text.slice(0,60000));
}
// A few of Gutenberg's older books are published only as HTML. Their text is taken from the HTML edition, block by
// block, and checked like any other download (the header's Title and Author lines survive the conversion).
export function htmlToText(html){
  const entities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',mdash:'—',ndash:'–',lsquo:'‘',rsquo:'’',ldquo:'“',rdquo:'”',hellip:'…'};
  return html.replace(/<(script|style|head)[\s\S]*?<\/\1>/gi,'').replace(/<br\s*\/?>/gi,'\n').replace(/<\/(p|div|h[1-6]|li|tr|pre|blockquote)>/gi,'\n\n')
    .replace(/<[^>]+>/g,'').replace(/&#x([0-9a-f]+);/gi,(m,h)=>String.fromCodePoint(parseInt(h,16))).replace(/&#(\d+);/g,(m,d)=>String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi,(m,n)=>entities[n.toLowerCase()]??m).replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
}
async function downloadHtml(id){
  for(const url of [`https://www.gutenberg.org/cache/epub/${id}/pg${id}-images.html`,`https://www.gutenberg.org/ebooks/${id}.html.images`]){
    try{const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok)continue;const text=htmlToText(await response.text());if(text.length>2000)return text}catch(error){}
  }
  return null;
}
const MISSING_BUDGET_MS=Number(process.env.MISSING_BUDGET_MS??40*60*1000);
async function bundleMissing(){
  const todo=missing(),started=Date.now();let added=0,refused=0;
  if(!todo.length){console.log('Every Gutenberg book in the catalogue has a bundled text.');return}
  console.log(`\n${todo.length} catalogue books have no bundled text.`);
  for(const book of todo){
    if(Date.now()-started>MISSING_BUDGET_MS){console.log(`  out of time; ${todo.length-added-refused} left for the next run`);break}
    const text=await download(book.id)||await downloadHtml(book.id);
    if(!text){console.log(`  ${book.id}: could not be downloaded`);refused++;continue}
    if(!bundleMatches(text,book)){console.log(`  ${book.id}: the download is not “${book.title}” by ${book.author}; left unbundled`);refused++;continue}
    fs.writeFileSync(path.join(BUNDLED,`pg${book.id}.txt.gz`),zlib.gzipSync(text,{level:9}));added++;console.log(`  + ${book.id} ${book.title}`);
  }
  console.log(`\n${added} bundled; ${refused} could not be.`);
}

async function main(){
  if(process.argv.includes('--missing')){for(const book of missing())console.log(`${book.id}\t${book.title} — ${book.author}`);return}
  const broken=damaged();
  if(!broken.length){console.log('Every bundled text is sound.');if(!process.argv.includes('--check'))await bundleMissing();return}
  for(const b of broken)console.log(`damaged: ${b.file} (${b.reason})`);
  // Texts read from Wikisource (numbers from 950000) are not on Gutenberg; the New books workflow reads them again.
  if(process.argv.includes('--check'))process.exit(1);
  const {books}=loadCatalogue(),known=new Map(books.map(book=>[book.id,book]));let fixed=0;
  for(const {file,id} of broken){
    if(id>=950000){console.log(`  ${id}: from Wikisource; the New books workflow will read it again`);continue}
    const book=known.get(id),text=await download(id);
    if(!text){console.log(`  ${id}: could not be downloaded; left as it is`);continue}
    if(book&&!textMatches(text,book.title,book.author)){console.log(`  ${id}: the download is not “${book.title}”; left as it is`);continue}
    fs.writeFileSync(path.join(BUNDLED,file),zlib.gzipSync(text,{level:9}));fixed++;console.log(`  + ${id} ${book?.title||''}`);
  }
  console.log(`\n${fixed} of ${broken.length} repaired.`);
  if(fixed<broken.length)process.exitCode=1;
  await bundleMissing();
}
if(import.meta.url===`file://${process.argv[1]}`)await main();
