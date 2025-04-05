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

    return csv.data
        .map(r => ({
            Date: Date.parse(r.Valuta!).toString(),
            Payee: r.Buchungstext!,
            Memo: r.Zahlungszweck!,
            Outflow: r["Belastung CHF"],
            Inflow: r["Gutschrift CHF"]
        }))
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
                Outflow: r.Amount > 0 ? r.Amount : null,
                Inflow: r.Amount < 0 ? r.Amount : null
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
    "Betrag Detail": number,
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
