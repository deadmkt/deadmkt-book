import { execSync } from 'child_process'
import { cpSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'

// Step 1: Build VitePress docs → docs/.vitepress/dist/
console.log('Building VitePress docs...')
execSync('npx vitepress build docs', { stdio: 'inherit' })

// Step 2: Assemble final dist/
const dist = 'dist'
if (existsSync(dist)) {
  execSync(`rm -rf ${dist}`)
}
mkdirSync(dist, { recursive: true })

// Copy VitePress output to dist/docs/
console.log('Assembling dist...')
cpSync('docs/.vitepress/dist', `${dist}/docs`, { recursive: true })

// Copy static root files (landing page, trades, assets)
const rootFiles = [
  'public/index.html',
  'public/trades.html',
  'public/favicon.svg',
  'public/favicon.png',
  'public/og-image.png',
  'public/robots.txt',
]

for (const f of rootFiles) {
  const name = f.split('/').pop()
  cpSync(f, `${dist}/${name}`)
  console.log(`  ${name}`)
}

// Copy _redirects for Cloudflare Pages
if (existsSync('docs/public/_redirects')) {
  cpSync('docs/public/_redirects', `${dist}/_redirects`)
  console.log('  _redirects')
}

// Use VitePress-generated sitemap as root, add landing + trades pages
if (existsSync(`${dist}/docs/sitemap.xml`)) {
  let sitemap = readFileSync(`${dist}/docs/sitemap.xml`, 'utf8')
  const extraUrls = [
    '<url><loc>https://deadmkt.com/</loc></url>',
    '<url><loc>https://deadmkt.com/trades</loc></url>',
  ].join('')
  sitemap = sitemap.replace('</urlset>', extraUrls + '</urlset>')
  writeFileSync(`${dist}/sitemap.xml`, sitemap)
  console.log('  sitemap.xml (merged)')
}

console.log('Build complete → dist/')
