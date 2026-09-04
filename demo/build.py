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
      "lastAlertEl.innerHTML=TR('⚠ ATTENTION !<br>VOUS ÊTES DERNIER<br>EXPLOSION DANS : 00:')+String(left).padStart(2,'0');",
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
#  12. LES SIFFLETS — SCAN COMPLET DU CODE SON
#  ---------------------------------------------------------------------------
#  Premier diagnostic (la turbine de la nitro) : juste, mais ce n'était PAS la cause
#  principale. Le user a retrouvé le même bruit en passant sur un booster.
#
#  Scan de toutes les écritures de fréquence du moteur audio. Le jeu borne
#  soigneusement la plupart (`nzF` 6200, `whineF` 13500, `lp` 6200, `lfoF` 40) —
#  mais QUATRE fréquences pilotées par la vitesse n'ont aucun plafond, et trois
#  d'entre elles alimentent des passe-bande à Q ÉLEVÉ. Un passe-bande à Q=14, ce
#  n'est plus une couleur : c'est un sinus. Et il monte avec la vitesse, droit dans
#  les 3-4 kHz — le pic exact de sensibilité de l'oreille humaine.
#
#    whF   Q=14   2000 + v*1,2   ← LE COUPABLE. S'allume à 560 km/h, ce qu'un
#                                  booster fait franchir d'un coup. 3 kHz à 900 km/h.
#    skF2  Q=10   (900+…)*1,56   ← le crissement de drift, même famille
#    skF1  Q=8    900 + …
#    jetOsc  (dent de scie dans un passe-bande Q=6)  ← corrigé au commit précédent
#
#  On borne les fréquences ET on assouplit les deux Q extrêmes. Baisser Q ne coupe
#  pas le son : il élargit la cloche, donc on entend du VENT au lieu d'un sifflet.
#  C'est ce que le sifflement d'air était censé être — le commentaire du jeu dit
#  « la signature des vitesses folles », pas une alarme.

patch("son : le sifflement d'air ne siffle plus (Q=14)",
      "  whF=AC.createBiquadFilter();whF.type='bandpass';whF.frequency.value=2600;whF.Q.value=14;",
      "  // ⚠ Q ABAISSÉ DE 14 À 5 — c'était LA cause du bruit strident signalé sur booster.\n"
      "  // À Q=14 un passe-bande ne colore plus le bruit, il en extrait un sinus ; piloté par\n"
      "  // la vitesse sans plafond, ce sinus montait dans les 3-4 kHz, pile sur le pic de\n"
      "  // sensibilité de l'oreille. À Q=5 la cloche est large : on entend du vent.\n"
      "  whF=AC.createBiquadFilter();whF.type='bandpass';whF.frequency.value=2600;whF.Q.value=5;")

patch("son : plafonner le sifflement d'air",
      "        whF.frequency.setTargetAtTime(2000+spd3*1.2,AC.currentTime,.1);",
      "        whF.frequency.setTargetAtTime(Math.min(2600,2000+spd3*1.2),AC.currentTime,.1); // ⚠ PLAFOND : au-delà on quitte le vent pour l'alarme")

patch("son : adoucir les deux passe-bande du crissement",
      "  skF1=AC.createBiquadFilter();skF1.type='bandpass';skF1.frequency.value=950;skF1.Q.value=8;\n"
      "  skF2=AC.createBiquadFilter();skF2.type='bandpass';skF2.frequency.value=1480;skF2.Q.value=10;",
      "  // Q 8/10 → 5/6 : le crissement garde son mordant sans virer au sifflet quand la\n"
      "  // vitesse pousse ses deux bandes vers l'aigu (même famille de défaut que whF).\n"
      "  skF1=AC.createBiquadFilter();skF1.type='bandpass';skF1.frequency.value=950;skF1.Q.value=5;\n"
      "  skF2=AC.createBiquadFilter();skF2.type='bandpass';skF2.frequency.value=1480;skF2.Q.value=6;")

# `windF` est un passe-BAS à Q=.2 : il ne peut pas siffler, quoi qu'on lui donne.
# On le borne quand même — pour que l'invariant se vérifie d'un coup d'œil : plus
# AUCUNE fréquence pilotée par la vitesse n'est laissée libre dans ce fichier.
patch("son : plafonner le vent (cohérence)",
      "        windF.frequency.setTargetAtTime((280+spd3*1.25)*(1-.6*cloudInS)+(mode==='fall'?260:0),AC.currentTime,.15);",
      "        windF.frequency.setTargetAtTime(Math.min(3200,(280+spd3*1.25)*(1-.6*cloudInS)+(mode==='fall'?260:0)),AC.currentTime,.15);")

patch("son : plafonner le crissement",
      "          const sq=900+drift*430+spd3*.35;",
      "          const sq=Math.min(1750,900+drift*430+spd3*.35); // plafond : skF2 tape à sq*1,56, donc 2730 Hz au plus haut")

patch("son : plafonner la turbine de la nitro",
      "          jetF.frequency.setTargetAtTime(320+spd3*.6+(nitroBlue?180:0),AC.currentTime,.07);\n"
      "          jetOsc.frequency.setTargetAtTime(900+spd3*3.5+(nitroBlue?400:0),AC.currentTime,.08);",
      "          // jetOsc est une dent de scie dans un passe-bande Q=6 centré sur 2400 Hz :\n"
      "          // au-dessus de ce centre elle perd ses harmoniques et devient un cri pur.\n"
      "          jetF.frequency.setTargetAtTime(Math.min(1800,320+spd3*.6+(nitroBlue?180:0)),AC.currentTime,.07);\n"
      "          jetOsc.frequency.setTargetAtTime(Math.min(2400,900+spd3*3.5+(nitroBlue?400:0)),AC.currentTime,.08);")

patch("son : plafonner le corps de flamme",
      "jrF.frequency.setTargetAtTime(nitroOn?(air9?310+spd3*.3:430+spd3*.35)+(nitroBlue?80:0):240,AC.currentTime,.1);",
      "jrF.frequency.setTargetAtTime(nitroOn?Math.min(900,(air9?310+spd3*.3:430+spd3*.35)+(nitroBlue?80:0)):240,AC.currentTime,.1);")

# ---- …et la seconde moitié du symptôme : « ça se désactive complètement ».
# Un NaN écrit dans un AudioParam n'est pas une valeur passagère : il ÉTEINT le nœud
# pour toute la session. Le fichier porte déjà ce constat noir sur blanc à propos de
# `drv`. Or `spd3` alimente les 26 écritures du bloc moteur : une seule frame de
# vitesse non finie suffit à tout tuer définitivement. On assainit à la SOURCE.
patch("son : assainir la vitesse à la source",
      "      const spd3=speedKmh;",
      "      // ⚠ SOURCE UNIQUE DES ÉCRITURES D'AudioParam DE CE BLOC. Un NaN qui passe ici\n"
      "      // n'est pas un glitch d'une frame : il éteint le nœud pour toute la session (voir\n"
      "      // la note sur `drv` dans engSndParams). `Math.min/max` propagent NaN, d'où le `||0`\n"
      "      // final qui le rattrape — NaN étant falsy, la vitesse retombe à 0 et le son survit.\n"
      "      const spd3=Math.min(2000,Math.max(0,speedKmh))||0;")


# =============================================================================
#  13. LE SON QUI SATURE PUIS MEURT — MESURÉ, PLUS DEVINÉ
#  ---------------------------------------------------------------------------
#  J'avais deviné deux fois (turbine de la nitro, puis sifflement d'air). Analyse
#  spectrale de l'enregistrement fourni par le user + instrumentation de la page
#  en Chrome headless. Ce que ça dit, noir sur blanc :
#
#   · l'enregistrement SATURE À PLEINE ÉCHELLE (RMS 32 400 sur 32 767 possibles)
#     entre 7,6 s et 10,1 s, avec ses pics à 316 et 1000 Hz — donc PAS un aigu :
#     un signal grave écrêté, dont l'écrêtage fabrique toute la série harmonique.
#     C'est ça qu'on entend comme « strident horrible ».
#   · puis SILENCE TOTAL de 10,2 s à la fin (9,5 secondes). Le son ne revient pas.
#   · en headless : DEUX contextes audio. Le premier atteint un pic de 0,808 puis
#     passe à l'état `closed`. Le second (celui du jeu) ne dépasse jamais 0,000.
#
#  Le premier contexte, c'est l'INTRO « 1.61 » (`iAC`), et il explique les deux
#  moitiés du symptôme :
#     master.gain = 1  →  compresseur seul, AUCUN limiteur derrière
#  là où la chaîne du JEU est correctement protégée :
#     MASTER → compresseur → WaveShaper limiteur → destination
#  L'intro tape donc à plein régime sans filet — elle sature. Puis, à la fin de la
#  séquence, `iAC.close()` : le son s'arrête net et ne revient jamais. Ce n'est pas
#  la nitro : c'est l'intro qui hurle, et sa fermeture qu'on prend pour une panne.
#
#  Pour une DÉMO, la réponse n'est pas de rafistoler le mixage de l'intro : c'est de
#  la retirer. Six secondes de logo studio avant de jouer, sur un lien qu'on ouvre
#  depuis un canal, c'est déjà une raison de fermer l'onglet — et c'est le seul
#  morceau d'audio non limité du fichier. On supprime le bloc `#splash` : l'intro se
#  désactive d'elle-même (`if(!sp9)return;`), `iAC` n'est jamais créé, et `start()`
#  ne teste plus qu'un élément absent. On tombe directement dans le garage.
patch_re("intro : retirer le logo studio (le seul audio non limité)",
      r'<div id="splash".*?\n</div>\n',
      "<!-- DÉMO : l'intro studio « 1.61 » est retirée. C'était SIX SECONDES avant de\n"
      "     jouer, et le seul audio du fichier sans limiteur (master.gain=1, compresseur\n"
      "     seul). Sans ce bloc, la séquence se désarme seule (`if(!sp9)return;`) et son\n"
      "     contexte audio n'est jamais créé. On ouvre directement sur le garage.\n"
      "     ⚠ Motif SOUPLE À DESSEIN : le jeu ajoute des attributs sur #splash (ARIA,\n"
      "     tabindex…) sans prévenir, et une ancre exacte casse à chaque fois. -->\n",
      re.S)

# ---- de la marge pour le limiteur du jeu
# MASTER n'avait pas de gain explicite (donc 1). Toutes les couches — moteur, jet,
# vent, crissement, sirène, annonceur — s'y additionnent avant un WaveShaper qui,
# poussé trop fort, ne limite plus : il ÉCRÊTE, et un écrêtage franc s'entend comme
# une saturation agressive. 0,72 rend au limiteur son rôle d'arrondi.
# MESURÉ, prise d'écoute sur chaque nœud, nitro maintenue : la sortie maître atteint
# déjà **0,732** à 80 km/h. `engPre` sort à 4,83 et `jPre` à 2,14 — le moteur et le
# réacteur sont VOLONTAIREMENT poussés dans la saturation (c'est leur timbre), mais
# personne ne rattrape le niveau derrière. Résultat : passé une vitesse modeste, tout
# se colle contre le WaveShaper de sortie — et un WaveShaper ne limite pas, il DISTORD.
# D'où la saturation à pleine échelle relevée dans l'enregistrement du user.
# Sans gain explicite MASTER valait 1 : à 80 km/h on était donc déjà À FOND.
# .34 laisse au limiteur son rôle de filet, au lieu d'en faire l'effet principal.
# ---- LE LIMITEUR DE SORTIE ÉTAIT UNE DISTORSION
# Mesuré au banc (spectrogramme de la sortie, nitro maintenue, 268 km/h) : pic à
# **1,14** — AU-DESSUS de la pleine échelle — fondamentale à 381 Hz et traîne
# harmonique jusqu'à 12 kHz. La signature d'un écrêtage, pas d'un aigu.
#
# La cause : `lim` n'est pas un limiteur. Sa courbe vaut
#     tanh(x*k) / tanh(k)
# normalisée pour que ±1 sorte à ±1. Sa PENTE À L'ORIGINE vaut donc k/tanh(k) =
# ×1,51 pour k=1,3 : elle RÉ-AMPLIFIE tout signal faible. C'est exactement pourquoi
# baisser `MASTER` (1 → .72 → .34) n'a jamais rien changé — la courbe le remontait
# à chaque fois. Et sur les forts signaux elle sature en fabriquant la série
# harmonique complète.
#
# ⚠ Débrancher `lim` du bus coupait tout le son (vérifié au banc : pic 0,000). On ne
# touche donc PAS au câblage : on corrige la courbe. `tanh(x*k)/k` a une pente de 1
# à l'origine — les signaux faibles passent inchangés — et plafonne à tanh(k)/k =
# 0,66, donc elle limite vraiment au lieu d'amplifier. Passage en 4x pour que la
# saturation résiduelle ne replie pas d'aliasing dans l'aigu.
# `engShaper` et `jetDist` gardent `engCurve` : leur distorsion est voulue.
patch("son : le limiteur de sortie limite au lieu d'amplifier",
      "  const lim=AC.createWaveShaper();lim.curve=engCurve(1.3);lim.oversample='2x';",
      "  const lim=AC.createWaveShaper();\n"
      "  // ⚠ PENTE UNITAIRE — NE PAS REVENIR À `engCurve` ICI. engCurve normalise par\n"
      "  // tanh(k), ce qui donne une pente de ×1,51 à l'origine : sur le bus maître elle\n"
      "  // ré-amplifiait le mix au lieu de le tenir, puis le saturait (mesuré : 1,14 de pic,\n"
      "  // harmoniques jusqu'à 12 kHz). Ici la pente vaut 1 et le plafond tanh(k)/k = 0,66.\n"
      "  lim.curve=(function(k){const n=1024,c=new Float32Array(n);\n"
      "    for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(x*k)/k;}return c;})(1.3);\n"
      "  lim.oversample='2x'; // ⚠ PAS 4x : j'y étais passé pour l'aliasing, mais ça double la\n"
      "  // charge CPU du bus maître — sur une machine limite, ça fabrique des coupures audio.")

patch("son : niveau maître",
      "  MASTER=AC.createGain();\n",
      "  MASTER=AC.createGain();MASTER.gain.value=.62; // ⚠ NE PAS REMONTER SANS MESURER AU BANC.\n"
      "  // Sans valeur explicite ce gain vaut 1, et le mix arrivait saturé sur la sortie.\n")



# =============================================================================
#  14. DERNIÈRE PASSE — CE QUE L'AUDIT A TROUVÉ
# =============================================================================

# ---- La coque de PAUSE mobile était restée en français. Elle ne passe pas par
# `applyLangDOM` (ni `[data-fr]`, ni dans sa liste de sélecteurs) et ses libellés
# sont RÉÉCRITS en dur par `panSync` à chaque ouverture — donc traduire le HTML seul
# n'aurait rien donné. On traduit les deux : le gabarit ET le réécrivain.
patch("mobile : panneau de pause en anglais (gabarit)",
      """    <div class="tpH">PAUSE</div>
    <div class="tp go" data-a="close">▶ REPRENDRE</div>
    <div class="tpH">RÉGLAGES</div>
    <div class="tp" data-a="snd">🔊 SON</div>
    <div class="tp" data-a="vox">🎙 VOIX</div>
    <div class="tp" data-a="mus">🎵 MUSIQUE</div>
    <div class="tp" data-a="ctl">🕹 VOLANT</div>
    <div class="tp" data-a="q">⚡ IMAGE : RAPIDE</div>
    <div class="tp" data-a="surv">🏁 SURVIVANT : OFF</div>
    <div class="tpH" data-g="run">LA PARTIE</div>
    <div class="tp" data-a="resp" data-g="run">↺ REPLACER LA CAISSE</div>
    <div class="tp" data-a="reset" data-g="run">⟲ RECOMMENCER</div>
    <div class="tp" data-a="quit" data-g="run">⏏ QUITTER</div>""",
      """    <div class="tpH">PAUSE</div>
    <div class="tp go" data-a="close">▶ RESUME</div>
    <div class="tpH">SETTINGS</div>
    <div class="tp" data-a="snd">🔊 SFX</div>
    <div class="tp" data-a="vox">🎙 VOICE</div>
    <div class="tp" data-a="mus">🎵 MUSIC</div>
    <div class="tp" data-a="ctl">🕹 WHEEL</div>
    <div class="tp" data-a="q">⚡ GRAPHICS: FAST</div>
    <div class="tp" data-a="surv">🏁 SURVIVOR: OFF</div>
    <div class="tpH" data-g="run">THIS RUN</div>
    <div class="tp" data-a="resp" data-g="run">↺ RESPAWN THE CAR</div>
    <div class="tp" data-a="reset" data-g="run">⟲ START OVER</div>
    <div class="tp" data-a="quit" data-g="run">⏏ QUIT</div>""")

patch("mobile : panneau de pause en anglais (libellés réécrits)",
      """      if(a==='close')e.textContent=run?'▶ REPRENDRE':'✕ FERMER';
      else if(a==='snd'){e.textContent=(SND.sfx?'🔊':'🔇')+' SON';e.classList.toggle('off',!SND.sfx);}
      else if(a==='vox'){e.textContent=(SND.voice?'🎙':'🤐')+' VOIX';e.classList.toggle('off',!SND.voice);}
      else if(a==='mus'){e.textContent=(SND.music?'🎵':'🔕')+' MUSIQUE';e.classList.toggle('off',!SND.music);}
      else if(a==='ctl')e.textContent=TCTL.pad?'⬅➡ FLECHES':'🕹 VOLANT';
      else if(a==='q'){const f=SAVE.d.q!=='net';e.textContent=f?'⚡ IMAGE : RAPIDE':'✨ IMAGE : NETTE';e.classList.toggle('off',f);}""",
      """      if(a==='close')e.textContent=run?'▶ RESUME':'✕ CLOSE';
      else if(a==='snd'){e.textContent=(SND.sfx?'🔊':'🔇')+' SFX';e.classList.toggle('off',!SND.sfx);}
      else if(a==='vox'){e.textContent=(SND.voice?'🎙':'🤐')+' VOICE';e.classList.toggle('off',!SND.voice);}
      else if(a==='mus'){e.textContent=(SND.music?'🎵':'🔕')+' MUSIC';e.classList.toggle('off',!SND.music);}
      else if(a==='ctl')e.textContent=TCTL.pad?'⬅➡ ARROWS':'🕹 WHEEL';
      else if(a==='q'){const f=SAVE.d.q!=='net';e.textContent=f?'⚡ GRAPHICS: FAST':'✨ GRAPHICS: SHARP';e.classList.toggle('off',f);}""")

patch("mobile : consigne du volant en anglais",
      '<div id="tSteerHint">GLISSE POUR TOURNER</div>',
      '<div id="tSteerHint">DRAG TO STEER</div>')

# ---- 18 avertissements three.js à chaque ouverture du garage. `MeshLambertMaterial`
# n'accepte pas `flatShading` en r128 : la propriété est IGNORÉE (donc aucun effet
# visuel à perdre) mais chaque matériau crie dans la console. Sur une démo qu'on
# ouvre devant des gens qui ouvrent les devtools, c'est de la négligence gratuite.
patch("console : supprimer les avertissements three.js (helper)",
      "flatShading:true,fog:false},o||{}));",
      "fog:false},o||{})); // ⚠ pas de `flatShading` : MeshLambertMaterial l'ignore en r128 et crie dans la console")
# …et le sol le repassait par l'objet de surcharge, ce qui réinjectait la propriété
patch("console : supprimer le dernier avertissement (sol)",
      "    sol   :L(0xffffff,0x090b10,{flatShading:false}),",
      "    sol   :L(0xffffff,0x090b10),  // (plus de `flatShading` ici non plus : même avertissement)")


# =============================================================================
#  15. LA FUITE DE NŒUDS AUDIO — LA VRAIE CAUSE
#  ---------------------------------------------------------------------------
#  Isolé par bissection AVEC le user (voix seule = aucun problème → le coupable est
#  dans la chaîne SFX, pas dans l'annonceur, et pas dans le limiteur que j'avais
#  passé quatre tours à « corriger »).
#
#  `flamePop` et `noiseBurst` construisent chacun trois nœuds — source, filtre, gain —
#  les câblent sur MASTER… et ne les arrêtent JAMAIS :
#      src.connect(f);f.connect(g);g.connect(MASTER);src.start();     // pas de stop()
#  `crackle` et `subBoom`, eux, appellent bien `.stop()`. Ces deux-là ont été oubliés.
#
#  Or `flamePop` tourne à 25 appels/seconde pendant la nitro, et chaque appel alloue
#  EN PLUS un buffer de bruit neuf (`brownBuf` : deux passes sur ~3000 échantillons).
#  Trente secondes de nitro = ~750 buffers et ~1500 nœuds filtre+gain qui restent
#  branchés sur le bus maître pour toujours. Le graphe grossit sans fin, le thread
#  audio finit par ne plus tenir la cadence : ça crachote (le « strident »), puis il
#  lâche (le « son coupé »). Les deux moitiés du symptôme, une seule cause.
#
#  Deux correctifs : on ARRÊTE et on DÉBRANCHE, et on met les buffers en cache.

patch("audio : flamePop ne fuit plus",
      "    src.connect(f);f.connect(g);g.connect(MASTER);src.start();\n  }catch(e){}\n}\nfunction initAudio(){",
      "    src.connect(f);f.connect(g);g.connect(MASTER);src.start();\n"
      "    // ⚠ SANS CES DEUX LIGNES, CHAQUE POP RESTE CÂBLÉ SUR MASTER À VIE.\n"
      "    // flamePop tourne à 25 appels/s sous nitro : le graphe grossit sans fin, le thread\n"
      "    // audio décroche (grésillement) puis lâche (silence total). C'était LE bug.\n"
      "    src.stop(AC.currentTime+dur+.05);\n"
      "    src.onended=function(){try{src.disconnect();f.disconnect();g.disconnect();}catch(e){}};\n"
      "  }catch(e){}\n}\nfunction initAudio(){")

patch("audio : noiseBurst ne fuit plus",
      "    src.connect(f);f.connect(g);g.connect(MASTER);src.start();\n  }catch(e){}\n}\n/* ---- LE CHANGEMENT DE MOTEUR",
      "    src.connect(f);f.connect(g);g.connect(MASTER);src.start();\n"
      "    src.stop(AC.currentTime+dur+.05);   // même oubli que flamePop : sans stop, ça s'empile\n"
      "    src.onended=function(){try{src.disconnect();f.disconnect();g.disconnect();}catch(e){}};\n"
      "  }catch(e){}\n}\n/* ---- LE CHANGEMENT DE MOTEUR")

# ---- …et on arrête de fabriquer un buffer de bruit neuf à chaque pop.
# `brownBuf` fait deux passes sur ~3000 échantillons. À 25 appels/s, sous nitro, ça
# reste du gaspillage même une fois la fuite bouchée. On quantifie la durée au
# centième de seconde et on garde les buffers : une poignée suffit à tout couvrir.
patch("audio : mettre les buffers de bruit en cache",
      "function brownBuf(len){",
      "const _bufCache={};\n"
      "function cachedBuf(kind,len){ // ⚠ quantifié au 1/100 s, sinon chaque appel serait un raté de cache\n"
      "  const k=kind+Math.max(1,Math.round(len*100));\n"
      "  return _bufCache[k]||(_bufCache[k]=(kind==='b'?brownBuf:noiseBuf)(Math.max(1,Math.round(len*100))/100));\n"
      "}\n"
      "function brownBuf(len){")
patch("audio : flamePop puise dans le cache",
      "const src=AC.createBufferSource();src.buffer=brownBuf(dur+.02);",
      "const src=AC.createBufferSource();src.buffer=cachedBuf('b',dur+.02);")
patch("audio : noiseBurst puise dans le cache",
      "const src=AC.createBufferSource();src.buffer=noiseBuf(dur);\n    const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=freq;",
      "const src=AC.createBufferSource();src.buffer=cachedBuf('n',dur);\n    const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=freq;")


# =============================================================================
#  16. LE SON QUI NE REVIENT JAMAIS  +  UN INTERRUPTEUR DE BISSECTION
# =============================================================================

# ---- (a) LA PAUSE QUI SUSPEND L'AUDIO POUR TOUJOURS
# Le jeu met en pause quand l'onglet passe en arrière-plan — ce qui suspend le
# contexte audio. Au retour, `audioKick()` exige `!paused`, or `paused` est resté
# vrai : le son ne revient JAMAIS, et rien ne le dit au joueur. Le message « PAUSE »
# s'efface en 2,2 s, et sur ordinateur seule la touche P relance.
# C'est exactement la moitié « puis ça a coupé le son » de l'enregistrement — et
# lancer un enregistrement d'écran suffit à déclencher la mise en arrière-plan.
# Sur une démo qu'on ouvre depuis un canal, où l'on change d'onglet en permanence,
# c'est rédhibitoire. On reprend automatiquement au retour.
patch("audio : reprendre quand l'onglet revient",
      "addEventListener('visibilitychange',function(){ if(document.hidden)return; wakeAsk(); audioKick(); });",
      "addEventListener('visibilitychange',function(){ if(document.hidden)return; wakeAsk();\n"
      "  // ⚠ REPRISE AUTOMATIQUE — NE PAS RETIRER.\n"
      "  // La mise en pause d'arrière-plan appelle AC.suspend(). Au retour, `audioKick()`\n"
      "  // exige `!paused` — mais `paused` est resté vrai, donc le son ne revenait JAMAIS.\n"
      "  // Le joueur croit le jeu cassé : rien à l'écran ne dit qu'il faut appuyer sur P.\n"
      "  if(paused&&started&&!gameOver)togglePause();\n"
      "  audioKick(); });")

# ---- (b) L'INTERRUPTEUR : couper une chaîne SFX par l'URL, pour isoler à l'oreille
# Six chaînes peuvent produire le bruit signalé. Plutôt que de continuer à deviner,
# on rend la bissection faisable en trois rechargements par la personne qui ENTEND.
#   ?mute=jet      réacteur / nitro
#   ?mute=eng      moteur
#   ?mute=air      vent + sifflement d'air
#   ?mute=skid     crissement de pneus
#   ?mute=siren    sirène de police
#   ?mute=pop      pops de flamme, crépitements, impacts (sons ponctuels)
# Plusieurs à la fois : ?mute=jet,pop
patch("debug : interrupteur de coupure par l'URL",
      "  musicGraph(); // BANDE-SON + analyse (le ciel pulse en rythme)",
      "  musicGraph(); // BANDE-SON + analyse (le ciel pulse en rythme)\n"
      "  /* ---- BISSECTION À L'OREILLE : ?mute=jet,eng,air,skid,siren,pop ----\n"
      "     Six chaînes peuvent produire un son parasite. Deviner coûte cher ; laisser\n"
      "     celui qui ENTEND couper une chaîne à la fois coûte trois rechargements. */\n"
      "  try{\n"
      "    const _m=(new URLSearchParams(location.search).get('mute')||'').split(',').filter(Boolean);\n"
      "    if(_m.length){\n"
      "      MUTED=_m; console.log('%c[CASH CAR] chaînes coupées : '+_m.join(', '),'color:#ffd75e;font-weight:bold');\n"
      "    }\n"
      "  }catch(e){}")

patch("debug : déclaration du drapeau",
      "let AC=null,osc=null,osc2=null,",
      "let MUTED=[]; // chaînes SFX coupées par ?mute= (voir initAudio) — vide en temps normal\n"
      "const isMuted=n=>MUTED.indexOf(n)>=0;\n"
      "let AC=null,osc=null,osc2=null,")

# les points d'application : un gain forcé à zéro par chaîne


# =============================================================================
#  17. LE CORPS DE FLAMME ÉCRASAIT TOUT LE MIX
#  ---------------------------------------------------------------------------
#  Le user a confirmé trois fois : c'est LA NITRO. Relevé des gains de la chaîne,
#  au moment où elle joue :
#      corps de flamme (jrG) .... 0,72   ← sur un bruit brown DÉJÀ normalisé à ±1
#      grave (jetLowG) .......... 0,08
#      moteur (gainN) ........... 0,05
#      souffle (jetG) ........... 0,01
#      turbine (jetOscG) ........ 0,003
#  Une couche 10 à 200 fois plus forte que toutes les autres. À elle seule elle colle
#  le limiteur au plafond dès l'appui, et tout le reste du mix passe à travers sa
#  saturation. Le commentaire du jeu dit « C'est LUI la nitro » : la flamme DOIT
#  dominer, d'accord — mais dominer, ce n'est pas saturer le bus à soi tout seul.
#  0,14 / 0,18 la laisse 3 à 4 fois au-dessus de la couche suivante, sans pinner.
patch("nitro : doser le corps de flamme",
      "        const jb=nitroOn?(nitroBlue?.52:.4):0;",
      "        // ⚠ NE PAS REMONTER SANS MESURER. À .4/.52 cette seule couche atteignait 0,72\n"
      "        // sur un bruit normalisé à ±1 — dix fois la couche suivante — et saturait le bus\n"
      "        // maître dès l'appui sur la nitro. Elle reste la voix dominante, sans écraser.\n"
      "        const jb=nitroOn?(nitroBlue?.18:.14):0;")


# =============================================================================
#  18. LA POUSSIÈRE D'OR À 5,2 kHz — LE SON STRIDENT
#  ---------------------------------------------------------------------------
#  Trois mesures convergentes, enfin :
#   1. Spectre de l'enregistrement du user : des SALVES BRÈVES centrées entre 4,6 et
#      6,8 kHz, jusqu'à 71 % de l'énergie au-dessus de 4 kHz (RMS 803 sur un fond à 150).
#   2. Test `?mute=jet,pop` du user : le bruit PERSISTE → ni le réacteur ni les pops.
#   3. `sparkle()` : du bruit dans un passe-bande à 5 200 Hz, Q=1,2 — dont la jupe
#      couvre exactement 4,6–6,8 kHz.
#  `sparkle` part à CHAQUE figure posée (`rewardSfx`) et à chaque bump (`bumpSfx`).
#  Sous nitro on est en l'air en permanence : elles tirent en rafale et se superposent.
#  5 kHz est le pic de sensibilité de l'oreille humaine : c'est le pire endroit du
#  spectre pour empiler des transitoires.
#
#  Trois corrections, toutes sur `sparkle` :
#   · la bande descend de 5 200 à 3 400 Hz — l'éclat « or » reste, le coup d'épingle part
#   · le volume est divisé par 2,5
#   · un intervalle minimum de 90 ms empêche l'empilement en rafale
patch("son : la poussière d'or ne pique plus",
      "function sparkle(t,vol){ // poussière d'or : souffle bandpass très bref\n  if(!AC)return;\n  try{\n"
      "    const src=AC.createBufferSource();src.buffer=noiseBuf(.09);\n"
      "    const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=5200;f.Q.value=1.2;\n"
      "    const g=AC.createGain();const t0=AC.currentTime+t;\n"
      "    g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+.01);",
      "let _spkT=0; // dernier scintillement : sans garde-fou ils s'empilent en rafale sous nitro\n"
      "function sparkle(t,vol){ // poussière d'or : souffle bandpass très bref\n  if(!AC||isMuted('reward'))return;\n"
      "  /* ⚠ NE PAS REMONTER LA BANDE NI LE VOLUME SANS MESURER.\n"
      "     Mesuré sur l'enregistrement d'un joueur : des salves à 4,6-6,8 kHz, jusqu'à 71 %\n"
      "     de l'énergie au-dessus de 4 kHz. C'était CE son, le « strident » signalé. La bande\n"
      "     était à 5 200 Hz — le pic exact de sensibilité de l'oreille — et `sparkle` part à\n"
      "     chaque figure posée : sous nitro on est en l'air en permanence, donc en rafale. */\n"
      "  const _now=AC.currentTime; if(_now-_spkT<.09)return; _spkT=_now;\n"
      "  try{\n"
      "    const src=AC.createBufferSource();src.buffer=noiseBuf(.09);\n"
      "    const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=3400;f.Q.value=1.2;\n"
      "    const g=AC.createGain();const t0=AC.currentTime+t;\n"
      "    g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol*.4,t0+.01);")

# le « scintillement » du carillon vise la même bande, avec le même défaut
patch("son : le scintillement du carillon aussi",
      "    const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=5200;bp.Q.value=1.4;\n"
      "    const ng=AC.createGain();ng.gain.setValueAtTime(.055,t0+.20);",
      "    const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=3400;bp.Q.value=1.4; // était 5200 : voir sparkle\n"
      "    const ng=AC.createGain();ng.gain.setValueAtTime(.022,t0+.20);")

# …et l'interrupteur gagne une clé pour vérifier en un rechargement


# =============================================================================
#  19. REFONTE DU SON DE NITRO + UN INTERRUPTEUR QUI MARCHE VRAIMENT
#  ---------------------------------------------------------------------------
#  ⚠ L'INTERRUPTEUR PRÉCÉDENT ÉTAIT FAUX. Il posait `gain.value=0` au milieu du bloc
#  par frame — et les lignes suivantes réécrivaient aussitôt ces zéros. `?mute=jet`
#  ne coupait donc qu'UNE couche sur quatre, et justement celle qui vaut déjà 0 au sol.
#  Les tests faits avec lui ne prouvent rien. On coupe désormais par DÉBRANCHEMENT,
#  une fois, à la construction : aucune écriture par frame ne peut le défaire.
patch("debug : interrupteur par débranchement (le précédent était faux)",
      "  musicGraph(); // BANDE-SON + analyse (le ciel pulse en rythme)",
      "  musicGraph(); // BANDE-SON + analyse (le ciel pulse en rythme)\n"
      "  /* ---- BISSECTION : ?mute=jet,eng,air,skid,siren,reward ----\n"
      "     ⚠ ON DÉBRANCHE, on ne met pas le gain à zéro : le bloc audio par frame\n"
      "     réécrit tous ces gains, donc un zéro posé ici serait effacé à la frame\n"
      "     suivante. Un nœud débranché, lui, ne revient jamais dans le graphe. */\n"
      "  try{\n"
      "    MUTED=(new URLSearchParams(location.search).get('mute')||'').split(',').filter(Boolean);\n"
      "    const _cut=ns=>ns.forEach(n=>{try{n&&n.disconnect();}catch(e){}});\n"
      "    if(isMuted('jet'))   _cut([jetG,jetLowG,jetOscG,jrG]);\n"
      "    if(isMuted('eng'))   _cut([gainN,engSubG,engNzG,engWhineG,engTickG,pinkG,transG,diffG,ovrG]);\n"
      "    if(isMuted('air'))   _cut([windG,whG]);\n"
      "    if(isMuted('skid'))  _cut([skidG]);\n"
      "    if(MUTED.length)console.log('%c[CASH CAR] coupé : '+MUTED.join(', '),'color:#ffd75e;font-weight:bold');\n"
      "  }catch(e){}")

patch("debug : sirène et récompenses coupables aussi",
      "    sirG.gain.setTargetAtTime(SND.sfx?vol:0,AC.currentTime,.25);",
      "    if(isMuted('siren')){try{sirG.disconnect();}catch(e){}}\n"
      "    else sirG.gain.setTargetAtTime(SND.sfx?vol:0,AC.currentTime,.25);")

# ---------------------------------------------------------------------------
#  LA REFONTE. Le user demande de repartir de zéro sur le son de nitro, après sept
#  correctifs chirurgicaux ratés. C'est le bon appel : plutôt que de chercher le
#  mauvais nœud dans un empilement de quatre couches que je ne peux pas entendre,
#  on supprime les deux couches AGRESSIVES PAR CONSTRUCTION et on garde les douces.
#
#  Ce qui part, définitivement débranché à la construction :
#   · `jetG`    — le souffle passé dans un WaveShaper `tanh(3x)` attaqué à ×2,6.
#                 Mesuré hors ligne : pic 1,004 pour un RMS de 0,67 — un signal
#                 quasi CARRÉ. C'est de l'écrêtage franc, plus un timbre.
#   · `jetOscG` — la turbine : dent de scie dans un passe-bande Q=6. Mesurée hors
#                 ligne : 43 % de son énergie au-dessus de 4 kHz. La couche la plus
#                 stridente du jeu, de très loin.
#  Ce qui reste : deux bruits filtrés bas, sans distorsion, sans résonance, sans
#  rien au-dessus de 700 Hz. Un souffle chaud plutôt qu'un cri.
patch("nitro : refonte — supprimer la distorsion et la turbine",
      "  jetG.connect(MASTER);jsrc.start();",
      "  jetG.connect(MASTER);jsrc.start();\n"
      "  /* ===================== REFONTE DU SON DE NITRO (démo) =====================\n"
      "     Sept correctifs chirurgicaux n'ont pas suffi : on retire les deux couches\n"
      "     agressives PAR CONSTRUCTION, plutôt que de les doser. Mesures hors ligne :\n"
      "       jetG    (souffle distordu) : pic 1,004 / RMS 0,67 → signal quasi CARRÉ\n"
      "       jetOscG (turbine)          : 43 % de l'énergie au-dessus de 4 kHz\n"
      "     Débranchées ici une fois pour toutes — les écritures par frame sur leurs\n"
      "     gains deviennent inoffensives. Restent deux bruits filtrés bas : chaud,\n"
      "     rond, rien au-dessus de 700 Hz.\n"
      "     ⚠ NE PAS LES REBRANCHER SANS MESURER AU BANC (voir demo/README.md). */\n"
      "  try{jetG.disconnect();}catch(e){}")

# ---------------------------------------------------------------------------
#  SUPPRESSION TOTALE DU SON DE NITRO (demandé par le user)
#  Après huit tentatives de correction ciblée, la nitro reste la source d'un bruit
#  que je n'ai jamais réussi à reproduire ni à identifier. On la rend MUETTE :
#  les quatre couches sont débranchées du graphe à la construction, et les pops de
#  flamme — qui ne servent qu'à elle — ne partent plus du tout.
#  Le reste du jeu garde tout son son : moteur, vent, crissement, sirène, récompenses.
#  ⚠ Pour la remettre un jour : il faudra d'abord SAVOIR ce qui grinçait. Rebrancher
#  à l'aveugle ramènerait le défaut avec.
patch("nitro : suppression totale du son",
      "  const jrLfo=AC.createOscillator();jrLfo.type='sine';jrLfo.frequency.value=5.3;",
      "  /* ⚠ NITRO MUETTE — DEMANDE EXPLICITE DU USER, APRÈS HUIT CORRECTIFS RATÉS.\n"
      "     Les quatre couches du réacteur sont débranchées du graphe. Le bruit signalé\n"
      "     n'a jamais pu être reproduit ni isolé ; tant qu'il ne l'est pas, la nitro se\n"
      "     joue en silence. Le reste du jeu garde son son. NE PAS REBRANCHER SANS AVOIR\n"
      "     identifié la cause : ça ramènerait le défaut avec. */\n"
      "  setTimeout(function(){ for(const n of [jetG,jetLowG,jetOscG,jrG]) try{n.disconnect();}catch(e){} },0);\n"
      "  const jrLfo=AC.createOscillator();jrLfo.type='sine';jrLfo.frequency.value=5.3;")

# les pops de flamme ne servent QUE la nitro (appelés dans `if(nitroOn)`) : ils partent aussi
patch("nitro : plus de pops de flamme",
      "function flamePop(dur,vol,freq){ // pop de combustion",
      "function flamePop(dur,vol,freq){ return; // ⚠ NITRO MUETTE : ces pops ne servent qu'à elle (voir initAudio)\n"
      "// pop de combustion")

patch("nitro : refonte — supprimer la turbine",
      "  jetOsc.connect(jof);jof.connect(jetOscG);jetOscG.connect(MASTER);jetOsc.start();",
      "  jetOsc.connect(jof);jof.connect(jetOscG);jetOscG.connect(MASTER);jetOsc.start();\n"
      "  try{jetOscG.disconnect();}catch(e){} // turbine : 43 % au-dessus de 4 kHz — voir la note ci-dessus")

# la flamme ne suit plus la vitesse : une fréquence qui monte avec le compteur, c'est
# précisément ce qui transforme un souffle en sifflet quand on pousse.
patch("nitro : refonte — la flamme ne monte plus avec la vitesse",
      "jrF.frequency.setTargetAtTime(nitroOn?Math.min(900,(air9?310+spd3*.3:430+spd3*.35)+(nitroBlue?80:0)):240,AC.currentTime,.1);",
      "jrF.frequency.setTargetAtTime(nitroOn?(air9?380:460)+(nitroBlue?60:0):240,AC.currentTime,.1); // ⚠ PLUS DE SUIVI DE VITESSE : une fréquence qui monte avec le compteur, c'est ce qui fait le sifflet")


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
