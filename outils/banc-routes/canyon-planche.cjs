/* ===== LA PLANCHE du banc des textures du canyon (2026-11-14) : des PNG quelconques montés en grille (une page HTML photographiée par Chrome headless) =====
   node outils/banc-routes/canyon-planche.cjs --out=planche.png --cols=3 --larg=1800 [--ratio=0.625] [--filtre=texte] <dossier ou fichiers…>
   Les légendes sont les noms de fichier (sans « course-canyon- » ni « .png »). */
const {spawnSync}=require('child_process'),fs=require('fs'),path=require('path'),os=require('os');
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const opt={},F=[];for(const a of process.argv.slice(2)){const m=/^--([a-zA-Z]+)=(.*)$/.exec(a);if(m)opt[m[1]]=m[2];else F.push(a);}
let noms=[];for(const f of F){const p=path.resolve(f);if(fs.statSync(p).isDirectory())for(const n of fs.readdirSync(p).sort())if(n.endsWith('.png'))noms.push(path.join(p,n));else{}else noms.push(p);}
noms=noms.filter(function(n){return /[.]png$/.test(n);});if(opt.filtre)noms=noms.filter(function(n){return path.basename(n).indexOf(opt.filtre)>=0;});
if(opt.max)noms=noms.slice(0,+opt.max);if(!noms.length){console.error('aucune photo');process.exit(1);}
const COLS=+(opt.cols||3),LARG=+(opt.larg||1800),ratio=+(opt.ratio||0.625),cw=Math.floor(LARG/COLS),ch=Math.round(cw*ratio),rangs=Math.ceil(noms.length/COLS);
const url=function(f){return 'file:///'+f.split(path.sep).join('/').split(' ').join('%20');};
let corps='';for(const n of noms)corps+='<div class="c"><img src="'+url(n)+'"><span>'+path.basename(n).replace('course-canyon-','').replace('.png','')+'</span></div>';
const html='<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#111}.g{display:grid;grid-template-columns:repeat('+COLS+','+cw+'px)}.c{position:relative;width:'+cw+'px;height:'+ch+'px;overflow:hidden}'+
  '.c img{width:100%;height:100%;object-fit:cover;display:block}.c span{position:absolute;left:4px;top:3px;font:bold 13px Arial;color:#fff;background:rgba(0,0,0,.62);padding:1px 5px}</style><div class="g">'+corps+'</div>';
const tmp=path.join(os.tmpdir(),'cc-planche-cy-'+process.pid+'.html');fs.writeFileSync(tmp,html);const out=path.resolve(opt.out||'planche.png');
const r=spawnSync(CHROME,['--headless=new','--disable-gpu','--hide-scrollbars','--user-data-dir='+path.join(os.tmpdir(),'cc-banc-pro-canyon-planche'),'--allow-file-access-from-files','--screenshot='+out,'--window-size='+(cw*COLS)+','+(ch*rangs),url(tmp)],{encoding:'utf8',timeout:120000});
try{fs.unlinkSync(tmp);}catch(e){}
console.log(fs.existsSync(out)?'planche : '+out+' ('+noms.length+' photos, '+(cw*COLS)+'×'+(ch*rangs)+')':'ÉCHEC '+(r.stderr||'').slice(0,300));
