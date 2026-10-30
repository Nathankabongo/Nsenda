import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("=================================================");
  console.log(`🚀 Déploiement du protocole SENDA sur : ${network.name}`);
  console.log(`👤 Portefeuille Déployeur : ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Solde : ${ethers.formatEther(balance)} POL/ETH`);
  console.log("=================================================");

  // 1. Déploiement de SendaTestToken (STT)
  console.log("\n📦 1. Déploiement de SendaTestToken (ERC-20)...");
  const SendaTestTokenFactory = await ethers.getContractFactory("SendaTestToken");
  const token = await SendaTestTokenFactory.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`✅ SendaTestToken déployé à : ${tokenAddress}`);

  // 2. Déploiement de SendaNFT
  console.log("\n📦 2. Déploiement de SendaNFT (ERC-721 + ERC-2981)...");
  const defaultRoyaltyReceiver = deployer.address;
  const defaultRoyaltyBps = 500; // 5% par défaut

  const SendaNFTFactory = await ethers.getContractFactory("SendaNFT");
  const sendaNFT = await SendaNFTFactory.deploy(
    "SENDA Artisanat Congolais",
    "SENDA",
    defaultRoyaltyReceiver,
    defaultRoyaltyBps
  );
  await sendaNFT.waitForDeployment();
  const nftAddress = await sendaNFT.getAddress();
  console.log(`✅ SendaNFT déployé à : ${nftAddress}`);

  // 3. Déploiement de SendaEscrow
  console.log("\n📦 3. Déploiement de SendaEscrow (Séquestre Physique)...");
  const SendaEscrowFactory = await ethers.getContractFactory("SendaEscrow");
  const sendaEscrow = await SendaEscrowFactory.deploy(tokenAddress);
  await sendaEscrow.waitForDeployment();
  const escrowAddress = await sendaEscrow.getAddress();
  console.log(`✅ SendaEscrow déployé à : ${escrowAddress}`);

  // 4. Export vers le Frontend
  const deployedConfig = {
    network: network.name,
    chainId: network.config.chainId ? network.config.chainId.toString() : "80002",
    contracts: {
      SendaTestToken: {
        address: tokenAddress,
      },
      SendaNFT: {
        address: nftAddress,
      },
      SendaEscrow: {
        address: escrowAddress,
      },
    },
    deployedAt: new Date().toISOString(),
  };

  const targetPath = path.resolve(__dirname, "../../apps/web/lib/contracts/deployed-contracts.json");
  try {
    fs.writeFileSync(targetPath, JSON.stringify(deployedConfig, null, 2));
    console.log(`\n📄 Configuration synchronisée dans : ${targetPath}`);
  } catch (err) {
    console.warn("Notice: Impossible d'écrire deployed-contracts.json directement :", err);
  }

  console.log("\n🎉 Déploiement SENDA terminé avec succès !");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
