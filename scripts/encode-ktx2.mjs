// Builds GPU-compressed (.ktx2, Basis ETC1S) copies of the library's photographic textures.
// The originals stay in place as fallbacks: glTF files list the .ktx2 through
// KHR_texture_basisu (optional), and game.js only asks for .ktx2 when the device supports it.
//
//   npm i --no-save ktx2-encoder sharp && node scripts/encode-ktx2.mjs
//
// Re-running is safe: existing .ktx2 files newer than their source are kept.
import { encodeToKTX2 } from 'ktx2-encoder';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const ktx2Path=file=>file.replace(/\.(jpe?g|png)$/i,'.ktx2');

// kind: 'color' (sRGB), 'normal' or 'data' (linear: roughness, occlusion, metalness).
async function encode(file,kind,{flipY=false}={}){
  const out=ktx2Path(file);
  if(fs.existsSync(out)&&fs.statSync(out).mtimeMs>=fs.statSync(file).mtimeMs)return out;
  const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const pixels=new Uint8Array(data);
  const options={isUASTC:false,generateMipmap:true,isYFlip:flipY,compressionLevel:2,
    qualityLevel:kind==='normal'?200:kind==='color'?170:140,
    isPerceptual:kind==='color',isSetKTX2SRGBTransferFunc:kind==='color',isNormalMap:kind==='normal',
    imageDecoder:async()=>({data:pixels,width:info.width,height:info.height})};
  const bytes=await encodeToKTX2(pixels,options);
  fs.writeFileSync(out,bytes);
  console.log(`${path.relative(root,file)}  ${(fs.statSync(file).size/1024|0)}KB -> ${(bytes.length/1024|0)}KB`);
  return out;
}

// Tiling materials applied through THREE.TextureLoader (flipY=true), so bake the same flip in.
for(const set of ['smoked_walnut_veneer','leather_red_02']){
  const dir=path.join(root,'assets/polyhaven/materials',set);
  await encode(path.join(dir,'diffuse.jpg'),'color',{flipY:true});
  await encode(path.join(dir,'normal.jpg'),'normal',{flipY:true});
  await encode(path.join(dir,'roughness.jpg'),'data',{flipY:true});
}

// glTF models: add a KHR_texture_basisu source beside every image, keeping the original as fallback.
function gltfFiles(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const full=path.join(dir,entry.name);return entry.isDirectory()?gltfFiles(full):entry.name.endsWith('.gltf')?[full]:[]})}
for(const file of [...gltfFiles(path.join(root,'assets/polyhaven/models')),...gltfFiles(path.join(root,'assets/models'))]){
  const gltf=JSON.parse(fs.readFileSync(file,'utf8')),dir=path.dirname(file);
  if(!gltf.images?.length||!gltf.textures?.length)continue;
  const kinds=new Map(),mark=(info,kind)=>{if(info&&info.index!==undefined){const source=gltf.textures[info.index].source;if(!kinds.has(source)||kind==='color')kinds.set(source,kind)}};
  for(const material of gltf.materials||[]){
    mark(material.pbrMetallicRoughness?.baseColorTexture,'color');mark(material.emissiveTexture,'color');
    mark(material.normalTexture,'normal');mark(material.occlusionTexture,'data');mark(material.pbrMetallicRoughness?.metallicRoughnessTexture,'data');
    for(const extension of Object.values(material.extensions||{}))for(const [key,value] of Object.entries(extension))if(value&&typeof value==='object'&&value.index!==undefined)mark(value,/color|sheen(?!Roughness)|specularColor/i.test(key)?'color':'data');
  }
  const ktxIndex=new Map();
  for(const [index,image] of gltf.images.entries()){
    if(!image.uri||/\.ktx2$/i.test(image.uri)||!/\.(jpe?g|png)$/i.test(image.uri))continue;
    const kind=kinds.get(index)||'data',encoded=await encode(path.join(dir,decodeURIComponent(image.uri)),kind),uri=path.relative(dir,encoded).split(path.sep).map(encodeURIComponent).join('/');
    let existing=gltf.images.findIndex(entry=>entry.uri===uri);
    if(existing<0){existing=gltf.images.length;gltf.images.push({uri,mimeType:'image/ktx2',name:(image.name||path.basename(uri))+'_ktx2'})}
    ktxIndex.set(index,existing);
  }
  for(const texture of gltf.textures)if(ktxIndex.has(texture.source))texture.extensions={...(texture.extensions||{}),KHR_texture_basisu:{source:ktxIndex.get(texture.source)}};
  gltf.extensionsUsed=[...new Set([...(gltf.extensionsUsed||[]),'KHR_texture_basisu'])];
  fs.writeFileSync(file,JSON.stringify(gltf,null,file.includes('polyhaven')?2:undefined)+(file.includes('polyhaven')?'\n':''));
}
