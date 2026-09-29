// Books from Wikisource, for the rooms whose language Project Gutenberg barely has (the Ukrainian Reading Room).
//
// A book in data/new-books-wing.js may be given as 'ws:<page title>' instead of a Gutenberg number. Its text is
// read through Wikisource's own API: the page itself and, when the page is a table of contents, each of its chapter
// subpages in order. The page must link to its author's page (Автор:…), so a book is never taken from the wrong
// writer. Wikisource's navigation, the editors' notes and prefaces, and anything marked not for export are left out.
// The text is kept like a Gutenberg one, with a short header naming Wikisource as its source, and a stable number of
// its own (from 950000, well clear of Gutenberg's) so the reader and the book pages can treat it as any other book.
import {setTimeout as sleep} from 'node:timers/promises';

export const WIKISOURCE_LANGUAGES={uk:{name:'Ukrainian',host:'uk.wikisource.org',author:'Автор',credit:'Текст з Вікіджерел (uk.wikisource.org), суспільне надбання.'}};
const USER_AGENT='LibraryAfterDark/1.0 (https://libraryafterdark.space; free public-domain library)';
// Subpages that are the edition's editors speaking, not the book.
const EDITORIAL=/^(Примітки|Пояснення|Вступне слово|Від редакції|Передмова редактора|Література|Зміст|Словничок|Словник|Коментарі|Додатки)$/i;

export const isWikisource=id=>typeof id==='string'&&id.startsWith('ws:');
export const wikisourcePage=id=>id.slice(3);
// A stable number for a Wikisource page: the same page always gets the same number.
export function wikisourceId(page){let h=2166136261;for(const ch of page){h^=ch.codePointAt(0);h=Math.imul(h,16777619)>>>0}return 950000+h%49999}
export const wikisourceUrl=(page,lang='uk')=>`https://${WIKISOURCE_LANGUAGES[lang].host}/wiki/${encodeURIComponent(page.replace(/ /g,'_')).replace(/%2F/g,'/')}`;

const ENTITIES={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',shy:'',ndash:'–',mdash:'—',laquo:'«',raquo:'»',hellip:'…',rsquo:'’',lsquo:'‘',ldquo:'“',rdquo:'”',bdquo:'„'};
const decode=s=>s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi,(m,e)=>e[0]==='#'?String.fromCodePoint(e[1].toLowerCase()==='x'?parseInt(e.slice(2),16):parseInt(e.slice(1),10)):ENTITIES[e.toLowerCase()]??m);
const SKIP_CLASS=/\b(ws-noexport|noprint|ws-header|headertemplate|mw-editsection|reference|references|mw-references-wrap|navbox|metadata|catlinks|licensetpl|licenseContainer|mw-cite-backlink|toc|pagenum|ws-pagenum|mw-empty-elt|sisterproject)\b/;
const SKIP_TAG=/^(style|script|sup|noscript|figure)$/;
const VOID=/^(br|hr|img|input|meta|link|wbr|col|area|base|source|track)$/;
const BLOCK=/^(p|div|h[1-6]|li|dd|dt|tr|blockquote|center|pre|table|ul|ol|dl|section)$/;

// Wikisource's rendered HTML to plain text, and the links it holds, in the order they appear. The page's header
// (with its author link) is read for links but left out of the text.
export function htmlToText(html){
  const out=[],links=[],stack=[];let skipDepth=0;
  const re=/<(\/?)([a-zA-Z0-9]+)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>|<!--[\s\S]*?-->|([^<]+)/g;let m;
  while((m=re.exec(html))){
    if(m[5]!==undefined){if(!skipDepth)out.push(decode(m[5]).replace(/[ \t\r\n]+/g,' '));continue}
    if(!m[2])continue;
    const closing=m[1]==='/',tag=m[2].toLowerCase(),attrs=m[3]||'',selfClose=m[4]==='/'||VOID.test(tag);
    if(closing){
      // Close back to the matching tag, however sloppy the markup.
      for(let i=stack.length-1;i>=0;i--)if(stack[i].tag===tag){while(stack.length>i){const e=stack.pop();if(e.skip)skipDepth--}break}
      if(!skipDepth&&BLOCK.test(tag))out.push(tag==='p'||/^h/.test(tag)?'\n\n':'\n');
      continue;
    }
    if(tag==='a'){const title=attrs.match(/\btitle="([^"]*)"/)?.[1],href=attrs.match(/\bhref="([^"]*)"/)?.[1]||'';if(title&&href.startsWith('/wiki/'))links.push({title:decode(title),header:skipDepth>0})}
    if(tag==='br'){if(!skipDepth)out.push('\n');continue}
    if(selfClose)continue;
    const cls=attrs.match(/\bclass="([^"]*)"/)?.[1]||'',id=attrs.match(/\bid="([^"]*)"/)?.[1]||'';
    const skip=SKIP_TAG.test(tag)||SKIP_CLASS.test(cls)||/^(headertemplate|toc|catlinks)$/.test(id);
    stack.push({tag,skip});if(skip)skipDepth++;
    if(!skipDepth&&BLOCK.test(tag))out.push(/^h/.test(tag)||tag==='p'?'\n\n':'\n');
  }
  const text=out.join('').split('\n').map(line=>line.replace(/\s+/g,' ').trim()).join('\n').replace(/\n{3,}/g,'\n\n').trim();
  return {text,links};
}

async function api(params,lang){
  const url=`https://${WIKISOURCE_LANGUAGES[lang].host}/w/api.php?`+new URLSearchParams({format:'json',formatversion:'2',...params});
  for(let attempt=0;attempt<3;attempt++){
    try{await sleep(400);const r=await fetch(url,{headers:{'User-Agent':USER_AGENT},signal:AbortSignal.timeout(60000)});if(r.ok)return await r.json()}catch(error){}
    await sleep(2000*(attempt+1));
  }
  return null;
}
async function parse(page,lang){const j=await api({action:'parse',page,prop:'text|categories',redirects:'1',disableeditsection:'1',disabletoc:'1'},lang);if(!j?.parse)return null;return {title:j.parse.title,html:j.parse.text,categories:(j.parse.categories||[]).map(c=>c.category)}}

const norm=s=>s.normalize('NFC').toLowerCase().replace(/[’'ʼ`]/g,'').replace(/\s+/g,' ').trim();
// The author as shelved ("Тарас Шевченко", "Григорій Квітка-Основ'яненко"): their page must be linked from the book.
function byAuthor(links,categories,author,lang){
  const want=norm(author.replace(/\s*\(.*\)\s*$/,'')),last=want.split(' ').pop(),prefix=norm(WIKISOURCE_LANGUAGES[lang].author+':');
  const named=links.map(l=>norm(l.title)).filter(t=>t.startsWith(prefix)).map(t=>t.slice(prefix.length));
  return named.some(name=>name===want||name.split(' ').includes(last)||name.endsWith(' '+last)||name===last)||categories.some(c=>norm(c.replace(/_/g,' ')).includes(last));
}

// The whole book: the page, and its chapters when the page is only a table of contents.
export async function fetchWikisource(page,author,lang='uk',say=()=>{}){
  const root=await parse(page,lang);if(!root){say(`  ${page}: not found on Wikisource`);return null}
  const first=htmlToText(root.html);
  if(!byAuthor(first.links,root.categories,author,lang)){say(`  ${root.title}: does not name ${author} as its author`);return null}
  const parts=[],seen=new Set([root.title]);
  const subpages=(title,links)=>{const found=[];for(const l of links){if(l.header||!l.title.startsWith(title+'/')||seen.has(l.title))continue;if(EDITORIAL.test(l.title.split('/').pop()))continue;seen.add(l.title);found.push(l.title)}return found};
  async function collect(title,{text,links},depth){
    const children=depth<2?subpages(title,links):[];
    // A table of contents is mostly links; a chapter is mostly text.
    if(children.length&&(text.length<4000||text.length<children.length*400)){
      for(const child of children){const p=await parse(child,lang);if(!p)continue;const mark=parts.length;parts.push(child.split('/').pop());
        await collect(p.title,htmlToText(p.html),depth+1);if(parts.length===mark+1)parts.pop()}
      return}
    if(text.trim())parts.push(text.trim());
  }
  await collect(root.title,first,0);
  const body=parts.join('\n\n\n').trim();
  if(body.length<1500){say(`  ${root.title}: only ${body.length} characters of text`);return null}
  return {page:root.title,url:wikisourceUrl(root.title,lang),body};
}

// The kept text: a Gutenberg-like header (so the rest of the library can read it) and Wikisource's credit.
export function wikisourceText({title,author,lang='uk',page,url,body}){
  const L=WIKISOURCE_LANGUAGES[lang];
  return `Title: ${title}\nAuthor: ${author}\nLanguage: ${L.name}\nSource: Wikisource, ${url}\nRights: Public domain. Transcribed and proofread by the contributors to ${L.host}.\n\n`+
    `*** START OF THE WIKISOURCE TEXT: ${title.toUpperCase()} ***\n\n${L.credit}\n\n${body}\n\n*** END OF THE WIKISOURCE TEXT ***\n`;
}
// Whether a kept text is the Wikisource book asked for.
export const isWikisourceText=(text,title)=>/^Source: Wikisource, /m.test(text.slice(0,2000))&&text.slice(0,500).match(/^Title:\s*(.+)$/m)?.[1]?.trim()===title;
