// Paste the site-specific script URL from Plausible's Site Installation screen.
// An empty URL keeps all third-party analytics disabled until the owner opts in.
const PLAUSIBLE_SCRIPT_URL = '';

(() => {
  const enabled = /^https:\/\/plausible\.io\/js\/pa-[A-Za-z0-9_-]+\.js$/.test(PLAUSIBLE_SCRIPT_URL)
    && location.hostname === 'libraryafterdark.space';
  if (!enabled) {
    window.libraryAnalytics = { track() {} };
    return;
  }
  const script = document.createElement('script');
  script.async = true;
  script.src = PLAUSIBLE_SCRIPT_URL;
  script.onload = () => { ready = true; };
  script.onerror = () => { ready = false; };
  let ready = false;
  window.libraryAnalytics = {
    track(name, props) {
      if (!ready || typeof window.plausible !== 'function') return;
      // Only fixed event names and finite, non-personal room labels are accepted.
      const allowed = ['Library Entered', 'Room Explored', 'Book Picked Up', 'Book Opened',
        'Reading Started', 'Book Returned', 'Secret Discovered', 'Librarian Talked To',
        'Cat Petted', 'Rabbit Door Entered', 'Engaged 5 Minutes', 'Engaged 10 Minutes'];
      if (!allowed.includes(name)) return;
      if (name === 'Room Explored' && typeof props?.room === 'string'
        && /^[a-z-]{1,32}$/.test(props.room)) window.plausible(name, { props: { room: props.room } });
      else if (name !== 'Room Explored') window.plausible(name);
    }
  };
  document.head.appendChild(script);
})();
