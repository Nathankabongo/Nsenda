# AUDIT TECHNIQUE INITIAL ET PLAN D'EXÉCUTION — PROJET SENDA
## Université de Kinshasa (UNIKIN) — Faculté des Sciences et Technologies
**Master 1 Informatique — Mention Mathématiques, Statistiques et Informatique**  
**Cours :** Blockchain et Cryptomonnaies  
**Groupe 02 :** Kabongo Mukola Nathan | Losongo Kingombe Victor | Tuasansilu Lufuma Benie  
**Date d'audit :** 25 Octobre 2026  
**Workspace :** `D:\SENDA`

---

## 1. CADRE MÉTHODOLOGIQUE DE L'AUDIT

Cet audit technique examine exhaustivement l'état réel du code, des contrats intelligents, des API REST, du frontend Next.js, de la base de données et des mécanismes de sécurité du projet **SENDA** (« *L'artisanat congolais, authentifié et valorisé.* »).

Conformément aux directives d'ingénierie logicielle, chaque composant est classé selon l'une des quatre catégories suivantes :
- **Opérationnel** : Fonctionnel, testé et validé par preuve d'exécution directe.
- **Incomplet** : Partiellement implémenté ou nécessitant un raccordement d'interface.
- **Défectueux** : Présent mais comportant des erreurs de logique, de typage ou de sécurité.
- **Absent** : Requis par le cahier des charges mais non encore implémenté dans le workspace.

---

## 2. ÉTAT DES LIEUX DÉTAILLÉ DU SYSTÈME

### A. Smart Contracts Solidity & Architecture Blockchain (`packages/contracts`)
- **Opérationnel :**
  - `contracts/SendaTestToken.sol` : Jeton ERC-20 (`STT`) avec fonction de robinet public (`faucet`) limitée à 100 STT / 24 heures par adresse, prévenant l'épuisement des fonds de test.
  - `contracts/SendaNFT.sol` : Certificat d'authenticité ERC-721 intégrant le standard de redevance ERC-2981 (`royaltyInfo`), avec plafond strict de redevances artisanales fixé à 10% (1000 bps) et contrôle de pause (`Pausable`).
  - `contracts/SendaEscrow.sol` : Contrat de séquestre physique implémentant le pattern *Checks-Effects-Interactions* (CEI) et `ReentrancyGuard`, supportant la consignation (`depositPayment`), la libération (`confirmReceiptAndRelease`) et le remboursement (`refundBuyer`).
  - Suite de tests Hardhat `test/SendaEscrow.test.ts` : 9 tests unitaires automatisés validés avec succès (0 échec, temps d'exécution ~16s).
- **Incomplet :**
  - Script de déploiement et d'initialisation complet pour le réseau public Polygon Amoy (`scripts/deploy.ts`) avec vérification Etherscan/Polygonscan automatisée.
- **Défectueux :**
  - Aucun bogue bloquant identifié dans les contrats `Senda*.sol`. Les anciens contrats d'exemple hérités (`Aether*.sol`) doivent être archivés pour éviter toute confusion dans les artéfacts de compilation.
- **Absent :**
  - Mécanisme de résolution des litiges par arbitre administrateur on-chain (`resolveDispute(orderId, refundBuyer)`).

### B. Backend API REST & Intégration IPFS (`backend`)
- **Opérationnel :**
  - Serveur HTTP Express fonctionnel sur le port 4000 avec middlewares `helmet`, `cors` et `express.json()`.
  - Route de santé `GET /api/health` renvoyant le statut UP, le réseau cible `polygon-amoy` et le chainId `80002`.
  - Catalogue des 8 œuvres artisanales authentiques congolaises accessible via `GET /api/artworks` avec filtres par catégorie, province et recherche textuelle.
  - Service Pinata IPFS (`services/pinataService.ts`) pour l'épinglage des photographies et des manifestes JSON de métadonnées.
- **Incomplet :**
  - Les contrôleurs d'authentification applicative étaient jusqu'ici dissociés du cycle de signature Web3.
  - Persistance hybride en mémoire : fonctionnelle pour le développement rapide, mais nécessite des adaptateurs stricts pour la persistance PostgreSQL/Prisma lors de la mise en production.
- **Défectueux :**
  - L'endpoint `POST /api/artisans/verification` enregistrait les dossiers sans vérification cryptographique préalable de la clé privée de l'artisan demandeur.
- **Absent :**
  - **Module d'authentification complète (Auth RBAC)** : Inscription/Connexion avec mots de passe hachés, génération de tokens JWT signés, gestion des 3 rôles (`VISITOR`, `BUYER`, `ARTISAN`, `ADMIN`).
  - **Système de liaison cryptographique du Wallet (Proof-of-Ownership)** : Émission d'un nonce/challenge aléatoire et vérification cryptographique de la signature `personal_sign` via `viem.verifyMessage` avant toute association de portefeuille.
  - **Routes d'administration dédiées** : Consultation des dossiers en attente (`GET /api/admin/verifications`), validation/rejet avec motif écrit obligatoire (`POST /api/admin/verifications/:id/review`), et suivi des litiges du séquestre.

### C. Frontend Next.js & Expérience Utilisateur (`apps/web`)
- **Opérationnel :**
  - Application Next.js 14 (App Router) active sur `http://localhost:3000`.
  - Design system raffiné respectant l'identité congolaise (Palette Wengé `#1B4332`, Ocre Kasaï `#C86D3B`, Cuivre de Kolwezi, Ivoire `#F8F5F0`).
  - Galerie photographique haute résolution d'artisanat congolais (Masque Pende, Statuette Tshokwe, Textile Shoowa, Malachite de Kolwezi, etc.) sans recadrage abusif (`object-contain`).
  - Composant `BuyModal` raccordé au contrat de séquestre `SendaEscrow` avec approbation préalable du token `STT`.
  - Espace utilisateur `/my-nfts` affichant les commandes en cours et permettant la confirmation de livraison physique.
  - En-tête de navigation épuré (64px de hauteur) intégrant le bouton interactif de faucet `STT` et RainbowKit.
- **Incomplet :**
  - Fiche détail de l'œuvre (`app/nft/[id]/page.tsx`) : doit afficher les métadonnées de traçabilité culturelle et le lien de certification IPFS.
- **Défectueux :**
  - Absence de protection des routes côté client selon le rôle de l'utilisateur.
- **Absent :**
  - Pages d'authentification applicative : `/login` et `/register`.
  - Espace d'administration protégé : `/admin` accessible uniquement au rôle `ADMIN` pour valider/rejeter les artisans avec justification écrite.
  - Formulaire de demande de certification artisanale (`/artisan/verify`) avec liaison de portefeuille signée.

---

## 3. INCOHÉRENCES IDENTIFIÉES ENTRE LES COUCHES

1. **Modèle de Confiance Wallet vs Compte :**
   - *Constat :* Dans la version initiale du prototype, la simple connexion d'un portefeuille Web3 permettait de déclarer une adresse d'artisan sans validation d'identité applicative préalable.
   - *Correction :* Dissocier strictement le compte utilisateur (email/mot de passe/profil) du portefeuille Web3. Exiger la signature cryptographique d'un nonce unique généré par le backend avant d'attribuer des privilèges de vente ou de certification à une adresse.

2. **Cycle de Vie du Séquestre :**
   - *Constat :* L'état du séquestre dans le smart contract (`Created`, `Funded`, `Released`, `Refunded`) doit être répercuté fidèlement dans le backend sous forme d'états d'ordres (`INITIALIZED`, `ESCROW_LOCKED`, `SHIPPED`, `DELIVERED_RELEASED`, `REFUNDED`).
   - *Correction :* Maintien d'un hachage déterministe `orderIdHex = keccak256(orderUuid)` partagé entre la base de données et l'EVM.

---

## 4. PLAN D'EXÉCUTION PRIORISÉ

| Phase | Domaine | Actions concrètes | Responsable |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Backend & Sécurité** | Implémenter le hachage sécurisé des mots de passe (`scrypt`), la gestion JWT, les nonces de signature Web3 (`viem.verifyMessage`), et le contrôle d'accès RBAC (3 rôles). | Tuasansilu Lufuma Benie |
| **Phase 2** | **Backend & Admin** | Créer les routes d'administration `/api/admin/*` pour la revue des artisans avec justification écrite et modération des œuvres. | Tuasansilu Lufuma Benie |
| **Phase 3** | **Frontend & UI/UX** | Développer les pages `/login`, `/register`, le composant de profil/liaison de portefeuille avec signature MetaMask, et le panneau `/admin`. | Kabongo Mukola Nathan |
| **Phase 4** | **Smart Contracts** | Déployer la fonction d'arbitrage de litige dans `SendaEscrow.sol` et exécuter la suite de tests unitaires complète. | Losongo Kingombe Victor |
| **Phase 5** | **Assurance Qualité & Tests** | Écrire et exécuter le script de tests d'intégration backend automatisés, vérifier la conformité de sécurité (audit de reentrancy et validations). | Équipe Groupe 02 |
| **Phase 6** | **Documentation & Soutenance** | Produire le guide de démonstration pour le jury académique UNIKIN, incluant les identifiants de test préconfigurés et les étapes de vérification. | Équipe Groupe 02 |
