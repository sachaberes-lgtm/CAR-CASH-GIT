#!/usr/bin/env node
/* ===== LE CHAMPION SUR DES COURSES COMPLETES (2026-10-20, Sacha : « verifie que les simulations ne sont pas hallucinees ») =====
   Le trou du harnais : tous les chiffres d'un run (record, arrivees, taux d'atterrissage) sont des totaux de POPULATION sur tout
   l'entrainement, mutants du debut compris. Aucun ne disait ce que fait LE CHAMPION sur une course entiere. Resultat le 20/10 : un
   « record 11746, 1256 arrivees » dont le champion ne finissait AUCUNE course, et un « 23 bots sur 24 font des figures » mesure jusqu'a
   la mort du dernier bot (75 s sur 150) avec des figures payees au crash.
   Ici : le cerveau du champion dans les 24 voitures (chacune part a sa place), UNE manche entiere par graine, jusqu'au temps limite.
   On n'appelle jamais endGen : ni selection, ni mutation, ni sauvegarde (AUTOSAVE coupe en plus, par securite).
   usage : node check-course.js [results/champion.json] [graines, ex. 11,22,33] */
const fs=require('fs'),path=require('path');
const {loadGame}=require('./sim-env');
const champFile=process.argv[2]||path.join(__dirname,'results','champion.json');
const graines=(process.argv[3]||'11,22,33').split(',').map(Number);
const champ=JSON.parse(fs.readFileSync(champFile,'utf8'));
const g=loadGame('?train=1&sim=1');
g.get(`globalThis.__W=${JSON.stringify(champ.w)};globalThis.__SEEDS=${JSON.stringify(graines)};`);
g.get(`(function(){
  const T=__TRAIN, DT=1/60, RH=T.ROAD_HALF, res=[];
  T.AUTOSAVE=0; T.saveChampion=function(){};
  for(const seed of __SEEDS){
    T.reseed(seed); T.GEN=0; T.evalIdx=0; T.newGen(true);
    for(const b of T.bots) b.brain.w.set(__W);
    const st=T.bots.map(b=>({s0:b.s,why:"temps",t:0,vS:0,sc:0,nOn:0,nE:0,k:0,air:0,gr:0,edge:0,pS:b.in.steer,pN:!!b.in.nitro}));
    const k0=T.kill; T.kill=function(b,why){const i=T.bots.indexOf(b); if(i>=0&&st[i].why==='temps'){st[i].why=why;st[i].t=b.aliveT;} return k0.apply(T,arguments);};
    while(T.bots.some(b=>b.alive) && T.genTime+DT<T.matchDuration){
      T.tick(DT);
      for(let i=0;i<T.bots.length;i++){const b=T.bots[i],s=st[i]; if(!b.alive)continue; s.k++;
        if(b.in.steer!==s.pS){s.sc++;s.pS=b.in.steer;}
        if(b.in.nitro){s.nOn++; if(!s.pN)s.nE++;} s.pN=!!b.in.nitro;
        if(b.mode==="fall")s.air++; else {s.gr++; s.vS+=b.v; if(Math.abs(b.lat)>RH-3)s.edge++;}}
    }
    T.kill=k0;
    for(let i=0;i<T.bots.length;i++){const b=T.bots[i],s=st[i]; if(s.why==='temps')s.t=b.aliveT; const sec=Math.max(1e-9,s.k*DT);
      res.push({why:s.why,t:s.t,dur:T.matchDuration,prog:(b.s-s.s0)/(T.matchDuration*T.V_REF),aura:b.figBody.aura,
        figA:b.figBody.nBank|0, figR:(b.figRoute&&b.figRoute.nBank)|0, chutes:b.figBody.chutes|0, landings:b.landings,
        steerHz:s.sc/sec, nitroDuty:s.nOn/Math.max(1,s.k), tapHz:s.nE/sec, kmh:3.6*s.vS/Math.max(1,s.gr), airFrac:s.air/Math.max(1,s.k), edgeFrac:s.edge/Math.max(1,s.gr)});}
  }
  globalThis.__RES=res;
})()`);
const r=JSON.parse(g.get('JSON.stringify(__RES)'));
const n=r.length, moy=f=>r.reduce((a,x)=>a+f(x),0)/n, pct=c=>Math.round(100*r.filter(c).length/n)+' %';
const causes={}; for(const x of r) causes[x.why]=(causes[x.why]||0)+1;
const fin=r.filter(x=>x.why==='arrivee');
console.log('CHAMPION : '+path.relative(process.cwd(),champFile)+' — '+n+' courses ('+graines.length+' pistes x 24 voitures)');
console.log(JSON.stringify({
  finissent:pct(x=>x.why==='arrivee'), fins:causes,
  vie_moyenne_s:+moy(x=>x.t).toFixed(1), duree_course_s:+moy(x=>x.dur).toFixed(1), piste_parcourue:+moy(x=>x.prog).toFixed(2),
  temps_arrivee_s:fin.length?+(fin.reduce((a,x)=>a+x.t,0)/fin.length).toFixed(1):null,
  avec_figure:pct(x=>x.figA+x.figR>0), figures_air:+moy(x=>x.figA).toFixed(2), figures_route:+moy(x=>x.figR).toFixed(2),
  chutes:+moy(x=>x.chutes).toFixed(2), aura:+moy(x=>x.aura).toFixed(0), atterrissages:+moy(x=>x.landings).toFixed(1),
  volant_changements_s:+moy(x=>x.steerHz).toFixed(2), nitro_tenue:+moy(x=>x.nitroDuty).toFixed(2), nitro_appuis_s:+moy(x=>x.tapHz).toFixed(2),
  vitesse_sol_kmh:+moy(x=>x.kmh).toFixed(0), en_l_air:+moy(x=>x.airFrac).toFixed(2), au_ras_du_bord:+moy(x=>x.edgeFrac).toFixed(2),
  destins_distincts:new Set(r.map(x=>x.why+'@'+x.t.toFixed(2))).size+'/'+n
}));
process.exit(0);   /* le jeu laisse des minuteries ouvertes : sans exit, le processus ne rend jamais la main */
