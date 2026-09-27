// The visitors' book: a very small Cloudflare Worker that keeps the signatures readers leave by the entrance of
// The Library After Dark. A signature is only ever a first name (or initials), a country, a book from the library
// and one line chosen from a fixed list, so there is no free text to moderate. Nothing else is stored: the
// reader's address is only used, hashed, to stop the same person signing more than once every ten minutes.
//
//   GET    /entries          the latest signatures, newest first
//   POST   /sign             {name, country, book, phrase}   (book: a Project Gutenberg number, or 0)
//   DELETE /entries/:id      remove one signature (needs the ADMIN_TOKEN secret as a Bearer token)
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
  return {'Access-Control-Allow-Origin':allowed?origin:'https://libraryafterdark.space','Access-Control-Allow-Methods':'GET, POST, DELETE, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Vary':'Origin'}}
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
  const remove=url.pathname.match(/^\/entries\/([a-z0-9-]{4,40})$/);
  if(request.method==='DELETE'&&remove){
    if(!env.ADMIN_TOKEN||request.headers.get('Authorization')!==`Bearer ${env.ADMIN_TOKEN}`)return json(request,{error:'Not allowed.'},401);
    const entries=await read(env),kept=entries.filter(e=>e.id!==remove[1]);if(kept.length===entries.length)return json(request,{error:'No such signature.'},404);
    await env.BOOK.put('entries',JSON.stringify(kept));return json(request,{removed:remove[1]});
  }
  return json(request,{error:'Not found.'},404);
}

export default {fetch:(request,env)=>handle(request,env)};
