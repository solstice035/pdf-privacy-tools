import './style.css';
import { renderThumbnails, clearThumbnails } from './thumbnail';
import { mergePDFs } from './merge';
import { splitPDF } from './split';
import { extractText } from './extract';

interface PDFFile {
  name: string;
  size: number;
  data: ArrayBuffer;
}

class PDFPrivacyTools {
  private files: PDFFile[] = [];
  private fileInput: HTMLInputElement;
  private fileDropZone: HTMLElement;
  private fileList: HTMLElement;
  private mergeButton: HTMLButtonElement;
  private splitButton: HTMLButtonElement;
  private extractButton: HTMLButtonElement;
  private pdfSelect: HTMLSelectElement;
  private extractPdfSelect: HTMLSelectElement;
  private pageRangeInput: HTMLInputElement;
  private statusMessage: HTMLElement;
  private darkModeToggle: HTMLButtonElement;

  constructor() {
    this.fileInput = document.getElementById('fileInput') as HTMLInputElement;
    this.fileDropZone = document.getElementById('fileDropZone') as HTMLElement;
    this.fileList = document.getElementById('fileList') as HTMLElement;
    this.mergeButton = document.getElementById('mergeButton') as HTMLButtonElement;
    this.splitButton = document.getElementById('splitButton') as HTMLButtonElement;
    this.extractButton = document.getElementById('extractButton') as HTMLButtonElement;
    this.pdfSelect = document.getElementById('pdfSelect') as HTMLSelectElement;
    this.extractPdfSelect = document.getElementById('extractPdfSelect') as HTMLSelectElement;
    this.pageRangeInput = document.getElementById('pageRange') as HTMLInputElement;
    this.statusMessage = document.getElementById('statusMessage') as HTMLElement;
    this.darkModeToggle = document.getElementById('darkModeToggle') as HTMLButtonElement;

    this.initializeEventListeners();
    this.initializeDarkMode();
  }

  private initializeEventListeners(): void {
    this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

    this.fileDropZone.addEventListener('click', () => this.fileInput.click());
    this.fileDropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.fileDropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    this.fileDropZone.addEventListener('drop', (e) => this.handleDrop(e));

    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => this.handleTabClick(e));
    });

    this.mergeButton.addEventListener('click', () => this.handleMerge());

    this.splitButton.addEventListener('click', () => this.handleSplit());

    this.extractButton.addEventListener('click', () => this.handleExtract());

    this.pdfSelect.addEventListener('change', () => this.handlePdfSelectChange());
    this.extractPdfSelect.addEventListener('change', () => this.updateExtractButton());

    this.pageRangeInput.addEventListener('input', () => this.updateSplitButton());

    this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
  }

  private initializeDarkMode(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      this.darkModeToggle.textContent = '☀️';
    }
  }

  private toggleDarkMode(): void {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      this.darkModeToggle.textContent = '🌙';
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      this.darkModeToggle.textContent = '☀️';
      localStorage.setItem('theme', 'dark');
    }
  }

  private handleFileSelect(e: Event): void {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      this.addFiles(Array.from(target.files));
    }
  }

  private handleDragOver(e: DragEvent): void {
    e.preventDefault();
    this.fileDropZone.classList.add('drag-over');
  }

  private handleDragLeave(e: DragEvent): void {
    e.preventDefault();
    this.fileDropZone.classList.remove('drag-over');
  }

  private handleDrop(e: DragEvent): void {
    e.preventDefault();
    this.fileDropZone.classList.remove('drag-over');
    
    if (e.dataTransfer?.files) {
      const pdfFiles = Array.from(e.dataTransfer.files).filter(
        file => file.type === 'application/pdf'
      );
      if (pdfFiles.length > 0) {
        this.addFiles(pdfFiles);
      } else {
        this.showStatus('Please drop PDF files only', 'error');
      }
    }
  }

  private async addFiles(files: File[]): Promise<void> {
    for (const file of files) {
      if (file.type !== 'application/pdf') {
        this.showStatus(`Skipped ${file.name}: not a PDF file`, 'error');
        continue;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        this.files.push({
          name: file.name,
          size: file.size,
          data: arrayBuffer
        });
      } catch (error) {
        this.showStatus(`Error loading ${file.name}`, 'error');
        console.error(error);
      }
    }

    this.updateFileList();
    this.updatePdfSelects();
    this.updateMergeButton();
    this.showStatus(`${files.length} file(s) loaded successfully`, 'success');
  }

  private updateFileList(): void {
    this.fileList.innerHTML = '';
    
    this.files.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      
      const fileInfo = document.createElement('div');
      fileInfo.className = 'file-info';
      
      const fileName = document.createElement('div');
      fileName.className = 'file-name';
      fileName.textContent = file.name;
      
      const fileSize = document.createElement('div');
      fileSize.className = 'file-size';
      fileSize.textContent = this.formatFileSize(file.size);
      
      fileInfo.appendChild(fileName);
      fileInfo.appendChild(fileSize);
      
      const removeButton = document.createElement('button');
      removeButton.className = 'file-remove';
      removeButton.textContent = '×';
      removeButton.setAttribute('aria-label', `Remove ${file.name}`);
      removeButton.addEventListener('click', () => this.removeFile(index));
      
      fileItem.appendChild(fileInfo);
      fileItem.appendChild(removeButton);
      this.fileList.appendChild(fileItem);
    });
  }

  private removeFile(index: number): void {
    this.files.splice(index, 1);
    this.updateFileList();
    this.updatePdfSelects();
    this.updateMergeButton();
    this.updateMergeThumbnails();
    this.showStatus('File removed', 'info');
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  private updatePdfSelects(): void {
    this.pdfSelect.innerHTML = '<option value="">-- Choose a PDF --</option>';
    this.files.forEach((file, index) => {
      const option = document.createElement('option');
      option.value = index.toString();
      option.textContent = file.name;
      this.pdfSelect.appendChild(option);
    });

    this.extractPdfSelect.innerHTML = '<option value="">-- Choose a PDF --</option>';
    this.files.forEach((file, index) => {
      const option = document.createElement('option');
      option.value = index.toString();
      option.textContent = file.name;
      this.extractPdfSelect.appendChild(option);
    });

    this.updateSplitButton();
    this.updateExtractButton();
  }

  private updateMergeButton(): void {
    this.mergeButton.disabled = this.files.length < 2;
    if (this.files.length >= 2) {
      this.updateMergeThumbnails();
    }
  }

  private updateSplitButton(): void {
    const pdfSelected = this.pdfSelect.value !== '';
    const pageRangeValid = this.pageRangeInput.value.trim() !== '';
    this.splitButton.disabled = !(pdfSelected && pageRangeValid);
  }

  private updateExtractButton(): void {
    this.extractButton.disabled = this.extractPdfSelect.value === '';
  }

  private async updateMergeThumbnails(): Promise<void> {
    const container = document.getElementById('mergeThumbnails');
    if (!container) return;

    clearThumbnails(container);

    if (this.files.length === 0) return;

    try {
      await renderThumbnails(this.files, container);
    } catch (error) {
      console.error('Error rendering merge thumbnails:', error);
      this.showStatus('Error rendering thumbnails', 'error');
    }
  }

  private handleTabClick(e: Event): void {
    const button = e.target as HTMLButtonElement;
    const tabName = button.getAttribute('data-tab');
    
    if (!tabName) return;

    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    button.classList.add('active');

    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    
    const targetPanel = document.getElementById(`${tabName}Tab`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }
  }

  private async handleMerge(): Promise<void> {
    if (this.files.length < 2) {
      this.showStatus('Please load at least 2 PDF files to merge', 'error');
      return;
    }

    this.mergeButton.disabled = true;
    this.showStatus('Merging PDFs...', 'info');

    try {
      const mergedPdfBytes = await mergePDFs(this.files.map(f => f.data));
      this.downloadPDF(mergedPdfBytes, 'merged.pdf');
      this.showStatus('PDFs merged successfully!', 'success');
    } catch (error) {
      console.error('Error merging PDFs:', error);
      this.showStatus('Error merging PDFs. Please try again.', 'error');
    } finally {
      this.mergeButton.disabled = false;
    }
  }

  private async handlePdfSelectChange(): Promise<void> {
    const container = document.getElementById('splitThumbnails');
    if (!container) return;

    clearThumbnails(container);

    const selectedIndex = parseInt(this.pdfSelect.value);
    if (isNaN(selectedIndex)) {
      this.updateSplitButton();
      return;
    }

    const selectedFile = this.files[selectedIndex];
    if (!selectedFile) return;

    try {
      await renderThumbnails([selectedFile], container);
    } catch (error) {
      console.error('Error rendering split thumbnails:', error);
      this.showStatus('Error rendering thumbnails', 'error');
    }

    this.updateSplitButton();
  }

  private async handleSplit(): Promise<void> {
    const selectedIndex = parseInt(this.pdfSelect.value);
    const pageRange = this.pageRangeInput.value.trim();

    if (isNaN(selectedIndex) || !pageRange) {
      this.showStatus('Please select a PDF and enter a page range', 'error');
      return;
    }

    const selectedFile = this.files[selectedIndex];
    if (!selectedFile) return;

    this.splitButton.disabled = true;
    this.showStatus('Splitting PDF...', 'info');

    try {
      const splitPdfBytes = await splitPDF(selectedFile.data, pageRange);
      this.downloadPDF(splitPdfBytes, `split_${selectedFile.name}`);
      this.showStatus('PDF split successfully!', 'success');
    } catch (error) {
      console.error('Error splitting PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.showStatus(`Error splitting PDF: ${errorMessage}`, 'error');
    } finally {
      this.splitButton.disabled = false;
    }
  }

  private async handleExtract(): Promise<void> {
    const selectedIndex = parseInt(this.extractPdfSelect.value);

    if (isNaN(selectedIndex)) {
      this.showStatus('Please select a PDF', 'error');
      return;
    }

    const selectedFile = this.files[selectedIndex];
    if (!selectedFile) return;

    this.extractButton.disabled = true;
    this.showStatus('Extracting text...', 'info');

    try {
      const text = await extractText(selectedFile.data);
      const extractedTextDiv = document.getElementById('extractedText');
      if (extractedTextDiv) {
        extractedTextDiv.textContent = text || 'No text found in PDF';
        extractedTextDiv.classList.add('visible');
      }
      this.showStatus('Text extracted successfully!', 'success');
    } catch (error) {
      console.error('Error extracting text:', error);
      this.showStatus('Error extracting text from PDF', 'error');
    } finally {
      this.extractButton.disabled = false;
    }
  }

  private downloadPDF(pdfBytes: Uint8Array, filename: string): void {
    const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private showStatus(message: string, type: 'success' | 'error' | 'info'): void {
    this.statusMessage.textContent = message;
    this.statusMessage.className = `status-message ${type} visible`;

    setTimeout(() => {
      this.statusMessage.classList.remove('visible');
    }, 3000);
  }
}

new PDFPrivacyTools();
