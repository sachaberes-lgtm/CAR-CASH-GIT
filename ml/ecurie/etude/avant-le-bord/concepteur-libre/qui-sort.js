#!/usr/bin/env node
/* ===== QUI MET LA CAISSE DEHORS : L'ORDRE DU PILOTE OU LA ROUTE ? (28/11/2026, etude « avant le bord », le concepteur libre) =====
   Lecture seule de ../lecteur-traces/sorties/avant-le-bord.json (les 160 decollages subis distincts sur les maps a decor, leurs vues au sol a
   0,3 / 0,6 / 0,8 / 1 / 1,5 / 2 s avant). AUCUNE course.
   L'ordre du pilote au sol est une « ligne » : ligne = lat + 0,9 x vitesse x capVoulu, capVoulu borne a ±0,4 rad (modele.js l.279). On retrouve donc
   le cap que le pilote DEMANDE : capDemande = (ligne − lat) / (0,9 x vitesse), oriente vers le cote de la sortie (positif = vers le bord ou la caisse sortira).
   On le compare au cap REEL de la caisse (capS, vers ce meme bord), pour les decollages mortels, les vrais vols poses (0,5 s ou plus) et les bosses.
   usage : node qui-sort.js -> qui-sort.txt */
'use strict';
const fs=require('fs'),path=require('path');
const J=JSON.parse(fs.readFileSync(path.join(__dirname,'..','lecteur-traces','sorties','avant-le-bord.json'),'utf8'));
const D=J.decollages.filter(d=>!d.voulu);
const q=(a,p)=>{const b=a.filter(x=>x!=null&&isFinite(x)).sort((x,y)=>x-y);if(!b.length)return null;const i=(b.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return +(b[lo]+(b[hi]-b[lo])*(i-lo)).toFixed(2);};
const L=[],dire=s=>L.push(s);
const groupe=d=>d.fin==='mort'?'mort':d.fin==='pose'&&d.dt>=.5?'vol pose':d.fin==='pose'?'bosse':'autre';
const G={mort:[],'vol pose':[],bosse:[],autre:[]};for(const d of D)G[groupe(d)].push(d);
dire('decollages subis distincts sur decor : '+D.length+' ; morts '+G.mort.length+', vrais vols poses (>= 0,5 s) '+G['vol pose'].length+', bosses (< 0,5 s) '+G.bosse.length+', autres '+G.autre.length);
const cmd=u=>u&&u.ligneS!=null&&u.v>0?(u.ligneS-u.latS)/(.9*u.v):null;
dire('');dire('recul | groupe | n | cap DEMANDE vers le bord de sortie (med, 25 %, 75 %) | cap REEL vers ce bord (med) | part des vues ou le pilote demande de S\'ELOIGNER du bord (< -0,05) | part ou il demande a fond (<= -0,39) | part ou il demande VERS le bord (> 0,05)');
for(const R of ['2','1.5','1','0.8','0.6','0.3'])for(const g of ['mort','vol pose','bosse']){
  const U=G[g].map(d=>d.vues[R]).filter(Boolean),c=U.map(cmd).filter(x=>x!=null),n=c.length;if(!n)continue;
  dire([R+' s',g,n,q(c,.5)+' ('+q(c,.25)+' ; '+q(c,.75)+')',q(U.map(u=>u.capS),.5),(c.filter(x=>x<-.05).length/n*100).toFixed(0)+' %',(c.filter(x=>x<=-.39).length/n*100).toFixed(0)+' %',(c.filter(x=>x>.05).length/n*100).toFixed(0)+' %'].join(' | '));}
/* chaque mort : la suite */
dire('');dire('chaque decollage mortel : recul : vitesse, lat vers le bord (28 = le bord), cap reel, cap demande, tenue');
for(const d of G.mort){const s=['2','1.5','1','0.8','0.6','0.3'].map(R=>{const u=d.vues[R];if(!u)return R+':-';const c=cmd(u);return R+': v'+Math.round(u.v)+' lat'+u.latS.toFixed(0)+' cap'+u.capS.toFixed(2)+' dem'+(c==null?'?':c.toFixed(2))+(u.ti===false?' LACHE':'')+(u.nitro?' N':'');}).join(' | ');
  dire('  '+d.course.replace('-tenue','')+' t'+d.td+' '+d.cause+' +'+d.dt+' s'+(d.chaine?' (chaine)':'')+' :: '+s);}
/* la vitesse laterale reelle entre 1 s et 0,6 s, et celle que la loi de ligne peut demander au plus */
dire('');
{const f=g=>G[g].map(d=>d.vues['1']&&d.vues['0.6']?(d.vues['0.6'].latS-d.vues['1'].latS)/(d.vues['1'].recul-d.vues['0.6'].recul):null);
 dire('vitesse laterale reelle vers le bord entre 1 s et 0,6 s avant (m/s), mediane : morts '+q(f('mort'),.5)+', vrais vols poses '+q(f('vol pose'),.5)+', bosses '+q(f('bosse'),.5));}
fs.writeFileSync(path.join(__dirname,'qui-sort.txt'),L.join('\n')+'\n');console.log(L.join('\n'));
