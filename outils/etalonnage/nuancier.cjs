/* LE NUANCIER (2026-11-07, Sacha : « une session de finition d'étalonnage pour que toutes les couleurs soient jolies entre elles
   et forment un jeu complet pensé pour mobile ») — rattache les teintes en dur du CSS aux jetons du nuancier (code/css/etalonnage.css).
     node outils/etalonnage/nuancier.cjs --compter [f.css …]       : combien d'occurrences chaque fichier rattacherait
     node outils/etalonnage/nuancier.cjs --rattacher f1.css f2.css : réécrit ces fichiers (hex → var(--jeton)), hors url()
     node outils/etalonnage/nuancier.cjs --surcoucher f1.css …     : écrit sur la sortie une SURCOUCHE (mêmes sélecteurs, seules les
                                                                     déclarations colorées, posée après) pour les fichiers qu'on ne touche pas
   Aucune dépendance. */
const fs=require('fs'),path=require('path');
const MAP={
  /* l'encre : une seule teinte (indigo-violet), du plus profond au filet */
  '#1c0430':'--encre','#0b0730':'--encre','#07050f':'--k0','#050307':'--k0','#0c0919':'--k1','#04061a':'--k1','#130f25':'--k2','#1a0f2e':'--k2',
  '#1b1634':'--k3','#1b1440':'--k3','#272046':'--k4','#272049':'--k4','#2b2350':'--k4','#2a2c33':'--k4','#3a3168':'--kl','#564a8e':'--kl2','#4a4270':'--kl2','#6c6390':'--kl2','#6a6d76':'--kl2',
  '#0a0818':'--tranche','#0b0818':'--tranche','#0a0616':'--txO','#06122e':'--cyanF','#170f55':'--jEncre','#0d0a2a':'--jFond','#3a0f4a':'--auraOmbre','#5a0f4a':'--auraOmbre','#5a0040':'--auraOmbre',
  /* l'or : lèvre, clair, plein, vif, sombre, brun, ombre */
  '#fff8d6':'--au0','#fff3c4':'--au0','#fffdf2':'--au0','#fffbe8':'--au0','#fff6d8':'--au0','#ffe27a':'--au1','#ffe9a0':'--orB','#fff3b0':'--orB','#fff0a8':'--orB','#fff0a0':'--orB',
  '#ffd75e':'--or','#ffc72a':'--au2','#ffc93a':'--au2','#ffc400':'--au2','#ffd23a':'--au2','#f29a00':'--au3','#ea930a':'--au3','#ffb000':'--neoA','#ffb81f':'--neoA','#ffb03a':'--neoA',
  '#9c5200':'--auE','#2a1200':'--auO','#331600':'--auO','#3a1800':'--auT','#7a4400':'--orF','#8a4d00':'--orF','#5c3600':'--orF','#6b4a00':'--orF','#7a4e00':'--orF','#7a5a18':'--orF','#8a5d08':'--orF',
  '#b87400':'--orS','#b06c05':'--orS','#b8790a':'--orS','#b8860b':'--orS','#b98a1d':'--orS',
  /* la nitro (orange) */
  '#ff9d2e':'--nP','#ff9a3c':'--nP','#ff8d2e':'--nP','#ff6a0e':'--nS','#ff7415':'--nS','#ad4200':'--nO','#ffd58f':'--nL',
  /* le rouge : danger, fin, frénésie */
  '#ff4a64':'--neoR','#ff4d6d':'--neoR','#ff5e7a':'--neoR','#ff5a6e':'--neoR','#ff4a4a':'--neoR','#ff2a3d':'--fren','#ff3924':'--fren','#e0283c':'--fren',
  '#ff6b78':'--frenV','#ffd0d5':'--frenC','#ff9fb0':'--frenC','#a8001a':'--frenS','#85091f':'--frenS','#1c0006':'--frenO',
  /* le magenta : la marque, la boutique ; l'aura en rose clair */
  '#ff3ec8':'--neoM','#ff5ec8':'--neoM','#ff7ad5':'--aura','#ff8af0':'--aura','#ff8ad8':'--aura','#ff72d9':'--aura','#ff9ee6':'--aura','#e0249d':'--neoMs','#c2187f':'--neoMs','#c01585':'--neoMf',
  '#b58cff':'--neoL','#b07dff':'--neoL','#b46bff':'--neoL',
  /* le cyan : aller voir, l'information */
  '#00eaff':'--neoC','#9fe8ff':'--cyan','#9ae6ff':'--cyan','#5ee6ff':'--dol','#5ff0ff':'--dol','#7ff0ff':'--dol','#5ec8ff':'--dol','#7dffec':'--mP',
  '#0a8fa8':'--cyanS','#0b7183':'--cyanS','#0a6f80':'--cyanS','#00b6d2':'--cyanM','#00b8d4':'--cyanM','#14b5cc':'--cyanM',
  /* la réserve bleue de la nitro */
  '#4a68f0':'--bP','#2a44c8':'--bS','#16247a':'--bO','#b5c4ff':'--bL',
  /* le vert : allumé, gagné ; le billet */
  '#5ee37a':'--neoV','#3ee87a':'--neoV','#62e062':'--neoV','#46de76':'--neoV','#46f07a':'--neoV','#9ce870':'--neoV','#7dff9b':'--cash','#7dff9a':'--cash','#8dff9e':'--cash',
  '#1f8a4b':'--cashS','#23b853':'--cashS','#d6ffe0':'--cashL','#a7f0bd':'--cashL','#05240f':'--cashO',
  /* le texte */
  '#fff7ee':'--tx','#c9bdf0':'--tx2','#aea5d8':'--tx3','#8c8f98':'--tx3','#b3b8c4':'--tx2','#d9d2f2':'--texte','#a79ed0':'--tx3',
  /* la salle blanche de la boutique : son encre, ses filets, ses gris, son accent */
  '#14171c':'--bqInk','#2a2f38':'--bqInk','#5b6470':'--bqGris','#5b6572':'--bqGris','#6a727c':'--bqGris','#4a5360':'--bqGris',
  '#8a929c':'--bqGris2','#7d8796':'--bqGris2','#a3abb5':'--bqGris2','#aab2bd':'--bqGris2',
  '#dde1e6':'--bqFil','#c9ced6':'--bqFil','#d3d8de':'--bqFil','#d6dbe0':'--bqFil','#e3e6ea':'--bqFil','#c7ccd3':'--bqFil',
  '#eef0f3':'--bqFond2','#f1f3f6':'--bqFond2','#f3f4f6':'--bqFond2','#e9eef5':'--bqFond2','#f4f7fb':'--bqFond2','#3d4bff':'--bqAcc',
  /* (origin/main, v1283) les boîtes blister et la vitrine : rose de l'aura, vert billet */
  '#ff9ad9':'--aura','#7ff0aa':'--cash'};
const A=process.argv.slice(2),mode=A[0],files=A.slice(1);
const RE=/(?<![%\w-])#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![\w-])/g;
function norm(h){h=h.toLowerCase();if(h.length===4)h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];return h;}
/* les zones url(...) : on n'y touche pas */
function zonesUrl(t){const z=[];const r=/url\(/g;let m;while((m=r.exec(t))){let i=m.index+4,p=1;for(;i<t.length&&p;i++){if(t[i]==='(')p++;else if(t[i]===')')p--;}z.push([m.index,i]);}return z;}
function dansUrl(z,i){return z.some(function(a){return i>=a[0]&&i<a[1];});}
/* (2026-11-07, Sacha : « débloque ») LE LOGO DE L'ACCUEIL EST INTOUCHABLE (garde-charte.sh fige l'empreinte de ses lignes) : le rattachement du
   07/11 avait passé ses ors en jetons, l'empreinte a changé et Vercel a refusé toutes les publications (le site est resté en v1286). On saute
   donc les mêmes lignes que la garde : la balise du logo, `.mTitle .lg`, et chaque règle qui COMMENCE par `.lg` ou `@keyframes lgShine`,
   jusqu'à son accolade fermante. */
function zonesLogo(t){const z=[],L=t.split('\n');let p=0,d=0,dans=false,deb=0;const acc=function(l){return (l.match(/\{/g)||[]).length-(l.match(/\}/g)||[]).length;};
  for(const l of L){const fin=p+l.length;
    if(dans){d+=acc(l);if(d<=0){dans=false;z.push([deb,fin]);}}
    else if(/class="lg (gold|grad)" data-t="(CASH|CAR)"/.test(l)||/\.mTitle \.lg/.test(l))z.push([p,fin]);
    else if(/^[ \t]*(\.lg[.:, {]|@keyframes lgShine)/.test(l)){d=acc(l);if(d>0){dans=true;deb=p;}else z.push([p,fin]);}
    p=fin+1;}
  if(dans)z.push([deb,t.length]);return z;}
function rattache(t,compte){const z=zonesUrl(t).concat(zonesLogo(t));return t.replace(RE,function(m,h,i){if(dansUrl(z,i))return m;const k=norm('#'+h),j=MAP[k];if(!j)return m;if(compte)compte[k]=(compte[k]||0)+1;return 'var('+j+')';});}
function somme(c){return Object.values(c).reduce(function(a,b){return a+b;},0);}
if(mode==='--compter'){const dir=path.join(__dirname,'..','..','code','css');const L=files.length?files:fs.readdirSync(dir).filter(function(f){return f.endsWith('.css');}).map(function(f){return path.join(dir,f);});
  let tot=0;for(const f of L){const c={};rattache(fs.readFileSync(f,'utf8'),c);const n=somme(c);tot+=n;if(n)console.log(String(n).padStart(4),path.basename(f));}console.log('total',tot);}
else if(mode==='--rattacher'){for(const f of files){const t=fs.readFileSync(f,'utf8');const c={};const u=rattache(t,c);if(u!==t)fs.writeFileSync(f,u);console.log(String(somme(c)).padStart(4),'rattachées',path.basename(f));}}
else if(mode==='--surcoucher'){
  /* on découpe la feuille en règles ; pour chaque règle (dans son @media), on ne garde que les déclarations qui portent une couleur du nuancier */
  for(const f of files){let t=fs.readFileSync(f,'utf8').replace(/<\/?style[^>]*>/g,'');
    t=t.replace(/\/\*[\s\S]*?\*\//g,'');
    const out=[];let i=0;const N=t.length;
    function lireBloc(prefixe){
      let dep=i;while(i<N){const c=t[i];
        if(c==='}'){i++;return;}
        if(c==='{'){const sel=t.slice(dep,i).trim();i++;
          if(sel[0]==='@'&&!/^@(font-face|page)/.test(sel)){const avant=out.length;lireBloc(prefixe.concat(sel));
            if(out.length>avant){out.splice(avant,0,'  '.repeat(prefixe.length)+sel+'{');out.push('  '.repeat(prefixe.length)+'}');}dep=i;continue;}
          let d=i,p=0;while(i<N&&!(t[i]==='}'&&p===0)){if(t[i]==='(')p++;else if(t[i]===')')p--;i++;}
          const corps=t.slice(d,i);i++;dep=i;
          if(/^@keyframes/.test(prefixe[prefixe.length-1]||''))continue; /* les étapes d'une animation ne se surcouchent pas à la pièce */
          const decls=[];let q=0,s=0;for(let k=0;k<=corps.length;k++){const ch=corps[k];if(ch==='(')q++;else if(ch===')')q--;
            if((ch===';'&&q===0)||k===corps.length){const dcl=corps.slice(s,k).trim();s=k+1;if(!dcl)continue;const c={};const u=rattache(dcl,c);if(Object.keys(c).length)decls.push(u);}}
          if(decls.length&&sel[0]!=='@')out.push('  '.repeat(prefixe.length)+sel+'{'+decls.join(';')+'}');
          continue;}
        i++;}}
    lireBloc([]);
    process.stdout.write('/* --- surcouche de '+path.basename(f)+' --- */\n'+out.join('\n')+'\n');}}
else console.log('--compter | --rattacher fichiers… | --surcoucher fichiers…');
