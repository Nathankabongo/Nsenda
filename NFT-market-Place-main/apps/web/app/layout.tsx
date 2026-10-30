import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "SENDA | Marketplace décentralisée de l'artisanat congolais",
  description:
    "L'artisanat congolais, authentifié et valorisé. Certification par NFT ERC-721, stockage immuable IPFS et paiement sécurisé sous séquestre physique sur Polygon Amoy.",
  keywords: [
    "SENDA",
    "Artisanat Congolais",
    "RDC",
    "Congo",
    "Kinshasa",
    "Kasaï",
    "Kwilu",
    "Katanga",
    "NFT",
    "ERC-721",
    "Séquestre",
    "Escrow",
    "Web3",
    "Polygon Amoy",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-[#F8F5F0] text-[#2D231E] antialiased min-h-screen flex flex-col selection:bg-[#C86D3B]/20 selection:text-[#1B4332]">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#FFFFFF",
                border: "1px solid #EAE3D6",
                color: "#1B4332",
                boxShadow: "0 10px 25px -5px rgba(27, 67, 50, 0.1)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
