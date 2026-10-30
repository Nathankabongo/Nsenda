# SENDA — SPÉCIFICATIONS DES API REST & PIPELINE IPFS
**Documentation Exhaustive des Endpoints Backend, Modèles de Requête/Réponse et Intégration Pinata**  
**Responsable Pôle :** Tuasansilu Lufuma Benie *(Backend, IPFS & QA)*  
**Projet :** SENDA — Marketplace décentralisée de l'artisanat congolais  
**Version :** 1.0 — Spécification Conforme OpenAPI 3.0 / Express.js  
**Serveur de base :** `http://localhost:4000` (Développement) / `https://api.senda.cd` (Production)  

---

## 1. Principes et Sécurité des API

1. **Standard RESTful :** Utilisation rigoureuse des verbes HTTP (`GET`, `POST`, `PATCH`, `DELETE`) et des codes de statut HTTP standard (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `500 Internal Error`).
2. **Authentification Web3 :** L'authentification des requêtes sensibles (création d'œuvres, synchronisation de commandes) repose sur la signature cryptographique d'un message EIP-4361 (*Sign-In with Ethereum - SIWE*) ou la vérification du header `x-wallet-address`.
3. **Cloisonnement des Secrets Pinata :** Les identifiants `PINATA_JWT`, `PINATA_API_KEY` et `PINATA_SECRET_KEY` demeurent **strictement cantonnés aux variables d'environnement du serveur backend**. Aucun client web n'y a accès.
4. **Validation des Schémas :** Toutes les requêtes entrantes sont assainies et validées via des schémas stricts (ex: Zod / Joi).

---

## 2. Référentiel Exhaustif des Endpoints

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                               CATALOGUE DES ROUTES                                │
├──────────┬─────────────────────────────────────┬──────────────────────────────────┤
│ Méthode  │ Chemin                              │ Description                      │
├──────────┼─────────────────────────────────────┼──────────────────────────────────┤
│ GET      │ /api/health                         │ Vérification de l'état du serveur│
│ GET      │ /api/artworks                       │ Liste paginée et filtrée         │
│ GET      │ /api/artworks/:id                   │ Détail complet d'une œuvre       │
│ POST     │ /api/artworks                       │ Création d'œuvre & téléversement │
│ GET      │ /api/artworks/:id/metadata          │ Manifeste JSON ERC-721 public    │
│ PATCH    │ /api/artworks/:id/mint-sync         │ Synchronisation après frappe NFT │
│ POST     │ /api/artisans/verification          │ Demande d'audit d'atelier        │
│ GET      │ /api/artisans/:address              │ Profil public d'un artisan       │
│ POST     │ /api/orders                         │ Initialisation d'une commande    │
│ GET      │ /api/orders/:id                     │ Détail et suivi d'une commande   │
│ PATCH    │ /api/orders/:id/sync                │ Validation de transaction on-chain│
│ GET      │ /api/users/:address/orders          │ Commandes d'un acheteur          │
│ GET      │ /api/users/:address/sales           │ Ventes d'un artisan              │
└──────────┴─────────────────────────────────────┴──────────────────────────────────┘
```

---

## 3. Détail des Spécifications par Endpoint

### 3.1. `GET /api/health`
* **Objectif :** Sonde de vitalité du service backend, de la base PostgreSQL et de la connectivité RPC Polygon Amoy.
* **Authentification :** Aucune (Public).
* **Réponse `200 OK` :**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "network": "Polygon Amoy (80002)",
    "database": "connected",
    "timestamp": "2026-10-25T16:00:00.000Z"
  }
}
```

---

### 3.2. `GET /api/artworks`
* **Objectif :** Récupérer la liste paginée des œuvres artisanales avec filtres multicritères.
* **Authentification :** Aucune (Public).
* **Paramètres d'URL (Query String) :**
  - `page` (optionnel, integer, défaut: 1)
  - `limit` (optionnel, integer, défaut: 12)
  - `category` (optionnel, string, ex: `"Sculptures sur bois"`)
  - `province` (optionnel, string, ex: `"Kwilu"`)
  - `search` (optionnel, string, recherche plein texte sur titre/matières/artisan)
  - `sortBy` (optionnel, enum: `"newest" | "price_asc" | "price_desc"`, défaut: `"newest"`)
* **Réponse `200 OK` :**
```json
{
  "success": true,
  "data": [
    {
      "id": "c1f7a2b9-6d8e-4a1c-9b3f-8e2d1c0a9b4f",
      "tokenId": 1,
      "title": "Masque Royal Pende — Mbuya",
      "description": "Masque traditionnel d'initiation Mukanda sculpté à la main en bois de wengé noble...",
      "price": "180",
      "priceWei": "180000000000000000000",
      "category": "Masques traditionnels",
      "artisan": {
        "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "name": "Maître Mukendi Kalonji",
        "walletAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "province": "Kwilu",
        "verificationStatus": "VERIFIED"
      },
      "materials": "Bois de wengé, fibres de raphia, kaolin",
      "dimensions": "38 x 24 x 18 cm",
      "weight": "1.35 kg",
      "image": "/artworks/masque_pende.jpg",
      "ipfsImageUri": "ipfs://bafybeicpende7v6imagehashcid001/masque_pende.jpg",
      "ipfsMetadataUri": "ipfs://bafybeihsendapende001metadatajsoncid/metadata.json",
      "royaltyBps": 500,
      "status": "MINTED_LISTED"
    }
  ],
  "meta": {
    "total": 8,
    "page": 1,
    "totalPages": 1
  }
}
```

---

### 3.3. `POST /api/artworks`
* **Objectif :** Créer une nouvelle œuvre, téléverser l'image sur IPFS via Pinata, générer et téléverser le manifeste JSON ERC-721, puis enregistrer l'œuvre dans PostgreSQL.
* **Authentification :** Requise (`x-wallet-address` d'un artisan vérifié).
* **Format de requête :** `multipart/form-data`.
* **Champs de formulaire :**
  - `image` : Fichier binaire image (JPG, PNG, WebP ; max 10 Mo).
  - `title` : String (max 150 caractères).
  - `description` : String (récit traditionnel, démarche).
  - `category` : String (parmi les catégories SENDA valides).
  - `province` : String (province de RDC d'origine).
  - `materials` : String (essences, pigments, métaux).
  - `dimensions` : String (ex: "45 x 20 x 15 cm").
  - `weight` : String (ex: "2.10 kg").
  - `price` : String (montant en STT, ex: "250").
  - `royaltyBps` : Integer (entre 500 et 1000, soit 5% à 10%).
* **Traitement Interne du Backend :**
  1. Validation des champs et contrôle du fichier image.
  2. Appel Pinata `pinFileToIPFS` avec l'image -> Récupération de `imageCid`.
  3. Construction du manifeste JSON :
     ```json
     {
       "name": "Titre de l'œuvre",
       "description": "Récit traditionnel...",
       "image": "ipfs://<imageCid>/image.jpg",
       "attributes": [
         { "trait_type": "Province", "value": "Grand Kasaï" },
         { "trait_type": "Matières", "value": "Bois d'iroko" },
         { "trait_type": "Certification", "value": "Audit terrain SENDA" }
       ]
     }
     ```
  4. Appel Pinata `pinJSONToIPFS` -> Récupération de `metadataCid`.
  5. Insertion dans la table `artworks` de PostgreSQL (`status: "VERIFIED_PENDING_MINT"`).
* **Réponse `201 Created` :**
```json
{
  "success": true,
  "data": {
    "artworkId": "e5b8d9c1-4a3f-4e2b-9c1d-7f8e0a2b4c6d",
    "title": "Statuette Royale Luba",
    "ipfsImageUri": "ipfs://bafybeicimagehash123/image.jpg",
    "ipfsMetadataUri": "ipfs://bafybeihmetadatahash456/metadata.json",
    "status": "VERIFIED_PENDING_MINT",
    "royaltyBps": 600
  }
}
```

---

### 3.4. `PATCH /api/artworks/:id/mint-sync`
* **Objectif :** Notifier le backend après l'exécution réussie de la transaction de frappe `SendaNFT.mintArtwork` sur Polygon Amoy.
* **Authentification :** Requise.
* **Corps de requête (`application/json`) :**
```json
{
  "mintTxHash": "0x4e8a912c75f103b41d26987f6204561849a9c2b3e809f8745a32b1c4e789f10a",
  "tokenId": 7,
  "contractAddress": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
}
```
* **Traitement Interne du Backend :**
  1. Vérification on-chain du reçu de transaction via RPC Polygon Amoy (`receipt.status === 1`).
  2. Contrôle de l'événement `ArtworkMinted` émis par le contrat.
  3. Insertion de la ligne dans `nft_records`.
  4. Mise à jour de l'œuvre : `status = "MINTED_LISTED"`.
* **Réponse `200 OK` :**
```json
{
  "success": true,
  "data": {
    "artworkId": "e5b8d9c1-4a3f-4e2b-9c1d-7f8e0a2b4c6d",
    "tokenId": 7,
    "status": "MINTED_LISTED",
    "verifiedOnChain": true
  }
}
```

---

### 3.5. `POST /api/orders`
* **Objectif :** Initialiser une intention d'achat off-chain et générer l'identifiant cryptographique `bytes32 orderIdHex` avant l'appel au smart contract de séquestre.
* **Authentification :** Requise (Acheteur).
* **Corps de requête (`application/json`) :**
```json
{
  "artworkId": "c1f7a2b9-6d8e-4a1c-9b3f-8e2d1c0a9b4f",
  "buyerWalletAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "shippingAddress": {
    "recipientName": "Kalonji M.",
    "street": "Avenue de la Paix, Gombe",
    "city": "Kinshasa",
    "country": "République démocratique du Congo"
  }
}
```
* **Réponse `201 Created` :**
```json
{
  "success": true,
  "data": {
    "orderId": "b8a9c0d1-e2f3-4a5b-6c7d-8e9f0a1b2c3d",
    "orderIdHex": "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    "artworkTokenId": 1,
    "sellerWalletAddress": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "amount": "180",
    "amountWei": "180000000000000000000",
    "escrowContract": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    "status": "INITIATED"
  }
}
```

---

### 3.6. `PATCH /api/orders/:id/sync`
* **Objectif :** Valider et synchroniser un événement on-chain de séquestre (`PaymentDeposited` ou `PaymentReleased`) après signature dans le portefeuille de l'acheteur.
* **Corps de requête (`application/json`) :**
```json
{
  "action": "DEPOSIT", // ou "RELEASE"
  "txHash": "0x3b890123456789abcdef0123456789abcdef0123456789abcdef0123456789ab"
}
```
* **Vérification On-Chain :**
  - Contrôle du reçu RPC.
  - Vérification que l'`orderId` dans les logs correspond à la commande.
  - Si `action === "DEPOSIT"`, bascule en `FUNDED_IN_ESCROW`.
  - Si `action === "RELEASE"`, bascule en `RELEASED`.
* **Réponse `200 OK` :**
```json
{
  "success": true,
  "data": {
    "orderId": "b8a9c0d1-e2f3-4a5b-6c7d-8e9f0a1b2c3d",
    "status": "FUNDED_IN_ESCROW",
    "confirmedBlock": 1459203,
    "updatedAt": "2026-10-25T16:05:00.000Z"
  }
}
```
