/* preuve : LES PHOTOS DE LA BOUTIQUE NE GROSSISSENT PLUS SANS FIN EN MÉMOIRE (relecture du 24/10, B1 — code/interface/photos-films.js).
   MESURÉ au banc (iPhone émulé, 24/10) : caisses 42 + achats 9 + figures 16 + ailes 15 parcourues = 83 adresses blob:, 13,1 Mo de PNG
   gardés, 0 libérée ; chaque autre caisse équipée ajoute ses 15 ailes et ses 16 films (clés `a:…:<caisse>`, `fa:…:<caisse>`) : +6,6 Mo,
   sans limite (WKWebView tue l'appli au-delà de son plafond). 1) chaque photo rangée depuis un `toBlob` doit passer par la mémoire bornée ;
   2) on rejoue une session (le VRAI photoGarde extrait d'index.html) : 10 caisses équipées l'une après l'autre, rayons parcourus. */
const fs=require('fs'),vm=require('vm');
const src=fs.readFileSync(process.argv[2]||__dirname+'/../../VERSION PRINCIPALE/index.html','utf8');
const ranges=(src.match(/PHOTO\.cache\[ck\]=u;phdbEcrit\(ck,b,sig9\);[^}]*\}/g)||[]);
const bornees=ranges.filter(s=>/photoGarde\(ck,u,b\.size\)/.test(s)).length;
console.log('photos rangées depuis un toBlob (caisse/aile, film de figure) : '+ranges.length+' endroit(s), dont '+bornees+' passant par la mémoire bornée');
let ok=ranges.length===2&&bornees===2;
const a=src.indexOf('const PHOTO_MEM='),b=src.indexOf('window.dbgPhotoMem=',a);
if(a<0||b<0){console.log('mémoire bornée absente : aucune adresse blob: n\'est jamais libérée (13 Mo + 6,6 Mo par caisse équipée, sans fin)');console.log('PREUVE KO');process.exit(1);}
let affichees=new Set(),revoquees=new Set(),n=0;
const ctx={PHOTO:{cache:{}},FILM:{l:[]},URL:{revokeObjectURL:u=>{revoquees.add(u);}},
  document:{querySelectorAll:()=>[...affichees].map(u=>({getAttribute:()=>u}))},String,Map,Set};
vm.runInNewContext(src.slice(a,b)+';this.photoGarde=photoGarde;this.M=PHOTO_MEM;',ctx);
const range=(k,ko)=>{const u='blob:x/'+(++n);ctx.PHOTO.cache[k]=u;ctx.photoGarde(k,u,ko*1024);return u;};
let pic=0,afficheeRevoquee=0,derniereRevoquee=0;
for(let i=0;i<51;i++){const u=range(i,147);affichees.add(u);} /* la grille des caisses, à l'écran */
for(let car=0;car<10;car++){affichees=new Set();
  for(let j=0;j<15;j++)range('a:aile'+j+':'+car,97);
  for(let j=0;j<16;j++){const u=range('fa:fig'+j+':cote:'+car,262);affichees.add(u);if(revoquees.has(u))derniereRevoquee++;} /* le rayon FIGURES, à l'écran */
  for(const u of affichees)if(revoquees.has(u))afficheeRevoquee++;
  pic=Math.max(pic,ctx.M.oct/1048576);}
const vivantes=Object.values(ctx.PHOTO.cache).filter(u=>!revoquees.has(u)).length,orph=Object.values(ctx.PHOTO.cache).filter(u=>revoquees.has(u)).length;
console.log('10 caisses équipées, rayons parcourus : '+n+' photos prises · '+revoquees.size+' libérées · gardées '+(ctx.M.oct/1048576).toFixed(1)+' Mo (pic '+pic.toFixed(1)+' Mo, plafond '+(ctx.M.max/1048576)+' Mo ; sans borne : '+((51*147+10*(15*97+16*262))/1024).toFixed(1)+' Mo)');
console.log('photos affichées libérées : '+afficheeRevoquee+' · adresses libérées restées dans PHOTO.cache : '+orph+' · photos en cache vivantes : '+vivantes);
ok=ok&&pic<=ctx.M.max/1048576+.3&&afficheeRevoquee===0&&orph===0&&revoquees.size>0;
/* une session ordinaire (une caisse, tout parcouru : 13 Mo) ne libère rien */
revoquees=new Set();n=0;affichees=new Set();
{const c2={PHOTO:{cache:{}},FILM:{l:[]},URL:{revokeObjectURL:u=>{revoquees.add(u);}},document:ctx.document,String,Map,Set};vm.runInNewContext(src.slice(a,b)+';this.photoGarde=photoGarde;this.M=PHOTO_MEM;',c2);ctx.photoGarde=c2.photoGarde;ctx.M=c2.M;ctx.PHOTO=c2.PHOTO;}
for(let i=0;i<51;i++)range(i,147);for(let j=0;j<15;j++)range('a:'+j+':0',97);for(let j=0;j<16;j++)range('fa:'+j+':0',262);
console.log('session ordinaire (une caisse, tous les rayons) : '+(ctx.M.oct/1048576).toFixed(1)+' Mo, '+revoquees.size+' libérée');
ok=ok&&revoquees.size===0;
console.log(ok?'PREUVE OK':'PREUVE KO');process.exit(ok?0:1);
