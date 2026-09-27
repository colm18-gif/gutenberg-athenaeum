// Mars, as the nineteenth century imagined it: reached by the Rocket Hall's projectile once its course dial is
// turned from MOON to MARS (high-staircase.js). A rust-red plain at night under two small moons, Lowell's canals
// meeting at an oasis, the ruins of Helium with a reading room of Mars books, one of Wells's fallen fighting
// machines in a patch of red weed, and a wireless set that is still listening. A rocket waits to take the reader
// home.
//
// Like the island, nothing here is built until the reader lands, and it is freed again a little while after they
// leave. The sky borrows the library's own moonlight and sky light while the reader is here and puts them back
// exactly as they were; no lights are added.
(function(){
  'use strict';

  const CENTRE={x:620,z:120},RADIUS=34,KEEP=25;
  const ARRIVAL={x:0,z:15,yaw:0},ROCKET={x:4.2,z:19.5},RUIN={x:0,z:-14,r:6.6},OASIS={x:-8,z:4},TRIPOD={x:17,z:2};
  // Mars books already in the library; new arrivals for this shelf come from data/new-books.js (room 'mars').
  const SHELF=[62,72,36];
  const QUOTES={
    arrive:'The hatch opens on Mars. The air is thin, cold and faintly pink; two small moons are up, and a straight dark line runs away to the horizon.',
    canal:'A canal, ruler-straight, running for hundreds of miles. Percival Lowell mapped hundreds of them from Arizona and believed a dying people had dug them to carry water from the poles. Nobody has seen them since.',
    oasis:'Where the canals meet, Lowell drew a dark round spot and called it an oasis. Here it is: low, purplish growth, and water standing very still.',
    tripod:'One of the fighting-machines from The War of the Worlds, lying where it fell, its hood split and its legs folded under it. Wells’s Martians were beaten by Earth’s bacteria. The red weed they brought with them has come home.',
    weed:'The red weed. In Wells’s novel it choked the Thames valley in a few weeks, and then withered as quickly.',
    ruin:'The Reading Room of Helium',
    ruinNote:'The twin city of Helium, from Burroughs’s Barsoom books: here only a ring of broken columns, but the shelves inside are kept.',
    phobos:'Phobos and Deimos, Fear and Dread, the two small moons Asaph Hall found in 1877. Phobos is so close and so fast that it rises in the west and sets in the east, twice in a Martian night.',
    earth:'That blue-white evening star, low in the west, is Earth. Somewhere on it the library’s lamps are lit.',
    rocket:'Its brass plate reads: ONE RETURN TICKET · ROCKET HALL, BY WAY OF THE ASTEROIDS.'
  };
  // The wireless answers in Morse. The message changes each night.
  const SIGNALS=['LAMPS LIT · BOOKS WAITING · COME HOME WHEN YOU HAVE FINISHED YOUR CHAPTER','THE CAT ASKS WHERE YOU HAVE GONE','CALLING MARS · CALLING MARS · IS ANYONE READING','ALL QUIET IN THE GRAND HALL · A PAGE TURNED AT MIDNIGHT'];

  window.createMars=function(options){
    const {THREE,scene,MAT,player,camera,interactables,canvasTexture,bookMaterial,findBook,renderer,ambient,moon,showNotice,playSample,sound,move,boardHome,analytics,arrivals=()=>[],isHolding=()=>false,isReducedMotion=()=>false,storage=null,today=()=>new Date()}=options;
    let root=null,time=0,lastHere=-1e9,applied=false,saved=null,signalBusy=false,sky=null,phobos=null,deimos=null;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    const W=(x,z)=>[CENTRE.x+x,CENTRE.z+z];
    function add(geometry,material,x,y,z,parent=root){const m=new THREE.Mesh(own(geometry),material);m.position.set(x,y,z);parent.add(m);return m}
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    const texture=(draw,w,h)=>own(canvasTexture(draw,w,h));
    function seeded(key){let h=2166136261;for(const ch of String(key)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return()=>{h=Math.imul(h^h>>>15,2246822507);h=Math.imul(h^h>>>13,3266489909);return((h^=h>>>16)>>>0)/4294967296}}
    function instanced(geometry,material,list,parent=root){const mesh=new THREE.InstancedMesh(own(geometry),material,list.length),m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();
      list.forEach(([x,y,z,sx,sy,sz,ry=0,rx=0],i)=>mesh.setMatrixAt(i,m.compose(new THREE.Vector3(x,y,z),q.setFromEuler(e.set(rx,ry,0)),new THREE.Vector3(sx,sy,sz))));parent.add(mesh);return mesh}

    // ---------- the world ----------
    function build(){
      root=new THREE.Group();root.name='mars';root.position.set(CENTRE.x,0,CENTRE.z);scene.add(root);
      const rand=seeded('mars');
      const dust=texture((c,Wd,H)=>{c.fillStyle='#9a4a2a';c.fillRect(0,0,Wd,H);for(let k=0;k<4200;k++){c.fillStyle=['#8a3f22','#a8583a','#b86a44','#7a361d','#c27a52'][k%5];c.globalAlpha=.35;c.fillRect(rand()*Wd,rand()*H,1+rand()*3,1+rand()*3)}c.globalAlpha=1},256,256);
      dust.wrapS=dust.wrapT=THREE.RepeatWrapping;dust.repeat.set(14,14);
      const ground=add(new THREE.CircleGeometry(RADIUS+46,48),std({map:dust,color:0xc98a6a,roughness:1}),0,0,0);ground.rotation.x=-Math.PI/2;
      // Mesas and low hills ring the plain, far enough out to fade into the dust.
      const rock=std({color:0x5e2a18,roughness:1}),darkRock=std({color:0x3e1a10,roughness:1});
      for(let i=0;i<14;i++){const a=i/14*Math.PI*2+rand()*.2,d=RADIUS+10+rand()*22,h=3+rand()*8,r=4+rand()*7;add(new THREE.CylinderGeometry(r*.7,r,h,7),i%3?rock:darkRock,Math.cos(a)*d,h/2-.3,Math.sin(a)*d)}
      // Scattered stones.
      const stones=[];for(let i=0;i<70;i++){const a=rand()*Math.PI*2,d=4+rand()*(RADIUS-4),x=Math.cos(a)*d,z=Math.sin(a)*d;if(Math.hypot(x-RUIN.x,z-RUIN.z)<RUIN.r+1||Math.abs(z-OASIS.z)<1.6)continue;const s=.15+Math.pow(rand(),2)*.7;stones.push([x,s*.25,z,s,s*.55,s*1.2,rand()*3])}
      instanced(new THREE.DodecahedronGeometry(1,0),darkRock,stones);
      buildCanals(rand);buildRuin(rand);buildTripod(rand);buildRocket();buildSky(rand);
    }
    function buildCanals(rand){
      const water=std({color:0x16302f,roughness:.2,metalness:.25,emissive:0x061414}),verge=std({color:0x3b3a22,roughness:1}),growth=std({color:0x3a2d3e,roughness:.95});
      const canal=(x0,z0,x1,z1)=>{const len=Math.hypot(x1-x0,z1-z0),ang=Math.atan2(z1-z0,x1-x0),cx=(x0+x1)/2,cz=(z0+z1)/2;
        const v=add(new THREE.PlaneGeometry(len,3.2),verge,cx,.012,cz);v.rotation.set(-Math.PI/2,0,-ang);const w=add(new THREE.PlaneGeometry(len,1.5),water,cx,.022,cz);w.rotation.set(-Math.PI/2,0,-ang);mark(w,{type:'mars-note',title:'A canal',author:'Straight as a ruler, as far as the eye can follow.',action:'LOOK',text:QUOTES.canal})};
      canal(-RADIUS-30,OASIS.z,RADIUS+30,OASIS.z);canal(OASIS.x,OASIS.z,OASIS.x-40,OASIS.z+54);canal(OASIS.x,OASIS.z,OASIS.x-46,OASIS.z-46);
      const pool=add(new THREE.CircleGeometry(3.6,28),growth,OASIS.x,.03,OASIS.z);pool.rotation.x=-Math.PI/2;const still=add(new THREE.CircleGeometry(2,24),water,OASIS.x,.04,OASIS.z);still.rotation.x=-Math.PI/2;
      mark(pool,{type:'mars-note',title:'The oasis',author:'Where the canals meet.',action:'LOOK',text:QUOTES.oasis});mark(still,pool.userData);
      const plants=[];for(let i=0;i<22;i++){const a=rand()*Math.PI*2,d=2.2+rand()*1.3;plants.push([OASIS.x+Math.cos(a)*d,.3,OASIS.z+Math.sin(a)*d,.25+rand()*.2,.5+rand()*.7,.25+rand()*.2,rand()*3])}
      instanced(new THREE.ConeGeometry(1,1,6),std({color:0x4b2f52,roughness:.9,emissive:0x12081a}),plants);
    }
    function buildRuin(rand){
      const stone=std({color:0xb88a62,roughness:.95}),worn=std({color:0x8e6a4c,roughness:1});
      const floor=add(new THREE.CircleGeometry(RUIN.r+.4,40),worn,RUIN.x,.03,RUIN.z);floor.rotation.x=-Math.PI/2;
      // A ring of columns, most of them broken, open to the south where the gateway stands.
      const columns=[],caps=[];
      for(let i=0;i<16;i++){const a=i/16*Math.PI*2;if(Math.abs(Math.sin(a)-1)<.2)continue;const x=RUIN.x+Math.cos(a)*RUIN.r,z=RUIN.z+Math.sin(a)*RUIN.r,h=1.2+rand()*3.6;
        columns.push([x,h/2,z,1,h,1,rand()*3]);if(h>3.8)caps.push([x,h+.12,z,1,1,1,a]);block(x,z,.9,.9)}
      instanced(new THREE.CylinderGeometry(.34,.4,1,10),stone,columns);instanced(new THREE.BoxGeometry(1.1,.24,1.1),stone,caps);
      const fallen=[];for(let i=0;i<5;i++){const a=rand()*Math.PI*2,d=RUIN.r+1.2+rand()*3;fallen.push([RUIN.x+Math.cos(a)*d,.35,RUIN.z+Math.sin(a)*d,1,1.8+rand()*1.2,1,rand()*3,Math.PI/2])}instanced(new THREE.CylinderGeometry(.34,.34,1,10),worn,fallen);
      // The gateway, with its name above.
      const gz=RUIN.z+RUIN.r;for(const dx of [-1.7,1.7]){add(new THREE.BoxGeometry(.8,5,.8),stone,RUIN.x+dx,2.5,gz);block(RUIN.x+dx,gz,.9,.9)}
      add(new THREE.BoxGeometry(4.3,.6,.9),stone,RUIN.x,5.2,gz);
      const plaque=texture((c,Wd,H)=>{c.fillStyle='#3a2416';c.fillRect(0,0,Wd,H);c.strokeStyle='#d7ae60';c.lineWidth=6;c.strokeRect(6,6,Wd-12,H-12);c.fillStyle='#ffe2a0';c.textAlign='center';c.font='bold 34px Georgia';c.fillText('THE READING ROOM OF HELIUM',Wd/2,50);c.font='italic 20px Georgia';c.fillText('Books of Mars, kept on Mars',Wd/2,82)},640,100);
      const sign=add(new THREE.PlaneGeometry(3.2,.5),std({map:plaque,emissive:0xffffff,emissiveMap:plaque,emissiveIntensity:.45,roughness:.8}),RUIN.x,4.55,gz+.42);
      mark(sign,{type:'mars-note',title:QUOTES.ruin,author:'A ring of broken columns, and shelves that someone still keeps.',action:'READ',text:QUOTES.ruinNote});
      // The books, face-out on low stone pedestals around the inside of the ring.
      const ids=[...new Set([...SHELF,...arrivals()])],list=ids.map(id=>findBook(id)).filter(Boolean).slice(0,14),n=list.length;
      list.forEach((book,i)=>{const a=Math.PI*(.75+1.5*(n>1?i/(n-1):.5)),x=RUIN.x+Math.cos(a)*(RUIN.r-1.7),z=RUIN.z+Math.sin(a)*(RUIN.r-1.7),yaw=Math.atan2(RUIN.x-x,RUIN.z-z);
        add(new THREE.CylinderGeometry(.42,.5,.9,8),worn,x,.45,z);block(x,z,.9,.9);
        const mesh=add(new THREE.BoxGeometry(.72,.96,.13),own(bookMaterial(book)),x,1.35,z);mesh.rotation.order='YXZ';mesh.rotation.y=yaw;mesh.rotation.x=-.3;
        mesh.userData={type:'book',book,loaded:false,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};interactables.push(mesh);ours.push(mesh);books.push(mesh)});
      // In the middle, on a stone table, a wireless set that is still switched on.
      add(new THREE.BoxGeometry(1.6,.9,1),worn,RUIN.x,.45,RUIN.z);block(RUIN.x,RUIN.z,1.8,1.2);
      const cabinet=add(new THREE.BoxGeometry(.8,.5,.45),MAT.darkWood,RUIN.x-.2,1.15,RUIN.z);
      const dial=add(new THREE.CircleGeometry(.11,16),std({color:0xf2d7a0,emissive:0xffb050,emissiveIntensity:.8}),RUIN.x-.35,1.2,RUIN.z+.231);
      const horn=add(new THREE.ConeGeometry(.22,.55,14,1,true),MAT.brass,RUIN.x+.45,1.25,RUIN.z);horn.rotation.z=Math.PI/2+.5;horn.material=MAT.brass;
      const set={type:'mars-wireless',title:'A wireless set',author:'Its valve still glows, and a faint ticking comes from the brass horn.',action:'LISTEN'};for(const m of [cabinet,dial,horn])mark(m,set);
    }
    function buildTripod(rand){
      const metal=std({color:0x6f6a62,metalness:.65,roughness:.45}),dark=std({color:0x2c2a28,metalness:.5,roughness:.6});
      const g=new THREE.Group();g.position.set(TRIPOD.x,0,TRIPOD.z);g.rotation.y=.6;root.add(g);
      const hood=add(new THREE.SphereGeometry(1.7,18,12),metal,0,.9,0,g);hood.scale.set(1.25,.62,1);hood.rotation.z=.5;
      const eye=add(new THREE.CircleGeometry(.32,14),std({color:0x100a08,emissive:0x3a0c06,emissiveIntensity:.6}),1.7,1.25,0,g);eye.rotation.y=Math.PI/2;eye.rotation.x=-.2;
      for(const [a,tilt,len] of [[.3,1.25,9],[2.3,1.4,8],[4.2,1.1,7]]){const leg=add(new THREE.CylinderGeometry(.12,.16,len,8),dark,0,0,0,g);const dx=Math.cos(a),dz=Math.sin(a);leg.position.set(dx*len*.42,.35,dz*len*.42);leg.rotation.set(0,-a,Math.PI/2-(tilt-1.2));
        const joint=add(new THREE.SphereGeometry(.28,10,8),metal,dx*len*.84,.3,dz*len*.84,g)}
      block(TRIPOD.x,TRIPOD.z,4.4,4.4);
      const data={type:'mars-note',title:'A fallen fighting-machine',author:'Its hood is split, and its legs are folded under it.',action:'EXAMINE',text:QUOTES.tripod};for(const m of g.children)mark(m,data);
      const weed=[];for(let i=0;i<60;i++){const a=rand()*Math.PI*2,d=2.5+rand()*6;weed.push([TRIPOD.x+Math.cos(a)*d,.18,TRIPOD.z+Math.sin(a)*d,.35+rand()*.3,.3+rand()*.4,.35+rand()*.3,rand()*3])}
      const weedMesh=instanced(new THREE.IcosahedronGeometry(1,0),std({color:0x7a1210,roughness:.85,emissive:0x1a0302}),weed);mark(weedMesh,{type:'mars-note',title:'The red weed',author:'Crimson and fleshy, spreading from the machine.',action:'LOOK',text:QUOTES.weed});
    }
    function buildRocket(){
      const red=std({color:0x9b2a20,roughness:.5,metalness:.3}),hull=std({color:0x8a857a,metalness:.7,roughness:.4});
      const g=new THREE.Group();g.position.set(ROCKET.x,0,ROCKET.z);root.add(g);
      const parts=[add(new THREE.CylinderGeometry(.7,.86,3.35,12),hull,0,2.05,0,g),add(new THREE.ConeGeometry(.72,1.6,12),red,0,4.52,0,g),add(new THREE.CylinderGeometry(.9,.9,.16,12),red,0,.1,0,g)];
      for(let i=0;i<3;i++){const a=i/3*Math.PI*2,fin=add(new THREE.BoxGeometry(.12,1.15,1.05),red,Math.cos(a)*.82,.75,Math.sin(a)*.82,g);fin.rotation.y=-a;parts.push(fin)}
      const port=add(new THREE.CircleGeometry(.26,16),std({color:0xffd9a0,emissive:0xffb35c,emissiveIntensity:1.2}),0,2.6,.87,g);parts.push(port);
      const data={type:'mars-rocket',title:'The return projectile',author:QUOTES.rocket,action:'BOARD · RETURN TO EARTH'};for(const p of parts)mark(p,data);block(ROCKET.x,ROCKET.z,2.2,2.2);
    }
    function buildSky(rand){
      // A dome that follows the reader: dust-brown at the horizon, black overhead, full of stars, with Earth low in the west.
      const map=texture((c,Wd,H)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#020306');g.addColorStop(.38,'#07060b');g.addColorStop(.49,'#2a140e');g.addColorStop(.52,'#3a1c12');g.addColorStop(1,'#1a0c08');c.fillStyle=g;c.fillRect(0,0,Wd,H);
        for(let i=0;i<900;i++){const y=rand()*H*.47,a=.25+rand()*.75*(1-y/(H*.5));c.fillStyle=`rgba(${230+rand()*25|0},${220+rand()*30|0},${200+rand()*40|0},${a})`;c.fillRect(rand()*Wd,y,rand()<.08?2:1,rand()<.08?2:1)}
        const ex=Wd*.75,ey=H*.43,halo=c.createRadialGradient(ex,ey,0,ex,ey,9);halo.addColorStop(0,'rgba(190,220,255,1)');halo.addColorStop(1,'rgba(120,170,255,0)');c.fillStyle=halo;c.beginPath();c.arc(ex,ey,9,0,Math.PI*2);c.fill()},2048,512);
      sky=add(new THREE.SphereGeometry(300,32,16),own(new THREE.MeshBasicMaterial({map,side:THREE.BackSide,fog:false,depthWrite:false})),0,0,0,scene);sky.renderOrder=-1;
      const moonMat=own(new THREE.MeshBasicMaterial({color:0xcfc2ae,fog:false}));
      phobos=add(new THREE.SphereGeometry(4.2,14,10),moonMat,0,0,0,scene);phobos.scale.set(1.3,1,1);deimos=add(new THREE.SphereGeometry(1.8,10,8),moonMat,0,0,0,scene);
    }
    function placeSky(t){
      const x=camera.position.x,y=camera.position.y,z=camera.position.z;sky.position.set(x,0,z);
      // Phobos rises in the west and sets in the east; Deimos barely moves.
      const pa=Math.PI*.15+((t*.02)%1)*Math.PI*.7,da=Math.PI*.35+Math.sin(t*.003)*.2;
      phobos.position.set(x-Math.cos(pa)*180,y+Math.sin(pa)*120,z-40);deimos.position.set(x+Math.cos(da)*160,y+Math.sin(da)*130,z+60);
    }

    // ---------- the Martian night ----------
    // Reuses the library's own moonlight and sky light, turned rust-red while the reader is here and put back exactly
    // as they were on the way home.
    const NIGHT={background:new THREE.Color(0x120806),fog:new THREE.Color(0x2e140c),light:new THREE.Color(0xffc4a0),sky:new THREE.Color(0xd08a66),ground:new THREE.Color(0x5a2412)};
    function applyAtmosphere(){
      if(!applied)saved={background:scene.background.clone(),fog:scene.fog.color.clone(),fogDensity:scene.fog.density,moonColor:moon.color.clone(),moonIntensity:moon.intensity,moonPosition:moon.position.clone(),skyColor:ambient.color.clone(),groundColor:ambient.groundColor?.clone(),ambientIntensity:ambient.intensity};
      applied=true;scene.background.copy(NIGHT.background);scene.fog.color.copy(NIGHT.fog);scene.fog.density=.016;
      moon.color.copy(NIGHT.light);moon.intensity=1.25;moon.position.set(CENTRE.x-60,40,CENTRE.z-30);ambient.color.copy(NIGHT.sky);if(ambient.groundColor)ambient.groundColor.copy(NIGHT.ground);ambient.intensity=1.2;
    }
    function restoreAtmosphere(){if(!applied||!saved)return;scene.background.copy(saved.background);scene.fog.color.copy(saved.fog);scene.fog.density=saved.fogDensity;moon.color.copy(saved.moonColor);moon.intensity=saved.moonIntensity;moon.position.copy(saved.moonPosition);ambient.color.copy(saved.skyColor);if(ambient.groundColor&&saved.groundColor)ambient.groundColor.copy(saved.groundColor);ambient.intensity=saved.ambientIntensity;applied=false}

    // ---------- the wireless ----------
    const MORSE={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..'};
    function listen(){
      const day=Math.floor(today().getTime()/86400000),message=SIGNALS[((day%SIGNALS.length)+SIGNALS.length)%SIGNALS.length];
      showNotice(`The valve glows brighter and the horn begins to tick. You write it down letter by letter: “${message}.” It is coming from Earth.`,12);
      analytics?.track('Secret Found',{secret:'mars-wireless'});if(signalBusy)return;signalBusy=true;
      // Tap out the first word in Morse, quietly.
      let at=0;const word=message.split(' ')[0];for(const ch of word){for(const beat of MORSE[ch]||''){const len=beat==='.'?.08:.24;setTimeout(()=>sound?.(760,len,'sine',.035),at*1000);at+=len+.08}at+=.25}
      setTimeout(()=>{signalBusy=false},at*1000+300);
    }

    // ---------- the reader here ----------
    const local=(x,z)=>({x:x-CENTRE.x,z:z-CENTRE.z});
    function contains(x,z){const p=local(x,z);return Math.hypot(p.x,p.z)<RADIUS+2}
    function zoneAt(x,z){return contains(x,z)?'mars':null}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){const p=local(x,z);if(Math.hypot(p.x,p.z)>RADIUS-1)return false;for(const b of blockers)if(p.x>b.minX-.3&&p.x<b.maxX+.3&&p.z>b.minZ-.3&&p.z<b.maxZ+.3)return false;return true}
    function onSand(x,z){return contains(x,z)}
    function arrive(){
      if(!root)build();lastHere=time;const [x,z]=W(ARRIVAL.x,ARRIVAL.z);move(x,z,ARRIVAL.yaw);applyAtmosphere();showNotice(QUOTES.arrive,8);setTimeout(()=>{if(contains(player.pos.x,player.pos.z))showNotice(`${QUOTES.phobos} ${QUOTES.earth}`,12)},10000);
      try{storage?.setItem('athenaeum-mars-visited','1')}catch(e){}analytics?.track('Room Explored',{room:'mars'});return true;
    }
    function stepOut(){if(!root)build();const [x,z]=W(ROCKET.x-1.6,ROCKET.z-2.2);move(x,z,Math.PI*.8);applyAtmosphere();showNotice('You step back onto the red dust. The projectile waits.',5)}
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('mars-'))return false;
      switch(data.type){
        case 'mars-note':showNotice(data.text||data.author,data.text?10:5);return true;
        case 'mars-wireless':listen();return true;
        case 'mars-rocket':playSample?.('doorOpen',.65,.9);boardHome?.();return true;
      }
      return false;
    }
    function unload(){
      restoreAtmosphere();if(root){root.removeFromParent()}for(const m of [sky,phobos,deimos])m?.removeFromParent();
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0;root=sky=phobos=deimos=null;
    }
    function reset(){restoreAtmosphere()}
    function update(t){
      time=t;const here=contains(player.pos.x,player.pos.z);
      if(here){lastHere=t;if(!root)build();applyAtmosphere();placeSky(t);return}
      restoreAtmosphere();
      if(root&&t-lastHere>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home.parent))unload();
    }
    return {contains,zoneAt,floorAt,allowed,onSand,arrive,stepOut,interact,update,reset,get built(){return !!root},get books(){return books},center:CENTRE,QUOTES};
  };
})();
