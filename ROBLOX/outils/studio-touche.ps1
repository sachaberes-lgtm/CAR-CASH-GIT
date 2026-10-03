# Envoie une touche a la fenetre de TEST de Roblox Studio SANS la mettre devant (F5 = lancer la partie de test).
#   powershell -File studio-touche.ps1 [code de touche, 116 = F5 par defaut]
param([int]$Touche = 116)
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class ToucheCC {
  [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h, uint m, IntPtr w, IntPtr l);
  [DllImport("user32.dll")] public static extern IntPtr SendMessage(IntPtr h, uint m, IntPtr w, IntPtr l);
}
"@
$p = Get-Process RobloxStudioBeta -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*CashCarTest*" } | Select-Object -First 1
if (-not $p) { "absent"; exit 1 }
# (une fenetre qui n a jamais eu la main ignore les touches : on lui fait CROIRE qu elle l a — WM_ACTIVATE puis WM_SETFOCUS — sans la mettre devant)
[ToucheCC]::SendMessage($p.MainWindowHandle, 0x0006, [IntPtr]1, [IntPtr]0) | Out-Null
[ToucheCC]::SendMessage($p.MainWindowHandle, 0x0007, [IntPtr]0, [IntPtr]0) | Out-Null
Start-Sleep -Milliseconds 300
[ToucheCC]::PostMessage($p.MainWindowHandle, 0x100, [IntPtr]$Touche, [IntPtr]0) | Out-Null
Start-Sleep -Milliseconds 60
[ToucheCC]::PostMessage($p.MainWindowHandle, 0x101, [IntPtr]$Touche, [IntPtr]0) | Out-Null
"envoyee"
