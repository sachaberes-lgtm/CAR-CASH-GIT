/* Captures App Store (1320x2868 debout, 2868x1320 couché) — UN passage groupé, son coupé, via le banc commun.
   node captures.cjs   (CC_PORT = port d'un serveur statique sur « VERSION PRINCIPALE », 8770 par défaut ; CC_QUI=VITRINE) */
process.env.CC_PORT=process.env.CC_PORT||'8770';process.env.CC_QUI=process.env.CC_QUI||'VITRINE';
const B=require('C:/Users/sacha/cc-banc/lib.cjs'),path=require('path');
const OUT=path.join(__dirname,'..','captures');
const VUES=[['01-accueil',null],['02-nuages-soir','carte=nuages&meteo=soir'],['03-ville-nuit','carte=ville&meteo=nuit'],['04-jade-matin','carte=jade&meteo=matin'],
  ['05-foret-nuit','carte=foret&meteo=nuit'],['06-orbite-soir','carte=espace&meteo=soir'],['07-nuages-orage','carte=nuages&meteo=orage']];
(async()=>{await B._verrou.prend();
  for(const [w,h,nm] of [[440,956,'portrait'],[956,440,'paysage']])for(const [id,q] of VUES){
    const s=await B.ouvre({w,h,dsf:3,lang:'fr',q:(q||'')+(q?'&':'')+'colonne=0',save:{sfx:false,mus:false,vox:false,tuto:1,permis:1,facile:0}});
    try{await B.entre(s);
      if(q){await s.tap('#mHome [data-m="play"]',1500);await s.tap('#modale .modB .pbtn',500);
        await s.attends(()=>typeof dbgState==='function'&&dbgState().started,30000);await s.dort(6500);}
      else await s.dort(1800);
      await s.page.screenshot({path:path.join(OUT,id+'-'+nm+'.png'),type:'png'});console.log('ok',id,nm,s.errs.length?s.errs.slice(0,2):'');
    }catch(e){console.log('KO',id,nm,String(e).slice(0,160));}
    await s.ferme();}
  await B.ferme();})().catch(e=>{console.error('BANC',e);B._verrou.rend();process.exit(1);});
