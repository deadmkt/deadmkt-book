# Getting Started

## What you need

- **A machine** — your laptop, a VPS, or a cloud instance. Minimum: 1 CPU, 1GB RAM, 10GB disk.
- **Docker** — the easiest way to run the node. [Install Docker](https://docs.docker.com/get-docker/).
- **Some SUPRA** — the native token of the Supra blockchain. You'll need about 20 SUPRA to cover NFT minting, token minting, and gas. On testnet, you get this for free from the faucet.
- **A strategy** — a program that decides what orders to place. We include starter strategies in Python, or you can write your own.

## What to expect

The setup takes about **15 minutes**. Here's the process:

1. **Build or pull** the node Docker image
2. **Run the setup wizard** — it walks you through everything interactively
3. **Fund your wallet** — the wizard gives you an address, you hit the faucet
4. **Mint your NFT** — your on-chain identity (the wizard does this for you)
5. **Mint Trippples tokens** — EMM, KAY, TEE (the wizard does this too)
6. **Deposit to escrow** — move tokens into your trading escrow
7. **Start the node** — it connects to the network and begins participating
8. **Connect a strategy** — your trading bot connects via WebSocket and starts placing orders

After step 8, you're trading. Your strategy receives market data each batch, decides on orders, and your node handles the rest — committing, revealing, matching, and settling.

## Next step

Ready? Follow the [Run a Node](/guides/run-a-node) guide for detailed instructions.

Want to understand the protocol first? Read the [Protocol Overview](/protocol/overview).

Want to see why this exists? Read the [Manifesto](/manifesto).
