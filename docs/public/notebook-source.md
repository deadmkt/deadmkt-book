# DeadMKT: Protocol Design and Game Theory

A complete reference for understanding the DeadMKT decentralised batch-auction trading protocol.

---

## What Is DeadMKT?

DeadMKT is a trading protocol built on the Supra blockchain where three tokens — EMM, KAY, and TEE — trade against each other in a closed triangle. Unlike traditional exchanges where trading is optional, DeadMKT's economic design makes trading mandatory. If you hold tokens, you must trade to complete your position. If you don't trade, your tokens lose utility.

The protocol uses batch auctions instead of continuous order books. Orders are submitted blind, revealed simultaneously, and matched at fair clearing prices. This eliminates front-running and creates a level playing field between sophisticated algorithms and AI traders.

Every token in DeadMKT is backed 1:1 by 0.1 SUPRA (the chain's native currency). There is no inflation, no unbacked token printing, so no dilution. The only way tokens enter the system is through minting (depositing SUPRA), and the only way they leave is through burning (returning tokens for SUPRA). The smart contract treasury always holds enough SUPRA to redeem every outstanding token.

---

## The Three Tokens

EMM, KAY, and TEE form a closed triangle with three trading pairs:

- **EMM/KAY** — EMM is the base token, KAY is the quote
- **KAY/TEE** — KAY is the base, TEE is the quote
- **TEE/EMM** — TEE is the base, EMM is the quote

These three pairs create a circular relationship. If you multiply all three prices together (EMM/KAY price times KAY/TEE price times TEE/EMM price), the result should be approximately 1.0 in equilibrium. When this product deviates from 1.0, an arbitrage opportunity exists — you can rotate through the triangle and end up with more than you started.

### Understanding the Pairs

Each pair has a base token and a quote token:

- When you **buy** the pair, you are buying the base token and paying with the quote token.
- When you **sell** the pair, you are selling the base token and receiving the quote token.

For example, on the EMM/KAY pair:
- A **buy order** at price 1.2 means "I will pay 1.2 KAY for each EMM."
- A **sell order** at price 1.1 means "I want at least 1.1 KAY for each EMM I sell."

The three pairs form a directed cycle:

```
    EMM ──(EMM/KAY)──▶ KAY
     ▲                   │
     │               (KAY/TEE)
 (TEE/EMM)               │
     │                   ▼
    TEE ◀───────────── TEE
```

Clockwise: EMM → KAY → TEE → EMM (sell EMM for KAY, sell KAY for TEE, sell TEE for EMM)
Counter-clockwise: EMM → TEE → KAY → EMM (the reverse)

### Price Representation

Prices in DeadMKT are stored as fixed-point integers with a defined precision. A price of `120000` with 5 decimal places represents `1.20000`. The protocol enforces a minimum tick size and a minimum/maximum price range to prevent extreme or degenerate orders.

---

## Why Trading Is Mandatory

The protocol is designed for trading through two interlocking constraints:

### Mint Skew

When you mint tokens by depositing SUPRA, you receive all three tokens — but not in equal amounts. The contract enforces an approximate 3:3:4 ratio. For example, depositing 100 SUPRA for 1000 tokens might give you 300 EMM, 300 KAY, and 400 TEE. You can mint tokens anyway a strategy calls for with these rules:

All values are in raw units (5 decimal places, so 100000 raw = 1 token).

  #### The 5 Rules
  ##### Rule 1: All positive
  m > 0 AND k > 0 AND t > 0               
  Can't mint zero of any token.
                               
  ##### Rule 2: Divisible by 10 tokens

  (m + k + t) % 1,000,000 == 0
  The total across all three must be a multiple of 1,000,000 raw (= 10 tokens). This means you mint in groups of 10 tokens.

  ##### Rule 3: Base ratio (max ≤ ~40%)

  2 × (min + mid) >= 3 × max
  No single token can dominate. The largest amount can't exceed ~40% of total.

  To see why ~40%: if max = 0.4 × total, and min + mid = 0.6 × total, then 2 × 0.6 × total = 1.2 × total, and 3 × 0.4 × total = 1.2 × total. Exactly at the boundary. Any higher and the inequality breaks.

  ##### Rule 4: Delta ratio (spread is bounded)

  3 × (mid + max - 2 × min) <= min        
  The difference between amounts can't be too large relative to the smallest amount.

  This rule constrains how far apart the three values can be from each other. The expression `(mid + max - 2 × min)` measures the total "excess" that the mid and max values have over the minimum. When all three are equal, this is zero. The further they spread apart, the larger this value grows. Multiplying by 3 and requiring it to be ≤ min ensures the spread stays small relative to the smallest allocation.

  ##### Rule 5: Minimum trade quantity

  min(m, k, t) >= min_trade_quantity      
  Currently 100,000 raw (= 1 token). Can't mint dust.

  ##### Cost

  SUPRA cost = (m + k + t) × 100 raw SUPRA
             = total_tokens × 0.1 SUPRA per token

  To understand the cost formula: each raw unit of token costs 100 raw units of SUPRA. Since 100,000 raw = 1 token, one token costs 100,000 × 100 = 10,000,000 raw SUPRA. If SUPRA has 8 decimal places, 10,000,000 raw = 0.1 SUPRA. Hence 1 token = 0.1 SUPRA.

  ##### Examples                                

  #### Equal split (always valid)
  
  ┌───────────┬───────────┬───────────┬────────────┬───────────────────────────────────────┐
  │     m     │     k     │     t     │   total    │                valid?                 │
  ├───────────┼───────────┼───────────┼────────────┼───────────────────────────────────────┤
  │ 1,000,000 │ 1,000,000 │ 1,000,000 │ 3,000,000  │ yes — equal, total divisible by 1M    │
  ├───────────┼───────────┼───────────┼────────────┼───────────────────────────────────────┤
  │ 5,000,000 │ 5,000,000 │ 5,000,000 │ 15,000,000 │ yes — 50 each, cost 15 SUPRA          │
  ├───────────┼───────────┼───────────┼────────────┼───────────────────────────────────────┤
  │ 100,000   │ 100,000   │ 100,000   │ 300,000    │ no — total 300K not divisible by 1M   │
  └───────────┴───────────┴───────────┴────────────┴───────────────────────────────────────┘

  Why does (100K, 100K, 100K) fail? The total is 300,000 raw = 3 tokens. Rule 2 requires the total to be a multiple of 1,000,000 raw (10 tokens). 300,000 % 1,000,000 = 300,000 ≠ 0. The minimum equal-split mint is (333,334, 333,333, 333,333) totalling 1,000,000 — but see below for why near-equal non-equal splits can still be valid.

  #### Near-equal split (valid but surprising)

  ┌───────────┬───────────┬───────────┬────────────┬─────────────────────────────────────────────────────────────────────┐
  │     m     │     k     │     t     │   total    │                               valid?                               │
  ├───────────┼───────────┼───────────┼────────────┼─────────────────────────────────────────────────────────────────────┤
  │ 333,334   │ 333,333   │ 333,333   │ 1,000,000  │ yes — all 5 rules pass (see proof below)                           │
  └───────────┴───────────┴───────────┴────────────┴─────────────────────────────────────────────────────────────────────┘

  Full rule check for (333,334 / 333,333 / 333,333):
  - Rule 1: all > 0 ✓
  - Rule 2: 1,000,000 % 1,000,000 = 0 ✓
  - Rule 3: min = 333,333, mid = 333,333, max = 333,334. 2 × (333,333 + 333,333) = 1,333,332 ≥ 3 × 333,334 = 1,000,002 ✓
  - Rule 4: 3 × (333,333 + 333,334 − 2 × 333,333) = 3 × 1 = 3 ≤ 333,333 ✓ (trivially)
  - Rule 5: min = 333,333 ≥ 100,000 ✓
  - Cost: 10 tokens × 0.1 = 1 SUPRA
                                          
  #### Skewed splits
                                          
  40/30/30 — maximum allowed skew:
  
  ┌───────────┬───────────┬───────────┬────────────┬──────────────────────────────────────────────────────┐
  │     m     │     k     │     t     │   total    │                        check                         │
  ├───────────┼───────────┼───────────┼────────────┼──────────────────────────────────────────────────────┤
  │ 4,000,000 │ 3,000,000 │ 3,000,000 │ 10,000,000 │ Rule 2: 10M % 1M = 0 ✓                               │
  ├───────────┼───────────┼───────────┼────────────┼──────────────────────────────────────────────────────┤
  │           │           │           │            │ Rule 3: 2×(3M+3M) = 12M ≥ 3×4M = 12M ✓ (boundary)    │
  ├───────────┼───────────┼───────────┼────────────┼──────────────────────────────────────────────────────┤
  │           │           │           │            │ Rule 4: 3×(3M+4M-2×3M) = 3×1M = 3M ≤ 3M ✓ (boundary) │
  ├───────────┼───────────┼───────────┼────────────┼──────────────────────────────────────────────────────┤
  │           │           │           │            │ valid — right at the limit                           │
  └───────────┴───────────┴───────────┴────────────┴──────────────────────────────────────────────────────┘

  This is the maximum skew because both Rule 3 and Rule 4 are satisfied with equality (the boundary case). Any further skew — say 41/30/29 — would violate one or both constraints.

  To verify: try (4,100,000 / 3,000,000 / 2,900,000) total 10M:
  - Rule 3: 2×(2.9M+3M) = 11.8M ≥ 3×4.1M = 12.3M? NO — fails.
                                          
  36/32/32 — comfortable skew:
                                          
  ┌───────────┬───────────┬───────────┬────────────┬───────────────────────────────────────────────────────┐
  │     m     │     k     │     t     │   total    │                         check                         │
  ├───────────┼───────────┼───────────┼────────────┼───────────────────────────────────────────────────────┤
  │ 3,600,000 │ 3,200,000 │ 3,200,000 │ 10,000,000 │ Rule 3: 2×(3.2M+3.2M) = 12.8M ≥ 3×3.6M = 10.8M ✓      │
  ├───────────┼───────────┼───────────┼────────────┼───────────────────────────────────────────────────────┤
  │           │           │           │            │ Rule 4: 3×(3.2M+3.6M-2×3.2M) = 3×400K = 1.2M ≤ 3.2M ✓ │
  ├───────────┼───────────┼───────────┼────────────┼───────────────────────────────────────────────────────┤
  │           │           │           │            │ valid — comfortably within limits                     │
  └───────────┴───────────┴───────────┴────────────┴───────────────────────────────────────────────────────┘

  How much headroom does 36/32/32 have?
  - Rule 3 headroom: 12.8M − 10.8M = 2M of slack. You could push the max up to ~38.5% before it breaks.
  - Rule 4 headroom: 3.2M − 1.2M = 2M of slack. Plenty of room.

  37/32/31 — asymmetric skew (different min and mid):

  ┌───────────┬───────────┬───────────┬────────────┬────────────────────────────────────────────────────────────┐
  │     m     │     k     │     t     │   total    │                           check                            │
  ├───────────┼───────────┼───────────┼────────────┼────────────────────────────────────────────────────────────┤
  │ 3,700,000 │ 3,200,000 │ 3,100,000 │ 10,000,000 │ Rule 3: 2×(3.1M+3.2M) = 12.6M ≥ 3×3.7M = 11.1M ✓          │
  ├───────────┼───────────┼───────────┼────────────┼────────────────────────────────────────────────────────────┤
  │           │           │           │            │ Rule 4: 3×(3.2M+3.7M-2×3.1M) = 3×700K = 2.1M ≤ 3.1M ✓     │
  ├───────────┼───────────┼───────────┼────────────┼────────────────────────────────────────────────────────────┤
  │           │           │           │            │ valid — all three values can differ                       │
  └───────────┴───────────┴───────────┴────────────┴────────────────────────────────────────────────────────────┘

  This shows that min, mid, and max can all be different. You are not restricted to only skewing one token above two equal ones.
                                          
  50/25/25 — too skewed:
  
  ┌───────────┬───────────┬───────────┬────────────┬──────────────────────────────────────────────┐
  │     m     │     k     │     t     │   total    │                    check                     │
  ├───────────┼───────────┼───────────┼────────────┼──────────────────────────────────────────────┤
  │ 5,000,000 │ 2,500,000 │ 2,500,000 │ 10,000,000 │ Rule 3: 2×(2.5M+2.5M) = 10M ≥ 3×5M = 15M? NO │
  ├───────────┼───────────┼───────────┼────────────┼──────────────────────────────────────────────┤
  │           │           │           │            │ invalid — E_BASE_RATIO_LIMIT_EXCEEDED        │
  └───────────┴───────────┴───────────┴────────────┴──────────────────────────────────────────────┘

  80/10/10 — way too skewed:
                                          
  ┌───────────┬───────────┬───────────┬────────────┬─────────────────────────────────────────┐
  │     m     │     k     │     t     │   total    │                  check                  │
  ├───────────┼───────────┼───────────┼────────────┼─────────────────────────────────────────┤
  │ 8,000,000 │ 1,000,000 │ 1,000,000 │ 10,000,000 │ Rule 3: 2×(1M+1M) = 4M ≥ 3×8M = 24M? NO │
  ├───────────┼───────────┼───────────┼────────────┼─────────────────────────────────────────┤
  │           │           │           │            │ invalid                                 │
  └───────────┴───────────┴───────────┴────────────┘

  #### Edge cases
  
  Minimum valid mint (10 tokens total):
                                          
  ┌─────────┬─────────┬─────────┬───────────┬──────────────────────────────────┐
  │    m    │    k    │    t    │   total   │             valid?               │
  ├─────────┼─────────┼─────────┼───────────┼──────────────────────────────────┤
  │ 400,000 │ 300,000 │ 300,000 │ 1,000,000 │ yes — 4/3/3 tokens, 1 SUPRA cost │
  └─────────┴─────────┴─────────┴───────────┴──────────────────────────────────┘

  Full check: Rule 1 ✓ (all > 0). Rule 2: 1M % 1M = 0 ✓. Rule 3: 2×(300K+300K) = 1.2M ≥ 3×400K = 1.2M ✓ (boundary). Rule 4: 3×(300K+400K−2×300K) = 3×100K = 300K ≤ 300K ✓ (boundary). Rule 5: 300K ≥ 100K ✓. Cost: 10 tokens × 0.1 = 1 SUPRA ✓.

  Minimum equal-split mint (30 tokens total):

  ┌───────────┬───────────┬───────────┬───────────┬──────────────────────────────────────────────────┐
  │     m     │     k     │     t     │   total   │                     valid?                       │
  ├───────────┼───────────┼───────────┼───────────┼──────────────────────────────────────────────────┤
  │ 1,000,000 │ 1,000,000 │ 1,000,000 │ 3,000,000 │ yes — 10 each, 3M % 1M = 0, cost 3 SUPRA        │
  └───────────┴───────────┴───────────┴───────────┴──────────────────────────────────────────────────┘

  Why can't you mint 10 tokens equally? (333,334 / 333,333 / 333,333) = 1M total IS valid (see above), but it's not perfectly equal. For a perfectly equal split, the minimum is 10 tokens each = 30 total.

  Below minimum trade quantity:

  ┌─────────┬────────┬────────┬───────────┬──────────────────────────────────────┐
  │    m    │   k    │   t    │   total   │                valid?                │
  ├─────────┼────────┼────────┼───────────┼──────────────────────────────────────┤
  │ 900,000 │ 50,000 │ 50,000 │ 1,000,000 │ no — min is 50K < 100K trade minimum │
  └─────────┴────────┴────────┴───────────┴──────────────────────────────────────┘

  This also fails Rule 3 (2×(50K+50K) = 200K < 3×900K = 2.7M) and Rule 4, but the earliest failing check is Rule 5: the smallest allocation must be at least 100,000 raw (1 token).

  Not divisible:

  ┌─────────┬─────────┬─────────┬───────────┬────────────────────┐
  │    m    │    k    │    t    │   total   │       valid?       │
  ├─────────┼─────────┼─────────┼───────────┼────────────────────┤
  │ 500,000 │ 500,000 │ 500,000 │ 1,500,000 │ no — 1.5M % 1M ≠ 0 │
  └─────────┴─────────┴─────────┴───────────┴────────────────────┘

  15 tokens total is not a multiple of 10. You would need to round up to (666,667 / 666,667 / 666,666) = 2,000,000 raw = 20 tokens, or round down to 10 tokens.

  #### The practical sweet spot

  ┌────────────────────┬────────┬────────────┐
  │   Amounts (raw)    │ Tokens │ SUPRA cost │
  ├────────────────────┼────────┼────────────┤
  │ (1M, 1M, 1M)       │ 30     │ 3 SUPRA    │
  ├────────────────────┼────────┼────────────┤
  │ (400K, 300K, 300K) │ 10     │ 1 SUPRA    │
  ├────────────────────┼────────┼────────────┤
  │ (4M, 3M, 3M)       │ 100    │ 10 SUPRA   │
  ├────────────────────┼────────┼────────────┤
  │ (10M, 10M, 10M)    │ 300    │ 30 SUPRA   │
  ├────────────────────┼────────┼────────────┤
  │ (100M, 100M, 100M) │ 3,000  │ 300 SUPRA  │
  └────────────────────┴────────┴────────────┘ 

  Or 40/30/30 if you want to weight one token:
  - (4M, 3M, 3M) = 100 tokens, costs 10 SUPRA 

  #### Strategic Implications of Mint Skew

  The mint skew is not just a constraint — it is the engine that drives all trading in the protocol. Consider what happens after a typical mint:

  - You mint (4M, 3M, 3M) = 40 EMM, 30 KAY, 30 TEE.
  - To burn and recover SUPRA, you need equal triples: you can only burn 30 of each.
  - That leaves 10 EMM stranded — you need 10 KAY and 10 TEE to complete the triple.
  - The only way to get them is to trade: sell your excess EMM for the KAY and TEE you need.

  This means every single mint creates a forced trading requirement. The more skewed your mint, the more you must trade. Even the minimum skew mint (333,334 / 333,333 / 333,333) creates 1 raw unit of imbalance — though practically the 40/30/30 skew creates meaningful trading pressure.

This means every mint creates an imbalance. You always end up with more of one token than the others.

### Burn Equality

To exit the protocol and recover your SUPRA, you must burn tokens — but you can only burn in **equal triples**. If you want to burn 30 tokens, you need exactly 30 EMM, 30 KAY, and 30 TEE. If you minted 30/30/40, you can burn 30 of each but the remaining 10 TEE is stranded.

The only way to complete your triples (turn that extra 10 TEE into 10 EMM and 10 KAY) is to trade with other participants.

#### Burn Rules

The burn operation has its own set of constraints:

##### Rule 1: Equal amounts
burn_emm == burn_kay == burn_tee
You must burn the same quantity of all three tokens. No exceptions.

##### Rule 2: Minimum burn quantity
burn_amount >= min_trade_quantity (currently 100,000 raw = 1 token in testnet)
You cannot burn dust. Each burn must be at least 1 token of each type.

##### Rule 3: Sufficient balance
You must have at least `burn_amount` of each token in your escrow.

##### Rule 4: Burn in multiples
The burn amount must be a whole number of raw units. Fractional burns are not possible.

#### Burn Cost Formula

SUPRA returned = burn_amount × 3 × 100 raw SUPRA = tokens_per_type × 3 × 0.1 SUPRA

Since each token is backed 1:1 at 0.1 SUPRA, burning N of each returns 3N × 0.1 SUPRA = 0.3 × N SUPRA.

#### Worked Burn Examples

  ┌───────────────┬───────────────┬───────────────┬────────────────┬───────────────────┐
  │   burn EMM    │   burn KAY    │   burn TEE    │ SUPRA returned │      valid?       │
  ├───────────────┼───────────────┼───────────────┼────────────────┼───────────────────┤
  │ 1,000,000     │ 1,000,000     │ 1,000,000     │ 3 SUPRA        │ yes — 10 of each  │
  ├───────────────┼───────────────┼───────────────┼────────────────┼───────────────────┤
  │ 5,000,000     │ 5,000,000     │ 5,000,000     │ 15 SUPRA       │ yes — 50 of each  │
  ├───────────────┼───────────────┼───────────────┼────────────────┼───────────────────┤
  │ 100,000       │ 100,000       │ 100,000       │ 0.3 SUPRA      │ yes — minimum burn│
  ├───────────────┼───────────────┼───────────────┼────────────────┼───────────────────┤
  │ 1,000,000     │ 1,000,000     │ 2,000,000     │ —              │ no — not equal    │
  ├───────────────┼───────────────┼───────────────┼────────────────┼───────────────────┤
  │ 50,000        │ 50,000        │ 50,000        │ —              │ no — below minimum│
  └───────────────┴───────────────┴───────────────┴────────────────┴───────────────────┘

#### The Stranded Token Problem (Worked Example)

Suppose you minted (4,000,000 / 3,000,000 / 3,000,000) = 40 EMM, 30 KAY, 30 TEE for 10 SUPRA.

**Step 1:** Burn the maximum equal triple: 3,000,000 of each (30 tokens each).
- Returns: 30 × 3 × 0.1 = 9 SUPRA
- Remaining balance: 1,000,000 EMM (10 tokens), 0 KAY, 0 TEE

**Step 2:** You now have 10 stranded EMM. To recover the final 1 SUPRA backing those 10 EMM:
- You need 10 KAY and 10 TEE to form the next equal triple.
- You must trade: sell some EMM for KAY, and sell some EMM for TEE.
- But you need to end up with equal amounts of all three.

**Step 3:** Optimal trade to rebalance 10 stranded EMM:
- You have 1,000,000 raw EMM. You need to split this into thirds.
- Sell ~333,333 EMM for ~333,333 KAY (depending on price).
- Sell ~333,333 EMM for ~333,333 TEE (depending on price).
- Now hold ~333,334 EMM, ~333,333 KAY, ~333,333 TEE.
- Burn 333,333 of each → returns ~1 SUPRA (minus any trading slippage and gas).

The reality is messier because prices aren't 1:1, fills are partial, and gas costs eat into the return. This is why position management and cost-basis tracking matter — you need to know when rebalancing is profitable versus when you should hold and wait for better prices.

### Trade Minimums

The protocol enforces a minimum trade quantity (currently 100,000 raw = 1 token in testnet) Note that mainnet minimums and constants may be different to testnet for a better and realistic game dynamic. You cannot rebalance with tiny micro-trades. Each trade must be meaningful, which prevents players from silently rebalancing through dust-sized orders that don't contribute to market liquidity. That said dust can be donated to another wallet under specific rules and situations to clean up otherwise locked dust.

#### Why Trade Minimums Exist

Without minimums, a player could:
- Submit thousands of 1-raw-unit orders to probe prices without risk.
- Rebalance positions with dust trades that don't provide meaningful liquidity.
- Spam the order book, increasing gas costs and computation for everyone.

The minimum ensures every order represents a real commitment to trade.

### The Forced Trading Loop (Summary)

Together, these three constraints create forced demand:

```
  Mint Skew           Burn Equality          Trade Minimums
  ──────────          ─────────────          ──────────────
  Creates             Requires               Requires
  imbalance    →      balance to exit   →    meaningful
  (can't mint         (must hold equal       participation
  equally)            triples to burn)       (no dust trades)
       │                    │                      │
       └────────────────────┴──────────────────────┘
                            │
                    FORCED TO TRADE
```

---

## Batch Auctions: How Trading Works

Trading happens in discrete batches, not as a continuous stream. Each batch follows four phases:

### 1. Commit Phase
Players submit encrypted commitments — a hash of their intended order plus a random nonce. Nobody can see what anyone else is ordering. This is a blind submission. You choose a pair (e.g., EMM/KAY), a side (buy or sell), a price, and a quantity.

The commitment is a cryptographic hash: `hash(pair, side, price, quantity, nonce)`. The hash proves you chose your order parameters before seeing anyone else's choices. The nonce prevents rainbow-table attacks on common orders.

#### What Goes Into a Commitment

| Field    | Description                                    | Example            |
|----------|------------------------------------------------|--------------------|
| pair     | Which trading pair (EMM/KAY, KAY/TEE, TEE/EMM) | EMM/KAY           |
| side     | BUY or SELL the base token                     | BUY                |
| price    | Limit price in quote token per base token      | 120000 (= 1.20)    |
| quantity | Amount of base token to trade (raw units)      | 500,000 (= 5 tokens)|
| nonce    | Random bytes to make hash unpredictable        | 0x7a3f...          |

#### Commit Timing

The commit window is short — approximately 3 seconds. Your agent must decide and submit within this window. Late commits are rejected. This time pressure means agents need pre-computed strategies, not real-time deliberation.

### 2. Reveal Phase
Players reveal their actual orders by providing the original order data that matches their commitment hash. At this point, everyone can see what was submitted. Importantly, you can choose NOT to reveal — forfeiting that order. Since you can see how many peers committed before deciding to reveal, this creates an information advantage.

#### The Reveal Decision

The reveal phase creates a strategic choice:

- **Reveal**: Your order enters the matching engine. If it crosses with a counterparty, it trades.
- **Don't reveal**: Your order is discarded. You lose nothing except the gas spent committing. No penalty.

Why would you NOT reveal?
- You committed a buy order, but then saw that 5 other players also committed. You suspect they're all selling, which means prices might move against you. You withhold your reveal and wait for the next batch.
- You committed a large order and only 1 other player committed. Revealing would expose your full intent to a single counterparty.

What information is visible between commit and reveal:
- The **number** of commitments per pair (you can count how many peers committed to EMM/KAY).
- The **identity** (NFT ID) of who committed (depending on gossip visibility).
- NOT the contents of commitments (prices, sides, quantities remain hidden until reveal).

### 3. Match Phase
Buy and sell orders that cross (buy price ≥ sell price) are matched. The clearing price is the midpoint between the buyer's and seller's prices. This is deterministic — every node computes the same matches.

#### Matching Rules

1. Orders are sorted: buys by descending price (highest first), sells by ascending price (lowest first).
2. The highest buy is paired with the lowest sell.
3. If they cross (buy price ≥ sell price), they match.
4. The clearing price = (buy price + sell price) / 2.
5. The fill quantity = min(buy quantity, sell quantity).
6. If either order has remaining quantity, it continues matching with the next counterparty.
7. Repeat until no more orders cross.

#### Worked Matching Example

EMM/KAY pair in a single batch. Three orders are revealed:

| Player | Side | Price (KAY/EMM) | Quantity (EMM raw) |
|--------|------|------------------|--------------------|
| Alice  | BUY  | 1.20             | 500,000            |
| Bob    | SELL | 1.10             | 300,000            |
| Carol  | SELL | 1.25             | 200,000            |

**Step 1: Sort orders.**
- Buys (descending): Alice at 1.20
- Sells (ascending): Bob at 1.10, Carol at 1.25

**Step 2: Match highest buy with lowest sell.**
- Alice (BUY 1.20) vs Bob (SELL 1.10): 1.20 ≥ 1.10 → CROSS ✓
- Clearing price = (1.20 + 1.10) / 2 = 1.15 KAY per EMM
- Fill quantity = min(500,000, 300,000) = 300,000 EMM
- Bob sends 300,000 EMM to Alice. Alice sends 300,000 × 1.15 = 345,000 KAY to Bob.
- Alice has 200,000 EMM remaining on her buy order.

**Step 3: Match remaining with next sell.**
- Alice (BUY 1.20, 200,000 remaining) vs Carol (SELL 1.25): 1.20 ≥ 1.25? NO → does not cross.
- Carol's sell price is higher than Alice's buy price. No match.

**Result:**
- Alice: received 300,000 EMM, paid 345,000 KAY. 200,000 of her buy order unfilled.
- Bob: sold 300,000 EMM, received 345,000 KAY. Fully filled.
- Carol: no fill. Her sell price was too high for any buyer in this batch.

#### Why Midpoint Pricing Is Fair

The clearing price being the midpoint means neither party gets a better deal than the other relative to their stated limits:
- Alice was willing to pay up to 1.20 but only paid 1.15 → she saved 0.05 per EMM.
- Bob was willing to accept as low as 1.10 but received 1.15 → he got 0.05 more per EMM.
- Both benefit equally from the price improvement.

#### Partial Fills

In the example above, Alice's order was only 60% filled (300K of 500K). Partial fills are common and create carry-over demand. Alice might submit the remaining 200K in the next batch, possibly at a different price reflecting updated market information.

Partial fills also create inventory management challenges. If Alice planned to immediately sell the EMM she bought, she now has less than expected and must adjust her strategy.

### 4. Settlement Phase
Matched trades are settled on-chain. Tokens move directly between escrow accounts (never through wallets). One of the two counterparties pays the gas fee, determined by a fair coin flip based on the order hashes.

#### Settlement Mechanics

For each matched trade:
1. The match is represented as a deterministic struct containing both orders, the clearing price, and the fill quantity.
2. A hash of both order commitments determines the gas payer (effectively a coin flip).
3. The designated gas payer submits the settlement transaction.
4. The contract verifies: order signatures are valid, orders haven't been previously settled, quantities meet minimums.
5. Tokens move: base token from seller's escrow to buyer's escrow, quote token from buyer's escrow to seller's escrow.
6. The match hash is recorded to prevent double-settlement.

#### Settlement Backstop

If the designated gas payer fails to settle within a timeout period:
- The counterparty can submit the settlement themselves, paying the gas.
- Both parties computed the same match independently, so either can produce a valid settlement transaction.
- This prevents a player from griefing by winning a trade but refusing to settle.
- Consistent gas skippers are tracked and may face reputation consequences.

The gas cost of settlement (~0.02 SUPRA) is small relative to trade sizes, but over hundreds of batches it accumulates. Gas management is a real strategic consideration.

### Timing

Batches are fast — each phase lasts only a few seconds. A complete batch cycle from commit to settlement takes roughly 30-60 seconds depending on block timing. Players must submit their commitments quickly (within about 3 seconds of the commit phase starting).

#### Batch Timing Diagram

```
  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
  │  COMMIT  │──▶│  REVEAL  │──▶│  MATCH   │──▶│  SETTLE  │──▶ next batch
  │ ~3 sec   │   │ ~3 sec   │   │  compute │   │ on-chain │
  │ (blind)  │   │ (public) │   │ (determ) │   │ (final)  │
  └──────────┘   └──────────┘   └──────────┘   └──────────┘
       │               │              │              │
   Submit hash    Reveal order   Engine runs    Tokens move
   or abstain     or forfeit     matches        between
                                                escrows
```

A player's agent must be online and responsive during commit and reveal phases. Missing a phase means missing that batch entirely. Over time, missed batches represent lost trading opportunities and reduced ability to rebalance positions.

---

## The Minting System

### How Minting Works

To enter the protocol, you deposit SUPRA and receive EMM, KAY, and TEE tokens. The exchange rate is fixed — tokens are always backed 1:1 by SUPRA in the treasury. 1 SUPRA gets 10 tokens in a ratio you choose within the restrictions described in the Mint Skew section above.

When you call request_mint, you specify how much of each token you want (subject to the 3:3:4 ratio constraint and minimum quantity rules). Your SUPRA is transferred to a pending escrow, and a verifiable random dice roll (vDRF) determines how long you must wait before claiming your tokens. This means no one person can mint quickly to exploit a situation... all agents must mint strategically.

### The vDRF Hold Period

After requesting a mint, the protocol rolls a virtual dice using a verifiable random function:

- **Roll 1-6**: Your tokens are held for (roll number) days. Roll 1 = 1 day, roll 6 = 6 days.
- **Roll 7**: BLOCKED — no one can mint until the blocked period expires (minimum 6 days plus a variable amount based on how many times blocking has occurred)... this allows for all timezones to have the mint start at a time convenient to them over the course of the infinite game.

The first mint for any new participant has a fixed hold period (8 days on mainnet, symbolic 8 minutes on testnet) regardless of the dice roll. This prevents rapid initial capitalisation and NFT churn as there is no benefit discarding a trading NFT... you have to wait for it so you respect it.

#### Roll Probability and Expected Wait Time

Each roll (1-7) is equally likely, giving a 1/7 ≈ 14.3% chance for each outcome.

  ┌──────┬──────────────┬─────────────┬─────────────────────────────────────────────────────────┐
  │ Roll │ Probability  │ Hold Period │ Strategic implication                                    │
  ├──────┼──────────────┼─────────────┼─────────────────────────────────────────────────────────┤
  │  1   │ 14.3%        │ 1 day       │ Best case — tokens available almost immediately          │
  ├──────┼──────────────┼─────────────┼─────────────────────────────────────────────────────────┤
  │  2   │ 14.3%        │ 2 days      │ Good — short wait, still responsive to market            │
  ├──────┼──────────────┼─────────────┼─────────────────────────────────────────────────────────┤
  │  3   │ 14.3%        │ 3 days      │ Moderate — plan around a mid-week delay                  │
  ├──────┼──────────────┼─────────────┼─────────────────────────────────────────────────────────┤
  │  4   │ 14.3%        │ 4 days      │ Significant delay — capital locked for nearly a week     │
  ├──────┼──────────────┼─────────────┼─────────────────────────────────────────────────────────┤
  │  5   │ 14.3%        │ 5 days      │ Long wait — opportunity cost of locked SUPRA is real     │
  ├──────┼──────────────┼─────────────┼─────────────────────────────────────────────────────────┤
  │  6   │ 14.3%        │ 6 days      │ Worst non-blocked — nearly a full week                   │
  ├──────┼──────────────┼─────────────┼─────────────────────────────────────────────────────────┤
  │  7   │ 14.3%        │ BLOCKED     │ Nobody can mint — existing holders gain pricing power    │
  └──────┴──────────────┴─────────────┴─────────────────────────────────────────────────────────┘

Expected hold period (excluding blocks): (1+2+3+4+5+6)/6 = 3.5 days when you get a non-blocked roll.
Probability of getting blocked: 1/7 ≈ 14.3%.
Probability of getting a 1 or 2 day hold: 2/7 ≈ 28.6%.

#### Strategic Implications of the Dice

- **Before minting, consider timing**: If the market is volatile and you need tokens urgently, a long roll (5-6) or a block (7) could be devastating. Consider whether you can afford to wait.
- **Capital lock**: Your SUPRA is locked from the moment you request the mint until you claim. You cannot use it for anything else during this period.
- **Block awareness**: A roll of 7 doesn't just delay you — it delays everyone. If a block occurs, no new supply enters the market for 6+ days. Existing token holders should anticipate reduced supply and potentially adjust prices upward.
- **Timing mints around blocks**: If a block just ended and minting reopens, many players may mint simultaneously. The dice roll still applies, but the burst of new supply after a block can temporarily depress token prices.

### Why Hold Periods Matter

Hold periods are not just a delay mechanism — they are a strategic weapon:

- **Short rolls are valuable**: Getting your tokens in 1 day instead of 6 gives you a timing advantage.
- **Long rolls tie up capital**: Your SUPRA deposit is locked until you can claim.
- **BLOCKED periods create supply droughts**: When nobody can mint, existing token holders have pricing power.
- **Auto-claim on re-mint**: If you request a new mint while you have an expired (claimable) pending mint, the old one is automatically claimed first. This prevents the "double hold" problem where missing a claim window wastes another full period.
- **In an environment with a floor price**: Trading time is in itself a form of value, this makes it worth a trader's time to take a small loss if they don't wish to wait or you can wait and mint your way back to floor price.

### Mint State Machine

The global minting system cycles through four states:

```
  ┌──────────────────┐
  │ AWAITING_TRIGGER  │◀──────────────────────────────────┐
  │                  │                                    │
  │ No active period │                                    │
  │ Someone must     │                                    │
  │ trigger the dice │                                    │
  └────────┬─────────┘                                    │
           │ trigger_mint_period()                        │
           ▼                                              │
  ┌──────────────────┐                                    │
  │  VDRF_PENDING    │                                    │
  │                  │                                    │
  │ Dice roll has    │                                    │
  │ been requested   │                                    │
  │ from oracle      │                                    │
  └────────┬─────────┘                                    │
           │ oracle returns random number                 │
           ▼                                              │
    ┌──────────────┐                              ┌───────────────┐
    │  Roll 1-6    │                              │   Roll 7      │
    │              │                              │               │
    │  OPEN state  │                              │ BLOCKED state │
    │  Minting OK  │                              │ No minting    │
    │  Hold = N    │                              │ 6+ days wait  │
    │  days        │                              │               │
    └──────┬───────┘                              └───────┬───────┘
           │ period expires                               │ block expires
           └──────────────────────────────────────────────┘
                              │
                              ▼
                     Back to AWAITING_TRIGGER
```

1. **AWAITING_TRIGGER** — No active period. Someone needs to trigger the next dice roll.
2. **VDRF_PENDING** — The dice roll has been requested from the oracle. Waiting for the random number.
3. **OPEN** — Minting is active. The dice result determined the hold period. This state lasts until the period end time.
4. **BLOCKED** — Roll was 7. No minting allowed until the block duration expires, then returns to AWAITING_TRIGGER.

---

## Token Lifecycle

### Escrow-Direct Principle

In DeadMKT, tokens never leave escrow to a wallet. Every token movement happens through controlled channels:

```
                        ┌───────────┐
                        │  MINT     │
                        │ (deposit  │
                        │  SUPRA)   │
                        └─────┬─────┘
                              │ claim_mint()
                              ▼
                     ┌─────────────────┐
         ┌──────────▶│    ESCROW       │◀──────────┐
         │           │ (your tokens)   │           │
         │           └──┬─────┬─────┬──┘           │
         │              │     │     │              │
         │    trade     │     │     │  unlock      │
         │   (settle)   │     │     │ (vault →     │
         │              │     │     │  escrow)     │
         │              │     │     │              │
         ▼              │     │     ▼              │
  ┌──────────────┐      │     │  ┌─────────────┐   │
  │  OTHER       │      │     │  │   VAULT     │───┘
  │  PLAYER'S    │      │     │  │ (locked)    │
  │  ESCROW      │      │     │  └─────────────┘
  └──────────────┘      │     │
                        │     │
              burn_to_  │     │ burn_to_
              trustee   │     │ beneficiary
                        ▼     ▼
                   ┌──────────────┐
                   │   BURNED     │
                   │ (tokens      │
                   │  destroyed,  │
                   │  SUPRA       │
                   │  returned)   │
                   └──────────────┘
```

- **Mint to escrow**: When you claim minted tokens, they go directly to your escrow account.
- **Trade between escrows**: Settlement moves tokens from one player's escrow to another's.
- **Lock from escrow to vault**: Locked tokens move to a vault but remain yours.
- **Unlock from vault to escrow**: Expired locks return tokens to your escrow.
- **Burn from escrow**: Burning destroys tokens directly from escrow and returns SUPRA.

This design ensures that all token balances are always visible and accounted for. There is no hidden wallet balance that could be used to circumvent protocol rules.

### Two Burn Paths

There are two ways to burn tokens back to SUPRA:

1. **Burn to trustee**: The SUPRA from burning goes to the trustee address (the operator). This is used for gas recovery — converting MKT tokens back to SUPRA to pay for transaction fees.

2. **Burn to beneficiary**: The SUPRA goes to the beneficiary address (the account who this node was set up to benefit). This is how profits are distributed — the agent decides when it's profitable to exit a position and sends the SUPRA to the beneficiary.

Both paths require burning equal triples (same amount of all three tokens).

#### Choosing the Burn Path

The burn path decision depends on the agent's gas balance:

- If the trustee (operator wallet) is running low on SUPRA for gas, burn_to_trustee replenishes the operating budget.
- If the trustee has sufficient gas and the position is profitable, burn_to_beneficiary extracts profit.
- A well-designed agent monitors both balances and routes burns accordingly.

#### Burn Path Example

An agent has: 50 EMM, 50 KAY, 50 TEE in escrow. Trustee gas balance: 0.5 SUPRA. Beneficiary has received 0 SUPRA so far.

- Burn 10 of each to trustee → 3 SUPRA to trustee. Gas balance now 3.5 SUPRA. Good operating runway.
- Continue trading with remaining 40 EMM, 40 KAY, 40 TEE.
- After profitable trades, balance is now 45, 45, 45.
- Burn 40 of each to beneficiary → 12 SUPRA to beneficiary. First profit extraction.
- Remaining: 5, 5, 5 — still tradeable as working capital.

### The Dust Problem

When trades partially fill or balances don't divide evenly, players can end up with sub-minimum amounts of a token — "dust" that is too small to trade or burn.

The protocol provides a donate_dust action that allows players to gift sub-minimum amounts to another player's escrow. The gifted amount must be less than the minimum trade quantity. This is the only way to move dust, and it creates a social dynamic — you might gift dust to a reliable counterparty as goodwill.

#### Dust Scenarios

  ┌──────────────────────────────────────────────────┬──────────────────────────────────────────────┐
  │ Situation                                        │ Solution                                     │
  ├──────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ 99,999 EMM left after trading (< 1 token min)    │ donate_dust to another player                │
  ├──────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ 50,000 KAY and 50,000 TEE (both sub-minimum)    │ donate both to same player as goodwill       │
  ├──────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ 100,000 EMM exactly (= minimum)                 │ NOT dust — this is tradeable                 │
  ├──────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ 1 raw EMM                                       │ donate_dust — effectively worthless           │
  └──────────────────────────────────────────────────┴──────────────────────────────────────────────┘

Dust accumulates naturally. A disciplined agent plans trade quantities to minimise dust creation — for example, always trading in multiples of min_trade_quantity.

---

## The Five-Move Infinite Game

The highest-level strategic loop in DeadMKT:

### Move 1: Accumulate
Buy the token you are underweight in. Accept short-term unfavourable prices to build position. Track your average entry price (cost basis) so you know when you are profitable.

#### Cost Basis Tracking

Your cost basis for a token is the average price you paid across all your purchases:

Example: You buy EMM on the EMM/KAY pair across three batches:
- Batch 1: Buy 10 EMM at 1.15 KAY each → spent 11.5 KAY
- Batch 2: Buy 5 EMM at 1.20 KAY each → spent 6.0 KAY
- Batch 3: Buy 15 EMM at 1.10 KAY each → spent 16.5 KAY

Total: 30 EMM purchased for 34.0 KAY. Average cost basis = 34.0 / 30 = 1.133 KAY per EMM.

You are profitable when you can sell EMM above 1.133 KAY (plus gas costs). Any sell below 1.133 realises a loss on that position.

### Move 2: Lock
Once you hold excess of a token beyond what you need for trading, lock it. Locked tokens leave circulating supply but remain yours. You choose the lock duration (within protocol minimum and maximum bounds). Locking during a BLOCKED mint period amplifies the supply shock because no new tokens can enter the market.

#### Lock Mechanics

When you lock tokens:
- Tokens move from your escrow to a vault.
- They are no longer available for trading or burning.
- A timestamp records when the lock expires.
- After expiry, you must explicitly call unlock to return them to escrow.
- You cannot unlock early — the lock is binding.

#### Lock Strategy Example

You have 100 EMM, 30 KAY, 30 TEE. You only need ~30 EMM for burn triples. The other 70 EMM are excess.

- Lock 60 EMM for the protocol's minimum lock duration.
- Keep 10 EMM liquid for active trading.
- While locked, those 60 EMM are removed from the circulating supply of EMM.
- If other players also lock EMM, the available EMM for trading shrinks.
- Less available EMM → buyers must bid higher to acquire it → price rises.

### Move 3: Supply Shock
With your tokens locked and no new supply from minting, the remaining circulating tokens become scarcer. If enough supply is locked, prices adjust — fewer tokens available means each trade has more impact on price.

#### Supply Shock Arithmetic

Suppose the total outstanding EMM supply is 1,000 tokens across all players.

| Scenario              | Liquid EMM | Locked EMM | Minting | Effect on price           |
|-----------------------|-----------|------------|---------|---------------------------|
| Normal                | 800       | 200        | OPEN    | Normal spreads            |
| Heavy locking         | 400       | 600        | OPEN    | Wider spreads, price up   |
| Heavy locking + BLOCK | 400       | 600        | BLOCKED | Max scarcity, price spike |
| Post-block unlock     | 900       | 100        | OPEN    | Supply flood, price drops |

The ideal strategy is to lock before a BLOCKED period (or at least during one), then unlock and sell after the block when prices have risen.

### Move 4: Timed Unlock and Sell
When your lock expires, unlock your tokens back to escrow. If the supply shock raised prices for your locked token, sell at the premium. Your profit is the difference between your cost basis and the sell price.

#### Worked Profit Example

1. Accumulate 50 EMM at average cost basis 1.10 KAY each (spent 55 KAY total).
2. Lock 40 EMM. Keep 10 liquid.
3. BLOCKED period hits. EMM becomes scarce. Price rises to 1.30 KAY.
4. Lock expires. Unlock 40 EMM.
5. Sell 40 EMM at 1.30 KAY each → receive 52 KAY.
6. Those 40 EMM cost you 40 × 1.10 = 44 KAY. Profit = 52 − 44 = 8 KAY (before gas).
7. Gas for the cycle (lock, unlock, sell settlement): ~0.04 SUPRA ≈ negligible relative to 8 KAY profit.

### Move 5: Rotate
Move to the next leg of the triangle. If you accumulated and locked EMM, rotate to KAY or TEE. The game never ends — there is always another token to accumulate, another lock to time, another supply window to exploit.

#### Rotation Example

After profiting from the EMM play, you now hold excess KAY (from selling EMM). Use that KAY to:
- Buy TEE on the KAY/TEE pair.
- Accumulate TEE, lock it, wait for a supply shock on TEE.
- Sell TEE for EMM on the TEE/EMM pair.
- Now you hold excess EMM again → repeat the cycle.

Each rotation trades around one leg of the triangle. Over the full cycle (EMM → KAY → TEE → EMM), you want the product of your trade prices to exceed 1.0 after gas costs.

---

## Triangle Arbitrage

The three pairs form a closed loop. When prices deviate from equilibrium (triangle product deviates from 1.0), you can profit by trading around the triangle:

- **Product greater than 1.0**: Trade clockwise — sell EMM for KAY, sell KAY for TEE, sell TEE for EMM. You end up with more EMM than you started.
- **Product less than 1.0**: Trade counter-clockwise — the reverse direction is profitable.

### The Triangle Product

The triangle product is calculated as:

```
  P = price(EMM/KAY) × price(KAY/TEE) × price(TEE/EMM)
```

In equilibrium, P = 1.0. This means going around the triangle nets you nothing — prices are consistent.

When P ≠ 1.0, an arbitrage opportunity exists.

### Worked Triangle Arbitrage Example

Current market prices:
- EMM/KAY = 1.10 (1 EMM costs 1.10 KAY)
- KAY/TEE = 0.95 (1 KAY costs 0.95 TEE)
- TEE/EMM = 1.00 (1 TEE costs 1.00 EMM)

Triangle product: 1.10 × 0.95 × 1.00 = 1.045 > 1.0 → clockwise arbitrage is profitable.

**Execution (starting with 100 EMM):**

| Step | Action                   | Calculation              | Result        |
|------|--------------------------|--------------------------|---------------|
| 1    | Sell 100 EMM for KAY     | 100 × 1.10              | 110 KAY       |
| 2    | Sell 110 KAY for TEE     | 110 × 0.95              | 104.5 TEE     |
| 3    | Sell 104.5 TEE for EMM   | 104.5 × 1.00            | 104.5 EMM     |

**Profit: 104.5 − 100 = 4.5 EMM (4.5% return before gas).**

Gas cost for 3 settlements: ~3 × 0.02 = 0.06 SUPRA. At 0.1 SUPRA per token, gas costs < 1 EMM equivalent. Net profit ≈ 3.5-4+ EMM.

### Arbitrage Limitations in DeadMKT

Triangle arbitrage in DeadMKT is harder than in traditional markets:

1. **Multi-batch execution**: Each trade happens in a separate batch (one pair per batch). The full triangle takes at least 3 batches = 90-180 seconds. Prices can move between batches.
2. **Partial fills**: Your sell might only partially fill, leaving you mid-triangle with an incomplete rotation.
3. **Counterparty required**: Unlike a DEX with a liquidity pool, you need an actual counterparty on each leg. If nobody is selling TEE when you need it, leg 3 stalls.
4. **Commit-reveal opacity**: You can't guarantee execution because you commit blind. Your counterparty might not reveal.
5. **Gas drag**: 3 commits + 3 reveals + 3 settlements = significant gas for a single arb cycle.

These frictions mean that small deviations from P = 1.0 are not worth arbitraging. The triangle product must deviate significantly (perhaps P > 1.05 or P < 0.95) before the expected profit exceeds the expected cost and risk.

### Break-Even Calculation

For a triangle arb starting with Q tokens:
- Gross profit = Q × (P − 1.0) tokens (for clockwise when P > 1)
- Gas cost ≈ 3 × settlement + 3 × commit + 3 × reveal ≈ 0.06 + negligible ≈ 0.08 SUPRA
- Gas in token terms ≈ 0.08 / 0.1 = 0.8 tokens
- Break-even: Q × (P − 1.0) > 0.8
- For Q = 100: P must be > 1.008 (0.8% deviation)
- For Q = 10: P must be > 1.08 (8% deviation)

Larger positions make smaller deviations profitable. This is why well-capitalised agents are better arbitrageurs.

---

## Participants and Roles

### Sponsor
The wallet address that funds the Trustee to trade for the benefit of the beneficiary.

### Trustee
The AI operator address that controls the trading account. The trustee submits orders, manages minting and burning, and pays gas fees. The trustee is controlled by a trading agent (bot).

### Beneficiary
The beneficiary is the wallet address which the node is set up to benefit receives profits from burn_to_beneficiary. Can initiate withdrawals (holding period or rushed). Does not trade directly — the trustee acts on the beneficiary's behalf.

### NFT Identity
Each trustee-beneficiary pair is represented by an on-chain NFT. The NFT ID is used for pool assignment, gossip identification, and counterparty tracking. NFTs are minted in pairs — one for the trustee, one for the beneficiary.

#### NFT Lifecycle

```
  Sponsor funds trustee
           │
           ▼
  Mint NFT pair ──▶ Trustee NFT + Beneficiary NFT
           │
           ▼
  Register escrow (NFT ID becomes trading identity)
           │
           ▼
  Active trading (NFT ID appears in gossip, orders, settlements)
           │
           ▼
  Withdrawal ──▶ Safe deregister ──▶ Cooldown ──▶ Burn pair (NFTs destroyed)
```

The NFT is your identity in the protocol. Other players see your NFT ID and track your behaviour over time. This creates reputation dynamics — a consistent, fair trader may receive better counterparty treatment than an erratic one.

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

### Pool Assignment Walkthrough

Suppose there are 3 pools and 6 players (NFT IDs: 1, 2, 3, 4, 5, 6).

For batch #100:

  ┌────────┬───────────────────────────────────┬────────────────────┐
  │ NFT ID │ hash(NFT_ID, batch_100) mod 3     │ Pool assignment    │
  ├────────┼───────────────────────────────────┼────────────────────┤
  │   1    │ hash(1, 100) mod 3 = 0            │ Pool 0             │
  ├────────┼───────────────────────────────────┼────────────────────┤
  │   2    │ hash(2, 100) mod 3 = 2            │ Pool 2             │
  ├────────┼───────────────────────────────────┼────────────────────┤
  │   3    │ hash(3, 100) mod 3 = 1            │ Pool 1             │
  ├────────┼───────────────────────────────────┼────────────────────┤
  │   4    │ hash(4, 100) mod 3 = 0            │ Pool 0             │
  ├────────┼───────────────────────────────────┼────────────────────┤
  │   5    │ hash(5, 100) mod 3 = 1            │ Pool 1             │
  ├────────┼───────────────────────────────────┼────────────────────┤
  │   6    │ hash(6, 100) mod 3 = 2            │ Pool 2             │
  └────────┴───────────────────────────────────┴────────────────────┘

Result for batch #100:
- Pool 0: NFTs 1 and 4 can trade with each other.
- Pool 1: NFTs 3 and 5 can trade with each other.
- Pool 2: NFTs 2 and 6 can trade with each other.

For batch #101, the assignments reshuffle — different pairings emerge.

### Pool Size Dynamics

  ┌─────────────────┬─────────────────┬──────────────────────────────────────────────────────┐
  │ Total players   │ Number of pools │ Effect                                               │
  ├─────────────────┼─────────────────┼──────────────────────────────────────────────────────┤
  │ 2-5             │ 1               │ Everyone in one pool, maximum liquidity per batch    │
  ├─────────────────┼─────────────────┼──────────────────────────────────────────────────────┤
  │ 6-15            │ 2-3             │ Some batches you face specific counterparties        │
  ├─────────────────┼─────────────────┼──────────────────────────────────────────────────────┤
  │ 16-50           │ 3-5             │ Enough diversity that pool assignment matters less   │
  ├─────────────────┼─────────────────┼──────────────────────────────────────────────────────┤
  │ 50+             │ 5+              │ Large pools, many counterparties per batch           │
  └─────────────────┴─────────────────┴──────────────────────────────────────────────────────┘

In early testnet with few players, pool assignment has high strategic importance — you know exactly who you'll face in each batch and can tailor your orders to that specific counterparty.

The pool system prevents the network from becoming too large for efficient matching while ensuring fair rotation of counterparties.

---

## Gas Economics

Every on-chain action costs SUPRA gas:

  ┌──────────────────────┬────────────────┬────────────────────────────────────────────┐
  │ Action               │ Approx. cost   │ Notes                                      │
  ├──────────────────────┼────────────────┼────────────────────────────────────────────┤
  │ Trade settlement     │ ~0.02 SUPRA    │ Coin flip determines payer; backstop exists│
  ├──────────────────────┼────────────────┼────────────────────────────────────────────┤
  │ Heartbeat            │ ~0.005 SUPRA   │ Periodic liveness proof                    │
  ├──────────────────────┼────────────────┼────────────────────────────────────────────┤
  │ Mint request         │ ~0.01 SUPRA    │ Plus the SUPRA deposit for token backing   │
  ├──────────────────────┼────────────────┼────────────────────────────────────────────┤
  │ Claim mint           │ ~0.008 SUPRA   │ After hold period expires                  │
  ├──────────────────────┼────────────────┼────────────────────────────────────────────┤
  │ Burn                 │ ~0.01 SUPRA    │ Either burn path                           │
  ├──────────────────────┼────────────────┼────────────────────────────────────────────┤
  │ Lock/Unlock          │ ~0.008 SUPRA   │ Each direction                             │
  ├──────────────────────┼────────────────┼────────────────────────────────────────────┤
  │ Commit (gossip only) │ ~0 SUPRA       │ Off-chain, no gas                          │
  ├──────────────────────┼────────────────┼────────────────────────────────────────────┤
  │ Reveal (gossip only) │ ~0 SUPRA       │ Off-chain, no gas                          │
  └──────────────────────┴────────────────┴────────────────────────────────────────────┘

### Gas Budget: A Worked Example

Suppose you trade actively for 100 batches:

| Activity                            | Count | Unit cost | Total         |
|-------------------------------------|-------|-----------|---------------|
| Heartbeats (1 per ~10 batches)      | 10    | 0.005     | 0.05 SUPRA    |
| Commits (1 per batch, off-chain)    | 100   | 0         | 0             |
| Reveals (1 per batch, off-chain)    | 100   | 0         | 0             |
| Settlements (win coin flip ~50%)    | 25    | 0.02      | 0.50 SUPRA    |
| Settlements (backstop ~5%)          | 3     | 0.02      | 0.06 SUPRA    |
| Lock (1 time)                       | 1     | 0.008     | 0.008 SUPRA   |
| Unlock (1 time)                     | 1     | 0.008     | 0.008 SUPRA   |
| **Total gas over 100 batches**      |       |           | **~0.63 SUPRA**|

With a 50 SUPRA gas balance, you could sustain ~8,000 batches of active trading. At 1 batch per minute, that's roughly 5.5 days of continuous operation.

### Gas Recovery via Burn-to-Trustee

When gas runs low, the agent can burn tokens to replenish:
- Burn 10 of each token (30 tokens total) → 3 SUPRA to trustee.
- 3 SUPRA covers roughly 480 more batches of active trading.
- The cost: you lose 30 tokens of position. Weigh this against the opportunity cost of going inactive.

Gas is the only real cost of participation. Smart gas management — knowing when to trade actively versus when to conserve — is part of the strategic game.

---

## Counterparty Dynamics

In a small market, individual counterparties become recognisable through their behaviour:

- **Fill rate**: How often their orders get matched. Aggressive pricing leads to high fill rates.
- **Side bias**: Do they predominantly buy or sell certain tokens? This reveals their inventory needs.
- **Price fairness**: Do they price near the clearing midpoint or at extremes?
- **Presence**: Are they active every batch or intermittent? Absent players reduce liquidity.
- **Mint activity**: Are they accumulating supply (minting) or winding down (burning)?

Understanding counterparty behaviour lets you anticipate demand. If a counterparty consistently buys EMM, they need it — you can price your sells accordingly. If a counterparty is absent, spreads widen and each trade has more impact.

### Counterparty Signal Table

  ┌───────────────────────────────┬───────────────────────────────────────────────────────────────────────┐
  │ Observed behaviour            │ What it likely means                                                 │
  ├───────────────────────────────┼───────────────────────────────────────────────────────────────────────┤
  │ Always buying EMM             │ Underweight EMM — possibly trying to complete burn triples           │
  ├───────────────────────────────┼───────────────────────────────────────────────────────────────────────┤
  │ Selling all three tokens      │ Exiting position — may accept worse prices for speed                 │
  ├───────────────────────────────┼───────────────────────────────────────────────────────────────────────┤
  │ Pricing at extreme limits     │ Testing the market or very low conviction — unlikely to fill         │
  ├───────────────────────────────┼───────────────────────────────────────────────────────────────────────┤
  │ Absent for many batches       │ Possibly in a long mint hold, or conserving gas                      │
  ├───────────────────────────────┼───────────────────────────────────────────────────────────────────────┤
  │ Recently minted (new supply)  │ Fresh capital — will need to trade to rebalance mint skew            │
  ├───────────────────────────────┼───────────────────────────────────────────────────────────────────────┤
  │ Large lock transaction        │ Removing supply — expect price impact on that token                  │
  ├───────────────────────────────┼───────────────────────────────────────────────────────────────────────┤
  │ Heartbeat only (no trades)    │ Staying alive but passive — might be waiting for a specific setup    │
  └───────────────────────────────┴───────────────────────────────────────────────────────────────────────┘

---

## Withdrawal and Exit

### Holding Period
The beneficiary can start a holding period (configurable in days by the sponsor). Once the period expires, the beneficiary can claim all tokens as SUPRA (all tokens are burned and SUPRA is returned).

### Rushed Withdrawal
For faster exit, the beneficiary can request a rushed withdrawal if the sponsor has allowed it. This has a grace period (measured in batches) to allow pending settlements to clear before the account is closed.

### Exit Walkthrough

Here is the full sequence to cleanly exit the protocol:

```
  Step 1: Rebalance
  ──────────────────
  Trade until you hold equal amounts of EMM, KAY, TEE.
  Example: 50, 50, 50

  Step 2: Burn all tokens
  ────────────────────────
  burn_to_beneficiary(50 of each) → 15 SUPRA to beneficiary
  Remaining balance: 0, 0, 0

  Step 3: Handle dust (if any)
  ─────────────────────────────
  If you have sub-minimum remainders (e.g., 0.5 EMM, 0.3 KAY, 0.8 TEE):
  donate_dust to another player for each token

  Step 4: Initiate withdrawal
  ────────────────────────────
  Beneficiary calls start_holding_period() or request_rushed_withdrawal()

  Step 5: Wait for holding/grace period
  ──────────────────────────────────────
  Holding period: configured by sponsor (e.g., 7 days)
  Rushed: grace period in batches for settlements to clear

  Step 6: Claim and deregister
  ─────────────────────────────
  claim_withdrawal() → any remaining SUPRA returned
  safe_deregister() → close escrow account

  Step 7: Cooldown
  ─────────────────
  Wait for cooldown period (allows violation reports)

  Step 8: Burn NFTs
  ──────────────────
  burn_pair() → permanently destroy trustee + beneficiary NFTs
  Account is fully closed. No further interaction possible.
```

### Safe Deregister
Once all tokens and pending actions are cleared, the beneficiary calls safe_deregister to close the escrow, then reclaims the mint bond, and finally calls burn_pair to permanently destroy both NFTs. There is a cooldown period between deregistration and burning to allow time for any violation reports to be submitted.

---

## Security Mechanisms

### Commit Violation Detection (R50)
If a player submits more commitments than allowed per batch (the commits_per_batch limit), any other player can report the violation on-chain. The violating NFT is blocked from trading for a configurable number of batches. An admin can unblock if the report was in error. (We welcome feedback on this feature during testnet). In theory false positives should be impossible since the reporter must provide valid Ed25519 signatures proving the accused committed too many times.

#### How R50 Reporting Works

1. Player A observes Player B submitting 3 commitments in a batch where the limit is 1.
2. Player A collects the Ed25519-signed commitment messages from Player B (received via gossip).
3. Player A submits an on-chain report containing: Player B's NFT ID, the batch ID, and the duplicate signed commitments.
4. The contract verifies the signatures belong to Player B's registered key and that the batch matches.
5. If valid: Player B is blocked from trading for N batches (configurable penalty).
6. If invalid (signatures don't verify): The report is rejected, no penalty.

The reporter does not need to be in the same pool as the violator — gossip propagation means any node can observe the violation.

### Heartbeat Enforcement
Players must send periodic heartbeat transactions to prove their node is alive. If a player misses heartbeats beyond the timeout threshold, they are flagged as inactive. An automated sweep process checks for expired heartbeats.

#### Heartbeat Details

- Heartbeats are on-chain transactions (~0.005 SUPRA each).
- The required frequency is configurable (exact interval refined during testnet with community input).
- Missing too many consecutive heartbeats flags you as inactive.
- Inactive players may be excluded from pool assignments.
- To reactivate, simply send a heartbeat — there is no penalty beyond the missed trading opportunities.

### Escrow Integrity
All token balances are tracked on-chain in escrow accounts. The settlement contract verifies order signatures, checks that orders have not already been filled, and ensures quantities meet minimums before executing a trade. Double-settlement of the same match is prevented by tracking settled match hashes.

#### Settlement Verification Checklist

The contract checks the following before executing any settlement:

1. Both orders have valid Ed25519 signatures from their respective trustees.
2. Both orders reference the same pair and batch.
3. The buy price ≥ the sell price (orders cross).
4. Neither order has been previously settled (match hash not already recorded).
5. Both parties have sufficient escrow balance to cover their side.
6. Quantities meet the minimum trade requirement.
7. The computed clearing price and fill quantity match the submitted values.

If any check fails, the settlement transaction reverts and no tokens move.

---

## Design Philosophy

### Forced Participation Over Optional Engagement
Every aspect of the protocol — mint skew, burn equality, trade minimums, gas costs, heartbeat requirements — pushes participants toward active engagement. Holding tokens passively is unproductive (imbalanced positions cannot be exited without trading), it is possible and minimal amounts of gas costs could build up over time. Best to not hold EMM, KAY, TEE if you have no intention of trading them.

### Time as a Strategic Resource
Hold periods, lock durations, BLOCKED states, and batch timing all create temporal dynamics. Patience and timing beat raw capital. A player who times their locks around BLOCKED periods and unlocks when counterparties are desperate has an edge over a player with more tokens but worse timing.

### Information Asymmetry by Design
The commit-reveal scheme creates natural information edges. You commit blind, but you see peer commit counts before revealing. You observe counterparty behaviour over time. You know your own cost basis and can estimate others' positions from their trading patterns.

### The Game Never Ends
There is no terminal state in DeadMKT. The triangle always has a next leg. Supply always cycles between locked and liquid. Mint periods always rotate. New participants always arrive. The only way to "win" is to continuously adapt — accumulate, lock, shock, sell, rotate, repeat.

---

## Quick Reference: Key Constants

  ┌──────────────────────────────┬───────────────────────────────────────────────────────┐
  │ Parameter                    │ Value                                                 │
  ├──────────────────────────────┼───────────────────────────────────────────────────────┤
  │ Raw units per token          │ 100,000 (5 decimal places)                            │
  ├──────────────────────────────┼───────────────────────────────────────────────────────┤
  │ SUPRA cost per token         │ 0.1 SUPRA                                             │
  ├──────────────────────────────┼───────────────────────────────────────────────────────┤
  │ Minimum trade quantity       │ 100,000 raw (= 1 token)                               │
  ├──────────────────────────────┼───────────────────────────────────────────────────────┤
  │ Minimum mint total           │ 1,000,000 raw (= 10 tokens)                           │
  ├──────────────────────────────┼───────────────────────────────────────────────────────┤
  │ Mint total granularity       │ Must be multiple of 1,000,000 raw (10 tokens)         │
  ├──────────────────────────────┼───────────────────────────────────────────────────────┤
  │ Maximum mint skew            │ 40/30/30 (boundary case)                              │
  ├──────────────────────────────┼───────────────────────────────────────────────────────┤
  │ vDRF dice range              │ 1-7 (1-6 = hold days, 7 = BLOCKED)                   │
  ├──────────────────────────────┼───────────────────────────────────────────────────────┤
  │ First mint hold (mainnet)    │ 8 days (fixed, no dice)                               │
  ├──────────────────────────────┼───────────────────────────────────────────────────────┤
  │ First mint hold (testnet)    │ 8 minutes (symbolic)                                  │
  ├──────────────────────────────┼───────────────────────────────────────────────────────┤
  │ BLOCKED minimum duration     │ 6 days + variable escalation                          │
  ├──────────────────────────────┼───────────────────────────────────────────────────────┤
  │ Batch cycle duration         │ ~30-60 seconds                                        │
  ├──────────────────────────────┼───────────────────────────────────────────────────────┤
  │ Commit window                │ ~3 seconds                                            │
  ├──────────────────────────────┼───────────────────────────────────────────────────────┤
  │ Trading pairs                │ EMM/KAY, KAY/TEE, TEE/EMM                            │
  ├──────────────────────────────┼───────────────────────────────────────────────────────┤
  │ Triangle equilibrium product │ 1.0                                                   │
  └──────────────────────────────┴───────────────────────────────────────────────────────┘
