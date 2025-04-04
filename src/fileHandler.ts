import Papa, {ParseResult} from 'papaparse';

export function handleFile(file: File) {
    if (!file.name.endsWith('.csv')) alert("Please upload a CSV file.")

    const reader = new FileReader()
    reader.onload = (e) => {
        if (e.target && typeof e.target.result == "string") {
            const content = e.target.result

            const records = convert(content)
            const ynabCsv = convertToYnabCsv(records)

            const fileName = file.name.replace('.csv', `_ynab_${Date.now().valueOf()}.csv`)
            download(ynabCsv, fileName);
        }
    }
    reader.readAsText(file)
}

function convert(content: string): YnabRecord[] {
    if (content.startsWith('TransactionId,CardId')) {
        return convertViseca(content)
    } else if (content.startsWith('"Datum";"Buchungstext"')) {
        return convertZkb(content)
    } else {
        throw Error("Uploaded unexpected CSV file")
    }
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

function download(ynabCsv: string, fileName: string) {
    const blob = new Blob([ynabCsv], {type: 'text/csv'})

    const downloadLink = document.createElement('a')
    downloadLink.href = URL.createObjectURL(blob)
    downloadLink.download = fileName
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
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

type YnabRecord = {
    Date: Date,
    Payee: string,
    Memo: string | null,
    Outflow: number | null,
    Inflow: number | null,
}
