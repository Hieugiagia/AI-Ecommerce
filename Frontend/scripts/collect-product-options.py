"""Collect factual specifications and priced SKU choices; never writes to the database.
Run from repository root: python Frontend/scripts/collect-product-options.py
Only follows the version links on the original 300 detail pages (one level).
"""
import concurrent.futures as futures
import json, re, runpy, sys, unicodedata, time
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen
sys.stdout.reconfigure(encoding='utf-8')
ROOT = Path(__file__).resolve().parents[1]
helper = runpy.run_path(str(ROOT / 'scripts/collect-reference-catalog.py'))
fetch_page, parse_price = helper['fetch_page'], helper['parse_price']
BASE = helper['BASE']
catalog = json.loads((ROOT / 'public/data/reference-catalog.json').read_text(encoding='utf-8'))
# The four original test records remain untouched in the database.
for category_slug, slug, name, path in [
    ('dien-thoai', 'dien-thoai-oppo-reno10', 'Điện thoại Oppo Reno10', '/oppo-reno10.html'),
    ('dien-thoai', 'samsung-galaxy-s24-test', 'Samsung Galaxy S24', '/samsung-galaxy-s24.html'),
    ('am-thanh', 'sony-wh-1000xm5', 'Tai nghe Sony WH-1000XM5', '/tai-nghe-chup-tai-sony-wh-1000xm5.html'),
]:
    category = next(c for c in catalog['categories'] if c['slug'] == category_slug)
    if not any(p['slug'] == slug for p in category['products']):
        fallback = category['products'][0]
        category['products'].append(dict(name=name,slug=slug,sourceUrl=BASE+path,price=None,
            thumbnailUrl=fallback['thumbnailUrl'],sourceImageUrl=fallback['sourceImageUrl']))
def slugify(text):
    text = unicodedata.normalize('NFD', text).encode('ascii', 'ignore').decode().lower()
    return re.sub('[^a-z0-9]+', '-', text).strip('-')
def canonical(url):
    parsed = urlparse(urljoin(BASE, url))
    return BASE + parsed.path if parsed.hostname == 'cellphones.com.vn' and parsed.path.endswith('.html') else None
def collect(url):
    for attempt in range(3):
        try:
            root = fetch_page(url)
            specs = {}
            tables = root.find(lambda n: n.tag == 'table' and (n.has('technical-content') or 'TechnicalInfo_' in n.attrs.get('class','')))
            if not tables and url.endswith('/dien-thoai-oppo-find-x10.html'):
                tables = [n for n in root.find(lambda n: n.tag=='table') if n.text().startswith('Tiêu chí')]
            for table in tables[:1]:
                for row in table.find(lambda n: n.tag == 'tr'):
                    cells = row.find(lambda n: n.tag in ('td', 'th'))
                    if len(cells) == 2:
                        key, value = (re.sub(r'\s+', ' ', cell.text()).strip() for cell in cells)
                        if key and value and key != 'Tiêu chí': specs[key] = value
            versions = []
            for node in root.find(lambda n: n.tag == 'a' and (n.has('item-linked') or 'relative flex h-full min-h-' in n.attrs.get('class', ''))):
                link = canonical(node.attrs.get('href', ''))
                if link and not any(item['url'] == link for item in versions):
                    versions.append(dict(url=link, label=node.text(), active=node.has('active')))
            prices = root.find(lambda n: n.has('sale-price'))
            price = next((parse_price(n.text()) for n in prices if parse_price(n.text())), None)
            colors = []
            for node in root.find(lambda n: n.tag == 'a' and n.has('button__change-color')):
                name = node.attrs.get('title', '').strip()
                amount = parse_price(node.text())
                images = node.find(lambda n: n.tag == 'img')
                if name and amount and not any(c['name'] == name for c in colors):
                    colors.append(dict(name=name, price=amount,
                        sourceUrl=urljoin(BASE, node.attrs.get('href', '')),
                        image=images[0].attrs.get('src', '') if images else ''))
            # Next.js detail pages use li[data-product-id], not Vue color anchors.
            if not colors:
                for node in root.find(lambda n: n.tag=='li' and n.attrs.get('data-product-id')):
                    images = node.find(lambda n: n.tag=='img')
                    amount = parse_price(node.text())
                    if not images or not amount: continue
                    name = images[0].attrs.get('alt','').rsplit('-',1)[-1].strip()
                    if name and not any(c['name']==name for c in colors):
                        colors.append(dict(name=name,price=amount,
                            sourceUrl=url+'?product_id='+node.attrs['data-product-id'],
                            image=images[0].attrs.get('src','').replace('rs:fill:100:100','rs:fill:358:358')))
            headings = root.find(lambda n: n.tag == 'h1')
            hero = root.find(lambda n: n.tag == 'meta' and n.attrs.get('property') == 'og:image')
            return dict(sourceUrl=url, name=headings[0].text() if headings else '',
                specs=specs, versions=versions, colors=colors, price=price, image=hero[0].attrs.get('content', '') if hero else '')
        except Exception as error:
            if attempt == 2: return dict(sourceUrl=url, error=str(error), specs={}, versions=[], colors=[], price=None)
            time.sleep(attempt + 1)
def batch(urls, records):
    with futures.ThreadPoolExecutor(max_workers=4) as pool:
        jobs = {pool.submit(collect, url): url for url in sorted(set(urls) - records.keys())}
        for index, task in enumerate(futures.as_completed(jobs), 1):
            record = task.result(); records[record['sourceUrl']] = record
            if index % 25 == 0 or index == len(jobs):
                print('Collected', index, '/', len(jobs), flush=True)
records = {}
originals = [p for c in catalog['categories'] for p in c['products']]
batch([p['sourceUrl'] for p in originals], records)
batch([v['url'] for record in list(records.values()) for v in record['versions']], records)
families, entries, by_slug = {}, {}, {}
sku_categories = []
# Keep families stable for every original record, even when the upstream table is empty.
for category in catalog['categories']:
    sku_products = []
    for base in category['products']:
        record = records[base['sourceUrl']]
        family_key = base['slug']
        choices = record['versions'] or [dict(url=base['sourceUrl'], label='Ti\u00eau chu\u1ea9n', active=True)]
        if not any(v['url'] == base['sourceUrl'] for v in choices):
            choices.insert(0, dict(url=base['sourceUrl'], label='Ti\u00eau chu\u1ea9n', active=True))
        options = []
        for version in choices:
            detail = records.get(version['url'])
            if not detail or detail.get('error'): continue
            source_slug = urlparse(version['url']).path.rsplit('/', 1)[-1].removesuffix('.html')
            # Skip accessories/used-device cross-sells; these aren't configurations of a new product.
            if any(x in source_slug for x in ['-cu-', '-cu', 'hang-cu', 'do-cu']): continue
            colors = detail['colors'] or [dict(name='', price=detail['price'] or (base['price'] if version['url']==base['sourceUrl'] else None), sourceUrl=version['url'], image='')]
            for color in colors:
                if not color['price']: continue
                sku_slug = (source_slug + '-mau-' + slugify(color['name'])) if color['name'] else source_slug
                sku_slug = sku_slug[:235].rstrip('-')
                name = (detail['name'] or base['name']) + (' - ' + color['name'] if color['name'] else '')
                option = dict(slug=sku_slug, name=name[:255], version=version['label'], color=color['name'], referencePrice=color['price'],
                    sourceUrl=color['sourceUrl'], image=base['thumbnailUrl'],
                    specs=detail['specs'])
                # Stable exact SKU slugs are reused across overlapping family pages.
                options.append(option)
                if sku_slug not in by_slug:
                    by_slug[sku_slug] = True
                    sku_products.append(dict(name=name[:255], slug=sku_slug, price=color['price'],
                        description=name[:255]+'.', thumbnailUrl=base['thumbnailUrl'],
                        sourceImageUrl=(color.get('image') or detail.get('image') or base['sourceImageUrl']).replace('rs:fill:50:50', 'rs:fill:358:358'), sourceUrl=color['sourceUrl'], status='PUBLISHED'))
        families[family_key] = dict(name=base['name'], category=category['slug'], sourceUrl=base['sourceUrl'],
            specs=record['specs'], options=options)
        entries[base['slug']] = dict(family=family_key)
        for option in options:
            entries.setdefault(option['slug'], dict(family=family_key, option=option['slug']))
    if sku_products:
        sku_categories.append(dict(slug=category['slug'], name=category['name'], sourceUrl=category['sourceUrl'], products=sku_products))
# Fetch images for the selected color, rather than reusing another color's photograph.
def download_image(product):
    prefix = product['slug']
    destination = ROOT / 'public/images/catalog'
    image_url = product['sourceImageUrl']
    if not image_url.startswith('https://') or not (urlparse(image_url).hostname or '').endswith('cellphones.com.vn'):
        return None
    existing = list(destination.glob(prefix + '.*'))
    target = existing[0] if existing else None
    if not target:
        for attempt in range(3):
            try:
                with urlopen(Request(image_url, headers=helper['HEADERS']), timeout=35) as response:
                    content, mime = response.read(), response.headers.get_content_type()
                ext = {'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','image/avif':'.avif'}.get(mime)
                if not ext or len(content) < 300: raise ValueError('Invalid product image')
                target = destination / (prefix + ext); target.write_bytes(content); break
            except Exception:
                if attempt == 2: return prefix
                time.sleep(attempt+1)
    product['thumbnailUrl'] = '/images/catalog/' + target.name
    return None
all_skus = [p for c in sku_categories for p in c['products']]
image_errors = []
with futures.ThreadPoolExecutor(max_workers=4) as pool:
    for index, error in enumerate(pool.map(download_image, all_skus), 1):
        if error: image_errors.append(error)
        if index % 100 == 0: print('Images',index,'/',len(all_skus),flush=True)
sku_images = {p['slug']:p['thumbnailUrl'] for p in all_skus}
for family in families.values():
    family['sourceName'] = 'CellphoneS'
    for option in family['options']:
        option['image'] = sku_images[option['slug']]
# The original MacBook record doesn't specify 14/16-inch, so publish only
# the shared facts identifiable from its model name. Don't invent its screen size.
families['macbook-pro-m3-max'] = dict(name='MacBook Pro M3 Max 36GB/1TB', category='laptop',
    sourceUrl='https://support.apple.com/en-us/117736', sourceName='Apple Support',
    specs={'Chip':'Apple M3 Max','Bộ nhớ RAM':'36 GB','Lưu trữ':'SSD 1 TB'},
    options=[])
entries['macbook-pro-m3-max'] = dict(family='macbook-pro-m3-max')
metadata = dict(schemaVersion=1, referenceDate=catalog['referenceDate'], sourceName='CellphoneS', families=families, entries=entries)
target = ROOT / 'public/data'
(target / 'product-options.json').write_text(json.dumps(metadata, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
sku_catalog = {k:v for k,v in catalog.items() if k != 'categories'}
sku_catalog.update(id='zentro-options-2026-11-19', categories=sku_categories)
(target / 'reference-options.json').write_text(json.dumps(sku_catalog, ensure_ascii=False, indent=2), encoding='utf-8')
report = dict(pages=len(records), originalProducts=len(originals),
    withSpecs=sum(bool(f['specs']) for f in families.values()), imageErrors=image_errors,
    withOptions=sum(bool(f['options']) for f in families.values()),
    skuProducts=sum(len(c['products']) for c in sku_categories),
    missingSpecs=[p['sourceUrl'] for p in originals if not records[p['sourceUrl']]['specs']],
    errors=[dict(url=u, error=r['error']) for u,r in records.items() if r.get('error')])
(ROOT / 'scripts/product-options-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False), flush=True)
