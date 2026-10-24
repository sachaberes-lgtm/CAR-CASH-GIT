/* ===== LE FINAL SPIN v2 (2026-10-14 soir — Sacha, sur la v1 : « c'est ÇA la roulette, sérieux ? » ; l'ordre du matin : « le final spin [de
   Jetpack Joyride] … la bonne DA, HUD, lumières, bonnes animations et un vrai niveau de finition ; ça ne doit pas se déclencher à chaque
   partie ») — session IDEE. La v1 (une petite grille d'icônes sur l'écran de mort en transparence) est REFAITE :
   · UNE GRANDE MACHINE qui tient l'écran, en relief : enseigne lumineuse « FINAL SPIN », caisse en laque cerclée d'or, ampoules qui chassent,
     vitre aux rouleaux IVOIRE (des cylindres : les symboles s'écrasent et s'éteignent vers le haut et le bas), ligne de gain néon, un écran de
     lots sous la vitre, un GROS LEVIER à boule rouge sur le flanc. Le fond est OPAQUE (plus rien de l'écran de mort ne transparaît).
   · LE LEVIER SE TIRE AU DOIGT : il suit le pouce vers le bas avec une résistance qui monte, cliquette au cran (passé 55 %), part en
     tirage au lâcher et revient en ressort ; lâché trop tôt, il remonte sans rien tirer. Un toucher simple, ou TIRER (l'unique or), le tirent
     d'un coup. Les jetons attendent sur un PLATEAU (des pièces à couronne) : il n'y a plus de compteur « ×0 ».
   · LES ROULEAUX : l'élan (un cran en arrière), la course (19 symboles/s, filé : les symboles s'étirent), la pose un par un avec du poids
     (easeOutBack raccordée à la vitesse), le 3e qui fait durer le suspense quand les deux premiers sont pareils (ampoules en folie).
   · LES LOTS SONT LES SYMBOLES (`SPIN.lots`, une ligne par lot, réglée par GENERAL) : trois PETITS SACS, trois SACS, trois GROS SACS (de
     l'argent du jeu), trois CŒURS = une SECONDE CHANCE GRATUITE (un bon `SAVE.d.chanceG`, servi par l'offre de GENERAL à la prochaine
     explosion), trois ÉCLAIRS = un DÉPART BOOSTÉ (`SAVE.d.spinBoost` : la partie suivante part nitro pleine, moteur au palier 1), trois
     JETONS = un tirage de plus, trois 7 = le JACKPOT (flash à 3 éclats par seconde au plus, pluie de billets, pièces, vibration). Sans
     brelan : un lot de consolation. Symboles en pixel art de couleur (`SPIN_SPR`, peints une fois dans des canvas).
   · Sons de la session SON : spin.levier, spin.cran, spin.arret (une note par rouleau), spin.piece, spin.gain, spin.jackpot.
   · INCHANGÉ depuis la v1 : les jetons rares sur la route (spinPose / spinPrend / mkJeton), gardés dans `SAVE.d.spinJ`, la machine qui
     s'ouvre sur l'écran de fin après l'offre de seconde chance (`chanceAttend()`), `?spin=0`, `dbgSpin(n,lot)` (lot = un id de SPIN.lots,
     'rien', ou les anciens 'jackpot'/'brelan'/'paire'), `dbgJeton(d)`. */
Object.assign(I18N,{'FINAL SPIN':'FINAL SPIN','JETON SPIN':'SPIN TOKEN','TIRER':'PULL','CONTINUER':'CONTINUE','JACKPOT !':'JACKPOT!',
  'PETIT SAC':'SMALL BAG',"SAC D'ARGENT":'MONEY BAG','GROS SAC':'BIG BAG','SECONDE CHANCE GRATUITE':'FREE SECOND CHANCE','DÉPART BOOSTÉ':'BOOSTED START',
  '+1 JETON':'+1 TOKEN','LOT DE CONSOLATION':'CONSOLATION PRIZE','TIRE LE LEVIER':'PULL THE LEVER','À TA PROCHAINE CHUTE':'ON YOUR NEXT CRASH',
  'NITRO PLEINE · MOTEUR +1':'FULL NITRO · ENGINE +1','UN TIRAGE DE PLUS':'ONE MORE PULL','GRATUIT':'FREE','À LA PROCHAINE PARTIE':'ON YOUR NEXT RUN',
  'VOITURE ÉPIQUE':'EPIC CAR'}); // (2026-10-19) le jackpot donne une caisse
const SPIN={on:!/[?&]spin=0\b/.test(location.search),pZone:.28,max:3,pose:0,ouvert:false,vu0:0,roule:false,force:null,total:0,el:null,N:20,
  /* LES LOTS — une ligne par lot, l'index = le symbole des rouleaux. p = probabilité par tirage (le reste : la consolation).
     (2026-10-19, Sacha : « seconde chance doit être plus probable ; les sacs d'argent doivent être plus rares mais ils rapportent 50× plus
     d'argent ; le jackpot doit faire gagner une voiture épique ») — les sacs ×50 (120 → 6 000, 300 → 15 000, 1 000 → 50 000) et 2,5 à
     3,3 fois plus rares (,20 → ,08 · ,12 → ,04 · ,04 → ,012) ; le CŒUR ,05 → ,15 ; le 7 donne une ÉPIQUE pas encore à toi (spinEpique),
     `cash` = ce qu'il verse quand elles le sont toutes. Argent ≈ 1 700 $ d'espérance par tirage (avant : ≈ 178 $, plafond de GENERAL
     « ≤ 10 % du gain d'une partie » levé par Sacha). */
  lots:[{id:'petit',nm:'PETIT SAC',p:.08,cash:6000},
        {id:'sac',nm:"SAC D'ARGENT",p:.04,cash:15000},
        {id:'gros',nm:'GROS SAC',p:.012,cash:50000},
        {id:'coeur',nm:'SECONDE CHANCE GRATUITE',p:.15,bon:'chanceG',sous:'À TA PROCHAINE CHUTE'},
        {id:'boost',nm:'DÉPART BOOSTÉ',p:.07,bon:'spinBoost',sous:'NITRO PLEINE · MOTEUR +1'},
        {id:'jeton',nm:'+1 JETON',p:.05,jeton:1,sous:'UN TIRAGE DE PLUS'},
        {id:'sept',nm:'JACKPOT !',p:.012,voiture:'epique',cash:500000}],
  conso:{nm:'LOT DE CONSOLATION',cash:40},
  bandeN:[4,4,2,2,3,3,2]};                                          // combien de fois chaque symbole sur un rouleau de 20
// LES SYMBOLES — pixel art 12 × 12, une palette par symbole (k = l'encre), `z` = la taille dans la fenêtre (les sacs grossissent avec le lot)
const SPIN_SPR=[
  {z:.72,pal:{k:'#1c0430',b:'#b8743a',B:'#e8a860',d:'#6b3a14',v:'#3fd06a',V:'#c9ffd8'},r:['....kkkk....','....kBBk....','.....kk.....','...kkkkkk...','..kbBBBBbk..','.kbBBvvBBbk.','.kbBvVVvBbk.','.kbBBvvBBbk.','.kbbBBBBbbk.','.kdbbbbbbdk.','..kddddddk..','...kkkkkk...']},
  {z:.9,pal:{k:'#1c0430',b:'#a8622a',B:'#e09a50',d:'#5a2e0c',v:'#ffc72a',V:'#fff3c0'},r:['....kkkk....','....kBBk....','.....kk.....','...kkkkkk...','..kbBBBBbk..','.kbBBvvBBbk.','.kbBvVVvBbk.','.kbBBvvBBbk.','.kbbBBBBbbk.','.kdbbbbbbdk.','..kddddddk..','...kkkkkk...']},
  {z:1.06,pal:{k:'#2a1200',b:'#ffc72a',B:'#fff3c0',d:'#9c5200',v:'#ffffff',V:'#5ee6ff'},r:['....kkkk....','....kBBk....','.....kk.....','...kkkkkk...','..kbBBBBbk..','.kbBBvvBBbk.','.kbBvVVvBbk.','.kbBBvvBBbk.','.kbbBBBBbbk.','.kdbbbbbbdk.','..kddddddk..','...kkkkkk...']},
  {z:.92,pal:{k:'#1c0430',r:'#ff3b5c',R:'#ffb3c0',m:'#a3122f',w:'#ffffff'},r:['............','..kkk..kkk..','.kRRrkkrrrk.','kRwRrrrrrrrk','kRRrrrrrrrrk','krrrrrrrrrmk','.krrrrrrrmk.','..krrrrrmk..','...krrrmk...','....krmk....','.....kk.....','............']},
  {z:.95,pal:{k:'#1c0430',Y:'#fff6b0',y:'#ffd23a',o:'#e07800'},r:['......kkkk..','.....kYyk...','....kYyk....','...kYyok....','..kYyyykkk..','.kYyyyyyyk..','.kkkkYyyk...','....kYyk....','...kYyok....','..kYyok.....','..kyok......','..kkk.......']},
  {z:.88,pal:{k:'#2a1200',g:'#ffc72a',G:'#fff3c0',o:'#9c5200'},r:['...kkkkkk...','.kkggggggkk.','.kgGGGGGGgk.','kgGGGGGGGGgk','kgGoGooGoGgk','kgGooooooGgk','kgGooooooGgk','kgGGGGGGGGgk','.kgGGGGGGgk.','.kkooooookk.','...kkkkkk...','............']},
  {z:1,pal:{k:'#2a1200',R:'#ffd0d8',r:'#ff2a4a',m:'#8a0f24'},r:['............','.kkkkkkkkkk.','.kRRRRRRRrk.','.krrrrrrrrk.','.kkkkkkkrmk.','......krmk..','.....krmk...','....krrmk...','....krmk....','...krrmk....','...krmk.....','...kkkk.....']}];
function spinSprites(){ // les sept symboles peints UNE fois (canvas → data URL) ; la feuille <style id="spinSpr"> les pose sur .spS0 … .spS6
  if(spinSprites.ok)return;spinSprites.ok=true;let css='';
  SPIN_SPR.forEach(function(S,i){const Z=8,cv=document.createElement('canvas');cv.width=cv.height=12*Z;const c=cv.getContext('2d');
    for(let y=0;y<12;y++)for(let x=0;x<12;x++){const ch=S.r[y][x];if(ch==='.')continue;c.fillStyle=S.pal[ch]||'#ff00ff';c.fillRect(x*Z,y*Z,Z,Z);}
    let u='';try{u=cv.toDataURL('image/png');}catch(e){}
    css+='#spinM .spS'+i+',.spIco.spS'+i+'{background-image:url('+u+');--z:'+S.z+'}';});
  const st=document.createElement('style');st.id='spinSpr';st.textContent=css;document.head.appendChild(st);}
function spinIco(i,cl){return '<i class="spIco spS'+i+(cl?' '+cl:'')+'" aria-hidden="true"></i>';}
SPIN.bandes=[0,1,2].map(function(){const L=[];SPIN.bandeN.forEach(function(n,i){for(let k=0;k<n;k++)L.push(i);});
  for(let i=L.length-1;i>0;i--){const j=(Math.random()*(i+1))|0,t=L[i];L[i]=L[j];L[j]=t;}return L;}); // trois rouleaux, trois ordres
const SPIN_D=(function(){const d={}; // LE JETON SUR LA ROUTE (v1) : les recettes exactes des cristaux de pouvoir — mêmes programmes, rien ne compile en course
  d.orM=new THREE.MeshPhongMaterial({color:0xffc72a,emissive:0x9c5200,emissiveIntensity:.9,shininess:260,specular:0xffffff,envMap:envTex,reflectivity:.6,transparent:true,opacity:.97,depthWrite:false,flatShading:true});
  d.ringM=new THREE.MeshBasicMaterial({color:0xfff3c0,transparent:true,opacity:.85});
  d.haloM=new THREE.SpriteMaterial({map:lampTex,color:0xffc72a,transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending});
  const cv=document.createElement('canvas');cv.width=cv.height=128;
  d.icoM=new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false});
  d.icoM.onBeforeCompile=PWR_DEFS.x.icoM.onBeforeCompile;d.icoM.customProgramCacheKey=PWR_DEFS.x.icoM.customProgramCacheKey;
  d.icoDessine=function(){const c=cv.getContext('2d');c.clearRect(0,0,128,128);c.textAlign='center';
    const g=PXI_G.couronne;if(g){const rows=g.split('|'),Z=5,X0=64-4.5*Z,Y0=12;
      for(const o of [[-2,0],[2,0],[0,-2],[0,2],[0,0]]){c.fillStyle=o[0]||o[1]?'#2a1200':'#ffd75e';
        for(let y=0;y<9;y++)for(let x=0;x<9;x++)if(rows[y]&&rows[y][x]==='#')c.fillRect(X0+x*Z+o[0],Y0+y*Z+o[1],Z,Z);}}
    const lb=sansAcc(TR('JETON SPIN'));c.font='11px "Press Start 2P",monospace';c.lineWidth=6;c.lineJoin='round';c.strokeStyle='#2a1200';
    c.strokeText(lb,64,102);c.fillStyle='#ffd75e';c.fillText(lb,64,102);d.icoM.map.needsUpdate=true;};
  d.icoDessine();
  try{if(document.fonts&&document.fonts.load)document.fonts.load('11px "Press Start 2P"').then(function(){d.icoDessine();}).catch(function(){});}catch(e){}
  d.geo=new THREE.CylinderGeometry(1.7,1.7,.46,24);d.geo.rotateX(Math.PI/2);
  d.rimGeo=new THREE.TorusGeometry(1.78,.17,6,28);
  return d;})();
function mkJeton(dir){const d=SPIN_D,g=new THREE.Group();
  g.add(new THREE.Mesh(d.geo,d.orM),new THREE.Mesh(d.rimGeo,d.ringM));
  const ic=new THREE.Sprite(d.icoM);ic.scale.set(6,6,1);ic.position.y=(dir||1)*4.3;g.add(ic);
  const ha=new THREE.Sprite(d.haloM);ha.scale.set(7.5,7.5,1);ha.renderOrder=2;ha.updateMatrix();ha.matrixAutoUpdate=false;g.add(ha);
  return g;}
function spinPose(){ // fin de spawnPickups : AU PLUS un jeton par zone, et seulement si le hasard le veut (souvent non)
  if(!SPIN.on||BALADE||PARK.on||SANDBOX||TUTO.on||SURV.on||SPIN.pose>=SPIN.max||(LVL.cur&&LVL.cur.piste==='tuto'))return;
  if(Math.random()>SPIN.pZone)return;
  let ss=-1;for(let k=0;k<8&&ss<0;k++){const c9=L*(.22+Math.random()*.6);let ok=true;
    for(const p of pickups)if(p.pow&&Math.abs(p.s-c9)<60){ok=false;break;}if(ok)ss=c9;}
  if(ss<0)return;
  const lt=(Math.random()*2-1)*(ROAD_HALF-5);
  frameAt(ss,F);mat4b.makeBasis(F.b,F.n,F.t);
  for(const face of [1,-1]){const m=mkJeton(face);
    m.position.copy(F.p).addScaledVector(F.b,lt).addScaledVector(F.n,face>0?2.6:-(THICK+2.6));
    m.quaternion.setFromRotationMatrix(mat4b);m.updateMatrix();m.matrixAutoUpdate=false;scene.add(m);
    pickups.push({s:ss,lat:lt,face:face,nitro:false,spin:true,mesh:m,taken:false,ax:F.n.clone().multiplyScalar(face)});}
  SPIN.pose++;}
function spinPrend(p){ // le ramassage (boucle) : le jumeau de l'autre face part, le jeton entre dans la SAUVEGARDE
  for(const q of pickups)if(q.spin&&q!==p&&!q.taken&&q.s===p.s){q.taken=true;scene.remove(q.mesh);}
  SAVE.d.spinJ=Math.min(9,(SAVE.d.spinJ|0)+1);SAVE.mark();
  try{if(SONV2)sfx('pwr.autre');}catch(e){}hap([14,40,22]);
  try{spinSprites();toast(spinIco(5,'mini')+' '+sansAcc(TR('JETON SPIN'))+' ×'+SAVE.d.spinJ,true);}catch(e){}}
function spinTire(){ // le résultat, AVANT que les rouleaux ne tournent : un lot (brelan) ou la consolation (deux pareils au plus)
  const f=SPIN.force;SPIN.force=null;const R=function(n){return (Math.random()*n)|0;},Lo=SPIN.lots,N=Lo.length;
  let i=-1;
  if(f!=null){const al={jackpot:'sept',brelan:'gros',paire:null,rien:null}[f];const id=al!==undefined?al:f;i=id==null?-1:Lo.findIndex(function(l){return l.id===id;});}
  else{let r=Math.random();for(let k=0;k<N;k++){if(r<Lo[k].p){i=k;break;}r-=Lo[k].p;}}
  if(i>=0)return {i:i,lot:Lo[i],s:[i,i,i]};
  // la consolation : souvent un « presque » (deux gros symboles sur les deux premiers rouleaux, le 3e qui fait durer), sinon trois différents
  let s;if(f==='paire'||(f==null&&Math.random()<.38)){const a=2+R(N-2);let b=R(N);while(b===a)b=R(N);s=[a,a,b];}
  else{const L9=[];for(let k=0;k<N;k++)L9.push(k);for(let k=N-1;k>0;k--){const j=R(k+1),t=L9[k];L9[k]=L9[j];L9[j]=t;}s=L9.slice(0,3);}
  return {i:-1,lot:SPIN.conso,s:s};}
function spinDom(){ // LA MACHINE, fabriquée une fois (au premier tirage de la session)
  if(SPIN.el)return SPIN.el;spinSprites();
  const el=document.createElement('div');el.id='spinM';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Final spin');
  const bulbes=function(n,cl){let h='<div class="spBulbs '+cl+'">';const per=[];const a=Math.round(n*.32),b=Math.round(n*.18);
    for(let i=0;i<a;i++)per.push([(i+.5)/a*100,0]);for(let i=0;i<b;i++)per.push([100,(i+.5)/b*100]);for(let i=a-1;i>=0;i--)per.push([(i+.5)/a*100,100]);for(let i=b-1;i>=0;i--)per.push([0,(i+.5)/b*100]);
    per.forEach(function(q,i){h+='<i style="left:'+q[0].toFixed(1)+'%;top:'+q[1].toFixed(1)+'%;--i:'+i+'"></i>';});return h+'</div>';};
  let rou='';for(let r=0;r<3;r++){let b='';for(let k=0;k<SPIN.N*2;k++)b+='<i class="spSym spS'+SPIN.bandes[r][k%SPIN.N]+'"></i>';rou+='<div class="spRou"><div class="spBande">'+b+'</div></div>';}
  el.innerHTML='<div class="spFlash"></div><div class="spPluie" aria-hidden="true"></div><div class="spBox">'
    +'<div class="spEnseigne">'+bulbes(22,'spB1')+'<b class="spNeon"></b></div>'
    +'<div class="spCorps"><div class="spCab">'+bulbes(30,'spB2')
      +'<div class="spVitre"><div class="spFens">'+rou+'</div><div class="spLigne"><i></i><i></i></div><div class="spReflet"></div></div>'
      +'<div class="spEcran"><div class="spGain" aria-live="polite"></div></div><i class="spFente"></i></div>'
      +'<div class="spLevier" role="button" tabindex="0" aria-label="Levier"><i class="spSocle"></i><div class="spBras"><i class="spTige"></i><i class="spBoule"></i></div></div></div>'
    +'<div class="spPlateau" aria-hidden="true"></div>'
    +'<div class="pbtn pb-gold big wide spTire" role="button" tabindex="0"></div></div>';
  document.body.appendChild(el);
  SPIN.el=el;SPIN.rous=[].slice.call(el.querySelectorAll('.spRou'));SPIN.bds=[].slice.call(el.querySelectorAll('.spBande'));
  SPIN.symEls=SPIN.bds.map(function(b){return [].slice.call(b.children);});SPIN.vus=[[],[],[]];
  SPIN.btn=el.querySelector('.spTire');SPIN.gEl=el.querySelector('.spGain');SPIN.plat=el.querySelector('.spPlateau');
  SPIN.lev=el.querySelector('.spLevier');SPIN.bras=el.querySelector('.spBras');SPIN.fente=el.querySelector('.spFente');
  SPIN.p=[0,0,0].map(function(){return (Math.random()*SPIN.N)|0;});SPIN.lv={th:0,v:0,drag:false,y0:0,cran:false,anim:0};
  SPIN.btn.addEventListener('click',function(e){e.stopPropagation();spinTirer(false);});
  el.addEventListener('click',function(e){e.stopPropagation();});
  // LE LEVIER AU DOIGT : il suit le pouce (résistance qui monte), cliquette au cran, part au lâcher passé 55 % ; un simple toucher le tire d'un coup
  const lv=SPIN.lev,LV=SPIN.lv;
  lv.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();if(SPIN.roule||LV.anim||(SAVE.d.spinJ|0)<=0)return;
    LV.drag=true;LV.y0=e.clientY;LV.dy=0;LV.cran=false;LV.cq=0;try{lv.setPointerCapture(e.pointerId);}catch(_){}});
  lv.addEventListener('pointermove',function(e){if(!LV.drag)return;LV.dy=e.clientY-LV.y0;const d=Math.max(0,LV.dy)/(SPIN.H*2.3);
    const th=1-Math.exp(-d*2.2);levierPose(th);{const q9=Math.floor(th/.14);if(q9>(LV.cq|0)){LV.cq=q9;try{if(SONV2)sfx('spin.cliquet',{vol:-2+q9});}catch(_){}}else if(q9<(LV.cq|0))LV.cq=q9;} /* (2026-10-15 soir) un cran de cliquet à chaque palier de la course */if(th>.55&&!LV.cran){LV.cran=true;hap(6);try{if(SONV2)sfx('spin.cran',{vol:-4});}catch(_){}}});
  const lache=function(e){if(!LV.drag)return;LV.drag=false;try{lv.releasePointerCapture(e.pointerId);}catch(_){}
    if(LV.dy<8&&LV.th<.12){spinTirer(false);return;} // un simple toucher
    if(LV.th>=.55)spinTirer(true);else levierRessort();};
  lv.addEventListener('pointerup',lache);lv.addEventListener('pointercancel',lache);
  return el;}
function levierPose(th){const c=Math.cos(Math.min(1,th)*Math.PI);SPIN.lv.th=th;
  SPIN.bras.style.setProperty('--lc',c.toFixed(3));SPIN.bras.style.setProperty('--lb',(th<0?th*.35:(1-c)/2).toFixed(3));}
function levierRessort(){ // le retour en RESSORT (amorti, un léger dépassement au-dessus de la butée)
  const LV=SPIN.lv;let x=LV.th,v=0,prev=performance.now();LV.anim=1;
  (function pas(now){const dt=Math.min(.033,(now-prev)/1000);prev=now;v+=(-170*x-13*v)*dt;x+=v*dt;levierPose(x);
    if((Math.abs(x)>.003||Math.abs(v)>.02)&&SPIN.ouvert)requestAnimationFrame(pas);else{levierPose(0);LV.anim=0;}})(prev);}
function spinTirer(dejaBas){ // le levier part (geste ou bouton) : il finit sa course en ~0,12 s, le tirage démarre, il revient en ressort
  if(SPIN.roule||SPIN.lv.anim)return;
  if((SAVE.d.spinJ|0)<=0){uiClic('');hap(8);spinFerme();return;}
  try{SPIN.btn.classList.add('appui');setTimeout(function(){SPIN.btn.classList.remove('appui');},140);}catch(e){}
  const LV=SPIN.lv,t0=performance.now(),th0=dejaBas?LV.th:0,D=dejaBas?90:170;LV.anim=1;
  (function bas(now){const u=Math.min(1,(now-t0)/D);levierPose(th0+(1-th0)*u*u);
    if(u<1)requestAnimationFrame(bas);else{LV.anim=0;spinAppui();levierRessort();}})(t0);}
function spinH(){return SPIN.rous[0].offsetHeight/3||60;} /* la hauteur de MISE EN PAGE (v1 : getBoundingClientRect, faussé par l'entrée en scale .94 — les rouleaux se décalaient) */
addEventListener('resize',function(){if(SPIN.ouvert&&SPIN.rous){SPIN.H=spinH();spinPeint();}});
function spinPeint(){ // les bandes à leur position, et le CYLINDRE : chaque symbole visible s'écrase et s'éteint vers les bords de la vitre
  const H=SPIN.H||spinH(),N=SPIN.N;
  for(let r=0;r<3;r++){const p=((SPIN.p[r]%N)+N)%N,E=SPIN.symEls[r],V=SPIN.vus[r],f=SPIN.rous[r].classList.contains('file');
    SPIN.bds[r].style.transform='translate3d(0,'+(-p*H).toFixed(1)+'px,0)';
    const k0=Math.floor(p)-1,nv=[];
    for(let k=k0;k<=k0+5;k++){if(k<0||k>=E.length)continue;const u=k-p-1,cy=Math.cos(Math.max(-1.6,Math.min(1.6,u*.62)));
      E[k].style.transform='scaleY('+(cy*(f?1.32:1)).toFixed(3)+')';E[k].style.opacity=(f?.72:1)*(.35+.65*cy).toFixed(3);nv.push(k);}
    for(const k of V)if(nv.indexOf(k)<0){E[k].style.transform='';E[k].style.opacity='';}
    SPIN.vus[r]=nv;}}
function spinPlateau(prend){ // le plateau des jetons : une pièce à couronne par tirage restant (plus de compteur « ×0 »)
  const n=SAVE.d.spinJ|0;let h='';for(let i=0;i<Math.min(9,n);i++)h+=spinIco(5,'spPiece');SPIN.plat.innerHTML=h;
  SPIN.plat.classList.toggle('vide',n<=0);
  if(prend){const fe=SPIN.fente.getBoundingClientRect(),pl=SPIN.plat.getBoundingClientRect(),t=document.createElement('i');
    t.className='spIco spS5 spVole';t.style.left=(pl.left+pl.width/2)+'px';t.style.top=(pl.top+pl.height/2)+'px';SPIN.el.appendChild(t);
    try{t.animate([{transform:'translate(-50%,-50%)',opacity:1},{transform:'translate(calc(-50% + '+(fe.left+fe.width/2-pl.left-pl.width/2).toFixed(0)+'px),calc(-50% + '+(fe.top+fe.height/2-pl.top-pl.height/2).toFixed(0)+'px)) scale(.55)',opacity:.2}],
      {duration:420,easing:'cubic-bezier(.32,.72,0,1)'}).onfinish=function(){t.remove();};}catch(e){t.remove();}}}
function spinLabels(){const n=SAVE.d.spinJ|0;
  SPIN.el.querySelector('.spNeon').textContent=sansAcc(TR('FINAL SPIN'));
  SPIN.btn.textContent=sansAcc(TR(n>0?'TIRER':'CONTINUER'));SPIN.btn.classList.toggle('fin',n<=0);SPIN.lev.classList.toggle('mort',n<=0);
  spinPlateau(false);}
function spinOuvre(){
  spinDom();SPIN.ouvert=true;SPIN.total=0;SPIN.roule=false;SPIN.el.classList.remove('gagne','jackpot','tease','roule');
  SPIN.gEl.className='spGain attente';SPIN.gEl.innerHTML='<span>'+sansAcc(TR('TIRE LE LEVIER'))+'</span>';
  SPIN.el.classList.add('on');spinLabels();levierPose(0);
  SPIN.H=spinH();SPIN.el.style.setProperty('--spPx',(SPIN.H*.82).toFixed(0)+'px');spinPeint();
  requestAnimationFrame(function(){SPIN.el.classList.add('vu');});
  try{if(SONV2&&!sfx('spin.ouvre'))sfx('ui.banniere');}catch(e){}hap(12);} /* (2026-10-15 soir, Sacha : « rajouter des sons pour la machine à sous ») elle S'ALLUME : relais, néon, ampoules en chenillard */
function spinFerme(){if(!SPIN.el)return;if(SPIN.ouvert){spinSonsStop();try{if(SONV2)sfx('spin.ferme');}catch(e){}}SPIN.ouvert=false;SPIN.roule=false;SPIN.vu0=0;SPIN.el.classList.remove('vu','roule','gagne','jackpot','tease');
  setTimeout(function(){if(!SPIN.ouvert)SPIN.el.classList.remove('on');},420);try{window.__mFill();}catch(e){}} /* (2026-10-18, débogage) mFill vit dans le bloc des menus : on passe par sa porte (le COMPTE de l'écran de fin restait d'avant les gains) */
function spinAppui(){ // le tirage : un jeton du plateau part dans la fente, le levier a claqué, les rouleaux partent
  if(SPIN.roule)return;
  if((SAVE.d.spinJ|0)<=0){spinFerme();return;}
  hap(16);SAVE.d.spinJ=(SAVE.d.spinJ|0)-1;SAVE.flush();
  try{if(SONV2)sfx('spin.levier');else uiClic('');}catch(e){} /* (session SON) le levier a son clac mécanique */
  try{if(SONV2)sfx('spin.jeton',{t:.28});}catch(e){} /* (2026-10-15 soir) le jeton tinte sur la lèvre de la fente, roule dans la goulotte */
  spinPlateau(true);spinLabels();
  spinLance(spinTire());}
function spinLance(R){ // les trois rouleaux : l'élan, la course, la pose — positions en SYMBOLES, vitesse en symboles par seconde
  SPIN.roule=true;SPIN.el.classList.add('roule');SPIN.el.classList.remove('gagne','jackpot');SPIN.gEl.className='spGain';SPIN.gEl.innerHTML='';
  const V=19,T0=performance.now(),tease=R.s[0]===R.s[1],N=SPIN.N;
  /* la POSE : passé son heure (stop[r]), un rouleau file jusqu'à ce que son symbole soit à 6-7,5 crans (9-11 pour le suspense), puis freine
     (easeOutBack raccordée à la vitesse : f'(0)=4) — jamais avant que son voisin de gauche ne soit posé depuis 0,3 s */
  const stop=[.95,1.4,tease?2.9:1.85],st=[0,1,2].map(function(r){return {p0:SPIN.p[r],v:0,ph:0,ps:0,pe:0,ts:0,D:0,fin:false,tf:0,file:false};});
  let tic=0,prev=T0;spinSonsStop();try{if(SONV2)SPIN.mot=sfx('spin.roule',{loop:true,force:true,vol:-16,rate:.7});}catch(e){} /* (2026-10-15 soir) LE MOTEUR des rouleaux : une boucle qui suit leur vitesse (spinMoteur) */
  function pas(now){
    const t=(now-T0)/1000,dt=Math.min(.05,(now-prev)/1000);prev=now;let tous=true;
    for(let r=0;r<3;r++){const S=st[r];if(S.fin)continue;tous=false;
      if(S.ph===0){
        if(t<.09)SPIN.p[r]=S.p0-.22*Math.sin(t/.09*Math.PI/2); // l'élan : un cran en arrière
        else{S.v=Math.min(V,S.v+V*dt/.32);SPIN.p[r]+=S.v*dt;if(S.v>9&&!S.file){S.file=true;SPIN.rous[r].classList.add('file');}}
        const P=r>0?st[r-1]:null,fPrev=!P?0:P.fin?P.tf:P.ph===1?P.ts+P.D:-1,dMin=r===2&&tease?9:6;
        if(t>=stop[r]&&fPrev>=0){
          const B=SPIN.bandes[r];let pe=Math.ceil(SPIN.p[r]+dMin);while(B[((pe+1)%N+N)%N]!==R.s[r])pe++;
          const d=pe-SPIN.p[r],D=4*d/Math.max(6,S.v);
          if(d<=dMin+1.5&&t+D>=fPrev+.3){S.ph=1;S.ps=SPIN.p[r];S.pe=pe;S.ts=t;S.D=D;}}}
      else{const u=Math.min(1,(t-S.ts)/S.D),w=u-1;SPIN.p[r]=S.ps+(S.pe-S.ps)*(1+2*w*w*w+w*w);
        if(S.file&&u>.42){S.file=false;SPIN.rous[r].classList.remove('file');}
        if(u>=1){S.fin=true;S.tf=t;SPIN.p[r]=S.pe;try{if(SONV2)sfx('spin.arret',{st:[0,4,7][r]|0});}catch(e){}hap(9); /* (session SON) le TCHONK, une note plus haut à chaque rouleau */
          const ro=SPIN.rous[r];ro.classList.remove('pose');void ro.offsetWidth;ro.classList.add('pose');
          if(r===1&&tease){SPIN.el.classList.add('tease');try{if(SONV2)SPIN.tz=sfx('spin.tease',{force:true});}catch(e){}} /* (2026-10-15 soir) le SUSPENSE : le roulement qui accélère jusqu'au 3e rouleau */
          if(r===2&&SPIN.tz){try{SPIN.tz.stop(.06);}catch(e){}SPIN.tz=null;}}}}
    const q=Math.floor(SPIN.p[0]+SPIN.p[1]+SPIN.p[2]);if(q!==tic&&now-(spinLance._t||0)>55){tic=q;spinLance._t=now;try{if(SONV2)sfx('spin.cran');}catch(e){}} /* (session SON) un cran par symbole : le cliquetis ralentit avec les rouleaux */
    spinPeint();spinMoteur(st,V,t);
    if(!tous&&SPIN.ouvert)requestAnimationFrame(pas);
    else if(SPIN.ouvert){spinSonsStop();SPIN.el.classList.remove('roule','tease');for(let r=0;r<3;r++)SPIN.p[r]=((SPIN.p[r]%N)+N)%N;spinPeint();spinPaye(R);}
    else{spinSonsStop();spinDonne(R);SPIN.roule=false;}} /* machine fermée en plein tirage : le lot est donné quand même */
  requestAnimationFrame(pas);}
function spinSonsStop(){if(SPIN.mot){try{SPIN.mot.stop(.12);}catch(e){}SPIN.mot=null;}if(SPIN.tz){try{SPIN.tz.stop(.08);}catch(e){}SPIN.tz=null;}} // (2026-10-15 soir) les boucles de la machine se taisent (fin du tirage, fermeture)
function spinMoteur(st,V,t){const h=SPIN.mot;if(!h)return;let k=0;for(let r=0;r<3;r++){const S=st[r];k+=S.fin?0:S.ph===0?S.v/V:Math.max(0,1-(t-S.ts)/Math.max(.05,S.D));} /* la vitesse moyenne des rouleaux (0-1) : le moteur monte avec l'élan, ralentit à chaque pose */
  k/=3;if(Math.abs(k-(SPIN.motK||0))<.03)return;SPIN.motK=k;try{h.gain(-16+13*Math.min(1,k),.06);h.rate(.7+.45*Math.min(1,k),.06);}catch(e){}}
/* (2026-10-19, Sacha : « le jackpot doit faire gagner une voiture épique ») LA VOITURE DU JACKPOT : une ÉPIQUE pas encore à toi, au hasard — de
   celles qui se vendent à l'argent du jeu (ni défi, ni euros), ni retirée, ni promise par une MISSION (les secrètes restent à gagner). -1 : il n'en
   reste plus, le 7 verse son `cash`. */
function spinEpique(){
  const mis={};try{M2.forEach(function(m){if(m.r&&m.r.car)mis[m.r.car]=1;});}catch(e){}
  const L=[];for(let i=0;i<CARS.length;i++){const u=CAR_UNLOCK[i];
    if(carRar(i)!=='epique'||carRetiree(i)||!u||!u.p||u.k||carEuros(i)||mis[CARS[i].name]||carUnlockedVrai(i))continue;L.push(i);}
  return L.length?L[(Math.random()*L.length)|0]:-1;}
function spinDonne(R){ // le lot, dans la sauvegarde — l'argent au compte, les bons dans leurs tiroirs, le jeton au plateau, la caisse au garage
  const L=R.lot;R.car=-1;R.cash=L.cash|0;
  if(L.voiture){const i=spinEpique();if(i>=0){if(!Array.isArray(SAVE.d.owned))SAVE.d.owned=[];if(SAVE.d.owned.indexOf(i)<0)SAVE.d.owned.push(i);
    try{carWas[i]=true;}catch(e){} /* la machine la fête : la course suivante ne la recrie pas « NOUVELLE CAISSE » */R.car=i;R.cash=0;}}
  if(R.cash){SAVE.d.bank=Math.min(1e30,bank()+R.cash);gagneAjoute(R.cash);SPIN.total+=R.cash;}
  if(L.bon)SAVE.d[L.bon]=Math.min(3,(SAVE.d[L.bon]|0)+1);
  if(L.jeton)SAVE.d.spinJ=Math.min(9,(SAVE.d.spinJ|0)+L.jeton);
  SAVE.flush();}
function spinPaye(R){ // le gain : donné TOUT DE SUITE, puis l'écran de la machine le raconte
  spinDonne(R);const L=R.lot,gros=R.i>=2,jack=L.id==='sept',C=R.cash|0,V=R.car>=0; /* (2026-10-19) C = l'argent VERSÉ (0 quand le 7 donne une caisse), V = une caisse gagnée */
  SPIN.gEl.className='spGain '+(jack?'jackpot':gros?'gros':R.i>=0?'lot':'conso')+(V?' voit':'');
  SPIN.gEl.innerHTML=(R.i>=0?spinIco(R.i,'spGIco'):'')+'<div class="spGTx"><small>'+sansAcc(TR(L.nm))+'</small>'
    +(V?'<b class="voit">'+sansAcc(TR(CARS[R.car].name))+'</b><small class="rar">'+sansAcc(TR('VOITURE ÉPIQUE'))+'</small>'
       :C?'<b>+'+fmtC(0)+'</b>':'<b class="bon">'+sansAcc(TR(L.sous||''))+'</b>')+'</div>';
  if(V)setTimeout(function(){ /* la PHOTO de la caisse gagnée (celle de la boutique) remplace le 7 — après les éclats : la prise de vue coûte une image */
    if(!SPIN.ouvert||!SPIN.gEl||!SPIN.gEl.classList.contains('voit'))return;
    try{carPhoto(R.car,function(u){const ic=SPIN.gEl&&SPIN.gEl.querySelector('.spGIco');if(!u||!ic||!SPIN.ouvert)return;
      const im=document.createElement('img');im.className='spGPh';im.alt='';im.src=u;ic.replaceWith(im);});}catch(e){}},700);
  if(C){const b=SPIN.gEl.querySelector('b'),T0=performance.now(),D=jack?1500:gros?950:600;let last=0;
    (function monte(now){const u=Math.min(1,(now-T0)/D),v=C*(1-Math.pow(1-u,3));b.textContent='+'+fmtC(v);
      if(u<1&&now-last>70){last=now;try{if(SONV2)sfx('spin.piece');}catch(e){}} /* (session SON) les pièces qui tombent dans le bac */
      if(u<1&&SPIN.ouvert)requestAnimationFrame(monte);else b.textContent='+'+fmtC(C);})(T0);}
  if(R.i>=0){SPIN.el.classList.add('gagne');if(jack)SPIN.el.classList.add('jackpot');
    setTimeout(function(){if(SPIN.el)SPIN.el.classList.remove('gagne','jackpot');},jack?3200:1600);}
  try{if(SONV2){if(jack)sfx('spin.jackpot');else if(R.i<0&&R.s[0]===R.s[1]){sfx('spin.presque');sfx('spin.gain',{var:0,vol:-11,t:.75});}else sfx('spin.gain',{var:gros?1:0,vol:R.i<0?-6:0});}}catch(e){} /* (session SON) les gains de la machine — (2026-10-15 soir) deux pareils et le 3e à côté : le PRESQUE, puis la consolation tout bas */
  if(jack){hap([30,60,40,80,60,120,90]);spinFlash(3);spinPluie(46);spinExplose(40);}
  else if(gros){hap([20,40,30]);spinExplose(16);}
  else if(R.i>=0)hap(14);
  spinLabels();try{window.__mFill();}catch(e){}SPIN.roule=false;}
function spinFlash(n){ // les éclats du jackpot : 3 PAR SECONDE AU PLUS (règle des flashs), de l'or pâle, jamais du blanc plein
  const fl=SPIN.el.querySelector('.spFlash');for(let i=0;i<n;i++)setTimeout(function(){try{fl.animate([{opacity:0},{opacity:.55},{opacity:0}],{duration:260,easing:'ease-out'});}catch(e){}},i*340);}
function spinPluie(n){ // la pluie de billets : des liasses qui tombent sur tout l'écran en se balançant
  const P=SPIN.el.querySelector('.spPluie'),W=VP.w||innerWidth,Hh=VP.h||innerHeight;
  for(let i=0;i<n;i++){const d=document.createElement('i');d.className='spBillet';d.style.left=(Math.random()*W).toFixed(0)+'px';P.appendChild(d);
    const dx=(Math.random()*2-1)*60,r0=Math.random()*360,du=1600+Math.random()*1300;
    try{d.animate([{transform:'translate(-50%,-40px) rotate('+r0.toFixed(0)+'deg)',opacity:1},{transform:'translate(calc(-50% + '+(dx*.5).toFixed(0)+'px),'+(Hh*.5).toFixed(0)+'px) rotate('+(r0+180).toFixed(0)+'deg)',opacity:1,offset:.5},
      {transform:'translate(calc(-50% + '+dx.toFixed(0)+'px),'+(Hh+40).toFixed(0)+'px) rotate('+(r0+360).toFixed(0)+'deg)',opacity:.9}],{duration:du,delay:Math.random()*900,easing:'linear'}).onfinish=function(){d.remove();};}catch(e){d.remove();}}}
function spinExplose(n){ // les pièces qui jaillissent de la machine
  const el=SPIN.el,m=el.querySelector('.spVitre').getBoundingClientRect(),cx=m.left+m.width/2,cy=m.top+m.height/2;
  for(let i=0;i<n;i++){const d=document.createElement('i');d.className='spIco spS5 spPart';d.style.left=cx+'px';d.style.top=cy+'px';el.appendChild(d);
    const a=Math.random()*Math.PI*2,R9=(n>20?150:90)+Math.random()*(n>20?240:120),dx=Math.cos(a)*R9,dy=Math.sin(a)*R9-70,rot=(Math.random()*2-1)*540;
    try{d.animate([{transform:'translate(-50%,-50%) scale(.4) rotate(0deg)',opacity:1},{transform:'translate(calc(-50% + '+(dx*.7).toFixed(0)+'px),calc(-50% + '+(dy*.7).toFixed(0)+'px)) scale(1.1) rotate('+(rot*.6).toFixed(0)+'deg)',opacity:1,offset:.55},
      {transform:'translate(calc(-50% + '+dx.toFixed(0)+'px),calc(-50% + '+(dy+160).toFixed(0)+'px)) scale(.85) rotate('+rot.toFixed(0)+'deg)',opacity:0}],{duration:1100+Math.random()*700,easing:'cubic-bezier(.32,.72,0,1)',delay:Math.random()*120}).onfinish=function(){d.remove();};}catch(e){d.remove();}}}
/* LE DÉPART BOOSTÉ : appliqué quand une partie DÉMARRE (le guetteur voit passer « fin ou menu » → « en course », hors reprise de seconde chance),
   après les remises à zéro de resetGame — la nitro pleine du palier, le moteur au palier 1 (ses pièces comptées). */
function spinDepart(){
  if(!((SAVE.d.spinBoost|0)>0)||SANDBOX||TUTO.on||PARK.on||BALADE)return;
  SAVE.d.spinBoost=(SAVE.d.spinBoost|0)-1;SAVE.mark();
  const T=ENGINE_TIERS[1];if(T){coinsGot=Math.max(coinsGot,T.coins|0);engTier=Math.max(engTier,1);}
  nitroR=Math.max(nitroR,(ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).res||2);
  try{spinSprites();toast(spinIco(4,'mini')+' '+sansAcc(TR('DÉPART BOOSTÉ')),true);}catch(e){}try{if(SONV2)sfx('nitro.pleine');}catch(e){}hap([10,30,20]);}
setInterval(function(){try{ // le guetteur : la machine après l'écran de fin (et l'offre de seconde chance) ; le départ boosté au début d'une partie
  if(!SPIN.on)return;
  const enCourse=started&&!gameOver;
  if(enCourse&&!SPIN.enCourse&&!(typeof CHANCE!=='undefined'&&CHANCE.used))spinDepart();SPIN.enCourse=enCourse;
  if(SPIN.ouvert){if(!(started&&gameOver)||garageOn)spinFerme();return;}
  const ok=(SAVE.d.spinJ|0)>0&&started&&gameOver&&!SANDBOX&&!garageOn&&!ecranWipe._on&&!chanceAttend()&&!M2REV.on&&!!document.querySelector('#mDead.on'); /* (24/10, relecture) …ni pendant la révélation d'une secrète (#m2Rev) : la machine (z-index 250) la couvrait, sa scène se jouait derrière */
  if(!ok){SPIN.vu0=0;return;}
  if(!SPIN.vu0)SPIN.vu0=performance.now();else if(performance.now()-SPIN.vu0>1100)spinOuvre();
}catch(e){}},200);
addEventListener('keydown',function(e){if(!SPIN.ouvert)return;if(e.code==='Enter'||e.code==='Space'){e.preventDefault();e.stopPropagation();if(!e.repeat)spinTirer(false);}},true); // au clavier : la machine prend la main
window.dbgJeton=function(d){ /* (banc) un jeton posé d mètres devant la caisse, sur sa face — pour le voir et le prendre */
  const ss=s+(d||70),lt=0;frameAt(ss,F);mat4b.makeBasis(F.b,F.n,F.t);
  for(const face of [1,-1]){const m=mkJeton(face);m.position.copy(F.p).addScaledVector(F.b,lt).addScaledVector(F.n,face>0?2.6:-(THICK+2.6));
    m.quaternion.setFromRotationMatrix(mat4b);m.updateMatrix();m.matrixAutoUpdate=false;scene.add(m);
    pickups.push({s:ss,lat:lt,face:face,nitro:false,spin:true,mesh:m,taken:false,ax:F.n.clone().multiplyScalar(face)});}
  return ss;};
window.dbgSpin=function(n,force){if(n!=null){SAVE.d.spinJ=Math.max(0,Math.min(9,n|0));SAVE.mark();}if(force)SPIN.force=force;
  return {on:SPIN.on,jetons:SAVE.d.spinJ|0,ouvert:SPIN.ouvert,roule:SPIN.roule,pose:SPIN.pose,total:SPIN.total,force:SPIN.force,
    bons:{chanceG:SAVE.d.chanceG|0,spinBoost:SAVE.d.spinBoost|0},levier:SPIN.lv?+SPIN.lv.th.toFixed(2):0,
    surPiste:pickups.filter(function(p){return p.spin&&!p.taken&&p.face===1;}).length};};
