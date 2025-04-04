import {CsvTransformer} from './csvTransformer';
import {CsvTransformOptions} from './types';

// Simple testing utility
function test(name: string, fn: () => void): void {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        console.error(error);
    }
}

function assertEqual(actual: any, expected: any, message?: string): void {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);

    if (actualStr !== expectedStr) {
        throw new Error(`${message || 'Assertion failed'}: expected ${expectedStr}, got ${actualStr}`);
    }
}

// Tests for CsvTransformer
function runTests(): void {
    test('parseCSV should parse simple CSV data', () => {
        const csvStr = 'a,b,c\n1,2,3\n4,5,6';
        const expected = [['a', 'b', 'c'], ['1', '2', '3'], ['4', '5', '6']];
        const actual = CsvTransformer.parseCSV(csvStr);
        assertEqual(actual, expected);
    });

    test('parseCSV should handle quoted values', () => {
        const csvStr = 'a,"b,c",d\n1,"2,3",4';
        const expected = [['a', 'b,c', 'd'], ['1', '2,3', '4']];
        const actual = CsvTransformer.parseCSV(csvStr);
        assertEqual(actual, expected);
    });

    test('convertToCSVString should convert data back to CSV string', () => {
        const data = [['a', 'b', 'c'], ['1', '2', '3'], ['4', '5', '6']];
        const expected = 'a,b,c\n1,2,3\n4,5,6';
        const actual = CsvTransformer.convertToCSVString(data);
        assertEqual(actual, expected);
    });

    test('transformData should apply transformations correctly', () => {
        const data = [['name', 'age'], ['john', '25'], ['jane', '30']];
        const options: CsvTransformOptions = {hasHeader: true};
        const expected = [['Name', 'Age'], ['JOHN', '25'], ['JANE', '30']];
        const result = CsvTransformer.transformData(data, options);
        assertEqual(result.success, true);
        assertEqual(result.data, expected);
    });

    test('transformData should handle empty data', () => {
        const data: string[][] = [];
        const options: CsvTransformOptions = {hasHeader: true};
        const result = CsvTransformer.transformData(data, options);
        assertEqual(result.success, false);
        assertEqual(result.message, 'No data to transform');
    });
}

// Only run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
    runTests();
}
