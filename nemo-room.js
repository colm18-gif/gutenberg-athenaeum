// Captain Nemo's Salon: the library and drawing-room of the Nautilus, under the sea. The way in is the model of the
// Nautilus on its plinth in the Extraordinary Voyages (the theme room in game.js): its salon windows are lit, and
// looking into one, the reader is aboard. Black violet ebony inlaid with brass, brown leather divans, four unpolished
// globes in the ceiling, as Verne has it; tales of the deep on the west wall, the naturalists of the sea on the east, and
// Atlantis and sunken treasure by the hatch. In the north wall the great panel opens on the sea, with fish going by.
//
// The room's secret is Nemo's organ: he "touched only the black keys", and so does it. Played, the panels close, and
// open again on the drowned city, with ATLANTIS chalked on the black basalt as Nemo wrote it; and Plato's Critias is left
// on the music desk. Once seen it stays found (athenaeum-nemo-atlantis; ?atlantis shows it). Like the other rooms out of
// the way, nothing is built until the reader comes near the model, and it is freed a little while after they leave.
(function(){
  'use strict';

  // The library's own copies that stand here too, first among the tales: Twenty Thousand Leagues and The Mysterious Island.
  const OWN=[164,1268];
  // Three runs of ebony shelves. Their books are the new arrivals for each (data/new-books.js, rooms nemo-*), after any listed here.
  const GROUPS=[
    {key:'tales',name:'TALES OF THE DEEP',sub:'Wrecks, divers, monsters and the people of the sea',wall:'west',along:0,length:9,max:12,ids:OWN},
    {key:'deep',name:'NATURALISTS OF THE SEA',sub:'The shore, the reef and the abyss',wall:'east',along:0,length:9,max:12,ids:[]},
    {key:'lost',name:'ATLANTIS AND SUNKEN GOLD',sub:'Lost lands and lost treasure',wall:'south',along:-4.4,length:4.4,max:8,ids:[]}
  ];
  // Verne's own words, from the library's copy (texts/pg164.txt); a test checks each one against it.
  const VERNE={
    library:'“Twelve thousand, M. Aronnax. These are the only ties which bind me to the earth.”',
    silence:'“Where could one find greater solitude or silence, Professor?”',
    globes:'The electric light flooded everything; it was shed from four unpolished globes half sunk in the volutes of the ceiling.',
    panels:'Suddenly light broke at each side of the saloon, through two oblong openings. The liquid mass appeared vividly lit up by the electric gleam. Two crystal plates separated us from the sea.',
    light:'It was no longer luminous water, but liquid light.',
    keys:'I remarked that he touched only the black keys, which gave his melodies an essentially Scotch character.',
    chalk:'Captain Nemo stopped me by a gesture, and, picking up a piece of chalk-stone, advanced to a rock of black basalt, and traced the one word: ATLANTIS',
    plato:'What a light shot through my mind! Atlantis! the Atlantis of Plato,',
    motto:'MOBILIS IN MOBILI'
  };
  const CARDS={
    sign:['Captain Nemo’s Salon','The library and drawing-room of the Nautilus. '+VERNE.library+' Tales of the deep on the left, the naturalists of the sea on the right, Atlantis and sunken gold by the hatch.'],
    table:['The great table','Covered with pamphlets and old newspapers, none of them later than the day the Nautilus first went down. '+VERNE.globes],
    divan:['A leather divan','Brown leather, curved for comfort. '+VERNE.silence],
    shell:['A chambered nautilus','The shell the boat is named for: a spiral of pearly chambers, each closed off as the animal grows, which it fills or empties of gas to rise or sink.'],
    motto:['Mobilis in mobili','The Captain’s motto, engraved over his N on every spoon and plate aboard: moving within the moving element.'],
    gauge:['The manometer','A dial for the pressure of the water outside, and so the depth. The needle trembles a little, as if the Nautilus were still going down.']
  };
  // Nemo's melody on the black keys alone (F♯ G♯ A♯ C♯ D♯): the notes in hertz and how long each is held, in beats.
  const BLACK_KEYS=[369.99,415.3,466.16,554.37,622.25,739.99];
  const TUNE=[[554.37,1],[466.16,.5],[415.3,.5],[369.99,1.5],[415.3,.5],[466.16,1],[554.37,1],[622.25,2],[554.37,1],[466.16,1],[415.3,1],[369.99,2.5]];

  window.createNemoRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,move,analytics,isHolding=()=>false,registerSeat=null,doorKit=null,tone=null,storage=window.localStorage,
      toVerne=null,model={x:220,z:70}}=options;
    const ROOM={cx:1000,cz:200,w:16,d:12,h:5};
    const PRELOAD=8,KEEP=25,WINDOW={w:7,h:2.8,y:2.3};
    // Back in the Extraordinary Voyages: in front of the model, facing it.
    const BACK={x:model.x,z:model.z+2.8,yaw:0};
    const FOUND_KEY='athenaeum-nemo-atlantis';
    const search=()=>{try{return location.search||''}catch(e){return ''}};
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||/[?&]atlantis\b/.test(search())}catch(e){return false}};
    let root=null,time=0,lastNeeded=-1e9,sea=null,organ=null,opening=null;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'nemo-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function plate(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#1c1220';c.fillRect(0,0,W,H);c.strokeStyle='#c9a24a';c.lineWidth=4;c.strokeRect(7,7,W-14,H-14);c.strokeRect(13,13,W-26,H-26);
        c.fillStyle='#e2c27a';c.textAlign='center';c.font='bold 28px Georgia';c.fillText(text,W/2,sub?52:H/2+10);if(sub){c.font='italic 20px Georgia';c.fillText(sub,W/2,84)}},620,sub?104:70));
      return add(own(new THREE.PlaneGeometry(w,h)),own(new THREE.MeshStandardMaterial({map,emissive:0x6a5020,emissiveMap:map,emissiveIntensity:.35,roughness:.5,metalness:.3})),x,y,z,parent);
    }

    // The books for each shelf: those listed, then the new arrivals; a book the library does not hold is left out.
    const shelfBooks=(ids,room,max)=>[...new Set([...ids,...(arrivals[room]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,max);
    function catalogue(){return {groups:GROUPS.map(group=>({...group,books:shelfBooks(group.ids,group.key,group.max)})),atlantis:shelfBooks([],'atlantis',1)}}

    // ---------- the room ----------
    function buildRoom(){
      root=new THREE.Group();root.name='nemo-room';const {cx,cz,w,d,h}=ROOM;
      // Black violet ebony panelling inlaid with brass lines, a dark carpet, and a ceiling of arabesques round the globes.
      const panelling=own(canvasTexture((c,W,H)=>{c.fillStyle='#1e1424';c.fillRect(0,0,W,H);for(let i=0;i<40;i++){c.strokeStyle=`rgba(${60+i%3*8},${40+i%5*4},${70+i%4*6},.35)`;c.beginPath();c.moveTo(0,i*7);c.bezierCurveTo(W*.3,i*7+4,W*.7,i*7-4,W,i*7+2);c.stroke()}
        c.strokeStyle='#b8913e';c.lineWidth=3;c.strokeRect(14,14,W-28,H-28);c.lineWidth=1.5;c.strokeRect(24,24,W-48,H-48);for(const [x,y] of [[24,24],[W-24,24],[24,H-24],[W-24,H-24]]){c.beginPath();c.arc(x,y,6,0,7);c.stroke()}},256,256));
      panelling.wrapS=panelling.wrapT=THREE.RepeatWrapping;panelling.repeat?.set?.(w/1.6,h/1.6);
      const ebony=own(new THREE.MeshStandardMaterial({color:0x9a86a2,map:panelling,roughness:.45,metalness:.1})),dark=own(new THREE.MeshStandardMaterial({color:0x1a1018,roughness:.5})),brass=MAT.brass||own(new THREE.MeshStandardMaterial({color:0xb8913e,metalness:.7,roughness:.35}));
      const carpet=own(canvasTexture((c,W,H)=>{c.fillStyle='#2a1a22';c.fillRect(0,0,W,H);c.strokeStyle='#5a3a2a';c.lineWidth=3;for(let k=0;k<W;k+=32){c.beginPath();c.arc(k+16,H/2,12,0,7);c.stroke()}c.strokeStyle='#7a5a2a';c.strokeRect(6,6,W-12,H-12)},256,128));
      box(w,.3,d,own(new THREE.MeshStandardMaterial({color:0x6a4a52,map:carpet,roughness:.95})),cx,-.15,cz,root);box(w,.2,d,dark,cx,h+.1,cz,root);
      // The north wall is built round the great panel's opening; the others are whole.
      const {w:ww,h:wh,y:wy}=WINDOW,northZ=cz-d/2,side=(w-ww)/2;
      for(const sx of [-1,1])box(side,h,.3,ebony,cx+sx*(ww/2+side/2),h/2,northZ,root);
      box(ww,wy-wh/2,.3,ebony,cx,(wy-wh/2)/2,northZ,root);box(ww,h-(wy+wh/2),.3,ebony,cx,(h+wy+wh/2)/2,northZ,root);
      box(w,h,.3,ebony,cx,h/2,cz+d/2,root);box(.3,h,d,ebony,cx-w/2,h/2,cz,root);box(.3,h,d,ebony,cx+w/2,h/2,cz,root);
      // The ceiling's arabesques and its four unpolished globes.
      const globe=own(new THREE.MeshStandardMaterial({color:0xf2f0e6,emissive:0xe8f0ff,emissiveIntensity:1.1,roughness:.9}));
      for(const [gx,gz] of [[-3.5,-2],[3.5,-2],[-3.5,2],[3.5,2]]){const g=add(own(new THREE.SphereGeometry(.24,16,10)),globe,cx+gx,h-.12,cz+gz,root);mark(g,{type:'nemo-card',title:'An unpolished globe',author:VERNE.globes,action:'READ'});
        const ring=add(own(new THREE.TorusGeometry(.36,.04,6,24)),brass,cx+gx,h-.02,cz+gz,root);ring.rotation.x=Math.PI/2}
      mark(plate(root,'CAPTAIN NEMO’S SALON','Mobilis in mobili',3.6,.6,cx,h-.6,northZ+.17),card('sign'));
      buildWindow(cx,northZ);
      // The shelves: ebony cases inlaid with brass, two rows each.
      const {groups,atlantis}=catalogue(),geometry=own(new THREE.BoxGeometry(.72,.96,.13)),ROWS=[1.35,2.5];
      for(const group of groups){
        const per=Math.max(1,Math.ceil(group.books.length/2)),step=Math.min(1.2,(group.length-.4)/Math.max(1,per));
        group.books.forEach((book,i)=>{const row=i<per?0:1,n=row?group.books.length-per:per,col=row?i-per:i,offset=(col-(n-1)/2)*step;
          placeBook(book,{...shelfSpot(group,offset),y:ROWS[row]},geometry,group.key)});
        const s=shelfSpot(group,0,.36),label=plate(root,group.name,group.sub,3.2,.5,0,3.45,0);
        if(group.wall==='south'){for(const y of ROWS){box(group.length,.05,.38,brass,s.x,y-.5,s.z,root)}box(group.length+.2,3.1,.12,dark,s.x,1.55,cz+d/2-.2,root);block(s.x,s.z,group.length+.2,.8);label.position.set(s.x,3.45,cz+d/2-.17);label.rotation.y=Math.PI}
        else{const sd=group.wall==='west'?-1:1;for(const y of ROWS)box(.38,.05,group.length,brass,s.x,y-.5,s.z,root);box(.12,3.1,group.length+.2,dark,cx+sd*(w/2-.2),1.55,s.z,root);block(s.x,s.z,.8,group.length+.2);label.position.set(cx+sd*(w/2-.17),3.45,s.z);label.rotation.y=-sd*Math.PI/2}
        mark(label,{type:'nemo-card',title:group.name.charAt(0)+group.name.slice(1).toLowerCase(),author:group.sub+'.',action:'READ'});
      }
      buildOrgan(cx+4.4,cz+d/2,atlantis[0]||null);
      buildTable(cx,cz+1.4);
      buildDivans(cx,cz-2.3);
      // Dials either side of the great panel: the manometer, and the motto over the Captain's N.
      for(const [sx,key] of [[-5.2,'gauge'],[5.2,'motto']]){
        const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#efe6cf';c.beginPath();c.arc(W/2,H/2,W/2-4,0,7);c.fill();c.strokeStyle='#2a2018';c.lineWidth=3;c.stroke();c.fillStyle='#2a2018';c.textAlign='center';
          if(key==='gauge'){for(let i=0;i<12;i++){const a=-Math.PI*.75+i*Math.PI*1.5/11;c.fillRect(W/2+Math.cos(a)*W*.36-2,H/2+Math.sin(a)*H*.36-2,4,4)}c.font='bold 14px Georgia';c.fillText('ATMOSPHÈRES',W/2,H*.72);c.strokeStyle='#8a1a1a';c.lineWidth=3;c.beginPath();c.moveTo(W/2,H/2);c.lineTo(W*.72,H*.3);c.stroke()}
          else{c.font='bold 64px Georgia';c.fillText('N',W/2,H*.62);c.font='italic 15px Georgia';c.fillText(VERNE.motto,W/2,H*.82)}},160,160));
        const dial=add(own(new THREE.CircleGeometry(.42,28)),own(new THREE.MeshStandardMaterial({map,emissive:0x302010,emissiveIntensity:.3,roughness:.4})),cx+sx,2.4,northZ+.17,root);mark(dial,card(key));
        const rim=add(own(new THREE.TorusGeometry(.44,.04,6,28)),brass,cx+sx,2.4,northZ+.18,root);
      }
      // One lamp, a cool electric light over the table; the globes glow without lights of their own.
      const lamp=new THREE.PointLight(0xdfe8ff,10,22,2);lamp.position.set(cx,h-1.2,cz+.4);root.add(lamp);
      // The hatch back to the Extraordinary Voyages.
      const exit={type:'nemo-exit',title:'The hatch',author:'Back up through the model, to the Extraordinary Voyages.',action:'CLIMB UP'};
      if(!doorKit?.hang(root,{data:exit,mark,x:cx,z:cz+d/2-.2,yaw:Math.PI,label:'THE EXTRAORDINARY VOYAGES',own,style:'iron',width:1.6,height:2.8}))mark(box(1.6,2.8,.16,own(new THREE.MeshStandardMaterial({color:0x2a2a2a,metalness:.6,roughness:.4})),cx,1.4,cz+d/2-.2,root),exit);
      scene.add(root);
    }
    // Where a shelf's books stand: along its wall, a distance from its middle, facing into the room.
    function shelfSpot(group,offset,inset=.32){
      const {cx,cz,w,d}=ROOM;
      if(group.wall==='south')return {x:cx+group.along-offset,z:cz+d/2-inset,yaw:Math.PI};
      const sd=group.wall==='west'?-1:1;return {x:cx+sd*(w/2-inset),z:cz+group.along-sd*offset,yaw:-sd*Math.PI/2};
    }
    // The great panel: the sea behind two crystal plates bound with copper, iron shutters that slide aside, and fish going
    // by. A second view, the drowned city, is drawn for when the organ is played.
    function buildWindow(x,wallZ){
      const {w:ww,h:wh,y:wy}=WINDOW;
      const deep=own(canvasTexture((c,W,H)=>drawSea(c,W,H),512,256)),city=own(canvasTexture((c,W,H)=>drawAtlantis(c,W,H),512,256));
      const shafts=own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);for(let i=0;i<9;i++){const sx=(i*61+20)%W,g=c.createLinearGradient(sx,0,sx+30,H);g.addColorStop(0,'rgba(170,230,255,.35)');g.addColorStop(1,'rgba(170,230,255,0)');c.fillStyle=g;c.beginPath();c.moveTo(sx,0);c.lineTo(sx+18,0);c.lineTo(sx+70,H);c.lineTo(sx+30,H);c.fill()}
        c.fillStyle='rgba(220,240,255,.5)';for(let i=0;i<120;i++)c.fillRect((i*97)%W,(i*53)%H,1.5,1.5)},256,256));
      shafts.wrapS=THREE.RepeatWrapping;
      const view=own(new THREE.MeshBasicMaterial({map:deep}));
      add(own(new THREE.PlaneGeometry(ww+.4,wh+.4)),view,x,wy,wallZ-.4,root);
      const glow=own(new THREE.MeshBasicMaterial({map:shafts,transparent:true,opacity:.6,depthWrite:false,blending:THREE.AdditiveBlending}));
      add(own(new THREE.PlaneGeometry(ww,wh)),glow,x,wy,wallZ-.3,root);
      // Fish: small dark shapes on one texture, swimming across, wrapping round inside the panel.
      const fishMap=own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);c.fillStyle='rgba(20,40,52,.85)';c.beginPath();c.ellipse(W*.45,H/2,W*.32,H*.28,0,0,7);c.fill();c.beginPath();c.moveTo(W*.74,H/2);c.lineTo(W*.95,H*.2);c.lineTo(W*.95,H*.8);c.fill()},64,32));
      const fishMat=own(new THREE.MeshBasicMaterial({map:fishMap,transparent:true,depthWrite:false})),fishGeo=own(new THREE.PlaneGeometry(.5,.25)),fish=[];
      for(let i=0;i<11;i++){const f=add(fishGeo,fishMat,x,wy,wallZ-.34+i*.004,root),s=.5+((i*37)%10)/10;f.scale.set(s,s,1);fish.push({mesh:f,y:wy-wh/2+.3+((i*0.61)%1)*(wh-.6),speed:(.25+((i*13)%7)/14)*(i%3?1:-1),phase:(i*1.7)%ww,bob:i*.9})}
      // The crystal, its copper bands, and the brass frame.
      add(own(new THREE.PlaneGeometry(ww,wh)),own(new THREE.MeshStandardMaterial({color:0x9fc8d8,transparent:true,opacity:.12,roughness:.05,metalness:.2,depthWrite:false})),x,wy,wallZ-.16,root);
      const copper=own(new THREE.MeshStandardMaterial({color:0xb06a3a,metalness:.7,roughness:.35})),brass=MAT.brass||copper;
      for(const bx of [-ww/6,ww/6])box(.07,wh,.06,copper,x+bx,wy,wallZ-.12,root);box(ww,.07,.06,copper,x,wy,wallZ-.12,root);
      for(const [fw,fh,px,py] of [[ww+.3,.15,0,wh/2+.07],[ww+.3,.15,0,-wh/2-.07],[.15,wh+.3,-ww/2-.07,0],[.15,wh+.3,ww/2+.07,0]])box(fw,fh,.12,brass,x+px,wy+py,wallZ+.12,root);
      // The iron shutters, closed when the reader comes aboard; they slide into the wall either side.
      const iron=own(new THREE.MeshStandardMaterial({color:0x2c2f33,metalness:.7,roughness:.45})),shutters=[];
      for(const sx of [-1,1]){const s=box(ww/2,wh,.06,iron,x+sx*ww/4,wy,wallZ-.06,root);for(const ry of [-.9,0,.9])box(ww/2-.1,.05,.03,brass,0,ry,.04,s);shutters.push({mesh:s,sx})}
      const data={type:'nemo-window',title:'The great panel',author:'Iron shutters over two crystal plates. Behind them, the sea.',action:'OPEN'};
      mark(shutters[0].mesh,data);mark(shutters[1].mesh,data);
      const hit=add(own(new THREE.PlaneGeometry(ww,wh)),own(new THREE.MeshBasicMaterial({visible:false})),x,wy,wallZ+.02,root);mark(hit,data);
      sea={view,deep,city,shafts,glow,fish,shutters,x,wallZ,open:0,target:0,showing:'sea',queue:null,hit,data};
      block(x,wallZ+.5,ww+.6,.6);
    }
    function drawSea(c,W,H){
      const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1b6f86');g.addColorStop(.55,'#0d3b52');g.addColorStop(1,'#06202e');c.fillStyle=g;c.fillRect(0,0,W,H);
      // The sea floor: sand, rocks, and fronds of weed.
      c.fillStyle='#1f3a3a';c.beginPath();c.moveTo(0,H*.86);for(let x=0;x<=W;x+=16)c.lineTo(x,H*(.84+.04*Math.sin(x*.03)));c.lineTo(W,H);c.lineTo(0,H);c.fill();
      c.fillStyle='#16282c';for(const [rx,rr] of [[70,30],[210,22],[400,36],[470,18]]){c.beginPath();c.arc(rx,H*.9,rr,Math.PI,0);c.fill()}
      c.strokeStyle='#2f5a3a';c.lineWidth=3;for(let i=0;i<14;i++){const sx=(i*37+12)%W;c.beginPath();c.moveTo(sx,H*.9);c.bezierCurveTo(sx-8,H*.7,sx+10,H*.6,sx-4,H*(.45+(i%4)*.05));c.stroke()}
      c.fillStyle='#c8a0b0';for(let i=0;i<10;i++){c.beginPath();c.arc((i*53+30)%W,H*.92,3+i%3,0,7);c.fill()}
    }
    function drawAtlantis(c,W,H){
      // Lit from below by the volcano, as Verne saw it: a ruined town, temples fallen, columns on the ground, and the rock.
      const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a1c26');g.addColorStop(.6,'#3a2418');g.addColorStop(1,'#6a2a10');c.fillStyle=g;c.fillRect(0,0,W,H);
      const lava=c.createRadialGradient(W*.78,H*.3,4,W*.78,H*.4,W*.4);lava.addColorStop(0,'rgba(255,150,60,.9)');lava.addColorStop(1,'rgba(255,90,20,0)');c.fillStyle=lava;c.fillRect(0,0,W,H);
      c.fillStyle='#1a0e0a';c.beginPath();c.moveTo(W*.62,H*.66);c.lineTo(W*.78,H*.2);c.lineTo(W*.95,H*.66);c.fill();
      c.fillStyle='#24140e';c.fillRect(0,H*.7,W,H*.3);
      // A temple front with a broken pediment, standing columns and fallen ones, and an aqueduct.
      c.fillStyle='#4a2c1c';for(let i=0;i<6;i++){if(i===2)continue;c.fillRect(W*.12+i*20,H*.42,9,H*.28)}c.beginPath();c.moveTo(W*.1,H*.42);c.lineTo(W*.22,H*.32);c.lineTo(W*.3,H*.4);c.lineTo(W*.3,H*.42);c.fill();
      for(let i=0;i<5;i++){c.save();c.translate(W*(.36+i*.05),H*.76);c.rotate(.2+i*.3);c.fillRect(-14,-4,28,8);c.restore()}
      for(let i=0;i<5;i++){c.fillRect(W*.42+i*26,H*.5,6,H*.2);c.beginPath();c.arc(W*.42+i*26+16,H*.5,10,Math.PI,0);c.lineWidth=5;c.strokeStyle='#4a2c1c';c.stroke()}
      // The rock of black basalt, and the word.
      c.fillStyle='#0c0a0a';c.beginPath();c.moveTo(W*.22,H*.98);c.lineTo(W*.25,H*.74);c.lineTo(W*.52,H*.72);c.lineTo(W*.56,H*.98);c.fill();
      c.fillStyle='#ece6d8';c.font='bold 26px Georgia';c.textAlign='center';c.fillText('ATLANTIS',W*.39,H*.88);
    }
    // Nemo's organ, against the south wall east of the hatch: a console of ebony, a keyboard, pipes of brass above.
    function buildOrgan(x,wallZ,book){
      const z=wallZ-.55,brass=MAT.brass||own(new THREE.MeshStandardMaterial({color:0xb8913e,metalness:.7,roughness:.35})),ebony=own(new THREE.MeshStandardMaterial({color:0x221622,roughness:.4}));
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);
      const parts=[box(2.4,1,.8,ebony,0,.5,0,g),box(2.4,.08,.5,ebony,0,1.02,-.1,g)];
      const keysMap=own(canvasTexture((c,W,H)=>{c.fillStyle='#efe8d8';c.fillRect(0,0,W,H);c.fillStyle='#2a2420';for(let i=0;i<=28;i++)c.fillRect(i*W/28,0,1,H);for(let i=0;i<28;i++){if([0,1,3,4,5].includes(i%7))c.fillRect((i+.65)*W/28,0,W/28*.7,H*.62)}},512,64));
      parts.push(add(own(new THREE.PlaneGeometry(2.1,.22)),own(new THREE.MeshStandardMaterial({map:keysMap,roughness:.5})),0,1.065,-.18,g));parts.at(-1).rotation.x=-Math.PI/2;
      // The pipes, tallest in the middle.
      for(let i=0;i<13;i++){const t=Math.abs(i-6)/6,len=1.4+1.4*(1-t);parts.push(add(own(new THREE.CylinderGeometry(.06,.06,len,10)),brass,-1.08+i*.18,1.3+len/2,.3,g))}
      box(2.6,.12,.9,ebony,0,1.28,.25,g);
      const desk=box(.9,.5,.04,ebony,0,1.45,-.02,g);desk.rotation.x=-.25;parts.push(desk);
      const data={type:'nemo-organ',title:'The organ',author:VERNE.keys,action:'PLAY'};for(const part of parts)mark(part,data);
      let mesh=null;
      if(book){mesh=add(own(new THREE.BoxGeometry(.42,.56,.04)),own(bookMaterial(book)),0,1.5,-.06,g);mesh.rotation.order='YXZ';mesh.rotation.x=-.25;mesh.rotation.y=Math.PI;mesh.visible=false;
        mesh.userData={type:'book',book,loaded:false,nemo:true,shelf:'atlantis',home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:g}}}
      organ={group:g,book:mesh,found:false,playing:0};
      block(x,z,2.8,1.1);
      if(wasFound())reveal(true);
    }
    // The great table, with pamphlets and old newspapers, and a chambered nautilus shell on them.
    function buildTable(x,z){
      const wood=own(new THREE.MeshStandardMaterial({color:0x2a1a26,roughness:.4})),paper=own(new THREE.MeshStandardMaterial({color:0xe8dfc8,roughness:.9}));
      const top=box(3.2,.08,1.4,wood,x,.92,z,root);for(const sx of [-1.45,1.45])for(const sz of [-.55,.55])box(.1,.88,.1,wood,x+sx,.44,z+sz,root);block(x,z,3.4,1.6);mark(top,card('table'));
      for(let i=0;i<6;i++){const p=box(.42,.012,.3,paper,x-1.1+i*.42,.97+(i%3)*.012,z+((i*7)%5-2)*.08,root);p.rotation.y=(i%4-1.5)*.2;mark(p,card('table'))}
      const shell=add(own(new THREE.TorusGeometry(.13,.08,10,20,Math.PI*1.7)),own(new THREE.MeshStandardMaterial({color:0xf0e2cc,roughness:.35,metalness:.15})),x+.9,1.05,z-.2,root);shell.rotation.x=-Math.PI/2.4;mark(shell,card('shell'));
    }
    // Two brown leather divans facing the great panel: the library's own seats.
    function buildDivans(x,z){
      const leather=own(new THREE.MeshStandardMaterial({color:0x5a3420,roughness:.6}));
      for(const side of [-1,1]){
        const g=new THREE.Group();g.position.set(x+side*1.9,0,z);root.add(g);
        const seat=box(2.2,.42,.85,leather,0,.3,0,g),back=box(2.2,.6,.18,leather,0,.75,.38,g);for(const ax of [-1.05,1.05])box(.16,.55,.85,leather,ax,.5,0,g);block(x+side*1.9,z,2.4,1);
        if(registerSeat){const data=registerSeat([seat,back],g,new THREE.Vector3(0,1.2,.05),0,{title:'A leather divan',author:'Sit before the great panel and read one of the salon’s books. '+VERNE.silence});
          Object.defineProperty(data,'bookIds',{get:()=>books.map(mesh=>mesh.userData.book.id),configurable:true});ours.push(seat,back)}
      }
    }
    function reveal(quiet){
      if(!organ||organ.found)return;organ.found=true;
      if(organ.book){organ.book.visible=true;interactables.push(organ.book);ours.push(organ.book);books.push(organ.book)}
    }
    function placeBook(book,spot,geometry,shelf){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,root);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw;mesh.rotation.x=-.08;
      mesh.userData={type:'book',book,loaded:false,nemo:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh;
    }

    // ---------- walking ----------
    function contains(x,z){return x>ROOM.cx-ROOM.w/2&&x<ROOM.cx+ROOM.w/2&&z>ROOM.cz-ROOM.d/2&&z<ROOM.cz+ROOM.d/2}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      if(!contains(x,z))return false;const r=player.radius||.42;
      if(x-r<ROOM.cx-ROOM.w/2+.45||x+r>ROOM.cx+ROOM.w/2-.45||z-r<ROOM.cz-ROOM.d/2+.45||z+r>ROOM.cz+ROOM.d/2-.45)return false;
      return !blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ);
    }

    // ---------- doing things ----------
    function setPanels(open){if(!sea)return;sea.target=open?1:0;sea.data.action=open?'CLOSE':'OPEN';playSample?.('doorOpen',.5,.55)}
    function play(){if(!tone)return 0;const beat=.5;let at=0;for(const [freq,beats] of TUNE){tone(freq,at,beats*beat+.25,.06,'organ');tone(freq/2,at,beats*beat+.25,.03,'organ');at+=beats*beat}tone(BLACK_KEYS[0]/4,0,at+.6,.035,'organ');return at}
    function enter(){
      activate();move(ROOM.cx,ROOM.cz+ROOM.d/2-1.6,0);playSample?.('doorOpen',.6,.7);
      if(sea){sea.showing='sea';sea.view.map=sea.deep;sea.view.needsUpdate=true;sea.open=0;sea.target=0;opening=time+1.4}
      showNotice('Captain Nemo’s Salon, aboard the Nautilus. Tales of the deep on the left, the naturalists of the sea on the right, Atlantis and sunken gold by the hatch; and the panels are opening.',10);
      analytics?.track('Room Explored',{room:'nemo-room'});
    }
    function leave(){
      toVerne?.();move(BACK.x,BACK.z,BACK.yaw);playSample?.('doorOpen',.6,.9);showNotice('The Extraordinary Voyages again. In the model, the salon windows are still lit.',5);
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('nemo-'))return false;
      if(data.type==='nemo-model'){enter();return true}
      if(data.type==='nemo-exit'){doorKit&&data.kit?doorKit.pass(data.kit,data,leave):leave();return true}
      if(data.type==='nemo-window'){const open=sea&&sea.target<.5;setPanels(open);showNotice(open?VERNE.panels+' '+VERNE.light:'The iron shutters slide back over the crystal.',open?12:4);return true}
      if(data.type==='nemo-organ'){
        const length=play()||6;
        const first=!organ?.found;reveal(false);try{storage?.setItem(FOUND_KEY,'1')}catch(e){}
        // The panels close while he plays, and open on the drowned city.
        if(sea){sea.target=0;sea.queue={at:time+Math.min(4,length*.5),view:'atlantis'}}
        showNotice(`${VERNE.keys} The panels close while the organ plays, and when they open again the sea is lit red from below, over a ruined town. ${VERNE.chalk}.${first?' On the music desk there is a book.':''}`,18);
        if(first)analytics?.track('Secret Found',{secret:'nemo-atlantis'});return true;
      }
      if(data.type==='nemo-card'){showNotice(`${data.title}: ${data.author}`,10);return true}
      return false;
    }

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      // Its lamp is marked freed, so the light budget lets it go.
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;sea=null;organ=null;opening=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0;
    }
    function update(t){
      const dt=Math.min(.1,Math.max(0,t-time));time=t;const inside=contains(player.pos.x,player.pos.z),near=Math.hypot(player.pos.x-model.x,player.pos.z-model.z)<PRELOAD;
      if(inside||near)activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==root&&b.parent!==organ?.group))unload();
      if(!inside||!sea)return;
      if(opening!==null&&t>=opening){opening=null;setPanels(true)}
      // The organ's view: once the panels have closed, change what is behind them and open again; after a while, the sea.
      if(sea.queue&&t>=sea.queue.at&&sea.open<.05){const view=sea.queue.view;sea.showing=view;sea.view.map=view==='atlantis'?sea.city:sea.deep;sea.view.needsUpdate=true;sea.queue=view==='atlantis'?{at:t+45,view:'sea'}:null;sea.target=1}
      else if(sea.queue&&t>=sea.queue.at&&sea.queue.view==='sea'){sea.target=0;sea.queue.at=t+1.6}
      // The shutters slide.
      sea.open+=Math.sign(sea.target-sea.open)*Math.min(Math.abs(sea.target-sea.open),dt/1.6);
      for(const s of sea.shutters)s.mesh.position.x=sea.x+s.sx*(WINDOW.w/4+sea.open*WINDOW.w/2);
      // Light moving in the water, and the fish.
      if(sea.shafts.offset)sea.shafts.offset.x=(t*.01)%1;sea.glow.opacity=sea.showing==='sea'?.45+.15*Math.sin(t*.7):0;
      for(const f of sea.fish){const span=WINDOW.w-.6,u=((f.phase+t*f.speed)%span+span)%span;f.mesh.position.x=sea.x-span/2+u;f.mesh.position.y=f.y+.06*Math.sin(t*1.3+f.bob);f.mesh.scale.x=Math.abs(f.mesh.scale.x)*(f.speed>0?-1:1);f.mesh.visible=sea.showing==='sea'}
    }
    return {contains,floorAt,allowed,interact,update,enter,activate,unload,catalogue,room:ROOM,groups:GROUPS,verne:VERNE,tune:TUNE,blackKeys:BLACK_KEYS,back:BACK,
      get built(){return !!root},get books(){return books.slice()},get atlantisSeen(){return !!organ?.found},get panels(){return sea?{open:sea.open,target:sea.target,showing:sea.showing}:null},zoneAt:(x,z)=>contains(x,z)?'nemo-room':null};
  };
})();
