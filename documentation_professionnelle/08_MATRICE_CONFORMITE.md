# SENDA — MATRICE DE CONFORMITÉ & ANALYSE DES ÉCARTS
**Évaluation Comparative : Spécifications PLANSENDA.pdf vs Code Existant dans D:\SENDA**  
**Projet :** SENDA — Marketplace décentralisée de l'artisanat congolais  
**Version :** 1.0 — Audit de Conformité  
**Date d'évaluation :** Octobre 2026  
**Document source :** `PLANSENDA.pdf`  
**Auteurs :** Équipe Projet SENDA (Groupe 02 — Master 1 Informatique)  

---

## 1. Méthodologie d'évaluation

Pour évaluer l'état réel du projet sans complaisance, chaque exigence issue de `PLANSENDA.pdf` est passée au crible de l'analyse du code source présent dans `D:\SENDA`. 

Chaque élément est classé selon l'une des cinq catégories normalisées :
* **[V] Implémentée et vérifiée :** Le code existe, correspond aux spécifications SENDA, et des tests automatisés ou vérifications confirment son fonctionnement.
* **[NV] Implémentée, mais non vérifiée :** Le code est présent, mais il manque une preuve formelle d'exécution ou de tests de couverture.
* **[P] Partiellement implémentée :** Une fraction du code existe (ex: une interface sans logique métier ou un contrat sans connexion API).
* **[NI] Non implémentée :** Aucune réalisation pertinente n'a été identifiée dans l'espace de travail.
* **[AC] À clarifier :** Des incohérences ou des versions divergentes empêchent de conclure sans décision d'arbitrage.

---

## 2. Matrice d'évaluation des Exigences Fonctionnelles (FR)

| ID | Exigence Fonctionnelle | Priorité | État dans `D:\SENDA` | Preuve dans le code existant | Écart constaté / Divergence | Action corrective requise | Responsable |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- | :---: |
| **FR-01** | Connexion portefeuille MetaMask / EIP-1193 | **P0** | **[P]** | `apps/web/lib/wagmi.ts`, `Providers.tsx` | Le composant RainbowKit / Wagmi v2 fonctionne mais est configuré sur une interface générique "Aetheria". | Adapter les modales et boutons à l'identité visuelle SENDA. | Nathan |
| **FR-02** | Consulter le catalogue des œuvres | **P0** | **[P]** | `apps/web/app/page.tsx` | La grille existe mais utilise des fausses données de science-fiction (`INITIAL_DEMO_NFTS`), sans backend PostgreSQL. | Brancher la grille sur l'API `/api/artworks` et afficher des œuvres congolaises. | Nathan / Benie |
| **FR-03** | Consulter la fiche détaillée d'une œuvre | **P0** | **[P]** | `apps/web/app/nft/[id]/page.tsx` | La page détaille un NFT mais ne distingue pas les données déclarées, vérifiées et on-chain. | Restructurer la fiche selon la maquette tripartite SENDA. | Nathan |
| **FR-04** | Publier une œuvre en tant qu'artisan autorisé | **P0** | **[P]** | `apps/web/app/create/page.tsx` | Le formulaire de création existe mais **n'importe qui peut minter** (absence de vérification du rôle artisan). | Ajouter le contrôle d'accès `isVerifiedArtisan` avant soumission. | Nathan / Benie |
| **FR-05** | Enregistrer les photos et métadonnées sur IPFS | **P0** | **[P]** | Présent dans Dépôt B (`upload.js`), mais **absent** du Dépôt A (`create/page.tsx`) | `create/page.tsx` crée un Data URI base64 inlined sans envoyer sur IPFS. Dépôt B a le script Pinata mais non relié à Next.js 14. | Transposer la logique Pinata de Dépôt B dans le backend Express / route API Next.js 14. | Benie |
| **FR-06** | Créer un NFT ERC-721 associé à l'œuvre | **P0** | **[NV]** | `packages/contracts/contracts/AetherNFT.sol` | Le contrat ERC-721 + ERC-2981 existe et est bien écrit, mais porte le nom `AetherNFT` et manque du rôle d'artisan. | Renommer en `SendaNFT.sol`, ajouter le rôle `ARTISAN_MINTER` et redéployer sur Amoy. | Victor |
| **FR-07** | Acheter avec un jeton de test ERC-20 | **P0** | **[NI]** | Aucun contrat ERC-20 présent dans `D:\SENDA` | Le code existant (`AetherMarketplace.sol`) achète exclusivement avec la monnaie native (`msg.value`). | Développer et déployer `SendaTestToken.sol` (`STT`) avec fonction faucet. | Victor |
| **FR-08** | Bloquer les fonds dans un contrat de séquestre | **P0** | **[NI]** | Aucun contrat de séquestre physique présent | `AetherMarketplace.sol` fait un swap atomique instantané (*escrow-free*), inadapté à la vente d'un bien artisanal physique. | Développer `SendaEscrow.sol` avec états `Created -> Funded -> Released`. | Victor |
| **FR-09** | Confirmer la réception et libérer les fonds | **P0** | **[NI]** | Inexistant dans les deux dépôts | Aucune méthode ni écran ne permet à l'acheteur d'attester la réception d'un colis physique pour libérer les fonds. | Implémenter `confirmReceiptAndRelease()` dans `SendaEscrow` et le composant React dédié. | Victor / Nathan |
| **FR-10** | Afficher l'état et l'historique de commande | **P0** | **[P]** | `apps/web/app/my-nfts/page.tsx` | Affiche les NFT possédés mais ne propose aucun suivi de commande en cours sous séquestre. | Développer l'écran de suivi des commandes (`/my-orders`). | Nathan / Benie |
| **FR-11** | Déclarer des redevances ERC-2981 | **P1** | **[V]** | `AetherNFT.sol` (lignes 23-100) & `test/AetheriaMarketplace.test.ts` | La norme EIP-2981 est parfaitement codée et testée avec succès dans le Dépôt A. | Conserver l'implémentation et l'intégrer dans `SendaNFT.sol`. | Victor |
| **FR-12** | Vérifier les artisans et les œuvres | **P1** | **[NI]** | Aucune table ni endpoint dans `D:\SENDA` | Aucun module de vérification administrative n'est programmé. | Créer la table `users`, l'endpoint `/api/artisans/verification` et le badge frontend. | Benie / Nathan |
| **FR-13** | Proposer des recherches et filtres avancés | **P2** | **[P]** | `apps/web/app/page.tsx` | Filtres par catégorie et tri par prix existants, mais sans catégories congolaises ni recherche par région. | Enrichir les filtres avec les régions de RDC et les matériaux artisanaux. | Nathan |

---

## 3. Matrice d'évaluation de l'Architecture Technique & Données

| Composant architectural | Spécification `PLANSENDA.pdf` | État réel dans `D:\SENDA` | Écart constaté | Action requise |
| :--- | :--- | :---: | :--- | :--- |
| **Serveur Backend API** | Node.js / Express en TypeScript | **[NI]** | Aucun serveur backend Express n'a été initialisé. | Initialiser le sous-dossier `backend/` avec Express, Zod et SIWE. |
| **Base de Données** | PostgreSQL 15+ relationnelle | **[NI]** | Aucun schéma SQL, fichier de migration ni client ORM présent. | Écrire le schéma `schema.prisma` avec les 6 tables définies et initialiser PostgreSQL. |
| **Smart Contract Escrow** | `SendaEscrow.sol` (Séquestre) | **[NI]** | `AetherMarketplace.sol` est un marketplace à swap direct sans séquestre. | Écrire `SendaEscrow.sol` conforme aux exigences physiques. |
| **Smart Contract Token** | `SendaTestToken.sol` (ERC-20) | **[NI]** | Aucun jeton ERC-20 n'existe dans les dépôts. | Écrire `SendaTestToken.sol` avec faucet. |
| **Smart Contract NFT** | `SendaNFT.sol` (ERC-721 + ERC-2981)| **[P]** | Présent sous le nom `AetherNFT.sol`. | Adapter le nom, symboles et rôles de minter. |
| **Tests automatisés** | Hardhat / Chai couvrant le séquestre | **[P]** | 13 tests existants mais couvrent uniquement `AetherMarketplace`. | Écrire les tests unitaires spécifiques à `SendaEscrow`. |
| **Audit de sécurité** | Slither | **[NI]** | Aucun rapport ni script Slither présent. | Configurer et exécuter Slither sur les contrats finaux. |
| **Identité Visuelle** | Vert profond, Ocre artisanal, Beige | **[NI]** | Thème cyberpunk sombre avec cyan `#00f2fe`. | Refondre la configuration Tailwind CSS aux couleurs SENDA. |

---

## 4. Bilan synthétique des taux de réalisation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TAUX D'ALIGNEMENT AVEC LE MVP                         │
├───────────────────────────────┬─────────────────────────────┬───────────────┤
│ Domaine Technique             │ Taux d'Alignement Réel      │ Statut        │
├───────────────────────────────┼─────────────────────────────┼───────────────┤
│ Frontend (Next.js 14 / Web3)  │ ██████████░░░░░░░░░░  50%   │ Partiel       │
│ Smart Contracts & Blockchain  │ ██████░░░░░░░░░░░░░░  30%   │ À refactorer  │
│ Backend API (Node / Express)  │ ░░░░░░░░░░░░░░░░░░░░   0%   │ À créer       │
│ Base de Données (PostgreSQL)  │ ░░░░░░░░░░░░░░░░░░░░   0%   │ À créer       │
│ Stockage IPFS / Pinata        │ ████████░░░░░░░░░░░░  40%   │ À intégrer    │
│ Identité Visuelle & Métier    │ ░░░░░░░░░░░░░░░░░░░░   0%   │ À refondre    │
├───────────────────────────────┼─────────────────────────────┼───────────────┤
│ TOTAL GLOBAL DU PROJET        │ ████░░░░░░░░░░░░░░░░  20%   │ Phase Cadrage │
└───────────────────────────────┴─────────────────────────────┴───────────────┘
```

### Conclusion de l'évaluation
Les fichiers trouvés dans `D:\SENDA` offrent une **base de départ technologique accélératrice** (la couche Next.js 14 / Wagmi v2 et l'ERC-721 avec royalties sont de grande qualité), mais **le cœur métier de SENDA (le séquestre physique, le jeton de test, le backend de traçabilité et l'identité congolaise) doit être formellement construit** selon la feuille de route établie dans `07_PLAN_IMPLEMENTATION.md`.
