/* (28/11/2026, etude « avant le bord ») COPIE de ../../sortie-preparee/pilote-diag.js : seul le chemin de ml/evolution change (un dossier de plus). */
/* ===== LE PILOTE DE DIAGNOSTIC (28/11/2026, etude « sortie preparee », le mesureur) =====
   Le texte du pilote ne du genome c0025 (genome.js : genomeTemoin puis ecrirePilote ; v:4, tous les genes a leur naissance, id 19e3767cc346), PLUS
   les lignes de DIAG_CODE, ajoutees APRES module.exports : elles enveloppent decide, recopient dans le champ « diag » de l'ordre rendu quelques
   cases de la memoire du pilote, et ne changent ni la memoire, ni aucun autre champ de l'ordre. L'hote (course-diag.js) retire « diag » avant que
   piloter.js lise l'ordre. Rien n'est ecrit dans ml/evolution. */
'use strict';
const path=require('path'),crypto=require('crypto');
const EVO=path.join(__dirname,'..','..','..','..','evolution');

const DIAG_CODE=`
/* ===== LE DIAGNOSTIC DE L'ETUDE « SORTIE PREPAREE » (28/11/2026) : il RECOPIE, il ne decide rien =====
   Le champ « diag » de l'ordre : la facon tenue (f) depuis (tf), le vol voulu (vo), le raccourci engage (so), la nitro voulue au sol (mn), les
   mauvaises vues (ma), les raccourcis engages (nr), le dernier abandon (ta). L'hote le retire avant que l'ordre aille a la main. */
{const d0=module.exports.decide;
  module.exports.decide=function(vue,m){const o=d0(vue,m);
    try{if(o&&typeof o==='object'){const s=m.sortie;
      o.diag={f:m.facon==null?null:m.facon,tf:m.tFacon==null?null:m.tFacon,vo:!!m.voulu,so:s?{c:s.cote,f:s.facon,t0:s.t0,at:s.attente,d:!!s.dessous}:null,
        mn:!!m.nitro,ma:m.mal|0,nr:m.nRacc|0,ta:m.tAbandon==null?null:m.tAbandon};}}catch(e){}
    return o;};}
`;

function piloteC0025(o){
  o=o||{};
  const Cm=require(path.join(EVO,'commun')),Gn=require(path.join(EVO,'genome'));
  const cfg=Cm.lireConfig(null);
  const g=Gn.genomeTemoin(cfg);
  const e=Gn.valider(g,cfg);if(e)throw new Error('pilote-diag : '+e);
  const base=Gn.ecrirePilote(g,{cfg});
  const texte=o.diag?base+DIAG_CODE:base;
  return {id:Gn.idDe(g),texte:texte,sha:Gn.shaPilote(texte),shaBase:Gn.shaPilote(base),
    sha12:crypto.createHash('sha1').update(texte).digest('hex').slice(0,12)};
}
module.exports={piloteC0025,DIAG_CODE};
