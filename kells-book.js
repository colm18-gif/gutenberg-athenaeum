// The Book of Kells, a facsimile: the Irish Room's secret book (irish-room.js keeps it under a sod of turf by the hearth,
// as the great Gospel of Colum Cille was found under a sod in 1007). Twelve of its pages, photographs in the public
// domain from Wikimedia Commons (scripts/fetch-book-pages.mjs, assets/kells), bound with a title page and a colophon on
// thick board leaves that stay stiff as they turn: each leaf is a solid slab swinging on its hinge at the spine.
//
// Opening it lays the book on a museum cradle under a lamp. While it is open the library stops drawing the world and
// the book draws its own small scene with the same renderer, so there is no second WebGL context. Drag a page to turn
// it (or swipe, or the arrows); scroll, pinch or double-click to look closer; Escape closes it. Only the pages either
// side of the open spread are loaded, and everything is freed when the book is closed.
(function(){
  'use strict';

  // The twelve pages, in the order they come in the manuscript (Trinity College Dublin, MS 58), each with its card.
  const FOLIOS={
    '007v':['Folio 7v','The Virgin and Child','The oldest surviving picture of the Virgin Mary in a Western manuscript. She sits on a throne with the Child on her knee, and four angels round them.'],
    '027v':['Folio 27v','The four symbols','A man for Matthew, a lion for Mark, a calf for Luke and an eagle for John, each in a quarter of a cross-shaped frame. They stand before the Gospel of Matthew.'],
    '028v':['Folio 28v','Saint Matthew','The evangelist enthroned under a round arch, holding his book. He faces the first words of his Gospel.'],
    '029r':['Folio 29r','Liber generationis','The opening of Matthew, “The book of the generation of Jesus Christ”, its first letters made into one great ornament.'],
    '032v':['Folio 32v','Christ enthroned','Christ holds a book, with a peacock either side of his head. Peacocks were thought not to decay, and stood for the Resurrection.'],
    '033r':['Folio 33r','The carpet page','The only carpet page in the book: a cross of eight circles, every space filled with interlace. It comes just before the Chi Rho.'],
    '034r':['Folio 34r','The Chi Rho','XPI, the first letters of Christ’s name in Greek, beginning Matthew’s account of the Nativity. Look closely for the cats and mice, and an otter with a fish.'],
    '114r':['Folio 114r','The arrest of Christ','Christ held by two men, under the words that close the Last Supper: “And when they had sung a hymn, they went out to the Mount of Olives.”'],
    '130r':['Folio 130r','Initium evangelii','The opening of the Gospel of Mark, “The beginning of the gospel of Jesus Christ”, its first letters filling most of the page.'],
    '188r':['Folio 188r','Quoniam quidem','The opening of the Gospel of Luke, “Forasmuch as many have taken in hand”, set out in great decorated letters.'],
    '202v':['Folio 202v','The temptation of Christ','From Luke: Christ on the pinnacle of the Temple, tempted by a small black devil, with a crowd of figures below.'],
    '292r':['Folio 292r','In principio erat verbum','“In the beginning was the Word”: the opening of the Gospel of John.']
  };
  const DRAWN={
    'paste-front':['The front pastedown','Ex libris','The library’s bookplate.'],
    title:['The title page','Leabhar Cheanannais','The Book of Kells: twelve of its pages, in facsimile.'],
    colophon:['The colophon','The Book of Kells','How the book was made, lost and found.'],
    'paste-back':['The back pastedown','Críoch','The end.']
  };
  // The faces of the eight leaves that turn (the front cover and seven board leaves), front then back of each.
  // The back cover does not turn; its inside is the last page.
  const FACES=['cover','paste-front','title','007v','027v','028v','029r','032v','033r','034r','114r','130r','188r','202v','292r','colophon'];
  const TURNING=FACES.length/2,BACK_INSIDE='paste-back';
  // What lies open after n leaves have turned: [left, right] (the closed book shows only its cover).
  const spread=n=>n<=0?[null,'cover']:[FACES[2*n-1],n<TURNING?FACES[2*n]:BACK_INSIDE];

  window.createKellsBook=function(options){
    const {THREE,renderer,playSample,sound,analytics,base='assets/kells/',fetchJson=url=>fetch(url).then(r=>r.ok?r.json():{}),onOpen,onClose,
      fontUrl='assets/fonts/uncial-antiqua-latin-400-normal.woff2',loadTexture=null}=options;
    // In the book's own units: a leaf is 1 wide and as tall as a Kells leaf is in proportion (about 330 by 250 mm).
    const W=1,H=1700/1290,T=.026,CT=.055,CW=W+.04,CH=H+.06,TILT=.075,GAP=.008,EXPOSURE=1.15,FOV=30,LOOK=.36;
    const thick=i=>i===0?CT:T;
    let manifest=null,scene=null,camera=null,book=null,leaves=[],backCover=null,lamp=null,dom=null,stage=null,caption=null;
    let open=false,turned=0,anim=null,drag=null,zoom=1,pan={x:0,z:0},panTarget={x:0,z:0},zoomTarget=1,focus=1,last=0,fontReady=null;
    let view={x:W/2,z:0,d:4},savedExposure=1,savedShadow=[false,0];
    const owned=[],textures=new Map(),drawn=new Map(),pointers=new Map();
    let placeholder=null,coverTexture=null,anisotropy=1;const wedges=[];

    // ---------- drawing the pages that are not photographs ----------
    const INK='#2a1a10',RED='#b8442b',YELLOW='#d6a32e',GREEN='#3f7656',BLUE='#2e4478';
    const fontFamily=()=>fontReady===true?'"Uncial Antiqua", Georgia, serif':'Georgia, serif';
    function loadFont(){
      if(fontReady!==null)return Promise.resolve();
      if(typeof FontFace!=='function'||!document.fonts){fontReady=false;return Promise.resolve()}
      const face=new FontFace('Uncial Antiqua',`url(${fontUrl})`);
      return Promise.race([face.load().then(f=>{document.fonts.add(f);fontReady=true}),new Promise(r=>setTimeout(r,2500))]).catch(()=>{}).then(()=>{if(fontReady!==true)fontReady=false});
    }
    function canvas(w,h,paint){const c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=anisotropy;return t}
    // Calfskin: warm and uneven, darker towards the edges, with the faint speckle of the hair side.
    function vellum(c,w,h,seed=1){
      c.fillStyle='#e7d7b5';c.fillRect(0,0,w,h);
      let s=seed*9301+49297;const rnd=()=>(s=(s*9301+49297)%233280)/233280;
      for(let i=0;i<70;i++){const x=rnd()*w,y=rnd()*h,r=40+rnd()*160,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rnd()<.5?'150,118,70':'255,246,220'},${.05+rnd()*.06})`);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
      for(let i=0;i<w*h/900;i++){c.fillStyle=`rgba(110,80,40,${.05+rnd()*.12})`;c.fillRect(rnd()*w,rnd()*h,1+rnd()*1.6,1+rnd()*1.6)}
      const edge=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.35,w/2,h/2,Math.max(w,h)*.75);edge.addColorStop(0,'rgba(0,0,0,0)');edge.addColorStop(1,'rgba(92,60,24,.32)');c.fillStyle=edge;c.fillRect(0,0,w,h);
    }
    // A two-strand plait running from (x0,y0) to (x1,y1): drawn in short pieces, the strands taking turns to pass over.
    function plait(c,x0,y0,x1,y1,width,colours){
      const len=Math.hypot(x1-x0,y1-y0),ang=Math.atan2(y1-y0,x1-x0),period=width*1.6,steps=Math.max(2,Math.round(len/period))*2,a=width*.32;
      c.save();c.translate(x0,y0);c.rotate(ang);
      const strand=(k,from,to)=>{c.beginPath();for(let t=from;t<=to+1e-6;t+=(to-from)/10){const x=t*len,y=Math.sin(t*steps*Math.PI+k*Math.PI)*a;t===from?c.moveTo(x,y):c.lineTo(x,y)}};
      for(let i=0;i<steps;i++){const from=i/steps,to=(i+1)/steps,order=i%2?[0,1]:[1,0];
        for(const k of order){c.lineCap='round';strand(k,from,to);c.strokeStyle=INK;c.lineWidth=width*.36;c.stroke();strand(k,from,to);c.strokeStyle=colours[k];c.lineWidth=width*.2;c.stroke()}}
      c.restore();
    }
    function plaitFrame(c,x,y,w,h,width,colours){c.fillStyle=INK;for(const [a,b,cc,d] of [[x,y,x+w,y],[x,y+h,x+w,y+h],[x,y,x,y+h],[x+w,y,x+w,y+h]])plait(c,a,b,cc,d,width,colours);
      for(const [cx,cy] of [[x,y],[x+w,y],[x,y+h],[x+w,y+h]]){c.fillStyle=INK;c.beginPath();c.arc(cx,cy,width*.62,0,Math.PI*2);c.fill();c.fillStyle=colours[1];c.beginPath();c.arc(cx,cy,width*.44,0,Math.PI*2);c.fill();c.fillStyle=colours[0];c.beginPath();c.arc(cx,cy,width*.2,0,Math.PI*2);c.fill()}}
    // Letters outlined in red dots, as the Kells scribes outlined their initials.
    function dotted(c,text,x,y,size,fill){c.font=`${size}px ${fontFamily()}`;c.textAlign='center';c.textBaseline='alphabetic';c.save();c.setLineDash([0,size*.075]);c.lineCap='round';c.lineWidth=size*.05;c.strokeStyle=RED;c.lineJoin='round';
      c.strokeText(text,x,y);c.restore();c.fillStyle=fill;c.fillText(text,x,y)}
    function lines(c,text,x,y,maxWidth,lineHeight){const words=text.split(' ');let line='';for(const word of words){const next=line?line+' '+word:word;if(c.measureText(next).width>maxWidth&&line){c.fillText(line,x,y);y+=lineHeight;line=word}else line=next}if(line)c.fillText(line,x,y);return y+lineHeight}
    function triskele(c,x,y,r){c.save();c.translate(x,y);c.strokeStyle=INK;c.lineWidth=r*.09;c.lineCap='round';for(let k=0;k<3;k++){c.rotate(Math.PI*2/3);c.beginPath();for(let t=0;t<=1.0001;t+=.02){const a=t*Math.PI*2.4,rr=r*(1-t*.85);const px=Math.cos(a)*rr*.55+r*.42,py=Math.sin(a)*rr*.55;t?c.lineTo(px,py):c.moveTo(px,py)}c.stroke()}c.fillStyle=RED;c.beginPath();c.arc(0,0,r*.1,0,Math.PI*2);c.fill();c.restore()}
    const PW=1024,PH=Math.round(1024*H);
    const painters={
      'paste-front':(c,w,h)=>{vellum(c,w,h,3);const bw=w*.5,bh=h*.3,x=(w-bw)/2,y=h*.3;c.fillStyle='rgba(255,250,236,.55)';c.fillRect(x,y,bw,bh);plaitFrame(c,x,y,bw,bh,26,[GREEN,YELLOW]);
        c.fillStyle=INK;c.textAlign='center';c.font=`44px ${fontFamily()}`;c.fillText('ex libris',w/2,y+bh*.36);c.font=`34px ${fontFamily()}`;c.fillText('The Library',w/2,y+bh*.6);c.fillText('After Dark',w/2,y+bh*.6+42)},
      title:(c,w,h)=>{vellum(c,w,h,5);plaitFrame(c,60,60,w-120,h-120,40,[RED,YELLOW]);plaitFrame(c,96,96,w-192,h-192,22,[GREEN,BLUE]);
        dotted(c,'Leabhar',w/2,h*.3,124,INK);dotted(c,'Cheanannais',w/2,h*.3+140,112,INK);
        c.fillStyle=RED;c.font=`54px ${fontFamily()}`;c.textAlign='center';c.fillText('The Book of Kells',w/2,h*.52);
        triskele(c,w/2,h*.62,60);
        c.fillStyle=INK;c.font=`italic 34px Georgia, serif`;c.fillText('twelve of its pages, in facsimile',w/2,h*.74);
        c.font='28px Georgia, serif';c.fillText('Trinity College Dublin, MS 58',w/2,h*.79);c.fillStyle=GREEN;c.font=`30px ${fontFamily()}`;c.fillText('for the Library After Dark',w/2,h*.86)},
      colophon:(c,w,h)=>{vellum(c,w,h,7);plait(c,110,120,w-110,120,24,[RED,GREEN]);plait(c,110,h-120,w-110,h-120,24,[RED,GREEN]);
        const big=c=>{c.font=`92px ${fontFamily()}`;c.fillStyle=RED};big(c);c.textAlign='left';c.fillText('T',120,272);
        c.fillStyle=INK;c.font='31px Georgia, serif';let y=230;
        y=lines(c,'he Book of Kells is a book of the four Gospels in Latin, written and painted by the community of Colum Cille about the year 800, probably begun on Iona and finished at Kells, in Meath. It has been in Trinity College Dublin since the seventeenth century.',190,y,w-300,44);
        c.textAlign='left';y=lines(c,'In 1007 the annals record that the great Gospel of Colum Cille was stolen by night from the church at Kells, and found two months and twenty nights later, its gold taken from it and a sod over it. The book still has 340 of its leaves.',120,y+26,w-240,44);
        y=lines(c,'There is no gold on its pages: the yellow is orpiment.',120,y+26,w-240,44);
        c.font='italic 29px Georgia, serif';y=lines(c,'This facsimile, made for the library, holds twelve of its pages, from photographs in the public domain on Wikimedia Commons; each is credited beneath it. Its leaves are board, so that they stay stiff as they turn.',120,y+26,w-240,42);
        triskele(c,w/2,Math.min(h-210,y+70),44)},
      'paste-back':(c,w,h)=>{vellum(c,w,h,11);triskele(c,w/2,h*.46,70);c.fillStyle=INK;c.textAlign='center';c.font=`58px ${fontFamily()}`;c.fillText('Críoch',w/2,h*.62)},
      missing:(c,w,h)=>{vellum(c,w,h,13);c.fillStyle='rgba(42,26,16,.55)';c.textAlign='center';c.font='italic 34px Georgia, serif';c.fillText('This page has not arrived yet.',w/2,h/2)}
    };
    // Dark calf over boards, blind-tooled, with a gilt interlace cross and the title: the facsimile's own binding (the
    // manuscript's jewelled cover was the gold that was taken in 1007).
    function paintCover(c,w,h){
      c.fillStyle='#3a2216';c.fillRect(0,0,w,h);
      let s=7;const rnd=()=>(s=(s*9301+49297)%233280)/233280;
      for(let i=0;i<w*h/220;i++){c.fillStyle=`rgba(${rnd()<.5?'20,10,4':'120,80,50'},${.05+rnd()*.1})`;c.fillRect(rnd()*w,rnd()*h,1+rnd()*2.5,1+rnd()*2.5)}
      const tool=(x,y,ww,hh)=>{c.strokeStyle='rgba(12,6,2,.75)';c.lineWidth=5;c.strokeRect(x,y,ww,hh);c.strokeStyle='rgba(150,100,60,.35)';c.lineWidth=2;c.strokeRect(x+3,y+3,ww,hh)};
      tool(36,36,w-72,h-72);tool(64,64,w-128,h-128);
      const GOLD='#d2a64c',DARKGOLD='#7a5a22';const gx=w/2,gy=h*.55,arm=w*.3;
      c.save();c.globalAlpha=.95;for(const [x0,y0,x1,y1] of [[gx-arm,gy,gx+arm,gy],[gx,gy-arm*1.15,gx,gy+arm*1.15]]){const ang=Math.atan2(y1-y0,x1-x0),len=Math.hypot(x1-x0,y1-y0);c.save();c.translate(x0,y0);c.rotate(ang);
        for(let k=0;k<2;k++){c.beginPath();for(let t=0;t<=1;t+=.005){const x=t*len,y=Math.sin(t*20*Math.PI+k*Math.PI)*14;t?c.lineTo(x,y):c.moveTo(x,y)}c.strokeStyle=DARKGOLD;c.lineWidth=11;c.stroke();c.strokeStyle=GOLD;c.lineWidth=6;c.stroke()}c.restore()}
      c.beginPath();c.arc(gx,gy,arm*.42,0,Math.PI*2);c.strokeStyle=DARKGOLD;c.lineWidth=14;c.stroke();c.strokeStyle=GOLD;c.lineWidth=8;c.stroke();c.restore();
      c.fillStyle=GOLD;c.textAlign='center';c.font=`64px ${fontFamily()}`;c.fillText('Leabhar Cheanannais',w/2,h*.17);c.font='italic 30px Georgia, serif';c.fillText('The Book of Kells',w/2,h*.17+50);
    }
    // The cover is drawn once and kept (it is small); drawn before the uncial type has loaded, it is drawn again after.
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
      placeholder=canvas(256,Math.round(256*H),(c,w,h)=>vellum(c,w,h,17));owned.push(placeholder);
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
      const gilt=material({color:0xc39a52,metalness:.6,roughness:.55}),leather=material({color:0x3a2216,roughness:.7}),coverTop=material({map:getCoverTexture(),roughness:.62,metalness:.05});
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
    function setView(){
      const w=innerWidth,h=innerHeight,cap=Math.min(h*.45,captionHeight()),vh=h+cap,tan=Math.tan(FOV*Math.PI/360);
      let cx,wide;
      if(turned===0){cx=CW/2;wide=CW}else if(portrait()){cx=focus===0?-CW/2:CW/2;wide=CW}else{cx=0;wide=CW*2}
      const needW=wide*1.1+.08,needH=CH*1.1+.06,fracH=(h-cap)/vh;
      const d=Math.max(needH/(2*tan*fracH),needW/(2*tan*w/vh))+.1;
      view={x:cx,z:0,d,cap};
    }
    function updateCamera(dt){
      const k=1-Math.exp(-dt*7);zoom+=(zoomTarget-zoom)*k;pan.x+=(panTarget.x-pan.x)*k;pan.z+=(panTarget.z-pan.z)*k;
      if(camera.userData.x===undefined){camera.userData.x=view.x;camera.userData.d=view.d}
      camera.userData.x+=(view.x-camera.userData.x)*k;camera.userData.d+=(view.d-camera.userData.d)*k;
      const d=camera.userData.d/zoom,tx=camera.userData.x+pan.x,tz=pan.z;
      camera.position.set(tx,.05+Math.cos(LOOK)*d,tz+Math.sin(LOOK)*d);camera.lookAt(tx,.05,tz);
      const w=innerWidth,h=innerHeight,cap=view.cap||0;camera.aspect=w/(h+cap);camera.setViewOffset(w,h+cap,0,cap,w,h);camera.updateProjectionMatrix();
      lamp.target.position.set(camera.userData.x*.6,0,0);
    }
    function clampPan(){const lim=zoomTarget<=1.02?0:1;const rx=(portrait()||turned===0?CW*.5:CW)*lim,rz=CH*.5*lim;panTarget.x=Math.max(-rx,Math.min(rx,panTarget.x));panTarget.z=Math.max(-rz,Math.min(rz,panTarget.z));if(zoomTarget<=1.02){panTarget.x=panTarget.z=0}}
    // Where on the open book (its top surface, near enough) a point of the screen falls.
    const ray=()=>new THREE.Raycaster();
    function pointOn(clientX,clientY){
      const r=dom.getBoundingClientRect(),cap=view.cap||0,ndc=new THREE.Vector2((clientX-r.left)/r.width*2-1,-((clientY-r.top)/r.height*2-1));
      const caster=ray();caster.setFromCamera(ndc,camera);const plane=new THREE.Plane(new THREE.Vector3(0,1,0),-.12),hit=new THREE.Vector3();return caster.ray.intersectPlane(plane,hit)?hit:null;
    }
    function zoomAt(factor,clientX,clientY){
      const old=zoomTarget;zoomTarget=Math.max(1,Math.min(5,zoomTarget*factor));if(zoomTarget===old)return;
      const p=clientX!=null?pointOn(clientX,clientY):null;
      if(p){const cx=camera.userData.x+panTarget.x,cz=panTarget.z,f=1-old/zoomTarget;panTarget.x+=(p.x-cx)*f;panTarget.z+=(p.z-cz)*f}
      clampPan();updateZoomButtons();
    }
    function resetZoom(){zoomTarget=1;panTarget.x=panTarget.z=0;updateZoomButtons()}
    function worldPerPixel(){return 2*Math.tan(FOV*Math.PI/360)*(camera.userData.d/zoom)/(innerHeight+(view.cap||0))}

    // ---------- the viewer ----------
    function style(){
      if(document.getElementById('kellsStyle'))return;const s=document.createElement('style');s.id='kellsStyle';
      s.textContent=`body.kells-open>:not(#kellsViewer):not(canvas){visibility:hidden!important}
#kellsViewer{position:fixed;inset:0;z-index:42;color:#eadcbc;font-family:Georgia,serif;pointer-events:none}
#kellsViewer.hidden{display:none}#kellsViewer .kv-stage{position:absolute;inset:0;pointer-events:auto;touch-action:none;cursor:grab}#kellsViewer .kv-stage.dragging{cursor:grabbing}
#kellsViewer header{position:absolute;top:14px;left:18px;right:180px;pointer-events:none;letter-spacing:.22em;font-size:12px;color:#c9a46b;text-shadow:0 1px 6px #000}
#kellsViewer .kv-close{position:absolute;top:10px;right:12px;pointer-events:auto}
#kellsViewer .kv-caption{position:absolute;left:0;right:0;bottom:0;padding:12px 18px calc(12px + env(safe-area-inset-bottom));background:linear-gradient(0deg,rgba(10,7,5,.96),rgba(10,7,5,.82));border-top:1px solid #5a4528;pointer-events:auto;display:grid;grid-template-columns:1fr auto 1fr;gap:18px;align-items:start}
#kellsViewer .kv-page small{color:#c9a46b;letter-spacing:.18em;font-size:11px;text-transform:uppercase}#kellsViewer .kv-page h2{font-weight:normal;font-size:19px;margin:3px 0 4px;color:#f3e3bf}
#kellsViewer .kv-page p{margin:0;font-size:14px;line-height:1.45;color:#dccdaa}#kellsViewer .kv-page .kv-credit{margin-top:5px;font-size:12px;color:#9d8e72}#kellsViewer .kv-page a{color:#d9b97a}
#kellsViewer .kv-tools{display:flex;gap:6px;align-self:center}#kellsViewer button{font:inherit;font-size:15px;color:#f0dfbd;background:#2c2014;border:1px solid #9a7a48;border-radius:3px;padding:7px 12px;cursor:pointer}
#kellsViewer button:hover,#kellsViewer button:focus-visible{background:#4a3520;outline:none}#kellsViewer button:disabled{opacity:.4;cursor:default}
#kellsViewer .kv-hint{position:absolute;top:34px;left:18px;font-size:13px;font-style:italic;color:#9d8e72;pointer-events:none;text-shadow:0 1px 6px #000;max-width:60vw}
@media (max-aspect-ratio:9/10){#kellsViewer .kv-caption{grid-template-columns:1fr;gap:8px}#kellsViewer .kv-tools{order:2;justify-content:center}#kellsViewer .kv-page.kv-hidden{display:none}#kellsViewer .kv-page p{font-size:13px}#kellsViewer .kv-hint{display:none}}`;
      document.head.appendChild(s);
    }
    function buildDom(){
      style();dom=document.createElement('div');dom.id='kellsViewer';dom.className='hidden';dom.setAttribute('role','dialog');dom.setAttribute('aria-modal','true');dom.setAttribute('aria-label','The Book of Kells, a facsimile');
      dom.innerHTML=`<div class="kv-stage" aria-label="The open book. Drag a page to turn it; scroll or pinch to look closer."></div>
        <header>LEABHAR CHEANANNAIS · THE BOOK OF KELLS</header><p class="kv-hint">Drag a page to turn it, or use the arrows. Scroll, pinch or double-click to look closer. Escape closes the book.</p>
        <button type="button" class="kv-close" data-act="close">Close the book</button>
        <div class="kv-caption"><div class="kv-page kv-left"></div><div class="kv-tools"><button type="button" data-act="prev" aria-label="Turn back">←</button><button type="button" data-act="out" aria-label="Look less closely">−</button><button type="button" data-act="in" aria-label="Look closer">+</button><button type="button" data-act="next" aria-label="Turn the page">→</button></div><div class="kv-page kv-right"></div></div>`;
      document.body.appendChild(dom);stage=dom.querySelector('.kv-stage');caption=dom.querySelector('.kv-caption');
      dom.addEventListener('click',e=>{const act=e.target.closest('[data-act]')?.dataset.act;if(!act)return;if(act==='close')close();else if(act==='next')next();else if(act==='prev')prev();else if(act==='in')zoomAt(1.6);else if(act==='out'){if(zoomTarget/1.6<=1.02)resetZoom();else zoomAt(1/1.6)}});
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
      el.classList.toggle('kv-hidden',!!hidden);el.replaceChildren();if(!key||key==='cover'){if(key==='cover'){const h=document.createElement('h2');h.textContent='Leabhar Cheanannais';const p=document.createElement('p');p.textContent='A facsimile in a binding of dark calf. Turn the cover to open it.';el.append(h,p)}return}
      const [label,title,note]=FOLIOS[key]||DRAWN[key]||['','',''],small=document.createElement('small'),h=document.createElement('h2'),p=document.createElement('p');small.textContent=label;h.textContent=title;p.textContent=note;el.append(small,h,p);
      const info=manifest?.[key];if(FOLIOS[key]){const credit=document.createElement('p');credit.className='kv-credit';if(info){credit.append('Trinity College Dublin, MS 58. Image: ');const a=document.createElement('a');a.href=info.page;a.target='_blank';a.rel='noopener';a.textContent='Wikimedia Commons';credit.append(a,`, ${/public domain|^pd/i.test(info.licence)?'in the public domain':info.licence}.`)}else credit.textContent='Trinity College Dublin, MS 58. This page’s photograph has not arrived yet.';el.append(credit)}
    }
    function updateCaption(){
      if(!dom)return;const [left,right]=spread(turned),port=portrait();
      pageCard(dom.querySelector('.kv-left'),left,port&&(turned===0||focus===1));pageCard(dom.querySelector('.kv-right'),right,port&&turned>0&&focus===0);
      dom.querySelector('[data-act="prev"]').disabled=turned===0&&!(port&&focus===1&&turned>0);dom.querySelector('[data-act="next"]').disabled=turned===TURNING&&(!port||focus===1);
      requestAnimationFrame(()=>{if(open)setView()});
    }
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
      if(manifest===null)manifest=await fetchJson(`${base}kells.json`).catch(()=>({}))||{};
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
    // The closed book as it lies in the world (in the Irish Room): a block of board leaves in its binding.
    function closedBook(width=.7){
      const s=width/CW,g=new THREE.Group(),parts=[];
      const leather=new THREE.MeshStandardMaterial({color:0x3a2216,roughness:.7}),top=new THREE.MeshStandardMaterial({map:getCoverTexture(),roughness:.62}),gilt=new THREE.MeshStandardMaterial({color:0xc89c4c,metalness:.7,roughness:.4});
      const block=T*(TURNING-1)*s,cover=CT*s;
      const b=new THREE.Mesh(new THREE.BoxGeometry(CW*s,cover,CH*s),leather);b.position.y=cover/2;
      const leavesBlock=new THREE.Mesh(new THREE.BoxGeometry(W*s,block,H*s),gilt);leavesBlock.position.set(-.004,cover+block/2,0);
      const f=new THREE.Mesh(new THREE.BoxGeometry(CW*s,cover,CH*s),[leather,leather,top,leather,leather,leather]);f.position.y=cover*1.5+block;
      g.add(b,leavesBlock,f);parts.push(b,leavesBlock,f);
      return {group:g,parts,height:cover*2+block,dispose(){for(const p of parts){p.geometry.dispose()}leather.dispose();top.dispose();gilt.dispose()}};
    }
    return {open:openBook,close,next,prev,turnTo,closedBook,get isOpen(){return open},get turned(){return turned},get spread(){return spread(turned)},folios:FOLIOS,faces:FACES,spreadAt:spread,pages:TURNING};
  };
  window.KELLS_FOLIOS=Object.keys(FOLIOS);
})();
