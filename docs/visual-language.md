# Library After Dark — visual language

The building should feel like one Victorian library with a long history. New rooms inherit the same construction and furniture, then show different degrees of care, age, and strange use. Keep discovery and reading as the focus.

## Palette and finishes

| Use | Finish | Working colour |
| --- | --- | --- |
| Structural shelves, doors, desks, dado | Dark stained walnut, satin wear on edges | `#321c10` to `#4d2d19` |
| Wall above dado | Warm aged masonry or plaster | `#9a8877` over warm stone texture |
| Main floor | Medium walnut parquet with fine seams | `#67442d` to `#80563a` |
| Upholstery and rugs | Worn burgundy, occasional forest green | `#5d1e22`, `#1f4034` |
| Handles and signs | Aged brass, modest highlights | `#9f7330` |
| Reading light | Warm amber, concentrated around books and desks | Keep legible |

Keep blue, bright white paint, polished chrome, and unrelated wood tones out of the public rooms. Special rooms may have one striking material or colour, but the walnut, brass, and door/shelf profiles should remain recognisable.

## Construction rules

- Continue the same dado height, shelf bays, door framing, and walnut stain through public rooms.
- Use one floor board scale and shared material across the entrance and west wing. Place rugs around reading, not as a substitute for the floor.
- Preserve shelves and discoverable books. Put elaborate details at room landmarks rather than on every bookcase.
- Reading chairs face shelves. Plain wooden chairs serve desks; the upholstered armchair marks a place to linger.
- Public rooms are kept in good order. Restricted rooms are worn. Neglected rooms show progressively damaged versions of the same fittings.
- Secret rooms inherit the common doorway and at most one dominant thematic feature.

## CC0 furniture already bundled

- [Arm Chair 01](https://polyhaven.com/a/ArmChair_01): upholstered Victorian seat for reading and fireside positions. Already active in higher quality mode.
- [Wooden Table 01](https://polyhaven.com/a/WoodenTable_01): worn walnut table used at the return desk. Already active in higher quality mode.
- [Wooden Chair 01](https://polyhaven.com/a/WoodenChair_01): Gothic chair reserved for a feature position because its geometry is much heavier than a desk chair.

Poly Haven publishes these models under CC0. The bundled painted white farmhouse chair does not suit the public-room palette and should stay out of this scheme. Keep the procedural furniture available in low bandwidth and low power modes. Introduce another asset only after checking its appearance at 1K resolution, triangles, and actual loading cost.

## Trial implemented

The entrance and western wing now share the hall's masonry, parquet texture and plank scale, plus the same walnut dado runs. The entrance desk chairs and window cushions use the library's wood and burgundy materials. Geometry and collision of shelves, doors, stairs, and book interactions remain in place.

## Rollout to the remaining rooms

The east wing mirrors the west wing's stone, parquet, and walnut dado. The themed author rooms and the memory rooms use the same board scale and a shared walnut back-wall dado; each retains its accent colour, shelving, and degree of wear. The Sorting Room, Departures room, and librarian’s office now use the public stone and floor materials in their separately built shells. Their furniture, props, doors, and books remain specific to their use.

The basement stays damp stone, the rooftop stays weathered stone, and the Carroll room retains its disorienting checker floor. These are deliberate changes in environment reached from the same library, rather than unrelated public-room finishes.


## Atmospheric furniture and lighting pass

- Load the already bundled 1K Sofa 01 and Wooden Chair 01 for their specified sofa and feature chair positions in standard mode. Reuse one template per model; low bandwidth and low power retain the procedural fallbacks.
- Desk chairs with the former painted designation use compact dark-wood frames and burgundy cushions, not the white farmhouse model.
- In standard mode, ease the broad ambient and camera fill slightly, use existing lamp positions as two local reading pools in the hall, and warm the wing lights. Themed rooms keep their coloured central light but gain warm reading light. The quiet and unread rooms receive extra local light for legibility.
- High contrast, low bandwidth, and low power modes retain the prior broad lighting levels.

## Aged walls in the memory rooms

- The Quiet Stacks and Unread room now use a shared 512px worn version of the entrance masonry. Dusty shading and a few hairline cracks are baked into the texture, so they add no mesh or light draw calls.
- The Quiet Stacks keep more of the warm stone colour; Unread is a shade darker. The Returning room and metal Repository retain their distinct roles. Low bandwidth mode retains its previous stone material.
- Check both spaces after entering from the Returning room, including books and signs at night; wall wear should be visible without dimming reading surfaces.

## Shelf and rug finish

- Reading rugs now share one small woven design with a faded burgundy field, brass-toned border, and central medallion. Room tints reuse the texture and material cache.
- Standard mode adds restrained brass shelf trim and a shared reading-room plaque. Neglected shelves retain their broken planks and use a duller label. Low bandwidth mode avoids the added shelf meshes.

## Night railway and lunar launch

- The conductor starts each railway leg and announces arrivals. Talk to him again to open the carriage door at a stop. The brass punch is now an object to inspect.
- The route loops from the library through the Signal House, Tidebound Quay, Unmarked Stop, and Collections Depot. The two new stops have small reading rooms with railway and journey books already in the catalogue.
- Boarding the rocket places the reader inside its cabin. The red button begins a four-count launch and a roughly 25-second flight with changing porthole views and staged arrival messages. The hatch can be used to leave before launch.

## Visual review

Compare a view from the entrance toward the west door, a view inside the western reading wing, and the reading desk close up. Check daylight and night, low bandwidth mode, readability, doorway clearance, and frame rate on a modest device. Then carry the same materials into the east wing and themed rooms, adapting only wear and accent colour.
