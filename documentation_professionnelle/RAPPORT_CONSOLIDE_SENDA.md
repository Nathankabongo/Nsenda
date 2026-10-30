# RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
# ÉCOLE DE FORMATION SUPÉRIEURE EN INFORMATIQUE
### MASTER 1 EN INFORMATIQUE — ANNÉE ACADÉMIQUE 2026–2027

---

<br/><br/><br/>

# RAPPORT CONSOLIDÉ DE CADRAGE FONCTIONNEL, TECHNIQUE ET ARCHITECTURAL

# **SENDA**
## *Marketplace Décentralisée de l'Artisanat Congolais*
### *« L'artisanat congolais, authentifié et valorisé »*

<br/><br/>

**Équipe Projet — Groupe 02 :**
* **Kabongo Mukola Nathan** (Frontend et intégration Web3)
* **Losongo Kingombe Victor** (Blockchain et contrats intelligents)
* **Tuasansilu Lufuma Benie** (Backend, IPFS et assurance qualité)

**Document Directeur de Référence :** `PLANSENDA.pdf`  
**Date d'édition :** Octobre 2026  
**Statut du Document :** Version Consolidée Officielle — Ingénierie & Spécifications

<br/><br/><br/>

---

## TABLE DES MATIÈRES GÉNÉRALE

1. **Chapitre 0 : Inventaire Technique et Diagnostic de l'Existant dans `D:\SENDA`**
   - 1.1 Contexte et méthode d'audit
   - 1.2 Vue d'ensemble du répertoire et cartographie des sous-projets
   - 1.3 Inventaire détaillé des composants (Dépôts A et B)
   - 1.4 Diagnostic des lacunes critiques
2. **Chapitre 1 : Présentation Générale du Projet**
   - 2.1 Résumé exécutif
   - 2.2 Contexte et justification
   - 2.3 Problématique détaillée
   - 2.4 Vision, mission et objectifs
   - 2.5 Solution proposée et architecture tripartite
   - 2.6 Valeur ajoutée comparative
   - 2.7 Utilisateurs cibles et rôles
   - 2.8 Périmètre du MVP et limites fondamentales
3. **Chapitre 2 : Product Requirements Document (PRD)**
   - 3.1 Personas utilisateurs
   - 3.2 Matrice des exigences fonctionnelles (FR-01 à FR-13)
   - 3.3 Exigences non fonctionnelles (NFR-01 à NFR-07)
   - 3.4 Règles métier fondamentales (BR-01 à BR-06)
   - 3.5 Spécification détaillée des cas d'utilisation
   - 3.6 Scénario détaillé de référence : achat physique sous séquestre
   - 3.7 Critères d'acceptation opérationnels (AC-01 à AC-08)
4. **Chapitre 3 : Technical Requirements Document (TRD)**
   - 4.1 Architecture générale 4 couches
   - 4.2 Justification des choix technologiques
   - 4.3 Architecture Frontend (Next.js 14 App Router, Wagmi v2, Viem)
   - 4.4 Architecture Backend (Node.js/Express, PostgreSQL, SIWE)
   - 4.5 Gestion du stockage décentralisé (IPFS / Pinata)
   - 4.6 Politiques de sécurité et d'étanchéité des secrets
5. **Chapitre 4 : Spécifications UI/UX et Design System**
   - 5.1 Identité visuelle et intention créative
   - 5.2 Palette chromatique officielle (Vert profond, Ocre, Beige)
   - 5.3 Typographie et hiérarchie de l'information
   - 5.4 Architecture de navigation
   - 5.5 Description des pages et composants clés
   - 5.6 Diagrammes de flux applicatif (AppFlow Acheteur & Artisan)
   - 5.7 Principes d'utilisabilité et d'accessibilité
6. **Chapitre 5 : Architecture Blockchain et Contrats Intelligents**
   - 6.1 Cartographie des contrats Solidity sur Polygon Amoy
   - 6.2 Spécification de `SendaNFT.sol` (ERC-721 + ERC-2981)
   - 6.3 Spécification de `SendaTestToken.sol` (ERC-20 de simulation)
   - 6.4 Spécification du séquestre `SendaEscrow.sol` (Machine à états)
   - 6.5 Diagrammes de séquence nominaux (Publication et Achat)
   - 6.6 Analyse critique du standard de royalties ERC-2981
   - 6.7 Mesures de sécurité et plan d'audit Slither
7. **Chapitre 6 : Modèle de Données et Contrats d'Interface API**
   - 7.1 Répartition stratégique des espaces de persistance
   - 7.2 Schéma Conceptuel et Entité-Association (ERD)
   - 7.3 Dictionnaire détaillé des tables relationnelles PostgreSQL
   - 7.4 Spécifications formelles des Endpoints REST
   - 7.5 Authentification cryptographique SIWE (EIP-4361)
8. **Chapitre 7 : Plan d'Implémentation et Feuille de Route**
   - 8.1 Découpage des 6 phases de développement
   - 8.2 Ordre de priorité recommandé (Parcours Minimal Vital)
   - 8.3 Répartition des responsabilités (Nathan, Victor, Benie)
   - 8.4 Organisation du dépôt GitHub et gestion des branches
9. **Chapitre 8 : Matrice de Conformité et Analyse des Écarts**
   - 9.1 Matrice d'évaluation des exigences (PLANSENDA vs D:\SENDA)
   - 9.2 Analyse des divergences architecturales
   - 9.3 Taux d'alignement réel par domaine
10. **Chapitre 9 : Gestion des Risques et Recommandations Stratégiques**
    - 10.1 Cartographie et matrice d'impact
    - 10.2 Analyse des risques critiques (Décorrélation physique, Séquestre, IPFS, RGPD)
    - 10.3 Recommandations prioritaires d'ingénierie
11. **Chapitre 10 : Glossaire Technique et Terminologique**

---

<br/><br/>

## CHAPITRE 0 : INVENTAIRE TECHNIQUE ET DIAGNOSTIC DE L'EXISTANT

### 0.1. Synthèse de l'Audit Local
L'audit récursif et méthodique mené dans l'espace de travail `D:\SENDA` révèle l'existence de deux sous-projets indépendants correspondant à des gabarits techniques préexistants :
1. **Dépôt A (`NFT-market-Place-main`) :** Une base monorepo Next.js 14 (App Router) + Wagmi v2 / RainbowKit + Hardhat / Solidity 0.8.24 intitulée "Aetheria NFT Marketplace". Ce dépôt intègre un contrat ERC-721 avec royalties ERC-2981 et une place de marché à swap atomique direct en devise native.
2. **Dépôt B (`nft-marketplace-main`) :** Un template open-source de 2022 basé sur Next.js 12 (Pages Router), Material UI et Solidity 0.8.4, contenant un script d'upload Pinata/IPFS sous `pages/api/upload.js`.

### 0.2. Constat d'Écart Majeur
Aucun fichier de `D:\SENDA` ne mentionne à ce jour l'artisanat congolais ni le nom du projet SENDA. Plus fondamentalement, **le contrat de vente existant (`AetherMarketplace.sol`) applique un modèle *escrow-free* (achat instantané en ligne pour biens numériques purs)**. Ce modèle est formellement incompatible avec la mission de SENDA qui impose **un contrat de séquestre physique (`SendaEscrow.sol`)** retenant les fonds jusqu'à ce que l'acheteur atteste avoir reçu le colis physique en bon état.

---

## CHAPITRE 1 : PRÉSENTATION GÉNÉRALE DU PROJET SENDA

### 1.1. Contexte et Problématique
La RDC regorge d'œuvres artisanales de premier plan (masques traditionnels Pende et Bakongo, statuaire Luba, velours du Kasaï, bijoux en malachite). Ce patrimoine est freiné par l'enclavement des ateliers, le manque de canaux de commercialisation internationaux équitables, les risques financiers bilatéraux (payer sans recevoir ou expédier sans garantie de paiement) et l'absence totale de traçabilité des reventes secondaires.

### 1.2. La Solution SENDA
SENDA répond à cette défaillance en créant une marketplace hybride articulant :
* Une vitrine e-commerce universelle et accessible (Next.js 14).
* Un certificat numérique décentralisé (NFT ERC-721 sur Polygon Amoy) pointant vers des métadonnées vérifiées sur IPFS via Pinata.
* Un protocole de séquestre décentralisé inviolable (`SendaEscrow.sol`) utilisant un jeton de test ERC-20 (`SendaTestToken.sol`).
* Un droit de suite numérique (ERC-2981) reversant 5% des reventes futures aux artisans.

---

## CHAPITRE 2 : PRODUCT REQUIREMENTS DOCUMENT (PRD)

### 2.1. Exigences Fonctionnelles Clés (P0 - MVP)
* **FR-01 (Connexion) :** Connexion portefeuille MetaMask avec détection automatique du réseau Polygon Amoy (Chain ID 80002).
* **FR-02 & FR-03 (Catalogue & Fiche) :** Consultation publique de la vitrine artisanale et des fiches détaillées distinguant données déclarées, données auditées et données on-chain.
* **FR-04, FR-05 & FR-06 (Publication, IPFS & NFT) :** Réservé aux artisans certifiés. Téléversement des photos et du manifeste JSON sur IPFS via Pinata, puis émission du jeton ERC-721.
* **FR-07 & FR-08 (Achat & Séquestre) :** Approbation du jeton de test ERC-20 `STT` puis dépôt sécurisé dans `SendaEscrow.sol`. Statut de commande : `Funded`.
* **FR-09 (Libération Conditionnelle) :** Déclenchée exclusivement par l'acheteur après livraison physique. Statut : `Released`. Les fonds sont transférés au vendeur.
* **FR-10 (Suivi) :** Tableau de bord de suivi de commande avec horodatages et hachages vérifiables sur Polygonscan.

---

## CHAPITRE 3 : ARCHITECTURE TECHNIQUE (TRD)

L'architecture est structurée en 4 couches coordonnées :
1. **Frontend Client :** Next.js 14, React 18, TypeScript, Tailwind CSS, Wagmi v2, Viem.
2. **Serveur Applicatif Off-Chain :** Node.js, Express, middleware SIWE (Sign-In with Ethereum), ORM Prisma.
3. **Stockage Décentralisé P2P :** IPFS orchestré via l'API de Pinata.
4. **Couche On-Chain :** Polygon Amoy, Solidity 0.8.24, OpenZeppelin v5, Hardhat.

**Règle d'or de l'API :** L'API backend ne possède aucune clé privée d'utilisateur et ne se substitue jamais aux signatures de transactions requises dans MetaMask.

---

## CHAPITRE 4 : DESIGN SYSTEM ET SPÉCIFICATIONS UI/UX

La charte visuelle s'appuie sur la trilogie chromatique définie dans `PLANSENDA.pdf` :
* **Vert Profond (`#1B4332`) :** Symbole de confiance, stabilité institutionnelle et rigueur.
* **Ocre Artisanal (`#C86D3B`) :** Évocation de la terre cuite, des bois tropicaux et de la chaleur artisanale.
* **Beige Clair (`#F8F5F0`) :** Fond neutre épuré garantissant un confort de lecture optimal.

L'interface sépare visuellement chaque fiche d'œuvre en trois volets de transparence :
1. Données déclarées par le créateur.
2. Contrôles physiques effectués lors de l'audit de l'atelier par SENDA.
3. Attestation cryptographique immuable enregistrée sur Polygon Amoy.

---

## CHAPITRE 5 : ARCHITECTURE BLOCKCHAIN ET SMART CONTRACTS

### 5.1. Le Séquestre Physique `SendaEscrow.sol`
Le contrat implémente la machine à états :
$$\text{Created} \xrightarrow{\text{depositPayment()}} \text{Funded} \xrightarrow{\text{confirmReceiptAndRelease()}} \text{Released}$$
$$\text{Funded} \xrightarrow{\text{refundBuyer() [Timeout / Litige]}} \text{Refunded}$$

Toutes les fonctions financières sont protégées par `ReentrancyGuard` et appliquent le patron *Checks-Effects-Interactions* pour interdire toute réentrance malveillante.

### 5.2. Redevances ERC-2981
Le contrat `SendaNFT.sol` expose `royaltyInfo(tokenId, salePrice)` pour reverser automatiquement 5% à l'artisan créateur sur le marché SENDA.

---

## CHAPITRE 6 : MODÈLE DE DONNÉES ET API REST

Base de données PostgreSQL relationnelle comprenant 6 tables :
* `users` (comptes, rôles, statut d'audit d'artisan).
* `categories` (sculpture, vannerie, peinture, textile, bijoux).
* `artworks` (fiches d'œuvres, prix en STT, URI IPFS, dimensions).
* `nft_records` (liaison artworkId, tokenId, contractAddress, mintTxHash).
* `orders` (commandes commerciales, acheteur, vendeur, montant).
* `escrow_records` (état du séquestre, tx de dépôt, tx de libération).

L'API REST expose 9 endpoints documentés : `/api/artworks`, `/api/orders`, `/api/artisans/verification`, `/api/health`, protégés par authentification SIWE (EIP-4361).

---

## CHAPITRE 7 : PLAN D'IMPLÉMENTATION ET ÉQUIPE

* **Phase 1 (Cadrage) :** Validée et consignée dans ce dossier.
* **Phase 2 (Fondations) :** Unification du dépôt, mise en place du backend Express et de PostgreSQL.
* **Phase 3 (Blockchain) :** Codage de `SendaNFT`, `SendaEscrow` et `SendaTestToken`, suite de tests automatisés Hardhat, déploiement sur Polygon Amoy.
* **Phase 4 (Frontend) :** Refonte aux couleurs de SENDA, intégration de la vitrine artisanale et studio de téléversement IPFS.
* **Phase 5 (Intégration) :** Connexion complète du parcours d'achat sous séquestre.
* **Phase 6 (Validation & Recette) :** Audit Slither, tests d'échec et préparation de la soutenance.

**Répartition officielle des rôles :**
* Kabongo Mukola Nathan : Frontend et intégration Web3
* Losongo Kingombe Victor : Blockchain et smart contracts
* Tuasansilu Lufuma Benie : Backend, IPFS et assurance qualité

---

## CHAPITRE 8 : MATRICE DE CONFORMITÉ

L'évaluation montre que le projet dispose déjà d'un socle technique Next.js 14 / Wagmi / OpenZeppelin v5 de grande qualité (représentant environ 50% de la brique interface et 30% des contrats génériques), mais que les fonctionnalités spécifiques à l'artisanat congolais (séquestre physique, devise de test, backend Express, persistance PostgreSQL et identité visuelle) sont à développer intégralement lors des phases 2 à 5.

---

## CHAPITRE 9 : GESTION DES RISQUES

Les 4 risques majeurs analysés et maîtrisés sont :
1. *Décorrélation physique/NFT :* Résolu par l'obligation d'un audit physique préalable des ateliers avant octroi du statut d'artisan vérifié.
2. *Fonds bloqués dans le séquestre :* Résolu par un mécanisme contractuel de délai de forclusion automatique et une procédure d'arbitrage.
3. *Disponibilité des médias IPFS :* Résolu par l'association d'un pinning professionnel garanti (Pinata) et d'un archivage miroir off-chain.
4. *Confidentialité des données personnelles :* Strictement préservée par le bannissement absolu de toute donnée nominative ou postale sur la blockchain publique.

---

## CHAPITRE 10 : GLOSSAIRE TECHNIQUE

Le glossaire répertorie et explicite les concepts de référence : EVM, ERC-721, ERC-20, ERC-2981, IPFS, CID, Pinning, Séquestre décentralisé, Reentrancy, Checks-Effects-Interactions, SIWE, Polygon Amoy, wengé, malachite, masques Pende et textiles Shoowa.

---

### CONCLUSION GÉNÉRALE DU RAPPORT

Le présent rapport consolidé démontre que le projet **SENDA** dispose désormais d'un cadre d'ingénierie complet, cohérent et scientifiquement fondé. En comblant le fossé entre l'artisanat physique congolais et les technologies de registres distribués, l'équipe SENDA est idéalement positionnée pour mener à bien le développement de son prototype sur Polygon Amoy, en conformité totale avec les objectifs d'excellence du Master 1 Informatique.
