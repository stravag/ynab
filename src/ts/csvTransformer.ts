import {CsvData, CsvRow, CsvTransformOptions, TransformerResult} from './types';

export class CsvTransformer {
    /**
     * Parse CSV string into a 2D array
     */
    static parseCSV(csvContent: string): CsvData {
        // Split by new line and filter out empty rows
        const rows = csvContent.split(/\r?\n/).filter(row => row.trim() !== '');

        // Parse each row - handle quoted values that might contain commas
        const parsedRows: CsvRow[] = rows.map(row => {
            const cells: string[] = [];
            let inQuote = false;
            let currentCell = '';

            for (let i = 0; i < row.length; i++) {
                const char = row[i];

                if (char === '"') {
                    inQuote = !inQuote;
                } else if (char === ',' && !inQuote) {
                    cells.push(currentCell);
                    currentCell = '';
                } else {
                    currentCell += char;
                }
            }

            // Add the last cell
            cells.push(currentCell);

            return cells;
        });

        return parsedRows;
    }

    /**
     * Convert CSV data back to string format
     */
    static convertToCSVString(data: CsvData): string {
        return data.map(row => {
            return row.map(cell => {
                // Escape quotes and wrap in quotes if the cell contains comma or quote
                if (cell.includes(',') || cell.includes('"')) {
                    return `"${cell.replace(/"/g, '""')}"`;
                }
                return cell;
            }).join(',');
        }).join('\n');
    }

    /**
     * Transform CSV data according to options
     */
    static transformData(data: CsvData, options: CsvTransformOptions): TransformerResult {
        try {
            if (data.length === 0) {
                return {data: [], success: false, message: "No data to transform"};
            }

            // Create a copy of the data to transform
            let transformedData: CsvData = JSON.parse(JSON.stringify(data));

            // Example transformation: Capitalize the header row if it exists
            if (options.hasHeader && transformedData.length > 0) {
                transformedData[0] = transformedData[0].map(header =>
                    header.charAt(0).toUpperCase() + header.slice(1)
                );
            }

            // Example transformation: Convert all string values to uppercase
            const startIndex = options.hasHeader ? 1 : 0;
            for (let i = startIndex; i < transformedData.length; i++) {
                transformedData[i] = transformedData[i].map(cell => cell.toUpperCase());
            }

            return {
                data: transformedData,
                success: true
            };
        } catch (error) {
            return {
                data: [],
                success: false,
                message: `Error transforming data: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
}
