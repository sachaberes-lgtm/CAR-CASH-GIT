"""LE SERVEUR DE LA PAGE « LA MUSIQUE SUIT LE MOTEUR » (musique-moteur.html, 2026-10-13).
   · sert le dépôt SANS CACHE (un navigateur gardait une vieille page en mémoire : « ça charge pas ») ;
   · enregistre les NOMS et les SUPPRESSIONS de Léo (« laisse supprimer et changer les noms ») dans musique-moteur.json, à la racine.
   · FIGE les morceaux à paliers (2026-10-13, Léo : « ça bug beaucoup… c'est lent ») : la page envoie chaque palier rendu en WAV
     (POST /fige?f=assets/audio/music/paliers/rendus/<id>/p1.wav), le serveur le convertit en M4A (afconvert, AAC 192 k — Chrome et
     Safari le relisent à l'échantillon près) et efface le WAV ; POST /fige-index range la fiche du morceau dans rendus/index.js.
     La bibliothèque (bibliotheque.html) ne calcule plus rien : elle lit ces fichiers.
   · reçoit les SONS D'INSPIRATION du générateur (2026-10-14) : POST /inspi?nom=… (le fichier) → assets/audio/music/inspi-generateur/,
     POST /inspi-note {id, note}, POST /inspi-ref {titre, note} (une référence sans fichier) ; la liste dans inspi-generateur/liste.json.
   · fige LES GOÛTS du générateur (POST /gouts → assets/audio/music/direct/gouts-trente.json, 2026-10-14) : les poids appris des 👍 / 👎.
   Lancer : python3 atelier-son/serveur-moteur.py 9141  →  http://127.0.0.1:9141/bibliotheque.html
   (sur le main, depuis VERSION PRINCIPALE : RACINE = le dossier du jeu. Le site en ligne n'a pas ce serveur : la page s'en passe.)
"""
import http.server, json, os, re, subprocess, sys

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FICHIER = os.path.join(RACINE, 'musique-moteur.json')
INSPI = 'assets/audio/music/inspi-generateur'   # les sons d'inspiration que Léo dépose pour le générateur (+ liste.json : titre, note)


class Page(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):   # X-Serveur-Moteur (2026-10-14) : la bibliothèque sait qu'elle peut écrire ; en ligne (Vercel) l'en-tête manque, elle n'envoie rien
        self.send_header('Cache-Control', 'no-store, must-revalidate'); self.send_header('Expires', '0'); self.send_header('X-Serveur-Moteur', '1'); super().end_headers()

    def do_GET(self):   # pas encore de noms enregistrés : une fiche vide plutôt qu'une erreur 404 dans la console
        if self.path.split('?')[0] == '/' + INSPI + '/liste.json' and not os.path.exists(os.path.join(RACINE, INSPI, 'liste.json')):
            self._rep([]); return
        if self.path.split('?')[0] == '/musique-moteur.json' and not os.path.exists(FICHIER):
            self._rep({'noms': {}, 'suppr': [], 'paliers': {}, 'pouces': []}); return
        super().do_GET()

    def _rep(self, obj):
        self.send_response(200); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(json.dumps(obj).encode())

    def do_POST(self):
        chemin, _, q = self.path.partition('?')
        n = int(self.headers.get('Content-Length', 0))
        if chemin == '/fige':   # un palier rendu (WAV) → M4A dans assets/audio/music/paliers/rendus/<id>/
            f = dict(x.split('=', 1) for x in q.split('&') if '=' in x).get('f', '')
            f = __import__('urllib.parse').parse.unquote(f)
            if not re.fullmatch(r'assets/audio/music/paliers/rendus/[a-z0-9-]+/[a-z0-9-]+\.wav', f):
                self.send_error(400); return
            wav = os.path.join(RACINE, f); os.makedirs(os.path.dirname(wav), exist_ok=True)
            with open(wav, 'wb') as o: o.write(self.rfile.read(n))
            m4a = wav[:-4] + '.m4a'
            subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '192000', wav, m4a], check=True)
            os.remove(wav); self._rep({'ok': True, 'f': f[:-4] + '.m4a'}); return
        if chemin == '/inspi':   # (14/10, Léo : « garde la liste pour que je puisse toujours te rajouter des sons inspi ») : un son déposé
            nom = __import__('urllib.parse').parse.unquote(dict(x.split('=', 1) for x in q.split('&') if '=' in x).get('nom', 'son'))
            base, ext = os.path.splitext(os.path.basename(nom)); ext = ext.lower()
            if ext not in ('.mp3', '.m4a', '.wav', '.aac', '.ogg', '.flac', '.aif', '.aiff', '.mp4', '.mov', '.webm') or not 0 < n <= 120 * 2 ** 20:
                self.send_error(400); return
            import time; ts = time.strftime('%Y%m%d-%H%M%S'); slug = re.sub(r'[^a-z0-9]+', '-', base.lower()).strip('-')[:40] or 'son'
            dos = os.path.join(RACINE, INSPI); os.makedirs(dos, exist_ok=True); f = '%s/%s-%s%s' % (INSPI, ts, slug, ext)
            with open(os.path.join(RACINE, f), 'wb') as o: o.write(self.rfile.read(n))
            e = {'id': 'ins-%s-%s' % (ts, slug)[:60], 'titre': base[:60], 'f': f, 'note': '', 'date': time.strftime('%Y-%m-%d %H:%M')}
            L = self._inspi(); L.append(e); self._inspi(L); self._rep(e); return
        if chemin == '/inspi-ref':   # une RÉFÉRENCE sans fichier (« Ateyaba – Vision ») : le titre et la note, en attendant le son
            import time; d = json.loads(self.rfile.read(n) or b'{}'); t = str(d.get('titre', '')).strip()[:80]
            if not t: self.send_error(400); return
            ts = time.strftime('%Y%m%d-%H%M%S'); slug = re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')[:40] or 'ref'
            e = {'id': 'ref-%s-%s' % (ts, slug)[:60], 'titre': t, 'f': None, 'note': str(d.get('note', ''))[:500], 'date': time.strftime('%Y-%m-%d %H:%M'), 'ref': True}
            L = self._inspi(); L.append(e); self._inspi(L); self._rep(e); return
        if chemin == '/gouts':   # LES GOÛTS APPRIS du générateur, figés pour le jeu : assets/audio/music/direct/gouts-trente.json
            if not 0 < n <= 200000: self.send_error(400); return
            g = json.loads(self.rfile.read(n) or b'{}')
            if not isinstance(g, dict): self.send_error(400); return
            with open(os.path.join(RACINE, 'assets/audio/music/direct/gouts-trente.json'), 'w', encoding='utf-8') as o: json.dump(g, o, ensure_ascii=False, indent=1)
            self._rep({'ok': True}); return
        if chemin == '/inspi-note':   # ce qui lui plaît dans le son
            d = json.loads(self.rfile.read(n) or b'{}'); L = self._inspi()
            for e in L:
                if e['id'] == str(d.get('id')): e['note'] = str(d.get('note', ''))[:500]
            self._inspi(L); self._rep({'ok': True}); return
        if chemin == '/fige-index':   # la fiche d'un morceau figé → rendus/index.js (window.PALIERS_RENDUS)
            e = json.loads(self.rfile.read(n) or b'{}')
            if not re.fullmatch(r'[a-z0-9-]+', str(e.get('id', ''))):
                self.send_error(400); return
            js = os.path.join(RACINE, 'assets/audio/music/paliers/rendus/index.js'); tous = {}
            if os.path.exists(js):
                t = open(js, encoding='utf-8').read(); tous = json.loads(t[t.index('=') + 1:].strip().rstrip(';'))
            tous[e['id']] = e
            with open(js, 'w', encoding='utf-8') as o:
                o.write('/* LES MORCEAUX À PALIERS FIGÉS (écrit par atelier-son/serveur-moteur.py, ne pas éditer à la main) */\nwindow.PALIERS_RENDUS=' + json.dumps(tous, ensure_ascii=False) + ';\n')
            self._rep({'ok': True}); return
        if chemin != '/musique-moteur.json':
            self.send_error(404); return
        try:
            d = json.loads(self.rfile.read(n) or b'{}')
            propre = {'noms': {str(k)[:40]: str(v).strip()[:40] for k, v in (d.get('noms') or {}).items() if str(v).strip()},
                      'suppr': [str(x)[:40] for x in (d.get('suppr') or [])][:100],
                      'pouces': [str(x)[:40] for x in (d.get('pouces') or [])][:300],   # les pouces en l'air de Léo
                      # (14/10) ses avis sur les musiques GÉNÉRÉES (👍 / 👎, avec leurs traits et les goûts qui les ont faites)
                      'gen': [dict(e, avis=1 if (e.get('avis') or 0) > 0 else 0 if (e.get('avis') or 0) == 0 else -1) for e in (d.get('gen') or []) if isinstance(e, dict) and len(json.dumps(e)) <= 8000][-300:],
                      # par morceau : le nom de chaque palier et les paliers retirés (« je parle des sons jaugés »)
                      'paliers': {str(m)[:60]: {'noms': {str(int(i)): str(v).strip()[:24] for i, v in ((q or {}).get('noms') or {}).items() if str(v).strip()},
                                                'suppr': sorted({int(i) for i in ((q or {}).get('suppr') or []) if 0 <= int(i) < 64})}
                                  for m, q in list((d.get('paliers') or {}).items())[:50]},
                      # (14/10, Léo : « laisse glisser des trucs dans différentes catégories ») : où chaque son a été glissé, et ses catégories à lui
                      'place': {str(k)[:60]: str(v)[:40] for k, v in list((d.get('place') or {}).items())[:600]},
                      'cats': [{'id': str(c.get('id'))[:24], 'nom': str(c.get('nom') or '').strip()[:30] or 'Ma catégorie'} for c in (d.get('cats') or []) if isinstance(c, dict) and c.get('id')][:30]}
        except Exception:
            self.send_error(400); return
        with open(FICHIER, 'w', encoding='utf-8') as f:
            json.dump(propre, f, ensure_ascii=False, indent=1)
        self.send_response(200); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(b'{"ok":true}')

    def _inspi(self, L=None):   # la liste des sons d'inspiration (assets/audio/music/inspi-generateur/liste.json)
        js = os.path.join(RACINE, INSPI, 'liste.json')
        if L is None:
            try: return json.load(open(js, encoding='utf-8'))
            except Exception: return []
        os.makedirs(os.path.dirname(js), exist_ok=True); json.dump(L, open(js, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    def log_message(self, *a): pass


if __name__ == '__main__':
    os.chdir(RACINE)
    http.server.ThreadingHTTPServer(('127.0.0.1', int(sys.argv[1]) if len(sys.argv) > 1 else 9141), Page).serve_forever()
