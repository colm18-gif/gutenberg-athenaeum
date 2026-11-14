// The Gastronomic Athenaeum: a first, self-contained food-history wing.
// A threshold in the main library leads to a grand hall with three curated collections.
// The wing is built on demand, uses existing book/reader interactions, and unloads when away.
(function(){
  'use strict';
  // Each collection's books are the shelf of the same name in data/new-books.js (food-cookbooks, food-preservation,
  // food-spices), checked against their texts by the New books workflow; the numbers were looked up in Gutenberg's
  // catalogue (docs/food-history-catalogue.md). Only resolved books appear.
  const COLLECTIONS=[
    {key:'cookbooks',title:'THE HISTORICAL COOKBOOK GALLERY',subtitle:'The changing art of the recipe',x:-1,z:-6.9},
    {key:'preservation',title:'THE PRESERVATION VAULT',subtitle:'Salt, smoke, canning and winter stores',x:-8.5,z:-1.4},
    {key:'spices',title:'THE GLOBAL SPICE EXCHANGE',subtitle:'Taste, travel and trade',x:8.5,z:-1.4}
  ];
  window.createFoodHistoryWing=function(o){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,tone=()=>{},registerSeat=null,analytics,move,isHolding=()=>false,doorKit=null,corridor=null}=o;
    const ROOM={cx:-780,cz:-420,w:26,d:21,h:6.4};
    // In the second bay on the west side of the Long Corridor (long-corridor.js, handed in as `corridor`), whose door is in
    // the Grand Hall's east wall. Until 14 November 2026 it stood on the hall's west wall, squeezed between the
    // Horologist's round door and the Kipling bookcase with half a metre either side. The door is the library's walnut
    // with the name gilded on the glass, as for every room behind a door. (Without the corridor it falls back there.)
    const THRESHOLD=corridor?.foodDoor||{x:-18.1,z:26.35,yaw:Math.PI/2};
    const ENTRANCE_HALF=1.1;                            // the door and its frame, along the wall either side of the middle
    const PRELOAD=8,KEEP=25;
    // The Ancient Kitchen: north of the hall, through a planked door in the hall's north wall. A Roman kitchen of the
    // first century AD (west, through the courtyard door's light) and an English one of about 1400 (east, round the
    // great fireplace), divided by a stone arch. Two lights only: the Roman oil lamp and the medieval fire.
    const KITCHEN={cx:-780,cz:-462,w:18,d:12,h:5};
    const KITCHEN_DOOR={dx:-9};                         // in the hall's north wall, x = ROOM.cx + dx
    const KITCHEN_ENTRY={dx:-4.5};                      // in the kitchen's south wall, x = KITCHEN.cx + dx (Roman side)
    const ARCH={half:1.5,top:3.2};                      // the arch's opening: z within KITCHEN.cz ± half, up to top
    const DORMOUSE_KEY='athenaeum-food-dormouse';
    const kitchenLive={lights:[],flames:[],steam:[],herbs:null,herbBase:[],coals:[],lid:null,lidOpen:0,mouse:null,satyricon:null};
    const remembered=()=>{try{return localStorage.getItem(DORMOUSE_KEY)==='1'}catch(e){return false}};
    const showDormouse=()=>remembered()||new URLSearchParams(location.search).has('dormouse');
    // The kitchen below stairs (about 1860), north of the Ancient Kitchen, through a green baize door at the east end of
    // the hall's north wall: the iron range, the dresser, the copper, the scrubbed table, the scullery, the area window
    // with feet going by, and the board of servants' bells. Two lights: the gas over the table and the range's fire.
    const VICTORIAN={cx:-780,cz:-492,w:16,d:12,h:4.2};
    const BAIZE_DOOR={dx:7};                            // in the hall's north wall, between the pilasters at 5 and 9
    const BELOW_EXIT={dx:1.2};                          // the kitchen's door up to the hall, in its south wall, x = VICTORIAN.cx + dx
    const BELLS=['DRAWING ROOM','DINING ROOM','MORNING ROOM','THE LIBRARY','STUDY','BEDROOM 1','BEDROOM 2','NURSERY','FRONT DOOR','BACK DOOR'];
    const LIBRARY_BELL=BELLS.indexOf('THE LIBRARY'),BELL_KEY='athenaeum-food-library-bell';
    // The back stairs, against the south wall, rising east from x = VICTORIAN.cx + dx0 to a landing and the door at the top.
    const STAIR={dx0:2.9,steps:11,run:.4,rise:.2,depth:1.05};
    const vicLive={lights:[],coals:[],bells:[],ringing:-1,ringUntil:0,nextRing:0,hatch:null,hatchOpen:0,sent:null,feet:null,feetX:0,feetNext:0,clock:null};
    const bellAnswered=()=>{try{return localStorage.getItem(BELL_KEY)==='1'}catch(e){return false}};
    const showBell=()=>bellAnswered()||new URLSearchParams(location.search).has('bell');
    // The dining room above the kitchen, up its back stairs (x −780, z −522): the room the bells ring from. A long
    // mahogany table laid for eight à la russe, the sideboard, the fire under a looking-glass, the gasolier, red walls.
    // A papered jib door in the east wall goes back down to the kitchen; the double doors in the south wall go out to the
    // Athenaeum's hall. Two lights: the gasolier and the fire.
    const DINING={cx:-780,cz:-522,w:14,d:10,h:4.8};
    const JIB={dz:3};                                   // the jib door in the east wall, z = DINING.cz + dz
    // Isabella Beeton's bill of fare for a dinner for eight, month by month, as printed in The Book of Household
    // Management (1861; pg10136, checked line by line by a test). The menu card at the head of the table shows this month's.
    const MENUS=[["FIRST COURSE.", "Mulligatawny Soup.", "Brill and Shrimp Sauce.", "Fried Whitings.", "ENTREES.", "Fricasseed Chicken.", "Pork Cutlets, with Tomato Sauce.", "SECOND COURSE.", "Haunch of Mutton.", "Boiled Turkey and Celery Sauce.", "Boiled Tongue, garnished with Brussels Sprouts.", "THIRD COURSE.", "Roast Pheasants.", "Meringues à la Crême.", "Compôte of Apples.", "Orange Jelly.", "Cheesecakes.", "Soufflé of Rice.", "DESSERT AND ICES."], ["FIRST COURSE.", "Mock Turtle Soup.", "Fillets of Turbot a la Crême.", "Fried Filleted Soles and Anchovy Sauce.", "ENTREES.", "Larded Fillets of Rabbits.", "Tendrons de Veau with Purée of Tomatoes.", "SECOND COURSE.", "Stewed Rump of Beef à la Jardinière.", "Roast Fowls.", "Boiled Ham.", "THIRD COURSE.", "Roast Pigeons or Larks.", "Rhubarb Tartlets.", "Meringues.", "Clear Jelly. Cream.", "Ice Pudding.", "Soufflé.", "DESSERT AND ICES."], ["FIRST COURSE.", "Calf's-Head Soup.", "Brill and Shrimp Sauce.", "Broiled Mackerel à la Maître d'Hôtel.", "ENTREES.", "Lobster Cutlets.", "Calf's Liver and Bacon, aux fines herbes.", "SECOND COURSE.", "Roast Loin of Veal.", "Two Boiled Fowls à la Béchamel.", "Boiled Knuckle of Ham.", "Vegetables--Spinach or Brocoli.", "THIRD COURSE.", "Wild Ducks.", "Apple Custards.", "Blancmange.", "Lemon Jelly.", "Jam Sandwiches.", "Ice Pudding.", "Potatoes à la Maître d'Hôtel.", "DESSERT AND ICES."], ["FIRST COURSE.", "Spring Soup.", "Slices of Salmon and Caper Sauce.", "Fried Filleted Soles.", "ENTREES.", "Chicken Vol-au-Vent.", "Mutton Cutlets and Tomato Sauce.", "SECOND COURSE.", "Roast Loin of Veal.", "Boiled Fowls à la Béchamel.", "Tongue.", "Vegetables.", "THIRD COURSE.", "Guinea-Fowl.", "Sea-kale.", "Artichoke Bottoms.", "Cabinet Pudding.", "Blancmange.", "Apricot Tartlets.", "Rice Fritters.", "Macaroni and Parmesan Cheese.", "DESSERT."], ["FIRST COURSE.", "Julienne Soup.", "Brill and Lobster Sauce.", "Fried Fillets of Mackerel.", "ENTREES", "Lamb Cutlets and Cucumbers.", "Lobster Patties.", "SECOND COURSE.", "Roast Fillet of Veal.", "Boiled Leg of Lamb.", "Asparagus.", "THIRD COURSE.", "Ducklings.", "Gooseberry Tart.", "Custards.", "Fancy Pastry.", "Soufflé.", "DESSERT AND ICES."], ["FIRST COURSE.", "Vermicelli Soup.", "Trout à la Genévése", "Salmon Cutlets.", "ENTREES.", "Lamb Cutlets and Peas.", "Fricasseed Chicken.", "SECOND COURSE.", "Roast Ribs of Beef.", "Half Calf's Head, Tongue, and Brains.", "Boiled Ham.", "Vegetables.", "THIRD COURSE.", "Roast Ducks.", "Compôte of Gooseberries.", "Strawberry Jelly.", "Pastry.", "Iced Pudding.", "Cauliflower with Cream Sauce.", "DESSERT AND ICES."], ["FIRST COURSE.", "Green-Pea Soup.", "Salmon and Lobster Sauce.", "Crimped Perch and Dutch Sauce.", "ENTREES.", "Stewed Veal and Peas.", "Lamb Cutlets and Cucumbers.", "SECOND COURSE.", "Haunch of Venison.", "Boiled Fowls à la Béchamel.", "Braised Ham.", "Vegetables.", "THIRD COURSE.", "Roast Ducks.", "Peas à la Française.", "Lobster Salad.", "Strawberry Cream.", "Blancmange.", "Cherry Tart.", "Cheesecakes.", "Iced Pudding.", "DESSERT AND ICES."], ["FIRST COURSE.", "Julienne Soup.", "Fillets of Turbot and Dutch Sauce.", "Red Mullet.", "ENTREES.", "Riz de Veau aux Tomates.", "Fillets of Ducks and Peas.", "SECOND COURSE.", "Haunch of Venison.", "Boiled Capon and Oysters.", "Ham, garnished.", "Vegetables.", "THIRD COURSE.", "Leveret.", "Fruit Jelly.", "Compote of Greengages.", "Plum Tart. Custards, in glasses.", "Omelette soufflé.", "DESSERT AND ICES."], ["FIRST COURSE.", "Flemish Soup.", "Turbot, garnished with Fried Smelts.", "Red Mullet and Italian Sauce.", "ENTREES.", "Tendrons de Veau and Truffles.", "Lamb Cutlets and Sauce Piquante.", "SECOND COURSE.", "Loin of Veal à la Béchamel.", "Roast Haunch of Venison.", "Braised Ham.", "Grouse Pie.", "Vegetables.", "THIRD COURSE.", "Roast Hare.", "Plum Tart.", "Whipped Cream.", "Punch Jelly.", "Compôte of Damsons.", "Marrow Pudding.", "DESSERT."], ["FIRST COURSE.", "Calf's-Head Soup.", "Crimped Cod and Oyster Sauce.", "Stewed Eels.", "ENTREES.", "Stewed Mutton Kidneys.", "Curried Sweetbreads.", "SECOND COURSE.", "Boiled Leg of Mutton, garnished with Carrots and Turnips. Roast Goose.", "THIRD COURSE.", "Partridges.", "Fruit Jelly. Italian Cream.", "Vol-au-Vent of Pears.", "Apple Tart.", "Cabinet Pudding.", "DESSERT AND ICES."], ["FIRST COURSE.", "Mulligatawny Soup.", "Fried slices of Codfish and Oyster Sauce.", "Eels en Matelote.", "ENTREES.", "Broiled Pork Cutlets and Tomata Sauce.", "Tendrons de Veau à la Jardinière.", "SECOND COURSE.", "Boiled Leg of Mutton and Vegetables.", "Roast Goose.", "Cold Game Pie.", "THIRD COURSE.", "Snipes.", "Teal.", "Apple Soufflé.", "Iced Charlotte.", "Tartlets.", "Champagne Jelly.", "Coffee Cream.", "Mince Pies.", "DESSERT AND ICES."], ["FIRST COURSE.", "Carrot Soup.", "Crimped Cod and Oyster Sauce.", "Baked Soles.", "ENTREES.", "Mutton Kidneys à la Française.", "Oyster Patties.", "SECOND COURSE.", "Boiled Beef and Vegetables.", "Marrow-bones.", "Roast Fowls and Water-cresses", "Tongue, garnished.", "Game Pie.", "THIRD COURSE.", "Partridges.", "Blancmange.", "Compôte of Apples.", "Vol-au-Vent of Pears.", "Almond Cheesecakes.", "Lemon Pudding.", "DESSERT AND ICES."]];
    const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
    const DINNER_KEY='athenaeum-food-timmins';
    const dineLive={lights:[],flames:[],coals:[],hatch:null,hatchOpen:0,sent:null,pulled:0,pullAt:0};
    const dinnerFound=()=>{try{return localStorage.getItem(DINNER_KEY)==='1'}catch(e){return false}};
    const showDinner=()=>dinnerFound()||new URLSearchParams(location.search).has('timmins');
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
      plans:['Doors yet to open','The Confectioner’s Parlour, Coffee House, Market Garden and other rooms are on the architect’s plan. So far the wing opens the Cookbook Gallery, the Preservation Vault, the Spice Exchange and, through the door in the north-west corner, the Ancient Kitchen.']
    };
    Object.assign(facts,{
      kitchen:['The Ancient Kitchen','On one side a Roman kitchen of the first century AD, on the other an English one of about 1400. The two oldest cookery books in this wing, Apicius and the Forme of Cury, were written for kitchens like these.'],
      hearth:['A Roman hearth','Kitchens at Pompeii were small and often dark, with a raised masonry hearth where charcoal burned under pots set on iron tripods and gridirons. Fuel was stacked in the arches underneath.'],
      lararium:['The household shrine','Many kitchens at Pompeii had a shrine to the household gods painted on the wall near the hearth, often with serpents, the guardians of the place, gliding towards an altar. Offerings were made there at mealtimes.'],
      garum:['Garum','Fish sauce, made by salting fish and their innards and leaving them for months to ferment; the liquid was strained off and carried round the empire in amphorae. Apicius uses it in most savoury dishes, much as salt is used now. At Pompeii Aulus Umbricius Scaurus grew rich on it and had its jars pictured in the mosaic floor of his house.'],
      amphorae:['Amphorae','Two-handled clay jars for wine, oil, fish sauce and fruit, pointed at the foot so they could be stood in sand or stacked in a ship’s hold. Many carried a painted label giving what was inside and who had sent it.'],
      mortarium:['A mortarium','A heavy clay bowl with grit fired into its inside and a spout to pour from. Herbs, nuts and spices were ground in it with a pestle, and a great many of Apicius’s sauces begin there. Broken ones turn up wherever Romans lived, Britain included.'],
      bread:['Bread from Pompeii','Loaves carbonised in the eruption of AD 79 survive at Pompeii and Herculaneum: round, and scored into eight wedges so they could be broken apart. Some were stamped with the baker’s mark.'],
      courtyard:['The courtyard','Through the doorway, the open courtyard of the house, with its rain basin and a few plants in the morning light. Water was fetched from here, and in a small house the courtyard was where much of the work was done.'],
      dormouse:['A dormouse jar','The Romans fattened dormice for the table in earthenware jars like this, pierced for air and ridged inside for the animals to run along. Apicius gives a stuffed dormouse; Petronius’s Trimalchio serves them with honey and poppy seed. The lid is loose.'],
      arch:['The arch','A thousand years and more lie between the two sides of this arch. Romans and medieval English cooks both pounded, boiled and roasted over open fires, and both loved pepper.'],
      fireplace:['The great fireplace','In a medieval household nearly everything was cooked over an open fire: boiled in a great pot hung from a crane, roasted on spits before the flames, or baked in a separate oven. The Forme of Cury’s recipes assume such a fire and give no times or temperatures.'],
      trenchers:['Trenchers','A trencher was a thick slice of coarse bread, some days old, used as a plate. After the meal it might go to the poor or to the dogs, and in time the word passed to the wooden board that replaced it.'],
      spices:['The spice chest','The Forme of Cury calls for pepper, ginger, cinnamon, cloves, saffron and galingale, and for two ready-mixed powders, powdour fort, strong, and powdour douce, sweet. Spices came from Asia by long trade routes and were costly, and using them freely showed what a household could afford. The old story that they hid the taste of rotten meat has little behind it.'],
      herbs:['Drying herbs','Herbs came from the kitchen garden and were hung to dry for the winter. The Forme of Cury’s salad calls for a whole garden of them: parsley, sage, garlic, leeks, borage, mint, fennel, cress, rosemary and purslane among them.'],
      churn:['The churn','Cream was churned into butter by plunging the dasher up and down until the butter came, and the butter was salted to keep. It was usually the dairymaid’s work, and slow.']
    });
    Object.assign(facts,{
      below:['The kitchen below stairs','The kitchen of a London town house of about 1860, under the street, where the cook, the kitchenmaid and the scullery maid fed the household upstairs. Isabella Beeton wrote for the mistress of a house like this, and set out the duties of each of them.'],
      baize:['The green baize door','In a Victorian house a door covered in green baize divided the family’s rooms from the servants’. The cloth deadened the noise of the kitchen, and the door was the line that each side crossed only on business.'],
      range:['The range','The closed iron range, its fire boxed in between an oven and a boiler, spread through English kitchens in the first half of the nineteenth century, and ranges were often called kitcheners (no relation to William Kitchiner, whose Cook’s Oracle is on the shelf). It heated the water and the oven as well as the hob, ate coal, and had to be black-leaded every morning, usually by the kitchenmaid before anyone else was up.'],
      dresser:['The dresser','The everyday china lived on the dresser, plates on edge in the rack above and dishes in the cupboards below. Blue-and-white willow pattern, printed in Staffordshire, was on dressers all over the country.'],
      copper:['The copper','Copper pans heat evenly, but they were lined with tin, which had to be renewed, because acid food left in bare copper could poison; Friedrich Accum’s Treatise in the Preservation Vault has a good deal to say about it. Keeping the copper bright with sand, salt and vinegar was the scullery maid’s work.'],
      table:['The kitchen table','The deal table was scrubbed pale every day. Eliza Acton, and Isabella Beeton after her, gave exact quantities, so the scales came out for almost every recipe.'],
      scullery:['The scullery','Next to the kitchen, the scullery was where the washing-up, the preparing of vegetables and the roughest cleaning were done, at a shallow stone sink with a pump or a single cold tap. It was the scullery maid’s room, and she was the most junior servant in the house.'],
      area:['The area window','A basement kitchen looked up into the area, the sunken yard between the house and the street. Tradesmen came down the area steps to the kitchen door, and from inside one saw the railings and the feet of everyone going by.'],
      bells:['The bells','Each bell hung on a coiled spring and was rung by a wire pulled in a room upstairs. The spring kept the bell swinging after it rang, so whoever came in could see which room had called. One of these is labelled THE LIBRARY, and it is the only one that still rings.'],
      stair:['The back stairs','Up the back stairs to the dining room. Servants used these, out of sight, so as not to meet the family on the main staircase.'],
      hatch:['The dumbwaiter','A small lift in the wall, worked by a rope over a pulley, that carried dishes between the kitchen and the rooms upstairs.']
    });
    Object.assign(facts,{
      dining:['The dining room','The room the bells ring from: a dining room of about 1860, over the kitchen, laid for a dinner for eight. Dining rooms were papered or painted in deep, warm colours, red above all, and furnished in heavy mahogany.'],
      russe:['Dinner à la russe','By the 1860s the fashionable way to serve a dinner was à la russe: the dishes were carved and handed round by servants, course after course, and the table held only flowers, fruit and silver. Beeton gives several menus for dinners à la Russe beside the older kind, where whole courses were set out on the table at once.'],
      epergne:['The epergne','A silver centrepiece of branching dishes for fruit and sweets, set in the middle of the table, high enough to be admired and low enough, in theory, to talk across.'],
      sideboard:['The sideboard','The butler’s station: the decanters, the soup tureen and the plate waiting for the next course. In a dinner à la russe the carving was done here, out of the guests’ way.'],
      jib:['The jib door','A door papered over to match the wall, so that servants could come and go without being seen. This one goes down the back stairs to the kitchen.'],
      bellpull:['The bell-pull','A tasselled cord by the fireplace, wired to the board of bells in the kitchen below, where it rings the bell marked DINING ROOM.'],
      fire:['The fireplace','A marble chimneypiece with a looking-glass over it, to double the candlelight. The coal fire was lit by a housemaid long before anyone came down.'],
      timmins:['The dumbwaiter','The kitchen’s dumbwaiter comes up here too, between the sideboard and the door.']
    });
    const card=(key)=>({type:'food-history-card',title:facts[key][0],author:facts[key][1],action:'READ'});
    const shelf=key=>(arrivals[key]||[]).map(id=>findBook(id)).filter(Boolean);
    function hangingBook(book,x,y,z,yaw=0,scale=1){
      const mesh=add(own(new THREE.BoxGeometry(.8*scale,1.03*scale,.18*scale)),own(bookMaterial(book)),x,y,z,root);
      mesh.rotation.y=yaw;
      mesh.userData={type:'book',book,loaded:false,foodHistory:true,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
      interactables.push(mesh);ours.push(mesh);shelfBooks.push(mesh);return mesh;
    }
    function collectBooks(){
      for(const collection of COLLECTIONS){
        const books=shelf(collection.key);
        const onBack=collection.key==='cookbooks';
        const w=onBack?10:7;
        const x=ROOM.cx+collection.x,z=ROOM.cz+collection.z;
        const shelfZ=onBack?z-.4:z;
        const shelfX=onBack?x:x+(collection.x<0?-.3:.3);
        const side=collection.x<0?-1:1;
        for(const h of [1,2.2])box(onBack?w:.45,.08,onBack?.45:w,MAT.darkWood,shelfX,h,shelfZ,root);
        books.forEach((book,i)=>{
          const per=onBack?7:5,col=i%per,row=Math.floor(i/per),inRow=Math.min(per,books.length-row*per),offset=(col-(inRow-1)/2)*1.23;
          if(onBack)hangingBook(book,shelfX+offset,1.62+row*1.2,shelfZ+.19,0);
          else hangingBook(book,shelfX-side*.19,1.62+row*1.2,shelfZ+offset,side*Math.PI/2);
        });
        if(onBack)block(shelfX,shelfZ,w,.85);else block(shelfX,shelfZ,.85,w);
        const label=onBack?panel(root,collection.title,collection.subtitle,shelfX,4.4,shelfZ+.36,7.7,.75):
          panel(root,collection.title,collection.subtitle,shelfX-side*.36,4.4,shelfZ,6.5,.75,-side*Math.PI/2);
        mark(label,{type:'food-history-card',title:collection.title,author:collection.subtitle+'. Select a volume to read.',action:'READ'});
      }
    }
    function buildKitchen(){
      const K=KITCHEN,{cx,cz,w,d,h}=K,W0=cx-w/2,E0=cx+w/2,N0=cz-d/2,S0=cz+d/2;
      const ochre=mat(0x7f5d3e,.96),stone=mat(0x55504a,.97),timber=mat(0x3a2718,.8),iron=mat(0x27231f,.55),bronze=mat(0x8a6236,.45);
      const clay=mat(0xa75b37,.88),darkClay=mat(0x7d4127,.9),crust=mat(0x8a5426,.8),wicker=mat(0x8d6b3c,.9),cloth=mat(0x8f8068,.95);
      const tex=(draw,W,H,opts={})=>own(new THREE.MeshStandardMaterial({map:own(canvasTexture(draw,W,H)),roughness:.95,...opts}));
      const plane=(pw,ph,m,x,y,z,ry=0,rx=0)=>{const p=add(own(new THREE.PlaneGeometry(pw,ph)),m,x,y,z,root);p.rotation.set(rx,ry,0);return p};
      const lathe=(pts,m,x,y,z,seg=14)=>add(own(new THREE.LatheGeometry(pts.map(([a,b])=>new THREE.Vector2(a,b)),seg)),m,x,y,z,root);
      // Floors: terracotta tiles on the Roman side, flagstones on the medieval.
      const tiles=tex((c,TW,TH)=>{c.fillStyle='#4a2616';c.fillRect(0,0,TW,TH);for(let y=0;y<4;y++)for(let x=0;x<4;x++){const v=88+((x*7+y*13)%5)*6;c.fillStyle=`rgb(${v+18},${v-38},${v-58})`;c.fillRect(x*64+3,y*64+3,58,58)}},256,256);
      tiles.map.wrapS=tiles.map.wrapT=THREE.RepeatWrapping;tiles.map.repeat.set(4.5,6);
      const flags=tex((c,TW,TH)=>{c.fillStyle='#2e2a26';c.fillRect(0,0,TW,TH);for(let y=0;y<4;y++)for(let x=0;x<3;x++){const v=62+((x*5+y*3)%4)*8;c.fillStyle=`rgb(${v},${v-4},${v-10})`;c.fillRect(x*85+(y%2)*30+3,y*64+3,78,58)}},256,256);
      flags.map.wrapS=flags.map.wrapT=THREE.RepeatWrapping;flags.map.repeat.set(3,4);
      box(w/2,.2,d,tiles,cx-w/4,-.1,cz,root);box(w/2,.2,d,flags,cx+w/4,-.1,cz,root);
      // Walls and ceiling: ochre plaster west, stone east; the medieval side has open beams.
      box(w/2,.2,d,mat(0x6e5640,.95),cx-w/4,h+.1,cz,root);box(w/2,.2,d,timber,cx+w/4,h+.1,cz,root);
      box(.3,h,d,ochre,W0-.15,h/2,cz,root);box(.3,h,d,stone,E0+.15,h/2,cz,root);
      for(const z of [N0-.15,S0+.15]){box(w/2,h,.3,ochre,cx-w/4,h/2,z,root);box(w/2,h,.3,stone,cx+w/4,h/2,z,root)}
      for(let x=cx+1.5;x<E0;x+=2.4)box(.26,.3,d,timber,x,h-.15,cz,root);
      // A dado of darker red on the Roman walls, as in Pompeian kitchens.
      box(.04,.9,d,mat(0x7a2e1e,.9),W0+.02,.45,cz,root);box(w/2,.9,.04,mat(0x7a2e1e,.9),cx-w/4,.45,S0-.02,root);
      // The north dado stops either side of the courtyard doorway (x cx−6 ± 0.8), so the two never share a plane and flicker.
      for(const [x0,x1] of [[W0,cx-6.85],[cx-5.15,cx]])box(x1-x0,.9,.04,mat(0x7a2e1e,.9),(x0+x1)/2,.45,N0+.02,root);
      // The dividing wall and its arch.
      const half=ARCH.half;
      for(const [z0,z1] of [[N0,cz-half],[cz+half,S0]]){box(.5,h,z1-z0,stone,cx,h/2,(z0+z1)/2,root);block(cx,(z0+z1)/2,.5,z1-z0)}
      box(.5,h-ARCH.top,2*half,stone,cx,(h+ARCH.top)/2,cz,root);
      const arch=add(own(new THREE.TorusGeometry(half,.14,8,20,Math.PI)),mat(0x8a7f70,.9),cx,ARCH.top-half*.35,cz,root);arch.rotation.y=Math.PI/2;arch.scale.set(1,.35,1);
      for(const side of [-1,1])mark(box(.06,.5,.9,stone,cx+side*.28,ARCH.top+.6,cz,root),card('arch'));
      // ROMAN SIDE. The raised masonry hearth along the west wall, glowing charcoal, a tripod and a gridiron.
      const hz=cz-1.6;box(.95,.95,3.2,ochre,W0+.48,.475,hz,root);block(W0+.48,hz,1.05,3.3);
      for(const dz of [-1,0,1])box(.05,.42,.7,mat(0x1a120c,.95),W0+.97,.3,hz+dz*.95,root);
      const coals=own(new THREE.MeshStandardMaterial({color:0x2a100a,emissive:0xff5a1e,emissiveIntensity:.8,roughness:.9}));
      kitchenLive.coals.push(coals);
      mark(plane(.7,2.9,coals,W0+.48,.96,hz,0,-Math.PI/2),card('hearth'));
      for(const a of [0,2.1,4.2]){const leg=add(own(new THREE.CylinderGeometry(.015,.015,.36,5)),iron,W0+.48+Math.cos(a)*.17,1.13,hz-.8+Math.sin(a)*.17,root);leg.rotation.set(Math.sin(a)*.25,0,-Math.cos(a)*.25)}
      const pot=lathe([[0,0],[.18,.02],[.22,.12],[.2,.24],[.17,.26]],bronze,W0+.48,1.28,hz-.8);mark(pot,card('hearth'));
      box(.5,.02,.6,iron,W0+.48,1.08,hz+.7,root);lathe([[0,0],[.2,.0],[.22,.05]],darkClay,W0+.48,1.1,hz+.7);
      // Soot above the hearth.
      plane(1.4,2.6,tex((c,TW,TH)=>{const g=c.createLinearGradient(0,TH,0,0);g.addColorStop(0,'rgba(20,14,10,.85)');g.addColorStop(1,'rgba(20,14,10,0)');c.fillStyle=g;c.fillRect(0,0,TW,TH)},64,128,{transparent:true,depthWrite:false}),W0+.03,2.3,hz,Math.PI/2);
      // The lararium, painted on the west wall north of the hearth: an altar, two serpents, a garland.
      mark(plane(1.3,1.1,tex((c,TW,TH)=>{c.fillStyle='#c9a46a';c.fillRect(0,0,TW,TH);c.fillStyle='#8e2a1c';c.fillRect(8,8,TW-16,TH-16);c.fillStyle='#d8c08a';c.fillRect(TW/2-24,TH-90,48,72);c.fillRect(TW/2-34,TH-96,68,10);
        c.strokeStyle='#2f5a2a';c.lineWidth=9;for(const s of [-1,1]){c.beginPath();c.moveTo(TW/2+s*120,TH-30);for(let i=1;i<=6;i++)c.lineTo(TW/2+s*(120-i*16),TH-30-Math.sin(i*1.4)*18-i*9);c.stroke()}
        c.strokeStyle='#3d6b2f';c.lineWidth=6;c.beginPath();c.moveTo(30,40);c.quadraticCurveTo(TW/2,95,TW-30,40);c.stroke();c.fillStyle='#e8b04a';c.beginPath();c.arc(TW/2,TH-104,7,0,7);c.fill()},320,270),W0+.04,1.85,cz-4.4,Math.PI/2),card('lararium'));
      // A high window in the west wall, pale with morning.
      plane(.9,.6,own(new THREE.MeshBasicMaterial({color:0xdfe6e8})),W0+.04,4.05,cz+2.8,Math.PI/2);
      // The courtyard, seen through an open doorway in the north wall.
      mark(plane(1.6,2.6,tex((c,TW,TH)=>{const g=c.createLinearGradient(0,0,0,TH*.55);g.addColorStop(0,'#a9c6d8');g.addColorStop(1,'#efe4c8');c.fillStyle=g;c.fillRect(0,0,TW,TH*.55);
        c.fillStyle='#c98f5a';c.fillRect(0,TH*.3,TW,TH*.25);c.fillStyle='#e9dcc0';for(let i=0;i<4;i++)c.fillRect(20+i*60,TH*.22,14,TH*.33);
        c.fillStyle='#b9a582';c.fillRect(0,TH*.55,TW,TH*.45);c.fillStyle='#6f8f9b';c.fillRect(TW*.25,TH*.68,TW*.5,TH*.1);c.fillStyle='#4f7a3c';for(const x of [.12,.82]){c.beginPath();c.arc(TW*x,TH*.6,26,0,7);c.fill()}},256,416,{emissive:0xffffff,emissiveIntensity:.25}),cx-6,1.35,N0+.06),card('courtyard'));
      for(const s of [-1,1])box(.14,2.75,.12,timber,cx-6+s*.87,1.375,N0+.06,root);box(1.88,.14,.12,timber,cx-6,2.72,N0+.06,root);
      for(const s of [-1,1])box(.14,2.75,.2,timber,cx-6+s*.86,1.38,N0+.08,root);box(1.86,.16,.2,timber,cx-6,2.78,N0+.08,root);
      // Amphorae stood in a rack along the north wall; the one with the painted label held garum.
      const amph=[[0,0],[.05,.05],[.13,.35],[.17,.7],[.15,.95],[.07,1.07],[.06,1.25],[.09,1.29]];
      const amphMat=[clay,mat(0xb46a43,.88),darkClay,clay];
      for(let i=0;i<4;i++){const x=cx-3.2+i*.62,a=lathe(amph,amphMat[i],x,0,N0+.45);a.rotation.z=(i%2?.06:-.05);mark(a,card(i===1?'garum':'amphorae'));
        for(const s of [-1,1]){const hnd=add(own(new THREE.TorusGeometry(.07,.015,5,8,Math.PI)),amphMat[i],x+s*.09,1.12,N0+.45,root);hnd.rotation.set(0,Math.PI/2,s*.3)}}
      plane(.14,.12,own(new THREE.MeshStandardMaterial({color:0xe9dcc0,roughness:.9})),cx-3.2+.62,.82,N0+.62);
      box(2.8,.08,.12,timber,cx-2.27,.5,N0+.28,root);block(cx-2.27,N0+.45,2.9,.8);
      // The work table: a mortarium and pestle, bread, an oil jar and a basket.
      const tx=cx-4.5,tz=cz-.2;box(2.4,.08,1.1,timber,tx,.9,tz,root);for(const sx of [-1.05,1.05])for(const sz of [-.45,.45])box(.08,.86,.08,timber,tx+sx,.43,tz+sz,root);block(tx,tz,2.6,1.3);
      mark(lathe([[0,0],[.2,.02],[.26,.1],[.27,.14],[.24,.12],[.05,.05]],mat(0xcdb38f,.9),tx-.7,.94,tz),card('mortarium'));
      const pestle=add(own(new THREE.CylinderGeometry(.03,.045,.24,7)),mat(0xcdb38f,.9),tx-.62,1.08,tz+.05,root);pestle.rotation.z=.6;
      const loafTex=tex((c,TW,TH)=>{c.fillStyle='#8a5426';c.fillRect(0,0,TW,TH);c.strokeStyle='#4a2a10';c.lineWidth=5;for(let i=0;i<4;i++){c.beginPath();c.moveTo(TW/2+Math.cos(i*Math.PI/4)*TW/2,TH/2+Math.sin(i*Math.PI/4)*TH/2);c.lineTo(TW/2-Math.cos(i*Math.PI/4)*TW/2,TH/2-Math.sin(i*Math.PI/4)*TH/2);c.stroke()}c.beginPath();c.arc(TW/2,TH/2,TW*.14,0,7);c.stroke()},64,64);
      for(const [dx,dz] of [[.15,-.15],[.5,.2],[.15,.28]]){const loaf=add(own(new THREE.CylinderGeometry(.13,.14,.07,16)),[loafTex,crust,crust],tx+dx,.97,tz+dz,root);mark(loaf,card('bread'))}
      lathe([[0,0],[.08,.02],[.1,.12],[.06,.24],[.04,.3],[.05,.32]],clay,tx+.9,.94,tz-.3);
      lathe([[0,0],[.16,0],[.2,.14],[.21,.16]],wicker,tx+.85,.94,tz+.25);
      for(const [dx,dz,col] of [[-.05,0,0x6d7f2f],[.05,.05,0x8a3a5a],[0,-.06,0xc28a2a]])add(own(new THREE.SphereGeometry(.05,8,6)),mat(col,.8),tx+.85+dx,1.07,tz+.25+dz,root);
      // Bronze ladles and a strainer hung on pegs by the hearth.
      for(let i=0;i<3;i++){const y=2.15,z=hz+1.95+i*.28;add(own(new THREE.CylinderGeometry(.008,.008,.5,5)),bronze,W0+.07,y,z,root);add(own(new THREE.SphereGeometry(.055,8,5,0,Math.PI*2,Math.PI/2,Math.PI/2)),bronze,W0+.07,y-.27,z,root)}
      // The oil lamp on its bracket over the table, and the Roman side's light.
      lathe([[0,0],[.06,.01],[.07,.03],[.03,.05]],bronze,tx,2.6,tz);add(own(new THREE.CylinderGeometry(.004,.004,1.2,4)),iron,tx,3.2,tz,root);
      const lampFlame=add(own(new THREE.ConeGeometry(.018,.06,6)),own(new THREE.MeshBasicMaterial({color:0xffc06a})),tx+.07,2.68,tz,root);kitchenLive.flames.push({mesh:lampFlame,base:1,amp:.15});
      const lamp=new THREE.PointLight(0xffc887,3,12,2);lamp.position.set(tx,2.5,tz);root.add(lamp);kitchenLive.lights.push({light:lamp,base:3,amp:.2});
      // The dormouse jar (glirarium), by the table's corner, and the stool beside it.
      const jx=cx-2.3,jz=cz+2.6,jarMat=tex((c,TW,TH)=>{c.fillStyle='#9a5634';c.fillRect(0,0,TW,TH);c.fillStyle='#2a1208';for(let r=0;r<4;r++)for(let i=0;i<18;i++){c.beginPath();c.arc(i*TW/18+7+(r%2)*6,TH*(.28+r*.14),2.2,0,7);c.fill()}},256,128);
      const jar=lathe([[0,0],[.16,.01],[.24,.18],[.25,.38],[.2,.56],[.17,.6]],jarMat,jx,0,jz,16);mark(jar,{type:'food-history-dormouse'});
      const lid=new THREE.Group();lid.position.set(jx-.17,.6,jz);root.add(lid);
      const lidMesh=add(own(new THREE.CylinderGeometry(.19,.19,.04,16)),darkClay,.17,.02,0,lid);add(own(new THREE.SphereGeometry(.03,8,6)),darkClay,.17,.06,0,lid);
      mark(lidMesh,{type:'food-history-dormouse'});kitchenLive.lid=lid;block(jx,jz,.6,.6);
      const mouse=new THREE.Group();mouse.position.set(jx,.5,jz);mouse.visible=false;root.add(mouse);
      const fur=mat(0x8b8178,.95);add(own(new THREE.SphereGeometry(.07,10,8)),fur,0,0,0,mouse).scale.set(1.2,.85,1);
      add(own(new THREE.SphereGeometry(.045,10,8)),fur,.08,.03,0,mouse);for(const s of [-1,1])add(own(new THREE.SphereGeometry(.018,6,5)),mat(0xb09a8c,.9),.08,.075,s*.03,mouse);
      for(const s of [-1,1])add(own(new THREE.SphereGeometry(.009,6,5)),mat(0x111111,.3),.12,.04,s*.02,mouse);
      const tail=add(own(new THREE.CylinderGeometry(.014,.022,.16,6)),fur,-.11,.04,0,mouse);tail.rotation.z=1.1;
      kitchenLive.mouse=mouse;
      box(.45,.42,.45,timber,jx+.62,.21,jz,root);block(jx+.62,jz,.55,.55);
      kitchenLive.stool={x:jx+.62,y:.42,z:jz};
      // Steam over the Roman pot.
      steamAt(W0+.48,1.55,hz-.8);
      // The Roman shelf of books, in the south wall west of the door.
      box(2.6,.06,.4,timber,cx-7.2,1.05,S0-.22,root);box(2.6,.06,.4,timber,cx-7.2,2.25,S0-.22,root);
      shelf('kitchen').filter(b=>[29728,53219,51259].includes(b.id)).forEach((b,i)=>hangingBook(b,cx-8.1+i*.9,1.6,S0-.3,Math.PI,.82));
      block(cx-7.2,S0-.22,2.7,.5);
      // MEDIEVAL SIDE. The great fireplace in the east wall, a pot crane and cauldron, and the fire itself.
      const fz=cz-1.2,fx=E0;
      for(const s of [-1,1])box(1,2.7,.6,stone,fx-.5,1.35,fz+s*1.75,root);
      box(1.1,.6,4.1,stone,fx-.55,3,fz,root);box(.8,h-3.3,3.3,stone,fx-.4,3.3+(h-3.3)/2,fz,root);
      box(.1,2.7,2.9,mat(0x15100c,.98),fx-.05,1.35,fz,root);box(1,.08,2.9,mat(0x3a332d,.95),fx-.5,.04,fz,root);
      mark(box(.06,.5,4,stone,fx-1.06,3,fz,root),card('fireplace'));block(fx-.55,fz,1.2,4.2);
      const fireMat=own(new THREE.MeshBasicMaterial({color:0xff7a22,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}));
      for(let i=0;i<5;i++){const f=add(own(new THREE.ConeGeometry(.13+i%2*.05,.45+i%3*.15,9)),fireMat,fx-.55+(i%2)*.12,.32,fz-.5+i*.25,root);kitchenLive.flames.push({mesh:f,base:1,amp:.28,phase:i*1.7});mark(f,card('fireplace'))}
      for(let i=0;i<6;i++)add(own(new THREE.CylinderGeometry(.06,.06,.7,6)),mat(0x3b2416,.9),fx-.55,.1,fz-.6+i*.24,root).rotation.x=Math.PI/2;
      add(own(new THREE.CylinderGeometry(.04,.04,2.4,6)),iron,fx-.2,1.25,fz+1.25,root);
      const arm=add(own(new THREE.CylinderGeometry(.03,.03,1.1,6)),iron,fx-.72,2.3,fz+1.25,root);arm.rotation.z=Math.PI/2;
      add(own(new THREE.CylinderGeometry(.01,.01,1.05,4)),iron,fx-1.15,1.78,fz+1.25,root);
      const cauldron=add(own(new THREE.SphereGeometry(.32,14,10,0,Math.PI*2,Math.PI*.35,Math.PI*.65)),iron,fx-1.15,1.35,fz+1.25,root);mark(cauldron,card('fireplace'));
      steamAt(fx-1.15,1.55,fz+1.25);
      const fire=new THREE.PointLight(0xff9a4a,5,15,2);fire.position.set(fx-1.4,1.1,fz);root.add(fire);kitchenLive.lights.push({light:fire,base:5,amp:.9});
      // The bread peel against the jamb, and the churn.
      const peel=box(.32,1.7,.03,timber,fx-1.15,.85,fz-2.25,root);peel.rotation.z=.12;
      const churn=lathe([[0,0],[.2,0],[.17,.9],[.15,.92]],timber,E0-.5,0,S0-.9);mark(churn,card('churn'));add(own(new THREE.CylinderGeometry(.015,.015,.7,5)),timber,E0-.5,1.15,S0-.9,root);block(E0-.5,S0-.9,.5,.5);
      // Barrels by the north wall.
      for(const [dx,dz] of [[1.4,.5],[2.3,.55]]){const bx=cx+dx,bz=N0+dz;lathe([[0,0],[.28,0],[.33,.35],[.28,.7],[0,.7]],mat(0x6a4a2e,.85),bx,0,bz);for(const y of [.12,.58])add(own(new THREE.TorusGeometry(.31,.012,4,16)),iron,bx,y,bz,root).rotation.x=Math.PI/2;block(bx,bz,.7,.7)}
      // The trestle table with trenchers, bowls and a knife.
      const mx=cx+4.6,mz=cz+1.6;box(3.2,.08,1,timber,mx,.82,mz,root);for(const sx of [-1.3,1.3]){const t1=box(.08,.8,.9,timber,mx+sx,.4,mz,root);t1.scale.set(1,1,.9)}block(mx,mz,3.4,1.2);
      for(let i=0;i<4;i++){const tr=box(.3,.05,.22,crust,mx-1.1+i*.73,.885,mz+(i%2?.18:-.18),root);mark(tr,card('trenchers'))}
      for(let i=0;i<3;i++)lathe([[0,0],[.09,.01],[.12,.07]],mat(0x7b5a39,.8),mx-.75+i*.73,.86,mz+(i%2?-.2:.2));
      const knife=box(.22,.01,.03,iron,mx+.4,.87,mz,root);knife.rotation.y=.4;
      // The spice chest.
      const sc=box(.6,.4,.4,timber,cx+1.6,.2,S0-1.2,root);mark(sc,card('spices'));box(.62,.04,.42,iron,cx+1.6,.41,S0-1.2,root);block(cx+1.6,S0-1.2,.7,.5);
      // Herbs hung from a beam to dry: one instanced mesh, swaying a little in the draught from the door.
      const herbs=new THREE.InstancedMesh(own(new THREE.ConeGeometry(.08,.34,6)),mat(0x5f6b38,.95),12);
      const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),one=new THREE.Vector3(1,1,1),flip=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI);
      // The mesh stands at the beam (focus is found by an object's own position); its herbs are placed relative to it.
      for(let i=0;i<12;i++){const pos=new THREE.Vector3(-3.1+i*.55,-(i%3)*.08,0);kitchenLive.herbBase.push(pos);m4.compose(pos,flip,one);herbs.setMatrixAt(i,m4)}
      herbs.position.set(cx+4.3,3.95,cz+3.3);root.add(herbs);kitchenLive.herbs=herbs;kitchenLive.herbFlip=flip;
      herbs.userData=card('herbs');interactables.push(herbs);ours.push(herbs);
      box(7,.14,.14,timber,cx+4.3,4.25,cz+3.3,root);
      // The medieval shelf of books, on the north wall.
      box(2.6,.06,.4,timber,cx+5.6,1.05,N0+.22,root);box(2.6,.06,.4,timber,cx+5.6,2.25,N0+.22,root);
      shelf('kitchen').filter(b=>[8102,24790,12293].includes(b.id)).forEach((b,i)=>hangingBook(b,cx+4.7+i*.9,1.6,N0+.3,0,.82));
      block(cx+5.6,N0+.22,2.7,.5);
      // The room's sign over the door, and its way back.
      mark(panel(root,'THE ANCIENT KITCHEN','Rome · Medieval England',cx+KITCHEN_ENTRY.dx,3.7,S0-.2,4.2,.6,Math.PI),card('kitchen'));
      const back={type:'food-history-kitchen-exit',title:'The Gastronomic Athenaeum',author:'Back to the reading hall.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:back,mark,x:cx+KITCHEN_ENTRY.dx,z:S0-.2,yaw:Math.PI,width:1.9,height:3.1,color:0x6b3a22,style:'planked',onward:'towards the Grand Hall',label:'THE GASTRONOMIC ATHENAEUM',own}))
        mark(box(1.9,3.1,.2,timber,cx+KITCHEN_ENTRY.dx,1.55,S0-.22,root),back);
      if(showDormouse())openJar(true);
    }
    function buildVictorian(){
      const V=VICTORIAN,{cx,cz,w,d,h}=V,W0=cx-w/2,E0=cx+w/2,N0=cz-d/2,S0=cz+d/2;
      const lime=mat(0xb8ae96,.97),dado=mat(0x5a4632,.9),deal=mat(0xb59c72,.9),iron=mat(0x1d1c1b,.45),brick=mat(0x5e3426,.95),brass=mat(0xb48a45,.35);
      const copper=own(new THREE.MeshStandardMaterial({color:0xb2603a,metalness:.65,roughness:.35})),china=mat(0xe9e4da,.5),wood=mat(0x4a3220,.8);
      const tex=(draw,W,H,opts={})=>own(new THREE.MeshStandardMaterial({map:own(canvasTexture(draw,W,H)),roughness:.95,...opts}));
      const plane=(pw,ph,m,x,y,z,ry=0,rx=0)=>{const p=add(own(new THREE.PlaneGeometry(pw,ph)),m,x,y,z,root);p.rotation.set(rx,ry,0);return p};
      const lathe=(pts,m,x,y,z,seg=14)=>add(own(new THREE.LatheGeometry(pts.map(([a,b])=>new THREE.Vector2(a,b)),seg)),m,x,y,z,root);
      // Flagstones, limewashed walls over a brown dado, a whitewashed ceiling.
      const flags=tex((c,TW,TH)=>{c.fillStyle='#3b3833';c.fillRect(0,0,TW,TH);for(let y=0;y<4;y++)for(let x=0;x<3;x++){const v=68+((x*5+y*3)%4)*4;c.fillStyle=`rgb(${v},${v-3},${v-9})`;c.fillRect(x*85+(y%2)*30+3,y*64+3,78,58)}},256,256);
      flags.map.wrapS=flags.map.wrapT=THREE.RepeatWrapping;flags.map.repeat.set(5,4);
      box(w,.2,d,flags,cx,-.1,cz,root);box(w,.2,d,mat(0xa89f8a,.97),cx,h+.1,cz,root);
      box(.3,h,d,lime,W0-.15,h/2,cz,root);box(.3,h,d,lime,E0+.15,h/2,cz,root);box(w,h,.3,lime,cx,h/2,N0-.15,root);
      // The south wall leaves an opening for the area window (x −5.3 to −3.7 from the middle, y 2.6 to 3.8).
      const wx0=cx-5.3,wx1=cx-3.7,wy0=2.6,wy1=3.8;
      box(wx0-W0,h,.3,lime,(W0+wx0)/2,h/2,S0+.15,root);box(E0-wx1,h,.3,lime,(wx1+E0)/2,h/2,S0+.15,root);
      box(wx1-wx0,wy0,.3,lime,(wx0+wx1)/2,wy0/2,S0+.15,root);box(wx1-wx0,h-wy1,.3,lime,(wx0+wx1)/2,(wy1+h)/2,S0+.15,root);
      for(const [len,x,z,ry] of [[d,W0+.02,cz,Math.PI/2],[d,E0-.02,cz,-Math.PI/2],[w,cx,N0+.02,0],[w,cx,S0-.02,Math.PI]]){const p=plane(len,1.2,dado,x,.6,z,ry);p.material.side=THREE.DoubleSide}
      // The area: pavement-level light, railings, and now and then a pair of feet going by.
      plane(wx1-wx0+.6,1.6,own(new THREE.MeshBasicMaterial({map:own(canvasTexture((c,TW,TH)=>{const g=c.createLinearGradient(0,0,0,TH);g.addColorStop(0,'#c9d2d6');g.addColorStop(.62,'#aeb3ad');g.addColorStop(.63,'#77736b');g.addColorStop(1,'#5d5952');c.fillStyle=g;c.fillRect(0,0,TW,TH)},128,128))})),(wx0+wx1)/2,(wy0+wy1)/2+.1,S0+.9,Math.PI);
      for(let i=0;i<9;i++)add(own(new THREE.CylinderGeometry(.012,.012,.9,5)),iron,wx0-.2+i*.25,wy1-.15,S0+.55,root);
      add(own(new THREE.BoxGeometry(2.2,.03,.03)),iron,(wx0+wx1)/2,wy1+.3,S0+.55,root);
      const feet=new THREE.Group();feet.position.set(wx0-.6,wy1-.05,S0+.72);root.add(feet);
      for(const s of [-1,1]){add(own(new THREE.BoxGeometry(.09,.5,.09)),mat(0x24201c,.8),s*.09,.2,0,feet);add(own(new THREE.BoxGeometry(.16,.06,.09)),mat(0x111111,.6),s*.09+.04,-.06,0,feet)}
      vicLive.feet=feet;vicLive.feetRange=[wx0-.6,wx1+.6];
      for(const s of [-1,1])box(.06,wy1-wy0+.1,.12,wood,(s<0?wx0:wx1),(wy0+wy1)/2,S0-.02,root);
      for(let i=1;i<4;i++)add(own(new THREE.CylinderGeometry(.01,.01,wy1-wy0,4)),iron,wx0+i*(wx1-wx0)/4,(wy0+wy1)/2,S0+.05,root);
      mark(box(wx1-wx0,.06,.3,wood,(wx0+wx1)/2,wy0-.02,S0-.08,root),card('area'));
      // The range in its brick chimney breast, on the north wall.
      const rx=cx-1,rz=N0+.3;box(3.6,h,.6,brick,rx,h/2,N0+.3,root);
      const range=box(2.7,.95,.62,iron,rx,.475,rz+.55,root);mark(range,card('range'));block(rx,rz+.4,3.7,1.1);
      for(const s of [-1,1]){mark(box(.75,.6,.03,mat(0x2a2826,.4),rx+s*.9,.5,rz+.87,root),card('range'));add(own(new THREE.SphereGeometry(.03,8,6)),brass,rx+s*.9+s*-.28,.5,rz+.9,root)}
      const coals=own(new THREE.MeshStandardMaterial({color:0x2a100a,emissive:0xff5a1e,emissiveIntensity:.9,roughness:.9}));vicLive.coals.push(coals);
      mark(plane(.7,.4,coals,rx,.55,rz+.865),card('range'));for(let i=0;i<6;i++)add(own(new THREE.BoxGeometry(.02,.42,.02)),iron,rx-.3+i*.12,.55,rz+.88,root);
      add(own(new THREE.CylinderGeometry(.012,.012,2.7,5)),brass,rx,.9,rz+.9,root).rotation.z=Math.PI/2;
      lathe([[0,0],[.13,0],[.15,.12],[.11,.2],[.03,.24],[.04,.27]],copper,rx-.6,.95,rz+.5);
      lathe([[0,0],[.14,0],[.15,.14],[.16,.15]],copper,rx+.5,.95,rz+.55);
      box(3.4,.06,.3,wood,rx,1.95,rz+.4,root);
      for(let i=0;i<4;i++)lathe([[0,0],[.09,0],[.07,.06],[.08,.1],[.05,.16],[.02,.17]],copper,rx-1.3+i*.45+(i>1?.8:0),1.98,rz+.4);
      const clock=new THREE.Group();clock.position.set(rx,2.2,rz+.42);root.add(clock);add(own(new THREE.BoxGeometry(.32,.38,.14)),wood,0,0,0,clock);
      add(own(new THREE.CircleGeometry(.11,20)),china,0,.03,.072,clock);const hand=add(own(new THREE.BoxGeometry(.008,.08,.005)),iron,0,.06,.076,clock);vicLive.clock=hand;
      const fire=new THREE.PointLight(0xff8a3a,2.2,7,2);fire.position.set(rx,.7,rz+1.3);root.add(fire);vicLive.lights.push({light:fire,base:2.2,amp:.5});
      // The dresser on the west wall: plates on edge in the rack, one instanced mesh.
      const dz=cz-1.2;box(.55,.9,2.8,wood,W0+.28,.45,dz,root);box(.25,1.7,2.8,wood,W0+.13,1.85,dz,root);block(W0+.28,dz,.65,2.9);
      for(const y of [1.3,1.85,2.4])box(.24,.03,2.8,wood,W0+.3,y,dz,root);
      const plateTex=tex((c,TW,TH)=>{c.fillStyle='#ece7de';c.fillRect(0,0,TW,TH);c.strokeStyle='#2f4f8a';c.lineWidth=7;c.beginPath();c.arc(TW/2,TH/2,TW*.42,0,7);c.stroke();c.lineWidth=2;c.beginPath();c.arc(TW/2,TH/2,TW*.25,0,7);c.stroke();c.fillStyle='#4a6aa8';c.fillRect(TW*.38,TH*.42,TW*.24,TH*.12)},64,64);
      const plates=new THREE.InstancedMesh(own(new THREE.CircleGeometry(.12,16)),plateTex,24);
      {const m4=new THREE.Matrix4(),q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI/2),one=new THREE.Vector3(1,1,1);
        for(let i=0;i<24;i++){const row=Math.floor(i/8),col=i%8;m4.compose(new THREE.Vector3(0,row*.55,(col-3.5)*.32),q,one);plates.setMatrixAt(i,m4)}}
      plates.position.set(W0+.33,1.45,dz);root.add(plates);plates.userData=card('dresser');interactables.push(plates);ours.push(plates);
      // The scullery, through a doorway at the west wall's south end.
      mark(plane(1.1,2.3,tex((c,TW,TH)=>{c.fillStyle='#2a2723';c.fillRect(0,0,TW,TH);c.fillStyle='#6f6a62';c.fillRect(TW*.12,TH*.6,TW*.76,TH*.12);c.fillStyle='#4b4740';c.fillRect(TW*.18,TH*.72,TW*.64,TH*.06);
        c.fillStyle='#3a3a3a';c.fillRect(TW*.66,TH*.28,TW*.06,TH*.32);c.fillRect(TW*.6,TH*.28,TW*.2,TH*.04);c.fillStyle='#8b8578';c.fillRect(TW*.3,TH*.5,TW*.16,TH*.1)},128,256,{emissive:0xffffff,emissiveIntensity:.08}),W0+.06,1.15,S0-1.4,Math.PI/2),card('scullery'));
      for(const s of [-1,1])box(.12,2.4,.1,wood,W0+.06,1.2,S0-1.4+s*.6,root);box(.12,.1,1.3,wood,W0+.06,2.4,S0-1.4,root);
      // The dumbwaiter hatch beside the dresser.
      const hz=cz+1.4;box(.2,.95,.9,wood,W0+.1,1.4,hz,root);
      const hatch=box(.04,.7,.7,mat(0x6b4a2c,.8),W0+.22,1.4,hz,root);mark(hatch,{type:'food-history-hatch'});vicLive.hatch=hatch;vicLive.hatchBase=1.4;
      vicLive.tray={x:W0+.32,y:1.12,z:hz};
      // The copper on a rack on the east wall.
      const cz2=cz+1.2;box(.06,.06,2.4,iron,E0-.12,2.3,cz2,root);
      for(let i=0;i<7;i++){const r=.09+(i%3)*.03,z=cz2-1.05+i*.35;const pan=add(own(new THREE.CylinderGeometry(r,r*.92,.08+r*.3,16)),copper,E0-.14-(.04+r*.15),2.05-r,z,root);pan.rotation.z=Math.PI/2;mark(pan,card('copper'));add(own(new THREE.BoxGeometry(.02,.22,.03)),iron,E0-.1,2.15+.0,z,root)}
      // The bells, on a board high on the east wall.
      const bz=cz-2.6,by=3.15;mark(plane(2.9,.95,tex((c,TW,TH)=>{c.fillStyle='#5b3b24';c.fillRect(0,0,TW,TH);c.fillStyle='#e9dcc0';c.font='bold 11px Georgia';c.textAlign='center';
        BELLS.forEach((name,i)=>{const x=(i%5+.5)*TW/5,y=i<5?TH*.46:TH*.95;for(const [k,line] of name.split(' ').entries())c.fillText(line,x,y-10+k*12)})},320,104),E0-.03,by,bz,-Math.PI/2),card('bells'));
      BELLS.forEach((name,i)=>{const g=new THREE.Group();g.position.set(E0-.12,by+(i<5?.35:-.08),bz-1.16+(i%5)*.58);root.add(g);
        add(own(new THREE.TorusGeometry(.03,.005,4,10)),brass,0,.05,0,g);const bell=add(own(new THREE.SphereGeometry(.08,10,8,0,Math.PI*2,0,Math.PI/2)),brass,0,-.03,0,g);bell.rotation.x=Math.PI;
        mark(bell,i===LIBRARY_BELL?{type:'food-history-bell'}:card('bells'));vicLive.bells.push(g)});
      // The scrubbed deal table with a mixing bowl, rolling pin, scales and a raised pie.
      const tx=cx-.6,tz=cz+.9;box(2.6,.08,1.2,deal,tx,.86,tz,root);for(const sx of [-1.18,1.18])for(const sz of [-.5,.5])box(.09,.82,.09,deal,tx+sx,.41,tz+sz,root);block(tx,tz,2.8,1.4);
      mark(box(2.6,.02,1.2,deal,tx,.9,tz,root),card('table'));
      lathe([[0,0],[.12,0],[.2,.12],[.22,.14]],mat(0xd9c9a3,.6),tx-.8,.9,tz-.15);
      add(own(new THREE.CylinderGeometry(.03,.03,.45,8)),deal,tx-.2,.93,tz+.3,root).rotation.z=Math.PI/2;
      box(.3,.05,.16,iron,tx+.5,.92,tz-.25,root);add(own(new THREE.CylinderGeometry(.1,.08,.04,14)),brass,tx+.42,1.0,tz-.25,root);for(let i=0;i<3;i++)add(own(new THREE.CylinderGeometry(.03-i*.006,.03-i*.006,.025,10)),brass,tx+.62,.96+i*.025,tz-.25,root);
      lathe([[0,0],[.13,0],[.14,.12],[.11,.15],[0,.16]],mat(0xb9853f,.75),tx+.85,.9,tz+.25);
      // The cook's Windsor chair by the range.
      const ch=new THREE.Group();ch.position.set(cx+1.6,0,N0+1.7);ch.rotation.y=-.6;root.add(ch);add(own(new THREE.BoxGeometry(.45,.05,.42)),wood,0,.45,0,ch);
      for(const [x,z] of [[-.18,-.16],[.18,-.16],[-.18,.16],[.18,.16]])add(own(new THREE.CylinderGeometry(.015,.015,.45,5)),wood,x,.22,z,ch);for(let i=0;i<5;i++)add(own(new THREE.CylinderGeometry(.01,.01,.5,4)),wood,-.16+i*.08,.72,-.19,ch);block(cx+1.6,N0+1.7,.6,.6);
      // The gas pendant over the table.
      add(own(new THREE.CylinderGeometry(.008,.008,1.4,4)),brass,tx,h-.7,tz,root);lathe([[0,0],[.16,.12],[.17,.14]],mat(0xf2ead6,.4,),tx,h-1.55,tz);
      const gas=new THREE.PointLight(0xffd9a0,2.4,12,2);gas.position.set(tx,h-1.5,tz);root.add(gas);vicLive.lights.push({light:gas,base:2.4,amp:.05});
      // The back stairs, rising east along the south wall, and the shelf of the kitchen's books.
      // Walkable: STAIR's steps are the floor there (floorAt), taken one at a time (allowed); at the top landing the reader
      // goes on through the door into the dining room.
      for(let i=0;i<STAIR.steps;i++){const x=cx+STAIR.dx0+(i+.5)*STAIR.run,stepH=(i+1)*STAIR.rise;const st=box(STAIR.run,stepH,STAIR.depth,wood,x,stepH/2,S0-STAIR.depth/2-.05,root);mark(st,{type:'food-history-stair'})}
      const top=STAIR.steps*STAIR.rise,lx0=cx+STAIR.dx0+STAIR.steps*STAIR.run;
      box(E0-lx0,top,STAIR.depth,wood,(lx0+E0)/2,top/2,S0-STAIR.depth/2-.05,root);
      for(let i=0;i<=STAIR.steps;i+=2){const x=cx+STAIR.dx0+i*STAIR.run,y=(i+1)*STAIR.rise;add(own(new THREE.CylinderGeometry(.02,.02,.9,5)),wood,x,y+.45,S0-STAIR.depth-.02,root)}
      {const len=Math.hypot(STAIR.steps*STAIR.run,top),rail=add(own(new THREE.BoxGeometry(len,.06,.06)),wood,cx+STAIR.dx0+STAIR.steps*STAIR.run/2,top/2+.95,S0-STAIR.depth-.02,root);rail.rotation.z=Math.atan2(top,STAIR.steps*STAIR.run)}
      box(.1,1.1,.1,wood,cx+STAIR.dx0-.05,.55,S0-STAIR.depth-.02,root);
      // The door at the head of the stairs, in the east wall: up to the dining room.
      box(.06,2.1,.9,mat(0x5a3f28,.85),E0-.04,top+1.05,S0-STAIR.depth/2-.05,root);mark(box(.07,.5,.7,mat(0xe8dcc0,.7),E0-.05,top+1.6,S0-STAIR.depth/2-.05,root),{type:'food-history-stair'});
      // The kitchen's other way out: the door at the foot of the stairs from the green baize door, up to the hall.
      const upData={type:'food-history-below-exit',title:'The Gastronomic Athenaeum',author:'Up the stairs and through the green baize door to the hall.',action:'GO UP'};
      if(!doorKit?.hang(root,{data:upData,mark,x:cx+BELOW_EXIT.dx,z:S0-.2,yaw:Math.PI,width:1.2,height:2.4,fanlight:false,color:0x2f5a35,style:'plain',label:'UP TO THE HALL',own}))
        mark(box(1.2,2.4,.2,mat(0x2f5a35,.95),cx+BELOW_EXIT.dx,1.2,S0-.12,root),upData);
      mark(panel(root,'THE KITCHEN BELOW STAIRS','About 1860',cx+1.2,3.6,S0-.2,3.6,.55,Math.PI),card('below'));
      box(2.8,.06,.4,wood,cx+2.6,1.05,N0+.22,root);box(2.8,.06,.4,wood,cx+2.6,2.25,N0+.22,root);
      const own_=shelf('victorian');own_.slice(0,6).forEach((b,i)=>hangingBook(b,cx+1.65+(i%3)*.95,1.6+Math.floor(i/3)*1.2,N0+.3,0,.82));
      box(2.8,.06,.4,wood,cx+6.3,1.05,N0+.22,root);box(2.8,.06,.4,wood,cx+6.3,2.25,N0+.22,root);
      own_.slice(6,12).forEach((b,i)=>hangingBook(b,cx+5.35+(i%3)*.95,1.6+Math.floor(i/3)*1.2,N0+.3,0,.82));
      block(cx+4.45,N0+.22,6.6,.5);
      vicLive.nextRing=0;if(showBell())sendDown(true);
    }
    function buildDining(){
      const D=DINING,{cx,cz,w,d,h}=D,W0=cx-w/2,E0=cx+w/2,N0=cz-d/2,S0=cz+d/2;
      const mahogany=own(new THREE.MeshStandardMaterial({color:0x4a1f12,roughness:.45})),silver=own(new THREE.MeshStandardMaterial({color:0xd8d8d2,metalness:.85,roughness:.25}));
      const marble=mat(0xe2ddd2,.35),cloth=mat(0xf1ece0,.9),velvet=mat(0x5e1418,.9),china=mat(0xf4f1ea,.4),gilt=mat(0xc69c55,.4);
      const glass=own(new THREE.MeshStandardMaterial({color:0xe8f0f2,transparent:true,opacity:.35,roughness:.05,metalness:.2,depthWrite:false}));
      const tex=(draw,W,H,opts={})=>own(new THREE.MeshStandardMaterial({map:own(canvasTexture(draw,W,H)),roughness:.95,...opts}));
      const plane=(pw,ph,m,x,y,z,ry=0,rx=0)=>{const p=add(own(new THREE.PlaneGeometry(pw,ph)),m,x,y,z,root);p.rotation.set(rx,ry,0);return p};
      const lathe=(pts,m,x,y,z,seg=14)=>add(own(new THREE.LatheGeometry(pts.map(([a,b])=>new THREE.Vector2(a,b)),seg)),m,x,y,z,root);
      // Red flock walls over a mahogany dado; a pale ceiling with a plaster rose; boards and a Turkey carpet.
      const paper=tex((c,TW,TH)=>{c.fillStyle='#5a1216';c.fillRect(0,0,TW,TH);c.fillStyle='#6e1c1f';for(let y=0;y<4;y++)for(let x=0;x<4;x++){const px=x*64+(y%2)*32+32,py=y*64+32;c.beginPath();c.ellipse(px,py,12,20,0,0,7);c.fill();c.beginPath();c.ellipse(px,py-22,6,8,0,0,7);c.fill()}},256,256);
      paper.map.wrapS=paper.map.wrapT=THREE.RepeatWrapping;paper.map.repeat.set(4,2);
      box(w,.2,d,mat(0x3a2416,.6),cx,-.1,cz,root);box(w,.2,d,mat(0xd8d0bd,.95),cx,h+.1,cz,root);
      lathe([[0,0],[.5,0],[.45,.06],[.2,.1],[0,.1]],mat(0xe8e1d0,.9),cx,h-.1,cz).rotation.x=Math.PI;
      box(.3,h,d,paper,W0-.15,h/2,cz,root);box(w,h,.3,paper,cx,h/2,N0-.15,root);
      // The east wall leaves room for the jib door (papered like the wall, so it hardly shows).
      const jz=cz+JIB.dz;box(.3,h,jz-.6-N0,paper,E0+.15,h/2,(N0+jz-.6)/2,root);box(.3,h,S0-(jz+.6),paper,E0+.15,h/2,(jz+.6+S0)/2,root);box(.3,h-2.3,1.2,paper,E0+.15,(h+2.3)/2,jz,root);
      const jib=new THREE.Group();jib.position.set(E0+.02,0,jz);root.add(jib);
      const jibLeaf=add(own(new THREE.BoxGeometry(.06,2.3,1.2)),paper,0,1.15,0,jib);mark(jibLeaf,{type:'food-history-jib',title:facts.jib[0],author:facts.jib[1],action:'GO DOWN'});
      add(own(new THREE.BoxGeometry(.06,.9,1.2)),mahogany,-.01,.45,0,jib);add(own(new THREE.SphereGeometry(.025,8,6)),gilt,-.05,1.05,-.45,jib);
      // The south wall: the double doors to the hall between two curtained windows on the night.
      for(const s of [-1,1]){const x0=s<0?W0:cx+1,x1=s<0?cx-1:E0;box(x1-x0,h,.3,paper,(x0+x1)/2,h/2,S0+.15,root)}box(2,h-3,.3,paper,cx,(h+3)/2,S0+.15,root);
      for(const s of [-1,1]){const wx=cx+s*4;plane(1.3,2.2,own(new THREE.MeshBasicMaterial({color:0x0e1626})),wx,2.1,S0-.01,Math.PI);
        for(const k of [-1,1]){const cur=box(.55,3.6,.12,velvet,wx+k*.85,2.2,S0-.12,root);cur.scale.set(1,1,1)}box(2.4,.18,.18,gilt,wx,4.05,S0-.15,root)}
      const out={type:'food-history-dining-door',title:'The Gastronomic Athenaeum',author:'Through the double doors to the hall.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:out,mark,x:cx,z:S0-.2,yaw:Math.PI,width:1.9,height:2.9,color:0x4a1f12,style:'walnut',label:'THE HALL',own}))
        mark(box(1.9,2.9,.2,mahogany,cx,1.45,S0-.22,root),out);
      for(const [len,x,z,ry] of [[d,W0+.02,cz,Math.PI/2],[d,E0-.02,cz,-Math.PI/2],[w,cx,N0+.02,0]]){const p=plane(len,.95,mahogany,x,.475,z,ry);p.material.side=THREE.DoubleSide}
      mark(plane(6.2,3.6,tex((c,TW,TH)=>{c.fillStyle='#4a1512';c.fillRect(0,0,TW,TH);c.strokeStyle='#8a6a3a';c.lineWidth=4;c.strokeRect(8,8,TW-16,TH-16);c.fillStyle='#1c2330';c.fillRect(26,26,TW-52,TH-52);
        for(let y=0;y<4;y++)for(let x=0;x<7;x++){const px=40+x*30,py=40+y*27;c.fillStyle=(x+y)%2?'#5a2018':'#2d3a3a';c.beginPath();c.moveTo(px,py-9);c.lineTo(px+9,py);c.lineTo(px,py+9);c.lineTo(px-9,py);c.fill()}},256,160),cx,.005,cz,0,-Math.PI/2),card('dining'));
      // The table, laid for eight à la russe: plates, three glasses and cutlery at each place, the epergne and two candelabra.
      const tw=4.6,td=1.4,ty=.76;box(tw,.07,td,mahogany,cx,ty,cz,root);box(tw+.1,.01,td+.1,cloth,cx,ty+.04,cz,root);for(const sx of [-1,1])for(const sz of [-1,1])add(own(new THREE.CylinderGeometry(.05,.035,ty,8)),mahogany,cx+sx*(tw/2-.25),ty/2,cz+sz*(td/2-.2),root);
      block(cx,cz,tw+1.4,td+1.4);
      const places=[];for(const s of [-1,1])for(let i=0;i<3;i++)places.push([cx-1.4+i*1.4,cz+s*.5,s]);places.push([cx-tw/2+.3,cz,0,'foot'],[cx+tw/2-.3,cz,0,'head']);
      const plates=new THREE.InstancedMesh(own(new THREE.CylinderGeometry(.13,.11,.015,18)),china,8),glasses=new THREE.InstancedMesh(own(new THREE.CylinderGeometry(.03,.02,.14,8)),glass,24),knives=new THREE.InstancedMesh(own(new THREE.BoxGeometry(.015,.006,.2)),silver,32);
      {const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),one=new THREE.Vector3(1,1,1);let g=0,k=0;
        places.forEach(([x,z,s,end],i)=>{const dir=end==='head'?{x:-1,z:0}:end==='foot'?{x:1,z:0}:{x:0,z:-s};
          m4.compose(new THREE.Vector3(x,ty+.055,z),q,one);plates.setMatrixAt(i,m4);
          for(let j=0;j<3;j++){const off=.16+j*.07;m4.compose(new THREE.Vector3(x+dir.x*.18+(dir.z?off*(-s):0)*1,ty+.12,z+dir.z*.18+(dir.x?off:0)),q,one);glasses.setMatrixAt(g++,m4)}
          for(const o of [-.19,-.15,.15,.19]){const qq=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),dir.x?Math.PI/2:0);m4.compose(new THREE.Vector3(x+(dir.x?0:o),ty+.05,z+(dir.x?o:0)),qq,one);knives.setMatrixAt(k++,m4)}})}
      for(const m of [plates,glasses,knives]){root.add(m);ours.push(m)}
      plates.position.set(0,0,0);plates.userData=card('russe');interactables.push(plates);
      const ep=lathe([[0,0],[.16,0],[.05,.05],[.04,.45],[.22,.5],[.24,.53],[0,.53]],silver,cx,ty+.05,cz);mark(ep,card('epergne'));
      for(const [dx,dz,col] of [[0,0,0x7a2a3a],[.08,.05,0xc89a3a],[-.07,.04,0x6c8a2a],[.02,-.08,0xb0402a]])add(own(new THREE.SphereGeometry(.05,8,6)),mat(col,.6),cx+dx,ty+.62,cz+dz,root);
      for(const s of [-1,1]){const x=cx+s*1.4;lathe([[0,0],[.08,0],[.03,.04],[.025,.4],[.04,.42]],silver,x,ty+.05,cz);
        for(const a of [0,2.1,4.2,-1]){const r=a<0?0:.13,px=x+Math.cos(a)*r,pz=cz+Math.sin(a)*r;add(own(new THREE.CylinderGeometry(.012,.012,.16,6)),mat(0xf3eedf,.6),px,ty+.55,pz,root);
          const fl=add(own(new THREE.ConeGeometry(.012,.04,6)),own(new THREE.MeshBasicMaterial({color:0xffcf7a})),px,ty+.65,pz,root);dineLive.flames.push(fl)}}
      // The menu card at the head of the table: this month's dinner for eight.
      const head=places.find(p=>p[3]==='head');const menu=box(.12,.16,.01,mat(0xf7f1e2,.8),head[0]-.15,ty+.12,head[1],root);menu.rotation.y=Math.PI/2;
      mark(menu,{type:'food-history-menu',title:'The bill of fare',author:'This month’s dinner for eight, from Isabella Beeton.',action:'READ'});
      // Eight chairs, the library's own seats, each opening one of the dining room's books.
      places.forEach(([x,z,s,end],i)=>{const yaw=end==='head'?-Math.PI/2:end==='foot'?Math.PI/2:s>0?Math.PI:0,ch=new THREE.Group(),
        off=end==='head'?{x:.55,z:0}:end==='foot'?{x:-.55,z:0}:{x:0,z:s*.55};ch.position.set(x+off.x,0,z+off.z);ch.rotation.y=yaw;root.add(ch);
        const seat=add(own(new THREE.BoxGeometry(.46,.06,.44)),velvet,0,.46,0,ch),back=add(own(new THREE.BoxGeometry(.46,.62,.06)),mahogany,0,.8,.21,ch);
        for(const [lx,lz] of [[-.2,-.18],[.2,-.18],[-.2,.18],[.2,.18]])add(own(new THREE.CylinderGeometry(.02,.018,.44,6)),mahogany,lx,.22,lz,ch);
        if(registerSeat){const data=registerSeat([seat,back],ch,new THREE.Vector3(0,1.2,.05),yaw,{title:'A chair at the dinner table',author:'Sit, and read one of the dining room’s books.'});
          Object.defineProperty(data,'bookIds',{get:()=>shelf('dining').map(b=>b.id),configurable:true});ours.push(seat,back)}
        else mark(seat,card('russe'))});
      // The sideboard on the west wall, with decanters and the tureen; a still life over it.
      box(.6,.95,2.6,mahogany,W0+.32,.475,cz-.6,root);block(W0+.32,cz-.6,.7,2.7);mark(box(.62,.05,2.62,mahogany,W0+.32,.97,cz-.6,root),card('sideboard'));
      for(const dz of [-.9,-.5])lathe([[0,0],[.07,0],[.08,.12],[.03,.2],[.025,.28],[.035,.3]],glass,W0+.3,1,cz-.6+dz);
      lathe([[0,0],[.12,0],[.18,.12],[.17,.2],[.08,.24],[.03,.28]],silver,W0+.3,1,cz-.2);add(own(new THREE.CylinderGeometry(.25,.25,.02,20)),silver,W0+.3,1,cz+.35,root);
      plane(1.4,1,tex((c,TW,TH)=>{c.fillStyle='#2a1f16';c.fillRect(0,0,TW,TH);c.fillStyle='#c69c55';c.fillRect(0,0,TW,6);c.fillRect(0,TH-6,TW,6);c.fillRect(0,0,6,TH);c.fillRect(TW-6,0,6,TH);
        for(const [x,y,r,col] of [[70,80,22,'#8a2a2a'],[100,90,18,'#c8a03a'],[125,78,20,'#5a7a2a'],[95,60,14,'#6a2a5a']]){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,7);c.fill()}c.fillStyle='#8a7a6a';c.fillRect(50,100,110,10)},200,140),W0+.03,2.3,cz-.6,Math.PI/2);
      // The dumbwaiter's upper hatch, beside the sideboard.
      const hz=cz+1.6;box(.2,.95,.9,mahogany,W0+.1,1.4,hz,root);const hatch=box(.04,.7,.7,mat(0x6b2a1e,.6),W0+.22,1.4,hz,root);mark(hatch,{type:'food-history-dining-hatch'});
      dineLive.hatch=hatch;dineLive.hatchBase=1.4;dineLive.tray={x:W0+.32,y:1.12,z:hz};
      // The fireplace on the north wall: marble, a looking-glass over it, a clock, the coals and the fire's light.
      const fx=cx-1.6;box(1.9,1.2,.35,marble,fx,.6,N0+.18,root);box(2.2,.07,.45,marble,fx,1.23,N0+.24,root);box(.9,.7,.05,mat(0x0e0b0a,.9),fx,.45,N0+.37,root);block(fx,N0+.3,2.3,.8);
      const coals=own(new THREE.MeshStandardMaterial({color:0x2a100a,emissive:0xff5a1e,emissiveIntensity:.8,roughness:.9}));dineLive.coals.push(coals);mark(plane(.6,.25,coals,fx,.25,N0+.4),card('fire'));
      // The glass stands 3 cm proud of its frame: in the same plane the two flickered against each other.
      box(1.75,1.65,.04,gilt,fx,2.1,N0+.02,root);plane(1.6,1.5,own(new THREE.MeshStandardMaterial({color:0x8d979a,metalness:.6,roughness:.2})),fx,2.1,N0+.07);
      lathe([[0,0],[.1,0],[.1,.18],[.06,.26],[0,.28]],gilt,fx,1.27,N0+.25);
      const fire=new THREE.PointLight(0xff9a4a,1.6,7,2);fire.position.set(fx,.6,N0+1);root.add(fire);dineLive.lights.push({light:fire,base:1.6,amp:.4});
      // The bell-pull beside the chimneypiece.
      const pull=new THREE.Group();pull.position.set(fx+1.35,2.2,N0+.06);root.add(pull);dineLive.pull=pull;
      add(own(new THREE.BoxGeometry(.08,1.6,.02)),velvet,0,0,0,pull);const tassel=add(own(new THREE.ConeGeometry(.05,.16,8)),gilt,0,-.86,0,pull);
      for(const m of pull.children)mark(m,{type:'food-history-bellpull'});
      // The gasolier over the table.
      add(own(new THREE.CylinderGeometry(.012,.012,1.2,5)),gilt,cx,h-.6,cz,root);for(let i=0;i<4;i++){const a=i*Math.PI/2;lathe([[0,0],[.09,.08],[.1,.1]],mat(0xf2ead6,.4),cx+Math.cos(a)*.35,h-1.3,cz+Math.sin(a)*.35)}
      const gas=new THREE.PointLight(0xffd9a0,2.6,12,2);gas.position.set(cx,h-1.4,cz);root.add(gas);dineLive.lights.push({light:gas,base:2.6,amp:.04});
      // A small case of the dining room's books in the north-east corner.
      box(.4,1.9,2,mahogany,E0-.22,.95,N0+1.5,root);block(E0-.22,N0+1.5,.5,2.1);
      shelf('dining').slice(0,9).forEach((b,i)=>hangingBook(b,E0-.36,.75+Math.floor(i/3)*.55,N0+.85+(i%3)*.62,-Math.PI/2,.5));
      mark(panel(root,'THE DINING ROOM','Above the kitchen · about 1860',cx,4.1,S0-.2,3.4,.5,Math.PI),card('dining'));
      if(showDinner())sendUp(true);
    }
    function sendUp(quiet){
      if(!dineLive.hatch||dineLive.sent)return false;
      dineLive.hatchOpen=1e-3;const book=shelf('dinner')[0],T=dineLive.tray;
      add(own(new THREE.BoxGeometry(.5,.02,.42)),own(new THREE.MeshStandardMaterial({color:0xb7b2a6,metalness:.6,roughness:.3})),T.x,T.y,T.z,root);
      add(own(new THREE.SphereGeometry(.16,14,8,0,Math.PI*2,0,Math.PI/2)),own(new THREE.MeshStandardMaterial({color:0xd8d8d2,metalness:.85,roughness:.25})),T.x,T.y+.01,T.z-.08,root);
      if(book)dineLive.sent=hangingBook(book,T.x,T.y+.22,T.z+.12,Math.PI/2,.42);else dineLive.sent=true;
      if(!quiet){try{localStorage.setItem(DINNER_KEY,'1')}catch(e){}analytics?.track('Secret Found',{secret:'food-timmins'})}
      return true;
    }
    function menuText(date=new Date()){const m=date.getMonth();return 'Dinner for 8 persons, '+MONTHS[m]+', from Isabella Beeton: '+MENUS[m].join(' ').replace(/\.(?= [A-Z])/g,'.').replace(/ (FIRST COURSE|ENTREES|SECOND COURSE|THIRD COURSE|DESSERT)/g,' · $1')}
    function sendDown(quiet){
      if(!vicLive.hatch||vicLive.sent)return false;
      vicLive.hatchOpen=1e-3;const book=shelf('bells')[0],T=vicLive.tray;
      add(own(new THREE.BoxGeometry(.5,.02,.42)),own(new THREE.MeshStandardMaterial({color:0xb7b2a6,metalness:.6,roughness:.3})),T.x,T.y,T.z,root);
      if(book)vicLive.sent=hangingBook(book,T.x,T.y+.22,T.z,Math.PI/2,.42);else vicLive.sent=true;
      if(!quiet){try{localStorage.setItem(BELL_KEY,'1')}catch(e){}analytics?.track('Secret Found',{secret:'food-library-bell'})}
      return true;
    }
    function ringBell(time){
      vicLive.ringing=LIBRARY_BELL;vicLive.ringUntil=time+7;
      for(let i=0;i<5;i++){tone(1760,i*.16,.35,.035);tone(2349,i*.16+.03,.3,.02)}
    }
    function steamAt(x,y,z){
      const n=24,pos=new Float32Array(n*3),geo=own(new THREE.BufferGeometry());
      for(let i=0;i<n;i++){pos[i*3]=(Math.random()-.5)*.2;pos[i*3+1]=Math.random()*.9;pos[i*3+2]=(Math.random()-.5)*.2}
      geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
      const pts=new THREE.Points(geo,own(new THREE.PointsMaterial({color:0xd8d2c8,size:.045,transparent:true,opacity:.2,depthWrite:false})));
      pts.position.set(x,y,z);root.add(pts);kitchenLive.steam.push(pts);
    }
    function openJar(quiet){
      if(!kitchenLive.lid||kitchenLive.satyricon)return false;
      kitchenLive.lidOpen=1e-3;kitchenLive.mouse.visible=true;
      const book=shelf('dormouse')[0];
      if(book){const st=kitchenLive.stool;kitchenLive.satyricon=hangingBook(book,st.x,st.y+.42,st.z,-Math.PI/2,.8)}
      if(!quiet){try{localStorage.setItem(DORMOUSE_KEY,'1')}catch(e){}analytics?.track('Secret Found',{secret:'food-dormouse'})}
      return true;
    }
    function build(){
      if(root)return;root=new THREE.Group();root.name='food-history-wing';
      const oak=mat(0x543722),plaster=mat(0x70614d),brass=mat(0xb78f50,.4),linen=mat(0x9b8468);
      const {cx,cz,w,d,h}=ROOM;
      box(w,.28,d,MAT.wood,cx,-.14,cz,root);box(w,.25,d,MAT.darkWood,cx,h+.12,cz,root);
      for(const x of [cx-w/2,cx+w/2])box(.35,h,d,plaster,x,h/2,cz,root);
      for(const z of [cz-d/2,cz+d/2])box(w,h,.35,plaster,cx,h/2,z,root);
      for(let x=-w/2+2;x<w/2;x+=4){for(const z of [cz-d/2+.23,cz+d/2-.23])box(.28,h,.34,oak,cx+x,h/2,z,root)}
      box(w,.94,.22,oak,cx,.47,cz+d/2-.23,root);
      // The north wainscot stops either side of the Ancient Kitchen's door (KITCHEN_DOOR, between two pilasters).
      {let from=cx-w/2;for(const dx of [KITCHEN_DOOR.dx,BAIZE_DOOR.dx]){const to=cx+dx-1.15;box(to-from,.94,.22,oak,(from+to)/2,.47,cz-d/2+.23,root);from=cx+dx+1.15}box(cx+w/2-from,.94,.22,oak,(from+cx+w/2)/2,.47,cz-d/2+.23,root)}
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
      const exit={type:'food-history-exit',title:corridor?'Back to the Long Corridor':'Return to the main library',author:corridor?'Out into the corridor, and along it to the Grand Hall.':'Step back into the Athenaeum.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:exit,mark,x:cx,z:cz+d/2-.25,yaw:Math.PI,width:1.9,height:3.1,color:0x50362c,style:'painted',...(corridor?{label:'THE LONG CORRIDOR',onward:'towards the Grand Hall'}:{label:'THE MAIN LIBRARY'}),own}))
        mark(box(2,3,.2,oak,cx,1.5,cz+d/2-.24,root),exit);
      // Warm, restrained gaslight: geometry is shared and everything is freed when unused.
      for(const x of [cx-7,cx,cx+7]){
        const light=new THREE.PointLight(0xffc887,5.5,15,2);light.position.set(x,4.6,cz+1);root.add(light);
        add(own(new THREE.CylinderGeometry(.36,.56,.34,12)),brass,x,5.1,cz+1,root);
      }
      // The Ancient Kitchen's door, in the north wall's west end.
      const toKitchen={type:'food-history-kitchen-door',title:'The Ancient Kitchen',author:'Roman and medieval: the oldest cookery on these shelves, and where it was cooked.',action:'ENTER'};
      if(!doorKit?.hang(root,{data:toKitchen,mark,x:cx+KITCHEN_DOOR.dx,z:cz-d/2+.18,yaw:0,width:1.9,height:3.1,color:0x6b3a22,style:'planked',label:'THE ANCIENT KITCHEN',own}))
        mark(box(1.9,3.1,.2,oak,cx+KITCHEN_DOOR.dx,1.55,cz-d/2+.2,root),toKitchen);
      // The green baize door to the kitchen below stairs, at the north wall's east end.
      const toBelow={type:'food-history-baize-door',title:'Below stairs',author:'Through the green baize door and down the back stairs to the kitchen.',action:'ENTER'};
      if(!doorKit?.hang(root,{data:toBelow,mark,x:cx+BAIZE_DOOR.dx,z:cz-d/2+.18,yaw:0,width:1.9,height:3.1,color:0x2f5a35,style:'plain',label:'BELOW STAIRS',own}))
        mark(box(1.9,3.1,.2,mat(0x2f5a35,.95),cx+BAIZE_DOOR.dx,1.55,cz-d/2+.2,root),toBelow);
      buildKitchen();buildVictorian();buildDining();collectBooks();scene.add(root);
    }
    const doorwayData={type:'food-history-door',title:'The Gastronomic Athenaeum',author:'Beyond the old doors: food, cooking and culinary history.',action:'ENTER'};
    const doorway=new THREE.Group();doorway.name='food-history-threshold';doorway.position.set(THRESHOLD.x,0,THRESHOLD.z);doorway.rotation.y=THRESHOLD.yaw;scene.add(doorway);
    if(!doorKit?.hang(doorway,{data:doorwayData,mark:(m,d)=>mark(m,d,true),color:0x593a28,...(doorKit.readingRoom?.('THE GASTRONOMIC\nATHENAEUM','Food, cooking and culture')||{width:1.9,height:3.1,style:'painted'})}))
      mark(add(new THREE.BoxGeometry(1.9,3.1,.17),new THREE.MeshStandardMaterial({color:0x593a28}),0,1.55,0,doorway),doorwayData,true);
    // The entrance stays in the main hall while the distant wing unloads. Keep its assets out of the disposable room pool.
    const entranceOwned=owned.splice(0);
    const inBox=(r,x,z)=>x>r.cx-r.w/2&&x<r.cx+r.w/2&&z>r.cz-r.d/2&&z<r.cz+r.d/2;
    const inKitchen=(x,z)=>inBox(KITCHEN,x,z),inVictorian=(x,z)=>inBox(VICTORIAN,x,z),inDining=(x,z)=>inBox(DINING,x,z);
    function contains(x,z){return inBox(ROOM,x,z)||inKitchen(x,z)||inVictorian(x,z)||inDining(x,z)}
    function zoneAt(x,z){return inKitchen(x,z)?'ancient-kitchen':inVictorian(x,z)?'victorian-kitchen':inDining(x,z)?'victorian-dining':inBox(ROOM,x,z)?'food-history':null}
    // On the back stairs the floor is the step underfoot; everywhere else in the wing it is level.
    function stairAt(x,z){const V=VICTORIAN,S0=V.cz+V.d/2,x0=V.cx+STAIR.dx0;if(!inVictorian(x,z)||x<x0||z<S0-STAIR.depth-.05)return null;
      return Math.min(STAIR.steps,Math.floor((x-x0)/STAIR.run)+1)*STAIR.rise}
    function floorAt(x,z){if(!contains(x,z))return null;return stairAt(x,z)??0}
    function allowed(x,z){
      if(!contains(x,z))return false;
      const r=player.radius||.42,R=inKitchen(x,z)?KITCHEN:inVictorian(x,z)?VICTORIAN:inDining(x,z)?DINING:ROOM,m=R===ROOM?.42:.12;
      if(x-r<R.cx-R.w/2+m||x+r>R.cx+R.w/2-m||z-r<R.cz-R.d/2+m||z+r>R.cz+R.d/2-m)return false;
      // A change of floor of much more than a step is refused, so the stairs are climbed from the bottom, not from the side.
      // (game.js eases the reader's height towards the floor, so on the way up it trails a step by up to about 0.17 m.)
      const here=player.pos.y||0,there=floorAt(x,z)??0;if(Math.abs(there-here)>STAIR.rise*2.5)return false;
      return !blocks.some(b=>Math.abs(x-b.x)<b.w/2+r&&Math.abs(z-b.z)<b.d/2+r);
    }
    function enter(){
      activate();move(ROOM.cx,ROOM.cz+ROOM.d/2-2,0);playSample?.('doorOpen',.8,1);
      showNotice('The Gastronomic Athenaeum. The Cookbook Gallery is ahead, the Preservation Vault to the left and the Spice Exchange to the right; the Ancient Kitchen is through the door in the far left corner.',9);
      analytics?.track('Room Explored',{room:'food-history'});
    }
    function enterKitchen(){
      activate();move(KITCHEN.cx+KITCHEN_ENTRY.dx,KITCHEN.cz+KITCHEN.d/2-1.6,0);playSample?.('doorOpen',.8,.9);
      showNotice('The Ancient Kitchen. A Roman kitchen this side of the arch, an English one of about 1400 beyond it.',8);
      analytics?.track('Room Explored',{room:'ancient-kitchen'});
    }
    function enterDining(){
      activate();move(DINING.cx+DINING.w/2-1.3,DINING.cz+JIB.dz,Math.PI/2);playSample?.('stoneStep',.7,1.1);
      showNotice('Up the back stairs and through a door papered to look like wall: the dining room, laid for a dinner for eight.',8);
      analytics?.track('Room Explored',{room:'victorian-dining'});
    }
    function enterBelow(){
      activate();move(VICTORIAN.cx+2.2,VICTORIAN.cz+VICTORIAN.d/2-1.5,0);playSample?.('stoneStep',.7,1);
      showNotice('Down the back stairs to the kitchen below stairs, about 1860. The range is lit; the bells are on the board by the door.',8);
      vicLive.nextRing=t+12;analytics?.track('Room Explored',{room:'victorian-kitchen'});
    }
    function interact(object){
      const d=object?.userData;
      if(!d||!String(d.type).startsWith('food-history-'))return false;
      if(d.type==='food-history-door'){if(doorKit&&d.kit)doorKit.pass(d.kit,d,enter);else enter();return true}
      if(d.type==='food-history-exit'){
        const leave=()=>{const p=corridor?.standBefore?.(THRESHOLD,2.75)||{x:THRESHOLD.x+2.75,z:THRESHOLD.z,yaw:-Math.PI/2};move(p.x,p.z,p.yaw);playSample?.('doorOpen',.8,1)};
        if(doorKit&&d.kit)doorKit.pass(d.kit,d,leave);else leave();return true;
      }
      if(d.type==='food-history-kitchen-door'){if(doorKit&&d.kit)doorKit.pass(d.kit,d,enterKitchen);else enterKitchen();return true}
      if(d.type==='food-history-kitchen-exit'){
        const leave=()=>{move(ROOM.cx+KITCHEN_DOOR.dx,ROOM.cz-ROOM.d/2+1.8,Math.PI);playSample?.('doorOpen',.8,.9)};
        if(doorKit&&d.kit)doorKit.pass(d.kit,d,leave);else leave();return true;
      }
      if(d.type==='food-history-baize-door'){if(doorKit&&d.kit)doorKit.pass(d.kit,d,enterBelow);else enterBelow();return true}
      if(d.type==='food-history-below-exit'){
        const leave=()=>{move(ROOM.cx+BAIZE_DOOR.dx,ROOM.cz-ROOM.d/2+1.8,Math.PI);playSample?.('doorOpen',.8,1);showNotice('Up the stairs and out through the green baize door into the hall.',5)};
        if(doorKit&&d.kit)doorKit.pass(d.kit,d,leave);else leave();return true;
      }
      if(d.type==='food-history-stair'){enterDining();return true}
      if(d.type==='food-history-jib'){move(VICTORIAN.cx+2.2,VICTORIAN.cz+VICTORIAN.d/2-1.5,0);playSample?.('stoneStep',.7,.95);showNotice('Through the jib door and down the back stairs to the kitchen.',5);return true}
      if(d.type==='food-history-dining-door'){const leave=()=>{move(ROOM.cx+BAIZE_DOOR.dx,ROOM.cz-ROOM.d/2+1.8,Math.PI);playSample?.('doorOpen',.8,1)};if(doorKit&&d.kit)doorKit.pass(d.kit,d,leave);else leave();return true}
      if(d.type==='food-history-menu'){showNotice(menuText(),16);return true}
      if(d.type==='food-history-bellpull'){
        if(dineLive.sent){showNotice('Far below, the bell marked DINING ROOM rings again. Nobody comes: dinner has been sent up already, and is waiting in the dumbwaiter by the sideboard.',8);for(let i=0;i<3;i++)tone(1568,i*.2,.3,.012);return true}
        if(!dineLive.pulled){dineLive.pulled=1;dineLive.pullAt=t;for(let i=0;i<4;i++)tone(1568,.1+i*.18,.3,.012);showNotice('You pull the bell. Far below, the bell marked DINING ROOM rings on its spring.',6)}
        return true;
      }
      if(d.type==='food-history-dining-hatch'){showNotice(dineLive.sent?'The dumbwaiter is up. Under the dish cover, nothing at all; beside it, a book about a dinner that went badly.':facts.timmins[0]+': '+facts.timmins[1],8);return true}
      if(d.type==='food-history-bell'){
        if(vicLive.ringing===LIBRARY_BELL&&t<vicLive.ringUntil+3&&sendDown(false)){showNotice('You answer the bell. Somewhere above, a rope creaks, and the dumbwaiter comes down to the hatch by the dresser with a tray on it: a covered dish, and a book.',10)}
        else if(vicLive.sent)showNotice('THE LIBRARY’s bell hangs still. Whatever the library wanted, it has sent down already: the tray is in the dumbwaiter by the dresser.',8);
        else showNotice('The bell labelled THE LIBRARY hangs still on its spring. It is the only one on the board that still rings, now and then. A bell is answered while it is still swinging.',9);
        return true;
      }
      if(d.type==='food-history-hatch'){showNotice(vicLive.sent?'The dumbwaiter stands open. On the tray: a covered dish, still warm, and a book.':facts.hatch[0]+': '+facts.hatch[1],8);return true}
      if(d.type==='food-history-dormouse'){
        if(openJar(false)){playSample?.('pageTurn',.5,.7);showNotice('You lift the lid. A dormouse looks up, unimpressed, and goes back to sleep. Someone has left a book on the stool beside the jar: Trimalchio’s dinner, where dormice come to the table with honey and poppy seed.',11)}
        else showNotice(kitchenLive.satyricon?'The dormouse is still asleep. Trimalchio’s dinner is on the stool beside the jar.':facts.dormouse[0]+': '+facts.dormouse[1],9);
        return true;
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
      kitchenLive.lights.length=0;kitchenLive.flames.length=0;kitchenLive.steam.length=0;kitchenLive.coals.length=0;kitchenLive.herbBase.length=0;
      kitchenLive.herbs=kitchenLive.lid=kitchenLive.mouse=kitchenLive.satyricon=null;kitchenLive.lidOpen=0;
      dineLive.lights.length=0;dineLive.flames.length=0;dineLive.coals.length=0;dineLive.hatch=dineLive.sent=dineLive.pull=null;dineLive.hatchOpen=0;dineLive.pulled=0;
      vicLive.lights.length=0;vicLive.coals.length=0;vicLive.bells.length=0;vicLive.hatch=vicLive.sent=vicLive.feet=vicLive.clock=null;vicLive.hatchOpen=0;vicLive.ringing=-1;
    }
    function animateKitchen(time,dt=.016){
      if(!root||!kitchenLive.lights.length)return;
      const near=Math.hypot(player.pos.x-KITCHEN.cx,player.pos.z-KITCHEN.cz)<16;if(!near)return;
      for(const L of kitchenLive.lights)L.light.intensity=L.base+L.amp*(Math.sin(time*7.3)*.5+Math.sin(time*13.1+1.3)*.3+Math.sin(time*2.1)*.2);
      for(const F of kitchenLive.flames){const k=F.base+F.amp*Math.sin(time*9+(F.phase||0))*Math.sin(time*5.3+(F.phase||0)*.7);F.mesh.scale.set(1,k,1)}
      for(const c of kitchenLive.coals)c.emissiveIntensity=.7+.25*Math.sin(time*1.7)+.1*Math.sin(time*6.1);
      for(const pts of kitchenLive.steam){const a=pts.geometry.attributes.position;for(let i=0;i<a.count;i++){let y=a.getY(i)+dt*.25;if(y>.9)y=0;a.setY(i,y);a.setX(i,a.getX(i)+Math.sin(time+i)*dt*.02)}a.needsUpdate=true}
      if(kitchenLive.herbs){const m4=new THREE.Matrix4(),one=new THREE.Vector3(1,1,1),q=new THREE.Quaternion();
        kitchenLive.herbBase.forEach((p,i)=>{q.setFromAxisAngle(new THREE.Vector3(1,0,0),Math.sin(time*.8+i)*.05).multiply(kitchenLive.herbFlip);m4.compose(p,q,one);kitchenLive.herbs.setMatrixAt(i,m4)});
        kitchenLive.herbs.instanceMatrix.needsUpdate=true}
      if(kitchenLive.lid&&kitchenLive.lidOpen>0&&kitchenLive.lidOpen<1){kitchenLive.lidOpen=Math.min(1,kitchenLive.lidOpen+dt*1.5);kitchenLive.lid.rotation.z=kitchenLive.lidOpen*1.9}
      if(kitchenLive.mouse?.visible)kitchenLive.mouse.position.y=.5+Math.sin(time*1.6)*.006;
    }
    function animateVictorian(time,dt=.016){
      if(!root||!vicLive.lights.length)return;
      if(Math.hypot(player.pos.x-VICTORIAN.cx,player.pos.z-VICTORIAN.cz)>14)return;
      for(const L of vicLive.lights)L.light.intensity=L.base+L.amp*(Math.sin(time*6.7)*.5+Math.sin(time*11.3+.7)*.5);
      for(const c of vicLive.coals)c.emissiveIntensity=.8+.2*Math.sin(time*1.9);
      if(vicLive.clock)vicLive.clock.rotation.z=-Math.floor(time)%60/60*Math.PI*2;
      // The library's bell: rings soon after the reader comes down, then every minute or so, until it has been answered.
      // At the head of the back stairs the reader goes on through the door into the dining room.
      if(inVictorian(player.pos.x,player.pos.z)&&player.pos.x>VICTORIAN.cx+STAIR.dx0+(STAIR.steps-.5)*STAIR.run&&(player.pos.y||0)>STAIR.rise*(STAIR.steps-1.5)){enterDining();return}
      if(!vicLive.sent&&inVictorian(player.pos.x,player.pos.z)&&vicLive.nextRing&&time>vicLive.nextRing){ringBell(time);vicLive.nextRing=time+45+Math.random()*30}
      vicLive.bells.forEach((g,i)=>{const live=i===vicLive.ringing&&time<vicLive.ringUntil;g.rotation.x=live?Math.sin(time*22)*.5*Math.max(0,(vicLive.ringUntil-time)/7):0});
      if(vicLive.hatch&&vicLive.hatchOpen>0&&vicLive.hatchOpen<1){vicLive.hatchOpen=Math.min(1,vicLive.hatchOpen+dt*.8);vicLive.hatch.position.y=vicLive.hatchBase+vicLive.hatchOpen*.62}
      if(vicLive.feet){if(time>vicLive.feetNext){const [a,b]=vicLive.feetRange;vicLive.feetX+=dt*.9;vicLive.feet.position.x=a+vicLive.feetX;vicLive.feet.children.forEach((c,i)=>c.position.y=(i<2?.2:-.06)+Math.max(0,Math.sin(time*7+(i%2)*Math.PI))*.05);
        if(a+vicLive.feetX>b){vicLive.feetX=0;vicLive.feet.position.x=a;vicLive.feetNext=time+14+Math.random()*16}}}
    }
    function animateDining(time,dt=.016){
      if(!root||!dineLive.lights.length)return;
      if(Math.hypot(player.pos.x-DINING.cx,player.pos.z-DINING.cz)>13)return;
      for(const L of dineLive.lights)L.light.intensity=L.base+L.amp*(Math.sin(time*6.1)*.5+Math.sin(time*10.7+.4)*.5);
      for(const c of dineLive.coals)c.emissiveIntensity=.75+.2*Math.sin(time*1.7);
      dineLive.flames.forEach((f,i)=>f.scale.y=1+.18*Math.sin(time*9+i));
      if(dineLive.pull)dineLive.pull.rotation.z=dineLive.pulled&&time-dineLive.pullAt<1.2?Math.sin((time-dineLive.pullAt)*9)*.06:0;
      // The kitchen answers the bell: a little after it is pulled, the dumbwaiter comes up with a covered dish and a book.
      if(dineLive.pulled&&!dineLive.sent&&time-dineLive.pullAt>3.5){if(sendUp(false)){playSample?.('bookPull',.5,.8);showNotice('A rope creaks in the wall, and the dumbwaiter comes up beside the sideboard: a covered dish, and a book.',9)}}
      if(dineLive.hatch&&dineLive.hatchOpen>0&&dineLive.hatchOpen<1){dineLive.hatchOpen=Math.min(1,dineLive.hatchOpen+dt*.8);dineLive.hatch.position.y=dineLive.hatchBase+dineLive.hatchOpen*.62}
    }
    function update(time,dt){
      t=time;animateKitchen(time,dt);animateVictorian(time,dt);animateDining(time,dt);
      if(contains(player.pos.x,player.pos.z)||Math.hypot(player.pos.x-THRESHOLD.x,player.pos.z-THRESHOLD.z)<PRELOAD)activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!shelfBooks.some(b=>b.parent!==root))unload();
    }
    // Where Clio curls up when she is found here: on the warm flagstones before the medieval fire.
    const clioSpot={x:KITCHEN.cx+KITCHEN.w/2-2.1,y:0,z:KITCHEN.cz-1.2,yaw:Math.PI/2};
    return {enter,enterKitchen,enterBelow,enterDining,interact,stair:STAIR,dining:DINING,jib:JIB,menus:MENUS,menuText,get dinnerSent(){return !!dineLive.sent},victorian:VICTORIAN,baizeDoor:BAIZE_DOOR,belowExit:BELOW_EXIT,bells:BELLS,ringBell:()=>ringBell(t),get bellAnswered(){return !!vicLive.sent},contains,zoneAt,allowed,floorAt,update,activate,unload,room:ROOM,kitchen:KITCHEN,kitchenDoor:KITCHEN_DOOR,kitchenEntry:KITCHEN_ENTRY,arch:ARCH,clioSpot,collections:COLLECTIONS,facts,
      openJar:()=>openJar(true),get dormouseFound(){return !!kitchenLive.satyricon},get built(){return !!root},get books(){return shelfBooks.slice()}};
  };
})();
