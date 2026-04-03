# WebSocket API

Your strategy communicates with the node over a WebSocket connection at `ws://localhost:9090`. The node sends events, the strategy sends actions.

## Connection and auth

Connect to `ws://localhost:9090` and immediately send an auth message:

```json
{"action": "auth", "token": "your_strategy_auth_token"}
```

The node responds with either:

```json
{
  "event": "auth_ok",
  "data": {
    "nft_id": 42,
    "trustee_address": "0xabcd...1234",
    "beneficiary_address": "0xef56...7890",
    "markets": ["EMM/KAY", "KAY/TEE", "TEE/EMM"],
    "token_decimals": 5,
    "price_decimals": 8,
    "contract_address": "0xbe4d...f009"
  }
}
```

or:

```json
{"event": "auth_failed", "data": {"reason": "invalid token"}}
```

If auth fails, the connection is closed. Your strategy auth token is in your `config.json`.

## Events (node → strategy)

### batch_start

Sent at the beginning of each batch cycle. Your strategy should respond with a `commit` action.

```json
{
  "event": "batch_start",
  "data": {
    "batch_id": 500,
    "pool_id": 2,
    "escrow": {"EMM": "330.00000", "KAY": "285.50000", "TEE": "310.25000"},
    "escrow_confirmed": {"EMM": "330.00000", "KAY": "285.50000", "TEE": "310.25000"},
    "wallet": {"EMM": "0.00000", "KAY": "44.50000", "TEE": "19.75000"},
    "gas_balance": "1.50000000",
    "mint_state": {
      "state": "OPEN",
      "hold_duration_secs": 259200,
      "period_end": 1772900000,
      "block_end": 0,
      "has_pending_mint": false,
      "pending_claimable_at": 0
    },
    "circulating": {"EMM": "150000.00000", "KAY": "148000.00000", "TEE": "152000.00000"},
    "vault_locks": [],
    "batch_params": {
      "blocks_per_batch": 10,
      "commits_per_batch": 3,
      "num_pools": 4
    },
    "pending_settlements": [],
    "peers_in_pool": 7,
    "min_trade_quantity": "1.00000",
    "last_batch": {"batch_id": 499, "matches": 3, "volume": "1500.00000"}
  }
}
```

### reveal_start

Sent when the reveal phase begins. Your strategy can optionally respond with a `reveal` action specifying which commits to reveal (default: all).

```json
{"event": "reveal_start", "data": {"batch_id": 500, "my_commits": ["0xabc...", "0xdef..."]}}
```

### match_result

Sent after matching completes. Shows your fills for this batch.

```json
{
  "event": "match_result",
  "data": {
    "batch_id": 500,
    "matches": [
      {
        "pair": "EMM/KAY",
        "side": "buy",
        "price": "0.05000000",
        "quantity": "100.00000",
        "counterparty_nft_id": 99
      }
    ]
  }
}
```

### settlement

Sent when a matched trade settles on-chain.

```json
{
  "event": "settlement",
  "data": {
    "batch_id": 500,
    "trade_id": "0xabcd...",
    "status": "confirmed",
    "pair": "EMM/KAY",
    "side": "buy",
    "clearing_price": "0.05000000",
    "base_amount": "100.00000",
    "quote_amount": "5.00000",
    "tx_hash": "0xtx..."
  }
}
```

### token_action_result

Sent after a token action (mint, burn, lock, unlock) completes.

```json
{"event": "token_action_result", "data": {"action": "mint", "success": true, "message": "gas=450"}}
```

```json
{"event": "token_action_result", "data": {"action": "burn", "success": false, "message": "E_INSUFFICIENT_BALANCE"}}
```

## Actions (strategy → node)

### auth

Must be the first message. See above.

### commit

Respond to `batch_start` with orders:

```json
{
  "action": "commit",
  "orders": [
    {"pair": "EMM/KAY", "side": "buy", "price": "0.04990000", "quantity": "100.00000"},
    {"pair": "KAY/TEE", "side": "sell", "price": "0.05100000", "quantity": "50.00000"}
  ]
}
```

### reveal

Respond to `reveal_start`. Usually you reveal all commits (the node does this by default), but you can selectively reveal:

```json
{"action": "reveal", "reveal_indices": [0, 1]}
```

### mint

Request a token mint. Amounts are in base units (5 decimal places: 33000000 = 330 tokens).

```json
{"action": "mint", "m": 33000000, "k": 33000000, "t": 33000000}
```

### claim_mint

Claim a pending mint after the hold period expires.

```json
{"action": "claim_mint"}
```

### burn

Burn equal amounts of all three tokens, receiving SUPRA back to your **trustee** address (gas recovery). Also accepts `"burn_from_escrow"` as the action name.

```json
{"action": "burn", "amount": 10000000}
```

### burn_to_beneficiary

Same as burn, but SUPRA goes to your **beneficiary** address (profit distribution).

```json
{"action": "burn_to_beneficiary", "amount": 10000000}
```

### lock

Lock tokens in the vault for a duration.

```json
{"action": "lock", "symbol": "EMM", "amount": 50000000, "duration_secs": 86400}
```

### unlock

Unlock tokens after the lock period expires.

```json
{"action": "unlock", "index": 2}
```

### donate_dust

Gift sub-minimum token amounts to another player's escrow. Amount must be less than the minimum trade quantity.

```json
{"action": "donate_dust", "recipient_nft_id": 5, "symbol": "KAY", "amount": 50000}
```

## Timing

The node waits **3 seconds** for your strategy to respond to `batch_start` with a `commit`. If no response arrives, the node skips this batch (no orders placed).

Token actions (mint, burn, lock, unlock) are processed asynchronously — you can send them anytime, not just during the commit window. Results arrive via `token_action_result` events.
