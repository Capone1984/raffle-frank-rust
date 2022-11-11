# Eternal Underworld | NFT Raffle Solana

## Requirements

### Payment method
- SOL
- $REAP (SPL token)

### Reward Type
- Reveive NFT
- Whitelist (Max value is 50)
- Tickets (Max value is 2000)

## Development

```bash
npm run dev
# or
yarn dev
```
### Install


```bash
npm install
# or
yarn install
```
### Problem Solved
- Pending transaction confirmed
``` javascript
- await solConnection.confirmTransaction(tx, "confirmed");

+ await solConnection.confirmTransaction(tx, "finalized");
```