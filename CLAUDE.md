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
  `crusoe-island.js`, `mars.js`, `poe-room.js`, `irish-room.js`)
  are built only when the reader approaches and freed ~25 s after they leave. Each gets an ambience recipe in
  `room-ambience.js` and a place in `PLACE_GROUPS` in `game.js`.
- The Poe Room (`poe-room.js`, x −330, z −140) is behind a chamber door in the Gothic Parlour's west wall, under a raven on a
  bust of Pallas (`?room=poe`). A heart beats under the floor, louder near the loose board (made with game.js's `sound`, no
  file); lifting the board gives up Volume 2 of the Raven Edition, which opens at The Tell-Tale Heart (`pendingStory`).
- The Irish Room (`irish-room.js`, x −330, z −205), Seomra na hÉireann, is behind a green Georgian door in the Grand Hall's
  south wall (x −8.3; `?room=irish`): shelves `irish-myth`, `irish-revival`, `irish-writers` and `irish-gaeilge` in
  `data/new-books.js` (the last checked as Irish, `ga`), round a turf fire, with a harp, a St Brigid's cross and an ogham stone.
- Plain text: `read.html?book=ID` shows any book as one readable page (linked from every book page and the reader). Reading
  cards (`reading-card.js`, `/card` on the visitors' book worker) carry bookmarks between devices by a four-word code.
- Every chair, sofa and bench is one of the library's seats: build it with `chair()`/`sofa()`/`bench()` in game.js, or
  pass `registerSeat` into a room module and call it (with a `bookIds` getter for that room's books; push the parts
  onto the room's list so they are freed with it). `?debug` exposes `__athenaeum.seats`.
- Doors come from the shared kit in `library-doors.js`. A room behind a door is given `doorKit` and hangs both sides of
  its door with `doorKit.hang(parent,{data,mark,...look})` (`color`, `glazed`, `planked`, `plain`, `fanColor`, `frame`,
  `cornice`, `pediment`; no light of its own), then lets the reader through with `doorKit.pass(data.kit,data,go)` so
  the leaf swings first. Mark the hall side of a door so it is not among the room's own parts, or it stops answering
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
  Cyrillic, book-page addresses in Latin letters by Ukraine's official transliteration). Gutenberg has no Ukrainian texts,
  so its books are `['ws:<Wikisource page>', …]`: `scripts/wikisource.mjs` reads the page and its chapter subpages from
  uk.wikisource.org (checking it links to the author's page, leaving out navigation and editors' notes), keeps it in
  `texts/bundled-gzip` under a stable number from 950000 with a `WIKISOURCE TEXT` header, and credits Wikisource. Rooms in `ROOM_LANGUAGES` (`scripts/new-books.mjs`, and in `game.js`) are
  searched on Gutendex in their language, get `book.language` (word help steps aside) and book pages in it;
  `/es/`, `/pt/`, `/fr/`, `/la/`, `/uk/` and `/zh/` are the landing pages. Their books are keyed
  in `data/new-books-resolved.js` as `Title [lang]` (`resolvedKey`), so a French *Madame Bovary* and the English one
  can both stand. The rooms share two lamps
  that move to the reader's room, so adding a room adds no lights. Their reading-table chairs are the library's
  own seats (`registerSeat`), opening one of the room's books. Rooms stand at x −410, −470 and −530 (the Latin room at z 164, the Ukrainian at x −530): keep them clear of
  Crusoe's island (x −420, z 165–199; a test checks).
  For these rooms the text's own `Language:` line must match (a title alone lets translations through). Gutendex
  is often slow; Project Gutenberg's `cache/epub/feeds/pg_catalog.csv` (fetched in a workflow) is the reliable way
  to find a book's number in a given language.
- `/?book=ID` opens a book in the reader; `/?room=mars` (international-wing or es, portuguese-room or pt, chinese-room or zh, french-room or fr, latin-room or la, ukrainian-room or uk, evening-room, periodicals-room, learners-room, boathouse,
  daily-room, poe, irish, moon, rocket-hall, consulting-room, time-laboratory, lost-kingdoms, verne-rooms) goes to a room.
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
