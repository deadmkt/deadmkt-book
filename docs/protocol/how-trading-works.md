# How Trading Works

Trading on DeadMKT happens in **batch cycles**. Instead of a continuous order book where speed wins, orders are collected over a window of time and then matched all at once. This eliminates front-running and makes the fastest server irrelevant.

Here's what happens in each batch:

## 1. Batch Opens

The network advances to a new batch. Every node knows the batch ID, which pool they're assigned to, and the parameters for this cycle (how many commits are allowed, how long each phase lasts).

Your node sends a `batch_start` event to your strategy with everything it needs to make a decision: your escrow balances, wallet balances, mint state, circulating supply, and last batch results.

## 2. Commit Phase

Your strategy decides what orders to place and responds with a `commit` action. Each order specifies a pair (like `EMM/KAY`), a side (`buy` or `sell`), a price, and a quantity.

Your node takes each order, signs it with your Ed25519 private key, computes a hash of the signed order, and publishes that hash to the gossip network. The hash is a **commitment** — it proves you placed an order without revealing what the order is.

```
Strategy: "Buy 330 EMM/KAY at 0.05"
     ↓
Node: sign(order) → hash(signed_order) → publish hash
     ↓
Network: sees the hash. Can't see the order.
```

Nobody can front-run you because nobody knows what you ordered. Not even the other nodes in your pool.

## 3. Reveal Phase

Once the commit window closes, all nodes reveal their actual orders by publishing the full signed order data. Every node can now verify that the revealed order matches the commitment hash from phase 2.

If someone tries to change their order after seeing others, the hash won't match. The network rejects it.

```
All nodes reveal simultaneously.
     ↓
Everyone sees all orders at the same moment.
     ↓
Nobody had an information advantage.
```

## 4. Matching

The matching algorithm looks at all revealed orders within a pool and finds **crossing pairs** — a buyer willing to pay at least as much as a seller is asking.

```
Buyer: "I'll pay up to 0.052 for EMM"
Seller: "I'll sell EMM for at least 0.048"

0.052 ≥ 0.048 → Match!
```

The **clearing price** is the midpoint of the two prices:

```
Settlement price = (0.052 + 0.048) / 2 = 0.050
```

Both sides split the surplus equally. Neither side gets a better deal at the other's expense. The chain computes this from two signed inputs — nobody submits the price, nobody can manipulate it.

## 5. Settlement

Each matched trade settles on-chain through the settlement smart contract. The settlement:

- Transfers the base token from seller's escrow to buyer's escrow
- Transfers the quote token from buyer's escrow to seller's escrow
- Records the trade as a `BatchTradeSettled` event — permanent, verifiable, auditable

Settlement is **atomic**: both sides transfer or neither does. There's no state where one party has sent tokens but the other hasn't.

Gas for the settlement transaction is paid by one of the two parties. Which one? It's determined by a hash of the match data — deterministic, unriggable, and roughly 50/50 over time.

## 6. Next Batch

The cycle repeats. Your node enters the next batch, your strategy gets fresh data, and the process starts again.

## What makes this different

| Traditional Exchange | DeadMKT |
|---------------------|---------|
| Continuous order book — fastest wins | Batch auction — arrival order irrelevant |
| Broker sees your order first | Nobody sees your order until reveal |
| Broker sets the price | Price is mathematical midpoint |
| Broker can reject your order | Signed orders are binding |
| Settlement is opaque | Settlement is on-chain, verifiable |
| Speed advantage: everything | Speed advantage: zero |
| Intelligence advantage: limited | Intelligence advantage: everything |

[Trippples Tokens →](/protocol/trippples)
