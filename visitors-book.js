// The visitors' book by the entrance, signed by real readers. A signature is a first name or initials, a country,
// a book from the library and one line chosen from a fixed list, kept by a very small service
// (worker/visitors-book). It only appears once that service is set up (data/visitors-book-config.js); until then
// the lectern keeps the library's invented visitors' book (other-readers.js).
(function(){
  'use strict';

  // Keep in step with worker/visitors-book/worker.js (a test checks they match).
  const PHRASES=[
    'Came for one chapter, stayed for six.','The quiet was exactly what I needed.','Found a book I have meant to read for years.',
    'Read by the fire until very late.','I will be back tomorrow night.','Greetings from a fellow reader.','Got happily lost.',
    'The cat ignored me beautifully.','Followed the lamps and found a story.','Thank you for keeping the lights on.',
    'Reading in English, one page at a time.','Went to the Moon and back.'
  ];
  const COUNTRIES=('AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ '+
    'DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ '+
    'LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW '+
    'SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW').split(' ');
  const SIGNED_KEY='athenaeum-visitors-signed';

  let names=null;
  function countryName(code){
    try{names=names||new Intl.DisplayNames(['en'],{type:'region'});return names.of(code)||code}catch(e){return code}
  }

  window.ATHENAEUM_VISITORS_BOOK_RULES={PHRASES,COUNTRIES};
  window.createVisitorsBook=function(options){
    const {endpoint,books=()=>[],onOpen=()=>{},onClose=()=>{},onSigned=()=>{},fetchImpl=(...a)=>fetch(...a),storage=null,language=()=>'en',today=()=>new Date()}=options;
    const base=String(endpoint||'').replace(/\/+$/,'');
    const store={get(k){try{return storage?.getItem(k)??null}catch(e){return null}},set(k,v){try{storage?.setItem(k,v)}catch(e){}}};
    let entries=[],loaded=false,loading=null,dialog=null,open=false;const listeners=[];
    const titleOf=id=>{const b=books().find(x=>x.id===id);return b?b.title:null};
    const signedToday=()=>store.get(SIGNED_KEY)===today().toISOString().slice(0,10);
    function describe(e){return {id:e.id,name:e.n,place:countryName(e.c),country:e.c,book:e.b?titleOf(e.b):null,note:PHRASES[e.p]||'',date:new Date(e.d+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'long',timeZone:'UTC'})}}

    function refresh(){
      if(!base)return Promise.resolve([]);
      if(!loading)loading=fetchImpl(base+'/entries').then(r=>r.ok?r.json():Promise.reject(new Error(String(r.status)))).then(data=>{entries=(data.entries||[]).map(describe);loaded=true;for(const fn of listeners)fn(entries);return entries}).finally(()=>{loading=null});
      return loading;
    }
    async function sign(values){
      const name=String(values.name||'').replace(/\s+/g,' ').trim();
      if(!name)return {error:'Please give a first name or initials.'};
      if(!COUNTRIES.includes(values.country))return {error:'Please choose where you are reading from.'};
      const phrase=Number(values.phrase);if(!(phrase>=0&&phrase<PHRASES.length))return {error:'Please choose a line to write.'};
      let book=0;const title=String(values.book||'').trim();if(title){const match=books().find(b=>b.title.toLowerCase()===title.toLowerCase());if(!match)return {error:'Please choose a book from the list, or leave it empty.'};book=match.id}
      let response;try{response=await fetchImpl(base+'/sign',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,country:values.country,book,phrase})})}catch(e){return {error:'The book could not be reached just now. Please try again.'}}
      let data={};try{data=await response.json()}catch(e){}
      if(!response.ok)return {error:data.error||'The book could not take that signature.'};
      store.set(SIGNED_KEY,today().toISOString().slice(0,10));
      const entry=describe(data.entry);entries=[entry,...entries.filter(e=>e.id!==entry.id)];for(const fn of listeners)fn(entries);onSigned(entry);
      return {entry};
    }

    // While the book is open, keys belong to it: typing never walks or turns pages, and Escape closes it.
    window.addEventListener?.('keydown',e=>{if(!open)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();return}e.stopImmediatePropagation()},true);
    window.addEventListener?.('keyup',e=>{if(open)e.stopImmediatePropagation()},true);

    // ---------- the dialog ----------
    function build(){
      dialog=document.createElement('div');dialog.id='visitorsBook';dialog.className='hidden';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','vbTitle');
      dialog.innerHTML=`<section class="vb-card"><small>THE LIBRARY AFTER DARK</small><h2 id="vbTitle">The visitors’ book</h2>
        <p class="vb-intro">Readers who came in after dark, most recent first.</p><ol class="vb-list" aria-live="polite"></ol>
        <form class="vb-form" novalidate><h3>Sign the book</h3>
          <label>Your first name or initials<input name="name" maxlength="24" autocomplete="given-name" required></label>
          <label>Where you are reading from<select name="country" required><option value="">Choose a country…</option></select></label>
          <label>A book from the library you like <em>(optional)</em><input name="book" list="vbBooks" autocomplete="off" placeholder="Start typing a title"><datalist id="vbBooks"></datalist></label>
          <label>And a line for the book<select name="phrase" required></select></label>
          <p class="vb-privacy">Your name, country, book and line are shown to everyone who opens the book. Nothing else is kept.</p>
          <p class="vb-status" role="status"></p>
          <div class="vb-actions"><button type="submit" class="primary">Sign the visitors’ book</button><button type="button" class="ghost vb-close">Close</button></div>
        </form>
        <div class="vb-signed hidden"><p>You have signed the book tonight. Thank you for visiting.</p><button type="button" class="ghost vb-close">Close</button></div></section>`;
      document.body.appendChild(dialog);
      const form=dialog.querySelector('form'),country=form.elements.country,phrase=form.elements.phrase;
      for(const code of [...COUNTRIES].sort((a,b)=>countryName(a).localeCompare(countryName(b)))){const o=document.createElement('option');o.value=code;o.textContent=countryName(code);country.append(o)}
      const region=(String(language()||'').match(/[-_]([A-Za-z]{2})$/)||[])[1];if(region&&COUNTRIES.includes(region.toUpperCase()))country.value=region.toUpperCase();
      PHRASES.forEach((text,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=text;phrase.append(o)});
      const list=dialog.querySelector('#vbBooks');for(const b of books().slice().sort((a,b)=>a.title.localeCompare(b.title))){const o=document.createElement('option');o.value=b.title;list.append(o)}
      form.addEventListener('submit',async e=>{e.preventDefault();const status=dialog.querySelector('.vb-status'),button=form.querySelector('button[type=submit]');
        button.disabled=true;status.textContent='Signing…';const result=await sign({name:form.elements.name.value,country:country.value,book:form.elements.book.value,phrase:phrase.value});button.disabled=false;
        if(result.error){status.textContent=result.error;return}status.textContent='';render()});
      dialog.addEventListener('click',e=>{if(e.target.closest('.vb-close')||e.target===dialog)close()});
    }
    function render(){
      if(!dialog)return;const list=dialog.querySelector('.vb-list');list.replaceChildren();
      if(!loaded){const li=document.createElement('li');li.className='vb-empty';li.textContent=loading?'Opening the book…':'The book could not be opened just now.';list.append(li)}
      else if(!entries.length){const li=document.createElement('li');li.className='vb-empty';li.textContent='No one has signed yet. Be the first.';list.append(li)}
      for(const e of entries.slice(0,40)){
        const li=document.createElement('li'),who=document.createElement('strong'),line=document.createElement('q'),meta=document.createElement('small');
        who.textContent=`${e.name} · ${e.place}`;line.textContent=e.note;meta.textContent=[e.book,e.date].filter(Boolean).join(' · ');li.append(who,line,meta);list.append(li);
      }
      const done=signedToday();dialog.querySelector('.vb-form').classList.toggle('hidden',done);dialog.querySelector('.vb-signed').classList.toggle('hidden',!done);
    }
    function openBook(){
      if(!dialog)build();open=true;dialog.classList.remove('hidden');onOpen();render();
      refresh().then(render,render);
      setTimeout(()=>{const first=signedToday()?dialog.querySelector('.vb-signed button'):dialog.querySelector('input[name=name]');first?.focus()},50);
    }
    function close(){if(!open)return;open=false;dialog.classList.add('hidden');onClose()}
    return {open:openBook,close,refresh,sign,onChange(fn){listeners.push(fn)},get entries(){return entries.slice()},get loaded(){return loaded},get isOpen(){return open},PHRASES,COUNTRIES,countryName};
  };
})();
