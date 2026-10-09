// New arrivals (run by .github/workflows/new-books.yml).
//
// For every book in data/new-books.js it makes sure the Gutenberg number really is the book named, using the
// same checks as the Room of the Day (scripts/daily-room.mjs): the text's own "Title:" and "Author:" lines must
// match, and if they do not, or the number is missing, Gutendex is searched by title and author. Each text found
// is kept for good in texts/bundled-gzip, its words are counted (for reading times), and the results are written
// to data/new-books-resolved.js. Books that cannot be found are listed there and simply do not appear.
//
// A book in a room Gutenberg barely has (the Ukrainian Reading Room) may instead be 'ws:<page>' on Wikisource
// (scripts/wikisource.mjs): it is read from there, checked against its author's page, and kept the same way.
//
//   node scripts/new-books.mjs              check, bundle and write
//   node scripts/new-books.mjs --validate   check the list only (no network)
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {loadScript,resolve,textMatches} from './daily-room.mjs';
import {isWikisource,wikisourcePage,wikisourceId,fetchWikisource,wikisourceText,isWikisourceText,WIKISOURCE_LANGUAGES} from './wikisource.mjs';

const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const LIST=path.join(root,'data/new-books.js'),WING=path.join(root,'data/new-books-wing.js'),RESOLVED=path.join(root,'data/new-books-resolved.js'),TRACKED=path.join(root,'data/daily-room-texts.json');
const BUNDLED=path.join(root,'texts/bundled-gzip');
export const ROOMS=['secret','shelves','evening-quick','evening-hour','evening-evening','learners-1','learners-2','learners-3','learners-4','learners-short','signal','tide','mars','periodicals','irish-myth','irish-revival','irish-writers','irish-gaeilge','antipodes','australian','new-zealand','african-ancient','african-voices','african-tales','map-voyages','map-makers','map-lands','medicine-physic','medicine-discovery','medicine-healers','set-texts','lost-property','contested','kipling','spanish','portuguese','chinese','french','latin','italian','ukrainian'];
// Rooms whose books are not in English: the language of their texts (used to search Gutendex, and by the reader
// and the book pages). Every other room is English.
export const ROOM_LANGUAGES={spanish:'es',portuguese:'pt',chinese:'zh',french:'fr',latin:'la',italian:'it',ukrainian:'uk','irish-gaeilge':'ga'};
// data/new-books-resolved.js is keyed by title, and by title and language for the rooms in another language, so the
// French Madame Bovary does not take the place of the English one ("Madame Bovary [fr]"). game.js does the same.
export const resolvedKey=(title,room)=>ROOM_LANGUAGES[room]?`${title} [${ROOM_LANGUAGES[room]}]`:title;

export function validate(list){
  const errors=[],notes=new Map();
  if(!Array.isArray(list)||!list.length)return ['no books'];
  list.forEach((entry,i)=>{
    const where=`book ${i+1}${entry?.[1]?` (${entry[1]})`:''}`;
    if(!Array.isArray(entry)||entry.length!==6){errors.push(`${where}: must be [id or null, title, author, category, room, note]`);return}
    const [id,title,author,category,room,note]=entry;
    if(isWikisource(id)){if(!wikisourcePage(id).trim())errors.push(`${where}: name the Wikisource page after ws:`);if(!WIKISOURCE_LANGUAGES[ROOM_LANGUAGES[room]])errors.push(`${where}: Wikisource books are only read for ${Object.keys(WIKISOURCE_LANGUAGES).join(', ')} rooms`)}
    else if(!(id===null||Number.isInteger(id)&&id>0))errors.push(`${where}: the id must be a Gutenberg number, 'ws:<Wikisource page>' or null`);
    for(const [field,value] of [['title',title],['author',author],['category',category]])if(typeof value!=='string'||!value.trim())errors.push(`${where}: missing ${field}`);
    if(!ROOMS.includes(room))errors.push(`${where}: unknown room ${room}`);
    if(note)notes.set(title,note);
  });
  // A book may stand in two rooms; it needs a librarian's note in at least one of them.
  for(const [,title] of list)if(!notes.has(title))errors.push(`${title}: needs a librarian's note`);
  // Two Wikisource pages must not share a number.
  const numbers=new Map();for(const [id,title] of list)if(isWikisource(id)){const n=wikisourceId(wikisourcePage(id)),other=numbers.get(n);if(other&&other!==wikisourcePage(id))errors.push(`${title}: its Wikisource number ${n} is taken; list the page under another name`);numbers.set(n,wikisourcePage(id))}
  const seen=new Map();for(const [,title,,,room] of list){const key=title+'|'+room;if(seen.has(key))errors.push(`${title}: listed twice in ${room}`);seen.set(key,true)}
  return errors;
}

// Words in the story itself, not the Project Gutenberg header and licence (as scripts/build-learner-data.mjs).
export function countWords(text){
  const start=text.search(/\*\*\*\s*START OF (THE|THIS) (PROJECT GUTENBERG|WIKISOURCE)/i),end=text.search(/\*\*\*\s*END OF (THE|THIS) (PROJECT GUTENBERG|WIKISOURCE)/i);
  let body=text.slice(start>=0?text.indexOf('\n',start)+1:0,end>start?end:text.length);
  // Wikisource's credit line is not part of the book.
  for(const {credit} of Object.values(WIKISOURCE_LANGUAGES))body=body.replace(credit,'');
  // Chinese is counted by the character, as Chinese readers count it; other letters by the word (“canción” is one).
  const han=(body.match(/\p{Script=Han}/gu)||[]).length;
  return han+(body.replace(/\p{Script=Han}/gu,' ').toLowerCase().replace(/[’‘]/g,"'").match(/\p{L}+(?:'\p{L}+)?/gu)||[]).length;
}
function localText(id){
  const plain=path.join(root,`texts/pg${id}.txt`),packed=path.join(BUNDLED,`pg${id}.txt.gz`);
  try{if(fs.existsSync(plain))return fs.readFileSync(plain,'utf8');if(fs.existsSync(packed))return zlib.gunzipSync(fs.readFileSync(packed)).toString('utf8')}catch(error){}
  return null;
}

async function main(){
  const args=process.argv.slice(2),list=[...loadScript(LIST,'ATHENAEUM_NEW_BOOKS'),...loadScript(WING,'ATHENAEUM_NEW_BOOKS_WING')],errors=validate(list);
  if(errors.length){console.error(errors.join('\n'));process.exit(1)}
  if(args.includes('--validate')){console.log(`New books OK: ${list.length} entries.`);return}
  const previous=fs.existsSync(RESOLVED)?loadScript(RESOLVED,'ATHENAEUM_NEW_BOOKS_RESOLVED')?.books||{}:{};
  const books={},missing=[],unique=new Map();for(const entry of list){const key=resolvedKey(entry[1],entry[4]);if(!unique.has(key))unique.set(key,entry)}
  fs.mkdirSync(BUNDLED,{recursive:true});
  const save=()=>fs.writeFileSync(RESOLVED,'// Written by scripts/new-books.mjs (the "New books" workflow): the checked Gutenberg number and word count of\n// each book in data/new-books.js, keyed by title. Books listed as missing could not be found. Do not edit by hand.\n'+
    'window.ATHENAEUM_NEW_BOOKS_RESOLVED='+JSON.stringify({updated:new Date().toISOString().slice(0,10),books,missing},null,1)+';\n');
  for(const [key,[id,title,author,,room]] of unique){
    if(isWikisource(id)){
      // From Wikisource: kept for good once read, like a Gutenberg text; read again only if it has gone.
      const page=wikisourcePage(id),number=wikisourceId(page),language=ROOM_LANGUAGES[room];let text=localText(number);
      if(!text||!isWikisourceText(text,title)){const found=await fetchWikisource(page,author,language,console.log);if(!found){missing.push(key);console.log(`  missing: ${title} (${author}), Wikisource ${page}`);continue}
        text=wikisourceText({title,author,lang:language,...found});fs.writeFileSync(path.join(BUNDLED,`pg${number}.txt.gz`),zlib.gzipSync(text,{level:9}));console.log(`  + ${number} ${title} (Wikisource: ${found.page})`)}
      else console.log(`  = ${number} ${title} (Wikisource)`);
      books[key]={id:number,words:countWords(text),source:'wikisource',page:text.match(/^Source: Wikisource, (\S+)/m)?.[1]||''};save();continue;
    }
    // A book checked on an earlier run is not looked up again while its text is still here and still matches.
    const known=previous[key],knownText=known&&localText(known.id);
    const language=ROOM_LANGUAGES[room]||'en';let found=knownText&&textMatches(knownText,title,author,language)?{id:known.id,text:null}:null;
    if(!found)found=await resolve([known?.id&&textMatches(knownText||'',title,author,language)?known.id:id,title,author],{language});
    if(!found){missing.push(key);console.log(`  missing: ${title} (${author})`);continue}
    let text=found.text;
    if(text&&!localText(found.id)){fs.writeFileSync(path.join(BUNDLED,`pg${found.id}.txt.gz`),zlib.gzipSync(text,{level:9}));console.log(`  + ${found.id} ${title}`)}
    else{text=text||localText(found.id);console.log(`  = ${found.id} ${title}`)}
    books[key]={id:found.id,words:countWords(text)};save();
  }
  save();
  // These texts are kept for good, so the Room of the Day must not count them as its own and remove them later.
  if(fs.existsSync(TRACKED)){const tracked=JSON.parse(fs.readFileSync(TRACKED,'utf8')),ours=new Set(Object.values(books).map(book=>book.id)),ids=(tracked.ids||[]).filter(id=>!ours.has(id));
    if(ids.length!==(tracked.ids||[]).length)fs.writeFileSync(TRACKED,JSON.stringify({...tracked,ids},null,1)+'\n')}
  console.log(`\n${Object.keys(books).length} books ready, ${missing.length} not found${missing.length?': '+missing.join('; '):''}.`);
}
if(import.meta.url===`file://${process.argv[1]}`)await main();
