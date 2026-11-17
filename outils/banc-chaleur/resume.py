#!/usr/bin/env python3
# BANC DE CHALEUR v3 — le résumé d'un essai (appelé par essai2.sh) : resume.py journal octet0 batterie octet0 "H0" "H1" nom qs
# Lit, entre H0 et H1 : le battement CCBANC de l'app, la puissance et la température de la batterie (batterie.py), le budget du noyau (clientId 10).
# Écrit une ligne lisible (stdout) et une ligne JSON dans essais.jsonl (à côté du journal). INVALIDE si l'app n'a pas fait ce qu'on lui demandait.
import sys, re, json, os, statistics as S
from datetime import datetime
J, oJ, BT, oB, h0, h1, nom, qs = sys.argv[1], int(sys.argv[2]), sys.argv[3], int(sys.argv[4]), sys.argv[5], sys.argv[6], sys.argv[7], sys.argv[8]
f = lambda h: datetime.strptime(h[:19], '%Y-%m-%d %H:%M:%S').timestamp() + (float('0.' + h[20:26]) if len(h) > 20 and h[19] == '.' else 0)
t0, t1 = f(h0), f(h1)
def lignes(p, o):
    with open(p, 'rb') as fh:
        fh.seek(max(0, o - 2000))
        for l in fh.read().decode('utf-8', 'replace').splitlines():
            if len(l) > 26 and l[4] == '-' and l[10] == ' ':
                try: t = f(l[:26])
                except Exception: continue
                if t0 <= t <= t1: yield t - t0, l
HB, K, LV = [], [], []
for t, l in lignes(J, oJ):
    i = l.find('CCBANC ')
    if i >= 0:
        d = dict(re.findall(r'(\S+?)=(\S*)', l[i + 7:])); d['t'] = t; HB.append(d); continue
    m = re.search(r'clientId 10, details \d+, Thermal Budget (\d+)', l)
    if m: K.append((t, int(m.group(1)))); continue
    m = re.search(r'thermalLevel,(\d+)', l)
    if m: LV.append((t, int(m.group(1))))
BA = []
for t, l in lignes(BT, oB):
    d = dict(re.findall(r'(\w+)=(-?\d+|None)', l))
    if d.get('load') not in (None, 'None'): BA.append((t, {k: (int(v) if v != 'None' else None) for k, v in d.items()}))
dur = t1 - t0
def moy(a, b, cle='load'):
    v = [d[cle] for t, d in BA if a <= t < b and d.get(cle) is not None]
    return round(S.mean(v) / 1000, 2) if v else None
mode = (re.search(r'chaleur=(\w+)', qs) or [None, '?'])[1]
attendu = {'course': 'course', 'accueil': 'menu', 'pause': 'pause', 'vide': 'vide'}.get(mode, 'course')
apres = [d for d in HB if d['t'] >= 30 and d.get('état') not in ('lancement',)]
nb_att = max(1, int((dur - 30) / 10))
bon = [d for d in apres if d.get('état') == attendu]
pc = round(100 * len(bon) / nb_att)
lanc = sum(1 for d in HB if d.get('état') == 'lancement'); muet = sum(1 for d in HB if d.get('état') == 'muet')
err = [d.get('x', '') for d in HB if d.get('état') == 'erreur']
med = lambda k, L=bon: (S.median([float(d[k]) for d in L if d.get(k) not in (None, '', '-')]) if [d for d in L if d.get(k) not in (None, '', '-')] else None)
cartes = sorted({d.get('carte') for d in bon if d.get('carte')}); meteos = sorted({d.get('météo') for d in bon if d.get('météo')})
mot = max([int(d.get('moteur', 0) or 0) for d in bon] or [0])
ql = round(S.mean([float(d['QL']) for d in bon if d.get('QL')]), 2) if [d for d in bon if d.get('QL')] else None
thm = max([int(d.get('th', 0) or 0) for d in HB] or [0])
tb = [(t, d['tbat']) for t, d in BA if d.get('tbat')]
tb0 = tb[0][1] if tb else None; tb1 = tb[-1][1] if tb else None
pente = None
if len(tb) > 10:
    xs = [t for t, v in tb if t >= 60]; ys = [v for t, v in tb if t >= 60]
    if len(xs) > 5:
        mx, my = S.mean(xs), S.mean(ys); den = sum((x - mx) ** 2 for x in xs)
        pente = round(sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / den * 60 / 100, 3) if den else None  # °C par minute
pct = [d.get('pct') for t, d in BA if d.get('pct') is not None]
charge = max([d.get('charge') or 0 for t, d in BA] or [0])
def ak(s):
    for t, b in K:
        if b < s: return round(t)
    return None
kmin = min([b for t, b in K] or [None]) if K else None
raisons = []
if mode != 'vide' and pc < 90: raisons.append('%s %d %% du temps' % (attendu, pc))
if mode == 'vide' and pc < 90: raisons.append('page noire %d %%' % pc)
if lanc > 1: raisons.append('relancée %d×' % lanc)
if lanc == 0: raisons.append('pas de lancement vu')
if muet: raisons.append('page muette %d×' % muet)
if err: raisons.append('erreur ' + err[0])
if charge: raisons.append('BATTERIE EN CHARGE')
if len(BA) < dur / 10: raisons.append('puissance lue %d fois' % len(BA))
r = dict(nom=nom, qs=qs, debut=h0, dur=round(dur), valide=not raisons, raisons=raisons, pc_etat=pc, cartes=cartes, meteos=meteos, moteur=mot,
         kmh=med('km/h'), ips=med('ips'), rendu_ms=med('rendu_ms'), ql=ql, dpr=med('DPR'), cad=med('cad'), th_max=thm, eco=med('eco', HB), lum=med('lum', HB),
         W_30_120=moy(30, 120), W_120_240=moy(120, 240), W_240_fin=moy(240, dur + 1), W_30_fin=moy(30, dur + 1), W_entree=moy(30, dur + 1, 'in'),
         tbat0=tb0, tbat1=tb1, dT=(round((tb1 - tb0) / 100, 2) if tb else None), pente_C_min=pente, pct0=pct[0] if pct else None, pct1=pct[-1] if pct else None,
         noyau_2500=ak(2500), noyau_2000=ak(2000), noyau_min=kmin, niveau_max=max([v for t, v in LV] or [0]))
with open(os.path.join(os.path.dirname(J), 'essais.jsonl'), 'a') as o: o.write(json.dumps(r, ensure_ascii=False) + '\n')
x = lambda v: '-' if v is None else str(v)
print('%-18s %s | %s %d%% %s/%s mot %s %s km/h %s i/s rendu %s ms QL %s DPR %s | W 30-120 %s · 120-240 %s · 240-fin %s · moy %s | tbat %s→%s (%s °C, %s °C/min) | noyau <2500 %s s <2000 %s s min %s | th %s niv %s | bat %s→%s %% lum %s' % (
    nom, 'VALIDE' if r['valide'] else 'INVALIDE (' + ', '.join(raisons) + ')', attendu, pc, ','.join(cartes) or '-', ','.join(meteos) or '-', mot, x(r['kmh']), x(r['ips']), x(r['rendu_ms']), x(ql), x(r['dpr']),
    x(r['W_30_120']), x(r['W_120_240']), x(r['W_240_fin']), x(r['W_30_fin']), x(tb0), x(tb1), x(r['dT']), x(pente), x(r['noyau_2500']), x(r['noyau_2000']), x(kmin), thm, r['niveau_max'], x(r['pct0']), x(r['pct1']), x(r['lum'])))
