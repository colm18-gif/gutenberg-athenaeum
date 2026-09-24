(()=>{
'use strict';

// Connect room identity, style, and lighting choices in one place.
// Keeps visual tuning separate from room generation code.
window.applyRoomAtmosphere=function(roomType, options={}){
  const styles=window.LibraryRoomStyles||{};
  const lights=window.LibraryLightingPresets||{};

  const style=styles[roomType]||styles.readingRoom||{};
  const lighting=lights[roomType]||lights.readingRoom||{};

  return {
    roomType,
    style,
    lighting,
    effects:{
      dust: style.decay>0.5,
      warmth: lighting.warmth||0.8,
      visibility: options.visibility||'normal'
    }
  };
};

window.getLibraryMood=function(roomType){
  const mood=window.applyRoomAtmosphere(roomType);
  return `${roomType}: ${mood.style.atmosphere||'quiet discovery'}`;
};
})();
