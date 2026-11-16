param([string]$ref,[string]$dossier,[string]$motif='*-diag-*.jpg',[double]$haut=0.0,[double]$bas=1.0)
# (2026-11-15) L'écart de chaque photo d'un dossier à une photo de référence (réduites à 160 × 100, bande verticale [haut, bas]) : quel groupe retiré change l'image, et où.
Add-Type -AssemblyName System.Drawing
function Petite($f){$i=[System.Drawing.Image]::FromFile($f);$b=New-Object System.Drawing.Bitmap(160,100);$g=[System.Drawing.Graphics]::FromImage($b);$g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBilinear;$g.DrawImage($i,0,0,160,100);$g.Dispose();$i.Dispose();return $b}
$R=Petite $ref;$y0=[int](100*$haut);$y1=[int](100*$bas)
Get-ChildItem -Path $dossier -Filter $motif | Sort-Object Name | ForEach-Object {
  $B=Petite $_.FullName;$s=0;$n=0
  for($y=$y0;$y -lt $y1;$y++){for($x=0;$x -lt 160;$x++){$a=$R.GetPixel($x,$y);$c=$B.GetPixel($x,$y);$d=[Math]::Abs($a.R-$c.R)+[Math]::Abs($a.G-$c.G)+[Math]::Abs($a.B-$c.B);$s+=$d;if($d -gt 30){$n++}}}
  $B.Dispose();'{0} {1} {2}' -f [int64]$s,$n,$_.Name}
