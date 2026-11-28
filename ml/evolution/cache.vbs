' ===== CACHE.VBS : LANCE UN .CMD SANS FENETRE NOIRE (28/11/2026, les lanceurs : "pas de fenetre noire toutes les heures") =====
' Les taches planifiees de installer-tache.cmd lancent :  wscript.exe //B //Nologo cache.vbs "<chemin>\lancer.cmd" auto
' Il lance cmd.exe /d /s /c ""<chemin>\lancer.cmd" auto" dans une fenetre cachee, attend sa fin et rend son code de sortie
' (le Planificateur le montre en "Dernier resultat"). Aucun droit d'administrateur, rien d'ecrit, rien d'envoye.
' Un argument vide ou qui porte un espace est remis entre guillemets. Le chemin peut porter des espaces et des parentheses.
Option Explicit
Dim sh, i, a, q, reste, ligne
q = Chr(34)
If WScript.Arguments.Count < 1 Then WScript.Quit 1
reste = ""
For i = 1 To WScript.Arguments.Count - 1
  a = WScript.Arguments(i)
  If a = "" Or InStr(a, " ") > 0 Then a = q & a & q
  reste = reste & " " & a
Next
Set sh = CreateObject("WScript.Shell")
ligne = q & sh.ExpandEnvironmentStrings("%ComSpec%") & q & " /d /s /c " & q & q & WScript.Arguments(0) & q & reste & q
WScript.Quit sh.Run(ligne, 0, True)
