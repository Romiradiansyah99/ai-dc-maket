#!/usr/bin/env python3
"""Build a contact sheet page so every fetched reference photo can be eyeballed at once."""
import json, os

ROOT = '/tmp/aidc'
data = json.load(open(os.path.join(ROOT, 'media/photos.json')))

items = []
for k in sorted(data):
    r = data[k]
    if not os.path.exists(r['file']):
        continue
    items.append((k, r.get('article', ''), r.get('license', '')))

cards = '\n'.join(
    f'<figure><img src="media/photos/{k}.jpg" loading="lazy"><figcaption><b>{k}</b>'
    f'<span>{a}</span><i>{l}</i></figcaption></figure>' for k, a, l in items)

html = f"""<!doctype html><html><head><meta charset="utf-8"><title>Photo check</title>
<style>
body{{margin:0;padding:16px;background:#fff;font:12px/1.4 system-ui,sans-serif}}
.grid{{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}}
figure{{margin:0;border:1px solid #ddd}}
img{{width:100%;height:120px;object-fit:cover;display:block}}
figcaption{{padding:4px 6px;font-size:9px;display:flex;flex-direction:column;gap:1px}}
figcaption b{{font-size:11px;color:#1F4E8C}}
figcaption span{{color:#666}}
figcaption i{{color:#999;font-style:normal;font-size:8px}}
</style></head><body>
<div class="grid">{cards}</div>
</body></html>"""
open(os.path.join(ROOT, 'verify.html'), 'w').write(html)
print('%d images in sheet' % len(items))
