import socket,json,base64,os,struct,urllib.request,time
# Client CDP minimal (Python pur) — avec collecte d'événements (console, exceptions, réseau, pauses du débogueur)
class CDP:
    def __init__(s,port,match=None):
        s.port=port
        L=json.loads(urllib.request.urlopen('http://127.0.0.1:%d/json'%port).read())
        t=[x for x in L if x.get('type')=='page' and (match is None or match in x.get('url',''))]
        if not t:
            t=[json.loads(urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:%d/json/new?about:blank'%port,method='PUT')).read())]
        s.tid=t[0]['id'];u=t[0]['webSocketDebuggerUrl'];h=u.split('/')[2];path='/'+u.split('/',3)[3]
        host,p=h.split(':');s.sk=socket.create_connection((host,int(p)))
        key=base64.b64encode(os.urandom(16)).decode()
        s.sk.send(('GET %s HTTP/1.1\r\nHost: %s\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: %s\r\nSec-WebSocket-Version: 13\r\n\r\n'%(path,h,key)).encode())
        b=b''
        while b'\r\n\r\n' not in b: b+=s.sk.recv(1)
        s.n=0;s.buf=b'';s.events=[];s.pauses=[];s.autoresume=True;s.keep=set()
    def _send(s,o):
        d=json.dumps(o).encode();m=os.urandom(4);l=len(d)
        hd=bytes([0x81])+(bytes([0x80|l]) if l<126 else bytes([0x80|126])+struct.pack('>H',l) if l<65536 else bytes([0x80|127])+struct.pack('>Q',l))
        s.sk.sendall(hd+m+bytes(c^m[i%4] for i,c in enumerate(d)))
    def _rx(s,n):
        while len(s.buf)<n:
            c=s.sk.recv(1<<20)
            if not c: raise Exception('ws fermé')
            s.buf+=c
        r=s.buf[:n];s.buf=s.buf[n:];return r
    def _recv(s):
        msg=b''
        while True:
            h=s._rx(2);fin=h[0]&0x80;op=h[0]&0xf;l=h[1]&0x7f
            if l==126:l=struct.unpack('>H',s._rx(2))[0]
            elif l==127:l=struct.unpack('>Q',s._rx(8))[0]
            msg+=s._rx(l)
            if fin: return json.loads(msg.decode('utf-8','replace')) if op in (1,0) else None
    def _evt(s,r):
        m=r.get('method')
        if m=='Debugger.paused':
            p=r['params'];d=p.get('data',{})
            fr=[(f.get('functionName'),f['location'].get('lineNumber',0)+1,f['location'].get('columnNumber',0)) for f in p.get('callFrames',[])[:6]]
            s.pauses.append({'cf':(p.get('callFrames') or [{}])[0].get('callFrameId'),'reason':p.get('reason'),'desc':(d.get('description') or d.get('value') or '')[:300],'frames':fr,'t':time.time()})
            if s.autoresume:
                s.n+=1;s._send({'id':s.n,'method':'Debugger.resume','params':{}})
            return
        if m in s.keep: s.events.append(r)
    def call(s,meth,**par):
        s.n+=1;i=s.n;s._send({'id':i,'method':meth,'params':par})
        while True:
            r=s._recv()
            if r is None: continue
            if r.get('id')==i:
                if 'error' in r: raise Exception(str(r['error']))
                return r.get('result',{})
            if 'method' in r: s._evt(r)
    def pump(s,sec):
        end=time.time()+sec
        while True:
            rest=end-time.time()
            if rest<=0:break
            s.sk.settimeout(rest)
            try:
                r=s._recv()
                if r and 'method' in r: s._evt(r)
            except socket.timeout: break
            finally: s.sk.settimeout(None)
    def ev(s,js,timeout=60):
        r=s.call('Runtime.evaluate',expression=js,awaitPromise=True,returnByValue=True,timeout=timeout*1000)
        if 'exceptionDetails' in r: return 'EXC: '+json.dumps(r['exceptionDetails'])[:800]
        return r['result'].get('value')
    def shot(s,f,clip=None):
        p={'format':'png'}
        if clip:p['clip']=clip
        d=s.call('Page.captureScreenshot',**p)['data'];open(f,'wb').write(base64.b64decode(d))
