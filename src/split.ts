import { PDFDocument } from 'pdf-lib';

export async function splitPDF(pdfBuffer: ArrayBuffer, pageRange: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(pdfBuffer);
  const totalPages = pdf.getPageCount();
  
  const pageIndices = parsePageRange(pageRange, totalPages);
  
  if (pageIndices.length === 0) {
    throw new Error('No valid pages specified');
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdf, pageIndices);
  
  copiedPages.forEach((page) => {
    newPdf.addPage(page);
  });

  const pdfBytes = await newPdf.save();
  return pdfBytes;
}

function parsePageRange(range: string, totalPages: number): number[] {
  const pageIndices: number[] = [];
  const parts = range.split(',').map(s => s.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map(s => s.trim());
      const start = parseInt(startStr);
      const end = parseInt(endStr);

      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Invalid range: ${part}`);
      }

      if (start < 1 || end > totalPages || start > end) {
        throw new Error(`Invalid range: ${part}. PDF has ${totalPages} pages.`);
      }

      for (let i = start; i <= end; i++) {
        pageIndices.push(i - 1);
      }
    } else {
      const pageNum = parseInt(part);
      
      if (isNaN(pageNum)) {
        throw new Error(`Invalid page number: ${part}`);
      }

      if (pageNum < 1 || pageNum > totalPages) {
        throw new Error(`Page ${pageNum} out of range. PDF has ${totalPages} pages.`);
      }

      pageIndices.push(pageNum - 1);
    }
  }

  return Array.from(new Set(pageIndices)).sort((a, b) => a - b);
}
