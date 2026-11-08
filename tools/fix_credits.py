#!/usr/bin/env python3
"""Resolve licence and author for photos that came back without metadata."""
import json, os, re, time, urllib.parse, urllib.request

UA = 'AIDataCenterModel/1.0 (educational MEP reference)'
P = '/tmp/aidc/media/photos.json'
data = json.load(open(P))

def get(url, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=25) as r:
                return json.load(r)
        except Exception:
            if i == tries - 1:
                return None
            time.sleep(4)

need = [k for k, v in data.items() if not v.get('license')]
print('resolving', len(need))
for k in need:
    art = data[k]['article']
    q = urllib.parse.urlencode({'action': 'query', 'format': 'json', 'redirects': '1',
                                'titles': art, 'prop': 'pageimages', 'piprop': 'name'})
    d = get('https://en.wikipedia.org/w/api.php?' + q)
    pages = ((d or {}).get('query') or {}).get('pages') or {}
    fname = None
    for p in pages.values():
        fname = p.get('pageimage')
    if not fname:
        print('NONAME', k, art)
        time.sleep(1)
        continue
    q2 = urllib.parse.urlencode({'action': 'query', 'format': 'json', 'titles': 'File:' + fname,
                                 'prop': 'imageinfo', 'iiprop': 'extmetadata'})
    d2 = get('https://commons.wikimedia.org/w/api.php?' + q2)
    pages2 = ((d2 or {}).get('query') or {}).get('pages') or {}
    meta = {}
    for p in pages2.values():
        info = (p.get('imageinfo') or [{}])[0]
        meta = info.get('extmetadata') or {}
    lic = (meta.get('LicenseShortName') or {}).get('value', '')
    artist = re.sub('<[^>]+>', '', (meta.get('Artist') or {}).get('value', '')).strip()[:90]
    if lic:
        data[k]['license'] = lic
        data[k]['artist'] = artist
        data[k]['title'] = fname
        print('OK  ', k, lic, '|', artist[:40])
    else:
        print('STILL', k, fname)
    time.sleep(1.2)

json.dump(data, open(P, 'w'), indent=1)
print('missing after pass:', [k for k, v in data.items() if not v.get('license')])
