/* ===== LA PLANCHE DES PHOTOS DE JADE (2026-11-14) : des photos d'un dossier montées en UNE image (une page HTML photographiée par Chrome headless, aucune dépendance) =====
   node outils/banc-jade/planche-photos.cjs --dossier=<d> --out=planche.png [--motif=libre] [--noms=noms.txt] [--cols=6] [--larg=2400] [--de=0] [--n=12] [--contre=<d2>]
   --motif : ne garde que les fichiers dont le nom contient ce texte, rangés par le nombre qui le suit ; --noms : une légende par ligne (« libre3 = … »), sinon le nom du fichier ;
   --de / --n : une tranche de la liste (les planches restent lisibles : 12 portraits par planche) ; --contre : le même fichier d'un second dossier à droite de chacun (avant | après). */
const {spawnSync}=require('child_process'),fs=require('fs'),path=require('path'),os=require('os');
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const opt={};for(const a of process.argv.slice(2)){const m=/^--([a-zA-Z]+)=(.*)$/.exec(a);if(m)opt[m[1]]=m[2];}
const DOS=path.resolve(opt.dossier),CONTRE=opt.contre?path.resolve(opt.contre):null,MOTIF=opt.motif||'',COLS=+(opt.cols||(CONTRE?2:6)),LARG=+(opt.larg||2400);
const num=f=>{const m=new RegExp((MOTIF||'')+'(\\d+)').exec(f);return m?+m[1]:1e9;};
let F=fs.readdirSync(DOS).filter(f=>/\.png$/i.test(f)&&(!MOTIF||f.indexOf(MOTIF)>=0)).sort((a,b)=>num(a)-num(b)||(a<b?-1:1));
const noms={};if(opt.noms)for(const l of fs.readFileSync(opt.noms,'utf8').split(/\r?\n/)){const m=/^(\S+) = (.*)$/.exec(l);if(m)noms[m[1]]=m[2];}
F=F.slice(+(opt.de||0),+(opt.de||0)+(+(opt.n||F.length)));
const url=f=>'file:///'+f.replace(/\\/g,'/').replace(/ /g,'%20');
const leg=f=>{const m=/(libre\d+)/.exec(f);return (m&&noms[m[1]])||f.replace(/\.png$/,'');};
const cases=[];for(const f of F){if(CONTRE){cases.push('<figure><img src="'+url(path.join(CONTRE,f))+'"><figcaption>AVANT · '+leg(f)+'</figcaption></figure>');cases.push('<figure><img src="'+url(path.join(DOS,f))+'"><figcaption>APRÈS · '+leg(f)+'</figcaption></figure>');}
  else cases.push('<figure><img src="'+url(path.join(DOS,f))+'"><figcaption>'+leg(f)+'</figcaption></figure>');}
const cw=Math.floor(LARG/COLS),ch=Math.round(cw*800/1280)+26,H=Math.ceil(cases.length/COLS)*ch+8;
const html='<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#111;font:13px sans-serif;color:#eee}div{display:grid;grid-template-columns:repeat('+COLS+','+cw+'px)}figure{margin:0;height:'+ch+'px;overflow:hidden}img{width:'+cw+'px;display:block}figcaption{height:24px;line-height:24px;padding-left:6px;white-space:nowrap;overflow:hidden}</style><div>'+cases.join('')+'</div>';
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'cc-planche-jade-')),page=path.join(tmp,'p.html');fs.writeFileSync(page,html);
const out=path.resolve(opt.out||'planche.png');
const r=spawnSync(CHROME,['--headless=new','--mute-audio','--user-data-dir='+path.join(tmp,'profil'),'--no-first-run','--hide-scrollbars','--allow-file-access-from-files','--window-size='+LARG+','+H,'--screenshot='+out,url(page)],{stdio:'ignore',timeout:120000});
console.log(fs.existsSync(out)?'planche : '+out+' ('+F.length+' photos, '+LARG+'×'+H+')':'ÉCHEC ('+r.status+')');
try{fs.rmSync(tmp,{recursive:true,force:true});}catch(e){}
