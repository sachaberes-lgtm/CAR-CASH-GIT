/* ===== RECOMPTER (28/11/2026, relecteur adverse des chiffres) — lecture seule ===== */
'use strict';
const fs=require('fs'),path=require('path');
const D=path.join(__dirname,'..');
const J=JSON.parse(fs.readFileSync(path.join(D,'lecteur-joueurs/sortie.json'),'utf8'));
const B=fs.readFileSync(path.join(D,'../banc-des-genes/etat/courses-2026-48.jsonl'),'utf8').split('\n').filter(Boolean).map(l=>{try{return JSON.parse(l);}catch(e){return null;}}).filter(Boolean);
const q=(a,p)=>{const s=[...a].sort((x,y)=>x-y);const i=(s.length-1)*p,lo=Math.floor(i);return s[lo]+(s[Math.min(lo+1,s.length-1)]-s[lo])*(i-lo);};
const moy=a=>a.reduce((x,y)=>x+y,0)/a.length, sd=a=>{const m=moy(a);return Math.sqrt(a.reduce((x,y)=>x+(y-m)**2,0)/(a.length-1));};
const L=[];const o=s=>{L.push(s);};
o('== JOUEURS ('+J.length+' parties) ==');
const P=J.map(p=>p.palier);o('paliers tries : '+[...P].sort((a,b)=>a-b).join(' ')+' ; moyenne '+moy(P).toFixed(2)+' ; mediane '+q(P,.5));
for(const n of ['Sacha','Leo','Léo']){const a=J.filter(p=>p.joueur===n).map(p=>p.palier);if(a.length)o(n+' : n '+a.length+' sd '+sd(a).toFixed(2)+' mediane '+q(a,.5)+' max '+Math.max(...a));}
const ch=J.filter(p=>p.chances>0);o('parties avec seconde chance : '+ch.map(p=>'P'+p.palier+' ('+p.duree_s+' s)').join(', '));
o('sans les 2 parties a seconde chance : mediane '+q(J.filter(p=>!p.chances).map(p=>p.palier),.5)+' max '+Math.max(...J.filter(p=>!p.chances).map(p=>p.palier)));
/* fin de partie par minute (une partie finie = 1 evenement ; les morts rattrapees par la seconde chance ne comptent pas) */
for(let m=1;m<=5;m++){const vif=J.filter(p=>p.duree_s>=(m-1)*60),fin=vif.filter(p=>p.duree_s<m*60);o('minute '+m+' : '+fin.length+'/'+vif.length);}
const morts=J.reduce((s,p)=>s+1+(p.chances||0),0),min=J.reduce((s,p)=>s+p.duree_s,0)/60;o('morts (fins + secondes chances) '+morts+' en '+min.toFixed(1)+' min = '+(morts/min).toFixed(3)+'/min');
const fen=(a,b)=>{const s=J.filter(p=>p.duree_s>=a&&p.duree_s<b);const pp=s.map(p=>p.pieces_max/p.duree_s*60);return s.length+' parties ; somme/somme '+(s.reduce((x,p)=>x+p.pieces_max,0)/s.reduce((x,p)=>x+p.duree_s,0)*60).toFixed(0)+' ; moyenne des rythmes '+moy(pp).toFixed(0)+' ; champ pieces_min moyen '+moy(s.map(p=>p.pieces_min)).toFixed(0)+' ; mediane pieces '+q(s.map(p=>p.pieces_max),.5);};
o('120-180 s : '+fen(120,180));o('240-400 s : '+fen(240,400));
const t10=J.filter(p=>p.t_palier&&p.t_palier['10']!=null).map(p=>p.t_palier['10']);o('instant du palier 10 (survivants) : n '+t10.length+' mediane '+q(t10,.5).toFixed(0)+' [ '+Math.min(...t10).toFixed(0)+' ; '+Math.max(...t10).toFixed(0)+' ]');
o('pic par joueur/map : '+J.filter(p=>p.cause==='pic').map(p=>p.joueur+'/'+p.map_mort+'/P'+p.palier).join(', '));
o('versions : '+[...new Set(J.map(p=>p.ver))].join(',')+' ; doigt '+J.filter(p=>p.doigt).length+'/'+J.length);
o('\n== BANC ('+B.length+' lignes) ==');
const C=B.filter(r=>r.id==='depart');const pc=C.map(r=>r.palier);
o('c0025 (bras depart) : n '+C.length+' moyenne '+moy(pc).toFixed(2)+' sd '+sd(pc).toFixed(2)+' cv '+(sd(pc)/moy(pc)).toFixed(2)+' mediane '+q(pc,.5)+' max '+Math.max(...pc));
const marche=(R,a,b)=>{const x=R.filter(r=>r.palier>=a).length,y=R.filter(r=>r.palier>=b).length;return y+'/'+x;};
o('c0025 marches 1->5 '+marche(C,1,5)+' 5->10 '+marche(C,5,10)+' 10->15 '+marche(C,10,15));
o('banc   marches 5->10 '+marche(B,5,10)+' 10->15 '+marche(B,10,15)+' 15->20 '+marche(B,15,20));
o('c0025 paliers 1-3 : '+C.filter(r=>r.palier<=3).length+' dont cause tour '+C.filter(r=>r.palier<=3&&r.cause==='tour').length);
const b48=B.filter(r=>r.palier>=4&&r.palier<=8);o('banc paliers 4-8 : '+b48.length+' dont pic '+b48.filter(r=>r.cause==='pic').length);
o('banc palier <=2 : '+(B.filter(r=>r.palier<=2).length/B.length*100).toFixed(1)+' % ; c0025 '+(C.filter(r=>r.palier<=2).length/C.length*100).toFixed(1)+' %');
o('banc <66 s '+(B.filter(r=>r.survie_s<66).length/B.length*100).toFixed(1)+' % ; >240 s '+(B.filter(r=>r.survie_s>240).length/B.length*100).toFixed(1)+' % ; cause air|vide '+(B.filter(r=>r.cause==='air'||r.cause==='vide').length/B.length*100).toFixed(1)+' %');
o('causes du banc : '+JSON.stringify(B.reduce((m,r)=>(m[r.cause]=(m[r.cause]||0)+1,m),{})));
o('morts>1 : '+B.filter(r=>r.morts>1).length+' ; champ morts moyen '+moy(B.map(r=>r.morts)).toFixed(2));
/* le c0025 « meurt comme un joueur par minute » : fins de course par minute de jeu */
const minC=C.reduce((s,r)=>s+r.survie_s,0)/60;o('c0025 : '+C.length+' fins en '+minC.toFixed(0)+' min = '+(C.length/minC).toFixed(3)+'/min ; morts (champ morts) '+(C.reduce((s,r)=>s+r.morts,0)/minC).toFixed(3)+'/min');
/* ecart vrai entre bras */
const parBras={};for(const r of B){(parBras[r.id]=parBras[r.id]||[]).push(r.palier);}
const ms=Object.entries(parBras).filter(([k,a])=>a.length>=48);const mm=ms.map(([k,a])=>moy(a)),se2=ms.map(([k,a])=>sd(a)**2/a.length);
const vt=sd(mm)**2-moy(se2);o('bras >=48 courses : '+ms.length+' ; moyennes '+Math.min(...mm).toFixed(2)+'-'+Math.max(...mm).toFixed(2)+' ; ecart vrai '+(vt>0?Math.sqrt(vt).toFixed(2):'0 (bruit)'));
/* cases des niches, course par course, sur le banc seul */
const bornes=[1,2,3,4.5,6.5,9.5,14,20,31];o('cases course par course (banc) : '+bornes.slice(0,-1).map((b,i)=>'['+b+';'+bornes[i+1]+'[ '+B.filter(r=>r.palier>=b&&r.palier<bornes[i+1]).length).join(' · '));
/* puissance : ecart de log-moyenne reconnaissable */
for(const n of [12,24,48,96]){const r=Math.exp(2*Math.SQRT2*0.5/Math.sqrt(n));o('n '+n+' : rapport '+r.toFixed(2)+' ; niveaux 1-30 '+(1+Math.log(30)/Math.log(r)).toFixed(1));}
/* bornes « jamais » */
o('0/59 -> borne '+(1-Math.pow(0.05,1/59)).toFixed(4)+' ; 0/60 '+(1-Math.pow(0.05,1/60)).toFixed(4)+' ; 0/300 '+(1-Math.pow(0.05,1/300)).toFixed(4));
o('15 min a 95 % : '+((1-Math.pow(.95,1/15))*100).toFixed(3)+' %/min ; 20 min a 99 % : '+((1-Math.pow(.99,1/20))*100).toFixed(3)+' %/min');
const hjeu=420*moy(B.map(r=>r.survie_s))/3600;o('heures de jeu par heure de Ryzen (420/h x survie moyenne banc) : '+hjeu.toFixed(1)+' ; 60x1800 s -> '+(60*1800/3600/hjeu).toFixed(1)+' h ; 59x1200 -> '+(59*1200/3600/hjeu).toFixed(1)+' h ; 300x1200 -> '+(300*1200/3600/hjeu).toFixed(1)+' h');
fs.writeFileSync(path.join(__dirname,'sortie-recompter.txt'),L.join('\n')+'\n');console.log(L.join('\n'));
