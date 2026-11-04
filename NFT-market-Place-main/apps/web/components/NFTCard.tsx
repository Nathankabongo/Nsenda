"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, MapPin, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { NFTItem } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";

interface NFTCardProps {
  nft: NFTItem;
  onBuy?: (nft: NFTItem) => void;
  onList?: (nft: NFTItem) => void;
  onCancel?: (nft: NFTItem) => void;
  isOwner?: boolean;
}

export function NFTCard({ nft, onBuy }: NFTCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [imgSrc, setImgSrc] = useState(nft.image);

  const handleVisitorOrder = () => {
    toast("Authentification requise", {
      description: "Connectez-vous et liez votre portefeuille pour commander.",
      action: {
        label: "Se connecter",
        onClick: () => router.push("/login"),
      },
    });
  };

  return (
    <article className="senda-card group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-[#EAE3D6] shadow-sm transition-transform transition-shadow duration-ui ease-emil-out hover:shadow-md hover:border-[#C86D3B] hover:-translate-y-0.5 motion-reduce:transition-none">
      {/* 1. Cadre Image avec ratio compact et équilibré pour un affichage complet */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-[#FAF7F2] border-b border-[#EAE3D6] flex items-center justify-center p-3">
        <Link href={`/nft/${nft.tokenId}`} className="relative flex h-full w-full items-center justify-center">
          <img
            src={imgSrc}
            alt={nft.name}
            onError={() => setImgSrc("/artworks/masque_pende.jpg")}
            className="h-full w-full object-contain drop-shadow-sm transition-transform duration-ui ease-out group-hover:scale-[1.02] motion-reduce:transform-none"
            loading="lazy"
          />
        </Link>

        {/* Badge Haut-Gauche : Province et mention Démo sobre */}
        <div className="absolute left-2.5 top-2.5 pointer-events-none z-10 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-[#1B4332]/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white border border-[#2D6A4F]/40 shadow-xs">
            <MapPin className="h-2.5 w-2.5 text-[#E9C46A] shrink-0" />
            <span>{nft.artisanProvince}</span>
          </span>
          <span className="rounded-md bg-white/95 backdrop-blur-sm border border-[#E8E1D5] px-1.5 py-0.5 text-[9px] font-medium text-[#6B5E55] shadow-xs">
            Démo
          </span>
        </div>

        {/* Badge Haut-Droite : Redevance */}
        <div className="absolute right-2.5 top-2.5 pointer-events-none z-10">
          <span className="rounded-md bg-[#2D231E]/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-[#E9C46A] border border-[#E9C46A]/20 shadow-xs">
            {(nft.royaltyBps || 500) / 100}% Roy.
          </span>
        </div>

        {/* Tag Bas-Droite : Identifiant Token ID */}
        <div className="absolute bottom-2 right-2.5 pointer-events-none z-10">
          <span className="rounded-md bg-white/95 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-mono font-medium text-[#1B4332] shadow-xs border border-[#E8E1D5]">
            #{nft.tokenId}
          </span>
        </div>
      </div>

      {/* 2. Corps de la Carte : Lisibilité optimale */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4 space-y-2">
        {/* Catégorie & Certification */}
        <div className="flex items-center justify-between text-xs gap-2">
          <span className="font-medium text-[#C86D3B] text-[11px] truncate">
            {nft.category}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-[#E8F0EC] border border-[#C1DBCF] px-2 py-0.5 text-[10px] font-medium text-[#1B4332] shrink-0">
            <CheckCircle2 className="h-3 w-3 text-[#16A34A] shrink-0" />
            <span>Certifié</span>
          </span>
        </div>

        {/* Titre : 2 lignes maximum nettes */}
        <Link href={`/nft/${nft.tokenId}`} className="group-hover:text-[#C86D3B] transition-colors duration-micro block">
          <h3 className="font-serif text-sm sm:text-base font-semibold text-[#1B4332] line-clamp-2 leading-snug min-h-[2.4rem]" title={nft.name}>
            {nft.name}
          </h3>
        </Link>

        {/* Artisan & Dimensions */}
        <div className="text-xs text-[#4A3B33] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1B4332] text-[9px] font-medium text-[#E9C46A]">
              {nft.artisanName.slice(0, 2).toUpperCase()}
            </div>
            <span className="font-medium text-[#2D231E] truncate text-xs">
              {nft.artisanName}
            </span>
          </div>
          {nft.dimensions && (
            <span className="shrink-0 text-[10px] font-mono font-normal text-[#6B5E55] bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#E8E1D5]">
              {nft.dimensions.split(" x ")[0]} cm
            </span>
          )}
        </div>

        {/* Matières premières */}
        <p className="text-[11px] text-[#6B5E55] line-clamp-1 italic bg-[#FAF7F2] px-2.5 py-1 rounded-md border border-[#F0EBE1]">
          {nft.materials}
        </p>

        {/* Prix sous séquestre & Action */}
        <div className="mt-auto pt-2.5 border-t border-[#E8E1D5] flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[9px] text-[#8C7A6B] block font-medium uppercase tracking-wider truncate">
              Séquestre garanti
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-lg font-bold text-[#1B4332] leading-none">
                {nft.price}
              </span>
              <span className="text-xs font-semibold text-[#C86D3B]">
                STT
              </span>
            </div>
          </div>

          <div className="shrink-0">
            {user?.role === "BUYER" ? (
              <button
                type="button"
                onClick={() => onBuy && onBuy(nft)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1B4332] hover:bg-[#143728] active:scale-[0.98] px-3.5 py-2 text-xs font-medium text-white shadow-xs transition-colors duration-micro"
              >
                <Lock className="h-3.5 w-3.5 text-[#E9C46A]" />
                <span>Acheter</span>
              </button>
            ) : !user ? (
              <button
                type="button"
                onClick={handleVisitorOrder}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#1B4332] bg-[#1B4332] hover:bg-[#143728] active:scale-[0.98] px-3 py-1.5 text-xs font-medium text-[#E9C46A] shadow-xs transition-colors duration-micro"
              >
                <span>Commander</span>
              </button>
            ) : (
              <Link
                href={`/nft/${nft.tokenId}`}
                className="inline-flex items-center gap-1 rounded-lg bg-[#FAF7F2] hover:bg-[#EFE8DC] active:scale-[0.98] border border-[#E8E1D5] px-3 py-1.5 text-xs font-medium text-[#1B4332] transition-colors duration-micro"
              >
                <span>Détails</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
