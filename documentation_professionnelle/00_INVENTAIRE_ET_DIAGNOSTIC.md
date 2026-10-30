# SENDA — INVENTAIRE TECHNIQUE ET DIAGNOSTIC DE L'EXISTANT
**Projet :** SENDA — Marketplace décentralisée de l'artisanat congolais  
**Cadre académique :** Master 1 Informatique (2026–2027) — Groupe 02  
**Membres :** Kabongo Mukola Nathan | Losongo Kingombe Victor | Tuasansilu Lufuma Benie  
**Date du diagnostic :** Octobre 2026  
**Document de référence :** `PLANSENDA.pdf`  
**Statut :** Audit initial et diagnostic exhaustif de l'espace de travail `D:\SENDA`

---

## 1. Contexte et objectifs de l'audit

L'objectif de cet audit est d'examiner l'intégralité des fichiers, dossiers, dépendances, contrats intelligents et composants présents dans l'espace de travail local `D:\SENDA`. 

Il s'agit d'établir avec rigueur scientifique et impartialité :
1. La cartographie exacte des ressources existantes.
2. La provenance et le rôle technique de chaque composant.
3. L'état d'avancement réel par rapport aux spécifications du document directeur `PLANSENDA.pdf`.
4. Les écarts architecturaux majeurs, redondances et risques de confusion technique.
5. Les recommandations concrètes d'assainissement et de structuration.

---

## 2. Vue d'ensemble de l'espace local `D:\SENDA`

L'analyse récursive du répertoire racine `D:\SENDA` révèle l'existence de **deux sous-projets indépendants et hétérogènes**, sans fichier racine unifié (absence de `package.json` racine ou de workspace global configuré à la racine) :

```
D:\SENDA\
├── NFT-market-Place-main\     # [Dépôt A] Base Next.js 14 + Hardhat + Wagmi v2 (Aetheria)
└── nft-marketplace-main\      # [Dépôt B] Template open-source historique 2022 (Markkop)
```

### Observation fondamentale
Aucun fichier du répertoire `D:\SENDA` ne contient actuellement les termes **« SENDA »**, **« Congo »** ou **« artisan »**. Les dossiers présents correspondent à des **kits de démarrage (starters) / prototypes techniques de places de marché NFT génériques**, téléchargés ou initialisés pour servir de fondation technique, mais non encore adaptés ni fusionnés dans l'écosystème artisanal congolais spécifié dans `PLANSENDA.pdf`.

---

## 3. Inventaire détaillé des composants

### 3.1. Dépôt A : `NFT-market-Place-main` (Projet "Aetheria NFT Marketplace")
* **Date d'horodatage des fichiers :** 10/08/2026
* **Architecture :** Monorepo scindé en deux packages (`apps/web` et `packages/contracts`)
* **Stack technique :** Next.js 14 (App Router), TypeScript, Tailwind CSS, RainbowKit, Wagmi v2, Viem, Solidity 0.8.24, OpenZeppelin v5, Hardhat.

| Chemin relatif | Nature / Fonction | Dépendances clés | État vérifié | Incohérence / Écart PLANSENDA | Action recommandée |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `packages/contracts/contracts/AetherNFT.sol` | Contrat ERC-721 avec support des redevances ERC-2981, URIStorage, Ownable, Pausable. | OpenZeppelin v5 (`ERC721URIStorage`, `ERC2981`, `Ownable`, `Pausable`) | **Fonctionnel (code complet)** | Nommé `AetherNFT` au lieu de `SendaNFT`. Pas de restriction d'accès aux seuls artisans vérifiés pour le minting. | Renommer en `SendaNFT.sol`, intégrer le contrôle d'accès artisan ou rôle `ARTISAN_ROLE`. |
| `packages/contracts/contracts/AetherMarketplace.sol` | Marketplace NFT à prix fixe avec vente atomique directe sans séquestre. | `IERC721`, `ERC2981`, `ReentrancyGuard`, `Ownable`, `Pausable` | **Fonctionnel pour du pur digital** | **Incompatibilité majeure :** Ce contrat utilise un modèle *escrow-free* (vente atomique instantanée via `safeTransferFrom` et paiement en monnaie native ETH/MATIC). `PLANSENDA.pdf` exige un contrat de séquestre physique (`SendaEscrow.sol`) avec rétention des fonds jusqu'à livraison physique et paiement en jeton ERC-20 (`SendaTestToken.sol`). | Développer le contrat `SendaEscrow.sol` et `SendaTestToken.sol` conformes au cycle `Created -> Funded -> Released / Refunded`. |
| `packages/contracts/test/AetheriaMarketplace.test.ts` | Suite de tests automatisés Hardhat / Chai (13 tests unitaires). | `@nomicfoundation/hardhat-ethers`, Chai | **Vérifié (tests complets pour Aether)** | Couvre uniquement la vente atomique sans séquestre et le jeton Aether. Aucun test de séquestre ni de jeton ERC-20 de test. | Réécrire la suite de tests pour couvrir `SendaEscrow` (dépôt, blocage, libération, annulation, tentatives d'accès non autorisé). |
| `packages/contracts/scripts/deploy.ts` | Script de déploiement et de peuplement démo multi-chaîne. | Hardhat, Ethers | **Partiellement réalisé** | Déploie sur localhost / Sepolia / Amoy, mais configure `AetherNFT` et `AetherMarketplace`. | Adapter pour déployer `SendaNFT`, `SendaTestToken` et `SendaEscrow` sur Polygon Amoy. |
| `packages/contracts/hardhat.config.ts` | Configuration Hardhat (Solidity 0.8.24, réseaux Polygon Amoy, Sepolia, Base Sepolia). | `@nomicfoundation/hardhat-toolbox` | **Fonctionnel** | Réseau Amoy configuré mais dépend d'une clé privée non fournie dans `.env.example`. | Maintenir la configuration Amoy et documenter la gestion sécurisée des secrets. |
| `apps/web/app/page.tsx` | Page d'accueil et catalogue public avec recherche, tri et filtres de catégories. | React, Wagmi, Lucide-React, `INITIAL_DEMO_NFTS` | **Partiellement réalisé** | Thématique cyberpunk/futuriste ("Cybernetic Horizon", "Quantum Obsidian"). Données statiques fictives. Ne reflète pas l'artisanat congolais. | Refondre l'UI aux couleurs de SENDA (Vert profond, Ocre, Beige) et intégrer les catégories artisanales congolaises. |
| `apps/web/app/create/page.tsx` | Studio de création / publication de NFT. | Wagmi (`useWriteContract`), Lucide, Sonner | **Incomplet par rapport au PRD** | Encode les métadonnées sous forme de `data:application/json;utf8,...` inlined ! **Aucun téléversement sur IPFS.** Tout utilisateur connecté peut minter. | Brancher le téléversement des images et métadonnées sur IPFS via Pinata. Restreindre la création aux artisans vérifiés. |
| `apps/web/app/my-nfts/page.tsx` | Tableau de bord utilisateur (portefeuille, NFT détenus et listés). | Wagmi, Lucide | **Partiellement réalisé** | Affiche les NFT locaux/mockés, pas de vue commandes en cours ni suivi du séquestre physique. | Ajouter les sections "Commandes en attente de livraison" et "Ventes à expédier". |
| `apps/web/app/nft/[id]/page.tsx` | Fiche détaillée d'un NFT avec historique et bouton d'achat. | Wagmi, Viem | **Partiellement réalisé** | Déclenche `BuyModal` pour un achat instantané sans séquestre. Pas d'indicateur d'authenticité physique ni d'origine déclarée/vérifiée. | Adapter la fiche pour intégrer le flux de séquestre (Approve ERC-20 -> Deposit Escrow) et la traçabilité artisanale. |
| `apps/web/components/BuyModal.tsx` | Modale d'achat avec validation de transaction. | Wagmi, Viem | **Non conforme au séquestre** | Exécute `buyItem` sur `AetherMarketplace`. | Transformer en modale d'engagement de commande sous séquestre (`SendaEscrow.deposit`). |
| `apps/web/lib/wagmi.ts` | Configuration client Wagmi v2 / Viem. | Wagmi, Viem, `@tanstack/react-query` | **Fonctionnel** | Configuré pour Sepolia, Amoy, Base Sepolia. Chaîne par défaut : Polygon Amoy. | Validé pour le projet SENDA. |
| `apps/web/lib/mockData.ts` | Jeu de données mockées pour le frontend. | TypeScript | **Obsolète / Inadapté** | Contient des NFT de science-fiction (Cyberpunk, Plasma, Dark Matter). | Remplacer par des œuvres artisanales congolaises (Masque Pende, Statuette Bakongo, Tissu Raphia Shoowa, etc.). |
| `apps/web/lib/contracts/abis.ts` | Fichiers ABI exportés pour AetherNFT et AetherMarketplace. | TypeScript | **Partiellement réalisé** | Ne contient pas les ABI d'un contrat de séquestre ni d'un token ERC-20. | Exporter les ABI de `SendaEscrow` et `SendaTestToken`. |

---

### 3.2. Dépôt B : `nft-marketplace-main` (Projet Markkop 2022)
* **Date d'horodatage des fichiers :** 01/02/2022
* **Architecture :** Next.js Pages Router monolithique (JavaScript standard)
* **Stack technique :** Next.js 12, Material-UI (MUI v5), Ethers.js v5, Hardhat, Solidity 0.8.4, OpenZeppelin v4 (`Counters.sol`).

| Chemin relatif | Nature / Fonction | Dépendances clés | État vérifié | Incohérence / Écart PLANSENDA | Action recommandée |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `pages/api/upload.js` | Endpoint API de téléversement vers IPFS via l'API Pinata. | `axios`, `form-data`, `next-connect` | **Fonctionnel (code utilitaire)** | Implémente le pin de fichier image et de fichier JSON de métadonnées sur Pinata. Dépend de variables `PINATA_API_KEY` et `PINATA_SECRET_KEY`. | **Actif précieux :** Extraire ce code et l'adapter sous forme de service backend Express ou route API Next.js 14 TypeScript. |
| `contracts/Marketplace.sol` | Contrat de vente NFT avec séquestre du NFT (le NFT est transféré au contrat lors du listing). | OpenZeppelin v4 (`ReentrancyGuard`, `Counters`) | **Obsolète / Non conforme** | Séquestre l'actif numérique (NFT) contre un listing fee de 0.045 ETH. Ne gère aucun séquestre de paiement pour un bien physique. Utilise la librairie obsolète `Counters.sol`. | Ne pas conserver ce contrat pour SENDA. |
| `contracts/NFT.sol` | Contrat ERC-721 basique ("MarkKop / MARK"). | OpenZeppelin v4 | **Obsolète** | Approuve automatiquement l'adresse du marketplace au mint. Pas de support ERC-2981. | Remplacer par la logique moderne d'`AetherNFT` (adaptée en `SendaNFT`). |
| `src/components/...` | Composants UI Material UI (MUI v5 / Emotion). | `@mui/material`, `@emotion/react` | **Obsolète** | Incompatible avec le choix Tailwind CSS / Next.js App Router retenu dans `PLANSENDA.pdf`. | Archiver / ne pas intégrer dans le frontend principal. |

---

## 4. Synthèse comparative des deux bases techniques

| Critère d'évaluation | `NFT-market-Place-main` (Dépôt A) | `nft-marketplace-main` (Dépôt B) | Recommandation `PLANSENDA.pdf` | Décision d'architecture |
| :--- | :--- | :--- | :--- | :--- |
| **Framework Frontend** | Next.js 14 (App Router), TypeScript | Next.js 12 (Pages Router), JS | Next.js, React, TypeScript | **Retenir Dépôt A (Next.js 14)** |
| **Moteur CSS** | Tailwind CSS v3 | Material UI (MUI v5) / Emotion | Tailwind CSS | **Retenir Dépôt A (Tailwind CSS)** |
| **Couche Web3** | Wagmi v2 + Viem + RainbowKit | Ethers.js v5 (Web3Provider manuel) | wagmi, viem, MetaMask | **Retenir Dépôt A (Wagmi / Viem)** |
| **Version Solidity** | `0.8.24` (OpenZeppelin v5) | `0.8.4` (OpenZeppelin v4) | Solidity récent, OpenZeppelin | **Retenir Dépôt A (Solidity 0.8.24)** |
| **Redevances ERC-2981** | Implémentées nativement | Absentes | Exigence P1 (FR-11) | **Retenir logique Dépôt A** |
| **Stockage IPFS** | Data URI fictif (non décentralisé) | Intégration Pinata (`upload.js`) | IPFS / Pinata (P0) | **Transposer logique Dépôt B dans Dépôt A** |
| **Modèle de transaction** | Vente atomique instantanée sans séquestre | Séquestre du NFT (listing fee) | **Séquestre de paiement physique** | **Développer `SendaEscrow.sol` dédié** |
| **Monnaie de paiement** | Monnaie native (ETH/MATIC) | Monnaie native (MATIC/ETH) | Jeton de test ERC-20 (`SendaTestToken`) | **Développer `SendaTestToken.sol`** |
| **Backend & Base de données**| Inexistant (tout en client-side) | 2 routes Next.js API isolées | Node.js/Express + PostgreSQL | **À créer intégralement** |

---

## 5. Diagnostic technique global et lacunes critiques

### 5.1. Absence du mécanisme clé de séquestre physique (`SendaEscrow`)
Le document de cadrage `PLANSENDA.pdf` stipule explicitement que SENDA est une marketplace d'**artisanat physique**. L'acheteur ne doit pas libérer les fonds immédiatement au clic, car l'objet physique doit être emballé, expédié et livré en RDC ou à l'international.
* **État constaté :** Le code du Dépôt A effectue un swap atomique instantané où l'argent part immédiatement chez le vendeur dès la signature de la transaction.
* **Risque :** Si ce modèle était conservé, l'acheteur n'aurait aucune garantie de livraison physique, violant la proposition de valeur centrale de SENDA.
* **Action requise :** Créer le contrat `SendaEscrow.sol` implémentant le cycle d'états formel : `Created` -> `Funded` -> `Released` (ou `Refunded`).

### 5.2. Absence du jeton de paiement de test (`SendaTestToken`)
`PLANSENDA.pdf` exige des paiements via un jeton de test ERC-20 afin de découpler les tests de la volatilité et du coût du token natif MATIC/POL.
* **État constaté :** Les deux dépôts utilisent exclusivement `msg.value` (monnaie native du réseau).
* **Action requise :** Créer un contrat standard ERC-20 `SendaTestToken.sol` avec fonction de faucet/distribution pour les utilisateurs du testnet Polygon Amoy.

### 5.3. Absence totale de la couche Backend (API Express + PostgreSQL)
La section 7 de `PLANSENDA.pdf` définit un schéma de données rigoureux (`users`, `categories`, `artworks`, `nft_records`, `orders`, `escrow_records`) et une suite d'endpoints REST (`/api/artworks`, `/api/orders`, `/api/artisans/verification`, `/api/health`).
* **État constaté :** Aucun serveur Node.js/Express n'a été initialisé. Aucun schéma PostgreSQL ni fichier de migration Prisma/Knex/TypeORM n'est présent.
* **Action requise :** Mettre en place l'architecture backend recommandée sous `backend/` avec Express, TypeScript, validation Zod et couche d'accès aux données PostgreSQL.

### 5.4. Rupture de la chaîne IPFS dans le frontend moderne
Le Dépôt A (Next.js 14) dispose d'une interface de minting complète, mais celle-ci génère un Data URI base64 injecté directement dans le contrat.
* **État constaté :** Le code ignore le stockage décentralisé IPFS, tandis que le Dépôt B contient un script `upload.js` utilisant Pinata mais isolé dans une ancienne version Next.js.
* **Action requise :** Intégrer l'upload d'images et de métadonnées IPFS via le SDK Pinata dans le flux de publication du Dépôt A.

### 5.5. Absence de personnalisation métier (Branding et données congolaises)
Toutes les pages web actuelles affichent un thème "Aetheria / Cyberpunk" en décalage total avec la charte graphique définie dans `PLANSENDA.pdf` (palette Vert profond `#1B4332`, Ocre artisanal `#C86D3B`, Beige clair `#F8F5F0`).
* **Action requise :** Mettre à jour les variables Tailwind CSS, remplacer les mock data par des objets artisanaux authentiques et réorganiser la navigation pour l'acheteur et l'artisan congolais.

---

## 6. Conclusion du diagnostic

Le projet SENDA ne part pas d'une page blanche : il dispose, à travers `NFT-market-Place-main`, d'un socle applicatif moderne et bien typé (Next.js 14, Tailwind, Wagmi v2, Hardhat, Solidity 0.8.24) et, à travers `nft-marketplace-main`, d'une référence d'intégration Pinata/IPFS. 

Cependant, **le travail de cadrage, de personnalisation métier, de sécurisation et de développement du séquestre physique reste entièrement à documenter et à implémenter**.

La documentation professionnelle produite dans les dossiers suivants servira de référence d'ingénierie absolue pour piloter le développement et la convergence vers le produit final SENDA.
