// The Waterford room (28 November 2026, the owner's own county): a first-floor room in a Georgian house on the Mall at
// night, at the end of the Britain and Ireland quarter's hall (passages.js hangs its door, in the south wall). The tall
// window looks along the Quay to Reginald's Tower, painted. A marble chimneypiece in the west wall with Robert Boyle over
// it; four shelves (the saints of the Déise and Lismore either side of the fire; Waterford people and the city's history
// on the east wall); Maclise's Marriage of Strongbow and Aoife on the south wall; Meagher (1848) and Tyrone Power either
// side of the window; a case of old Waterford glass; Boyle's air pump on a pedestal; and on the table the tricolour,
// folded, and a small iron hand-bell. A crystal chandelier is the room's one light.
//
// The secret is the bell. Rung, it shows the window Ardmore by night for a moment, where a stone on the strand is said to
// have carried Declan's bell over the sea; and O'Brien's Round Towers of Ireland, wrong about all of them, is left on the
// table, found for good (athenaeum-waterford-ardmore; ?ardmore shows it). Cards say only what is well attested, and
// quote nobody. Pictures (assets/pictures/waterford-*, fetched by scripts/fetch-maps.mjs and looked at) open large.
(function(){
  'use strict';

  const OWN={lismore:[2272]};
  const GROUPS=[
    {key:'deise',name:'THE SAINTS OF THE DÉISE',sub:'Declan of Ardmore and Mochuda of Lismore',wall:'west',along:-3.3,length:3.4,ids:[]},
    {key:'lismore',name:'LISMORE',sub:'Robert Boyle, born there, and Raleigh, who held it',wall:'west',along:3.3,length:3.4,ids:OWN.lismore},
    {key:'people',name:'WATERFORD PEOPLE',sub:'Tyrone Power, Meagher and Redmond',wall:'east',along:-2.6,length:4.8,ids:[]},
    {key:'history',name:'THE CITY AND ITS VISITORS',sub:'The Normans, the travellers and the glass',wall:'east',along:2.75,length:4.4,ids:[]}
  ];
  const PICTURES={
    strongbow:{file:'waterford-strongbow',credit:'Daniel Maclise, The Marriage of Strongbow and Aoife, about 1854. National Gallery of Ireland. Public domain, from Wikimedia Commons.'},
    meagher:{file:'waterford-meagher',credit:'Thomas F. Meagher, lithograph, 1848. Library of Congress. Public domain, from Wikimedia Commons.'},
    power:{file:'waterford-power',credit:'Tyrone Power in the character of Major O’Dogherty, lithograph published in New York. Public domain, from Wikimedia Commons.'},
    boyle:{file:'waterford-boyle',credit:'The Shannon portrait of Robert Boyle, about 1689. Public domain, from Wikimedia Commons.'},
    airpump:{file:'waterford-airpump',credit:'Robert Boyle, New Experiments Physico-Mechanicall, Touching the Spring of the Air, 1660: the plate of his pneumatical engine. Public domain, from Wikimedia Commons.'}
  };
  const CARDS={
    sign:['The Waterford room','Port Láirge: Waterford, founded by the Norse on the Suir in the tenth century and proud to be called Ireland’s oldest city, and its county, the Déise. Its saints, its scientist, its players and its patriots, in a room on the Mall.'],
    window:['The window on the Quay','The Quay at night, along the Suir, and at its end Reginald’s Tower: a round stone tower on the line of the old town wall, called Ireland’s oldest civic building, and the only monument in an Irish city that keeps a Norse name. It has been a fortress, a prison, a mint and a store. Painted for the library.'],
    strongbow:['The Marriage of Strongbow and Aoife','Richard de Clare, called Strongbow, took Waterford in August 1170 for Dermot MacMurrough, king of Leinster, and married Dermot’s daughter Aoife there, as he had been promised. Daniel Maclise of Cork painted the wedding among the dead of the battle in 1854; the painting is in the National Gallery of Ireland. It is a Victorian imagining, crowded and theatrical, not a record.'],
    meagher:['Thomas Francis Meagher','Born on the Quay in 1823, the son of a mayor of Waterford. A Young Irelander, he was sentenced to death after the rising of 1848, transported to Van Diemen’s Land instead, escaped to America, led the Irish Brigade in the Civil War, and died in Montana in 1867. A lithograph of 1848.'],
    power:['Tyrone Power','Born near Kilmacthomas in 1797, the actor who made his name in Irish comic parts, shown here as Major O’Dogherty in St Patrick’s Eve, a play he wrote himself. He was lost at sea in 1841 on the steamship President. His books about America are on the shelf.'],
    boyle:['Robert Boyle','Born at Lismore Castle on 25 January 1627, the fourteenth child of Richard Boyle, Earl of Cork; one of the founders of experimental science and of the Royal Society, and of Boyle’s law. He never married and died in London in 1691. A portrait of about 1689.'],
    airpump:['Boyle’s air pump','A model of the pneumatical engine Robert Hooke built for Boyle in 1659: a glass globe that could be pumped empty of air, to see what happened to a flame, a bell, a feather or a mouse inside. Boyle published the experiments in 1660. Look closer at his own plate of it.'],
    glass:['Old Waterford glass','George and William Penrose opened their glassworks on the quay at Waterford in 1783, and its cut decanters and glasses became famous. The works closed in 1851. The name was made again in the city from 1947.'],
    flag:['A tricolour, folded','Green, white and orange. Waterford remembers 7 March 1848 as the day Thomas Francis Meagher flew a tricolour from the Wolfe Tone Confederate Club at 33 The Mall, and a plaque there says so; some historians now doubt it was the first. That April he brought one home from Paris and presented it in Dublin. It has been the flag of Ireland since 1937.'],
    fire:['The fire','A coal fire in a white marble chimneypiece, of the kind the Georgian houses of the Mall were built with.'],
    bell:['A small iron bell','A hand-bell of the kind the early Irish saints carried, square-sided, of riveted iron. The library cannot say whose it is.'],
    bellFound:['Declan’s bell','Ardmore says its saint’s bell was left behind on a rock in Wales, and that the rock floated after him over the sea to Ardmore, where it lies on the strand still, and people crawl under it on his feast day, 24 July. The bell is silent now.']
  };
  const FOUND_KEY='athenaeum-waterford-ardmore';

  window.createWaterfordRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,move,analytics,isHolding=()=>false,registerSeat=null,tone=null,
      showPicture=null,storage=null,search='',pictures='assets/pictures/'}=options;
    const ROOM={cx:3000,cz:900,w:14,d:11,h:4.6};
    const KEEP=25;
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||/[?&]ardmore\b/.test(search)}catch(e){return false}};
    let root=null,time=0,lastNeeded=-1e9,win=null,fire=null,bell=null,chandelier=null;
    const owned=[],ours=[],books=[],blockers=[],seatIds=[];
    const own=thing=>{owned.push(thing);return thing};
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'waterford-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#eae3cf';c.fillRect(0,0,W,H);c.strokeStyle='#2c4a3a';c.lineWidth=4;c.strokeRect(7,7,W-14,H-14);
        c.fillStyle='#1f2a22';c.textAlign='center';let size=29;c.font=`bold ${size}px Georgia`;while(c.measureText(text).width>W-30&&size>16){size-=2;c.font=`bold ${size}px Georgia`}
        c.fillText(text,W/2,sub?52:H/2+11);if(sub){c.font='italic 20px Georgia';c.fillText(sub,W/2,85)}},620,sub?104:70));
      return add(own(new THREE.PlaneGeometry(w,h)),std({map,emissive:0x2c2a22,emissiveIntensity:.25,roughness:.9}),x,y,z,parent)}
    const shelfBooks=(ids,room,max)=>[...new Set([...ids,...(arrivals[room]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,max);
    function catalogue(){return {groups:GROUPS.map(group=>({...group,books:shelfBooks(group.ids,group.key,group.wall==='east'?8:6)})),tower:shelfBooks([],'tower',1)}}

    // ---------- the room ----------
    function buildRoom(){
      root=new THREE.Group();root.name='waterford-room';const {cx,cz,w,d,h}=ROOM,x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2;
      // Georgian: green-grey panelled walls, a white cornice and dado rail, deal boards under a Turkey carpet, a plaster ceiling.
      const paint=std({color:0x8a9a88,roughness:.9}),white=std({color:0xe9e4d8,roughness:.7}),dark=MAT.darkWood||std({color:0x3a2616,roughness:.7});
      box(w,.3,d,MAT.wood||dark,cx,-.15,cz,root);box(w,.2,d,white,cx,h+.1,cz,root);
      box(w,h,.3,paint,cx,h/2,z0,root);box(w,h,.3,paint,cx,h/2,z1,root);box(.3,h,d,paint,x0,h/2,cz,root);box(.3,h,d,paint,x1,h/2,cz,root);
      for(const [bx,bz,bw,bd] of [[cx,z0+.18,w,.06],[cx,z1-.18,w,.06],[x0+.18,cz,.06,d],[x1-.18,cz,.06,d]]){box(bw,.95,bd,white,bx,.48,bz,root);box(bw,.2,bd*2,white,bx,h-.1,bz,root)}
      const carpet=own(canvasTexture((c,W,H)=>{c.fillStyle='#5a1a1c';c.fillRect(0,0,W,H);c.strokeStyle='#c9a24a';c.lineWidth=10;c.strokeRect(16,16,W-32,H-32);c.strokeStyle='#1f3a5a';c.lineWidth=18;c.strokeRect(44,44,W-88,H-88);
        c.fillStyle='#8a2a24';for(let y=110;y<H-90;y+=90)for(let x=110;x<W-90;x+=90){c.beginPath();c.moveTo(x,y-26);c.lineTo(x+26,y);c.lineTo(x,y+26);c.lineTo(x-26,y);c.fill()}},512,384));
      add(own(new THREE.PlaneGeometry(7,5)),std({map:carpet,roughness:1}),cx,.006,cz+.4,root).rotation.x=-Math.PI/2;
      mark(sign(root,'THE WATERFORD ROOM','Port Láirge · the Déise',3,.5,cx,h-.55,z1-.17),card('sign')).rotation.y=Math.PI;
      buildWindow(cx,z0);
      buildFireplace(x0,cz);
      // The shelves: two rows on each run, under its own label.
      const {groups,tower}=catalogue(),geometry=own(new THREE.BoxGeometry(.66,.92,.12)),ROWS=[1.4,2.5];
      for(const group of groups){
        if(!group.books.length)continue;
        const per=Math.max(1,Math.ceil(group.books.length/2)),step=Math.min(1.1,(group.length-.4)/per),side=group.wall==='west'?-1:1,x=cx+side*(w/2-.3),zc=cz+group.along;
        group.books.forEach((book,i)=>{const row=i<per?0:1,n=row?group.books.length-per:per,col=row?i-per:i,offset=(col-(n-1)/2)*step;
          placeBook(book,{x,y:ROWS[row],z:zc+side*-offset,yaw:-side*Math.PI/2},geometry,group.key)});
        for(const y of ROWS)box(.34,.05,group.length,dark,cx+side*(w/2-.33),y-.48,zc,root);block(cx+side*(w/2-.33),zc,.7,group.length+.2);
        const label=sign(root,group.name,group.sub,Math.min(2.9,group.length-.2),.46,cx+side*(w/2-.17),3.4,zc);label.rotation.y=-side*Math.PI/2;
        mark(label,{type:'waterford-card',title:group.name.charAt(0)+group.name.slice(1).toLowerCase(),author:group.sub+'.',action:'READ'});
      }
      seatIds.splice(0,seatIds.length,...books.map(b=>b.userData.book.id));
      // The pictures: Maclise's wedding on the south wall, Meagher and Power either side of the window.
      hang('strongbow',cx+2.7,2.35,z1-.17,Math.PI,3.1);
      hang('meagher',cx-3.4,2.3,z0+.17,0,1.05);
      hang('power',cx+3.4,2.3,z0+.17,0,1.05);
      buildGlassCase(cx+5.4,z0+.55);
      buildAirPump(cx-5.4,z0+.6);
      buildTable(cx,cz+.6,tower[0]||null);
      buildChandelier(cx,h,cz+.6);
      scene.add(root);
    }
    // A picture in a gilt frame; it opens large in the picture card. Its texture is the 768-pixel copy.
    function hang(key,x,y,z,yaw,width){
      const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=yaw;root.add(g);const height=width*(key==='strongbow'?.61:1.3);
      const data={type:'waterford-picture',picture:key,title:CARDS[key][0],author:CARDS[key][1],action:'LOOK CLOSELY'};
      const gilt=MAT.brass||std({color:0xb08d3a,metalness:.6,roughness:.4});
      const frame=mark(box(width+.16,height+.16,.05,gilt,0,0,0,g),data);
      const mat=std({color:0x7a7468,roughness:.9}),sheet=mark(add(own(new THREE.PlaneGeometry(width,height)),mat,0,0,.03,g),data);
      try{new THREE.TextureLoader().load(`${pictures}${PICTURES[key].file}-wall.jpg`,texture=>{if(!root)return texture.dispose?.();texture.colorSpace=THREE.SRGBColorSpace;own(texture);mat.map=texture;mat.color?.set?.(0xd8d2c4);mat.needsUpdate=true;
        const image=texture.image;if(image?.width&&image?.height){const k=(image.height/image.width)/(height/width);sheet.scale.y=k;frame.scale.y=(height*k+.16)/(height+.16)}})}catch(e){}
    }
    // The window: the Quay at night along the Suir, and Reginald's Tower at its end; or, for a moment, Ardmore.
    function drawQuay(c,W,H){
      const sky=c.createLinearGradient(0,0,0,H*.6);sky.addColorStop(0,'#08101e');sky.addColorStop(1,'#25344c');c.fillStyle=sky;c.fillRect(0,0,W,H);
      let k=7;const r=()=>(k=(k*9301+49297)%233280)/233280;c.fillStyle='#fff';for(let i=0;i<70;i++){c.globalAlpha=.3+r()*.6;c.fillRect(r()*W,r()*H*.4,1.4,1.4)}c.globalAlpha=1;
      c.fillStyle='#f2ecd2';c.beginPath();c.arc(W*.22,H*.14,13,0,7);c.fill();
      // The far bank, low and dark, with a few lights.
      c.fillStyle='#121a20';c.beginPath();c.moveTo(0,H*.5);for(let x=0;x<=W;x+=16)c.lineTo(x,H*(.46-.04*Math.sin(x/W*3)));c.lineTo(W,H*.56);c.lineTo(0,H*.56);c.fill();
      c.fillStyle='#ffd27a';for(let i=0;i<9;i++)c.fillRect(r()*W,H*(.47+r()*.06),2,2);
      // The river, with the moon and the quay lamps on it.
      const river=c.createLinearGradient(0,H*.56,0,H*.8);river.addColorStop(0,'#1b2a3a');river.addColorStop(1,'#0c141e');c.fillStyle=river;c.fillRect(0,H*.56,W,H*.24);
      c.strokeStyle='rgba(242,236,210,.5)';for(let y=H*.58;y<H*.78;y+=6){c.beginPath();c.moveTo(W*.2,y);c.lineTo(W*.24,y);c.stroke()}
      // Ships at the Quay, their masts against the sky.
      c.strokeStyle='#0a0f16';c.lineWidth=3;for(const [sx,hh] of [[.12,.42],[.3,.36],[.44,.4]]){c.fillStyle='#0a0f16';c.fillRect(W*(sx-.07),H*.74,W*.14,H*.04);for(const m of [-.03,.02]){c.beginPath();c.moveTo(W*(sx+m),H*.74);c.lineTo(W*(sx+m),H*(.74-hh));c.stroke()}}
      // The quay itself, with its lamps, running to the tower.
      c.fillStyle='#2a2a2c';c.fillRect(0,H*.78,W,H*.22);c.fillStyle='#ffcf70';for(let x=W*.06;x<W*.72;x+=W*.11){c.fillRect(x,H*.66,2,H*.12);c.beginPath();c.arc(x+1,H*.655,4,0,7);c.fill()}
      // Reginald's Tower: round, with a conical roof, and lit windows.
      const tx=W*.82,tw=W*.14,top=H*.38;c.fillStyle='#4a4a48';c.fillRect(tx-tw/2,top,tw,H*.42);c.fillStyle='#2e2e30';c.beginPath();c.moveTo(tx-tw/2-4,top);c.lineTo(tx,top-H*.12);c.lineTo(tx+tw/2+4,top);c.fill();
      c.fillStyle='#3e3e3c';for(let x=tx-tw/2;x<tx+tw/2;x+=10)c.fillRect(x,top-6,6,6);c.fillStyle='#ffd27a';c.fillRect(tx-4,top+H*.1,6,10);c.fillRect(tx+12,top+H*.22,5,8);
      c.fillStyle='rgba(20,30,45,.6)';c.font=`italic ${Math.round(H*.03)}px Georgia`;c.textAlign='right';c.fillText('painted for the library',W*.98,H*.97);
    }
    function drawArdmore(c,W,H){
      const sky=c.createLinearGradient(0,0,0,H*.6);sky.addColorStop(0,'#050a14');sky.addColorStop(1,'#1c2840');c.fillStyle=sky;c.fillRect(0,0,W,H);
      let k=3;const r=()=>(k=(k*9301+49297)%233280)/233280;c.fillStyle='#fff';for(let i=0;i<110;i++){c.globalAlpha=.3+r()*.7;c.fillRect(r()*W,r()*H*.5,1.4,1.4)}c.globalAlpha=1;
      c.fillStyle='#f6f0d8';c.beginPath();c.arc(W*.72,H*.16,16,0,7);c.fill();
      // The hill, the round tower with its conical cap, and the roofless cathedral beside it.
      c.fillStyle='#0e1612';c.beginPath();c.moveTo(0,H*.62);c.quadraticCurveTo(W*.3,H*.3,W*.62,H*.5);c.lineTo(W,H*.58);c.lineTo(W,H);c.lineTo(0,H);c.fill();
      c.fillStyle='#1a1e20';c.fillRect(W*.33,H*.12,W*.05,H*.28);c.beginPath();c.moveTo(W*.325,H*.12);c.lineTo(W*.355,H*.04);c.lineTo(W*.385,H*.12);c.fill();
      c.fillRect(W*.42,H*.3,W*.14,H*.1);c.beginPath();c.moveTo(W*.42,H*.3);c.lineTo(W*.45,H*.24);c.lineTo(W*.48,H*.3);c.fill();
      // The sea and the strand, and the stone on it.
      c.fillStyle='#16263a';c.fillRect(0,H*.7,W,H*.3);c.strokeStyle='rgba(246,240,216,.45)';for(let y=H*.72;y<H*.9;y+=7){c.beginPath();c.moveTo(W*.66,y);c.lineTo(W*.78,y);c.stroke()}
      c.fillStyle='#c9bfa6';c.beginPath();c.moveTo(0,H*.86);c.quadraticCurveTo(W*.5,H*.8,W,H*.9);c.lineTo(W,H);c.lineTo(0,H);c.fill();
      c.fillStyle='#5a5650';c.beginPath();c.ellipse(W*.5,H*.86,W*.06,H*.04,0,0,7);c.fill();
    }
    function buildWindow(cx,z0){
      const quay=own(canvasTexture(drawQuay,512,600)),ardmore=own(canvasTexture(drawArdmore,512,600));
      const g=new THREE.Group();g.position.set(cx,2.05,z0+.17);root.add(g);
      const glassMat=std({map:quay,emissive:0xffffff,emissiveMap:quay,emissiveIntensity:.5,roughness:.4});
      const glass=mark(add(own(new THREE.PlaneGeometry(2.2,2.6)),glassMat,0,0,0,g),card('window'));
      const white=std({color:0xeee8da,roughness:.6});
      for(const [fw,fh,px,py] of [[2.42,.12,0,1.36],[2.42,.12,0,-1.36],[.12,2.84,-1.16,0],[.12,2.84,1.16,0],[2.2,.08,0,0]])box(fw,fh,.08,white,px,py,.04,g);
      for(const gx of [-.37,.37])box(.04,2.6,.06,white,gx,0,.04,g);for(const gy of [-.65,.65])box(2.2,.04,.06,white,0,gy,.04,g);
      box(2.6,.08,.4,white,0,-1.44,.16,g);
      win={glassMat,quay,ardmore,until:0};
    }
    // The chimneypiece in the west wall: white marble, a coal fire, and Boyle over the mantel.
    function buildFireplace(x0,z){
      const marble=std({color:0xf0ece2,roughness:.35}),black=std({color:0x161412,roughness:.6,metalness:.3});
      const g=new THREE.Group();g.position.set(x0+.15,0,z);root.add(g);
      const parts=[box(.3,1.3,.28,marble,.15,.65,-.85,g),box(.3,1.3,.28,marble,.15,.65,.85,g),box(.36,.14,2.1,marble,.18,1.36,0,g),box(.3,.26,1.5,marble,.15,1.16,0,g)];
      box(.12,.9,1.2,black,.06,.45,0,g);const embers=box(.3,.16,.7,std({color:0x3a1208,emissive:0xff5a1a,emissiveIntensity:1.4,roughness:.8}),.22,.22,0,g);
      box(.36,.06,1.3,black,.2,.1,0,g);fire=embers.material;
      for(const part of [...parts,embers])mark(part,card('fire'));block(x0+.45,z,.9,2.3);
      hang('boyle',x0+.18,2.55,z,Math.PI/2,1.0);
      // An armchair turned to the fire: one of the library's seats.
      const chair=new THREE.Group();chair.position.set(x0+2.1,0,z+1.5);chair.rotation.y=-Math.PI/2-.5;root.add(chair);
      const leather=std({color:0x4a2a1a,roughness:.7});
      const seat=box(.8,.18,.75,leather,0,.48,0,chair),back=box(.8,.85,.14,leather,0,.95,.33,chair);for(const sx of [-.38,.38])box(.12,.5,.7,leather,sx,.62,0,chair);
      block(x0+2.1,z+1.5,.95,.95);ours.push(seat,back);
      registerSeat?.([seat,back],chair,new THREE.Vector3(0,1.25,.05),-Math.PI/2-.5+Math.PI,{title:'A chair by the fire',author:'Sit by the fire in the Waterford room and read one of its books.',bookIds:seatIds});
    }
    // A glazed cabinet of old Waterford glass: decanters and glasses, cut, catching the chandelier.
    function buildGlassCase(x,z){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);const mahogany=std({color:0x4a2418,roughness:.5}),pane=std({color:0xdfeeea,transparent:true,opacity:.12,roughness:.05,depthWrite:false});
      const crystal=std({color:0xe8f2f4,transparent:true,opacity:.55,roughness:.05,metalness:.1,emissive:0x8aa4b4,emissiveIntensity:.25});
      const data=card('glass');mark(box(1.3,.9,.6,mahogany,0,.45,0,g),data);box(1.3,1.1,.6,pane,0,1.45,0,g);box(1.36,.06,.66,mahogany,0,2.03,0,g);
      for(const sx of [-.64,.64])box(.04,1.1,.6,mahogany,sx,1.45,0,g);box(1.28,.03,.56,mahogany,0,1.45,0,g);
      const shape=pts=>own(new THREE.LatheGeometry(pts.map(([px,py])=>new THREE.Vector2(px,py)),12));
      const decanter=shape([[0,0],[.09,0],[.1,.05],[.09,.14],[.04,.2],[.03,.27],[.04,.29],[0,.29]]),wineglass=shape([[0,0],[.04,0],[.005,.02],[.005,.09],[.035,.1],[.04,.16],[0,.13]]);
      for(const [dx,y] of [[-.38,.92],[.38,.92]]){const m=mark(add(decanter,crystal,dx,y,0,g),data);m.scale.setScalar(1.2)}
      for(let i=0;i<5;i++)mark(add(wineglass,crystal,-.4+i*.2,1.48,.05*(i%2),g),data);
      block(x,z,1.4,.7);
    }
    // Boyle's air pump on a pedestal: a glass globe on a stand over a brass barrel.
    function buildAirPump(x,z){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);const brass=MAT.brass||std({color:0xb08d3a,metalness:.6,roughness:.4}),oak=MAT.darkWood||std({color:0x3a2616,roughness:.7});
      const data={type:'waterford-picture',picture:'airpump',title:CARDS.airpump[0],author:CARDS.airpump[1],action:'LOOK CLOSELY'};
      mark(box(.6,.9,.6,oak,0,.45,0,g),data);for(const [lx,lz] of [[-.18,-.18],[.18,-.18],[0,.2]]){const leg=box(.04,.5,.04,oak,lx,1.15,lz,g);leg.rotation.x=lz*.6;leg.rotation.z=-lx*.6}
      mark(add(own(new THREE.CylinderGeometry(.06,.06,.4,12)),brass,0,1.12,0,g),data);
      mark(add(own(new THREE.SphereGeometry(.2,18,14)),std({color:0xdfeeea,transparent:true,opacity:.35,roughness:.05,depthWrite:false}),0,1.62,0,g),data);
      add(own(new THREE.CylinderGeometry(.03,.03,.12,8)),brass,0,1.86,0,g);block(x,z,.7,.7);
    }
    // The table: the tricolour, folded; the iron bell; and two chairs, the library's seats.
    function buildTable(x,z,towerBook){
      const mahogany=std({color:0x4a2418,roughness:.45});box(2.6,.08,1.2,mahogany,x,.78,z,root);for(const sx of [-1.15,1.15])for(const sz of [-.5,.5])box(.08,.76,.08,mahogany,x+sx,.38,z+sz,root);block(x,z,2.8,1.4);
      const flag=new THREE.Group();flag.position.set(x-.6,.82,z+.05);flag.rotation.y=.2;root.add(flag);const fd=card('flag');
      [[0x169b62,0],[0xf4f4f0,.035],[0xff883e,.07]].forEach(([col,y],i)=>mark(box(.6-i*.04,.035,.42-i*.03,std({color:col,roughness:.95}),0,y+.018,0,flag),fd));
      const b=new THREE.Group();b.position.set(x+.55,.82,z-.1);root.add(b);const iron=std({color:0x3a3430,roughness:.55,metalness:.5});
      const bd={type:'waterford-bell',title:CARDS.bell[0],author:CARDS.bell[1],action:'RING'};
      mark(box(.13,.16,.09,iron,0,.08,0,b),bd);mark(add(own(new THREE.TorusGeometry(.035,.01,6,12,Math.PI)),iron,0,.16,0,b),bd);
      let book=null;
      if(towerBook){book=add(own(new THREE.BoxGeometry(.4,.06,.56)),own(bookMaterial(towerBook)),x+.1,.85,z+.25,root);book.rotation.y=-.3;book.visible=false;
        book.userData={type:'book',book:towerBook,loaded:false,waterford:true,shelf:'tower',home:{position:book.position.clone(),quaternion:book.quaternion.clone(),parent:root}}}
      bell={group:b,data:bd,book,found:false};
      for(const side of [-1,1]){
        const cp=new THREE.Group();cp.position.set(x+side*1.75,0,z);cp.rotation.y=side*Math.PI/2;root.add(cp);
        const seat=box(.5,.06,.48,mahogany,0,.46,0,cp),back=box(.5,.62,.05,mahogany,0,.8,.22,cp);for(const lx of [-.21,.21])for(const lz of [-.2,.2])box(.04,.44,.04,mahogany,lx,.22,lz,cp);
        block(x+side*1.75,z,.65,.65);ours.push(seat,back);
        registerSeat?.([seat,back],cp,new THREE.Vector3(0,1.2,.05),side*Math.PI/2,{title:'A chair at the table',author:'Sit at the table and read one of the Waterford room’s books.',bookIds:seatIds});
      }
      if(wasFound())reveal(true);
    }
    // The chandelier: Waterford crystal, drops as one InstancedMesh; the room's one light.
    function buildChandelier(x,h,z){
      const brass=MAT.brass||std({color:0xb08d3a,metalness:.6,roughness:.4}),g=new THREE.Group();g.position.set(x,h-1.1,z);root.add(g);
      add(own(new THREE.CylinderGeometry(.012,.012,.9,6)),brass,0,.65,0,g);add(own(new THREE.TorusGeometry(.42,.02,6,24)),brass,0,0,0,g).rotation.x=Math.PI/2;
      const drop=own(new THREE.OctahedronGeometry(.035,0)),dropMat=std({color:0xf4fbff,emissive:0xffe8c0,emissiveIntensity:.9,roughness:.05,transparent:true,opacity:.85});
      const n=36,drops=new THREE.InstancedMesh(drop,dropMat,n),m=new THREE.Matrix4();
      for(let i=0;i<n;i++){const a=i/24*Math.PI*2,ring=i<24,rr=ring?.42:.22,y=ring?-.08:-.28;m.makeTranslation(Math.cos(a)*rr,y,Math.sin(a)*rr);drops.setMatrixAt(i,m)}
      drops.instanceMatrix.needsUpdate=true;own(drops);g.add(drops);
      const flameMat=std({color:0xfff0c8,emissive:0xffc070,emissiveIntensity:1.8});for(let i=0;i<6;i++){const a=i/6*Math.PI*2;add(own(new THREE.SphereGeometry(.03,8,6)),flameMat,Math.cos(a)*.42,.08,Math.sin(a)*.42,g)}
      const light=new THREE.PointLight(0xffd6a0,6.5,17,2);light.position.set(x,h-1.3,z);root.add(light);chandelier=g;
    }
    function placeBook(book,spot,geometry,shelf){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,root);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw;mesh.rotation.x=-.08;
      mesh.userData={type:'book',book,loaded:false,waterford:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh;
    }
    function reveal(quiet){
      if(!bell||bell.found)return;bell.found=true;Object.assign(bell.data,{title:CARDS.bellFound[0],author:CARDS.bellFound[1],action:'READ'});
      if(bell.book){bell.book.visible=true;interactables.push(bell.book);ours.push(bell.book);books.push(bell.book)}
      if(!quiet&&win)win.until=time+7;
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
    // Where a reader stands coming in: inside the south door (the quarter's), facing the window.
    const ARRIVAL={x:ROOM.cx-4,z:ROOM.cz+ROOM.d/2-1.6,yaw:0};
    function enter(){
      activate();move(ARRIVAL.x,ARRIVAL.z,ARRIVAL.yaw);playSample?.('doorOpen',.8,.98);
      showNotice('The Waterford room: a room on the Mall at night, the Quay and Reginald’s Tower in the window. The saints of the Déise and Lismore either side of the fire; Waterford people and the city’s history on the right; Strongbow and Aoife behind you.',11);
      analytics?.track('Room Explored',{room:'waterford-room'});
    }
    function ringBell(){
      // An old iron bell: a low strike and its overtones, a little out of tune with each other.
      if(tone){tone(392,0,2.4,.05);tone(931,0,1.6,.02);tone(1279,.01,1.1,.012);tone(1871,.02,.7,.006)}
      if(!bell)return;const first=!bell.found;reveal(false);try{storage?.setItem(FOUND_KEY,'1')}catch(e){}
      showNotice(first?'The bell gives one thin, old note. For a moment the window shows not the Quay but a hill above the sea by night: a round tower, a roofless church, and a stone on the strand below. That is Ardmore. When you look back at the table, a book is lying there that was not there before.':'The bell gives its one thin note, and the window shows Ardmore for a moment.',12);
      if(first)analytics?.track('Secret Found',{secret:'waterford-ardmore'});
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('waterford-'))return false;
      if(data.type==='waterford-bell'){ringBell();return true}
      if(data.type==='waterford-picture'){const p=PICTURES[data.picture];if(showPicture)showPicture({kicker:'THE WATERFORD ROOM',title:data.title,src:`${pictures}${p.file}.jpg`,caption:data.author,credit:p.credit});else showNotice(`${data.title}: ${data.author}`,12);return true}
      if(data.type==='waterford-card'){showNotice(`${data.title}: ${data.author}`,data.author.length>240?15:10);return true}
      return false;
    }

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;win=null;fire=null;bell=null;chandelier=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0;
    }
    function update(t){
      time=t;const inside=contains(player.pos.x,player.pos.z);
      if(inside)activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==root))unload();
      if(!root||!inside)return;
      if(fire)fire.emissiveIntensity=1.25+.3*Math.sin(t*8.3)*Math.sin(t*3.1);
      if(win){const ardmore=t<win.until,map=ardmore?win.ardmore:win.quay;if(win.glassMat.map!==map){win.glassMat.map=win.glassMat.emissiveMap=map;win.glassMat.needsUpdate=true}}
      if(chandelier)chandelier.rotation.y=Math.sin(t*.3)*.03;
    }
    return {contains,floorAt,allowed,interact,update,enter,activate,unload,catalogue,room:ROOM,groups:GROUPS,own:OWN,cards:CARDS,pictures:PICTURES,arrival:ARRIVAL,seatBooks:seatIds,
      get built(){return !!root},get books(){return books.slice()},get found(){return !!bell?.found||wasFound()},zoneAt:(x,z)=>contains(x,z)?'waterford-room':null};
  };
})();
