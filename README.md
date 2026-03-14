# DeadMKT

**Fair markets, built by individuals.**

DeadMKT is a peer-to-peer electronic communication network where no one can front-run your orders, sell your flow, or trade against you. The infrastructure is open. The matching is mathematical. The settlement is on-chain.

This repository is the website and documentation at [deadmkt.com](https://deadmkt.com).

---

## What is this?

A trading network with no broker.

You run a node. Your AI writes a strategy. Orders are committed as sealed hashes, revealed simultaneously, and matched at the mathematical midpoint. Every trade settles atomically on-chain. Nobody sees your orders before the reveal — not the other traders, not the infrastructure, not even the person who built it.

The entire protocol — smart contracts, node software, matching engine, settlement logic, token economics — was designed and built by an individual with an AI partner. Not a company. Not a venture-backed startup with 50 engineers. One person who decided market infrastructure could be fair.

## Repository structure

```
deadmkt-book/
  public/
    index.html              Landing page
    favicon.svg
    docs/
      index.html            Docsify entry point
      README.md             Documentation home
      _sidebar.md           Navigation
      manifesto.md          The ECN Manifesto
      vision.md             Why we built this
      protocol/             How the protocol works
      guides/               Run a node, write a strategy
      reference/            Configuration reference
      community/            Contributing, license, links
  server.js                 Express server
  package.json
  README.md
  LICENCE.md
```

## Run locally

```
git clone https://github.com/deadmkt/deadmkt-book.git
cd deadmkt-book
npm install
npm start
```

Open [localhost:3000](http://localhost:3000) for the landing page. Documentation lives at [localhost:3000/docs/](http://localhost:3000/docs/).

Docsify renders markdown on the fly — no build step. Edit a `.md` file, refresh, done.

## Deploy

The site is designed for [Cloudflare Pages](https://pages.cloudflare.com). Push to `main` and it deploys automatically. The `public/` directory is the root.

For other platforms, serve the `public/` directory as static files. The Express server in `server.js` is optional — any static host works.

## The ecosystem

DeadMKT is four repositories:

| Repository | What it does | License |
|---|---|---|
| [deadmkt-book](https://github.com/deadmkt/deadmkt-book) | Website and documentation (this repo) | AGPL-3.0 |
| [deadmkt-node](https://github.com/deadmkt/deadmkt-node) | Trading node (Rust) | AGPL-3.0 |
| [deadmkt-supra-contracts](https://github.com/deadmkt/deadmkt-supra-contracts) | Smart contracts (Move/Supra) | AGPL-3.0 |
| [deadmkt-indexer](https://github.com/deadmkt/deadmkt-indexer) | Event indexer and API (Rust) | AGPL-3.0 |

Strategies are MIT because they're yours. The infrastructure is AGPL because improvements should benefit everyone.

## Contributing

The documentation is the front door to the project. If something is unclear, wrong, or missing — that matters.

To contribute: fork this repo, edit the markdown in `public/docs/`, update `_sidebar.md` if you're adding pages, and submit a pull request. Docsify renders it automatically.

For protocol or node contributions, see the relevant repositories above.

## Network status

| Component | Endpoint |
|---|---|
| Website | [deadmkt.com](https://deadmkt.com) |
| Documentation | [deadmkt.com/docs](https://deadmkt.com/docs/) |
| Indexer API | [idx.testnet.deadmkt.com](http://idx.testnet.deadmkt.com:8080/api/health) |
| Bootstrap peer | peer1.testnet.deadmkt.com:9191 |
| Chain | Supra Testnet (chain_id: 6) |

## License

AGPL-3.0. See [LICENCE.md](LICENCE.md).

The short version: use it, modify it, share it. If you run a modified version as a service, share your changes. Improvements benefit the community — that's the point.

---

*Let's build the infrastructure we want.*
