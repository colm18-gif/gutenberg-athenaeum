// The Camera Obscura: a small dark round room in a turret on the roof garden's east parapet. In the middle stands a
// white table, and on it, carried down through a lens in the roof, a live picture of the library: the game draws the
// Grand Hall again from a camera of its own into the table's texture a few times a second, so the lamps, the rain and
// Clio crossing the floor are there as they are. A brass wheel turns the view round the hall: from above the entrance,
// the fireside end, straight down from the ceiling lantern, and the south-west corner. (The wings and rooms are not
// drawn while the reader is away from them, so the views stay in the hall, which always is.) There is one dim lamp by the shelf, so the picture is the brightest thing.
//
// The secret: watch the Grand Hall long enough and a tiny figure with a lantern crosses it to a door the reader has not
// yet opened (exploration.js's doors), and is gone; nobody is there when the reader goes down. It is seen only on the
// table. The first time, the shelf `obscura-figure` leaves its book on the table's rim, found for good
// (athenaeum-obscura-figure; ?figure shows it). Books on optics and natural magic: shelf `obscura-books`.
//
// Built when the reader comes near the turret door, freed a little while after they leave; the turret itself is a few
// meshes on the roof, built at startup and kept.
(function(){
  'use strict';

  const VIEWS=[
    {key:'hall',name:'The Grand Hall, from above the entrance',eye:[0,8.4,27],look:[0,0,-6],fov:66},
    {key:'fireside',name:'The fireside end of the Grand Hall',eye:[2,7.5,-6],look:[-12,0,-20],fov:64},
    {key:'overhead',name:'The Grand Hall, straight down from the lantern in its ceiling',eye:[0,9,10],look:[0,0,9.9],fov:80},
    {key:'corner',name:'The Grand Hall, from its south-west corner',eye:[-14,6,26],look:[0,0,-10],fov:64}
  ];
  const CARDS={
    sign:['The Camera Obscura','A dark room with a lens in its roof. Light from outside comes in through the lens, by way of a mirror above it, and throws a picture of the world onto the white table: a live picture, moving as the world moves. Rooms like this were built for visitors in the nineteenth century; the one on Castlehill in Edinburgh has been showing the city since 1853. Turn the wheel to turn the view.'],
    table:['The table','A white table, a little hollowed, catches the picture from the lens overhead. Everything on it is happening now, in the library below you.'],
    wheel:['The wheel','Turning the wheel turns the mirror above the lens, and the view on the table swings round with it.'],
    lens:['The lens','A glass lens set in the roof. Above it, under the little cone of the turret, a mirror tilts to send the view straight down.'],
    shelf:['On light, and on wonders','Books on optics, light, and the old “natural magic” of mirrors, lenses and illusions.'],
    figure:['The figure on the table','Somebody small, with a lantern, crossing the Grand Hall on the table, to a door you have not opened. When you look again, the hall is empty.']
  };
  const FOUND_KEY='athenaeum-obscura-figure';

  window.createCameraObscura=function(options){
    const {THREE,scene,renderer,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,moveTo,prepareRoof=()=>{},analytics,isHolding=()=>false,registerSeat=null,doorKit=null,
      doors=[],placeKnown=()=>false,storage=null,search='',size=256}=options;
    // The turret door, on the roof garden's east parapet, facing into the garden.
    const DOOR={x:16.66,y:10.0,z:58.3,yaw:-Math.PI/2};// south of the lavender bed along the parapet
    const ROOM={cx:3300,cz:300,r:4.2,h:4.6};
    const PRELOAD=7,KEEP=25,DRAW_EVERY=.2;
    const DOOR_LOOK={style:'painted',color:0x23303c,fanColor:0xbfd4e6,width:1.5,height:2.5};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    const get=key=>{try{return storage?.getItem(key)}catch(e){return null}},put=(key,value)=>{try{storage?.setItem(key,value)}catch(e){}};
    const wasFound=()=>get(FOUND_KEY)==='1'||/[?&]figure\b/.test(search);
    let root=null,time=0,lastNeeded=-1e9,view=0,drawAt=0,target=null,eye=null,surface=null,watching=0,walk=null,left=null,foundNow=wasFound();
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    const cyl=(rt,rb,h,material,x,y,z,parent,seg=16)=>add(own(new THREE.CylinderGeometry(rt,rb,h,seg)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    function markDoor(object,data){object.userData=data;interactables.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'obscura-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    const shelfBooks=(room,max)=>[...new Set(arrivals[room]||[])].map(id=>findBook(id)).filter(Boolean).slice(0,max);

    // ---------- the turret on the roof, and its door (built at startup and kept) ----------
    function buildTurret(){
      const g=new THREE.Group();g.name='obscura-turret';g.position.set(DOOR.x,DOOR.y,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const stone=new THREE.MeshStandardMaterial({color:0x8e8576,roughness:.92}),lead=new THREE.MeshStandardMaterial({color:0x4a5058,roughness:.6,metalness:.3}),brass=MAT.brass||new THREE.MeshStandardMaterial({color:0xb08d3a,metalness:.6,roughness:.4});
      const part=(geometry,material,x,y,z)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);g.add(m);return m};
      // The turret stands just beyond the parapet: walls round the door, a cone of lead, and the lens housing on top.
      part(new THREE.BoxGeometry(3,3.4,.3),stone,0,1.7,-.2);// the face, round the door
      part(new THREE.CylinderGeometry(1.55,1.6,3.6,20),stone,0,1.8,-1.75);
      part(new THREE.ConeGeometry(1.8,1.6,20),lead,0,4.4,-1.75);
      part(new THREE.CylinderGeometry(.28,.32,.5,12),brass,0,5.35,-1.75);part(new THREE.SphereGeometry(.14,10,8),brass,0,5.7,-1.75);
      const data={type:'obscura-door',title:'The Camera Obscura',author:'A little dark room in the turret, with a lens in its roof and a picture of the library on its table.',action:'ENTER'};
      if(!doorKit?.hang(g,{data,mark:markDoor,...DOOR_LOOK,label:'THE CAMERA OBSCURA'}))markDoor(part(new THREE.BoxGeometry(1.5,2.5,.12),new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.7}),0,1.25,.02),data);
      const plate=canvasTexture((c,W,H)=>{c.fillStyle='#1f2a33';c.fillRect(0,0,W,H);c.strokeStyle='#c9a35f';c.lineWidth=4;c.strokeRect(6,6,W-12,H-12);c.fillStyle='#f0d898';c.textAlign='center';c.font='bold 26px Georgia';c.fillText('CAMERA OBSCURA',W/2,44);c.font='italic 18px Georgia';c.fillText('the library, by its own light',W/2,74)},440,96);
      markDoor(part(new THREE.PlaneGeometry(1.7,.37),new THREE.MeshStandardMaterial({map:plate,emissive:0xffffff,emissiveMap:plate,emissiveIntensity:.35,roughness:.8}),0,2.95,.0),data);
    }

    // ---------- the room ----------
    function buildRoom(){
      root=new THREE.Group();root.name='camera-obscura';const {cx,cz,r,h}=ROOM;
      const wall=std({color:0x2a2622,roughness:.95,side:THREE.BackSide}),floor=std({color:0x3a2e24,roughness:.9}),wood=std({color:0x4a3220,roughness:.7}),brass=MAT.brass||std({color:0xb08d3a,metalness:.6,roughness:.4});
      add(own(new THREE.CircleGeometry(r,40)),floor,cx,0,cz,root).rotation.x=-Math.PI/2;
      add(own(new THREE.CylinderGeometry(r,r,h,40,1,true)),wall,cx,h/2,cz,root);
      const ceiling=add(own(new THREE.CircleGeometry(r,40)),std({color:0x1e1b18,roughness:.95}),cx,h,cz,root);ceiling.rotation.x=Math.PI/2;
      // The lens in the roof, faintly bright.
      const lens=add(own(new THREE.CircleGeometry(.28,24)),std({color:0xd8e8f0,emissive:0xa8c8e0,emissiveIntensity:.9,roughness:.2}),cx,h-.01,cz,root);lens.rotation.x=Math.PI/2;mark(lens,card('lens'));
      mark(cyl(.36,.36,.12,brass,cx,h-.06,cz,root,24),card('lens'));
      // The table: a white dish on a pedestal, with the picture on it.
      const tableR=1.5,tableY=.92;
      mark(cyl(.35,.5,tableY-.05,wood,cx,(tableY-.05)/2,cz,root),card('table'));mark(cyl(tableR+.08,tableR+.04,.1,wood,cx,tableY-.03,cz,root,40),card('table'));
      target=own(new THREE.WebGLRenderTarget(size,size,{depthBuffer:true}));target.texture.colorSpace=THREE.SRGBColorSpace;
      surface=add(own(new THREE.CircleGeometry(tableR,48)),own(new THREE.MeshBasicMaterial({map:target.texture,toneMapped:false})),cx,tableY+.025,cz,root);surface.rotation.x=-Math.PI/2;
      mark(surface,{type:'obscura-table',title:CARDS.table[0],author:CARDS.table[1],action:'LOOK'});block(cx,cz,tableR*2+.3,tableR*2+.3);
      eye=new THREE.PerspectiveCamera(64,1,.1,90);
      // The wheel: a brass rod down from the roof beside the table, with a spoked wheel to turn.
      const wheel=new THREE.Group();wheel.position.set(cx+1.85,1.45,cz-.4);root.add(wheel);
      const parts=[cyl(.025,.025,h-1.45,brass,0,(h-1.45)/2,0,wheel,8),add(own(new THREE.TorusGeometry(.32,.025,8,28)),brass,0,0,0,wheel)];parts[1].rotation.x=Math.PI/2;
      for(let i=0;i<4;i++){const spoke=box(.6,.02,.02,brass,0,0,0,wheel);spoke.rotation.y=i*Math.PI/4;parts.push(spoke)}
      for(const p of parts)mark(p,{type:'obscura-wheel',title:CARDS.wheel[0],author:CARDS.wheel[1],action:'TURN THE WHEEL'});block(cx+1.85,cz-.4,.7,.7);
      // A short shelf on the north-west of the wall, with a dim lamp: the only other light.
      const shelfAngle=-2.3,sx=cx+Math.cos(shelfAngle)*(r-.35),sz=cz+Math.sin(shelfAngle)*(r-.35),shelfYaw=-shelfAngle-Math.PI/2;
      const shelf=new THREE.Group();shelf.position.set(sx,0,sz);shelf.rotation.y=shelfYaw;root.add(shelf);
      for(const y of [.9,1.85])box(2.2,.05,.34,wood,0,y,0,shelf);box(2.3,2.6,.06,wood,0,1.3,-.2,shelf);block(sx,sz,1.6,1.6);
      const list=shelfBooks('books',10),geometry=own(new THREE.BoxGeometry(.4,.58,.08)),per=Math.max(1,Math.ceil(list.length/2));
      list.forEach((book,i)=>{const row=i<per?0:1,n=row?list.length-per:per,col=row?i-per:i,local=new THREE.Vector3((col-(n-1)/2)*.46,row?2.18:1.23,.05).applyAxisAngle(new THREE.Vector3(0,1,0),shelfYaw);
        placeBook(book,{x:sx+local.x,y:local.y,z:sz+local.z,yaw:shelfYaw},geometry,'books')});
      const label=signPlane('ON LIGHT, AND ON WONDERS',1.6,.22);label.position.set(0,2.62,-.15);shelf.add(label);mark(label,card('shelf'));
      const sign=signPlane('THE CAMERA OBSCURA',2.2,.3);const sa=-Math.PI/2,signR=r-.06;sign.position.set(cx+Math.cos(sa)*signR,3.4,cz+Math.sin(sa)*signR);sign.rotation.y=0;root.add(sign);mark(sign,card('sign'));
      const lamp=new THREE.PointLight(0xffcf90,1.1,5,2);lamp.position.set(sx-Math.cos(shelfAngle)*.6,2.2,sz-Math.sin(shelfAngle)*.6);root.add(lamp);
      add(own(new THREE.SphereGeometry(.06,10,8)),std({color:0xffe0a0,emissive:0xffb060,emissiveIntensity:1.2}),lamp.position.x,lamp.position.y,lamp.position.z,root);
      // A bench against the east of the wall: one of the library's seats.
      const bg=new THREE.Group();const ba=.35;bg.position.set(cx+Math.cos(ba)*(r-.5),0,cz+Math.sin(ba)*(r-.5));bg.rotation.y=-ba-Math.PI/2;root.add(bg);
      const bench=[box(1.6,.08,.46,wood,0,.46,0,bg),box(.08,.44,.4,wood,-.7,.22,0,bg),box(.08,.44,.4,wood,.7,.22,0,bg)];block(bg.position.x,bg.position.z,1.4,1.4);for(const p of bench)ours.push(p);
      registerSeat?.(bench,bg,new THREE.Vector3(0,1.1,0),bg.rotation.y,{title:'A bench in the dark',author:'Sit and watch the library on the table, or read one of the books on light.',bookIds:books.map(b=>b.userData.book.id)});
      // The book the figure leaves, on the table's rim, once found.
      if(foundNow)leaveBook(false);
      const exit={type:'obscura-exit',title:'Back to the roof garden',author:'Down the turret stair and out among the planters.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:exit,mark,x:cx,z:cz+r-.15,yaw:Math.PI,label:'THE ROOF GARDEN',onward:'towards the Grand Hall',own,...DOOR_LOOK}))mark(box(1.5,2.5,.16,std({color:DOOR_LOOK.color,roughness:.7}),cx,1.25,cz+r-.15,root),exit);
      scene.add(root);drawAt=0;
    }
    function signPlane(text,w,h){const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#1c2228';c.fillRect(0,0,W,H);c.strokeStyle='#c9a35f';c.lineWidth=4;c.strokeRect(6,6,W-12,H-12);c.fillStyle='#ecd394';c.textAlign='center';c.font='bold 26px Georgia';c.fillText(text,W/2,H/2+9)},640,Math.round(640*h/w)));
      return new THREE.Mesh(own(new THREE.PlaneGeometry(w,h)),std({map,emissive:0x2a2a20,emissiveIntensity:.35,roughness:.8}))}
    function placeBook(book,spot,geometry,shelf){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,root);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw||0;mesh.rotation.x=spot.tilt??-.08;
      mesh.userData={type:'book',book,loaded:false,obscura:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh}
    function leaveBook(){if(left||!root)return;const book=shelfBooks('figure',1)[0];if(!book)return;const {cx,cz}=ROOM;left=placeBook(book,{x:cx-1.05,y:.99,z:cz+1.05,yaw:.7,tilt:-Math.PI/2},own(new THREE.BoxGeometry(.4,.56,.06)),'figure')}

    // ---------- the picture on the table ----------
    const figure=(()=>{const g=new THREE.Group();g.visible=false;g.name='obscura-figure';
      const coat=new THREE.MeshBasicMaterial({color:0x0c0b0a}),glow=new THREE.MeshBasicMaterial({color:0xffd27a});
      const body=new THREE.Mesh(new THREE.CylinderGeometry(.22,.32,1.5,10),coat);body.position.y=.75;const head=new THREE.Mesh(new THREE.SphereGeometry(.18,10,8),coat);head.position.y=1.65;
      const lantern=new THREE.Mesh(new THREE.SphereGeometry(.13,10,8),glow);lantern.position.set(.38,.9,0);const halo=new THREE.Mesh(new THREE.SphereGeometry(.45,12,10),new THREE.MeshBasicMaterial({color:0xffc060,transparent:true,opacity:.25,depthWrite:false}));halo.position.copy(lantern.position);
      g.add(body,head,lantern,halo);g.traverse(o=>{o.raycast=()=>{}});scene.add(g);return g})();
    function wallOf(x,z){return z>29?'south wall':z<-29?'north wall':x<-18&&x>-19.5?'west wall':x>18&&x<19.5?'east wall':x<0?'west wing':'east wing'}
    function startWalk(){
      const unseen=doors.filter(d=>!placeKnown(d[0])),pool=unseen.length?unseen:doors;if(!pool.length)return;const d=pool[Math.floor(Math.random()*pool.length)];
      walk={from:new THREE.Vector3(0,0,6),to:new THREE.Vector3(d[3],0,d[4]),door:new THREE.Vector3(d[1],0,d[2]),t:0,wall:wallOf(d[1],d[2]),told:false}}
    function updateWalk(dt){
      if(!walk)return;walk.t+=dt;const s=Math.min(1,walk.t/14),p=walk.from.clone().lerp(walk.to,s);
      if(s>=1){const fade=Math.min(1,(walk.t-14)/2);p.lerp(walk.door,fade);if(fade>=1){finishWalk();return}}
      figure.position.copy(p);figure.rotation.y=Math.atan2(walk.to.x-walk.from.x,walk.to.z-walk.from.z);
      if(!walk.told&&walk.t>3){walk.told=true;showNotice('On the table, something small is moving across the Grand Hall: a figure, carrying a lantern.',6)}}
    function finishWalk(){
      const wall=walk.wall;walk=null;figure.visible=false;playSample?.('pageTurn',.4,.7);
      if(!foundNow){foundNow=true;put(FOUND_KEY,'1');leaveBook();analytics?.track('Secret Found',{secret:'obscura-figure'})}
      showNotice(`The figure reaches a door in the ${wall} and is gone. The hall is empty again. ${left&&!left.userData.told?(left.userData.told=true,`On the rim of the table, where nothing was a moment ago, lies a book: ${left.userData.book.title}.`):''}`,12)}
    function drawTable(){
      if(!root||!target)return;const v=VIEWS[view];eye.fov=v.fov;eye.updateProjectionMatrix();eye.position.fromArray(v.eye);eye.lookAt(new THREE.Vector3().fromArray(v.look));eye.updateMatrixWorld();
      figure.visible=!!walk;
      const previous=renderer.getRenderTarget(),exposure=renderer.toneMappingExposure,autoClear=renderer.autoClear,xr=renderer.xr?.enabled;
      try{if(renderer.xr)renderer.xr.enabled=false;renderer.setRenderTarget(target);renderer.toneMappingExposure=exposure*2.4;renderer.autoClear=true;renderer.clear();renderer.render(scene,eye)}
      catch(error){console.warn('Camera obscura view unavailable',error)}
      finally{renderer.setRenderTarget(previous);renderer.toneMappingExposure=exposure;renderer.autoClear=autoClear;if(renderer.xr)renderer.xr.enabled=xr;figure.visible=false}}
    // A view as an image (for checking the views by eye: ?debug's __athenaeum.cameraObscura.snapshot(i)).
    function snapshot(i=view,w=480){
      const v=VIEWS[i],cam=new THREE.PerspectiveCamera(v.fov,1,.1,90),rt=new THREE.WebGLRenderTarget(w,w,{depthBuffer:true});rt.texture.colorSpace=THREE.SRGBColorSpace;
      cam.position.fromArray(v.eye);cam.lookAt(new THREE.Vector3().fromArray(v.look));cam.updateMatrixWorld();
      const previous=renderer.getRenderTarget(),exposure=renderer.toneMappingExposure;
      try{renderer.setRenderTarget(rt);renderer.toneMappingExposure=exposure*2.4;renderer.clear();renderer.render(scene,cam);const px=new Uint8Array(w*w*4);renderer.readRenderTargetPixels(rt,0,0,w,w,px);
        const c=document.createElement('canvas');c.width=c.height=w;const ctx=c.getContext('2d'),img=ctx.createImageData(w,w);for(let row=0;row<w;row++)img.data.set(px.subarray(row*w*4,(row+1)*w*4),(w-1-row)*w*4);ctx.putImageData(img,0,0);return c.toDataURL('image/png')}
      finally{renderer.setRenderTarget(previous);renderer.toneMappingExposure=exposure;rt.dispose()}}
    function turn(){view=(view+1)%VIEWS.length;drawAt=0;playSample?.('stoneStep1',.35,1.6);showNotice(`The wheel turns, the mirror tilts above the lens, and the picture swings round: ${VIEWS[view].name.charAt(0).toLowerCase()+VIEWS[view].name.slice(1)}.`,5)}

    // ---------- walking ----------
    function contains(x,z){return Math.hypot(x-ROOM.cx,z-ROOM.cz)<ROOM.r}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      if(!contains(x,z))return false;const r=player.radius||.42;if(Math.hypot(x-ROOM.cx,z-ROOM.cz)>ROOM.r-.35-r)return false;
      return !blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ)}

    // ---------- doing things ----------
    function enter(){
      activate();moveTo(ROOM.cx,0,ROOM.cz+ROOM.r-1.2,0);playSample?.('doorOpen',.8,.85);
      showNotice('The Camera Obscura. It is dark, and on the white table in the middle the Grand Hall is moving, lamps and all. Turn the brass wheel to turn the view.',10);
      analytics?.track('Room Explored',{room:'camera-obscura'})}
    function leave(){prepareRoof();moveTo(DOOR.x-1.6,DOOR.y,DOOR.z,Math.PI/2);playSample?.('doorOpen',.8,1);showNotice('The roof garden again, under the sky.',4)}
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('obscura-'))return false;
      if(data.type==='obscura-door'){prepareRoof();through(data,enter);return true}
      if(data.type==='obscura-exit'){through(data,leave);return true}
      if(data.type==='obscura-wheel'){turn();return true}
      if(data.type==='obscura-table'){const v=VIEWS[view];showNotice(`${v.name}. ${CARDS.table[1]}`,8);return true}
      if(data.type==='obscura-card'){showNotice(`${data.title}: ${data.author}`,data.author.length>260?17:data.author.length>130?12:8);return true}
      return false}

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;surface=null;eye=null;left=null;walk=null;figure.visible=false;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();target=null;ours.length=0;books.length=0;blockers.length=0}
    function update(t){
      const dt=Math.min(.1,Math.max(0,t-time));time=t;const inside=contains(player.pos.x,player.pos.z),near=player.pos.y>8&&Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      if(inside||near&&(root||window.libraryMayBuild?.()!==false))activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home.parent))unload();
      if(!inside||!root)return;
      // The figure: after a while watching the hall, now and then (and always the first time), it crosses.
      if(!walk){watching+=dt;if(watching>(foundNow?45:9)&&(!foundNow||Math.random()<.5)){watching=0;startWalk()}}
      updateWalk(dt);
      if(t>=drawAt){drawAt=t+DRAW_EVERY;drawTable()}
    }
    buildTurret();
    return {contains,floorAt,allowed,interact,update,enter,leave,activate,unload,door:DOOR,room:ROOM,views:VIEWS,cards:CARDS,drawTable,startWalk,snapshot,
      get built(){return !!root},get view(){return view},set view(i){view=((i%VIEWS.length)+VIEWS.length)%VIEWS.length;drawAt=0},get walking(){return !!walk},get found(){return foundNow},get books(){return books.slice()},
      zoneAt:(x,z)=>contains(x,z)?'camera-obscura':null};
  };
})();
