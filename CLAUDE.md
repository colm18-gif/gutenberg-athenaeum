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
  `austen-room.js`, `burns-room.js`, `canada-room.js`, `gulliver-room.js`, `nemo-room.js`, `within-room.js`, `naturalist-room.js`, `forest.js`, `walden.js`)
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
- The Canadian Room (`canada-room.js`, x 500, z −580) is through a barn-red door at the east end of the Burns Room's north
  wall, past the hearth and the fiddle (so many Scots went to Canada, and Service grew up in Ayrshire; `?room=canada`,
  `yukon`, `mcgee`): a log room with a box stove, a birchbark canoe hung from the beams, snowshoes, and a window on a
  frozen lake under the northern lights (a painted view with a second, additive texture that drifts; no light). Shelves
  `canada-stories` (after the library's own Anne, `OWN`), `canada-north` and `canada-poets` (left of the window) in
  `data/new-books.js`; a window seat on a point blanket and two chairs at the table are seats; loons in `room-ambience.js`.
  The secret is Sam McGee in the stove: opening it quotes him (`MCGEE`, checked against pg207 once bundled) and leaves The
  Spell of the Yukon (`canada-sourdough`) on the woodbox, found for good (`athenaeum-canada-sam-mcgee`; `?mcgee`). From 1 to
  11 November a wreath of poppies hangs inside the door with McCrae's lines (`?poppies` shows it). Service died in 1958:
  public domain in the US and Canada, not yet in Britain or Ireland (as with other Gutenberg authors here).
- Lilliput and Brobdingnag (`gulliver-room.js`; Lilliput x −760, z 700; Brobdingnag x −760, z 880) are through a narrow
  door at the east end of the Irish Room's north wall, between the writers' shelves and the corner (Swift was Dean of St
  Patrick's; `?room=lilliput`, `gulliver`, `swift`, `brobdingnag`). Lilliput is a country at night at a twelfth of the
  reader's size: Mildendo in its wall "two feet and a half high" (the reader walks only its two streets and the palace
  court, `cityAllows`), houses and towers instanced, the royal park's seven-foot trees, the Blefuscu fleet (fifty ships,
  instanced, cables to the shore), the pegs and threads where Gulliver lay, his hat, and along the north wall the
  Emperor's library of very small books (shelves `lilliput-swift`, Swift and the Scriblerians, and `lilliput-small`, after
  the library's own Water-Babies, `OWN`) under signs written aslant. The secret: the Emperor's egg on its little table.
  The small end does nothing; the big end opens the locked press and lets out A Tale of a Tub (`lilliput-bigend`), found
  for good (`athenaeum-gulliver-big-end`; `?bigend`). Lilliput's north door leads to Brobdingnag, Glumdalclitch's room at
  twelve times size; its way back is a mouse-hole in the wainscot. The queen's joiner's reading machine is built as Swift
  measured it (25 ft high, steps 50 ft long, ten feet from the wall: `STEPS`, `STEP_RISE`, `MACHINE_GAP`), walkable a step
  at a time (`allowed` refuses a change of floor of more than one step), before a book leaning open on the wall with
  Swift's own words on its pages. Gulliver's chamber (sixteen feet square, twelve high, ceiling lifted off) holds the
  shelves `brob-giants`, `brob-seeing` and `brob-swift` (after the library's own Rabelais, Jacobs, Wilde, Micrographia,
  Candide, Erewhon, Utopia and Gulliver), and his chair is a seat. One lamp in each room. Every quotation (`SWIFT`) is
  checked against pg829 by a test.
- Captain Nemo's Salon (`nemo-room.js`, x 1000, z 200) is the library and drawing-room of the Nautilus, under the sea. The
  way in is the model Nautilus on its plinth in the Extraordinary Voyages (the theme room `verne`, x 220, z 70; its lit salon
  windows, on both sides, are type `nemo-model`); the iron hatch leads back to just south of the model (`toVerne` builds the
  theme room first). `?room=nemo` (`nautilus`, `captain-nemo`, `atlantis`). As Verne has it: black violet ebony inlaid with
  brass, brown leather divans (two seats, facing the panel), four unpolished globes, the great table of old pamphlets, and in
  the north wall the great panel: iron shutters that slide open a moment after the reader comes aboard (and on a click) on
  two crystal plates and the sea, with light shafts and fish (painted textures, no light of their own). Shelves `nemo-tales`
  (after the library's own 164 and 1268, `OWN`), `nemo-deep` and `nemo-lost` (south wall, west of the hatch) in
  `data/new-books.js`. The secret is the organ by the hatch: it plays on the black keys alone (`pianoTone` voice `organ`), the
  panels close and open on Atlantis with the word chalked on the basalt, and Plato's Critias (`nemo-atlantis`) is left on the
  music desk, found for good (`athenaeum-nemo-atlantis`; `?atlantis`). Every word given to Verne (`VERNE`) is checked against
  `texts/pg164.txt` by a test.
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
- The mountain in the painting (`mountain.js`, centre x 1100, z 700; `?room=mountain`, `peak`, `painting`, `climb`,
  `summit`, `brocken`): A Mountain by Moonlight hangs on the Grand Hall's north wall on the pier between the fireplace and
  the next window (x −7.78, z −29.93; `hangHallPainting`, built at startup and kept). Stepping in, the reader stands in a
  meadow at the foot of an imagined peak, by the frame they came through (the way back). One path (`PATH`, traced once at
  a steady 21% grade) climbs from the meadow round the mountain about two and a quarter times to the summit (y 46),
  higher, snowier and craggier as it goes: the flanks steepen towards the top, so the turns close in; the ground is one
  mesh coloured by height and slope (grass, scree, rock, snow); pines, boulders and crags are three InstancedMeshes
  (bigger and more of them higher up); snow falls above the trees (`THREE.Points`); the reader walks through a layer of
  cloud at y 30 and comes out above a sea of it, ringed by other peaks. Walking is allowed only on the path (its whole drawn
  width, `PATH_HALF`), the meadow ring and the summit; the floor is the path's own height. The hut can be walked into
  (only its walls are solid), and the signpost's arms point at the path, the hut and the frame (a test checks both). Books are found at small cairns beside the path, each
  scratched with the year of its climb (`STATIONS`, in order of the climbs, Whymper's last by the rope), shelf
  `mountain-path` plus the library's own Isabella Bird and Muir (`OWN`); the valley's books (`mountain-valley`: Heidi,
  Tartarin, A Tramp Abroad…) are on the shelf of a stone hut in the meadow, whose bench is a seat. At the top: the cairn
  and a summit register (signing it counts the reader's ascents, `athenaeum-mountain-summits`), a rail on the north rim
  over the cloud, and on the west rim a fixed rope: ABSEIL DOWN carries the reader down the west face into the cloud
  and sets them down in the Grand Hall in front of the painting, facing it (`ROPE_LANDING`; `travelling` while it runs;
  R lands at once). The secret: look down at the cloud on the side away from the moon from
  the summit, and the reader's own shadow stands on it with a glory round its head (the Brocken spectre); Coleridge's
  Complete Poetical Works (`mountain-spectre`), with Constancy to an Ideal Object, is then on the cairn, found for good
  (`athenaeum-mountain-spectre`). No lights; the sky is a dome that goes with the reader, with the far ranges painted
  on it. Its three places (`mountain`, `mountain-heights`, `mountain-summit`) each have an ambience in
  `room-ambience.js` (a cowbell in the meadow, the wind rising with height). Every quotation (Whymper, Muir, Coleridge)
  is checked against the bundled texts by a test. The falls (`FALLS` in mountain.js; `?room=falls`, `waterfall`): at the
  meadow's south-east edge a stream comes over a cliff into a pool (water, not ground: `inPool`); a ledge runs behind the
  falling water to a cave mouth, and walking into it goes into the cave behind the falls (`falls-cave.js`, x 1500, z 1000,
  built on entry and freed after; `?room=falls-cave`): a chamber with the falls a curtain across its mouth (walk into it to
  come out on the ledge, `behindFalls`), one lantern, a stone bench, and books in two niches: the library's own (`OWN`:
  the Memoirs for the Reichenbach, Hiawatha, Tom Sawyer, The Mysterious Island, Journey to the Centre of the Earth, King
  Solomon's Mines) and the shelf `falls-cave` (The Last of the Mohicans, Lorna Doone, Plato's Republic). Watson's
  Reichenbach and Longfellow's lines are checked against pg834 and pg19 by a test.
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
  Hall's west wall (x −18.45, z 7.3, between the wing door and the gramophone; `?room=within`). The first drawer
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
- The Wandering Door (`wandering-door.js`, x 6, z −24.5, facing east) stands on its own, in no wall, at the north end of
  the Grand Hall behind the long bookcase (`?room=wandering-door`, `elsewhere`): ELSEWHERE gilded on its glass. Opened
  from the front, it shows the kit's lamplit passage and sends the reader into a room chosen at random through
  `roomLink` (never the last one twice running, `athenaeum-wandering-door-last`; seven times in ten a room not yet in the
  journal). Its list in game.js is rooms behind ordinary doors only (theme rooms, reading rooms, the International Wing):
  not the rooms reached by carpet, balloon, boat, rocket, the globe, the model Nautilus or the window, nor the secret ones
  (a test checks). The way back is the room's own door. From behind, or with a book in hand, it stays shut.
- The Station Subway (`station-subway.js`) is the plain way to the night trains: in the Grand Hall's east aisle between the
  columns (x 12.6–15.4, z −21 to −14.5, clear of the Wandering Door's forecourt), steps go down through the floor under an
  iron arch with two lamps, signed TO THE TRAINS. The well is really sunk: its tiles and steps are drawn first (`renderOrder`
  −2), then a lid at floor level that writes depth only (−1), so the parquet is not drawn over the opening; railings on
  three sides are colliders; readers walk down the first steps (to about −0.9 m, above the basement's reach) and are taken
  on into the subway (GO DOWN does the same). That (x 1260, z −640 to −600, built
  on entry, freed 25 s after, one lamp of its own) is white-tiled under a vault: a stair down from the way out, posters for
  the line's stops and two of its books (The Railway Children, Mugby Junction; every card says only what is so), a
  departure board, a ticket machine, and gates that use the railway's own entrance to the Library Platform. A WAY OUT arch
  on the platform's south wall (hung in the platform's group once the railway is built) leads back. The long way beyond
  the Repository stays. Footsteps in the subway are stone; on the platforms and in the train they are the library's
  ordinary ones (`footstepSurface` gives the railway no surface of its own, at the owner's wish). `?room=subway` (`station`, `trains`, `railway`, `night-train`).
- The Lost Property Office (`book-lift.js`, x 500, z 220) is reached by a book lift, not a door: a dumbwaiter hatch in the
  west wing's south wall (x −33.9, set in the wainscot between the hidden passage and the STAFF · SORTING door). Ring the
  bell and the shutter rolls up; the reader rides the car down a shaft (floors painted on its wall: WEST WING, BASEMENT,
  SUB-BASEMENT) and steps out into the office; the car, or the plaque over its mouth, takes them up again (`?room=lost-property`,
  `lift`). Its stock is the shelf `lost-property` in `data/new-books.js`: books of every kind. Eighteen
  are out at random on each visit, in pigeonholes, each with an invented tag saying where it was found (`FOUND`); the
  bell on the counter clears them and brings out a lot that was not just there. A book carried to the car is put back.
  Keep the stock at thirty or more so two lots never overlap.
- The Unwelcome Spines (`buildContestedRoom` in `game.js`, x 170, z 14) is behind the door bound in banned books beyond
  the Restricted Catalogue: books once banned, burned, prosecuted or suppressed, from the shelf `contested` in
  `data/new-books.js` (category `Contested`, which the room's chair and the east-side recommendations draw on), in
  three cases of ten. Both sides of its door are the kit's `banned` style (`library-doors.js`): the leaf pasted over with
  torn, censored pages, a leather spine of raised bands, iron straps, a chain hanging from an open padlock, and a frame
  of the books themselves (stacked up the jambs, upright along the lintel, `BANNED` titles gilt on one spine atlas, merged
  into one mesh). `dressContestedRoom` dresses the room: a brazier of embers with sparks and smoke (the room's one lamp
  flickers as firelight; no new light), the Index's title page, Milton's Areopagitica (`CONTESTED_MILTON`, checked
  against pg608) and Heine's Almansor on the walls, the censor's desk, pages pegged on lines and trodden into the floor
  (InstancedMeshes). Claims on its cards come from the shelf's own notes.
- The four memory rooms below the catalogue (`buildMemoryRooms` in `game.js`, x 72–167, z −20, through the basement:
  Names in the Dust, The Longer Silence, St—ll W—ting and What Was Kept) are stocked from the shelves `returning`,
  `quiet`, `unread` and `repository` in `data/new-books.js`. The Repository's
  four racks hold 36 distinct books and its request desk one more.
- The Ukrainian Reading Room (`international-wing.js`, `dressUkrainian` and `furnishUkrainian`) keeps apart from its main
  racks (`apart`) the shelf of the Executed Renaissance by its door (`MEMORIAL`: eight titles from the room's list, under a
  plaque and a candle whose flame flickers in `room.ticks`, no light; on the case's east end, past the candle, The Unwritten,
  `UNWRITTEN`: fifteen blank spines, one InstancedMesh, for the books Ukraine's writers killed by Russia since 2014 did not
  live to write, under a plaque whose card (from Chytomo's report of 6 November 2026; "more than three hundred", so it
  does not date) opens that report, `intl-link`: the spines and the plaque both open the card in a dialog with a real link,
  `openLinkCard` in game.js, since a tab opened from the game loop is often blocked; keep `UNWRITTEN` below `MEMORIAL`.
  An InstancedMesh must stand where its instances are: focus is found by each object's own position) and the book in Shevchenko's boot (`boot:'Княжна'`):
  a soldier's boot under his 1848 drawing of Raim on the Syr Darya; looking in finds the little book he hid there in exile, which then lies on
  the trunk beside it, found for good (`athenaeum-shevchenko-boot`). Its pictures (Kateryna, «Укріплення Раїм. Вид з верфі на Сир-Дар'ї», 1848, not a self-portrait as Commons has it,
  Pymonenko's Ukrainian Night) are fetched by `scripts/fetch-maps.mjs` (`PICTURES`, into `assets/pictures`). The bandura
  plays Leontovych's Shchedryk on the synthesiser's plucked `bandura` voice (`tone`, game.js's `pianoTone`); a didukh
  stands from 24 December to 19 January; from 27 October (the Day of Ukrainian Writing and Language since 2023) to 9 November (its old date) the Eneida is on the
  lectern. In the middle of its west side, under glass, the Peresopnytsia Gospel (`peresopnytsia-book.js`, handed to the
  wing as `gospel`) lies open at Mark's portrait facing leaf 129, the first page of his Gospel: three colour photographs
  from Commons and seven plates of Gruzinsky's printed facsimile of 1911 (pages of its PDF on Commons, `trimScan` cuts away
  the bare page round each plate), with drawn notes on the word оукраины on leaf 82 and on the presidents' oath. Commons
  has no other usable photographs of it. The Catalogue lookup also searches Ukrainian Wikisource (`ws <page>`, `ws? <words>`) and Commons
  (`commons? <words>`). A Wikisource page that only lists editions has too little text: give the edition's own page.
- The Forest Song (`forest-song.js`, centre x 600, z 900; walkable within 32 m): the world of Lesia Ukrainka's Лісова пісня
  (book 999793, in the wing's list), on a spring night. Two ways in: Lukash's reed pipe on two pegs across a linen towel in
  the Ukrainian Reading Room's south-west corner, under a plaque (`intl-sopilka`; the wing is given `forestSong`), and a
  button in the reader for that play alone (`?room=forest-song`, `lisova-pisnia`, `mavka`, `lesia-ukrainka`; a link
  loads the wing's books first). As the prologue sets it: the glade with the weeping birch and the great oak, the forest
  lake (not walkable) under duckweed and lilies, clear in the middle, the stream in and out, reeds, the old split willow
  half-withered, the fallen tree where the Forest Elder smoked (a seat; the play lies on it) and the embers of a fire.
  The trees start almost bare; the pipe against the oak plays Lukash's tune (the library's own, `TUNE`, on `pianoTone`'s
  flute) and the forest unfolds in real time over about eight seconds (crowns, catkins, white lilies); then Mavka, a
  sprite with a clear pane to pick her by, steps out by the willow, with a wreath of fireflies (`THREE.Points`), once a
  visit (`athenaeum-forest-song-mavka`); played to again, she answers «Як солодко грає…». A blue door with a rushnyk
  leads back to the room. No lights. Every «quotation» is checked against the bundled text by a test; the English after
  each is the library's own plain rendering.
- «Слава Україні!»: at the east end of the Ukrainian Reading Room's north racks, on the middle tier past the last book,
  a thin blue volume stands pushed in crooked (`intl-slava`). Pulled, it tips out, and carved into the back of the shelf
  behind it, in gilded letters, is «Слава Україні!»; the card gives the answer, «Героям слава!». Found once, kept
  (`athenaeum-slava-ukraini`): a reader who has found it sees the book tipped out on every visit.
- The way to the Ukrainian Reading Room is marked (the owner wants it prominent): in the Grand Hall, beside the
  International Wing's door, a blue and yellow sign and a jar of sunflowers (`intl-ukraine`, built in `buildDoor`; either
  goes through the wing door straight into the room); its door straight ahead across the wing's lobby, between sunflower
  jars (`sunflowerJar`, shared materials) and two Ukrainian flags; the librarian's topic «Where is the Ukrainian Reading Room?»; and the last step of the
  first-visit tour. A test keeps all four.
- The Ukrainian Reading Room's west wall is a window, not a bookcase (`window:true` on its def skips the west racks): a
  painted night over a village by the Dnipro (moon, poplars, a whitewashed хата, the cherry orchard, a stork), framed with
  a rushnyk; its card (`WINDOW`) quotes «Садок вишневий коло хати…» from the room's own Kobzar (book 962510, Кобзарь 1876,
  in place of «В казематі»), checked by a test. Keep `WINDOW` above `MITTEN`: the mitten's test reads every «quotation»
  between `MITTEN` and `MEMORIAL` against Рукавичка.
- English for English speakers: every Ukrainian book has an English rendering of its librarian's note in
  `ATHENAEUM_NOTES_EN` (end of `data/new-books-wing.js`, keyed by title; a test wants one for each book, three sentences
  or more), shown after the Ukrainian when a book is picked and on its book page (`noteEn`). The welcome, the lectern
  (`lecternSub`) and the cards carry English after the Ukrainian. A new Ukrainian book needs its English note too.
- Україна англійською (Ukraine in English): a case of two tiers of three on the Ukrainian Reading Room's south wall,
  west of the door, between it and Pymonenko's picture (x cx−3.6): Ukrainian books in English translation and English
  books about Ukrainian writers, the shelf `ukrainian-english` in `data/new-books.js` (English texts, so not on the
  `ukrainian` list, which checks each text is in Ukrainian; their notes are in English). `TRANSLATIONS` in
  `international-wing.js` links a book and its translation by id, both ways (a test wants each link returned); the reader
  shows a button, In English · Англійською or Українською · In Ukrainian, that opens the other (fetching the wing's
  books first). Gutenberg's English Ukrainian books are few: check the Catalogue lookup before promising one.
- For Ukrainian children (now in the children's room, above): a low green bookcase under the Petrykivka painting holds the
  children's shelf (`CHILDREN`, kept apart from the main racks): the folk tales «Рукавичка» and «Пан Коцький» (from the 1918
  children's collection Баю-баю), «Котигорошко», «Кирило Кожум'яка», the 1920 «Українські народні казки» (ten tales),
  Franko's «Коли ще звірі говорили» (19 of its 20 tales: «Війна між Псом і Котом» is not on Wikisource) and «Лис Микита»,
  and Hlibov's fables. Folk tales link to no author's page, so `scripts/wikisource.mjs` takes a book shelved as
  "Українська народна казка" when Wikisource files it as folk work, or when it is one of `FOLK_PAGES` (checked by hand);
  `COLLECTIONS` names, in the book's own order, the tales of a collection whose front page is only a preface or a contents.
  In front of the shelf, «Рукавичка» as paper cut-outs round a red mitten on a snowy rug (`MITTEN`, `intl-mitten`): each
  press brings the next animal in the tale's own words (checked against book 952693 by a test), the mitten swells, and
  the dog's bark scatters them (`athenaeum-rukavychka`). Six wooden letter blocks hidden about the room (`LETTERS`,
  `intl-letter`), each with a word for children, spell КАЛИНА and then stand on the shelf (`athenaeum-kalyna-letters`).
  When Clio sleeps on the reading table, the bandura softly plays «Котику сіренький» (`playKotyku` in game.js),
  transcribed bar by bar from the public-domain score on Commons (`kotyku-score` in `scripts/fetch-maps.mjs`, which takes
  a GIF when an entry says `gif: true`).
- The children's room, Дитяча кімната (in `international-wing.js`: `CHILDREN_ROOM`, x −509, z 100, the Ukrainian room's
  `annex`), shares the Ukrainian Reading Room's east wall and opens from it by a wide arch (`ARCH`) under the rushnyk and a
  sign, ДИТЯЧА КІМНАТА, with four of the mitten's animals as cut-outs on their way in. `roomAt` counts it as the
  Ukrainian room (one room for lamps, building and freeing; `allowed` lets the reader across the shared wall only at the
  arch). It adds no light: `placeLamps` sends the wing's second lamp there. Inside: the Petrykivka painting over two low
  shelves, for the youngest (`CHILDREN` less `OLDER`) and for older readers (`OLDER`, which also stand on the main racks; every book on both was read for a child's shelf, and Облога
  Буші was kept off it, for a hero nicknamed for killing Jews and a mass death at its end; so were Franko's Малий Мирон,
  which ends foretelling the boy's ruin, and Marko Vovchok's Галя, which ends with her in the Dnipro: a new book is read
  before it is shelved there),
  the mitten, the КАЛИНА blocks, picture covers on its own copies (`coverArt`, a scene drawn for each title, no files;
  `userData.pictureCover` keeps game.js's real-cover swap off them), pictures from old public-domain editions
  (`BOOK_PICTURES`, by title, shown by the reader's «Малюнки · Pictures» button in game.js: El Lissitzky's 1922 «Пан Коцький»)
  and two letters of Narbut's Ukrainian alphabet framed by the arch (З and И; his А was left out as a caricature), all
  fetched by `scripts/fetch-maps.mjs` and looked at before use (that script now gives up rather than search for nothing), a cushioned bench (two seats), a slide in the south-west quarter (`SLIDE`: its steps and
  chute are the floor there, `slideHeight`; `allowed` takes the steps one at a time; at the top `intl-slide` carries the
  reader down the chute), the grey kitten from the lullaby «Котику сіренький» (`intl-kitten`), who pads between a few spots
  and every fifth stop curls up asleep in her basket by the south wall for 45 s, and a small yellow door to the lobby, whose own small
  yellow door beside the Ukrainian door goes straight in (`intl-children`). Seasons: St Nicholas's pillow 1–19 December
  (`?mykolai`), bunting on 1 June (`?bunting`), and the painted window over the bench: a snowy evening of sledging,
  a snowman and a dropped red mitten from November to February, a summer evening of sunflowers, a stork and a kite the
  rest of the year (`?winter`, `?summer`; no light). The secret: a pea rolls along the south skirting; picked up, Kotyhoroshko's
  mace and his tale are in the south-east corner, found for good (`athenaeum-kotyhoroshko-pea`; `?pea`); its words
  (`KOTYHOROSHKO`) are checked against the library's Котигорошко. `children-room.test.cjs` builds the wing for real.
- The Holodomor candle: in the Ukrainian Reading Room, from the Sunday before the fourth Saturday of November (the Day of
  Remembrance of the Victims of the Holodomor) to the day itself, a candle in a glass with ears of wheat stands where the
  didukh stands at Christmas; the reader lights it (`intl-holodomor`). On the day, the room's welcome names it.
  `?holodomor` shows it on any day.
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
- Back ways (`passages.js`): eight short passages join neighbouring rooms behind doors, so a reader can wander without
  going back to the Grand Hall: the Cellar Stair (Poe Room ↔ Irish Room, down), the Night Corridor (English Reading Room
  ↔ Poe Room), the Long Gallery (Medicine Room ↔ English Reading Room; the Map Room's walls are hung edge to edge, so it
  is reached through the Medicine Room), the Back Stair (Burns Room ↔ Austen Room, up), the Stacks Stair (Burns Room ↔
  Room of Books Within Books, up), the Servants' Passage (Evening Room ↔ Periodicals Room, with the Set Texts Room's door
  halfway), the Sorting Corridor (Room of Chance ↔ Lost Property Office) and the Portage (Walden ↔ Canadian Room: a trail,
  `kind:'trail'`, its walls, floor and sky painted from Walden's summer through September's leaves to snow, as Thoreau went
  to Canada in 1850; mileposts and his palm-leaf hat carry his words from A Yankee in Canada, pg70123, checked by a test;
  footsteps are soft there). Walden has no walls, so its end is a door standing in the pines west of the clearing at
  `SPOTS.trail` (an end with `spot:'trail'` takes its place from the room's `trail`); the Canadian end is at the east end
  of that room's south wall. The rooms reached by air (the Nights, the
  African room), by boat (Crusoe's island) and by rocket (Moon, Mars) stay that way, at the owner's wish (a test checks).
  Each door is a wall and a distance along it (`ends`), measured clear of the rooms' shelves and pictures; a door is hung
  only while its room is built, and a passage is built when entered and freed 25 s after. Passages stand at x 1200
  (z −600, 40 m apart), floors between y 0 and 3 (below 0 wakes the basement). One lamp, the module's own, moves to the
  passage in use. Rooms export `activate` so a passage can build the room before the reader steps in. New back ways:
  add them to `PASSAGES`, the journal's "Back ways" group and `room-ambience.js`.
- Exploration (`exploration.js`, loaded just before `passages.js`; wired at the end of game.js as `exploration`): small
  things that make wandering worth it, none with a light of its own. A room not yet found is heard through its closed door
  (`DOORS`, room-ambience.js `leak`: muffled, quieter, one at a time). Now and then the night porter's lantern (no light,
  no figure) appears ahead in the hall and goes towards a door not yet opened, waiting if the reader falls behind; it goes round the shelves
  (`gridPath`, A* over a grid of floor a reader could stand on, surveyed a slice a frame; then `smoothPath`). The
  journal's plan keeps the reader's route (`athenaeum-hall-route`), a compass, and "here be dragons" while it has blanks.
  Dust drifts towards a mystery not yet recorded (`DRAUGHTS`). Footprints: the reader's own in the basement, memory rooms
  and tunnel, and an earlier reader's from the hatch to the narrow door behind the pipes. A brass despatch tube on the hall's
  column at x −11, z −5 drops a capsule every few minutes with a slip saying how to find a room (`HINTS`; a room behind
  another only once that one is found). A book picked up may have a pencilled note pointing to its room (`MARGINS`). Until the Book of Kells has been opened
  (`athenaeum-kells-seen`, set in game.js), the tube sometimes sends a slip to its case and a Celtic or Irish book picked up
  outside the Irish Room may carry a note pointing to it (`TREASURES`). Closing
  time (`dimFor`): from 22:30 the west wing's lamps dim, from 23:30 the east wing's, from 00:30 the hall's (to 55%, back by
  06:00), and the reader carries a lantern (seen in hand) there and in the dusty places. The moonlight follows the real
  moon (`moonPhase`; the time label names it), and the Antipodes skylight turns with the sky over Sydney. Three stopped
  clocks on the hall's columns (`CLOCKS`: Havisham's twenty to nine, the Hatter's six o'clock, Poe's ebony clock at
  midnight; quotations checked against the texts) are found for good (`athenaeum-stopped-clocks`). The explorers'
  anteroom (x 1320, z 320, freed like the basement; `?room=explorers`) is through the kit locker in the Map Room's
  north-west corner: kit on its pegs, a sledge, a chart left blank (Conrad, checked against pg219), the map-voyages shelf,
  a camp chair, and a ledger of departures the reader can sign (`DEPARTURES`, `athenaeum-departures`). A book trolley stands
  somewhere new on each visit with three books from rooms not yet found, each with a return slip.
- The doors between the Grand Hall and each wing (x ±19) are a two-volume set of giant books (`wingVolume` in `game.js`):
  THE WEST WING (or EAST WING), Volume the First and Volume the Second, spines at the jambs, gilt fore-edges meeting in the
  middle. As the reader comes near, each block of pages gathers into its spine and each cover swings into the wing like a
  leaf of a double door, its first leaves fanning after it (marbled endpapers inside). A cover is half the doorway wide
  (3.68 m), so its swing clears the reading tables at x ±28 and the doors on the wings' walls: a single 7.8 m cover would
  hit them (a test keeps the width). Covers, endpapers, page and edges are drawn once and shared; spine bands are instanced.
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
- **The International Wing** (door beside the visitors' book) opens on its lobby (`hub` in `ROOMS`, x −470, z 66, no
  books; `?room=international-wing`, `wing`, `lobby`): a great globe with the seven languages marked where they are spoken
  (`SPOKEN`, coasts from antipodes.js's `ATHENAEUM_LAND`), set left of the way in so nothing hides the Ukrainian door,
  a compass rose in the floor, an atlas open at the world and at a page of welcomes, pennants in the doors' colours,
  and a door to each reading room (`HUB_DOORS`, `ROOM_DOORS`): Spanish, Ukrainian (in the middle) and French in the north
  wall, Portuguese and Latin in the west, Chinese and Italian in the east; every room's way out leads back to the lobby
  (the Italian's to whichever door the reader came in by). `?room=es` (`spanish-room`) goes to the Spanish room, and the
  Spanish book pages link there. The rooms: the Spanish Reading Room (room `spanish` in
  `data/new-books.js`, notes in Spanish), behind the green door the Portuguese Reading Room (`portuguese`,
  notes in Portuguese; titles in the spelling of their editions, so they match the texts' headers) behind the
  red door the Chinese Reading Room (`chinese`, notes in traditional characters; authors written `曹雪芹 (Cao Xueqin)`
  because Gutenberg's headers give titles in characters but authors in pinyin; Chinese is counted by the character,
  book pages keep the characters in their file names, and the reader breaks lines between characters) behind
  the blue door the French Reading Room (`french`, notes in French), behind the stone door the Latin Reading Room (`latin`, notes and book pages in English, signs in Latin), behind
  the blue door with a rushnyk the Ukrainian Reading Room (`ukrainian`, notes in Ukrainian, authors in
  Cyrillic, book-page addresses in Latin letters by Ukraine's official transliteration), and behind the green door
  under a della Robbia roundel (a second stands in the Latin room's east wall, from
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
- `/?book=ID` opens a book in the reader; `/?room=mars` (international-wing or es, portuguese-room or pt, chinese-room or zh, french-room or fr, latin-room or la, italian-room or it, ukrainian-room or uk, evening-room, periodicals-room, learners-room, subway, boathouse,
  daily-room, poe, irish, maps, medicine, naturalist, walden, mountain, austen, burns, canada, nemo, forest, within, set-texts, voynich, chance, antipodes, australia, nz, africa, moon, rocket-hall, consulting-room, time-laboratory, lost-kingdoms, verne-rooms, kipling, forest-song) goes to a room.
- `scripts/repair-texts.mjs` (weekly Repair texts workflow) replaces any damaged bundled text, then bundles any catalogue
  book from Gutenberg that has no text of its own (`--missing` lists them). A book without one is fetched live from
  gutenberg.org in the reader's browser, and when that fails the reader gets an "offline shelf copy": keep them bundled.
  Gutenberg's audio books (catalogue type Sound) have numbers like texts but no text: never list one as a book (the
  Doyle, Verne, Wells and Haggard lists held 79, all recordings of books held as text; a test keeps them out). The
  Catalogue lookup line `= 8613 8614 …` prints each number's type and the texts with the same title. An anthology is
  bundled when its title matches and the author is named in its opening pages (its header names only the editor).
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
- No Russian literature on the shelves, in any language (the owner's wish, 2 November 2026, after the Embassy of
  Ukraine to the UK asked; Russia uses culture as a tool of propaganda). Tolstoy and Dostoyevsky were taken off then.
- Traces of other readers are invented, not real data.
- The point of the library is exploration: in outreach and replies to readers, never offer a list of books or a direct
  plain-text link as a way round the rooms. Send people to a room and help them find their way in it.
- Outbound email uses short links (`https://libraryafterdark.space`, `https://libraryafterdark.space/?room=irish`). The Gmail
  connector rewrites every link it is given, in `body` or as an `href`, with or without `https://`, into a long
  `google.com/url?q=…` redirect; the emails sent up to 11 October went out that way. Write drafts as `htmlBody` with each
  address broken by tags, unlinked (`https<span>://</span>libraryafterdark<span>.</span>space/?room=irish`), which it leaves
  alone and mail programs show (and usually link) as typed. Check a draft with `get_draft` before it is sent.

## Open to-dos

- Gutenberg has no Hindi, Urdu or Bengali texts (Wikisource would be the source, now that `scripts/wikisource.mjs` exists; Urdu needs right-to-left reading)
  and only a handful in Irish (four are on the Irish Room's shelf); CELT (celt.ucc.ie) needs permission to republish.
- The Spanish room's *María* (Jorge Isaacs) and Silva's *Poesías* are not on Gutenberg: es.wikisource would need
  `scripts/wikisource.mjs` to read Spanish Wikisource.
- An Indian shelf (Tagore, Toru Dutt, Sarojini Naidu, the Panchatantra).
- For mainland Chinese readers, host Three.js on the site: jsDelivr is unreliable there.
- Keep the walk from the Grand Hall through the globe to the Antipodes working: it may be shown live in a talk.

## Outreach and correspondence

This repository is public, so the record of who has been written to about the library, their names and addresses, what
they replied and what corrections they asked for is kept privately, in the Google Doc "The Library After Dark: outreach
log" in the owner's Google Drive (it was in this file until 2 November 2026). Before writing to anyone or answering a
reply, find it with the Google Drive connector (search for its title) and read it; afterwards, add what was sent and what
came back there. Never put a correspondent's name, address or message in the repository, in a commit message or in a
pull request. Corrections that come back are made here like any other change.
