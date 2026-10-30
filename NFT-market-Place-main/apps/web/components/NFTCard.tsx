"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, MapPin, CheckCircle2 } from "lucide-react";
import { NFTItem } from "@/lib/mockData";

interface NFTCardProps {
  nft: NFTItem;
  onBuy?: (nft: NFTItem) => void;
  onList?: (nft: NFTItem) => void;
  onCancel?: (nft: NFTItem) => void;
  isOwner?: boolean;
}

export function NFTCard({ nft, onBuy, isOwner }: NFTCardProps) {
  const [imgSrc, setImgSrc] = useState(nft.image);

  return (
    <div className="senda-card group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-[#E8E1D5] shadow-sm transition-all duration-300 hover:shadow-xl hover:border-[#C86D3B] hover:-translate-y-1">
      {/* Image & Badges Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-b from-[#FBF9F5] via-[#F3EEE5] to-[#E6DFD3] border-b border-[#E8E1D5] flex items-center justify-center p-3">
        <Link href={`/nft/${nft.tokenId}`} className="relative flex h-full w-full items-center justify-center">
          <img
            src={imgSrc}
            alt={nft.name}
            onError={() => setImgSrc("/artworks/masque_pende.jpg")}
            className="h-full w-full object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 flex-wrap pointer-events-none">
          {/* Province Pill */}
          <span className="inline-flex items-center gap-1 rounded-full bg-[#1B4332]/95 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm border border-[#2D6A4F]/50">
            <MapPin className="h-3 w-3 text-[#E9C46A]" />
            {nft.artisanProvince}
          </span>

          {/* Verification Badge */}
          <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F0EC]/95 backdrop-blur-md border border-[#C1DBCF] px-2.5 py-1 text-[10px] font-bold text-[#1B4332] shadow-sm">
            <CheckCircle2 className="h-3 w-3 text-[#16A34A]" />
            {nft.artisanVerificationStatus}
          </span>
        </div>

        {/* Royalty Pill */}
        <div className="absolute right-3 top-3 pointer-events-none">
          <span className="rounded-full bg-[#2D231E]/85 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-[#E9C46A] border border-[#2D231E]/20 shadow-sm">
            {(nft.royaltyBps || 500) / 100}% Redevance
          </span>
        </div>

        {/* Token ID Tag */}
        <div className="absolute bottom-2.5 right-3 pointer-events-none">
          <span className="rounded-md bg-white/95 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono font-bold text-[#1B4332] shadow-sm border border-[#E8E1D5]">
            NFT #{nft.tokenId}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-5 space-y-3">
        {/* Category & Year */}
        <div className="flex items-center justify-between text-xs text-[#6B5E55]">
          <span className="font-bold text-[#C86D3B] uppercase tracking-wider text-[10px]">
            {nft.category}
          </span>
          <span className="text-[11px] font-medium text-[#8C7A6B]">
            Année {nft.yearCreated}
          </span>
        </div>

        {/* Title */}
        <Link href={`/nft/${nft.tokenId}`} className="group-hover:text-[#C86D3B] transition-colors block">
          <h3 className="font-serif text-lg font-bold text-[#1B4332] line-clamp-1 leading-snug">
            {nft.name}
          </h3>
        </Link>

        {/* Artisan Name */}
        <div className="text-xs text-[#4A3B33] flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1B4332] text-[9px] font-bold text-[#E9C46A]">
            {nft.artisanName.slice(0, 2).toUpperCase()}
          </div>
          <span className="font-bold text-[#2D231E]">
            {nft.artisanName}
          </span>
        </div>

        {/* Materials Summary */}
        <p className="text-xs text-[#6B5E55] line-clamp-1 italic bg-[#FAF7F2] p-2 rounded-lg border border-[#F0EBE1]">
          {nft.materials}
        </p>

        {/* Price & Action Footer */}
        <div className="mt-auto pt-3 border-t border-[#E8E1D5] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#6B5E55] block font-semibold uppercase tracking-wider">
              Prix sous séquestre
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-xl font-black text-[#1B4332]">
                {nft.price}
              </span>
              <span className="text-xs font-black text-[#C86D3B]">
                STT
              </span>
            </div>
          </div>

          <div>
            <button
              onClick={() => onBuy && onBuy(nft)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1B4332] hover:bg-[#143728] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:shadow-md hover:scale-102"
            >
              <Lock className="h-3.5 w-3.5 text-[#E9C46A]" />
              <span>Acheter (Séquestre)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
