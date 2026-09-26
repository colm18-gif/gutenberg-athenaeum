// Site-specific URL supplied by the owner from Plausible's installation screen.
const PLAUSIBLE_SCRIPT_URL = 'https://plausible.io/js/pa-nD_g44fQQBbeVFD1ofS4k.js';

(() => {
  const enabled = /^https:\/\/plausible\.io\/js\/pa-[A-Za-z0-9_-]+\.js$/.test(PLAUSIBLE_SCRIPT_URL)
    && location.hostname === 'libraryafterdark.space';
  if (!enabled) {
    window.libraryAnalytics = { track() {}, allowRooms() {} };
    return;
  }
  // Plausible's current snippet initializes its command queue before loading the script.
  window.plausible = window.plausible || function () {
    (window.plausible.q = window.plausible.q || []).push(arguments);
  };
  window.plausible.init = window.plausible.init || function (options) {
    window.plausible.o = options || {};
  };
  window.plausible.init();
  const script = document.createElement('script');
  script.async = true;
  script.src = PLAUSIBLE_SCRIPT_URL;
  // Only fixed event names and finite, non-personal properties are ever sent: room and place names the
  // library itself registers, short fixed labels for journeys and secrets, and Project Gutenberg book numbers.
  const allowed = ['Library Entered', 'Room Explored', 'Book Picked Up', 'Book Opened',
    'Reading Started', 'Book Returned', 'Book Left at Desk', 'Secret Discovered', 'Secret Found',
    'Journey Taken', 'Stair Slide', 'Librarian Talked To', 'Cat Petted', 'Rabbit Door Entered',
    'Quote Opened', 'Quote Shared', 'Audiobook Played', 'Audiobook Link Opened',
    'Engaged 5 Minutes', 'Engaged 10 Minutes', 'Support Box Opened', 'Stripe Support Opened'];
  const rooms = new Set(['main-library', 'upper-floor', 'roof-garden', 'west-wing', 'east-wing',
    'restricted-stacks', 'below-catalogue', 'portrait-room', 'tunnel', 'archive',
    'rabbit-room', 'returning', 'quiet', 'unread', 'repository', 'gothic', 'inquiry',
    'chart', 'drawing', 'study', 'garden', 'contested']);
  const label = value => typeof value === 'string' && /^[a-z][a-z0-9-]{1,39}$/.test(value);
  const clean = {
    room: value => label(value) && rooms.has(value),
    journey: label,
    secret: label,
    how: value => ['copy', 'download', 'share'].includes(value),
    book: value => Number.isInteger(value) && value > 0 && value < 1e6
  };
  window.libraryAnalytics = {
    // The library adds the names of its later rooms (the railway, the staircase, the island...) at startup.
    allowRooms(ids) { for (const id of ids || []) if (label(id)) rooms.add(id); },
    track(name, props) {
      // The site's entry button may be used before the async tracker loads.
      // Plausible's documented command queue preserves that first event.
      if (typeof window.plausible !== 'function') return;
      if (!allowed.includes(name)) return;
      if (name === 'Room Explored' && !clean.room(props?.room)) return;
      const sent = {};
      for (const [key, value] of Object.entries(props || {})) if (clean[key]?.(value)) sent[key] = key === 'book' ? String(value) : value;
      if (Object.keys(sent).length) window.plausible(name, { props: sent });
      else window.plausible(name);
    }
  };
  document.head.appendChild(script);
})();
