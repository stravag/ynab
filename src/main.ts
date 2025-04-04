import './style.css'
import { setupCounter } from './counter.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Upload CSV File</1>
    <div class="card">
      <input type="file" id="csvFileInput" accept=".csv" />
      <div class="preview" id="fileInfo"></div>
    </div>
    <button id="counter" type="button"></button>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
