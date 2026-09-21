# After Dark Expansion

This build extends the existing Gutenberg Athenaeum without changing its core exploration, reading, journal, or discovery systems.

## New spaces

- **Sorting Room** — entered through the west-wing `STAFF · SORTING` door. Includes labelled crates, handwritten slips, utility shelving, a worktable, twine, a trolley, a ladder, and a hand truck, with a curated group of unusual public-domain books.
- **Cabinet of Travel & Expeditions** — entered through the east-wing `DEPARTURES` door. Includes map tables, tall rain-streaked windows, wall shelving, rolled charts, a ship lantern, a compass, suitcases, and exploration literature.
- **Rocket Hall** — the old summit room has been enlarged into a broad glass-and-iron observatory with more shelving, open circulation, an astronomical window, a brass-railed rocket platform, and a vintage instrument.
- **Returns and Discoveries table** — the return point is now a larger communal sorting table with paperwork, trays, lamps, a date stamp, seating, and the existing readable stack.

## Assets and performance

- Poly Haven models and materials are stored locally under `assets/polyhaven/` at 1K resolution.
- Attribution and source URLs are recorded in `ASSET_CREDITS.md` and `assets/polyhaven/manifest.json`.
- The two new side rooms are proximity-loaded and detached again after the player leaves their warm zone.
- Existing comfort, low-bandwidth, and mobile controls remain in place.

## Verification

Run all checks from the project folder:

```text
node --test *.test.cjs
```

The build was also checked in a running browser at desktop and phone-sized viewports.
