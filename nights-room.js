// The Thousand and One Nights, reached by flying carpet. A carpet lies rolled and tied by the Grand Hall's fire; untie
// it and it unrolls, sit on it and it lifts, and carries the reader out over a desert at night (as Prince Husain's
// carpet from the market of Bisnagar carried whoever sat on it) and down into a courtyard with a fountain and orange
// trees. The room opens off the courtyard: a qa'a, the reception hall of an old house in Cairo or Damascus, with the
// Nights in English on the west wall, the poets of Persia and Arabia on the east, and the West's Nights on the north,
// over a divan. On the brass tray in the middle stands an old lamp: rubbed, it smokes, a voice asks "What is thy
// will?", and Aladdin is left beside it, with the story of the man from Aleppo who told it (found for good:
// athenaeum-nights-lamp; ?lamp shows it). The carpet in the courtyard flies the reader home to the fire. Nothing but
// the rolled carpet is built until the reader goes that way, and it is all freed a little while after they leave.
(function(){
  'use strict';

  // The shelves are the new arrivals for the rooms nights-* in data/new-books.js: books held nowhere else.
  const SHELVES=[
    {key:'tales',name:'THE NIGHTS',sub:'The Thousand and One Nights in English',max:8},
    {key:'poets',name:'PERSIA AND ARABIA',sub:'The poets and storytellers beside them',max:6},
    {key:'echoes',name:'THE NIGHTS IN THE WEST',sub:'What the West made of them',max:6},
    {key:'lamp',name:'THE LAMP',sub:'',max:1}
  ];
  // Words from Andrew Lang's Arabian Nights Entertainments (pg128, in the Room of Books Within Books): a test checks them.
  const LANG={
    rest:'“The rest is still more wonderful,” replied Scheherazade, “and you would say so, if the sultan would allow me to live another day, and would give me leave to tell it to you the next night.”',
    morning:'This happened every morning. The Sultana told a story, and the Sultan let her live to finish it.',
    will:'“What is thy will?”',
    lamps:'“New lamps for old!”'
  };
  const CARDS={
    carpet:['A rolled carpet','Rolled and tied with a cord by the fire, and far too fine to walk on. The Nights’ best-known flying carpet is in the tale of Prince Ahmed and the Fairy Peri-Banou, one of the stories Antoine Galland heard from Hanna Diyab: Prince Husain buys it in the market of Bisnagar, and it carries whoever sits on it wherever they wish to go.'],
    unrolled:['The carpet','Unrolled by the fire, its fringe stirring a little though there is no draught. Sit on it, and wish.'],
    home:['The carpet','The same carpet, waiting by the fountain. Sit on it and it will carry you home to the fire in the Grand Hall.'],
    courtyard:['A courtyard','In the old houses of Cairo, Damascus and Fez the rooms look inward, onto a courtyard cooled by a fountain and shaded by trees, and the street sees only a plain wall and a door. Bitter oranges were planted in courtyards like this one from Seville to Damascus.'],
    fountain:['The fountain','Water was the first luxury of a house like this, and the sound of it the second. In the Nights a garden is never complete without a fountain, and a palace seldom without several.'],
    mashrabiya:['A mashrabiya','A screen of turned wooden spindles set in a window. It lets the breeze in and keeps the sun out, and those inside can watch the street without being seen. Its name is often said to come from the jars of drinking water that were set in it to cool.'],
    qaa:['The qa’a','The qa’a was the great reception room of a house in Mamluk and Ottoman Cairo and Damascus: a high hall with a painted ceiling, where the host and his guests sat on cushions along the walls. The merchants and princesses of the Nights’ Cairo and Baghdad receive their visitors in rooms like this one.'],
    nights:['The Thousand and One Nights','No one wrote the Nights. Its frame came from Persia, where a lost book called Hazar Afsan, A Thousand Tales, was known by the tenth century, and storytellers in Baghdad and later Cairo filled it with their own tales over hundreds of years. The oldest piece of it is a ninth-century paper fragment now in Chicago; the oldest long manuscript, a Syrian copy of the fourteenth or fifteenth century, was Antoine Galland’s, and it breaks off in the middle of the 282nd night.'],
    scheherazade:['Scheherazade','King Shahriyar, betrayed by his wife, takes a new bride every night and has her put to death in the morning, until the vizier’s daughter Scheherazade marries him of her own will and begins a story she does not finish before day. In Andrew Lang’s version: '+LANG.rest+' '+LANG.morning],
    lamp:['An oil lamp','A small brass lamp on the tray, old and rather dirty. It looks as if it could do with a rub.'],
    diyab:['Hanna Diyab','Aladdin is in no manuscript of the Nights older than Galland’s book. In the spring of 1709, in Paris, a young Maronite from Aleppo named Hanna Diyab told Galland more than a dozen stories, Aladdin and Ali Baba among them, and Galland put them into his Nights. The Arabic texts of Aladdin found later are now thought to have been made after Galland’s French; Diyab’s own memoir of his travels lay unnoticed in the Vatican Library until the 1990s.'],
    spent:['The lamp','The lamp is warm to the touch, and whoever was in it has gone back into the story. Keep it safe: it was a man in the street crying '+LANG.lamps+' who got Aladdin’s away from his princess.'],
    sign:['The Thousand and One Nights','The Nights in English, the poets of Persia and Arabia, and what the West made of them. You came by carpet.']
  };
  const OUT=[[.02,'The carpet stiffens under you and lifts, and the Grand Hall’s lamps sink away like embers.'],
    [.1,'Up through the dark, and out under the stars.'],
    [.26,'Night over the desert. The dunes are silver under a thin moon, and the carpet’s fringe ripples in the wind.'],
    [.44,'In the Nights, Prince Husain bought a carpet like this one in the market of Bisnagar: whoever sat on it was carried wherever they wished to go.'],
    [.6,'Far off, the domes and minarets of a city, and here and there a lamp in a window.'],
    [.72,'Below, a courtyard, a fountain catching the moon, and orange trees. The carpet begins to sink.']];
  const BACK=[[.02,'Up out of the courtyard, over the fountain and the orange trees.'],
    [.3,'Back across the desert, under the same stars.'],
    [.72,'The lamps of the Grand Hall, and the fire. The carpet comes down by the hearth.']];
  const ORDINAL=['first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth','eleventh','twelfth'];

  window.createNightsRoom=function(options){
    const {THREE,scene,MAT,player,camera,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,sound,moveTo,
      analytics,isHolding=()=>false,isReducedMotion=()=>false,registerSeat=null,overlay=null,storage=window.localStorage}=options;
    // The carpet lies by the fire on the Grand Hall's west side, clear of Clio's corner and the north rug; the
    // courtyard and the room are far off to the east. Their sky is built for the flight, well away from both.
    const ROLL={x:-11.5,z:-14},YARD={cx:700,cz:-420,w:14,d:14,h:4.6},ROOM={cx:700,cz:-434,w:16,d:14,h:6.4};
    const PARK={x:YARD.cx,z:YARD.cz+4.4},SKY={x:900,y:300,z:600},DOOR={x:YARD.cx,w:2.2,h:3.2},KEEP=25,LIFT=1.6;
    const FOUND_KEY='athenaeum-nights-lamp',NIGHTS_KEY='athenaeum-nights-visits';
    const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=p=>p*p*(3-2*p);
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||/[?&]lamp\b/.test(location.search)}catch(e){return false}};
    let hall=null,root=null,sky=null,flight=null,time=0,lastNeeded=-1e9,lantern=null,farAway=null,lamp=null,nights=0;
    const owned=[],ours=[],books=[],blockers=[],textures={};
    const own=thing=>{owned.push(thing);return thing};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data,list=ours){object.userData=data;interactables.push(object);list.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'nights-card',key,title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    const seeded=seed=>()=>(seed=(seed*16807)%2147483647)/2147483647;

    // ---------- the carpet ----------
    // Madder red with an indigo field, a medallion, borders and a fringe. Its texture is made once and shared by both
    // carpets, so it is never freed. The flying one ripples: its plane has enough rows to bend.
    function carpetTexture(){return textures.carpet||(textures.carpet=canvasTexture((c,W,H)=>{
      c.fillStyle='#8a1e1a';c.fillRect(0,0,W,H);c.fillStyle='#1c2450';c.fillRect(26,26,W-52,H-52);
      c.strokeStyle='#d8b060';c.lineWidth=4;c.strokeRect(14,14,W-28,H-28);c.strokeRect(30,30,W-60,H-60);
      c.fillStyle='#d8b060';for(let y=40;y<H-40;y+=22){c.beginPath();c.arc(20,y,4,0,TAU);c.arc(W-20,y,4,0,TAU);c.fill()}
      const cx=W/2,cy=H/2;c.fillStyle='#8a1e1a';c.beginPath();for(let i=0;i<16;i++){const a=i/16*TAU,r=i%2?52:86;c.lineTo(cx+Math.sin(a)*r*.8,cy+Math.cos(a)*r)}c.closePath();c.fill();
      c.strokeStyle='#d8b060';c.lineWidth=3;c.stroke();c.fillStyle='#e8d6a8';c.beginPath();c.arc(cx,cy,16,0,TAU);c.fill();
      c.fillStyle='rgba(216,176,96,.55)';for(const [x,y] of [[60,60],[W-60,60],[60,H-60],[W-60,H-60]]){c.beginPath();c.moveTo(x,y-18);c.lineTo(x+12,y);c.lineTo(x,y+18);c.lineTo(x-12,y);c.fill()}
      const rand=seeded(5);for(let k=0;k<160;k++){c.fillStyle=`rgba(${rand()<.5?'232,214,168':'120,30,26'},.35)`;c.fillRect(40+rand()*(W-80),40+rand()*(H-80),3,3)}},256,384))}
    function makeCarpet(parent,keep,rolled){
      const g=new THREE.Group();parent.add(g);
      const geometry=keep(new THREE.PlaneGeometry(1.6,2.4,6,12)),flat=add(geometry,keep(new THREE.MeshStandardMaterial({map:carpetTexture(),roughness:1,side:THREE.DoubleSide})),0,.02,0,g);flat.rotation.x=-Math.PI/2;
      const pts=[];for(const z of [-1.2,1.2])for(let i=0;i<=16;i++){const x=-.78+i*.0975;pts.push(x,.02,z,x,.02,z+Math.sign(z)*.09)}
      const fringe=new THREE.BufferGeometry();fringe.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));const tassels=new THREE.LineSegments(keep(fringe),keep(new THREE.LineBasicMaterial({color:0xe8d6a8})));g.add(tassels);
      // The roll: the carpet's far end, wound up and tied, which shrinks to nothing as it unrolls.
      let roll=null;const ties=[];if(rolled){roll=add(keep(new THREE.CylinderGeometry(.17,.17,1.64,14)),keep(new THREE.MeshStandardMaterial({map:carpetTexture(),roughness:1})),0,.17,0,g);roll.rotation.z=Math.PI/2;
        const cord=keep(new THREE.MeshStandardMaterial({color:0xc8a050,roughness:.8}));for(const x of [-.45,.45]){const tie=add(keep(new THREE.TorusGeometry(.18,.018,6,16)),cord,x,.17,0,g);tie.rotation.y=Math.PI/2;ties.push(tie)}}
      return {group:g,flat,geometry,roll,ties,tassels,base:geometry.attributes?.position?.array?.slice?.()||null};
    }
    // Unrolled is 0 (a roll by the fire) to 1 (lying flat). The flat part grows from the far end as the roll moves.
    function setUnrolled(c,u){
      if(!c.roll)return;c.flat.scale.y=Math.max(.02,u);c.flat.position.z=-1.2+1.2*Math.max(.02,u);
      c.roll.position.z=-1.2+2.4*u;const r=Math.max(.03,1-u*.85);c.roll.scale.set(r,1,r);c.roll.position.y=.17*r;
      for(const tie of c.ties){tie.visible=u<.02;tie.position.z=c.roll.position.z}c.roll.visible=u<.999;c.tassels.visible=u>.98;
    }
    function ripple(c,amount){
      const pos=c.geometry.attributes?.position;if(!pos||!c.base)return;
      for(let i=0;i<pos.count;i++){const x=c.base[i*3],y=c.base[i*3+1];pos.array[i*3+2]=amount*(Math.sin(y*2.6-time*5.5)*.05+Math.sin(x*3+time*3.1)*.02)*(.4+Math.abs(y)/2)}
      pos.needsUpdate=true;
    }

    // ---------- the Grand Hall: the rolled carpet ----------
    function buildHall(){
      if(hall)return;const keep=thing=>thing;hall=makeCarpet(scene,keep,true);hall.group.name='nights-carpet';hall.group.position.set(ROLL.x,0,ROLL.z);
      hall.unrolled=0;hall.target=0;setUnrolled(hall,0);
      const data={type:'nights-carpet',title:CARDS.carpet[0],author:CARDS.carpet[1],action:'UNTIE THE CORD'};
      // Marked as the hall's, so it never goes with the room.
      for(const part of [hall.flat,hall.roll])mark(part,data,[]);hall.data=data;
    }
    function hallReady(){if(!hall)return;hall.data.title=hall.target?CARDS.unrolled[0]:CARDS.carpet[0];hall.data.author=hall.target?CARDS.unrolled[1]:CARDS.carpet[1];hall.data.action=hall.target?'SIT ON THE CARPET':'UNTIE THE CORD'}

    // ---------- the courtyard and the room ----------
    function plaster(c,W,H,base='#d9c6a2'){c.fillStyle=base;c.fillRect(0,0,W,H);const rand=seeded(9);for(let k=0;k<700;k++){c.fillStyle=`rgba(${rand()<.5?'90,60,30':'255,240,210'},.05)`;c.beginPath();c.ellipse(rand()*W,rand()*H,4+rand()*16,2+rand()*7,rand()*3,0,TAU);c.fill()}}
    // Eight-pointed stars in green, blue and white: the zellige of the floor and the dado.
    function zellige(c,W,H){
      c.fillStyle='#efe6d2';c.fillRect(0,0,W,H);const s=W/4;
      for(let i=0;i<4;i++)for(let j=0;j<4;j++){const x=i*s+s/2,y=j*s+s/2;c.fillStyle=(i+j)%2?'#1f6a5a':'#24508a';c.beginPath();for(let k=0;k<16;k++){const a=k/16*TAU,r=k%2?s*.24:s*.42;c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}c.closePath();c.fill();
        c.fillStyle='#e8c060';c.beginPath();c.arc(x,y,s*.08,0,TAU);c.fill();c.fillStyle='#6a2a20';c.save();c.translate(i*s,j*s);c.rotate(Math.PI/4);c.fillRect(-s*.07,-s*.07,s*.14,s*.14);c.restore()}
      c.strokeStyle='rgba(60,50,40,.35)';c.lineWidth=1;for(let k=0;k<=4;k++){c.beginPath();c.moveTo(k*s,0);c.lineTo(k*s,H);c.stroke();c.beginPath();c.moveTo(0,k*s);c.lineTo(W,k*s);c.stroke()}
    }
    // The inner walls of the courtyard: an arcade of pointed arches, deep in shadow, over a band of tiles.
    function arcade(c,W,H){
      plaster(c,W,H);const n=4,s=W/n;
      for(let i=0;i<n;i++){const x=i*s+s/2,top=H*.22,bottom=H*.86,w=s*.36;c.fillStyle='#2a1c14';c.beginPath();c.moveTo(x-w,bottom);c.lineTo(x-w,H*.42);c.quadraticCurveTo(x-w,top+H*.06,x,top);c.quadraticCurveTo(x+w,top+H*.06,x+w,H*.42);c.lineTo(x+w,bottom);c.fill();
        c.strokeStyle='#8a6a40';c.lineWidth=6;c.stroke();c.fillStyle='rgba(255,190,110,.18)';c.fillRect(x-w*.5,H*.6,w,bottom-H*.6)}
      c.fillStyle='#24508a';c.fillRect(0,H*.86,W,H*.14);c.fillStyle='#e8c060';for(let x=0;x<W;x+=16)c.fillRect(x+4,H*.9,8,8);
    }
    function lattice(c,W,H){
      c.clearRect(0,0,W,H);c.fillStyle='#4a2a16';c.fillRect(0,0,W,10);c.fillRect(0,H-10,W,10);c.fillRect(0,0,10,H);c.fillRect(W-10,0,10,H);
      for(let x=10;x<W-10;x+=16)c.fillRect(x,0,4,H);for(let y=10;y<H-10;y+=16)c.fillRect(0,y,W,4);
      for(let x=18;x<W-10;x+=16)for(let y=18;y<H-10;y+=16){c.beginPath();c.arc(x,y,4.2,0,TAU);c.fill()}
    }
    function nightSky(c,W,H,ground=true){
      const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#03030e');g.addColorStop(.4,'#0c1236');g.addColorStop(.5,'#2a2a48');g.addColorStop(.52,'#141228');g.addColorStop(1,'#060508');c.fillStyle=g;c.fillRect(0,0,W,H);
      const rand=seeded(33);for(let i=0;i<W*H/650;i++){const y=rand()*H*.49,s=rand()*rand()*.9+.25;c.fillStyle=`rgba(255,248,230,${.3+rand()*.6})`;c.beginPath();c.arc(rand()*W,y,s,0,TAU);c.fill()}
      // A thin crescent moon.
      c.fillStyle='rgba(255,240,205,.96)';c.beginPath();c.arc(W*.62,H*.2,13,0,TAU);c.fill();c.fillStyle='#070b24';c.beginPath();c.arc(W*.62+7,H*.2-3,12.5,0,TAU);c.fill();
      // A city on the horizon: domes and minarets, and a few lit windows.
      if(ground){c.fillStyle='#07060c';const base=H*.5;for(const [x,w,h,kind] of [[.12,30,22,'dome'],[.16,6,46,'min'],[.2,44,30,'dome'],[.25,7,58,'min'],[.31,26,18,'dome'],[.36,8,40,'min'],[.74,40,26,'dome'],[.79,6,50,'min'],[.84,22,16,'dome']]){
        const X=x*W;if(kind==='dome'){c.fillRect(X-w/2,base-h*.5,w,h*.5);c.beginPath();c.ellipse(X,base-h*.5,w/2,h*.55,0,Math.PI,0);c.fill();c.fillRect(X-1,base-h*1.12,2,8)}
        else{c.fillRect(X-w/2,base-h,w,h);c.beginPath();c.moveTo(X-w*.8,base-h);c.lineTo(X,base-h-12);c.lineTo(X+w*.8,base-h);c.fill()}}
        c.fillRect(0,base-6,W,8);c.fillStyle='rgba(255,190,100,.9)';for(const x of [.13,.2,.22,.31,.75,.83])c.fillRect(x*W,H*.5-4-rand()*8,2,2)}
    }
    function buildFar(){
      root=new THREE.Group();root.name='nights-room';const {cx,cz,w,d,h}=YARD;
      const wall=own(new THREE.MeshStandardMaterial({roughness:1,map:own(canvasTexture((c,W,H)=>plaster(c,W,H),256,256))}));
      const arches=own(canvasTexture(arcade,512,256)),archMat=own(new THREE.MeshStandardMaterial({roughness:1,map:arches}));
      const tile=own(canvasTexture(zellige,256,256));tile.wrapS=tile.wrapT=THREE.RepeatWrapping;tile.repeat?.set?.(5,5);
      const floor=own(new THREE.MeshStandardMaterial({map:tile,roughness:.55}));
      const wood=own(new THREE.MeshStandardMaterial({color:0x5a3620,roughness:.8})),brass=MAT.brass||own(new THREE.MeshStandardMaterial({color:0xb08a3a,metalness:.6,roughness:.4}));
      // The sky over the courtyard: stars, a crescent moon, and the city's domes beyond the walls.
      add(own(new THREE.SphereGeometry(90,24,12)),own(new THREE.MeshBasicMaterial({map:own(canvasTexture(nightSky,1024,512)),side:THREE.BackSide,fog:false})),cx,0,cz,root);
      box(w,.3,d,floor,cx,-.15,cz,root);
      // The courtyard's walls, the arcade on their inner faces.
      for(const s of [-1,1]){box(.6,h,d,wall,cx+s*w/2,h/2,cz,root);const face=add(own(new THREE.PlaneGeometry(d-.6,h)),archMat,cx+s*(w/2-.31),h/2,cz,root);face.rotation.y=-s*Math.PI/2}
      box(w,h,.6,wall,cx,h/2,cz+d/2,root);add(own(new THREE.PlaneGeometry(w-.6,h)),archMat,cx,h/2,cz+d/2-.31,root).rotation.y=Math.PI;
      // The façade of the room: taller, with a pointed arch over the door and two mashrabiya windows lit from within.
      const fz=cz-d/2,fh=ROOM.h+.6,side=(w-DOOR.w)/2;
      for(const s of [-1,1])box(side,fh,.6,wall,cx+s*(DOOR.w+side)/2,fh/2,fz,root);box(DOOR.w,fh-DOOR.h,.6,wall,cx,DOOR.h+(fh-DOOR.h)/2,fz,root);
      add(own(new THREE.PlaneGeometry(DOOR.w+.9,DOOR.h+1.2)),own(new THREE.MeshStandardMaterial({transparent:true,roughness:.9,map:own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);
        c.strokeStyle='#24508a';c.lineWidth=18;c.beginPath();c.moveTo(30,H);c.lineTo(30,H*.45);c.quadraticCurveTo(30,H*.12,W/2,10);c.quadraticCurveTo(W-30,H*.12,W-30,H*.45);c.lineTo(W-30,H);c.stroke();
        c.strokeStyle='#e8c060';c.lineWidth=4;c.stroke()},256,320))})),cx,(DOOR.h+1.2)/2,fz+.33,root);
      const latticeTex=own(canvasTexture(lattice,192,256)),screen=own(new THREE.MeshStandardMaterial({map:latticeTex,transparent:true,alphaTest:.5,roughness:.9,side:THREE.DoubleSide}));
      const glow=own(new THREE.MeshBasicMaterial({color:0xffb060}));
      for(const s of [-1,1]){const x=cx+s*4.2;add(own(new THREE.PlaneGeometry(1.5,2)),glow,x,4.3,fz+.32,root);const sc=add(own(new THREE.PlaneGeometry(1.7,2.2)),screen,x,4.3,fz+.42,root);mark(sc,card('mashrabiya'));box(1.9,.14,.3,wood,x,3.15,fz+.4,root);box(1.9,.14,.3,wood,x,5.45,fz+.4,root)}
      const facadeCard=add(own(new THREE.PlaneGeometry(3.5,3)),own(new THREE.MeshBasicMaterial({visible:false})),cx-4.4,1.6,fz+.4,root);mark(facadeCard,card('courtyard'));
      block(cx-(DOOR.w+side)/2,fz,side+.2,1.2);block(cx+(DOOR.w+side)/2,fz,side+.2,1.2);
      mark(sign(root,'THE THOUSAND AND ONE NIGHTS','Alf Layla wa-Layla · ألف ليلة وليلة',3.8,.66,cx,DOOR.h+1.65,fz+.33),card('nights'));
      fountain(cx,cz,brass);
      for(const [dx,dz] of [[-4,-4],[4,-4],[-4,4],[4,4]])orange(cx+dx,cz+dz,wood);
      lantern=new THREE.PointLight(0xffb468,5,18,1.7);lantern.position.set(cx+1.6,2.9,fz+1.2);root.add(lantern);
      hanging(root,[[cx+1.6,2.9,fz+1.2],[cx-1.6,2.9,fz+1.2]],.9);
      // The carpet that flies home, by the fountain.
      farAway=makeCarpet(root,own,false);farAway.group.position.set(PARK.x,0,PARK.z);farAway.group.rotation.y=Math.PI/2;
      const homeData={type:'nights-carpet-home',title:CARDS.home[0],author:CARDS.home[1],action:'SIT ON THE CARPET'};mark(farAway.flat,homeData);
      buildRoom(wall,floor,wood,brass);
      scene.add(root);
    }
    function fountain(x,z,brass){
      const stone=own(new THREE.MeshStandardMaterial({color:0xe6dcc8,roughness:.7})),water=own(new THREE.MeshStandardMaterial({color:0x2a5a7a,roughness:.1,metalness:.3,emissive:0x0a2030,emissiveIntensity:.6}));
      const basin=add(own(new THREE.CylinderGeometry(1.45,1.55,.5,8)),stone,x,.25,z,root);mark(basin,card('fountain'));
      add(own(new THREE.CylinderGeometry(1.3,1.3,.04,8)),water,x,.46,z,root);
      add(own(new THREE.CylinderGeometry(.14,.2,1,10)),stone,x,.8,z,root);const bowl=add(own(new THREE.CylinderGeometry(.5,.18,.22,10)),stone,x,1.36,z,root);mark(bowl,card('fountain'));
      add(own(new THREE.CylinderGeometry(.44,.44,.03,10)),water,x,1.47,z,root);
      const jetMat=own(new THREE.MeshBasicMaterial({color:0xcfe6ff,transparent:true,opacity:.55,depthWrite:false}));
      const jet=add(own(new THREE.CylinderGeometry(.015,.04,.7,6)),jetMat,x,1.82,z,root);root.userData.jet=jet;
      // The jet falls back into the bowl as a thin bell of water.
      const bell=add(own(new THREE.ConeGeometry(.42,.5,12,1,true)),own(new THREE.MeshBasicMaterial({color:0xcfe6ff,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide})),x,1.72,z,root);root.userData.bell=bell;
      block(x,z,3.2,3.2);
    }
    function orange(x,z,wood){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);
      const planter=own(new THREE.MeshStandardMaterial({color:0x24508a,roughness:.6}));box(1.1,.6,1.1,planter,0,.3,0,g);
      add(own(new THREE.CylinderGeometry(.07,.1,1.5,6)),wood,0,1.3,0,g);
      const leaves=own(new THREE.MeshStandardMaterial({roughness:1,map:own(canvasTexture((c,W,H)=>{c.fillStyle='#1c3a1c';c.fillRect(0,0,W,H);const rand=seeded(Math.round(x*7+z));for(let k=0;k<220;k++){c.fillStyle=`rgba(${40+rand()*40|0},${80+rand()*50|0},${40+rand()*20|0},.6)`;c.beginPath();c.ellipse(rand()*W,rand()*H,5,2.5,rand()*3,0,TAU);c.fill()}
        for(let k=0;k<26;k++){c.fillStyle='#e08a20';c.beginPath();c.arc(rand()*W,rand()*H,4,0,TAU);c.fill()}},128,128))}));
      const crown=add(own(new THREE.SphereGeometry(.95,12,9)),leaves,0,2.45,0,g);crown.scale.y=.85;mark(crown,card('courtyard'));
      block(x,z,1.3,1.3);
    }
    // Pierced brass lanterns on chains: one instanced mesh of glowing bodies and one set of lines, with no lights.
    function hanging(parent,spots,drop){
      const body=new THREE.InstancedMesh(own(new THREE.OctahedronGeometry(.22,0)),own(new THREE.MeshStandardMaterial({color:0xffd08a,emissive:0xffa040,emissiveIntensity:1.3,roughness:.6})),spots.length),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),s=new THREE.Vector3(1,1.5,1);
      const pts=[];spots.forEach(([x,y,z],i)=>{m4.compose(v.set(x,y,z),q,s);body.setMatrixAt(i,m4);pts.push(x,y+.33,z,x,y+.33+drop,z)});parent.add(body);
      const chains=new THREE.BufferGeometry();chains.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));parent.add(new THREE.LineSegments(own(chains),own(new THREE.LineBasicMaterial({color:0x6a5020}))));
    }
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#1a2a5a';c.fillRect(0,0,W,H);c.strokeStyle='#e8c060';c.lineWidth=5;c.strokeRect(6,6,W-12,H-12);
        c.fillStyle='#e8c060';for(let x=18;x<W-14;x+=20){c.beginPath();c.moveTo(x,13);c.lineTo(x+5,18);c.lineTo(x,23);c.lineTo(x-5,18);c.fill();c.beginPath();c.moveTo(x,H-13);c.lineTo(x+5,H-18);c.lineTo(x,H-23);c.lineTo(x-5,H-18);c.fill()}
        c.fillStyle='#f6e8c4';c.textAlign='center';let size=30;do{c.font=`bold ${size}px Georgia`;size-=2}while(c.measureText(text).width>W-50);c.fillText(text,W/2,sub?56:H/2+11);if(sub){c.font='italic 20px Georgia';c.fillText(sub,W/2,86)}},600,sub?112:72));
      return add(own(new THREE.PlaneGeometry(w,h)),own(new THREE.MeshStandardMaterial({map,emissive:0x1a2240,emissiveIntensity:.5,roughness:.8})),x,y,z,parent);
    }
    function buildRoom(wall,floor,wood,brass){
      const {cx,cz,w,d,h}=ROOM,north=cz-d/2,south=cz+d/2,west=cx-w/2,east=cx+w/2;
      const inner=own(new THREE.MeshStandardMaterial({roughness:1,map:own(canvasTexture((c,W,H)=>{plaster(c,W,H,'#e4d4b2');
        // A dado of tiles below and a painted frieze above.
        c.fillStyle='#24508a';c.fillRect(0,H*.78,W,H*.22);c.fillStyle='#e8c060';for(let x=0;x<W;x+=24){c.beginPath();c.moveTo(x+12,H*.8);c.lineTo(x+20,H*.88);c.lineTo(x+12,H*.96);c.lineTo(x+4,H*.88);c.fill()}
        c.fillStyle='#1f6a5a';c.fillRect(0,H*.05,W,H*.06);c.fillStyle='#8a1e1a';c.fillRect(0,H*.11,W,H*.015)},256,256))}));
      box(w,.3,d,floor,cx,-.15,cz,root);
      box(w,h,.4,inner,cx,h/2,north,root);box(.4,h,d,inner,west,h/2,cz,root);box(.4,h,d,inner,east,h/2,cz,root);
      // The ceiling: painted wooden panels of interlaced stars.
      const ceiling=own(new THREE.MeshStandardMaterial({roughness:.9,map:own(canvasTexture((c,W,H)=>{c.fillStyle='#3a2414';c.fillRect(0,0,W,H);const s=W/4;
        for(let i=0;i<4;i++)for(let j=0;j<4;j++){const x=i*s+s/2,y=j*s+s/2;c.strokeStyle='#c8a050';c.lineWidth=3;for(const r of [0,Math.PI/4]){c.save();c.translate(x,y);c.rotate(r);c.strokeRect(-s*.3,-s*.3,s*.6,s*.6);c.restore()}
          c.fillStyle=(i+j)%2?'#1a2a5a':'#7a1e1a';c.beginPath();c.arc(x,y,s*.14,0,TAU);c.fill()}},256,256))}));
      box(w,.2,d,ceiling,cx,h+.1,cz,root);
      mark(add(own(new THREE.PlaneGeometry(4,3)),own(new THREE.MeshBasicMaterial({visible:false})),cx+5.5,2,north+.25,root),card('qaa'));
      // A rug in the middle, a brass tray on a folding stand, cushions round it, and the lamp.
      const rug=add(own(new THREE.PlaneGeometry(5,7)),own(new THREE.MeshStandardMaterial({map:carpetTexture(),roughness:1})),cx,.012,cz+.5,root);rug.rotation.x=-Math.PI/2;
      const tz=cz+1;add(own(new THREE.CylinderGeometry(.62,.62,.04,24)),brass,cx,.46,tz,root);
      for(let k=0;k<4;k++){const leg=add(own(new THREE.CylinderGeometry(.025,.025,.62,5)),wood,cx+Math.cos(k*Math.PI/2+.78)*.28,.22,tz+Math.sin(k*Math.PI/2+.78)*.28,root);leg.rotation.set(Math.sin(k*Math.PI/2+.78)*.45,0,-Math.cos(k*Math.PI/2+.78)*.45)}
      const glass=own(new THREE.MeshStandardMaterial({color:0xc8e0d0,transparent:true,opacity:.55,roughness:.1}));for(const a of [1.9,2.5])add(own(new THREE.CylinderGeometry(.035,.028,.09,8)),glass,cx+Math.cos(a)*.38,.53,tz+Math.sin(a)*.38,root);
      const cushion=own(new THREE.MeshStandardMaterial({color:0x7a1e1a,roughness:1})),cushion2=own(new THREE.MeshStandardMaterial({color:0x1f6a5a,roughness:1}));
      for(const [a,m] of [[0,cushion],[Math.PI/2,cushion2],[Math.PI,cushion],[-Math.PI/2,cushion2]]){const c=box(.7,.18,.7,m,cx+Math.cos(a)*1.25,.09,tz+Math.sin(a)*1.25,root);c.rotation.y=a}
      block(cx,tz,1.4,1.4);
      buildLamp(cx+.12,.48,tz-.08,brass);
      // The divan along the north wall (one of the library's seats), with its bolsters, and a mashrabiya over it.
      const divan=new THREE.Group();divan.position.set(cx,0,north+.75);root.add(divan);
      const seat=box(5.2,.42,1,own(new THREE.MeshStandardMaterial({color:0x2a3a6a,roughness:1})),0,.21,0,divan);
      for(const x of [-1.8,-.6,.6,1.8])box(1.05,.5,.24,x%1.2?cushion2:cushion,x,.62,-.38,divan);block(cx,north+.75,5.4,1.2);
      if(registerSeat){const data=registerSeat([seat],divan,new THREE.Vector3(0,1.15,.15),0,{title:'A divan',author:'Sit and read one of the books of the Thousand and One Nights.'});
        Object.defineProperty(data,'bookIds',{get:()=>books.filter(b=>b.userData.shelf!=='lamp').map(b=>b.userData.book.id),configurable:true});ours.push(seat)}
      const latticeTex=own(canvasTexture(lattice,192,256)),screen=own(new THREE.MeshStandardMaterial({map:latticeTex,transparent:true,alphaTest:.5,roughness:.9,side:THREE.DoubleSide}));
      const outside=own(new THREE.MeshBasicMaterial({color:0x14204a}));
      for(const s of [-1,1]){const x=cx+s*4;add(own(new THREE.PlaneGeometry(1.4,2)),outside,x,2.4,south-.21,root).rotation.y=Math.PI;const sc=add(own(new THREE.PlaneGeometry(1.6,2.2)),screen,x,2.4,south-.3,root);sc.rotation.y=Math.PI;mark(sc,card('mashrabiya'))}
      // The door wall, seen from inside, with the sign over the door, and the brass plate counting the reader's nights.
      const sideW=(w-DOOR.w)/2;for(const s of [-1,1])box(sideW,h,.2,inner,cx+s*(DOOR.w+sideW)/2,h/2,south-.1,root);box(DOOR.w,h-DOOR.h,.2,inner,cx,DOOR.h+(h-DOOR.h)/2,south-.1,root);
      const inside=sign(root,'THE THOUSAND AND ONE NIGHTS','Scheherazade',3.6,.62,cx,DOOR.h+.75,south-.22);inside.rotation.y=Math.PI;mark(inside,card('scheherazade'));
      const plate=add(own(new THREE.PlaneGeometry(.5,.34)),brass,cx+DOOR.w/2+.6,1.5,south-.22,root);plate.rotation.y=Math.PI;mark(plate,{type:'nights-card',key:'night',title:'A brass plate',author:'',action:'READ'});
      // Two hanging lanterns and one lamp to light the room by.
      const light=new THREE.PointLight(0xffc27a,5.5,18,1.8);light.position.set(cx,h-1.6,cz);root.add(light);
      hanging(root,[[cx,h-1.6,cz],[cx-4.5,h-1.9,cz-2],[cx+4.5,h-1.9,cz-2],[cx-4.5,h-1.9,cz+3.5],[cx+4.5,h-1.9,cz+3.5]],1.2);
      // The shelves: the Nights on the west wall, Persia and Arabia on the east, the West's Nights over the divan.
      const step=1.75,rows=(n,i)=>{const top=Math.floor(n/2),lower=n-top,row=i<lower?0:1,inRow=row?top:lower,k=row?i-lower:i;return [(k-(inRow-1)/2)*step,row?2.95:1.65]};
      const wallBooks=(key,spot)=>{const list=shelfBooks(key);list.forEach((book,i)=>placeBook(book,spot(...rows(list.length,i)),key))};
      wallBooks('tales',(a,y)=>({x:west+.3,z:cz+a,y,yaw:Math.PI/2}));wallBooks('poets',(a,y)=>({x:east-.3,z:cz-a,y,yaw:-Math.PI/2}));
      wallBooks('echoes',(a,y)=>({x:cx+a,z:north+.3,y:y+.75,yaw:0}));
      for(const y of [1.65,2.95]){box(.34,.06,7.4,wood,west+.34,y-.5,cz,root);box(.34,.06,7.4,wood,east-.34,y-.5,cz,root);box(5.6,.06,.34,wood,cx,y+.25,north+.34,root)}
      block(west+.4,cz,.7,7.6);block(east-.4,cz,.7,7.6);
      for(const [shelf,x,z,yaw,y] of [['tales',west+.22,cz,Math.PI/2,4.15],['poets',east-.22,cz,-Math.PI/2,4.15],['echoes',cx,north+.22,0,4.95]]){
        const s=SHELVES.find(v=>v.key===shelf),label=sign(root,s.name,s.sub,3.2,.58,x,y,z);label.rotation.y=yaw;mark(label,{type:'nights-card',title:s.name,author:s.sub+'.',action:'READ'})}
    }

    // ---------- the lamp ----------
    function buildLamp(x,y,z,brass){
      const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=.5;root.add(g);
      const body=add(own(new THREE.SphereGeometry(.11,14,10)),brass,0,.07,0,g);body.scale.set(1.5,.6,1);
      const spout=add(own(new THREE.ConeGeometry(.035,.2,8)),brass,.2,.08,0,g);spout.rotation.z=-Math.PI/2.4;
      const handle=add(own(new THREE.TorusGeometry(.06,.012,6,14,Math.PI*1.3)),brass,-.17,.1,0,g);handle.rotation.z=Math.PI*.6;
      add(own(new THREE.CylinderGeometry(.05,.07,.04,12)),brass,0,.13,0,g);add(own(new THREE.SphereGeometry(.025,8,6)),brass,0,.16,0,g);
      // Its smoke: three soft puffs that rise, swell and thin out.
      const puff=own(canvasTexture((c,W,H)=>{const gr=c.createRadialGradient(W/2,H/2,0,W/2,H/2,W/2);gr.addColorStop(0,'rgba(200,190,255,.75)');gr.addColorStop(1,'rgba(200,190,255,0)');c.fillStyle=gr;c.fillRect(0,0,W,H)},64,64));
      const smoke=[0,1,2].map(i=>{const m=add(own(new THREE.PlaneGeometry(.5,.5)),own(new THREE.MeshBasicMaterial({map:puff,transparent:true,opacity:0,depthWrite:false,color:0xb8b0ff})),x+.2,y+.2,z,root);m.visible=false;m.userData.phase=i/3;return m});
      lamp={g,body,smoke,rubbed:-1,found:false,book:null};
      const data={type:'nights-lamp',title:CARDS.lamp[0],author:CARDS.lamp[1],action:'RUB THE LAMP'};for(const part of [body,spout,handle])mark(part,data);lamp.data=data;
      const aladdin=shelfBooks('lamp')[0];
      if(aladdin){lamp.book=placeBook(aladdin,{x:x-.32,y:y+.035,z:z+.2,yaw:.4,lean:Math.PI/2},'lamp',.5,false)}
      if(wasFound())reveal(true);
    }
    function rub(){
      if(lamp.found){showNotice(`${CARDS.spent[0]}: ${CARDS.spent[1]}`,8);return}
      if(lamp.rubbed>=0)return;lamp.rubbed=time;analytics?.track('Room Explored',{room:'nights-lamp'});
      playSample?.('secretDoor',.5,.6);sound?.(98,2.4,'sine',.05);sound?.(147,2,'triangle',.025);
      for(const m of lamp.smoke){m.visible=true;m.material.opacity=0}
      showNotice('You rub the lamp. It grows warm, and smoke curls out of its spout, more than so small a lamp could hold.',6);
    }
    function reveal(quiet){
      if(!lamp||lamp.found)return;lamp.found=true;try{storage?.setItem(FOUND_KEY,'1')}catch(e){}
      lamp.data.title=CARDS.spent[0];lamp.data.author=CARDS.spent[1];lamp.data.action='READ';
      if(lamp.book){lamp.book.visible=true;if(!interactables.includes(lamp.book))interactables.push(lamp.book);if(!books.includes(lamp.book))books.push(lamp.book);
        const note={type:'nights-card',key:'diyab',title:CARDS.diyab[0],author:CARDS.diyab[1],action:'READ'};lamp.diyab=mark(add(own(new THREE.PlaneGeometry(.3,.2)),own(new THREE.MeshBasicMaterial({color:0xefe2c0})),lamp.book.position.x+.05,.485,lamp.book.position.z-.3,root),note);lamp.diyab.rotation.x=-Math.PI/2}
      if(!quiet)showNotice(`From the smoke a voice: ${LANG.will} Then it thins, and is gone, and on the tray beside the lamp lies a book that was not there before: Aladdin, and the story of the man from Aleppo who told it.`,12);
    }
    function updateLamp(){
      if(!lamp||lamp.rubbed<0)return;const k=time-lamp.rubbed;
      lamp.smoke.forEach((m,i)=>{const p=clamp((k-i*.35)/3.6,0,1);m.position.y=.68+p*1.6;m.scale.setScalar(.5+p*2.6);m.material.opacity=Math.sin(p*Math.PI)*.75;m.rotation.z=p*1.5+i;m.lookAt?.(camera.position)});
      if(k>2.4&&!lamp.found)reveal(false);
      if(k>4.6){for(const m of lamp.smoke)m.visible=false;lamp.rubbed=-1}
    }

    // ---------- books ----------
    function shelfBooks(key){
      const shelf=SHELVES.find(s=>s.key===key);
      return [...new Set(arrivals[key]||[])].map(id=>findBook(id)).filter(Boolean).slice(0,shelf.max);
    }
    let bookGeometry=null;
    function placeBook(book,spot,shelf,scale=1,visible=true){
      bookGeometry=bookGeometry||own(new THREE.BoxGeometry(.72,.96,.13));
      const mesh=add(bookGeometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,root);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw;mesh.rotation.x=-(spot.lean??.08);if(scale!==1)mesh.scale.setScalar(scale);
      mesh.userData={type:'book',book,loaded:false,nights:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
      ours.push(mesh);if(visible){interactables.push(mesh);books.push(mesh)}else mesh.visible=false;return mesh;
    }

    // ---------- Scheherazade's nights: one for every night the reader has come here ----------
    function countNight(){
      let seen=[];try{seen=JSON.parse(storage?.getItem(NIGHTS_KEY)||'[]')}catch(e){}if(!Array.isArray(seen))seen=[];
      const d=new Date(),today=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;if(!seen.includes(today)){seen.push(today);seen=seen.slice(-1001);try{storage?.setItem(NIGHTS_KEY,JSON.stringify(seen))}catch(e){}}
      nights=seen.length;return nights;
    }
    const nightLine=n=>n<=1?'Tonight is your first night in this room. Scheherazade needed a thousand and one.':n>=1001?'This is your thousand and first night here. Scheherazade’s king had stopped counting by now.':`This is your ${ORDINAL[n-1]||n+'th'} night here. Scheherazade needed a thousand and one.`;

    // ---------- over the desert ----------
    // (The camera sees 130 m, so all of this is drawn within that.) A night sky that travels with the carpet and a
    // floor of moonlit dunes streaming past beneath it. Built for the flight and freed after it.
    function buildSky(){
      if(sky)return;const g=new THREE.Group();g.name='nights-sky';g.position.set(SKY.x,SKY.y,SKY.z);scene.add(g);const keep=own;
      add(keep(new THREE.SphereGeometry(120,24,12)),keep(new THREE.MeshBasicMaterial({map:keep(canvasTexture((c,W,H)=>nightSky(c,W,H,true),1024,512)),side:THREE.BackSide,fog:false})),0,0,0,g);
      const dunes=keep(canvasTexture((c,W,H)=>{c.fillStyle='#2a2438';c.fillRect(0,0,W,H);
        for(let y=0;y<H;y+=6){c.strokeStyle=`rgba(${150+(y%36)},${140+(y%30)},${170},.16)`;c.lineWidth=3;c.beginPath();for(let x=0;x<=W;x+=12)c.lineTo(x,y+Math.sin(x*.02+y*.05)*9+Math.sin(x*.007)*14);c.stroke()}
        for(let k=0;k<90;k++){c.fillStyle='rgba(10,8,18,.35)';c.beginPath();c.ellipse(Math.random()*W,Math.random()*H,40+Math.random()*80,10+Math.random()*20,.2,0,TAU);c.fill()}},1024,1024));
      dunes.wrapS=dunes.wrapT=THREE.RepeatWrapping;
      const ground=add(keep(new THREE.PlaneGeometry(260,260)),keep(new THREE.MeshBasicMaterial({fog:false,map:dunes})),0,-40,0,g);ground.rotation.x=-Math.PI/2;
      sky={group:g,ground};
    }
    function freeSky(){if(!sky)return;sky.group.removeFromParent();sky=null}

    // ---------- flying ----------
    // dir 1: from the fire to the courtyard; dir -1: home. The carpet that flies is the one that left: the one waiting
    // at the other end is hidden until it lands, so there is only ever one carpet in each place.
    function startFlight(dir){
      if(flight)return;activate();buildSky();buildHall();
      const reduced=isReducedMotion(),from=dir>0?{x:ROLL.x,y:0,z:ROLL.z}:{x:PARK.x,y:0,z:PARK.z},to=dir>0?{x:PARK.x,y:0,z:PARK.z}:{x:ROLL.x,y:0,z:ROLL.z};
      const carpet=dir>0?hall:farAway;if(dir>0){hall.unrolled=hall.target=1;setUnrolled(hall,1)}
      flight={dir,t:0,duration:reduced?12:(dir>0?32:20),from,to,carpet,said:0,lines:dir>0?OUT:BACK,stage:'rise',done:false,yaw:carpet.group.rotation.y};
      player.pitch=-.2;playSample?.('secretDoor',.4,.8);sound?.(220,1.4,'sine',.02);
      analytics?.track('Room Explored',{room:dir>0?'carpet-flight':'carpet-return'});
    }
    function updateFlight(dt,reduced){
      const f=flight;f.t+=dt;const p=clamp(f.t/f.duration,0,1),c=f.carpet;
      if(p<.18){const k=smooth(p/.18);c.group.position.set(f.from.x,k*LIFT,f.from.z)}
      else if(p<.8){if(f.stage==='rise'){f.stage='cruise';c.group.removeFromParent();scene.add(c.group)}c.group.position.set(SKY.x,SKY.y,SKY.z);if(sky)sky.ground.material.map.offset.y-=dt*(reduced?.012:.018)}
      else{const k=smooth((p-.8)/.2);
        if(f.stage==='cruise'){f.stage='sink';const arriving=f.dir>0?farAway:hall;arriving.group.visible=false;f.arriving=arriving;if(f.dir<0){c.group.rotation.y=0}else c.group.rotation.y=Math.PI/2}
        c.group.position.set(f.to.x,(1-k)*LIFT,f.to.z)}
      // Through the dark at either end of the crossing: a moment of night that hides the change of scene.
      overlay?.(Math.max(0,1-Math.abs(p-.18)/.05,1-Math.abs(p-.8)/.05));
      ripple(c,reduced?0:(f.stage==='cruise'?1:.35));
      const bob=reduced?0:Math.sin(f.t*.9)*.04,sway=reduced?0:Math.sin(f.t*.6)*.025;
      camera.position.set(c.group.position.x,c.group.position.y+1.05+bob,c.group.position.z);
      camera.rotation.set(player.pitch,player.yaw,sway,'YXZ');camera.updateMatrixWorld();
      if(f.stage==='cruise'){scene.background.setRGB(.02,.02,.07);scene.fog.color.copy(scene.background);scene.fog.density=.0015}
      while(f.said<f.lines.length&&p>=f.lines[f.said][0]){showNotice(f.lines[f.said][1],f.dir>0?7:6);f.said++}
      if(p>=1&&!f.done){f.done=true;land(f)}
    }
    function land(f){
      const c=f.carpet,arriving=f.arriving||(f.dir>0?farAway:hall);
      // The carpet that flew goes back to where it came from, out of sight, and the one waiting here appears.
      c.group.removeFromParent();(f.dir>0?scene:root||scene).add(c.group);ripple(c,0);
      if(f.dir>0){c.group.position.set(ROLL.x,0,ROLL.z);c.group.rotation.y=0}else{c.group.position.set(PARK.x,0,PARK.z);c.group.rotation.y=Math.PI/2}
      arriving.group.visible=true;c.group.visible=true;
      if(f.dir>0){moveTo(PARK.x+1.6,0,PARK.z+.4,0);const n=countNight();
        setTimeout(()=>showNotice(`The carpet settles in a courtyard under the stars, beside a fountain, and lamplight shows through the screens of the house. ${nightLine(n)}`,10),400)}
      else{hall.unrolled=hall.target=1;setUnrolled(hall,1);hallReady();moveTo(ROLL.x+1.5,0,ROLL.z,Math.PI/2);showNotice('The Grand Hall, and the fire. The carpet lies unrolled where you left it, its fringe still stirring.',7)}
      flight=null;freeSky();overlay?.(0);playSample?.('doorOpen',.35,.8);
    }
    // A link (/?room=nights) goes straight to the courtyard; the carpet is there for the way home.
    function enter(){activate();moveTo(PARK.x+1.6,0,PARK.z+.4,0);const n=countNight();showNotice(`A courtyard under the stars, a fountain and orange trees, and the doorway of the house of the Thousand and One Nights. The carpet will carry you home. ${nightLine(n)}`,9);analytics?.track('Room Explored',{room:'nights-room'})}

    // ---------- walking ----------
    function zoneAt(x,z){
      if(x<YARD.cx-YARD.w/2||x>YARD.cx+YARD.w/2)return null;
      if(z>=YARD.cz-YARD.d/2&&z<=YARD.cz+YARD.d/2)return 'nights-courtyard';
      if(z>=ROOM.cz-ROOM.d/2&&z<YARD.cz-YARD.d/2&&x>ROOM.cx-ROOM.w/2&&x<ROOM.cx+ROOM.w/2)return 'nights-room';return null;
    }
    const contains=(x,z)=>!!zoneAt(x,z);
    const floorAt=(x,z)=>contains(x,z)?0:null;
    function allowed(x,z){
      const zone=zoneAt(x,z);if(!zone)return false;const r=player.radius||.42;
      if(x-r<YARD.cx-YARD.w/2+.5||x+r>YARD.cx+YARD.w/2-.5)return false;
      if(z+r>YARD.cz+YARD.d/2-.5||z-r<ROOM.cz-ROOM.d/2+.4)return false;
      // The façade between the courtyard and the room: only through the door.
      const wallZ=YARD.cz-YARD.d/2;if(Math.abs(z-wallZ)<.45+r&&Math.abs(x-DOOR.x)>DOOR.w/2-r)return false;
      return !blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ);
    }

    // ---------- doing things ----------
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('nights-'))return false;
      if(flight)return true;
      if(data.type==='nights-carpet'){
        if(!hall.target){hall.target=1;hallReady();playSample?.('pageTurn',.4,.7);sound?.(330,.5,'triangle',.012);showNotice('You untie the cord, and the carpet unrolls itself across the floor, pattern side up.',6)}
        else startFlight(1);return true}
      if(data.type==='nights-carpet-home'){startFlight(-1);return true}
      if(data.type==='nights-lamp'){rub();return true}
      if(data.type==='nights-card'){if(data.key==='night')showNotice(`A brass plate by the door: ${nightLine(nights||countNight())}`,9);else showNotice(`${data.title}: ${data.author}`,data.key==='scheherazade'||data.key==='nights'||data.key==='diyab'?16:11);return true}
      return false;
    }

    // ---------- lifecycle ----------
    function activate(){if(!root)buildFar();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root=null;lantern=null;farAway=null;lamp=null;freeSky();bookGeometry=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0;
    }
    function reset(){if(flight){const f=flight;f.t=f.duration;f.done=true;land(f)}}
    function update(t,dt=0){
      time=t;const reduced=isReducedMotion(),{x,z}=player.pos,inside=contains(x,z);buildHall();
      // The hall's carpet unrolls when untied, and rolls itself up again once the reader has gone well away from it.
      if(!flight&&hall.target&&Math.hypot(x-ROLL.x,z-ROLL.z)>14){hall.target=0;hallReady()}
      if(hall.unrolled!==hall.target){hall.unrolled+=Math.sign(hall.target-hall.unrolled)*Math.min(Math.abs(hall.target-hall.unrolled),dt*(reduced?3:.9));setUnrolled(hall,smooth(clamp(hall.unrolled,0,1)))}
      if(hall.target&&!flight)ripple(hall,reduced?0:.12);
      if(flight){lastNeeded=t;updateFlight(dt,reduced);return}
      if(inside)activate();
      if(root){
        if(zoneAt(x,z)==='nights-courtyard'){scene.background.setRGB(.02,.02,.07);scene.fog.color.copy(scene.background);scene.fog.density=.012}
        if(lantern&&!reduced)lantern.intensity=5+Math.sin(t*5)*.25+Math.sin(t*11.3)*.12;
        const jet=root.userData.jet;if(jet&&!reduced){jet.scale.y=1+Math.sin(t*7)*.06;root.userData.bell.material.opacity=.14+Math.sin(t*3.3)*.03}
        if(farAway)ripple(farAway,reduced?0:.08);
        updateLamp();
        if(!inside&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==root))unload();
      }
    }
    return {contains,floorAt,allowed,interact,update,reset,enter,unload,startFlight,zoneAt,shelfBooks,countNight,nightLine,
      roll:ROLL,yard:YARD,room:ROOM,park:PARK,shelves:SHELVES,cards:CARDS,lang:LANG,flightLines:{out:OUT,back:BACK},
      get travelling(){return !!flight},get built(){return !!root},get skyBuilt(){return !!sky},get books(){return books.slice()},
      get lampFound(){return !!lamp?.found},get carpetUnrolled(){return hall?hall.target:0}};
  };
})();
