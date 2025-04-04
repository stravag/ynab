export function handleFile(file: File) {
    if (!file.name.endsWith('.csv')) alert("Please upload a CSV file.")

    const reader = new FileReader()
    reader.onload = (e) => {
        if (e.target && e.target.result) {
            const content = e.target.result

            const records = convertToYnabRecords(content)
            const ynabCsv = convertToYnabCsv(records)

            const fileName = file.name.replace('.csv', `_ynab_${Date.now().valueOf()}.csv`)
            download(ynabCsv, fileName);
        }
    }
    reader.readAsText(file)
}

function convertToYnabRecords(content: string | ArrayBuffer): YnabRecord[] {
    console.log(content.toString())
    return [{
        date: new Date(),
        payee: 'foo',
        memo: 'bar',
        outflow: '123',
        inflow: '456'
    }]
}

function convertToYnabCsv(records: YnabRecord[]): string {
    const delimiter = ';'
    const csv = []
    const headers = ["Date", "Payee", "Memo", "Outflow", "Inflow"]
        .map(escape)
        .join(delimiter)

    csv.push(headers)

    const dateFormat = new Intl.DateTimeFormat('de-CH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })
    csv.push(records
        .map(r => [
            escape(dateFormat.format(r.date)),
            escape(r.payee),
            escape(r.memo ?? ''),
            escape(r.outflow),
            escape(r.inflow)
        ].join(delimiter)))

    return csv.join('\n')
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

function escape(str: string): string {
    return `"${str}"`
}

type YnabRecord = {
    date: Date,
    payee: string,
    outflow: string,
    memo: string | null,
    inflow: string,
}
