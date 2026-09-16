# The night collections service

An additive discovery from the existing industrial Repository. Its parcels door opens onto a protected platform with a locomotive and reading carriage. The conductor's ticket punch starts a 60-second journey; the worn reading seat offers arrival in about two seconds. Reading continues during the journey. Settings, pause, journal and hidden-tab states pause it. Return tickets, the depot bell and the existing R/mobile return controls provide a quick way home.

Railway rooms and geometry are built once, on discovery. Only the occupied railway room is attached and visible. Scenery is recycled in place, lights have no shadows, and reduced-motion mode freezes passing scenery without moving the camera. The original distant train-pass effect remains; the ride reuses the existing licensed rumble asset in an independent, lazily created audio pool.

## New complete editions

- E. Nesbit, *The Railway Children*, [Project Gutenberg 1874](https://www.gutenberg.org/ebooks/1874). Produced by Les Bowler and David Widger.
- Charles Dickens and collaborators, *Mugby Junction*, [Project Gutenberg 27924](https://www.gutenberg.org/ebooks/27924). Transcribed by Les Bowler. Includes stories by Andrew Halliday, Charles Collins, Hesba Stretton and Amelia Edwards, as credited in the edition.
- Robert Louis Stevenson, *Across the Plains, with Other Memories and Essays*, [Project Gutenberg 614](https://www.gutenberg.org/ebooks/614). Produced by David Price and Margaret Price.

The downloaded editions retain their Gutenberg credits and licence notices. Each has both a plain-text edition and the existing offline JavaScript loading format, plus original local cover artwork and librarian notes. Existing books appear as additional depot copies; no original shelves, notes, discoveries or books are removed.

## Checks

`node --test analytics.test.cjs experience.test.cjs signage.test.cjs open-access.test.cjs verne-descent.test.cjs book-completions.test.cjs night-train.test.cjs`

Railway checks cover collision-safe arrivals and circulation, lazy construction, isolated rooms, pause and quick-arrival behaviour, reusable return controls, complete editions, reader-overlay progress, looping audio cleanup and reduced motion.
