// The visitors' book: a very small Cloudflare Worker that keeps the signatures readers leave by the entrance of
// The Library After Dark. A signature is only ever a first name (or initials), a country, a book from the library
// and one line chosen from a fixed list, so there is no free text to moderate. Nothing else is stored: the
// reader's address is only used, hashed, to stop the same person signing more than once every ten minutes.
//
//   GET    /entries          the latest signatures, newest first
//   POST   /sign             {name, country, book, phrase}   (book: a Project Gutenberg number, or 0)
//   DELETE /entries/:id      remove one signature (needs the ADMIN_TOKEN secret as a Bearer token)
//
// It also keeps reading cards, so a reader can carry their place in each book to another device. A card is only a
// code of four words and two digits (no account, no email) and, for each book, how far through it the reader is and
// when they were last there. The code itself is never stored, only a hash of it; a card is forgotten after a year
// without use.
//
//   POST   /card             make a new card: {code}
//   GET    /card/:code       {books:{id:{p,t}}}   (p: 0 to 1 of the way through; t: when, in ms)
//   PUT    /card/:code       {books:{id:{p,t}}}   merged with what the card holds; the later t wins for each book
//
// Storage: one KV namespace bound as BOOK. See README.md in this folder for setting it up.

// Keep in step with visitors-book.js in the site (a test checks they match).
export const PHRASES=[
  'Came for one chapter, stayed for six.','The quiet was exactly what I needed.','Found a book I have meant to read for years.',
  'Read by the fire until very late.','I will be back tomorrow night.','Greetings from a fellow reader.','Got happily lost.',
  'The cat ignored me beautifully.','Followed the lamps and found a story.','Thank you for keeping the lights on.',
  'Reading in English, one page at a time.','Went to the Moon and back.'
];
export const COUNTRIES=('AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ '+
  'DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ '+
  'LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW '+
  'SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW').split(' ');
// Words that may not appear in a name. Whole words are checked for most (so Dickens, Dick and Fanny are fine);
// a few are refused anywhere in a name.
const BLOCKED_WORDS=('arse arsehole ass asshole bastard bitch bollocks bugger bullshit cock cocksucker cum dickhead dildo dyke fag faggot fuck fucker fucking hitler jizz kike knob knobhead minge motherfucker nazi negro '+
  'nigga nigger nonce paki penis piss poo poop porn prick pussy rape rapist retard scrote shag shit shite slag slut spastic spic tits tosser twat vagina wank wanker whore').split(' ');
const BLOCKED_ANYWHERE=['fuck','cunt','nigg','fagg','wank','twat','whore'];// not 'shit' (Yoshitaka) or 'rape' (Draper)
const LEET={'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','@':'a','$':'s','!':'i'};
const KEEP=400,SHOW=60,DAILY_LIMIT=500,WAIT_SECONDS=600;
// The words reading-card codes are made of: easy to read aloud and type on a phone.
export const CARD_WORDS=('amber anchor apple arch atlas attic autumn badger barley beacon birch bishop bramble brass bridge brook '+
  'candle canvas castle cedar chapel cherry cider clover comet copper coral cottage crane crow daisy delta dove dune '+
  'eagle ember falcon fern ferry fiddle finch forest fossil fox garden garnet glacier harbour hare harp hazel heron '+
  'holly honey island ivory ivy jasper juniper kestrel kettle lantern lark laurel lemon linen lotus maple marble meadow '+
  'mill mint moss nectar oak ochre olive opal orchard otter owl pebble pepper pilot pine plum poppy quill quince '+
  'raven reed ribbon river robin rowan saffron sage salmon shell silver sparrow spruce star stone swan thistle tide '+
  'tulip velvet violet walnut willow wren').split(' ');
const CARD_BOOKS=600,CARD_TTL=60*60*24*400,CARD_QUIET_MS=10000;
const CARD_CODE=new RegExp(`^(${CARD_WORDS.join('|')})(-(${CARD_WORDS.join('|')})){3}-\\d{2}$`);
export function cardCode(random=crypto.getRandomValues(new Uint32Array(5))){return [0,1,2,3].map(i=>CARD_WORDS[random[i]%CARD_WORDS.length]).join('-')+'-'+String(random[4]%100).padStart(2,'0')}
export const cleanCode=raw=>{const code=String(raw??'').trim().toLowerCase().replace(/[\s_]+/g,'-');return CARD_CODE.test(code)?code:null};
// Only book numbers, fractions and times: anything else in a card is dropped.
export function cleanBooks(raw){const books={};for(const [id,v] of Object.entries(raw&&typeof raw==='object'?raw:{})){const n=Number(id),p=Number(v?.p),t=Number(v?.t);
  if(Number.isInteger(n)&&n>0&&n<1e6&&p>=0&&p<=1&&Number.isFinite(t)&&t>0)books[n]={p:Math.round(p*10000)/10000,t:Math.round(t)}}return books}
export function mergeBooks(held,incoming){const out={...held};for(const [id,v] of Object.entries(incoming))if(!out[id]||v.t>out[id].t)out[id]=v;
  const ids=Object.keys(out).sort((a,b)=>out[b].t-out[a].t);return Object.fromEntries(ids.slice(0,CARD_BOOKS).map(id=>[id,out[id]]))}
const ORIGINS=[/^https:\/\/(www\.)?libraryafterdark\.space$/,/^http:\/\/localhost(:\d+)?$/,/^http:\/\/127\.0\.0\.1(:\d+)?$/];

export function cleanName(raw){
  const name=String(raw??'').normalize('NFC').replace(/\s+/g,' ').trim();
  if(name.length<1||name.length>24)return null;
  if(!/^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u.test(name))return null;
  const words=name.toLowerCase().replace(/[’']/g,'').split(/[\s.-]+/).filter(Boolean).map(w=>[...w].map(c=>LEET[c]||c).join(''));
  const joined=words.join('');
  if(words.some(w=>BLOCKED_WORDS.includes(w))||BLOCKED_ANYWHERE.some(b=>joined.includes(b)))return null;
  return name;
}
// Returns a clean signature, or a short reason it cannot be accepted.
export function validate(body){
  const name=cleanName(body?.name);if(!name)return {error:'Please give a first name or initials (letters only).'};
  const country=String(body?.country||'').toUpperCase();if(!COUNTRIES.includes(country))return {error:'Please choose a country.'};
  const book=Number(body?.book||0);if(!Number.isInteger(book)||book<0||book>999999)return {error:'That book is not in the library.'};
  const phrase=Number(body?.phrase);if(!Number.isInteger(phrase)||phrase<0||phrase>=PHRASES.length)return {error:'Please choose a line to write.'};
  return {entry:{n:name,c:country,b:book,p:phrase}};
}

async function hash(text){const bytes=new TextEncoder().encode(text);const digest=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].slice(0,12).map(b=>b.toString(16).padStart(2,'0')).join('')}
async function read(env){try{return JSON.parse(await env.BOOK.get('entries')||'[]')}catch(e){return []}}
function cors(request){const origin=request.headers.get('Origin')||'';const allowed=ORIGINS.some(r=>r.test(origin));
  return {'Access-Control-Allow-Origin':allowed?origin:'https://libraryafterdark.space','Access-Control-Allow-Methods':'GET, POST, PUT, DELETE, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Vary':'Origin'}}
const json=(request,data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...cors(request),...extra}});

export async function handle(request,env,now=new Date()){
  const url=new URL(request.url);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors(request)});
  if(request.method==='GET'&&url.pathname==='/entries'){const entries=await read(env);return json(request,{entries:entries.slice(0,SHOW),count:entries.length},200,{'Cache-Control':'public, max-age=30'})}
  if(request.method==='POST'&&url.pathname==='/sign'){
    const origin=request.headers.get('Origin')||'';if(!ORIGINS.some(r=>r.test(origin)))return json(request,{error:'Signatures are only taken inside the library.'},403);
    let body;try{body=await request.json()}catch(e){return json(request,{error:'Something went wrong with that signature.'},400)}
    const checked=validate(body);if(checked.error)return json(request,{error:checked.error},400);
    const day=now.toISOString().slice(0,10);
    const who='wait:'+await hash((request.headers.get('CF-Connecting-IP')||'')+'|library-after-dark');
    if(await env.BOOK.get(who))return json(request,{error:'The ink is still wet on your last signature. Please try again in a few minutes.'},429);
    const countKey='count:'+day,count=Number(await env.BOOK.get(countKey)||0);if(count>=DAILY_LIMIT)return json(request,{error:'The book is full for tonight. Please sign tomorrow.'},429);
    const entry={id:crypto.randomUUID().slice(0,8),...checked.entry,d:day},entries=await read(env);
    entries.unshift(entry);await env.BOOK.put('entries',JSON.stringify(entries.slice(0,KEEP)));
    await env.BOOK.put(who,'1',{expirationTtl:WAIT_SECONDS});await env.BOOK.put(countKey,String(count+1),{expirationTtl:172800});
    return json(request,{entry},201);
  }
  // Reading cards.
  const fromLibrary=ORIGINS.some(r=>r.test(request.headers.get('Origin')||''));
  if(request.method==='POST'&&url.pathname==='/card'){
    if(!fromLibrary)return json(request,{error:'Reading cards are only made inside the library.'},403);
    const who='cardwait:'+await hash((request.headers.get('CF-Connecting-IP')||'')+'|reading-card');
    if(await env.BOOK.get(who))return json(request,{error:'A card was made here a moment ago. Please try again in a minute.'},429);
    let code=cardCode();for(let i=0;i<3&&await env.BOOK.get('card:'+await hash(code));i++)code=cardCode();
    await env.BOOK.put('card:'+await hash(code),JSON.stringify({b:{},u:now.getTime()}),{expirationTtl:CARD_TTL});await env.BOOK.put(who,'1',{expirationTtl:60});
    return json(request,{code},201);
  }
  const card=url.pathname.match(/^\/card\/([a-z0-9-]{8,80})$/);
  if(card&&(request.method==='GET'||request.method==='PUT')){
    const code=cleanCode(decodeURIComponent(card[1]));if(!code)return json(request,{error:'That is not a reading card code.'},400);
    const key='card:'+await hash(code);let held;try{held=JSON.parse(await env.BOOK.get(key)||'null')}catch(e){held=null}
    if(!held)return json(request,{error:'No reading card has that code.'},404);
    if(request.method==='GET')return json(request,{books:held.b||{}});
    if(!fromLibrary)return json(request,{error:'Reading cards are only written inside the library.'},403);
    let body;try{body=await request.json()}catch(e){return json(request,{error:'Something went wrong with that card.'},400)}
    const merged=mergeBooks(held.b||{},cleanBooks(body?.books));
    // Nothing new, or written a moment ago: keep the storage for readers who need it.
    if(JSON.stringify(merged)===JSON.stringify(held.b||{})||now.getTime()-(held.u||0)<CARD_QUIET_MS)return json(request,{books:merged,saved:false});
    await env.BOOK.put(key,JSON.stringify({b:merged,u:now.getTime()}),{expirationTtl:CARD_TTL});
    return json(request,{books:merged,saved:true});
  }
  const remove=url.pathname.match(/^\/entries\/([a-z0-9-]{4,40})$/);
  if(request.method==='DELETE'&&remove){
    if(!env.ADMIN_TOKEN||request.headers.get('Authorization')!==`Bearer ${env.ADMIN_TOKEN}`)return json(request,{error:'Not allowed.'},401);
    const entries=await read(env),kept=entries.filter(e=>e.id!==remove[1]);if(kept.length===entries.length)return json(request,{error:'No such signature.'},404);
    await env.BOOK.put('entries',JSON.stringify(kept));return json(request,{removed:remove[1]});
  }
  return json(request,{error:'Not found.'},404);
}

export default {fetch:(request,env)=>handle(request,env)};
