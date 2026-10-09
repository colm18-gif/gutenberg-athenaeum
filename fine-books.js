// The library's fine books: facsimiles bound on thick board leaves that stay stiff as they turn, each leaf a solid slab
// swinging on its hinge at the spine. Each book is a small description (kells-book.js, kelmscott-book.js): its pages and
// their cards, the pages the library draws itself (title, colophon, pastedowns), its binding, its paper and its type.
//
// Opening a book lays it on a museum cradle under a lamp. While it is open the library stops drawing the world and the
// book draws its own small scene with the same renderer, so there is no second WebGL context. Drag a page to turn it
// (or swipe, or the arrows); scroll, pinch or double-click to look closer; Escape closes it. Only the pages either side
// of the open spread are loaded, and everything is freed when the book is closed.
(function(){
  'use strict';

  window.createFineBook=function(options,spec){
    const {THREE,renderer,playSample,sound,fetchJson=url=>fetch(url).then(r=>r.ok?r.json():{}),onOpen,onClose,loadTexture=null}=options;
    const {id,base,manifestFile,FOLIOS,DRAWN,FACES,BACK_INSIDE='paste-back'}=spec,TURNING=FACES.length/2;
    // What lies open after n leaves have turned: [left, right] (the closed book shows only its cover).
    const spread=n=>n<=0?[null,'cover']:[FACES[2*n-1],n<TURNING?FACES[2*n]:BACK_INSIDE];
    const font=spec.font||null,binding=spec.binding||{},edgeColour=binding.edges??0xc39a52,leatherColour=binding.leather??0x3a2216;
    // In the book's own units: a leaf is 1 wide and as tall as the book's own page is in proportion.
    const W=1,H=spec.aspect,T=.026,CT=.055,CW=W+.04,CH=H+.06,TILT=.075,GAP=.008,EXPOSURE=1.15,FOV=30,LOOK=.36;
    const thick=i=>i===0?CT:T;
    let manifest=null,scene=null,camera=null,book=null,leaves=[],backCover=null,lamp=null,dom=null,stage=null,caption=null;
    let open=false,turned=0,anim=null,drag=null,zoom=1,pan={x:0,z:0},panTarget={x:0,z:0},zoomTarget=1,focus=1,last=0,fontReady=null;
    let view={x:W/2,z:0,d:4},savedExposure=1,savedShadow=[false,0];
    const owned=[],textures=new Map(),drawn=new Map(),pointers=new Map();
    let placeholder=null,coverTexture=null,anisotropy=1;const wedges=[];

    // ---------- drawing the pages that are not photographs ----------
    const fontFamily=()=>fontReady===true&&font?`"${font.family}", Georgia, serif`:'Georgia, serif';
    function loadFont(){
      if(fontReady!==null)return Promise.resolve();
      if(!font||typeof FontFace!=='function'||!document.fonts){fontReady=false;return Promise.resolve()}
      const face=new FontFace(font.family,`url(${font.url})`);
      return Promise.race([face.load().then(f=>{document.fonts.add(f);fontReady=true}),new Promise(r=>setTimeout(r,2500))]).catch(()=>{}).then(()=>{if(fontReady!==true)fontReady=false});
    }
    function canvas(w,h,paint){const c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=anisotropy;return t}
    // The page's ground: the book's own paper or vellum if it has one, else plain calfskin, warm and uneven.
    function paper(c,w,h,seed=1){
      if(spec.paper)return spec.paper(c,w,h,seed);
      c.fillStyle='#e7d7b5';c.fillRect(0,0,w,h);
      let s=seed*9301+49297;const rnd=()=>(s=(s*9301+49297)%233280)/233280;
      for(let i=0;i<70;i++){const x=rnd()*w,y=rnd()*h,r=40+rnd()*160,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rnd()<.5?'150,118,70':'255,246,220'},${.05+rnd()*.06})`);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
      const edge=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.35,w/2,h/2,Math.max(w,h)*.75);edge.addColorStop(0,'rgba(0,0,0,0)');edge.addColorStop(1,'rgba(92,60,24,.32)');c.fillStyle=edge;c.fillRect(0,0,w,h);
    }
    function lines(c,text,x,y,maxWidth,lineHeight){const words=text.split(' ');let line='';for(const word of words){const next=line?line+' '+word:word;if(c.measureText(next).width>maxWidth&&line){c.fillText(line,x,y);y+=lineHeight;line=word}else line=next}if(line)c.fillText(line,x,y);return y+lineHeight}
    const PW=1024,PH=Math.round(1024*H);
    // The pages the book's own description draws, with the engine's kit, and a page for a photograph that has not come.
    const kit={paper,lines,fontFamily,canvas:(w,h,p)=>canvas(w,h,p)};
    const painters=Object.assign({missing:(c,w,h)=>{paper(c,w,h,13);c.fillStyle='rgba(42,26,16,.55)';c.textAlign='center';c.font='italic 34px Georgia, serif';c.fillText('This page has not arrived yet.',w/2,h/2)}},spec.painters(kit));
    const paintCover=(c,w,h)=>spec.paintCover(c,w,h,kit);
    // The cover is drawn once and kept (it is small); drawn before the book's type has loaded, it is drawn again after.
    const paintCoverAt=(c,w,h)=>{c.setTransform(w/1024,0,0,h/Math.round(1024*CH/CW),0,0);paintCover(c,1024,Math.round(1024*CH/CW))};
    function getCoverTexture(){
      if(coverTexture)return coverTexture;coverTexture=canvas(512,Math.round(512*CH/CW),paintCoverAt);
      if(fontReady!==true)loadFont().then(()=>{if(fontReady===true&&coverTexture){const c=coverTexture.image;paintCoverAt(c.getContext('2d'),c.width,c.height);coverTexture.needsUpdate=true}});
      return coverTexture;
    }

    // ---------- the scene ----------
    function material(params){const m=new THREE.MeshStandardMaterial(params);owned.push(m);return m}
    function geometry(g){owned.push(g);return g}
    function facePlane(parent,y,back){
      const holder=new THREE.Group();if(back)holder.rotation.z=Math.PI;parent.add(holder);
      const m=material({map:placeholder,roughness:.86,metalness:0});const plane=new THREE.Mesh(planeGeometry,m);plane.rotation.x=-Math.PI/2;plane.position.set(0,y,0);plane.receiveShadow=true;holder.add(plane);return m;
    }
    let planeGeometry=null;
    function build(){
      anisotropy=Math.min(8,renderer.capabilities?.getMaxAnisotropy?.()||1);
      placeholder=canvas(256,Math.round(256*H),(c,w,h)=>paper(c,w,h,17));owned.push(placeholder);
      scene=new THREE.Scene();scene.background=new THREE.Color(0x0b0806);
      camera=new THREE.PerspectiveCamera(FOV,1,.05,40);
      scene.add(new THREE.HemisphereLight(0xffe2bd,0x1a1009,.9));
      lamp=new THREE.SpotLight(0xffd29a,30,14,.7,.8,1.4);lamp.position.set(-1,4,2.2);lamp.castShadow=true;lamp.shadow.mapSize.set(1024,1024);lamp.shadow.bias=-.0012;lamp.shadow.normalBias=.04;lamp.shadow.camera.near=1;lamp.shadow.camera.far=8;scene.add(lamp,lamp.target);
      // A warm glow from the right, as from a second candle, so the right-hand page is not lost in shadow.
      const fill=new THREE.PointLight(0xffc98a,5,9,1.6);fill.position.set(2.6,2.4,1.6);scene.add(fill);const rim=new THREE.DirectionalLight(0xa9b8ff,.25);rim.position.set(2.5,2,-2);scene.add(rim);
      // An oak table and a cradle of two felt wedges, angled like the book.
      const table=new THREE.Mesh(geometry(new THREE.PlaneGeometry(14,10)),material({color:0x2b1b11,roughness:.62}));table.rotation.x=-Math.PI/2;table.position.y=-.2;table.receiveShadow=true;scene.add(table);
      const felt=material({color:0x1f1e1a,roughness:1});
      for(const side of [-1,1]){if(side<0)wedges.length=0;const wedge=new THREE.Mesh(geometry(new THREE.BoxGeometry(CW*.92,.2,CH*.9)),felt);wedge.position.set(side*(CW*.46+.02),-.1+Math.sin(TILT)*CW*.46,0);wedge.rotation.z=side*TILT;wedge.receiveShadow=wedge.castShadow=true;scene.add(wedge);wedges.push(wedge)}
      book=new THREE.Group();book.position.y=.02;scene.add(book);
      planeGeometry=geometry(new THREE.PlaneGeometry(W,H));
      const gilt=material({color:edgeColour,metalness:binding.gilt===false?0:.6,roughness:binding.gilt===false?.9:.55}),leather=material({color:leatherColour,roughness:.7}),coverTop=material({map:getCoverTexture(),roughness:.62,metalness:.05});
      const leafGeometry=geometry(new THREE.BoxGeometry(W,T,H)),coverGeometry=geometry(new THREE.BoxGeometry(CW,CT,CH));
      // The leaves that turn: the front cover first, then the seven board leaves.
      for(let i=0;i<TURNING;i++){
        const pivot=new THREE.Group();book.add(pivot);const w=i===0?CW:W,t=thick(i);
        const slab=new THREE.Group();slab.position.set(w/2+GAP,t/2,i===0?0:0);pivot.add(slab);
        const body=new THREE.Mesh(i===0?coverGeometry:leafGeometry,i===0?[leather,leather,coverTop,leather,leather,leather]:gilt);body.castShadow=true;body.receiveShadow=true;slab.add(body);
        const front=i===0?null:facePlane(slab,t/2+.0007,false),back=facePlane(slab,t/2+.0007,true);
        leaves.push({pivot,slab,front,back,pos:0,i});
      }
      // The back cover, which stays where it is; its inside is the last page.
      backCover=new THREE.Group();book.add(backCover);backCover.rotation.z=TILT;const slab=new THREE.Group();slab.position.set(CW/2+GAP,CT/2,0);backCover.add(slab);
      const backBody=new THREE.Mesh(coverGeometry,leather);backBody.receiveShadow=backBody.castShadow=true;slab.add(backBody);backCover.inside=facePlane(slab,CT/2+.0007,false);
      // The spine, rounded leather under the gutter.
      const spine=new THREE.Mesh(geometry(new THREE.CylinderGeometry(.05,.05,CH,16,1,false,Math.PI/2,Math.PI)),leather);spine.rotation.x=Math.PI/2;spine.rotation.y=Math.PI;spine.position.set(0,.02,0);book.add(spine);
      layout();
    }
    // Heights of each turning leaf's hinge, lying to the right (on the leaves after it) or to the left (on those before).
    function rightY(i){let y=CT;for(let j=i+1;j<TURNING;j++)y+=thick(j);return y}
    function leftY(i){let y=0;for(let j=0;j<=i;j++)y+=thick(j);return y}
    const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    function place(leaf,p){
      const a=TILT+(Math.PI-2*TILT)*ease(p);leaf.pivot.rotation.z=a;
      // Mid-turn the leaf rises a little off its hinge, as a stiff board does.
      leaf.pivot.position.y=rightY(leaf.i)+(leftY(leaf.i)-rightY(leaf.i))*p+Math.sin(p*Math.PI)*.02;
    }
    function layout(){for(const leaf of leaves){leaf.pos=leaf.i<turned?1:0;place(leaf,leaf.pos)}}

    // ---------- the pages' pictures ----------
    function faceMaterials(key){
      const out=[];if(key===BACK_INSIDE)out.push(backCover.inside);
      FACES.forEach((k,index)=>{if(k!==key)return;const leaf=leaves[Math.floor(index/2)];const m=index%2?leaf.back:leaf.front;if(m)out.push(m)});return out;
    }
    function drawnTexture(key){if(!drawn.has(key))drawn.set(key,canvas(PW,PH,painters[key]||painters.missing));return drawn.get(key)}
    function textureFor(key,done){
      if(key==='cover')return;
      if(painters[key]){done(drawnTexture(key));return}
      if(textures.has(key)){const t=textures.get(key);if(t.ready)done(t.texture);return}
      const entry={ready:false,texture:null};textures.set(key,entry);
      if(manifest&&!manifest[key]){entry.ready=true;entry.texture=drawnTexture('missing');entry.shared=true;done(entry.texture);return}
      const ok=texture=>{if(textures.get(key)!==entry){texture.dispose?.();return}texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=anisotropy;entry.ready=true;entry.texture=texture;done(texture)};
      const fail=()=>{if(textures.get(key)!==entry)return;entry.ready=true;entry.texture=drawnTexture('missing');entry.shared=true;done(entry.texture)};
      const url=`${base}${key}.jpg`;if(loadTexture)loadTexture(url,ok,fail);else new THREE.TextureLoader().load(url,ok,undefined,fail);
    }
    function show(key){if(!key)return;textureFor(key,texture=>{for(const m of faceMaterials(key)){m.map=texture;m.needsUpdate=true}})}
    // The faces of the open spread and of the spreads either side are kept; the photographs of any others are let go.
    function wantedFaces(){const keys=new Set();for(let n=turned-1;n<=turned+1;n++)if(n>=0&&n<=TURNING)for(const k of spread(n))if(k)keys.add(k);if(anim||drag)for(const k of spread(anim?.to??drag?.to??turned))if(k)keys.add(k);return keys}
    function refreshPages(){
      const keys=wantedFaces();for(const k of keys)show(k);
      for(const [key,entry] of textures)if(!keys.has(key)){for(const m of faceMaterials(key)){m.map=placeholder;m.needsUpdate=true}if(entry.texture&&!entry.shared)entry.texture.dispose();textures.delete(key)}
    }

    // ---------- turning ----------
    function turnTo(n,instant=false){
      n=Math.max(0,Math.min(TURNING,n));if(n===turned&&!anim)return;
      if(anim)finishAnim();
      const dir=n>turned?1:-1,index=dir>0?turned:turned-1;if(index<0||index>=TURNING)return;
      const leaf=leaves[index],from=leaf.pos,to=dir>0?1:0;
      anim={leaf,from,to:dir>0?turned+1:turned-1,start:last,dur:instant?0:.95*Math.abs(to-from)+.05,end:to,landed:false};
      if(!instant){playSample?.('pageTurn',.32,.62);sound?.(120,.35,'triangle',.025)}
      turned=anim.to;refreshPages();updateCaption();setView();
    }
    function finishAnim(){if(!anim)return;anim.leaf.pos=anim.end;place(anim.leaf,anim.end);anim=null}
    // On a narrow screen one page is shown at a time: forward looks across to the right-hand page before turning the
    // leaf, and back looks across to the left-hand page before turning it back.
    function next(){if(portrait()&&turned>0&&focus===0){focus=1}else if(turned<TURNING){focus=portrait()?0:1;turnTo(turned+1)}else return;setView();updateCaption()}
    function prev(){if(portrait()&&turned>0&&focus===1){focus=0}else if(turned>0){focus=1;turnTo(turned-1)}else return;setView();updateCaption()}

    // ---------- the camera ----------
    const portrait=()=>innerWidth/innerHeight<.9;
    function captionHeight(){return caption?caption.getBoundingClientRect().height+16:0}
    // The book is framed in the band between the title and close button above and the caption below: the camera
    // draws a taller frame (full) and shows the part of it (offset) that puts the book's middle in that band.
    function topHeight(){if(!dom)return 0;const b=Math.max(dom.querySelector('header').getBoundingClientRect().bottom,dom.querySelector('.kv-close').getBoundingClientRect().bottom);return Math.min(innerHeight*.2,b+6)}
    function setView(){
      const w=innerWidth,h=innerHeight,top=topHeight(),cap=Math.min(h*.6-top,captionHeight()),vh=h+cap-top,tan=Math.tan(FOV*Math.PI/360);
      let cx,wide;
      if(turned===0){cx=CW/2;wide=CW}else if(portrait()){cx=focus===0?-CW/2:CW/2;wide=CW}else{cx=0;wide=CW*2}
      const needW=wide*1.1+.08,needH=CH*1.1+.06,fracH=(h-cap-top)/vh;
      const d=Math.max(needH/(2*tan*fracH),needW/(2*tan*w/vh))+.1;
      view={x:cx,z:0,d,full:vh,offset:cap-top};
    }
    function updateCamera(dt){
      const k=1-Math.exp(-dt*7);zoom+=(zoomTarget-zoom)*k;pan.x+=(panTarget.x-pan.x)*k;pan.z+=(panTarget.z-pan.z)*k;
      if(camera.userData.x===undefined){camera.userData.x=view.x;camera.userData.d=view.d}
      camera.userData.x+=(view.x-camera.userData.x)*k;camera.userData.d+=(view.d-camera.userData.d)*k;
      const d=camera.userData.d/zoom,tx=camera.userData.x+pan.x,tz=pan.z;
      camera.position.set(tx,.05+Math.cos(LOOK)*d,tz+Math.sin(LOOK)*d);camera.lookAt(tx,.05,tz);
      const w=innerWidth,h=innerHeight,full=view.full||h;camera.aspect=w/full;camera.setViewOffset(w,full,0,view.offset||0,w,h);camera.updateProjectionMatrix();
      lamp.target.position.set(camera.userData.x*.6,0,0);
    }
    function clampPan(){const lim=zoomTarget<=1.02?0:1;const rx=(portrait()||turned===0?CW*.5:CW)*lim,rz=CH*.5*lim;panTarget.x=Math.max(-rx,Math.min(rx,panTarget.x));panTarget.z=Math.max(-rz,Math.min(rz,panTarget.z));if(zoomTarget<=1.02){panTarget.x=panTarget.z=0}}
    // Where on the open book (its top surface, near enough) a point of the screen falls.
    const ray=()=>new THREE.Raycaster();
    function pointOn(clientX,clientY){
      const r=dom.getBoundingClientRect(),ndc=new THREE.Vector2((clientX-r.left)/r.width*2-1,-((clientY-r.top)/r.height*2-1));
      const caster=ray();caster.setFromCamera(ndc,camera);const plane=new THREE.Plane(new THREE.Vector3(0,1,0),-.12),hit=new THREE.Vector3();return caster.ray.intersectPlane(plane,hit)?hit:null;
    }
    function zoomAt(factor,clientX,clientY){
      const old=zoomTarget;zoomTarget=Math.max(1,Math.min(5,zoomTarget*factor));if(zoomTarget===old)return;
      const p=clientX!=null?pointOn(clientX,clientY):null;
      if(p){const cx=camera.userData.x+panTarget.x,cz=panTarget.z,f=1-old/zoomTarget;panTarget.x+=(p.x-cx)*f;panTarget.z+=(p.z-cz)*f}
      clampPan();updateZoomButtons();
    }
    function resetZoom(){zoomTarget=1;panTarget.x=panTarget.z=0;updateZoomButtons()}
    function worldPerPixel(){return 2*Math.tan(FOV*Math.PI/360)*(camera.userData.d/zoom)/(view.full||innerHeight)}

    // ---------- the viewer ----------
    function style(){
      if(document.getElementById('fineBookStyle'))return;const s=document.createElement('style');s.id='fineBookStyle';
      s.textContent=`body.fine-book-open>:not(.fine-book):not(.whole-book):not(canvas){visibility:hidden!important}
.fine-book{position:fixed;inset:0;z-index:42;color:#eadcbc;font-family:Georgia,serif;pointer-events:none}
.fine-book.hidden{display:none}.fine-book .kv-stage{position:absolute;inset:0;pointer-events:auto;touch-action:none;cursor:grab}.fine-book .kv-stage.dragging{cursor:grabbing}
.fine-book header{position:absolute;top:14px;left:18px;right:180px;pointer-events:none;letter-spacing:.22em;font-size:12px;color:#c9a46b;text-shadow:0 1px 6px #000}
.fine-book .kv-close{position:absolute;top:10px;right:12px;pointer-events:auto}
.fine-book .kv-caption{position:absolute;left:0;right:0;bottom:0;padding:12px 18px calc(12px + env(safe-area-inset-bottom));background:linear-gradient(0deg,rgba(10,7,5,.96),rgba(10,7,5,.82));border-top:1px solid #5a4528;pointer-events:auto;display:grid;grid-template-columns:1fr auto 1fr;gap:18px;align-items:start}
.fine-book .kv-page small{color:#c9a46b;letter-spacing:.18em;font-size:11px;text-transform:uppercase}.fine-book .kv-page h2{font-weight:normal;font-size:19px;margin:3px 0 4px;color:#f3e3bf}
.fine-book .kv-page p{margin:0;font-size:14px;line-height:1.45;color:#dccdaa}.fine-book .kv-page .kv-credit{margin-top:5px;font-size:12px;color:#9d8e72}.fine-book .kv-page a{color:#d9b97a}
.fine-book .kv-tools{display:flex;gap:6px;align-self:center}.fine-book button{font:inherit;font-size:15px;color:#f0dfbd;background:#2c2014;border:1px solid #9a7a48;border-radius:3px;padding:7px 12px;cursor:pointer}
.fine-book button:hover,.fine-book button:focus-visible{background:#4a3520;outline:none}.fine-book button:disabled{opacity:.4;cursor:default}
.fine-book .kv-hint{position:absolute;top:34px;left:18px;font-size:13px;font-style:italic;color:#9d8e72;pointer-events:none;text-shadow:0 1px 6px #000;max-width:60vw}
.fine-book .kv-notes{display:none}
@media (max-aspect-ratio:9/10){.fine-book .kv-caption{grid-template-columns:1fr;gap:8px}.fine-book .kv-tools{order:2;justify-content:center}.fine-book .kv-page.kv-hidden{display:none}.fine-book .kv-page p{font-size:13px}}
@media (max-aspect-ratio:9/10),(max-height:520px){.fine-book header{right:150px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:11px;letter-spacing:.16em;top:19px}.fine-book .kv-close{font-size:14px;padding:6px 10px}
.fine-book .kv-hint{display:none}.fine-book .kv-notes{display:inline-block}.fine-book .kv-caption{padding-top:9px;gap:6px 14px}.fine-book .kv-page h2{font-size:17px;margin:2px 0 3px}
.fine-book.kv-brief .kv-page p{display:none}.fine-book.kv-brief .kv-page h2{margin-bottom:0}}`;
      document.head.appendChild(s);
    }
    function buildDom(){
      style();dom=document.createElement('div');dom.id=`${id}Viewer`;dom.className='fine-book hidden';dom.setAttribute('role','dialog');dom.setAttribute('aria-modal','true');dom.setAttribute('aria-label',spec.label);
      dom.innerHTML=`<div class="kv-stage" aria-label="The open book. Drag a page to turn it; scroll or pinch to look closer."></div>
        <header></header><p class="kv-hint">Drag a page to turn it, or use the arrows. Scroll, pinch or double-click to look closer. Escape closes the book.</p>
        <button type="button" class="kv-close" data-act="close">Close the book</button>
        <div class="kv-caption"><div class="kv-page kv-left"></div><div class="kv-tools"><button type="button" data-act="prev" aria-label="Turn back">←</button><button type="button" data-act="out" aria-label="Look less closely">−</button><button type="button" data-act="in" aria-label="Look closer">+</button><button type="button" data-act="next" aria-label="Turn the page">→</button><button type="button" class="kv-notes" data-act="notes" aria-pressed="false">Notes</button>${spec.whole&&window.createWholeBook?'<button type="button" class="kv-whole" data-act="whole">The whole book</button>':''}</div><div class="kv-page kv-right"></div></div>`;
      dom.querySelector('header').textContent=spec.header;dom.classList.add('kv-brief');document.body.appendChild(dom);stage=dom.querySelector('.kv-stage');caption=dom.querySelector('.kv-caption');
      dom.addEventListener('click',e=>{const act=e.target.closest('[data-act]')?.dataset.act;if(!act)return;if(act==='close')close();else if(act==='next')next();else if(act==='prev')prev();else if(act==='notes')toggleNotes();else if(act==='whole')openWhole();else if(act==='in')zoomAt(1.6);else if(act==='out'){if(zoomTarget/1.6<=1.02)resetZoom();else zoomAt(1/1.6)}});
      stage.addEventListener('wheel',e=>{e.preventDefault();const f=Math.exp(-e.deltaY*.0015);if(zoomTarget*f<=1.01)resetZoom();else zoomAt(f,e.clientX,e.clientY)},{passive:false});
      stage.addEventListener('dblclick',e=>{if(zoomTarget>1.3)resetZoom();else zoomAt(2.6,e.clientX,e.clientY)});
      stage.addEventListener('pointerdown',down);stage.addEventListener('pointermove',move);stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);
      window.addEventListener('resize',()=>{if(open){setView();clampPan()}});
      // While the book is open, keys belong to it: nothing walks, and Escape closes it.
      window.addEventListener('keydown',e=>{if(!open)return;e.stopImmediatePropagation();const k=e.key;
        if(k==='Escape'){e.preventDefault();close()}else if(k==='ArrowRight'||k===' '||k==='PageDown'){e.preventDefault();next()}else if(k==='ArrowLeft'||k==='PageUp'){e.preventDefault();prev()}
        else if(k==='+'||k==='='){zoomAt(1.4)}else if(k==='-'||k==='_'){if(zoomTarget/1.4<=1.02)resetZoom();else zoomAt(1/1.4)}else if(k==='0')resetZoom()},true);
      window.addEventListener('keyup',e=>{if(open)e.stopImmediatePropagation()},true);
    }
    function pageCard(el,key,hidden){
      el.classList.toggle('kv-hidden',!!hidden);el.replaceChildren();if(!key||key==='cover'){if(key==='cover'){const h=document.createElement('h2');h.textContent=spec.coverCard[0];const p=document.createElement('p');p.textContent=spec.coverCard[1];el.append(h,p)}return}
      const [label,title,note]=FOLIOS[key]||DRAWN[key]||['','',''],small=document.createElement('small'),h=document.createElement('h2'),p=document.createElement('p');small.textContent=label;h.textContent=title;p.textContent=note;el.append(small,h,p);
      const info=manifest?.[key];if(FOLIOS[key]){const credit=document.createElement('p');credit.className='kv-credit';if(info){credit.append(`${spec.source} Image: `);const a=document.createElement('a');a.href=info.page;a.target='_blank';a.rel='noopener';a.textContent='Wikimedia Commons';credit.append(a,`, ${/public domain|^pd/i.test(info.licence)?'in the public domain':info.licence}.`)}else credit.textContent=`${spec.source} This page’s photograph has not arrived yet.`;el.append(credit)}
    }
    function updateCaption(){
      if(!dom)return;const [left,right]=spread(turned),port=portrait();
      pageCard(dom.querySelector('.kv-left'),left,port&&(turned===0||focus===1));pageCard(dom.querySelector('.kv-right'),right,port&&turned>0&&focus===0);
      dom.querySelector('[data-act="prev"]').disabled=turned===0&&!(port&&focus===1&&turned>0);dom.querySelector('[data-act="next"]').disabled=turned===TURNING&&(!port||focus===1);
      requestAnimationFrame(()=>{if(open)setView()});
    }
    // On a small screen the pages' notes are folded away, leaving each page's name, so the book is not covered.
    // The whole book (whole-book.js): every page of the original, from a complete scan on Wikimedia Commons, opened at
    // the page the facsimile lies open at when the book knows where that is.
    let whole=null;
    function openWhole(){
      if(!spec.whole||!window.createWholeBook)return;whole=whole||window.createWholeBook(spec.whole,{onOpen,onClose,analytics:window.libraryAnalytics});
      const [left,right]=spread(turned),at=[focus===0?left:right,right,left].map(k=>k&&spec.whole.pageFor?.(k)).find(Boolean);close();whole.open(at||undefined);
    }
    function toggleNotes(){const brief=dom.classList.toggle('kv-brief');dom.querySelector('[data-act="notes"]').setAttribute('aria-pressed',String(!brief));setView()}
    function updateZoomButtons(){if(!dom)return;dom.querySelector('[data-act="out"]').disabled=zoomTarget<=1.02;dom.querySelector('[data-act="in"]').disabled=zoomTarget>=4.98}

    // A page is turned by taking hold of it and drawing it over; let go past a third of the way and it falls the rest.
    function down(e){
      stage.setPointerCapture?.(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});stage.classList.add('dragging');
      if(pointers.size===2){const [a,b]=[...pointers.values()];drag={pinch:Math.hypot(a.x-b.x,a.y-b.y),zoom:zoomTarget};return}
      if(zoomTarget>1.02){drag={pan:true,x:e.clientX,y:e.clientY};return}
      drag={x:e.clientX,y:e.clientY,moved:false,leaf:null,t:performance.now()};
    }
    function move(e){
      if(!pointers.has(e.pointerId)||!drag)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(drag.pinch&&pointers.size===2){const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y),target=drag.zoom*d/drag.pinch;if(target<=1.01)resetZoom();else zoomAt(target/zoomTarget,(a.x+b.x)/2,(a.y+b.y)/2);return}
      if(drag.pan){const k=worldPerPixel();panTarget.x-=(e.clientX-drag.x)*k;panTarget.z-=(e.clientY-drag.y)*k/Math.cos(LOOK);drag.x=e.clientX;drag.y=e.clientY;clampPan();return}
      const dx=e.clientX-drag.x;if(!drag.moved&&Math.abs(dx)<8)return;drag.moved=true;
      if(portrait()||anim)return;// on a narrow screen a swipe turns on release
      if(!drag.leaf){const forward=dx<0;if(forward&&turned<TURNING)drag.leaf={leaf:leaves[turned],forward:true};else if(!forward&&turned>0)drag.leaf={leaf:leaves[turned-1],forward:false};else return;
        drag.to=forward?turned+1:turned-1;refreshPages();playSample?.('pageTurn',.22,.6)}
      const span=Math.max(120,innerWidth*.42),p=Math.max(0,Math.min(1,Math.abs(dx)/span));drag.leaf.p=p;place(drag.leaf.leaf,drag.leaf.forward?p:1-p);
    }
    function up(e){
      pointers.delete(e.pointerId);if(!pointers.size)stage.classList.remove('dragging');const d=drag;if(pointers.size)return;drag=null;if(!d||d.pinch||d.pan)return;
      const dx=e.clientX-d.x,fast=Math.abs(dx)/Math.max(1,performance.now()-d.t)>.6;
      if(d.leaf){const p=d.leaf.p||0,leaf=d.leaf.leaf;const go=p>.33||(fast&&p>.08);
        if(go){turned=d.to;focus=1;anim={leaf,from:d.leaf.forward?p:1-p,end:d.leaf.forward?1:0,start:last,dur:.6*(1-p)+.08,to:turned,landed:false};leaf.pos=anim.from;updateCaption();setView()}
        else{anim={leaf,from:d.leaf.forward?p:1-p,end:d.leaf.forward?0:1,start:last,dur:.35*p+.08,to:turned,landed:true};leaf.pos=anim.from}
        refreshPages();return}
      if(d.moved&&Math.abs(dx)>40){if(dx<0)next();else prev()}
    }

    // ---------- the loop ----------
    function frame(now){
      if(!open)return;requestAnimationFrame(frame);
      const t=now/1000,dt=Math.min(.05,last?t-last:0);last=t;
      if(anim){const a=anim,k=a.dur?Math.min(1,(t-a.start)/a.dur):1;a.leaf.pos=a.from+(a.end-a.from)*k;
        // The board comes down with a soft knock and settles.
        if(k>=1){if(!a.landed){a.landed=true;a.settle=t;sound?.(70,.22,'sine',.12);playSample?.('pageTurn',.12,.45)}place(a.leaf,a.end);anim=null;refreshPages()}else place(a.leaf,a.leaf.pos)}
      if(wedges[0])wedges[0].visible=turned>0||!!anim||!!drag?.leaf;
      updateCamera(dt);
      savedExposure=renderer.toneMappingExposure;renderer.toneMappingExposure=EXPOSURE;renderer.setRenderTarget(null);renderer.render(scene,camera);renderer.toneMappingExposure=savedExposure;
    }

    // ---------- opening and closing ----------
    async function openBook(){
      if(open)return;open=true;if(!dom)buildDom();dom.classList.remove('hidden');onOpen?.();
      savedShadow=[renderer.shadowMap.enabled,renderer.shadowMap.type];renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      if(manifest===null)manifest=await fetchJson(`${base}${manifestFile}`).catch(()=>({}))||{};
      await loadFont();if(!open)return;
      if(!scene)build();
      turned=0;focus=1;resetZoom();pan={x:0,z:0};layout();camera.userData={};setView();refreshPages();updateCaption();
      last=0;requestAnimationFrame(frame);setTimeout(()=>dom.querySelector('.kv-close')?.focus(),30);
    }
    function close(){
      if(!open)return;open=false;anim=null;drag=null;pointers.clear();dom.classList.add('hidden');[renderer.shadowMap.enabled,renderer.shadowMap.type]=savedShadow;
      // Everything is let go: the book is built again, quickly, the next time it is opened.
      for(const entry of textures.values())if(entry.texture&&!entry.shared)entry.texture.dispose();textures.clear();
      for(const t of drawn.values())t.dispose();drawn.clear();
      for(const thing of owned.splice(0))thing.dispose?.();
      if(lamp?.shadow?.map)lamp.shadow.map.dispose();
      scene=null;camera=null;book=null;leaves=[];backCover=null;lamp=null;placeholder=null;planeGeometry=null;
      onClose?.();
    }
    // The closed book as it lies in the world: a block of board leaves in its binding.
    function closedBook(width=.7){
      const s=width/CW,g=new THREE.Group(),parts=[];
      const leather=new THREE.MeshStandardMaterial({color:leatherColour,roughness:.7}),top=new THREE.MeshStandardMaterial({map:getCoverTexture(),roughness:.62}),gilt=new THREE.MeshStandardMaterial({color:edgeColour,metalness:binding.gilt===false?0:.7,roughness:binding.gilt===false?.9:.4});
      const block=T*(TURNING-1)*s,cover=CT*s;
      const b=new THREE.Mesh(new THREE.BoxGeometry(CW*s,cover,CH*s),leather);b.position.y=cover/2;
      const leavesBlock=new THREE.Mesh(new THREE.BoxGeometry(W*s,block,H*s),gilt);leavesBlock.position.set(-.004,cover+block/2,0);
      const f=new THREE.Mesh(new THREE.BoxGeometry(CW*s,cover,CH*s),[leather,leather,top,leather,leather,leather]);f.position.y=cover*1.5+block;
      g.add(b,leavesBlock,f);parts.push(b,leavesBlock,f);
      return {group:g,parts,height:cover*2+block,dispose(){for(const p of parts){p.geometry.dispose()}leather.dispose();top.dispose();gilt.dispose()}};
    }
    return {open:openBook,close,next,prev,turnTo,closedBook,get isOpen(){return open||!!whole?.isOpen},openWhole,get whole(){return whole},get turned(){return turned},get spread(){return spread(turned)},folios:FOLIOS,faces:FACES,spreadAt:spread,pages:TURNING,id};
  };
})();
