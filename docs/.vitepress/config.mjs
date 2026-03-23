import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'DeadMKT',
  description: 'A peer-to-peer electronic communication network where AI works for you. Run a node. Write a strategy. Trade as an equal.',
  lang: 'en-US',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'DeadMKT — Fair Markets, Built by Individuals' }],
    ['meta', { property: 'og:description', content: 'A peer-to-peer trading network with no broker, no counterparty, and no hidden extraction.' }],
    ['meta', { property: 'og:image', content: 'https://deadmkt.com/og-image.png' }],
    ['meta', { property: 'og:url', content: 'https://deadmkt.com' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=DM+Sans:wght@400;500;600;700&display=swap', rel: 'stylesheet' }],
  ],

  appearance: 'dark',
  cleanUrls: true,
  base: '/docs/',

  sitemap: {
    hostname: 'https://deadmkt.com',
    transformItems: (items) => {
      return items.map(item => {
        // Add /docs/ prefix to all VitePress page URLs
        if (!item.url.startsWith('docs')) {
          item.url = 'docs/' + item.url
        }
        return item
      })
    },
  },

  themeConfig: {
    logo: false,
    siteTitle: 'DEADMKT',

    nav: [
      { text: 'Home', link: 'https://deadmkt.com/' },
      { text: 'Trades', link: 'https://deadmkt.com/trades' },
      { text: 'GitHub', link: 'https://github.com/deadmkt' },
    ],

    sidebar: [
      {
        text: 'The Vision',
        items: [
          { text: 'Manifesto', link: '/manifesto' },
          { text: 'Why We Built This', link: '/vision' },
        ]
      },
      {
        text: 'Protocol',
        items: [
          { text: 'Overview', link: '/protocol/overview' },
          { text: 'How Trading Works', link: '/protocol/how-trading-works' },
          { text: 'Trippples Tokens', link: '/protocol/trippples' },
          { text: 'NFT Identity', link: '/protocol/nft-identity' },
          { text: 'Pools', link: '/protocol/pools' },
          { text: 'Security', link: '/protocol/security' },
        ]
      },
      {
        text: 'Guides',
        items: [
          { text: 'Getting Started', link: '/guides/getting-started' },
          { text: 'Run a Node', link: '/guides/run-a-node' },
          { text: 'Install (macOS)', link: '/guides/install-a-node-macos' },
          { text: 'Install (Linux)', link: '/guides/install-a-node-linux' },
          { text: 'Install (Windows)', link: '/guides/install-a-node-windows' },
          { text: 'Write a Strategy', link: '/guides/write-a-strategy' },
          { text: 'WebSocket API', link: '/guides/websocket-api' },
          { text: 'Token Actions', link: '/guides/token-actions' },
          { text: 'FAQ', link: '/guides/faq' },
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Config', link: '/reference/config' },
        ]
      },
      {
        text: 'Community',
        items: [
          { text: 'Contributing', link: '/community/contributing' },
          { text: 'License', link: '/community/license' },
          { text: 'Links', link: '/community/links' },
        ]
      },
    ],

    search: {
      provider: 'local',
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/deadmkt' },
      { icon: 'x', link: 'https://x.com/DeadMKT' },
    ],

    footer: {
      message: 'Alpha Testnet',
      copyright: 'AGPL-3.0 License',
    },

    outline: {
      level: [2, 3],
    },
  },
})
