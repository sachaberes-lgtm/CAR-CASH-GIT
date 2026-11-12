import io,sys
p='code/maps/grottes-1.js'
s=io.open(p,encoding='utf-8',newline='').read()
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n: print('ECHEC',c,'fois :',a[:90]); sys.exit(1)
    s=s.replace(a,b)
rep("tenueMax:[10,11],","tenueMax:[10,16],")
rep("plafond:{roulis:2.4,mini:3.2,pente:.05,penteLave:-.01,","plafond:{roulis:2.4,mini:3.2,pente:0,penteLave:-.01,")
rep("spirale:{tours:[1.2,.1],k:[1.75,.3],pente:.15},","spirale:{tours:[1.2,.1],k:[1.75,.3],pente:.18},")
rep("noeud:{k:[1.6,.25],pente:.13},","noeud:{k:[1.6,.25],pente:.16},")
rep("lacets:{pente:.13},","lacets:{pente:.16},\n  pente:{mine:.05,luxe:.085,boyau:.12,stal:.13,lave:.03,abysse:.13}, /* la pente de chaque salle au sol (la grotte du 11/11 : 7,5 à 11 %) — la lave reste au ras de son lac */")
rep("const PENTE=GRT_DESC?{mine:.05,luxe:.075,boyau:.095,stal:.11,lave:.03,abysse:.10}:","const PENTE=GRT_VERTIGE&&GRT_HASARD&&GRT_DESC?GRT_VG.pente:GRT_DESC?{mine:.05,luxe:.075,boyau:.095,stal:.11,lave:.03,abysse:.10}:")
# les passages : ceux des frontières 1-4 d'abord, la sortie de la mine ensuite (le saut et le gouffre ne sont plus favorisés)
rep("const ou=[0].concat(fr.slice(0,nPass-1));for(const j of ou){","const ou=fr.slice(0,nPass-1).concat([0]);for(const j of ou){")
io.open(p,'w',encoding='utf-8',newline='').write(s);print('ok')
