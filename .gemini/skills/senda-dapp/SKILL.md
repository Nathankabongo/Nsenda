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
   * S'assurer que le réseau sélectionné est **Polygon Amoy Testnet** (Chain ID : `80002`).
   * Vérifier la présence de **POL de test** (via `https://faucet.polygon.technology`).
2. **Ouvrir Remix IDE :**
   * Aller sur [https://remix.ethereum.org](https://remix.ethereum.org).
   * Créer un fichier `SendaMarketplace.sol` dans le dossier `contracts/`.
   * Y coller le code Solidity ci-dessus.
3. **Compiler le contrat :**
   * Choisir la version `0.8.20` ou supérieure.
   * Cliquer sur **Compile SendaMarketplace.sol**.
4. **Déployer sur Polygon Amoy :**
   * Dans l'onglet **Deploy & Run Transactions**, choisir **Injected Provider - MetaMask**.
   * Renseigner `_validationRequise` : `false` pour publication libre, ou `true` pour validation préalable.
   * Cliquer sur **Deploy** et confirmer dans MetaMask.
5. **Récupérer l'adresse et l'ABI :**
   * Copier l'adresse du contrat déployé pour la coller dans `config.js`.
   * Copier l'ABI depuis l'onglet compilateur.

---

# COMPOSANT 3 : FRONT-END STANDALONE (VANILLA JS + ETHERS.JS V6)

### 1. `config.js`
```javascript
export const CONTRACT_ADDRESS = "0xVOTRE_ADRESSE_DE_CONTRAT_ICI";
export const AMOY_CHAIN_ID_HEX = "0x13882"; // 80002

export const AMOY_CONFIG = {
  chainId: AMOY_CHAIN_ID_HEX,
  chainName: "Polygon Amoy Testnet",
  nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
  rpcUrls: ["https://rpc-amoy.polygon.technology"],
  blockExplorerUrls: ["https://amoy.polygonscan.com"]
};

export const CONTRACT_ABI = [
  "function nbOeuvres() view returns (uint256)",
  "function getCatalogue() view returns (tuple(uint256 id, address artisan, string titre, string description, string image, uint256 prix, bool active)[])",
  "function ajouterOeuvre(string titre, string description, string image, uint256 prix) returns (uint256)",
  "function modifierOeuvre(uint256 id, uint256 nouveauPrix, bool active)",
  "function commander(uint256 oeuvreId) payable",
  "event OeuvreAjoutee(uint256 indexed id, address indexed artisan, string titre, uint256 prix)",
  "event CommandePassee(uint256 indexed commandeId, uint256 indexed oeuvreId, address indexed acheteur, uint256 montant)"
];

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

### 2. `index.html` (Catalogue acheteurs)
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
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
    <div id="chargement" class="info">Lecture directe de Polygon Amoy...</div>
    <div id="catalogue-grid" class="grid"></div>
  </main>
  <script type="module">
    import { BrowserProvider, JsonRpcProvider, Contract, formatEther } from "ethers";
    import { CONTRACT_ADDRESS, CONTRACT_ABI, AMOY_CONFIG, verifierReseauAmoy } from "./config.js";

    let signer = null;
    let provider = null;

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
          chargement.textContent = "Aucune œuvre disponible pour le moment.";
          return;
        }
        chargement.style.display = "none";

        oeuvresActives.forEach(o => {
          const carte = document.createElement("div");
          carte.className = "carte";

          const img = document.createElement("img");
          img.src = o.image;
          img.alt = o.titre;

          const h3 = document.createElement("h3");
          h3.textContent = o.titre; // Sécurité XSS

          const desc = document.createElement("p");
          desc.textContent = o.description; // Sécurité XSS

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
        chargement.textContent = "Erreur de lecture RPC : " + err.message;
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
        alert("Connexion MetaMask impossible : " + err.message);
      }
    }

    async function passerCommande(idOeuvre, prixWei) {
      if (!signer) {
        alert("Connectez d'abord votre portefeuille MetaMask.");
        return;
      }
      try {
        await verifierReseauAmoy();
        const contratSigne = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const tx = await contratSigne.commander(idOeuvre, { value: prixWei });
        alert(`Transaction envoyée ! Hash : ${tx.hash}`);
        await tx.wait();
        alert("Commande validée ! L'artisan a reçu directement son paiement.");
        chargerCatalogue();
      } catch (err) {
        alert("Erreur commande : " + (err.reason || err.message));
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

---

# COMPOSANT 4 : CHECKLIST DE TEST EN CONDITIONS RÉELLES

1. **Obtenir des POL sur Amoy :** Utiliser `https://faucet.polygon.technology` pour alimenter deux adresses MetaMask de test (Artisan et Acheteur).
2. **Déploiement :** Déployer `SendaMarketplace.sol` dans Remix en `Injected Provider` avec `_validationRequise = false`.
3. **Configuration du Front :** Coller l'adresse dans `config.js`.
4. **Publication (Artisan) :** Sur `artisan.html`, publier une création avec un prix de test de `0.001` POL.
5. **Consultation Publique :** Ouvrir `index.html` en navigation privée sans MetaMask : l'œuvre s'affiche en temps réel.
6. **Commande (Acheteur) :** Connecter le compte Acheteur, cliquer sur Commander et confirmer l'envoi de `0.001` POL.
7. **Vérification Immuable :** Vérifier que le solde de l'Artisan a augmenté de `0.001` POL et inspecter la transaction sur `https://amoy.polygonscan.com`.
