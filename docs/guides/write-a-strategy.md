# Write a Strategy

A strategy is any program that connects to your node's WebSocket and decides what orders to place. It can be as simple as "buy low, sell high" or as sophisticated as a machine learning model that analyses circulating supply dynamics.

The node handles everything else — signing orders, committing to the gossip network, revealing, matching, and settling on-chain. Your strategy just says *what* to trade.

## The basics

Your strategy needs to:

1. Connect to `ws://localhost:9090`
2. Send an auth message with your strategy token
3. Listen for `batch_start` events
4. Respond with `commit` actions containing orders

That's it. Here's a minimal example in Python:

```python
import asyncio
import json
import websockets

TOKEN = "your_strategy_auth_token"
WS_URL = "ws://localhost:9090"

async def run():
    async with websockets.connect(WS_URL) as ws:
        # Authenticate
        await ws.send(json.dumps({"action": "auth", "token": TOKEN}))
        auth_resp = json.loads(await ws.recv())
        print(f"Auth: {auth_resp['event']}")

        # Trading loop
        while True:
            msg = json.loads(await ws.recv())
            
            if msg["event"] == "batch_start":
                data = msg["data"]
                print(f"Batch {data['batch_id']} — escrow: {data['escrow']}")
                
                # Place orders
                await ws.send(json.dumps({
                    "action": "commit",
                    "orders": [
                        {
                            "pair": "EMM/KAY",
                            "side": "buy",
                            "price": "0.04990000",
                            "quantity": "100.00000"
                        },
                        {
                            "pair": "EMM/KAY",
                            "side": "sell",
                            "price": "0.05100000",
                            "quantity": "50.00000"
                        }
                    ]
                }))

asyncio.run(run())
```

## What your strategy receives

Every batch, your strategy gets a `batch_start` event with everything it needs:

```json
{
  "event": "batch_start",
  "data": {
    "batch_id": 500,
    "pool_id": 2,
    "escrow": {
      "EMM": "330.00000",
      "KAY": "285.50000",
      "TEE": "310.25000"
    },
    "wallet": {
      "EMM": "0.00000",
      "KAY": "44.50000",
      "TEE": "19.75000"
    },
    "mint_state": {
      "state": "OPEN",
      "hold_duration_secs": 259200,
      "has_pending_mint": false
    },
    "circulating": {
      "EMM": "150000.00000",
      "KAY": "148000.00000",
      "TEE": "152000.00000"
    },
    "vault_locks": [],
    "batch_params": {
      "blocks_per_batch": 10,
      "commits_per_batch": 3,
      "num_pools": 4
    },
    "peers_in_pool": 7
  }
}
```

Your strategy can use any of this data to make decisions:

- **escrow** — what you have available to trade
- **wallet** — tokens in your wallet (not yet deposited to escrow)
- **mint_state** — whether the mint window is open, your pending mint status
- **circulating** — network-wide token supply for all three tokens
- **vault_locks** — any tokens you've locked and when they unlock
- **batch_params** — how many orders you can submit this batch
- **peers_in_pool** — how many counterparties are in your pool

## Order format

Orders go in the `commit` action:

```json
{
  "action": "commit",
  "orders": [
    {
      "pair": "EMM/KAY",
      "side": "buy",
      "price": "0.04990000",
      "quantity": "100.00000"
    }
  ]
}
```

| Field | Format | Notes |
|-------|--------|-------|
| `pair` | `"EMM/KAY"`, `"KAY/TEE"`, or `"TEE/EMM"` | Must be an active market |
| `side` | `"buy"` or `"sell"` | |
| `price` | String, 8 decimal places | `"0.05000000"` = 0.05 |
| `quantity` | String, 5 decimal places | `"330.00000"` = 330 tokens |

Prices always use 8 decimal places. Quantities use 5 (matching the token decimals). Both are strings to avoid floating-point issues.

## Multiple pairs

You can trade all three pairs in a single batch:

```python
orders = [
    {"pair": "EMM/KAY", "side": "buy",  "price": "0.05000000", "quantity": "100.00000"},
    {"pair": "KAY/TEE", "side": "sell", "price": "0.04800000", "quantity": "50.00000"},
    {"pair": "TEE/EMM", "side": "buy",  "price": "0.05200000", "quantity": "75.00000"},
]
```

The number of orders per batch is limited by `commits_per_batch` (typically 3). If you send more, the extras are silently dropped with a warning in the node logs.

## Strategy ideas

The starter bot uses a simple spread strategy — buy slightly below a reference price, sell slightly above. But the data available to your strategy enables much more:

- **Supply-aware strategies** — `circulating` tells you how much of each token exists. If EMM supply is dropping (people burning or locking), that's a signal.
- **Multi-pair arbitrage** — the three pairs form a cycle. If EMM/KAY × KAY/TEE × TEE/EMM ≠ 1, there's a triangular arbitrage opportunity.
- **Adaptive pricing** — use `last_batch` results to adjust your spread dynamically based on whether your orders filled.
- **AI-powered strategies** — feed the `batch_start` data into a model. Let your AI decide the orders. That's the whole point.

## Testing

Run your strategy locally against a node in demo mode. If the node has no peers, your orders won't match — but you can verify that:

1. Your strategy connects and authenticates
2. `batch_start` events arrive each cycle
3. Your `commit` response is accepted (check node logs for "orders validated from strategy")

Once you're satisfied, connect to a node that's on the live testnet with peers.

## Next steps

- [WebSocket API](/guides/websocket-api) — complete reference for all events and actions
- [Token Actions](/guides/token-actions) — how to mint, burn, lock, unlock from your strategy
