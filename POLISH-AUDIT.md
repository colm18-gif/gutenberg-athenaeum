# Library After Dark polish audit

This audit accompanies `POLISH-AND-IMMERSION-BRIEF.md`. It records what the
current build already provides and keeps the remaining work incremental: no
working room, book, character, discovery, or atmospheric system should be
discarded merely to satisfy the brief differently.

| Brief area | Current state | Next safe pass |
| --- | --- | --- |
| Footsteps and movement audio | Surface-aware timber, stone, carpet and railway footsteps; speed cadence; quiet variation; immediate stop; occasional concealed-area floorboard clue | Tune volumes after browser playtesting |
| Doors and doorways | Panelled room doors, themed secret paintings, moving shelves, hatches, wall panels and railway doors; recorded effects routed by mechanism | Walk every threshold and record any scale or clipping defect |
| Walls, floors and ceilings | Closed roof shells, seam repairs, room materials and collision boundaries are present | Visual sweep at several viewport sizes |
| Lighting | Warm source-based lights, brighter reading areas, performance-capped nearby lights, moon/weather variation | Check each remote/secret room on a dim display |
| Room ambience | Fire, rain, building events, page sounds and distant trains; intentionally quiet rooms remain | Add only where a room lacks identity during playtesting |
| Environmental soundscape | Proximity fire, underground attenuation, railway zones and location-dependent train rumble | Gradual window-rain emphasis if it remains inexpensive |
| Secret passages | Environmental clues, journal discoveries, portraits, shelves, hatches and walls lead to literature | Strengthen only secrets users repeatedly miss |
| Book interaction | Physical pickup, held-book inspection, page turns, chairs, desks, return and in-world reader | Continue testing scale and collision on mobile |
| Environmental storytelling | Notes, displaced furniture/books, clocks, luggage, objects and room records | Add sparingly; unexplained space is intentional |
| Railway | Victorian carriage, platforms, depot, period details, books, reversible journey and ambient rumble | Visual doorway/seat audit during a complete ride |
| Exploration without waypoints | Lighting, Quill, librarian guidance, partial journal map and environmental prompts; no minimap or catalogue | Preserve this constraint |
| Architectural coherence | Repeated timber, brass, stone, Gothic furniture and room-specific variants | Review transitions between distant themed spaces |
| Performance and loading | Lazy room construction, nearby cover loading, performance-zone attachment, compressed audio and local compressed books | Profile ordinary laptops and mobile hardware |
| Progressive enhancement | Low-bandwidth, reduced-motion, capped pixel ratio and low-power detection | Consider automatic downgrade after sustained slow frames |
| Interaction consistency | Focus reticle and one contextual interaction action across world objects | Test touch and keyboard prompts side by side |
| Preserve serendipity | Spatial discovery remains primary; no searchable catalogue or recommendation screen | Preserve this constraint |
| Final quality control | Automated coverage for books, railway, stair, descent, analytics, audio and interaction contracts | Repeat a manual room-by-room walkthrough before major releases |

The brief is deliberately broader than a single release. This file should be
updated after each polish pass so future improvements remain coherent rather
than becoming an accumulation of unrelated assets.
