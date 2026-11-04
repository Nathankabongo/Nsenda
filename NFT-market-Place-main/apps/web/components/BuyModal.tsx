"use client";

import React, { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { toast } from "sonner";
import { parseEther, stringToHex, pad } from "viem";
import {
  X,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Package,
  Clock,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { NFTItem } from "@/lib/mockData";
import { formatAddress } from "@/lib/utils";
import { createOrder, syncOrderTransaction } from "@/lib/api";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { DEFAULT_CONTRACTS, SENDA_TOKEN_ABI, SENDA_ESCROW_ABI } from "@/lib/contracts/abis";

interface BuyModalProps {
  nft: NFTItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BuyModal({ nft, isOpen, onClose, onSuccess }: BuyModalProps) {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [step, setStep] = useState<"review" | "approving" | "depositing" | "confirmed" | "error">("review");
  const [txHash, setTxHash] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  if (!isOpen || !nft) return null;

  const priceNum = parseFloat(nft.price || "0");
  const royaltyFee = (priceNum * ((nft.royaltyBps || 500) / 10000)).toFixed(2);

  const handleEscrowDeposit = async () => {
    if (!isConnected || !address) {
      toast.error("Veuillez connecter votre portefeuille");
      return;
    }

    setErrorMessage("");

    try {
      // 1. Initialiser la commande via l'API (création off-chain)
      const order = await createOrder({
        artworkId: nft.id,
        buyerWalletAddress: address,
      });
      setOrderId(order.orderId);

      const priceInWei = parseEther(nft.price || "0");
      const orderIdHex = pad(stringToHex((order.orderId || "ord-001").slice(0, 31)), { size: 32 });
      const sellerAddress =
        nft.seller && nft.seller.startsWith("0x") && nft.seller.length === 42
          ? (nft.seller as `0x${string}`)
          : address;

      // 2. Étape 1/2 : Approbation des jetons STT on-chain
      setStep("approving");
      toast.loading("1/2 Approbation du montant en jetons STT...", { id: "escrow-tx" });

      await writeContractAsync({
        address: DEFAULT_CONTRACTS.tokenAddress,
        abi: SENDA_TOKEN_ABI,
        functionName: "approve",
        args: [DEFAULT_CONTRACTS.escrowAddress, priceInWei],
      });

      // 3. Étape 2/2 : Dépôt sous séquestre conditionnel SendaEscrow
      setStep("depositing");
      toast.loading("2/2 Dépôt sous séquestre conditionnel...", { id: "escrow-tx" });

      const depositTx = await writeContractAsync({
        address: DEFAULT_CONTRACTS.escrowAddress,
        abi: SENDA_ESCROW_ABI,
        functionName: "depositPayment",
        args: [orderIdHex, BigInt(nft.tokenId), sellerAddress, priceInWei],
      });

      // 4. Synchronisation avec le backend
      await syncOrderTransaction(order.orderId, "DEPOSIT", depositTx);

      setTxHash(depositTx);
      setStep("confirmed");
      toast.success("Dépôt consigné sous séquestre on-chain", { id: "escrow-tx" });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg =
        err?.shortMessage ||
        err?.message ||
        "La transaction on-chain a échoué. Vérifiez le contrat et le réseau.";
      setErrorMessage(msg);
      setStep("error");
      toast.error(msg, { id: "escrow-tx" });
    }
  };

  const handleReset = () => {
    setStep("review");
    setErrorMessage("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081C15]/70 backdrop-blur-xs animate-in fade-in duration-100 motion-reduce:animate-none">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#EAE3D6] bg-white shadow-xl p-6 text-[#2D231E] animate-in zoom-in-95 duration-ui ease-emil-out motion-reduce:animate-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D6]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F0EC] text-[#1B4332]">
              <Lock className="h-4 w-4 text-[#1B4332]" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#1B4332]">
                Paiement sous séquestre conditionnel
              </h3>
              <p className="text-[11px] text-[#6B5E55]">
                Protocole SENDA • Réseau de test Polygon Amoy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6B5E55] hover:bg-[#F8F5F0] hover:text-[#2D231E] active:scale-[0.98] transition-colors duration-micro"
            aria-label="Fermer la boîte de dialogue"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* État : Confirmé */}
        {step === "confirmed" && (
          <div className="py-5 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F0EC] text-[#16A34A]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-[#1B4332]">
                Paiement consigné avec succès
              </h4>
              <p className="text-xs text-[#4A3B33] mt-1 max-w-sm mx-auto">
                Vos jetons <span className="font-semibold">{nft.price} STT</span> sont verrouillés dans le contrat de séquestre.
              </p>
            </div>

            <div className="rounded-xl border border-[#C1DBCF] bg-[#E8F0EC]/60 p-3.5 text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#6B5E55]">Statut on-chain :</span>
                <span className="font-medium text-[#1B4332]">Verrouillé (Funded)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B5E55]">Bénéficiaire désigné :</span>
                <span className="font-medium text-[#2D231E]">{nft.artisanName}</span>
              </div>
              {txHash && (
                <div className="flex items-center justify-between">
                  <span className="text-[#6B5E55]">Transaction :</span>
                  <a
                    href={`https://amoy.polygonscan.com/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[#1B4332] hover:text-[#C86D3B] flex items-center gap-1"
                  >
                    <span>{formatAddress(txHash)}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="rounded-lg bg-[#FAF7F2] p-3 text-xs text-[#6B5E55] border border-[#EAE3D6] text-left flex items-start gap-2">
              <Package className="h-4 w-4 text-[#C86D3B] shrink-0 mt-0.5" />
              <span>
                <strong>Procédure de déblocage :</strong> L&apos;artisan expédie l&apos;œuvre physique. Dès sa réception à votre adresse, vous attestez la livraison pour transférer les fonds à l&apos;artisan.
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-lg bg-[#1B4332] hover:bg-[#143728] active:scale-[0.98] py-2.5 text-xs font-medium text-white transition-colors duration-micro"
            >
              Fermer
            </button>
          </div>
        )}

        {/* État : Erreur */}
        {step === "error" && (
          <div className="py-5 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-200">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-red-900">
                La transaction n&apos;a pas abouti
              </h4>
              <p className="text-xs text-[#6B5E55] mt-1 max-w-sm mx-auto">
                Une anomalie est survenue lors de l&apos;exécution du contrat sur Polygon Amoy.
              </p>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50/60 p-3.5 text-left text-xs text-red-800 space-y-1">
              <span className="font-semibold block">Détail technique :</span>
              <p className="font-mono text-[11px] break-all">{errorMessage}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleReset}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E8E1D5] bg-white py-2.5 text-xs font-medium text-[#2D231E] hover:bg-[#FAF8F5] transition-colors duration-micro"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Réessayer</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-lg bg-[#1B4332] py-2.5 text-xs font-medium text-white hover:bg-[#143728] transition-colors duration-micro"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* État : Examen & En cours */}
        {(step === "review" || step === "approving" || step === "depositing") && (
          <div className="py-4 space-y-4">
            {/* Sommaire de l'œuvre */}
            <div className="flex items-center gap-3.5 rounded-xl bg-[#FAF7F2] p-3 border border-[#EAE3D6]">
              <img
                src={nft.image}
                alt={nft.name}
                className="h-14 w-14 rounded-lg object-cover shrink-0 border border-[#E8E1D5]"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-medium text-[#C86D3B]">
                  {nft.category} • {nft.artisanProvince}
                </span>
                <h4 className="font-serif text-xs font-bold text-[#2D231E] truncate">
                  {nft.name}
                </h4>
                <p className="text-[11px] text-[#6B5E55]">
                  Artisan : <span className="font-medium text-[#1B4332]">{nft.artisanName}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="font-serif text-base font-bold text-[#1B4332]">
                  {nft.price}
                </span>
                <span className="text-[11px] font-semibold text-[#C86D3B] block">STT</span>
              </div>
            </div>

            {/* Note protocole de séquestre */}
            <div className="rounded-xl border border-[#E8E1D5] bg-white p-3.5 text-xs space-y-1.5 text-[#4A3B33]">
              <div className="flex items-center gap-1.5 font-semibold text-[#1B4332]">
                <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
                <span>Garantie de séquestre physique</span>
              </div>
              <p className="text-[11px] text-[#6B5E55] leading-relaxed">
                Les jetons sont consignés dans le contrat intelligent et ne sont débloqués à l&apos;artisan qu&apos;après confirmation de la livraison physique du colis.
              </p>
            </div>

            {/* Décomposition des montants */}
            <div className="space-y-1.5 text-xs border-t border-[#EAE3D6] pt-3 text-[#4A3B33]">
              <div className="flex justify-between">
                <span>Prix de l&apos;œuvre</span>
                <span className="font-medium">{nft.price} STT</span>
              </div>
              <div className="flex justify-between text-[#6B5E55]">
                <span>Droit de suite réservé à l&apos;artisan ({(nft.royaltyBps || 500) / 100}%)</span>
                <span>{royaltyFee} STT</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Frais de séquestre et gas</span>
                <span className="font-medium">Inclus</span>
              </div>
              <div className="flex justify-between border-t border-[#EAE3D6] pt-2 text-xs font-bold text-[#1B4332]">
                <span>Total à consigner</span>
                <span>{nft.price} STT</span>
              </div>
            </div>

            {/* Bouton d'action ou Connexion */}
            {!isConnected ? (
              <div className="rounded-xl border border-[#E8E1D5] bg-[#FAF7F2] p-4 text-center space-y-2.5">
                <p className="text-xs text-[#4A3B33] font-medium">
                  Connectez votre portefeuille pour exécuter la transaction de séquestre.
                </p>
                <div className="flex justify-center">
                  <ConnectButton showBalance={false} chainStatus="none" accountStatus="avatar" />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleEscrowDeposit}
                disabled={step === "approving" || step === "depositing"}
                className="w-full rounded-lg bg-[#1B4332] hover:bg-[#143728] active:scale-[0.98] py-3 text-xs font-medium text-white transition-colors duration-micro shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {step === "approving" ? (
                  <>
                    <Clock className="h-3.5 w-3.5 animate-spin text-[#E9C46A]" />
                    <span>Étape 1/2 : Approbation des jetons STT...</span>
                  </>
                ) : step === "depositing" ? (
                  <>
                    <Clock className="h-3.5 w-3.5 animate-spin text-[#E9C46A]" />
                    <span>Étape 2/2 : Consignation sous séquestre...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5 text-[#E9C46A]" />
                    <span>Confirmer le dépôt ({nft.price} STT)</span>
                  </>
                )}
              </button>
            )}

            <p className="text-center text-[10px] text-[#6B5E55]">
              Réseau : <strong>Polygon Amoy</strong> • Paiement sécurisé sous séquestre STT
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
