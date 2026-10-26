import os
VP="/Users/sachaberes/cash-car/neige-decor/VERSION PRINCIPALE";B="/Users/sachaberes/cash-car/neige-decor/.banc-neige"
for f in os.listdir(VP):
    if f!='index.html' and not os.path.lexists(os.path.join(B,'copie',f)): os.symlink(os.path.join(VP,f),os.path.join(B,'copie',f))
if not os.path.lexists(os.path.join(B,'copie','photos-banc')): os.symlink(os.path.join(B,'photos'),os.path.join(B,'copie','photos-banc'))
s=open(os.path.join(VP,'index.html'),encoding='utf-8').read()
a="window.__gameReady=true; // la boucle part"
assert s.count(a)==1
open(os.path.join(B,'copie','index.html'),'w',encoding='utf-8').write(s.replace(a,"window.__ev=function(__c9){return eval(__c9);};"+a))
print('copie ok')
