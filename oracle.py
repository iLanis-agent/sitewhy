# Generates hostnames from real PSL rules (plus extra labels) and records what the Python `tld` package says.
import random, sys, json, re
from tld import get_tld
seed=int(sys.argv[1]); N=int(sys.argv[2]); random.seed(seed)
rules=open('psl-rules.txt').read().split(' ')
norm=[r[1:] for r in rules if r[1]!='!' and r[1:3]!='*.']
wild=[r[3:] for r in rules if r[1:3]=='*.']
exc=[r[2:] for r in rules if r[1]=='!']
LAB=['a','www','b','x-1','mail','shop','foo','bar','city','z9']
out=open(sys.argv[2+1],'w')
for _ in range(N):
    r=random.random()
    if r<.6: base=random.choice(norm)
    elif r<.8: base=random.choice(LAB)+'.'+random.choice(wild)
    elif r<.9: base=random.choice(exc)
    else: base=random.choice(LAB)+'.'+random.choice(['com','org','test','invalid','zzz'])
    host='.'.join(random.choice(LAB) for _ in range(random.choice([0,0,1,1,2,3])))
    host=(host+'.' if host else '')+base
    def dec(h): return '.'.join(l.encode('ascii').decode('idna') if l.startswith('xn--') else l for l in h.split('.'))
    def enc(h): return '.'.join(l.encode('idna').decode('ascii') for l in h.split('.'))
    try:
        o=get_tld('http://'+dec(host)+'/',as_object=True)
        res={'suffix':enc(o.tld),'domain':enc(o.fld)}
        o2=get_tld('http://'+dec(host)+'/',as_object=True,search_private=False)
        res['icann']={'suffix':enc(o2.tld),'domain':enc(o2.fld)}
    except Exception as e:
        res=None
    out.write(json.dumps({'h':host,'tld':res})+'\n')
