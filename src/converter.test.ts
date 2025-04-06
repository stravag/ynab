import {describe, expect, it} from 'vitest'
import {convert} from "./converter.ts";
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'

function loadCsv(name: string): string {
    return readFileSync(resolve(__dirname, '../test/fixtures', name), 'utf-8')
}

describe('convert csv to ynab csv', () => {
    it('can convert ZKB CSV', () => {
        const expected = loadCsv('zkb_ynab.csv')
        const result = convert(loadCsv('zkb.csv'))
        expect(result).eq(expected)
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