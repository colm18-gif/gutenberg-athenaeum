// Emily Dickinson's room: her bedroom at the Homestead in Amherst, where she wrote nearly eighteen hundred poems and
// published about ten. Through a white-painted door in the Long Corridor's west wall (fourth bay; long-corridor.js hands
// over `dickinsonDoor`). Rose-sprigged wallpaper, straw matting, a sleigh bed, and by the west window a writing table
// about eighteen inches square with the room's one lamp; through the window the garden in a low sun, and its light lying
// aslant across the floor (painted: a window that glows and a patch on the matting, no light of their own).
//
// Books: the three series of Poems as first published (north wall, under the daguerreotype), what she read (east wall,
// after the library's own Jane Eyre, Middlemarch, Sonnets from the Portuguese and Representative Men), her circle
// (Higginson and Helen Hunt Jackson) and the garden shelf by the window; shelves `dickinson-*` in data/new-books.js.
// Under glass in the middle, her herbarium, drawn by the library (Commons has no photographs of the real one, which is
// at Harvard's Houghton Library): flowers she wrote poems about, labelled as she labelled hers. Framed: the daguerreotype
// of about 1847 and three poems in her own hand (assets/pictures, fetched by scripts/fetch-maps.mjs); looked at, each opens
// large in the picture card. Her white dress stands on a form by the door, and the basket hangs at the window.
//
// The secret is the bureau: after she died her sister Lavinia found the poems there, forty little booklets sewn with
// thread and many loose sheets. Open the bottom drawer and they are in it, and the complete Poems (`dickinson-drawer`)
// is left on top; found once, found for good (athenaeum-dickinson-drawer; ?drawer shows it). Every line of hers quoted
// here (`LINES`) is checked against the library's own text of the Poems by a test. Built when the reader comes near its
// door, freed a little while after they leave.
(function(){
  'use strict';

  // The library's own copies that stand on the shelf of what she read: Jane Eyre, Middlemarch, Sonnets from the
  // Portuguese, and Emerson's Representative Men (from the Concord shelf at Walden).
  const OWN=[1260,145,2002,6312];
  const GROUPS=[
    {key:'poems',name:'POEMS',sub:'As they were first published, 1890 to 1896',wall:'north',along:-2.5,length:3.2,max:4,ids:[]},
    {key:'read',name:'WHAT SHE READ',sub:'The Brontës, Mrs Browning, George Eliot',wall:'east',along:-1.6,length:4.2,max:8,ids:OWN},
    {key:'circle',name:'HER CIRCLE',sub:'Colonel Higginson and Helen Hunt Jackson',wall:'east',along:2.75,length:3.2,max:6,ids:[]},
    {key:'garden',name:'THE GARDEN',sub:'Botany and the language of flowers',wall:'west',along:-3.1,length:2.2,max:4,ids:[]}
  ];
  // Her own lines, as the first editions print them (Poems, three series, 1890–96: the library's text). `/` is a line end.
  const LINES={
    letter:'This is my letter to the world, / That never wrote to me,',
    slant:'There’s a certain slant of light, / On winter afternoons, / That oppresses, like the weight / Of cathedral tunes.',
    alabaster:'Safe in their alabaster chambers, / Untouched by morning and untouched by noon,',
    wild:'Wild nights! Wild nights! / Were I with thee, / Wild nights should be / Our luxury!',
    liquor:'I taste a liquor never brewed, / From tankards scooped in pearl;',
    nobody:'I’m nobody! Who are you? / Are you nobody, too?',
    success:'Success is counted sweetest / By those who ne’er succeed.',
    prairie:'To make a prairie it takes a clover and one bee,',
    gentian:'The gentian weaves her fringes, / The maple’s loom is red.',
    clover:'There is a flower that bees prefer, / And butterflies desire;',
    arbutus:'Pink, small, and punctual, / Aromatic, low,',
    daisy:'The daisy follows soft the sun,'
  };
  const q=key=>`“${LINES[key]}”`;
  // The drawn herbarium's specimens: each a flower she wrote a poem about, under the Latin name of her day.
  const SPECIMENS=[
    {name:'Gentiana crinita',common:'fringed gentian',line:'gentian',petal:'#4b5fb0',kind:'fringe'},
    {name:'Trifolium pratense',common:'red clover',line:'clover',petal:'#a2547f',kind:'head'},
    {name:'Epigaea repens',common:'trailing arbutus, the mayflower',line:'arbutus',petal:'#e2a3b4',kind:'cluster'},
    {name:'Chrysanthemum leucanthemum',common:'ox-eye daisy',line:'daisy',petal:'#f1ead4',kind:'rays'}
  ];
  const CARDS={
    sign:['Emily Dickinson’s room','Amherst, Massachusetts, 1830 to 1886. The corner bedroom of her father’s house, the Homestead, where she wrote nearly eighteen hundred poems and published about ten, none under her name. This room is larger than hers, to make space for the books.'],
    table:['Her writing table',`A cherry table about eighteen inches square, with a lamp, by the window. Nearly all of the poems were written at one like it. ${q('nobody')}`],
    window:['The west window',`The garden in a low sun, and the light coming in aslant across the matting. ${q('slant')}`],
    basket:['A basket on a cord','From her window she let gingerbread down in a basket to the children playing below, and they remembered it all their lives.'],
    bed:['A sleigh bed','A narrow sleigh bed with a white counterpane. She died in this room on the fifteenth of May 1886, aged fifty-five.'],
    portraits:['Three portraits','Elizabeth Barrett Browning, George Eliot and Thomas Carlyle: the three whose pictures she kept on her bedroom wall. The frames here are empty ovals; the books of the first two are on the shelf beside them.'],
    dress:['A white dress','In her later years she dressed in white. One dress of hers survives, in Amherst: plain white cotton, buttoned down the front, with a pocket large enough for a pencil and a folded sheet of paper.'],
    bureau:['A cherry bureau','A chest of four drawers. The top ones hold what a bureau holds. The bottom drawer is not quite shut.'],
    herbarium:['Her herbarium',`As a schoolgirl she pressed more than four hundred plants into an album of sixty-six pages and labelled each with its Latin name. The real album is at Harvard’s Houghton Library, too fragile now to be handled, and there is no photograph of it the library may use: this opening is drawn by the library, with four flowers she wrote poems about, named as the botany of her day named them. ${q('prairie')}`],
    daguerreotype:['Emily Dickinson, about 1847','A daguerreotype taken when she was sixteen or so, a student at Mount Holyoke: the one photograph of her that is certain. Asked years later for a portrait, she sent a description instead: small, like the wren, with eyes like the sherry in the glass that the guest leaves.'],
    alabaster:['In her own hand: Safe in their Alabaster Chambers',`The poem as she copied it out in 1862, in the pencil-thin slanting hand of those years, with her dashes. ${q('alabaster')} The manuscript is in the Boston Public Library, among the papers of Colonel Higginson.`],
    wild:['In her own hand: Wild Nights',`${q('wild')} When the poems were being edited in 1891, Higginson worried that readers might find more in this one than the poet meant; he printed it all the same.`],
    liquor:['In her own hand: I taste a liquor never brewed',`${q('liquor')} One of the few printed in her lifetime: the Springfield Republican ran it in 1861, unsigned, with its rhymes mended. The manuscript is at Harvard’s Houghton Library.`]
  };
  const PICTURES={
    daguerreotype:{file:'dickinson-daguerreotype',credit:'Daguerreotype, about 1847. Amherst College Archives and Special Collections. Public domain, from Wikimedia Commons.'},
    alabaster:{file:'dickinson-alabaster',credit:'Autograph manuscript, 1862. Boston Public Library, by way of Digital Commonwealth. Public domain, from Wikimedia Commons.'},
    wild:{file:'dickinson-wild-nights',credit:'Autograph manuscript. Public domain, from Wikimedia Commons.'},
    liquor:{file:'dickinson-liquor',credit:'Autograph manuscript, 1861. Houghton Library, Harvard University. Public domain, from Wikimedia Commons.'}
  };
  const FOUND_KEY='athenaeum-dickinson-drawer';

  window.createDickinsonRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,move,analytics,isHolding=()=>false,registerSeat=null,doorKit=null,
      corridor=null,showPicture=null,storage=null,search='',now=()=>new Date(),pictures='assets/pictures/'}=options;
    const DOOR=corridor?.dickinsonDoor||{x:1697.67,z:-2,yaw:Math.PI/2};
    const ROOM={cx:2200,cz:300,w:10,d:9,h:3.4};
    const PRELOAD=7,KEEP=25;
    // Both sides of the door: painted white, four panels, as the doors of the Homestead are.
    const DOOR_LOOK={style:'painted',color:0xe9e4d6,fanColor:0xfff0cf,width:1.7,height:2.9};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||/[?&](drawer|fascicles)\b/.test(search)}catch(e){return false}};
    const winter=()=>{const m=now().getMonth();return m>=10||m<=1};
    let root=null,time=0,lastNeeded=-1e9,bureau=null;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    // The door in the corridor stays when the room is freed, so its parts are not among the room's own.
    function markDoor(object,data){object.userData=data;interactables.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'dickinson-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#f3eee0';c.fillRect(0,0,W,H);c.strokeStyle='#6f7f5a';c.lineWidth=3;c.strokeRect(7,7,W-14,H-14);
        c.fillStyle='#2a2a24';c.textAlign='center';c.font='bold 28px Georgia';c.fillText(text,W/2,sub?52:H/2+10);if(sub){c.font='italic 20px Georgia';c.fillText(sub,W/2,83)}},620,sub?104:70));
      return add(own(new THREE.PlaneGeometry(w,h)),std({map,emissive:0x3a362c,emissiveIntensity:.25,roughness:.9}),x,y,z,parent)}

    const shelfBooks=(ids,room,max)=>[...new Set([...ids,...(arrivals[room]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,max);
    function catalogue(){return {groups:GROUPS.map(group=>({...group,books:shelfBooks(group.ids,group.key,group.max)})),drawer:shelfBooks([],'drawer',1)}}

    // ---------- the door, in the Long Corridor ----------
    function buildDoor(){
      const g=new THREE.Group();g.name='dickinson-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'dickinson-door',title:'Emily Dickinson’s room',author:'A bedroom in Amherst, a table eighteen inches square, and nearly eighteen hundred poems.',action:'ENTER'};
      if(!doorKit?.hang(g,{data,mark:markDoor,...DOOR_LOOK,...doorKit.readingRoom?.('EMILY DICKINSON','Amherst · 1830–1886')}))markDoor(add(new THREE.BoxGeometry(1.7,2.9,.14),new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.7}),0,1.45,.08,g),data);
    }

    // ---------- the room ----------
    function buildRoom(){
      root=new THREE.Group();root.name='dickinson-room';const {cx,cz,w,d,h}=ROOM,x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2;
      // Wallpaper sprigged with roses, white paint, and straw matting on the floor.
      const paper=own(canvasTexture((c,W,H)=>{c.fillStyle='#f4efe2';c.fillRect(0,0,W,H);let k=3;const r=()=>(k=(k*9301+49297)%233280)/233280;
        for(let j=0;j<4;j++)for(let i=0;i<4;i++){const x=(i+.5+(j%2)*.5)*W/4%W,y=(j+.5)*H/4;c.strokeStyle='#7d946a';c.lineWidth=2;c.beginPath();c.moveTo(x,y+16);c.quadraticCurveTo(x-6,y+4,x,y-4);c.stroke();
          c.fillStyle='#8aa276';for(const s of [-1,1]){c.beginPath();c.ellipse(x+s*8,y+8,7,3.4,s*.7,0,7);c.fill()}
          for(let p=0;p<5;p++){const a=p*1.257+r();c.fillStyle=p%2?'#e2a1a8':'#d98b96';c.beginPath();c.arc(x+Math.cos(a)*4,y-6+Math.sin(a)*4,4.6,0,7);c.fill()}c.fillStyle='#c36f7f';c.beginPath();c.arc(x,y-6,2.6,0,7);c.fill()}},256,256));
      paper.wrapS=paper.wrapT=THREE.RepeatWrapping;paper.repeat?.set?.(7,2.6);
      const matting=own(canvasTexture((c,W,H)=>{c.fillStyle='#c9b27c';c.fillRect(0,0,W,H);for(let y=0;y<H;y+=4){c.fillStyle=y%8?'rgba(120,96,52,.28)':'rgba(255,240,200,.16)';c.fillRect(0,y,W,2)}for(let x=0;x<W;x+=64){c.fillStyle='rgba(90,70,36,.35)';c.fillRect(x,0,2,H)}},256,256));
      matting.wrapS=matting.wrapT=THREE.RepeatWrapping;matting.repeat?.set?.(5,5);
      const wall=std({color:0xffffff,map:paper,roughness:.95}),white=std({color:0xe9e4d6,roughness:.7}),cherry=std({color:0x6a2f1e,roughness:.55}),dark=std({color:0x3b2418,roughness:.7}),linen=std({color:0xf2efe6,roughness:.95});
      box(w,.3,d,std({color:0xffffff,map:matting,roughness:.95}),cx,-.15,cz,root);box(w,.2,d,std({color:0xf1ece0,roughness:1}),cx,h+.1,cz,root);
      box(w,h,.3,wall,cx,h/2,z0,root);box(w,h,.3,wall,cx,h/2,z1,root);box(.3,h,d,wall,x0,h/2,cz,root);box(.3,h,d,wall,x1,h/2,cz,root);
      for(const [bx,bz,bw,bd] of [[cx,z0+.17,w,.05],[cx,z1-.17,w,.05],[x0+.17,cz,.05,d],[x1-.17,cz,.05,d]]){box(bw,.18,bd,white,bx,.09,bz,root);box(bw,.1,bd,white,bx,h-.05,bz,root)}
      mark(sign(root,'EMILY DICKINSON','Amherst · 1830–1886',2.6,.44,cx+2.6,h-.42,z0+.17),card('sign'));
      buildWindow(x0+.16,cz+.3);
      // The shelves: white-painted, one or two rows, each under its label.
      const {groups,drawer}=catalogue(),geometry=own(new THREE.BoxGeometry(.66,.9,.12)),ROWS=[1.3,2.36];
      for(const group of groups){
        const per=group.books.length>4?Math.ceil(group.books.length/2):Math.max(1,group.books.length),step=Math.min(1.05,(group.length-.3)/per);
        group.books.forEach((book,i)=>{const row=i<per?0:1,n=row?group.books.length-per:per,col=row?i-per:i,offset=(col-(n-1)/2)*step;placeBook(book,{...shelfSpot(group,offset),y:ROWS[row]},geometry,group.key)});
        const s=shelfSpot(group,0,.34),rows=group.books.length>per?ROWS:ROWS.slice(0,1),top=rows.at(-1)+.82,label=sign(root,group.name,group.sub,2.3,.38,0,top,0);
        if(group.wall==='north'){for(const y of rows)box(group.length,.05,.34,white,s.x,y-.47,s.z,root);block(s.x,s.z,group.length+.2,.7);label.position.set(s.x,top,z0+.17)}
        else{for(const y of rows)box(.34,.05,group.length,white,s.x,y-.47,s.z,root);block(s.x,s.z,.7,group.length+.2);const side=group.wall==='west'?-1:1;label.position.set(cx+side*(w/2-.17),top,s.z);label.rotation.y=-side*Math.PI/2}
        mark(label,{type:'dickinson-card',title:group.name.charAt(0)+group.name.slice(1).toLowerCase(),author:group.sub+'.',action:'READ'});
      }
      // Framed on the walls: the daguerreotype over the poems, the three manuscripts on the south wall.
      hang('daguerreotype',cx-2.5,2.62,z0+.17,0,.62);
      hang('alabaster',cx-3.9,1.95,z1-.17,Math.PI,.62);hang('liquor',cx-2.9,1.95,z1-.17,Math.PI,.62);hang('wild',cx+1.75,1.75,z1-.17,Math.PI,.62);
      buildBed(cx+2.9,z0+1.3,white,linen,cherry);
      buildTable(x0+1.15,cz+.3,cherry);
      buildCase(cx+.2,cz+.9,cherry);
      buildBureau(cx-3.4,z1-.5,cherry,drawer[0]||null);
      buildDress(cx+3.3,z1-.8,linen,dark);
      // The lamp on the writing table is the room's one light.
      const lamp=new THREE.PointLight(0xffd9a6,7,15,2);lamp.position.set(x0+1.3,1.7,cz+.3);root.add(lamp);
      // The way back to the corridor.
      const exit={type:'dickinson-exit',title:'Back to the Long Corridor',author:'Out through the white door, and along the corridor to the Grand Hall.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:exit,mark,x:cx,z:z1-.2,yaw:Math.PI,onward:'towards the Grand Hall',label:'THE LONG CORRIDOR',own,...DOOR_LOOK}))mark(box(1.7,2.9,.16,white,cx,1.45,z1-.2,root),exit);
      scene.add(root);
    }
    function shelfSpot(group,offset,inset=.3){
      const {cx,cz,w,d}=ROOM;if(group.wall==='north')return {x:cx+group.along+offset,z:cz-d/2+inset,yaw:0};
      const side=group.wall==='west'?-1:1;return {x:cx+side*(w/2-inset),z:cz+group.along-side*offset,yaw:-side*Math.PI/2}}
    function placeBook(book,spot,geometry,shelf,parent=root){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,parent);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw||0;mesh.rotation.x=spot.tilt??-.08;
      mesh.userData={type:'book',book,loaded:false,dickinson:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh}
    // A framed picture from assets/pictures: a mount until the photograph arrives, then the photograph at its own shape.
    function hang(key,x,y,z,yaw,width){
      const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=yaw;root.add(g);const p=PICTURES[key],height=width*1.45;
      const data={type:'dickinson-picture',picture:key,title:CARDS[key][0],author:CARDS[key][1],action:'LOOK CLOSELY'};
      const frame=mark(box(width+.12,height+.12,.04,MAT.darkWood||std({color:0x2c1c12,roughness:.6}),0,0,0,g),data);
      const mat=std({color:0xd8cfb8,roughness:.9}),sheet=mark(add(own(new THREE.PlaneGeometry(width,height)),mat,0,0,.025,g),data);
      try{new THREE.TextureLoader().load(`${pictures}${p.file}-wall.jpg`,texture=>{if(!root)return texture.dispose?.();texture.colorSpace=THREE.SRGBColorSpace;own(texture);mat.map=texture;mat.color?.set?.(0xffffff);mat.needsUpdate=true;
        const image=texture.image;if(image?.width&&image?.height){const k=image.height/image.width/1.45;sheet.scale.y=k;frame.scale.y=(height*k+.12)/(height+.12)}})}catch(e){}
    }
    // The west window: the garden and the Pelham hills in a low sun (snow from November to February), and the light it
    // throws lying aslant on the matting. Painted, and glowing a little: no light of its own.
    function buildWindow(x,z){
      const snow=winter(),view=own(canvasTexture((c,W,H)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,snow?'#b9c6d6':'#9fc0dc');g.addColorStop(.5,snow?'#f1d9b4':'#f6dca0');g.addColorStop(.62,'#f4c98a');c.fillStyle=g;c.fillRect(0,0,W,H);
        const sun=c.createRadialGradient(W*.3,H*.5,4,W*.3,H*.5,W*.5);sun.addColorStop(0,'rgba(255,246,214,1)');sun.addColorStop(1,'rgba(255,230,170,0)');c.fillStyle=sun;c.fillRect(0,0,W,H);
        c.fillStyle=snow?'#8a93a6':'#6f8b78';c.beginPath();c.moveTo(0,H*.62);for(let x2=0;x2<=W;x2+=20)c.lineTo(x2,H*.6-Math.sin(x2*.012)*18-Math.sin(x2*.031)*8);c.lineTo(W,H);c.lineTo(0,H);c.fill();
        c.fillStyle=snow?'#eef0f2':'#7fa35a';c.fillRect(0,H*.68,W,H);let k=5;const r=()=>(k=(k*9301+49297)%233280)/233280;
        for(let i=0;i<5;i++){const tx=W*(.08+i*.21+r()*.05),ty=H*.7;c.strokeStyle='#3b2c20';c.lineWidth=5;c.beginPath();c.moveTo(tx,ty+40);c.lineTo(tx,ty-50);c.stroke();
          if(snow){c.lineWidth=2;for(let b=0;b<7;b++){c.beginPath();c.moveTo(tx,ty-10-b*6);c.lineTo(tx+(b%2?1:-1)*(16+r()*22),ty-34-b*7);c.stroke()}}else{c.fillStyle='#4f7a3e';c.beginPath();c.arc(tx,ty-58,30+r()*10,0,7);c.fill()}}
        if(!snow)for(let i=0;i<70;i++){c.fillStyle=['#d98b96','#f1ead4','#a2547f','#e8c04a','#4b5fb0'][i%5];c.beginPath();c.arc(r()*W,H*.78+r()*H*.2,2+r()*2.4,0,7);c.fill()}},384,512));
      const g=new THREE.Group();g.position.set(x,1.85,z);g.rotation.y=Math.PI/2;root.add(g);
      const pane=add(own(new THREE.PlaneGeometry(1.5,2.1)),std({map:view,emissive:0xffffff,emissiveMap:view,emissiveIntensity:.8,roughness:.4}),0,0,0,g);mark(pane,card('window'));
      const white=std({color:0xf1ece0,roughness:.6});for(const sx of [-.8,0,.8])box(sx?.1:.05,2.3,.07,white,sx,0,.03,g);for(const sy of [-1.1,0,1.1])box(1.7,sy?.1:.05,.07,white,0,sy,.03,g);
      const muslin=std({color:0xfbf8f0,roughness:1,transparent:true,opacity:.86,side:THREE.DoubleSide});for(const sx of [-1.02,1.02])add(own(new THREE.PlaneGeometry(.42,2.5)),muslin,sx,-.05,.09,g);
      // The slant of light: a long pale parallelogram across the floor from the window, and motes are left to the reader.
      const patch=own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);const gr=c.createLinearGradient(0,0,W,0);gr.addColorStop(0,'rgba(255,232,180,.75)');gr.addColorStop(1,'rgba(255,232,180,0)');c.fillStyle=gr;
        c.beginPath();c.moveTo(0,H*.18);c.lineTo(W,H*.5);c.lineTo(W,H);c.lineTo(0,H*.62);c.fill();c.clearRect(0,H*.39,W*.6,6);c.globalCompositeOperation='destination-out';c.fillStyle='rgba(0,0,0,.5)';c.fillRect(W*.02,0,6,H)},256,256));
      const slant=add(own(new THREE.PlaneGeometry(4.6,3)),own(new THREE.MeshBasicMaterial({map:patch,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.5})),x+2.5,.012,z+.9,root);slant.rotation.x=-Math.PI/2;slant.raycast=()=>{};
      // The basket on its cord, hung from the sill.
      const wicker=std({color:0xa98350,roughness:.95}),b=new THREE.Group();b.position.set(x+.22,.95,z-1.02);root.add(b);
      const body=add(own(new THREE.CylinderGeometry(.17,.13,.16,14,1,true)),wicker,0,0,0,b);body.material.side=THREE.DoubleSide;add(own(new THREE.TorusGeometry(.17,.016,5,16,Math.PI)),wicker,0,.08,0,b);
      const cord=add(own(new THREE.CylinderGeometry(.006,.006,.6,4)),std({color:0xd8ceb4,roughness:1}),0,.47,0,b);for(const part of [body,cord])mark(part,card('basket'));
    }
    // The writing table, about eighteen inches square, with its lamp, a sheet of paper and a pencil, and her chair.
    function buildTable(x,z,cherry){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);const top=box(.46,.03,.46,cherry,0,.72,0,g);for(const [lx,lz] of [[-.19,-.19],[.19,-.19],[-.19,.19],[.19,.19]])box(.035,.71,.035,cherry,lx,.355,lz,g);
      const drawer=box(.36,.09,.02,cherry,.0,.65,.225,g);for(const part of [top,drawer])mark(part,card('table'));
      const paperSheet=add(own(new THREE.PlaneGeometry(.2,.28)),std({color:0xf4eedd,roughness:.9}),.04,.737,.04,g);paperSheet.rotation.x=-Math.PI/2;paperSheet.rotation.z=.2;mark(paperSheet,card('table'));
      const pencil=add(own(new THREE.CylinderGeometry(.006,.006,.16,6)),std({color:0x3a2a1c}),.15,.742,.02,g);pencil.rotation.z=Math.PI/2;pencil.rotation.y=.5;
      const brass=MAT.brass||std({color:0xb08d3a,metalness:.6,roughness:.4});add(own(new THREE.CylinderGeometry(.05,.07,.05,12)),brass,-.13,.76,-.12,g);add(own(new THREE.CylinderGeometry(.02,.02,.16,8)),brass,-.13,.86,-.12,g);
      mark(add(own(new THREE.SphereGeometry(.075,14,10)),std({color:0xfff1d0,emissive:0xffc978,emissiveIntensity:1.5,roughness:.4,transparent:true,opacity:.92}),-.13,1,-.12,g),card('table'));
      block(x,z,.6,.6);
      // Her chair, drawn up to the table from the room's side: one of the library's seats.
      const chair=new THREE.Group();chair.position.set(x+.62,0,z+.02);chair.rotation.y=-Math.PI/2;root.add(chair);const parts=[box(.42,.04,.4,cherry,0,.46,0,chair),box(.42,.5,.035,cherry,0,.78,-.19,chair)];
      for(const [lx,lz] of [[-.18,-.17],[.18,-.17],[-.18,.17],[.18,.17]])box(.035,.46,.035,cherry,lx,.23,lz,chair);block(x+.62,z+.02,.5,.5);
      registerSeat?.(parts,chair,new THREE.Vector3(0,1.18,.05),-Math.PI/2,{title:'Her chair at the writing table',author:'Sit at the little table by the window and read one of the room’s books.',bookIds:books.map(b=>b.userData.book.id)});
      for(const part of parts)ours.push(part);
    }
    // The sleigh bed, head to the north wall, and over it three empty oval frames for the portraits she kept.
    function buildBed(x,z,white,linen,cherry){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);const parts=[box(1.2,.24,2.05,cherry,0,.36,0,g),box(1.14,.16,1.98,linen,0,.56,0,g),box(1.26,.95,.08,cherry,0,.6,-1.04,g),box(1.26,.62,.08,cherry,0,.43,1.04,g),box(.9,.12,.4,linen,0,.68,-.72,g)];
      for(const part of parts)mark(part,card('bed'));block(x,z,1.4,2.2);
      const gilt=MAT.brass||std({color:0xb08d3a,metalness:.6,roughness:.4}),shade=std({color:0x2a231c,roughness:.9});
      [-.55,0,.55].forEach(dx=>{const ring=add(own(new THREE.TorusGeometry(.15,.02,6,20)),gilt,x+dx,2.2,z-1.13,root);ring.scale.set(.82,1.1,1);const oval=add(own(new THREE.CircleGeometry(.14,18)),shade,x+dx,2.2,z-1.125,root);oval.scale.set(.82,1.1,1);mark(ring,card('portraits'));mark(oval,card('portraits'))});
    }
    // The herbarium, open under glass on a small table: two pages of pressed flowers, drawn, each with its label.
    function buildCase(x,z,cherry){
      const pages=own(canvasTexture((c,W,H)=>{c.fillStyle='#e9dfc4';c.fillRect(0,0,W,H);c.fillStyle='rgba(120,96,60,.25)';c.fillRect(W/2-3,0,6,H);let k=11;const r=()=>(k=(k*9301+49297)%233280)/233280;
        for(let i=0;i<260;i++){c.fillStyle=`rgba(140,112,70,${r()*.08})`;c.fillRect(r()*W,r()*H,2+r()*5,1+r()*3)}
        SPECIMENS.forEach((s,i)=>{const px=(i%2?.3:.2)*W/2+(i<2?0:W/2)+W*.08,py=(i%2?.66:.3)*H,stem=120;c.save();c.translate(px,py);c.rotate((r()-.5)*.5);
          c.strokeStyle='#6f7445';c.lineWidth=3;c.beginPath();c.moveTo(0,stem*.5);c.quadraticCurveTo(10,0,0,-stem*.5);c.stroke();c.fillStyle='#7f8552';
          for(const [ly,sd] of [[20,1],[-6,-1],[-28,1]]){c.beginPath();c.ellipse(sd*14,ly,16,5,sd*.6,0,7);c.fill()}c.fillStyle=s.petal;c.strokeStyle='rgba(60,50,40,.35)';c.lineWidth=1;
          if(s.kind==='rays'){for(let p=0;p<14;p++){c.save();c.translate(0,-stem*.5);c.rotate(p*Math.PI/7);c.beginPath();c.ellipse(0,-16,4,12,0,0,7);c.fill();c.stroke();c.restore()}c.fillStyle='#c9a13a';c.beginPath();c.arc(0,-stem*.5,7,0,7);c.fill()}
          else if(s.kind==='head'){for(let p=0;p<22;p++){c.beginPath();c.ellipse((r()-.5)*22,-stem*.5-6+(r()-.5)*20,3,7,r()*3,0,7);c.fill()}}
          else if(s.kind==='cluster'){for(let p=0;p<6;p++){const ax=(r()-.5)*34,ay=-stem*.5+(r()-.5)*22;for(let t=0;t<5;t++){c.beginPath();c.arc(ax+Math.cos(t*1.257)*5,ay+Math.sin(t*1.257)*5,4,0,7);c.fill()}}}
          else{c.beginPath();c.moveTo(-9,-stem*.5+8);c.lineTo(-13,-stem*.5-26);for(let t=0;t<=8;t++)c.lineTo(-13+t*3.25,-stem*.5-26-(t%2?7:0));c.lineTo(9,-stem*.5+8);c.closePath();c.fill();c.stroke()}
          c.restore();c.fillStyle='#f6f0dc';c.fillRect(px-74,py+72,148,26);c.strokeStyle='rgba(90,70,40,.5)';c.strokeRect(px-74,py+72,148,26);c.fillStyle='#3a2c1c';c.font='italic 15px Georgia';c.textAlign='center';c.fillText(s.name,px,py+90)})},1024,640));
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);const data={...card('herbarium'),action:'LOOK'};
      const top=box(1.3,.05,.9,cherry,0,.8,0,g);for(const [lx,lz] of [[-.58,-.38],[.58,-.38],[-.58,.38],[.58,.38]])box(.05,.78,.05,cherry,lx,.39,lz,g);
      const cover=box(1.04,.03,.66,std({color:0x2f4a36,roughness:.8}),0,.84,0,g);const sheet=add(own(new THREE.PlaneGeometry(1,.62)),std({map:pages,roughness:.95}),0,.858,0,g);sheet.rotation.x=-Math.PI/2;
      const glass=box(1.2,.16,.8,std({color:0xdfeee8,transparent:true,opacity:.14,roughness:.05,metalness:.1}),0,.91,0,g);for(const part of [top,cover,sheet,glass])mark(part,data);block(x,z,1.5,1.1);
    }
    // The bureau, and what was in its bottom drawer.
    function buildBureau(x,z,cherry,book){
      const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=Math.PI;root.add(g);const brass=MAT.brass||std({color:0xb08d3a,metalness:.6,roughness:.4});
      const body=box(1.1,1.1,.5,cherry,0,.55,0,g),topBoard=box(1.18,.04,.56,cherry,0,1.12,0,g);for(const part of [body,topBoard])mark(part,card('bureau'));
      const fronts=[];for(let i=0;i<4;i++){const f=box(1,.22,.03,cherry,0,.17+i*.26,.26,g);fronts.push(f);for(const kx of [-.3,.3])add(own(new THREE.SphereGeometry(.022,8,6)),brass,kx,.17+i*.26,.285,g).userData={}}
      for(let i=1;i<4;i++)mark(fronts[i],card('bureau'));
      const drawerData={type:'dickinson-drawer',title:'The bottom drawer',author:'It is not quite shut. Something in it has kept it from closing.',action:'OPEN'};mark(fronts[0],drawerData);
      // The booklets: little folded gatherings of letter-paper, sewn through twice with thread. One InstancedMesh, hidden until found.
      const dummy=new THREE.Object3D(),N=14,fascicles=new THREE.InstancedMesh(own(new THREE.BoxGeometry(.2,.012,.13)),std({color:0xf1e8d2,roughness:.95}),N);
      for(let i=0;i<N;i++){dummy.position.set(-.34+(i%5)*.17+(i%2)*.012,.2+Math.floor(i/5)*.014,.36+((i*7)%3)*.02);dummy.rotation.set(0,((i*13)%7-3)*.06,0);dummy.updateMatrix?.();fascicles.setMatrixAt?.(i,dummy.matrix)}
      fascicles.position.set(0,0,0);fascicles.visible=false;fascicles.raycast=()=>{};g.add(fascicles);
      block(x,z,1.3,.7);bureau={g,front:fronts[0],fascicles,book,open:0,found:false,drawerData,copy:null};
      if(wasFound())reveal(false);
    }
    function reveal(announce=true){
      if(!bureau||bureau.found)return;bureau.found=true;bureau.open=announce?0.001:1;bureau.fascicles.visible=true;if(!announce)bureau.front.position.z=.26+.3;
      bureau.drawerData.title='The bottom drawer, open';bureau.drawerData.author=`Forty little booklets of folded letter-paper, sewn through with thread, and loose sheets beside them: the poems, as her sister Lavinia found them after she died. ${q('letter')}`;bureau.drawerData.action='LOOK';
      if(bureau.book&&!bureau.copy){const geometry=own(new THREE.BoxGeometry(.66,.9,.12));bureau.copy=placeBook(bureau.book,{x:.1,y:1.2,z:.04,yaw:.2,tilt:-Math.PI/2},geometry,'drawer',bureau.g)}
    }
    // Her white dress on a dressmaker's form.
    function buildDress(x,z,linen,dark){
      const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=Math.PI+.35;root.add(g);
      const parts=[add(own(new THREE.CylinderGeometry(.2,.5,1.05,16,1,true)),linen,0,.6,0,g),add(own(new THREE.CylinderGeometry(.16,.2,.42,14)),linen,0,1.33,0,g),add(own(new THREE.SphereGeometry(.17,12,8)),linen,0,1.5,0,g)];
      parts[0].material.side=THREE.DoubleSide;parts[2].scale.set(1.25,.5,.8);for(const sx of [-1,1]){const sleeve=add(own(new THREE.CylinderGeometry(.06,.05,.55,8)),linen,sx*.25,1.24,0,g);sleeve.rotation.z=sx*.25;parts.push(sleeve)}
      parts.push(box(.1,.12,.012,linen,.2,.82,.34,g));// the pocket
      for(let i=0;i<7;i++)add(own(new THREE.SphereGeometry(.012,6,5)),std({color:0xd8d2c0}),0,.75+i*.1,.2+(i<4?.12-i*.03:0),g);
      add(own(new THREE.CylinderGeometry(.02,.02,1.6,6)),dark,0,.8,0,g);add(own(new THREE.CylinderGeometry(.2,.24,.04,12)),dark,0,.02,0,g);for(const part of parts)mark(part,card('dress'));block(x,z,.95,.95);
    }

    // ---------- walking ----------
    function contains(x,z){return x>ROOM.cx-ROOM.w/2&&x<ROOM.cx+ROOM.w/2&&z>ROOM.cz-ROOM.d/2&&z<ROOM.cz+ROOM.d/2}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      if(!contains(x,z))return false;const r=player.radius||.42;
      if(x-r<ROOM.cx-ROOM.w/2+.45||x+r>ROOM.cx+ROOM.w/2-.45||z-r<ROOM.cz-ROOM.d/2+.45||z+r>ROOM.cz+ROOM.d/2-.45)return false;
      return !blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ)}

    // ---------- doing things ----------
    function enter(){
      activate();move(ROOM.cx,ROOM.cz+ROOM.d/2-1.4,0);playSample?.('doorOpen',.8,1.05);
      showNotice('Emily Dickinson’s room. A small table by the window, a narrow bed, light lying aslant on the matting. Her poems are on the far wall, under her portrait; her herbarium is under glass; the bureau is behind you, to your right.',11);
      analytics?.track('Room Explored',{room:'dickinson-room'})}
    function leave(){const p=corridor?.standBefore?.(DOOR,2.2)||{x:DOOR.x+2.2,z:DOOR.z,yaw:-Math.PI/2};move(p.x,p.z,p.yaw);playSample?.('doorOpen',.8,1);showNotice('The Long Corridor again.',3)}
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('dickinson-'))return false;
      if(data.type==='dickinson-door'){through(data,enter);return true}
      if(data.type==='dickinson-exit'){through(data,leave);return true}
      if(data.type==='dickinson-drawer'){
        if(bureau?.found){showNotice(`${data.title}: ${data.author}`,12);return true}
        reveal(true);try{storage?.setItem(FOUND_KEY,'1')}catch(e){}playSample?.('pageTurn',.6,.8);
        showNotice(`You pull the bottom drawer. It is full of little booklets of folded letter-paper, sewn through with thread: forty of them, and loose sheets beside. Her sister Lavinia found them here after she died. ${q('letter')}${bureau.book?' On top of the bureau there is a book.':''}`,16);return true}
      if(data.type==='dickinson-picture'){const p=PICTURES[data.picture];if(showPicture)showPicture({kicker:'EMILY DICKINSON’S ROOM',title:data.title,src:`${pictures}${p.file}.jpg`,caption:data.author,credit:p.credit});else showNotice(`${data.title}: ${data.author}`,12);return true}
      if(data.type==='dickinson-card'){showNotice(`${data.title}: ${data.author}`,data.author.length>260?17:data.author.length>130?12:9);return true}
      return false}

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;bureau=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0}
    function update(t){
      const dt=Math.min(.1,Math.max(0,t-time));time=t;const inside=contains(player.pos.x,player.pos.z),near=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      if(inside||near&&(root||window.libraryMayBuild?.()!==false))activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home.parent))unload();
      if(!inside||!bureau)return;
      if(bureau.open>0&&bureau.open<1){bureau.open=Math.min(1,bureau.open+dt/1.1);const e=1-(1-bureau.open)*(1-bureau.open);bureau.front.position.z=.26+.3*e}}
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,leave,activate,unload,catalogue,door:DOOR,room:ROOM,groups:GROUPS,own:OWN,lines:LINES,cards:CARDS,specimens:SPECIMENS,pictures:PICTURES,winter,
      get built(){return !!root},get books(){return books.slice()},get found(){return !!bureau?.found||wasFound()},zoneAt:(x,z)=>contains(x,z)?'dickinson-room':null};
  };
})();
