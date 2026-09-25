// The Room of the Day's nightly job (run by .github/workflows/daily-room.yml).
//
// For every day from two weeks ago to two days ahead it takes that day's ten books from
// data/daily-rooms.js and makes sure each one is really the book named:
//   - a listed id is accepted only if the text's own "Title:" and "Author:" lines match;
//   - otherwise (or when the id is null) Gutendex is searched by title and author;
//   - books that cannot be found are left out of that day.
// Each accepted text is saved gzipped in texts/bundled-gzip (where the reader already looks), because
// Project Gutenberg does not allow browsers on other sites to fetch its files directly. Texts this job
// added for days that have since left the window are deleted again, so the site does not keep growing.
// The checked lists are written to data/daily-rooms-resolved.js.
//
//   node scripts/daily-room.mjs              run for today (UTC)
//   node scripts/daily-room.mjs --date 2026-10-08
//   node scripts/daily-room.mjs --validate   check the schedule only (no network)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';

const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const SCHEDULE=path.join(root,'data/daily-rooms.js'),RESOLVED=path.join(root,'data/daily-rooms-resolved.js'),TRACKED=path.join(root,'data/daily-room-texts.json');
const BUNDLED=path.join(root,'texts/bundled-gzip'),AHEAD=2,DAY_MS=86400000,PAUSE_MS=Number(process.env.DAILY_ROOM_PAUSE_MS??1200);
const KINDS=['mood','journeys','curiosities','seasons','on-this-day','short-reads','deep-dive','firsts'];
const USER_AGENT='LibraryAfterDark-RoomOfTheDay/1.0 (+https://libraryafterdark.space)';

export function loadScript(file,name){const context={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),context,{filename:file});return context.window[name]}
const utc=key=>{const [y,m,d]=key.split('-').map(Number);return Date.UTC(y,m-1,d)};
const addDays=(key,n)=>new Date(utc(key)+n*DAY_MS).toISOString().slice(0,10);
export function entryFor(schedule,key){const i=Math.round((utc(key)-utc(schedule.start))/DAY_MS);if(i<0)return null;return schedule.days[i%schedule.days.length]}

export function validate(schedule){
  const errors=[];
  if(!/^\d{4}-\d{2}-\d{2}$/.test(schedule?.start||''))errors.push('start must be a YYYY-MM-DD date');
  if(!schedule?.days?.length)return [...errors,'no days'];
  for(const kind of KINDS)if(!schedule.kinds?.[kind]?.label)errors.push(`kind ${kind} needs a label`);
  schedule.days.forEach((day,i)=>{
    const where=`${day.date||'day '+i}`;
    if(day.date!==addDays(schedule.start,i))errors.push(`${where}: dates must run one a day from the start`);
    if(day.kind!==KINDS[i%KINDS.length])errors.push(`${where}: expected a ${KINDS[i%KINDS.length]} room (the kinds take turns)`);
    for(const field of ['title','intro'])if(typeof day[field]!=='string'||!day[field].trim())errors.push(`${where}: missing ${field}`);
    if(!Array.isArray(day.books)||day.books.length!==10)errors.push(`${where}: needs exactly ten books`);
    else day.books.forEach((book,k)=>{if(!Array.isArray(book)||book.length!==3||!(book[0]===null||Number.isInteger(book[0])&&book[0]>0)||!book[1]||!book[2])errors.push(`${where}: book ${k+1} must be [id or null, title, author]`)});
    if(!Number.isInteger(day.featured)||day.featured<0||day.featured>9)errors.push(`${where}: featured must be 0-9`);
  });
  return errors;
}

// ---------- matching ----------
const STOP=new Set(['the','a','an','of','and','or','other','in','on','to','with','by','its','his','her','from','for','at','complete','volume','vol','being','or,']);
export function words(text){return String(text||'').normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/&/g,' and ').replace(/['’]s\b/g,'').replace(/[^a-z0-9]+/g,' ').split(' ').filter(word=>word&&!STOP.has(word))}
export function titleMatches(expected,candidate){const want=words(expected),have=new Set(words(candidate));if(!want.length)return false;const hit=want.filter(word=>have.has(word)).length;return hit/want.length>=.75}
// Words in a candidate title beyond the ones asked for: "Dracula" prefers Dracula to Dracula's Guest.
export function extraWords(expected,candidate){const want=new Set(words(expected));return words(candidate.split(/[;:]/)[0]).filter(word=>!want.has(word)).length}
export function surname(author){const parts=words(author.replace(/\b(jr|sr|mrs?|professor|earl|baroness|sir|lord|lady|madame)\b\.?/gi,''));return parts[parts.length-1]||''}
export function authorMatches(expected,candidate){if(/anonymous/i.test(expected))return true;const name=surname(expected),have=words(candidate),joined=words(expected).slice(-2).join('');/* "Le Fanu" and "LeFanu" are the same writer. */return !!name&&(have.includes(name)||have.join('').includes(joined))}
export function header(text){
  const head=text.slice(0,6000),title=head.match(/^Title:\s*(.+(?:\r?\n[ \t]+.+)*)/m)?.[1]||head.match(/Project Gutenberg (?:EBook|eBook) of ([^\r\n]+)/)?.[1]||'';
  const people=[...head.matchAll(/^(?:Author|Editor|Translator|Contributor|Compiler|Illustrator):\s*(.+)$/gm)].map(match=>match[1]).join(' ');
  return {title:title.replace(/\s+/g,' ').trim(),people:people||head.match(/, by ([^\r\n]+)/)?.[1]||''};
}
export function textMatches(text,title,author){const h=header(text);return titleMatches(title,h.title)&&authorMatches(author,h.people)}

// ---------- network ----------
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function get(url,type='text'){for(let attempt=0;attempt<3;attempt++){try{const response=await fetch(url,{headers:{'user-agent':USER_AGENT},redirect:'follow',signal:AbortSignal.timeout(45000)});if(response.status===404)return null;if(response.ok)return type==='json'?await response.json():await response.text()}catch(error){}await sleep(2000*(attempt+1))}return null}
async function download(id){for(const url of [`https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,`https://www.gutenberg.org/ebooks/${id}.txt.utf-8`]){await sleep(PAUSE_MS);const text=await get(url);if(text&&text.length>2000)return text}return null}
async function search(title,author){
  const query=`${words(title).slice(0,6).join(' ')} ${/anonymous/i.test(author)?'':surname(author)}`.trim();
  await sleep(PAUSE_MS);const result=await get(`https://gutendex.com/books?languages=en&search=${encodeURIComponent(query)}`,'json');
  return (result?.results||[]).filter(book=>!book.copyright&&titleMatches(title,book.title)&&authorMatches(author,(book.authors||[]).map(a=>a.name).join(' '))).sort((a,b)=>extraWords(title,a.title)-extraWords(title,b.title)||(b.download_count||0)-(a.download_count||0)).map(book=>book.id);
}
const hasText=id=>fs.existsSync(path.join(root,`texts/pg${id}.txt`))||fs.existsSync(path.join(BUNDLED,`pg${id}.txt.gz`));
// A text already in the repository is checked like a download, so a wrong id cannot slip through.
function localText(id){const plain=path.join(root,`texts/pg${id}.txt`),packed=path.join(BUNDLED,`pg${id}.txt.gz`);try{if(fs.existsSync(plain))return fs.readFileSync(plain,'utf8');if(fs.existsSync(packed))return zlib.gunzipSync(fs.readFileSync(packed)).toString('utf8')}catch(error){}return null}
const localMatches=(id,title,author)=>{const text=localText(id);return !!text&&textMatches(text,title,author)};
async function resolve([id,title,author],log){
  if(id){if(localMatches(id,title,author))return {id,text:null};const text=hasText(id)?localText(id):await download(id);if(!hasText(id)&&text&&textMatches(text,title,author))return {id,text};if(text)log.push(`  id ${id} is not "${title}" (${header(text).title}); searching`)}
  for(const candidate of (await search(title,author)).slice(0,3)){if(localMatches(candidate,title,author))return {id:candidate,text:null};if(hasText(candidate))continue;const text=await download(candidate);if(text&&textMatches(text,title,author))return {id:candidate,text}}
  return null;
}

// ---------- main ----------
async function main(){
  const args=process.argv.slice(2),schedule=loadScript(SCHEDULE,'ATHENAEUM_DAILY_ROOMS'),errors=validate(schedule);
  if(errors.length){console.error(errors.join('\n'));process.exit(1)}
  if(args.includes('--validate')){console.log(`Schedule OK: ${schedule.days.length} days from ${schedule.start}.`);return}
  const today=args.includes('--date')?args[args.indexOf('--date')+1]:new Date().toISOString().slice(0,10);
  const previous=fs.existsSync(RESOLVED)?loadScript(RESOLVED,'ATHENAEUM_DAILY_RESOLVED')||{days:{}}:{days:{}},tracked=new Set(fs.existsSync(TRACKED)?JSON.parse(fs.readFileSync(TRACKED,'utf8')).ids:[]);
  const archive=schedule.archiveDays||14,entries=new Map();
  for(let n=-(archive-1);n<=AHEAD;n++){const entry=entryFor(schedule,addDays(today,n));if(entry)entries.set(entry.date,entry)}
  fs.mkdirSync(BUNDLED,{recursive:true});
  const days={},log=[];
  for(const [date,entry] of entries){
    const before=previous.days?.[date],books=[],missing=[];log.push(`${date} ${entry.title}`);
    for(const book of entry.books){
      const [,title,author]=book,known=before?.books?.find(b=>b.title===title);
      let found=known&&localMatches(known.id,title,author)?{id:known.id,text:null}:null;
      if(!found)found=await resolve(known?[known.id,title,author]:book,log);
      if(!found){missing.push(title);log.push(`  missing: ${title} (${author})`);continue}
      if(found.text&&!hasText(found.id)){fs.writeFileSync(path.join(BUNDLED,`pg${found.id}.txt.gz`),zlib.gzipSync(found.text,{level:9}));tracked.add(found.id);log.push(`  + ${found.id} ${title}`)}
      books.push({id:found.id,title,author});
    }
    days[date]={books,missing};
  }
  // Remove texts this job added that no day in the window still uses.
  const inUse=new Set(Object.values(days).flatMap(day=>day.books.map(book=>book.id)));
  for(const id of [...tracked])if(!inUse.has(id)){fs.rmSync(path.join(BUNDLED,`pg${id}.txt.gz`),{force:true});tracked.delete(id);log.push(`- removed ${id}`)}
  const header='// Written by scripts/daily-room.mjs (the nightly "Room of the Day" workflow): the checked book lists for the\n// days around today, keyed by the schedule date in data/daily-rooms.js. Do not edit by hand.\n';
  fs.writeFileSync(RESOLVED,header+'window.ATHENAEUM_DAILY_RESOLVED='+JSON.stringify({updated:today,days},null,1)+';\n');
  fs.writeFileSync(TRACKED,JSON.stringify({ids:[...tracked].sort((a,b)=>a-b)},null,1)+'\n');
  console.log(log.join('\n'));
  const total=Object.values(days).reduce((sum,day)=>sum+day.books.length,0),lost=Object.values(days).reduce((sum,day)=>sum+day.missing.length,0);
  console.log(`\n${entries.size} days, ${total} books ready, ${lost} not found, ${tracked.size} texts held for the room.`);
}
if(import.meta.url===`file://${process.argv[1]}`)await main();
