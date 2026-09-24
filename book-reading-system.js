(()=>{
'use strict';

/**
 * Book journey state layer.
 * Keeps the reading experience consistent across rooms:
 * shelf -> carried -> placed -> reading -> returned
 */
window.createBookReadingSystem=function(){
  const states={
    SHELF:'shelf',
    CARRIED:'carried',
    PLACED:'placed',
    READING:'reading',
    RETURNED:'returned'
  };

  const books=new Map();

  function register(book){
    if(!book?.id) return;
    books.set(book.id,{...book,state:states.SHELF});
  }

  function move(bookId,state){
    const book=books.get(bookId);
    if(!book) return null;
    book.state=state;
    return book;
  }

  function canRead(bookId,location){
    const book=books.get(bookId);
    return !!book && (location==='chair'||location==='table');
  }

  function get(bookId){
    return books.get(bookId)||null;
  }

  return {states,register,move,canRead,get};
};
})();
