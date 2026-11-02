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

## App Hosting — apex → www as 301

Apex `fleettrackpro.co.uk` is a **redirect** custom domain to `https://www.fleettrackpro.co.uk`.

App Hosting defaults redirect status to **302** if `serve.redirect.status` is omitted. Set it to **301** (no DNS change):

```bash
# Requires gcloud auth with access to project stocktrackpronew-b853b
ACCESS_TOKEN=$(gcloud auth print-access-token)
DOMAIN='projects/stocktrackpronew-b853b/locations/europe-west4/backends/fleettrackpro-web/domains/fleettrackpro.co.uk'
curl -sS -X PATCH \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://firebaseapphosting.googleapis.com/v1beta/${DOMAIN}?updateMask=serve.redirect.status" \
  -d '{"serve":{"redirect":{"uri":"https://www.fleettrackpro.co.uk","status":301}}}'
```

**Done 2 Nov 2026:** apex redirect status set to **301**. Verify:

`curl -sI 'https://fleettrackpro.co.uk/pricing/?a=1'` → `301` + `Location: https://www.fleettrackpro.co.uk/pricing/?a=1`

In Console (Settings → Domains) the apex should still show as redirect → www; the status code is on the API domain resource.

Middleware also 301s apex/HTTP to www as a safety net if the edge redirect were removed.

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
