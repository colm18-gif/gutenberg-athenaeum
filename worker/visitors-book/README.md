# The visitors' book service

A tiny Cloudflare Worker that keeps the signatures readers leave in the visitors' book by the entrance.
A signature is a first name or initials, a country, a book and one line from a fixed list, so there is no
free text to moderate. Names are checked against a list of unsuitable words, each reader can sign once every
ten minutes, and the book takes at most 500 signatures a day. Nothing else is stored.

## Setting it up (once)

1. Create a free Cloudflare account at https://dash.cloudflare.com/sign-up.
2. In the dashboard open **Workers & Pages** and choose a `workers.dev` subdomain when asked.
3. Create an API token: **My Profile → API Tokens → Create Token → "Edit Cloudflare Workers"** template.
   Under Account Resources choose your account. Create it and copy the token.
4. In the GitHub repository, **Settings → Secrets and variables → Actions**, add:
   - `CLOUDFLARE_API_TOKEN`: the token from step 3
   - `CLOUDFLARE_ACCOUNT_ID`: shown on the right of the Workers & Pages overview page
   - `VISITORS_BOOK_ADMIN_TOKEN` (optional): any long random password, used to remove a signature
5. In **Actions**, run **"Visitors' book service"**. It creates the storage, deploys the worker and writes
   its address into `data/visitors-book-config.js`, which switches the real visitors' book on in the library.

## Removing a signature

Each signature has an `id` (visible in `GET /entries`). With the admin token set:

    curl -X DELETE -H "Authorization: Bearer YOUR_ADMIN_TOKEN" https://library-visitors-book.YOURNAME.workers.dev/entries/ID

## Switching it off

Set `endpoint` to `''` in `data/visitors-book-config.js`; the library goes back to its invented visitors' book.
