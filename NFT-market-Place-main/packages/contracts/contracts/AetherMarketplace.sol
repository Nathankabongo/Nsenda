// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AetherMarketplace
 * @author Aetheria Team
 * @notice Production-grade fixed-price NFT Marketplace with atomic swaps,
 * ERC-2981 royalty automatic enforcement, platform fee collection, and reentrancy protection.
 *
 * ARCHITECTURAL DESIGN & TRADE-OFFS:
 * 1. Escrow-Free vs Escrow Architecture:
 *    - We chose an ESCROW-FREE approval-based model (`safeTransferFrom`).
 *    - Sellers do not need to lock their NFTs inside the contract upon listing; they simply approve the marketplace.
 *    - Benefits: Significantly reduces gas costs for sellers when listing/updating/canceling, avoids locking assets,
 *      and eliminates contract custody risk (users keep their NFTs in their wallet until the exact instant of purchase).
 * 2. Atomic Settlement:
 *    - Purchase, platform fee deduction, ERC-2981 creator royalty payout, seller revenue distribution,
 *      and NFT transfer happen in a single, atomic, non-reentrant transaction.
 * 3. Security (Checks-Effects-Interactions):
 *    - State is mutated (listing deactivated) BEFORE external calls or token transfers to prevent reentrancy.
 */
contract AetherMarketplace is ReentrancyGuard, Ownable, Pausable {
    /// @dev Platform fee expressed in basis points (250 = 2.5%, 10000 = 100%)
    uint256 public platformFeeBps;
    
    /// @dev Maximum platform fee cap to protect users (1000 bps = 10%)
    uint256 public constant MAX_PLATFORM_FEE_BPS = 1000;

    /// @notice Address receiving platform trading fees
    address payable public feeRecipient;

    /// @notice Total historical volume traded in Wei
    uint256 public totalVolume;

    /// @notice Total count of sales executed
    uint256 public totalSalesCount;

    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool active;
        uint256 listedAt;
    }

    struct ListingRef {
        address nftContract;
        uint256 tokenId;
    }

    /// @dev Mapping from NFT contract address => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) private _listings;

    /// @dev Array of active listing references for easy frontend and indexer querying
    ListingRef[] private _activeListings;
    /// @dev Mapping from keccak256(nftContract, tokenId) => index in _activeListings array + 1 (0 means not in array)
    mapping(bytes32 => uint256) private _activeListingIndices;

    // =========================================================================
    // Events
    // =========================================================================

    event ItemListed(
        address indexed seller,
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 price,
        uint256 listedAt
    );

    event ItemSold(
        address indexed buyer,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 platformFee,
        uint256 royaltyFee,
        address royaltyRecipient
    );

    event ListingCanceled(
        address indexed seller,
        address indexed nftContract,
        uint256 indexed tokenId
    );

    event ListingUpdated(
        address indexed seller,
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 newPrice
    );

    event PlatformFeeUpdated(uint256 newFeeBps, address newFeeRecipient);

    // =========================================================================
    // Constructor
    // =========================================================================

    /**
     * @param initialFeeBps Initial platform fee in basis points (e.g., 250 for 2.5%)
     * @param initialFeeRecipient Address receiving the platform fees
     */
    constructor(
        uint256 initialFeeBps,
        address payable initialFeeRecipient
    ) Ownable(msg.sender) {
        require(initialFeeBps <= MAX_PLATFORM_FEE_BPS, "Fee exceeds maximum limit");
        require(initialFeeRecipient != address(0), "Invalid fee recipient");

        platformFeeBps = initialFeeBps;
        feeRecipient = initialFeeRecipient;
    }

    // =========================================================================
    // Core Marketplace Functions
    // =========================================================================

    /**
     * @notice Lists an NFT for sale at a fixed price in native currency (ETH / MATIC)
     * @param nftContract The contract address of the ERC-721 NFT
     * @param tokenId The token ID of the NFT
     * @param price The listing price in Wei (must be > 0)
     */
    function listItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external whenNotPaused nonReentrant {
        require(price > 0, "Price must be greater than zero");
        require(nftContract != address(0), "Invalid contract address");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Caller is not the NFT owner");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) ||
            nft.getApproved(tokenId) == address(this),
            "Marketplace is not approved to transfer NFT"
        );

        bytes32 key = _getListingKey(nftContract, tokenId);
        Listing storage listing = _listings[nftContract][tokenId];

        if (!listing.active) {
            _activeListings.push(ListingRef({nftContract: nftContract, tokenId: tokenId}));
            _activeListingIndices[key] = _activeListings.length; // 1-indexed
        }

        _listings[nftContract][tokenId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            active: true,
            listedAt: block.timestamp
        });

        emit ItemListed(msg.sender, nftContract, tokenId, price, block.timestamp);
    }

    /**
     * @notice Purchases a listed NFT with atomic payment splitting and transfer
     * @param nftContract The contract address of the NFT
     * @param tokenId The token ID to purchase
     */
    function buyItem(
        address nftContract,
        uint256 tokenId
    ) external payable whenNotPaused nonReentrant {
        Listing memory listing = _listings[nftContract][tokenId];
        require(listing.active, "Item is not listed for sale");
        require(msg.value >= listing.price, "Insufficient payment sent");
        require(msg.sender != listing.seller, "Seller cannot buy own listing");

        // 1. CHECKS & EFFECTS: Deactivate listing before external interactions
        _removeListing(nftContract, tokenId);

        uint256 price = listing.price;
        address seller = listing.seller;

        // 2. Compute Platform Fee
        uint256 feeAmount = (price * platformFeeBps) / 10000;

        // 3. Compute ERC-2981 Royalty
        address royaltyRecipient = address(0);
        uint256 royaltyAmount = 0;

        try IERC2981(nftContract).royaltyInfo(tokenId, price) returns (
            address receiver,
            uint256 amount
        ) {
            // Guard against misconfigured or malicious royalty amounts (cap at 15%)
            if (receiver != address(0) && amount > 0 && amount <= (price * 1500) / 10000) {
                royaltyRecipient = receiver;
                royaltyAmount = amount;
            }
        } catch {
            // Contract does not support ERC-2981; royalty remains 0
        }

        // 4. Calculate Net Seller Proceeds
        uint256 sellerProceeds = price - feeAmount - royaltyAmount;

        // 5. Update platform analytics
        totalVolume += price;
        totalSalesCount += 1;

        // 6. INTERACTIONS: Safe Fund Transfers
        // Payout platform fee
        if (feeAmount > 0) {
            _safeTransferETH(feeRecipient, feeAmount);
        }

        // Payout royalty to creator
        if (royaltyAmount > 0 && royaltyRecipient != address(0)) {
            _safeTransferETH(payable(royaltyRecipient), royaltyAmount);
        }

        // Payout net proceeds to seller
        _safeTransferETH(payable(seller), sellerProceeds);

        // Refund any excess ETH sent by buyer
        uint256 excessETH = msg.value - price;
        if (excessETH > 0) {
            _safeTransferETH(payable(msg.sender), excessETH);
        }

        // 7. Transfer NFT from seller to buyer
        IERC721(nftContract).safeTransferFrom(seller, msg.sender, tokenId);

        emit ItemSold(
            msg.sender,
            seller,
            nftContract,
            tokenId,
            price,
            feeAmount,
            royaltyAmount,
            royaltyRecipient
        );
    }

    /**
     * @notice Cancels an active listing
     * @param nftContract The contract address of the NFT
     * @param tokenId The token ID to delist
     */
    function cancelListing(
        address nftContract,
        uint256 tokenId
    ) external nonReentrant {
        Listing memory listing = _listings[nftContract][tokenId];
        require(listing.active, "Item is not actively listed");
        require(
            msg.sender == listing.seller || msg.sender == owner(),
            "Only seller or marketplace owner can cancel listing"
        );

        _removeListing(nftContract, tokenId);

        emit ListingCanceled(listing.seller, nftContract, tokenId);
    }

    /**
     * @notice Updates the price of an active listing
     * @param nftContract The contract address of the NFT
     * @param tokenId The token ID of the listing
     * @param newPrice The updated price in Wei
     */
    function updateListing(
        address nftContract,
        uint256 tokenId,
        uint256 newPrice
    ) external nonReentrant {
        require(newPrice > 0, "Price must be greater than zero");
        Listing storage listing = _listings[nftContract][tokenId];
        require(listing.active, "Item is not actively listed");
        require(msg.sender == listing.seller, "Only seller can update price");

        listing.price = newPrice;

        emit ListingUpdated(msg.sender, nftContract, tokenId, newPrice);
    }

    // =========================================================================
    // View Functions for Frontend / Indexer
    // =========================================================================

    /**
     * @notice Fetches details for a specific listing
     */
    function getListing(
        address nftContract,
        uint256 tokenId
    ) external view returns (Listing memory) {
        return _listings[nftContract][tokenId];
    }

    /**
     * @notice Returns total number of active listings
     */
    function getActiveListingsCount() external view returns (uint256) {
        return _activeListings.length;
    }

    /**
     * @notice Returns all currently active listings
     */
    function getAllActiveListings() external view returns (Listing[] memory) {
        uint256 total = _activeListings.length;
        Listing[] memory items = new Listing[](total);

        for (uint256 i = 0; i < total; i++) {
            ListingRef memory ref = _activeListings[i];
            items[i] = _listings[ref.nftContract][ref.tokenId];
        }

        return items;
    }

    /**
     * @notice Paginated retrieval of active listings
     * @param offset Starting index
     * @param limit Maximum number of items to return
     */
    function getActiveListingsPaginated(
        uint256 offset,
        uint256 limit
    ) external view returns (Listing[] memory) {
        uint256 total = _activeListings.length;
        if (offset >= total) {
            return new Listing[](0);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        uint256 resultSize = end - offset;
        Listing[] memory items = new Listing[](resultSize);

        for (uint256 i = 0; i < resultSize; i++) {
            ListingRef memory ref = _activeListings[offset + i];
            items[i] = _listings[ref.nftContract][ref.tokenId];
        }

        return items;
    }

    // =========================================================================
    // Admin Functions
    // =========================================================================

    /**
     * @notice Updates the platform fee and recipient address (Owner only)
     */
    function setPlatformFee(
        uint256 newFeeBps,
        address payable newFeeRecipient
    ) external onlyOwner {
        require(newFeeBps <= MAX_PLATFORM_FEE_BPS, "Fee exceeds maximum limit");
        require(newFeeRecipient != address(0), "Invalid fee recipient");

        platformFeeBps = newFeeBps;
        feeRecipient = newFeeRecipient;

        emit PlatformFeeUpdated(newFeeBps, newFeeRecipient);
    }

    /**
     * @notice Emergency pause for marketplace operations
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause marketplace operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // =========================================================================
    // Internal Helper Functions
    // =========================================================================

    function _getListingKey(
        address nftContract,
        uint256 tokenId
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(nftContract, tokenId));
    }

    function _removeListing(address nftContract, uint256 tokenId) internal {
        _listings[nftContract][tokenId].active = false;

        bytes32 key = _getListingKey(nftContract, tokenId);
        uint256 indexPlusOne = _activeListingIndices[key];

        if (indexPlusOne > 0) {
            uint256 index = indexPlusOne - 1;
            uint256 lastIndex = _activeListings.length - 1;

            if (index != lastIndex) {
                ListingRef memory lastItem = _activeListings[lastIndex];
                _activeListings[index] = lastItem;
                bytes32 lastKey = _getListingKey(lastItem.nftContract, lastItem.tokenId);
                _activeListingIndices[lastKey] = index + 1;
            }

            _activeListings.pop();
            delete _activeListingIndices[key];
        }
    }

    function _safeTransferETH(address payable to, uint256 amount) internal {
        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH transfer failed");
    }
}
