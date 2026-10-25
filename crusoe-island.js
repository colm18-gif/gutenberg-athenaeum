// The Boathouse and Crusoe's island. A walnut door in the Grand Hall opens onto an old boathouse at night;
// a rowing boat at the end of its jetty crosses the sea as the sun comes up, to a small island where Robinson
// Crusoe has left his camp, his calendar post, his parrot and a castaways' library.
//
// Nothing here exists until the reader walks up to the door: the boathouse, the sea and the sky are built then,
// the island when the reader steps into the boathouse, and all of it is freed a while after they leave. It
// adds no lamps of its own beyond the lanterns and the campfire, which count within the library's lamp budget,
// and the sunrise reuses the library's own moonlight and sky light rather than adding new ones.
(function(){
  'use strict';

  window.createCrusoeIsland=function(options){
    const {THREE,scene,MAT,player,camera,interactables,canvasTexture,bookMaterial,findBook,showNotice,playSample,sound,noise,move,fade,renderer,ambient,moon,analytics,isReducedMotion=()=>false,isHolding=()=>false,storage=null,doorKit=null}=options;
    const DOOR={x:-4.5,z:30.45,yaw:Math.PI};
    // Where the reader stands on coming back through the door: just in front of it, facing into the hall.
    const HALL_SPOT={x:DOOR.x+Math.sin(DOOR.yaw)*1.9,z:DOOR.z+Math.cos(DOOR.yaw)*1.9,yaw:DOOR.yaw+Math.PI};
    const HOUSE={x0:-426,x1:-414,z0:325,z1:335},JETTY={x0:-421.2,x1:-418.8,z0:312,z1:325};
    const ISLE={x:-420,z:182,rx:19,rz:13},SAND={rx:23,rz:17};
    const BOAT_START={x:-420,z:310.4},LANDING={x:-420,z:193.4},SHIP={x:-326,z:180};
    const SEA_Y=-.6,PRELOAD=5.5,KEEP=25,DAY_MS=86400000;
    const SHELF_BOOKS=[1268,46597,829,159,421],CRUSOE=521,TREASURE=120,SEA_BOOKS=[2701,164,3704,103];
    const QUOTES={
      footprint:'“It happened one day, about noon, going towards my boat, I was exceedingly surprised with the print of a man’s naked foot on the shore, which was very plain to be seen on the sand.” (Robinson Crusoe)',
      poll:'Poll: “Poor Robin Crusoe! Where are you? Where have you been? How came you here?”',
      bottle:'A bottle bobs past the boat with a note curled inside: “I learned to look more upon the bright side of my condition, and less upon the dark side.” (Robinson Crusoe)',
      calendar:'Carved into the cross: “I came on shore here on the 30th September 1659.” Crusoe cut a notch for every day, every seventh a little longer.',
      chest:'“Fifteen men on the dead man’s chest— Yo-ho-ho, and a bottle of rum!” The chest holds a copy of Treasure Island.'
    };
    // Robinson himself, by his fire. Each line is his own, word for word from the library's copy of the book
    // (texts/pg521.txt; a test checks), with a few words of what he does as he says it.
    const ROBINSON=[
      {before:'Robinson Crusoe tips back his umbrella of skins and looks at you as if you were the first face he has seen in years.',say:'I, poor miserable Robinson Crusoe, being shipwrecked during a dreadful storm in the offing, came on shore on this dismal, unfortunate island, which I called “The Island of Despair”'},
      {before:'He waves a hand at the stockade, the goats and the barley.',say:'I was lord of the whole manor; or, if I pleased, I might call myself king or emperor over the whole country which I had possession of: there were no rivals'},
      {before:'He glances over at Poll on her perch.',say:'Poll, as if he had been my favourite, was the only person permitted to talk to me.'},
      {before:'He nods up the beach to the great canoe lying among the trees.',say:'now I saw, though too late, the folly of beginning a work before we count the cost, and before we judge rightly of our own strength to go through with it.'},
      {before:'He lifts the umbrella an inch, rather proudly.',say:'the main difficulty I found was to make it let down.'},
      {before:'He is quiet a while, looking out at the reef where the wreck lies.',say:'I learned to look more upon the bright side of my condition, and less upon the dark side, and to consider what I enjoyed rather than what I wanted'},
      {before:'He points you to the sea chest by the driftwood shelf, where his whole story lies, from York to the island and home again.'}
    ];
    const ROBINSON_FOOTPRINT={before:'He sees the sand on your boots, and where you have been walking, and goes pale.',say:'I stood like one thunderstruck, or as if I had seen an apparition.'};
    const ROBINSON_FRIDAY={before:'It is a Friday, and the day puts him in mind of his man.',say:'I let him know his name should be Friday, which was the day I saved his life'};
    // The things about his camp, each with his own words for it.
    const SAYS={
      goats:'“Adjoining to this I had my enclosures for my cattle, that is to say my goats, and I had taken an inconceivable deal of pains to fence and enclose this ground.”',
      barley:'Sprung from a bag of chickens’ meat he shook out by the rock: “I saw about ten or twelve ears come out, which were perfect green barley, of the same kind as our European—nay, as our English barley.”',
      canoe:'Hollowed from one cedar, a hundred yards from the water and uphill all the way: “But all my devices to get it into the water failed me; though they cost me infinite labour too.”',
      pots:'“I could not make above two large earthen ugly things (I cannot call them jars) in about two months’ labour.”',
      raisins:'Grapes hung up to dry: “I found the grapes I had hung up perfectly dried, and, indeed, were excellent good raisins of the sun”',
      money:'Coins from the wreck, left lying: “O drug!” said I, aloud, “what art thou good for? Thou art not worth to me—no, not the taking off the ground; one of those knives is worth all this heap”',
      dog:'The ship’s dog, very old now: “My dog, who was now grown old and crazy, and had found no species to multiply his kind upon, sat always at my right hand”'
    };
    // His journal, kept "as long as it lasted; for having no more ink, I was forced to leave it off": the first
    // words of each day's entry, from the landing to the July after, opened at today's date or the last before it.
    const JOURNAL=[
      ['09-30',1659,'I, poor miserable Robinson Crusoe, being shipwrecked during a dreadful storm in the offing, came on shore on this dismal, unfortunate island, which I called “The Island of Despair”…'],
      ['10-01',1659,'In the morning I saw, to my great surprise, the ship had floated with the high tide, and was driven on shore again much nearer the island; which, as it was some comfort, on one hand—for, seeing her set upright…'],
      ['10-20',1659,'I overset my raft, and all the goods I had got upon it; but, being in shoal water, and the things being chiefly heavy, I recovered many of them when the tide was out.'],
      ['10-25',1659,'It rained all night and all day, with some gusts of wind; during which time the ship broke in pieces, the wind blowing a little harder than before, and was no more to be seen, except the wreck of her, and that only at low water.'],
      ['10-26',1659,'I walked about the shore almost all day, to find out a place to fix my habitation, greatly concerned to secure myself from any attack in the night, either from wild beasts or men.'],
      ['11-01',1659,'I set up my tent under a rock, and lay there for the first night; making it as large as I could, with stakes driven in to swing my hammock upon.'],
      ['11-02',1659,'I set up all my chests and boards, and the pieces of timber which made my rafts, and with them formed a fence round me, a little within the place I had marked out for my fortification.'],
      ['11-03',1659,'I went out with my gun, and killed two fowls like ducks, which were very good food. In the afternoon went to work to make me a table.'],
      ['11-04',1659,'This morning I began to order my times of work, of going out with my gun, time of sleep, and time of diversion—viz. every morning I walked out with my gun for two or three hours, if it did not rain…'],
      ['11-05',1659,'This day went abroad with my gun and my dog, and killed a wild cat; her skin pretty soft, but her flesh good for nothing; every creature that I killed I took of the skins and preserved them.'],
      ['11-06',1659,'After my morning walk I went to work with my table again, and finished it, though not to my liking; nor was it long before I learned to mend it.'],
      ['11-07',1659,'Now it began to be settled fair weather. The 7th, 8th, 9th, 10th, and part of the 12th (for the 11th was Sunday) I took wholly up to make me a chair, and with much ado brought it to a tolerable shape…'],
      ['11-13',1659,'This day it rained, which refreshed me exceedingly, and cooled the earth; but it was accompanied with terrible thunder and lightning, which frightened me dreadfully, for fear of my powder.'],
      ['11-14',1659,'These three days I spent in making little square chests, or boxes, which might hold about a pound, or two pounds at most, of powder; and so, putting the powder in, I stowed it in places as secure and remote from one another as possible.'],
      ['11-17',1659,'This day I began to dig behind my tent into the rock, to make room for my further conveniency.'],
      ['11-18',1659,'The next day, in searching the woods, I found a tree of that wood, or like it, which in the Brazils they call the iron-tree, for its exceeding hardness.'],
      ['11-23',1659,'My other work having now stood still, because of my making these tools, when they were finished I went on, and working every day, as my strength and time allowed…'],
      ['12-10',1659,'I began now to think my cave or vault finished, when on a sudden (it seems I had made it too large) a great quantity of earth fell down from the top on one side; so much that, in short, it frighted me…'],
      ['12-11',1659,'This day I went to work with it accordingly, and got two shores or posts pitched upright to the top, with two pieces of boards across over each post; this I finished the next day; and setting more posts up with boards…'],
      ['12-17',1659,'From this day to the 20th I placed shelves, and knocked up nails on the posts, to hang everything up that could be hung up; and now I began to be in some order within doors.'],
      ['12-20',1659,'Now I carried everything into the cave, and began to furnish my house, and set up some pieces of boards like a dresser, to order my victuals upon; but boards began to be very scarce with me; also, I made me another table.'],
      ['12-24',1659,'Much rain all night and all day. No stirring out.'],
      ['12-25',1659,'Rain all day.'],
      ['12-26',1659,'No rain, and the earth much cooler than before, and pleasanter.'],
      ['12-27',1659,'Killed a young goat, and lamed another, so that I caught it and led it home in a string; when I had it at home, I bound and splintered up its leg, which was broke.'],
      ['12-28',1659,'Great heats and no breeze, so that there was no stirring abroad except in the evening for food; this time I spent in putting all my things in order within doors.'],
      ['01-01',1660,'Very hot still: but I went abroad early and late with my gun, and lay still in the middle of the day.'],
      ['01-02',1660,'Accordingly, the next day I went out with my dog, and set him upon the goats, but I was mistaken, for they all faced about upon the dog, and he knew his danger too well, for he would not come near them.'],
      ['01-03',1660,'I began my fence or wall; which, being still jealous of my being attacked by somebody, I resolved to make very thick and strong.'],
      ['04-16',1660,'I finished the ladder; so I went up the ladder to the top, and then pulled it up after me, and let it down in the inside.'],
      ['04-22',1660,'The next morning I begin to consider of means to put this resolve into execution; but I was at a great loss about my tools.'],
      ['04-28',1660,'These two whole days I took up in grinding my tools, my machine for turning my grindstone performing very well.'],
      ['04-30',1660,'Having perceived my bread had been low a great while, now I took a survey of it, and reduced myself to one biscuit cake a day, which made my heart very heavy.'],
      ['05-01',1660,'In the morning, looking towards the sea side, the tide being low, I saw something lie on the shore bigger than ordinary, and it looked like a cask; when I came to it, I found a small barrel…'],
      ['05-03',1660,'I began with my saw, and cut a piece of a beam through, which I thought held some of the upper part or quarter-deck together, and when I had cut it through…'],
      ['05-04',1660,'I went a-fishing, but caught not one fish that I durst eat of, till I was weary of my sport; when, just going to leave off, I caught a young dolphin.'],
      ['05-05',1660,'Worked on the wreck; cut another beam asunder, and brought three great fir planks off from the decks, which I tied together, and made to float on shore when the tide of flood came on.'],
      ['05-06',1660,'Worked on the wreck; got several iron bolts out of her and other pieces of ironwork. Worked very hard, and came home very much tired, and had thoughts of giving it over.'],
      ['05-07',1660,'Went to the wreck again, not with an intent to work, but found the weight of the wreck had broke itself down, the beams being cut; that several pieces of the ship seemed to lie loose…'],
      ['05-08',1660,'Went to the wreck, and carried an iron crow to wrench up the deck, which lay now quite clear of the water or sand.'],
      ['05-09',1660,'Went to the wreck, and with the crow made way into the body of the wreck, and felt several casks, and loosened them with the crow, but could not break them up.'],
      ['05-15',1660,'I carried two hatchets, to try if I could not cut a piece off the roll of lead by placing the edge of one hatchet and driving it with the other; but as it lay about a foot and a half in the water…'],
      ['05-16',1660,'It had blown hard in the night, and the wreck appeared more broken by the force of the water; but I stayed so long in the woods, to get pigeons for food, that the tide prevented my going to the wreck that day.'],
      ['05-17',1660,'I saw some pieces of the wreck blown on shore, at a great distance, near two miles off me, but resolved to see what they were, and found it was a piece of the head, but too heavy for me to bring away.'],
      ['05-24',1660,'Every day, to this day, I worked on the wreck; and with hard labour I loosened some things so much with the crow, that the first flowing tide several casks floated out, and two of the seamen’s chests…'],
      ['06-16',1660,'Going down to the seaside, I found a large tortoise or turtle.'],
      ['06-17',1660,'I spent in cooking the turtle. I found in her three-score eggs; and her flesh was to me, at that time, the most savoury and pleasant that ever I tasted in my life, having had no flesh, but of goats and fowls…'],
      ['06-18',1660,'Rained all day, and I stayed within. I thought at this time the rain felt cold, and I was something chilly; which I knew was not usual in that latitude.'],
      ['06-19',1660,'Very ill, and shivering, as if the weather had been cold.'],
      ['06-20',1660,'No rest all night; violent pains in my head, and feverish.'],
      ['06-21',1660,'Very ill; frighted almost to death with the apprehensions of my sad condition—to be sick, and no help.'],
      ['06-22',1660,'A little better; but under dreadful apprehensions of sickness.'],
      ['06-23',1660,'Very bad again; cold and shivering, and then a violent headache.'],
      ['06-24',1660,'Much better.'],
      ['06-25',1660,'An ague very violent; the fit held me seven hours; cold fit and hot, with faint sweats after it.'],
      ['06-26',1660,'Better; and having no victuals to eat, took my gun, but found myself very weak.'],
      ['06-27',1660,'The ague again so violent that I lay a-bed all day, and neither ate nor drank.'],
      ['06-28',1660,'Having been somewhat refreshed with the sleep I had had, and the fit being entirely off, I got up; and though the fright and terror of my dream was very great…'],
      ['07-02',1660,'I renewed the medicine all the three ways; and dosed myself with it as at first, and doubled the quantity which I drank.'],
      ['07-03',1660,'I missed the fit for good and all, though I did not recover my full strength for some weeks after.'],
      ['07-04',1660,'In the morning I took the Bible; and beginning at the New Testament, I began seriously to read it, and imposed upon myself to read a while every morning and every night; not tying myself to the number of chapters…'],
    ];

    let root=null,isle=null,time=0,lastNeeded=-1e9,dawn=0,landed=false,travel=null,transition=null,spy=null,saved=null,applied=false,doorParts=null;
    const owned=[],ours=[],blockers=[],flames=[],books=[];
    const state={robinson:null,goats:[],footprintSeen:false,heard:0,chest:null,chestOpen:0,dug:false,fire:null,fireLit:0,poll:null,pollTalk:0,sea:null,sky:null,boat:null,bottle:null,bottleSeen:false,ship:null,calendar:null};
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,smooth=t=>t*t*(3-2*t);

    // ---------- small builders ----------
    const own=thing=>{owned.push(thing);return thing};
    const std=(params)=>own(new THREE.MeshStandardMaterial(params));
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=false;parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(new THREE.BoxGeometry(w,h,d),material,x,y,z,parent);
    const cyl=(rt,rb,h,seg,material,x,y,z,parent)=>add(new THREE.CylinderGeometry(rt,rb,h,seg),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    // The door in the hall stays when the boathouse is freed, so its parts are not among the room's own.
    function markDoor(object,data){object.userData=data;interactables.push(object);return object}
    // The boathouse side of its door: sea-blue boards with a porthole (the hall side is walnut), hung in the library's own kit (library-doors.js).
    const DOOR_LOOK={style:'painted',color:0x2f5561,planked:true,fanlight:false,pediment:false,width:1.9,height:3.1};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    // A brass porthole through the leaf, dark with the sea behind it.
    function porthole(door,glass){if(!door)return;const ring=new THREE.TorusGeometry(.33,.05,8,24),pane=new THREE.CircleGeometry(.3,24);
      for(const side of [-1,1]){const r=add(ring,MAT.brass,0,2.25,side*.07,door.leaf),p=add(pane,glass,0,2.25,side*.066,door.leaf);if(side<0){r.rotation.y=p.rotation.y=Math.PI}}doorKit.drawAfterPortal(door.leaf)}
    function lamp(parent,color,intensity,distance,x,y,z){const l=new THREE.PointLight(color,intensity,distance,2);l.position.set(x,y,z);l.castShadow=false;parent.add(l);return l}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    function texture(draw,w,h,linear=false){const t=own(canvasTexture(draw,w,h));if(linear)t.colorSpace=THREE.NoColorSpace;return t}
    function sign(text,w,h,parent,x,y,z,sub=''){
      const map=texture((c,W,H)=>{c.fillStyle='#24170d';c.fillRect(0,0,W,H);c.strokeStyle='#d7ae60';c.lineWidth=6;c.strokeRect(5,5,W-10,H-10);c.fillStyle='#ffe2a0';c.textAlign='center';c.font=`bold ${sub?30:34}px Georgia`;c.fillText(text,W/2,sub?44:H/2+12);if(sub){c.font='italic 22px Georgia';c.fillText(sub,W/2,78)}},512,sub?100:72);
      return add(new THREE.PlaneGeometry(w,h),std({map,emissive:0x6b461e,emissiveIntensity:.3,roughness:.8}),x,y,z,parent);
    }
    // A book standing face-out, ready to be taken down like any other in the library.
    const displayGeometry=()=>own(new THREE.BoxGeometry(.82,1.08,.14));
    function placeBook(id,parent,x,y,z,yaw,tilt=-.08,ownCopy=false){
      const book=findBook(id);if(!book)return null;const material=own(bookMaterial(book));
      const mesh=add(displayGeometry(),material,x,y,z,parent);mesh.rotation.order='YXZ';mesh.rotation.y=yaw;mesh.rotation.x=tilt;
      mesh.userData={type:'book',book,loaded:false,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent}};if(ownCopy)mesh.userData.ownCopy=true;interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh;
    }

    // ---------- the door in the Grand Hall ----------
    function buildDoor(){
      const g=new THREE.Group();g.name='boathouse-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'isle-door',title:'The Boathouse',author:'A walnut door that smells faintly of salt. Somewhere behind it, water is lapping.',action:'ENTER'};
      const glass=new THREE.MeshStandardMaterial({color:0x1d3440,emissive:0x0d2330,emissiveIntensity:.8,roughness:.2,metalness:.1});
      const kd=doorKit?.hang(g,{data,mark:markDoor,...DOOR_LOOK,...doorKit.readingRoom?.('THE BOATHOUSE','Crusoe’s island, by water')});if(!kd)markDoor(box(1.9,3.1,.14,new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.8}),0,1.55,.08,g),data);else if(!doorKit.readingRoom)porthole(kd,glass);
      // A coil of rope on a cleat beside the door, and a lifebuoy.
      const rope=new THREE.MeshStandardMaterial({color:0x6e5534,roughness:1});
      for(let k=0;k<3;k++){const coil=add(new THREE.TorusGeometry(.3-k*.035,.035,6,22),rope,-1.72,1.7-k*.05,.1+k*.03,g);coil.scale.y=1.25}
      box(.3,.06,.08,MAT.brass,-1.72,2.13,.06,g);
      const buoy=new THREE.MeshStandardMaterial({color:0xc9c2b2,roughness:.85}),band=new THREE.MeshStandardMaterial({color:0xa8322a,roughness:.85});
      const ring=add(new THREE.TorusGeometry(.3,.08,10,24),buoy,1.72,2.05,.14,g);for(let k=0;k<4;k++){const b=add(new THREE.TorusGeometry(.3,.085,10,4,Math.PI/6),band,1.72,2.05,.14,g);b.rotation.z=k*Math.PI/2+Math.PI/6}
      markDoor(ring,{type:'isle-card',title:'A lifebuoy',author:'No ship’s name on it. Crusoe came ashore without one, on the island he called the Island of Despair.',action:'EXAMINE'});
      const plate=texture((c,W,H)=>{c.fillStyle='#16282e';c.fillRect(0,0,W,H);c.strokeStyle='#d7ae60';c.lineWidth=6;c.strokeRect(5,5,W-10,H-10);c.fillStyle='#ffe2a0';c.textAlign='center';c.font='bold 30px Georgia';c.fillText('THE BOATHOUSE',W/2,44)},560,64);
      // The name is gilded on the door's glass; the old board above is kept only for a door built without the kit.
      if(!doorKit?.readingRoom)markDoor(add(new THREE.PlaneGeometry(1.9,.3),new THREE.MeshStandardMaterial({map:plate,emissive:0x6b461e,emissiveIntensity:.35}),0,3.72,.12,g),data);
      owned.splice(owned.indexOf(plate),1);
      doorParts={group:g,glow:lamp(g,0xbfe3ff,1.1,5,0,3.9,1.1)};
    }

    // ---------- textures ----------
    function seaTextures(){
      const N=256,normal=texture((c,W,H)=>{
        const img=c.createImageData(W,H),h=(x,y)=>Math.sin(2*Math.PI*(2*x+y)/N)*.5+Math.sin(2*Math.PI*(3*x-2*y)/N)*.3+Math.sin(2*Math.PI*(5*x+4*y)/N)*.16+Math.sin(2*Math.PI*(9*x-7*y)/N)*.07;
        for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=h(x+1,y)-h(x-1,y),dy=h(x,y+1)-h(x,y-1),nx=-dx*3,ny=-dy*3,len=Math.hypot(nx,ny,1),i=(y*W+x)*4;img.data[i]=(nx/len*.5+.5)*255;img.data[i+1]=(ny/len*.5+.5)*255;img.data[i+2]=(1/len*.5+.5)*255;img.data[i+3]=255}
        c.putImageData(img,0,0)},N,N,true);
      const colour=texture((c,W,H)=>{c.fillStyle='#1f5d6b';c.fillRect(0,0,W,H);for(let k=0;k<400;k++){c.fillStyle=Math.random()<.5?'rgba(16,58,70,.35)':'rgba(60,130,140,.25)';c.fillRect(Math.random()*W,Math.random()*H,3,3)}},64,64);
      const rough=texture((c,W,H)=>{c.fillStyle='#fff';c.fillRect(0,0,W,H)},4,4,true);
      for(const t of [normal,colour,rough]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(60,60)}
      return {normal,colour,rough};
    }
    // The sky is painted once, as it looks at sunrise with the sun just clear of the sea to the north; at night
    // the same painting is simply dimmed. It hangs on a ring that travels with the reader, inside the far plane.
    function skyTexture(){return texture((c,W,H)=>{
      const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#5a73a6');g.addColorStop(.45,'#9c8fb2');g.addColorStop(.72,'#e3a38e');g.addColorStop(.86,'#f7c585');g.addColorStop(.92,'#ffe0a8');g.addColorStop(1,'#e8ae7c');c.fillStyle=g;c.fillRect(0,0,W,H);
      for(let k=0;k<120;k++){c.fillStyle=`rgba(255,255,255,${Math.random()*.5})`;c.fillRect(Math.random()*W,Math.random()*H*.35,1.5,1.5)}
      const sx=W/2,sy=H*.8,glow=c.createRadialGradient(sx,sy,8,sx,sy,W*.22);glow.addColorStop(0,'rgba(255,232,170,1)');glow.addColorStop(.08,'rgba(255,196,110,.95)');glow.addColorStop(.35,'rgba(255,190,120,.35)');glow.addColorStop(1,'rgba(255,170,110,0)');c.fillStyle=glow;c.fillRect(0,0,W,H);
      c.fillStyle='#ffd27a';c.beginPath();c.arc(sx,sy,18,0,7);c.fill();c.fillStyle='#fff0c8';c.beginPath();c.arc(sx,sy,12,0,7);c.fill();
      for(let k=0;k<9;k++){const y=H*(.62+Math.random()*.2),x=Math.random()*W,w=80+Math.random()*220;c.fillStyle=`rgba(255,${170+Math.random()*50|0},${150+Math.random()*40|0},.35)`;c.beginPath();c.ellipse(x,y,w,4+Math.random()*5,0,0,7);c.fill()}
    },1024,512)}
    function sandTexture(){const t=texture((c,W,H)=>{c.fillStyle='#dcc392';c.fillRect(0,0,W,H);for(let k=0;k<5000;k++){c.fillStyle=['#c9ad7a','#e8d4a8','#bfa071','#f0e0bb'][k%4];c.fillRect(Math.random()*W,Math.random()*H,1.5,1.5)}},256,256);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(8,6);return t}
    function firstLanding(){try{return storage?.getItem('athenaeum-island-first')||null}catch(e){return null}}
    function daysAshore(){const first=firstLanding();if(!first)return 0;return Math.max(0,Math.floor((Date.now()-Number(first))/DAY_MS))}
    function calendarTexture(){const days=daysAshore();return texture((c,W,H)=>{
      c.fillStyle='#6b4f33';c.fillRect(0,0,W,H);c.strokeStyle='rgba(40,26,14,.5)';for(let k=0;k<30;k++){c.lineWidth=1;c.beginPath();const x=Math.random()*W;c.moveTo(x,0);c.lineTo(x+Math.random()*8-4,H);c.stroke()}
      c.strokeStyle='#2a1b0e';c.lineCap='round';for(let i=0;i<=Math.min(days,48);i++){const col=i%2,row=Math.floor(i/2),x=col?W*.62:W*.18,y=24+row*20,long=(i+1)%7===0;c.lineWidth=5;c.beginPath();c.moveTo(x,y);c.lineTo(x+(long?W*.32:W*.2),y);c.stroke()}
      c.fillStyle='#f1e0bd';c.textAlign='center';c.font='bold 26px Georgia';c.fillText(`DAY ${days+1}`,W/2,H-22)},160,560)}
    function inscriptionTexture(){return texture((c,W,H)=>{c.fillStyle='#6b4f33';c.fillRect(0,0,W,H);c.fillStyle='#2a1b0e';c.textAlign='center';c.font='bold 24px Georgia';c.fillText('I CAME ON SHORE HERE ON THE',W/2,36);c.fillText('30TH SEPTEMBER 1659',W/2,70)},512,90)}
    function mapTexture(){return texture((c,W,H)=>{
      c.fillStyle='#e6d3a3';c.fillRect(0,0,W,H);c.strokeStyle='rgba(120,80,40,.4)';c.lineWidth=14;c.strokeRect(0,0,W,H);
      c.fillStyle='#cbb07a';c.beginPath();c.ellipse(W/2,H/2+10,W*.36,H*.3,0,0,7);c.fill();c.strokeStyle='#6b4a2a';c.lineWidth=3;c.stroke();
      c.fillStyle='#4a6b3a';for(const [x,y] of [[.3,.5],[.62,.42],[.7,.58],[.4,.36],[.5,.66]]){c.beginPath();c.arc(W*x,H*y,7,0,7);c.fill()}
      c.strokeStyle='#8c2a22';c.lineWidth=6;const X=W*.26,Y=H*.62;c.beginPath();c.moveTo(X-12,Y-12);c.lineTo(X+12,Y+12);c.moveTo(X+12,Y-12);c.lineTo(X-12,Y+12);c.stroke();
      c.strokeStyle='#6b4a2a';c.setLineDash([4,6]);c.lineWidth=2;c.beginPath();c.moveTo(W*.5,H*.86);c.quadraticCurveTo(W*.3,H*.8,X,Y);c.stroke();c.setLineDash([]);
      c.fillStyle='#4a2c18';c.textAlign='center';c.font='italic bold 30px Georgia';c.fillText('Treasure Island',W/2,44);c.font='italic 20px Georgia';c.fillText('Dig where the X is marked on the western shore',W/2,H-20);
      c.font='bold 18px Georgia';c.fillText('N',W-40,40);c.beginPath();c.moveTo(W-40,50);c.lineTo(W-40,90);c.stroke()},512,384)}
    function footprintTexture(){return texture((c,W,H)=>{c.clearRect(0,0,W,H);c.fillStyle='rgba(120,90,50,.55)';c.beginPath();c.ellipse(W/2,H*.62,W*.26,H*.3,0,0,7);c.fill();c.beginPath();c.ellipse(W/2+4,H*.3,W*.2,H*.12,0,0,7);c.fill();for(let k=0;k<5;k++){c.beginPath();c.ellipse(W*(.28+k*.11),H*(.12-(k===0?0:.01*k)),6-k*.6,8-k*.6,0,0,7);c.fill()}},128,192)}

    // ---------- the boathouse, the sea and the sky ----------
    function buildWorld(){
      root=new THREE.Group();root.name='boathouse';
      const cx=(HOUSE.x0+HOUSE.x1)/2,cz=(HOUSE.z0+HOUSE.z1)/2;
      const sea=seaTextures();state.sea=sea;
      state.seaMat=std({map:sea.colour,normalMap:sea.normal,roughnessMap:sea.rough,normalScale:new THREE.Vector2(.55,.55),roughness:.32,metalness:.12});add(new THREE.PlaneGeometry(380,380),state.seaMat,cx,SEA_Y,250,root).rotation.x=-Math.PI/2;
      const skyGeometry=new THREE.CylinderGeometry(105,105,90,48,1,true);skyGeometry.scale(-1,1,1);// turned inside out, so it is seen from within
      const sky=add(skyGeometry,own(new THREE.MeshBasicMaterial({map:skyTexture(),fog:false})),cx,38,cz,root);sky.frustumCulled=false;state.sky=sky;
      // The boathouse: planked floor, three walls, a pitched roof and a wide mouth open to the sea.
      box(12,.3,10,MAT.wood,cx,-.15,cz,root);
      box(12,4.2,.3,MAT.wood2,cx,2.1,HOUSE.z1,root);box(.3,4.2,10,MAT.wood2,HOUSE.x0,2.1,cz,root);box(.3,4.2,10,MAT.wood2,HOUSE.x1,2.1,cz,root);
      for(const side of [-1,1]){const r=box(6.6,.2,10.6,MAT.darkWood,cx+side*3.1,4.9,cz,root);r.rotation.z=side*-.42}
      box(12.2,.3,.3,MAT.darkWood,cx,4.1,HOUSE.z0,root);for(const x of [HOUSE.x0,HOUSE.x1])cyl(.14,.16,4.2,8,MAT.darkWood,x,2.1,HOUSE.z0,root);
      // Lanterns either side of the open mouth, and one by the door.
      const lanternGlass=std({color:0xffe2b0,emissive:0xffb35c,emissiveIntensity:1.2,roughness:.6});
      for(const [x,z] of [[HOUSE.x0+1.2,HOUSE.z0+1],[HOUSE.x1-1.2,HOUSE.z0+1],[cx+2.2,HOUSE.z1-1]]){box(.22,.32,.22,lanternGlass,x,2.6,z,root);box(.3,.05,.3,MAT.brass,x,2.8,z,root);lamp(root,0xffb866,5.5,11,x,2.4,z)}
      // A shelf of sea books along the west wall.
      box(.36,.06,6.4,MAT.darkWood,HOUSE.x0+.35,.95,cz-.4,root);SEA_BOOKS.forEach((id,i)=>placeBook(id,root,HOUSE.x0+.38,1.5,cz-2.6+i*1.5,Math.PI/2));
      sign('BOOKS FOR A SEA VOYAGE',2.6,.36,root,HOUSE.x0+.18,2.45,cz-.4).rotation.y=Math.PI/2;
      // Barrels, oars and a coil of rope for company.
      for(const [x,z] of [[HOUSE.x1-1,HOUSE.z1-1.4],[HOUSE.x1-1.8,HOUSE.z1-1]]){cyl(.42,.36,1,14,MAT.wood2,x,.5,z,root);block(x,z,1,1)}
      for(const k of [0,1]){const oar=box(.08,2.8,.12,MAT.wood,HOUSE.x1-.3,1.4,cz+k*.5-1,root);oar.rotation.z=.18}
      cyl(.5,.5,.18,18,std({color:0x9c8458,roughness:1}),cx-3,.09,HOUSE.z1-1.5,root);
      // The door home.
      const exit={type:'isle-exit',title:'Back to the Grand Hall',author:'The lamplit hall is just the other side.',action:'RETURN'};
      const exitDoor=doorKit?.hang(root,{data:exit,mark,x:cx,z:HOUSE.z1-.2,yaw:Math.PI,label:'THE GRAND HALL',...DOOR_LOOK});if(exitDoor)porthole(exitDoor,std({color:0x3a2a18,emissive:0xffb35c,emissiveIntensity:.9,roughness:.3}));
      else{mark(box(1.9,3.1,.16,MAT.darkWood,cx,1.55,HOUSE.z1-.2,root),exit);for(const px of [-1.05,1.05])box(.16,3.35,.24,MAT.brass,cx+px,1.68,HOUSE.z1-.22,root);box(2.3,.16,.24,MAT.brass,cx,3.3,HOUSE.z1-.22,root)}
      // The jetty, and the boat at the end of it.
      const jx=(JETTY.x0+JETTY.x1)/2,jl=JETTY.z1-JETTY.z0;box(JETTY.x1-JETTY.x0,.2,jl,MAT.wood,jx,-.1,(JETTY.z0+JETTY.z1)/2,root);
      for(let z=JETTY.z0+.3;z<JETTY.z1;z+=3)for(const x of [JETTY.x0,JETTY.x1])cyl(.1,.12,1.6,8,MAT.darkWood,x,-.5,z,root);
      const post=cyl(.08,.08,1.8,8,MAT.darkWood,JETTY.x1-.2,.9,JETTY.z0+1.2,root);sign('TO THE ISLAND',1.3,.3,root,JETTY.x1-.2,1.65,JETTY.z0+1.25,).rotation.y=0;post.name='jetty-sign';
      state.boat=buildBoat(root,BOAT_START.x,BOAT_START.z,{type:'isle-boat',title:'A rowing boat',author:'The oars are shipped and the painter is loosely tied. Someone has left a note: “To the island, at first light.”',action:'ROW TO THE ISLAND'});
      scene.add(root);
    }
    function buildBoat(parent,x,z,data,yaw=0){
      const g=new THREE.Group();g.position.set(x,SEA_Y+.15,z);g.rotation.y=yaw;parent.add(g);
      const hull=std({color:0x6d4a2c,roughness:.85}),paint=std({color:0x2f5561,roughness:.8});
      const body=box(1.3,.5,3.2,hull,0,.2,0,g);box(1.36,.08,3.26,paint,0,.46,0,g);const bow=add(new THREE.ConeGeometry(.66,1.1,4),hull,0,.2,-2.05,g);bow.rotation.x=-Math.PI/2;bow.rotation.y=Math.PI/4;bow.scale.set(1,1,.45);
      for(const bz of [-.7,.6])box(1.2,.06,.3,MAT.wood,0,.42,bz,g);
      for(const side of [-1,1]){const oar=box(.06,.05,2.6,MAT.wood,side*.95,.5,.2,g);oar.rotation.y=side*.22}
      if(data){mark(body,data);mark(bow,data)}
      return g;
    }

    // ---------- the island ----------
    function buildIsland(){
      isle=new THREE.Group();isle.name='crusoe-island';
      const {x:ix,z:iz}=ISLE;
      const shallows=add(new THREE.CylinderGeometry(1,1,.1,48),std({color:0x3fa5a0,roughness:.3,metalness:.05}),ix,SEA_Y+.07,iz,isle);shallows.scale.set(SAND.rx+4,1,SAND.rz+4);
      const beach=add(new THREE.CylinderGeometry(1,1.08,.9,48),std({map:sandTexture(),roughness:1}),ix,-.45,iz,isle);beach.scale.set(SAND.rx,1,SAND.rz);
      // A green hill with rocks behind the camp, to the north, where the sun comes up.
      const hill=add(new THREE.SphereGeometry(1,24,12),std({color:0x5f7f36,roughness:1}),ix-2,-.8,iz-19,isle);hill.scale.set(14,5.5,7.5);
      const rock=std({color:0x7d7468,roughness:1,flatShading:true});for(const [x,y,z,s] of [[ix-10,.6,iz-15,1.6],[ix+8,.8,iz-16,2],[ix+13,.3,iz-11,1.2],[ix-15,.2,iz-9,1.1]]){const r=add(new THREE.DodecahedronGeometry(s,0),rock,x,y,z,isle);r.scale.y=.7}
      buildPalms(ix,iz);
      // Crusoe's camp: a stockade of stakes, a hut inside, and a fire at the gate.
      const cx=ix-4,cz=iz-6,stakes=[],R=4.2;for(let a=0;a<Math.PI*2;a+=.16){if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a))-Math.PI/2)<.42)continue;stakes.push([cx+Math.cos(a)*R,cz+Math.sin(a)*R])}
      const stakeGeo=own(new THREE.CylinderGeometry(.08,.11,2.3,6)),stakeMat=std({color:0x5c4630,roughness:1}),stakeMesh=new THREE.InstancedMesh(stakeGeo,stakeMat,stakes.length),m=new THREE.Matrix4();
      stakes.forEach(([x,z],i)=>{m.makeTranslation(x,1.1,z);stakeMesh.setMatrixAt(i,m);block(x,z,.4,.4)});stakeMesh.instanceMatrix.needsUpdate=true;isle.add(stakeMesh);
      box(3,2,2.4,MAT.wood2,cx-.5,1,cz-1.6,isle);const roof=add(new THREE.ConeGeometry(2.5,1.6,4),std({color:0xb49b62,roughness:1}),cx-.5,2.8,cz-1.6,isle);roof.rotation.y=Math.PI/4;block(cx-.5,cz-1.6,3.4,2.8);
      box(.9,1.5,.05,std({color:0x1a120b,roughness:1}),cx-.5,.75,cz-.38,isle);
      box(1.4,.08,.8,MAT.wood2,cx+1.6,.8,cz-1,isle);for(const [dx,dz] of [[-.6,-.3],[.6,-.3],[-.6,.3],[.6,.3]])box(.08,.8,.08,MAT.wood2,cx+1.6+dx,.4,cz-1+dz,isle);block(cx+1.6,cz-1,1.6,1);
      const fx=cx+1,fz=cz+6.2;const stone=std({color:0x6e6860,roughness:1});for(let k=0;k<8;k++){const a=k/8*Math.PI*2;add(new THREE.DodecahedronGeometry(.16,0),stone,fx+Math.cos(a)*.55,.08,fz+Math.sin(a)*.55,isle)}
      for(const a of [0,1.1,2.2]){const log=cyl(.07,.07,1,6,MAT.darkWood,fx,.12,fz,isle);log.rotation.set(Math.PI/2,a,0)}
      const flameMat=own(new THREE.MeshBasicMaterial({color:0xffa040})),coreMat=own(new THREE.MeshBasicMaterial({color:0xffe08a}));
      for(const [m2,s,dx] of [[flameMat,1,0],[coreMat,.6,.05],[flameMat,.7,-.12]]){const f=add(new THREE.ConeGeometry(.2*s,.7*s,7),m2,fx+dx,.45*s,fz,isle);flames.push({mesh:f,base:s,phase:Math.random()*6})}
      lamp(isle,0xff9a4a,5,10,fx,.9,fz);block(fx,fz,1.3,1.3);
      // The calendar: a great cross by the shore with a notch for every day.
      const kx=ix+1.2,kz=iz-2.5,postTex=calendarTexture();
      const post=box(.3,2.6,.3,MAT.wood2,kx,1.3,kz,isle),bar=box(1.7,.3,.26,MAT.wood2,kx,2.05,kz,isle);
      const face=add(new THREE.PlaneGeometry(.26,.9),std({map:postTex,roughness:1}),kx,1,kz+.16,isle),words=add(new THREE.PlaneGeometry(1.6,.28),std({map:inscriptionTexture(),roughness:1}),kx,2.05,kz+.14,isle);
      const calendarData={type:'isle-calendar',title:'Crusoe’s calendar',author:'',action:'READ'};for(const part of [post,bar,face,words])mark(part,calendarData);state.calendar={face,data:calendarData};block(kx,kz,.6,.6);
      // Poll on her perch. She says nothing unless spoken to.
      const px=ix-8.8,pz=iz-1.8;cyl(.05,.06,1.6,8,MAT.darkWood,px,.8,pz,isle);box(.7,.05,.05,MAT.darkWood,px,1.6,pz,isle);block(px,pz,.5,.5);
      const poll=new THREE.Group();poll.position.set(px,1.62,pz);isle.add(poll);
      const green=std({color:0x2f8f45,roughness:.7}),red=std({color:0xc0392b,roughness:.7}),grey=std({color:0x3a3a3a,roughness:.6});
      const body=add(new THREE.SphereGeometry(.13,12,10),green,0,.2,0,poll);body.scale.set(1,1.45,1);const head=add(new THREE.SphereGeometry(.09,12,10),red,0,.43,.02,poll);
      const beak=add(new THREE.ConeGeometry(.035,.09,8),grey,0,.42,.11,poll);beak.rotation.x=Math.PI/2;const tail=box(.07,.26,.03,green,0,.05,-.1,poll);tail.rotation.x=.45;
      for(const side of [-1,1]){const wing=box(.03,.2,.14,std({color:0xe0b43a,roughness:.7}),side*.12,.22,-.01,poll);wing.rotation.z=side*.12}
      const pollData={type:'isle-poll',title:'Poll the parrot',author:'She watches you with one bright eye.',action:'SPEAK TO POLL'};for(const part of [body,head,beak,tail])mark(part,pollData);state.poll={group:poll,head};
      // The castaways' library: a driftwood shelf, and Crusoe's own story on a sea chest.
      const drift=std({color:0x9a8b72,roughness:1}),sx=ix+10.8,sz=iz-2.5;
      for(const y of [.95,2.05])box(.4,.08,4.4,drift,sx,y,sz,isle);for(const dz of [-2.1,2.1])box(.12,2.4,.12,drift,sx,1.2,sz+dz,isle);block(sx,sz,.7,4.6);
      SHELF_BOOKS.forEach((id,i)=>{const row=i<3?0:1,col=row?i-3:i;placeBook(id,isle,sx-.03,row?2.6:1.5,sz-1.4+col*(row?2.8:1.4)+(row?-.0:0),-Math.PI/2)});
      sign('THE CASTAWAYS’ LIBRARY',2.4,.34,isle,sx-.22,3.2,sz).rotation.y=-Math.PI/2;
      const chestX=ix+8.6,chestZ=iz+2.5;box(1.1,.6,.7,MAT.darkWood,chestX,.3,chestZ,isle);box(1.14,.06,.74,MAT.brass,chestX,.62,chestZ,isle);placeBook(CRUSOE,isle,chestX,.92,chestZ,0,-.9,true);// his own copy, kept here even when the book stands elsewhere tooblock(chestX,chestZ,1.3,.9);
      // Stevenson's map, and a mark on the western shore.
      const mx=ix+5.5,mz=iz+8.5;cyl(.06,.06,1.8,8,MAT.darkWood,mx,.9,mz,isle);const mapBoard=add(new THREE.PlaneGeometry(1.2,.9),std({map:mapTexture(),roughness:.9}),mx,1.55,mz+.05,isle);
      mark(mapBoard,{type:'isle-map',title:'A map pinned to a post',author:'Stevenson’s island, with an X on its western shore. This island has a western shore too.',action:'READ'});block(mx,mz,.4,.4);
      const dx=ix-12.5,dz=iz+6.5,sandMat=std({color:0xcfb383,roughness:1});const mound=add(new THREE.SphereGeometry(.7,14,8),sandMat,dx,-.25,dz,isle);mound.scale.y=.5;
      const xMat=std({color:0x5a3a20,roughness:1});for(const r of [.8,-.8]){const bar2=box(.9,.03,.12,xMat,dx,.1,dz,isle);bar2.rotation.y=r}
      const digData={type:'isle-dig',title:'A mark in the sand',author:'Someone has scratched an X here, and left a spade.',action:'DIG'};mark(mound,digData);
      const spade=box(.08,1.1,.05,MAT.darkWood,dx+.9,.55,dz-.3,isle);spade.rotation.z=.25;mark(spade,digData);
      const chest=new THREE.Group();chest.position.set(dx,-1,dz);isle.add(chest);box(.8,.45,.5,MAT.darkWood,0,.22,0,chest);for(const bx of [-.3,.3])box(.05,.47,.52,MAT.brass,bx,.22,0,chest);
      const lid=new THREE.Group();lid.position.set(0,.45,-.25);chest.add(lid);box(.82,.12,.52,MAT.darkWood,0,.06,.25,lid);chest.visible=false;
      state.chest={group:chest,lid,mound,x:dx,z:dz};block(dx,dz,1.1,1.1);
      // The footprint.
      const fpx=ix-16,fpz=iz+4;const print=add(new THREE.PlaneGeometry(.34,.52),own(new THREE.MeshBasicMaterial({map:footprintTexture(),transparent:true,depthWrite:false,color:0xd2b88a})),fpx,.012,fpz,isle);print.rotation.x=-Math.PI/2;print.rotation.z=.4;
      mark(print,{type:'isle-footprint',title:'A footprint',author:'A single bare footprint, and no others near it.',action:'LOOK CLOSER'});
      // The spyglass on the eastern point, and a ship far out.
      const gx=ix+16.5,gz=iz-1;for(const a of [0,2.1,4.2]){const leg=cyl(.025,.025,1.3,6,MAT.darkWood,gx+Math.cos(a)*.22,.62,gz+Math.sin(a)*.22,isle);leg.rotation.set(Math.sin(a)*.18,0,-Math.cos(a)*.18)}
      const glassTube=cyl(.06,.045,.9,10,MAT.brass,gx,1.32,gz,isle);glassTube.rotation.z=Math.PI/2;mark(glassTube,{type:'isle-spyglass',title:'A brass spyglass',author:'Trained on the eastern horizon.',action:'LOOK THROUGH'});block(gx,gz,.7,.7);
      state.ship=buildShip();
      buildCamp(ix,iz,cx,cz);
      // The signal fire, built and waiting.
      const sfx=ix+11,sfz=iz+7.5;for(let k=0;k<6;k++){const a=k/6*Math.PI*2,log=cyl(.06,.07,1.6,6,MAT.darkWood,sfx+Math.cos(a)*.22,.7,sfz+Math.sin(a)*.22,isle);log.rotation.set(Math.sin(a)*.32,0,-Math.cos(a)*.32)}
      const fireData={type:'isle-fire',title:'A signal fire',author:'Dry wood and palm leaves, stacked ready. A passing ship would see its smoke.',action:'LIGHT THE SIGNAL FIRE'};mark(add(new THREE.ConeGeometry(.55,1.1,7),std({color:0x7d6a45,roughness:1}),sfx,.55,sfz,isle),fireData);block(sfx,sfz,1.2,1.2);
      state.fire={x:sfx,z:sfz,flames:[],light:null};
      // The boat drawn up on the beach, for rowing home.
      buildBoat(isle,ix+2.6,iz+14.4,{type:'isle-return',title:'The rowing boat',author:'Drawn up on the sand, ready for the row home.',action:'ROW BACK TO THE BOATHOUSE'},Math.PI/2);
      state.bottle=add(new THREE.CylinderGeometry(.07,.08,.32,10),std({color:0x5f8f78,roughness:.2,metalness:.1}),BOAT_START.x-1.8,SEA_Y+.05,lerp(BOAT_START.z,LANDING.z,.52),root||isle);state.bottle.rotation.z=1.3;
      scene.add(isle);
    }
    function buildPalms(ix,iz){
      const spots=[[-17,1],[-14,-8],[-10,9],[10,8],[15,2],[11,-10],[6,-14],[-6,-15],[-20,-4],[3,11]],segs=7,trunks=[],fronds=[];
      for(const [dx,dz] of spots){
        const x=ix+dx,z=iz+dz,lean=(Math.random()-.5)*.5,dir=Math.random()*Math.PI*2;let px=x,py=0,pz=z;
        for(let s=0;s<segs;s++){const bend=lean*s/segs;px+=Math.cos(dir)*bend*.35;pz+=Math.sin(dir)*bend*.35;trunks.push([px,py+.45,pz,bend,dir,1-s*.06]);py+=.88}
        for(let k=0;k<8;k++)fronds.push([px,py,pz,k/8*Math.PI*2+Math.random()*.3]);block(x,z,.7,.7);
      }
      const m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),s=new THREE.Vector3(),p=new THREE.Vector3();
      const trunk=new THREE.InstancedMesh(own(new THREE.CylinderGeometry(.16,.21,.95,7)),std({color:0x6b5237,roughness:.95}),trunks.length);
      trunks.forEach(([x,y,z,bend,dir,scale],i)=>{e.set(Math.sin(dir)*bend*.6,0,-Math.cos(dir)*bend*.6);q.setFromEuler(e);s.set(scale,1,scale);p.set(x,y,z);m.compose(p,q,s);trunk.setMatrixAt(i,m)});
      const frond=new THREE.InstancedMesh(own(new THREE.BoxGeometry(2.8,.03,.5)),std({color:0x3d6b2d,roughness:.8}),fronds.length);
      fronds.forEach(([x,y,z,a],i)=>{e.set(0,a,-.38,'YXZ');q.setFromEuler(e);s.set(1,1,1);p.set(x+Math.cos(a)*1.25,y-.35,z-Math.sin(a)*1.25);m.compose(p,q,s);frond.setMatrixAt(i,m)});
      trunk.instanceMatrix.needsUpdate=frond.instanceMatrix.needsUpdate=true;isle.add(trunk,frond);
    }
    // ---------- Crusoe's life on the island ----------
    function quoteMark(object,title,key,action='LOOK'){return mark(object,{type:'isle-says',title,author:'',key,action})}
    function buildCamp(ix,iz,cx,cz){
      const hide=std({color:0x7d5d3c,roughness:1}),hideDark=std({color:0x5d4329,roughness:1}),skin=std({color:0xc98d64,roughness:.8}),earth=std({color:0x6b5135,roughness:1});
      state.robinson=buildRobinson(ix-1.4,iz+2.2,hide,hideDark,skin);
      // His old dog, lying at his right hand with his head on his paws.
      const dog=new THREE.Group();dog.position.set(ix-2.2,0,iz+2.6);dog.rotation.y=.3;isle.add(dog);const coat=std({color:0x8c7a62,roughness:1}),muzzle=std({color:0x5b4a38,roughness:1});
      const dparts=[box(.3,.24,.68,coat,0,.14,0,dog),box(.2,.18,.24,coat,0,.14,.44,dog),box(.12,.1,.16,muzzle,0,.1,.6,dog),box(.06,.13,.08,muzzle,-.1,.14,.42,dog),box(.06,.13,.08,muzzle,.1,.14,.42,dog),
        box(.08,.06,.3,coat,-.09,.03,.5,dog),box(.08,.06,.3,coat,.09,.03,.5,dog),box(.24,.08,.26,coat,0,.06,-.22,dog)];const tail=box(.05,.05,.34,coat,.1,.06,-.48,dog);tail.rotation.y=.4;dparts.push(tail);
      for(const part of dparts)quoteMark(part,'Crusoe’s dog','dog','PAT THE DOG');block(ix-2.2,iz+2.6,.7,1);
      // The goats in their pen, and the pen's stakes.
      const px=ix-13.5,pz=iz-2.5,pw=3.2,pd=2.6,wattle=std({color:0x6a5338,roughness:1}),posts=[];
      for(let k=0;k<=8;k++){const f=k/8;posts.push([px-pw/2+f*pw,pz-pd/2],[px-pw/2+f*pw,pz+pd/2])}for(let k=1;k<6;k++){const f=k/6;posts.push([px-pw/2,pz-pd/2+f*pd],[px+pw/2,pz-pd/2+f*pd])}
      const postMesh=new THREE.InstancedMesh(own(new THREE.CylinderGeometry(.04,.05,1.1,5)),wattle,posts.length),m=new THREE.Matrix4();posts.forEach(([x,z],i)=>{m.makeTranslation(x,.55,z);postMesh.setMatrixAt(i,m)});postMesh.instanceMatrix.needsUpdate=true;isle.add(postMesh);
      for(const y of [.45,.85]){for(const z of [pz-pd/2,pz+pd/2])box(pw,.06,.05,wattle,px,y,z,isle);for(const x of [px-pw/2,px+pw/2])box(.05,.06,pd,wattle,x,y,pz,isle)}
      block(px,pz,pw+.3,pd+.3);
      const coats=[0xe8e0d0,0x7a5a3c,0xb9a58a];
      coats.forEach((c,i)=>{const g=new THREE.Group(),coat=std({color:c,roughness:1}),horn=std({color:0x3b3127,roughness:.8});g.position.set(px-.8+i*.8,0,pz-.4+(i%2)*.8);isle.add(g);
        const parts=[box(.24,.26,.56,coat,0,.5,0,g)];const head=new THREE.Group();head.position.set(0,.62,.32);g.add(head);parts.push(box(.15,.17,.24,coat,0,0,.08,head));
        for(const side of [-1,1]){const h=add(new THREE.ConeGeometry(.025,.18,5),horn,side*.05,.13,0,head);h.rotation.x=-.5;parts.push(h)}
        for(const [lx,lz] of [[-.08,-.2],[.08,-.2],[-.08,.2],[.08,.2]])parts.push(box(.05,.38,.05,coat,lx,.19,lz,g));
        for(const part of parts)mark(part,{type:'isle-goat',title:'Crusoe’s goats',author:'',action:'LOOK'});
        state.goats.push({group:g,head,x:g.position.x,z:g.position.z,phase:i*2.1})});
      // The barley that came up by the rock.
      const bx=ix+3.6,bz=iz-7.2;quoteMark(box(2.4,.08,1.4,earth,bx,.04,bz,isle),'A patch of barley','barley');block(bx,bz,2.6,1.6);
      const stalks=[];for(let k=0;k<64;k++)stalks.push([bx-1.1+(k%16)*.147+(Math.random()-.5)*.05,bz-.6+Math.floor(k/16)*.4+(Math.random()-.5)*.08]);
      const stalk=new THREE.InstancedMesh(own(new THREE.CylinderGeometry(.008,.012,.7,4)),std({color:0x7f9a3e,roughness:1}),stalks.length),ear=new THREE.InstancedMesh(own(new THREE.CylinderGeometry(.025,.018,.14,5)),std({color:0xc7b25a,roughness:1}),stalks.length);
      stalks.forEach(([x,z],i)=>{m.makeTranslation(x,.42,z);stalk.setMatrixAt(i,m);m.makeTranslation(x,.82,z);ear.setMatrixAt(i,m)});stalk.instanceMatrix.needsUpdate=ear.instanceMatrix.needsUpdate=true;isle.add(stalk,ear);quoteMark(stalk,'A patch of barley','barley');quoteMark(ear,'A patch of barley','barley');
      // The great canoe, hollowed out of a cedar and never launched, with the stump it came from.
      const kx=ix+2,kz=iz-11.2,cedar=std({color:0x8a5a3a,roughness:.95});const log=cyl(.6,.55,5.5,14,cedar,kx,.45,kz,isle);log.rotation.z=Math.PI/2;
      const hollow=box(4.8,.04,.8,std({color:0x4a2e1c,roughness:1}),kx,1.04,kz,isle);quoteMark(log,'The great canoe','canoe');quoteMark(hollow,'The great canoe','canoe');block(kx,kz,5.8,1.4);
      const stump=cyl(.85,.95,.5,14,cedar,ix+6.6,.25,iz-11.6,isle);quoteMark(stump,'The great canoe','canoe');block(ix+6.6,iz-11.6,1.9,1.9);
      for(let k=0;k<8;k++){const chip=box(.12,.02,.06,cedar,kx-2+Math.random()*4.5,.02,kz+.9+Math.random()*.5,isle);chip.rotation.y=Math.random()*3}
      // Inside the stockade: his two earthen jars in their wicker baskets.
      const clay=std({color:0x9c5a36,roughness:.95}),wicker=std({color:0xa98b5a,roughness:1});
      for(const [x,z] of [[cx-2.2,cz+1.6],[cx-1.4,cz+2]]){const jar=add(new THREE.SphereGeometry(.3,12,10),clay,x,.42,z,isle);jar.scale.y=1.2;const basket=cyl(.34,.28,.36,12,wicker,x,.18,z,isle);quoteMark(jar,'Two earthen jars','pots');quoteMark(basket,'Two earthen jars','pots');block(x,z,.8,.8)}
      // On his table: the heap of coins from the wreck, and his journal.
      const tx=cx+1.6,tz=cz-1,gold=std({color:0xd4a640,roughness:.35,metalness:.8});
      for(let k=0;k<9;k++){const coin=cyl(.045,.045,.012,10,gold,tx-.4+Math.random()*.2,.85+k*.008,tz-.1+Math.random()*.2,isle);coin.rotation.x=(Math.random()-.5)*.3;quoteMark(coin,'A heap of money','money')}
      const paper=std({color:0xe8dcbc,roughness:.9}),journal=new THREE.Group();journal.position.set(tx+.25,.86,tz);journal.rotation.y=-.2;isle.add(journal);
      for(const side of [-1,1]){const leaf=box(.17,.02,.24,paper,side*.09,0,0,journal);leaf.rotation.z=side*-.08;mark(leaf,{type:'isle-journal',title:'Crusoe’s journal',author:'Kept until the ink ran out.',action:'READ'})}
      mark(box(.36,.012,.25,hideDark,0,-.015,0,journal),{type:'isle-journal',title:'Crusoe’s journal',author:'Kept until the ink ran out.',action:'READ'});
      // Grapes drying on a line, between two posts.
      const rx=ix+5.5,rz=iz-4;for(const dx of [-1.5,1.5])cyl(.06,.07,1.9,6,MAT.darkWood,rx+dx,.95,rz,isle);box(3.1,.02,.02,wattle,rx,1.82,rz,isle);
      const grapes=[];for(let k=0;k<7;k++)for(let row=0;row<4;row++)for(let n=0;n<=3-row;n++)grapes.push([rx-1.2+k*.4+(n-(3-row)/2)*.055,1.74-row*.06-(k%2)*.03,rz+((n+row)%2-.5)*.04]);
      const bunch=new THREE.InstancedMesh(own(new THREE.SphereGeometry(.032,6,4)),std({color:0x4a2440,roughness:.6}),grapes.length);grapes.forEach(([x,y,z],i)=>{m.makeTranslation(x,y,z);bunch.setMatrixAt(i,m)});bunch.instanceMatrix.needsUpdate=true;isle.add(bunch);
      quoteMark(bunch,'Raisins of the sun','raisins');for(let k=0;k<7;k++)quoteMark(box(.14,.24,.1,own(new THREE.MeshBasicMaterial({visible:false})),rx-1.2+k*.4,1.65,rz,isle),'Raisins of the sun','raisins');block(rx,rz,3.3,.4);
      // The wreck of his ship on the reef, showing at low water.
      const wreck=new THREE.Group();wreck.position.set(ix+34,SEA_Y,iz-9);wreck.rotation.set(.12,.7,-.32);isle.add(wreck);const timber=std({color:0x2c2118,roughness:1});
      box(2.2,1.6,8,timber,0,.3,0,wreck);box(2.3,.2,3,timber,0,1.2,-2.4,wreck);const mast=cyl(.12,.14,4,6,timber,0,2.6,-.6,wreck);mast.rotation.z=.25;
      for(let k=0;k<5;k++){const rib=box(.14,1.5,.14,timber,1.1,1.2,1.4+k*.55,wreck);rib.rotation.z=-.3}
      for(const [x,z,r] of [[-3,-2,1.4],[2.5,3,1.1],[-1.5,4,.9]]){const rock2=add(new THREE.DodecahedronGeometry(r,0),std({color:0x5e5850,roughness:1,flatShading:true}),ix+34+x,SEA_Y,iz-9+z,isle);rock2.scale.y=.5}
    }
    // Robinson as he describes himself: a high shapeless goatskin cap with a flap behind, a goatskin jacket and
    // open-kneed breeches, a broad belt with a saw and a hatchet, a beard, and an umbrella of skins.
    function buildRobinson(x,z,hide,hideDark,skin){
      const g=new THREE.Group();g.position.set(x,0,z);isle.add(g);const parts=[];const p=(mesh)=>{parts.push(mesh);return mesh};
      for(const side of [-1,1]){p(box(.12,.08,.24,hideDark,side*.11,.04,.04,g));p(cyl(.055,.06,.42,8,skin,side*.11,.28,0,g));p(cyl(.1,.09,.36,8,hide,side*.11,.66,0,g))}
      p(cyl(.21,.25,.7,12,hide,0,1.12,0,g));p(cyl(.255,.255,.07,12,hideDark,0,.92,0,g));
      p(box(.05,.22,.18,MAT.brass,.27,.86,.02,g));p(box(.04,.3,.1,MAT.darkWood,-.27,.84,.04,g));
      const left=p(cyl(.055,.05,.62,8,hide,-.28,1.15,0,g));left.rotation.z=-.12;p(add(new THREE.SphereGeometry(.05,8,6),skin,-.33,.84,0,g));
      const right=p(cyl(.055,.05,.5,8,hide,.27,1.3,.12,g));right.rotation.x=-.9;p(add(new THREE.SphereGeometry(.05,8,6),skin,.29,1.42,.33,g));
      const head=new THREE.Group();head.position.set(0,1.62,0);g.add(head);
      p(add(new THREE.SphereGeometry(.13,12,10),skin,0,0,0,head));const beard=p(add(new THREE.ConeGeometry(.12,.26,8),std({color:0x5a4632,roughness:1}),0,-.11,.07,head));beard.rotation.x=Math.PI+.25;
      p(add(new THREE.ConeGeometry(.17,.38,8),hide,0,.26,-.01,head));p(box(.26,.22,.04,hide,0,.02,-.13,head));
      const umbrella=new THREE.Group();umbrella.position.set(.29,1.42,.33);umbrella.rotation.x=-.25;g.add(umbrella);
      p(cyl(.015,.015,1.15,6,MAT.darkWood,0,.55,0,umbrella));const canopy=p(add(new THREE.SphereGeometry(.8,14,6,0,Math.PI*2,0,Math.PI/2.4),std({color:0x6e5235,roughness:1,side:THREE.DoubleSide}),0,1,0,umbrella));canopy.scale.y=.55;
      const data={type:'isle-robinson',title:'Robinson Crusoe',author:'Eight-and-twenty years on this island, by his own count.',action:'SPEAK TO ROBINSON'};
      for(const part of parts)mark(part,data);block(x,z,.7,.7);
      return {group:g,head,x,z,talk:0,yaw:0};
    }
    function isFriday(){return new Date().getDay()===5}
    function speakRobinson(){
      const r=state.robinson;if(!r)return;let line;
      if(state.footprintSeen&&!r.footprint){r.footprint=true;line=ROBINSON_FOOTPRINT}
      else if(isFriday()&&!r.friday){r.friday=true;line=ROBINSON_FRIDAY}
      else line=ROBINSON[state.heard++%ROBINSON.length];
      r.talk=2.2;sound?.(130,.25,'triangle',.05);setTimeout(()=>sound?.(110,.2,'triangle',.04),240);
      showNotice(line.say?`${line.before} “${line.say}”`:line.before,10);
    }
    function journalEntry(date=new Date()){
      const key=`${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`,order=k=>{const [mm,dd]=k.split('-').map(Number);return ((mm+3)%12)*40+dd};
      const today=order(key);let found=JOURNAL[JOURNAL.length-1];for(const entry of JOURNAL)if(order(entry[0])<=today)found=entry;
      return {entry:found,exact:found[0]===key};
    }
    function readJournal(){
      const {entry:[key,year,text],exact}=journalEntry(),[mm,dd]=key.split('-').map(Number);
      const when=`${dd} ${['January','February','March','April','May','June','July','August','September','October','November','December'][mm-1]} ${year}`;
      showNotice(`${exact?`Crusoe’s journal, open at today’s date, ${when}`:`Crusoe’s journal has nothing for today’s date. The last entry before it, ${when}`}: “${text}”`,12);
    }
    function buildShip(){
      const g=new THREE.Group();g.position.set(SHIP.x,SEA_Y+.4,SHIP.z);g.rotation.y=Math.PI/2;isle.add(g);
      const dark=std({color:0x2c2118,roughness:.9}),sail=std({color:0xf1e6cf,roughness:.9});
      box(1.8,1.1,7,dark,0,.2,0,g);for(const [mz,h] of [[-2,6],[0,7.2],[2.2,5.4]]){cyl(.08,.1,h,6,dark,0,h/2+.6,mz,g);for(const y of [h*.45,h*.8])box(2.4,h*.32,.05,sail,0,y+.6,mz+.12,g)}
      return g;
    }

    // ---------- where the reader can walk ----------
    const inRect=(r,x,z)=>x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1;
    const inEllipse=(x,z,rx,rz)=>((x-ISLE.x)/rx)**2+((z-ISLE.z)/rz)**2<1;
    function zoneAt(x,z){if(travel)return 'boathouse';if(inRect(HOUSE,x,z)||inRect(JETTY,x,z))return 'boathouse';if(inEllipse(x,z,SAND.rx,SAND.rz))return 'crusoe-island';return null}
    function contains(x,z){return inRect(HOUSE,x,z)||inRect(JETTY,x,z)||inEllipse(x,z,SAND.rx,SAND.rz)}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      const r=player.radius||.42;
      if(inEllipse(x,z,SAND.rx,SAND.rz)){if(!isle||!inEllipse(x,z,ISLE.rx-r,ISLE.rz-r))return false}
      else{const house={x0:HOUSE.x0+.4,x1:HOUSE.x1-.4,z0:HOUSE.z0,z1:HOUSE.z1-.4},fits=(px,pz)=>inRect(house,px,pz)||inRect(JETTY,px,pz);for(const [dx,dz] of [[r,0],[-r,0],[0,r],[0,-r],[r*.7,r*.7],[-r*.7,r*.7],[r*.7,-r*.7],[-r*.7,-r*.7]])if(!fits(x+dx,z+dz))return false}
      return !blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ);
    }
    const onSand=(x,z)=>!!isle&&inEllipse(x,z,SAND.rx,SAND.rz);

    // ---------- the sunrise ----------
    // Reuses the library's own moonlight and sky light: coloured and turned toward the rising sun while the
    // reader is out here, and put back exactly as they were on the way home. No new lights, no new shaders.
    const NIGHT={background:new THREE.Color(0x070a14),fog:new THREE.Color(0x0e1520),sky:new THREE.Color(0x1b2433),sea:new THREE.Color(0x2c434d)},DAWN={background:new THREE.Color(0x6d86b8),fog:new THREE.Color(0xf0c49c),sky:new THREE.Color(0xffffff),sun:new THREE.Color(0xffc27d),skyLight:new THREE.Color(0xffe0bd),ground:new THREE.Color(0xd8b27c)};
    const tmp=new THREE.Color(),sunPosition=new THREE.Vector3(0,22,-100);
    function applyAtmosphere(d){
      if(!applied){saved={background:scene.background.clone(),fogDensity:scene.fog.density,moonColor:moon.color.clone(),moonPosition:moon.position.clone(),skyColor:ambient.color.clone(),groundColor:ambient.groundColor?.clone()}}
      applied=true;
      scene.background.copy(NIGHT.background).lerp(DAWN.background,d);scene.fog.color.copy(NIGHT.fog).lerp(DAWN.fog,d);scene.fog.density=lerp(.012,.0045,d);
      state.sky?.material.color.copy(NIGHT.sky).lerp(DAWN.sky,d);state.seaMat?.color.copy(NIGHT.sea).lerp(DAWN.sky,d);
      moon.color.copy(saved.moonColor).lerp(DAWN.sun,d);moon.intensity=lerp(1.1,2.5,d);moon.position.copy(saved.moonPosition).lerp(sunPosition,d);
      ambient.color.copy(saved.skyColor).lerp(DAWN.skyLight,d);if(ambient.groundColor)ambient.groundColor.copy(saved.groundColor).lerp(DAWN.ground,d);ambient.intensity=lerp(1.3,1.75,d);
      renderer.toneMappingExposure=lerp(1.85,1.4,d);
    }
    function restoreAtmosphere(){if(!applied||!saved)return;scene.background.copy(saved.background);scene.fog.color.copy(saved.background);scene.fog.density=saved.fogDensity;moon.color.copy(saved.moonColor);moon.position.copy(saved.moonPosition);ambient.color.copy(saved.skyColor);if(ambient.groundColor)ambient.groundColor.copy(saved.groundColor);applied=false}

    // ---------- journeys ----------
    function boatAt(p){return {x:BOAT_START.x,z:lerp(BOAT_START.z,LANDING.z+1.4,p)}}
    function startCrossing(){
      if(travel||transition)return;if(!isle)buildIsland();
      travel={t:0,duration:isReducedMotion()?14:36,stroke:0};state.bottleSeen=false;
      showNotice('You untie the boat and push off. The oars dip, and the boathouse lamps grow small behind you.',6);analytics?.track('Journey Taken',{journey:'crusoe-island'});
    }
    function finishCrossing(){
      travel=null;state.boat.position.set(BOAT_START.x,SEA_Y+.15,BOAT_START.z);landed=true;dawn=1;
      try{if(!firstLanding())storage?.setItem('athenaeum-island-first',String(Date.now()))}catch(e){}
      refreshCalendar();move(LANDING.x,LANDING.z-.4,0);
      showNotice('Sunrise. The boat grounds on a small island. Somewhere nearby, someone has been counting the days.',7);
    }
    function refreshCalendar(){if(!state.calendar)return;const material=state.calendar.face.material,old=material.map;material.map=calendarTexture();material.needsUpdate=true;if(old){old.dispose();owned.splice(owned.indexOf(old),1)}}
    function beginTransition(action,message){if(transition)return;transition={t:0,action,message,done:false}}
    function goHome(){beginTransition(()=>{landed=false;dawn=0;move(HALL_SPOT.x,HALL_SPOT.z,HALL_SPOT.yaw)},'The Grand Hall again, lamplit and dry. Your boots still have sand on them.')}

    // ---------- interaction ----------
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('isle-'))return false;
      if(transition||travel)return true;
      switch(data.type){
        case 'isle-door':through(data,enter);return true;
        case 'isle-exit':through(data,()=>{move(HALL_SPOT.x,HALL_SPOT.z,HALL_SPOT.yaw);playSample?.('doorOpen',.8,1);showNotice('The Grand Hall again. Behind you, faintly, the sea.',4)});return true;
        case 'isle-boat':startCrossing();return true;
        case 'isle-return':beginTransition(()=>{landed=false;dawn=0;move(-420,321.5,Math.PI)},'Back at the boathouse. Behind you, the sea is dark again.');return true;
        case 'isle-calendar':{const days=daysAshore();showNotice(`${QUOTES.calendar} You first came ashore ${days?`${days} day${days===1?'':'s'} ago`:'today'}.`,9);return true}
        case 'isle-poll':state.pollTalk=1.6;sound?.(1500,.16,'sawtooth',.045);setTimeout(()=>sound?.(1900,.12,'square',.03),160);showNotice(QUOTES.poll,6);return true;
        case 'isle-footprint':state.footprintSeen=true;showNotice(QUOTES.footprint,10);analytics?.track('Secret Found',{secret:'crusoe-footprint'});return true;
        case 'isle-map':showNotice(data.author,6);return true;
        case 'isle-card':showNotice(`${data.title}. ${data.author}`,7);return true;
        case 'isle-dig':dig();return true;
        case 'isle-spyglass':lookThroughSpyglass();return true;
        case 'isle-fire':lightFire();return true;
        case 'isle-robinson':speakRobinson();return true;
        case 'isle-journal':readJournal();return true;
        case 'isle-goat':sound?.(420,.35,'sawtooth',.04);setTimeout(()=>sound?.(380,.3,'sawtooth',.035),180);showNotice(SAYS.goats,8);return true;
        case 'isle-says':if(data.key==='dog')sound?.(90,.3,'triangle',.03);showNotice(SAYS[data.key],9);return true;
      }
      return false;
    }
    function enter(){activate();if(!isle)buildIsland();landed=false;dawn=0;move(-420,333.4,0);playSample?.('doorOpen',.8,.95);showNotice('The boathouse. Beyond the jetty the sea is dark and very still, and a boat is waiting.',6);analytics?.track('Room Explored',{room:'boathouse'})}
    function dig(){
      if(state.dug){showNotice(state.chestOpen?QUOTES.chest:'Nothing more down there.',6);return}
      state.dug=true;for(let k=0;k<4;k++)setTimeout(()=>noise?.(.25,.12,520),k*380);
      const chest=state.chest;chest.group.visible=true;chest.mound.visible=false;chest.rise=0;
      setTimeout(()=>{state.chestOpen=1;if(state.chest===chest)placeBook(TREASURE,chest.group,0,.62,.02,0,-1.1);showNotice(QUOTES.chest,8);analytics?.track('Secret Found',{secret:'treasure-chest'})},1900);
    }
    function lookThroughSpyglass(){
      const dx=SHIP.x-player.pos.x,dz=state.ship.position.z-player.pos.z;player.yaw=Math.atan2(-dx,-dz);player.pitch=.01;
      spy={t:0,x:player.pos.x,z:player.pos.z};showNotice('Through the glass: a ship under full sail, far out on the gold water, heading somewhere else.',6);
    }
    function lightFire(){
      const fire=state.fire;if(fire.light){showNotice('The fire is burning. Someone out there will have seen it by now.',4);return}
      const flameMat=own(new THREE.MeshBasicMaterial({color:0xff8a30})),core=own(new THREE.MeshBasicMaterial({color:0xffd070}));
      for(const [m,s,dx] of [[flameMat,1.4,0],[core,.9,.08],[flameMat,1,-.15]]){const f=add(new THREE.ConeGeometry(.3*s,1.1*s,7),m,fire.x+dx,.7*s,fire.z,isle);flames.push({mesh:f,base:s,phase:Math.random()*6})}
      fire.light=lamp(isle,0xff8a3a,6,14,fire.x,1.4,fire.z);for(let k=0;k<5;k++)setTimeout(()=>noise?.(.35,.07,900),k*260);
      showNotice('The dry leaves catch at once, and a column of smoke climbs into the morning.',5);
      setTimeout(()=>{if(isle&&zoneAt(player.pos.x,player.pos.z)==='crusoe-island')goHome()},isReducedMotion()?3500:7000);
    }

    // ---------- lifecycle ----------
    function activate(){if(!root)buildWorld();lastNeeded=time}
    function unload(){
      restoreAtmosphere();for(const group of [root,isle]){if(!group)continue;group.removeFromParent();group.traverse(o=>{o.geometry?.dispose?.()})}
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;blockers.length=0;flames.length=0;books.length=0;
      root=isle=null;Object.assign(state,{robinson:null,goats:[],footprintSeen:false,heard:0,chest:null,chestOpen:0,dug:false,fire:null,poll:null,sea:null,seaMat:null,sky:null,boat:null,bottle:null,ship:null,calendar:null});landed=false;dawn=0;
    }
    function reset(){travel=null;transition=null;spy=null;if(camera.userData)camera.userData.zoom=0;fade?.(0);restoreAtmosphere()}
    function update(t,dt){
      time=t;const reduced=isReducedMotion();
      let where=zoneAt(player.pos.x,player.pos.z);const nearDoor=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      if(where||nearDoor||travel||transition)activate();
      if(where==='boathouse'&&!isle&&!travel)buildIsland();
      if(root&&!where&&!travel&&!transition&&!nearDoor&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home.parent))unload();
      if(transition){
        transition.t+=dt;const out=reduced?.15:.6;fade?.(transition.t<out?transition.t/out:clamp(1-(transition.t-out-.15)/out,0,1));
        if(!transition.done&&transition.t>=out){transition.done=true;transition.action();where=zoneAt(player.pos.x,player.pos.z);if(transition.message)showNotice(transition.message,6)}
        if(transition.t>=out*2+.15){transition=null;fade?.(0)}
      }
      if(travel){
        travel.t+=dt;const p=clamp(travel.t/travel.duration,0,1),e=smooth(p),at=boatAt(e),bob=reduced?0:Math.sin(t*1.7)*.06;
        dawn=smooth(clamp((p-.1)/.75,0,1));state.boat.position.set(at.x,SEA_Y+.15+bob,at.z);state.boat.rotation.x=reduced?0:Math.sin(t*1.3)*.03;
        player.pos.set(at.x,0,at.z);camera.position.set(at.x,1.25+bob,at.z+.4);camera.rotation.set(reduced?0:.02+Math.sin(t*.9)*.01,reduced?0:Math.sin(t*.4)*.05,0,'YXZ');
        travel.stroke-=dt;if(travel.stroke<=0){travel.stroke=2.4;sound?.(95,.35,'triangle',.05);setTimeout(()=>noise?.(.45,.06,650),220)}
        if(!state.bottleSeen&&state.bottle&&Math.abs(at.z-state.bottle.position.z)<4){state.bottleSeen=true;showNotice(QUOTES.bottle,9)}
        if(p>=1)finishCrossing();
      }
      else if(where==='crusoe-island')dawn=1;else if(where==='boathouse'&&!transition)dawn=0;
      if(where||travel||(transition&&!transition.done))applyAtmosphere(dawn);else restoreAtmosphere();
      if(!root)return;
      state.sky.position.set(camera.position.x,38,camera.position.z);
      state.sea.normal.offset.set(t*.012,t*.008);
      if(!travel)state.boat.position.y=SEA_Y+.15+(reduced?0:Math.sin(t*1.4)*.04);
      if(state.bottle)state.bottle.position.y=SEA_Y+.05+(reduced?0:Math.sin(t*2.1)*.04);
      for(const f of flames)f.mesh.scale.set(1,reduced?1:1+Math.sin(t*9+f.phase)*.12+Math.sin(t*15.3+f.phase)*.06,1);
      if(state.ship)state.ship.position.z=SHIP.z+Math.sin(t*.02)*30;
      if(state.robinson){
        const r=state.robinson,dx=player.pos.x-r.x,dz=player.pos.z-r.z,near=Math.hypot(dx,dz)<7,want=near?Math.atan2(dx,dz):1.9;
        let turn=want-r.yaw;turn=Math.atan2(Math.sin(turn),Math.cos(turn));r.yaw+=reduced?turn:turn*Math.min(1,dt*2.5);r.group.rotation.y=r.yaw;
        r.talk=Math.max(0,r.talk-dt);r.head.rotation.x=r.talk>0&&!reduced?Math.sin(t*7)*.08:0;if(!reduced)r.group.scale.y=1+Math.sin(t*1.6)*.006;
      }
      if(!reduced)for(const goat of state.goats){const a=t*.15+goat.phase;goat.group.position.x=goat.x+Math.sin(a)*.35;goat.group.position.z=goat.z+Math.sin(a*1.3)*.2;goat.group.rotation.y=Math.atan2(Math.cos(a)*.35,Math.cos(a*1.3)*.26);goat.head.rotation.x=.35+Math.sin(t*1.1+goat.phase)*.3}
      if(state.poll){state.pollTalk=Math.max(0,state.pollTalk-dt);state.poll.head.rotation.x=state.pollTalk>0?Math.sin(t*14)*.25:0}
      if(state.chest?.group.visible){const c=state.chest.group;c.position.y=Math.min(.02,c.position.y+dt*.55);if(state.chestOpen)state.chest.lid.rotation.x=Math.max(-1.9,state.chest.lid.rotation.x-dt*1.6)}
      if(spy){spy.t+=dt;const moved=Math.hypot(player.pos.x-spy.x,player.pos.z-spy.z)>.6;camera.userData.zoom=spy.t<5.5&&!moved?46:0;if(spy.t>6||moved){spy=null;camera.userData.zoom=0}}
    }
    buildDoor();
    return {contains,floorAt,allowed,interact,update,reset,zoneAt,onSand,door:DOOR,enter,
      get travelling(){return !!travel||!!transition},get built(){return !!root},get islandBuilt(){return !!isle},get dawn(){return dawn},get landed(){return landed},
      get books(){return books.slice()},startCrossing,unload};
  };
})();
