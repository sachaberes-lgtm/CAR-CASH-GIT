/* jetable : LE PREVU ET L'ARRIVE des vols d'un pilote — pour chaque vol de chaque course (tracee), vue par vue : la facon tenue (l'ordre doit porter
   « facon », voir faire-diag.js), ce que son rayon annonce, ce que disent versRoute et versRoutePlane, et ce qui arrive vraiment (pose dessus /
   dessous, portail, mort et sa cause, la glisse apres la pose).
   usage : node rayons-vol.js <cerveau.js> [--graines 12] [--depart 910000] [--tmax 300] [--coeurs 6] [--sortie vols.json]
           node rayons-vol.js --lire vols.json [--morts] */
const fs=require('fs'),path=require('path'),{fork}=require('child_process');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
const court=q=>q?{i:q.issue,t:q.t,axe:q.axe,lat:q.lat,d:q.dessous?1:0,p:q.propre===false?0:1,c:q.cause,air:q.air,imp:q.impact,gain:q.gain,nit:q.nitro}:null;
if(A.includes('--une')){
  const {ouvrir,charger,course}=require('../../../bot/piloter');
  const J=ouvrir({regime:'allege'}),C=charger(path.resolve(A[0]));
  console.log=()=>{};console.warn=()=>{};console.error=()=>{};
  const G=+opt('une'),r=course(J,C,G,{tmax:+opt('tmax',300),trace:true}),V=r.vues,P=r.partie,out=[];
  const im=e=>Math.round(e[0]*60)-1;let d=null;const vols=[];
  for(const e of P.ev||[]){
    if(e[1]==='decol')d={i0:im(e),origine:e[2],portail:null};
    else if(!d)continue;
    else if(e[1]==='route'&&d.portail==null)d.portail=im(e);
    else if(e[1]==='pose'){vols.push(Object.assign(d,d.portail!=null?{i1:d.portail,fin:'portail'}:{i1:im(e),fin:'pose',lat:e[3]}));d=null;}
    else if(e[1]==='mort'){vols.push(Object.assign(d,{i1:im(e),fin:'mort',cause:e[2]}));d=null;}}
  let k=0;
  for(const f of vols){
    while(k<V.length&&V[k].image<f.i0)k++;
    const avant=k>0?V[k-1].vue:null,vues=[];let j=k;
    for(;j<V.length&&V[j].image<=f.i1;j++){const v=V[j].vue,o=V[j].ordre||{};if(v.mode!=='vol')continue;
      const fv=v.vol||{},Y=fv.radar&&Array.isArray(fv.radar.rayons)?fv.radar.rayons:[],de=n=>court(Y.find(q=>q&&q.m===n)),p=fv.proche||{};
      vues.push({im:V[j].image,t:v.t,fa:o.facon,vo:o.voulu?1:0,v:o.volant,n:o.nitro?1:0,g:o.geste?1:0,kmh:Math.round(v.vitesse*3.6),haut:p.haut,lat:p.lat,axe:p.axe,env:p.envers?1:0,air:fv.air?fv.air.reste:null,
        mien:o.facon?de(o.facon):null,tenu:de('tenu'),vr:de('versRoute'),vrp:de('versRoutePlane'),rien:de('rien'),plane:de('plane'),ret:Y.filter(q=>q&&/^retour/.test(q.m)).map(court),rc:fv.retours||null});}
    /* apres la pose : dessous ? la glisse (vitesse laterale / vitesse sur 0,2 s), le cap, la re-sortie en moins de 0,8 s */
    let apres=null;
    if(f.fin==='pose'){const S=[];for(let x=j;x<V.length&&V[x].image<=f.i1+50;x++){if(V[x].vue.mode==='sol')S.push(V[x]);else if(S.length)break;}
      if(S.length){const a=S[0].vue,b=S[Math.min(S.length-1,2)].vue,dt=b.t-a.t;
        let re=false;for(let x=j;x<V.length&&V[x].image<=f.i1+48;x++)if(V[x].image>f.i1+2&&V[x].vue.mode==='vol'){re=true;break;}
        apres={dessous:a.dessous?1:0,lat:a.lat,cap:a.cap,demi:a.demi,glisse:dt>.05?Math.abs((b.lat-a.lat)/dt)/Math.max(20,a.vitesse):null,re:re?1:0};}}
    out.push({g:G,carte:avant?avant.carte:(vues[0]?null:null),t0:f.i0/60,dur:(f.i1-f.i0)/60,fin:f.fin,cause:f.cause,origine:f.origine,
      depDessous:avant&&avant.dessous?1:0,depNitro:avant&&V[k-1].ordre&&V[k-1].ordre.nitro?1:0,depKmh:avant?Math.round(avant.vitesse*3.6):null,i1:f.i1,vues:vues,apres:apres});}
  process.send({g:G,vols:out,bilan:{palier:r.bilan.palier,duree:r.bilan.duree_s,cause:r.bilan.cause}});
  setTimeout(()=>process.exit(0),50);
}
else if(A.includes('--lire')){lire(JSON.parse(fs.readFileSync(path.resolve(opt('lire')),'utf8')));}
else{
  const n=+opt('graines',12),dep=+opt('depart',910000),co=+opt('coeurs',6),G=[];for(let i=0;i<n;i++)G.push(dep+37*i);
  const tout=[],bil=[];let en=0,fini=0;
  const lance=()=>{while(en<co&&G.length){const g=G.shift();en++;
    const c=fork(__filename,[A[0],'--une',String(g),'--tmax',opt('tmax','300')],{stdio:'ignore'});
    c.on('message',m=>{tout.push(...m.vols);bil.push(Object.assign({g:m.g},m.bilan));});
    c.on('close',()=>{en--;fini++;if(G.length)lance();else if(!en){const s=path.resolve(opt('sortie',path.join(__dirname,'vols-'+path.basename(A[0],'.js')+(dep===910000?'':'-'+dep)+'.json')));
      fs.writeFileSync(s,JSON.stringify({bilans:bil,vols:tout}));console.log('ecrit '+s+' · '+tout.length+' vols · paliers '+bil.sort((a,b)=>a.g-b.g).map(b=>b.palier).join(' '));lire({bilans:bil,vols:tout});}});}};
  lance();
}
function lire(D){
  const W=D.vols,fin=f=>f.fin==='pose'?(f.apres&&f.apres.dessous?'pose DESSOUS':'pose dessus'):f.fin==='portail'?'portail':'MORT';
  const med=a=>{a=a.filter(x=>x!=null&&x===x).sort((x,y)=>x-y);return a.length?a[Math.floor(a.length/2)]:NaN;};
  const tab=(titre,cle)=>{const T={};for(const f of W){const k=cle(f);if(k==null)continue;const a=fin(f);T[k]=T[k]||{};T[k][a]=(T[k][a]||0)+1;}
    console.log('\n'+titre);const C=['pose dessus','pose DESSOUS','portail','MORT'];
    console.log('  '+'prevu'.padEnd(26)+C.map(c=>c.padStart(13)).join(''));
    for(const k of Object.keys(T).sort())console.log('  '+k.padEnd(26)+C.map(c=>String(T[k][c]||0).padStart(13)).join(''));};
  const iss=q=>!q?'(pas de rayon)':q.i==='pose'?(q.d?'pose DESSOUS':q.p?'pose':'pose sale'):q.i==='levre'?'levre':q.i;
  console.log(W.length+' vols · '+W.filter(f=>f.fin==='mort').length+' morts ('+(100*W.filter(f=>f.fin==='mort').length/W.length).toFixed(1)+' pour 100) · durees medianes '+med(W.map(f=>f.dur)).toFixed(2)+' s · depart nitro '+(100*W.filter(f=>f.depNitro).length/W.length).toFixed(0)+' % · depart dessous '+W.filter(f=>f.depDessous).length);
  const vueA=(f,dt)=>{const X=f.vues;if(!X.length)return null;if(dt==null)return X[Math.min(X.length-1,3)];let b=null;for(const x of X)if((f.i1-x.im)/60>=dt)b=x;return b;};
  tab('A. la facon TENUE, son rayon a la 4e vue du vol (0,3 s : la main a obei) → ce qui arrive',f=>{const x=vueA(f);return x?(x.fa||'?')+' : '+iss(x.mien):null;});
  tab('B. la facon tenue, son rayon a la derniere vue situee 1 s avant la fin → ce qui arrive',f=>{if(f.dur<1.3)return null;const x=vueA(f,1);return x?(x.fa||'?')+' : '+iss(x.mien):null;});
  tab('C. a la 1re vue du vol : versRoute / versRoutePlane → ce qui arrive (le pilote suit presque toujours versRoute)',f=>{const x=f.vues[0];return x?iss(x.vr)+' / '+iss(x.vrp):null;});
  tab('D. par carte',f=>f.carte||'?');
  tab('E. par duree',f=>f.dur<1?'<1 s':f.dur<2?'1-2 s':f.dur<3?'2-3 s':f.dur<5?'3-5 s':'5 s +');
  /* F. la part des vues ou le rayon de la facon tenue dit « sauve », selon la fin */
  {const T={};for(const f of W){const a=fin(f),x=T[a]=T[a]||{n:0,s:0,vols:0,chg:0};x.vols++;let p=null;for(const v of f.vues){x.n++;if(v.mien&&(v.mien.i==='pose'||v.mien.i==='levre'||v.mien.i==='portail'))x.s++;if(p&&v.fa!==p)x.chg++;p=v.fa;}}
    console.log('\nF. part des vues ou le rayon de la facon tenue annonce pose / levre / portail, et changements de facon par vol');
    for(const k in T)console.log('  '+k.padEnd(14)+(100*T[k].s/Math.max(1,T[k].n)).toFixed(0).padStart(4)+' % des vues · '+(T[k].chg/T[k].vols).toFixed(2)+' changement par vol');}
  /* G. l'axe annonce contre la glisse reelle apres la pose */
  {const L=[];for(const f of W){if(f.fin!=='pose'||!f.apres||f.apres.glisse==null)continue;const x=vueA(f,.3)||f.vues[f.vues.length-1];if(!x||!x.mien||x.mien.i!=='pose')continue;L.push([Math.abs(x.mien.axe||0),f.apres.glisse,Math.abs(x.mien.t-(f.i1-x.im)/60),f.apres.re,Math.abs(f.apres.cap||0)]);}
    const bas=L.filter(l=>l[0]<.2),haut=L.filter(l=>l[0]>=.35);
    console.log('\nG. poses annoncees 0,3 s avant ('+L.length+') : axe annonce median '+med(L.map(l=>l[0])).toFixed(2)+' rad · glisse reelle mediane '+med(L.map(l=>l[1])).toFixed(2)+' · |cap| a la 1re vue du sol '+med(L.map(l=>l[4])).toFixed(2)+' · erreur de date mediane '+med(L.map(l=>l[2])).toFixed(2)+' s');
    console.log('   axe annonce < 0,2 ('+bas.length+') : glisse reelle '+med(bas.map(l=>l[1])).toFixed(2)+', re-sorties '+(100*bas.filter(l=>l[3]).length/Math.max(1,bas.length)).toFixed(0)+' % · axe annonce >= 0,35 ('+haut.length+') : glisse '+med(haut.map(l=>l[1])).toFixed(2)+', re-sorties '+(100*haut.filter(l=>l[3]).length/Math.max(1,haut.length)).toFixed(0)+' %');
    const P=W.filter(f=>f.fin==='pose'&&f.apres&&f.apres.glisse!=null);
    console.log('   toutes les poses ('+P.length+') : glisse mediane '+med(P.map(f=>f.apres.glisse)).toFixed(2)+' · re-sorties en moins de 0,8 s '+(100*P.filter(f=>f.apres.re).length/Math.max(1,P.length)).toFixed(0)+' % · poses dessous '+P.filter(f=>f.apres.dessous).length);}
  /* R. les lois « retour » : ce que leurs rayons annoncent, a cote de versRoute, a la 1re et a la 4e vue */
  for(const quand of [0,3]){const N=Math.max(0,...W.map(f=>f.vues[0]&&f.vues[0].ret?f.vues[0].ret.length:0));if(!N)break;
    const lois=[['versRoute',x=>x.vr],['versRoutePlane',x=>x.vrp]];for(let i=0;i<N;i++)lois.push(['retour'+i,x=>x.ret&&x.ret[i]]);
    console.log('\nR. a la '+(quand+1)+'e vue du vol : ce qu annonce chaque loi (sur '+W.filter(f=>f.vues.length>quand).length+' vols)');
    for(const [nom,de] of lois){const T={},ax=[],ts=[];let n=0;for(const f of W){const x=f.vues[quand];if(!x)continue;const q=de(x);n++;const k=iss(q);T[k]=(T[k]||0)+1;if(q&&q.i==='pose'&&!q.d){ax.push(Math.abs(q.axe||0));ts.push(q.t);}}
      console.log('  '+nom.padEnd(15)+' pose dessus '+String(T['pose']||0).padStart(3)+' (axe median '+med(ax).toFixed(2)+', sous 0,2 rad : '+ax.filter(a=>a<.2).length+', duree '+med(ts).toFixed(2)+' s) · sale '+(T['pose sale']||0)+' · DESSOUS '+(T['pose DESSOUS']||0)+' · levre '+(T['levre']||0)+' · portail '+(T['portail']||0)+' · air '+(T['air']||0)+' · fond '+(T['fond']||0)+' · choc '+(T['choc']||0)+' · libre '+((T['libre']||0)+(T['coupe']||0)));}}
  /* H. la nitro en vol */
  {let n=0,nv=0,all=0,vols=0,sans=0;for(const f of W){if(f.dur<1.5)continue;vols++;let p=f.depNitro,a=0,on=0;for(const v of f.vues){n++;if(v.n){nv++;on++;if(!p)a++;}p=v.n;}all+=a;if(!on)sans++;}
    console.log('\nH. vols de plus de 1,5 s ('+vols+') : nitro ordonnee '+(100*nv/Math.max(1,n)).toFixed(0)+' % des vues · '+(all/Math.max(1,vols)).toFixed(2)+' allumage par vol · sans nitro '+(100*sans/Math.max(1,vols)).toFixed(0)+' %');}
  if(A.includes('--morts'))for(const f of W){if(f.fin!=='mort')continue;
    console.log(`\n--- ${f.carte} g ${f.g} t ${f.t0.toFixed(1)} · ${f.dur.toFixed(1)} s · ${f.cause} · depart ${f.depDessous?'DESSOUS':'dessus'} ${f.depKmh} km/h${f.depNitro?' N':''}`);
    console.log('    '+f.vues.filter((v,i)=>f.vues.length<=24||i%2===0||i>f.vues.length-6).map(v=>`${(v.fa||'?').replace('versRoute','vR').replace('Plane','P')}:${v.mien?v.mien.i.slice(0,4)+(v.mien.d?'(d)':'')+'@'+v.mien.t:'-'}[h${Math.round(v.haut)} l${Math.round(v.lat)} a${v.axe}]`).join(' '));}
}
