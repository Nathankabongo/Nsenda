// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SendaTestToken (STT)
 * @author Équipe Projet SENDA (Master 1 Informatique - Groupe 02)
 * @notice Jeton de simulation économique ERC-20 pour les tests et la recette du séquestre SENDA.
 * Ne représente aucune valeur monétaire réelle.
 */
contract SendaTestToken is ERC20, Ownable {
    /// @notice Montant maximum distribué par appel au robinet (100 STT)
    uint256 public constant FAUCET_AMOUNT = 100 * 10**18;

    /// @notice Délai de temporisation entre deux demandes de robinet par adresse (24h)
    uint256 public constant FAUCET_COOLDOWN = 1 days;

    /// @dev Horodatage du dernier tirage au robinet par adresse
    mapping(address => uint256) public lastFaucetClaim;

    event FaucetClaimed(address indexed recipient, uint256 amount);

    constructor() ERC20("Senda Test Token", "STT") Ownable(msg.sender) {
        // Approvisionnement initial de 1 000 000 STT pour le déployeur / contrat
        _mint(msg.sender, 1_000_000 * 10**decimals());
    }

    /**
     * @notice Permet à tout utilisateur ou évaluateur de recevoir 100 STT gratuitement pour tester
     * @param recipient Adresse devant recevoir les jetons de simulation
     */
    function faucet(address recipient) external {
        require(recipient != address(0), "Adresse invalide");
        require(
            block.timestamp - lastFaucetClaim[recipient] >= FAUCET_COOLDOWN,
            "Robinet deja utilise dans les dernieres 24h"
        );

        lastFaucetClaim[recipient] = block.timestamp;
        _mint(recipient, FAUCET_AMOUNT);

        emit FaucetClaimed(recipient, FAUCET_AMOUNT);
    }

    /**
     * @notice Permet à l'administrateur d'émettre des jetons supplémentaires pour les tests
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
