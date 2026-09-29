// Checks every text bundled in texts/bundled-gzip, and replaces any that is damaged.
//
// A bundled text must decompress, and must really be the book the catalogue says it is (its own "Title:" and
// "Author:" lines are checked, as the Room of the Day does). A damaged one is downloaded again from Project
// Gutenberg or its mirrors, checked the same way, and written back. Run by .github/workflows/repair-texts.yml.
//
//   node scripts/repair-texts.mjs           check, and repair what is damaged
//   node scripts/repair-texts.mjs --check   check only (no network); exits 1 if anything is damaged
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {download,textMatches} from './daily-room.mjs';
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

async function main(){
  const broken=damaged();
  if(!broken.length){console.log('Every bundled text is sound.');return}
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
}
if(import.meta.url===`file://${process.argv[1]}`)await main();
