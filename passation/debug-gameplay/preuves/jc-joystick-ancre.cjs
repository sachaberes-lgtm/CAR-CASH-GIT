/* audit-jour-c (JC-01, JC-03, JC-04, JC-07, JC-08) : rejoue LE VRAI code du joystick NITRO — de `const gliDn=function` jusqu'au volant, écouteurs compris —
   extrait de code/moteur/mobile-tactile.js (APRÈS, la copie de travail) et du même fichier au commit f8f44140 (AVANT, la fusion de main v1427), avec une horloge
   simulée et de faux éléments tactiles. figGDir vient de code/gameplay/figures-physique.js.
   node passation/debug-gameplay/preuves/jc-joystick-ancre.cjs */
const fs=require('fs'),path=require('path'),cp=require('child_process');
const RAC=path.join(__dirname,'../../..');
const apres=fs.readFileSync(path.join(RAC,'code/moteur/mobile-tactile.js'),'utf8');
const avant=cp.execSync('git show f8f44140:code/moteur/mobile-tactile.js',{cwd:RAC,encoding:'utf8',maxBuffer:64<<20});
const fseuil=fs.readFileSync(path.join(RAC,'code/gameplay/figures-physique.js'),'utf8').match(/function figGDir\(dx,dy\)\{[^\n]*?\}/)[0];
function extrait(src){const a=src.indexOf('const gliDn=function'),b=src.indexOf('// ---- LE VOLANT ANALOGIQUE');if(a<0||b<a)throw new Error('morceau introuvable');return src.slice(a,b);}

function monte(src){
  const S={T:0,tirs:[],vib:0,claques:0,el:{},win:{}};
  const G={performance:{now:()=>S.T},GLI:{seuil:38,req:null,reqT:0,id:null,x0:0,y0:0,tq:0},FJOY:{on:true,arme:true,dir:null,vib:0,lent:700,repos:400},
    VEQ:{dDn:0,dReq:false,dReqT:0},FX2:{redP:0},etat:{started:true,gameOver:false,paused:false,introD:false,mode:'fall',tuto:false,tutoFig:false}};
  const fakeEl=function(nom){const L={};return S.el[nom]={addEventListener:function(t,f){(L[t]=L[t]||[]).push(f);},L:L};};
  const $t=function(i){return S.el[i]||fakeEl(i);};
  const addEventListener=function(t,f){(S.win[t]=S.win[t]||[]).push(f);};
  const hap=function(){S.vib++;};
  const figJoyVoit=function(d,dx,dy,cl){if(cl)S.claques++;};
  const corps='const {GLI,FJOY,VEQ,FX2,performance}=G;'+
    'let started,gameOver,paused,introD,mode;const TUTO={on:false};function tutoFigOuverte(){return G.etat.tutoFig;}'+
    'function sync(){started=G.etat.started;gameOver=G.etat.gameOver;paused=G.etat.paused;introD=G.etat.introD;mode=G.etat.mode;TUTO.on=G.etat.tuto;}'+
    fseuil+';'+
    /* chaque écouteur relit l'état du jeu avant de tourner */
    extrait(src).replace(/gliMv=function\(id,x,y\)\{/,'gliMv=function(id,x,y){sync();')+
    ';return {gliDn,gliMv,gliUp,gliCoupe,sync};';
  const J=new Function('G','$t','addEventListener','hap','figJoyVoit',corps)(G,$t,addEventListener,hap,figJoyVoit);
  /* les requêtes de la boucle : GLI.req lu comme boucle-1.js (garde 250 ms) — figGJoue simulé : il ne joue qu'en vol ou au sol, course en marche */
  S.boucle=function(){J.sync();if(G.GLI.req){const d=G.GLI.req;G.GLI.req=null;if(S.T-G.GLI.reqT<250)S.tirs.push(d+'@'+S.T);}};
  S.G=G;S.J=J;return S;}

/* un toucher : on lui donne l'élément (tNitro par défaut) et la liste des doigts encore posés (touches) */
function ev(S,type,id,x,y,poses,el){const t={identifier:id,clientX:x,clientY:y};const e={changedTouches:[t],touches:(poses||[]).map(function(p){return {identifier:p};})};
  for(const f of (S.el[el||'tNitro'].L[type]||[]))f(e);S.boucle();}
function joue(src,pas,prep){const S=monte(src);if(prep)prep(S);
  for(const p of pas){S.T=p[0];const k=p[1];
    if(k==='dn')ev(S,'touchstart',p[4]||1,p[2],p[3],p[5]||[p[4]||1],p[6]);
    else if(k==='mv')ev(S,'touchmove',p[4]||1,p[2],p[3],p[5]||[p[4]||1],p[6]);
    else if(k==='up')ev(S,'touchend',p[2]||1,0,0,p[3]||[],p[4]);
    else if(k==='rot'){for(const f of (S.win.orientationchange||[]))f({});S.boucle();}
    else if(k==='fn')p[2](S);}
  return S;}
function cas(nom,pas,prep,voulu){
  const a=joue(avant,pas,prep),b=joue(apres,pas,prep);
  const f=function(S){return (S.tirs.length?S.tirs.join(', '):'aucune')+' · vib '+S.vib+' · claques '+S.claques;};
  const ok=voulu?voulu(b):'';
  console.log('\n'+nom+'\n   AVANT : '+f(a)+'\n   APRÈS : '+f(b)+(voulu?(ok===true?'   → OK':'   → KO '+ok):''));
  if(voulu&&ok!==true)process.exitCode=1;}
const pousseHaut=function(t0,x,y,id){const L=[];for(let k=1;k<=6;k++)L.push([t0+k*16,'mv',x,y-k*8,id||1]);return L;}; /* 48 px vers le haut en 96 ms */

/* ---- le geste normal : doit rester EXACTEMENT comme avant ---- */
cas('témoin : poser, pousser en haut, revenir tout de suite, lâcher',
  [[0,'dn',300,700]].concat(pousseHaut(0,300,700),[[200,'mv',300,690],[215,'mv',300,698],[400,'up']]),null,S=>S.tirs.join()==='u@80'&&S.vib===1||'attendu u@80, 1 vibration');
cas('témoin : poser, pousser, revenir, repousser (empilement)',
  [[0,'dn',300,700]].concat(pousseHaut(0,300,700),[[200,'mv',300,698]],pousseHaut(300,300,698),[[500,'up']]),null,S=>S.tirs.join(', ')==='u@80, u@380'||'attendu deux tirs');
cas('témoin : tenir NITRO sans pousser (le pouce roule lentement de 30 px en 2 s)',
  (function(){const L=[[0,'dn',300,700]];for(let t=100;t<=2000;t+=100)L.push([t,'mv',300+t*.015,700]);L.push([2100,'up']);return L;})(),null,S=>!S.tirs.length&&S.vib===0||'rien ne doit partir');
cas('témoin : pouce posé, immobile 600 ms, puis poussée franche à gauche',
  [[0,'dn',300,700],[20,'mv',302,700],[640,'mv',290,700],[656,'mv',275,700],[672,'mv',258,700],[800,'up']],null,S=>S.tirs.join()==='l@672'||'attendu l@672');

/* ---- JC-01 ---- */
const p1=[[0,'dn',300,700]].concat(pousseHaut(0,300,700));for(let t=200;t<=1000;t+=100)p1.push([t,'mv',300+(t/100%2),652]);
for(let k=1;k<=10;k++)p1.push([1000+k*15,'mv',300,652+k*4.8]);p1.push([1300,'up']);
cas('JC-01 haut tenu 1 s (tremblement) puis retour au centre',p1,null,S=>S.tirs.join()==='u@80'||'une seule figure attendue');
const p2=[[0,'dn',300,700]].concat(pousseHaut(0,300,700));for(let k=1;k<=10;k++)p2.push([600+k*15,'mv',300,652+k*4.8]);p2.push([900,'up']);
cas('JC-01 haut, immobile 500 ms, puis retour au centre',p2,null,S=>S.tirs.join()==='u@80'||'une seule figure attendue');

/* ---- JC-03 : le téléphone tourne, pouce posé (le même point physique change de coordonnées) ---- */
cas('JC-03 pouce posé immobile, le téléphone tourne, le pouce bouge d\'1 px',[[0,'dn',330,760],[500,'rot'],[900,'mv',770,330],[920,'mv',771,330],[1000,'up']],null,S=>!S.tirs.length||'rien ne doit partir');
cas('JC-03 …puis une vraie poussée vers le haut après la rotation',[[0,'dn',330,760],[500,'rot'],[900,'mv',770,330]].concat(pousseHaut(1000,770,330),[[1200,'up']]),null,S=>S.tirs.join()==='u@1080'||'attendu u@1080');

/* ---- JC-04 : tap bref puis poussée (le 2e appui est un double-tap : veqDoigt a posé VEQ.dReq juste avant, dans le même événement) ---- */
const dbl=function(S){S.G.VEQ.dReq=true;S.G.VEQ.dReqT=S.T;};
cas('JC-04 2e appui = double-tap, la même touche pousse en haut',
  [[0,'dn',300,700],[90,'up'],[200,'fn',dbl],[200,'dn',300,700]].concat(pousseHaut(200,300,700),[[500,'up']]),null,S=>!S.tirs.length&&S.vib===0||'la poussée née du double-tap ne doit pas tirer');
cas('JC-04 …la même touche revient au centre puis repousse : celle-là tire',
  [[200,'fn',dbl],[200,'dn',300,700]].concat(pousseHaut(200,300,700),[[400,'mv',300,698]],pousseHaut(500,300,698),[[700,'up']]),null,S=>S.tirs.join()==='u@580'||'attendu u@580');

/* ---- JC-07 : deux doigts sur NITRO ---- */
cas('JC-07 pouce posé, un 2e doigt touche la zone puis se lève, le pouce pousse',
  [[0,'dn',300,700,1,[1]],[100,'dn',200,720,2,[1,2],'tNitroZone'],[200,'up',2,[1],'tNitroZone']].concat(pousseHaut(300,300,700),[[500,'up',1]]),null,S=>S.tirs.join()==='u@380'||'le pouce doit garder le joystick');
cas('JC-07 identifiant mort (pas de touchend, iOS) : un nouveau doigt reprend le joystick',
  [[0,'dn',300,700,1,[1]],[100,'dn',300,700,5,[5]]].concat(pousseHaut(200,300,700,5),[[400,'up',5]]),null,S=>S.tirs.join()==='u@280'||'le nouveau doigt doit prendre la main');

/* ---- JC-08 : la poussée refusée ne vibre ni ne claque ---- */
cas('JC-08 auto-école hors étape FIGURE : poussée',[[0,'dn',300,700]].concat(pousseHaut(0,300,700),[[300,'up']]),S=>{S.G.etat.tuto=true;S.G.etat.mode='drive';},S=>S.vib===0&&S.claques===0&&!S.tirs.length||'ni vibration ni claquement');
cas('JC-08 chute de mort (mode boom) : poussée',[[0,'dn',300,700]].concat(pousseHaut(0,300,700),[[300,'up']]),S=>{S.G.etat.mode='boom';},S=>S.vib===0&&S.claques===0||'ni vibration ni claquement');
cas('JC-08 témoin : auto-école À l\'étape FIGURE, en vol : la poussée part',[[0,'dn',300,700]].concat(pousseHaut(0,300,700),[[300,'up']]),S=>{S.G.etat.tuto=true;S.G.etat.tutoFig=true;},S=>S.tirs.join()==='u@80'&&S.vib===1||'attendu u@80');
