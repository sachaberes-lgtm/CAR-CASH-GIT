/* preuve : LE JUS SUR UNE TOILE DE LARGEUR NULLE (relecture du 24/10, B3 — code/interface/jus-echelle.js).
   Pendant une transition iOS, `innerWidth` peut valoir 0 : le redimensionnement pose `juiceCv.width=0`. Un fruit croqué à cet instant
   tirait une goutte de rayon 0 → sa petite toile faisait 0 × 4 px, et `drawImage` d'une toile de largeur nulle LÈVE (InvalidStateError,
   spec HTML « drawImage » : image de dimension nulle). juiceScreenTick est appelé dans loop() HORS de tout try, AVANT le rendu
   (boucle-6-hud.js : juiceScreenTick puis, plus bas, composer.render) : pendant toute la vie de la goutte (1,3-2 s), chaque image plantait
   avant le rendu — écran figé, musique et ticks suivants sautés. On exécute le VRAI code extrait d'index.html avec une toile qui lève
   comme Chrome/WebKit sur une source de dimension nulle. */
const fs=require('fs'),vm=require('vm');
const src=fs.readFileSync(process.argv[2]||__dirname+'/../../VERSION PRINCIPALE/index.html','utf8');
const i=src.indexOf('const JUS_ZONE='),j=src.indexOf('const SON_FRUIT_ST=',i);if(i<0||j<0){console.log('repère introuvable\nSANS OBJET');process.exit(0);}
const code=src.slice(i,j);
let lev=0;
function toile(){const cv={width:64,height:64,style:{}};cv.getContext=function(){return cv._x||(cv._x={clearRect(){},fillRect(){},putImageData(){},imageSmoothingEnabled:true,globalAlpha:1,fillStyle:'',
  createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),
  drawImage(s){if(!s.width||!s.height){lev++;const e=new Error("Failed to execute 'drawImage': the image argument is a canvas element with a width or height of 0.");e.name='InvalidStateError';throw e;}}});};return cv;}
function Couleur(){this.r=.8;this.g=.2;this.b=.3;}
Couleur.prototype={getHSL(o){o.h=.95;o.s=.6;o.l=.5;return o;},setHSL(){return this;},clone(){const c=new Couleur();c.r=this.r;c.g=this.g;c.b=this.b;return c;},lerp(){return this;}};
const monte=function(w){const cv=toile();cv.width=w;cv.height=844;const c={THREE:{Color:Couleur},REDUCED_MOTION:false,document:{createElement:()=>toile()},juiceCv:cv,juiceCx:cv.getContext('2d'),Math};
  vm.runInNewContext(code+';this.juiceScreen=juiceScreen;this.juiceScreenTick=juiceScreenTick;',c);return c;};
const ctx=monte(0),juiceCv0=ctx.juiceCv; /* la transition : innerWidth 0 */
let exc=0,images=0,derniere=-1;
try{ctx.juiceScreen(0xe0157a,.8,5);}catch(e){exc++;} /* une rafale : 1 + min(4, r) gouttes */
juiceCv0.width=390; /* l'écran revient (resize) à l'image suivante */
for(let k=0;k<1200;k++){images++;try{ctx.juiceScreenTick(1/60);}catch(e){exc++;derniere=k;}}
console.log('rafale croquée pendant une transition (toile 0 × 844), puis 20 s d\'images : '+exc+' image(s) qui lèvent avant le rendu, la dernière à '+((derniere+1)/60).toFixed(1)+' s (chaque goutte vide bloque les suivantes de la file)');
/* et en jeu normal, rien ne change : une goutte sur une toile normale est bien dessinée */
const exc1=exc;exc=0;let dessins=0;const ctxN=monte(390),cx=ctxN.juiceCx,dI=cx.drawImage;cx.drawImage=function(s){dessins++;return dI.apply(this,arguments);};
try{ctxN.juiceScreen(0xe0157a,.8,2);for(let k=0;k<30;k++)ctxN.juiceScreenTick(1/60);}catch(e){exc++;}
console.log('jeu normal (toile 390 × 844) : '+dessins+' dessin(s) de gouttes, '+exc+' exception(s)');
const ok=images===1200&&exc1===0&&exc===0&&dessins>0;
console.log(ok?'PREUVE OK':'PREUVE KO');process.exit(ok?0:1);
