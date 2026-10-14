// Preuve sans navigateur (accrocs-s3) : trois accrocs S3 de la nuit du 14/10, sur le VRAI code extrait de index.html.
//  A) portPasseNiveau : portail franchi, puis mort (mode='boom') dans les 2 images d'attente → newTrack ne doit PAS repartir
//     (il remet mode='drive' : la caisse explosée n'atteint jamais endGame, qui n'est appelé que depuis la branche mode==='boom').
//  B) fmtGta : un montant à x,995…x,9999 ne doit pas afficher « .100 » (centimes) mais reporter sur l'entier.
//  C) SF.prochain : le tirage d'un nouveau couple (lvlChoisir, branche mode classique) change SF.der → le couple annoncé d'avance
//     doit être invalidé (sinon il ressort au JOUER suivant, calculé contre un ancien der : même map deux fois de suite possible).
// Usage : node preuve-accrocs.cjs "<index.html>"   Sort 0 si tout est bon, 1 sinon.
const fs=require('fs');const src=fs.readFileSync(process.argv[2],'utf8').split('\n');
const fin=(i0,t)=>{let i=i0;while(!t(src[i]))i++;return i;};
const fonction=nom=>{const a=src.findIndex(l=>l.startsWith('function '+nom+'('));if(a<0)throw new Error('introuvable '+nom);return src.slice(a,fin(a,l=>l==='}')+1).join('\n');};
const ko=[];

// ---- A : portPasseNiveau ----
{
  const code=fonction('portPasseNiveau');
  const file=[];const rAF=f=>file.push(f);
  const S={mode:'drive',started:true,gameOver:false,PARK:{on:false},PORTV:{att:0,n:0},nt:0,sortie:0};
  const mk=(S,rAF)=>new Function('S','requestAnimationFrame','with(S){function portVoile(){}function portVoileSort(){S.sortie++;}function newTrack(){S.nt++;mode=\'drive\';}'+code+';return function(){portPasseNiveau();};}')(S,rAF);
  const go=mk(S,rAF);
  // 1) portail franchi en mode 'drive'
  go();
  // 2) la caisse explose pendant les 2 images d'attente (explode() pose mode='boom', gameOver reste faux jusqu'à endGame)
  S.mode='boom';
  while(file.length)file.shift()(); // les rAF imbriqués s'exécutent
  if(S.nt)ko.push('A : newTrack() a été appelé sur une caisse en explosion ('+S.nt+' fois) → mode repassé à \''+S.mode+'\' : plus d\'endGame, elle roule après sa mort');
  if(!S.sortie)ko.push('A : le voile ne s\'ouvre plus (portVoileSort non appelé)');
  // 3) témoin : sans mort, la piste est bien construite
  const S2={mode:'drive',started:true,gameOver:false,PARK:{on:false},PORTV:{att:0,n:0},nt:0,sortie:0};
  const g=mk(S2,rAF);
  g();while(file.length)file.shift()();
  if(S2.nt!==1)ko.push('A (témoin) : sans mort, newTrack doit être appelé une fois, reçu '+S2.nt);
}

// ---- B : fmtGta ----
{
  const code=fonction('fmtGta');
  const fmt=new Function('CUR','LANG',code+';return fmtGta;')(()=>'$','en');
  const txt=h=>h.replace(/<[^>]+>/g,'');
  for(const [v,att] of [[5.998,'00000006'],[5.995,'00000006'],[1.61,'00000001.61'],[999.996,'00001000'],[0.9996,'00000001'],[12.5,'00000012.50']]){
    const r=txt(fmt(v));
    if(/\.\d{3}/.test(r)||/,\d{3}/.test(r)||r!==('$'+att))ko.push('B : fmtGta('+v+') = « '+r+' » (attendu « $'+att+' »)');
  }
}

// ---- C : SF.prochain ----
{
  const a=src.findIndex(l=>l.includes('if(SF.on&&(started||SF.pret)){const zn=')),ligne=src[a+1];
  if(!/^\s*if\(!t\)\{/.test(ligne))throw new Error('ligne tirage non trouvée');
  // le VRAI bloc `if(!t){…}` de lvlChoisir, exécuté avec un SF d'essai
  const bloc=ligne.match(/^\s*(if\(!t\)\{.*?\})\s*(\/\/.*)?$/)[1];
  const SF={on:true,pret:true,tirage:[],der:{carte:'ville',meteo:'jour'},prochain:{carte:'nuages',meteo:'nuit'},force:null};
  const sfTire=prev=>({carte:'espace',meteo:'x'}),sfImpose=sfTire;
  new Function('SF','sfTire','sfImpose','let t=SF.tirage[0];const zn=0;'+bloc)(SF,sfTire,sfImpose);
  if(SF.prochain)ko.push('C : après le tirage d\'une partie (der → '+SF.der.carte+'), SF.prochain vaut encore '+JSON.stringify(SF.prochain)+' (périmé)');
  // témoin : un tirage déjà fait (classiqueJouer) ne touche pas au prochain
  const SF2={on:true,pret:true,tirage:[{carte:'a',meteo:'b'}],der:{carte:'a'},prochain:null,force:null};
  new Function('SF','sfTire','sfImpose','let t=SF.tirage[0];const zn=0;'+bloc)(SF2,sfTire,sfImpose);
  if(SF2.der.carte!=='a')ko.push('C (témoin) : un tirage déjà fait a été retiré');
}
console.log(ko.length?'KO :\n - '+ko.join('\n - '):'OK : portail+mort, centimes et tirage annoncé sont propres');process.exit(ko.length?1:0);
