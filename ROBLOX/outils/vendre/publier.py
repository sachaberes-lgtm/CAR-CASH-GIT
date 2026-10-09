# CASH CAR — PUBLIE le jeu sur Roblox par l'API Open Cloud, sans Studio (Sacha, 9/10 : « oui, publie CashCar_PRET sur Roblox par
# l'API » ; Studio avait perdu sa connexion au compte : « La sauvegarde a échoué », 401 dans ses journaux).
# Doc lue le 9/10 dans l'OpenAPI officiel :
#   POST /universes/v1/{universeId}/places/{placeId}/versions?versionType=Published   corps = le .rbxlx (Content-Type application/xml)
#   scope universe-places:write, 30 appels/min, fichier ≤ 10 485 760 octets ; rend {"versionNumber": n}
#   python -I outils/vendre/publier.py <fichier.rbxlx>
# La clé : ROBLOX_API_KEY (session ou variable Windows « Utilisateur ») — jamais affichée, jamais écrite.
import datetime, json, os, subprocess, sys, time
import requests

sys.stdout.reconfigure(encoding='utf-8')
ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.normpath(os.path.join(ICI, '..', '..'))
CONF = json.load(open(os.path.join(ICI, 'articles.json'), encoding='utf-8'))
U, P = CONF['universe'], CONF['place']
FICHIER = sys.argv[1]
JOURNAL = os.path.join(RACINE, 'audit', 'journal.md')
LIMITE = 10485760


def cle_api():
    k = os.environ.get('ROBLOX_API_KEY')
    if not k:
        k = subprocess.run(['powershell', '-NoProfile', '-Command', "[Environment]::GetEnvironmentVariable('ROBLOX_API_KEY','User')"],
                           capture_output=True, text=True, timeout=20).stdout.strip()
    if not k:
        sys.exit('ROBLOX_API_KEY introuvable.')
    return k


def journal(ligne):
    with open(JOURNAL, 'a', encoding='utf-8') as f:
        f.write(f"\n## {datetime.datetime.now():%Y-%m-%d %H:%M} — publication\n\n{ligne}\n")


donnees = open(FICHIER, 'rb').read()
if len(donnees) > LIMITE:
    sys.exit(f'fichier trop gros pour l API : {len(donnees)} octets > {LIMITE}')
url = f'https://apis.roblox.com/universes/v1/{U}/places/{P}/versions'
k = cle_api()
for essai in range(6):
    r = requests.post(url, params={'versionType': 'Published'}, data=donnees, timeout=180,
                      headers={'x-api-key': k, 'Content-Type': 'application/xml'})
    if r.status_code == 429 or r.status_code >= 500:
        time.sleep(min(60, 2 ** (essai + 1)))
        continue
    break
if r.status_code == 200:
    v = r.json().get('versionNumber')
    print(f'PUBLIÉ : lieu {P}, version {v} ({len(donnees)} octets)')
    journal(f'Lieu {P} publié par l API : version {v}, fichier {os.path.basename(FICHIER)} ({len(donnees)} octets).')
    sys.exit(0)
print(f'ÉCHEC {r.status_code} {r.text[:400]}')
journal(f'Publication refusée : {r.status_code} {r.text[:200]}')
sys.exit(1)
