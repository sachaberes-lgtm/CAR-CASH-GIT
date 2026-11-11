#!/bin/bash
cd "$(dirname "$0")"
for f in ${@:-*.jsonl}; do node -e '
const l=require("fs").readFileSync(process.argv[1],"utf8").split("\n").filter(Boolean).map(JSON.parse);
for(const r of l){if(r.diag){console.log("DIAG",JSON.stringify(r.diag).slice(0,300));continue}if(r.finFenetre){console.log("  fin fenetre",JSON.stringify(r.finFenetre).slice(0,260));continue}console.log([r.tag,r.map,"c"+r.course,r.portail?"P":"-",r.demarre?"ok":"NODEM",r.mort?("MORT:"+JSON.stringify(r.cause||r.mortInfo||"")):"vivant","s="+r.sMax,"v="+r.vMax,"nan="+(r.nan||[]).length,r.fige?"FIGE":"", "fps="+r.fps, r.exc?("EXC:"+JSON.stringify(r.exc)):""].join(" "))}' $f; done
