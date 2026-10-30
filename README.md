# SENDA — Marketplace Décentralisée de l'Artisanat Congolais
> *« L'artisanat congolais, authentifié et valorisé. »*

**Université de Kinshasa (UNIKIN) — Faculté des Sciences et Technologies**  
**Mention :** Mathématiques, Statistiques et Informatique  
**Master 1 Informatique (2026–2027) — Groupe 02 :**
* **Kabongo Mukola Nathan :** Frontend & Intégration Web3 (Next.js 14, RainbowKit, Wagmi v2, Viem)
* **Losongo Kingombe Victor :** Blockchain & Smart Contracts (Solidity 0.8.24, ERC-721, ERC-2981, ERC-20, Escrow, Hardhat)
* **Tuasansilu Lufuma Benie :** Backend, Sécurité cryptographique, IPFS & Qualité logicielle (Express, JWT, Scrypt, Pinata, QA)

---

## 1. VISION ET ARCHITECTURE DU PROJET

SENDA est une plateforme Web3 conçue pour surmonter le déficit de traçabilité et de valorisation financière dont souffrent les maîtres artisans de la République Démocratique du Congo. Elle réunit :
1. **Certification par NFT (ERC-721)** : Chaque création physique est associée à un certificat numérique immuable sur **Polygon Amoy**.
2. **Redevances pérennes (ERC-2981)** : Reversement automatique de 5% à 10% sur toute revente secondaire au maître artisan créateur.
3. **Séquestre physique conditionnel (`SendaEscrow.sol`)** : Verrouillage des fonds de paiement dans le contrat intelligent et libération irrévocable uniquement après confirmation par l'acheteur de la réception du colis.
4. **Jeton de démonstration (`SendaTestToken.sol`)** : Jeton ERC-20 `STT` (sans valeur marchande) doté d'un robinet public (*faucet*) bridé à 100 STT / 24 heures par portefeuille.
5. **Stockage décentralisé IPFS** : Métadonnées et photographies muséales épinglées de manière permanente via le protocole IPFS (Pinata).
6. **Modèle de confiance à 3 niveaux** :
   - *Niveau 1 (Déclaratif)* : Fiche technique, dimensions, poids, province, essences de bois et pigments naturels.
   - *Niveau 2 (Audit terrain & Modération)* : Contrôle physique des ateliers d'artisans validé par les vérificateurs avec motif écrit obligatoire.
   - *Niveau 3 (Blockchain)* : Empreinte cryptographique immuable sur Polygon Amoy.

---

## 2. MODÈLE DE SÉCURITÉ ET RÔLES (RBAC)

Le système distingue strictement **trois rôles** :
1. **Visiteur non connecté** : Consultation libre du catalogue, filtres par province congolaise (Kwilu, Kasaï, Katanga, Kongo Central, Sankuru, Tanganyika, Haut-Uele), vérification de la traçabilité des œuvres.
2. **Utilisateur authentifié** :
   - **Acheteur** : Réclamation de jetons de test STT, commande d'œuvres sous séquestre, suivi d'expédition, attestation de livraison et libération des fonds.
   - **Artisan Créateur** :
     * *Non vérifié / En attente (`PENDING`)* : Soumission du dossier d'atelier (province, portfolio, techniques de sculpture ou tissage).
     * *Certifié (`VERIFIED`)* : Publication de fiches d'œuvres, frappe on-chain de certificats NFT avec royalties ERC-2981 et perception des paiements.
3. **Administrateur / Modérateur** : Espace réservé (`/admin`) pour examiner les dossiers d'artisans, approuver ou rejeter les demandes avec justification écrite obligatoire, et superviser l'état des ordres de séquestre physique.

### Dissociation Compte Applicatif vs Portefeuille Web3
La simple détention d'une adresse publique ne suffit pas pour usurper un compte :
- L'utilisateur s'authentifie par email et mot de passe sécurisé (haché avec `scrypt` et salage cryptographique).
- Pour lier un portefeuille, le backend génère un **défi de sécurité unique (nonce)**.
- L'utilisateur doit signer ce message dans MetaMask (`personal_sign`).
- Le serveur vérifie la validité de la signature via `viem.verifyMessage` avant de certifier le lien entre l'identité et le portefeuille.

---

## 3. COMPTES DE TEST POUR LE JURY ACADÉMIQUE UNIKIN

Des boutons de connexion rapide à 1 clic sont intégrés directement sur la page [`/login`](http://localhost:3000/login) :

| Rôle | Email | Mot de passe | Privilèges & État |
| :--- | :--- | :--- | :--- |
| **Administrateur** | `admin@senda.cd` | `SendaAdmin2026!` | Accès au panneau `/admin`, modération, validation d'artisans avec motif écrit. |
| **Maître Artisan Certifié** | `mukendi@artisanat.cd` | `Artisan2026!` | Maître sculpteur du Kwilu, statut `VERIFIED`, habilité à publier des œuvres sur `/create`. |
| **Artisan En Attente** | `tshimanga@artisanat.cd` | `Artisan2026!` | Sculpteur Tshokwe du Kasaï, statut `PENDING` (dossier visible dans `/admin` pour démonstration). |
| **Acheteur d'Art** | `acheteur@senda.cd` | `Acheteur2026!` | Collectionneur, commandes sous séquestre dans `/my-nfts`. |

---

## 4. STRUCTURE DES RÉPERTOIRES DU WORKSPACE

```
D:\SENDA\
├── documentation_professionnelle\     # PRD, TRD, UI/UX, Contrats d'intégration, Scénarios
│   ├── AUDIT_ET_DIAGNOSTIC_INITIAL_SENDA.md
│   ├── SCENARIOS_UTILISATEURS_SENDA.md
│   ├── CONTRAT_INTEGRATION_SENDA.md
│   ├── SPECIFICATION_API_SENDA.md
│   └── WORKFLOW_BLOCKCHAIN_SENDA.md
├── NFT-market-Place-main\
│   ├── apps\web\                      # Frontend Next.js 14, Tailwind, Wagmi v2, RainbowKit
│   │   ├── app\
│   │   │   ├── page.tsx               # Catalogue muséal d'artisanat congolais
│   │   │   ├── login\page.tsx         # Connexion avec comptes démo 1-clic pour le jury
│   │   │   ├── register\page.tsx      # Inscription avec choix de profil (Acheteur / Artisan)
│   │   │   ├── admin\page.tsx         # Panneau de modération & certification des artisans
│   │   │   ├── create\page.tsx        # Studio de publication & minting NFT
│   │   │   ├── my-nfts\page.tsx       # Suivi des ordres de séquestre & Robinet STT
│   │   │   └── nft\[id]\page.tsx      # Fiche détaillée avec onglets de traçabilité
│   │   ├── context\AuthContext.tsx    # Gestion de session JWT, rôles & signature Web3
│   │   └── components\Navbar.tsx      # Navigation fluide avec profil et liaison wallet
│   └── packages\contracts\            # Smart Contracts Hardhat (Solidity 0.8.24)
│       ├── contracts\
│       │   ├── SendaNFT.sol           # ERC-721 + ERC-2981 + Pausable
│       │   ├── SendaEscrow.sol        # Séquestre physique (CEI pattern + ReentrancyGuard)
│       │   └── SendaTestToken.sol     # Jeton ERC-20 STT avec robinet public bridé (100 STT/24h)
│       └── test\
│           └── SendaEscrow.test.ts    # 9 tests automatisés (100% passing)
└── backend\                           # Serveur API REST, Sécurité cryptographique & IPFS
    ├── src\
    │   ├── routes\api.ts              # Endpoints RBAC, catalogue, commandes & administration
    │   ├── middlewares\auth.ts        # Middlewares d'authentification JWT & contrôle de rôle
    │   ├── utils\crypto.ts            # Hachage scrypt, tokens JWT, nonces & vérification viem
    │   └── services\pinataService.ts  # Service d'épinglage décentralisé IPFS Pinata
    └── test\
        └── backend_integration.ts     # 12 tests d'intégration backend (100% passing)
```

---

## 5. DÉMARRAGE RAPIDE DES SERVICES LOCAUX

### Étape 1 : Lancement du Serveur Backend API & Authentification
```powershell
cd "D:\SENDA\backend"
node dist/server.js
```
*Le serveur écoute sur `http://localhost:4000`.*  
*Endpoint de santé : `http://localhost:4000/api/health`.*

### Étape 2 : Lancement de l'Application Frontend Next.js
```powershell
cd "D:\SENDA\NFT-market-Place-main\apps\web"
npm run dev
```
*L'interface web est accessible sur `http://localhost:3000`.*

---

## 6. EXÉCUTION DES SUITES DE TESTS AUTOMATISÉS

### 6.1. Tests des Smart Contracts Solidity (Hardhat)
```powershell
cd "D:\SENDA\NFT-market-Place-main\packages\contracts"
npx hardhat test test/SendaEscrow.test.ts
```
**Résultats obtenus :**
- `SendaTestToken` : Initialisation des soldes, robinet public (+100 STT), rejet anti-abus 24h.
- `SendaNFT` : Émission avec redevance artisanale ERC-2981, rejet si redevance > 10%.
- `SendaEscrow` : Consignation des fonds (`Created` $\rightarrow$ `Funded`), libération par l'acheteur (`Funded` $\rightarrow$ `Released`), interdiction d'usurpation par un tiers, remboursement sur consentement vendeur.  
**Score : 9 tests réussis sur 9 (100% de succès).**

### 6.2. Tests d'Intégration Backend & Sécurité (TypeScript)
```powershell
cd "D:\SENDA\backend"
npx ts-node test/backend_integration.ts
```
**Résultats obtenus :**
- Connexion Administrateur et émission du jeton JWT.
- Connexion Artisan certifié et reconnaissance de statut.
- Inscription nouvel utilisateur avec hachage de mot de passe `scrypt`.
- Blocage strict sans token (401 Unauthorized) sur `/api/admin/*`.
- Blocage strict du rôle Acheteur (403 Forbidden) sur `/api/admin/*`.
- Accès vérifié de l'Admin avec consultation des dossiers d'artisans.
- Rejet immédiat de validation d'artisan sans motif écrit (`RATIONALE_REQUIRED`).
- Validation réussie de l'artisan avec motif écrit consigné dans l'historique.
- Interdiction de publication d'œuvres aux acheteurs (403 `NOT_AN_ARTISAN`).
- Publication d'œuvre par un artisan certifié (201 Created).
- Mise à jour temps réel des KPIs statistiques.  
**Score : 12 tests réussis sur 12 (100% de succès).**

---

## 7. SCÉNARIO DE DÉMONSTRATION EN CONTINU POUR LA SOUTENANCE

1. **Visite Libre (Rôle Visiteur) :**
   - Accéder à `http://localhost:3000/`.
   - Explorer les 8 œuvres d'artisanat congolais (Masque Pende, Statuette Tshokwe, Textile Shoowa, Pectoral en Malachite, Panier Bakongo, Coupe Bakuba, Statue Luba, Tabouret Mangbetu).
   - Cliquer sur le détail d'une œuvre (`/nft/1`) et naviguer à travers les 4 onglets d'authenticité (Fiche technique, Audit terrain, Blockchain & IPFS, et **IA & Authenticité SendaVision**).

2. **Connexion & Liaison de Portefeuille :**
   - Accéder à `http://localhost:3000/login`.
   - Utiliser le bouton démo 1-clic pour se connecter comme Acheteur (`acheteur@senda.cd`).
   - Connecter MetaMask via RainbowKit.
   - Cliquer sur le profil utilisateur dans la barre de navigation $\rightarrow$ *« Lier ce portefeuille (Signer) »*.
   - Valider la signature `personal_sign` dans MetaMask : le portefeuille est infalsifiablement lié au compte.

3. **Achat avec Séquestre Physique :**
   - Ouvrir la fiche d'une œuvre (ex: Masque Royal Pende, 180 STT).
   - Cliquer sur *« Commander avec Séquestre »*.
   - Valider la transaction dans la modal : les fonds STT sont consignés dans `SendaEscrow`.
   - Se rendre dans `http://localhost:3000/my-nfts` : la commande apparaît à l'état `Funded`.

4. **Confirmation de Livraison et Libération :**
   - Dans `http://localhost:3000/my-nfts`, cliquer sur *« Confirmer réception & Débloquer les fonds »*.
   - Les fonds sont irrévocablement transférés à l'artisan et l'ordre passe à `Released`.

5. **Modération & Certification par l'Administrateur :**
   - Se déconnecter puis se reconnecter comme Administrateur (`admin@senda.cd`).
   - L'onglet *« Administration »* apparaît dans la barre de navigation.
   - Accéder à `http://localhost:3000/admin`.
   - Examiner les statistiques globales de la plateforme.
   - Consulter la demande en attente de l'artisan Papa Tshimanga Kabemba (Kasaï).
   - Cliquer sur *« Valider certification »* : saisir le motif écrit d'inspection.
   - Confirmer : le dossier passe en `✓ Certifié` et l'artisan dispose désormais du droit de publier des créations certifiées.

---

## 8. MODULE D'INTELLIGENCE ARTIFICIELLE & POLITIQUE D'USAGE (EXIGENCE N°5 UNIKIN)

Conformément aux exigences minimales du cours de Blockchain et cryptomonnaies :
- **Jeu de données (`SENDA-CongoCraft-2450`)** : 2 450 échantillons muséaux et d'ateliers couvrant 8 provinces de RDC (Kwilu, Kasaï, Katanga, Kongo Central, etc.) et 600 contre-exemples industriels/synthétiques.
- **Modèle d'IA (`SendaVision-ConvNet v1.2`)** : Réseau convolutif MobileNetV3-Large Dual-Head (classification culturelle + détection d'anomalies matérielles).
- **Métriques d'évaluation** :
  * Précision globale (*Accuracy*) : **94.6%**
  * Précision (*Precision*) : **95.2%**
  * Rappel (*Recall*) : **94.0%**
  * F1-Score : **0.946**
  * Temps moyen d'inférence : **135 ms**
- **Lien précis avec la Blockchain** :
  L'IA produit une empreinte cryptographique SHA-256 (`attestationHash`) scellée dans les métadonnées décentralisées IPFS (`tokenURI`) du NFT ERC-721 `SendaNFT`. Toute altération de l'œuvre invalide instantanément l'attestation on-chain.
- **Politique d'usage & Charte éthique** :
  Consultable directement sur la DApp à l'adresse [`http://localhost:3000/terms`](http://localhost:3000/terms) et documentée dans [`documentation_professionnelle/IA_AUTHENTIFICATION_ET_POLITIQUE_USAGE.md`](documentation_professionnelle/IA_AUTHENTIFICATION_ET_POLITIQUE_USAGE.md). Elle garantit le respect des créateurs, les redevances perpétuelles ERC-2981, le paiement sous séquestre, et le principe strict de **zéro donnée personnelle en clair sur la chaîne**.

**Dépôt officiel GitHub :** [https://github.com/Nathankabongo/Nsenda](https://github.com/Nathankabongo/Nsenda)
