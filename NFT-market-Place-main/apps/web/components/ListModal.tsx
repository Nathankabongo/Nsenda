"use client";

import React, { useState } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { parseEther } from "viem";
import { toast } from "sonner";
import { X, Tag, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { AETHER_MARKETPLACE_ABI, AETHER_NFT_ABI, DEFAULT_CONTRACTS } from "@/lib/contracts/abis";
import { NFTItem } from "@/lib/mockData";

interface ListModalProps {
  nft: NFTItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ListModal({ nft, isOpen, onClose, onSuccess }: ListModalProps) {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [priceInput, setPriceInput] = useState("0.25");
  const [isProcessing, setIsProcessing] = useState(false);

  const marketplaceAddr = (DEFAULT_CONTRACTS.marketplaceAddress || "") as `0x${string}`;
  const nftContractAddr = (nft?.contractAddress || DEFAULT_CONTRACTS.nftAddress) as `0x${string}`;

  // Check if marketplace is already approved
  const { data: isApproved } = useReadContract({
    address: nftContractAddr,
    abi: AETHER_NFT_ABI,
    functionName: "isApprovedForAll",
    args: address && marketplaceAddr ? [address, marketplaceAddr] : undefined,
  });

  if (!isOpen || !nft) return null;

  const handleList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    const priceNum = parseFloat(priceInput);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price greater than 0");
      return;
    }

    try {
      setIsProcessing(true);

      // Step 1: If not approved, approve marketplace first
      if (!isApproved) {
        toast.loading("Approving marketplace to transfer NFT...", { id: "list-tx" });
        await writeContractAsync({
          address: nftContractAddr,
          abi: AETHER_NFT_ABI,
          functionName: "setApprovalForAll",
          args: [marketplaceAddr, true],
        });
        toast.success("Marketplace approved!", { id: "list-tx" });
      }

      // Step 2: List item on marketplace
      toast.loading("Creating listing on blockchain...", { id: "list-tx" });
      const priceWei = parseEther(priceInput);

      await writeContractAsync({
        address: marketplaceAddr,
        abi: AETHER_MARKETPLACE_ABI,
        functionName: "listItem",
        args: [nftContractAddr, BigInt(nft.tokenId), priceWei],
      });

      toast.success(`NFT #${nft.tokenId} successfully listed for ${priceInput} ETH!`, { id: "list-tx" });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Listing error:", err);
      toast.error(err?.shortMessage || err?.message || "Failed to create listing", { id: "list-tx" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0d101d] shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-[#00f2fe]" />
            <h3 className="text-lg font-bold text-white">List NFT for Sale</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleList} className="py-5 space-y-5">
          <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
            <img
              src={nft.image}
              alt={nft.name}
              className="h-16 w-16 rounded-lg object-cover border border-white/10"
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-[#00f2fe] uppercase tracking-wider">
                {nft.collectionName || "Aetheria Genesis"}
              </span>
              <h4 className="text-base font-bold text-white truncate">{nft.name}</h4>
              <p className="text-xs text-slate-400">Token ID: #{nft.tokenId}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Listing Price (ETH / Native Token)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                min="0.0001"
                required
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="0.5"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-slate-500 focus:border-[#00f2fe] focus:outline-none focus:ring-1 focus:ring-[#00f2fe] font-mono text-sm"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                ETH
              </span>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="rounded-xl border border-white/5 bg-black/40 p-3.5 space-y-2 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Platform Fee:</span>
              <span>2.5%</span>
            </div>
            <div className="flex justify-between">
              <span>Creator Royalty:</span>
              <span>{(nft.royaltyBps || 500) / 100}%</span>
            </div>
            <div className="border-t border-white/10 pt-1.5 flex justify-between font-bold text-slate-200">
              <span>You will receive:</span>
              <span className="text-[#00f2fe]">
                {(
                  parseFloat(priceInput || "0") *
                  (1 - 0.025 - (nft.royaltyBps || 500) / 10000)
                ).toFixed(4)}{" "}
                ETH
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#4facfe] py-3 text-sm font-bold text-[#07090e] shadow-neon-cyan hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#07090e]" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Confirm Listing</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
