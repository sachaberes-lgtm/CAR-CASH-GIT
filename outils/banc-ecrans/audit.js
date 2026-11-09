window.ccAudit=function(root){
  root=root||document;
  const W=innerWidth,H=innerHeight;
  const vis=e=>{const c=getComputedStyle(e);if(c.display==='none'||c.visibility==='hidden'||+c.opacity<.05)return false;const b=e.getBoundingClientRect();if(b.width<2||b.height<2)return false;if(b.right<0||b.bottom<0||b.left>W||b.top>H)return false;let p=e.parentElement;while(p){const pc=getComputedStyle(p);if(pc.display==='none'||pc.visibility==='hidden'||+pc.opacity<.05)return false;p=p.parentElement;}return true;};
  const nom=e=>(e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/).slice(0,3).join('.'):'')+(e.dataset&&e.dataset.m?'[m='+e.dataset.m+']':'')+(e.dataset&&e.dataset.a?'[a='+e.dataset.a+']':''));
  const txt=e=>{let t='';for(const n of e.childNodes)if(n.nodeType===3)t+=n.textContent;return t.trim().slice(0,24);};
  const inter=[...root.querySelectorAll('button,[role=button],[role=tab],[data-m],[data-a],.pbtn,input,select,.gTab,.ivTab,.mLigne,[role=slider],[tabindex="0"]')].filter(vis);
  const out={taille:[],hors:[],chevauche:[],coupe:[],police:[],corps:{}};
  const rects=inter.map(e=>[e,e.getBoundingClientRect()]);
  for(const [e,b] of rects){
    if((b.width<44||b.height<44)&&!(e.closest('input[type=range]')))out.taille.push([nom(e),Math.round(b.width),Math.round(b.height),txt(e)]);
    if(b.left<-1||b.top<-1||b.right>W+1||b.bottom>H+1)out.hors.push([nom(e),Math.round(b.left),Math.round(b.top),Math.round(b.right),Math.round(b.bottom)]);
  }
  for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){const [a,ra]=rects[i],[b,rb]=rects[j];if(a.contains(b)||b.contains(a))continue;
    const ox=Math.min(ra.right,rb.right)-Math.max(ra.left,rb.left),oy=Math.min(ra.bottom,rb.bottom)-Math.max(ra.top,rb.top);
    if(ox>4&&oy>4)out.chevauche.push([nom(a),nom(b),Math.round(ox),Math.round(oy)]);}
  const textes=[...root.querySelectorAll('body *')].filter(e=>vis(e)&&txt(e).length>0&&!e.closest('script,style,svg'));
  for(const e of textes){const c=getComputedStyle(e);
    if(!/press start/i.test(c.fontFamily))out.police.push([nom(e),c.fontFamily.slice(0,30),txt(e)]);
    const fs=Math.round(parseFloat(c.fontSize)*10)/10;out.corps[fs]=(out.corps[fs]||0)+1;
    const nw=c.whiteSpace==='nowrap'||c.whiteSpace==='pre';
    if(e.scrollWidth>e.clientWidth+1&&e.clientWidth>0&&(nw||c.overflow!=='visible'))out.coupe.push([nom(e),e.clientWidth,e.scrollWidth,txt(e)]);
    const b=e.getBoundingClientRect();if(b.right>W+1||b.left<-1)out.coupe.push([nom(e),'horsLargeur',Math.round(b.left),Math.round(b.right),txt(e)]);
  }
  return out;
};'audit prêt';

/* (2026-11-08, sortie du jeu) LES TEXTES VISIBLES : chaque texte feuille d'un élément visible dans la fenêtre (même hors du cadre d'un conteneur qui défile,
   sauf s'il est tout à fait hors fenêtre), plus les aria-label / title / placeholder. Sert au balayage FR/EN : un mot français en anglais, « undefined », « NaN »,
   « [object », une clé brute. Rend [ [texte, « où » ], … ] sans doublon. */
window.ccTextes=function(root){
  root=root||document;const W=innerWidth,H=innerHeight,vu=new Set(),out=[];
  const vis=e=>{for(let p=e;p&&p!==document.documentElement;p=p.parentElement){const c=getComputedStyle(p);if(c.display==='none'||c.visibility==='hidden'||+c.opacity<.05)return false;}const b=e.getBoundingClientRect();return b.width>=1&&b.height>=1&&b.right>=0&&b.bottom>=0&&b.left<=W&&b.top<=H;};
  const nom=e=>e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/).slice(0,2).join('.'):'');
  const ajoute=(t,o)=>{t=(t||'').replace(/\s+/g,' ').trim();if(!t)return;const k=t+'|'+o;if(vu.has(k))return;vu.add(k);out.push([t,o]);};
  for(const e of root.querySelectorAll('body *')){
    if(e.closest('script,style,svg,noscript'))continue;
    let propre=false;for(const n of e.childNodes)if(n.nodeType===3&&n.textContent.trim())propre=true;
    const a=['aria-label','title','placeholder'].map(k=>[k,e.getAttribute(k)]).filter(x=>x[1]);
    if(!propre&&!a.length)continue;if(!vis(e))continue;
    if(propre){let t='';for(const n of e.childNodes)if(n.nodeType===3)t+=n.textContent+' ';ajoute(t,nom(e));}
    for(const [k,v] of a)ajoute(v,nom(e)+'['+k+']');
  }
  return out;
};
'audit prêt';
