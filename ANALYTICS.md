# First analytics layer — Library After Dark

Baseline: clean `main` at `ddc63aa` in the existing checkout. This separate copy was used for all changes. No live files, accounts, payment details or credentials were changed.

The site is static HTML/CSS/JavaScript with Three.js loaded when the visitor enters. `CNAME` points to `libraryafterdark.space`; the Git remote is `colm18-gif/gutenberg-athenaeum`. Hosting appears consistent with GitHub Pages, but the publishing source and live response were not verified.

## Activate

1. Add `libraryafterdark.space` in your Plausible account, if you choose to use it. This may require a paid subscription; no purchase was made here.
2. From Plausible's Settings → General → Tracking → Site installation, copy the **site-specific** script URL from its snippet. Set `PLAUSIBLE_SCRIPT_URL` in `analytics.js` to that `https://plausible.io/js/pa-....js` URL. Do not use an account token. Until then, no Plausible request or analytics event is sent. Tracking is restricted to the exact production hostname (not localhost or file previews).
3. Verify the snippet with Plausible's installation tester and a live pageview, then enter the library and verify an event request in the browser network panel. Register custom event goals for the event names below in Plausible if you want them reported as conversions. Define `room` as a custom property if you want room breakdowns.
4. Review the site's privacy notice before activating a third-party provider. Plausible custom events count toward billable usage, so monitor volume and costs.
5. Publish the tested commit from this copy to the GitHub repository or apply the changes to the existing checkout, after checking that its `main` has not advanced. Verify the domain and event requests after publishing. Do not force-push.

## Measurement definitions

Plausible's automatic pageview is the visit baseline. `Library Entered` occurs when the 3D experience actually starts. `Room Explored` records each coarse room at most once per page session, with only a fixed room label. Book events distinguish picked up, opened, first forward page turn (`Reading Started`) and returned; no title, ID, text, reading progress or duration is transmitted. `Secret Discovered` records a new mystery in the site's existing local progress, not its ID. `Librarian Talked To`, `Cat Petted` and `Rabbit Door Entered` occur on their supported interactions. `Engaged 5 Minutes` and `Engaged 10 Minutes` count visible time in exploration or reader, once each per page session; they are thresholds, **not average session duration**. Tab-hidden, intro, pause, settings, journal and chat time is excluded.

No patron/support/checkout/purchase interface exists in this checkout, so no commercial funnel or revenue event is fabricated. Future conversion completion should be recorded only after a verified payment confirmation, never merely on a click. No visitor identifier, cookies, IP, coordinates, search text, book titles, conversation choices or personal data are deliberately sent as custom event properties. Existing localStorage progress is unchanged and is not sent to Plausible.

Suggested 90-day weekly view: pageviews/unique visitors → Library Entered → Room Explored → Book Picked Up → Book Opened → Reading Started → Engaged 5 Minutes; compare week-over-week once the tracker is active. These are event counts, not necessarily a unique-person funnel without Plausible goal conversion reports. Record the activation date so pre-activation days are not misread as zero activity.

Rollback: revert the analytics commit or restore the clean baseline `ddc63aa`. The original checkout remains untouched.
