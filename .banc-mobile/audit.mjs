/* Audit d'écran exécuté DANS la page (téléphone émulé) : renvoie les défauts de mise en page / de toucher visibles à l'instant. */
export const AUDIT = `(function(INS){
  const W=innerWidth,H=innerHeight,d=document;
  const res={W:W,H:H,docDefile:Math.max(0,d.documentElement.scrollWidth-W),issues:[],n:0};
  const cheminVisible=e=>{for(let n=e;n&&n.nodeType===1;n=n.parentElement){const cs=getComputedStyle(n);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<0.05)return false;}return true;};
  const coupe=r=>{ /* rectangle réellement visible : rognage par les parents overflow≠visible et par l'écran */
    let x0=r.left,y0=r.top,x1=r.right,y1=r.bottom;
    return {x0:x0,y0:y0,x1:x1,y1:y1};
  };
  const desc=e=>{let s=e.tagName.toLowerCase();if(e.id)s+='#'+e.id;else if(e.className&&typeof e.className==='string')s+='.'+e.className.trim().split(/\\s+/).slice(0,2).join('.');
    const t=(e.getAttribute('aria-label')||e.textContent||'').replace(/\\s+/g,' ').trim().slice(0,22);return s+(t?' «'+t+'»':'');};
  const visibleRect=e=>{
    const r=e.getBoundingClientRect();let x0=r.left,y0=r.top,x1=r.right,y1=r.bottom,rogne=false,dansDefil=false;
    for(let n=e.parentElement;n&&n!==d.documentElement;n=n.parentElement){
      const cs=getComputedStyle(n);const ox=cs.overflowX,oy=cs.overflowY;
      const clip=(ox!=='visible'||oy!=='visible');
      if(clip){const pr=n.getBoundingClientRect();
        if(ox!=='visible'){x0=Math.max(x0,pr.left);x1=Math.min(x1,pr.right);}
        if(oy!=='visible'){y0=Math.max(y0,pr.top);y1=Math.min(y1,pr.bottom);}
        if((ox==='auto'||ox==='scroll'||oy==='auto'||oy==='scroll')&&(n.scrollHeight>n.clientHeight+2||n.scrollWidth>n.clientWidth+2))dansDefil=true;}
      if(cs.position==='fixed')break;
    }
    return {r:r,x0:x0,y0:y0,x1:x1,y1:y1,dansDefil:dansDefil};
  };
  /* éléments à toucher : le plus haut parent à curseur « pointer » + les vrais boutons/champs */
  const cibles=[];
  d.querySelectorAll('button,a[href],input,select,textarea,[role=button],[onclick],*').forEach(function(e){
    if(e.closest('svg')&&e.tagName.toLowerCase()!=='svg')return;
    const cs=getComputedStyle(e);
    const tactile=/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(e.tagName)||e.getAttribute('role')==='button'||e.hasAttribute('onclick')||(cs.cursor==='pointer'&&!(e.parentElement&&getComputedStyle(e.parentElement).cursor==='pointer'));
    if(!tactile||cs.pointerEvents==='none'||e.disabled)return;
    if(e.id==='bg'||e.tagName==='CANVAS'||e.tagName==='BODY'||e.tagName==='HTML')return;
    const r=e.getBoundingClientRect();if(r.width<1||r.height<1)return;
    if(!cheminVisible(e))return;
    cibles.push(e);
  });
  res.n=cibles.length;
  const seen=new Set();const push=(t,e,extra)=>{const k=t+desc(e);if(seen.has(k))return;seen.add(k);res.issues.push(Object.assign({t:t,e:desc(e)},extra||{}));};
  const rects=[];
  cibles.forEach(function(e){
    const v=visibleRect(e),r=v.r;
    const aire=r.width*r.height,vw=Math.max(0,Math.min(v.x1,W)-Math.max(v.x0,0)),vh=Math.max(0,Math.min(v.y1,H)-Math.max(v.y0,0)),av=vw*vh;
    if(av<=1){ if(!v.dansDefil)push('hors-champ',e,{r:[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]}); return; }
    if(av<aire*0.9&&!v.dansDefil)push('rogne',e,{pc:Math.round(av/aire*100),r:[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]});
    if(Math.min(vw,vh)<32)push('petit',e,{w:Math.round(vw),h:Math.round(vh)});
    /* le toucher atteint-il bien l'élément ? (centre de la partie visible) */
    const cx=Math.max(v.x0,0)+vw/2,cy=Math.max(v.y0,0)+vh/2;
    const top=d.elementFromPoint(cx,cy);
    if(top&&!e.contains(top)&&!top.contains(e)){const st=getComputedStyle(top);push('recouvert',e,{par:desc(top),pe:st.pointerEvents});}
    else if(top&&top!==e&&!e.contains(top)&&top.contains(e)&&top!==d.body&&top!==d.documentElement){push('recouvert-parent',e,{par:desc(top)});}
    /* marges de sécurité (encoche, barre d'accueil) */
    if(INS&&av<W*H*0.4){
      const tr=Math.max(v.x0,0),tt=Math.max(v.y0,0),rr=Math.min(v.x1,W),bb=Math.min(v.y1,H);
      const dans=[];if(INS.top&&tt<INS.top-1)dans.push('haut '+Math.round(INS.top-tt));if(INS.left&&tr<INS.left-1)dans.push('gauche '+Math.round(INS.left-tr));
      if(INS.right&&rr>W-INS.right+1)dans.push('droite '+Math.round(rr-(W-INS.right)));if(INS.bottom&&bb>H-INS.bottom+1)dans.push('bas '+Math.round(bb-(H-INS.bottom)));
      if(dans.length)push('zone-sure',e,{dans:dans.join(' ')});
    }
    rects.push({e:e,x0:Math.max(v.x0,0),y0:Math.max(v.y0,0),x1:Math.min(v.x1,W),y1:Math.min(v.y1,H)});
  });
  /* chevauchements entre deux zones à toucher (ni l'une dans l'autre) */
  for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){
    const a=rects[i],b=rects[j];if(a.e.contains(b.e)||b.e.contains(a.e))continue;
    const ix=Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0),iy=Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0);if(ix<=0||iy<=0)continue;
    const ia=ix*iy,sa=Math.min((a.x1-a.x0)*(a.y1-a.y0),(b.x1-b.x0)*(b.y1-b.y0));
    if(ia>sa*0.3)push('chevauche',a.e,{avec:desc(b.e),pc:Math.round(ia/sa*100)});
  }
  /* texte rogné : une boîte à overflow caché dont le contenu dépasse */
  d.querySelectorAll('body *').forEach(function(e){
    if(e.children.length>4||!e.firstChild)return;
    const t=(e.textContent||'').trim();if(t.length<2)return;
    const cs=getComputedStyle(e);if(!(cs.overflow==='hidden'||cs.overflowX==='hidden'||cs.textOverflow==='ellipsis'))return;
    if(e.scrollWidth<=e.clientWidth+2&&e.scrollHeight<=e.clientHeight+2)return;
    if(e.clientWidth<4||e.clientHeight<4)return;
    if(!cheminVisible(e))return;const r=e.getBoundingClientRect();if(r.right<0||r.left>W||r.bottom<0||r.top>H)return;
    push('texte-rogne',e,{sw:e.scrollWidth,cw:e.clientWidth,sh:e.scrollHeight,ch:e.clientHeight});
  });
  return res;
})(`;
/* Liste des éléments à toucher visibles (pour s'orienter dans un écran) */
export const LISTE = `(function(){const d=document,W=innerWidth,H=innerHeight,out=[];
  d.querySelectorAll('*').forEach(function(e){const cs=getComputedStyle(e);
    const ok=/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(e.tagName)||e.getAttribute('role')==='button'||(cs.cursor==='pointer'&&!(e.parentElement&&getComputedStyle(e.parentElement).cursor==='pointer'));
    if(!ok||cs.pointerEvents==='none')return;const r=e.getBoundingClientRect();if(r.width<1||r.height<1||r.right<0||r.left>W||r.bottom<0||r.top>H)return;
    for(let n=e;n&&n.nodeType===1;n=n.parentElement){const c=getComputedStyle(n);if(c.display==='none'||c.visibility==='hidden'||+c.opacity<0.05)return;}
    const at=[...e.attributes].filter(a=>/^data-/.test(a.name)).map(a=>a.name+'='+a.value).join(' ');
    out.push((e.id?'#'+e.id:e.tagName.toLowerCase()+(typeof e.className==='string'&&e.className?'.'+e.className.trim().split(/\\s+/).slice(0,2).join('.'):''))+' '+at+' «'+(e.textContent||'').replace(/\\s+/g,' ').trim().slice(0,20)+'» ['+Math.round(r.left)+','+Math.round(r.top)+','+Math.round(r.width)+'×'+Math.round(r.height)+']');});
  return out;})()`;
