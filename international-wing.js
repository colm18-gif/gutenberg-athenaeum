// The International Wing: behind a door on the Grand Hall's south wall, beside the visitors' book. Its rooms hold
// classics in their own languages, face-out on racks above a dado of tiles, each book with a librarian's note in
// that language (data/new-books-wing.js, rooms 'spanish', 'portuguese', 'chinese', 'french', 'latin', 'italian' and
// 'ukrainian'), and one on
// the lectern each night:
//   the Sala de lectura en español, entered from the Grand Hall;
//   the Sala de leitura em português, through the green door in the Spanish room's east wall;
//   the Salle de lecture en français, through the blue door between them;
//   the 中文閱覽室 (the Chinese Reading Room), through the red door;
//   the Latin Reading Room (Conclave Latinum), through the stone door in the Spanish room's south wall. Its notes
//   are in English: Latin's readers today read it from every other language;
//   the Sala di lettura in italiano (the Italian Reading Room), through its own green door in the Spanish room's south
//   wall, under a glazed roundel in the manner of the della Robbia, or through a second such door in the Latin room's
//   east wall: from Virgil's Latin to Dante's Italian;
//   the Українська читальня (the Ukrainian Reading Room), through the blue door beside it with an embroidered rushnyk
//   over the lintel. Its books come from Ukrainian Wikisource (scripts/wikisource.mjs), as Gutenberg has none.
//
// Like the other rooms behind doors, each room is built only when the reader walks up to it and freed a little
// while after they leave. The wing's two lamps are moved to whichever room the reader is in, so the number of
// lights in the scene (and with it every shader) stays the same.
(function(){
  'use strict';
  const CJK='"Noto Serif TC","Songti TC","PMingLiU","Noto Serif CJK TC",serif';

  // The Ukrainian room's shelf of the Executed Renaissance, and the little book in Shevchenko's boot: these stand apart
  // from its main shelves (data/new-books-wing.js gives them, with the room's other books).
  const MEMORIAL=['Місто','Я (Романтика)','Камена','Мина Мазайло','На Золотих Богів','Дні','Проростень','Подорож ученого доктора Леонардо'];
  // 9 November, the Day of Ukrainian Writing and Language, on the feast of Nestor the Chronicler.
  const writingDay=(date=new Date())=>date.getMonth()===10&&date.getDate()===9;
  const ROOMS={
    spanish:{cx:-410,cz:100,w:24,d:15,h:6,language:'es',sign:'SALA DE LECTURA EN ESPAÑOL',sub:'The Spanish Reading Room · El ala internacional',
      card:['Sala de lectura en español','Clásicos de España, de América y de Filipinas, cada uno con una nota de la bibliotecaria. El libro de la noche está en el atril. (The Spanish Reading Room: classics from Spain, the Americas and the Philippines.)'],
      lectern:'EL LIBRO DE LA NOCHE',shade:0x2c5592,tiles:'andalusian',
      welcome:pick=>`Sala de lectura en español. Bienvenidos: clásicos en español, cada uno con una nota de la bibliotecaria.${pick?` En el atril esta noche: ${pick.title}.`:''} (The International Wing: the Spanish Reading Room.)`,
      note:'La nota de la bibliotecaria',seat:['Una silla junto a la mesa','Siéntese a leer un libro de esta sala. (Sit and read a book from this room.)']},
    portuguese:{cx:-410,cz:132,w:24,d:15,h:6,language:'pt',sign:'SALA DE LEITURA EM PORTUGUÊS',sub:'The Portuguese Reading Room · A ala internacional',
      card:['Sala de leitura em português','Clássicos do Brasil, de Portugal e de além-mar, cada um com uma nota da bibliotecária. O livro da noite está no atril. (The Portuguese Reading Room: classics from Brazil, Portugal and beyond.)'],
      lectern:'O LIVRO DA NOITE',shade:0x2f6b4a,tiles:'lisbon',
      welcome:pick=>`Sala de leitura em português. Bem-vindos: clássicos em português, cada um com uma nota da bibliotecária.${pick?` No atril esta noite: ${pick.title}.`:''} (The International Wing: the Portuguese Reading Room.)`,
      note:'A nota da bibliotecária',seat:['Uma cadeira junto à mesa','Sente-se e leia um livro desta sala. (Sit and read a book from this room.)']},
    chinese:{cx:-470,cz:100,w:24,d:15,h:6,language:'zh',sign:'中文閱覽室',sub:'The Chinese Reading Room · 國際館',font:CJK,
      card:['中文閱覽室','古典小說、詩詞、戲曲、諸子和魯迅，每一本都附有館員的短評。今晚的書在書台上。(The Chinese Reading Room: novels, poetry, drama and philosophy, each with a note from the librarian.)'],
      lectern:'今夜之書',shade:0x8a2a1e,tiles:'lattice',
      welcome:pick=>`中文閱覽室，歡迎光臨：中文經典，每一本都附有館員的短評。${pick?`今晚書台上的是《${pick.title}》。`:''} (The International Wing: the Chinese Reading Room.)`,
      note:'館員的話',seat:['書桌旁的椅子','坐下來，讀一本這間閱覽室的書。(Sit and read a book from this room.)']},
    french:{cx:-470,cz:132,w:24,d:15,h:6,language:'fr',sign:'SALLE DE LECTURE EN FRANÇAIS',sub:'The French Reading Room · L’aile internationale',
      card:['Salle de lecture en français','Des classiques de France et de toute la francophonie, chacun avec une note de la bibliothécaire. Le livre du soir est sur le lutrin. (The French Reading Room: classics from France and the French-speaking world.)'],
      lectern:'LE LIVRE DU SOIR',shade:0x2a3f6e,tiles:'toile',
      welcome:pick=>`Salle de lecture en français. Bienvenue : des classiques en français, chacun avec une note de la bibliothécaire.${pick?` Sur le lutrin ce soir : ${pick.title}.`:''} (The International Wing: the French Reading Room.)`,
      note:'La note de la bibliothécaire',seat:['Une chaise près de la table','Asseyez-vous et lisez un livre de cette salle. (Sit and read a book from this room.)'],
      // A small case of its own on the east wall: writers born in Switzerland or who lived there, and books set there.
      corner:{ids:[65434,13861,26818,60810,32808,28523,17696],sign:'LE RAYON SUISSE',sub:'Genève · Lausanne · Neuchâtel · Coppet',flag:true,
        card:['Le rayon suisse','Des écrivains nés en Suisse ou qui y ont vécu, et des livres qui s’y passent : Rousseau, citoyen de Genève ; Benjamin Constant, né à Lausanne ; Madame de Staël, à Coppet ; Isabelle de Charrière, à Colombier ; Senancour, dans les Alpes. (The Swiss shelf.)']}},
    latin:{cx:-470,cz:164,w:24,d:15,h:6,language:'la',sign:'CONCLAVE LATINVM',sub:'The Latin Reading Room · Ala Internationalis',
      card:['Conclave Latinum','The Latin Reading Room: Virgil, Ovid, Caesar, Cicero and the rest, in the words they wrote, each with a note from the librarian. Tonight’s book is on the lectern. (Salvete, lectores.)'],
      lectern:'LIBER NOCTIS',shade:0x7a5a2a,tiles:'roman',
      welcome:pick=>`Salvete! The Latin Reading Room: the Romans in their own words, each with a note from the librarian.${pick?` On the lectern tonight: ${pick.title}.`:''}`,
      note:'The librarian’s note',seat:['Sella ad mensam','Sit and read a book from this room.']},
    italian:{cx:-530,cz:132,w:24,d:15,h:6,language:'it',sign:'SALA DI LETTURA IN ITALIANO',sub:'The Italian Reading Room · L’ala internazionale',
      card:['Sala di lettura in italiano','Classici italiani, da Dante e Ariosto a Manzoni, Leopardi e Pirandello, ciascuno con una nota della bibliotecaria. Il libro della sera è sul leggio. (The Italian Reading Room: classics from Dante to Pirandello.)'],
      lectern:'IL LIBRO DELLA SERA',shade:0x2f5a34,tiles:'maiolica',
      welcome:pick=>`Sala di lettura in italiano. Benvenuti: classici in italiano, ciascuno con una nota della bibliotecaria.${pick?` Sul leggio stasera: ${pick.title}.`:''} (The International Wing: the Italian Reading Room.)`,
      note:'La nota della bibliotecaria',seat:['Una sedia accanto al tavolo','Si sieda e legga un libro di questa sala. (Sit and read a book from this room.)']},
    ukrainian:{cx:-530,cz:100,w:24,d:15,h:6,language:'uk',sign:'УКРАЇНСЬКА ЧИТАЛЬНЯ',sub:'The Ukrainian Reading Room · Міжнародне крило',
      card:['Українська читальня','Класика українською мовою, від Котляревського й Шевченка до Лесі Українки, Франка й Коцюбинського, кожна книжка з приміткою бібліотекарки. Тексти з Вікіджерел, суспільне надбання. (The Ukrainian Reading Room.)'],
      lectern:'КНИЖКА ВЕЧОРА',shade:0x2b5aa8,tiles:'vyshyvanka',memorial:MEMORIAL,boot:'Княжна',
      welcome:pick=>`Українська читальня. Ласкаво просимо: класика українською мовою, кожна книжка з приміткою бібліотекарки.${writingDay()?' Сьогодні День української писемності та мови.':''}${pick?` На пюпітрі сьогодні: ${pick.title}.`:''} (The International Wing: the Ukrainian Reading Room.)`,
      note:'Примітка бібліотекарки',seat:['Стілець біля столу','Сідайте й читайте книжку з цієї читальні. (Sit and read a book from this room.)']}
  };

  window.createInternationalWing=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals=()=>[],showNotice,playSample,move,analytics,isHolding=()=>false,today=()=>new Date(),
      wallMaterial=null,finishWalls=null,registerSeat=null,doorKit=null,tone=null,gospel=null,storage=window.localStorage}=options;   // the library's own stone walls and contact shadows (wall-finish.js), when game.js offers them
    const DOOR={x:8.6,z:30.45,yaw:Math.PI};
    // The doors in the Spanish room's east and south walls, to the other rooms, and a second door to the Italian in the
    // Latin room's east wall (room: the room a door opens on, when it is not its key; from: the room a door is in, when
    // it is not the Spanish room). yaw: which way the reader faces when they come back out through it.
    const ROOM=ROOMS.spanish,EAST=ROOM.cx+ROOM.w/2-.2,SOUTH=ROOM.cz+ROOM.d/2-.2,ROOM_DOORS={portuguese:{x:EAST,z:ROOM.cz-4.7,yaw:-Math.PI/2},french:{x:EAST,z:ROOM.cz,yaw:-Math.PI/2},
      chinese:{x:EAST,z:ROOM.cz+4.7,yaw:-Math.PI/2},latin:{x:ROOM.cx+7,z:SOUTH,yaw:0},ukrainian:{x:ROOM.cx-7,z:SOUTH,yaw:0},
      italian:{x:ROOM.cx+3.5,z:SOUTH,yaw:0},'italian-latin':{room:'italian',from:'latin',x:ROOMS.latin.cx+ROOMS.latin.w/2-.2,z:ROOMS.latin.cz,yaw:-Math.PI/2}};
    const outOf=door=>ROOM_DOORS[door]?.from||'spanish',opensOn=door=>ROOM_DOORS[door]?.room||door;
    // The door each room was last entered by, so its way out leads back the way the reader came (the Italian has two).
    const via={};
    const PRELOAD=7,KEEP=25;
    let time=0,lamps=null;
    const built={},lastNeeded=Object.fromEntries(Object.keys(ROOMS).map(key=>[key,-1e9]));
    const doorData={type:'intl-door',title:'The International Wing',author:'Clásicos en español · Clássicos em português · Classiques en français · 中文經典 · Libri Latini · Classici italiani · Українська класика. Each book with a note from the librarian in its own language.',action:'ENTER'};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    // ---------- the doors ----------
    // Every door in the wing is hung in the library's own kit (library-doors.js), and looks the same from both sides:
    // navy to the Spanish room, green with Lisbon tiles to the Portuguese, blue with an iron grille to the French,
    // red lacquer with brass studs under a tiled eave to the Chinese, stone under a Roman arch to the Latin, and
    // Florentine green under a della Robbia roundel to the Italian.
    const DOOR_LOOKS={spanish:{color:0x1f3350,glazed:true,fanColor:0xd9923a},portuguese:{color:0x1f4a33,glazed:true,fanColor:0xffc978},
      french:{color:0x1f3160,glazed:true,fanColor:0xffd48a},chinese:{color:0x5a1c1a,plain:true,fanlight:false,cornice:false},latin:{color:()=>stone('leaf',0x8c8272),fanlight:false,cornice:false},
      ukrainian:{color:0x1f4f9a,glazed:true,fanColor:0xffc93a},italian:{color:0x2b4a2c,fanlight:false}};
    const EXIT_LABELS={spanish:'THE GRAND HALL',portuguese:'SALA ESPANHOLA',french:'SALLE ESPAGNOLE',chinese:'西班牙文閱覽室',latin:'EXITVS',italian:'USCITA',ukrainian:'ІСПАНСЬКА ЧИТАЛЬНЯ'};
    let lacquer=null;const stones={},stone=(key,color)=>stones[key]||(stones[key]=new THREE.MeshStandardMaterial({color,roughness:.9}));
    const FRAMES={chinese:()=>lacquer||(lacquer=new THREE.MeshStandardMaterial({color:0x2a0d0a,roughness:.45})),latin:()=>stone('dressed',0xa89b84)};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    // Letters cut into stone: a light edge below, the shadowed cut above it.
    function carved(text,W,H,font='Georgia',bg='#8e8472',at=.5,fill=.92){return canvasTexture((c)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);for(let k=0;k<W*H/300;k++){c.fillStyle=`rgba(${Math.random()<.5?'255,255,255':'0,0,0'},${Math.random()*.06})`;c.fillRect(Math.random()*W,Math.random()*H,2+Math.random()*6,2+Math.random()*4)}
      c.textAlign='center';c.textBaseline='middle';let size=Math.round(H*.5);do{c.font=`bold ${size}px ${font}`;size-=2}while(c.measureText(text).width>W*fill&&size>10);c.fillStyle='rgba(235,225,205,.55)';c.fillText(text,W/2+2,H*at+3);c.fillStyle='#342a20';c.fillText(text,W/2,H*at)},W,H)}
    function hangWing(parent,key,{data,mark,x=0,z=0,yaw=0,label='',own=thing=>thing,...extra}){
      const frame=FRAMES[key]?.(),look={...DOOR_LOOKS[key]};if(typeof look.color==='function')look.color=look.color();
      const door=doorKit?.hang(parent,{data,mark,x,z,yaw,label,style:'painted',width:1.9,height:3.1,...look,...(frame?{frame}:{}),...extra});
      if(door)dressDoor(key,door,own);return door}
    function dressDoor(key,door,own){
      const {group,leaf}=door,part=(geometry,material,x,y,z,parent=group)=>add(own(geometry),material,x,y,z,parent);
      if(key==='portuguese'){// Blue-and-white azulejos up both sides, above the dado.
        const tile=own(tileTexture('lisbon'));tile.wrapS=tile.wrapT=THREE.RepeatWrapping;tile.repeat.set(2,10);const tiles=own(new THREE.MeshStandardMaterial({map:tile,roughness:.35}));
        for(const side of [-1,1]){part(new THREE.PlaneGeometry(.55,2.78),tiles,side*1.46,2.56,.03);part(new THREE.BoxGeometry(.63,.06,.06),MAT.darkWood,side*1.46,3.97,.03)}}
      if(key==='french'){// A wrought-iron grille of scrolls over the glass, as on a Paris street door.
        const grille=own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);c.strokeStyle='#141414';c.lineCap='round';c.lineWidth=7;c.strokeRect(6,6,W-12,H-12);c.beginPath();c.moveTo(W/2,6);c.lineTo(W/2,H-6);c.stroke();c.lineWidth=5;
          for(const sx of [-1,1])for(const y of [H*.28,H*.72]){c.beginPath();c.arc(W/2+sx*W*.2,y,W*.17,0,Math.PI*2);c.stroke();c.beginPath();c.arc(W/2+sx*W*.2,y,W*.07,0,Math.PI*2);c.stroke()}
          c.fillStyle='#141414';for(const y of [H*.5]){c.beginPath();c.arc(W/2,y,9,0,Math.PI*2);c.fill()}},128,192)),iron=own(new THREE.MeshStandardMaterial({map:grille,transparent:true,alphaTest:.4,color:0x5a5a5a,metalness:.6,roughness:.45,side:THREE.DoubleSide}));
        for(const pane of door.panes){const {width=.6,height=.8}=pane.geometry.parameters||{};for(const zz of [-.066,.066])part(new THREE.PlaneGeometry(width-.02,height-.04),iron,pane.position.x,pane.position.y,zz,leaf)}}
      if(key==='chinese'){// Rows of brass door nails and a ring knocker on the lacquer; a lattice transom; a tiled eave above.
        const spots=[];for(let r=0;r<5;r++)for(let k=0;k<5;k++){const x=-.62+k*.31,y=.62+r*.52;if(x>.5&&y<1.4)continue;spots.push([x,y])}
        const nails=new THREE.InstancedMesh(own(new THREE.SphereGeometry(.042,8,6)),MAT.brass,spots.length*2),m=new THREE.Matrix4();spots.forEach(([x,y],i)=>{nails.setMatrixAt(i*2,m.makeTranslation(x,y,.055));nails.setMatrixAt(i*2+1,m.makeTranslation(x,y,-.055))});leaf.add(nails);
        for(const side of [-1,1]){const boss=part(new THREE.CylinderGeometry(.1,.1,.03,16),MAT.brass,0,1.62,side*.06,leaf);boss.rotation.x=Math.PI/2;part(new THREE.TorusGeometry(.085,.014,6,16),MAT.brass,0,1.5,side*.085,leaf)}
        const frame=FRAMES.chinese(),lattice=own(tileTexture('lattice'));lattice.wrapS=THREE.RepeatWrapping;lattice.repeat.set(3,1);
        part(new THREE.BoxGeometry(2.34,.14,.22),frame,0,3.17,.05);part(new THREE.PlaneGeometry(1.9,.58),own(new THREE.MeshStandardMaterial({map:lattice,roughness:.5,emissive:0x3a0c06,emissiveIntensity:.35})),0,3.53,.03);
        for(const side of [-1,1])part(new THREE.BoxGeometry(.22,.8,.18),frame,side*1.06,3.55,.04);part(new THREE.BoxGeometry(2.6,.16,.26),frame,0,3.9,.06);
        const roof=own(canvasTexture((c,W,H)=>{c.fillStyle='#26332f';c.fillRect(0,0,W,H);for(let x=0;x<W;x+=16){const g=c.createLinearGradient(x,0,x+16,0);g.addColorStop(0,'#1b2522');g.addColorStop(.5,'#4a5e57');g.addColorStop(1,'#1b2522');c.fillStyle=g;c.fillRect(x,0,16,H)}},256,64));roof.wrapS=THREE.RepeatWrapping;roof.repeat.set(3,1);
        const tiles=own(new THREE.MeshStandardMaterial({map:roof,roughness:.4,metalness:.1})),eave=part(new THREE.BoxGeometry(3.3,.1,.82),tiles,0,4.12,.4);eave.rotation.x=.38;part(new THREE.BoxGeometry(3.4,.14,.16),tiles,0,4.27,.05);
        for(const side of [-1,1]){const tip=part(new THREE.BoxGeometry(.4,.09,.12),tiles,side*1.72,4.04,.74);tip.rotation.z=side*.45}
        const ends=new THREE.InstancedMesh(own(new THREE.CylinderGeometry(.055,.055,.05,10)),tiles,11),q=new THREE.Matrix4().makeRotationX(Math.PI/2);for(let i=0;i<11;i++)ends.setMatrixAt(i,m.makeTranslation(-1.5+i*.3,3.97,.79).multiply(q));group.add(ends)}
      if(key==='latin'){// A Roman arch over the door, with its keystone, and INTRATE (come in) cut in the stone beneath it.
        const band=new THREE.Shape();band.absarc(0,0,1.32,0,Math.PI,false);band.lineTo(-.98,0);band.absarc(0,0,.98,Math.PI,0,true);band.lineTo(1.32,0);
        const dressed=FRAMES.latin();part(new THREE.ExtrudeGeometry(band,{depth:.26,bevelEnabled:false,curveSegments:20}),dressed,0,3.1,-.04);part(new THREE.BoxGeometry(.3,.46,.34),dressed,0,4.36,.1);
        for(const side of [-1,1])part(new THREE.BoxGeometry(.46,.14,.32),dressed,side*1.15,3.13,.08);
        const word=own(carved('INTRATE',512,256,'Georgia','#8e8472',.72,.6));const face=part(new THREE.CircleGeometry(.98,24,0,Math.PI),own(new THREE.MeshStandardMaterial({map:word,roughness:.9})),0,3.1,.02);
        // The half disc covers only the upper half of its texture coordinates; stretch the whole word over it.
        word.repeat.set(1,2);word.offset.set(0,-1)}
      if(key==='ukrainian'){// A rushnyk, the embroidered linen towel of a Ukrainian home, draped along the cornice and hanging down both sides.
        const band=own(canvasTexture((c,W,H)=>{c.fillStyle='#f1e9d6';c.fillRect(0,0,W,H);const u=8;for(let i=0;i<W/u;i++){const k=i%8,row=Math.abs(k-3.5);for(let j=0;j<H/u;j++){const d=Math.abs(j-3.5)+row;const colour=d<1.2?'#1c1c1c':d>=2.5&&d<3.5?'#b3202a':null;if(colour)stitch(c,i*u,j*u,u,colour)}}},512,64));
        const tail=own(canvasTexture((c,W,H)=>{c.fillStyle='#f1e9d6';c.fillRect(0,0,W,H);const u=8;for(let i=0;i<W/u;i++)for(let j=0;j<10;j++){const y=H-24-j*u-u,d=Math.abs(i-3.5)+Math.abs(j-4.5);const colour=d<1.2?'#b3202a':d>=2.5&&d<3.6?'#1c1c1c':d>=4.5&&d<5.5?'#b3202a':null;if(colour)stitch(c,i*u,y,u,colour)}
          c.strokeStyle='#b3202a';c.lineWidth=2;for(let x=3;x<W;x+=5){c.beginPath();c.moveTo(x,H-22);c.lineTo(x+(x%3)-1,H-2);c.stroke()}},64,256));
        const linen=own(new THREE.MeshStandardMaterial({map:band,roughness:.95,side:THREE.DoubleSide})),ends=own(new THREE.MeshStandardMaterial({map:tail,roughness:.95,side:THREE.DoubleSide}));
        part(new THREE.PlaneGeometry(3.0,.26),linen,0,4.02,.39);
        for(const side of [-1,1]){const t=part(new THREE.PlaneGeometry(.32,1.28),ends,side*1.36,3.4,.36);t.rotation.z=side*.05}}
      if(key==='italian'){// A glazed terracotta roundel over the pediment, in the manner of the della Robbia workshop in Florence: a
        // garland of leaves, lemons and pine cones round the white lily of Florence on blue.
        const roundel=own(canvasTexture((c,W,H)=>{const R=W/2;c.clearRect(0,0,W,H);c.fillStyle='#e9e2cf';c.beginPath();c.arc(R,R,R-2,0,Math.PI*2);c.fill();
          for(let k=0;k<28;k++){const a=k/28*Math.PI*2,x=R+Math.cos(a)*R*.8,y=R+Math.sin(a)*R*.8;c.save();c.translate(x,y);c.rotate(a+Math.PI/2+.5);c.fillStyle=k%2?'#3d7a3a':'#2c5e2e';c.beginPath();c.ellipse(0,0,R*.06,R*.15,0,0,Math.PI*2);c.fill();c.restore()}
          for(let k=0;k<8;k++){const a=(k+.5)/8*Math.PI*2,x=R+Math.cos(a)*R*.8,y=R+Math.sin(a)*R*.8;c.fillStyle=k%2?'#e8b422':'#9a5a2a';c.beginPath();c.ellipse(x,y,R*.085,R*.065,a,0,Math.PI*2);c.fill()}
          c.fillStyle='#2c5aa0';c.beginPath();c.arc(R,R,R*.64,0,Math.PI*2);c.fill();
          // The lily of Florence: a tall middle petal, two curling side petals, a band and the stamens between them.
          c.save();c.translate(R,R+R*.04);c.scale(R/60,R/60);c.fillStyle='#f4f1e8';c.beginPath();c.moveTo(0,-34);c.bezierCurveTo(10,-18,9,-4,0,4);c.bezierCurveTo(-9,-4,-10,-18,0,-34);c.fill();
          for(const s of [-1,1]){c.beginPath();c.moveTo(s*3,2);c.bezierCurveTo(s*26,-4,s*30,-26,s*16,-26);c.bezierCurveTo(s*22,-14,s*14,-2,s*3,8);c.fill();c.lineWidth=3;c.strokeStyle='#f4f1e8';c.beginPath();c.moveTo(s*5,-4);c.lineTo(s*12,-30);c.stroke()}
          c.fillRect(-14,4,28,6);c.beginPath();c.moveTo(-6,10);c.lineTo(6,10);c.lineTo(0,26);c.closePath();c.fill();c.restore()},256,256));
        part(new THREE.CircleGeometry(.36,28),own(new THREE.MeshStandardMaterial({map:roundel,roughness:.35})),0,4.3,.06);
        part(new THREE.TorusGeometry(.37,.035,6,28),own(new THREE.MeshStandardMaterial({color:0xb8865a,roughness:.6})),0,4.3,.05)}
      if(key!=='spanish'&&key!=='portuguese'&&key!=='ukrainian'&&key!=='italian')doorKit.drawAfterPortal(leaf)}
    const dayNumber=()=>Math.floor(Date.parse(today().toISOString().slice(0,10)+'T12:00:00Z')/86400000);
    function plaque(text,sub,w,h,dark='#1d2a3d',font='Georgia'){return canvasTexture((c,W,H)=>{c.fillStyle=dark;c.fillRect(0,0,W,H);c.strokeStyle='#d7ae60';c.lineWidth=6;c.strokeRect(5,5,W-10,H-10);c.fillStyle='#ffe2a0';c.textAlign='center';
      let size=Math.round(H*(sub?.3:.36));do{c.font=`bold ${size}px ${font}`;size-=2}while(c.measureText(text).width>W-40&&size>12);c.fillText(text,W/2,sub?H*.46:H/2+H*.12);if(sub){c.font=`italic ${Math.round(H*.19)}px Georgia`;c.fillText(sub,W/2,H*.8)}},w,h)}
    // Cross-stitch, as on a vyshyvanka shirt or a rushnyk: red and black stitches on linen, each one an X.
    function stitch(c,x,y,u,colour){c.strokeStyle=colour;c.lineWidth=Math.max(2,u*.42);c.lineCap='round';c.beginPath();c.moveTo(x+u*.18,y+u*.18);c.lineTo(x+u*.82,y+u*.82);c.moveTo(x+u*.82,y+u*.18);c.lineTo(x+u*.18,y+u*.82);c.stroke()}
    function stitchMotif(c,W,H,{u=8,linen='#efe6d2'}={}){c.fillStyle=linen;c.fillRect(0,0,W,H);const n=Math.round(W/u),mid=(n-1)/2;
      // A red rhombus round a black one, with a red heart, and black quarter-rhombi in the corners that meet the next tile's.
      for(let i=0;i<n;i++)for(let j=0;j<n;j++){const d=Math.abs(i-mid)+Math.abs(j-mid),corner=Math.min(i+j,(n-1-i)+j,i+(n-1-j),(n-1-i)+(n-1-j));
        const colour=d<1?'#b3202a':d>=2&&d<3?'#1c1c1c':d>=5&&d<6.5?'#b3202a':corner<2.5&&corner>=1?'#1c1c1c':null;if(colour)stitch(c,i*u,j*u,u,colour)}}
    // One tile of each pattern, repeated along the dado: an Andalusian patio for Spain, a Lisbon façade for Portugal,
    // for France a gold fleur-de-lis on French blue, and for China a red lacquer panel with a gold key-fret border and a
    // round window.
    function tileTexture(kind){return canvasTexture((c,W,H)=>{
      if(kind==='vyshyvanka'){stitchMotif(c,W,H);return}
      if(kind==='maiolica'){c.fillStyle='#f3ead2';c.fillRect(0,0,W,H);c.strokeStyle='#23457a';c.lineWidth=5;c.strokeRect(3,3,W-6,H-6);
        // Maiolica, as from Deruta or Faenza: four ochre petals edged in blue, round a blue heart, with green leaves between.
        c.save();c.translate(W/2,H/2);for(let k=0;k<4;k++){c.rotate(Math.PI/2);c.fillStyle='#e0a02a';c.strokeStyle='#23457a';c.lineWidth=3;c.beginPath();c.ellipse(0,-W*.2,W*.11,W*.19,0,0,Math.PI*2);c.fill();c.stroke();
          c.save();c.rotate(Math.PI/4);c.fillStyle='#3f7a3a';c.beginPath();c.ellipse(0,-W*.25,W*.05,W*.12,0,0,Math.PI*2);c.fill();c.restore()}
        c.fillStyle='#23457a';c.beginPath();c.arc(0,0,W*.09,0,Math.PI*2);c.fill();c.fillStyle='#c4462a';c.beginPath();c.arc(0,0,W*.04,0,Math.PI*2);c.fill();c.restore();
        c.fillStyle='#23457a';for(const [x,y] of [[0,0],[W,0],[0,H],[W,H]]){c.beginPath();c.arc(x,y,W*.12,0,Math.PI*2);c.fill()}return}
      if(kind==='roman'){c.fillStyle='#d9c7a0';c.fillRect(0,0,W,H);c.strokeStyle='#7a2e18';c.fillStyle='#7a2e18';c.lineWidth=7;
        // A running meander along top and bottom, and a rosette of eight petals in the middle, as on a Roman floor.
        for(const y of [14,H-14]){c.beginPath();for(let x=0;x<W;x+=32){const s=y<H/2?1:-1;c.moveTo(x,y+6*s);c.lineTo(x,y-8*s);c.lineTo(x+22,y-8*s);c.lineTo(x+22,y+2*s);c.lineTo(x+10,y+2*s);c.lineTo(x+10,y-2*s)}c.stroke()}
        c.save();c.translate(W/2,H/2);for(let k=0;k<8;k++){c.rotate(Math.PI/4);c.beginPath();c.ellipse(0,-21,8,18,0,0,Math.PI*2);c.fill()}c.fillStyle='#c79a3a';c.beginPath();c.arc(0,0,9,0,Math.PI*2);c.fill();c.restore();return}
      if(kind==='toile'){c.fillStyle='#24386a';c.fillRect(0,0,W,H);c.strokeStyle='#d6b35a';c.fillStyle='#d6b35a';c.lineWidth=4;c.strokeRect(5,5,W-10,H-10);
        // A fleur-de-lis: a tall middle petal, two curling side petals and a band across.
        const lily=(x,y,k)=>{c.save();c.translate(x,y);c.scale(k,k);c.beginPath();c.moveTo(0,-26);c.bezierCurveTo(9,-14,8,-2,0,6);c.bezierCurveTo(-8,-2,-9,-14,0,-26);c.fill();
          for(const s of [-1,1]){c.beginPath();c.moveTo(s*2,4);c.bezierCurveTo(s*22,-2,s*24,-20,s*12,-18);c.bezierCurveTo(s*18,-10,s*12,0,s*2,8);c.fill()}
          c.fillRect(-12,6,24,5);c.beginPath();c.moveTo(-5,11);c.lineTo(5,11);c.lineTo(0,22);c.closePath();c.fill();c.restore()};
        lily(W/2,H/2-4,1.9);return}
      if(kind==='lattice'){c.fillStyle='#7a1f16';c.fillRect(0,0,W,H);c.strokeStyle='#d6a64a';c.lineWidth=4;c.strokeRect(6,6,W-12,H-12);
        c.lineWidth=3;for(const [x,y,sx,sy] of [[14,14,1,1],[W-14,14,-1,1],[14,H-14,1,-1],[W-14,H-14,-1,-1]]){c.beginPath();c.moveTo(x,y+sy*22);c.lineTo(x,y);c.lineTo(x+sx*22,y);c.lineTo(x+sx*22,y+sy*14);c.lineTo(x+sx*8,y+sy*14);c.lineTo(x+sx*8,y+sy*8);c.stroke()}
        c.beginPath();c.arc(W/2,H/2,W*.26,0,Math.PI*2);c.stroke();c.lineWidth=2;for(const k of [-1,0,1]){c.beginPath();c.moveTo(W/2+k*W*.09,H/2-W*.24);c.lineTo(W/2+k*W*.09,H/2+W*.24);c.stroke();c.beginPath();c.moveTo(W/2-W*.24,H/2+k*W*.09);c.lineTo(W/2+W*.24,H/2+k*W*.09);c.stroke()}return}c.fillStyle='#e9e1cc';c.fillRect(0,0,W,H);c.strokeStyle='#23457a';c.fillStyle='#2c5592';c.lineWidth=5;c.strokeRect(3,3,W-6,H-6);
      if(kind==='lisbon'){c.lineWidth=4;for(let k=0;k<4;k++){c.save();c.translate(W/2,H/2);c.rotate(k*Math.PI/2);c.beginPath();c.moveTo(0,-8);c.bezierCurveTo(W*.18,-H*.2,W*.1,-H*.42,0,-H*.46);c.bezierCurveTo(-W*.1,-H*.42,-W*.18,-H*.2,0,-8);c.fill();c.restore()}
        c.fillStyle='#e9e1cc';c.beginPath();c.arc(W/2,H/2,W*.09,0,Math.PI*2);c.fill();c.fillStyle='#2c5592';c.beginPath();c.arc(W/2,H/2,W*.05,0,Math.PI*2);c.fill();
        for(const [x,y] of [[0,0],[W,0],[0,H],[W,H]]){c.beginPath();c.arc(x,y,W*.1,0,Math.PI*2);c.stroke()}return}
      c.beginPath();c.moveTo(W/2,10);c.lineTo(W-10,H/2);c.lineTo(W/2,H-10);c.lineTo(10,H/2);c.closePath();c.stroke();
      c.beginPath();c.arc(W/2,H/2,W*.16,0,Math.PI*2);c.fill();c.fillStyle='#d99a2b';c.beginPath();c.arc(W/2,H/2,W*.07,0,Math.PI*2);c.fill();
      c.fillStyle='#2c5592';for(const [x,y] of [[0,0],[W,0],[0,H],[W,H]]){c.beginPath();c.arc(x,y,W*.14,0,Math.PI*2);c.fill()}},128,128)}

    // ---------- the Ukrainian room's own things ----------
    // Two blue-and-yellow flags either side of the sign, a Petrykivka painting on the east wall with a rushnyk over it,
    // sunflowers in a clay jug and a bowl of pysanky on the reading table. Canvas textures and a few instanced parts;
    // the wing's own two lamps light them.
    function dressUkrainian({cx,cz,w,d,box,own,mark,root,block,placeBook,list,room,def}){
      furnishUkrainian({cx,cz,w,d,box,own,mark,root,block,placeBook,list,room,def});
      const Z=cz-d/2+.26,EX=cx+w/2-.19;
      // The flags, with a little fold in the cloth, each on a brass rod.
      const flagMap=own(canvasTexture((c,W,H)=>{c.fillStyle='#0057b7';c.fillRect(0,0,W,H/2);c.fillStyle='#ffd500';c.fillRect(0,H/2,W,H/2)},96,64));
      const flagGeo=own(new THREE.PlaneGeometry(1.2,.8,12,1)),pos=flagGeo.attributes.position;for(let i=0;i<pos.count;i++)pos.setZ(i,Math.sin(pos.getX(i)*7)*.025+.03);flagGeo.computeVertexNormals();
      const flagMat=own(new THREE.MeshStandardMaterial({map:flagMap,roughness:.85,side:THREE.DoubleSide})),rod=own(new THREE.CylinderGeometry(.018,.018,1.34,6)),knob=own(new THREE.SphereGeometry(.04,8,6));
      const flagCard={type:'intl-card',title:'Прапор України',author:'Синій і жовтий: небо над пшеничним полем, як його часто пояснюють. (The flag of Ukraine.)',action:'READ'};
      for(const side of [-1,1]){const x=cx+side*4.2;mark(add(flagGeo,flagMat,x,5.18,Z,root),flagCard);const r=add(rod,MAT.brass,x,5.6,Z+.05,root);r.rotation.z=Math.PI/2;for(const e of [-1,1])add(knob,MAT.brass,x+e*.68,5.6,Z+.05,root)}
      // The Petrykivka painting: brush-stroke flowers, leaves and kalyna berries on cream, in the manner of the village of Petrykivka.
      const paint=own(canvasTexture((c,W,H)=>{c.fillStyle='#f2e8cf';c.fillRect(0,0,W,H);
        const leaf=(x,y,len,a,wid,col)=>{c.save();c.translate(x,y);c.rotate(a);c.fillStyle=col;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(len*.45,-wid,len,0);c.quadraticCurveTo(len*.45,wid*.35,0,0);c.fill();c.restore()};
        const flower=(x,y,r,petal,heart)=>{for(let k=0;k<9;k++){const a=k/9*Math.PI*2;leaf(x,y,r,a,r*.42,petal)}for(let k=0;k<9;k++){const a=(k+.5)/9*Math.PI*2;leaf(x,y,r*.62,a,r*.3,heart)}c.fillStyle='#f4c430';c.beginPath();c.arc(x,y,r*.22,0,Math.PI*2);c.fill()};
        const berries=(x,y)=>{for(const [dx,dy] of [[0,0],[20,-8],[-19,-10],[8,17],[-11,15],[28,11],[-3,-25]]){c.fillStyle='#c0141c';c.beginPath();c.arc(x+dx,y+dy,12,0,Math.PI*2);c.fill();c.fillStyle='#fff3e0';c.beginPath();c.arc(x+dx-3,y+dy-3,2.2,0,Math.PI*2);c.fill()}};
        c.strokeStyle='#2f5d2a';c.lineWidth=11;c.lineCap='round';
        const stem=(x0,y0,x1,y1,bx,by)=>{c.beginPath();c.moveTo(x0,y0);c.quadraticCurveTo(bx,by,x1,y1);c.stroke()};
        stem(W/2,H-20,W/2,H*.3,W/2-40,H*.6);stem(W/2,H*.72,W*.24,H*.38,W*.3,H*.7);stem(W/2,H*.72,W*.76,H*.38,W*.7,H*.7);stem(W/2,H*.85,W*.12,H*.7,W*.3,H*.9);stem(W/2,H*.85,W*.88,H*.7,W*.7,H*.9);
        for(let k=0;k<14;k++){const t=k/13,x=W/2+(k%2?1:-1)*(18+t*10),y=H-40-t*(H*.55);leaf(x,y,96-t*30,(k%2?-.5:Math.PI+.5),24,k%3?'#3f7a33':'#2a5a27')}
        for(const [x0,y0,x1,y1] of [[W/2,H*.72,W*.24,H*.38],[W/2,H*.72,W*.76,H*.38],[W/2,H*.85,W*.12,H*.7],[W/2,H*.85,W*.88,H*.7]])for(let k=1;k<5;k++){const t=k/5,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t-Math.sin(t*Math.PI)*40,a=Math.atan2(y1-y0,x1-x0);leaf(x,y,58,a-1.1,15,'#3f7a33');leaf(x,y,52,a+1.1,14,'#2a5a27')}
        for(const [x,y,s] of [[W*.2,H*.62,1],[W*.8,H*.62,-1],[W*.33,H*.86,1],[W*.67,H*.86,-1]])for(let k=0;k<5;k++)leaf(x,y,84,(s>0?Math.PI:0)+s*(-.9+k*.45),20,'#3f7a33');
        flower(W/2,H*.25,112,'#c62a1f','#e8742a');flower(W*.24,H*.36,78,'#1f4f9a','#5a8fd6');flower(W*.76,H*.36,78,'#1f4f9a','#5a8fd6');flower(W*.12,H*.66,62,'#e8742a','#f4c430');flower(W*.88,H*.66,62,'#e8742a','#f4c430');
        berries(W*.37,H*.52);berries(W*.63,H*.52);berries(W*.42,H*.76);berries(W*.58,H*.76);
        c.strokeStyle='#7a1a12';c.lineWidth=6;c.strokeRect(14,14,W-28,H-28)},1024,620));
      const panel=add(own(new THREE.PlaneGeometry(3.4,2.06)),own(new THREE.MeshStandardMaterial({map:paint,roughness:.8})),EX,2.95,cz,root);panel.rotation.y=-Math.PI/2;
      mark(panel,{type:'intl-card',title:'Петриківський розпис',author:'Квіти, листя й калина, мальовані пензлем і пальцем, як у селі Петриківка на Дніпропетровщині. 2013 року ЮНЕСКО внесло петриківський розпис до списку нематеріальної культурної спадщини людства. (Petrykivka painting, on UNESCO’s list of the intangible heritage of humanity.)',action:'READ'});
      for(const s of [-1,1]){box(.08,.1,3.6,MAT.darkWood,EX+.02,2.95+s*1.08,cz);box(.08,2.26,.1,MAT.darkWood,EX+.02,2.95,cz+s*1.75)}
      // The rushnyk over it: an embroidered linen towel laid along the top and falling at both sides, as over an icon or a portrait in a Ukrainian home.
      const band=own(canvasTexture((c,W,H)=>stitchMotif(c,W,H),512,64));band.wrapS=THREE.RepeatWrapping;band.repeat.set(3,1);
      const tail=own(canvasTexture((c,W,H)=>{c.fillStyle='#efe6d2';c.fillRect(0,0,W,H);const u=8;for(let j=0;j<9;j++)for(let i=0;i<W/u;i++){const dd=Math.abs(i-(W/u-1)/2)+Math.abs(j-4);const col=dd<1.5?'#b3202a':dd>=3&&dd<4?'#1c1c1c':dd>=5&&dd<6?'#b3202a':null;if(col)stitch(c,i*u,H-40-(j+1)*u,u,col)}
        c.strokeStyle='#e6dcc3';c.lineWidth=2;for(let x=2;x<W;x+=5){c.beginPath();c.moveTo(x,H-16);c.lineTo(x,H);c.stroke()}},64,256));
      const linen=own(new THREE.MeshStandardMaterial({map:band,roughness:.9,side:THREE.DoubleSide})),hang=own(new THREE.MeshStandardMaterial({map:tail,roughness:.9,side:THREE.DoubleSide}));
      const top=add(own(new THREE.PlaneGeometry(4.1,.32)),linen,EX-.05,4.12,cz,root);top.rotation.y=-Math.PI/2;
      for(const s of [-1,1]){const t=add(own(new THREE.PlaneGeometry(.32,1.5)),hang,EX-.06,3.28,cz+s*1.95,root);t.rotation.y=-Math.PI/2}
      // Sunflowers in a clay jug, and pysanky in a bowl, on the reading table.
      const tx=cx+1.5,tz=cz+1.2,ty=.82,dummy=new THREE.Object3D();
      const jug=add(own(new THREE.LatheGeometry([[.001,0],[.1,0],[.14,.08],[.13,.2],[.07,.3],[.08,.36]].map(([x,y])=>new THREE.Vector2(x,y)),14)),own(new THREE.MeshStandardMaterial({color:0x9a4a26,roughness:.7})),tx+1.55,ty,tz-.1,root);
      const headMap=own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);c.fillStyle='#f2b81c';for(let k=0;k<22;k++){c.save();c.translate(W/2,H/2);c.rotate(k/22*Math.PI*2);c.beginPath();c.ellipse(0,-W*.33,W*.06,W*.16,0,0,Math.PI*2);c.fill();c.restore()}
        c.fillStyle='#4a2c12';c.beginPath();c.arc(W/2,H/2,W*.2,0,Math.PI*2);c.fill();c.fillStyle='#6b4420';for(let k=0;k<60;k++){const a=k*2.4,r=Math.sqrt(k/60)*W*.18;c.fillRect(W/2+Math.cos(a)*r-2,H/2+Math.sin(a)*r-2,4,4)}},128,128));
      const heads=own(new THREE.InstancedMesh(own(new THREE.CircleGeometry(.12,16)),own(new THREE.MeshStandardMaterial({map:headMap,transparent:true,alphaTest:.4,roughness:.8,side:THREE.DoubleSide})),5));
      const stems=own(new THREE.InstancedMesh(own(new THREE.CylinderGeometry(.008,.01,1,5)),own(new THREE.MeshStandardMaterial({color:0x3f6a2a,roughness:.9})),5));
      [[0,.62,0,.2],[.09,.52,.9,.35],[-.09,.5,-.8,.3],[.05,.44,2.2,.45],[-.05,.58,-2.4,.25]].forEach(([dx,hgt,yaw,tilt],i)=>{
        const bx=tx+1.55,bz=tz-.1,y0=ty+.34,hx=bx+dx+Math.sin(yaw)*tilt*.25,hz=bz+Math.cos(yaw)*tilt*.25,hy=y0+hgt;
        dummy.position.set((bx+hx)/2,(y0+hy)/2,(bz+hz)/2);dummy.lookAt(hx,hy,hz);dummy.rotateX(Math.PI/2);dummy.scale.set(1,Math.hypot(hx-bx,hy-y0,hz-bz),1);dummy.updateMatrix();stems.setMatrixAt(i,dummy.matrix);
        dummy.scale.set(1,1,1);dummy.position.set(hx,hy,hz);dummy.rotation.set(-tilt*.8,yaw,0,'YXZ');dummy.updateMatrix();heads.setMatrixAt(i,dummy.matrix)});
      root.add(stems,heads);
      const eggMap=own(canvasTexture((c,W,H)=>{c.fillStyle='#ffffff';c.fillRect(0,0,W,H);c.fillStyle='#161210';for(const y of [H*.32,H*.5,H*.68])c.fillRect(0,y-3,W,6);
        c.strokeStyle='#161210';c.lineWidth=3;for(const [y0,y1] of [[H*.32,H*.5],[H*.5,H*.68]]){c.beginPath();for(let x=0;x<=W;x+=16)c.lineTo(x,(x/16)%2?y1-6:y0+6);c.stroke()}
        c.fillStyle='#f6e7b0';for(let x=8;x<W;x+=16){c.beginPath();c.arc(x,H*.2,3,0,Math.PI*2);c.fill();c.beginPath();c.arc(x,H*.8,3,0,Math.PI*2);c.fill()}},128,128));
      const eggGeo=own(new THREE.SphereGeometry(.042,14,10));eggGeo.scale(1,1.3,1);
      const eggs=own(new THREE.InstancedMesh(eggGeo,own(new THREE.MeshStandardMaterial({map:eggMap,roughness:.4})),6)),colour=new THREE.Color();
      [[0,0,0xc0141c],[.07,.03,0xf2b81c],[-.06,.04,0x1f4f9a],[.03,-.07,0xc0141c],[-.05,-.05,0x2f6d2a],[.08,-.05,0xd9772a]].forEach(([dx,dz,col],i)=>{dummy.position.set(tx-1.1+dx,ty+.06,tz+.1+dz);dummy.rotation.set(1.25,i*1.1,0);dummy.updateMatrix();eggs.setMatrixAt(i,dummy.matrix);eggs.setColorAt(i,colour.setHex(col))});
      root.add(eggs);
      const bowl=add(own(new THREE.LatheGeometry([[.001,0],[.1,0],[.15,.04],[.17,.08]].map(([x,y])=>new THREE.Vector2(x,y)),16)),own(new THREE.MeshStandardMaterial({color:0xe9dcc0,roughness:.5,side:THREE.DoubleSide})),tx-1.1,ty,tz+.1,root);
      mark(bowl,{type:'intl-card',title:'Писанки',author:'Яйця, розписані воском і фарбами до Великодня: смуги, хвилі й крапки, кожна писанка своя. (Pysanky, Easter eggs written in wax and dye.)',action:'READ'});
      mark(jug,{type:'intl-card',title:'Соняшники',author:'Соняшники в глиняному глечику, як на українському столі наприкінці літа. (Sunflowers in a clay jug.)',action:'READ'});
    }

    // ---------- the Italian room's own things ----------
    // A lemon tree in a terracotta pot in the south-east corner: its leaves and lemons two instanced meshes, lit by the
    // wing's own two lamps.
    function dressItalian({cx,cz,w,d,own,mark,block,root}){
      const px=cx+w/2-1.3,pz=cz+d/2-1.5,dummy=new THREE.Object3D();
      const pot=add(own(new THREE.LatheGeometry([[.001,0],[.26,0],[.3,.06],[.36,.52],[.42,.56],[.42,.64],[.001,.64]].map(([x,y])=>new THREE.Vector2(x,y)),18)),own(new THREE.MeshStandardMaterial({color:0xa8552e,roughness:.85})),px,0,pz,root);
      add(own(new THREE.CylinderGeometry(.045,.07,1.1,7)),own(new THREE.MeshStandardMaterial({color:0x5a4330,roughness:.9})),px,1.15,pz,root);
      const leaves=own(new THREE.InstancedMesh(own(new THREE.IcosahedronGeometry(.2,0)),own(new THREE.MeshStandardMaterial({color:0x2f6a2c,roughness:.7,flatShading:true})),26));
      const lemons=own(new THREE.InstancedMesh(own(new THREE.SphereGeometry(.055,10,8).scale(1,1,1.35)),own(new THREE.MeshStandardMaterial({color:0xf2d13a,roughness:.5})),11));
      // The same tree every night: a golden-angle spiral over a ball of leaves.
      for(let i=0;i<26;i++){const t=(i+.5)/26,a=i*2.4,r=Math.sqrt(1-(2*t-1)**2)*.55;dummy.position.set(px+Math.cos(a)*r,2.05+(2*t-1)*.42,pz+Math.sin(a)*r);dummy.rotation.set(a,a*.7,0);dummy.scale.setScalar(.8+(i%5)*.12);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix)}
      for(let i=0;i<11;i++){const t=(i+.5)/11,a=i*2.4+1,r=Math.sqrt(1-(2*t-1)**2)*.6;dummy.position.set(px+Math.cos(a)*r,2.0+(2*t-1)*.4,pz+Math.sin(a)*r);dummy.rotation.set(0,a,.4);dummy.scale.setScalar(1);dummy.updateMatrix();lemons.setMatrixAt(i,dummy.matrix)}
      root.add(leaves,lemons);block(px,pz,1,1);
      const card={type:'intl-card',title:'Il limone',author:'Un limone in un vaso di terracotta, come quelli che d’inverno si riparano nelle limonaie dei giardini toscani. (A lemon tree in a terracotta pot.)',action:'READ'};
      for(const thing of [pot,leaves,lemons])mark(thing,card);
    }

    // ---------- more of the Ukrainian room ----------
    // The shelf of the Executed Renaissance by the door, under a candle; three pictures (assets/pictures, fetched by
    // scripts/fetch-maps.mjs); Shevchenko's boot, with the little book he hid in it, found once and kept; a bandura that
    // plays Leontovych's Shchedryk; and, from Christmas Eve to Vodokhreshche, a didukh. No lights of their own.
    const BOOT_KEY='athenaeum-shevchenko-boot';
    const bootFound=()=>{try{return storage?.getItem(BOOT_KEY)==='1'}catch(e){return false}};
    let shchedrykUntil=0;
    function furnishUkrainian({cx,cz,w,d,box,own,mark,root,block,placeBook,list,room,def}){
      const S=cz+d/2,EX=cx+w/2-.19,byTitle=title=>list.find(book=>book.title===title);
      const frameMat=own(new THREE.MeshStandardMaterial({color:0x6b4a22,roughness:.55,metalness:.25}));
      // A picture in a frame, its image loaded from assets/pictures (a plain canvas until it comes).
      const picture=(key,x,y,z,yaw,pw,ph,card)=>{
        const mat=own(new THREE.MeshStandardMaterial({color:0x3a3026,roughness:.8}));
        const face=add(own(new THREE.PlaneGeometry(pw,ph)),mat,x,y,z,root);face.rotation.y=yaw;
        const back=add(own(new THREE.BoxGeometry(pw+.22,ph+.22,.06)),frameMat,x-Math.sin(yaw)*.04,y,z-Math.cos(yaw)*.04,root);back.rotation.y=yaw;
        new THREE.TextureLoader().load(`assets/pictures/${key}-wall.jpg`,texture=>{if(!built.ukrainian)return texture.dispose();texture.colorSpace=THREE.SRGBColorSpace;own(texture);mat.map=texture;mat.color.set(0xffffff);mat.needsUpdate=true});
        mark(face,{type:'intl-card',title:card[0],author:card[1],action:'READ'});mark(back,face.userData);return face};
      picture('shevchenko-kateryna',EX,2.95,cz-4.9,-Math.PI/2,1.48,2,['Тарас Шевченко. «Катерина», 1842','Картину Шевченко намалював за власною поемою: Катерина прощається з москалем, що від’їжджає геть. Шевченко був не лише поетом, а й художником, учнем Карла Брюллова в Петербурзькій академії мистецтв. (Taras Shevchenko’s painting Kateryna, 1842, after his own poem.)']);
      picture('shevchenko-1848',EX,2.95,cz+4.9,-Math.PI/2,2.2,1.5,['Тарас Шевченко. «Укріплення Раїм. Вид з верфі на Сир-Дар’ї», 1848','Шевченко намалював це в червні 1848 року, на засланні, коли його взяли художником до Аральської експедиції: на верфі під Раїмом складали шхуну «Костянтин», а вдалині на горі видно укріплення. Писати й малювати йому заборонив цар. (Taras Shevchenko, Raim Fortification: View from the Shipyard on the Syr Darya, 1848, drawn in exile on the Aral expedition.)']);
      picture('pymonenko-night',cx-7.2,3,S-.2,Math.PI,2.3,1.77,['Микола Пимоненко. «Українська ніч», 1905','Пимоненко все життя малював українське село: його свята, роботу й вечори. Він навчався й викладав у Києві. (Mykola Pymonenko, Ukrainian Night, 1905.)']);

      // The shelf of the Executed Renaissance: two tiers of four, on the south wall east of the door, under a candle.
      const mx=cx+6,mz=S-.42,held=(def.memorial||[]).map(byTitle).filter(Boolean);
      box(6.9,2.5,.06,MAT.darkWood,mx,2.3,S-.2);box(7.1,.14,.46,MAT.darkWood,mx,3.55,S-.36);
      for(let i=0;i<=4;i++)box(.07,2.5,.4,MAT.darkWood,mx-3.4+i*1.7,2.3,S-.38);
      for(let row=0;row<2;row++)box(6.8,.05,.36,MAT.darkWood,mx,1.1+row*1.12,S-.36);block(mx,S-.4,7.1,.8);
      held.slice(0,8).forEach((book,i)=>placeBook(book,{x:mx-2.55+(i%4)*1.7,y:1.62+Math.floor(i/4)*1.12,z:mz,yaw:Math.PI}));
      const memorialCard={type:'intl-card',title:'Розстріляне відродження',author:'Письменники 1920-х років, яких у 1930-х розстріляли, замучили в таборах чи довели до смерті: Підмогильний, Хвильовий, Зеров, Куліш, Косинка, Плужник, Драй-Хмара, Йогансен. Восени 1937 року в урочищі Сандармох у Карелії розстріляли Зерова, Підмогильного, Куліша й Леся Курбаса разом із сотнями інших в’язнів Соловків. Назву «Розстріляне відродження» дала їм антологія Юрія Лавріненка 1959 року. (The Executed Renaissance: Ukrainian writers of the 1920s, shot or worked to death in the camps in the 1930s.)',action:'READ'};
      const board=add(own(new THREE.PlaneGeometry(4.2,.62)),own(new THREE.MeshStandardMaterial({map:own(plaque('РОЗСТРІЛЯНЕ ВІДРОДЖЕННЯ','The Executed Renaissance · 1920–1937',1000,148,'#151515')),roughness:.8,emissive:0x5a3a18,emissiveIntensity:.2})),mx,4.05,S-.18,root);board.rotation.y=Math.PI;mark(board,memorialCard);
      const candle=add(own(new THREE.CylinderGeometry(.045,.05,.26,12)),own(new THREE.MeshStandardMaterial({color:0xefe4c8,roughness:.6})),mx,3.75,S-.42,root);mark(candle,memorialCard);
      const flame=add(own(new THREE.ConeGeometry(.028,.09,10)),own(new THREE.MeshStandardMaterial({color:0xffc060,emissive:0xff9a30,emissiveIntensity:2.2,transparent:true,opacity:.92})),mx,3.93,S-.42,root);
      room.ticks.push(t=>{const k=1+Math.sin(t*9.1)*.08+Math.sin(t*23.7)*.05;flame.scale.set(1/k,k,1/k);flame.position.x=mx+Math.sin(t*5.3)*.004});

      // Shevchenko's boot under his drawing of Raim, beside a small trunk; the little book on the trunk once it is found.
      const bx=EX-.55,bz=cz+4.5,leather=own(new THREE.MeshStandardMaterial({color:0x1d1611,roughness:.55}));
      const shaft=add(own(new THREE.CylinderGeometry(.085,.075,.46,14,1,true)),leather,bx,.31,bz,root),foot=add(own(new THREE.BoxGeometry(.13,.1,.3)),leather,bx,.05,bz+.08,root);
      const heel=add(own(new THREE.BoxGeometry(.12,.04,.08)),own(new THREE.MeshStandardMaterial({color:0x3a2a1a,roughness:.7})),bx,.02,bz-.06,root);
      const trunk=box(.5,.46,.8,MAT.wood,bx,.23,cz+3.55);box(.52,.04,.82,MAT.darkWood,bx,.47,cz+3.55);block(bx,cz+4,.9,1.7);
      const bootCard=()=>bootFound()?{type:'intl-card',title:'Солдатський чобіт',author:'Порожній. Те, що Шевченко ховав за халявою, тепер лежить на скрині поруч. (Empty now: what Shevchenko hid in it lies on the trunk beside it.)',action:'READ'}
        :{type:'intl-boot',title:'Солдатський чобіт',author:'Старий солдатський чобіт. За халявою щось є. (An old soldier’s boot. Something is tucked inside the top of it.)',action:'LOOK'};
      for(const part of [shaft,foot,heel])mark(part,bootCard());
      const showBook=()=>{const book=byTitle(def.boot);if(!book||room.bootBook)return;const mesh=placeBook(book,{x:bx,y:.5,z:cz+3.55,yaw:-Math.PI/2});mesh.scale.set(.42,.42,1);mesh.rotation.x=-Math.PI/2;mesh.userData.home.quaternion.copy(mesh.quaternion);room.bootBook=mesh};
      room.bootParts=[shaft,foot,heel];room.showBootBook=showBook;room.bootCard=bootCard;
      if(bootFound())showBook();

      // The bandura, leaning on the south wall under Pymonenko's picture.
      const ux=cx-7.2,uz=S-.45,bandura=new THREE.Group();bandura.position.set(ux,0,uz);bandura.rotation.set(-.16,Math.PI,0);root.add(bandura);
      const woodBody=own(new THREE.MeshStandardMaterial({color:0x8a5426,roughness:.45}));
      const body=add(own(new THREE.SphereGeometry(.5,20,14)),woodBody,0,.72,0,bandura);body.scale.set(.62,.95,.16);
      const strings=own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);c.strokeStyle='rgba(235,225,200,.85)';c.lineWidth=1.4;for(let i=0;i<22;i++){const x=W*.18+i*W*.03;c.beginPath();c.moveTo(x,H*.08);c.lineTo(W*.3+i*W*.018,H*.95);c.stroke()}
        c.fillStyle='#e8c46a';c.beginPath();c.arc(W*.5,H*.62,W*.07,0,Math.PI*2);c.fill();c.fillStyle='#2a160a';c.beginPath();c.arc(W*.5,H*.62,W*.05,0,Math.PI*2);c.fill()},128,256));
      const face=add(own(new THREE.PlaneGeometry(.6,.9)),own(new THREE.MeshStandardMaterial({map:strings,transparent:true,alphaTest:.05,roughness:.5,side:THREE.DoubleSide})),0,.74,.085,bandura);
      const neck=add(own(new THREE.BoxGeometry(.09,.42,.07)),woodBody,-.18,1.32,0,bandura);neck.rotation.z=.32;
      const banduraCard={type:'intl-bandura',title:'Бандура',author:'Бандура, інструмент кобзарів. Торкніться струн, і вона заграє «Щедрик» Миколи Леонтовича: його вперше заспівав хор Київського університету 1916 року, 1922 року хор Олександра Кошиця заспівав його в нью-йоркському Карнегі-холі, а 1936 року Пітер Вільговський написав до нього англійські слова, і світ почув «Carol of the Bells». (A bandura: it plays Leontovych’s Shchedryk, the carol the world knows as Carol of the Bells.)',action:'PLAY'};
      for(const part of [body,face,neck])mark(part,banduraCard);block(ux,uz,.9,.6);

      // The Peresopnytsia Gospel under glass in the middle of the west side (peresopnytsia-book.js): a plinth, the
      // facsimile open in a cradle at Mark's portrait and the first page of his Gospel, which face each other in the book.
      if(gospel){const gx=cx-6,gz=cz-.5,g=new THREE.Group();g.position.set(gx,0,gz);root.add(g);
        const leaves=gospel.folios?Object.keys(gospel.folios).length:10;
        const data={type:'intl-gospel',title:'Пересопницьке Євангеліє',author:`Факсиміле Пересопницького Євангелія (1556–1561), на якому складають присягу президенти України, розгорнуте на початку Євангелія від Марка. (The Peresopnytsia Gospel, a facsimile: ${leaves} of its pages, on board leaves.)`,action:'OPEN'};
        const wood=MAT.darkWood,brass=MAT.brass;
        const plinth=add(own(new THREE.BoxGeometry(1.5,.95,1.05)),wood,0,.475,0,g);add(own(new THREE.BoxGeometry(1.6,.06,1.15)),wood,0,.97,0,g);
        const pageW=.5,pageH=.5*1820/1190;
        const page=(key,side)=>{const mat=own(new THREE.MeshStandardMaterial({color:0xd8cdb6,roughness:.9,emissive:0xffffff,emissiveIntensity:.1}));
          new THREE.TextureLoader().load(`assets/peresopnytsia/${key}-case.jpg`,texture=>{if(!built.ukrainian)return texture.dispose();texture.colorSpace=THREE.SRGBColorSpace;own(texture);mat.map=texture;mat.emissiveMap=texture;mat.needsUpdate=true});
          const hinge=new THREE.Group();hinge.position.set(side*.01,1.09,0);hinge.rotation.z=side*-.16;g.add(hinge);
          const m=add(own(new THREE.PlaneGeometry(pageW,pageH)),mat,side*pageW/2,0,0,hinge);m.rotation.x=-Math.PI/2;return m};
        const left=page('mark',-1),right=page('l129',1);
        for(const side of [-1,1]){const wedge=add(own(new THREE.BoxGeometry(.54,.08,pageH+.03)),wood,side*.27,.95,0,g);wedge.rotation.z=side*-.16}
        const glass=own(new THREE.MeshStandardMaterial({color:0xdfeee8,transparent:true,opacity:.045,roughness:.05,depthWrite:false}));
        const pane=add(own(new THREE.BoxGeometry(1.42,.5,1.05)),glass,0,1.25,0,g);
        const post=own(new THREE.BoxGeometry(.03,.5,.03));for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]])add(post,brass,sx*.71,1.25,sz*.525,g);
        for(const sz of [-1,1])add(own(new THREE.BoxGeometry(1.45,.03,.03)),brass,0,1.5,sz*.525,g);
        const label=add(own(new THREE.PlaneGeometry(1.05,.3)),own(new THREE.MeshStandardMaterial({map:own(plaque('ПЕРЕСОПНИЦЬКЕ ЄВАНГЕЛІЄ','The Peresopnytsia Gospel · 1556–1561 · a facsimile',560,160,'#1d2a3d')),roughness:.85,emissive:0x3a2a12,emissiveIntensity:.3})),0,.7,.53,g);
        for(const part of [plinth,pane,left,right,label])mark(part,data);block(gx,gz,1.8,1.4)}

      // A didukh, the sheaf of the Christmas table, from Christmas Eve (24 December) to Vodokhreshche (19 January, by the old calendar).
      const now=today(),md=now.getMonth()*100+now.getDate();
      if(md>=1124||md<=19){const dx=EX-.45,dz=cz-3.05,dummy=new THREE.Object3D();
        const straw=own(new THREE.MeshStandardMaterial({color:0xd8b24a,roughness:.8}));
        const N=72,stalks=own(new THREE.InstancedMesh(own(new THREE.CylinderGeometry(.007,.009,1,4)),straw,N)),ears=own(new THREE.InstancedMesh(own(new THREE.SphereGeometry(.024,6,5).scale(1,3.2,1)),straw,N));
        for(let i=0;i<N;i++){const a=i*2.4,r=.03+(i%7)*.016,lean=.1+(i%5)*.05,top=new THREE.Vector3(dx+Math.cos(a)*(r+lean*.9),1.18+(i%4)*.05,dz+Math.sin(a)*(r+lean*.9));
          const base=new THREE.Vector3(dx+Math.cos(a)*r*.6,.12,dz+Math.sin(a)*r*.6),mid=base.clone().add(top).multiplyScalar(.5);
          dummy.position.copy(mid);dummy.lookAt(top);dummy.rotateX(Math.PI/2);dummy.scale.set(1,base.distanceTo(top),1);dummy.updateMatrix();stalks.setMatrixAt(i,dummy.matrix);
          dummy.position.copy(top);dummy.scale.set(1,1,1);dummy.updateMatrix();ears.setMatrixAt(i,dummy.matrix)}
        root.add(stalks,ears);const tie=add(own(new THREE.TorusGeometry(.075,.018,6,16)),own(new THREE.MeshStandardMaterial({color:0xb3202a,roughness:.6})),dx,.62,dz,root);tie.rotation.x=Math.PI/2;
        const didukh={type:'intl-card',title:'Дідух',author:'Сніп із колосків, який на Святвечір ставлять на покуті, на почесному місці в хаті. За давнім звичаєм, у ньому на свята гостюють духи предків. (A didukh, the sheaf of wheat set in the place of honour on Christmas Eve.)',action:'READ'};
        for(const thing of [stalks,ears,tie])mark(thing,didukh);block(dx,dz,.6,.6)}
    }

    // ---------- the books ----------
    function shelf(key){return [...new Set(arrivals(key))].map(id=>findBook(id)).filter(Boolean)}
    // One book is out on each lectern each night, a different one tomorrow.
    const apart=(def,book)=>!!def&&((def.memorial||[]).includes(book.title)||book.title===def.boot);
    function featured(key='spanish',list=shelf(key)){list=list.filter(book=>!apart(ROOMS[key],book));
      // On the Day of Ukrainian Writing and Language, Kotliarevsky's Eneida, the first book in the modern literary language.
      if(key==='ukrainian'&&writingDay(today())){const eneida=list.find(book=>book.title==='Енеїда');if(eneida)return eneida}
      return list.length?list[((dayNumber()%list.length)+list.length)%list.length]:null}

    // ---------- the door, beside the visitors' book ----------
    function buildDoor(){
      const g=new THREE.Group();g.name='international-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const mark=(object,data)=>{object.userData=data;interactables.push(object);return object};
      // A stone doorcase round the navy door, its lintel cut with the word for books in each of the wing's languages.
      if(hangWing(g,'spanish',{data:doorData,mark,...(doorKit?.readingRoom?.('THE INTERNATIONAL WING','Seven languages, seven reading rooms')||{}),fanlight:true,fanColor:0x9a6a3a})){
        for(const side of [-1,1]){add(new THREE.BoxGeometry(.36,4.1,.3),MAT.stone,side*1.52,2.05,.1,g);add(new THREE.BoxGeometry(.5,.18,.38),MAT.stone,side*1.52,4.18,.12,g);add(new THREE.BoxGeometry(.5,.32,.38),MAT.stone,side*1.52,.16,.12,g)}
        add(new THREE.BoxGeometry(3.5,.66,.34),MAT.stone,0,4.6,.12,g);add(new THREE.BoxGeometry(3.8,.12,.44),MAT.stone,0,4.99,.14,g);
        mark(add(new THREE.PlaneGeometry(3.3,.46),new THREE.MeshStandardMaterial({map:carved('LIBROS · LIVROS · LIVRES · 書 · LIBRI · КНИЖКИ',1024,144,`Georgia,${CJK}`),roughness:.9}),0,4.6,.295,g),doorData)}
      else mark(add(new THREE.BoxGeometry(1.9,3.1,.14),new THREE.MeshStandardMaterial({color:DOOR_LOOKS.spanish.color,roughness:.75}),0,1.55,.08,g),doorData);
      const l=new THREE.PointLight(0xffc27a,1.1,5,2);l.position.set(0,3.9,1.1);g.add(l);
    }

    // ---------- a room ----------
    function buildRoom(key){
      const def=ROOMS[key],{cx,cz,w,d,h}=def,root=new THREE.Group();root.name=`international-${key}`;
      const room=built[key]={root,owned:[],ours:[],books:[],blockers:[],ticks:[]};
      const own=thing=>{room.owned.push(thing);return thing};
      const box=(bw,bh,bd,material,x,y,z,parent=root)=>add(own(new THREE.BoxGeometry(bw,bh,bd)),material,x,y,z,parent);
      const mark=(object,data)=>{object.userData=data;interactables.push(object);room.ours.push(object);return object};
      const block=(x,z,bw,bd)=>room.blockers.push({minX:x-bw/2,maxX:x+bw/2,minZ:z-bd/2,maxZ:z+bd/2});
      const wall=wallMaterial||own(new THREE.MeshStandardMaterial({color:0x7a5236,roughness:.92})),tiles=own(tileTexture(def.tiles));tiles.wrapS=tiles.wrapT=THREE.RepeatWrapping;
      box(w,.3,d,MAT.wood,cx,-.15,cz);box(w,.25,d,MAT.darkWood,cx,h+.12,cz);
      const walls=[box(w,h,.3,wall,cx,h/2,cz-d/2),box(w,h,.3,wall,cx,h/2,cz+d/2),box(.3,h,d,wall,cx-w/2,h/2,cz),box(.3,h,d,wall,cx+w/2,h/2,cz)];
      finishWalls?.(walls.map((mesh,i)=>[mesh,...(i<2?[w,h,.3]:[.3,h,d])]));
      // The tiled dado, 1.1 m high all round, capped with a wooden rail.
      for(const [x,z,sw,sd,len] of [[cx,cz-d/2+.17,w-.4,.05,w],[cx,cz+d/2-.17,w-.4,.05,w],[cx-w/2+.17,cz,.05,d-.4,d],[cx+w/2-.17,cz,.05,d-.4,d]]){
        const t=own(tiles.clone());t.repeat.set(Math.round(len/.55),2);box(sw,1.1,sd,own(new THREE.MeshStandardMaterial({map:t,roughness:.45})),x,.55,z);box(sw,.07,sd+.06,MAT.darkWood,x,1.13,z)}
      const sign=add(own(new THREE.PlaneGeometry(6,.86)),own(new THREE.MeshStandardMaterial({map:own(plaque(def.sign,def.sub,1100,158,'#1d2a3d',def.font)),roughness:.8,emissive:0x5a3a18,emissiveIntensity:.3})),cx,5.28,cz-d/2+.24,root);
      mark(sign,{type:'intl-card',title:def.card[0],author:def.card[1],action:'READ'});
      // Books face-out on sloping racks: three tiers along the north wall, three along the west wall.
      const spots=[];
      for(let row=0;row<3;row++)for(let i=0;i<10;i++)spots.push({x:cx-9.9+i*2.2,z:cz-d/2+.42,y:1.62+row*1.12,yaw:0});
      for(let row=0;row<3;row++)for(let i=0;i<6;i++)spots.push({x:cx-w/2+.42,z:cz-5.5+i*2.05,y:1.62+row*1.12,yaw:Math.PI/2});
      // Dark wooden bookcases behind the racks, with uprights between the columns and a cornice along the top.
      box(22.6,3.45,.06,MAT.darkWood,cx,2.84,cz-d/2+.2);box(.06,3.45,12.8,MAT.darkWood,cx-w/2+.2,2.84,cz);
      box(22.8,.14,.46,MAT.darkWood,cx,4.6,cz-d/2+.36);box(.46,.14,13,MAT.darkWood,cx-w/2+.36,4.6,cz);
      for(let i=0;i<=10;i++)box(.07,3.45,.4,MAT.darkWood,cx-11+i*2.2,2.84,cz-d/2+.38);for(let i=0;i<=6;i++)box(.4,3.45,.07,MAT.darkWood,cx-w/2+.38,2.84,cz-6.52+i*2.05);
      for(let row=0;row<3;row++){const y=1.1+row*1.12;box(22.4,.05,.36,MAT.darkWood,cx,y,cz-d/2+.36);box(.36,.05,12.6,MAT.darkWood,cx-w/2+.36,y,cz)}
      block(cx,cz-d/2+.4,w,.8);block(cx-w/2+.4,cz,.8,d);
      const list=shelf(key),geometry=own(new THREE.BoxGeometry(.78,1.04,.05));
      const placeBook=(book,spot)=>{const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,root);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw;mesh.rotation.x=-.1;
        mesh.userData={type:'book',book,loaded:false,international:true,wingRoom:key,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
        interactables.push(mesh);room.ours.push(mesh);room.books.push(mesh);return mesh};
      const corner=def.corner,inCorner=book=>!!corner&&corner.ids.includes(book.id);
      list.filter(book=>!inCorner(book)&&!apart(def,book)).slice(0,spots.length).forEach((book,i)=>placeBook(book,spots[i]));
      // A room's own corner shelf (the French room's Rayon suisse): a short case of two tiers on the east wall.
      if(corner){const ex=cx+w/2,held=corner.ids.map(id=>list.find(book=>book.id===id)).filter(Boolean);
        box(.06,2.4,8.8,MAT.darkWood,ex-.2,2.3,cz);box(.46,.14,9,MAT.darkWood,ex-.36,3.52,cz);for(let i=0;i<=4;i++)box(.4,2.4,.07,MAT.darkWood,ex-.38,2.3,cz-4.4+i*2.2);
        for(let row=0;row<2;row++)box(.36,.05,8.6,MAT.darkWood,ex-.36,1.1+row*1.12,cz);block(ex-.4,cz,.8,9);
        held.slice(0,8).forEach((book,i)=>placeBook(book,{x:ex-.42,z:cz-3.3+(i%4)*2.2,y:1.62+Math.floor(i/4)*1.12,yaw:-Math.PI/2}));
        const board=add(own(new THREE.PlaneGeometry(3.4,.6)),own(new THREE.MeshStandardMaterial({map:own(plaque(corner.sign,corner.sub,900,160,'#23170e')),roughness:.8,emissive:0x5a3a18,emissiveIntensity:.25})),ex-.18,4.15,cz,root);board.rotation.y=-Math.PI/2;
        mark(board,{type:'intl-card',title:corner.card[0],author:corner.card[1],action:'READ'});
        if(corner.flag){// The white cross on red, beside the sign.
          const flag=own(canvasTexture((c,W,H)=>{c.fillStyle='#d52b1e';c.fillRect(0,0,W,H);c.fillStyle='#ffffff';c.fillRect(W*.41,H*.19,W*.18,H*.62);c.fillRect(W*.19,H*.41,W*.62,H*.18)},64,64));
          const mesh=add(own(new THREE.PlaneGeometry(.5,.5)),own(new THREE.MeshStandardMaterial({map:flag,roughness:.7})),ex-.18,4.15,cz-2.1,root);mesh.rotation.y=-Math.PI/2}}
      if(key==='ukrainian')dressUkrainian({cx,cz,w,d,box,own,mark,root,block,placeBook,list,room,def});
      if(key==='italian')dressItalian({cx,cz,w,d,own,mark,block,root});
      // The doors in the east wall of the Spanish room: green to the Portuguese room, blue to the French, red to the Chinese.
      const doorSign=(signText,signSub,font,x,z,yaw,data)=>{const board=add(own(new THREE.PlaneGeometry(2.6,.5)),own(new THREE.MeshStandardMaterial({map:own(plaque(signText,signSub,780,150,'#23170e',font)),roughness:.8,emissive:0x5a3a18,emissiveIntensity:.25})),x,4.95,z,root);board.rotation.y=yaw;mark(board,data)};
      const plainDoor=(x,z,yaw,color,data)=>{const slab=box(1.9,3.1,.16,own(new THREE.MeshStandardMaterial({color,roughness:.7})),x,1.55,z);slab.rotation.y=yaw;mark(slab,data)};
      // The doors in the east wall of the Spanish room face west, into it.
      const eastDoor=(z,wing,data,signText,signSub,font='Georgia')=>{const x=cx+w/2-.2;
        if(!hangWing(root,wing,{data,mark,x,z,yaw:-Math.PI/2,own}))plainDoor(x,z,Math.PI/2,DOOR_LOOKS[wing].color,data);
        doorSign(signText,signSub,font,x-.14,z,-Math.PI/2,data);block(x-.3,z,.6,2.4)};
      if(key==='spanish'){
        eastDoor(ROOM_DOORS.portuguese.z,'portuguese',{type:'intl-go',room:'portuguese',title:'Sala de leitura em português',author:'Clássicos em português, cada um com uma nota da bibliotecária. (The Portuguese Reading Room.)',action:'ENTER'},'SALA DE LEITURA EM PORTUGUÊS','Entre · The Portuguese Reading Room');
        eastDoor(ROOM_DOORS.french.z,'french',{type:'intl-go',room:'french',title:'Salle de lecture en français',author:'Des classiques en français, chacun avec une note de la bibliothécaire. (The French Reading Room.)',action:'ENTER'},'SALLE DE LECTURE EN FRANÇAIS','Entrez · The French Reading Room');
        {const d=ROOM_DOORS.latin,data={type:'intl-go',room:'latin',title:'Conclave Latinum',author:'The Latin Reading Room: the Romans in their own words. (Intrate.)',action:'ENTER'};
          if(!hangWing(root,'latin',{data,mark,x:d.x,z:d.z,yaw:Math.PI,own}))plainDoor(d.x,d.z,0,DOOR_LOOKS.latin.color,data);
          doorSign('CONCLAVE LATINVM','Intrate · The Latin Reading Room','Georgia',d.x,d.z-.14,Math.PI,data);block(d.x,d.z-.3,2.4,.6)}
        {const d=ROOM_DOORS.ukrainian,data={type:'intl-go',room:'ukrainian',title:'Українська читальня',author:'Класика українською мовою, кожна книжка з приміткою бібліотекарки. (The Ukrainian Reading Room.)',action:'ENTER'};
          if(!hangWing(root,'ukrainian',{data,mark,x:d.x,z:d.z,yaw:Math.PI,own}))plainDoor(d.x,d.z,0,DOOR_LOOKS.ukrainian.color,data);
          doorSign('УКРАЇНСЬКА ЧИТАЛЬНЯ','Заходьте · The Ukrainian Reading Room','Georgia',d.x,d.z-.14,Math.PI,data);block(d.x,d.z-.3,2.4,.6)}
        // The Italian room's own door from the lobby, between the way out and the Latin room's door.
        {const d=ROOM_DOORS.italian,data={type:'intl-go',room:'italian',door:'italian',title:'Sala di lettura in italiano',author:'Classici in italiano, ciascuno con una nota della bibliotecaria. (The Italian Reading Room.)',action:'ENTER'};
          if(!hangWing(root,'italian',{data,mark,x:d.x,z:d.z,yaw:Math.PI,own}))plainDoor(d.x,d.z,0,DOOR_LOOKS.italian.color,data);
          doorSign('SALA DI LETTURA IN ITALIANO','Entrate · The Italian Reading Room','Georgia',d.x,d.z-.14,Math.PI,data);block(d.x,d.z-.3,2.4,.6)}
        eastDoor(ROOM_DOORS.chinese.z,'chinese',{type:'intl-go',room:'chinese',title:'中文閱覽室',author:'中文經典，每一本都附有館員的短評。(The Chinese Reading Room.)',action:'ENTER'},'中文閱覽室','請進 · The Chinese Reading Room',CJK);
      }
      // From Virgil to Dante: the Latin room's east wall opens on the Italian.
      if(key==='latin')eastDoor(ROOM_DOORS['italian-latin'].z,'italian',{type:'intl-go',room:'italian',door:'italian-latin',title:'Sala di lettura in italiano',author:'Classici in italiano, ciascuno con una nota della bibliotecaria. (The Italian Reading Room.)',action:'ENTER'},'SALA DI LETTURA IN ITALIANO','Entrate · The Italian Reading Room');
      // The reading table, with a lamp, and the lectern by the door with tonight's book.
      box(4.2,.08,1.6,MAT.darkWood,cx+1.5,.78,cz+1.2);for(const [dx,dz] of [[-1.9,-.6],[1.9,-.6],[-1.9,.6],[1.9,.6]])box(.1,.74,.1,MAT.darkWood,cx+1.5+dx,.39,cz+1.2+dz);block(cx+1.5,cz+1.2,4.4,1.8);
      const leather=own(new THREE.MeshStandardMaterial({color:0x5b2418,roughness:.75}));
      // The four chairs can be sat in: the library's own seats (game.js), which open one of this room's books.
      const bookIds=list.filter(book=>book.title!==def.boot).map(book=>book.id);
      for(const [dx,dz,yaw] of [[-1,-1.35,0],[1,-1.35,0],[-1,1.35,Math.PI],[1,1.35,Math.PI]]){const chair=new THREE.Group();chair.position.set(cx+1.5+dx,0,cz+1.2+dz);chair.rotation.y=yaw;root.add(chair);const seat=box(.5,.08,.5,leather,0,.46,0,chair),back=box(.5,.6,.08,leather,0,.78,-.24,chair);for(const [lx,lz] of [[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]])box(.05,.44,.05,MAT.darkWood,lx,.22,lz,chair);
        if(registerSeat&&bookIds.length){registerSeat([seat,back],chair,new THREE.Vector3(0,1.28,.08),yaw+Math.PI,{title:def.seat[0],author:def.seat[1],bookIds,wingRoom:key});room.ours.push(seat,back)}}
      box(.1,.5,.1,MAT.brass,cx+1.5,1.07,cz+1.2);add(own(new THREE.CylinderGeometry(.16,.3,.24,14,1,true)),own(new THREE.MeshStandardMaterial({color:def.shade,emissive:def.shade,emissiveIntensity:.7,roughness:.5,side:THREE.DoubleSide})),cx+1.5,1.38,cz+1.2,root);
      const pick=featured(key,list);
      if(pick){const lx=cx-4,lz=cz+d/2-2.6;box(.5,1.05,.4,MAT.darkWood,lx,.52,lz);const top=box(.8,.05,.6,MAT.darkWood,lx,1.1,lz);top.rotation.x=.3;block(lx,lz,.8,.7);
        const card=own(plaque(def.lectern,'',420,70,'#1d2a3d',def.font));const label=add(own(new THREE.PlaneGeometry(.8,.14)),own(new THREE.MeshStandardMaterial({map:card,roughness:.8,emissive:0xffffff,emissiveMap:card,emissiveIntensity:.3})),lx,1.34,lz-.2,root);label.rotation.x=-.2;
        const mesh=placeBook(pick,{x:lx,y:1.42,z:lz-.02,yaw:0});mesh.rotation.x=-1.05;mesh.userData.home.quaternion.copy(mesh.quaternion);mesh.userData.featured=true}
      // The way out: to the Grand Hall from the Spanish room, back to the Spanish room from the others (the Italian, back
      // to whichever room the reader came in from: see italianExit).
      const exit=key==='spanish'?{type:'intl-exit',title:'Back to the Grand Hall',author:'The visitors’ book is just outside.',action:'RETURN'}
        :key==='italian'?italianExit({type:'intl-go',action:'RETURN'})
        :{type:'intl-go',room:'spanish',back:key,title:'Sala de lectura en español',author:({chinese:'回到西班牙文閱覽室。',french:'Retour à la salle espagnole. ',latin:'Redi. ',ukrainian:'Назад до іспанської читальні. '}[key]||'')+'Back to the Spanish Reading Room.',action:'RETURN'};
      if(!hangWing(root,key,{data:exit,mark,x:cx,z:cz+d/2-.2,yaw:Math.PI,label:EXIT_LABELS[key],own}))plainDoor(cx,cz+d/2-.2,0,DOOR_LOOKS[key].color,exit);
      room.exit=exit;scene.add(root);
    }
    // The Italian room's way out goes back through the door the reader came in by: to the Latin room, or the Spanish.
    function italianExit(exit){
      const door=via.italian==='italian-latin'?'italian-latin':'italian';
      return Object.assign(exit,{room:outOf(door),back:door},door==='italian-latin'
        ?{title:'Conclave Latinum',author:'Torna alla sala latina. Back to the Latin Reading Room.'}
        :{title:'Sala de lectura en español',author:'Torna alla sala spagnola. Back to the Spanish Reading Room.'})}

    // The wing's two lamps, moved to the room the reader is in: one overhead, one on the reading table.
    function placeLamps(key){
      if(!lamps){lamps=[new THREE.PointLight(0xffe2b0,7,16,2),new THREE.PointLight(0xfff0d0,2.4,5,2)];for(const l of lamps)scene.add(l)}
      const {cx,cz,h}=ROOMS[key];lamps[0].position.set(cx,h-.4,cz-1);lamps[1].position.set(cx+1.5,1.5,cz+1.2);
    }

    // ---------- walking ----------
    const inRoom=(def,x,z)=>x>def.cx-def.w/2&&x<def.cx+def.w/2&&z>def.cz-def.d/2&&z<def.cz+def.d/2;
    const roomAt=(x,z)=>Object.keys(ROOMS).find(key=>inRoom(ROOMS[key],x,z))||null;
    function contains(x,z){return !!roomAt(x,z)}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      const key=roomAt(x,z);if(!key)return false;const def=ROOMS[key],r=player.radius||.42;
      if(x-r<def.cx-def.w/2+.45||x+r>def.cx+def.w/2-.45||z-r<def.cz-def.d/2+.45||z+r>def.cz+def.d/2-.45)return false;
      return !(built[key]?.blockers||[]).some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ);
    }

    // ---------- doing things ----------
    function enter(key='spanish',door=key){
      const def=ROOMS[key]||ROOMS.spanish;key=ROOMS[key]?key:'spanish';
      via[key]=ROOM_DOORS[door]&&opensOn(door)===key?door:key;if(key==='italian'&&built.italian)italianExit(built.italian.exit);
      activate(key);placeLamps(key);move(def.cx,def.cz+def.d/2-1.4,0);playSample?.('doorOpen',.8,.96);
      showNotice(def.welcome(featured(key)),9);
      analytics?.track('Room Explored',{room:key==='spanish'?'international-wing':`international-wing-${key}`});
    }
    // Leontovych's Shchedryk on the bandura: its four-note figure (B flat, A, B flat, G) in bars of three, eight times,
    // with the bass stepping down from G to D in the second four bars.
    function playShchedryk(){const beat=.34,Bb=466.16,A=440,G=392,bass=[0,0,0,0,196,174.61,155.56,146.83];let at=0;
      for(let bar=0;bar<8;bar++){for(const [freq,beats] of [[Bb,1],[A,.5],[Bb,.5],[G,1]]){tone(freq,at,beats*beat+.5,.06,'bandura');at+=beats*beat}
        if(bass[bar])tone(bass[bar],at-3*beat,3*beat+.4,.05,'bandura')}
      return at+1}
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('intl-'))return false;
      if(data.type==='intl-door'){through(data,()=>enter('spanish'));return true}
      if(data.type==='intl-go'){
        // Back from another room: out through its door, into the room it opens from (the Spanish room, or the Latin).
        through(data,()=>{if(data.back){const from=ROOM_DOORS[data.back]||ROOM_DOORS.portuguese,into=outOf(data.back);activate(into);placeLamps(into);move(from.x-Math.sin(-from.yaw)*1.8,from.z-Math.cos(from.yaw)*1.8,from.yaw);playSample?.('doorOpen',.8,1);showNotice(`${ROOMS[into].card[0]}.`,3)}
        else enter(data.room,data.door)});
        return true;
      }
      if(data.type==='intl-exit'){through(data,()=>{move(DOOR.x+Math.sin(DOOR.yaw)*1.9,DOOR.z+Math.cos(DOOR.yaw)*1.9,DOOR.yaw+Math.PI);playSample?.('doorOpen',.8,1);showNotice('The Grand Hall again, beside the visitors’ book.',3)});return true}
      if(data.type==='intl-card'){showNotice(`${data.title}: ${data.author}`,9);return true}
      if(data.type==='intl-boot'){const room=built.ukrainian;try{storage?.setItem(BOOT_KEY,'1')}catch(e){}
        if(room){const card=room.bootCard();for(const part of room.bootParts)part.userData=card;room.showBootBook()}
        showNotice('За халявою — маленька саморобна книжечка, списана дрібним почерком. На засланні Шевченкові заборонили писати й малювати, і він ховав вірші в чоботі. (Tucked in the boot: a tiny handmade notebook of poems, as Shevchenko hid his in exile. It lies on the trunk now.)',10);
        playSample?.('pageTurn',.7,.9);analytics?.track('Secret Found',{secret:'shevchenko-boot'});return true}
      if(data.type==='intl-gospel'){if(gospel)gospel.open();return true}
      if(data.type==='intl-bandura'){showNotice(`${data.title}: ${data.author}`,12);if(tone&&time>=shchedrykUntil)shchedrykUntil=time+playShchedryk();return true}
      return false;
    }

    // ---------- lifecycle ----------
    function activate(key){if(!built[key])buildRoom(key);lastNeeded[key]=time}
    function unload(key){
      const room=built[key];if(!room)return;room.root.removeFromParent();delete built[key];
      for(let i=interactables.length-1;i>=0;i--)if(room.ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of room.owned)thing.dispose?.();
      if(!Object.keys(built).length&&lamps){for(const l of lamps)l.removeFromParent();lamps=null}
    }
    function update(t){
      time=t;const {x,z}=player.pos,here=roomAt(x,z);
      if(here){activate(here);placeLamps(here);for(const tick of built[here].ticks)tick(t)}
      if(Math.hypot(x-DOOR.x,z-DOOR.z)<PRELOAD)activate('spanish');
      for(const [key,door] of Object.entries(ROOM_DOORS))if(here===outOf(key)&&Math.hypot(x-door.x,z-door.z)<PRELOAD)activate(opensOn(key));
      for(const key of Object.keys(built)){const room=built[key];
        if(key!==here&&t-lastNeeded[key]>KEEP&&!isHolding()&&!room.books.some(b=>b.parent!==room.root))unload(key)}
    }
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,unload:()=>{for(const key of Object.keys(built))unload(key)},featured,roomAt,door:DOOR,room:ROOM,rooms:ROOMS,
      get built(){return !!built.spanish},isBuilt:key=>!!built[key],get books(){return Object.values(built).flatMap(room=>room.books)},zoneAt:(x,z)=>contains(x,z)?'international-wing':null};
  };
})();
