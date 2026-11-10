/* MODÈLE DE REVENU PAR PARTIE (2026-11-10, Sacha : « que tout soit équilibré avec les prix de la boutique, qu'on puisse gagner LÉONIE »)
   node outils/banc-pieces/revenu.cjs [pieces-fil.js] [gain]
   ⚠ UN MODÈLE, PAS UNE PARTIE JOUÉE (le Mac était saturé : un banc navigateur aurait menti). Il prend de VRAI : les paliers moteur (ENGINE_TIERS.coins/push),
   DENOMS, la valeur d'une pièce (denom × 2,2 × récolte × flow : ramassage.js), la densité RÉELLE du générateur (filPlan chargé tel quel) au rang de zone et
   au moteur du moment, les prix de la boutique (CAR_UNLOCK). Il suppose, écrits en dur ci-dessous : la vitesse (≈ 70 m/s × poussée), la longueur d'une zone
   (9 000 m), et quatre PROFILS de joueur (durée de vie, part des pièces prises, récolte × flow moyens). Le portail (denom × 120) est ajouté.
   Sert à COMPARER deux réglages (avant/après), pas à prédire un chiffre au dollar près. */
const fs=require('fs'),path=require('path');
const R=p=>fs.readFileSync(path.join(__dirname,'../..',p),'utf8');
const f=process.argv[2]||path.join(__dirname,'../../code/gameplay/pieces-fil.js');
const {filPlan}=new Function(fs.readFileSync(f,'utf8')+'\n;return {filPlan};')();
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
const TX=R('code/gameplay/pickups-fruits.js');
const TIERS=[...TX.matchAll(/^\s*\{n:'[^\n]*?coins:(\d+),\s*push:([\d.]+)/gm)].map(m=>({c:+m[1],push:+m[2]}));
const DENOMS=[3,3,3,4,4,4,4,5,5,5,5,10,14,18,26,30,40,45,57,63,69,76,84,92,101,112,123,135,149,164];
const GAIN=+process.argv[3]||+(/gain:([\d.]+)/.exec(R('code/economie/eco-vague3.js'))[1]);
/* densité réelle (pièces/km) selon (rich, STR) — mise en cache, 12 graines */
const cache={};
function dens(rich,STR){const k=rich.toFixed(1)+'/'+STR.toFixed(1);if(cache[k])return cache[k];let n=0;const L=9000,N=12;
  for(let g=1;g<=N;g++)n+=filPlan(mulberry32(g*131+5),{L:L,HALF:26.2,STR:STR,rich:rich,fruits:true,bloque:()=>false,s0:200}).length;
  return cache[k]=n/N/L*1000;}
const engLate=t=>1+Math.min(.5,Math.max(0,t-8)*.035);
const PROFILS=[
  {nom:'débutant',T:70,prise:.40,mf:1.3,ecod:1.5},
  {nom:'moyen',T:140,prise:.55,mf:2.3},
  {nom:'bon',T:300,prise:.75,mf:4.0},
  {nom:'très bon',T:600,prise:.90,mf:5.5}];
function partie(P,gain){let t=0,x=0,coins=0,tier=0,money=0,zone=0,fr=0;const dt=1;
  while(t<P.T){const T=TIERS[Math.min(tier,TIERS.length-1)],STR=Math.max(1,Math.min(2.1,Math.sqrt(T.push*engLate(tier)))),rich=Math.max(.88,Math.min(3.4,.88+zone*.52));
    const v=70*T.push,d=dens(rich,STR);
    const nb=d/1000*v*dt*P.prise;coins+=nb;
    money+=nb*DENOMS[Math.min(tier,DENOMS.length-1)]*gain*2.2*P.mf*(P.ecod||1);
    while(tier+1<TIERS.length&&coins>=TIERS[tier+1].c)tier++;
    x+=v*dt;t+=dt;if(x>=9000*(zone+1)){zone++;money+=DENOMS[Math.min(tier,29)]*gain*120*Math.min(P.mf,2.5)*(P.ecod||1);}}
  return {coins:Math.round(coins),tier:tier+1,money:Math.round(money),zones:zone};}
const BUT=[['1re peinture',2000],['figure 25 k',25000],['commune 40 k',40000],['rare 250 k',250000],['épique 550 k',550000],['rare 1,2 M',1200000],['épique 2,4 M',2400000],['LÉONIE 4 M',4000000],['épique 8 M',8000000],['LOUP 50 M',50000000]];
const fmt=n=>n>=1e6?(n/1e6).toFixed(1)+' M':n>=1e3?Math.round(n/1e3)+' k':String(n);
console.log(`gain=${GAIN} — ${path.basename(f)}`);
const res=PROFILS.map(P=>({P,r:partie(P,GAIN)}));
for(const {P,r} of res)console.log(`${P.nom.padEnd(9)} ${String(P.T).padStart(3)} s · ${String(r.coins).padStart(5)} pièces · palier ${String(r.tier).padStart(2)} · ${String(r.zones)} portails · ${fmt(r.money).padStart(7)} $/partie`);
console.log('\nparties pour acheter (revenu seul, sans primes de contrats) :');
console.log('but'.padEnd(16)+res.map(x=>x.P.nom.padStart(10)).join(''));
for(const [n,p] of BUT)console.log(n.padEnd(16)+res.map(x=>{const k=Math.ceil(p/x.r.money);return String(k>9999?'>9999':k).padStart(10);}).join(''));
