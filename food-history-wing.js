// The Gastronomic Athenaeum: a first, self-contained food-history wing.
// A threshold in the main library leads to a grand hall with three curated collections.
// The wing is built on demand, uses existing book/reader interactions, and unloads when away.
(function(){
  'use strict';
  const COLLECTIONS=[
    {key:'cookbooks',title:'THE HISTORICAL COOKBOOK GALLERY',subtitle:'The changing art of the recipe',x:-1,z:-6.9,ids:[10136,12815,12519,6501,22790,8102]},
    {key:'preservation',title:'THE PRESERVATION VAULT',subtitle:'Salt, smoke, canning and winter stores',x:-8.5,z:-1.4,ids:[19031,12350,15464,12238]},
    {key:'spices',title:'THE GLOBAL SPICE EXCHANGE',subtitle:'Taste, travel and trade',x:8.5,z:-1.4,ids:[29728,24407,44915,16035]}
  ];
  // A small editorial starting selection; verify Gutenberg edition details before wider cataloguing.
  const TITLES={
    10136:['The Book of Household Management','Isabella Beeton'],
    12815:['American Cookery','Amelia Simmons'],
    12519:['The Virginia Housewife','Mary Randolph'],
    6501:['The Boston Cooking-School Cook Book','Fannie Merritt Farmer'],
    22790:['The Accomplisht Cook','Robert May'],
    8102:['The Forme of Cury','Samuel Pegge (editor)'],
    19031:['A Treatise on Adulterations of Food, and Culinary Poisons','Friedrich Accum'],
    12350:['Every Step in Canning','Grace Viall Gray'],
    15464:['Foods That Will Win the War and How to Cook Them','C. Houston and Alberta Goudiss'],
    12238:['Science in the Kitchen','E. E. Kellogg'],
    29728:['Cookery and Dining in Imperial Rome','Apicius'],
    24407:['The Italian Cook Book','Maria Gentile'],
    44915:['The Physiology of Taste','Jean Anthelme Brillat-Savarin'],
    16035:['Old Cookery Books and Ancient Cuisine','William Carew Hazlitt']
  };
  window.createFoodHistoryWing=function(o){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,registerBook,showNotice,playSample,analytics,move,isHolding=()=>false,doorKit=null}=o;
    const ROOM={cx:-780,cz:-420,w:26,d:21,h:6.4};
    // West wall of the Grand Hall, north of the botanical portrait and clear of the writing desks.
    const THRESHOLD={x:-18.1,z:25,yaw:Math.PI/2};
    const PRELOAD=8,KEEP=25;
    const owned=[],ours=[],shelfBooks=[],blocks=[];let root=null,t=0,lastNeeded=-1000;
    const own=x=>(owned.push(x),x);
    const add=(g,m,x,y,z,parent)=>{const mesh=new THREE.Mesh(g,m);mesh.position.set(x,y,z);parent.add(mesh);return mesh};
    const box=(w,h,d,mat,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),mat,x,y,z,parent);
    const mark=(obj,data,keep=false)=>{obj.userData=data;interactables.push(obj);if(!keep)ours.push(obj);return obj};
    const block=(x,z,w,d)=>blocks.push({x,z,w,d});
    const mat=(color,roughness=.85)=>own(new THREE.MeshStandardMaterial({color,roughness}));
    function panel(parent,header,subtitle,x,y,z,w=5,h=.65,yaw=0){
      const tex=own(canvasTexture((c,W,H)=>{
        c.fillStyle='#172b28';c.fillRect(0,0,W,H);c.strokeStyle='#c5a16c';c.lineWidth=7;c.strokeRect(7,7,W-14,H-14);
        c.fillStyle='#f0d9ac';c.textAlign='center';c.font='bold 27px Georgia';c.fillText(header,W/2,subtitle?47:65);
        if(subtitle){c.font='italic 19px Georgia';c.fillText(subtitle,W/2,88)}
      },900,110));
      const sign=add(own(new THREE.PlaneGeometry(w,h)),own(new THREE.MeshStandardMaterial({map:tex,roughness:.86,side:THREE.DoubleSide,emissive:0x51402a,emissiveIntensity:.18})),x,y,z,parent);
      sign.rotation.y=yaw;return sign;
    }
    const facts={
      hall:['The Gastronomic Athenaeum','A reading hall about what people grew, preserved, cooked and ate. Its cookbooks are evidence of their times, not a complete record of every culture.'],
      timeline:['The timeline of the table','From a late-medieval English recipe collection to Roman recipes in translation, early American cooking and Victorian domestic manuals. Dates describe the original works, not necessarily these editions.'],
      table:['A laid table','Food history is also a history of labour, class, colonialism and exchange. Whose recipes were written down, and whose were not?'],
      jars:['The preservation shelves','Preserving food changed what could be eaten in winter and carried on journeys. Historic preservation instructions may be unsafe by modern standards.'],
      spice:['The spice chests','Pepper, cinnamon, cloves and other ingredients travelled across long trading networks. Those histories include commerce, migration, exploitation and cultural exchange.'],
      plans:['Doors yet to open','The Confectioner’s Parlour, Coffee House, Market Garden and other rooms are on the architect’s plan. This first wing opens the Cookbook Gallery, Preservation Vault and Spice Exchange.']
    };
    const card=(key)=>({type:'food-history-card',title:facts[key][0],author:facts[key][1],action:'READ'});
    function getBook(id){
      let book=findBook(id);if(book)return book;
      const record=TITLES[id];if(!record)return null;
      return registerBook({id,title:record[0],author:record[1],category:'Food History',fame:25,source:'Project Gutenberg',sourceUrl:'https://www.gutenberg.org/ebooks/'+id,licence:'Public Domain',textUrl:'https://www.gutenberg.org/cache/epub/'+id+'/pg'+id+'.txt'});
    }
    function hangingBook(book,x,y,z,yaw=0){
      const mesh=add(own(new THREE.BoxGeometry(.8,1.03,.18)),own(bookMaterial(book)),x,y,z,root);
      mesh.rotation.y=yaw;
      mesh.userData={type:'book',book,loaded:false,foodHistory:true,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
      interactables.push(mesh);ours.push(mesh);shelfBooks.push(mesh);
    }
    function collectBooks(){
      for(const collection of COLLECTIONS){
        const books=collection.ids.map(getBook).filter(Boolean);
        const onBack=collection.key==='cookbooks';
        const w=onBack?10:7;
        const x=ROOM.cx+collection.x,z=ROOM.cz+collection.z;
        const shelfZ=onBack?z-.4:z;
        const shelfX=onBack?x:x+(collection.x<0?-.3:.3);
        const side=collection.x<0?-1:1;
        for(const h of [1,2.2])box(onBack?w:.45,.08,onBack?.45:w,MAT.darkWood,shelfX,h,shelfZ,root);
        books.forEach((book,i)=>{
          const col=i%7,row=Math.floor(i/7),offset=(col-(Math.min(7,books.length)-1)/2)*1.23;
          if(onBack)hangingBook(book,shelfX+offset,1.62+row*1.2,shelfZ+.19,0);
          else hangingBook(book,shelfX-side*.19,1.62+row*1.2,shelfZ+offset,side*Math.PI/2);
        });
        if(onBack)block(shelfX,shelfZ,w,.85);else block(shelfX,shelfZ,.85,w);
        const label=onBack?panel(root,collection.title,collection.subtitle,shelfX,4.4,shelfZ+.36,7.7,.75):
          panel(root,collection.title,collection.subtitle,shelfX-side*.36,4.4,shelfZ,6.5,.75,-side*Math.PI/2);
        mark(label,{type:'food-history-card',title:collection.title,author:collection.subtitle+'. Select a volume to read.',action:'READ'});
      }
    }
    function build(){
      if(root)return;root=new THREE.Group();root.name='food-history-wing';
      const oak=mat(0x543722),plaster=mat(0x70614d),brass=mat(0xb78f50,.4),linen=mat(0x9b8468);
      const {cx,cz,w,d,h}=ROOM;
      box(w,.28,d,MAT.wood,cx,-.14,cz,root);box(w,.25,d,MAT.darkWood,cx,h+.12,cz,root);
      for(const x of [cx-w/2,cx+w/2])box(.35,h,d,plaster,x,h/2,cz,root);
      for(const z of [cz-d/2,cz+d/2])box(w,h,.35,plaster,cx,h/2,z,root);
      for(let x=-w/2+2;x<w/2;x+=4){for(const z of [cz-d/2+.23,cz+d/2-.23])box(.28,h,.34,oak,cx+x,h/2,z,root)}
      for(const z of [cz-d/2+.23,cz+d/2-.23])box(w,.94,.22,oak,cx,.47,z,root);
      for(const x of [cx-w/2+.23,cx+w/2-.23])box(.22,.94,d,oak,x,.47,cz,root);
      mark(panel(root,'THE GASTRONOMIC ATHENAEUM','Food, cooking, culture & time',cx,5.25,cz-d/2+.23,8.3,.95),card('hall'));
      // A feast table, a runner and a few simple place settings in the central aisle.
      box(5.4,.15,2,oak,cx,.92,cz+2,root);block(cx,cz+2,5.7,2.3);
      for(const x of [cx-2.3,cx-1.15,cx,cx+1.15,cx+2.3]){
        for(const z of [cz+1.3,cz+2.7]){
          add(own(new THREE.CylinderGeometry(.23,.23,.025,16)),linen,x,1.02,z,root);
          add(own(new THREE.CylinderGeometry(.09,.12,.12,10)),brass,x,1.11,z,root);
        }
      }
      mark(box(.6,.1,.4,MAT.brass,cx,.99,cz+2,root),card('table'));
      // Timeline frieze and brass clock motif.
      mark(panel(root,'FROM HEARTH TO TABLE','Recipes · Trade · Preservation · Science',cx,3.4,cz-d/2+.25,8.6,.8),card('timeline'));
      // Preservation jars on an oak sideboard.
      const px=cx-8.9,pz=cz+5.4;
      box(3.2,.95,.65,oak,px,.48,pz,root);block(px,pz,3.4,.9);
      for(let i=0;i<7;i++){
        const jar=add(own(new THREE.CylinderGeometry(.16,.17,.4,10)),linen,px-1.35+i*.44,1.19,pz,root);
        mark(jar,card('jars'));
        add(own(new THREE.CylinderGeometry(.18,.18,.055,10)),brass,jar.position.x,1.41,pz,root);
      }
      // Merchant's spice chests.
      const sx=cx+8.8,sz=cz+5.4;
      for(let i=0;i<4;i++){const chest=box(.85,.7,.8,oak,sx-1.4+i*.95,.35,sz,root);mark(chest,card('spice'))}
      block(sx,sz,4.2,1);
      mark(panel(root,'FUTURE WINGS','Bakery · Coffee House · Market Garden',cx,2.4,cz+d/2-.26,6,.72,Math.PI),card('plans'));
      // A narrow brass-framed return door at the south end of the hall.
      const exit={type:'food-history-exit',title:'Return to the main library',author:'Step back into the Athenaeum.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:exit,mark,x:cx,z:cz+d/2-.25,yaw:Math.PI,width:1.9,height:3.1,color:0x50362c,style:'painted',label:'THE MAIN LIBRARY',own}))
        mark(box(2,3,.2,oak,cx,1.5,cz+d/2-.24,root),exit);
      // Warm, restrained gaslight: geometry is shared and everything is freed when unused.
      for(const x of [cx-7,cx,cx+7]){
        const light=new THREE.PointLight(0xffc887,5.5,15,2);light.position.set(x,4.6,cz+1);root.add(light);
        add(own(new THREE.CylinderGeometry(.36,.56,.34,12)),brass,x,5.1,cz+1,root);
      }
      collectBooks();scene.add(root);
    }
    const doorwayData={type:'food-history-door',title:'The Gastronomic Athenaeum',author:'Beyond the old doors: food, cooking and culinary history.',action:'ENTER'};
    const doorway=new THREE.Group();doorway.name='food-history-threshold';doorway.position.set(THRESHOLD.x,0,THRESHOLD.z);doorway.rotation.y=THRESHOLD.yaw;scene.add(doorway);
    if(!doorKit?.hang(doorway,{data:doorwayData,mark:(m,d)=>mark(m,d,true),width:1.9,height:3.1,color:0x593a28,style:'painted',label:'FOOD HISTORY'}))
      mark(add(new THREE.BoxGeometry(1.9,3.1,.17),new THREE.MeshStandardMaterial({color:0x593a28}),0,1.55,0,doorway),doorwayData,true);
    // Grand Hall entrance dressing: a proper freestanding oak-and-stone doorway, not a false wall arch.
    // DoorKit supplies the functioning leaves and the portal; this surround leaves its opening unobstructed.
    function dressThreshold(){
      const stone=mat(0x72655a,.93),oak=mat(0x382419,.63),gilt=mat(0xc69c55,.42);
      const ivory=mat(0xe3d4b6,.91),glass=own(new THREE.MeshStandardMaterial({color:0xdce8df,transparent:true,opacity:.19,roughness:.12,depthWrite:false}));
      const surround=new THREE.Group();surround.name='gastronomic-entry-arch';doorway.add(surround);
      // Stone piers and curved masonry arch; no infill behind the arch, and a real operable door underneath.
      for(const side of [-1,1]){
        box(.34,2.72,.42,stone,side*1.3,1.36,-.07,surround);
        box(.15,2.72,.49,oak,side*1.07,1.36,-.04,surround);
        box(.5,.24,.54,stone,side*1.3,2.74,-.07,surround);
        box(.52,.22,.55,stone,side*1.3,.11,-.07,surround);
      }
      const arch=add(own(new THREE.TorusGeometry(1.3,.17,10,28,Math.PI)),stone,0,2.72,-.07,surround);
      const innerArch=add(own(new THREE.TorusGeometry(1.06,.055,7,28,Math.PI)),gilt,0,2.72,.16,surround);
      box(.38,.31,.5,stone,0,4.07,-.07,surround); // keystone at the crown
      // The brass engraved name deliberately sits above the functioning leaf.
      const plate=panel(surround,'THE GASTRONOMIC ATHENAEUM','A history of food, cooking & culture',0,4.48,.26,5.6,.8);
      plate.name='food-history-entrance-plaque';
      mark(plate,{type:'food-history-card',title:'The Gastronomic Athenaeum',author:'A whole wing devoted to culinary history. Open the oak doors to enter.',action:'READ'},true);
      // Botanical engravings drawn procedurally onto parchment: wheat on the left, spices and grapevine on the right.
      function botanical(side){
        const canvas=own(canvasTexture((c,W,H)=>{
          c.fillStyle='#d9c6a2';c.fillRect(0,0,W,H);
          c.strokeStyle='#5b452b';c.lineWidth=5;c.strokeRect(13,13,W-26,H-26);
          c.strokeStyle='#7a6b43';c.lineWidth=3;
          c.beginPath();c.moveTo(W*.5,H*.82);c.bezierCurveTo(W*.47,H*.59,W*.56,H*.39,W*.5,H*.18);c.stroke();
          for(let i=0;i<7;i++){
            const y=H*(.26+i*.075),left=i%2===0,x=W*.5;
            c.save();c.translate(x,y);c.rotate(left?-.58:.58);
            c.beginPath();c.ellipse(left?-18:18,0,20,9,0,0,Math.PI*2);c.stroke();c.restore();
          }
          c.fillStyle='#58432d';c.textAlign='center';c.font='italic 25px Georgia';
          c.fillText(side<0?'TRITICUM':'VITIS & SPICES',W/2,H-40);
        },256,400));
        const frame=box(.88,1.37,.07,oak,side*2.34,2.3,.02,surround);
        const print=add(own(new THREE.PlaneGeometry(.76,1.22)),own(new THREE.MeshStandardMaterial({map:canvas,roughness:.95,side:THREE.DoubleSide})),side*2.34,2.3,.069,surround);
        mark(print,{type:'food-history-card',title:side<0?'Wheat and the harvest':'Grapevines and spices',author:'Botanical illustrations recall the plants that shaped the history of the table.',action:'READ'},true);
      }
      botanical(-1);botanical(1);
      // A compact vitrine placed off the door's approach: copper pan, preserving vessel and cookbook.
      const cabinet=new THREE.Group();cabinet.name='food-history-display-cabinet';cabinet.position.set(-3.55,0,.05);surround.add(cabinet);
      box(1.55,.83,.66,oak,0,.415,0,cabinet);
      box(1.62,.07,.7,gilt,0,.86,0,cabinet);
      box(1.61,.08,.7,oak,0,1.85,0,cabinet);
      for(const x of [-.76,.76])for(const z of [-.31,.31])box(.045,.91,.045,gilt,x,1.38,z,cabinet);
      for(const z of [-.31,.31])box(1.55,.9,.025,glass,0,1.38,z,cabinet);
      for(const x of [-.76,.76])box(.025,.9,.64,glass,x,1.38,0,cabinet);
      // Contents stay behind glass; the whole vitrine carries one readable interpretive card.
      add(own(new THREE.CylinderGeometry(.23,.19,.16,16)),gilt,-.42,1.02,0,cabinet); // copper preserving pan
      add(own(new THREE.CylinderGeometry(.11,.13,.44,12)),ivory,.26,1.19,-.06,cabinet); // storage jar
      const exhibitBook=box(.47,.07,.31,oak,.08,1.03,.15,cabinet);exhibitBook.rotation.y=.25;
      const displayCard={type:'food-history-card',title:'A table of discoveries',author:'A cookbook, copper preserving pan and storage vessel: three objects that connect the pages on these shelves to everyday kitchens.',action:'READ'};
      mark(exhibitBook,displayCard,true);
      const label=panel(cabinet,'BEYOND THESE DOORS','lies the history of what humanity has eaten',0,.55,.348,1.48,.37);
      mark(label,displayCard,true);
      // Small floor threshold that leaves a generous 2 m clear walk-up to the door.
      box(2.46,.035,.56,stone,0,.02,.34,surround);
    }
    // The entrance stays in the main hall while the distant wing unloads. Keep its assets out of the disposable room pool.
    dressThreshold();
    const entranceOwned=owned.splice(0);
    function contains(x,z){return x>ROOM.cx-ROOM.w/2&&x<ROOM.cx+ROOM.w/2&&z>ROOM.cz-ROOM.d/2&&z<ROOM.cz+ROOM.d/2}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      if(!contains(x,z))return false;
      const r=player.radius||.42;
      if(x-r<ROOM.cx-ROOM.w/2+.42||x+r>ROOM.cx+ROOM.w/2-.42||z-r<ROOM.cz-ROOM.d/2+.42||z+r>ROOM.cz+ROOM.d/2-.42)return false;
      return !blocks.some(b=>Math.abs(x-b.x)<b.w/2+r&&Math.abs(z-b.z)<b.d/2+r);
    }
    function enter(){
      activate();move(ROOM.cx,ROOM.cz+ROOM.d/2-2,0);playSample?.('doorOpen',.8,1);
      showNotice('The Gastronomic Athenaeum. Explore the Cookbook Gallery ahead, the Preservation Vault to the left and the Spice Exchange to the right.',9);
      analytics?.track('Room Explored',{room:'food-history'});
    }
    function interact(object){
      const d=object?.userData;
      if(!d||!String(d.type).startsWith('food-history-'))return false;
      if(d.type==='food-history-door'){if(doorKit&&d.kit)doorKit.pass(d.kit,d,enter);else enter();return true}
      if(d.type==='food-history-exit'){
        const leave=()=>{move(THRESHOLD.x+2.75,THRESHOLD.z,-Math.PI/2);playSample?.('doorOpen',.8,1)};
        if(doorKit&&d.kit)doorKit.pass(d.kit,d,leave);else leave();return true;
      }
      if(d.type==='food-history-card'){showNotice(d.title+': '+d.author,10);return true}
      return false;
    }
    function activate(){if(!root)build();lastNeeded=t}
    function unload(){
      if(!root)return;root.traverse(obj=>{if(obj.isLight)obj.userData.freed=true});root.removeFromParent();root=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const obj of owned.splice(0))obj.dispose?.();
      ours.length=0;shelfBooks.length=0;blocks.length=0;
    }
    function update(time){
      t=time;
      if(contains(player.pos.x,player.pos.z)||Math.hypot(player.pos.x-THRESHOLD.x,player.pos.z-THRESHOLD.z)<PRELOAD)activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!shelfBooks.some(b=>b.parent!==root))unload();
    }
    return {enter,interact,contains,allowed,floorAt,update,activate,unload,room:ROOM,collections:COLLECTIONS,get built(){return !!root},get books(){return shelfBooks.slice()}};
  };
})();
