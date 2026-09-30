// A plain web page for every book in the library, so that people searching for a book can find it, read the
// librarian's note about it, and step straight into the library to read it (/?book=ID opens it in the reader).
//
// The catalogue is rebuilt here exactly as game.js builds it: the core list in game.js, then the railway,
// curious-room, after-dark and open-access records, the Verne, Doyle, Wells and Haggard catalogues and the new
// arrivals that have been checked and bundled (data/new-books-resolved.js). Notes come from
// data/librarian-notes.json, the notes files in data/ and the records themselves.
//
// Writes book/<id>-<slug>.html for each book, book/index.html (the catalogue by shelf), book/authors.html,
// book/book.css, es/index.html and pt/index.html (each International Wing room's books, in its language), sitemap.xml and robots.txt. A book in another
// language (the International Wing's rooms) gets its page in that language too. Run by .github/workflows/book-pages.yml whenever the catalogue changes.
//
//   node scripts/book-pages.mjs            write the pages
//   OUT=/tmp/pages node scripts/book-pages.mjs   write them somewhere else (the tests do this)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {ROOM_LANGUAGES,resolvedKey} from './new-books.mjs';

const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const OUT=path.resolve(process.env.OUT||root),SITE='https://libraryafterdark.space';
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

// ---------- the catalogue, as game.js builds it ----------
function arrayLiteral(source,start){const open=source.indexOf('[',start);let depth=0,quote=null;for(let i=open;i<source.length;i++){const ch=source[i];
  if(quote){if(ch==='\\'){i++;continue}if(ch===quote)quote=null;continue}if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue}if(ch==='[')depth++;else if(ch===']'&&--depth===0)return source.slice(open,i+1)}throw new Error('unterminated array')}
export function loadCatalogue(){
  const context={window:{ATHENAEUM_EXTRA_NOTES:{},ATHENAEUM_COVER_DESIGNS:{}},console};context.window.window=context.window;vm.createContext(context);
  const html=read('index.html'),files=[...html.matchAll(/startupScript\('(data\/[^']+)'\)/g)].map(m=>m[1]);
  for(const file of files){try{vm.runInContext(read(file),context,{filename:file})}catch(error){/* a data file that needs the browser is not needed here */}}
  const w=context.window,game=read('game.js');
  const core=vm.runInNewContext(arrayLiteral(game,game.indexOf('const books=[')));
  const books=[],byId=new Map();
  const add=(record,extra={})=>{if(byId.has(record.id))return byId.get(record.id);const book={...record,...extra};books.push(book);byId.set(book.id,book);return book};
  for(const [id,title,author,category] of core)add({id,title,author,category,source:'Project Gutenberg'});
  for(const list of [w.ATHENAEUM_RAILWAY_BOOKS,w.ATHENAEUM_CURIOUS_BOOKS,w.ATHENAEUM_AFTER_DARK_BOOKS])for(const record of list||[])add({...record,source:'Project Gutenberg'});
  for(const record of w.ATHENAEUM_OPEN_ACCESS_BOOKS||[]){const source=(w.ATHENAEUM_OPEN_ACCESS_SOURCES||{})[record.source]||{};add({...record,sourceKey:record.source,source:source.name||record.source})}
  for(const [key,author,category] of [['ATHENAEUM_VERNE_BOOKS','Jules Verne','Extraordinary Voyages'],['ATHENAEUM_DOYLE_BOOKS','Arthur Conan Doyle','The Consulting Room'],['ATHENAEUM_WELLS_BOOKS','H. G. Wells','The Time Laboratory'],['ATHENAEUM_HAGGARD_BOOKS','H. Rider Haggard','The Lost Kingdoms']])
    for(const [id,title] of w[key]||[])add({id,title,author,category,source:'Project Gutenberg'});
  const resolved=w.ATHENAEUM_NEW_BOOKS_RESOLVED?.books||{},arrivalNotes={},arrivalRooms={},words={};
  for(const [,title,author,category,room,note] of [...w.ATHENAEUM_NEW_BOOKS||[],...w.ATHENAEUM_NEW_BOOKS_WING||[]]){const found=resolved[resolvedKey(title,room)];if(!found?.id)continue;const added=add({id:found.id,title,author,category,...(found.source==='wikisource'?{source:'Вікіджерела (Wikisource)',sourceKey:'wikisource',sourceUrl:found.page,licence:'суспільне надбання (public domain)'}:{source:'Project Gutenberg'})});if(ROOM_LANGUAGES[room])added.language=ROOM_LANGUAGES[room];if(note&&!arrivalNotes[found.id])arrivalNotes[found.id]=note;(arrivalRooms[found.id]||(arrivalRooms[found.id]=[])).push(room);if(found.words)words[found.id]=found.words}
  // The Verne descent's companion books carry notes of their own in game.js.
  const subterranean=vm.runInNewContext(arrayLiteral(game,game.indexOf('const subterraneanBooks=')));
  const notes={...w.ATHENAEUM_EXTRA_NOTES};for(const [id,,,,note] of subterranean)if(!notes[id])notes[id]=note;
  const json=JSON.parse(read('data/librarian-notes.json'));
  const levels=w.ATHENAEUM_LEARNER_LEVELS||(()=>{const c={window:{}};vm.runInNewContext(read('data/learner-levels.js'),c);return c.window.ATHENAEUM_LEARNER_LEVELS||{}})();
  for(const book of books){
    book.note=json[book.id]||notes[book.id]||arrivalNotes[book.id]||book.note||book.depotNote?.replace(/^[A-Z &’',-]+ — /,'')||null;
    book.words=words[book.id]||levels[book.id]?.[2]||null;book.arrivalRooms=arrivalRooms[book.id]||[];book.cover=(w.ATHENAEUM_COVER_DESIGNS||{})[book.id]||null;
  }
  return {books,whereIs:roomsFrom(books)};
}

// ---------- where each book lives ----------
const ROOM_NAMES={secret:'The secret bookcase in the west wing','evening-quick':'The Evening Room','evening-hour':'The Evening Room','evening-evening':'The Evening Room',
  'learners-1':'The English Reading Room','learners-2':'The English Reading Room','learners-3':'The English Reading Room','learners-4':'The English Reading Room','learners-short':'The English Reading Room',
  signal:'The Signal House, on the night railway',tide:'Tidebound Quay, on the night railway',mars:'The Reading Room of Helium, on Mars',periodicals:'The Periodicals Room',spanish:'The International Wing',portuguese:'The Portuguese Reading Room',chinese:'The Chinese Reading Room',french:'The French Reading Room',latin:'The Latin Reading Room',ukrainian:'The Ukrainian Reading Room'};
const CURIOUS={horologist:'The Horologist’s Study',conservatory:'The Night Conservatory',parlour:'The Ghost-Story Parlour',attic:'The attic behind the curious doors',
  repository:'The Repository',unread:'The Unread Room',returning:'The Room of Returning Names',quiet:'The Quiet Stacks',sorting:'The Sorting Room',departures:'Departures'};
// Places with a link straight into them (/?room=…, handled in game.js).
const ROOM_LINKS={'The International Wing':'international-wing','The Portuguese Reading Room':'portuguese-room','The Chinese Reading Room':'chinese-room','The French Reading Room':'french-room','The Latin Reading Room':'latin-room','The Ukrainian Reading Room':'ukrainian-room','The Evening Room':'evening-room','The English Reading Room':'learners-room','The Periodicals Room':'periodicals-room','The Reading Room of Helium, on Mars':'mars',
  'The Selenite Reading Outpost, on the Moon':'moon','The Consulting Room':'consulting-room','The Time Laboratory':'time-laboratory','The Lost Kingdoms':'lost-kingdoms','The Verne rooms':'verne-rooms'};
const CATEGORY_ROOMS={'Extraordinary Voyages':'The Verne rooms','The Consulting Room':'The Consulting Room','The Time Laboratory':'The Time Laboratory','The Lost Kingdoms':'The Lost Kingdoms'};
function idsIn(file,pattern){const source=read(file),match=source.match(pattern);return match?[...match[1].matchAll(/\d+/g)].map(m=>Number(m[0])):[]}
function roomsFrom(books){
  const evening=new Set(idsIn('evening-room.js',/const GROUPS=\[([\s\S]*?)\];/)),learners=new Set([...idsIn('learners-room.js',/const SHELVES=\[([\s\S]*?)\];/),...idsIn('learners-room.js',/const SHORT=\[([^\]]*)\]/)]);
  const moon=new Set(idsIn('high-staircase.js',/const lunarCollection=\[([^\]]*)\]/)),mars=new Set(idsIn('mars.js',/const SHELF=\[([^\]]*)\]/)),railway=new Set();
  for(const book of books)if(book.depotNote)railway.add(book.id);
  return book=>{
    const places=new Set();
    for(const room of book.arrivalRooms)if(ROOM_NAMES[room])places.add(ROOM_NAMES[room]);
    if(CURIOUS[book.room])places.add(CURIOUS[book.room]);
    if(evening.has(book.id))places.add('The Evening Room');if(learners.has(book.id))places.add('The English Reading Room');
    if(moon.has(book.id))places.add('The Selenite Reading Outpost, on the Moon');if(mars.has(book.id))places.add('The Reading Room of Helium, on Mars');
    if(railway.has(book.id)&&!book.sourceKey)places.add('The Collections Depot, on the night railway');
    if(CATEGORY_ROOMS[book.category])places.add(CATEGORY_ROOMS[book.category]);
    return [...places];
  };
}

// ---------- the pages ----------
const escape=text=>String(text??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
// Chinese titles keep their characters (/book/24264-紅樓夢.html): a page name of pinyin would mean nothing to their readers.
// Ukrainian titles and names are written in Latin letters in addresses, by Ukraine's official system (2010).
const UK_LATIN={а:'a',б:'b',в:'v',г:'h',ґ:'g',д:'d',е:'e',є:'ie',ж:'zh',з:'z',и:'y',і:'i',ї:'i',й:'i',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ь:'',ю:'iu',я:'ia'},UK_FIRST={є:'ye',ї:'yi',й:'y',ю:'yu',я:'ya'};
export const ukrainianLatin=text=>String(text).toLowerCase().replace(/зг/g,'zgh').replace(/[’'ʼ]/g,'').replace(/[а-щьюяєіїґ]/g,(ch,i,all)=>(i===0||!/[а-щьюяєіїґ]/.test(all[i-1]))&&UK_FIRST[ch]||UK_LATIN[ch]);
export function slug(text){return (/[а-щьюяєіїґ]/i.test(text)?ukrainianLatin(text):String(text)).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'').replace(/&/g,' and ').replace(/[^a-z0-9\p{Script=Han}]+/gu,'-').replace(/^-+|-+$/g,'').slice(0,60).replace(/-+$/,'')||'book'}
export const pageName=book=>`${book.id}-${slug(book.title)}.html`;
export function readingTime(words,lang='en'){if(!words)return null;
  // Chinese is counted by the character (scripts/new-books.mjs); a reader takes in some 350 of them a minute.
  if(lang.startsWith('zh')){const m=Math.max(1,Math.round(words/350));if(m<15)return `${m} 分鐘`;const r=Math.round(m/5)*5;if(r<60)return `${r} 分鐘`;const h=Math.floor(r/60),rest=r%60;return rest?`${h} 小時 ${rest} 分鐘`:`${h} 小時`}
  if(lang==='uk'){const m=Math.max(1,Math.round(words/250));if(m<15)return `${m} хв`;const r=Math.round(m/5)*5;if(r<60)return `${r} хв`;const h=Math.floor(r/60),rest=r%60;return rest?`${h} год ${rest} хв`:`${h} год`}
  const es=lang==='es'||lang==='pt'||lang==='fr',m=Math.max(1,Math.round(words/250));if(m<15)return `${m} ${es?'minutos':'minutes'}`;const r=Math.round(m/5)*5;if(r<60)return `${r} ${es?'minutos':'minutes'}`;const h=Math.floor(r/60),rest=r%60;return rest?`${h} ${es?'h':'hr'} ${rest} min`:lang==='fr'?(h===1?'une heure':`${h} heures`):es?(h===1?'una hora':`${h} horas`):`${h===1?'an hour':`${h} hours`}`}
// The words around each page, in the language of its book.
const WORDS={
  en:{lang:'en',by:'by',read:'Read it in the Library After Dark',time:'Reading time',about:'About',where:'Where to find it',onShelves:shelf=>`On the ${shelf} shelves`,edition:'Edition',
    pd:'In the public domain in the United States.',licence:'Licence',librarian:'The librarian',moreBy:author=>`More by ${author}`,also:shelf=>`Also on the ${shelf} shelves`,
    shelf:shelf=>shelf,place:place=>place,
    nav:'<a href="/book/">Catalogue</a><a href="/book/authors.html">Authors</a><a class="enter" href="/">Enter the library</a>',
    footer:'The Library After Dark is a 3D library you can walk through in your browser, with public-domain books to read. <a href="/">Step inside</a>.'},
  es:{lang:'es',by:'de',read:'Léelo en la Library After Dark',time:'Tiempo de lectura',about:'Unos',where:'Dónde encontrarlo',onShelves:()=>'En el ala internacional',edition:'Edición',
    pd:'De dominio público en los Estados Unidos.',licence:'Licencia',librarian:'La bibliotecaria',moreBy:author=>`Más de ${author}`,also:()=>'Más libros en español',
    shelf:shelf=>SHELVES_ES[shelf]||shelf,place:place=>({'The International Wing':'El ala internacional: Sala de lectura en español'})[place]||place,
    nav:'<a href="/es/">Libros en español</a><a href="/book/">Catalogue</a><a class="enter" href="/?room=international-wing">Entrar en la biblioteca</a>',
    footer:'The Library After Dark es una biblioteca en 3D que se recorre desde el navegador, con libros de dominio público para leer. <a href="/?room=international-wing">Entrar</a>.'},
  pt:{lang:'pt',by:'de',read:'Leia na Library After Dark',time:'Tempo de leitura',about:'Cerca de',where:'Onde encontrá-lo',onShelves:()=>'Na ala internacional',edition:'Edição',
    pd:'Em domínio público nos Estados Unidos.',licence:'Licença',librarian:'A bibliotecária',moreBy:author=>`Mais de ${author}`,also:()=>'Mais livros em português',
    shelf:shelf=>SHELVES_PT[shelf]||shelf,place:place=>({'The Portuguese Reading Room':'A ala internacional: Sala de leitura em português','The Lost Kingdoms':'Os Reinos Perdidos (em inglês)'})[place]||place,
    nav:'<a href="/pt/">Livros em português</a><a href="/book/">Catalogue</a><a class="enter" href="/?room=portuguese-room">Entrar na biblioteca</a>',
    footer:'The Library After Dark é uma biblioteca em 3D que se percorre no navegador, com livros de domínio público para ler. <a href="/?room=portuguese-room">Entrar</a>.'},
  fr:{lang:'fr',by:'de',read:'Lire dans la Library After Dark',time:'Temps de lecture',about:'Environ',where:'Où le trouver',onShelves:()=>'Dans l’aile internationale',edition:'Édition',
    pd:'Dans le domaine public aux États-Unis.',licence:'Licence',librarian:'La bibliothécaire',moreBy:author=>`Du même auteur : ${author}`,also:()=>'D’autres livres en français',
    shelf:shelf=>SHELVES_FR[shelf]||shelf,place:place=>({'The French Reading Room':'L’aile internationale : Salle de lecture en français','The Verne rooms':'Les salles Jules Verne (en anglais)'})[place]||place,
    nav:'<a href="/fr/">Livres en français</a><a href="/book/">Catalogue</a><a class="enter" href="/?room=french-room">Entrer dans la bibliothèque</a>',
    footer:'The Library After Dark est une bibliothèque en 3D que l’on parcourt dans son navigateur, avec des livres du domaine public à lire. <a href="/?room=french-room">Entrer</a>.'},
  zh:{lang:'zh-Hant',by:'作者',read:'在 Library After Dark 裡閱讀',time:'閱讀時間',about:'約',where:'在圖書館的哪裡',onShelves:()=>'在國際館',edition:'版本',
    pd:'在美國屬於公有領域。',licence:'授權',librarian:'館員',moreBy:author=>`${author.replace(/\s*\(.*\)$/,'')}的其他作品`,also:()=>'更多中文書',
    shelf:shelf=>SHELVES_ZH[shelf]||shelf,place:place=>({'The Chinese Reading Room':'國際館：中文閱覽室'})[place]||place,
    pageTitle:(book,edition)=>`《${book.title}》${edition} ${book.author.replace(/\s*\(.*\)$/,'')} · The Library After Dark`,
    nav:'<a href="/zh/">中文書</a><a href="/book/">Catalogue</a><a class="enter" href="/?room=chinese-room">進入圖書館</a>',
    footer:'The Library After Dark 是一座可以在瀏覽器裡走進去的 3D 圖書館，館裡的公有領域書籍都可以免費閱讀。<a href="/?room=chinese-room">進去看看</a>。'}
};
// Latin books have their pages in English, like their notes, with a way back to the Latin shelf.
WORDS.la={...WORDS.en,also:()=>'More Latin books',place:place=>place,onShelves:()=>'In the International Wing',
  nav:'<a href="/la/">Libri Latini</a><a href="/book/">Catalogue</a><a class="enter" href="/?room=latin-room">Enter the library</a>'};
// Ukrainian books come from Wikisource, and their pages are in Ukrainian.
WORDS.uk={lang:'uk',by:'',pageTitle:(book,edition)=>`${book.title}${edition} — ${book.author} · The Library After Dark`,read:'Читати в Library After Dark',time:'Час читання',about:'Близько',where:'Де знайти',onShelves:()=>'У Міжнародному крилі',edition:'Видання',
  pd:'Суспільне надбання.',licence:'Статус',librarian:'Бібліотекарка',moreBy:author=>`Ще від автора: ${author}`,also:()=>'Інші книжки українською',
  shelf:shelf=>SHELVES_UK[shelf]||shelf,place:place=>({'The Ukrainian Reading Room':'Міжнародне крило: Українська читальня'})[place]||place,
  nav:'<a href="/uk/">Книжки українською</a><a href="/book/">Catalogue</a><a class="enter" href="/?room=ukrainian-room">Увійти до бібліотеки</a>',
  footer:'The Library After Dark — це 3D-бібліотека, якою можна ходити просто в браузері, з книжками суспільного надбання. <a href="/?room=ukrainian-room">Увійти</a>.'};
const wordsFor=book=>WORDS[book?.language]||WORDS.en;
function description(note,book){const first=(note||'').match(/^.{40,}?[.!?](\s|$)/)?.[0]?.trim()||(note||'').match(/^.{20,}?[。！？]/)?.[0]||note||`${book.title} by ${book.author}.`;return first.length>158?first.slice(0,155).replace(/\s+\S*$/,'')+'…':first}
const PALETTES=[['#182d2a','#c49a53'],['#4a1618','#d6b36c'],['#18243d','#c59b56'],['#432612','#d2ad68'],['#24201d','#ba8741']];
function coverHtml(book){
  if(fs.existsSync(path.join(root,`covers/books/${book.id}.jpg`)))return `<img class="cover" src="/covers/books/${book.id}.jpg" alt="The cover of ${escape(book.title)}" width="300" height="450">`;
  const [bg,fg]=book.cover||PALETTES[Math.abs(book.id)%PALETTES.length];
  return `<div class="cover drawn" style="--bg:${escape(bg)};--fg:${escape(fg)}" role="img" aria-label="The cover of ${escape(book.title)}"><small>THE ATHENAEUM</small><strong>${escape(book.title)}</strong><span>${escape(book.author)}</span></div>`;
}
function sourceLink(book){
  if(book.language==='es')return `<a href="https://www.gutenberg.org/ebooks/${book.id}" rel="noopener">Project Gutenberg, libro electrónico n.º ${book.id}</a>`;
  if(book.language==='fr')return `<a href="https://www.gutenberg.org/ebooks/${book.id}" rel="noopener">Project Gutenberg, livre numérique n° ${book.id}</a>`;
  if(book.language==='zh')return `<a href="https://www.gutenberg.org/ebooks/${book.id}" rel="noopener">Project Gutenberg 電子書第 ${book.id} 號</a>`;
  if(book.language==='pt')return `<a href="https://www.gutenberg.org/ebooks/${book.id}" rel="noopener">Project Gutenberg, livro eletrónico n.º ${book.id}</a>`;
  if(book.sourceKey)return book.sourceUrl?`<a href="${escape(book.sourceUrl)}" rel="noopener">${escape(book.source)}</a>`:escape(book.source);
  return `<a href="https://www.gutenberg.org/ebooks/${book.id}" rel="noopener">Project Gutenberg, eBook #${book.id}</a>`;
}
function layout({title,description:desc,canonical,body,head='',type='website',words=WORDS.en}){
  return `<!doctype html>
<html lang="${words.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
<meta name="description" content="${escape(desc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="The Library After Dark">
<meta property="og:title" content="${escape(title)}">
<meta property="og:description" content="${escape(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE}/assets/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/book/book.css">
${head}</head>
<body>
<header class="top"><a class="home" href="/">The Library After Dark</a><nav>${words.nav}</nav></header>
${body}
<footer><p>${words.footer}</p></footer>
</body>
</html>
`;
}
function bookPage(book,{whereIs,byAuthor,byShelf,byLanguage,editions}){
  // Several editions of one title (the Verne collection has a few) get their eBook number, so no two pages share a title.
  const edition=editions.get(`${book.title}|${book.author}`)>1?` (eBook #${book.id})`:'';
  const T=wordsFor(book),url=`${SITE}/book/${pageName(book)}`,note=book.note,time=readingTime(book.words,T.lang),places=whereIs(book);
  const more=(list,label)=>list.length?`<section class="more"><h2>${label}</h2><ul>${list.map(b=>`<li><a href="/book/${pageName(b)}">${escape(b.title)}</a><span>${escape(b.author)}</span></li>`).join('')}</ul></section>`:'';
  const sameAuthor=(byAuthor.get(book.author)||[]).filter(b=>b!==book).slice(0,6);
  const shelf=(book.language?byLanguage.get(book.language)||[]:byShelf.get(book.category)||[]).filter(b=>b!==book&&b.author!==book.author),start=shelf.length?Math.abs(book.id)%shelf.length:0,neighbours=[...shelf.slice(start),...shelf.slice(0,start)].slice(0,6);
  const ld={'@context':'https://schema.org','@type':'Book',name:book.title,author:{'@type':'Person',name:book.author},url,inLanguage:book.language||'en',isAccessibleForFree:true,genre:book.category,
    ...(book.sourceKey?{}:{sameAs:`https://www.gutenberg.org/ebooks/${book.id}`}),...(note?{review:{'@type':'Review',reviewBody:note,author:{'@type':'Organization',name:'The Library After Dark'}}}:{})};
  const body=`<main class="book">
${coverHtml(book)}
<div class="about">
<p class="shelf">${escape(T.shelf(book.category||''))}</p>
<h1>${escape(book.title)}${edition?`<small>${escape(edition.trim())}</small>`:''}</h1>
<p class="author">${T.by} <a href="/book/authors.html#${slug(book.author)}">${escape(book.author)}</a></p>
${note?`<blockquote><p>${escape(note)}</p><cite>${T.librarian}</cite></blockquote>`:''}
<a class="read" href="/?book=${book.id}">${T.read}</a>
<dl>
${time?`<dt>${T.time}</dt><dd>${T.about} ${time}</dd>`:''}
${places.length?`<dt>${T.where}</dt><dd>${places.map(place=>ROOM_LINKS[place]?`<a href="/?room=${ROOM_LINKS[place]}">${escape(T.place(place))}</a>`:escape(T.place(place))).join('; ')}</dd>`:`<dt>${T.where}</dt><dd>${escape(T.onShelves(book.category||'library'))}</dd>`}
<dt>${T.edition}</dt><dd>${sourceLink(book)}. ${book.sourceKey&&book.licence?`${T.licence}: ${escape(book.licence)}.`:T.pd}</dd>
</dl>
</div>
</main>
${more(sameAuthor,escape(T.moreBy(book.author)))}${more(neighbours,escape(T.also(book.category||'same')))}`;
  return layout({title:T.pageTitle?T.pageTitle(book,edition):`${book.title}${edition} ${T.by} ${book.author} · The Library After Dark`,description:description(note,book),canonical:url,type:'book',body,words:T,
    head:`<script type="application/ld+json">${JSON.stringify(ld).replace(/</g,'\\u003c')}</script>\n`});
}
function cataloguePage(books,byShelf){
  const shelves=[...byShelf.keys()].sort((a,b)=>a.localeCompare(b));
  const body=`<main class="catalogue">
<h1>The catalogue</h1>
<p class="intro">Every book in the Library After Dark, ${books.length} in all, each with a note from the librarian. Choose one to read about it, or step inside and find it on its shelf.${books.some(b=>b.language==='es')?' <a href="/es/" lang="es">Libros en español</a>.':''}${books.some(b=>b.language==='pt')?' <a href="/pt/" lang="pt">Livros em português</a>.':''}</p>
<label class="filter">Find a title or author <input type="search" id="filter" placeholder="Dracula, Austen, the Moon…" autocomplete="off"></label>
${shelves.map(shelf=>`<section class="shelf-list"><h2 id="${slug(shelf)}">${escape(shelf)}</h2><ul>${byShelf.get(shelf).map(b=>`<li><a href="/book/${pageName(b)}">${escape(b.title)}</a><span>${escape(b.author)}</span></li>`).join('')}</ul></section>`).join('\n')}
</main>
<script>
const input=document.getElementById('filter');input.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();for(const li of document.querySelectorAll('.shelf-list li'))li.hidden=!!q&&!li.textContent.toLowerCase().includes(q);for(const s of document.querySelectorAll('.shelf-list'))s.hidden=!!q&&!s.querySelector('li:not([hidden])')});
</script>`;
  return layout({title:'The catalogue · The Library After Dark',description:`Every book in the Library After Dark: ${books.length} public-domain classics, each with a note from the librarian, to read in a 3D library in your browser.`,canonical:`${SITE}/book/`,body});
}
function authorsPage(byAuthor){
  const authors=[...byAuthor.keys()].sort((a,b)=>a.split(' ').pop().localeCompare(b.split(' ').pop())||a.localeCompare(b));
  const body=`<main class="catalogue">
<h1>Authors</h1>
<p class="intro">${authors.length} writers, from Aesop to Virginia Woolf.</p>
${authors.map(author=>`<section class="shelf-list"><h2 id="${slug(author)}">${escape(author)}</h2><ul>${byAuthor.get(author).map(b=>`<li><a href="/book/${pageName(b)}">${escape(b.title)}</a><span>${escape(b.category||'')}</span></li>`).join('')}</ul></section>`).join('\n')}
</main>`;
  return layout({title:'Authors · The Library After Dark',description:`The ${authors.length} writers in the Library After Dark, with every one of their books on the shelves.`,canonical:`${SITE}/book/authors.html`,body});
}
// The books of each International Wing room, in their own language: the pages its letters and links point to.
const SHELVES_ES={Comedy:'Comedia',Society:'Novela y sociedad',Drama:'Teatro',Satire:'Picaresca y sátira',Poetry:'Poesía',Legend:'Leyendas',History:'Historia',Philosophy:'Ideas',Conscience:'Conciencia',Romance:'Amor',Ghosts:'Cuentos de miedo',Strange:'Lo extraño',Wonder:'Para los más jóvenes',Epic:'Epopeya'};
const SHELVES_PT={Romance:'Amor',Satire:'Sátira',Society:'Romance e sociedade',Poetry:'Poesia',Legend:'Lendas',Adventure:'Aventura',Epic:'Epopeia',Strange:'O estranho',Drama:'Teatro',Journey:'Viagens',History:'História',Philosophy:'Ideias'};
const SHELVES_FR={Society:'Roman et société',Romance:'Amour',Adventure:'Aventure',Poetry:'Poésie',Drama:'Théâtre',Philosophy:'Idées',Satire:'Satire et conte philosophique',Strange:'L’étrange',Mystery:'Mystère',Wonder:'Contes',History:'Histoire',Journey:'Voyages',Essays:'Essais'};
const SHELVES_LA={Epic:'Epic',Poetry:'Poetry',History:'History',Oratory:'Oratory',Philosophy:'Philosophy and faith',Drama:'Drama',Science:'Science',Food:'The kitchen',Learners:'For learners'};
const SHELVES_UK={Poetry:'Поезія',Epic:'Поеми',Drama:'Драма',Society:'Повісті й романи',Romance:'Про кохання',Legend:'Легенди й казки',Satire:'Сміх і сатира',History:'Історія',Philosophy:'Думки',Stories:'Новели й оповідання',Fables:'Байки'};
const SHELVES_ZH={Society:'世情小說',Epic:'歷史演義',Legend:'神魔與奇想',Satire:'諷刺小說',Ghosts:'志怪',Essays:'散文與筆記',Modern:'魯迅',Philosophy:'諸子與經典',Poetry:'詩詞',History:'史書',Drama:'戲曲',Adventure:'俠義',Wonder:'蒙學'};
// Ukrainian numbers choose their noun: 1 твір, 2–4 твори, 5–20 творів (21 твір, 24 твори…).
const ukWorks=n=>n%10===1&&n%100!==11?'твір':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'твори':'творів';
const LANDINGS={
  es:{path:'es',shelves:SHELVES_ES,other:'Otros',h1:'Libros en español',room:'international-wing',button:'Entrar en la Sala de lectura en español',
    intro:n=>`${n} clásicos de España, de América y de Filipinas, de Cervantes a Rubén Darío, para leer gratis en una biblioteca en 3D que se recorre desde el navegador, también desde el móvil. Están en la Sala de lectura en español, en el ala internacional, cada uno con una nota de la bibliotecaria. Sin descargas, sin registro y sin anuncios.`,
    title:'Libros en español · The Library After Dark',description:n=>`${n} clásicos en español para leer gratis en una biblioteca en 3D, cada uno con una nota de la bibliotecaria: Cervantes, Galdós, Bécquer, Rubén Darío, Rizal y muchos más.`},
  pt:{path:'pt',shelves:SHELVES_PT,other:'Outros',h1:'Livros em português',room:'portuguese-room',button:'Entrar na Sala de leitura em português',
    intro:n=>`${n} clássicos do Brasil e de Portugal, de Camões a Machado de Assis e Eça de Queirós, para ler de graça numa biblioteca em 3D que se percorre no navegador, também no telemóvel ou no celular. Estão na Sala de leitura em português, na ala internacional, cada um com uma nota da bibliotecária. Sem downloads, sem cadastro e sem anúncios.`,
    title:'Livros em português · The Library After Dark',description:n=>`${n} clássicos em português para ler de graça numa biblioteca em 3D, cada um com uma nota da bibliotecária: Machado de Assis, Eça de Queirós, Camões, Alencar, Camilo e muitos mais.`},
  fr:{path:'fr',shelves:SHELVES_FR,other:'Autres',h1:'Livres en français',room:'french-room',button:'Entrer dans la Salle de lecture en français',
    intro:n=>`${n} classiques de France et de la francophonie, de Molière à Proust, à lire gratuitement dans une bibliothèque en 3D que l’on parcourt dans son navigateur, sur ordinateur comme sur téléphone. Ils sont rangés dans la Salle de lecture en français, dans l’aile internationale, chacun avec une note de la bibliothécaire. Sans téléchargement, sans inscription et sans publicité.`,
    title:'Livres en français · The Library After Dark',description:n=>`${n} classiques en français à lire gratuitement dans une bibliothèque en 3D, chacun avec une note de la bibliothécaire : Hugo, Flaubert, Balzac, Zola, Maupassant, Baudelaire et bien d’autres.`},
  la:{path:'la',shelves:SHELVES_LA,other:'Other',h1:'Libri Latini',room:'latin-room',button:'Enter the Latin Reading Room',
    intro:n=>`${n} books in Latin, from Virgil, Caesar and Cicero to Augustine, Saint Patrick, Descartes and Newton, and Treasure Island for learners, to read free in a 3D library you walk through in your browser, on a phone too. They are in the Latin Reading Room in the International Wing, each with a note from the librarian. No downloads, no sign-up and no adverts.`,
    title:'Libri Latini: Latin books · The Library After Dark',description:n=>`${n} Latin classics to read free in a 3D library, each with a librarian’s note: Virgil, Caesar, Cicero, Horace, Catullus, Ovid, Augustine and more.`},
  uk:{path:'uk',shelves:SHELVES_UK,other:'Інше',h1:'Книжки українською',room:'ukrainian-room',button:'Увійти до Української читальні',
    intro:n=>`${n} ${ukWorks(n)} української класики, від «Енеїди» Котляревського і Шевченка до Лесі Українки, Франка й Коцюбинського, які можна безкоштовно читати в 3D-бібліотеці просто в браузері, зокрема з телефона. Вони стоять в Українській читальні Міжнародного крила, кожна з приміткою бібліотекарки. Тексти з Вікіджерел. Без завантажень, без реєстрації й без реклами.`,
    title:'Книжки українською · The Library After Dark',description:n=>`${n} ${ukWorks(n)} української класики для безкоштовного читання в 3D-бібліотеці, кожен із приміткою бібліотекарки: Шевченко, Франко, Леся Українка, Коцюбинський, Котляревський та інші.`},
  zh:{path:'zh',shelves:SHELVES_ZH,other:'其他',h1:'中文書',room:'chinese-room',button:'進入中文閱覽室',
    intro:n=>`${n} 部中文經典，從《詩經》、《論語》到《紅樓夢》和魯迅，都可以在一座 3D 圖書館裡免費閱讀，用瀏覽器就能走進去，手機也可以。這些書放在國際館的中文閱覽室，每一本都附有館員的短評。不用下載，不用註冊，也沒有廣告。`,
    title:'中文書 · The Library After Dark',description:n=>`${n} 部中文經典，在一座 3D 圖書館裡免費閱讀，每一本都附有館員的短評：紅樓夢、三國志演義、西遊記、水滸傳、聊齋志異、魯迅等。`}
};
function languagePage(lang,books){
  const L=LANDINGS[lang],groups=new Map();for(const b of books){const shelf=L.shelves[b.category]||b.category||L.other;(groups.get(shelf)||groups.set(shelf,[]).get(shelf)).push(b)}
  const body=`<main class="catalogue">
<h1>${L.h1}</h1>
<p class="intro">${L.intro(books.length)}</p>
<a class="read" href="/?room=${L.room}">${L.button}</a>
${[...groups.keys()].sort((a,b)=>a.localeCompare(b,lang)).map(shelf=>`<section class="shelf-list"><h2 id="${slug(shelf)}">${escape(shelf)}</h2><ul>${groups.get(shelf).map(b=>`<li><a href="/book/${pageName(b)}">${escape(b.title)}</a><span>${escape(b.author)}</span></li>`).join('')}</ul></section>`).join('\n')}
</main>`;
  return layout({title:L.title,description:L.description(books.length),canonical:`${SITE}/${L.path}/`,body,words:WORDS[lang]});
}
const CSS=`:root{--bg:#120e0b;--panel:#1d1712;--ink:#efe3c8;--soft:#c9b894;--gold:#d7ae60;--line:#3a2e22;color-scheme:dark}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:18px/1.6 Georgia,'Times New Roman',serif}
a{color:var(--gold)}a:hover{color:#f3d08a}
.top{display:flex;flex-wrap:wrap;gap:12px 24px;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid var(--line)}
.top .home{font-size:15px;letter-spacing:.18em;text-transform:uppercase;text-decoration:none;color:var(--soft)}.top nav{display:flex;gap:18px;flex-wrap:wrap;font-size:16px}.top .enter{color:var(--ink)}
main{max-width:980px;margin:0 auto;padding:40px 24px}
.book{display:grid;grid-template-columns:minmax(180px,300px) 1fr;gap:40px;align-items:start}
@media (max-width:720px){.book{grid-template-columns:1fr}.cover{max-width:220px}}
.cover{width:100%;height:auto;border-radius:4px;box-shadow:0 18px 40px rgba(0,0,0,.55)}
.cover.drawn{aspect-ratio:2/3;background:var(--bg);background:linear-gradient(160deg,var(--bg),#070605);border:2px solid var(--fg);outline:1px solid var(--fg);outline-offset:-10px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:26px 18px;text-align:center;color:var(--fg)}
.cover.drawn small{letter-spacing:.2em;font-size:11px}.cover.drawn strong{font-size:22px;line-height:1.25}.cover.drawn span{font-style:italic;font-size:14px}
.shelf{margin:0;color:var(--soft);font-size:14px;letter-spacing:.14em;text-transform:uppercase}
h1 small{display:block;font-size:.4em;color:var(--soft);margin-top:.3em}h1{font-weight:normal;font-size:clamp(30px,5vw,44px);line-height:1.15;margin:.2em 0 .3em}
.author{margin:0 0 1.4em;font-style:italic;color:var(--soft)}
blockquote{margin:0 0 1.6em;padding:20px 24px;background:var(--panel);border-left:3px solid var(--gold);border-radius:0 6px 6px 0}blockquote p{margin:0 0 .6em}
cite{display:block;font-size:15px;color:var(--soft)}cite:before{content:'— '}
.read{display:inline-block;margin:0 0 1.8em;padding:14px 22px;background:var(--gold);color:#1a120a;text-decoration:none;border-radius:6px;font-size:18px}.read:hover{background:#f0c878;color:#1a120a}
dl{display:grid;grid-template-columns:max-content 1fr;gap:6px 18px;margin:0;font-size:16px}dt{color:var(--soft)}dd{margin:0}
.more,.shelf-list{max-width:980px;margin:0 auto;padding:0 24px 24px}.more h2,.shelf-list h2{font-weight:normal;font-size:22px;border-bottom:1px solid var(--line);padding-bottom:6px}
.more ul,.shelf-list ul{list-style:none;margin:0;padding:0;columns:2 280px;column-gap:32px}.more li,.shelf-list li{break-inside:avoid;padding:4px 0}.more li span,.shelf-list li span{display:block;font-size:14px;color:var(--soft)}
.catalogue .shelf-list{padding:0 0 18px}.intro{color:var(--soft)}
.filter{display:block;margin:0 0 28px;color:var(--soft);font-size:16px}.filter input{display:block;width:100%;max-width:420px;margin-top:6px;padding:10px 12px;font:inherit;background:var(--panel);color:var(--ink);border:1px solid var(--line);border-radius:6px}
footer{border-top:1px solid var(--line);padding:24px;text-align:center;color:var(--soft);font-size:15px}
`;

export function build(){
  const {books,whereIs}=loadCatalogue();
  const listed=books.filter(b=>b.title&&b.author).sort((a,b)=>a.title.localeCompare(b.title));
  const byAuthor=new Map(),byShelf=new Map(),byLanguage=new Map();for(const b of listed){if(b.language)(byLanguage.get(b.language)||byLanguage.set(b.language,[]).get(b.language)).push(b);(byAuthor.get(b.author)||byAuthor.set(b.author,[]).get(b.author)).push(b);(byShelf.get(b.category||'Other')||byShelf.set(b.category||'Other',[]).get(b.category||'Other')).push(b)}
  const editions=new Map();for(const b of listed)editions.set(`${b.title}|${b.author}`,(editions.get(`${b.title}|${b.author}`)||0)+1);
  const dir=path.join(OUT,'book');fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
  for(const book of listed)fs.writeFileSync(path.join(dir,pageName(book)),bookPage(book,{whereIs,byAuthor,byShelf,byLanguage,editions}));
  for(const lang of Object.keys(LANDINGS)){const out=path.join(OUT,LANDINGS[lang].path);fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'index.html'),languagePage(lang,byLanguage.get(lang)||[]))}
  fs.writeFileSync(path.join(dir,'index.html'),cataloguePage(listed,byShelf));fs.writeFileSync(path.join(dir,'authors.html'),authorsPage(byAuthor));fs.writeFileSync(path.join(dir,'book.css'),CSS);
  const urls=[`${SITE}/`,`${SITE}/book/`,`${SITE}/book/authors.html`,`${SITE}/es/`,`${SITE}/pt/`,`${SITE}/fr/`,`${SITE}/la/`,`${SITE}/uk/`,`${SITE}/zh/`,...listed.map(b=>`${SITE}/book/${pageName(b)}`)];
  fs.writeFileSync(path.join(OUT,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`  <url><loc>${encodeURI(u)}</loc></url>`).join('\n')}\n</urlset>\n`);
  fs.writeFileSync(path.join(OUT,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
  return {pages:listed.length,withNotes:listed.filter(b=>b.note).length};
}
if(import.meta.url===`file://${process.argv[1]}`){const result=build();console.log(`${result.pages} book pages written (${result.withNotes} with a librarian’s note).`)}
