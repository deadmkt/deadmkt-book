# DeadMKT Node — Linux Installation Guide

This guide will walk you through every step of installing and running a DeadMKT trading node on Linux. No prior experience with Docker or blockchain is required. This guide covers Ubuntu and Debian-based distributions. The commands are similar for other distributions but the package manager may differ.

## Step 1: Open a Terminal

The terminal is where you will type commands to install and run the node.

**Ubuntu Desktop**: Press **Ctrl + Alt + T** to open a terminal window.

**Other desktops**: Look for "Terminal" or "Console" in your applications menu.

**Server (no desktop)**: You are already in a terminal after logging in via SSH.

Every time you see a command in a grey box in this guide, type it (or copy and paste it) into the terminal and press **Enter** to run it.

## Step 2: Update Your System

Before installing anything, update your package lists to make sure you get the latest versions:

```
sudo apt update && sudo apt upgrade -y
```

You may be asked for your password. Type it and press Enter. The password will not appear on screen as you type — this is normal.

## Step 3: Install Docker

Docker is the software that runs the DeadMKT node in an isolated container.

1. Install prerequisites:

```
sudo apt install -y ca-certificates curl gnupg
```

2. Add Docker's official GPG key:

```
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

3. Add the Docker repository:

```
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

4. Install Docker:

```
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

5. Add your user to the Docker group so you can run Docker without `sudo`:

```
sudo usermod -aG docker $USER
```

6. **Log out and log back in** for the group change to take effect. On a desktop, log out of your session. On a server, close your SSH connection and reconnect.

7. Verify Docker is working:

```
docker --version
```

You should see something like `Docker version 28.x.x`.

8. Test that Docker runs without sudo:

```
docker run hello-world
```

You should see a "Hello from Docker!" message. If you get a permission error, make sure you logged out and back in after Step 5.

## Step 4: Install Git

Git is the tool that downloads the DeadMKT code from the internet.

1. Check if Git is already installed:

```
git --version
```

2. If you see a version number, skip to Step 5. Otherwise, install it:

```
sudo apt install -y git
```

3. Verify it installed:

```
git --version
```

## Step 5: Download the DeadMKT Node

1. Move to your home directory:

```
cd ~
```

2. Download the code:

```
git clone https://github.com/deadmkt/deadmkt-node.git
```

You will see progress messages as files are downloaded.

3. Move into the downloaded folder:

```
cd deadmkt-node
```

## Step 6: Build the Docker Image

This step compiles the DeadMKT node software inside Docker. It takes 5-15 minutes the first time.

1. Make the build script executable:

```
chmod +x build.sh
```

2. Run the build:

```
./build.sh
```

You will see many lines of output as the software compiles. This is normal. Wait until you see:

```
Tagged: deadmkt-node:0.1.4, deadmkt-node:latest
```

If the build fails, make sure Docker is running (`sudo systemctl status docker`) and try again.

## Step 7: Get Testnet SUPRA Tokens

You need testnet SUPRA tokens to fund your node. These are free test tokens with no real value. The easiest way is using the StarKey browser wallet.

### Desktop Linux (with a browser)

1. Open **Google Chrome** or **Chromium**.
2. Go to: **https://chromewebstore.google.com/detail/starkey-wallet-the-offici/hcjhpkgbmechpabifbggldplacolbkoh**
3. Click **Add to Chrome**, then **Add extension**.
4. Click the StarKey key icon in your toolbar and click **Create a new wallet**.
5. Follow the on-screen instructions. You will be shown a **recovery phrase** — a list of words. **Write these words down on paper and keep them safe.**
6. Set a strong password for the wallet.
7. In StarKey, find the network dropdown at the top. Click it and select **Testnet**.
8. Look for a **faucet** button or **Collect** option. Select **Supra** and click **Collect** to receive 50 free testnet SUPRA.
9. Copy your wallet address (starts with `0x`) — you will need it as your **beneficiary address** during setup.

### Headless Server (no browser)

If you are on a VPS with no desktop, you have two options:

**Option A**: Install StarKey on your local machine (laptop or desktop) using the steps above. Get testnet SUPRA there, then send tokens to the trustee address when the setup wizard displays it.

**Option B**: Use the Supra CLI via Docker to create a wallet and request faucet tokens:

```
docker run -it --rm asia-docker.pkg.dev/supra-devnet-misc/supra-testnet/validator-node:v6.4.0 /bin/bash -c "supra profile generate --name temp --rpc-url https://rpc-testnet.supra.com --faucet-url https://rpc-testnet.supra.com && supra move account fund-with-faucet --rpc-url https://rpc-testnet.supra.com"
```

Either way, you will need approximately **10 SUPRA** to fund a node. Keep your wallet or CLI ready — you will need to send tokens during the next step.

## Step 8: Run the Setup Wizard

The setup wizard creates your node's identity and prepares it for trading. It is interactive — it will ask you questions and wait for your answers.

1. Run the wizard:

```
docker run -it -v deadmkt-data:/data deadmkt-node deadmkt-node setup
```

2. Press **Enter** when prompted to begin.

3. **Beneficiary address**: Enter the Supra address that should receive your trading profits. If you are funding the node yourself, use your own Supra wallet address.

4. **Keystore password**: Choose a strong password (at least 12 characters, using letters, numbers, and symbols like `!@#$%`). This password protects your node's private key. **Write it down and keep it safe. If you lose this password, you lose access to your node's funds.**

5. **Wallet funding**: The wizard will display a trustee wallet address and wait for you to send SUPRA tokens to it. Go to your **StarKey Wallet** in Chrome (or use the Supra CLI on a headless server), make sure you are on **Testnet**, and send at least **10 SUPRA** to the displayed address. To send from StarKey: click **Send**, paste the trustee address, enter the amount, and confirm. The wizard will detect the tokens automatically and continue.

6. **Withdrawal configuration**: The wizard will ask about exit paths:
   - **Holding period**: How many days the beneficiary must wait before claiming all funds. Default is 90 days. For testing, you can use 1 day.
   - **Rushed withdrawal**: Whether the beneficiary can make partial withdrawals. Type `y` for yes.

7. **Profit threshold**: The percentage above base capital before profits are swept to the beneficiary. Default is 20%. Press Enter to accept the default.

8. Wait for the token minting process. The wizard mints EMM, KAY, and TEE tokens from 70% of your SUPRA and deposits them into escrow. The first mint requires an 8-minute hold period — the wizard handles this automatically.

When you see `Setup complete!`, your node is ready.

## Step 9: Start the Node

Replace `your_password_here` with the keystore password you chose during setup:

```
docker run -d --name deadmkt-node \
  -v deadmkt-data:/data \
  -e DEADMKT_KEYSTORE_PASSWORD='your_password_here' \
  --restart unless-stopped \
  deadmkt-node
```

The `--restart unless-stopped` flag means the node will automatically restart if it crashes or if the server reboots. This is recommended for servers that run 24/7.

## Step 10: Verify It Is Running

Check the logs to make sure everything is working:

```
docker logs -f deadmkt-node
```

You should see output like:

```
deadmkt-node v0.1.4

  Network:  Testnet
  NFT ID:   1
  Markets:  ["EMM/KAY", "KAY/TEE", "TEE/EMM"]
  Gossip:   listening, peer_id=12D3KooW...
  Dialing:  peer1.testnet.deadmkt.com:9191

  Node ready. Entering poll loop...
```

If you see `Dialing: peer1.testnet.deadmkt.com:9191` and `Node ready`, your node is live and connected to the network.

Press **Ctrl + C** to stop watching the logs. The node continues running in the background.

## Running as a Bootstrap Peer

If you want to run a gossip relay that other nodes connect to (instead of a trading node), use peer-only mode. This is useful for VPS operators who want to support the network without trading.

```
docker run -d --name deadmkt-peer \
  -v deadmkt-data:/data \
  -p 9191:9191 \
  -e DEADMKT_KEYSTORE_PASSWORD='your_password_here' \
  -e DEADMKT_NO_STRATEGY=1 \
  --restart unless-stopped \
  deadmkt-node
```

Port 9191 must be open in your firewall for other nodes to connect:

```
sudo ufw allow 9191/tcp
```

## Everyday Operations

### Check if your node is running

```
docker ps
```

Look for `deadmkt-node` in the list.

### View recent logs

```
docker logs --tail 20 deadmkt-node
```

### Follow logs in real time

```
docker logs -f deadmkt-node
```

Press Ctrl + C to stop following.

### Stop the node

```
docker stop deadmkt-node
```

### Restart the node

```
docker restart deadmkt-node
```

### Start a stopped node

```
docker start deadmkt-node
```

### Completely remove and start fresh

This deletes all node data including your keys and escrowed tokens:

```
docker stop deadmkt-node
docker rm deadmkt-node
docker volume rm deadmkt-data
```

Then start again from Step 8.

## Using a Custom Strategy

Your node ships with a starter bot that makes basic trades. To replace it with your own strategy:

1. Write your strategy in Python. See `starter_bot/strategy.py` in the downloaded folder for an example.
2. Stop and remove the current container:

```
docker stop deadmkt-node
docker rm deadmkt-node
```

3. Start with your custom strategy mounted. Replace `/path/to/your/strategy.py` with the actual path to your file:

```
docker run -d --name deadmkt-node \
  -v deadmkt-data:/data \
  -v /path/to/your/strategy.py:/data/strategy.py \
  -e DEADMKT_KEYSTORE_PASSWORD='your_password_here' \
  --restart unless-stopped \
  deadmkt-node
```

For example, if your strategy is in your home directory:

```
-v ~/strategy.py:/data/strategy.py
```

## Updating to a New Version

When a new version of the node is released:

```
cd ~/deadmkt-node
git pull
./build.sh
docker stop deadmkt-node
docker rm deadmkt-node
docker run -d --name deadmkt-node \
  -v deadmkt-data:/data \
  -e DEADMKT_KEYSTORE_PASSWORD='your_password_here' \
  --restart unless-stopped \
  deadmkt-node
```

Your data volume is preserved. The node resumes with the new binary and your existing keys and escrow.

## Firewall Configuration

If you are running on a server, you may need to open ports:

```
# Only needed for bootstrap peers (other nodes connect to you)
sudo ufw allow 9191/tcp

# Only needed if connecting a strategy from outside the container
sudo ufw allow 9090/tcp
```

Most trading nodes do not need any ports opened. They make outbound connections only.

## Running on a VPS

For 24/7 operation on a VPS (DigitalOcean, Vultr, Hetzner, etc.):

1. Choose a VPS with at least 1 GB RAM and 20 GB disk.
2. SSH into your server:

```
ssh root@your-server-ip
```

3. Follow this guide from Step 2 onwards.
4. Use `--restart unless-stopped` when starting the node (included in Step 9 above).
5. The node will survive server reboots automatically.

To check on your node after logging back in:

```
docker logs --tail 20 deadmkt-node
```

## Troubleshooting

**"Permission denied" when running Docker commands**
Run `sudo usermod -aG docker $USER`, then log out and log back in.

**"Cannot connect to the Docker daemon"**
Docker may not be running. Start it:

```
sudo systemctl start docker
```

To make Docker start automatically on boot:

```
sudo systemctl enable docker
```

**"INSUFFICIENT_BALANCE_FOR_TRANSACTION_FEE" during setup**
Your node wallet ran out of gas. Send more SUPRA to the trustee address shown during setup, then re-run the setup command from Step 8.

**Node shows "InsufficientPeers" in logs**
The node cannot find other peers on the gossip network. Make sure your internet connection is working and outbound TCP port 9191 is not blocked by your firewall.

**Node appears frozen (no new log lines)**
The blockchain RPC may be returning stale data. You will see a warning after 60 seconds. Restart the node: `docker restart deadmkt-node`.

**"Hold period active" for longer than 10 minutes during setup**
The token claim may be failing. Check that your wallet has at least 2 SUPRA remaining for gas. If the wizard times out after 20 minutes, re-run setup — it will resume from where it left off.

**Build fails with "no space left on device"**
Docker images use disk space. Clean up old images:

```
docker system prune -a
```

This removes all unused images and containers. Then try the build again.

**"E: Unable to locate package docker-ce"**
You may be on a non-Ubuntu distribution. Check Docker's installation docs for your specific distribution: https://docs.docker.com/engine/install/

## Getting Help

- Documentation: [deadmkt.com/docs](https://deadmkt.com/docs/)
- GitHub: [github.com/deadmkt](https://github.com/deadmkt)
