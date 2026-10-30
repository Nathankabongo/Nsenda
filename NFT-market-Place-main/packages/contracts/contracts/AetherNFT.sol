// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AetherNFT
 * @author Aetheria Team
 * @notice Production-grade ERC-721 implementation with ERC-2981 on-chain royalty standard,
 * metadata URI management, pausing capability, and gas-efficient minting.
 *
 * DESIGN & TRADE-OFF NOTES:
 * 1. Storage: We use ERC721URIStorage to support decentralized metadata URIs (IPFS / Arweave / HTTP)
 *    per token, which allows dynamic and diverse creator assets.
 * 2. Royalties: Full EIP-2981 compatibility ensures secondary sales on this or external marketplaces
 *    (OpenSea, Blur, Rarible) properly recognize creator royalty splits.
 * 3. Access Control: Ownership controls contract pausing and default royalty settings while letting
 *    any user mint their own artwork with their desired royalty rate (up to 10%).
 */
contract AetherNFT is ERC721URIStorage, ERC2981, Ownable, Pausable {
    uint256 private _nextTokenId;
    
    /// @dev Maximum allowed royalty fee in basis points (1000 = 10%)
    uint96 public constant MAX_ROYALTY_BPS = 1000;

    /// @notice Emitted when a new NFT is minted
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed minter,
        address indexed recipient,
        string tokenURI,
        uint96 royaltyFeeBps
    );

    /// @notice Emitted when default royalty is updated
    event DefaultRoyaltyUpdated(address indexed receiver, uint96 feeNumerator);

    /**
     * @param name Name of the NFT collection (e.g., "Aetheria Genesis Collection")
     * @param symbol Symbol of the collection (e.g., "AETH")
     * @param defaultRoyaltyReceiver Address to receive default royalties
     * @param defaultRoyaltyFeeBps Default royalty fee in basis points (e.g., 250 for 2.5%)
     */
    constructor(
        string memory name,
        string memory symbol,
        address defaultRoyaltyReceiver,
        uint96 defaultRoyaltyFeeBps
    ) ERC721(name, symbol) Ownable(msg.sender) {
        require(defaultRoyaltyFeeBps <= MAX_ROYALTY_BPS, "Royalty exceeds max limit");
        if (defaultRoyaltyReceiver != address(0) && defaultRoyaltyFeeBps > 0) {
            _setDefaultRoyalty(defaultRoyaltyReceiver, defaultRoyaltyFeeBps);
        }
    }

    /**
     * @notice Mints a new NFT where msg.sender is registered as the royalty recipient
     * @param recipient The address receiving the newly minted NFT
     * @param uri The metadata URI pointing to IPFS, Arweave, or JSON schema
     * @param royaltyFeeBps Royalty fee in basis points (e.g., 500 = 5.0%), capped at 10%
     * @return tokenId The unique ID of the minted NFT
     */
    function mintNFT(
        address recipient,
        string calldata uri,
        uint96 royaltyFeeBps
    ) external whenNotPaused returns (uint256) {
        return mintNFTWithRoyalty(recipient, msg.sender, uri, royaltyFeeBps);
    }

    /**
     * @notice Mints a new NFT with an explicit royalty recipient
     * @param recipient The address receiving the newly minted NFT
     * @param royaltyReceiver The address receiving secondary sales royalties
     * @param uri The metadata URI
     * @param royaltyFeeBps Royalty fee in basis points
     * @return tokenId The unique ID of the minted NFT
     */
    function mintNFTWithRoyalty(
        address recipient,
        address royaltyReceiver,
        string calldata uri,
        uint96 royaltyFeeBps
    ) public whenNotPaused returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(bytes(uri).length > 0, "URI cannot be empty");
        require(royaltyFeeBps <= MAX_ROYALTY_BPS, "Royalty exceeds 10% maximum");

        uint256 tokenId = ++_nextTokenId;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, uri);

        if (royaltyFeeBps > 0 && royaltyReceiver != address(0)) {
            _setTokenRoyalty(tokenId, royaltyReceiver, royaltyFeeBps);
        }

        emit NFTMinted(tokenId, msg.sender, recipient, uri, royaltyFeeBps);
        return tokenId;
    }

    /**
     * @notice Batch mints multiple NFTs to a recipient in a single transaction
     * @param recipient The address receiving the NFTs
     * @param uris Array of metadata URIs
     * @param royaltyFeeBps Royalty fee in basis points for each token
     * @return tokenIds Array of newly created token IDs
     */
    function batchMintNFT(
        address recipient,
        string[] calldata uris,
        uint96 royaltyFeeBps
    ) external whenNotPaused returns (uint256[] memory) {
        require(recipient != address(0), "Invalid recipient");
        require(uris.length > 0, "Empty URIs array");
        require(uris.length <= 50, "Exceeds max batch size");
        require(royaltyFeeBps <= MAX_ROYALTY_BPS, "Royalty exceeds 10% maximum");

        uint256[] memory tokenIds = new uint256[](uris.length);

        for (uint256 i = 0; i < uris.length; i++) {
            require(bytes(uris[i]).length > 0, "URI cannot be empty");
            uint256 tokenId = ++_nextTokenId;
            _safeMint(recipient, tokenId);
            _setTokenURI(tokenId, uris[i]);

            if (royaltyFeeBps > 0) {
                _setTokenRoyalty(tokenId, msg.sender, royaltyFeeBps);
            }

            tokenIds[i] = tokenId;
            emit NFTMinted(tokenId, msg.sender, recipient, uris[i], royaltyFeeBps);
        }

        return tokenIds;
    }

    /**
     * @notice Total number of NFTs minted so far
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * @notice Updates the default royalty receiver and fee (Owner only)
     */
    function setDefaultRoyalty(
        address receiver,
        uint96 feeNumerator
    ) external onlyOwner {
        require(feeNumerator <= MAX_ROYALTY_BPS, "Royalty exceeds max limit");
        _setDefaultRoyalty(receiver, feeNumerator);
        emit DefaultRoyaltyUpdated(receiver, feeNumerator);
    }

    /**
     * @notice Pause minting and transfers in case of emergency
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // =========================================================================
    // Overrides required by Solidity
    // =========================================================================

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721URIStorage, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
