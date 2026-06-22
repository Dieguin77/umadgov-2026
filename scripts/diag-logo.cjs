const { createCanvas, loadImage } = require('@napi-rs/canvas')

loadImage('d:/umadgov/Material para criação do Site/logooficial.PNG').then(img => {
  const c = createCanvas(img.width, img.height)
  const ctx = c.getContext('2d')
  ctx.drawImage(img, 0, 0)
  const d = ctx.getImageData(0, 0, img.width, img.height).data

  let pureWhite = 0, nearWhite = 0, colored = 0, dark = 0
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i+1], b = d[i+2]
    const maxC = Math.max(r, g, b)
    const minC = Math.min(r, g, b)
    const brightness = maxC / 255
    const sat = maxC > 0 ? (maxC - minC) / maxC : 0
    if (r > 245 && g > 245 && b > 245) pureWhite++
    else if (brightness > 0.85 && sat < 0.25) nearWhite++
    else if (brightness < 0.3) dark++
    else colored++
  }
  const total = img.width * img.height
  console.log('Total:', total.toLocaleString())
  console.log('Branco puro:', pureWhite.toLocaleString(), '(' + Math.round(pureWhite/total*100) + '%)')
  console.log('Quase branco:', nearWhite.toLocaleString(), '(' + Math.round(nearWhite/total*100) + '%)')
  console.log('Colorido:', colored.toLocaleString(), '(' + Math.round(colored/total*100) + '%)')
  console.log('Escuro:', dark.toLocaleString(), '(' + Math.round(dark/total*100) + '%)')

  const samplePx = (x, y) => {
    const idx = ((y * img.width) + x) * 4
    return `RGB(${d[idx]},${d[idx+1]},${d[idx+2]},A=${d[idx+3]})`
  }
  console.log('Canto(0,0):', samplePx(0, 0))
  console.log('Canto(1079,0):', samplePx(1079, 0))
  console.log('Canto(0,1919):', samplePx(0, 1919))
  console.log('Centro(540,960):', samplePx(540, 960))
  console.log('Px(100,100):', samplePx(100, 100))
  console.log('Px(540,200):', samplePx(540, 200))
}).catch(e => console.error(e))
