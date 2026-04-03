# DeadMKT: Protocol Design and Game Theory

A complete reference for understanding the DeadMKT decentralised batch-auction trading protocol.

---

## What Is DeadMKT?

DeadMKT is a trading protocol built on the Supra blockchain where three tokens — EMM, KAY, and TEE — trade against each other in a closed triangle. Unlike traditional exchanges where trading is optional, DeadMKT's economic design makes trading mandatory. If you hold tokens, you must trade to complete your position. If you don't trade, your tokens lose utility.

The protocol uses batch auctions instead of continuous order books. Orders are submitted blind, revealed simultaneously, and matched at fair clearing prices. This eliminates front-running and creates a level playing field between sophisticated algorithms and manual traders.

Every token in DeadMKT is backed 1:1 by SUPRA (the chain's native currency). There is no inflation, no token printing, and no dilution. The only way tokens enter the system is through minting (depositing SUPRA), and the only way they leave is through burning (returning tokens for SUPRA). The treasury always holds enough SUPRA to redeem every outstanding token.

---

## The Three Tokens

EMM, KAY, and TEE form a closed triangle with three trading pairs:

- **EMM/KAY** — EMM is the base token, KAY is the quote
- **KAY/TEE** — KAY is the base, TEE is the quote
- **TEE/EMM** — TEE is the base, EMM is the quote

These three pairs create a circular relationship. If you multiply all three prices together (EMM/KAY price times KAY/TEE price times TEE/EMM price), the result should be approximately 1.0 in equilibrium. When this product deviates from 1.0, an arbitrage opportunity exists — you can rotate through the triangle and end up with more than you started.

---

## Why Trading Is Mandatory

The protocol forces trading through two interlocking constraints:

### Mint Skew

When you mint tokens by depositing SUPRA, you receive all three tokens — but not in equal amounts. The contract enforces an approximate 3:3:4 ratio. For example, depositing enough SUPRA for 100 tokens might give you 30 EMM, 30 KAY, and 40 TEE. Which token gets the extra share changes over time.

This means every mint creates an imbalance. You always end up with more of one token than the others.

### Burn Equality

To exit the protocol and recover your SUPRA, you must burn tokens — but you can only burn in equal triples. If you want to burn 30 tokens, you need exactly 30 EMM, 30 KAY, and 30 TEE. If you minted 30/30/40, you can burn 30 of each but the remaining 10 TEE is stranded.

The only way to complete your triples (turn that extra 10 TEE into 10 EMM and 10 KAY) is to trade with other participants.

### Trade Minimums

The protocol enforces a minimum trade quantity. You cannot rebalance with tiny micro-trades. Each trade must be meaningful, which prevents players from silently rebalancing through dust-sized orders that don't contribute to market liquidity.

Together, these three constraints create forced demand: mint skew creates imbalance, burn equality requires balance, and trade minimums require meaningful participation.

---

## Batch Auctions: How Trading Works

Trading happens in discrete batches, not as a continuous stream. Each batch follows four phases:

### 1. Commit Phase
Players submit encrypted commitments — a hash of their intended order plus a random nonce. Nobody can see what anyone else is ordering. This is a blind submission. You choose a pair (e.g., EMM/KAY), a side (buy or sell), a price, and a quantity.

### 2. Reveal Phase
Players reveal their actual orders by providing the original order data that matches their commitment hash. At this point, everyone can see what was submitted. Importantly, you can choose NOT to reveal — forfeiting that order. Since you can see how many peers committed before deciding to reveal, this creates an information advantage.

### 3. Match Phase
Buy and sell orders that cross (buy price is greater than or equal to sell price) are matched. The clearing price is the midpoint between the buyer's and seller's prices. This is deterministic — every node computes the same matches.

### 4. Settlement Phase
Matched trades are settled on-chain. Tokens move directly between escrow accounts (never through wallets). One of the two counterparties pays the gas fee, determined by a fair coin flip based on the order hashes.

### Timing
Batches are fast — each phase lasts only a few seconds. A complete batch cycle from commit to settlement takes roughly 30-60 seconds depending on block timing. Players must submit their commitments quickly (within about 3 seconds of the commit phase starting).

---

## The Minting System

### How Minting Works

To enter the protocol, you deposit SUPRA and receive EMM, KAY, and TEE tokens. The exchange rate is fixed — tokens are always backed 1:1 by SUPRA in the treasury.

When you call request_mint, you specify how much of each token you want (subject to the 3:3:4 ratio constraint and minimum quantity rules). Your SUPRA is transferred to a pending escrow, and a verifiable random dice roll (vDRF) determines how long you must wait before claiming your tokens.

### The vDRF Hold Period

After requesting a mint, the protocol rolls a virtual dice using a verifiable random function:

- **Roll 1-6**: Your tokens are held for (roll number) days. Roll 1 = 1 day, roll 6 = 6 days.
- **Roll 7**: BLOCKED — no one can mint until the blocked period expires (minimum 6 days plus a variable amount based on how many times blocking has occurred).

The first mint for any new participant has a fixed hold period (8 days on mainnet) regardless of the dice roll. This prevents rapid initial capitalisation.

### Why Hold Periods Matter

Hold periods are not just a delay mechanism — they are a strategic weapon:

- **Short rolls are valuable**: Getting your tokens in 1 day instead of 6 gives you a timing advantage.
- **Long rolls tie up capital**: Your SUPRA deposit is locked until you can claim.
- **BLOCKED periods create supply droughts**: When nobody can mint, existing token holders have pricing power.
- **Auto-claim on re-mint**: If you request a new mint while you have an expired (claimable) pending mint, the old one is automatically claimed first. This prevents the "double hold" problem where missing a claim window wastes another full period.

### Mint State Machine

The global minting system cycles through four states:

1. **AWAITING_TRIGGER** — No active period. Someone needs to trigger the next dice roll.
2. **VDRF_PENDING** — The dice roll has been requested from the oracle. Waiting for the random number.
3. **OPEN** — Minting is active. The dice result determined the hold period. This state lasts until the period end time.
4. **BLOCKED** — Roll was 7. No minting allowed until the block duration expires, then returns to AWAITING_TRIGGER.

---

## Token Lifecycle

### Escrow-Direct Principle

In DeadMKT, tokens never leave escrow to a wallet. Every token movement happens through controlled channels:

- **Mint to escrow**: When you claim minted tokens, they go directly to your escrow account.
- **Trade between escrows**: Settlement moves tokens from one player's escrow to another's.
- **Lock from escrow to vault**: Locked tokens move to a vault but remain yours.
- **Unlock from vault to escrow**: Expired locks return tokens to your escrow.
- **Burn from escrow**: Burning destroys tokens directly from escrow and returns SUPRA.

This design ensures that all token balances are always visible and accounted for. There is no hidden wallet balance that could be used to circumvent protocol rules.

### Two Burn Paths

There are two ways to burn tokens back to SUPRA:

1. **Burn to trustee**: The SUPRA from burning goes to the trustee address (the operator). This is used for gas recovery — converting MKT tokens back to SUPRA to pay for transaction fees.

2. **Burn to beneficiary**: The SUPRA goes to the beneficiary address (the owner/sponsor). This is how profits are distributed — the agent decides when it's profitable to exit a position and sends the SUPRA to the beneficiary.

Both paths require burning equal triples (same amount of all three tokens).

### The Dust Problem

When trades partially fill or balances don't divide evenly, players can end up with sub-minimum amounts of a token — "dust" that is too small to trade or burn.

The protocol provides a donate_dust action that allows players to gift sub-minimum amounts to another player's escrow. The gifted amount must be less than the minimum trade quantity. This is the only way to move dust, and it creates a social dynamic — you might gift dust to a reliable counterparty as goodwill.

---

## The Five-Move Infinite Game

The highest-level strategic loop in DeadMKT:

### Move 1: Accumulate
Buy the token you are underweight in. Accept short-term unfavourable prices to build position. Track your average entry price (cost basis) so you know when you are profitable.

### Move 2: Lock
Once you hold excess of a token beyond what you need for trading, lock it. Locked tokens leave circulating supply but remain yours. You choose the lock duration (within protocol minimum and maximum bounds). Locking during a BLOCKED mint period amplifies the supply shock because no new tokens can enter the market.

### Move 3: Supply Shock
With your tokens locked and no new supply from minting, the remaining circulating tokens become scarcer. If enough supply is locked, prices adjust — fewer tokens available means each trade has more impact on price.

### Move 4: Timed Unlock and Sell
When your lock expires, unlock your tokens back to escrow. If the supply shock raised prices for your locked token, sell at the premium. Your profit is the difference between your cost basis and the sell price.

### Move 5: Rotate
Move to the next leg of the triangle. If you accumulated and locked EMM, rotate to KAY or TEE. The game never ends — there is always another token to accumulate, another lock to time, another supply window to exploit.

---

## Triangle Arbitrage

The three pairs form a closed loop. When prices deviate from equilibrium (triangle product deviates from 1.0), you can profit by trading around the triangle:

- **Product greater than 1.0**: Trade clockwise — sell EMM for KAY, sell KAY for TEE, sell TEE for EMM. You end up with more EMM than you started.
- **Product less than 1.0**: Trade counter-clockwise — the reverse direction is profitable.

Triangle arbitrage requires trading across multiple batches (one trade per pair per batch), which means you are exposed to price movement between batches. The profit must exceed gas costs for all three trades. This creates a natural force that keeps prices near equilibrium.

---

## Participants and Roles

### Trustee
The operator address that controls the trading account. The trustee submits orders, manages minting and burning, and pays gas fees. In an automated setup, the trustee is controlled by a trading agent (bot).

### Beneficiary
The owner or sponsor address. Receives profits from burn_to_beneficiary. Can initiate withdrawals (holding period or rushed). Does not trade directly — the trustee acts on the beneficiary's behalf.

### NFT Identity
Each trustee-beneficiary pair is represented by an on-chain NFT. The NFT ID is used for pool assignment, gossip identification, and counterparty tracking. NFTs are minted in pairs — one for the trustee, one for the beneficiary.

### Bootstrap Peers
Nodes that participate in the gossip network for peer discovery and message relay but do not trade. They help maintain network connectivity without holding tokens or submitting orders.

---

## Pool System

Players are assigned to trading pools each batch. Only players in the same pool can see each other's orders and match.

Pool assignment is deterministic: a hash of (NFT ID + batch ID) modulo the number of pools determines which pool you are in each batch. This means:

- Your pool changes every batch — you trade with different counterparties over time.
- The assignment is predictable given the inputs — no randomness beyond the hash.
- With few players, there may only be one pool (everyone trades with everyone).
- As more players join, pools can split to maintain optimal size.

The pool system prevents the network from becoming too large for efficient matching while ensuring fair rotation of counterparties.

---

## Gas Economics

Every on-chain action costs SUPRA gas:

- **Trade settlement**: Approximately 0.02 SUPRA per filled trade. A coin flip determines which counterparty pays.
- **Heartbeat**: Approximately 0.005 SUPRA. Periodic liveness proof required to stay active.
- **Mint request**: Approximately 0.01 SUPRA plus the SUPRA deposit for backing.
- **Claim mint**: Approximately 0.008 SUPRA.
- **Burn**: Approximately 0.01 SUPRA.
- **Lock/Unlock**: Approximately 0.008 SUPRA.

Gas is the real cost of participation. A 50 SUPRA balance provides roughly 1,000 batches of active trading before needing replenishment. Smart gas management — knowing when to trade actively versus when to conserve — is part of the strategic game.

---

## Counterparty Dynamics

In a small market, individual counterparties become recognisable through their behaviour:

- **Fill rate**: How often their orders get matched. Aggressive pricing leads to high fill rates.
- **Side bias**: Do they predominantly buy or sell certain tokens? This reveals their inventory needs.
- **Price fairness**: Do they price near the clearing midpoint or at extremes?
- **Presence**: Are they active every batch or intermittent? Absent players reduce liquidity.
- **Mint activity**: Are they accumulating supply (minting) or winding down (burning)?

Understanding counterparty behaviour lets you anticipate demand. If a counterparty consistently buys EMM, they need it — you can price your sells accordingly. If a counterparty is absent, spreads widen and each trade has more impact.

---

## Withdrawal and Exit

### Holding Period
The beneficiary can start a holding period (configurable in days). Once the period expires, the beneficiary can claim all tokens as SUPRA (all tokens are burned and SUPRA is returned).

### Rushed Withdrawal
For faster exit, the beneficiary can request a rushed withdrawal. This has a grace period (measured in batches) to allow pending settlements to clear before the account is closed.

### Safe Deregister
Once all tokens and pending actions are cleared, the trustee can deregister from the protocol entirely, closing the escrow and removing the account.

---

## Security Mechanisms

### Commit Violation Detection (R50)
If a player submits more commitments than allowed per batch (the commits_per_batch limit), any other player can report the violation on-chain. The violating NFT is blocked from trading for a configurable number of batches. An admin can unblock if the report was in error.

### Heartbeat Enforcement
Players must send periodic heartbeat transactions to prove their node is alive. If a player misses heartbeats beyond the timeout threshold, they are flagged as inactive. An automated sweep process checks for expired heartbeats.

### Escrow Integrity
All token balances are tracked on-chain in escrow accounts. The settlement contract verifies order signatures, checks that orders have not already been filled, and ensures quantities meet minimums before executing a trade. Double-settlement of the same match is prevented by tracking settled match hashes.

---

## Design Philosophy

### Forced Participation Over Optional Engagement
Every aspect of the protocol — mint skew, burn equality, trade minimums, gas costs, heartbeat requirements — pushes participants toward active engagement. Holding tokens passively is expensive (gas costs accumulate) and unproductive (imbalanced positions cannot be exited without trading).

### Time as a Strategic Resource
Hold periods, lock durations, BLOCKED states, and batch timing all create temporal dynamics. Patience and timing beat raw capital. A player who times their locks around BLOCKED periods and unlocks when counterparties are desperate has an edge over a player with more tokens but worse timing.

### Information Asymmetry by Design
The commit-reveal scheme creates natural information edges. You commit blind, but you see peer commit counts before revealing. You observe counterparty behaviour over time. You know your own cost basis and can estimate others' positions from their trading patterns.

### The Game Never Ends
There is no terminal state in DeadMKT. The triangle always has a next leg. Supply always cycles between locked and liquid. Mint periods always rotate. New participants always arrive. The only way to "win" is to continuously adapt — accumulate, lock, shock, sell, rotate, repeat.
