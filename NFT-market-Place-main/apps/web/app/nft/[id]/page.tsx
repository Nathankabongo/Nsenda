"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Calendar,
  Layers,
  Package,
  Award,
  ChevronRight,
  Info,
  Sparkles,
  Cpu,
} from "lucide-react";
import { BuyModal } from "@/components/BuyModal";
import { INITIAL_DEMO_NFTS, NFTItem } from "@/lib/mockData";
import { DEFAULT_CONTRACTS } from "@/lib/contracts/abis";
import { formatAddress } from "@/lib/utils";

export default function NFTDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tokenIdParam = params?.id as string;

  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"technical" | "audit" | "blockchain" | "ai">("technical");

  const nft = useMemo(() => {
    return (
      INITIAL_DEMO_NFTS.find((item) => item.tokenId.toString() === tokenIdParam) ||
      INITIAL_DEMO_NFTS[0]
    );
  }, [tokenIdParam]);

  const [imgSrc, setImgSrc] = useState(nft.image);

  return (
    <div className="min-h-screen bg-[#F8F5F0] py-10 px-4 sm:px-6 lg:px-8 text-[#2D231E]">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8 flex items-center gap-2 text-xs text-[#8C7A6B]">
          <Link href="/" className="hover:text-[#1B4332] font-medium transition-colors">
            Accueil
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/#catalogue" className="hover:text-[#1B4332] font-medium transition-colors">
            Catalogue
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-bold text-[#1B4332] truncate max-w-xs">
            {nft.name}
          </span>
        </nav>

        {/* Main Product Grid */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
          {/* Left Column: Media Presentation */}
          <div className="lg:col-span-6 space-y-6">
            <div className="overflow-hidden rounded-3xl border border-[#E8E1D5] bg-white p-5 shadow-lg sticky top-28 space-y-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#FBF9F5] via-[#F3EEE5] to-[#E6DFD3] border border-[#E8E1D5] flex items-center justify-center p-6">
                <img
                  src={imgSrc}
                  alt={nft.name}
                  onError={() => setImgSrc("/artworks/masque_pende.jpg")}
                  className="max-h-full max-w-full object-contain drop-shadow-xl transition-transform duration-300 hover:scale-105"
                />
                
                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-[#1B4332]/95 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white shadow-sm flex items-center gap-1.5 border border-[#2D6A4F]/60">
                    <MapPin className="h-3.5 w-3.5 text-[#E9C46A]" />
                    {nft.artisanProvince}
                  </span>
                  <span className="rounded-full bg-[#E8F0EC]/95 border border-[#C1DBCF] px-3 py-1.5 text-xs font-bold text-[#1B4332] flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" />
                    {nft.artisanVerificationStatus}
                  </span>
                </div>

                <div className="absolute bottom-4 right-4 rounded-xl bg-white/95 backdrop-blur-md border border-[#E8E1D5] px-3.5 py-1.5 text-xs font-mono font-bold text-[#1B4332] shadow-sm">
                  Certificat #{nft.tokenId}
                </div>
              </div>

              {/* Shipping & Reassurance Note */}
              <div className="mt-4 rounded-2xl bg-[#FAF7F2] p-4 border border-[#E8E1D5] grid grid-cols-2 gap-3 text-xs text-[#6B5E55]">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#C86D3B] shrink-0" />
                  <span>Expédié depuis l&apos;atelier en RDC</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#16A34A] shrink-0" />
                  <span>Emballage sécurisé & certifié</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Information, Pricing & Tabs */}
          <div className="lg:col-span-6 space-y-7">
            {/* Header info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#FBF0EA] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#C86D3B] border border-[#F3D2C0]">
                  {nft.category}
                </span>
                <span className="text-xs text-[#6B5E55] font-semibold">
                  Collection : {nft.collectionName}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#1B4332] leading-tight">
                {nft.name}
              </h1>

              <div className="flex items-center gap-3 text-sm text-[#4A3B33] pt-1">
                <span>Maître artisan :</span>
                <span className="font-bold text-[#1B4332] underline decoration-[#C86D3B]">
                  {nft.artisanName}
                </span>
                <span className="text-[#8C7A6B]">•</span>
                <span className="flex items-center gap-1 text-[#6B5E55] text-xs font-medium">
                  <Calendar className="h-3.5 w-3.5" /> Créé en {nft.yearCreated}
                </span>
              </div>
            </div>

            {/* Price & Purchase Card */}
            <div className="rounded-3xl border border-[#E8E1D5] bg-white p-7 shadow-sm space-y-5">
              <div className="flex items-baseline justify-between border-b border-[#E8E1D5] pb-4">
                <div>
                  <span className="text-xs font-bold text-[#6B5E55] uppercase tracking-wider block">
                    Prix consigné sous séquestre
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-serif text-4xl font-black text-[#1B4332]">
                      {nft.price}
                    </span>
                    <span className="text-lg font-black text-[#C86D3B]">
                      STT
                    </span>
                    <span className="text-xs text-[#8C7A6B]">
                      (Senda Test Token)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="rounded-full bg-[#E8F0EC] px-3 py-1 text-xs font-bold text-[#1B4332] border border-[#C1DBCF] inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
                    Disponible
                  </span>
                </div>
              </div>

              {/* Physical Escrow Reassurance */}
              <div className="rounded-2xl border border-[#F3D2C0] bg-[#FBF0EA] p-4 text-xs text-[#9C4E23] flex items-start gap-3">
                <Lock className="h-5 w-5 text-[#C86D3B] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block text-[#9C4E23] font-serif text-sm">Garantie de Séquestre Physique SENDA</strong>
                  <p className="text-[#6B5E55] leading-relaxed">
                    Votre paiement en STT est consigné dans le smart contract <code className="font-mono text-[#1B4332]">SendaEscrow</code>. L&apos;artisan expédie l&apos;œuvre physique, et vous seul validez le déblocage des fonds une fois le colis reçu et inspecté.
                  </p>
                </div>
              </div>

              {/* Purchase Button */}
              <button
                onClick={() => setIsBuyModalOpen(true)}
                className="w-full rounded-2xl bg-[#1B4332] hover:bg-[#143728] py-4 text-sm font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 hover:shadow-lg"
              >
                <Lock className="h-4 w-4 text-[#E9C46A]" />
                <span>Commander avec Séquestre ({nft.price} STT)</span>
              </button>
            </div>

            {/* 3-Level Information Tabs (Section 6.2 & 9.1 PLANSENDA.pdf) */}
            <div className="rounded-3xl border border-[#E8E1D5] bg-white overflow-hidden shadow-sm">
              {/* Tab Navigation */}
              <div className="flex border-b border-[#E8E1D5] bg-[#FAF7F2]">
                <button
                  onClick={() => setActiveTab("technical")}
                  className={`flex-1 py-4 text-xs font-bold transition-all border-b-2 ${
                    activeTab === "technical"
                      ? "border-[#1B4332] text-[#1B4332] bg-white"
                      : "border-transparent text-[#6B5E55] hover:text-[#1B4332]"
                  }`}
                >
                  1. Fiche Technique & Origine
                </button>
                <button
                  onClick={() => setActiveTab("audit")}
                  className={`flex-1 py-4 text-xs font-bold transition-all border-b-2 ${
                    activeTab === "audit"
                      ? "border-[#1B4332] text-[#1B4332] bg-white"
                      : "border-transparent text-[#6B5E55] hover:text-[#1B4332]"
                  }`}
                >
                  2. Audit & Vérification
                </button>
                <button
                  onClick={() => setActiveTab("blockchain")}
                  className={`flex-1 py-4 text-xs font-bold transition-all border-b-2 ${
                    activeTab === "blockchain"
                      ? "border-[#1B4332] text-[#1B4332] bg-white"
                      : "border-transparent text-[#6B5E55] hover:text-[#1B4332]"
                  }`}
                >
                  3. Blockchain & IPFS
                </button>
                <button
                  onClick={() => setActiveTab("ai")}
                  className={`flex-1 py-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                    activeTab === "ai"
                      ? "border-[#1B4332] text-[#1B4332] bg-white shadow-inner"
                      : "border-transparent text-[#C86D3B] hover:text-[#1B4332]"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#E9C46A]" />
                  <span>4. IA & Authenticité</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 text-sm text-[#2D231E]">
                {activeTab === "technical" && (
                  <div className="space-y-4">
                    <p className="text-xs text-[#4A3B33] leading-relaxed">
                      {nft.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                      <div className="rounded-xl bg-[#FAF7F2] p-3.5 border border-[#E8E1D5]">
                        <span className="text-[#8C7A6B] block text-[11px] font-medium">Matières premières</span>
                        <span className="font-bold text-[#2D231E]">{nft.materials}</span>
                      </div>
                      <div className="rounded-xl bg-[#FAF7F2] p-3.5 border border-[#E8E1D5]">
                        <span className="text-[#8C7A6B] block text-[11px] font-medium">Dimensions physiques</span>
                        <span className="font-bold text-[#2D231E]">{nft.dimensions}</span>
                      </div>
                      <div className="rounded-xl bg-[#FAF7F2] p-3.5 border border-[#E8E1D5]">
                        <span className="text-[#8C7A6B] block text-[11px] font-medium">Poids estimé</span>
                        <span className="font-bold text-[#2D231E]">{nft.weight}</span>
                      </div>
                      <div className="rounded-xl bg-[#FAF7F2] p-3.5 border border-[#E8E1D5]">
                        <span className="text-[#8C7A6B] block text-[11px] font-medium">Région d&apos;origine</span>
                        <span className="font-bold text-[#2D231E]">{nft.originRegion}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "audit" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 font-bold text-[#1B4332]">
                      <ShieldCheck className="h-5 w-5 text-[#16A34A]" />
                      <span>Rapport d&apos;Audit de l&apos;Atelier Partenaire</span>
                    </div>

                    <p className="text-xs text-[#6B5E55] leading-relaxed">
                      L&apos;artisan <strong>{nft.artisanName}</strong> a fait l&apos;objet d&apos;un audit physique rigoureux par l&apos;équipe SENDA dans la province du {nft.artisanProvince}.
                    </p>

                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between rounded-xl bg-[#E8F0EC] p-3.5 border border-[#C1DBCF]">
                        <span className="font-semibold text-[#1B4332]">Statut de certification :</span>
                        <span className="font-bold text-[#16A34A]">{nft.artisanVerificationStatus}</span>
                      </div>
                      <div className="rounded-xl bg-[#FAF7F2] p-3.5 border border-[#E8E1D5] space-y-1">
                        <span className="text-[#8C7A6B] block font-semibold">Parcours de l&apos;artisan :</span>
                        <span className="text-[#2D231E] leading-relaxed">{nft.artisanBio}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "blockchain" && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between py-2 border-b border-[#E8E1D5]">
                      <span className="text-[#6B5E55]">Contrat SendaNFT (ERC-721) :</span>
                      <span className="font-mono font-bold text-[#1B4332]">{formatAddress(DEFAULT_CONTRACTS.nftAddress)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-[#E8E1D5]">
                      <span className="text-[#6B5E55]">Identifiant On-Chain :</span>
                      <span className="font-mono font-bold text-[#2D231E]">Token #{nft.tokenId}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-[#E8E1D5]">
                      <span className="text-[#6B5E55]">Réseau Blockchain :</span>
                      <span className="font-bold text-[#1B4332]">Polygon Amoy (Testnet 80002)</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-[#E8E1D5]">
                      <span className="text-[#6B5E55]">Droit de suite créateur (ERC-2981) :</span>
                      <span className="font-bold text-[#C86D3B]">{(nft.royaltyBps || 500) / 100}% reversé à l&apos;artisan</span>
                    </div>
                    <div className="py-2 space-y-1">
                      <span className="text-[#6B5E55] block">URI Métadonnées Décentralisées IPFS :</span>
                      <a
                        href={`https://ipfs.io/ipfs/${nft.ipfsMetadataUri.replace("ipfs://", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[11px] text-[#C86D3B] hover:underline flex items-center gap-1 break-all"
                      >
                        {nft.ipfsMetadataUri} <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                  </div>
                )}

                {activeTab === "ai" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E9C46A] p-1 text-[#1B4332]">
                          <Cpu className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#1B4332] text-xs">
                            SendaVision Neural Engine (Exigence n°5 UNIKIN)
                          </h4>
                          <span className="text-[10px] text-[#8C7A6B]">
                            Modèle : MobileNetV3-Large Dual-Head • Précision globale : 94.6%
                          </span>
                        </div>
                      </div>
                      <span className="rounded-full bg-[#E8F0EC] border border-[#C1DBCF] px-3 py-1 text-xs font-bold text-[#16A34A] flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {nft.aiCertificate?.score || 96.5}% Conforme
                      </span>
                    </div>

                    <div className="rounded-2xl bg-[#FAF7F2] p-4 border border-[#E8E1D5] space-y-3 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]">
                        <span className="text-[#6B5E55]">Verdict de l&apos;Intelligence Artificielle :</span>
                        <span className="font-bold text-[#1B4332]">
                          {nft.aiCertificate?.verdict || "Authentique — Conforme aux canons artistiques congolais"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]">
                        <span className="text-[#6B5E55]">Canon culturel identifié :</span>
                        <span className="font-semibold text-[#2D231E]">
                          {nft.aiCertificate?.culturalCanon || "Tradition artisanale congolaise"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]">
                        <span className="text-[#6B5E55]">Matériaux naturels analysés :</span>
                        <span className="font-bold text-[#16A34A]">✓ 100% Organiques / Non synthétiques</span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]">
                        <span className="text-[#6B5E55]">Risque d&apos;anomalie / contrefaçon :</span>
                        <span className="font-bold text-[#1B4332]">
                          {nft.aiCertificate?.anomalyRisk || "Très faible"} (&lt; 2.1%)
                        </span>
                      </div>
                    </div>

                    {/* Cryptographic Link to Blockchain */}
                    <div className="rounded-2xl bg-[#081C15] p-4 text-white text-xs space-y-2 border border-[#2D6A4F]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#E9C46A] font-bold text-[11px] uppercase tracking-wider">
                          Preuve Cryptographique d&apos;Attestation IA
                        </span>
                        <span className="rounded bg-[#1B4332] px-2 py-0.5 text-[10px] text-[#A7C4B5] font-mono">
                          SHA-256 On-Chain
                        </span>
                      </div>
                      <p className="text-[11px] text-[#C1DBCF] leading-relaxed">
                        L&apos;empreinte de l&apos;audit algorithmique est scellée dans le manifeste IPFS du certificat NFT #{nft.tokenId}.
                      </p>
                      <div className="font-mono text-[10px] text-[#E9C46A] bg-black/40 p-2.5 rounded-lg break-all select-all border border-[#2D6A4F]/60">
                        {nft.aiCertificate?.hash || "0x8f2a6b31e9c20a4b7d51928374e6f1029384756102938475610293847561a01b"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Escrow Modal */}
      <BuyModal
        nft={nft}
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
      />
    </div>
  );
}
