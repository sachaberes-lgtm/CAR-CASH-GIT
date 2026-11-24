/* ===== LE CERVEAU D'ESSAI DE LA MAIN (2026-11-24, doigts v2, Sacha : « des bots du palier 1 au palier 30 qu'on ne distingue pas de vrais joueurs ») =====
   Il ne sert qu'a MESURER la main (node appuis.js) : ce n'est pas un pilote de l'ecurie. Sa conduite est celle du bot de reference sans ses
   gestes (tenir la route, suivre les pieces, pousser la NITRO dans les droites, revenir se poser) ; sa main est un profil « humain » : les plages
   mesurees sur les joueurs (ml/ecurie/etude/humains.md), ecrites en entier ci-dessous pour servir d'exemple.
   CE QUI EST MESURE dans ce profil : les durees des coups de volant (p10 0,1 s, p50 0,2 s, p90 0,4 s) et les tenues de nitro (p10 0,1 s,
   p50 0,35 a 0,4 s, p90 2,7 a 3,8 s). CE QUI NE L'EST PAS : les temps de reaction, le retard du suivi, les repos et les pauses — des ordres de
   grandeur. La seconde chance est prise A CHAQUE mort (les joueurs : 2 parties sur 12) : expres, pour l'exercer dans chaque course de l'essai. */
const PROFIL={
  modele:'clavier',graine:1,
  reaction:{volant:[120,200,320],nitro:[110,180,300],manche:[150,240,380],geste:[180,260,420]},
  suivi:{actif:true,retard:100},
  coups:{actif:true,duree:[100,200,400],repos:[70,110,200],seuil:.5},
  nitro:{tenue:[100,375,3200],pause:[130,220,500]},
  chance:{prend:1,palierMin:1,delai:[900,1500,3000]}
};
const REGLAGES={marge:9,virageDoux:.22,nitroMin:.2,piqueDelai:2};
const cl=(v,a,b)=>v<a?a:v>b?b:v;

function auSol(vue){
  const R=REGLAGES,max=vue.demi-R.marge;
  const v100=vue.route[2].virage,v150=vue.route[3].virage,v300=vue.route[5].virage;
  /* la ligne : l'interieur du virage qui vient, sinon le milieu ; puis ce qui se ramasse a portee de volant */
  let ligne=cl(v150*60,-max*.7,max*.7);
  const portee=d=>Math.max(4,d*.22),prend=o=>Math.abs(o.lat-vue.lat)<portee(o.d)&&Math.abs(o.lat)<max;
  const file=vue.piecesDevant.find(p=>p.d>20&&p.d<160&&prend(p));
  if(file)ligne=file.lat;
  for(const liste of [vue.fruits,vue.orbes,vue.plaques]){const o=liste.find(x=>x.d>25&&x.d<220&&prend(x));if(o){ligne=o.lat;break;}}
  for(const f of vue.flaques){if(f.d<5||f.d>140)continue;if(Math.abs(f.lat-ligne)<f.rayon+3)ligne=f.lat+(f.lat>0?-1:1)*(f.rayon+5);}
  ligne=cl(ligne,-max,max);
  const droit=Math.abs(v100)<R.virageDoux*.7&&Math.abs(v150)<R.virageDoux&&Math.abs(v300)<R.virageDoux*2.2;
  const pose=Math.abs(vue.lat)<max&&Math.abs(vue.cap)<.18&&!vue.glisse&&!vue.rebond&&!vue.dessous;
  return {ligne:ligne,nitro:droit&&pose&&(vue.nitroLibre||vue.nitro+vue.reserve>R.nitroMin)};
}
function enVol(vue){
  const R=REGLAGES,f=vue.vol,ordre={volant:0,manche:0,nitro:false};
  /* revenir se poser : l'anneau de pose (la main le suit a chaque image : `viser`), sinon la route la plus proche */
  if(f.anneau)ordre.viser=f.anneau;
  else if(f.proche&&Math.abs(f.proche.axe)<1.6){
    ordre.volant=cl((cl(-f.proche.lat/40,-.6,.6)-f.proche.axe)*1.6,-1,1);
    if(Math.abs(f.proche.lat)>vue.demi&&f.proche.haut<4&&f.proche.haut>-12&&vue.nitro>.1)ordre.nitro=true;}
  if(f.proche&&f.proche.haut>10&&Math.abs(f.proche.lat)<vue.demi*2){
    const delaiRoute=f.proche.haut/Math.max(1,f.proche.versRoute);
    if(delaiRoute>R.piqueDelai||delaiRoute>f.reste-1)ordre.manche=-1;}
  return ordre;
}
module.exports={
  nom:'essai-main',
  profil:PROFIL,
  decide:function(vue){return vue.mode==='sol'?auSol(vue):vue.mode==='vol'?enVol(vue):{};}
};
