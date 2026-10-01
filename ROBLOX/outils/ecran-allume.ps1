# Garde l'ECRAN allumé pendant un banc (Roblox Studio ne rend plus une seule image quand l'écran s'est éteint : la partie de
# test se fige). Rien n'est réglé dans Windows : la demande tombe dès que ce script s'arrête.
#   powershell -File ecran-allume.ps1 [minutes, 20 par défaut]
param([int]$Minutes = 20)
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class EcranCC { [DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint f); }
"@
$fin = (Get-Date).AddMinutes($Minutes)
while ((Get-Date) -lt $fin) {
  [EcranCC]::SetThreadExecutionState([uint32]"0x80000003") | Out-Null # ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_DISPLAY_REQUIRED
  Start-Sleep 20
}
[EcranCC]::SetThreadExecutionState([uint32]"0x80000000") | Out-Null
