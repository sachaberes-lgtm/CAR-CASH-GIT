/* Le tableau lisible du PASS (07/11/2026) : lit code/missions/pass-table.js et code/missions/table.js, écrit passation/PASS-MISSIONS-TABLE.md.
   Lancer : node outils/pass-table-md.cjs   — tout le calcul des parties vient des constantes de pass-table.js (PARTIE_MN, GAIN_PARTIE, PASS_TAUX…). */
const fs=require('fs'),path=require('path'),R=path.join(__dirname,'..');
const lit=f=>fs.readFileSync(path.join(R,f),'utf8');
const tt=lit('code/missions/table.js'),i0=tt.indexOf('const M2=['),i1=tt.indexOf('const M2K=');
const M2src=tt.slice(i0,i1).replace(/\/\*[\s\S]*?\*\//g,'').replace(/\n\s*\/\/[^\n]*/g,'\n');
const body=M2src.slice(0,M2src.lastIndexOf('];')+2)+'\nreturn M2;';
const M2=new Function(body)();
const cars=lit('code/voitures/cars.js');
const ps=lit('code/missions/pass-table.js');
const I18N={};
const API=new Function('M2','I18N','location','CARS','CAR_UNLOCK',ps+'\nreturn {PASS_CADEAU,PASS_POOL,PASS_NOUV,PASS_TRANCHES,PASS_REGLES,PASS_SORTIES,PASS_LIEN,PASS_CADEAU,PARTIE_MN,GAIN_PARTIE,PASS_CROIS,PASS_TAUX,PASS_COURT,PASS_MOYEN,passClasse,passGainCumul};')(M2,I18N,{search:''},[],[]);
const {PASS_CADEAU,PASS_POOL,PASS_NOUV,PASS_TRANCHES,PASS_REGLES,PASS_SORTIES,PASS_LIEN,PARTIE_MN,GAIN_PARTIE,PASS_CROIS,PASS_TAUX,passClasse}=API;
const def={};for(const m of M2)def[m.id]=m;for(const m of PASS_NOUV)def[m.id]=m;
const nb=n=>Math.round(n).toLocaleString('fr-FR').replace(/[  ]/g,' ');
const lien={};for(const n in PASS_LIEN)lien[PASS_LIEN[n]]=n;const recOf=o=>lien[o.id]?{car:lien[o.id]}:(o.rec||def[o.id].r||{});
function txt(d,id){const o=PASS_POOL.find(x=>x.id===id),v=(o.opt.v!=null?o.opt.v:d.v);let s=d.t;
  const u=d.u;const vs=v==='tot'?'TOUS':nb(v);return s.replace('{v}',vs).replace(/\bS\b/,'S');}
function rec(o){const r=recOf(o);if(r.cash)return nb(r.cash)+' $';if(r.car)return 'CAISSE '+r.car;if(r.cat)return (r.cat==='trainee'?'traînée ':r.cat==='peinture'?'peinture ':'aile ')+r.id.toUpperCase();return '?';}
const dur=(p,P)=>p>=9999?'∞':p+' ('+(p*PARTIE_MN[P]<90?Math.round(p*PARTIE_MN[P])+' min':Math.round(p*PARTIE_MN[P]/6)/10+' h')+')';
let md='# LE PASS — le réservoir du chapitre 1 (07/11/2026)\n\n> Généré par `node outils/pass-table-md.cjs` depuis `code/missions/pass-table.js` : ne pas éditer à la main. À relire par Léo : la courbe, les durées, les primes.\n\n';
md+='## Comment ça marche\n- **3 missions actives** pour tous. Réussie + récompense prise -> remplacée par une mission tirée dans le réservoir.\n';
md+='- **Tirage au hasard, borné** : seulement la tranche atteinte (selon les missions réussies du chapitre) et la précédente ; jamais deux missions de la même famille en même temps si possible ; jamais une mission déjà remplie ; jamais deux caisses à moins de '+PASS_REGLES.ecartCaisses+' missions réussies l\'une de l\'autre ; la petite peinture (`ps04`) est garantie dans les 4 premiers tirages.\n';
md+='- **Garde-fou** : un emplacement non fini après max('+PASS_REGLES.echangeParties+', 2 x ses parties) parties peut être ÉCHANGÉ (la mission retourne au réservoir).\n';
md+='- **Un seul chapitre** (« CHAPITRE 1 ») contient toute la courbe. Pour en ajouter un : une ligne dans `PASS_CHAPITRES` + des entrées `ch:2` dans le réservoir ; le moteur n\'est pas touché.\n\n';
md+='## Durée d\'une partie : les constantes (UN SEUL endroit : `PARTIE_MN`, `GAIN_PARTIE`, `PASS_CROIS`, `PASS_TAUX` en tête de `pass-table.js`)\n\n| | débutant | habitué |\n|---|---|---|\n';
md+='| minutes par partie (`PARTIE_MN`) | '+PARTIE_MN.debutant+' | '+PARTIE_MN.habitue+' |\n| $ par partie au début (`GAIN_PARTIE`) | '+nb(GAIN_PARTIE.debutant)+' | '+nb(GAIN_PARTIE.habitue)+' |\n| le gain grandit de 1/x par partie (`PASS_CROIS`) | '+PASS_CROIS.debutant+' | '+PASS_CROIS.habitue+' |\n';
for(const k of Object.keys(PASS_TAUX.debutant))md+='| '+{km:'km roulés',fig:'figures',pu:'power-ups',nit:'s de nitro',nmax:'s de nitro max',air:'s en l\'air',verg:'km sur verglas (partie au glacier)',mort:'morts'}[k]+' par partie | '+PASS_TAUX.debutant[k]+' | '+PASS_TAUX.habitue[k]+' |\n';
md+='\n**D\'où viennent ces chiffres (déduits, pas inventés)** : `passation/ECONOMIE.md` §1-2 (parties de 15 à 75 s au banc, 500-1 000 $ la partie d\'un humain moyen au début) ; `outils/eco-debut-modele.cjs` (profil « moyen » : 45-90 s, la moitié des pièces = DÉBUTANT ; profil « fort » : 2 à 4 min, 75 % des pièces, frénésie = HABITUÉ) ; journal « LES MISSIONS v2 » (1 000 km/h en ~50 s, ~55 d\'aura/s). Les taux par partie (km, figures, power-ups…) sont des HYPOTHÈSES à corriger avec de vraies parties de Léo. Les exploits (records) sont des estimations directes dans la table. Limite connue : une prime en argent compte pour « accumule » (`gagneAjoute`), les durées de l\'argent sont donc un peu pessimistes.\n\n';
md+='Classes (parties du débutant) : **COURT** <= 2 · **MOYEN** 3 à 12 · **LONG** > 12 (Léo : court <= 1, moyen 3-10 ; les trous sont rattachés au voisin).\n\n';
md+='## Les tranches\n\n| tranche | s\'ouvre à | missions | prime de base | courtes / moyennes / longues | caisses |\n|---|---|---|---|---|---|\n';
let totCash=0,totCars=0;
for(const [n,ent,pr] of PASS_TRANCHES){const L=PASS_POOL.filter(o=>o.tr===n);const c={COURT:0,MOYEN:0,LONG:0};L.forEach(o=>c[passClasse(o.p.debutant)]++);
  const cars=L.filter(o=>recOf(o).car).length;
  md+='| '+n+' | '+ent+' missions réussies | '+L.length+' | '+nb(pr)+' $ | '+c.COURT+' / '+c.MOYEN+' / '+c.LONG+' | '+cars+' |\n';}
md+='\n## Le réservoir, tranche par tranche\n';
let cumul={cash:0,car:0};
for(const [n] of PASS_TRANCHES){const L=PASS_POOL.filter(o=>o.tr===n).sort((a,b)=>a.p.debutant-b.p.debutant);if(!L.length)continue;
  md+='\n### Tranche '+n+' — prime de base '+nb(PASS_TRANCHES[n-1][2])+' $\n\n| id | mission | classe | parties débutant | parties habitué | récompense |\n|---|---|---|---|---|---|\n';
  for(const o of L){const d=def[o.id],r=recOf(o);if(r.cash)cumul.cash+=r.cash;if(r.car)cumul.car++;
    md+='| `'+o.id+'` | '+txt(d,o.id)+(o.opt.k?' *(hors cadeaux)*':'')+' | '+passClasse(o.p.debutant)+' | '+dur(o.p.debutant,'debutant')+' | '+dur(o.p.habitue,'habitue')+' | '+rec(o)+' |\n';}}
md+='\n## Sortis du pass\n'+Object.keys(PASS_SORTIES).map(k=>'- `'+k+'` : '+PASS_SORTIES[k]).join('\n')+'\n';
md+='\n## Bilan\n- '+PASS_POOL.length+' missions dans le réservoir (dont '+PASS_NOUV.length+' nouvelles, `ps01`..`ps48`).\n- Argent versé si TOUT le chapitre est fini : **'+nb(cumul.cash)+' $** (le garage à l\'argent ~34 M$, voir `ECONOMIE.md`). Caisses données : **'+cumul.car+'**.\n';
fs.writeFileSync(path.join(R,'passation/PASS-MISSIONS-TABLE.md'),md);
console.log('ok',PASS_POOL.length,'cash',cumul.cash,'cars',cumul.car);
for(const [n] of PASS_TRANCHES){const L=PASS_POOL.filter(o=>o.tr===n);console.log(n,L.length,L.filter(o=>recOf(o).car).map(o=>o.id).join(','));}
let m2=fs.readFileSync(path.join(R,'passation/PASS-MISSIONS-TABLE.md'),'utf8');
m2=m2.replace(/\((\d+)\.(\d) h\)/g,'($1,$2 h)').replace(/\| 2\.5 \|/g,'| 2,5 |');
const C=PASS_CADEAU,nv=PASS_POOL.filter(o=>o.cadeau==='voiture').length,nh=PASS_POOL.filter(o=>o.cadeau==='hab').length;
m2+=`
## Les missions CADEAU (voiture / habillage) — le système d'apparition
Dans le réservoir : **${nv} missions voiture** et **${nh} missions habillage** (champ \`cadeau\`), contre ${PASS_POOL.length-nv-nh} d'argent. Elles sont plus rares mais apparaissent toujours. Constantes : \`PASS_CADEAU\` (pass-table.js).
- **Intervalle variable, plafond garanti** : après chaque mission réussie le compte monte ; le prochain cadeau est tiré dans une fenêtre cachée de missions réussies : habillage tous les ${C.hab.min} à ${C.hab.max}, voiture tous les ${C.voiture.min} à ${C.voiture.max}. Le maximum est une GARANTIE (jamais plus de ${C.hab.max} sans habillage, ${C.voiture.max} sans voiture). L'écart s'allonge doucement (+${C.croit.hab} / +${C.croit.voiture} mission par cadeau donné, plafonné à ${C.plafondCroit.hab} / ${C.plafondCroit.voiture}).
- **Début généreux** : la petite peinture LAGON au plus tard à la ${C.debut.hab}e mission réussie, la première voiture entre la ${C.debut.voiture[0]}e et la ${C.debut.voiture[1]}e.
- **Garde-fous** : jamais deux cadeaux de suite (${C.ecartCadeaux} missions d'écart au moins), jamais deux caisses à moins de ${C.ecartCaisses} missions, voiture / habillage en alternance, pas deux peintures de suite, jamais un objet déjà possédé.
- **Anticipation** : quand un cadeau est tiré, sa carte est DORÉE avec la silhouette (voiture noire floutée, ou l'aperçu de la peinture) et le message « NOUVELLE MISSION CADEAU ». Barre de progression sur chaque carte ; la carte cadeau pulse doucement dans son dernier tiers. Une mission cadeau commencée reste dans ses emplacements jusqu'à réussite (jamais remplacée, jamais échangée par le garde-fou).
- **Presque-gagné** : rien n'est annoncé avant ; quand la jauge cachée dépasse ${Math.round(C.presque*100)} % de la fenêtre, l'écran de fin de partie peut dire « une mission cadeau est proche » (sans chiffre).
- **Pic de fin** : récupérer un cadeau = la petite scène de révélation (celle des secrètes) ; l'argent se prend d'un tap.
- **Équité** : le tirage est sauvegardé (pas de re-tirage en rouvrant ni en quittant).
- **Exemple de rythme** (valeurs de départ) : environ 3 habillages et 1 à 2 voitures sur les 25 premières missions réussies (le début est plus généreux). Le réservoir contient ${nv} voitures et ${nh} habillages : de quoi tenir la garantie sur tout le chapitre.

## Décisions à valider par Léo
1. **Sortis** : « RÉUSSIS 10 MISSIONS » (méta, se remplit seule) et « AVOIR EXPLORÉ CHAQUE MAP » (doublon de « JOUE SUR CHAQUE MAP »). Leurs caisses (LE CHARGEUR, LE ROUGE-GORGE) passent à « ATTEINS 20 000 D'AURA » et « JOUE SUR CHAQUE MAP » (bonne difficulté, tranche 5 et 5).
2. **Les collections comptent HORS cadeaux** (voitures, couleurs, traînées, ailes, figures : variante \`T\` de la mesure), sinon les caisses données par le pass remplissaient « COLLECTE 5 VOITURES » toutes seules.
3. **« ROULE 100 000 KM » (LA QUEUE DE CANARD) est impossible** (12 500 parties au débutant) : seuil ramené à 3 000 km dans le pass. Les ailes (10 / toutes), « toutes les couleurs », « toutes les voitures », « tout collecter » demandent des dizaines de millions ou le pack de peintures à 0,99 € : ce sont l'horizon du chapitre (tranche 8, durée ∞).
4. **Petite peinture de base** : LAGON (une des peintures unies du pack), tirée au plus tard au 4e tirage ; proposition, on peut prendre une autre. Les autres habillages : traînée ROSE NÉON (tr. 2), SAKURA (tr. 3), peinture COUCHER DE SOLEIL (tr. 4-5), VAPORWAVE (tr. 7), aile PHÉNIX et traînée FOUDRE restent liées à leurs missions d'origine.
5. **Classes** : COURT <= 2 parties, MOYEN 3 à 12, LONG au-delà (Léo avait dit <= 1 et 3-10).
6. **Durée d'une partie** : débutant 1,1 min / 800 $, habitué 3 min / 4 000 $ ; à corriger avec de vraies parties (un seul endroit, en tête de pass-table.js).
7. **Argent total versé** si tout le chapitre est fini : voir Bilan (surtout les 20 missions de fond, tranches 7-8). À rabaisser si trop.
8. **Tranches** : s'ouvrent après 0 · 5 · 10 · 16 · 24 · 34 · 46 · 58 missions réussies ; le tirage prend la tranche atteinte et la précédente.
`;
fs.writeFileSync(path.join(R,'passation/PASS-MISSIONS-TABLE.md'),m2);
