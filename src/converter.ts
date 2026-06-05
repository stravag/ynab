import Papa, {ParseResult} from 'papaparse';

const ynabDateFormat = Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
})

export function convert(content: string): string {
    let records: YnabRecord[] = [];
    if (content.trim().startsWith('TransactionId,CardId')) {
        records = convertViseca(content)
    } else if (content.trim().startsWith('"Datum";"Buchungstext"')) {
        records = convertZkb(content)
    } else {
        throw Error("Uploaded unexpected CSV file")
    }
    return convertToYnabCsv(records)
}

function convertZkb(content: string): YnabRecord[] {
    const csv: ParseResult<ZkbRecord> = Papa.parse(content, {
        delimiter: ';',
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
    })

    const replacementPatterns = [
        { pattern: /^Einkauf ZKB Visa Debit Card Nr. xxxx \d{4}, /g, replacement: '' },
        { pattern: /^Online-Einkauf ZKB Visa Debit Card Nr. xxxx \d{4}, /g, replacement: '' },
    ];

    // Function to apply all replacements
    const cleanText = (text: string): string => {
        let result = text;
        replacementPatterns.forEach(({ pattern, replacement }) => {
            result = result.replace(pattern, replacement);
        });
        return result;
    };

    const records: YnabRecord[] = [];

    for (let i = 0; i < csv.data.length; i++) {
        const r = csv.data[i];
        if (r["ZKB-Referenz"] === null) {
            if (r.Datum === null || r["Betrag Detail"] !== null) {
                throw Error("Unexpected detail row without parent booking");
            }
            continue;
        }

        const details: ZkbRecord[] = [];
        while (
            i + 1 < csv.data.length &&
            csv.data[i + 1]["ZKB-Referenz"] === null &&
            (csv.data[i + 1].Datum === null || csv.data[i + 1]["Betrag Detail"] !== null)
        ) {
            i++;
            details.push(csv.data[i]);
        }

        if (details.length > 0) {
            const parentAmount = r["Belastung CHF"] ?? r["Gutschrift CHF"] ?? 0;
            const detailsSum = details.reduce((sum, d) => sum + (d["Betrag Detail"] ?? 0), 0);
            if (Math.round(detailsSum * 100) !== Math.round(parentAmount * 100)) {
                throw Error(`Bundled booking amount mismatch: expected ${parentAmount}, but details sum to ${detailsSum}`);
            }

            for (const d of details) {
                records.push({
                    Date: r.Valuta!,
                    Payee: cleanText(d.Details ?? d.Buchungstext!),
                    Memo: d.Zahlungszweck ?? r.Zahlungszweck,
                    Outflow: r["Belastung CHF"] !== null ? d["Betrag Detail"] : null,
                    Inflow: r["Gutschrift CHF"] !== null ? d["Betrag Detail"] : null,
                });
            }
        } else {
            records.push({
                Date: r.Valuta!,
                Payee: cleanText(r.Details ?? r.Buchungstext!),
                Memo: r.Zahlungszweck,
                Outflow: r["Belastung CHF"],
                Inflow: r["Gutschrift CHF"]
            });
        }
    }

    return records;
}

function convertViseca(content: string): YnabRecord[] {
    const csv: ParseResult<VisecaRecord> = Papa.parse(content, {
        delimiter: ',',
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
    })

    return csv.data
        .map(r => {
            return {
                Date: ynabDateFormat.format(Date.parse(r.Date)),
                Payee: r.MerchantName ?? r.Details,
                Memo: r.Details,
                Outflow: r.Amount,
                Inflow: null
            }
        })
}

function convertToYnabCsv(records: YnabRecord[]): string {
    return Papa.unparse(records, {
        delimiter: ',',
        header: true,
        newline: '\n',
        skipEmptyLines: true,
    })
}

type ZkbRecord = {
    "Datum": string | null,
    "Buchungstext": string,
    "Whg": string | null,
    "Betrag Detail": number | null,
    "ZKB-Referenz": string | null,
    "Referenznummer": string | null,
    "Belastung CHF": number | null,
    "Gutschrift CHF": number | null,
    "Valuta": string | null,
    "Saldo CHF": number | null,
    "Zahlungszweck": string | null,
    "Details": string | null,
}

type VisecaRecord = {
    TransactionId: string,
    CardId: string | null,
    Date: string,
    ValutaDate: string,
    Amount: number,
    Currency: string,
    OriginalAmount: number,
    OriginalCurrency: string,
    MerchantName: string | null,
    MerchantPlace: string | null,
    MerchantCountry: string | null,
    StateType: string,
    Details: string,
    Type: string
}

export type YnabRecord = {
    Date: string,
    Payee: string,
    Memo: string | null,
    Outflow: number | null,
    Inflow: number | null,
}
