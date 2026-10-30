"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  Lock,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  ArrowRight,
  PlusCircle,
  Coins,
  Package,
  Award,
  Users,
} from "lucide-react";
import { NFTCard } from "@/components/NFTCard";
import { BuyModal } from "@/components/BuyModal";
import {
  INITIAL_DEMO_NFTS,
  NFTItem,
  CONGO_PROVINCES,
  SENDA_CATEGORIES,
} from "@/lib/mockData";
import { getArtworks } from "@/lib/api";

export default function HomePage() {
  const [artworks, setArtworks] = useState<NFTItem[]>(INITIAL_DEMO_NFTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Toutes catégories");
  const [selectedProvince, setSelectedProvince] = useState<string>("Toutes les provinces");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [selectedNFTForBuy, setSelectedNFTForBuy] = useState<NFTItem | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  // Synchronisation dynamique avec le backend REST si disponible
  React.useEffect(() => {
    getArtworks({
      category: selectedCategory,
      province: selectedProvince,
      search: searchQuery,
      sortBy: sortBy,
    }).then((items) => {
      if (items && items.length > 0) {
        setArtworks(items);
      }
    });
  }, [selectedCategory, selectedProvince, searchQuery, sortBy]);

  // Filter and Sort NFTs
  const filteredNFTs = useMemo(() => {
    return artworks
      .filter((item) => {
        const q = (searchQuery || "").trim().toLowerCase();
        const itemName = (item.name || (item as any).title || "").toLowerCase();
        const artisan = (item.artisanName || "").toLowerCase();
        const mats = (item.materials || "").toLowerCase();
        const prov = (item.artisanProvince || (item as any).province || "").toLowerCase();
        const origin = (item.originRegion || (item as any).province || "").toLowerCase();

        const matchesSearch =
          !q ||
          itemName.includes(q) ||
          artisan.includes(q) ||
          mats.includes(q) ||
          prov.includes(q) ||
          origin.includes(q);

        const itemProv = item.artisanProvince || (item as any).province || "";
        const itemCat = item.category || "";

        const matchesCategory =
          selectedCategory === "Toutes catégories" || itemCat === selectedCategory;

        const matchesProvince =
          selectedProvince === "Toutes les provinces" || itemProv === selectedProvince;

        return matchesSearch && matchesCategory && matchesProvince;
      })
      .sort((a, b) => {
        const priceA = parseFloat(a.price || "0");
        const priceB = parseFloat(b.price || "0");
        if (sortBy === "price-asc") return priceA - priceB;
        if (sortBy === "price-desc") return priceB - priceA;
        return (b.tokenId || 0) - (a.tokenId || 0);
      });
  }, [artworks, searchQuery, selectedCategory, selectedProvince, sortBy]);

  const openBuyModal = (nft: NFTItem) => {
    setSelectedNFTForBuy(nft);
    setIsBuyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#2D231E]">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-[#1B4332] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-[#2D6A4F]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#E9C46A_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col: Headings */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#2D6A4F]/70 border border-[#E9C46A]/40 px-4 py-1.5 text-xs font-bold text-[#E9C46A] shadow-sm">
                <ShieldCheck className="h-4 w-4 text-[#E9C46A]" />
                <span>Marketplace Décentralisée Officielle • République démocratique du Congo</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-white">
                L&apos;artisanat congolais, <br />
                <span className="text-[#E9C46A]">authentifié</span> et <span className="text-[#C86D3B]">valorisé</span>.
              </h1>

              <p className="text-base sm:text-lg text-[#C1DBCF] max-w-2xl leading-relaxed">
                Reliez-vous directement aux maîtres sculpteurs, tisseurs et orfèvres de Kinshasa, du Kwilu, du Kasaï et du Katanga. Chaque création matérielle est protégée par un <strong>certificat NFT ERC-721</strong> sur Polygon Amoy et un protocole de <strong>séquestre décentralisé</strong> : vos fonds ne sont débloqués qu&apos;après confirmation de la livraison physique.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#catalogue"
                  className="rounded-xl bg-[#C86D3B] hover:bg-[#B65E2F] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all flex items-center gap-2 hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Search className="h-4 w-4" />
                  <span>Explorer le catalogue</span>
                </a>

                <Link
                  href="/create"
                  className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3.5 text-sm font-bold text-white transition-all flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <PlusCircle className="h-4 w-4 text-[#E9C46A]" />
                  <span>Publier une œuvre (Artisans)</span>
                </Link>
              </div>

              {/* Reassurance Metrics */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#2D6A4F]/70 text-xs">
                <div>
                  <span className="font-serif text-3xl font-bold text-[#E9C46A] block">6</span>
                  <span className="text-[#A7C4B5] font-medium">Provinces de RDC couvertes</span>
                </div>
                <div>
                  <span className="font-serif text-3xl font-bold text-[#E9C46A] block">100%</span>
                  <span className="text-[#A7C4B5] font-medium">Ateliers audités sur site</span>
                </div>
                <div>
                  <span className="font-serif text-3xl font-bold text-[#E9C46A] block">Escrow</span>
                  <span className="text-[#A7C4B5] font-medium">Séquestre physique sécurisé</span>
                </div>
              </div>
            </div>

            {/* Right Col: Hero Card Feature */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-[#2D6A4F] bg-[#081C15]/85 p-5 shadow-2xl backdrop-blur-md">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#143728] to-[#081C15] flex items-center justify-center p-3 border border-[#2D6A4F]/60">
                  <img
                    src="/artworks/masque_pende.jpg"
                    alt="Masque Royal Pende"
                    className="h-full w-full object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-[#1B4332]/95 border border-[#E9C46A]/50 px-3 py-1 text-xs font-bold text-[#E9C46A] shadow-sm flex items-center gap-1.5 pointer-events-none">
                    <MapPin className="h-3 w-3" />
                    <span>Gungu • Province du Kwilu</span>
                  </div>
                  <div className="absolute bottom-3 right-3 rounded-lg bg-black/80 px-2.5 py-1 text-xs font-mono font-bold text-white pointer-events-none">
                    NFT #1
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-[#C86D3B] font-bold">
                      Masques traditionnels Mbuya
                    </span>
                    <span className="text-[11px] font-bold text-[#16A34A] bg-[#16A34A]/20 px-2.5 py-0.5 rounded-full border border-[#16A34A]/30">
                      ✓ Audit sur site SENDA
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-white">
                    Masque Royal Pende — Mbuya
                  </h3>

                  <p className="text-xs text-[#A7C4B5] leading-relaxed line-clamp-2">
                    Sculpté à la main en bois de wengé noble par Maître Mukendi. Orné de fibres de raphia et pigments naturels de la forêt équatoriale.
                  </p>

                  <div className="pt-3 border-t border-[#2D6A4F] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#A7C4B5] block font-medium uppercase tracking-wider">
                        Prix sous séquestre
                      </span>
                      <span className="font-serif text-2xl font-black text-white">
                        180 <span className="text-sm font-bold text-[#C86D3B]">STT</span>
                      </span>
                    </div>

                    <button
                      onClick={() => openBuyModal(INITIAL_DEMO_NFTS[0])}
                      className="rounded-xl bg-[#C86D3B] hover:bg-[#B65E2F] px-5 py-2.5 text-xs font-bold text-white transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Lock className="h-3.5 w-3.5 text-[#E9C46A]" />
                      <span>Commander (Séquestre)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 3 Pillars Section */}
      <section className="py-12 bg-[#FAF7F2] border-b border-[#E8E1D5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pilier 1 */}
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-[#E8E1D5] shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E8F0EC] text-[#1B4332]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-base font-bold text-[#1B4332]">
                  1. Traçabilité Culturelle Authentifiée
                </h4>
                <p className="text-xs text-[#6B5E55] leading-relaxed">
                  Identification physique des maîtres artisans en RDC, des matières employées et de l&apos;origine avant l&apos;émission du certificat NFT ERC-721.
                </p>
              </div>
            </div>

            {/* Pilier 2 */}
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-[#E8E1D5] shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FBF0EA] text-[#C86D3B]">
                <Lock className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-base font-bold text-[#1B4332]">
                  2. Séquestre Décentralisé
                </h4>
                <p className="text-xs text-[#6B5E55] leading-relaxed">
                  Paiement sécurisé via le contrat intelligent <code className="font-mono text-[#1B4332]">SendaEscrow</code>. Les fonds ne sont libérés que lorsque l&apos;acheteur confirme la livraison.
                </p>
              </div>
            </div>

            {/* Pilier 3 */}
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-[#E8E1D5] shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#D97706]">
                <Award className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-base font-bold text-[#1B4332]">
                  3. Redevances Créateurs (ERC-2981)
                </h4>
                <p className="text-xs text-[#6B5E55] leading-relaxed">
                  L&apos;artisan créateur perçoit automatiquement 5% à 10% sur chaque revente future de son œuvre sur les places de marché secondaires.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Catalogue Section */}
      <section id="catalogue" className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#C86D3B] uppercase tracking-wider mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Patrimoine Artisanal Vivant</span>
            </div>
            <h2 className="font-serif text-3xl font-extrabold text-[#1B4332]">
              Catalogue des Créations Congolaises
            </h2>
            <p className="text-sm text-[#6B5E55] mt-1">
              Explorez les œuvres physiques d&apos;exception avec double numérique NFT et commande sous séquestre.
            </p>
          </div>

          <div className="text-xs text-[#6B5E55]">
            Affichage de <span className="font-bold text-[#1B4332] text-sm">{filteredNFTs.length}</span> créations disponibles
          </div>
        </div>

        {/* Filter Controls Card Bar */}
        <div className="rounded-3xl border border-[#E8E1D5] bg-white p-5 shadow-sm space-y-4 mb-10">
          {/* Row 1: Search + Province + Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C7A6B]" />
              <input
                type="text"
                placeholder="Rechercher par nom, artisan, bois, province (ex: Pende, Kwilu, malachite)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[#E8E1D5] bg-[#FAF7F2] pl-10 pr-4 py-3 text-sm text-[#2D231E] placeholder-[#8C7A6B] focus:border-[#1B4332] focus:bg-white focus:outline-none shadow-inner"
              />
            </div>

            {/* Province Filter */}
            <div className="lg:col-span-3">
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full rounded-xl border border-[#E8E1D5] bg-[#FAF7F2] px-3.5 py-3 text-sm text-[#2D231E] focus:border-[#1B4332] focus:bg-white focus:outline-none font-medium"
              >
                {CONGO_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p === "Toutes les provinces" ? "🌍 Toutes les provinces de RDC" : `Province : ${p}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="lg:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full rounded-xl border border-[#E8E1D5] bg-[#FAF7F2] px-3.5 py-3 text-sm text-[#2D231E] focus:border-[#1B4332] focus:bg-white focus:outline-none font-medium"
              >
                <option value="newest">🕒 Plus récentes d&apos;abord</option>
                <option value="price-asc">📈 Prix : Croissant (STT)</option>
                <option value="price-desc">📉 Prix : Décroissant (STT)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none border-t border-[#F0EBE1]">
            {SENDA_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                    isSelected
                      ? "bg-[#1B4332] text-white"
                      : "bg-[#FAF7F2] text-[#4A3B33] border border-[#E8E1D5] hover:bg-white"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Artworks Grid */}
        {filteredNFTs.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-dashed border-[#E8E1D5] bg-white p-8 space-y-3">
            <Package className="h-10 w-10 text-[#8C7A6B] mx-auto" />
            <h3 className="font-serif text-lg font-bold text-[#1B4332]">
              Aucune œuvre ne correspond à vos critères
            </h3>
            <p className="text-xs text-[#6B5E55] max-w-sm mx-auto">
              Modifiez votre recherche textuelle ou réinitialisez les filtres de catégorie et de province.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("Toutes catégories");
                setSelectedProvince("Toutes les provinces");
              }}
              className="mt-2 rounded-xl bg-[#1B4332] px-5 py-2.5 text-xs font-bold text-white shadow-sm"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNFTs.map((nft) => (
              <NFTCard
                key={nft.id}
                nft={nft}
                onBuy={openBuyModal}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Featured Artisans of Congo Section */}
      <section className="py-16 bg-white border-t border-b border-[#E8E1D5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#C86D3B] uppercase tracking-wider">
              <Users className="h-4 w-4" />
              <span>Maîtres Créateurs & Ateliers</span>
            </div>
            <h2 className="font-serif text-3xl font-extrabold text-[#1B4332]">
              Les Artisans Certifiés de la RDC
            </h2>
            <p className="text-xs text-[#6B5E55]">
              Chaque atelier partenaire est audité physiquement par les équipes SENDA pour garantir la transmission authentique des traditions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Artisan 1 */}
            <div className="rounded-3xl border border-[#E8E1D5] bg-[#FAF7F2] p-5 space-y-4 hover:border-[#1B4332] hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-2xl overflow-hidden border border-[#E8E1D5] bg-[#E8F0EC] shrink-0">
                    <img src="/artworks/masque_pende.jpg" alt="Maître Mukendi" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#1B4332]">
                      Maître Mukendi
                    </h4>
                    <span className="text-[11px] text-[#C86D3B] font-semibold flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Gungu, Kwilu
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#6B5E55] leading-relaxed">
                  Sculpteur sur wengé et spécialiste des masques rituels Pende depuis 28 ans.
                </p>
              </div>

              <div className="pt-3 border-t border-[#E8E1D5] flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-[#16A34A] flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Certifié SENDA
                </span>
                <button
                  onClick={() => {
                    setSearchQuery("Mukendi");
                    const el = document.getElementById("catalogue");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="font-bold text-[#1B4332] hover:text-[#C86D3B] text-[11px] flex items-center gap-1 transition-colors"
                >
                  Voir œuvres →
                </button>
              </div>
            </div>

            {/* Artisan 2 */}
            <div className="rounded-3xl border border-[#E8E1D5] bg-[#FAF7F2] p-5 space-y-4 hover:border-[#1B4332] hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-2xl overflow-hidden border border-[#E8E1D5] bg-[#E8F0EC] shrink-0">
                    <img src="/artworks/statuette_tshokwe.jpg" alt="Papa Tshimanga" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#1B4332]">
                      Papa Tshimanga
                    </h4>
                    <span className="text-[11px] text-[#C86D3B] font-semibold flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Tshikapa, Kasaï
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#6B5E55] leading-relaxed">
                  Perpétue la statuaire royale Tshokwe et Lunda en bois précieux et patines rituelles.
                </p>
              </div>

              <div className="pt-3 border-t border-[#E8E1D5] flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-[#16A34A] flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Certifié SENDA
                </span>
                <button
                  onClick={() => {
                    setSearchQuery("Tshimanga");
                    const el = document.getElementById("catalogue");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="font-bold text-[#1B4332] hover:text-[#C86D3B] text-[11px] flex items-center gap-1 transition-colors"
                >
                  Voir œuvres →
                </button>
              </div>
            </div>

            {/* Artisan 3 */}
            <div className="rounded-3xl border border-[#E8E1D5] bg-[#FAF7F2] p-5 space-y-4 hover:border-[#1B4332] hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-2xl overflow-hidden border border-[#E8E1D5] bg-[#E8F0EC] shrink-0">
                    <img src="/artworks/textile_shoowa.jpg" alt="Coop. Maman Bikale" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#1B4332]">
                      Coop. Maman Bikale
                    </h4>
                    <span className="text-[11px] text-[#C86D3B] font-semibold flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Mweka, Kasaï
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#6B5E55] leading-relaxed">
                  Collectif de 14 brodeuses du velours traditionnel Shoowa et tissage de raphia Kuba.
                </p>
              </div>

              <div className="pt-3 border-t border-[#E8E1D5] flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-[#16A34A] flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Certifié SENDA
                </span>
                <button
                  onClick={() => {
                    setSearchQuery("Bikale");
                    const el = document.getElementById("catalogue");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="font-bold text-[#1B4332] hover:text-[#C86D3B] text-[11px] flex items-center gap-1 transition-colors"
                >
                  Voir œuvres →
                </button>
              </div>
            </div>

            {/* Artisan 4 */}
            <div className="rounded-3xl border border-[#E8E1D5] bg-[#FAF7F2] p-5 space-y-4 hover:border-[#1B4332] hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-2xl overflow-hidden border border-[#E8E1D5] bg-[#E8F0EC] shrink-0">
                    <img src="/artworks/bijou_malachite.jpg" alt="Atelier Ilunga" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#1B4332]">
                      Atelier Ilunga
                    </h4>
                    <span className="text-[11px] text-[#C86D3B] font-semibold flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Lubumbashi, Katanga
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#6B5E55] leading-relaxed">
                  Maîtres lapidaires taillant la malachite naturelle et orfèvres du cuivre martelé.
                </p>
              </div>

              <div className="pt-3 border-t border-[#E8E1D5] flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-[#16A34A] flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Certifié SENDA
                </span>
                <button
                  onClick={() => {
                    setSearchQuery("Ilunga");
                    const el = document.getElementById("catalogue");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="font-bold text-[#1B4332] hover:text-[#C86D3B] text-[11px] flex items-center gap-1 transition-colors"
                >
                  Voir œuvres →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Explainer / Escrow Workflow Section */}
      <section className="py-16 bg-[#E8F0EC]/60 border-b border-[#C1DBCF]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider">
              Cycle de Vente Sécurisé
            </span>
            <h2 className="font-serif text-3xl font-extrabold text-[#1B4332]">
              Le Séquestre Physique SENDA en 4 Étapes
            </h2>
            <p className="text-xs text-[#4A3B33]">
              Garantie technologique protégeant l&apos;artisan congolais contre les impayés et l&apos;acheteur contre les colis non reçus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="rounded-2xl bg-white p-6 border border-[#C1DBCF] shadow-sm space-y-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B4332] text-[#E9C46A] font-serif font-bold text-sm">
                1
              </span>
              <h4 className="font-serif font-bold text-[#1B4332] text-sm">Dépôt sous Séquestre</h4>
              <p className="text-xs text-[#6B5E55] leading-relaxed">
                L&apos;acheteur consigne les jetons STT dans le smart contract <code className="text-[#1B4332] font-semibold">SendaEscrow</code>. L&apos;état passe à <strong className="text-[#D97706]">Funded</strong>.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl bg-white p-6 border border-[#C1DBCF] shadow-sm space-y-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B4332] text-[#E9C46A] font-serif font-bold text-sm">
                2
              </span>
              <h4 className="font-serif font-bold text-[#1B4332] text-sm">Expédition en RDC</h4>
              <p className="text-xs text-[#6B5E55] leading-relaxed">
                L&apos;artisan, garanti du paiement bloqué, prépare l&apos;emballage sécurisé avec son certificat d&apos;authenticité et expédie le colis.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl bg-white p-6 border border-[#C1DBCF] shadow-sm space-y-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B4332] text-[#E9C46A] font-serif font-bold text-sm">
                3
              </span>
              <h4 className="font-serif font-bold text-[#1B4332] text-sm">Réception Matérielle</h4>
              <p className="text-xs text-[#6B5E55] leading-relaxed">
                L&apos;acheteur réceptionne la pièce d&apos;art, contrôle sa conformité physique par rapport aux métadonnées immuables IPFS.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-2xl bg-white p-6 border border-[#C1DBCF] shadow-sm space-y-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#16A34A] text-white font-serif font-bold text-sm">
                4
              </span>
              <h4 className="font-serif font-bold text-[#1B4332] text-sm">Libération des Fonds</h4>
              <p className="text-xs text-[#6B5E55] leading-relaxed">
                L&apos;acheteur valide la réception. Le contrat intelligent transfère irrévocablement les jetons vers le portefeuille de l&apos;artisan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Escrow Modal */}
      <BuyModal
        nft={selectedNFTForBuy}
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
      />
    </div>
  );
}
