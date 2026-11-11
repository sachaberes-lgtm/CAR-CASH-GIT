(function(){
 var W=innerWidth,H=innerHeight,cs=getComputedStyle(document.documentElement);
 var sT=parseFloat(cs.getPropertyValue('--sT'))||0,sB=parseFloat(cs.getPropertyValue('--sB'))||0,sL=parseFloat(cs.getPropertyValue('--sL'))||0,sR=parseFloat(cs.getPropertyValue('--sR'))||0;
 function R(e){if(typeof e==='string')e=document.querySelector(e);if(!e)return null;var b=e.getBoundingClientRect();if(b.width<1||b.height<1)return null;return {x:Math.round(b.left),y:Math.round(b.top),w:Math.round(b.width),h:Math.round(b.height),r:Math.round(b.right),b:Math.round(b.bottom)};}
 function inter(a,b){if(!a||!b)return 0;var w=Math.min(a.r,b.r)-Math.max(a.x,b.x),h=Math.min(a.b,b.b)-Math.max(a.y,b.y);return w>0&&h>0?Math.round(w*h):0;}
 var els={tete:'#gBqTete',titre:'#gBqTete b',solde:'#gBqArg',cats:'#gBqCats',pan:'#gBqPan',rail:'#gBqPan .bqRail',pv:'#gBqPv',nx:'#gBqNx',nom:'#gBqNom',btn:'#gBqBtn',ret:'#gShopBas',jouer:'#gJouer',act:'#gAct',fig:'#bqFigSel'};
 var r={},k;for(k in els)r[k]=R(els[k]);
 var pb=[];
 [].forEach.call(document.querySelectorAll('#gBqCats button,#gBqPv,#gBqNx,#gBqBtn,#gShopBas,#gJouer,#bqFigSel .fsHex'),function(e){var b=R(e);if(b&&(b.w<44||b.h<44))pb.push('PETIT '+(e.id||e.getAttribute('data-c')||String(e.className).slice(0,20))+' '+b.w+'x'+b.h);});
 [['pv','nom'],['nx','nom'],['pv','cats'],['nx','cats'],['nom','cats'],['nom','titre'],['nom','solde'],['pan','act'],['cats','pan'],['pv','pan'],['nx','pan'],['nom','pan'],['btn','pan'],['cats','titre'],['cats','solde'],['pv','titre'],['pv','solde'],['nx','solde'],['pv','btn'],['nx','btn'],['pv','ret'],['nx','jouer'],['pv','jouer'],['btn','ret'],['btn','jouer'],['fig','cats'],['fig','act']].forEach(function(p){var a=inter(r[p[0]],r[p[1]]);if(a>30)pb.push('CHEV '+p[0]+'/'+p[1]+' '+a);});
 ['titre','solde','cats','pv','nx','btn','ret','jouer','pan','nom'].forEach(function(n){var b=r[n];if(!b)return;if(b.x<sL-1||b.r>W-sR+1||b.y<sT-1||b.b>H-sB+1)pb.push('HORS '+n+' x'+b.x+'..'+b.r+' y'+b.y+'..'+b.b);});
 [].forEach.call(document.querySelectorAll('#gBqPan .bqKn,#gBqPan .pCn,#gBqPan .bcN,#gBqNom .bqNom,#gBqBtn,#gBqCats button.on span,#gBqPan .bqSec b,#gBqPan .pNh b,#gBqPan .bcH b'),function(e){var b=e.getBoundingClientRect();if(b.width<1)return;if(e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+2)pb.push('COUPE '+String(e.className||e.tagName).slice(0,14)+' «'+e.textContent.slice(0,20)+'»');});
 var rail=document.querySelector('#gBqPan .bqRail'),rr=rail.getBoundingClientRect(),cards=[].slice.call(rail.querySelectorAll('.bqK,.bcK,.pN'));
 var ent=cards.filter(function(e){var b=e.getBoundingClientRect();return b.left>=rr.left-2&&b.right<=rr.right+2&&b.top>=rr.top-2&&b.bottom<=rr.bottom+2;}).length;
 var vis=cards.filter(function(e){var b=e.getBoundingClientRect();return b.right>rr.left+4&&b.left<rr.right-4&&b.bottom>rr.top+4&&b.top<rr.bottom-4;}).length;
 var d=null;try{d=dbgBqA();}catch(e){}
 if(d&&d.zone){var c=d.caisse,cr={x:c[0],y:c[1],r:c[2],b:c[3]};
  ['pv','nx','cats','pan','titre','solde','act'].forEach(function(n){var a=inter(cr,r[n]);if(a>60)pb.push('CAISSE sur '+n+' '+a);});
  if(c[0]<0||c[2]>W||c[1]<0||c[3]>H)pb.push('CAISSE hors écran '+c.join(','));}
 return JSON.stringify({vp:W+'x'+H,saf:[sT,sB,sL,sR],d:d,nom:r.nom,cats:r.cats,pan:r.pan,pv:r.pv,nx:r.nx,btn:r.btn,act:r.act,carte0:cards[0]&&R(cards[0]),n:cards.length,vis:vis,ent:ent,pb:pb});
})()
