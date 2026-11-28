/* relecteur : survol des deux lots (lecture seule) */
const fs=require('fs'),path=require('path');
const RAC=path.join(__dirname,'..','..','..','..','..','..'),M=require(path.join(RAC,'ml','bot','mesures.js'));
const lus=fs.readdirSync(path.join(RAC,'ml','bot','etalon')).filter(f=>f.endsWith('.json')).sort().map(f=>({nom:f,j:JSON.parse(fs.readFileSync(path.join(RAC,'ml','bot','etalon',f),'utf8'))}));
const PJ=M.partiesJoueurs(lus);const J=PJ.parties.map(M.finVraie);
const note=JSON.parse(fs.readFileSync(path.join(RAC,'ml','ecurie','agents','tmp-voltige','note-voltige4-t900.json'),'utf8'));
console.log('note keys',Object.keys(note),'partie keys',Object.keys(note.parties[0]));
const B=note.parties.map(p=>M.finVraie(p.partie));
const desc=(c,i)=>{const s=c.ev.filter(e=>e[1]==='piece').reduce((a,e)=>a+e[2],0);
 return [i,c.ver,c.voiture,JSON.stringify(c.ecran),c.fin.t,c.fin.pieces,'pmax',c.pieces_max|0,'somme',s,'chances',c.chances|0,'cols',c.cols.length,'ech',c.ech.length].join(' ');};
console.log('JOUEURS',PJ.lues,PJ.ecartees,PJ.doublons,PJ.recollees);J.forEach((c,i)=>console.log(desc(c,i)));
console.log('BOT');B.forEach((c,i)=>console.log(desc(c,i)));
