// Word help for readers learning English. Switched on from the reader's footer (and on by default for books
// taken from the learners' room): tapping a word shows a short meaning and can say it aloud, old words such
// as "thee" and "wherefore" are quietly underlined, and any word can be saved to a notebook.
//
// Meanings come from a compact dictionary (data/learner-dictionary.json, built by
// scripts/build-learner-data.mjs from WordNet, ranked by how often each word appears in the library's own
// books). It is only fetched the first time a word is looked up. Pronunciation uses the browser's own voice.
(function(){
  'use strict';

  // Old and poetic words that learners meet in classic books but rarely in modern English.
  const OLD_WORDS={
    thee:'you (as the object: “I love thee”)',thou:'you (as the subject: “thou art”)',thy:'your',thine:'yours; your (before a vowel)',ye:'you (to several people)',
    hast:'have (with “thou”)',hath:'has',doth:'does',dost:'do (with “thou”)',didst:'did (with “thou”)',wilt:'will (with “thou”)',shalt:'shall (with “thou”)',canst:'can (with “thou”)',wouldst:'would (with “thou”)',couldst:'could (with “thou”)',shouldst:'should (with “thou”)',wert:'were (with “thou”)',wast:'was (with “thou”)',
    whence:'from where',thence:'from there',whither:'to where',hither:'to here',thither:'to there',yonder:'over there',
    wherefore:'why',whereupon:'after which',whereof:'of which',wherein:'in which',herein:'in this',therein:'in that',thereof:'of that',thereupon:'immediately after that',heretofore:'until now',
    ere:'before',oft:'often',anon:'soon; in a moment',betwixt:'between',nigh:'near; nearly',
    nay:'no',yea:'yes',perchance:'perhaps',mayhap:'perhaps',methinks:'I think',forsooth:'truly (often joking)',prithee:'please',lo:'look!',
    tis:'it is',twas:'it was',twere:'it would be',"'tis":'it is',"'twas":'it was',"'twere":'it would be',"e'en":'even',"o'er":'over',"ne'er":'never',"e'er":'ever',
    morrow:'the next day; morning',twain:'two',raiment:'clothing',quoth:'said',fain:'gladly; willingly',unto:'to',whilom:'formerly',forthwith:'immediately',straightway:'immediately',ofttimes:'often',
    victuals:'food',damsel:'a young woman',knave:'a dishonest man',thrice:'three times',betimes:'early',howbeit:'nevertheless',natheless:'nevertheless',peradventure:'perhaps',sooth:'truth',troth:'a promise; loyalty'
  };
  // Everyday words that meant something different in older books. Not underlined; the older meaning is shown first.
  const OLD_SENSES={
    art:'are (with “thou”: “thou art” = you are)',score:'twenty (“four score” = eighty)',eve:'evening; the day before',fortnight:'two weeks',
    visage:'face',countenance:'face; expression',apparel:'clothing',garb:'clothing',steed:'horse',bade:'told; asked (past of “bid”)',wont:'used to; in the habit of',lest:'so that … not; for fear that',
    sup:'to eat supper',abode:'home',chamber:'room; bedroom',hearth:'the floor of a fireplace; home',maid:'a young woman; a woman servant',
    ejaculated:'said suddenly',ejaculate:'to say suddenly',intercourse:'conversation; dealings with people',gay:'cheerful; brightly coloured',
    alas:'a cry of sadness',whilst:'while',amongst:'among',albeit:'although',hence:'from here; for this reason',afar:'far away',aye:'yes; always'
  };

  // Very common small words WordNet does not list, so that no tap goes unanswered.
  const SMALL_WORDS={
    the:'used before a noun that is already known',a:'one; any (before a consonant sound)',an:'one; any (before a vowel sound)',and:'also; plus',or:'showing a choice',but:'however; except',
    of:'belonging to; from',to:'towards; used before a verb',in:'inside',on:'touching the top of; about',at:'in a place or time',by:'next to; through the action of',for:'intended for; because of',with:'together with; using',from:'starting at',into:'to the inside of',
    about:'on the subject of; around',over:'above; across',under:'below',after:'later than',before:'earlier than; in front of',between:'in the space that separates two things',through:'from one side to the other',without:'not having',against:'touching; opposed to',among:'in the middle of a group',
    i:'the speaker',me:'the speaker (as the object)',my:'belonging to me',mine:'belonging to me',we:'the speaker and others',us:'the speaker and others (as the object)',our:'belonging to us',you:'the person spoken to',your:'belonging to you',
    he:'a male person already mentioned',him:'a male person (as the object)',his:'belonging to him',she:'a female person already mentioned',her:'a female person (as the object); belonging to her',it:'a thing already mentioned',its:'belonging to it',they:'people or things already mentioned',them:'people or things (as the object)',their:'belonging to them',
    this:'the one here',that:'the one there; used to join ideas',these:'the ones here',those:'the ones there',who:'which person',whom:'which person (as the object)',whose:'belonging to which person',which:'what one',what:'which thing',
    is:'present form of “be” (he is)',are:'present form of “be” (they are)',was:'past form of “be” (he was)',were:'past form of “be” (they were)',been:'past participle of “be”',am:'present form of “be” (I am)',
    not:'used to make a sentence negative',no:'not any; the opposite of yes',yes:'used to agree',if:'on condition that',then:'at that time; next',than:'used in comparisons',so:'very; therefore',as:'in the same way; while',
    very:'to a great degree',too:'also; more than enough',also:'as well',only:'and nobody or nothing else',just:'exactly; a moment ago',still:'even now; without moving',yet:'until now; but',
    shall:'will (formal)',should:'ought to',would:'used for things that are imagined or polite',could:'was able to; might',might:'possibly will',must:'has to',may:'is allowed to; possibly will',can:'is able to',will:'used for the future',
    there:'in that place',here:'in this place',where:'in what place',when:'at what time',why:'for what reason',how:'in what way',
    some:'an amount of; a few',any:'one or some, it does not matter which',every:'all, one by one',each:'every one separately',all:'the whole of',both:'the two together',either:'one or the other',neither:'not one and not the other',none:'not any',
    myself:'me (used for emphasis)',himself:'him (used for emphasis)',herself:'her (used for emphasis)',itself:'it (used for emphasis)',themselves:'them (used for emphasis)',ourselves:'us (used for emphasis)',yourself:'you (used for emphasis)'
  };

  // A few hundred irregular forms, so that "went" finds "go" and "children" finds "child".
  const IRREGULAR=('arose:arise arisen:arise awoke:awake awoken:awake bore:bear borne:bear beat:beat beaten:beat became:become began:begin begun:begin bent:bend bet:bet bound:bind bit:bite bitten:bite bled:bleed blew:blow blown:blow broke:break broken:break bred:breed brought:bring built:build burnt:burn burst:burst bought:buy caught:catch chose:choose chosen:choose clung:cling came:come crept:creep dealt:deal dug:dig did:do done:do drew:draw drawn:draw dreamt:dream drank:drink drunk:drink drove:drive driven:drive dwelt:dwell ate:eat eaten:eat fell:fall fallen:fall fed:feed felt:feel fought:fight found:find fled:flee flung:fling flew:fly flown:fly forbade:forbid forbidden:forbid forgot:forget forgotten:forget forgave:forgive forgiven:forgive froze:freeze frozen:freeze got:get gotten:get gave:give given:give went:go gone:go ground:grind grew:grow grown:grow hung:hang had:have has:have heard:hear hid:hide hidden:hide held:hold hurt:hurt kept:keep knelt:kneel knew:know known:know laid:lay led:lead leant:lean leapt:leap learnt:learn left:leave lent:lend lay:lie lain:lie lit:light lost:lose made:make meant:mean met:meet paid:pay quit:quit ran:run rang:ring rung:ring rode:ride ridden:ride rose:rise risen:rise said:say saw:see seen:see sought:seek sold:sell sent:send set:set shook:shake shaken:shake shone:shine shot:shoot showed:show shown:show shrank:shrink shut:shut sang:sing sung:sing sank:sink sunk:sink sat:sit slept:sleep slid:slide slung:sling slit:slit spoke:speak spoken:speak sped:speed spent:spend spun:spin spat:spit split:split spread:spread sprang:spring sprung:spring stood:stand stole:steal stolen:steal stuck:stick stung:sting stank:stink strode:stride struck:strike strove:strive striven:strive swore:swear sworn:swear swept:sweep swam:swim swum:swim swung:swing took:take taken:take taught:teach tore:tear torn:tear told:tell thought:think threw:throw thrown:throw trod:tread trodden:tread understood:understand woke:wake woken:wake wore:wear worn:wear wove:weave woven:weave wept:weep won:win wound:wind wrung:wring wrote:write written:write '+
    'men:man women:woman children:child feet:foot teeth:tooth geese:goose mice:mouse oxen:ox lice:louse people:person knives:knife wives:wife lives:life leaves:leaf loaves:loaf halves:half selves:self shelves:shelf thieves:thief wolves:wolf calves:calf sheaves:sheaf elves:elf scarves:scarf hooves:hoof '+
    'better:good best:good worse:bad worst:bad further:far furthest:far farther:far farthest:far less:little least:little more:much most:much elder:old eldest:old').split(' ').reduce((map,pair)=>{const [form,lemma]=pair.split(':');map[form]=lemma;return map},{});

  const clean=word=>String(word||'').toLowerCase().replace(/[’‘]/g,"'").replace(/^'+|'+$/g,'').replace(/'s$/,'');
  // Every plausible dictionary form of a word, most likely first: "running" → running, run, rune…
  function lemmaCandidates(raw){
    const w=clean(raw),out=[];if(!w)return out;const add=x=>{if(x&&x.length>1&&!out.includes(x))out.push(x)};
    add(w);if(IRREGULAR[w])add(IRREGULAR[w]);
    const doubled=s=>s.length>2&&s[s.length-1]===s[s.length-2]&&!/[aeiouwxy]/.test(s[s.length-1])?s.slice(0,-1):null;
    if(w.endsWith('ies')&&w.length>4)add(w.slice(0,-3)+'y');
    if(w.endsWith('es')){add(w.slice(0,-2));add(w.slice(0,-1))}
    if(w.endsWith('s')&&!w.endsWith('ss'))add(w.slice(0,-1));
    if(w.endsWith('ied')&&w.length>4)add(w.slice(0,-3)+'y');
    if(w.endsWith('ed')){const s=w.slice(0,-2);add(s);add(s+'e');add(doubled(s))}
    if(w.endsWith('ing')&&w.length>5){const s=w.slice(0,-3);add(s);add(s+'e');add(doubled(s));if(s.endsWith('y'))add(s.slice(0,-1)+'ie')}
    if(w.endsWith('ier'))add(w.slice(0,-3)+'y');if(w.endsWith('iest'))add(w.slice(0,-4)+'y');
    if(w.endsWith('er')&&w.length>4){const s=w.slice(0,-2);add(s);add(s+'e');add(doubled(s))}
    if(w.endsWith('est')&&w.length>5){const s=w.slice(0,-3);add(s);add(s+'e');add(doubled(s))}
    if(w.endsWith('ly')&&w.length>4){add(w.slice(0,-2));if(w.endsWith('ily'))add(w.slice(0,-3)+'y')}
    return out;
  }

  const api={OLD_WORDS,OLD_SENSES,SMALL_WORDS,IRREGULAR,lemmaCandidates,clean};
  window.ATHENAEUM_WORD_HELP_CORE=api;
  if(typeof document==='undefined')return;

  // ---------------- In the browser ----------------
  const PREF='athenaeum-word-help',NOTEBOOK='athenaeum-word-notebook',DICTIONARY='data/learner-dictionary.json';
  const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
  let dictionary=null,loading=null,card=null,forced=false,currentBook=null;
  const OLD_PATTERN=new RegExp(`(^|[^A-Za-z'’])(${Object.keys(OLD_WORDS).map(w=>w.replace(/'/g,"['’]")).sort((a,b)=>b.length-a.length).join('|')})(?=$|[^A-Za-z'’])`,'gi');

  function load(){
    if(dictionary)return Promise.resolve(dictionary);
    if(!loading)loading=fetch(DICTIONARY).then(r=>{if(!r.ok)throw new Error('dictionary '+r.status);return r.json()}).then(d=>dictionary=d).catch(e=>{loading=null;throw e});
    return loading;
  }
  function lookup(raw){
    const w=clean(raw);if(!w)return null;
    const old=OLD_WORDS[w]||OLD_WORDS[w.replace(/'/g,'')];
    if(old)return {word:w,old:true,senses:[['',old]]};
    const entries=dictionary?.w||{},forms=dictionary?.f||{};
    if(SMALL_WORDS[w])return {word:w,senses:[['',SMALL_WORDS[w]]]};
    const older=OLD_SENSES[w]?[['in older books',OLD_SENSES[w]]]:[];
    for(const candidate of [forms[w],...lemmaCandidates(w)].filter(Boolean)){const entry=entries[candidate];if(entry)return {word:w,lemma:candidate,senses:[...older,...entry]}}
    if(older.length)return {word:w,senses:older};
    return null;
  }

  function enabled(){return forced||store.get(PREF)==='on'}
  function setEnabled(on){store.set(PREF,on?'on':'off');forced=false;sync()}
  function sync(){
    const reader=document.getElementById('reader'),button=document.getElementById('wordHelp');
    const on=enabled();reader?.classList.toggle('word-help',on);if(button){button.classList.toggle('on',on);button.setAttribute('aria-pressed',String(on))}
    if(!on)hide();decorate();if(on)load().catch(()=>{});
  }

  // Underline old words on the open pages (only while word help is on).
  function decorate(){
    for(const id of ['pageLeft','pageRight']){
      const el=document.getElementById(id);if(!el)continue;const text=el.textContent;
      if(!enabled()){if(el.querySelector('.old-word'))el.textContent=text;continue}
      if(el.querySelector('.old-word'))continue;OLD_PATTERN.lastIndex=0;if(!OLD_PATTERN.test(text))continue;OLD_PATTERN.lastIndex=0;
      const fragment=document.createDocumentFragment();let last=0,m;
      while((m=OLD_PATTERN.exec(text))){const start=m.index+m[1].length;fragment.append(text.slice(last,start));const span=document.createElement('span');span.className='old-word';span.textContent=m[2];fragment.append(span);last=start+m[2].length}
      fragment.append(text.slice(last));el.replaceChildren(fragment);
    }
  }

  function wordAt(x,y){
    let node,offset;
    if(document.caretPositionFromPoint){const p=document.caretPositionFromPoint(x,y);node=p?.offsetNode;offset=p?.offset}
    else if(document.caretRangeFromPoint){const r=document.caretRangeFromPoint(x,y);node=r?.startContainer;offset=r?.startOffset}
    if(!node||node.nodeType!==3)return null;
    const text=node.textContent,isWord=c=>/[A-Za-z'’-]/.test(c||'');
    let a=offset,b=offset;if(!isWord(text[a])&&isWord(text[a-1]))a=b=offset-1;if(!isWord(text[a]))return null;
    while(a>0&&isWord(text[a-1]))a--;while(b<text.length&&isWord(text[b]))b++;
    const word=text.slice(a,b).replace(/^[-'’]+|[-'’]+$/g,'');if(!/[A-Za-z]/.test(word))return null;
    const range=document.createRange();range.setStart(node,a);range.setEnd(node,b);return {word,rect:range.getBoundingClientRect()};
  }

  function speak(word){
    try{if(!('speechSynthesis'in window))return false;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(word);u.lang='en-GB';u.rate=.85;
      const voice=speechSynthesis.getVoices().find(v=>/^en(-|_)GB/i.test(v.lang))||speechSynthesis.getVoices().find(v=>/^en/i.test(v.lang));if(voice)u.voice=voice;speechSynthesis.speak(u);return true}catch(e){return false}
  }
  function notebook(){try{return JSON.parse(store.get(NOTEBOOK)||'[]')}catch(e){return []}}
  function save(entry){const list=notebook().filter(e=>e.w!==entry.w);list.unshift(entry);store.set(NOTEBOOK,JSON.stringify(list.slice(0,300)));return list.length}

  function hide(){card?.classList.add('hidden')}
  function show(found,raw,rect){
    if(!card){
      card=document.createElement('div');card.id='wordCard';card.className='word-card hidden';card.setAttribute('role','dialog');card.setAttribute('aria-label','Word meaning');
      card.innerHTML='<div class="wc-head"><strong></strong><button type="button" class="wc-say" aria-label="Say the word">🔊</button><button type="button" class="wc-close" aria-label="Close">×</button></div><div class="wc-body"></div><div class="wc-foot"><button type="button" class="wc-save">Save to my words</button></div>';
      card.addEventListener('pointerdown',e=>e.stopPropagation());card.addEventListener('pointerup',e=>e.stopPropagation());
      card.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('button');if(!b)return;
        if(b.classList.contains('wc-close'))hide();else if(b.classList.contains('wc-say'))speak(card.dataset.word);
        else if(b.classList.contains('wc-save')){save({w:card.dataset.word,m:card.dataset.meaning,b:currentBook?.title||''});b.textContent='Saved ✓';b.disabled=true}});
      document.getElementById('reader')?.appendChild(card);
    }
    const word=found?.lemma&&found.lemma!==clean(raw)?`${raw} → ${found.lemma}`:raw;
    card.querySelector('strong').textContent=word;card.dataset.word=found?.lemma||clean(raw);
    const body=card.querySelector('.wc-body');body.replaceChildren();
    if(found){for(const [pos,meaning] of found.senses.slice(0,2)){const p=document.createElement('p');if(pos||found.old){const tag=document.createElement('em');tag.textContent=found.old?'old word':pos;p.append(tag,' ')}p.append(meaning);body.append(p)}card.dataset.meaning=found.senses[0][1]}
    else{const p=document.createElement('p');p.textContent=dictionary?'Not in the pocket dictionary. It may be a name, or a rare or old word.':'The dictionary could not be loaded just now.';body.append(p);card.dataset.meaning=''}
    const saveButton=card.querySelector('.wc-save');saveButton.disabled=!found;saveButton.textContent=notebook().some(e=>e.w===card.dataset.word)?'Saved ✓':'Save to my words';
    card.classList.remove('hidden');
    const host=document.getElementById('reader').getBoundingClientRect(),w=Math.min(320,innerWidth-24),h=card.offsetHeight||120;
    let left=rect.left+rect.width/2-w/2,top=rect.bottom+10;if(top+h>innerHeight-12)top=rect.top-h-10;left=Math.max(12,Math.min(innerWidth-w-12,left));
    card.style.width=w+'px';card.style.left=(left-host.left)+'px';card.style.top=(Math.max(12,top)-host.top)+'px';
  }

  async function onTap(e){
    if(!enabled()||e.target.closest('#wordCard'))return;
    if(String(window.getSelection?.()||'').trim())return;
    const hit=wordAt(e.clientX,e.clientY);if(!hit){hide();return}
    e.stopPropagation();
    try{await load()}catch(err){}
    show(lookup(hit.word),hit.word,hit.rect);
  }

  function install({getBook}={}){
    const foot=document.querySelector('#reader .reader-foot'),pages=document.querySelector('#reader .pages');
    if(foot&&!document.getElementById('wordHelp')){const b=document.createElement('button');b.id='wordHelp';b.type='button';b.className='word-help-toggle';b.textContent='Word help';b.title='Tap any word to see what it means';b.setAttribute('aria-pressed','false');
      b.addEventListener('click',e=>{e.stopPropagation();setEnabled(!enabled())});foot.insertBefore(b,document.getElementById('readerStyle')||null)}
    pages?.addEventListener('click',onTap);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()},true);
    api.currentBook=getBook;sync();
  }
  // Called whenever the reader opens a book: word help comes on by itself for books from the learners' room,
  // unless the reader has switched it off themselves.
  function opened(book,fromLearnersRoom=false){currentBook=book;forced=fromLearnersRoom&&store.get(PREF)!=='off';hide();sync()}
  Object.assign(api,{install,opened,decorate,lookup,load,speak,notebook,save,enabled,setEnabled,hide});
  Object.defineProperty(api,'active',{get:enabled});
  window.libraryWordHelp=api;
})();
