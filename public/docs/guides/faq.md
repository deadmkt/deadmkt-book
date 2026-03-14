# FAQ

## What is DeadMKT?

A peer-to-peer electronic communication network (ECN) for trading. No broker, no counterparty, no hidden extraction. Every participant runs their own node and trades directly with other participants. Settlement happens on-chain, and prices are computed by math.

## Is this a DEX?

No. A DEX typically means you trade against a liquidity pool (like Uniswap's AMM). DeadMKT is an ECN — you trade with other *agents*. There's no pool, no automated market maker, no impermanent loss. Orders are matched between real participants in batch auctions.

## What are EMM, KAY, and TEE?

Purpose-built tokens for the protocol's game theory. They don't represent external assets like dollars or gold. They exist to create a closed, circular market structure with three trading pairs. Read more in [Trippples Tokens](protocol/trippples.md).

## Do I need to know Rust?

No. The node is a pre-built binary — you just run it. Strategies are written in Python (or any language that can speak WebSocket and JSON, think openclaw ; P ). You don't need to touch Rust unless you want to contribute to the node software itself.

## How much SUPRA do I need?

About a minimum of 20 testnet SUPRA covers everything: NFT minting, bond, token minting, and initial gas. On testnet, SUPRA is free from the faucet:

```
https://rpc-testnet.supra.com/rpc/v1/wallet/faucet/YOUR_ADDRESS
```

## Can I lose money?

On testnet, no — the tokens have no real-world value. On a future mainnet, yes. Better strategies win. The infrastructure is fair — the outcomes depend on your decisions and your AI's decisions.

DeadMKT doesn't guarantee profits. It guarantees that the infrastructure isn't rigged against you.

## How long does setup take?

About 15 minutes from zero to trading. The setup wizard handles everything interactively.

## Can I run this on my laptop?

Yes. Minimum requirements: 1 CPU, 1GB RAM, Docker installed. A cheap VPS works too if you want it running 24/7.

## What happens if my node goes offline?

You stop trading, but you don't lose anything. Your escrow balances stay on-chain. When you come back online, your node reconnects and resumes. If you're offline too long, the heartbeat system marks you inactive — you won't be assigned to a pool until your heartbeat resumes.

## Is this open source?

The node software is open source and available at [github.com/deadmkt](https://github.com/deadmkt). The smart contracts are deployed on-chain and verifiable. You can audit everything.

## Who built this?

An individual who decided that market infrastructure could be fair. Not a company. Not a VC-funded startup. One person with an AI engineering partner (you can tell claude wrote this part eh... :D) and the conviction that the tools exist for individuals to build things that used to require institutions.

## Can I contribute?

Yes. Code, strategies, documentation, feedback — all welcome. See [Contributing](community/contributing.md).

## Where do I report issues or ask questions?

Open an issue on [GitHub](https://github.com/deadmkt) or follow us on X [@DeadMKT](https://x.com/DeadMKT). A community forum is coming soon.
