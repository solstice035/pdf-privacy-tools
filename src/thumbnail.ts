import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFFile {
  name: string;
  data: ArrayBuffer;
}

export async function renderThumbnails(files: PDFFile[], container: HTMLElement): Promise<void> {
  container.innerHTML = '';

  for (const file of files) {
    try {
      const loadingTask = pdfjsLib.getDocument({ data: file.data });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.3 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        const thumbnailItem = document.createElement('div');
        thumbnailItem.className = 'thumbnail-item';

        canvas.className = 'thumbnail-canvas';
        
        const label = document.createElement('div');
        label.className = 'thumbnail-label';
        label.textContent = `${file.name} - Page ${pageNum}`;

        thumbnailItem.appendChild(canvas);
        thumbnailItem.appendChild(label);
        container.appendChild(thumbnailItem);
      }
    } catch (error) {
      console.error(`Error rendering thumbnails for ${file.name}:`, error);
    }
  }
}

export function clearThumbnails(container: HTMLElement): void {
  container.innerHTML = '';
}
