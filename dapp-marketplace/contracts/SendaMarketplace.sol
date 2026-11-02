// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SendaMarketplace
 * @notice Marketplace décentralisée d'œuvres artisanales avec transfert direct et instantané de fonds.
 * @dev Conçu pour Polygon Amoy Testnet (Chain ID 80002).
 * 
 * RÈGLE D'OR DE SÉCURITÉ :
 * Le contrat ne garde JAMAIS de fonds. Le montant payé par l'acheteur en POL (msg.value)
 * est directement transféré à l'adresse de l'artisan créateur dans la même transaction.
 */
contract SendaMarketplace is ReentrancyGuard {
    // -------------------------------------------------------------
    // STRUCTURES DE DONNÉES
    // -------------------------------------------------------------

    /// @notice Représente une création physique répertoriée sur la blockchain
    struct Oeuvre {
        uint256 id;                 // Identifiant unique séquentiel (1, 2, 3...)
        address payable artisan;    // Adresse du portefeuille créateur (défini par msg.sender)
        string titre;               // Nom de l'œuvre (ex: "Masque Royal Pende")
        string description;         // Descriptif culturel et matériaux utilisés
        string image;               // Lien externe décentralisé (IPFS/Pinata ou HTTPS)
        uint256 prix;               // Prix exact en wei (1 POL = 10^18 wei)
        bool active;                // true = disponible à l'achat, false = vendue ou désactivée
    }

    /// @notice Enregistrement d'un ordre d'achat direct
    struct Commande {
        uint256 id;                 // Numéro séquentiel de commande
        uint256 oeuvreId;           // Référence de l'œuvre achetée
        address acheteur;           // Adresse de l'acheteur ayant signé la transaction
        address artisan;            // Adresse de l'artisan ayant perçu le paiement
        uint256 montant;            // Montant payé en wei
        uint256 date;               // Horodatage Unix du bloc (block.timestamp)
    }

    // -------------------------------------------------------------
    // VARIABLES D'ÉTAT
    // -------------------------------------------------------------

    address public immutable adminSenda; // Administrateur de la plateforme Senda
    bool public validationRequise;       // Mode de modération : false = libre, true = homologation préalable

    uint256 public nbOeuvres;            // Compteur total d'œuvres créées
    uint256 public nbCommandes;          // Compteur total de commandes passées

    // Tables de correspondance (mappings)
    mapping(uint256 => Oeuvre) public oeuvres;
    mapping(uint256 => Commande) public commandes;
    mapping(address => bool) public artisansHomologues;

    // -------------------------------------------------------------
    // ÉVÉNEMENTS (LOGS DE LA BLOCKCHAIN)
    // -------------------------------------------------------------

    /// @dev Émis lors de la publication d'une nouvelle œuvre
    event OeuvreAjoutee(
        uint256 indexed id,
        address indexed artisan,
        string titre,
        uint256 prix
    );

    /// @dev Émis lorsqu'un artisan ajuste son prix ou retire/remet en vente sa pièce
    event OeuvreModifiee(
        uint256 indexed id,
        uint256 nouveauPrix,
        bool active
    );

    /// @dev Émis lors de l'achat direct (maximum 3 indexed en EVM : oeuvreId, acheteur, artisan)
    event CommandePassee(
        uint256 commandeId,
        uint256 indexed oeuvreId,
        address indexed acheteur,
        address indexed artisan,
        uint256 montant
    );

    /// @dev Émis lorsqu'un artisan est validé ou révoqué par l'admin
    event ArtisanHomologueModifie(address indexed artisan, bool statut);

    /// @dev Émis lorsque l'admin bascule entre publication libre et modérée
    event ModeValidationModifie(bool nouvelleValidationRequise);

    // -------------------------------------------------------------
    // MODIFICATEURS D'ACCÈS
    // -------------------------------------------------------------

    modifier seulAdmin() {
        require(msg.sender == adminSenda, "Action reservee a l'administrateur Senda");
        _;
    }

    // -------------------------------------------------------------
    // CONSTRUCTEUR
    // -------------------------------------------------------------

    /**
     * @param _validationRequise Détermine si la publication nécessite une validation préalable par l'admin.
     * Pour vos tests et la liberté de publication initiale, passez `false`.
     */
    constructor(bool _validationRequise) {
        adminSenda = msg.sender;
        validationRequise = _validationRequise;
    }

    // -------------------------------------------------------------
    // FONCTIONS D'ADMINISTRATION
    // -------------------------------------------------------------

    /**
     * @notice Active ou désactive le mode de validation préalable des artisans
     */
    function setValidationRequise(bool _validationRequise) external seulAdmin {
        validationRequise = _validationRequise;
        emit ModeValidationModifie(_validationRequise);
    }

    /**
     * @notice Homologue un artisan pour lui autoriser la publication (si validationRequise = true)
     */
    function homologuerArtisan(address _artisan, bool _statut) external seulAdmin {
        require(_artisan != address(0), "Adresse nulle invalide");
        artisansHomologues[_artisan] = _statut;
        emit ArtisanHomologueModifie(_artisan, _statut);
    }

    // -------------------------------------------------------------
    // ESPACE ARTISAN : PUBLICATION ET GESTION
    // -------------------------------------------------------------

    /**
     * @notice Publie une nouvelle œuvre d'artisanat sur la blockchain.
     * L'artisan ne saisit jamais son adresse : elle est déduite de msg.sender.
     */
    function ajouterOeuvre(
        string calldata _titre,
        string calldata _description,
        string calldata _image,
        uint256 _prix
    ) external returns (uint256) {
        // Contrôle du mode de modération Senda
        if (validationRequise) {
            require(artisansHomologues[msg.sender], "Artisan non homologue par l'administration Senda");
        }

        // Contrôles de validité des paramètres
        require(bytes(_titre).length > 0, "Le titre de l'oeuvre est obligatoire");
        require(bytes(_image).length > 0, "Le lien de l'image est obligatoire");
        require(_prix > 0, "Le prix doit etre strictement superieur a 0");

        nbOeuvres++;
        oeuvres[nbOeuvres] = Oeuvre({
            id: nbOeuvres,
            artisan: payable(msg.sender),
            titre: _titre,
            description: _description,
            image: _image,
            prix: _prix,
            active: true
        });

        emit OeuvreAjoutee(nbOeuvres, msg.sender, _titre, _prix);
        return nbOeuvres;
    }

    /**
     * @notice Permet à l'artisan créateur d'ajuster son prix ou de désactiver/réactiver son œuvre.
     */
    function modifierOeuvre(uint256 _id, uint256 _nouveauPrix, bool _active) external {
        Oeuvre storage o = oeuvres[_id];
        require(o.id != 0, "Oeuvre inexistante");
        require(o.artisan == msg.sender, "Seul le createur peut modifier cette oeuvre");
        require(_nouveauPrix > 0, "Le prix doit etre superieur a 0");

        o.prix = _nouveauPrix;
        o.active = _active;

        emit OeuvreModifiee(_id, _nouveauPrix, _active);
    }

    // -------------------------------------------------------------
    // ACHAT & COMMANDE : PAIEMENT DIRECT EN POL
    // -------------------------------------------------------------

    /**
     * @notice Permet à un acheteur de commander une œuvre avec paiement direct à l'artisan.
     * @dev Protégé contre la réentrance par `nonReentrant` et le modèle Checks-Effects-Interactions.
     * @param _oeuvreId L'identifiant de l'œuvre commandée.
     */
    function commander(uint256 _oeuvreId) external payable nonReentrant {
        // 1. CHECKS (Vérifications préliminaires strictes)
        Oeuvre storage o = oeuvres[_oeuvreId];
        require(o.id != 0, "Oeuvre inexistante");
        require(o.active, "Oeuvre indisponible ou deja vendue");
        require(msg.value == o.prix, "Montant POL transmis incorrect (doit etre exactement le prix)");
        require(msg.sender != o.artisan, "L'artisan ne peut pas acheter sa propre oeuvre");

        address payable destinataireArtisan = o.artisan;
        uint256 montant = msg.value;

        // 2. EFFECTS (Mise à jour de l'état interne avant tout transfert externe)
        // L'œuvre physique unique passe en inactive (vendue) pour empêcher un second achat
        o.active = false;

        nbCommandes++;
        commandes[nbCommandes] = Commande({
            id: nbCommandes,
            oeuvreId: _oeuvreId,
            acheteur: msg.sender,
            artisan: destinataireArtisan,
            montant: montant,
            date: block.timestamp
        });

        emit CommandePassee(nbCommandes, _oeuvreId, msg.sender, destinataireArtisan, montant);
        emit OeuvreModifiee(_oeuvreId, o.prix, false);

        // 3. INTERACTIONS (Transfert direct et immédiat des fonds au portefeuille de l'artisan)
        // Utilisation de .call{value:} sécurisé avec vérification du booléen de succès
        (bool succes, ) = destinataireArtisan.call{value: montant}("");
        require(succes, "Echec du transfert des POL a l'artisan");
    }

    // -------------------------------------------------------------
    // FONCTIONS DE LECTURE (CALLS SANS FRAIS DE GAS)
    // -------------------------------------------------------------

    /**
     * @notice Retourne l'ensemble des œuvres enregistrées sur la blockchain.
     * Le front-end filtrera ensuite celles qui ont `active == true`.
     */
    function getCatalogue() external view returns (Oeuvre[] memory) {
        Oeuvre[] memory liste = new Oeuvre[](nbOeuvres);
        for (uint256 i = 1; i <= nbOeuvres; i++) {
            liste[i - 1] = oeuvres[i];
        }
        return liste;
    }

    /**
     * @notice Retourne toutes les œuvres publiées par une adresse d'artisan donnée.
     * Utilisé pour peupler la page « Mes œuvres » de l'espace artisan.
     */
    function getOeuvresParArtisan(address _artisan) external view returns (Oeuvre[] memory) {
        uint256 compte = 0;
        for (uint256 i = 1; i <= nbOeuvres; i++) {
            if (oeuvres[i].artisan == _artisan) {
                compte++;
            }
        }

        Oeuvre[] memory mesOeuvres = new Oeuvre[](compte);
        uint256 index = 0;
        for (uint256 j = 1; j <= nbOeuvres; j++) {
            if (oeuvres[j].artisan == _artisan) {
                mesOeuvres[index] = oeuvres[j];
                index++;
            }
        }
        return mesOeuvres;
    }
}
