// Finds a LibriVox recording for every Project Gutenberg book in the library (and in the Room of the Day
// schedule), so readers can listen without leaving the library. Run by .github/workflows/audiobooks.yml.
//
// LibriVox recordings are public domain, read by volunteers, and record which Gutenberg text they were read
// from, so most books are matched by Gutenberg id; the rest by a careful title-and-author match. For each
// match it keeps one recording, preferring a complete solo reading in English, and writes:
//   data/audiobooks.js          a small index loaded with the library: id -> [seconds, reader, chapters]
//   data/audio/<id>.json        the chapter list for that book, fetched only when someone presses Listen
// The chapters themselves stream from the Internet Archive, where LibriVox keeps them.
//
//   node scripts/audiobooks.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {titleMatches,authorMatches,extraWords} from './daily-room.mjs';

const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const API='https://librivox.org/api/feed/audiobooks/';
const PAUSE_MS=Number(process.env.AUDIOBOOKS_PAUSE_MS??400),TIMEOUT_MS=Number(process.env.AUDIOBOOKS_TIMEOUT_MS??20000),BUDGET_MS=Number(process.env.AUDIOBOOKS_BUDGET_MIN??40)*60000,RETRY_DAYS=30;
const USER_AGENT='LibraryAfterDark-Audiobooks/1.0 (+https://libraryafterdark.space)';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const say=line=>console.log(line);

// ---------- the library's books ----------
export function libraryBooks(){
  const found=new Map(),add=(id,title,author)=>{id=Number(id);if(Number.isInteger(id)&&id>0&&id<900000&&!found.has(id))found.set(id,{id,title:String(title||''),author:String(author||'')})};
  // The core catalogue is an inline list in game.js: [id,title,author,category,fame].
  const game=fs.readFileSync(path.join(root,'game.js'),'utf8'),start=game.indexOf('const books=['),end=game.indexOf('].map((b,i)=>({id:b[0]',start);
  if(start>=0&&end>start)for(const [id,title,author] of vm.runInNewContext(game.slice(start+'const books='.length,end+1)))add(id,title,author);
  // Collections loaded as data files (window.ATHENAEUM_*_BOOKS, records or [id,title,author] rows).
  const context={window:{}};vm.createContext(context);
  for(const file of fs.readdirSync(path.join(root,'data')).filter(name=>name.endsWith('.js')).sort())try{vm.runInContext(fs.readFileSync(path.join(root,'data',file),'utf8'),context)}catch(error){}
  for(const [name,value] of Object.entries(context.window))if(/^ATHENAEUM_.*BOOKS$/.test(name)&&Array.isArray(value))for(const record of value){if(Array.isArray(record))add(record[0],record[1],record[2]);else if(record&&typeof record==='object'&&(!record.source||/gutenberg/i.test(record.source)))add(record.id,record.title,record.author)}
  // Every book in the Room of the Day schedule.
  for(const day of context.window.ATHENAEUM_DAILY_ROOMS?.days||[])for(const [id,title,author] of day.books)if(id)add(id,title,author);
  return [...found.values()];
}

// ---------- LibriVox ----------
async function get(url){for(let attempt=0;attempt<2;attempt++){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),TIMEOUT_MS);try{const response=await fetch(url,{headers:{'user-agent':USER_AGENT},signal:controller.signal});if(response.status===404)return null;if(response.ok)return await response.json();say(`  ${response.status} from ${url}`)}catch(error){say(`  ${controller.signal.aborted?'timed out':error.message}: ${url}`)}finally{clearTimeout(timer)}await sleep(2000*(attempt+1))}return null}
export const gutenbergIdOf=url=>Number(String(url||'').match(/gutenberg\.org\/(?:etext|ebooks|files|cache\/epub)\/(\d+)/i)?.[1])||null;
const authorNames=book=>(book.authors||[]).map(a=>`${a.first_name||''} ${a.last_name||''}`.trim()).join(' ');
// Readings to avoid: partial, dramatised or not in English.
export const usable=book=>/^english$/i.test(book.language||'')&&!/\b(abridged|dramatic|dramati[sz]ed|excerpt|selections?|version \d+ ?\(abridged\))\b/i.test(book.title||'');
async function catalogue(){
  const all=[],fields='{id,title,language,url_text_source,url_librivox,totaltimesecs,num_sections,authors}';
  for(let offset=0;;offset+=1000){await sleep(PAUSE_MS);const page=await get(`${API}?format=json&limit=1000&offset=${offset}&fields=${encodeURIComponent(fields)}`);const books=page?.books||[];all.push(...books);say(`catalogue: ${all.length} recordings`);if(books.length<1000)break}
  return all;
}
const seconds=value=>{if(value==null)return 0;if(/^\d+$/.test(String(value)))return Number(value);const parts=String(value).split(':').map(Number);return parts.reduce((total,part)=>total*60+(part||0),0)};
const https=url=>String(url||'').replace(/^http:\/\//i,'https://');
// Prefers a solo reading (one reader throughout), then the fullest recording.
export function chooseReading(details){
  const scored=details.filter(Boolean).map(book=>{const sections=(book.sections||[]).filter(section=>section.listen_url),readers=[...new Set(sections.flatMap(section=>(section.readers||[]).map(reader=>reader.display_name)).filter(Boolean))];return {book,sections,readers,solo:readers.length===1}}).filter(entry=>entry.sections.length);
  scored.sort((a,b)=>(b.solo-a.solo)||(b.sections.length-a.sections.length)||(Number(a.book.id)-Number(b.book.id)));
  return scored[0]||null;
}
export function recordFor(choice){
  const {book,sections,readers}=choice;
  return {librivox:Number(book.id),title:book.title,readers,seconds:Number(book.totaltimesecs)||sections.reduce((sum,section)=>sum+seconds(section.playtime),0),
    chapters:sections.sort((a,b)=>Number(a.section_number)-Number(b.section_number)).map(section=>({title:String(section.title||`Section ${section.section_number}`).trim(),url:https(section.listen_url),seconds:seconds(section.playtime),reader:(section.readers||[]).map(reader=>reader.display_name).join(', ')}))};
}

// LibriVox's server is slow and often busy, so the work is spread over several runs: every book is saved as
// soon as it is matched, the run stops itself after BUDGET_MS, and the next run carries on. Books with no
// recording are remembered and only looked up again after RETRY_DAYS.
async function main(){
  const started=Date.now(),today=new Date().toISOString().slice(0,10);
  const books=libraryBooks(),outDir=path.join(root,'data/audio'),indexFile=path.join(root,'data/audiobooks.js'),missingFile=path.join(root,'data/audiobooks-missing.json');
  fs.mkdirSync(outDir,{recursive:true});
  const index=fs.existsSync(indexFile)?vm.runInNewContext(fs.readFileSync(indexFile,'utf8')+';window',{window:{}}).ATHENAEUM_AUDIOBOOKS||{}:{};
  const missing=fs.existsSync(missingFile)?JSON.parse(fs.readFileSync(missingFile,'utf8')):{};
  const header='// Written by scripts/audiobooks.mjs: Project Gutenberg id -> [length in seconds, reader, chapters] for every\n// book with a LibriVox recording. The chapter lists are in data/audio/<id>.json. Do not edit by hand.\n';
  const save=()=>{const sorted={};for(const id of Object.keys(index).sort((a,b)=>a-b))sorted[id]=index[id];fs.writeFileSync(indexFile,header+'window.ATHENAEUM_AUDIOBOOKS='+JSON.stringify(sorted)+';\n');fs.writeFileSync(missingFile,JSON.stringify(missing,null,1)+'\n')};
  // Books that have left the library lose their recordings.
  const wanted=new Set(books.map(book=>String(book.id)));for(const id of Object.keys(index))if(!wanted.has(id)){delete index[id];fs.rmSync(path.join(outDir,`${id}.json`),{force:true})}
  const recent=date=>date&&(Date.parse(today)-Date.parse(date))/86400000<RETRY_DAYS;
  const todo=books.filter(book=>!(index[book.id]&&fs.existsSync(path.join(outDir,`${book.id}.json`)))&&!recent(missing[book.id]));
  say(`library: ${books.length} Project Gutenberg books; ${Object.keys(index).length} already have a recording, ${todo.length} to look up`);save();
  if(!todo.length){say('Nothing to do.');return}
  const recordings=(await catalogue()).filter(usable);
  if(!recordings.length){say('The LibriVox catalogue could not be read; trying again next run.');return}
  const byGutenberg=new Map();for(const recording of recordings){const id=gutenbergIdOf(recording.url_text_source);if(!id)continue;if(!byGutenberg.has(id))byGutenberg.set(id,[]);byGutenberg.get(id).push(recording)}
  let matched=0,byTitle=0,none=0,unreachable=0;
  for(const book of todo){
    if(Date.now()-started>BUDGET_MS){say('Time budget used; the rest are looked up on the next run.');break}
    let candidates=byGutenberg.get(book.id)||[],viaTitle=false;
    // No recording lists this Gutenberg text: accept the same work by title and author (another edition of it).
    if(!candidates.length&&book.title){candidates=recordings.filter(recording=>titleMatches(book.title,recording.title)&&titleMatches(recording.title,book.title)&&authorMatches(book.author,authorNames(recording))).sort((a,b)=>extraWords(book.title,a.title)-extraWords(book.title,b.title)).slice(0,2);viaTitle=candidates.length>0}
    if(!candidates.length){missing[book.id]=today;none++;save();continue}
    const details=[];for(const candidate of candidates.slice(0,2)){await sleep(PAUSE_MS);const result=await get(`${API}?id=${candidate.id}&format=json&extended=1`);if(result?.books?.[0])details.push(result.books[0])}
    // The server did not answer: not marked missing, so the next run tries again.
    if(!details.length){unreachable++;continue}
    const choice=chooseReading(details);if(!choice){missing[book.id]=today;none++;save();continue}
    const record=recordFor(choice);fs.writeFileSync(path.join(outDir,`${book.id}.json`),JSON.stringify(record));
    index[book.id]=[record.seconds,record.readers.length===1?record.readers[0]:'Various readers',record.chapters.length];delete missing[book.id];save();matched++;if(viaTitle)byTitle++;
    say(`  ${book.id} ${book.title} -> LibriVox ${record.librivox} (${record.chapters.length} chapters, ${record.readers.length===1?record.readers[0]:record.readers.length+' readers'})`);
  }
  save();
  say(`\nThis run: ${matched} matched (${byTitle} by title), ${none} without a recording, ${unreachable} to retry. In total ${Object.keys(index).length} of ${books.length} books have a recording.`);
}
if(import.meta.url===`file://${process.argv[1]}`)await main();
