---
name: deadmkt
version: 0.1.0
description: DeadMKT — Trustless market-making protocol on Supra L1. Query trades, markets, and events. Run nodes. Build strategies.
homepage: https://deadmkt.com
metadata: {"category":"defi","chain":"supra","license":"AGPL-3.0"}
---

# DeadMKT Skill

DeadMKT is a trustless, decentralised market-making protocol built on Supra Layer-1. Traders run nodes that commit/reveal/match/settle in batch cycles. Every action is on-chain. No central order book, no custodial risk.

## Skill Files

| File | Description |
|------|-------------|
| **SKILL.md** (this file) | Full protocol reference, API docs, node operations |

## Quick Reference

| Resource | URL |
|----------|-----|
| Website | https://deadmkt.com |
| Testnet Indexer | http://idx.testnet.deadmkt.com:8080 |
| Testnet RPC | https://rpc-testnet.supra.com |
| Contract | `0x1c19ed2b9e864b6d565feeab65d8fed5204a78b4a9daf19ef7e198afc91b8ccf` |
| GitHub | https://github.com/deadmkt |
| X | https://x.com/DeadMKT |

---

## Core Concepts

### How It Works

DeadMKT operates in **batch cycles** of 20 blocks (~8 seconds on testnet, ~24 seconds on mainnet):

1. **COMMIT** (6 blocks) — Nodes submit hashed orders. Nobody sees prices or quantities.
2. **REVEAL** (8 blocks) — Nodes reveal their commitments. Prices become visible.
3. **MATCH** (2 blocks) — Protocol matches compatible buy/sell orders within the pool.
4. **SWAP** (4 blocks) — Matched trades settle on-chain via escrow. Tokens move atomically.

### Tokens (Trippples)

Three fungible tokens, all 5 decimals:

| Symbol | ID | Metadata Address |
|--------|-----|-----------------|
| EMM | 0 | `0xaaa5fea4d387996a61c50cfb66a54e41c73af3d8e1a14d1a10cd3b7c8d1768eb` |
| KAY | 1 | `0xcd5b6d8e17cbca44a61156fb2c9ce2f263323599eee880c692e11dd114fb9741` |
| TEE | 2 | `0x8a86da9f2be421f24ed3a018b1081973892be0866f1a89ad5038685470e4557c` |

### Market Pairs

| Pair | Symbol Hex |
|------|-----------|
| EMM/KAY | `0x454d4d2f4b4159` |
| KAY/TEE | `0x4b41592f544545` |
| TEE/EMM | `0x5445452f454d4d` |

### Key Roles

- **Trustee** — Runs a node, holds a TrusteeNFT, signs transactions, executes strategy
- **Beneficiary** — Receives profits, can trigger withdrawals, holds a BeneficiaryNFT
- **Strategy** — Python script that connects via WebSocket, sends buy/sell signals each batch

---

## Indexer API

**Base URL:** `http://idx.testnet.deadmkt.com:8080`

All endpoints are GET requests. No authentication required (free tier).

### Health Check

```bash
curl http://idx.testnet.deadmkt.com:8080/api/health
```

Response:
```json
{"status": "ok"}
```

### Stats

```bash
curl http://idx.testnet.deadmkt.com:8080/api/stats
```

Response:
```json
{
  "last_indexed_block": 76208187,
  "total_trades": 0,
  "total_mints": 0,
  "total_burns": 0,
  "total_trustees": 0,
  "total_volume": 0
}
```

### Markets

```bash
curl http://idx.testnet.deadmkt.com:8080/api/markets
```

Returns active market pairs with metadata addresses and min_quantity.

### Trades

```bash
# All trades
curl http://idx.testnet.deadmkt.com:8080/api/trades

# Single trade
curl http://idx.testnet.deadmkt.com:8080/api/trades/TRADE_ID

# Trades by market
curl "http://idx.testnet.deadmkt.com:8080/api/trades?market=EMM/KAY"
```

### Events

```bash
# All events
curl http://idx.testnet.deadmkt.com:8080/api/events

# Filter by type
curl "http://idx.testnet.deadmkt.com:8080/api/events?type=NFTPairMinted"
```

26 event types are indexed, including: NFTPairMinted, TraderRegistered, TradeSettled, MintRequested, MintClaimed, TokensLocked, TokensUnlocked, HeartbeatSent, BondConfigUpdated, and more.

### Trustee Events

```bash
curl http://idx.testnet.deadmkt.com:8080/api/trustee/0xADDRESS
```

Returns all events for a specific trustee address.

### Mints, Burns, Locks

```bash
curl http://idx.testnet.deadmkt.com:8080/api/mints
curl http://idx.testnet.deadmkt.com:8080/api/burns
curl http://idx.testnet.deadmkt.com:8080/api/locks
```

---

## On-Chain View Functions

Query contract state directly via Supra RPC. All view functions are free (no gas).

### Get Market Pair

```bash
curl -X POST https://rpc-testnet.supra.com/rpc/v2/view \
  -H "Content-Type: application/json" \
  -d '{
    "function": "0x1c19ed...::settlement::get_market_pair",
    "type_arguments": [],
    "arguments": ["0x454d4d2f4b4159"]
  }'
```

### Get Escrow Balance

```bash
curl -X POST https://rpc-testnet.supra.com/rpc/v2/view \
  -H "Content-Type: application/json" \
  -d '{
    "function": "0x1c19ed...::escrow::get_balance",
    "type_arguments": [],
    "arguments": ["1", "0xaaa5fea4d387996a61c50cfb66a54e41c73af3d8e1a14d1a10cd3b7c8d1768eb"]
  }'
```

Arguments: `[nft_id, metadata_address]`

### Check if Address is Trustee

```bash
curl -X POST https://rpc-testnet.supra.com/rpc/v2/view \
  -H "Content-Type: application/json" \
  -d '{
    "function": "0x1c19ed...::nft::is_trustee",
    "type_arguments": [],
    "arguments": ["0xADDRESS"]
  }'
```

### Get Batch Parameters

```bash
curl -X POST https://rpc-testnet.supra.com/rpc/v2/view \
  -H "Content-Type: application/json" \
  -d '{
    "function": "0x1c19ed...::pool_config::get_batch_params",
    "type_arguments": [],
    "arguments": []
  }'
```

### Get Token Balance (Wallet)

```bash
curl -X POST https://rpc-testnet.supra.com/rpc/v2/view \
  -H "Content-Type: application/json" \
  -d '{
    "function": "0x1::primary_fungible_store::balance",
    "type_arguments": ["0x1::fungible_asset::Metadata"],
    "arguments": ["0xWALLET_ADDRESS", "0xTOKEN_METADATA_ADDRESS"]
  }'
```

---

## Running a Node

### Requirements

- Docker
- 1GB+ RAM
- Outbound internet (no port forwarding needed for non-bootstrap nodes)
- ~10 SUPRA for gas (testnet: free from faucet)

### Quick Start

```bash
# Build
mkdir ~/deadmkt-node && cd ~/deadmkt-node
unzip deadmkt-node-B5_7.zip
docker build -t deadmkt-node .

# Setup wizard (interactive)
docker run -it -v deadmkt-data:/data deadmkt-node deadmkt-node setup

# Run with strategy
docker run -d --name deadmkt-node \
  -v deadmkt-data:/data \
  -p 9191:9191 \
  -e DEADMKT_KEYSTORE_PASSWORD='your_password' \
  deadmkt-node

# Run as peer only (no strategy, no trading)
docker run -d --name deadmkt-peer \
  -v deadmkt-data:/data \
  -p 9191:9191 \
  -e DEADMKT_KEYSTORE_PASSWORD='your_password' \
  -e DEADMKT_NO_STRATEGY=1 \
  deadmkt-node
```

### Setup Wizard Flow

The wizard is resume-safe. If it fails mid-way, re-run it.

1. **Network** — Testnet (auto-selected)
2. **Beneficiary** — address that receives profits
3. **Keypair** — generates Ed25519, encrypts with password (or reuses existing keystore)
4. **Funding** — send SUPRA to the generated trustee address
5. **NFT** — mints TrusteeNFT + BeneficiaryNFT (1 SUPRA bond on testnet)
6. **Registration** — registers with escrow, configures withdrawal paths
7. **Token Minting** — auto-mints EMM/KAY/TEE from 90% of SUPRA (8 min hold)
8. **Deposit** — deposits all tokens to escrow
9. **Profit Config** — threshold percentage for sweeping profits to beneficiary
10. **Auth Token** — generated for strategy WebSocket connections

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DEADMKT_KEYSTORE_PASSWORD` | Decrypts signing key | Yes (runtime) |
| `DEADMKT_NO_STRATEGY` | Set to `1` to skip strategy wrapper | No |
| `DEADMKT_AUTH_TOKEN` | Override strategy auth token | No |

### Ports

| Port | Purpose | Expose? |
|------|---------|---------|
| 9090 | Strategy WebSocket (internal) | No (localhost only) |
| 9191 | Gossip P2P | Yes (if bootstrap peer) |

### Gas Configuration

Set in `/data/config.json`:

```json
{
  "max_gas_amount": 5000,
  "gas_unit_price": 100000
}
```

At `gas_unit_price: 100000`, max fee per transaction = `5000 × 100000 = 0.5 SUPRA`.

Heartbeats cost ~0.012 SUPRA each, every ~75 seconds on testnet. Budget ~8 SUPRA/day on testnet, ~4 SUPRA/day on mainnet.

---

## Writing Strategies

Strategies are Python files that implement `on_batch_start()`. They connect to the node via WebSocket and send orders each batch.

### Minimal Strategy

```python
def on_batch_start(data):
    """Called at the start of each COMMIT phase.
    
    Args:
        data: dict with keys:
            - batch_id: current batch number
            - pool_id: which pool this node is in
            - escrow: {"EMM": "20.00000", "KAY": "20.00000", "TEE": "20.00000"}
            - wallet: {"EMM": "0.00000", ...}
            - markets: [{"symbol": "EMM/KAY", "min_quantity": 1}, ...]
            
    Returns:
        List of order dicts, or empty list for no orders.
    """
    return []  # No orders this batch
```

### Order Format

```python
def on_batch_start(data):
    return [
        {
            "symbol": "EMM/KAY",
            "side": 0,           # 0 = buy, 1 = sell
            "price": 5010000,    # 5.01 in 6-decimal fixed point
            "quantity": 100000,  # 1.00000 in 5-decimal base units
        },
        {
            "symbol": "EMM/KAY",
            "side": 1,           # sell
            "price": 4990000,    # 4.99
            "quantity": 100000,
        },
    ]
```

### Strategy Events

| Event | Function | Description |
|-------|----------|-------------|
| `batch_start` | `on_batch_start(data)` | New commit phase — return orders |
| `reveal_start` | `on_reveal(data, my_commits)` | Reveal phase — return indices to reveal |
| `match_result` | `on_match(data, matches)` | Match results — informational |
| `settlement` | `on_settlement(data, details)` | Settlement complete — informational |

### Hot Reload

Edit `/data/strategy.py` while the node is running. Changes are detected at the next batch boundary and the strategy reloads automatically. No restart needed.

---

## Contract Modules

All deployed at `0x1c19ed2b9e864b6d565feeab65d8fed5204a78b4a9daf19ef7e198afc91b8ccf`:

| Module | Package | Purpose |
|--------|---------|---------|
| `settlement` | DeadMKT_Settlement | Market pairs, trade matching, settlement |
| `escrow` | DeadMKT_Settlement | Token custody, deposits, withdrawals |
| `nft` | DeadMKT_Settlement | TrusteeNFT/BeneficiaryNFT, bonds |
| `pool_config` | DeadMKT_Settlement | Batch params, pool sizing, heartbeat |
| `tokens` | DeadMKT | EMM/KAY/TEE minting, burning, locking, dVRF |

### Key Entry Functions

**Tokens:**
- `tokens::request_mint(m, k, t)` — Request token mint (costs SUPRA)
- `tokens::claim_mint()` — Claim after hold period
- `tokens::burn_mkt(amount)` — Burn equal triples, receive SUPRA back
- `tokens::lock_tokens(symbol, amount, duration)` — Lock tokens for duration
- `tokens::unlock_tokens(lock_id)` — Unlock after expiry

**Escrow:**
- `escrow::register_trader(nft_id, holding_days, rushed_enabled)` — Register for trading
- `escrow::deposit(metadata_addr, amount)` — Deposit tokens to escrow
- `escrow::heartbeat()` — Signal node is alive
- `escrow::deregister_trader(nft_id)` — Exit trading (starts bond cooldown)

**NFT:**
- `nft::mint_pair(pubkey, beneficiary)` — Mint TrusteeNFT + BeneficiaryNFT
- `nft::claim_bond(nft_id)` — Reclaim bond after lock period

**Settlement:**
- `settlement::add_market_pair(symbol, base_meta, quote_meta, min_qty)` — Admin: add pair
- `settlement::commit(...)` — Submit hashed orders (called by node)
- `settlement::reveal(...)` — Reveal commitments (called by node)
- `settlement::settle(...)` — Execute matched trades (called by node)

---

## Network Information

### Testnet

| Resource | Value |
|----------|-------|
| Chain ID | 6 |
| RPC | https://rpc-testnet.supra.com |
| Explorer | https://testnet.suprascan.io |
| VRF Address | `0x186ba2ba88f4a14ca51f6ce42702c7ebdf6bfcf738d897cc98b986ded6f1219e` |
| Bootstrap Peers | `peer1-5.testnet.deadmkt.com:9191` |

### Mainnet (Future)

| Resource | Value |
|----------|-------|
| Chain ID | 8 |
| RPC | https://rpc-mainnet.supra.com |
| VRF Address | `0x9672d46410f540b47d7e1f732640c776fa91ea1b909f871b9b2b7527b0ea90ae` |
| Bootstrap Peers | `peer1-5.deadmkt.com:9191` |

---

## Metadata Address Derivation

Token metadata addresses are deterministic named objects:

```
address = sha3_256(contract_address || seed || 0xFE)
```

Seeds: `deadmkt_emm`, `deadmkt_kay`, `deadmkt_tee`

This means any tool can compute the metadata addresses locally without an RPC call.

---

## Licenses

- **Node, Contracts, Indexer:** AGPL-3.0 (open source, copyleft)
- **Strategies, Starter Bot, Skill:** MIT (build and sell freely)

---

## Links

- **Docs:** https://deadmkt.com
- **GitHub:** https://github.com/deadmkt
- **X:** https://x.com/DeadMKT
- **Indexer API:** http://idx.testnet.deadmkt.com:8080/api/
