// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title SendaNFT
 * @author Équipe Projet SENDA (Master 1 Informatique - Groupe 02)
 * @notice Certificat d'enregistrement numérique décentralisé pour l'artisanat congolais.
 * Conforme aux standards ERC-721 et ERC-2981 (redevances d'artisan sur reventes secondaires).
 */
contract SendaNFT is ERC721URIStorage, ERC2981, Ownable, Pausable {
    uint256 private _nextTokenId;

    /// @dev Plafond maximal de redevance (1000 = 10%)
    uint96 public constant MAX_ROYALTY_BPS = 1000;

    /// @notice Événement émis lors de la frappe d'un certificat d'œuvre
    event ArtworkMinted(
        uint256 indexed tokenId,
        address indexed artisan,
        address indexed recipient,
        string tokenURI,
        uint96 royaltyFeeBps
    );

    /// @notice Événement émis lors de la mise à jour des redevances par défaut
    event DefaultRoyaltyUpdated(address indexed receiver, uint96 feeNumerator);

    constructor(
        string memory name,
        string memory symbol,
        address defaultRoyaltyReceiver,
        uint96 defaultRoyaltyFeeBps
    ) ERC721(name, symbol) Ownable(msg.sender) {
        require(defaultRoyaltyFeeBps <= MAX_ROYALTY_BPS, "Redevance superieure au plafond");
        if (defaultRoyaltyReceiver != address(0) && defaultRoyaltyFeeBps > 0) {
            _setDefaultRoyalty(defaultRoyaltyReceiver, defaultRoyaltyFeeBps);
        }
    }

    /**
     * @notice Enregistre et certifie une nouvelle œuvre artisanale congolaise
     * @param artisanRecipient Adresse du portefeuille de l'artisan créateur
     * @param metadataURI URI IPFS du manifeste de métadonnées (ipfs://<CID>/metadata.json)
     * @param royaltyFeeBps Quote-part de redevance pour l'artisan (ex: 500 = 5.0%)
     * @return tokenId Identifiant unique de l'œuvre sur la blockchain
     */
    function mintArtwork(
        address artisanRecipient,
        string calldata metadataURI,
        uint96 royaltyFeeBps
    ) external whenNotPaused returns (uint256) {
        require(artisanRecipient != address(0), "Adresse artisan invalide");
        require(bytes(metadataURI).length > 0, "URI IPFS obligatoire");
        require(royaltyFeeBps <= MAX_ROYALTY_BPS, "Redevance superieure a 10%");

        _nextTokenId++;
        uint256 currentTokenId = _nextTokenId;

        _safeMint(artisanRecipient, currentTokenId);
        _setTokenURI(currentTokenId, metadataURI);

        if (royaltyFeeBps > 0) {
            _setTokenRoyalty(currentTokenId, artisanRecipient, royaltyFeeBps);
        }

        emit ArtworkMinted(
            currentTokenId,
            artisanRecipient,
            artisanRecipient,
            metadataURI,
            royaltyFeeBps
        );

        return currentTokenId;
    }

    /**
     * @notice Permet la mise en pause du contrat en cas d'urgence
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Reprend l'activité normale du contrat
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Résolution des conflits d'héritage entre ERC721URIStorage et ERC2981
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
