import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("=================================================");
  console.log(`🚀 Deploying Aetheria Contracts to network: ${network.name}`);
  console.log(`👤 Deployer Address: ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer Balance: ${ethers.formatEther(balance)} ETH`);
  console.log("=================================================");

  // 1. Deploy AetherNFT
  const defaultRoyaltyReceiver = deployer.address;
  const defaultRoyaltyBps = 250; // 2.5% default royalty

  console.log("\n📦 1. Deploying AetherNFT...");
  const AetherNFTFactory = await ethers.getContractFactory("AetherNFT");
  const aetherNFT = await AetherNFTFactory.deploy(
    "Aetheria Genesis Collection",
    "AETH",
    defaultRoyaltyReceiver,
    defaultRoyaltyBps
  );
  await aetherNFT.waitForDeployment();
  const nftAddress = await aetherNFT.getAddress();
  console.log(`✅ AetherNFT deployed to: ${nftAddress}`);

  // 2. Deploy AetherMarketplace
  const platformFeeBps = 250; // 2.5% platform fee
  const feeRecipient = deployer.address;

  console.log("\n📦 2. Deploying AetherMarketplace...");
  const AetherMarketplaceFactory = await ethers.getContractFactory("AetherMarketplace");
  const aetherMarketplace = await AetherMarketplaceFactory.deploy(
    platformFeeBps,
    feeRecipient
  );
  await aetherMarketplace.waitForDeployment();
  const marketplaceAddress = await aetherMarketplace.getAddress();
  console.log(`✅ AetherMarketplace deployed to: ${marketplaceAddress}`);

  // 3. For local or testnet initial seeding: Mint demo NFTs
  if (network.name === "localhost" || network.name === "hardhat") {
    console.log("\n🎨 Seeding Demo NFTs for local development...");

    const sampleNFTs = [
      {
        uri: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80",
        name: "Cybernetic Horizon #001",
        description: "A futuristic depiction of digital reality in the Aetheria metaverse.",
        price: ethers.parseEther("0.25"),
        royalty: 500, // 5%
      },
      {
        uri: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        name: "Quantum Obsidian #002",
        description: "Dark matter crystalline structure sculpted across algorithmic dimensions.",
        price: ethers.parseEther("0.50"),
        royalty: 500,
      },
      {
        uri: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80",
        name: "Neon Genesis Core #003",
        description: "Luminescent kinetic entity radiating digital energy.",
        price: ethers.parseEther("0.85"),
        royalty: 500,
      },
    ];

    // Approve marketplace for all
    await aetherNFT.setApprovalForAll(marketplaceAddress, true);

    for (let i = 0; i < sampleNFTs.length; i++) {
      const item = sampleNFTs[i];
      // Generate a mock metadata JSON URI (data URI format for instant offline rendering)
      const metadata = {
        name: item.name,
        description: item.description,
        image: item.uri,
        attributes: [
          { trait_type: "Rarity", value: "Legendary" },
          { trait_type: "Generation", value: "Genesis" },
          { trait_type: "Power Level", value: 9000 + i * 150 },
        ],
      };
      const metadataURI = `data:application/json;utf8,${encodeURIComponent(JSON.stringify(metadata))}`;

      const mintTx = await aetherNFT.mintNFT(deployer.address, metadataURI, item.royalty);
      await mintTx.wait();
      const tokenId = i + 1;
      console.log(`   ✨ Minted tokenId #${tokenId}: "${item.name}"`);

      // List the first 2 NFTs on the marketplace
      if (i < 2) {
        const listTx = await aetherMarketplace.listItem(nftAddress, tokenId, item.price);
        await listTx.wait();
        console.log(`   🏷️ Listed tokenId #${tokenId} for ${ethers.formatEther(item.price)} ETH`);
      }
    }
  }

  // 4. Export Contract Addresses & ABIs for the Frontend
  const contractsExport = {
    network: network.name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    contracts: {
      AetherNFT: {
        address: nftAddress,
      },
      AetherMarketplace: {
        address: marketplaceAddress,
      },
    },
  };

  const outputDir = path.join(__dirname, "../../../apps/web/lib/contracts");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, "deployed-contracts.json"),
    JSON.stringify(contractsExport, null, 2)
  );

  console.log("\n📁 Exported contract deployment config to apps/web/lib/contracts/deployed-contracts.json");
  console.log("=================================================");
  console.log("🎉 Deployment & setup completed successfully!");
  console.log("=================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment error:", error);
    process.exit(1);
  });
