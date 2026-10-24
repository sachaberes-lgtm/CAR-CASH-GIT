/* preuve : la VRAIE explode() (extraite de VERSION PRINCIPALE/index.html) laisse le bouclier de la seconde chance passer AVANT les remises
   à zéro du demi-tour, du SLIDE et de la glisse — un choc ignoré pendant la reprise ne coupe plus rien ; une vraie mort les fait toujours. */
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(process.argv[2]||__dirname+'/../../VERSION PRINCIPALE/index.html','utf8');
const i=html.indexOf('function explode(cause){'),j=html.indexOf('\nfunction boomDetone(',i);
if(i<0||j<i){console.log('PREUVE SANS OBJET — explode() introuvable');process.exit(0);}
const src=html.slice(i,j);
const ok=(c,m)=>{console.log((c?'OK   ':'ÉCHEC ')+m);if(!c)process.exitCode=1;};
function essai(bouclier){
  const appels=[];
  const ctx={appels,
    dmtCoupe:()=>appels.push('dmt'),slideRaz:()=>appels.push('slide'),bkSkateRaz:()=>appels.push('skate'),
    chanceProtege:()=>{appels.push('bouclier');return bouclier;},
    RALENTI:{set t(v){appels.push('suite');throw new Error('STOP');}}}; /* la suite d'explode (vraie mort) : on s'arrête là */
  vm.runInNewContext(src+'\ntry{explode("tour");}catch(e){if(e.message!=="STOP")throw e;}',ctx);
  return appels;
}
const a=essai(true);
ok(a.join()==='bouclier','pendant le bouclier, un choc ne touche ni au demi-tour, ni au SLIDE, ni à la glisse ('+a.join(' → ')+')');
const b=essai(false);
ok(b.indexOf('dmt')>=0&&b.indexOf('slide')>=0&&b.indexOf('skate')>=0&&b.indexOf('suite')>b.indexOf('skate'),'hors bouclier, la vraie mort remet toujours tout à zéro avant la suite ('+b.join(' → ')+')');
console.log(process.exitCode?'PREUVE KO':'PREUVE OK — le bouclier passe avant les remises à zéro');
