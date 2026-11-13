(function(P){
const S='html.bqA.bqA.bqA body #garage#garage#garage#garage #gAct#gAct#gAct';
const commun=`
${S}>#gBqBtn#gBqBtn#gBqBtn{margin:0!important;height:52px!important;min-height:52px!important;box-sizing:border-box!important}
${S}>#gBqBtn#gBqBtn#gBqBtn[data-e="achat"]{background:#17132b!important;color:#fff!important;box-shadow:0 4px 0 #000!important;text-shadow:none!important}
${S}>#gBqBtn#gBqBtn#gBqBtn[data-e="achat"] b{color:#ffc93c!important}
${S}>#gBqBtn#gBqBtn#gBqBtn[data-e="eq"]{box-shadow:inset 0 0 0 1px #d9ddea!important;background:#fff!important}
${S}>#gShopBas#gShopBas#gShopBas{box-shadow:inset 0 0 0 1px #d9ddea!important;border:0!important;background:#fff!important;height:52px!important}
html.bqA body #gBq.pan .bqFl{width:52px!important;height:52px!important;box-shadow:inset 0 0 0 1px #d9ddea!important}
${S}{row-gap:8px!important;column-gap:8px!important}
${S}>#gJouer#gJouer#gJouer{margin:0!important;width:auto!important;min-width:0!important;max-width:none!important}
${S}>#gShopBas#gShopBas#gShopBas{width:52px!important;min-width:52px!important;max-width:52px!important;padding:0!important;justify-content:center!important}
${S}>#gShopBas#gShopBas#gShopBas span{display:none!important}
`;
const css={
A:commun+`
${S}{grid-template-columns:52px 1fr 52px!important;grid-template-rows:52px 52px!important}
${S}>#gBqBtn#gBqBtn#gBqBtn{grid-column:2!important;grid-row:1!important}
${S}>#gShopBas#gShopBas#gShopBas{grid-column:1!important;grid-row:2!important}
${S}>#gJouer#gJouer#gJouer{grid-column:2/4!important;grid-row:2!important;height:52px!important}
`,
B:commun+`
${S}{grid-template-columns:52px 1fr!important;grid-template-rows:52px 52px!important}
${S}>#gBqBtn#gBqBtn#gBqBtn{grid-column:1/-1!important;grid-row:1!important}
${S}>#gShopBas#gShopBas#gShopBas{grid-column:1!important;grid-row:2!important}
${S}>#gJouer#gJouer#gJouer{grid-column:2!important;grid-row:2!important;height:52px!important}
html.bqA body #gBq.pan .bqFl{width:40px!important;height:64px!important;background:rgba(255,255,255,.94)!important;box-shadow:0 0 0 1px #d9ddea,0 4px 14px rgba(20,23,40,.14)!important}
`,
C:commun+`
${S}{grid-template-columns:52px 1fr 52px!important;grid-template-rows:52px 52px!important}
${S}>#gBqBtn#gBqBtn#gBqBtn{grid-column:2!important;grid-row:1!important}
${S}>#gJouer#gJouer#gJouer{grid-column:1/-1!important;grid-row:2!important;height:52px!important}
${S}>#gShopBas#gShopBas#gShopBas{position:absolute!important;z-index:20!important;width:52px!important;min-width:52px!important;max-width:52px!important;padding:0!important;justify-content:center!important}
${S}>#gShopBas#gShopBas#gShopBas span{display:none!important}
`};
let st=document.getElementById('mqPiste');if(!st){st=document.createElement('style');st.id='mqPiste';document.head.appendChild(st);}
st.textContent=css[P]||'';
const pv=document.getElementById('gBqPv'),nx=document.getElementById('gBqNx'),bt=document.getElementById('gBqBtn'),ac=document.getElementById('gAct'),rb=document.getElementById('gShopBas');
const set=(e,o)=>{for(const k in o)e.style.setProperty(k,o[k],'important');};
['top','left','right','bottom'].forEach(k=>{pv.style.removeProperty(k);nx.style.removeProperty(k);rb.style.removeProperty(k);});
if(!P){pv._k=null;return 'raz';}
const a=ac.getBoundingClientRect(),b=bt.getBoundingClientRect(),W=innerWidth,H=innerHeight;
if(P==='A'||P==='C'){set(pv,{top:b.top+'px',left:a.left+'px',right:'auto'});set(nx,{top:b.top+'px',right:(W-a.right)+'px',left:'auto'});}
if(P==='B'){const r=document.querySelector('#gBqPan .bqRail').getBoundingClientRect(),im=document.querySelector('#gBqPan .bqK').getBoundingClientRect();const y=im.top+im.height*.36-32;
  set(pv,{top:y+'px',left:(r.left-4)+'px',right:'auto'});set(nx,{top:y+'px',right:(W-r.right-4)+'px',left:'auto'});}
if(P==='C'){rb.offsetWidth;const o=(rb.offsetParent||document.body).getBoundingClientRect();if(W>H){set(rb,{left:(16-o.left)+'px',top:(H-68-o.top)+'px'});}else{set(rb,{left:(12-o.left)+'px',top:(12-o.top)+'px'});const t=document.querySelector('#gBqTete');t.style.setProperty('padding-left','62px','important');}}
else{const t=document.querySelector('#gBqTete');t&&t.style.removeProperty('padding-left');}
return P;})(window.__P)
