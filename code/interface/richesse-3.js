// ---- LE TIRAGE ----
function richTire(mu,combo){
  const R=RICH;R.n.coups++;
  if(R.force){const f=R.force;R.force=null;if(f==='rien'||f==='presque'){R.sec++;}else R.sec=0;return f;}
  let p=.36+.07*(combo-1)+(R.chance>0?.18:0);if(R.chance>0)R.chance--;  // ~1 sur 2 AU FINAL (Fiorillo 2003 : base .36 + le filet des 3 coups secs + le trèfle ≈ .5 mesuré) ; l'effort (le combo) et le trèfle font monter
  if(R.sec>=3)p=1;                                                      // pas d'extinction : la 4e fois, ça paie
  if(Math.random()>=p){R.sec++;return Math.random()<.38?'presque':'rien';}
  R.sec=0;const e=Math.min(1,(combo-1)/4),w=[.80-.48*e,.17+.17*e,.028+.20*e,.002+.11*e];// l'effort fait monter la TAILLE (14/10 : plus fort — un coup seul : petit 80 % · jackpot 0,2 % ; en rafale de 5 : petit 32 % · gros 23 % · jackpot 11 %)
  let r=Math.random()*(w[0]+w[1]+w[2]+w[3]);const k=['petit','bon','gros','jackpot'];for(let i=0;i<4;i++){if(r<w[i])return k[i];r-=w[i];}return 'petit';
}
function richPioche(W){let s=0;for(const k in W)s+=W[k];let r=Math.random()*s;for(const k in W){if(r<W[k])return k;r-=W[k];}return 'billet';}
function richSort(t){const L=RICH.libres[t];let best=null;for(const o of L){if(!o.on)return o;if(!best||o.age/o.vie>best.age/best.vie)best=o;}return best;} // un libre, sinon le plus vieux
/* (2026-10-20, Léo : « est-ce qu'il y a bien tous les fruits qui peuvent apparaître ? qu'il y en ait toujours autant, mais qu'ils varient
   tout autant qu'on en a ») LE SABOT DES FRUITS : les 13 fruits étaient tirés au hasard AVEC remise — un fruit sur sept ou huit par gerbe, et
   le même pouvait sortir trois fois pendant qu'un autre ne venait jamais. Désormais ils sont BATTUS puis servis un par un sans retour :
   tous passent avant qu'un revienne, et le premier d'un sabot neuf n'est jamais le dernier servi. La quantité de fruits ne change pas. */
function richFruitK(){const R=RICH;if(!R.sabot||!R.sabot.length){const S=FRUIT_DEFS.map(function(_,i){return i;});for(let i=S.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)),t=S[i];S[i]=S[j];S[j]=t;}
    if(S.length>1&&S[S.length-1]===R.fruitDer){const t=S[0];S[0]=S[S.length-1];S[S.length-1]=t;}R.sabot=S;}
  const k=R.sabot.pop();R.fruitDer=k;return k;}
function richLance(t,P,n,d,delai,kv,mat){ // (rend l'objet lancé ; mat : la matière imposée — le billet vert d'une liasse qui craque)
  if(t==='chaine'){richChaine(P,n,d,delai,kv);return null;}
  const o=richSort(t);if(!o)return null;const D=RICH_T[t],rr=(a)=>a[0]+Math.random()*(a[1]-a[0]),m=o.m;
  if(t==='fruit'){const k9=richFruitK(),g9=fruitGeo(k9);if(!g9.boundingSphere)g9.computeBoundingSphere();m.geometry=g9;o.fr=(RICH_FRUIT_R[FRUIT_DEFS[k9].n]||.35)/Math.max(.05,g9.boundingSphere.radius);}else o.fr=1; // chaque fruit à SA taille
  if(t==='jeton')m.material=RICH.M.jetons[Math.floor(Math.random()*RICH.M.jetons.length)]; // une couleur, une valeur
  const montreArg=t==='montre'&&Math.random()<.5;m.material=t==='montre'?(montreArg?RICH.M.montreArg:RICH.M.montre):m.material; // la dorée ou l'argentée
  if(t==='champagne'){const k9=Math.floor(Math.random()*RICH.G.vins.length);m.geometry=RICH.G.vins[k9];m.material=RICH.M.vins[k9];} // (2026-10-16) le champagne ou l'un de ses quatre cousins
  if(t==='fleur'){m.geometry=RICH.G.fleurs[Math.floor(Math.random()*RICH.G.fleurs.length)];o.A=(.5+Math.random()*1.1)*(Math.random()<.5?-1:1);} // (2026-10-16) une des six fleurs ; o.A : sa vitesse de rotation sur sa tige
  if(t==='billet'){m.material=mat||RICH.M.billets[Math.floor(Math.random()*RICH.M.billets.length)];o.bi=mat?TC_BIL_100:tcBilTire();o.wr=tcBilWear();} // (2026-10-10) une valeur, une couleur · (2026-10-25) o.bi : sa valeur pour les cubes, tirée comme celle de la traînée
  o.on=true;o.age=-delai;o.vie=rr(D.vie);o.s=rr(D.s);o.ph=Math.random()*6.28;o.fd=Math.random()*6.28;
  o.fv=.4;o.mode=0;o.ec=t==='liasse'&&Math.random()<.5?.42+Math.random()*.45:0; // une liasse sur deux CRAQUE en vol (richEclate)
  const sp=rr(D.v)*(kv||1);RICH.v1.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize();
  o.v.copy(n).multiplyScalar(sp).addScaledVector(RICH.v1,sp*.6).addScaledVector(d,-sp*.15);
  richVise(o.v); // …et presque rien VERS l'objectif (de près, une myrtille couvrait l'écran) // DEBOUT, l'écran est étroit : la gerbe s'ouvre moins sur les côtés (elle sortait du cadre en 0,4 s)
  m.position.copy(P).addScaledVector(n,.12).addScaledVector(RICH.v1,.15);
  m.quaternion.setFromEuler(RICH.eu.set(Math.random()*6.28,Math.random()*6.28,Math.random()*6.28));
  const ws=rr(D.w);if(D.flip){if(D.flip==='y')RICH.v2.set(Math.cos(o.ph),0,Math.sin(o.ph));else RICH.v2.set(Math.cos(o.ph),Math.sin(o.ph),0);RICH.v2.applyQuaternion(m.quaternion);o.w.copy(RICH.v2).multiplyScalar(ws);} // la pièce (et la carte) tourne sur un DIAMÈTRE : elle « flashe »
  else if(D.face){m.lookAt(camera.position);m.rotateY((Math.random()-.5)*.8);o.w.set((Math.random()-.5)*.6,(Math.random()<.5?-1:1)*ws,(Math.random()-.5)*.6);} // le crâne : il te regarde, puis tourne sur lui-même
  else o.w.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(ws);
  if(D.flip==='y'){o.pa.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize();o.pw=(1.2+Math.random()*2.6)*(Math.random()<.5?-1:1);}else o.pw=0; // (2026-10-10) la pièce VOILE : l'axe de sa rotation tourne lentement
  if(D.papier)richPapier(o);
  if(D.pop){o.pt=Math.max(.45,o.vie*(.3+Math.random()*.55));o.vie=o.pt+.34;o.fv=.05;o.popS=0;m.material.uniforms.uPop.value=0;if(m.children[0])m.children[0].scale.setScalar(2.2);} // (2026-10-16) le cœur ÉCLATERA à son heure (o.pt), chacun la sienne
  // les facettes qui peuvent renvoyer le soleil (repère de l'objet)
  o.nl=D.nl||null;let gc=D.gc||[1,.9,.68];
  if(montreArg)gc=[.9,.95,1]; // l'éclat de l'acier : blanc-bleu
  if(t==='crane'){const mc=RICH.M.cranes[Math.floor(Math.random()*RICH.M.cranes.length)];m.children[0].material=mc;gc=mc.userData.gc;} // un pastel au hasard, son éclat à sa teinte
  if(o.nl&&!o.gl){for(const g of RICH.gl)if(!g.o){g.o=o;o.gl=g;break;}}
  if(o.gl){o.gl.s.material.rotation=Math.random()*3;o.gl.s.material.color.setRGB(gc[0],gc[1],gc[2]);}
  m.visible=false;m.scale.setScalar(1e-4);
  if(t==='trefle')RICH.chance=2; // le trèfle porte chance
  return o;
}
/* (2026-10-10, Léo : « essaie d'ajouter à l'animation un peu de complexité ») LE PAPIER QUI TOMBE COMME UNE FEUILLE (billets, trèfles) :
   la giclée le lance en vrac, puis il se POSE sur l'air — en FEUILLE MORTE (deux fois sur trois : il se balance d'un bord sur l'autre autour
   de son long côté et glisse en zigzag, le bord qui mène se relève en bout de course, il cale, repart — il ralentit en haut de chaque
   balancement et file au creux) ou en CULBUTE (il tourne bout sur bout, et ça le fait planer de côté, comme une carte lancée) ; dans les
   deux cas il vire lentement. La face reste un peu tournée vers l'objectif (sinon on ne verrait le papier que par la tranche). */
function richPapier(o){
  o.mode=Math.random()<.36?2:1;const a=Math.random()*6.2832;o.ax.set(Math.cos(a),0,Math.sin(a));o.gd.crossVectors(RICH_UP,o.ax);
  if(o.mode===2){o.om=(5+Math.random()*4)*(Math.random()<.5?-1:1);o.G=1.3+Math.random()*1.3;}else{o.om=3.3+Math.random()*1.9;o.A=.5+Math.random()*.42;o.G=.9+Math.random()*.9;}
  o.yr=(Math.random()-.5)*1.3;o.kb=.18+Math.random()*.22;}
function richPapierTick(o,dt,k,kp,cp){const m=o.m,R=RICH;
  const wl=o.w.length();if(wl>1e-4){R.q.setFromAxisAngle(R.v1.copy(o.w).divideScalar(wl),wl*dt);m.quaternion.premultiply(R.q);}
  o.w.multiplyScalar(Math.exp(-dt*(.4+2.2*kp)));                                                    // la giclée s'essouffle…
  if(kp<1)o.w.addScaledVector(R.v1.set(Math.random()-.5,Math.random()-.5,Math.random()-.5),RICH_T[o.t].fl*.9*k*(1-kp)); // (…en basculant au gré de l'air)
  if(kp<=0)return;
  const ph=o.om*o.age+o.ph,ax=R.v4.copy(o.ax).applyAxisAngle(RICH_UP,o.yr*o.age),gd=R.v5.copy(o.gd).applyAxisAngle(RICH_UP,o.yr*o.age);
  if(o.mode===1){const Z=R.v6.copy(cp).sub(m.position).normalize().multiplyScalar(.85).add(RICH_UP).normalize(); // FEUILLE MORTE
    R.v1.copy(ax).addScaledVector(Z,-ax.dot(Z)).normalize();R.v2.crossVectors(Z,R.v1);R.mx.makeBasis(R.v1,R.v2,Z);R.q2.setFromRotationMatrix(R.mx);
    R.q3.setFromAxisAngle(R.v1,o.A*Math.sin(ph));R.q2.premultiply(R.q3);                            // le balancement (le bord qui mène se relève en bout de course)
    m.position.addScaledVector(gd,o.G*Math.cos(ph)*dt*kp);m.position.y-=.6*o.G*Math.cos(2*ph)*dt*kp; // il glisse d'un bord sur l'autre ; file au creux, cale en haut
  }else{R.v2.copy(ax);R.v1.crossVectors(R.v2,RICH_UP);R.mx.makeBasis(R.v1,R.v2,RICH_UP);R.q2.setFromRotationMatrix(R.mx); // CULBUTE : l'axe court à l'horizontale
    R.q3.setFromAxisAngle(ax,ph);R.q2.premultiply(R.q3);m.position.addScaledVector(gd,o.G*Math.sign(o.om)*dt*kp);}       // bout sur bout, et il plane de côté
  m.quaternion.slerp(R.q2,1-Math.exp(-dt*14*kp));}                                                // l'allure le rattrape (sans à-coup)
function richEclate(L){ // (2026-10-10) LA LIASSE QUI CRAQUE : la bande saute, le paquet s'ouvre en ÉVENTAIL — cinq à sept billets VERTS (le 100 de la liasse) qui partent en feuilles ; le paquet vidé s'efface en 0,12 s
  const m=L.m,R=RICH,n=5+Math.floor(Math.random()*3);L.vie=L.age+.12;L.fv=.12;
  R.v4.set(0,0,1).applyQuaternion(m.quaternion);R.v5.set(1,0,0).applyQuaternion(m.quaternion);camera.getWorldDirection(R.v6);const P0=R.H.copy(m.position);
  for(let i=0;i<n;i++){const o=richLance('billet',P0,R.v4,R.v6,i*.022,1,R.M.billets[RICH_B100]);if(!o)continue;
    const u=i/(n-1)-.5,sd=Math.random()<.5?-1:1;
    o.v.copy(L.v).multiplyScalar(.55).addScaledVector(R.v4,sd*(1.4+Math.random()*1.8)).addScaledVector(R.v5,u*3.4);o.v.x+=(Math.random()-.5)*1.2;o.v.y+=(Math.random()-.5)*1.2;o.v.z+=(Math.random()-.5)*1.2;
    o.m.position.copy(P0).addScaledVector(R.v5,u*.35*L.s).addScaledVector(R.v4,sd*.04);o.m.quaternion.copy(m.quaternion);o.m.rotateZ(u*1.1); // en éventail
    o.w.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(2+Math.random()*4);o.kb=.12+Math.random()*.2;}
  if(SONV2)try{sfx('fourgon.billets',{vol:-7});}catch(e){}
}
function richVise(v){ // l'élan, recadré : DEBOUT (écran étroit) la gerbe s'ouvre moins sur les côtés (elle sortait du cadre en 0,4 s), et presque rien ne part VERS l'objectif (de près, une myrtille couvrait l'écran)
  const kl=Math.min(1,camera.aspect*1.1);RICH.v2.set(1,0,0).applyQuaternion(camera.quaternion);v.addScaledVector(RICH.v2,-v.dot(RICH.v2)*(1-kl)*.85);v.multiplyScalar(.78+.22*kl);
  camera.getWorldDirection(RICH.v2);const vf=v.dot(RICH.v2);if(vf<0)v.addScaledVector(RICH.v2,-vf*.65);
  if(v.y>0)v.y*=.4;} // …et peu vers le HAUT : l'air les y emporte déjà (un coup sur le toit vidait le cadre en une demi-seconde)
function richChaine(P,n,d,delai,kv){ // LA CHAÎNE D'OR : des nœuds reliés à distance fixe (contraintes), chacun freiné par l'air — elle fouette, se tord, ondule
  let C=null;for(const c of RICH.ch)if(!c.on){C=c;break;}if(!C){C=RICH.ch[0];for(const c of RICH.ch)if(c.age/c.vie>C.age/C.vie)C=c;}
  const D=RICH_T.chaine,rr=function(a){return a[0]+Math.random()*(a[1]-a[0]);},K=C.K;C.on=true;C.age=-delai;C.vie=rr(D.vie);C.L=rr(D.s)/(K-1);
  const sp=rr(D.v)*(kv||1);RICH.v3.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize();
  const base=RICH.v2.copy(n).multiplyScalar(sp).addScaledVector(RICH.v3,sp*.5);richVise(base);const bx=base.x,by=base.y,bz=base.z;
  const dir=RICH.v1.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize(),ax=RICH.v3.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().cross(dir).normalize(),om=4+Math.random()*6;
  for(let i=0;i<K;i++){const u=i-(K-1)/2,i3=i*3;C.P[i3]=P.x+n.x*.15+dir.x*u*C.L;C.P[i3+1]=P.y+n.y*.15+dir.y*u*C.L;C.P[i3+2]=P.z+n.z*.15+dir.z*u*C.L;
    C.V[i3]=bx+ax.x*u*C.L*om+(Math.random()-.5);C.V[i3+1]=by+ax.y*u*C.L*om+(Math.random()-.5);C.V[i3+2]=bz+ax.z*u*C.L*om+(Math.random()-.5);C.kd[i]=D.kd*(.8+Math.random()*.4);}
  for(const m of C.links){m.visible=false;m.scale.setScalar(1e-4);}
  if(!C.gl){for(const g of RICH.gl)if(!g.o){g.o=C;C.gl=g;g.s.material.rotation=Math.random()*3;g.s.material.color.setRGB(1,.9,.68);break;}}
}
const RICH_X=new THREE.Vector3(1,0,0),RICH_QR=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2);
function richChaineTick(dt,cp){
  for(const C of RICH.ch){if(!C.on)continue;C.age+=dt;if(C.age<0)continue;
    if(C.age>=C.vie){C.on=false;for(const m of C.links)m.visible=false;if(C.gl){C.gl.s.visible=false;C.gl.o=null;C.gl=null;}continue;}
    const K=C.K,P=C.P,V=C.V,Pp=C.Pp,k=Math.min(dt,.05),W=RICH.W;
    if(!RICH.gel){for(let i=0;i<K;i++){const i3=i*3,kd=C.kd[i]*k;Pp[i3]=P[i3];Pp[i3+1]=P[i3+1];Pp[i3+2]=P[i3+2];
        V[i3]-=V[i3]*kd;V[i3+1]+=(W-V[i3+1])*kd;V[i3+2]-=V[i3+2]*kd;P[i3]+=V[i3]*k;P[i3+1]+=V[i3+1]*k;P[i3+2]+=V[i3+2]*k;}}
    for(let it=0;it<5;it++)for(let i=0;i<K-1;i++){const a=i*3,b=a+3,dx=P[b]-P[a],dy=P[b+1]-P[a+1],dz=P[b+2]-P[a+2],l=Math.hypot(dx,dy,dz)||1e-6,f=(l-C.L)/l*.5; // les maillons ne s'étirent pas
      P[a]+=dx*f;P[a+1]+=dy*f;P[a+2]+=dz*f;P[b]-=dx*f;P[b+1]-=dy*f;P[b+2]-=dz*f;}
    if(!RICH.gel)for(let i=0;i<K*3;i++)V[i]=(P[i]-Pp[i])/k;                                    // la vitesse = ce que la chaîne a VRAIMENT fait
    const a9=C.age,pop=a9<.14?(function(u){return 1+2.2*(u-1)*(u-1)*(u-1)+1.2*(u-1)*(u-1);})(a9/.14):1,fin=Math.min(1,(C.vie-a9)/.4),mi=(K>>1)*3;
    const dc=Math.hypot(P[mi]-cp.x,P[mi+1]-cp.y,P[mi+2]-cp.z),pres=Math.min(1,Math.max(0,(dc-2.2)/2.6)),sc=C.L*1.32/3.52*pop*fin*pres;
    for(let j=0;j<K-1;j++){const m=C.links[j],a=j*3;m.position.set((P[a]+P[a+3])*.5,(P[a+1]+P[a+4])*.5,(P[a+2]+P[a+5])*.5);
      RICH.v1.set(P[a+3]-P[a],P[a+4]-P[a+1],P[a+5]-P[a+2]).normalize();m.quaternion.setFromUnitVectors(RICH_X,RICH.v1);if(j&1)m.quaternion.multiply(RICH_QR); // un maillon sur deux, tourné d'un quart
      m.scale.setScalar(Math.max(1e-4,sc));m.visible=pres>0;}
    if(C.gl){const m=C.links[(K>>1)-1];RICH.cam.copy(cp).sub(m.position).normalize();RICH.H.copy(SUN_DIR).add(RICH.cam).normalize();RICH.v2.set(0,0,1).applyQuaternion(m.quaternion); // le maillon du milieu qui renvoie le soleil
      const g=Math.pow(Math.abs(RICH.v2.dot(RICH.H)),90)*pres,s=C.gl.s;if(g>.04){s.visible=true;s.position.copy(m.position).addScaledVector(RICH.cam,.2);const sz=C.L*fin*6*(.45+g*1.1);s.scale.set(sz,sz,1);s.material.opacity=Math.min(1,g*1.4)*fin;}else s.visible=false;}
  }}
function richFlamme(P,n,k,or){ // le jet : bref, léger, quelques bouffées qui s'ouvrent et montent
  const nb=Math.round(5+4*k);
  for(let i=0;i<nb;i++){let f=null;for(const x of RICH.fl)if(x.age>=x.vie){f=x;break;}if(!f)break;
    const u=i/nb;f.p.copy(P).addScaledVector(n,.05+u*.5*k);f.v.copy(n).multiplyScalar((2.5+Math.random()*3)*k).add(RICH.v1.set((Math.random()-.5)*1.2,.8+Math.random(),(Math.random()-.5)*1.2));
    f.age=-u*.05;f.vie=.2+Math.random()*.16+.05*k;f.r0=(.12+.1*u)*k;f.r1=(.5+.5*u)*k;
    if(or)f.c.setRGB(1,.82,.42);else f.c.setRGB(1,.62+.2*Math.random(),.32);f.s.visible=false;}
}
function richEtincelles(P,n,d,nb,heat){ // la gerbe : un cône autour du rebond, quelques-unes rasent la tôle
  const S=RICH.sp;if(!S)return;RICH.v2.copy(d).reflect(n);
  for(let k=0;k<nb;k++){const i=S.i;S.i=(S.i+1)%S.n;const tang=Math.random()<.25;
    RICH.v1.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize();
    if(tang)RICH.v1.addScaledVector(n,-RICH.v1.dot(n)).normalize();else RICH.v1.multiplyScalar(.75).add(RICH.v2).add(n).normalize();
    const sp=(tang?9:12)+Math.random()*(tang?12:20);
    S.P[i*3]=P.x;S.P[i*3+1]=P.y;S.P[i*3+2]=P.z;S.V[i*3]=RICH.v1.x*sp;S.V[i*3+1]=RICH.v1.y*sp;S.V[i*3+2]=RICH.v1.z*sp;
    const vie=.25+Math.random()*.45*(.7+heat*.5);S.L[i]=vie;S.L0[i]=vie;S.Hh[i]=Math.min(1.2,.85+Math.random()*.25+heat*.25);S.Wd[i]=.008+Math.random()*.012;S.K[i]=Math.random()<.22?1:0;}
  S.m.visible=true;
}
function richTemp(T,o,k){ // le métal qui refroidit : blanc → jaune → orange → rouge sombre (k = la lumière, au-delà de 1 le halo s'en mêle)
  let r,g,b;if(T>.82){r=1;g=1;b=.85+.15*(T-.82)/.18;}else if(T>.58){const u=(T-.58)/.24;r=1;g=.72+.28*u;b=.3+.55*u;}
  else if(T>.3){const u=(T-.3)/.28;r=1;g=.32+.4*u;b=.06+.24*u;}else{const u=Math.max(0,T/.3);r=.15+.85*u;g=.03+.29*u;b=.01+.05*u;}
  o[0]=r*k;o[1]=g*k;o[2]=b*k;}
const RICH_C=[0,0,0];
// ---- LE COUP (appelé par chuteTape) ----
function richCoup(P,n,d,mu,combo){
  if(!RICH.pret)return;const heat=Math.min(1,(combo-1)/4);                    // l'anticipation : le combo CHAUFFE les étincelles
  richEtincelles(P,n,d,Math.round(28+14*mu),heat); // (14/10) l'impact : plus d'étincelles (ce ne sont pas des objets)
  const r=richTire(mu,combo);RICH.last=r;
  if(r==='rien')return;
  const P9=P.clone(),n9=n.clone(),d9=d.clone();
  if(r==='presque'){RICH.n.presque++;                                          // presque : une seule pièce s'échappe, mollement
    setTimeout(function(){try{if(!CHUTE.on)return;richLance(['piece2','piece1','piece50'][Math.floor(Math.random()*3)],P9,n9,d9,0,.55);if(SONV2){if(richSon())sfx('riche.piece',{st:RICH_PD[Math.floor(Math.random()*3)],vol:-6});else sfx('piece',{st:Math.floor(Math.random()*3),vol:-7});}}catch(e){}},90);return;}
  const T9=RICH_TIER[r];RICH.n.gains++;if(r==='jackpot')RICH.n.jackpot++;
  setTimeout(function(){try{if(!CHUTE.on)return;                              // 80 ms : le souffle, puis la flamme crache
    richFlamme(P9,n9,T9.fl,r==='jackpot'||r==='gros');richEtincelles(P9,n9,d9,Math.round(12*T9.fl),1);
    const nb=T9.n[0]+Math.floor(Math.random()*(T9.n[1]-T9.n[0]+1)),etal=r==='jackpot'?.38:r==='gros'?.22:.12;
    const M9=RICH.mat9={g:0,v:0,f:0};for(let i=0;i<nb;i++){const ty=richPioche(T9.w),D9=RICH_T[ty]||{},lourd=D9.flip==='y'||ty==='or'||ty==='lingot'; // (2026-10-10) LA GERBE EN DEUX TEMPS : le métal part d'abord, sec ; le papier suit et s'étale
      if(ty==='diamant'||ty==='rubis'||ty==='emeraude'||ty==='bague')M9.g=1;else if(ty==='champagne')M9.v=1;else if(ty==='fleur')M9.f=1; // (les matières de la gerbe, pour ses sons)
      richLance(ty,P9,n9,d9,lourd?Math.random()*etal*.55:D9.papier||ty==='liasse'?.05+Math.random()*etal*1.25:Math.random()*etal,r==='jackpot'?1.2:1);}
    if(Math.random()<.04)richLance('crane',P9,n9,d9,etal*.5,1); // de temps en temps, un CRÂNE pastel
    {const NU=RICH_NUEE[r];if(NU&&Math.random()<NU[0]){RICH.popI=0;const nc=NU[1]+Math.floor(Math.random()*(NU[2]-NU[1]+1));let t9=.03;for(let i=0;i<nc;i++){t9+=.03+Math.pow(Math.random(),2.2)*.38; // (2026-10-16) LA NUÉE : de petits cœurs, en plus de la gerbe, qui éclatent un à un — et (Léo : « plus irréguliers, on les voit trop en groupe ») ils s'ÉCHAPPENT un par un, à intervalles irréguliers (parfois deux d'affilée, parfois un silence), chacun sa vitesse, sa direction et son point de départ autour de la caisse
      const o9=richLance('coeur',P9,n9,d9,t9,(r==='jackpot'?1.15:.95)*(.55+Math.random()*.9));
      if(o9){RICH.v1.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(1.5+Math.random()*2.5);o9.v.add(RICH.v1);richVise(o9.v);o9.m.position.add(RICH.v1.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).multiplyScalar(1.2));}}}}
    if(SONV2){const ri=richSon();if(ri)sfx('riche.'+r); // (2026-10-16) LA GERBE PAIE : sa cascade à elle (petit → bon → gros → jackpot), au juste milieu — la course garde les pièces de Sacha
      if(r==='petit'){sfx('fourgon.billets',{vol:-1,t:.04});if(!ri)sfx('piece',{st:2,vol:-4,t:.05});}
      else if(r==='bon'){sfx('fourgon.billets',{vol:-1,t:.06});if(!ri)sfx('piece.recolte',{vol:-1});}
      else if(r==='gros'){if(!ri)sfx('argent.gros');sfx('fourgon.billets',{vol:-3,t:.1});}
      else{if(!ri)sfx('fig.jackpot');sfx('pluie.billets',{t:.25,vol:-3});}
      const M9=RICH.mat9;if(M9.g)sfx('riche.gemme',{t:.1});if(M9.v){sfx('riche.verre',{t:.08});if(Math.random()<.5)sfx('riche.bouchon',{t:.02});}if(M9.f)sfx('riche.fleurs',{t:.12});} // et ses MATIÈRES : le cristal des gemmes, le verre des vins (et un bouchon qui saute), le souffle des fleurs
    if(r==='jackpot'){CHUTE_TAP.sh=Math.min(1.8,CHUTE_TAP.sh+.8);try{hap([20,30,20,30,60]);}catch(e){}}else if(r==='gros'){try{hap([16,24,30]);}catch(e){}}
    if(r==='jackpot'||r==='gros')setTimeout(function(){try{if(!CHUTE.on)return; // (2026-10-10) LA RÉPLIQUE : la caisse en recrache une poignée (pièces surtout), un temps après
      richEtincelles(P9,n9,d9,r==='jackpot'?12:7,1);const m9=r==='jackpot'?4+Math.floor(Math.random()*2):1+Math.floor(Math.random()*2);
      for(let i=0;i<m9;i++)richLance(['piece2','piece1','piece50','piece2','piece1','billet','or'][Math.floor(Math.random()*7)],P9,n9,d9,Math.random()*.1,.8); /* (14/10) la réplique, plus maigre aussi */
      if(SONV2){if(richSon())sfx('riche.petit',{vol:-5});else sfx('piece.recolte',{vol:-6});}}catch(e){}},r==='jackpot'?430:340);
  }catch(e){}},80);
}
// ---- CHAQUE IMAGE (appelé par chuteTapeTick) ----
function richTick(dt,C){
  if(!RICH.pret)return;richChauffeTick(C);
  if(!RICH.bc){if(!TC_BIL)tcBilBati();RICH.bc=tcPool(960,'s');} // (2026-10-25, Léo : « dans le menu ciel, les mêmes billets que la traînée ») les billets éjectés sont les CUBES de la traînée : la même piscine (même programme : 0 compilé de plus), recomposée à chaque image
  RICH.bc.n=0;if(RICH.chauffe>0)tcBoxM(RICH.bc,RICH.v2.set(0,-99,0),RICH.q,1e-4,0,0,0,1e-4,1e-4,1e-4,0,0,0); // sous l'écran titre : un cube minuscule, pour que le programme se compile là
  const U=RICH_U,cp=camera.position;U.uT.value+=dt;U.uSunDir.value.copy(SUN_DIR);U.uSunCol.value.copy(sun.color).multiplyScalar(Math.max(.6,sun.intensity));
  U.uSky.value.copy(hemi.color).multiplyScalar(hemi.intensity);U.uGnd.value.copy(hemi.groundColor).multiplyScalar(hemi.intensity);U.uEnv.value=envTex;
  // les objets
  for(const t in RICH.libres){const D=RICH_T[t];for(const o of RICH.libres[t]){if(!o.on)continue;const m=o.m;
    o.age+=dt;if(o.age<0)continue;if(o.age>=o.vie){o.on=false;m.visible=false;if(o.gl){o.gl.s.visible=false;o.gl.o=null;o.gl=null;}continue;}
    if(RICH.gel){const wl=o.w.length();if(wl>1e-4){RICH.q.setFromAxisAngle(RICH.v1.copy(o.w).divideScalar(wl),wl*dt);m.quaternion.premultiply(RICH.q);}m.scale.setScalar(o.s*o.fr);m.visible=true;}
    else{const k=Math.min(dt,.05);o.v.x+=D.kd*(0-o.v.x)*k;o.v.y+=D.kd*(RICH.W-o.v.y)*k;o.v.z+=D.kd*(0-o.v.z)*k;                // l'air qui remonte (la caisse tombe)
    const ub=(o.age-o.kb)/.5,kp=o.mode?(ub<=0?0:ub>=1?1:ub*ub*(3-2*ub)):0;                       // (2026-10-10) le papier se pose sur l'air (richPapier)
    if(D.fl&&kp<1){const f=Math.sin(o.age*6.3+o.ph)*D.fl*(1-kp);o.v.x+=Math.cos(o.fd+o.age*.7)*f*k;o.v.z+=Math.sin(o.fd+o.age*.7)*f*k;o.v.y+=Math.cos(o.age*12.6+o.ph)*D.fl*.35*k*(1-kp);} // il PAPILLONNE
    m.position.addScaledVector(o.v,dt);
    if(o.mode)richPapierTick(o,dt,k,kp,cp);
    else if(D.fleur){m.lookAt(cp);m.rotateX((m.geometry.userData.vue||.95)+Math.sin(o.age*1.1+o.fd)*.2);m.rotateY(o.age*o.A+o.ph);m.rotateZ(Math.sin(o.age*1.6+o.ph)*.18);} // (2026-10-16) la fleur : penchée vers toi selon SA forme (userData.vue : l'hibiscus de face, la tulipe et le lilas de profil), elle tourne lentement sur sa tige et se balance
    else if(D.bat){m.lookAt(cp);m.rotateY(Math.sin(o.age*1.9+o.ph)*.62);m.rotateZ(Math.sin(o.age*1.3+o.fd)*.24);} // (2026-10-15) le cœur ne tourne pas sur lui-même (de profil ce n'était plus qu'une goutte) : il se BALANCE en flottant, toujours de face
    else{const wl=o.w.length();if(wl>1e-4){RICH.q.setFromAxisAngle(RICH.v1.copy(o.w).divideScalar(wl),wl*dt);m.quaternion.premultiply(RICH.q);}
      if(D.fl)o.w.multiplyScalar(Math.exp(-dt*.4)).addScaledVector(RICH.v1.set(Math.random()-.5,Math.random()-.5,Math.random()-.5),D.fl*.9*k);} // le billet bascule au gré de l'air
    if(o.pw){o.w.applyAxisAngle(o.pa,o.pw*dt);o.w.multiplyScalar(Math.exp(-dt*.16));}             // la pièce qui voile : les éclats tombent quand on ne les attend pas
    if(o.ec&&o.age>=o.ec){o.ec=0;richEclate(o);}                                                   // la liasse qui craque
    }const a9=o.age,pop=a9<.14?(function(u){return 1+2.2*(u-1)*(u-1)*(u-1)+1.2*(u-1)*(u-1);})(a9/.14):1,fin=Math.min(1,(o.vie-a9)/o.fv); // il JAILLIT (petit dépassement), puis s'efface
    const dc=m.position.distanceTo(cp),pres=RICH.gel?1:Math.min(1,Math.max(0,(dc-2.2)/2.6)); // trop près de l'objectif : il s'efface (comme les nuages) — sauf figé au banc (vitrine, étal : on les regarde de près)
    let bt=1;if(D.bat){const u9=(a9*1.3+o.ph)%1;bt=1+.13*Math.exp(-((u9-.06)*(u9-.06))/.0018)+.08*Math.exp(-((u9-.24)*(u9-.24))/.0018);} // (2026-10-15) le cœur BAT : poum-poum (~78 battements/min, chacun à sa phase)
    if(D.pop){const pp=Math.min(1,Math.max(0,(o.age-o.pt)/.34));m.material.uniforms.uPop.value=pp;if(m.children[0])m.children[0].scale.setScalar(2.2*Math.max(0,1-pp*1.7)); // (2026-10-16) POP : ses cubes filent (RICH_VS_COEUR), son aura s'éteint
      if(pp>0&&!o.popS){o.popS=1;for(const f of RICH.fl)if(f.age>=f.vie){f.p.copy(m.position);f.v.set(0,.6,0);f.age=0;f.vie=.22;f.r0=o.s*.3;f.r1=o.s*1.7;f.c.setRGB(1,.78,.9);break;} // un éclat blanc rosé
        const t9=performance.now();if(SONV2&&!(RICH.popT>t9-45)){RICH.popT=t9;try{const i9=RICH.popI=(RICH.popI||0)+1;if(richSon())sfx('riche.coeur',{st:RICH_MEL[(i9-1)%RICH_MEL.length],vol:-4});else sfx('ui.appui',{vol:-7});}catch(e){}}}} // (2026-10-16) et son « plop » : chaque pop prend le degré suivant de la gamme — la nuée qui éclate un à un CHANTE (pas plus d'un tous les 45 ms)
    m.scale.setScalar(Math.max(1e-4,o.s*o.fr*pop*fin*pres*bt));m.visible=pres>0;
    if(t==='billet'){m.visible=false;if(pres>0)tcBilletMesh(RICH.bc,m,o.bi,TC_PSEQ[((o.age*3+o.ph)|0)%6],o.wr);} // le billet éjecté : ses cubes, posés là où sa physique le met
    if(o.gl){ // LE BLING : une facette qui renvoie le soleil vers l'œil
      RICH.cam.copy(cp).sub(m.position).normalize();RICH.H.copy(SUN_DIR).add(RICH.cam).normalize();let g=0;
      for(const nl of o.nl){RICH.v2.set(nl[0],nl[1],nl[2]).applyQuaternion(m.quaternion);const c=RICH.v2.dot(RICH.H);if(c>0)g=Math.max(g,Math.pow(c,D.gp||(D.gem?60:D.flip==='y'?64:110)));}
      if(D.gem)g=Math.max(g,.18+.18*Math.sin(o.age*23+o.ph)); // la gemme vit toujours un peu
      const s=o.gl.s;g*=pres;if(g>.04){s.visible=true;s.position.copy(m.position).addScaledVector(RICH.cam,o.s*1.1);const sz=o.s*fin*(D.gs||(D.gem?3.4:D.flip==='y'?3.1:2.6))*(.45+g*1.1);s.scale.set(sz,sz,1);s.material.opacity=Math.min(1,g*1.4)*fin;}
      else s.visible=false;}}}
  tcFinY(RICH.bc);
  richChaineTick(dt,cp); // les chaînes d'or
  // la flamme
  for(const f of RICH.fl){if(f.age>=f.vie){if(f.s.visible)f.s.visible=false;continue;}f.age+=dt;if(f.age<0)continue;const u=f.age/f.vie;if(u>=1){f.s.visible=false;continue;}
    f.v.multiplyScalar(Math.exp(-dt*4));f.v.y+=6*dt;f.p.addScaledVector(f.v,dt);const s=f.s;s.visible=true;s.position.copy(f.p);
    const r=f.r0+(f.r1-f.r0)*(1-(1-u)*(1-u));s.scale.set(r,r,1);s.material.opacity=.6*Math.sin(Math.PI*Math.min(1,u*1.4))*(1-u*.4);
    s.material.color.copy(f.c).multiplyScalar(1-.45*u);}
  // les étincelles
  const S=RICH.sp;if(S&&S.m.visible&&!RICH.chauffe){let viv=0;const pos=S.pos,col=S.col,cpx=cp.x,cpy=cp.y,cpz=cp.z,kd=Math.exp(-dt*2.6);
    for(let i=0;i<S.n;i++){const o=i*12;
      if(S.L[i]<=0){if(col[o]||col[o+1]||col[o+3]){for(let j=0;j<12;j++)col[o+j]=0;}continue;}
      S.L[i]-=dt;viv++;const i3=i*3;let vx=S.V[i3]*kd,vy=S.V[i3+1]*kd+4*dt,vz=S.V[i3+2]*kd;S.V[i3]=vx;S.V[i3+1]=vy;S.V[i3+2]=vz;
      const px=S.P[i3]+=vx*dt,py=S.P[i3+1]+=vy*dt,pz=S.P[i3+2]+=vz*dt;
      const u=Math.max(0,S.L[i]/S.L0[i]);
      if(S.K[i]&&u<.55){S.K[i]=0;for(let c=0;c<2;c++){const j=S.i;S.i=(S.i+1)%S.n;if(j===i)continue;const a=(c?1:-1)*(.3+Math.random()*.3); // ÇA ÉCLATE en deux, comme sous la meule
          S.P[j*3]=px;S.P[j*3+1]=py;S.P[j*3+2]=pz;S.V[j*3]=(vx*Math.cos(a)-vz*Math.sin(a))*.75;S.V[j*3+1]=vy*.75+(Math.random()-.5)*3;S.V[j*3+2]=(vx*Math.sin(a)+vz*Math.cos(a))*.75;
          S.L[j]=S.L[i]*.8;S.L0[j]=S.L[j];S.Hh[j]=S.Hh[i]*u;S.Wd[j]=S.Wd[i]*.7;S.K[j]=0;}}
      const sp=Math.hypot(vx,vy,vz)||1,len=Math.min(.9,sp*.03+.04),dx=vx/sp,dy=vy/sp,dz=vz/sp;     // le trait : sa longueur = sa vitesse (le filé)
      let ax=cpx-px,ay=cpy-py,az=cpz-pz;const al=Math.hypot(ax,ay,az)||1;ax/=al;ay/=al;az/=al;
      let sx=dy*az-dz*ay,sy=dz*ax-dx*az,sz=dx*ay-dy*ax;const sl=Math.hypot(sx,sy,sz)||1,T=S.Hh[i]*(.3+.7*Math.sqrt(u)),w=S.Wd[i]*(.6+.4*u),fo=Math.min(1,u*4);sx*=w/sl;sy*=w/sl;sz*=w/sl; // le métal reste chaud, puis s'éteint en FONDU (plus de tirets rouges qui traînent)
      const tx=px-dx*len,ty=py-dy*len,tz=pz-dz*len;
      pos[o]=px-sx;pos[o+1]=py-sy;pos[o+2]=pz-sz;pos[o+3]=px+sx;pos[o+4]=py+sy;pos[o+5]=pz+sz;
      pos[o+6]=tx-sx*.3;pos[o+7]=ty-sy*.3;pos[o+8]=tz-sz*.3;pos[o+9]=tx+sx*.3;pos[o+10]=ty+sy*.3;pos[o+11]=tz+sz*.3;
      richTemp(T,RICH_C,1.8*fo*(.78+.22*Math.sin(S.L[i]*90+i)));col[o]=col[o+3]=RICH_C[0];col[o+1]=col[o+4]=RICH_C[1];col[o+2]=col[o+5]=RICH_C[2]; // la tête : la chaleur (qui scintille un peu)
      richTemp(T*.75,RICH_C,.42*fo);col[o+6]=col[o+9]=RICH_C[0];col[o+7]=col[o+10]=RICH_C[1];col[o+8]=col[o+11]=RICH_C[2];}                         // la queue : déjà plus froide
    S.vivant=viv;S.m.geometry.attributes.position.needsUpdate=true;S.m.geometry.attributes.color.needsUpdate=true;if(!viv)S.m.visible=false;}
}
function richRange(){ // on quitte le ciel : tout se range
  if(!RICH.pret)return;for(const t in RICH.libres)for(const o of RICH.libres[t]){o.on=false;o.m.visible=false;if(o.gl){o.gl.s.visible=false;o.gl.o=null;o.gl=null;}}
  if(RICH.bc){RICH.bc.n=0;tcFinY(RICH.bc);} // les billets en cubes rentrent aussi
  if(RICH.ch)for(const c of RICH.ch){c.on=false;for(const m of c.links)m.visible=false;if(c.gl){c.gl.s.visible=false;c.gl.o=null;c.gl=null;}}
  for(const f of RICH.fl){f.age=f.vie=1;f.s.visible=false;}if(RICH.sp){RICH.sp.L.fill(0);RICH.sp.m.visible=false;RICH.sp.vivant=0;}
}
/* LE MODELÉ DE LA CAISSE AU TITRE (2026-10-03, Léo : « travailler encore plus en profondeur le shading de la caisse, sans faire trop »).
   MESURÉ avant : deux lampes posées SUR la caméra (la clé et la lampe de caisse) éclairaient toutes les faces vues de face d'un même
   aplat — la caisse se lisait comme un découpage. Les quatre lampes du titre (aucune de plus : elles sont toutes déjà en scène) jouent
   maintenant le ciel autour d'elle : l'AMBIANCE baissée sur la caisse (`amb` : c'est elle qui aplatissait) et le SOLEIL de la scène
   (`sol` : placé derrière la caméra pour les nuages, il l'éclairait de face — les nuages n'en lisent que la couleur) · la CLÉ chaude
   HAUTE (`sk`, `kh` : du côté du soleil vers le zénith — le toit et le capot plus clairs que les flancs, l'arrière dans l'ombre) · un
   ZÉNITH froid léger (`sc`) · le CONTRE-JOUR qui la détoure (`sr`). Banc studio.mjs (planches A/B, `dbgChute({fige})`) : f1 retenu, un cran plus clair (amb .55, sol .7, sk 1.6 : à .5/.6 la caisse tirait au brun dans le menu entier).
   ⚠ Le REBOND par en dessous (`sb`, la lampe trailLight) blanchissait les vitres latérales et les pneus (le reflet d'une lampe basse) : 0.
   Doses modérées : du volume, pas un effet. P.studio = 0 : l'éclairage d'avant. */
const CHUTE_ST={c:new THREE.Vector3(),r:new THREE.Vector3(),u:new THREE.Vector3()}; // (ses vecteurs à lui : CHUTE.v1 est le HAUT de la caisse, encore lu après)
function chuteStudio(C,up,P){
  const toC=CHUTE_ST.c.copy(CHUTE.cam).sub(C).normalize(),BT=BIOMES.titre||BIOMES[MENU_BIO];
  /* (2026-10-07, LE TOUR SANS FIN) À CONTRE-JOUR : le regard qui fait le tour passe du côté opposé au soleil, et la face vue n'était plus
     éclairée que par l'ambiance baissée — une SILHOUETTE NOIRE sur un tiers du tour (planche des 8 angles). `cj` (0 au plan de face, 1 quand
     la caméra regarde le soleil) rend un peu d'ambiance et allume le REBOND côté caméra (plus bas, `fc`) ; la clé suit aussi, quand elle est
     allumée. Au plan de face cj = 0 : le modelé choisi le 03/10 ne bouge pas. P.cj = 0 et P.vb = 0 : comme avant. */
  const sh9=Math.hypot(SUN_DIR.x,SUN_DIR.z)||1,th9=Math.hypot(toC.x,toC.z)||1;let cj=THREE.MathUtils.clamp((.1-(toC.x*SUN_DIR.x+toC.z*SUN_DIR.z)/(sh9*th9))/.7,0,1);cj=cj*cj*(3-2*cj)*(P.cj!=null?P.cj:1);
  hemi.intensity=(BT.hemiI!=null?BT.hemiI:.78)*P.amb*(1+(P.cjA!=null?P.cjA:.5)*cj);sun.intensity=(BT.sunI!=null?BT.sunI:1.6)*P.sol; /* (sol) la force du soleil — les nuages n'en lisent que la COULEUR */ /* L'AMBIANCE BAISSÉE (amb) : c'est elle qui aplatissait — les nuages ne la lisent pas (ils prennent les COULEURS de l'hémisphère, pas son intensité) ; bioApply la repose en quittant le titre */
  stallKey.color.setHex(P.cleS!=null?P.cleS:0xffeedd);stallKey.intensity=P.sk*P.cle*2*(1+.3*cj);stallKey.distance=40; /* (les heures du titre) cleS : la clé prend la couleur de l'heure */
  CHUTE_ST.r.copy(SUN_DIR).multiplyScalar(1-P.kh).addScaledVector(AXIS_Y,P.kh).normalize(); // (kh) la clé : du côté du soleil (0) jusqu'au zénith (1)
  {const oc9=Math.cos(CHUTE.oA),os9=Math.sin(CHUTE.oA),x9=CHUTE_ST.r.x,z9=CHUTE_ST.r.z;CHUTE_ST.r.x=x9*oc9-z9*os9;CHUTE_ST.r.z=x9*os9+z9*oc9;} // (le tour sans fin) la clé TOURNE AVEC LE REGARD (l'éclairagiste suit le caméraman) : la caisse garde, à tous les angles, le modelé du plan de face
  if(cj>0)CHUTE_ST.r.multiplyScalar(1-cj).addScaledVector(toC,cj).addScaledVector(AXIS_Y,(P.cjH!=null?P.cjH:.12)*cj).normalize(); // (le tour sans fin) à contre-jour, la clé passe du côté de la caméra, presque à hauteur : de l'autre côté, la gîte tourne vers nous le flanc d'en DESSOUS
  stallKey.position.copy(C).addScaledVector(CHUTE_ST.r,9).addScaledVector(toC,1.5);
  carLight.color.setHex(P.zenC!=null?P.zenC:0xe6eeff);carLight.intensity=P.sc;carLight.distance=26;carLight.position.copy(C).addScaledVector(AXIS_Y,10).addScaledVector(toC,1.5);
  /* (le tour sans fin) LE VENTRE : de derrière, la caisse qui pique du nez montre son DESSOUS — un châssis sombre qu'aucune lampe d'en haut
     ne touche (une plaque brune sur 3 vues sur 8). La mer de nuages en dessous, au soleil, le renvoie : le rebond (`sb`, éteint au plan de
     face où il blanchissait vitres et pneus) monte avec `ve` = la part du dessous tournée vers la caméra, à la couleur de la mer de l'heure. */
  const uq=CHUTE_ST.u.copy(up).applyQuaternion(CHUTE_TAP.Q),ve=THREE.MathUtils.clamp(-(uq.x*toC.x+uq.y*toC.y+uq.z*toC.z)*1.8,0,1)*(P.vb!=null?P.vb:0),fc=cj*(P.cjF!=null?P.cjF:0),fi=Math.max(ve,fc); /* fc : À CONTRE-JOUR, le même rebond éclaire le flanc vu (presque à hauteur : la gîte le tourne vers le bas) — la clé (stallKey) n'est allumée au ciel qu'après un passage par l'atelier : on ne compte pas dessus */
  CHUTE.lum9=[+cj.toFixed(2),+ve.toFixed(2)];if(fi>0){const T9=TITRE_CIEL[TITRE_HF.h]||TITRE_CIEL.matin;trailLight.color.setRGB(T9.mh[0],T9.mh[1],T9.mh[2]);}else trailLight.color.setHex(0xfff6ea);
  trailLight.intensity=P.sb+fi;trailLight.distance=26;if(fi>0){const wv=ve/(ve+fc+1e-6);trailLight.position.copy(C).addScaledVector(AXIS_Y,-2-7*wv).addScaledVector(toC,6);}else trailLight.position.copy(C).addScaledVector(AXIS_Y,-9).addScaledVector(toC,3);
  camera.getWorldDirection(CHUTE_ST.r).multiplyScalar(1-P.rimS).addScaledVector(SUN_DIR,P.rimS).normalize();
  stallRim.color.setHex(P.rimC);stallRim.intensity=P.rim*P.sr;stallRim.distance=40;stallRim.position.copy(C).addScaledVector(CHUTE_ST.r,7).addScaledVector(AXIS_Y,2.5);
}
function chuteVoulue(){return CHUTE_OK&&garageOn&&!!gEl&&gEl.classList.contains('menu')&&!gEl.classList.contains('missions');}
function chutePlan(){ // (titre v3) le REGARD se règle sur le SOLEIL (lumière de côté : le volume des nuages), la caisse au-dessus de TOUTE la piste
  CHUTE.L=L;const P9=CHUTE_P,sx=SUN_DIR.x,sz=SUN_DIR.z,sn=Math.hypot(sx,sz)||1,ca=Math.cos(P9.az),sa=Math.sin(P9.az);
  let lx9=(sx*ca-sz*sa)/sn,lz9=(sx*sa+sz*ca)/sn;if((-lz9*sx+lx9*sz<0)!==(P9.az<0)){lx9=(sx*ca+sz*sa)/sn;lz9=(-sx*sa+sz*ca)/sn;} // le soleil à DROITE de l'image, à P.az du regard (az < 0 : à GAUCHE)
  CHUTE.lh.set(lx9,0,lz9).normalize();
  let gx=0,gz=0,n9=0,yM=-1e9;const sF=Math.min(L-1,3200);                       // LA DESTINATION : le début de la piste (son centre), et le sommet de toute la piste
  for(let s9=0;s9<=L-1;s9+=40){frameAt(s9,F);if(F.p.y>yM)yM=F.p.y;if(s9<=sF){gx+=F.p.x;gz+=F.p.z;n9++;}}
  CHUTE.G.set(gx/Math.max(1,n9),yM,gz/Math.max(1,n9));CHUTE.s=Math.min(L-1,600);
  frameAt(CHUTE.s,F);
  if(CHUTE.sol){const R=F.p,lx=CHUTE.lh.x,lz=CHUTE.lh.z;let k=0;                     // LE PLANCHER : une mer de cumulus SOUS la route, devant la caméra
    for(const sp of CHUTE.sol){const a=(k*2.399)%6.2832,r=90+Math.sqrt((k+.5)/CHUTE.sol.length)*980,fw=Math.max(-.2,Math.cos(a));k++;
      const px=R.x+lx*(r*fw*.9+120)+(-lz)*Math.sin(a)*r,pz=R.z+lz*(r*fw*.9+120)+lx*Math.sin(a)*r,w9=150+((k*53)%100)*1.9;
      sp.position.set(px,R.y-CHUTE_P.sous-((k*37)%60),pz);sp.scale.set(w9,w9*.52,1);sp.material.rotation=((k*71)%20-10)*.01;}}
}
function chuteNuageTex(){ // un banc de cumulus peint une fois : des boules douces serrées, le ventre un peu bleuté
  const cv=document.createElement('canvas');cv.width=cv.height=256;const x=cv.getContext('2d');
  const B=[[128,138,70],[82,150,52],[176,150,56],[110,108,50],[154,106,46],[60,168,34],[200,168,36],[128,172,54]];
  for(const b of B){const g=x.createRadialGradient(b[0],b[1],0,b[0],b[1],b[2]);
    g.addColorStop(0,'rgba(255,255,255,.62)');g.addColorStop(.55,'rgba(244,248,255,.34)');g.addColorStop(1,'rgba(226,236,252,0)');x.fillStyle=g;x.fillRect(0,0,256,256);}
  x.globalCompositeOperation='source-atop';const v=x.createLinearGradient(0,70,0,230);v.addColorStop(0,'rgba(255,255,255,0)');v.addColorStop(1,'rgba(150,176,214,.55)');
  x.fillStyle=v;x.fillRect(0,0,256,256);
  const t=new THREE.CanvasTexture(cv);t.minFilter=THREE.LinearFilter;return t;
}
/* LES CUMULUS DE L'ÉCRAN TITRE (titre v3, 2026-10-01, Sacha, capture couchée : « toujours bof — il faut que ça s'inspire de l'écran titre de
   Zelda Tears of the Kingdom »). Le défaut mesuré : la caisse posée sur un PAPIER PEINT (la mer de nuages du dôme, plate), aucun plan
   entre elle et le fond, aucune destination, lumière sans direction. Zelda : on TOMBE dans un ciel qui a de la profondeur, vers un monde.
   Ici : de vrais cumulus (les formes et la matière v8 de GAMEPLAY — `cumulus8`, `nuage8Async`, `nuage8Solo` — rien de neuf à compiler,
   la matière est déjà chauffée au menu) posés À LA MAIN autour de la caisse, à trois profondeurs, dans le repère du regard ; ils MONTENT
   tous à la vitesse de la chute (la parallaxe fait le reste : les proches passent en 15 s, les lointains tiennent la composition une
   minute) et renaissent sous le cadre. `CHUTE_NU` : [droite, devant, rayon, gabarit, vitesse, hauteur de départ] en mètres. */
const CHUTE_NU=[
  // devant (vus debout comme couché)
  // (titre v6) MOINS de cumulus au premier plan : la mer de nuages RESPIRE (une douzaine de « pommes de terre » mangeaient l'image)
  [  60,1700,230,0,.6,-900],[-160, 700,110,1,1,-420],[  50, 330, 30,2,1,-230],[ 150,1000,140,3,.8,-640],[ -60,2600,300,4,.4,-1250],[ -30, 480, 50,3,1,-160],
  // à droite (couché : derrière le titre et les boutons)
  [ 900,1500,240,0,.6,-760],[1500,1700,260,4,.5,-800],[ 800,2600,330,4,.4,-1150],
  // à gauche et tout autour (l'orbite au doigt ne tombe jamais sur un ciel vide)
  [-600,1300,160,0,1,-700],[-1000,400,140,1,1,-380],[-700,-600,150,3,1,-450],[ 300,-1000,180,0,1,-520],[1200,-400,160,1,1,-330],[-200,-1500,220,4,1,-640],
  // (titre v5) LES TOURS DE L'HORIZON : de grands cumulus bourgeonnants à 8-9 km, posés sur la mer, immobiles, noyés dans l'air — l'ÉCHELLE
  // du ciel (essayé : des cumulonimbus à 5 km = des CHAMPIGNONS atomiques qui mangeaient le cadre ; pas d'enclume ici)
  [ 500,8600,560,4,0,-250],[3000,8200,620,6,0,-300],[-1800,8000,480,5,0,-330],
  // (2026-10-07, campagne de debug) deux tours étaient posées à 10,8 et 12,5 km — AU-DELÀ du plan lointain (camera.far 9800) : jamais
  // dessinées, juste payées. Retirées. Le 7e champ (2) rend leurs deux tirages de rotation : la tour de face garde EXACTEMENT sa silhouette.
  [1500,9100,700,5,0,-200,2],
  /* (2026-10-20, Léo : « dans le menu ciel, les nuages du fond encore plats ») LES BANCS DU MILIEU : seize cumulus en cubes posés sur la mer entre la caisse et les tours de l'horizon
     (2,4-6,2 km, tout autour, immobiles) — le tapis ne fait plus seul tout le fond : des volumes à toutes les profondeurs, noyés dans l'air plus ils sont loin. Ajoutés en FIN de liste :
     les silhouettes d'avant ne changent pas (les tirages de rotation suivent l'ordre). */
  [-403,5004,362,0,0,-636],
  [1725,5129,423,1,0,-641],
  [2334,2328,165,3,0,-619],
  [2480,968,207,2,0,-597],
  [2555,164,217,0,0,-678],
  [4198,-2200,242,1,0,-612],
  [2009,-2007,236,3,0,-618],
  [2521,-4895,299,0,0,-708],
  [50,-4497,278,2,0,-637],
  [-793,-2414,204,1,0,-597],
  [-2404,-2100,267,3,0,-703],
  [-5010,-1724,372,0,0,-676],
  [-4192,-380,332,1,0,-592],
  [-5081,2738,371,2,0,-618],
  [-2765,2701,327,3,0,-621],
  [-1335,2408,206,0,0,-718]];
/* LES FORMES D'ABORD (titre v3) : les surfaces fines des cinq gabarits du titre sont demandées à l'ouvrier AU CHARGEMENT DU SCRIPT, avant
   les 96 finesses du ciel de coton (cotonInit, au premier newTrack) — sinon elles attendaient 10 à 15 s derrière elles, et le titre
   montrait pendant ce temps des ÉBAUCHES en grappes de boules. Aucune ébauche ici : un cumulus du titre n'existe à l'image que fini. */
function chuteFormes(){
  if(CHUTE.geo)return;const rg=mulberry32(0xC4A5),G9=[['mediocris',2],['humilis',2],['humilis',1],['mediocris',1],['congestus',2],['mediocris',2],['congestus',2]],geo=[];
  for(const q of G9){const S=cumulus8(q[0],rg);S.seed=Math.floor(rg()*997);const dyU=-(S.base+S.top)*.5,e={g:null};geo.push(e);
    nuage8Async(S,N8_FIN[q[1]],function(r9){const g2=cotonBuf(r9);g2.translate(0,dyU,0);g2.computeBoundingSphere();e.g=g2;
      if(r9.skin&&NUSKIN.on)e.skg=nuSkinGeo(r9.skin,dyU); // (2026-10-21) la PEAU transparente des cumulus du titre aussi
      if(CHUTE.nu)for(const c of CHUTE.nu)if(c.e===e){c.m.geometry=g2;if(e.skg)chuteSkinPose(c);}});}
  CHUTE.geo=geo;CHUTE.rg=rg;
}
function chuteSkinPose(c){if(c.sk||!c.e.skg)return;const sk=new THREE.Mesh(c.e.skg,nuSkinMat());sk.renderOrder=1;sk.frustumCulled=false;sk.castShadow=sk.receiveShadow=false;c.m.add(sk);c.sk=sk;}
function chuteCumulus(){
  if(CHUTE.nu)return;chuteFormes();const geo=CHUTE.geo,rg=CHUTE.rg,vide=new THREE.BufferGeometry();
  /* LEUR MATIÈRE : celle des nuages v8 (même programme, déjà compilé), avec SES réglages de lumière (uK : albédo, soleil, lisière, vapeur ·
     uR : frontière d'ombre, clarté de l'ombre) — le titre veut des blancs plus clairs et des ombres bleutées plus douces que la course */
  const m0=nuage8Solo(),mT=m0.clone();mT.uniforms=Object.assign({},m0.uniforms,{uK:{value:new THREE.Vector4().fromArray(CHUTE_P.K)},uR:{value:new THREE.Vector4().fromArray(CHUTE_P.R)}});
  mT.defines={};mT.customProgramCacheKey=function(){return 'nuage8solo';};CHUTE.nuM=mT;
  const N=[];
  for(const d of CHUTE_NU){if(d[6])for(let k9=0;k9<d[6];k9++)rg(); /* (7e champ) des tirages sautés : voir les tours de l'horizon */
    const e=geo[d[3]],m=new THREE.Mesh(e.g||vide,mT);m.visible=false;m.castShadow=false;m.receiveShadow=false;
    m.scale.set(d[2],d[2],d[2]);m.rotation.y=rg()*6.2832;scene.add(m);const dd=Math.hypot(d[0],d[1]);
    {const c9={m:m,e:e,a:d[0],b:d[1],r:d[2],v:d[4],y:d[5],lo:-(1.2*dd+1.3*d[2]),hi:.1*dd+1.3*d[2]};N.push(c9);if(e.skg)chuteSkinPose(c9);}}
  for(let i=0,n9=CHUTE_PAS!=null?CHUTE_PAS:([4,6,7][PAL.n]||6);i<n9;i++){const e=geo[CHUTE_PAS_G[i%CHUTE_PAS_G.length]],m=new THREE.Mesh(e.g||vide,mT);m.visible=false;m.castShadow=false;m.receiveShadow=false;scene.add(m); /* LES NUAGES DE PASSAGE (voir plus bas), en fin de liste */
    const c9={m:m,e:e,pas:true,i:i,a:0,b:0,r:1,v:0,y:0,lo:0,hi:0,D:0,px:0,pz:0,vp:1};N.push(c9);if(e.skg)chuteSkinPose(c9);}
  CHUTE.nu=N;
}
/* ===== LES NUAGES DE PASSAGE (2026-10-25, Sacha : « je veux qu'on ait l'impression que la voiture tombe vraiment : il faut que les nuages montent, comme si elle les
   croisait dans sa chute — un petit générateur de nuages en bas qui génère des nuages ascendants ») =====
   Les cumulus du titre (CHUTE_NU) tiennent la composition : posés à 330 m et plus, à 14 m/s, ils ne PASSENT pas — on ne sentait pas la chute. Ceux-ci la font :
   quelques cumulus de plus (4 / 6 / 7 selon le palier du téléphone, 4 au plus debout), nés SOUS le cadre, à 40-380 m derrière la caisse dans l'axe du regard (jamais entre l'objectif et
   elle), qui montent tous à la vitesse de la chute (CHUTE_P.pasV, 100 m/s par défaut — 65 au premier essai, « plus vite » de Sacha) — les proches traversent l'écran en ~0,7 s, les lointains en ~3 s, la parallaxe fait
   la profondeur — et renaissent sous le cadre, ailleurs et d'une autre taille, une fois sortis par le haut. Au piqué (JOUER) ils filent comme les autres (vk), sans renaître
   (l'objectif regarde alors vers le bas : « sous le cadre » serait en plein milieu de l'image). Mêmes formes (les gabarits du titre), même matière (CHUTE.nuM, la lumière
   de l'heure) : zéro programme de plus, quelques appels de dessin. « Réduire les animations » : ils montent au pas des autres cumulus.
   `?pas=0` les coupe, `?pas=n` en met n (16 au plus) ; dbgChute({pasV:…}) règle leur vitesse. */
const CHUTE_PAS=(function(){const m=/[?&]pas=(\d+)/.exec(location.search);return m?Math.min(16,+m[1]):null;})(); // null : le nombre du palier (voir chuteCumulus)
const CHUTE_PAS_G=[1,0,2,3]; // les gabarits : humilis et mediocris (les congestus, des tours, restent à l'horizon)
function chutePasNeuf(c,partout){ // (re)naissance d'un nuage de passage, dans le champ de l'objectif : sous le cadre (n'importe où dedans au premier tirage)
  const cp=camera.position,C0=CHUTE.C,R=Math.random;let fx=C0.x-cp.x,fz=C0.z-cp.z;const fl=Math.hypot(fx,fz)||1;fx/=fl;fz/=fl; // le regard, à plat
  const tV=Math.tan(camera.fov*Math.PI/360),tH=tV*camera.aspect,D=fl+40+340*R()*R();           // la distance à l'objectif : plus souvent près
  const a=(R()*2-1)*D*tH,r=D*(.07+.11*R());                                                    // de côté, dans le champ · le rayon : 4 à 10° vus d'ici
  c.px=cp.x+fx*D-fz*a;c.pz=cp.z+fz*D+fx*a;c.r=r;c.D=D;c.vp=.85+.3*R();c.m.scale.set(r,r,r);c.m.rotation.y=R()*6.2832;
  const hv=D*tV+1.3*r;c.y=cp.y-C0.y-hv+(partout?2*hv*R():0);                                  // c.y : la hauteur par rapport à l'ancre, comme les autres cumulus
}
function chutePasTick(c,dt,vk,go,vis){ // un nuage de passage, chaque image (chuteRender) : il monte ; sorti par le haut, il renaît en bas
  if(!c.D)chutePasNeuf(c,true);
  const P=CHUTE_P,lent=document.documentElement.getAttribute('data-reduced-motion')==='1',C0=CHUTE.C;
  c.y+=(lent?P.vit:(P.pasV||100)*c.vp)*vk*dt;
  if(!go&&C0.y+c.y-camera.position.y>c.D*Math.tan(camera.fov*Math.PI/360)+1.3*c.r)chutePasNeuf(c,false);
  c.m.visible=vis&&!c.off&&!!c.e.g&&(camera.aspect>=1||c.i<4);c.m.position.set(c.px,C0.y+c.y,c.pz); /* debout, le champ est étroit : quatre au plus */
}
try{if(CHUTE_OK)chuteFormes();}catch(e){} /* (titre v3) au chargement : les formes du titre passent AVANT celles du ciel de coton dans la file de l'ouvrier */
const CHUTE_RONDS=/[?&]ronds=1\b/.test(location.search); // `?ronds=1` rend les bancs de brume ronds du titre
function chuteMonte(){ // les bancs de nuage et les filets de vent (une fois)
  chuteCumulus();
  const tex=chuteNuageTex(),W=[];
  /* (2026-10-21, Léo : « enlève tous les ronds qui n'ont plus rien à voir avec les nouveaux nuages ») plus de bancs de brume RONDS (16 sprites) ni de nappes rondes (30) au titre : les nuages du titre sont les cumulus en cubes */
  for(let i=0;i<(CHUTE_RONDS?16:0);i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,opacity:0,depthWrite:false,fog:false}));
    sp.visible=false;sp.renderOrder=4;scene.add(sp);W.push({sp:sp,x:0,y:0,z:0,s:1,v:1,r:0});}
  for(const w of W)chuteNuageNeuf(w,true);
  CHUTE.w=W;
  const SOL=[];for(let i=0;i<(CHUTE_RONDS?30:0);i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,opacity:.95,depthWrite:false,fog:false}));
    sp.visible=false;sp.renderOrder=-3;scene.add(sp);SOL.push(sp);}
  CHUTE.sol=SOL;
  const N=46,g=new THREE.BufferGeometry(),pos=new Float32Array(N*4*3),col=new Float32Array(N*4*3),idx=[];
  for(let i=0;i<N;i++){const a=i*4;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(idx);
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
  m.frustumCulled=false;m.renderOrder=5;m.visible=false;scene.add(m);
  const S=[];for(let i=0;i<N;i++){S.push({x:0,y:0,z:0,l:1,v:1,w:.06,a:1});chuteFilNeuf(S[i],true);}
  CHUTE.fil={m:m,pos:pos,col:col,S:S};
  try{richInit();}catch(e){console.warn('pluie de richesse',e);} // (2026-10-08) ses programmes se compilent ici, sous l'écran titre
}
function chuteNuageNeuf(w,partout){ // un banc naît sous la caisse, à l'écart de l'axe caméra → caisse
  const a=Math.random()*6.2832,r=9+Math.pow(Math.random(),.7)*52;
  w.x=Math.cos(a)*r;w.z=Math.sin(a)*r;w.y=partout?-95+Math.random()*150:-110-Math.random()*40;
  w.s=16+Math.random()*30;w.v=.75+Math.random()*.55;w.r=(Math.random()-.5)*.6;w.sp.material.rotation=w.r;
}
function chuteFilNeuf(f,partout){const a=Math.random()*6.2832,r=1.6+Math.pow(Math.random(),1.4)*13;
  f.x=Math.cos(a)*r;f.z=Math.sin(a)*r;f.y=partout?-40+Math.random()*80:-40-Math.random()*16;f.l=1.2+Math.random()*3.4;f.v=2.4+Math.random()*1.8;f.w=.025+Math.random()*.05;f.a=.35+Math.random()*.5;}
function chuteVoileEl(){ // le banc de nuage traversé au JOUER : un voile blanc plein écran
  if(CHUTE.voile)return CHUTE.voile;const e=document.createElement('div');e.id='chuteVoile';
  e.style.cssText='position:fixed;inset:0;pointer-events:none;opacity:0;z-index:60;background:radial-gradient(ellipse at 50% 55%,#ffffff 0%,#f4f9ff 48%,#dfeefe 100%)';
  document.body.appendChild(e);CHUTE.voile=e;return e;
}
/* LA CHUTE LIBRE DOUCE (2026-10-14, Léo : « quand on est — et quand on revient — dans le menu ciel, un bruit de chute libre doux ») : au ciel la
   musique joue loin derrière (MUS_CIEL, elle plonge sous ses rafales : voir CHDOUX.h dans musicTick) — on entend l'air qui glisse autour de la caisse qui tombe. Deux souffles :
   un GRAND, grave et rond (bruit passé deux fois sous ~350 Hz), et un plus CLAIR et léger (une bande autour de 900 Hz) qui passe lentement
   d'une oreille à l'autre ; tous deux RESPIRENT (des houles de 2 à 15 s), jamais le claquement des tôles de `chute.vent` (gardé pour le
   piqué de JOUER). Bus des effets (MASTER : curseur EFFETS, interrupteur SON). Créé au 1er passage au ciel, éteint 0,4 s après qu'on le quitte. */
const CHDOUX={n:null,off:0,h:.78},CHDOUX_VOL=.06; // (même soir, Léo : « le vent est fort ») .15 → .06 (−8 dB)
function chuteDoux(t,u){
  if(!AC||AC.state!=='running'||!SND.sfx)return;
  let n=CHDOUX.n;
  if(!n){
    const g=AC.createGain();g.gain.value=0;g.connect(MASTER);
    const s1=AC.createBufferSource();s1.buffer=noiseBuf(3.1);s1.loop=true;
    const f1=AC.createBiquadFilter();f1.type='lowpass';f1.frequency.value=350;f1.Q.value=.4;
    const f1b=AC.createBiquadFilter();f1b.type='lowpass';f1b.frequency.value=700;f1b.Q.value=.3;
    const s2=AC.createBufferSource();s2.buffer=noiseBuf(2.3);s2.loop=true;
    const f2=AC.createBiquadFilter();f2.type='bandpass';f2.frequency.value=900;f2.Q.value=.8;
    const g2=AC.createGain();g2.gain.value=.22;
    const pan=AC.createStereoPanner?AC.createStereoPanner():null;
    s1.connect(f1);f1.connect(f1b);f1b.connect(g);s2.connect(f2);f2.connect(g2);
    if(pan){g2.connect(pan);pan.connect(g);}else g2.connect(g);
    s1.start();s2.start();n=CHDOUX.n={g:g,s1:s1,s2:s2,f1:f1,f2:f2,g2:g2,pan:pan};
  }
  clearTimeout(CHDOUX.off);CHDOUX.off=0;
  const now=AC.currentTime,houle=.78+.16*Math.sin(t*.41)+.08*Math.sin(t*1.07+1.3);CHDOUX.h=houle; // (la musique du ciel la lit : elle plonge sous les rafales)
  stt(n.g.gain,CHDOUX_VOL*houle*(1+.6*u),now,.5);                  // au piqué de JOUER il gonfle (+4 dB ; +8 avant le 16/10 : voir LE PIQUÉ QUI NE CRIE PLUS)…
  stt(n.f1.frequency,330+70*Math.sin(t*.29)+300*u,now,.6);         // …et s'éclaircit un peu
  stt(n.f2.frequency,820+260*Math.sin(t*.53+2)+500*u,now,.6);
  stt(n.g2.gain,.2+.08*Math.sin(t*.67),now,.6);
  if(n.pan)stt(n.pan.pan,.45*Math.sin(t*.23),now,.8);
}
function chuteDouxCoupe(d){const n=CHDOUX.n;if(!n||!AC)return;
  try{n.g.gain.cancelScheduledValues(AC.currentTime);n.g.gain.setTargetAtTime(0,AC.currentTime,d/3);n.g.gain._s9=0;}catch(e){} // (_s9 : la mémoire de stt, pour qu'un retour au ciel le rallume aussitôt)
  clearTimeout(CHDOUX.off);CHDOUX.off=setTimeout(function(){if(CHDOUX.n!==n)return;try{n.s1.stop();n.s2.stop();n.g.disconnect();}catch(e){}CHDOUX.n=null;},d*1000+400);}
window.dbgChuteDoux=function(){return {ciel:!!CHUTE.on,garage:!!garageOn,tait:MUS_TAIT,douxOn:!!CHDOUX.n,douxGain:CHDOUX.n?+CHDOUX.n.g.gain.value.toFixed(4):0,musique:musicEl?{pause:musicEl.paused,vol:+musicEl.volume.toFixed(3),src:(musicEl.src||'').split('/').pop(),t:+musicEl.currentTime.toFixed(2)}:null,mode:musicMode};}; // (dev) le ciel muet, la chute douce, le lobby au garage
function chuteEntre(){ // de l'atelier (ou de rien) au ciel
  MUSAP.t=0; /* (2026-10-15) les RÉGLAGES (écran opaque, la musique au niveau du garage) refermés moins de 1,4 s après un relâcher du curseur : l'extrait levait encore MUS_CIEL au ciel — la musique restait forte une seconde puis retombait d'un coup */
  if(!CHUTE.lc)CHUTE.lc=new THREE.Color();CHUTE.lc.copy(carLight.color);CHUTE_TAP.p.set(0,0,0);CHUTE_TAP.v.set(0,0,0);CHUTE_TAP.Q.identity();CHUTE_TAP.w.set(0,0,0);CHUTE_TAP.tient=null;CHUTE_TAP.sh=0;
  CHUTE.on=true;CHUTE.t=0;CHUTE.sndT=0;TITRE_HF.tc=0;CHUTE.bioPas=-1;CHUTE.bioT=null; /* (2026-10-07) sndT et tc vivaient sur l'horloge d'AVANT (CHUTE.t repart de 0) : le vent restait muet et l'heure périmée jusqu'à 20 s */
  document.body.classList.add('titreCiel');if(!CHUTE.mz)CHUTE.mz=[skyU.uMzA.value.clone(),skyU.uMzB.value.clone(),skyU.uMzT.value.clone(),skyU.uMzO.value.clone(),skyU.uMzH.value.clone(),skyU.uMerLoin.value];CHUTE.oA=CHUTE.oAc=CHUTE.oW=CHUTE.oP=CHUTE.oPc=0;CHUTE.tk=0; // (2026-09-30) l'orbite repart du plan de face — (LE TOUR SANS FIN) et le tour lent s'y engage en douceur
  if(!CHUTE.av)CHUTE.av={c:new THREE.Color()};CHUTE.av.e=acesPass?acesPass.uniforms.uExposure.value:null;if(scene.fog){CHUTE.av.c.copy(scene.fog.color);CHUTE.av.n=scene.fog.near;CHUTE.av.f=scene.fog.far;} // (2026-09-30) l'exposition et la brume d'avant (l'atelier les retrouve)
  if(!CHUTE.w)chuteMonte();
  if(CHUTE.nu)for(const c of CHUTE.nu)if(c.pas)c.D=0; /* (2026-10-25) les nuages de passage renaissent dans le champ du retour (le regard a pu tourner) */
  if(GAR.root)GAR.root.visible=false;garageFloor.visible=false;gEl.classList.add('ciel'); /* (niveau 1 v2) le bandeau du bas prend l'azur profond du ciel (voir #garage.menu.ciel::after) */
  try{if(openGarage._amb){openGarage._amb.stop(.35);openGarage._amb=null;}if(openGarage._feu){openGarage._feu.stop(.35);openGarage._feu=null;}}catch(e){} // l'atelier se tait : là-haut, c'est le vent
  if(CHUTE.entree){const v=chuteVoileEl();v.style.transition='none';v.style.transform='none';v.style.opacity='1';void v.offsetWidth;v.style.transition='opacity .45s ease-out';v.style.opacity='0';} // revenu de la boutique : on sort de l'atelier PAR un nuage
  CHUTE.entree=1;
}
function chuteSort(ferme){ // on quitte le ciel : l'atelier (boutique, missions) ou la course (ferme)
  if(!CHUTE.on&&!CHUTE.go)return;
  try{chuteDoigtMontre(false);}catch(_){} /* (2026-10-15 soir) le doigt de bienvenue ne reste pas sur l'atelier ni sur la course */
  if(CHUTE.corps){carBody.position.set(0,0,0);carBody.rotation.set(0,0,0);CHUTE.corps=false;} // (LA CHUTE LIBRE RÉALISTE) la carrosserie se repose sur ses ressorts
  CHUTE.on=false;CHUTE.go=null;CHUTE.sous=null;titreCiel(false);gEl.classList.remove('ciel');document.body.classList.remove('titreCiel');if(CHUTE.mz){skyU.uMzA.value.copy(CHUTE.mz[0]);skyU.uMzB.value.copy(CHUTE.mz[1]);skyU.uMzT.value.copy(CHUTE.mz[2]);skyU.uMzO.value.copy(CHUTE.mz[3]);skyU.uMzH.value.copy(CHUTE.mz[4]);skyU.uMerLoin.value=CHUTE.mz[5];}if(COTON.root)COTON.root.visible=COTON.n>0;if(CHUTE.nu)for(const c of CHUTE.nu)c.m.visible=false; /* (titre v3) les cumulus du titre se rangent */
  if(CHUTE.snd){try{CHUTE.snd.stop(ferme?.5:.3);}catch(e){}CHUTE.snd=null;} /* (niveau 1 v2) la chute libre se tait */
  try{chuteDouxCoupe(ferme?.5:.35);}catch(e){} // (2026-10-14) …la douce aussi
  trailLight.intensity=0;if(CHUTE.lc)carLight.color.copy(CHUTE.lc);{const BT=BIOMES.titre||BIOMES[MENU_BIO];if(BT.hemiI!=null)hemi.intensity=BT.hemiI;if(BT.sunI!=null)sun.intensity=BT.sunI;} // (2026-10-03) le studio du titre rend l'ambiance (il la baisse sur la caisse), puis la lumière du rebond (à 0 partout ailleurs) et la couleur de la lampe de caisse
  if(CHUTE.w)for(const w of CHUTE.w){w.sp.visible=false;}
  {const T9=CHUTE_TAP;T9.tient=null;T9.sh=0;if(T9.fl)T9.fl.visible=false;if(T9.deb)for(const D of T9.deb)D.m.visible=false;}richRange(); // (la caisse au doigt v2) l'éclat et les morceaux de tôle restent au ciel
  if(CHUTE.fil)CHUTE.fil.m.visible=false;
  if(CHUTE.sol)for(const sp of CHUTE.sol)sp.visible=false;
  trailApercu(0,false);
  if(CHUTE.vent&&AC){try{stt(windG.gain,0,AC.currentTime,.25);stt(whG.gain,0,AC.currentTime,.25);}catch(e){}}CHUTE.vent=false;
  if(ferme)return;
  MENUV.bio=false;bioApply(BIOMES.atelier);if(FSTU.on){paintEnvStudio();finLaque(true);}else paintEnvAtelier();                    // l'atelier reprend sa lumière et son reflet
  if(CHUTE.av){if(acesPass&&CHUTE.av.e!=null)acesPass.uniforms.uExposure.value=CHUTE.av.e;if(scene.fog&&CHUTE.av.n!=null){scene.fog.color.copy(CHUTE.av.c);scene.fog.near=CHUTE.av.n;scene.fog.far=CHUTE.av.f;}} // (2026-09-30) …et son exposition, sa brume
  if(GAR.root)GAR.root.visible=true;
  try{if(SONV2&&!openGarage._amb)openGarage._amb=sfx('garage.ambiance',{loop:true,vol:GAR_AMB_DB});if(SONV2&&!openGarage._feu)openGarage._feu=sfx('garage.feu',{loop:true});}catch(e){}
}
function chuteLance(){ // JOUER, depuis le ciel : elle pique
  CHUTE_TAP.tient=null; // (la caisse au doigt v2) un doigt qui la tenait la lâche
  CHUTE.go=GAR.go={t:0,chute:true,son:false,voile:false};
  gEl.classList.add('launching');document.body.classList.remove('garMenuH');
  pbjDepart(); // (15/10) POUCE BLEU : le morceau de la course entre pendant le piqué (son intro)
  garLacherSon();
}
/* LA CHUTE LIBRE RÉALISTE (2026-10-08, Léo : « la voiture doit avoir davantage un effet de chute libre réaliste »). MESURÉ avant (film de
   24 images) : quatre sinus purs (tangage .9 et 2,3 rad/s, roulis .53 et 1,7) — un balancement de manège, régulier, prévisible ; la caisse
   CLOUÉE au centre de l'image (la caméra visait le même point qu'elle) ; les roues à 7 rad/s, comme si elle roulait encore. Une caisse
   qui tombe à sa vitesse limite, c'est autre chose :
   · L'AIR LA BALLOTTE PAR RAFALES (`chuteRafale` : 0 → 1, une bourrasque toutes les 5 à 10 s) : tangage de fléchette (le nez, plus lourd,
     revient vers le bas et dépasse), roulis qui se cherche, lacet qui dérive — du BRUIT LISSE (`chuteBr`), pas des sinus : rien ne se répète.
   · LE TREMBLEMENT DU VENT : une vibration rapide (9-13 Hz) de la caisse, plus forte dans la rafale.
   · ELLE FLOTTE DANS LE CADRE : deux corps qui tombent ne restent pas collés — la caméra vise une ancre lisse, la caisse dérive autour
     (±25-30 cm) et tressaute ; la vue, elle, garde son tour.
   · LES SUSPENSIONS DÉTENDUES : plus rien ne pèse sur les ressorts — la carrosserie se soulève de ses roues (`det` m) et tressaute dessus.
   · LES ROUES EN ROUE LIBRE : le vent les fait tourner lentement, chacune à son rythme (`roue` rad/s) ; au piqué de JOUER, elles s'emballent.
   Tout est une fonction de `t` (CHUTE.t) : `dbgChute({fige})` fige aussi la chute. `dbgChute({cl:0})` = le balancement d'avant (A/B),
   `cl` dose le tout (1 = le réglage choisi). « Réduire les animations » : ni tremblement ni tressaut. */
function chuteH(i){let h=Math.imul(i^0x9E3779B9,0x85EBCA6B);h^=h>>>13;h=Math.imul(h,0xC2B2AE35);h^=h>>>16;return (h>>>0)/2147483648-1;} // un nombre au hasard FIXE par entier, dans [−1, 1]
function chuteBr(x,k){x+=k*71.37;const i=Math.floor(x),f=x-i,u=f*f*f*(f*(f*6-15)+10),a=chuteH(i+k*7919);return a+(chuteH(i+1+k*7919)-a)*u;} // bruit lisse (quintique : la vitesse ne casse jamais), canal k
function chuteBr2(x,k){return (chuteBr(x,k)+.5*chuteBr(x*2.07+5.3,k+40))/1.5;} // deux octaves
function chuteRafale(t){const g=chuteBr(t*.16,90)*.6+chuteBr(t*.41,91)*.4;return THREE.MathUtils.smoothstep(g,-.15,.55);} // 0 → 1 : la bourrasque
const CHUTE_CL={pa:.09,po:.065,ra:.2,ya:.14,tr:.02,dx:.35,dy:.35,sh:.05,det:.075,ressort:.022,cass:.03,roue:1.1}; /* pa/po tangage lent/oscillation de fléchette (rad), ra roulis, ya lacet, tr tremblement, dx/dy dérive dans le cadre (m), sh tressaut (m), det soulèvement des ressorts (m), ressort tressaut sur les roues (m), cass la carrosserie qui bascule sur ses ressorts (rad), roue rad/s */
function chuteRender(dt){
  if(!CHUTE.on)chuteEntre();
  titreHeureTick(dt); /* (2026-10-05) LES HEURES DU TITRE : l'ambiance de l'heure du téléphone (voir TITRE_H) */
  CHUTE.t=CHUTE_P.fige!=null?CHUTE_P.fige:CHUTE.t+dt;const t=CHUTE.t,P=CHUTE_P,G=CHUTE.go; /* (P.fige : la caisse et la vue figées à cet instant — comparer deux réglages sur la MÊME image) */
  // LE CIEL DU JOUR DES NUAGES (celui de l'accueil d'avant : MENU_BIO), repeint si le voyage BIO est passé derrière
  {const BT=BIOMES.titre||BIOMES[MENU_BIO]; /* (titre v3) l'ambiance du titre */
   if(!MENUV.bio||CHUTE.bioPas!==BIO.pas||CHUTE.bioT!==BT){if(!MENUV.bio||CHUTE.bioT!==BT)paintEnv(BT.env,BT.eS1,BT.eS2);MENUV.bio=true;CHUTE.bioPas=BIO.pas;CHUTE.bioT=BT;bioApply(BT);
     if(!(BT.sunHalo>0)){sunSprite.material.opacity=0;horizonGlow.material.opacity=0;for(const r9 of RAYS)r9.material.opacity=0;}}
   try{finMenu(BT);}catch(e){}} /* (les heures du titre) la NUIT n'a pas de soleil : bioApply laissait le disque à 15 % — (2026-10-20, Léo : « la voiture aussi belle dans le menu ciel ») le ciel du titre en reflets nets + le vernis profond (voir finition.js) */
  skyU.uMer.value=1;if(P.mzA)skyU.uMzA.value.fromArray(P.mzA);if(P.mzB)skyU.uMzB.value.fromArray(P.mzB);if(P.mzT)skyU.uMzT.value.fromArray(P.mzT);if(P.mzO)skyU.uMzO.value.fromArray(P.mzO);if(P.mzH)skyU.uMzH.value.fromArray(P.mzH);if(P.merLoin)skyU.uMerLoin.value=P.merLoin; /* (titre v3) la mer de nuages du titre (rendue par chuteSort) */
  if(CHUTE.nuM){CHUTE.nuM.uniforms.uK.value.fromArray(P.K);CHUTE.nuM.uniforms.uR.value.fromArray(P.R);}
  /* (2026-09-30) LA BRUME ET L'EXPOSITION DE L'AMBIANCE : seule la course les réécrit (updateClouds) — au menu la brume restait le violet
     de départ du jeu (#5e3254) et l'exposition .71 : la mer de nuages et les cumulus s'y noyaient en violet. chuteSort rend celles d'avant. */
  if(scene.fog){const bz9=P.brume*(P.cielT?P.brumeT:1);scene.fog.color.copy(FOG_BASE);scene.fog.near=FOG_N*bz9;scene.fog.far=FOG_F*bz9; /* (titre v5) la brume recule : les tours de l'horizon, à 5 km, restent lisibles */skyU.uFogCol.value.copy(FOG_BASE);} // (P.brume : de là-haut, la brume s'éloigne — la mer de nuages fait sa propre perspective)
  if(acesPass)acesPass.uniforms.uExposure.value=POST_EXPO*P.expo;
  {const T9=titreCiel(!!P.cielT);if(P.cielT&&scene.fog)scene.fog.color.fromArray(T9.h);} /* (titre v4) le ciel du titre, et la brume des cumulus = son horizon */
  if(GAR.root&&GAR.root.visible)GAR.root.visible=false;
  if(COTON.root){const v9=!!P.coton&&COTON.n>0;if(COTON.root.visible!==v9)COTON.root.visible=v9;} /* (CHUTE_P.coton : 1 = les cumulus du niveau au menu) (niveau 1 v2) au menu, de 1 500 m, les cumulus du niveau passaient en BOULES translucides devant la caisse (le « fantôme » de la capture de Sacha) : la mer de nuages suffit — chuteSort les rend */
  if(CHUTE.L!==L)chutePlan();
  // L'ANCRE : au-dessus du début de piste, en retrait, à P.alt mètres
  frameAt(CHUTE.s,F);const lh=CHUTE.lh,sw=Math.sin(t*.11)*.07+Math.sin(t*.047+1.1)*.04; // la vue BALANCE lentement autour de la caisse
  const cA=Math.cos(sw),sA=Math.sin(sw);const lx=lh.x*cA-lh.z*sA,lz=lh.x*sA+lh.z*cA;
  {const ct9=P.cote*(camera.aspect>1?1:.12);CHUTE.C.set(CHUTE.G.x-lh.x*P.avant+lh.z*ct9,CHUTE.G.y+P.alt,CHUTE.G.z-lh.z*P.avant-lh.x*ct9);} // (titre v3) au-dessus du sommet de la piste, en retrait ; la piste un peu à DROITE de la caisse (couché : la caisse est à gauche)
  // LE CAP : de trois-quarts, vers la droite de l'écran et vers la route (P.cap) — le nez plonge de P.pitch
  const rx=-lz,rz=lx;                                                             // la droite de l'écran (regard × haut) : le nez pique vers la DROITE, la traînée file en haut à gauche
  const cl=P.cl!=null?+P.cl:1,K=CHUTE_CL,raf=chuteRafale(t),vib=document.documentElement.getAttribute('data-reduced-motion')!=='1'?cl:0; /* (LA CHUTE LIBRE RÉALISTE) la rafale du moment, et le tremblement (coupé sous « Réduire les animations ») */
  const ya=cl*K.ya*chuteBr2(t*.11,4)+vib*K.tr*.6*(.3+.7*raf)*chuteBr(t*9.3,24),cap9=P.cap+ya; // le lacet dérive (la caisse se cherche une route dans l'air)
  CHUTE.fh.set(rx*Math.cos(cap9)+lx*Math.sin(cap9),0,rz*Math.cos(cap9)+lz*Math.sin(cap9)).normalize();
  /* LA CAISSE EN DIAGONALE (2026-10-08, Léo : « dans le menu ciel du début la voiture nous tourne trop le dos » puis « plus diagonale, qu'on
     voie un peu l'avant et le profil ») — MESURÉ (planche de 8 angles) : la caisse était fixe dans le monde et le regard en faisait le tour,
     elle montrait ses feux arrière et son dessous la MOITIÉ du tour (0° → 180°). Le regard garde son tour (le ciel, le soleil, les cumulus
     tournent comme avant, au doigt aussi) mais la caisse pivote avec lui : toujours vue de trois-quarts avant, nez à droite (303° ↔ 327°, un
     aller-retour par tour). Au piqué (JOUER) le tour s'arrête, son cap aussi : la caméra passe derrière elle comme avant. */
  if(P.face!=null){const h9=P.face+(P.faceA||0)*Math.sin(CHUTE.oA),ps9=CHUTE.oA-h9,c9=Math.cos(ps9),s9=Math.sin(ps9),x9=CHUTE.fh.x,z9=CHUTE.fh.z;CHUTE.fh.x=x9*c9-z9*s9;CHUTE.fh.z=x9*s9+z9*c9;}
  let u=0,pi,ro,dy=0,fwd=0; /* (titre v3) P.gite : elle montre son TOIT à la caméra */
  if(cl>0){const fl=Math.sin(t*2.05+2.2*chuteBr(t*.13,3))*(.35+.65*raf); // la FLÉCHETTE : le nez lourd revient vers le bas et dépasse, plus fort dans la rafale
    pi=P.pitch+cl*(K.pa*chuteBr2(t*.19,1)+K.po*fl)+vib*K.tr*(.3+.7*raf)*chuteBr(t*11.1,21);
    ro=(P.gite||0)+cl*K.ra*chuteBr2(t*.23,2)+cl*.04*Math.sin(t*1.45+1.7*chuteBr(t*.17,5))*(.4+.6*raf)+vib*K.tr*1.3*(.3+.7*raf)*chuteBr(t*12.7,22);}
  else{pi=P.pitch+.06*Math.sin(t*.9)+.03*Math.sin(t*2.3);ro=(P.gite||0)+P.roule*Math.sin(t*.53)+.07*Math.sin(t*1.7);} // (cl 0) le balancement d'avant
  if(G){G.t+=dt;u=Math.min(1,G.t/1.75);const e=u*u*(3-2*u);
    /* (2026-10-15, Sacha : « améliore l'animation du lancement ») L'ÉLAN AVANT LE PIQUÉ : le nez plongeait en ligne droite dès la 1re image
       (rampe linéaire, partie à pleine vitesse). Maintenant elle PREND SON ÉLAN — le nez se cabre et la caisse se soulève (~0,25 s, an9),
       puis bascule en piqué sur une courbe sans à-coup (smootherstep, d9) : on lit le geste avant qu'il parte. */
    const an9=Math.sin(Math.min(1,u/.16)*Math.PI),k9=Math.min(1,Math.max(0,(u-.06)/.34)),d9=k9*k9*k9*(k9*(k9*6-15)+10);
    pi+=(1.3-pi)*d9-.22*an9*(1-d9);ro*=1-e;                                        // le nez PLONGE
    dy=-Math.pow(u,2.3)*150+1.4*an9*(1-u);fwd=Math.pow(u,2)*25;}                   // elle accélère vers la route
  const f=CHUTE.f.copy(CHUTE.fh).multiplyScalar(Math.cos(pi));f.y=-Math.sin(pi);f.normalize();
  const C=CHUTE.v3.copy(CHUTE.C).addScaledVector(CHUTE.fh,fwd);C.y+=dy; // L'ANCRE de la caméra : lisse (la caméra la vise)
  const Ck=CHUTE.ck||(CHUTE.ck=new THREE.Vector3());Ck.copy(C);           // LA CAISSE : elle flotte autour de l'ancre (LA CHUTE LIBRE RÉALISTE)
  if(cl>0){const sh9=vib*K.sh*(.25+.75*raf)*(1+u*2);
    Ck.x+=cl*K.dx*chuteBr2(t*.15,6)+sh9*chuteBr(t*10.3,26);Ck.y+=cl*K.dy*chuteBr2(t*.18,7)+sh9*chuteBr(t*9.1,27);Ck.z+=cl*K.dx*chuteBr2(t*.14,8)+sh9*chuteBr(t*11.7,28);}
  else{Ck.y+=Math.sin(t*2.1)*.12;Ck.x+=Math.sin(t*1.3)*.1;}
  // l'assiette : axes de la caisse (x = haut × avant, y = haut, z = avant), le roulis autour de l'avant
  const up=CHUTE.v1.set(0,1,0).addScaledVector(f,-f.y).normalize(),sd=CHUTE.v2.crossVectors(up,f).normalize();
  const cr=Math.cos(ro),sr=Math.sin(ro);const ux=up.x*cr+sd.x*sr,uy=up.y*cr+sd.y*sr,uz=up.z*cr+sd.z*sr;up.set(ux,uy,uz);sd.crossVectors(up,f).normalize();
  CHUTE.m.makeBasis(sd,up,f);carGroup.quaternion.setFromRotationMatrix(CHUTE.m);
  const sp=CARS[garageI]||CARS[0],sc=P.echelle;carGroup.scale.set(sc,sc,sc);
  carGroup.position.copy(Ck).addScaledVector(up,-.45*sc);carGroup.visible=P.caisse!==0;chuteTapeTick(dt,Ck,up,sc); /* (2026-10-03) le coup du tapotement : poussée et pivot autour du CENTRE, qui reviennent en ressort */ /* (atelier des nuages) P.caisse = 0 : les nuages seuls */   // (le centre de la caisse, pas ses roues, sur l'ancre)
  if(cl>0){ // (LA CHUTE LIBRE RÉALISTE) LES ROUES EN ROUE LIBRE : le vent les fait tourner lentement, chacune à son rythme ; au piqué, elles s'emballent
    for(let i=0;i<wheels.length;i++)wheels[i].rotation.x+=dt*(K.roue*cl*(1+.9*chuteBr(t*.27,30+(i>>1)))+u*30);
    for(let i=0;i<ESSIEUX.length;i++)ESSIEUX[i].rotation.x+=dt*(K.roue*cl*(1+.9*chuteBr(t*.27,30+i))+u*30);
    /* LES SUSPENSIONS DÉTENDUES : rien ne pèse sur les ressorts — la carrosserie se soulève de ses roues et tressaute dessus, bascule un peu */
    const rs9=vib*(.35+.65*raf);carBody.position.set(0,K.det*cl+K.ressort*rs9*chuteBr(t*3.4,31),0);carBody.rotation.set(K.cass*rs9*chuteBr(t*2.7,32),0,K.cass*1.2*rs9*chuteBr(t*3.1,33));CHUTE.corps=true;}
  else{for(const w of wheels)w.rotation.x+=dt*(7+u*30);for(const e of ESSIEUX)e.rotation.x+=dt*(7+u*30);if(CHUTE.corps){carBody.position.set(0,0,0);carBody.rotation.set(0,0,0);CHUTE.corps=false;}} // les roues tournent dans le vide
  // LA CAMÉRA : dans l'axe de la route, un peu au-dessus, la caisse dans la place libre (menuCadre)
  const Cd=menuCadre(),R9=.5*Math.hypot(sp.l||4.2,sp.w||1.9,(sp.h||.8)+.6)*sc,fov0=G?44-5*Math.sin(Math.min(1,u/.16)*Math.PI)+30*u*u:44; /* (2026-10-15) pendant l'élan le champ se resserre un instant, puis il s'ouvre en grand avec la vitesse : le coup de zoom du départ */
  const nx=Cd.nx+(camera.aspect<1?-.07:0); // debout « un peu à gauche » (Sacha) — à −0,16 la caisse plongeante du titre v3 (vue de trois-quarts dessus) touchait le bord gauche de l'écran (31 px, banc cadrage.mjs) : −0,07 la garde un rien à gauche du milieu
  if(Math.abs(camera.fov-fov0)>.01){camera.fov=fov0;camera.updateProjectionMatrix();}
  /* ⚠ (titre v3) LE DÉCENTREMENT DE L'ATELIER : le garage décale l'objectif (`setViewOffset`) pour sa mise en page et ne le rendait pas en
     revenant au ciel — mesuré (banc retour.js, sur main aussi) : après une visite au garage, la caisse du titre sortait du cadre à gauche
     (−1,08 NDC au lieu de −0,58). Le ciel n'a pas de décentrement : on l'efface. */
  if(camera.view&&camera.view.enabled){GAR.dec=GAR.decX=0;GAR.cdx=GAR.cdy=GAR.cvx=GAR.cvy=0;camera.clearViewOffset();}
  const tV=Math.tan(camera.fov*Math.PI/360),tH=tV*camera.aspect;
  const d=Math.max(R9*P.taille*(camera.aspect>1?1.75:1)/(Cd.fr*tH),R9*.8/(Cd.fh*tV))*(1+.03*Math.sin(t*.37));
  /* L'ORBITE AU DOIGT (2026-09-30, Sacha : « rajoute un moyen de déplacer la caméra autour de la voiture avec le doigt ») — glisser tourne
     le regard autour de la caisse (le tour complet), de haut en bas il monte ou plonge ; la vue rejoint le doigt en douceur (~0,1 s) et,
     lâchée en mouvement, elle garde son élan (frottement ×e^−3t) — le même geste que l'atelier (« le glissé fondu »). Pas de retour
     automatique : c'est JOUER qui ramène la caméra derrière elle pour le piqué. La caisse, elle, ne bouge pas dans le monde. */
  /* LE TOUR SANS FIN (2026-10-07, Léo : « l'écran menu ciel, dans le même angle, tourne en 360 constamment — pas trop rapide, faut pas que
     ce soit vomitif, plutôt lent ; on doit pouvoir tourner la voiture ; faut que ça ait l'air d'être en chute ») — le regard fait le tour
     complet de la caisse, à la hauteur du menu (oP ne bouge pas), un tour en `P.tour` secondes : le CAMÉRAMAN DE CHUTE LIBRE qui spirale
     autour d'elle pendant que l'air et les cumulus montent. C'est l'orbite au doigt avec un PLANCHER de vitesse : le doigt la saisit (elle
     s'arrête dessous, `CHUTE.tk` = 0), la lance (l'élan retombe vers le tour lent, dans le SENS du lancer, `CHUTE.tSens`) ; lâchée sans élan,
     elle repart en douceur (`tk` revient à 1 en ~3 s). Coupé : « Réduire les animations », image figée (P.fige), l'atelier des nuages. */
  /* LE CIEL NE SE TOUCHE PLUS (2026-10-08, Léo : « on ne doit plus pouvoir toucher le ciel avec les doigts ; ça tourne dans le sens dans lequel
     ça devrait tourner ») — le doigt ne saisit plus le tour, ne le lance plus, ne l'inverse plus, et un doigt posé (sur la caisse) ne l'arrête plus :
     il continue dessous, toujours dans le sens `P.sens`. Le doigt garde la CAISSE (la taper, la tourner, la tirer, la balancer). */
  if(!G){const tw9=P.tour>0&&P.fige==null&&document.documentElement.getAttribute('data-reduced-motion')!=='1'?(P.sens||1)*6.2832/P.tour:0;
    {CHUTE.tk+=(1-CHUTE.tk)*(1-Math.exp(-dt*.7));const w9=tw9*CHUTE.tk;CHUTE.oW=w9+(CHUTE.oW-w9)*Math.exp(-dt*3);if(!w9&&Math.abs(CHUTE.oW)<.015)CHUTE.oW=0;CHUTE.oAc+=CHUTE.oW*dt;}
    const kS=1-Math.exp(-dt*10);CHUTE.oA+=(CHUTE.oAc-CHUTE.oA)*kS;CHUTE.oP+=(CHUTE.oPc-CHUTE.oP)*kS;}
  const oc=Math.cos(CHUTE.oA),os=Math.sin(CHUTE.oA),ox=lx*oc-lz*os,oz=lx*os+lz*oc,el9=THREE.MathUtils.clamp((camera.aspect<1&&P.elevP!=null?P.elevP:P.elev)+CHUTE.oP,-.45,1.25); /* (2026-10-03, Léo, deux captures : « voici le point de vue vertical souhaité ») le regard presque à niveau — couché (elev) un rien SOUS la caisse, on voit son dessous — (2026-10-05, Léo : « en paysage le point de vue un tout petit plus haut, ou juste la coupure blanc/bleu au même niveau que le haut de la barre MISSIONS ») elev −,08 → −,035 : la ligne blanche de l'horizon passe AU RAS du haut de MISSIONS (banc horizon.mjs, 844 × 390 : y 217 → 194, la caisse ne bouge pas dans le cadre) ; debout (elevP) à peine au-dessus : l'horizon à ~40 % — (2026-10-07, Léo : « le ciel un tout petit plus haut, cadré au centre de l'écran ») couché, elev −,035 → ,015 : la coupure blanc/bleu de la mer de nuages remonte au MILIEU de l'écran (844 × 390, image figée : y 218 → 194, aux six heures du titre) ; la caisse garde sa place dans le cadre ; debout inchangé */
  const ce=Math.cos(el9),se=Math.sin(el9);
  CHUTE.cam.set(C.x-ox*ce*d,C.y+se*d,C.z-oz*ce*d);
  if(G){const k=Math.min(1,u/.5),e9=k*k*(3-2*k);                                   // la caméra passe DERRIÈRE elle (poursuite plongeante)
    /* (2026-10-07, LE TOUR SANS FIN) elle y passe EN TOURNANT autour de la caisse (cap, hauteur, distance interpolés) et plus en ligne droite :
       le regard tourne sans cesse, JOUER peut partir du côté opposé — la corde passait alors À TRAVERS la caisse. Même arrivée qu'avant. */
    const ax9=CHUTE.cam.x-C.x,ay9=CHUTE.cam.y-C.y,az9=CHUTE.cam.z-C.z,la9=Math.hypot(ax9,ay9,az9)||1,bx9=-f.x*9,by9=-f.y*9+3.2,bz9=-f.z*9,lb9=Math.hypot(bx9,by9,bz9);
    const h0=Math.atan2(az9,ax9);let dh=Math.atan2(bz9,bx9)-h0;dh-=6.2832*Math.round(dh/6.2832);
    const h9=h0+dh*e9,e0=Math.asin(THREE.MathUtils.clamp(ay9/la9,-1,1)),v9=e0+(Math.asin(THREE.MathUtils.clamp(by9/lb9,-1,1))-e0)*e9,l9=la9+(lb9-la9)*e9,c9=Math.cos(v9)*l9;
    CHUTE.cam.set(C.x+Math.cos(h9)*c9,C.y+Math.sin(v9)*l9,C.z+Math.sin(h9)*c9);}
  camera.position.copy(CHUTE.cam);camera.up.set(0,1,0);camera.lookAt(C);
  /* (titre v3) L'HORIZON DROIT : le décadrage tournait autour de l'axe de la caméra, déjà penchée vers le bas — l'horizon basculait de 10°.
     Il tourne autour de la VERTICALE DU MONDE (÷ cos de la plongée : la caisse garde sa place à l'écran). */
  {const k=G?1-Math.min(1,u/.5):1,ce9=Math.max(.5,Math.cos(el9));camera.rotateOnWorldAxis(AXIS_Y,Math.atan(nx*tH)/ce9*k);camera.rotateX(-Math.atan(Cd.ny*tV)*k);}   // la caisse glisse dans la zone libre
  if(G&&u>.2&&vib>0){const a=(u-.2)*.9,tg=G.t;camera.position.x+=.07*a*chuteBr(tg*19,60);camera.position.y+=.07*a*chuteBr(tg*17,61);camera.rotateZ(.014*a*chuteBr(tg*6,62));} // l'air qui cogne — (2026-10-15) un tremblement LISSE qui monte (le tirage au hasard par image grésillait), et la vue qui roule un peu ; rien sous « Réduire les animations »
  if(CHUTE_TAP.sh>0){const k9=CHUTE_TAP.sh;camera.position.x+=(Math.random()-.5)*.5*k9;camera.position.y+=(Math.random()-.5)*.5*k9;camera.position.z+=(Math.random()-.5)*.5*k9;camera.rotateZ((Math.random()-.5)*.06*k9); // (LA CAISSE AU DOIGT v2) le coup secoue la caméra…
    camera.fov=fov0-9*Math.min(1,k9);camera.updateProjectionMatrix();} // (14/10) le coup de zoom ×1,8 // …et la fait cogner d'un coup de zoom (la ligne du champ, plus haut, le rend à l'image suivante)
  camera.updateMatrixWorld();
  try{chuteDoigtTick(dt,Ck,G);}catch(_){} /* (2026-10-15 soir, Sacha) LE DOIGT DE BIENVENUE : la main suit la caisse, la caméra posée */
  // LA LUMIÈRE : le soleil du ciel fait le gros ; une clé douce du côté caméra, un contre-jour bleu ciel qui détoure la caisse
  if(P.studio){chuteStudio(Ck,up,P);}else{trailLight.intensity=0;if(CHUTE.lc)carLight.color.copy(CHUTE.lc);{const BT=BIOMES.titre||BIOMES[MENU_BIO];if(BT.hemiI!=null)hemi.intensity=BT.hemiI;if(BT.sunI!=null)sun.intensity=BT.sunI;} // (2026-10-03) LE MODELÉ DE LA CAISSE (voir chuteStudio) ; P.studio = 0 : l'éclairage d'avant
  stallKey.color.setHex(P.cleC);stallKey.intensity=.9*P.cle;stallKey.distance=60;stallKey.position.copy(CHUTE.cam).addScaledVector(up,4);
  camera.getWorldDirection(CHUTE.v2).multiplyScalar(1-P.rimS).addScaledVector(SUN_DIR,P.rimS).normalize();
  stallRim.color.setHex(P.rimC);stallRim.intensity=P.rim;stallRim.distance=40;stallRim.position.copy(Ck).addScaledVector(CHUTE.v2,7).addScaledVector(up,2.5);
  carLight.position.copy(CHUTE.cam).addScaledVector(up,2.5);carLight.intensity=1.6*P.cle*P.lampe;carLight.distance=60;}
  headSpot.intensity=0;if(CARPOOL.head)CARPOOL.head.visible=false; // en plein jour, en l'air : ni phares (leur tache bleue sur les nuages au piqué), ni la nappe de 15 m des faisceaux (un plan qui flotte devant le nez)
  {const s9=!P.cielT;sunSprite.visible=s9&&sunSprite.material.opacity>.02;horizonGlow.visible=s9&&horizonGlow.material.opacity>.02;for(const r9 of RAYS)r9.visible=s9&&r9.material.opacity>.002;} /* (titre v4) le sprite de lueur d horizon dessinait la RAYURE : le ciel du titre fait sa lumière lui-même */
  if(pigGroup)pigGroup.visible=false;if(landMark)landMark.visible=false;
  // SA TRAÎNÉE monte derrière elle (celle de la boutique) ; L'AIR MONTE : les bancs de nuage et les filets de vent
  trailApercu(dt,P.trainee>0,P.trainee);
  for(const sp of CHUTE.sol)sp.visible=!!P.plancher;
  const vk=1+(G?u*u*7:0),cp=camera.position,dC=cp.distanceTo(C);
  for(const w of CHUTE.w){w.y+=P.vit*w.v*vk*dt;if(w.y>70)chuteNuageNeuf(w,false);
    const s=w.sp;s.visible=!!P.voiles; /* (titre v4) les bancs-sprites flous (des taches dans le ciel) : éteints, les cumulus 3D font la chute */s.position.set(C.x+w.x,C.y+w.y,C.z+w.z);s.scale.set(w.s*1.35,w.s,1);
    let o=Math.min(1,(w.y+110)/35)*Math.min(1,(70-w.y)/30);                          // fondu à la naissance et à la sortie
    const dW=cp.distanceTo(s.position);o*=Math.min(1,Math.max(0,(dW-w.s*.35)/(w.s*.6))); // on ne se prend pas un nuage dans l'objectif au repos
    if(dW<dC+w.s){CHUTE.v1.copy(s.position).project(camera);CHUTE.v2.copy(C).project(camera);
      const e=Math.hypot((CHUTE.v1.x-CHUTE.v2.x)*camera.aspect,CHUTE.v1.y-CHUTE.v2.y),tV9=Math.tan(camera.fov*Math.PI/360),
            rW=w.s*.62/(Math.max(1,dW)*tV9),rC=R9*1.2/(Math.max(1,dC)*tV9);
      o*=Math.max(0,Math.min(1,(e-(rW*.75+rC))/(rW*.5+.08)));}                       // …et jamais une ouate DEVANT la caisse (son disque projeté contre celui de la caisse)
    s.material.opacity=o*(G?1:.78);}
  if(CHUTE.nu){const on9=!!P.nuages,C0=CHUTE.C,rx0=-lh.z,rz0=lh.x; // (titre v3) LES CUMULUS : ils montent, la caisse tombe
    for(const c of CHUTE.nu){if(c.pas){chutePasTick(c,dt,vk,!!G,on9);continue;} /* (2026-10-25) les nuages de passage : voir chutePasTick */c.y+=P.vit*c.v*vk*dt;if(c.y>c.hi)c.y=c.lo;c.m.visible=on9&&!c.off&&!!c.e.g;c.m.position.set(C0.x+rx0*c.a+lh.x*c.b,C0.y+c.y,C0.z+rz0*c.a+lh.z*c.b);}}
  {const Fi=CHUTE.fil,pos=Fi.pos,col=Fi.col,cd=camera.getWorldDirection(CHUTE.v1);
   const ax=-cd.z,az=cd.x,an=Math.hypot(ax,az)||1;                                // la largeur des filets : horizontale, face caméra
   for(let i=0;i<Fi.S.length;i++){const S9=Fi.S[i];S9.y+=P.vit*S9.v*vk*dt;if(S9.y>44)chuteFilNeuf(S9,false);
     const x0=C.x+S9.x,z0=C.z+S9.z,y0=C.y+S9.y,y1=y0-S9.l*(G?1+u*2:1),hw=S9.w*.5,wx=ax/an*hw,wz=az/an*hw,o=i*12;
     pos[o]=x0-wx;pos[o+1]=y0;pos[o+2]=z0-wz;pos[o+3]=x0+wx;pos[o+4]=y0;pos[o+5]=z0+wz;
     pos[o+6]=x0-wx;pos[o+7]=y1;pos[o+8]=z0-wz;pos[o+9]=x0+wx;pos[o+10]=y1;pos[o+11]=z0+wz;
     const cp9=camera.position,dc9=Math.hypot(x0-cp9.x,(y0+y1)*.5-cp9.y,z0-cp9.z); /* (niveau 1 v2) un filet qui frôle la CAMÉRA devenait un rayon de lumière vertical sur tout l'écran (lu comme un bug) : il s'efface avant */
     const a=S9.a*Math.min(1,(S9.y+44)/10)*Math.min(1,(44-S9.y)/10)*(G?1.3:.3)*Math.min(1,Math.max(0,(dc9-6)/8));   // la tête du filet blanche, la queue éteinte
     const tc9=TITRE_HF.tcol;col[o]=col[o+3]=a*tc9.r;col[o+1]=col[o+4]=a*tc9.g;col[o+2]=col[o+5]=a*tc9.b;col[o+6]=col[o+9]=0;col[o+7]=col[o+10]=0;col[o+8]=col[o+11]=0;}
   Fi.m.visible=true;Fi.m.geometry.attributes.position.needsUpdate=true;Fi.m.geometry.attributes.color.needsUpdate=true;}
  // LE VENT : le souffle et le sifflement de la chute (les nœuds du moteur de son, au repos hors course)
  /* (niveau 1 v2) LA CHUTE LIBRE a sa boucle (`chute.vent` : grondement, rafales, l'air qui claque sur les tôles) ; retentée tant que le son
     n'est pas prêt (premier geste). Au piqué de JOUER, elle monte de 4 dB et s'accélère de 25 % : l'air hurle. */
  /* (2026-10-14, Léo : « quand on est — et quand on revient — dans le menu ciel, un bruit de chute libre doux ») AU REPOS, le ciel n'a plus que
     LA CHUTE LIBRE DOUCE (`chuteDoux`, la musique du lobby loin derrière : MUS_CIEL) ; le grondement claquant de `chute.vent` et le vent du
     moteur ne servent plus qu'au PIQUÉ de JOUER, où l'air se met à hurler (comme avant). */
/* (2026-10-16, Léo : « un bug audio que tu n'as jamais su régler, qui pourrait défoncer les oreilles des joueurs en plein début de partie —
   un mélange entre un souffle, un bruit aigu, et un boom ; dans mes écouteurs Bluetooth, et parfois sur l'ordi ») LE PIQUÉ QUI NE CRIE PLUS.
   MESURÉ au banc (sortie enregistrée, effets seuls, bandes grave < 160 Hz et aigu 2,5-8 kHz, un son retiré à la fois) : au ciel tout est doux
   (grave −50, aigu −62 dB) ; au JOUER, en 200 ms, le LÂCHER (garage.lacher) fait bondir le grave de +18 dB (le BOOM), puis pendant le piqué le
   VENT du moteur (windG/whG, filtre ouvert jusqu'à 3,3 kHz) et la chute douce gonflée montent l'aigu de +27 dB en 1,5 s (le SOUFFLE AIGU) ;
   le logo du départ remet un coup de sub. Le joueur règle son volume sur le ciel, calme : le piqué lui arrivait 20-27 dB plus fort, d'un
   coup — au casque, où l'aigu et le sub passent entiers, c'était la gifle. Désormais le piqué monte d'environ 10 dB au plus : le vent reste
   sombre (filtre ≤ 1,7 kHz), le sifflet discret, le V8 du JOUER −9 dB, le lâcher −8, le logo −4 ; sans la banque de sons (pas encore chargée), le vieux souffle
   de secours est −10 dB (il partait en 50 ms à −5 dBFS de crête). */
  try{chuteDoux(t,G?u:0);}catch(e){}
  if(G){
    if(SONV2&&!CHUTE.snd&&t>(CHUTE.sndT||0)){CHUTE.sndT=t+1;try{CHUTE.snd=sfx('chute.vent',{loop:true,vol:-22});}catch(e){}}
    if(CHUTE.snd){CHUTE.snd.gain(2*u,.25);CHUTE.snd.rate(1+.2*u,.25);} // (2026-10-16) +2 dB au piqué (était +4), −22 (était −20)
    if(AC&&windG&&whG){try{CHUTE.vent=true;stt(windG.gain,.025+.02*u,AC.currentTime,.4);stt(windF.frequency,800+900*u,AC.currentTime,.4);stt(whG.gain,.008+.01*u,AC.currentTime,.4);}catch(e){}}} // (2026-10-16) le vent du piqué : .05→.10 / 900→3 300 Hz / sifflet .02→.07 avant
  // JOUER : le banc de nuage traversé (voile blanc), puis la course sous le voile
  if(G){if(!G.voile&&u>.74){G.voile=true;try{sfx('nuage.entre');}catch(e){}}
    /* (2026-10-15) LE NUAGE QU'ON TRAVERSE : le voile montait en rampe droite, plat ; il arrive maintenant en courbe douce et EN APPROCHE
       (il grossit vers nous, ×1,25 → 1), puis il se DÉCHIRE autour de la caisse (s'ouvre ×1,6 en s'effaçant) — transform/opacity seulement. */
    const v=chuteVoileEl();v.style.transition='none';{const w9=Math.max(0,Math.min(1,(u-.72)/.22)),s9=w9*w9*(3-2*w9);v.style.opacity=String(s9);v.style.transform='scale('+(1.25-.25*s9).toFixed(3)+')';}
    if(u>=1){
      if(CHUTE.sous){const f9=CHUTE.sous;CHUTE.sous=null;try{f9();}catch(e){console.warn('chute: piste sous le voile',e);}} // (2026-10-15) la piste tirée par JOUER se bâtit ICI, sous le nuage blanc (voir classiqueJouer)
      const wasStarted=started;GAR.go=null;CHUTE.go=null;carGroup.scale.set(1,1,1);
      closeGarage(wasStarted);
      if(wasStarted)resetGame();else{start();fireLaunchBoost();}
      /* le nuage se déchire SUR la piste — (2026-10-15) après la 1re image de la course RENDUE (deux rAF, au lieu d'un minuteur de 60 ms qui
         pouvait découvrir une image pas encore dessinée), en s'ouvrant vers nous */
      requestAnimationFrame(function(){requestAnimationFrame(function(){v.style.transition='opacity .6s var(--ease,cubic-bezier(.32,.72,0,1)),transform .6s var(--ease,cubic-bezier(.32,.72,0,1))';v.style.opacity='0';v.style.transform='scale(1.6)';});});
    }}
}
/* LE GARAGE SOBRE (2026-09-29, Léo : « le point de vue est bizarre, on dirait un effet loupe ; je veux un garage plus sobre, la voiture au
   milieu, qui tourne grâce à la plateforme ») : la caméra ne tourne plus autour de la caisse. Elle est FIXE, côté établi, et regarde la
   porte en feu ; c'est le PLATEAU qui tourne, la caisse dessus. `garageAng` garde son sens (l'angle d'où l'on regarde la caisse : les
   préréglages .42, 3,5 aux TRAÎNÉES, le glissé du doigt n'ont pas bougé) — il fait tourner la caisse de `GAR_CAM_A − garageAng`. */
const GAR_CAM_A=Math.PI;
function garRot(){return GAR_CAM_A-garageAng;}
/* LE RESSORT CRITIQUE (2026-10-06, Léo : « parfois pour se replacer l'écran a des petits déclics qui se voient corrigés, rends smooth le fait de
   bouger dans le garage »). Mesuré (banc lisse/cam.mjs : la caméra du garage rejouée image par image, horloge figée à 60 i/s) : chaque
   « déclic » était un mouvement qui PARTAIT À PLEINE VITESSE dans une seule image — un lissage du 1er ordre (x += (cible − x)·k) ou un
   asservissement allumé d'un coup. Ce ressort amorti critique rejoint sa cible SANS jamais partir d'un coup ni dépasser : la vitesse est
   continue (elle part de zéro, monte, retombe). Solution exacte (pas d'intégration pas à pas) : stable à toutes les cadences. `om` = sa
   raideur (rad/s) — il a rejoint 90 % du chemin en ~3,9/om s. o[kx] la valeur, o[kv] sa vitesse. */
function garRessort(o,kx,kv,c,om,dt){const y=(o[kx]||0)-c,v=o[kv]||0,e=Math.exp(-om*dt),a=v+om*y;o[kx]=c+(y+a*dt)*e;o[kv]=(v-om*a*dt)*e;}
function garCamA(){return GAR_CAM_A+(GAR.vA||0)+(GAR.swO||0)+(GAR.vD||0);} // (2026-10-05) + vD : le décalage qui pose la caisse à gauche de l'entrée (vitrine) // (2026-09-30) l'azimut RÉEL de la caméra : l'axe + le regard du doigt + le balancement (voir « LE GARAGE QUI VIT »)
/* (2026-10-05, Léo : « un peu plus doux l'effet tourner dans le garage — c'est pas mal le flottement, juste ça tourne trop la tête ») LE TOUR AU
   DOIGT, ADOUCI en vitrine : dPx rad par pixel (,007 au menu), l'élan plafonné à dElan rad/s (7 au menu), la caméra penche quatre fois moins
   dans le virage, le balancement au repos ×(1 − dSway).
   (2026-10-05, Léo : « effet flottant à revoir, restructurer pour que ce soit satisfaisant — là c'est un peu brut ») LE TOUR RESTRUCTURÉ :
   · la vue suit le doigt par un RESSORT AMORTI CRITIQUE (dLisse s ≈ le temps pour rejoindre le doigt) : elle accélère puis freine, sans
     dépasser — avant, un suivi du 1er ordre partait à pleine vitesse et s'arrêtait net ;
   · lâchée, elle GLISSE et freine en douceur (dFrein /s : un glissé moyen ajoute ~80 % du geste, un lancer au plus dElan/dFrein rad) ;
   · rattrapée en vol, elle ralentit sous le doigt sans revenir en arrière (la cible = la position + vitesse × dLisse/2) ;
   · la visée est RIGIDE : la caméra regarde toujours l'entrée par-dessus la caisse, elle ne fouette plus de la porte au fond pendant le tour ;
   · le glissé qui pose la caisse à gauche (vD) démarre en douceur avec la vitrine et se pose en ~1 s, au lieu de partir net et de traîner ;
   · (même soir, Léo : « arrête de faire tourner automatiquement le garage ; le pdv un peu plus proche ; l'effet doit moins basculer et suivre
     la voiture un tout petit peu plus, pas trop ») : AU REPOS la caméra ne tourne plus d'elle-même (balancement latéral coupé, dSway 1 ;
     le glissé vD ne recadre qu'au-delà de 3 % d'écart), le balancement vertical moitié moins (dSwayV), roulis ×,15 (dRoulis ,85), rebond
     plus sage (dAmorti ,78), la visée suit un peu mieux (dRegard 4,5 : ~0,22 s), la caméra ~10 % plus près (fw ,98 · fwP ,88 · fh ,88) ;
   · (même jour, « un peu générique — un juste milieu entre les deux ») : ressort un peu sous-amorti (dAmorti), visée qui traîne (dRegard),
     un peu plus de roulis (dRoulis : ×(1 − ,6) au lieu de ×,25) et de balancement (dSway ,35), un peu plus d'élan (dElan 2, dFrein 3) ;
   · le zoom ne respire plus avec l'angle du doigt (seulement avec le plateau) ; le recadrage de l'image se lisse dans le temps, plus par image. */
/* (2026-10-09, Léo : « lève un peu la voiture dans le POV ») cy .55 → .47 (debout), cyL .6 → .54 (couché) : la caisse remonte dans sa place. */
const VITRINE_CAM={dRecadre:3.6,retAttente:3,retDuree:1.1,retPente:.9,dPx:.0046,dLisse:.3,dAmorti:.78,dFrein:3,dElan:2,dSway:1,dSwayV:.5,dRegard:4.5,dRoulis:.85,porteY:1.9,fw:.9,fwP:.88,fh:.8,fhP:.88,cx:.43,cxL:.62,cy:.47,cyL:.54,adapt:.5,p:.08,y:0,vise:-.38,viseP:.6,fov:.9,rot:.15,cle:.3,rim:.35}; // LA VITRINE v2 : la caisse tient dans fw de la largeur libre et fh de sa hauteur, inclinaison +p rad, hauteur +y m, visée +vise (+viseP debout), objectif ×fov, plateau rot rad/s, lampes +cle/+rim
/* le GABARIT de la caisse vue en tournant : R = demi-diagonale de son empreinte au sol (la plus large qu'elle montre), H = sa hauteur. Mesuré
   caisse droite et à l'échelle 1 (la bascule l'écrase, le toucher la tasse), une fois par caisse et par construction. */
function garGabarit(){
  const k=garageI+':'+carBody.children.length+':gab2';if(GAR._gab&&GAR._gab.k===k)return GAR._gab;
  const ry=carGroup.rotation.y,sx=carGroup.scale.x,sy=carGroup.scale.y,sz=carGroup.scale.z,b=GAR._gb||(GAR._gb=new THREE.Box3()),v=GAR._gv||(GAR._gv=new THREE.Vector3());
  carGroup.rotation.y=0;carGroup.scale.set(1,1,1);carGroup.updateMatrixWorld(true);b.setFromObject(carBody);
  carGroup.rotation.y=ry;carGroup.scale.set(sx,sy,sz);carGroup.updateMatrixWorld(true);
  if(b.isEmpty())return GAR._gab||{R:2.4,H:1.4};b.getSize(v);
  return GAR._gab={k:k,R:Math.max(1,.5*Math.hypot(v.x,v.z)),a:Math.max(.8,v.z*.5),b:Math.max(.5,v.x*.5),H:Math.max(.8,v.y)};
}
/* LA BOUTIQUE INDUSTRIELLE (2026-10-12, Léo — ESSAI sur la copie `boutique-industrielle`, PAS sur main : « j'aime bien l'ambiance de
   cette photo — la nudité, la sobriété ; quand on appuie sur BOUTIQUE, la voiture décolle : pas qu'elle vole, un petit coup et boum, elle
   se met à léviter ; les noms, l'argent, tout ça est remplacé — on est dans une boutique, ça doit être mieux organisé ; un effet de glitch
   fait apparaître cet endroit, en mode boutique très industriel ; une boutique HEBDOMADAIRE avec les objets qu'on voit, reliés par des
   FILS à chaque partie qu'ils modifient — une couleur rouge, une voiture ; un bouton ACHETER ; la voiture, on peut la tourner dans tous
   les sens, elle est en l'air ; rapetisse un peu la voiture du point de vue ») :
   · BOUTIQUE touchée : la caisse s'enfonce une fraction de seconde (le petit coup), BOUM (onde au sol, son de choc), elle bondit et flotte
     à ~0,95 m (ressort sous-amorti, puis houle lente) ; au boum part le GLITCH (garGlitch), à son pic l'atelier s'éteint et L'ESPACE
     BLANC s'allume (GBQ.grp, même soir — Léo : « lâche le magasin, plutôt un carré blanc futuriste, hors du temps ») : une sphère blanche,
     un sol qui s'y fond, une grille en filigrane, deux anneaux fins sous la caisse ; la lumière passe au blanc de studio (bqBio) ;
   · le haut du garage (nom, rang, argent, aura) laisse la place à l'EN-TÊTE de la boutique (#gBqTete : BOUTIQUE · CETTE SEMAINE, le compte
     à rebours jusqu'au lundi, ton argent) ; la console ne garde que ◀ RETOUR et ACHETER ;
   · LA SEMAINE (bqHebdo : tirée par bqTire sur le numéro de la semaine, lundi UTC) : trois caisses à gauche, trois habillages à droite, en
     ÉTIQUETTES ; (même soir : remplacées par L'INTERFACE v2, voir garBqPanneau) chacune était reliée par un FIL à la partie qu'elle change —
     la caisse au toit, la peinture au flanc, l'aile à l'aileron, la traînée aux pots ; touchée, on l'ESSAIE (le fil s'allume en orange) ;
   · le doigt sur la scène TOURNE la caisse dans tous les sens (lacet libre avec élan, tangage ±60° qui revient doucement) ;
   · la caisse est plus petite à l'écran (les colonnes d'étiquettes la cadrent au milieu, la caméra recule).
   RETOUR : le glitch, l'atelier revient, la caisse se repose. Banc : dbgBqIndus(). */
var GBQ={veut:false,on:false,t:9,bascule:true,k:0,kv:0,lev:0,levV:0,coupT:-1,boum:0,yaw:0,yawV:0,pit:0,pitV:0,grp:null,drag:null,cartesOn:false,ck:'',zone:null,hebdo:null,chocT:9,tapT:9,lay:'',pose:false,platK:1}; // (2026-10-15) pose/platK : LA POSE TENUE (voir bqPoseLache)
function bqSem(){return Math.floor((Math.floor(Date.now()/864e5)+3)/7);} // les semaines commencent le LUNDI (UTC) — le 1er janvier 1970 était un jeudi
function bqHebdoReste(){const ms=Math.max(0,((bqSem()+1)*7-3)*864e5-Date.now()),t=Math.floor(ms/1000),d=Math.floor(t/86400),d2=function(n){return (n<10?'0':'')+n;};
  return (d>0?d+(LANG==='fr'?'J ':'D '):'')+d2(Math.floor(t/3600)%24)+':'+d2(Math.floor(t/60)%60)+':'+d2(t%60);}
function bqIndusVoulu(){const m=gModeM();return !!gEl&&garageOn&&(m==='shop'||m==='tous')&&!GAR.go&&!gEl.classList.contains('menu')&&!gEl.classList.contains('missions')&&!gEl.classList.contains('quiet')&&!gEl.classList.contains('launching');}
function bqBio(){if(!bqBio._b)bqBio._b=Object.assign({},ATELIER_V0,{nm:'MAGASIN',hemiS:[.98,.99,1],hemiG:[.62,.64,.68],hemiI:1.1,sunC:[1,1,1],sunI:.62,fillC:[.82,.84,.88],fillI:.2,
  kickC:[1,.62,.3],kickI:.05,expo:1.2,sat:.92,con:1.02,daHi:0,daSh:0,daCon:.5,bloomS:.16,bloomT:.98,vigK:0,vigC:[.05,.05,.06],wb:[1,1,1],sh:[0,0,.004],hi:[0,0,0],rimK:0,rimS:.22});return bqBio._b;}
/* LE MAGASIN : bâti une fois (à la 1re visite de la boutique), dans un repère qui suit l'azimut de la caméra (+z = vers elle, l'allée file vers −z) */
/* LE CADRAGE DE LA BOUTIQUE (2026-10-13, Léo : « laisse-moi toucher, bouger le point de vue de la boutique pour bien cadrer, puis je te dirai
   de capturer le POV et l'appliquer ») : `BQ_POV` = le cadrage retenu, un par sens d'écran (couché / debout), appliqué PAR-DESSUS la vue de la
   boutique (au fondu de GBQ.k) : `a` tourne la vue autour de la caisse (rad), `h` monte la caméra (m), `d` recule (×), `ty` monte la visée (m),
   `f` ouvre l'objectif (°), `sx`/`sy` déplacent la place de la caisse à l'écran (part de la largeur / hauteur). Avec `?cadrage=1`, un panneau
   de curseurs le règle en direct (gardé dans ce navigateur) ; `dbgPov()` le relit pour le recopier ici. */
const BQ_POV={couche:null,debout:null}; /* (14/10) essayé {h −0,7, d 0,92} : « c'était mieux avant » */ /* (2026-10-14, Léo : « mieux placé sur la voiture, le plan, le point de vue ») la caméra descend et se rapproche */
const BQ_POV_DEF={a:0,h:0,d:1,ty:0,f:0,sx:0,sy:0},BQ_CADRAGE=/[?&]cadrage=1\b/.test(location.search);
function bqPovSens(){return VP.w>VP.h?'couche':'debout';}
function bqPovLu(){if(!BQ_CADRAGE)return null;if(bqPovLu._v)return bqPovLu._v;let v=null;try{v=JSON.parse(localStorage.getItem('ccCadrageBq')||'null');}catch(e){}return bqPovLu._v=(v&&typeof v==='object')?v:{};}
function bqPov(){const s=bqPovSens(),l=bqPovLu();return (l&&l[s])||BQ_POV[s]||null;}
function bqPovApplique(){const o=bqPov();if(!o||!GAR.lk)return;const w=Math.max(0,Math.min(1,GBQ.k||0));if(w<.001)return;
  const C=camera.position,T=(GBQ._pT||(GBQ._pT=new THREE.Vector3())).copy(GAR.lk);T.y+=(o.ty||0)*w;
  const a=(o.a||0)*w,ca=Math.cos(a),sa=Math.sin(a),tx=T.x*ca+T.z*sa,tz=-T.x*sa+T.z*ca;T.x=tx;T.z=tz; // la vue TOURNE autour de la caisse (au centre du plateau)
  let x=C.x*ca+C.z*sa,z=-C.x*sa+C.z*ca,y=C.y+(o.h||0)*w;const d=1+((o.d==null?1:o.d)-1)*w;
  C.set(T.x+(x-T.x)*d,T.y+(y-T.y)*d,T.z+(z-T.z)*d);camera.up.set(0,1,0);camera.lookAt(T);
  if(o.f){camera.fov=THREE.MathUtils.clamp(camera.fov+o.f*w,20,100);camera.updateProjectionMatrix();}}
function bqPovPanneau(){if(!BQ_CADRAGE||bqPovPanneau._el)return;
  const R=[['a','TOURNER',-1.6,1.6,.01],['h','HAUTEUR',-3,4,.05],['d','RECUL',.5,2,.01],['ty','VISÉE',-2,2,.05],['f','OBJECTIF',-25,25,.5],['sx','← →',-.35,.35,.005],['sy','↑ ↓',-.35,.35,.005]];
  const el=document.createElement('div');el.id='bqCadrage';
  el.innerHTML='<b class="cT">CADRAGE · <span class="cS"></span><i class="cO">▾</i></b><div class="cC">'+R.map(function(r){return '<label><span>'+r[1]+'</span><input type="range" data-k="'+r[0]+'" min="'+r[2]+'" max="'+r[3]+'" step="'+r[4]+'"><em></em></label>';}).join('')+'<button type="button" class="cZ">ZÉRO</button></div>';
  document.body.appendChild(el);bqPovPanneau._el=el;
  const st=document.createElement('style');st.textContent='#bqCadrage{position:fixed;z-index:2147483000;right:8px;top:calc(env(safe-area-inset-top,0px) + 8px);background:rgba(255,255,255,.95);color:#111;border:2px solid #111;box-shadow:0 3px 0 #111;font:8px/1.4 var(--pix);padding:5px 7px;display:none;user-select:none;-webkit-user-select:none;touch-action:none}'+
    '@media (orientation:portrait){#bqCadrage{right:auto;left:50%;top:auto;translate:-50% 0;bottom:calc(env(safe-area-inset-bottom,0px) + 96px)}}'+ /* (sur la grille de la boutique : la caisse reste à découvert) */
    '#bqCadrage.on{display:block}#bqCadrage .cT{display:flex;gap:6px;align-items:center;cursor:pointer;font-size:11px;letter-spacing:.06em}#bqCadrage .cO{margin-left:auto;font-style:normal;padding:0 4px}'+
    '#bqCadrage.ferme .cC{display:none}#bqCadrage label{display:grid;grid-template-columns:56px 112px 34px;gap:5px;align-items:center;margin-top:3px}#bqCadrage input{width:112px;margin:0;touch-action:auto}#bqCadrage em{font-style:normal;text-align:right;font-variant-numeric:tabular-nums}'+
    '#bqCadrage .cZ{margin-top:6px;font:8px var(--pix);border:1.5px solid #111;background:#fff;padding:3px 8px;cursor:pointer}';document.head.appendChild(st);
  ['pointerdown','pointermove','pointerup','touchstart','touchmove','wheel','click'].forEach(function(t){el.addEventListener(t,function(e){e.stopPropagation();},{passive:true});});
  const lit=function(){const s=bqPovSens(),l=bqPovLu();return Object.assign({},BQ_POV_DEF,BQ_POV[s]||{},l[s]||{});};
  const garde=function(o){const l=bqPovLu();l[bqPovSens()]=o;try{localStorage.setItem('ccCadrageBq',JSON.stringify(l));}catch(e){}};
  const rend=function(){const o=lit();el.querySelector('.cS').textContent=bqPovSens()==='couche'?'COUCHÉ':'DEBOUT';
    el.querySelectorAll('input').forEach(function(i){const k=i.getAttribute('data-k');if(document.activeElement!==i)i.value=o[k];i.nextElementSibling.textContent=(+o[k]).toFixed(k==='f'?1:2);});};
  el.addEventListener('input',function(e){const i=e.target;if(!i||!i.getAttribute)return;const o=lit();o[i.getAttribute('data-k')]=+i.value;garde(o);rend();});
  el.querySelector('.cT').addEventListener('click',function(){el.classList.toggle('ferme');el.querySelector('.cO').textContent=el.classList.contains('ferme')?'▸':'▾';});
  el.querySelector('.cZ').addEventListener('click',function(){garde(Object.assign({},BQ_POV_DEF));rend();});
  rend();let s0=bqPovSens();setInterval(function(){const on=!!(GBQ.on&&garageOn);el.classList.toggle('on',on);if(on||bqPovSens()!==s0){s0=bqPovSens();rend();}},250);}
if(BQ_CADRAGE){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bqPovPanneau);else setTimeout(bqPovPanneau,0);}
/* LE BLANC LAQUÉ de la boutique (2026-10-14, Léo : « les piliers lisses et blanc brillant », puis « le triple sol aussi blanc et lisse que
   les piliers ») : une matière partagée par les colonnes et le socle à gradins ; `k` assombrit à peine (les filets entre les gradins). */
function bqLaqueMat(k){bqLaqueMat._m=bqLaqueMat._m||{};const cle=String(k||1);if(bqLaqueMat._m[cle])return bqLaqueMat._m[cle];
  const lq=new THREE.MeshMatcapMaterial({color:0xffffff,fog:false,matcap:(function(){ /* le VERNIS PEINT (matcap) : base blanche, bords gris perle, un large reflet et un point
      de brillance net en haut à gauche — le blanc laqué se lit quelle que soit la lampe (avec Phong, la lampe du studio ne donnait qu'un blanc mat lavande) */
     const cv=document.createElement('canvas');cv.width=cv.height=256;const x=cv.getContext('2d');
     /* un fût vertical se lit sur la LIGNE MÉDIANE du matcap (ses normales sont presque horizontales) : les reflets y sont donc des BANDES
        verticales — un large reflet doux et un trait de brillance net côté lampe, un contre-reflet de l'autre côté, le bord qui s'assombrit */
     let gr=x.createRadialGradient(128,128,0,128,128,128);gr.addColorStop(0,'#f4f6f9');gr.addColorStop(.7,'#e9edf2');gr.addColorStop(.9,'#cfd6e0');gr.addColorStop(1,'#aeb8c6');x.fillStyle=gr;x.fillRect(0,0,256,256);
     const bande=function(cx,w,a){const g9=x.createLinearGradient(cx-w,0,cx+w,0);g9.addColorStop(0,'rgba(255,255,255,0)');g9.addColorStop(.5,'rgba(255,255,255,'+a+')');g9.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g9;x.fillRect(cx-w,0,2*w,256);};
     bande(96,46,.85);bande(92,9,1);bande(92,4,1);bande(186,22,.45);
     x.globalCompositeOperation='destination-in';gr=x.createRadialGradient(128,128,120,128,128,128);gr.addColorStop(0,'#000');gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,256,256);
     x.globalCompositeOperation='destination-over';x.fillStyle='#aeb8c6';x.fillRect(0,0,256,256);x.globalCompositeOperation='source-over';
     {const g9=x.createLinearGradient(0,0,0,84);g9.addColorStop(0,'rgba(250,251,253,1)');g9.addColorStop(.55,'rgba(250,251,253,.9)');g9.addColorStop(1,'rgba(250,251,253,0)');x.fillStyle=g9;x.fillRect(0,0,256,84);} /* le HAUT du matcap en blanc brillant : les dessus (gradins du socle) regardent vers le ciel et lisaient le bord gris */
     const t=new THREE.CanvasTexture(cv);return t;})()});lq.onBeforeCompile=function(sh){sh.fragmentShader=sh.fragmentShader.replace('vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;',
     'vec3 outgoingLight = diffuseColor.rgb * (matcapColor.rgb*1.05 + 4.2*pow(matcapColor.r,16.));');}; /* le reflet passe AU-DELÀ du blanc : l'étalonnage du jeu
     écrase les blancs contre un plafond (le sol a dû monter à ×3,4) — un vernis linéaire y sortait uniforme ; là, le corps reste un blanc doux et
     le reflet claque */
  if(k)lq.color.setScalar(k);return bqLaqueMat._m[cle]=lq;}
/* LE 1.61 (2026-10-14, Léo : « à la limite, un petit 1.61 blanc en 3D qui ressort du mur blanc de la boutique ») — la signature du jeu (le
   soleil « 1.61 »), en chiffres PIXEL (la police du jeu, 3 × 5) taillés en cubes, dans le BLANC LAQUÉ des colonnes (bqLaqueMat : le relief se lit
   à ses reflets, blanc sur blanc) ; derrière la caisse, au-dessus de son nom, loin dans la salle. Un seul maillage instancié. */
function bq161(g){
  const G={'1':['.X.','XX.','.X.','.X.','XXX'],'6':['XXX','X..','XXX','X.X','XXX'],'.':['.','.','.','.','X']},txt='1.61',P=.38,D=.5,pos=[];
  let lx=0;for(const ch of txt){const m=G[ch],w=m[0].length;for(let j=0;j<5;j++)for(let i=0;i<w;i++)if(m[j][i]==='X')pos.push([lx+i,4-j]);lx+=w+1;}
  const W=(lx-1)*P,im=new THREE.InstancedMesh(new THREE.BoxGeometry(P*.96,P*.96,D),bqLaqueMat(),pos.length),M9=new THREE.Matrix4();
  pos.forEach(function(p,k){M9.makeTranslation(-W/2+p[0]*P+P/2,p[1]*P+P/2,0);im.setMatrixAt(k,M9);});
  // il RESSORT D'UN MUR : un pan blanc (le blanc du fond, invisible en lui-même) juste derrière, qui porte son OMBRE douce, décalée en bas à droite
  const cv=document.createElement('canvas'),S=24,mg=3;cv.width=(lx-1+2*mg)*S;cv.height=(5+2*mg)*S;const x=cv.getContext('2d');x.filter='blur('+(S*.35)+'px)';x.fillStyle='rgba(60,70,90,.55)';
  pos.forEach(function(p){x.fillRect((mg+p[0])*S,(mg+4-p[1])*S,S,S);});
  const L9=(lx-1+2*mg)*P,H9=(5+2*mg)*P,mur=new THREE.Mesh(new THREE.PlaneGeometry(L9,H9),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,fog:false}));
  const grp=new THREE.Group();grp.add(im);mur.position.set(P*.45,-P*.55+2.5*P,-D/2-.02);grp.add(mur);
  grp.position.set(0,7.2,-22);grp.rotation.set(.06,-.18,0);g.add(grp);GBQ.s161=grp;}
function garBqBatit(){if(GBQ.grp)return; // (2026-10-12, Léo : « lâche le magasin… plutôt un carré blanc futuriste — on a trop de salles, la boutique c'est un truc hors du temps ») L'ESPACE BLANC
  const g=new THREE.Group();g.visible=false;scene.add(g);GBQ.grp=g;
  const B=function(c,o){return new THREE.MeshBasicMaterial(Object.assign({color:c,fog:false},o||{}));};
  const cvT=function(w,h,f){const cv=document.createElement('canvas');cv.width=w;cv.height=h;f(cv.getContext('2d'),w,h);const t=new THREE.CanvasTexture(cv);t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t;};
  // LE FOND : une sphère retournée, blanc pur au zénith, gris perle à l'horizon — aucun mur, aucun coin
  const R=60,tF=cvT(4,256,function(x,w,h){const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#ffffff');gr.addColorStop(.42,'#fafbfc');gr.addColorStop(.5,'#eceff2');gr.addColorStop(1,'#eceff2');x.fillStyle=gr;x.fillRect(0,0,w,h);});
  const fond=new THREE.Mesh(new THREE.SphereGeometry(R,32,24),B(0xffffff,{map:tF,side:THREE.BackSide}));fond.renderOrder=-10;fond.material.color.setScalar(2.6);g.add(fond); /* (×1,5 : l'étalonnage du jeu tasse les blancs — le fond doit sortir BLANC) */ // (elle écrit la profondeur : rien du monde ne passe derrière)
  /* LE BLANC STRUCTURÉ (2026-10-12, Léo : « le sol blanc pareil ; un arrière de la salle, même style ») : une toile de 4 × 4 petites dalles en
     relief (arête claire en haut à gauche, ombre en bas à droite, une teinte à peine différente par dalle) — la peau du sol, du socle, des murs */
  const tuileCv=document.createElement('canvas');tuileCv.width=tuileCv.height=128;{const x=tuileCv.getContext('2d'),r=mulberry32(0x7E1E);
    x.fillStyle='#edf0f4';x.fillRect(0,0,128,128);for(let i=0;i<4;i++)for(let j=0;j<4;j++){const X=i*32,Y=j*32,l=(r()*6-3)|0;
      x.fillStyle='rgb('+(243+l)+','+(245+l)+','+(248+l)+')';x.fillRect(X+1,Y+1,30,30);x.fillStyle='#ffffff';x.fillRect(X+1,Y+1,30,2);x.fillRect(X+1,Y+1,2,30);
      x.fillStyle='#f0f2f5';x.fillRect(X+1,Y+29,30,2);x.fillRect(X+29,Y+1,2,30);}}
  const tuile=function(rx,ry){const t=new THREE.CanvasTexture(tuileCv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;};
  GBQ.tuile=tuile;
  // LE SOL : en blanc structuré (des dalles de ~34 cm), à perte de vue
  const tS=cvT(512,512,function(x,w,h){const gr=x.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);gr.addColorStop(0,'#ffffff');gr.addColorStop(.25,'#f8f9fa');gr.addColorStop(1,'#eceff2');x.fillStyle=gr;x.fillRect(0,0,w,h);});
  const sol=new THREE.Mesh(new THREE.CircleGeometry(R*.97,64),B(0xffffff,{map:tuile(R*2*.97/1.36,R*2*.97/1.36)}));sol.rotation.x=-Math.PI/2;sol.material.color.setScalar(3.4);g.add(sol);bq161(g); /* (2026-10-13, Léo : « le sol de la boutique plus blanc, comme les socles qui tiennent les bras robots ») ×1,75 → ×3,4 (mesuré : 220 → 234, le blanc du fond) : le gris lavande devient blanc, les joints des dalles restent à peine lisibles */ // (2026-10-13, Léo : « le reflet en bas, c'est bof ») le sol miroir est retiré
  // (v3, Léo : « il y a juste l'ombre de la voiture ») plus de grille ni d'anneaux
  /* LE TRÔNE (2026-10-12, Léo : « une compo comme si la voiture était sur son trône ; la lueur en mode pics, comme l'iconographie de Jésus ;
     inspiré des compositions néo-classiques ; quelque chose qui met en avant la voiture ») : un socle de marbre à trois gradins cerclés d'or
     pâle, deux colonnes et une architrave derrière (le repère suit la caméra : la composition reste SYMÉTRIQUE autour de la caisse) ; la
     GLOIRE (rayons d'or pâle, longs et courts, une auréole) derrière elle — voir garBqGloire. */
  {
   /* (2026-10-14, Léo : « enlève les marches : la pièce blanche complète, juste les bras robots et tout ça ») plus de gradins (retirés du code
      le 18/10) ; les bras et leur plateau sortent du SOL (socleH ≈ 0, mais jamais 0 : plusieurs tests le lisent comme « il y a un socle ») */
   GBQ.socleH=.01;
   /* (2026-10-14, Léo : « essayons juste la salle blanche sans piliers ») la rotonde de seize colonnes laquées n'est plus posée (retirée du code le 18/10) */
   /* LA POUSSIÈRE D'OR (même demande, l'ambiance) : 90 grains carrés qui dérivent lentement dans la lumière autour de la caisse (bqPoussiere) */
   {const N=90,P=new Float32Array(N*3),r=mulberry32(0xD057);for(let i=0;i<N;i++){const a=r()*Math.PI*2,d=.8+r()*4.2;P[3*i]=Math.sin(a)*d;P[3*i+1]=.5+r()*4.5;P[3*i+2]=Math.cos(a)*d;}
    const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.BufferAttribute(P,3));
    const pt=new THREE.Points(ge,new THREE.PointsMaterial({color:0xe8b257,size:.045,sizeAttenuation:true,transparent:true,opacity:.7,depthWrite:false,fog:false}));pt.frustumCulled=false;g.add(pt);GBQ.poussiere=pt;GBQ.poussP0=P.slice();}}
  {const cv=document.createElement('canvas');cv.width=cv.height=1024;const x=cv.getContext('2d'),c0=512;
   {const gr=x.createRadialGradient(c0,c0,0,c0,c0,340);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.42,'rgba(255,246,228,.9)');gr.addColorStop(1,'rgba(255,240,215,0)');x.fillStyle=gr;x.fillRect(0,0,1024,1024);}
   const N=48;for(let i=0;i<N;i++){const a=i/N*Math.PI*2,L=i%2?330:505,w=i%2?.02:.032,gr=x.createRadialGradient(c0,c0,95,c0,c0,L);
     gr.addColorStop(0,'rgba(255,150,40,.72)');gr.addColorStop(.45,'rgba(255,196,70,.4)');gr.addColorStop(1,'rgba(255,214,110,0)');x.fillStyle=gr;x.beginPath();
     x.moveTo(c0+Math.cos(a-w)*95,c0+Math.sin(a-w)*95);x.lineTo(c0+Math.cos(a)*L,c0+Math.sin(a)*L);x.lineTo(c0+Math.cos(a+w)*95,c0+Math.sin(a+w)*95);x.closePath();x.fill();}
   x.strokeStyle='rgba(246,148,48,.72)';x.lineWidth=5;x.beginPath();x.arc(c0,c0,176,0,Math.PI*2);x.stroke();x.lineWidth=2;x.beginPath();x.arc(c0,c0,158,0,Math.PI*2);x.stroke();
   GBQ.gloire=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,opacity:0,depthWrite:false,fog:false}));
   GBQ.gloire.renderOrder=4;GBQ.gloire.visible=false;scene.add(GBQ.gloire);
   /* (2026-10-14, Léo : « la plate sous la voiture ») la gloire, plantée derrière la caisse, descend sous le sol : le sol la tranchait d'un trait
      net (sur le blanc, on croyait voir un sol invisible). Elle s'EFFACE en approchant du sol (alpha × lissé sur la hauteur du monde). */
   {const U=GBQ.gloireU={uY0:{value:0},uY1:{value:1}};GBQ.gloire.material.onBeforeCompile=function(sh){sh.uniforms.uY0=U.uY0;sh.uniforms.uY1=U.uY1;
     sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vWy;').replace('#include <project_vertex>','#include <project_vertex>\nvWy=(modelMatrix*vec4(transformed,1.)).y;');
     sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vWy;uniform float uY0;uniform float uY1;').replace('#include <dithering_fragment>','gl_FragColor.a*=smoothstep(uY0,uY1,vWy);\n#include <dithering_fragment>');};}} /* (three r128 : pas d'output_fragment dans la matière de base — l'accroche est le dithering) */
  const tOmb=cvT(128,128,function(x,w,h){const gr=x.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(20,24,30,.55)');gr.addColorStop(1,'rgba(20,24,30,0)');x.fillStyle=gr;x.fillRect(0,0,w,h);});
  GBQ.omb=new THREE.Mesh(new THREE.PlaneGeometry(1,1),B(0x000000,{map:tOmb,transparent:true,opacity:.5,depthWrite:false}));GBQ.omb.rotation.x=-Math.PI/2;GBQ.omb.position.y=(GBQ.socleH||0)+.006;GBQ.omb.renderOrder=3;g.add(GBQ.omb);
  // L'ONDE DU BOUM : dans la scène (elle part encore dans l'atelier)
  GBQ.choc=new THREE.Mesh(new THREE.RingGeometry(.86,1,56),new THREE.MeshBasicMaterial({color:0xdfe7ff,transparent:true,opacity:0,depthWrite:false,fog:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
  GBQ.choc.rotation.x=-Math.PI/2;GBQ.choc.visible=false;scene.add(GBQ.choc);
}
/* LE SON DE LA BOUTIQUE (2026-10-14, Léo : « et la boutique a son propre son ambiant ») : la musique du lobby s'y tait toujours (13/10 :
   « le sound design est terrifiant ») — la salle blanche a désormais SA voix, douce : une NAPPE DE VERRE (cinq voix, chacune un sinus et un
   triangle à peine désaccordés, sous 1,9 kHz) qui glisse toutes les 9 s entre deux accords de la pentatonique des petits sons (E 6/9 ↔
   C#m7(11), transposés sur la tonalité du moment, `sonTonSuit._t` : les clics restent justes), l'AIR de la salle (un souffle très aigu,
   très bas) et, toutes les 2,5-6 s, une petite note CRISTALLINE avec son écho. Bus des effets (MASTER). Monte en 1,2 s quand la boutique
   s'ouvre, s'efface en 0,6 s quand on en sort. */
const BQSON={n:null,off:0,acc:0,tP:0,atelier:false},BQSON_VOL=1;
/* (même soir, Léo : « session débogage sonore : à la boutique, au début, ça fait un bruit louche ») MESURÉ au banc muet (journal des sons +
   enregistrement de la sortie à l'ouverture de la boutique) : l'ATELIER continuait de sonner dans la salle blanche — `garage.ambiance` (le
   bourdon des néons, le tube qui GRÉSILLE) et `garage.feu` (la porte en feu qui gronde et crépite), aussi forts que la nouvelle nappe, sous le
   glitch (`ui.volet`) et la musique qui s'efface. En boutique, ces deux boucles plongent à −45 dB (0,35 s) ; au retour à l'atelier, le néon
   remonte et le feu reprend le niveau que lui donne garFeu. La nappe de la boutique arrive après le glitch (montée plus lente). */
function bqAtelierSourdine(on){
  /* (2026-10-14, session SON, relevé par GENERAL) la sourdine suit aussi les boucles qui NAISSENT en boutique : SON coupé à l'entrée (ou
     banque pas prête), le néon et le feu n'existaient pas encore ; la boucle principale les crée ensuite (toutes les 800 ms) et ils
     repartaient à plein dans la salle blanche — le « bruit louche » revenait en rallumant SON. On réapplique dès que l'une d'elles change. */
  const a9=openGarage._amb||null,f9=openGarage._feu||null;
  if(BQSON.atelier===on&&BQSON.amb9===a9&&BQSON.feu9===f9)return;BQSON.atelier=on;BQSON.amb9=a9;BQSON.feu9=f9;
  try{if(openGarage._amb)openGarage._amb.gain(on?-45:0,on?.12:.25);}catch(e){}
  try{if(openGarage._feu){if(on)openGarage._feu.gain(-45,.12);else if(GAR.porte)GAR.porte.db=null;else openGarage._feu.gain(0,.25);}}catch(e){}
}
const BQSON_ACC=[[52,59,66,68,73],[49,56,64,66,71]]; // E 6/9 (mi · si · fa# · sol# · do#) ↔ C#m7(11) (do# · sol# · mi · fa# · si) : chaque voix glisse d'un pas
function bqSon(dt,on){
  bqAtelierSourdine(!!on);
  if(on&&BQ_MUSIQUE&&SND.music)on=false; /* (2026-10-16, Sacha) la musique du garage a suivi : la nappe se tait (voir BQ_MUSIQUE) — l'atelier, lui, reste en sourdine */
  if(!on){if(BQSON.n&&!BQSON.off)bqSonCoupe(.6);return;}
  if(!AC||AC.state!=='running'||!SND.sfx)return;
  let n=BQSON.n;const now=AC.currentTime,ton=(sonTonSuit._t|0);
  if(!n){
    const g=AC.createGain();g.gain.value=0;g.connect(MASTER);
    const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1900;lp.Q.value=.3;lp.connect(g);
    const V=[];BQSON.acc=0;
    for(const m of BQSON_ACC[0]){const f=440*Math.pow(2,(m+ton-69)/12),gv=AC.createGain();gv.gain.value=.006;gv.connect(lp);
      const a=AC.createOscillator(),b=AC.createOscillator();a.type='sine';b.type='triangle';a.frequency.value=f;b.frequency.value=f;b.detune.value=6;a.detune.value=-4;
      a.connect(gv);b.connect(gv);a.start();b.start();V.push({a:a,b:b,g:gv});}
    const air=AC.createBufferSource();air.buffer=noiseBuf(2.7);air.loop=true;
    const ah=AC.createBiquadFilter();ah.type='highpass';ah.frequency.value=4200;const al=AC.createBiquadFilter();al.type='lowpass';al.frequency.value=9000;
    const ag=AC.createGain();ag.gain.value=.0028;air.connect(ah); // l'air de la salle — (2026-10-14, Léo : « alléger un tout petit peu le bruit constant ») .004 → .0028 (−3 dB)ah.connect(al);al.connect(ag);ag.connect(g);air.start();
    const ec=AC.createDelay(1);ec.delayTime.value=.38;const eg=AC.createGain();eg.gain.value=.35;const pg=AC.createGain();pg.gain.value=1;
    pg.connect(g);pg.connect(ec);ec.connect(eg);eg.connect(ec);eg.connect(g);
    n=BQSON.n={g:g,lp:lp,V:V,air:air,pg:pg,ec:ec,eg:eg,t:0,tA:0};BQSON.tP=1.5;
  }
  if(BQSON.off){clearTimeout(BQSON.off);BQSON.off=0;}
  n.t+=dt;stt(n.g.gain,BQSON_VOL*(.85+.15*Math.sin(n.t*.31))*Math.min(1,Math.max(0,(n.t-.35)/.5)),now,.45); // elle attend la fin du glitch (~0,35 s) puis monte
  n.tA+=dt;if(n.tA>9){n.tA=0;BQSON.acc^=1;}                                   // l'accord change toutes les 9 s, chaque voix glisse en ~1,5 s
  const A=BQSON_ACC[BQSON.acc];
  for(let i=0;i<n.V.length;i++){const f=440*Math.pow(2,(A[i]+ton-69)/12);stt(n.V[i].a.frequency,f,now,.5);stt(n.V[i].b.frequency,f,now,.5);
    stt(n.V[i].g.gain,.006*(.75+.25*Math.sin(n.t*(.13+.07*i)+i)),now,.6);}
  BQSON.tP-=dt;if(BQSON.tP<=0){BQSON.tP=2.5+Math.random()*3.5;              // la note cristalline : une note de la pentatonique, haut, qui s'éteint en ~2,5 s
    const PENTA=[0,2,4,7,9],m=76+PENTA[(Math.random()*5)|0]+12*((Math.random()*2)|0)+ton;
    try{const o=AC.createOscillator(),og=AC.createGain(),t0=AC.currentTime+.02;o.type='sine';o.frequency.value=440*Math.pow(2,(m-69)/12);
      og.gain.setValueAtTime(0,t0);og.gain.linearRampToValueAtTime(.022,t0+.006);og.gain.setTargetAtTime(0,t0+.01,.8);
      o.connect(og);og.connect(n.pg);o.start(t0);o.stop(t0+4);}catch(e){}}
}
function bqSonCoupe(d){const n=BQSON.n;if(!n||!AC)return;
  try{n.g.gain.cancelScheduledValues(AC.currentTime);n.g.gain.setTargetAtTime(0,AC.currentTime,d/3);n.g.gain._s9=0;}catch(e){}
  clearTimeout(BQSON.off);BQSON.off=setTimeout(function(){if(BQSON.n!==n)return;try{for(const v of n.V){v.a.stop();v.b.stop();}n.air.stop();n.g.disconnect();n.eg.disconnect();}catch(e){}BQSON.n=null;BQSON.off=0;},d*1000+500);}
window.dbgBqSon=function(){return {on:!!BQSON.n,gain:BQSON.n?+BQSON.n.g.gain.value.toFixed(4):0,acc:BQSON.acc,veut:!!(typeof GBQ!=='undefined'&&GBQ.veut)};}; // (dev)
function garBqAmbiance(on){garLibre._r=null; // (v3) au BASCULEMENT (pic de la lueur) : la lumière, et les voiles d'encre du garage retirés (#garage.bqBlanc)
  if(gEl)gEl.classList.toggle('bqBlanc',on);try{bioApply(on?bqBio():BIOMES.atelier);}catch(e){}}
function bqVoile(v){let w=document.getElementById('gBqVoile'); // LE VOILE de la bascule garage ⇄ boutique (voir garBqIndus et LE SOUFFLE DE LUMIÈRE) : v=true blanc, false nuit, null = il se lève
  if(!w){w=document.createElement('div');w.id='gBqVoile';w.setAttribute('aria-hidden','true');document.body.appendChild(w);}
  clearTimeout(bqVoile._t);clearTimeout(bqVoile._t2);const cv=renderer.domElement,rm=REDUCED_MOTION;
  if(v===null){ // dessous, l'écran neuf est en place : l'image part un peu trop près (bqPose, sans transition), puis, deux images plus tard (l'écran neuf est peint), le voile se lève et l'image se pose
    cv.classList.remove('bqPasse','bqArrive');cv.classList.add('bqPose');
    requestAnimationFrame(function(){requestAnimationFrame(function(){cv.classList.remove('bqPose','recul');cv.classList.add('bqArrive');w.classList.add('leve');
      bqVoile._fin=performance.now()+(rm?220:560);bqVoile._t2=setTimeout(function(){cv.classList.remove('bqArrive');cv.style.transformOrigin='';},700);});});
    bqVoile._fin=performance.now()+1200;bqVoile._t=setTimeout(function(){w.className='';},rm?400:900);return;}
  // la lumière naît sur la caisse : son centre à l'écran
  try{const p=GBQ._vf||(GBQ._vf=new THREE.Vector3());carGroup.getWorldPosition(p);p.y+=.55;p.project(camera);
    if(p.z<1&&Math.abs(p.x)<1.5&&Math.abs(p.y)<1.5){const x=(p.x*.5+.5)*100,y=(.5-p.y*.5)*100;w.style.setProperty('--fx',x.toFixed(1)+'%');w.style.setProperty('--fy',y.toFixed(1)+'%');cv.style.transformOrigin=x.toFixed(1)+'% '+y.toFixed(1)+'%';}}catch(e){}
  w.className=v?'blanc':'nuit';void w.offsetWidth;w.classList.add('on');
  cv.classList.remove('bqPose','bqArrive');cv.classList.toggle('recul',!v);void cv.offsetWidth;cv.classList.add('bqPasse');
  bqVoile._fin=performance.now()+2e3;
  bqVoile._t=setTimeout(function(){if(!GBQ.bascule){GBQ.bascule=true;GBQ.on=GBQ.veut;bqClasses(GBQ.veut);try{garBqAmbiance(GBQ.veut);}catch(e){}}bqVoile(null);},1400);} // filet : jamais de voile collé ni d'interface à moitié basculée (onglet caché, garage quitté en plein geste)
function bqClasses(on){document.documentElement.classList.toggle('bqIndus',on);if(gEl)gEl.classList.toggle('bqIndus',on);garLibre._r=null;} // dès le geste : l'interface du garage s'efface
/* LA LUEUR DERRIÈRE LA CAISSE (v3) : un disque blanc tourné vers la caméra, posé DERRIÈRE la caisse (elle reste devant : il est caché par
   elle), qui grandit jusqu'à couvrir le garage ; une nappe blanche s'étale au sol depuis sous elle. Deux objets de la scène (hors de
   l'atelier : ils survivent au basculement), blancs au-delà de 1 (le bloom les fait rayonner). */
function garBqLueurBatit(){if(GBQ.halo)return;
  const cv=document.createElement('canvas');cv.width=cv.height=256;const x=cv.getContext('2d'),gr=x.createRadialGradient(128,128,0,128,128,128);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.45,'rgba(255,255,255,1)');gr.addColorStop(.72,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,256,256);
  const t=new THREE.CanvasTexture(cv),m=function(){const mt=new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:0,depthWrite:false,fog:false});mt.color.setScalar(1.3);return mt;};
  GBQ.halo=new THREE.Mesh(new THREE.PlaneGeometry(1,1),m());GBQ.halo.visible=false;GBQ.halo.renderOrder=5;scene.add(GBQ.halo);
  GBQ.nappe=new THREE.Mesh(new THREE.PlaneGeometry(1,1),m());GBQ.nappe.rotation.x=-Math.PI/2;GBQ.nappe.visible=false;GBQ.nappe.renderOrder=4;scene.add(GBQ.nappe);}
function garBqGloire(dt,t9){const G9=GBQ.gloire;if(!G9)return;if(GBQ.gloireU&&GBQ.grp){const y0=GBQ.grp.position.y+(GBQ.socleH||0);GBQ.gloireU.uY0.value=y0+.15;GBQ.gloireU.uY1.value=y0+1.6;}
  const kg=GBQ.on?Math.min(1,Math.max(0,(GBQ.t-.95)/.75)):Math.max(0,(GBQ.gk||0)-dt*5);GBQ.gk=kg;G9.visible=kg>.01;if(!G9.visible)return;
  const v=GBQ._vg||(GBQ._vg=new THREE.Vector3()),d=GBQ._dg||(GBQ._dg=new THREE.Vector3());carGroup.getWorldPosition(v);v.y+=.5;
  d.copy(v).sub(camera.position);d.y=0;d.normalize();G9.position.copy(v).addScaledVector(d,3.6);G9.quaternion.copy(camera.quaternion);G9.rotateZ(t9*.045);
  const e=kg*kg*(3-2*kg),fl9=GBQ.gFlash||0,sc=(13-3.2*e)*(1+.22*fl9*fl9);G9.scale.set(sc,sc,1);G9.material.opacity=Math.min(1,e*.95+.25*fl9);}
function garBqLueur(ay){const g=GBQ.lueur||0;garBqLueurBatit();const vis=g>.002;GBQ.halo.visible=GBQ.nappe.visible=vis;if(!vis)return;
  const v=GBQ._vl||(GBQ._vl=new THREE.Vector3()),d=GBQ._dl||(GBQ._dl=new THREE.Vector3());carGroup.getWorldPosition(v);v.y+=.55;
  d.copy(v).sub(camera.position);d.y=0;d.normalize();GBQ.halo.position.copy(v).addScaledVector(d,2.8);GBQ.halo.quaternion.copy(camera.quaternion);
  const e=g*g,s=1.2+80*e;GBQ.halo.scale.set(s,s,1);GBQ.halo.material.opacity=Math.min(1,g*1.7);
  const sn=2.5+90*Math.pow(g,1.6);GBQ.nappe.position.set(v.x,ay+GAR.POD+.016,v.z);GBQ.nappe.scale.set(sn,sn,1);GBQ.nappe.material.opacity=Math.min(1,g*1.5);}
/* L'INTERFACE DE LA BOUTIQUE v3 (2026-10-12, Léo : « le petit nom de la voiture en plus petit, mieux placé ; d'abord la boutique des
   voitures que tout le monde peut acheter, avec les pièces, et à côté on peut sélectionner les offres ; l'orange n'est pas beau, trouve
   quelque chose qui se marie mieux avec le blanc ») : l'accent devient un BLEU ÉLECTRIQUE (#3d4bff) sur blanc et noir. En haut à gauche
   BOUTIQUE, et dessous, en petit, la caisse affichée (rareté · nom · ÉDITION LIMITÉE et son compte à rebours) ; l'argent à droite. En bas :
   deux onglets — VOITURES (en pièces, pour tout le monde : bqPieces) d'abord, OFFRES (les éditions limitées de la semaine, en €,
   introuvables en jeu : bqEphemeres) à côté — et la rangée de vignettes ; RETOUR et ACHETER (noir) sous le pouce. */
function bqFigHab(k){const o=bqCos(k),d=o.d,hx=function(c9){return '#'+(c9>>>0).toString(16).padStart(6,'0');};
  if(o.cat==='figure')return '<i class="bqFig">'+pxi('rotation')+'</i>';
  if(o.cat==='peinture')return '<i class="bqSw" style="background:'+(d.mot?motFond(d):d.grad?'linear-gradient(150deg,'+d.grad.map(hx).join(',')+')':hx(d.c||0xff7a3a))+'"></i>';
  if(o.cat==='trainee'){const I9=illuTr(d);if(I9)return illuPx(I9,'bqTrIc');} // (2026-10-14) une traînée POP : son pictogramme — (2026-10-16, TRAÎNÉES) TOUTES les traînées, et EN COULEUR (celui de l'inventaire) : en noir sur la salle blanche, SAKURA, MATRICE et LA GRILLE se ressemblaient ; NITRO, MENTHE, ROSE et OR n'étaient qu'un dégradé
  if(o.cat==='trainee')return '<i class="bqRub" style="background:'+(d.rainbow?'linear-gradient(90deg,#ff3b3b,#ff9b1a,#ffe23a,#3bff6a,#3bb4ff,#9b5bff)':'linear-gradient(90deg,rgba(255,255,255,0),'+(d.rgb?'rgb('+d.rgb.map(function(v){return Math.round(Math.min(1,v/1.45)*255);}).join(',')+')':'#ff6a14')+' 45%,#fff)')+'"></i>';
  return pxi(d.ico||'aile');}
function bqPieces(){const L=[];for(let i=0;i<CARS.length;i++){const u=CAR_UNLOCK[i];if(carRetiree(i))continue;if(u&&u.p>0&&u.k!=='premium')L.push([i,0]);else if(u&&u.k==='mis')L.push([i,1]);} /* les caisses qui s'achètent en PIÈCES (0) et celles des missions (1) */
  /* (2026-10-20, Sacha : « dans le menu cars du garage c'est le bordel, plusieurs sections de la même rareté : toutes les voitures d'une même rareté dans la même section ») UN SEUL CLASSEMENT, le même
     que celui des intertitres (bqVoitRail) : RARETÉ (l'ordre de RARETES : COMMUNES, RARES, ÉPIQUES…), puis dans la famille ce qui s'achète (du moins cher au plus cher) AVANT les missions ; les secrètes
     (m2Secrete, pas encore à toi) en dernier. Plus de liste figée : une secrète qu'on gagne quittait la fin de la liste en gardant sa rareté et rouvrait une 2e section de la même famille. */
  const g9=function(i){return m2Secrete(i)?99:Math.max(0,RARETES.findIndex(function(x){return x.id===carRar(i);}));};
  return L.sort(function(a,b){return (g9(a[0])-g9(b[0]))||(a[1]-b[1])||(a[1]?0:CAR_UNLOCK[a[0]].p-CAR_UNLOCK[b[0]].p)||(a[0]-b[0]);}).map(function(e){return e[0];});}
/* (2026-10-18) l'INTERTITRE de chaque famille dans le rayon VOITURES (comme ceux des figures) : le logo de la rareté à sa couleur, son nom, le
   nombre de caisses ; les missions secrètes ont le leur. `n` = nombre de caisses de la famille dans la liste. */
function bqRarSec(r,n,a){const cpt='<em><i>'+a+'</i>/'+n+'</em>'; /* (2026-10-20) « ceux à toi / le total » de la famille */
  if(r==='secret')return '<div class="bqSec bqRarS" data-rar="secret" style="--rc:#ff3ec8"><span class="bqRl">'+pxi('verrou')+'</span><b>'+sansAcc(TR('MISSIONS SECRÈTES'))+'</b><s></s>'+cpt+'</div>';
  const ri=rarInfo(r);return '<div class="bqSec bqRarS" data-rar="'+r+'" style="--rc:'+ri.c+'"><span class="bqRl">'+pxi(RAR_LOGO[r]||'etoile')+'</span><b>'+sansAcc(TR(ri.n))+'</b><s></s>'+cpt+'</div>';}
function bqVoitRail(L){const fam=function(k){const i=+k.slice(2);return m2Secrete(i)?'secret':carRar(i);},nb={},ok={};L.forEach(function(k){const f=fam(k);nb[f]=(nb[f]|0)+1;if(bqA(k))ok[f]=(ok[f]|0)+1;});
  return L.map(function(k,n){const f=fam(k);return (n&&fam(L[n-1])===f?'':bqRarSec(f,nb[f],ok[f]|0))+bqCarteHtml(k,n,false);});} /* (2026-10-16) LES MISSIONS v2 : après les caisses à pièces, celles des missions, puis les secrètes en silhouette */
function bqPxT(v){return fmtSolde(v);} /* (clarté 15/10) les prix de la boutique de Léo au format GTA de GAMEPLAY (chiffres pleins, un seul « $ ») */
function bqPxLg(t){return String(t).replace(/<[^>]*>/g,'').length>9;} /* un prix long (≥ 1 000 000) passe un corps en dessous : il tient dans sa carte */
function bqPrixCaisse(i){const u=CAR_UNLOCK[i]||{};if(bqA('v:'+i))return {t:sansAcc(TR('À TOI')),c:'acq'};if(m2Secrete(i))return {t:sansAcc(TR('MISSION SECRÈTE')),c:'defi sec'};if(u.k==='premium')return {t:eurTxt(u.eur),c:'eur'};
  if(u.p)return {t:bqPxT(u.p),c:'pc'};return {t:sansAcc(TR('MISSION')),c:'defi'};}
/* L'INTERFACE v4 (2026-10-12, Léo : « l'argent à côté de BOUTIQUE, et la boutique peut encore prendre tout cet espace ; le bouton VOITURES
   laisse choisir entre les traînées… ; sur le côté gauche qui défile, ce sont les objets hebdomadaires ») :
   · en-tête : BOUTIQUE et, juste à côté, l'argent ; dessous en petit ce qu'on regarde ; couché, la boutique monte jusqu'en haut à droite ;
   · onglets : le 1er dit la CATÉGORIE (VOITURES · PEINTURES · AILES · TRAÎNÉES) — retouché, il ouvre le choix (#gBqPan .bqMenu) —, le 2e les OFFRES ;
   · la colonne de gauche, qui défile : CETTE SEMAINE — trois caisses et trois habillages tirés sur la semaine (bqSemaine). */
/* (2026-10-15, Sacha) ACHAT : à la place de l'onglet OFFRES — TOUTES les caisses payantes (bqAchat), plus seulement les quatre de la semaine */
const BQ_CATS=[['voiture','VOITURES','voiture'],['achat','ACHAT','panier'],['peinture','PEINTURES','pinceau'],['aile','AILES','aile'],['trainee','TRAÎNÉES','trainee'],['figure','FIGURES','rotation']]; // (2026-10-14) FIGURES : les tricks du double-tap nitro (figures.js)
/* LES FIGURES PAR DIRECTION (2026-10-15, Sacha : « dans la boutique classe toutes les figures selon ces deux catégories » · puis « mets aussi
   une catégorie vers l'ARRIÈRE ; une même figure doit avoir marqué à quelle direction elle peut aller ») : VERS L'AVANT (pouce en avant), VERS
   L'ARRIÈRE (pouce en arrière), SUR LES CÔTÉS (pouce à gauche ou à droite : elle part de ce côté). Une figure à deux sens (rodéo, tire-bouchon,
   cosmique) a sa carte dans CHACUNE de ses sections : la carte porte sa direction (`data-dir`), ÉQUIPER la met dans CET emplacement (bqFigDir).
   Dans chaque section, l'ordre du catalogue (du moins cher au plus cher). Un intertitre `.bqSec` (bqFigSec) ouvre chaque section : ce n'est
   pas une carte — ni clic, ni compte (le compte de l'onglet reste celui des figures, une fois chacune : bqListe). */
function bqFigSec(c){const F=FIG_FAM[c];return '<div class="bqSec" data-fam="'+c+'">'+pxi(F[2])+'<b>'+sansAcc(TR(F[0]))+'</b><em>'+sansAcc(TR(F[1]))+'</em></div>';}
function bqFigRail(){const R=[];if(!window.FIG)return R;for(let c=0;c<FIG_NB;c++)FIG.liste.forEach(function(f){if(figPeut(f.id).indexOf(c)>=0)R.push({k:'figure:'+f.id,c:c});});return R;}
function bqFigDir(id){const P=figPeut(id);return GBQ.figDir!=null&&P.indexOf(GBQ.figDir)>=0?GBQ.figDir:P[0];} // la direction de la carte touchée (sinon la 1re de la figure)
/* LES TROIS FIGURES ÉQUIPÉES, EN HAUT DU RAYON FIGURES (2026-10-16, Sacha : « dans la boutique, quand on arrive dans les figures, le truc des
   hexagones que tu avais mis dans l'inventaire, faut que tu le remettes, version adaptée, dans la boutique » · « tout en haut, tu remets les
   hexagones comme tu avais mis, mais en blanc ») — le sélecteur de l'inventaire (#gFigSel, voir gFigSelMaj : l'éclair du NITRO et « ×2 », puis
   les trois cases hexagonales ↑ avant · ↓ arrière · ◄► côté, la figure équipée qui tourne dedans, son nom dessous) redessiné pour la salle
   blanche : #bqFigSel, en haut du panneau, AU-DESSUS de la grille — il ne défile pas avec elle, on voit ce qu'on porte en feuilletant (son
   dessin : <style id="bqFigHex">). Toucher une case = toucher la carte de SA figure dans SA direction (essayée sur le plateau, le bouton dit
   ÉQUIPÉE) et l'amener en vue ; une case VIDE amène l'intertitre de sa direction. ÉQUIPER une figure (bqAction) fait flasher la case qui la
   reçoit ; la case de la figure qu'on regarde prend l'anneau d'encre, comme la carte choisie. */
const BQFS={k:'',S:null};
function bqFigSelEl(pan){let el=document.getElementById('bqFigSel');if(el)return el;
  el=document.createElement('div');el.id='bqFigSel';el.setAttribute('role','group');
  el.innerHTML='<div class="fsNitro" aria-hidden="true">'+gFigNitroSvg()+'<b>×2</b></div>'
    +FIG_FAM.map(function(F,k){return '<button type="button" class="fsHex" data-k="'+k+'"><span class="fsCase"><span class="fsIn"></span></span><i class="fsJoy">'+pxi(F[2])+'</i><b class="fsNom"></b></button>';}).join('');
  pan.insertBefore(el,pan.firstChild);
  el.addEventListener('click',function(e){const b=e.target.closest&&e.target.closest('.fsHex');if(!b)return;e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on||!GBQ.on)return;
    const k=+b.getAttribute('data-k'),id=figSlots()[k],rail=pan.querySelector('.bqRail');uiPop(b);if(!rail)return;
    const sec=rail.querySelector('.bqSec[data-fam="'+k+'"]'),ci=id?rail.querySelector('.bqK[data-k="figure:'+id+'"][data-dir="'+k+'"]'):sec;
    if(ci){const r0=rail.getBoundingClientRect().top,rc=ci.getBoundingClientRect(),rs=sec&&sec.getBoundingClientRect(); // l'intertitre de la direction reste en vue si la carte tient dessous
      const y=Math.max(0,rail.scrollTop+(rs&&rc.bottom-rs.top<=rail.clientHeight?rs.top-r0-2:rc.top-r0-6));try{rail.scrollTo({top:y,behavior:REDUCED_MOTION?'auto':'smooth'});}catch(e2){rail.scrollTop=y;}}
    if(id&&ci)ci.click();else{uiClic('onglet');hap(6);}}); // la carte touchée fait le reste : l'essai, le son, le cadre .sel
  return el;}
function bqFigSelMaj(pan,on){if(!on||!window.FIG)return;const el=bqFigSelEl(pan);
  const S=figSlots(),cur=bqCourant(),k=S.join(',')+'|'+cur+'|'+GBQ.figDir+'|'+LANG;if(BQFS.k===k)return;BQFS.k=k;
  const P=BQFS.S;BQFS.S=S.slice();el.setAttribute('aria-label',sansAcc(TR('FIGURES ÉQUIPÉES')));
  el.querySelectorAll('.fsHex').forEach(function(b){const s=+b.getAttribute('data-k'),id=S[s],f=id&&FIG.par[id],c=f?rarInfo(cosmRar('figure',f)).c:'#d3d8de',nm=f?sansAcc(TR(f.n)):sansAcc(TR('VIDE'));
    const vu=!!f&&cur==='figure:'+id&&(GBQ.figDir==null?bqFigDir(id)===s:GBQ.figDir===s),ik=(id||'')+c;
    b.style.setProperty('--fc',c);b.classList.toggle('vide',!f);b.classList.toggle('on',vu);b.setAttribute('aria-pressed',vu);
    if(b._ik!==ik){b._ik=ik;b.querySelector('.fsIn').innerHTML=f?illuFig(id,c,s===0):'<b class="fsQ">?</b>';} // réécrit seulement si la figure change : sa rotation ne repart pas à chaque carte touchée
    b.querySelector('.fsNom').textContent=nm;b.setAttribute('aria-label',sansAcc(TR(FIG_FAM[s][0]))+' : '+nm);
    if(P&&P[s]!==S[s]&&f){b.classList.remove('flash');void b.offsetWidth;b.classList.add('flash');}});}
function bqAchat(){const eu=function(i){return parseFloat(String((CAR_UNLOCK[i]||{}).eur||'').replace(',','.'))||0;},une=function(i){return CAR_UNLOCK[i]&&CAR_UNLOCK[i].une?0:1;}; // l'offre de lancement (`une`) en tête, puis de la moins chère à la plus chère
  return bqPayantes().slice().sort(function(a,b){return (une(a)-une(b))||(eu(a)-eu(b))||(a-b);});}
function bqListe(cat){if(cat==='voiture')return bqPieces().map(function(i){return 'v:'+i;});if(cat==='achat')return bqAchat().map(function(i){return 'v:'+i;});if(cat==='figure')return window.FIG?FIG.liste.map(function(f){return 'figure:'+f.id;}):[];if(cat==='peinture')return peintOrdre().map(function(j){return 'peinture:'+COSM.peinture[j].id;}); /* (2026-10-16) rangées par RARETÉ (voir peintOrdre) */ return (COSM[cat]||[]).map(function(d){return cat+':'+d.id;});}
function bqCarteHtml(k,n,lim,dir){const vo=k[0]==='v',i=vo?+k.slice(2):-1,o=vo?null:bqCos(k),d=o&&o.d,a=bqA(k),sec9=vo&&m2Secrete(i);let ri=rarInfo(vo?carRar(i):cosmRar(o.cat,d)),nom=vo?TR(CARS[i].name):TR(d.n);if(sec9){ri={c:'#ff3ec8',n1:'SECRÈTE'};nom='? ? ?';} /* (2026-10-16) une SECRÈTE : ni nom, ni rareté, ni couleur */
  let px,c='';if(vo){const p9=bqPrixCaisse(i);px=(p9.c==='pc'?pxi('piece'):'')+String(p9.t).replace(/</g,'');c=p9.c;}
  else if(a){px=sansAcc(TR('À TOI'));c='acq';}else if(d.pack==='chat'){px=sansAcc(TR('PACK CHAT'));c='eur';}else if(d.eur){px=eurTxt(d.eur);c='eur';}else if(d.p){px=pxi('piece')+bqPxT(d.p);c='pc';}else{px=sansAcc(TR('MISSION'));c='defi';} /* (2026-10-18 soir) l'ARC-EN-CIEL : PACK CHAT (voir chatPackI) */
  if(bqPxLg(px))c+=' lg';
  return '<div class="bqK'+(sec9?' m2sec':'')+(lim?' off':'')+(vo?'':' hab')+'" data-k="'+k+'"'+(dir!=null?' data-dir="'+dir+'"':'')+' role="button" style="--rc:'+ri.c+';--i:'+Math.min(n,8)+'" aria-label="'+String(nom).replace(/"/g,'')+'">'
    +(vo?'<span class="bqKph" data-ph="'+i+'"></span>':o.cat==='aile'?'<span class="bqKph c-aile" data-pha="'+d.id+'"></span>':o.cat==='figure'?'<span class="bqKph c-figure" data-phf="'+d.id+'|'+FIG_DIR[dir!=null?dir:figPeut(d.id)[0]]+'">'+bqFigHab(k)+'</span>':'<span class="bqKph c-'+o.cat+'">'+bqFigHab(k)+'</span>')+(lim&&!(vo&&CAR_UNLOCK[i]&&CAR_UNLOCK[i].une)?'<span class="bqKl">'+sansAcc(TR('LIMITÉE'))+'</span>':'')+(vo&&!a&&i===chatPackI()?'<span class="bqKl arc">'+insec(sansAcc(TR('+ TRAÎNÉE ARC-EN-CIEL')))+'</span>':'')
    +'<span class="bqKr'+(sansAcc(TR(ri.n1)).length>8?' lg':'')+'">'+sansAcc(TR(ri.n1))+'</span><span class="bqKn">'+sansAcc(String(nom))+'</span><span class="bqKp '+c+'">'+px+'</span></div>';} /* (clarté 14/10) la RARETÉ s'écrit sur la carte */
/* LES PHOTOS DES DEUX BOUTIQUES (2026-10-14, session OPTIMISATION — PILOTAGE : « les photos des cartes de la boutique du jour ne s'affichent
   plus »). `bqPhotos` était déclarée DEUX fois : celle des cartes du bandeau de l'atelier (`.fnC` + `.fnPh`, OFFRES ÉPHÉMÈRES / DU JOUR) et
   celle de la boutique de Léo (`[data-ph]`) ; la seconde, hissée, écrasait la première — les cartes du bandeau restaient sans photo. Une
   seule fonction fait les deux (le `[data-ph]` couvre aussi `.fpPh i` et `.fpSlPh` de l'ancienne). */
function bqPhotos(el){
  el.querySelectorAll('.fnC[data-fn^="v:"],.fnC[data-fn^="o:"]').forEach(function(c){const i=+c.getAttribute('data-fn').slice(2);
    photoFile(i,function(url){const ph=c.querySelector('.fnPh');if(ph&&!ph.firstChild){const im=document.createElement('img');im.alt='';im.src=url;ph.appendChild(im);}},c);});
  el.querySelectorAll('[data-ph]').forEach(function(x){photoFile(+x.getAttribute('data-ph'),function(url){if(!x.firstChild){const im=document.createElement('img');im.alt='';im.src=url;x.appendChild(im);}},x);}); /* (2026-10-16) l'élément : la photo attend que la carte soit EN VUE (voir LE STUDIO SANS À-COUPS) */
  el.querySelectorAll('[data-pha]:not(.ok)').forEach(function(x){aileFile(x.getAttribute('data-pha'),function(url){if(x.classList.contains('ok')||!url)return;const im=document.createElement('img');im.alt='';im.src=url;x.textContent='';x.appendChild(im);x.classList.add('ok');},x);}); /* (2026-10-15) les AILES ont leur photo (aileFile) */
  el.querySelectorAll('[data-phf]:not(.ok)').forEach(function(x){const p=x.getAttribute('data-phf').split('|');figFile(p[0],p[1],function(url){if(x.classList.contains('ok')||!url)return;x.classList.add('ok');filmPose(x,url,p[0]);},x);});} /* (2026-10-15 soir) et les FIGURES leur photo-séquence (figFile), dans le sens de leur carte — (2026-10-18) leur FILM au ralenti (filmPose) */
function garBqUI(){let ui=document.getElementById('gBq');if(ui)return ui;
  ui=document.createElement('div');ui.id='gBq';
  ui.innerHTML='<div id="gBqTete"><div class="bqT1"><div class="bqTl"><b data-fr="BOUTIQUE">'+sansAcc(TR('BOUTIQUE'))+'</b><div class="bqArg"><b id="gBqArg"></b></div></div>'
      +'</div></div>'
    +'<div id="gBqNom"><span class="bqRar"></span><span class="bqNom"></span><span class="bqLim">'+pxi('horloge')+'<em></em></span></div>'
    +'<div id="gBqSkins"><b>'+sansAcc(TR('COLORIS'))+'</b><div class="bqSk"></div></div>'
    /* (2026-10-15, Sacha) à la place de CETTE SEMAINE : les RAYONS (voir le CSS « LES RAYONS DE LA BOUTIQUE ») ; plus de barre VOITURES ▾ · OFFRES au-dessus de la grille */
    +'<div id="gBqCats" role="tablist" aria-orientation="vertical">'+BQ_CATS.map(function(c){return '<button type="button" data-c="'+c[0]+'" role="tab" aria-selected="false" aria-label="'+sansAcc(TR(c[1]))+'">'+pxi(c[2])+'<span>'+sansAcc(TR(c[1]))+'</span></button>';}).join('')+'</div>'
    +'<div id="gBqPan"><div class="bqRail"></div></div>';
  gEl.insertBefore(ui,gEl.firstChild);
  {const ga=document.getElementById('gAct');if(ga&&!document.getElementById('gBqBtn')){const bt=document.createElement('div');bt.id='gBqBtn';bt.setAttribute('role','button');bt.tabIndex=0;ga.appendChild(bt);
    bt.addEventListener('click',function(e){e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on||!GBQ.on)return;uiPop(bt);bqAction();});}}
  const pan=ui.querySelector('#gBqPan'),ok=function(){return garageOn&&!GAR.go&&!ecranWipe._on&&GBQ.on;};
  ui.querySelector('#gBqCats').addEventListener('click',function(e){const b=e.target.closest&&e.target.closest('button');if(!b)return;e.stopPropagation();if(!ok())return;
    uiPop(b);uiClic('onglet');hap(6);const c=b.getAttribute('data-c');if(c!==GBQ.cat||GBQ.ong!=='cat'){GBQ.cat=c;GBQ.ong='cat';GBQ.rk='';bqTourne(c);}});
  const essaie=function(sel){return function(e){const t=e.target.closest&&e.target.closest(sel);if(!t)return;e.stopPropagation();if(!ok())return;uiPop(t);GSON9=false;pan.classList.remove('menu');{const dd=t.getAttribute('data-dir');GBQ.figDir=dd!=null?+dd:null;}bqEssaie(t.getAttribute('data-k'));if(GSON9)hap(8);else uiClic('nav');/* (2026-10-14, session SON) essayer un objet = la bascule / le geste de l'atelier / la figure : le tick nav ne s'y ajoute plus */};};
  ui.querySelector('.bqRail').addEventListener('click',essaie('.bqK'));
  ui.querySelector('.bqRail').addEventListener('scroll',function(){PHQ.defile=performance.now();},{passive:true}); // (2026-10-16) pas de photo pendant qu'on fait défiler (voir LE STUDIO SANS À-COUPS)
  return ui;}
/* L'AIMANT COUPÉ PENDANT L'ENTRÉE (2026-10-15, session du rangement des figures : « en ouvrant un onglet, la grille s'ouvre défilée de 14 px ») :
   les cartes entrent en glissant de 12 px (bqK) et l'aimant de défilement (scroll-snap) les attrapait EN PLEIN GLISSÉ — la grille restait
   collée à leur position de départ, la 1re rangée rognée de 12 px en haut (MESURÉ : scrollTop 14 sur PEINTURES, AILES, TRAÎNÉES, debout comme
   couché). Le dessin de Léo ne bouge pas : l'aimant est coupé (.entre) le temps que la 1re rangée se pose, puis il revient. */
function bqAimant(rail){clearTimeout(GBQ.aimT);const K=rail.querySelectorAll('.bqK');let j=0;
  if(K.length){const y0=K[0].offsetTop;while(j+1<K.length&&K[j+1].offsetTop===y0)j++;}
  const d=K.length?(parseFloat(K[j].style.getPropertyValue('--i'))||j):0; /* bqK : délai .25 s + --i × 45 ms, puis .38 s de glissé */
  GBQ.aimT=setTimeout(function(){rail.classList.remove('entre');},250+d*45+380+80);}
function garBqPanneau(dt,t9){const ui=garBqUI(),pan=document.getElementById('gBqPan'),voulu=GBQ.on&&gModeM()==='shop'&&!GMODE.paye;
  if(voulu!==GBQ.panOn){GBQ.panOn=voulu;ui.classList.toggle('pan',voulu);pan.classList.remove('menu');garLibre._r=null;GBQ.lay='';GBQ.rk='';GBQ.uk='';GBQ.vu=-1;if(!voulu)GBQ.zone=null;}
  soldeEcrit(document.getElementById('gBqArg'),bank()); /* (2026-10-14) le SOLDE PRÉCIS */
  if((!voulu||SHOP.tab!=='voiture')&&GBQ.sec!=null)GBQ.sec=null; // (missions v2) hors du rayon des caisses, plus de secrète regardée
  if(!voulu)return;
  // LA BOUTIQUE : le rayon choisi dans la colonne de gauche (2026-10-15 : plus d'onglet OFFRES)
  const ong='cat',cat=BQ_CATS.some(function(c){return c[0]===GBQ.cat;})?GBQ.cat:'voiture',L=bqListe(cat),rail=pan.querySelector('.bqRail'),une=document.getElementById('gBqCats');
  const rk=ong+':'+cat+':'+L.map(function(k){return k+(bqA(k)?1:0);}).join(',')+':'+LANG;
  if(GBQ.rk!==rk){GBQ.rk=rk;GBQ.vu=-1;
    une.querySelectorAll('button').forEach(function(b){const c=b.getAttribute('data-c'),on=c===cat,C9=BQ_CATS.find(function(x){return x[0]===c;}),s=b.querySelector('span');b.classList.toggle('on',on);b.setAttribute('aria-selected',on);
      if(C9&&s){const t=sansAcc(TR(C9[1]));if(s.textContent!==t){s.textContent=t;b.setAttribute('aria-label',t);}}});
    rail.classList.remove('off','habs');rail.classList.add('entre');rail.scrollTop=0;rail.scrollLeft=0; /* (2026-10-15, Sacha : « un menu plus grand pour les figures, les ailes, les peintures ») tous les rayons en GRANDES cartes, trois par rangée comme les voitures — à quatre, « D'ORIGINE » se coupait en « D'ORIGIN / E » */
    rail.innerHTML=(cat==='figure'?bqFigRail().map(function(e,n,R){return (n&&R[n-1].c===e.c?'':bqFigSec(e.c))+bqCarteHtml(e.k,n,false,e.c);}):cat==='voiture'?bqVoitRail(L):L.map(function(k,n){return bqCarteHtml(k,n,false);})).join(''); /* (2026-10-18) les voitures : un intertitre par RARETÉ (bqVoitRail) */ /* (2026-10-15) les figures : un intertitre par direction, une carte par direction */bqPhotos(rail);bqAimant(rail);
    pan.classList.toggle('bqFigOn',cat==='figure');BQFS.k='';} /* (2026-10-16, Sacha) les trois figures équipées en haut du rayon FIGURES (voir bqFigSelMaj) */
  if(cat==='figure')try{bqFigSelMaj(pan,true);}catch(e){console.warn('bqFigSel',e);}
  if(cat==='figure')try{filmJoue();}catch(e){} /* (2026-10-18) les films des cartes (voir LE FILM D'UNE FIGURE) */
  /* (clarté 14/10) des cartes restaient blanches : la file du studio photo s'arrête hors garage / sous `quiet` et ne repart qu'à la photo suivante — on la relance, et on re-demande ce qui manque */
  if(PHQ.q.length&&!PHQ.on){PHQ.on=true;requestAnimationFrame(photoTour);}
  else if(!PHQ.q.length&&rail.querySelector('[data-ph]:empty,[data-pha]:not(.ok),[data-phf]:not(.ok)'))bqPhotos(rail);
  bqBoutonMaj();
  /* CE QU'ON REGARDE (2026-10-12, Léo : « le nom de la voiture et la rareté au-dessus de la voiture ; en dessous, les différents skins —
     coloris — de la voiture, pareil pour les ailes et les traînées ; pour l'instant ORIGINAL partout ») : #gBqNom suit la caisse (projeté au-
     dessus d'elle chaque image) ; #gBqSkins, sous elle, liste les COLORIS de l'objet (bqSkins) — une peinture n'en a pas : c'est un coloris. */
  const i=garageI,cur=bqCourant(),lim=false,te=document.getElementById('gBqTete'),nm=document.getElementById('gBqNom'),sk=document.getElementById('gBqSkins');
  const vu9=cur+(String(cur).indexOf('figure:')===0&&GBQ.figDir!=null?'@'+GBQ.figDir:'')+(cur==='v:'+chatPackI()&&carUnlockedVrai(chatPackI())?'*':''); // (2026-10-15) une figure à deux sens a deux cartes : la direction touchée fait partie de ce qu'on regarde (le cadre .sel suit la bonne)
  if(GBQ.vu!==vu9){GBQ.vu=vu9;let ri,nom;
    if(cur[0]==='v'){const iv=+cur.slice(2);if(m2Secrete(iv)){ri={c:'#ff3ec8',n1:'MISSION SECRÈTE'};nom='? ? ?';}else{ri=rarInfo(carRar(iv));nom=TR(CARS[iv].name);}}else{const o=bqCos(cur);ri=rarInfo(cosmRar(o.cat,o.d));nom=o.d?TR(o.d.n):'';}
    nm.style.setProperty('--rc',ri.c);nm.classList.toggle('lim',lim);
    nm.querySelector('.bqRar').textContent=sansAcc(TR(ri.n1));nm.querySelector('.bqNom').textContent=sansAcc(String(nom));
    {let mt=nm.querySelector('.bqM2');if(!mt){mt=document.createElement('span');mt.className='bqM2';nm.appendChild(mt);} /* (2026-10-16) SE DÉBLOQUE : la mission, sa jauge — une secrète : rien (son étiquette dit déjà MISSION SECRÈTE) */
      let h9='';if(cur[0]==='v'){const iv=+cur.slice(2),m9=m2DeCaisse(iv);if(m9&&!carUnlockedVrai(iv))h9=m9.f==='secret'?'':m2DebloqueHtml(m9,true);
        if(!h9)h9=shArcHtml(iv,carUnlockedVrai(iv));} /* (2026-10-20, Sacha) le CHAT POP-TART : « + TRAÎNÉE ARC-EN-CIEL INCLUSE » sous son nom (voir shArcHtml) */
      else{const o9=bqCos(cur),m9=o9&&o9.d&&m2DeHab(o9.cat,o9.d);if(m9&&!shopOwned(o9.cat,o9.d.id))h9=m2DebloqueHtml(m9,true);}
      mt.innerHTML=h9;mt.hidden=!h9;}
    {const L9=bqSkins(cur);sk.classList.toggle('vide',!L9.length);sk.querySelector('.bqSk').innerHTML=L9.map(function(x,n){return '<button class="bqS'+(n===0?' on':'')+'" data-s="'+x.id+'" style="--sc:'+x.c+'"><i></i><span>'+sansAcc(TR(x.n))+'</span></button>';}).join('');}
    rail.querySelectorAll('.bqK').forEach(function(el){el.classList.toggle('sel',el.getAttribute('data-k')===cur&&(!el.hasAttribute('data-dir')||GBQ.figDir==null||+el.getAttribute('data-dir')===GBQ.figDir));});
}
  {const t=nm.querySelector('.bqLim em'),r=bqHebdoReste();if(t&&lim&&t.textContent!==r)t.textContent=r;}
  // LA PLACE : la colonne des rayons à gauche ; la boutique en bas (debout) ou à droite jusqu'en haut (couché)
  const W=VP.w,H=VP.h,ac=document.getElementById('gAct'),tr=te.getBoundingClientRect(),arc=ac&&ac.getBoundingClientRect(),cou=W>H*1.2;
  const bas=arc&&arc.height?arc.top:H-80,lay=W+'x'+H+':'+Math.round(bas)+':'+(arc?Math.round(arc.left):0)+':'+ong+':'+Math.round(tr.bottom);
  if(GBQ.lay!==lay){GBQ.lay=lay;
    const UW=Math.round(Math.min(124,W*.31)),top=tr.bottom+(cou?6:14);une.style.left=(cou?36:12)+'px';une.style.width=UW+'px';une.style.top=top+'px';let fond;
    if(!cou){const ph=Math.round(Math.min(330,H*.4));pan.style.left='14px';pan.style.right='14px';pan.style.top=(bas-10-ph)+'px';pan.style.bottom=(H-bas+10)+'px';pan.classList.remove('cote');pan.classList.add('grille');fond=bas-10-ph-10;}
    else{const x0=Math.max(W*.5,(arc&&arc.width?arc.left:W*.55)-6);pan.style.left=x0+'px';pan.style.right='12px';pan.style.top=Math.round(tr.top)+'px';pan.style.bottom=(H-bas+10)+'px';pan.classList.add('cote','grille');fond=H-12-(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sB'))||0);} /* (2026-10-17, session UI-REVUE) couché, la colonne des rayons s'arrête au-dessus de la barre d'accueil (FIGURES y entrait de 6 px) */
    bqRayons(une,fond-top);garLibre._r=null;}
  {const pr=pan.getBoundingClientRect(),ru=une.getBoundingClientRect(),SH=0,sb=cou?H-14:pr.top-10;
   sk.style.left=(ru.right+6)+'px';sk.style.right=(W-(cou?pr.left-8:W-12))+'px';sk.style.top=(sb-40)+'px';
   GBQ.zone=cou?{cote:true,x0:pr.left,g:ru.right+8,y0:tr.bottom+44,y1:sb-SH}:{g:ru.right+6,d:W-12,y0:tr.bottom+44,y1:sb-SH};}
  // le nom flotte AU-DESSUS de la caisse (son toit, projeté), sans sortir de sa place
  {const v=GBQ._vn||(GBQ._vn=new THREE.Vector3()),G=garGabarit();carGroup.getWorldPosition(v);v.y+=G.H*1.1+.5;v.project(camera);
   const z=GBQ.zone,m9=nm.querySelector('.bqM2'),mw9=m9?Math.max(150,Math.round((z.cote?z.x0-8:(z.d||W-12))-(z.g||0)))+'px':'';if(m9&&m9.style.width!==mw9)m9.style.width=mw9; /* (2026-10-17, Sacha) SE DÉBLOQUE prend TOUTE la place libre à côté des rayons (couché : jusqu'à la grille, qu'il ne passe plus — le compteur passait dessous ; debout : il tenait sur 180 px, quatre lignes) */
   const w2=nm.offsetWidth/2,x=Math.max((z.g||0)+w2,Math.min((z.cote?z.x0-8:z.d)-w2,(v.x*.5+.5)*W)),y=Math.max(tr.bottom+8,(.5-v.y*.5)*H-nm.offsetHeight-8);
   nm.style.left=Math.round(x)+'px';nm.style.top=Math.round(y)+'px';}
}
function bqSkins(k){if(!k)return [];if(k[0]==='v'&&m2Secrete(+k.slice(2)))return [];if(k[0]!=='v'){const c=k.slice(0,k.indexOf(':'));if(c==='peinture')return [];} // une peinture EST un coloris
  return [{id:'original',n:'ORIGINAL',c:'linear-gradient(135deg,#fff,#d9dde3)'}];} // (2026-10-12) aucun skin n'est encore dessiné : chaque voiture, aile, traînée a son ORIGINAL
function bqTourne(cat){if(GAR_TAB_ANG[cat]==null||!garageOn||GAR.go)return;garTourneVers(GAR_TAB_ANG[cat]);GBQ.lan=null;GBQ.yawV=0;GBQ.yawGo=1;} // (2026-10-24, Léo : « quand on sélectionne, ça ne tourne pas vers l'autre ») rayon ou objet touché : le plateau ET le lacet laissé par le doigt reviennent face à ce qu'on habille
function bqEssaie(k){if(String(k).indexOf('figure:')===0){GBQ.figK=k;garFigEssai(k.slice(7),bqFigDir(k.slice(7)));try{gShopJour();}catch(e){}GBQ.ck='';return;}GBQ.figK=null; // (2026-10-14) une FIGURE : la caisse la fait sur le plateau
  // toucher = ESSAYER (2026-10-12, Léo : « à droite un bouton ÉQUIPER / DÉSÉQUIPER / ACHETER qui change en fonction ») : c'est le bouton qui équipe (bqAction)
  if(k[0]==='v'&&m2Secrete(+k.slice(2))){GBQ.sec=+k.slice(2);if(SHOP.tab!=='voiture')shopTab('voiture');GBQ.vu=-1;GBQ.ck='';return;}GBQ.sec=null; /* (2026-10-16) une SECRÈTE n'est jamais construite : le plateau se vide (garageRender la tait) */
  if(k[0]==='v'){const i=+k.slice(2);if(SHOP.tab!=='voiture')shopTab('voiture');if(i!==garageI){garageSaute(i);try{bqGeste('voiture');}catch(e){}}}
  else{const o=bqCos(k),j=COSM[o.cat].indexOf(o.d);if(SHOP.tab!==o.cat)shopTab(o.cat);bqTourne(o.cat);if(j>=0){SHOP.i[o.cat]=j; /* (2026-10-14, UX 8) la clé COURANTE se pose AU TOUCHER : le geste du bras ne pose la pièce qu'à 0,71 s, et ACHETER/ÉQUIPER agissait sur l'objet d'AVANT */ bqOutil(o.cat,'essai',o.d,function(){shopShow(o.cat,j);try{gShopJour();}catch(e){}});}} // (2026-10-13) LES BRAS D'ATELIER posent la pièce (voir bqOutil)
  try{gShopJour();}catch(e){}GBQ.ck='';}
/* LE BOUTON QUI CHANGE (#gBqBtn, à droite de RETOUR) : ACHETER (+ le prix) · ÉQUIPER · DÉSÉQUIPER (un habillage équipé, sauf celui d'origine) ·
   ÉQUIPÉE (la caisse que tu as) · À GAGNER (défi : il le dit) — il remplace ACHETER de la console en boutique */
/* (2026-10-14, ticket boutique P1) LE BOUTON DIT L'ÉTAT AVANT LE TOUCHER : caisse / habillage / figure à pièces trop chère : « IL TE MANQUE $ 49,6 k »
   + mini-jauge (la banque / le prix), inactif — plus de toast sombre APRÈS le toucher. */
function bqManque(k){
  let prix=0;
  if(k[0]==='v'){const i=+k.slice(2),u=CAR_UNLOCK[i]||{};if(!(carUnlockedVrai(i)||(SAVE.d.equipped|0)===i)&&u.k!=='premium'&&u.p)prix=u.p;}
  else{const o=bqCos(k),d=o&&o.d;if(d&&d.p){if(o.cat==='figure'){if(!figPossede(d.id))prix=d.p;}else if(!shopOwned(o.cat,d.id))prix=d.p;}}
  if(prix&&bank()<prix)return {e:'manque',t:'IL TE MANQUE',p:bqPxT(prix-bank()),j:Math.max(0,Math.min(1,bank()/prix))};
  return null;}
/* LES RAYONS TIENNENT DANS LEUR PLACE (2026-10-15) : une ligne par rayon, de 44 à 52 px (la cible du pouce), l'écart se resserre d'abord ;
   s'il n'y a pas la place de six lignes de 44 px (petit téléphone, couché bas), deux colonnes de carrés, pictogramme seul (le nom reste dans aria-label) */
function bqRayons(el,dispo){const n=el.children.length||1;let g=6,h=Math.floor((dispo-g*(n-1))/n);if(h<46){g=4;h=Math.floor((dispo-g*(n-1))/n);}
  const duo=h<44;if(duo){g=8;const r=Math.ceil(n/2);h=Math.floor((dispo-g*(r-1))/r);}
  h=Math.max(44,Math.min(duo?56:52,h));el.classList.toggle('duo',duo);el.style.setProperty('--cH',h+'px');el.style.setProperty('--cG',g+'px');}
function bqEtat(){const k=bqCourant();if(!k)return null;
  {const m9=bqManque(k);if(m9)return m9;} // (2026-10-14, boutique P1) pas assez d'argent : voir bqManque
  if(k[0]==='v'){const i=+k.slice(2),u=CAR_UNLOCK[i]||{},eq=(SAVE.d.equipped|0)===i,a=carUnlockedVrai(i)||eq;
    if(eq)return {e:'eq',t:'ÉQUIPÉE'};if(a)return {e:'equip',t:'ÉQUIPER'};
    if(u.k==='mis'){const m9=m2Def(u.id);return m9&&m9.f==='secret'?{e:'sec',t:'MISSION SECRÈTE'}:{e:'mis',t:'VOIR LA MISSION',m:u.id};} // (2026-10-16) LES MISSIONS v2
    if(u.k==='premium')return {e:'achat',t:'ACHETER',p:eurTxt(u.eur)};if(u.p)return {e:'achat',t:'ACHETER',p:bqPxT(u.p)};return {e:'defi',t:'À GAGNER'};}
  const o=bqCos(k),d=o.d;if(!d)return null;
  if(o.cat==='figure'){if(!figPossede(d.id))return {e:'achat',t:'ACHETER',p:bqPxT(d.p)}; // (2026-10-14) une figure : on l'a, ou on l'achète
    if(!FIGV2.on)return {e:'eq',t:'ACQUISE'};
    return figSlots()[bqFigDir(d.id)]===d.id?{e:'eq',t:'ÉQUIPÉE'}:{e:'figeq',t:'ÉQUIPER'};} // (2026-10-15, les directions) dans la direction de SA carte : on en change en ÉQUIPANT une autre de cette direction, on ne la retire plus
  const a=shopOwned(o.cat,d.id),eq=shopEqD(o.cat)===d,j=COSM[o.cat].indexOf(d);
  if(a&&eq)return j>0?{e:'desequip',t:'DÉSÉQUIPER'}:{e:'eq',t:'ÉQUIPÉ'};if(a)return {e:'equip',t:'ÉQUIPER'};
  if(d.mis2)return {e:'mis',t:'VOIR LA MISSION',m:d.mis2}; // (2026-10-16) LES MISSIONS v2
  if(d.pack==='chat'){const u9=CAR_UNLOCK[chatPackI()]||{};return {e:'chat',t:'AVEC LE CHAT',p:u9.eur?eurTxt(u9.eur):''};} // (2026-10-18 soir) l'ARC-EN-CIEL : il mène à l'offre du chat (voir chatPackI)
  if(d.eur)return {e:'achat',t:'ACHETER',p:eurTxt(d.eur)};if(d.p)return {e:'achat',t:'ACHETER',p:bqPxT(d.p)};return {e:'defi',t:'À GAGNER'};}
function bqAction(){const s=bqEtat(),k=bqCourant(),bt=document.getElementById('gBqBtn');if(!s||!k)return;
  if(s.e==='manque'){if(bt)gSecoue(bt);uiClic('refus');return;} // (2026-10-14, charte 6) l'état se lit AVANT le toucher : ni toast, ni achat
  if(s.e==='achat'&&k.indexOf('figure:')===0){figAchete(k.slice(7),bt);return;} // (2026-10-14) acheter une FIGURE
  if(s.e==='figeq'||s.e==='figdes'){const id9=k.slice(7),c9=bqFigDir(id9);figEqToast(id9,c9);GBQ.rk='';try{gShopJour();}catch(e){}try{garFigEssai(id9,c9);}catch(e){}hap(8);return;} // (LES FIGURES v2) un emplacement
  if(s.e==='achat'){const b=$('gBuy');if(b)b.click();return;}
  if(s.e==='equip'){if(k[0]==='v'){const i=+k.slice(2);if(garEquipeCaisse(i))garageShow(i);}else{const o=bqCos(k),j=COSM[o.cat].indexOf(o.d);if(garEquipeHabit(o.cat,j)){shopShow(o.cat,j);try{bqOutil(o.cat,'serre',o.d,null);}catch(e){}}}try{hap(8);}catch(e){}return;}
  if(s.e==='desequip'){const o=bqCos(k),j=COSM[o.cat].indexOf(o.d);bqOutil(o.cat,'retire',o.d,function(){if(shopEquip(o.cat,0)){SHOP.prev=null;try{buildCar(CARS[equippedCar()]);}catch(e){}shopShow(o.cat,j);try{if(SONV2)sfx('ui.off');}catch(e){}}try{gShopJour();}catch(e){}});try{hap(6);}catch(e){}return;}
  if(s.e==='mis'){m2VaMission(s.m);return;} // (2026-10-16) VOIR LA MISSION : l'écran MISSIONS, la mission suivie
  if(s.e==='chat'){const ci=chatPackI();if(ci<0)return;GBQ.cat='achat';GBQ.ong='cat';GBQ.rk='';bqEssaie('v:'+ci);uiClic('nav');return;} // (2026-10-18 soir) AVEC LE CHAT : l'offre du chat, rayon ACHAT
  if(s.e==='sec'){if(bt)gSecoue(bt);uiClic('refus');return;}
  if(s.e==='defi'){if(bt)gSecoue(bt);uiClic('refus');if(k[0]==='v')toast(pxi('verrou')+' '+String(carUnlockText(+k.slice(2))).replace(/</g,'&lt;'));return;}
  try{uiClic('nav');}catch(e){}}
/* LES FIGURES AU SHOP ET À L'INVENTAIRE (2026-10-14) — possédées : SAVE.d.figs ; achetées en pièces (la banque) ; toucher = la caisse la fait */
function figAchat(i){const d=COSM.figure[i];if(!d||!d.p)return {ok:false,raison:'pas-a-vendre'};if(figPossede(d.id))return {ok:false,raison:'deja-possedee'};
  if(bank()<d.p)return {ok:false,raison:'fonds-insuffisants',manque:d.p-bank()};
  SAVE.d.bank=bank()-d.p;if(!Array.isArray(SAVE.d.figs))SAVE.d.figs=['tailwhip'];SAVE.d.figs.push(d.id);SAVE.flush();return {ok:true,paye:d.p};}
function figPossede(id){if(cousin())return !!(window.FIG&&FIG.par[id]); // (2026-10-14) LE CODE COUSIN : toutes les figures
const L=SAVE.d.figs;return id==='tailwhip'||(Array.isArray(L)&&L.indexOf(id)>=0);} // (2026-10-15) le TAIL WHIP offert d'office ; le tonneau des anciennes sauvegardes reste dans leur liste
function figAchete(id,bt){const f=window.FIG&&FIG.par[id];if(!f||figPossede(id))return false;
  if(bank()<f.p){if(bt)gSecoue(bt);uiClic('refus');toast(pxi('piece')+' '+sansAcc(TR('IL MANQUE'))+' '+fmtC(f.p-bank()));return false;}
  SAVE.d.bank=bank()-f.p;if(!Array.isArray(SAVE.d.figs))SAVE.d.figs=['tailwhip'];SAVE.d.figs.push(id);SAVE.flush();
  const c9=bqFigDir(id);if(FIGV2.on)try{figEquipe(id,c9);}catch(e){} // (LES FIGURES v2) achetée = ÉQUIPÉE — (2026-10-15) dans la direction de la carte touchée, à la place de celle qui y était
  try{if(SONV2){sfx('ui.achat');if(!REDUCED_MOTION)sfx('ui.tampon',{t:.266});}}catch(e){}try{gTampon(sansAcc(TR('À TOI !')));}catch(e){}hap([10,40,10]);GBQ.rk='';garFigEssai(id,c9);return true;} /* (2026-10-14, session SON) le même « À TOI ! » que l'achat d'une peinture ou d'une caisse : le même tampon qui s'abat (il manquait à la figure) */
const GFIG={lect:null,t:0,D:0,corps:null,pl:null,pulse:0,kick:0,vu:0}; // pl : le plan du saut en cours (garage-saut.js) · pulse : l'anneau du plateau qui s'allume à la pose · kick : le choc de la pose (0 → 1,3)
/* (2026-10-14, LES FIGURES v2) un emplacement pris ou rendu, et ce qu'on en dit */
function figEqToast(id,c){const f=window.FIG&&FIG.par[id];if(!f)return;const r=figEquipe(id,c);if(!r)return;const F=FIG_FAM[r.slot],fam=pxi(F[2])+' '+sansAcc(TR(F[0])); // (2026-10-15, les directions) équiper dans la direction c (sans c : la 1re libre, voir figEquipe) ; le toast dit la DIRECTION (le geste)
  if(!r.deja){try{if(SONV2)sfx('ui.equipe');}catch(e){}
    toast(pxi('rotation')+' '+sansAcc(TR(f.n))+' · '+fam+(r.parti&&r.parti!==id&&FIG.par[r.parti]?' · '+sansAcc(TR('REMPLACE'))+' '+sansAcc(TR(FIG.par[r.parti].n)):''));}
  else{uiClic('nav');toast(pxi('rotation')+' '+sansAcc(TR(f.n))+' · '+sansAcc(TR('ÉQUIPÉE'))+' · '+fam);}} // déjà là : une par direction, toujours — on en change en équipant une autre de cette direction
function figEquipee(id){return figSlots().indexOf(id);} // son 1er emplacement (0 avant · 1 arrière · 2 côté), −1 sinon
function garFigEssai(id,c,libre){let f=window.FIG&&FIG.par[id];if(!f)return;if(c!=null&&c<2&&FIG.oriente)f=FIG.oriente(f,FIG_DIR[c]);
  GFGOM.p=null;GFIG.plat=!!(f.m&&f.m.length&&f.m.every(function(m){return m.a&&Math.abs(+m.a[1]||0)>.9;})); /* (2026-10-22, Sacha : « le tail whip à l'inventaire, la caisse décolle ; il faut que ça reste sur le sol, avec une trace de pneus comme les donuts ») une figure À PLAT (tail whip, toupie) reste POSÉE : pas de saut, et les pneus marquent le plateau */
  if(!libre&&!BRAS_FIG&&(brasVoulu()||brasBqVoulu())&&!figPosee()){if(GFIG.corps)GFIG.corps.vide();if(GFIG.lect)GFIG.lect.vide();GFIG.D=0;BRB.libre={id:id,c:c,t:.5};return;} // (19/10 soir) pas encore posée (pinces, bras d'argent qui rentrent) : elle la fera dès qu'elle l'est (brasTick)
  if(!libre&&BRAS_FIG&&(brasVoulu()||brasBqVoulu())){if(brasBqVoulu())BRB.bqVeut=true;if(GFIG.corps)GFIG.corps.vide();if(GFIG.lect)GFIG.lect.vide();GFIG.D=0;const r9=brasFigure(f);if(r9===true)return;if(r9==='libre'){BRB.libre={id:id,c:c,t:.5};return;}} // (2026-10-19) à l'inventaire, LE BRAS DES FIGURES la fait (sans plan sûr : il se range d'abord, puis elle la fait seule) // (2026-10-15) la caisse la fait dans le sens de la carte (le rodéo avant ≠ le rodéo arrière)
  if(FIGV2.on&&FIG.Corps){figSautRaz();GFIG.pl=null;try{GFIG.pl=FIG_SAUT.on?figPlan(f,GFIG.plat):null;}catch(e){GFIG.pl=null;console.warn('figPlan',e);} /* (2026-10-23) LE VRAI SAUT : un plan joué à l'horloge du jeu (voir garage-saut.js) — sans lui (erreur), l'ancien Corps vivant ci-dessous */
    if(GFIG.pl){if(GFIG.corps)GFIG.corps.vide();GFIG.t=0;GFIG.D=GFIG.pl.D;GFIG.vu=performance.now();try{if(SONV2){sfx('turbo.mini',{vol:-6,t:GFIG.pl.tA});GSON9=true;}}catch(e){}return;}
    if(!GFIG.corps)GFIG.corps=new FIG.Corps();const C=GFIG.corps;C.vide();C.lance(f,1,f.D*1.2);C.evts.length=0;GFIG.t=0;GFIG.D=f.D*1.2*(FIG.PHY.elan?1:1/.85)+.6; /* (2026-10-15 soir) le coup net : la figure en f.D × 1,2, puis le planté */
    try{if(SONV2){sfx('turbo.mini',{vol:-6});GSON9=true;}}catch(e){}return;} // (LES FIGURES v2) la caisse fait la figure en vraie physique : explosion, élan, planté
  if(!GFIG.lect)GFIG.lect=new FIG.Lecteur();GFIG.lect.vide();GFIG.lect.lance(f,1,f.D*1.25);GFIG.t=0;GFIG.D=f.D*1.25;
  try{if(SONV2){sfx('fig.vrille',{st:2});GSON9=true;}}catch(e){}}
function garFigTick(dt){garFigPas(dt);try{figOmbre();}catch(e){if(!garFigTick._w){garFigTick._w=1;console.warn('figOmbre',e);}}} // (2026-10-23) chaque image du garage : la figure, puis l'ombre de la caisse là où elle est (voir garage-ombre.js)
function garFigPas(dt){
  {const e9=Math.exp(-Math.min(dt,.05)*8);GFIG.pulse*=e9;GFIG.kick*=e9;if(GFIG.pulse<.003)GFIG.pulse=0;if(GFIG.kick<.003)GFIG.kick=0;} // (2026-10-23) l'éclat de la pose retombe
  if(brasTick(dt))return; // (2026-10-19) LE BRAS DES FIGURES tient la caisse
  if(GFIG.pl&&GFIG.D>0&&figSaut(dt))return; // (2026-10-23) LE VRAI SAUT (garage-saut.js)
  if(GFIG.corps&&GFIG.D>0){const C=GFIG.corps,d9=GFIG.gel!=null?Math.max(0,Math.min(dt,.05,GFIG.gel-GFIG.t)):Math.min(dt,.05);GFIG.t+=d9;C.budget=Math.max(0,GFIG.D-GFIG.t);C.tick(d9);C.evts.length=0; // (LES FIGURES v2) — (banc) GFIG.gel : l'horloge s'arrête à cet instant (voir dbgFigGel)
    const x=Math.min(1,GFIG.t/GFIG.D),hc=(CARS[equippedCar()].h||1.3)*.5,q=C.q;if(!GFIG.plat)carGroup.position.y+=1.5*Math.sin(Math.PI*x);
    VEQ.pv.set(0,hc,0).applyQuaternion(carGroup.quaternion);VEQ.qr.set(q[0],q[1],q[2],q[3]);carGroup.quaternion.multiply(VEQ.qr);
    VEQ.pv2.set(0,hc,0).applyQuaternion(carGroup.quaternion);carGroup.position.add(VEQ.pv).sub(VEQ.pv2);
    if(GFIG.plat)try{garFigGomme(d9,true);}catch(e){}
    if(x>=1&&!C.occupe()&&C.ecart()<.01){C.vide();GFIG.D=0;}return;}
  const L9=GFIG.lect;if(!L9||!L9.occupe())return;L9.tick(Math.min(dt,.05));GFIG.t+=Math.min(dt,.05);
  const x=Math.min(1,GFIG.t/GFIG.D),hc=(CARS[equippedCar()].h||1.3)*.5,lev=GFIG.plat?0:1.5*Math.sin(Math.PI*x); // elle saute du plateau, tourne, se repose
  carGroup.position.y+=lev;VEQ.pv.set(0,hc,0).applyQuaternion(carGroup.quaternion);
  VEQ.qr.set(L9.q[0],L9.q[1],L9.q[2],L9.q[3]);carGroup.quaternion.multiply(VEQ.qr);
  VEQ.pv2.set(0,hc,0).applyQuaternion(carGroup.quaternion);carGroup.position.add(VEQ.pv).sub(VEQ.pv2);
  if(GFIG.plat)try{garFigGomme(Math.min(dt,.05),true);}catch(e){}}
/* (banc, 2026-10-23) LES CROCHETS DE LA FIGURE DU GARAGE : `dbgFigEssai(id,c)` la lance (c : 0 avant · 1 arrière · 2 côté) et rend sa durée ; `dbgFigEtat()`
   dit où elle en est (horloge du jeu, pas celle du mur) ; `dbgFigGel(t)` arrête son horloge à t s (null = elle repart) pour photographier un instant exact. */
window.dbgFigEssai=function(id,c){garFigEssai(id,c==null?-1:c);return {D:+GFIG.D.toFixed(3),plat:!!GFIG.plat,plan:window.dbgFigPlan?window.dbgFigPlan():null};};
window.dbgFigEtat=function(){const o=GBQ.omb;return {t:+GFIG.t.toFixed(3),D:+GFIG.D.toFixed(3),plat:!!GFIG.plat,gel:GFIG.gel==null?null:GFIG.gel,omb:o?{vis:!!(o.visible&&GBQ.grp&&GBQ.grp.visible),y:+o.position.y.toFixed(3),x:+o.position.x.toFixed(3),z:+o.position.z.toFixed(3),s:[+o.scale.x.toFixed(2),+o.scale.y.toFixed(2)],o:+o.material.opacity.toFixed(2)}:null};};
window.dbgFigGel=function(t){GFIG.gel=t==null?null:+t;return GFIG.gel;};
function bqBoutonMaj(){const bt=document.getElementById('gBqBtn');if(!bt)return;const s=bqEtat(),cle=s?s.e+'|'+s.t+'|'+(s.p||'')+'|'+(s.j!=null?Math.round(s.j*100):'')+'|'+LANG:'';if(bt._k===cle)return;bt._k=cle;
  bt.dataset.e=s?s.e:'';bt.innerHTML=s?('<span>'+sansAcc(TR(s.t))+'</span>'+(s.p?'<b'+(bqPxLg(s.p)?' class="lg"':'')+'>'+String(s.p).replace(/</g,'')+'</b>':'')+(s.e==='eq'?pxi('coche'):(s.e==='mis'||s.e==='chat')?pxi('droite'):s.e==='sec'?pxi('oeil'):'')+(s.e==='manque'?'<i class="bqJ" style="--v:'+s.j.toFixed(2)+'"></i>':'')):'';}
try{Object.assign(I18N,{"VERS L'ARRIÈRE":'BACKWARD','POUCE EN ARRIÈRE':'THUMB BACK',"VERS L'AVANT":'FORWARD','SUR LES CÔTÉS':'SIDEWAYS','POUCE EN AVANT':'THUMB FORWARD','POUCE À GAUCHE OU À DROITE':'THUMB LEFT OR RIGHT'});}catch(e){} // (2026-10-15) les deux familles de figures
try{Object.assign(I18N,{'ÉQUIPER':'EQUIP','DÉSÉQUIPER':'UNEQUIP','ÉQUIPÉE':'EQUIPPED','ÉQUIPÉ':'EQUIPPED','ACHETER':'BUY','À GAGNER':'TO EARN'});}catch(e){}
try{Object.assign(I18N,{'CHOISIS UNE OFFRE':'PICK AN OFFER'});}catch(e){} // (2026-10-14, charte 6, boutique P1)
function garBqChoc(){if(!GBQ.choc)garBqBatit();GBQ.chocT=0;}
/* (2026-10-20 soir, Léo : « ces trucs marchent dans la boutique aussi ») LE TAP EN BOUTIQUE : la vitrine capte le doigt à part (voir
   garage-rendu.js), un toucher bref SUR la caisse ne faisait rien. Désormais il fait ce que le garage fait : un petit bond (`GBQ.tapT`, lu
   par le rendu de la vitrine), le coup de jointure (`garage.tole`), un tic dans le pouce, et L'ACTION SPÉCIALE de la caisse (`caisseAction` :
   phares de LA CERISE / du TOFU, crocs de LA SQUALE) — la caisse montrée est celle qu'`buildCar` vient de construire, son action est posée. */
function bqTape(){GBQ.tapT=0;try{if(SONV2)sfx('garage.tole');else{chimeNote(340,0,.05,.10);noiseBurst(.14,.05,1400);}}catch(e){}try{hap([6,12]);}catch(e){}try{caisseAction();}catch(e){}}
/* LA BOUTIQUE SE PRÉPARE AU MENU (2026-10-16, Léo : « la boutique rame de ouf ») — MESURÉ au banc : à la 1re ouverture, l'image figeait 1,2 s
   (la salle blanche, le trône, les bras d'atelier, les gerbes bâtis au toucher, puis 10 programmes compilés à sa 1re image, 4 autres ensuite).
   Comme l'atelier (atelierChauffe), elle est désormais bâtie CACHÉE au menu et compilée sous le même éclairage (les lumières ne changent que
   d'intensité en boutique : bqBio), puis dessinée une fois hors écran — chauffeRendu ne garde que ses sous-arbres. */
function bqChauffe(k){if(GBQ.chaud||garageOn)return; // k : 0 la salle bâtie · 1 les bras, l'outil, la lueur · 2 tout compilé et dessiné une fois (dans le garage, rien : l'ouverture bâtit ce qui manque, sous le voile)
  if(k===0){garBqBatit();return;}if(k===1){garBqLueurBatit();garBqOutilBatit();return;}
  GBQ.chaud=true;garBqBatit();garBqLueurBatit();garBqOutilBatit();
  const q=[GBQ.grp,GBQ.halo,GBQ.nappe,GBQ.bras,BQG.m,BQG.lame,BQT.g].filter(function(o){return o&&o.parent===scene;});
  if(q.length)chauffeRendu(q);}
/* LA POSE TENUE (2026-10-15, Léo : « boutique : toucher la voiture fait bouger la voiture comme actuellement, mais laisse la voiture dans sa
   position souhaitée ; et lorsqu'on rappuie sur la voiture, elle se replace et la plateforme se remet à faire tourner la voiture »).
   Le doigt la tourne et la penche comme avant (même prise, même élan) ; dès qu'il a GLISSÉ de plus de 8 px, elle est POSÉE À LA MAIN
   (GBQ.pose) : le plateau s'arrête net et, lâchée, elle garde sa pose — plus de ressort de tangage ni de roulis, son élan de lacet s'éteint
   comme avant. Un TOUCHER BREF SUR elle (moins de 8 px, moins de 0,3 s, le rayon touche la carrosserie : bqPrise → sur) la rend à sa pose de
   vitrine : tangage et roulis reviennent en ressort, le plateau repart en 0,9 s (GBQ.platK, adouci). À côté d'elle, ou quand elle tourne
   déjà : rien. Une autre caisse (sous le rideau de l'échange : à plat d'un coup), un autre onglet ou une autre catégorie (en douceur), la
   sortie de la boutique : retour au plateau. Seule la boutique passe par ici : le garage et l'inventaire gardent leur doigt. */
function bqPoseTient(){GBQ.pose=true;GBQ.platK=0;GBQ.poseI=garageI;GBQ.poseO=GBQ.ong||'cat';GBQ.poseC=GBQ.cat||'voiture';}
function bqPoseLache(m){GBQ.pose=false;if(m==='caisse'||m==='sort')GBQ.platK=1;if(m==='caisse'){GBQ.pit=GBQ.pitV=GBQ.rol=GBQ.rolV=GBQ.yawV=0;GBQ.lan=null;}}
/* LE LANCER DOSÉ (2026-10-15, Léo : la voiture lancée au doigt doit tourner un peu plus — « satisfaisant », mais « c'est pas non plus
   l'espace »). Avant, l'élan s'éteignait en exp(−2,4 t) : la moitié de la vitesse perdue en 0,29 s — elle freinait sec puis traînait — et
   sans plafond (un lancer de 4 000 px/s faisait 2,8 tours). Au lâcher (bqLance), la vitesse du doigt v (rad/s, la même qu'avant) devient un
   ÉLAN PLANIFIÉ : une distance D = 2 tours × tanh(0,8 v / 2 tours) — ~0,5 tour pour un petit lancer, ~1,5 pour un moyen, jamais 2 —, une
   durée qui grandit avec elle (1,45 s → 2,05 s ; avant le 15/10 au soir : 0,65 et 1,3 s, Léo en voulait « un tout petit peu moins de
   friction »), et la courbe v (1 − t/T)^(q−1) : elle part EXACTEMENT à la vitesse du doigt (aucun à-coup au
   lâcher), ralentit comme par frottement et s'arrête en douceur (q ≥ 2,5 : la décélération s'éteint avec elle). Pas de rebond. Un doigt
   posé pendant qu'elle tourne l'ATTRAPE net (GBQ.lan à null), et ce toucher-là ne la remet pas en vitrine. Doigt arrêté avant le lâcher
   (90 ms) : pas d'élan, comme avant. */
const BQ_GLISSE=.8; // (2026-10-15, Léo : « un tout petit peu moins de friction que là ») 0,65 → 0,8 : le même lancer va ~20 % plus loin (+23 % petit, +14 % moyen), ~0,2 s de plus
function bqLance(v){GBQ.lan=null;const a=Math.abs(v);if(a<.05){GBQ.yawV=0;return;}
  const DM=4*Math.PI,D=DM*Math.tanh(BQ_GLISSE*a/DM),T0=1.45+.6*D/DM,q=Math.max(2.5,T0*a/D);GBQ.lan={y0:GBQ.yaw,D:Math.sign(v)*D,T:q*D/a,q:q,t:0};}
function bqLanceTick(dt){const L=GBQ.lan;L.t+=dt;const u=Math.min(1,L.t/L.T),r=Math.pow(1-u,L.q-1);
  GBQ.yaw=L.y0+L.D*(1-r*(1-u));GBQ.yawV=L.D*L.q*r/L.T;if(u>=1){GBQ.lan=null;GBQ.yawV=0;}}
/* chaque image du garage, juste après la pose de la caisse sur le plateau */
function garBqIndus(dt,ay,t9){
  dt=Math.min(.05,dt);const veut=bqIndusVoulu();
  /* (v3, Léo : « au lieu d'un glitch, la voiture se décolle de la plateforme de manière cool et lévite ; une grosse lueur blanche derrière
     elle ; il ne reste que son ombre ; après, la page de vente ») LE TEMPS DU GESTE : 0 → 0,12 s elle s'enfonce, puis se DÉCOLLE (ressort doux) ;
     0,3 s la LUEUR naît derrière elle et grandit ; 0,8 s l'ÉCLAT blanc monte (pic à ~0,95 s) : dessous, l'atelier laisse place au blanc ;
     puis la page de vente. Au retour : un éclat bref, l'atelier revient dessous, elle se repose. */
  /* (2026-10-14, Léo : « la transition entre les deux, c'est peut-être un peu lourd ; reviens sur le truc glitch ») LE GLITCH revient : le
     geste lance garGlitch (0,72 s de bandes et de tressauts), le décor BASCULE dessous à son pic (0,16 s) ; la caisse décolle aussitôt
     (plus de petit coup, ni de lueur blanche, ni d'éclat). Au retour, pareil, à l'envers. */
  try{bqSon(dt,veut&&!GAR.go);}catch(e){} // (2026-10-14) la boutique a sa voix (voir LE SON DE LA BOUTIQUE)
  /* (2026-10-15, Sacha : « la transition entre le garage et la boutique est pas smooth ») vu au banc : au toucher, l'interface du garage
     disparaissait d'un coup et les touches BLANCHES de la boutique se posaient sur l'atelier noir ; 0,16 s plus tard le décor passait au blanc
     d'une image à l'autre (bioApply ne fond pas) et la page de vente sautait en place. Désormais LE VOILE (bqVoile) monte en 0,16 s — blanc
     vers la boutique, nuit vers l'atelier —, les DEUX bascules (l'interface : bqClasses, le décor : garBqAmbiance) tombent ENSEMBLE sous lui,
     puis il se lève en --t-slow sur l'écran déjà en place. Le glitch de Léo reste par-dessus. */
  if(veut!==GBQ.veut){const avant=GBQ.on;GBQ.veut=veut;GBQ.t=0;GBQ.bascule=false;GBQ.eclat=0;GBQ.coupT=-1;const dedans=!GAR.go&&garageOn&&!!gEl&&!['menu','missions','quiet','launching'].some(function(c){return gEl.classList.contains(c);});
    GBQ.v0=performance.now();if(dedans&&(veut||avant))bqVoile(veut);else{bqClasses(veut);GBQ.v0=0;} /* on sort du garage (HOME, missions, départ) : la bascule d'avant, d'un coup, sous le volet de l'écran */
    if(veut){garBqBatit();garBqLueurBatit();GBQ.boum=1;GBQ.levV=2.6;}} /* (2026-10-16, Léo : « j'aime pas trop la transition glitch ») plus de garGlitch : LE SOUFFLE DE LUMIÈRE (bqVoile) fait seul la bascule */
  GBQ.t+=dt;
  if(GBQ.pose){if(!veut||GAR.go)bqPoseLache('sort');else if(garageI!==GBQ.poseI)bqPoseLache('caisse');else if((GBQ.ong||'cat')!==GBQ.poseO||(GBQ.cat||'voiture')!==GBQ.poseC)bqPoseLache();} // (2026-10-15) LA POSE TENUE : une autre caisse, un autre onglet, la sortie → le plateau
  GBQ.platK=(GBQ.pose||BRB.p>0||BRB.bqK>0)?0:Math.min(1,GBQ.platK+dt/.9); // (2026-10-19) le bras des figures est là : la vitrine ne tourne plus d'elle-même
  if(veut&&GBQ.coupT>=0){GBQ.coupT+=dt;if(GBQ.coupT>=.12&&!GBQ.boum){GBQ.boum=1;GBQ.levV=3.4;garBqChoc();try{if(SONV2)sfx('ui.volet');}catch(e){}try{hap(10);}catch(e){}}}
  GBQ.lueur=0;
  if(!GBQ.bascule&&GBQ.t>.26&&performance.now()-(GBQ.v0||0)>285){ /* (2026-10-15) en temps RÉEL : le voile est monté, même si la 1re image de la boutique (garBqBatit) a toussé — (2026-10-16) 285 ms : LE SOUFFLE DE LUMIÈRE couvre tout l'écran */GBQ.bascule=true;GBQ.on=veut;bqClasses(veut);garBqAmbiance(veut);bqVoile(null);GBQ.rafale=veut;}
  if(GAR.go&&(GBQ.on||GBQ.veut)){GBQ.on=GBQ.veut=false;GBQ.bascule=true;bqClasses(false);garBqAmbiance(false);GBQ.lueur=0;}
  try{garBqLueur(ay);garBqGloire(dt,t9);}catch(e){}
  const on=GBQ.on;
  if(GBQ.grp){GBQ.grp.visible=on;if(on){GAR.root.visible=false;GBQ.grp.position.set(0,ay,0);GBQ.grp.rotation.y=garCamA();}}
  {const c=on?1:0,w=3;GBQ.kv+=(w*w*(c-GBQ.k)-2*w*GBQ.kv)*dt;GBQ.k+=GBQ.kv*dt;}
  // LA LÉVITATION : le petit coup (elle s'enfonce), le BOUM (elle bondit, dépasse), puis elle flotte
  if(veut&&GBQ.coupT>=0&&GBQ.coupT<.12){GBQ.lev=-.06*Math.sin(Math.PI*.5*GBQ.coupT/.12);GBQ.levV=0;}
  else{const c=veut?.95*(1-BRB.bqK):0,w=veut?5.6:5.5,z=veut?.55:1; /* (2026-10-19) BRB.bqK : les deux bras la POSENT sur le plateau (le bras des figures va la prendre) */GBQ.levV+=(w*w*(c-GBQ.lev)-2*z*w*GBQ.levV)*dt;GBQ.lev+=GBQ.levV*dt;}
  if(!veut&&Math.abs(GBQ.lev)<.002&&Math.abs(GBQ.levV)<.01){GBQ.lev=0;GBQ.levV=0;}
  // LE DOIGT : lacet libre avec élan, tangage qui revient doucement ; au retour, elle se repose à plat
  if(!GBQ.drag&&GBQ.pose){if(GBQ.lan)bqLanceTick(dt);else{GBQ.yaw+=GBQ.yawV*dt;GBQ.yawV*=Math.exp(-2.4*dt);}GBQ.pitV=GBQ.rolV=0;} /* (2026-10-15) POSÉE À LA MAIN : l'élan du lancer (bqLanceTick), puis elle garde sa pose — ni ressort, ni plateau */
  else if(!GBQ.drag){if(GBQ.lan)bqLanceTick(dt);else{GBQ.yaw+=GBQ.yawV*dt;GBQ.yawV*=Math.exp(-2.4*dt);}const pw=1.7;GBQ.pitV+=(pw*pw*(0-GBQ.pit)-2*pw*GBQ.pitV)*dt;GBQ.pit+=GBQ.pitV*dt;GBQ.rol=GBQ.rol||0;GBQ.rolV=GBQ.rolV||0;GBQ.rolV+=(pw*pw*(0-GBQ.rol)-2*pw*GBQ.rolV)*dt;GBQ.rol+=GBQ.rolV*dt;}
  if(GBQ.yawGo){if(GBQ.drag)GBQ.yawGo=0;else{const tg=Math.round(GBQ.yaw/(2*Math.PI))*2*Math.PI;GBQ.yaw+=(tg-GBQ.yaw)*Math.min(1,dt*4);if(Math.abs(tg-GBQ.yaw)<.01){GBQ.yaw=tg;GBQ.yawGo=0;}}}
  if(!veut){const tg=Math.round(GBQ.yaw/(2*Math.PI))*2*Math.PI;GBQ.yaw+=(tg-GBQ.yaw)*Math.min(1,dt*5);GBQ.yawV=0;GBQ.lan=null;}
  const fl=Math.max(0,Math.min(1,GBQ.lev/.95));
  if(Math.abs(GBQ.lev)>1e-4||Math.abs(GBQ.yaw)>1e-4||Math.abs(GBQ.pit)>1e-4||Math.abs(GBQ.rol||0)>1e-4){
    {const b9=GBQ.ba||0;GBQ.levB=.38*b9*b9*(3-2*b9);}if(GBQ.tapT<.32)GBQ.tapT+=dt;const tu9=Math.min(1,GBQ.tapT/.32);carGroup.position.y+=GBQ.lev+GBQ.levB+(GBQ.hop||0)+Math.sin(Math.PI*tu9)*.07*(1-tu9)+Math.sin(t9*1.6)*.05*fl; // (2026-10-20) + le bond du TAP (bqTape)
    // (2026-10-13) +38 cm quand les BRAS la tiennent : la place de les voir
    const cA=garCamA(),q=GBQ._q||(GBQ._q=new THREE.Quaternion()),q2=GBQ._q2||(GBQ._q2=new THREE.Quaternion()),ax=GBQ._ax||(GBQ._ax=new THREE.Vector3()),Y=GBQ._Y||(GBQ._Y=new THREE.Vector3(0,1,0));
    q.setFromAxisAngle(Y,carGroup.rotation.y+GBQ.yaw);ax.set(1,0,0);q2.setFromAxisAngle(ax,GBQ.pit+Math.sin(t9*1.1)*.025*fl);q.multiply(q2);if(GBQ.rol){ax.set(0,0,1);q2.setFromAxisAngle(ax,GBQ.rol);q.multiply(q2);} /* (13/10) le ROULIS : saisie par le flanc, elle bascule vers nous (voir bqPrise) */ /* (2026-10-13, Léo : « penchée vers le bas, capot vers l'avant ») le glissé vertical la fait TANGUER sur son propre axe (l'axe de ses roues : le nez, à +z, plonge quand on tire vers le bas) — avant, elle basculait vers la caméra (de profil : le toit, puis le ventre) */
    ax.set(Math.sin(cA),0,Math.cos(cA));q2.setFromAxisAngle(ax,THREE.MathUtils.clamp(GBQ.yawV*.03,-.12,.12)*fl); /* (2026-10-14, Léo : « un peu penchée ») plus de roulis permanent : elle flotte DROITE */q.premultiply(q2);carGroup.quaternion.copy(q);}
  /* (2026-10-12, Léo : « la voiture passe à travers la plateforme ») penchée, elle se SOULÈVE de ce qu'il faut. (2026-10-13, Léo : « penchée
     capot vers l'avant, elle passe toujours à travers ») mesuré au banc : la levée suivait en RESSORT (×14/s) — un geste rapide la laissait 30 cm
     DANS le socle pendant quelques images ; et la boîte de garGabarit (carrosserie seule, supposée centrée) se trompait dans les deux sens (1,7 m
     de levée pour rien, ou un nez qui dépasse). Désormais : son vrai FOND (bqDessous, roues et pare-chocs compris), tourné comme elle, à l'échelle,
     et la levée MONTE à l'instant (elle redescend en douceur) */
  if(GBQ.socleH&&GBQ.grp&&GBQ.grp.visible){const F=bqDessous().fond,q=carGroup.quaternion,s9=carGroup.scale,c=GBQ._cc||(GBQ._cc=new THREE.Vector3());let bas=1e9;
    for(let i=0;i<F.length;i+=3){c.set(F[i]*s9.x,F[i+1]*s9.y,F[i+2]*s9.z).applyQuaternion(q);if(c.y<bas)bas=c.y;}
    if(bas>1e8){const G=garGabarit();for(const sx of [-1,1])for(const sz of [-1,1])for(const sy of [0,1]){c.set(sx*G.b,sy*G.H,sz*G.a).applyQuaternion(q);if(c.y<bas)bas=c.y;}}
    const sol=ay+GBQ.socleH+.06,besoin=Math.max(0,sol-(carGroup.position.y+bas));GBQ.leve=besoin>=(GBQ.leve||0)?besoin:GBQ.leve+(besoin-GBQ.leve)*Math.min(1,dt*4);
    GBQ.basY=carGroup.position.y+bas+GBQ.leve;carGroup.position.y+=GBQ.leve;}else GBQ.leve=0;
  // l'ombre sous la caisse et l'onde du boum
  if(GBQ.anneaux&&on){GBQ.anneaux[0].rotation.z+=dt*.12;GBQ.anneaux[1].rotation.z-=dt*.22;}
  if(!veut&&Math.abs(GBQ.lev)<.002){GBQ.yaw-=Math.round(GBQ.yaw/(2*Math.PI))*2*Math.PI;if(Math.abs(GBQ.yaw)<.002)GBQ.yaw=0;if(Math.abs(GBQ.pit)<.002){GBQ.pit=0;GBQ.pitV=0;}if(Math.abs(GBQ.rol||0)<.002){GBQ.rol=0;GBQ.rolV=0;}} // reposée : plus rien n'oriente la caisse que le plateau
  if(GBQ.omb){const s=4.2-.9*fl;GBQ.omb.scale.set(s,s,1);GBQ.omb.material.opacity=.42-.12*fl;}
  if(GBQ.choc){GBQ.chocT+=dt;const u=GBQ.chocT/.55;GBQ.choc.visible=u<1;if(u<1){const s=1.2+4.2*(1-Math.pow(1-u,3));GBQ.choc.scale.set(s,s,s);GBQ.choc.position.set(0,ay+GAR.POD+.06,0);GBQ.choc.material.opacity=.85*(1-u);}}
  try{garBqBras(dt,t9,ay);}catch(e){window.__brasErr=e;}
  try{bqOutilTick(dt,t9,ay);}catch(e){window.__outilErr=e;}
  try{bqGesteTick(dt,t9);bqPoussiere(t9);}catch(e){window.__gesteErr=e;}
  try{garBqPanneau(dt,t9);}catch(e){}
  if(GBQ.rafale){GBQ.rafale=false;if(GBQ.on)try{photoRafale(PHOTO_RAFALE_MS);}catch(e){}} // (2026-10-16) sous le voile plein : les vignettes en vue, à la chaîne (voir LE STUDIO SANS À-COUPS) — la grille se découvre remplie
}
/* LE DESSOUS DE LA CAISSE (bqDessous) — relevé une fois par caisse, dans SON repère : le FOND (le point le plus bas de chaque case de 8 cm,
   toutes pièces pleines comprises — roues, pare-chocs, becquet : la levée qui l'empêche de traverser le socle) et le PLANCHER (sans les roues,
   une case de marge autour d'elles : là où les bras la prennent). */
function bqDessous(){const k=garageI+':'+(carBody?carBody.children.length:0)+':'+carGroup.children.length;if(GBQ.hm&&GBQ.hm.k===k)return GBQ.hm;
  carGroup.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(carGroup.matrixWorld).invert(),v=new THREE.Vector3(),w=new THREE.Vector3(),u=new THREE.Vector3(),bb=new THREE.Box3(),b9=new THREE.Box3(),PC=[];
  carGroup.traverse(function(o){if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;const mt=Array.isArray(o.material)?o.material[0]:o.material;
    if((mt&&(mt.transparent||mt.blending===THREE.AdditiveBlending))||(o.userData&&o.userData.sol))return;
    let roue=false;for(let q9=o;q9&&q9!==carGroup;q9=q9.parent){if(!q9.visible)return;const u9=q9.userData;if(u9&&(u9.essieu||u9.R!=null))roue=true;} // (une roue : son empreinte est notée à part)
    const M=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld);if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();b9.copy(o.geometry.boundingBox).applyMatrix4(M);bb.union(b9);PC.push([o,M,roue]);});
  if(bb.isEmpty())return GBQ.hm={k:k,fond:new Float32Array(0),H:null};
  // (2026-10-13, Léo : « penchée capot vers l'avant, elle passe à travers ») la grille couvre la VRAIE boîte des pièces (garGabarit ne mesurait que la
  // carrosserie, supposée centrée : un nez plus long que l'arrière en sortait)
  const P=.08,x0=bb.min.x-P,z0=bb.min.z-P,nx=Math.ceil((bb.max.x-bb.min.x)/P)+3,nz=Math.ceil((bb.max.z-bb.min.z)/P)+3,H=new Float32Array(nx*nz).fill(1e9),Ro=new Uint8Array(nx*nz),
    FY=new Float32Array(nx*nz).fill(1e9),FX=new Float32Array(nx*nz),FZ=new Float32Array(nx*nz);
  let roue=false;const pose=function(p){const ix=Math.round((p.x-x0)/P),iz=Math.round((p.z-z0)/P);if(ix<0||iz<0||ix>=nx||iz>=nz)return;const j=iz*nx+ix;
    if(p.y<FY[j]){FY[j]=p.y;FX[j]=p.x;FZ[j]=p.z;}if(roue)Ro[j]=1;else if(p.y<H[j])H[j]=p.y;};
  for(const e of PC){const o=e[0],M=e[1];roue=e[2];const a=o.geometry.attributes.position,idx=o.geometry.index,nT=idx?idx.count/3:a.count/3,st=nT>9000?Math.ceil(nT/9000):1;
    if(st>1)for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(M);pose(v);} // (pièce très fine : tous ses sommets comptent pour le fond, même ceux des triangles sautés)
    for(let t=0;t<nT;t+=st){const i0=idx?idx.getX(3*t):3*t,i1=idx?idx.getX(3*t+1):3*t+1,i2=idx?idx.getX(3*t+2):3*t+2;
      v.fromBufferAttribute(a,i0).applyMatrix4(M);w.fromBufferAttribute(a,i1).applyMatrix4(M);u.fromBufferAttribute(a,i2).applyMatrix4(M);pose(v);pose(w);pose(u);
      // le triangle RASTÉRISÉ vu de dessous : chaque centre de case qu'il couvre prend sa hauteur exacte (une grande face de plancher n'a pas de sommets au milieu)
      const ar=(w.x-v.x)*(u.z-v.z)-(u.x-v.x)*(w.z-v.z);if(Math.abs(ar)<1e-7)continue;
      const ia=Math.max(0,Math.ceil((Math.min(v.x,w.x,u.x)-x0)/P)),ib=Math.min(nx-1,Math.floor((Math.max(v.x,w.x,u.x)-x0)/P)),ka=Math.max(0,Math.ceil((Math.min(v.z,w.z,u.z)-z0)/P)),kb=Math.min(nz-1,Math.floor((Math.max(v.z,w.z,u.z)-z0)/P));
      for(let ix=ia;ix<=ib;ix++)for(let iz=ka;iz<=kb;iz++){const cx=x0+ix*P,cz=z0+iz*P,l1=((w.x-cx)*(u.z-cz)-(u.x-cx)*(w.z-cz))/ar,l2=((u.x-cx)*(v.z-cz)-(v.x-cx)*(u.z-cz))/ar,l3=1-l1-l2;
        if(l1<-1e-4||l2<-1e-4||l3<-1e-4)continue;const j=iz*nx+ix,y=l1*v.y+l2*w.y+l3*u.y;if(y<FY[j]){FY[j]=y;FX[j]=cx;FZ[j]=cz;}if(roue){Ro[j]=1;continue;}if(y<H[j])H[j]=y;}}}
  {const R2=Ro.slice();for(let iz=0;iz<nz;iz++)for(let ix=0;ix<nx;ix++)if(R2[iz*nx+ix])for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const X=ix+a,Z=iz+b;if(X>=0&&Z>=0&&X<nx&&Z<nz)Ro[Z*nx+X]=1;}} // l'empreinte des roues, une case de marge
  for(let j=0;j<H.length;j++)if(Ro[j])H[j]=1e9;
  const F=[];for(let j=0;j<FY.length;j++)if(FY[j]<1e8)F.push(FX[j],FY[j],FZ[j]);
  // LE FOND : penchée de moins de 90°, le point le plus bas d'une verticale de la caisse est toujours celui du bas — ces points suffisent pour savoir exactement où elle touche
  return GBQ.hm={k:k,fond:new Float32Array(F),H:H,nx:nx,nz:nz,x0:x0,z0:z0,P:P,bb:bb};}
/* le PLANCHER sous un point de la caisse (repère caisse) : la case la plus proche qui en a un, en cherchant d'abord vers le milieu */
function bqPlancher(hm,lx,lz,out){if(!hm.H)return null;const P=hm.P,ix0=Math.round((lx-hm.x0)/P),iz0=Math.round((lz-hm.z0)/P),zc=Math.round(((hm.bb.min.z+hm.bb.max.z)/2-hm.z0)/P),sz=iz0>zc?-1:1;
  for(let r=0;r<14;r++)for(const dz of [r*sz,-r*sz])for(const dx of [0,1,-1,2,-2]){const ix=ix0+dx,iz=iz0+dz;if(ix<0||iz<0||ix>=hm.nx||iz>=hm.nz)continue;const y=hm.H[iz*hm.nx+ix];
    if(y<1e8)return out.set(hm.x0+ix*P,y,hm.z0+iz*P);}
  return null;}
/* LES BRAS (2026-10-13, Léo : « tu as mal compris l'ondulation : il fallait juste régler le bug des trucs blancs qui tiennent la voiture ; sinon
   des bras mécaniques argentés qui tournent et manipulent la voiture, ça serait cool » ; « ça fait Blade Runner, sur fond blanc néoclassique »)
   — le coussin de cubes et l'onde sont retirés. Deux bras robots d'argent sortent du socle, posés sur un PLATEAU TOURNANT d'argent cranté de
   graphite : chacun tient la caisse par son plancher (un tiers devant, un tiers derrière, jamais une roue), une pince à plat contre elle.
   Le plateau tourne avec la caisse (les bras la font tourner), et quand elle plonge ou se cabre, chaque bras se plie ou s'allonge (deux
   segments, coude vers l'extérieur ; trop loin : l'avant-bras sort son vérin chromé). Un vérin le long du bras, une diode ambre au poignet.
   Ils montent du socle à l'arrivée et y rentrent au départ. Hors du reflet du sol, comme la caisse. */
const BQB={L1:.62,L2:.58,hB:.2};
function garBqBrasBatit(){if(GBQ.bras)return GBQ.bras;
  const g=new THREE.Group();g.visible=false;scene.add(g);GBQ.bras=g;
  // le métal reflète la SALLE BLANCHE (pas le ciel du jeu, rosé) : six faces peintes — plafond blanc, murs blancs qui fondent au gris perle, un trait
  // d'horizon graphite (ce qui fait lire le chrome), le sol gris
  const envB=(function(){const f=function(k){const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d');
      if(k===2){x.fillStyle='#ffffff';x.fillRect(0,0,64,64);}else if(k===3){x.fillStyle='#7d838d';x.fillRect(0,0,64,64);}
      else{const gr=x.createLinearGradient(0,0,0,64);gr.addColorStop(0,'#ffffff');gr.addColorStop(.46,'#eef1f5');gr.addColorStop(.5,'#3a3f48');gr.addColorStop(.56,'#c9ced6');gr.addColorStop(1,'#8d939c');x.fillStyle=gr;x.fillRect(0,0,64,64);}
      return cv;};const t=new THREE.CubeTexture([f(0),f(1),f(2),f(3),f(4),f(5)]);t.needsUpdate=true;return t;})();
  const argent=new THREE.MeshPhongMaterial({color:0xd5dbe3,specular:0xffffff,shininess:150,envMap:envB,reflectivity:.5,combine:THREE.MixOperation,flatShading:true,fog:false}),
    chrome=new THREE.MeshPhongMaterial({color:0xf3f5f8,specular:0xffffff,shininess:300,envMap:envB,reflectivity:.85,combine:THREE.MixOperation,fog:false}),
    graph=new THREE.MeshPhongMaterial({color:0x2b2f37,specular:0x7c838e,shininess:70,flatShading:true,fog:false}),
    diode=new THREE.MeshBasicMaterial({color:0xffb347,fog:false});diode.color.setRGB(1.9,1.05,.38); // (au-delà de 1 : le halo du jeu la fait luire)
  GBQ.matB={argent:argent,chrome:chrome,graph:graph,diode:diode}; // (les bras d'atelier les reprennent)
  const cyl=new THREE.CylinderGeometry(1,1,1,8),sph=new THREE.SphereGeometry(1,10,8),box=new THREE.BoxGeometry(1,1,1),M=function(geo,mt){const m=new THREE.Mesh(geo,mt);g.add(m);return m;};
  // le plateau tournant : un disque d'argent, douze crans de graphite sur sa tranche
  const pl=new THREE.Group();g.add(pl);GBQ.brasPl=pl;
  /* (2026-10-14, Léo : « la plateforme aussi grosse que celle du garage, plus fixe ») le plateau a la TAILLE de celui de l'atelier (rayon 4,4,
     12 cm d'épaisseur, son dessus = le haut du « socle » : GBQ.socleH), un anneau de graphite à mi-rayon, douze crans sur le bord — et il ne
     tourne plus avec la caisse (voir garBqBras) */
  {const d=new THREE.Mesh(new THREE.CylinderGeometry(1.83,1.89,.04,64),argent);d.position.y=.02;pl.add(d); /* (même jour, Léo : « c'était mieux avant, juste le socle un tout petit peu plus grand, 1,5× ») le disque d'avant ×1,5 */
   const c=new THREE.Mesh(new THREE.TorusGeometry(.9,.028,4,64),graph);c.rotation.x=Math.PI/2;c.position.y=.042;pl.add(c);
   for(let i=0;i<12;i++){const n=new THREE.Mesh(box,graph);const a=i/12*Math.PI*2;n.scale.set(.08,.045,.2);n.position.set(Math.sin(a)*1.74,.025,Math.cos(a)*1.74);n.rotation.y=a;pl.add(n);}}
  GBQ.brasL=[0,1].map(function(){const A={
      pied:M(cyl,graph),tour:M(cyl,argent),epaule:M(sph,graph),bras:M(cyl,argent),verin:M(cyl,chrome),coude:M(cyl,graph),
      avant:M(cyl,argent),tige:M(cyl,chrome),poignet:M(sph,graph),main:new THREE.Group()};
    g.add(A.main);const pad=new THREE.Mesh(box,graph);pad.scale.set(.32,.035,.2);pad.position.y=-.03;A.main.add(pad);
    for(const s of [-1,1]){const d9=new THREE.Mesh(box,argent);d9.scale.set(.035,.08,.17);d9.position.set(s*.16,-.02,0);A.main.add(d9);}
    const led=new THREE.Mesh(box,diode);led.scale.set(.05,.02,.02);led.position.set(0,-.05,.105);A.main.add(led);
    return A;});
  return g;}
function bqSeg(m,A,B,r){const Y=bqSeg._y||(bqSeg._y=new THREE.Vector3(0,1,0)),d=bqSeg._d||(bqSeg._d=new THREE.Vector3());d.subVectors(B,A);const L=d.length();if(L<1e-5){m.visible=false;return;}m.visible=true;
  m.position.addVectors(A,B).multiplyScalar(.5);m.quaternion.setFromUnitVectors(Y,d.multiplyScalar(1/L));m.scale.set(r,L,r);}
function garBqBras(dt,t9,ay){
  const vis=!!(GBQ.grp&&GBQ.grp.visible&&GBQ.socleH),rentre9=BRB.bqK>.02&&Math.abs(GBQ.lev||0)<.12;GBQ.ba=Math.max(0,Math.min(1,(GBQ.ba||0)+(GBQ.on&&vis&&!rentre9?dt*1.6:-dt*2.4))); // (2026-10-19) la caisse posée, ils rentrent dans le socle : le bras des figures prend la suite
  if(!vis||(GBQ.ba<=0&&!(BRB.bqK>0))){if(GBQ.bras)GBQ.bras.visible=false;return;} // (2026-10-19) rentrés pour le bras des figures : le PLATEAU reste (la caisse y est posée), eux sont sous le sol
  const g=garBqBrasBatit(),hm=bqDessous();g.visible=true;
  const V=GBQ._bv||(GBQ._bv=[0,1,2,3,4,5,6,7,8,9].map(function(){return new THREE.Vector3();})),[G,S,W,E,D,o,n,up,T,X]=V;
  const e=GBQ.ba*GBQ.ba*(3-2*GBQ.ba),y0=ay+GBQ.socleH,q=carGroup.quaternion,s9=carGroup.scale,p0=carGroup.position,mont=(1-e)*.75; // ils montent du socle
  // le plateau suit le cap de la caisse
  X.set(0,0,1).applyQuaternion(q);g.position.set(0,0,0);GBQ.brasPl.position.set(0,y0-mont*.05,0);GBQ.brasPl.rotation.y=0; /* (14/10) FIXE : il ne suit plus le cap de la caisse */
  up.set(0,1,0).applyQuaternion(q);
  const bb=hm.bb,zc=bb?(bb.min.z+bb.max.z)/2:0,lg=bb?(bb.max.z-bb.min.z):4;
  for(let i=0;i<2;i++){const A=GBQ.brasL[i],sg=i?-1:1;
    if(!bqPlancher(hm,0,zc+sg*.14*lg,G))G.set(0,0,zc+sg*.14*lg);
    G.set(G.x*s9.x,G.y*s9.y,G.z*s9.z).applyQuaternion(q).add(p0);     // la prise, dans le monde
    // le pied, sur le plateau, sous la prise (rayon fixe, dans l'axe du cap)
    const rb=Math.min(1.25,Math.max(.6,.14*lg+.42));T.set(X.x,0,X.z);if(T.lengthSq()<1e-6)T.set(0,0,1);T.normalize().multiplyScalar(sg*rb);
    const yB=y0-mont;S.set(T.x,yB+BQB.hB,T.z);
    A.pied.position.set(T.x,yB+.03,T.z);A.pied.scale.set(.19,.06,.19);A.pied.quaternion.identity();
    A.tour.position.set(T.x,yB+BQB.hB*.55,T.z);A.tour.scale.set(.13,BQB.hB*.9,.13);A.tour.quaternion.identity();
    A.epaule.position.copy(S);A.epaule.scale.setScalar(.11);
    // le poignet sous la pince ; replié (à l'arrivée) : au-dessus du pied, vers l'extérieur
    W.copy(G).addScaledVector(up,-.1);o.set(T.x,0,T.z).normalize();
    D.copy(S).addScaledVector(o,.32).add(n.set(0,.38,0));W.lerpVectors(D,W,e);
    // les deux segments : le coude vers l'extérieur, en haut
    D.subVectors(W,S);let d=D.length();const L1=BQB.L1;let L2=BQB.L2;if(d<1e-4){d=1e-4;D.set(0,1e-4,0);}D.multiplyScalar(1/d);
    n.copy(o).addScaledVector(D,-o.dot(D));if(n.lengthSq()<1e-5)n.set(0,1,0).addScaledVector(D,-D.y);n.normalize();
    let a1=0;if(d>=L1+L2)L2=d-L1;else{const c=(L1*L1+d*d-L2*L2)/(2*L1*d);a1=Math.acos(Math.max(-1,Math.min(1,c)));}
    E.copy(S).addScaledVector(D,Math.cos(a1)*L1).addScaledVector(n,Math.sin(a1)*L1);
    bqSeg(A.bras,S,E,.075);
    {const p1=(GBQ._bp1||(GBQ._bp1=new THREE.Vector3())).copy(S).addScaledVector(n,.1).addScaledVector(D,.05),p2=(GBQ._bp2||(GBQ._bp2=new THREE.Vector3())).lerpVectors(S,E,.62).addScaledVector(n,.075);bqSeg(A.verin,p1,p2,.026);}
    A.coude.position.copy(E);{const ax=(GBQ._bax||(GBQ._bax=new THREE.Vector3())).crossVectors(D,n).normalize();A.coude.quaternion.setFromUnitVectors(bqSeg._y||(bqSeg._y=new THREE.Vector3(0,1,0)),ax);}A.coude.scale.set(.09,.19,.09);
    {const f=(GBQ._bf||(GBQ._bf=new THREE.Vector3())).subVectors(W,E),Lf=f.length();f.multiplyScalar(1/Math.max(1e-5,Lf));
     const m1=(GBQ._bm1||(GBQ._bm1=new THREE.Vector3())).copy(E).addScaledVector(f,Math.min(Lf,BQB.L2*.62));bqSeg(A.avant,E,m1,.064);
     const m2=(GBQ._bm2||(GBQ._bm2=new THREE.Vector3())).copy(E).addScaledVector(f,Math.min(Lf,BQB.L2*.45));bqSeg(A.tige,m2,W,.034);} // le vérin chromé sort quand il faut aller plus loin
    A.poignet.position.copy(W);A.poignet.scale.setScalar(.075);
    A.main.position.copy(W).addScaledVector(up,.065*e);A.main.quaternion.copy(q);A.main.scale.setScalar(.4+.6*e);}
}
/* LES GESTES DE LA BOUTIQUE (2026-10-13, Léo : « quand on change de voiture, d'aile ou de traînée, chaque action doit avoir une animation propre
   à elle, en respectant la DA de la boutique, néoclassique digitale ») — des CUBES DE LUMIÈRE (un seul maillage instancié, additif) et une lame :
   · VOITURE — LA MATÉRIALISATION : l'ancienne s'écrase (la bascule du garage), un éclat de cubes blancs part du socle, puis un ANNEAU de cubes
     de lumière court sur le toit de la nouvelle pendant qu'elle se dresse : elle s'imprime sous nos yeux, des étincelles carrées s'en échappent.
   · PEINTURE — LE BAIN : une LAME de lumière de la couleur traverse la caisse de l'arrière à l'avant, des cubes de couleur s'en détachent.
   · AILE — L'ENVOL : la caisse bondit, deux gerbes de cubes nacre et or partent en V de l'arrière, la gloire s'ouvre un instant.
   · TRAÎNÉE — LA COMÈTE : une comète de la couleur fait un tour et quart en spirale autour de la caisse et finit dans ses pots, sa traîne en cubes.
   `dbgGeste('voiture'|'peinture'|'aile'|'trainee')` le rejoue. */
const BQG={a:null,t:0,n:0};
function bqGesteBatit(){if(BQG.m)return;
  const N=420,m=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xffffff,fog:false}),N); // des cubes PLEINS : sur le blanc, une lumière additive ne se voit pas
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;m.renderOrder=6;m.setColorAt(0,new THREE.Color(1,1,1));m.count=0;scene.add(m);BQG.m=m;BQG.N=N;
  BQG.p=new Float32Array(N*3);BQG.v=new Float32Array(N*3);BQG.l=new Float32Array(N);BQG.l0=new Float32Array(N);BQG.s=new Float32Array(N);BQG.c=new Float32Array(N*3);
  BQG.lame=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false,fog:false}));
  BQG.lame.visible=false;BQG.lame.renderOrder=6;scene.add(BQG.lame);
  BQG.M=new THREE.Matrix4();BQG.C=new THREE.Color();BQG.v1=new THREE.Vector3();BQG.v2=new THREE.Vector3();BQG.Q=new THREE.Quaternion();BQG.S=new THREE.Vector3();BQG.r=mulberry32(0x6E57);}
function bqPart(x,y,z,vx,vy,vz,l,s,r,g,b){if(BQG.n>=BQG.N-60)return;const i=BQG.n++;BQG.p[3*i]=x;BQG.p[3*i+1]=y;BQG.p[3*i+2]=z;BQG.v[3*i]=vx;BQG.v[3*i+1]=vy;BQG.v[3*i+2]=vz;
  BQG.l[i]=BQG.l0[i]=l;BQG.s[i]=s;BQG.c[3*i]=r;BQG.c[3*i+1]=g;BQG.c[3*i+2]=b;}
const BQ_OR=[.91,.70,.34],BQ_GRAPH=[.17,.18,.22]; // l'or pâle de la gloire, le graphite des bras
function bqGesteCoul(cat,d){if(!d)return BQ_OR;
  if(cat==='trainee'){if(d.rainbow)return null;if(d.rgb){const m9=Math.max(1,...d.rgb);return d.rgb.map(function(x){return x/m9;});}return [1,.45,.12];}
  const h=d.c!=null?d.c:(d.grad?d.grad[0]:null);if(h==null)return BQ_OR;const c=new THREE.Color(h);return [c.r,c.g,c.b];}
function bqGeste(k,d){bqGesteBatit();BQG.a=k;BQG.t=0;BQG.f=0;BQG.col=bqGesteCoul(k,d);BQG.th0=Math.random()*Math.PI*2;
  if(k==='aile')GBQ.gFlash=1;try{if(SONV2)sfx(k==='voiture'?'ui.feuille':'ui.carte',k==='voiture'?undefined:{vol:-3});}catch(e){}} /* (2026-10-14, session SON) ui.carte −3 : feuilleter (−34, bus rec) sonnait plus fort que valider (ui.tap −35) — rangé avec ui.equipe (−37) */
function bqGesteTick(dt,t9){if(!BQG.m)return;const B=BQG,m=B.m,M=B.M,C=B.C,r=B.r;
  const vis=!!(GBQ.grp&&GBQ.grp.visible);if(!vis){m.visible=false;B.lame.visible=false;B.n=0;B.a=null;GBQ.hop=0;return;}m.visible=true;
  const hm=bqDessous(),bb=hm.bb,q=carGroup.quaternion,sc=carGroup.scale,p0=carGroup.position,v1=B.v1,v2=B.v2;
  const L=function(x,y,z,out){return out.set(x*sc.x,y*sc.y,z*sc.z).applyQuaternion(q).add(p0);}; // repère caisse → monde
  const x0=bb?bb.min.x:-1,x1=bb?bb.max.x:1,y0=bb?bb.min.y:0,y1=bb?bb.max.y:1.3,z0=bb?bb.min.z:-2.2,z1=bb?bb.max.z:2.2,cx=(x0+x1)/2,cz=(z0+z1)/2;
  GBQ.gFlash=Math.max(0,(GBQ.gFlash||0)-dt*1.6);
  // le geste en cours
  if(B.a){B.t+=dt;const t=B.t,col=B.col||[1.5,1.5,1.55];
    if(B.a==='voiture'){
      if(t>=.34&&!(B.f&1)){B.f|=1;for(let i=0;i<46;i++){const a=r()*Math.PI*2,sp=1.6+r()*2.6;L(cx+Math.cos(a)*(x1-x0)*.45,y0,cz+Math.sin(a)*(z1-z0)*.45,v1);
        const g9=i%3?BQ_OR:BQ_GRAPH;bqPart(v1.x,v1.y,v1.z,Math.cos(a)*sp,1.2+r()*2.2,Math.sin(a)*sp,.5+r()*.5,.05+r()*.06,g9[0],g9[1],g9[2]);}}
      if(t>=.34&&t<1.32){const u=Math.min(1,(t-.34)/.72),al=t<1.06?1:1-(t-1.06)/.26,n=48,ry=y0+(y1-y0)*Math.min(1,u*1.04),ax=(x1-x0)/2+.2,az=(z1-z0)/2+.2;
        for(let i=0;i<n;i++)if(r()<.09*al){const a=i/n*Math.PI*2+t*1.8;L(cx+Math.cos(a)*ax,ry,cz+Math.sin(a)*az,v1); // des étincelles carrées s'échappent de l'anneau
          bqPart(v1.x,v1.y,v1.z,(r()-.5)*1.4,.4+r()*.9,(r()-.5)*1.4,.35+r()*.3,.035+r()*.03,BQ_OR[0],BQ_OR[1],BQ_OR[2]);}
        B.ring={ry:ry,ax:ax,az:az,al:al};}else B.ring=null;
      if(t>1.4)B.a=null;}
    else if(B.a==='peinture'){const u=Math.min(1,t/.75),z=z0-.25+(z1-z0+.5)*u*u*(3-2*u),al=Math.sin(Math.PI*u);
      const la=B.lame;la.visible=al>.01;L(cx,(y0+y1)/2,z,v1);la.position.copy(v1);la.quaternion.copy(q);la.scale.set((x1-x0+.5)*sc.x,(y1-y0+.45)*sc.y,.05);
      la.material.color.setRGB(col[0],col[1],col[2]);la.material.opacity=al*.55;
      for(let i=0;i<7;i++){L(x0-.2+(x1-x0+.4)*r(),y0+(y1-y0+.2)*r(),z,v1);v2.set((r()-.5)*.6,.3+r()*.8,(r()<.5?-1:1)*(.4+r()*.9)).applyQuaternion(q);
        bqPart(v1.x,v1.y,v1.z,v2.x,v2.y,v2.z,.45+r()*.4,.04+r()*.05,col[0],col[1],col[2]);}
      if(t>.8){B.a=null;la.visible=false;}}
    else if(B.a==='aile'){GBQ.hop=Math.sin(Math.PI*Math.min(1,t/.62))*.3;
      if(t>=.06&&!(B.f&1)){B.f|=1;for(const sg of [-1,1])for(let i=0;i<46;i++){const sp=2.6+r()*3.2,o=i%3?1:0;
        v2.set(sg*(.8+r()*.5),1+r()*.9,-.5-r()*.6).normalize().multiplyScalar(sp).applyQuaternion(q);L(cx+sg*(x1-x0)*.32,y1*.82,z0+.35,v1);
        const g9=o?BQ_OR:BQ_GRAPH;bqPart(v1.x,v1.y,v1.z,v2.x,v2.y,v2.z,.65+r()*.55,.06+r()*.06,g9[0],g9[1],g9[2]);}}
      if(t>1.1){B.a=null;GBQ.hop=0;}}
    else if(B.a==='trainee'){const T=1.25,u=Math.min(1,t/T),R=Math.max((x1-x0),(z1-z0))/2+.55;
      let px,py,pz;const th=B.th0+u*Math.PI*2.5,yH=y0+.15+(y1-y0)*.55*Math.sin(Math.PI*Math.min(1,u*1.2));
      L(cx,y0+.45,z0-.1,v2); // les pots (l'arrière, à hauteur de tuyère)
      px=p0.x+Math.sin(th)*R;pz=p0.z+Math.cos(th)*R;py=p0.y+yH;
      const k9=Math.max(0,(u-.78)/.22),e9=k9*k9*(3-2*k9);px+=(v2.x-px)*e9;py+=(v2.y-py)*e9;pz+=(v2.z-pz)*e9;
      const rb=col?null:new THREE.Color().setHSL((t*1.4)%1,1,.55);const c3=col||[rb.r,rb.g,rb.b];
      if(u<1){for(let i=0;i<5;i++)bqPart(px+(r()-.5)*.12,py+(r()-.5)*.12,pz+(r()-.5)*.12,(r()-.5)*.25,(r()-.5)*.25,(r()-.5)*.25,.45+r()*.35,.05+r()*.04,c3[0],c3[1],c3[2]);
        B.tete={x:px,y:py,z:pz,c:c3};}else B.tete=null;
      if(u>=1&&!(B.f&1)){B.f|=1;for(let i=0;i<26;i++){v1.set((r()-.5)*1.2,r()*.8,-1-r()*1.5).applyQuaternion(q);bqPart(v2.x,v2.y,v2.z,v1.x*1.6,v1.y*1.6,v1.z*1.6,.4+r()*.4,.04+r()*.05,c3[0],c3[1],c3[2]);}}
      if(t>T+.5){B.a=null;B.tete=null;}}}
  else{B.lame.visible=false;B.ring=null;B.tete=null;}
  // les cubes : la gerbe vit, rétrécit et s'éteint
  let n=0;
  for(let i=0;i<B.n;i++){B.l[i]-=dt;if(B.l[i]<=0)continue;const k=B.l[i]/B.l0[i],j=n++;
    if(j!==i){for(let a=0;a<3;a++){B.p[3*j+a]=B.p[3*i+a];B.v[3*j+a]=B.v[3*i+a];B.c[3*j+a]=B.c[3*i+a];}B.l[j]=B.l[i];B.l0[j]=B.l0[i];B.s[j]=B.s[i];}
    B.v[3*j]*=Math.exp(-dt*1.4);B.v[3*j+2]*=Math.exp(-dt*1.4);B.v[3*j+1]=B.v[3*j+1]*Math.exp(-dt*1.4)-dt*2.2;
    for(let a=0;a<3;a++)B.p[3*j+a]+=B.v[3*j+a]*dt;
    const s9=B.s[j]*Math.sqrt(k);M.makeScale(s9,s9,s9);M.setPosition(B.p[3*j],B.p[3*j+1],B.p[3*j+2]);m.setMatrixAt(j,M);C.setRGB(B.c[3*j],B.c[3*j+1],B.c[3*j+2]);m.setColorAt(j,C);}
  B.n=n;let c=n;
  if(B.ring){const R9=B.ring,nR=48;for(let i=0;i<nR&&c<B.N;i++){const a=i/nR*Math.PI*2+B.t*1.8;L(cx+Math.cos(a)*R9.ax,R9.ry,cz+Math.sin(a)*R9.az,v1);
    const s9=.08*R9.al;M.makeScale(s9,s9*.6,s9);M.setPosition(v1.x,v1.y,v1.z);m.setMatrixAt(c,M);C.setRGB(BQ_OR[0],BQ_OR[1],BQ_OR[2]);m.setColorAt(c,C);c++;}}
  if(B.tete&&c<B.N-6){const T9=B.tete;for(let i=0;i<5;i++){const s9=i?.07:.16;M.makeScale(s9,s9,s9);M.setPosition(T9.x+(i?(r()-.5)*.2:0),T9.y+(i?(r()-.5)*.2:0),T9.z+(i?(r()-.5)*.2:0));m.setMatrixAt(c,M);
    C.setRGB(i?T9.c[0]:BQ_OR[0],i?T9.c[1]:BQ_OR[1],i?T9.c[2]:BQ_OR[2]);m.setColorAt(c,C);c++;}}
  m.count=c;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}
/* la poussière d'or dérive : un lent tourbillon autour de la caisse, chaque grain respire */
function bqPoussiere(t9){const pt=GBQ.poussiere;if(!pt)return;const P=pt.geometry.attributes.position,A=P.array,A0=GBQ.poussP0,n=A.length/3,a=t9*.05,ca=Math.cos(a),sa=Math.sin(a);
  for(let i=0;i<n;i++){const x=A0[3*i],z=A0[3*i+2];A[3*i]=x*ca+z*sa;A[3*i+2]=-x*sa+z*ca;A[3*i+1]=A0[3*i+1]+Math.sin(t9*.6+i*1.7)*.18;}
  P.needsUpdate=true;}
/* LES BRAS D'ATELIER (2026-10-13, Léo : « je pensais plutôt à des bras mécaniques qui apparaissent, se déplacent et accrochent les ailes,
   ou quoi, en fonction de ce qu'on équipe, ce qu'on déséquipe ») — deux grands bras d'argent sur un RAIL autour du socle (un par flanc de la
   caisse). Ils sortent du socle, glissent sur le rail jusqu'à leur pièce, la travaillent, puis rentrent. L'essai n'est APPLIQUÉ qu'au moment
   où le bras touche la caisse (`apply`) :
   · AILE — ils prennent chaque aile à sa racine et la DÉPLIENT (ils suivent son bout pendant qu'elle s'ouvre) ; déséquiper : ils l'arrachent,
     l'emportent en l'air (une plaque d'or dans la pince) et rentrent avec ; équiper : un tour de clé à la racine, étincelles d'or.
   · PEINTURE — un pistolet au poing, ils longent chaque flanc de l'arrière à l'avant en crachant des cubes de la couleur ; équiper : ils lustrent.
   · TRAÎNÉE — une prise à la couleur de la traînée se BRANCHE sur les pots, la bague se charge, ils débranchent : la traînée jaillit.
   `dbgOutil('aile'|'peinture'|'trainee', 'essai'|'serre'|'retire')` rejoue un geste (sans rien changer). */
const BQT={L1:.82,L2:.78,hB:.3,rail:2.0,task:null};
function garBqOutilBatit(){if(BQT.g)return BQT.g;garBqBrasBatit();bqGesteBatit();const Mt=GBQ.matB,g=new THREE.Group();g.visible=false;scene.add(g);BQT.g=g;
  const cyl=new THREE.CylinderGeometry(1,1,1,8),sph=new THREE.SphereGeometry(1,10,8),box=new THREE.BoxGeometry(1,1,1),M=function(geo,mt,par){const m=new THREE.Mesh(geo,mt);(par||g).add(m);return m;};
  const rail=new THREE.Mesh(new THREE.TorusGeometry(BQT.rail,.03,4,96),Mt.graph);rail.rotation.x=Math.PI/2;g.add(rail);BQT.railM=rail;
  const rail2=new THREE.Mesh(new THREE.TorusGeometry(BQT.rail,.012,4,96),Mt.chrome);rail2.rotation.x=Math.PI/2;g.add(rail2);BQT.railM2=rail2;
  BQT.bras=[0,1].map(function(){const A={chariot:M(box,Mt.graph),tour:M(cyl,Mt.argent),epaule:M(sph,Mt.graph),bras:M(cyl,Mt.argent),verin:M(cyl,Mt.chrome),coude:M(cyl,Mt.graph),
      avant:M(cyl,Mt.argent),tige:M(cyl,Mt.chrome),poignet:M(sph,Mt.graph),tete:new THREE.Group(),phi:0,on:false};g.add(A.tete);
    // la PINCE : une paume, deux doigts (+ la plaque d'or qu'elle emporte)
    A.pince=new THREE.Group();A.tete.add(A.pince);{const pa=M(box,Mt.graph,A.pince);pa.scale.set(.17,.07,.12);pa.position.y=.035;
      A.doigts=[-1,1].map(function(sg){const d=M(box,Mt.argent,A.pince);d.scale.set(.035,.17,.055);d.position.set(sg*.07,.15,0);return d;});
      A.fant=M(box,null,A.pince);A.fant.material=new THREE.MeshPhongMaterial({color:0xe2b45c,specular:0xfff2c8,shininess:120,flatShading:true,fog:false});A.fant.scale.set(.62,.035,.22);A.fant.position.y=.24;A.fant.visible=false;}
    // le PISTOLET : un bidon, une buse
    A.buse=new THREE.Group();A.tete.add(A.buse);{const b=M(cyl,Mt.graph,A.buse);b.scale.set(.065,.13,.065);b.position.y=.065;const n=M(new THREE.CylinderGeometry(.018,.05,1,8),Mt.chrome,A.buse);n.scale.set(1,.16,1);n.position.y=.21;}
    // la PRISE : un fût, une bague à la couleur
    A.prise=new THREE.Group();A.tete.add(A.prise);{const f=M(cyl,Mt.argent,A.prise);f.scale.set(.055,.2,.055);f.position.y=.1;A.bague=new THREE.Mesh(new THREE.TorusGeometry(.065,.022,6,20),new THREE.MeshBasicMaterial({color:0xffffff,fog:false}));A.bague.rotation.x=Math.PI/2;A.bague.position.y=.17;A.prise.add(A.bague);}
    const led=M(box,Mt.diode,A.tete);led.scale.set(.05,.02,.02);led.position.set(0,.02,.075);
    return A;});
  BQT.v=[0,1,2,3,4,5,6,7,8,9,10,11].map(function(){return new THREE.Vector3();});BQT.q=new THREE.Quaternion();BQT.q2=new THREE.Quaternion();
  return g;}
/* un geste : s'il en restait un à moitié, sa pièce est posée tout de suite */
function bqOutil(k,mode,d,apply){const T=BQT.task;if(T&&!T.fait&&T.apply){T.fait=true;try{T.apply();}catch(e){}}
  if(!(GBQ.on&&GBQ.grp&&GBQ.grp.visible)){BQT.task=null;if(apply)apply();return;}
  garBqOutilBatit();BQT.task={k:k,mode:mode||'essai',d:d,apply:apply||null,fait:!apply,t:0,col:bqGesteCoul(k,d)||[1,.4,.8],f:0};
  try{if(SONV2){sfx('ui.feuille');GSON9=true;}}catch(e){}}
const BQT_T={monte:.24,va:.32,touche:.15,retour:.22,plie:.32,rentre:.26}; // la pièce est posée à 0,71 s du toucher
function bqOutilDuree(T){return T.k==='aile'?(T.mode==='essai'?.75:T.mode==='retire'?.55:.6):T.k==='peinture'?(T.mode==='serre'?.6:1.0):(T.mode==='serre'?.5:.5);}
function bqOutilTick(dt,t9,ay){const T=BQT.task;
  if(!T||!(GBQ.grp&&GBQ.grp.visible)){if(T&&!T.fait&&T.apply){T.fait=true;try{T.apply();}catch(e){}}BQT.task=null;if(BQT.g)BQT.g.visible=false;return;}
  const g=garBqOutilBatit(),V=BQT.v,hm=bqDessous(),bb=hm.bb,q=carGroup.quaternion,sc=carGroup.scale,p0=carGroup.position,r=BQG.r||(BQG.r=mulberry32(0x6E57));
  const L=function(x,y,z,out){return out.set(x*sc.x,y*sc.y,z*sc.z).applyQuaternion(q).add(p0);};
  const x0=bb?bb.min.x:-1,x1=bb?bb.max.x:1,y0=bb?bb.min.y:0,y1=bb?bb.max.y:1.3,z0=bb?bb.min.z:-2.2,z1=bb?bb.max.z:2.2,cx=(x0+x1)/2,cy=(y0+y1)/2,cz=(z0+z1)/2;
  const ySoc=ay+GBQ.socleH,up=V[0].set(0,1,0),ax=V[1].set(1,0,0).applyQuaternion(q),az=V[2].set(0,0,1).applyQuaternion(q),ss=function(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
  g.visible=true;g.position.set(0,0,0);BQT.railM.position.set(0,ySoc+.012,0);BQT.railM2.position.set(0,ySoc+.03,0);
  T.t+=dt;const t=T.t,D=bqOutilDuree(T),t1=BQT_T.monte,t2=t1+BQT_T.va,t3=t2+BQT_T.touche,t4=t3+D,t5=t4+BQT_T.retour,t6=t5+BQT_T.plie,t7=t6+BQT_T.rentre;
  if(t>=t3&&!T.fait){T.fait=true;try{if(T.apply)T.apply();}catch(e){}try{if(SONV2)sfx('ui.ok');}catch(e){}try{hap(6);}catch(e){}}
  const ta=Math.max(0,Math.min(1,(t-t3)/D)); // l'avancée du travail
  // les pots (traînée) : les plus à gauche et à droite
  let pots=null;if(T.k==='trainee'){pots=[];const P9=(typeof CAR_POTS!=='undefined'&&CAR_POTS.length)?CAR_POTS:null;
    if(P9){let a=P9[0],b=P9[0];for(const p of P9){if(p.x>a.x)a=p;if(p.x<b.x)b=p;}pots.push(a);if(Math.abs(a.x-b.x)>.25)pots.push(b);}else pots.push(new THREE.Vector3(cx,y0+.4,z0));}
  for(let i=0;i<2;i++){const A=BQT.bras[i],sg=i?-1:1,out=V[3].copy(ax).multiplyScalar(sg),C=V[4],P=V[5],off=V[6];let on=true,outil='pince',grip=0,spin=0,fant=false;
    // LA PIÈCE : où la toucher (C), dans quel sens pointer l'outil (P, vers la caisse), d'où l'approcher (off)
    if(T.k==='aile'){const piv=i?carWingR:carWingL,span=(x1-x0)*.6;if(piv){piv.getWorldPosition(C);}else L(cx+sg*(x1-x0)/2,cy,cz,C);
      let u=.15;if(T.mode==='essai')u=t<t3?.12:.12+span*(typeof wingT==='number'?wingT:1);else if(T.mode==='retire')u=span*.55;else u=.2;
      C.addScaledVector(out,u);P.copy(out).multiplyScalar(-1).addScaledVector(up,-.35).normalize();off.copy(out).multiplyScalar(.45).addScaledVector(up,.4);
      grip=t>=t3-.08?1:0;if(T.mode==='retire'&&t>=t3){const e=ss((t-t3)/D);C.addScaledVector(up,.55*e).addScaledVector(out,.35*e);fant=true;}
      if(T.mode==='serre'&&t>=t3&&t<t4)spin=ss(ta)*Math.PI*4;}
    else if(T.k==='peinture'){const zz=t<t3?z0-.05:z0-.05+(z1-z0+.1)*(T.mode==='serre'?.5:ss(ta));L(cx+sg*((x1-x0)/2+.5),cy+.05,zz,C);
      if(T.mode==='serre'&&t>=t3&&t<t4){const a9=ta*Math.PI*6;C.addScaledVector(az,Math.cos(a9)*.18).addScaledVector(up,Math.sin(a9)*.1);}
      outil='buse';P.copy(out).multiplyScalar(-1).normalize();off.copy(out).multiplyScalar(.4).addScaledVector(up,.3);
      if(t>=t3&&t<t4&&T.mode!=='serre'){const c9=T.mode==='retire'?[.93,.94,.97]:T.col;for(let n=0;n<4;n++){V[7].copy(P).multiplyScalar(2.6+r()*1.6).addScaledVector(az,(r()-.5)*.8).addScaledVector(up,(r()-.3)*.9);
        V[8].copy(C).addScaledVector(P,.24);bqPart(V[8].x,V[8].y,V[8].z,V[7].x,V[7].y,V[7].z,.28+r()*.18,.035+r()*.035,c9[0],c9[1],c9[2]);}}
      if(T.mode==='serre'&&t>=t3&&t<t4&&r()<.4){V[8].copy(C).addScaledVector(P,.3);bqPart(V[8].x,V[8].y,V[8].z,(r()-.5),r()*.8,(r()-.5),.4,.04,BQ_OR[0],BQ_OR[1],BQ_OR[2]);}}
    else{ // la traînée
      if(!pots||i>=pots.length)on=false;else{const pt=pots[i];L(pt.x,pt.y,pt.z,C);const back=V[7].copy(az).multiplyScalar(-1);C.addScaledVector(back,.06);
        outil='prise';P.copy(az).normalize();off.copy(back).multiplyScalar(.5).addScaledVector(up,.3).addScaledVector(out,.15);
        if(T.mode==='retire'&&t>=t3){const e=ss((t-t3)/D);C.addScaledVector(back,.4*e).addScaledVector(up,.4*e);}
        if(T.mode==='serre'&&t>=t3&&t<t4)spin=ss(ta)*Math.PI*3;
        const c9=T.col;const pu=t>=t3&&t<t4&&T.mode!=='retire'?.6+.4*Math.sin(t*28):.35;A.bague.material.color.setRGB(c9[0]*pu,c9[1]*pu,c9[2]*pu);
        if(T.mode==='essai'&&i===0&&t>=t4&&!(T.f&1)){T.f|=1;for(const pp of pots){L(pp.x,pp.y,pp.z,V[8]);for(let n=0;n<34;n++){V[9].copy(back).multiplyScalar(2.4+r()*2.4).addScaledVector(up,(r()-.4)*.9).addScaledVector(ax,(r()-.5)*.9);
          bqPart(V[8].x,V[8].y,V[8].z,V[9].x,V[9].y,V[9].z,.5+r()*.45,.045+r()*.05,c9[0],c9[1],c9[2]);}}}}}
    if(!on){A.on=false;for(const k9 of ['chariot','tour','epaule','bras','verin','coude','avant','tige','poignet'])A[k9].visible=false;A.tete.visible=false;continue;}
    // LE CHARIOT glisse sur le rail jusque sous la pièce
    const phiC=Math.atan2(C.x,C.z);if(!A.on){A.phi=phiC;A.on=true;}let dphi=phiC-A.phi;dphi=Math.atan2(Math.sin(dphi),Math.cos(dphi));A.phi+=dphi*Math.min(1,dt*7);
    const mo=t<t1?ss(t/t1):t>t6?1-ss((t-t6)/BQT_T.rentre):1,yB=ySoc-(1-mo)*1.1,bx=Math.sin(A.phi)*BQT.rail,bz=Math.cos(A.phi)*BQT.rail;
    const S=V[8].set(bx,yB+BQT.hB,bz),rad=V[9].set(Math.sin(A.phi),0,Math.cos(A.phi)),W=V[10],F=V[11].copy(S).addScaledVector(rad,.3).add(V[7].set(0,.6,0)); // F : replié
    if(t<t1)W.copy(F);else if(t<t2)W.copy(F).lerp(V[7].copy(C).add(off),ss((t-t1)/BQT_T.va));else if(t<t3)W.copy(C).add(off).lerp(C,ss((t-t2)/BQT_T.touche));
    else if(t<t4)W.copy(C);else if(t<t5)W.copy(C).addScaledVector(off,ss((t-t4)/BQT_T.retour));else if(t<t6)W.copy(C).add(off).lerp(F,ss((t-t5)/BQT_T.plie));else W.copy(F);
    W.addScaledVector(P,-.2); // le poignet, en retrait de l'outil
    A.chariot.position.set(bx,yB+.05,bz);A.chariot.rotation.set(0,A.phi,0);A.chariot.scale.set(.42,.12,.32);
    A.tour.position.set(bx,yB+BQT.hB*.55,bz);A.tour.quaternion.identity();A.tour.scale.set(.2,BQT.hB*.9,.2);A.epaule.position.copy(S);A.epaule.scale.setScalar(.17);
    // deux segments : le coude en haut et vers l'extérieur
    const Dv=V[3].subVectors(W,S);let d=Dv.length();const L1=BQT.L1;let L2=BQT.L2;if(d<1e-4){d=1e-4;Dv.set(0,1e-4,0);}Dv.multiplyScalar(1/d);
    const n=V[4].copy(rad).multiplyScalar(.45).add(V[7].set(0,1,0));n.addScaledVector(Dv,-n.dot(Dv));if(n.lengthSq()<1e-5)n.set(0,1,0).addScaledVector(Dv,-Dv.y);n.normalize();
    let a1=0;if(d>=L1+L2)L2=d-L1;else{const c=(L1*L1+d*d-L2*L2)/(2*L1*d);a1=Math.acos(Math.max(-1,Math.min(1,c)));}
    const E=V[6].copy(S).addScaledVector(Dv,Math.cos(a1)*L1).addScaledVector(n,Math.sin(a1)*L1);
    bqSeg(A.bras,S,E,.12);{const p1=V[7].copy(S).addScaledVector(n,.18).addScaledVector(Dv,.06),p2=V[9].lerpVectors(S,E,.62).addScaledVector(n,.14);bqSeg(A.verin,p1,p2,.045);}
    A.coude.position.copy(E);{const axe=V[7].crossVectors(Dv,n).normalize();A.coude.quaternion.setFromUnitVectors(bqSeg._y||(bqSeg._y=new THREE.Vector3(0,1,0)),axe);}A.coude.scale.set(.15,.3,.15);
    {const f=V[9].subVectors(W,E),Lf=f.length();f.multiplyScalar(1/Math.max(1e-5,Lf));const m1=V[7].copy(E).addScaledVector(f,Math.min(Lf,BQT.L2*.6));bqSeg(A.avant,E,m1,.1);
     const m2=V[3].copy(E).addScaledVector(f,Math.min(Lf,BQT.L2*.42));bqSeg(A.tige,m2,W,.055);}
    A.poignet.position.copy(W);A.poignet.scale.setScalar(.11);
    // l'outil, au bout, pointé sur la pièce (et qui tourne pour le tour de clé)
    A.tete.visible=true;A.tete.position.copy(W);A.tete.scale.setScalar(1.35);BQT.q.setFromUnitVectors(bqSeg._y,P);BQT.q2.setFromAxisAngle(P,spin);A.tete.quaternion.copy(BQT.q).premultiply(BQT.q2);
    A.pince.visible=outil==='pince';A.buse.visible=outil==='buse';A.prise.visible=outil==='prise';
    if(outil==='pince'){A.doigts[0].position.x=-.07+.03*grip;A.doigts[1].position.x=.07-.03*grip;A.fant.visible=fant;}
    for(const k9 of ['chariot','tour','epaule','bras','verin','coude','avant','tige','poignet'])A[k9].visible=true;
    if(spin>0&&r()<.35){V[7].copy(W).addScaledVector(P,.3);bqPart(V[7].x,V[7].y,V[7].z,(r()-.5)*1.2,.4+r()*.8,(r()-.5)*1.2,.35+r()*.3,.035+r()*.03,BQ_OR[0],BQ_OR[1],BQ_OR[2]);}}
  if(t>=t7){BQT.task=null;g.visible=false;}}
function garBqLumiere(){if(!GBQ.on)return; // la lumière du magasin : blanche, sans le contre-jour du feu
  stallKey.color.setHex(0xffffff);stallKey.intensity=1.45;stallKey.distance=30;stallRim.color.setHex(0xe8eef5);stallRim.intensity=.7;stallRim.distance=30;}
/* LE DOIGT SUR LA SCÈNE tourne la caisse (le garage ne reçoit plus le glissé : pris en capture) */
/* (2026-10-13, Léo : « inverse le sens : quand on tire la voiture vers le bas, ça tire l'endroit qu'on appuie vers le bas », puis « en tirant
   le côté de la voiture vers le bas, on peut la pivoter, le capot vers nous ») LA PRISE : la caisse se comporte comme un objet qu'on SAISIT.
   Au pointerdown, un rayon de la caméra trouve le POINT touché sur la carrosserie ; tirer vers le bas fait tourner la caisse autour de son
   centre dans le sens qui fait descendre CE point (axe = bras × bas de l'écran), ramené sur ses deux axes : le TANGAGE (axe des roues :
   saisie par le nez ou la poupe, ce bout-là descend) et le ROULIS (axe long : saisie par le flanc, le flanc descend et le dessus — capot,
   toit — bascule vers nous). Les deux reviennent en ressort. Rien sous le doigt : le côté le plus proche du nez ou de la poupe, à l'écran. */
function bqPrise(e){const R={kp:1,kr:0,sur:false};try{
  const cv=renderer.domElement.getBoundingClientRect(),T=bqPrise._t||(bqPrise._t={rc:new THREE.Raycaster(),m:new THREE.Vector2(),c:new THREE.Vector3(),r:new THREE.Vector3(),d:new THREE.Vector3(),a:new THREE.Vector3(),q:new THREE.Quaternion(),Y:new THREE.Vector3(0,1,0),v:[new THREE.Vector3(),new THREE.Vector3()]});
  carGroup.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  T.c.set(0,.55,0);carGroup.localToWorld(T.c);                                   // son centre (la boîte englobante ramassait halos et lueurs, à 5 m)
  T.m.set((e.clientX-cv.left)/cv.width*2-1,-((e.clientY-cv.top)/cv.height)*2+1);T.rc.setFromCamera(T.m,camera);
  const H9=T.rc.intersectObject(carGroup,true),hit=H9.find(function(h){const mt=Array.isArray(h.object.material)?h.object.material[0]:h.object.material;return h.object.visible&&!(mt&&mt.transparent&&mt.opacity<.2);});
  R.sur=H9.some(bqPlein); // (2026-10-15, LA POSE TENUE) le doigt est-il SUR la caisse ? (sa carrosserie, ses vitres, ses roues — pas ses halos)
  if(hit){
    carGroup.getWorldQuaternion(T.q).invert();                                      // dans le repère de la caisse (⚠ pas rotation.y : relu d'un quaternion penché, l'Euler bascule de 180°)
    T.r.copy(hit.point).sub(T.c).applyQuaternion(T.q);T.d.set(0,-1,0).applyQuaternion(camera.quaternion).applyQuaternion(T.q);
    T.a.crossVectors(T.r,T.d);const n=Math.hypot(T.a.x,T.a.z);
    if(n>.05){R.kp=T.a.x/n;R.kr=T.a.z/n;return R;}}
  // rien sous le doigt (ou pile au-dessus du centre) : le bout le plus proche, à l'écran
  const V=T.v;V[0].set(0,.5,0);carGroup.localToWorld(V[0]);V[1].set(0,.5,1.6);carGroup.localToWorld(V[1]);V[0].project(camera);V[1].project(camera);
  const mx=(V[0].x+1)/2*cv.width+cv.left,my=(1-V[0].y)/2*cv.height+cv.top,nx=(V[1].x+1)/2*cv.width+cv.left-mx,ny=(1-V[1].y)/2*cv.height+cv.top-my;
  if(nx*nx+ny*ny>=400)R.kp=((e.clientX-mx)*nx+(e.clientY-my)*ny)>=0?1:-1;}catch(er){}
  return R;}
/* une pièce PLEINE de la caisse, vraiment montrée (le Raycaster de three ne regarde pas `visible` des parents) : ni halo additif, ni lueur
   presque transparente, ni ombre posée au sol */
function bqPlein(h){const o=h.object,mt=Array.isArray(o.material)?o.material[0]:o.material;
  if(!mt||mt.blending===THREE.AdditiveBlending||(mt.transparent&&mt.opacity<.2)||(o.userData&&o.userData.sol))return false;
  for(let q9=o;q9&&q9!==carGroup;q9=q9.parent)if(!q9.visible)return false;return true;}
window.dbgSonde=(function(ql){return function(x0,y0,x1,y1,st){if(arguments.length<4)return ql(x0); // (2026-10-14) DEUX bancs portaient ce nom : celui-ci écrasait la SONDE de la règle de qualité (dbgSonde(), dbgSonde(1), dbgSonde('sync')) — moins de quatre arguments, c'est elle
  st=st||4;const cv=renderer.domElement.getBoundingClientRect(),rc=new THREE.Raycaster(),m=new THREE.Vector2(),out={};carGroup.updateMatrixWorld(true); // (banc, 13/10) ce que la caméra voit de la caisse dans un rectangle de l'écran : matière (famille) et couleur de facette, avec quelques points
  for(let y=y0;y<y1;y+=st)for(let x=x0;x<x1;x+=st){m.set((x-cv.left)/cv.width*2-1,-((y-cv.top)/cv.height)*2+1);rc.setFromCamera(m,camera);const vu=function(o){for(;o;o=o.parent)if(!o.visible)return false;return true;},h=rc.intersectObject(carGroup,true).find(function(x){return vu(x.object);});if(!h)continue; // (le Raycaster de three ne regarde pas `visible`)
    const mt=Array.isArray(h.object.material)?h.object.material[0]:h.object.material,g=(mt&&mt.userData&&mt.userData.g)||(mt&&mt.type)||'?';let col='';const ca=h.object.geometry&&h.object.geometry.attributes.color;
    if(ca&&h.face){const i=h.face.a;col=[ca.getX(i),ca.getY(i),ca.getZ(i)].map(function(v){return Math.round(Math.min(1,v)*255).toString(16).padStart(2,'0');}).join('');}
    const lp=carGroup.worldToLocal(h.point.clone()),k=g+':'+col;out[k]=out[k]||{n:0,p:[]};out[k].n++;if(out[k].p.length<5)out[k].p.push([x,y,+lp.x.toFixed(2),+lp.y.toFixed(2),+lp.z.toFixed(2)]);}
  return out;};})(window.dbgSonde);
window.dbgBqVoir=function(i){if(!GBQ.on)return 'boutique fermée';bqEssaie('v:'+(i|0));return CARS[i|0]&&CARS[i|0].name;}; // (banc) pose la caisse i sur le plateau de la boutique
/* ===== L'OMBRE DE LA CAISSE QUI SAUTE (2026-10-23, Léo : « il y a une ombre plate qui suit la voiture pendant que ça saute, ce qui n'est pas réaliste ») =====
   Au GARAGE, l'ombre de contact (`contactShadow`, rendu/triptyque-bloom.js) était posée SOUS la caisse (sa position + sa normale) : pendant une
   figure elle montait avec elle, à plat, et basculait avec son assiette — une feuille noire collée au ventre (MESURÉ au banc : elle suivait
   l'origine de la caisse à 1,8 m, même taille, même noirceur). En BOUTIQUE, `GBQ.omb` restait au sol, mais aussi noire et aussi large à 1,7 m
   de haut. Désormais l'empreinte reste SUR LE PLATEAU, sous le centre de la caisse, tournée au CAP (jamais à l'assiette), et elle suit la HAUTEUR
   du point le plus bas : plus la caisse monte, plus l'ombre s'étale et s'éclaircit ; son emprise est celle de la boîte de la caisse vue d'en haut
   (un salto la raccourcit, un tonneau l'étrécit) ; les quatre appuis des roues disparaissent dès qu'elles décollent (texture « air »). Au
   repos, rien ne change : c'est exactement l'ancienne ombre. `figOmbre()` tourne à chaque image du garage (garFigTick), après la pose de la
   caisse ; `figOmbre.O` garde le résultat (lu par updateContactShadow). Banc : `dbgFigOmbre()`. */
function figBoite(force){ // la boîte des pièces pleines de la caisse (repère caisse), relevée par caisse (`userData.gen`, posé par buildCar) et rafraîchie toutes les 1,5 s
  const g=carGroup.userData.gen||0,now=performance.now(),B=figBoite._b||(figBoite._b={g:-1,t:0,ok:false,min:new THREE.Vector3(),max:new THREE.Vector3()});
  if(!force&&B.g===g&&(B.ok?now-B.t<1500:now-B.t<400))return B.ok?B:null; // une caisse encore vide : on ne réessaie pas à chaque image
  B.g=g;B.t=now;
  const inv=figBoite._i||(figBoite._i=new THREE.Matrix4()),M=figBoite._m||(figBoite._m=new THREE.Matrix4()),bb=figBoite._bb||(figBoite._bb=new THREE.Box3()),b9=figBoite._b9||(figBoite._b9=new THREE.Box3());
  carGroup.updateMatrixWorld(true);inv.copy(carGroup.matrixWorld).invert();bb.makeEmpty();
  carGroup.traverse(function(o){if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;const mt=Array.isArray(o.material)?o.material[0]:o.material;
    if((mt&&(mt.transparent||mt.blending===THREE.AdditiveBlending))||(o.userData&&o.userData.sol))return; // ni halos, ni flaques, ni flammes : la tôle et les roues
    for(let q=o;q&&q!==carGroup;q=q.parent)if(!q.visible||q===carWingL||q===carWingR)return; // ni l'invisible, ni les AILES de la boutique (dépliées à 2,5 m à la construction, repliées ensuite)
    if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();M.multiplyMatrices(inv,o.matrixWorld);b9.copy(o.geometry.boundingBox).applyMatrix4(M);bb.union(b9);});
  if(bb.isEmpty()){B.ok=false;return null;}
  B.min.copy(bb.min);B.max.copy(bb.max);B.ok=true;return B;}
function figOmbre(){ // chaque image du garage, après la pose de la caisse : où est son empreinte sur le plateau, et à quelle hauteur elle flotte
  const O=figOmbre.O||(figOmbre.O={on:false,t:0,x:0,z:0,h:0,hAir:0,kx:1,kz:1,psi:0,solY:0,v:new THREE.Vector3(),a:new THREE.Vector3(),b:new THREE.Vector3(),c:new THREE.Vector3()});
  O.on=false;if(!garageOn||!carGroup||!carGroup.visible)return O;
  const B=figBoite();if(!B)return O;
  const q=carGroup.quaternion,s=carGroup.scale,p=carGroup.position,ax=O.a.set(1,0,0).applyQuaternion(q),ay=O.b.set(0,1,0).applyQuaternion(q),az=O.c.set(0,0,1).applyQuaternion(q), /* x = sa gauche · y = son toit · z = son nez */
    hx=(B.max.x-B.min.x)*.5*Math.abs(s.x),hy=(B.max.y-B.min.y)*.5*Math.abs(s.y),hz=(B.max.z-B.min.z)*.5*Math.abs(s.z),
    v=O.v.set((B.min.x+B.max.x)*.5*s.x,(B.min.y+B.max.y)*.5*s.y,(B.min.z+B.max.z)*.5*s.z).applyQuaternion(q), /* le centre de la boîte, dans la salle */
    cx=p.x+v.x,cy=p.y+v.y,cz=p.z+v.z,
    bas=cy-(hx*Math.abs(ax.y)+hy*Math.abs(ay.y)+hz*Math.abs(az.y)), /* son point le plus bas (fonction d'appui de la boîte) */
    sol0=GARAGE_Y+GAR.POD+B.min.y*Math.abs(s.y); /* le dessous de la caisse AU REPOS, sur le plateau */
  O.solY=GARAGE_Y+GAR.POD;O.hBas=bas-sol0;O.h=Math.max(0,cy-(sol0+hy)); /* la hauteur de son CENTRE au-dessus de sa place de repos : en plein salto le point le plus bas dépasse sous le plateau, l'ombre, elle, doit rester au sol et s'éclaircir avec l'altitude */
  const fh=Math.hypot(az.x,az.z),lh=Math.hypot(ax.x,ax.z);O.psi=fh>=lh?Math.atan2(az.x,az.z):Math.atan2(-ax.z,ax.x); /* le cap : l'axe du nez, ou celui du côté quand le nez pointe en l'air (l'empreinte est la même à 180° près) */
  const sn=Math.sin(O.psi),cs=Math.cos(O.psi), /* le nez (sn,cs) et le côté (cs,−sn), sur le plateau */
    ex=hx*Math.abs(ax.x*cs-ax.z*sn)+hy*Math.abs(ay.x*cs-ay.z*sn)+hz*Math.abs(az.x*cs-az.z*sn), /* la demi-largeur de la boîte vue d'en haut… */
    ez=hx*Math.abs(ax.x*sn+ax.z*cs)+hy*Math.abs(ay.x*sn+ay.z*cs)+hz*Math.abs(az.x*sn+az.z*cs); /* …et sa demi-longueur */
  O.kx=THREE.MathUtils.clamp(ex/Math.max(.1,hx),.35,1.25);O.kz=THREE.MathUtils.clamp(ez/Math.max(.1,hz),.35,1.25);
  O.x=cx;O.z=cz;O.t=performance.now();O.on=true;
  if(typeof GBQ!=='undefined'&&GBQ.on&&GBQ.omb&&GBQ.grp&&GBQ.grp.visible){ // BOUTIQUE : le disque d'ombre au sol (GBQ.omb) suit la hauteur de ce qui monte AU-DESSUS de sa lévitation (la sienne, c'est `fl`, voir garBqIndus)
    const o=GBQ.omb,air=Math.max(0,O.h-((GBQ.lev||0)+(GBQ.levB||0)+(GBQ.leve||0)));O.hAir=air;
    if(air>.02){const fl=Math.max(0,Math.min(1,(GBQ.lev||0)/.95)),th=GBQ.grp.rotation.y,dx=cx-GBQ.grp.position.x,dz=cz-GBQ.grp.position.z,sc=(4.2-.9*fl)*Math.sqrt(O.kx*O.kz)*(1+.1*Math.min(air,2));
      o.position.x=dx*Math.cos(th)-dz*Math.sin(th);o.position.z=dx*Math.sin(th)+dz*Math.cos(th);o.scale.set(sc,sc,1);o.material.opacity=(.42-.12*fl)/(1+1.5*air);}
    else{o.position.x=0;o.position.z=0;}}
  else O.hAir=O.h;
  return O;}
window.dbgFigOmbre=function(){const O=figOmbre.O;return O&&{on:O.on,h:+O.h.toFixed(3),bas:+O.hBas.toFixed(3),hAir:+O.hAir.toFixed(3),kx:+O.kx.toFixed(2),kz:+O.kz.toFixed(2),psi:+O.psi.toFixed(2),x:+O.x.toFixed(2),z:+O.z.toFixed(2),solY:+O.solY.toFixed(3),gen:figBoite._b&&figBoite._b.g,boite:figBoite._b&&figBoite._b.ok?[figBoite._b.min.x,figBoite._b.min.y,figBoite._b.min.z,figBoite._b.max.x,figBoite._b.max.y,figBoite._b.max.z].map(function(v){return +v.toFixed(2);}):null};}; // (banc) où l'ombre de la caisse se pose
/* ===== LA FIGURE AU GARAGE : UN VRAI SAUT (2026-10-23, Léo : « travailler la physique des tricks dans le garage, ainsi que dans la boutique… et peut-être, quand la voiture atterrit, un petit effet ») =====
   MESURÉ au banc (salto arrière, `dbgFigEssai('saltoa')`, horloge du jeu) : la caisse faisait son tour sur place PENDANT qu'elle montait de 1,5 m en sinus —
   la rotation, elle, partait à pleine vitesse dès la 1re image : à 0,17 s le nez était à 105° et le BAS de la caisse à −1,5 m, sous le plateau (la poupe
   traversait le plateau, puis le sol de l'atelier, pendant ~0,3 s). Et elle se posait sans rien : arrêt net à 3,3 m/s, ni ressort, ni poussière, ni son.
   Désormais la figure est un PLAN calculé au lancement (`figPlan`), joué à l'horloge du jeu (`figSaut`) :
   · LA ROTATION vient du même moteur (`FIG.Corps`, celui de la course), jouée d'avance par un Corps jetable et relevée à 60 Hz — la figure est la même ;
   · LE SAUT est une vraie PARABOLE (hauteur, durée et gravité tirées du plan, gravité entre `FIG_SAUT.gMin` et `gMax`), précédée d'un petit ACCROUPI (la suspension se tasse 0,1 s) ;
   · LE GOUVERNEUR : la rotation n'avance que si la caisse est assez HAUTE pour qu'aucun coin de sa boîte (pièces pleines, roues comprises) ne passe sous le
     plateau — au décollage elle monte d'abord, puis tourne ; le saut choisi est le meilleur compromis court / pas trop haut (T + 0,3 h, durées 1,2 → 3,3 s,
     hauteurs 1,3 → 2,4 m) qui laisse finir la figure avant la pose : une grande caisse ou un grand salto monte plus haut et plus longtemps. Le pivot est le centre
     de masse de la caisse. Un filet de sécurité relève la caisse de ce qui manque encore (jamais sous le plateau) ;
   · L'ATTERRISSAGE : la carrosserie encaisse sur ses roues (ressort amorti, 8 cm au plus), un nuage de poussière en pixels à chaque roue + l'anneau de fumée du garage,
     quelques étincelles si le choc est dur, le son de pose (`pose.nette`), un tic dans le pouce, et l'anneau du plateau qui s'allume (`GFIG.pulse`).
   Les figures À PLAT (tail whip, toupie : `GFIG.plat`) restent posées, avec leur gomme, comme avant. Banc : `dbgFigEssai`, `dbgFigEtat`, `dbgFigGel`, `dbgFigPlan` ; `?saut=ancien` rend l'ancien saut (un sinus de 1,5 m, la rotation à pleine vitesse dès la 1re image) pour comparer. */
const FIG_SAUT={on:!/[?&]saut=ancien\b/.test(location.search),gMin:1.8,gMax:9.5,tA:.1,tRec:.5,hMin:1.3,hMax:2.4,marge:.08,tPose:.12,accroupi:.055,ressort:{w:38,z:.3}}; /* gMin, gMax : la gravité du saut, tirée entre ces bornes (m/s²) · tA : l'accroupi · tRec : le temps du ressort après la pose · tPose : la figure finit au moins tPose avant de toucher */
function figPlan(f,plat){ // la figure `f` (déjà orientée) sur la caisse du plateau : la rotation relevée à 60 Hz, le saut qui la laisse passer, les instants
  const K=FIG_SAUT,B=figBoite(true)||{min:{x:-1,y:0,z:-2.2},max:{x:1,y:1.4,z:2.2}},hc=B.min.y+.45*(B.max.y-B.min.y), /* le pivot : son centre de masse, un peu sous le milieu de la boîte (avant : la moitié de la fiche `h`, trop bas — le toit balayait un grand cercle) */
    cs=[],ph0=hc-B.min.y; /* ph0 : la hauteur du pivot au-dessus du dessous de la caisse, au repos */
  for(const x of [B.min.x,B.max.x])for(const y of [B.min.y,B.max.y])for(const z of [B.min.z,B.max.z])cs.push(x,y-hc,z); /* les huit coins de la boîte, dans le repère du pivot */
  const C=new FIG.Corps(),Q=[],AN=[],NEED=[];C.lance(f,1,f.D*1.2);C.evts.length=0;
  const pousse=function(){const q=C.q,x=q[0],y=q[1],z=q[2],w=q[3],r0=2*(x*y+w*z),r1=1-2*(x*x+z*z),r2=2*(y*z-w*x);let mn=1e9; /* la ligne y de la matrice : la hauteur de chaque coin tourné */
    for(let k=0;k<24;k+=3){const v=r0*cs[k]+r1*cs[k+1]+r2*cs[k+2];if(v<mn)mn=v;}
    Q.push(x,y,z,w);AN.push(C.ecart());NEED.push(Math.max(0,-mn-ph0));}; /* NEED : de combien le pivot doit monter pour que le coin le plus bas reste sur le plateau */
  pousse();
  const Dref=f.D*1.2*(FIG.PHY.elan?1:1/.85)+.6; /* le temps que le garage lui donnait pour finir (le budget du Corps vivant) : sans lui un battement (shimmy) sonne 3 s */
  for(let i=1;i<260;i++){C.budget=Math.max(0,Dref-i/60);C.poseK=i/60>f.D*1.2?1:0;C.tick(1/120);C.tick(1/120);pousse();if(i>6&&C.occupe()===0&&C.ecart()<.02&&Math.hypot(C.w[0],C.w[1],C.w[2])<.3)break;} /* jusqu'au planté, jamais plus de 4 s */
  Q.push(0,0,0,1);AN.push(0);NEED.push(0);const N=Q.length/4;
  if(plat){const nR=N-1,QR=new Float32Array((N+1)*4);QR.set(Q);QR[N*4+3]=1;return {plat:true,vol:false,hc:hc,h:0,T:0,g:0,v0:0,tA:0,tRec:0,nR:nR,QR:QR,D:nR/60+.15,B:B,cs:cs,ph0:ph0};}
  const gouverne=function(h,T,force){const nR=Math.ceil(T*60),JJ=new Int32Array(nR+1),iF=force?nR-Math.round(K.tPose*60)-(N-1):1e9;let j=0,iFin=-1; /* iF : en dernier recours elle finit à l'heure, quoi qu'il arrive */
      for(let i=1;i<=nR;i++){const u=Math.min(1,i/60/T),p=4*h*u*(1-u); /* la levée de la parabole à cet instant */
        if(j<N-1&&(i>=iF||NEED[j+1]+K.marge*Math.min(1,AN[j+1]/.3)<=p))j++; /* l'image de rotation suivante n'est jouée que si la caisse est assez haute pour elle */
        JJ[i]=j;if(j>=N-1&&iFin<0)iFin=i;}
      return {JJ:JJ,nR:nR,iFin:iFin};},
    fini=function(g,T){return g.iFin>=0&&g.iFin<=Math.floor((T-K.tPose)*60);};
  let h=K.hMax,T=3.3,gv=null,ok=false,J=1e9; /* le meilleur saut : T + ,3 h le plus petit — court ET pas trop haut — parmi les durées (1,2 → 3,3 s) et les hauteurs (1,3 → 2,4 m) dont la gravité reste dans [gMin, gMax] et qui laissent finir la figure */
  for(let Tc=1.2;Tc<=3.31;Tc+=.05)for(let hh=K.hMin;hh<=K.hMax+1e-6;hh+=.1){const g=8*hh/(Tc*Tc);if(g>K.gMax||g<K.gMin||Tc+.3*hh>=J)continue;
    const g2=gouverne(hh,Tc,false);if(fini(g2,Tc)){ok=true;J=Tc+.3*hh;h=+hh.toFixed(2);T=+Tc.toFixed(2);gv=g2;}}
  if(!ok){h=K.hMax;T=2.2;gv=gouverne(h,T,true);} /* dernier recours (une limousine de 6 m ne fait pas un salto dans un atelier de 6 m de haut) : la figure finit à l'heure, le filet relève la caisse de ce qui manque */
  const nR=gv.nR,QR=new Float32Array((nR+2)*4);
  for(let i=0;i<=nR;i++){const j=gv.JJ[i]*4;QR[i*4]=Q[j];QR[i*4+1]=Q[j+1];QR[i*4+2]=Q[j+2];QR[i*4+3]=Q[j+3];}
  QR[(nR+1)*4+3]=1;
  return {plat:false,vol:true,hc:hc,h:h,T:T,g:8*h/(T*T),v0:4*h/T,tA:K.tA,tRec:K.tRec,nR:nR,QR:QR,D:K.tA+T+K.tRec,B:B,cs:cs,ph0:ph0,iFin:gv.iFin,sur:ok,N:N};}
function figSautRaz(){ // la carrosserie reprend sa place sur les roues (fin de la figure, nouvelle figure, garage quitté)
  if(GFIG.corps9){GFIG.corps9=false;if(!BURN.corps){carBody.position.y=0;carBody.rotation.x=0;}}
}
function figSaut(dt){ // une image de la figure : rend vrai tant qu'elle joue (appelée par garFigPas, juste après la pose de la caisse sur le plateau)
  const P=GFIG.pl;if(!P)return false;
  const now=performance.now();if(now-(GFIG.vu||0)>700&&GFIG.vu){GFIG.pl=null;GFIG.D=0;figSautRaz();GFIG.vu=0;return false;} /* le garage était fermé (une course, un autre écran) : la figure d'avant ne reprend pas au milieu de son saut */
  GFIG.vu=now;
  let d9=Math.min(dt,.05);if(GFIG.gel!=null)d9=Math.max(0,Math.min(d9,GFIG.gel-GFIG.t));
  GFIG.t+=d9;const t=GFIG.t,tv=t-P.tA;
  let lift=0,corps=0,x;
  if(P.vol){
    if(t<P.tA){corps=FIG_SAUT.accroupi*Math.sin(Math.PI*t/P.tA);x=0;} /* l'accroupi : la carrosserie se tasse sur ses roues, puis part */
    else if(tv<P.T){lift=P.v0*tv-.5*P.g*tv*tv;x=tv*60;if(!P.lance){P.lance=true;try{figDecolle(P);}catch(e){}}}
    else{x=1e9;if(!P.atterri){P.atterri=true;try{figAtterrit(P);}catch(e){}}
      const ta=tv-P.T,R=FIG_SAUT.ressort,wd=R.w*Math.sqrt(1-R.z*R.z),tp=Math.atan2(wd,R.z*R.w)/wd, /* le 1er creux du ressort amorti */
        pic=Math.exp(-R.z*R.w*tp)*Math.sin(wd*tp);
      corps=(P.encaisse||0)*Math.exp(-R.z*R.w*ta)*Math.sin(wd*ta)/pic;}} /* encaisse : de combien la carrosserie s'enfonce au plus (m) ; le ressort la fait remonter au-dessus de sa place (corps < 0), puis se poser */
  else x=t*60;
  // l'assiette : l'image de la rotation jouée à cet instant (interpolée), appliquée AUTOUR DU PIVOT comme avant
  const QR=P.QR,i0=Math.min(P.nR+1,Math.max(0,Math.floor(x))),i1=Math.min(P.nR+1,i0+1),fr=Math.max(0,Math.min(1,x-i0)),a=i0*4,b=i1*4;
  let qx=QR[a],qy=QR[a+1],qz=QR[a+2],qw=QR[a+3];const bx=QR[b],by=QR[b+1],bz=QR[b+2],bw=QR[b+3];
  if(fr>0){const sg=qx*bx+qy*by+qz*bz+qw*bw<0?-1:1;qx+=(sg*bx-qx)*fr;qy+=(sg*by-qy)*fr;qz+=(sg*bz-qz)*fr;qw+=(sg*bw-qw)*fr;const n=1/Math.hypot(qx,qy,qz,qw);qx*=n;qy*=n;qz*=n;qw*=n;}
  const hc=P.hc,y0=carGroup.position.y;
  VEQ.pv.set(0,hc,0).applyQuaternion(carGroup.quaternion);VEQ.qr.set(qx,qy,qz,qw);carGroup.quaternion.multiply(VEQ.qr);
  VEQ.pv2.set(0,hc,0).applyQuaternion(carGroup.quaternion);carGroup.position.add(VEQ.pv).sub(VEQ.pv2);carGroup.position.y+=lift;
  // le filet : aucun coin de la boîte ne passe sous le plateau (le plan l'évite ; ceci rattrape ce qui manque, d'un coup, sans à-coup visible)
  if(P.vol){const q=carGroup.quaternion,r0=2*(q.x*q.y+q.w*q.z),r1=1-2*(q.x*q.x+q.z*q.z),r2=2*(q.y*q.z-q.w*q.x),cs=P.cs;let mn=1e9;
    for(let k=0;k<24;k+=3){const v=r0*cs[k]+r1*cs[k+1]+r2*cs[k+2];if(v<mn)mn=v;}
    const manque=(y0+P.B.min.y)-(carGroup.position.y+hc*r1+mn);if(manque>.002){carGroup.position.y+=manque;P.filet=Math.max(P.filet||0,manque);}} /* y0 + min.y : le dessous au repos, sur le plateau ; position.y + hc·r1 : le pivot dans la salle ; + mn : son coin le plus bas */
  if(corps!==0||GFIG.corps9){carBody.position.y=-corps;GFIG.corps9=corps!==0;if(!GFIG.corps9)carBody.position.y=0;}
  if(P.plat)try{garFigGomme(d9,true);}catch(e){}
  if(t>=P.D){GFIG.pl=null;GFIG.D=0;figSautRaz();}
  return true;}
function figRoues(){ // le point de contact de chaque roue, dans la salle (repli : les quatre coins du dessous)
  const L=[],v=new THREE.Vector3();carGroup.updateMatrixWorld(true);
  for(const w of wheels){if(!w||!w.position||!w.parent)continue;v.set(w.position.x,w.position.y-(w.userData.R||.4)+.06,w.position.z);carGroup.localToWorld(v);L.push(v.x,v.y,v.z);}
  if(L.length<6){const B=figBoite();if(B)for(const sx of [B.min.x*.8,B.max.x*.8])for(const sz of [B.min.z*.75,B.max.z*.75]){v.set(sx,B.min.y+.1,sz);carGroup.localToWorld(v);L.push(v.x,v.y,v.z);}}
  return L;}
function figPoussiere(k,fort){ // un nuage de poussière en pixels à chaque roue (la fumée du burn-out : mêmes réservoirs, même style) — k : l'intensité (0,5 à 1,3)
  if(!BURN.fum)return;const L=figRoues(),c=carGroup.position,n=L.length/3;if(!n)return;
  for(let i=0;i<L.length;i+=3){const dx=L[i]-c.x,dz=L[i+2]-c.z,d=Math.hypot(dx,dz)||1,ox=dx/d,oz=dz/d,m=Math.round((fort?5:3)+3*k);
    for(let j=0;j<m;j++){const v=(.9+Math.random()*2.2)*k*(fort?1:.6),tg=(Math.random()-.5)*1.6;
      burnEmet(BURN.fum,L[i]+ox*.15,L[i+1]+.06,L[i+2]+oz*.15,(ox-oz*tg)*v,.25+Math.random()*(.5+.5*k),(oz+ox*tg)*v,1.6+Math.random()*1.2,.3+Math.random()*.2,.9+.5*k+Math.random()*.4,.2+Math.random()*.12,.86,.85,.93);}}}
function figAnneau(k){ // l'anneau de fumée qui s'ouvre autour de la caisse à la pose (celui du burn-out, mais à SON rayon et qui ne dure pas 4 s)
  const F=BURN.fum;if(!F)return;const c=carGroup.position,N=Math.round(10+8*k),R=garGabarit().R*.62;
  for(let i=0;i<N;i++){const a=(i+Math.random()*.4)/N*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),v=(1.8+Math.random()*1)*k;
    burnEmet(F,c.x+ca*R,GARAGE_Y+.3,c.z+sa*R,ca*v,.12+Math.random()*.3,sa*v,1.8+Math.random()*.9,.34,1+.3*k,.22,.8,.78,.88);}}
function figEtincelles(k){ // un dur atterrissage : quelques étincelles au ras du plateau, aux roues
  if(!BURN.feu)return;const L=figRoues(),c=carGroup.position;
  for(let i=0;i<L.length;i+=3){const dx=L[i]-c.x,dz=L[i+2]-c.z,d=Math.hypot(dx,dz)||1;
    for(let j=0;j<3;j++){const v=1.5+Math.random()*3*k;burnEmet(BURN.feu,L[i],L[i+1]+.05,L[i+2],dx/d*v+(Math.random()-.5)*1.5,1+Math.random()*2.2,dz/d*v+(Math.random()-.5)*1.5,.3+Math.random()*.35,.05+Math.random()*.05,0,1,1,.55+Math.random()*.35,.18);}}}
function figDecolle(P){ // l'instant où elle quitte le plateau : un petit nuage à chaque roue, un tic dans le pouce
  figPoussiere(.55,0);try{hap(6);}catch(e){}}
function figAtterrit(P){ // l'instant où elle touche : la carrosserie encaisse, la poussière, l'anneau, le son, le pouce
  const vi=P.g*P.T/2,k=Math.min(1.3,.35+vi*.14);P.vi=vi;P.k=k;P.encaisse=Math.min(.08,.016*vi);GFIG.pulse=1;GFIG.kick=k;
  try{figPoussiere(k,1);figAnneau(k);if(vi>4.2)figEtincelles(k);}catch(e){}
  try{if(SONV2)sfx('pose.nette',{vol:-4+2*k,t:.01});else{chimeNote(240,0,.06,.12);noiseBurst(.16,.08,900);}}catch(e){}
  try{hap([8,18]);}catch(e){}}
window.dbgFigPlan=function(){const P=GFIG.pl;return P&&{plat:P.plat,h:+P.h.toFixed(2),T:+P.T.toFixed(3),g:+P.g.toFixed(2),v0:+P.v0.toFixed(2),D:+P.D.toFixed(3),tA:P.tA,nR:P.nR,iFin:P.iFin,sur:P.sur,N:P.N,boite:P.B&&[+P.B.min.x.toFixed(2),+P.B.min.y.toFixed(2),+P.B.min.z.toFixed(2),+P.B.max.x.toFixed(2),+P.B.max.y.toFixed(2),+P.B.max.z.toFixed(2)],hc:+P.hc.toFixed(2),filet:+(P.filet||0).toFixed(3),vi:P.vi&&+P.vi.toFixed(2),encaisse:P.encaisse&&+P.encaisse.toFixed(3)};}; // (banc) le plan de la figure en cours
/* LE DOIGT SUR LA SCÈNE (2026-10-15, bug : un lancer parti juste à droite de la bande « CETTE SEMAINE » ne lançait pas la caisse — la bande
   prend le doigt jusque dans son blanc, et c'était le doigt du GARAGE, sans élan planifié, qui la tournait). Pour la boutique, la scène c'est
   le canevas ET ce que la page de vente pose dessus sans être un bouton : le titre, l'argent, le nom, le blanc entre les cartes de la bande.
   Les vrais boutons (cartes, onglets, coloris, liens) gardent leur clic ; le panneau des voitures garde son doigt (il défile). */
function bqScene(t){if(t===renderer.domElement)return true;if(!t||!t.closest||!t.closest('#gBq'))return false;
  return !t.closest('#gBqPan,button,a,input,select,textarea,[role=button],[role=tab],.bqU,.bqK');}
(function(){
  addEventListener('pointerdown',function(e){if(!GBQ.on||!garageOn||GAR.go||!bqScene(e.target))return;if(GBQ.drag)return;
    const t0=performance.now();GBQ.drag={id:e.pointerId,x:e.clientX,y:e.clientY,t:t0,k:bqPrise(e),x0:e.clientX,y0:e.clientY,t0:t0,loin:false,attrape:!!GBQ.lan||Math.abs(GBQ.yawV)>.3};GBQ.lan=null;GBQ.yawV=0;GBQ.pitV=0;GBQ.rolV=0;e.stopPropagation();},true);
  addEventListener('pointermove',function(e){const d=GBQ.drag;if(!d||d.id!==e.pointerId)return;e.stopPropagation();
    if(!d.loin&&Math.hypot(e.clientX-d.x0,e.clientY-d.y0)>8){d.loin=true;bqPoseTient();} // (2026-10-15) LA POSE TENUE : elle a glissé → posée à la main
    const now=performance.now(),dx=e.clientX-d.x,dy=e.clientY-d.y,ds=Math.max(.008,(now-d.t)/1000);d.x=e.clientX;d.y=e.clientY;d.t=now;
    GBQ.yaw+=dx*.011;{const k=d.k||{kp:1,kr:0};GBQ.pit=THREE.MathUtils.clamp(GBQ.pit+k.kp*dy*.008,-.75,.75);GBQ.rol=THREE.MathUtils.clamp((GBQ.rol||0)+k.kr*dy*.008,-.55,.55);}GBQ.yawV=GBQ.yawV*.5+dx*.011/ds*.5;},true);
  const fin=function(e){const d=GBQ.drag;if(!d||d.id!==e.pointerId)return;e.stopPropagation();GBQ.drag=null;if(performance.now()-d.t>90)GBQ.yawV=0;bqLance(GBQ.yawV); // (2026-10-15) LE LANCER DOSÉ
    if(e.type==='pointerup'&&!d.loin&&!d.attrape&&performance.now()-d.t0<300&&d.k&&d.k.sur){if(GBQ.pose){bqPoseLache();try{uiClic('nav');hap(6);}catch(er){}}try{bqTape();}catch(er){}}}; /* (2026-10-20) …et le coup + l'action spéciale de la caisse (voir bqTape) */ // (2026-10-15) un toucher bref SUR elle : la pose de vitrine, le plateau repart
  addEventListener('pointerup',fin,true);addEventListener('pointercancel',fin,true);})();
try{Object.assign(I18N,{'COLORIS':'SKINS','ORIGINAL':'ORIGINAL','PEINTURES':'PAINTS','AILES':'WINGS','TRAÎNÉES':'TRAILS','À LA UNE':'FEATURED','SEMAINE':'WEEKLY','OFFRES':'OFFERS','VOITURES':'CARS','CETTE SEMAINE':'THIS WEEK','ACHAT':'BUY','TOUT VOIR':'SEE ALL','TRAÎNÉE':'TRAIL','AILE':'WING','CAISSE':'CAR','ÉDITIONS LIMITÉES':'LIMITED EDITIONS','TOUTES LES VOITURES':'ALL CARS','LIMITÉE':'LIMITED','À TOI':'YOURS','Dans ton garage':'In your garage','Exclusivité boutique — introuvable en jeu':'Shop exclusive — not obtainable in game','Exclusivité boutique — revient en édition limitée':'Shop exclusive — returns as a limited edition','En vente':'For sale','Se gagne aux défis':'Earned through challenges'});}catch(e){}
window.dbgBqIndus=function(){return {cam:[+camera.position.x.toFixed(2),+camera.position.y.toFixed(2),+camera.position.z.toFixed(2),+camera.fov.toFixed(1)],grpY:GBQ.grp?+GBQ.grp.position.y.toFixed(2):null,veut:GBQ.veut,on:GBQ.on,lev:+GBQ.lev.toFixed(2),k:+GBQ.k.toFixed(2),yaw:+GBQ.yaw.toFixed(2),pit:+GBQ.pit.toFixed(2),rol:+(GBQ.rol||0).toFixed(2),pose:GBQ.pose,platK:+GBQ.platK.toFixed(2),lan:GBQ.lan?[+GBQ.lan.D.toFixed(3),+GBQ.lan.T.toFixed(3),+GBQ.lan.q.toFixed(2)]:null,ang:+garageAng.toFixed(3),cap:+(function(){const v=new THREE.Vector3(0,0,1).applyQuaternion(carGroup.quaternion);return Math.atan2(v.x,v.z);})().toFixed(4),capV:+(function(){const v=new THREE.Vector3(0,0,1).applyQuaternion(carGroup.quaternion).applyQuaternion(camera.quaternion.clone().invert());return Math.atan2(v.x,v.z);})().toFixed(4),ecr:(function(){const v=new THREE.Vector3(0,.55,0);carGroup.updateMatrixWorld(true);carGroup.localToWorld(v);v.project(camera);const r=renderer.domElement.getBoundingClientRect();return [Math.round(r.left+(v.x+1)/2*r.width),Math.round(r.top+(1-v.y)/2*r.height)];})(),ong:GBQ.ong||'eph',eph:GBQ.eph?GBQ.eph.l:null,caisse:garageI,reste:bqHebdoReste(),
  rail:[...document.querySelectorAll('#gBqPan .bqK')].map(function(el){const r=el.getBoundingClientRect();return [+el.getAttribute('data-i'),Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height),el.classList.contains('sel')];}),zone:GBQ.zone};};
function garageRender(dt){ // la caisse sur son plateau, la caméra tourne à 360° DANS l'atelier
  GAR.dtR=dt;try{hubSync();gTourneMaj();gHomePlace();}catch(e){} // (2026-10-06) LE HUB : la barre suit l'onglet — (2026-10-09) la jauge suit la vue
  if(chuteVoulue()||CHUTE.go){chuteRender(dt);return;}if(CHUTE.on)chuteSort(); // (2026-09-30) LA CHUTE : au MENU, la caisse tombe du ciel (voir « LA CHUTE ») ; la boutique et les missions rouvrent l'atelier
  {const ti9=SHOP.tab==='trainee'?1:(INV&&INV.on&&INV.cat==='trainee')?.55:0;let kc9=ti9||1;if(SHOP.tab==='trainee'){const id9=(cosmSur('trainee')||{}).id;if(id9!==SILPV.cyId){SILPV.cyId=id9;SILPV.cy=0;} /* une traînée qu'on vient de toucher a ses 3,85 s pleines avant la première coupure */SILPV.cy=(SILPV.cy||0)+dt;if(SILPV.cy>4.3)SILPV.cy=0;if(SILPV.cy>3.85)kc9=0;}else SILPV.cy=0;trailApercu(dt,ti9>0,kc9);} /* (2026-10-17, TRAÎNÉES) LE VROMBISSEMENT DE VITRINE : en boutique, la traînée essayée se coupe 0,45 s toutes les 4,3 s et se RALLUME — on revoit son coup d'allumage (la corolle, la fontaine, la frappe, l'enseigne qui clignote…) au lieu de ne le voir qu'une fois */ // (2026-10-04) l'INVENTAIRE ouvert sur ses traînées les montre aussi — plus doucement : la caméra de la vitrine est plus près
  const ay=GARAGE_Y,t9=performance.now()*.001;
  if(!GAR.root)buildGarageRoom();
  GAR.root.position.y=ay;GAR.root.visible=true;garArgentMaj(); // (2026-10-01) les tas de billets suivent le compte (une comparaison par image)
  garPorte(dt);garFeu(dt);garBeaute(dt,t9); // (2026-09-30) la PORTE (fermée au menu, ouverte au JOUER) ; le rideau de flammes : il brûle au repos, il RUGIT pendant le lâcher
  carGroup.position.set(0,ay+GAR.POD,0);carGroup.rotation.set(0,garRot(),0);carGroup.visible=!(GBQ.sec!=null&&GBQ.panOn&&SHOP.tab==='voiture'); /* (2026-10-16, missions v2) une SECRÈTE regardée en boutique : le plateau vide, jamais sa caisse */try{garBqIndus(dt,ay,t9);}catch(e){}try{garFigTick(dt);}catch(e){} /* (essai) LA BOUTIQUE INDUSTRIELLE · (2026-10-14) la FIGURE essayée */ // posée SUR le plateau — (2026-09-29, Léo) et c'est ELLE qui tourne, avec lui (voir GAR_CAM_A)
  garageFloor.visible=false;                       // l'ancienne nappe de brume : l'atelier a un vrai sol
  // CIEL CYAN étoilé — ce qu'on voit par la porte relevée (poussé après bioStep : ça gagne cette frame)
  skyU.uSkyMul.value.set(.62,.92,1.34);skyU.uStars.value=1.7;skyU.uMoon.value=1.5;skyU.uSunHalo.value=.12;
  sunSprite.visible=false;horizonGlow.visible=false;for(const r9 of RAYS)r9.visible=false;
  // ÉCLAIRAGE D'ATELIER : on RECYCLE les deux lampes de l'étal — clé chaude au plafond, contre-jour
  // froid côté porte. Aucune PointLight ajoutée à la scène : chacune se paierait sur toutes les
  // frames du jeu, course comprise (voir la note en tête de buildGarageRoom).
  // ⚠ DOSAGE : à 2,9 + 1,9 tout partait en pastel délavé — quatre sources qui s'additionnent sur un
  // Lambert, ça sature à blanc. Un atelier, c'est DEUX lampes et beaucoup d'ombre autour.
  // Les deux lampes SUIVENT la caméra (clé à 40° devant, contre-jour derrière) : la caisse est
  // toujours prise sous son meilleur angle et le reflet COURT sur la tôle pendant qu'on tourne.
  // C'est le vieux truc du photographe de studio, et ça vaut mille lumières fixes.
  atelierLampes(true);stallKey.color.setHex(0xffdca8);stallKey.intensity=gEl.classList.contains('menu')?1.25:1.6;stallKey.distance=gEl.classList.contains('menu')?30:22; /* (garage v7) BOUTIQUE : la clé plus forte mais plus COURTE (portée 22) — la caisse se détache, la pièce garde son ombre */ // (chasse aux gels) les lampes entrent, les gyrophares sortent : 8 lumières, les programmes de la course
  /* (2026-09-30, L'ATELIER v2) les lampes suivent la CAMÉRA (garCamA), plus le plateau : depuis que la caméra est fixe et que c'est le
     plateau qui tourne (« le garage sobre »), elles tournaient AVEC la caisse — elle montrait toujours le même côté éclairé et aucun reflet
     ne courait sur la tôle. Et le CONTRE-JOUR, c'est le FEU : face à la porte (au menu, au lâcher) il passe du cyan à la braise et vacille
     avec les flammes — la caisse se découpe sur le rideau de feu, bordée d'orange. Dos à la porte, il redevient le cyan d'avant. */
  {const cA9=garCamA(),wF=Math.max(0,-Math.cos(cA9))*(.25+.75*(GAR.porte?Math.max(0,GAR.porte.e):1)),fl9=1+.13*Math.sin(t9*9.1)+.08*Math.sin(t9*23.7);
   stallKey.position.set(Math.sin(cA9+.72)*5.2,ay+4.1,Math.cos(cA9+.72)*5.2);
   stallRim.color.setRGB(.62+.38*wF,.74-.34*wF,1-.86*wF);garRessort(GAR,'vitL','vitLv',GAR.vit||0,4.8,dt);stallRim.intensity=(.5+.6*wF)*(wF>0?fl9:1)+VITRINE_CAM.rim*(GAR.vitL||0);stallRim.distance=26;stallKey.intensity+=VITRINE_CAM.cle*(GAR.vitL||0); /* (LA MISE EN PLACE) les lampes gardent leur FONDU quand le plan se pose d'un coup (`vitL`) */ // (vitrine v2) la clé et le contre-jour montent d'un cran : la caisse se DÉTACHE
   stallRim.position.set(Math.sin(cA9+Math.PI+.35)*6,ay+2.3,Math.cos(cA9+Math.PI+.35)*6);}
  {const V9=GAR.V||(GAR.V={cle:1.3,rim:1.5});stallKey.intensity*=V9.cle;stallRim.intensity*=V9.rim;} // (2026-10-14, passe graphismes · garage-lumiere) la clé et le contre-jour : deux gains (la caisse se détache) réglables au banc par dbgGarObj().V
  try{garAtelierTick(dt,ay);}catch(e){}try{garBqLumiere();}catch(e){} // (2026-10-12) L'ATELIER FERMÉ de l'INVENTAIRE : porte, lampe, pinces (après les lampes : la clé passe au-dessus de la caisse)
  // LE TUBE AU MAUVAIS STARTER : un néon sur six grésille. C'est ce seul détail qui fait passer le
  // décor de « maquette bien rangée » à « garage » — un atelier neuf, ça n'existe pas.
  if(GAR.flick){const b9=Math.sin(t9*13.7)*Math.sin(t9*4.3)+Math.sin(t9*31.1)*.4;
    const on9=b9>-.55||Math.random()<.02;
    GAR.flick.t.visible=on9;GAR.flick.h.visible=on9;}
  for(let i=0;i<GAR.neons.length;i++) // le néon respire (le tube rose bat un peu plus fort que le $)
    GAR.neons[i].material.opacity=.8+.2*Math.sin(t9*(2.1+i*1.7)+i)+(Math.random()<.006?-.5:0);
  if(GAR.drop){GAR.drop.rotation.z=Math.sin(t9*.83)*.045;GAR.drop.rotation.x=Math.cos(t9*.61)*.035;} // la baladeuse balance
  if(GAR.dust){ // la poussière monte dans les cônes de lumière, et repart d'en bas
    const a9=GAR.dust.geometry.attributes.position,ar=a9.array;
    for(let i=0;i<GAR.dustV.length;i++){const j=i*3;
      ar[j+1]+=GAR.dustV[i]*dt;ar[j]+=Math.sin(t9*.6+i)*dt*.08;
      if(ar[j+1]>GAR.H-.4){ar[j+1]=.3;ar[j]=(Math.random()-.5)*GAR.W*.86;ar[j+2]=(Math.random()-.5)*GAR.D*.86;}}
    a9.needsUpdate=true;}
  // ================= LE RETOURNEUR =================
  // Trois temps, et le remplacement du modèle tombe PILE entre les deux premiers :
  //   1. l'AVALAGE  — le scanner monte, la caisse s'écrase dans le plateau (0 → .34 s)
  //   2. l'ÉCHANGE  — invisible, sous le scanner à son point haut
  //   3. la SORTIE  — le scanner redescend, la nouvelle se déploie avec un petit dépassement
  // ⚠ l'écrasement va à .001 et JAMAIS à 0 : une échelle nulle rend la matrice non inversible et
  // three râle en console à chaque frame (et certains pilotes affichent alors n'importe quoi).
  const SW=GAR.sw;
  if(SW&&GAR.pod){
    SW.t+=dt; const A=.34,B=1.06;
    if(SW.t<A){ const k=SW.t/A,e=k*k;
      carGroup.scale.set(1-.22*e,Math.max(.001,1-e),1-.22*e);
      GAR.scan.visible=true;GAR.scan.position.y=GAR.POD+.02+e*2.35;
      GAR.scan.material.opacity=Math.min(1,k*2.2);
    }else{
      if(!SW.fait){SW.fait=true;garageShow(SW.to);}        // L'ÉCHANGE, sous le rideau
      const u=Math.min(1,(SW.t-A)/(B-A)),o9=1-Math.pow(1-u,3);
      const bk=1+.14*Math.sin(Math.PI*Math.min(1,u*1.25))*(1-u); // le dépassement : elle « claque » en place
      carGroup.scale.set(1-.22*(1-o9),Math.max(.001,o9*bk),1-.22*(1-o9));
      GAR.scan.position.y=GAR.POD+.02+(1-o9)*2.35;
      GAR.scan.material.opacity=Math.max(0,1-u*1.15);
      if(SW.t>=B){GAR.sw=null;GAR.scan.visible=false;carGroup.scale.set(1,1,1);}
    }
    // LE PLATEAU S'EMBALLE puis retrouve son ralenti — une cloche, pas une rampe : ce qui se lit
    // comme « une machine s'est mise en marche », c'est l'accélération PUIS la décélération.
    const bo=Math.sin(Math.PI*Math.min(1,SW.t/B));
    GAR.podSpin=(GAR.podSpin||0)+dt*bo*11;GAR.pod.rotation.y=garRot()+GAR.podSpin; // l'échange fait encore tourbillonner le plateau
    GAR.ring.material.opacity=.8+bo*1.7;GAR.ring.scale.setScalar(1+bo*.05);
    // ⚠ FLASH DOSÉ TRÈS BAS. Premier essai à +1,6/+1,3 : tout l'atelier virait au pastel délavé —
    // exactement le défaut noté en tête de garageRender (quatre sources qui s'additionnent sur un
    // Lambert, ça sature à blanc). Le scanner est DÉJÀ additif et fait le gros du travail lumineux ;
    // les lampes ne font que confirmer, elles ne doivent pas éclairer la scène une deuxième fois.
    stallKey.intensity+=bo*.45;stallRim.intensity+=bo*.35;
  }else if(GAR.pod){
    GAR.pod.rotation.y=garRot()+(GAR.podSpin||0)+BRB.yaw; /* (2026-10-19) le bras des figures fait tourner le plateau (rodéo, shimmy) */ // (2026-09-29, Léo) le plateau PORTE la caisse : ils tournent ensemble
    // ---- LE TOUCHER (2026-09-05) : la caisse ACCUSE le clic/tap avant même qu'on ait glissé quoi
    // que ce soit — sans ça le geste de swipe n'a rien à répondre à la PRESSION, seulement au
    // déplacement. Un aplatissement bref (fonction sinus : 0→creux→0, jamais de à-coup) qui s'éteint
    // tout seul — `GAR.pressT` compte à rebours depuis `PRESS_D`, posé au pointerdown.
    if(GAR.pressT>0&&BRB.p>0)GAR.pressT=0; // (2026-10-19) le bras des figures est là : la caisse ne s'écrase pas sous le doigt (le patin la tient, ou va la tenir)
    if(GAR.pressT>0){
      GAR.pressT=Math.max(0,GAR.pressT-dt);
      const k=1-GAR.pressT/GAR.PRESS_D,sq=1-Math.sin(Math.min(1,k)*Math.PI)*.07;
      carGroup.scale.set(1/sq,sq,1/sq);
    }else if(carGroup.scale.x!==1)carGroup.scale.set(1,1,1);
    if(GAR.ring){GAR.ring.material.opacity=.8+1.1*GFIG.pulse;GAR.ring.scale.setScalar(1+.04*GFIG.pulse);} // (2026-10-23) la pose d'une figure fait battre l'anneau du plateau (voir garage-saut.js)
    // ---- LE TAP (2026-09-05) : recul bref + pluie de blocs (voir `garageImpact`) — même minuteur
    // pour les deux, ils naissent et retombent ENSEMBLE, c'est un seul geste, pas deux effets qui se
    // chevauchent par hasard.
    if(GAR.impactT>0&&BRB.joue)GAR.impactT=0; // (2026-10-19) tenue par le bras : pas de recul
    if(GAR.impactT>0){
      GAR.impactT=Math.max(0,GAR.impactT-dt);
      const ik=1-GAR.impactT/GAR.IMPACT_D;
      carGroup.position.z-=Math.sin(Math.min(1,ik)*Math.PI)*.16;
      for(let i=0;i<GAR.impactMeshes.length;i++){
        const m=GAR.impactMeshes[i],v=GAR.impactVel[i];
        if(!m.visible)continue;
        v.y-=9*dt;
        m.position.x+=v.x*dt;m.position.y+=v.y*dt;m.position.z+=v.z*dt;
        m.rotation.x+=v.rx*dt;m.rotation.y+=v.ry*dt;
        m.material.opacity=Math.max(0,GAR.impactT/GAR.IMPACT_D);
        if(GAR.impactT<=0)m.visible=false;
      }
    }
  }
  try{burnTick(dt);}catch(e){if(!garageRender._bw){garageRender._bw=1;console.warn('burn-out',e);}}
  try{atlTick(dt);}catch(e){if(!garageRender._aw){garageRender._aw=1;console.warn('atelier',e);}} // (même soir) LE BOUTON ROUGE ET SES OUTILS // (2026-10-05) LE BURN-OUT : la caisse, la fumée, le feu, le son
  const menu9=!!(gEl&&gEl.classList.contains('menu'));
  /* LA VITRINE v2 — LE PLAN DE PRÉSENTATION (2026-10-04, Léo : « je veux avoir un beau point de vue sur la voiture ») : en vitrine la caméra
     descend vers la hauteur des phares, se rapproche, l'objectif se resserre (un peu de téléobjectif : la caisse se tasse moins, elle a du
     poids), la visée remonte (le regard presque à niveau) et le plateau tourne plus lentement — `GAR.vit` (0 → 1) fond le tout, à l'aller
     comme au retour (SHOP déplie la console : on revient au cadrage de la boutique en douceur). Réglages à chaud : `VITRINE_CAM`. */
  /* LA MISE EN PLACE (2026-10-06, Léo : « corrige le bug de mise en point »). MESURÉ : la porte GARAGE de l'accueil passe l'atelier du menu
     à la console SOUS le volet, mais le plan se réglait ensuite à vue — 3 s de ressorts après le lever du volet (la caméra tournait de 38°,
     reculait de 8,8 à 11 m, l'image glissait de 88 px). Désormais, quand la vue de Léo s'allume pendant que l'écran est CACHÉ (volet, ou
     atelier qui vient de s'ouvrir), le plan est RÉSOLU sur-le-champ : six passes de garageRender(0) (rien n'avance, rien n'est dessiné) où
     fondu, recul, décalage de caméra et décentrement d'image prennent leur valeur au lieu de la rejoindre (`GAR.vuePose`), puis une image
     de plus pour affiner. Le volet se lève sur un plan déjà posé. Une entrée À VUE (MISSIONS → ATELIER, sans volet) garde son vol. */
  {if(!garageRender._cale&&GAR.vuePose>0)GAR.vuePose--;
   const vT=garVueLeo()?1:0;
   const vu9=!(ecranWipe._on||GAR.vueNeuve)&&(GMIS.mk||0)>.02; // À VUE : le retour des MISSIONS (le vol de la vue d'ensemble est en cours)
   if(vT&&!GAR.vueT&&(ecranWipe._on||GAR.vueNeuve||vu9)&&!garageRender._cale){GAR.vueT=1;GAR.vuePose=2;garLibre._r=null;GAR.ret=null;GAR.vAv=0;GAR.vDon=true;
     const mk9=GMIS.mk;if(vu9)GMIS.mk=0; // le plan de l'ATELIER se résout sans la vue d'ensemble (elle fausse l'écart mesuré) ; le vol de retour se pose ensuite DESSUS, d'un seul mouvement
     garageRender._cale=true;try{for(let i=0;i<6;i++)garageRender(0);}finally{garageRender._cale=false;if(vu9){GMIS.mk=mk9;GAR.vuePose=0;GAR.vDw=0;GAR.vDv=0;}}}
   if(!garageRender._cale){GAR.vueT=vT;GAR.vueNeuve=false;}}
  if(GAR.vuePose){GAR.vit=1;GAR.vitV=0;}else garRessort(GAR,'vit','vitV',garVueLeo()?1:0,4.8,dt); /* (2026-10-06) LA VUE DE LÉO : la vitrine OU la console de Sacha (voir garVueLeo) */if(GAR.vit<0||GAR.vit>1){GAR.vit=Math.min(1,Math.max(0,GAR.vit));GAR.vitV=0;} // (2026-10-06) le fondu vitrine ⇄ boutique en RESSORT : il partait à pleine vitesse (1er ordre ×2,4/s) — la caméra, l'objectif et le recul démarraient d'un coup
  const VK=GAR.vit,VC=VITRINE_CAM;
  if(GAR.angTw){const T9=GAR.angTw;T9.t+=dt;const e9=Math.min(1,T9.t/T9.D),s9=e9*e9*(3-2*e9);if(garageDrag||GAR.go)GAR.angTw=null;else{garageAng=T9.a0+T9.d*s9;if(e9>=1)GAR.angTw=null;}} // (2026-10-11) un onglet TOURNE la caisse vers ce qu'il montre
  else if(!GAR.fige&&(!garageDrag||menu9||VK>.5))garageAng+=dt*(.24+(VC.rot-.24)*VK)*(1-BURN.k)*(garageDrag&&GAR.doigt==='caisse'?0:1)*(GBQ.platK<1?GBQ.platK*GBQ.platK*(3-2*GBQ.platK):1); /* (2026-10-15) LA POSE TENUE : en boutique, posée à la main, le plateau s'arrête ; rendue, il repart en douceur */if(GAR.go)GAR.platW=0;if(!garageDrag&&GAR.platW){garageAng+=GAR.platW*dt;GAR.platW*=Math.exp(-dt*1.2);if(Math.abs(GAR.platW)<.03)GAR.platW=0;} // (même soir) le PLATEAU tenu ne tourne plus tout seul ; lancé, il file et ralentit // (le plateau tourne toujours : en vitrine le doigt tourne la VUE) // le tour de piste automatique, lent : on a le temps de regarder (au MENU le doigt bouge la VUE, pas le plateau : il continue de tourner)
  /* LE GARAGE QUI VIT (2026-09-30, Léo : « on est censé pouvoir tourner autour — soit le garage en rotation sans qu'on touche, soit
     avec le doigt on glisse et on voit légèrement ; inspire-toi de ma branche ») : LES DEUX. (1) Au repos la VUE balance doucement
     autour de la caisse — les deux sinus lents de sa branche (±~11°, ~22 s) et un souffle de hauteur ; elle s'efface dès qu'on touche
     (le balancement est VERSÉ dans le regard : aucun saut sous le doigt) et revient en fondu. (2) Au MENU, glisser fait TOURNER LE REGARD
     autour de l'atelier (`GAR.vA`) — le TOUR COMPLET depuis que Léo a dit « on doit pouvoir voir derrière » (d'abord borné à ±20°), hauteur
     .08-.42. (3) LE GLISSÉ FONDU (même soir, Léo : « une retouche game design : quand tu pivotes, que ce soit agréable, un effet de
     mouvement fondu ; enlève le retour automatique vers la porte, fais-le (mieux) quand on appuie sur PLAY ») : le doigt pose une CIBLE
     (`GAR.vAc`, `GAR.pT`) que la vue rejoint en douceur (constante de ~80 ms) ; lâché en mouvement, le regard GARDE SON ÉLAN
     (`GAR.vW`, frottement ×e^−3t : un coup de pouce vif glisse encore ~1/3 de sa vitesse en radians) ; saisi, il s'arrête net ; la
     caméra PENCHE un peu dans le virage (`GAR.roll`, ≤ 2,3°, lissé). Plus AUCUN retour automatique : c'est JOUER qui ramène la vue
     derrière la caisse, face au feu, avant le lâcher (voir `GAR.go.pre`). En BOUTIQUE glisser fait toujours tourner la caisse. Le plateau
     tourne toujours. `GAR.fige` (dbgGarage) gèle tout pour les captures. */
  GAR.swK=(GAR.swK||0)+(((garageDrag||GAR.go||GAR.fige||gEl.classList.contains('missions'))?0:1)-(GAR.swK||0))*Math.min(1,dt*.7);
  GAR.swO=(Math.sin(t9*.28)*.15+Math.sin(t9*.117+1.3)*.05)*GAR.swK*(1-VITRINE_CAM.dSway*VK); // (2026-10-05, Léo : « plus doux, ça tourne trop la tête ») en vitrine le balancement au repos est réduit
  GAR.swP=Math.sin(t9*.21)*.025*GAR.swK*(1-VITRINE_CAM.dSwayV*VK); // (même soir, Léo : « l'effet doit moins basculer ») en vitrine, moitié moins · (2026-10-05) ⚠ la v109 l'avait collé au bout du commentaire ci-dessus : la caméra avait perdu son balancement VERTICAL (menu compris)
  if(VDEP.etal)vdepEtalTick(dt,t9); // (2026-10-19) LA VITESSE DE DÉPART : l'étal du moteur soulevé
  if(GAR.affiches)for(const a of GAR.affiches){ // LES AFFICHES (branche de Léo) : elles s'allument au survol, sautent au tap
    a.hv+=((GAR.affH===a?1:0)-a.hv)*Math.min(1,dt*8);
    if(a.pop>0)a.pop=Math.max(0,a.pop-dt);
    const p9=a.pop>0?Math.sin((1-a.pop/.45)*Math.PI*3)*a.pop*.16:0;
    a.g.scale.setScalar((a.s0||1)*(1+a.hv*.03+Math.abs(p9)));a.g.rotation.z=p9*.5;
    a.toile.material.color.setScalar(.84+a.hv*.16);
    a.cadre.material.emissiveIntensity=.25+a.hv*.5+Math.abs(p9)*2;a.lueur.material.opacity=.3+a.hv*.25;}
  if(!GAR.fige&&!GAR.go){ // LE GLISSÉ FONDU : l'élan, puis la vue qui rejoint sa cible
    if(!garageDrag&&GAR.vW){const gl9=typeof GTN!=='undefined'&&GTN&&GTN.glisse,fr9=gl9?GT_FREIN:(VK>.5?VITRINE_CAM.dFrein:3);
      if(gl9){const b9=GTN.k0+(GAR.vW>0?Math.PI:-Math.PI),cap9=(b9-(GAR.vAc||0))*fr9;if(GAR.vW>0?GAR.vW>cap9:GAR.vW<cap9)GAR.vW=cap9;} // (2026-10-10) la jauge lancée vers le bout du rail y FREINE et s'y pose (elle butait net)
      GAR.vAc=(GAR.vAc||0)+GAR.vW*dt;GAR.vW*=Math.exp(-dt*fr9);if(Math.abs(GAR.vW)<.015)GAR.vW=0;}
    const vA0=GAR.vA||0,kS=1-Math.exp(-dt*12),cib9=GAR.vAc!=null?GAR.vAc:vA0;
    /* LE RETOUR À LA PORTE (même soir, Léo : « après 3 s sans action du joueur sur le joystick invisible qui gère le point de vue du garage,
       le champ de vision se replace vers la porte, agréablement »). En vitrine, `retAttente` s après le dernier toucher ET l'élan retombé,
       la vue revient face à l'entrée par le chemin le PLUS COURT (jamais plus d'un demi-tour), en une courbe en S (sinus) de `retDuree` +
       `retPente` × (angle / π) s — ~1,5 s pour un quart de tour, 2 s pour un demi. Le doigt qui touche la RATTRAPE : la saisie reprend sa
       vitesse et elle ralentit sous lui (~5° au banc), sans à-coup. Arrivée, l'angle est ramené dans [−π, π] (le regard qui traîne aussi). */
    if(VK>.5&&!GAR.ret&&!garageDrag&&!GAR.vW&&!GAR.go&&!(typeof GTN!=='undefined'&&GTN&&GTN.fixe)&&performance.now()-(GAR.tDoigt||0)>VITRINE_CAM.retAttente*1000&&Math.abs(GAR.vAv||0)<.02){ // (2026-10-10, Léo : « moins d'effet glissade ») la vue posée À LA JAUGE reste où on l'a mise (GTN.fixe) : 3 s après, elle repartait seule vers la porte et le curseur glissait au milieu — le retour ne suit plus que le glissé du doigt sur le décor
      const w9=Math.atan2(Math.sin(vA0),Math.cos(vA0));
      if(Math.abs(w9)>.004)GAR.ret={a0:vA0,a1:vA0-w9,v0:GAR.vAv||0,t0:performance.now(),d:(VITRINE_CAM.retDuree+VITRINE_CAM.retPente*Math.abs(w9)/Math.PI)*1000};} // (2026-10-06) v0 : la vitesse qu'avait encore la vue — la courbe la reprend (elle repartait de zéro)
    if(GAR.ret&&(VK<=.5||GAR.go))GAR.ret=null;
    if(GAR.ret){const R9=GAR.ret,k9=Math.min(1,(performance.now()-R9.t0)/R9.d);
      const D9=R9.d/1000,h9=(R9.v0||0)*D9;GAR.vA=R9.a0+(R9.a1-R9.a0)*(.5-.5*Math.cos(Math.PI*k9))+h9*k9*(1-k9)*(1-k9);GAR.vAc=GAR.vA;GAR.vAv=(R9.a1-R9.a0)*.5*Math.PI*Math.sin(Math.PI*k9)/D9+(R9.v0||0)*(1-k9)*(1-3*k9);
      if(k9>=1){GAR.ret=null;GAR.vAv=0;GAR.vA=GAR.vAc=R9.a1;const n9=Math.round(R9.a1/(2*Math.PI));
        if(n9){const s9=2*Math.PI*n9;GAR.vA-=s9;GAR.vAc-=s9;if(GAR.aVl!=null)GAR.aVl-=s9;}}}
    else if(VK>.5||gtMene()){ /* (2026-10-10, Léo : « encore plus smooth, la jauge ») quand la JAUGE mène la vue, elle aussi suit ce ressort, AMORTI
         CRITIQUE (GT_LISSE, sans rebond) : elle accélère, file, puis se pose — au lieu du rattrapage du 1er ordre qui partait à pleine vitesse.
         (2026-10-05, Léo : « l'effet flottant à revoir, que ce soit satisfaisant ; là c'est un peu brut le mouvement caméra ») LE RESSORT : la
         vue n'est plus tirée au 1er ordre vers le doigt (elle partait à pleine vitesse au premier pixel et s'arrêtait sec) mais suit un
         ressort AMORTI CRITIQUE (le « SmoothDamp » des moteurs de jeu) : elle ACCÉLÈRE, file, puis FREINE en douceur, sans rebond, et garde sa
         vitesse quand le doigt la relâche (elle ralentit, elle ne cale pas). Temps de réponse `dLisse`. */
      /* (même jour, Léo : « maintenant c'est un peu générique — fais un juste milieu entre les deux ») le ressort est un peu SOUS-amorti
         (dAmorti ,72 au lieu de 1) : la vue suit plus vivement et se pose avec un soupçon de rebond (< 1°), au lieu de s'arrêter « au cordeau ».
         Intégré en pas de 8 ms (Euler semi-implicite : stable à toutes les cadences). */
      const gm9=gtMene(),om=2/(gm9?GT_LISSE:VITRINE_CAM.dLisse),z9=gm9?1:VITRINE_CAM.dAmorti,d9=Math.min(dt,.1),n9=Math.max(1,Math.ceil(d9/.008)),h9=d9/n9;let x9=vA0,v9=GAR.vAv||0;
      for(let i=0;i<n9;i++){v9+=(om*om*(cib9-x9)-2*z9*om*v9)*h9;x9+=v9*h9;}
      GAR.vAv=v9;GAR.vA=x9;if(gm9&&GTN.id==null&&!GTN.glisse&&Math.abs(cib9-x9)<.0015&&Math.abs(v9)<.02){GTN.gt=0;GAR.vAv=0;GAR.vA=cib9;}}
    else{GAR.vAv=0;GAR.vA=vA0+(cib9-vA0)*kS;}
    if(menu9&&GAR.pT!=null)garagePitch+=(GAR.pT-garagePitch)*kS;
    const w9=dt>0?(GAR.vA-vA0)/dt:0;const r9=1-VITRINE_CAM.dRoulis*VK;GAR.roll=(GAR.roll||0)+(THREE.MathUtils.clamp(w9*.016*r9,-.04*r9,.04*r9)-(GAR.roll||0))*Math.min(1,dt*6);
  }else GAR.roll=(GAR.roll||0)*(1-Math.min(1,dt*6));
  // CADRAGE PORTRAIT : le `fov` de three est VERTICAL — sur un téléphone à la verticale le champ
  // horizontal s'effondre et la caisse sort du cadre par les côtés. On rouvre l'angle (FOV_K), on
  // RECULE un peu, et on vise plus BAS pour la faire remonter au-dessus de la fiche. Les trois se
  // règlent ENSEMBLE : reculer rapetisse, viser bas remonte.
  // ================= LE LÂCHER : il prend la main sur tout le reste =================
  if(GAR.go&&GAR.go.pre){ // LE RETOUR AU FEU (voir garageLaunch) : la vue d'orbite revient dans l'axe, le plateau remet la caisse face à la porte
    const P=GAR.go.pre;P.t+=dt;const u=Math.min(1,P.t/P.D),e=u*u*u*(u*(u*6-15)+10);
    GAR.vA=GAR.vAc=P.v0*(1-e);garageAng=P.g0+P.gd*e;garagePitch=P.p0+(.2-P.p0)*e;GAR.pT=garagePitch;GMIS.mk=(P.mk0||0)*(1-e);GAR.vD=(P.vd0||0)*(1-e);GAR.preE=e;
    if(u>=1){GAR.go.pre=null;GAR.vA=GAR.vAc=0;GAR.vD=0;garageAng=GAR_CAM_A;GMIS.mk=0;} // (la caméra de cette image se pose dans l'axe ; le lâcher la relève à l'image suivante)
  }else if(GAR.go){
    const G=GAR.go;
    if(!G.p0){G.p0=camera.position.clone();G.lx0=-Math.sin(garCamA())*1.5;G.lz0=-Math.cos(garCamA())*1.5;G.r0=Math.atan2(Math.sin(garRot()),Math.cos(garRot()));garLacherSon();}
    G.t+=dt;
    const D=1.7,u=Math.min(1,G.t/D);
    const appui=Math.max(0,1-u/.20);                       // l'assiette qui s'écrase au premier quart
    const cz=u*u*17;                                       // ⚠ u² : elle ACCÉLÈRE, elle ne glisse pas
    carGroup.position.set(0,ay+GAR.POD-appui*.055,cz);
    {const e0=Math.min(1,u/.3),r9=G.r0*(1-e0*e0*(3-2*e0));carGroup.rotation.set(appui*.035,r9,0);} // le nez qui se lève sous la charge — et le plateau la remet face à la porte (0,5 s)
    if(GAR.ring){GAR.ring.material.opacity=.8+appui*2.2;GAR.ring.scale.setScalar(1+appui*.06);}
    if(GAR.pod)GAR.pod.rotation.y+=dt*.35;
    // la caméra glisse de l'orbite jusqu'à la place de poursuite, et l'y reste
    const k=Math.min(1,u/.42),e9=k*k*(3-2*k);              // lissage : pas de départ brutal
    /* (2026-09-30, le tour complet) la caméra REJOINT la place de poursuite en tournant autour de la caisse (angle, rayon, hauteur
       interpolés) : en ligne droite depuis le côté de la porte, elle traversait la caisse. Dans l'axe (a0 = π) c'est la ligne droite d'avant. */
    if(G.a0===undefined){G.a0=Math.atan2(G.p0.x,G.p0.z);G.r0p=Math.hypot(G.p0.x,G.p0.z);}
    {let da=Math.PI-G.a0;da=Math.atan2(Math.sin(da),Math.cos(da));
     const a9=G.a0+da*e9,r9=G.r0p+((6.4-Math.min(cz,6.3))-G.r0p)*e9;
     if(e9<1)GAR._v.set(Math.sin(a9)*r9,G.p0.y+(ay+1.72-G.p0.y)*e9,Math.cos(a9)*r9);else GAR._v.set(0,ay+1.72,cz-6.4);}
    camera.up.set(0,1,0);camera.position.copy(GAR._v);
    // (2026-09-26, vague 2) le REGARD aussi glisse de la visée de l'orbite à celle de la poursuite (il sautait d'un coup à la 1re image),
    // et le décentrement de l'objectif (voir garageDecale) revient à zéro sur le même geste
    {const v9=(garageRender._v||0)*POR,yv=ay+1.0-POR*.65-v9*1.35;camera.lookAt(G.lx0*(1-e9),yv+(ay+.85-yv)*e9,G.lz0+(cz+3.2-G.lz0)*e9);garCadre(1-e9);}
    const fovL=(56+u*10)*FOV_K;                            // le champ s'ouvre : c'est ça, la vitesse
    if(Math.abs(camera.fov-fovL)>.01){camera.fov=fovL;camera.updateProjectionMatrix();}
    if(!G.voile&&u>.90){G.voile=true;const f=$('gFade');if(f)f.classList.add('on');} // (2026-09-29) .80 → .90 : la caisse ENTRE dans le rideau de flammes (la porte est à cz 13, atteinte à u .875) avant la coupure
    if(u>=1){
      GAR.go=null;carGroup.rotation.set(0,0,0);
      // ⚠ `resetGame()` fait DÉJÀ tout le travail de relance (piste neuve, meute, `fireLaunchBoost()`)
      // — la caisse a QUITTÉ le garage sur cette piste-menu, une VRAIE course en a besoin d'une autre.
      // `start()` reste réservé au TOUT premier lancement (pas de run précédente à remettre à zéro,
      // `respawn()` du chargement de la page suffit) : `resetGame()` appelée trop tôt y attendrait un
      // `started` déjà vrai que rien n'a encore posé.
      if(GAR.sous){const f9=GAR.sous;GAR.sous=null;try{f9();}catch(e){console.warn('lâcher : piste sous le voile',e);}} // (2026-10-15) la piste tirée par le JOUER de l'atelier se bâtit ICI, sous le voile chaud (voir classiqueJouer)
      const wasStarted=started;
      closeGarage(wasStarted);
      if(wasStarted)resetGame();else{start();fireLaunchBoost();}
      const f=$('gFade');if(f)setTimeout(function(){f.classList.remove('on');},60); // il se retire SUR la piste
    }
    return;                                                // ⚠ on ne rejoue pas l'orbite derrière
  }
  let fovG=52*FOV_K*(1+(VC.fov-1)*VK);
  // (2026-09-26) l'onglet VOITURES porte la barre des familles et la bande de vignettes : la caisse doit monter dans le cadre
  // (visée plus basse, un peu de recul) — sinon elle tourne DERRIÈRE les vignettes. Transition douce entre les onglets.
  garageRender._v=(garageRender._v||0)+(((SHOP.tab==='voiture'&&gEl&&!gEl.classList.contains('quiet')&&!gEl.classList.contains('menu')&&!gEl.classList.contains('vitrine'))?1:0)-(garageRender._v||0))*.12; // (2026-10-04) en VITRINE non plus : pas de bande de vignettes // (2026-09-30) pas au MENU : il n'a pas de bande de vignettes (la caméra reculait pour elle, la caisse flottait dans le vide en portrait)
  const vG=garageRender._v*POR;
  let dG0=garageDist*(1+POR*.34)*(1+vG*.12)*(gEl&&gEl.classList.contains('menu')?.8+.02*POR:1); // (debout ×.82 et plus de recul pour la bande de vignettes : la caisse de PROFIL — le plateau la tourne — tient encore dans la largeur) // (2026-09-30) au MENU il n'y a plus d'onglets en bas : la caméra s'approche, la caisse est le sujet
  // (2026-09-26, audit rendu) le recul pouvait atteindre ~12 m alors que rien de haut n'est garanti libre au-delà de 8,3 m : la caméra
  // traversait le décor. On plafonne le rayon HORIZONTAL à 8 m et on rend le cadrage par l'objectif (même taille de caisse à l'écran).
  const cA=garCamA(),cPit=garagePitch+(GAR.swP||0)+VC.p*VK+(BURN.cad||0)*DON.pitch*VK; /* (BURN-OUT v2) en donut la vue prend un peu de hauteur : les cercles de gomme */GAR.vDcam=GAR.vD||0; // (LA MISE EN PLACE) le décalage avec lequel la caméra est posée À CETTE IMAGE (l'écart mesuré par garCadre est le sien)
  /* (vitrine v2) LE RECUL SE CALCULE SUR LA CAISSE : le plateau la montre de dos (2 m de large) puis de PROFIL (jusqu'à 6 m) — un recul fixe
     la coupait aux bords debout (mesuré : 30 px de chaque côté à 3/4). On fait comme un plateau photo : le rayon de son empreinte au sol
     (`garGabarit`, l'empreinte la plus large qu'elle montre en tournant) doit tenir dans `fw` de la largeur LIBRE (garLibre : tiroir ouvert
     compris), sa hauteur dans `fh` de la hauteur libre. Lissé (la place libre se relit tous les 250 ms). */
  /* (même soir) …mais debout, calé sur le PROFIL, la caisse vue de dos ne faisait plus qu'un tiers de la largeur, sur un grand sol vide. Le
     cadrage suit donc AUSSI la largeur qu'elle montre à cet instant (`w` : son empreinte vue sous l'angle du moment), à moitié
     (`adapt`) : la caméra s'approche quand elle montre l'arrière, recule quand elle passe de profil — un travelling lent (lissé ~1 s),
     comme un cadreur qui garde son sujet. Jamais plus près que ce qui la garde entière. */
  if(VK>.001){const G=garGabarit(),lb=garLibre(),tv=Math.tan(fovG*Math.PI/360),th=tv*VP.w/Math.max(1,VP.h),
      zw=Math.max(.3,2*Math.min(lb.cx-lb.x0,lb.x1-lb.cx)/VP.w),zh=Math.max(.25,(lb.y1-lb.y0)/VP.h),fw=VC.fw+(VC.fwP-VC.fw)*POR, /* (même soir, Léo) la caisse décalée à gauche : la place qui compte est la plus petite des deux moitiés ; debout un peu plus de recul (fwP) */
      q=carGroup.rotation.y-(GAR_CAM_A+(GAR.vD||0)),sq=Math.abs(Math.sin(q)),cq=Math.abs(Math.cos(q)),
      w=G.a*sq+G.b*cq,pr=G.a*cq+G.b*sq,wE=garBurnR(G.R+(w-G.R)*VC.adapt),pE=garBurnR(G.R+(pr-G.R)*VC.adapt), /* (BURN-OUT v2) en donut : le cercle balayé */
      dW=wE/(fw*zw*th)+pE,dH=(G.H*.5+pE*Math.sin(Math.max(.05,cPit))+.25)/((VC.fh+(VC.fhP-VC.fh)*POR)*zh*tv)+pE, /* (2026-10-06, Léo : « le point de vue couché d'avant, un peu plus éloigné, c'est mieux ») couché : fw ,9 · fh ,8, le recul d'avant la v112 ; debout inchangé (fwP · fhP ,88) */dV=Math.max(dW,dH,3.2)*(1+.14*Math.max(0,GBQ.k)*(VP.w>VP.h*1.2?0:1))*(1+BRB.cK); /* (2026-10-19) le bras des figures : du recul */ /* (2026-10-12, Léo : « la voiture un tout petit peu éloignée ») */
    if(GAR.dVs&&!GAR.vuePose)garRessort(GAR,'dVs','dVv',dV,1.8,dt);else{GAR.dVs=dV;GAR.dVv=0;}dG0=dG0*(1-VK)+GAR.dVs*VK;} /* (2026-10-06) le recul en RESSORT (même retard, ~1,1 s) : l'inventaire qui s'ouvre changeait la place libre d'un coup, le travelling partait à pleine vitesse */ /* (même soir) le zoom ne dépend plus de l'angle du DOIGT (il zoomait pendant le glissé) : seulement de la caisse qui tourne, vue de la place de repos ; lissé ~1,1 s */
  const capH=8+2.5*Math.pow(Math.max(0,-Math.cos(cA)),2)+3.5*Math.max(0,GBQ.k); /* (essai) au magasin, un peu plus de recul */ // (2026-09-30, le tour complet) 10,5 m seulement dans l'axe libre (côté établi) ; ailleurs le décor est rangé pour 8 m (la règle des 8,3 m)
  const dG=Math.min(dG0,capH/Math.max(.2,Math.cos(garagePitch))); // (2026-09-29) 8 → 10,5 m : la caméra est FIXE, dans l'axe libre de l'atelier (côté établi) — elle recule au lieu d'ouvrir l'objectif jusqu'à ~87° (« l'effet loupe »)
  if(dG<dG0)fovG=Math.min(88,2*Math.atan(Math.tan(fovG*Math.PI/360)*dG0/dG)*180/Math.PI);
  if(Math.abs(camera.fov-fovG)>1e-4){camera.fov=fovG;camera.updateProjectionMatrix();} // (2026-10-06) seuil ,01° → 1e-4 : le zoom lent avançait par CRANS (une image sur deux), le bord de l'image tremblait
  const cp=Math.cos(cPit)*dG,h=Math.sin(cPit)*dG;
  camera.up.set(0,1,0);
  // GARDE-FOU : la caméra reste DANS l'atelier. On tourne à 360° dedans — jamais à travers un mur,
  // jamais au-dessus du plafond. Le clamp est la seule chose qui rende l'orbite libre SÛRE.
  camera.position.set(
    THREE.MathUtils.clamp(Math.sin(cA)*cp,-GAR.W/2+1.2-20*Math.max(0,GBQ.k),GAR.W/2-1.2+20*Math.max(0,GBQ.k)),
    THREE.MathUtils.clamp(ay+h+1.0+VC.y*VK,ay+.75,ay+GAR.H-1.05),
    THREE.MathUtils.clamp(Math.cos(cA)*cp,-GAR.D/2+1.2-20*Math.max(0,GBQ.k),GAR.D/2-1.2+20*Math.max(0,GBQ.k)));
  /* (2026-10-05, Léo : « c'est avec le doigt qu'on bouge le garage à 360°, mais sinon centré sur l'entrée, sans la porte ») AU REPOS la vitrine
     REGARDE L'ENTRÉE (le centre de l'ouverture, `VC.porteY` au-dessus du sol) : elle reste au milieu de l'image ; la caisse se pose à gauche par
     la PLACE de la caméra (`GAR.vD`, un décalage d'azimut réglé image après image pour qu'elle tombe sur `garLibre().cx`), plus par un
     décentrement d'objectif. Le doigt fait le tour (GAR.vA) : la visée revient au-delà de la caisse (`wD` → 0 quand on regarde ailleurs). */
  /* (même soir, Léo : « c'est un peu brut ») LA VISÉE TOURNE D'UN BLOC AVEC LA CAMÉRA : au repos elle vise l'entrée ; quand le doigt tourne la
     vue, la visée tourne du même angle autour de la caisse (le point visé reste à la même distance, de l'autre côté) — la composition (la caisse
     en bas à gauche, le fond au milieu) ne bouge plus ; avant, la visée basculait de l'entrée vers la caisse en cours de geste : un coup de fouet. */
  /* (même jour, « un peu générique — un juste milieu ») la visée n'est plus tout à fait rigide : elle TRAÎNE derrière le geste (dRegard /s,
     ~0,3 s) — la caisse glisse un peu dans le cadre pendant le tour et y revient quand la vue se pose : le flottement de la v109, sans son fouet. */
  {const aV0=cA-(GAR.vD||0);if(GAR.aVl==null||VK<.5||GAR.fige||GAR.vuePose||gtMene()||(typeof GTN!=='undefined'&&GTN&&GTN.id!=null))GAR.aVl=aV0;else GAR.aVl+=(aV0-GAR.aVl)*(1-Math.exp(-dt*VITRINE_CAM.dRegard)); /* (2026-10-10, Léo : « moins d'effet glissade : qu'elle tourne autour de la voiture ») quand la JAUGE mène, la visée tourne d'un bloc avec la caméra — la caisse reste CLOUÉE dans l'image, c'est le garage qui tourne autour. ⚠ (même jour, Léo : « quand j'active l'œil et que je tourne, ça fait n'importe quoi ») v227 avait posé ce commentaire en // AU MILIEU de la ligne : il avalait le `else` — la visée ne suivait plus le glissé du doigt sur le décor, la caisse partait au bord de l'écran */
   const aV=GAR.aVl,wD=VK*(1-(GAR.preE||0)),Lv=1.5+(GAR.D/2-1.5)*wD;GAR.wD=wD;
   const ty0=ay+1.0-POR*.65-vG*1.35+(VC.vise+VC.viseP*POR)*VK;
   (GAR.lk||(GAR.lk=new THREE.Vector3())).set(-Math.sin(aV)*Lv,ty0+(ay+VC.porteY-ty0)*wD,-Math.cos(aV)*Lv);camera.lookAt(GAR.lk); // (LA MISE EN PLACE) le point visé est gardé : le vol des MISSIONS part de LUI
   const e9=Math.abs(GAR.cErr||0);if(e9>.03)GAR.vDon=true;else if(e9<.006)GAR.vDon=false; /* (même soir, Léo : « arrête de faire tourner automatiquement le garage ») le glissé ne court plus après les petits écarts (le zoom qui respire avec le plateau le faisait tourner sans fin, lentement) : il recadre au-delà de 3 % de l'écran, jusqu'à 0,6 %, puis se tait */
   /* (2026-10-06, Léo : « parfois pour se replacer l'écran a des petits déclics qui se voient corrigés ») LE RECADRAGE EN DOUCEUR. Mesuré au banc
      (lisse/cam.mjs) : vD était un asservissement du 1er ordre ALLUMÉ d'un coup — il partait à pleine vitesse (debout, la caisse passait de 0,7 à
      1,6 px/image d'une image à l'autre juste après le retour à la porte, quand la visée finissait de rattraper) et s'arrêtait net à 0,6 %. vD devient un RESSORT
      (`GAR.vDv`, sa vitesse, toujours continue ; ~1 s pour se poser) ; ce qui l'allume ou l'éteint (l'hystérésis, la vue qui tourne encore, la
      visée qui traîne, le doigt) ne fait que monter ou descendre son POIDS `GAR.vDw` — jamais sa vitesse. Sa cible : l'écart mesuré ÷ ce qu'un
      radian de vD déplace la caisse à l'écran (`S9`, la géométrie de la vue : la visée à Lv derrière la caisse, la caméra à cp devant). */
   if(GAR.go||GAR.fige||VK<.02){GAR.vDv=0;GAR.vDw=0;if(VK<.02&&!GAR.go&&!gEl.classList.contains('missions'))GAR.vD=(GAR.vD||0)*(1-Math.min(1,dt*4));} // (2026-10-06, LA MISE EN PLACE) aux MISSIONS le décalage est GARDÉ : la vue d'ensemble ne le lit pas, et le retour à l'atelier se pose sur le bon plan (il se réglait 2-3 s après, 36° à vue)
   else{const ss=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
     const cib=(GAR.vDon&&!garageDrag&&GAR.cErr!=null&&!((GMIS.e||0)>.005)?1:0)*ss(.5,1,wD)*(1-ss(.03,.1,Math.abs(GAR.vAv||0)))*(1-ss(.02,.06,Math.abs(aV0-aV))); // (LA MISE EN PLACE) pas pendant le vol des MISSIONS : la caméra y est mêlée à la vue d'ensemble, l'écart mesuré ne veut rien dire (il envoyait vD en butée)
     GAR.vDw=(GAR.vDw||0)+(cib-(GAR.vDw||0))*Math.min(1,dt*5);
     const S9=Math.min(2,Math.max(.15,(Lv/(Math.max(.5,cp)+Lv))/(2*Math.tan(camera.fov*Math.PI/360)*VP.w/Math.max(1,VP.h)))),om=VITRINE_CAM.dRecadre,
       d9=Math.min(dt,.1),n9=Math.max(1,Math.ceil(d9/.008)),h9=d9/n9,x0=GAR.vD||0,c9=x0+(GAR.cErr||0)/S9;let x9=x0,v9=GAR.vDv||0;
     if(GAR.vuePose){x9=(GAR.cErrVD!=null?GAR.cErrVD:x0)+(GAR.cErr||0)/S9;v9=0;GAR.vDw=1;}else /* (pas c9 : l'écart a été mesuré avec la caméra de l'image d'avant — repartir de vD le comptait deux fois, la pose oscillait) */ // (LA MISE EN PLACE) l'écran est caché : la caméra prend sa place, elle ne la rejoint pas
     for(let i=0;i<n9;i++){v9+=(GAR.vDw*om*om*(c9-x9)-2*om*v9)*h9;x9+=v9*h9;} // la caisse à droite de sa place → la caméra glisse (la caisse part à gauche)
     GAR.vD=THREE.MathUtils.clamp(x9,-.9,.9);GAR.vDv=x9===GAR.vD?v9:0;}}
  if(GAR.roll)camera.rotateZ(GAR.roll);
  if((BURN.k>.02||BURN.kick>.01)&&!REDUCED_MOTION){const a9=BURN.k*(.8+.5*BURN.chaud+.6*BURN.donK);camera.rotateZ((Math.sin(t9*47.1)*.6+Math.sin(t9*73.3+1.7)*.4)*.0015*a9);camera.position.y+=(Math.sin(t9*53.9+.5)*.6+Math.sin(t9*81.7+2.9)*.4)*.005*a9-.07*BURN.kick;} /* (BURN-OUT v2) la secousse suit la chaleur et le donut ; au DÉPART la caméra encaisse (BURN.kick) */ // (2026-10-06) même amplitude, en BRUIT LISSE (7-13 Hz) : tiré au hasard à chaque image, il grésillait (et deux fois plus vite à 120 Hz) // (BURN-OUT) la caméra vibre à peine // (le glissé fondu) la caméra penche un peu dans le sens où elle tourne
  if(GFIG.kick>.01&&!REDUCED_MOTION)camera.position.y-=.04*GFIG.kick; // (2026-10-23) la pose d'une figure : la caméra encaisse le choc (4 à 5 cm, ça retombe en 0,3 s)
  { // LES MISSIONS : la caméra s'élève sous la porte relevée et regarde tout l'atelier (fondu en S ; le départ la ramène, voir GAR.go.pre)
    if(!GAR.go)GMIS.mk+=(((gEl.classList.contains('missions'))?1:0)-GMIS.mk)*Math.min(1,dt*2.4);
    const u9=Math.min(1,Math.max(0,GMIS.mk)),e=u9*u9*u9*(u9*(u9*6-15)+10);GMIS.e=e;
    if(e>.0005){const L9=GAR.lk,tx=L9?L9.x:-Math.sin(cA)*1.5,ty=L9?L9.y:ay+1.0-POR*.65-vG*1.35,tz=L9?L9.z:-Math.cos(cA)*1.5,cp9=camera.position; /* (2026-10-06, LA MISE EN PLACE) le vol part du VRAI regard de l'atelier : il visait la caisse (le regard d'avant la vitrine) — au retour, la visée sautait de la caisse à la porte quand le vol s'achevait (le « déclic ») */
      cp9.set(cp9.x+(0-cp9.x)*e,cp9.y+(ay+4.4-cp9.y)*e,cp9.z+(11-cp9.z)*e); // ⚠ y 4,4 : les panneaux de la porte relevée sont empilés à 4,92-5,05 m
      camera.up.set(0,1,0);camera.lookAt(tx*(1-e),ty+(ay+.6-ty)*e,tz+(-3.6-tz)*e);if(GAR.roll)camera.rotateZ(GAR.roll*(1-e));
      const fM=camera.fov+((POR>.5?66:58)*FOV_K-camera.fov)*e;if(Math.abs(camera.fov-fM)>.01){camera.fov=fM;camera.updateProjectionMatrix();}}
  }
  if(GAR.dbgAff&&GAR.affiches){const a9=GAR.affiches.find(a=>a.k===GAR.dbgAff); // `dbgAffiche('perso'|'monde')` : face à l'affiche (banc)
    if(a9){const p9=a9.g.getWorldPosition(GAR._af||(GAR._af=new THREE.Vector3()));camera.position.set(p9.x,p9.y,p9.z-3.4);camera.lookAt(p9.x,p9.y,p9.z);}} // (balancement) la visée reste AU-DELÀ de la caisse, du côté opposé à la caméra — dans l'axe (cA = π) : (0, …, 1,5), la visée d'avant // (2026-09-30, Léo) la visée passe AU-DELÀ de la caisse, vers la porte, à 1 m (couché) : la caisse s'assoit en bas du cadre, l'atelier et le feu au-dessus — le cadrage de sa branche. Debout : même hauteur qu'avant (.35), l'interface du bas l'exige
  /* (2026-09-26, vague 2) LA CAISSE MONTE AU-DESSUS DES FLÈCHES — PAR UN DÉCENTREMENT, PAS EN PIQUANT. À l'onglet VOITURES la caisse
     tombait PILE sur la ligne des flèches ◀ ▶ (y ≈ 330 px sur 844) : LE MUR DU SON (6 m) avait nez et poupe coupés par les boutons, et le
     haut de l'écran n'était que plafond et tubes. Piquer la caméra (1er essai) la remontait bien, mais au BORD d'un grand angle de ~87°
     (le recul est borné à 8 m) : étirée de 10-20 %, elle débordait de l'écran de profil. On décentre donc l'OBJECTIF (`setViewOffset`,
     le « décentrement » des chambres photo) : même visée, même perspective, l'image glisse de 13 % vers le haut — la caisse s'installe
     dans le vide entre le compteur et les flèches, le plafond sort par le haut. Portrait + onglet VOITURES seulement (`vG`) ; le lâcher le
     ramène à zéro, closeGarage l'efface (la caméra est celle de la course). */
  /* (2026-09-28, charte v5) EN PAYSAGE, les commandes de l'atelier forment une COLONNE à droite (onglets, familles, vignettes, barre
     d'action) : la caisse centrée passait dessous. Le même décentrement d'objectif, en largeur cette fois — l'image glisse vers la
     gauche, la caisse s'installe dans la moitié libre. Fondu comme l'autre ; zéro en portrait, à la séquence de départ, au lâcher. */
  garageRender._h=(garageRender._h||0)+(((gEl&&!gEl.classList.contains('quiet')&&!gEl.classList.contains('launching')&&VP.w>VP.h*1.25)?1:0)-(garageRender._h||0))*.12;
  try{bqPovApplique();}catch(e){} // (2026-10-13) le CADRAGE de la boutique, par-dessus la vue (voir BQ_POV)
  garCadre(1-(GMIS.e||0),1-(GAR.wD||0)); // (missions) le décentrement du menu s'efface pendant le vol vers la vue d'ensemble · (vitrine) face à l'entrée, pas de décentrement en largeur : c'est la place de la caméra qui pose la caisse
  if(GAR.misCible)GAR.misCible.rotation.y+=dt*1.1; // la cible des missions tourne sur elle-même
  if(GMIS.holo.length)gmHoloTick(t9);
  if(gEl.classList.contains('missions'))gmSuit();
}
/* LE CADRAGE MESURÉ (2026-09-30, Léo : « la voiture est toujours pas cadrée, c'est chelou »). Deux décalages FIXES d'objectif faisaient le
   cadrage : .075 de la hauteur en portrait, .23 de la LARGEUR dès que l'écran était couché — pensé pour le téléphone couché, où les commandes
   forment une colonne à droite. Sur un écran d'ordi les commandes sont CENTRÉES en bas : la caisse partait à gauche pour rien, à moitié
   sous les onglets (capture 1400 × 800). Désormais on MESURE : `garLibre` lit la place que laissent la fiche du haut et les commandes (en
   bas, ou en colonne à droite), `garCadre` projette le CENTRE DU PLATEAU (la caisse tourne autour : le cadrage ne bouge pas avec elle) et
   décentre l'objectif (`setViewOffset`) pour le poser au milieu de cette place — n'importe quel écran, n'importe quel onglet. Lissé ; `k`
   (0 → 1) le fond au lâcher ; plafonné au tiers de l'écran. GAR_DECY / GAR_DECX restent pour la mémoire, plus lus. */
function garLibre(){
  const n=performance.now();if(garLibre._r&&n-garLibre._t<250&&garLibre._W===VP.w&&garLibre._H===VP.h)return garLibre._r;garLibre._t=n;garLibre._W=VP.w;garLibre._H=VP.h; // (2026-10-14, chasse aux bugs) idem menuCadre : pas de cache à travers une rotation
  const W=VP.w,H=VP.h,r={x0:0,x1:W,y0:0,y1:H};
  /* (2026-10-11, passe UX — Sacha : « quand on clique sur l'œil, la caméra doit recentrer sur la voiture ») LA VOITURE SEULE : la caisse
     au CENTRE de l'écran, à la MÊME taille — on reprend la place mesurée d'avant (sa demi-largeur, sa hauteur) et on la recentre : le
     recul de la caméra se calcule sur ces deux mesures, il ne bouge pas (« rendre tout l'écran la reculait », Léo). Lissé par garCadre. */
  if(gEl&&gEl.classList.contains('vueSeule')&&garLibre._n){const p=garLibre._n,hw=Math.max(40,Math.min(p.cx-p.x0,p.x1-p.cx)),hh=Math.max(40,(p.y1-p.y0)/2);
    r.x0=W/2-hw;r.x1=W/2+hw;r.y0=H/2-hh;r.y1=H/2+hh;r.cx=W/2;r.cy=H/2;return garLibre._r=r;}
  if(document.body.classList.contains('garMenuH')){ // (2026-09-30) LE MENU DE SACHA : la caisse entre le LOGO et la rangée MISSIONS · ⚙ (debout) ; couché, à gauche de la colonne
    const ti=document.querySelector('#mHome .mTitle'),ou=document.querySelector('#mHome .mOutils'),hm=$('mHome'),tr=ti&&ti.getBoundingClientRect(),orr=ou&&ou.getBoundingClientRect(),hr=hm&&hm.getBoundingClientRect();
    if(W>H*1.25&&hr&&hr.width&&hr.left>W*.3)r.x1=hr.left;                              // couché : la colonne est à droite
    else{if(tr&&tr.height)r.y0=tr.bottom+14;if(orr&&orr.height)r.y1=orr.top;}          // debout : entre le titre et les boutons
  }else if(gEl&&gEl.classList.contains('menu')&&!gEl.classList.contains('quiet')&&!gEl.classList.contains('launching')){ // LE MENU : entre PLAY et la rangée du bas
    const pm=$('gPlayMain'),pr=pm&&pm.getBoundingClientRect();
    if(pr&&pr.height){r.y0=pr.bottom;r.pl={l:pr.left,r:pr.right,b:pr.bottom};}
  }else if(gEl&&!gEl.classList.contains('quiet')&&!gEl.classList.contains('launching')){
    const b=$('gBottom'),t=$('gTop'),bb=b&&b.getBoundingClientRect(),tb=t&&t.getBoundingClientRect();
    if(bb&&bb.width>0){
      if(bb.left>W*.3&&(bb.height>H*.6||W>H*1.2))r.x1=bb.left; // téléphone couché : la colonne à droite — (garage v6) la CONSOLE n'en prend plus toute la hauteur
      else{r.y1=bb.top;const g9=document.documentElement.classList.contains('gtConsole')?$('gTourne'):null;if(g9&&g9.classList.contains('on')&&g9.offsetHeight>0)r.y1=Math.min(r.y1,g9.offsetTop-6);}} // sinon : les commandes en bas — (2026-10-10) debout, la JAUGE posée au-dessus de la console borne aussi la caisse (offsetTop : sa place finale, sans le glissé d'entrée)
    if(tb&&tb.height>0&&tb.bottom<r.y1-120)r.y0=tb.bottom;r.shop=true;    // la fiche du haut (si elle laisse de la place)
    if(H>W&&gEl.classList.contains('consoleCachee')){const sb=$('gShopBas'),sr=sb&&sb.getBoundingClientRect();if(sr&&sr.height>0&&sr.bottom<H*.5&&getComputedStyle(sb).position==='fixed'&&sr.bottom+6<r.y1-120)r.y0=Math.max(r.y0,sr.bottom+6);} // (2026-10-19, garageHaut) debout, les portes sont montées sous le nom : la caisse se pose sous elles
    r.vit=gEl.classList.contains('vitrine');r.leo=garVueLeo(); // (2026-10-06) r.leo : la composition de la vitrine (la caisse décalée, l'entrée au milieu) — aussi dans la console de Sacha
    if(r.leo&&!r.vit&&W>H*1.2&&document.documentElement.classList.contains('hubOn')){const hb=document.documentElement.classList.contains('gtConsole')?null:$('gTourne'),hr=hb&&hb.getBoundingClientRect(); /* (2026-10-09) la barre du hub est partie : c'est la JAUGE qui tient le bas à gauche */if(hr&&hr.height>0&&hr.left<W*.3)r.y1=Math.min(r.y1,hb.offsetTop-8);} // couché, la barre du HUB tient le bas à gauche : la caisse se pose au-dessus — sa place FINALE (offsetTop ignore le glissé d'entrée `hubMonte`, qui faisait bouger le cadrage)
    if(r.vit&&W>H*1.2){const ga=$('gAct'),gr=ga&&ga.getBoundingClientRect();if(gr&&gr.width>0&&gr.left>W*.3){r.x1=gr.left-12;r.y1=H-12;}} // (2026-10-05) couché : la pile JOUER · niveau · MISSIONS à droite, la caisse a toute la gauche
    if(INV&&INV.on){const iv=$('gInv'),ir=iv&&iv.getBoundingClientRect();     // (2026-10-04) L'INVENTAIRE ouvert : la caisse se pose au-dessus du tiroir (debout), à sa gauche (couché)
      if(ir&&ir.width>0){if(W>H*1.2&&ir.left>W*.3){r.x1=Math.min(r.x1,ir.left);r.y1=H-12;}else r.y1=Math.min(r.y1,ir.top);}}}
  if(GBQ.zone&&r.shop){const z=GBQ.zone;if(z.cote){r.x1=Math.min(r.x1,z.x0-8);if(z.g!=null)r.x0=Math.max(r.x0,z.g);}else{r.x0=Math.max(r.x0,z.g);r.x1=Math.min(r.x1,z.d);}if(z.y0!=null)r.y0=Math.max(r.y0,z.y0);if(z.y1!=null)r.y1=Math.min(r.y1,z.y1);} // (essai) LA BOUTIQUE INDUSTRIELLE : la caisse entre les étiquettes
  const VC9=VITRINE_CAM,iv9=!!(INV&&INV.on); // (même soir, Léo : « la voiture en paysage encore calée un peu plus vers le coin bas gauche ») couché : cxL/cyL ; tiroir ouvert : au milieu de la place qui reste
  r.cx=(r.x0+r.x1)/2;if(r.leo&&!iv9&&!GBQ.zone)r.cx=r.x0+(r.x1-r.x0)*(VC9.cxL+(VC9.cx-VC9.cxL)*POR);r.cy=(r.y0+r.y1)/2;if(r.shop)r.cy=r.y0+(r.y1-r.y0)*(r.leo&&!iv9?(VC9.cyL+(VC9.cy-VC9.cyL)*POR):r.leo?.5:.44); /* (vitrine v2) debout la caisse se pose un peu plus BAS : le feu et la porte au-dessus, moins de sol vide dessous */ /* (garage v7) la caisse se posait BAS dans sa zone (DEBUGGING) : son centre à 44 % de la zone, pas 50 */if(GBQ.zone&&r.shop)r.cy=r.y0+(r.y1-r.y0)*(GBQ.zone.cote?.36:.5); // (essai) la boutique : la caisse au milieu de sa place
  garLibre._n=r;return garLibre._r=r;
}
function garCadre(k,kx){
  const r0=garLibre(),o9=(GBQ.k>.001)?bqPov():null,w9=Math.max(0,Math.min(1,GBQ.k||0)),r=o9?{cx:r0.cx+(o9.sx||0)*VP.w*w9,cy:r0.cy+(o9.sy||0)*VP.h*w9}:r0;camera.clearViewOffset();camera.updateMatrixWorld(); // (2026-10-13) le CADRAGE de la boutique déplace la place de la caisse
  const v=GAR._pc||(GAR._pc=new THREE.Vector3());v.set(0,GARAGE_Y+GAR.POD+.55+(GBQ.lev||0)+(GBQ.levB||0)+BRB.cY,0).project(camera); /* (2026-10-19) le bras des figures la soulève : sa place monte avec elle */ // le centre du plateau, à mi-hauteur de caisse
  let sx=(v.x*.5+.5)*VP.w;const sy=(.5-v.y*.5)*VP.h,cl=THREE.MathUtils.clamp;
  if(GBQ.on&&GBQ.k>.5){try{const G=garGabarit(),q=carGroup.quaternion,p=carGroup.position,c9=GAR._pc2||(GAR._pc2=new THREE.Vector3());let mn=1e9,mx=-1e9; /* (2026-10-14, Léo : « la voiture plus centrée entre les affiches d'achats ») en BOUTIQUE, on centre la SILHOUETTE de la caisse à l'écran (sa boîte projetée, nez et poupe compris), pas le centre du plateau : en trois-quarts le nez, plus proche, la tirait d'un côté */
    for(const ax of [-1,1])for(const az of [-1,1])for(const ay of [0,1]){c9.set(ax*G.b,ay*G.H,az*G.a).applyQuaternion(q).add(p);c9.project(camera);const x9=(c9.x*.5+.5)*VP.w;if(x9<mn)mn=x9;if(x9>mx)mx=x9;}
    if(mx>mn)sx=(mn+mx)/2;}catch(e){}}GAR.cErr=(sx-r.cx)/Math.max(1,VP.w);GAR.cErrVD=GAR.vDcam; // (vitrine) l'écart de la caisse à sa place, lu par le décalage de caméra (GAR.vD)
  const dx=cl((sx-r.cx)*k*(kx==null?1:kx),-VP.w/3,VP.w/3),dy=cl((sy-r.cy)*k,-VP.h/3,VP.h/3);
  const dt9=Math.min(.1,GAR.dtR||.016);if(GAR.vuePose){GAR.cdx=dx;GAR.cdy=dy;GAR.cvx=GAR.cvy=0;}else{garRessort(GAR,'cdx','cvx',dx,7,dt9);garRessort(GAR,'cdy','cvy',dy,7,dt9);} /* (LA MISE EN PLACE) posé d'un coup quand l'écran est caché */ // (2026-10-05) lissé dans le TEMPS, plus image par image · (2026-10-06) en RESSORT : l'inventaire qui s'ouvre déplaçait la place de la caisse de ~180 px, l'image partait de 20 px en UNE image (mesuré) — elle glisse maintenant en ~0,5 s
  if(Math.abs(GAR.cdx)<.5&&Math.abs(GAR.cdy)<.5)return;                // centré : l'objectif reste droit
  camera.setViewOffset(VP.w,VP.h,GAR.cdx,GAR.cdy,VP.w,VP.h);            // décaler l'objectif de +dx fait glisser l'image de −dx
}
function garageDecale(k,kx){ // k = part de la hauteur d'image dont l'objectif se décale vers le bas (la scène monte) ; 0 = objectif centré ; kx = idem en largeur (paysage)
  kx=kx||0;
  if(!(Math.abs(k)>1e-4||Math.abs(kx)>1e-4)){GAR.dec=GAR.decX=0;GAR.cdx=GAR.cdy=GAR.cvx=GAR.cvy=0;camera.clearViewOffset();return;} // (2026-09-30) zéro = TOUT effacer, cadrage mesuré compris (closeGarage)
  if(Math.abs(k-(GAR.dec||0))<1e-4&&Math.abs(kx-(GAR.decX||0))<1e-4)return;
  GAR.dec=k<1e-4?0:k;GAR.decX=Math.abs(kx)<1e-4?0:kx;
  if(!GAR.dec&&!GAR.decX){camera.clearViewOffset();return;}
  camera.setViewOffset(VP.w,VP.h,GAR.decX*VP.w,GAR.dec*VP.h,VP.w,VP.h); // ⚠ r128 pose aspect = fullWidth/fullHeight : on donne la VRAIE taille de la vue
}
// (dev, 2026-09-26) cadrage d'atelier FIGÉ pour les bancs avant/après : angle, tangage, distance — le tour automatique s'arrête
window.dbgGarage=function(a,p,d,v){if(a==='libre'){GAR.fige=false;garageDrag=false;return {libre:true};}if(a==='etat')return {vA:+(GAR.vA||0).toFixed(3),swO:+(GAR.swO||0).toFixed(3),swK:+(GAR.swK||0).toFixed(2),p:+garagePitch.toFixed(3),ang:+garageAng.toFixed(2)};if(a!=null)garageAng=a;if(p!=null)garagePitch=p;if(d!=null)garageDist=d;if(v!=null)GAR.vA=GAR.vAc=v;GAR.vW=0;GAR.pT=garagePitch;GAR.fige=true;GAR.swK=GAR.swO=GAR.swP=0;garageDrag=true;return {a:garageAng,p:garagePitch,d:garageDist,v:GAR.vA||0};}; // (2026-09-30) 4e argument : le regard (GAR.vA) ; dbgGarage('libre') rend la main
window.dbgGarObj=function(){return GAR;}; // banc (2026-10-14, passe graphismes · garage-lumiere) : l'objet GAR pour régler à chaud les couleurs de l'atelier
// ---------- RÉGLAGES : audio + commandes + sauvegarde (les toggles pilotent les MÊMES états que les boutons du HUD) ----------
const setEl=$('settings');
function setRefresh(){
  const put=(id,on)=>{const b=$(id);if(b){b.textContent=on?'ON':'OFF';b.className=on?'':'off';}};
  put('tgSnd',SND.sfx);put('tgMus',SND.music);
  const lg=$('tgLang');if(lg){lg.textContent=LANG.toUpperCase();lg.className='';}
  volUI();
}
// LANGUE : boucle FR → EN → FR (`langNext()`, seul écrivain — voir sa définition). La devise
// est désormais fixe (dollar, quelle que soit la langue) ; seul le texte bascule.
$('langRow').addEventListener('click',e=>{
  e.stopPropagation();
  langNext();
  $('tgLang').textContent=LANG.toUpperCase();
  $('tgLang').className=''; // toujours « allumé » : ce n'est pas un interrupteur ON/OFF
  applyLangDOM(); // toute l'interface bascule d'un coup (argent, record, menu, réglages, garage, HUD)
});
function openSettings(){setEl.classList.add('on');setRefresh();}
function closeSettings(){setEl.classList.remove('on');}
$('setBtn').addEventListener('click',e=>{e.stopPropagation();openSettings();});
$('setClose').addEventListener('click',e=>{e.stopPropagation();closeSettings();});
setEl.addEventListener('click',e=>{if(e.target===setEl)closeSettings();}); // clic hors carte = fermer
for(const row of document.querySelectorAll('.setRow')) row.addEventListener('click',e=>{
  if(!row.getAttribute('data-tg'))return; // ⚠ les lignes de CURSEUR n'ont pas d'interrupteur : les laisser passer ici
  e.stopPropagation();                    //   rejouerait un `null.click()` et surtout rappellerait setRefresh
  const b=$(row.getAttribute('data-tg'));if(b)b.click(); // réutilise la logique existante (persistance comprise)
  setRefresh();
});
addEventListener('keydown',e=>{if(e.code==='Escape'&&setEl.classList.contains('on'))closeSettings();});
// ---------- L'ÉTAL : on fait défiler les fruits et on règle leur boost / leur fréquence ----------
let stallOn=false,stallI=0,stallMesh=null,stallAng=0;
const stEl=$('stall');
// L'ÉCLAIRAGE DE L'ÉTAL : le showroom est une nuit cyan — sans lumière propre, un fruit rouge vire au
// violet terne. Deux sources dédiées (clé chaude + contre-jour froid) le rendent APPÉTISSANT.
const stallKey=new THREE.PointLight(0xfff0dc,0,60);stallKey.visible=false;scene.add(stallKey);
const stallRim=new THREE.PointLight(0x9fd8ff,0,60);stallRim.visible=false;scene.add(stallRim);
/* LES LAMPES DE L'ATELIER PRENNENT LA PLACE DES GYROPHARES (2026-09-28, chasse aux gels) — MESURÉ au JOUER : allumer stallKey/stallRim
   faisait passer la scène de 8 à 10 lumières ponctuelles, et three RECOMPILE chaque matière éclairée pour ce nouveau compte (il est écrit
   DANS le programme) : 17 programmes au 1er rendu de l'atelier — la caisse, l'atelier, et même le bitume et la ville, dessinés derrière
   ses murs —, ~0,8 s de gel sur PC, trois à cinq fois plus sur iPhone, puis 1 à 2 de plus à la 1re image de course. Or les deux
   gyrophares de la meute sont TOUJOURS à 0 hors d'une poursuite, et l'atelier comme l'étal sont des écrans de menu : les deux lampes
   entrent quand les deux gyrophares sortent. Le compte reste 8, l'atelier dessine avec les programmes de la course, déjà prêts. Image
   identique : une lumière à 0 n'ajoute rien (et au garage, à 1 500 m d'altitude, les gyrophares sont de toute façon hors de portée).
   ⚠ Les lampes ne s'allument QUE par ici : un `stallKey.visible=true` en direct referait 10 lumières. */
function atelierLampes(on){stallKey.visible=stallRim.visible=on;for(const l of gyroLights)l.visible=!on;}
let stallMode='fruit'; // 'fruit' = l'étal · 'moteur' = l'atelier (même vitrine, autre contenu)
function stallShow(i){
  const N=stallMode==='moteur'?ENGINE_TIERS.length:FRUIT_DEFS.length;
  stallI=((i%N)+N)%N;
  if(stallMesh){scene.remove(stallMesh);stallMesh=null;}
  if(stallMode==='moteur'){ // L'ATELIER : le moteur tourne sur son socle, avec sa fiche
    stallMesh=mkEngine(stallI);stallMesh.scale.setScalar(1.55);
    scene.add(stallMesh);
    const E=ENGINE_TIERS[stallI];
    $('stName').textContent=E.n;
    $('stRare').textContent=E.d+'  ·  poussée ×'+E.push.toFixed(2)
      +(stallI===0?'  ·  d\'origine':'  ·  à '+E.coins+' pièces')
      +(stallI===engTier?'   ◀ LE TIEN':'');
    return;
  }
  stallMesh=mkFruit(stallI);stallMesh.scale.setScalar(2.6); // gros plan d'étal : on voit le vernis (sans que le fruit déborde du cadre)
  scene.add(stallMesh);
  const d=FRUIT_DEFS[stallI];
  $('stName').textContent=d.n;
  $('stBoost').value=d.boost;$('stFreq').value=d.freq;
  stallRefresh();
}
function stallRefresh(){
  const d=FRUIT_DEFS[stallI];
  $('stBoostV').textContent=d.boost.toFixed(2);
  $('stFreqV').textContent=Math.round(d.freq);
  let tot=0;for(const f of FRUIT_DEFS)tot+=Math.max(0,f.freq);
  $('stRare').textContent=tot>0?('soit '+Math.round(100*Math.max(0,d.freq)/tot)+' % des fruits de la piste'
    +(d.freq<=0?' — jamais tiré':'')):'aucun fruit ne peut apparaître (toutes les fréquences à 0)';
}
function closeStall(){
  bioApply(BIO.cur);MENUV.bio=false; // (vague 2 : la vitrine de l'accueil repose son couchant) ⚠ (2026-09-24) le garage/l'étal écrasent le ciel chaque frame (nuit étoilée) : on rend la main au BIOME en sortant, sinon la 1re course gardait leur ciel
  stallOn=false;stEl.classList.remove('on');document.body.classList.remove('inStall');
  if(stallMesh){scene.remove(stallMesh);stallMesh=null;}
  atelierLampes(false);stallKey.intensity=0;stallRim.intensity=0; // on éteint l'étal en partant
  garageFloor.visible=false;carGroup.visible=true;
  sunSprite.visible=true;horizonGlow.visible=true;for(const r9 of RAYS)r9.visible=true;
  if(pigGroup)pigGroup.visible=true;
  camera.up.set(0,1,0);
  frameAt(0,F);camera.position.copy(F.p).addScaledVector(F.t,-9).addScaledVector(F.n,4);camera.lookAt(F.p);
  overlay.style.display='flex';
  saveFruits(); // les réglages survivent à la session
}
function stallRender(dt){ // même showroom que le garage : fond cyan propre, caméra qui tourne autour
  const ay=GARAGE_Y;
  if(stallMesh){stallMesh.position.set(0,ay,0);stallMesh.rotation.y+=dt*.55;}
  if(GAR.root)GAR.root.visible=false;                       // l'étal garde son fond nu : pas d'atelier derrière le fruit
  garageFloor.position.set(0,ay-1.6,0);garageFloor.visible=true;
  atelierLampes(true);stallKey.intensity=2.6;stallKey.color.setHex(0xfff0dc);stallKey.distance=60; // ⚠ le GARAGE leur change teinte et portée : on repose les valeurs d'étal
  stallKey.position.set(Math.sin(stallAng+.7)*5,ay+4,Math.cos(stallAng+.7)*5);
  stallRim.intensity=1.5;stallRim.color.setHex(0x9fd8ff);stallRim.distance=60;
  stallRim.position.set(Math.sin(stallAng+3.6)*6,ay+1,Math.cos(stallAng+3.6)*6);
  skyU.uSkyMul.value.set(.62,.92,1.34);skyU.uStars.value=1.7;skyU.uMoon.value=1.5;skyU.uSunHalo.value=.12;
  sunSprite.visible=false;horizonGlow.visible=false;for(const r9 of RAYS)r9.visible=false;
  stallAng+=dt*.25;
  camera.up.set(0,1,0);
  camera.position.set(Math.sin(stallAng)*7,ay+2.4,Math.cos(stallAng)*7);
  camera.lookAt(0,ay+.2,0);
}
// (l'étal est retiré du menu : régler les fruits n'apportait rien au joueur — `openStall('fruit')`
//  et `openStall('moteur')` restent appelables depuis la console pour le réglage)
// (l'atelier des moteurs est retiré du menu : le moteur se gagne en jouant, il n'y a rien à y régler —
//  `openStall('moteur')` reste fonctionnel pour le debug)
$('stClose').addEventListener('click',e=>{e.stopPropagation();closeStall();});
$('stPrev').addEventListener('click',e=>{e.stopPropagation();stallShow(stallI-1);});
$('stNext').addEventListener('click',e=>{e.stopPropagation();stallShow(stallI+1);});
$('stBoost').addEventListener('input',e=>{FRUIT_DEFS[stallI].boost=+e.target.value;stallRefresh();});
$('stFreq').addEventListener('input',e=>{FRUIT_DEFS[stallI].freq=+e.target.value;stallRefresh();});
$('stBoost').addEventListener('change',saveFruits);
$('stFreq').addEventListener('change',saveFruits);
addEventListener('keydown',e=>{if(!stallOn)return;
  if(e.code==='Escape')closeStall();else if(e.code==='ArrowLeft')stallShow(stallI-1);else if(e.code==='ArrowRight')stallShow(stallI+1);});
$('garageBtn').addEventListener('click',e=>{e.stopPropagation();openGarage();});
/* (2026-09-29, Léo) la MAISON de l'atelier = le MENU de l'écran de mort : on rentre à l'ACCUEIL (venu de la mort, la course est rangée
   comme par son MENU — accueilRetour) ; venu des MISSIONS (VOIR), on y retourne comme avant (`__mRetour`, lu à la fermeture). */
$('gClose').addEventListener('click',e=>{e.stopPropagation();uiPop(e.currentTarget);uiClic('retour');
  if(window.__mRetour){ecranWipe(function(){closeGarage();});return;} // venu des MISSIONS (VOIR) : on y retourne
  ecranWipe(function(){if(started&&gameOver)accueilRetour();garMode('menu');});}); // (2026-09-30) le garage EST le menu : la maison y ramène
/* LE JOUER DE L'ATELIER (2026-09-29, Léo : « replace mieux le bouton play ») : sous le pouce droit, là où REJOUER attend sur l'écran de
   mort. Il lance LE LÂCHER — la caisse roule dans le rideau de flammes, la course part sur le boost de départ. Ce qui sort par la porte
   est une caisse À TOI : un essai (caisse fermée, habillage pas encore acheté) rend la main à la tienne avant le départ. */
function garJouer(e){
  if(e)e.stopPropagation();
  if(!garageOn||GAR.go||ecranWipe._on||pendingScore!=null||performance.now()<(garJouer._t||0))return;
  invFerme(true);invHoldFin();
  const el=$('gJouer');uiPop(el);uiClic('jouer');try{pixBurst(el,16);}catch(x){} // (2026-10-16) le bruit de MOTEUR
  /* (2026-10-18, session UI-REVUE, Sacha : « rajoute le bouton JOUER avec les 3 flèches animées dans le garage » → l'INVENTAIRE et la BOUTIQUE,
     où il n'y avait que RETOUR) JOUER part aussi de là. On referme d'abord le mode comme le ferait RETOUR — l'inventaire rouvre l'atelier (la
     porte remonte en 0,7 s, les pinces lâchent les roues : la caisse ne part pas dans une porte fermée), la boutique rend l'atelier sous son
     voile de nuit — puis le départ habituel, le temps que la scène soit là (450 / 650 ms). Le clic, le moteur et le jaillissement partent au
     toucher ; un second toucher pendant l'attente est ignoré. */
  let att9=0;const bq9=gModeM()==='shop';
  if(GATL.on){gAtelier(false);att9=450;}
  if(att9||bq9){try{gGarageReplie();}catch(x){}if(bq9)att9=650;garJouer._t=performance.now()+att9+200;uiGarde(att9+200);} /* (24/10, relecture VÉRIFS-A : « HOME touché pendant l'attente, la course partait quand même ») TOUS les touchers sont ignorés pendant le lâcher, pas seulement un second JOUER : HOME ou BOUTIQUE y créaient un état mêlé (accueil affiché, puis la course partait) */
  const part=function(){
    if(!garageOn||GAR.go)return;
    if(SHOP.tab==='voiture'){if(!carUnlocked(garageI))garageShow(equippedCar());}
    else if(SHOP.prev&&!shopOwned(SHOP.prev.cat,COSM[SHOP.prev.cat][SHOP.prev.i].id)){shopTab('voiture');garageShow(equippedCar());}
    goImmersive();
    if(jadePlayOk()){jadeJouer();return;} // (2026-10-12, Léo) le JOUER lance le SOLEIL DE JADE — depuis le 13/10 seulement avec ?play=jade
    if(sfPlayOk()){classiqueJouer();return;} // (2026-10-13, Sacha) le JOUER lance le MODE CLASSIQUE AU HASARD
    tutoArme();garageLaunch();};
  if(SAVE.d.facile==null&&!SAVE.d.tuto)Promise.resolve().then(part);else if(att9)setTimeout(part,att9);else part();
}
$('gJouer').addEventListener('click',garJouer);
/* BOUTIQUE · RÉGLAGES (repris de l'écran de mort) : l'atelier se ferme sous le volet et le routeur ouvre l'écran voulu — par `__mRetour`,
   le chemin que l'observateur de l'overlay lit à la fermeture (un mGo direct serait aussitôt écrasé par son retour à la racine). */
for(const b9 of document.querySelectorAll('#gOutils [data-go],#gShopBas'))b9.addEventListener('click',function(e){ // (2026-09-30) + la BOUTIQUE du bas
  e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(b9);uiClic('nav');
  const vers=b9.getAttribute('data-go');window.__setGar=vers==='set'; /* (2026-10-19, Sacha) le ⚙ du garage (voir <style id="garageHaut">) : le ◀ des RÉGLAGES rouvre le garage (le routeur de la coque) */
  ecranWipe(function(){window.__mRetour=vers;closeGarage();});});
/* LE ⚙ ET L'ŒIL À CÔTÉ DU TROPHÉE (2026-10-19, voir <style id="garageHaut">) : plqGarage recale le trophée en miroir du compte ; on lit sa place
   (4 Hz, garage ouvert) et on la donne au CSS — --ghTx : du bord droit de l'écran au bord droit du ⚙ (8 px avant le trophée), --ghTy : son
   milieu. Jamais vu : les valeurs par défaut de la feuille. Écrit seulement si ça change. */
function ghPlace(){if(!garageOn||!gEl||document.documentElement.classList.contains('garLeo'))return;const p=document.getElementById('gProf');
  if(!p||!p.classList.contains('on'))return; /* trophée caché (l'œil allumé…) : on garde sa dernière place, l'œil ne saute pas */
  const b=p.getBoundingClientRect();if(b.width<=8||b.bottom<=0)return;const x=Math.round(innerWidth-b.left+8)+'px',y=Math.round(b.top+b.height/2)+'px';
  if(gEl._ghX!==x){gEl._ghX=x;gEl.style.setProperty('--ghTx',x);}if(gEl._ghY!==y){gEl._ghY=y;gEl.style.setProperty('--ghTy',y);}}
setInterval(ghPlace,250);
function gActSync(){const a=$('gAct');if(!a)return;const bt=$('gEquip'),row=$('gBuyRow'),vu=function(x){return !!x&&x.style.display!=='none';};
  const cons=!!gEl&&!gEl.classList.contains('vitrine'); /* (2026-10-09) LA CONSOLE (le garage de Sacha) : JOUER reste en or, ÉQUIPER dit l'état par sa couleur (gEqTon) */
  const ch=!cons&&(vu(row)||(vu(bt)&&bt.dataset.etat!=='eq'));a.classList.toggle('choix',ch);
  const j=$('gJouer');if(j)j.classList.toggle('pb-gold',!ch);
  if(cons&&bt)gEqTon(bt,vu(row));}
/* ÉQUIPER EN COULEURS (2026-10-09, Léo) : ROUGE = pas à toi (à vendre, en boutique, à gagner), BLEU = à toi, à équiper, VERT = équipée.
   Le mot : ÉQUIPÉE quand c'est la tienne, ÉQUIPER sinon (le cadenas devant quand elle n'est pas à toi). */
function gEqTon(bt,achat){const et=bt.dataset.etat,ton=et==='eq'?'vert':(achat||et==='verrou')?'rouge':'bleu';
  bt.dataset.ton=ton;const bb=achat?$('gBuy'):null,px=bb&&bb.dataset.px||'';bt.classList.toggle('achat',!!px);
  /* (2026-10-10, Léo : « ÉQUIPER se change en BUY avec le prix de la voiture quand je regarde une voiture non acquise ») À VENDRE : le verbe
     en petit, le PRIX dessous (vert billet ; or pour l'euro) — sur une ligne il ne tenait pas dans la colonne de JOUER. Le geste reste le relais vers #gBuy. */
  const h=px?'<span class="gEqV">'+TR('ACHETER')+'</span><b class="gEqP'+(bb.dataset.eur?' eur':'')+'">'+px+'</b>'
    :(ton==='vert'?pxi('coche'):ton==='rouge'?pxi('verrou'):'')+'<span>'+TR(ton==='vert'?'ÉQUIPÉE':'ÉQUIPER')+'</span>';
  bt.innerHTML=h;} // (gActSync ne tourne qu'à l'affichage d'une caisse ou d'un habillage : réécrire est sans coût, et passe toujours après gEtat)
/* Le doigt sur ÉQUIPER ROUGE d'une caisse À VENDRE = l'achat (ACHETER n'est plus à l'écran) : le geste est relayé au bouton d'achat caché,
   qui fait tout comme avant (achat et tampon, ou « IL TE MANQUE » ; une légendaire part vers la BOUTIQUE). Seulement un VRAI doigt :
   JOUER clique ÉQUIPER pour partir avec la caisse affichée, ce clic-là ne doit jamais acheter. */
try{vdepInit();}catch(e){console.warn("vitesse de départ",e);} // (2026-10-19) LA VITESSE DE DÉPART : la grille du garage, les étiquettes des PLAY
try{$('gAct').addEventListener('click',function(e){const b=e.target&&e.target.closest&&e.target.closest('#gvCof,#gShopBas');if(!b||!gModeConsole())return; // (2026-10-09) LA CONSOLE À TROIS MODES
  e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(b);uiClic('onglet');gModeVa(b.id==='gvCof'?'inv':'shop');},true);}catch(e){}
try{$('gAct').addEventListener('click',function(e){const b=e.target&&e.target.closest&&e.target.closest('#gEquip'),row=$('gBuyRow');
  if(!b||!e.isTrusted||b.dataset.ton!=='rouge'||!row||row.style.display==='none'||!gEl||gEl.classList.contains('vitrine'))return;
  e.stopPropagation();const bb=$('gBuy');if(bb)bb.click();if(b.dataset.ton==='rouge'&&row.style.display!=='none'&&!(bb&&bb.dataset.bout==='1'))gSecoue(b);},true);}catch(e){} // UN SEUL LINGOT D'OR (charte) : s'il y a un choix, c'est LUI qui est en or — JOUER passe en laque
