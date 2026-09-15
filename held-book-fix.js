(()=>{
  'use strict';
  if(!window.THREE)return;

  // The library's held-book animation is intentionally detected by the
  // distinctive local-space pose and 1.35 scale used by updateSelected().
  // Keeping the adjustment here makes the change small and reversible.
  const originalApplyMatrix4=THREE.Vector3.prototype.applyMatrix4;
  THREE.Vector3.prototype.applyMatrix4=function(matrix){
    if(Math.abs(this.z+1.35)<1e-7&&this.y>-0.07&&this.y<0.01&&Math.abs(this.x)<0.04){
      this.z=-1.95;
      this.y-=0.035;
    }
    return originalApplyMatrix4.call(this,matrix);
  };

  const originalLerp=THREE.Vector3.prototype.lerp;
  THREE.Vector3.prototype.lerp=function(target,alpha){
    if(target&&Math.abs(target.x-1.35)<1e-7&&Math.abs(target.y-1.35)<1e-7&&Math.abs(target.z-1.35)<1e-7){
      const heldScale=0.98;
      return originalLerp.call(this,new THREE.Vector3(heldScale,heldScale,heldScale),alpha);
    }
    return originalLerp.call(this,target,alpha);
  };
})();
