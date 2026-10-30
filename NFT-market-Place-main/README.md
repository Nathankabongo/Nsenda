# 🌌 Aetheria NFT Marketplace

A production-grade, multi-chain decentralized NFT marketplace built with Solidity `0.8.24`, OpenZeppelin v5, Next.js 14 App Router, RainbowKit, and Wagmi v2.

---

## 🏗️ Architecture & Core Components

```
NFTMarketPlace/
├── packages/
│   └── contracts/                 # Solidity smart contracts, Hardhat test suite & deploy scripts
│       ├── contracts/
│       │   ├── AetherNFT.sol      # ERC-721 token with ERC-2981 royalty standard
│       │   └── AetherMarketplace.sol # Fixed-price atomic marketplace
│       ├── test/                  # 100% passing automated test suite (13 test cases)
│       ├── scripts/deploy.ts      # Multi-chain deployment and demo seeder
│       └── hardhat.config.ts      # Networks: Hardhat Local, Sepolia, Polygon Amoy, Base Sepolia
└── apps/
    └── web/                       # Next.js 14 frontend application
        ├── app/
        │   ├── page.tsx           # Explore / Marketplace feed with search & filters
        │   ├── create/page.tsx    # Minting Studio (drag-drop, metadata, royalty slider)
        │   ├── my-nfts/page.tsx   # Portfolio dashboard (list, cancel, view owned NFTs)
        │   └── nft/[id]/page.tsx  # Detailed NFT view with provenance & atomic purchase
        ├── components/            # Glassmorphic cyber UI components & modals
        └── lib/                   # Wagmi config, contract ABIs, and utilities
```

---

## ⚡ Key Architectural Decisions & Trade-Offs

### 1. Escrow-Free Atomic Swaps vs. Escrow Locking
* **Decision**: We implemented an **escrow-free approval-based model** (`safeTransferFrom`).
* **Why**:
  - In a traditional escrow model, listing an NFT requires transferring it into the marketplace contract, which costs extra gas, locks the asset, and exposes the user's NFT to marketplace smart contract custody risks.
  - With our atomic escrow-free model, the seller keeps the NFT safely in their wallet and only grants approval. When a buyer executes `buyItem`, the funds and NFT are atomically exchanged in a single non-reentrant transaction.
  - Canceling or updating the price does not require moving the NFT on-chain.

### 2. On-Chain Royalties: EIP-2981 Standard
* **Decision**: Full implementation of `ERC2981` in `AetherNFT.sol` and dynamic query in `AetherMarketplace.sol`.
* **Why**:
  - Ensures creator royalties (up to 10%) are automatically calculated and transferred directly to the creator's wallet on every secondary sale.
  - Works natively with any external marketplace honoring the EIP-2981 standard (OpenSea, Blur, Rarible).

### 3. Multi-Chain Testnet Support
* **Configured Networks**:
  - **Ethereum Sepolia** (Chain ID: `11155111`)
  - **Polygon Amoy** (Chain ID: `80002`)
  - **Base Sepolia** (Chain ID: `84532`)
  - **Local Hardhat Network** (Chain ID: `31337`)

---

## 🚀 Quick Start & How to Run

### 1. Run Smart Contract Tests
```bash
cd packages/contracts
npm test
```
*Result*: 13 passing unit tests verifying minting, royalties, listings, pricing updates, cancellations, and atomic purchases.

### 2. Start Local Node & Deploy Contracts (Optional)
```bash
# Terminal 1: Start local node
cd packages/contracts
npx hardhat node

# Terminal 2: Deploy contracts and seed demo NFTs
npx hardhat run scripts/deploy.ts --network localhost
```

### 3. Deploy to Testnets
```bash
# Set your PRIVATE_KEY in packages/contracts/.env, then:
npx hardhat run scripts/deploy.ts --network sepolia
npx hardhat run scripts/deploy.ts --network polygonAmoy
npx hardhat run scripts/deploy.ts --network baseSepolia
```

### 4. Start Next.js Frontend
```bash
cd apps/web
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Smart Contract Security & Best Practices
- **Reentrancy Protection**: `ReentrancyGuard` with Checks-Effects-Interactions pattern (listings deactivated before external transfers).
- **Safe Transfers**: Custom safe ETH transfer handlers guarding against gas griefing and reverts.
- **Pausable**: Emergency circuit breakers for both NFT minting and Marketplace trading.
- **Royalty Cap**: Strict maximum royalty cap (10%) preventing malicious royalty contracts from draining buyer funds.
