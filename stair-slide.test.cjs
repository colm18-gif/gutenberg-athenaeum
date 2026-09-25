const test=require('node:test');
const assert=require('node:assert');
const fs=require('node:fs');
const stair=fs.readFileSync(__dirname+'/high-staircase.js','utf8');
const game=fs.readFileSync(__dirname+'/game.js','utf8');

test('the slide chute runs just inside the stair without touching its inner rail',()=>{
  const outerRadius=12,innerRadius=4.35,CHUTE_IN=1.62,CHUTE_HALF=.52,brassLip=.045;
  assert.match(stair,/CHUTE_IN=1\.62,CHUTE_HALF=\.52/);
  // The stair's inner posts stand .94 in from the tread centre line; the chute's outer lip must clear them.
  const clearance=(CHUTE_IN-CHUTE_HALF-brassLip)-.94-.07;
  assert(clearance>0,'chute lip overlaps the stair posts');
  // At the top the inner lip must stay clear of the rocket's fins (1.35 from its centre, 1.16 from the hall centre).
  assert(innerRadius-CHUTE_IN-CHUTE_HALF>1.35-1.16+.5);
  // The stairwell opening is wide enough for the chute beside the stair.
  assert.match(stair,/WELL_IN=2\.35/);
  assert(2.35>CHUTE_IN+CHUTE_HALF+brassLip);
});

test('the slide starts at a brass arch on the landing and ends through a hatch in the western wing',()=>{
  assert.match(stair,/type:'stair-slide'/);
  assert.match(stair,/action:'SLIDE DOWN'/);
  assert.match(stair,/if\(type==='stair-slide'\)\{beginSlide\(\);return true\}/);
  assert.match(stair,/slide\.phase==='settle'/);
  assert.match(stair,/slide\.phase==='chute'/);
  assert.match(stair,/slide\.phase==='tunnel'/);
  assert.match(stair,/slide\.phase==='hatch'/);
  assert.match(stair,/entranceX-2\.3/);
});

test('while sliding the chute moves the rider, notices stay quiet and nothing else can move them',()=>{
  assert.match(stair,/function floorAt\(x,z\)\{if\(slide\)return player\.pos\.y;/);
  assert.match(stair,/if\(slide\)return Math\.abs\(x-player\.pos\.x\)<1e-6&&Math\.abs\(z-player\.pos\.z\)<1e-6/);
  assert.match(stair,/noticeAllowed:\(\)=>\(!rocketTrip&&!slide\)\|\|speaking/);
  assert.match(stair,/if\(slide\)updateSlide\(/);
  assert.match(stair,/get sliding\(\)\{return !!slide\}/);
  // The walkway at the foot of the shaft does not pass through the chute or its tunnel.
  assert.match(stair,/if\(inChuteFootprint\(x,z\)\)return false/);
});

test('reduced motion skips the ride, the chute has its own wind sound, and resets end a ride',()=>{
  assert.match(stair,/if\(isReducedMotion\(\)\)\{moveTo\(entranceX-2\.3/);
  assert.match(game,/function slideWhoosh\(level=0\)/);
  assert.match(game,/slideSound:level=>slideWhoosh\(level\)/);
  assert.match(stair,/function reset\(\)\{if\(slide\)\{slide=null;slideSound\?\.\(0\)/);
});

test('the high staircase no longer counts as a visit to the roof garden',()=>{
  assert.match(game,/player\.pos\.y>9\.5&&player\.pos\.z>37&&player\.pos\.x<150/);
});
