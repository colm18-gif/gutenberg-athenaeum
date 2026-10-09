// The Kipling bookcase: a walnut case against the Grand Hall's west wall, in the south-west corner between the last
// column and the corner, with Rudyard Kipling's books face-out in the order he published them (the shelf `kipling`
// in data/new-books.js) and a brass plate on top. Reading the plate says where his other books are.
// ?room=kipling goes straight to it.
//
// No light of its own: the hall's lamps reach it. Ten plain boxes and the books.
(function(){
  'use strict';

  // The wall's face is at x -18.75; the column at (-17, 27) and the south wall (z 30.52) leave z 27.8 to 30.3 clear.
  const CASE={x:-18.54,z:29.1,w:2.2,h:2.62,d:.42};
  const ROWS=4,PER_ROW=3,BOARD_Y=[.08,.72,1.36,2];
  // Where a reader stands to look at it: in front of the case, facing west.
  const VIEW={x:-15.9,z:29.1,yaw:Math.PI/2};

  window.createKiplingShelf=function(options){
    const {THREE,scene,MAT,interactables,canvasTexture,bookMaterial,books=[],showNotice,collider}=options;
    const shelf=books.slice(0,ROWS*PER_ROW);if(!shelf.length)return null;
    // Built facing +z, then turned so the covers face the hall (+x).
    const root=new THREE.Group();root.name='kipling-shelf';root.position.set(CASE.x,0,CASE.z);root.rotation.y=Math.PI/2;scene.add(root);
    const add=(geometry,material,x,y,z)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);root.add(m);return m};
    const wood=MAT.darkWood,half=CASE.w/2;
    for(const side of [-1,1])add(new THREE.BoxGeometry(.06,CASE.h,CASE.d),wood,side*(half-.03),CASE.h/2,0);
    add(new THREE.BoxGeometry(CASE.w,CASE.h,.03),wood,0,CASE.h/2,-CASE.d/2+.015);
    for(const y of BOARD_Y)add(new THREE.BoxGeometry(CASE.w-.12,.04,CASE.d-.03),wood,0,y,.015);
    add(new THREE.BoxGeometry(CASE.w+.12,.08,CASE.d+.08),wood,0,CASE.h+.04,.02);
    collider?.(CASE.x,CASE.z,CASE.d+.3,CASE.w+.2,'kipling bookcase');

    const card={type:'kipling-card',title:'Rudyard Kipling, 1865–1936',action:'READ',
      author:'Kipling was born in Bombay, sent to school in England, a newspaperman in Lahore at sixteen, and lived his last thirty-four years at Bateman’s in Sussex. This case holds his books in the order he published them, from Plain Tales from the Hills (1888) to Rewards and Fairies (1910). Kim, The Jungle Book, Just So Stories, Captains Courageous and The Man Who Would Be King are elsewhere in the library, where readers have grown used to finding them.'};
    const plateTexture=canvasTexture((c,W,H)=>{c.fillStyle='#8a6a2e';c.fillRect(0,0,W,H);c.strokeStyle='#3a2a10';c.lineWidth=4;c.strokeRect(8,8,W-16,H-16);c.textAlign='center';c.fillStyle='#24180a';
      c.font=`bold ${Math.round(H*.36)}px Georgia`;c.fillText('RUDYARD KIPLING',W/2,H*.5);c.font=`italic ${Math.round(H*.2)}px Georgia`;c.fillText('1865 – 1936 · from Bombay to Burwash',W/2,H*.8)},720,150);
    const plate=add(new THREE.PlaneGeometry(1.5,.31),new THREE.MeshStandardMaterial({map:plateTexture,metalness:.35,roughness:.45}),0,CASE.h+.26,.05);
    plate.rotation.x=-.12;plate.userData=card;interactables.push(plate);
    add(new THREE.BoxGeometry(1.56,.37,.03),MAT.brass||wood,0,CASE.h+.26,.03).rotation.x=-.12;

    // Face-out, three to a shelf, leaning back a little against the case.
    const geometry=new THREE.BoxGeometry(.42,.56,.05),meshes=[];
    shelf.forEach((book,i)=>{const row=Math.floor(i/PER_ROW),col=i%PER_ROW;
      const mesh=add(geometry,bookMaterial(book),(col-(PER_ROW-1)/2)*.66,BOARD_Y[ROWS-1-row]+.31,-.02);mesh.rotation.x=-.1;
      mesh.userData={type:'book',book,loaded:false,kiplingShelf:true,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};interactables.push(mesh);meshes.push(mesh)});

    function interact(object){const d=object?.userData;if(d?.type!=='kipling-card')return false;showNotice(`${d.title}: ${d.author}`,16);return true}
    return {interact,books:meshes,root,view:VIEW};
  };
})();
