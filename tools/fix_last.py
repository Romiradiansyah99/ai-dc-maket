import json, re, time, urllib.parse, urllib.request
UA='AIDataCenterModel/1.0 (educational MEP reference)'
P='/tmp/aidc/media/photos.json'; data=json.load(open(P))
def get(u,t=3):
    for i in range(t):
        try:
            r=urllib.request.Request(u,headers={'User-Agent':UA})
            with urllib.request.urlopen(r,timeout=25) as f: return json.load(f)
        except Exception:
            if i==t-1: return None
            time.sleep(4)
TARGETS={'trafo':'filetype:bitmap dry type transformer cast resin',
         'phe':'filetype:bitmap plate heat exchanger industrial'}
for key,qs in TARGETS.items():
    d=get('https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode({
        'action':'query','format':'json','generator':'search','gsrsearch':qs,
        'gsrnamespace':'6','gsrlimit':'10','prop':'imageinfo',
        'iiprop':'url|extmetadata|size','iiurlwidth':'1280'}))
    pages=((d or {}).get('query') or {}).get('pages') or {}
    best=None
    for p in pages.values():
        info=(p.get('imageinfo') or [{}])[0]
        meta=info.get('extmetadata') or {}
        lic=(meta.get('LicenseShortName') or {}).get('value','')
        url=info.get('thumburl') or info.get('url')
        title=p.get('title','')
        if not lic or not url or info.get('width',0)<600: continue
        score=sum(2 for w in qs.split()[-3:] if w.lower() in title.lower())
        if not best or score>best[0]: best=(score,title,lic,url,meta)
    if not best:
        print('NONE',key); continue
    score,title,lic,url,meta=best
    artist=re.sub('<[^>]+>','',(meta.get('Artist') or {}).get('value','')).strip()[:90]
    prox='https://wsrv.nl/?'+urllib.parse.urlencode({'url':url,'w':'900','output':'jpg','q':'80'})
    try:
        r=urllib.request.Request(prox,headers={'User-Agent':UA})
        with urllib.request.urlopen(r,timeout=60) as f: blob=f.read()
        if len(blob)<6000: print('TINY',key); continue
        open('/tmp/aidc/media/photos/%s.jpg'%key,'wb').write(blob)
        data[key].update({'license':lic,'artist':artist,'title':title.replace('File:',''),'bytes':len(blob)})
        print('OK',key,lic,title[:50])
    except Exception as e:
        print('DLERR',key,str(e)[:50])
    time.sleep(2)
json.dump(data,open(P,'w'),indent=1)
print('missing:',[k for k,v in data.items() if not v.get('license')])
