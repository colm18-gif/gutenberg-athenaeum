/*
 * Library After Dark runtime bridge
 *
 * A lightweight integration point between the existing game runtime and
 * optional experience systems. This intentionally does not replace existing
 * game logic; it provides shared state and safe hooks for future integration.
 */
(function(){
  const existing = window.LibraryRuntime || {};

  const state = existing.state || {
    carriedBook: null,
    readingBook: null,
    discoveredRooms: [],
    discoveredBooks: [],
    journey: null
  };

  const runtime = {
    state,

    books: {
      carry(book){
        state.carriedBook = book || null;
        return state.carriedBook;
      },
      read(book){
        state.readingBook = book || state.carriedBook;
        return state.readingBook;
      },
      returnBook(){
        const book = state.carriedBook;
        state.carriedBook = null;
        state.readingBook = null;
        return book;
      }
    },

    discoveries: {
      room(id){
        if(id && !state.discoveredRooms.includes(id)) state.discoveredRooms.push(id);
      },
      book(id){
        if(id && !state.discoveredBooks.includes(id)) state.discoveredBooks.push(id);
      }
    },

    journeys: {
      begin(destination){
        state.journey = { destination, stage: 'boarding' };
        return state.journey;
      },
      update(stage){
        if(state.journey) state.journey.stage = stage;
      },
      end(){
        const journey = state.journey;
        state.journey = null;
        return journey;
      }
    },

    register(name, system){
      this[name] = system;
    }
  };

  window.LibraryRuntime = Object.assign(runtime, existing);
})();
