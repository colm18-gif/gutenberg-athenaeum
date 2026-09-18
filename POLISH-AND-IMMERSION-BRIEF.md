# Library After Dark: Polish and Immersion Brief

Improve the existing Library After Dark virtual library through a comprehensive polish, immersion, architectural-coherence and performance pass.

The fundamental concept must remain unchanged: Library After Dark is an explorable first-person virtual library built around public-domain literature, serendipitous discovery and the pleasure of wandering through a mysterious building. It should not become a conventional searchable digital library or a generic videogame.

IMPORTANT: Before changing anything, inspect the existing project carefully. Identify what already works and preserve it. Do not remove functioning books, rooms, interactions, discoveries, characters or atmospheric features unless they are clearly broken. Prefer improving existing systems over rebuilding them.

The overall objective is to make the visitor increasingly forget that they are exploring a collection of 3D assets and instead feel that they are wandering through a strange, old, coherent library that might continue indefinitely beyond what they can see.

## 1. Footsteps and Movement Audio

Add subtle, responsive footstep sounds.

Footsteps should:

- Play only while the player is actually moving.
- Stop immediately when movement stops.
- Match walking cadence and movement speed.
- Randomly select from several variations so repetition is not obvious.
- Remain relatively quiet within the overall soundscape.
- Use lightweight compressed audio assets.
- Have negligible performance impact.

Where practical, distinguish between major surfaces:

- timber floorboards;
- stone;
- carpet/rugs;
- stairs;
- railway platforms or carriages.

Introduce occasional subtle floorboard creaks independently of footsteps.

Sound can also reward exploration. A hollow-sounding board, unusual creak or subtle change in acoustics might suggest that something is concealed nearby without explicitly telling the visitor what to do.

## 2. Doors and Doorways

Audit every visible door and doorway.

Some existing doors feel generic or architecturally inappropriate for the rooms in which they appear. Replace or improve these where necessary.

Use an architectural vocabulary appropriate to each space:

- substantial dark timber panelled doors for major library rooms;
- elegant smaller doors for studies and reading rooms;
- double doors for grand spaces where appropriate;
- simpler doors for secondary/service areas;
- railway-appropriate doors for stations and carriages;
- concealed entrances rather than conventional doors for secret spaces.

Potential concealed entrances include:

- moving bookcases;
- portraits;
- timber wall panels;
- tapestries;
- fireplaces;
- mirrors;
- unusually large books;
- architectural mouldings.

Check every doorway for:

- scale;
- proportions;
- wall alignment;
- frame depth;
- handles and hardware;
- textures;
- shadows;
- opening direction;
- collision;
- clipping;
- interaction behaviour.

Doors should look built into the architecture rather than attached to it.

Avoid direct sightlines through several rooms. Where useful, introduce short vestibules, turns, corridors, arches or alcoves so that entering another room feels like crossing into a genuinely separate place.

## 3. Walls, Floors and Ceilings

Perform a complete architectural consistency audit.

Look for:

- missing textures;
- disappearing surfaces;
- visible backs of geometry;
- gaps between walls;
- clipping;
- floating objects;
- inconsistent materials;
- mismatched skirting;
- badly aligned corners;
- texture stretching;
- unrealistic wall thickness;
- exposed edges;
- rooms visible through geometry;
- obvious seams.

Give particular attention to areas previously affected by disappearing wall textures.

Ceilings should receive the same attention as walls. Avoid ceilings that look like forgotten flat surfaces.

Depending on the room, consider:

- timber beams;
- plaster;
- coffering;
- mouldings;
- vaulted sections;
- subtle ceiling decoration.

Do not overdecorate every room. Architectural variety should feel intentional.

## 4. Lighting

Undertake a complete lighting pass.

The library should remain atmospheric and relatively dark but never become frustrating to navigate or read within.

Use warm pools of light from believable sources such as:

- candles;
- fireplaces;
- desk lamps;
- wall lamps;
- chandeliers;
- railway lamps;
- moonlight through windows.

Avoid uniform illumination.

Different spaces should have subtly different lighting personalities.

Reading spaces should be comfortable enough to use.

Secret and forgotten areas can be darker but should retain enough visual information to encourage exploration.

Where possible, lighting itself should guide exploration. A faint warm glow around a distant corner can be more effective than a sign or waypoint.

Avoid excessive dynamic lights and expensive real-time shadows. Use baked/static lighting or inexpensive alternatives where visually acceptable.

## 5. Room Ambience

Give important areas a subtle acoustic identity.

Possible ambience includes:

- distant fire crackling;
- occasional timber creaks;
- faint wind;
- rain against windows;
- ticking clocks;
- subtle page movement;
- distant railway sounds;
- low building groans;
- barely audible room tone.

Silence is also important.

Do not fill every space with constant sound. Some rooms should be almost completely silent so that entering an acoustically different area becomes noticeable.

## 6. Environmental Soundscape

Create a restrained overall soundscape rather than conventional videogame background music.

Sounds should respond naturally to location.

For example, approaching the railway might gradually introduce distant rails, steam, carriage movement or station ambience.

Approaching a fireplace should increase the sound of fire.

Rain should become more noticeable near windows.

Moving deep underground or into hidden spaces should gradually remove sounds associated with the outside building.

Use spatial/positional audio where practical.

Transitions between sound zones should fade naturally rather than switch abruptly.

## 7. Secret Passages and Discovery

Review existing secret areas and improve their presentation.

Secrets should feel discoverable rather than random.

Use subtle environmental clues:

- an unusual portrait;
- scratches on a floor;
- displaced books;
- a candle where one would not expect it;
- faint light beneath panelling;
- a hollow footstep;
- strange airflow;
- an architectural inconsistency;
- a bookshelf slightly different from the others;
- a barely audible sound behind a wall.

Avoid excessive UI prompts such as "SECRET DOOR HERE."

Some secrets should be easy to find. Others should reward extremely curious visitors.

Where possible, discoveries should lead to literature.

A strange passage might lead to:

- a forgotten book;
- an obscure author;
- a tiny reading room;
- an abandoned collection;
- an underground archive;
- an unusual literary exhibit;
- another clue.

Do not turn this into a puzzle game. Discovery and curiosity are more important than solving formal puzzles.

## 8. Book Interaction

Improve the physical sensation of selecting and reading books.

Currently, taking a book from a shelf should feel like physically examining an object rather than abruptly zooming the camera into a texture.

When a book is selected:

1. remove or animate it naturally from its shelf;
2. move it toward a comfortable inspection position;
3. maintain sensible scale and perspective;
4. allow the visitor to identify the title/cover;
5. provide a natural transition into reading.

Avoid excessive camera zoom.

Where appropriate, allow books to be taken to:

- desks;
- chairs;
- fireside reading areas;
- railway compartments;
- secluded reading nooks.

Reading should remain within the Library After Dark experience whenever technically practical.

Make opening, closing and returning books intuitive.

Preserve the central philosophy that visitors discover books spatially rather than primarily through search.

## 9. Environmental Storytelling

Tell stories through the building itself without lengthy exposition.

Examples could include:

- an abandoned cup beside an open book;
- a chair pulled away from a desk;
- handwritten-looking notes;
- stacks of books awaiting shelving;
- a ladder left against shelves;
- extinguished candles;
- a clock stopped at an unexplained time;
- footprints or dust;
- forgotten luggage near the railway;
- a reading room apparently used by someone moments ago;
- objects associated with particular authors or books;
- changing architectural periods suggesting that different parts of the library were built at different times.

Not every object needs an explanation.

Mystery is valuable.

Visitors should occasionally wonder, "What happened here?"

## 10. Railway Improvements

Treat the library railway as a significant environment rather than simply transportation.

Audit:

- carriage models;
- carriage interiors;
- doors;
- seats;
- windows;
- platform architecture;
- lighting;
- tracks;
- signage;
- textures;
- scale;
- sounds;
- transitions between library and railway.

Where appropriate, use high-quality free or permissively licensed assets rather than building everything from crude primitives.

The railway should feel old, literary and slightly mysterious rather than modern.

Consider:

- timber-panelled compartments;
- brass fittings;
- luggage racks;
- old lamps;
- upholstered seats;
- period luggage;
- destination boards;
- station clocks;
- book racks inside carriages.

Avoid unnecessary polygon counts and very large textures.

The railway should feel like it might travel to parts of the library the visitor has not yet discovered.

## 11. Exploration Without Waypoints

Do not introduce conventional videogame quest markers, minimaps or glowing arrows.

Guide visitors using:

- architecture;
- lighting;
- sound;
- partially visible spaces;
- unusual objects;
- distant movement;
- environmental clues.

The visitor should frequently think:

"I wonder what's through there."

That feeling is central to the project.

## 12. Visual Variety With Architectural Coherence

Individual wings should have recognisable identities without appearing to come from completely different games.

Use recurring architectural motifs, materials and proportions to establish that everything belongs to one enormous library.

Allow controlled variation between:

- grand halls;
- intimate reading rooms;
- forgotten collections;
- underground spaces;
- railway environments;
- secret rooms.

Transitions between dramatically different spaces should be architecturally believable.

## 13. Performance and Loading

Treat performance as a major requirement.

Before adding assets, audit the current project for performance bottlenecks.

Optimise:

- texture sizes;
- texture compression;
- duplicate materials;
- geometry;
- draw calls;
- lighting;
- shadows;
- audio;
- book assets;
- unused resources.

Do not load the entire library unnecessarily when the visitor first arrives.

Where compatible with the existing architecture, consider:

- lazy loading;
- room/zone-based loading;
- asset reuse;
- instancing;
- texture atlases;
- compressed textures;
- compressed audio;
- frustum culling;
- occlusion culling;
- unloading distant areas.

Doors, corridors and architectural transitions can also conceal loading and unloading of neighbouring areas.

Prioritise fast initial entry into the library.

The visitor should be able to begin exploring before nonessential distant assets have loaded.

Avoid downloading unnecessarily large textures or audio files.

Optimise especially for ordinary laptops and mobile devices rather than assuming gaming hardware.

## 14. Progressive Enhancement

Do not sacrifice accessibility to users with weaker devices.

Where practical, automatically reduce expensive effects when performance is poor.

Potential scalable effects include:

- shadow quality;
- render distance;
- particle density;
- reflections;
- lighting complexity;
- texture resolution.

The core library, books and exploration should remain available even when visual effects are reduced.

## 15. Interaction Consistency

Audit all interactive objects.

Use a consistent interaction model for:

- books;
- doors;
- portraits;
- secret mechanisms;
- librarian interactions;
- railway interactions;
- chairs/desks;
- other discoverable objects.

Avoid situations where visitors have to guess whether they should click, press a key or walk into an object.

Keep UI minimal and immersive.

## 16. Preserve Serendipity

Do not solve the library's intentional inefficiency.

Do not redesign the experience around:

- catalogue searching;
- recommendation algorithms;
- conventional menus;
- genre filters;
- optimisation for finding a known title.

The pleasure of Library After Dark comes partly from encountering something the visitor did not know they wanted.

Technology should support wandering rather than eliminate it.

## 17. Final Quality-Control Pass

After making improvements, walk systematically through the entire accessible library.

Check every:

- room;
- corridor;
- door;
- staircase;
- secret passage;
- railway area;
- reading area;
- book interaction;
- wall;
- floor;
- ceiling.

Specifically test for:

- clipping;
- missing textures;
- broken collisions;
- inaccessible areas;
- floating geometry;
- incorrect lighting;
- excessive darkness;
- sound glitches;
- repetitive audio;
- broken book interactions;
- camera problems;
- loading stalls;
- console errors;
- mobile/browser problems.

Do not consider the task finished merely because the code runs.

The finished experience should feel polished when actually explored.

## Guiding Design Principle

Above everything else, preserve mystery.

Library After Dark should feel larger than the visitor can fully understand.

Architecture should occasionally imply spaces that may or may not be accessible. Sounds can suggest activity elsewhere. Railway destinations can hint at distant collections. Books can lead to rooms and rooms can lead to books.

Not every mystery needs an explanation and not every door needs to open.

The aim is to create the feeling that the visitor has entered an enormous, old and slightly impossible library that existed before they arrived and will continue to exist after they leave.
