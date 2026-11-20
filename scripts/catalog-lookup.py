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
def ws_index(arg):
    cat = category_title(arg)
    members = []
    for q in query_all('uk.wikisource.org', 'categorymembers', list='categorymembers', cmtitle=cat, cmlimit='max'):
        members += q.get('categorymembers', [])
        if len(members) >= 4000: break
    have = library_pages()
    print(f'\n== ws-index {cat}  ({len(members)} pages)')
    titles = [m['title'] for m in members]
    for i in range(0, len(titles), 50):
        batch = titles[i:i + 50]; links = {t: [] for t in batch}
        for q in query_all('uk.wikisource.org', 'pages', prop='links', titles='|'.join(batch), pllimit='max'):
            for page in q.get('pages', []):
                links.setdefault(page['title'], []).extend(l['title'] for l in page.get('links', []))
        for t in batch:
            got = links.get(t, [])
            texts = [l for l in got if ':' not in l.split('/')[0]][:4]
            authors = sorted({l.split(':', 1)[1] for l in got if l.startswith('Автор:')})[:3]
            mark = '*' if any(x in have for x in texts) or t in have else ' '
            print(f"  {mark} {t}  ->  {' | '.join(texts) or '(no text page linked)'}  ||  {', '.join(authors) or '?'}")
def wikimedia(line):
    try:
        if line.startswith('ws-index '): ws_index(line[9:]); return
        if line.startswith('ws! '):
            page = line[4:].strip()
            data = api('uk.wikisource.org', action='parse', page=page, prop='links|categories', redirects=1).get('parse', {})
            print(f'\n== {line}  ({data.get("title")})')
            for l in data.get('links', []): print(f"  [{l.get('ns')}] {l['title']}{'' if l.get('exists') else '  (no page)'}")
            for c in data.get('categories', []): print(f"  category: {c.get('category')}")
        elif line.startswith('ws? '):
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
    if line.startswith(('ws-index ', 'ws ', 'ws? ', 'ws! ', 'commons? ')): wikimedia(line); continue
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
