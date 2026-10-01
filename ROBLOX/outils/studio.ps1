# Ouvre la copie de TEST dans Roblox Studio (voir banc.sh). Studio doit être fermé avant.
$exe = (Get-ChildItem "$env:LOCALAPPDATA\Roblox\Versions" -Recurse -Filter RobloxStudioBeta.exe -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
# (ne JAMAIS passer par « ouvrir l application » : cela lance un 2e Studio. Pour le remettre devant : (New-Object -ComObject wscript.shell).AppActivate(pid))
Start-Process $exe -ArgumentList '-task','EditFile','-localPlaceFile',"$env:TEMP\cashcar-banc\CashCarTest.rbxlx"
