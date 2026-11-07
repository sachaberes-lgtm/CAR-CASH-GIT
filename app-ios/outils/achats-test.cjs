/* Test du pont window.ccAchat (app-ios/natif/achats.js) — sans navigateur : Node `vm` et un faux window.
   Lancer : node app-ios/outils/achats-test.cjs   → « OK achats » ou exit 1 avec le cas fautif. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const FIC=path.join(__dirname,'..','natif','achats.js');
const rate=m=>{console.error('✗ achats-test : '+m);process.exit(1);};
if(!fs.existsSync(FIC))rate('natif/achats.js est absent');
const code=fs.readFileSync(FIC,'utf8');

/* Charge achats.js dans un contexte neuf. `cap` = l'objet Capacitor simulé (ou undefined). */
function charge(cap){
  const window={};if(cap)window.Capacitor=cap;
  const ctx=vm.createContext({window,console,Promise,Error,setTimeout});
  vm.runInContext(code,ctx,{filename:'achats.js'});
  return window;
}
/* Un plugin simulé : `appels` compte les appels, `ecouteurs` garde les addListener. */
function plugin(opts){
  opts=opts||{};
  const p={appels:{produits:0,acheter:0,possedes:0,restaurer:0},ecouteurs:{},dernier:null,liberer:null};
  p.produits=async a=>{p.appels.produits++;p.dernier=a;return {produits:[{id:'a',prix:'0,99 €',devise:'EUR'},{id:'b',prix:'1,99 €',devise:'EUR'}]};};
  p.acheter=a=>{p.appels.acheter++;p.dernier=a;
    if(opts.leve)return Promise.reject(new Error('boum'));
    if(opts.bloque)return new Promise(r=>{p.liberer=()=>r({etat:'ok'});});
    return Promise.resolve({etat:opts.etat||'ok'});};
  p.possedes=async()=>{p.appels.possedes++;return {ids:['a','b']};};
  p.restaurer=async()=>{p.appels.restaurer++;return {ids:['a']};};
  p.addListener=(nom,cb)=>{(p.ecouteurs[nom]=p.ecouteurs[nom]||[]).push(cb);return Promise.resolve({remove(){}});};
  return p;
}
const natif=pl=>({isNativePlatform:()=>true,Plugins:pl?{Achats:pl}:{}});
const egal=(a,b,m)=>{if(a!==b)rate(m+' : attendu '+JSON.stringify(b)+', obtenu '+JSON.stringify(a));};
const rejette=async(pr,code,m)=>{let e=null;try{await pr;}catch(x){e=x;}
  if(!e)rate(m+' : aurait dû rejeter');if(!(e instanceof Error)&&!(e&&e.message!==undefined))rate(m+' : pas une Error');egal(e.code,code,m+' (.code)');};

let fini=false; // une promesse restée pendante ne doit pas finir en silence (exit 0 sans « OK »)
process.on('exit',c=>{if(!fini&&c===0){console.error('✗ achats-test : le test s\'est arrêté avant la fin (promesse jamais résolue ?)');process.exitCode=1;}});
(async()=>{
  // (a) pas de Capacitor
  egal(typeof charge(undefined).ccAchat,'undefined','(a) hors app');
  // (b) Capacitor non natif
  egal(typeof charge({isNativePlatform:()=>false,Plugins:{Achats:plugin()}}).ccAchat,'undefined','(b) non natif');
  // (c) plugin absent
  egal(typeof charge(natif(null)).ccAchat,'undefined','(c) plugin absent');

  // (d) ok
  let p=plugin({etat:'ok'}),w=charge(natif(p));
  egal(typeof w.ccAchat,'object','(d) défini');egal(w.ccAchat.pret,true,'(d) pret');
  egal(await w.ccAchat.payer('x'),'ok','(d) payer résout ok');
  egal(p.appels.acheter,1,'(d) un appel');egal(p.dernier.id,'x','(d) id transmis');
  egal(await w.ccAchat.payer('y'),'ok','(d) le verrou se relâche après un achat');
  // (e) annulé
  w=charge(natif(plugin({etat:'annule'})));await rejette(w.ccAchat.payer('x'),'annule','(e)');
  // (f) en attente
  w=charge(natif(plugin({etat:'attente'})));await rejette(w.ccAchat.payer('x'),'attente','(f)');
  // (g) le plugin lève
  p=plugin({leve:true});w=charge(natif(p));await rejette(w.ccAchat.payer('x'),'echec','(g)');
  // le verrou se relâche aussi après un échec / un état inconnu
  p.acheter=()=>Promise.resolve({etat:'ok'});egal(await w.ccAchat.payer('x'),'ok','(g) verrou relâché après échec');
  // état inconnu = échec
  p=plugin();p.acheter=()=>Promise.resolve({etat:'zzz'});w=charge(natif(p));await rejette(w.ccAchat.payer('x'),'echec','(g) état inconnu');

  // (h) deux payer simultanés
  p=plugin({bloque:true});w=charge(natif(p));
  const un=w.ccAchat.payer('x');
  await rejette(w.ccAchat.payer('y'),'indisponible','(h) 2e payer');
  egal(p.appels.acheter,1,'(h) pas de second appel au plugin');
  p.liberer();egal(await un,'ok','(h) le 1er aboutit');
  p.acheter=()=>Promise.resolve({etat:'ok'}); // le plugin ne bloque plus
  egal(await w.ccAchat.payer('z'),'ok','(h) après libération');

  // produits : tableau du plugin -> table par id
  p=plugin();w=charge(natif(p));
  const t=await w.ccAchat.produits(['a','b']);
  egal(t.a.prix,'0,99 €','produits a.prix');egal(t.b.devise,'EUR','produits b.devise');
  egal(JSON.stringify(p.dernier.ids),JSON.stringify(['a','b']),'produits : ids transmis');

  // (i) possedes / restaurer
  const l=await w.ccAchat.possedes();
  egal(Array.isArray(l),true,'(i) tableau');egal(l.join(','),'a,b','(i) ids');
  egal((await w.ccAchat.restaurer()).join(','),'a','restaurer');

  // (j) achatRecu -> onRecu
  const recus=[];w.ccAchat.onRecu(id=>recus.push(id));
  egal((p.ecouteurs.achatRecu||[]).length>=1,true,'(j) écouteur achatRecu posé');
  p.ecouteurs.achatRecu.forEach(cb=>cb({id:'q'}));
  egal(recus.join(','),'q','(j) onRecu appelé avec l\'id');

  fini=true;console.log('OK achats');
})().catch(e=>rate('exception inattendue : '+(e&&e.stack||e)));
