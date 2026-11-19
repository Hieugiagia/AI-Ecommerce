"""Collect factual catalog references for the local Zentro development catalog.

Uses public product listing cards only. Does not log in or copy reviews/marketing
descriptions. The HTML cache lives in the OS temp directory, outside the repo.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urljoin, urlparse
from concurrent.futures import ThreadPoolExecutor
import hashlib, json, os, re, time, unicodedata

ROOT = Path(__file__).resolve().parents[1]
CACHE = Path(os.environ.get('TEMP', '/tmp')) / 'zentro-cellphones'
CACHE.mkdir(parents=True, exist_ok=True)
BASE = 'https://cellphones.com.vn'
REFERENCE_DATE = '2026-11-19'
CATEGORIES = [
    ('dien-thoai', '\u0110i\u1ec7n tho\u1ea1i', '/mobile.html'),
    ('laptop', 'Laptop', '/laptop.html'),
    ('am-thanh', 'Tai nghe & \u00c2m thanh', '/thiet-bi-am-thanh.html'),
    ('dong-ho', '\u0110\u1ed3ng h\u1ed3 th\u00f4ng minh', '/do-choi-cong-nghe.html'),
    ('phu-kien', 'Ph\u1ee5 ki\u1ec7n', '/phu-kien.html'),
    ('gia-dung', 'Gia d\u1ee5ng & Smart Home', '/do-gia-dung.html'),
    ('may-tinh-bang', 'M\u00e1y t\u00ednh b\u1ea3ng', '/tablet.html'),
    ('camera', 'Camera', '/phu-kien/camera.html'),
    ('micro-thu-am', 'Micro thu \u00e2m', '/thiet-bi-am-thanh/micro-thu-am.html'),
    ('pc', 'PC - M\u00e1y t\u00ednh \u0111\u1ec3 b\u00e0n', '/may-tinh-de-ban.html'),
    ('man-hinh', 'M\u00e0n h\u00ecnh m\u00e1y t\u00ednh', '/man-hinh.html'),
    ('may-in', 'M\u00e1y in', '/may-in.html'),
    ('tivi', 'Tivi', '/tivi.html'),
    ('suc-khoe-lam-dep', 'S\u1ee9c kh\u1ecfe & L\u00e0m \u0111\u1eb9p', '/nha-thong-minh/suc-khoe-lam-dep.html'),
    ('dien-may', '\u0110i\u1ec7n m\u00e1y', '/dien-may.html'),
]
HEADERS = {'User-Agent': 'Mozilla/5.0', 'Referer': BASE + '/'}

class Node:
    def __init__(self, tag='', attrs=None, parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs or []), parent, []
    def text(self):
        return ' '.join(child if isinstance(child, str) else child.text() for child in self.children).strip()
    def find(self, predicate):
        result = []
        for child in self.children:
            if isinstance(child, Node):
                if predicate(child): result.append(child)
                result.extend(child.find(predicate))
        return result
    def has(self, cls):
        return cls in self.attrs.get('class', '').split()

class TreeParser(HTMLParser):
    VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node('root')
        self.stack = [self.root]
    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.stack[-1])
        self.stack[-1].children.append(node)
        if tag not in self.VOID: self.stack.append(node)
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID: self.handle_endtag(tag)
    def handle_endtag(self, tag):
        for index in range(len(self.stack)-1, 0, -1):
            if self.stack[index].tag == tag:
                self.stack = self.stack[:index]
                break
    def handle_data(self, data):
        if self.stack[-1].tag not in {'script','style'} and data.strip():
            self.stack[-1].children.append(data.strip())

def fetch_page(path):
    url = urljoin(BASE, path)
    target = CACHE / (hashlib.sha256(url.encode()).hexdigest()[:20] + '.html')
    if not target.exists():
        with urlopen(Request(url, headers=HEADERS), timeout=40) as response:
            target.write_bytes(response.read())
    parser = TreeParser()
    parser.feed(target.read_text(encoding='utf-8'))
    return parser.root

def parse_price(text):
    match = re.search(r'([\d.]+)\s*[\u0111\u20ab]', text)
    return int(match[1].replace('.', '')) if match else None

def listing_products(root):
    cards = root.find(lambda n: n.has('product-info-container'))
    # Prefer the actual category grid over promotional carousels.
    def carousel(card):
        parent = card.parent
        while parent:
            if parent.has('swiper-slide'): return True
            parent = parent.parent
        return False
    cards.sort(key=carousel)
    result, seen = [], set()
    for card in cards:
        names = card.find(lambda n: n.has('product__name'))
        prices = card.find(lambda n: n.has('product__price--show'))
        images = card.find(lambda n: n.tag == 'img' and (n.has('product__img') or '/catalog/product/' in n.attrs.get('src', '')))
        links = card.find(lambda n: n.tag == 'a' and n.has('product__link'))
        if not all([names, prices, images, links]): continue
        name = re.sub(r'\s+', ' ', names[0].text()).strip()
        price = parse_price(prices[0].text())
        source = urljoin(BASE, links[0].attrs.get('href', ''))
        image = images[0].attrs.get('src') or images[0].attrs.get('data-src')
        if not price or not image or source in seen or 'Loading' in name: continue
        if not image.startswith('https://') or 'cellphones.com.vn' not in urlparse(image).hostname: continue
        source_slug = urlparse(source).path.strip('/').removesuffix('.html').replace('/', '-')
        if not re.fullmatch('[a-z0-9-]+', source_slug): continue
        seen.add(source)
        result.append({'name': name, 'slug': source_slug, 'price': price,
                       'sourceUrl': source, 'sourceImageUrl': image})
    return result

def category_links(root, main_path):
    candidates = []
    for node in root.find(lambda n: n.tag == 'a'):
        path = urlparse(urljoin(BASE, node.attrs.get('href', ''))).path
        text = node.text()
        if path == main_path or not path.endswith('.html'): continue
        if '/media/' in path or len(text) > 95 or not text: continue
        # Category tiles have no price or installment copy.
        if re.search(r'\d[.\d]*\s*[\u0111\u20ab]|Tr\u1ea3 g\u00f3p', text): continue
        if path not in [p for p, _ in candidates]: candidates.append((path, text))
    return candidates

def collect_category(row):
    slug, name, path = row
    root = fetch_page(path)
    products = listing_products(root)
    return {'slug': slug, 'name': name, 'sourceUrl': BASE+path, 'products': products,
            'links': category_links(root, path)}

def inspect():
    with ThreadPoolExecutor(max_workers=3) as pool:
        results = list(pool.map(collect_category, CATEGORIES))
    (CACHE / 'candidates.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    for row in results:
        print(row['slug'], len(row['products']), json.dumps([p['name'] for p in row['products'][:2]]))
        if len(row['products']) < 20:
            print('  category links:', json.dumps(row['links'][:28]))



FALLBACKS = {
    'am-thanh': ['/thiet-bi-am-thanh/tai-nghe/tai-nghe-bluetooth.html', '/thiet-bi-am-thanh/tai-nghe/headphones.html', '/thiet-bi-am-thanh/loa/loa-bluetooth.html'],
    'dong-ho': ['/do-choi-cong-nghe/dong-ho-the-thao.html', '/do-choi-cong-nghe/dong-ho-thong-minh-nghe-goi.html', '/do-choi-cong-nghe/apple-watch/series-11.html'],
    'phu-kien': ['/phu-kien/sac-dien-thoai.html', '/phu-kien/pin-du-phong.html', '/phu-kien/chuot-ban-phim-may-tinh.html'],
    'gia-dung': ['/nha-thong-minh/may-hut-bui/robot-hut-bui.html', '/do-gia-dung/noi-chien-khong-dau.html', '/do-gia-dung/ban-ui.html'],
    'suc-khoe-lam-dep': ['/nha-thong-minh/suc-khoe-lam-dep/may-say-toc.html', '/nha-thong-minh/suc-khoe-lam-dep/ban-chai-dien.html', '/nha-thong-minh/suc-khoe-lam-dep/may-massage.html'],
    'dien-may': ['/tu-lanh.html', '/may-giat.html', '/may-lanh.html'],
}

def complete_candidates():
    rows = json.loads((CACHE / 'candidates.json').read_text(encoding='utf-8'))
    paths = sorted({path for row in rows if len(row['products']) < 20 for path in FALLBACKS.get(row['slug'], [])})
    def load(path):
        try: return path, listing_products(fetch_page(path))
        except Exception as error: return path, {'error': str(error)}
    with ThreadPoolExecutor(max_workers=3) as pool:
        extra = dict(pool.map(load, paths))
    for path, value in extra.items():
        print(path, len(value) if isinstance(value, list) else value)
    for row in rows:
        if len(row['products']) < 20:
            groups = [extra[p] for p in FALLBACKS.get(row['slug'], []) if isinstance(extra.get(p),list)]
            merged, seen = [], set()
            for index in range(max([len(g) for g in groups] or [0])):
                for group in groups:
                    if index < len(group) and group[index]['sourceUrl'] not in seen:
                        merged.append(group[index])
                        seen.add(group[index]['sourceUrl'])
            row['products'] = merged
        print('TOTAL', row['slug'], len(row['products']))
    (CACHE/'complete-candidates.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')



def build_catalog():
    rows = json.loads((CACHE/'complete-candidates.json').read_text(encoding='utf-8'))
    # The client-rendered watch list is a separately recorded factual snapshot.
    watch = json.loads((ROOT/'scripts'/'watch-reference.json').read_text(encoding='utf-8'))
    if watch['referenceDate'] != REFERENCE_DATE: raise ValueError('Watch snapshot date mismatch')
    for row in rows:
        if row['slug'] == 'dong-ho': row['products'] = watch['products']
    used, catalog = set(), []
    for row in rows:
        candidates = []
        for product in row['products']:
            if product['slug'] in used: continue
            used.add(product['slug'])
            candidates.append(product)
            if len(candidates) == 20: break
        if len(candidates) != 20: raise RuntimeError(row['slug'] + ' has fewer than 20 unique referenced products')
        catalog.append({'slug':row['slug'], 'name':row['name'], 'sourceUrl':row['sourceUrl'], 'products':candidates})

    destination = ROOT/'public'/'images'/'catalog'
    destination.mkdir(parents=True,exist_ok=True)
    def download(task):
        category, product = task
        prefix = product['slug']
        existing = list(destination.glob(prefix + '.*'))
        if existing:
            target = existing[0]
        else:
            last_error = None
            for attempt in range(3):
                try:
                    with urlopen(Request(product['sourceImageUrl'],headers=HEADERS),timeout=35) as response:
                        mime = response.headers.get_content_type()
                        content = response.read()
                    ext = {'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','image/avif':'.avif'}.get(mime)
                    if not ext or len(content) < 300: raise ValueError('Invalid image payload: ' + mime)
                    target = destination/(prefix+ext)
                    target.write_bytes(content)
                    break
                except Exception as error:
                    last_error = error
                    if attempt == 2: raise RuntimeError(prefix + ': ' + str(last_error)) from error
                    time.sleep(attempt+1)
        product['thumbnailUrl'] = '/images/catalog/' + target.name
        product['description'] = product['name'] + '. S\u1ea3n ph\u1ea9m thu\u1ed9c danh m\u1ee5c ' + category['name'] + ' t\u1ea1i Zentro Store.'
        product['status'] = 'PUBLISHED'
        return target.stat().st_size
    tasks = [(category,product) for category in catalog for product in category['products']]
    with ThreadPoolExecutor(max_workers=4) as pool:
        sizes = list(pool.map(download,tasks))
    payload = {
        'schemaVersion':1, 'id':'zentro-cps-2026-11-19', 'referenceDate':REFERENCE_DATE,
        'sourceName':'CellphoneS', 'sourceUrl':BASE+'/?version=2',
        'priceRegion':'Ho Chi Minh City', 'defaultStock':20,
        'categories':catalog,
    }
    data_dir = ROOT/'public'/'data'
    data_dir.mkdir(parents=True,exist_ok=True)
    (data_dir/'reference-catalog.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    mapping = {c['slug']:c['products'][0]['thumbnailUrl'] for c in catalog}
    (ROOT/'src'/'data'/'catalogCategoryImages.js').write_text(
        '// Representative images from the bundled reference catalog.\nexport const catalogCategoryImages = '+
        json.dumps(mapping,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
    print('CATALOG_READY',len(catalog),'categories',len(tasks),'products',sum(sizes),'image bytes')
    for category in catalog: print(category['slug'],len(category['products']))

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--complete', action='store_true')
    mode.add_argument('--download', action='store_true')
    args = parser.parse_args()
    if args.download: build_catalog()
    elif args.complete: complete_candidates()
    else: inspect()

