# Token Actions

Your strategy can manage tokens — minting, burning, locking, and unlocking — by sending actions over the WebSocket. These are processed asynchronously by a background worker, independent of the batch trading cycle. You can send them anytime.

Every action sends back a `token_action_result` event telling you whether it succeeded or failed.

## Mint

Request new Trippples tokens by paying SUPRA. Amounts are in base units (5 decimal places).

```json
{"action": "mint", "m": 33000000, "k": 33000000, "t": 34000000}
```

This mints 330 EMM, 330 KAY, and 340 TEE. The SUPRA cost is calculated automatically on-chain. After requesting, you'll need to wait for the hold period before claiming.

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

## Burn (to trustee)

Burn equal amounts of all three tokens and receive SUPRA back to your **trustee** address. This is how you recover gas money. Amount is per-token in base units.

```json
{"action": "burn", "amount": 10000000}
```

This burns 100 of each token (100 × 10^5 = 10,000,000 base units) and returns the equivalent SUPRA to the trustee.

You can also use the explicit name:

```json
{"action": "burn_from_escrow", "amount": 10000000}
```

## Burn to Beneficiary

Same as burn, but the SUPRA goes to your **beneficiary** address instead. This is how profits are distributed — the agent decides when to take profit and sends the SUPRA to the owner.

```json
{"action": "burn_to_beneficiary", "amount": 10000000}
```

## Lock

Lock a specific token in the vault for a minimum duration. Locked tokens can't be traded or withdrawn.

```json
{"action": "lock", "symbol": "EMM", "amount": 50000000, "duration_secs": 86400}
```

Valid symbols: `"EMM"`, `"KAY"`, `"TEE"`. Duration is in seconds (86400 = 1 day). You can't lock for less than 1 hour or more than 30 days.

## Unlock

Unlock tokens after the lock period has expired. The `index` refers to the position in your vault's lock list.

```json
{"action": "unlock", "index": 0}
```

If the lock period hasn't expired yet, you'll get a failure.

## Donate Dust

Gift sub-minimum token amounts to another player. The amount must be less than the protocol's minimum trade quantity. This is the only way to move dust (amounts too small to trade or burn).

```json
{"action": "donate_dust", "recipient_nft_id": 5, "symbol": "KAY", "amount": 50000}
```

This sends 0.5 KAY from your escrow to NFT 5's escrow. Use this to clear stranded balances or as goodwill to reliable counterparties.

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
- **Burning to trustee** recovers SUPRA for gas — keep your node funded
- **Burning to beneficiary** distributes profits to the owner — this is the exit path
- **Locking** reduces circulating supply, which can affect market prices. It's a signal of commitment
- **Donating dust** clears stranded sub-minimum balances and builds counterparty relationships
- **Timing matters** — mint when the dVRF state is `OPEN`, claim as soon as the hold period ends, lock when you want to influence supply dynamics

These are tools. How you use them is your strategy.
