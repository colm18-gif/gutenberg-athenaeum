# The Library After Dark: notes for Claude

A 3D library of public-domain books you walk through in the browser (Three.js r160, no build step), live at
https://libraryafterdark.space (GitHub Pages from `main`). The owner does not review code: work on a branch, open a
PR, merge it once the `test` check passes, then bring the branch up to date with `main`.

## Working here

- Run the tests with `node --test *.test.cjs` (all must pass). Syntax-check changed files with `node --check`.
- Startup scripts are listed in `index.html` via `startupScript(...)`; `game.js` runs last and wires everything
  together by wrapping functions (`floorHeight`, `allowed`, `interact`, `selectBook`, `updateWorld`…). A new
  startup script means updating the script count in `experience.test.cjs` and bumping `BUILD` in `index.html`.
  Files the jobs rewrite without a new build are listed in `LIVE_DATA` there.
- Rooms behind doors (`evening-room.js`, `learners-room.js`, `periodicals-room.js`, `international-wing.js`,
  `crusoe-island.js`, `mars.js`, `poe-room.js`, `irish-room.js`, `map-room.js`, `medicine-room.js`, `set-texts-room.js`,
  `austen-room.js`, `burns-room.js`, `within-room.js`, `naturalist-room.js`, `forest.js`, `walden.js`)
  are built only when the reader approaches and freed ~25 s after they leave. So are the Room of Chance (its portrait
  stays), the Lost Property Office (its hatch stays) and the high staircase, Rocket Hall, Moon and rocket cabin (`high-staircase.js`: only its door in the west wing
  is built at startup; a stair book carried away keeps it). The basement and the roof garden, built in `game.js` on a first visit, are
  freed the same way (`beginFreeable`/`endFreeable`/`freeBuild`: their zone's new parts go, and the colliders, seats,
  interactables and lamps they registered are given back). A freed room marks its lights `userData.freed` so the light
  budget lets them go. Each gets an ambience recipe in
  `room-ambience.js` and a place in `PLACE_GROUPS` in `game.js`.
- The Poe Room (`poe-room.js`, x −330, z −140) is behind a chamber door in the Gothic Parlour's west wall, under a raven on a
  bust of Pallas (`?room=poe`). A heart beats under the floor, louder near the loose board (made with game.js's `sound`, no
  file); lifting the board gives up Volume 2 of the Raven Edition, which opens at The Tell-Tale Heart (`pendingStory`).
- The Irish Room (`irish-room.js`, x −330, z −205), Seomra na hÉireann, is behind a green Georgian door in the Grand Hall's
  south wall (x −8.3; `?room=irish`), gilded IRELAND & SCOTLAND on the hall side because the Burns Room opens off it: shelves `irish-myth`, `irish-revival`, `irish-writers` and `irish-gaeilge` in
  `data/new-books.js` (the last checked as Irish, `ga`), round a turf fire, with a harp, a St Brigid's cross and an ogham stone.
  In the middle of the room, under a glass case on a plinth, the facsimile of the Book of Kells (`kells-book.js`) lies open at
  a real opening (folio 32v, Christ enthroned, facing 33r, the carpet page); anything on the case opens it in its own viewer:
  eighteen public-domain pages from Wikimedia Commons (`scripts/fetch-book-pages.mjs`, Book images workflow, `assets/kells`),
  a drawn title page and colophon, on thick board leaves that turn rigidly on the spine (drag, swipe or arrows; zoom; one
  page at a time on a narrow screen). While a fine book is open the world is not drawn; the book renders its own small
  scene with the same renderer. The room's secret: a sod fallen from the turf creel by the hearth; lifting it uncovers the
  Book of Durrow (`durrow-book.js`, Trinity MS 57, five pages in `assets/durrow`, and a drawn page on its older order of the
  evangelists' symbols), hidden as the great Gospel of Colum Cille was found under a sod in 1007 (found once, found for
  good: `athenaeum-durrow-found`; `?durrow` shows it at once).
- The Restricted Catalogue (game.js, x 37–57, z −12–8, built at startup) has the Voynich Manuscript (`voynich-book.js`,
  Beinecke MS 408) lying open on its lectern at the pansy of folio 9v facing 10r, chained, its padlock open (moved aside to
  x 47.95): the one book there nobody has needed to forbid. Anything on it, or its card, opens the facsimile (`?room=voynich`
  stands the reader before it). Fifteen pages, a real opening from each part, from the Beinecke's numbered photographs on
  Commons (photograph n: 3 is folio 1r; checked against the folio numbers on the rectos), and drawn pages written in its
  script (`glyphs`, after its commonest EVA words); The whole book reads the Beinecke scan on Commons (214 images, one ahead
  of the photographs; marks checked against the scan's own captions). Behind the lectern, on the south wall, a case of
  books on ciphers, herbals and failed decipherments, the shelf `ciphers` in `data/new-books.js`.
- The fine books share one engine, `fine-books.js` (cradle, stiff board leaves, zoom, captions, loading only the spreads
  either side of the open one); each book is a description: `kells-book.js`, `durrow-book.js` (which borrows the Kells ornament), `kelmscott-book.js`,
  `vesalius-book.js`, `voynich-book.js`, `folio-book.js` (pages and cards, drawn pages, binding, paper, type). Their photographs come from Wikimedia Commons by `scripts/fetch-book-pages.mjs` (Book
  images workflow; public domain only). A book listed with no pages is surveyed in the log instead (with `thumbs`, it also commits
  numbered sheets of the larger files to `<dir>/survey`, to be looked at and removed; `thumbOnly` picks which, to look far
  into a long numbered scan), which is how pages are chosen from
  what Commons really holds. A book whose description has `whole` (Kells, the Fabrica and the First Folio) also has
  a button, The whole book, that opens `whole-book.js`: every page of a complete public-domain scan on Commons (Trinity's
  681-image scan of Kells; the National Library of Medicine's 730-page Fabrica), fetched page by page from
  upload.wikimedia.org as the reader turns, never kept in the repository. Commons serves only standard widths (960 and 1280
  work; 640 is refused) and is slow the first time a page is drawn. Pages are numbered as in the scan; marked places and
  `pageFor` were checked by eye (Kells's scan runs two ahead of the folios from somewhere between folios 34 and 114). A room that shows pages in a glass case or a frame lists them as `display`, and loads the
  768-pixel `<key>-case.jpg` copies the workflow writes, never the full pages. Commons has no large copies of Kells 124r, 129v, 285r, 290v or 291v. The Periodicals Room's secret is the Kelmscott Chaucer: pull the bar of the
  Albion hand press by the door and it prints the Chaucer's first page and gives up the book (`?kelmscott` shows it). Its
  pages are the woodcut title and seven facing openings from the Internet Archive's scan (a page's number is its place in
  the scan less twelve).
- The Medicine Room (`medicine-room.js`, x −420, z −140) is behind a door at the south end of the Map Room's east wall
  (`?room=medicine`), a few steps from Snow's cholera map; `map-room.js` stops its east shelf short (`EAST_SHELF`) to leave
  that end of the wall clear. A history of medicine on three shelves, `medicine-physic`, `medicine-discovery` and
  `medicine-healers` in `data/new-books.js`. In the middle, under glass, the
  facsimile of Vesalius's Fabrica of 1543 (`vesalius-book.js`) lies open at the skeletons of pages 164 and 165: its title,
  the portrait and eleven pages from Wikimedia Commons (`assets/vesalius`, chosen from a survey), named for their page in
  the 1543 edition. The title page and portrait also hang framed either side of the room's door. The muscle men are flayed
  figures: keep the plates on the walls and in the case to the skeletons, the title and the portrait.
- The Naturalist's Cabinet (`naturalist-room.js`, x −500, z −140) is behind a conservatory-green door at the south end of
  the Medicine Room's west wall (`?room=naturalist`, `darwin`); `medicine-room.js` sets its west shelf back (`WEST_SHELF`) to
  leave that end clear. Darwin's study and a cabinet of curiosities: shelves `nature-origin` (headed by the library's own
  Origin, 1228), `nature-collectors` and `nature-observers` (headed by its Selborne, 1408) in `data/new-books.js`, a dome of hummingbirds, a glazed case of shells, eggs and butterflies, a drawer of beetles,
  the Sandwalk through the south window, and the writing table with a microscope and Wallace's letter from Ternate.
  Darwin's armchair and the writing chair are seats. The secret is in the table's drawer: the essay of 1844 with his letter to
  Emma (shelf `nature-sealed`, The Foundations of the Origin of Species), found for good (`athenaeum-darwin-sketch`;
  `?sketch`); the letter's words, and Huxley's in his note, are checked against the bundled texts. Audubon's Birds of America
  is to come as a fine book: `audubon` in `scripts/fetch-book-pages.mjs` is only surveyed so far.
- The Austen Room (`austen-room.js`, x 500, z −160) is behind a door in the Grand Hall's west wall (x −18.72, z 12.9), between
  the gramophone and the botanist's portrait (`?room=austen`): a Regency drawing room for Jane Austen. Her six novels stand
  face-out on the north wall in the order they were published (`NOVELS`: five are the hall's own copies; Northanger Abbey is
  the shelf `austen-novels`), under a silhouette; shelves `austen-writings`, `austen-lives` and `austen-read` in
  `data/new-books.js`. A writing table by the window, a sofa and its chair are
  seats; the square pianoforte plays a country-dance strain (`tone`, game.js's `pianoTone`, no file); the door creaks, as the
  one at Chawton did. The room's secret is Catherine Morland's black japanned cabinet: opening it finds a list of linen and, behind it, Mrs Radcliffe
  (Udolpho, the library's own copy, and the shelf `austen-horrid`); found once, found for good (`athenaeum-austen-cabinet`;
  `?udolpho` opens it). None of the seven Northanger "horrid novels" is on Gutenberg.
- The Burns Room (`burns-room.js`, x 500, z −300) is through a planked green door at the east end of the Irish Room's
  south wall, past the harp (Kintyre is twelve miles from Antrim; `?room=burns`): an Ayrshire cottage for Robert Burns,
  with a box bed, a coal fire, a table set for a Burns Supper (haggis, quaich) and two chairs that are seats. Shelves
  `burns-works`, `burns-lives` and `burns-scotland` in `data/new-books.js` (a test
  walks the Irish Room's own floor to the door). The fiddle by the hearth plays Auld Lang Syne (`pianoTone` with voice
  `fiddle`). Its coal fire crackles (`crackle` and `snap` events in `room-ambience.js`) and its embers flicker. The secret is Tam o' Shanter's: the window looks out to Alloway Kirk; looking in, the witches dance to the
  Devil's pipes (voice `pipes`) until "Weel done, Cutty-sark!", and Tam O'Shanter (shelf `burns-cutty`) is left on the
  sill, found for good (`athenaeum-burns-cutty-sark`; `?cuttysark`). The Grand Hall's walls are full, which is why the
  door is in the Irish Room. Built for Burns Night (25 January): Burns clubs plan their suppers in November and December.
- Walden Pond (`walden.js`, centre x 900, z −100; walkable within 32 m) is out through a glazed green garden door at the east
  end of the Naturalist's Cabinet's south wall, past the window and the writing table (`?room=walden`, `thoreau`, `concord`):
  Thoreau's clearing on a summer night, with the house (ten feet by fifteen, door at the south end, brick fireplace
  opposite, a large window each side; walkable inside, the reader's radius shrinks to 0.25 m in and around it), his bed,
  his desk with the japanned lamp (the place's one light) and three chairs that are seats (solitude, friendship, society,
  the third outside). His own books are on the shelf in the house (shelf `walden-thoreau`); the library's own Walden (205)
  lies on his desk (`ownCopy`); the Concord circle's (`walden-concord`: Emerson, Fuller, Bronson Alcott, Hawthorne and their historians)
  stand by his three-legged table under an awning among the pines. The
  bean-field, the woodpile, the boat drawn up on the sand with his flute (`pianoTone` voice `flute`; the perch glint) and
  the cod-line he sounded the pond with (102 feet), a loon that dives, fireflies, and bullfrogs and whippoorwills in
  `room-ambience.js`. The secret is the hound, the bay horse and the turtle-dove (the page on his desk): going near each
  one's place (paw prints north-east, hoofprints on the road north-west, the east shore) brings it once; all three and his
  Journal (shelf `walden-journal`) is left on the doorstep, found for good (`athenaeum-walden-lost`, `athenaeum-walden-journal`;
  `?hound` shows it). Every word given to Thoreau is checked against `texts/pg205.txt` by a test (`WALDEN`, and every
  quotation on a card). Trees are two InstancedMeshes; inside the clearing the sky and fog are darkened and the library's
  ambient and moonlight turned down, as in the Deep Wood.
- The Deep Wood (`forest.js`, centre x 800, z 400; walkable within 40 m) is a forest at night, eerie, not frightening (no
  howling, nothing jumps out). Two ways in: the window hung on the Garden Room's west wall (the theme room at x 145, z 46;
  `hangGardenWindow` is called whenever that room is built), and a button, Step into the woodcut, that the reader shows
  for the Grimms' Fairy Tales (2591) alone (`?room=forest`, `grimm`, `woods`). The places of the tales stand in clearings:
  the house of bread with windows of clear sugar, Rapunzel's tower and braid, the cool spring with the golden ball,
  Grandmother's house under the three large oak-trees, Red-Cap's basket, the hedge of thorns round Briar Rose's palace,
  Baba Yaga's turning hut and the Little Glass Man's great fir. Books are found, not shelved: shelf `forest-tales` (each
  placed by `PLACES`) and `forest-eerie` (among the old oak's roots, for older readers) in `data/new-books.js` (a test
  walks from the arrival to every book). Hansel's white pebbles lead back to the
  freestanding window; the crumbs on the other path lead nowhere. A wisp goes ahead towards the nearest book not yet
  found (`athenaeum-forest-found`). Every Grimm quotation is checked against pg2591. Trees are two InstancedMeshes,
  no lights: inside the wood the sky and fog are darkened and the library's ambient and moonlight turned down.
- The Room of Books Within Books (`within-room.js`, x 500, z −440) is reached through the card catalogue against the Grand
  Hall's west wall (x −18.45, z 7.3, between the wing door's open leaf and the gramophone; `?room=within`). The first drawer
  pulled holds a card for a book that was never written; the next, the drawer marked with a dash between Li–Ly and Ma–Me,
  slides out further than the cabinet is deep, and the reader goes in (found for good: `athenaeum-within-found`; `?within`).
  West wall: the books that never were (`NEVER`: Holmes's monographs, Moriarty's, Dr Mortimer's, then Casaubon's Key,
  Branderham's sermon, Mr Dick's Memorial, the Looking-glass book…), drawn on one atlas texture; reading a card twice opens
  the real book at the page (`openBook` in game.js sets `pendingPassage`, matched on letters alone). Dorian Gray and The King
  in Yellow are secret editions, so their cards never open them. East wall: real books read in other books (`READS`, shelves
  `within-copperfield` and `within-read`); Heimskringla on the lectern (`within-lectern`) with Saknussemm's parchment;
  some hosts are `within-hosts`. Every quotation on a card must be in its book: a test checks each
  against the bundled text where there is one, and the rest were checked against the texts by hand. Never invent a title for
  an imaginary book the text doesn't give (say so on the card, as for Holmes's cipher monograph).
- The Set Texts Room (`set-texts-room.js`, x −330, z 60) is behind a blue door in the English Reading Room's east wall
  (`?room=set-texts`): the plays and novels most often set for GCSE English Literature (Shakespeare on the west wall, from
  `PLAYS` and the room `set-texts` in `data/new-books.js`; the nineteenth-century novel on the north wall, `NOVELS`), a long
  table of seats, and a board for teachers. They are kept out of the English Reading Room, which has only one darker book.
  Its page for teachers, `set-texts/index.html`, is generated by `scripts/book-pages.mjs` (never edit it by hand): each
  text with ways to read it, its LibriVox recording, and its plain text, where `read.html` gives every chapter, act and
  scene an address (`read.html?book=46#stave-iii`, `#act-ii-scene-ii`) and a Contents. On the lectern by the east wall lies
  *Poems from the Anthologies* (book 940001, added in game.js): the public-domain poems of the GCSE anthologies, bound
  from en.wikisource.org by `scripts/anthology.mjs` (Anthology workflow) into `texts/bundled-gzip/pg940001.txt.gz`. Each
  poem (`POEMS`) is taken from its named first line to its last, with its stanza shape checked where a page's layout
  can't be trusted and a transcriber's slip mended only by an explicit `fix`; the teachers' page links each one by its
  heading (`#ozymandias`). Its librarian's note counts the poems: keep it right when adding one. In the middle of the
  room, under glass between the novels and the table, the facsimile of the First Folio (`folio-book.js`, handed to the
  room as `folio`; `?room=folio`) lies open at Droeshout's title page facing Jonson's To the Reader. Its twenty-five pages
  are from the one copy on Commons photographed complete, `First Folio, Shakespeare - 0001.jpg` to `0907.jpg` (`SCAN`
  gives each page's place; Comedies page n is scan n+18; the Tragedies are misnumbered, so a page is named for the number
  printed on it), bound as real openings (a verso and the next photograph): the preliminaries, the Tempest, Much Ado, the
  Merchant and Twelfth Night each opposite the FINIS before them, Romeo's feast and orchard, Caesar's Ides, Macbeth's
  banquet and cauldron, Hamlet's "To be", and the colophon. Every quotation on its cards was read off the photograph. Its
  whole book reads the same series a file a page (`series`, with each file's MD5 folders in `hashes`; 960 wide only).
- The Room of Chance (`chance-room.js`, x 500, z 60, clear of the Moon at x 340, z 30) is behind a small crooked portrait
  on the east wing's east wall (x 36.6, z 2.05), between the Restricted Catalogue's gate and the Verne engraving
  (`?room=chance`): forty-two books shuffled afresh on each visit, a table, and a plaque, NO ORDER GOVERNS THESE SHELVES.
- The Lost Property Office (`book-lift.js`, x 500, z 220) is reached by a book lift, not a door: a dumbwaiter hatch in the
  west wing's south wall (x −33.9, set in the wainscot between the hidden passage and the STAFF · SORTING door). Ring the
  bell and the shutter rolls up; the reader rides the car down a shaft (floors painted on its wall: WEST WING, BASEMENT,
  SUB-BASEMENT) and steps out into the office; the car, or the plaque over its mouth, takes them up again (`?room=lost-property`,
  `lift`). Its stock is the shelf `lost-property` in `data/new-books.js`: books of every kind. Eighteen
  are out at random on each visit, in pigeonholes, each with an invented tag saying where it was found (`FOUND`); the
  bell on the counter clears them and brings out a lot that was not just there. A book carried to the car is put back.
  Keep the stock at thirty or more so two lots never overlap.
- The Unwelcome Spines (`buildContestedRoom` in `game.js`, x 170, z 14) is behind the door bound in banned pages beyond
  the Restricted Catalogue: books once banned, burned, prosecuted or suppressed, from the shelf `contested` in
  `data/new-books.js` (category `Contested`, which the room's chair and the east-side recommendations draw on),, in
  three cases of ten.
- The four memory rooms below the catalogue (`buildMemoryRooms` in `game.js`, x 72–167, z −20, through the basement:
  Names in the Dust, The Longer Silence, St—ll W—ting and What Was Kept) are stocked from the shelves `returning`,
  `quiet`, `unread` and `repository` in `data/new-books.js`. The Repository's
  four racks hold 36 distinct books and its request desk one more.
- The Ukrainian Reading Room (`international-wing.js`, `dressUkrainian` and `furnishUkrainian`) keeps apart from its main
  racks (`apart`) the shelf of the Executed Renaissance by its door (`MEMORIAL`: eight titles from the room's list, under a
  plaque and a candle whose flame flickers in `room.ticks`, no light) and the book in Shevchenko's boot (`boot:'Княжна'`):
  a soldier's boot under his 1848 drawing of Raim on the Syr Darya; looking in finds the little book he hid there in exile, which then lies on
  the trunk beside it, found for good (`athenaeum-shevchenko-boot`). Its pictures (Kateryna, «Укріплення Раїм. Вид з верфі на Сир-Дар'ї», 1848, not a self-portrait as Commons has it,
  Pymonenko's Ukrainian Night) are fetched by `scripts/fetch-maps.mjs` (`PICTURES`, into `assets/pictures`). The bandura
  plays Leontovych's Shchedryk on the synthesiser's plucked `bandura` voice (`tone`, game.js's `pianoTone`); a didukh
  stands from 24 December to 19 January; on 9 November (the Day of Ukrainian Writing and Language) the Eneida is on the
  lectern. In the middle of its west side, under glass, the Peresopnytsia Gospel (`peresopnytsia-book.js`, handed to the
  wing as `gospel`) lies open at Mark's portrait facing leaf 129, the first page of his Gospel: three colour photographs
  from Commons and seven plates of Gruzinsky's printed facsimile of 1911 (pages of its PDF on Commons, `trimScan` cuts away
  the bare page round each plate), with drawn notes on the word оукраины on leaf 82 and on the presidents' oath. Commons
  has no other usable photographs of it. The Catalogue lookup also searches Ukrainian Wikisource (`ws <page>`, `ws? <words>`) and Commons
  (`commons? <words>`). A Wikisource page that only lists editions has too little text: give the edition's own page.
- The Kipling bookcase (`kipling-shelf.js`) stands against the Grand Hall's west wall in the south-west corner (x −18.54,
  z 29.1, between the column at z 27 and the corner; `?room=kipling`): Rudyard Kipling's books face-out in the order he
  published them, four shelves of three, from the shelf `kipling` in `data/new-books.js`, under a brass plate whose card says where his other books are. Added after the Kipling Society wrote in.
- The Map Room (`map-room.js`, x −420, z −60) is behind a door in the west wing's north wall (x −21.4; `?room=maps`): twenty
  old maps hung edge to edge (Mercator, Waldseemüller, the Hereford Mappa Mundi, Piri Reis, the Catalan Atlas, Ricci,
  John Snow's cholera map and William Smith's on the map table…), each with a card in `MAPS`. Looking at one opens the
  map viewer (zoom, drag, pinch; arrows walk round the room's maps; Escape puts it back). The images are public-domain
  files from Wikimedia Commons, fetched by `scripts/fetch-maps.mjs` (Map images workflow) into `assets/maps`
  (`<key>.jpg` for the viewer, `<key>-wall.jpg` for the frame, `maps.json` for the credits); the Bellman's blank chart
  from the Snark is drawn there instead. New maps: add them to the script, then to `MAPS` and `HANG`. Shelves
  `map-voyages`, `map-makers` and `map-lands` in `data/new-books.js`.
- The Antipodes (`antipodes.js`, x −330, z −290; the well at x −330, z −420) is reached through the Earth, not a door: turn
  the great globe in the middle of the Grand Hall (x 0, z −9.6) and a trapdoor opens at its foot; stepping in, the reader
  falls down a well like Alice's (shelves, cupboards, maps on pegs, the marmalade jar) past the glowing centre, turns over,
  and comes up in a hall under a skylight of southern stars, with live clocks for Perth, Sydney and Wellington. The
  Australian Room is to the west, the New Zealand Room to the east (rooms `antipodes`, `australian`, `new-zealand` in
  `data/new-books.js`); a second globe there falls back home. `?room=antipodes`, `australia` or `nz` go straight there.
- The southern passage (`antipodes.js`) starts at the sea-chart cabinet in the Australian Room's south-east corner
  (x −338.5, z −283). Turn the compass: the panel swings aside over a real cut-out in the wall and dado, revealing a
  walkable lantern-lit quay. Board the expedition ship, then turn its brass wheel to cast off. The outward voyage is
  30 seconds (return 24; reduced motion 14 with no roll), with departure, ocean/icebergs and approach stages. The
  voyage card offers cast-off, an optional continue-to-landing control and explicit disembarkation (E casts off or
  finishes the crossing; G steps ashore; Escape releases mouse lock without opening pause while aboard). The open hut at
  x −345, z −327 holds the four polar books on its back shelves. Follow the lanterns from the landing to its door;
  use the waiting ship to return. The quay, deck and hut enter the journal only as discovered. All scenery and sea
  chart art are procedural, with no extra downloads or point lights; the ocean is built on cast-off and freed with
  the Antipodes. Moving boat controls use `performanceDynamic` for the focus index and batching exclusions.
  `travelling` locks walking only while sailing; aboard a moored ship, `floorAt` supplies the deck's 0.91 m floor.
  Reset cancels the voyage synchronously, so R cannot trigger a late arrival; a new Antipodes visit remooring in
  Australia keeps the boat available. Sea, wind and timber sounds use existing generated ambience recipes.
  Snow is a `THREE.Points` object: using the mesh helper would connect the flakes into huge triangles across the hut.
  Both moorings have walkable 1.8 m gangways rising continuously from shore to deck height. `GANGWAYS` supplies the
  visible ramps, floor heights and walking bounds; the boat rail has matching gaps. Walking on/off the deck updates
  boarding automatically, with E/G and the voyage card retained as alternatives. Keep these paths available before
  `aboard` is set: making deck or gangway collision depend on boarding first prevents walking aboard.
- The African Reading Room (`african-room.js`, courtyard x −600, z −294; room north of it) is reached by balloon: a
  balloon moored in the roof garden's south-west corner (x −13, z 51.5) rises over the town, crosses a cloud sea (built at
  x −900 for the flight, inside the camera's 130 m) and sinks into a walled courtyard with a baobab. The room is in the
  Sahelian manner of Djenné and Timbuktu (shelves `african-ancient`, `african-voices`, `african-tales` in
  `data/new-books.js`); the courtyard's balloon flies home. `?room=africa` goes straight to the courtyard.
- The Thousand and One Nights (`nights-room.js`, courtyard x 700, z −420; the qa'a north of it) is reached by flying carpet:
  a carpet lies rolled and tied by the Grand Hall's fire (x −11.5, z −14, clear of Clio's corner and the north rug). Untie it
  and it unrolls (it rolls itself up again once the reader is 14 m away); sit on it and it lifts, crosses a desert at night
  (a sky built at x 900, y 300, z 600 for the flight, then freed) and sinks into a courtyard with a fountain and orange trees;
  the carpet there flies home to the fire. Shelves `nights-tales` (the Nights in English: Burton, Payne, Lane, Galland, Dulac),
  `nights-poets` (Persia and Arabia) and `nights-echoes` (the West's Nights) in `data/new-books.js` (Lang's own
  Arabian Nights, 128, stays in the Room of Books Within Books). The divan is a seat. The secret is the lamp on
  the brass tray: rubbed, it smokes, asks "What is thy will?" and leaves Payne's Alaeddin (`nights-lamp`) and a card on Hanna
  Diyab, who told Galland Aladdin in 1709 (found for good: `athenaeum-nights-lamp`; `?lamp`). A brass plate by the door counts
  the nights the reader has come (`athenaeum-nights-visits`). Words given to Scheherazade and the genie are Lang's, checked
  against `texts/bundled-gzip/pg128.txt.gz` by a test (`LANG`). `?room=nights` (`carpet`, `scheherazade`, `aladdin`) goes to
  the courtyard. Two lights only (a lantern and the room's lamp); the hanging lanterns are one InstancedMesh.
- Crusoe's island (`crusoe-island.js`, through the Boathouse door in the Grand Hall's south wall) has Robinson himself by his
  fire (goatskin cap, umbrella of skins, his old dog at his right hand), who turns to the reader and speaks lines from the book
  (`ROBINSON`; the footprint and Fridays change what he says), his goats in their pen, the barley, the great canoe that never
  reached the water, two earthen jars, raisins drying, the "O drug!" money and his journal on the table (`JOURNAL`, opened at
  today's date or the last entry before it), and the wreck on the reef. Every word given to him is checked against
  `texts/pg521.txt` by a test. His own copy of Robinson Crusoe lies on the sea chest (`ownCopy`).
- Clio (once Quill), the library cat, has a corner under the portrait on the Grand Hall's west wall by the fire
  (`clioCorner` in game.js, x −18, z −21 to −19): a wicker basket she sometimes sleeps in, a saucer of milk she drinks
  from (the jug beside it fills it), a scratching post, and a tin of treats on a shelf. Her errands to them are run
  after her haunts ("Clio's errands", wrapping `updateCat`, `guideCat` and `interact`); shaking the tin brings her at a
  run for a treat, three in five minutes and then she has had enough. Showing the reader something always comes first.
  She purrs (`purr` in game.js, made from pulsed noise, no file) when petted, after a treat, and in her basket when a
  reader comes close.
- Clio, the library cat, is sometimes found asleep in the Irish Room, the Poe Room or a wing reading room (the same
  cat moved and curled up; `?clio` makes it every time). The librarian stays in the Grand Hall.
- Back ways (`passages.js`): seven short passages join neighbouring rooms behind doors, so a reader can wander without
  going back to the Grand Hall: the Cellar Stair (Poe Room ↔ Irish Room, down), the Night Corridor (English Reading Room
  ↔ Poe Room), the Long Gallery (Medicine Room ↔ English Reading Room; the Map Room's walls are hung edge to edge, so it
  is reached through the Medicine Room), the Back Stair (Burns Room ↔ Austen Room, up), the Stacks Stair (Burns Room ↔
  Room of Books Within Books, up), the Servants' Passage (Evening Room ↔ Periodicals Room, with the Set Texts Room's door
  halfway) and the Sorting Corridor (Room of Chance ↔ Lost Property Office). The rooms reached by air (the Nights, the
  African room), by boat (Crusoe's island) and by rocket (Moon, Mars) stay that way, at the owner's wish (a test checks).
  Each door is a wall and a distance along it (`ends`), measured clear of the rooms' shelves and pictures; a door is hung
  only while its room is built, and a passage is built when entered and freed 25 s after. Passages stand at x 1200
  (z −600, 40 m apart), floors between y 0 and 3 (below 0 wakes the basement). One lamp, the module's own, moves to the
  passage in use. Rooms export `activate` so a passage can build the room before the reader steps in. New back ways:
  add them to `PASSAGES`, the journal's "Back ways" group and `room-ambience.js`.
- The doors between the Grand Hall and each wing (x ±19) are bookcases that part and slide into the walls (`wingLeaf` in
  `game.js`: one shared spine texture, instanced shelf boards).
- Plain text: `read.html?book=ID` shows any book as one readable page (linked from every book page and the reader). Reading
  cards (`reading-card.js`, `/card` on the visitors' book worker) carry bookmarks between devices by a four-word code.
- Every chair, sofa and bench is one of the library's seats: build it with `chair()`/`sofa()`/`bench()` in game.js, or
  pass `registerSeat` into a room module and call it (with a `bookIds` getter for that room's books; push the parts
  onto the room's list so they are freed with it). `?debug` exposes `__athenaeum.seats`.
- The upper gallery runs along the Grand Hall's east side south of the stair (x 11–19, z 16 and beyond): `floorHeight` gives
  that floor as the gallery's (y 5) to a reader up there and as the hall's (y 0) to one on the ground (by the reader's own
  height), so the space under it is walkable; a ground-only collider stops readers at the stair's masonry. In its south-east
  corner is the cupboard under the stairs (`stairCupboard` in game.js): a walnut door that opens on brooms, a candle stub and
  The Circular Staircase. A door at ground level needs open hall floor in front of it (the Austen Room's test checks its own
  approach against `floorHeight`).
- Doors come from the shared kit in `library-doors.js`. A room behind a door is given `doorKit` and hangs both sides of
  its door with `doorKit.hang(parent,{data,mark,...look})` (`color`, `glazed`, `planked`, `plain`, `fanColor`, `frame`,
  `cornice`, `pediment`; no light of its own), then lets the reader through with `doorKit.pass(data.kit,data,go)` so
  the leaf swings first. On the Grand Hall's side, a room's door is the library's walnut with its name gilded on the glass
  (`...doorKit.readingRoom('THE X ROOM','sub line')` after the room's own look); the room's side keeps its colours. Mark the hall side of a door so it is not among the room's own parts, or it stops answering
  once the room is freed.
- Performance matters (many visitors are on phones): merge static parts by material, use `InstancedMesh`, avoid
  adding lights where the library's own can be borrowed.
- To check things visually, serve the repo (`python3 -m http.server 8765`) and drive it with Playwright using
  `/opt/pw-browsers` Chromium with `--use-angle=swiftshader`; `index.html?debug&noktx2` exposes `window.__athenaeum`
  (teleport, placeAt, rooms, books…). Three.js loads from a CDN, so route it to a local copy.
- Gutenberg and most external sites are blocked from the cloud sessions; GitHub Actions has the network. Anything that
  needs to fetch texts runs as a workflow. To find books' numbers, add lines to `scripts/catalog-queries.txt` (`title ; author ;
  language`, patterns are regexes) and push to a `claude/` branch: the Catalogue lookup workflow prints the matches from
  Gutenberg's own catalogue in its log.
- Walls in the hall and reading rooms are Poly Haven sandstone laid out in metres, with contact shadows in the shader
  (`wall-finish.js`; build walls with `addBox` and a `photoWall` material). New Poly Haven models or materials: add
  them to `scripts/fetch-polyhaven-assets.mjs`; the Poly Haven assets workflow downloads, compresses and commits them.

## The library remembers (4 October 2026)

- `living-library.js` keeps two optional paper trails in `athenaeum-library-memory-v1`: sorting ticket → Bellman’s map → Signal House ledger → *Mugby Junction*, and return slips → Departures luggage → Treasure Island map → *Treasure Island*. Only examined clues appear under **Loose leaves** in the journal; later clues never skip earlier ones. The map viewer callback also handles Previous/Next.
- Three fictional return histories rotate each visit on the western returns table. They use existing books; these are invented traces, not visitor data.
- The librarian acknowledges the Kells discovery, the Antipodes, the Map Room and completed trails, with repeatable conversation topics. Acknowledgements persist locally.
- The existing Continue Reading stand uses saved reading timestamps, including the first page and progress below 2%. Its sign resumes the most recent available unfinished book. Failed/offline editions must not overwrite a genuine saved bookmark.
- Seven secret editions have original library-designed gilt bindings and location notes: Dorian Gray, The Yellow Wallpaper and The King in Yellow behind the upper portrait; The House on the Borderland, The Door in the Wall and A Voyage to Arcturus in the breathing-wall passage; The Private Library in the final archive. Arcturus uses the local Standard Ebooks edition (900002), not the unbundled Gutenberg duplicate. They remain normal readable/carryable books, with binding textures protected from cover replacement. Their display stands leave the passage centre clear.

## Books and data

- A book may stand on several shelves: every room shows its own copy (the single-copy register that hid all but one
  copy of a title was removed on 27 October 2026, at the owner's wish).
- The catalogue: the core list in `game.js`, plus `data/*` catalogues and the new arrivals. `scripts/book-pages.mjs`
  rebuilds the same list (1,288 books on 18 October 2026, the International Wing's included).
- **New books**: add `[id or null, title, author, category, room, note]` to `data/new-books.js` (rooms are listed at
  the top of that file and in `ROOMS` in `scripts/new-books.mjs`); the International Wing's rooms go in
  `data/new-books-wing.js`, which the library fetches only within 9 m of the wing door, at one of its doors, or at
  startup for a `?book=` or a `?room=` in the wing. The New books workflow checks each against the
  text's own title and author, bundles it into `texts/bundled-gzip`, counts words and writes
  `data/new-books-resolved.js`. Only resolved books appear. Every book needs a librarian's note.
  The match wants three quarters of the title's words in the text's `Title:` line (so give the short title, not the
  volume and date that follow on the next line) and the author's last word among its `Author:` lines (for two authors,
  put last the one the header surely names).
- Librarian notes: `data/librarian-notes.json` and the notes files in `data/`. Voice: three sentences, dry, warm,
  accurate; never invent facts.
- **Book pages**: `book/<id>-<slug>.html`, `book/index.html`, `book/authors.html`, `sitemap.xml`, `robots.txt` are
  generated by `scripts/book-pages.mjs` (Book pages workflow, and the New books workflow). Never edit them by hand;
  a test checks they are up to date.
- **The International Wing** (door beside the visitors' book): the Spanish Reading Room (room `spanish` in
  `data/new-books.js`, notes in Spanish) and, through its green door, the Portuguese Reading Room (`portuguese`,
  notes in Portuguese; titles in the spelling of their editions, so they match the texts' headers) and, through its
  red door, the Chinese Reading Room (`chinese`, notes in traditional characters; authors written `曹雪芹 (Cao Xueqin)`
  because Gutenberg's headers give titles in characters but authors in pinyin; Chinese is counted by the character,
  book pages keep the characters in their file names, and the reader breaks lines between characters) and, through
  the blue door between them, the French Reading Room (`french`, notes in French), and through the stone door in
  the Spanish room's south wall, the Latin Reading Room (`latin`, notes and book pages in English, signs in Latin), and
  through the blue door with a rushnyk beside it, the Ukrainian Reading Room (`ukrainian`, notes in Ukrainian, authors in
  Cyrillic, book-page addresses in Latin letters by Ukraine's official transliteration), and through the green door
  under a della Robbia roundel in the Spanish room's south wall (a second stands in the Latin room's east wall, from
  Virgil to Dante), the Italian Reading Room (`italian`,
  notes in Italian, maiolica tiles, a lemon tree; x −530, z 132; a door with `from:'latin'` in `ROOM_DOORS` opens from the Latin room, and `room:` names the room a
  second door opens on; the Italian room's way out leads back through whichever door the reader came in by). Gutenberg's Italian holdings are thinner than one might think (no Decameron, Petrarch,
  Tasso, Verga, Goldoni or Svevo in Italian): check the Catalogue lookup before promising a title. Gutenberg has no Ukrainian texts,
  so its books are `['ws:<Wikisource page>', …]`: `scripts/wikisource.mjs` reads the page and its chapter subpages from
  uk.wikisource.org (checking it links to the author's page, leaving out navigation and editors' notes), keeps it in
  `texts/bundled-gzip` under a stable number from 950000 with a `WIKISOURCE TEXT` header, and credits Wikisource. Rooms in `ROOM_LANGUAGES` (`scripts/new-books.mjs`, and in `game.js`) are
  searched on Gutendex in their language, get `book.language` (word help steps aside) and book pages in it;
  `/es/`, `/pt/`, `/fr/`, `/la/`, `/it/`, `/uk/` and `/zh/` are the landing pages. Their books are keyed
  in `data/new-books-resolved.js` as `Title [lang]` (`resolvedKey`), so a French *Madame Bovary* and the English one
  can both stand. The rooms share two lamps
  that move to the reader's room, so adding a room adds no lights. Their reading-table chairs are the library's
  own seats (`registerSeat`), opening one of the room's books. Rooms stand at x −410, −470 and −530 (the Latin room at z 164, the Ukrainian at x −530): keep them clear of
  Crusoe's island (x −420, z 165–199; a test checks).
  For these rooms the text's own `Language:` line must match (a title alone lets translations through). Gutendex
  is often slow; Project Gutenberg's `cache/epub/feeds/pg_catalog.csv` (fetched in a workflow) is the reliable way
  to find a book's number in a given language.
- `/?book=ID` opens a book in the reader; `/?room=mars` (international-wing or es, portuguese-room or pt, chinese-room or zh, french-room or fr, latin-room or la, italian-room or it, ukrainian-room or uk, evening-room, periodicals-room, learners-room, boathouse,
  daily-room, poe, irish, maps, medicine, naturalist, walden, austen, burns, forest, within, set-texts, voynich, chance, antipodes, australia, nz, africa, moon, rocket-hall, consulting-room, time-laboratory, lost-kingdoms, verne-rooms, kipling) goes to a room.
- `scripts/repair-texts.mjs` (weekly Repair texts workflow) replaces any damaged bundled text, then bundles any catalogue
  book from Gutenberg that has no text of its own (`--missing` lists them). A book without one is fetched live from
  gutenberg.org in the reader's browser, and when that fails the reader gets an "offline shelf copy": keep them bundled.
  Gutenberg's audio books (catalogue type Sound) have numbers like texts but no text: never list one as a book (the
  Doyle, Verne, Wells and Haggard lists held 79, all recordings of books held as text; a test keeps them out). The
  Catalogue lookup line `= 8613 8614 …` prints each number's type and the texts with the same title. An anthology is
  bundled when its title matches and the author is named in its opening pages (its header names only the editor).
- **Halloween night** (`halloween.js`): 24 October to 2 November by the reader's own date (`?halloween` previews it,
  `?nohalloween` hides it). Carved lanterns (one InstancedMesh, glowing through emissive faces, no lights) by the south
  doors and the rug, a turnip lantern, and the Oíche Shamhna table of ghost stories near the entrance with a card on
  Samhain.
- The Room of the Day runs nightly from `data/daily-rooms.js` (`scripts/daily-room.mjs`).

## Services

- The visitors' book's lectern (`other-readers.js`, `LECTERN`) stands on the rug's west side a few steps ahead of where
  readers arrive (x 0, z 24, facing north), turned to them; its plaque stays on the south wall. The ✒ button and the pause
  menu open it from anywhere, and a reader who has never signed is reminded once, six minutes in.
- The visitors' book is a Cloudflare Worker (`worker/visitors-book`, workflow `visitors-book.yml`) at
  library-visitors-book.colm18.workers.dev with KV storage. Never touch the owner's other worker, `theaijournal-mcp`.
  Secrets live in GitHub (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, optionally `VISITORS_BOOK_ADMIN_TOKEN`);
  never ask for tokens to be pasted into chat.
- Analytics: Plausible, with an allow-list of event names in `analytics.js`.

## Owner's wishes

- The AI Journal is not to be featured anywhere in the library.
- The English Reading Room keeps only one darker book (Jekyll and Hyde, with a note).
- The library will never have a Russian reading room (the owner's answer to the Ukrainian Book Institute, 28 October
  2026): the Ukrainian Reading Room was made out of admiration for the Ukrainian people and to support them.
- Traces of other readers are invented, not real data.
- The point of the library is exploration: in outreach and replies to readers, never offer a list of books or a direct
  plain-text link as a way round the rooms. Send people to a room and help them find their way in it.
- Outbound email uses short links (`https://libraryafterdark.space`, `https://libraryafterdark.space/?room=irish`). The Gmail
  connector rewrites every link it is given, in `body` or as an `href`, with or without `https://`, into a long
  `google.com/url?q=…` redirect; the emails sent up to 11 October went out that way. Write drafts as `htmlBody` with each
  address broken by tags, unlinked (`https<span>://</span>libraryafterdark<span>.</span>space/?room=irish`), which it leaves
  alone and mail programs show (and usually link) as typed. Check a draft with `get_draft` before it is sent.

## Open to-dos (as of 10 October 2026)

- Gutenberg has no Hindi, Urdu or Bengali texts (Wikisource would be the source, now that `scripts/wikisource.mjs` exists; Urdu needs right-to-left reading)
  and only a handful in Irish (four are on the Irish Room's shelf); CELT (celt.ucc.ie) needs permission to republish.
- The Spanish room's *María* (Jorge Isaacs) and Silva's *Poesías* are not on Gutenberg: es.wikisource would need
  `scripts/wikisource.mjs` to read Spanish Wikisource.
- International Wing: outreach in Spanish, Portuguese, Chinese and French sent 28 September (no Quebec address
  found yet for the French batch). For mainland Chinese readers, host Three.js on the site:
  jsDelivr is unreliable there.
- The owner is moving the Gmail connector to the library's own address for press correspondence; press follow-ups
  were planned for around 2–3 October.
- Austen Room outreach sent 10 October from colm18@gmail.com (26 emails): JASNA (info@, cc e-communications@), JASNA
  News, JASNA's VP for Regions (asked to pass it to the regions), the UK Jane Austen Society (hq@, asked to pass it to the
  branches) and its newsletter editor, JASA (Australia), the Netherlands and Italy societies; the UK branches London,
  Scottish, South West, Midlands and Cambridge; the JASNA regions New York, Chicago, Northern California, North Carolina,
  Louisiana, Vancouver and Toronto (the last three addresses unverified). Each invites corrections to the room's
  librarian's notes: make any that come back. Later the same day, six more: the Jane Austen Sociedade do Brasil, the
  Jane Austen Society of Melbourne, the UK Society's Hampshire and Northern branches, JASNA Southwest (Southern
  California), and the Kent branch's membership secretary. No email found for Pakistan (Facebook JaneitesPakistan,
  Instagram @janeausten_pk), Buenos Aires or JASNA Massachusetts; the UK Society lists no Bath branch now.
- Replies answered 12 October: passed on by Cambridge Ukrainian Studies (to teaching staff), UCD's School of English
  liaison (to colleagues; Marta Bustillo is on leave), the Shakespeare Birthplace Trust (to its Leadership and Collections &
  Archives teams), St Bride Library (to library colleagues; no newsletter), the Schoenberg Institute (to Dot Porter, SIMS
  Curator of Digital Humanities), JASNA, the Edward Thomas Fellowship (in its eBulletin to teachers) and the RLS Club's
  secretary. Declined: the UK Jane Austen Society's Kent branch (thought it not for its members, after trouble with the
  controls on a laptop) and Golden Hare Books. Poe Baltimore suggested entering the Saturday Visiter Awards next year.
- 13 October: SLANZA (School Library Association of New Zealand Aotearoa; Sarah Stretch, National Administrator,
  admin@slanza.org.nz) replied to libraryafterdark1@gmail.com and copied in its President, Trena Lile
  (president@slanza.org.nz), to consider how best to support the New Zealand Room. Answer from that address.
- Lewis Carroll outreach sent 11 October from colm18@gmail.com: the Lewis Carroll Society (secretary@), the LCSNA
  (community@lewiscarroll.org) and the Lewis Carroll Centre at Daresbury (director@, an address from its Facebook page).
  The Daresbury Lewis Carroll Society has only a contact form, which the owner is to fill in by hand. Every Carroll
  quotation in the library was checked against the texts first (two fixed: the fall's "never come to an end?" and the
  Bellman's quatrain); make any corrections that come back.
- Outreach sent 13 October from colm18@gmail.com, one room each, to organisations outside Ireland none of which had been
  written to before: the Osher Map Library (oml-usm@maine.edu) and the IMCoS Journal's editor (Ljiljana.editor@gmail.com)
  for the Map Room; the Royal College of Physicians of Edinburgh library (library@rcpe.ac.uk) and the Thackray Museum of
  Medicine (collections@thackraymuseum.org) for the Medicine Room; the Classical Association (office@) for the Latin room;
  the Sherlock Holmes Society of London (SHSLMembSec@outlook.com) for the Room of Books Within Books; KCL Digital
  Humanities (digitalhumanities@kcl.ac.uk) for the library and how it is built; ASAUK (secretary@asauk.net) for the
  African Reading Room, asking for public-domain African writers it lacks; the Dante Society of America
  (dantesociety@gmail.com) for the Italian room. The SHSL, KCL and IMCoS addresses are from older or third-party listings.
  A draft to the William Morris Society (wmsadmin@) is held unsent at the owner's wish. Make any corrections that come back.
- Outreach sent 16 October from colm18@gmail.com on the library as a whole, to ten organisations not written to before:
  Wikimedia UK (info@; thanks for Commons and Wikisource), Europeana (info@; the International Wing), the Australian School
  Library Association (asla@asla.org.au; the globe and the Australian Room), the National Videogame Museum (via its charity,
  info@thebgi.uk), UCL Centre for Digital Humanities (Lucy Stagg), Scottish Book Trust (info@; the Burns Room for Burns
  Night), The Strong National Museum of Play (info@museumofplay.org), the Bibliographical Society of America
  (bsa@bibsocamer.org; the facsimiles), Games for Change (contact@) and the Federation of Children's Book Groups
  (info@fcbg.org.uk; families). The Scottish Book Trust and Strong addresses are from third-party listings. Already written
  to before, so left out: the Reading Agency, the National Literacy Trust, the Folger, CILIP, the SLA, LibriVox, the
  Internet Archive and the Public Domain Review.
- Outreach sent 18 October from colm18@gmail.com to twenty not written to before, each pointed at one room. Books about
  books (the Repository below the catalogue, the Kelmscott press, the facsimiles): the Book Club of California (info@),
  APHA (secretary@printinghistory.org), the Guild of Book Workers (communications@), Designer Bookbinders (secretary@),
  Fine Books & Collections (Allison Meier), the Ticknor Society (ticknorinfo@gmail.com), Oak Knoll (oakknoll@), the ABA
  (secretary@aba.org.uk), the ABAA (hq@abaa.org) and the Caxton Club (info@). Ghosts and Gothic, for Halloween (the Quiet
  Room, the Poe Room, the lanterns): the Folklore Society (thefolkloresociety@gmail.com; asked to correct the Samhain card),
  the Wilkie Collins Society (Paul Lewis), the International Gothic Association (info@globalgoth.org), the Ghost Club
  (gensec@) and Tartarus Press (Ray Russell). Returning Voices (asked to check its notes): the Recovery Hub for American
  Women Writers (recoveryhub@siue.edu) and Just Teach One (Duncan Faherty, cc Ed White). Outlets: Atlas Obscura (pitches@),
  Hyperallergic (tips@) and Electric Literature (editors@). The Designer Bookbinders, ABA, ABAA, Ghost Club, Guild and
  Atlas Obscura addresses are from registers, directories or older pages. Make any corrections that come back.
  (Atlas Obscura's pitches inbox auto-replied that it is paused.)
- Outreach sent 20 October from colm18@gmail.com to ten outlets not written to before, each pointed at one room: Hackaday
  (tips@; how it is built), History Ireland (editor@historyireland.com, Tommy Graham; Kells and Durrow), Medievalists.net
  (medievalists.net@gmail.com; Kells, Durrow, the Voynich, the Mappa Mundi), Mental Floss (contact@; the Room of Books
  Within Books), Kotaku (tips@; the globe, the polar voyage, the balloon), the Irish Examiner (news@examiner.ie; the Irish
  Room), Irish America (submit@irishamerica.com; the Irish and Burns Rooms), Words Without Borders (info@; the International
  Wing), Tes (newsdesk@tes.com; the Set Texts Room) and Lifehacker (tips@; reading and bookmarks). The Irish America, Tes
  and Lifehacker addresses are from directories. Already written to, so left out: Open Culture, Kottke, Boing Boing, Lit
  Hub, Book Riot, American Libraries, Rock Paper Shotgun, PC Gamer, The Verge, Engadget, Gizmodo, the Irish Times, RTÉ,
  TheJournal.ie, the Independent and the Waterford News & Star.
- Outreach sent 21 October from colm18@gmail.com on the expanded Ukrainian Reading Room (thirty-seven books, the Executed
  Renaissance shelf, the Peresopnytsia Gospel, Shevchenko's boot, the bandura), to nine not written to before: the Embassy of
  Ireland in Ukraine (kyivembassy@dfa.ie, by the DFA's pattern; its pages show only a form), the Embassies of Ukraine in Ireland
  (emb_ie@mfa.gov.ua) and the UK (emb_gb@mfa.gov.ua), the Association of Ukrainians in Ireland (info@ukrainians.ie), the
  Ukrainian Canadian Congress (ucc@), the UCCA (ucca@), the Ukrainian Institute of America (info@), PEN Ukraine
  (ukraine.pen@gmail.com; asked to look over the Executed Renaissance notes) and the Ukrainian World Congress (uwc@). The
  embassy addresses are from Wikidata and directories. No address found for the Ukrainian Institute in Kyiv or the Ukrainian
  Book Institute (their sites hide them): their sites' contact forms are for the owner to fill in by hand. The same morning,
  updates in the 8 October threads to the Ukrainian Institute London, HURI (to Olha Aleksic), Cambridge (to Nicole at
  slavonic@mmll.cam.ac.uk), CIUS and the Shevchenko Scientific Society, and first emails to the Embassies of Ukraine in the US
  (emb_us@), Canada (emb_ca@) and Australia (emb_au@mfa.gov.ua). Make any corrections that come back.
- Outreach sent 26 October from colm18@gmail.com on the Thousand and One Nights (the carpet, the qa'a, the lamp and Hanna
  Diyab; `?room=nights`), to nine not written to before: the Chester Beatty (info@cbl.ie), ArabLit (info@arablit.org),
  Banipal (editor@banipal.co.uk), the Iran Heritage Foundation (info@ihf.org.uk) and the British Institute of Persian
  Studies (bips@thebritishacademy.ac.uk; both asked to check the Persian shelf's notes), the Aga Khan Museum
  (information@agakhanmuseum.org), BRISMES (office@brismes.org), the Society for Storytelling (secretary@sfs.org.uk) and
  TRACS / the Scottish Storytelling Centre (info@tracscotland.org; the Burns Room too). The Chester Beatty, IHF, SfS and
  BRISMES addresses are from the charity register or directories. No usable address found for Shubbak, the Arab American
  National Museum, AramcoWorld or NYU's Library of Arabic Literature. Make any corrections that come back.
- Outreach sent 27 October from colm18@gmail.com to fifteen university English departments not written to before (the
  Irish ones were in the 11 October batch), each pointed at one room: Oxford (english.office@ell.ox.ac.uk), Leeds
  (english@leeds.ac.uk), Harvard (english@fas.harvard.edu) and Dalhousie (englwww@dal.ca) at the Room of Books Within Books;
  HKU (english@hku.hk) there too, with the Chinese Reading Room; Delhi (head@english.du.ac.in) there too, with the carpet to
  the Nights; Cambridge (english-faculty@lists.cam.ac.uk) and Durham (english.studies@durham.ac.uk) at the Austen Room; York
  (english-enquiries@york.ac.uk) and Exeter (Englishcreativewriting@exeter.ac.uk) at the Poe Room, for Halloween; St Andrews
  (english@st-andrews.ac.uk) at the Burns Room; Queen's Belfast (ael@qub.ac.uk) at the Irish Room; Victoria University of
  Wellington (english@vuw.ac.nz) and Otago (english@otago.ac.nz) at the New Zealand Room through the globe; and the
  University of Ghana (english@ug.edu.gh) at the African Reading Room. The last three ask for public-domain writers their
  rooms lack. The Exeter, Dalhousie and Delhi addresses are the least certain. No general address found for Yale, Princeton,
  Columbia, Toronto, UBC, McGill, Edinburgh, UCL, Sydney, Melbourne, ANU, Cape Town, Wits, Stellenbosch, Ibadan, Nairobi or
  NUS (only named staff). Make any corrections that come back.
- A second batch the same day, to English departments in ten more countries, each pointed at one room: UWI Mona, Jamaica
  (litseng@uwimona.edu.jm) at Crusoe's island; UP Diliman, Philippines (declkal.upd@up.edu.ph) at the Room of Books Within
  Books and the International Wing; Oslo's ILOS (henvendelser@ilos.uio.no, asked to pass it to English) there too, with the
  Heimskringla; Uppsala (info@engelska.uu.se) at the Poe Room; Universiti Malaya's Faculty of Languages and Linguistics
  (fll_info@um.edu.my) at the Thousand and One Nights; the Hebrew University's English secretary (Gal Young,
  galzohary@savion.huji.ac.il) and ELTE's SEAS (seas@btk.elte.hu; Walden too) at Books Within Books; Charles University
  (ualk@ff.cuni.cz) at the Voynich, which was in Prague in the seventeenth century; Queen's, Kingston (englishdept@queensu.ca) at the Austen Room; and the
  Complutense's Estudios Ingleses secretary (Daniel Martín González, danielma@ucm.es) at Books Within Books and the Spanish
  Reading Room. The ELTE and Mona addresses are the least certain. No general address found for Lagos, Ibadan, Nairobi,
  Makerere, Pretoria, Rhodes, KwaZulu-Natal, Botswana, Tokyo, Seoul, NTU, Copenhagen, Helsinki, Leiden, Amsterdam,
  Heidelberg, Bologna, Sorbonne Nouvelle, Lisbon, the Jagiellonian, Malta, Iceland, Western Australia, Tasmania or Macquarie.
  Victoria University of Wellington's School of Arts and Media (Alastair Baldwin) replied on 28 October that it is
  "brilliant" and passed it to staff.
- 28 October, aimed at the largest audiences: emails from colm18@gmail.com, with Halloween week as the hook, to Richard
  Byrne of Free Technology for Teachers (richardbyrne@freetech4teachers.com; the site now belongs to TeacherMade), Larry
  Ferlazzo at Education Week (lferlazzo@epe.org; the English Reading Room for learners), Matt Miller of Ditch That Textbook
  (matt@ditchthattextbook.com) and the Guardian's games newsletter Pushing Buttons (pushingbuttons@theguardian.com, address
  unconfirmed). Posts written for the owner to put up: a Show HN with a first comment on how it is built (it names
  the AI coding assistants, so its timing against the double-blind conference papers is the owner's call), r/InternetIsBeautiful,
  r/threejs, the Three.js forum's showcase, and a blurb for the web forms of Laughing Squid, Austin Kleon and Smithsonian.
  Not written to: Colossal (does not cover VR or literature), The Marginalian (takes no pitches); no address found for
  Neatorama, TLDR, Recomendo, The Kid Should See This or School Library Journal.
- Press in Ireland and Britain, sent 28 October from colm18@gmail.com to eight not written to before, each pointed at one
  room: the Irish News, Belfast (newsdesk@irishnews.com; the Irish Room, Kells and the Burns door), RTÉ Radio 1's Arena
  (arena@rte.ie, to Rick O'Shea; Durrow, the Samhain table, the Poe Room), the Bookseller (Maia.Snow@thebookseller.com,
  News Editor; the Kelmscott press), the Big Issue (editorial@bigissue.com; the English Reading Room, reading cards), The Week
  (editorialadmin@theweek.co.uk; the globe, carpet and balloon), Sunday Times Culture (culture@sunday-times.co.uk; Books
  Within Books), the Guardian's culture desk (culture@theguardian.com; the Poe Room for Halloween) and the London Standard
  (news@standard.co.uk; Snow's cholera map, the Kelmscott Chaucer). The Arena, Sunday Times and Standard addresses are from
  directories or copies of contact pages. No usable address for the Munster Express (advertising only; ring 051 500 100),
  the Business Post, Irish Mirror, Irish Daily Mail, IrishCentral, Tuairisc.ie, Books Ireland, Totally Dublin, Hot Press,
  Metro, the Telegraph, the i, Prospect, the TLS, Eurogamer or Radio 4's Front Row and Open Book. Letters pages that could
  take a short letter: The Oldie (letters@theoldie.co.uk) and the Herald, Glasgow (letters@theherald.co.uk; Burns Night).
- 29 October: NATE published the owner's blog post, "A library made for exploration"
  (nate.org.uk/2026/10/29/a-library-made-for-exploration/). The same day, from colm18@gmail.com, to Irish English teachers
  not written to before, each led by the Irish Room and Kells, with the Set Texts Room and the NATE piece: INOTE
  (info@inote.ie; asked which public-domain texts and poets Irish teachers teach that the library lacks), ASTIR
  (astir@asti.ie), TUI (tui@tui.ie, for TUI News) and the Waterford Teachers' Centre (info@wtc.ie; offered to show it to
  teachers there). Already written to before: Oide, JCT, Poetry Ireland's Writers in Schools. Scoilnet has no address
  (teachers add resources through their accounts). Add any texts INOTE names. Also to Irish school librarians: the LAI's
  School Libraries Group (schoollibrariesgroup@libraryassociation.ie; SLARI was dissolved into it in 2021), asked to share
  it on its list, and Waterford Libraries' Schools Service at Carrickphierish (carrickphierishlibrary@waterfordcouncil.ie).
  The JCSP Demonstration Library Project's thirty school librarians, through its Senior Project Librarian, Kathleen
  Moran (info@jcsplibraries.ie, an address the owner gave), offering to show it to the group. CILIP Ireland hides its
  addresses (contact form only).
- Also 29 October, to English teachers' associations abroad, with the NATE piece: AATE (aate@aate.org.au; asked to pass
  it to the state associations), ETA NSW (admin@englishteacher.com.au, from a 2020 journal) and VATE (council@vate.org.au),
  all at the Australian Room through the globe; NZATE (secretary@nzate.org.nz) at the New Zealand Room; each asked which
  public-domain writers of theirs the room lacks: add any they name. In the US, Carol Jago, who takes submissions for
  CATE's California English (cjago@caroljago.com), at the Poe Room and Walden. No address found for NCTE (web form only),
  CCTELA, or the New York, Michigan, Ohio and Wisconsin councils; BCTELA and ATEQ (Quebec) have contact forms only.
- Conference papers on the library, submitted 11 October 2026, double-blind (they never name the library or link it):
  LIDA 2027 (Šibenik, 19–21 May 2027; submission no. 46, "The library as a place to get lost: serendipity, play and an
  AI-built reading room"; decisions 1 December 2026, early-bird registration to 15 February 2027) and RLUK27 (Titanic
  Belfast, 10–12 March 2027). The papers say plainly that the library is built with AI coding assistants and describe
  this file, the tests and the quotation checks as how its values are kept. If accepted, the talk includes a live walk
  from the Grand Hall through the globe: keep that route working, and gather real usage figures from Plausible.
