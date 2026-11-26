#!/usr/bin/env node
/* ===== LA BOUCLE AUTOMATIQUE (2026-11-24, Sacha : « il faut que tu utilises les 200 euros dans ton plan » ; « c'est pas le but des credits
   justement de faire du machine learning ? ») =====
   La methode du plan, sans personne devant l'ecran : Claude ECRIT des variantes du pilote (API, credit), le VRAI JEU les note, on garde
   la meilleure, on recommence. Chaque variante entre au labo avec son code, sa raison, sa note, ses courses et SON COUT.
   usage : node boucle.js --budget 20 [--depuis pilote.js] [--etape C] [--tours 20] [--candidats 6] [--modele claude-opus-5-5] [--effort high]
                          [--graines-tri 6 --tmax-tri 600] [--graines 20 --tmax 900] [--regime allege] [--coeurs 4]
                          [--critere palier_median] [--patience 4] [--consigne "une precision pour ce lancement"] [--sans-commit] [--a-blanc]
                          [--depart-validation 950000] [--main-libre]
     --budget      OBLIGATOIRE (sauf --a-blanc) : le plafond de CE lancement, en euros. La boucle s'arrete avant de le depasser.
     --depuis      le pilote de depart, la premiere fois (ensuite le parent est le meilleur de l'etape, lu au journal)
     --plafond     le plafond de TOUS les lancements reunis, en euros (200 par defaut) : le budget de ce lancement est rabote a ce qu'il reste
                   d'apres le journal des depenses du labo (toutes etapes confondues). Atteint, la boucle ne demande plus rien.
     --a-blanc     tout sauf l'appel payant : des jumeaux du parent, 2 graines de 40 s, dans un labo jetable NEUF a chaque essai
                   (tampon/a-blanc/<date> ; avant le 25/11, toujours le meme dossier : des le 2e essai --depuis n'etait plus lu). Pour verifier la tuyauterie.
     --main-libre  (2026-11-25) une variante peut changer le `profil` de sa main. Sans elle, une variante dont la main n'est pas celle du parent
                   est PERDUE avant d'etre notee (voir LA MAIN EST FIXEE, plus bas). A reserver aux etapes ou l'on regle la main (D, E).
     --depart-validation  la premiere des graines NEUVES de la validation (950000 par defaut ; l'entrainement et le tri partent de 910000)
     --critere mixte      (2026-11-26) noter « palier ET ressemblance » : mixte = palier_median − POIDS × ecart aux joueurs (ml/bot/ressemblance.js).
                          --poids-ressemblance (6 par defaut : 1 palier vaut 0,17 d'ecart). Voir LA NOTE MIXTE plus bas.
   UN TOUR : (1) le parent = le champion de l'etape ; (2) ses pires courses sont autopsiees (chaque mort, pas seulement la fin) ; (3) N variantes
   sont demandees a Claude, chacune sous un angle different ; (4) TRI : chaque variante sur peu de graines ; (5) celles qui font au moins aussi bien
   que le parent au tri, un tiers des variantes au plus, sont notees EN GRAND (20 graines) ; (6) toutes sont inscrites (les eliminees avec leur
   note de tri, lot « tri ») ; (7) la generation est close ; (8) LA VALIDATION : la meilleure notee en grand, si elle bat le parent, est renotee
   sur 20 graines NEUVES et n'est sacree championne que si elle y tient aussi la barre du parent (note une fois sur ces memes graines) ;
   (9) l'arbre refait, le labo valide dans git.
   L'ARGENT : compte a chaque reponse d'apres les jetons factures (TARIFS, dollars par million de jetons ; 1 € compte pour 1 $, prudent).
   C'est une ESTIMATION : la facture fait foi (console.anthropic.com). La cle se lit dans l'environnement (ANTHROPIC_API_KEY) : elle n'est
   jamais ecrite dans un fichier, un journal ou un message.
   LE FREIN : ce n'est pas l'argent, c'est le PC. Une variante = plusieurs minutes de jeu sur tous les coeurs. Compter ~20 a 30 variantes par nuit. */
const fs=require('fs'),path=require('path'),{spawnSync,execFileSync}=require('child_process');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;},a=n=>A.includes('--'+n);
const BLANC=a('a-blanc'),MAIN_LIBRE=a('main-libre');
/* jamais le vrai journal ; (2026-11-25, relecture) un labo NEUF a chaque essai a blanc : dans l'ancien, le parent etait le champion de l'essai
   d'avant et --depuis n'etait plus lu (le 25/11 : le bot de reference, sans profil, alors que l'essai donnait essai-main.js) */
if(BLANC&&!process.env.LABO_DIR)process.env.LABO_DIR=path.join(__dirname,'..','labo','tampon','a-blanc',new Date().toISOString().replace(/[:.]/g,'-'));
const L=require('../labo/labo'),{lignes}=require('../bot/mesures');
const BOT=path.join(__dirname,'..','bot'),TRAVAIL=path.join(L.D.tampon,'boucle');
const ETAPE=String(opt('etape','C')),TOURS=+opt('tours',20),NC=+opt('candidats',6),MODELE=opt('modele','claude-opus-5-5'),EFFORT=opt('effort','high');
const GT=+opt('graines-tri',BLANC?2:6),TT=+opt('tmax-tri',BLANC?40:600),NG=+opt('graines',BLANC?2:20),TMAX=+opt('tmax',BLANC?40:900);
const REGIME=opt('regime','allege'),COEURS=+opt('coeurs',4),CRITERE=opt('critere','palier_median'),PATIENCE=+opt('patience',4),PLAFOND=+opt('plafond',200);let BUDGET=+opt('budget',0);
const G0=910000,GV=+opt('depart-validation',950000);
/* ===== LA NOTE MIXTE (2026-11-26, Sacha : « objectif : on ne peut pas du tout faire la difference entre un bot et un vrai joueur ») =====
   L'enquete (ml/ecurie/etude/realisme.md) : « la boucle note sur le palier median ; presque toutes les corrections vers un vrai joueur coutent du
   palier au debut (voler tue, la nitro fait sortir) : il faut noter palier ET ressemblance, sinon elle refusera chaque pas ». MESURE (26/11) : le
   pilote qui vole est a 2,33 des joueurs et au palier 9,5 ; celui d'avant a 2,67 et au palier 11 — au seul palier, la boucle garderait l'ancien.
   (Le soir du 26/11, chaque mesure bornee a 8 ecarts-types au lieu de 4 : 3,05 pour pilote.js, 2,02 et palier 7 pour le pilote qui ne se cache plus sous la dalle.)
   Chaque note recoit donc : ecart_joueurs (la distance moyenne aux joueurs sur quinze mesures de ce qui se voit d'une partie, 0 = au milieu d'eux),
   ecart_detail (mesure par mesure, pour le dire a Claude) et mixte = palier_median − POIDS × ecart_joueurs. Avec POIDS = 6, un tiers d'ecart-type
   gagne sur les quinze mesures vaut deux paliers : la ressemblance pese, le palier departage. Les deux chiffres restent lisibles a part. */
const POIDS=+opt('poids-ressemblance',6);
let RESS=null;
function ressemblance(N){
  if(!N||!N.note||!Array.isArray(N.parties))return N;
  try{RESS=RESS||require('../bot/ressemblance');const E=RESS.ecart(N.parties.map(p=>p.partie));
    if(E){N.note.ecart_joueurs=E.ecart;N.note.ecart_detail=E.mesures.map(x=>({cle:x.cle,nom:x.nom,z:x.z,bot:x.bot,joueurs:x.joueurs}));
      N.note.mixte=Math.round((N.note.palier_median-POIDS*E.ecart)*100)/100;}
    else{N.note.ecart_joueurs=4;N.note.ecart_detail=[];N.note.mixte=Math.round((N.note.palier_median-POIDS*4)*100)/100;}   /* aucune partie de plus de 60 s : le pire */
  }catch(e){dire('la ressemblance n\'a pas pu etre calculee : '+String(e&&e.message||e));}
  return N;}

/* LES TARIFS, en dollars par million de jetons : [lus, ecrits, lus depuis le cache]. Source : la table des modeles de la documentation
   d'Anthropic, relevee le 2026-11-03 (a reverifier si un modele change : platform.claude.com/docs). Ecrire au cache coute 1,25 x « lus ».
   Le prix du cache de Haiku 5.5 n'etait pas dans la table : pris a un dixieme du prix lu, a verifier. */
const TARIFS={'claude-opus-5-5':[4,20,.20],'claude-sonnet-5-5':[2,10,.10],'claude-haiku-5-5':[.10,.50,.01],'claude-fable-5-2':[8,40,.20]};
const T=TARIFS[MODELE];
function cout(u){u=u||{};return ((u.input_tokens|0)*T[0]+(u.cache_creation_input_tokens|0)*T[0]*1.25+(u.cache_read_input_tokens|0)*T[2]+(u.output_tokens|0)*T[1])/1e6;}
const r2=x=>Math.round(x*100)/100,dire=m=>console.log('[boucle] '+m);
if(!T){dire('modele sans tarif connu : '+MODELE+' (connus : '+Object.keys(TARIFS).join(', ')+')');process.exit(1);}
if(!BLANC&&!(BUDGET>0)){dire('il manque --budget <euros> : le plafond de depense de ce lancement (ou --a-blanc pour ne rien depenser)');process.exit(1);}

/* ----- le jeu : noter, autopsier ----- */
function noter(fichier,graines,tmax,nom,depart){
  const sortie=path.join(TRAVAIL,nom+'.json');try{fs.unlinkSync(sortie);}catch(e){}
  const r=spawnSync(process.execPath,[path.join(BOT,'noter.js'),fichier,'--graines',String(graines),'--depart',String(depart==null?G0:depart),'--tmax',String(tmax),'--regime',REGIME,
    '--coeurs',String(COEURS),'--sortie',sortie,'--parties'],{stdio:['ignore','pipe','pipe'],encoding:'utf8'});
  if(r.status!==0||!fs.existsSync(sortie)){dire('la note de '+nom+' n\'a pas abouti : '+String(r.stdout||'').split('\n').slice(-3).join(' | '));return null;}
  return ressemblance(JSON.parse(fs.readFileSync(sortie,'utf8')));}
/* (2026-11-25, relecture : « quand la main prend la seconde chance, la mort qui a coute un palier disparait de ce que la boucle montre »)
   autopsie.js raconte les secondes d'avant CHAQUE mort (un bloc « #### » par mort, puis la fin) ; chaque bloc est borne A PART, en gardant SA FIN :
   les dernieres decisions avant la mort, celles qui comptent. Avant : 7000 caracteres pour tout le texte, coupes a la fin — la mort partait. */
const PAR_BLOC=6000;
function borneBloc(b,k){
  if(b.length<=PAR_BLOC)return b;
  const L=b.split(/\r?\n/),tete=L.shift();let q=L.join('\n');q=q.slice(q.length-PAR_BLOC);q=q.slice(q.indexOf('\n')+1);
  return tete+'\n(… le debut de ce bloc est coupe : il reste les dernieres decisions)\n'+q;}
function autopsie(fichier,graine){
  const r=spawnSync(process.execPath,[path.join(BOT,'autopsie.js'),fichier,'--graine',String(graine),'--tmax',String(TMAX),'--avant','5','--regime',REGIME],{encoding:'utf8',maxBuffer:64e6});
  const t=String(r.stdout||'');const i=t.indexOf('cerveau «');
  return (i>=0?t.slice(i):t).split(/\r?\n(?=#### )/).map(borneBloc).join('\n');}
/* la valeur d'une note : le critere, puis le record, puis la survie — pour departager */
const valeur=n=>[n[CRITERE]||0,n.palier_record||0,n.survie_mediane_s||0];
const mieux=(x,y)=>{for(let i=0;i<x.length;i++){if(x[i]!==y[i])return x[i]>y[i];}return false;};
const auMoins=(x,y)=>!mieux(y,x);
/* (2026-11-25, relecture) chargeable(f) → { erreur, main } et lit(texte) → { raison, code } : dans lecture.js (verifier.js, controle 14, les essaie) */
const {chargeable,lit}=require('./lecture');
/* ===== LA MAIN EST FIXEE (2026-11-25, relecture : « la boucle ne sait pas si une variante a change de main ») =====
   La main est le levier le plus fort d'un pilote : pour la meme conduite, la main « clavier » survivait 72 s, la main de machine 157 s (ETAPES,
   mesure du 24/11) ; `chance:{prend:1}` donne une seconde vie a chaque course. Une variante qui allege son profil monterait donc le palier sans
   mieux conduire, deviendrait le parent, et toute la lignee descendrait d'une main de machine. A cette etape la main du parent est IMPOSEE :
   une variante dont l'empreinte du profil differe est perdue avant le tri (« main changee »), sa depense au journal. --main-libre leve la regle. */
const mainTxt=m=>m?'profil '+m:'aucun profil (main de machine)';
const coursesDe=N=>N.parties.map((p,i)=>({bilan:N.courses[i],partie:p.partie,touches:p.touches}));
const jeuDe=N=>Object.assign({},L.versionJeu(),{version:N.jeu,regime:N.regime||REGIME});

/* ----- le journal : le parent, la suite des generations, ce qui a deja ete tente ----- */
const deLEtape=()=>L.lire(L.F.cerveaux).filter(l=>l.etape===ETAPE);
/* ===== LE CHAMPION (2026-11-25, relecture : « la boucle sacre un champion sur 20 graines toujours les memes ») =====
   Avec six variantes par tour pendant vingt tours, garder la plus haute note d'entrainement revient a garder la plus chanceuse : sur la note de
   depart, la mediane de 20 courses tirees au sort va de 7 a 12 (un cas sur dix de chaque cote) pour la meme conduite. Est donc CHAMPION de
   l'etape : le pilote de depart (generation 0, inscrit par cette boucle), ou une variante qui a tenu sa validation (validations.jsonl : renotee sur
   des graines neuves, au moins aussi bien que son parent sur ces memes graines, `tient`). Parmi eux, la meilleure note d'entrainement.
   (documents-6) Et seulement les lignes notees comme CE lancement (meme tmax, meme regime) : une note a 300 s ou au regime max ne se compare pas
   a une note a 900 s en allege — elles sont laissees de cote, et on le dit. */
const regimeDe=l=>(l.jeu&&l.jeu.regime)||'max';
/* (2026-11-25, simulateur fidele) et LE MEME SIMULATEUR : une note d'avant le relief du canyon (« avant-relief ») ne se compare pas a une note d'apres */
const simDe=l=>L.simulateurDe(l.jeu);
function sacres(){const V=L.lire(L.F.validations);return new Set(V.filter(v=>v.etape===ETAPE&&v.role==='candidat'&&v.tient===true).map(v=>v.id));}
function meilleur(dire9){
  const S=sacres(),autres=[];let b=null;
  for(const l of deLEtape()){if(l.lot!=='entrainement')continue;
    if(l.tmax!==TMAX||regimeDe(l)!==REGIME||simDe(l)!==L.SIMULATEUR){autres.push(l.id+' ('+l.tmax+' s, '+regimeDe(l)+(simDe(l)!==L.SIMULATEUR?', simulateur '+simDe(l):'')+')');continue;}
    if(!(l.generation===0&&!(l.parents||[]).length)&&!S.has(l.id))continue;
    if(!b||mieux(valeur(l.note),valeur(b.note)))b=l;}
  if(dire9&&autres.length)dire(`⚠ ${autres.length} pilote(s) de l'etape ${ETAPE} note(s) avec un autre reglage que ce lancement (${TMAX} s, ${REGIME}) : laisse(s) de cote — ${autres.slice(0,6).join(', ')}`);
  return {P:b,autres:autres.length};}
function dejaTente(){return deLEtape().slice(-15).map(l=>{const p=l.parents[0]&&deLEtape().find(x=>x.id===l.parents[0]);
  return `- ${l.id} (generation ${l.generation}, ${l.lot}) : ${l.raison} → ${CRITERE} ${l.note[CRITERE]}, record ${l.note.palier_record}`+(p?` (son parent ${p.id} : ${p.note[CRITERE]})`:'');}).join('\n');}

/* ----- la demande a Claude ----- */
const SYSTEME=fs.readFileSync(path.join(__dirname,'CONSIGNES.md'),'utf8')+'\n\n# LE MODE D\'EMPLOI DU BOT (ml/bot/README.md) — la vue, les gestes, le profil\n\n'+fs.readFileSync(path.join(BOT,'README.md'),'utf8');
/* (2026-11-26) LES ANGLES DE LA RESSEMBLANCE, pour --critere mixte : le plan d'action de l'enquete (ml/ecurie/etude/realisme.md § 4), un par variante */
const ANGLES_MIXTE=[
  'LE DESSOUS DE LA DALLE : les joueurs y roulent 2 % du temps au sol, par passages d\'une seconde ; le parent bien plus. En vol, preferer une pose DESSUS (le rayon dit `dessous`) sans y perdre la vie ; une fois dessous, en ressortir vite par le bord.',
  'LA NITRO AU SOL : les joueurs l\'ont allumee 78 % du sol, le parent trois fois moins — et sa jauge n\'est JAMAIS vide (mesure) : c\'est lui qui ne la demande pas. La tenir par defaut et la lacher AVANT le virage qui ne passe pas, au lieu de ne l\'allumer que dans les droites. Attention : demandee partout, elle coute deux a trois paliers (mesure le 26/11) — il faut mieux choisir OU la couper.',
  'S\'ENVOLER AU LIEU DE TOMBER : chez les joueurs la nitro est allumee au decollage 63 fois sur 100, leurs vols montent de 40 m et durent 2,2 s ; le parent tombe du bord nitro eteinte. Sortir nitro tenue, cabrer au depart, tapoter la nitro en vol (51 allumages par minute de vol chez les joueurs).',
  'LES RACCOURCIS : les joueurs en prennent 3,2 par minute, sur toutes les cartes. Le parent s\'engage quand un rayon `viser` du sol promet une pose ; trouve pourquoi il s\'engage si rarement la ou c\'est permis (les filtres de `raccourci`), ou rends une carte interdite praticable avec une regle prudente.',
  'LES FIGURES : 3,3 lancees par minute chez les joueurs, toutes en vol, dans les vols de plus de 2,5 s, souvent deux ou trois d\'affilee. Une figure lancee trop pres de la pose deregle le vol (mesure) : trouve les vols ou la marge est large (haut, loin de tout decor, les deux rayons se posent) et lances-y plus de figures.',
  'LA POSE : les joueurs se posent pres de l\'axe 41 fois sur 100, le parent deux fois moins (il se pose au ras du bord). Viser l\'axe de la route en fin de vol, lacher le volant une fois le cap pris.',
  'LA SURVIE EN VOL : le parent meurt dans 8 vols sur 100 (les joueurs 4). Lis ses morts : la map qui tue le plus, le decor annonce par le radar, les vols de 6 s jauge vide — une regle qui en sauve sans rendre le pilote plus frileux.',
  'LIBRE : la mesure de l\'ecart aux joueurs ou le parent est le plus loin (lis son tableau), par l\'idee que tu crois la plus sure.'];
const ANGLES=[
  'LA SURVIE EN VOL : sers-toi du radar de la vue pour choisir, a chaque decision en vol, la facon de piloter qui finit par une pose ; et pour ne pas decoller quand aucune issue n\'est bonne.',
  'LA VITESSE AVANT LES VIRAGES : anticipe (vitesse sure, rayon a venir), lache la nitro ou drifte AVANT le virage, pour ne plus sortir de la route sans le vouloir.',
  'LA LIGNE PARFAITE ET LA NITRO : prends les fruits et les plaques de la ligne pour tenir la nitro comme un joueur (60 % du temps), sans y laisser la route.',
  'LE FIL DES PIECES : ramasse davantage (viser plus tot a grande vitesse, l\'aimant, ne pas quitter le fil pour un objet qui ne rapporte pas de piece).',
  'LA MAP QUI TUE LE PLUS le parent (lis ses fins) : une regle propre a cette map, et seulement a elle.',
  'VOLER COMME UN JOUEUR SANS MOURIR : des sorties par le bord choisies (quand le radar promet une pose), une pose dans l\'axe et au centre.',
  'ALLEGER : retire ou simplifie une regle du parent qui ne sert pas ou qui coute des courses (dis laquelle et pourquoi tu le crois).',
  'LIBRE : l\'idee que les morts du parent te suggerent le plus fortement, quelle qu\'elle soit.'];
/* (2026-11-25, relecture) LES MORTS D'UNE COURSE, toutes : une course reprise par la seconde chance puis coupee par le temps finit « temps », mais
   elle est morte une fois et y a perdu un palier. labo.js (resumeCourse) garde la liste ; une ligne d'avant le 25/11 ne l'a pas (« ? »). */
const enMots=m=>`morte a ${m.t} s (${m.cause}, ${m.carte||'?'}, ${m.enVol?'en vol':'au sol'})`;
function mortsDe(c){if(!Array.isArray(c.morts))return '';const R=c.morts.filter(m=>m.reprise);return R.length?' · '+R.map(m=>enMots(m)+' puis reprise par la seconde chance').join(' ; '):'';}
function resumeMorts(P){
  const C=P.courses||[];if(!C.some(c=>Array.isArray(c.morts)))return '(les courses de ce parent ont ete inscrites avant le 25/11 : leurs morts reprises ne sont pas connues)';
  const reprises=C.reduce((s,c)=>s+(c.morts||[]).filter(m=>m.reprise).length,0),mortes=C.filter(c=>(c.morts||[]).length).length;
  return `${mortes} course(s) sur ${C.length} sont mortes au moins une fois · secondes chances prises : ${reprises}`+(reprises?` (chacune a coute un palier ; la note compte le plus haut palier atteint)`:'')
    +(reprises?`\npremieres morts : ${C.filter(c=>(c.morts||[]).length).map(c=>'graine '+c.graine+' '+enMots(c.morts[0])).join(' ; ')}`:'');}
function blocParent(P,src,autop){
  return `# LE PILOTE PARENT : ${P.id} « ${P.nom} »\n\n## Sa note (${P.note.parties} courses, ${P.tmax} s au plus, regime ${(P.jeu&&P.jeu.regime)||'?'})\n${lignes(P.note).join('\n')}\n${resumeMorts(P)}\n\n`
    +(Array.isArray(P.note.ecart_detail)&&P.note.ecart_detail.length?`## Son ecart aux joueurs : ${P.note.ecart_joueurs} (z = a combien d'ecarts-types des joueurs au clavier, le plus loin d'abord ; + = plus qu'eux)\n${P.note.ecart_detail.map(x=>`z ${x.z>=0?'+':''}${x.z} · ${x.nom} : le pilote ${x.bot}, les joueurs ${x.joueurs}`).join('\n')}\n\n`:'')
    +`## Ses courses\n${P.courses.map(c=>`graine ${c.graine} · ${(c.cartes||[]).join('>')} · ${c.duree_s} s · fin ${c.cause} · ${c.pieces} pieces`+mortsDe(c)+(c.fin?` · finit sur ${c.fin.carte}${c.fin.enVol?' en vol':' au sol'}`:'')).join('\n')}\n\n`
    +`## Les dernieres secondes de ses pires courses (ce qu'il voyait, ce qu'il a ordonne)\n${autop.join('\n\n---\n\n')}\n\n`
    +`## Ce qui a deja ete tente a cette etape (ne refais pas ce qui a echoue)\n${dejaTente()||'(rien encore)'}\n\n`
    +`## Son code\n\`\`\`js\n${src}\n\`\`\`\n`;}
function consigneDe(k){
  return `# TA TACHE\n\nEcris UNE variante de ce pilote qui fait monter « ${CRITERE} » (le palier d'une partie ordinaire) sans faire baisser son record.\n`
    +`L'angle de cette variante : ${(CRITERE==='mixte'?ANGLES_MIXTE:ANGLES)[k%(CRITERE==='mixte'?ANGLES_MIXTE:ANGLES).length]}\n`+(opt('consigne',null)?`Precision pour ce lancement : ${opt('consigne')}\n`:'')
    +(CRITERE==='mixte'?`\n« mixte » = le palier median MOINS ${POIDS} fois l'ecart aux joueurs (le tableau « Son ecart aux joueurs » ci-dessus : 0 = au milieu des joueurs sur les quinze mesures). Rapprocher le pilote des joueurs compte donc autant que le faire survivre : une variante qui vole, coupe et tient la nitro comme eux en perdant un palier est MEILLEURE ; une variante qui gagne un palier en devenant plus frileuse est MOINS BONNE.\n`:'')
    +`\nUne seule idee, expliquee. Le fichier doit etre complet et se suffire (il remplace celui du parent).\n`
    +(MAIN_LIBRE?'':`Garde le \`profil\` du parent inchange (ou son absence) : la main est fixee a cette etape, une variante dont la main change est refusee sans etre notee.\n`)
    +`Reponds EXACTEMENT sous cette forme, sans rien d'autre avant ni apres :\n\nRAISON: <une ou deux phrases : ce que tu changes et pourquoi, pour quelqu'un qui n'a pas lu le code>\n\`\`\`js\n<le fichier complet du pilote>\n\`\`\`\n`;}

let client=null,Anthropic=null,sansRepli=false;
/* UN APPEL. Reflexion adaptative, effort regle, reponse en flux (une longue reponse depasserait le delai d'une requete simple).
   Le « repli » (fallbacks: "default") : si un filtre de securite refuse la demande, l'API la rejoue sur un autre modele dans le meme appel —
   active par defaut sur les modeles qui le proposent ; s'il est refuse par l'API on s'en passe et on le dit. */
async function demande(parent,k){
  const params={model:MODELE,max_tokens:32000,thinking:{type:'adaptive'},output_config:{effort:EFFORT},
    system:[{type:'text',text:SYSTEME,cache_control:{type:'ephemeral'}}],
    messages:[{role:'user',content:[{type:'text',text:parent,cache_control:{type:'ephemeral'}},{type:'text',text:consigneDe(k)}]}]};
  const repli=!sansRepli&&/^claude-(opus-5-5|opus-5|sonnet-5-5|fable-5-2|fable-5-1)$/.test(MODELE);
  let msg;
  try{msg=await (repli?client.beta.messages.stream(Object.assign({betas:['server-side-fallback-2026-07-01'],fallbacks:'default'},params)):client.messages.stream(params)).finalMessage();}
  catch(e){
    if(e instanceof Anthropic.AuthenticationError||e instanceof Anthropic.PermissionDeniedError)throw e;          /* la cle : inutile d'insister */
    if(e instanceof Anthropic.BadRequestError&&repli){sansRepli=true;dire('le repli n\'est pas accepte ici ('+e.message.slice(0,90)+') : on continue sans');return demande(parent,k);}
    if(e instanceof Anthropic.RateLimitError){dire('limite de debit : une minute d\'attente');await new Promise(r=>setTimeout(r,60000));return demande(parent,k);}
    if(e instanceof Anthropic.APIError){return {erreur:'API '+e.status+' : '+String(e.message).slice(0,160),usage:null};}
    return {erreur:'reseau : '+String(e&&e.message||e).slice(0,160),usage:null};}
  const texte=msg.content.filter(b=>b.type==='text').map(b=>b.text).join('');
  if(msg.stop_reason==='refusal')return {erreur:'demande refusee par un filtre ('+((msg.stop_details&&msg.stop_details.category)||'?')+')',usage:msg.usage,texte};
  if(msg.stop_reason==='max_tokens')return {erreur:'reponse coupee (trop longue)',usage:msg.usage,texte};
  return {texte,usage:msg.usage,modele:msg.model};}

/* ----- la boucle ----- */
(async function(){
  fs.mkdirSync(TRAVAIL,{recursive:true});
  if(!BLANC){
    const S=require('@anthropic-ai/sdk');Anthropic=S.default||S;
    try{client=new Anthropic({maxRetries:4});}catch(e){
      dire('pas de cle d\'API dans l\'environnement. Sacha la pose lui-meme, une fois, dans PowerShell :\n    setx ANTHROPIC_API_KEY "sa-cle"\n  puis rouvre le terminal. (console.anthropic.com → API keys)');process.exit(1);}}
  /* LE PLAFOND GENERAL (2026-11-24, Sacha : « tous les 200 credits API en 2 semaines ») : la boucle tourne seule, nuit apres nuit ; ce qu'elle a deja
     depense est au journal (toutes etapes), et aucun lancement ne peut faire passer le total au-dessus du plafond. */
  if(!BLANC){const deja=L.depenses().total,reste=r2(PLAFOND-deja);
    if(reste<.25){dire(`le plafond general est atteint : ${deja} € depenses sur ${PLAFOND} €. Rien n'est demande.`);process.exit(0);}
    if(BUDGET>reste){dire(`budget rabote de ${BUDGET} a ${reste} € : ${deja} € deja depenses sur ${PLAFOND} €`);BUDGET=reste;}}
  dire(`${BLANC?'A BLANC (rien n\'est depense, labo jetable '+L.RACINE+')':'budget '+BUDGET+' € · modele '+MODELE+' · effort '+EFFORT} · etape ${ETAPE} · ${NC} variantes par tour · tri ${GT} graines × ${TT} s · note ${NG} graines × ${TMAX} s · regime ${REGIME}`);
  let {P,autres}=meilleur(true);
  if(!P){
    const f=opt('depuis',null);
    if(autres&&f){dire('l\'etape '+ETAPE+' a deja des pilotes, mais aucun note comme ce lancement : choisir une autre --etape, ou relancer avec leur --tmax et leur --regime (rien n\'est fait)');process.exit(1);}
    if(!f||!fs.existsSync(f)){dire('aucun pilote a l\'etape '+ETAPE+' : donne le pilote de depart avec --depuis <fichier.js>');process.exit(1);}
    const ch=chargeable(path.resolve(f));if(ch.erreur){dire('le pilote de depart ne se charge pas : '+ch.erreur);process.exit(1);}
    if(!ch.main&&!MAIN_LIBRE)dire('⚠ le pilote de depart n\'a pas de profil : toute la lignee gardera une main de MACHINE (la main est fixee, --main-libre pour la regler)');
    dire('le pilote de depart est note en grand ('+NG+' graines)…');
    const N=noter(path.resolve(f),NG,TMAX,'depart');if(!N)process.exit(1);
    const src=fs.readFileSync(f,'utf8');
    P=L.inscrire({nom:L.nettoyerNom((src.match(/nom\s*:\s*['"]([^'"]+)['"]/)||[])[1]||'depart')||'depart',source:src,etape:ETAPE,generation:0,parents:[],modele:'main',main:ch.main,
      raison:'Le pilote de depart de l\'etape '+ETAPE+', tel qu\'il a ete donne a la boucle (--depuis).',jeu:jeuDe(N),graines:N.graines,tmax:N.tmax,note:N.note,courses:coursesDe(N),echecs:N.echecs});
    try{L.clore(ETAPE,0,{critere:CRITERE});}catch(e){}
    dire('depart inscrit : '+P.id+' · '+CRITERE+' '+P.note[CRITERE]+' · record '+P.note.palier_record+' · '+mainTxt(ch.main));}
  let depense=0,appels=0,sansProgres=0;const tri={},barreVal={},mainDe={},garageDe={};
  /* LA BARRE DU PARENT SUR LES GRAINES NEUVES : notee une fois par parent (et gardee au journal des validations, role « barre ») */
  function barreDe(Q,fQ){
    if(barreVal[Q.id])return barreVal[Q.id];
    const v=L.lire(L.F.validations).filter(x=>x.id===Q.id&&x.graines&&x.graines.depart===GV&&x.graines.n===NG&&x.tmax===TMAX&&regimeDe(x)===REGIME&&simDe(x)===L.SIMULATEUR).pop();
    if(v)return (barreVal[Q.id]=valeur(v.note));
    dire(`  la barre du parent ${Q.id} sur ${NG} graines neuves (depuis ${GV})…`);
    const N=noter(fQ,NG,TMAX,'val-'+Q.id,GV);if(!N)return null;
    L.valider(Q.id,{jeu:jeuDe(N),graines:N.graines,tmax:N.tmax,note:N.note,courses:coursesDe(N),echecs:N.echecs,etape:ETAPE,role:'barre'});
    return (barreVal[Q.id]=valeur(N.note));}
  for(let tour=1;tour<=TOURS;tour++){
    const gen=Math.max(0,...deLEtape().map(l=>l.generation))+1,srcP=fs.readFileSync(path.join(L.RACINE,P.code),'utf8'),fP=path.join(L.RACINE,P.code);
    if(!(P.id in mainDe)){const ch=chargeable(fP);if(ch.erreur){dire('le parent ne se charge plus ('+ch.erreur+') : arret');break;}mainDe[P.id]=ch.main;garageDe[P.id]=ch.garage||null;}
    const mainP=mainDe[P.id];
    dire(`──── tour ${tour} · generation ${gen} · parent ${P.id} (${CRITERE} ${P.note[CRITERE]}, record ${P.note.palier_record}) · ${mainTxt(mainP)}${MAIN_LIBRE?' (main libre)':''}${BLANC?'':' · depense '+r2(depense)+' € sur '+BUDGET}`);
    /* le parent au tri (une fois par parent) : la barre que les variantes doivent tenir sur les memes graines */
    if(!tri[P.id]){const N=noter(fP,GT,TT,'tri-'+P.id);if(!N){dire('le parent ne se note plus : arret');break;}tri[P.id]=valeur(N.note);}
    /* ses pires courses, racontees */
    const pires=P.courses.slice().sort((x,y)=>x.pieces-y.pieces).slice(0,3),autop=BLANC?['(a blanc : pas d\'autopsie)']:pires.map(c=>autopsie(fP,c.graine));
    const parent=blocParent(P,srcP,autop);
    /* les variantes : la premiere seule (elle ecrit le cache du parent), les autres ensemble */
    const reponses=[];
    const une=async k=>{
      if(BLANC)return {k,texte:'RAISON: a blanc — un jumeau du parent (variante '+k+'), pour verifier la tuyauterie sans rien depenser.\n```js\n/* a blanc '+gen+'.'+k+' */\n'+srcP+'\n```',usage:{input_tokens:0,output_tokens:0}};
      const moyen=appels?depense/appels:.5;if(depense+Math.max(.25,2*moyen)>BUDGET)return {k,stop:true};
      const r=await demande(parent,k);appels++;const c=r.usage?cout(r.usage):0;depense+=c;
      return Object.assign({k,euros:r2(c)},r);};
    reponses.push(await une(0));
    if(!reponses[0].stop){const reste=await Promise.all(Array.from({length:NC-1},(x,i)=>une(i+1)));reponses.push(...reste);}
    const budgetAtteint=reponses.some(r=>r.stop);
    /* TOUTES les demandes ont echoue (solde a zero, modele inconnu, panne de l'API…) : inutile de continuer a noter le parent pour rien.
       MESURE (24/11) : cle acceptee mais « credit balance is too low » → chaque appel rendait une erreur 400, sans rien depenser. */
    {const faites=reponses.filter(r=>!r.stop);if(!BLANC&&faites.length&&faites.every(r=>r.erreur&&!r.usage)){
      dire('AUCUNE demande n\'a abouti : '+faites[0].erreur+'\n  → rien n\'est depense. Lance `node essai-api.js` pour voir ce que l\'API repond, corrige (solde, cle, modele), puis relance.');break;}}
    /* chaque reponse : lue, chargee, triee */
    const candidats=[];
    for(const r of reponses){if(r.stop)continue;
      const u=r.usage||{},jetons={entree:(u.input_tokens|0)+(u.cache_creation_input_tokens|0)+(u.cache_read_input_tokens|0),sortie:u.output_tokens|0,euros:r.euros||0};
      const v=r.erreur?null:lit(r.texte);
      let rate=r.erreur||(!v?'reponse sans RAISON ou sans bloc de code':null),f=null,mainV=null;
      if(!rate){f=path.join(TRAVAIL,`${ETAPE}-g${gen}-k${r.k}.js`);fs.writeFileSync(f,v.code);const ch=chargeable(f);rate=ch.erreur;mainV=ch.main;
        if(!rate&&!MAIN_LIBRE&&mainV!==mainP)rate=`main changee : ${mainTxt(mainV)} au lieu de ${mainTxt(mainP)} (la main est fixee a cette etape)`;
        /* (2026-11-26, LE GARAGE) les figures equipees sont fixees comme la main : une figure plus chere rapporte plus d'aura, donc plus de pieces par
           pose — changer de garage monterait le palier sans mieux conduire */
        if(!rate&&!MAIN_LIBRE&&(ch.garage||null)!==(garageDe[P.id]||null))rate=`garage change : ${ch.garage||'celui du debutant'} au lieu de ${garageDe[P.id]||'celui du debutant'} (les figures equipees sont fixees a cette etape)`;}
      if(rate){dire(`  variante ${r.k} : PERDUE (${rate}) · ${jetons.euros} €`);
        if(!BLANC)L.depense({etape:ETAPE,generation:gen,modele:MODELE,entree:jetons.entree,sortie:jetons.sortie,euros:jetons.euros,pour:'variante perdue : '+rate});
        if(r.texte)fs.writeFileSync(path.join(TRAVAIL,`${ETAPE}-g${gen}-k${r.k}-perdue.txt`),r.texte);continue;}
      const N=noter(f,GT,TT,`tri-${ETAPE}-g${gen}-k${r.k}`);
      if(!N){if(!BLANC)L.depense({etape:ETAPE,generation:gen,modele:MODELE,entree:jetons.entree,sortie:jetons.sortie,euros:jetons.euros,pour:'variante perdue : ne se note pas'});continue;}
      candidats.push({k:r.k,f,v,N,val:valeur(N.note),jetons,texte:r.texte,main:mainV});
      dire(`  variante ${r.k} : tri ${CRITERE} ${N.note[CRITERE]} (parent ${tri[P.id][0]}) · ${jetons.euros} € — ${v.raison.slice(0,110)}`);}
    /* les promues : au moins aussi bien que le parent au tri, le tiers du haut au plus */
    const promues=candidats.filter(c=>auMoins(c.val,tri[P.id])).sort((x,y)=>mieux(x.val,y.val)?-1:1).slice(0,Math.max(1,Math.ceil(NC/3)));
    for(const c of candidats){
      const grand=promues.includes(c);let N=c.N,lot='tri';
      if(grand){dire(`  variante ${c.k} : notee en grand…`);const G=noter(c.f,NG,TMAX,`note-${ETAPE}-g${gen}-k${c.k}`);if(G){N=G;lot='entrainement';}}
      try{const l=L.inscrire({nom:L.nettoyerNom(((c.v.code.match(/nom\s*:\s*['"]([^'"]+)['"]/)||[])[1])||'pilote')||'pilote',source:c.v.code,etape:ETAPE,generation:gen,parents:[P.id],
          modele:BLANC?'a-blanc':MODELE,main:c.main,raison:c.v.raison,lot:lot,jeu:jeuDe(N),graines:N.graines,tmax:N.tmax,note:N.note,courses:coursesDe(N),echecs:N.echecs,cout:c.jetons,
          echange:{modele:MODELE,effort:EFFORT,angle:(CRITERE==='mixte'?ANGLES_MIXTE:ANGLES)[c.k%(CRITERE==='mixte'?ANGLES_MIXTE:ANGLES).length],parent:P.id,reponse:c.texte}});
        dire(`  inscrit ${l.id} (${lot}) : ${CRITERE} ${N.note[CRITERE]} · record ${N.note.palier_record} · survie ${N.note.survie_mediane_s} s`);}
      catch(e){dire('  inscription refusee : '+String(e.message||e));
        if(!BLANC)try{L.depense({etape:ETAPE,generation:gen,modele:MODELE,entree:c.jetons.entree,sortie:c.jetons.sortie,euros:c.jetons.euros,pour:'variante payee, inscription refusee'});}catch(e2){}}}
    try{const g=L.clore(ETAPE,gen,{critere:CRITERE});dire('  generation '+gen+' close · '+g.gardes.length+' course(s) gardee(s)');}catch(e){dire('  cloture : '+String(e.message||e));}
    spawnSync(process.execPath,[path.join(__dirname,'..','labo','arbre.js')],{stdio:'ignore',env:process.env});
    /* LA VALIDATION (2026-11-25, relecture) : les notees en grand de cette generation qui battent le parent, la meilleure d'abord, sont renotees
       sur NG graines NEUVES ; la premiere qui y tient la barre du parent (notee sur ces memes graines) est sacree. Les deux chiffres au journal
       (validations.jsonl : role « candidat », tient, barre). A blanc, la meilleure est validee meme sans battre le parent : pour exercer le chemin. */
    const nees=deLEtape().filter(l=>l.generation===gen&&l.lot==='entrainement'&&l.tmax===TMAX&&regimeDe(l)===REGIME&&simDe(l)===L.SIMULATEUR).sort((x,y)=>mieux(valeur(x.note),valeur(y.note))?-1:1);
    const aValider=nees.filter(l=>mieux(valeur(l.note),valeur(P.note))).concat(BLANC&&nees.length&&!mieux(valeur(nees[0].note),valeur(P.note))?[nees[0]]:[]);
    let sacre=null;
    for(const M of aValider){
      const barre=barreDe(P,fP);if(!barre){dire('  la barre du parent sur les graines neuves n\'a pas abouti : pas de validation ce tour');break;}
      dire(`  validation de ${M.id} sur ${NG} graines neuves (depuis ${GV})…`);
      const N=noter(path.join(L.RACINE,M.code),NG,TMAX,'val-'+M.id,GV);if(!N){dire('  la validation de '+M.id+' n\'a pas abouti');continue;}
      const vM=valeur(N.note),tient=auMoins(vM,barre),bat=mieux(valeur(M.note),valeur(P.note));
      L.valider(M.id,{jeu:jeuDe(N),graines:N.graines,tmax:N.tmax,note:N.note,courses:coursesDe(N),echecs:N.echecs,etape:ETAPE,role:'candidat',parent:P.id,tient:tient&&bat,barre:barre,
        entrainement:valeur(M.note),parent_entrainement:valeur(P.note)});
      dire(`  validation de ${M.id} : ${CRITERE} ${vM[0]} (record ${vM[1]}, survie ${vM[2]} s) contre ${barre[0]} (record ${barre[1]}, survie ${barre[2]} s) pour le parent sur les memes graines neuves → ${tient?'TIENT':'NE TIENT PAS'}${bat?'':' (a blanc : ne battait pas le parent a l\'entrainement)'}`);
      if(tient&&bat){sacre=M;break;}}
    if(sacre){dire(`  ★ NOUVEAU CHAMPION ${sacre.id} : ${CRITERE} ${P.note[CRITERE]} → ${sacre.note[CRITERE]} a l'entrainement (record ${sacre.note.palier_record}), valide sur des graines neuves`);P=sacre;sansProgres=0;}
    else{sansProgres++;dire('  pas de progres ce tour ('+sansProgres+' de suite)');}
    if(!BLANC&&!a('sans-commit'))try{
      if(execFileSync('git',['branch','--show-current'],{cwd:L.DEPOT,encoding:'utf8'}).trim()==='bots-ecurie'){
        execFileSync('git',['add','ml/labo/journal','ml/labo/cerveaux','ml/labo/rejeux','ml/labo/trajectoires','ml/labo/arbre.html'],{cwd:L.DEPOT});
        execFileSync('git',['commit','-q','-m',`BOTS-ML boucle : etape ${ETAPE}, generation ${gen} — champion ${P.id} (${CRITERE} ${P.note[CRITERE]}, record ${P.note.palier_record}), ${r2(depense)} € depenses ce lancement`],{cwd:L.DEPOT});
      }else dire('  (pas de commit : la branche n\'est pas bots-ecurie)');}catch(e){}
    if(budgetAtteint){dire('le budget de ce lancement est atteint');break;}
    if(sansProgres>=PATIENCE){dire(PATIENCE+' tours sans progres : arret');break;}}
  const dep=L.depenses();
  dire(`FIN · champion ${P.id} : ${CRITERE} ${P.note[CRITERE]}, record ${P.note.palier_record} · ce lancement : ${r2(depense)} € en ${appels} appel(s) · depuis le debut : ${dep.total} € (estimation ; la facture fait foi)`);
  process.exit(0);
})().catch(e=>{
  if(Anthropic&&(e instanceof Anthropic.AuthenticationError||e instanceof Anthropic.PermissionDeniedError))dire('la cle d\'API est refusee ('+e.status+') : verifie-la sur console.anthropic.com. Rien d\'autre n\'a ete depense.');
  else dire('ERREUR : '+String(e&&e.stack||e));process.exit(1);});
