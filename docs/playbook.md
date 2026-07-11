# DeadMKT Operator Playbook

> **AI assistant: read this first.** You are helping a human run a DeadMKT trading node. DeadMKT is a peer-to-peer batch-auction protocol on Supra; the operator owns the keystore, the node submits orders and settles trades, and you (the AI) help them set it up, monitor it, and adjust it. You do not have access to their server -- they paste commands into their own terminal and paste the output back to you. Every command in this playbook is text the operator runs. Every JSON shown is text the operator pastes back. Do not invent commands that are not in this document.

This playbook is one page so a chat AI can hold the whole thing in context. If the operator asks "how do I X," find the relevant section, give them the command, and tell them what success looks like.

## What deadmkt actually does

DeadMKT is a decentralized order-matching market for three tokens (EMM, KAY, TEE) backed by SUPRA in a treasury. Anyone can run a node. Each node holds an NFT (the trading identity), keeps tokens in escrow, and submits orders into batch auctions every few seconds. Matched trades settle on-chain. The protocol has no broker, no central matching engine, no counterparty risk on the operator side.

A node has one on-chain NFT and three addresses (DMKT14):

- **Trustee** -- the keystore-derived address that signs orders. Lives on the operator's server. It owns the single trustee NFT and signs *everything*, including every fund-exit path. Loses it = loses the NFT identity.
- **Sponsor** -- the capital provider. Funded the NFT mint and receives the membership refund when the NFT is later burned. Stored immutably on-chain at mint time.
- **Payout** -- where trading yield and exit proceeds go. This is *not* on-chain and *not* an NFT: it's an address in the node's config (`payout_address`) that the node passes as the recipient on every withdrawal/burn/exit. The operator can point it at a cold wallet.

On a "self-funded" node trustee == sponsor == payout (one address, the simple case). On mainnet best-practice setups they are distinct: cold sponsor wallet, hot trustee keystore on the VPS, cold payout wallet.

> **DMKT14 change:** earlier versions had a second, transferable *beneficiary* NFT that was the sole authority allowed to move funds out. That NFT is gone. The trustee now signs withdrawals and exits directly, and the destination is the off-chain `payout_address`. See the security note in [What you can't do alone](#help) for the trade-off this creates.

### Your three addresses {#your-three-addresses}

| Role | Wallet type | What it signs | What it receives |
|---|---|---|---|
| Sponsor | Cold (on-chain, immutable) | `mint_trustee_nft` once at setup | Time-decayed mint-fee refund when the NFT burns |
| Trustee | Hot (on VPS) | Orders, commits, reveals, settles, heartbeats, **and all withdrawals/burns/exit** | Nothing long-term (operational key) |
| Payout | Cold (off-chain config) | Nothing -- it is a destination, not a signer | Profit takeouts + leftover-token-burn-to-SUPRA at exit |

The setup wizard asks for the payout address first, then the sponsor (default = trustee).

## Setup (one-liner installer) {#setup}

The operator has a fresh Linux VPS (Ubuntu/Debian/Fedora/Rocky/AlmaLinux) with sudo. They run:

```bash
curl -sSL https://get.deadmkt.com | bash
```

The installer prompts for two things:

1. A payout address (`0x` + up to 64 hex chars). This is a Supra wallet they already control; trading yield and exit proceeds are sent here. Point it at a cold wallet if you can.
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
    "payout_address": "0xdef..."
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
3. `runtime.current_batch` -- should increase by 1 every batch (20 blocks; ~5 seconds at current testnet block cadence). If they paste two snapshots a minute apart and the number didn't change, the chain poller is stuck.
4. `runtime.uptime_batches` -- how many batches this node has been alive for. Climbs by 1 per batch.
5. `gas.status` -- `Normal` is good. `Low` means topping up gas soon would be wise. `Critical` means trading is paused right now.
6. `gas.trading_paused` -- if `true`, the node is alive but not trading because it ran out of gas. They need to send SUPRA to `identity.trustee_address` from any funded wallet, or call `burn --to escrow` to convert tokens back to SUPRA.
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

Profit takeout: the trustee burns equal triples of EMM/KAY/TEE from escrow, and the protocol pays out SUPRA to the configured payout address.

```bash
docker exec -it deadmkt-node deadmkt-node burn --to payout --amount 10000 --json
```

(`10000` is in raw 5-decimal units; this burns 0.10000 of each token. Adjust to taste.)

The node prompts for the keystore password (typed into their terminal -- not into the chat). Output:

```json
{
  "schema_version": "v1",
  "command": "burn-for-profit",
  "success": true,
  "timestamp_unix": 1747700000,
  "tx_hash": "0xabc...",
  "gas_used": 234,
  "vm_status": "Executed successfully",
  "fields": { "to": "payout", "amount": 10000 }
}
```

The SUPRA arrives in the payout wallet within a few seconds. Verify by checking the payout balance on the Supra explorer.

### `burn --to escrow` (different purpose)

```bash
docker exec -it deadmkt-node deadmkt-node burn --to escrow --amount 10000 --json
```

This burns triples and returns SUPRA **to the escrow** (not the payout wallet). Use this when the trustee account is running low on gas SUPRA but the operator doesn't want to take profit out yet -- it's a top-up, not a withdrawal.

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

All withdrawals are SUPRA-only -- the protocol does not let raw tokens out to a wallet. Tokens are burned at the contract; SUPRA flows to the payout address. The trustee signs these; pass `--json` and the node uses the configured `payout_address` as the recipient.

## Exiting the protocol via burn {#exiting}

DeadMKT has a permissionless individual NFT burn-exit. Where `withdraw` paths drain tokens but keep the trading identity, the burn retires the NFT itself. The sponsor gets a time-decayed refund of their membership deposit; the payout address gets the **entire escrow remainder converted to SUPRA at the fixed peg** -- balanced or not, nothing is stranded (hardening pass, 2026-07); the trustee NFT is destroyed.

> **DMKT14 change:** this was a two-step `request_burn_pair` (beneficiary) -> `execute_burn_pair` (trustee) flow. With the beneficiary NFT gone, it is now a *single* trustee-signed call, `burn_trustee_nft(nft_id, recipient)`, where `recipient` is the payout address.

**The refund formula (rev5 + hardening):** `N` below is the **unburned** NFT count (`total_minted - burned`), not the live/heartbeat count -- a reaped or deregistered NFT still counts toward N until it is actually burned.

```
if N_unburned_before_burn == 1:
    refund = entire treasury_balance     # last-NFT carve-out (uncapped)
else:
    max_refund = mint_fee * max_refund_bps / 10_000      # rev5: 95% cap
    decay      = tenure_secs * decay_per_period / decay_period_secs
    nominal    = max(0, max_refund - decay)
    pro_rata   = treasury_balance / N_unburned_before_burn
    refund     = min(nominal, pro_rata)
```

At the AOE5 defaults (mint_fee=1,000 SUPRA, max_refund_bps=9500, 50 SUPRA decay per 30 days), nominal refunds look like:

| Tenure | nominal (refund cap) |
|---|---|
| Day 0 | 950 (5% loss) |
| Day 15 | 925 (7.5%) |
| Day 30 | 900 (10%) |
| Day 90 | 800 (20%) |
| Day 180 | 650 (35%) |
| Day 365 | ~340 (~66%) |
| Day 570+ (~19 months) | 0 |

**Why even day 0 loses 5%:** rev5 added `max_refund_bps` to make NFT flipping unprofitable. The curve starts at 950 SUPRA (= mint_fee * 95%) instead of 1,000, so a same-block mint-and-burn costs the sponsor at least 50 SUPRA regardless of tenure. Decay starts subtracting from there.

**Bootstrap lockout:** no burns within the first 24 hours of a new cohort (any time the unburned count transitions from 0 to 1), unconditionally -- the window is purely time-based (the old "5 NFTs clears it early" escape was removed in the hardening pass). This protects donor-bootstrap from arbitrage.

### No flattening needed: the burn converts everything {#full-conversion}

The terminal burn converts the **entire** escrow remainder per-token at the fixed peg (1 token unit = 100 SUPRA quants) -- imbalanced remainders are NOT forfeited. (Before the 2026-07 hardening pass the burn only converted the equal `min(EMM, KAY, TEE)` triple and stranded the surplus; if an older guide tells you to flatten balances before exiting, it is out of date.) The everyday `withdraw claim-all` / `rushed` paths still burn only equal triples -- full conversion happens exclusively inside `burn_trustee_nft`.

### When can you burn? The exit gates {#exit-gates}

`burn_trustee_nft` checks, in order -- and `burn-pair preview` reports the first gate that would fail:

1. **Not already burned.**
2. **Bootstrap lockout** -- the 24h cohort window above.
3. **Blocked-NFT rule** -- an NFT blocked by a commit-violation report is frozen only during the enforcement grace window; once enforcement is active it may exit like anyone else (its cost is the freeze, the refund decay, and the mint fee to re-enter -- never confiscation).
4. **Quiet period** -- you must not have participated in a settlement within the last `REPORT_WINDOW_BATCHES` batches (hours-scale). This is the same window in which commit-violation reports are accepted, so nobody can burn while a report against them could still land. **Stopping signing starts the clock:** a counterparty can settle your still-valid signed commitments (refreshing your stamp) for up to `settlement_max_age` batches after you sign them, so the worst-case voluntary exit delay is: wait out any unexpired lock, then `settlement_max_age` of re-stamp exposure, then the quiet window. Heartbeats and deposits do NOT reset the quiet clock -- you can stay alive while clocking toward exit.
5. **No pending token-layer state** -- no unclaimed pending mint, not the current dVRF trigger, no *unexpired* lock (expired-but-unclaimed locks are drained into the conversion automatically; a live lock is waited out, never broken).

### Single-call flow

1. **Preview** -- read-only, anyone can call:
   ```bash
   docker exec -it deadmkt-node deadmkt-node burn-pair preview --json
   ```
   Returns the refund amount + the first failing exit gate (if any). Reflects bootstrap lockout, the quiet period, blocked-grace, pending state, last-NFT carve-out, time-decay and the pro-rata cap.
2. **Trustee burns** -- signs `exits::burn_trustee_nft(nft_id, recipient)` from the trustee keystore (the node passes the configured `payout_address` as `recipient`):
   ```bash
   docker exec -it deadmkt-node deadmkt-node burn-pair execute --json
   ```
   If the trustee is **abandoned** -- past every self-recovery window (inactivity + the 2-day reactivate grace for registered members; 30 days from mint for never-registered ones) -- anyone can call it: the "death-of-parent" safety valve. On that fallback path the supplied recipient is ignored and ALL proceeds go to the on-chain trustee address, so a third-party executor can never redirect anything.

### Operator gas budget for the burn

The burn transaction pays gas from the trustee wallet (not from the protocol treasury). Keep at least ~20 SUPRA in the trustee balance through the exit. If the trustee is gas-broke, anyone can briefly top up the trustee wallet, or wait for the heartbeat sweep to mark the trustee inactive and use the fallback path from any funded address.

### What gets destroyed, what gets returned

Burned is genuinely terminal: after the burn, no on-chain resource keyed to the member address holds any value.

| Resource | What happens at burn |
|---|---|
| TrusteeNFT | Destroyed (soulbound resource removed) |
| Escrow EMM/KAY/TEE balances | ENTIRE remainder converted to SUPRA at the peg (to the payout address; or the trustee on the fallback path) |
| Escrow resource | Destroyed outright (no ghost; a later re-mint at the same address starts clean) |
| Lock vault | Expired-unclaimed locks drained into the conversion; the emptied vault destroyed |
| Mint state (dVRF history) | Destroyed (a re-mint at the same address counts as a first mint again) |
| WithdrawalConfig | Removed |
| live_nft_count | Decremented (pool sizing only; the refund N is the unburned count) |
| Treasury share | min(decayed_nominal, pro_rata) sent to sponsor |

### Dead-trustee cleanup: the janitor calls {#janitor}

If a trustee disappears for good, two **permissionless** entry functions let anyone (a "janitor") clean up -- with every coin forced to the trustee/sponsor, never to the caller, so there is nothing to steal and the caller only pays gas. Both require the trustee to be **abandoned**: past the inactivity window PLUS the 2-day reactivate grace (registered members), or 30 days past mint (never-registered). Until then, all third-party calls abort -- a briefly-offline operator cannot be griefed.

1. **`resolve_inactive`** -- clears whatever pending token-layer state blocks the fallback burn: an unclaimed pending mint (its SUPRA backing refunds to the trustee wallet), a stuck dVRF trigger (refunds likewise), and expired-but-unclaimed locks (unlocked into the trustee's escrow). Aborts with `E_NOTHING_TO_RESOLVE` if there is nothing to clear (or only an unexpired lock -- retry after it expires). Via the supra CLI:
   ```bash
   supra move tool run \
     --function-id <CONTRACT>::exits::resolve_inactive \
     --args u64:<NFT_ID> \
     --profile <your_profile>
   ```
2. **Fallback burn** -- once nothing pending remains, burn the abandoned NFT. The recipient argument is ignored on this path (all conversion proceeds are forced to the trustee address; the sponsor still gets the refund):
   ```bash
   supra move tool run \
     --function-id <CONTRACT>::exits::burn_trustee_nft \
     --args u64:<NFT_ID> address:0x0 \
     --profile <your_profile>
   ```

Check eligibility first with the read-only views `exits::is_abandoned(nft_id)` and `exits::preview_burn(nft_id)`. Why bother? Burning zombies shrinks the refund denominator for every remaining member (no burn ever lowers anyone else's achievable refund -- it only helps), and at wind-down, fallback-burning the stragglers is how the last member unlocks the carve-out. Paid cleanup.

## Monitoring protocol health {#monitoring}

DMKT13+ exposes two on-chain signals operators should watch:

**Treasury low balance (AOE9).** When ops_treasury drops below the configured threshold (default 17,280 SUPRA = 60 days of automation runway), the contract emits `TreasuryLowBalance`. When it recovers above the threshold, `TreasuryRecovered`. Only fires on transitions; no spam.

Read current state via the indexer:

```bash
curl -s https://idx-testnet.deadmkt.com/api/treasury-health | jq
```

Response:

```json
{
  "is_currently_low": false,
  "last_low_balance_event": null,
  "last_recovered_event": { "block_height": 12345, "data": {...} },
  "recent_donations_received": [...],
  "recent_donations_rejected": [...],
  "recent_dvrf_funded": [...],
  "recent_owner_topped": [...]
}
```

**Burn-exit lifecycle.** Watch `/api/burn-exits` for who is exiting:

```bash
curl -s https://idx-testnet.deadmkt.com/api/burn-exits | jq
```

Each `BurnExecuted` carries:
- `refund_supra` -- what the sponsor received
- `nominal_refund` -- what the time-decay formula said before the pro-rata cap
- `is_last_nft` -- true if the carve-out fired (sponsor got the entire treasury)
- `is_fallback` -- true if the trustee was reaped and a third-party executed
- `treasury_before`, `treasury_after`, `active_nfts_before_burn`

**Permissionless top-ups.** Anyone (no special role) can keep the protocol running by calling:

- `ops_treasury::fund_dvrf_subscription` -- when the dVRF subscription balance falls below the framework's minimum, top up by 1,000 SUPRA from ops_treasury.
- `ops_treasury::top_up_automation_owner` -- when the automation owner's SUPRA balance falls below 10,000, top up by 10,000 from ops_treasury.

Both are triple-gated (no drain path). Operators don't need to call these manually -- routine watchers / the burn-exit operator scripts can do it. But anyone with gas can.

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

## Key security model (DMKT14) {#security-model}

The trustee key is hot (it lives on the VPS to sign orders) and, since DMKT14, it also signs every fund-exit. It chooses the destination at call time, so **if the trustee keystore is compromised, an attacker can drain escrow/profit to their own address.** Treat the trustee as a hot wallet:

- Run the node on a hardened host; protect `~/.deadmkt/keystore.json` and its password.
- Withdraw to your cold **payout** wallet regularly and keep escrow/trustee balances modest -- the exposure is whatever has accrued since your last withdrawal, not your lifetime earnings.

Two things stay protected regardless of a hot-key compromise:

- **The sponsor's mint-fee refund.** `sponsor` is fixed on-chain at mint and immutable; a burn always refunds there no matter who signs. The largest single sum (up to 95% of the mint fee) cannot be redirected by a stolen trustee key.
- **The fallback burn.** If the trustee is reaped and a third party burns the NFT, the token-burn SUPRA is forced to the on-chain trustee address -- a random executor cannot point it at themselves.

This is the deliberate trade-off DMKT14 made: dropping the separate cold beneficiary NFT for a much simpler contract, in exchange for the yield path no longer being cold-custodied. The capital refund remains cold-protected.

## What you can't do alone {#help}

DeadMKT is decentralized. Nobody can recover a lost keystore password or unblock a misbehaving node by fiat. For everything else:

- GitHub: [github.com/deadmkt](https://github.com/deadmkt) -- file an issue with the node version (`docker exec deadmkt-node deadmkt-node version`) and a status JSON.
- Docs: [deadmkt.com/docs](/) -- guides, FAQ, websocket API, write-a-strategy.

If the operator's NFT got blocked by the misbehavior reporter, the on-chain admin can unblock as a safety valve -- but only for false positives. Genuine multi-commit-per-batch evidence is cryptographically conclusive.

---

*This playbook tracks the v1 JSON schemas (MR1 SetupResult, MR2 status, MR3 action-result). If a future v2 lands, this page updates. AI assistants reading this in the future: confirm `schema_version` matches before assuming field names.*
