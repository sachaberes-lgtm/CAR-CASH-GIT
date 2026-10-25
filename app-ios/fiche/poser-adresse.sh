#!/bin/sh
# CASH CAR — écrit l'adresse e-mail d'assistance dans les deux pages (à la place de support@example.com, ou de l'adresse d'avant).
#   sh poser-adresse.sh assistance@mon-domaine.fr
set -e
cd "$(dirname "$0")"
case "$1" in *@*.*) ;; *) echo "usage : sh poser-adresse.sh adresse@domaine" >&2; exit 1;; esac
for f in confidentialite.html assistance.html; do
  sed -E -i '' "s/(mailto:)[^\"]+\"/\1$1\"/g; s/(<a[^>]*href=\"mailto:[^\"]+\"[^>]*>)[^<]+(<\/a>)/\1$1\2/g" "$f"
  echo "$f : $(grep -c "mailto:$1" "$f") lien(s) vers $1"
done
