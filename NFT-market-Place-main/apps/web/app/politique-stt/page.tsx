"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { formatEther } from "viem";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Gift,
  RotateCw,
  Lock,
  ArrowRight,
  Info,
  Fuel,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_CONTRACTS, SENDA_TOKEN_ABI } from "@/lib/contracts/abis";
import { formatAddress } from "@/lib/utils";

interface GrantStatus {
  eligible: boolean;
  hasWelcomeGrant: boolean;
  canClaimFaucet: boolean;
  totalGranted: number;
  maxCumulativeCap: number;
  nextFaucetDate: string | null;
}

export default function PolitiqueSTTPage() {
  const { user, token } = useAuth();
  const { address, isConnected } = useAccount();

  const [grantStatus, setGrantStatus] = useState<GrantStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const activeWallet = (user?.walletAddress || address) as `0x${string}` | undefined;

  // Lecture du solde direct STT on-chain
  const { data: rawSttBalance, refetch: refetchBalance } = useReadContract({
    address: DEFAULT_CONTRACTS.tokenAddress,
    abi: SENDA_TOKEN_ABI,
    functionName: "balanceOf",
    args: activeWallet ? [activeWallet] : undefined,
    query: {
      enabled: Boolean(activeWallet),
    },
  });

  const sttBalanceNumber = rawSttBalance
    ? parseFloat(formatEther(rawSttBalance as bigint))
    : 0;

  const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "https://nsenda-1.onrender.com";
  const CLEAN_API_URL = RAW_API_URL.replace(/\/+$/, "").replace(/\/api$/, "");
  const API_URL = `${CLEAN_API_URL}/api`;

  const fetchStatus = async () => {
    if (!token) return;
    setIsLoadingStatus(true);
    try {
      const res = await fetch(`${API_URL}/stt/grant-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setGrantStatus(json.data);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [token, activeWallet]);

  const handleClaim = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter à votre compte acheteur.");
      return;
    }
    if (!user.walletAddress) {
      toast.error("Veuillez d'abord lier votre portefeuille à votre compte.");
      return;
    }

    setIsClaiming(true);
    toast.loading("Attribution des jetons STT en cours depuis la trésorerie...", { id: "claim-stt" });

    try {
      const res = await fetch(`${API_URL}/stt/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentBalance: sttBalanceNumber,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const errorMsg = json?.error?.message || "Erreur lors de l'attribution.";
        toast.error(errorMsg, { id: "claim-stt" });
        return;
      }

      toast.success(json.data?.message || "Jetons STT attribués avec succès !", { id: "claim-stt" });

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      await Promise.all([fetchStatus(), refetchBalance()]);
    } catch (err: any) {
      toast.error(err.message || "Erreur de connexion au serveur.", { id: "claim-stt" });
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] py-12 px-4 sm:px-6 lg:px-8 text-[#2D231E]">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* En-tête */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0EC] border border-[#C1DBCF] px-4 py-1.5 text-xs font-bold text-[#1B4332]">
            <Coins className="h-4 w-4 text-[#C86D3B]" />
            <span>Protocole d&apos;Échange Équitable • Jeton STT</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#1B4332]">
            Politique d&apos;Attribution des Jetons STT
          </h1>
          <p className="text-xs sm:text-sm text-[#6B5E55] max-w-2xl mx-auto leading-relaxed">
            Le jeton STT (Senda Trade Token) est le moyen de paiement officiel utilisé pour consigner les fonds sous séquestre lors de l&apos;achat d&apos;œuvres artisanales sur Polygon Amoy.
          </p>
        </div>

        {/* Bloc Interactif : Réclamation de Jetons (Visible si connecté) */}
        {user ? (
          <div className="rounded-3xl border border-[#E8E1D5] bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE3D6] pb-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#1B4332]">
                  Votre Statut d&apos;Éligibilité STT
                </h2>
                <p className="text-xs text-[#6B5E55] mt-0.5">
                  Compte : <strong>{user.displayName}</strong> ({user.role})
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#FAF7F2] p-2.5 px-4 border border-[#E8E1D5] text-right">
                  <span className="text-[10px] uppercase font-bold text-[#8C7A6B] block">
                    Solde actuel
                  </span>
                  <span className="font-serif text-lg font-bold text-[#1B4332]">
                    {sttBalanceNumber.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}{" "}
                    <span className="text-xs text-[#C86D3B]">STT</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Conditions de réclamation */}
            {!user.walletAddress ? (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 text-xs text-amber-900">
                <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">Portefeuille non lié</span>
                  <p>
                    Pour réclamer votre dotation de bienvenue (1 000 STT), vous devez d&apos;abord connecter et lier votre portefeuille Web3 dans la barre de navigation.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="rounded-2xl bg-[#FAF7F2] p-4 border border-[#E8E1D5] space-y-1">
                  <span className="text-[#8C7A6B] block">Dotation de bienvenue</span>
                  <div className="flex items-center gap-1.5 font-bold">
                    {grantStatus?.hasWelcomeGrant ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> 1 000 STT perçus
                      </span>
                    ) : (
                      <span className="text-[#C86D3B] flex items-center gap-1">
                        <Sparkles className="h-4 w-4" /> 1 000 STT disponibles
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#FAF7F2] p-4 border border-[#E8E1D5] space-y-1">
                  <span className="text-[#8C7A6B] block">Cumul total attribué</span>
                  <p className="font-serif text-base font-bold text-[#1B4332]">
                    {grantStatus?.totalGranted ?? 0} / 5 000 STT
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAF7F2] p-4 border border-[#E8E1D5] space-y-1">
                  <span className="text-[#8C7A6B] block">Recharge (faucet)</span>
                  <p className="font-bold text-[#1B4332]">
                    {grantStatus?.canClaimFaucet
                      ? "Éligible (500 STT)"
                      : grantStatus?.nextFaucetDate
                      ? `Recharge le ${new Date(grantStatus.nextFaucetDate).toLocaleDateString("fr-FR")}`
                      : sttBalanceNumber >= 200
                      ? "Solde ≥ 200 STT"
                      : "Non disponible"}
                  </p>
                </div>
              </div>
            )}

            {/* Bouton d'action */}
            {user.walletAddress && (
              <button
                type="button"
                onClick={handleClaim}
                disabled={isClaiming || (!grantStatus?.eligible && grantStatus?.hasWelcomeGrant)}
                className="w-full rounded-2xl bg-[#1B4332] hover:bg-[#143728] py-4 text-xs font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isClaiming ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin text-[#E9C46A]" />
                    <span>Attribution en cours...</span>
                  </>
                ) : !grantStatus?.hasWelcomeGrant ? (
                  <>
                    <Gift className="h-4 w-4 text-[#E9C46A]" />
                    <span>Réclamer ma dotation de bienvenue (1 000 STT)</span>
                  </>
                ) : grantStatus?.canClaimFaucet ? (
                  <>
                    <RotateCw className="h-4 w-4 text-[#E9C46A]" />
                    <span>Demander une recharge hebdomadaire (500 STT)</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-[#E9C46A]" />
                    <span>Vous avez déjà perçu vos dotations STT</span>
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-[#E8E1D5] bg-white p-6 sm:p-8 text-center space-y-4 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-[#1B4332]">
              Vous êtes acheteur ou collectionneur ?
            </h2>
            <p className="text-xs text-[#6B5E55] max-w-md mx-auto">
              Connectez-vous à votre compte SENDA pour réclamer votre dotation de bienvenue de 1 000 STT et tester les achats sous séquestre.
            </p>
            <div className="flex justify-center gap-3 pt-1">
              <Link
                href="/login"
                className="rounded-xl bg-[#1B4332] text-white px-5 py-2.5 text-xs font-bold hover:bg-[#143427] transition-colors"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className="rounded-xl border border-[#E8E1D5] bg-white text-[#1B4332] px-5 py-2.5 text-xs font-bold hover:bg-[#FAF8F5] transition-colors"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        )}

        {/* Les 7 Règles Officielles */}
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-bold text-[#1B4332]">
            Les 7 Règles d&apos;Attribution et d&apos;Usage
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Règle 1 */}
            <div className="rounded-2xl border border-[#E8E1D5] bg-white p-5 space-y-2">
              <div className="flex items-center gap-2 font-serif font-bold text-[#1B4332] text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B4332] text-white text-xs">
                  1
                </span>
                <span>Dotation de Bienvenue (1 000 STT)</span>
              </div>
              <p className="text-[#6B5E55] leading-relaxed">
                Chaque nouvel acheteur reçoit une dotation unique de <strong>1 000 STT</strong> dès que son compte est vérifié (email confirmé) et son portefeuille Web3 certifié par signature cryptographique.
              </p>
            </div>

            {/* Règle 2 */}
            <div className="rounded-2xl border border-[#E8E1D5] bg-white p-5 space-y-2">
              <div className="flex items-center gap-2 font-serif font-bold text-[#1B4332] text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B4332] text-white text-xs">
                  2
                </span>
                <span>Garantie Anti-Abus (stt_grants)</span>
              </div>
              <p className="text-[#6B5E55] leading-relaxed">
                Un seul versement de bienvenue est consigné par compte utilisateur et par adresse de portefeuille unique. Toutes les attributions sont enregistrées de façon immuable dans la table <code>stt_grants</code>.
              </p>
            </div>

            {/* Règle 3 */}
            <div className="rounded-2xl border border-[#E8E1D5] bg-white p-5 space-y-2">
              <div className="flex items-center gap-2 font-serif font-bold text-[#1B4332] text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B4332] text-white text-xs">
                  3
                </span>
                <span>Recharge Périodique (500 STT / 7 jours)</span>
              </div>
              <p className="text-[#6B5E55] leading-relaxed">
                En cas de solde inférieur à <strong>200 STT</strong>, une recharge de <strong>500 STT</strong> maximum peut être accordée avec un intervalle obligatoire de 7 jours minimum entre deux recharges.
              </p>
            </div>

            {/* Règle 4 */}
            <div className="rounded-2xl border border-[#E8E1D5] bg-white p-5 space-y-2">
              <div className="flex items-center gap-2 font-serif font-bold text-[#1B4332] text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B4332] text-white text-xs">
                  4
                </span>
                <span>Plafond Cumulatif (5 000 STT)</span>
              </div>
              <p className="text-[#6B5E55] leading-relaxed">
                Le total cumulé des dotations attribuées à un acheteur (bienvenue + recharges) est strictement plafonné à <strong>5 000 STT</strong> sur l&apos;ensemble de la durée du compte.
              </p>
            </div>

            {/* Règle 5 */}
            <div className="rounded-2xl border border-[#E8E1D5] bg-white p-5 space-y-2">
              <div className="flex items-center gap-2 font-serif font-bold text-[#1B4332] text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B4332] text-white text-xs">
                  5
                </span>
                <span>Distribution Sécurisée Trésorerie</span>
              </div>
              <p className="text-[#6B5E55] leading-relaxed">
                Les transferts de jetons STT sont émis par le portefeuille de trésorerie SENDA géré côté serveur. La clé privée est confinée dans les variables d&apos;environnement Render (<code>TREASURY_PRIVATE_KEY</code>), sans jamais être exposée dans le frontend.
              </p>
            </div>

            {/* Règle 6 */}
            <div className="rounded-2xl border border-[#E8E1D5] bg-white p-5 space-y-2">
              <div className="flex items-center gap-2 font-serif font-bold text-[#1B4332] text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B4332] text-white text-xs">
                  6
                </span>
                <span>Frais de Gaz Réseau (POL Amoy)</span>
              </div>
              <p className="text-[#6B5E55] leading-relaxed">
                Les transactions on-chain nécessitent une infime quantité de jetons POL pour le gaz Polygon Amoy. Vous pouvez obtenir des jetons POL gratuitement sur le{" "}
                <a
                  href="https://faucet.polygon.technology/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#C86D3B] hover:underline inline-flex items-center gap-0.5"
                >
                  Robinet officiel Polygon <ExternalLink className="h-3 w-3" />
                </a>.
              </p>
            </div>
          </div>

          {/* Règle 7 : Transparence & Contrats */}
          <div className="rounded-2xl border border-[#E8E1D5] bg-white p-6 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-serif font-bold text-[#1B4332] text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B4332] text-white text-xs">
                7
              </span>
              <span>Transparence Technique & Paramètres Réseau</span>
            </div>
            <p className="text-[#6B5E55]">
              Toutes les adresses de contrats et paramètres sont vérifiables publiquement sur l&apos;explorateur Polygonscan Amoy :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-mono text-[11px]">
              <div className="rounded-xl bg-[#FAF7F2] p-3 border border-[#E8E1D5]">
                <span className="text-[#8C7A6B] block text-[10px] font-sans font-bold uppercase">
                  Jeton STT (ERC-20)
                </span>
                <span className="text-[#1B4332] font-bold break-all">
                  {DEFAULT_CONTRACTS.tokenAddress}
                </span>
              </div>
              <div className="rounded-xl bg-[#FAF7F2] p-3 border border-[#E8E1D5]">
                <span className="text-[#8C7A6B] block text-[10px] font-sans font-bold uppercase">
                  Contrat de Séquestre & Marketplace
                </span>
                <span className="text-[#1B4332] font-bold break-all">
                  {DEFAULT_CONTRACTS.marketplaceAddress}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
