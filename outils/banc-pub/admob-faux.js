/* LE FAUX MODULE ADMOB (2026-11-23, la vraie pub dans l'app) — injecté AVANT tout script, APRÈS le faux StoreKit du banc des achats
   (outils/banc-achats/storekit-faux.js, qui pose window.Capacitor). Il imite @capacitor-community/admob 8.4.2 tel que lu dans son code Swift :
   · showRewardVideoAd se RÉSOUT à la récompense (la pub est encore là) puis « onRewardedVideoAdDismissed » à la fermeture ;
     fermée avant la fin : Dismissed, puis rejet REWARDED_AD_CANCELLED ; pas prête : rejet tout de suite ;
   · showInterstitial se résout à l'affichage, « interstitialAdDismissed » à la fermeture ;
   · sans réseau (__ad.reseau=false) : le consentement et les chargements échouent.
   Le banc pilote tout par window.__ad : mode ('vue' | 'annule' | 'rate'), reseau, choix ('REQUIRED' | 'NOT_REQUIRED'), et lit n, log, montre. */
(function(){
  var S=window.__ad={reseau:true,mode:'vue',choix:'REQUIRED',consent:'REQUIRED',att:'notDetermined',attDemande:0,n:{r:0,i:0,prepR:0,prepI:0},montre:null,log:[]};
  var L={},emit=function(n,d){(L[n]||[]).slice().forEach(function(f){try{f(d||{});}catch(e){}});};
  var prR=false,prI=false;
  var AdMob={
    addListener:function(n,f){(L[n]=L[n]||[]).push(f);return Promise.resolve({remove:function(){}});},
    initialize:function(o){S.log.push('initialize:'+JSON.stringify(o||{}));return Promise.resolve();},
    requestConsentInfo:function(){S.log.push('consentInfo');
      return S.reseau?Promise.resolve({status:S.consent,isConsentFormAvailable:true,canRequestAds:S.consent!=='REQUIRED',privacyOptionsRequirementStatus:S.choix}):Promise.reject(new Error('offline'));},
    showConsentForm:function(){S.log.push('consentForm');S.consent='OBTAINED';return Promise.resolve({status:'OBTAINED',canRequestAds:true,privacyOptionsRequirementStatus:S.choix});},
    showPrivacyOptionsForm:function(){S.log.push('privacyForm');return Promise.resolve();},
    trackingAuthorizationStatus:function(){return Promise.resolve({status:S.att});},
    requestTrackingAuthorization:function(){S.attDemande++;S.att='denied';S.log.push('att');return Promise.resolve();},
    prepareRewardVideoAd:function(o){S.n.prepR++;S.log.push('prepR:'+o.adId+':'+o.isTesting);
      return new Promise(function(res,rej){setTimeout(function(){if(!S.reseau)return rej(new Error('no network'));prR=true;res({adUnitId:o.adId});},150);});},
    showRewardVideoAd:function(){
      if(!prR)return Promise.reject(new Error('Reward Video is Not Ready Yet'));
      prR=false;S.n.r++;S.montre='r';S.log.push('showR:'+S.mode);var m=S.mode;
      return new Promise(function(res,rej){setTimeout(function(){
        if(m==='rate'){S.montre=null;emit('onRewardedVideoAdFailedToShow');rej(new Error('failed to present'));return;}
        if(m==='vue'){emit('onRewardedVideoAdReward',{type:'coin',amount:1});res({type:'coin',amount:1});}
        setTimeout(function(){S.montre=null;emit('onRewardedVideoAdDismissed');
          if(m!=='vue'){var e=new Error('Rewarded ad dismissed before earning a reward.');e.code='REWARDED_AD_CANCELLED';rej(e);}},400);},600);});},
    prepareInterstitial:function(o){S.n.prepI++;S.log.push('prepI:'+o.adId+':'+o.isTesting);
      return new Promise(function(res,rej){setTimeout(function(){if(!S.reseau)return rej(new Error('no network'));prI=true;res({adUnitId:o.adId});},150);});},
    showInterstitial:function(){
      if(!prI)return Promise.reject(new Error("Ad wasn't ready"));
      prI=false;S.n.i++;S.montre='i';S.log.push('showI');
      return new Promise(function(res){setTimeout(function(){res();setTimeout(function(){S.montre=null;emit('interstitialAdDismissed');},500);},200);});}
  };
  var C=window.Capacitor||(window.Capacitor={isNativePlatform:function(){return true;},getPlatform:function(){return 'ios';},Plugins:{}});
  C.Plugins=C.Plugins||{};C.Plugins.AdMob=AdMob;
})();
