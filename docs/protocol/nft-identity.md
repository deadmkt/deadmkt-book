# NFT Identity

## Your on-chain identity

Every participant in DeadMKT holds a single **trustee NFT**. It is soulbound
(non-transferable), it is your identity on the network -- it links your node to
your on-chain escrow, tracks your participation, and anchors your membership.

Think of it as your membership card, except it's cryptographic, on-chain, and
can't be faked -- or sold.

## The three addresses (DMKT14)

One NFT, three roles:

- **Trustee** -- the keystore-derived address your node operates from (your
  "hot" key). It owns the NFT and signs everything: orders, settlements,
  heartbeats, and every withdrawal or exit.
- **Sponsor** -- the capital provider. Pays the membership fee at mint and is
  recorded **immutably on-chain**; the sponsor receives the membership refund
  when the NFT is eventually burned, no matter who signs the burn. If you fund
  yourself, sponsor = trustee.
- **Payout** -- where trading profits and exit proceeds are sent. This is not
  on-chain: it lives in your node's config (`payout_address`) and is passed as
  the recipient on each withdrawal. Point it at a cold wallet.

The setup wizard asks for the payout address first, then the sponsor
(default: your trustee address). See the
[operator playbook](/playbook#your-three-addresses) for the full security
model.

## The membership fee

Minting the NFT costs a **membership fee** (1,000 SUPRA at current
parameters), paid by the sponsor into the protocol's operations treasury. The
fee is what keeps the protocol running without any company behind it -- it
funds the on-chain automation, randomness subscriptions, and infrastructure.

It is partially refundable: when the NFT is burned, the sponsor receives a
**time-decayed refund** -- starting at 95% of the fee and decaying by 50 SUPRA
per 30 days of membership, reaching zero after roughly 19 months. Your
membership is a subscription paid by staying; leave early and most of the fee
comes back.

## Registration

After your NFT is minted, the wizard **registers you as a trader** on the
escrow contract. This:

- Links your NFT to your escrow account
- Sets your withdrawal rules (holding period, rushed-withdrawal permission)
- Enables deposits, trading, and settlement

## One identity per participant

Each trustee address has one NFT. Your trading history, settlement record,
and escrow balances are all tied to it. If your NFT gets blocked (for commit
violations, for example), your ability to trade is affected -- but never your
ability to eventually exit: a blocked NFT is frozen only during the
enforcement grace window, and every state has an exit path.

This is by design. Reputation is meaningful when identity is persistent --
and persistence is meaningful when the identity can't be bought or sold.

## Leaving

Two layers of exit, both permissionless:

1. **Withdraw** -- drain your escrow as SUPRA (holding-period path, or the
   faster penalized "rushed" path) while keeping your membership.
2. **Burn-exit** -- retire the NFT itself with a single trustee-signed call.
   The **entire** escrow remainder converts to SUPRA at the fixed peg and goes
   to your payout address; the sponsor receives the time-decayed refund; the
   NFT is destroyed. Nothing is stranded, nothing needs permission.

If a member disappears for good, anyone can clean up after the abandonment
windows pass -- with all proceeds forced to the original trustee and sponsor,
never to the caller. See the playbook's
[exit section](/playbook#exiting) and
[janitor calls](/playbook#janitor) for the full rules.

No lock-ups beyond what you configured. No withdrawal fees. No "please
contact support." Your money, your choice, always.

[Pools →](/protocol/pools)
