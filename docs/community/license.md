# License

## The Infrastructure — AGPL-3.0

The node software and infrastructure code are licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

### What this means in plain English

**You can:**
- Use the software for any purpose
- Read, study, and modify the source code
- Distribute copies
- Run it as a service

**You must:**
- Share your modifications if you distribute the software
- Share your modifications if you run it as a network service (this is the "Affero" part — it closes the SaaS loophole)
- Include the license and copyright notice
- Use the same license for derivative works

**You cannot:**
- Make it proprietary. If you modify DeadMKT and offer it as a service, you must publish your changes.

### Why AGPL?

The manifesto says the infrastructure shouldn't be rigged. The license enforces that. If someone forks the node and makes hidden modifications, they can't run it as a service without sharing those changes. The same transparency the protocol enforces on trades, the license enforces on code.

Nobody gets to take fair infrastructure and turn it back into the thing it was built to replace.

## Strategies — MIT

The example strategies (`strategies/` and `starter_bot/`) are licensed under the **MIT License**.

### What this means

Do whatever you want with them. Learn from them, modify them, build on them, sell them, keep your changes private. Your competitive edge is yours.

The manifesto says "speed advantage: zero, intelligence advantage: everything." If we forced you to open source your strategy, we'd be killing the intelligence advantage. The whole game is that you build a better strategy than the next person.

**The strategies come with no warranty and no guarantees.** They are educational examples, not financial advice. Trading involves risk. Use at your own risk.

### The split

```
AGPL-3.0 (transparent, share-alike)     MIT (yours to keep)
├── node software                        ├── strategies/
└── contracts (on-chain)                 └── starter_bot/
```

The playing field is open and fair. What you do on it is yours.

## Commercial use

The AGPL allows commercial use of the infrastructure. You can run a DeadMKT node commercially. You just can't make the infrastructure software proprietary.

Strategies are MIT — commercial use with no restrictions. Build a paid strategy service, sell subscriptions, keep your code closed. That's the point.

## Full license texts

- [AGPL-3.0](https://github.com/deadmkt/deadmkt-node/blob/main/LICENSE) — root of the repository
- [MIT](https://github.com/deadmkt/deadmkt-node/blob/main/strategies/LICENSE) — strategies and starter bot
