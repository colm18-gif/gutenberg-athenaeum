// Only the cold hearth is present at startup. The archive script downloads on discovery.
(function(){
  'use strict';
  window.createCinderArchive=function(options){
    const {THREE,scene,MAT,interactables,canvasTexture,showNotice,isHolding=()=>false}=options;
    const entrance={x:101,z:21.55,yaw:Math.PI};
    let room=null,pending=null,revealed=false;
    const hearth=new THREE.Group();hearth.position.set(entrance.x,0,entrance.z);hearth.rotation.y=entrance.yaw;scene.add(hearth);
    const add=(w,h,d,mat,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);hearth.add(m);return m};
    add(2.6,2.7,.12,MAT.black,0,1.35,0);
    for(const x of [-1.4,1.4])add(.25,2.8,.4,MAT.stone,x,1.4,.13);
    add(3.2,.24,.55,MAT.darkWood,0,2.85,.2);add(3.1,.12,.8,MAT.stone,0,.06,.3);
    const tex=canvasTexture((c,w,h)=>{c.fillStyle='#201510';c.fillRect(0,0,w,h);c.strokeStyle='#997347';c.lineWidth=8;c.strokeRect(12,12,w-24,h-24);c.fillStyle='#e1c89b';c.textAlign='center';c.font='italic 24px Georgia';['What the fire','could not keep'].forEach((s,i)=>c.fillText(s,w/2,100+i*36));for(let i=0;i<24;i++){c.fillStyle=i%2?'#090807':'#50311d';c.fillRect(i%2?0:w-18, i*13,18+(i%4)*4,18)}},256,320);
    const key=add(.72,.9,.13,new THREE.MeshStandardMaterial({map:tex,roughness:1}),0,.75,.35);
    key.userData={type:'cinder-key',title:'A book in a cold fireplace',author:'Its edges are burnt. One line is still legible.',action:'LIFT'};interactables.push(key);
    const back=add(1.7,2.35,.08,MAT.black,0,1.3,.1);
    back.userData={type:'cinder-door',title:'The draught behind the hearth',author:'A passage through blackened brick.',action:'ENTER'};
    async function enter(){
      if(isHolding()){showNotice('Set down your book before entering the narrow hearth.',4);return}
      if(room){room.enter();return}
      if(pending)return pending;
      showNotice('A draught lifts the soot. The passage is opening…',4);
      pending=(async()=>{
        if(!window.buildCinderRoom)await new Promise((resolve,reject)=>{
          const script=document.createElement('script');const timer=setTimeout(()=>{script.remove();reject(new Error('timeout'))},20000);
          script.src=window.libraryVersionedSource?.('cinder-room.js')||'cinder-room.js';
          script.onload=()=>{clearTimeout(timer);resolve()};script.onerror=()=>{clearTimeout(timer);script.remove();reject(new Error('load'))};document.head.appendChild(script);
        });
        room=window.buildCinderRoom({...options,entrance});room.enter();
      })().catch(()=>showNotice('The passage has not opened. Try the hearth again.',5)).finally(()=>{pending=null});
      return pending;
    }
    function interact(o){if(o===key){if(!revealed){revealed=true;key.visible=false;interactables.push(back);options.playSample?.('bookPull',.7,.8);showNotice('You lift the burnt book. Behind it, the bricks part around a cold draught. Examine the opening to step through.',8)}return true}if(o===back){void enter();return true}return room?.interact(o)||false}
    return {enter,interact,entrance,contains:(x,z)=>room?.contains(x,z)||false,floorAt:(x,z)=>room?.floorAt(x,z)??null,allowed:(x,z)=>room?.allowed(x,z)||false,update:t=>room?.update(t),leave:()=>room?.leave(),atExit:()=>room?.atExit()||false,get built(){return room?.built||false},get room(){return room?.room},get pending(){return !!pending}};
  };
})();
