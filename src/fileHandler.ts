import {convert} from "./converter.ts";

export function handleFile(file: File) {
    if (!file.name.endsWith('.csv')) alert("Please upload a CSV file.")

    const reader = new FileReader()
    reader.onload = (e) => {
        if (e.target && typeof e.target.result == "string") {
            const content = e.target.result
            const convertedContent = convert(content)
            const fileName = file.name.replace('.csv', `_ynab_${Date.now().valueOf()}.csv`)
            download(convertedContent, fileName);
        }
    }
    reader.readAsText(file)
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
