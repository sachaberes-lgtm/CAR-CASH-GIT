# CASH CAR — met en VENTE sur Roblox les passes, produits développeur et badges d'articles.json, par l'API Open Cloud
# (Sacha, 9/10 : « oui créer les par api »). Doc lue le 9/10 dans l'OpenAPI officiel (create.roblox.com/docs/cloud/openapi.json) :
#   passes   POST /game-passes/v1/universes/{u}/game-passes            (scope game-pass:write, 5/s)  multipart : name, description,
#            GET  /game-passes/v1/universes/{u}/game-passes/creator    (scope game-pass:read, 10/s)   price, isForSale, imageFile
#   produits POST /developer-products/v2/universes/{u}/developer-products          (developer-product:write, 3/s)  idem
#            GET  /developer-products/v2/universes/{u}/developer-products/creator  (developer-product:read, 10/s)
#   badges   POST /legacy-badges/v1/universes/{u}/badges   (legacy-universe.badge:manage-and-spend-robux, 100/min) multipart :
#            name, description, paymentSourceType, files, expectedCost, isActive — expectedCost = 0 TOUJOURS : un badge payant
#            est refusé, jamais payé ; et on ne tente que dans le QUOTA GRATUIT du jour (badges.roblox.com/v1/universes/{u}/
#            free-badges-quota) — le reste attend le lendemain.
# IDEMPOTENT : liste d'abord ce qui existe ; un article du même nom est RÉUTILISÉ, jamais recréé.
# La clé : variable d'environnement ROBLOX_API_KEY (ou la même, côté Windows « Utilisateur ») — jamais affichée, jamais écrite.
#   python -I outils/vendre/vendre.py                  → SIMULATION : liste, compare, dit ce qu'il ferait (rien n'est créé)
#   python -I outils/vendre/vendre.py --creer          → crée ce qui manque (passes + produits), en vente
#   python -I outils/vendre/vendre.py --creer --badges → et les badges (dans le quota gratuit du jour seulement)
# Écrit : outils/vendre/ids.json (clé → numéro) et audit/journal.md (une ligne par objet).
import datetime, json, os, subprocess, sys, time
import requests

sys.stdout.reconfigure(encoding='utf-8')
ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.normpath(os.path.join(ICI, '..', '..'))
CONF = json.load(open(os.path.join(ICI, 'articles.json'), encoding='utf-8'))
U = CONF['universe']
CREER = '--creer' in sys.argv
BADGES = '--badges' in sys.argv
# (9/10, Sacha : « l'argent doit coûter 10 x moins cher ») --corriger : un article qui existe déjà mais dont le prix en ligne n'est plus
# celui d'articles.json reçoit le bon prix (PATCH …/game-passes/{id} ou …/developer-products/{id}, champ « price » seul — doc OpenAPI)
CORRIGER = '--corriger' in sys.argv
ICONES = os.path.join(RACINE, 'publication', 'boutique')
IDS = os.path.join(ICI, 'ids.json')
JOURNAL = os.path.join(RACINE, 'audit', 'journal.md')
API = 'https://apis.roblox.com'


def cle_api():
    k = os.environ.get('ROBLOX_API_KEY')
    if not k:
        # (posée après le lancement de la session : on la lit côté Windows, sans jamais l'afficher)
        try:
            k = subprocess.run(['powershell', '-NoProfile', '-Command',
                                "[Environment]::GetEnvironmentVariable('ROBLOX_API_KEY','User')"],
                               capture_output=True, text=True, timeout=20).stdout.strip()
        except Exception:
            k = ''
    if not k:
        sys.exit('ROBLOX_API_KEY introuvable (ni dans cette session, ni dans les variables Windows « Utilisateur »).')
    return k


S = requests.Session()
S.headers['x-api-key'] = cle_api()
DERNIER = {'t': 0.0}


def appel(meth, url, pas, **kw):
    # le débit : `pas` secondes au moins entre deux appels (≤ 3/s en écriture de produits, la plus serrée) ; 429/5xx → attente
    # progressive (Retry-After si Roblox le donne), 6 essais
    r = None
    for essai in range(6):
        attente = DERNIER['t'] + pas - time.time()
        if attente > 0:
            time.sleep(attente)
        DERNIER['t'] = time.time()
        for f in (kw.get('files') or {}).values():
            if hasattr(f[1], 'seek'):
                f[1].seek(0)
        r = S.request(meth, url, timeout=60, **kw)
        if r.status_code == 429 or r.status_code >= 500:
            ra = r.headers.get('Retry-After', '')
            dors = float(ra) if ra.replace('.', '', 1).isdigit() else 2 ** essai
            print(f'  … {r.status_code}, nouvel essai dans {dors:.0f} s')
            time.sleep(dors)
            continue
        return r
    return r


def lister(chemin, cle_liste):
    out, jeton = {}, None
    while True:
        params = {'pageSize': 50}
        if jeton:
            params['pageToken'] = jeton
        r = appel('GET', API + chemin, 0.2, params=params)
        if r.status_code in (401, 403):
            # (la clé n'a pas ce droit : la famille est sautée, les autres continuent)
            print(f'⚠ droit manquant pour {chemin} : {r.status_code} {r.text[:200]}')
            return None
        if r.status_code != 200:
            sys.exit(f'lecture refusée {chemin} : {r.status_code} {r.text[:300]}')
        j = r.json()
        for x in j.get(cle_liste) or []:
            out[x['name'].strip().casefold()] = x
        jeton = j.get('nextPageToken')
        if not jeton:
            return out


def badges_existants():
    out, curseur = {}, None
    while True:
        params = {'limit': 100, 'sortOrder': 'Asc'}
        if curseur:
            params['cursor'] = curseur
        r = requests.get(f'https://badges.roblox.com/v1/universes/{U}/badges', params=params, timeout=60)
        r.raise_for_status()
        j = r.json()
        for x in j.get('data') or []:
            out[x['name'].strip().casefold()] = x
        curseur = j.get('nextPageCursor')
        if not curseur:
            return out


def prix_de(x):
    return (x.get('priceInformation') or {}).get('defaultPriceInRobux')


lignes = []


def note(a, ident, prix, statut):
    lignes.append(f"| {datetime.datetime.now():%Y-%m-%d %H:%M} | {a['cle']} | {a['type']} | {a['name']} | {ident or '—'} | "
                  f"{prix if prix is not None else '—'} | {statut} |")
    print(f"  {a['cle']:<22} {a['type']:<8} {a['name']:<22} id={str(ident or '—'):<14} prix={str(prix if prix is not None else '—'):<6} {statut}")


def poste(a, chemin, champ_image, data, pas):
    icone = os.path.join(ICONES, a['cle'] + '.png')
    if not os.path.exists(icone):
        return appel('POST', API + chemin, pas, data=data)
    with open(icone, 'rb') as f:
        return appel('POST', API + chemin, pas, data=data, files={champ_image: (os.path.basename(icone), f, 'image/png')})


def ecrire_ids(ids):
    with open(IDS, 'w', encoding='utf-8') as f:
        json.dump(ids, f, indent=2)


def main():
    ids = json.load(open(IDS, encoding='utf-8')) if os.path.exists(IDS) else {}
    passes = lister(f'/game-passes/v1/universes/{U}/game-passes/creator', 'gamePasses')
    produits = lister(f'/developer-products/v2/universes/{U}/developer-products/creator', 'developerProducts')
    print(f"existant : {'?' if passes is None else len(passes)} passe(s), {'?' if produits is None else len(produits)} produit(s)")
    print('CRÉATION' if CREER else 'SIMULATION (rien ne sera créé ; --creer pour de vrai)')
    for a in CONF['articles']:
        if a['type'] == 'badge':
            continue
        estPasse = a['type'] == 'pass'
        champ = 'gamePassId' if estPasse else 'productId'
        liste = passes if estPasse else produits
        if liste is None:
            note(a, ids.get(a['cle']), a['price'], 'SAUTÉ : la clé n’a pas le droit ' + ('game-pass' if estPasse else 'developer-product'))
            continue
        deja = liste.get(a['name'].casefold())
        if deja:
            ident, p = deja[champ], prix_de(deja)
            ids[a['cle']] = ident
            etat = 'réutilisé'
            if p != a['price'] and CORRIGER:
                base = f'/game-passes/v1/universes/{U}/game-passes' if estPasse else f'/developer-products/v2/universes/{U}/developer-products'
                r = appel('PATCH', f'{API}{base}/{ident}', 0.25 if estPasse else 0.4, files={'price': (None, str(a['price']))})
                if r.status_code in (200, 204):
                    etat += f" — prix corrigé {p} → {a['price']}"
                    p = a['price']
                else:
                    etat += f" — ⚠ ÉCHEC de la correction du prix ({r.status_code} {r.text[:160]})"
            elif p != a['price']:
                etat += f" — ⚠ prix en ligne {p}, attendu {a['price']} (non modifié)"
            if not deja.get('isForSale'):
                etat += ' — ⚠ PAS en vente (non modifié)'
            note(a, ident, p, etat)
            continue
        if not CREER:
            note(a, None, a['price'], 'à créer')
            continue
        chemin = f'/game-passes/v1/universes/{U}/game-passes' if estPasse else f'/developer-products/v2/universes/{U}/developer-products'
        data = {'name': a['name'], 'description': a['description'], 'price': str(a['price']), 'isForSale': 'true'}
        r = poste(a, chemin, 'imageFile', data, 0.25 if estPasse else 0.4)
        if r.status_code == 200:
            j = r.json()
            ids[a['cle']] = j[champ]
            note(a, j[champ], prix_de(j), 'créé, en vente' if j.get('isForSale') else 'créé (⚠ pas en vente)')
        else:
            note(a, None, a['price'], f'ÉCHEC {r.status_code} {r.text[:200]}')
        ecrire_ids(ids)
    if BADGES or not CREER:
        existants = badges_existants()
        quota = requests.get(f'https://badges.roblox.com/v1/universes/{U}/free-badges-quota', timeout=60).json()
        print(f'badges existants : {len(existants)} ; quota gratuit du jour : {quota}')
        for a in CONF['articles']:
            if a['type'] != 'badge':
                continue
            deja = existants.get(a['name'].casefold())
            if deja:
                ids[a['cle']] = deja['id']
                note(a, deja['id'], 0, 'réutilisé')
                continue
            if not (CREER and BADGES):
                note(a, None, 0, 'à créer (gratuit si quota)')
                continue
            if quota <= 0:
                note(a, None, 0, 'ARRÊT : quota gratuit épuisé aujourd’hui — à relancer demain (jamais payé)')
                continue
            data = {'name': a['name'], 'description': a['description'], 'paymentSourceType': '1', 'expectedCost': '0', 'isActive': 'true'}
            r = poste(a, f'/legacy-badges/v1/universes/{U}/badges', 'files', data, 0.7)
            if r.status_code == 200:
                ids[a['cle']] = r.json()['id']
                quota -= 1
                note(a, ids[a['cle']], 0, 'créé (gratuit)')
            else:
                note(a, None, 0, f'ÉCHEC {r.status_code} {r.text[:200]} (rien n’est payé : expectedCost = 0)')
            ecrire_ids(ids)
    ecrire_ids(ids)
    os.makedirs(os.path.dirname(JOURNAL), exist_ok=True)
    neuf = not os.path.exists(JOURNAL)
    with open(JOURNAL, 'a', encoding='utf-8') as f:
        if neuf:
            f.write('# CASH CAR — journal de mise en vente (Roblox)\n')
        f.write(f"\n## {datetime.datetime.now():%Y-%m-%d %H:%M} — {'création' if CREER else 'simulation'}\n\n")
        f.write('| date | clé | type | nom | ID | prix R$ | statut |\n|---|---|---|---|---|---|---|\n')
        f.write('\n'.join(lignes) + '\n')
    print(f'{len(ids)} numéros dans {IDS} ; journal : {JOURNAL}')


main()
