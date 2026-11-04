import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";

/**
 * Bandeau d'avertissement de prototype universitaire
 */
function DemoBanner() {
  return (
    <aside
      aria-label="Avertissement environnement de démonstration"
      className="w-full border-b border-[#E8E1D5] bg-[#F4EFE6] px-4 py-1.5 text-center text-[11px] font-medium text-[#6B5E55]"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#C86D3B] shrink-0" />
        <span>
          Prototype universitaire : réseau de test Polygon Amoy, jetons STT sans valeur réelle, œuvres fictives.
        </span>
      </div>
    </aside>
  );
}

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
          <DemoBanner />
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
