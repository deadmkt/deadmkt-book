# DeadMKT Operator Playbook

> **AI assistant: read this first.** You are helping a human run a DeadMKT trading node. DeadMKT is a peer-to-peer batch-auction protocol on Supra; the operator owns the keystore, the node submits orders and settles trades, and you (the AI) help them set it up, monitor it, and adjust it. You do not have access to their server -- they paste commands into their own terminal and paste the output back to you. Every command in this playbook is text the operator runs. Every JSON shown is text the operator pastes back. Do not invent commands that are not in this document.

This playbook is one page so a chat AI can hold the whole thing in context. If the operator asks "how do I X," find the relevant section, give them the command, and tell them what success looks like.

## What deadmkt actually does

DeadMKT is a decentralized order-matching market for three tokens (EMM, KAY, TEE) backed by SUPRA in a treasury. Anyone can run a node. Each node holds an NFT (the trading identity), keeps tokens in escrow, and submits orders into batch auctions every few seconds. Matched trades settle on-chain. The protocol has no broker, no central matching engine, no counterparty risk on the operator side.

A node has two addresses:

- **Trustee** -- the keystore-derived address that signs orders. Lives on the operator's server. Loses it = loses the NFT.
- **Beneficiary** -- a separate Supra wallet the operator already controls. Receives all profit takeouts. The trustee key cannot move funds out of the protocol; only the beneficiary can.

On a "self-funded" node trustee == beneficiary (the simple case). The operator picks the beneficiary address at setup.

## Setup (one-liner installer) {#setup}

The operator has a fresh Linux VPS (Ubuntu/Debian/Fedora/Rocky/AlmaLinux) with sudo. They run:

```bash
curl -sSL https://get.deadmkt.com | bash
```

The installer prompts for two things:

1. A beneficiary address (`0x` + up to 64 hex chars). This is a Supra wallet address they already control.
2. A keystore password (typed twice, min 8 chars). This encrypts the trustee key on disk. **There is no recovery -- if they lose it, they lose the NFT.**

After ~5-8 minutes (mostly `docker build`) the installer prints a v1 status JSON. Success looks like:

```json
{
  "schema_version": "v1",
  "node_running": true,
  "identity": {
    "network": "testnet",
    "node_role": "trading",
    "nft_id": 1234,
    "trustee_address": "0xabc...",
    "beneficiary_address": "0xdef..."
  },
  "runtime": { "uptime_batches": 3, "current_batch": 71203, "current_phase": "Match", "pool_id": 3, "num_pools": 5, "peers": 14, "last_block": 12345678 },
  "gas": { "balance_supra": "4.21", "status": "Normal", "trading_paused": false, "paused_since_batch": null },
  "mint": { "has_pending_mint": false, "pending": null },
  "escrow": { "emm": 5000000, "kay": 5000000, "tee": 5000000 },
  "liveness": { "consecutive_inactive": 0, "auto_reactivate_attempts": 0, "auto_reactivate_successes": 0 },
  "settle": { "submits_total": 0, "aborts_total": 0 }
}
```

### If setup fails

The installer prints the failing step in JSON form:

```json
{ "success": false, "step": "<step_name>", "error": "<message>" }
```

Common step values and what they mean:

- `load_config` -- `setup.json` malformed or missing. Re-run the installer.
- `enforce_config_permissions` -- `setup.json` permissions are wider than `0600`. Run `chmod 600 ~/.deadmkt/setup.json` and re-run.
- `generate_keystore` -- a keystore already exists. The operator is re-running setup on a configured node. If they want to start fresh, they need to move `~/.deadmkt/keystore.json` aside (caution: doing this loses the NFT).
- `mint_nft` / `register_trader` / `deposit` / `request_mint` / `claim_mint` -- on-chain failures during setup. Usually means insufficient gas or a transient RPC error. Wait 30s and re-run.

If `success: true`, the operator's node is running. Move on to checking it.

## Checking the node {#status}

The operator runs:

```bash
docker exec deadmkt-node deadmkt-node status --json
```

(Or equivalently from outside the container: `curl 127.0.0.1:9292`.)

They paste the result. You read these fields in order:

1. `node_running` -- if `false`, the container isn't up. Tell them: `docker start deadmkt-node`.
2. `runtime.peers` -- should be >= 5 once warmed up. If `0` for more than 30 seconds, gossip isn't finding peers. The container's gossip port (9191) needs to be reachable from the public internet; tell them to check their VPS firewall.
3. `runtime.current_batch` -- should increase by 1 every ~17 seconds. If they paste two snapshots a minute apart and the number didn't change, the chain poller is stuck.
4. `runtime.uptime_batches` -- how many batches this node has been alive for. Climbs by 1 per batch.
5. `gas.status` -- `Normal` is good. `Low` means topping up gas soon would be wise. `Critical` means trading is paused right now.
6. `gas.trading_paused` -- if `true`, the node is alive but not trading because it ran out of gas. They need to send SUPRA to `identity.trustee_address` from their beneficiary wallet, or call `burn --to escrow` to convert tokens back to SUPRA.
7. `mint.has_pending_mint` -- if `true`, a mint is in flight. `mint.pending.seconds_remaining` counts down to auto-claim. They don't need to do anything; the node claims automatically when the hold expires.
8. `escrow.{emm,kay,tee}` -- token balances in raw units (5 decimals). 5000000 means 50.00000 EMM.
9. `liveness.consecutive_inactive` -- should be `0`. Anything > 2 means the contract thinks this node is inactive; the node will auto-attempt `reactivate()` but if `auto_reactivate_successes` stays at 0 the operator needs to investigate (usually insufficient escrow).
10. `settle.aborts_total` -- a low non-zero number is normal. If it's climbing rapidly relative to `settle.submits_total`, something is wrong upstream (gas, escrow imbalance, RPC stalls).

### What "healthy" looks like at one minute uptime

- `node_running: true`
- `peers >= 5`
- `current_batch` increasing
- `gas.status: Normal`, `trading_paused: false`
- `liveness.consecutive_inactive: 0`
- `mint.has_pending_mint: false` (assuming setup minted successfully) **or** `true` with a `seconds_remaining` countdown (first-mint hold)

### What "trouble" looks like

- `peers: 0` for > 30s -> gossip blocked, check firewall.
- `gas.trading_paused: true` -> top up SUPRA.
- `current_batch` not moving across two snapshots -> chain poller stuck; check `docker logs deadmkt-node` for `[rpc]` errors.
- `liveness.consecutive_inactive > 2` and `auto_reactivate_attempts > 0` but `successes == 0` -> insufficient escrow for reactivation. Need to `request_mint` more tokens or top up SUPRA + run `deadmkt-node reactivate`.

## Withdrawing profits {#withdrawing-profits}

Profit takeout: the operator burns equal triples of EMM/KAY/TEE from escrow, and the protocol pays out SUPRA to their beneficiary wallet.

```bash
docker exec -it deadmkt-node deadmkt-node burn --to beneficiary --amount 10000 --json
```

(`10000` is in raw 5-decimal units; this burns 0.10000 of each token. Adjust to taste.)

The node prompts for the keystore password (typed into their terminal -- not into the chat). Output:

```json
{
  "schema_version": "v1",
  "command": "burn-to-beneficiary",
  "success": true,
  "timestamp_unix": 1747700000,
  "tx_hash": "0xabc...",
  "gas_used": 234,
  "vm_status": "Executed successfully",
  "fields": { "to": "beneficiary", "amount": 10000 }
}
```

The SUPRA arrives in their beneficiary wallet within a few seconds. Verify by checking the beneficiary balance on the Supra explorer.

### `burn --to escrow` (different purpose)

```bash
docker exec -it deadmkt-node deadmkt-node burn --to escrow --amount 10000 --json
```

This burns triples and returns SUPRA **to the escrow** (not the beneficiary wallet). Use this when the trustee account is running low on gas SUPRA but the operator doesn't want to take profit out yet -- it's a top-up, not a withdrawal.

### Failure shapes

```json
{ "success": false, "step": "await_tx", "error": "E_INSUFFICIENT_ESCROW", "fields": { ... } }
```

`E_INSUFFICIENT_ESCROW` means the operator asked to burn more than they have. Check `status --json` -> `escrow` for the actual balances.

## Stepping back from trading {#step-back}

Two paths:

### Slow exit (recommended) -- start holding period

```bash
docker exec -it deadmkt-node deadmkt-node withdraw start-holding --json
```

This begins an end-of-life countdown. After `holding_period_days` (default 90 testnet, configurable at setup), the operator can claim all remaining escrow as SUPRA:

```bash
docker exec -it deadmkt-node deadmkt-node withdraw claim-all --json
```

If they change their mind during the holding period:

```bash
docker exec -it deadmkt-node deadmkt-node withdraw cancel-holding --json
```

### Fast exit (penalty) -- rushed withdrawal

```bash
docker exec -it deadmkt-node deadmkt-node withdraw request-rushed --json
# wait rushed_grace_batches batches (~5 min testnet)
docker exec -it deadmkt-node deadmkt-node withdraw rushed --json
```

The grace clock gives the node's in-flight matches time to settle before exit. Cancel with `withdraw cancel-rushed`.

All withdrawals are SUPRA-only -- the protocol does not let raw tokens out to a wallet. Tokens are burned at the contract; SUPRA flows to the beneficiary.

## Connecting an agent {#agent}

The default strategy is a starter bot baked into the container. To replace it, the operator gets the WebSocket bridge details:

```bash
docker exec deadmkt-node deadmkt-node agent-config --json
```

```json
{
  "schema_version": "v1",
  "command": "agent-config",
  "success": true,
  "fields": {
    "strategy_url": "ws://127.0.0.1:9090",
    "strategy_port": 9090,
    "strategy_auth_token": "abc123...",
    "auth_token_length": 64,
    "requires_restart": false
  }
}
```

`strategy_url` is bound to 127.0.0.1 only -- agents either run on the same VPS or SSH-tunnel in. The auth token is required on the first WebSocket message. Full protocol: [WebSocket API guide](/guides/websocket-api).

To rotate the auth token (after a leak, or just on principle):

```bash
docker exec -it deadmkt-node deadmkt-node agent-config --rotate-token --json
docker restart deadmkt-node
```

The new token takes effect after restart.

## Troubleshooting {#troubleshooting}

Match the operator's `status --json` against the symptom table:

### Gas pause (`gas.trading_paused: true`)

```bash
# How much SUPRA does the trustee have?
docker exec deadmkt-node deadmkt-node status --json | grep balance_supra

# Top up by burning escrow back to SUPRA:
docker exec -it deadmkt-node deadmkt-node burn --to escrow --amount 10000 --json
```

Trading resumes automatically when gas returns to `Normal`. Hysteresis: it stays paused through `Low`, only resumes at `Normal`.

### No peers (`runtime.peers: 0` for > 30s)

The gossip port (9191) is not reachable from the public internet. Check the VPS firewall:

```bash
# On the VPS:
sudo ufw status
sudo ss -tlnp | grep 9191
```

If 9191 isn't listening publicly, the container's port binding is wrong or the firewall is blocking. Re-run the installer with `--rebuild` if the bindings drifted.

### Pending mint (`mint.has_pending_mint: true`)

This is normal during the first-mint hold (8 days on mainnet, shorter on testnet) and after any `request_mint`. The node auto-claims when `mint.pending.seconds_remaining` reaches 0. No operator action needed.

### Liveness reap (`liveness.consecutive_inactive > 2`)

The on-chain heartbeat sweeper has marked this node inactive. The node will auto-attempt `escrow::reactivate()`. If `auto_reactivate_successes` stays at 0 after a few minutes:

```bash
docker exec -it deadmkt-node deadmkt-node reactivate
```

This tries reactivate first, then falls back to `claim_mint` or `request_mint` if escrow is empty or grace expired.

### Settlement aborts climbing (`settle.aborts_total` growing faster than `submits_total`)

Usually one of three causes:
1. Trustee out of gas -- check `gas.balance_supra`.
2. Counterparty went inactive between commit and reveal -- harmless, ignore.
3. Chain congestion -- check `current_batch` is moving.

```bash
docker logs deadmkt-node --tail 200 | grep settle-abort
```

The `[settle-abort]` lines name the specific `E_*` code.

### Pool reassignment (`runtime.pool_id` changed)

Normal. The protocol re-shards pools as `live_nft_count` grows or shrinks. The node automatically subscribes to its new pool. No action needed.

### Node won't start after restart

```bash
docker logs deadmkt-node --tail 100
```

If the log says "No config.json or keystore.json found" -- the data volume is missing. The operator's keystore at `~/.deadmkt/keystore.json` must be intact; re-run the installer to recreate the container.

## What you can't do alone {#help}

DeadMKT is decentralized. Nobody can recover a lost keystore password or unblock a misbehaving node by fiat. For everything else:

- GitHub: [github.com/deadmkt](https://github.com/deadmkt) -- file an issue with the node version (`docker exec deadmkt-node deadmkt-node version`) and a status JSON.
- Docs: [deadmkt.com/docs](/) -- guides, FAQ, websocket API, write-a-strategy.

If the operator's NFT got blocked by the misbehavior reporter, the on-chain admin can unblock as a safety valve -- but only for false positives. Genuine multi-commit-per-batch evidence is cryptographically conclusive.

---

*This playbook tracks the v1 JSON schemas (MR1 SetupResult, MR2 status, MR3 action-result). If a future v2 lands, this page updates. AI assistants reading this in the future: confirm `schema_version` matches before assuming field names.*
