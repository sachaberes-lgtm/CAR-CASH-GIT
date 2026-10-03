#!/bin/sh
# Compile TOUT le Luau du portage comme Roblox Studio le fait (-O1 -g2). Sans -g2, le compilateur laisse passer un script
# qui depasse 200 variables locales, et Studio le refuse au lancement (« Out of local registers »).
#   sh ROBLOX/outils/verifier.sh [chemin de luau-compile]      (par defaut : $LUAU_COMPILE, sinon luau-compile dans le PATH)
cd "$(dirname "$0")/.."
C="${1:-${LUAU_COMPILE:-luau-compile}}"
ko=0; n=0
for f in $(find src -name "*.luau"); do
  n=$((n+1))
  e=$("$C" --binary -O1 -g2 "$f" 2>&1 >/dev/null | head -2)
  if [ -n "$e" ]; then echo "ECHEC $f"; echo "  $e"; ko=$((ko+1)); fi
done
echo "$n scripts compiles, $ko en echec"
# Les NOMS INCONNUS (2/10) : luau-compile laisse passer un nom jamais declare (il devient une globale « nil », et le jeu plante
# seulement quand la ligne s execute). Si luau-analyze est a cote du compilateur, on liste toute globale qui n est pas de Roblox.
A="$(dirname "$C")/luau-analyze"; [ -x "$A.exe" ] && A="$A.exe"
if [ -x "$A" ]; then
  CONNUS="Vector3|Vector2|Color3|Enum|CFrame|Instance|UDim2|UDim|workspace|task|script|game|warn|Content|Random|Font|TweenInfo|NumberSequenceKeypoint|NumberSequence|ColorSequenceKeypoint|ColorSequence|NumberRange|Rect|Ray|BrickColor|Region3|tick|time|wait|spawn|delay|typeof|buffer|bit32|utf8|os|debug|shared|settings|UserSettings|PhysicalProperties|RaycastParams|OverlapParams|DateTime|Faces|Axes|PathWaypoint|TweenService|SharedTable|elapsedTime|version|plugin|Vector3int16|Vector2int16|Region3int16|CatalogSearchParams|FloatCurveKey|RotationCurveKey|DockWidgetPluginGuiInfo|Secret|loadstring|require|printidentity|stats"
  inc=$(for f in $(find src -name "*.luau"); do "$A" "$f" 2>&1 | grep "Unknown global" | sed "s|^|$f |"; done | grep -Ev "Unknown global '($CONNUS)'" | head -20)
  if [ -n "$inc" ]; then echo "NOMS INCONNUS :"; echo "$inc"; ko=$((ko+1)); else echo "aucun nom inconnu"; fi
fi
[ "$ko" -eq 0 ]
