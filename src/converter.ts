import Papa, {ParseResult} from 'papaparse';

export function convert(content: string): string {
    let records: YnabRecord[] = [];
    if (content.startsWith('TransactionId,CardId')) {
        records = convertViseca(content)
    } else if (content.startsWith('"Datum";"Buchungstext"')) {
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

    return csv.data
        .map(r => ({
            Date: r.Valuta!,
            Payee: r.Buchungstext!,
            Memo: r.Zahlungszweck!,
            Outflow: r["Belastung CHF"],
            Inflow: r["Gutschrift CHF"]
        }))
}

function convertViseca(content: string): YnabRecord[] {
    const csv: ParseResult<VisecaRecord> = Papa.parse(content, {
        delimiter: ';',
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
    })

    return csv.data
        .map(r => ({
            Date: r.ValutaDate,
            Payee: r.MerchantName ?? r.Details,
            Memo: r.Details,
            Outflow: r.Amount > 0 ? r.Amount : null,
            Inflow: r.Amount < 0 ? r.Amount : null
        }))
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
    "Datum": Date | null,
    "Buchungstext": string,
    "Whg": string | null,
    "Betrag Detail": number,
    "ZKB-Referenz": string | null,
    "Referenznummer": string | null,
    "Belastung CHF": number | null,
    "Gutschrift CHF": number | null,
    "Valuta": Date | null,
    "Saldo CHF": number | null,
    "Zahlungszweck": string | null,
    "Details": string | null,
}

type VisecaRecord = {
    TransactionId: string,
    CardId: string | null,
    Date: Date,
    ValutaDate: Date,
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
    Date: Date,
    Payee: string,
    Memo: string | null,
    Outflow: number | null,
    Inflow: number | null,
}
