# Photographie la fenetre de TEST de Roblox Studio SANS la mettre devant (PrintWindow) : Sacha peut continuer a se servir de son PC.
#   powershell -File studio-photo.ps1 <sortie.png> [x0 y0 x1 y1 [largeur]]     (le cadre, en fractions de la fenetre : 0-1 ; sinon la fenetre entiere ; ramenee a `largeur` pixels)
param([string]$Sortie = "$env:TEMP\cashcar-banc\photo.png", [double]$x0 = 0, [double]$y0 = 0, [double]$x1 = 1, [double]$y1 = 1, [int]$Largeur = 1280)
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class PhotoCC {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr dc, uint f);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int n);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
}
"@
[PhotoCC]::SetProcessDPIAware() | Out-Null
$p = Get-Process RobloxStudioBeta -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*CashCarTest*" } | Select-Object -First 1
if (-not $p) { "absent"; exit 1 }
$h = $p.MainWindowHandle
if ([PhotoCC]::IsIconic($h)) { [PhotoCC]::ShowWindow($h, 4) | Out-Null; Start-Sleep -Milliseconds 400 } # (reduite : on la rouvre SANS lui donner la main)
$r = New-Object PhotoCC+RECT
[PhotoCC]::GetWindowRect($h, [ref]$r) | Out-Null
$w = $r.R - $r.L; $hh = $r.B - $r.T
$bmp = New-Object System.Drawing.Bitmap $w, $hh
$g = [System.Drawing.Graphics]::FromImage($bmp)
$dc = $g.GetHdc()
$ok = [PhotoCC]::PrintWindow($h, $dc, 2) # 2 = PW_RENDERFULLCONTENT : le rendu 3D aussi, meme fenetre recouverte
$g.ReleaseHdc($dc); $g.Dispose()
$cx = [int]($x0 * $w); $cy = [int]($y0 * $hh); $cw = [int](($x1 - $x0) * $w); $ch = [int](($y1 - $y0) * $hh)
$lw = [Math]::Min($Largeur, $cw); $lh = [int]($ch * $lw / $cw)
$cadre = New-Object System.Drawing.Bitmap $lw, $lh
$g2 = [System.Drawing.Graphics]::FromImage($cadre)
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.DrawImage($bmp, (New-Object System.Drawing.Rectangle 0, 0, $lw, $lh), (New-Object System.Drawing.Rectangle $cx, $cy, $cw, $ch), [System.Drawing.GraphicsUnit]::Pixel)
$g2.Dispose()
$cadre.Save($Sortie, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose(); $cadre.Dispose()
"$ok $w x $hh -> $Sortie ($lw x $lh)"
