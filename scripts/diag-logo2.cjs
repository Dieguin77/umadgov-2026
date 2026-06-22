const { createCanvas, loadImage } = require('@napi-rs/canvas')

loadImage('d:/umadgov/Material para criação do Site/logooficial.PNG').then(img => {
  const c = createCanvas(img.width, img.height)
  const ctx = c.getContext('2d')
  ctx.drawImage(img, 0, 0)
  const d = ctx.getImageData(0, 0, img.width, img.height).data

  let fullyOpaque = 0, fullyTransparent = 0, semiTransparent = 0
  let opaqueWhite = 0, opaqueColored = 0, opaqueDark = 0

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i+1], b = d[i+2], a = d[i+3]
    if (a === 0) { fullyTransparent++; continue }
    if (a < 255) { semiTransparent++; continue }
    fullyOpaque++
    const maxC = Math.max(r, g, b)
    const brightness = maxC / 255
    if (r > 200 && g > 200 && b > 200) opaqueWhite++
    else if (brightness < 0.3) opaqueDark++
    else opaqueColored++
  }

  const total = img.width * img.height
  console.log('Total pixels:', total.toLocaleString())
  console.log('Totalmente transparente (A=0):', fullyTransparent.toLocaleString(), '(' + Math.round(fullyTransparent/total*100) + '%)')
  console.log('Semi-transparente (0<A<255):', semiTransparent.toLocaleString(), '(' + Math.round(semiTransparent/total*100) + '%)')
  console.log('Totalmente opaco (A=255):', fullyOpaque.toLocaleString(), '(' + Math.round(fullyOpaque/total*100) + '%)')
  console.log('  → Branco opaco (R,G,B>200):', opaqueWhite.toLocaleString())
  console.log('  → Colorido opaco:', opaqueColored.toLocaleString())
  console.log('  → Escuro opaco:', opaqueDark.toLocaleString())
}).catch(e => console.error(e))
