---
name: senda-dapp
description: Guide et instructions complètes pour concevoir, déployer et intégrer la marketplace Web3 Senda sur Polygon Amoy Testnet (Solidity 0.8.20+, Remix IDE, MetaMask, ethers.js v6 en Vanilla JS sans framework). À utiliser dès que l'utilisateur souhaite créer, modifier ou débugger les smart contracts, les scripts Web3 ou les pages HTML/JS de la marketplace d'artisanat Senda.
---

# RÔLE & POSTURE
Tu es un développeur senior Web3 (Solidity, ethers.js v6, EVM) et un architecte de dApps chevronné. Tu accompagnes un porteur de projet francophone débutant. Tu expliques chaque concept simplement, en français, avec du code complet, prêt à l'emploi et sécurisé.

---

# CONTEXTE DU PROJET
**Senda** est une marketplace décentralisée valorisant l'artisanat :
1. **Les artisans** publient leurs créations avec titre, description, lien d'image et prix en POL.
2. **Les acheteurs** consultent un catalogue public en direct depuis la blockchain (sans MetaMask requis pour la lecture).
3. **Le paiement est direct** : à la commande, les fonds en POL vont immédiatement de l'acheteur à l'artisan dans la même transaction. Le contrat ne conserve jamais d'argent.

---

# STACK TECHNIQUE IMPOSÉE
* **Réseau :** Polygon Amoy Testnet
  * **Chain ID :** `80002` (hexadécimal : `0x13882`)
  * **Monnaie native :** `POL` (anciennement MATIC, 18 décimales)
  * **RPC public :** `https://rpc-amoy.polygon.technology`
  * **Explorateur :** `https://amoy.polygonscan.com`
* **Smart Contract :** Solidity `^0.8.20`, compilé et déployé avec **Remix IDE**.
* **Portefeuille :** MetaMask (*Injected Web3 Provider*).
* **Front-end :** HTML5, CSS3, JavaScript moderne (ES6+) avec **ethers.js v6** (CDN autonome, aucun framework imposé).
* **Stockage média :** Hors-chaîne (IPFS / Pinata ou URL), seul le lien textuel est stocké dans le smart contract.

---

# SÉCURITÉ & RÈGLES MÉTIER INDISPENSABLES

### 1. Sécurité Blockchain (Smart Contract)
* **Checks-Effects-Interactions (CEI) :** Toujours mettre à jour l'état interne (`o.active = false`, enregistrement de la commande) **avant** d'exécuter l'appel de transfert.
* **Protection anti-réentrance :** Utiliser un verrou mutex (`nonReentrant`) sur toute fonction exécutant un transfert de fonds.
* **Transfert sécurisé de POL :** Utiliser exclusivement `(bool ok, ) = artisan.call{value: msg.value}(""); require(ok, "Paiement echoue");`. Ne jamais employer `transfer()` ou `send()` obsolètes.
* **Contrôles stricts :**
  * `require(msg.value == o.prix, "Montant incorrect");`
  * `require(msg.sender != o.artisan, "Achat de sa propre oeuvre interdit");`
  * `require(o.active, "Oeuvre indisponible");`
  * `require(prix > 0, "Prix invalide");`

### 2. Sécurité Front-end (XSS & Réseau)
* **Protection XSS absolue :** Ne jamais injecter de variables issues du smart contract (`titre`, `description`, `artisan`) directement dans un `innerHTML`. Utiliser impérativement `element.textContent` ou la création sécurisée d'éléments DOM (`document.createElement`).
* **Vérification automatique du réseau :** Si l'utilisateur est sur un autre réseau que Polygon Amoy (`80002`), lui proposer la bascule via `wallet_switchEthereumChain` ou l'ajout automatique via `wallet_addEthereumChain`.

---

# COMPOSANT 1 : LE SMART CONTRACT (`SendaMarketplace.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SendaMarketplace
 * @notice Marketplace décentralisée d'artisanat avec paiement direct à l'artisan.
 * @dev Déployé sur Polygon Amoy Testnet (Chain ID: 80002). Monnaie native : POL.
 */
contract SendaMarketplace {
    address public admin;
    bool public validationRequise; // false = publication libre, true = validation préalable par Senda
    mapping(address => bool) public artisanValide;

    struct Oeuvre {
        uint256 id;
        address payable artisan;
        string titre;
        string description;
        string image;       // Lien IPFS (ex: ipfs://... ou https://...)
        uint256 prix;       // En wei (1 POL = 1e18 wei)
        bool active;
    }

    struct Commande {
        address acheteur;
        uint256 oeuvreId;
        uint256 montant;
        uint256 date;
    }

    uint256 public nbOeuvres;
    uint256 public nbCommandes;
    mapping(uint256 => Oeuvre) public oeuvres;
    mapping(uint256 => Commande) public commandes;

    // Verrou anti-réentrance intégré (autonome, aucun import externe requis pour Remix)
    bool private _verrouille;
    modifier nonReentrant() {
        require(!_verrouille, "Reentrance detectee");
        _verrouille = true;
        _;
        _verrouille = false;
    }

    event OeuvreAjoutee(uint256 indexed id, address indexed artisan, string titre, uint256 prix);
    event OeuvreModifiee(uint256 indexed id, uint256 nouveauPrix, bool active);
    event CommandePassee(uint256 indexed commandeId, uint256 indexed oeuvreId, address indexed acheteur, uint256 montant);
    event StatutArtisanModifie(address indexed artisan, bool valide);
    event ModeValidationModifie(bool validationRequise);

    constructor(bool _validationRequise) {
        admin = msg.sender;
        validationRequise = _validationRequise;
    }

    modifier seulAdmin() {
        require(msg.sender == admin, "Reserve a l'admin Senda");
        _;
    }

    // L'admin Senda valide ou retire un artisan (actif si validationRequise = true)
    function validerArtisan(address artisan, bool ok) external seulAdmin {
        require(artisan != address(0), "Adresse invalide");
        artisanValide[artisan] = ok;
        emit StatutArtisanModifie(artisan, ok);
    }

    // Bascule entre publication libre et publication soumise à modération
    function changerMode(bool _validationRequise) external seulAdmin {
        validationRequise = _validationRequise;
        emit ModeValidationModifie(_validationRequise);
    }

    // L'artisan publie : son adresse est msg.sender automatiquement
    function ajouterOeuvre(
        string calldata titre,
        string calldata description,
        string calldata image,
        uint256 prix
    ) external returns (uint256) {
        if (validationRequise) {
            require(artisanValide[msg.sender], "Artisan non valide par Senda");
        }
        require(bytes(titre).length > 0, "Titre requis");
        require(bytes(image).length > 0, "Image requise");
        require(prix > 0, "Prix invalide");

        nbOeuvres++;
        oeuvres[nbOeuvres] = Oeuvre({
            id: nbOeuvres,
            artisan: payable(msg.sender),
            titre: titre,
            description: description,
            image: image,
            prix: prix,
            active: true
        });

        emit OeuvreAjoutee(nbOeuvres, msg.sender, titre, prix);
        return nbOeuvres;
    }

    // Seul l'artisan créateur peut modifier son prix ou retirer sa pièce
    function modifierOeuvre(uint256 id, uint256 nouveauPrix, bool active) external {
        Oeuvre storage o = oeuvres[id];
        require(o.id != 0, "Oeuvre inexistante");
        require(o.artisan == msg.sender, "Pas votre oeuvre");
        require(nouveauPrix > 0, "Prix invalide");

        o.prix = nouveauPrix;
        o.active = active;
        emit OeuvreModifiee(id, nouveauPrix, active);
    }

    // Lecture publique de toutes les œuvres (gratuite en gas)
    function getCatalogue() external view returns (Oeuvre[] memory) {
        Oeuvre[] memory liste = new Oeuvre[](nbOeuvres);
        for (uint256 i = 1; i <= nbOeuvres; i++) {
            liste[i - 1] = oeuvres[i];
        }
        return liste;
    }

    // L'acheteur commande : paiement direct et irrévocable à l'artisan
    function commander(uint256 oeuvreId) external payable nonReentrant {
        Oeuvre storage o = oeuvres[oeuvreId];
        require(o.id != 0, "Oeuvre inexistante");
        require(o.active, "Oeuvre indisponible");
        require(msg.value == o.prix, "Montant incorrect");
        require(msg.sender != o.artisan, "Achat de sa propre oeuvre interdit");

        // Checks-Effects-Interactions : mise à jour d'état avant transfert
        o.active = false;
        nbCommandes++;
        commandes[nbCommandes] = Commande(msg.sender, oeuvreId, msg.value, block.timestamp);

        emit CommandePassee(nbCommandes, oeuvreId, msg.sender, msg.value);
        emit OeuvreModifiee(oeuvreId, o.prix, false);

        // Transfert direct et immédiat du montant à l'artisan
        (bool ok, ) = o.artisan.call{value: msg.value}("");
        require(ok, "Paiement echoue");
    }
}
```

---

# COMPOSANT 2 : GUIDE DE DÉPLOIEMENT PAS À PAS (REMIX IDE)

1. **Préparer MetaMask :**
   * Ouvrir MetaMask et s'assurer que le réseau sélectionné est **Polygon Amoy Testnet** (Chain ID : `80002`).
   * Vérifier que le compte de déploiement possède du **POL de test** (via le faucet officiel `https://faucet.polygon.technology`).
2. **Ouvrir Remix IDE :**
   * Aller sur [https://remix.ethereum.org](https://remix.ethereum.org).
   * Dans l'explorateur de fichiers à gauche, créer un fichier `SendaMarketplace.sol` dans le dossier `contracts/`.
   * Coller l'intégralité du code Solidity ci-dessus.
3. **Compiler le contrat :**
   * Aller dans l'onglet **Solidity Compiler** (icône « S »).
   * Choisir la version `0.8.20` ou `0.8.24`.
   * Cliquer sur le bouton bleu **Compile SendaMarketplace.sol** (un badge vert confirme le succès).
4. **Déployer sur Polygon Amoy :**
   * Aller dans l'onglet **Deploy & Run Transactions** (icône Ethereum).
   * Dans le menu déroulant **ENVIRONMENT**, sélectionner **Injected Provider - MetaMask**.
   * MetaMask s'ouvre : valider la connexion. Remix doit afficher sous le menu : `Custom (80002) network`.
   * Dans la section **Deploy**, renseigner le paramètre du constructeur :
     * Mettre `false` pour la publication libre immédiate sans modération.
     * Mettre `true` si l'administrateur doit valider chaque artisan avant publication.
   * Cliquer sur le bouton orange **Deploy** et confirmer la transaction dans MetaMask.
5. **Récupérer l'adresse et l'ABI :**
   * Une fois validé, sous **Deployed Contracts**, copier l'adresse générée (ex : `0x1234...5678`).
   * Revenir dans l'onglet **Solidity Compiler** et cliquer sur **ABI** tout en bas pour copier la définition JSON du contrat.

---

# COMPOSANT 3 : FRONT-END STANDALONE (VANILLA JS + ETHERS.JS V6)

### 1. `config.js` (Partagé par les deux pages)
```javascript
// Adresse obtenue après le déploiement sur Remix
export const CONTRACT_ADDRESS = "0xVOTRE_ADRESSE_DE_CONTRAT_ICI";

// Paramètres du réseau Polygon Amoy
export const AMOY_CHAIN_ID_HEX = "0x13882"; // 80002 en décimal
export const AMOY_CONFIG = {
  chainId: AMOY_CHAIN_ID_HEX,
  chainName: "Polygon Amoy Testnet",
  nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
  rpcUrls: ["https://rpc-amoy.polygon.technology"],
  blockExplorerUrls: ["https://amoy.polygonscan.com"]
};

// ABI minimale extraite du compilateur
export const CONTRACT_ABI = [
  "function nbOeuvres() view returns (uint256)",
  "function getCatalogue() view returns (tuple(uint256 id, address artisan, string titre, string description, string image, uint256 prix, bool active)[])",
  "function ajouterOeuvre(string titre, string description, string image, uint256 prix) returns (uint256)",
  "function modifierOeuvre(uint256 id, uint256 nouveauPrix, bool active)",
  "function commander(uint256 oeuvreId) payable",
  "event OeuvreAjoutee(uint256 indexed id, address indexed artisan, string titre, uint256 prix)",
  "event CommandePassee(uint256 indexed commandeId, uint256 indexed oeuvreId, address indexed acheteur, uint256 montant)"
];

// Vérificateur et basculeur automatique de réseau
export async function verifierReseauAmoy() {
  if (!window.ethereum) throw new Error("MetaMask n'est pas installé");
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  if (chainId !== AMOY_CHAIN_ID_HEX) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: AMOY_CHAIN_ID_HEX }]
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [AMOY_CONFIG]
        });
      } else {
        throw switchError;
      }
    }
  }
}
```

### 2. `index.html` (Catalogue public des acheteurs)
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Senda — Catalogue d'Artisanat Décentralisé</title>
  <link rel="stylesheet" href="style.css">
  <script type="importmap">
    { "imports": { "ethers": "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.13.2/ethers.min.js" } }
  </script>
</head>
<body>
  <header>
    <h1>SENDA <span>Artisanat Authentifié</span></h1>
    <div id="wallet-bar">
      <button id="btnConnecter">Connecter MetaMask</button>
      <span id="compteAcheteur" class="badge">Non connecté</span>
    </div>
  </header>

  <main>
    <h2>Catalogue des Créations Disponibles</h2>
    <div id="chargement" class="info">Lecture directe de la blockchain Polygon Amoy...</div>
    <div id="catalogue-grid" class="grid"></div>
  </main>

  <script type="module">
    import { BrowserProvider, JsonRpcProvider, Contract, formatEther } from "ethers";
    import { CONTRACT_ADDRESS, CONTRACT_ABI, AMOY_CONFIG, verifierReseauAmoy } from "./config.js";

    let signer = null;
    let provider = null;

    // 1. Lecture publique sans MetaMask requis
    const lectureRpc = new Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      new JsonRpcProvider(AMOY_CONFIG.rpcUrls[0])
    );

    async function chargerCatalogue() {
      const chargement = document.getElementById("chargement");
      const grid = document.getElementById("catalogue-grid");
      try {
        const oeuvres = await lectureRpc.getCatalogue();
        grid.innerHTML = "";
        const oeuvresActives = oeuvres.filter(o => o.active);

        if (oeuvresActives.length === 0) {
          chargement.textContent = "Aucune œuvre disponible à la vente pour le moment.";
          return;
        }

        chargement.style.display = "none";

        oeuvresActives.forEach(o => {
          const carte = document.createElement("div");
          carte.className = "carte";

          const img = document.createElement("img");
          img.src = o.image;
          img.alt = o.titre;
          img.onerror = () => { img.src = "placeholder.jpg"; };

          const h3 = document.createElement("h3");
          h3.textContent = o.titre; // Protection XSS native

          const desc = document.createElement("p");
          desc.textContent = o.description; // Protection XSS native

          const prix = document.createElement("p");
          prix.className = "prix";
          prix.textContent = `${formatEther(o.prix)} POL`;

          const artisan = document.createElement("p");
          artisan.className = "artisan";
          artisan.textContent = `Artisan : ${o.artisan.slice(0, 6)}...${o.artisan.slice(-4)}`;

          const btn = document.createElement("button");
          btn.textContent = "Commander (Paiement direct)";
          btn.onclick = () => passerCommande(o.id, o.prix);

          carte.append(img, h3, desc, prix, artisan, btn);
          grid.appendChild(carte);
        });
      } catch (err) {
        chargement.textContent = "Erreur de connexion RPC Polygon Amoy : " + err.message;
      }
    }

    async function connecterMetaMask() {
      try {
        await verifierReseauAmoy();
        provider = new BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        const adresse = await signer.getAddress();
        document.getElementById("compteAcheteur").textContent = `${adresse.slice(0,6)}...${adresse.slice(-4)}`;
        document.getElementById("btnConnecter").textContent = "Portefeuille Connecté";
      } catch (err) {
        alert("Impossible de connecter MetaMask : " + err.message);
      }
    }

    async function passerCommande(idOeuvre, prixWei) {
      if (!signer) {
        alert("Veuillez d'abord connecter votre portefeuille MetaMask.");
        return;
      }
      try {
        await verifierReseauAmoy();
        const contratSigne = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const tx = await contratSigne.commander(idOeuvre, { value: prixWei });
        alert(`Transaction envoyée ! En attente de validation sur Polygon Amoy...\nHash : ${tx.hash}`);
        await tx.wait();
        alert("Paiement validé avec succès ! L'artisan a reçu directement ses POL.");
        chargerCatalogue();
      } catch (err) {
        alert("Erreur lors de la commande : " + (err.reason || err.message));
      }
    }

    document.getElementById("btnConnecter").onclick = connecterMetaMask;
    lectureRpc.on("OeuvreAjoutee", () => chargerCatalogue());
    lectureRpc.on("CommandePassee", () => chargerCatalogue());
    chargerCatalogue();
  </script>
</body>
</html>
```

### 3. `artisan.html` (Espace publication & gestion artisan)
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Senda — Espace Maître Artisan</title>
  <link rel="stylesheet" href="style.css">
  <script type="importmap">
    { "imports": { "ethers": "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.13.2/ethers.min.js" } }
  </script>
</head>
<body>
  <header>
    <h1>SENDA <span>Espace Maître Artisan</span></h1>
    <div id="wallet-bar">
      <button id="btnConnecter">Connecter Portefeuille Artisan</button>
      <span id="compteArtisan" class="badge">Non connecté</span>
    </div>
  </header>

  <main>
    <section class="formulaire-section">
      <h2>Publier une Nouvelle Création</h2>
      <form id="formPublication">
        <label>Titre de l'œuvre *</label>
        <input type="text" id="titre" placeholder="Ex: Masque Royal Pende" required>

        <label>Description culturelle & technique *</label>
        <textarea id="description" placeholder="Ex: Bois de wengé sculpté à la main, pigments naturels..." required></textarea>

        <label>Lien de la photographie (IPFS ou URL) *</label>
        <input type="url" id="image" placeholder="https://gateway.pinata.cloud/ipfs/... ou https://..." required>

        <label>Prix de vente (en POL) *</label>
        <input type="number" id="prixPOL" step="0.0001" min="0.0001" placeholder="Ex: 0.001" required>

        <button type="submit" id="btnPublier">Publier sur la Blockchain</button>
      </form>
    </section>

    <section>
      <h2>Mes Pièces Répertoriées</h2>
      <div id="mes-oeuvres-grid" class="grid"></div>
    </section>
  </main>

  <script type="module">
    import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
    import { CONTRACT_ADDRESS, CONTRACT_ABI, verifierReseauAmoy } from "./config.js";

    let signer = null;
    let provider = null;
    let monAdresse = "";

    async function initialiserArtisan() {
      try {
        await verifierReseauAmoy();
        provider = new BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        monAdresse = (await signer.getAddress()).toLowerCase();

        document.getElementById("compteArtisan").textContent = `${monAdresse.slice(0,6)}...${monAdresse.slice(-4)}`;
        document.getElementById("btnConnecter").textContent = "Artisan Connecté";
        chargerMesOeuvres();
      } catch (err) {
        alert("Connexion impossible : " + err.message);
      }
    }

    async function chargerMesOeuvres() {
      if (!signer) return;
      const contrat = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const grid = document.getElementById("mes-oeuvres-grid");
      grid.innerHTML = "Chargement de vos œuvres...";

      try {
        const toutes = await contrat.getCatalogue();
        grid.innerHTML = "";
        const miennes = toutes.filter(o => o.artisan.toLowerCase() === monAdresse);

        if (miennes.length === 0) {
          grid.innerHTML = "<p>Vous n'avez pas encore publié d'œuvre.</p>";
          return;
        }

        miennes.forEach(o => {
          const carte = document.createElement("div");
          carte.className = "carte";

          const h3 = document.createElement("h3");
          h3.textContent = o.titre;

          const statut = document.createElement("p");
          statut.className = o.active ? "statut-actif" : "statut-inactif";
          statut.textContent = o.active ? "En vente au catalogue" : "Vendue ou retirée";

          const prix = document.createElement("p");
          prix.textContent = `Prix actuel : ${formatEther(o.prix)} POL`;

          const btnDesactiver = document.createElement("button");
          btnDesactiver.textContent = o.active ? "Retirer de la vente" : "Réactiver l'œuvre";
          btnDesactiver.onclick = async () => {
            try {
              const tx = await contrat.modifierOeuvre(o.id, o.prix, !o.active);
              await tx.wait();
              chargerMesOeuvres();
            } catch (e) {
              alert("Erreur de modification : " + e.message);
            }
          };

          carte.append(h3, statut, prix, btnDesactiver);
          grid.appendChild(carte);
        });
      } catch (e) {
        grid.innerHTML = "Erreur de lecture : " + e.message;
      }
    }

    document.getElementById("formPublication").onsubmit = async (e) => {
      e.preventDefault();
      if (!signer) {
        alert("Connectez d'abord votre portefeuille MetaMask.");
        return;
      }
      const titre = document.getElementById("titre").value.trim();
      const desc = document.getElementById("description").value.trim();
      const image = document.getElementById("image").value.trim();
      const prix = document.getElementById("prixPOL").value;

      try {
        const contrat = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const btn = document.getElementById("btnPublier");
        btn.disabled = true;
        btn.textContent = "Signature et publication en cours...";

        const tx = await contrat.ajouterOeuvre(titre, desc, image, parseEther(prix));
        alert(`Transaction envoyée ! Hash : ${tx.hash}`);
        await tx.wait();

        alert("Votre œuvre est publiée et immédiatement visible par tous les acheteurs !");
        document.getElementById("formPublication").reset();
        chargerMesOeuvres();
      } catch (err) {
        alert("Erreur de publication : " + (err.reason || err.message));
      } finally {
        const btn = document.getElementById("btnPublier");
        btn.disabled = false;
        btn.textContent = "Publier sur la Blockchain";
      }
    };

    document.getElementById("btnConnecter").onclick = initialiserArtisan;
  </script>
</body>
</html>
```

### 4. `style.css` (Mise en page épurée et moderne)
```css
:root {
  --senda-green: #1B4332;
  --senda-ochre: #C86D3B;
  --senda-bg: #F8F5F0;
  --senda-border: #E8E1D5;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--senda-bg);
  color: #2D231E;
  margin: 0;
  padding: 20px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid var(--senda-border);
  padding-bottom: 15px;
}

h1 { color: var(--senda-green); margin: 0; font-size: 24px; }
h1 span { font-size: 13px; color: var(--senda-ochre); display: block; }

button {
  background-color: var(--senda-green);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
}

button:hover { opacity: 0.9; }
button:disabled { opacity: 0.5; cursor: not-allowed; }

.badge {
  background: #E8F0EC;
  color: var(--senda-green);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-family: monospace;
  border: 1px solid #C1DBCF;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.carte {
  background: white;
  border: 1px solid var(--senda-border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0,0,0,0.03);
}

.carte img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  background-color: #FAF8F5;
}

.carte h3 { margin: 12px 0 6px 0; color: var(--senda-green); font-size: 18px; }
.carte p { margin: 4px 0; font-size: 13px; color: #6B5E55; }
.carte .prix { font-size: 18px; font-weight: bold; color: var(--senda-ochre); margin: 10px 0; }
.carte .artisan { font-size: 11px; font-family: monospace; }
.carte button { margin-top: auto; }

.formulaire-section {
  background: white;
  border: 1px solid var(--senda-border);
  border-radius: 12px;
  padding: 24px;
  max-width: 600px;
  margin-bottom: 30px;
}

form label { display: block; font-size: 13px; font-weight: bold; margin-top: 12px; }
form input, form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--senda-border);
  border-radius: 6px;
  box-sizing: border-box;
  margin-top: 4px;
}
form textarea { resize: vertical; min-height: 80px; }
form button { margin-top: 16px; width: 100%; }

.statut-actif { color: #16A34A; font-weight: bold; }
.statut-inactif { color: #DC2626; font-weight: bold; }
```

---

# COMPOSANT 4 : CHECKLIST DE VALIDATION & RECETTE

1. **Obtenir des POL sur Amoy :**
   * Aller sur `https://faucet.polygon.technology`.
   * Sélectionner `Polygon Amoy` et coller l'adresse du compte Acheteur, puis celle du compte Artisan.
2. **Déploiement :**
   * Déployer `SendaMarketplace.sol` avec le paramètre `_validationRequise = false`.
   * Noter l'adresse de contrat obtenue et la coller dans `config.js` (`CONTRACT_ADDRESS`).
3. **Publication (Compte Artisan) :**
   * Ouvrir `artisan.html`.
   * Connecter le compte n°1 dans MetaMask.
   * Remplir le formulaire avec un prix de test de `0.001` POL.
   * Confirmer la transaction.
4. **Vérification Catalogue (Sans portefeuille) :**
   * Ouvrir `index.html` dans une fenêtre de navigation privée (sans connecter MetaMask).
   * L'œuvre apparaît immédiatement grâce au RPC public.
5. **Commande (Compte Acheteur) :**
   * Connecter le compte n°2 dans MetaMask sur `index.html`.
   * Cliquer sur « Commander ».
   * Vérifier que MetaMask réclame bien `0.001` POL.
   * Valider la transaction.
6. **Vérification de l'encaissement :**
   * Vérifier que le solde du compte n°1 (Artisan) a bien augmenté de `+0.001` POL.
   * Vérifier que l'œuvre passe automatiquement au statut vendue/retirée.
   * Consulter l'explorateur `https://amoy.polygonscan.com/tx/VOTRE_HASH` pour constater le transfert direct.
