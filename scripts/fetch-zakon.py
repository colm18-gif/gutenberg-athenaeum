#!/usr/bin/env python3
"""Fetch the Zakon typeface (Ukraine's Ministry of Culture) and its terms, to decide whether the library may use it.

Reads mincult.gov.ua/zakon, prints the page's text (where the terms of use should be), follows any link that looks
like a download or a licence, unpacks what it gets, prints every licence or readme it finds, and reports which of
the characters the Ukrainian Reading Room needs each font has. The files go into a workflow artifact only: nothing
is committed, because the licence has to be read before the font is put in this public repository.
"""
import html, io, os, re, subprocess, sys, urllib.parse, urllib.request, zipfile

START = ['https://mincult.gov.ua/zakon', 'https://mincult.gov.ua/zakon/']
OUT = 'zakon'
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
FONT_EXT = ('.ttf', '.otf', '.woff', '.woff2')
ARCHIVE_EXT = ('.zip',)
DOC_EXT = ('.pdf', '.txt', '.md')
LOOKS_LIKE_DOWNLOAD = re.compile(r'download|завантаж|\.zip|\.ttf|\.otf|\.woff|drive\.google|dropbox|github\.com|font|шрифт', re.I)
LOOKS_LIKE_TERMS = re.compile(r'licen[cs]|ліценз|умови|terms|правил|ofl', re.I)

# What the room's lettering uses: Ukrainian, the English after it, and the punctuation of both.
NEEDED = {
    'Ukrainian capitals': 'АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ',
    'Ukrainian small': 'абвгґдеєжзиіїйклмнопрстуфхцчшщьюя',
    'Latin': 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    'Digits': '0123456789',
    'Punctuation': '.,:;!?\'"()[]-/&%№«»‘’“”–—…·•',
    'Accented Latin (names, transliteration)': 'áéíóúàèâêôçñäöüšžčÉÁ',
}

def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Language': 'uk,en;q=0.8'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.geturl(), r.headers.get('Content-Type', ''), r.read()

def text_of(page):
    page = re.sub(r'(?is)<(script|style|noscript)\b.*?</\1>', ' ', page)
    page = re.sub(r'(?i)<br\s*/?>|</(p|div|li|h\d|tr|section)>', '\n', page)
    page = html.unescape(re.sub(r'<[^>]+>', ' ', page))
    lines = [re.sub(r'[ \t\xa0]+', ' ', l).strip() for l in page.split('\n')]
    return '\n'.join(l for l in lines if l)

def links_of(page, base):
    out = []
    for href, label in re.findall(r'(?is)<a\b[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', page):
        url = urllib.parse.urljoin(base, html.unescape(href))
        out.append((url, re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', label))).strip()))
    return out

def drive_direct(url):
    m = re.search(r'drive\.google\.com/(?:file/d/|open\?id=|uc\?id=)([\w-]+)', url)
    return f'https://drive.google.com/uc?export=download&id={m.group(1)}' if m else url

def drive_folder_items(folder_id, depth=0, seen=None):
    """Files in a public Drive folder and its subfolders, through Drive's embedded folder view."""
    seen = seen if seen is not None else set()
    if folder_id in seen or depth > 3:
        return []
    seen.add(folder_id)
    _, _, data = get(f'https://drive.google.com/embeddedfolderview?id={folder_id}')
    page = data.decode('utf-8', 'replace')
    items = []
    for href, label in links_of(page, 'https://drive.google.com/'):
        sub = re.search(r'/drive/folders/([\w-]+)', href)
        f = re.search(r'/file/d/([\w-]+)', href)
        if sub:
            print(f'  folder {label!r}')
            items += drive_folder_items(sub.group(1), depth + 1, seen)
        elif f:
            print(f'  file {label!r}')
            items.append((f'https://drive.google.com/uc?export=download&id={f.group(1)}', label))
    return items

def kind_of(data):
    if data[:4] == b'%PDF': return '.pdf'
    if data[:2] == b'PK': return '.zip'
    if data[:4] in (b'OTTO',): return '.otf'
    if data[:4] in (b'\x00\x01\x00\x00', b'true'): return '.ttf'
    if data[:4] == b'wOF2': return '.woff2'
    if data[:4] == b'wOFF': return '.woff'
    return ''

def save(name, data):
    os.makedirs(OUT, exist_ok=True)
    name = re.sub(r'[^\w.\-]+', '_', name)[-120:] or 'file'
    path = os.path.join(OUT, name)
    with open(path, 'wb') as f:
        f.write(data)
    return path

def report_font(path):
    try:
        from fontTools.ttLib import TTFont
    except ImportError:
        print('  (fontTools missing: cannot check coverage)')
        return
    try:
        font = TTFont(path, fontNumber=0)
    except Exception as e:
        print(f'  could not open {path}: {e}')
        return
    names = {r.nameID: r.toUnicode() for r in font['name'].names if r.platformID in (1, 3)}
    print(f'\n== {os.path.basename(path)} ({os.path.getsize(path):,} bytes)')
    for nid, label in [(1, 'Family'), (2, 'Style'), (5, 'Version'), (0, 'Copyright'), (7, 'Trademark'),
                       (9, 'Designer'), (13, 'Licence'), (14, 'Licence URL')]:
        if nid in names:
            print(f'  {label}: {names[nid]}')
    if 'OS/2' in font:
        fs = font['OS/2'].fsType
        kinds = {0: 'installable (embedding allowed)', 2: 'restricted licence embedding',
                 4: 'preview & print embedding', 8: 'editable embedding'}
        print(f'  OS/2 fsType: {fs} ' + ', '.join(v for k, v in kinds.items() if (k == 0 and fs == 0) or (k and fs & k)))
    cmap = font.getBestCmap() or {}
    print(f'  Glyphs mapped: {len(cmap)}')
    for label, chars in NEEDED.items():
        missing = [c for c in chars if ord(c) not in cmap]
        print(f'  {label}: ' + ('all present' if not missing else 'MISSING ' + ' '.join(missing)))

def main():
    seen, pages, files = set(), [], []
    for url in START:
        try:
            final, ctype, data = get(url)
            pages.append((final, data.decode('utf-8', 'replace')))
            break
        except Exception as e:
            print(f'Could not fetch {url}: {e}')
    if not pages:
        sys.exit('The Zakon page could not be reached.')
    final, page = pages[0]
    print(f'# {final}\n')
    print(text_of(page)[:20000])
    links = links_of(page, final)
    print('\n# Links on the page')
    for url, label in links:
        print(f'  {label[:70]!r} -> {url}')

    # Follow one level: downloads, and pages that look like terms of use.
    for url, label in links:
        key = url.split('#')[0]
        if key in seen or not key.startswith('http'):
            continue
        hay = url + ' ' + label
        if not (LOOKS_LIKE_DOWNLOAD.search(hay) or LOOKS_LIKE_TERMS.search(hay)):
            continue
        seen.add(key)
        folder = re.search(r'drive\.google\.com/drive/folders/([\w-]+)', key)
        if folder:
            print(f'\n# Drive folder {key}')
            try:
                for furl, flabel in drive_folder_items(folder.group(1)):
                    _, _, fdata = get(furl)
                    name = flabel if os.path.splitext(flabel)[1] else flabel + kind_of(fdata)
                    files.append(save(name, fdata))
                    print(f'  saved {name} ({len(fdata):,} bytes)')
            except Exception as e:
                print(f'  could not list the folder: {e}')
            continue
        try:
            got, ctype, data = get(drive_direct(key))
        except Exception as e:
            print(f'\nCould not fetch {key}: {e}')
            continue
        lower = urllib.parse.urlparse(got).path.lower()
        print(f'\n# Fetched {got} ({ctype}, {len(data):,} bytes)')
        if 'html' in ctype and not lower.endswith(FONT_EXT + ARCHIVE_EXT + DOC_EXT):
            body = data.decode('utf-8', 'replace')
            if LOOKS_LIKE_TERMS.search(hay) or LOOKS_LIKE_TERMS.search(body[:200000]):
                print(text_of(body)[:12000])
            continue
        name = os.path.basename(lower) or label or 'download'
        if not os.path.splitext(name)[1]:
            name = (label or name) + kind_of(data)
        files.append(save(name, data))

    # Unpack archives and gather fonts and documents.
    fonts, docs = [], []
    for path in list(files):
        if zipfile.is_zipfile(path):
            with zipfile.ZipFile(path) as z:
                print(f'\n# Contents of {os.path.basename(path)}')
                for info in z.infolist():
                    print(f'  {info.file_size:>10,}  {info.filename}')
                z.extractall(os.path.join(OUT, os.path.splitext(os.path.basename(path))[0]))
    for root, _, names in os.walk(OUT):
        for n in names:
            p = os.path.join(root, n)
            if n.lower().endswith(FONT_EXT):
                fonts.append(p)
            elif n.lower().endswith(DOC_EXT) or LOOKS_LIKE_TERMS.search(n) or n.upper().startswith('README'):
                docs.append(p)

    for p in sorted(docs):
        print(f'\n# Document: {p}')
        if p.lower().endswith('.pdf'):
            try:
                print(subprocess.run(['pdftotext', '-layout', p, '-'], capture_output=True, text=True, timeout=60).stdout[:15000])
            except Exception as e:
                print(f'  (pdftotext failed: {e})')
        else:
            with open(p, 'rb') as f:
                print(f.read(15000).decode('utf-8', 'replace'))

    if not fonts:
        print('\nNo font files were found. The download may sit behind a form or a script: see the links above.')
    for p in sorted(fonts):
        report_font(p)

if __name__ == '__main__':
    main()
