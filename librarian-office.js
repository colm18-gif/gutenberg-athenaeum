/* The librarian's working office: a discoverable room, not a menu or catalogue. */
(()=>{
  'use strict';
  window.createLibrarianOffice=function({THREE,scene,MAT,publicStone,publicParquet,player,interactables,books,coverTexture,canvasTexture,showNotice,move,playSample}){
    const cx=300,cz=-70,w=18,d=16,root=new THREE.Group();root.name='librarian-office';let built=false;
    const brassGlow=new THREE.MeshStandardMaterial({color:0xc39a52,emissive:0x6e4317,emissiveIntensity:.35,metalness:.45,roughness:.46});
    const paper=new THREE.MeshStandardMaterial({color:0xd4c394,roughness:.94}),ink=new THREE.MeshStandardMaterial({color:0x211713,roughness:.86}),frostedGlass=new THREE.MeshStandardMaterial({color:0xb8c2b2,transparent:true,opacity:.46,roughness:.5,metalness:.05});
    const add=(geometry,material,x,y,z,parent=root)=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);parent.add(mesh);return mesh};
    const box=(bw,bh,bd,material,x,y,z,parent=root)=>add(new THREE.BoxGeometry(bw,bh,bd),material,x,y,z,parent);
    const officeDoorDetails=(parent,x=0,y=0,z=.13)=>{for(const [py,h] of [[1.05,1.32],[-1.05,1.18]]){box(1.72,h,.045,MAT.brass,x,y+py,z,parent);box(1.48,h-.22,.06,py>0?frostedGlass:MAT.wood2,x,y+py,z+.025,parent)}for(const sx of [-.48,0,.48])box(.045,1.08,.04,MAT.brass,x+sx,y+1.05,z+.07,parent);box(.72,.13,.08,MAT.brass,x,y-.15,z+.08,parent);const knob=add(new THREE.SphereGeometry(.11,12,8),MAT.brass,x+.78,y-.42,z+.13,parent);return knob};
    const note=(mesh,title,author,action='EXAMINE')=>{mesh.userData={type:'librarian-office-object',title,author,action};interactables.push(mesh);return mesh};
    const entranceData={type:'librarian-office-door',title:"The Librarian's Office",author:'Appointments are accepted at hours the clock declines to display.',action:'ENTER'};
    const entrance=new THREE.Group();entrance.position.set(35,0,-13.65);entrance.rotation.y=0;scene.add(entrance);
    const entranceDoor=box(2.35,4.2,.22,MAT.darkWood,0,2.1,0,entrance);entranceDoor.userData=entranceData;interactables.push(entranceDoor);
    officeDoorDetails(entrance,0,2.1);
    for(const x of [-1.28,1.28])box(.18,4.5,.3,MAT.brass,x,2.25,0,entrance);box(2.75,.18,.3,MAT.brass,0,4.48,0,entrance);
    const plaqueTex=canvasTexture((c,cw,ch)=>{c.fillStyle='#24170d';c.fillRect(0,0,cw,ch);c.strokeStyle='#c69a50';c.lineWidth=9;c.strokeRect(7,7,cw-14,ch-14);c.fillStyle='#ead39d';c.textAlign='center';c.font='bold 30px Georgia';c.fillText("THE LIBRARIAN'S OFFICE",cw/2,48)},620,72);
    const plaque=add(new THREE.PlaneGeometry(2.5,.3),new THREE.MeshStandardMaterial({map:plaqueTex,roughness:.72}),0,3.22,.13,entrance);plaque.userData=entranceData;interactables.push(plaque);
    const entranceLight=new THREE.PointLight(0xffbd72,10,7,2);entranceLight.position.set(0,3.8,.7);entrance.add(entranceLight);

    function build(){if(built)return;built=true;scene.add(root);
      box(w,.42,d,MAT.wood,cx,-.21,cz);const floorGeometry=new THREE.PlaneGeometry(w-.3,d-.3),floorUV=floorGeometry.attributes.uv;for(let i=0;i<floorUV.count;i++)floorUV.setXY(i,floorUV.getX(i)*(w-.3)/37.8,floorUV.getY(i)*(d-.3)/61.8);const floorOverlay=add(floorGeometry,publicParquet,cx,.006,cz);floorOverlay.rotation.x=-Math.PI/2;box(w,.35,d,MAT.darkWood,cx,6.05,cz);box(w,6,.45,publicStone,cx,3,cz-d/2);box(w,6,.45,publicStone,cx,3,cz+d/2);box(.45,6,d,publicStone,cx-w/2,3,cz);box(.45,6,d,publicStone,cx+w/2,3,cz);box(w-.5,2.1,.12,MAT.wood2,cx,1.05,cz-d/2+.36);box(w-.5,.13,.18,MAT.darkWood,cx,2.06,cz-d/2+.43);
      const rug=add(new THREE.PlaneGeometry(10,7),new THREE.MeshStandardMaterial({color:0x4b2026,roughness:1}),cx,.015,cz);rug.rotation.x=-Math.PI/2;
      box(7,.35,3,MAT.darkWood,cx,1.38,cz-1);for(const dx of [-3,3])for(const dz of [-1.05,1.05])box(.28,1.4,.28,MAT.wood,cx+dx,.7,cz-1+dz);
      note(box(2.15,.08,1.45,paper,cx-1.5,1.61,cz-1),'The appointments ledger','Tomorrow is fully booked in several different handwritings, including yours.','READ');
      note(box(1.65,.07,1.15,paper,cx+1.15,1.62,cz-.7),'An unsent letter','“Dear Conductor, the Moon shipment arrived nine years before we dispatched it. Please adjust the ledger, not the books.”','READ');
      const cup=add(new THREE.CylinderGeometry(.3,.24,.52,16),new THREE.MeshStandardMaterial({color:0x31544d,roughness:.72}),cx+2.6,1.82,cz-1.65);note(cup,'A cup of cold tea','A ring beneath it marks a map location that does not otherwise exist.');
      const mapTex=canvasTexture((c,cw,ch)=>{c.fillStyle='#bfae7c';c.fillRect(0,0,cw,ch);c.strokeStyle='#59452d';c.lineWidth=5;for(let i=0;i<9;i++){c.beginPath();c.moveTo(30+i*65,30);c.bezierCurveTo(120,90+i*8,420,20+i*10,cw-30,ch-30);c.stroke()}c.fillStyle='#6a2020';c.font='bold 30px Georgia';c.fillText('NOT TO SCALE · NOT ENTIRELY HERE',65,ch-35)},760,420);
      const plans=add(new THREE.PlaneGeometry(5.7,3.2),new THREE.MeshStandardMaterial({map:mapTex,roughness:.9}),cx,3.65,cz-d/2+.24);note(plans,'Plans of the library','Several wings are drawn beyond the paper. One pencilled line reaches the Moon.','STUDY');
      const cabinet=box(3.4,4.4,1.05,MAT.darkWood,cx+w/2-1.05,2.2,cz+1.6);for(let row=0;row<5;row++){const drawer=box(2.7,.58,.08,MAT.wood,cx+w/2-1.58,.65+row*.74,cz+1.6);drawer.rotation.y=Math.PI/2;note(drawer,row===2?'The drawer marked LOST KEYS':'A catalogue drawer',row===2?'Inside are keys labelled MOON, BELOW, TOMORROW, and STAFF ONLY. The last is missing.':'The cards describe rooms by the books they are still waiting for.','OPEN')}
      const clockFace=add(new THREE.CircleGeometry(.82,24),paper,cx-w/2+.24,3.75,cz-1);clockFace.rotation.y=Math.PI/2;note(clockFace,'The office clock','It has stopped at thirteen minutes past midnight, but the second hand still listens.');
      for(const side of [-1,1]){box(4.4,4.5,.55,MAT.darkWood,cx+side*5.6,2.25,cz+d/2-.6);for(let row=0;row<4;row++)box(4.2,.1,.7,MAT.brass,cx+side*5.6,.55+row*1.05,cz+d/2-.7)}
      const officeBooks=[1497,3207,5740,103,164,19103].map(id=>books.find(book=>book.id===id)).filter(Boolean);officeBooks.forEach((book,i)=>{const x=cx-6.8+(i%3)*1.2,z=cz+d/2-.95-(i>2?1.15:0),bm=box(.72,1,.14,new THREE.MeshStandardMaterial({map:coverTexture(book),roughness:.75}),x,.95+(i>2?1.1:0),z);bm.userData={type:'book',book,loaded:true,home:{position:bm.position.clone(),quaternion:bm.quaternion.clone(),parent:root}};interactables.push(bm)});
      const returnData={type:'librarian-office-exit',title:'Return to the east wing',author:'The office door remembers which side of the wall you entered from.',action:'RETURN'};
      const exit=box(2.4,3.9,.2,MAT.darkWood,cx,1.95,cz+d/2-.28);exit.userData=returnData;interactables.push(exit);officeDoorDetails(root,cx,1.95,cz+d/2-.15);for(const ex of [cx-1.34,cx+1.34])box(.18,4.2,.28,MAT.brass,ex,2.1,cz+d/2-.18);box(2.85,.18,.28,MAT.brass,cx,4.18,cz+d/2-.18);
      const lamp=new THREE.PointLight(0xffc982,19,18,2);lamp.position.set(cx,4.3,cz);root.add(lamp);box(.35,.55,.35,brassGlow,cx,3.95,cz);
    }
    function contains(x,z){return x>cx-w/2&&x<cx+w/2&&z>cz-d/2&&z<cz+d/2}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){const r=player.radius;if(!contains(x-r,z-r)||!contains(x+r,z+r))return false;const blocked=x>cx-3.9&&x<cx+3.9&&z>cz-2.7&&z<cz+.7;return !blocked}
    function interact(object){const type=object?.userData?.type;if(type==='librarian-office-door'){build();move(cx,cz+4.8,Math.PI);showNotice('The office smells of dust, cold tea, and rain-damp correspondence. Nothing on the desk appears private enough to be accidental.',8);playSample?.('doorOpen',.85,.96);return true}if(type==='librarian-office-exit'){move(35, -11.1, Math.PI);showNotice('The east wing is exactly where the office left it.',5);playSample?.('doorOpen',.85,1);return true}if(type==='librarian-office-object'){showNotice(object.userData.author,10);return true}return false}
    return {contains,floorAt,allowed,interact,entrance,get built(){return built}};
  };
})();
