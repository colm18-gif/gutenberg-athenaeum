// The International Wing: behind a door on the Grand Hall's south wall, beside the visitors' book. Its rooms hold
// classics in their own languages, face-out on racks above a dado of tiles, each book with a librarian's note in
// that language (data/new-books-wing.js, rooms 'spanish', 'portuguese', 'chinese', 'french', 'latin' and 'ukrainian'), and one on
// the lectern each night:
//   the Sala de lectura en español, entered from the Grand Hall;
//   the Sala de leitura em português, through the green door in the Spanish room's east wall;
//   the Salle de lecture en français, through the blue door between them;
//   the 中文閱覽室 (the Chinese Reading Room), through the red door;
//   the Latin Reading Room (Conclave Latinum), through the stone door in the Spanish room's south wall. Its notes
//   are in English: Latin's readers today read it from every other language;
//   the Українська читальня (the Ukrainian Reading Room), through the blue door beside it with an embroidered rushnyk
//   over the lintel. Its books come from Ukrainian Wikisource (scripts/wikisource.mjs), as Gutenberg has none.
//
// Like the other rooms behind doors, each room is built only when the reader walks up to it and freed a little
// while after they leave. The wing's two lamps are moved to whichever room the reader is in, so the number of
// lights in the scene (and with it every shader) stays the same.
(function(){
  'use strict';
  const CJK='"Noto Serif TC","Songti TC","PMingLiU","Noto Serif CJK TC",serif';

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
    ukrainian:{cx:-530,cz:100,w:24,d:15,h:6,language:'uk',sign:'УКРАЇНСЬКА ЧИТАЛЬНЯ',sub:'The Ukrainian Reading Room · Міжнародне крило',
      card:['Українська читальня','Класика українською мовою, від Котляревського й Шевченка до Лесі Українки, Франка й Коцюбинського, кожна книжка з приміткою бібліотекарки. Тексти з Вікіджерел, суспільне надбання. (The Ukrainian Reading Room.)'],
      lectern:'КНИЖКА ВЕЧОРА',shade:0x2b5aa8,tiles:'vyshyvanka',
      welcome:pick=>`Українська читальня. Ласкаво просимо: класика українською мовою, кожна книжка з приміткою бібліотекарки.${pick?` На пюпітрі сьогодні: ${pick.title}.`:''} (The International Wing: the Ukrainian Reading Room.)`,
      note:'Примітка бібліотекарки',seat:['Стілець біля столу','Сідайте й читайте книжку з цієї читальні. (Sit and read a book from this room.)']}
  };

  window.createInternationalWing=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals=()=>[],showNotice,playSample,move,analytics,isHolding=()=>false,today=()=>new Date(),
      wallMaterial=null,finishWalls=null,registerSeat=null,doorKit=null}=options;   // the library's own stone walls and contact shadows (wall-finish.js), when game.js offers them
    const DOOR={x:8.6,z:30.45,yaw:Math.PI};
    // The doors in the Spanish room's east wall, to the other rooms.
    // yaw: which way the reader faces when they come back out through it.
    const ROOM=ROOMS.spanish,EAST=ROOM.cx+ROOM.w/2-.2,SOUTH=ROOM.cz+ROOM.d/2-.2,ROOM_DOORS={portuguese:{x:EAST,z:ROOM.cz-4.7,yaw:-Math.PI/2},french:{x:EAST,z:ROOM.cz,yaw:-Math.PI/2},
      chinese:{x:EAST,z:ROOM.cz+4.7,yaw:-Math.PI/2},latin:{x:ROOM.cx+7,z:SOUTH,yaw:0},ukrainian:{x:ROOM.cx-7,z:SOUTH,yaw:0}};
    const PRELOAD=7,KEEP=25;
    let time=0,lamps=null;
    const built={},lastNeeded=Object.fromEntries(Object.keys(ROOMS).map(key=>[key,-1e9]));
    const doorData={type:'intl-door',title:'The International Wing',author:'Clásicos en español · Clássicos em português · Classiques en français · 中文經典 · Libri Latini · Українська класика. Each book with a note from the librarian in its own language.',action:'ENTER'};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    // ---------- the doors ----------
    // Every door in the wing is hung in the library's own kit (library-doors.js), and looks the same from both sides:
    // navy to the Spanish room, green with Lisbon tiles to the Portuguese, blue with an iron grille to the French,
    // red lacquer with brass studs under a tiled eave to the Chinese, and stone under a Roman arch to the Latin.
    const DOOR_LOOKS={spanish:{color:0x1f3350,glazed:true,fanColor:0xd9923a},portuguese:{color:0x1f4a33,glazed:true,fanColor:0xffc978},
      french:{color:0x1f3160,glazed:true,fanColor:0xffd48a},chinese:{color:0x5a1c1a,plain:true,fanlight:false,cornice:false},latin:{color:()=>stone('leaf',0x8c8272),fanlight:false,cornice:false},
      ukrainian:{color:0x1f4f9a,glazed:true,fanColor:0xffc93a}};
    const EXIT_LABELS={spanish:'THE GRAND HALL',portuguese:'SALA ESPANHOLA',french:'SALLE ESPAGNOLE',chinese:'西班牙文閱覽室',latin:'EXITVS',ukrainian:'ІСПАНСЬКА ЧИТАЛЬНЯ'};
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
      if(key!=='spanish'&&key!=='portuguese'&&key!=='ukrainian')doorKit.drawAfterPortal(leaf)}
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

    // ---------- the books ----------
    function shelf(key){return [...new Set(arrivals(key))].map(id=>findBook(id)).filter(Boolean)}
    // One book is out on each lectern each night, a different one tomorrow.
    function featured(key='spanish',list=shelf(key)){return list.length?list[((dayNumber()%list.length)+list.length)%list.length]:null}

    // ---------- the door, beside the visitors' book ----------
    function buildDoor(){
      const g=new THREE.Group();g.name='international-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const mark=(object,data)=>{object.userData=data;interactables.push(object);return object};
      // A stone doorcase round the navy door, its lintel cut with the word for books in each of the wing's languages.
      if(hangWing(g,'spanish',{data:doorData,mark,pediment:false})){
        for(const side of [-1,1]){add(new THREE.BoxGeometry(.36,4.1,.3),MAT.stone,side*1.52,2.05,.1,g);add(new THREE.BoxGeometry(.5,.18,.38),MAT.stone,side*1.52,4.18,.12,g);add(new THREE.BoxGeometry(.5,.32,.38),MAT.stone,side*1.52,.16,.12,g)}
        add(new THREE.BoxGeometry(3.5,.66,.34),MAT.stone,0,4.6,.12,g);add(new THREE.BoxGeometry(3.8,.12,.44),MAT.stone,0,4.99,.14,g);
        mark(add(new THREE.PlaneGeometry(3.3,.46),new THREE.MeshStandardMaterial({map:carved('LIBROS · LIVROS · LIVRES · 書 · LIBRI · КНИЖКИ',1024,144,`Georgia,${CJK}`),roughness:.9}),0,4.6,.295,g),doorData)}
      else mark(add(new THREE.BoxGeometry(1.9,3.1,.14),new THREE.MeshStandardMaterial({color:DOOR_LOOKS.spanish.color,roughness:.75}),0,1.55,.08,g),doorData);
      const plate=plaque('THE INTERNATIONAL WING','Español · Português · Français · 中文 · Latina · Українська',640,100);// the door's plaque stays for good
      mark(add(new THREE.PlaneGeometry(2.3,.36),new THREE.MeshStandardMaterial({map:plate,emissive:0xffffff,emissiveMap:plate,emissiveIntensity:.35}),0,5.42,.12,g),doorData);
      const l=new THREE.PointLight(0xffc27a,1.1,5,2);l.position.set(0,3.9,1.1);g.add(l);
    }

    // ---------- a room ----------
    function buildRoom(key){
      const def=ROOMS[key],{cx,cz,w,d,h}=def,root=new THREE.Group();root.name=`international-${key}`;
      const room=built[key]={root,owned:[],ours:[],books:[],blockers:[]};
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
      list.filter(book=>!inCorner(book)).slice(0,spots.length).forEach((book,i)=>placeBook(book,spots[i]));
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
        eastDoor(ROOM_DOORS.chinese.z,'chinese',{type:'intl-go',room:'chinese',title:'中文閱覽室',author:'中文經典，每一本都附有館員的短評。(The Chinese Reading Room.)',action:'ENTER'},'中文閱覽室','請進 · The Chinese Reading Room',CJK);
      }
      // The reading table, with a lamp, and the lectern by the door with tonight's book.
      box(4.2,.08,1.6,MAT.darkWood,cx+1.5,.78,cz+1.2);for(const [dx,dz] of [[-1.9,-.6],[1.9,-.6],[-1.9,.6],[1.9,.6]])box(.1,.74,.1,MAT.darkWood,cx+1.5+dx,.39,cz+1.2+dz);block(cx+1.5,cz+1.2,4.4,1.8);
      const leather=own(new THREE.MeshStandardMaterial({color:0x5b2418,roughness:.75}));
      // The four chairs can be sat in: the library's own seats (game.js), which open one of this room's books.
      const bookIds=list.map(book=>book.id);
      for(const [dx,dz,yaw] of [[-1,-1.35,0],[1,-1.35,0],[-1,1.35,Math.PI],[1,1.35,Math.PI]]){const chair=new THREE.Group();chair.position.set(cx+1.5+dx,0,cz+1.2+dz);chair.rotation.y=yaw;root.add(chair);const seat=box(.5,.08,.5,leather,0,.46,0,chair),back=box(.5,.6,.08,leather,0,.78,-.24,chair);for(const [lx,lz] of [[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]])box(.05,.44,.05,MAT.darkWood,lx,.22,lz,chair);
        if(registerSeat&&bookIds.length){registerSeat([seat,back],chair,new THREE.Vector3(0,1.28,.08),yaw+Math.PI,{title:def.seat[0],author:def.seat[1],bookIds,wingRoom:key});room.ours.push(seat,back)}}
      box(.1,.5,.1,MAT.brass,cx+1.5,1.07,cz+1.2);add(own(new THREE.CylinderGeometry(.16,.3,.24,14,1,true)),own(new THREE.MeshStandardMaterial({color:def.shade,emissive:def.shade,emissiveIntensity:.7,roughness:.5,side:THREE.DoubleSide})),cx+1.5,1.38,cz+1.2,root);
      const pick=featured(key,list);
      if(pick){const lx=cx-4,lz=cz+d/2-2.6;box(.5,1.05,.4,MAT.darkWood,lx,.52,lz);const top=box(.8,.05,.6,MAT.darkWood,lx,1.1,lz);top.rotation.x=.3;block(lx,lz,.8,.7);
        const card=own(plaque(def.lectern,'',420,70,'#1d2a3d',def.font));const label=add(own(new THREE.PlaneGeometry(.8,.14)),own(new THREE.MeshStandardMaterial({map:card,roughness:.8,emissive:0xffffff,emissiveMap:card,emissiveIntensity:.3})),lx,1.34,lz-.2,root);label.rotation.x=-.2;
        const mesh=placeBook(pick,{x:lx,y:1.42,z:lz-.02,yaw:0});mesh.rotation.x=-1.05;mesh.userData.home.quaternion.copy(mesh.quaternion);mesh.userData.featured=true}
      // The way out: to the Grand Hall from the Spanish room, back to the Spanish room from the others.
      const exit=key==='spanish'?{type:'intl-exit',title:'Back to the Grand Hall',author:'The visitors’ book is just outside.',action:'RETURN'}
        :{type:'intl-go',room:'spanish',back:key,title:'Sala de lectura en español',author:({chinese:'回到西班牙文閱覽室。',french:'Retour à la salle espagnole. ',latin:'Redi. ',ukrainian:'Назад до іспанської читальні. '}[key]||'')+'Back to the Spanish Reading Room.',action:'RETURN'};
      if(!hangWing(root,key,{data:exit,mark,x:cx,z:cz+d/2-.2,yaw:Math.PI,label:EXIT_LABELS[key],own}))plainDoor(cx,cz+d/2-.2,0,DOOR_LOOKS[key].color,exit);
      scene.add(root);
    }

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
    function enter(key='spanish'){
      const def=ROOMS[key]||ROOMS.spanish;key=ROOMS[key]?key:'spanish';
      activate(key);placeLamps(key);move(def.cx,def.cz+def.d/2-1.4,0);playSample?.('doorOpen',.8,.96);
      showNotice(def.welcome(featured(key)),9);
      analytics?.track('Room Explored',{room:key==='spanish'?'international-wing':`international-wing-${key}`});
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('intl-'))return false;
      if(data.type==='intl-door'){through(data,()=>enter('spanish'));return true}
      if(data.type==='intl-go'){
        // Back from the Portuguese or Chinese room: out through its door, into the Spanish room.
        through(data,()=>{if(data.back){const from=ROOM_DOORS[data.back]||ROOM_DOORS.portuguese;activate('spanish');placeLamps('spanish');move(from.x-Math.sin(-from.yaw)*1.8,from.z-Math.cos(from.yaw)*1.8,from.yaw);playSample?.('doorOpen',.8,1);showNotice('Sala de lectura en español.',3)}
        else enter(data.room)});
        return true;
      }
      if(data.type==='intl-exit'){through(data,()=>{move(DOOR.x+Math.sin(DOOR.yaw)*1.9,DOOR.z+Math.cos(DOOR.yaw)*1.9,DOOR.yaw+Math.PI);playSample?.('doorOpen',.8,1);showNotice('The Grand Hall again, beside the visitors’ book.',3)});return true}
      if(data.type==='intl-card'){showNotice(`${data.title}: ${data.author}`,9);return true}
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
      if(here){activate(here);placeLamps(here)}
      if(Math.hypot(x-DOOR.x,z-DOOR.z)<PRELOAD)activate('spanish');
      if(here==='spanish')for(const [key,door] of Object.entries(ROOM_DOORS))if(Math.hypot(x-door.x,z-door.z)<PRELOAD)activate(key);
      for(const key of Object.keys(built)){const room=built[key];
        if(key!==here&&t-lastNeeded[key]>KEEP&&!isHolding()&&!room.books.some(b=>b.parent!==room.root))unload(key)}
    }
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,unload:()=>{for(const key of Object.keys(built))unload(key)},featured,roomAt,door:DOOR,room:ROOM,rooms:ROOMS,
      get built(){return !!built.spanish},isBuilt:key=>!!built[key],get books(){return Object.values(built).flatMap(room=>room.books)},zoneAt:(x,z)=>contains(x,z)?'international-wing':null};
  };
})();
