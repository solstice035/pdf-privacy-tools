# PDF Privacy Tools 🔒

> **Built by [The Foundry](https://github.com/solstice035/the-foundry)**, an autonomous build pipeline I run. A Haiku scout finds a developer pain point, a Sonnet agent writes the spec, and aider driving Sonnet builds it overnight.
>
> This repo was produced end to end by that pipeline. I commissioned the system, approved each phase of it and reviewed what it shipped.

A browser page that merges PDFs, splits out page ranges, shows page thumbnails and extracts text. The files are read and written in the browser with [pdf-lib](https://pdf-lib.js.org/) and [PDF.js](https://mozilla.github.io/pdf.js/), and never uploaded anywhere.

The Foundry's first build, on 18 February 2026. It took 7 minutes 20 seconds and cost $0.47.

## Running it

```bash
git clone https://github.com/solstice035/pdf-privacy-tools.git
cd pdf-privacy-tools
npm install
npm run dev       # then open the URL Vite prints
```

```bash
npm run build     # type-check, then build to dist/
npm run preview   # serve the built version
```

Node 18 or newer. There's no hosted copy.

## What it does

Merge several PDFs into one, split a page range out of a PDF, preview pages as thumbnails, and pull the text out of a file. Drag and drop, and a dark mode that remembers itself in `localStorage`.

## Privacy, precisely

Your PDFs stay in the browser. Nothing is uploaded, and there's no server to upload to.

Two qualifications, so the promise is the right shape:

- Thumbnails and text extraction load the PDF.js worker from `cdnjs.cloudflare.com` the first time you use them, so the page isn't fully offline on a cold load. The request fetches a script; your file isn't part of it.
- An earlier version of this README claimed the page reorders pages. It doesn't. Merge, split, thumbnails and extract are the four things it does.

## Known issue: an old PDF.js

It pins `pdfjs-dist` 3.11.174, which is affected by [CVE-2024-4367](https://nvd.nist.gov/vuln/detail/CVE-2024-4367): a crafted PDF can run JavaScript in the page that opens it. The fix is in PDF.js 4.2.67 and this hasn't been upgraded, because version 4 moves the worker to an `.mjs` build and changes the API.

For a tool whose reason to exist is handling documents you don't want to send to a server, opening an untrusted PDF is exactly the case that matters. Until it's upgraded, run it locally and treat it as a utility for your own files.

## Stack

TypeScript and Vite. pdf-lib writes, PDF.js reads.

## Licence

MIT. See [LICENSE](LICENSE).
