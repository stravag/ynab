import {describe, expect, it} from 'vitest'
import {convert} from "./converter.ts";
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'

function loadCsv(name: string): string {
    return readFileSync(resolve(__dirname, '../test/fixtures', name), 'utf-8').trim()
}

describe('convert csv to ynab csv', () => {
    it('can convert ZKB CSV', () => {
        const expected = loadCsv('zkb_ynab.csv')
        const result = convert(loadCsv('zkb.csv'))
        expect(result).eq(expected)
    })

    it('splits bundled ZKB bookings into separate bookings', () => {
        const csv = [
            '"Datum";"Buchungstext";"Whg";"Betrag Detail";"ZKB-Referenz";"Referenznummer";"Belastung CHF";"Gutschrift CHF";"Valuta";"Saldo CHF";"Zahlungszweck";"Details"',
            '"30.10.2026";"Belastungen Dauerauftrag (3)";"";"";"Z263036640506";"";"2997.00";"";"30.10.2026";"4891.59";"";""',
            '"";"PLAZZA AG, Sieberstrasse 5, 8055 Zürich, CH";"CHF";"200.00";"";"";"";"";"";"";"";""',
            '"";"PLAZZA AG, Sieberstrasse 5, 8055 Zürich, CH";"CHF";"135.00";"";"";"";"";"";"";"";""',
            '"";"PLAZZA AG, Sieberstrasse 5, 8055 Zürich, CH";"CHF";"2662.00";"";"";"";"";"";"";"";""',
        ].join('\n')

        const expected = [
            'Date,Payee,Memo,Outflow,Inflow',
            '30.10.2026,"PLAZZA AG, Sieberstrasse 5, 8055 Zürich, CH",,200,',
            '30.10.2026,"PLAZZA AG, Sieberstrasse 5, 8055 Zürich, CH",,135,',
            '30.10.2026,"PLAZZA AG, Sieberstrasse 5, 8055 Zürich, CH",,2662,',
        ].join('\n')

        expect(convert(csv)).eq(expected)
    })

    it('fails to convert bundled ZKB bookings when amounts do not match', () => {
        const csv = [
            '"Datum";"Buchungstext";"Whg";"Betrag Detail";"ZKB-Referenz";"Referenznummer";"Belastung CHF";"Gutschrift CHF";"Valuta";"Saldo CHF";"Zahlungszweck";"Details"',
            '"30.10.2026";"Belastungen Dauerauftrag (3)";"";"";"Z263036640506";"";"2997.00";"";"30.10.2026";"4891.59";"";""',
            '"";"PLAZZA AG, Sieberstrasse 5, 8055 Zürich, CH";"CHF";"200.00";"";"";"";"";"";"";"";""',
            '"";"PLAZZA AG, Sieberstrasse 5, 8055 Zürich, CH";"CHF";"135.00";"";"";"";"";"";"";"";""',
        ].join('\n')

        expect(() => convert(csv)).toThrowError(/amount mismatch/i)
    })

    it('can convert Viseca CSV', () => {
        const expected = loadCsv('viseca_ynab.csv')
        const result = convert(loadCsv('viseca.csv'))
        expect(result).eq(expected)
    })

    it('fails to convert empty csv', () => {
        expect(() => convert('')).toThrowError()
    })

    it('fails to convert non-csv', () => {
        expect(() => convert('a,b,c')).toThrowError()
    })

    it('fails to convert unexpected csv fails', () => {
        expect(() => convert('not-a-csv')).toThrowError()
    })
})