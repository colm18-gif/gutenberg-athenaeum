// Reading cards: a reader's place in each book, carried between their phone, laptop and anywhere else, with no account.
// A card is a code of four words and two digits (oak-wren-harp-pine-07) kept by the visitors' book service
// (worker/visitors-book). This browser keeps its own bookmarks as always (athenaeum-progress-<id>); with a card, they
// are sent to the card now and then and the card's are brought back, the later visit to each book winning. Used by the
// 3D library and by the plain text reader (read.html).
(function(){
  'use strict';
  const PREFIX='athenaeum-progress-',CARD='athenaeum-card',SENT='athenaeum-card-sent';
  const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}},remove(k){try{localStorage.removeItem(k)}catch(e){}},
    keys(){try{return Object.keys(localStorage)}catch(e){return[]}}};
  const endpoint=()=>String(window.ATHENAEUM_VISITORS_BOOK?.endpoint||'').replace(/\/+$/,'');
  const cleanCode=raw=>{const code=String(raw??'').trim().toLowerCase().replace(/[\s_]+/g,'-');return /^[a-z]{2,10}(-[a-z]{2,10}){3}-\d{2}$/.test(code)?code:null};

  // This browser's bookmarks, as the card holds them: {id:{p,t}}.
  function local(){
    const books={};
    for(const key of store.keys()){if(!key.startsWith(PREFIX))continue;const id=Number(key.slice(PREFIX.length));if(!Number.isInteger(id)||id<=0)continue;
      try{const v=JSON.parse(store.get(key));if(v&&typeof v.p==='number'&&v.p>0)books[id]={p:v.p,t:Number(v.t)||0}}catch(e){}}
    return books;
  }
  // The card's bookmarks, where they are later than this browser's.
  function absorb(books){
    let changed=0;
    for(const [id,v] of Object.entries(books||{})){let held=null;try{held=JSON.parse(store.get(PREFIX+id)||'null')}catch(e){}
      if(!held||!(Number(held.t)>=v.t)){store.set(PREFIX+id,JSON.stringify({p:v.p,n:held?.n>1?held.n:100,t:v.t}));changed++}}
    return changed;
  }
  async function call(method,path,body){
    const base=endpoint();if(!base)throw new Error('Reading cards are not available just now.');
    const r=await fetch(base+path,{method,headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,keepalive:method==='PUT'});
    const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'The reading card could not be reached.');return data;
  }
  const code=()=>cleanCode(store.get(CARD));
  let busy=false;
  // Send this browser's bookmarks to the card and bring back the card's. Quiet on failure: it tries again later.
  async function sync(){
    const c=code();if(!c||busy)return {ok:false};busy=true;
    try{
      const mine=local(),snapshot=JSON.stringify(mine),dirty=snapshot!==store.get(SENT);
      const data=dirty?await call('PUT','/card/'+c,{books:mine}):await call('GET','/card/'+c);
      const pulled=absorb(data.books);
      // Once the card holds every bookmark here at least as recent, there is nothing more to send.
      const held=data.books||{};if(Object.entries(mine).every(([id,v])=>held[id]&&held[id].t>=v.t))store.set(SENT,JSON.stringify(local()));
      return {ok:true,pulled};
    }catch(e){return {ok:false,error:e.message}}finally{busy=false}
  }
  async function make(){const data=await call('POST','/card');store.set(CARD,data.code);store.remove(SENT);await sync();return data.code}
  async function use(raw){const c=cleanCode(raw);if(!c)throw new Error('A card code is four words and two digits, like oak-wren-harp-pine-07.');
    await call('GET','/card/'+c);store.set(CARD,c);store.remove(SENT);return sync()}
  function forget(){store.remove(CARD);store.remove(SENT)}
  // A bookmark saved now carries the time, so the card knows which visit was later.
  function stamp(id,p,n){store.set(PREFIX+id,JSON.stringify({p,n,t:Date.now()}))}
  // Now and then while the reader is here, and when they leave or put the page away.
  let timer=null;
  function start(){if(timer||!code())return;sync();timer=setInterval(sync,180000);addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')sync()});addEventListener('pagehide',()=>{sync()})}
  window.AthenaeumCard={get code(){return code()},available:()=>!!endpoint(),make,use,forget,sync,start,stamp,local,absorb,cleanCode};
})();
