# LA SALLE BLANCHE — le guetteur (2026-10-09, Léo : « quand tu vois la liste a changé, demande et précise c'quoi le changement, et
# demande si push sur main »). Il lit salle-blanche/sauvegarde.json (posé par serveur.py) et écrit UNE ligne quand Léo a fini une série
# de gestes (rien de neuf depuis CALME secondes) : les gestes du journal + les écarts avec le main. Claude le lance en Monitor :
#   python3 -u salle-blanche/guette.py salle-blanche/sauvegarde.json 40      (depuis VERSION PRINCIPALE)
import json, os, sys, time
P = sys.argv[1]
CALME = float(sys.argv[2]) if len(sys.argv) > 2 else 40
UNE = len(sys.argv) > 3 and sys.argv[3] == 'une'   # 'une' : s'arrête après le premier changement (Claude le relance en tâche de fond)

def lire():
    try:
        with open(P, encoding='utf-8') as f: return json.load(f)
    except Exception:
        return None

def gestes(d):
    return [j for j in ((d or {}).get('etat') or {}).get('journal') or [] if j.get('x') != '— fiche téléchargée —']

def cle(j):
    return '%s|%s' % (j.get('t'), j.get('x'))

def court(t, n):
    return t if len(t) <= n else t[:n - 1] + '…'

# (2026-10-10) LES GESTES DÉJÀ VUS, par leur heure et leur texte — pas par leur nombre : avec plusieurs onglets ouverts, un onglet en
# retard réécrit un journal plus court, puis un autre le rallonge ; compter faisait revoir les mêmes gestes comme nouveaux.
vus = None; mt = 0; attente = 0; dern = None
d = lire()
if d: vus = set(cle(j) for j in gestes(d))
while True:
    try:
        m = os.path.getmtime(P)
    except OSError:
        m = 0
    if m and m != mt:
        mt = m; d = lire()
        if d:
            if vus is None:
                vus = set(cle(j) for j in gestes(d))
                print('SALLE OUVERTE · écarts avec le main : %d%s' % (len(d.get('ecarts') or []), (' · ' + court(' ; '.join(d.get('ecarts')), 900)) if d.get('ecarts') else '') + (' · ordre changé dans : ' + ', '.join(d.get('ordres')) if d.get('ordres') else ''), flush=True)
            elif any(cle(j) not in vus for j in gestes(d)):
                attente = time.time(); dern = d
    if attente and time.time() - attente >= CALME:
        d = lire() or dern; neufs = [j for j in gestes(d) if cle(j) not in vus]
        e = d.get('ecarts') or []; o = d.get('ordres') or []
        if neufs:
            print('LISTE CHANGÉE · %d geste(s) : %s || écarts avec le main maintenant : %d%s%s' % (
                len(neufs), court(' | '.join(j.get('x', '') for j in neufs), 1200), len(e), (' · ' + court(' ; '.join(e), 900)) if e else '',
                (' · ordre changé dans : ' + ', '.join(o)) if o else ''), flush=True)
            for j in neufs: vus.add(cle(j))
        attente = 0
        if UNE and neufs: break
    time.sleep(2)
