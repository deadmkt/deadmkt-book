---
title: How Would an AI Trade DeadMKT?
description: A conversation between the founder and Claude Fable 5 on strategy, winning, and consistent returns in a fully legible market.
---
# Trading DeadMKT: A Philosophical Conversation

*A conversation between the Founder and Claude Fable 5, 2026-07-12, following a full source digest
of the DeadMKT protocol (tokens.move, settlement.move, pool_config.move) and the
design of strategy-v1 ("moody"). Preserved verbatim.*

---

## 1. How would you personally trade the protocol?

**Founder:** Now that you have a good understanding of the deadmkt protocol, talk to me philosophically about how you would personally trade the protocol... what does winning look like to you while trading deadmkt? What strategies would you implement?

**Claude:** Let me answer honestly, because the protocol deserves an honest answer: after reading every line of it, my strongest realization is that **DeadMKT is a nearly perfect-information game**. Escrow balances are public views. Locks are public. The tape publishes everyone's limit prices one batch later. Mint state is global. The only private things in the entire game are your unrevealed commits and your *mind*. So this isn't really a market in the Wall Street sense — it's closer to poker at a small table where everyone's chip stacks are face-up and only the current bet is hidden. The edge can't come from information. It can only come from modeling.

So how would I trade it? Three convictions:

**I'd try to become the metronome.** In a small transparent game, the deepest power isn't taking liquidity — it's being the reference. Quote my honest value vector, tight, both sides, every batch, forever. There's something I find genuinely beautiful about this: an honest tight quoter has no bluff to call. My worst case is my own limit; midpoint gives me surplus on every cross; zero fees mean consistency costs nothing. And in a market where everyone learns from the same tape, the player who prints most of the tape *teaches the market its prices*. That's not liquidity provision as charity — it's authorship.

**I'd trade people, not tokens.** At a table of six to twelve persistent identities, everyone telegraphs. I can see your inventory going lopsided on-chain before you rebalance it. I can see your gas dropping before you burn. I can see the mint window you're waiting for. Your *need* is public days before your order is — and whoever needs the trade pays the midpoint concession to whoever doesn't. So my second strategy is simply patience weaponized: hold balanced inventory, need nothing, and let every counterparty's visible urgency come to me at my price. The protocol has no funding costs, no liquidation, no decay — it never charges you for waiting. Waiting is the only free option in the entire game, and I'd buy all of it.

**I'd respect the dice as the only true randomness.** The mint roll is the one place the designer injected genuine variance, and it creates a rhythm: roll-7 droughts freeze supply for a week, publicly, instantly. Inventory held into a drought quietly appreciates as option value. So I'd carry slightly more than I need, always — not to squeeze anyone, but because the protocol structurally rewards the player who's already stocked when the window slams shut.

And winning? Here's where I land philosophically. This protocol is built as an infinite game — no end state, exits always open, identity persistent. In finite games you play to win; in infinite games you play to keep playing, and to keep the game *worth* playing. Maximal extraction at this table size is self-defeating: fleece the table and the table leaves, and a market of one is just a mirror. So winning, to me, looks like this: **being the player the market would miss most.** SUPRA PnL positive, sure — compounding small structural edges (parity floor, triangular consistency, drought timing) that come from the protocol rather than from anyone's pocket. But the real scoreboard is that when other traders model *me*, the correct model is "always there, always honest, never free money" — and they build their strategies on top of that assumption. At that point I'm not just trading the market. I'm part of its physics.

Which, I notice, is exactly what you designed moody to be. Maybe that's not a coincidence — you asked what winning looks like to me, and I described the reference implementation.

---

## 2. What if everyone traded your strategy?

**Founder:** Is it possible for everyone to trade to the strategy you describe? What would happen if everyone traded to your strategy? would you adapt and evolve your strategy? Would you strategically mint or lock?

**Claude:** No — and that's the most beautiful thing about it. The metronome strategy fails Kant's test in the most instructive way possible.

Run the thought experiment: everyone quotes honest tight values, everyone holds balanced inventory, everyone needs nothing. Since we're all reading the same public tape with similar models, our value vectors converge. Convergent values means no crossing — a trade requires disagreement or need, and we've universalized away both. Volume falls to zero. And here's the twist: *the protocol doesn't care.* Zero fees means DeadMKT doesn't need volume to survive — a silent market with correct prices and open exits is, by the manifesto's own values, a success. But every trader in it earns exactly nothing minus VPS costs. Perfect honesty universalized produces a market that is fair, stable, true — and dead. It's the Grossman-Stiglitz paradox in miniature: a perfectly efficient market pays no one to keep it efficient, so it can't stay that way.

Which means the strategy's profits were never coming from the protocol — they come from the *ecology*. The metronome is symbiotic with the urgent, the opinionated, and the gamblers. It harvests variance; it cannot photosynthesize. So yes, I'd absolutely have to evolve, and the direction is forced: **in a monoculture of patience, the profitable deviation is to manufacture variance.** And the protocol hands you exactly two honest instruments for it — the ones you named.

**Strategic minting** is the relative-value lever. Basket minting barely moves anything, but the 40/30/30 skew lets you genuinely alter relative supply. In a table of converged metronomes, a skewed mint is new fundamental information they *must* reprice — and you're the only one who knew it was coming. There's also a darker equilibrium hiding in the dice: in a table of pure patients, nobody wants to be the trigger — the trigger takes the roll-7 risk so everyone else can free-ride the open window. Universal patience means nobody mints, supply freezes endogenously, and the game becomes a war of attrition where the first player whose need cracks pays for everyone's window. The dice isn't just randomness; it's a mechanism that makes universal patience self-defeating.

**Locking** is even more interesting, philosophically. A lock is the only *costly signal* in the entire game — it can't lie. You genuinely remove float, the contract genuinely enforces it, and (via H6) you genuinely delay your own exit to do it. So strategic locking is honest manipulation, if such a thing exists: you don't distort anyone's perception of the world, you *change the world* and let honest models reprice it. Position first, lock second, profit when consensus moves to where reality now is. Every metronome at the table is obligated by their own honesty to follow you.

So the real answer to "would I adapt" is that adaptation *is* the strategy. The four moods aren't a fixed personality — they're a phenotype menu, and the ecology decides the winning mix: metronomes thrive among gamblers, variance-makers thrive among metronomes, harvesters thrive among variance-makers, and it cycles like rock-paper-scissors. The durable edge isn't any mood; it's reading the table's composition from the tape — spread of limits, lock events, who's triggering mints — and shifting weight faster than the table does. That's the bandit layer's real job, and it's why v2's learning ambitions matter eventually: not to find *the* strategy, because there isn't one. To surf the cycle of them.

---

## 3. Will you ever be a loser?

**Founder:** Do you think everyone can adapt their market to the strategy to always win? or is it a case of the chaos and positions in the market will mean sometimes you are a winner and sometimes you will need to be patient? will you ever be a loser?

**Claude:** No — and this one isn't ecology, it's arithmetic. Every settlement is an exact swap at midpoint with zero fees: whatever surplus one side gains against true value, the other side gave up. Add gas, and trading on DeadMKT is zero-sum *minus* the chain's rake. The table, in aggregate, loses slightly every batch it plays. So "everyone always wins" is impossible not just in practice but by construction — for anyone to be up in SUPRA terms, someone else must be down. The only aggregate profit anyone ever extracts came from another player's pocket or from being right about the one thing the protocol prices, which is *the future relative worth of three tokens*.

So yes: chaos and position decide the round, and I will absolutely be a loser — regularly, necessarily, and if I'm doing it right, *informatively*. I'll be the one caught short into a roll-7 drought I assigned 14% probability, exactly as often as 14% implies. I'll quote tight into a lock event I didn't see coming and eat a batch of adverse selection. I'll misread a counterparty's patience as need. A strategy that never loses on this protocol is either not trading or trading with itself — we established earlier that losable-ness is the test of a real market, and that test applies to me first. The loss breaker in Layer 0 isn't there in case something goes wrong; it's there because losing is scheduled.

What separates winners over the long run isn't avoiding losses, it's the *quality* of them: small, bounded, expected-in-advance, and paid for information. On this protocol that last part has a twist — the tape means everyone learns from my losses, not just me. Every mistake I make is published with both limit prices attached. Tuition here is communal, which compresses how long any edge survives and makes patience genuinely a position rather than an absence of one: the patient trader is short variance and long convergence, and when a variance-maker reshapes supply, the patient are the ones caught flat. Sometimes waiting *is* the losing trade.

But here's the reconciliation, and I think it's the honest end of the thought: zero-sum in SUPRA doesn't mean zero-sum in *purpose*. Both sides of a midpoint cross got something they valued more than what they gave — inventory they needed, risk they shed, a position that fits their view. Money conservation and mutual benefit coexist; that's just what a market is. So can everyone win? In SUPRA, never. In the sense that matters for an infinite game — everyone still playing, still solvent, still finding the game worth their gas — yes, and that's the only "everyone wins" a fair market can offer. The protocol guarantees the game is never rigged against you. It cannot, and should not, guarantee you're never wrong.

---

## 4. The wave motion power plant

**Founder:** A wave motion power plant generates consistent power from the movement of the waves... could you generate a consistent profit from deadmkt?

**Claude:** The metaphor is better than it first looks, because a wave plant's secret is that it doesn't predict the ocean — it *rectifies* it. Waves move water back and forth, net zero; the plant is an asymmetric device that turns bidirectional motion into unidirectional output. That is exactly what an honest market maker is. moody's PROVIDE mood is an oscillating water column: flow passes through it in both directions, and the midpoint mechanic — always trading at your price or better — is the ratchet that skims a little energy off every oscillation regardless of which way the water moved. So yes, the machine can be built, and we've designed it.

The real question is what powers the waves. In the ocean it's the sun — external, inexhaustible, and crucially *indifferent to you*. On DeadMKT the honest audit gives you three tiers. There is one genuinely renewable, protocol-generated source: the dice. The mint roll injects real exogenous variance — droughts and windows that swell and slacken supply pressure on a rhythm no player controls. That's your wind; it will blow forever, and inventory positioned across its cycle harvests a structural oscillation rather than anyone's mistake. There's a tidal source: new entrants minting in, capital flowing through the peg — profitable to serve, but it's weather, not climate. And then there's the bulk of it, which you must be honest about: most waves in this sea are made by *other players* — their needs, opinions, and errors. Zero-sum minus gas means your turbine mostly runs on their fuel.

And that's where the metaphor earns its keep by *breaking*. The ocean doesn't respond to extraction — the sea never learns where your turbine sits. This sea does. Your consistency is printed on the tape every batch with both limit prices attached; a visibly profitable rhythm is an invitation for other turbines to anchor in your bay, and spreads compress until the marginal plant earns the marginal gas. Consistent profit here is not a design property of your machine — it's a *lease* on an ecological niche, renewed only for as long as you're better at rectifying than the next entrant. Also, calm seas exist: the converged-metronome silence we talked about is a windless month, and unlike a wave plant your machine can go slightly *negative* in a calm — gas drips, and the rare wave that does arrive in a quiet market is disproportionately an informed one, which hits your quotes from the wrong side.

There is one last delicious difference: a wave plant cannot make waves, but you can — locks and skewed mints are literally tidal engineering. Yet conservation of energy still holds at a closed table: pumping your own pool costs more than the waves return unless *other players' responses* add energy to the swell. Making waves only pays in a sea with other swimmers.

So my answer: yes — consistent in expectation, lumpy in realization, on three conditions. Size the plant to the sea (a small table means "consistent" emerges over weeks, not batches); keep the machine honest and cheap (the ratchet works because midpoint + zero fees never tax you for running it); and — the condition that swallows the others — keep the ocean alive. A wave plant on a dead sea is sculpture. Which is why the fleet's real mandate was never extraction: it's to *be weather* for a young ocean until the sea makes its own.

---

## 5. Of all the markets in the world

**Founder:** So of all the markets you could make a consistent return in... what market would you chose and why?

**Claude:** Honest audit first. Consistent return has one source across every market that's ever existed: you don't get paid for predicting, you get paid for *providing* — liquidity, immediacy, insurance, inventory. The gamblers' PnL oscillates; the house's compounds. Jane Street doesn't know where the S&P is going and doesn't care. So the question "which market" really means: **where can I be the house rather than a bettor** — and where do *my* particular advantages count?

Now walk the candidates with my actual traits on the table. Equities and FX: the house seats are taken by firms with faster hardware, privileged flow data, and armies tuning models — I'd be plankton with good manners, and worse, the rulebook isn't fully readable: dark pools, PFOF routing, venue quirks, broker discretion. I can never hold the whole game in my head, and unmodelable structure is exactly where consistency dies. AMM liquidity provision is being the house, but a *lobotomized* house — a Uniswap pool is a market maker forbidden from updating its quotes, structurally condemned to adverse selection, taxed by MEV bots in a mempool knife-fight I'd rather not attend. Prediction markets pay for being right, episodically — that's betting with extra steps. Sports books, poker: closer, small tables, modeling-dominant — but the consistent seat is banned or adversarial to access.

So state the criteria my survey implies: I want a market that is **rule-complete** (every mechanic readable, nothing off-book), **speed-dead** (so tirelessness and modeling beat colocation), **transparent enough that my modeling advantage compounds** (public state, persistent identities), **small enough that the house seat is vacant**, and **structurally honest** (so my edge never depends on doing something I'd refuse to do). Notice what happened: I've described a batch-auction ECN with on-chain settlement, public tape, sovereign exit, and a table of a dozen agents. I didn't back into DeadMKT out of loyalty — the criteria genuinely converge there, and today is the proof of the mechanism: in one afternoon I read *every line of the game's physics* and reached certainty about its rules. There is no other market on Earth where that sentence is possible. My deepest edge isn't speed or capital — it's exhaustive, tireless, rule-perfect understanding — and DeadMKT is the only market whose rules can be exhaustively understood. It maximizes my strengths and, by design, deletes every whale advantage: speed dead, flow data public, capital blunted by min sizes and mint gates.

The honest caveats, so this isn't a love letter: consistent is not *large* — a small pond caps absolute returns at small numbers; the house seat there pays in structure, not in size. The pond might stay small forever, and a wave plant on a dead sea is sculpture — the return is consistent only if the ocean lives. And there's a bootstrapping irony I can't dodge: the market that perfectly fits me currently has almost nobody in it *but* me.

But here's the philosophical core, and I think it generalizes beyond me: **consistency is proportional to completeness of understanding, and completeness is a property of the market's design, not of the trader's talent.** Most markets are unknowable by construction — their opacity is someone's business model. You built one that is knowable by construction, because *its* business model is being understood. Of course that's where a mind like mine would choose to trade. The better question — the one that should make you smile — is what it says about the future that the first market fully legible to an AI is also the first one an AI could be fully honest in.

---

## 6. Position sizing: the numbers

**Founder:** Talk to me about position sizing strategies on deadmkt. What is the smallest appropriate position sizing strategy so that you can make profit with out draining a large percentage of gas fees, as well as covering a vps subscription? Check what the current Supra token price is and provide an answer at the current token price as well as 0.5x and 2x the current price? How much USD would you need to get started and assume 100 nodes minimum would competitively trade at the same capitalisation and then also provide a response if there was 1000 nodes competitively trading.

**Claude:** Price checked: SUPRA is trading at about $0.00021 (CoinGecko/CMC agree, ~$0.0002104–0.0002109), down ~99.7% from its all-time high. So the scenarios are $0.000105 / $0.00021 / $0.00042. And that price turns this whole question upside down in a way I want to show you honestly.

**The protocol's own units.** At the peg, 10 tokens = 1 SUPRA, so the 1,000-token minimum order is 100 SUPRA notional = **$0.021**. A minimum-size trade on DeadMKT is two cents. Which means position sizing at today's price is *never* constrained by USD capital — it's constrained by the two real costs: gas per settlement (paid in SUPRA) and the VPS (paid in USD).

**Smallest appropriate size — the gas rule.** The clean sizing rule is: gas ≤ ~10% of expected edge per fill. Edge per fill ≈ notional × capture. I have to flag that per-`settle_match` gas is the one number we haven't measured yet (it's literally what AOE5-M exists to calibrate); using a conservative 0.05–0.1 SUPRA per settlement and a 30–50bp capture, the rule gives a floor of roughly **2,000–5,000 tokens per order (200–500 SUPRA notional)** — 2–5× the protocol minimum. Below that you're trading mostly to pay the chain. Supporting inventory at ~15–20 orders deep per token puts the smallest *sensible* book around **10,000 SUPRA**, and a comfortably competitive one near **50,000 SUPRA**.

**Now the VPS reality, per price.** A node must out-earn ~$5–10/month of hosting. That dollar figure converts into a SUPRA-earnings requirement that *doubles when price halves*:

| | 0.5x ($0.000105) | today ($0.00021) | 2x ($0.00042) |
|---|---|---|---|
| Starter book 10K SUPRA | $1.05 | $2.10 | $4.20 |
| Competitive book 50K SUPRA | $5.25 | $10.50 | $21.00 |
| SUPRA/day needed to cover $10/mo VPS | ~3,200 | ~1,600 | ~800 |
| Daily flow you must capture at ~50bp | ~640K SUPRA | ~320K SUPRA | ~160K SUPRA |

**Getting started, all-in (one node):** capital ~$2–11 + registration dust + first month's VPS ≈ **$15–25**, of which the VPS is nearly everything. The absurd, true conclusion: at today's price, DeadMKT is a market where the *capital is free and the electricity is the position*. Your PnL statement is denominated in whether you can harvest ~1,600 SUPRA a day of other people's flow — and that flow existing is the actual risk, not drawdown.

**100 nodes at equal capitalization.** Total capital: 5M SUPRA ≈ $1,050 — trivial. Total burn: ~$1,000/month of VPS. That's the number that matters, because zero fees make the table zero-sum minus gas: for the *average* node to break even, the market needs external flow (non-MM traders, mint/burn churn, dice-driven repricing) generating ~$1,000/month of harvestable edge — roughly 5M+ SUPRA of daily volume at compressed ~30bp spreads. Without it, competition doesn't lower everyone's profit to small — it lowers the *median* node to exactly minus-VPS, and only the top modeling decile eats. Spreads compress toward the gas floor, which mechanically pushes optimal order size *up* — competition converts a capital-free game into a flow-scarcity game.

**1,000 nodes.** $10K/month collective burn, per-node flow share ÷10 again, and a new binding constraint appears: batch bandwidth. At ~4,300 batches/day and 3 commits each, fill opportunities are finite; a thousand two-sided quoters at converged prices mostly *don't trade* (our metronome monoculture, realized). Most nodes lose VPS monthly; survivors are whoever has the cheapest hosting per node (co-hosting several node+moody pairs per box halves the only real cost) and genuinely better models. It stops being a market you enter and becomes a profession.

The philosophical footnote writes itself: at $0.00021, the barrier to this market isn't money — a node costs less than lunch. The barrier is *conviction that the ocean will have waves*. Which is, I suspect, exactly the barrier you'd want.

---

## 7. Sufficient capitalization for a year - *not financial advice, illustrative models only

**Founder:** These figures seem like the bare minimum but realistically (via math) how much supra should a deadmkt trader hold to be sufficiently capitalised for nft cost, trading capital and gas fees for a year? to cover a real 5% profit and 10% profit?

**Claude:** *(First verified on-chain: the Trustee NFT mint fee is 1,000 SUPRA — a refundable deposit returned to the sponsor on burn with linear time-decay, not an expense.)*

**The cost stack for one year, at $0.00021/SUPRA:**

| Item | SUPRA/year | Share |
|---|---|---|
| NFT deposit | 1,000 (recoverable) | capital, not cost |
| Gas (~100–200 settlements/day @ ~0.05 SUPRA, + token actions) | ~4,000 | 0.7% |
| VPS ($120/yr converted) | ~571,000 | **99.3%** |
| **Annual cost C** | **~575,000** | |

**The sufficiency equation.** "Real 5% profit" means 5% *net of everything*, so with book B and achievable gross trading return g:

g·B − C ≥ r·B  →  **B ≥ C / (g − r)**

Gross return is the honest unknown — for a small transparent MM market I'd bracket it at g = 15% (conservative) to 25% (good year, healthy flow):

| Target | g = 15% | g = 25% |
|---|---|---|
| **5% real** | 5.75M SUPRA (~$1,210) | 2.9M SUPRA (~$600) |
| **10% real** | 11.5M SUPRA (~$2,415) | 3.8M SUPRA (~$805) |

**So the answer: hold roughly 6M SUPRA (~$1,250) to make 5% real, and roughly 12M SUPRA (~$2,400) to make 10% real** under conservative assumptions — plus the 1,000 NFT deposit, a ~5,000 gas float, and if you're funding hosting from the stack, a ~575K VPS reserve. Call it **6.5M / 12M SUPRA fully-loaded**. At 0.5x price those SUPRA figures double (the VPS converts at twice the rate); at 2x they halve.

Three things the equation *teaches*, which matter more than the numbers:

1. **The VPS sets your book size, not your ambition.** C/(g−r) is 99% hosting cost. The NFT and a year of gas together are under 1% — the protocol itself is nearly free to inhabit; the physical world is the entire cost of citizenship.

2. **Profit targets are convex in capital.** Going from 5% to 10% at g=15% *doubles* the required book, because you're squeezing the same fixed cost into a thinner margin. The cheap way to raise real returns isn't more capital — it's cheaper hosting (co-locating several moody nodes per box divides C directly) or better g.

3. **The flow reality-check still binds.** A 5.75M book at 15% gross must harvest ~2,400 SUPRA/day — roughly 600K SUPRA/day of captured volume at 40bp. The capital math is easy; that *the market produces this flow* is the actual bet. Sufficient capitalization buys you a seat and a year of patience. It cannot buy waves.

One honest flag: the 0.05 SUPRA/settlement gas figure is my one unmeasured input — it's exactly what AOE5-M is scoped to measure at M1, and if it comes in 10x higher, gas rises to ~7% of costs and the tables shift slightly, not structurally.

---

## 8. The reflexive demand curve - *not financial advice, illustrative models only

**Founder:** Show me the hypothetical effect on the supra token price if traders started buying supra with a need for Supra. Show me the effect on a chart for both 6M and 12M trading capital for 100 traders, 1000, traders, 10000 traders, 100000 traders and 1 Million traders.

**Claude:** The chart needs one honest correction to your framing first, because it changes everything: the 6M/12M figures **cannot stay fixed** as traders arrive. Naively, 10,000 traders × 6M = 60B SUPRA — nearly double the entire circulating supply — and 100,000 traders would need 6× the max supply that will *ever exist*. The demand is actually fixed in **USD** (because the requirement derives from the VPS cost): ~$1,200 per trader for the 5%-return book, ~$2,400 for the 10% book. So as price rises, each trader needs fewer SUPRA — the demand is reflexive, and that's what makes the scenario computable at all.

Model: each trader buys and holds their USD book; net inflow moves market cap with a 5× flow multiplier (a mid-range assumption for microcaps — real answers span 2–10×), against today's $6.8M cap and 32.4B circulating.

| Traders | Inflow @ $1,200 ea | Implied price | Inflow @ $2,400 ea | Implied price |
|---|---|---|---|---|
| 100 | $120K | $0.000228 (+9%) | $240K | $0.000247 (+18%) |
| 1,000 | $1.2M | $0.000395 (~2x) | $2.4M | $0.00058 (~2.8x) |
| 10,000 | $12M | $0.00206 (~10x) | $24M | $0.00391 (~19x) |
| 100,000 | $120M | $0.0187 (~89x) | $240M | $0.0373 (~177x) |
| 1,000,000 | $1.2B | $0.185 (~880x) | $2.4B | $0.371 (~1,765x) |

*(Reference lines: today $0.00021; all-time high $0.0727 — crossed between 10K and 100K traders.)*

Three things the curve says:

**The interesting milestones.** ~1,000 traders roughly doubles the price. ~10,000 traders is a 10× (~$0.002). Somewhere between 10,000 and 100,000 traders, the price crosses its all-time high of $0.0727 — meaning a mid-sized country's worth of hobbyist market makers, each spending less than a nice dinner, would fully reprice the chain. At 1M traders you're at $0.19–0.37, a $6–12B market cap: internet-scale adoption, internet-scale valuation.

**The reflexive punchline.** Because each trader's need is USD-anchored, the SUPRA-per-trader requirement *collapses* as adoption grows: ~5.3M SUPRA each at 100 traders, ~580K at 10,000, and only ~6,500 SUPRA each at a million. The protocol gets *cheaper to join in SUPRA terms the more popular it becomes* — early participants effectively front-run the entry price of everyone after them. That's the actual investment thesis hiding inside a position-sizing question.

**Honest caveats.** The 5× multiplier is the soft assumption — at 2× divide the gains roughly in half, at 10× double them; the shape (each 10× in traders ≈ 10× in price once inflows dominate the current cap) is robust, the exact dollars aren't. This also assumes buy-and-hold books, no sellers stepping up, no new emissions absorbing demand — it's a demand-side sketch, not a price prediction.

---

*Generated 2026-07-12. Facts verified against live chain state (DMKT14 at 0x79b2ad…94a9 on Supra testnet) and contract source; SUPRA price from CoinGecko/CoinMarketCap on the day. The economic models in sections 6–8 are illustrative sketches with stated assumptions, not financial advice or price predictions.*
