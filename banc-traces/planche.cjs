// node planche.cjs → planche-hasard.html (un seul fichier : plans en SVG + photos en data:), pour Sacha
const JOLI=t=>t.replace(/\bmod\b/g,'module').replace(/\bfum\b/g,'fumeron').replace(/\bluxe\b/g,'luxuriante').replace(/\bgeode\b/g,'PUITS').replace(/\bstal\b/g,'stalactites').replace(/\bmine\b/g,'mine').replace(/\babysse\b/g,'abysses');
const fs=require('fs'),path=require('path'),cp=require('child_process');
const D=__dirname,P=path.join(D,'planche');
cp.execFileSync(process.execPath,[path.join(D,'plans.cjs'),path.join(D,'avant.html'),path.join(D,'..','VERSION PRINCIPALE','index.html'),path.join(D,'plans-palier0.html'),'0']);
const plans=fs.readFileSync(path.join(D,'plans-palier0.html'),'utf8');
const corpsPlans=plans.slice(plans.indexOf('<h2>')).replace(/<h2>/g,'<h3>').replace(/<\/h2>/g,'</h3>');
const stylePlans=(plans.match(/<style>([\s\S]*?)<\/style>/)||[])[1]||'';
const img=f=>{const p=path.join(P,f);if(!fs.existsSync(p))return '<div class="vide">—</div>';return '<img src="data:image/jpeg;base64,'+fs.readFileSync(p).toString('base64')+'">';};
const vues=fs.readFileSync(path.join(D,'vues.txt'),'utf8').trim().split('\n');
const ordres={volcan:[],grotte:[]};for(const l of vues){const m=/\\"ordre\\":\[([^\]]*)\]/.exec(l);if(!m)continue;const o=m[1].replace(/\\"/g,'').split(',').join(' › ');(/mine/.test(o)?ordres.grotte:ordres.volcan).push(JOLI(o));}
const G=['101','202','303'];
const paire=(a,b,cap)=>'<div class="paire"><figure>'+img(a)+'<figcaption>AVANT</figcaption></figure><figure>'+img(b)+'<figcaption>APRÈS'+(cap?' · '+cap:'')+'</figcaption></figure></div>';
let h='<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Volcan et grotte au hasard</title><style>'+stylePlans+
`:root{color-scheme:dark}body{background:#0c0a10;color:#eee;font:14px/1.55 system-ui,sans-serif;margin:16px;max-width:1240px}
h1{font-size:22px}h2{margin:34px 0 8px;font-size:18px;border-top:1px solid #333;padding-top:16px}h3{margin:18px 0 4px;font-size:15px}
table{border-collapse:collapse;margin:8px 0}td,th{border:1px solid #333;padding:4px 10px;text-align:left}th{background:#1b1622}
.paire{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0 14px}figure{margin:0}figure img{width:100%;display:block;border-radius:4px}
figcaption{font-size:12px;color:#bbb;margin-top:3px}.vide{height:120px;background:#222}.n{color:#aaa}ul{margin:6px 0}
@media (max-width:700px){.paire{grid-template-columns:1fr}.g{grid-template-columns:repeat(2,180px)!important}}</style>
<h1>Le Royaume de feu et les Profondeurs — tirés au hasard</h1>
<p>Avant, chaque partie avait une graine neuve mais la même <b>recette</b> : le volcan partait plein nord, l'arche tout au début, la montée toujours à mi-parcours ;
la grotte enchaînait toujours mine → luxuriante → puits → stalactites → lave → abysses, plein nord. Maintenant chaque partie tire :</p>
<ul><li><b>Volcan</b> : la direction (±45°), un coude au milieu de la plaine, l'ordre de l'arche, du lac, des fumerons et des modules, le caractère de chaque tronçon
(serpent, grandes courbes, dérive, balcon, chicanes…), la taille de la montée (0,9 à 1,55 tour). Le portail reste en haut du volcan.</li>
<li><b>Grotte</b> : la direction (toutes), l'ordre des quatre salles du milieu (la mine reste la 1re, les abysses la dernière, jamais la lave collée au puits),
la longueur et le caractère de chaque salle, la taille du puits.</li></ul>
<table><tr><th></th><th>avant</th><th>après</th></tr>
<tr><td>Volcan — écart de forme (40 parties)</td><td>0,085</td><td><b>0,23</b></td></tr>
<tr><td>Volcan — l'arche arrive à</td><td>6-10 % du parcours</td><td>6-46 %</td></tr>
<tr><td>Volcan — la montée commence à</td><td>43-49 %</td><td>36-63 %</td></tr>
<tr><td>Grotte — écart de forme</td><td>0,067</td><td><b>0,49</b></td></tr>
<tr><td>Grotte — le puits arrive à</td><td>27-31 %</td><td>10-67 %</td></tr>
<tr><td>Grotte — ordres de salles différents</td><td>1</td><td>11 sur 40 parties (12 possibles)</td></tr>
<tr><td>Longueur, virages les plus serrés, croisements</td><td colspan="2">inchangés (mesurés)</td></tr>
<tr><td>En jeu : 10 constructions par map, courses au pilote, couché / debout / cadre</td><td colspan="2">aucune erreur, aucune mort, rien dans la roche ni la lave sur la route</td></tr></table>
<p class="n">Rebâti le 20/10 sur le <code>main</code> du jour (v723, le nouvel aspect du volcan compris) : les tracés sont les mêmes qu'hier, les photos du volcan sont refaites.</p>\n<p class="n">Repère : la vallée de jade, refaite au hasard le 18/10, est à 0,23. <code>?sans=hasardvolcan</code> et <code>?sans=hasardgrotte</code> rendent les maps d'avant à l'identique.</p>
<h2>1 · Les tracés vus de dessus (12 parties chacune, palier 0)</h2>`+corpsPlans+
'<h2>2 · Vers le volcan — même graine, avant / après</h2>';
G.forEach((g,i)=>{h+='<h3>Graine '+g+'</h3>'+paire('vue-avant-volcan-'+g+'-volcan.jpg','vue-apres-volcan-'+g+'-volcan.jpg',ordres.volcan[i]||'');});
h+='<h2>3 · En course au volcan (10 s après le départ)</h2>'+paire('avant-volcan-soir-1.jpg','apres-volcan-soir-1.jpg','soir')+paire('avant-volcan-nuit-1.jpg','apres-volcan-nuit-1.jpg','nuit');
h+='<h2>4 · Les profondeurs — le puits et les salles, même graine</h2>';
G.forEach((g,i)=>{h+='<h3>Graine '+g+' — '+(ordres.grotte[i]||'')+'</h3>'+paire('vue-avant-grotte-'+g+'-puits.jpg','vue-apres-grotte-'+g+'-puits.jpg','le puits')+paire('vue-avant-grotte-'+g+'-lave.jpg','vue-apres-grotte-'+g+'-lave.jpg','la lave');});
h+='<h2>5 · En course dans la grotte</h2>'+paire('avant-grotte-matin-1.jpg','apres-grotte-matin-1.jpg','torches')+paire('avant-grotte-soir-1.jpg','apres-grotte-soir-1.jpg','magma');
h+='</html>';
fs.writeFileSync(path.join(D,'planche-hasard.html'),h);console.log('planche-hasard.html',Math.round(h.length/1024)+' Ko',JSON.stringify(ordres));
