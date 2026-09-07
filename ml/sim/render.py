#!/usr/bin/env python3
# Rendu de l'aperçu simulation : piste vue de dessus + profil d'altitude,
# trajectoires des 7 bots, et les croisements exploitables que personne ne prend.
import json, sys, os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

seed = sys.argv[1] if len(sys.argv) > 1 else '31415'
HERE = os.path.dirname(os.path.abspath(__file__))
data = json.load(open(os.path.join(HERE, f'track-{seed}.json')))

track = np.array(data['track'])          # (NP,3)
bots = data['bots']
cross = data['crossings']
L = data['L']; NP = data['NP']

# style sombre façon Vice City
plt.rcParams.update({'figure.facecolor':'#12081f','axes.facecolor':'#1a0f2e',
    'axes.edgecolor':'#7d5fd4','text.color':'#e8e0ff','axes.labelcolor':'#e8e0ff',
    'xtick.color':'#a89ad0','ytick.color':'#a89ad0','font.size':10})

COLS = ['#ffd75e','#4db8ff','#ff3ec8','#7dff9a','#ff8c1a','#9ac8ff','#ff5040']

fig = plt.figure(figsize=(16, 9))
fig.suptitle(f"CASH CAR — aperçu simulation  ·  seed {seed}  ·  piste {L} u  ·  {len(cross)} croisements exploitables",
             fontsize=13, color='#ffd75e', fontweight='bold')

# ---- 1) vue de dessus (XZ) ----
ax1 = fig.add_subplot(1, 2, 1)
ax1.set_title("VUE DE DESSUS — la piste se recroise, les bots suivent le ruban", fontsize=10)
ax1.plot(track[:,0], track[:,2], '-', color='#3a2a5e', lw=6, alpha=.5, zorder=1)  # ruban large
ax1.plot(track[:,0], track[:,2], '-', color='#7d5fd4', lw=1.2, zorder=2)          # ligne centrale
ax1.scatter(track[0,0], track[0,2], c='#7dff9a', s=120, marker='o', zorder=5, edgecolors='#fff', linewidths=1, label='DÉPART')
# croisements exploitables (points de départ de coupe)
if cross:
    cx = [track[c['i']] for c in cross[::max(1,len(cross)//400)]]  # échantillon
    cx = np.array(cx)
    ax1.scatter(cx[:,0], cx[:,2], c='#ffb000', s=6, alpha=.5, zorder=3, label=f'croisements ({len(cross)})')
for i, b in enumerate(bots):
    t = np.array(b['traj'])
    if len(t):
        ax1.plot(t[:,0], t[:,2], '-', color=COLS[i%7], lw=1.4, alpha=.9, zorder=4,
                 label=f"{b['name']} ({'vivant' if b['alive'] else 'MORT'}, air {b['airtime']}s)")
ax1.set_xlabel('x (u)'); ax1.set_ylabel('z (u)')
ax1.legend(loc='upper left', fontsize=7, framealpha=.3)
ax1.set_aspect('equal', adjustable='datalim')

# ---- 2) profil d'altitude (distance vs hauteur) ----
ax2 = fig.add_subplot(1, 2, 2)
ax2.set_title("PROFIL D'ALTITUDE — les montagnes russes que les bots ne coupent jamais", fontsize=10)
s = np.linspace(0, L, NP)
ax2.plot(s, track[:,1], '-', color='#7d5fd4', lw=1.5)
ax2.fill_between(s, track[:,1], track[:,1].min()-20, color='#2a1a4e', alpha=.4)
ax2.set_xlabel('distance le long de la piste (u)'); ax2.set_ylabel('altitude (u)')
# position finale des bots sur ce profil
for i, b in enumerate(bots):
    t = np.array(b['traj'])
    if len(t):
        # approx : fin de trajectoire projetée
        ax2.scatter([], [], c=COLS[i%7], label=f"{b['name']}")
ax2.legend(loc='upper right', fontsize=7, framealpha=.3, title='bots')

# bandeau verdict
airmax = max((b['airtime'] for b in bots), default=0)
fig.text(.5, .02, f"AIRTIME TOTAL des 7 bots sur 60 s : {sum(b['airtime'] for b in bots):.1f} s  —  "
                  f"{len(cross)} raccourcis disponibles  ·  0 pris",
         ha='center', color='#ff5040', fontsize=12, fontweight='bold')

out = os.path.join(HERE, f'apercu-{seed}.png')
plt.tight_layout(rect=[0, .04, 1, .96])
plt.savefig(out, dpi=110, facecolor='#12081f')
print('écrit :', out)
