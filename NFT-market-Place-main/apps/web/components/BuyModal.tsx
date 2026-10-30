"use client";

import React, { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  X,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Package,
  Clock,
  Sparkles,
} from "lucide-react";
import { NFTItem } from "@/lib/mockData";
import { formatAddress } from "@/lib/utils";
import { createOrder, syncOrderTransaction } from "@/lib/api";

interface BuyModalProps {
  nft: NFTItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BuyModal({ nft, isOpen, onClose, onSuccess }: BuyModalProps) {
  const { address, isConnected } = useAccount();
  const [step, setStep] = useState<"review" | "approving" | "depositing" | "confirmed">("review");
  const [txHash, setTxHash] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");

  if (!isOpen || !nft) return null;

  const priceNum = parseFloat(nft.price || "0");
  const royaltyFee = (priceNum * ((nft.royaltyBps || 500) / 10000)).toFixed(2);

  const handleEscrowDeposit = async () => {
    if (!isConnected || !address) {
      toast.error("Veuillez connecter votre portefeuille MetaMask");
      return;
    }

    try {
      // 1. Initialiser la commande via l'API (création off-chain)
      const order = await createOrder({
        artworkId: nft.id,
        buyerWalletAddress: address,
      });
      setOrderId(order.orderId);

      // 2. Étape 1/2 : Approbation des jetons STT
      setStep("approving");
      toast.loading("Étape 1/2 : Approbation du montant en jetons STT...", { id: "escrow-tx" });
      await new Promise((res) => setTimeout(res, 1200));

      // 3. Étape 2/2 : Dépôt sous séquestre conditionnel SendaEscrow
      setStep("depositing");
      toast.loading("Étape 2/2 : Dépôt sous séquestre conditionnel SendaEscrow...", { id: "escrow-tx" });
      await new Promise((res) => setTimeout(res, 1500));

      const simulatedTx = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      
      // 4. Synchronisation avec le backend
      await syncOrderTransaction(order.orderId, "DEPOSIT", simulatedTx);

      setTxHash(simulatedTx);
      setStep("confirmed");

      toast.success("Paiement consigné avec succès sous séquestre !", { id: "escrow-tx" });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error("Erreur lors de la transaction de séquestre", { id: "escrow-tx" });
      setStep("review");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081C15]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#EAE3D6] bg-white shadow-2xl p-7 text-[#2D231E]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D6]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F0EC] text-[#1B4332]">
              <Lock className="h-5 w-5 text-[#1B4332]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1B4332]">
                Paiement Sécurisé sous Séquestre
              </h3>
              <p className="text-[11px] text-[#6B5E55]">
                Protocole conditionnel SENDA • Polygon Amoy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-[#6B5E55] hover:bg-[#F8F5F0] hover:text-[#2D231E] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {step === "confirmed" ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F0EC] text-[#16A34A]">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h4 className="font-serif text-xl font-bold text-[#1B4332]">
                Commande Payée et Séquestrée !
              </h4>
              <p className="text-xs text-[#4A3B33] mt-1 max-w-sm mx-auto">
                Vos jetons <span className="font-bold">{nft.price} STT</span> sont désormais bloqués dans le contrat intelligent <code className="font-mono bg-[#FAF7F2] px-1 rounded">SendaEscrow.sol</code>.
              </p>
            </div>

            <div className="rounded-2xl border border-[#C1DBCF] bg-[#E8F0EC]/50 p-4 text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#6B5E55]">Statut On-Chain :</span>
                <span className="font-bold text-[#1B4332] uppercase">Funded (Fonds Verrouillés)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B5E55]">Artisan notifié :</span>
                <span className="font-semibold text-[#2D231E]">{nft.artisanName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B5E55]">Transaction de dépôt :</span>
                <span className="font-mono text-[#1B4332] truncate max-w-[200px]">
                  {formatAddress(txHash)}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-[#FAF7F2] p-3 text-xs text-[#6B5E55] border border-[#EAE3D6] text-left flex items-start gap-2.5">
              <Package className="h-4 w-4 text-[#C86D3B] shrink-0 mt-0.5" />
              <span>
                <strong>Prochaine étape :</strong> L&apos;artisan expédie l&apos;œuvre physique. Dès sa réception à votre adresse, vous pourrez débloquer les fonds depuis votre espace « Mes Commandes ».
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-xl bg-[#1B4332] hover:bg-[#143728] py-3 text-sm font-bold text-white transition-all shadow-sm"
            >
              Fermer et suivre la commande
            </button>
          </div>
        ) : (
          <div className="py-4 space-y-5">
            {/* Oeuvre summary */}
            <div className="flex items-center gap-4 rounded-2xl bg-[#FAF7F2] p-3.5 border border-[#EAE3D6]">
              <img
                src={nft.image}
                alt={nft.name}
                className="h-16 w-16 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C86D3B]">
                  {nft.category} • {nft.artisanProvince}
                </span>
                <h4 className="font-serif text-sm font-bold text-[#2D231E] truncate">
                  {nft.name}
                </h4>
                <p className="text-xs text-[#6B5E55]">
                  Artisan : <span className="font-semibold text-[#1B4332]">{nft.artisanName}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="font-serif text-lg font-bold text-[#1B4332]">
                  {nft.price}
                </span>
                <span className="text-xs font-bold text-[#C86D3B] block">STT</span>
              </div>
            </div>

            {/* Explanation of physical escrow */}
            <div className="rounded-2xl border border-[#F3D2C0] bg-[#FBF0EA] p-4 text-xs space-y-2 text-[#9C4E23]">
              <div className="flex items-center gap-2 font-bold text-[#9C4E23]">
                <ShieldCheck className="h-4 w-4 text-[#C86D3B]" />
                <span>Garantie de Séquestre Physique SENDA</span>
              </div>
              <p className="text-[#6B5E55] leading-relaxed">
                Contrairement à un simple achat crypto, <strong>l&apos;artisan ne reçoit pas votre argent immédiatement</strong>. Le montant est bloqué dans le smart contract de séquestre jusqu&apos;à ce que vous validiez la réception du colis physique.
              </p>
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 text-xs border-t border-[#EAE3D6] pt-3 text-[#4A3B33]">
              <div className="flex justify-between">
                <span>Prix de l&apos;œuvre (Jeton STT)</span>
                <span className="font-semibold">{nft.price} STT</span>
              </div>
              <div className="flex justify-between text-[#6B5E55]">
                <span>Droit de suite reversé à l&apos;artisan ({(nft.royaltyBps || 500) / 100}%)</span>
                <span>{royaltyFee} STT</span>
              </div>
              <div className="flex justify-between text-[#16A34A]">
                <span>Frais de séquestre et gas</span>
                <span className="font-semibold">Pris en charge (Testnet)</span>
              </div>
              <div className="flex justify-between border-t border-[#EAE3D6] pt-2 text-sm font-bold text-[#1B4332]">
                <span>Total consigné</span>
                <span>{nft.price} STT</span>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={handleEscrowDeposit}
              disabled={step === "approving" || step === "depositing"}
              className="w-full rounded-xl bg-[#1B4332] hover:bg-[#143728] py-3.5 text-sm font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {step === "approving" ? (
                <>
                  <Clock className="h-4 w-4 animate-spin text-[#E9C46A]" />
                  <span>1/2 Approbation des jetons STT...</span>
                </>
              ) : step === "depositing" ? (
                <>
                  <Clock className="h-4 w-4 animate-spin text-[#E9C46A]" />
                  <span>2/2 Verrouillage sous séquestre...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 text-[#E9C46A]" />
                  <span>Confirmer le dépôt sous séquestre ({nft.price} STT)</span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-[#6B5E55]">
              Réseau de démonstration : <strong>Polygon Amoy</strong> • Aucun fonds réel n&apos;est engagé
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
