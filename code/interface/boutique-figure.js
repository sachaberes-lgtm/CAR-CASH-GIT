/* ===== BOUTIQUE : LE RAYON FIGURES A SON PROPRE SYSTÈME (2026-11-07, Sacha : « dans la boutique les boîtes de Léo sont bien pour les voitures et achats, mais pas adaptées pour les peintures, traînées, figures… retravaille au max l'ergonomie, adaptée au mobile et à chaque catégorie d'item » · « chaque type d'item doit avoir un système propre ») =====
   Une figure n'est pas une caisse qu'on photographie : c'est un MOUVEMENT, joué par un GESTE (↑ avant, ↓ arrière, ◄► côtés), qu'on veut voir sur
   la caisse puis ranger dans un des trois emplacements. Le rayon devient une PELLICULE :
   · en haut, le dock des trois emplacements (#bqFigSel, figures-selecteur.js) tassé en une rangée de trois touches pleine largeur : la case de la
     figure, le geste écrit (« ↑ AVANT »), son nom — le toucher filtre ce geste et rejoue sa figure (fsCase, inchangé) ; dessous les pastilles
     TOUT · À MOI · À ACHETER · TRI sur une ligne qui défile ;
   · dessous, les figures en AFFICHES sur une seule rangée qui défile au pouce (de côté, aimantée) : le FILM de la figure prend toute la hauteur
     libre, ses gestes écrits en pastilles de la couleur de leur emplacement par-dessus (une figure à deux sens : toucher l'autre geste la
     passe dans ce sens, comme avant), le nom, puis le pied : ÉQUIPER (un toucher : la figure se range dans CET emplacement et se joue), ÉQUIPÉE,
     ou le prix (l'achat reste au grand bouton du bas, comme partout) ;
   · toucher l'affiche essaie la figure (bqEssaie, inchangé) ; la carte regardée dit REJOUER ; ÉQUIPER fait éclore son pied (fgVient), la case du
     dock flashe (fsHexMaj) et la puce ANNULER vit 5 s (fsMontre) ;
   · la pellicule garde sa place quand on équipe ou change de sens ; une case du dock amène sa figure en vue ; la molette (ordinateur) la fait
     défiler de côté.
   Rien d'autre ne change : les cartes .bqK des autres rayons, l'inventaire et le coffre (le même sélecteur), la sauvegarde. */
try{Object.assign(I18N,{'REJOUER':'REPLAY','ÉQUIPER':'EQUIP','ÉQUIPÉE':'EQUIPPED','À TOI':'YOURS'});}catch(e){}
const BQFG={sl:0,fk:'',rest:null,vu:'',vient:''};
/* les gestes d'une figure, en pastilles : celui de CETTE affiche cerclé, ceux où elle est équipée pleins ; à deux sens, l'autre est tapable */
function bqFigGestes(id,dir){const P=figPeut(id),S=figSlots(),pk=P.length>1&&FSEL.dir<0;
  return '<span class="fgGs">'+P.map(function(x){return '<span class="fgG'+(x===dir?' cur':'')+(S[x]===id?' eq':'')+'"'+(pk&&x!==dir?' data-pick="'+x+'"':'')+' style="--dc:'+FIG_DC[x]+'">'+pxi(FIG_FAM[x][2])+'<b>'+sansAcc(TR(FS_COURT[x]))+'</b></span>';}).join('')+'</span>';}
/* une AFFICHE : le film, les gestes, le nom, le pied (ÉQUIPER · ÉQUIPÉE · le prix) */
function bqFigCarte(k,n,dir){const o=bqCos(k),d=o.d,id=d.id,own=figPossede(id),S=figSlots(),ici=S[dir]===id,r=cosmRar('figure',d),ri=rarInfo(r),nom=sansAcc(TR(d.n)),g=sansAcc(TR(FS_COURT[dir]));
  let pied,etat;
  if(own&&ici){pied='<span class="fgPied fgOk">'+pxi('coche')+'<b>'+sansAcc(TR('ÉQUIPÉE'))+'</b></span>';etat=sansAcc(TR('ÉQUIPÉE'));}
  else if(own){pied='<span class="fgPied fgEq1" role="button" data-fgeq="1" aria-label="'+sansAcc(TR('ÉQUIPER'))+' : '+g+'"><i class="fgEqDir">'+pxi(FIG_FAM[dir][2])+'</i><b>'+sansAcc(TR('ÉQUIPER'))+'</b></span>';etat=sansAcc(TR('À TOI'));}
  else if(d.p){const cher=bank()<d.p;pied='<span class="fgPied fgPx'+(cher?' cher':'')+'">'+pxi('piece')+'<b>'+bqPxT(d.p)+'</b></span>';etat=bqPxT(d.p);}
  else{pied='<span class="fgPied fgPx">'+sansAcc(TR('MISSION'))+'</span>';etat=sansAcc(TR('MISSION'));}
  return '<div class="bqK hab fgK r-'+r+(own?' own':'')+(ici?' ici':'')+'" data-k="'+k+'" data-dir="'+dir+'" role="button" style="--rc:'+ri.c+';--dc:'+FIG_DC[dir]+';--i:'+Math.min(n,8)+'" aria-label="'+nom.replace(/"/g,'')+' · '+g+' · '+etat+'">'
    +'<span class="bqKph c-figure" data-phf="'+id+'|'+FIG_DIR[dir]+'">'+bqFigHab(k)+'</span>'
    +bqFigGestes(id,dir)+'<span class="fgRe" aria-hidden="true">'+pxi('rotation')+'<b>'+sansAcc(TR('REJOUER'))+'</b></span>'
    +'<span class="fgRar">'+sansAcc(TR(ri.n1))+'</span><span class="bqKn">'+nom+'</span>'+pied+'</div>';}
/* la pellicule entière (appelée par garBqPanneau à la place des cartes communes) ; elle note où on en était, pour y revenir après un équipement */
function bqFigRailHtml(){const R=bqFigRail(),pan=document.getElementById('gBqPan'),fk=FSEL.dir+'|'+FSEL.part+'|'+FSEL.tri,deja=!!pan&&pan.classList.contains('bqFigOn');
  BQFG.rest=deja&&BQFG.fk===fk?BQFG.sl:0;BQFG.fk=fk;if(!deja)BQFG.vu='';
  if(!R.length)return ['<div class="bqVide">'+sansAcc(TR(FSEL.dir>=0?'AUCUNE FIGURE POUR CE GESTE':'RIEN À AFFICHER'))+'</div>'];
  return R.map(function(e,n){return bqFigCarte(e.k,n,e.c);});}
/* après chaque passage du panneau (rayon FIGURES) : la place retrouvée, le geste écrit sur les cases du dock, la figure regardée amenée en vue,
   l'éclosion du pied qu'on vient d'équiper */
function bqFigApres(pan,rail){
  if(BQFG.rest!=null){const r=BQFG.rest;BQFG.rest=null;if(r)rail.scrollLeft=r;}
  if(!rail._fg){rail._fg=1;
    rail.addEventListener('scroll',function(){if(pan.classList.contains('bqFigOn'))BQFG.sl=rail.scrollLeft;},{passive:true});
    rail.addEventListener('wheel',function(e){if(!pan.classList.contains('bqFigOn')||Math.abs(e.deltaY)<=Math.abs(e.deltaX))return;rail.scrollLeft+=e.deltaY;e.preventDefault();},{passive:false});} /* la molette d'une souris fait défiler la pellicule de côté */
  const sel=document.getElementById('bqFigSel');
  if(sel&&sel._fgL!==LANG){sel._fgL=LANG;sel.querySelectorAll('.fsHex').forEach(function(b){let g=b.querySelector('.fgSlotG');if(!g){g=document.createElement('em');g.className='fgSlotG';b.insertBefore(g,b.querySelector('.fsNom'));}g.textContent=sansAcc(TR(FS_COURT[+b.getAttribute('data-k')]));});}
  const vu=(GBQ.figK||'')+'@'+GBQ.figDir+'|'+BQFG.fk;
  if(BQFG.vu!==vu){const s=rail.querySelector('.fgK.sel');
    if(!GBQ.figK)BQFG.vu=vu;
    else if(s&&s.getAttribute('data-k')===GBQ.figK){BQFG.vu=vu;const rr=rail.getBoundingClientRect(),b=s.getBoundingClientRect();
      if(b.left<rr.left+2||b.right>rr.right-2)rail.scrollTo({left:Math.max(0,rail.scrollLeft+(b.left-rr.left)-(rr.width-b.width)/2),behavior:REDUCED_MOTION?'auto':'smooth'});}}
  if(BQFG.vient){const c=rail.querySelector('.fgK[data-k="'+BQFG.vient+'"]');BQFG.vient='';if(c){c.classList.remove('fgVient');void c.offsetWidth;c.classList.add('fgVient');}}}
/* ÉQUIPER sur l'affiche : un toucher, dans l'emplacement de CETTE affiche — la figure se joue (bqEssaie) et se range (figEqToast : le son, la puce
   ANNULER) ; capturé avant le toucher de la carte (qui ne ferait que l'essayer) */
document.addEventListener('click',function(e){const b=e.target.closest&&e.target.closest('#gBqPan.bqFigOn .fgK [data-fgeq]');if(!b)return;e.stopPropagation();
  if(!garageOn||GAR.go||ecranWipe._on||!GBQ.on)return;const t=b.closest('.fgK'),k=t.getAttribute('data-k'),dir=+t.getAttribute('data-dir'),id=k.slice(7);
  if(!figPossede(id))return;uiPop(b);GSON9=false;GBQ.figDir=dir;bqEssaie(k);figEqToast(id,dir);GBQ.rk='';BQFG.vient=k;try{gShopJour();}catch(e9){}hap(8);},true);
