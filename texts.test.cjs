const test=require('node:test');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');

test('every bundled text decompresses into a real book (scripts/repair-texts.mjs --check)',()=>{
  const out=execFileSync(process.execPath,['scripts/repair-texts.mjs','--check'],{encoding:'utf8'});
  assert.match(out,/Every bundled text is sound\./);
});
