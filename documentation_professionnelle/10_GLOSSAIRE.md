# SENDA — GLOSSAIRE TECHNIQUE ET TERMINOLOGIQUE
**Répertoire des Termes Blockchain, E-commerce, Génie Logiciel et Artisanat Congolais**  
**Projet :** SENDA — Marketplace décentralisée de l'artisanat congolais  
**Version :** 1.0 — Référentiel Terminologique  
**Document source :** `PLANSENDA.pdf`  
**Auteurs :** Équipe Projet SENDA (Groupe 02 — Master 1 Informatique)  

---

## 1. Terminologie Blockchain et Web3

* **Allowance (Approbation) :** Autorisation accordée par le titulaire d'un jeton ERC-20 à un contrat intelligent (ex: `SendaEscrow`) pour prélever un montant maximal défini sur son solde via la méthode `approve`.
* **CID (Content Identifier) :** Identifiant cryptographique unique généré par hachage du contenu d'un fichier dans le réseau IPFS. Toute modification du contenu génère un CID différent, assurant l'immuabilité des métadonnées.
* **Contrat Intelligent (Smart Contract) :** Programme autonome déployé sur la blockchain Ethereum/Polygon qui s'exécute de façon déterministe et inviolable lorsque des conditions prédéfinies sont satisfaites.
* **EIP-2981 (NFT Royalty Standard) :** Standard Ethereum permettant à un contrat ERC-721 de déclarer formellement le pourcentage de redevance revenant au créateur d'origine lors des reventes secondaires, ainsi que l'adresse de paiement associée.
* **EIP-4361 / SIWE (Sign-In with Ethereum) :** Protocole d'authentification standard permettant à un utilisateur de prouver la possession d'un portefeuille Web3 auprès d'un serveur web traditionnel en signant cryptographiquement un message contenant un nonce à usage unique.
* **ERC-20 :** Standard technique régissant les jetons fongibles et interchangeables sur les blockchains compatibles EVM. Utilisé dans SENDA pour le jeton de test `SendaTestToken` (`STT`).
* **ERC-721 :** Standard technique régissant les jetons non fongibles (NFT) représentant des actifs uniques et non interchangeables. Utilisé pour certifier l'enregistrement numérique des œuvres artisanales.
* **EVM (Ethereum Virtual Machine) :** Environnement d'exécution global et décentralisé qui traite l'état et exécute les bytecodes des smart contracts sur les réseaux compatibles (Ethereum, Polygon, BNB Chain, etc.).
* **Frais de Gaz (Gas Fees) :** Unité de mesure de l'effort de calcul nécessaire à l'exécution d'une transaction ou d'un contrat sur la blockchain, payée en jeton natif du réseau (POL / MATIC sur Polygon).
* **IPFS (InterPlanetary File System) :** Protocole de communication et réseau pair-à-pair distribué conçu pour stocker et partager des fichiers selon leur empreinte cryptographique (adressage par contenu).
* **MetaMask :** Portefeuille cryptographique logiciel et extension de navigateur permettant d'interagir de manière sécurisée avec les applications décentralisées (dApps).
* **Minting (Frappe) :** Action cryptographique consistant à créer un nouveau jeton sur la blockchain en enregistrant son identifiant unique et son détenteur initial.
* **Pinata :** Service cloud de pinning géré assurant que les fichiers téléversés sur IPFS restent disponibles et répliqués 24h/24 sans risque de purge du cache.
* **Polygon Amoy :** Réseau de test public officiel (Testnet) de Polygon déployé sur la machine virtuelle Ethereum, utilisant des fonds de démonstration sans valeur marchande.
* **Réentrance (Reentrancy Attack) :** Type d'attaque informatique sur un contrat intelligent dans laquelle un contrat attaquant réappelle une fonction du contrat cible avant que la première exécution n'ait finalisé la mise à jour de ses variables d'état financier.
* **Token ID :** Entier unique identifiant sans ambiguïté un NFT au sein d'un contrat ERC-721 donné.

---

## 2. Concepts de Séquestre et E-Commerce Décentralisé

* **Escrow (Séquestre décentralisé) :** Mécanisme contractuel par lequel un tiers de confiance autonome (un smart contract) consigne des fonds jusqu'à ce que les obligations réciproques (livraison physique conforme) soient certifiées.
* **Escrow-Free (Swap Atomique Direct) :** Modèle de transaction dans lequel l'actif et le paiement sont échangés de manière instantanée et simultanée dans une seule transaction blockchain (approprié aux biens 100% numériques, inadapté aux colis physiques nécessitant un transport postal).
* **Machine à états de commande :** Enchaînement formel et ordonné des phases de vie d'une transaction :
  * `Created` : Commande initialisée dans la base applicative.
  * `Funded` : Fonds sécurisés et consignés dans le contrat de séquestre.
  * `Released` : Fonds transférés à l'artisan suite à la validation physique de l'acheteur.
  * `Refunded` : Fonds retournés à l'acheteur suite à l'annulation ou à la forclusion d'une commande.
* **Patron Checks-Effects-Interactions :** Règle de programmation défensive exigeant qu'un smart contract vérifie d'abord les préconditions (*Checks*), modifie immédiatement son état interne (*Effects*), puis effectue les transferts vers les adresses externes en dernier (*Interactions*).

---

## 3. Technologies Logicielles et Outils de Développement

* **Hardhat :** Environnement de développement et de simulation pour compiler, déployer et tester des smart contracts Ethereum en local et sur testnet.
* **Next.js 14 (App Router) :** Framework React moderne permettant la séparation entre Server Components (rendus côté serveur) et Client Components (interactifs côté navigateur).
* **PostgreSQL :** Système de gestion de base de données relationnelle objet robuste, assurant la persistance des données applicatives off-chain et le respect des propriétés ACID.
* **Prisma :** ORM (Object-Relational Mapping) moderne pour Node.js et TypeScript facilitant la modélisation déclarative et les migrations de schéma.
* **Slither :** Outil d'analyse statique de sécurité conçu par Trail of Bits pour auditer le code source Solidity et détecter automatiquement des dizaines de classes de vulnérabilités.
* **Tailwind CSS :** Framework de style utilitaire permettant de composer rapidement des interfaces personnalisées sans quitter le code JSX/TSX.
* **TypeChain :** Outil générant automatiquement des liaisons TypeScript fortement typées à partir des ABI des contrats Solidity.
* **Viem :** Bibliothèque bas niveau TypeScript ultra-rapide et modulaire pour interagir avec l'EVM, successeur moderne d'ethers.js.
* **Wagmi v2 :** Suite de hooks React construits sur Viem pour simplifier la gestion des portefeuilles, la signature de messages et l'appel de smart contracts.
* **Zod :** Bibliothèque de déclaration et de validation de schémas TypeScript garantissant la conformité stricte des charges utiles HTTP.

---

## 4. Vocabulaire Métier et Patrimoine Artisanal Congolais

* **Artisanat d'Art Congolais :** Ensemble des productions manuelles et manufacturées de RDC possédant une haute dimension esthétique, traditionnelle, rituelle ou identitaire.
* **Bakongo :** Groupe ethnoculturel vivant principalement dans le Kongo Central et à Kinshasa, réputé pour sa statuaire protectrice (Minkisi) et sa sculpture figurative.
* **Bois de Wengé :** Bois précieux tropical très dense, de couleur sombre presque noire avec des veines fines, abondamment utilisé par les sculpteurs congolais pour sa dureté et sa patine naturelle.
* **Kuba / Shoowa :** Royaume historique et tradition textile du Kasaï réputés mondialement pour leurs tissus de velours du Kasaï (fibres de raphia brodées aux motifs géométriques abstraits).
* **Malachite :** Pierre minérale ornementale d'un vert intense rubané, emblématique de la région du Katanga, polie et façonnée par les artisans en bijoux, boîtes et objets d'art.
* **Masque Pende (Mbuya) :** Masque traditionnel du peuple Pende (Grand Bandundu) sculpté dans le bois et orné de fibres de raphia, incarnant différents personnages de la société traditionnelle.
* **Raphia :** Fibre textile végétale naturelle extraite des jeunes feuilles de palmier raphia, matière première de la vannerie d'art et des tissages ancestraux congolais.
* **Traçabilité Patrimoniale :** Capacité à reconstituer historiquement l'origine géographique d'une œuvre, l'atelier de l'artisan créateur et la chronologie de ses détenteurs successifs sans altération possible.
