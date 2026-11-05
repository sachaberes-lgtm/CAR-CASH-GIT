// LES PISTES DE L'ÉCRAN MISSIONS — feuilles CSS (et un peu de DOM) injectées dans le VRAI jeu : les vrais éléments (.mcTete, .mcPan, .mcL, .mcNx, .mcFin, #gmBas),
// la vraie DA du garage (laque, filet --fil, coins coupés, Press Start). Rien n'est redessiné. Le portail n'y est pas : il a été retiré de l'onglet le 05/11.
// Chaque variante : { nom, css, js } — js (facultatif) s'exécute dans la page après la feuille ; tout nœud ajouté porte la classe .mkx (nettoyé entre deux pistes).
// Géométrie couchée (844 × 390) : le titre prend ~55 px, la barre RETOUR | JOUER ~89 px (marge comprise) : il reste ~240 px de haut pour les missions.

/* le bas, couché : RETOUR | JOUER sur toute la largeur (la règle existe déjà dans missions.css, « #gMis.m2land #gmBas », mais la moitié droite l'emporte) */
const BAS_LARGE = `
#gMis.mbOn.m2land #gmBas{left:calc(var(--sL) + var(--gut))!important;right:calc(var(--sR) + var(--gut))!important;width:auto!important;transform:none!important;bottom:calc(var(--sB) + 12px)!important}
#gMis.mbOn.m2land #gmBas .gmHome{width:112px!important;flex-direction:row!important;justify-content:center;gap:10px!important;padding:0 12px!important}
#gMis.mbOn.m2land #gmBas .gmJouer{font-size:var(--f6)}
`;
/* couché, A et C : un seul bloc pleine largeur (titre, puis les cartes) qui s'arrête juste au-dessus de la barre ; l'en-tête ENSUITE s'efface, ses carrés montent sur la ligne du titre */
const LAND_PLEIN = `
#gmListe.mcE.land .mcDef{grid-template-columns:1fr!important;grid-template-rows:auto 1fr!important;bottom:calc(var(--mcJh,89px) + 8px)!important;right:calc(var(--sR) + 14px)!important;overflow:hidden!important;top:calc(var(--sT) + 6px)!important}
#gmListe.mcE.land .mcTete{grid-column:1!important;grid-row:1!important;display:flex;align-items:flex-end;gap:18px;padding-top:0}
#gmListe.mcE.land .mcNom{font-size:24px;padding-bottom:11px}
#gmListe.mcE.land .mcTete .mcSous{margin:0 0 12px}
#gmListe.mcE.land .mcTete .mkSqT{display:flex;margin:0 6px 12px auto}
#gmListe.mcE.land .mcPan{grid-column:1!important;grid-row:2!important;max-width:none!important;height:100%!important;margin:0!important;overflow:hidden!important;padding:10px 12px 6px!important}
#gmListe.mcE.land .mcPan .gModeT{display:none}
.mkSqT{display:none}
`;
const SQ_TITRE = function () { const l = document.querySelector('#gmListe'); if (!l.classList.contains('land')) return; const sq = l.querySelector('.mcSq'), t = l.querySelector('.mcTete'); if (sq && t) { const c = sq.cloneNode(true); c.classList.add('mkx', 'mkSqT'); t.appendChild(c); } };

/* ============ A · PLEIN CADRE ============
   Rien n'est ajouté : la liste s'étire entre le titre et JOUER, les quatre cartes se partagent la hauteur, le texte passe de 10 à 12 px,
   la récompense de 10 à 16 px, la jauge de 5 à 10 px. Couché : les quatre cartes en 2 × 2 sur toute la largeur. */
const A = {
  nom: 'A · PLEIN CADRE',
  css: `
#gmListe.mcE:not(.land) .mcDef{display:flex!important;flex-direction:column;overflow:hidden!important;-webkit-mask-image:none!important;mask-image:none!important}
#gmListe.mcE:not(.land) .mcTete{flex:none}
#gmListe.mcE:not(.land) .mcPan{flex:1 1 0!important;min-height:0;max-width:none!important;margin:10px 0 0!important;display:flex!important;flex-direction:column;overflow:hidden!important;padding:14px 14px 10px!important}
#gmListe.mcE:not(.land) .mcPan .gModeT{height:34px;margin-bottom:10px}
#gmListe.mcE:not(.land) .mcL{flex:1 1 0;min-height:0;justify-content:center;gap:12px;padding:10px 14px;margin-bottom:9px}
#gmListe.mcE .mcL .mcLt b{font-size:var(--f3);line-height:1.55}
#gmListe.mcE .mcL .mcCash{font-size:var(--f5)}
#gmListe.mcE .mcL .mcRarS{font-size:var(--f1)}
#gmListe.mcE .mcL .mcJ u{height:10px}
#gmListe.mcE .mcL .mcJ small{font-size:var(--f1)}
#gmListe.mcE .mcL .mcLt .mcSil{width:84px}
#gmListe.mcE .mcL.pret .m2Pr{min-height:38px;padding:0 18px;font-size:var(--f1)}
#gmListe.mcE .mcNx{padding:4px 2px 0;font-size:var(--f1)}
#gmListe.mcE .mcNx i{height:14px}
#gmListe.mcE .mcFin{flex:none;min-height:44px;margin-top:2px;font-size:var(--f1)}
${BAS_LARGE}
${LAND_PLEIN}
#gmListe.mcE.land .mcPan{display:grid!important;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr auto;column-gap:10px;row-gap:0}
#gmListe.mcE.land .mcL{margin-bottom:8px;min-height:0;justify-content:center;gap:8px;padding:8px 12px}
#gmListe.mcE.land .mcLt b{font-size:var(--f1);line-height:1.5}
#gmListe.mcE.land .mcL.pret{flex-direction:row;align-items:center}
#gmListe.mcE.land .mcL.pret .mcLt{flex:1}
#gmListe.mcE.land .mcNx{grid-column:1;grid-row:3;padding:4px 2px 0}
#gmListe.mcE.land .mcFin{grid-column:2;grid-row:3;min-height:30px;margin:0}
`,
  js: SQ_TITRE,
};

/* ============ B · ÉCHELLE ============
   On ajoute ce que l'écran sait déjà mais ne montre pas : OÙ tu en es sur les 13 paliers (une jauge en marches : faits en vert, le courant en blanc,
   le reste éteint) et le palier suivant en grand (quatre cartes caviardées, comme les trois barres noires d'aujourd'hui, mais à leur vraie taille).
   Les cartes de mission gardent leur taille. Couché : l'échelle et le palier suivant remplissent la colonne de gauche, les cartes la colonne de droite. */
const B = {
  nom: 'B · ÉCHELLE',
  css: `
.mkEch{display:flex;align-items:flex-end;gap:4px;height:42px;margin:10px 4px 8px}
.mkEch i{flex:1;display:block;height:calc(10px + var(--n) * 2.5px);background:none;box-shadow:inset 0 0 0 1px var(--fil)}
.mkEch i.ok{background:var(--neoV);box-shadow:0 0 8px color-mix(in srgb,var(--neoV) 55%,transparent)}
.mkEch i.cur{background:linear-gradient(0deg,#fff 0 25%,transparent 25%);box-shadow:inset 0 0 0 2px #fff}
.mkEch i{position:relative}
.mkEch i::after{content:attr(data-n);position:absolute;left:0;right:0;bottom:4px;text-align:center;font-size:var(--f0);line-height:1;color:var(--tx3)}
.mkEch i.ok::after{color:var(--txO)}.mkEch i.cur::after{color:#fff;mix-blend-mode:normal;text-shadow:0 1px 0 var(--txO)}
.mkNext{margin-top:4px;padding-top:10px;border-top:1px solid var(--fil)}
.mkNt{display:flex;align-items:center;gap:10px;margin-bottom:8px;font-size:var(--f1);letter-spacing:2px;color:var(--tx2)}
.mkNt s{flex:1;height:1px;background:var(--fil);text-decoration:none}
.mkNt b{font-weight:400;font-size:var(--f0);letter-spacing:1px;color:var(--tx3)}
.mkGh{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.mkGh u{display:block;height:38px;text-decoration:none;box-sizing:border-box;padding:9px 11px;background:linear-gradient(180deg,rgba(11,8,24,.86),rgba(23,16,46,.86));box-shadow:inset 0 0 0 1px var(--fil);
  clip-path:polygon(7px 0,calc(100% - 7px) 0,100% 7px,100% calc(100% - 7px),calc(100% - 7px) 100%,7px 100%,0 calc(100% - 7px),0 7px)}
.mkGh u i{display:block;height:6px;margin-bottom:5px;background:#05030c;box-shadow:inset 0 0 0 1px var(--fil)}
.mkGh u i+i{width:55%;margin-bottom:0}
#gmListe.mcE .mcNx{display:none}
#gmListe.mcE:not(.land) .mcDef{overflow:hidden!important;-webkit-mask-image:none!important;mask-image:none!important}
#gmListe.mcE:not(.land) .mcPan{margin-top:0!important;max-width:none!important}
#gmListe.mcE .mcL .mcCash{font-size:var(--f3)}
/* couché : colonne de gauche = titre + échelle verticale + palier suivant + réussies ; colonne de droite = les cartes, jusqu'à la barre */
#gmListe.mcE.land .mcDef{top:calc(var(--sT) + 6px)!important;bottom:calc(var(--sB) + 12px)!important;overflow:hidden!important}
#gmListe.mcE.land .mcNom{font-size:24px;padding-bottom:11px}
#gmListe.mcE.land .mcPan{align-self:start;height:calc(100% - var(--mcJh,89px) + 2px)!important;overflow:hidden!important;padding:8px 10px 4px!important}
#gmListe.mcE.land .mcPan .gModeT{display:none}
#gmListe.mcE.land .mcL{margin-bottom:5px;padding:7px 11px;gap:5px}
#gmListe.mcE.land .mcL.pret{flex-direction:row;align-items:center;gap:8px;padding:7px 11px}
#gmListe.mcE.land .mcL.pret .mcLt{flex:1}
#gmListe.mcE.land .mkEchBox{grid-column:1;grid-row:2;align-self:start;margin-top:6px}
#gmListe.mcE.land .mkEch{flex-direction:column-reverse;align-items:flex-start;height:auto;gap:2px;margin:4px 4px 8px}
#gmListe.mcE.land .mkEch i{flex:none;height:10px;width:calc(34px + var(--n) * 13px)}
#gmListe.mcE.land .mkEch i.cur{background:linear-gradient(90deg,#fff 0 25%,transparent 25%)}
#gmListe.mcE.land .mkEch i::after{bottom:auto;top:50%;transform:translateY(-50%);left:6px;right:auto;text-align:left}
#gmListe.mcE.land .mkNext{margin:0 4px;padding-top:8px}
#gmListe.mcE.land .mkNt{font-size:var(--f0)}
#gmListe.mcE.land .mcFin{margin:0 4px!important}
#gmListe.mcE.land .mkGh{grid-template-columns:repeat(4,1fr)}
#gmListe.mcE.land .mkGh u{height:30px;padding:7px 8px}
#gmListe.mcE.land .mkGh u i{height:5px;margin-bottom:4px}
#gmListe.mcE.land .mcFin{min-height:34px;margin-top:0;padding:0 4px}
`,
  js() {
    const def = document.querySelector('#gmListe .mcDef'), pan = def.querySelector('.mcPan'), land = document.querySelector('#gmListe').classList.contains('land');
    const N = 13, cur = 2, mk = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
    const box = mk('div', 'mkx mkEchBox'); const ech = mk('div', 'mkEch');
    for (let i = 1; i <= N; i++) { const c = mk('i', i < cur ? 'ok' : i === cur ? 'cur' : ''); c.style.setProperty('--n', i); c.dataset.n = i; ech.appendChild(c); }
    box.appendChild(ech);
    def.insertBefore(box, pan);
    const nx = mk('div', 'mkx mkNext');
    nx.innerHTML = '<div class="mkNt"><span>PALIER 3</span><s></s><b>CLASSIFIÉ · ENCORE 2</b></div><div class="mkGh"><u><i></i><i></i></u><u><i></i><i></i></u><u><i></i><i></i></u><u><i></i><i></i></u></div>';
    if (land) { box.appendChild(nx); const fin = pan.querySelector('.mcFin'); if (fin) { fin.dataset.mkMoved = '1'; box.appendChild(fin); } }
    else pan.insertBefore(nx, pan.querySelector('.mcFin'));
  },
};

/* ============ C · CARTES ============
   Les quatre missions deviennent un tableau de cartes : récompense en haut (en grand), le texte, puis le pourcentage en grand, le chiffre et la jauge en bas.
   Debout : 2 × 2 sur toute la hauteur ; couché : 4 en ligne sur toute la largeur. La carte « à récupérer » garde son filet vert et son bouton, en pied de carte. */
const C = {
  nom: 'C · CARTES',
  css: `
${BAS_LARGE}
#gmListe.mcE:not(.land) .mcDef{display:flex!important;flex-direction:column;overflow:hidden!important;-webkit-mask-image:none!important;mask-image:none!important}
#gmListe.mcE:not(.land) .mcTete{flex:none}
#gmListe.mcE .mcPan{max-width:none!important;display:grid!important;grid-template-columns:1fr 1fr;column-gap:10px;overflow:hidden!important;margin:10px 0 0!important;padding:14px 14px 10px!important}
#gmListe.mcE:not(.land) .mcPan{flex:1 1 0!important;min-height:0;grid-template-rows:auto 1fr 1fr auto auto}
#gmListe.mcE .mcPan .gModeT{grid-column:1/-1;height:30px;margin-bottom:10px}
#gmListe.mcE .mcL{display:flex;flex-direction:column;justify-content:flex-start;gap:8px;margin:0 0 10px;padding:12px;min-height:0}
#gmListe.mcE .mcL .mcLt{display:contents}
#gmListe.mcE .mcL .mcLt .mbR{order:-1;align-self:flex-start;justify-content:flex-start;min-width:0}
#gmListe.mcE .mcL .mcLt b{order:0;font-size:var(--f3);line-height:1.6}
#gmListe.mcE .mcL .mcCash{font-size:var(--f6);letter-spacing:0}
#gmListe.mcE .mcL .mcRarS{font-size:var(--f3)}
#gmListe.mcE .mcL .mcLt .mcSil{width:92px}
.mkPc{order:1;flex:1 1 auto;display:flex;align-items:center;justify-content:flex-start;font-weight:400;font-size:var(--f8);line-height:1;color:#fff;text-shadow:0 3px 0 var(--txO),0 0 18px color-mix(in srgb,var(--neoV) 50%,transparent)}
.mkPc small{font-size:var(--f4);margin-left:3px;color:var(--neoV);text-shadow:none}
#gmListe.mcE .mcL .mcJ{order:2;flex-direction:column-reverse;align-items:stretch;gap:7px}
#gmListe.mcE .mcL .mcJ u{height:10px}
#gmListe.mcE .mcL .mcJ small{font-size:var(--f1);text-align:right}
#gmListe.mcE .mcL.pret .mcLt b{flex:1 1 auto}
#gmListe.mcE .mcL.pret .m2Pr{order:2;align-self:stretch;justify-content:center;min-height:40px;padding:0 10px}
#gmListe.mcE .mcNx{grid-column:1/-1;padding:2px 2px 0;font-size:var(--f1)}
#gmListe.mcE .mcNx i{height:14px}
#gmListe.mcE .mcFin{grid-column:1/-1;min-height:44px;margin:0;font-size:var(--f1)}
${LAND_PLEIN}
#gmListe.mcE.land .mcPan{grid-template-columns:repeat(4,1fr);grid-template-rows:1fr auto;column-gap:8px;padding:8px 10px 4px!important}
#gmListe.mcE.land .mcL{margin:0 0 6px;padding:10px;gap:6px}
#gmListe.mcE.land .mcL .mcCash{font-size:var(--f5)}
#gmListe.mcE.land .mcL .mcLt b{font-size:var(--f1);line-height:1.5}
#gmListe.mcE.land .mkPc{font-size:var(--f9)}
#gmListe.mcE.land .mcL .mcLt .mcSil{width:70px}
#gmListe.mcE.land .mcNx{grid-column:1/3;grid-row:2}
#gmListe.mcE.land .mcFin{grid-column:3/5;grid-row:2;min-height:28px}
`,
  js() {
    SQ_TITRE_C();
    function SQ_TITRE_C() { const l = document.querySelector('#gmListe'); if (!l.classList.contains('land')) return; const sq = l.querySelector('.mcSq'), t = l.querySelector('.mcTete'); if (sq && t) { const c = sq.cloneNode(true); c.classList.add('mkx', 'mkSqT'); t.appendChild(c); } }
    document.querySelectorAll('#gmListe .mcL').forEach(c => {
      if (c.classList.contains('pret') || c.classList.contains('ok')) return;
      const i = c.querySelector('.mcJ i'), j = c.querySelector('.mcJ'); if (!i || !j) return;
      const w = Math.round(parseFloat(i.getAttribute('data-w') || i.style.width) || 0);
      const b = document.createElement('b'); b.className = 'mkx mkPc'; b.innerHTML = w + '<small>%</small>'; c.insertBefore(b, j);
    });
  },
};

module.exports = { base: { nom: 'BASE (v1145)', css: '' }, a: A, b: B, c: C };
