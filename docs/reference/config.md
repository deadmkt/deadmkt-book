# Config Reference

Your node's configuration is stored in `config.json`, created by the setup wizard. Most fields are set automatically — you only need to edit them if you want to customise behaviour.

## Core Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `network` | string | `"testnet"` | Network to connect to |
| `rpc_urls` | array | Supra testnet RPC | Chain RPC endpoints |
| `nft_id` | number | (from wizard) | Your trustee NFT ID |
| `trustee_address` | string | (from wizard) | Your on-chain address |
| `beneficiary_address` | string | (from wizard) | Where profits/withdrawals go |
| `strategy_auth_token` | string | (random) | Token your strategy uses to authenticate |

## Markets

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `markets` | array | `["EMM/KAY", "KAY/TEE", "TEE/EMM"]` | Active trading pairs |
| `token_decimals` | object | `{"EMM": 5, "KAY": 5, "TEE": 5}` | Decimal places per token |

## Contracts

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `contracts.settlement` | string | (testnet addr) | Settlement module address |
| `contracts.escrow` | string | (testnet addr) | Escrow module address |
| `contracts.nft` | string | (testnet addr) | NFT module address |
| `contracts.pool_config` | string | (testnet addr) | Pool config module address |

All four point to the same deployer address on testnet. They're separate fields for future flexibility.

## Network

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `bootstrap_peers` | array | 5 testnet peers | Initial peers to connect to |
| `strategy_port` | number | `9090` | WebSocket port for strategy connections |
| `gossip_port` | number | `9191` | P2P gossip port |
| `chain_id` | number | `6` | Supra chain ID (6 = testnet, 8 = mainnet) |

## Gas

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `max_gas_amount` | number | `500000` | Maximum gas per transaction |
| `gas_unit_price` | number | `100` | Gas price per unit |

## Withdrawal

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `withdrawal_rules.holding_period_days` | number | `90` | Days before full withdrawal after deregistration |
| `withdrawal_rules.rushed_withdrawal_enabled` | bool | `true` | Allow rushed (partial) withdrawals |

## Environment Variables

These override config file values:

| Variable | Description |
|----------|-------------|
| `DEADMKT_KEYSTORE_PASSWORD` | Keystore decryption password (required for Docker/automated setups) |
| `DEADMKT_NO_STRATEGY` | Set to `1` to disable the built-in strategy and expose the WS port for an external agent |
| `DEADMKT_STRATEGY_PATH` | Path to a Python strategy file (default: `/data/strategy.py`) |
| `DEADMKT_CONTRACT_ADDR` | Override contract address |
| `DEADMKT_DIAL_PEERS` | Comma-separated peer addresses to connect to |
| `GOSSIP_PORT` | External gossip port for Docker NAT (advertised to peers for inbound connections) |
