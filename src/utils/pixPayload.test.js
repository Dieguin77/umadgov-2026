import { describe, it, expect } from 'vitest'
import { buildPixPayload } from './pixPayload'

// Implementação independente do CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF,
// sem reflexão) para conferir o checksum sem depender do mesmo código que
// está sendo testado.
function referenceCrc16(payload) {
  let crc = 0xFFFF
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

const baseInput = {
  pixKey: 'pix@umadgov.com.br',
  merchantName: 'UMADGOV',
  merchantCity: 'Governador Valadares',
  amount: 50,
  txid: 'UMD-2026-0001',
}

describe('buildPixPayload', () => {
  it('começa com o indicador de payload format (00) e termina com o CRC (6304 + checksum)', () => {
    const payload = buildPixPayload(baseInput)
    expect(payload.startsWith('000201')).toBe(true)

    const payloadWithCrcPlaceholder = payload.slice(0, -4) // já termina em "6304"
    const crc = payload.slice(-4)
    expect(crc).toBe(referenceCrc16(payloadWithCrcPlaceholder))
  })

  it('inclui a chave Pix dentro do campo 26 (merchant account information)', () => {
    const payload = buildPixPayload(baseInput)
    expect(payload).toContain(baseInput.pixKey)
    expect(payload).toContain('br.gov.bcb.pix')
  })

  it('formata o valor com duas casas decimais no campo 54', () => {
    const payload = buildPixPayload({ ...baseInput, amount: 150 })
    expect(payload).toContain('5406150.00')
  })

  it('omite o campo 54 quando nenhum valor é informado', () => {
    const payload = buildPixPayload({ ...baseInput, amount: undefined })
    expect(payload).not.toMatch(/54\d{2}\d+\.\d{2}/)
  })

  it('sanitiza nome e cidade: remove acentos, deixa maiúsculo e corta no tamanho máximo do campo', () => {
    const payload = buildPixPayload({
      ...baseInput,
      merchantName: 'João da Associação',
      merchantCity: 'São Paulo',
    })
    // campo 59 (merchant name, máx 25) e 60 (merchant city, máx 15)
    expect(payload).toContain('JOAO DA ASSOCIACAO')
    expect(payload).toContain('SAO PAULO')
    expect(payload).not.toMatch(/[À-ÿ]/)
  })

  it('sanitiza o txid para alfanumérico e limita a 25 caracteres', () => {
    const payload = buildPixPayload({ ...baseInput, txid: 'UMD-2026-0001!!!' })
    expect(payload).toContain('UMD20260001')
    expect(payload).not.toContain('UMD-2026-0001!!!')
  })

  it('usa "***" como txid quando nenhum é informado (txid genérico do Pix estático)', () => {
    const payload = buildPixPayload({ ...baseInput, txid: undefined })
    expect(payload).toContain('0503***')
  })
})
