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
}
"@
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
    [RelanceCC]::SetWindowPos($p.MainWindowHandle, [IntPtr]1, 0, 0, 0, 0, 0x13) | Out-Null # HWND_BOTTOM, sans bouger ni activer
    if ($devant -ne [IntPtr]::Zero) { [RelanceCC]::SetForegroundWindow($devant) | Out-Null }
    break
  }
}
Start-Sleep $Attente
& "$ici\studio-touche.ps1"
