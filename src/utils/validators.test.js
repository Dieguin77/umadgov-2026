import { describe, it, expect } from 'vitest'
import { validators, validateFile } from './validators'

describe('validateFile', () => {
  const makeFile = (overrides = {}) => ({
    type: 'image/jpeg',
    size: 1024,
    name: 'comprovante.jpg',
    ...overrides,
  })

  it('aceita um arquivo dentro do tamanho e tipo permitidos', () => {
    expect(validateFile(makeFile())).toBeNull()
  })

  it('aceita "image/jpg" (mime não-padrão usado por fotos do WhatsApp/Android)', () => {
    expect(validateFile(makeFile({ type: 'image/jpg' }))).toBeNull()
  })

  it('rejeita tipo de arquivo não permitido', () => {
    expect(validateFile(makeFile({ type: 'text/plain', name: 'nota.txt' }))).toMatch(/inválido/i)
  })

  it('rejeita arquivo maior que 10MB', () => {
    const tenMb = 10 * 1024 * 1024
    expect(validateFile(makeFile({ size: tenMb + 1 }))).toMatch(/muito grande/i)
  })

  it('aceita arquivo de exatamente 10MB (limite é inclusivo)', () => {
    const tenMb = 10 * 1024 * 1024
    expect(validateFile(makeFile({ size: tenMb }))).toBeNull()
  })

  it('quando o navegador não informa file.type, usa a extensão do nome como fallback', () => {
    expect(validateFile(makeFile({ type: '', name: 'comprovante.png' }))).toBeNull()
    expect(validateFile(makeFile({ type: '', name: 'comprovante.pdf' }))).toBeNull()
    expect(validateFile(makeFile({ type: '', name: 'comprovante.heic' }))).toMatch(/inválido/i)
  })
})

describe('validators.phone.pattern', () => {
  const { value: pattern } = validators.phone.pattern

  it('aceita telefone celular formatado com 9 dígitos', () => {
    expect(pattern.test('(33) 99999-9999')).toBe(true)
  })

  it('aceita telefone fixo formatado com 8 dígitos', () => {
    expect(pattern.test('(33) 9999-9999')).toBe(true)
  })

  it('rejeita telefone sem formatação', () => {
    expect(pattern.test('33999999999')).toBe(false)
  })
})

describe('validators.name.pattern', () => {
  const { value: pattern } = validators.name.pattern

  it('aceita nomes com acentos e espaços', () => {
    expect(pattern.test('João da Conceição')).toBe(true)
  })

  it('rejeita nomes com números', () => {
    expect(pattern.test('João123')).toBe(false)
  })
})
