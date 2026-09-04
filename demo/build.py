#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CASH CAR — DEMO BUILD
=====================
Builds the shareable demo from `game/index.html`. The full game is never touched:
everything here is a text patch applied to a copy, and every patch is CHECKED —
if a pattern no longer matches (game refactor), the build stops instead of
silently producing a half-patched file.

Kept   : SURVIVOR mode (7 police cars, the last one explodes every 60 s) + GARAGE.
Dropped: the plain race ("solo"), FREESTYLE PARK, SANDBOX, the TOP 10 leaderboard.
Language: English by default.

Two outputs:
  demo/index.html                  — standalone file, double-click or serve locally
  demo/cash-car-demo.artifact.html — same page, stripped of its <html>/<head>/<body>
                                     skeleton, for publishing behind a link

Usage:  python3 demo/build.py
"""
import base64, json, os, re, sys

# Public base URL of the deployed demo. Open Graph needs ABSOLUTE urls — Slackbot
# will not resolve a relative og:image — so this is the one line to change if the
# demo lands on a different host or domain.
BASE = 'https://car-cash-git.vercel.app'

ROOT = os.path.dirname(os.path.abspath(__file__))

# OÙ EST LE JEU. Ce dossier vit dans deux mondes : à côté du jeu (`~/cash-car/`, où
# `../game` tombe juste) et seul dans le dépôt de la démo, où il n'y a pas de jeu à
# côté. On accepte donc un chemin explicite plutôt que d'échouer sur une ligne de
# `FileNotFoundError` que personne ne sait lire :
#     python3 build.py /chemin/vers/game
#     CASHCAR_GAME=/chemin/vers/game python3 build.py
GAME = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else \
       os.path.abspath(os.environ.get('CASHCAR_GAME') or os.path.join(ROOT, '..', 'game'))
SRC  = os.path.join(GAME, 'index.html')
OUT  = os.path.join(ROOT, 'index.html')

if not os.path.isfile(SRC):
    sys.exit("Jeu introuvable : %s\n"
             "Ce dossier fabrique la démo À PARTIR du jeu complet ; il ne le contient pas.\n"
             "Donne-lui le chemin :  python3 build.py /chemin/vers/game" % SRC)

html = open(SRC, encoding='utf-8').read()
applied = []

skipped = []

def patch_re(label, pattern, new, flags=0, count=1):
    """Same contract as patch(), matched by regular expression.

    For the lines the game keeps rewriting — the service-worker registration has
    had three shapes already. An exact string misses them on every touch-up."""
    global html
    html2, n = re.subn(pattern, new, html, flags=flags)
    if n != count:
        sys.exit("PATCH NOT FOUND (%d match(es), %d expected): %s\n  regex: %.90r"
                 % (n, count, label, pattern))
    html = html2
    applied.append(label)

def patch(label, old, new, count=1, opt=False):
    """Replace `old` by `new`, demanding it occurs exactly `count` times.

    `opt=True` marks a patch the game may legitimately have dropped (a cosmetic
    element that no longer exists upstream): it is reported as skipped instead of
    stopping the build. Everything the demo actually depends on stays mandatory —
    a silent no-op there would ship a half-converted game."""
    global html
    n = html.count(old)
    if n != count:
        if opt and n == 0:
            skipped.append(label)
            return
        sys.exit("PATCH NOT FOUND (%d occurrence(s), %d expected): %s\n  pattern: %.90r"
                 % (n, count, label, old))
    html = html.replace(old, new)
    applied.append(label)

# ================================================================= 1. THE MODES
# Survivor is armed from the start: the demo has no other run to offer.
patch("survivor armed by default",
      "const SURV={armed:false,",
      "const SURV={armed:true,")

# The two desktop toggles stay in the DOM (other code reads them) but do nothing.
patch("survivor toggle disarmed", """survBtnEl.addEventListener('click',e=>{e.stopPropagation();
  SURV.armed=!SURV.armed;
  if(SURV.armed&&PARK.on){PARK.on=false;parkBtnEl.textContent='🛝 Parc freestyle · OFF';if(!started)rebuildMenuScene();} // course + police : on quitte le parc
  survBtnEl.textContent='🏁 Survivant · '+(SURV.armed?'ON':'OFF');
  if(started&&!gameOver)showMsg(SURV.armed?'MODE SURVIVANT AU PROCHAIN DÉPART':'SURVIVANT DÉSARMÉ');
});""",
      "/* DEMO: Survivor is the only mode — the toggle is disarmed. */\n"
      "survBtnEl.addEventListener('click',e=>{e.stopPropagation();});")

patch("freestyle park toggle disarmed", """parkBtnEl.addEventListener('click',e=>{e.stopPropagation();
  PARK.on=!PARK.on;
  parkBtnEl.textContent='🛝 Parc freestyle · '+(PARK.on?'ON':'OFF');
  if(PARK.on&&SURV.armed){SURV.armed=false;survBtnEl.textContent='🏁 Survivant · OFF';} // parc = pas de police
  if(!started)rebuildMenuScene(); // au menu : on montre déjà le parc (et le prochain départ y roulera)
  else showMsg(PARK.on?'🛝 PARC FREESTYLE AU PROCHAIN DÉPART':'RETOUR À LA COURSE');
});""",
      "/* DEMO: no freestyle park — the toggle is disarmed (PARK.on stays false). */\n"
      "parkBtnEl.addEventListener('click',e=>{e.stopPropagation();});")

patch("sandbox off",
      "SANDBOX=(SAVE.d.sand===true); // le mode d'entraînement se retient d'une session à l'autre",
      "SANDBOX=false; // DEMO: no training mode — you die for real")

patch("mobile MODES screen trimmed", """      set9('mmSurv','mmSurvS',SURV.armed);
      set9('mmPark','mmParkS',PARK.on);
      set9('mmSand','mmSandS',SANDBOX);""",
      "      set9('mmSurv','mmSurvS',true); // DEMO: only mode, always ON")

patch("mobile mode taps removed", """    else if(a==='surv'){ clic(survBtnEl); mFill(); }
    else if(a==='park'){ clic(parkBtnEl); mFill(); }
    else if(a==='sand'){ SANDBOX=!SANDBOX; SAVE.d.sand=SANDBOX; SAVE.flush(); mFill(); }""",
      "    /* DEMO: no mode to toggle — Survivor is the only one, already armed. */")

# ==================================================================== 2. GARAGE
# A demo lasts ten minutes: a showroom with 14 of 15 cars locked shows nothing.
patch("whole garage unlocked", """function carUnlocked(i){
  if(i<=((SAVE.d.ex&&SAVE.d.ex.floor)|0))return true; // acquise sous les anciennes règles : elle le reste
  const u=CAR_UNLOCK[i];return !u||carStat(u.k)>=u.v;
}""",
      "function carUnlocked(i){return true;} // DEMO: the whole showroom is open — that IS the point")

# =============================================================== 3. LEADERBOARD
# No TOP 10, and therefore no name prompt: a link passed around a channel has no
# shared board behind it, so a local top ten is a table of one person's ghosts.
# `best` still lives (it is written live during the run), so the record chip stays.
patch("leaderboard never qualifies",
      "function lbQualifies(sc){return sc>0&&(leaders.length<10||sc>leaders[leaders.length-1].s);}",
      "function lbQualifies(sc){return false;} // DEMO: no leaderboard, so no name prompt either")
patch("leaderboard never drawn",
      "function renderLeaders(hl){\n  var trophy='🏆 TOP 10';",
      "function renderLeaders(hl){ if(1)return; // DEMO: no board to draw\n  var trophy='🏆 TOP 10';")
patch("record flag from personal best",
      "const isTop=q&&(!leaders.length||sc>leaders[0].s);",
      "const isTop=sc>0&&sc>=best; // DEMO: your own record, no board to top")

# ================================================================== 4. LANGUAGE
patch("english by default",
      "let LANG=(typeof localStorage!=='undefined'&&localStorage.ccLang)||'fr';",
      "let LANG=(typeof localStorage!=='undefined'&&localStorage.ccLang)||'en'; // DEMO: English out of the box")

# The mobile shell is written straight into the HTML/JS in French and never goes
# through TR() — it has to be translated by hand.
MOBILE_FR_EN = [
    ("mobile: BEST chip (home)",  'MEILLEUR : <b id="mBest">',          'BEST: <b id="mBest">', 1),
    ("mobile: BEST chip (dead)",  'MEILLEUR : <b id="mBest2">',         'BEST: <b id="mBest2">', 1),
    ("mobile: PLAY",              '"play">JOUER<',                      '"play">PLAY<', 1),
    ("mobile: PLAY AGAIN",        '"replay">REJOUER<',                  '"replay">PLAY AGAIN<', 1),
    ("mobile: SETTINGS button",   '<i>⚙</i>REGLAGES',                   '<i>⚙</i>SETTINGS', 2),
    ("mobile: SETTINGS heading",  '<h3>REGLAGES</h3>',                  '<h3>SETTINGS</h3>', 1),
    ("mobile: SFX row",           '"snd">SON<b',                        '"snd">SFX<b', 1),
    ("mobile: MUSIC row",         '"mus">MUSIQUE<b',                    '"mus">MUSIC<b', 1),
    ("mobile: VOICE row",         '"vox">VOIX<b',                       '"vox">VOICE<b', 1),
    ("mobile: CONTROLS row",      '"ctl">COMMANDES<b id="mvCtl">VOLANT</b>', '"ctl">CONTROLS<b id="mvCtl">WHEEL</b>', 1),
    ("mobile: GRAPHICS row",      '"q">IMAGE<b id="mvQ">RAPIDE</b>',    '"q">GRAPHICS<b id="mvQ">FAST</b>', 1),
    ("mobile: LANGUAGE row",      '"lang">LANGUE<b id="mvLang">FR</b>', '"lang">LANGUAGE<b id="mvLang">EN</b>', 1),
    ("mobile: copy save",         '"exp">📋 COPIER MA SAUVEGARDE<',     '"exp">📋 COPY MY SAVE<', 1),
    ("mobile: restore save",      '"imp">📥 RESTAURER UN CODE<',        '"imp">📥 RESTORE A CODE<', 1),
    ("mobile: erase progress",    '"wipe">🗑 EFFACER MA PROGRESSION<',  '"wipe">🗑 ERASE MY PROGRESS<', 1),
    ("rotate prompt",
     'REMETS TON TÉLÉPHONE DROIT<br>le jeu se joue à la VERTICALE',
     'TURN YOUR PHONE UPRIGHT<br>this game is played in PORTRAIT', 1, True),  # retiré du jeu le 03/09
    ("mobile js: car label",      "'CAISSE : '",                        "'CAR: '", 1),
    ("mobile js: engine reached", "'MOTEUR ATTEINT - '",                "'ENGINE REACHED - '", 1),
    ("mobile js: end titles",
     "ot.textContent=SANDBOX?'ENTRAINEMENT TERMINE':(rec?'NOUVEAU RECORD !':'GAME OVER');",
     "ot.textContent=rec?'NEW RECORD!':'GAME OVER';", 1),
    ("mobile js: run stats",
     "mStatBox(runStats.tricks,'FIGURES')+mStatBox(Math.round(runStats.vmax),'KM/H MAX')+mStatBox(runStats.zones,'ZONES')",
     "mStatBox(runStats.tricks,'TRICKS')+mStatBox(Math.round(runStats.vmax),'TOP KM/H')+mStatBox(runStats.zones,'ZONES')", 1),
    ("mobile js: control label",  "TCTL.pad?'FLECHES':'VOLANT'",        "TCTL.pad?'ARROWS':'WHEEL'", 1),
    ("mobile js: quality label",  "SAVE.d.q==='net'?'NETTE':'RAPIDE'",  "SAVE.d.q==='net'?'SHARP':'FAST'", 1),
    ("mobile js: copy feedback",  "done('✓ COPIÉ !')",                  "done('✓ COPIED!')", 1),
    ("mobile js: copy prompt",    "prompt('Copie ce code :',c9)",       "prompt('Copy this code:',c9)", 2),
    ("mobile js: paste prompt",   "prompt('Colle ton code de sauvegarde :')", "prompt('Paste your save code:')", 2),
    ("mobile js: restored",       "'✓ RESTAURÉ — RECHARGE…'",           "'✓ RESTORED — RELOADING…'", 2),
    ("mobile js: invalid code",   "'✗ CODE INVALIDE'",                  "'✗ INVALID CODE'", 2),
    ("mobile js: wipe confirm",
     "confirm('EFFACER toute ta progression ?\\nRecords, caisses débloquées et réglages repartent de zéro.')",
     "confirm('ERASE all your progress?\\nRecords, unlocked cars and settings all go back to zero.')", 1),
]
for row in MOBILE_FR_EN:
    label, old, new, cnt = row[:4]
    patch(label, old, new, cnt, opt=(len(row) > 4 and row[4]))

# The survivor HUD is built by string concatenation and never passes through TR().
patch("survivor HUD: you",
      "const rows=[{name:'TOI',totD:pTot,alive:!gameOver,me:true},...SURV.bots]",
      "const rows=[{name:'YOU',totD:pTot,alive:!gameOver,me:true},...SURV.bots]")
patch("survivor HUD: lead",
      "const gap=r.alive?(rk===0?'EN TÊTE':'+'+Math.round(leadD-r.totD)+' m'):'';",
      "const gap=r.alive?(rk===0?'LEAD':'+'+Math.round(leadD-r.totD)+' m'):'';")
patch("survivor HUD: last-place alarm",
      "lastAlertEl.innerHTML='⚠ ATTENTION !<br>VOUS ÊTES DERNIER<br>EXPLOSION DANS : 00:'+String(left).padStart(2,'0');",
      "lastAlertEl.innerHTML='⚠ WARNING<br>YOU ARE LAST<br>EXPLODING IN 00:'+String(left).padStart(2,'0');")

# No neighbouring files at all: the standalone demo is one file, so the PWA
# manifest and the apple icon would only be two 404s in the console.
patch("manifest link dropped",
      '<link rel="manifest" href="manifest.webmanifest">\n', '')
patch("apple icon link dropped",
      '<link rel="apple-touch-icon" href="icon.svg">\n', '')

# ================================================= 4b. THE FRENCH TR() MISSES
# These messages are BUILT by concatenation, so TR() — which matches a whole
# string — never sees a key it knows. They are the ones that flash on screen
# every few seconds in a survivor run, so they get translated at the call site.
patch("msg: pack ladder",
      "const LADDER=[[2,'ÇA CHAUFFE !'],[3,'EN FEU !!'],[4.5,'IL PLEUT DES BILLETS'],[6,'JACKPOT MAX 🤑']];",
      "const LADDER=[[2,'ÇA CHAUFFE !'],[3,'EN FEU !!'],[4.5,'IL PLEUT DES BILLETS'],[6,'JACKPOT MAX 🤑']];\n"
      "const LADDER_EN=['HEATING UP!','ON FIRE!!','IT IS RAINING CASH','MAX JACKPOT 🤑']; // DEMO")
patch("msg: ladder rung",
      "trickMsg('×'+LADDER[ladderI][0]+' — '+LADDER[ladderI][1],",
      "trickMsg('×'+LADDER[ladderI][0]+' — '+(LANG==='en'?LADDER_EN[ladderI]:LADDER[ladderI][1]),")
patch("msg: cop eliminated",
      "trickMsg('💥 '+b.name+' EXPLOSE !',2);",
      "trickMsg('💥 '+b.name+(LANG==='en'?' IS OUT!':' EXPLOSE !'),2);")
patch("msg: drive or die",
      "showMsg('⚠ ROULE OU CRÈVE — '+Math.max(0,6-idleT).toFixed(1)+'s','#ff4d4d');",
      "showMsg(TR('⚠ ROULE OU CRÈVE — ')+Math.max(0,6-idleT).toFixed(1)+'s','#ff4d4d');")
patch("msg: carry-over",
      "trickMsg('REPORT +'+Math.round(rollover),false);",
      "trickMsg(TR('REPORT +')+Math.round(rollover),false);")
patch("msg: currency step",
      "showMsg('💸 TU COMPTES EN '+u[2]+' MAINTENANT !','#7dff9a');",
      "showMsg(TR('💸 TU COMPTES EN ')+u[2]+(LANG==='en'?' NOW!':' MAINTENANT !'),'#7dff9a');")
patch("msg: piggy bank",
      "trickMsg('🐷 TIRELIRE ÉVENTRÉE — '+CUR()+' '+START_CASH.toFixed(2).replace('.',LANG==='en'?'.':',')+' EN POCHE',1);",
      "trickMsg((LANG==='en'?'🐷 PIGGY BANK CRACKED — ':'🐷 TIRELIRE ÉVENTRÉE — ')+CUR()+' '"
      "+START_CASH.toFixed(2).replace('.',LANG==='en'?'.':',')+(LANG==='en'?' IN POCKET':' EN POCHE'),1);")
patch("msg: level cleared",
      "showMsg('★ NIVEAU 1 TERMINÉ — LA ROUTE CONTINUE','#ffd75e');",
      "showMsg(LANG==='en'?'★ LEVEL 1 CLEARED — THE ROAD GOES ON':'★ NIVEAU 1 TERMINÉ — LA ROUTE CONTINUE','#ffd75e');")
patch("fruit names in english",
      "const FRUIT_DEFS=[",
      "const FRUIT_EN={'PÊCHE PLATE':'FLAT PEACH','BANANE':'BANANA','GRENADE':'POMEGRANATE',\n"
      "  'ORANGE':'ORANGE','MYRTILLE':'BLUEBERRY','PASTÈQUE':'WATERMELON'}; // DEMO: the stall speaks English too\n"
      "const FRUIT_DEFS=[")
patch("msg: fruit picked",
      "trickMsg('🍉 '+fd.n+' !',2);",
      "trickMsg('🍉 '+(LANG==='en'?(FRUIT_EN[fd.n]||fd.n):fd.n)+' !',2);")

# The game ships an EN dictionary, but the garage was never finished in it: five
# car names and eleven of the fifteen descriptions have no entry, so a showroom
# in English kept labelling cars "REQUIN". The garage is half this demo, so the
# missing entries are added here — beside the existing ones, overriding nothing.
CAR_EN_NAME = {
  'REQUIN':'SHARK', 'CHAT POP-TART':'POP-TART CAT', 'ACIDE':'ACID',
  'LE CONTREMAÎTRE':'THE FOREMAN',
}
CAR_EN_DESC = {
 'CAISSE À SAVON':"A cube on four casters, a lawnmower engine, roof rails for credibility. It moves — and given where you started, that is a miracle.",
 'PAPA MOBILE':"Seven-seat estate, roof bars, upright tailgate. Built to be driven sensibly. You? Sensible? We believe in you. Hard.",
 'LE CONTREMAÎTRE':"Site pick-up: open bed, roll bar, bull bar, tractor ground clearance. It does not overtake. It RELOCATES.",
 'DIVA BLANCHE':"Straight-grille limousine, chrome emblem. It refuses to drive below 200. So do you, now.",
 'SCALPEL VERT':"Teardrop fastback, engine behind the axle. It cuts corners while everyone else negotiates them.",
 'VEUVE NOIRE':"A wedge of sheet metal laid flat on the road, two scoops in the flanks. Everyone who overtook it still talks about it. Correction: nobody.",
 'LE MANS 24':"Endurance prototype: four long-range lamps, a dorsal fin, a wing off an aircraft carrier. Built to run all night.",
 'COMÈTE 👑':"Stealth wedge, glass bubble, dorsal fin. Queen of the sky, and she knows it. Nobody has ever seen her from the front.",
 'ACIDE':"A Japanese compact left in an acid bath: glazed hood over the block, ironing-board wing, exhaust that spits green.",
 'CHAT POP-TART':"An industrial pastry with a cat's head and four wheels. Nobody asked why. Everybody asked how.",
 'REQUIN':"Glass bubble, great-white snout, four propeller arms folded into the flanks. On the ground it drives. In the air, it hunts.",
}
# Pull each car's French description straight out of the game so the keys can
# never drift from the source: a reworded description simply drops out of the
# supplement (and the build says so) instead of silently mistranslating.
_cars = html[html.index('const CARS=['):html.index('const CAR_UNLOCK=')]
_names = [n.replace("\\'", "'") for n in re.findall(r"name:'((?:[^'\\]|\\.)*)'", _cars)]
_descs = [d.replace("\\'", "'") for d in re.findall(r"desc:'((?:[^'\\]|\\.)*)'", _cars)]
_supp = dict(CAR_EN_NAME)
_orphans = [k for k in CAR_EN_DESC if k not in _names]
if _orphans:
    sys.exit("car description supplement out of sync — unknown car(s): %s" % _orphans)
for n, d in zip(_names, _descs):
    if n in CAR_EN_DESC:
        _supp[d] = CAR_EN_DESC[n]
patch("garage dictionary completed",
      "function TR(s){ // traduction EXACTE, repli français silencieux",
      "Object.assign(I18N," + json.dumps(_supp, ensure_ascii=False, indent=1) +
      "); // DEMO: names and descriptions the game's dictionary never covered\n"
      "function TR(s){ // traduction EXACTE, repli français silencieux")

# ==================================================================== 4c. MUSIC
# The soundtrack file does not ship with this repo, so the playlist is emptied
# (otherwise every run opens with a 404) and its controls are hidden — a button
# that toggles nothing is worse than no button.
patch("music playlist emptied",
      "  run:['assets/audio/music/lvl1-neon-cash-car-v3.mp3'],",
      "  run:[], // DEMO: no soundtrack shipped — empty list, no request, no 404")



# ====================================================================== 5. SAVE
# Its own key: playing the demo must not overwrite the full game's progress.
patch("dedicated save key", "V:2,K:'cashcarSave'", "V:2,K:'cashcarDemoSave'")

# ===================================================================== 6. AUDIO
# The death samples ship with no files in this repo: declare them dead on arrival
# rather than leave four red 404s in the console of everyone who opens the demo.
patch("death sounds disarmed",
      "let deathLast=-1,deathEls=[];\nfunction deathPreload(){\n  try{for(const d of DEATH_LIB){const a=new Audio(DEATH_DIR+d.f);a.preload='auto';a.load();}}catch(e){}\n}",
      "let deathLast=-1,deathEls=[];\n"
      "for(const d of DEATH_LIB)d.dead=true; // DEMO: samples not shipped — silent, never a 404\n"
      "function deathPreload(){}")

patch_re("service worker removed",
      r"^if\('serviceWorker'in navigator.*$",
      "/* DEMO: no service worker (single file, nothing to cache offline). */", re.M)

# ==================================================================== 7. DRESSING
patch("page title",
      "<title>CASH CAR</title>",
      "<title>CASH CAR</title>")
patch("desktop tagline",
      '<div id="tagline">cours après le cash · ne tombe jamais</div>',
      '<div id="tagline">demo · survivor mode · every 60 seconds, the last one explodes</div>')
patch("mobile kicker",
      '<div class="mKick">UNE SEULE VIE · TOUT LE CIEL</div>',
      '<div class="mKick">DEMO · SURVIVOR · 7 COPS</div>')

# The demo's own stylesheet: hide what no longer exists, without touching the DOM the JS reads.
patch("demo stylesheet",
      '<script src="vendor/three.min.js"></script>',
      """<style>
/* ============ CASH CAR DEMO — what is left: SURVIVOR + GARAGE ============
   The nodes of the removed modes stay in the DOM (several functions read them);
   they are simply invisible. A demo menu shows TWO doors, not five. */
#parkBtn,#survBtn{display:none!important}            /* desktop toggles: nothing left to toggle */
#mmPark,#mmSand{display:none!important}              /* FREESTYLE PARK and SANDBOX cards */
#mob .pbtn[data-m="modes"]{display:none!important}   /* the MODES screen has one mode left */
#tpIn .tp[data-a="surv"]{display:none!important}     /* in-game pause: same */
#lbBox,#nameEntry{display:none!important}            /* no leaderboard, so no name prompt */
#musBtn,.setRow[data-tg="musBtn"]{display:none!important}          /* no soundtrack shipped: */
#mob .pbtn[data-m="mus"],#tpIn .tp[data-a="mus"]{display:none!important}   /* hide its controls */
#demoTag{position:fixed;left:10px;top:10px;z-index:60;pointer-events:none;
  font:700 10px/1 'Segoe UI',Arial,sans-serif;letter-spacing:2.5px;text-transform:uppercase;
  color:#0b0714;background:linear-gradient(90deg,#ffd75e,#ff9d3c);padding:6px 10px;border-radius:99px;
  box-shadow:0 2px 14px rgba(255,190,80,.35)}
</style>
<script src="vendor/three.min.js"></script>""")


# =============================================================================
#  8. L'ACCUEIL EST LE GARAGE
#  ---------------------------------------------------------------------------
#  Le menu ne flotte plus au-dessus d'une piste vide : il flotte au-dessus de
#  L'ATELIER, la caisse posée sur son plateau, qu'on fait tourner au doigt pendant
#  qu'on lit les boutons. Trois décisions qui tiennent tout :
#   · l'overlay ne capte plus le clic (pointer-events:none) — seuls ses enfants le
#     font : le glisser-tourner du garage traverse le menu ;
#   · plus de « clique n'importe où pour jouer » : sans ça, chaque geste de rotation
#     partait en course. C'est un bouton qui lance, et lui seul ;
#   · CHANGE CAR n'ouvre pas un autre écran, il DÉPLIE la fiche de sélection sur le
#     même plan 3D. Un seul lieu, deux états.
#  Les boutons réutilisent `.pbtn` — la plaque d'arcade déjà dessinée pour la coque
#  mobile. Redessiner un bouton ici aurait fait deux langages dans le même jeu.
# =============================================================================

# ---- le haut de l'écran : le logo, puis le sceau de l'édition, même typo pixel
patch("home: bandeau titre + sceau",
      '  <h1><span class="lg gold" data-t="CASH">CASH</span><span class="lg grad" data-t="CAR">CAR</span></h1>\n',
      '  <div id="homeTop">\n'
      '    <h1><span class="lg gold" data-t="CASH">CASH</span><span class="lg grad" data-t="CAR">CAR</span></h1>\n'
      '    <div id="demoRibbon"><i>&#9670;</i>Demo edition <b>for Public AI</b><i>&#9670;</i></div>\n'
      '  </div>\n')

# le chip de record descend avec les boutons : au centre, il se posait sur la caisse
patch("home: record descendu en bas", '  <div id="bestChip"></div>\n', '')

# ---- le bas de l'écran : les trois boutons flottants (plus de bouton GARAGE)
patch("home: boutons flottants",
      '  <!-- ================= COQUE MOBILE : accueil · mort · modes · réglages =================',
      '  <div id="homeBot">\n'
      '    <div id="bestChip"></div>\n'
      '    <div id="homeBtns">\n'
      '      <div class="pbtn pb-gold big wide" id="hPlay"><span id="hPlayLbl">Play survivor mode</span></div>\n'
      '      <div id="homeRow">\n'
      '        <div class="pbtn pb-cyan ico" id="hCar"><i>&#127950;</i>Change car</div>\n'
      '        <div class="pbtn pb-cyan ico" id="hSet"><i>&#9881;</i>Settings</div>\n'
      '      </div>\n'
      '    </div>\n'
      '  </div>\n'
      '  <!-- ================= COQUE MOBILE : accueil · mort · modes · réglages =================')


patch("home: plateau tournant ralenti",
      "  if(!garageDrag)garageAng+=dt*.24;         // le tour de piste automatique, lent : on a le temps de regarder",
      "  if(!garageDrag)garageAng+=dt*(gEl.classList.contains('on')?.24:.09); // ACCUEIL : trois fois plus lent —\n"
      "  // on y lit des boutons pendant que ça tourne. Dans la FICHE de sélection, on vient pour\n"
      "  // regarder la caisse : le tour de piste d'origine reprend.")

# ---- CSS : la feuille de la démo accueille la mise en scène de l'accueil
patch("home: feuille de style",
"#lbBox,#nameEntry{display:none!important}            /* no leaderboard, so no name prompt */",
"""#lbBox,#nameEntry{display:none!important}            /* no leaderboard, so no name prompt */
#saveRow,#overlay .go{display:none!important}   /* remplacés par les boutons flottants */

/* ---- L'ACCUEIL FLOTTE SUR L'ATELIER ----
   Deux voiles seulement, en haut et en bas : le titre et les boutons ont leur
   contraste, et le MILIEU — la caisse — reste parfaitement dégagé. Un voile plein
   écran (ce que faisait l'ancien menu) aurait éteint le décor qu'on vient d'allumer. */
#overlay.g3d{
  background:
    linear-gradient(180deg,rgba(7,5,18,.94) 0%,rgba(7,5,18,.60) 14%,rgba(7,5,18,.16) 28%,rgba(7,5,18,0) 42%),
    linear-gradient(0deg, rgba(7,5,18,.94) 0%,rgba(7,5,18,.52) 17%,rgba(7,5,18,0) 42%);
  backdrop-filter:none;-webkit-backdrop-filter:none;
  justify-content:space-between;padding:46px 18px 34px;gap:10px;
  pointer-events:none;cursor:default}
#overlay.g3d>*{pointer-events:auto}        /* le fond, lui, laisse passer le glisser-tourner */
/* l'accroche ne sert qu'en fin de run (elle y porte la punchline de mort) : sur
   l'accueil, le sceau sous le titre dit déjà ce qu'elle disait, et deux lignes qui
   se répètent au-dessus de la caisse, c'est une de trop. */
#overlay.g3d:not(.dead) #tagline{display:none}
#homeTop,#homeBot{display:flex;flex-direction:column;align-items:center;
  transition:opacity .2s ease,transform .2s ease}
#homeTop{gap:13px}
#homeBot{gap:14px;width:min(430px,88vw)}
#overlay.g3d h1{font-size:40px;letter-spacing:6px;gap:18px;margin:0}
#overlay.g3d #bestChip{margin:0}
/* fiche de sélection dépliée : le menu s'efface, la caisse reste */
#overlay.picking #homeTop,#overlay.picking #homeBot{opacity:0;transform:translateY(12px);pointer-events:none}

/* LE SCEAU DE L'ÉDITION — même typo pixel que le logo, sur une plaque à coins coupés.
   Il remplace l'ancienne pastille : une seule fois « démo » à l'écran, pas deux. */
#demoRibbon{display:flex;align-items:center;gap:11px;
  font-family:var(--pix);font-size:8px;line-height:1;letter-spacing:4px;text-transform:uppercase;
  color:#ffd75e;padding:10px 16px;white-space:nowrap;
  background:linear-gradient(180deg,rgba(30,20,9,.86),rgba(13,9,4,.86));
  clip-path:polygon(7px 0,calc(100% - 7px) 0,100% 7px,100% calc(100% - 7px),calc(100% - 7px) 100%,7px 100%,0 calc(100% - 7px),0 7px);
  box-shadow:inset 0 0 0 1px rgba(255,215,94,.42),0 7px 22px rgba(0,0,0,.55)}
#demoRibbon b{font-weight:400;color:#ff9d3c}
#demoRibbon i{font-style:normal;font-size:6px;color:rgba(255,215,94,.38)}

/* LES BOUTONS FLOTTANTS — la plaque d'arcade `.pbtn` du jeu, rien de neuf à inventer */
#homeBtns{display:flex;flex-direction:column;gap:10px;width:100%}
#homeRow{display:flex;gap:10px;width:100%}
#hPlay{font-size:13px;letter-spacing:3px;padding:20px 14px}
#hCar,#hSet{flex:1}

/* fin de run : le verdict se lit sur le décor, il lui faut son ombre portée */
#overlay.g3d #ovSub,#overlay.g3d #finalScore,#overlay.g3d #runStats,#overlay.g3d #bestChip{
  text-shadow:0 2px 12px rgba(0,0,0,.95)}

/* TÉLÉPHONE : la coque mobile garde son fond plein. Sur 380 px de large, un menu qui
   flotte sur un décor, c'est un décor qu'on ne voit pas et un menu qu'on lit mal —
   le garage s'y visite en plein écran, par son propre bouton. */
@media (max-width:820px){
  #overlay.g3d h1{font-size:31px;letter-spacing:4px;gap:12px}
  #demoRibbon{font-size:7px;letter-spacing:2.5px;padding:8px 12px}
}""")

# ---- JS : les deux états de la scène d'accueil
patch("home: fonctions de scène", """function closeGarage(){
  garageOn=false;gEl.classList.remove('on');document.body.classList.remove('inGarage');
  garageFloor.visible=false;
  if(GAR.root)GAR.root.visible=false;                                     // l'atelier s'éteint derrière toi
  stallKey.visible=false;stallKey.intensity=0;stallRim.visible=false;stallRim.intensity=0;
  sunSprite.visible=true;horizonGlow.visible=true;for(const r9 of RAYS)r9.visible=true; // le soleil revient sur la piste
  if(pigGroup)pigGroup.visible=true;
  buildCar(CARS[level||0]);                 // remet la caisse du menu
  camera.up.set(0,1,0);
  frameAt(0,F);camera.position.copy(F.p).addScaledVector(F.t,-9).addScaledVector(F.n,4);camera.lookAt(F.p);
  overlay.style.display='flex';
}""",
"""/* DÉMO — L'ACCUEIL EST LE GARAGE : le menu flotte sur l'atelier, la caisse tourne
   derrière. `homeStage()` allume la scène, `leaveStage()` la rend à la piste. */
function homeStage(){
  garageOn=true;
  if(pigGroup)pigGroup.visible=false;
  if(!GAR.root)buildGarageRoom();          // l'atelier se bâtit à la 1re frame d'accueil
  GAR.root.visible=true;
  garageAng=.42;garagePitch=.22;garageDist=6.9; // trois-quarts avant : la caisse ET l'établi derrière
  garageShow(equippedCar());               // on se présente dans SA caisse, pas dans la première
  gEl.classList.remove('on');              // la fiche de sélection reste repliée
  document.body.classList.add('inGarage');
  overlay.classList.add('g3d');overlay.classList.remove('picking');
  overlay.classList.toggle('dead',!!(started&&gameOver)); // fin de run : l'accroche et le score reviennent
  overlay.style.display='flex';
}
function leaveStage(){
  garageOn=false;
  document.body.classList.remove('inGarage');
  overlay.classList.remove('g3d');overlay.classList.remove('picking');
  gEl.classList.remove('on');
  garageFloor.visible=false;
  if(GAR.root)GAR.root.visible=false;                                     // l'atelier s'éteint derrière toi
  stallKey.visible=false;stallKey.intensity=0;stallRim.visible=false;stallRim.intensity=0;
  sunSprite.visible=true;horizonGlow.visible=true;for(const r9 of RAYS)r9.visible=true; // le soleil revient sur la piste
  if(pigGroup)pigGroup.visible=true;
  camera.up.set(0,1,0);
  // ⚠ REPOSER LA CAISSE SUR LE BITUME. Pendant tout l'accueil, `garageRender` la
  // tient à 1500 m d'altitude sur le plateau de l'atelier. Sans ce respawn, on
  // lançait la partie avec une caisse en chute libre au-dessus de la piste : elle
  // tournoyait dans le vide, le compteur restait à 0 et le couperet du Survivant
  // ne démarrait jamais. `respawn()` rend `mode`, `s`, `lat` et la position à la route.
  respawn();
  frameAt(0,F);camera.position.copy(F.p).addScaledVector(F.t,-9).addScaledVector(F.n,4);camera.lookAt(F.p);
}
// ✕ et Échap ne quittent plus le garage : ils REPLIENT la fiche. On ne sort pas de
// l'atelier, c'est l'écran d'accueil — on n'en sort qu'en allant rouler.
function closeGarage(){ homeStage(); }""")

# ---- le clic « n'importe où » disparaît : la rotation de la caisse le déclenchait
patch("home: plus de clic-pour-jouer",
      "overlay.addEventListener('click',()=>{if(pendingScore!=null)return;if(!started)start();else if(gameOver)resetGame();});",
      "/* DÉMO : le menu flotte sur une caisse qu'on fait TOURNER au doigt — un clic\n"
      "   n'importe où qui lance la partie rendait le garage injouable. C'est le bouton. */\n"
      "overlay.addEventListener('click',e=>{e.stopPropagation();});")

# ---- le glisser-tourner ignore le menu flottant
patch("home: le menu ne déclenche pas la rotation",
      "addEventListener('pointerdown',e=>{if(!garageOn)return;if(e.target.closest&&e.target.closest('#gTop,#gBottom'))return;",
      "addEventListener('pointerdown',e=>{if(!garageOn)return;if(e.target.closest&&e.target.closest('#gTop,#gBottom,#homeTop,#homeBot,#settings'))return;")

# ---- câblage des trois boutons
patch("home: câblage des boutons",
      "$('setBtn').addEventListener('click',e=>{e.stopPropagation();openSettings();});",
      "$('setBtn').addEventListener('click',e=>{e.stopPropagation();openSettings();});\n"
      "// LES TROIS BOUTONS FLOTTANTS DE L'ACCUEIL\n"
      "$('hPlay').addEventListener('click',e=>{e.stopPropagation();\n"
      "  leaveStage(); if(!started)start(); else resetGame(); });\n"
      "$('hCar').addEventListener('click',e=>{e.stopPropagation();      // déplie la fiche SUR la même scène\n"
      "  garageShow(equippedCar());overlay.classList.add('picking');gEl.classList.add('on'); });\n"
      "$('hSet').addEventListener('click',e=>{e.stopPropagation();openSettings();});")

# ---- fin de run : on rentre au garage, et le bouton change de verbe
patch("home: la mort ramène au garage",
      "  goTxt.textContent=TR('▸ CLIQUE LE LOGO POUR REJOUER');",
      "  goTxt.textContent=TR('▸ CLIQUE LE LOGO POUR REJOUER');\n"
      "  {const hl=document.getElementById('hPlayLbl');if(hl)hl.textContent='Play again';} // la mort te ramène à ton garage")
patch("home: scène d'accueil en fin de run",
      "    pendingScore=null;nameEntry.style.display='none';goTxt.style.display='';renderLeaders(-1);\n  }\n  overlay.style.display='flex';\n}",
      "    pendingScore=null;nameEntry.style.display='none';goTxt.style.display='';renderLeaders(-1);\n  }\n  homeStage(); // …et l'atelier reprend le décor : on rentre chez soi après la course\n}")

# ---- au chargement, l'accueil s'ouvre dans l'atelier
patch("home: ouverture au chargement",
      "setBestChip();\nrenderLeaders(-1);",
      "setBestChip();\nrenderLeaders(-1);\nhomeStage(); // DÉMO : l'écran d'accueil, c'est le garage")

# =============================================================================

# =============================================================================
#  9. DEUX RETOUCHES DE JEU
# =============================================================================

# ---- une entrée manquante au dictionnaire du jeu : le bouton « Restaurer un code »
# restait en français dans les réglages en anglais (il n'a jamais eu de traduction).
patch("i18n: bouton Restaurer un code",
      "'📋 Copier ma sauvegarde':'📋 Copy my save',",
      "'📋 Copier ma sauvegarde':'📋 Copy my save','📥 Restaurer un code':'📥 Restore a code',")

# ---- LE BOUTON ÉQUIPER : c'est l'action de l'écran, pas une mention légale.
# Le jeu le passe en `opacity .5` (verrouillée) ou `.7` (déjà à toi) — deux états
# qui voulaient dire « tu ne peux pas ». Dans la démo TOUT est débloqué, donc cette
# grisaille ne disait plus rien : elle rendait juste le bouton illisible. On le
# repeint avec les plaques d'arcade du jeu — dorée quand il y a un geste à faire,
# verte quand c'est déjà ta caisse. L'opacité en ligne est écrasée en `!important`.
patch("garage: bouton ÉQUIPER lisible", """@media (max-width:820px){
  #overlay.g3d h1{font-size:31px;letter-spacing:4px;gap:12px}
  #demoRibbon{font-size:7px;letter-spacing:2.5px;padding:8px 12px}
}""",
"""@media (max-width:820px){
  #overlay.g3d h1{font-size:31px;letter-spacing:4px;gap:12px}
  #demoRibbon{font-size:7px;letter-spacing:2.5px;padding:8px 12px}
}

/* ---- LE BOUTON ÉQUIPER ---- */
#gEquip{opacity:1!important;font-family:var(--pix);font-size:12px;line-height:1;letter-spacing:3px;
  display:block;width:100%;padding:16px 20px;margin-top:15px;border:0;border-radius:0;cursor:pointer;
  color:#2a1500;background:linear-gradient(180deg,#ffeeb0,#ffc400 52%,#eb9c00);
  text-shadow:0 1px 0 rgba(255,255,255,.45);
  clip-path:polygon(7px 0,calc(100% - 7px) 0,100% 7px,100% calc(100% - 7px),calc(100% - 7px) 100%,7px 100%,0 calc(100% - 7px),0 7px);
  filter:drop-shadow(0 5px 0 #7a4400);
  box-shadow:inset 3px 3px 0 rgba(255,255,255,.30),inset -3px -3px 0 rgba(0,0,0,.28);
  transition:transform .05s,filter .05s}
#gEquip:hover{filter:drop-shadow(0 5px 0 #7a4400) brightness(1.08)}
#gEquip:active{transform:translateY(4px);filter:drop-shadow(0 1px 0 #7a4400) brightness(1.12)}
/* état « c'est déjà ta caisse » : une confirmation VERTE et pleine, pas un fantôme */
#gEquip:disabled{cursor:default;color:#a6ffbe;text-shadow:none;
  background:linear-gradient(180deg,#164a28,#0d2e19);
  filter:drop-shadow(0 5px 0 #052a12);
  box-shadow:inset 3px 3px 0 rgba(255,255,255,.14),inset -3px -3px 0 rgba(0,0,0,.35),inset 0 0 0 2px rgba(98,224,98,.5)}
#gEquip:disabled:hover{filter:drop-shadow(0 5px 0 #052a12)}
#gEquip:disabled:active{transform:none}

/* ---- LA FICHE DE CAISSE PARLE PIXEL ----
   Le garage était écrit en Segoe UI/-apple-system : la seule surface du jeu à ne pas
   parler la langue du titre. Press Start 2P étant très large, on ne se contente pas de
   changer la police — on redescend TOUTES les tailles et on ouvre l'interligne, sinon
   la description déborde. Le cadre s'élargit d'autant.
   ⚠ Les flèches ◀ ▶ gardent une pile sans-serif : ces glyphes n'existent pas dans une
   police pixel 8 bits, elles retomberaient sur un fallback au hasard. */
#gCard{max-width:min(560px,92vw);padding:16px 22px 18px}
#gName{font-family:var(--pix);font-size:15px;font-weight:400;letter-spacing:2px;line-height:1.4}
#gMeta{font-family:var(--pix);font-size:8px;letter-spacing:2px;margin:10px 0 12px}
#gDesc{font-family:var(--pix);font-size:9px;line-height:2;letter-spacing:.5px;color:#cfe6fb}
#gHint{font-family:var(--pix);font-size:7px;letter-spacing:2px;margin-top:12px}
#gTitle,.gTitle{font-family:var(--pix);font-size:12px;font-weight:400;letter-spacing:3px}
.gNav{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}""")

# ---- LE GARAGE EST UN ÉCRAN, PAS UNE PARTIE
# Espace (= nitro) lançait une partie depuis la vitrine, et les flèches faisaient
# défiler les caisses sous les doigts de quelqu'un qui croyait piloter. On coupe le
# clavier À LA SOURCE tant que la scène d'accueil est à l'écran : un écouteur en
# phase de CAPTURE, donc AVANT tous ceux du jeu, plutôt que d'aller les patcher un
# par un et d'en oublier un au prochain ajout de raccourci.
patch("garage : clavier neutralisé",
      "$('hSet').addEventListener('click',e=>{e.stopPropagation();openSettings();});",
      "$('hSet').addEventListener('click',e=>{e.stopPropagation();openSettings();});\n"
      "for(const ev9 of ['keydown','keyup','keypress'])\n"
      "  addEventListener(ev9,function(e){\n"
      "    if(!garageOn)return;                                   // en course : le clavier reprend tous ses droits\n"
      "    if(e.target&&e.target.tagName==='INPUT')return;        // …et un champ de saisie garde le sien\n"
      "    e.stopImmediatePropagation();                          // aucun handler du jeu n'est atteint\n"
      "    if(e.code==='Space'||(e.code||'').indexOf('Arrow')===0)e.preventDefault(); // ni scroll, ni défilement parasite\n"
      "  },true);")

# ---- LE TREMPLIN RETIRÉ DE LA GÉNÉRATION DE PISTE
# Le « gap catapulte » posait une rampe, une lèvre, puis un TROU dans la dalle (mesh,
# collision et atterrissage supprimés sur la portion). Verdict user : le tremplin ne
# marche pas, il est bogué. On le retire — mais on ne peut pas simplement supprimer
# l'appel : l'archétype ALPIN CLÔT sa zone dessus, et le module aléatoire n°10 compte
# sur lui pour sa longueur. On remplace donc le corps de `gapRun` par de la ROUTE
# CONTINUE de portée équivalente : la piste garde son rythme et sa longueur, GAPMARK
# reste vide — donc plus de trou, plus de lèvre, plus de catapulte, et les décorateurs
# (plots, huile, dos d'âne) reprennent le couloir qu'ils s'interdisaient.
patch_re("piste : tremplin retiré",
      r"  const gapRun=\(v\)=>\{.*?\n  \};\n",
      "  // DÉMO : LE TREMPLIN EST RETIRÉ (voir build.py). `gapRun` ne creuse plus rien —\n"
      "  // il pose la même distance de bitume continu, pour que les archétypes qui\n"
      "  // l'appellent (module 10, clôture ALPIN) gardent leur longueur et leur rythme.\n"
      "  const gapRun=(v)=>{\n"
      "    gapN++;\n"
      "    straight(320+rnd()*90+level*9,-(12+rnd()*8),3); // la longue ligne droite d'élan reste : elle est bonne\n"
      "    straight(140+rnd()*40,-10,2);                   // …et là où s'ouvrait le vide, de la route\n"
      "    straight(150+rnd()*60,-12,2);                   // dégagement : on respire, on relance\n"
      "    lastGap=approx;\n"
      "  };\n",
      re.S)



# =============================================================================
#  12. LE SIFFLET DE LA NITRO
#  ---------------------------------------------------------------------------
#  Signalé par le user : « un gros son strident horrible » à l'allumage de la nitro.
#  `jetOsc` est une DENT DE SCIE envoyée dans un passe-bande Q=6 centré sur 2400 Hz,
#  et sa fréquence vaut `900 + vitesse*3,5` — SANS PLAFOND. Toutes les autres
#  fréquences du moteur sont bornées (nzF min 6200, whineF min 13500, lp min 6200,
#  lfoF min 40) ; ces trois-là ont été oubliées. Passé ~370 km/h la fondamentale
#  grimpe au-dessus du centre du filtre : les harmoniques tombent, il ne reste
#  qu'une sinusoïde nue dans l'aigu. C'est ça, le sifflet.
#
#  On BORNE, on ne redessine pas : sous les vitesses de croisière la nitro sonne
#  exactement comme avant (le plafond de 2400 Hz n'est atteint qu'à 428 km/h, 314
#  en nitro bleue). Au-delà, la turbine tient sa note au lieu de partir en cri.
patch("nitro : plafonner la turbine",
      "          jetF.frequency.setTargetAtTime(320+spd3*.6+(nitroBlue?180:0),AC.currentTime,.07);\n"
      "          jetOsc.frequency.setTargetAtTime(900+spd3*3.5+(nitroBlue?400:0),AC.currentTime,.08);",
      "          // ⚠ LES DEUX PLAFONDS SONT LE CORRECTIF DU SIFFLET — ne pas les retirer.\n"
      "          // jetOsc est une dent de scie dans un passe-bande Q=6 centré sur 2400 Hz :\n"
      "          // au-dessus de ce centre elle perd ses harmoniques et devient un cri pur.\n"
      "          jetF.frequency.setTargetAtTime(Math.min(1800,320+spd3*.6+(nitroBlue?180:0)),AC.currentTime,.07);\n"
      "          jetOsc.frequency.setTargetAtTime(Math.min(2400,900+spd3*3.5+(nitroBlue?400:0)),AC.currentTime,.08);")

patch("nitro : plafonner le corps de flamme",
      "jrF.frequency.setTargetAtTime(nitroOn?(air9?310+spd3*.3:430+spd3*.35)+(nitroBlue?80:0):240,AC.currentTime,.1);",
      "jrF.frequency.setTargetAtTime(nitroOn?Math.min(900,(air9?310+spd3*.3:430+spd3*.35)+(nitroBlue?80:0)):240,AC.currentTime,.1);")

# ---- …et la seconde moitié du symptôme : « ça se désactive complètement ».
# Un NaN écrit dans un AudioParam n'est pas une valeur passagère : il ÉTEINT le nœud
# pour toute la session. Le fichier porte déjà ce constat noir sur blanc à propos de
# `drv` (« un NaN écrit dans un AudioParam ne se répare pas »). Or `spd3` alimente
# les 26 écritures du bloc moteur : il suffit que la vitesse passe non finie une
# seule frame — un dt aberrant au lancement, une division par zéro — pour que tout
# le moteur devienne muet définitivement. On assainit à la SOURCE, une fois.
patch("audio : assainir la vitesse à la source",
      "      const spd3=speedKmh;",
      "      // ⚠ SOURCE UNIQUE DES 26 ÉCRITURES D'AudioParam DE CE BLOC. Un NaN qui passe ici\n"
      "      // n'est pas un glitch d'une frame : il éteint le nœud pour toute la session (voir\n"
      "      // la note sur `drv` dans engSndParams). `Math.min/max` propagent NaN, d'où le `||0`\n"
      "      // final qui le rattrape — NaN étant falsy, la vitesse retombe à 0 et le son survit.\n"
      "      const spd3=Math.min(2000,Math.max(0,speedKmh))||0;")


# =============================================================================
#  10. L'ÉCRAN DE DÉMARRAGE — les deux premières secondes
#  ---------------------------------------------------------------------------
#  Mesuré sur la page publiée : 4,9 s avant le `load`, et pendant tout ce temps un
#  écran BLANC (le jeu pose `background:#ffffff` sur body, son canvas le couvre
#  ensuite). Quelqu'un qui reçoit un lien dans un canal ne regarde pas une page
#  blanche pendant cinq secondes : il referme.
#  On met donc un voile TOUT EN HAUT du document — avant la feuille de style du jeu,
#  avant le moindre octet de trois.js — pour que le navigateur ait quelque chose à
#  peindre dès les premiers kilo-octets. Police système assumée : la police pixel
#  n'est pas encore chargée à cet instant, et un fallback au hasard serait pire.
patch("écran de démarrage",
      '<meta charset="UTF-8">\n',
      '<meta charset="UTF-8">\n'
      '<style>\n'
      '  /* ⚠ CE BLOC DOIT RESTER LE PREMIER DU DOCUMENT : c\'est sa raison d\'être. */\n'
      '  html,body{background:#0a0610}\n'
      '  #boot{position:fixed;inset:0;z-index:999;display:flex;flex-direction:column;\n'
      '    align-items:center;justify-content:center;gap:20px;opacity:1;transition:opacity .3s ease;\n'
      '    background:radial-gradient(900px 600px at 50% 46%,#191024,#05030b 78%);\n'
      '    color:#ffd75e;font:700 13px/1 "Segoe UI",Helvetica,Arial,sans-serif;\n'
      '    letter-spacing:7px;text-transform:uppercase}\n'
      '  #bootBar{width:min(240px,54vw);height:3px;background:rgba(255,215,94,.15);overflow:hidden}\n'
      '  #bootBar i{display:block;height:100%;width:34%;\n'
      '    background:linear-gradient(90deg,transparent,#ffd75e,transparent);\n'
      '    animation:bootSlide 1.15s ease-in-out infinite}\n'
      '  @keyframes bootSlide{from{transform:translateX(-110%)}to{transform:translateX(320%)}}\n'
      '  @media (prefers-reduced-motion:reduce){#bootBar i{animation:none;width:100%;opacity:.5}}\n'
      '</style>\n'
      '<div id="boot">Cash Car<div id="bootBar"><i></i></div></div>\n'
      '<script>\n'
      '  /* Le gros script du jeu est le dernier élément du document : quand DOMContentLoaded\n'
      '     part, la scène est bâtie et l\'intro « 1.61 » attend derrière le voile. */\n'
      '  addEventListener("DOMContentLoaded",function(){\n'
      '    var b=document.getElementById("boot");if(!b)return;\n'
      '    b.style.opacity=0;setTimeout(function(){b.remove();},320);\n'
      '  });\n'
      '</script>\n')


# =============================================================================
#  11. LA BIFURCATION — deux publics, deux compromis
#  ---------------------------------------------------------------------------
#  `html_multi` : la version HÉBERGÉE. three.js, la police et les voix restent des
#     FICHIERS À CÔTÉ. Le HTML tombe à ~430 Ko : le navigateur le reçoit et peint
#     presque tout de suite, puis tire three.js en parallèle et les voix seulement
#     au premier geste. C'est ce qu'on donne à cliquer dans un canal.
#  `html`      : la version UN FICHIER (double-clic, et l'Artifact qui n'a droit
#     qu'à une page). Tout est embarqué en data: URI — 2,4 Mo, plus lent à ouvrir,
#     mais rigoureusement autonome. L'écran de démarrage ci-dessus est là pour ça.
#  Le même jeu, patché à l'identique : la bifurcation ne porte QUE sur l'emballage.
# =============================================================================
html_multi = html

# ------------------------------------------------------- police embarquée
# Le jeu sert désormais sa police depuis `assets/fonts/` au lieu de Google Fonts
# (amont du 03/09). Même règle que pour three.js et les voix : la démo est UN
# fichier, donc la police voyage dedans. 12 Ko en base64, c'est gratuit — et la
# page n'attend plus aucun hôte externe pour afficher son titre.
FONT_PATH = os.path.join(GAME, 'assets', 'fonts', 'pressstart2p.woff2')
patch("pixel font embedded",
      "src:url('./assets/fonts/pressstart2p.woff2') format('woff2');",
      "src:url(data:font/woff2;base64," +
      base64.b64encode(open(FONT_PATH, 'rb').read()).decode() + ") format('woff2');")

# The announcer is EMBEDDED as data: URIs — the demo has to run as a single file,
# with no server and no network fetch (a published page blocks external media anyway).
ANN = os.path.join(GAME, 'assets', 'audio', 'announcer')
b64 = {}
for f in sorted(os.listdir(ANN)):
    if f.endswith('.mp3'):
        b64[f] = 'data:audio/mpeg;base64,' + base64.b64encode(open(os.path.join(ANN, f), 'rb').read()).decode()
patch("announcer voices embedded",
      "const ANN_DIR='assets/audio/announcer/';",
      "const ANN_DIR='assets/audio/announcer/';\n"
      "/* DEMO: the voices travel INSIDE the file (data: URI) — no request, no folder to carry around. */\n"
      "const ANN_B64=" + ('{\n' + ',\n'.join(" %r:%r" % (k, v) for k, v in b64.items()) + '\n};\n').replace("'", '"') +
      "function ANN_URL(f){return ANN_B64[f]||(ANN_DIR+f);}")
patch("announcer preload via data:", "new Audio(ANN_DIR+ANN_LIB[k].f)", "new Audio(ANN_URL(ANN_LIB[k].f))")
patch("announcer playback via data:", "new Audio(ANN_DIR+e.f)", "new Audio(ANN_URL(e.f))")

# ===================================================== 7 bis. THREE.JS EMBARQUÉ
# Le jeu ne charge plus three.js d'un CDN : il le sert depuis `game/vendor/`
# (préparation App Store, amont du 03/09). Une démo qui tient dans UN fichier ne
# peut pas traîner un dossier derrière elle — on avale donc les sept scripts.
# Effet de bord heureux : la page publiée ne dépend plus d'aucun hôte externe,
# donc plus rien à négocier avec la politique de sécurité de l'hébergeur.
VENDOR = re.findall(r'<script src="(vendor/[^"]+)"></script>\n', html)
if len(VENDOR) != 7:
    sys.exit("vendor: %d script(s) trouvé(s), 7 attendus — le jeu a changé de bundle" % len(VENDOR))
for rel in VENDOR:
    src = open(os.path.join(GAME, rel), encoding='utf-8').read()
    # une chaîne "</script" dans le code fermerait la balise au parsing : seule
    # séquence à neutraliser, et elle reste du JS valide.
    src = src.replace('</script', r'<\/script')
    patch("inlined " + rel,
          '<script src="%s"></script>\n' % rel,
          '<script>/* %s — embarqué : la démo est UN fichier */\n%s\n</script>\n' % (rel, src))

open(OUT, 'w', encoding='utf-8').write(html)
print("demo/index.html written — %.0f KB" % (os.path.getsize(OUT) / 1024))
print("%d patches applied%s:" % (len(applied), (", %d skipped (gone upstream)" % len(skipped)) if skipped else ""))
for k in skipped:
    print("  ⊘", k, "— absent du jeu, patch ignoré")
for a in applied:
    print("  ·", a)

# =============================================================================
#  "ARTIFACT" VARIANT — the one shared by LINK (Slack, mail…)
#  ---------------------------------------------------------------------------
#  The host wraps the file in its own <!doctype><head><body>, so we ship the page
#  CONTENT, not a complete document. Anything pointing at a neighbouring file
#  (manifest, icon) goes too: the link is alone in the world.
# =============================================================================
art = html
def cut(label, pattern, flags=0, need=1, opt=False):
    """Strip a fragment from the hosted variant. `opt` allows the fragment to be
    already gone: the game's <head> loses metas as the App Store prep advances,
    and a removal that finds nothing to remove is a no-op, not a failure."""
    global art
    new, n = re.subn(pattern, '', art, flags=flags)
    if n != need:
        if opt and n == 0:
            return
        sys.exit("ARTIFACT — pattern not found (%d/%d): %s" % (n, need, label))
    art = new

cut("doctype",        r'<!DOCTYPE html>\n')
cut("html tag",       r'<html lang="fr">\n')
cut("head tag",       r'<head>\n')
cut("head close",     r'</head>\n')
cut("body tag",       r'<body>\n')
cut("body close",     r'</body>\n')
cut("html close",     r'</html>\n')
cut("cache metas",    r'<!-- ANTI-CACHE.*?-->\n<meta http-equiv="Cache-Control"[^>]*>\n<meta http-equiv="Pragma"[^>]*>\n<meta http-equiv="Expires"[^>]*>\n', re.S, opt=True)

ART = os.path.join(ROOT, 'cash-car-demo.artifact.html')
open(ART, 'w', encoding='utf-8').write(art)
print("demo/cash-car-demo.artifact.html written — %.0f KB" % (os.path.getsize(ART) / 1024))

# =============================================================================
#  "dist/" — THE HOSTED VARIANT (its own URL, its own Slack link preview)
#  ---------------------------------------------------------------------------
#  Same page, plus Open Graph tags. This is what makes a link posted in a channel
#  render as a card with a title, a pitch and a picture instead of a bare URL:
#  Slackbot reads only the first 32 KB of a page and runs no JavaScript, so the
#  tags sit at the very top and the image is a real file next to the page.
# =============================================================================
OG = ('<meta property="og:type" content="website">\n'
      '<meta property="og:site_name" content="CASH CAR">\n'
      '<meta property="og:title" content="CASH CAR — Survivor Demo">\n'
      '<meta property="og:description" content="Seven police cars on the track. Every 60 seconds, '
      'whoever is last explodes. A 3D arcade runner that plays in the browser — no install, no sign-up.">\n'
      '<meta property="og:url" content="' + BASE + '/">\n'
      '<meta property="og:image" content="' + BASE + '/og.png">\n'
      '<meta property="og:image:type" content="image/png">\n'
      '<meta property="og:image:width" content="1200">\n'
      '<meta property="og:image:height" content="630">\n'
      '<meta property="og:image:alt" content="The CASH CAR title screen, gold pixel lettering over a neon sky.">\n'
      '<meta name="twitter:card" content="summary_large_image">\n')

dist_html = html_multi.replace('<title>CASH CAR</title>', '<title>CASH CAR</title>\n' + OG, 1)
if OG not in dist_html:
    sys.exit("dist: could not place the Open Graph block")
# The folder name IS the Vercel project name (and therefore the domain), so it is
# not "dist": deploying from here gives cash-car-demo.vercel.app, which is what
# the Open Graph BASE above points at.
DIST = os.path.join(ROOT, 'cash-car-demo')
os.makedirs(DIST, exist_ok=True)
open(os.path.join(DIST, 'index.html'), 'w', encoding='utf-8').write(dist_html)
# Les fichiers que la page va chercher à côté d'elle. Ils sont COPIÉS depuis le jeu à
# chaque build : pas de dérive possible entre le moteur du jeu et celui de la démo.
import shutil
COPIED = [('vendor', 'vendor'),
          (os.path.join('assets', 'fonts'), os.path.join('assets', 'fonts')),
          (os.path.join('assets', 'audio', 'announcer'), os.path.join('assets', 'audio', 'announcer'))]
n_files = n_bytes = 0
for src_rel, dst_rel in COPIED:
    src, dst = os.path.join(GAME, src_rel), os.path.join(DIST, dst_rel)
    if os.path.isdir(dst):
        shutil.rmtree(dst)
    shutil.copytree(src, dst)
    for root, _, files in os.walk(dst):
        for f in files:
            n_files += 1
            n_bytes += os.path.getsize(os.path.join(root, f))

print("demo/cash-car-demo/index.html written — %.0f KB + %d fichiers à côté (%.0f KB) — base Open Graph : %s"
      % (os.path.getsize(os.path.join(DIST, 'index.html')) / 1024, n_files, n_bytes / 1024, BASE))
if not os.path.exists(os.path.join(DIST, 'og.png')):
    print("  ⚠ demo/cash-car-demo/og.png is missing — the link preview will have no image")
