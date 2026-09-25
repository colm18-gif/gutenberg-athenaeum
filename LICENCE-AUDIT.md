# Licence audit — third-party assets

The site is public at libraryafterdark.space and accepts support payments through
Stripe, so every bundled third-party file needs a licence that allows use on a
public website with donations. Visitors see a short attribution list in
**Settings → Credits**, which links to `ASSET_CREDITS.md` for full details.

This audit was compiled on 25 September 2026 from the credit files in the repository.
The session that wrote it could not reach Freesound, Pixabay, Mixkit or
Wikimedia, so any row marked **Owner to confirm** has not been checked against its
source page. Open each link and record the licence shown there.

## Clear

| Files | Source | Licence | Attribution |
| --- | --- | --- | --- |
| Poly Haven furniture and materials (`assets/polyhaven`) | polyhaven.com | CC0 | Not required (credited anyway) |
| Kenney train track and connector, footsteps, `painting-passage.ogg`, `rocket-launch.ogg` | kenney.nl | CC0 (licence file bundled) | Not required (credited anyway) |
| Khronos Lantern | glTF Sample Assets | CC0 | Not required |
| Khronos Stained Glass Lamp | glTF Sample Assets, © 2021 Wayfair LLC, Eric Chadwick | **CC BY 4.0** | **Required.** Now shown in Settings → Credits |
| `met-scholar-1834.jpg` | The Met, object 812506 | Public domain (Met Open Access) | Courtesy line in Credits |
| Fonts | Fontsource | SIL OFL 1.1 (licence files bundled) | Licence files kept beside fonts |
| Books | Project Gutenberg, Wikisource, Standard Ebooks, Internet Archive | Public domain | Gutenberg headers kept in `texts/` |
| Procedural room sound, rain, thunder, clock, steam hiss | Written in code | Project's own | — |

## Owner to confirm

| File | Supplied as | Where to check | What to look for |
| --- | --- | --- | --- |
| `train-carriage-loop.ogg`, `train-whistle.ogg` | `209972__jrosin__wales-steam-train.flac` | https://freesound.org/s/209972/ | CC0 or CC BY is fine (credit already shown). **CC BY-NC** is risky alongside the Stripe support box. If so, replace the file or ask jrosin for permission |
| `door-open.ogg` | `soundreality-opening-door-411632.mp3` | Pixabay sound 411632 | Pixabay Content License: use in a game is fine, no credit needed |
| `secret-door.ogg` | `tanweraman-old-door-sound-night-time-505140.mp3` | Verified 16 Sept 2026 as Pixabay Content License | Nothing further |
| `cat-meow.ogg` | `dragon-studio-cat-meow-401729.mp3` | Pixabay sound 401729 | As above |
| `book-pull.ogg` | `freesound_community-pulling-books-from-a-bookcase-102456.mp3` | Pixabay sound 102456 (“freesound_community” uploads are Freesound CC0 re-hosts) | Confirm it is still listed under the Pixabay licence |
| `train-rumble-distant.ogg` | `vadim_makes_sound-underground-subway-station-distant-train-rumble-1-546578.mp3` | Pixabay sound 546578 | As above |
| `page-turn.ogg` | `mixkit-single-book-paging-1101.wav` | mixkit.co, sound 1101 | Mixkit Sound Effects Free License: free in projects, no credit needed |
| `machine-flap.ogg` | `split-flap-display-announcement-…-crooner.mp3` | Unknown. The name suggests a Freesound or Pixabay upload by “crooner” | Find the original page. If it can't be found, replace the file with a CC0 split-flap recording |
| `botanist.jpg`, `moonlit-bay.jpg`, `painting-adventure-storm.jpg`, `painting-journey-caravan.jpg`, `painting-wonder-garden.jpg`, `portrait-impossible-stairs.jpg`, `portrait-lantern-librarian.jpg`, `portrait-veiled-widow.jpg`, `secret-librarian-portrait.jpg` | No source recorded | Your own records | Where each came from: generated, public-domain scan or purchased. Add the answer to `ASSET_CREDITS.md` |
| `painting-haggard-lost-kingdom.jpg`, `painting-doyle-consulting-room.jpg` | Generated with OpenAI image generation (recorded) | — | Nothing further |
| Open Library cover scans (12 IDs in `ASSET_CREDITS.md`) | Open Library Covers API | openlibrary.org | Covers are publisher images. Open Library allows reasonable use but recommends a courtesy link |

Once a row is confirmed, move it to the **Clear** table and note the date.
