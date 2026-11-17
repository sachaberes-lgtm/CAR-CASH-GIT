#!/usr/bin/env python3
# BANC DE CHALEUR v3 — le bilan d'une série : bilan.py [essais.jsonl] [préfixe des noms, ex. b-]
# Chaque variante est comparée aux DEUX références qui l'entourent (la précédente et la suivante dans le temps) : la dérive lente du téléphone s'annule.
# Colonnes : puissance moyenne 30 s → fin (W, compteurs exacts de la jauge), écart à la référence voisine (W et %), pente de température de la batterie (°C/min), i/s, QL.
import sys, json, re, os, statistics as S
P = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/cash-car/ios-ultime-mesures/chaleur/essais.jsonl')
pre = sys.argv[2] if len(sys.argv) > 2 else ''
E = [json.loads(l) for l in open(P) if l.strip()]
E = [e for e in E if e['nom'].startswith(pre)]
est_ref = lambda e: re.search(r'-ref\d*$', e['nom']) is not None
V = [e for e in E if e['valide']]
refs = [e for e in V if est_ref(e)]
print('références valides : %d · W moy %s · écart-type %s (%s %%) · pente %s °C/min ±%s' % (
    len(refs), round(S.mean([r['W_30_fin'] for r in refs]), 2) if refs else '-',
    round(S.pstdev([r['W_30_fin'] for r in refs]), 2) if len(refs) > 1 else '-',
    round(100 * S.pstdev([r['W_30_fin'] for r in refs]) / S.mean([r['W_30_fin'] for r in refs]), 1) if len(refs) > 1 else '-',
    round(S.mean([r['pente_C_min'] for r in refs if r['pente_C_min'] is not None]), 3) if refs else '-',
    round(S.pstdev([r['pente_C_min'] for r in refs if r['pente_C_min'] is not None]), 3) if len(refs) > 1 else '-'))
groupes = {}
for i, e in enumerate(E):
    if est_ref(e): continue
    av = next((x for x in reversed(E[:i]) if est_ref(x) and x['valide']), None)
    ap = next((x for x in E[i + 1:] if est_ref(x) and x['valide']), None)
    vois = [x for x in (av, ap) if x]
    wr = S.mean([x['W_30_fin'] for x in vois]) if vois else None
    pr = S.mean([x['pente_C_min'] for x in vois if x['pente_C_min'] is not None]) if vois else None
    g = re.sub(r'-?\d+$', '', e['nom'])
    groupes.setdefault(g, []).append((e, wr, pr))
print('%-16s %-4s %6s %7s %7s %7s %6s %5s %s' % ('variante', 'n', 'W', 'ΔW', 'Δ%', '°C/min', 'Δpente', 'i/s', 'QL / remarques'))
for g, L in groupes.items():
    ok = [(e, wr, pr) for e, wr, pr in L if e['valide'] and wr]
    if not ok:
        print('%-16s %-4s  INVALIDE : %s' % (g, len(L), '; '.join(', '.join(e['raisons']) for e, _, _ in L))); continue
    W = [e['W_30_fin'] for e, _, _ in ok]; D = [e['W_30_fin'] - wr for e, wr, _ in ok]; DP = [100 * (e['W_30_fin'] - wr) / wr for e, wr, _ in ok]
    pe = [e['pente_C_min'] for e, _, _ in ok if e['pente_C_min'] is not None]; dpe = [e['pente_C_min'] - pr for e, _, pr in ok if e['pente_C_min'] is not None and pr is not None]
    print('%-16s %-4s %6.2f %+7.2f %+6.0f%% %7.3f %+6.3f %5s %s%s' % (g, len(ok), S.mean(W), S.mean(D), S.mean(DP), S.mean(pe) if pe else 0, S.mean(dpe) if dpe else 0,
          ok[0][0].get('ips'), ok[0][0].get('ql'), ('  (essais : ' + ' / '.join('%+.2f' % d for d in D) + ' W)') if len(D) > 1 else ''))
