(function(){
 var W=innerWidth,H=innerHeight,pb=[];
 function R(e){if(typeof e==='string')e=document.querySelector(e);if(!e)return null;var b=e.getBoundingClientRect();if(b.width<1||b.height<1)return null;return b;}
 var pan=R('#gBqPan'),rail=document.querySelector('#gBqPan .bqRail'),rr=rail&&rail.getBoundingClientRect();
 if(!document.documentElement.classList.contains('bqIndus')||!document.querySelector('#gBq.pan'))return JSON.stringify(['HORS BOUTIQUE']);
 if(!pan)pb.push('PANNEAU INVISIBLE');
 var cards=[].slice.call(rail.querySelectorAll('.bqK,.bcK,.pN')),vide=rail.querySelector('.bqVide');
 if(!cards.length&&!vide)pb.push('BANDE VIDE (ni carte ni message)');
 if(cards.length){var vis=cards.filter(function(e){var b=e.getBoundingClientRect();return b.width>2&&b.height>2&&b.right>rr.left+4&&b.left<rr.right-4&&b.bottom>rr.top+2&&b.top<rr.bottom-2&&getComputedStyle(e).opacity!=='0';});
   if(!vis.length)pb.push('AUCUNE CARTE EN VUE ('+cards.length+' cartes, sl='+Math.round(rail.scrollLeft)+'/'+Math.round(rail.scrollWidth-rail.clientWidth)+')');
   var vide2=cards.filter(function(e){return !e.querySelector('.bqKn,.bcN,.pCsw,.pCn')});if(vide2.length)pb.push(vide2.length+' CARTE(S) SANS CONTENU');
   cards.forEach(function(e){if(e.classList.contains('part1')||e.classList.contains('part2'))pb.push('CARTE COINCÉE EN DÉPART '+e.getAttribute('data-k'));});}
 var cur=null;try{cur=dbgBqA().cur;}catch(e){}
 var sel=rail.querySelector('.sel');
 if(cards.length&&cur&&!sel&&cards.some(function(e){return e.getAttribute('data-k')===cur}))pb.push('SÉLECTION NON MARQUÉE ('+cur+')');
 var btn=R('#gBqBtn');if(!btn)pb.push('BOUTON D\'ÉTAT ABSENT');
 var pv=R('#gBqPv'),nx=R('#gBqNx');if(!pv||!nx)pb.push('FLÈCHE(S) ABSENTE(S)');
 [['pan',pan],['btn',btn],['pv',pv],['nx',nx]].forEach(function(p){var b=p[1];if(!b)return;if(b.left<-1||b.right>W+1||b.top<-1||b.bottom>H+1)pb.push('HORS ÉCRAN '+p[0]+' '+Math.round(b.left)+'..'+Math.round(b.right)+' y'+Math.round(b.top)+'..'+Math.round(b.bottom));});
 var nom=document.querySelector('#gBqNom .bqNom');if(cur&&(!nom||!nom.textContent.trim()))pb.push('NOM VIDE');
 var jouer=R('#gJouer'),ret=R('#gShopBas');if(!jouer||!ret)pb.push('JOUER/RETOUR ABSENT');
 var cats=[].slice.call(document.querySelectorAll('#gBqCats button')).filter(function(e){return R(e)});if(cats.length<5)pb.push('RAYONS : '+cats.length+' touches seulement');
 var gl=document.documentElement.className.match(/bq[A-Za-z]*/g)||[];
 return JSON.stringify({pb:pb,cur:cur,n:cards.length,sl:rail?Math.round(rail.scrollLeft):0,cls:gl.join(' '),pan:pan?Math.round(pan.left)+'..'+Math.round(pan.right):null});
})()
