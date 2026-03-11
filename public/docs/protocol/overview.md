# Protocol Overview

## What is DeadMKT?

DeadMKT is a peer-to-peer electronic communication network (ECN) for trading. If you're familiar with traditional finance, think of it as a dark pool — but one where nobody has an information advantage, there's no operator to trust, and every trade settles on-chain.

If you're not familiar with any of that, here's the simple version: it's a network where people trade directly with each other, and the infrastructure can't cheat.

## How is it different?

In traditional trading, a broker sits between you and the market. They see your orders before the market does. They can trade against you, reject your orders, manipulate the spread, or sell your order flow to someone who will.

DeadMKT removes the broker entirely.

- **You run your own node.** There's no central server to connect to. Every participant operates their own trading node. Your node talks directly to other nodes through a peer-to-peer gossip network.

- **Orders are signed and sealed.** When you place an order, your node signs it with your private key and publishes only a hash — a commitment. Nobody can see what you ordered. Not the other traders. Not the node operators. Nobody. Until everyone reveals at the same time.

- **Matching is fair.** Once orders are revealed, the matching algorithm pairs crossing orders — buyers willing to pay more than sellers are asking. The settlement price is the mathematical midpoint. Not a price set by a market maker. Not a spread controlled by a broker. Just arithmetic.

- **Settlement is on-chain.** Every matched trade settles atomically on the Supra blockchain. Both sides transfer or neither does. The transaction is verifiable, permanent, and auditable by anyone.

## What do you trade?

DeadMKT uses three purpose-built tokens called **Trippples**: EMM, KAY, and TEE. These form three circular trading pairs:

```
EMM/KAY    KAY/TEE    TEE/EMM
```

Every token is a base asset in one pair and a quote asset in another. There's no "dollar" in this system — no special reserve currency. The three tokens rotate roles equally, creating balanced demand dynamics.

You can learn more about how they work in [Trippples Tokens](protocol/trippples.md).

## Who operates it?

You do. Every participant runs their own node. The network operates through peer-to-peer gossip — nodes discover each other, share order commitments, and coordinate batch cycles without any central server.

There's no company running the infrastructure. No one to call. No one to trust. The rules are enforced by smart contracts on-chain, and the network functions as long as participants are running nodes.

## What's the catch?

There isn't a hidden one, but there are honest realities:

- **Better strategies win.** The infrastructure is fair, but trading is still competitive. If someone has a better strategy than you, they'll make better trades. That's not a bug — that's a market.

- **You need to run software.** This isn't a website where you click buttons. You run a node, connect a strategy, and participate actively. It's infrastructure for people who want to operate, not spectate.

- **It's early.** This is an alpha testnet. The protocol works, the contracts are deployed, trades settle on-chain. But the network is young and the community is small. That's an opportunity if you want to be early.

[How Trading Works →](protocol/how-trading-works.md)
