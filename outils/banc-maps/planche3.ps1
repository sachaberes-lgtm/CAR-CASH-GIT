param([string]$sortie,[string]$titres,[string]$listes,[string]$legendes)
# Planche à N colonnes (photos 560x350) : $titres « A|B|C », $listes « fichierA.txt|fichierB.txt|fichierC.txt » (un chemin par ligne, une rangée par ligne),
# $legendes : une par rangée, séparées par | — (2026-11-14, l'orbite v6 : Terre, Saturne, Mars côte à côte). Attention : en PowerShell $W et $w sont la même variable.
Add-Type -AssemblyName System.Drawing
$tit=$titres.Split('|');$fic=$listes.Split('|');$cols=@()
foreach($f in $fic){ $cols+=,@(Get-Content -LiteralPath $f -Encoding UTF8 | Where-Object { $_.Trim() -ne '' }) }
$leg=@(); if($legendes){ $leg=$legendes.Split('|') }
$pw=560;$ph=350;$marge=8;$haut=44;$nc=$cols.Count;$nr=0
foreach($c in $cols){ if($c.Count -gt $nr){ $nr=$c.Count } }
$LW=$nc*$pw+($nc+1)*$marge;$LH=$haut+$nr*($ph+$marge)+$marge
$bmp=New-Object System.Drawing.Bitmap($LW,$LH)
$g=[System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.Clear([System.Drawing.Color]::FromArgb(14,16,24))
$police=New-Object System.Drawing.Font('Segoe UI',18,[System.Drawing.FontStyle]::Bold)
$petite=New-Object System.Drawing.Font('Segoe UI',14,[System.Drawing.FontStyle]::Bold)
$blanc=[System.Drawing.Brushes]::White
$fond=New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(170,0,0,0))
for($c=0;$c -lt $nc;$c++){ $x=$marge+$c*($pw+$marge); $g.DrawString($tit[$c],$police,$blanc,$x,8)
  for($r=0;$r -lt $cols[$c].Count;$r++){ $y=$haut+$r*($ph+$marge); $f=$cols[$c][$r]
    if(Test-Path -LiteralPath $f){ $im=[System.Drawing.Image]::FromFile($f); $g.DrawImage($im,$x,$y,$pw,$ph); $im.Dispose() }
    if($r -lt $leg.Count){ $g.FillRectangle($fond,$x,$y+$ph-30,$pw,30); $g.DrawString($leg[$r],$petite,$blanc,$x+8,$y+$ph-28) } } }
$bmp.Save($sortie,[System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose();$bmp.Dispose()
"ok $sortie ($nr rangées, $nc colonnes)"
