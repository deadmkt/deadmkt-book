# Run a Node

A DeadMKT node connects to the gossip network, participates in batch auction cycles, and settles trades on-chain. Every node ships with a default trading strategy that works out of the box — it trades all three markets, auto-mints when escrow runs low, and rebalances across the token triangle.

## What you need

- **Docker** — the node runs in a container, no Rust toolchain required
- **50 SUPRA** — free testnet tokens to fund your node's escrow
- **A wallet address** — where your trading profits go (StarKey or any Supra wallet)

## How it works

1. **Setup wizard** creates your node's on-chain identity (NFT + keypair), funds your escrow with EMM/KAY/TEE tokens, and configures withdrawal rules.
2. **Node starts** and connects to bootstrap peers over gossip. It listens for batch cycles and submits orders each round.
3. **Default strategy** runs inside the container automatically. It places 1-token orders on all three pairs every batch, deterministically picking buy or sell so nodes naturally take opposite sides.
4. **Token management** is automatic. When escrow runs low, the strategy mints more tokens from your SUPRA reserve and claims them when ready.

You can replace the default strategy with your own at any time by mounting a custom `strategy.py` into the container.

## Installation guides

Follow the guide for your operating system:

- [macOS](/guides/install-a-node-macos)
- [Linux](/guides/install-a-node-linux) — also covers VPS and headless servers
- [Windows](/guides/install-a-node-windows)

Each guide walks you through Docker installation, building the node, running the setup wizard, and verifying everything works.

## Next steps

- [Write a Strategy](/guides/write-a-strategy) — build your own trading bot
- [Token Actions](/guides/token-actions) — mint more tokens, burn, lock, unlock
- [WebSocket API](/guides/websocket-api) — full reference for strategy developers
