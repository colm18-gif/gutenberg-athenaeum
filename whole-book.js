// The whole book: every page of a fine book's original, read one page at a time over the library, beside the facsimile
// that shows its finest pages (fine-books.js). The pages are not kept by the library: each is a page of a complete
// public-domain scan on Wikimedia Commons, fetched as the reader turns to it (at a standard width, so Commons can serve
// it from its cache), with the pages either side fetched ahead. Turn with the arrows, swipe or the keys; go to a page or
// a folio by its number, or to one of the book's marked places; zoom and drag as in the map viewer. The reader remembers
// where each book was left.
(function(){
  'use strict';

  // The address Commons serves a page of a multi-page file at: its name, the two folders made from the name's MD5 (given
  // by the book, since browsers have no MD5), the page and the width.
  function pageUrl(spec,page,width){const name=encodeURIComponent(spec.file.replace(/ /g,'_'));return `https://upload.wikimedia.org/wikipedia/commons/thumb/${spec.hash}/${name}/page${page}-${width}px-${name}.jpg`}

  window.createWholeBook=function(spec,{onOpen=null,onClose=null,analytics=null,storage=(()=>{try{return window.localStorage}catch(e){return null}})()}={}){
    const KEY=`athenaeum-whole-${spec.id}`,PAGES=spec.pages;
    let root=null,img=null,stage=null,open=false,page=1,scale=1,x=0,y=0,fitScale=1,swipe=null,ahead=[],tries=0;
    const pointers=new Map();let pinch=null,drag=null;
    const clampPage=n=>Math.max(1,Math.min(PAGES,Math.round(n)||1));
    // A standard width Commons serves (it refuses others): the larger for big or sharp screens, if the scan is that wide.
    const widths=spec.widths||[960],width=()=>widths.length>1&&Math.max(innerWidth,innerHeight)*(window.devicePixelRatio||1)>1400?widths.at(-1):widths[0];
    function remembered(){try{const n=Number(storage?.getItem(KEY));return n>=1&&n<=PAGES?n:null}catch(e){return null}}
    function remember(){try{storage?.setItem(KEY,String(page))}catch(e){}}

    function style(){
      if(document.getElementById('wholeBookStyle'))return;const s=document.createElement('style');s.id='wholeBookStyle';
      s.textContent=`.whole-book{position:fixed;inset:0;z-index:43;display:grid;grid-template-columns:1fr minmax(260px,330px);background:rgba(8,7,6,.96);color:#e8dcc0;font-family:Georgia,serif}
.whole-book.hidden,.whole-book [hidden]{display:none!important}.whole-book .wb-stage{position:relative;overflow:hidden;touch-action:none;cursor:grab;background:radial-gradient(circle at 50% 50%,#2a2218,#0b0a08)}
.whole-book .wb-stage.dragging{cursor:grabbing}.whole-book img{position:absolute;left:0;top:0;transform-origin:0 0;max-width:none;user-select:none;-webkit-user-drag:none;box-shadow:0 10px 60px #000}
.whole-book .wb-wait{position:absolute;inset:0;display:grid;place-items:center;padding:30px;text-align:center;font-style:italic;color:#bfae8e;pointer-events:none}
.whole-book .wb-wait button{pointer-events:auto;margin-top:12px}.whole-book aside{padding:26px 22px 18px;overflow:auto;border-left:1px solid #5a4528;background:linear-gradient(160deg,#241a10,#121512)}
.whole-book small{color:#c9a46b;letter-spacing:.2em;font-size:12px}.whole-book h2{font-weight:normal;font-size:23px;line-height:1.2;color:#f3e3bf;margin:10px 0 4px}
.whole-book .wb-sub{font-style:italic;color:#cbb58c;margin:0 0 14px}.whole-book .wb-where{font-size:19px;color:#f3e3bf;margin:0 0 4px}.whole-book .wb-mark{font-style:italic;color:#cbb58c;min-height:1.3em;margin:0 0 12px}
.whole-book .wb-credit{font-size:13px;color:#a8987a;line-height:1.45}.whole-book .wb-credit a{color:#d9b97a}.whole-book .wb-tools{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}
.whole-book button,.whole-book input,.whole-book select{font:inherit;font-size:15px;color:#f0dfbd;background:#2c2014;border:1px solid #9a7a48;border-radius:3px;padding:7px 11px}
.whole-book button{cursor:pointer}.whole-book button:hover,.whole-book button:focus-visible{background:#4a3520;outline:none}.whole-book button:disabled{opacity:.4;cursor:default}
.whole-book form{display:flex;gap:6px;margin:6px 0 10px}.whole-book input{width:6.5em}.whole-book select{max-width:100%;width:100%;margin:2px 0 12px}
.whole-book .wb-close{position:absolute;top:10px;right:12px}.whole-book .wb-hint{font-size:13px;color:#8f826a;margin-top:12px;font-style:italic}
@media (max-width:760px){.whole-book{grid-template-columns:1fr;grid-template-rows:1fr auto}.whole-book aside{max-height:40vh;border-left:0;border-top:1px solid #5a4528;padding:12px 14px 12px}
.whole-book h2,.whole-book .wb-sub,.whole-book .wb-hint{display:none}.whole-book .wb-close{top:auto;bottom:calc(40vh + 10px)}}`;
      document.head.appendChild(s);
    }
    function build(){
      style();root=document.createElement('div');root.className='whole-book hidden';root.id=`wholeBook-${spec.id}`;root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label',`${spec.title}: the whole book`);
      root.innerHTML=`<div class="wb-stage" aria-label="The page. Drag to move it, scroll or pinch to zoom, swipe to turn."><img alt=""><div class="wb-wait"><div><span class="wb-message">The page is on its way from Wikimedia Commons…</span><br><button type="button" data-act="retry" hidden>Try again</button></div></div></div>
        <aside><small>THE WHOLE BOOK</small><h2></h2><p class="wb-sub"></p><p class="wb-where" aria-live="polite"></p><p class="wb-mark"></p>
        <div class="wb-tools"><button type="button" data-act="prev" aria-label="The previous page">← Back</button><button type="button" data-act="next" aria-label="The next page">On →</button>
        <button type="button" data-act="out" aria-label="Zoom out">−</button><button type="button" data-act="in" aria-label="Zoom in">+</button></div>
        <form><input type="text" inputmode="text" aria-label="${spec.goLabel||'Go to a page'}" placeholder="${spec.goPlaceholder||'page'}"><button type="submit">Go</button></form>
        <select aria-label="Go to a marked place"><option value="">Marked places…</option></select>
        <p class="wb-credit"></p><p class="wb-hint">Turn with the arrows or a swipe; drag to move the page, scroll, pinch or double-click to look closer. Escape puts the book back.</p></aside>
        <button type="button" class="wb-close" data-act="close">Back to the room</button>`;
      document.body.appendChild(root);stage=root.querySelector('.wb-stage');img=root.querySelector('img');
      root.querySelector('h2').textContent=spec.title;root.querySelector('.wb-sub').textContent=spec.sub||'';
      const credit=root.querySelector('.wb-credit');credit.append(`${spec.source} Scan: `);const a=document.createElement('a');a.href=spec.commons;a.target='_blank';a.rel='noopener';a.textContent='Wikimedia Commons';credit.append(a,', in the public domain. Each page comes from Commons as you turn to it.');
      const select=root.querySelector('select');for(const [label,n] of spec.marks||[]){const o=document.createElement('option');o.value=String(n);o.textContent=label;select.append(o)}
      if(!(spec.marks||[]).length)select.hidden=true;
      select.addEventListener('change',()=>{if(select.value)show(Number(select.value));select.value='';select.blur()});
      root.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const input=root.querySelector('input'),n=(spec.parse||(t=>Number(t)))(input.value.trim());if(n){show(n);input.value='';input.blur()}else input.select()});
      root.addEventListener('click',e=>{const act=e.target.closest('[data-act]')?.dataset.act;if(!act)return;if(act==='close')close();else if(act==='prev')show(page-1);else if(act==='next')show(page+1);else if(act==='in')zoom(1.6);else if(act==='out')zoom(1/1.6);else if(act==='retry'){tries=0;show(page,true)}});
      img.addEventListener('load',()=>{tries=0;waiting(false);fit()});
      img.addEventListener('error',()=>{if(!open)return;
        // Commons makes a page the first time it is asked for at a size, and may answer slowly or not at first: ask again.
        if(tries++<2){setTimeout(()=>{if(open)img.src=`${pageUrl(spec,page,width())}${tries>1?`?retry=${tries}`:''}`},1500*tries);return}
        waiting(true,'Wikimedia Commons has not sent this page. It may be busy; try again in a moment.')});
      stage.addEventListener('wheel',e=>{e.preventDefault();const r=stage.getBoundingClientRect();zoom(Math.exp(-e.deltaY*.0015),e.clientX-r.left,e.clientY-r.top)},{passive:false});
      stage.addEventListener('dblclick',e=>{const r=stage.getBoundingClientRect();if(scale>fitScale*1.5)fit();else zoom(2.5,e.clientX-r.left,e.clientY-r.top)});
      stage.addEventListener('pointerdown',e=>{stage.setPointerCapture?.(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
        if(pointers.size===1){drag={x:e.clientX-x,y:e.clientY-y};swipe={x:e.clientX,y:e.clientY,t:performance.now()}}else if(pointers.size===2){const [a,b]=[...pointers.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),scale};drag=null;swipe=null}stage.classList.add('dragging')});
      stage.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
        if(pinch&&pointers.size===2){const [a,b]=[...pointers.values()],r=stage.getBoundingClientRect(),d=Math.hypot(a.x-b.x,a.y-b.y);zoomTo(pinch.scale*d/pinch.d,(a.x+b.x)/2-r.left,(a.y+b.y)/2-r.top)}
        else if(drag&&scale>fitScale*1.02){x=e.clientX-drag.x;y=e.clientY-drag.y;apply()}});
      // A quick sideways swipe on a page that is not zoomed turns it.
      const up=e=>{const s=swipe;pointers.delete(e.pointerId);if(pointers.size<2)pinch=null;
        if(s&&!pointers.size&&scale<=fitScale*1.02){const dx=e.clientX-s.x,dy=e.clientY-s.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5&&performance.now()-s.t<700)show(page+(dx<0?1:-1))}
        if(pointers.size===1){const p=[...pointers.values()][0];drag={x:p.x-x,y:p.y-y}}else if(!pointers.size){drag=null;swipe=null;stage.classList.remove('dragging')}};
      stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);
      window.addEventListener('resize',()=>{if(open)fit()});
      // While the book is open, keys belong to it: nothing walks, and Escape puts it back.
      window.addEventListener('keydown',e=>{if(!open)return;const k=e.key;if(e.target?.tagName==='INPUT'&&k!=='Escape')return;e.stopImmediatePropagation();
        if(k==='Escape'){e.preventDefault();close()}else if(k==='ArrowRight'||k==='PageDown'||k===' '){e.preventDefault();show(page+1)}else if(k==='ArrowLeft'||k==='PageUp'){e.preventDefault();show(page-1)}
        else if(k==='Home'){show(1)}else if(k==='End'){show(PAGES)}else if(k==='+'||k==='='){zoom(1.4)}else if(k==='-'||k==='_'){zoom(1/1.4)}else if(k==='0'){fit()}},true);
      window.addEventListener('keyup',e=>{if(open&&e.target?.tagName!=='INPUT')e.stopImmediatePropagation()},true);
    }
    function waiting(on,message){const box=root.querySelector('.wb-wait');box.hidden=!on;if(message)root.querySelector('.wb-message').textContent=message;root.querySelector('[data-act="retry"]').hidden=!message||!on;if(on)img.style.visibility='hidden';else img.style.visibility='visible'}
    function apply(){if(!img.naturalWidth)return;const r=stage.getBoundingClientRect(),w=img.naturalWidth*scale,h=img.naturalHeight*scale,m=60;x=Math.min(r.width-m,Math.max(m-w,x));y=Math.min(r.height-m,Math.max(m-h,y));img.style.transform=`translate(${x}px,${y}px) scale(${scale})`}
    function fit(){if(!img.naturalWidth)return;const r=stage.getBoundingClientRect();fitScale=Math.min((r.width-20)/img.naturalWidth,(r.height-20)/img.naturalHeight);scale=fitScale;x=(r.width-img.naturalWidth*scale)/2;y=(r.height-img.naturalHeight*scale)/2;apply()}
    function zoomTo(next,cx,cy){const r=stage.getBoundingClientRect();if(cx==null){cx=r.width/2;cy=r.height/2}next=Math.max(fitScale,Math.min(fitScale*8,next));x=cx-(cx-x)*next/scale;y=cy-(cy-y)*next/scale;scale=next;apply()}
    function zoom(f,cx,cy){zoomTo(scale*f,cx,cy)}
    // The page itself, and the pages either side fetched ahead so that turning is quick.
    function show(n,again=false){
      n=clampPage(n);if(n===page&&!again&&img.getAttribute('src'))return;page=n;tries=0;remember();
      root.querySelector('.wb-where').textContent=spec.label?spec.label(page):`Page ${page} of ${PAGES}`;
      const mark=(spec.marks||[]).find(([,m])=>m===page);root.querySelector('.wb-mark').textContent=mark?mark[0]:'';
      root.querySelector('[data-act="prev"]').disabled=page<=1;root.querySelector('[data-act="next"]').disabled=page>=PAGES;
      waiting(true,'');root.querySelector('.wb-message').textContent='The page is on its way from Wikimedia Commons…';img.removeAttribute('src');img.alt=`${spec.title}, ${spec.label?spec.label(page):'page '+page}`;img.src=pageUrl(spec,page,width());
      ahead=[page+1,page-1,page+2].filter(p=>p>=1&&p<=PAGES).map(p=>{const i=new Image();i.decoding='async';i.src=pageUrl(spec,p,width());return i});
    }
    function openAt(n){if(!root)build();open=true;root.classList.remove('hidden');onOpen?.();page=0;show(n??remembered()??spec.start??1);analytics?.track?.('Whole Book Opened',{whole:spec.id});setTimeout(()=>root.querySelector('.wb-close').focus(),30)}
    function close(){if(!open)return;open=false;root.classList.add('hidden');img.removeAttribute('src');ahead=[];onClose?.()}
    return {open:openAt,close,show,get isOpen(){return open},get page(){return page},pages:PAGES,url:n=>pageUrl(spec,clampPage(n),width())};
  };
  window.wholeBookPageUrl=pageUrl;
})();
