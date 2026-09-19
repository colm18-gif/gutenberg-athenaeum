/* Library After Dark: shared lifecycle manager for independently loadable world zones. */
(()=>{
'use strict';
const STATES=Object.freeze({UNLOADED:'unloaded',PRELOADING:'preloading',ACTIVE:'active',DORMANT:'dormant'});
class ZoneManager{
constructor({warmLimit=2}={}){this.zones=new Map();this.warmLimit=warmLimit;this.clock=0}
register(config){if(!config?.id)throw new Error('ZoneManager.register requires an id');if(this.zones.has(config.id))throw new Error('Zone already registered: '+config.id);const z={...config,state:STATES.UNLOADED,built:false,lastUsed:0,preloadPromise:null};this.zones.set(config.id,z);return z}
get(id){return this.zones.get(id)}
async preload(id){const z=this.get(id);if(!z)throw new Error('Unknown zone: '+id);if(z.state!==STATES.UNLOADED)return z.preloadPromise||z;z.state=STATES.PRELOADING;z.preloadPromise=Promise.resolve(z.preload?.()).then(()=>z).catch(e=>{z.state=STATES.UNLOADED;z.preloadPromise=null;throw e});return z.preloadPromise}
async activate(id){const z=this.get(id);if(!z)throw new Error('Unknown zone: '+id);if(z.state===STATES.UNLOADED)await this.preload(id);else if(z.preloadPromise)await z.preloadPromise;if(!z.built){await z.build?.();z.built=true}await z.activate?.();z.state=STATES.ACTIVE;z.lastUsed=++this.clock;for(const other of this.zones.values())if(other!==z&&other.state===STATES.ACTIVE){await other.deactivate?.();other.state=STATES.DORMANT;other.lastUsed=++this.clock}await this.trimWarmCache();return z}
async sleep(id){const z=this.get(id);if(!z||z.state!==STATES.ACTIVE)return;await z.deactivate?.();z.state=STATES.DORMANT;z.lastUsed=++this.clock}
async dispose(id){const z=this.get(id);if(!z||z.state===STATES.UNLOADED)return;if(z.state===STATES.ACTIVE)await z.deactivate?.();await z.dispose?.();z.state=STATES.UNLOADED;z.built=false;z.preloadPromise=null}
async trimWarmCache(){const warm=[...this.zones.values()].filter(z=>z.state===STATES.DORMANT).sort((a,b)=>b.lastUsed-a.lastUsed);for(const z of warm.slice(this.warmLimit))await this.dispose(z.id)}
update(dt,context){for(const z of this.zones.values())if(z.state===STATES.ACTIVE)z.update?.(dt,context)}
snapshot(){return [...this.zones.values()].map(({id,state,built,lastUsed})=>({id,state,built,lastUsed}))}
}
window.ATHENAEUM_ZONE_STATES=STATES;window.AthenaeumZoneManager=ZoneManager;
})();