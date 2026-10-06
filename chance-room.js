// The Room of Chance: a concealed east-wall room where no catalogue order is allowed.
// Books are deliberately shuffled on each visit/session so unrelated works sit beside one another.
(function(){
  'use strict';

  window.createChanceRoom=function(options){
    const {THREE,scene,MAT,player,interactables,bookMaterial,findBook,canvasTexture,showNotice,playSample,move,analytics,isHolding=()=>false}=options;
    // The portrait hangs on the east wing's east wall, in the plain stretch between the Restricted Catalogue's gate (to
    // z 0.95) and the Verne engraving (from z 3.1), facing into the wing. The room stands well clear of the Moon
    // (x 340, z 30, radius 18) and the night railway, beyond the camera's reach from either.
    const ENTRANCE={x:36.6,z:2.05,yaw:-Math.PI/2};
    const ROOM={cx:500,cz:60,w:18,d:16,h:5.2};
    const IDS=[1342,84,2701,11,1661,98,174,345,5200,1232,1952,1400,4300,1080,46,768,2554,219,16328,6130,19942,55,244,514,1260,2097,1727,5740,1064,145,35,5230,236,1524,10002,389,1695,1934,2005,10897,204,215];
    let root=null,time=0,lastNeeded=-1e9,portrait=null;
    const ours=[],owned=[],blockers=[];

    const own=o=>{owned.push(o);return o};
    function add(geometry,material,x,y,z,parent=scene){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    function shuffle(list){const a=list.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

    function portraitTexture(){
      return canvasTexture((c,w,h)=>{
        const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#312219');g.addColorStop(1,'#090807');c.fillStyle=g;c.fillRect(0,0,w,h);
        c.strokeStyle='#a47d47';c.lineWidth=15;c.strokeRect(18,18,w-36,h-36);
        c.fillStyle='#846344';c.globalAlpha=.52;c.beginPath();c.ellipse(w*.5,h*.37,w*.18,h*.25,0,0,Math.PI*2);c.fill();c.fillRect(w*.33,h*.62,w*.34,h*.27);
        c.globalAlpha=1;c.fillStyle='#d4b77d';c.textAlign='center';c.font='italic 28px Georgia';c.fillText('?',w/2,h*.91);
      },320,420);
    }

    function buildEntrance(){
      const mat=new THREE.MeshStandardMaterial({map:portraitTexture(),roughness:.88});
      portrait=add(new THREE.PlaneGeometry(1.45,1.9),mat,ENTRANCE.x,2.45,ENTRANCE.z);
      portrait.rotation.y=ENTRANCE.yaw;portrait.rotation.z=.028;
      mark(portrait,{type:'chance-door',title:'A portrait hung slightly crooked',author:'There is a faint draught behind the frame.',action:'EXAMINE'});
    }

    function plaque(parent){
      const tex=own(canvasTexture((c,w,h)=>{c.fillStyle='#18110b';c.fillRect(0,0,w,h);c.strokeStyle='#a98653';c.lineWidth=7;c.strokeRect(8,8,w-16,h-16);c.fillStyle='#e0c792';c.textAlign='center';c.font='bold 31px Georgia';c.fillText('NO ORDER GOVERNS',w/2,50);c.fillText('THESE SHELVES',w/2,88)},560,112));
      const p=add(own(new THREE.PlaneGeometry(4.4,.88)),own(new THREE.MeshStandardMaterial({map:tex,roughness:.9})),ROOM.cx-ROOM.w/2+.22,3.1,ROOM.cz,parent);p.rotation.y=Math.PI/2;
    }

    // A bookcase whose open side (local −z, where the books stand) is turned by yaw to face the room.
    function shelf(parent,x,z,yaw,entries){
      const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=yaw;parent.add(g);
      const W=7.1,H=4.7,D=.72;
      for(const y of [.18,1.62,3.06,4.5])box(W,.15,D,MAT.darkWood,0,y,0,g);
      for(const dx of [-W/2,W/2])box(.22,H,D,MAT.darkWood,dx,H/2,0,g);
      box(W,H,.12,MAT.wood2,0,H/2,.31,g);
      entries.slice(0,9).forEach((book,i)=>{
        const row=Math.floor(i/3),col=i%3;
        const bm=add(own(new THREE.BoxGeometry(1.05,1.2,.16)),own(bookMaterial(book)),-2.35+col*2.35,.9+row*1.44,-.46,g);
        bm.rotation.x=(Math.random()-.5)*.05;bm.rotation.z=(Math.random()-.5)*.05;
        bm.userData={type:'book',book,loaded:false,chance:true,home:{position:bm.position.clone(),quaternion:bm.quaternion.clone(),parent:g}};
        interactables.push(bm);ours.push(bm);
      });
      block(x,z,Math.abs(Math.cos(yaw))*W+Math.abs(Math.sin(yaw))*D,Math.abs(Math.sin(yaw))*W+Math.abs(Math.cos(yaw))*D);
    }

    function buildRoom(){
      if(root)return;root=new THREE.Group();scene.add(root);
      box(ROOM.w,.35,ROOM.d,MAT.wood,ROOM.cx,-.18,ROOM.cz,root);
      box(ROOM.w,ROOM.h,.4,MAT.stone,ROOM.cx,ROOM.h/2,ROOM.cz-ROOM.d/2,root);
      box(ROOM.w,.3,ROOM.d,MAT.darkWood,ROOM.cx,ROOM.h+.15,ROOM.cz,root);
      box(ROOM.w,ROOM.h,.4,MAT.stone,ROOM.cx,ROOM.h/2,ROOM.cz+ROOM.d/2,root);
      box(.4,ROOM.h,ROOM.d,MAT.stone,ROOM.cx-ROOM.w/2,ROOM.h/2,ROOM.cz,root);
      box(.4,ROOM.h,ROOM.d,MAT.stone,ROOM.cx+ROOM.w/2,ROOM.h/2,ROOM.cz,root);
      const rugMat=new THREE.MeshStandardMaterial({color:0x24352f,roughness:1});
      const rug=add(own(new THREE.PlaneGeometry(10,8)),rugMat,ROOM.cx,.015,ROOM.cz,root);rug.rotation.x=-Math.PI/2;
      const lamp=new THREE.PointLight(0xffc47e,11,17,2);lamp.position.set(ROOM.cx,3.3,ROOM.cz);root.add(lamp);
      plaque(root);
      const shuffled=shuffle(IDS.map(id=>findBook(id)).filter(Boolean));
      shelf(root,ROOM.cx-4.2,ROOM.cz-ROOM.d/2+.7,Math.PI,shuffled.slice(0,9));
      shelf(root,ROOM.cx+4.2,ROOM.cz-ROOM.d/2+.7,Math.PI,shuffled.slice(9,18));
      shelf(root,ROOM.cx-5.1,ROOM.cz+ROOM.d/2-.7,0,shuffled.slice(18,27));
      shelf(root,ROOM.cx+5.1,ROOM.cz+ROOM.d/2-.7,0,shuffled.slice(27,36));
      shelf(root,ROOM.cx+ROOM.w/2-.7,ROOM.cz,Math.PI/2,shuffled.slice(36,45));
      const table=box(3.4,.2,1.7,MAT.wood,ROOM.cx,.92,ROOM.cz,root);block(ROOM.cx,ROOM.cz,3.7,2);
      for(const dx of [-1.45,1.45])for(const dz of [-.65,.65])box(.14,.9,.14,MAT.darkWood,ROOM.cx+dx,.45,ROOM.cz+dz,root);
      // The way back: the portrait's lit reverse, in a clear gap between the south bookcases, facing the room.
      const backTex=own(canvasTexture((c,w,h)=>{const g=c.createRadialGradient(w/2,h*.42,20,w/2,h*.42,w*.75);g.addColorStop(0,'#f6dca0');g.addColorStop(.55,'#8a6236');g.addColorStop(1,'#2a1a10');c.fillStyle=g;c.fillRect(0,0,w,h);
        c.strokeStyle='#d4b77d';c.lineWidth=16;c.strokeRect(14,14,w-28,h-28);c.fillStyle='#1c120b';c.textAlign='center';c.font='bold 33px Georgia';c.fillText('THE WAY BACK',w/2,h*.82);c.font='italic 23px Georgia';c.fillText('to the ordered library',w/2,h*.89)},320,520));
      box(2.3,3.5,.12,MAT.darkWood,ROOM.cx,1.75,ROOM.cz+ROOM.d/2-.27,root);
      const exit=mark(add(own(new THREE.PlaneGeometry(1.9,3.1)),own(new THREE.MeshStandardMaterial({map:backTex,emissive:0xffffff,emissiveMap:backTex,emissiveIntensity:.55,roughness:.8})),ROOM.cx,1.65,ROOM.cz+ROOM.d/2-.34,root),{type:'chance-exit',title:'The portrait passage',author:'The ordered library waits beyond.',action:'RETURN'});
      exit.rotation.y=Math.PI;
      lastNeeded=time;
    }

    function contains(x,z){return x>ROOM.cx-ROOM.w/2&&x<ROOM.cx+ROOM.w/2&&z>ROOM.cz-ROOM.d/2&&z<ROOM.cz+ROOM.d/2}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){if(!contains(x,z))return false;const r=player.radius||.42;if(x-r<ROOM.cx-ROOM.w/2+.45||x+r>ROOM.cx+ROOM.w/2-.45||z-r<ROOM.cz-ROOM.d/2+.45||z+r>ROOM.cz+ROOM.d/2-.45)return false;return !blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ)}
    function enter(){buildRoom();move(ROOM.cx,ROOM.cz+ROOM.d/2-1.5,0);playSample?.('doorOpen',.75,.9);showNotice('The Room of Chance. No theme, no sequence, no recommendation: only whatever happened to land beside whatever else. The way back is the lit passage behind you.',9);analytics?.track('Room Explored',{room:'room-of-chance'})}
    function leave(withBook=false){move(ENTRANCE.x-1.9,ENTRANCE.z,Math.PI/2);playSample?.('doorOpen',.7,1);showNotice(withBook?'You leave the book where chance put it, and the portrait settles back into place.':'The portrait settles back into place.',withBook?5:3)}
    // Standing at the way back (in the gap between the south bookcases): a reader carrying a book can leave from here too.
    function atExit(x=player.pos.x,z=player.pos.z){return !!root&&Math.abs(x-ROOM.cx)<1.6&&z>ROOM.cz+ROOM.d/2-2.6&&contains(x,z)}
    function interact(object){const d=object?.userData;if(d?.type==='chance-door'){enter();return true}if(d?.type==='chance-exit'){leave();return true}return false}
    function update(t){time=t;if(contains(player.pos.x,player.pos.z))lastNeeded=t}
    buildEntrance();
    return {contains,floorAt,allowed,interact,update,enter,leave,atExit,room:ROOM,entrance:ENTRANCE,get built(){return !!root},zoneAt:(x,z)=>contains(x,z)?'room-of-chance':null};
  };
})();