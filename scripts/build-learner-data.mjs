// Builds the data behind the English learners' room and the reader's word help:
//
//   data/learner-levels.js       how hard each locally held book is to read (1 gentle … 4 challenging), and
//                                roughly how long it takes a learner to read, measured from the text itself
//   data/learner-dictionary.json a pocket dictionary: the 20,000 words that appear most often in the library's
//                                own books, each with one or two short meanings from WordNet
//
// WordNet is not kept in this repository. Fetch it once from npm and point the script at it:
//   npm pack wordnet-db && tar xzf wordnet-db-*.tgz
//   WORDNET_DIR=package/dict node scripts/build-learner-data.mjs
//
// WordNet 3.0 Copyright 2006 by Princeton University. All rights reserved. (Licence: see ASSET_CREDITS.md.)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';

const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const WORDNET=process.env.WORDNET_DIR;
const WORDS=20000,READING_WPM=150;

// The word-shape rules the browser uses, so the dictionary is built to match them exactly.
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(ROOT,'word-help.js'),'utf8'),context);
const core=context.window.ATHENAEUM_WORD_HELP_CORE;

// ---------- the library's own texts ----------
function body(text){
  const start=text.search(/\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG/i),end=text.search(/\*\*\*\s*END OF (THE|THIS) PROJECT GUTENBERG/i);
  let out=text.slice(start>=0?text.indexOf('\n',start)+1:0,end>start?end:text.length);
  return out.replace(/\r/g,'');
}
function localTexts(){
  const found=new Map(),take=(id,read)=>{if(!found.has(id))found.set(id,read)};
  for(const f of fs.readdirSync(path.join(ROOT,'texts'))){const m=f.match(/^pg(\d+)\.txt$/);if(m)take(+m[1],()=>fs.readFileSync(path.join(ROOT,'texts',f),'utf8'))}
  for(const f of fs.readdirSync(path.join(ROOT,'texts/bundled-gzip'))){const m=f.match(/^pg(\d+)\.txt\.gz$/);if(m)take(+m[1],()=>{const raw=fs.readFileSync(path.join(ROOT,'texts/bundled-gzip',f));try{return zlib.gunzipSync(raw).toString('utf8')}catch(e){return ''}/* a few bundled files are damaged; the game fetches those books online instead */})}
  return found;
}
const tokens=text=>text.toLowerCase().replace(/[’‘]/g,"'").match(/[a-z]+(?:'[a-z]+)?/g)||[];

// ---------- WordNet ----------
function wordnet(){
  if(!WORDNET||!fs.existsSync(path.join(WORDNET,'index.noun')))throw new Error('Set WORDNET_DIR to the dict folder of the wordnet-db npm package (see the top of this file).');
  const POS={noun:'noun',verb:'verb',adj:'adjective',adv:'adverb'},TYPE={1:'noun',2:'verb',3:'adj',4:'adv',5:'adj'},glosses=new Map(),senses=new Map(),tags=new Map(),proper=new Set();
  // How often each meaning of each word was found in WordNet's tagged texts: the best guide to the everyday meaning.
  for(const line of fs.readFileSync(path.join(WORDNET,'index.sense'),'utf8').split('\n')){
    const [key,offset,number,count]=line.split(' ');if(!key)continue;const lemma=key.slice(0,key.indexOf('%')),type=TYPE[key[key.indexOf('%')+1]];
    tags.set(`${lemma}|${type}:${offset}`,{count:+count||0,number:+number||99});
  }
  for(const [file,label] of Object.entries(POS)){
    for(const line of fs.readFileSync(path.join(WORDNET,'data.'+file),'utf8').split('\n')){
      if(!line||line.startsWith(' '))continue;const bar=line.indexOf(' | ');if(bar<0)continue;
      // The definition, without its quoted examples.
      let gloss=line.slice(bar+3).split(/;\s*"/)[0].replace(/\s+$/,'').replace(/^\(([^)]*)\)\s*/,'');
      glosses.set(file+':'+line.slice(0,8),gloss);
      // Names of people and places are written with capitals in the synset: remember them, to leave them out.
      const f=line.split(' '),count=parseInt(f[3],16);for(let i=0;i<count;i++){const word=f[4+i*2];if(/^[A-Z]/.test(word))proper.add(file+':'+line.slice(0,8)+'|'+word.toLowerCase())}
    }
    for(const line of fs.readFileSync(path.join(WORDNET,'index.'+file),'utf8').split('\n')){
      if(!line||line.startsWith(' '))continue;const parts=line.trim().split(' '),lemma=parts[0];if(!/^[a-z]+(?:-[a-z]+)?$/.test(lemma))continue;
      const pointerCount=+parts[3],offsets=parts.slice(6+pointerCount);
      const list=senses.get(lemma)||[];
      offsets.forEach((o,i)=>{const t=tags.get(`${lemma}|${file}:${o}`)||{count:0,number:i+1};list.push({pos:label,offset:file+':'+o,count:t.count,number:t.number})});
      senses.set(lemma,list);
    }
  }
  return {glosses,senses,proper};
}
// Where WordNet's usage counts put an unusual meaning first. Add to this when a reader spots one.
const OVERRIDES={
  whale:[['noun','a very large sea mammal that breathes air through a hole on top of its head'],['verb','hunt for whales']]
};
// Slurs and crude senses have no place in a learner's pocket dictionary.
const UNSUITABLE=/offensive|slur|obscene|vulgar|disparaging|derogatory|informal term for (?:sexual|a woman)/i;
const short=text=>{let t=text.split('; ')[0];if(t.length>110)t=t.slice(0,107).replace(/\s+\S*$/,'')+'…';return t};

function main(){
  const texts=localTexts(),counts=new Map(),books=[];
  for(const [id,read] of texts){
    const text=body(read()),words=tokens(text);if(words.length<800)continue;
    for(const w of words)counts.set(w,(counts.get(w)||0)+1);
    const sentences=(text.replace(/\b(Mr|Mrs|Dr|St|Mme|Mlle)\./g,'$1').match(/[^.!?]+[.!?]+/g)||[]).filter(s=>/[a-z]/i.test(s)).length||1;
    books.push({id,words,sentences});
  }
  // Word ranks across the whole library, counting "ran", "runs" and "running" as "run".
  const lemmaCounts=new Map();const {glosses,senses,proper}=wordnet();
  const lemmaOf=w=>core.lemmaCandidates(w).find(c=>senses.has(c))||null;
  for(const [w,n] of counts){const l=lemmaOf(w)||w;lemmaCounts.set(l,(lemmaCounts.get(l)||0)+n)}
  const ranked=[...lemmaCounts.entries()].sort((a,b)=>b[1]-a[1]).map(([w])=>w),rank=new Map(ranked.map((w,i)=>[w,i]));

  // ---------- how hard each book is ----------
  const common=w=>{const l=lemmaOf(w)||w;return (rank.get(l)??1e9)<3000||core.SMALL_WORDS[w]};
  for(const b of books){
    let rare=0,old=0;for(const w of b.words){if(!common(w))rare++;if(core.OLD_WORDS[w])old++}
    b.sentenceLength=b.words.length/b.sentences;b.rare=rare/b.words.length;b.old=old/b.words.length;
    b.score=b.sentenceLength/18+b.rare*12+b.old*60;
  }
  const scores=books.map(b=>b.score).sort((a,b)=>a-b),at=q=>scores[Math.floor(q*(scores.length-1))];
  const cuts=[at(.25),at(.5),at(.75)];
  const levels={};for(const b of books){const level=1+cuts.filter(c=>b.score>c).length;levels[b.id]=[level,Math.max(1,Math.round(b.words.length/READING_WPM)),b.words.length]}
  fs.writeFileSync(path.join(ROOT,'data/learner-levels.js'),
    '// Built by scripts/build-learner-data.mjs from the texts in texts/. Do not edit by hand.\n'+
    '// Gutenberg number: [level 1 gentle, 2 steady, 3 richer, 4 challenging; minutes to read at a learner\'s pace; words].\n'+
    `// Levels compare the library's books with each other (sentence length, how many uncommon and old words).\n`+
    `window.ATHENAEUM_LEARNER_LEVELS=${JSON.stringify(levels)};\n`);

  // ---------- the pocket dictionary ----------
  const entries={},forms={};
  for(const lemma of ranked){
    if(Object.keys(entries).length>=WORDS)break;const list=senses.get(lemma);if(!list)continue;
    // The two most used meanings; with no usage counts, WordNet's own order, preferring different parts of speech.
    if(core.SMALL_WORDS[lemma]||core.OLD_WORDS[lemma])continue;
    const usable=list.map(x=>({...x,gloss:glosses.get(x.offset)||''})).filter(x=>x.gloss&&!UNSUITABLE.test(x.gloss)&&!proper.has(x.offset+'|'+lemma));
    const main=usable.reduce((best,x)=>x.count>best.count?x:best,usable[0]||{count:0})?.pos;
    usable.sort((a,b)=>b.count-a.count||(a.pos===main?0:1)-(b.pos===main?0:1)||a.number-b.number);
    const chosen=[];for(const x of usable){if(chosen.length>=2)break;if(chosen.length===1&&x.count===0&&chosen[0].count>0&&x.pos===chosen[0].pos)continue;chosen.push(x)}
    if(chosen.length<2&&usable.length>1){const extra=usable.find(x=>!chosen.includes(x));if(extra)chosen.push(extra)}
    entries[lemma]=chosen.map(x=>[x.pos,short(x.gloss)]);
    if(!entries[lemma].length)delete entries[lemma];
  }
  for(const [word,senses] of Object.entries(OVERRIDES))if(entries[word])entries[word]=senses;
  for(const [form,lemma] of Object.entries(core.IRREGULAR))if(entries[lemma])forms[form]=lemma;
  const dictionary={about:'Meanings from WordNet 3.0, Copyright 2006 by Princeton University. All rights reserved. Words chosen and ranked by how often they appear in The Library After Dark.',w:entries,f:forms};
  fs.writeFileSync(path.join(ROOT,'data/learner-dictionary.json'),JSON.stringify(dictionary));
  const byLevel=[1,2,3,4].map(l=>Object.values(levels).filter(v=>v[0]===l).length);
  console.log(`${books.length} books graded (${byLevel.join('/')} per level); ${Object.keys(entries).length} words in the dictionary, ${(fs.statSync(path.join(ROOT,'data/learner-dictionary.json')).size/1024).toFixed(0)} KB`);
}
main();
