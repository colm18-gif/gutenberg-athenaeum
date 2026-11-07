// The cave behind the falls. In the mountain in the painting (mountain.js), a stream comes over the cliff at the edge of
// the meadow into a pool, and a ledge runs along the rock behind the falling water to the mouth of a cave. Inside: a
// chamber in the rock, lit by one lantern and by the moon coming through the water, with the falls a moving curtain
// across its mouth; books in two niches cut into the walls, books of caves and falling water (the shelf `falls-cave` in
// data/new-books.js, after the library's own, `OWN`); a stone bench; cards. Walking back into the curtain goes out onto
// the ledge. Built when the reader comes in, freed a while after they leave. Every quotation is checked by a test.
(function(){
  'use strict';

  const CAVE={cx:1500,cz:1000,w:14,d:12,h:6},KEEP=25;
  // The library's own copies that belong here too: Holmes at the Reichenbach (The Final Problem is in the Memoirs),
  // Minnehaha, Tom Sawyer lost in McDougal's cave, Granite House in The Mysterious Island, the descent into Snæfell,
  // and the treasure chamber in the mountain in King Solomon's Mines.
  const OWN=[834,19,74,1268,18857,2166];
  const QUOTES={
    // Watson at the Reichenbach, in The Final Problem (The Memoirs of Sherlock Holmes, book 834).
    reichenbach:'It is indeed, a fearful place. The torrent, swollen by the melting snow, plunges into a tremendous abyss, from which the spray rolls up like the smoke from a burning house.',
    // Longfellow, The Song of Hiawatha (book 19): Minnehaha, named for a waterfall.
    named:'From the water-fall he named her,\nMinnehaha, Laughing Water.',
    curtain:'See the face of Laughing Water\nPeeping from behind the curtain,'
  };
  const CARDS={
    curtain:['The falls, from behind',`The water coming down across the mouth of the cave, with the moon behind it. Walk into it to go back out onto the ledge. “${QUOTES.curtain.replace(/\n/g,' / ')}” (Longfellow, The Song of Hiawatha)`],
    stone:['A stone by the water',`Someone has cut words into it: “${QUOTES.reichenbach}” Watson, at the Reichenbach Falls, in The Final Problem; the Memoirs are in the niche.`],
    niches:['Behind the falls','Books of caves and falling water, cut into the rock: the cavern at Glenn’s Falls where Hawkeye hid the Munro sisters, the water-slide John Ridd climbed into the Doone valley, Plato’s cave of shadows, McDougal’s cave, Granite House, the road down through Snæfell, and Minnehaha, named for a waterfall.'],
    lantern:['A lantern','A storm lantern left on a ledge of rock, still burning. Somebody means to come back.']
  };

  window.createFallsCave=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals=[],showNotice,playSample,sound,move,registerSeat=null,analytics,out=null,isHolding=()=>false,isReducedMotion=()=>false}=options;
    let root=null,time=0,lastNeeded=-1e9,state=null,outCooldown=0;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    function add(geometry,material,x,y,z,parent=root){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    const card=key=>({type:'falls-cave-card',title:CARDS[key][0],author:CARDS[key][1],action:'LOOK'});
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const seeded=seed=>()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646};

    function catalogue(){const list=[];for(const id of [...OWN,...arrivals]){const b=findBook(id);if(b&&!list.includes(b))list.push(b)}return list.slice(0,12)}

    function build(){
      if(root)return;root=new THREE.Group();root.name='falls-cave';state={};const {cx,cz,w,d,h}=CAVE,r=seeded(1757);
      const rockTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#34373d';c.fillRect(0,0,W,H);for(let i=0;i<1200;i++){const v=30+r()*55|0;c.fillStyle=`rgba(${v},${v+3},${v+8},.55)`;c.fillRect(r()*W,r()*H,2+r()*16,1+r()*7)}
        c.fillStyle='rgba(120,170,160,.06)';for(let i=0;i<60;i++)c.fillRect(r()*W,r()*H,30+r()*60,4+r()*8)},256,256));
      rockTex.wrapS=rockTex.wrapT=THREE.RepeatWrapping;rockTex.repeat?.set?.(4,3);
      const rock=std({map:rockTex,color:0x8a9098,roughness:1,flatShading:true,emissive:0x050608}),wet=std({map:rockTex,color:0x5a6068,roughness:.35,metalness:.15,emissive:0x040506});
      // The floor, wet near the water; a dome of rock over it; boulders round the walls so no wall is straight.
      add(own(new THREE.CircleGeometry(9,40)),wet,cx,0,cz).rotation.x=-Math.PI/2;
      const dome=add(own(new THREE.SphereGeometry(8.6,28,14,0,Math.PI*2,0,Math.PI/2)),std({map:rockTex,color:0x6a7078,roughness:1,side:THREE.BackSide,emissive:0x040507}),cx,-.4,cz);dome.scale.set(1,.72,.86);
      const geo=own(new THREE.DodecahedronGeometry(1,1));
      for(let i=0;i<30;i++){const a=i/30*Math.PI*2;if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<.42||Math.abs(Math.cos(a))<.42)continue;const R=7.6+r()*.6,x=cx+Math.sin(a)*R,z=cz+Math.cos(a)*R*.86,s=1+r()*1.1,b=add(geo,rock,x,s*.5,z);b.scale.set(s,s*(1+r()*.8),s);b.rotation.set(r()*3,r()*3,r()*3)}
      for(let i=0;i<9;i++){const x=cx+(r()-.5)*9,z=cz-5+(r()-.5)*4,b=add(geo,rock,x,h-.6+r()*.6,z);b.scale.set(1+r(),.5+r()*.6,1+r())}// hanging from the roof
      // The mouth, to the south: the falls a curtain across it, lit by the moon behind, and spray rising off the floor.
      const waterTex=own(canvasTexture((c,W,H)=>{c.fillStyle='rgba(150,180,205,.55)';c.fillRect(0,0,W,H);const r2=seeded(9);for(let i=0;i<300;i++){const x=r2()*W,len=20+r2()*100,y=r2()*H,a=.2+r2()*.7,wd=1+r2()*3;for(const yy of [y,y-H]){const g=c.createLinearGradient(0,yy,0,yy+len);g.addColorStop(0,'rgba(240,248,255,0)');g.addColorStop(.5,`rgba(240,248,255,${a})`);g.addColorStop(1,'rgba(240,248,255,0)');c.fillStyle=g;c.fillRect(x,yy,wd,len)}}},128,256));
      waterTex.wrapS=waterTex.wrapT=THREE.RepeatWrapping;waterTex.repeat?.set?.(1.5,2);
      const curtain=add(own(new THREE.PlaneGeometry(5.6,5.2)),own(new THREE.MeshBasicMaterial({map:waterTex,color:0xcfe2f0,transparent:true,opacity:.92,side:THREE.DoubleSide,depthWrite:false})),cx,2.5,cz+d/2+.15);curtain.rotation.y=Math.PI;
      mark(curtain,{...card('curtain'),type:'falls-cave-out',action:'GO OUT'});
      const glowTex=own(canvasTexture((c,W,H)=>{const g=c.createRadialGradient(W/2,H*.6,4,W/2,H*.6,W*.7);g.addColorStop(0,'rgba(170,200,235,.55)');g.addColorStop(1,'rgba(170,200,235,0)');c.fillStyle=g;c.fillRect(0,0,W,H)},128,128));
      const glow=add(own(new THREE.PlaneGeometry(9,7)),own(new THREE.MeshBasicMaterial({map:glowTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})),cx,2.6,cz+d/2-.2);glow.rotation.y=Math.PI;glow.raycast=()=>{};
      for(const sx of [-1,1]){const b=add(geo,rock,cx+sx*3.6,2.4,cz+d/2-.2);b.scale.set(1.4,3.2,1.2)}// the jambs of the mouth
      const top=add(geo,rock,cx,5.4,cz+d/2-.2);top.scale.set(4,1.2,1.4);
      const N=50,pos=new Float32Array(N*3);for(let i=0;i<N;i++){pos[i*3]=cx+(r()-.5)*5;pos[i*3+1]=r()*2.5;pos[i*3+2]=cz+d/2-.4-r()*1.5}
      const sprayGeo=own(new THREE.BufferGeometry()),sprayAttr=new THREE.Float32BufferAttribute(pos,3);sprayGeo.setAttribute('position',sprayAttr);
      const spray=new THREE.Points(sprayGeo,own(new THREE.PointsMaterial({color:0xdde8f2,size:.1,map:own(canvasTexture((c,w,h)=>{const g2=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g2.addColorStop(0,'rgba(255,255,255,1)');g2.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g2;c.fillRect(0,0,w,h)},32,32)),transparent:true,opacity:.4,depthWrite:false})));spray.raycast=()=>{};root.add(spray);
      // A pool inside the mouth, where the spray runs back, and a stone with words cut in it beside it.
      const pool=add(own(new THREE.CircleGeometry(1.6,24)),std({color:0x0b1820,roughness:.08,metalness:.35,emissive:0x04090d}),cx+2.6,.02,cz+3.1);pool.rotation.x=-Math.PI/2;pool.scale.set(1.3,1,1);block(cx+2.6,cz+3.1,4.2,3.2);
      const stoneTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#4a4e55';c.fillRect(0,0,W,H);c.fillStyle='#1e2024';c.font='italic 21px Georgia';c.textAlign='center';const words=QUOTES.reichenbach.split(' ');let line='',y=40;for(const wd of words){if(c.measureText(line+' '+wd).width>W-40){c.fillText(line,W/2,y);y+=28;line=wd}else line=line?line+' '+wd:wd}c.fillText(line,W/2,y)},512,256));
      const stone=add(own(new THREE.BoxGeometry(1.6,.9,.5)),rock,cx-2.8,.45,cz+3.2);stone.rotation.y=.3;mark(stone,card('stone'));
      const face=add(own(new THREE.PlaneGeometry(1.5,.75)),own(new THREE.MeshStandardMaterial({map:stoneTex,roughness:1})),cx-2.8+Math.sin(.3)*.26,.5,cz+3.2+Math.cos(.3)*.26);face.rotation.y=.3;mark(face,card('stone'));block(cx-2.8,cz+3.2,1.8,.9);
      // Two niches cut into the rock, west and east, each with three ledges of books standing face out.
      const list=catalogue(),niches=[{x:cx-5.7,yaw:Math.PI/2},{x:cx+5.7,yaw:-Math.PI/2}],dark=std({color:0x15171b,roughness:1}),ledge=std({map:rockTex,color:0x777d86,roughness:1});
      niches.forEach((n,k)=>{const g=new THREE.Group();g.position.set(n.x,0,cz-.6);g.rotation.y=n.yaw;root.add(g);add(own(new THREE.BoxGeometry(3.4,3.2,.3)),dark,0,2,-.3,g);
        for(const y of [1.05,2.05,3.05])add(own(new THREE.BoxGeometry(3.3,.12,.5)),ledge,0,y-.3,-.05,g);
        const mine=list.slice(k*6,k*6+6);mine.forEach((book,i)=>{const row=Math.floor(i/2),col=i%2,bm=add(own(new THREE.BoxGeometry(.62,.86,.09)),own(bookMaterial(book)),-.7+col*1.4,1.18+row*1.0,0,g);bm.rotation.x=-.06;
          bm.userData={type:'book',book,loaded:false,fallsCave:true,home:{position:bm.position.clone(),quaternion:bm.quaternion.clone(),parent:g}};interactables.push(bm);ours.push(bm);books.push(bm)});
        const plaque=add(own(new THREE.BoxGeometry(1.5,.32,.05)),std({color:0x9a7a3a,metalness:.6,roughness:.4}),0,3.55,0,g);mark(plaque,card('niches'));block(n.x,cz-.6,1.2,3.6)});
      // The lantern, the cave's one light, on a ledge of rock; and a stone bench to read on.
      const lr=add(geo,rock,cx,.45,cz-4.6);lr.scale.set(1.2,.7,.9);block(cx,cz-4.6,2.2,1.6);
      const lantern=add(own(new THREE.BoxGeometry(.18,.26,.18)),own(new THREE.MeshBasicMaterial({color:0xffcf80})),cx,1.15,cz-4.6);mark(lantern,card('lantern'));
      const light=new THREE.PointLight(0xffc27a,10,16,2);light.position.set(cx,1.8,cz-4.2);root.add(light);
      const bench=new THREE.Group();bench.position.set(cx-1.2,0,cz-2.4);root.add(bench);const seat=add(own(new THREE.BoxGeometry(2,.42,.7)),rock,0,.24,0,bench);block(cx-1.2,cz-2.4,2.2,.9);
      registerSeat?.([seat],bench,new THREE.Vector3(0,1.15,0),Math.PI,{title:'A stone bench',author:'Sit by the lantern, with the falls behind you, and read one of the cave’s books.',bookIds:()=>books.map(b=>b.userData.book.id)});
      state={tex:waterTex,spray,pos:sprayAttr.array,light};scene.add(root);
    }
    function unload(){if(!root)return;root.removeFromParent();root=null;state=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0}

    // ---------- walking ----------
    function contains(x,z){return Math.abs(x-CAVE.cx)<CAVE.w/2+1&&Math.abs(z-CAVE.cz)<CAVE.d/2+1}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){if(!root||!contains(x,z))return false;const rad=player.radius||.42,dx=(x-CAVE.cx)/5.6,dz=(z-CAVE.cz)/(CAVE.d/2-.2);
      if(dx*dx+dz*dz>1)return false;return !blockers.some(b=>x+rad>b.minX&&x-rad<b.maxX&&z+rad>b.minZ&&z-rad<b.maxZ)}

    // ---------- coming and going ----------
    function enter(){build();lastNeeded=time;outCooldown=time+3;move(CAVE.cx,CAVE.cz+CAVE.d/2-2.2,0);
      showNotice('Behind the water the rock opens into a cave: a lantern burning on a ledge, the falls a moving curtain across the way you came, and books in niches cut into the walls.',9);
      analytics?.track('Room Explored',{room:'falls-cave'})}
    function leave(){if(!out)return;outCooldown=time+3;playSample?.('doorOpen',.2,.6);out()}
    function interact(object){const d=object?.userData;if(!d||typeof d.type!=='string'||!d.type.startsWith('falls-cave'))return false;
      if(d.type==='falls-cave-out'){leave();return true}
      if(d.type==='falls-cave-card'){showNotice(`${d.title}: ${d.author}`,d.author.length>160?13:9);return true}
      return false}
    function update(t,dt=0){time=t;const inside=contains(player.pos.x,player.pos.z);if(inside)lastNeeded=t;if(!root)return;
      if(!inside){if(t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home.parent))unload();return}
      const reduced=isReducedMotion();state.tex.offset?.set?.(0,(t*(reduced?.15:.9))%1);state.light.intensity=10+Math.sin(t*7.3)*.5+Math.sin(t*13.1)*.3;
      const arr=state.pos;for(let i=0;i<arr.length;i+=3){arr[i+1]+=dt*.5;if(arr[i+1]>2.6)arr[i+1]=0}state.spray.geometry.attributes.position.needsUpdate=true;
      // Walking back into the curtain goes out onto the ledge.
      if(t>outCooldown&&Math.abs(player.pos.x-CAVE.cx)<2.4&&player.pos.z>CAVE.cz+CAVE.d/2-1.1)leave()}
    return {contains,floorAt,allowed,interact,update,enter,leave,unload,activate:build,catalogue,zoneAt:(x,z)=>contains(x,z)?'falls-cave':null,
      room:CAVE,own:OWN,quotes:QUOTES,cards:CARDS,get built(){return !!root},get books(){return books.slice()}};
  };
})();
