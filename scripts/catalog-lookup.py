# Looks up books in Project Gutenberg's own catalogue (cache/epub/feeds/pg_catalog.csv), which is more reliable than
# Gutendex for finding a book's number. Each line of scripts/catalog-queries.txt is
#   title pattern | author pattern | language     (patterns are case-insensitive regular expressions; blank = any)
# and every matching text is printed with its number, title, authors and language. Run by the Catalogue lookup workflow.
import csv, io, re, sys, urllib.request
raw = urllib.request.urlopen('https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv', timeout=120).read().decode('utf-8')
rows = [r for r in csv.DictReader(io.StringIO(raw)) if r.get('Type') == 'Text']
print(f'{len(rows)} texts in the catalogue')
for line in open('scripts/catalog-queries.txt', encoding='utf-8'):
    line = line.strip()
    if not line or line.startswith('#'): continue
    parts = [p.strip() for p in line.split('|')] + ['', '']
    title, author, lang = parts[:3]
    hits = [r for r in rows if (not title or re.search(title, r['Title'], re.I)) and (not author or re.search(author, r['Authors'], re.I)) and (not lang or r['Language'] == lang)]
    print(f'\n== {line}  ({len(hits)})')
    for r in hits[:25]:
        print(f"  {r['Text#']:>6}  {r['Title'][:110]!r}  |  {r['Authors'][:60]}  |  {r['Language']}")
