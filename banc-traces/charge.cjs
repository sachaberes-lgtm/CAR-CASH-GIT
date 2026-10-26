// BANC DES TRACÉS (hors jeu, Node) — extrait les VRAIS générateurs d'index.html et les fait tourner avec des stubs mesurés.
// Pas commité. Usage : const B=require('./charge.cjs')(cheminIndex) ; B.trace('volcan',seed,palier) → {ctrl,Q,...}
const fs=require('fs'),path=require('path'),vm=require('vm');
function finFonction(src,i0){ // i0 = index de la 1re '{' ; rend l'index juste après la '}' qui la ferme (chaînes, gabarits, commentaires, regex)
  let d=0,i=i0,prevSig='';const n=src.length;
  while(i<n){const c=src[i];
    if(c==='/'&&src[i+1]==='/'){i=src.indexOf('\n',i);if(i<0)return n;continue;}
    if(c==='/'&&src[i+1]==='*'){i=src.indexOf('*/',i+2)+2;continue;}
    if(c==='"'||c==="'"){let j=i+1;while(j<n&&src[j]!==c){if(src[j]==='\\')j++;j++;}i=j+1;prevSig='a';continue;}
    if(c==='`'){let j=i+1,dd=0;while(j<n){if(src[j]==='\\'){j+=2;continue;}if(src[j]==='`'&&dd===0)break;if(src[j]==='$'&&src[j+1]==='{'){dd++;j+=2;continue;}if(src[j]==='}'&&dd>0){dd--;j++;continue;}j++;}i=j+1;prevSig='a';continue;}
    if(c==='/'&&/[(,=:\[!&|?{};+\-*%<>~^]|^$/.test(prevSig)){let j=i+1,cls=false;while(j<n){const e=src[j];if(e==='\\'){j+=2;continue;}if(e==='['){cls=true;}else if(e===']'){cls=false;}else if(e==='/'&&!cls)break;else if(e==='\n')break;j++;}
      i=j+1;while(/[a-z]/.test(src[i]))i++;prevSig='a';continue;}
    if(c==='{')d++;else if(c==='}'){d--;if(d===0)return i+1;}
    if(!/\s/.test(c))prevSig=c;
    i++;}
  return n;}
function fonction(src,nom){ // la source de `function nom(` ou `function* nom(`
  const re=new RegExp('\\nfunction\\*?\\s+'+nom.replace(/\$/g,'\\$')+'\\s*\\(');const m=re.exec(src);if(!m)throw new Error('pas de fonction '+nom);
  const i=m.index+1,b=src.indexOf('{',src.indexOf(')',i));return src.slice(i,finFonction(src,b));}
function constante(src,nom){ // `const NOM=` jusqu'au ';' de fin de déclaration au niveau 0
  const re=new RegExp('\\n(const|let)\\s+'+nom+'\\s*=');const m=re.exec(src);if(!m)throw new Error('pas de const '+nom);
  let i=src.indexOf('=',m.index)+1,d=0;const n=src.length;
  for(;i<n;i++){const c=src[i];if(c==='"'||c==="'"){let j=i+1;while(src[j]!==c){if(src[j]==='\\')j++;j++;}i=j;continue;}
    if(c==='/'&&src[i+1]==='/'){i=src.indexOf('\n',i);continue;}
    if('([{'.includes(c))d++;else if(')]}'.includes(c))d--;else if(c===';'&&d===0)break;}
  return src.slice(m.index+1,i+1);}
module.exports=function(cheminIndex){
  const src=fs.readFileSync(cheminIndex,'utf8');
  const THREE=require(path.join(path.dirname(cheminIndex),'vendor','three.min.js'));
  const noms=['mulberry32','adoucirPentes','genJade','genVolcan','vlcTrace3','vlc3Cone','vlcConeY','genGrotte','grtTrace'];
  const opt=['vlcHumeur','vlcTrace4','grtOrdre']; // (les fonctions neuves, si elles existent)
  let code='';for(const n of noms)code+=fonction(src,n)+'\n';
  for(const n of opt){try{code+=fonction(src,n)+'\n';}catch(e){}}
  const consts=['JADE_HUMEURS','JADE_PENTE'];for(const c of consts)code+=constante(src,c).replace(/^const/,'var')+'\n';
  for(const c of ['VLC_HUMEURS','VLC_HASARD','GRT_HASARD','GRT_HUMEURS']){try{code+=constante(src,c).replace(/^(const|let)/,'var')+'\n';}catch(e){}}
  // GRV (la grotte vaste) : la ligne du jeu, GRT_VASTE vrai
  code+='var GRT_VASTE=true;'+constante(src,'GRV').replace(/^const/,'var')+'\n';
  const ctx={THREE,Math,console,LVL:{cur:{carte:'volcan',piste:'volcan'}},ROAD_HALF:28,MODC_ON:true,VLC_BALADE:true,CAMPM:[],MODMARK:[],JADE:{},VOLCAN:{},GROTTE:{},
    __LC:0,__LV:1,__RP:63,location:{search:''}};
  vm.createContext(ctx);
  vm.runInContext(code+'\nfunction longueurCible(){return __LC;}function lvPiste(){return __LV;}function rayonPalier(){return __RP;}',ctx);
  const push=[1.00,1.06,1.12,1.19,1.26,1.34,1.42,1.50,1.59,1.68,1.78,1.88,1.99,2.10,2.21,2.33,2.45,2.58,2.71,2.85,2.99,3.13,3.28,3.44,3.60,3.76,3.90,4.02,4.12,4.20];
  const engLate=t=>1+Math.min(.5,Math.max(0,t-8)*.035),vP=t=>{const u=Math.min(29,t+2);return 2.75*190/3.6*engLate(u)*push[u]*.48;};
  const ALLURE={volcan:.9,grotte:.85,jade:.85};
  const palier=t=>{const v=vP(t),k=Math.min(1,t/25),d=45+(20-45)*k,lv=1+Math.max(0,Math.min(3.4,(v-70)/140*1.4));return {v,lv,d,rp:40+.3*v,lc:c=>d*v*(1.8+(1-1.8)*k)*(ALLURE[c]||1)};};
  const run=g=>{if(g&&typeof g.next==='function'&&!Array.isArray(g)){let r;do{r=g.next();}while(!r.done);return r.value;}return g;};
  function trace(carte,seed,t,o){o=o||{};const P=palier(t||0);ctx.__LC=o.lc!=null?o.lc:P.lc(carte);ctx.__LV=P.lv;ctx.__RP=P.rp;ctx.LVL.cur={carte:carte,piste:carte};
    if(o.sans!=null){ctx.VLC_HASARD=!o.sans;ctx.GRT_HASARD=!o.sans;}ctx.MODMARK.length=0;const rnd=ctx.mulberry32(seed>>>0);const t0=Date.now();
    const ctrl=carte==='volcan'?run(ctx.genVolcan(rnd)):carte==='grotte'?run(ctx.genGrotte(rnd)):carte==='jade'?ctx.genJade(rnd):null;
    const etat=carte==='volcan'?ctx.VOLCAN:carte==='grotte'?ctx.GROTTE:ctx.JADE;
    return {ctrl:ctrl.map(v=>[v.x,v.y,v.z]),Q:etat.Q,etat:Object.assign({},etat),mods:ctx.MODMARK.slice(),ms:Date.now()-t0,palier:P};}
  return {trace,ctx,palier,src};};
