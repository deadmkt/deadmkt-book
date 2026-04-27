# Trippples Tokens

## What are EMM, KAY, and TEE?

Trippples are three purpose-built tokens that exist only within the DeadMKT protocol. They don't represent dollars, gold, or any external asset. They're designed from the ground up for the protocol's game theory — a closed, circular market structure where every participant starts on equal footing.

Think of them as the playing pieces of a fair game, where the rules are enforced by math and the infrastructure can't take sides.

## Why three tokens?

Three tokens create three trading pairs:

```
EMM/KAY     KAY/TEE     TEE/EMM
```

Every token plays two roles:
- **EMM** is the base token in EMM/KAY and the quote token in TEE/EMM
- **KAY** is the base token in KAY/TEE and the quote token in EMM/KAY
- **TEE** is the base token in TEE/EMM and the quote token in KAY/TEE

No token is special. No token is "the dollar." They rotate roles equally across the three pairs. This creates balanced demand — if one token gets overpriced in one pair, the imbalance shows up in the other two. The circular structure is self-correcting.

## Getting tokens: Minting

You get Trippples by **minting** them. Here's how:

1. **Request a mint** — Pay SUPRA (the native chain token) and specify how much EMM, KAY, and TEE you want. Equal amounts of all three or skewed to your strategy within limits (you can mint different amounts of all 3).
2. **Wait for the hold period** — A verifiable random function (dVRF) determines how long you wait. This creates natural supply scarcity.
3. **Claim your tokens** — After the hold period, your tokens are ready. Claim them directly into your escrow.

The setup wizard handles all of this automatically when you first run your node. You fund your account with SUPRA, and the wizard mints and deposits your initial Trippples.

### The dVRF roll

The hold period isn't fixed — it's determined by a random roll:

| Roll | Result |
|------|--------|
| 1–6 | Mint window opens with a hold duration (varies by roll) |
| 7 | Blocked — wait for the next cycle and try again |

This means minting is unpredictable. You can't time the market by minting at exactly the right moment. The randomness is verifiable on-chain — nobody controls the outcome.

## Returning tokens: Burning

Want to exit? **Burn** your Trippples to get SUPRA back. There are two burn paths:

- **Burn to trustee** — SUPRA goes to your operator address (gas recovery)
- **Burn to beneficiary** — SUPRA goes to your owner address (profit distribution)

Both require burning equal amounts of all three tokens — you can't burn just one. Burning removes tokens from circulation permanently and returns the backing value directly from the treasury.

## Locking tokens

You can **lock** tokens for a duration to reduce circulating supply. Tokens move directly from your escrow to a vault — they never leave the protocol.

Locked tokens can't be traded or withdrawn until the lock period expires. After it expires, you unlock them back to your escrow.

Why would you lock? It's a signal. A trustee who locks tokens is committed — they're reducing their own liquidity in exchange for influencing supply dynamics. The strategy implications are for you and your AI to figure out.

## Token details

| Property | Value |
|----------|-------|
| Decimal places | 5 (100,000 base units per whole token) |
| Supply | Variable — grows with minting, shrinks with burning |
| Backing | Each mint costs SUPRA; each burn returns SUPRA |
| Transferability | Within escrow for trading; lockable in vault; never leaves escrow to wallet |
| Min trade quantity | Enforced globally — each trade and mint must meet the minimum |

## What they are not

- They're **not** stablecoins. There's no peg.
- They're **not** governance tokens. There's nothing to vote on.
- They're **not** representations of external assets.
- They're **not** meant to be held forever. They're meant to be traded.

Trippples exist because the protocol needs a self-contained market to operate. They're the medium through which fair trading happens and all data feeds are visible to all participants in fair timing.

[NFT Identity →](/protocol/nft-identity)
