import { expect } from "chai";
import { ethers } from "hardhat";
import { SendaNFT, SendaTestToken, SendaEscrow } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Protocole SENDA - Suite de Tests des Smart Contracts", function () {
  let nft: SendaNFT;
  let token: SendaTestToken;
  let escrow: SendaEscrow;

  let owner: SignerWithAddress;
  let artisan: SignerWithAddress;
  let buyer: SignerWithAddress;
  let attacker: SignerWithAddress;

  const SAMPLE_METADATA_URI = "ipfs://bafybeihsendapende001metadatajsoncid/metadata.json";
  const ARTWORK_PRICE = ethers.parseEther("180"); // 180 STT
  const ORDER_ID = ethers.keccak256(ethers.toUtf8Bytes("order-uuid-test-550e8400"));

  beforeEach(async function () {
    [owner, artisan, buyer, attacker] = await ethers.getSigners();

    // 1. Déploiement de SendaTestToken (STT)
    const TokenFactory = await ethers.getContractFactory("SendaTestToken");
    token = (await TokenFactory.deploy()) as SendaTestToken;
    await token.waitForDeployment();

    // 2. Déploiement de SendaNFT
    const NFTFactory = await ethers.getContractFactory("SendaNFT");
    nft = (await NFTFactory.deploy(
      "SENDA Artisanat Congolais",
      "SENDA",
      artisan.address,
      500 // 5% de redevance par défaut
    )) as SendaNFT;
    await nft.waitForDeployment();

    // 3. Déploiement de SendaEscrow
    const EscrowFactory = await ethers.getContractFactory("SendaEscrow");
    escrow = (await EscrowFactory.deploy(await token.getAddress())) as SendaEscrow;
    await escrow.waitForDeployment();

    // Approvisionner l'acheteur en jetons STT pour le test
    await token.transfer(buyer.address, ethers.parseEther("1000"));
  });

  describe("1. Contrat SendaTestToken (ERC-20)", function () {
    it("doit initialiser correctement le nom, le symbole et les soldes", async function () {
      expect(await token.name()).to.equal("Senda Test Token");
      expect(await token.symbol()).to.equal("STT");
      expect(await token.balanceOf(buyer.address)).to.equal(ethers.parseEther("1000"));
    });

    it("doit permettre à un visiteur d'utiliser le robinet (faucet)", async function () {
      const balanceBefore = await token.balanceOf(attacker.address);
      await token.connect(attacker).faucet(attacker.address);
      const balanceAfter = await token.balanceOf(attacker.address);

      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("100"));
    });

    it("doit rejeter une double utilisation du robinet dans les 24h", async function () {
      await token.connect(attacker).faucet(attacker.address);
      await expect(
        token.connect(attacker).faucet(attacker.address)
      ).to.be.revertedWith("Robinet deja utilise dans les dernieres 24h");
    });
  });

  describe("2. Contrat SendaNFT (ERC-721 + ERC-2981)", function () {
    it("doit minter un certificat d'œuvre avec redevance d'artisan", async function () {
      const tx = await nft.connect(artisan).mintArtwork(
        artisan.address,
        SAMPLE_METADATA_URI,
        500 // 5%
      );
      await tx.wait();

      expect(await nft.ownerOf(1)).to.equal(artisan.address);
      expect(await nft.tokenURI(1)).to.equal(SAMPLE_METADATA_URI);

      // Vérification ERC-2981
      const [receiver, royaltyAmount] = await nft.royaltyInfo(1, ethers.parseEther("100"));
      expect(receiver).to.equal(artisan.address);
      expect(royaltyAmount).to.equal(ethers.parseEther("5")); // 5% de 100 STT = 5 STT
    });

    it("doit refuser une redevance supérieure à 10%", async function () {
      await expect(
        nft.connect(artisan).mintArtwork(artisan.address, SAMPLE_METADATA_URI, 1001)
      ).to.be.revertedWith("Redevance superieure a 10%");
    });
  });

  describe("3. Contrat SendaEscrow (Séquestre Physique)", function () {
    beforeEach(async function () {
      // Mint de l'œuvre pour l'artisan
      await nft.connect(artisan).mintArtwork(artisan.address, SAMPLE_METADATA_URI, 500);

      // Approbation préalable par l'acheteur des jetons au contrat de séquestre
      await token.connect(buyer).approve(await escrow.getAddress(), ARTWORK_PRICE);
    });

    it("doit consigner les fonds sous séquestre lors du dépôt (Created -> Funded)", async function () {
      const tx = await escrow.connect(buyer).depositPayment(
        ORDER_ID,
        1,
        artisan.address,
        ARTWORK_PRICE
      );
      await tx.wait();

      const order = await escrow.getOrder(ORDER_ID);
      expect(order.buyer).to.equal(buyer.address);
      expect(order.seller).to.equal(artisan.address);
      expect(order.amount).to.equal(ARTWORK_PRICE);
      expect(order.status).to.equal(1); // OrderStatus.Funded

      // Vérification que le contrat détient bien les jetons consignés
      expect(await token.balanceOf(await escrow.getAddress())).to.equal(ARTWORK_PRICE);
    });

    it("doit exécuter le parcours nominal complet (Funded -> Released)", async function () {
      // 1. Dépôt
      await escrow.connect(buyer).depositPayment(ORDER_ID, 1, artisan.address, ARTWORK_PRICE);

      const artisanBalanceBefore = await token.balanceOf(artisan.address);

      // 2. L'acheteur confirme la réception physique
      const tx = await escrow.connect(buyer).confirmReceiptAndRelease(ORDER_ID);
      await tx.wait();

      const order = await escrow.getOrder(ORDER_ID);
      expect(order.status).to.equal(2); // OrderStatus.Released

      const artisanBalanceAfter = await token.balanceOf(artisan.address);
      expect(artisanBalanceAfter - artisanBalanceBefore).to.equal(ARTWORK_PRICE);
    });

    it("doit interdire à un tiers de confirmer la réception à la place de l'acheteur", async function () {
      await escrow.connect(buyer).depositPayment(ORDER_ID, 1, artisan.address, ARTWORK_PRICE);

      // L'attaquant ou même le vendeur ne peut pas débloquer
      await expect(
        escrow.connect(attacker).confirmReceiptAndRelease(ORDER_ID)
      ).to.be.revertedWith("Seul l'acheteur associe a la commande peut valider la reception");

      await expect(
        escrow.connect(artisan).confirmReceiptAndRelease(ORDER_ID)
      ).to.be.revertedWith("Seul l'acheteur associe a la commande peut valider la reception");
    });

    it("doit permettre le remboursement de l'acheteur en cas d'annulation par le vendeur (Funded -> Refunded)", async function () {
      await escrow.connect(buyer).depositPayment(ORDER_ID, 1, artisan.address, ARTWORK_PRICE);

      const buyerBalanceBefore = await token.balanceOf(buyer.address);

      // Le vendeur annule / consent au remboursement
      await escrow.connect(artisan).refundBuyer(ORDER_ID);

      const order = await escrow.getOrder(ORDER_ID);
      expect(order.status).to.equal(3); // OrderStatus.Refunded

      const buyerBalanceAfter = await token.balanceOf(buyer.address);
      expect(buyerBalanceAfter - buyerBalanceBefore).to.equal(ARTWORK_PRICE);
    });
  });
});
