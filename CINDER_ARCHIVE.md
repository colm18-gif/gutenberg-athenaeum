# The Cinder Archive

In the Gothic Parlour, lift the scorched book in the cold hearth on the south wall, then examine the opening. The room script is fetched only when entering. Only the tiny entrance is part of startup. A failed download can be retried at the hearth; duplicate interactions share one request.

The archive builds on entry and frees its geometry, textures, materials, interaction targets and lights after 25 seconds away. A selected or moved archive volume keeps its resources alive. The return passage also works while carrying a book. The journal records the room only after visiting. `?room=cinder` is supported for inspection.

All bindings, damage and remnants are original theatrical representations, explicitly labelled as such. Three readable texts: Beowulf (English translation), Carlyle’s published French Revolution (the first-volume draft was burnt and rewritten), and Garnett’s Anglo-Saxon poems (including Maldon, preserved through a pre-fire transcript). The latter two go through the existing New books validation and bundling workflow. Cotton Genesis, Hortus deliciarum and the Herculaneum papyri are labelled fragment/absence exhibits, never fabricated complete texts.

Historical sources:

- British Library, Beowulf: https://www.bl.uk/stories/blogs/posts/beowulf-online
- British Library, Cotton Genesis: https://www.bl.uk/stories/blogs/posts/rescued-from-the-flames-the-cotton-genesis-restored-to-life
- National Library of Scotland, Carlyle letters (burning of the French Revolution manuscript): https://manuscripts.nls.uk/repositories/2/resources/19264
- Oxford Academic, Maldon manuscript and fire: https://academic.oup.com/res/article/75/322/525/7778685
- BnF, Hortus deliciarum and destruction in 1870: https://catalogue.bnf.fr/ark:/12148/cb30598696j
- Oxford, Herculaneum papyri carbonised by volcanic heat: https://www.herculaneum.ox.ac.uk/index.php/papyri/
- Readable editions: https://www.gutenberg.org/ebooks/16328 , https://www.gutenberg.org/ebooks/1301 , https://www.gutenberg.org/ebooks/15879

Checks: `node --check cinder-archive.js`, `node --check cinder-room.js`, `node --check game.js`, `node --test cinder-archive.test.cjs`, and the full Library tests workflow before merge.

## Access and material pass (14 October 2026)

The central workbench previously sealed the room across its middle: after the player's radius was added, its collider overlapped both adjacent exhibit colliders. The workbench now stands at the north wall. A continuous central aisle reaches all six displays; the shorter hearth passage also leaves a cross-route in front of the southern exhibits. The navigation test flood-fills the actual collision layout from arrival to every exhibit's viewing position for radii 0.42 and 0.60 m.

The archive now uses locally hosted CC0 Poly Haven Sandstone Blocks 08 and Smoked Walnut Veneer diffuse/normal maps, with metre-scale UVs. Original geometry adds masonry vault ribs, brass display lamps and inlay, green-grey exhibit pads, open shelving and a worn flagstone floor. Two existing room lights provide warmer, stronger illumination; the pass adds no lights. Display labels sit below the books so they do not obscure their covers.

Photo maps load only after room entry and are skipped in low-bandwidth mode. They are disposed with the room; late texture callbacks cannot attach to an unloaded or rebuilt room. No new runtime CDN or startup asset is required.
