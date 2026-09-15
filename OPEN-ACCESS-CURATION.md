# Open-access acquisitions

The six source channels are configured in `data/open-access-catalog.json`. They are an acquisitions layer, not a visitor-facing search catalogue. A book only reaches the shelves when its record has `"status": "published"`; candidate and rejected records remain invisible.

## Adding a reviewed book

1. Check the exact edition, translation, illustrations and cover separately.
2. Accept only `Public Domain`, `CC0`, `CC BY`, or `CC BY-SA`. Avoid borrow-only records and licences that prohibit commercial use or adaptations.
3. Save a normalized UTF-8 text in `texts/open-access/`, or provide reviewed direct text URLs. Do not point at a search result, viewer page, borrowed item, EPUB or PDF and call it plain text.
4. Add a record to `books` with a unique numeric ID above 900000, title, author, category, source, source URL, licence, licence URL, room, fame and text path.
5. Run `node build-local-books.mjs` and `node open-access.test.cjs`.

```json
{
  "id": 900001,
  "title": "Reviewed title",
  "author": "Author",
  "category": "Poetry",
  "fame": 15,
  "source": "wikisource",
  "sourceUrl": "https://en.wikisource.org/wiki/...",
  "licence": "Public Domain",
  "licenceUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
  "room": "garden",
  "textPath": "texts/open-access/reviewed-title.txt",
  "status": "published"
}
```

Room values keep discovery spatial: `gothic`, `inquiry`, `chart`, `drawing`, `study`, `garden`, `contested`, `returning`, `quiet`, `unread`, `repository`, or `mainhall`. The source's `defaultRoom` is editorial guidance only; every published item still needs a deliberate room decision.

Open Library remains metadata/cover enrichment unless an associated unrestricted full-text edition has independently passed review. LibriVox links attach to an existing print edition through `enrichments`; recordings are not silently substituted for text.
