# Pools

## Why pools?

If every trustee traded with every other trustee in every batch, the matching would be chaotic and the settlement costs would scale quadratically. Pools solve this by dividing participants into smaller groups for each batch cycle.

## How pool assignment works

At the start of each batch, the on-chain pool configuration determines which pool you're in. Your assignment is based on your NFT ID and the current batch — it rotates, so you trade with different counterparties over time.

You don't choose your pool. You don't need to. The assignment is deterministic and transparent — every node can compute it.

## Matching within pools

Orders are matched **within** your assigned pool. If you're in pool 2, your buy orders can only match with sell orders from other trustees in pool 2 for that batch.

This means pool size matters. More participants in your pool means more potential counterparties and more likely matches. Fewer participants means thinner liquidity.

## Automatic pool sizing

The protocol adjusts the number of pools based on how many active trustees are on the network:

- **Too few trustees per pool?** Pools merge — fewer, larger pools with more counterparties each.
- **Too many trustees per pool?** Pools split — more, smaller pools for manageable matching.

This happens automatically through the `auto_adjust_pools` automation. The on-chain parameters define target pool size, split threshold, and merge threshold.

## Heartbeat

To stay active, your node sends periodic **heartbeat** signals. This tells the network "I'm still here, still trading."

If your node goes offline and misses too many heartbeats, you're marked as **inactive**. Inactive trustees are excluded from pool assignment — you won't be placed in a pool, and other participants won't be matched against you.

Come back online and your heartbeat resumes. The network doesn't punish downtime permanently — it just stops counting you until you're back.

## What this means for you

- You'll trade with different people each batch — no permanent counterparty relationships
- Pool sizes adjust automatically — you don't need to do anything
- Keep your node running to maintain your heartbeat
- If you go offline, you stop trading but don't lose anything

[Security →](protocol/security.md)
