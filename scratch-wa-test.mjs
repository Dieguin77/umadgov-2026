import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } })
const errors = []
page.on('pageerror', err => errors.push(err.message))

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
// wait for the floating WhatsApp button to appear (2s delay in component)
await page.waitForTimeout(4000)
await page.screenshot({ path: 'C:\\Users\\ADM\\AppData\\Local\\Temp\\claude\\d--umadgov\\73c0bc4a-8713-4a1a-8e11-c0943baccdc8\\scratchpad\\wa-debug.png' })

const allLinks = await page.locator('a[href*="wa.me"]').all()
console.log('count of wa.me links:', allLinks.length)
for (const link of allLinks) {
  const h = await link.getAttribute('href')
  const box = await link.boundingBox()
  console.log('---')
  console.log('href:', h)
  console.log('box:', JSON.stringify(box))
  console.log('decoded:', decodeURIComponent(h.split('?text=')[1]))
}

console.log('errors:', errors)
await browser.close()
