const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, 'analytics.js'), 'utf8');

function run(url, hostname, preloaded = true) {
  const appended = [], events = [];
  const context = {
    location: { hostname },
    window: preloaded ? { plausible: (...args) => events.push(args) } : {},
    document: { createElement: () => ({}), head: { appendChild: el => appended.push(el) } }
  };
  vm.runInNewContext(source.replace(/const PLAUSIBLE_SCRIPT_URL = '[^']*';/, `const PLAUSIBLE_SCRIPT_URL = '${url}';`), context);
  return { context, appended, events };
}

for (const host of ['localhost', 'libraryafterdark.space']) {
  const disabled = run('', host);
  disabled.context.window.libraryAnalytics.track('Library Entered');
  assert.equal(disabled.appended.length, 0);
  assert.equal(disabled.events.length, 0);
}
const preview = run('https://plausible.io/js/pa-TEST123.js', 'localhost');
assert.equal(preview.appended.length, 0);
const active = run('https://plausible.io/js/pa-TEST123.js', 'libraryafterdark.space');
assert.equal(active.appended.length, 1);
assert.equal(typeof active.context.window.plausible.init, 'function');
active.context.window.libraryAnalytics.track('Library Entered'); // Queued even before script load.
assert.equal(active.events.length, 1);
active.context.window.libraryAnalytics.track('Library Entered');
active.context.window.libraryAnalytics.track('Room Explored', { room: 'main-library' });
active.context.window.libraryAnalytics.track('Room Explored', { room: 'invented-room' });
active.context.window.libraryAnalytics.track('Room Explored', { room: 'visitor@example.com' });
active.context.window.libraryAnalytics.track('Unapproved Event');
assert.equal(active.events.length, 3);
assert.equal(active.events[0][0], 'Library Entered');
assert.equal(active.events[2][1].props.room, 'main-library');
active.context.window.libraryAnalytics.track('Support Box Opened');
active.context.window.libraryAnalytics.track('Stripe Support Opened');
assert.equal(active.events.length, 5);
assert.equal(active.events[3][0], 'Support Box Opened');
assert.equal(active.events[4][0], 'Stripe Support Opened');
const queued = run('https://plausible.io/js/pa-TEST123.js', 'libraryafterdark.space', false);
queued.context.window.libraryAnalytics.track('Library Entered');
assert.equal(queued.context.window.plausible.q.length, 1);
assert.equal(queued.context.window.plausible.q[0][0], 'Library Entered');
// Later rooms are registered by the library; which book was opened is sent as its Gutenberg number.
const later = run('https://plausible.io/js/pa-TEST123.js', 'libraryafterdark.space');
const t = later.context.window.libraryAnalytics;
t.track('Room Explored', { room: 'crusoe-island' });
assert.equal(later.events.length, 0);
t.allowRooms(['crusoe-island', 'Not A Room', 'x@y.z']);
t.track('Room Explored', { room: 'crusoe-island' });
t.track('Room Explored', { room: 'x@y.z' });
assert.equal(later.events.length, 1);
t.track('Book Opened', { book: 345 });
assert.equal(later.events[1][0], 'Book Opened');
assert.equal(later.events[1][1].props.book, '345');
t.track('Book Opened', { book: 'someone@example.com' });
assert.equal(later.events[2].length, 1, 'an unexpected value is dropped, the event itself is kept');
t.track('Journey Taken', { journey: 'crusoe-island' });
t.track('Secret Found', { secret: 'Visitor Name' });
t.track('Quote Shared', { how: 'share', note: 'free text' });
assert.equal(later.events[3][1].props.journey, 'crusoe-island');
assert.equal(later.events[4].length, 1);
assert.equal(JSON.stringify(later.events[5][1].props), '{"how":"share"}');
const disabledLater = run('', 'libraryafterdark.space');
disabledLater.context.window.libraryAnalytics.allowRooms(['x']);
console.log('Analytics guard and event tests passed');
