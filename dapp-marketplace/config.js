/**
 * Configuration Web3 de la Marketplace SENDA (Polygon Amoy Testnet)
 */

// Adresse réelle du contrat déployé sur Remix par l'utilisateur
export const CONTRACT_ADDRESS = "0x9a3fc7e44ee5496a93a54fcc0d667fa0cd448952";

// Configuration du réseau Polygon Amoy (Chain ID 80002)
export const AMOY_CHAIN_ID_HEX = "0x13882"; // 80002 en hexadécimal
export const AMOY_CONFIG = {
  chainId: AMOY_CHAIN_ID_HEX,
  chainName: "Polygon Amoy Testnet",
  nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
  rpcUrls: ["https://rpc-amoy.polygon.technology"],
  blockExplorerUrls: ["https://amoy.polygonscan.com"]
};

// ABI lisible ethers.js v6 conforme à SendaMarketplace.sol
export const CONTRACT_ABI = [
  "function nbOeuvres() view returns (uint256)",
  "function nbCommandes() view returns (uint256)",
  "function validationRequise() view returns (bool)",
  "function artisansHomologues(address) view returns (bool)",
  "function getCatalogue() view returns (tuple(uint256 id, address artisan, string titre, string description, string image, uint256 prix, bool active)[])",
  "function getOeuvresParArtisan(address) view returns (tuple(uint256 id, address artisan, string titre, string description, string image, uint256 prix, bool active)[])",
  "function ajouterOeuvre(string titre, string description, string image, uint256 prix) returns (uint256)",
  "function modifierOeuvre(uint256 id, uint256 nouveauPrix, bool active)",
  "function commander(uint256 oeuvreId) payable",
  "event OeuvreAjoutee(uint256 indexed id, address indexed artisan, string titre, uint256 prix)",
  "event OeuvreModifiee(uint256 indexed id, uint256 nouveauPrix, bool active)",
  "event CommandePassee(uint256 commandeId, uint256 indexed oeuvreId, address indexed acheteur, address indexed artisan, uint256 montant)"
];

/**
 * Vérifie que le portefeuille MetaMask est bien connecté à Polygon Amoy (80002).
 * Propose la bascule ou l'ajout automatique si nécessaire.
 */
export async function verifierReseauAmoy() {
  if (!window.ethereum) {
    throw new Error("MetaMask n'est pas détecté. Veuillez installer l'extension MetaMask pour interagir avec la blockchain.");
  }
  const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
  if (currentChainId.toLowerCase() !== AMOY_CHAIN_ID_HEX.toLowerCase()) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: AMOY_CHAIN_ID_HEX }]
      });
    } catch (switchError) {
      // Code 4902 : le réseau Amoy n'existe pas encore dans MetaMask
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
