// Poems from the Anthologies: the poems in the GCSE English Literature anthologies that are old enough to be in the
// public domain, bound as one book for the Set Texts Room (set-texts-room.js), with a short note on each.
//
// Each poem is read from English Wikisource (scripts/wikisource.mjs): the page must link to its poet's Author: page,
// and the poem is taken from its first line to its last, both named here, so nothing is typed in from memory and no
// other text on the page is let in. A poem whose page cannot be found that way is searched for by its first line, and
// left out (the log says so) if it still cannot be found. The book is kept like a Gutenberg text, as
// texts/bundled-gzip/pg<ANTHOLOGY.id>.txt.gz, with a heading for each section and each poem, so the plain text reader
// gives every poem an address of its own (read.html?book=…#ozymandias). Run by the Anthology workflow.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {parse,api,htmlToText,byAuthor,wikisourceUrl} from './wikisource.mjs';

export const ANTHOLOGY={id:940001,title:'Poems from the Anthologies',author:'Various',category:'Poetry'};

// [section, heading, poet, Wikisource pages to try, first line, last line, note, shape]. The shape, where a page's
// layout cannot be trusted, gives the poem's stanzas as line counts (a poem with any other number of lines is refused),
// and `final` takes the last line's last appearance on the page, for a poem that ends on its refrain. `fix` mends a
// transcriber's slip where a page has it ([as the page has it, as the poet printed it]). A first line can be a list, for editions that spell it differently.
export const POEMS=[
  ['Power and Conflict','Ozymandias','Percy Bysshe Shelley',['Ozymandias (Shelley)','Ozymandias'],'I met a traveller from an antique land','The lone and level sands stretch far away',
    'Shelley wrote it in 1817, in a friendly contest with his friend Horace Smith, who wrote a sonnet on the same subject; it was published early in 1818. Ozymandias is a Greek name for the pharaoh Ramesses II.'],
  ['Power and Conflict','London','William Blake',['Songs of Innocence and of Experience/London','London (Blake)'],'I wander thro\' each charter\'d street','And blights with plagues the Marriage hearse',
    'From Songs of Experience, 1794, which Blake wrote, engraved and coloured by hand himself.'],
  ['Power and Conflict','From The Prelude','William Wordsworth',['The Prelude (Wordsworth)/Book First','The Prelude/Book First','The Prelude (1850)/Book First'],'One summer evening (led by her) I found','Were a trouble to my dreams',
    'Wordsworth worked on The Prelude, the story of his own mind, for most of his life, and it was published in 1850, three months after his death. In this passage from its first book, a boy takes a boat out on a lake at night.'],
  ['Power and Conflict','My Last Duchess','Robert Browning',['My Last Duchess'],'That\'s my last Duchess painted on the wall','Which Claus of Innsbruck cast in bronze for me',
    'A dramatic monologue, published in Dramatic Lyrics in 1842. The Duke is usually taken to be Alfonso II of Ferrara, whose young first wife died in 1561.'],
  ['Power and Conflict','The Charge of the Light Brigade','Alfred Tennyson',['The Charge of the Light Brigade'],'Half a league, half a league','Noble six hundred',
    'Tennyson wrote it within weeks of the charge at Balaclava, in the Crimean War, in October 1854, and it was printed in The Examiner that December.'],
  ['Power and Conflict','Exposure','Wilfred Owen',['Exposure (Owen)','Poems (Owen)/Exposure','Exposure'],'Our brains ache, in the merciless iced east winds that kn','But nothing happens',
    'Drawn from the winter of 1917 in the trenches of the Western Front. It was published in 1920, two years after Owen was killed in France, a week before the Armistice.',{final:true,stanzas:[5,5,5,5,5,5,5,5]}],
  ['Power and Conflict','The Destruction of Sennacherib','George Gordon Byron',['The Destruction of Sennacherib','Hebrew Melodies/The Destruction of Sennacherib'],'The Assyrian came down like the wolf on the fold','melted like snow in the glance of the Lord',
    'From Hebrew Melodies, 1815. It retells the story in the Second Book of Kings of the Assyrian army that besieged Jerusalem and perished in a night.'],
  ['Power and Conflict','A Poison Tree','William Blake',['Songs of Innocence and of Experience/A Poison Tree','A Poison Tree'],'I was angry with my friend','outstretch\'d beneath the tree',
    'From Songs of Experience, 1794. In Blake\'s notebook it was first called Christian Forbearance.'],
  ['Power and Conflict','The Man He Killed','Thomas Hardy',['The Man He Killed','Time\'s Laughingstocks and Other Verses/The Man He Killed'],'Had he and I but met','Or help to half-a-crown',
    'Hardy dated it 1902, the year the Boer War ended, and collected it in Time\'s Laughingstocks in 1909.',{stanzas:[4,4,4,4,4]}],
  ['Love and Relationships','When We Two Parted','George Gordon Byron',['When We Two Parted'],'When we two parted','With silence and tears',
    'Published in 1816. Byron gave it the date 1808, perhaps to disguise whom it was about.',{stanzas:[8,8,8,8]}],
  ['Love and Relationships','Love\'s Philosophy','Percy Bysshe Shelley',['Love\'s Philosophy (Shelley)','Posthumous Poems (Shelley)/Love\'s Philosophy','The Complete Poetical Works of Percy Bysshe Shelley/Love\'s Philosophy','Love\'s Philosophy'],'The fountains mingle with the river','If thou kiss not me',
    'Written in 1819, the year Shelley was in Italy writing much of his best work.',{stanzas:[8,8],fix:[["disdained it's brother","disdained its brother"]]}],
  ['Love and Relationships','Porphyria\'s Lover','Robert Browning',['Porphyria\'s Lover'],'The rain set early in to-night','And yet God has not said a word',
    'First published in 1836 as Porphyria, and printed in 1842 with Johannes Agricola under the heading Madhouse Cells.'],
  ['Love and Relationships','Sonnet 29','Elizabeth Barrett Browning',['Sonnets from the Portuguese/XXIX','Sonnets from the Portuguese/Sonnet 29','Prometheus Bound, and other poems/Sonnets from the Portuguese/Sonnet 29','Prometheus Bound, and other poems/Sonnets from the Portuguese/Sonnet 28','Prometheus Bound, and other poems/Sonnets from the Portuguese/Sonnet 30'],'I think of thee','am too near thee',
    'From Sonnets from the Portuguese, 1850, written during her courtship with Robert Browning. The title was a disguise: he called her his little Portuguese.'],
  ['Love and Relationships','Sonnet 43','Elizabeth Barrett Browning',['Sonnets from the Portuguese/XLIII','Sonnets from the Portuguese/Sonnet 43','Prometheus Bound, and other poems/Sonnets from the Portuguese/Sonnet 42'],'How do I love thee? Let me count the ways','I shall but love thee better after death',
    'The best known of the forty-four Sonnets from the Portuguese, 1850.'],
  ['Love and Relationships','Neutral Tones','Thomas Hardy',['Neutral Tones','Wessex Poems and Other Verses/Neutral Tones'],'We stood by a pond that winter day','edged with gray',
    'Hardy dated it 1867, when he was an architect\'s assistant in London, but did not publish it until Wessex Poems in 1898.',{fix:[['to and fro -','to and fro—']]}],
  ['Love and Relationships','The Farmer\'s Bride','Charlotte Mew',['The Farmer\'s Bride (poem)','The Farmer\'s Bride/The Farmer\'s Bride','The Farmer\'s Bride'],'Three Summers since I chose a maid','her hair, her hair',
    'The title poem of Charlotte Mew\'s first collection, 1916, spoken by a farmer about the young wife who is afraid of him.'],
  ['Love and Relationships','She Walks in Beauty','George Gordon Byron',['She Walks in Beauty','Hebrew Melodies/She Walks in Beauty'],'She walks in beauty, like the night','A heart whose love is innocent',
    'Written in 1814, after Byron saw his cousin by marriage, Anne Wilmot, at a party in a mourning dress spangled with sequins; published in Hebrew Melodies, 1815.'],
  ['Love and Relationships','La Belle Dame sans Merci','John Keats',['La Belle Dame sans Merci (Keats)','La Belle Dame Sans Merci (Keats)','La Belle Dame sans Merci'],'can ail thee','And no birds sing',
    'Keats wrote it in April 1819, in a letter to his brother George. The title comes from a medieval French poem by Alain Chartier.',{final:true,fix:[['And is this is why','And this is why']]}],
  ['Love and Relationships','Cousin Kate','Christina Rossetti',['Cousin Kate','Goblin Market and Other Poems/Cousin Kate'],'I was a cottage maiden','To wear his coronet',
    'From Goblin Market and Other Poems, 1862, Christina Rossetti\'s first collection.'],
  ['Time and Place','To Autumn','John Keats',['To Autumn','To Autumn (Keats)'],'Season of mists and mellow fruitfulness','gathering swallows twitter in the skies',
    'Written on 19 September 1819, after a walk by the river near Winchester; the last of Keats\'s great odes.',{stanzas:[11,11,11]}],
  ['Time and Place','Composed upon Westminster Bridge','William Wordsworth',['Composed upon Westminster Bridge, September 3, 1802','Composed Upon Westminster Bridge, September 3, 1802','Poems in Two Volumes/Volume 1/Composed upon Westminster Bridge, Sept. 3, 1803','Poems in Two Volumes (Wordsworth)/Volume 1/Composed upon Westminster Bridge, Sept. 3, 1803','Composed upon Westminster Bridge'],['Earth has not any thing to shew more fair','Earth has not anything to show more fair'],'all that mighty heart is lying still',
    'Written in the summer of 1802, after crossing the bridge by coach early in the morning on the way to France with his sister Dorothy.'],
  ['Time and Place','Adlestrop','Edward Thomas',['Adlestrop','Poems (Thomas)/Adlestrop'],'Yes. I remember Adlestrop','Of Oxfordshire and Gloucestershire',
    'The train stopped at Adlestrop, in Gloucestershire, on 24 June 1914. Thomas wrote the poem in 1915, and was killed at Arras in 1917.'],
  ['Time and Place','Home-Thoughts, from Abroad','Robert Browning',['Home-Thoughts, from Abroad','Home Thoughts, from Abroad'],'Oh, to be in England','this gaudy melon-flower',
    'From Dramatic Romances and Lyrics, 1845.',{stanzas:[8,12],fix:[['dewdrop—sat the','dewdrops—at the']]}]
];

const loose=s=>s.normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z]/g,'');
// The poem on a page, from the line its first words begin (a line all in capitals is a title, not the poem) to the line
// its last words end; stanza breaks kept.
export function extract(text,first,last,{final=false}={}){
  if(Array.isArray(first)){for(const one of first){const got=extract(text,one,last,{final});if(got)return got}return null}
  const lines=text.split('\n'),f=loose(first),l=loose(last);
  const isTitle=line=>/[A-Z]{3}/.test(line)&&line===line.toUpperCase()&&!/[a-z]/.test(line);
  const start=lines.findIndex(line=>!isTitle(line)&&loose(line).includes(f.slice(0,Math.min(f.length,40))));if(start<0)return null;
  let end=-1;for(let i=start;i<lines.length&&i<start+400;i++)if(loose(lines[i]).includes(l)){end=i;if(!final)break}
  if(end<0)return null;
  return lines.slice(start,end+1).join('\n');
}
// The poem as its poet printed it, without what its edition added: stanza numerals, line numbers (printed after a line,
// "cease,10"), a printer's capitals on the first word ("THE fountains"), and typists' dashes ("--", "---").
export function tidy(poem,{stanzas,fix=[]}={}){
  let lines=poem.split('\n').map(line=>line.trim()).filter(line=>!/^([IVXL]+|\d{1,2})\.?$/.test(line))
    .map(line=>line.replace(/(\D)\s*(\d{1,4})$/,(m,before,n)=>Number(n)%5===0&&!/\d/.test(before)?before:m).replace(/^([A-Z]{2,})(?=,? +[A-Za-z]*[a-z])/,w=>w[0]+w.slice(1).toLowerCase()).replace(/-{2,3}/g,'—').trimEnd());
  if(stanzas){const verse=lines.filter(Boolean),want=stanzas.reduce((a,b)=>a+b,0);if(verse.length!==want)return {error:`${verse.length} lines, not the ${want} of its stanzas`};
    lines=[];let at=0;for(const n of stanzas){if(at)lines.push('');lines.push(...verse.slice(at,at+n));at+=n}}
  let text=lines.join('\n').replace(/\n{3,}/g,'\n\n').trim();
  for(const [was,is] of fix)text=text.replace(was,is);
  return {poem:text};
}

async function find([section,heading,poet,pages,first,last,,shape={}],say){
  const tried=new Set();
  const attempt=async page=>{if(tried.has(page))return null;tried.add(page);const p=await parse(page,'en');if(!p)return null;const {text,links}=htmlToText(p.html);
    if(!byAuthor(links,p.categories||[],poet,'en')){say(`    ${p.title}: does not name ${poet}`);return null}
    const raw=extract(text,first,last,shape);if(!raw){say(`    ${p.title}: the poem's first and last lines were not both found`);return null}
    const {poem,error}=tidy(raw,shape);if(error){say(`    ${p.title}: ${error}`);return null}
    return {page:p.title,url:wikisourceUrl(p.title,'en'),poem}};
  for(const page of pages){const got=await attempt(page);if(got)return got}
  const found=await api({action:'query',list:'search',srsearch:`"${[].concat(first)[0].replace(/[?!(),]/g,' ').trim()}"`,srnamespace:'0',srlimit:'10'},'en');
  for(const hit of found?.query?.search||[]){const got=await attempt(hit.title);if(got){say(`    found by its first line: ${got.page}`);return got}}
  const named=await api({action:'query',list:'search',srsearch:`intitle:"${heading.replace(/^From /,'')}" ${poet.split(' ').pop()}`,srnamespace:'0',srlimit:'10'},'en');
  for(const hit of named?.query?.search||[]){const got=await attempt(hit.title);if(got){say(`    found by its title: ${got.page}`);return got}}
  return null;
}

export function anthologyText(found){
  const sections=[...new Set(found.map(f=>f.section))];
  const parts=[`Title: ${ANTHOLOGY.title}\nAuthor: ${ANTHOLOGY.author}\nLanguage: English\nSource: Wikisource, https://en.wikisource.org/\nRights: Public domain. Transcribed and proofread by the contributors to en.wikisource.org; the notes are the Library After Dark's.\n\n*** START OF THE WIKISOURCE TEXT: ${ANTHOLOGY.title.toUpperCase()} ***\n`,
    `POEMS FROM THE ANTHOLOGIES\n\nThe poems in the GCSE English Literature anthologies that are old enough to be in the public domain, from Blake to Wilfred Owen and Charlotte Mew, each with a short note. The texts are from Wikisource (en.wikisource.org), in the public domain; the page each came from is named beneath it.`];
  for(const section of sections){parts.push(section.toUpperCase());
    for(const f of found.filter(x=>x.section===section))parts.push(`${f.heading.toUpperCase()}\n\n${f.poet}\n\n${f.poem}\n\n${f.note}\n\nFrom Wikisource: ${f.url}`)}
  return parts.join('\n\n\n')+'\n\n*** END OF THE WIKISOURCE TEXT ***\n';
}

async function main(){
  const found=[],missing=[];const say=line=>console.log(line);
  for(const entry of POEMS){const [section,heading,poet,,,,note]=entry;console.log(`${heading} (${poet})`);
    const got=await find(entry,say);if(!got){missing.push(heading);console.log('  NOT FOUND');continue}
    console.log(`  ${got.page}: ${got.poem.split('\n').filter(Boolean).length} lines`);found.push({section,heading,poet,note,...got});
    console.log(got.poem.split('\n').map(l=>'  | '+l).join('\n'))}
  const text=anthologyText(found),out=path.join(path.dirname(new URL(import.meta.url).pathname),'..','texts','bundled-gzip',`pg${ANTHOLOGY.id}.txt.gz`);
  fs.writeFileSync(out,zlib.gzipSync(Buffer.from(text,'utf8'),{level:9}));
  console.log(`\n${found.length} of ${POEMS.length} poems bound into ${path.basename(out)}${missing.length?`; not found: ${missing.join(', ')}`:''}.`);
  if(!found.length)process.exit(1);
}
if(import.meta.url===`file://${process.argv[1]}`)main().catch(error=>{console.error(error);process.exit(1)});
