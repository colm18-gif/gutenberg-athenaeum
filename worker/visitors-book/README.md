# The visitors' book service

A tiny Cloudflare Worker that keeps the signatures readers leave in the visitors' book by the entrance.
A signature is a first name or initials, a country, a book, one line from a fixed list and, if the reader
likes, a few words of their own (at most 200 characters). Their own words are shown at once after a filter:
no unsuitable words, no links, no email addresses, no long numbers. Names are checked against the same list
of unsuitable words, each reader can sign once every ten minutes, and the book takes at most 500 signatures
a day. Nothing else is stored.

Readers can also **write to the librarian** from the same dialog (`/message`). A letter is private and is never
shown in the book: it is kept for the owner's inbox page, `librarian.html` on the site, and emailed as well
when email is set up (below). A reader may give an email address for a reply; it is kept only with the letter.
At most 60 letters a day are taken, and one every three minutes from the same place.

The same worker keeps **reading cards** (`/card`), so a reader can carry their place in each book to their other
devices without an account: a card is a code of four words and two digits, stored only as a hash, holding a book
number, a fraction and a time for each book. A card is forgotten after 400 days without use.

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

## The librarian's inbox

Open `https://libraryafterdark.space/librarian.html` and enter the `VISITORS_BOOK_ADMIN_TOKEN` password. It lists
the letters (with a reply link where the reader gave an address) and the book's latest signatures, and either can
be removed there. The page is not linked from the library and asks search engines not to index it.

## Emailing letters to the librarian (optional)

Letters are emailed through Cloudflare Email Routing, which needs the site's domain to use Cloudflare for its DNS.

1. In the Cloudflare dashboard, open the domain, then **Email → Email Routing**, and enable it (Cloudflare adds the
   DNS records it needs).
2. Under **Destination addresses**, add the address letters should go to, and click the link in the email
   Cloudflare sends to verify it.
3. In the GitHub repository, **Settings → Secrets and variables → Actions**, add:
   - `LIBRARIAN_EMAIL`: that verified address
   - `LIBRARIAN_EMAIL_FROM`: a sender on the same domain, for example `librarian@libraryafterdark.space`
4. Run **"Visitors' book service"** again. Each letter then arrives as an email, with Reply-To set to the reader's
   address when they gave one. If sending fails, the letter is still kept for the inbox page.

## Removing a signature

Each signature has an `id` (visible in `GET /entries`). With the admin token set:

    curl -X DELETE -H "Authorization: Bearer YOUR_ADMIN_TOKEN" https://library-visitors-book.YOURNAME.workers.dev/entries/ID

## Switching it off

Set `endpoint` to `''` in `data/visitors-book-config.js`; the library goes back to its invented visitors' book.
