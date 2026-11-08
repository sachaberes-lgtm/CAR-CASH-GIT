/* Fabrique course-gl.cjs : course.cjs + une sonde qui note l'appel GL fautif (pile) à la 1re erreur de chaque sorte. */
const fs = require('fs'), path = require('path');
let s = fs.readFileSync(path.join(__dirname, 'course.cjs'), 'utf8');
const probe = `(function(){var seen={},n=0;window.__glErr=[];['WebGL2RenderingContext','WebGLRenderingContext'].forEach(function(C){var P=window[C]&&window[C].prototype;if(!P)return;
['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced','bufferSubData','bufferData','texImage2D','texSubImage2D'].forEach(function(f){var o=P[f];if(!o)return;P[f]=function(){var r=o.apply(this,arguments);var e=this.getError();if(e&&n<40){var st=(new Error()).stack.split('\\n').slice(2,6).join(' | ');var k=f+e+st;if(!seen[k]){seen[k]=1;n++;window.__glErr.push(f+' err='+e+' '+st.slice(0,600));}}return r;};});});})();`;
s = s.replace("await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage", "await c.send('Page.addScriptToEvaluateOnNewDocument', { source: " + JSON.stringify(probe) + " });\n    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage");
s = s.replace("console.log('\\n=== EXCEPTIONS", "try{console.log('GLERR', await c.ev('JSON.stringify(window.__glErr)'));}catch(e){}\n  console.log('\\n=== EXCEPTIONS");
fs.writeFileSync(path.join(__dirname, 'course-gl.cjs'), s);
