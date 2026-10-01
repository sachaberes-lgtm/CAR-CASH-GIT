# Remet la fenetre de TEST de Roblox Studio au premier plan, en grand (elle perd la main des que Sacha clique ailleurs).
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class FenCC {
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int n);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern void keybd_event(byte k, byte s, uint f, UIntPtr e);
}
"@
$p = Get-Process RobloxStudioBeta -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*CashCarTest*" } | Select-Object -First 1
if ($p) {
  # (Windows refuse de donner la main a une fenetre si rien ne s est passe au clavier : un appui sur ALT la debloque ; on la reduit puis on la rouvre en grand)
  [FenCC]::keybd_event(0x12, 0, 0, [UIntPtr]::Zero); [FenCC]::keybd_event(0x12, 0, 2, [UIntPtr]::Zero)
  [FenCC]::ShowWindow($p.MainWindowHandle, 6) | Out-Null
  Start-Sleep -Milliseconds 300
  [FenCC]::ShowWindow($p.MainWindowHandle, 3) | Out-Null
  [FenCC]::SetForegroundWindow($p.MainWindowHandle) | Out-Null
  (New-Object -ComObject wscript.shell).AppActivate($p.Id) | Out-Null
  "devant"
} else { "absent" }
