/* ===== LA PLANCHE-CONTACT du banc des graphismes (2026-11-12) =====
   Monte des photos du banc en UNE image (une page HTML photographiée par Chrome headless : aucune dépendance).
   node outils/banc-graphismes/planche.cjs --out=planche.png --dossier=<avant> --vue=jeu [--cartes=nuages,jade] [--cols=3] [--larg=1800] [--tel=1]
       → toutes les photos <dossier>/*-<vue>.png (filtrées par --cartes), légendées, en grille.
   node outils/banc-graphismes/planche.cjs --out=paires.png --dossier=<avant> --contre=<apres> --vue=decorA [--cartes=…]
       → une ligne par couple : AVANT à gauche, APRÈS à droite.
   --recadre=x,y,l,h : ne montre qu'un rectangle de chaque photo (en pixels de la photo), agrandi à la case — pour regarder un détail. */
const {spawnSync}=require('child_process'),fs=require('fs'),path=require('path'),os=require('os');
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const opt={};for(const a of process.argv.slice(2)){const m=/^--([a-zA-Z]+)=(.*)$/.exec(a);if(m)opt[m[1]]=m[2];}
const DOS=path.resolve(opt.dossier),CONTRE=opt.contre?path.resolve(opt.contre):null,VUE=opt.vue||'jeu',LARG=+(opt.larg||1800),TEL=opt.tel==='1';
const filtre=opt.cartes?opt.cartes.split(','):null;
let noms=fs.readdirSync(DOS).filter(f=>f.endsWith('-'+VUE+'.png')&&(TEL?/-tel-/.test(f):!/-tel-/.test(f))).sort();
if(filtre)noms=noms.filter(f=>filtre.some(c=>f.indexOf(c)===0));
if(!noms.length){console.error('aucune photo');process.exit(1);}
const RC=opt.recadre?opt.recadre.split(',').map(Number):null,SRC=TEL?[1170,2532]:[1600,900];
const COLS=CONTRE?2:+(opt.cols||(TEL?6:3)),ratio=RC?RC[3]/RC[2]:TEL?844/390:900/1600,cw=Math.floor(LARG/COLS),ch=Math.round(cw*ratio),rangs=CONTRE?noms.length:Math.ceil(noms.length/COLS);
const url=f=>'file:///'+f.replace(/\\/g,'/').replace(/ /g,'%20');
const cell=(f,l)=>'<div class="c"><img src="'+url(f)+'"'+(RC?' style="width:'+(cw*SRC[0]/RC[2])+'px;height:auto;margin-left:'+(-RC[0]*cw/RC[2])+'px;margin-top:'+(-RC[1]*cw/RC[2])+'px;image-rendering:pixelated"':'')+'><span>'+l+'</span></div>';
let corps='';
if(CONTRE)for(const n of noms){const b=path.join(CONTRE,n);corps+=cell(path.join(DOS,n),'AVANT · '+n.replace('-'+VUE+'.png',''))+(fs.existsSync(b)?cell(b,'APRÈS'):'<div class="c"></div>');}
else for(const n of noms)corps+=cell(path.join(DOS,n),n.replace('-'+VUE+'.png',''));
const html='<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#111}.g{display:grid;grid-template-columns:repeat('+COLS+','+cw+'px)}.c{position:relative;width:'+cw+'px;height:'+ch+'px;overflow:hidden}'+
  '.c img{width:100%;height:100%;object-fit:cover;display:block}.c span{position:absolute;left:4px;top:3px;font:bold 13px Arial;color:#fff;background:rgba(0,0,0,.62);padding:1px 5px}</style><div class="g">'+corps+'</div>';
const tmp=path.join(os.tmpdir(),'cc-planche-'+process.pid+'.html');fs.writeFileSync(tmp,html);
const out=path.resolve(opt.out||'planche.png');
const r=spawnSync(CHROME,['--headless=new','--disable-gpu','--hide-scrollbars','--user-data-dir='+path.join(os.tmpdir(),'cc-planche-profil'),'--allow-file-access-from-files','--screenshot='+out,'--window-size='+(cw*COLS)+','+(ch*rangs),url(tmp)],{encoding:'utf8',timeout:120000});
try{fs.unlinkSync(tmp);}catch(e){}
console.log(fs.existsSync(out)?'planche : '+out+' ('+noms.length+' photos, '+(cw*COLS)+'×'+(ch*rangs)+')':'ÉCHEC '+(r.stderr||'').slice(0,300));
