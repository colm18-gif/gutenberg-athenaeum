const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8');
const game=fs.readFileSync('game.js','utf8');
const css=fs.readFileSync('styles.css','utf8');

test('doors, moving paintings and rockets use distinct recorded effects',()=>{
  assert.match(game,/picturePassage:\{src:'assets\/audio\/painting-passage\.ogg'/);
  assert.match(game,/rocketLaunch:\{src:'assets\/audio\/rocket-launch\.ogg'/);
  assert.match(game,/passageSound:'doorOpen'/);
  assert.match(game,/passageSound:'picturePassage'/);
  assert.match(game,/playSample\(hp\.passageSound\|\|'secretDoor'/);
  for(const asset of ['assets/audio/painting-passage.ogg','assets/audio/rocket-launch.ogg'])assert(fs.statSync(asset).size>5000,`${asset} should contain recorded audio`);
});

test('movement audio is quiet, varied, surface-aware and stops with the visitor',()=>{
  for(const surface of ['wood','concrete','carpet','metal'])for(let i=0;i<3;i++)assert(fs.statSync(`assets/audio/footsteps/${surface}-00${i}.ogg`).size>5000);
  assert.match(game,/const footstepNames=\['woodStep0'/);
  assert.match(game,/function footstepSurface\(\)/);
  assert.match(game,/nightRailway\?\.zoneAt\(x,z\)/);
  assert.match(game,/function stopFootsteps\(\)/);
  assert.match(game,/const cadence=clamp\(\.54-speed\*\.055,\.27,\.48\)/);
  assert.match(game,/if\(surface==='wood'\)/);
  assert.match(game,/playSample\('floorboardCreak'/);
  assert.match(game,/updateFootsteps\(dt\)/);
});

test("the librarian's office is loaded, explorable and full of inspectable records",()=>{
  const office=fs.readFileSync('librarian-office.js','utf8');
  assert.match(html,/loadScript\('librarian-office\.js'\)/);
  assert.match(game,/window\.createLibrarianOffice/);
  assert.match(game,/librarianOffice\.floorAt/);
  assert.match(game,/librarianOffice\.allowed/);
  assert.match(office,/THE LIBRARIAN'S OFFICE/);
  for(const detail of ['appointments ledger','unsent letter','drawer marked LOST KEYS','Plans of the library','office clock'])assert.match(office,new RegExp(detail,'i'));
  assert.match(office,/type:'book',book,loaded:true/);
  assert.match(office,/type:'librarian-office-exit'/);
});

test('the librarian discusses the railway, staircase, Moon, office and recent additions',()=>{
  for(const topic of ['Tell me about the night train','What is at the top of the spiral stair','Why is there a rocket','May I see your office','What have you added lately'])assert.match(game,new RegExp(topic.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  assert.match(game,/Collections Depot/);
  assert.match(game,/Selenite reading outpost/);
});

test('entry offers comfort settings and a recoverable WebGL failure',()=>{
  for(const id of ['entryVolume','entryReducedMotion','entryLowBandwidth','entryHighContrast','entryLargeText'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/webglAvailable/);
  assert.match(html,/Retry opening/);
  assert.match(html,/cdn\.jsdelivr\.net[\s\S]*unpkg\.com/);
  assert.match(html,/reloadOnRetry/);
});

test('exploration remains prompted and discovery-led',()=>{
  assert.match(html,/id="exploreNudge"/);
  assert.match(game,/athenaeum-exploration-prompt-seen/);
  assert.match(html,/id="journalMap"/);
  assert.match(game,/athenaeum-explored-rooms/);
  assert.match(css,/\.map-place\.unknown/);
});

test('books warm their editions without presenting a catalogue',()=>{
  assert.match(game,/caches\.open\('athenaeum-editions-v1'\)/);
  assert.match(game,/queueFocusedPrefetch/);
  assert.match(game,/prefetchBook\(bm\.userData\.book\)/);
  assert.doesNotMatch(html,/id="(?:catalogue|catalog|bookSearch|searchBooks)"/i);
});

test('leave at desk persists a central-stand copy and has a working control',()=>{
  assert.match(game,/let deskBooks=new Set\(\)/);
  assert.match(game,/localStorage\.setItem\('athenaeum-desk-books'/);
  assert.match(game,/function leaveSelectedAtDesk\(\)/);
  assert.match(game,/deskBooks\.has\(id\)\|\|b\.progress>\.02/);
  assert.match(game,/\$\('#leaveBook'\)\.addEventListener\('click',leaveSelectedAtDesk\)/);
});

test('librarian and Quill can physically guide a visitor',()=>{
  assert.match(game,/function guideLibrarian/);
  assert.match(game,/librarianGuideTarget/);
  assert.match(game,/Walk with me/);
  assert.match(game,/catGuideTarget\?1\.45/);
  assert.match(game,/looks directly at you/);
});

test('Quill only meows after direct interaction',()=>{
  const catUpdate=game.match(/function updateCat\([\s\S]*?function updateLibrarian/)?.[0]||'';
  assert.doesNotMatch(catUpdate,/meow\(\)/);
  assert.match(game,/function petCat\([\s\S]*?meow\(\)/);
});

test('neglected rooms progressively disorder their books',()=>{
  assert.match(game,/function curatedShelf\(ids,x,z,rot=0,neglect=0\)/);
  assert.match(game,/fallen=neglect>=2/);
  assert.match(game,/quiet[^;]*,0,1\)/);
  assert.match(game,/unread[^;]*,0,2\)/);
  assert.match(game,/function repositoryRack[\s\S]*fallen=i>=7/);
  assert.match(game,/if\(fallen\)bm\.position\.y=\.14/);
});

test('held books stay fully visible above world geometry',()=>{
  assert.match(game,/function setHeldBookRendering/);
  assert.match(game,/material\.depthTest=false/);
  assert.match(game,/material\.depthWrite=false/);
  assert.match(game,/renderOrder=1000/);
  assert.match(game,/tmpVector\.set\(sway,-\.075\+bob,-1\.95\)/);
  assert.match(game,/tmpVector2\.set\(\.98,\.98,\.98\)/);
  assert.doesNotMatch(html,/loadScript\('held-book-fix\.js'\)/);
});

test('Jules Verne has a concealed author-only voyages room',()=>{
  const context={window:{}};
  vm.runInNewContext(fs.readFileSync('data/verne-catalog.js','utf8'),context);
  const verneBooks=context.window.ATHENAEUM_VERNE_BOOKS;
  assert.equal(verneBooks.length,70);
  assert.equal(new Set(verneBooks.map(([id])=>id)).size,70);
  assert(verneBooks.every(([,title])=>!/\((?:French|Dutch|German|Portuguese|Finnish|Icelandic|Danish|Hungarian|Italian|Modern Greek)/.test(title)));
  assert.match(game,/function vernePortalTexture/);
  assert.match(game,/destination:'verne',spawn:\[190,0,70\]/);
  assert.match(game,/key:'verne',cx:220,cz:70,w:72,d:48/);
  assert.match(game,/themeRoomKeys=new Set\([^\n]*'verne'/);
  assert.match(game,/def\.books=verneCatalog\.map\(record=>record\[0\]\)/);
  assert.match(game,/function verneShelves/);
  assert.match(html,/loadScript\('data\/verne-catalog\.js'\)/);
  assert.match(game,/function verneRoomDetails/);
  assert.match(game,/A model of the Nautilus/);
  assert.match(game,/memoryDoor\(184\.5,70,'mainhall'/);
  assert.match(game,/An old engraving of impossible voyages/);
  assert.match(game,/nineteenth-century steel engraving/);
});

test('Haggard and Conan Doyle have concealed author rooms with distinct period entrances',()=>{
  const haggardContext={window:{}};
  vm.runInNewContext(fs.readFileSync('data/haggard-catalog.js','utf8'),haggardContext);
  vm.runInNewContext(fs.readFileSync('data/haggard-notes.js','utf8'),haggardContext);
  const haggardBooks=haggardContext.window.ATHENAEUM_HAGGARD_BOOKS;
  assert.equal(haggardBooks.length,68);
  assert.equal(new Set(haggardBooks.map(([id])=>id)).size,68);
  assert(haggardBooks.every(([,title])=>!/\((?:Portuguese|Dutch|French|Finnish)\)$/.test(title)));
  assert(haggardBooks.every(([id])=>haggardContext.window.ATHENAEUM_EXTRA_NOTES[id]?.length>80));
  assert.match(html,/loadScript\('data\/haggard-catalog\.js'\)/);
  assert.match(html,/loadScript\('data\/haggard-notes\.js'\)/);
  const doyleContext={window:{}};
  vm.runInNewContext(fs.readFileSync('data/doyle-catalog.js','utf8'),doyleContext);
  vm.runInNewContext(fs.readFileSync('data/doyle-notes.js','utf8'),doyleContext);
  const doyleBooks=doyleContext.window.ATHENAEUM_DOYLE_BOOKS;
  assert.equal(doyleBooks.length,128);
  assert.equal(new Set(doyleBooks.map(([id])=>id)).size,128);
  assert(doyleBooks.every(([,title])=>!/\((?:Finnish|French|Dutch|Danish|German|Polish|Spanish|Interlingua)/.test(title)));
  assert(doyleBooks.every(([id])=>doyleContext.window.ATHENAEUM_EXTRA_NOTES[id]?.length>80));
  assert.match(html,/loadScript\('data\/doyle-catalog\.js'\)/);
  assert.match(html,/loadScript\('data\/doyle-notes\.js'\)/);
  assert.match(game,/function haggardPortalTexture/);
  assert.match(game,/action:'TRACE ROUTE'/);
  assert.match(game,/image:'assets\/painting-haggard-lost-kingdom\.jpg'/);
  assert.match(game,/function hiddenEvidenceCase/);
  assert.match(game,/action:'ALIGN CLUES'/);
  assert.match(game,/hiddenEvidenceCase\(23\.5,4,-13\.65,0,/);
  assert.doesNotMatch(game,/hiddenEvidenceCase\(36\.65,4,-1,/);
  assert.match(game,/image:'assets\/painting-doyle-consulting-room\.jpg'/);
  for(const asset of ['assets/painting-haggard-lost-kingdom.jpg','assets/painting-doyle-consulting-room.jpg'])assert(fs.statSync(asset).size>100000,`${asset} should be a detailed oil painting`);
  assert.match(game,/destination:'haggard',spawn:\[120,0,61\]/);
  assert.match(game,/destination:'doyle',spawn:\[140,0,95\]/);
  assert.match(game,/key:'haggard',cx:120,cz:72,w:72,d:30/);
  assert.match(game,/key:'doyle',cx:140,cz:110,w:56,d:38/);
  assert.match(game,/authorRooms=\{haggard:'H\. Rider Haggard'\}/);
  assert.match(game,/def\.books=doyleCatalog\.map\(record=>record\[0\]\)/);
  assert.match(game,/function doyleShelves/);
  assert.match(game,/function haggardRoomDetails/);
  assert.match(game,/function doyleRoomDetails/);
  assert.match(game,/def\.books=haggardCatalog\.map\(record=>record\[0\]\)/);
  assert.match(game,/memoryDoor\(120,57,'mainhall'/);
  assert.match(game,/memoryDoor\(140,91,'mainhall'/);
  for(const id of [3155,2166,711,5228,6769,1207,2769,2721,5746,2841])assert.match(game,new RegExp('\\['+id+',[^\\r\\n]*H\\. Rider Haggard'));
  for(const id of [1661,244,2097,221,2852,834,139,126,439,1638])assert.match(game,new RegExp('\\['+id+',[^\\r\\n]*Arthur Conan Doyle'));
});

test('H. G. Wells has a complete English-only Project Gutenberg room with librarian notes',()=>{
  const wellsContext={window:{}};
  vm.runInNewContext(fs.readFileSync('data/wells-catalog.js','utf8'),wellsContext);
  vm.runInNewContext(fs.readFileSync('data/wells-notes.js','utf8'),wellsContext);
  const wellsBooks=wellsContext.window.ATHENAEUM_WELLS_BOOKS;
  assert.equal(wellsBooks.length,104);
  assert.equal(new Set(wellsBooks.map(([id])=>id)).size,104);
  assert(wellsBooks.every(([,title])=>!/\((?:Dutch|Finnish|French|Hungarian)\)$/.test(title)));
  assert(wellsBooks.every(([id])=>wellsContext.window.ATHENAEUM_EXTRA_NOTES[id]?.length>80));
  assert.match(html,/loadScript\('data\/wells-catalog\.js'\)/);
  assert.match(html,/loadScript\('data\/wells-notes\.js'\)/);
  assert.match(game,/destination:'wells',spawn:\[220,0,104\]/);
  assert.match(game,/key:'wells',cx:220,cz:115,w:72,d:30/);
  assert.match(game,/def\.books=wellsCatalog\.map\(record=>record\[0\]\)/);
  assert.match(game,/memoryDoor\(220,100,'mainhall'/);
});

test('hidden doors preserve the configured arrival yaw',()=>{
  assert.match(game,/const hp=\{progress:0,destination:opts\.destination,spawn:opts\.spawn,yaw:opts\.yaw,passageSound:'doorOpen',apply:p=>\{panel\.rotation\.y/);
  assert.doesNotMatch(game,/yaw:opts\.y,/);
});

test('themed-room exits face clear south walls and return beside their discoveries',()=>{
  assert.match(game,/function memoryDoor\([^\n]+rot=0,themeExit=false\)[^\n]+group\.rotation\.y=rot/);
  const exits=[
    ['gothic',95,22,0,-27],['inquiry',120,22,14,-27],['chart',145,22,-33,9],
    ['drawing',95,54,-33,-8],['study',120,54,30,-10.5],['garden',145,54,33,-9],
    ['haggard',120,57,-34.5,5],['doyle',140,91,23.5,-10.5]
  ];
  for(const [name,x,z,sx,sz] of exits){
    assert.match(game,new RegExp(`memoryDoor\\(${x},${z},'mainhall',\\[${sx},0,${sz}\\][^;]+Math\\.PI/2,true\\)`),`${name} exit should be aligned with its south wall`);
  }
  assert.match(game,/memoryDoor\(184\.5,70,'mainhall',\[34\.5,0,5\][^;]+1\.9,0,true\)/,'verne exit should sit in its clear west wall');
  for(const oldCall of ["memoryDoor(95,20,'mainhall'","memoryDoor(95,40,'mainhall'","memoryDoor(170,39,'mainhall'","memoryDoor(108,63,'mainhall'","memoryDoor(138,63,'mainhall'"])assert.doesNotMatch(game,new RegExp(oldCall.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  assert.match(game,/memoryDoor\(140,91,'mainhall',\[23\.5,0,-10\.5\]/);
});

test('reading-room seats face their shelves and benches use Gothic upholstery',()=>{
  assert.match(game,/chair\(room\.cx,room\.cz\+3,0,Object\.assign/);
  assert.match(game,/chair\(contested\.cx,contested\.cz\+3,0,/);
  assert.match(game,/options\.model\|\|'sofa'/);
  assert.doesNotMatch(game,/bench\([^;\n]*model:'paintedSofa'/);
});

test('visual repair pass keeps library materials and wayfinding legible',()=>{
  assert.match(game,/const stairMasonry=[^\n]+map:masonryTex/);
  assert.match(game,/fillTop=\.42\+i\*\.4/);
  assert.match(game,/themeExitDoorMaterial/);
  assert.match(game,/fillText\('RETURN'/);
  assert.match(game,/returnRunnerMaterial/);
  assert.match(game,/createHearthFire/);
  assert.match(game,/realisticFlames/);
  assert.match(game,/LIGHT ANOTHER LAMP/);
  assert.match(game,/kind==='evidence-board'[^\n]+BOOT PRINT[^\n]+POCKET WATCH/);
  assert.match(game,/roofStairUnderwall=box\(5\.65,6\.55,\.72,MAT\.stone,14\.25,3\.275,31\.08/);
  assert.match(game,/for\(let i=0;i<14;i\+\+\)[^\n]+27\.15\+i\*\.72/);
  assert.match(game,/galleryPicture\(-51\.68,3\.5,-7\.15/);
  assert.match(game,/supportBox\.rotation\.y\+=Math\.PI/);
  assert.match(game,/const whiteVolumeTex=canvasTexture/);
  assert.match(game,/fillText\('THE WHITE'/);
  assert.match(game,/whiteVolumeGroup\.position\.y=THREE\.MathUtils\.damp/);
  assert.match(game,/picturePassage:\{src:'assets\/audio\/painting-passage\.ogg'/);
  assert.match(game,/if\(\/Quill\/i\.test\(t\)&&!inMainLibrary\)return/);
  assert.match(game,/new THREE\.AmbientLight\(0xd0a879,1\.75\)/);
  assert.match(game,/ambient\.intensity=1\.68\+daylight\*\.68/);
  assert.match(game,/toneMappingExposure=1\.95\+daylight\*\.32/);
  assert.match(game,/ambient\.intensity\*=1-depth\*\.62/);
  assert.match(game,/readerLantern\.intensity=selected\?6\.4:6\.4\*\(1-depth\*\.45\)/);
  assert.match(game,/scene\.fog\.density=depot\?\.014:\.032/);
  assert.match(game,/ambient\.intensity=depot\?1\.12:\.58/);
});
