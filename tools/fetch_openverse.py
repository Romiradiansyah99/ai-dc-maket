#!/usr/bin/env python3
"""Fetch reference photos from Openverse, which aggregates Flickr, Wikimedia and others.

Queries are written for the data center domain so the results show the actual equipment
in a facility context rather than a generic industrial lookalike. Creator, licence and
source page are captured for attribution.
"""
import json, os, re, sys, time, urllib.parse, urllib.request

ROOT = '/tmp/aidc'
OUT = os.path.join(ROOT, 'media/photos')
UA = 'AIDataCenterModel/1.0 (educational MEP reference model)'
API = 'https://api.openverse.org/v1/images/'

Q = {
    'pln': ('data center medium voltage incoming switchgear', ['switchgear', 'substation', 'medium voltage']),
    'gardu': ('electrical substation transformer yard', ['substation', 'transformer']),
    'genset': ('data center backup diesel generator', ['generator', 'genset', 'diesel']),
    'fueltank': ('diesel fuel storage tank bund', ['fuel', 'tank', 'diesel']),
    'mvinc': ('medium voltage circuit breaker cubicle', ['circuit breaker', 'switchgear', 'cubicle']),
    'metering': ('electrical panel meter current transformer', ['meter', 'metering', 'transformer']),
    'rmu': ('ring main unit medium voltage switchgear', ['ring main', 'switchgear', 'rmu']),
    'mvswg': ('medium voltage switchgear room', ['switchgear', 'switchboard']),
    'trafo': ('cast resin dry type transformer', ['transformer']),
    'msb': ('main switchboard electrical distribution room', ['switchboard', 'switchgear', 'distribution']),
    'pdb': ('electrical distribution board breakers', ['distribution board', 'panel', 'breaker']),
    'db': ('electrical panel circuit breakers', ['panel', 'breaker', 'distribution']),
    'apfc': ('power factor correction capacitor panel', ['power factor', 'capacitor', 'panel']),
    'ats': ('automatic transfer switch panel', ['transfer switch', 'ats', 'panel']),
    'sts': ('static transfer switch data center', ['transfer switch', 'switch', 'data center']),
    'ups': ('UPS uninterruptible power supply battery room', ['ups', 'battery', 'uninterruptible']),
    'bbu': ('server rack battery backup', ['battery', 'rack', 'backup']),
    'pdumain': ('data center power distribution unit', ['pdu', 'power distribution', 'data center']),
    'busway': ('busbar busway overhead power', ['busway', 'busbar']),
    'rackpdu': ('rack pdu power strip server', ['pdu', 'rack', 'power']),
    'earth': ('earthing grounding bar substation', ['earth', 'ground', 'bar']),
    'lps': ('lightning protection air terminal roof', ['lightning', 'protection']),
    'chiller': ('centrifugal chiller plant room', ['chiller']),
    'coolingtower': ('data center cooling tower', ['cooling tower']),
    'drycooler': ('dry cooler condenser unit industrial', ['cooler', 'condenser']),
    'pumppri': ('chilled water pump plant room', ['pump']),
    'buffer': ('thermal storage buffer tank plant', ['tank', 'buffer', 'thermal']),
    'phe': ('plate heat exchanger industrial', ['heat exchanger']),
    'cdu': ('coolant distribution unit liquid cooling', ['cdu', 'coolant', 'liquid cooling']),
    'manifold': ('liquid cooling manifold server rack', ['manifold', 'cooling']),
    'coldplate': ('server liquid cooling cold plate', ['cold plate', 'cooling']),
    'header': ('chilled water pipes plant room', ['pipe', 'pipes', 'water']),
    'crah': ('computer room air handler CRAC unit', ['crah', 'crac', 'air handler']),
    'containment': ('cold aisle containment data center', ['containment', 'aisle']),
    'returnpath': ('data center hot aisle server room', ['aisle', 'server room', 'data center']),
    'rack': ('data center server rack', ['rack', 'server']),
    'odf': ('fiber optic patch panel distribution frame', ['fiber', 'patch panel', 'frame']),
    'tray': ('cable tray data center cables', ['cable tray', 'cable']),
    'vesda': ('aspirating smoke detection pipe', ['smoke', 'detection', 'aspirating']),
    'leakdet': ('water leak detection sensor', ['leak', 'detection', 'sensor']),
    'cleanagent': ('clean agent fire suppression cylinders', ['suppression', 'cylinder', 'fire']),
    'preaction': ('fire sprinkler valve pre action', ['sprinkler', 'valve', 'fire']),
    'firepump': ('fire pump diesel electric', ['fire pump', 'pump']),
    'epo': ('emergency stop button panel', ['emergency stop', 'button']),
    'noc': ('network operations center monitoring screens', ['operations', 'control room', 'monitoring']),
    'security': ('data center access control door', ['access', 'door', 'security']),
    'staging': ('data center racks server room', ['rack', 'server room', 'data center']),
    'office': ('open plan office workspace', ['office', 'workspace', 'desk']),
}

BAD = re.compile(r'(logo|icon|map|diagram|chart|graph|seal|coat of arms|flag|portrait|illustration|drawing)', re.I)
OK_LIC = ('cc0', 'by', 'by-sa', 'pdm', 'pd')


def get(url, tries=4):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r)
        except Exception as e:
            if i == tries - 1:
                return None
            wait = 30 * (i + 1) if '429' in str(e) else 4
            print('      wait %ds' % wait, flush=True)
            time.sleep(wait)


def download(url, dest):
    target = url
    if 'wikimedia.org' in url:
        target = 'https://wsrv.nl/?' + urllib.parse.urlencode({'url': url, 'w': '900', 'output': 'jpg', 'q': '80'})
    req = urllib.request.Request(target, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        blob = r.read()
    if len(blob) < 7000:
        return 0
    open(dest, 'wb').write(blob)
    return len(blob)


def main():
    only = sys.argv[1:] or list(Q)
    P = os.path.join(ROOT, 'media/photos.json')
    data = json.load(open(P)) if os.path.exists(P) else {}
    for key in only:
        query, words = Q[key]
        url = API + '?' + urllib.parse.urlencode({
            'q': query, 'page_size': '20', 'license_type': 'all',
            'mature': 'false'})
        d = get(url)
        if not d:
            print('NOAPI', key)
            time.sleep(5)
            continue
        best = None
        fallback = None
        qwords = [w for w in query.lower().split() if len(w) > 3]
        for r in d.get('results', []):
            t = (r.get('title') or '')
            if BAD.search(t):
                continue
            lic = (r.get('license') or '').lower()
            if lic not in OK_LIC:
                continue
            w = r.get('width') or 1600
            if w < 700:
                continue
            hay = (t + ' ' + (r.get('tags') and ' '.join(x.get('name', '') for x in r['tags']) or '')).lower()
            score = sum(3 for x in words if x in hay)
            if 'data center' in hay or 'datacenter' in hay or 'server room' in hay:
                score += 4
            score += sum(1 for x in qwords if x in hay)
            if fallback is None:
                fallback = (score, r)
            if score >= 2 and (best is None or score > best[0]):
                best = (score, r)
        if best is None:
            best = fallback
        if not best:
            print('NOPICK', key)
            time.sleep(3)
            continue
        r = best[1]
        dest = os.path.join(OUT, key + '.jpg')
        try:
            size = download(r['url'], dest)
        except Exception as e:
            print('DLERR', key, str(e)[:40])
            time.sleep(4)
            continue
        if not size:
            print('TINY', key)
            continue
        data[key] = {
            'key': key, 'file': dest, 'article': (r.get('title') or '')[:90],
            'title': (r.get('title') or '')[:90],
            'license': (r.get('license') or '').upper() + ' ' + (r.get('license_version') or ''),
            'artist': (r.get('creator') or 'unknown')[:80],
            'page': r.get('foreign_landing_url') or r.get('url'),
            'source': r.get('source') or 'openverse', 'bytes': size,
        }
        print('OK  %-12s %-10s %s' % (key, data[key]['license'][:10], (r.get('title') or '')[:50]))
        json.dump(data, open(P, 'w'), indent=1)
        time.sleep(4)


if __name__ == '__main__':
    main()
