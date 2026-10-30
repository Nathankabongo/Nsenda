// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title SendaEscrow
 * @author Équipe Projet SENDA (Master 1 Informatique - Groupe 02)
 * @notice Contrat de séquestre décentralisé conditionnel pour les transactions artisanales physiques.
 * Retient les fonds de l'acheteur en jetons STT jusqu'à confirmation de la livraison matérielle conforme.
 *
 * Machine à états :
 * NonExistent -> Funded -> Released (Parcours nominal : livraison physique confirmée par l'acheteur)
 *                       -> Refunded (Remboursement de l'acheteur sur accord ou arbitrage)
 */
contract SendaEscrow is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    enum OrderStatus {
        NonExistent,
        Funded,
        Released,
        Refunded
    }

    struct Order {
        bytes32 orderId;
        uint256 artworkTokenId;
        address buyer;
        address seller;
        uint256 amount;
        OrderStatus status;
        uint256 fundedAt;
        uint256 releasedAt;
    }

    /// @notice Jeton ERC-20 utilisé pour les paiements (SendaTestToken)
    IERC20 public immutable paymentToken;

    /// @dev Délai de forclusion avant qu'un acheteur puisse solliciter un remboursement automatique (30 jours)
    uint256 public constant DISPUTE_TIMEOUT = 30 days;

    /// @dev Mapping de l'identifiant de commande (bytes32) => Commande sous séquestre
    mapping(bytes32 => Order) public orders;

    /// @notice Événements officiels du protocole de séquestre SENDA
    event PaymentLocked(
        bytes32 indexed orderId,
        uint256 indexed artworkTokenId,
        address indexed buyer,
        address seller,
        uint256 amount,
        uint256 timestamp
    );

    event PaymentReleased(
        bytes32 indexed orderId,
        address indexed seller,
        uint256 amount,
        uint256 timestamp
    );

    event PaymentRefunded(
        bytes32 indexed orderId,
        address indexed buyer,
        uint256 amount,
        uint256 timestamp
    );

    constructor(address _paymentToken) Ownable(msg.sender) {
        require(_paymentToken != address(0), "Adresse de jeton invalide");
        paymentToken = IERC20(_paymentToken);
    }

    /**
     * @notice Dépose et verrouille le paiement d'une œuvre physique sous séquestre
     * @param orderId Identifiant unique de commande (hachage UUID off-chain)
     * @param artworkTokenId Token ID du NFT associé
     * @param seller Adresse du portefeuille de l'artisan créateur
     * @param amount Montant du prix en jetons STT (en Wei)
     */
    function depositPayment(
        bytes32 orderId,
        uint256 artworkTokenId,
        address seller,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        require(orderId != bytes32(0), "Identifiant de commande nul");
        require(orders[orderId].status == OrderStatus.NonExistent, "Commande deja existante");
        require(amount > 0, "Le montant doit etre superieur a 0");
        require(seller != address(0), "Adresse de l'artisan invalide");
        require(seller != msg.sender, "L'artisan ne peut pas acheter sa propre oeuvre");

        // Enregistrement de l'état avant transfert (Checks-Effects-Interactions)
        orders[orderId] = Order({
            orderId: orderId,
            artworkTokenId: artworkTokenId,
            buyer: msg.sender,
            seller: seller,
            amount: amount,
            status: OrderStatus.Funded,
            fundedAt: block.timestamp,
            releasedAt: 0
        });

        // Consignation des jetons dans le contrat de séquestre
        paymentToken.safeTransferFrom(msg.sender, address(this), amount);

        emit PaymentLocked(
            orderId,
            artworkTokenId,
            msg.sender,
            seller,
            amount,
            block.timestamp
        );
    }

    /**
     * @notice Confirme la bonne réception physique de l'œuvre et déclenche la libération irrévocable des fonds
     * @param orderId Identifiant de la commande
     */
    function confirmReceiptAndRelease(bytes32 orderId) external nonReentrant whenNotPaused {
        Order storage order = orders[orderId];

        require(order.status == OrderStatus.Funded, "La commande n'est pas financee ou deja cloturee");
        require(msg.sender == order.buyer, "Seul l'acheteur associe a la commande peut valider la reception");

        // Mutation de l'état interne
        order.status = OrderStatus.Released;
        order.releasedAt = block.timestamp;

        // Virement des fonds vers le portefeuille de l'artisan
        paymentToken.safeTransfer(order.seller, order.amount);

        emit PaymentReleased(orderId, order.seller, order.amount, block.timestamp);
    }

    /**
     * @notice Rembourse intégralement l'acheteur en cas de colis non expédié ou litige validé
     * @param orderId Identifiant de la commande
     */
    function refundBuyer(bytes32 orderId) external nonReentrant whenNotPaused {
        Order storage order = orders[orderId];

        require(order.status == OrderStatus.Funded, "La commande n'est pas en cours de sequestre");

        // Seuls le vendeur (annulation volontaire), l'administrateur, ou l'acheteur apres expiration peuvent declencher
        bool isAuthorized = (msg.sender == order.seller) ||
                            (msg.sender == owner()) ||
                            (msg.sender == order.buyer && (block.timestamp - order.fundedAt >= DISPUTE_TIMEOUT));

        require(isAuthorized, "Non autorise a rembourser cette commande");

        order.status = OrderStatus.Refunded;

        paymentToken.safeTransfer(order.buyer, order.amount);

        emit PaymentRefunded(orderId, order.buyer, order.amount, block.timestamp);
    }

    /**
     * @notice Consultation détaillée d'une commande
     */
    function getOrder(bytes32 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
