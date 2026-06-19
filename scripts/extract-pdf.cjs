const { createCanvas } = require('@napi-rs/canvas');
const { readFileSync, writeFileSync, mkdirSync, existsSync } = require('fs');

if (!global.DOMMatrix) {
  global.DOMMatrix = class DOMMatrix {
    constructor() {
      this.a=1; this.b=0; this.c=0; this.d=1; this.e=0; this.f=0;
      this.m11=1; this.m12=0; this.m13=0; this.m14=0;
      this.m21=0; this.m22=1; this.m23=0; this.m24=0;
      this.m31=0; this.m32=0; this.m33=1; this.m34=0;
      this.m41=0; this.m42=0; this.m43=0; this.m44=1;
      this.is2D = true; this.isIdentity = true;
    }
    multiply() { return new global.DOMMatrix(); }
    translate() { return new global.DOMMatrix(); }
    scale() { return new global.DOMMatrix(); }
    rotate() { return new global.DOMMatrix(); }
    inverse() { return new global.DOMMatrix(); }
    transformPoint(p) { return p || { x: 0, y: 0 }; }
    toFloat32Array() { return new Float32Array(16); }
    static fromMatrix() { return new global.DOMMatrix(); }
    static fromFloat32Array() { return new global.DOMMatrix(); }
    static fromFloat64Array() { return new global.DOMMatrix(); }
  };
}

const PAGES = [
  { name: 'logo-brand-dark', dir: 'logo',   scale: 4, bg: '#000000' },
  { name: 'camisa-mockup',   dir: 'shirts', scale: 4, bg: '#ffffff' },
  { name: 'arte-vetores',    dir: 'shirts', scale: 4, bg: '#ffffff' },
];

async function main() {
  const pdfjsLib = await import('../node_modules/pdfjs-dist/legacy/build/pdf.mjs');
  const pdfPath = 'd:/umadgov/Material para criação do Site/Camisa - Lavanda - UMADGOV.pdf';
  const baseDir  = 'd:/umadgov/umadgov-2026/src/assets/images';

  const data = readFileSync(pdfPath);
  const pdf  = await pdfjsLib.getDocument({
    data: new Uint8Array(data),
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
    verbosity: 0,
  }).promise;

  console.log(`PDF: ${pdf.numPages} páginas`);

  for (let i = 1; i <= pdf.numPages; i++) {
    const cfg  = PAGES[i - 1];
    const page = await pdf.getPage(i);
    const vp   = page.getViewport({ scale: cfg.scale });
    const W    = Math.floor(vp.width);
    const H    = Math.floor(vp.height);

    const canvas = createCanvas(W, H);
    const ctx    = canvas.getContext('2d');
    ctx.fillStyle = cfg.bg;
    ctx.fillRect(0, 0, W, H);

    try {
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
    } catch (e) {
      console.warn(`  aviso pág ${i}: ${e.message}`);
    }

    const outDir = `${baseDir}/${cfg.dir}`;
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    const buf     = canvas.toBuffer('image/png');
    const outPath = `${outDir}/${cfg.name}.png`;
    writeFileSync(outPath, buf);
    console.log(`  ✓ pág ${i} → ${cfg.dir}/${cfg.name}.png  (${W}×${H}px, ${Math.round(buf.length / 1024)}KB)`);
  }

  console.log('\nExtração concluída.');
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
