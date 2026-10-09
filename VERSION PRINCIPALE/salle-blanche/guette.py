# LA SALLE BLANCHE — le guetteur (2026-10-09, Léo : « quand tu vois la liste a changé, demande et précise c'quoi le changement, et
# demande si push sur main »). Il lit salle-blanche/sauvegarde.json (posé par serveur.py) et écrit UNE ligne quand Léo a fini une série
# de gestes (rien de neuf depuis CALME secondes) : les gestes du journal + les écarts avec le main. Claude le lance en Monitor :
#   python3 -u salle-blanche/guette.py salle-blanche/sauvegarde.json 40      (depuis VERSION PRINCIPALE)
import json, os, sys, time
P = sys.argv[1]
CALME = float(sys.argv[2]) if len(sys.argv) > 2 else 40

def lire():
    try:
        with open(P, encoding='utf-8') as f: return json.load(f)
    except Exception:
        return None

def gestes(d):
    return [j.get('x', '') for j in ((d or {}).get('etat') or {}).get('journal') or [] if j.get('x') != '— fiche téléchargée —']

def court(t, n):
    return t if len(t) <= n else t[:n - 1] + '…'

base = None; vu = None; mt = 0; attente = 0; dern = None
d = lire()
if d: base = gestes(d); vu = len(base)
while True:
    try:
        m = os.path.getmtime(P)
    except OSError:
        m = 0
    if m and m != mt:
        mt = m; d = lire()
        if d:
            g = gestes(d)
            if base is None:
                base = g; vu = len(g)
                print('SALLE OUVERTE · écarts avec le main : %d%s' % (len(d.get('ecarts') or []), (' · ' + court(' ; '.join(d.get('ecarts')), 900)) if d.get('ecarts') else '') + (' · ordre changé dans : ' + ', '.join(d.get('ordres')) if d.get('ordres') else ''), flush=True)
            elif len(g) < len(base):
                base = g; vu = len(g)
            elif len(g) != vu:
                vu = len(g); attente = time.time(); dern = d
    if attente and time.time() - attente >= CALME:
        d = dern or lire(); g = gestes(d); neufs = g[len(base):]
        e = d.get('ecarts') or []; o = d.get('ordres') or []
        print('LISTE CHANGÉE · %d geste(s) : %s || écarts avec le main maintenant : %d%s%s' % (
            len(neufs), court(' | '.join(neufs), 1200), len(e), (' · ' + court(' ; '.join(e), 900)) if e else '',
            (' · ordre changé dans : ' + ', '.join(o)) if o else ''), flush=True)
        base = g; attente = 0
    time.sleep(2)
