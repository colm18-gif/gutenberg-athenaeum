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
  `crusoe-island.js`, `mars.js`, `poe-room.js`, `irish-room.js`, `map-room.js`, `set-texts-room.js`)
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
  south wall (x −8.3; `?room=irish`): shelves `irish-myth`, `irish-revival`, `irish-writers` and `irish-gaeilge` in
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
- The fine books share one engine, `fine-books.js` (cradle, stiff board leaves, zoom, captions, loading only the spreads
  either side of the open one); each book is a description: `kells-book.js`, `durrow-book.js` (which borrows the Kells ornament), `kelmscott-book.js`
  (pages and cards, drawn pages, binding, paper, type). Their photographs come from Wikimedia Commons by `scripts/fetch-book-pages.mjs` (Book
  images workflow; public domain only). A book listed with no pages is surveyed in the log instead (with `thumbs`, it also commits
  numbered sheets of the larger files to `<dir>/survey`, to be looked at and removed), which is how pages are chosen from
  what Commons really holds. Commons has no large copies of Kells 124r, 129v, 285r, 290v or 291v. The Periodicals Room's secret is the Kelmscott Chaucer: pull the bar of the
  Albion hand press by the door and it prints the Chaucer's first page and gives up the book (`?kelmscott` shows it). Its
  pages are the woodcut title and seven facing openings from the Internet Archive's scan (a page's number is its place in
  the scan less twelve).
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
  heading (`#ozymandias`). Its librarian's note counts the poems: keep it right when adding one.
- The Room of Chance (`chance-room.js`, x 500, z 60, clear of the Moon at x 340, z 30) is behind a small crooked portrait
  on the east wing's east wall (x 36.6, z 2.05), between the Restricted Catalogue's gate and the Verne engraving
  (`?room=chance`): forty-two books shuffled afresh on each visit, a table, and a plaque, NO ORDER GOVERNS THESE SHELVES.
- The Lost Property Office (`book-lift.js`, x 500, z 220) is reached by a book lift, not a door: a dumbwaiter hatch in the
  west wing's south wall (x −33.9, set in the wainscot between the hidden passage and the STAFF · SORTING door). Ring the
  bell and the shutter rolls up; the reader rides the car down a shaft (floors painted on its wall: WEST WING, BASEMENT,
  SUB-BASEMENT) and steps out into the office; the car, or the plaque over its mouth, takes them up again (`?room=lost-property`,
  `lift`). Its stock is the shelf `lost-property` in `data/new-books.js`: books on no other shelf, of every kind. Eighteen
  are out at random on each visit, in pigeonholes, each with an invented tag saying where it was found (`FOUND`); the
  bell on the counter clears them and brings out a lot that was not just there. A book carried to the car is put back.
  Keep its books off every other shelf (a test checks), and keep the stock at thirty or more so two lots never overlap.
- The Unwelcome Spines (`buildContestedRoom` in `game.js`, x 170, z 14) is behind the door bound in banned pages beyond
  the Restricted Catalogue: books once banned, burned, prosecuted or suppressed, from the shelf `contested` in
  `data/new-books.js` (category `Contested`, which the room's chair and the east-side recommendations draw on), in
  three cases of ten. They must be books held nowhere else (a test checks): the single-copy register shows each book
  once, and when the room's books were the Restricted Catalogue's, its shelves stood almost empty.
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
- The African Reading Room (`african-room.js`, courtyard x −600, z −294; room north of it) is reached by balloon: a
  balloon moored in the roof garden's south-west corner (x −13, z 51.5) rises over the town, crosses a cloud sea (built at
  x −900 for the flight, inside the camera's 130 m) and sinks into a walled courtyard with a baobab. The room is in the
  Sahelian manner of Djenné and Timbuktu (shelves `african-ancient`, `african-voices`, `african-tales` in
  `data/new-books.js`); the courtyard's balloon flies home. `?room=africa` goes straight to the courtyard.
- Quill, the library cat, is sometimes found asleep in the Irish Room, the Poe Room or a wing reading room (the same
  cat moved and curled up; `?quill` makes it every time). The librarian stays in the Grand Hall.
- The doors between the Grand Hall and each wing (x ±19) are bookcases that part and slide into the walls (`wingLeaf` in
  `game.js`: one shared spine texture, instanced shelf boards).
- Plain text: `read.html?book=ID` shows any book as one readable page (linked from every book page and the reader). Reading
  cards (`reading-card.js`, `/card` on the visitors' book worker) carry bookmarks between devices by a four-word code.
- Every chair, sofa and bench is one of the library's seats: build it with `chair()`/`sofa()`/`bench()` in game.js, or
  pass `registerSeat` into a room module and call it (with a `bookIds` getter for that room's books; push the parts
  onto the room's list so they are freed with it). `?debug` exposes `__athenaeum.seats`.
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
- Three fictional return histories rotate each visit on the western returns table. They use existing books and the single-copy register; these are invented traces, not visitor data.
- The librarian acknowledges the Kells discovery, the Antipodes, the Map Room and completed trails, with repeatable conversation topics. Acknowledgements persist locally.
- The existing Continue Reading stand uses saved reading timestamps, including the first page and progress below 2%. Its sign resumes the most recent available unfinished book. Failed/offline editions must not overwrite a genuine saved bookmark.
- Seven secret editions have original library-designed gilt bindings and location notes: Dorian Gray, The Yellow Wallpaper and The King in Yellow behind the upper portrait; The House on the Borderland, The Door in the Wall and A Voyage to Arcturus in the breathing-wall passage; The Private Library in the final archive. Arcturus uses the local Standard Ebooks edition (900002), not the unbundled Gutenberg duplicate. They remain normal readable/carryable books, with binding textures protected from cover replacement. Their display stands leave the passage centre clear.

## Books and data

- The catalogue: the core list in `game.js`, plus `data/*` catalogues and the new arrivals. `scripts/book-pages.mjs`
  rebuilds the same list (742 books at the time of writing).
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
  under a della Robbia roundel in the Latin room's east wall (from Virgil to Dante), the Italian Reading Room (`italian`,
  notes in Italian, maiolica tiles, a lemon tree; x −530, z 132; a door with `from:'latin'` in `ROOM_DOORS` leads back
  to the room it opens from). Gutenberg's Italian holdings are thinner than one might think (no Decameron, Petrarch,
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
  daily-room, poe, irish, maps, set-texts, chance, antipodes, australia, nz, africa, moon, rocket-hall, consulting-room, time-laboratory, lost-kingdoms, verne-rooms) goes to a room.
- `scripts/repair-texts.mjs` (weekly Repair texts workflow) replaces any damaged bundled text.
- **Halloween night** (`halloween.js`): 24 October to 2 November by the reader's own date (`?halloween` previews it,
  `?nohalloween` hides it). Carved lanterns (one InstancedMesh, glowing through emissive faces, no lights) by the south
  doors and the rug, a turnip lantern, and the Oíche Shamhna table of ghost stories near the entrance with a card on
  Samhain.
- The Room of the Day runs nightly from `data/daily-rooms.js` (`scripts/daily-room.mjs`).

## Services

- The visitors' book is a Cloudflare Worker (`worker/visitors-book`, workflow `visitors-book.yml`) at
  library-visitors-book.colm18.workers.dev with KV storage. Never touch the owner's other worker, `theaijournal-mcp`.
  Secrets live in GitHub (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, optionally `VISITORS_BOOK_ADMIN_TOKEN`);
  never ask for tokens to be pasted into chat.
- Analytics: Plausible, with an allow-list of event names in `analytics.js`.

## Owner's wishes

- The AI Journal is not to be featured anywhere in the library.
- The English Reading Room keeps only one darker book (Jekyll and Hyde, with a note).
- Traces of other readers are invented, not real data.

## Open to-dos (as of 1 October 2026)

- Gutenberg has no Hindi, Urdu or Bengali texts (Wikisource would be the source, now that `scripts/wikisource.mjs` exists; Urdu needs right-to-left reading)
  and only a handful in Irish (four are on the Irish Room's shelf); CELT (celt.ucc.ie) needs permission to republish.
- The Spanish room's *María* (Jorge Isaacs) and Silva's *Poesías* are not on Gutenberg: es.wikisource would need
  `scripts/wikisource.mjs` to read Spanish Wikisource.
- International Wing: outreach in Spanish, Portuguese, Chinese and French sent 28 September (no Quebec address
  found yet for the French batch). For mainland Chinese readers, host Three.js on the site:
  jsDelivr is unreliable there.
- The owner is moving the Gmail connector to the library's own address for press correspondence; press follow-ups
  were planned for around 2–3 October.
