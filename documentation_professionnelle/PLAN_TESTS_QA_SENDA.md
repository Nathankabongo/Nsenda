# SENDA — PLAN DE TESTS & ASSURANCE QUALITÉ (QA)
**Stratégie de Test Exhaustive : Smart Contracts, API REST, Intégration Web3 et Parcours E2E**  
**Responsable Pôle :** Tuasansilu Lufuma Benie *(Backend, IPFS & QA)*  
**En coordination avec :** Losongo Kingombe Victor *(Smart Contracts)* & Kabongo Mukola Nathan *(Frontend)*  
**Projet :** SENDA — Marketplace décentralisée de l'artisanat congolais  
**Version :** 1.0 — Cadre de Qualification & Recette  
**Date :** 25 Octobre 2026  

---

## 1. Objectifs & Matrice de Couverture des Tests

La stratégie d'assurance qualité de SENDA garantit que chaque composant peut être vérifié unitairement, puis validé dans le cadre d'un parcours de bout en bout conforme au cahier des charges `PLANSENDA.pdf`.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                             PYRAMIDE DE TEST SENDA                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                               ▲                                                         │
│                              / \     3. TESTS E2E PARCOURS UTILISATEURS                 │
│                             /   \    • Cycle Achat sous Séquestre (Buyer Journey)       │
│                            / E2E \   • Publication & Certification Artisan              │
│                           /───────\                                                     │
│                          /         \ 2. TESTS D'INTÉGRATION INTER-COMPOSANTS            │
│                         /  INTÉGR.  \• API Backend ◄► Nœud RPC Polygon Amoy (Sync)      │
│                        /             \• Backend ◄► Passerelle IPFS Pinata               │
│                       /───────────────\• Frontend ◄► Smart Contracts (Wagmi / Viem)     │
│                      /                 \                                                │
│                     /   TESTS UNITAIRES \ 1. TESTS UNITAIRES ISOLÉS                     │
│                    /                     \ • Contrats Solidity (Hardhat / Chai)         │
│                   /   SOLIDITY & BACKEND  \• Endpoints API Express (Jest / Supertest)   │
│                  /                         \• Composants React & Hooks                  │
│                 └───────────────────────────┘                                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Suite de Tests des Smart Contracts (`packages/contracts/test/`)

Exécutée via `npx hardhat test` dans l'environnement local Hardhat Network et sur Polygon Amoy.

### 2.1. Matrice des Cas de Test Solidity

| Identifiant | Contrat Testé | Scénario & Objectif | Résultat Attendu |
| :--- | :--- | :--- | :--- |
| `TC-SC-01` | `SendaTestToken` | Réclamation nominale de jetons de test via `faucet()` | Crédit de 100 STT, mise à jour du timestamp, émission de `FaucetClaimed` |
| `TC-SC-02` | `SendaTestToken` | Tentative de réclamation successive avant 24h | Rejet avec l'erreur `FaucetCooldownActive` |
| `TC-SC-03` | `SendaNFT` | Frappe nominale d'un certificat d'œuvre (`mintArtwork`) | Attribution de `tokenId`, URI conforme, événement `ArtworkMinted` |
| `TC-SC-04` | `SendaNFT` | Contrôle de redevance ERC-2981 (`royaltyInfo`) | Calcul exact de 5% du prix de vente reversé à l'artisan |
| `TC-SC-05` | `SendaNFT` | Tentative de configurer une redevance > 10% (1000 bps) | Rejet avec l'erreur `RoyaltyFeeTooHigh` |
| `TC-SC-06` | `SendaEscrow` | Dépôt nominal sous séquestre (`depositPayment`) | Transfert des STT de l'acheteur vers Escrow, état `Funded`, émission `PaymentDeposited` |
| `TC-SC-07` | `SendaEscrow` | Tentative de dépôt avec solde ou allowance STT insuffisants | Échec de transaction (revert `ERC20InsufficientAllowance`) |
| `TC-SC-08` | `SendaEscrow` | Tentative de dépôt avec un `orderId` déjà existant | Rejet avec l'erreur `OrderAlreadyExists` |
| `TC-SC-09` | `SendaEscrow` | Libération nominale des fonds par l'acheteur (`confirmReceiptAndRelease`) | Transfert des STT vers l'artisan, état `Released`, émission `PaymentReleased` |
| `TC-SC-10` | `SendaEscrow` | Tentative de libération des fonds par un tiers ou le vendeur | Rejet avec l'erreur `OnlyBuyerAllowed` |
| `TC-SC-11` | `SendaEscrow` | Tentative de libération d'une commande non approvisionnée | Rejet avec l'erreur `OrderNotFunded` |
| `TC-SC-12` | `SendaEscrow` | Résolution de litige et remboursement acheteur par l'arbitre (`refundBuyer`) | Restitution des STT à l'acheteur, état `Refunded`, émission `PaymentRefunded` |
| `TC-SC-13` | `SendaEscrow` | Tentative de remboursement par un appelant non propriétaire | Rejet `OwnableUnauthorizedAccount` |
| `TC-SC-14` | `SendaEscrow` | Test de non-réentrance sur `depositPayment` et `confirmReceiptAndRelease` | Rejet avec `ReentrancyGuardReentrantCall` |

---

## 3. Suite de Tests de l'API Backend (`backend/`)

Exécutée via `npm run test` avec Jest et Supertest.

### 3.1. Tests des Endpoints & Intégration Données

| Identifiant | Endpoint Testé | Scénario | Validation |
| :--- | :--- | :--- | :--- |
| `TC-API-01` | `GET /api/health` | Vérification de vitalité du service | `status: 200`, `database: "connected"`, horodatage ISO valide |
| `TC-API-02` | `GET /api/artworks` | Récupération du catalogue avec filtre de province | Liste filtrée uniquement aux œuvres de la province demandée |
| `TC-API-03` | `GET /api/artworks/:id` | Récupération d'une œuvre existante | `status: 200`, présence des données techniques, d'audit et IPFS |
| `TC-API-04` | `GET /api/artworks/:id` | Récupération d'un identifiant inexistant | `status: 404 Not Found` avec message d'erreur standard |
| `TC-API-05` | `POST /api/artworks` | Publication avec fichier image valide et métadonnées | Épinglage Pinata réussi, génération CID, insertion DB, `status: 201` |
| `TC-API-06` | `POST /api/artworks` | Publication avec fichier non image (ex: .exe, .sh) | Rejet immédiat `status: 400 Bad Request` sans appel IPFS |
| `TC-API-07` | `POST /api/orders` | Initialisation de commande off-chain | `status: 201`, calcul exact de `orderIdHex = keccak256(orderUuid)` |
| `TC-API-08` | `PATCH /api/orders/:id/sync`| Validation avec un reçu de transaction on-chain réussi | Vérification RPC Polygon Amoy, passage à `FUNDED_IN_ESCROW` |
| `TC-API-09` | `PATCH /api/orders/:id/sync`| Tentative de synchronisation avec un faux hash de transaction | Rejet `status: 400 Bad Request` (Transaction non trouvée ou revert) |
| `TC-API-10` | `PATCH /api/orders/:id/sync`| Tentative de réutilisation d'un hash déjà consommé (double dépense) | Rejet `status: 409 Conflict` |

---

## 4. Tests de Bout en Bout (E2E) — Scénarios Critiques

### Scénario E2E 1 : Cycle d'Achat Nominal avec Séquestre Physique
1. **Étape 1 :** L'acheteur visite le catalogue et sélectionne le *Masque Royal Pende* (180 STT).
2. **Étape 2 :** L'acheteur connecte son portefeuille MetaMask configuré sur Polygon Amoy.
3. **Étape 3 :** Si le solde est nul, l'acheteur réclame +100 STT via le Faucet et renouvelle pour disposer de 200 STT.
4. **Étape 4 :** L'acheteur clique sur *« Acheter (Séquestre) »*.
5. **Étape 5 :** Signature de l'approbation `STT.approve` -> Attente du reçu de confirmation.
6. **Étape 6 :** Signature du dépôt `SendaEscrow.depositPayment` -> Attente du reçu de confirmation.
7. **Étape 7 :** Le statut de la commande passe à `Funded` sur la page `/my-nfts`.
8. **Étape 8 :** L'acheteur clique sur *« Confirmer réception physique & Libérer fonds »*.
9. **Étape 9 :** Signature de `SendaEscrow.confirmReceiptAndRelease`.
10. **Étape 10 :** Vérification finale :
    - Le solde de l'acheteur a diminué de 180 STT.
    - Le solde de l'artisan a augmenté de 180 STT.
    - Le contrat de séquestre a un solde nul pour cette commande.
    - La commande affiche le badge vert `Released (Fonds Versés à l'Artisan)`.

### Scénario E2E 2 : Publication d'une Œuvre par l'Artisan & Minting
1. **Étape 1 :** L'artisan vérifié se connecte au Studio [`/create`](file:///d:/SENDA/NFT-market-Place-main/apps/web/app/create/page.tsx).
2. **Étape 2 :** Téléversement de la photo de la création et saisie des spécifications matérielles.
3. **Étape 3 :** Contrôle du rendu dynamique de la Live Preview Card.
4. **Étape 4 :** Clic sur *« Certifier & Publier l'œuvre »*.
5. **Étape 5 :** Le backend téléverse l'image et le manifeste JSON sur Pinata IPFS et retourne le `tokenURI`.
6. **Étape 6 :** L'artisan signe la transaction `SendaNFT.mintArtwork` sur son portefeuille.
7. **Étape 7 :** Vérification : La nouvelle œuvre apparaît immédiatement dans le catalogue public `/` avec son image hébergée, sa province, son certificat NFT et son option d'achat sous séquestre.

---

## 5. Gestion des Scénarios Négatifs & Résilience aux Pannes

| Incident Simulé | Comportement Attendu du Système |
| :--- | :--- |
| **Mauvais réseau blockchain** (ex: utilisateur sur Ethereum Mainnet au lieu de Polygon Amoy) | Le frontend bloque les boutons d'action et affiche un bandeau invitant à basculer vers Polygon Amoy (Chain ID 80002). |
| **Refus de signature dans MetaMask** (clic sur *Rejeter*) | L'interface intercepte l'erreur `UserRejectedRequestError`, ferme le spinner et affiche un toast d'avertissement sans bloquer la page. |
| **Indisponibilité temporaire de Pinata** (timeout réseau IPFS) | Le backend met en œuvre 3 tentatives exponentielles (*exponential backoff*). Si l'échec persiste, la transaction est annulée proprement sans écriture corrompue en base. |
| **Tentative de piratage du statut de commande** (appel forgé à `/api/orders/:id/sync`) | Le backend vérifie cryptographiquement les logs de la transaction on-chain via le nœud RPC. Si le hash ne correspond pas aux paramètres attendus, la requête est rejetée. |
