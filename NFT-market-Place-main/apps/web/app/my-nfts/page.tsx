"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  PackageCheck,
  Lock,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Package,
  MapPin,
} from "lucide-react";
import { formatAddress } from "@/lib/utils";
import { INITIAL_DEMO_NFTS, NFTItem } from "@/lib/mockData";
import { DEFAULT_CONTRACTS } from "@/lib/contracts/abis";
import { syncOrderTransaction } from "@/lib/api";

interface DemoOrder {
  id: string;
  orderIdHex: string;
  artwork: NFTItem;
  amount: string;
  status: "Funded" | "Released";
  depositTx: string;
  releaseTx?: string;
  createdAt: string;
}

export default function MyNFTsPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"orders" | "artisan">("orders");
  const [sttBalance, setSttBalance] = useState<number>(350);
  const [isFauceting, setIsFauceting] = useState(false);
  const [isReleasing, setIsReleasing] = useState<string | null>(null);

  // Demo orders under physical escrow
  const [orders, setOrders] = useState<DemoOrder[]>([
    {
      id: "ord-001",
      orderIdHex: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
      artwork: INITIAL_DEMO_NFTS[0], // Masque Pende
      amount: "180",
      status: "Funded",
      depositTx: "0x4e8a912c75f103b41d26987f6204561849a9c2b3e809f8745a32b1c4e789f10a",
      createdAt: "Il y a 2 jours",
    },
    {
      id: "ord-002",
      orderIdHex: "0x11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff",
      artwork: INITIAL_DEMO_NFTS[4], // Panier Kongo
      amount: "120",
      status: "Released",
      depositTx: "0x3b890123456789abcdef0123456789abcdef0123456789abcdef0123456789ab",
      releaseTx: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
      createdAt: "Il y a 10 jours",
    },
  ]);

  // Handle buyer confirming physical reception and releasing funds
  const handleConfirmReception = async (orderId: string) => {
    try {
      setIsReleasing(orderId);
      toast.loading("Validation de la réception physique sur Polygon Amoy...", { id: "rel-tx" });
      await new Promise((res) => setTimeout(res, 2000));

      const simReleaseTx = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

      // Synchronisation avec l'API backend
      await syncOrderTransaction(orderId, "RELEASE", simReleaseTx);

      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === orderId
            ? { ...ord, status: "Released", releaseTx: simReleaseTx }
            : ord
        )
      );

      toast.success("Livraison attestée ! Les jetons STT ont été virés irrévocablement à l'artisan.", { id: "rel-tx" });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      toast.error("Erreur lors de la libération", { id: "rel-tx" });
    } finally {
      setIsReleasing(null);
    }
  };

  // Faucet claim for testing
  const handleClaimFaucet = async () => {
    try {
      setIsFauceting(true);
      toast.loading("Attribution de 100 STT (Senda Test Token)...", { id: "faucet-tx" });
      await new Promise((res) => setTimeout(res, 1400));
      setSttBalance((prev) => prev + 100);
      toast.success("+100 STT crédités sur votre portefeuille de démonstration !", { id: "faucet-tx" });
    } catch {
      toast.error("Erreur du robinet", { id: "faucet-tx" });
    } finally {
      setIsFauceting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] py-12 px-4 sm:px-6 lg:px-8 text-[#2D231E]">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* User Profile Header Card */}
        <div className="rounded-3xl border border-[#E8E1D5] bg-white p-7 sm:p-9 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1B4332] text-[#E9C46A] shadow-sm font-serif text-2xl font-bold">
                {address ? address.slice(2, 4).toUpperCase() : "CD"}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl font-bold text-[#1B4332]">
                    Tableau de Bord & Séquestre
                  </h1>
                  <span className="rounded-md bg-[#E8F0EC] px-2.5 py-0.5 text-[11px] font-bold text-[#1B4332] border border-[#C1DBCF]">
                    Polygon Amoy
                  </span>
                </div>
                <p className="font-mono text-xs text-[#6B5E55]">
                  Portefeuille : {address ? address : "0x71C...4b9 (Mode Démonstration)"}
                </p>
              </div>
            </div>

            {/* STT Balance and Faucet trigger */}
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#FAF7F2] p-3 px-5 border border-[#E8E1D5] text-right">
                <span className="text-[10px] uppercase font-bold text-[#8C7A6B] block">
                  Solde de simulation
                </span>
                <span className="font-serif text-2xl font-black text-[#1B4332]">
                  {sttBalance} <span className="text-sm font-bold text-[#C86D3B]">STT</span>
                </span>
              </div>
              <button
                onClick={handleClaimFaucet}
                disabled={isFauceting}
                className="rounded-2xl bg-[#C86D3B] hover:bg-[#B65E2F] px-4 py-3.5 text-xs font-bold text-white shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Coins className="h-4 w-4" />
                <span>+100 STT (Robinet)</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex border-b border-[#E8E1D5] gap-3">
            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "orders"
                  ? "border-[#1B4332] text-[#1B4332]"
                  : "border-transparent text-[#6B5E55] hover:text-[#1B4332]"
              }`}
            >
              <PackageCheck className="h-4 w-4 text-[#C86D3B]" />
              <span>Commandes Physiques & Séquestre ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("artisan")}
              className={`pb-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "artisan"
                  ? "border-[#1B4332] text-[#1B4332]"
                  : "border-transparent text-[#6B5E55] hover:text-[#1B4332]"
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
              <span>Mes Pièces Enregistrées (Artisan)</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Orders & Physical Escrow Tracking */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#1B4332]">
                Suivi des Séquestres Conditionnels
              </h2>
              <p className="text-xs text-[#6B5E55] mt-0.5">
                Machine à états de <code className="font-mono text-[#1B4332]">SendaEscrow.sol</code> : Created → Funded → Released
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {orders.map((ord) => {
                const isFunded = ord.status === "Funded";
                return (
                  <div
                    key={ord.id}
                    className="rounded-3xl border border-[#E8E1D5] bg-white p-6 sm:p-7 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                  >
                    {/* Left: Artwork info */}
                    <div className="flex items-center gap-5 min-w-0">
                      <img
                        src={ord.artwork.image}
                        alt={ord.artwork.name}
                        className="h-20 w-20 rounded-2xl object-contain p-1.5 shrink-0 border border-[#E8E1D5] bg-gradient-to-b from-[#FBF9F5] to-[#E6DFD3] drop-shadow-sm"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C86D3B]">
                            {ord.artwork.category}
                          </span>
                          <span className="text-[10px] text-[#8C7A6B]">
                            {ord.createdAt}
                          </span>
                        </div>
                        <h3 className="font-serif text-base font-bold text-[#1B4332] truncate">
                          {ord.artwork.name}
                        </h3>
                        <p className="text-xs text-[#6B5E55]">
                          Artisan : <span className="font-semibold text-[#2D231E]">{ord.artwork.artisanName}</span> ({ord.artwork.artisanProvince})
                        </p>
                        <p className="font-mono text-[10px] text-[#8C7A6B]">
                          ID Séquestre : {formatAddress(ord.orderIdHex)}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Amount & Status Badge */}
                    <div className="space-y-1.5 text-left md:text-center">
                      <span className="text-[10px] uppercase font-bold text-[#8C7A6B] block">
                        Montant sous Séquestre
                      </span>
                      <span className="font-serif text-2xl font-black text-[#1B4332]">
                        {ord.amount} <span className="text-sm font-bold text-[#C86D3B]">STT</span>
                      </span>
                      <div>
                        {isFunded ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] px-3 py-1 text-xs font-bold text-[#D97706] shadow-sm">
                            <Lock className="h-3 w-3" />
                            <span>Funded (Fonds Verrouillés)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F0EC] border border-[#C1DBCF] px-3 py-1 text-xs font-bold text-[#16A34A] shadow-sm">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Released (Fonds Versés à l&apos;Artisan)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="w-full md:w-auto flex flex-col gap-2.5">
                      {isFunded ? (
                        <button
                          onClick={() => handleConfirmReception(ord.id)}
                          disabled={isReleasing === ord.id}
                          className="w-full md:w-auto rounded-xl bg-[#16A34A] hover:bg-[#15803D] px-6 py-3.5 text-xs font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isReleasing === ord.id ? (
                            <>
                              <Clock className="h-4 w-4 animate-spin" />
                              <span>Validation blockchain...</span>
                            </>
                          ) : (
                            <>
                              <PackageCheck className="h-4 w-4" />
                              <span>Confirmer réception & Libérer fonds</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="text-right text-xs space-y-1">
                          <span className="text-[#16A34A] font-bold flex items-center gap-1 justify-end">
                            <CheckCircle2 className="h-4 w-4" /> Livrée & Clôturée
                          </span>
                          <span className="font-mono text-[10px] text-[#8C7A6B] block">
                            Tx: {formatAddress(ord.releaseTx)}
                          </span>
                        </div>
                      )}

                      <Link
                        href={`/nft/${ord.artwork.tokenId}`}
                        className="text-center text-xs font-semibold text-[#C86D3B] hover:underline"
                      >
                        Consulter la fiche détaillée →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Artisan View */}
        {activeTab === "artisan" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#1B4332]">
                  Vos Créations Enregistrées sur la Blockchain
                </h2>
                <p className="text-xs text-[#6B5E55]">
                  Certificats NFT ERC-721 avec redevances ERC-2981 actives.
                </p>
              </div>

              <Link
                href="/create"
                className="rounded-xl bg-[#1B4332] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#143728] flex items-center gap-1.5 shadow-sm"
              >
                <span>+ Publier une nouvelle œuvre</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {INITIAL_DEMO_NFTS.slice(0, 3).map((nft) => (
                <div
                  key={nft.id}
                  className="rounded-3xl border border-[#E8E1D5] bg-white p-5 shadow-sm space-y-3"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#FBF9F5] to-[#E6DFD3] border border-[#E8E1D5] flex items-center justify-center p-3">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="h-full w-full object-contain drop-shadow-md"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#C86D3B] uppercase">
                      {nft.category} • {nft.artisanProvince}
                    </span>
                    <h4 className="font-serif font-bold text-base text-[#1B4332] truncate mt-0.5">
                      {nft.name}
                    </h4>
                    <p className="text-xs text-[#6B5E55] mt-1">
                      Prix : <strong className="text-[#1B4332]">{nft.price} STT</strong> • Droit de suite : <strong className="text-[#16A34A]">{(nft.royaltyBps || 500) / 100}%</strong>
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#E8E1D5] flex justify-between items-center text-xs">
                    <span className="text-[#16A34A] font-bold flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-[#16A34A]" /> En vente
                    </span>
                    <Link
                      href={`/nft/${nft.tokenId}`}
                      className="font-bold text-[#1B4332] hover:underline"
                    >
                      Voir la fiche →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
