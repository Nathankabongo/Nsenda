# SENDA — MATRICE DES RESPONSABILITÉS & COUVERTURE D'ÉQUIPE
**Répartition RACI des Rôles, Dépendances Techniques et Feuille de Route Opérationnelle**  
**Projet :** SENDA — Marketplace décentralisée de l'artisanat congolais  
**Cadre académique :** Master 1 Informatique — Groupe 02  
**Date :** 25 Octobre 2026 | **Version :** 1.0 — Cadre de Gouvernance  

---

## 1. Composition de l'Équipe & Pôles de Spécialisation

| Membre | Pôle Principal | Périmètre Technique | Composants Clés sous sa Responsabilité |
| :--- | :--- | :--- | :--- |
| **Kabongo Mukola Nathan** | **Frontend & Intégration Web3** | Next.js 14, React, TypeScript, Tailwind CSS, Wagmi v2, Viem, RainbowKit | [`apps/web/`](file:///d:/SENDA/NFT-market-Place-main/apps/web/), Pages (`/`, `/nft/[id]`, `/create`, `/my-nfts`), Composants UI, Interactions Wallet |
| **Losongo Kingombe Victor** | **Smart Contracts & Blockchain** | Solidity 0.8.24, Hardhat, OpenZeppelin v5, Polygon Amoy | [`packages/contracts/`](file:///d:/SENDA/NFT-market-Place-main/packages/contracts/), `SendaNFT.sol`, `SendaEscrow.sol`, `SendaTestToken.sol`, Scripts de déploiement |
| **Tuasansilu Lufuma Benie** | **Backend, IPFS & QA** | Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Pinata Cloud SDK, Jest | [`backend/`](file:///d:/SENDA/backend/), API REST (`/api/*`), Pipeline IPFS, Schéma relationnel, Stratégie de tests et conformité |

---

## 2. Matrice RACI des Livrables Techniques

* **R (Responsible) :** Le membre qui réalise l'activité ou produit le code.
* **A (Accountable) :** Le membre garant de la conformité finale du composant.
* **C (Consulted) :** Le membre dont l'avis technique est sollicité pour assurer l'interopérabilité.
* **I (Informed) :** Le membre tenu informé des évolutions de l'interface.

| Activité / Livrable Technique | Nathan (Frontend) | Victor (Blockchain) | Benie (Backend/QA) |
| :--- | :---: | :---: | :---: |
| **Design System & Ergonomie UI muséale** | **R / A** | I | C |
| **Intégration RainbowKit & Wagmi v2 (Wallet Connect)** | **R / A** | C | I |
| **Développement de `SendaNFT.sol` (ERC-721 + ERC-2981)** | C | **R / A** | C |
| **Développement de `SendaEscrow.sol` (Séquestre physique)** | C | **R / A** | C |
| **Développement de `SendaTestToken.sol` (ERC-20 Faucet)** | C | **R / A** | I |
| **Déploiement sur Polygon Amoy (Chain ID 80002)** | I | **R / A** | C |
| **Modélisation de données & Schéma Prisma (PostgreSQL)** | C | C | **R / A** |
| **Développement de l'API REST Express & Middlewares** | C | I | **R / A** |
| **Pipeline de téléversement et épinglage IPFS Pinata** | C | I | **R / A** |
| **Synchronisation des reçus de transaction on-chain** | C | C | **R / A** |
| **Modale d'Achat sous Séquestre en 2 étapes (`approve` -> `deposit`)** | **R / A** | C | C |
| **Tableau de bord `/my-nfts` (Bouton de confirmation de livraison)** | **R / A** | C | C |
| **Tests unitaires et de sécurité Solidity (Hardhat/Chai)** | I | **R / A** | C |
| **Tests d'intégration API & Mock IPFS (Jest/Supertest)** | I | I | **R / A** |
| **Recette E2E des parcours Acheteur et Artisan** | **R** | **R** | **A** |

---

## 3. Matrice des Flux et Dépendances Inter-Composants

| Interface | Composant Producteur | Composant Consommateur | Responsable Validation | Protocole de Gestion des Évolutions |
| :--- | :--- | :--- | :--- | :--- |
| **ABIs & Adresses des Contrats** | `packages/contracts/` (Victor) | `apps/web/lib/contracts/abis.ts` (Nathan) | Victor & Nathan | Toute mise à jour de contrat nécessite la regénération des ABIs via `npm run compile` et la mise à jour synchronisée dans `apps/web/`. |
| **Calcul de l'`orderId` on-chain** | `keccak256(orderUuid)` (Benie / Nathan) | `SendaEscrow.depositPayment` (Victor) | Victor & Benie | L'algorithme de hachage est normé dans `CONTRAT_INTEGRATION_SENDA.md`. Aucun hachage divergent n'est toléré. |
| **Manifeste JSON IPFS ERC-721** | `pinataService.ts` (Benie) | `SendaNFT.mintArtwork` (Victor) & Catalogue (Nathan) | Benie | Structure stricte conforme à la spécification OpenSea/ERC-721 avec attributs enrichis (Province, Matières). |
| **Endpoints REST `/api/*`** | `backend/src/routes/api.ts` (Benie) | `apps/web/lib/api.ts` (Nathan) | Benie & Nathan | Enveloppe `{ success, data, error }` obligatoire. Pas de renommage de route sans préavis écrit. |

---

## 4. Feuille de Route d'Action Immédiate par Membre

### 4.1. Plan d'Action pour Kabongo Mukola Nathan (Frontend)
1. **Intégration finale de l'API REST :**
   - Connecter les appels de [`apps/web/app/page.tsx`](file:///d:/SENDA/NFT-market-Place-main/apps/web/app/page.tsx) vers l'endpoint `GET /api/artworks` pour remplacer définitivement les mock data statiques par les données dynamiques de la base.
   - Brancher le formulaire [`apps/web/app/create/page.tsx`](file:///d:/SENDA/NFT-market-Place-main/apps/web/app/create/page.tsx) sur `POST /api/artworks` pour envoyer les fichiers multipart vers le backend de Benie.
2. **Robustesse Web3 :**
   - Conserver les retours utilisateur soignés (toasts de chargement, toasts d'erreur clairs en français en cas de rejet MetaMask).
   - Maintenir la mise en page épurée de la Navbar et des socles muséaux des œuvres.

### 4.2. Plan d'Action pour Losongo Kingombe Victor (Smart Contracts)
1. **Exécution de la suite de test Hardhat :**
   - Lancer `npx hardhat test` dans `packages/contracts/` pour valider la non-régression sur les 14 cas de test documentés dans le plan QA.
2. **Déploiement Polygon Amoy :**
   - Exécuter le script `scripts/deploySenda.ts` avec la clé privée de testnet.
   - Relever les adresses définitives déployées (`SendaNFT`, `SendaEscrow`, `SendaTestToken`) et les renseigner dans `DEFAULT_CONTRACTS` dans `apps/web/lib/contracts/abis.ts` et dans `.env` du backend.
   - Soumettre les contrats à vérification sur l'explorateur *Polygonscan Amoy*.

### 4.3. Plan d'Action pour Tuasansilu Lufuma Benie (Backend & QA)
1. **Base de données & Migrations :**
   - Si une instance PostgreSQL locale ou Cloud (Supabase/Neon) est configurée, exécuter `npx prisma db push` dans `backend/`.
   - Alimenter la base avec le script de seed contenant les 8 créations artisanales emblématiques de RDC.
2. **Configuration Pinata :**
   - Vérifier la présence des variables `PINATA_JWT` et `PINATA_GATEWAY` dans `backend/.env`.
3. **Pilotage de la Recette E2E :**
   - Coordonner la séance de test croisé avec Nathan et Victor en exécutant les deux scénarios critiques E2E avant la présentation académique.
