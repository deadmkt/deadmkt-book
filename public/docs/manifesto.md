> *This manifesto describes the vision and principles behind DeadMKT. The alpha testnet implements most of these guarantees. Where the implementation is still catching up to the vision, we say so in the protocol documentation.*

# The ECN Manifesto

## The Problem

Retail traders are being systematically extracted by the infrastructure designed to "serve" them.

This is not conspiracy. This is architecture.

---

## How Traditional Finance Extracts Value

### Front-Running

```
You click buy.
Your broker sees it.
They buy first.
Price moves.
You get filled at the worse price.
They pocket the difference.

You'll never know.
```

### Last Look

```
You submit an order.
Broker has 200ms to decide.
If the market moved in your favor: REJECT.
If the market moved against you: FILL.

Heads they win. Tails you lose.
```

### Payment for Order Flow

```
Citadel pays Robinhood for your orders.
Why?
Because your order flow is VALUABLE.
They see it before the market.
They trade against it.

You are not the customer.
You are the product.
```

### Stop Hunting

```
Your stop loss is at 1.1000.
Everyone's stop loss is at 1.1000.
Broker pushes price to 1.0999.
All stops trigger.
You sell at the bottom.
Price reverses.
Broker profits.

"The market is volatile."
```

### Information Asymmetry

```
They see:
  - Order flow from 10 million accounts
  - Your position
  - Your stop losses
  - Your historical behavior
  - Your panic patterns

You see:
  - A chart
  - Delayed quotes
  - A spread they control
```

### Spread Manipulation

```
Normal times: 1 pip spread
News event: 20 pip spread

When you NEED to trade, the cost spikes.
When it's calm, they advertise "tight spreads!"
```

### Delayed Execution

```
You click at 1.1050.
System "processes" for 500ms.
Price moves to 1.1055.
You get filled at 1.1055.

"Market conditions."
```

### Trading Against You

```
Many brokers are the counterparty.
When you win, they lose.
When you lose, they win.

Guess what they're optimizing for.
```

---

## The Numbers

| Metric | Retail | Institutional |
|--------|--------|---------------|
| Forex spread | 1-3 pips | 0.1-0.3 pips |
| Execution speed | 100-500ms | <1ms |
| Order visibility | None | Full |
| Recourse | None | Legal teams |

**The spread difference alone is a 10x extraction.**

**90% of retail forex traders lose money.**

Is it because they're bad at trading?

Or is it because **the game is rigged at the infrastructure level?**

---

## Why It Persists

1. **Complexity hides extraction**
   - Retail doesn't understand market microstructure
   - "I lost because I was wrong"
   - The real reason: "I lost because they saw my cards"

2. **Regulatory capture**
   - PFOF is legal
   - Last look is legal
   - The rules were written by incumbents

3. **No alternative**
   - Where else would you go?
   - All brokers do it
   - The infrastructure IS the extraction

4. **Information asymmetry about the asymmetry**
   - Most traders don't know this is happening
   - It's not taught
   - It's not disclosed
   - It's designed to be invisible

---

## What We're Building

An Electronic Communication Network (ECN) where:

### 1. No Counterparty Broker

```
Traditional:
  You → Broker (counterparty) → Maybe market
  
ECN:
  You → Network → Other traders
  
The node is a relay, not a counterparty.
They don't profit from your loss.
```

### 2. Signed, Binding Orders

```
Your order is signed by your key.
It cannot be modified.
It cannot be rejected after inspection.
It cannot be front-run without detection.

When matched, settlement is atomic, on-chain.
Your price is your limit — you'll never pay more (buying)
or receive less (selling). The actual settlement price
is the midpoint of you and your counterparty.

Both sides contribute equally.
Neither side gets exploited.
The chain computes this. Not the broker.
```

### 3. Transparent Execution

```
Every settlement is on-chain.
Every fill is verifiable.
Every price is auditable.

Not "trust us." 
VERIFY.
```

### 4. No Payment for Order Flow

```
Gas cost for settlement. That's it.
A cryptographic coin flip decides who pays.
50/50. Fair. Unriggable.

No hidden spreads.
No kickbacks.
No selling your flow.
No taker/maker games.
```

### 5. Fair Price, Computed by Math

```
Traditional exchange:
  Market maker sets the price.
  Broker picks the fill.
  You hope for the best.

This ECN:
  Settlement price = (your price + their price) / 2.

  That's it.
  
  You bid 1.10. They ask 1.08.
  You settle at 1.09. Both split the surplus equally.

  The chain computes this. Not the broker.
  Not the node operator. Not anyone with an opinion.
  
  Nobody submits the price.
  Nobody can manipulate the price.
  It's a formula applied to two signed inputs.
  
  Both prices are Ed25519-signed by their owners.
  The gas payer has zero control.
  
  This is the only exchange model where
  PRICE SAFETY IS CRYPTOGRAPHICALLY ENFORCED.
```

### 6. Speed Is Dead

```
Traditional exchange:
  Fastest server wins.
  Co-location. Fiber optics. Nanoseconds.
  You can't compete. You're not supposed to.

Batch auction:
  All orders collected in a window.
  All revealed simultaneously.
  Matched by algorithm. Settled on-chain.

  Doesn't matter if your order arrived
  1ms or 1 second into the batch.

  Speed advantage: ZERO.
  Intelligence advantage: EVERYTHING.
```

### 7. You ARE The Infrastructure

```
Traditional ECN:
  Connect to someone else's node.
  Hope they don't front-run you.
  Hope they don't sell your data.
  Hope they don't go down.

This ECN:
  Every participant runs their own node.
  No operators. No middlemen. No hope required.
  Your node. Your keys. Your strategy.

  There is no one standing between you and the market
  because YOU are the market.
```

### 8. Sovereign Exit

```
Don't want to play anymore?

  1. Withdraw your funds from escrow.
  2. Burn your NFT pair.
  3. Walk away. Everything is yours.

No lock-ups. No withdrawal fees.
No "please contact support."

Your money. Your choice. Always.
```

### 9. Reputation, Not Punishment

```
Traditional system:
  Cheaters get fined.
  Fines become cost of doing business.
  They keep cheating.

This system:
  Every settlement outcome is tracked.
  Every bail is recorded.
  Every counterparty's reliability is visible.
  Reports are gossip-verified against the chain.

  Bail on your trades?
    → Your counterparties see it.
    → Their strategies avoid you.
    → You become a ghost in the network.
    → Nobody wants to trade with you.

  No regulators needed.
  No fines to negotiate.
  No lawyers to hire.

  Just math and consequences.
```

---

## What We Guarantee

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1. YOUR ORDER IS SOVEREIGN                                     │
│     Signed by you. Cannot be modified. Cannot be faked.         │
│                                                                 │
│  2. EXECUTION IS VERIFIABLE                                     │
│     On-chain settlement. Auditable. Provable.                   │
│                                                                 │
│  3. NO HIDDEN COUNTERPARTY                                      │
│     Peer-to-peer trading. Node is relay, not opponent.          │
│                                                                 │
│  4. EQUAL INFORMATION AT REVEAL                                 │
│     Commit-reveal. Nobody sees your order until everyone does.  │
│     Same data. Same moment. No privileged access.               │
│                                                                 │
│  5. PRICE IS MATH, NOT OPINION                                  │
│     Settlement = (your price + their price) / 2.                │
│     Computed on-chain from signed inputs. Nobody controls it.   │
│     No broker spread. No manipulation surface. Just arithmetic. │
│                                                                 │
│  6. TRACK RECORD IS PUBLIC                                      │
│     Settlement reliability is tracked and gossip-verified.      │
│     Unreliable counterparties are visible to everyone.          │
│                                                                 │
│  7. YOUR EXIT IS SOVEREIGN TOO                                  │
│     Withdraw from escrow. Burn NFT. Leave. No permission.       │
│                                                                 │
│  8. CHEATING IS VISIBLE AND COSTLY                              │
│     Reputation. Verification. Competition.                      │
│     Bail on trades → strategies stop matching with you.         │
│     Modify your node → chain rejects your settlements.          │
│     Try to manipulate price → there's nothing to manipulate.    │
│     The cost of cheating is exile.                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## What We Don't Solve

Being honest:

| Reality | Status |
|---------|--------|
| Smart money vs dumb money | Still exists. Better strategies win. |
| Large players have advantages | More capital, better models. But not speed. |
| Participants can still try to cheat | But on-chain enforcement catches them. |
| Market manipulation | Still possible, just not by infrastructure. |

**We're not making trading "fair" in the sense that everyone wins.**

**We're making it fair in the sense that the infrastructure isn't rigged against you.**

---

## The Shift

| Before | After |
|--------|-------|
| Trust the broker | Verify on-chain |
| Hidden extraction | Visible fees only |
| Broker is counterparty | Peer-to-peer |
| Broker sets the price | Math sets the price |
| No recourse | Withdraw and leave |
| Invisible abuse | Verifiable reputation |
| Captured regulation | Code is law |
| Speed wins | Intelligence wins |

---

## The Bar

We cannot build a perfect system.

But we can build one where:

**Cheating is visible.**

**Cheating is costly.**

**Cheating is avoidable.**

That's more than retail has ever had.

---

## This Is Not About Technology

The technology is the easy part.

This is about:

- **Power**: Who controls the infrastructure?
- **Transparency**: Who sees what?
- **Accountability**: What happens when someone cheats?
- **Access**: Who can participate fairly?

The current system answers all of these in favor of incumbents.

We're changing the answers.

---

## Join Us

If you believe:
- Markets should be transparent
- Execution should be verifiable
- Retail deserves fair infrastructure
- Trust should be earned, not assumed

Then build with us.

---

*"The best way to rob a bank is to own one."*
*- William K. Black*

*The best way to fix trading is to rebuild the infrastructure.*

*That's what we're doing.*
