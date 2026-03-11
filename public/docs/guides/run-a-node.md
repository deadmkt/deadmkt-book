# Run a Node
# !!! AVAILABLE SOON FOLLOW ON X  [@DeadMKT](https://x.com/DeadMKT) !!!

This guide takes you from zero to trading on the DeadMKT alpha testnet. You'll set up a node, get funded, mint tokens, and connect a strategy.

## 1. Install Docker

If you don't have Docker installed:

```bash
# Linux
curl -fsSL https://get.docker.com | sh

# macOS — download Docker Desktop from https://docker.com
```

Verify it's working:

```bash
docker --version
```

## 2. Get the node

Clone the repository and build the Docker image:

```bash
git clone https://github.com/deadmkt/deadmkt-node.git
cd deadmkt-node
docker build -t deadmkt-node .
```

This takes a few minutes on first build (it compiles 20+ Rust crates). Subsequent builds are cached.

## 3. Run the setup wizard

The wizard is interactive — it guides you through every step:

```bash
docker run -it -v deadmkt-data:/data deadmkt-node deadmkt-node setup
```

Here's what happens at each step:

### Network selection

```
Network: Testnet (mainnet not yet available)
```

Testnet is automatically selected. This connects to the Supra testnet.

### Beneficiary address

```
Enter beneficiary address (0x...):
```

This is where your profits and withdrawals go. It can be the same as your trustee address, but ideally it's a separate cold wallet for security. If you don't have a preference, you can use the same address the wizard generates for you.

### Keypair generation

```
Generating Ed25519 keypair...
Keystore saved (encrypted)
Trustee address: 0xabcdef1234567890...
```

The wizard generates your cryptographic identity — the key pair that signs your orders. It's encrypted and saved to disk. **Remember your keystore password.**

### Funding

```
Fund this address with SUPRA:
  0xabcdef1234567890...

Waiting for balance...
```

Open your browser and hit the testnet faucet:

```
https://rpc-testnet.supra.com/rpc/v1/wallet/faucet/YOUR_ADDRESS
```

Replace `YOUR_ADDRESS` with the address the wizard printed. The wizard detects the balance automatically and continues.

### NFT minting

```
Minting trustee NFT pair...
NFT minted! ID: 42
```

Your on-chain identity is created. The NFT links to your escrow, holds your bond, and tracks your participation.

### Token minting

```
Requesting mint: 330 EMM, 330 KAY, 330 TEE
Claiming mint...
Depositing to escrow...
```

The wizard mints equal amounts of all three Trippples tokens and deposits them into your escrow. You're funded and ready to trade.

### Configuration

```
Configuration saved. Setup complete!
```

A `config.json` file is created with your settings — network, contract addresses, markets, bootstrap peers, and strategy auth token.

## 4. Start the node

```bash
docker run -d \
  --name deadmkt-node \
  -p 9191:9191 \
  -p 9090:9090 \
  -v deadmkt-data:/data \
  --restart unless-stopped \
  deadmkt-node
```

Check the logs:

```bash
docker logs -f deadmkt-node
```

You should see:

```
  Keystore: unlocked (env)
  Trustee:  0xabcd...ef1234
  Chain:    connecting... block 12345678
  Escrow:   {"EMM": "330.0", "KAY": "330.0", "TEE": "330.0"}
  Strategy: ws://0.0.0.0:9090
  Tokens:   worker started
  Gossip:   listening on /ip4/0.0.0.0/tcp/9191
```

Your node is live. It's connected to the network, listening for batch cycles, and waiting for a strategy to connect.

## 5. Connect a strategy

The node exposes a WebSocket at `ws://localhost:9090`. Your strategy connects to it, authenticates, and starts trading.

Try the starter bot:

```bash
# Find your strategy auth token
docker exec deadmkt-node cat /data/config.json | grep strategy_auth_token
```

```bash
# Run the starter strategy (Python)
cd starter_bot
pip install websockets
python strategy.py --token YOUR_AUTH_TOKEN
```

The strategy will:
1. Connect to the node's WebSocket
2. Authenticate with the token
3. Receive `batch_start` events each cycle
4. Respond with `commit` actions containing buy/sell orders
5. Print trade results as they happen

## 6. Verify it's working

In the node logs you should start seeing:

```
[commit] 2 orders validated from strategy
[commit] published 2 commits
[settle-worker] submitted 0xab12...cd34 → 0xtx456...
```

That means your strategy is placing orders, the node is committing them to the network, and trades are settling on-chain.

## Stopping the node

```bash
docker stop deadmkt-node
```

Your data is persisted in the `deadmkt-data` volume. Restart anytime with `docker start deadmkt-node`.

## Ports

| Port | Purpose |
|------|---------|
| 9191 | Gossip P2P — how nodes find and talk to each other |
| 9090 | Strategy WebSocket — how your strategy connects to your node |

Both need to be accessible. Port 9191 must be reachable from the internet for other nodes to connect. Port 9090 only needs to be reachable from wherever your strategy runs (usually localhost).

## Troubleshooting

**"Connection refused" on 9090** — The node is still starting up or the strategy auth token is wrong. Check the logs.

**"No peers found"** — The bootstrap peers might not be running yet. This is expected on a new testnet. Your node will keep trying to connect.

**"All orders rejected during validation"** — Your strategy is sending orders that don't pass validation. Check that the pair names match (`EMM/KAY`, `KAY/TEE`, `TEE/EMM`), prices are reasonable, and quantities are above the minimum.

**"Keystore password required"** — Set the `DEADMKT_KEYSTORE_PASSWORD` environment variable in your Docker run command: `-e DEADMKT_KEYSTORE_PASSWORD=yourpassword`

## Next steps

- [Write a Strategy](guides/write-a-strategy.md) — build your own trading bot
- [Token Actions](guides/token-actions.md) — mint more tokens, burn, lock, unlock
- [WebSocket API](guides/websocket-api.md) — full reference for strategy developers
