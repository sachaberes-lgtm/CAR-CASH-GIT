/* scénario : LE RAS DE L'EAU de Pic de Jade (2026-11-05) — node jeu.mjs jade midi 90  (SCRIPT=sc-ras-eau.mjs, EXTRA=&ras=1, OUT=dossier)
   Lance la course au pilote automatique, lit le profil de la route au-dessus de la mer (dbgEau('profil')) et photographie la caisse quand elle
   passe le point le plus bas : la route doit y être à ~7 m au-dessus de l'eau (JADE_RAS.haut). */
export default async function(H,[carte,meteo,secs]){
  await H.jouer();await H.ev('dbgAuto(1,0);1');
  let info=null;for(let i=0;i<120&&!info;i++){await H.sleep(1000);info=await H.ev(`(function(){var j=dbgJade();return j&&j.eauY!=null?JSON.stringify({eauY:j.eauY,merY:j.merY,L:j.L,mods:j.mods,prof:dbgEau('profil')}):null;})()`).catch(()=>null);}
  console.log('profil',info);if(!info)return;
  const o=JSON.parse(info);if(!o.mods||o.mods.indexOf('ras')<0){console.log('PAS DE RAS dans cette vallée');return;}
  const mn=Math.min.apply(null,o.prof),k=o.prof.indexOf(mn),tgt=k/40*o.L;
  console.log('point le plus bas : ',mn,'m au-dessus de l\'eau, à ~',Math.round(tgt),'m sur',o.L);
  const t0=Date.now();let n=0;
  while((Date.now()-t0)/1000<+secs){await H.sleep(1000);
    const st=JSON.parse(await H.ev(`JSON.stringify({s:dbgState().s,mode:dbgState().mode,over:dbgState().gameOver,e:dbgEau()})`).catch(()=>'{}'));
    if(st.over||st.mode==='boom'){console.log('mort',JSON.stringify(st).slice(0,200));break;}
    if(st.s!=null&&Math.abs(st.s-tgt)<500){console.log('s',Math.round(st.s),'y',st.e&&st.e.y,'surf(mer)',st.e&&st.e.surf);await H.shot('ras-'+(n++));}
    if(st.s!=null&&st.s>tgt+500)break;}
}
