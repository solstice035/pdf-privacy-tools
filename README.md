# 🔒 PDF Privacy Tools

> **Built by [The Foundry](https://github.com/solstice035/the-foundry)**, an autonomous build pipeline I run. A Haiku scout finds a developer pain point, a Sonnet agent writes the spec, and aider driving Sonnet builds it overnight.
>
> This repo was produced end to end by that pipeline. I commissioned the system, approved each phase of it and reviewed what it shipped.

A privacy-first, browser-based PDF toolkit that lets you merge, split, reorder, and extract text from PDF files — entirely client-side with **zero server uploads**. Your files never leave your device.

## 🌟 Features

- **Merge PDFs**: Combine multiple PDF files into a single document
- **Split PDFs**: Extract specific pages or page ranges from any PDF
- **Page Thumbnails**: Visual preview of all pages in your PDFs
- **Text Extraction**: Extract text content from PDF files
- **Dark Mode**: Toggle between light and dark themes
- **Drag & Drop**: Easy file upload with drag-and-drop support
- **100% Client-Side**: All processing happens in your browser
- **Privacy First**: Your files never leave your device
- **No Installation**: Works directly in your web browser

## 🔐 Privacy Promise

All PDF processing happens entirely in your browser using JavaScript. Your files are **never uploaded to any server**. This application works completely offline after the initial page load.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/solstice035/pdf-privacy-tools.git
   cd pdf-privacy-tools
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the dev server, then open the local URL Vite prints:

   ```bash
   npm run dev
   ```

### Build

```bash
npm run build     # type-check with tsc, then build to dist/
npm run preview   # serve the production build locally
```

## 🧱 Stack

TypeScript and Vite, with [pdf-lib](https://pdf-lib.js.org/) and [PDF.js](https://mozilla.github.io/pdf.js/) (`pdfjs-dist`) for the PDF work.
