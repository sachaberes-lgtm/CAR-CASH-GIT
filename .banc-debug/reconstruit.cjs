// reconstruit.cjs — rebâtit la DERNIÈRE version de chaque correctif des agents (18-19/10) à partir des appels récupérés (recup/), dans fix/<map>.json
const fs = require('fs'), path = require('path'), vm = require('vm');
const R = path.join(__dirname, 'recup'), F = path.join(__dirname, 'fix'); fs.mkdirSync(F, { recursive: true });
const lit = n => fs.readFileSync(path.join(R, n), 'utf8').split('\n').slice(1).join('\n');
const heredoc = (s, debut) => { const a = s.indexOf(debut); const b = s.indexOf("<<'EOF'\n", a) + 8; return s.slice(b, s.indexOf('\nEOF', b)); };
const ecrit = (n, L) => { fs.writeFileSync(path.join(F, n + '.json'), JSON.stringify(L, null, 1)); console.log(n, L.length, 'entrée(s)'); };

// VILLE : le Write, puis le passage python sur la dernière entrée (smoothstep sorti en villeSS : rien d'alloué)
{ const J = JSON.parse(lit('ville-correctif-0.txt')); const e = J[J.length - 1]; let n = e.new;
  const r = (a, b) => { if (!n.includes(a)) throw new Error('ville : motif absent ' + a.slice(0, 60)); n = n.replace(a, () => b); };
  r("function villeSFj(f,sv,h){const S=function(a,b,x){const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);}; // vitreSF, en JS\n  if(f===1)return 1+(-.55+.15*sv)*S(.4,1,h);if(f===2)return 1-.28*S(.3,1,h);if(f===3)return (1+.16*Math.sin(3.1416*Math.min(1,Math.max(0,(h-.4)/.45))))*(1-.5*S(.8,1,h));if(f===4)return 1-.2*S(.4,1,h);return 1;}",
    "function villeSS(a,b,x){const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);} // smoothstep\nfunction villeSFj(f,sv,h){ // vitreSF, en JS\n  if(f===1)return 1+(-.55+.15*sv)*villeSS(.4,1,h);if(f===2)return 1-.28*villeSS(.3,1,h);if(f===3)return (1+.16*Math.sin(3.1416*Math.min(1,Math.max(0,(h-.4)/.45))))*(1-.5*villeSS(.8,1,h));if(f===4)return 1-.2*villeSS(.4,1,h);return 1;}");
  r(",aK=f===2?(1.6+1.2*sv)*(sv<.5?-1:1):0,S=function(x){const u=Math.min(1,Math.max(0,(x-.25)/.75));return u*u*(3-2*u);};", ",aK=f===2?(1.6+1.2*sv)*(sv<.5?-1:1):0;");
  r("aK*(S(h0)*(1-t)+S(h1)*t)", "aK*(villeSS(.25,1,h0)*(1-t)+villeSS(.25,1,h1)*t)");
  e.new = n; ecrit('ville', J); }

// GLACIER : le Write (3 entrées), la 1re ôtée, puis l'épaule v2 remise devant
{ const J = JSON.parse(lit('glacier-correctif-0.txt')).slice(1); const s = lit('glacier-correctif-2.txt');
  const a = s.indexOf('c.insert(0,') + 'c.insert(0,'.length, b = s.indexOf('})\njson.dump', a) + 1;
  J.unshift(vm.runInNewContext('(' + s.slice(a, b) + ')')); ecrit('glacier', J); }

ecrit('volcan', JSON.parse(lit('volcan-correctif-0.txt')));
ecrit('canyon', JSON.parse(heredoc(lit('canyon-correctif-0.txt'), 'cat > correctif.json')));
ecrit('nuages', JSON.parse(heredoc(lit('nuages-correctif-0.txt'), 'cat > correctif.json')));
ecrit('meteos', JSON.parse(heredoc(lit('meteos-correctif-0.txt'), 'cat > $W/correctif.json')));
{ const s = lit('crypto-correctif-0.txt'); const a = s.indexOf('C=[') + 2, b = s.indexOf('\njson.dump', a); ecrit('crypto', vm.runInNewContext('(' + s.slice(a, b) + ')')); }

// FORÊT : mkfix.js, puis le passage python (le fût testé en deux temps : tri rapide), exécuté ici
{ let m = heredoc(lit('foret-correctif-0.txt'), 'cat > mkfix.js'); const p = lit('foret-correctif-1.txt');
  const nw = vm.runInNewContext("'''" === '' ? '' : '(' + JSON.stringify(p.slice(p.indexOf("new='''") + 7, p.indexOf("'''\ns=s[:a]"))) + ')');
  // le texte python est une chaîne brute contenant des \\n : le remettre tel que le fichier JS l'attend
  const a = m.indexOf('"      const fut=function'), b = m.indexOf('"      if(k9<=g.sy*1.45');
  m = m.slice(0, a) + nw.replace(/\\\\n/g, '\\n') + m.slice(b);
  const out = {}; vm.runInNewContext(m.replace("const fs=require('fs');", '').replace("fs.writeFileSync('correctif.json',JSON.stringify(L,null,1));", 'out.L=L;'), { out });
  ecrit('foret', out.L); }
