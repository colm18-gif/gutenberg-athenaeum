// The Wandering Door: a door standing on its own at the north end of the Grand Hall, behind the long bookcase, in no
// wall at all. Opened from the front it shows a lamplit passage that cannot be there, and the reader steps through into
// one of the library's rooms, a different one each time (never the last one twice running, and more often one the
// reader has not found yet). The way back is that room's own door, so the reader learns where the room really is.
// Only rooms behind ordinary doors are on its list: the rooms reached by carpet, balloon, boat, rocket, the globe or a
// secret keep their own ways in. game.js hands it the list and `link`, which is its `roomLink`.
(function(){
  'use strict';

  window.createWanderingDoor=function(options){
    const {THREE,scene,MAT,doorKit,interactables,collider,player,showNotice,playSample,analytics,destinations=[],link,known=()=>true,isHolding=()=>false}=options;
    // Facing east, towards readers coming round the east end of the bookcase row (z −17), clear of the benches under
    // the north windows (z −29) and the Gothic Parlour's door (x 0, z −30.5).
    const DOOR={x:6,z:-24.5,yaw:Math.PI/2};
    const LAST='athenaeum-wandering-door-last';
    const store={get:key=>{try{return localStorage.getItem(key)}catch(e){return null}},set:(key,value)=>{try{localStorage.setItem(key,value)}catch(e){}}};
    const data={type:'wandering-door',title:'A door standing on its own',author:'It is in no wall, and it opens on a different room each time.',action:'OPEN'};
    const back={type:'wandering-door',back:true,title:'The back of a door',author:'There is nothing behind it but the Grand Hall.',action:'OPEN'};
    let door=null,last=store.get(LAST);

    function mark(object,d){object.userData=d;interactables.push(object);return object}
    function build(){
      const g=new THREE.Group();g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      // A worn stone threshold, so it stands on something.
      const step=new THREE.Mesh(new THREE.BoxGeometry(2.9,.08,.62),MAT.stone||MAT.darkWood);step.position.set(0,.04,.02);g.add(step);
      door=doorKit?.hang(g,{data,mark,...doorKit.readingRoom('ELSEWHERE','A different room each time')})||null;
      if(!door){const slab=mark(new THREE.Mesh(new THREE.BoxGeometry(1.9,3.1,.14),MAT.darkWood),data);slab.position.set(0,1.55,0);g.add(slab)}
      // Its far face answers too, so a reader behind it is told to go round.
      g.updateMatrixWorld(true);
      if(door){const hit=new THREE.Mesh(new THREE.PlaneGeometry(1.9,3.1),new THREE.MeshBasicMaterial({visible:false}));hit.position.set(0,1.55,-.2);hit.rotation.y=Math.PI;g.add(hit);mark(hit,back)}
      collider?.(DOOR.x,DOOR.z,.5,2.7,'wandering-door');
    }

    const available=()=>destinations.filter(d=>link(d.key));
    function choose(){
      const open=available().filter(d=>d.key!==last),pool=open.length?open:available();
      const unseen=pool.filter(d=>!known(d.place));
      const from=unseen.length&&Math.random()<.7?unseen:pool;
      return from[Math.floor(Math.random()*from.length)]||null;
    }
    // Which side of the door the reader is standing on: the front faces local +z.
    function inFront(){return (player.pos.x-DOOR.x)*Math.sin(DOOR.yaw)+(player.pos.z-DOOR.z)*Math.cos(DOOR.yaw)>0}
    function go(){
      const where=choose(),enter=where&&link(where.key);
      if(!enter){showNotice('The handle turns, but tonight the door opens only on the Grand Hall.',4);return}
      last=where.key;store.set(LAST,last);
      analytics?.track('Journey Taken',{journey:'wandering-door'});
      enter();
    }
    function interact(object){
      const d=object?.userData;if(d?.type!=='wandering-door')return false;
      if(d.back||!inFront()){showNotice('From this side it is only the back of a door, standing in the Grand Hall. Whatever it opens on is round the front.',5);return true}
      if(isHolding()){showNotice('Put the book back first: it might never find its way home from wherever this door opens.',5);return true}
      playSample?.('doorOpen',.8,.82);
      doorKit?doorKit.pass(door,data,go):go();
      return true;
    }
    build();
    return {interact,choose,door:DOOR,get destinations(){return available()}};
  };
})();
