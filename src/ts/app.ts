import {CsvTransformer} from './csvTransformer';
import {CsvData, CsvTransformOptions} from './types';

class CsvTransformerApp {
    private fileInput: HTMLInputElement;
    private transformButton: HTMLButtonElement;
    private downloadLink: HTMLAnchorElement;
    private fileNameElement: HTMLDivElement;
    private csvPreviewElement: HTMLDivElement;
    private headerOption: HTMLInputElement;

    private csvData: CsvData = [];
    private transformedData: CsvData = [];

    constructor() {
        this.fileInput = document.getElementById('csvFile') as HTMLInputElement;
        this.transformButton = document.getElementById('transformBtn') as HTMLButtonElement;
        this.downloadLink = document.getElementById('downloadLink') as HTMLAnchorElement;
        this.fileNameElement = document.getElementById('fileName') as HTMLDivElement;
        this.csvPreviewElement = document.getElementById('csvPreview') as HTMLDivElement;
        this.headerOption = document.getElementById('headerOption') as HTMLInputElement;

        this.init();
    }

    private init(): void {
        this.fileInput.addEventListener('change', this.handleFileSelection.bind(this));
        this.transformButton.addEventListener('click', this.transformCsv.bind(this));
    }

    private handleFileSelection(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];

        if (!file) {
            this.resetUI();
            return;
        }

        // Update UI to show selected file
        this.fileNameElement.textContent = `Selected: ${file.name}`;
        this.transformButton.disabled = false;

        // Read the file content
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            this.csvData = CsvTransformer.parseCSV(content);
            this.displayPreview(this.csvData, 'Original CSV:');
        };
        reader.readAsText(file);
    }

    private transformCsv(): void {
        // Get options from UI
        const options: CsvTransformOptions = {
            hasHeader: this.headerOption.checked
        };

        // Transform the data
        const result = CsvTransformer.transformData(this.csvData, options);

        if (result.success) {
            this.transformedData = result.data;
            this.displayPreview(this.transformedData, 'Transformed CSV:');
            this.prepareDownload();
        } else {
            alert(result.message || 'Transformation failed');
        }
    }

    private displayPreview(data: CsvData, title: string): void {
        if (!data || data.length === 0) {
            this.csvPreviewElement.innerHTML = '<p>No data to preview</p>';
            return;
        }

        let html = `<h3>${title}</h3><div class="table-wrapper"><table>`;

        // Generate table
        data.forEach((row, rowIndex) => {
            html += '<tr>';
            row.forEach(cell => {
                if (rowIndex === 0 && this.headerOption.checked) {
                    html += `<th>${this.escapeHtml(cell)}</th>`;
                } else {
                    html += `<td>${this.escapeHtml(cell)}</td>`;
                }
            });
            html += '</tr>';
        });

        html += '</table></div>';
        this.csvPreviewElement.innerHTML = html;
    }

    private prepareDownload(): void {
        const csvString = CsvTransformer.convertToCSVString(this.transformedData);
        const blob = new Blob([csvString], {type: 'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);

        this.downloadLink.href = url;
        this.downloadLink.style.display = 'inline-block';
    }

    private resetUI(): void {
        this.fileNameElement.textContent = '';
        this.transformButton.disabled = true;
        this.downloadLink.style.display = 'none';
        this.csvPreviewElement.innerHTML = '';
        this.csvData = [];
        this.transformedData = [];
    }

    private escapeHtml(text: string): string {
        const map: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CsvTransformerApp();
});
