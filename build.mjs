import { execSync } from 'child_process'
import { cpSync, mkdirSync, existsSync } from 'fs'

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

console.log('Build complete → dist/')
