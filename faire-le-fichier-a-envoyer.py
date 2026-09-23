#!/usr/bin/env python3
# Fabrique UN SEUL fichier HTML autonome : trois.js + shaders + la police + TOUS les mp3 dedans.
# Aucun serveur, aucun dossier, aucune connexion : double-clic et ca roule.
#   Usage :  python3 faire-le-fichier-a-envoyer.py "~/Downloads/CASH CAR.html"
#            python3 faire-le-fichier-a-envoyer.py --artifact "sortie.html"   (page hebergee : sans <head>/<body>)
import base64, json, os, re, sys, urllib.request

ARTIFACT = "--artifact" in sys.argv                       # variante pour une page hebergee (lien)
args = [a for a in sys.argv[1:] if not a.startswith("--")]
SRC = os.path.dirname(os.path.abspath(__file__))          # le dossier du projet
LIB = os.path.join(SRC, ".libs-embarquees")               # cache des libs du CDN (a garder, ou pas)
OUT = os.path.expanduser(args[0] if args else "~/Downloads/CASH CAR.html")

# Les libs du CDN sont telechargees UNE fois puis mises en cache : ensuite le script marche hors ligne.
CDN = {
    "three.min.js": "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
    # La police du jeu. Google Fonts est INJOIGNABLE hors ligne, et bloque par la CSP d'une page
    # hebergee : sans ce fichier en dur, tout le HUD retombe en monospace sans le moindre message.
    "ps2p-latin.woff2": "https://fonts.gstatic.com/s/pressstart2p/v16/e3t4euO8T-267oIAQAu6jDQyK3nVivNm4I81.woff2",
    "ps2p-latinext.woff2": "https://fonts.gstatic.com/s/pressstart2p/v16/e3t4euO8T-267oIAQAu6jDQyK3nbivNm4I81PZQ.woff2",
}
for f in ["shaders/CopyShader", "shaders/LuminosityHighPassShader", "postprocessing/EffectComposer",
          "postprocessing/ShaderPass", "postprocessing/RenderPass", "postprocessing/UnrealBloomPass"]:
    CDN[os.path.basename(f) + ".js"] = "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/" + f + ".js"
os.makedirs(LIB, exist_ok=True)
for fname, url in CDN.items():
    p = os.path.join(LIB, fname)
    if not os.path.exists(p):
        print("telechargement", fname)
        urllib.request.urlretrieve(url, p)


def b64(path):
    return base64.b64encode(open(path, "rb").read()).decode()

h = open(os.path.join(SRC, "index.html"), encoding="utf-8").read()
n0 = len(h)

# --- 1) les liens qui pointent vers des fichiers voisins : ils n'existent plus ---
h2 = h.replace('<link rel="manifest" href="manifest.webmanifest">\n', "")
h2 = h2.replace('<link rel="apple-touch-icon" href="icon.svg">\n', "")
assert len(h2) < len(h), "liens manifest/icon introuvables"
h = h2

# --- 1bis) le service worker : il irait chercher un sw.js qui n'existe plus a cote ---
m = re.search(r"if\('serviceWorker'in navigator&&location\.protocol!=='file:'\)\{[^\n]*\}\n", h)
assert m, "bloc serviceWorker introuvable"
h = h[: m.start()] + "/* SW retire : le jeu tient dans ce seul fichier, il n'a rien a mettre en cache. */\n" + h[m.end() :]

# --- 1ter) la police Press Start 2P : le lien Google Fonts devient un @font-face en dur ---
m = re.search(r'<link href="https://fonts\.googleapis\.com[^"]*" rel="stylesheet">\n', h)
assert m, "lien Google Fonts introuvable"
face = "<style>/* Press Start 2P (OFL) embarquee : plus aucun appel a Google Fonts. */\n"
for f, rng in [("ps2p-latin.woff2", "U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212"),
               ("ps2p-latinext.woff2", "U+0100-02BA,U+1E00-1E9F,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113")]:
    face += ("@font-face{font-family:'Press Start 2P';font-style:normal;font-weight:400;font-display:block;"
             "src:url(data:font/woff2;base64," + b64(os.path.join(LIB, f)) + ")format('woff2');unicode-range:" + rng + "}\n")
face += "</style>\n"
h = h[: m.start()] + face + h[m.end() :]

# --- 1quater) localStorage inaccessible (page hebergee en bac a sable, navigation privee) ---
# `typeof localStorage` LEVE une exception quand l'acces est refuse, et ca tuait le script avant
# la premiere ligne du jeu. On lui donne alors une memoire volatile : on perd la sauvegarde, pas la partie.
# ⚠ le jeu lit/ecrit en ACCES DIRECT (`localStorage.ccLang`, `localStorage[K]=…`), pas via getItem :
# le remplacant est donc un objet ordinaire, dont getItem/setItem tapent dans les MEMES proprietes.
guard = ("<script>/* filet : si le navigateur refuse localStorage, on joue quand meme (sans sauvegarde). */\n"
         "(function(){try{window.localStorage.getItem('x');return;}catch(e){}\n"
         "var m={getItem:function(k){return k in this?String(this[k]):null},setItem:function(k,v){this[k]=String(v)},"
         "removeItem:function(k){delete this[k]},clear:function(){for(var k in this)if(typeof this[k]!=='function')delete this[k]}};\n"
         "try{Object.defineProperty(window,'localStorage',{configurable:true,value:m});}catch(_){}})();\n"
         "</script>\n")

# --- 2) les 7 <script src=\"...\"> du CDN deviennent du code en dur ---
LIBS = [
    ("three.js/r128/three.min.js", "three.min.js"),
    ("shaders/CopyShader.js", "CopyShader.js"),
    ("shaders/LuminosityHighPassShader.js", "LuminosityHighPassShader.js"),
    ("postprocessing/EffectComposer.js", "EffectComposer.js"),
    ("postprocessing/ShaderPass.js", "ShaderPass.js"),
    ("postprocessing/RenderPass.js", "RenderPass.js"),
    ("postprocessing/UnrealBloomPass.js", "UnrealBloomPass.js"),
]
for needle, fname in LIBS:
    pat = re.compile(r'<script[^>]*src="[^"]*' + re.escape(needle) + r'"[^>]*></script>')
    m = pat.search(h)
    assert m, "balise introuvable : " + needle
    code = open(os.path.join(LIB, fname), encoding="utf-8").read()
    # </script> dans une chaine JS couperait la balise en deux
    code = code.replace("</script", "<\\/script")
    h = h[: m.start()] + "<script>/*" + fname + "*/\n" + code + "\n</script>" + h[m.end() :]

# --- 3) tous les mp3 en data: URI, resolus par un shim d'Audio() ---
# ⚠ LA LISTE EST DEDUITE DU CODE, JAMAIS ECRITE A LA MAIN. Elle l'etait, et ca a coute deux
# livraisons ratees : le morceau du niveau etait fige sur « chrome-ledger » (donc on envoyait
# l'ancienne musique), et les sons de mort, ajoutes plus tard, n'etaient tout simplement pas
# embarques. Un asset qu'on oublie ne fait pas d'erreur — il fait un silence.
# On lit donc les MEMES sources que le jeu : MUSIC.run, ANN_DIR + ANN_LIB, DEATH_DIR + DEATH_LIB.
def _tab(nom):
    """Le corps d'une table `const X={...}` ou `const X=[...]`.

    ⚠ LE TERMINATEUR SE DEDUIT DU PREMIER CARACTERE APRES LE `=`, PAS D'UN SCAN.
    La version d'avant testait `"{" in h[i:i+60]` : pour un TABLEAU D'OBJETS
    (`const DEATH_LIB=[ {f:'…'}, … ]`) elle voyait l'accolade du premier objet, partait
    chercher un `\\n};` et avalait tout jusqu'a la table suivante. Symptome : les sons
    d'evenement se retrouvaient reclames dans `assets/audio/death/`. Le bug dormait depuis
    que DEATH_LIB existe ; il n'est sorti qu'en ajoutant une table apres elle.
    """
    i = h.index("const " + nom + "=")
    ouvre = h[i + len("const " + nom + "="):].lstrip()[0]
    j = h.index("\n};", i) if ouvre == "{" else h.index("\n];", i)
    # ⚠ les commentaires sont RETIRES : `menu:'', // ex : 'assets/audio/music/menu.mp3'` faisait
    # reclamer un fichier d'exemple qui n'a jamais existe. Un commentaire n'est pas une dependance.
    return re.sub(r"//[^\n]*", "", h[i:j])

def _dir(nom):                       # la constante de dossier associee a une table
    return re.search(nom + r"\s*=\s*'([^']+)'", h).group(1)

refs = []
# ⚠ ON LIT `MUSIC_TRACKS` (le pool de la radio, 2026-09-03), PAS `MUSIC.run` : `run` n'existe plus
# depuis que la musique s'enchaine au hasard sur tout le pool plutot que par niveau. S'y fier via
# une ancienne cle (`NIVEAUX`, supprimee) n'embarquerait rien — silence total dans le fichier autonome.
refs += re.findall(r"f:'(assets/audio/music/[^']+\.mp3)'", _tab("MUSIC_TRACKS"))
refs += [_dir("ANN_DIR")   + f for f in re.findall(r"f:'([^']+)'", _tab("ANN_LIB"))]    # les 9 voix
refs += [_dir("DEATH_DIR") + f for f in re.findall(r"f:'([^']+)'", _tab("DEATH_LIB"))]  # les sons de mort
# les samples d'evenement : le WOW (un objet seul) et les 9 sons d'argent (un tableau)
refs += [_dir("FX_DIR") + f for f in re.findall(r"f:'([^']+)'", _tab("FX_WOW") + _tab("FX_ARGENT"))]

manquants = [r for r in refs if not os.path.exists(os.path.join(SRC, r))]
assert not manquants, "le jeu reclame des fichiers absents du projet : " + ", ".join(manquants)

assets = {}
for rel in refs:
    raw = open(os.path.join(SRC, rel), "rb").read()
    assets[rel] = "data:audio/mpeg;base64," + base64.b64encode(raw).decode()
print("assets deduits du code :", *[" · " + r for r in refs], sep="\n")

shim = (
    "<script>/* LES SONS SONT DANS CE FICHIER : Audio('assets/...') est redirige vers le mp3 embarque. */\n"
    "(function(){var M=" + json.dumps(assets, separators=(",", ":")) + ";\n"
    "var N=window.Audio;window.Audio=function(u){return new N(M[u]||u);};window.Audio.prototype=N.prototype;})();\n"
    "</script>\n"
)
tag = "<script>/*three.min.js*/"
i = h.index(tag)
h = h[:i] + guard + shim + h[i:]

# --- 4) variante PAGE HEBERGEE : l'hebergeur fournit son propre <head>, on ne livre que le contenu ---
if ARTIFACT:
    # les <meta> de tete n'ont plus de sens hors du <head> de l'hebergeur ; le <style> et le jeu, si.
    head = h[h.index("<head>") + 6 : h.index("</head>")]
    body = h[h.index("<body>") + 6 : h.rindex("</body>")]
    garde = []
    for bloc in re.findall(r"<style>[\s\S]*?</style>|<script>[\s\S]*?</script>", head):
        garde.append(bloc)
    assert garde, "rien a garder de la tete (style/script)"
    h = "\n".join(garde) + "\n" + body + "\n"

open(OUT, "w", encoding="utf-8").write(h)
print(("page hebergee" if ARTIFACT else "fichier a envoyer") + " : %.1f Mo (source %.0f Ko)" % (os.path.getsize(OUT) / 1048576, n0 / 1024))
print("mp3 embarques :", len(assets), "· police embarquee · 0 appel reseau")
