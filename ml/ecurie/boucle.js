#!/usr/bin/env node
/* ===== LA BOUCLE AUTOMATIQUE (2026-11-24, Sacha : « il faut que tu utilises les 200 euros dans ton plan » ; « c'est pas le but des credits
   justement de faire du machine learning ? ») =====
   La methode du plan, sans personne devant l'ecran : Claude ECRIT des variantes du pilote (API, credit), le VRAI JEU les note, on garde
   la meilleure, on recommence. Chaque variante entre au labo avec son code, sa raison, sa note, ses courses et SON COUT.
   usage : node boucle.js --budget 20 [--depuis pilote.js] [--etape C] [--tours 20] [--candidats 6] [--modele claude-opus-5-5] [--effort high]
                          [--graines-tri 6 --tmax-tri 600] [--graines 20 --tmax 900] [--regime allege] [--coeurs 4]
                          [--critere palier_median] [--patience 4] [--consigne "une precision pour ce lancement"] [--sans-commit] [--a-blanc]
     --budget      OBLIGATOIRE (sauf --a-blanc) : le plafond de CE lancement, en euros. La boucle s'arrete avant de le depasser.
     --depuis      le pilote de depart, la premiere fois (ensuite le parent est le meilleur de l'etape, lu au journal)
     --a-blanc     tout sauf l'appel payant : des jumeaux du parent, 2 graines de 40 s, dans un labo jetable. Pour verifier la tuyauterie.
   UN TOUR : (1) le parent = le meilleur de l'etape ; (2) ses pires courses sont autopsiees ; (3) N variantes sont demandees a Claude, chacune
   sous un angle different ; (4) TRI : chaque variante sur peu de graines ; (5) celles qui font au moins aussi bien que le parent au tri sont
   notees EN GRAND (20 graines) ; (6) toutes sont inscrites (les eliminees avec leur note de tri, lot « tri ») ; (7) la generation est close,
   l'arbre refait, le labo valide dans git.
   L'ARGENT : compte a chaque reponse d'apres les jetons factures (TARIFS, dollars par million de jetons ; 1 € compte pour 1 $, prudent).
   C'est une ESTIMATION : la facture fait foi (console.anthropic.com). La cle se lit dans l'environnement (ANTHROPIC_API_KEY) : elle n'est
   jamais ecrite dans un fichier, un journal ou un message.
   LE FREIN : ce n'est pas l'argent, c'est le PC. Une variante = plusieurs minutes de jeu sur tous les coeurs. Compter ~20 a 30 variantes par nuit. */
const fs=require('fs'),path=require('path'),{spawnSync,execFileSync}=require('child_process');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;},a=n=>A.includes('--'+n);
const BLANC=a('a-blanc');
if(BLANC&&!process.env.LABO_DIR)process.env.LABO_DIR=path.join(__dirname,'..','labo','tampon','a-blanc'); /* jamais le vrai journal */
const L=require('../labo/labo'),{lignes}=require('../bot/mesures');
const BOT=path.join(__dirname,'..','bot'),TRAVAIL=path.join(L.D.tampon,'boucle');
const ETAPE=String(opt('etape','C')),TOURS=+opt('tours',20),NC=+opt('candidats',6),MODELE=opt('modele','claude-opus-5-5'),EFFORT=opt('effort','high');
const GT=+opt('graines-tri',BLANC?2:6),TT=+opt('tmax-tri',BLANC?40:600),NG=+opt('graines',BLANC?2:20),TMAX=+opt('tmax',BLANC?40:900);
const REGIME=opt('regime','allege'),COEURS=+opt('coeurs',4),CRITERE=opt('critere','palier_median'),PATIENCE=+opt('patience',4),BUDGET=+opt('budget',0);
const G0=910000;

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
function noter(fichier,graines,tmax,nom){
  const sortie=path.join(TRAVAIL,nom+'.json');try{fs.unlinkSync(sortie);}catch(e){}
  const r=spawnSync(process.execPath,[path.join(BOT,'noter.js'),fichier,'--graines',String(graines),'--depart',String(G0),'--tmax',String(tmax),'--regime',REGIME,
    '--coeurs',String(COEURS),'--sortie',sortie,'--parties'],{stdio:['ignore','pipe','pipe'],encoding:'utf8'});
  if(r.status!==0||!fs.existsSync(sortie)){dire('la note de '+nom+' n\'a pas abouti : '+String(r.stdout||'').split('\n').slice(-3).join(' | '));return null;}
  return JSON.parse(fs.readFileSync(sortie,'utf8'));}
function autopsie(fichier,graine){
  const r=spawnSync(process.execPath,[path.join(BOT,'autopsie.js'),fichier,'--graine',String(graine),'--tmax',String(TMAX),'--avant','5','--regime',REGIME],{encoding:'utf8',maxBuffer:64e6});
  const t=String(r.stdout||'');const i=t.indexOf('cerveau «');return (i>=0?t.slice(i):t).slice(0,7000);}
/* la valeur d'une note : le critere, puis le record, puis la survie — pour departager */
const valeur=n=>[n[CRITERE]||0,n.palier_record||0,n.survie_mediane_s||0];
const mieux=(x,y)=>{for(let i=0;i<x.length;i++){if(x[i]!==y[i])return x[i]>y[i];}return false;};
const auMoins=(x,y)=>!mieux(y,x);
function chargeable(f){const r=spawnSync(process.execPath,['-e','require('+JSON.stringify(path.join(BOT,'piloter.js'))+').charger('+JSON.stringify(f)+')'],{encoding:'utf8'});
  return r.status===0?null:String(r.stderr||'').split('\n').filter(l=>/Error/.test(l)).slice(0,1).join(' ')||'ne se charge pas';}
const coursesDe=N=>N.parties.map((p,i)=>({bilan:N.courses[i],partie:p.partie,touches:p.touches}));
const jeuDe=N=>Object.assign({},L.versionJeu(),{version:N.jeu,regime:N.regime||REGIME});

/* ----- le journal : le parent, la suite des generations, ce qui a deja ete tente ----- */
const deLEtape=()=>L.lire(L.F.cerveaux).filter(l=>l.etape===ETAPE);
function meilleur(){let b=null;for(const l of deLEtape())if(l.lot==='entrainement'&&(!b||mieux(valeur(l.note),valeur(b.note))))b=l;return b;}
function dejaTente(){return deLEtape().slice(-15).map(l=>{const p=l.parents[0]&&deLEtape().find(x=>x.id===l.parents[0]);
  return `- ${l.id} (generation ${l.generation}, ${l.lot}) : ${l.raison} → ${CRITERE} ${l.note[CRITERE]}, record ${l.note.palier_record}`+(p?` (son parent ${p.id} : ${p.note[CRITERE]})`:'');}).join('\n');}

/* ----- la demande a Claude ----- */
const SYSTEME=fs.readFileSync(path.join(__dirname,'CONSIGNES.md'),'utf8')+'\n\n# LE MODE D\'EMPLOI DU BOT (ml/bot/README.md) — la vue, les gestes, le profil\n\n'+fs.readFileSync(path.join(BOT,'README.md'),'utf8');
const ANGLES=[
  'LA SURVIE EN VOL : sers-toi du radar de la vue pour choisir, a chaque decision en vol, la facon de piloter qui finit par une pose ; et pour ne pas decoller quand aucune issue n\'est bonne.',
  'LA VITESSE AVANT LES VIRAGES : anticipe (vitesse sure, rayon a venir), lache la nitro ou drifte AVANT le virage, pour ne plus sortir de la route sans le vouloir.',
  'LA LIGNE PARFAITE ET LA NITRO : prends les fruits et les plaques de la ligne pour tenir la nitro comme un joueur (60 % du temps), sans y laisser la route.',
  'LE FIL DES PIECES : ramasse davantage (viser plus tot a grande vitesse, l\'aimant, ne pas quitter le fil pour un objet qui ne rapporte pas de piece).',
  'LA MAP QUI TUE LE PLUS le parent (lis ses fins) : une regle propre a cette map, et seulement a elle.',
  'VOLER COMME UN JOUEUR SANS MOURIR : des sorties par le bord choisies (quand le radar promet une pose), une pose dans l\'axe et au centre.',
  'ALLEGER : retire ou simplifie une regle du parent qui ne sert pas ou qui coute des courses (dis laquelle et pourquoi tu le crois).',
  'LIBRE : l\'idee que les morts du parent te suggerent le plus fortement, quelle qu\'elle soit.'];
function blocParent(P,src,autop){
  return `# LE PILOTE PARENT : ${P.id} « ${P.nom} »\n\n## Sa note (${P.note.parties} courses, ${P.tmax} s au plus, regime ${(P.jeu&&P.jeu.regime)||'?'})\n${lignes(P.note).join('\n')}\n\n`
    +`## Ses courses\n${P.courses.map(c=>`graine ${c.graine} · ${(c.cartes||[]).join('>')} · ${c.duree_s} s · fin ${c.cause} · ${c.pieces} pieces`+(c.fin?` · finit sur ${c.fin.carte}${c.fin.enVol?' en vol':' au sol'}`:'')).join('\n')}\n\n`
    +`## Les dernieres secondes de ses pires courses (ce qu'il voyait, ce qu'il a ordonne)\n${autop.join('\n\n---\n\n')}\n\n`
    +`## Ce qui a deja ete tente a cette etape (ne refais pas ce qui a echoue)\n${dejaTente()||'(rien encore)'}\n\n`
    +`## Son code\n\`\`\`js\n${src}\n\`\`\`\n`;}
function consigneDe(k){
  return `# TA TACHE\n\nEcris UNE variante de ce pilote qui fait monter « ${CRITERE} » (le palier d'une partie ordinaire) sans faire baisser son record.\n`
    +`L'angle de cette variante : ${ANGLES[k%ANGLES.length]}\n`+(opt('consigne',null)?`Precision pour ce lancement : ${opt('consigne')}\n`:'')
    +`\nUne seule idee, expliquee. Le fichier doit etre complet et se suffire (il remplace celui du parent).\n`
    +`Reponds EXACTEMENT sous cette forme, sans rien d'autre avant ni apres :\n\nRAISON: <une ou deux phrases : ce que tu changes et pourquoi, pour quelqu'un qui n'a pas lu le code>\n\`\`\`js\n<le fichier complet du pilote>\n\`\`\`\n`;}
function lit(texte){const m=/RAISON\s*:\s*([\s\S]*?)\r?\n```(?:js|javascript)?\r?\n([\s\S]*?)\r?\n```/.exec(texte||'');return m?{raison:m[1].trim().replace(/\s+/g,' '),code:m[2]}:null;}

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
  dire(`${BLANC?'A BLANC (rien n\'est depense, labo jetable '+L.RACINE+')':'budget '+BUDGET+' € · modele '+MODELE+' · effort '+EFFORT} · etape ${ETAPE} · ${NC} variantes par tour · tri ${GT} graines × ${TT} s · note ${NG} graines × ${TMAX} s · regime ${REGIME}`);
  let P=meilleur();
  if(!P){
    const f=opt('depuis',null);if(!f||!fs.existsSync(f)){dire('aucun pilote a l\'etape '+ETAPE+' : donne le pilote de depart avec --depuis <fichier.js>');process.exit(1);}
    dire('le pilote de depart est note en grand ('+NG+' graines)…');
    const N=noter(path.resolve(f),NG,TMAX,'depart');if(!N)process.exit(1);
    const src=fs.readFileSync(f,'utf8');
    P=L.inscrire({nom:((src.match(/nom\s*:\s*['"]([^'"]+)['"]/)||[])[1]||'depart').replace(/[^a-z0-9-]/gi,'-'),source:src,etape:ETAPE,generation:0,parents:[],modele:'main',
      raison:'Le pilote de depart de l\'etape '+ETAPE+', tel qu\'il a ete donne a la boucle (--depuis).',jeu:jeuDe(N),graines:N.graines,tmax:N.tmax,note:N.note,courses:coursesDe(N),echecs:N.echecs});
    try{L.clore(ETAPE,0,{critere:CRITERE});}catch(e){}
    dire('depart inscrit : '+P.id+' · '+CRITERE+' '+P.note[CRITERE]+' · record '+P.note.palier_record);}
  let depense=0,appels=0,sansProgres=0;const tri={};
  for(let tour=1;tour<=TOURS;tour++){
    const gen=Math.max(0,...deLEtape().map(l=>l.generation))+1,srcP=fs.readFileSync(path.join(L.RACINE,P.code),'utf8'),fP=path.join(L.RACINE,P.code);
    dire(`──── tour ${tour} · generation ${gen} · parent ${P.id} (${CRITERE} ${P.note[CRITERE]}, record ${P.note.palier_record})${BLANC?'':' · depense '+r2(depense)+' € sur '+BUDGET}`);
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
      let rate=r.erreur||(!v?'reponse sans RAISON ni code':null),f=null;
      if(!rate){f=path.join(TRAVAIL,`${ETAPE}-g${gen}-k${r.k}.js`);fs.writeFileSync(f,v.code);rate=chargeable(f);}
      if(rate){dire(`  variante ${r.k} : PERDUE (${rate}) · ${jetons.euros} €`);
        if(!BLANC)L.depense({etape:ETAPE,generation:gen,modele:MODELE,entree:jetons.entree,sortie:jetons.sortie,euros:jetons.euros,pour:'variante perdue : '+rate});
        if(r.texte)fs.writeFileSync(path.join(TRAVAIL,`${ETAPE}-g${gen}-k${r.k}-perdue.txt`),r.texte);continue;}
      const N=noter(f,GT,TT,`tri-${ETAPE}-g${gen}-k${r.k}`);
      if(!N){if(!BLANC)L.depense({etape:ETAPE,generation:gen,modele:MODELE,entree:jetons.entree,sortie:jetons.sortie,euros:jetons.euros,pour:'variante perdue : ne se note pas'});continue;}
      candidats.push({k:r.k,f,v,N,val:valeur(N.note),jetons,texte:r.texte});
      dire(`  variante ${r.k} : tri ${CRITERE} ${N.note[CRITERE]} (parent ${tri[P.id][0]}) · ${jetons.euros} € — ${v.raison.slice(0,110)}`);}
    /* les promues : au moins aussi bien que le parent au tri, le tiers du haut au plus */
    const promues=candidats.filter(c=>auMoins(c.val,tri[P.id])).sort((x,y)=>mieux(x.val,y.val)?-1:1).slice(0,Math.max(1,Math.ceil(NC/3)));
    for(const c of candidats){
      const grand=promues.includes(c);let N=c.N,lot='tri';
      if(grand){dire(`  variante ${c.k} : notee en grand…`);const G=noter(c.f,NG,TMAX,`note-${ETAPE}-g${gen}-k${c.k}`);if(G){N=G;lot='entrainement';}}
      try{const l=L.inscrire({nom:(((c.v.code.match(/nom\s*:\s*['"]([^'"]+)['"]/)||[])[1])||'pilote').replace(/[^a-z0-9-]/gi,'-'),source:c.v.code,etape:ETAPE,generation:gen,parents:[P.id],
          modele:BLANC?'a-blanc':MODELE,raison:c.v.raison,lot:lot,jeu:jeuDe(N),graines:N.graines,tmax:N.tmax,note:N.note,courses:coursesDe(N),echecs:N.echecs,cout:c.jetons,
          echange:{modele:MODELE,effort:EFFORT,angle:ANGLES[c.k%ANGLES.length],parent:P.id,reponse:c.texte}});
        dire(`  inscrit ${l.id} (${lot}) : ${CRITERE} ${N.note[CRITERE]} · record ${N.note.palier_record} · survie ${N.note.survie_mediane_s} s`);}
      catch(e){dire('  inscription refusee : '+String(e.message||e));}}
    try{const g=L.clore(ETAPE,gen,{critere:CRITERE});dire('  generation '+gen+' close · '+g.gardes.length+' course(s) gardee(s)');}catch(e){dire('  cloture : '+String(e.message||e));}
    spawnSync(process.execPath,[path.join(__dirname,'..','labo','arbre.js')],{stdio:'ignore',env:process.env});
    const M=meilleur();
    if(M&&M.id!==P.id&&mieux(valeur(M.note),valeur(P.note))){dire(`  ★ NOUVEAU CHAMPION ${M.id} : ${CRITERE} ${P.note[CRITERE]} → ${M.note[CRITERE]} (record ${M.note.palier_record})`);P=M;sansProgres=0;}
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
