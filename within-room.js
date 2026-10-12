// The Room of Books Within Books: the books that exist only inside other books, and the real books that characters in
// other books sat down and read. It is reached through the card catalogue against the Grand Hall's west wall, between the
// wing door and the gramophone. Pull a drawer and it holds a card for a book that was never written; pull again and the
// drawer keeps coming, further than the cabinet is deep, and at the back of it there is a room.
//
// On the west wall, the books that never were: Sherlock Holmes's monographs (with his enemy's mathematics and Dr
// Mortimer's papers), and the others: Mr Casaubon's Key to all Mythologies, the Reverend Jabez Branderham's sermon, Mr
// Dick's Memorial, the Necronomicon, Teufelsdröckh's treatise on clothes, the play called The King in Yellow, and the rest, each bound by the library and each with a card.
// Reading the card offers the real book, opened at the page where the imaginary one appears. On the east wall, the real
// books read in other books: David Copperfield's father's books in the little room upstairs, and the books of Frankenstein's
// creature, Jane Eyre, the March girls and Maggie Tulliver. In the middle, on a lectern, Professor Lidenbrock's
// Heimskringla, with Arne Saknussemm's parchment falling out of it.
//
// Every quotation here was checked against the text of the book it comes from. Like the other rooms behind doors, nothing
// but the cabinet is built until the reader comes near, and the room is freed a little while after they leave.
(function(){
  'use strict';

  // The books that never were. `host` is the real book (Project Gutenberg number) and `passage` a few of its words where the
  // imaginary one appears, to open it there. `hidden` hosts are the library's secret editions: they are not opened from here.
  const NEVER=[
    {key:'tobacco',group:'holmes',title:'Upon the Distinction between the Ashes of the Various Tobaccoes',by:'Sherlock Holmes',host:2097,hostTitle:'The Sign of the Four',passage:'distinction between the ashes',colour:'#3b4a3a',
      card:'Holmes shows it to Watson in the first chapter of The Sign of the Four: “In it I enumerate a hundred and forty forms of cigar-, cigarette-, and pipe-tobacco, with colored plates illustrating the difference in the ash.”'},
    {key:'footsteps',group:'holmes',title:'Upon the Tracing of Footsteps',by:'Sherlock Holmes',host:2097,hostTitle:'The Sign of the Four',passage:'plaster of paris as a preserver',colour:'#4a3b2a',
      card:'Shown to Watson on the same afternoon as the tobacco ashes: “Here is my monograph upon the tracing of footsteps, with some remarks upon the uses of plaster of Paris as a preserver of impresses.”'},
    {key:'hands',group:'holmes',title:'Upon the Influence of a Trade upon the Form of the Hand',by:'Sherlock Holmes',host:2097,hostTitle:'The Sign of the Four',passage:'influence of a trade upon the form',colour:'#2e3a4a',
      card:'“A curious little work,” Holmes calls it in The Sign of the Four, “with lithotypes of the hands of slaters, sailors, corkcutters, compositors, weavers, and diamond-polishers.” Then: “But I weary you with my hobby.”'},
    {key:'life',group:'holmes',title:'The Book of Life',by:'Anonymous (a magazine article)',host:244,hostTitle:'A Study in Scarlet',passage:'somewhat ambitious title was',colour:'#5a4a2a',
      card:'In A Study in Scarlet Watson picks up a magazine at breakfast and reads an article with a pencil mark at its heading, which he thinks “a remarkable mixture of shrewdness and of absurdity.” Its writer is sitting across the table: “the article I wrote it myself.”'},
    {key:'ciphers',group:'holmes',title:'A Trifling Monograph upon Secret Writings',by:'Sherlock Holmes',host:108,hostTitle:'The Return of Sherlock Holmes',passage:'hundred and sixty separate ciphers',colour:'#3a2a3a',
      card:'Holmes never gives its title. In “The Adventure of the Dancing Men” he says: “I am fairly familiar with all forms of secret writings, and am myself the author of a trifling monograph upon the subject, in which I analyze one hundred and sixty separate ciphers.”'},
    {key:'tattoo',group:'holmes',title:'On Tattoo Marks',by:'Sherlock Holmes',host:1661,hostTitle:'The Adventures of Sherlock Holmes',passage:'study of tattoo marks',colour:'#4a2a2a',
      card:'In “The Red-Headed League” Holmes reads a fish tattooed above Jabez Wilson’s wrist: “I have made a small study of tattoo marks and have even contributed to the literature of the subject.”.'},
    {key:'ears',group:'holmes',title:'Two Short Monographs upon the Ear',by:'Sherlock Holmes',host:834,hostTitle:'The Memoirs of Sherlock Holmes',passage:'anthropological journal',colour:'#2a3a3a',
      card:'From “The Adventure of the Cardboard Box”: “Each ear is as a rule quite distinctive and differs from all other ones. In last year’s Anthropological Journal you will find two short monographs from my pen upon the subject.”'},
    {key:'binomial',group:'holmes',title:'A Treatise upon the Binomial Theorem',by:'Professor Moriarty',host:834,hostTitle:'The Memoirs of Sherlock Holmes',passage:'treatise upon the binomial theorem',colour:'#1e1e24',
      card:'Holmes on his enemy, in “The Final Problem”: “At the age of twenty-one he wrote a treatise upon the Binomial Theorem, which has had a European vogue. On the strength of it he won the Mathematical Chair at one of our smaller universities.”'},
    {key:'asteroid',group:'holmes',title:'The Dynamics of an Asteroid',by:'Professor Moriarty',host:3289,hostTitle:'The Valley of Fear',passage:'dynamics of an asteroid',colour:'#24242e',
      card:'Holmes, with heavy irony, in the first chapter of The Valley of Fear: “Is he not the celebrated author of The Dynamics of an Asteroid, a book which ascends to such rarefied heights of pure mathematics that it is said that there was no man in the scientific press capable of criticizing it?”'},
    {key:'atavism',group:'holmes',title:'Some Freaks of Atavism',by:'James Mortimer, M.R.C.S.',host:2852,hostTitle:'The Hound of the Baskervilles',passage:'freaks of atavism',colour:'#4a4030',
      card:'Dr Mortimer’s entry in the Medical Directory, read out by Watson in The Hound of the Baskervilles: “Author of ‘Some Freaks of Atavism’ (Lancet 1882). ‘Do We Progress?’ (Journal of Psychology, March, 1883).” His prize essay was “Is Disease a Reversion?”'},
    {key:'mythologies',group:'never',title:'The Key to all Mythologies',by:'Edward Casaubon',host:145,hostTitle:'Middlemarch',passage:'still unwritten key to all mythologies',colour:'#3a3026',
      card:'The great work Mr Casaubon gives his life to and never writes. In chapter 29 of Middlemarch, “the consolations of the Christian hope in immortality seemed to lean on the immortality of the still unwritten Key to all Mythologies. For my part I am very sorry for him.”'},
    {key:'seventy',group:'never',title:'Seventy Times Seven, and the First of the Seventy-First',by:'The Rev. Jabez Branderham',host:768,hostTitle:'Wuthering Heights',passage:'jabez branderham',colour:'#5a1e1a',
      card:'Lockwood finds it among Catherine’s old books in the panelled bed at Wuthering Heights: “A Pious Discourse delivered by the Reverend Jabez Branderham, in the Chapel of Gimmerden Sough.” He falls asleep wondering what Branderham would make of his subject, and has a terrible night.'},
    {key:'memorial',group:'never',title:'The Memorial',by:'Mr Dick',host:766,hostTitle:'David Copperfield',passage:'gets on with his memorial',colour:'#3a4a5a',
      card:'Mr Dick works at it upstairs at Betsey Trotwood’s, and “the harder he worked at it, the oftener that unlucky head of King Charles the First got into it.” His seven-foot kite is covered with manuscript, and King Charles’s head is on that too.'},
    {key:'yellow',group:'never',title:'The Yellow Book',by:'Lord Henry’s gift',host:174,hostTitle:'The Picture of Dorian Gray',hidden:true,colour:'#c9a227',
      card:'Wilde never names the book Lord Henry sends Dorian Gray. “It was a novel without a plot and with only one character, being, indeed, simply a psychological study of a certain young Parisian.” The library has The Picture of Dorian Gray, but keeps it where it has to be found.'},
    {key:'painters',group:'never',title:'The Rival Painters',by:'Jo March',host:514,hostTitle:'Little Women',passage:'rival painters',colour:'#6a3a3a',
      card:'Jo’s first story to be printed in a newspaper. She reads it aloud to her sisters with her face behind the sheet, and when Beth asks who wrote it: “Your sister.”'},
    {key:'bots',group:'never',title:'Ode to Stephen Dowling Bots, Dec’d',by:'Emmeline Grangerford',host:76,hostTitle:'Adventures of Huckleberry Finn',passage:'stephen dowling bots',colour:'#2a2a2a',
      card:'From Emmeline Grangerford’s scrap-book, which Huck finds in the parlour after she has died: she “used to paste obituaries and accidents and cases of patient suffering in it out of the Presbyterian Observer, and write poetry after them out of her own head. It was very good poetry.”'},
    {key:'tittlebats',group:'never',title:'Speculations on the Source of the Hampstead Ponds, with some Observations on the Theory of Tittlebats',by:'Samuel Pickwick, G.C.M.P.C.',host:580,hostTitle:'The Pickwick Papers',passage:'theory of tittlebats',colour:'#2a4a3a',
      card:'The paper with which The Pickwick Papers begins. In its first chapter the Club “has heard read, with feelings of unmingled satisfaction, and unqualified approval,” Mr Pickwick’s speculations, and returns him its warmest thanks.'},
    {key:'bones',group:'never',title:'Billy Bones his Fancy',by:'Captain Billy Bones',host:120,hostTitle:'Treasure Island',passage:'billy bones his fancy',colour:'#4a3a24',
      card:'The book in the oilcloth bundle at the bottom of the captain’s sea chest, in Treasure Island. “On the first page there were only some scraps of writing”: “Billy Bones his fancy,” “Mr. W. Bones, mate,” “No more rum,” “Off Palm Key he got itt.” The next pages are accounts, kept in crosses.'},
    {key:'benengeli',group:'never',title:'History of Don Quixote of La Mancha',by:'Cide Hamete Benengeli, an Arab historian',host:996,hostTitle:'Don Quixote',passage:'alcana of toledo',colour:'#5a4020',
      card:'In chapter IX of Don Quixote, Cervantes says he found the rest of the story “in the Alcana of Toledo,” in Arabic pamphlets a boy was selling to a silk mercer: “History of Don Quixote of La Mancha, written by Cide Hamete Benengeli, an Arab historian.”'},
    {key:'looking-glass',group:'never',title:'JABBERWOCKY',by:'A Looking-glass book',mirror:true,host:12,hostTitle:'Through the Looking-Glass',passage:'looking glass book',colour:'#2e3a5a',
      card:'The book lying near Alice on the table in the Looking-glass room, which she cannot read until a bright thought strikes her: “Why, it’s a Looking-glass book, of course! And if I hold it up to a glass, the words will all go the right way again.”'},
    {key:'necronomicon',group:'never',title:'Necronomicon',by:'The mad Arab Alhazred',host:50133,hostTitle:'The Dunwich Horror',passage:'necronomicon of the mad arab',colour:'#2a1e18',
      card:'Wilbur Whateley, almost eight feet tall, goes to Arkham for it in The Dunwich Horror: “the dreaded volume kept under lock and key at the college library—the hideous Necronomicon of the mad Arab Alhazred in Olaus Wormius’ Latin version, as printed in Spain in the Seventeenth Century.” Lovecraft invented it.'},
    {key:'kleider',group:'never',title:'Die Kleider, ihr Werden und Wirken',by:'Diogenes Teufelsdröckh',host:1051,hostTitle:'Sartor Resartus',passage:'ihr werden und wirken',colour:'#3a3a30',
      card:'The German treatise on clothes that Carlyle’s Sartor Resartus pretends to review: “Die Kleider, ihr Werden und Wirken (Clothes, their Origin and Influence): von Diog. Teufelsdrockh, J. U. D. etc. Stillschweigen und Cognie. Weissnichtwo, 1831.” Weissnichtwo means Know-not-where.'},
    {key:'king-in-yellow',group:'never',title:'The King in Yellow',by:'A play in two acts',host:8492,hostTitle:'The King in Yellow',hidden:true,colour:'#b8921e',
      card:'The play that drives its readers mad, in Robert W. Chambers’s stories. “I remember after finishing the first act that it occurred to me that I had better stop.” The library has Chambers’s book, but keeps it where it has to be found.'}
  ];
  // The real books read in other books, by Project Gutenberg number: who read them, and where.
  const READS={
    4085:'David Copperfield’s father’s books',4084:'David Copperfield’s father’s books',2160:'David Copperfield’s father’s books',6593:'David Copperfield’s father’s books',
    2667:'David Copperfield’s father’s books',996:'David Copperfield’s father’s books',66677:'David Copperfield’s father’s books',
    521:'David Copperfield’s father’s books, and Gabriel Betteredge’s. In The Moonstone he opens it for advice: “In the first part of Robinson Crusoe, at page one hundred and twenty-nine, you will find it thus written.”',
    128:'David Copperfield read “the Arabian Nights, and the Tales of the Genii” with his father’s books (chapter 4). The Tales of the Genii is not on Project Gutenberg.',
    674:'Frankenstein’s creature finds it in a leathern portmanteau in the woods, with Paradise Lost and the Sorrows of Werter: “Plutarch taught me high thoughts; he elevated me above the wretched sphere of my own reflections, to admire and love the heroes of past ages.”',
    26:'One of the three books Frankenstein’s creature finds in a leathern portmanteau in the woods (chapter 15), with “a volume of Plutarch’s Lives, and the Sorrows of Werter.”',
    2527:'One of the creature’s three books, in Frankenstein: “I learned from Werter’s imaginations despondency and gloom, but Plutarch taught me high thoughts.”',
    652:'Helen Burns is reading it on a stone bench at Lowood when Jane Eyre first speaks to her: “from where I stood I could see the title—it was ‘Rasselas;’ a name that struck me as strange, and consequently attractive.” Maggie Tulliver finds it on her window-shelf too.',
    829:'Jane Eyre asks for it after the red-room: “This book I had again and again perused with delight. I considered it a narrative of facts, and discovered in it a vein of interest deeper than what I found in fairy tales.”',
    131:'The March girls play at being its pilgrims in Little Women; Huck Finn finds it on a table at the Grangerfords’: “One was Pilgrim’s Progress, about a man that left his family, it didn’t say why. I read considerable in it now and then.”',
    2825:'In the first chapter of Little Women Jo means to spend her Christmas dollar on Undine and Sintram: “I’ve wanted it so long,” said Jo, who was a bookworm.',
    2824:'The other half of the Undine and Sintram Jo March longs for in Little Women, and at last slaps in her pocket: “the long-desired Undine and Sintram.”',
    31053:'Maggie Tulliver, aged nine, shows Mr Riley its pictures in The Mill on the Floss: “‘The History of the Devil,’ by Daniel Defoe,—not quite the right book for a little girl,” said Mr Riley.',
    1653:'Maggie Tulliver finds it among the books on her window-shelf in The Mill on the Floss: “Thomas à Kempis?—the name had come across her in her reading.”'
  };
  // Who read the lectern's book, and the parchment that fell out of it.
  const LECTERN={
    book:'Professor Lidenbrock shows it to his nephew in the first chapter of Journey to the Centre of the Earth: “It is the Heims-Kringla of Snorre Tarleson,” he said, “the celebrated Icelandic author of the twelfth century.” His copy was in Icelandic; this one is in English.',
    parchment:['A scrap of parchment','“A small scrap of parchment fell out of the leaves.” Read backwards, in Latin: “Descend into the crater of Yocul of Sneffels, which the shade of Scartaris caresses, before the kalends of July, audacious traveler, and you will reach the centre of the earth. I did it. Arne Saknussemm.”']
  };
  const GROUPS=[
    {key:'holmes',wall:'west',name:'BY SHERLOCK HOLMES',sub:'And by his enemy, and his client',along:-3.3},
    {key:'never',wall:'west',name:'BOOKS THAT NEVER WERE',sub:'Written, read and lost inside other books',along:3.3},
    {key:'copperfield',wall:'east',name:'THE LITTLE ROOM UPSTAIRS',sub:'David Copperfield’s father’s books',along:-3.3,ids:[4085,4084,2160,6593,2667,996,66677,521]},
    {key:'read',wall:'east',name:'READ IN OTHER BOOKS',sub:'By a monster, a governess, four sisters and a miller’s daughter',along:3.3,ids:[674,26,2527,652,829,131,2825,2824]}
  ];
  const CARDS={
    sign:['Books Within Books','The books that live only inside other books, and the real books that people in other books sat down and read. Every card in this room quotes the book it comes from.'],
    holmes:['By Sherlock Holmes','Holmes mentions his monographs as other men mention the weather. No copy has ever been found outside the stories, so the bindings here are the library’s own.'],
    never:['Books that never were','Each is bound by the library and stands for the book that holds it. Read its card, then read it again, and the real book opens at the page.'],
    copperfield:['The little room upstairs','“From that blessed little room, Roderick Random, Peregrine Pickle, Humphrey Clinker, Tom Jones, the Vicar of Wakefield, Don Quixote, Gil Blas, and Robinson Crusoe, came out, a glorious host, to keep me company.” David Copperfield, chapter 4.'],
    read:['Read in other books','The books that Frankenstein’s creature, Jane Eyre, Helen Burns, the March girls, Huck Finn and Maggie Tulliver read. Take one down and the library says who read it.'],
    exit:['The card catalogue, from behind','The drawer you came in by is still open. Back to the Grand Hall.']
  };
  // The drawer cards, filed as if the books were on the shelves.
  const DRAWER_CARDS=NEVER.map(b=>`${b.by.toUpperCase()}. ${b.title}. Shelf mark: none. See: ${b.hostTitle}.`);

  window.createWithinRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,move,analytics,isHolding=()=>false,registerSeat=null,collider=null,
      openBook=null,storage=window.localStorage}=options;
    // The cabinet stands against the Grand Hall's west wall (face at x -18.75), between the open wing door (to z 6.02) and
    // the gramophone (from z 9.3), facing into the hall.
    const CABINET={x:-18.45,z:7.3,w:1.6,h:1.5,d:.56,yaw:Math.PI/2};
    const ROOM={cx:500,cz:-440,w:16,d:14,h:5};
    const KEEP=25,FOUND_KEY='athenaeum-within-found';
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||/[?&]within\b/.test(location.search)}catch(e){return false}};
    let root=null,time=0,lastNeeded=-1e9,cabinet=null,pulls=0,armed=null,armedAt=0,atlas=null;
    const owned=[],ours=[],books=[],props=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'within-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function wrap(c,text,x,y,width,step){let line='';for(const word of text.split(' ')){if(line&&c.measureText(line+word).width>width){c.fillText(line.trim(),x,y);line='';y+=step}line+=word+' '}c.fillText(line.trim(),x,y);return y}
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#1d1712';c.fillRect(0,0,W,H);c.strokeStyle='#b8924a';c.lineWidth=3;c.strokeRect(6,6,W-12,H-12);c.strokeRect(12,12,W-24,H-24);
        c.fillStyle='#e2c98e';c.textAlign='center';c.font='bold 30px Georgia';c.fillText(text,W/2,sub?54:H/2+11);if(sub){c.font='italic 20px Georgia';c.fillStyle='#c9b48a';c.fillText(sub,W/2,86)}},680,sub?106:70));
      return add(own(new THREE.PlaneGeometry(w,h)),own(new THREE.MeshStandardMaterial({map,emissive:0x2a2014,emissiveIntensity:.3,roughness:.8})),x,y,z,parent);
    }

    // ---------- the card catalogue, in the Grand Hall ----------
    // Oak, six drawers across and seven down, each with a brass label holder, all drawn on one texture; one real drawer
    // (the one that slides) sits in front of its painted place.
    function drawFront(c,W,H){
      c.fillStyle='#5a3c22';c.fillRect(0,0,W,H);const cols=6,rows=7,cw=W/cols,rh=H/rows;
      const labels=['A–Al','Am–Az','Ba–Be','Bi–Bo','Br–By','Ca–Ch','Ci–Cz','Da–De','Di–Dy','E','F–Fl','Fo–Fy','Ga–Gi','Gl–Gy','Ha–He','Hi–Hy','I','J','K','La–Le','Li–Ly','—','Ma–Me','Mi–My','N','O','Pa–Pe','Pi–Py','Q','Ra–Re','Ri–Ry','Sa–Sh','Si–Sp','St–Sy','Ta–Th','Ti–Ty','U–V','Wa–We','Wh–Wi','Wo–Wy','X','Y–Z'];
      for(let r=0;r<rows;r++)for(let k=0;k<cols;k++){const x=k*cw,y=r*rh;
        c.fillStyle=(r+k)%2?'#6a4a2c':'#654628';c.fillRect(x+4,y+4,cw-8,rh-8);c.strokeStyle='#2e1e10';c.lineWidth=3;c.strokeRect(x+4,y+4,cw-8,rh-8);
        c.fillStyle='#b8924a';c.fillRect(x+cw/2-26,y+rh*.22,52,22);c.fillStyle='#efe6cc';c.fillRect(x+cw/2-22,y+rh*.22+3,44,16);
        c.fillStyle='#2a2016';c.font='bold 12px Georgia';c.textAlign='center';c.fillText(labels[r*cols+k],x+cw/2,y+rh*.22+15);
        c.fillStyle='#c9a45a';c.beginPath();c.arc(x+cw/2,y+rh*.68,6,0,7);c.fill();c.strokeStyle='#7a5a2a';c.lineWidth=2;c.stroke()}
    }
    function buildCabinet(){
      const g=new THREE.Group();g.name='within-catalogue';g.position.set(CABINET.x,0,CABINET.z);g.rotation.y=CABINET.yaw;scene.add(g);
      const {w,h,d}=CABINET,oak=MAT.darkWood,legs=.36,front=canvasTexture(drawFront,612,560);
      const body=add(new THREE.BoxGeometry(w,h,d),oak,0,legs+h/2,0,g);
      const face=add(new THREE.PlaneGeometry(w-.06,h-.06),new THREE.MeshStandardMaterial({map:front,roughness:.7}),0,legs+h/2,d/2+.006,g);
      add(new THREE.BoxGeometry(w+.1,.06,d+.08),oak,0,legs+h+.03,.02,g);
      for(const sx of [-1,1])for(const sz of [-1,1])add(new THREE.BoxGeometry(.07,legs,.07),oak,sx*(w/2-.06),legs/2,sz*(d/2-.06),g);
      add(new THREE.BoxGeometry(w-.1,.05,d-.1),oak,0,.12,0,g);
      // The plate on top.
      const plate=canvasTexture((c,W,H)=>{c.fillStyle='#8a6a2e';c.fillRect(0,0,W,H);c.strokeStyle='#3a2a10';c.lineWidth=4;c.strokeRect(6,6,W-12,H-12);c.fillStyle='#24180a';c.textAlign='center';
        c.font=`bold ${Math.round(H*.38)}px Georgia`;c.fillText('CATALOGUE',W/2,H*.52);c.font=`italic ${Math.round(H*.2)}px Georgia`;c.fillText('of the books, by author',W/2,H*.82)},480,120);
      const sign=add(new THREE.PlaneGeometry(.9,.22),new THREE.MeshStandardMaterial({map:plate,metalness:.35,roughness:.45}),0,legs+h+.2,0,g);sign.rotation.x=-.25;
      add(new THREE.BoxGeometry(.94,.26,.03),MAT.brass||oak,0,legs+h+.19,-.015,g).rotation.x=-.25;
      // The drawer that slides: fourth row, fourth column, the one labelled with a dash, between Li–Ly and Ma–Me.
      const cw=(w-.06)/6,rh=(h-.06)/7,dx=-(w-.06)/2+cw*3.5,dy=legs+h-.03-rh*3.5;
      const drawer=new THREE.Group();drawer.position.set(dx,dy,d/2-.2);g.add(drawer);
      add(new THREE.BoxGeometry(cw-.02,rh-.02,.42),oak,0,0,0,drawer);
      const knob=add(new THREE.SphereGeometry(.018,8,6),MAT.brass||oak,0,-rh*.18,.22,drawer);
      const cards=add(new THREE.BoxGeometry(cw-.06,rh*.6,.38),new THREE.MeshStandardMaterial({color:0xefe6cc,roughness:1}),0,.02,0,drawer);
      // Light from the back of the long drawer, shown only when it opens.
      const glow=add(new THREE.PlaneGeometry(cw-.06,rh-.06),new THREE.MeshBasicMaterial({color:0xffd690,transparent:true,opacity:0}),0,0,-.22,drawer);glow.rotation.y=Math.PI;
      const data={type:'within-drawer',title:'The card catalogue',author:'Every book in the library, by author. The drawers slide out.',action:'PULL A DRAWER'};
      for(const part of [body,face,sign,knob,cards,drawer.children[0]])markDoor(part,data);
      collider?.(CABINET.x+.05,CABINET.z,d+.3,w+.2,'card catalogue');
      cabinet={g,drawer,glow,data,out:0,target:0,long:false,closeAt:0,enterAt:0,rest:drawer.position.z};
      if(wasFound())settle();
    }
    function markDoor(object,data){object.userData=data;interactables.push(object);return object}
    function settle(){if(!cabinet)return;cabinet.data.title='The card catalogue';cabinet.data.author='The drawer marked with a dash goes further back than the cabinet does.';cabinet.data.action='PULL THE LONG DRAWER'}

    // ---------- the room ----------
    function buildRoom(){
      root=new THREE.Group();root.name='within-room';const {cx,cz,w,d,h}=ROOM;
      const plaster=own(new THREE.MeshStandardMaterial({color:0x6a5a48,roughness:.95})),dark=MAT.darkWood,floorMap=own(canvasTexture((c,W,H)=>{
        c.fillStyle='#3a2a1c';c.fillRect(0,0,W,H);for(let y=0;y<H;y+=32)for(let x=-((y/32)%2)*64;x<W;x+=128){c.fillStyle=['#432f1f','#3d2b1c','#47321f','#3a291a'][((x+y)/32)&3];c.fillRect(x+1,y+1,126,30)}},256,256));
      floorMap.wrapS=floorMap.wrapT=THREE.RepeatWrapping;floorMap.repeat?.set?.(w/3,d/3);
      box(w,.3,d,own(new THREE.MeshStandardMaterial({color:0x8a7a68,map:floorMap,roughness:.85})),cx,-.15,cz,root);box(w,.2,d,dark,cx,h+.1,cz,root);
      box(w,h,.3,plaster,cx,h/2,cz-d/2,root);box(w,h,.3,plaster,cx,h/2,cz+d/2,root);box(.3,h,d,plaster,cx-w/2,h/2,cz,root);box(.3,h,d,plaster,cx+w/2,h/2,cz,root);
      for(const z of [cz-d/2+.2,cz+d/2-.2])box(w,.3,.12,dark,cx,h-.15,z,root);
      mark(sign(root,'BOOKS WITHIN BOOKS','The books that live inside other books',4.2,.66,cx,h-1.1,cz-d/2+.17),card('sign'));
      // A rug under the lectern, and the lectern.
      box(4.2,.02,3.2,own(new THREE.MeshStandardMaterial({color:0x5a2420,roughness:1})),cx,.01,cz-.6,root);
      buildLectern(cx,cz-.8);
      // The cases: two on each side wall, face-out books on three shelves.
      for(const group of GROUPS)buildCase(group);
      // A reading table with two chairs, nearer the way in.
      buildTable(cx,cz+3.4);
      // The back of the card catalogue on the south wall, with the long drawer still out: the way back.
      buildExit(cx,cz+d/2);
      const lamp=new THREE.PointLight(0xffd29a,7,18,2);lamp.position.set(cx,h-1.2,cz);root.add(lamp);
      add(own(new THREE.CylinderGeometry(.22,.3,.36,12)),own(new THREE.MeshStandardMaterial({color:0x3a2e22,emissive:0xffc070,emissiveIntensity:.9,roughness:.6})),cx,h-1.05,cz,root);
      add(own(new THREE.CylinderGeometry(.012,.012,.85,4)),MAT.brass||dark,cx,h-.45,cz,root);
      scene.add(root);
    }
    // The covers of the books that never were, all on one texture: each a cell of the atlas.
    const ATLAS={cols:6,cellW:256,cellH:340};
    function atlasTexture(){
      const rows=Math.ceil(NEVER.length/ATLAS.cols);
      return own(canvasTexture((c,W,H)=>{NEVER.forEach((b,i)=>{const x=(i%ATLAS.cols)*ATLAS.cellW,y=Math.floor(i/ATLAS.cols)*ATLAS.cellH;drawCover(c,x,y,ATLAS.cellW,ATLAS.cellH,b)})},ATLAS.cols*ATLAS.cellW,rows*ATLAS.cellH));
    }
    function drawCover(c,x,y,w,h,b){
      c.save();c.translate(x,y);c.fillStyle=b.colour;c.fillRect(0,0,w,h);
      const shade=c.createLinearGradient(0,0,w,0);shade.addColorStop(0,'rgba(0,0,0,.45)');shade.addColorStop(.12,'rgba(0,0,0,0)');shade.addColorStop(1,'rgba(0,0,0,.25)');c.fillStyle=shade;c.fillRect(0,0,w,h);
      const rgb=parseInt(b.colour.slice(1),16),bright=((rgb>>16)*.3+((rgb>>8)&255)*.59+(rgb&255)*.11)>120;
      const gold=b.group==='holmes'?'#d8c08a':'#e2c070',light=bright?'#2a1a08':gold;
      c.strokeStyle=light;c.lineWidth=3;c.strokeRect(12,12,w-24,h-24);c.lineWidth=1;c.strokeRect(19,19,w-38,h-38);
      c.fillStyle=light;c.textAlign='center';
      if(b.mirror){c.save();c.scale(-1,1);c.font='bold 26px Georgia';c.fillText(b.title,-w/2,h*.42);c.font='italic 16px Georgia';c.fillText('’Twas brillig, and the slithy toves',-w/2,h*.55);c.restore()}
      else{const size=b.title.length>60?17:b.title.length>34?21:26;c.font=`bold ${size}px Georgia`;const end=wrap(c,b.title,w/2,62,w-50,size+5);
        c.fillRect(w/2-28,end+18,56,2)}
      c.font='italic 15px Georgia';wrap(c,b.by,w/2,h-58,w-44,18);
      c.restore();
    }
    function buildCase(group){
      const {cx,cz,w}=ROOM,side=group.wall==='west'?-1:1,x=cx+side*(w/2-.44),zc=cz+group.along,length=5.6,ROWS=[.75,1.55,2.35];
      // A thin back against the wall, end boards, and the shelves standing out from it; the books lean on the back.
      const backing=box(.06,2.9,length,MAT.darkWood,cx+side*(w/2-.18),1.45,zc,root);
      for(const y of [...ROWS.map(y=>y-.32),2.95])box(.4,.05,length,MAT.darkWood,cx+side*(w/2-.38),y,zc,root);
      for(const end of [-1,1])box(.42,2.97,.06,MAT.darkWood,cx+side*(w/2-.38),1.49,zc+end*length/2,root);
      block(cx+side*(w/2-.35),zc,.7,length+.2);
      const label=sign(root,group.name,group.sub,3.1,.48,cx+side*(w/2-.17),3.45,zc);label.rotation.y=-side*Math.PI/2;mark(label,card(group.key));
      backing.userData={};
      const yaw=-side*Math.PI/2,place=(i,n)=>{const per=Math.ceil(n/ROWS.length),row=Math.floor(i/per),col=i%per,count=row<ROWS.length-1?per:n-per*(ROWS.length-1),step=Math.min(.68,(length-.4)/per);
        return {x,y:ROWS[ROWS.length-1-row],z:zc+side*-((col-(count-1)/2)*step),yaw}};
      if(group.ids){
        const list=shelfBooks(group.ids,group.key,9),geometry=own(new THREE.BoxGeometry(.42,.56,.06));
        list.forEach((book,i)=>{const spot=place(i,list.length);const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,root);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw;mesh.rotation.x=-.1;
          // While the room is built, its copies win over the same books on the wings' shelves (priority 20 there).
          mesh.userData={type:'book',book,loaded:false,within:true,shelf:group.key,singleCopyPriority:22,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};interactables.push(mesh);ours.push(mesh);books.push(mesh)});
        return;
      }
      const entries=NEVER.filter(b=>b.group===group.key),texture=atlas||(atlas=atlasTexture()),rows=Math.ceil(NEVER.length/ATLAS.cols);
      const coverMat=own(new THREE.MeshStandardMaterial({map:texture,roughness:.7})),bodyGeo=own(new THREE.BoxGeometry(.4,.54,.05));
      entries.forEach((b,n)=>{const i=NEVER.indexOf(b),spot=place(n,entries.length),u=(i%ATLAS.cols)/ATLAS.cols,v=Math.floor(i/ATLAS.cols)/rows;
        const g=new THREE.Group();g.position.set(spot.x,spot.y,spot.z);g.rotation.order='YXZ';g.rotation.y=spot.yaw;g.rotation.x=-.1;root.add(g);
        const bodyMat=own(new THREE.MeshStandardMaterial({color:parseInt(b.colour.slice(1),16),roughness:.75}));
        const body=add(bodyGeo,bodyMat,0,0,0,g),cover=add(own(coverGeometry(u,v,1/ATLAS.cols,1/rows)),coverMat,0,0,.027,g);
        const data={type:'within-book',key:b.key,title:b.title,author:b.by,action:'READ THE CARD'};mark(body,data);mark(cover,data);props.push(g);
      });
    }
    // A cover plane whose UVs pick one cell of the atlas (canvas rows run top to bottom, UVs bottom to top).
    function coverGeometry(u,v,du,dv){
      const geometry=new THREE.PlaneGeometry(.39,.53),uv=geometry.attributes?.uv;
      if(uv){const top=1-v,bottom=1-v-dv;uv.setXY(0,u,top);uv.setXY(1,u+du,top);uv.setXY(2,u,bottom);uv.setXY(3,u+du,bottom);uv.needsUpdate=true}
      return geometry;
    }
    const shelfBooks=(ids,room,max)=>[...new Set([...ids,...(arrivals[room]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,max);
    // The lectern in the middle: Heimskringla lying on it, and the parchment slipping out of its leaves.
    function buildLectern(x,z){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);
      box(.5,.06,.5,MAT.darkWood,0,.03,0,g);box(.14,1.05,.14,MAT.darkWood,0,.58,0,g);
      const desk=box(.78,.05,.56,MAT.darkWood,0,1.16,0,g);desk.rotation.x=.32;
      block(x,z,.9,.8);
      const [book]=shelfBooks([],'lectern',1);
      if(book){const mesh=add(own(new THREE.BoxGeometry(.38,.5,.07)),own(bookMaterial(book)),0,1.24,-.02,g);mesh.rotation.set(-Math.PI/2+.32,0,0);// cover up, its top away from the reader, at the desk's slope
        mesh.userData={type:'book',book,loaded:false,within:true,shelf:'lectern',home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:g}};interactables.push(mesh);ours.push(mesh);books.push(mesh)}
      const parchment=own(canvasTexture((c,W,H)=>{c.fillStyle='#d9c69a';c.fillRect(0,0,W,H);c.fillStyle='rgba(120,90,40,.25)';for(let i=0;i<40;i++){c.beginPath();c.arc((i*53)%W,(i*31)%H,4+(i%5)*3,0,7);c.fill()}
        // Strokes in the manner of runes: the facsimile in the book is a picture, not text, so these are only marks.
        c.strokeStyle='#3a2410';c.lineWidth=2.4;for(let row=0;row<6;row++)for(let k=0;k<11;k++){const px=14+k*21,py=20+row*30,s=(row*11+k)*7919%13;
          c.beginPath();c.moveTo(px,py);c.lineTo(px,py+20);if(s&1){c.moveTo(px,py+(s%3)*5);c.lineTo(px+9,py+5+(s%3)*5)}if(s&2){c.moveTo(px,py+12);c.lineTo(px+8,py+20)}if(s&4){c.moveTo(px+8,py);c.lineTo(px,py+8)}c.stroke()}},256,200));
      const scrap=add(own(new THREE.PlaneGeometry(.26,.2)),own(new THREE.MeshStandardMaterial({map:parchment,roughness:.95,side:THREE.DoubleSide})),.24,1.235,.2,g);scrap.rotation.set(-Math.PI/2+.32,0,-.35);
      mark(scrap,{type:'within-card',title:LECTERN.parchment[0],author:LECTERN.parchment[1],action:'READ'});
      return g;
    }
    function buildTable(x,z){
      const top=box(2.2,.07,1,MAT.darkWood,x,.78,z,root);for(const sx of [-.98,.98])for(const sz of [-.4,.4])box(.07,.75,.07,MAT.darkWood,x+sx,.38,z+sz,root);block(x,z,2.4,1.2);
      top.userData={};
      for(const side of [-1,1]){
        const px=x+side*1.5,chair=new THREE.Group();chair.position.set(px,0,z);chair.rotation.y=side*Math.PI/2;root.add(chair);
        const seat=box(.52,.06,.5,MAT.darkWood,0,.46,0,chair),back=box(.52,.62,.05,MAT.darkWood,0,.8,.23,chair);for(const lx of [-.22,.22])for(const lz of [-.2,.2])box(.05,.44,.05,MAT.darkWood,lx,.22,lz,chair);block(px,z,.7,.7);
        if(registerSeat){const data=registerSeat([seat,back],chair,new THREE.Vector3(0,1.2,.05),side*Math.PI/2,{title:'A chair at the reading table',author:'Sit and read one of the books that other books read.'});
          Object.defineProperty(data,'bookIds',{get:()=>books.map(mesh=>mesh.userData.book.id),configurable:true});ours.push(seat,back)}
      }
    }
    function buildExit(x,wallZ){
      const g=new THREE.Group();g.position.set(x,0,wallZ-.3);root.add(g);
      const back=box(1.6,1.86,.3,MAT.darkWood,0,.93,0,g);
      for(const px of [-.5,0,.5])box(.42,1.5,.02,own(new THREE.MeshStandardMaterial({color:0x4a3220,roughness:.8})),px,.93,-.16,g);
      // The long drawer, reaching into the room, light still coming from inside it.
      const drawer=box(.24,.18,1.1,MAT.darkWood,.27,1.1,-.65,g);
      const glow=add(own(new THREE.PlaneGeometry(.2,.14)),own(new THREE.MeshBasicMaterial({color:0xffd690})),.27,1.1,-1.205,g);glow.rotation.y=Math.PI;
      const data={type:'within-exit',title:CARDS.exit[0],author:CARDS.exit[1],action:'RETURN'};for(const part of [back,drawer,glow])mark(part,data);
      block(x,wallZ-.3,1.8,.6);block(x+.27,wallZ-.85,.4,1.2);
    }

    // ---------- walking ----------
    function contains(x,z){return x>ROOM.cx-ROOM.w/2&&x<ROOM.cx+ROOM.w/2&&z>ROOM.cz-ROOM.d/2&&z<ROOM.cz+ROOM.d/2}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      if(!contains(x,z))return false;const r=player.radius||.42;
      if(x-r<ROOM.cx-ROOM.w/2+.45||x+r>ROOM.cx+ROOM.w/2-.45||z-r<ROOM.cz-ROOM.d/2+.45||z+r>ROOM.cz+ROOM.d/2-.45)return false;
      return !blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ);
    }

    // ---------- doing things ----------
    function enter(){
      activate();move(ROOM.cx-1.2,ROOM.cz+ROOM.d/2-2.2,0);playSample?.('secretDoor',.6,1.1);
      showNotice('Books Within Books. On the left, the books that never were; on the right, the real books that people in other books read. On the lectern, the professor’s Heimskringla, with something falling out of it.',11);
      analytics?.track('Room Explored',{room:'within-room'});
    }
    function leave(){
      const out=CABINET.x+Math.sin(CABINET.yaw)*1.7,outZ=CABINET.z+Math.cos(CABINET.yaw)*1.7;
      move(out,outZ,CABINET.yaw+Math.PI);playSample?.('pageTurn',.6,.9);showNotice('The Grand Hall again. The drawer slides home behind you.',4);
    }
    function pull(){
      if(!cabinet||cabinet.long)return;
      if(wasFound()||pulls>=1){
        // The long drawer: it keeps coming, and there is light at the back of it.
        cabinet.long=true;cabinet.target=1.6;cabinet.enterAt=time+1.7;playSample?.('secretDoor',.5,.9);
        showNotice(wasFound()?'The drawer marked with a dash slides out, and out, further than the cabinet is deep. There is a room at the back of it.':'This drawer does not stop. It slides out, and out, further than the cabinet is deep, and at the back of it, where the wall should be, there is lamplight, and shelves.',6);
        if(!wasFound()){try{storage?.setItem(FOUND_KEY,'1')}catch(e){}analytics?.track('Secret Found',{secret:'within-catalogue'})}
        settle();return;
      }
      pulls++;cabinet.target=.32;cabinet.closeAt=time+5;playSample?.('pageTurn',.7,1.2);
      const text=DRAWER_CARDS[Math.floor(Math.random()*DRAWER_CARDS.length)];
      showNotice(`You pull a drawer and lift out the first card: ${text} The library does not hold the book. Behind the cards the drawer goes on, further back than it ought to.`,12);
      cabinet.data.action='PULL AGAIN';
    }
    function readProp(data){
      const b=NEVER.find(entry=>entry.key===data.key);if(!b)return;
      const ready=armed===b.key&&time-armedAt<30;
      if(ready&&!b.hidden&&openBook){armed=null;data.action='READ THE CARD';
        if(openBook(b.host,b.passage))return;showNotice(`The library does not have ${b.hostTitle} on its shelves yet.`,6);return}
      showNotice(`${b.title}, by ${b.by}. ${b.card}${b.hidden||!openBook?'':` (Again, to open ${b.hostTitle} at the page.)`}`,16);
      if(!b.hidden){armed=b.key;armedAt=time;data.action=`OPEN ${b.hostTitle.toUpperCase()}`}
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('within-'))return false;
      if(data.type==='within-drawer'){pull();return true}
      if(data.type==='within-exit'){leave();return true}
      if(data.type==='within-book'){readProp(data);return true}
      if(data.type==='within-card'){showNotice(`${data.title}: ${data.author}`,14);return true}
      return false;
    }
    // Who read a real book, for the notice when it is taken down here.
    function readBy(id){if(id===books.find(m=>m.userData.shelf==='lectern')?.userData.book.id)return LECTERN.book;return READS[id]||null}

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;atlas=null;armed=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;props.length=0;blockers.length=0;
    }
    function update(t){
      const dt=Math.min(.1,Math.max(0,t-time));time=t;const inside=contains(player.pos.x,player.pos.z);
      const near=cabinet&&Math.hypot(player.pos.x-CABINET.x,player.pos.z-CABINET.z)<5;
      if(inside)activate();
      // The room is built as the long drawer opens, so it is ready when the reader goes through.
      if(cabinet?.long)activate();
      if(root&&!inside&&!near&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==root&&b.parent?.parent!==root))unload();
      if(!cabinet)return;
      if(cabinet.closeAt&&t>cabinet.closeAt){cabinet.closeAt=0;cabinet.target=0}
      const speed=cabinet.long?1.1:1.6;cabinet.out+=Math.sign(cabinet.target-cabinet.out)*Math.min(Math.abs(cabinet.target-cabinet.out),speed*dt);
      cabinet.drawer.position.z=cabinet.rest+cabinet.out;cabinet.glow.material.opacity=cabinet.long?Math.min(1,cabinet.out/1.2):0;
      if(cabinet.enterAt&&t>cabinet.enterAt){cabinet.enterAt=0;enter();cabinet.long=false;cabinet.target=0;cabinet.out=0;cabinet.drawer.position.z=cabinet.rest;cabinet.glow.material.opacity=0}
    }
    buildCabinet();
    return {contains,floorAt,allowed,interact,update,enter,unload,readBy,cabinet:CABINET,room:ROOM,groups:GROUPS,never:NEVER,reads:READS,
      get built(){return !!root},get books(){return books.slice()},get props(){return props.slice()},get found(){return wasFound()},zoneAt:(x,z)=>contains(x,z)?'within-room':null};
  };
})();
