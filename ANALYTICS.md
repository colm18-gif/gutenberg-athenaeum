# First analytics layer — Library After Dark

Baseline: clean `main` at `ddc63aa` in the existing checkout. This separate copy was used for all changes. No account, payment details or credentials were changed. The analytics commits were rebased onto the newer pre-analytics site commit `6a1e1c3` and published to GitHub `main` on 15 September 2026. The live homepage and tracker file were verified as serving the new code.

The site is static HTML/CSS/JavaScript with Three.js loaded when the visitor enters. `CNAME` points to `libraryafterdark.space`; the Git remote is `colm18-gif/gutenberg-athenaeum`. The live site responded with a GitHub.com server header, consistent with GitHub Pages.

## Activate

1. The owner supplied the site-specific Plausible URL and initialization snippet; both are now configured in `analytics.js`. No account token or payment details were used. Tracking is restricted to the exact production hostname (not localhost or file previews).
2. A concise Plausible disclosure was added in the settings panel. Review it alongside any separate site privacy notice before publishing. Plausible custom events count toward billable usage, so monitor volume and costs.
3. GitHub deployment is complete. On 15 September 2026 the owner's Plausible dashboard showed pageviews and ingested `Library Entered`, `Room Explored`, `Librarian Talked To`, and `Secret Discovered` goals. This verifies both the pageview tracker and live custom-event ingestion; it does not prove every less-frequent interaction has occurred yet.
4. The 12 library event goals are registered in Plausible. Define `room` as a custom property if you want room breakdowns. The tracker now queues early clicks before its async script finishes loading and accepts only the fixed room labels used by the current game.

## Measurement definitions

Plausible's automatic pageview is the visit baseline. `Library Entered` occurs when the 3D experience actually starts. `Room Explored` records each coarse room at most once per page session, with only a fixed room label. Book events distinguish picked up, opened, first forward page turn (`Reading Started`) and returned; no title, ID, text, reading progress or duration is transmitted. `Secret Discovered` records a new mystery in the site's existing local progress, not its ID. `Librarian Talked To`, `Cat Petted` and `Rabbit Door Entered` occur on their supported interactions. `Engaged 5 Minutes` and `Engaged 10 Minutes` count visible time in exploration or reader, once each per page session; they are thresholds, **not average session duration**. Tab-hidden, intro, pause, settings, journal and chat time is excluded.

No patron/support/checkout/purchase interface exists in this checkout, so no commercial funnel or revenue event is fabricated. Future conversion completion should be recorded only after a verified payment confirmation, never merely on a click. No visitor identifier, cookies, IP, coordinates, search text, book titles, conversation choices or personal data are deliberately sent as custom event properties. Existing localStorage progress is unchanged and is not sent to Plausible.

Suggested 90-day weekly view: pageviews/unique visitors → Library Entered → Room Explored → Book Picked Up → Book Opened → Reading Started → Engaged 5 Minutes; compare week-over-week once the tracker is active. These are event counts, not necessarily a unique-person funnel without Plausible goal conversion reports. Record the activation date so pre-activation days are not misread as zero activity.

Rollback: revert the analytics commits, returning to the current pre-analytics site commit `6a1e1c3`. The earlier baseline `ddc63aa` remains available, but reverting all the way to it would also remove six unrelated site improvements. The original checkout remains untouched.
