param([string]$sortie,[string]$liste,[int]$col=4,[int]$w=480)
# (2026-11-15) Planche en grille : les photos d'un fichier liste (un chemin par ligne), $col colonnes, chaque photo réduite à $w de large, son nom en étiquette.
# powershell -File outils/banc-nuages/grille.ps1 -sortie planche.jpg -liste liste.txt -col 4 -w 480
Add-Type -AssemblyName System.Drawing
$f=@(Get-Content -LiteralPath $liste -Encoding UTF8 | Where-Object { $_.Trim() -ne '' })
$i0=[System.Drawing.Image]::FromFile($f[0]);$h=[int]($w*$i0.Height/$i0.Width);$i0.Dispose()
$m=4;$rang=[Math]::Ceiling($f.Count/$col)
$bmp=New-Object System.Drawing.Bitmap(($col*($w+$m)+$m),($rang*($h+$m)+$m))
$g=[System.Drawing.Graphics]::FromImage($bmp);$g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.Clear([System.Drawing.Color]::FromArgb(14,16,24))
$police=New-Object System.Drawing.Font('Segoe UI',11,[System.Drawing.FontStyle]::Bold)
$fond=New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(170,0,0,0))
for($k=0;$k -lt $f.Count;$k++){
  $x=$m+($k%$col)*($w+$m);$y=$m+[Math]::Floor($k/$col)*($h+$m)
  $im=[System.Drawing.Image]::FromFile($f[$k]);$g.DrawImage($im,$x,$y,$w,$h);$im.Dispose()
  $t=[System.IO.Path]::GetFileNameWithoutExtension($f[$k]);$sz=$g.MeasureString($t,$police)
  $g.FillRectangle($fond,$x,$y,$sz.Width+6,$sz.Height+2);$g.DrawString($t,$police,[System.Drawing.Brushes]::White,$x+3,$y+1)}
$enc=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()|Where-Object{$_.MimeType -eq 'image/jpeg'}
$p=New-Object System.Drawing.Imaging.EncoderParameters(1);$p.Param[0]=New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality,[long]85)
$bmp.Save($sortie,$enc,$p);$g.Dispose();$bmp.Dispose();Write-Output $sortie
