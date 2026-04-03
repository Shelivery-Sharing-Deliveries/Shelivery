# Cloudflare R2 CORS Setup

The R2 bucket needs CORS configured to allow browser-side PUT uploads via presigned URLs.

## Option A — Cloudflare Dashboard

1. Go to **Cloudflare Dashboard → R2 → shelivery bucket → Settings → CORS Policy**
2. Add the following JSON:

```json
[
  {
    "AllowedOrigins": [
      "https://app.shelivery.com",
      "http://localhost:8081",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["Content-Type", "Cache-Control"],
    "MaxAgeSeconds": 3600
  }
]
```

## Option B — Wrangler CLI

Install wrangler if not already:
```bash
npm install -g wrangler
wrangler login
```

Create a file `r2-cors.json`:
```json
[
  {
    "AllowedOrigins": [
      "https://app.shelivery.com",
      "http://localhost:8081",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["Content-Type", "Cache-Control"],
    "MaxAgeSeconds": 3600
  }
]
```

Apply it:
```bash
wrangler r2 bucket cors put shelivery --file r2-cors.json
```

## Why this is needed

When the mobile web app (running at `http://localhost:8081`) does a `PUT` directly to the R2 presigned URL, the browser sends a CORS preflight OPTIONS request. R2 must respond with `Access-Control-Allow-Origin` for that origin, otherwise the PUT is blocked.

Note: This is separate from the CORS on your Next.js presign API endpoint (already configured).
