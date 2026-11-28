/* ===== LA COURBE DE SURVIE PAR PALIER ET LA BANQUE DE COURSES (28/11/2026, concepteur « voie libre ») =====
   LECTURE SEULE, aucune course. Lit :
     - ml/ecurie/etude/echelle-de-bots/lecteur-joueurs/sortie.json (les 14 parties des joueurs, ecrit par parties.js du lecteur des joueurs)
     - ml/ecurie/etude/banc-des-genes/etat/courses-2026-48.jsonl (1 250 courses du banc des genes, 900 s au plus, regime allege)
   Ecrit sortie-courbe-de-survie.txt a cote.
   usage (depuis la racine du depot) : node ml/ecurie/etude/echelle-de-bots/concepteur-libre/courbe-de-survie.js */
const fs=require('fs'),path=require('path');
const RAC=path.join(__dirname,'..','..','..','..','..');
const H=JSON.parse(fs.readFileSync(path.join(RAC,'ml/ecurie/etude/echelle-de-bots/lecteur-joueurs/sortie.json'),'utf8'));
const L=fs.readFileSync(path.join(RAC,'ml/ecurie/etude/banc-des-genes/etat/courses-2026-48.jsonl'),'utf8').split('\n').filter(Boolean)
  .map(l=>{try{return JSON.parse(l);}catch(e){return null;}}).filter(x=>x&&x.mesuree);
const out=[];const P=s=>{out.push(s);};
const pct=x=>(100*x).toFixed(0)+' %';
/* intervalle de Wilson a 95 % */
function wilson(k,n){if(!n)return [0,1];const z=1.96,p=k/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return [Math.max(0,c-h),Math.min(1,c+h)];}
const W=(k,n)=>{const w=wilson(k,n);return k+'/'+n+' = '+pct(n?k/n:0)+' ['+pct(w[0])+' ; '+pct(w[1])+']';};
const q=(a,p)=>{const s=a.slice().sort((x,y)=>x-y);if(!s.length)return NaN;const i=(s.length-1)*p,b=Math.floor(i);return s[b]+(s[Math.min(s.length-1,b+1)]-s[b])*(i-b);};

const J=H.map(h=>({palier:h.palier,s:h.duree_s,pieces:h.pieces_max,chances:h.chances,cause:h.cause,carte:h.map_mort,t:h.t_palier||{}}));
const B=L.map(l=>({id:l.id,palier:l.palier,s:l.survie_s,pieces:l.pieces,chances:l.morts>1?1:0,cause:l.cause}));
const DEP=B.filter(b=>b.id==='depart'); /* le bras « depart » = c0025 */
const LOTS=[['joueurs (14 parties)',J],['c0025 (bras depart, 96 courses)',DEP],['les 1 250 du banc',B]];

P('===== 1. LA COURBE S(p) : part des parties qui ATTEIGNENT le palier p (intervalle de Wilson 95 %) =====');
for(const [nom,X] of LOTS){P(nom);for(const p of [3,5,8,10,12,15,20,25,30])P('  S('+p+') : '+W(X.filter(x=>x.palier>=p).length,X.length));}

P('\n===== 2. LA MARCHE : parmi les parties arrivees au palier p, la part qui atteint p+5 =====');
for(const [nom,X] of LOTS){P(nom);for(const p of [1,5,10,15,20,25]){const a=X.filter(x=>x.palier>=p);P('  '+p+' -> '+(p+5)+' : '+W(a.filter(x=>x.palier>=p+5).length,a.length));}}

P('\n===== 3. LE RISQUE DE FINIR LA PARTIE DANS LA MINUTE (parmi les vivants au debut de la minute) =====');
for(const [nom,X] of LOTS){P(nom);for(let m=0;m<8;m++){const a=X.filter(x=>x.s>=60*m);if(!a.length)break;P('  minute '+(m+1)+' : '+W(a.filter(x=>x.s<60*(m+1)).length,a.length));}}

P('\n===== 4. LES PIECES A DUREE EGALE (tranches de la duree de la partie) =====');
for(const [nom,X] of LOTS){P(nom);for(const [a,b] of [[0,30],[30,75],[75,120],[120,180],[180,270],[270,420],[420,900]]){const z=X.filter(x=>x.s>=a&&x.s<b);if(!z.length)continue;
  P('  '+a+'-'+b+' s : n '+z.length+', duree mediane '+q(z.map(x=>x.s),.5).toFixed(0)+' s, pieces medianes '+q(z.map(x=>x.pieces),.5).toFixed(0)+' (min '+Math.min(...z.map(x=>x.pieces))+', max '+Math.max(...z.map(x=>x.pieces))+'), palier median '+q(z.map(x=>x.palier),.5).toFixed(1));}}

P('\n===== 5. LA BANQUE : combien de courses FINISSENT a chaque palier, et combien de temps elles durent =====');
P('(la duree d une partie de joueur finie a ce palier, pour comparer : colonne « joueurs »)');
P('palier | c0025 n | 1 250 n | duree des 1 250 : q10 / mediane / q90 (s) | joueurs : durees (s)');
for(let p=1;p<=22;p++){const d=DEP.filter(x=>x.palier===p),b=B.filter(x=>x.palier===p),j=J.filter(x=>x.palier===p);
  P('  '+String(p).padStart(2)+' | '+String(d.length).padStart(3)+' | '+String(b.length).padStart(4)+' | '+(b.length?q(b.map(x=>x.s),.1).toFixed(0)+' / '+q(b.map(x=>x.s),.5).toFixed(0)+' / '+q(b.map(x=>x.s),.9).toFixed(0):'-')+' | '+(j.length?j.map(x=>x.s.toFixed(0)).join(', '):'-'));}

P('\n===== 6. L HEURE DU PALIER : a quelle duree un bot a-t-il les pieces du palier p, contre l instant ou il tombe chez les joueurs =====');
/* bot : pieces ~ a + b x minutes (moindres carres sur les courses de plus de 60 s) ; sous 60 s : pieces/min des courses de moins de 60 s */
function pente(X){const z=X.filter(x=>x.s>60),n=z.length,mx=z.reduce((s,x)=>s+x.s/60,0)/n,my=z.reduce((s,x)=>s+x.pieces,0)/n;let sxy=0,sxx=0;for(const x of z){sxy+=(x.s/60-mx)*(x.pieces-my);sxx+=(x.s/60-mx)**2;}const b=sxy/sxx;return {a:my-b*mx,b:b,n:n};}
const SEUILS=[0,40,85,150,225,305,400,505,615,730,860,995,1130,1280,1430,1585,1745,1910,2080,2255,2440,2630,2825,3030,3240,3455,3680,3910,4145,4385];
const fd=pente(DEP),fb=pente(B);P('pente c0025 : pieces = '+fd.a.toFixed(0)+' + '+fd.b.toFixed(0)+' x minutes (n '+fd.n+') ; les 1 250 : '+fb.a.toFixed(0)+' + '+fb.b.toFixed(0)+' x minutes (n '+fb.n+')');
P('palier | seuil | c0025 y est vers (s) | joueurs : instants mesures (s), n parties');
for(const p of [5,10,15,20,25]){const tj=J.map(x=>x.t[p]).filter(x=>x!=null);const tb=60*(SEUILS[p-1]-fd.a)/fd.b;
  P('  '+p+' | '+SEUILS[p-1]+' | '+tb.toFixed(0)+' | '+(tj.length?Math.min(...tj).toFixed(0)+' a '+Math.max(...tj).toFixed(0)+' (mediane '+q(tj,.5).toFixed(0)+'), n '+tj.length:'-'));}
P('(au-dela de 5 min, la pente de c0025 est une extrapolation : aucune de ses 96 courses ne depasse '+Math.max(...DEP.map(x=>x.s)).toFixed(0)+' s)');

P('\n===== 7. DE QUOI FINIT LA PARTIE, par tranche de palier final (la cause qui a fini la course) =====');
for(const [nom,X] of LOTS){P(nom);for(const [a,b] of [[1,3],[4,8],[9,14],[15,30]]){const z=X.filter(x=>x.palier>=a&&x.palier<=b);if(!z.length){P('  paliers '+a+'-'+b+' : aucune');continue;}const c={};for(const x of z)c[x.cause]=(c[x.cause]||0)+1;
  P('  paliers '+a+'-'+b+' (n '+z.length+') : '+Object.entries(c).sort((u,v)=>v[1]-u[1]).map(e=>e[0]+' '+pct(e[1]/z.length)).join(', '));}}
P('seconde chance prise : joueurs '+W(J.filter(x=>x.chances>0).length,J.length)+' ; c0025 '+W(DEP.filter(x=>x.chances>0).length,DEP.length)+' ; 1 250 '+W(B.filter(x=>x.chances>0).length,B.length));

{const z=B.filter(x=>x.palier>=4&&x.palier<=8),f=z.filter(x=>x.cause==='pic').length/z.length,p=4*f*f*f*(1-f)+f*f*f*f;
  P('paliers 4-8 : 3 parties de joueurs sur 4 finissent sur un pic ; si les joueurs mouraient comme les 1 250 (pic '+(100*f).toFixed(1)+' %), 3 sur 4 ou plus arriverait avec p = '+p.toFixed(4)+' (binomiale ; 3 de ces 4 parties sont du meme joueur, sur la jade)');}
P('palier moyen des 14 parties de joueurs : '+(J.reduce((s,x)=>s+x.palier,0)/J.length).toFixed(2));
{const m=B.reduce((s,x)=>s+x.s,0)/B.length;P('\n(temps de jeu : une course du banc dure '+m.toFixed(0)+' s en moyenne ; a 420 courses a l heure (lecteur de la selection), le Ryzen joue environ '+(420*m/3600).toFixed(1)+' heures de jeu par heure ; 300 courses de 1 200 s = 100 heures de jeu = '+(100/(420*m/3600)).toFixed(1)+' h ; 144 courses de 300 s au plus = '+(12/(420*m/3600)).toFixed(1)+' h au plus — proportionnalite supposee, non mesuree)');}

P('\n===== 8. L EXPERT : le risque par minute qu il faudrait =====');
P('Pour finir vivante une course de T minutes avec la probabilite P, a risque constant h par minute : (1-h)^T = P.');
for(const [T,Pr] of [[10,.99],[15,.99],[20,.99],[20,.999]]){const h=1-Math.pow(Pr,1/T);P('  T '+T+' min, P '+Pr+' : h = '+(100*h).toFixed(3)+' % par minute');}
const morts=X=>X.length+X.filter(x=>x.chances>0).length,minutes=X=>X.reduce((s,x)=>s+x.s,0)/60;
for(const [nom,X] of LOTS)P('  '+nom+' : '+morts(X)+' morts (fins + secondes chances) en '+minutes(X).toFixed(1)+' min = '+(morts(X)/minutes(X)).toFixed(2)+' mort par minute');
P('« Zero mort sur N courses » borne le risque par course a 3/N (95 %) : N 100 -> 3 %, N 300 -> 1 %, N 1 000 -> 0,3 %.');

P('\n===== 9. CE QUE COUTE UNE BANQUE (calcul, pas une mesure) =====');
P('Pour avoir 40 courses finies dans une tranche que le pilote atteint avec la frequence f, il faut 40/f courses.');
for(const [nom,a,b] of [['paliers 1-2',1,2],['paliers 3-4',3,4],['paliers 5-6',5,6],['paliers 7-9',7,9],['paliers 10-14',10,14],['paliers 15-19',15,19],['paliers 20 et plus',20,30]]){
  const f=B.filter(x=>x.palier>=a&&x.palier<=b).length/B.length,fj=J.filter(x=>x.palier>=a&&x.palier<=b).length/J.length;
  P('  '+nom+' : pilotes du banc f = '+(100*f).toFixed(1)+' % -> '+(f?Math.ceil(40/f):'jamais')+' courses ; un pilote qui aurait la repartition des 14 parties de joueurs f = '+pct(fj)+' -> '+(fj?Math.ceil(40/fj):'aucune partie'));}

fs.writeFileSync(path.join(__dirname,'sortie-courbe-de-survie.txt'),out.join('\n')+'\n');
console.log(out.join('\n'));
