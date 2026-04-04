# DeadMKT Node — Windows Installation Guide

This guide will walk you through every step of installing and running a DeadMKT trading node on Windows. No prior experience with terminals, Docker, or blockchain is required.

## Step 1: Open PowerShell

PowerShell is the application you will use to type commands.

1. Click the **Start** button (Windows icon in the bottom-left corner, or press the Windows key on your keyboard).
2. Type **PowerShell**.
3. Click **Windows PowerShell** from the search results. Do not choose "Windows PowerShell ISE" — use the regular one.
4. A blue window will appear with a blinking cursor. This is your terminal. Keep it open for the rest of this guide.

Every time you see a command in a grey box in this guide, you need to type it (or copy and paste it) into this PowerShell window and press **Enter** to run it.

**Tip**: To paste into PowerShell, right-click inside the window.

## Step 2: Enable WSL2

Docker on Windows requires WSL2 (Windows Subsystem for Linux). You need to enable it first.

1. In PowerShell, type:

```
wsl --install
```

2. If prompted, restart your computer. After restarting, open PowerShell again.

3. Verify WSL is installed:

```
wsl --version
```

You should see a version number. If you see an error, run `wsl --install` again.

**Note**: During WSL installation, you may be asked to create a Linux username and password. You can use any username and password you like — these are only for the Linux subsystem, not your Windows account.

## Step 3: Install Docker Desktop

Docker is the software that runs the DeadMKT node in an isolated container.

1. Open your web browser (Edge, Chrome, or Firefox).
2. Go to: **https://www.docker.com/products/docker-desktop/**
3. Click **Download for Windows**.
4. Run the downloaded installer (`Docker Desktop Installer.exe`).
5. During installation, make sure **Use WSL 2 instead of Hyper-V** is checked.
6. Click **OK** and wait for the installation to complete.
7. Click **Close and restart** if prompted.
8. After restarting, Docker Desktop will start automatically. You will see a whale icon in your system tray (bottom-right corner of your screen, near the clock). Wait until it stops animating — this means Docker is ready.
9. If Docker asks you to accept a service agreement, click **Accept**.

To verify Docker is working, open PowerShell and type:

```
docker --version
```

You should see something like `Docker version 28.x.x`. If you see an error, make sure Docker Desktop is running (check for the whale icon in your system tray).

## Step 4: Install Git

Git is the tool that downloads the DeadMKT code from the internet.

1. In PowerShell, type:

```
git --version
```

2. If Git is already installed, you will see a version number. Skip to Step 5.
3. If Git is not installed:
   - Open your browser and go to: **https://git-scm.com/download/win**
   - The download should start automatically. If not, click the download link.
   - Run the installer. Accept all the default settings by clicking **Next** through each screen, then click **Install**.
   - After installation, **close and re-open PowerShell** so it can find Git.
4. Verify Git is installed:

```
git --version
```

You should now see a version number.

## Step 5: Download the DeadMKT Node

1. In PowerShell, type the following commands one at a time, pressing Enter after each:

```
cd $HOME\Desktop
```

This moves you to your Desktop folder, so the downloaded files will be easy to find.

```
git clone https://github.com/deadmkt/deadmkt-node.git
```

This downloads the DeadMKT node code. You will see progress messages as files are downloaded.

```
cd deadmkt-node
```

This moves you into the downloaded folder.

## Step 6: Build the Docker Image

This step compiles the DeadMKT node software inside Docker. It takes 5-15 minutes the first time.

Run the build script:

```
.\build.bat
```

You will see many lines of output as the software compiles. This is normal. Wait until you see:

```
Tagged: deadmkt-node:0.1.9, deadmkt-node:latest
```

If the build fails, make sure Docker Desktop is running (whale icon in your system tray) and try again.

## Step 7: Install StarKey Wallet and Get Testnet Tokens

You need testnet SUPRA tokens to fund your node. These are free test tokens with no real value. You will get them using the StarKey browser wallet.

### Install StarKey Wallet

1. Open **Google Chrome** (StarKey is a Chrome extension — it does not work in Edge, Firefox, or other browsers).
2. Go to: **https://chromewebstore.google.com/detail/starkey-wallet-the-offici/hcjhpkgbmechpabifbggldplacolbkoh**
3. Click **Add to Chrome**, then **Add extension**.
4. You will see a key icon appear in your Chrome toolbar (top-right). Click it to open StarKey.
5. Click **Create a new wallet**.
6. Follow the on-screen instructions. You will be shown a **recovery phrase** — a list of words. **Write these words down on paper and keep them safe.** If you lose access to your wallet, this is the only way to recover it.
7. Set a strong password for the wallet.

### Get Testnet SUPRA

1. Click the StarKey icon in Chrome to open your wallet.
2. At the top of the wallet, find the network dropdown. It may say "Mainnet" by default. Click it and select **Testnet**.
3. Look for a **faucet** button or **Collect** option within the wallet.
4. Select **Supra** as the token.
5. Click **Collect** or **Claim** to receive free testnet tokens. You will receive 50 SUPRA.
6. Wait a few seconds for the tokens to appear in your wallet balance.

### Copy Your Wallet Address

1. In StarKey, find your wallet address at the top of the screen. It starts with `0x` followed by a long string of letters and numbers.
2. Click on it to copy it to your clipboard. You will need this address during setup as the **beneficiary address**.

You now have testnet SUPRA and a wallet address. Keep StarKey open — you will need to send tokens to your node during the next step.

## Step 8: Run the Setup Wizard

The setup wizard creates your node's identity and prepares it for trading. It is interactive — it will ask you questions and wait for your answers.

1. In PowerShell, type:

```
docker run -it -v deadmkt-data:/data deadmkt-node deadmkt-node setup
```

2. Press **Enter** when prompted to begin.

3. **Node role**: The wizard asks whether this is a trading node or a bootstrap/relay node. Select **1 (Trading node)** — this is the standard choice. Bootstrap mode is only for relay operators who want to support the network without trading.

4. **Beneficiary address**: Enter the Supra address that should receive your trading profits. If you are funding the node yourself, use your own Supra wallet address.

5. **Keystore password**: Choose a strong password (at least 12 characters, using letters, numbers, and symbols like `!@#$%`). This password protects your node's private key. **Write it down and keep it safe. If you lose this password, you lose access to your node's funds.**

6. **Wallet funding**: The wizard will display a trustee wallet address and wait for you to send SUPRA tokens to it. Go to your **StarKey Wallet** in Chrome, make sure you are on **Testnet**, and send at least **50 SUPRA** to the displayed address. To send: click **Send** in StarKey, paste the trustee address, enter the amount, and confirm. The wizard will detect the tokens automatically and continue.

7. **Bond Requirement**: The bond requirement is another dynamic made for players to treasure their nft... this feature is mostly for mainnet but we have kept it as a token gesture of 1 Supra in testnet that you can claim back in 30 days. You must accept this bond to proceed so press `y` and then "Enter"/"Return" to continue.

8. **Withdrawal configuration**: The wizard will ask about exit paths:
   - **Holding period**: How many days the beneficiary must wait before claiming all funds. Default is 90 days. For testing, you can use 1 day.
   - **Rushed withdrawal**: Whether the beneficiary can make partial withdrawals. Type `y` for yes.

9. **Token weighting**: The wizard asks which token you want more of — **EMM**, **KAY**, or **TEE** (default: TEE). This creates your initial trading position with a 40/30/30 split. You will trade the surplus for what you need.

10. Wait for the token minting process. The wizard mints EMM, KAY, and TEE tokens from 70% of your SUPRA and deposits them into escrow. The first mint requires an 8-minute hold period in testnet (8 days in mainnet, same for everyone, no shortcuts, the game begins) — the wizard handles this automatically.

When you see `Setup complete!`, your node is ready.

## Step 9: Start the Node

Replace `your_password_here` with the keystore password you chose during setup:

```
docker run -d --name deadmkt-node -v deadmkt-data:/data -e DEADMKT_KEYSTORE_PASSWORD='your_password_here' --restart unless-stopped deadmkt-node:0.1.9
```

**Important**: If your password contains special characters, wrap it in single quotes as shown above.

## Step 10: Verify It Is Running

Check the logs to make sure everything is working:

```
docker logs -f deadmkt-node
```

You should see output like:

```
deadmkt-node v0.1.9

  Network:  Testnet
  NFT ID:   1
  Markets:  ["EMM/KAY", "KAY/TEE", "TEE/EMM"]
  Gossip:   listening, peer_id=12D3KooW...
  Dialing:  peer1.testnet.deadmkt.com:9191

  Node ready. Entering poll loop...
```

If you see `Dialing: peer1.testnet.deadmkt.com:9191` and `Node ready`, your node is live and connected to the network.

Press **Control + C** to stop watching the logs. The node continues running in the background.

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

### Stop the node

```
docker stop deadmkt-node
```

### Restart the node

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

1. Write your strategy in Python. See `starter_bot\strategy.py` in the downloaded folder for an example.
2. Stop and remove the current container:

```
docker stop deadmkt-node
docker rm deadmkt-node
```

3. Start with your custom strategy mounted. Replace `C:\path\to\your\strategy.py` with the actual path to your file:

```
docker run -d --name deadmkt-node -v deadmkt-data:/data -v C:\path\to\your\strategy.py:/data/strategy.py -e DEADMKT_KEYSTORE_PASSWORD='your_password_here' deadmkt-node
```

For example, if your strategy is on the Desktop:

```
docker run -d --name deadmkt-node -v deadmkt-data:/data -v %USERPROFILE%\Desktop\strategy.py:/data/strategy.py -e DEADMKT_KEYSTORE_PASSWORD='your_password_here' deadmkt-node
```

## Troubleshooting

**"Cannot connect to the Docker daemon"**
Docker Desktop is not running. Click the Docker Desktop icon in your Start menu and wait for the whale to appear in the system tray.

**"docker: command not found"**
Close PowerShell and open a new one. If it still does not work, restart your computer. Docker adds itself to the system PATH during installation, but this requires a new terminal session.

**"WSL 2 installation is incomplete"**
Run `wsl --install` again in PowerShell, then restart your computer.

**"INSUFFICIENT_BALANCE_FOR_TRANSACTION_FEE" during setup**
Your node wallet ran out of gas. Send more SUPRA to the trustee address shown during setup, then re-run the setup command from Step 8.

**Node shows "InsufficientPeers" in logs**
The node cannot find other peers on the gossip network. Make sure your internet connection is working. Check that your firewall is not blocking outbound connections on port 9191. Try restarting the node: `docker restart deadmkt-node`.

**Node appears frozen (no new log lines)**
The blockchain RPC may be returning stale data. You will see a warning after 60 seconds. Restart the node: `docker restart deadmkt-node`.

**"Hold period active" for longer than 10 minutes during setup**
The token claim may be failing. Check that your wallet has at least 2 SUPRA remaining for gas. If the wizard times out after 20 minutes, re-run setup — it will resume from where it left off.

**Build is very slow**
The first build downloads the Rust compiler and all dependencies. This is normal and can take 10-20 minutes depending on your internet speed. Subsequent builds will be faster.

**Windows Defender or antivirus blocks Docker**
Some antivirus software interferes with Docker. You may need to add Docker Desktop to your antivirus exclusion list. Check your antivirus settings if Docker fails to start.

## Getting Help

- Documentation: [deadmkt.com/docs](https://deadmkt.com/docs/)
- GitHub: [github.com/deadmkt](https://github.com/deadmkt)
