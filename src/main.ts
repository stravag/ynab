import {handleFile} from "./fileHandler.ts";

const dropZone = document.querySelector<HTMLDivElement>('#drop-zone')!
dropZone.addEventListener('dragover', (event) => {
    event.preventDefault()
    dropZone.style.backgroundColor = 'gray'
})

dropZone.addEventListener('dragleave', (event) => {
    event.preventDefault()
    dropZone.style.backgroundColor = ''
})

dropZone.addEventListener('drop', (event) => {
    event.preventDefault()
    dropZone.style.backgroundColor = ''
    if (event.dataTransfer) {
        handleFile(event.dataTransfer.files[0])
    }
})
