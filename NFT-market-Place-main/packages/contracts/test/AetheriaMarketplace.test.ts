import { expect } from "chai";
import { ethers } from "hardhat";
import { AetherNFT, AetherMarketplace } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Aetheria NFT Marketplace - Phase 1 Test Suite", function () {
  let nft: AetherNFT;
  let marketplace: AetherMarketplace;
  let owner: SignerWithAddress;
  let seller: SignerWithAddress;
  let buyer: SignerWithAddress;
  let creator: SignerWithAddress;
  let feeRecipient: SignerWithAddress;

  const PLATFORM_FEE_BPS = 250; // 2.5%
  const CREATOR_ROYALTY_BPS = 500; // 5.0%
  const SAMPLE_URI = "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/metadata.json";

  beforeEach(async function () {
    [owner, seller, buyer, creator, feeRecipient] = await ethers.getSigners();

    // 1. Deploy AetherNFT
    const AetherNFTFactory = await ethers.getContractFactory("AetherNFT");
    nft = (await AetherNFTFactory.deploy(
      "Aetheria Genesis",
      "AETH",
      creator.address,
      250 // Default 2.5% royalty to creator
    )) as AetherNFT;
    await nft.waitForDeployment();

    // 2. Deploy AetherMarketplace
    const AetherMarketplaceFactory = await ethers.getContractFactory("AetherMarketplace");
    marketplace = (await AetherMarketplaceFactory.deploy(
      PLATFORM_FEE_BPS,
      feeRecipient.address
    )) as AetherMarketplace;
    await marketplace.waitForDeployment();
  });

  describe("AetherNFT ERC-721 Contract", function () {
    it("should initialize with correct name, symbol, and default royalty", async function () {
      expect(await nft.name()).to.equal("Aetheria Genesis");
      expect(await nft.symbol()).to.equal("AETH");

      const salePrice = ethers.parseEther("1.0");
      const [receiver, amount] = await nft.royaltyInfo(1, salePrice);
      expect(receiver).to.equal(creator.address);
      expect(amount).to.equal(ethers.parseEther("0.025")); // 2.5% of 1 ETH
    });

    it("should allow a creator to mint an NFT with custom royalty and tokenURI", async function () {
      const tx = await nft.connect(creator).mintNFT(
        creator.address,
        SAMPLE_URI,
        CREATOR_ROYALTY_BPS // 5%
      );
      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;

      expect(await nft.ownerOf(1)).to.equal(creator.address);
      expect(await nft.tokenURI(1)).to.equal(SAMPLE_URI);
      expect(await nft.totalSupply()).to.equal(1);

      // Verify custom 5% royalty for this token
      const salePrice = ethers.parseEther("2.0");
      const [receiver, amount] = await nft.royaltyInfo(1, salePrice);
      expect(receiver).to.equal(creator.address);
      expect(amount).to.equal(ethers.parseEther("0.10")); // 5% of 2 ETH = 0.1 ETH
    });

    it("should revert if royalty exceeds 10% (1000 bps)", async function () {
      await expect(
        nft.connect(seller).mintNFT(seller.address, SAMPLE_URI, 1001)
      ).to.be.revertedWith("Royalty exceeds 10% maximum");
    });

    it("should batch mint multiple NFTs successfully", async function () {
      const uris = [SAMPLE_URI, SAMPLE_URI, SAMPLE_URI];
      await nft.connect(seller).batchMintNFT(seller.address, uris, 300);

      expect(await nft.totalSupply()).to.equal(3);
      expect(await nft.ownerOf(1)).to.equal(seller.address);
      expect(await nft.ownerOf(2)).to.equal(seller.address);
      expect(await nft.ownerOf(3)).to.equal(seller.address);
    });

    it("should allow owner to pause and unpause transfers/minting", async function () {
      await nft.pause();
      await expect(
        nft.connect(seller).mintNFT(seller.address, SAMPLE_URI, 0)
      ).to.be.revertedWithCustomError(nft, "EnforcedPause");

      await nft.unpause();
      await expect(nft.connect(seller).mintNFT(seller.address, SAMPLE_URI, 0)).to.not.be.reverted;
    });
  });

  describe("AetherMarketplace Core Mechanics", function () {
    let tokenId: number;
    const listingPrice = ethers.parseEther("1.0");

    beforeEach(async function () {
      // Creator mints NFT to seller with 5% royalty to creator
      const tx = await nft.connect(creator).mintNFT(
        seller.address,
        SAMPLE_URI,
        CREATOR_ROYALTY_BPS
      );
      await tx.wait();
      tokenId = 1;
    });

    it("should fail to list if marketplace is not approved", async function () {
      const nftAddress = await nft.getAddress();
      await expect(
        marketplace.connect(seller).listItem(nftAddress, tokenId, listingPrice)
      ).to.be.revertedWith("Marketplace is not approved to transfer NFT");
    });

    it("should successfully list an NFT when approved", async function () {
      const nftAddress = await nft.getAddress();
      const marketplaceAddress = await marketplace.getAddress();

      // Seller approves marketplace
      await nft.connect(seller).approve(marketplaceAddress, tokenId);

      // Seller lists NFT
      await expect(
        marketplace.connect(seller).listItem(nftAddress, tokenId, listingPrice)
      )
        .to.emit(marketplace, "ItemListed")
        .withArgs(seller.address, nftAddress, tokenId, listingPrice, (val: any) => typeof val === "bigint" || typeof val === "number");

      const listing = await marketplace.getListing(nftAddress, tokenId);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(listingPrice);
      expect(listing.active).to.be.true;
      expect(await marketplace.getActiveListingsCount()).to.equal(1);
    });

    it("should allow seller to update the listing price", async function () {
      const nftAddress = await nft.getAddress();
      const marketplaceAddress = await marketplace.getAddress();

      await nft.connect(seller).approve(marketplaceAddress, tokenId);
      await marketplace.connect(seller).listItem(nftAddress, tokenId, listingPrice);

      const newPrice = ethers.parseEther("1.5");
      await expect(
        marketplace.connect(seller).updateListing(nftAddress, tokenId, newPrice)
      )
        .to.emit(marketplace, "ListingUpdated")
        .withArgs(seller.address, nftAddress, tokenId, newPrice);

      const listing = await marketplace.getListing(nftAddress, tokenId);
      expect(listing.price).to.equal(newPrice);
    });

    it("should allow seller to cancel an active listing", async function () {
      const nftAddress = await nft.getAddress();
      const marketplaceAddress = await marketplace.getAddress();

      await nft.connect(seller).approve(marketplaceAddress, tokenId);
      await marketplace.connect(seller).listItem(nftAddress, tokenId, listingPrice);

      await expect(
        marketplace.connect(seller).cancelListing(nftAddress, tokenId)
      )
        .to.emit(marketplace, "ListingCanceled")
        .withArgs(seller.address, nftAddress, tokenId);

      const listing = await marketplace.getListing(nftAddress, tokenId);
      expect(listing.active).to.be.false;
      expect(await marketplace.getActiveListingsCount()).to.equal(0);
    });

    it("should execute purchase with correct payment split: platform fee, creator royalty, seller proceeds, and NFT transfer", async function () {
      const nftAddress = await nft.getAddress();
      const marketplaceAddress = await marketplace.getAddress();

      await nft.connect(seller).approve(marketplaceAddress, tokenId);
      await marketplace.connect(seller).listItem(nftAddress, tokenId, listingPrice);

      // Track initial balances
      const initialSellerBalance = await ethers.provider.getBalance(seller.address);
      const initialCreatorBalance = await ethers.provider.getBalance(creator.address);
      const initialFeeRecipientBalance = await ethers.provider.getBalance(feeRecipient.address);

      // Price: 1.0 ETH
      // Platform Fee (2.5%): 0.025 ETH
      // Royalty (5.0%): 0.050 ETH
      // Net Seller Proceeds (92.5%): 0.925 ETH
      const expectedPlatformFee = ethers.parseEther("0.025");
      const expectedRoyalty = ethers.parseEther("0.050");
      const expectedSellerProceeds = ethers.parseEther("0.925");

      // Buyer purchases NFT with 1.2 ETH (sending 0.2 ETH excess to test refund)
      const buyTx = await marketplace.connect(buyer).buyItem(nftAddress, tokenId, {
        value: ethers.parseEther("1.2"),
      });
      await buyTx.wait();

      // Verify NFT ownership transfer
      expect(await nft.ownerOf(tokenId)).to.equal(buyer.address);

      // Verify listing is deactivated
      const listing = await marketplace.getListing(nftAddress, tokenId);
      expect(listing.active).to.be.false;
      expect(await marketplace.getActiveListingsCount()).to.equal(0);

      // Verify platform analytics
      expect(await marketplace.totalVolume()).to.equal(listingPrice);
      expect(await marketplace.totalSalesCount()).to.equal(1);

      // Check balance increases
      const finalSellerBalance = await ethers.provider.getBalance(seller.address);
      const finalCreatorBalance = await ethers.provider.getBalance(creator.address);
      const finalFeeRecipientBalance = await ethers.provider.getBalance(feeRecipient.address);

      expect(finalSellerBalance - initialSellerBalance).to.equal(expectedSellerProceeds);
      expect(finalCreatorBalance - initialCreatorBalance).to.equal(expectedRoyalty);
      expect(finalFeeRecipientBalance - initialFeeRecipientBalance).to.equal(expectedPlatformFee);
    });

    it("should revert if buyer sends less than the listing price", async function () {
      const nftAddress = await nft.getAddress();
      const marketplaceAddress = await marketplace.getAddress();

      await nft.connect(seller).approve(marketplaceAddress, tokenId);
      await marketplace.connect(seller).listItem(nftAddress, tokenId, listingPrice);

      await expect(
        marketplace.connect(buyer).buyItem(nftAddress, tokenId, {
          value: ethers.parseEther("0.9"),
        })
      ).to.be.revertedWith("Insufficient payment sent");
    });

    it("should revert if seller attempts to buy their own listing", async function () {
      const nftAddress = await nft.getAddress();
      const marketplaceAddress = await marketplace.getAddress();

      await nft.connect(seller).approve(marketplaceAddress, tokenId);
      await marketplace.connect(seller).listItem(nftAddress, tokenId, listingPrice);

      await expect(
        marketplace.connect(seller).buyItem(nftAddress, tokenId, {
          value: listingPrice,
        })
      ).to.be.revertedWith("Seller cannot buy own listing");
    });

    it("should correctly fetch paginated active listings", async function () {
      const nftAddress = await nft.getAddress();
      const marketplaceAddress = await marketplace.getAddress();

      // Mint 2 more tokens
      await nft.connect(seller).mintNFT(seller.address, SAMPLE_URI, 0); // tokenId 2
      await nft.connect(seller).mintNFT(seller.address, SAMPLE_URI, 0); // tokenId 3

      await nft.connect(seller).setApprovalForAll(marketplaceAddress, true);

      await marketplace.connect(seller).listItem(nftAddress, 1, ethers.parseEther("1.0"));
      await marketplace.connect(seller).listItem(nftAddress, 2, ethers.parseEther("2.0"));
      await marketplace.connect(seller).listItem(nftAddress, 3, ethers.parseEther("3.0"));

      expect(await marketplace.getActiveListingsCount()).to.equal(3);

      const allItems = await marketplace.getAllActiveListings();
      expect(allItems.length).to.equal(3);

      const page1 = await marketplace.getActiveListingsPaginated(0, 2);
      expect(page1.length).to.equal(2);
      expect(page1[0].tokenId).to.equal(1);
      expect(page1[1].tokenId).to.equal(2);

      const page2 = await marketplace.getActiveListingsPaginated(2, 2);
      expect(page2.length).to.equal(1);
      expect(page2[0].tokenId).to.equal(3);
    });
  });
});
