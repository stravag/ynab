export type CsvRow = string[];
export type CsvData = CsvRow[];

export interface CsvTransformOptions {
    hasHeader: boolean;
    // Add more options as needed
}

export interface TransformerResult {
    data: CsvData;
    success: boolean;
    message?: string;
}
