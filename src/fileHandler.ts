export function handleFile(file: File) {
    if (!file.name.endsWith('.csv')) alert("Please upload a CSV file.")

    const reader = new FileReader()
    reader.onload = (e) => {
        if (e.target && e.target.result) {
            const content = e.target.result
            const blob = new Blob([content], {type: 'text/csv'})

            const downloadLink = document.createElement('a')
            downloadLink.href = URL.createObjectURL(blob)
            downloadLink.download = file.name.replace('.csv', `_ynab_${Date.now().valueOf()}.csv`)
            document.body.appendChild(downloadLink)
            downloadLink.click()
            document.body.removeChild(downloadLink)
        }
    }
    reader.readAsText(file)
}
