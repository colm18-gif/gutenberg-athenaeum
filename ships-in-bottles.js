// Ships in bottles: a mahogany shelf in the Long Corridor's east wall, fourth bay (long-corridor.js hands over
// `bottleBay`), with ships in bottles lying in their cradles, each one bound for a small island. Look into a bottle and
// you are on that island's shore; the bottle you came through is there to take you back. The shelf and its bottles are
// built at startup and kept (as Boullée's drawing is), because the corridor's parts come and go with the corridor.
//
// The islands are rooms of their own, which hand the shelf a bottle with `add` (montserrat-room.js, the first). Only
// bottles that lead somewhere are on the shelf: an empty cradle is a cradle, not a bottle that opens on nothing.
(function(){
  'use strict';
  const SLOTS=5;
  window.createShipsInBottles=function(options){
    const {THREE,scene,MAT,interactables,canvasTexture,showNotice,playSample,analytics,corridor=null,isHolding=()=>false}=options;
    const room=corridor?.room||{cx:1700,cz:0,w:5,d:24,h:5.2};
    const BAY={side:'east',bay:corridor?.bottleBay?.bay??3,x:room.cx+room.w/2-.32,z:corridor?.bayZ?.(corridor?.bottleBay?.bay??3)??-2,yaw:-Math.PI/2};
    const SHELF={y:1.32,length:3.1,depth:.3};
    const bottles=[],owned=[];
    const own=thing=>{owned.push(thing);return thing};
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);return object}
    const CARD={type:'bottle-card',title:'Ships in bottles',author:'Each bottle holds a little ship and the island it is bound for. Look into one, and you are on that island’s shore; the bottle is there to bring you back.',action:'READ'};

    // Shared by every bottle: glass, cork, hull, sail and putty sea.
    const mat={glass:std({color:0xd9efe6,transparent:true,opacity:.2,roughness:.05,metalness:.1,depthWrite:false}),cork:std({color:0x9a7448,roughness:.9}),
      hull:std({color:0x3b2414,roughness:.6}),sail:std({color:0xf1e9d4,roughness:.9,side:THREE.DoubleSide}),mast:std({color:0x5a3a1e,roughness:.7}),
      sea:std({color:0x2c5f86,roughness:.5,emissive:0x0b2236,emissiveIntensity:.4}),cradle:MAT.darkWood||std({color:0x3a2416,roughness:.7}),brass:MAT.brass||std({color:0xb08d3a,metalness:.6,roughness:.4})};
    let shelf=null;
    function build(){
      shelf=new THREE.Group();shelf.name='ships-in-bottles';shelf.position.set(BAY.x,0,BAY.z);shelf.rotation.y=BAY.yaw;scene.add(shelf);
      const wood=MAT.darkWood||std({color:0x3a2416,roughness:.7});
      // The shelf on two carved brackets, a back board, and a brass plate above.
      const plank=box(SHELF.length,.05,SHELF.depth,wood,0,SHELF.y,SHELF.depth/2,shelf);mark(plank,CARD);
      box(SHELF.length,.9,.03,wood,0,SHELF.y+.47,.015,shelf);box(SHELF.length+.06,.04,.05,wood,0,SHELF.y+.94,.04,shelf);
      for(const x of [-SHELF.length/2+.18,SHELF.length/2-.18]){box(.05,.28,.2,wood,x,SHELF.y-.16,.11,shelf)}
      const plate=own(canvasTexture((c,W,H)=>{c.fillStyle='#caa15a';c.fillRect(0,0,W,H);c.strokeStyle='#6b4d22';c.lineWidth=5;c.strokeRect(6,6,W-12,H-12);c.fillStyle='#2b1d0e';c.textAlign='center';
        c.font='bold 34px Georgia';c.fillText('SHIPS IN BOTTLES',W/2,50);c.font='italic 21px Georgia';c.fillText('Look in, and you are on its shore',W/2,84)},512,104));
      mark(add(own(new THREE.PlaneGeometry(1.1,.22)),std({map:plate,roughness:.5,metalness:.3}),0,SHELF.y+1.12,.02,shelf),CARD);
      for(let i=0;i<SLOTS;i++)cradle(slotX(i));
    }
    const slotX=i=>-SHELF.length/2+.36+i*(SHELF.length-.72)/(SLOTS-1);
    // A cradle: two notched blocks on a little plinth, waiting for a bottle.
    function cradle(x){const g=new THREE.Group();g.position.set(x,SHELF.y+.025,.15);shelf.add(g);box(.46,.03,.12,mat.cradle,0,.015,0,g);for(const dx of [-.14,.14])box(.04,.07,.1,mat.cradle,dx,.06,0,g);return g}

    // A bottle lying on its side, its neck to the left, with its ship under sail on a putty sea, and the island ahead.
    // `island` draws the island (a hump of green, a cone for a volcano); `label` is lettered on the plinth.
    function bottle(spec,slot){
      const g=new THREE.Group();g.position.set(slotX(slot),SHELF.y+.17,.15);shelf.add(g);const data={type:'bottle',key:spec.key,title:spec.title,author:spec.author,action:'LOOK IN'};
      const body=add(own(new THREE.CylinderGeometry(.085,.085,.38,20,1,true)),mat.glass,0,0,0,g);body.rotation.z=Math.PI/2;
      const shoulder=add(own(new THREE.SphereGeometry(.085,16,10,0,Math.PI*2,0,Math.PI/2)),mat.glass,-.19,0,0,g);shoulder.rotation.z=Math.PI/2;
      const neck=add(own(new THREE.CylinderGeometry(.028,.032,.12,12,1,true)),mat.glass,-.31,0,0,g);neck.rotation.z=Math.PI/2;
      add(own(new THREE.CircleGeometry(.085,20)),mat.glass,.19,0,0,g).rotation.y=Math.PI/2;
      const cork=add(own(new THREE.CylinderGeometry(.026,.022,.05,10)),mat.cork,-.39,0,0,g);cork.rotation.z=Math.PI/2;
      // Inside: the sea, the island and the ship.
      const sea=add(own(new THREE.BoxGeometry(.34,.012,.13)),mat.sea,0,-.05,0,g);
      const land=std({color:spec.land||0x3f6b35,roughness:.9});
      for(const [dx,r,hgt] of spec.island||[[.1,.05,.05]]){const hill=add(own(new THREE.ConeGeometry(r,hgt,10)),land,dx,-.045+hgt/2,-.02,g);hill.userData=data}
      if(spec.smoke){const plume=add(own(new THREE.SphereGeometry(.018,8,6)),std({color:0x9a958c,roughness:1,transparent:true,opacity:.75}),spec.smoke[0],-.045+spec.smoke[1],-.02,g);plume.scale.set(1.4,1,1)}
      const ship=new THREE.Group();ship.position.set(-.07,-.035,.02);g.add(ship);
      box(.12,.022,.035,mat.hull,0,0,0,ship);box(.03,.02,.034,mat.hull,-.05,.012,0,ship);
      for(const [mx,mh] of [[-.03,.085],[.02,.1],[.055,.07]]){add(own(new THREE.CylinderGeometry(.002,.002,mh,4)),mat.mast,mx,mh/2,0,ship);
        for(let k=0;k<2;k++){const s=add(own(new THREE.PlaneGeometry(.034-k*.006,.026)),mat.sail,mx,mh*.42+k*.03,.002,ship);s.userData=data}}
      // The plinth's label.
      const label=own(canvasTexture((c,W,H)=>{c.fillStyle='#e9dcb8';c.fillRect(0,0,W,H);c.strokeStyle='#6b4d22';c.lineWidth=3;c.strokeRect(4,4,W-8,H-8);c.fillStyle='#2b1d0e';c.textAlign='center';c.font='bold 30px Georgia';c.fillText(spec.label||spec.title.toUpperCase(),W/2,H/2+11)},256,64));
      mark(add(own(new THREE.PlaneGeometry(.3,.075)),std({map:label,roughness:.8}),0,-.12,.065,g),data);
      for(const part of [body,shoulder,neck,cork,sea])mark(part,data);mark(ship.children[0],data);
      return {g,data};
    }

    // ---------- the islands hand over their bottles ----------
    function addBottle(spec){
      if(!shelf||bottles.length>=SLOTS||bottles.some(b=>b.key===spec.key))return null;
      const slot=bottles.length,{g,data}=bottle(spec,slot);const entry={key:spec.key,slot,spec,group:g,data};bottles.push(entry);return entry}
    // Where a reader stands, in the corridor, when they come back out of a bottle: in front of the shelf, facing it.
    function standBefore(key){
      // The shelf faces west, so its length runs north to south: a slot's place along it is a step in z.
      const b=bottles.find(x=>x.key===key),along=b?slotX(b.slot):0,p=corridor?.standBefore?.({x:BAY.x,z:BAY.z+along,yaw:BAY.yaw},1.6);
      return p?{...p,yaw:p.yaw+Math.PI}:{x:BAY.x-1.6,z:BAY.z+along,yaw:BAY.yaw}}
    function interact(object){
      const data=object?.userData;if(!data||(data.type!=='bottle'&&data.type!=='bottle-card'))return false;
      if(data.type==='bottle-card'){showNotice(`${data.title}: ${data.author}`,9);return true}
      const b=bottles.find(x=>x.key===data.key);if(!b)return false;
      if(isHolding()){showNotice('Your hands are full: put the book down before you look into the bottle.',5);return true}
      playSample?.('pageTurn',.35,.6);analytics?.track('Room Explored',{room:'ships-in-bottles',bottle:b.key});b.spec.enter();return true}

    build();
    return {add:addBottle,interact,standBefore,bay:BAY,slots:SLOTS,shelf:SHELF,slotX,get bottles(){return bottles.map(b=>({key:b.key,slot:b.slot,title:b.spec.title}))},card:CARD};
  };
})();
