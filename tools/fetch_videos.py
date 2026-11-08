#!/usr/bin/env python3
"""Resolve a specific, relevant YouTube video for every equipment type.

Reads YouTube search results, scores candidates against expected keywords, then verifies
the pick through the oEmbed endpoint so nothing lands in the data file unless the video
actually exists and is embeddable. Writes src/data/videos.js.
"""
import json, os, re, sys, time, urllib.parse, urllib.request

ROOT = '/tmp/aidc'
UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/120.0 Safari/537.36')

QUERIES = {
    'pln': ('data center medium voltage incoming substation explained', ['substation', 'medium voltage', 'data center', 'incoming']),
    'gardu': ('gardu induk 20 kV substation walkthrough', ['substation', '20 kv', 'switchgear', 'gardu']),
    'genset': ('data center diesel generator sequence of operation', ['generator', 'data center', 'sequence', 'diesel']),
    'fueltank': ('data center diesel fuel system day tank explained', ['fuel', 'day tank', 'diesel', 'generator']),
    'mvinc': ('medium voltage vacuum circuit breaker operation', ['circuit breaker', 'medium voltage', 'vacuum', 'switchgear']),
    'metering': ('current transformer metering explained', ['current transformer', 'metering', 'ct', 'instrument']),
    'rmu': ('ring main unit RMU operation explained', ['ring main unit', 'rmu', 'switchgear']),
    'mvswg': ('medium voltage switchgear interlock explained', ['switchgear', 'medium voltage', 'interlock']),
    'trafo': ('dry type transformer data center installation', ['transformer', 'dry type', 'cast resin', 'data center']),
    'msb': ('low voltage main switchboard air circuit breaker', ['switchboard', 'circuit breaker', 'low voltage', 'acb']),
    'pdb': ('power distribution board explained electrical', ['distribution board', 'distribution', 'panel', 'electrical']),
    'db': ('consumer unit distribution board explained', ['distribution board', 'consumer unit', 'breaker']),
    'apfc': ('power factor correction capacitor bank explained', ['power factor', 'capacitor', 'correction', 'reactive']),
    'ats': ('automatic transfer switch ATS operation data center', ['transfer switch', 'ats', 'generator', 'data center']),
    'sts': ('static transfer switch data center explained', ['static transfer switch', 'sts', 'data center', 'transfer']),
    'ups': ('UPS double conversion online explained data center', ['ups', 'double conversion', 'data center', 'battery']),
    'bbu': ('rack battery backup unit data center', ['battery', 'rack', 'backup', 'bbu']),
    'pdumain': ('data center power distribution PDU explained', ['pdu', 'power distribution', 'data center', 'rack']),
    'busway': ('overhead busway data center power tap off', ['busway', 'tap off', 'data center', 'busbar']),
    'rackpdu': ('metered rack PDU explained', ['rack pdu', 'pdu', 'metered', 'rack']),
    'earth': ('earthing and bonding substation explained', ['earthing', 'grounding', 'bonding', 'substation']),
    'lps': ('lightning protection system explained', ['lightning', 'protection', 'surge', 'spd']),
    'chiller': ('centrifugal chiller how it works data center', ['chiller', 'centrifugal', 'how it works', 'cooling']),
    'coolingtower': ('cooling tower how it works animation', ['cooling tower', 'how it works', 'hvac']),
    'drycooler': ('dry cooler free cooling data center', ['dry cooler', 'free cooling', 'adiabatic', 'cooling']),
    'pumppri': ('chilled water pump VFD pump curve explained', ['pump', 'chilled water', 'vfd', 'hvac']),
    'buffer': ('buffer tank chilled water system explained', ['buffer tank', 'chilled water', 'hvac', 'thermal']),
    'phe': ('plate heat exchanger how it works', ['heat exchanger', 'plate', 'how it works']),
    'cdu': ('coolant distribution unit CDU liquid cooling data center', ['cdu', 'coolant distribution', 'liquid cooling', 'data center']),
    'manifold': ('liquid cooling manifold quick disconnect data center', ['manifold', 'quick disconnect', 'liquid cooling', 'rack']),
    'coldplate': ('direct to chip liquid cooling cold plate', ['cold plate', 'direct to chip', 'liquid cooling', 'gpu']),
    'header': ('chilled water plant primary secondary piping', ['chilled water', 'piping', 'primary', 'secondary']),
    'crah': ('CRAH computer room air handler data center', ['crah', 'air handler', 'data center', 'cooling']),
    'containment': ('cold aisle containment data center airflow', ['containment', 'cold aisle', 'data center', 'airflow']),
    'returnpath': ('data center airflow management hot aisle', ['airflow', 'hot aisle', 'data center', 'return']),
    'rack': ('AI data center GPU rack liquid cooling 100kW', ['rack', 'gpu', 'liquid cooling', 'data center']),
    'odf': ('meet me room fiber optic data center', ['fiber', 'meet me room', 'mmr', 'data center']),
    'tray': ('data center cable tray structured cabling', ['cable tray', 'cabling', 'data center']),
    'vesda': ('VESDA aspirating smoke detection explained', ['vesda', 'aspirating', 'smoke detection']),
    'leakdet': ('water leak detection system data center', ['leak detection', 'water', 'sensing cable']),
    'cleanagent': ('clean agent fire suppression data center', ['clean agent', 'suppression', 'fire', 'data center']),
    'preaction': ('pre action sprinkler system explained', ['pre action', 'sprinkler', 'fire']),
    'firepump': ('fire pump electric diesel jockey explained', ['fire pump', 'diesel', 'jockey', 'pump']),
    'epo': ('emergency power off EPO data center procedure', ['emergency power off', 'epo', 'data center']),
    'noc': ('data center NOC monitoring EPMS', ['noc', 'monitoring', 'data center', 'epms']),
    'security': ('data center physical security access control', ['security', 'access control', 'data center', 'mantrap']),
    'staging': ('data center rack staging integration commissioning', ['staging', 'integration', 'rack', 'commissioning']),
    'office': ('data center facility tour operations', ['data center', 'tour', 'facility', 'operations']),
}

BAD = re.compile(r'\b(shorts|#shorts|reels|tiktok|livestream|full movie)\b', re.I)


def fetch(url, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Language': 'en-US,en'})
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read().decode('utf-8', 'ignore')
        except Exception as e:
            if i == tries - 1:
                return ''
            time.sleep(3)
    return ''


def extract_json(html):
    m = re.search(r'var ytInitialData = (\{.*?\});</script>', html, re.S)
    if not m:
        return None
    try:
        return json.loads(m.group(1))
    except Exception:
        return None


def walk(node, out):
    if isinstance(node, dict):
        if 'videoRenderer' in node:
            v = node['videoRenderer']
            try:
                vid = v.get('videoId')
                title = ''.join(x.get('text', '') for x in v.get('title', {}).get('runs', []))
                ch = ''.join(x.get('text', '') for x in v.get('ownerText', {}).get('runs', []))
                length = v.get('lengthText', {}).get('simpleText', '')
                if vid and title:
                    out.append({'id': vid, 'title': title, 'channel': ch, 'length': length})
            except Exception:
                pass
        for v in node.values():
            walk(v, out)
    elif isinstance(node, list):
        for v in node:
            walk(v, out)


def oembed(vid):
    url = 'https://www.youtube.com/oembed?' + urllib.parse.urlencode({
        'url': 'https://www.youtube.com/watch?v=' + vid, 'format': 'json'})
    try:
        req = urllib.request.Request(url, headers={'User-Agent': UA})
        with urllib.request.urlopen(req, timeout=15) as r:
            d = json.load(r)
        return {'title': d.get('title', ''), 'channel': d.get('author_name', '')}
    except Exception:
        return None


def main():
    only = sys.argv[1:] or list(QUERIES)
    out = {}
    path = os.path.join(ROOT, 'src/data/videos.js')
    if os.path.exists(path):
        try:
            raw = open(path).read()
            body = raw[raw.index('export const VIDEOS = ') + len('export const VIDEOS = '):].rstrip().rstrip(';')
            out = json.loads(body)
        except Exception:
            out = {}

    for key in only:
        q, words = QUERIES[key]
        if key in out and out[key]:
            print('SKIP', key)
            continue
        html = fetch('https://www.youtube.com/results?' + urllib.parse.urlencode({'search_query': q}))
        data = extract_json(html) if html else None
        cands = []
        if data:
            walk(data, cands)
        picked = None
        for c in cands:
            t = c['title'].lower()
            if BAD.search(t):
                continue
            score = sum(3 for w in words if w in t)
            if 'data center' in t or 'datacenter' in t:
                score += 2
            if c['length']:
                try:
                    mins = int(c['length'].split(':')[0])
                    if mins < 2 or mins > 45:
                        continue
                except Exception:
                    pass
            if score >= 3 and (picked is None or score > picked[0]):
                picked = (score, c)
        if not picked:
            print('MISS', key, len(cands))
            time.sleep(2)
            continue
        meta = oembed(picked[1]['id'])
        if not meta:
            print('NOEMBED', key, picked[1]['id'])
            time.sleep(2)
            continue
        out[key] = [{
            'id': picked[1]['id'],
            'title': meta['title'][:90],
            'channel': meta['channel'][:40],
        }]
        print('OK  %-12s %-11s %s' % (key, picked[1]['id'], meta['title'][:58]))
        json.dump(out, open(path, 'w'), indent=1)
        time.sleep(1.6)

    body = json.dumps(out, indent=1)
    open(path, 'w').write(
        '// Generated by tools/fetch_videos.py. Every id was verified through the YouTube\n'
        '// oEmbed endpoint, so each entry resolves to a real, embeddable video.\n\n'
        'export const VIDEOS = ' + body + ';\n')
    print('\n%d videos resolved' % len(out))


if __name__ == '__main__':
    main()
