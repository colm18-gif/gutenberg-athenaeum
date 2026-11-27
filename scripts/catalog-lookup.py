# Looks up books in Project Gutenberg's own catalogue (cache/epub/feeds/pg_catalog.csv), which is more reliable than
# Gutendex for finding a book's number. Each line of scripts/catalog-queries.txt is
#   title pattern ; author pattern ; language     (patterns are case-insensitive regular expressions; blank = any)
# and every matching text is printed with its number, title, authors and language. A line '= 8613 8614 ...' prints each
# of those numbers with its type (Text, Sound...) and the texts with the same title. Run by the Catalogue lookup workflow.
#   subject? <pattern>  a search of the catalogue's own subject headings and bookshelves (up to 40 texts)
# Two more kinds of line look beyond Gutenberg, for the rooms whose books or pictures come from Wikimedia:
#   ws <page>       a page on Ukrainian Wikisource (an author's page, Автор:…, or a work): the pages it links to
#   ws? <words>     a search of Ukrainian Wikisource's texts
#   ws! <page>      every link on a Ukrainian Wikisource page, in every namespace (author pages too), and its categories
#   commons? <words>  a search of Wikimedia Commons's files, with each file's size and licence
#   ws-index <category or link>  every page in a Ukrainian Wikisource category (a w.wiki short link is followed): for
#                   an index (Індекс:…, one physical book, proofread or validated by Wikisource's volunteers) the page
#                   where its text is read and its author; for a version page, the editions it lists. A book the
#                   library already has (a ws: page in data/new-books*.js) is marked *. Wikimedia Ukraine's advice,
#                   20 November 2026: whole books are found more reliably from the index categories than from titles.
# Each ws command can take another Wikisource with @ and its language code (ws?@hi कबीर, ws-index@ur …); Ukrainian is the
# default. And for a Wikisource not yet used:
#   ws-survey@<lang>  its size, its namespaces, every author page with the number of texts it links to (most first), its
#                   index pages (whole proofread books), and the templates and categories on a few texts, to learn how it
#                   marks a text as public domain (for a Hindi or Urdu room, 27 November 2026)
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
    # Sent as a POST: fifty long Cyrillic page names are too long for an address (414).
    req = urllib.request.Request(f'https://{host}/w/api.php', data=urllib.parse.urlencode(params).encode(), headers=UA)
    return json.loads(urllib.request.urlopen(req, timeout=60).read().decode('utf-8'))
def category_title(arg):
    arg = arg.strip()
    if arg.startswith('http'):
        final = urllib.request.urlopen(urllib.request.Request(arg, headers=UA), timeout=60).geturl()
        parsed = urllib.parse.urlparse(final)
        arg = urllib.parse.unquote(parsed.path.split('/wiki/', 1)[1]) if '/wiki/' in parsed.path else urllib.parse.parse_qs(parsed.query).get('title', [''])[0]
    return arg.replace('_', ' ')
def query_all(host, key, **params):
    out, cont = [], {}
    while True:
        data = api(host, action='query', **params, **cont)
        q = data.get('query', {})
        out.append(q)
        if 'continue' not in data: return out
        cont = {k: v for k, v in data['continue'].items()}
def library_pages():
    pages = set()
    for name in ['data/new-books.js', 'data/new-books-wing.js']:
        try: pages |= {m.replace('_', ' ') for m in re.findall(r"'ws:([^']+)'", open(name, encoding='utf-8').read())}
        except OSError: pass
    return pages
def ws_index(arg, host='uk.wikisource.org'):
    cat = category_title(arg)
    author = namespace_names(host).get(namespace_id(host, 'Author', 102), 'Автор') + ':'
    members = []
    for q in query_all(host, 'categorymembers', list='categorymembers', cmtitle=cat, cmlimit='max'):
        members += q.get('categorymembers', [])
        if len(members) >= 4000: break
    have = library_pages()
    print(f'\n== ws-index {cat}  ({len(members)} pages)')
    titles = [m['title'] for m in members]
    for i in range(0, len(titles), 50):
        batch = titles[i:i + 50]; links = {t: [] for t in batch}
        for q in query_all(host, 'pages', prop='links', titles='|'.join(batch), pllimit='max'):
            for page in q.get('pages', []):
                links.setdefault(page['title'], []).extend(l['title'] for l in page.get('links', []))
        for t in batch:
            got = links.get(t, [])
            texts = [l for l in got if ':' not in l.split('/')[0]][:4]
            authors = sorted({l.split(':', 1)[1] for l in got if l.startswith(author)})[:3]
            mark = '*' if any(x in have for x in texts) or t in have else ' '
            print(f"  {mark} {t}  ->  {' | '.join(texts) or '(no text page linked)'}  ||  {', '.join(authors) or '?'}")
NAMESPACES = {}
def namespace_names(host):
    if host not in NAMESPACES:
        data = api(host, action='query', meta='siteinfo', siprop='namespaces')
        spaces = data['query']['namespaces'].values()
        NAMESPACES[host] = {int(v['id']): v.get('name', '') for v in spaces}
        CANONICAL[host] = {v.get('canonical'): int(v['id']) for v in spaces if v.get('canonical')}
    return NAMESPACES[host]
CANONICAL = {}
def namespace_id(host, canonical, default):
    namespace_names(host)
    return CANONICAL[host].get(canonical, default)
def ws_survey(host):
    stats = api(host, action='query', meta='siteinfo', siprop='statistics|general')['query']
    names = namespace_names(host)
    print(f"\n== ws-survey {host}  ({stats['general'].get('sitename')}; {stats['statistics'].get('articles')} content pages, {stats['statistics'].get('pages')} pages in all)")
    for k in sorted(names):
        if k >= 100 or k in (0, 14): print(f'  namespace {k}: {names[k] or "(main)"}')
    authors = []
    for q in query_all(host, 'allpages', list='allpages', apnamespace=namespace_id(host, 'Author', 102), aplimit='max'):
        authors += [p['title'] for p in q.get('allpages', [])]
    counts = {}
    for i in range(0, len(authors), 50):
        batch = authors[i:i + 50]
        for q in query_all(host, 'pages', prop='links', titles='|'.join(batch), plnamespace=0, pllimit='max'):
            for page in q.get('pages', []):
                counts[page['title']] = counts.get(page['title'], 0) + len(page.get('links', []))
    ranked = sorted(authors, key=lambda a: -counts.get(a, 0))
    print(f'  {len(authors)} author pages; by the number of texts each links to:')
    for a in ranked[:200]: print(f'    {counts.get(a, 0):>5}  {a}')
    indexes = []
    for q in query_all(host, 'allpages', list='allpages', apnamespace=namespace_id(host, 'Index', 106), aplimit='max'):
        indexes += [p['title'] for p in q.get('allpages', [])]
    print(f'  {len(indexes)} index pages (whole books, proofread page by page):')
    for t in indexes[:300]: print(f'    {t}')
    samples = []
    for a in ranked[:12]:
        data = api(host, action='query', prop='links', titles=a, plnamespace=0, pllimit=3).get('query', {}).get('pages', [])
        if data and data[0].get('links'): samples.append(data[0]['links'][0]['title'])
    for t in samples[:8]:
        data = api(host, action='query', prop='templates|categories|info', titles=t, tllimit='max', cllimit='max').get('query', {}).get('pages', [{}])[0]
        print(f"  sample text: {t}  ({data.get('length', '?')} bytes)")
        print(f"    templates: {', '.join(x['title'] for x in data.get('templates', [])[:25])}")
        print(f"    categories: {', '.join(x['title'] for x in data.get('categories', [])[:15])}")
WS = re.compile(r'^(ws-index|ws-survey|ws\?|ws!|ws)(?:@([a-z-]+))?(?:\s+(.*))?$')
def wikimedia(line):
    try:
        if line.startswith('commons? '): return commons(line)
        m = WS.match(line)
        cmd, lang, arg = m.group(1), m.group(2) or 'uk', (m.group(3) or '').strip()
        host = f'{lang}.wikisource.org'
        if cmd == 'ws-survey': ws_survey(host); return
        if cmd == 'ws-index': ws_index(arg, host); return
        if cmd == 'ws!':
            data = api(host, action='parse', page=arg, prop='links|categories', redirects=1).get('parse', {})
            print(f'\n== {line}  ({data.get("title")})')
            for l in data.get('links', []): print(f"  [{l.get('ns')}] {l['title']}{'' if l.get('exists') else '  (no page)'}")
            for c in data.get('categories', []): print(f"  category: {c.get('category')}")
        elif cmd == 'ws?':
            hits = api(host, action='query', list='search', srsearch=arg, srlimit=25, srnamespace=0)['query']['search']
            print(f'\n== {line}  ({len(hits)})')
            for h in hits: print(f"  {h['title']}  |  {h.get('wordcount', 0)} words")
        else:
            data = api(host, action='parse', page=arg, prop='links', redirects=1)
            links = [l['title'] for l in data.get('parse', {}).get('links', []) if l.get('ns') == 0 and l.get('exists')]
            print(f'\n== {line}  ({len(links)} linked texts)')
            for t in links: print(f'  {t}')
    except Exception as error: print(f'\n== {line}  failed: {error}')
def commons(line):
    data = api('commons.wikimedia.org', action='query', generator='search', gsrsearch=line[9:], gsrnamespace=6, gsrlimit=20,
               prop='imageinfo', iiprop='size|extmetadata', iiextmetadatafilter='LicenseShortName|Artist|DateTimeOriginal')
    pages = sorted(data.get('query', {}).get('pages', []), key=lambda p: p.get('index', 0))
    print(f'\n== {line}  ({len(pages)})')
    for p in pages:
        info = (p.get('imageinfo') or [{}])[0]; meta = info.get('extmetadata', {})
        lic = meta.get('LicenseShortName', {}).get('value', '?'); date = re.sub('<[^>]+>', '', meta.get('DateTimeOriginal', {}).get('value', ''))[:30]
        print(f"  {p['title']}  |  {info.get('width')}x{info.get('height')}  |  {lic}  |  {date}")
raw = fetch_catalogue()
every = list(csv.DictReader(io.StringIO(raw)))
rows = [r for r in every if r.get('Type') == 'Text']
by_number = {r['Text#']: r for r in every}
print(f'{len(rows)} texts in the catalogue')
for line in open('scripts/catalog-queries.txt', encoding='utf-8'):
    line = line.strip()
    if not line or line.startswith('#'): continue
    if line.startswith('commons? ') or WS.match(line): wikimedia(line); continue
    if line.startswith('subject? '):
        # Gutenberg's own subject headings and bookshelves, for books about a place whose titles don't name it
        pattern = line[9:].strip()
        hits = [r for r in rows if re.search(pattern, r.get('Subjects', '') + ' | ' + r.get('Bookshelves', ''), re.I)]
        print(f'\n== {line}  ({len(hits)})')
        for r in hits[:40]:
            print(f"  {r['Text#']:>6}  {r['Title'][:90]!r}  |  {r['Authors'][:40]}  |  {r['Language']}  |  {r.get('Subjects', '')[:90]}")
        continue
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
