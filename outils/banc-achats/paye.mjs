/* LE BANC DE LA PORTE D'ACHAT (2026-11-07, achats App Store) — shopPaye branchée sur window.ccAchat (le pont StoreKit de l'app), la synchro du démarrage,
   RESTAURER et les prix d'Apple. Le jeu web n'a pas de ccAchat : le banc en colle un FAUX après le chargement (réglable : prochaine réponse de payer,
   liste des achats possédés, prix rendus) et vérifie les cas (1) à (8) de la tâche 3, plus l'écoute onRecu, RESTAURER et le prix des peintures.
   Servir le jeu : cd "VERSION PRINCIPALE" && python3 -m http.server 8931 --bind 127.0.0.1   puis   node outils/banc-achats/paye.mjs   env : PORT (défaut 8931)
   Sortie : « OK paye » (code 0) ou la liste des échecs (code 1). */
import { lance, prepare, charge, passeSplash, sleep } from '../banc-caisses/cdp.mjs';

const PORT = process.env.PORT || 8931;
const echecs = [];
const verifie = (ok, msg) => { if (!ok) echecs.push(msg); };
const c = await lance({ port: 9501 });
try {
  await prepare(c);
  await charge(c, `http://127.0.0.1:${PORT}/index.html?colonne=0&carte=nuages&meteo=midi`, { attente: 120000 });
  await passeSplash(c); await sleep(2500);

  /* le faux pont : payer rend la réponse réglée (ok / annule / attente / indisponible / echec / pend = jamais, tant qu'on ne la libère pas) */
  await c.ev(`(function(){
    var F=window.__fa={rep:'ok',appels:[],poss:[],possRejette:false,rest:[],restRejette:false,prix:{},cb:null,libere:null};
    window.__faux=function(){window.ccAchat={pret:true,
      produits:function(ids){F.idsDemandes=ids.slice();return Promise.resolve(F.prix);},
      payer:function(id){F.appels.push(id);
        if(F.rep==='pend')return new Promise(function(ok){F.libere=function(){ok('ok');};});
        if(F.rep==='ok')return Promise.resolve('ok');
        var e=new Error(F.rep);e.code=F.rep;return Promise.reject(e);},
      possedes:function(){return F.possRejette?Promise.reject('brut'):Promise.resolve(F.poss.slice());},
      restaurer:function(){return F.restRejette?Promise.reject({x:1}):Promise.resolve(F.rest.slice());},
      onRecu:function(cb){F.cb=cb;}};};
    return 1;})()`);

  const P = await c.ev(`window.dbgProduits()`);
  const caisses = P.filter(p => p.type === 'car'), peints = P.filter(p => p.type === 'peinture');
  const c54 = caisses.find(p => p.cle === 54);
  const autre = caisses.find(p => p.cle !== 54 && p.cle !== 10), autre2 = caisses.find(p => p.cle !== 54 && p.cle !== 10 && p.cle !== autre.cle);
  verifie(!!c54 && !!autre && !!autre2 && peints.length >= 3, 'catalogue : caisse 54 / autres / 3 peintures introuvables');
  const [p0, p1, p2] = peints;
  const ev = (s) => c.ev(`(async function(){${s}})()`);
  const etat = () => c.ev(`window.dbgAchats.etat()`);

  /* (6) SANS ccAchat : le comportement web — storekit, aucune erreur, les prix de repli */
  const sans = await ev(`var r='rien';try{await window.dbgAchats.paye(54);r='tenue';}catch(e){r=e.message;}
    var q='?';try{await window.dbgAchats.paye(999);}catch(e){q=e.message;}
    return {r:r,q:q,sync:await window.dbgAchats.sync(),prix:window.dbgAchats.prixTxt(54,'1,61 €'),prixPeint:window.dbgAchats.prixTxt('${p0.cle}','2 €')};`);
  verifie(sans.r === 'storekit', `(6) sans ccAchat shopPaye(54) devrait rejeter storekit : ${sans.r}`);
  verifie(sans.sync === 0, `(6) sans ccAchat achatsSync devrait rendre 0 : ${sans.sync}`);
  verifie(sans.prix === '1,61 €', `(6) sans ccAchat prixTxt devrait garder l'euro du jeu : ${sans.prix}`);
  verifie(sans.prixPeint === '2 €', `(6) sans ccAchat prixTxt peinture : ${sans.prixPeint}`);

  /* le faux pont posé : la suite */
  await ev(`window.__faux();`);

  /* (8) les prix d'Apple : avant la réponse le repli, après la réponse le prix localisé, dans shopPop comme dans prixTxt */
  const eur54 = c54.eur, apple54 = eur54 === '1,59 €' ? '1,49 €' : '1,59 €', applePe = '2,49 €';
  await ev(`window.__fa.prix={'${c54.id}':{prix:'${apple54}',devise:'EUR'},'${p0.id}':{prix:'${applePe}',devise:'EUR'}};`);
  const avant = await ev(`return {t:window.dbgAchats.prixTxt(54,'${eur54}'),tp:window.dbgAchats.prixTxt('${p0.cle}','${p0.eur}')};`);
  verifie(avant.t === eur54, `(8) avant la réponse d'Apple le repli attendu (${eur54}) : ${avant.t}`);
  const n = await ev(`return await window.dbgAchats.prix();`);
  const ids = await ev(`return window.__fa.idsDemandes;`);
  verifie(Array.isArray(ids) && ids.length === P.length && ids.includes(c54.id) && ids.includes(p0.id), `(8) ccAchat.produits devrait être appelé avec tous les ids : ${ids && ids.length}/${P.length}`);
  verifie(n === 2, `(8) achatsPrix devrait rendre 2 prix mémorisés : ${n}`);
  const apres = await ev(`var s=document.createElement('div');s.setAttribute('data-car','54');document.body.appendChild(s);window.dbgAchats.pop(s);
    var pe=document.querySelector('#shPop .spPrix em');
    return {t:window.dbgAchats.prixTxt(54,'${eur54}'),tp:window.dbgAchats.prixTxt('${p0.cle}','${p0.eur}'),pop:pe?pe.textContent:null,autre:window.dbgAchats.prixTxt(${autre.cle},'${autre.eur}')};`);
  verifie(apres.t === apple54, `(8) prixTxt(54) devrait rendre le prix d'Apple ${apple54} : ${apres.t}`);
  verifie(apres.tp === applePe, `(8) prixTxt(peinture) devrait rendre ${applePe} : ${apres.tp}`);
  verifie(apres.pop === apple54, `(8) le prix de shopPop devrait être ${apple54} : ${apres.pop}`);
  verifie(apres.autre === autre.eur || apres.autre === (autre.eur || '').replace(',', '.'), `(8) un produit sans prix d'Apple garde le repli : ${apres.autre}`);

  /* (2) annule et attente : RIEN n'est donné, le bouton reste utilisable (2e tentative) — la fenêtre de la caisse 54 est ouverte, mais on teste sur une autre :
     on la ferme et on ouvre celle de `autre` */
  await ev(`document.querySelector('#shPop [data-sp="non"]').click();`); await sleep(900);
  const avantEtat = await etat();
  await ev(`var s=document.createElement('div');s.setAttribute('data-car','${autre.cle}');document.body.appendChild(s);window.dbgAchats.pop(s);window.__fa.rep='annule';
    document.querySelector('#shPop [data-sp="oui"]').click();`); await sleep(500);
  let e2 = await etat();
  verifie(JSON.stringify(e2.owned) === JSON.stringify(avantEtat.owned), `(2) annule : SAVE.d.owned a changé ${JSON.stringify(avantEtat.owned)} -> ${JSON.stringify(e2.owned)}`);
  verifie(!e2.owned.includes(autre.cle), '(2) annule : la caisse a été donnée');
  const off1 = await ev(`var b=document.querySelector('#shPop [data-sp="oui"]');return {off:b.classList.contains('off'),refus:document.getElementById('shPop').classList.contains('refus'),attend:document.getElementById('shPop').classList.contains('attend')};`);
  verifie(!off1.off && !off1.refus && !off1.attend, `(2) annule : le bouton devrait être rendu sans message (off=${off1.off} refus=${off1.refus} attend=${off1.attend})`);
  await ev(`window.__fa.rep='attente';document.querySelector('#shPop [data-sp="oui"]').click();`); await sleep(500);
  e2 = await etat();
  const toastAtt = await ev(`return document.getElementById('toast').textContent;`);
  verifie(!e2.owned.includes(autre.cle), '(2) attente : la caisse a été donnée');
  verifie(/ATTENTE/i.test(toastAtt), `(2) attente : le toast « EN ATTENTE D'ACCORD » attendu : ${toastAtt}`);
  const app2 = await ev(`return window.__fa.appels.slice();`);
  verifie(app2.length === 2 && app2.every(x => x === autre.id), `(2) deux tentatives attendues vers ${autre.id} : ${JSON.stringify(app2)}`);
  const off2 = await ev(`return document.querySelector('#shPop [data-sp="oui"]').classList.contains('off');`);
  verifie(!off2, '(2) attente : le bouton devrait rester utilisable');

  /* (1) ok : la caisse est à toi (carOwned, owned, sauvegarde) ET la fête joue (achat vivant) — c'est aussi le témoin du (3) */
  await ev(`window.__fa.rep='ok';document.getElementById('feteCaisse')&&document.getElementById('feteCaisse').remove();document.querySelector('#shPop [data-sp="oui"]').click();`); await sleep(900);
  e2 = await etat();
  verifie(e2.owned.includes(autre.cle), `(1) ok : ${autre.cle} devrait être à toi : ${JSON.stringify(e2.owned)}`);
  verifie(e2.save && e2.save.owned && e2.save.owned.includes(autre.cle), `(1) ok : la sauvegarde (localStorage) devrait contenir ${autre.cle}`);
  const fete1 = await ev(`return !!document.getElementById('feteCaisse');`);
  verifie(fete1, '(1) ok : une caisse payée en vrai devrait avoir sa fête (témoin du cas 3)');
  const etatPeint = await etat();

  /* (7) double shopPaye simultané : UN seul appel à payer */
  await ev(`window.__fa.appels=[];window.__fa.rep='pend';`);
  const dbl = await ev(`var p1=window.dbgAchats.paye(54),r2='tenue';var p2=window.dbgAchats.paye(54).then(function(){return 'tenue';},function(e){return e.message;});
    r2=await p2;var n1=window.__fa.appels.length;window.__fa.libere();var r1=await p1.then(function(){return 'tenue';},function(e){return e.message;});
    window.__fa.rep='ok';await window.dbgAchats.paye(54);return {n1:n1,r1:r1,r2:r2,n:window.__fa.appels.length};`);
  verifie(dbl.n1 === 1 && dbl.r1 === 'tenue' && dbl.r2 !== 'tenue', `(7) double paye : un seul appel et le 2e refusé : ${JSON.stringify(dbl)}`);
  verifie(dbl.n === 2, `(7) après la 1re, un nouveau paye est possible : ${JSON.stringify(dbl)}`);

  /* (3) achatsSync deux fois avec les mêmes achats : 1er = 2 (une caisse déjà à toi ne compte pas), 2e = 0, rien n'est équipé, pas de fête */
  await ev(`document.getElementById('feteCaisse')&&document.getElementById('feteCaisse').remove();window.__fa.poss=['${autre.id}','${autre2.id}','${p0.id}'];`);
  const eqAvant = (await etat()).eq.peinture;
  const s1 = await ev(`return await window.dbgAchats.sync();`);
  const fete3 = await ev(`return !!document.getElementById('feteCaisse');`);
  const e3 = await etat();
  const s2 = await ev(`return await window.dbgAchats.sync();`);
  const e3b = await etat();
  verifie(s1 === 2, `(3) 1er sync : 2 nouveaux attendus (la caisse payée plus haut n'en est pas un) : ${s1}`);
  verifie(e3.owned.includes(autre2.cle) && e3.own.includes('peinture:' + p0.id.split('.').pop()), `(3) la caisse et la peinture devraient être à toi : ${JSON.stringify(e3.own)}`);
  verifie(s2 === 0, `(3) 2e sync devrait rendre 0 : ${s2}`);
  verifie(e3.eq.peinture === eqAvant && e3b.eq.peinture === eqAvant, `(3) SAVE.d.shop.eq.peinture a changé : ${eqAvant} -> ${e3.eq.peinture}`);
  verifie(!fete3, '(3) achatsSync a lancé feteCaisse (il doit être calme)');

  /* (4) possedes qui rejette (erreur brute) : 0 sans exception ; restaurer pareil */
  const r4 = await ev(`window.__fa.possRejette=true;window.__fa.restRejette=true;var out={};
    try{out.s=await window.dbgAchats.sync();}catch(e){out.exc=e&&e.message;}
    try{out.r=await window.dbgAchats.restaure();}catch(e){out.excR=e&&e.message;}
    window.__fa.possRejette=false;window.__fa.restRejette=false;return out;`);
  verifie(r4.s === 0 && !r4.exc, `(4) possedes qui rejette : 0 sans exception : ${JSON.stringify(r4)}`);
  verifie(r4.r === 0 && !r4.excR, `(4) restaurer qui rejette : 0 sans exception : ${JSON.stringify(r4)}`);
  const toast4 = await ev(`return document.getElementById('toast').textContent;`);
  verifie(!/ERREUR|ECHEC|ÉCHEC|INDISPONIBLE/i.test(toast4) || /AUCUN/i.test(toast4), `(4) pas de toast d'erreur après un échec de restaurer : ${toast4}`);

  /* (5) objet déjà à toi : habPaye rend false et payer n'est pas appelé */
  const r5 = await ev(`window.__fa.appels=[];var a=window.dbgAchats.habPaye('${p0.id.split('.').pop()}');return {a:a,n:window.__fa.appels.length};`);
  verifie(r5.a === false && r5.n === 0, `(5) peinture déjà à toi : habPaye false et aucun appel à payer : ${JSON.stringify(r5)}`);
  /* une peinture pas encore à toi + annule : payer appelé avec le bon id, rien donné, aucun message d'indisponibilité */
  const r5b = await ev(`window.__fa.appels=[];window.__fa.rep='annule';var a=window.dbgAchats.habPaye('${p1.id.split('.').pop()}');await new Promise(function(r){setTimeout(r,300);});
    var e=window.dbgAchats.etat();return {a:a,appels:window.__fa.appels.slice(),a2:e.own.indexOf('peinture:${p1.id.split('.').pop()}')>=0,toast:document.getElementById('toast').textContent};`);
  verifie(r5b.a === true && r5b.appels.length === 1 && r5b.appels[0] === p1.id && !r5b.a2, `(5b) peinture non possédée + annule : ${JSON.stringify(r5b)}`);
  verifie(!/INDISPONIBLE/i.test(r5b.toast), `(5b) annuler ne doit pas dire INDISPONIBLE : ${r5b.toast}`);

  /* onRecu : le démarrage branche l'écoute ; un achat reçu hors payer() est donné AVEC la fête, deux fois = une seule */
  await ev(`window.dbgAchats.demarre();`); await sleep(300);
  const cb = await ev(`return typeof window.__fa.cb;`);
  verifie(cb === 'function', '(onRecu) le démarrage devrait brancher ccAchat.onRecu');
  if (cb === 'function') {
    const r6 = await ev(`document.getElementById('feteCaisse')&&document.getElementById('feteCaisse').remove();
      window.__fa.cb('${p2.id}');var o1=window.dbgAchats.etat().own.indexOf('peinture:${p2.id.split('.').pop()}')>=0;var eqUne=window.dbgAchats.etat().eq.peinture;
      window.__fa.cb('${p2.id}');window.__fa.cb('cashcar.inconnu');return {o1:o1,eq:window.dbgAchats.etat().eq.peinture,eqUne:eqUne,id:'${p2.id.split('.').pop()}'};`);
    verifie(r6.o1, '(onRecu) la peinture reçue devrait être à toi');
    verifie(r6.eq === r6.eqUne, '(onRecu) un 2e achatRecu du même produit ne doit rien changer');
    const dbl2 = await ev(`return {a:window.dbgAchats.recoit('${p2.id}',true),b:window.dbgAchats.recoit('cashcar.inconnu',true),c:window.dbgAchats.recoit(5,true)};`);
    verifie(dbl2.a === false && dbl2.b === false && dbl2.c === false, `(recoit) idempotent / inconnu : ${JSON.stringify(dbl2)}`);
  }

  /* RESTAURER : « N ACHAT(S) RESTAURÉ(S) » quand il y a du neuf, sinon AUCUN ; sans ccAchat l'ancien toast */
  const rest = await ev(`var t=function(){return document.getElementById('toast').textContent;};
    var cherche=window.dbgProduits().filter(function(p){return p.type==='peinture';});
    var neuf=cherche.filter(function(p){return window.dbgAchats.etat().own.indexOf('peinture:'+p.id.split('.').pop())<0;}).slice(0,2);
    window.__fa.rest=neuf.map(function(p){return p.id;});
    var n=await window.dbgAchats.restaure();var t1=t();
    var n0=await window.dbgAchats.restaure();var t0=t();
    delete window.ccAchat;var ns=await window.dbgAchats.restaure();var ts=t();
    return {nb:neuf.length,n:n,t1:t1,n0:n0,t0:t0,ns:ns,ts:ts};`);
  verifie(rest.nb === 2 && rest.n === 2 && /2/.test(rest.t1) && /RESTAUR/i.test(rest.t1), `RESTAURER : 2 achats neufs : ${JSON.stringify(rest)}`);
  verifie(rest.n0 === 0 && /AUCUN/i.test(rest.t0), `RESTAURER : rien de neuf : ${JSON.stringify(rest)}`);
  verifie(rest.ns === 0 && /AUCUN/i.test(rest.ts), `RESTAURER sans ccAchat : l'ancien toast : ${JSON.stringify(rest)}`);

  if (c.erreurs.length) { verifie(false, 'ERREURS PAGE ' + JSON.stringify(c.erreurs.slice(0, 5))); }
} catch (e) { echecs.push('exception : ' + e.message); }
finally { await c.fin(); }
if (echecs.length) { console.log('ECHEC paye'); for (const e of echecs) console.log(' - ' + e); process.exit(1); }
console.log('OK paye');
