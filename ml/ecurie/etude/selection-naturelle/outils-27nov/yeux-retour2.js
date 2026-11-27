/* jetable : la loi « retour » des yeux, 2e passe (27/11) — LE RETARD DE LA MAIN dans le rayon (rv, rm, rn) et LE COUP DE NITRO (coup) */
const fs=require('fs'),path=require('path');
const BOT=path.join(__dirname,'..','..','..','bot');
const maj=(f,paires)=>{let s=fs.readFileSync(f,'utf8');const crlf=s.includes('\r\n');if(crlf)s=s.replace(/\r\n/g,'\n');
  for(const [a,b] of paires){if(!s.includes(a))throw new Error(path.basename(f)+' : introuvable « '+a.slice(0,70)+' »');if(s.split(a).length!==2)throw new Error(path.basename(f)+' : plusieurs fois « '+a.slice(0,70)+' »');s=s.replace(a,()=>b);}
  fs.writeFileSync(f,crlf?s.replace(/\n/g,'\r\n'):s);console.log('ecrit '+path.basename(f));};
maj(path.join(BOT,'yeux.js'),[
[`     Pour chaque loi : un rayon « retour0 »… « retour3 », APRES tous les autres (ils ne changent pas d'une image), et vue.vol.retours[i] = le volant, le
     manche et la nitro que la loi donne A CET INSTANT — calcules sur l'ecart et l'axe qu'on aura dans « avance » secondes (le retard de la main : le
     rayon, lui, joue la loi sans retard ni avance). Avec « sol », la loi est aussi jouee apres les sorties du sol (bord, gauche, droite). */
  const RET=[],RTC={cn:false};`,
 `     Pour chaque loi : un rayon « retour0 »… « retour3 », APRES tous les autres (ils ne changent pas d'une image), et vue.vol.retours[i] = le volant, le
     manche et la nitro que la loi donne A CET INSTANT. Avec « sol », la loi est aussi jouee apres les sorties du sol (bord, gauche, droite).
     LE RETARD DE LA MAIN (MESURE, 27/11 : une loi qui cabre sous la dalle, jouee sans retard, annoncait 116 poses sur 160 vols ; suivie par une main
     de clavier — le manche lache 0,15 a 0,38 s apres l'ordre, reacteur allume —, la caisse montait a 50 m et finissait dans la roche) : le rayon
     applique chaque commande de la loi « rv », « rm », « rn » secondes APRES l'avoir calculee (le volant, le manche, la nitro ; d'ici la, les touches
     telles qu'elles sont), et la loi est calculee sur l'ecart et l'axe qu'on aura dans « avance » secondes — comme le pilote, qui la suit par
     vue.vol.retours[i]. Tous a zero : la loi pure.
     LE COUP DE NITRO (« coup », en secondes) : la NITRO est tenue ce temps-la a partir de maintenant (une fois le retard « rn » passe), puis la loi
     reprend — l'allumage bref des joueurs (2,6 par vol, 30 % du vol), qui ajoute 46 × la poussee a la vitesse. Le rayon dit si le vol se pose encore. */
  const RET=[],RTC={cn:false},HIS={n:0,v:new Float32Array(64),m:new Int8Array(64),c:new Uint8Array(64)};
  const img=function(x,d){x=+x;return x-x===0?M.max(0,M.min(60,M.round(x*60))):d;};`],
[`        nitroHaut:nbr(q.nitroHaut,1e9,-1e9,1e9),cabre:nbr(q.cabre,-1e9,-1e9,1e9),pique:nbr(q.pique,10,0,1e9),avance:nbr(q.avance,.25,0,1),sol:!!q.sol});}};`,
 `        nitroHaut:nbr(q.nitroHaut,1e9,-1e9,1e9),cabre:nbr(q.cabre,-1e9,-1e9,1e9),pique:nbr(q.pique,10,0,1e9),avance:nbr(q.avance,0,0,1),
        dv:img(q.rv,0),dm:img(q.rm,0),dn:img(q.rn,0),coup:img(q.coup,0),sol:!!q.sol});}};`],
[`      if(loi>=10){if((k-1)%6===0&&(e.dLow<=60||(k-1)%30===0)){retour(e,RET[loi-10],0);cv=PIL.cv;cm=PIL.cm;cn=RTC.cn;}}   /* (2026-11-27) lois 10 a 13 : la loi « retour » du cerveau */`,
 `      if(loi>=10){const P=RET[loi-10];   /* (2026-11-27) lois 10 a 13 : la loi « retour » du cerveau, chaque commande appliquee avec le retard de la main */
        if(k===1)HIS.n=0;
        if((k-1)%6===0){if(HIS.n===0||e.dLow<=60||(k-1)%30===0)retour(e,P,P.avance);if(HIS.n<64){HIS.v[HIS.n]=PIL.cv;HIS.m[HIS.n]=PIL.cm;HIS.c[HIS.n]=RTC.cn?1:0;HIS.n++;}}
        const iv=M.floor((k-1-P.dv)/6),im=M.floor((k-1-P.dm)/6),ic=M.floor((k-1-P.dn)/6);
        cv=iv>=0?HIS.v[M.min(iv,HIS.n-1)]:TEN.cv;cm=im>=0?HIS.m[M.min(im,HIS.n-1)]:TEN.cm;cn=ic>=0?HIS.c[M.min(ic,HIS.n-1)]===1:TEN.cn;
        if(P.coup>0&&k>P.dn&&k<=P.dn+P.coup)cn=true;}`],
[`        f.retours=[];for(let i=0;i<RET.length;i++){retour(E0,RET[i],RET[i].avance);f.retours.push({volant:n2(PIL.cv),manche:PIL.cm,nitro:RTC.cn});}}`,
 `        f.retours=[];for(let i=0;i<RET.length;i++){retour(E0,RET[i],RET[i].avance);f.retours.push({volant:n2(PIL.cv),manche:PIL.cm,nitro:RTC.cn||RET[i].coup>0});}}`]]);
