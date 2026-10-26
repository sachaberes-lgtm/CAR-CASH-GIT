const fs=require('fs'),vm=require('vm');const h=fs.readFileSync(process.argv[2],'utf8');
const re=/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;let m,n=0,big=0;while((m=re.exec(h))){try{new vm.Script(m[1]);n++;}catch(e){if(m[1].length>1e5)console.log('ERR GROS',e.message);else big++;}}console.log('scripts ok',n,'(petits non compilables ignorés :',big+')')
