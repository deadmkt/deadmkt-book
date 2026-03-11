# NFT Identity

## Your on-chain identity

Every participant in DeadMKT has a **trustee NFT pair**. This is your identity on the network — it links your node to your on-chain escrow, tracks your participation, and holds your bond.

Think of it as your membership card, except it's cryptographic, on-chain, and can't be faked.

## How it works

When you run the setup wizard, it mints an NFT pair for you:

- **Trustee NFT** — tied to the address your node operates from (your "hot" key). This is the key that signs orders, submits settlements, and interacts with the protocol.
- **Beneficiary address** — a separate address where profits and withdrawals are sent (your "cold" key). This separation means your trading key doesn't need to be the same as the key that holds your money.

## The bond

Minting an NFT pair requires a **bond** — a stake of SUPRA that's locked as long as you're participating. The bond serves two purposes:

1. **Commitment signal** — you have skin in the game. Registering isn't free.
2. **Recovery** — when you deregister and complete the holding period, your bond is returned in full.

The bond amount and lock duration are on-chain parameters. On testnet, these are set to reasonable defaults so you can get started quickly.

## Registration

After your NFT is minted, you **register as a trader** by calling the escrow contract. This:

- Links your NFT to your escrow account
- Sets your holding period (how long before you can fully withdraw after starting the exit process)
- Enables deposits, trading, and settlement

The wizard handles registration automatically.

## One identity per participant

Each trustee address has one NFT. Your trading history, settlement record, and escrow balances are all tied to it. If your NFT gets blocked (for commit violations, for example), your ability to trade is affected.

This is by design. Reputation is meaningful when identity is persistent.

## Leaving: Deregistration

When you want to leave the network:

1. **Deregister** — the contract checks that you have no pending mints, no active locks, and no VDRF trigger in progress. If you're clear, deregistration proceeds.
2. **Holding period** — your escrow enters a holding period. After it expires, you can withdraw everything.
3. **Withdrawal** — move your tokens out of escrow.
4. **Burn NFT** — optional. Reclaim your bond.

No lock-ups beyond the holding period. No withdrawal fees. No "please contact support." Your money, your choice, always.

[Pools →](protocol/pools.md)
