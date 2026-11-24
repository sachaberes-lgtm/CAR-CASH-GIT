#!/usr/bin/env node
/* ===== L'ESSAI DE L'API (2026-11-24) : la cle est-elle acceptee, et l'appel de boucle.js est-il juste ? =====
   Un appel MINUSCULE par modele (quelques milliemes d'euro en tout), fait exactement comme boucle.js les fait : reponse en flux, reflexion
   adaptative, effort regle, cache, repli sur refus. A lancer une fois apres avoir pose la cle, et apres chaque changement de la fonction
   `demande` de boucle.js.   usage : node essai-api.js [modele …]      (sans rien : les quatre modeles du calibrage) */
const S=require('@anthropic-ai/sdk'),Anthropic=S.default||S;
const TARIFS={'claude-opus-5-5':[4,20,.20],'claude-sonnet-5-5':[2,10,.10],'claude-haiku-5-5':[.10,.50,.01],'claude-fable-5-2':[8,40,.20]};
const modeles=process.argv.slice(2).length?process.argv.slice(2):Object.keys(TARIFS);
(async function(){
  let client;try{client=new Anthropic({maxRetries:2});}catch(e){console.log('pas de cle dans l\'environnement (ANTHROPIC_API_KEY)');process.exit(1);}
  let total=0;
  for(const m of modeles){
    const T=TARIFS[m]||[0,0,0],params={model:m,max_tokens:2000,thinking:{type:'adaptive'},output_config:{effort:'low'},
      system:[{type:'text',text:'Tu reponds en un mot.',cache_control:{type:'ephemeral'}}],messages:[{role:'user',content:[{type:'text',text:'Reponds exactement : OK'}]}]};
    const repli=/^claude-(opus-5-5|opus-5|sonnet-5-5|fable-5-2|fable-5-1)$/.test(m);let msg=null,comment=repli?'avec repli':'sans repli';
    try{msg=await (repli?client.beta.messages.stream(Object.assign({betas:['server-side-fallback-2026-07-01'],fallbacks:'default'},params)):client.messages.stream(params)).finalMessage();}
    catch(e){
      if(e instanceof Anthropic.AuthenticationError||e instanceof Anthropic.PermissionDeniedError){console.log(m+' : CLE REFUSEE ('+e.status+') — '+String(e.message).slice(0,140));process.exit(1);}
      if(e instanceof Anthropic.BadRequestError&&repli){comment='SANS repli (refuse : '+String(e.message).slice(0,100)+')';
        try{msg=await client.messages.stream(params).finalMessage();}catch(e2){console.log(m+' : ECHEC '+(e2.status||'')+' — '+String(e2.message).slice(0,160));continue;}}
      else{console.log(m+' : ECHEC '+(e.status||'')+' — '+String(e.message).slice(0,200));continue;}}
    const u=msg.usage,c=((u.input_tokens|0)*T[0]+(u.cache_creation_input_tokens|0)*T[0]*1.25+(u.cache_read_input_tokens|0)*T[2]+(u.output_tokens|0)*T[1])/1e6;total+=c;
    console.log(`${m} : « ${msg.content.filter(b=>b.type==='text').map(b=>b.text).join('').trim().slice(0,30)} » · fin ${msg.stop_reason} · ${comment} · ${u.input_tokens} jetons lus, ${u.output_tokens} ecrits · ${c.toFixed(5)} $`);}
  console.log('total de l\'essai : '+total.toFixed(5)+' $');
})();
