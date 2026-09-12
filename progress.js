/* One small, defensive interface for browser-persisted library memory. */
window.AthenaeumProgress={
  get(key,fallback=null){try{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw)}catch(error){return fallback}},
  set(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(error){}},
  getNumber(key,fallback=0){const value=Number(localStorage.getItem(key));return Number.isFinite(value)?value:fallback},
  setNumber(key,value){try{localStorage.setItem(key,String(value))}catch(error){}}
};
