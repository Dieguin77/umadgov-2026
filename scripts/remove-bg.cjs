#!/usr/bin/env node
// Remove white background from logo and save as transparent PNG

const { createCanvas, loadImage } = require('@napi-rs/canvas')
const fs = require('fs')
const path = require('path')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

async function removeWhiteBackground(inputPath, outputPath) {
  console.log(`Carregando: ${inputPath}`)
  const img = await loadImage(inputPath)
  console.log(`Dimensões: ${img.width}x${img.height}`)

  const canvas = createCanvas(img.width, img.height)
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, img.width, img.height)
  ctx.drawImage(img, 0, 0)

  const imageData = ctx.getImageData(0, 0, img.width, img.height)
  const data = imageData.data

  let transparent = 0
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    const maxC = Math.max(r, g, b)
    const minC = Math.min(r, g, b)
    const brightness = maxC / 255
    // Saturation: 0 = gray/white, 1 = fully colored
    const saturation = maxC > 0 ? (maxC - minC) / maxC : 0

    // Pure white or near-white with low saturation → transparent
    if (brightness > 0.92 && saturation < 0.12) {
      // Map brightness 0.92–1.0 to alpha 255–0
      const alpha = Math.round((1 - brightness) / 0.08 * 255)
      data[i + 3] = Math.max(0, Math.min(255, alpha))
      transparent++
    } else if (brightness > 0.80 && saturation < 0.20) {
      // Anti-aliasing zone: semi-transparent based on whiteness + saturation
      const whiteFactor = Math.max(0, (brightness - 0.80) / 0.12)
      const colorFactor = Math.min(1, saturation / 0.20)
      const alpha = Math.round((1 - whiteFactor * (1 - colorFactor)) * 255)
      data[i + 3] = Math.max(0, Math.min(255, alpha))
    }
    // All other pixels (colored/dark) stay fully opaque
  }

  console.log(`Pixels tornados transparentes: ${transparent.toLocaleString()} de ${(data.length / 4).toLocaleString()}`)

  ctx.putImageData(imageData, 0, 0)

  const outDir = path.dirname(outputPath)
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(outputPath, buffer)
  console.log(`Salvo: ${outputPath} (${Math.round(buffer.length / 1024)} KB)`)

  return buffer
}

const ROOT    = path.join(__dirname, '..')
const INPUT   = 'd:/umadgov/Material para criação do Site/logooficial.PNG'
const OUTPUT1 = path.join(ROOT, 'src/assets/logo/logooficial.png')
const OUTPUT2 = path.join(ROOT, 'public/logooficial.png')

;(async () => {
  const buf = await removeWhiteBackground(INPUT, OUTPUT1)
  // Copy to public/ for favicon/og-image
  const pubDir = path.dirname(OUTPUT2)
  if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true })
  fs.writeFileSync(OUTPUT2, buf)
  console.log(`Copiado para: ${OUTPUT2} (${Math.round(buf.length / 1024)} KB)`)
  console.log('Concluído!')
})().catch(e => { console.error('Erro:', e); process.exit(1) })
