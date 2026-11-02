# Domains — Fleet Track PRO website (Firebase App Hosting)

Canonical host: **https://www.fleettrackpro.co.uk**

Backend: `fleettrackpro-web` (project `stocktrackpronew-b853b`, region `europe-west4`).

## DNS (do not change unless Chad asks)

No DNS change is required for the www 301 / noindex work if apex and www already point at App Hosting (current setup).

| Host | Expected | Notes |
| ---- | -------- | ----- |
| `www.fleettrackpro.co.uk` | App Hosting custom domain (ACTIVE) | Serves the site |
| `fleettrackpro.co.uk` (apex) | App Hosting custom domain | Prefer **redirect-type** → `https://www.fleettrackpro.co.uk` with **301** |
| Preview `*.hosted.app` | Default App Hosting URL | Code sets `X-Robots-Tag: noindex, nofollow` — do not add to Search Console as a property to index |

If apex ever stops resolving to App Hosting, Chad would need DNS A/AAAA or ALIAS records as shown in the Firebase Console domain setup wizard — **only then**.

## App Hosting Console — apex → www as 301 (Chad)

If external checks show the apex returning **302** (or wrong Location) before Next.js runs, fix the domain mapping in Console (not DNS):

1. Open [Firebase Console → App Hosting](https://console.firebase.google.com/project/stocktrackpronew-b853b/apphosting).
2. Select backend **fleettrackpro-web**.
3. Open **Domains**.
4. For **fleettrackpro.co.uk** (apex):
   - Set it as a **redirect** custom domain (not a primary serving domain).
   - Redirect target: `https://www.fleettrackpro.co.uk`
   - Prefer **301** (permanent) so Search Console shows “Page with redirect” and link equity consolidates on www.
5. Keep **www.fleettrackpro.co.uk** as the serving custom domain (cert ACTIVE).
6. Wait for status to show ACTIVE, then re-check with curl from an outside machine.

Middleware also issues a one-hop **301** to `https://www.fleettrackpro.co.uk` for apex and HTTP requests, so behaviour stays correct even if the edge redirect is missing — Console 301 avoids a double hop when both fire.

## Code behaviour (summary)

- Apex / HTTP / legacy `stocktrackpro` hosts → **301** to `https://www.fleettrackpro.co.uk` + same path and query (one hop).
- `*.hosted.app` / `*.web.app` / `*.firebaseapp.com` → **200** with `X-Robots-Tag: noindex, nofollow` (no redirect).
- `robots.txt` on non-www hosts → `User-agent: *` / `Disallow: /`.
- Canonicals / OG / sitemap use `NEXT_PUBLIC_SITE_URL` (`https://www.fleettrackpro.co.uk`).

## Quick checks (outside machine)

```bash
curl -sI 'http://fleettrackpro.co.uk/pricing/?a=1'
curl -sI 'https://fleettrackpro.co.uk/pricing/?a=1'
curl -sI 'http://www.fleettrackpro.co.uk/pricing/?a=1'
# Expect: 301, Location: https://www.fleettrackpro.co.uk/pricing/?a=1

curl -sI 'https://www.fleettrackpro.co.uk/'
# Expect: 200

curl -sI 'https://fleettrackpro-web--stocktrackpronew-b853b.europe-west4.hosted.app/'
# Expect: x-robots-tag: noindex, nofollow
```
