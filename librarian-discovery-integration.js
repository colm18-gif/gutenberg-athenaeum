// Librarian Discovery Integration
// Connects discoveries, notes and hidden knowledge into a shared experience layer.

window.LibrarianDiscovery = {
  discoveries: [],
  notes: [],

  recordDiscovery(item) {
    if (!item) return;
    this.discoveries.push({
      item,
      discoveredAt: Date.now()
    });
  },

  addNote(note) {
    if (!note) return;
    this.notes.push({
      text: note,
      createdAt: Date.now()
    });
  },

  getHints() {
    return {
      discoveries: this.discoveries.length,
      notes: this.notes.length
    };
  },

  getLibrarianResponse(context) {
    if (context === 'secret-room') {
      return 'The library remembers those who uncover its hidden corners.';
    }

    if (context === 'rare-book') {
      return 'Some books wait decades for the right reader.';
    }

    return 'Every shelf has a story waiting to be discovered.';
  }
};
