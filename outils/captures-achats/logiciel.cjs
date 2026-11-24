/* Chrome sans fenêtre en rendu WebGL logiciel (SwiftShader) quand le GPU refuse le contexte. */
const cp=require('child_process'),o=cp.spawn;
cp.spawn=function(cmd,args,opt){if(Array.isArray(args))args=args.map(a=>a==='--use-angle=d3d11'?'--use-angle=swiftshader':a).concat(['--enable-unsafe-swiftshader']);return o.call(this,cmd,args,opt);};
