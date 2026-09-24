(()=>{
'use strict';

// Physical book journey state manager for Library After Dark.
// Supports shelf -> carried -> reading -> returned flow.

window.BookJourneyIntegration={
  states:{
    SHELF:'shelf',
    CARRIED:'carried',
    PLACED:'placed',
    READING:'reading',
    RETURNED:'returned'
  },

  transition(book, nextState, location=null){
    if(!book) return null;

    book.state=nextState;
    if(location) book.location=location;
    book.lastInteraction=Date.now();

    return book;
  },

  canReadHere(location){
    if(!location) return false;
    return ['chair','desk','table','fireplace'].includes(location.type);
  },

  startReading(book, location){
    if(!this.canReadHere(location)) return false;
    this.transition(book,this.states.READING,location);
    return true;
  },

  returnToShelf(book,shelf){
    this.transition(book,this.states.RETURNED,shelf);
    return book;
  }
};
})();
