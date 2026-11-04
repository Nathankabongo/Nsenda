"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAccount, useReadContract, useBalance } from "wagmi";
import { formatEther } from "viem";
import { toast } from "sonner";
import {
  Wallet,
  Coins,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  Package,
  Fuel,
  Copy,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { RoleGuard } from "@/components/RoleGuard";
import { DEFAULT_CONTRACTS, SENDA_TOKEN_ABI } from "@/lib/contracts/abis";
import { formatAddress } from "@/lib/utils";
import { INITIAL_CATALOG_NFTS } from "@/lib/mockData";

interface SaleRecord {
  id: string;
  artworkTitle: string;
  artworkImage: string;
  buyer: string;
  amount: string;
  escrowStatus: "FUNDED" | "RELEASED";
  txHash: string;
  date: string;
}

export default function ArtisanWalletDashboard() {
  const { user } = useAuth();
  const { address, isConnected } = useAccount();

  const artisanAddress = (user?.walletAddress || address) as `0x${string}` | undefined;

  // 1. Solde STT en direct (balanceOf sur le smart contract ERC-20)
  const {
    data: rawSttBalance,
    refetch: refetchStt,
    isRefetching: isRefetchingStt,
  } = useReadContract({
    address: DEFAULT_CONTRACTS.tokenAddress,
    abi: SENDA_TOKEN_ABI,
    functionName: "balanceOf",
    args: artisanAddress ? [artisanAddress] : undefined,
    query: {
      enabled: Boolean(artisanAddress),
    },
  });

  // 2. Solde POL natif (pour les frais de gaz sur Polygon Amoy)
  const {
    data: polBalanceData,
    refetch: refetchPol,
    isRefetching: isRefetchingPol,
  } = useBalance({
    address: artisanAddress,
    query: {
      enabled: Boolean(artisanAddress),
    },
  });

  const [sales, setSales] = useState<SaleRecord[]>([
    {
      id: "sale-001",
      artworkTitle: "Masque Royal Pende — Mbuya",
      artworkImage: "/artworks/masque_pende.jpg",
      buyer: "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
      amount: "180",
      escrowStatus: "FUNDED",
      txHash: "0x4e8a912c75f103b41d26987f6204561849a9c2b3e809f8745a32b1c4e789f10a",
      date: "02/11/2026",
    },
    {
      id: "sale-002",
      artworkTitle: "Appui-Nuque aux Amoureux Luba",
      artworkImage: "/artworks/appui_nuque_amoureux_luba.png",
      buyer: "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65",
      amount: "280",
      escrowStatus: "RELEASED",
      txHash: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
      date: "25/10/2026",
    },
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const formattedStt = useMemo(() => {
    if (rawSttBalance === undefined || rawSttBalance === null) return "0";
    try {
      const val = formatEther(rawSttBalance as bigint);
      return parseFloat(val).toLocaleString("fr-FR", { maximumFractionDigits: 2 });
    } catch {
      return "0";
    }
  }, [rawSttBalance]);

  const formattedPol = useMemo(() => {
    if (!polBalanceData) return "0";
    try {
      const num = parseFloat(polBalanceData.formatted);
      return num.toLocaleString("fr-FR", { maximumFractionDigits: 4 });
    } catch {
      return "0";
    }
  }, [polBalanceData]);

  // Synchronisation avec les commandes du backend si disponible
  useEffect(() => {
    if (!artisanAddress) return;

    const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "https://nsenda-1.onrender.com";
    const API_URL = `${RAW_API_URL.replace(/\/+$/, "").replace(/\/api$/, "")}/api`;

    fetch(`${API_URL}/users/${artisanAddress}/orders`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          const apiSales: SaleRecord[] = data.data.map((o: any) => ({
            id: o.id || o.orderIdHex,
            artworkTitle: o.artworkTitle || "Œuvre artisanale",
            artworkImage: o.artworkImage || "/artworks/masque_pende.jpg",
            buyer: o.buyer,
            amount: o.amount,
            escrowStatus: o.status === "RELEASED" ? "RELEASED" : "FUNDED",
            txHash: o.depositTxHash || o.releaseTxHash || "0x0000",
            date: new Date(o.createdAt).toLocaleDateString("fr-FR"),
          }));
          setSales(apiSales);
        }
      })
      .catch(() => {});
  }, [artisanAddress]);

  const handleRefreshBalances = async () => {
    setIsRefreshing(true);
    toast.loading("Actualisation des soldes on-chain...", { id: "refresh-wallet" });
    try {
      await Promise.all([refetchStt(), refetchPol()]);
      toast.success("Soldes synchronisés avec la blockchain Polygon Amoy !", { id: "refresh-wallet" });
    } catch {
      toast.error("Erreur lors de la lecture des soldes on-chain", { id: "refresh-wallet" });
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Adresse copiée dans le presse-papier !");
  };

  return (
    <RoleGuard allowedRoles={["ARTISAN"]} showDeniedScreen redirectOnDeny>
      <div className="min-h-screen bg-[#F8F5F0] py-10 px-4 sm:px-6 lg:px-8 text-[#2D231E]">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* En-tête */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0EC] border border-[#C1DBCF] px-3.5 py-1 text-xs font-bold text-[#1B4332] mb-2">
                <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A]" />
                <span>Espace Financier Sécurisé • Rôle Artisan</span>
              </div>
              <h1 className="font-serif text-3xl font-extrabold text-[#1B4332]">
                Mon Portefeuille Artisan
              </h1>
              <p className="text-xs text-[#6B5E55] mt-0.5">
                Suivi en temps réel des redevances, des paiements sous séquestre et du gaz de transaction.
              </p>
            </div>

            <button
              onClick={handleRefreshBalances}
              disabled={isRefreshing || isRefetchingStt || isRefetchingPol}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-[#E8E1D5] hover:border-[#1B4332] hover:bg-[#FAF8F5] px-4 py-2.5 text-xs font-bold text-[#1B4332] shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 text-[#C86D3B] ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Actualiser le solde</span>
            </button>
          </div>

          {/* Cartes d'État & Soldes en direct */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Adresse liée */}
            <div className="rounded-3xl border border-[#E8E1D5] bg-white p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                  Adresse Liée
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  Certifié
                </span>
              </div>

              <div>
                <p className="font-mono text-xs font-bold text-[#1B4332] break-all">
                  {artisanAddress ? artisanAddress : "Non liée"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {artisanAddress && (
                    <button
                      onClick={() => copyToClipboard(artisanAddress)}
                      className="inline-flex items-center gap-1 text-[11px] text-[#6B5E55] hover:text-[#1B4332] transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copier</span>
                    </button>
                  )}
                  {artisanAddress && (
                    <a
                      href={`https://amoy.polygonscan.com/address/${artisanAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#C86D3B] hover:underline"
                    >
                      <span>Polygonscan</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Solde STT direct */}
            <div className="rounded-3xl border border-[#E8E1D5] bg-white p-6 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                  Solde STT en direct
                </span>
                <div className="h-8 w-8 rounded-xl bg-[#E8F0EC] flex items-center justify-center text-[#1B4332]">
                  <Coins className="h-4 w-4 text-[#1B4332]" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-3xl font-black text-[#1B4332]">
                    {formattedStt}
                  </span>
                  <span className="font-bold text-sm text-[#C86D3B]">STT</span>
                </div>
                <p className="text-[11px] text-[#8C7A6B] mt-1">
                  Contrat : <span className="font-mono">{formatAddress(DEFAULT_CONTRACTS.tokenAddress)}</span>
                </p>
              </div>
            </div>

            {/* 3. Solde POL (Frais de gaz) */}
            <div className="rounded-3xl border border-[#E8E1D5] bg-white p-6 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                  Frais de gaz (POL)
                </span>
                <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                  <Fuel className="h-4 w-4 text-amber-700" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-3xl font-black text-[#1B4332]">
                    {formattedPol}
                  </span>
                  <span className="font-bold text-sm text-amber-700">POL</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#EAE3D6] text-[11px]">
                  <span className="text-[#8C7A6B]">Réseau : Polygon Amoy</span>
                  <a
                    href="https://faucet.polygon.technology/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#C86D3B] hover:underline flex items-center gap-0.5"
                  >
                    <span>Robinet POL</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau de l'historique des ventes */}
          <div className="rounded-3xl border border-[#E8E1D5] bg-white p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#1B4332]">
                  Historique des Ventes & Séquestres
                </h2>
                <p className="text-xs text-[#6B5E55] mt-0.5">
                  Chaque vente est sécurisée par le contrat de séquestre physique.
                </p>
              </div>
              <span className="text-xs font-bold text-[#8C7A6B] bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#E8E1D5]">
                {sales.length} transaction(s)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8E1D5] text-[#8C7A6B] uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-2">Œuvre artisanale</th>
                    <th className="py-3 px-2">Acheteur</th>
                    <th className="py-3 px-2">Montant</th>
                    <th className="py-3 px-2">Statut séquestre</th>
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2 text-right">Transaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D6]">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      <td className="py-3.5 px-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={sale.artworkImage}
                            alt={sale.artworkTitle}
                            className="h-10 w-10 rounded-lg object-contain bg-[#FAF7F2] border border-[#E8E1D5] p-0.5"
                          />
                          <span className="font-serif font-bold text-[#1B4332] text-xs">
                            {sale.artworkTitle}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-2 font-mono text-[#6B5E55]">
                        {formatAddress(sale.buyer)}
                      </td>
                      <td className="py-3.5 px-2">
                        <span className="font-bold text-[#1B4332] text-sm">{sale.amount}</span>{" "}
                        <span className="font-bold text-[#C86D3B] text-[10px]">STT</span>
                      </td>
                      <td className="py-3.5 px-2">
                        {sale.escrowStatus === "RELEASED" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Fonds libérés
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                            <Lock className="h-3 w-3 text-amber-600" />
                            Sous séquestre
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-[#8C7A6B] text-[11px]">
                        {sale.date}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <a
                          href={`https://amoy.polygonscan.com/tx/${sale.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[11px] text-[#C86D3B] hover:underline"
                        >
                          <span>{formatAddress(sale.txHash)}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
