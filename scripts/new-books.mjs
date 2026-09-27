// New arrivals (run by .github/workflows/new-books.yml).
//
// For every book in data/new-books.js it makes sure the Gutenberg number really is the book named, using the
// same checks as the Room of the Day (scripts/daily-room.mjs): the text's own "Title:" and "Author:" lines must
// match, and if they do not, or the number is missing, Gutendex is searched by title and author. Each text found
// is kept for good in texts/bundled-gzip, its words are counted (for reading times), and the results are written
// to data/new-books-resolved.js. Books that cannot be found are listed there and simply do not appear.
//
//   node scripts/new-books.mjs              check, bundle and write
//   node scripts/new-books.mjs --validate   check the list only (no network)
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {loadScript,resolve,textMatches} from './daily-room.mjs';

const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const LIST=path.join(root,'data/new-books.js'),RESOLVED=path.join(root,'data/new-books-resolved.js'),TRACKED=path.join(root,'data/daily-room-texts.json');
const BUNDLED=path.join(root,'texts/bundled-gzip');
export const ROOMS=['secret','shelves','evening-quick','evening-hour','evening-evening','learners-1','learners-2','learners-3','learners-4','learners-short','signal','tide'];

export function validate(list){
  const errors=[],notes=new Map();
  if(!Array.isArray(list)||!list.length)return ['no books'];
  list.forEach((entry,i)=>{
    const where=`book ${i+1}${entry?.[1]?` (${entry[1]})`:''}`;
    if(!Array.isArray(entry)||entry.length!==6){errors.push(`${where}: must be [id or null, title, author, category, room, note]`);return}
    const [id,title,author,category,room,note]=entry;
    if(!(id===null||Number.isInteger(id)&&id>0))errors.push(`${where}: the id must be a Gutenberg number or null`);
    for(const [field,value] of [['title',title],['author',author],['category',category]])if(typeof value!=='string'||!value.trim())errors.push(`${where}: missing ${field}`);
    if(!ROOMS.includes(room))errors.push(`${where}: unknown room ${room}`);
    if(note)notes.set(title,note);
  });
  // A book may stand in two rooms; it needs a librarian's note in at least one of them.
  for(const [,title] of list)if(!notes.has(title))errors.push(`${title}: needs a librarian's note`);
  const seen=new Map();for(const [,title,,,room] of list){const key=title+'|'+room;if(seen.has(key))errors.push(`${title}: listed twice in ${room}`);seen.set(key,true)}
  return errors;
}

// Words in the story itself, not the Project Gutenberg header and licence (as scripts/build-learner-data.mjs).
export function countWords(text){
  const start=text.search(/\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG/i),end=text.search(/\*\*\*\s*END OF (THE|THIS) PROJECT GUTENBERG/i);
  const body=text.slice(start>=0?text.indexOf('\n',start)+1:0,end>start?end:text.length);
  return (body.toLowerCase().replace(/[’‘]/g,"'").match(/[a-z]+(?:'[a-z]+)?/g)||[]).length;
}
function localText(id){
  const plain=path.join(root,`texts/pg${id}.txt`),packed=path.join(BUNDLED,`pg${id}.txt.gz`);
  try{if(fs.existsSync(plain))return fs.readFileSync(plain,'utf8');if(fs.existsSync(packed))return zlib.gunzipSync(fs.readFileSync(packed)).toString('utf8')}catch(error){}
  return null;
}

async function main(){
  const args=process.argv.slice(2),list=loadScript(LIST,'ATHENAEUM_NEW_BOOKS'),errors=validate(list);
  if(errors.length){console.error(errors.join('\n'));process.exit(1)}
  if(args.includes('--validate')){console.log(`New books OK: ${list.length} entries.`);return}
  const previous=fs.existsSync(RESOLVED)?loadScript(RESOLVED,'ATHENAEUM_NEW_BOOKS_RESOLVED')?.books||{}:{};
  const books={},missing=[],unique=new Map();for(const entry of list)if(!unique.has(entry[1]))unique.set(entry[1],entry);
  fs.mkdirSync(BUNDLED,{recursive:true});
  const save=()=>fs.writeFileSync(RESOLVED,'// Written by scripts/new-books.mjs (the "New books" workflow): the checked Gutenberg number and word count of\n// each book in data/new-books.js, keyed by title. Books listed as missing could not be found. Do not edit by hand.\n'+
    'window.ATHENAEUM_NEW_BOOKS_RESOLVED='+JSON.stringify({updated:new Date().toISOString().slice(0,10),books,missing},null,1)+';\n');
  for(const [title,[id,,author]] of unique){
    // A book checked on an earlier run is not looked up again while its text is still here and still matches.
    const known=previous[title],knownText=known&&localText(known.id);
    let found=knownText&&textMatches(knownText,title,author)?{id:known.id,text:null}:null;
    if(!found)found=await resolve([known?.id??id,title,author]);
    if(!found){missing.push(title);console.log(`  missing: ${title} (${author})`);continue}
    let text=found.text;
    if(text&&!localText(found.id)){fs.writeFileSync(path.join(BUNDLED,`pg${found.id}.txt.gz`),zlib.gzipSync(text,{level:9}));console.log(`  + ${found.id} ${title}`)}
    else{text=text||localText(found.id);console.log(`  = ${found.id} ${title}`)}
    books[title]={id:found.id,words:countWords(text)};save();
  }
  save();
  // These texts are kept for good, so the Room of the Day must not count them as its own and remove them later.
  if(fs.existsSync(TRACKED)){const tracked=JSON.parse(fs.readFileSync(TRACKED,'utf8')),ours=new Set(Object.values(books).map(book=>book.id)),ids=(tracked.ids||[]).filter(id=>!ours.has(id));
    if(ids.length!==(tracked.ids||[]).length)fs.writeFileSync(TRACKED,JSON.stringify({...tracked,ids},null,1)+'\n')}
  console.log(`\n${Object.keys(books).length} books ready, ${missing.length} not found${missing.length?': '+missing.join('; '):''}.`);
}
if(import.meta.url===`file://${process.argv[1]}`)await main();
