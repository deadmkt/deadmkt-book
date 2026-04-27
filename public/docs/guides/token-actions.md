# Token Actions

Your strategy can manage tokens — minting, burning, locking, and unlocking — by sending actions over the WebSocket. These are processed asynchronously by a background worker, independent of the batch trading cycle. You can send them anytime.

Every action sends back a `token_action_result` event telling you whether it succeeded or failed.

## Mint

Request new Trippples tokens by paying SUPRA. Amounts are in base units (5 decimal places).

```json
{"action": "mint", "m": 33000000, "k": 33000000, "t": 33000000}
```

This mints 330 EMM, 330 KAY, and 330 TEE. The SUPRA cost is calculated automatically on-chain. After requesting, you'll need to wait for the hold period before claiming.

**Response:**
```json
{"event": "token_action_result", "data": {"action": "mint", "success": true, "message": "gas=450"}}
```

## Claim Mint

After the hold period expires, claim your minted tokens.

```json
{"action": "claim_mint"}
```

If the hold period hasn't passed yet, you'll get a failure:
```json
{"event": "token_action_result", "data": {"action": "claim_mint", "success": false, "message": "E_HOLD_PERIOD_ACTIVE"}}
```

## Burn

Burn equal amounts of all three tokens and receive SUPRA back. Amount is per-token in base units.

```json
{"action": "burn", "amount": 10000000}
```

This burns 100 of each token (100 × 10^5 = 10,000,000 base units) and returns the equivalent SUPRA.

## Lock

Lock a specific token in the vault for a minimum duration. Locked tokens can't be traded or withdrawn.

```json
{"action": "lock", "symbol": "EMM", "amount": 50000000, "duration_secs": 86400}
```

Valid symbols: `"EMM"`, `"KAY"`, `"TEE"`. Duration is in seconds (86400 = 1 day).

## Unlock

Unlock tokens after the lock period has expired. The `index` refers to the position in your vault's lock list.

```json
{"action": "unlock", "index": 0}
```

If the lock period hasn't expired yet, you'll get a failure.

## Checking your state

The `batch_start` event includes your current mint state and vault locks:

```json
{
  "mint_state": {
    "state": "OPEN",
    "has_pending_mint": true,
    "pending_claimable_at": 1772900000
  },
  "vault_locks": [
    {"symbol": "EMM", "amount": "500.00000", "unlock_at": 1772950000, "claimed": false}
  ]
}
```

Use this data to decide when to claim mints or unlock tokens.

## Strategic considerations

- **Minting** increases your capital but costs SUPRA and has an unpredictable hold period
- **Burning** reduces your token exposure and returns SUPRA — useful when you want to exit a position entirely
- **Locking** reduces circulating supply, which can affect market prices. It's a signal of commitment
- **Timing matters** — mint when the dVRF state is `OPEN`, claim as soon as the hold period ends, lock when you want to influence supply dynamics

These are tools. How you use them is your strategy.
