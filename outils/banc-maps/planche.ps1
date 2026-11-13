param([string]$sortie,[string]$titreG,[string]$titreD,[string]$listeG,[string]$listeD,[string]$legendes)
# Planche : deux colonnes de photos (640x400), un titre par colonne ; les chemins lus dans deux fichiers texte (un par ligne) ; légendes : une par rangée, séparées par |
Add-Type -AssemblyName System.Drawing
$gauche=@(Get-Content -LiteralPath $listeG -Encoding UTF8 | Where-Object { $_.Trim() -ne '' })
$droite=@(Get-Content -LiteralPath $listeD -Encoding UTF8 | Where-Object { $_.Trim() -ne '' })
$leg=@(); if($legendes){ $leg=$legendes.Split('|') }
$w=640;$h=400;$marge=8;$haut=44
$n=[Math]::Max($gauche.Count,$droite.Count)
$LW=2*$w+3*$marge;$LH=$haut+$n*($h+$marge)+$marge
$bmp=New-Object System.Drawing.Bitmap($LW,$LH)
$g=[System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.Clear([System.Drawing.Color]::FromArgb(14,16,24))
$police=New-Object System.Drawing.Font('Segoe UI',18,[System.Drawing.FontStyle]::Bold)
$petite=New-Object System.Drawing.Font('Segoe UI',15,[System.Drawing.FontStyle]::Bold)
$blanc=[System.Drawing.Brushes]::White
$fond=New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(170,0,0,0))
$g.DrawString($titreG,$police,$blanc,$marge,8)
$g.DrawString($titreD,$police,$blanc,2*$marge+$w,8)
for($i=0;$i -lt $n;$i++){
  $y=$haut+$i*($h+$marge)
  if($i -lt $gauche.Count -and (Test-Path -LiteralPath $gauche[$i])){$im=[System.Drawing.Image]::FromFile($gauche[$i]);$g.DrawImage($im,$marge,$y,$w,$h);$im.Dispose()}
  if($i -lt $droite.Count -and (Test-Path -LiteralPath $droite[$i])){$im=[System.Drawing.Image]::FromFile($droite[$i]);$g.DrawImage($im,2*$marge+$w,$y,$w,$h);$im.Dispose()}
  if($i -lt $leg.Count){ foreach($x in @($marge,(2*$marge+$w))){ $g.FillRectangle($fond,$x,$y+$h-34,$w,34); $g.DrawString($leg[$i],$petite,$blanc,$x+8,$y+$h-32) } }
}
$bmp.Save($sortie,[System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose();$bmp.Dispose()
"ok $sortie ($n rangées)"
