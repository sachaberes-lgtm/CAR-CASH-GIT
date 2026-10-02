# Fait CROIRE a la fenetre de TEST de Roblox Studio qu elle a la main (sans la mettre devant) : hors de la main, Studio bride la
# partie de test a 15 images par seconde — le pilote automatique sort de la route, les photos sont fausses.
Add-Type @"
using System; using System.Runtime.InteropServices;
public class Actif6 { [DllImport("user32.dll")] public static extern IntPtr SendMessage(IntPtr h, uint m, IntPtr w, IntPtr l); }
"@
$p = Get-Process RobloxStudioBeta | Where-Object { $_.MainWindowTitle -like "*CashCarTest*" } | Select-Object -First 1
[Actif6]::SendMessage($p.MainWindowHandle, 0x001C, [IntPtr]1, [IntPtr]0) | Out-Null  # WM_ACTIVATEAPP
[Actif6]::SendMessage($p.MainWindowHandle, 0x0006, [IntPtr]1, [IntPtr]0) | Out-Null  # WM_ACTIVATE
[Actif6]::SendMessage($p.MainWindowHandle, 0x0007, [IntPtr]0, [IntPtr]0) | Out-Null  # WM_SETFOCUS
"ok"
