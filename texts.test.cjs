const test=require('node:test');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const fs=require('node:fs');

test('every bundled text decompresses into a real book (scripts/repair-texts.mjs --check)',()=>{
  const out=execFileSync(process.execPath,['scripts/repair-texts.mjs','--check'],{encoding:'utf8'});
  assert.match(out,/Every bundled text is sound\./);
});

// Gutenberg's audio books (catalogue type Sound) have no text, so a reader opening one only ever got an offline copy.
// These were in the Doyle, Verne, Wells and Haggard lists, each a recording of a book the library holds as text.
// 36050 is a second, text-less edition of Rodney Stone (the library reads 5148).
const SOUND=[36050,6538,6620,8613,8614,8615,8616,8617,8618,8619,8620,8621,8622,8623,8624,8625,8626,8627,8628,8629,8630,8631,8632,8633,8634,8635,8636,8637,8965,8966,8967,8968,8969,8970,8971,8972,8973,8974,8975,8976,8977,8978,8979,8980,8981,8982,8983,8984,8985,8986,8988,8989,8990,9551,9552,9553,9554,9555,9556,9557,9558,17401,19513,20000,21438,21440,21520,21586,21587,22454,26246,26290,26291,26578,28733,28840,28918,28947,34921,35348];
test('no author catalogue lists one of Gutenberg’s audio books, which have no text to read',()=>{
  for(const name of ['doyle','verne','wells','haggard']){const source=fs.readFileSync(`data/${name}-catalog.js`,'utf8');
    for(const id of SOUND)assert(!new RegExp(`\\[${id},`).test(source),`${name}: ${id} is an audio book`)}
});
