# Looks up books in Project Gutenberg's own catalogue (cache/epub/feeds/pg_catalog.csv), which is more reliable than
# Gutendex for finding a book's number. Each line of scripts/catalog-queries.txt is
#   title pattern ; author pattern ; language     (patterns are case-insensitive regular expressions; blank = any)
# and every matching text is printed with its number, title, authors and language. A line '= 8613 8614 ...' prints each
# of those numbers with its type (Text, Sound...) and the texts with the same title. Run by the Catalogue lookup workflow.
# Two more kinds of line look beyond Gutenberg, for the rooms whose books or pictures come from Wikimedia:
#   ws <page>       a page on Ukrainian Wikisource (an author's page, Автор:…, or a work): the pages it links to
#   ws? <words>     a search of Ukrainian Wikisource's texts
#   commons? <words>  a search of Wikimedia Commons's files, with each file's size and licence
import csv, io, json, re, sys, urllib.parse, urllib.request
# gutenberg.org sometimes refuses GitHub's runners (503) for a while; its mirrors carry the same file.
def fetch_catalogue():
    for url in ['https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv', 'https://gutenberg.pglaf.org/cache/epub/feeds/pg_catalog.csv',
                'https://aleph.gutenberg.org/cache/epub/feeds/pg_catalog.csv']:
        try: return urllib.request.urlopen(url, timeout=120).read().decode('utf-8')
        except Exception as error: print(f'{url}: {error}')
    sys.exit('The catalogue could not be fetched from gutenberg.org or its mirrors.')
UA = {'User-Agent': 'LibraryAfterDark/1.0 (https://libraryafterdark.space; catalogue lookup)'}
def api(host, **params):
    params.update(format='json', formatversion='2')
    req = urllib.request.Request(f'https://{host}/w/api.php?' + urllib.parse.urlencode(params), headers=UA)
    return json.loads(urllib.request.urlopen(req, timeout=60).read().decode('utf-8'))
def wikimedia(line):
    try:
        if line.startswith('ws? '):
            hits = api('uk.wikisource.org', action='query', list='search', srsearch=line[4:], srlimit=25, srnamespace=0)['query']['search']
            print(f'\n== {line}  ({len(hits)})')
            for h in hits: print(f"  {h['title']}  |  {h.get('wordcount', 0)} words")
        elif line.startswith('ws '):
            page = line[3:].strip()
            data = api('uk.wikisource.org', action='parse', page=page, prop='links', redirects=1)
            links = [l['title'] for l in data.get('parse', {}).get('links', []) if l.get('ns') == 0 and l.get('exists')]
            print(f'\n== {line}  ({len(links)} linked texts)')
            for t in links: print(f'  {t}')
        elif line.startswith('commons? '):
            data = api('commons.wikimedia.org', action='query', generator='search', gsrsearch=line[9:], gsrnamespace=6, gsrlimit=20,
                       prop='imageinfo', iiprop='size|extmetadata', iiextmetadatafilter='LicenseShortName|Artist|DateTimeOriginal')
            pages = sorted(data.get('query', {}).get('pages', []), key=lambda p: p.get('index', 0))
            print(f'\n== {line}  ({len(pages)})')
            for p in pages:
                info = (p.get('imageinfo') or [{}])[0]; meta = info.get('extmetadata', {})
                lic = meta.get('LicenseShortName', {}).get('value', '?'); date = re.sub('<[^>]+>', '', meta.get('DateTimeOriginal', {}).get('value', ''))[:30]
                print(f"  {p['title']}  |  {info.get('width')}x{info.get('height')}  |  {lic}  |  {date}")
    except Exception as error: print(f'\n== {line}  failed: {error}')
raw = fetch_catalogue()
every = list(csv.DictReader(io.StringIO(raw)))
rows = [r for r in every if r.get('Type') == 'Text']
by_number = {r['Text#']: r for r in every}
print(f'{len(rows)} texts in the catalogue')
for line in open('scripts/catalog-queries.txt', encoding='utf-8'):
    line = line.strip()
    if not line or line.startswith('#'): continue
    if line.startswith(('ws ', 'ws? ', 'commons? ')): wikimedia(line); continue
    if line.startswith('='):
        print(f'\n== numbers')
        for n in line[1:].split():
            r = by_number.get(n)
            if not r: print(f'  {n:>6}  not in the catalogue'); continue
            same = [t['Text#'] for t in rows if t['Title'].strip().lower() == r['Title'].strip().lower() and t['Text#'] != n][:4]
            print(f"  {n:>6}  {r.get('Type')}  {r['Title'][:70]!r}  |  {r['Authors'][:40]}  |  {r['Language']}  | texts: {' '.join(same) or '-'}")
        continue
    parts = [p.strip() for p in line.split(';')] + ['', '']
    title, author, lang = parts[:3]
    hits = [r for r in rows if (not title or re.search(title, r['Title'], re.I)) and (not author or re.search(author, r['Authors'], re.I)) and (not lang or r['Language'] == lang)]
    print(f'\n== {line}  ({len(hits)})')
    for r in hits[:25]:
        print(f"  {r['Text#']:>6}  {r['Title'][:110]!r}  |  {r['Authors'][:60]}  |  {r['Language']}")
