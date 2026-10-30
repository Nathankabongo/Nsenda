# SENDA — ARCHITECTURE & WORKFLOWS SMART CONTRACTS
**Spécifications des Contrats Solidity 0.8.24, Standards ERC et Sécurité On-Chain**  
**Responsable Pôle :** Losongo Kingombe Victor *(Smart Contracts & Architecture Blockchain)*  
**En coordination avec :** Kabongo Mukola Nathan *(Intégration Frontend Wagmi/Viem)*  
**Projet :** SENDA — Marketplace décentralisée de l'artisanat congolais  
**Version :** 1.0 — Référence Implémentation Hardhat  
**Réseau cible :** Polygon Amoy Testnet (Chain ID: `80002`)  

---

## 1. Vue d'Ensemble des Trois Smart Contracts

L'écosystème on-chain de SENDA repose sur trois contrats autonomes et complémentaires :

```
                                    ┌──────────────────────┐
                                    │ SendaTestToken (STT) │
                                    │    Standard ERC-20   │
                                    └──────────┬───────────┘
                                               │
                           1. approve(Escrow)  │  2. transferFrom(buyer -> Escrow)
                                               ▼
┌─────────────────────────┐         ┌──────────────────────┐
│       SendaNFT          │         │     SendaEscrow      │
│    ERC-721 + ERC-2981   │         │   Séquestre Physique │
├─────────────────────────┤         ├──────────────────────┤
│ • mintArtwork(...)      │         │ • depositPayment     │
│ • royaltyInfo(id, price)│         │ • confirmAndRelease  │
│ • tokenURI(tokenId)     │         │ • refundBuyer        │
└─────────────────────────┘         └──────────┬───────────┘
                                               │
                                               │  3. transfer(Escrow -> seller)
                                               ▼
                                    ┌──────────────────────┐
                                    │ Portefeuille Artisan │
                                    └──────────────────────┘
```

---

## 2. Spécification Détaillée de `SendaNFT.sol`

### 2.1. Responsabilités & Standards
* **Standards :** ERC-721 (`ERC721URIStorage`), ERC-2981 (`ERC2981`), `Ownable`, `Pausable`.
* **Rôle :** Création du certificat numérique d'enregistrement de l'œuvre artisanale congolaise et mémorisation du droit de suite pour l'artisan créateur.
* **Redevance (ERC-2981) :** Configurée individuellement par œuvre lors de la frappe (`mintArtwork`), entre 500 et 1000 points de base (5.0 % à 10.0 %).

### 2.2. Interface Publique & Signatures
```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface ISendaNFT {
    // Événements
    event ArtworkMinted(
        uint256 indexed tokenId,
        address indexed artisan,
        string tokenURI,
        uint96 royaltyFeeBps
    );

    // Erreurs personnalisées
    error InvalidArtisanAddress();
    error EmptyTokenURI();
    error RoyaltyFeeTooHigh(uint96 provided, uint96 maxAllowed);

    // Fonctions d'écriture
    function mintArtwork(
        address artisanRecipient,
        string calldata metadataURI,
        uint96 royaltyFeeBps
    ) external returns (uint256 tokenId);

    function pause() external;
    function unpause() external;

    // Fonctions de lecture (ERC-2981 & ERC-721)
    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view returns (address receiver, uint256 royaltyAmount);

    function tokenURI(uint256 tokenId) external view returns (string memory);
}
```

### 2.3. Règles et Sécurité
1. **Plafonnement des Redevances :** Le paramètre `royaltyFeeBps` est strictement bridé par un maximum de 1000 points de base (10%). Tout dépassement lève `RoyaltyFeeTooHigh`.
2. **Immuabilité du `tokenURI` :** Une fois le jeton frappé, son URI IPFS canonique (`ipfs://.../metadata.json`) ne peut être modifiée par personne, garantissant l'intégrité pérenne de la fiche descriptive.
3. **Pausable :** En cas d'incident de sécurité, le propriétaire du contrat peut suspendre les frappes sans bloquer les transferts existants.

---

## 3. Spécification Détaillée de `SendaTestToken.sol` (`STT`)

### 3.1. Responsabilités & Standards
* **Standard :** ERC-20 (`ERC20`, `Ownable`).
* **Nom :** *Senda Test Token* | **Symbole :** `STT` | **Décimales :** `18`.
* **Rôle :** Devise de simulation économique pour les évaluations académiques et tests sans risque financier sur Polygon Amoy.

### 3.2. Mécanisme de Robinet (Faucet)
```solidity
interface ISendaTestToken {
    event TokensMinted(address indexed recipient, uint256 amount);
    event FaucetClaimed(address indexed recipient, uint256 amount);

    error FaucetCooldownActive(uint256 nextAvailableTimestamp);
    error ExceedsFaucetLimit(uint256 requested, uint256 maxAllowed);

    function faucet(address recipient) external;
    function mint(address to, uint256 amount) external; // onlyOwner
}
```
* **Contrainte de Rate-Limiting :** Chaque adresse publique ne peut réclamer que **100 STT toutes les 24 heures**. Le contrat maintient un registre `mapping(address => uint256) public lastFaucetClaim`.

---

## 4. Spécification Détaillée de `SendaEscrow.sol`

### 4.1. Responsabilités & Modèle de Confiance
* **Rôle :** Verrouiller les fonds en jetons `STT` lors de la commande et ne les verser à l'artisan créateur que lorsque l'acheteur a validé la réception physique de l'œuvre.
* **Sécurité :** Dérivé de `ReentrancyGuard` d'OpenZeppelin, application stricte du patron *Checks-Effects-Interactions* (CEI).

### 4.2. Machine à États & Structure de Données
```solidity
enum OrderStatus {
    NonExistent, // 0 : Inconnu
    Created,     // 1 : Initialisé
    Funded,      // 2 : Jetons bloqués dans le séquestre
    Released,    // 3 : Fonds versés à l'artisan
    Refunded     // 4 : Fonds remboursés à l'acheteur
}

struct Order {
    bytes32 orderId;         // keccak256 de l'UUID de commande
    uint256 artworkTokenId;  // Token ID du NFT associé
    address buyer;           // Acheteur ayant consigné les fonds
    address seller;          // Artisan destinataire
    uint256 amount;          // Montant du prix en STT (en Wei)
    OrderStatus status;      // État de la commande
    uint256 createdAt;       // Timestamp de création
    uint256 fundedAt;        // Timestamp du dépôt
    uint256 completedAt;     // Timestamp de libération ou remboursement
}
```

### 4.3. Interface Publique & Événements
```solidity
interface ISendaEscrow {
    // Événements
    event PaymentDeposited(
        bytes32 indexed orderId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 artworkTokenId
    );
    event PaymentReleased(
        bytes32 indexed orderId,
        address indexed seller,
        uint256 amount
    );
    event PaymentRefunded(
        bytes32 indexed orderId,
        address indexed buyer,
        uint256 amount
    );

    // Erreurs personnalisées
    error OrderAlreadyExists(bytes32 orderId);
    error OrderNotFound(bytes32 orderId);
    error OrderNotFunded(bytes32 orderId);
    error InvalidAmount();
    error InvalidAddress();
    error OnlyBuyerAllowed(address caller, address expectedBuyer);
    error TokenTransferFailed();

    // Fonctions métier
    function depositPayment(
        bytes32 orderId,
        uint256 artworkTokenId,
        address seller,
        uint256 amount
    ) external nonReentrant;

    function confirmReceiptAndRelease(
        bytes32 orderId
    ) external nonReentrant;

    function refundBuyer(
        bytes32 orderId
    ) external onlyOwner nonReentrant;

    function getOrder(bytes32 orderId) external view returns (Order memory);
}
```

### 4.4. Analyse de Sécurité & Résilience
1. **Protection contre la Réentrance :** Toutes les méthodes modifiant les états financiers portent le modificateur `nonReentrant`. Les transferts de jetons ERC-20 interviennent après la mutation d'état (`order.status = OrderStatus.Released`).
2. **Contrôle d'Accès de Libération :**
   ```solidity
   if (msg.sender != order.buyer) {
       revert OnlyBuyerAllowed(msg.sender, order.buyer);
   }
   ```
   Aucun tiers, administrateur ou vendeur ne peut forcer la libération des fonds à la place de l'acheteur ayant inspecté le colis.
3. **Intégrité des Transferts ERC-20 :** Utilisation de `IERC20.transferFrom` et `IERC20.transfer` avec contrôle systématique du booléen de retour ou recours à `SafeERC20`.

---

## 5. Guide d'Intégration Frontend Wagmi v2 (Nathan)

### 5.1. Exemple de Dépôt sous Séquestre (2 Étapes)
```typescript
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { SENDA_TOKEN_ABI, SENDA_ESCROW_ABI, DEFAULT_CONTRACTS } from "@/lib/contracts/abis";

// Étape 1 : Approbation des jetons STT
const { writeContractAsync: approveTokens } = useWriteContract();
await approveTokens({
  address: DEFAULT_CONTRACTS.SendaTestToken as `0x${string}`,
  abi: SENDA_TOKEN_ABI,
  functionName: "approve",
  args: [DEFAULT_CONTRACTS.SendaEscrow, parseEther("180")],
});

// Étape 2 : Dépôt effectif dans SendaEscrow
const { writeContractAsync: depositEscrow } = useWriteContract();
const txHash = await depositEscrow({
  address: DEFAULT_CONTRACTS.SendaEscrow as `0x${string}`,
  abi: SENDA_ESCROW_ABI,
  functionName: "depositPayment",
  args: [orderIdHex, BigInt(1), sellerAddress, parseEther("180")],
});
```

### 5.2. Exemple de Libération des Fonds par l'Acheteur
```typescript
const { writeContractAsync: releaseFunds } = useWriteContract();
const txHash = await releaseFunds({
  address: DEFAULT_CONTRACTS.SendaEscrow as `0x${string}`,
  abi: SENDA_ESCROW_ABI,
  functionName: "confirmReceiptAndRelease",
  args: [orderIdHex],
});
```
