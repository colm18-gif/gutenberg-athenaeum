// Island bottles: ships in bottles that join an island to a room of the library, both ways, so the islands on the Long
// Corridor's shelf are not a dead end. Montserrat, the Emerald Isle of the Caribbean, has a bottle on the Irish Room's
// mantel, and one in its house that sails back to Ireland; Norfolk Island, an Australian territory since 1914 and settled
// from Sydney in 1788, has a bottle in the Australian Room at the Antipodes, and one in its house that sails back.
//
// Each bottle stands only while its room is built (as the back ways' doors do in passages.js), costs no light, and is
// freed with its room. Looking in builds the other end first and sets the reader down in front of its bottle, facing it.
(function(){
  'use strict';
  // Every place is in world coordinates. `bottle` is where the bottle lies (its cradle's foot, on a mantel or on a little
  // wall shelf of its own), `yaw` the way its plate faces (0 south, out from a north wall; π/2 east, out from a west wall); `stand` is where a reader arrives, facing the bottle.
  const LINKS=[
    {key:'montserrat-irish',ends:[
      {place:'irish',name:'The Irish Room',bottle:{x:-328.65,y:2.74,z:-211.13,yaw:0},stand:{x:-328.65,z:-208.2,yaw:0},
        label:'MONTSERRAT',sub:'the Emerald Isle',land:0x3d7040,island:[[.07,.045,.045],[.11,.04,.06],[.14,.03,.04]],smoke:[.11,.075],
        author:'A schooner under sail for Montserrat in the Leeward Islands, the Emerald Isle of the Caribbean, where St Patrick’s Day is a public holiday. Look in, and you are on the island.',
        arrive:'The Irish Room, by the turf fire. The bottle on the mantel sails back to Montserrat.'},
      {place:'montserrat',name:'Montserrat',bottle:{x:2595.16,y:1.3,z:597.3,yaw:Math.PI/2,shelf:true},stand:{x:2596.55,z:597.4,yaw:Math.PI/2},
        label:'THE IRISH ROOM',sub:'by the turf fire',land:0x4f8a3e,island:[[.08,.05,.035],[.12,.045,.03]],
        author:'A little ship under sail for Ireland, and a green island ahead with no smoke over it. Look in, and you are in the Irish Room, by the turf fire.',
        arrive:'Montserrat, at night: a timber house in the north of the island, and to the south the Soufrière Hills, their dome glowing. The bottle on the little shelf in the corner sails back to the Irish Room; the one on the table, to the Long Corridor.'}]},
    {key:'norfolk-australian',ends:[
      {place:'norfolk',name:'Norfolk Island',bottle:{x:2600,y:1.2,z:1797.66,yaw:0,shelf:true},stand:{x:2600,z:1798.6,yaw:0},
        label:'THE AUSTRALIAN ROOM',sub:'at the Antipodes',land:0x8a7a4a,island:[[.07,.06,.025],[.12,.06,.02]],
        author:'A ship under sail for the coast of New South Wales: Norfolk Island’s first settlement was made from Sydney in 1788, and it has been an Australian territory since 1914. Look in, and you are in the Australian Room at the Antipodes.',
        arrive:'Norfolk Island: a house on Quality Row at Kingston, on an autumn evening. The bottle on the north wall sails back to the Australian Room; the one on the table, to the Long Corridor.'},
      {place:'australian',name:'The Australian Room',bottle:{x:-351.6,y:1.3,z:-296.66,yaw:0,shelf:true},stand:{x:-351.6,z:-295.5,yaw:0},
        label:'NORFOLK ISLAND',sub:'Kingston',land:0x2f5a34,island:[[.08,.04,.04],[.1,.012,.09],[.13,.012,.08]],
        author:'A ship under sail for Norfolk Island, out in the Pacific east of the Australian coast, with its pines on the skyline. Look in, and you are in a house at Kingston.',
        arrive:'The Australian Room, at the Antipodes. The bottle by the north wall sails back to Norfolk Island; the globe in the hall goes home.'}]}
  ];
  const KEY='athenaeum-island-bottles';

  window.createIslandBottles=function(options){
    const {THREE,scene,MAT,interactables,canvasTexture,showNotice,playSample,analytics,move,places={},isHolding=()=>false,storage=null}=options;
    const found=new Set((()=>{try{return JSON.parse(storage?.getItem(KEY)||'[]')}catch(e){return []}})());
    // Shared by every bottle, made once: glass, cork, hull, sail, mast, sea and brass.
    const mat={glass:new THREE.MeshStandardMaterial({color:0xd9efe6,transparent:true,opacity:.22,roughness:.05,metalness:.1,depthWrite:false}),
      cork:new THREE.MeshStandardMaterial({color:0x9a7448,roughness:.9}),hull:new THREE.MeshStandardMaterial({color:0x3b2414,roughness:.6}),
      sail:new THREE.MeshStandardMaterial({color:0xf1e9d4,roughness:.9,side:THREE.DoubleSide}),mast:new THREE.MeshStandardMaterial({color:0x5a3a1e,roughness:.7}),
      sea:new THREE.MeshStandardMaterial({color:0x2c5f86,roughness:.5,emissive:0x0b2236,emissiveIntensity:.4}),wood:MAT.darkWood||new THREE.MeshStandardMaterial({color:0x3a2416,roughness:.7}),
      brass:MAT.brass||new THREE.MeshStandardMaterial({color:0xb08d3a,metalness:.6,roughness:.4})};
    const geo={body:new THREE.CylinderGeometry(.085,.085,.38,18,1,true),shoulder:new THREE.SphereGeometry(.085,14,8,0,Math.PI*2,0,Math.PI/2),neck:new THREE.CylinderGeometry(.028,.032,.12,10,1,true),
      base:new THREE.CircleGeometry(.085,18),cork:new THREE.CylinderGeometry(.026,.022,.05,10),sea:new THREE.BoxGeometry(.34,.012,.13),hull:new THREE.BoxGeometry(.12,.022,.035),
      mast:new THREE.CylinderGeometry(.002,.002,.09,4),sail:new THREE.PlaneGeometry(.04,.032),plate:new THREE.PlaneGeometry(.36,.09)};
    const ends=[];for(const link of LINKS)link.ends.forEach((end,i)=>ends.push({link,end,i,group:null,hits:[],owned:[]}));

    // A bottle, its cradle and the plate naming where it sails; on a little shelf of its own where it has no mantel.
    function hang(e){
      const {end}=e,b=end.bottle,g=new THREE.Group();g.name='island-bottle-'+e.link.key+'-'+end.place;g.position.set(b.x,b.y,b.z);g.rotation.y=b.yaw;scene.add(g);
      e.group=g;e.hits=[];e.owned=[];const own=t=>{e.owned.push(t);return t};
      const add=(geometry,material,x,y,z,parent=g)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m};
      const data={type:'island-bottle',link:e.link.key,end:e.i,title:`A ship in a bottle · ${end.label}`,author:end.author,action:'LOOK IN'};
      const mark=o=>{o.userData=data;interactables.push(o);e.hits.push(o);return o};
      if(b.shelf){mark(add(own(new THREE.BoxGeometry(.62,.04,.26)),mat.wood,0,-.02,.13));for(const x of [-.24,.24])add(own(new THREE.BoxGeometry(.04,.2,.16)),mat.wood,x,-.13,.08)}
      add(own(new THREE.BoxGeometry(.46,.03,.12)),mat.wood,0,.015,.13);for(const dx of [-.14,.14])add(own(new THREE.BoxGeometry(.04,.07,.1)),mat.wood,dx,.06,.13);
      const bottle=new THREE.Group();bottle.position.set(0,.115,.13);g.add(bottle);
      const body=mark(add(geo.body,mat.glass,0,0,0,bottle));body.rotation.z=Math.PI/2;const shoulder=mark(add(geo.shoulder,mat.glass,-.19,0,0,bottle));shoulder.rotation.z=Math.PI/2;
      const neck=mark(add(geo.neck,mat.glass,-.31,0,0,bottle));neck.rotation.z=Math.PI/2;add(geo.base,mat.glass,.19,0,0,bottle).rotation.y=Math.PI/2;
      const cork=mark(add(geo.cork,mat.cork,-.39,0,0,bottle));cork.rotation.z=Math.PI/2;mark(add(geo.sea,mat.sea,0,-.05,0,bottle));
      const land=own(new THREE.MeshStandardMaterial({color:end.land,roughness:.9}));
      for(const [dx,r,h] of end.island)mark(add(own(new THREE.ConeGeometry(r,h,10)),land,dx,-.045+h/2,-.02,bottle));
      if(end.smoke){const plume=add(own(new THREE.SphereGeometry(.018,8,6)),own(new THREE.MeshStandardMaterial({color:0x9a958c,roughness:1,transparent:true,opacity:.75})),end.smoke[0],-.045+end.smoke[1],-.02,bottle);plume.scale.set(1.4,1,1)}
      const ship=new THREE.Group();ship.position.set(-.07,-.035,.02);bottle.add(ship);mark(add(geo.hull,mat.hull,0,0,0,ship));
      for(const mx of [-.03,.02])add(geo.mast,mat.mast,mx,.045,0,ship),mark(add(geo.sail,mat.sail,mx,.045,.002,ship));
      const tex=own(canvasTexture((c,W,H)=>{c.fillStyle='#caa15a';c.fillRect(0,0,W,H);c.strokeStyle='#6b4d22';c.lineWidth=4;c.strokeRect(5,5,W-10,H-10);c.fillStyle='#2b1d0e';c.textAlign='center';
        let size=28;c.font=`bold ${size}px Georgia`;while(c.measureText(end.label).width>W-24&&size>14){size-=2;c.font=`bold ${size}px Georgia`}c.fillText(end.label,W/2,40);c.font='italic 18px Georgia';c.fillText(end.sub||'look into the bottle',W/2,70)},400,86));
      mark(add(geo.plate,own(new THREE.MeshStandardMaterial({map:tex,roughness:.5,metalness:.3})),0,.02,.196));
    }
    function takeDown(e){if(!e.group)return;e.group.removeFromParent();for(const hit of e.hits){const k=interactables.indexOf(hit);if(k>=0)interactables.splice(k,1)}for(const t of e.owned)t.dispose?.();e.group=null;e.hits=[];e.owned=[]}

    // Through the bottle: the other end's room is built first, then the reader stands before its bottle, facing it.
    function go(e){
      const other=e.link.ends[1-e.i],place=places[other.place];if(!place)return false;
      if(isHolding()){showNotice('Your hands are full: put the book down before you look into the bottle.',5);return true}
      playSample?.('pageTurn',.35,.6);
      if(place.go)place.go();else place.activate?.();
      const s=other.stand;move(s.x,s.z,s.yaw);showNotice(other.arrive,10);
      if(!found.has(e.link.key)){found.add(e.link.key);try{storage?.setItem(KEY,JSON.stringify([...found]))}catch(err){}}
      analytics?.track('Room Explored',{room:other.place,via:'island-bottle'});return true}
    function interact(object){const data=object?.userData;if(data?.type!=='island-bottle')return false;const e=ends.find(x=>x.link.key===data.link&&x.i===data.end);return e?go(e):false}
    function update(){for(const e of ends){const up=!!places[e.end.place]?.built;if(up&&!e.group)hang(e);else if(!up&&e.group)takeDown(e)}}
    return {interact,update,go,links:LINKS,get hung(){return ends.filter(e=>e.group).map(e=>e.link.key+':'+e.end.place)},get found(){return [...found]}};
  };
})();
