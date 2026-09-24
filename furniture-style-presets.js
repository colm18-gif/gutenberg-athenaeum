(()=>{
'use strict';

// Furniture guidance layer for the Victorian redesign pass.
// Keeps room modules consistent while allowing future CC0 asset swaps.
window.FURNITURE_STYLE_PRESETS={
  readingRoom:{
    seating:['victorian_armchair','oak_reading_chair','leather_wingback'],
    placement:'face_books_and_reading_desks',
    details:['brass_lamp','side_table','parchment_notes']
  },
  grandHall:{
    seating:['ornate_bench','leather_sofa','carved_armchair'],
    placement:'social_reading_area',
    details:['side_tables','display_books','brass_accents']
  },
  forgottenArchive:{
    seating:['damaged_armchair','old_stool','broken_reading_chair'],
    placement:'irregular_abandoned_layout',
    details:['fallen_books','dust_layers','crooked_frames']
  },
  secretRoom:{
    seating:['themed_armchair'],
    placement:'centred_on_discovery_point',
    details:['curated_objects','themed_artifacts']
  }
};
})();
