# SiteWhy

Tells you whether two URLs are same-origin, same-site or cross-site, and shows the Public Suffix List rule behind the registrable domain.

Open `app.html` (GitHub Pages). Everything runs client side. `psl-rules.txt` is the list compiled for the page (ASCII/punycode, section-tagged).

## Testing
- `oracle.py <seed> <n> <out>` builds hostnames from real list rules (plain, wildcard, exception, plus extra labels and unlisted endings) and records what the Python `tld` 0.13.2 package returns, with and without private domains. `test-engine.js` compares `engine.js`.
- Seeds 1-6, 120,000 lines, 112,907 compared (tld rejects hosts under unlisted endings), 0 mismatches. Seed 1 was also used to fix the oracle's handling of punycode (tld's list uses Unicode labels).
- `test-doc.js`: the three tables and the github.io example from web.dev "Same-site and same-origin" (fetched), 8 cases, 0 failures.

## Limits
- tld and this app read the same list file (`psl.dat`, version 2026-03-06, bundled with tld, not fetched from publicsuffix.org). The test checks the algorithm, not the data.
- tld rejects hosts under unlisted endings; the app applies the list's default rule `*` (the ending is the suffix). Not oracle-tested.
- IP addresses use the host as the site. That is my reading of the standards, not checked.
- tld returns the host itself when it equals a public suffix; the app reports no registrable domain. The test maps one onto the other.
