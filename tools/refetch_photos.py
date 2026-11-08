#!/usr/bin/env python3
"""Re-fetch reference photos for equipment where the first pass was generic or wrong.

Search is qualified for the data center domain, and candidates are scored on whether
their Commons categories actually say data center / server room / cooling plant, not just
on filename keywords. Anything that cannot be confidently matched is dropped rather than
replaced with a lookalike.
"""
import json, os, re, sys, time, urllib.parse, urllib.request

ROOT = '/tmp/aidc'
OUT = os.path.join(ROOT, 'media/photos')
UA = 'AIDataCenterModel/1.0 (educational MEP reference)'

# key -> (commons search, must-have keywords in title/categories)
TARGETS = {
    'genset': ('data center diesel generator container', ['generator']),
    'mvinc': ('data center electrical room switchgear', ['switchgear', 'switchboard', 'panel']),
    'rmu': ('ring main unit switchgear electrical room', ['ring main', 'switchgear', 'rmu']),
    'mvswg': ('electrical switchgear room substation', ['switchgear', 'switchboard']),
    'msb': ('low voltage switchboard electrical room', ['switchboard', 'switchgear', 'panel']),
    'apfc': ('power factor correction panel electrical', ['power factor', 'capacitor bank', 'correction']),
    'ats': ('automatic transfer switch electrical panel', ['transfer switch', 'ats', 'changeover']),
    'drycooler': ('dry cooler hvac condenser unit roof', ['dry cooler', 'condenser', 'cooler']),
    'buffer': ('buffer tank chilled water plant', ['buffer', 'tank', 'chilled']),
    'crah': ('data center cooling unit air handler', ['crah', 'air handler', 'crac', 'cooling unit']),
    'containment': ('cold aisle containment data center', ['containment', 'cold aisle', 'server room']),
    'cdu': ('liquid cooling server rack manifold', ['coolant', 'liquid cooling', 'manifold', 'cdu']),
    'tray': ('cable tray data center installation', ['cable tray', 'cable management']),
    'odf': ('optical distribution frame patch panel', ['distribution frame', 'patch panel', 'odf', 'fiber']),
    'staging': ('server room racks data center', ['server room', 'data center', 'rack']),
    'security': ('server room access control door', ['access', 'door', 'security']),
    'office': ('open plan office interior', ['office', 'desk', 'workspace']),
    'coldplate': ('computer cooling server water block', ['water block', 'cold plate', 'cooling']),
}

GOOD_LIC = re.compile(r'(cc0|cc by|public domain|pd|attribution)', re.I)
BAD = re.compile(r'(logo|icon|map|diagram|chart|graph|seal|coat of arms|flag|portrait|svg)', re.I)
DC = re.compile(r'(data ?cent|server room|server rack|datacenter)', re.I)


def get(url, tries=5):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r)
        except Exception as e:
            if i == tries - 1:
                return None
            wait = 45 * (i + 1) if '429' in str(e) else 5
            print('      wait %ds (%s)' % (wait, str(e)[:28]), flush=True)
            time.sleep(wait)


def search(query):
    q = urllib.parse.urlencode({
        'action': 'query', 'format': 'json', 'generator': 'search',
        'gsrsearch': 'filetype:bitmap ' + query, 'gsrnamespace': '6', 'gsrlimit': '20',
        'prop': 'imageinfo|categories', 'iiprop': 'url|extmetadata|size', 'iiurlwidth': '1280',
        'cllimit': '12'
    })
    d = get('https://commons.wikimedia.org/w/api.php?' + q)
    return ((d or {}).get('query') or {}).get('pages') or {}


def pick(pages, words):
    best = None
    for p in pages.values():
        info = (p.get('imageinfo') or [{}])[0]
        title = p.get('title', '')
        if BAD.search(title) or info.get('width', 0) < 700:
            continue
        meta = info.get('extmetadata') or {}
        lic = (meta.get('LicenseShortName') or {}).get('value', '')
        if not GOOD_LIC.search(lic):
            continue
        cats = ' '.join(c.get('title', '') for c in (p.get('categories') or []))
        hay = (title + ' ' + cats).lower()
        score = 0
        for w in words:
            if w in hay:
                score += 4
        if DC.search(hay):
            score += 5
        if 'cooling' in hay or 'electrical' in hay:
            score += 1
        if score < 4:
            continue
        if best is None or score > best[0]:
            best = (score, title, lic, info.get('thumburl') or info.get('url'), meta, cats[:120])
    return best


def main():
    only = sys.argv[1:] or list(TARGETS)
    P = os.path.join(ROOT, 'media/photos.json')
    data = json.load(open(P)) if os.path.exists(P) else {}
    for key in only:
        query, words = TARGETS[key]
        pages = search(query)
        if not pages:
            print('NOAPI', key)
            time.sleep(6)
            continue
        best = pick(pages, words)
        if not best:
            print('NOPICK', key)
            time.sleep(12)
            continue
        score, title, lic, url, meta, cats = best
        prox = 'https://wsrv.nl/?' + urllib.parse.urlencode({'url': url, 'w': '900', 'output': 'jpg', 'q': '80'})
        try:
            req = urllib.request.Request(prox, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                blob = r.read()
            if len(blob) < 7000:
                print('TINY', key)
                continue
            open(os.path.join(OUT, key + '.jpg'), 'wb').write(blob)
            artist = re.sub('<[^>]+>', '', (meta.get('Artist') or {}).get('value', '')).strip()[:90]
            data[key] = {'key': key, 'file': os.path.join(OUT, key + '.jpg'),
                         'article': title.replace('File:', ''), 'title': title.replace('File:', ''),
                         'license': lic, 'artist': artist,
                         'page': 'https://commons.wikimedia.org/wiki/' + urllib.parse.quote(title.replace(' ', '_')),
                         'source': 'commons', 'bytes': len(blob)}
            print('OK  %-12s %-9s %s' % (key, lic[:9], title[:58]))
        except Exception as e:
            print('DLERR', key, str(e)[:50])
        json.dump(data, open(P, 'w'), indent=1)
        time.sleep(12)


if __name__ == '__main__':
    main()
