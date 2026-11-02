import { expect } from "chai";
import { ethers } from "hardhat";
import { SendaMarketplace } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SendaMarketplace — Tests Unitaires & Sécurité", function () {
  let marketplace: SendaMarketplace;
  let admin: SignerWithAddress;
  let artisan: SignerWithAddress;
  let acheteur: SignerWithAddress;
  let tiers: SignerWithAddress;

  const PRIX_OEUVRE = ethers.parseEther("0.001"); // 0.001 POL de test

  beforeEach(async function () {
    [admin, artisan, acheteur, tiers] = await ethers.getSigners();

    const SendaMarketplaceFactory = await ethers.getContractFactory("SendaMarketplace");
    // Déploiement avec validationRequise = false (publication libre par défaut)
    marketplace = (await SendaMarketplaceFactory.deploy(false)) as unknown as SendaMarketplace;
    await marketplace.waitForDeployment();
  });

  describe("1. Publication par l'artisan", function () {
    it("Doit enregistrer l'artisan via msg.sender sans qu'il ne saisisse son adresse", async function () {
      const tx = await marketplace.connect(artisan).ajouterOeuvre(
        "Masque Royal Pende",
        "Sculpté en bois de wengé au Kwilu",
        "https://ipfs.io/ipfs/QmExempleHash123",
        PRIX_OEUVRE
      );

      await expect(tx)
        .to.emit(marketplace, "OeuvreAjoutee")
        .withArgs(1, artisan.address, "Masque Royal Pende", PRIX_OEUVRE);

      const oeuvre = await marketplace.oeuvres(1);
      expect(oeuvre.id).to.equal(1);
      expect(oeuvre.artisan).to.equal(artisan.address);
      expect(oeuvre.titre).to.equal("Masque Royal Pende");
      expect(oeuvre.prix).to.equal(PRIX_OEUVRE);
      expect(oeuvre.active).to.be.true;
    });

    it("Doit rejeter une œuvre sans titre ou sans lien d'image", async function () {
      await expect(
        marketplace.connect(artisan).ajouterOeuvre("", "Desc", "https://image.png", PRIX_OEUVRE)
      ).to.be.revertedWith("Le titre de l'oeuvre est obligatoire");

      await expect(
        marketplace.connect(artisan).ajouterOeuvre("Titre", "Desc", "", PRIX_OEUVRE)
      ).to.be.revertedWith("Le lien de l'image est obligatoire");
    });

    it("Doit rejeter un prix égal à 0", async function () {
      await expect(
        marketplace.connect(artisan).ajouterOeuvre("Titre", "Desc", "https://image.png", 0)
      ).to.be.revertedWith("Le prix doit etre strictement superieur a 0");
    });
  });

  describe("2. Consultation du catalogue (Lecture publique)", function () {
    it("Doit retourner toutes les œuvres publiées et filtrer par artisan", async function () {
      await marketplace.connect(artisan).ajouterOeuvre(
        "Statue 1", "Desc 1", "https://img1.png", PRIX_OEUVRE
      );
      await marketplace.connect(artisan).ajouterOeuvre(
        "Statue 2", "Desc 2", "https://img2.png", PRIX_OEUVRE * 2n
      );

      const catalogue = await marketplace.getCatalogue();
      expect(catalogue.length).to.equal(2);
      expect(catalogue[0].titre).to.equal("Statue 1");
      expect(catalogue[1].titre).to.equal("Statue 2");

      const mesOeuvres = await marketplace.getOeuvresParArtisan(artisan.address);
      expect(mesOeuvres.length).to.equal(2);
    });
  });

  describe("3. Commande & Paiement direct", function () {
    beforeEach(async function () {
      await marketplace.connect(artisan).ajouterOeuvre(
        "Statuette Kuba",
        "Bois précieux",
        "https://ipfs.io/ipfs/QmKuba",
        PRIX_OEUVRE
      );
    });

    it("Doit transférer directement les fonds à l'artisan sans les conserver", async function () {
      const soldeArtisanAvant = await ethers.provider.getBalance(artisan.address);
      const adresseContrat = await marketplace.getAddress();

      // L'acheteur commande avec le montant exact
      const tx = await marketplace.connect(acheteur).commander(1, { value: PRIX_OEUVRE });

      await expect(tx)
        .to.emit(marketplace, "CommandePassee")
        .withArgs(1, 1, acheteur.address, artisan.address, PRIX_OEUVRE);

      // 1. Le solde de l'artisan a augmenté exactement du montant de l'œuvre
      const soldeArtisanApres = await ethers.provider.getBalance(artisan.address);
      expect(soldeArtisanApres - soldeArtisanAvant).to.equal(PRIX_OEUVRE);

      // 2. Le contrat ne conserve STRICTEMENT AUCUN FONDS (solde = 0)
      const soldeContrat = await ethers.provider.getBalance(adresseContrat);
      expect(soldeContrat).to.equal(0n);

      // 3. L'œuvre est désormais inactive
      const oeuvre = await marketplace.oeuvres(1);
      expect(oeuvre.active).to.be.false;
    });

    it("Doit interdire à un artisan d'acheter sa propre œuvre", async function () {
      await expect(
        marketplace.connect(artisan).commander(1, { value: PRIX_OEUVRE })
      ).to.be.revertedWith("L'artisan ne peut pas acheter sa propre oeuvre");
    });

    it("Doit interdire l'achat si le montant envoyé est incorrect", async function () {
      await expect(
        marketplace.connect(acheteur).commander(1, { value: PRIX_OEUVRE / 2n })
      ).to.be.revertedWith("Montant POL transmis incorrect (doit etre exactement le prix)");
    });

    it("Doit interdire l'achat d'une œuvre déjà vendue ou inactive", async function () {
      // Premier achat
      await marketplace.connect(acheteur).commander(1, { value: PRIX_OEUVRE });

      // Deuxième tentative d'achat de la même œuvre
      await expect(
        marketplace.connect(tiers).commander(1, { value: PRIX_OEUVRE })
      ).to.be.revertedWith("Oeuvre indisponible ou deja vendue");
    });
  });

  describe("4. Gestion par l'artisan", function () {
    beforeEach(async function () {
      await marketplace.connect(artisan).ajouterOeuvre(
        "Siège Royal",
        "Bois sculpté",
        "https://image.png",
        PRIX_OEUVRE
      );
    });

    it("Permet à l'artisan de modifier son prix et de désactiver/réactiver son œuvre", async function () {
      const NOUVEAU_PRIX = ethers.parseEther("0.005");
      await marketplace.connect(artisan).modifierOeuvre(1, NOUVEAU_PRIX, false);

      let oeuvre = await marketplace.oeuvres(1);
      expect(oeuvre.prix).to.equal(NOUVEAU_PRIX);
      expect(oeuvre.active).to.be.false;

      // Réactivation
      await marketplace.connect(artisan).modifierOeuvre(1, NOUVEAU_PRIX, true);
      oeuvre = await marketplace.oeuvres(1);
      expect(oeuvre.active).to.be.true;
    });

    it("Interdit à un tiers de modifier l'œuvre d'un autre artisan", async function () {
      await expect(
        marketplace.connect(tiers).modifierOeuvre(1, ethers.parseEther("0.005"), false)
      ).to.be.revertedWith("Seul le createur peut modifier cette oeuvre");
    });
  });

  describe("5. Mode de validation par l'administrateur", function () {
    it("Doit bloquer les artisans non validés si validationRequise = true", async function () {
      // Activation du mode validation par l'admin
      await marketplace.connect(admin).setValidationRequise(true);

      // L'artisan tente de publier sans validation -> rejeté
      await expect(
        marketplace.connect(artisan).ajouterOeuvre("Masque", "Desc", "https://img.png", PRIX_OEUVRE)
      ).to.be.revertedWith("Artisan non homologue par l'administration Senda");

      // L'admin homologue l'artisan
      await marketplace.connect(admin).homologuerArtisan(artisan.address, true);

      // Maintenant l'artisan peut publier avec succès
      await expect(
        marketplace.connect(artisan).ajouterOeuvre("Masque", "Desc", "https://img.png", PRIX_OEUVRE)
      ).to.emit(marketplace, "OeuvreAjoutee");
    });

    it("Interdit à un non-admin de modifier le mode ou de valider des artisans", async function () {
      await expect(
        marketplace.connect(artisan).setValidationRequise(true)
      ).to.be.revertedWith("Action reservee a l'administrateur Senda");

      await expect(
        marketplace.connect(artisan).homologuerArtisan(artisan.address, true)
      ).to.be.revertedWith("Action reservee a l'administrateur Senda");
    });
  });
});
