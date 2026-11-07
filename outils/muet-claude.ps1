# Coupe le son de l'application Claude (toutes ses sessions audio Windows).
# Usage : powershell -ExecutionPolicy Bypass -File muet-claude.ps1          (une fois)
#         powershell -ExecutionPolicy Bypass -File muet-claude.ps1 -Boucle  (reste là, remet muet toutes les 2 s)
param([switch]$Boucle)

Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Runtime.InteropServices;

[ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")] class MMDeviceEnumeratorCom {}
[ComImport, Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IMMDeviceEnumerator {
  int EnumAudioEndpoints(int dataFlow, int stateMask, out IMMDeviceCollection devices);
}
[Guid("0BD7A1BE-7A1A-44DB-8397-CC5392387B5E"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IMMDeviceCollection { int GetCount(out int n); int Item(int i, out IMMDevice d); }
[Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IMMDevice { int Activate(ref Guid iid, int ctx, IntPtr p, [MarshalAs(UnmanagedType.IUnknown)] out object o); }
[Guid("77AA99A0-1BD6-484F-8BC7-2C654C9A9B6F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IAudioSessionManager2 {
  int a(); int b();
  int GetSessionEnumerator(out IAudioSessionEnumerator e);
}
[Guid("E2F5BB11-0570-40CA-ACDD-3AA01277DEE8"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IAudioSessionEnumerator { int GetCount(out int n); int GetSession(int i, out IAudioSessionControl2 s); }
[Guid("bfb7ff88-7239-4fc9-8fa2-07c950be9c6d"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IAudioSessionControl2 {
  int a(); int b(); int c(); int d(); int e(); int f(); int g(); int h(); int i();
  int GetSessionIdentifier([MarshalAs(UnmanagedType.LPWStr)] out string s);
  int GetSessionInstanceIdentifier([MarshalAs(UnmanagedType.LPWStr)] out string s);
  int GetProcessId(out uint pid);
}
[Guid("87CE5498-68D6-44E5-9215-6DA47EF883D8"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface ISimpleAudioVolume {
  int SetMasterVolume(float v, ref Guid ctx);
  int GetMasterVolume(out float v);
  int SetMute([MarshalAs(UnmanagedType.Bool)] bool m, ref Guid ctx);
  int GetMute([MarshalAs(UnmanagedType.Bool)] out bool m);
}

public static class MuetClaude {
  public static int Couper() {
    int coupes = 0;
    var en = (IMMDeviceEnumerator)new MMDeviceEnumeratorCom();
    IMMDeviceCollection devs; en.EnumAudioEndpoints(0, 1, out devs);
    int nd; devs.GetCount(out nd);
    Guid iid = typeof(IAudioSessionManager2).GUID, nul = Guid.Empty;
    for (int d = 0; d < nd; d++) {
      IMMDevice dev; devs.Item(d, out dev);
      object o; dev.Activate(ref iid, 23, IntPtr.Zero, out o);
      var mgr = (IAudioSessionManager2)o;
      IAudioSessionEnumerator se; mgr.GetSessionEnumerator(out se);
      int ns; se.GetCount(out ns);
      for (int i = 0; i < ns; i++) {
        IAudioSessionControl2 c; se.GetSession(i, out c);
        uint pid; c.GetProcessId(out pid);
        if (pid == 0) continue;
        string nom = "", chemin = "";
        try { var p = Process.GetProcessById((int)pid); nom = p.ProcessName.ToLower(); chemin = p.MainModule.FileName.ToLower(); } catch {}
        if (nom == "claude" || chemin.Contains("\\claude_") || chemin.Contains("\\claude-data\\")) {
          var v = (ISimpleAudioVolume)c;
          bool m; v.GetMute(out m);
          if (!m) { v.SetMute(true, ref nul); coupes++; }
        }
      }
    }
    return coupes;
  }
}
'@

do {
  $n = [MuetClaude]::Couper()
  if ($n -gt 0) { Write-Host "Claude mis en sourdine ($n session(s))" }
  elseif (-not $Boucle) { Write-Host "Rien a couper (deja muet ou aucune session audio)" }
  if ($Boucle) { Start-Sleep -Seconds 2 }
} while ($Boucle)
