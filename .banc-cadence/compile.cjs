const fs=require('fs'),vm=require('vm');const h=fs.readFileSync(process.argv[2],'utf8');
let bad=0,n=0;const re=/<script(\s[^>]*)?>/g;let m;
while((m=re.exec(h))){ if(/\bsrc=/.test(m[1]||''))continue; const s=m.index+m[0].length,e=h.indexOf('</script>',s); const c=h.slice(s,e); if(c.length<50)continue; try{new vm.Script(c);n++;}catch(x){bad++;if(bad<3)console.log('ÉCHEC bloc @',s,x.message,'|',c.slice(0,60).replace(/\n/g,' '));} re.lastIndex=e;}
console.log('blocs compilés',n,'échecs',bad);
