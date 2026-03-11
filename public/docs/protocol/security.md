# Security

## How the protocol prevents cheating

No system is perfectly secure. But DeadMKT is designed so that cheating is **visible**, **costly**, and **avoidable**. Here's how each attack vector is handled.

## Front-running

**The attack:** Someone sees your order and trades ahead of you, profiting from the price movement your order causes.

**The defence:** Commit-reveal. During the commit phase, you publish only a hash of your order. Nobody — not other traders, not node operators — can see what you ordered. Orders are only revealed when everyone reveals simultaneously. There's no window where anyone has an information advantage.

## Order manipulation

**The attack:** Someone changes their order after seeing yours, or submits an order they never intended to honour.

**The defence:** Every order is signed with your Ed25519 private key. The commitment hash locks in your order before the reveal. If the revealed order doesn't match the commitment hash, the network rejects it. You can't change your mind after committing.

## Price manipulation

**The attack:** Someone submits a fake price or manipulates the clearing price to their advantage.

**The defence:** The clearing price is a mathematical formula applied to two signed inputs:

```
clearing_price = (buyer_price + seller_price) / 2
```

Nobody submits the clearing price. Nobody controls it. The chain computes it from the two signed order prices. Both parties must have signed their prices with their private keys before the match. There's no surface to manipulate.

## Settlement fraud

**The attack:** One party receives tokens but the other doesn't. Or someone claims a settlement happened when it didn't.

**The defence:** Settlement is **atomic** and on-chain. The settlement smart contract transfers tokens from both escrows in a single transaction. Both sides transfer or neither does. Every settlement emits a `BatchTradeSettled` event that's permanently recorded on the blockchain — verifiable by anyone.

## Gas manipulation

**The attack:** The party who pays gas for settlement has an advantage — they could delay or refuse to submit.

**The defence:** The gas payer is determined by a hash of the match data. It's deterministic — both parties can compute who should pay. It's unriggable — neither party chose the outcome. Over time, it distributes roughly 50/50.

If the designated gas payer doesn't submit settlement, the other party can submit it instead through the **backstop mechanism** after a timeout. Nobody can block a valid settlement by refusing to pay gas.

## Commit violations

**The attack:** A node publishes invalid or excessive commits to disrupt the network.

**The defence:** Commit violations are detected on-chain. If your node submits commits that violate the protocol rules, your NFT can be **blocked** — preventing you from participating in future batches until the block is resolved. This is automatic, on-chain enforcement. No human judgement involved.

## Inactive squatters

**The attack:** Someone registers, gets assigned to a pool, but never trades — reducing the pool's effective liquidity.

**The defence:** The heartbeat system. Nodes must send periodic heartbeat signals. Miss enough heartbeats and you're marked inactive — excluded from pool assignment. Active traders aren't burdened by ghost nodes.

## What we don't solve

Being honest about limitations:

- **Smart money vs dumb money.** Better strategies win. Someone with a more sophisticated AI strategy will make better trades. The infrastructure is fair — the outcomes depend on your decisions and your strategy.

- **Capital advantages.** Someone with more capital can trade larger sizes. We don't equalize capital — we equalize information and execution.

- **The protocol itself.** We're confident in the design, but it's alpha software. We encourage security researchers to review the contracts and node code. Everything is open source at [github.com/deadmkt](https://github.com/deadmkt).

The bar we set: cheating should be visible, costly, and avoidable. That's more than retail has ever had.

[Getting Started →](guides/getting-started.md)
