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
  if(t==='billet')m.material=mat||RICH.M.billets[Math.floor(Math.random()*RICH.M.billets.length)]; // (2026-10-10) une valeur, une couleur
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
    if(o.gl){ // LE BLING : une facette qui renvoie le soleil vers l'œil
      RICH.cam.copy(cp).sub(m.position).normalize();RICH.H.copy(SUN_DIR).add(RICH.cam).normalize();let g=0;
      for(const nl of o.nl){RICH.v2.set(nl[0],nl[1],nl[2]).applyQuaternion(m.quaternion);const c=RICH.v2.dot(RICH.H);if(c>0)g=Math.max(g,Math.pow(c,D.gp||(D.gem?60:D.flip==='y'?64:110)));}
      if(D.gem)g=Math.max(g,.18+.18*Math.sin(o.age*23+o.ph)); // la gemme vit toujours un peu
      const s=o.gl.s;g*=pres;if(g>.04){s.visible=true;s.position.copy(m.position).addScaledVector(RICH.cam,o.s*1.1);const sz=o.s*fin*(D.gs||(D.gem?3.4:D.flip==='y'?3.1:2.6))*(.45+g*1.1);s.scale.set(sz,sz,1);s.material.opacity=Math.min(1,g*1.4)*fin;}
      else s.visible=false;}}}
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
