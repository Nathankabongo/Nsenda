import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { polygonAmoy, hardhat, sepolia, baseSepolia } from "wagmi/chains";
import { http } from "viem";

// Identifiant WalletConnect de démonstration pour SENDA
const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f168fa4d80";

export const wagmiConfig = getDefaultConfig({
  appName: "SENDA — Marketplace de l'artisanat congolais",
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains: [polygonAmoy, hardhat, sepolia, baseSepolia],
  transports: {
    [polygonAmoy.id]: http("https://rpc-amoy.polygon.technology"),
    [hardhat.id]: http("http://127.0.0.1:8545"),
    [sepolia.id]: http("https://rpc.sepolia.org"),
    [baseSepolia.id]: http("https://sepolia.base.org"),
  },
  ssr: true,
});
