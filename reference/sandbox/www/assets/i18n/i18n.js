/* CASH CAR — loader i18n (mandat 3). Charge fr.json/en.json selon navigator.language,
   repli en. XHR synchrone : les fichiers sont locaux/embarqués, t() doit être prêt
   AVANT le script principal. t(key, ...args) substitue {0},{1},... et replie sur la clé. */
(function(){
  function xhr(url){try{var x=new XMLHttpRequest();x.open('GET',url,false);x.send(null);if(x.status===200)return JSON.parse(x.responseText);}catch(e){}return null;}
  var lang=(navigator.language||'en').toLowerCase();
  var dict = (lang.indexOf('fr')===0) ? (xhr('assets/i18n/fr.json')||xhr('assets/i18n/en.json')||{})
                                     : (xhr('assets/i18n/en.json')||xhr('assets/i18n/fr.json')||{});
  window.t = function(key){
    var s = (dict && dict[key] != null) ? dict[key] : key;
    for (var i=1;i<arguments.length;i++){
      s = s.split('{'+ (i-1) +'}').join(String(arguments[i]));
    }
    return s;
  };
  window.I18N_LANG = (lang.indexOf('fr')===0) ? 'fr' : 'en';
  try{document.documentElement.setAttribute('lang', window.I18N_LANG);}catch(e){}
})();
