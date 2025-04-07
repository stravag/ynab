import {handleFile} from "./fileHandler.ts";

const dropZone = document.querySelector<HTMLElement>('#file-input')!
const input = document.querySelector<HTMLInputElement>('#file')!

dropZone.addEventListener('dragover', e => e.preventDefault())
dropZone.addEventListener('drop', (event) => {
    event.preventDefault()
    if (event.dataTransfer) {
        handleFile(event.dataTransfer.files[0])
    }
})

input.addEventListener('change', (_) => {
    if (input.files) {
        handleFile(input.files[0])
    }
});
