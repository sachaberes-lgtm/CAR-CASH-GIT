#!/usr/bin/env python3
# Le bilan d'une passe entrelacée (passe.sh) : pour REJOUER et MENU, avant / après, par essai :
#   saut = plus grand saut du balayage (% de l'AIRE de l'écran découverte d'une image à la suivante, relevé du jeu)
#   >50 jeu = images > 50 ms vues par le balayage pendant le retrait ; >50 page / pire page = la page entière pendant le retrait (crochet du banc)
#   retrait = ms du lever à la classe vidée ; doigt = ms après `fn` où le doigt repasse ; attente = ms après `fn` où le volet se lève
#   python3 outils/banc-transitions/bilan.py outils/banc-transitions/mesures/<étiquette>.json …
import json,sys
for f in sys.argv[1:]:
    d=json.load(open(f));print('==',f,'· charge %.0f → %.0f'%(d.get('charge0') or 0,d.get('charge1') or 0))
    for n in('REJOUER','MENU'):
        for m in('avant','apres'):
            L=[r for r in d['mesures'] if r['transition']==n and r.get('mode')==m and r.get('trans')]
            g=lambda k:[r['trans'].get(k) for r in L]
            p=lambda k:[(r.get('volet_out') or {}).get(k) for r in L]
            print('  %-8s %-6s saut %s · >50 jeu %s · >50 page %s (Σ %d) · pire page %s · retrait %s · attente %s · doigt %s'%(n,m,g('sautPct'),g('outLourdes'),p('sup50'),sum(x or 0 for x in p('sup50')),p('pire'),g('out'),g('attente'),g('doigt')))
