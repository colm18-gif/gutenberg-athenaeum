const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const game = fs.readFileSync(path.join(__dirname, 'game.js'), 'utf8');

for (const phrase of ['← LOOK AGAIN', 'WANDER ON →', 'NAMES IN THE DUST',
  'THE LONGER SILENCE', 'WHAT WAS KEPT', 'WHERE THE LIGHT HESITATES',
  'THE UNFINISHED QUESTION', 'PAST THE LAST WINDOW', 'AFTER THE CONVERSATION',
  'A ROOM FOR DOUBT', 'WHERE WORDS TAKE ROOT', 'WHAT LIES BENEATH']) {
  assert.ok(game.includes(phrase), `Missing sign: ${phrase}`);
}
for (const oldSign of ["c.fillText(x<0?'MYSTERIES ←':'→ JOURNEYS'",
  "sign:['THE GOTHIC PARLOUR'", "sign:['THE CHART ROOM'",
  "memorySign(returning,'THE ROOM OF RETURNING NAMES'"]) {
  assert.ok(!game.includes(oldSign), `Old sign remains: ${oldSign}`);
}
assert.ok(game.includes('Historically challenged, censored, or prosecuted'),
  'Restricted Catalogue context must remain');
assert.ok(game.includes("key:'gothic'"), 'Room keys must remain unchanged');
console.log('Signage text checks passed');
