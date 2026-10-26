cd "/Users/sachaberes/cash-car/tableau-voitures/VERSION PRINCIPALE"
/Users/sachaberes/cash-car/verrou-banc.sh prendre "photos-volcan"
/Library/Developer/CommandLineTools/usr/bin/python3 repertoire-maps/banc/photos.py "$@" 2>&1 | tail -12
/Users/sachaberes/cash-car/verrou-banc.sh rendre
