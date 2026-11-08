#!/usr/bin/env python3
"""Second pass: pick a named file from the article's image list and resolve its licence."""
import json, re, time, urllib.parse, urllib.request

UA = 'AIDataCenterModel/1.0 (educational MEP reference)'
P = '/tmp/aidc/media/photos.json'
data = json.load(open(P))

WANT = {
    'mvinc': r'(breaker|switchgear|kru|circuit)',
    'trafo': r'(transform)',
    'drycooler': r'(radiator|dry.?cooler|cooler)',
    'phe': r'(heat.?exchanger|exchanger|plate)',
    'odf': r'(fiber|fibre|optical|patch)',
}

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

for key, pat in WANT.items():
    if data.get(key, {}).get('license'):
        continue
    art = data[key]['article']
    q = urllib.parse.urlencode({'action': 'query', 'format': 'json', 'redirects': '1',
                                'titles': art, 'prop': 'images', 'imlimit': '60'})
    d = get('https://en.wikipedia.org/w/api.php?' + q)
    pages = ((d or {}).get('query') or {}).get('pages') or {}
    names = []
    for p in pages.values():
        for im in p.get('images', []) or []:
            t = im.get('title', '')
            if re.search(pat, t, re.I) and t.lower().endswith(('.jpg', '.jpeg', '.png')):
                names.append(t)
    if not names:
        print('NOWANT', key)
        continue
    fname = names[0].replace('File:', '')
    q2 = urllib.parse.urlencode({'action': 'query', 'format': 'json', 'titles': 'File:' + fname,
                                 'prop': 'imageinfo', 'iiprop': 'extmetadata|url', 'iiurlwidth': '1280'})
    d2 = get('https://commons.wikimedia.org/w/api.php?' + q2)
    pages2 = ((d2 or {}).get('query') or {}).get('pages') or {}
    meta, url = {}, None
    for p in pages2.values():
        info = (p.get('imageinfo') or [{}])[0]
        meta = info.get('extmetadata') or {}
        url = info.get('thumburl') or info.get('url')
    lic = (meta.get('LicenseShortName') or {}).get('value', '')
    artist = re.sub('<[^>]+>', '', (meta.get('Artist') or {}).get('value', '')).strip()[:90]
    if not lic or not url:
        print('NOLIC', key, fname)
        continue
    proxied = 'https://wsrv.nl/?' + urllib.parse.urlencode({'url': url, 'w': '900', 'output': 'jpg', 'q': '80'})
    try:
        req = urllib.request.Request(proxied, headers={'User-Agent': UA})
        with urllib.request.urlopen(req, timeout=60) as r:
            blob = r.read()
        if len(blob) < 6000:
            print('TINY', key)
            continue
        open('/tmp/aidc/media/photos/%s.jpg' % key, 'wb').write(blob)
        data[key].update({'license': lic, 'artist': artist, 'title': fname, 'bytes': len(blob)})
        print('OK  ', key, lic, '|', fname[:50])
    except Exception as e:
        print('DL', key, str(e)[:60])
    time.sleep(2)

json.dump(data, open(P, 'w'), indent=1)
print('missing:', [k for k, v in data.items() if not v.get('license')])
