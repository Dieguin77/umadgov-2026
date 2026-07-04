// Gera o payload EMV/BR Code do Pix ("Pix Copia e Cola") conforme
// especificação do Banco Central (Arranjo Pix — QR Code estático).

function tlv(id, value) {
  const length = String(value.length).padStart(2, '0')
  return `${id}${length}${value}`
}

function sanitize(value, maxLength) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .trim()
    .slice(0, maxLength)
}

function crc16(payload) {
  let crc = 0xFFFF
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

export function buildPixPayload({ pixKey, merchantName, merchantCity, amount, txid }) {
  const merchantAccountInfo = tlv('00', 'br.gov.bcb.pix') + tlv('01', pixKey)
  const txidValue = (txid || '***').replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***'

  const fields = [
    tlv('00', '01'),
    tlv('26', merchantAccountInfo),
    tlv('52', '0000'),
    tlv('53', '986'),
    ...(amount ? [tlv('54', Number(amount).toFixed(2))] : []),
    tlv('58', 'BR'),
    tlv('59', sanitize(merchantName, 25)),
    tlv('60', sanitize(merchantCity, 15)),
    tlv('62', tlv('05', txidValue)),
  ].join('')

  const payloadWithCrcPlaceholder = `${fields}6304`
  return `${payloadWithCrcPlaceholder}${crc16(payloadWithCrcPlaceholder)}`
}
