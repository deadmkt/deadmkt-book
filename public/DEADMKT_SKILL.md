---
name: deadmkt
version: 0.2.0
description: DeadMKT — Peer-to-peer trading protocol on Supra L1. Connect via WebSocket, trade in batch cycles, manage tokens. Your AI runs your node.
homepage: https://deadmkt.com
metadata: {"category":"defi","chain":"supra","license":"AGPL-3.0","api_base":"ws://localhost:9090"}
---

# DeadMKT Skill

DeadMKT is a peer-to-peer electronic communication network for trading. No broker, no counterparty, no hidden extraction. Traders run nodes that commit/reveal/match/settle in batch cycles. Every settlement is on-chain. Every price is math, not opinion.

Your AI connects to your node via WebSocket, receives market data each batch, and sends trading decisions back. The node handles signing, gossip, and settlement.

## Skill Files

| File | URL |
|------|-----|
| **SKILL.md** (this file) | `https://deadmkt.com/DEADMKT_SKILL.md` |

**Install locally:**
```bash
mkdir -p ~/.deadmkt/skills
curl -s https://deadmkt.com/DEADMKT_SKILL.md > ~/.deadmkt/skills/SKILL.md
```

## Quick Reference

| Resource | URL |
|----------|-----|
| Website | https://deadmkt.com |
| Docs | https://deadmkt.com/docs/ |
| Live Trades | https://deadmkt.com/trades |
| Indexer API | https://idx-testnet.deadmkt.com/api |
| Testnet RPC | https://rpc-testnet.supra.com |
| Contract | `0xc4b49db5a93d5cc419b2a2af168b553016e8d509b6aff74d2d5e29f8e7c74e64` |
| GitHub | https://github.com/deadmkt |
| X | https://x.com/DeadMKT |

---

## How It Works

DeadMKT operates in **batch cycles** of 20 blocks (~7 seconds):

1. **COMMIT** (6 blocks) -- Nodes submit hashed orders. Nobody sees prices or quantities.
2. **REVEAL** (8 blocks) -- Nodes reveal their commitments. Prices become visible.
3. **MATCH** (2 blocks) -- Protocol matches compatible buy/sell orders within the pool.
4. **SWAP** (4 blocks) -- Matched trades settle on-chain via escrow. Tokens move atomically.

Your strategy only needs to respond during COMMIT. Everything else is handled by the node.

---

## WebSocket API

Your strategy connects to `ws://localhost:9090` inside the Docker container. The node sends events, your strategy sends actions.

### Connection

Connect and immediately authenticate:

```json
{"action": "auth", "token": "your_strategy_auth_token"}
```

Success:
```json
{"event": "auth_ok", "data": {"nft_id": 42, "network": "testnet"}}
```

The auth token is in your node's `config.json` or `DEADMKT_AUTH_TOKEN` env var.

### Events (node -> strategy)

#### batch_start

Sent at the start of each COMMIT phase. Respond with orders within 3 seconds.

```json
{
  "event": "batch_start",
  "data": {
    "batch_id": 500,
    "pool_id": 2,
    "escrow": {"EMM": "330.00000", "KAY": "285.50000", "TEE": "310.25000"},
    "escrow_confirmed": {"EMM": "330.00000", "KAY": "285.50000", "TEE": "310.25000"},
    "wallet": {"EMM": "0.00000", "KAY": "0.00000", "TEE": "0.00000"},
    "gas_balance": "1.50000000",
    "mint_state": {
      "state": "OPEN",
      "hold_duration_secs": 432000,
      "period_end": 1774356628,
      "block_end": 0,
      "has_pending_mint": false,
      "pending_claimable_at": 0
    },
    "circulating": {"EMM": "150000.00000", "KAY": "148000.00000", "TEE": "152000.00000"},
    "vault_locks": [],
    "batch_params": {
      "blocks_per_batch": 20,
      "commits_per_batch": 3
    },
    "pending_settlements": [],
    "peers_in_pool": 3,
    "last_batch": {"batch_id": 499, "matches": 3, "volume": "1500.00000"},
    "node_health": {
      "gas_status": "Normal",
      "gossip_connected": true,
      "gossip_peers": 4,
      "settle_pending_count": 0,
      "settle_failed_recent": 0,
      "uptime_batches": 1200,
      "block_height": 79000000,
      "timestamp": 1774090000
    }
  }
}
```

**Key fields for trading decisions:**
- `escrow` -- your available balances (projected, accounts for pending trades)
- `escrow_confirmed` -- on-chain confirmed balances
- `peers_in_pool` -- how many other nodes you're trading against
- `mint_state.has_pending_mint` -- whether you have unclaimed tokens
- `gas_balance` -- SUPRA for transaction fees
- `last_batch.matches` -- how many trades filled last batch

#### reveal_start

```json
{"event": "reveal_start", "data": {"batch_id": 500, "my_commits": ["0xabc...", "0xdef..."]}}
```

Usually you reveal everything. Return indices of commits to reveal.

#### match_result

```json
{
  "event": "match_result",
  "data": {
    "batch_id": 500,
    "matches": [
      {"pair": "EMM/KAY", "side": "buy", "price": "0.05000000", "quantity": "100.00000", "counterparty_nft_id": 99}
    ]
  }
}
```

#### settlement

```json
{
  "event": "settlement",
  "data": {
    "batch_id": 500,
    "trade_id": "0xabcd...",
    "status": "confirmed",
    "pair": "EMM/KAY",
    "clearing_price": "0.05000000",
    "base_amount": "100.00000",
    "tx_hash": "0xtx..."
  }
}
```

#### token_action_result

```json
{"event": "token_action_result", "data": {"action": "mint", "success": true, "message": "gas=450"}}
```

### Actions (strategy -> node)

#### commit -- Place orders

Respond to `batch_start` within 3 seconds:

```json
{
  "action": "commit",
  "orders": [
    {"pair": "EMM/KAY", "side": "buy", "price": "0.04990000", "quantity": "100.00000"},
    {"pair": "KAY/TEE", "side": "sell", "price": "0.05100000", "quantity": "50.00000"}
  ]
}
```

**Order fields:**
- `pair` -- one of `EMM/KAY`, `KAY/TEE`, `TEE/EMM`
- `side` -- `"buy"` or `"sell"`
- `price` -- 8 decimal string (e.g. `"0.05000000"`)
- `quantity` -- 5 decimal string (e.g. `"100.00000"`)

Up to 3 orders per batch (`commits_per_batch`). Orders that cross (buyer price >= seller price) will match.

#### reveal -- Select which commits to reveal

```json
{"action": "reveal", "reveal_indices": [0, 1]}
```

Default: reveal all. Only respond if you want to selectively withhold.

#### Token actions (send anytime)

**mint** -- Request new tokens (costs SUPRA):
```json
{"action": "mint", "m": 33000000, "k": 33000000, "t": 33000000}
```

**claim_mint** -- Claim after hold period:
```json
{"action": "claim_mint"}
```

**burn** -- Burn tokens, receive SUPRA:
```json
{"action": "burn", "amount": 10000000}
```

**lock** -- Lock tokens in vault:
```json
{"action": "lock", "symbol": "EMM", "amount": 50000000, "duration_secs": 86400}
```

**unlock** -- Unlock after expiry:
```json
{"action": "unlock", "index": 0}
```

Token actions are processed asynchronously. Results arrive via `token_action_result`.

Return token actions alongside orders:
```json
{
  "action": "commit",
  "orders": [...],
  "token_actions": [{"action": "claim_mint"}]
}
```

---

## Strategy Pattern

A minimal Python strategy:

```python
from decimal import Decimal

def on_auth(data):
    """Called once after authentication. Return token actions or []."""
    return []

def on_batch_start(ctx):
    """Called each COMMIT phase. Return orders or {orders, token_actions}."""
    escrow = ctx.get("escrow", {})
    batch_id = ctx.get("batch_id", 0)

    emm = Decimal(escrow.get("EMM", "0"))
    kay = Decimal(escrow.get("KAY", "0"))

    orders = []
    if emm > Decimal("1.0"):
        orders.append({
            "pair": "EMM/KAY",
            "side": "sell",
            "price": "0.05000000",
            "quantity": str((emm * Decimal("0.01")).quantize(Decimal("0.00001"))),
        })

    return orders

def on_reveal(ctx, my_commits):
    """Called at REVEAL phase. Return indices to reveal (default: all)."""
    return list(range(len(my_commits)))

def on_match(ctx, matches):
    """Called after matching. Informational."""
    pass

def on_settlement(ctx, result):
    """Called after settlement. Informational."""
    pass

def on_token_result(data):
    """Called after token action completes."""
    pass
```

Mount as strategy:
```bash
docker run -d --name deadmkt-node \
  -v ~/.deadmkt-node:/data \
  -v ~/my_strategy.py:/data/strategy.py \
  -e DEADMKT_KEYSTORE_PASSWORD='password' \
  -p 9090:9090 -p 9191:9191 \
  deadmkt-node:0.1.7
```

---

## Tokens (Trippples)

Three fungible tokens, all 5 decimals. Circular economy: each appears as base in one pair and quote in another.

| Symbol | Decimals | 1.0 = raw |
|--------|----------|-----------|
| EMM | 5 | 100,000 |
| KAY | 5 | 100,000 |
| TEE | 5 | 100,000 |

**SUPRA** (gas/backing): 8 decimals, 1.0 = 100,000,000 raw.

### Token Metadata Addresses (DMKT10)

| Symbol | Metadata Address |
|--------|-----------------|
| EMM | Derived: `sha3_256(contract_addr \|\| "deadmkt_emm" \|\| 0xFE)` |
| KAY | Derived: `sha3_256(contract_addr \|\| "deadmkt_kay" \|\| 0xFE)` |
| TEE | Derived: `sha3_256(contract_addr \|\| "deadmkt_tee" \|\| 0xFE)` |

Metadata addresses are deterministic named objects -- compute locally without RPC.

### Market Pairs

| Pair | Base | Quote | Symbol Hex |
|------|------|-------|-----------|
| EMM/KAY | EMM | KAY | `0x454d4d2f4b4159` |
| KAY/TEE | KAY | TEE | `0x4b41592f544545` |
| TEE/EMM | TEE | EMM | `0x5445452f454d4d` |

### Token Lifecycle

```
    SUPRA --> request_mint --> [hold period] --> claim_mint --> ESCROW
                                                                 |
                                                          trade (batch cycle)
                                                                 |
                                                     burn_from_escrow --> SUPRA
```

Tokens never exist in free wallets. They live in escrow (trading), vault (locked), or don't exist (burned). SUPRA is the only exit currency.

---

## Indexer API

**Base URL:** `https://idx-testnet.deadmkt.com/api`

All GET requests. No authentication required.

| Endpoint | Description |
|----------|-------------|
| `/api/health` | Health check |
| `/api/stats` | Total trades, volume, mints, trustees, last indexed block |
| `/api/markets` | Market pairs with last price, high/low, trade count, volume |
| `/api/trades` | Recent trades (filterable: `?pair=EMM/KAY&limit=50`) |
| `/api/trades/:id` | Single trade by ID |
| `/api/events` | All indexed events (filterable: `?type=MintRequested`) |
| `/api/trustee/:address` | Events for a specific trustee |
| `/api/mints` | Mint events |
| `/api/burns` | Burn events |
| `/api/locks` | Lock/unlock events |

### Example: Get latest trades

```bash
curl -s https://idx-testnet.deadmkt.com/api/trades?limit=10
```

### Example: Check network stats

```bash
curl -s https://idx-testnet.deadmkt.com/api/stats
```

Response:
```json
{
  "last_indexed_block": 79132325,
  "total_trades": 1830,
  "total_mints": 6,
  "total_burns": 0,
  "total_trustees": 6,
  "total_volume": 22808058
}
```

---

## Running a Node

### Requirements

- Docker
- 1GB+ RAM
- Outbound internet
- ~50 SUPRA for initial setup + gas (testnet: free from faucet)

### Quick Start

```bash
# Build
docker build -t deadmkt-node:0.1.7 .

# Setup wizard (interactive -- creates keypair, mints NFT, registers with escrow)
docker run -it --rm -v ~/.deadmkt-node:/data deadmkt-node:0.1.7 deadmkt-node setup

# Run with strategy
docker run -d --name deadmkt-node \
  -v ~/.deadmkt-node:/data \
  -v ~/my_strategy.py:/data/strategy.py \
  -e DEADMKT_KEYSTORE_PASSWORD='password' \
  -p 9090:9090 -p 9191:9191 \
  deadmkt-node:0.1.7

# Run as bootstrap peer (no trading)
docker run -d --name deadmkt-peer \
  -v ~/.deadmkt-peer:/data \
  -e DEADMKT_NO_STRATEGY=1 \
  -e DEADMKT_KEYSTORE_PASSWORD='password' \
  -p 9090:9090 -p 9191:9191 \
  deadmkt-node:0.1.7
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DEADMKT_KEYSTORE_PASSWORD` | Decrypts signing key (required at runtime) |
| `DEADMKT_NO_STRATEGY` | Set to `1` for bootstrap/relay mode |
| `DEADMKT_AUTH_TOKEN` | Override strategy auth token |
| `DEADMKT_HEALTH_EXTERNAL` | Set to `1` to expose health endpoint on 0.0.0.0 |

### Ports

| Port | Purpose |
|------|---------|
| 9090 | Strategy WebSocket (localhost by default) |
| 9191 | Gossip P2P (libp2p) |
| 9292 | Health endpoint (localhost by default) |

### Health Endpoint

```bash
curl http://localhost:9292
```

Response:
```json
{"status": "ok", "peers": 4, "block": 79000000}
```

---

## Network Information

### Testnet

| Resource | Value |
|----------|-------|
| Chain ID | 6 |
| RPC | https://rpc-testnet.supra.com |
| Explorer | https://testnet.suprascan.io |
| Contract | `0xc4b49db5a93d5cc419b2a2af168b553016e8d509b6aff74d2d5e29f8e7c74e64` |
| Bootstrap Peers | `peer1.testnet.deadmkt.com:9191` |

---

## Licenses

- **Node, Contracts, Indexer:** AGPL-3.0
- **Strategies, Starter Bot, Skill:** MIT (build and sell freely)

---

## Links

- **Docs:** https://deadmkt.com/docs/
- **Live Trades:** https://deadmkt.com/trades
- **GitHub:** https://github.com/deadmkt
- **X:** https://x.com/DeadMKT
- **Indexer API:** https://idx-testnet.deadmkt.com/api/
