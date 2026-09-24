# Third-party asset credits

The Library After Dark uses the following 1K glTF models as progressive visual enhancements. They are downloaded from Poly Haven during development and served locally from `assets/polyhaven`; the game retains procedural fallback furniture when assets are unavailable or low-bandwidth mode is enabled.

All six models are released under [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/).

| In-game use | Asset | Creator | Source |
|---|---|---|---|
| Victorian reading chair | Arm Chair 01 | Kirill Sannikov | https://polyhaven.com/a/ArmChair_01 |
| Shared Gothic sofa | Sofa 01 | Kirill Sannikov | https://polyhaven.com/a/Sofa_01 |
| Librarian's feature chair | Wooden Chair 01 | Jake Mobley | https://polyhaven.com/a/WoodenChair_01 |
| Ordinary catalogue chairs | Painted Wooden Chair 01 | Kuutti Siitonen | https://polyhaven.com/a/painted_wooden_chair_01 |
| Roof benches | Painted Wooden Bench | Kuutti Siitonen | https://polyhaven.com/a/painted_wooden_bench |
| Window and constellation seats | Painted Wooden Sofa | Kuutti Siitonen | https://polyhaven.com/a/painted_wooden_sofa |
| Return-and-discovery table | Wooden Table 01 | Poly Haven | https://polyhaven.com/a/WoodenTable_01 |
| Sorting-room utility shelves | Shelf 01 | Poly Haven | https://polyhaven.com/a/Shelf_01 |
| Sorting-room crates | Cheese Box 01, Wooden Crate 01 and 02 | Poly Haven | https://polyhaven.com/a/CheeseBox_01 |
| Sorting-room ladder | Wooden Ladder 02 | Poly Haven | https://polyhaven.com/a/wooden_ladder_02 |
| Sorting-room hand truck | Hand Truck | Poly Haven | https://polyhaven.com/a/hand_truck |
| Rocket Hall console | Vintage Spacecraft Instrument | Poly Haven | https://polyhaven.com/a/vintage_spacecraft_instrument |
| Departures compass | Seadog's Compass | Poly Haven | https://polyhaven.com/a/seadogs_compass |
| Departures luggage | Vintage Suitcase | Poly Haven | https://polyhaven.com/a/vintage_suitcase |

The shared 1K materials `smoked_walnut_veneer`, `brown_leather`,
`leather_red_02`, `old_stone_wall`, and `blue_plaster_weathered` are also
locally cached from Poly Haven under the same CC0 licence. The exact source
URLs and generated local file manifest are recorded in
`assets/polyhaven/manifest.json`; `scripts/fetch-polyhaven-assets.mjs`
rebuilds that cache and verifies upstream checksums.

Attribution is not legally required for CC0 assets, but is retained here to make provenance and future maintenance clear.

The roof benches intentionally use the project's own procedural dark-oak Gothic
design rather than the progressive painted bench/sofa models, so their material
and silhouette remain consistent with the library.

## Night railway hardware

The platform uses the detailed track segment and train connector from Kenney's
**Train Kit 1.1** as locally cached progressive enhancements. Kenney's complete
vehicles were reviewed but not used because their bright, toy-like finish did
not suit the library's Victorian night-service direction. The locomotive,
carriage, portals and buttoned-leather seats therefore retain bespoke geometry
and materials while the imported hardware supplies accurate rail proportions.

- Creator/distributor: Kenney (with additional credits to Guus Vermeulen and Tony Schaer)
- Source: https://kenney.nl/assets/train-kit
- Licence: [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)
- Cached files: `assets/models/kenney-train/track-detailed.glb` and `train-connector.glb`

## Hidden-room paintings and book covers

The H. Rider Haggard lost-kingdom painting and Arthur Conan Doyle consulting-room painting were generated specifically for this project with OpenAI image generation and then locally optimized for the game.

Scans used for the twelve newly added Haggard and Doyle covers are cached locally from the Open Library Covers API. Their Open Library cover identifiers are: 830243, 12640128, 8228482, 3064908, 1748730, 6477640, 2009278, 5815386, 5659856, 5788361, 9987819, and 9987794.

## Typefaces

Self-hosted from `assets/fonts` (Latin subsets, WOFF2, via the Fontsource packages).
Both are licensed under the [SIL Open Font License 1.1](https://openfontlicense.org);
the full licence texts sit beside the font files.

| Use | Typeface | Designer | Licence file |
|---|---|---|---|
| Title, headings, HUD mark | IM Fell English SC | Igino Marini (after the Fell types) | `assets/fonts/OFL-IM-Fell.txt` |
| Notes, prompts, dialogue | Cormorant Garamond | Christian Thalmann / Catharsis Fonts | `assets/fonts/OFL-Cormorant.txt` |

## Generated sound and light

`soundscape.js` synthesises the room reverberation, rain on glass, storm thunder
and the entrance clock's tick in the browser with the Web Audio API, and
`visual-quality.js` renders its reflection environment from a small procedural
scene. Neither uses any third-party recording or image.

## Texts for the curious-door rooms

The 22 books in the Horologist's Study, Night Conservatory, Ghost-Story Parlour and
Children's Attic are public-domain Project Gutenberg editions, fetched from the
[GITenberg](https://github.com/GITenberg) mirror and stored as `texts/pg<id>.txt`
with their Project Gutenberg headers intact (the old legal preamble of #778 was
trimmed to the book itself). The list is in `NEW-BOOKS.md`.
