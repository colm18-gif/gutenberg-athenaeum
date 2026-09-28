// Halloween night: from 24 October to 2 November (the reader's own dates), the Grand Hall keeps Oíche Shamhna.
// Carved lanterns glow by the doors and the rug, one of them a turnip, as they were carved in Ireland before anyone
// had seen a pumpkin, and a table by the entrance holds the library's ghost stories face-out, with a card on Samhain.
// ?halloween shows it on any night, ?nohalloween hides it.
//
// Nothing here adds a light: the lanterns glow through their own emissive faces, all sharing one material, so one
// number flickers them all. The pumpkins are a single InstancedMesh, and nothing is built outside the season.
(function(){
  'use strict';

  const SEASON={from:[10,24],to:[11,2]};   // month (1-12), day, inclusive
  // Face-out on the table, the first eight of these that are in the catalogue: Poe (the Raven volume first), Sleepy
  // Hollow, and the four Irish books the card names.
  const TABLE_BOOKS=[2151,2147,1064,41,345,10007,14851,14522,8486,209,12122,84];
  // By the west wall near the entrance, turned to face the reader coming in (the start is at 0, 24).
  const TABLE={x:-9.6,z:25.8,w:3.4,d:1.3,h:.82,yaw:1.76};
  // Floor lanterns: flanking the south doors (grinning into the hall) and at the corners of the great rug (grinning
  // back at the reader who has just come in). yaw 0 turns a face to -z.
  const LANTERNS=[{x:-2.1,z:29.6,s:.36,yaw:.2},{x:2.1,z:29.6,s:.33,yaw:-.25},{x:-6.4,z:20.4,s:.3,yaw:Math.PI-.3},{x:6.4,z:20.4,s:.32,yaw:Math.PI+.3},{x:6.9,z:29.2,s:.27,yaw:.2},{x:10.3,z:29.2,s:.3,yaw:-.2}];

  function inSeason(date,search=''){
    const q=new URLSearchParams(search);if(q.has('nohalloween'))return false;if(q.has('halloween'))return true;
    const m=date.getMonth()+1,d=date.getDate(),v=m*100+d;return v>=SEASON.from[0]*100+SEASON.from[1]&&v<=SEASON.to[0]*100+SEASON.to[1];
  }

  window.createHalloween=function(options){
    const {THREE,scene,MAT,interactables,canvasTexture,bookMaterial,findBook,showNotice,collider,today=()=>new Date(),search=location.search}=options;
    if(!inSeason(today(),search))return {active:false,inSeason,update(){},interact:()=>false,greeting:null};
    const root=new THREE.Group();root.name='halloween';scene.add(root);
    const add=(geometry,material,x,y,z,parent=root)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m};
    const table=new THREE.Group();table.name='halloween-table';table.position.set(TABLE.x,0,TABLE.z);table.rotation.y=TABLE.yaw;root.add(table);table.updateMatrixWorld(true);
    const onTable=(x,y,z)=>new THREE.Vector3(x,y,z).applyMatrix4(table.matrixWorld);

    // ---------- the lanterns ----------
    // A ribbed sphere; the carved face is drawn on the side facing +z, and glows through emissiveMap.
    function ribbedSphere(ribs,depth){const g=new THREE.SphereGeometry(1,28,18),p=g.attributes.position,v=new THREE.Vector3();
      for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const a=Math.atan2(v.z,v.x),k=1+depth*Math.cos(a*ribs);p.setXYZ(i,v.x*k,v.y*.82,v.z*k)}g.computeVertexNormals();return g}
    const face=(skin,glow)=>canvasTexture((c,W,H)=>{c.fillStyle=skin;c.fillRect(0,0,W,H);c.fillStyle=glow;
      // Drawn around u=0.75 of SphereGeometry's wrap, which faces -z: yaw 0 grins north.
      const cx=W*.75,cy=H*.52,s=W/12;
      for(const dx of [-1,1]){c.beginPath();c.moveTo(cx+dx*s*1.5,cy-s*1.9);c.lineTo(cx+dx*s*.55,cy-s*.7);c.lineTo(cx+dx*s*2.3,cy-s*.7);c.closePath();c.fill()}
      c.beginPath();c.moveTo(cx,cy-s*.55);c.lineTo(cx-s*.4,cy+s*.1);c.lineTo(cx+s*.4,cy+s*.1);c.closePath();c.fill();
      c.beginPath();c.moveTo(cx-s*2.6,cy+s*.5);for(let k=0;k<=6;k++){const x=cx-s*2.6+k*s*5.2/6;c.lineTo(x,cy+s*(k%2?.95:1.55))}c.lineTo(cx+s*2.6,cy+s*.5);c.quadraticCurveTo(cx,cy+s*2.9,cx-s*2.6,cy+s*.5);c.fill()},512,256);
    const skinMap=canvasTexture((c,W,H)=>{c.fillStyle='#d9661c';c.fillRect(0,0,W,H);c.strokeStyle='rgba(120,48,8,.45)';c.lineWidth=6;for(let i=0;i<16;i++){c.beginPath();c.moveTo(i*W/16,0);c.lineTo(i*W/16,H);c.stroke()}},512,256);
    const glowMap=face('#000000','#ffd27a');
    const pumpkinMaterial=new THREE.MeshStandardMaterial({map:skinMap,color:0xffffff,roughness:.7,emissive:0xff9a3c,emissiveMap:glowMap,emissiveIntensity:1.6});
    const pumpkins=new THREE.InstancedMesh(ribbedSphere(8,.07),pumpkinMaterial,LANTERNS.length+2);pumpkins.name='halloween-lanterns';root.add(pumpkins);
    const stems=new THREE.InstancedMesh(new THREE.CylinderGeometry(.08,.12,.34,7),new THREE.MeshStandardMaterial({color:0x4d5a22,roughness:.9}),LANTERNS.length+2);root.add(stems);
    const place=new THREE.Object3D();let n=0;
    const lantern=(x,y,z,s,yaw)=>{place.position.set(x,y+s*.8,z);place.rotation.set(0,yaw,0);place.scale.setScalar(s);place.updateMatrix();pumpkins.setMatrixAt(n,place.matrix);
      place.position.set(x,y+s*1.72,z);place.scale.setScalar(s);place.rotation.set(.12,yaw,.1);place.updateMatrix();stems.setMatrixAt(n,place.matrix);n++};
    LANTERNS.forEach(l=>{lantern(l.x,0,l.z,l.s,l.yaw);collider?.(l.x,l.z,l.s*2.2,l.s*2.2,'halloween lantern')});
    for(const [lx,lz,ls,ly] of [[-1.42,.33,.17,.15],[1.46,.3,.2,-.2]]){const p=onTable(lx,0,lz);lantern(p.x,TABLE.h,p.z,ls,TABLE.yaw+Math.PI+ly)}
    pumpkins.count=stems.count=n;pumpkins.instanceMatrix.needsUpdate=stems.instanceMatrix.needsUpdate=true;

    // The turnip: smaller, paler, purple at the crown, with its own grim little face.
    const turnipMaterial=new THREE.MeshStandardMaterial({map:canvasTexture((c,W,H)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#5e2a63');g.addColorStop(.36,'#9a6aa0');g.addColorStop(.5,'#efe6cf');g.addColorStop(1,'#e7dcc0');c.fillStyle=g;c.fillRect(0,0,W,H)},256,128),
      roughness:.85,emissive:0xffb04a,emissiveMap:face('#000000','#ffcf70'),emissiveIntensity:1.4});
    const turnip=add(new THREE.SphereGeometry(.2,20,14),turnipMaterial,1.02,TABLE.h+.19,.4,table);turnip.scale.set(1,.9,1);turnip.rotation.y=Math.PI;
    const tuft=add(new THREE.ConeGeometry(.06,.22,6),new THREE.MeshStandardMaterial({color:0x5a6b2a,roughness:.9}),1.02,TABLE.h+.42,.4,table);
    const turnipCard={type:'halloween-card',title:'A turnip lantern',action:'LOOK',
      author:'A turnip lantern, as they were carved in Ireland for Samhain long before anyone had seen a pumpkin. Hollowing one out takes an evening and a strong spoon.'};
    for(const part of [turnip,tuft]){part.userData=turnipCard;interactables.push(part)}

    // ---------- the Samhain table ----------
    // Built in its own frame (x across, +z towards the reader), then turned into place.
    const wood=MAT.darkWood;add(new THREE.BoxGeometry(TABLE.w,.08,TABLE.d),wood,0,TABLE.h-.04,0,table);
    for(const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]])add(new THREE.BoxGeometry(.09,TABLE.h-.08,.09),wood,dx*(TABLE.w/2-.12),(TABLE.h-.08)/2,dz*(TABLE.d/2-.12),table);
    add(new THREE.BoxGeometry(TABLE.w+.1,.012,.5),new THREE.MeshStandardMaterial({color:0x2a0f18,roughness:.9}),0,TABLE.h+.007,.1,table);
    {const c=Math.abs(Math.cos(TABLE.yaw)),s=Math.abs(Math.sin(TABLE.yaw));collider?.(TABLE.x,TABLE.z,TABLE.w*c+TABLE.d*s+.3,TABLE.w*s+TABLE.d*c+.3,'halloween table')}
    const card={type:'halloween-card',title:'Oíche Shamhna · All Hallows’ Eve',action:'READ',
      author:'Samhain, on the night of 31 October, ended the harvest and began the winter in Gaelic Ireland, and on that night the door to the otherworld was thought to stand ajar. The Irish carved their lanterns from turnips; emigrants took the night to America, where pumpkins were easier to carve. Dracula, Carmilla, Uncle Silas and The Canterville Ghost on this table were all written by Irishmen.'};
    const sign=canvasTexture((c,W,H)=>{c.fillStyle='#160c10';c.fillRect(0,0,W,H);c.strokeStyle='#c7853a';c.lineWidth=5;c.strokeRect(6,6,W-12,H-12);c.textAlign='center';
      c.fillStyle='#ffcf8a';c.font=`bold ${Math.round(H*.3)}px Georgia`;c.fillText('OÍCHE SHAMHNA',W/2,H*.47);c.font=`italic ${Math.round(H*.19)}px Georgia`;c.fillStyle='#e8b36a';c.fillText('All Hallows’ Eve · ghost stories for a dark night',W/2,H*.78)},720,150);
    const plate=add(new THREE.PlaneGeometry(1.5,.31),new THREE.MeshStandardMaterial({map:sign,emissive:0xffffff,emissiveMap:sign,emissiveIntensity:.3,roughness:.8}),0,TABLE.h+.2,.52,table);
    plate.rotation.x=-.35;plate.userData=card;interactables.push(plate);

    // The books, lying back at an angle on the far half of the table, covers to the reader.
    const shelf=TABLE_BOOKS.map(id=>findBook(id)).filter(Boolean).slice(0,8),books=[],geometry=new THREE.BoxGeometry(.44,.6,.05);
    shelf.forEach((book,i)=>{const across=(i-(shelf.length-1)/2)*.4,mesh=add(geometry,bookMaterial(book),across,TABLE.h+.26,-.05+(i%2)*.06,table);
      mesh.rotation.order='YXZ';mesh.rotation.y=(i%3-1)*.05;mesh.rotation.x=-.42;
      mesh.userData={type:'book',book,loaded:false,halloween:true,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:table}};interactables.push(mesh);books.push(mesh)});

    // ---------- the flicker ----------
    // Two slow waves and a quick one: candle-like, never quite repeating, the same for every lantern.
    function update(t){const f=1.45+.22*Math.sin(t*2.3)+.14*Math.sin(t*5.7+1.3)+.08*Math.sin(t*13.1);pumpkinMaterial.emissiveIntensity=f;turnipMaterial.emissiveIntensity=f*.85}
    function interact(object){const d=object?.userData;if(d?.type!=='halloween-card')return false;showNotice(`${d.title}: ${d.author}`,d.action==='READ'?14:8);return true}
    const greeting='Oíche Shamhna shona! It is Halloween week in the library: the lanterns are lit, and the ghost stories are out on the table by the door.';
    return {active:true,inSeason,update,interact,greeting,books,root,table:TABLE,lanterns:n};
  };
  window.createHalloween.inSeason=inSeason;
})();
