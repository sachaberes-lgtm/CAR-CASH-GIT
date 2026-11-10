#!/bin/bash
cd "$(dirname "$0")"
P=/private/tmp/cc-gab-prof
./lot.sh --tag se-p0 --w 375 --h 667 --dpr 2 --palier 0 --maps banquise,canyon,crypto,dunes,foret,grotte,jade,ville,vitree,espace,volcan,nuages --tmax 30 --reel 1 --portail 1 --prof $P > se-p0.out 2>&1
./lot.sh --tag promax-p2 --w 430 --h 932 --dpr 3 --palier 2 --maps banquise,canyon,crypto,dunes,foret,grotte,jade,ville,vitree,espace,volcan,nuages --tmax 30 --reel 1 --portail 1 --prof $P > promax-p2.out 2>&1
./lot.sh --tag paysage-p2 --w 844 --h 390 --dpr 3 --palier 2 --maps banquise,canyon,crypto,jade,ville,espace --tmax 30 --reel 1 --prof $P > paysage-p2.out 2>&1
./lot.sh --tag 13pro-p1 --w 390 --h 844 --dpr 3 --palier 1 --maps banquise,canyon,crypto,jade,ville,espace --tmax 30 --reel 1 --prof $P > 13pro-p1.out 2>&1
echo FINI > chaine.fini
