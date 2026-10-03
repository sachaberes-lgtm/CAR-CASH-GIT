# Relance la copie de TEST dans Roblox Studio et demarre la partie (F5), SANS prendre la main a Sacha :
# ferme l ancienne fenetre de test (jamais le Studio de Sacha), rouvre le fichier, glisse la fenetre DERRIERE les autres, envoie F5.
#   powershell -File studio-relance.ps1 [secondes d attente avant F5, 45 par defaut]
param([int]$Attente = 45)
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class RelanceCC {
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int n);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr apres, int x, int y, int w, int hh, uint f);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern int GetSystemMetrics(int i);
}
"@
[RelanceCC]::SetProcessDPIAware() | Out-Null # (AVANT tout autre appel de fenêtre : sinon Windows traduit les tailles, ×1,5 sur cet écran)
$ici = Split-Path -Parent $MyInvocation.MyCommand.Path
$devant = [RelanceCC]::GetForegroundWindow()
Get-Process RobloxStudioBeta -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*CashCarTest*" } | ForEach-Object { Stop-Process -Id $_.Id -Force }
Start-Sleep 2
$exe = (Get-ChildItem "$env:LOCALAPPDATA\Roblox\Versions" -Recurse -Filter RobloxStudioBeta.exe -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
Start-Process $exe -ArgumentList '-task','EditFile','-localPlaceFile',"$env:TEMP\cashcar-banc\CashCarTest.rbxlx"
# des qu elle apparait : derriere toutes les autres, et la main rendue a la fenetre qui l avait
for ($i = 0; $i -lt 40; $i++) {
  Start-Sleep -Milliseconds 500
  $p = Get-Process RobloxStudioBeta -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*CashCarTest*" } | Select-Object -First 1
  if ($p) {
    # derrière toutes les autres, sans la bouger ni l'activer (redimensionner ici déréglait la mise en page de Studio : la vue 3D
    # débordait de la fenêtre — vue.py retrouve le cadre de la vue tout seul, quelle que soit la taille)
    [RelanceCC]::SetWindowPos($p.MainWindowHandle, [IntPtr]1, 0, 0, 0, 0, 0x13) | Out-Null
    if ($devant -ne [IntPtr]::Zero) { [RelanceCC]::SetForegroundWindow($devant) | Out-Null }
    break
  }
}
Start-Sleep $Attente
# une fois Studio chargé (pas avant : sa mise en page se dérègle), une taille connue — la vue 3D a alors les proportions d'un
# téléphone couché (~2,2), comme les captures du jeu web
$p = Get-Process RobloxStudioBeta -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*CashCarTest*" } | Select-Object -First 1
if ($p) { [RelanceCC]::SetWindowPos($p.MainWindowHandle, [IntPtr]1, 0, 0, 2900, 1640, 0x10) | Out-Null; Start-Sleep -Milliseconds 800 }
& "$ici\studio-actif.ps1" | Out-Null # (le changement de taille lui retire « la main » : sans elle, 15 images par seconde)
& "$ici\studio-touche.ps1"
