"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  ShieldAlert,
  ShoppingBag,
  Palette,
  FileCheck2,
  Clock,
  History,
  AlertTriangle,
  Building2,
  ExternalLink,
  Wallet,
  Compass,
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
import { useAuth } from "@/context/AuthContext";
import { useAccount } from "wagmi";
import { formatAddress } from "@/lib/utils";

export default function HomePage() {
  const { user } = useAuth();
  const { isConnected, address } = useAccount();

  const [artworks, setArtworks] = useState<NFTItem[]>(INITIAL_DEMO_NFTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Toutes catégories");
  const [selectedProvince, setSelectedProvince] = useState<string>("Toutes les provinces");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [selectedNFTForBuy, setSelectedNFTForBuy] = useState<NFTItem | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  // Synchronisation dynamique avec le backend REST
  useEffect(() => {
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

  // Filtrage des œuvres
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

  // =========================================================================
  // VUE 1 : ACCUEIL ARTISAN (Tableau de bord, statistiques, dernières ventes)
  // =========================================================================
  if (user?.role === "ARTISAN") {
    const artisanArtworks = artworks.filter(
      (a) => a.artisanName.toLowerCase().includes("mukendi") || a.seller?.toLowerCase() === address?.toLowerCase()
    );

    return (
      <div className="min-h-screen bg-[#F8F5F0] text-[#2D231E]">
        {/* Hero Artisan */}
        <section className="bg-[#1B4332] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-[#2D6A4F]">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#2D6A4F]/70">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#2D6A4F]/80 border border-[#16A34A]/40 px-3.5 py-1 text-xs font-bold text-[#A7F3D0]">
                  <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
                  <span>Espace Maître Artisan • {user.workshopName || "Atelier Royal du Kwilu"}</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-white">
                  Tableau de Bord — {user.displayName}
                </h1>
                <p className="text-xs sm:text-sm text-[#C1DBCF] max-w-2xl leading-relaxed">
                  Bienvenue dans votre atelier numérique. Enregistrez vos nouvelles sculptures et suivez vos paiements sécurisés sous séquestre.
                </p>
              </div>

              {/* Bouton d'action exclusif Artisan */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/create"
                  className="rounded-xl bg-[#C86D3B] hover:bg-[#B65E2F] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition-all flex items-center gap-2 hover:scale-102"
                >
                  <PlusCircle className="h-4 w-4 text-[#E9C46A]" />
                  <span>+ Ajouter une œuvre</span>
                </Link>

                <Link
                  href="/my-nfts?tab=orders"
                  className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-3 text-xs sm:text-sm font-bold text-white transition-all flex items-center gap-2"
                >
                  <Package className="h-4 w-4 text-[#E9C46A]" />
                  <span>Mes Ventes</span>
                </Link>
              </div>
            </div>

            {/* Avertissement Portefeuille si non connecté */}
            {!isConnected && (
              <div className="mt-6 rounded-2xl bg-amber-500/20 border border-amber-400/40 p-4 flex items-center justify-between text-xs text-amber-200">
                <div className="flex items-center gap-2.5">
                  <Wallet className="h-4 w-4 text-amber-300 shrink-0" />
                  <span>
                    Votre portefeuille Web3 n&apos;est pas connecté. Cliquez sur <strong>« Connect Wallet »</strong> dans la barre supérieure pour signer vos émissions NFT et percevoir vos fonds.
                  </span>
                </div>
              </div>
            )}

            {/* 3 Cartes Statistiques Artisan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-8">
              <div className="rounded-2xl bg-[#081C15]/70 border border-[#2D6A4F] p-5 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#A7C4B5] block">
                  Œuvres Publiées au Catalogue
                </span>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-serif text-3xl font-black text-[#E9C46A]">
                    {artisanArtworks.length > 0 ? artisanArtworks.length : 8}
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold">Certifiées On-Chain</span>
                </div>
              </div>

              <div className="rounded-2xl bg-[#081C15]/70 border border-[#2D6A4F] p-5 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#A7C4B5] block">
                  Commandes sous Séquestre
                </span>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-serif text-3xl font-black text-[#E9C46A]">2</span>
                  <span className="text-xs text-amber-300 font-semibold">1 en cours • 1 livrée</span>
                </div>
              </div>

              <div className="rounded-2xl bg-[#081C15]/70 border border-[#2D6A4F] p-5 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#A7C4B5] block">
                  Revenus de Ventes & Redevances
                </span>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-serif text-3xl font-black text-[#E9C46A]">
                    300 <span className="text-sm font-bold text-[#C86D3B]">STT</span>
                  </span>
                  <span className="text-xs text-[#A7C4B5] font-semibold">Redevance 5% ERC-2981</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Dernières Ventes de l'Artisan */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1B4332]">
                Dernières Ventes sous Séquestre
              </h2>
              <p className="text-xs text-[#6B5E55] mt-0.5">
                Suivi des commandes en cours consignées dans le contrat intelligent <code className="font-mono text-[#1B4332]">SendaEscrow.sol</code>
              </p>
            </div>
            <Link
              href="/my-nfts?tab=orders"
              className="text-xs font-bold text-[#C86D3B] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Consulter l&apos;historique complet</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
            {/* Vente 1 : En cours d'expédition */}
            <div className="rounded-2xl bg-white border border-[#E8E1D5] p-5 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#EAE3D6]">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1B4332]">Commande #ord-001</h4>
                    <p className="text-[10px] text-[#8C7A6B]">Acheteur : Collectionneur Lumumba</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                  🟡 En cours de séquestre (Funded)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B5E55]">Masque Royal Pende — Mbuya</span>
                <span className="font-serif font-bold text-[#1B4332]">180 STT bloqués</span>
              </div>
              <p className="text-[11px] text-[#8C7A6B] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#F0EBE1]">
                Fonds garantis dans le smart contract. Les jetons seront virés dès que l&apos;acheteur confirme la réception.
              </p>
            </div>

            {/* Vente 2 : Clôturée */}
            <div className="rounded-2xl bg-white border border-[#E8E1D5] p-5 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#EAE3D6]">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1B4332]">Commande #ord-002</h4>
                    <p className="text-[10px] text-[#8C7A6B]">Livraison attestée par l&apos;acheteur</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                  🟢 Fonds Transférés (Released)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B5E55]">Panier Tressé Traditionnel Bakongo</span>
                <span className="font-serif font-bold text-emerald-700">120 STT virés</span>
              </div>
              <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                Paiement exécuté irrévocablement vers votre portefeuille artisan.
              </p>
            </div>
          </div>

          {/* Section Mes Œuvres au Catalogue */}
          <div className="border-t border-[#E8E1D5] pt-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1B4332]">
                  Mes Œuvres d&apos;Atelier au Catalogue
                </h3>
                <p className="text-xs text-[#6B5E55]">
                  Vos pièces artisanales certifiées et visibles par les acheteurs
                </p>
              </div>
              <Link
                href="/create"
                className="text-xs font-bold text-[#1B4332] bg-white border border-[#E8E1D5] px-3.5 py-1.5 rounded-xl hover:border-[#1B4332] transition-colors"
              >
                + Ajouter une pièce
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(artisanArtworks.length > 0 ? artisanArtworks : artworks).map((nft) => (
                <NFTCard key={nft.id} nft={nft} />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // =========================================================================
  // VUE 2 : ACCUEIL ACHETEUR (Œuvres à la une, catalogue interactif, bouton Acheter)
  // =========================================================================
  if (user?.role === "BUYER") {
    return (
      <div className="min-h-screen bg-[#F8F5F0] text-[#2D231E]">
        {/* Hero Acheteur */}
        <section className="bg-[#1B4332] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-[#2D6A4F]">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#2D6A4F]/80 border border-[#E9C46A]/40 px-3.5 py-1 text-xs font-bold text-[#E9C46A]">
                  <ShoppingBag className="h-4 w-4 text-[#E9C46A]" />
                  <span>Espace Collectionneur Privilège • {user.displayName}</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                  Chefs-d&apos;Œuvre Authentiques <br />
                  <span className="text-[#E9C46A]">Garantis sous Séquestre</span>.
                </h1>

                <p className="text-xs sm:text-sm text-[#C1DBCF] max-w-2xl leading-relaxed">
                  Acquérez les créations originales de nos maîtres artisans congolais. Vos fonds en jetons STT restent en sécurité dans le smart contract de séquestre jusqu&apos;à ce que vous validiez la réception physique du colis.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="#catalogue"
                    className="rounded-xl bg-[#C86D3B] hover:bg-[#B65E2F] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition-all flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    <span>Parcourir le catalogue d&apos;art</span>
                  </a>

                  <Link
                    href="/my-nfts?tab=orders"
                    className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-3 text-xs sm:text-sm font-bold text-white transition-all flex items-center gap-2"
                  >
                    <Package className="h-4 w-4 text-[#E9C46A]" />
                    <span>Mes Achats en Cours</span>
                  </Link>
                </div>
              </div>

              {/* Pièce à la une pour Acheteur */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl border border-[#2D6A4F] bg-[#081C15]/90 p-5 shadow-2xl backdrop-blur-md">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#143728] to-[#081C15] flex items-center justify-center p-3 border border-[#2D6A4F]/60">
                    <img
                      src="/artworks/masque_pende.jpg"
                      alt="Masque Royal Pende"
                      className="h-full w-full object-contain drop-shadow-2xl"
                    />
                    <div className="absolute top-3 left-3 rounded-full bg-[#1B4332]/95 border border-[#E9C46A]/50 px-2.5 py-0.5 text-xs font-bold text-[#E9C46A]">
                      À la Une • Kwilu
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#C86D3B] font-bold uppercase text-[10px] tracking-wider">Masque Traditionnel</span>
                      <span className="text-emerald-400 font-bold text-[10px]">✓ Atelier Vérifié</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-white">Masque Royal Pende — Mbuya</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#2D6A4F]">
                      <div>
                        <span className="text-[10px] text-[#A7C4B5] block uppercase font-medium">Prix garanti séquestre</span>
                        <span className="font-serif text-xl font-black text-white">
                          180 <span className="text-xs font-bold text-[#C86D3B]">STT</span>
                        </span>
                      </div>
                      <button
                        onClick={() => openBuyModal(artworks[0])}
                        className="rounded-xl bg-[#C86D3B] hover:bg-[#B65E2F] px-4 py-2 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0"
                      >
                        <Lock className="h-3.5 w-3.5 text-[#E9C46A]" />
                        <span>Acheter (Séquestre)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Catalogue Acheteur avec Bouton Acheter actif */}
        <section id="catalogue" className="scroll-mt-20 py-14 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-[#C86D3B] uppercase tracking-wider">
                Catalogue Officiel d&apos;Acquisition
              </span>
              <h2 className="font-serif text-3xl font-extrabold text-[#1B4332] mt-0.5">
                Créations Artisanales Disponibles à l&apos;Achat
              </h2>
              <p className="text-xs text-[#6B5E55] mt-1">
                Chaque œuvre commandée bénéficie du verrouillage sous séquestre conditionnel SendaEscrow.
              </p>
            </div>
            <div className="text-xs text-[#6B5E55]">
              <span className="font-bold text-[#1B4332] text-sm">{filteredNFTs.length}</span> créations disponibles
            </div>
          </div>

          {/* Filtres & Recherche */}
          <div className="rounded-3xl border border-[#E8E1D5] bg-white p-4 shadow-sm mb-8 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-6 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C7A6B]" />
                <input
                  type="text"
                  placeholder="Rechercher par œuvre, matière, artisan, province..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-[#E8E1D5] bg-[#FAF7F2] pl-10 pr-4 py-2.5 text-xs text-[#2D231E] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div className="lg:col-span-3">
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full rounded-xl border border-[#E8E1D5] bg-[#FAF7F2] px-3 py-2.5 text-xs text-[#2D231E] focus:outline-none"
                >
                  <option value="Toutes les provinces">Toutes les provinces</option>
                  {CONGO_PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full rounded-xl border border-[#E8E1D5] bg-[#FAF7F2] px-3 py-2.5 text-xs text-[#2D231E] focus:outline-none"
                >
                  <option value="newest">Plus récents</option>
                  <option value="price-asc">Prix croissant (STT)</option>
                  <option value="price-desc">Prix décroissant (STT)</option>
                </select>
              </div>
            </div>

            {/* Catégories rapides */}
            <div className="flex items-center gap-2 overflow-x-auto py-2 px-0.5 text-xs scrollbar-none">
              <button
                onClick={() => setSelectedCategory("Toutes catégories")}
                className={`rounded-full px-3.5 py-1.5 font-bold whitespace-nowrap transition-colors shadow-2xs ${
                  selectedCategory === "Toutes catégories"
                    ? "bg-[#1B4332] text-white"
                    : "bg-[#FAF7F2] text-[#6B5E55] hover:bg-[#EFE8DC] border border-[#E8E1D5]"
                }`}
              >
                Toutes
              </button>
              {SENDA_CATEGORIES.filter((c) => c !== "Toutes catégories").map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 font-bold whitespace-nowrap transition-colors shadow-2xs ${
                    selectedCategory === cat
                      ? "bg-[#1B4332] text-white"
                      : "bg-[#FAF7F2] text-[#6B5E55] hover:bg-[#EFE8DC] border border-[#E8E1D5]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grille d'œuvres Acheteur (Bouton Acheter présent) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNFTs.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-[#E8E1D5] p-8 space-y-3">
                <Compass className="h-10 w-10 text-[#C86D3B] mx-auto opacity-70" />
                <h3 className="font-serif text-lg font-bold text-[#1B4332]">Aucune œuvre ne correspond à vos critères</h3>
                <p className="text-xs text-[#6B5E55]">Essayez d&apos;élargir votre recherche ou de réinitialiser les filtres.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("Toutes catégories");
                    setSelectedProvince("Toutes les provinces");
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] px-4 py-2 text-xs font-bold text-[#C86D3B] hover:bg-[#EFE8DC] transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              filteredNFTs.map((nft) => (
                <NFTCard key={nft.id} nft={nft} onBuy={openBuyModal} />
              ))
            )}
          </div>
        </section>

        {/* Modal d'Achat sous Séquestre */}
        <BuyModal
          nft={selectedNFTForBuy}
          isOpen={isBuyModalOpen}
          onClose={() => setIsBuyModalOpen(false)}
        />
      </div>
    );
  }

  // =========================================================================
  // VUE 3 : ACCUEIL ADMINISTRATEUR (Console de modération, KPIs, audits)
  // =========================================================================
  if (user?.role === "ADMIN") {
    return (
      <div className="min-h-screen bg-[#F8F5F0] text-[#2D231E]">
        {/* Hero Administrateur */}
        <section className="bg-[#1B4332] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-[#2D6A4F]">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#2D6A4F]/70">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-purple-900/60 border border-purple-400/40 px-3.5 py-1 text-xs font-bold text-purple-200">
                  <ShieldAlert className="h-4 w-4 text-purple-300" />
                  <span>Console de Supervision Globale • SENDA RDC</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-white">
                  Panneau de Contrôle — {user.displayName}
                </h1>
                <p className="text-xs sm:text-sm text-[#C1DBCF] max-w-2xl leading-relaxed">
                  Supervisez les homologations d&apos;ateliers d&apos;artisans, auditez les ordres de séquestre décentralisés et assurez l&apos;intégrité culturelle du catalogue.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/admin"
                  className="rounded-xl bg-purple-700 hover:bg-purple-800 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition-all flex items-center gap-2 hover:scale-102"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Panneau d&apos;Administration</span>
                </Link>

                <Link
                  href="/my-nfts"
                  className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-3 text-xs sm:text-sm font-bold text-white transition-all flex items-center gap-2"
                >
                  <History className="h-4 w-4 text-[#E9C46A]" />
                  <span>Superviser les Séquestres</span>
                </Link>
              </div>
            </div>

            {/* 4 KPIs Statistiques Globales Plateforme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
              <div className="rounded-2xl bg-[#081C15]/70 border border-[#2D6A4F] p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A7C4B5] block">
                  Utilisateurs Enregistrés
                </span>
                <span className="font-serif text-2xl font-black text-white">4</span>
                <span className="text-[10px] text-purple-300 block">Artisans & Acheteurs</span>
              </div>

              <div className="rounded-2xl bg-[#081C15]/70 border border-[#2D6A4F] p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A7C4B5] block">
                  Artisans en Attente
                </span>
                <span className="font-serif text-2xl font-black text-[#E9C46A]">1</span>
                <span className="text-[10px] text-amber-300 block">Papa Tshimanga (Kasaï)</span>
              </div>

              <div className="rounded-2xl bg-[#081C15]/70 border border-[#2D6A4F] p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A7C4B5] block">
                  Œuvres Homologuées
                </span>
                <span className="font-serif text-2xl font-black text-white">{artworks.length}</span>
                <span className="text-[10px] text-emerald-400 block">Certificats Polygon Amoy</span>
              </div>

              <div className="rounded-2xl bg-[#081C15]/70 border border-[#2D6A4F] p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A7C4B5] block">
                  Volume sous Séquestre
                </span>
                <span className="font-serif text-2xl font-black text-[#E9C46A]">300 STT</span>
                <span className="text-[10px] text-[#A7C4B5] block">SendaEscrow.sol</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section Dossier Artisan en Attente de Validation */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <div className="rounded-3xl border border-amber-300/80 bg-amber-50/70 p-6 sm:p-8 mb-10 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1B4332]">
                    Demande de Certification d&apos;Artisan en Attente
                  </h3>
                  <p className="text-xs text-[#6B5E55]">
                    Contrôle physique des ateliers d&apos;artisanat congolais avec justification écrite obligatoire.
                  </p>
                </div>
              </div>
              <Link
                href="/admin"
                className="rounded-xl bg-[#1B4332] hover:bg-[#143728] px-4 py-2.5 text-xs font-bold text-[#E9C46A] flex items-center gap-1.5 transition-colors self-start md:self-auto shrink-0 shadow-xs"
              >
                <span>Examiner et valider dans /admin</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#4A3B33]">
              <div className="p-2.5 rounded-xl bg-white/70 border border-amber-200/60">
                <span className="text-[#8C7A6B] block text-[10px] uppercase font-bold">Artisan postulant</span>
                <strong className="text-[#1B4332]">Papa Tshimanga Kabemba</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white/70 border border-amber-200/60">
                <span className="text-[#8C7A6B] block text-[10px] uppercase font-bold">Atelier & Province</span>
                <strong className="text-[#2D231E]">Sculptures Tshokwe (Kasaï)</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white/70 border border-amber-200/60">
                <span className="text-[#8C7A6B] block text-[10px] uppercase font-bold">Spécialité reconnue</span>
                <span className="text-[#4A3B33]">Statuettes royales en bois d&apos;iroko</span>
              </div>
            </div>
          </div>

          {/* Inventaire du Catalogue sous Modération */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1B4332]">
                  Inventaire des Pièces Artisanales Répertoriées
                </h3>
                <p className="text-xs text-[#6B5E55]">
                  Contrôle de conformité des fiches techniques, certifications et prix sous séquestre
                </p>
              </div>
              <Link
                href="/admin"
                className="text-xs font-bold text-[#1B4332] underline"
              >
                Gérer les œuvres dans /admin
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {artworks.map((nft) => (
                <NFTCard key={nft.id} nft={nft} />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // =========================================================================
  // VUE 4 : ACCUEIL VISITEUR NON CONNECTÉ (Présentation, consultation seule, pas de wallet)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#2D231E]">
      {/* Hero Visiteur */}
      <section className="relative overflow-hidden bg-[#1B4332] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-[#2D6A4F]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#E9C46A_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#2D6A4F]/70 border border-[#E9C46A]/40 px-4 py-1.5 text-xs font-bold text-[#E9C46A] shadow-sm">
                <ShieldCheck className="h-4 w-4 text-[#E9C46A]" />
                <span>Marketplace Décentralisée • République démocratique du Congo</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-white">
                L&apos;artisanat congolais, <br />
                <span className="text-[#E9C46A]">authentifié</span> et <span className="text-[#C86D3B]">valorisé</span>.
              </h1>

              <p className="text-base sm:text-lg text-[#C1DBCF] max-w-2xl leading-relaxed">
                Reliez-vous directement aux maîtres sculpteurs, tisseurs et orfèvres de Kinshasa, du Kwilu, du Kasaï et du Katanga. Chaque création matérielle est protégée par un <strong>certificat numérique d&apos;authenticité</strong> et un protocole de <strong>séquestre décentralisé</strong>.
              </p>

              {/* Boutons d'Action Visiteur */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#catalogue"
                  className="rounded-xl bg-[#C86D3B] hover:bg-[#B65E2F] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all flex items-center gap-2 hover:scale-102"
                >
                  <Search className="h-4 w-4" />
                  <span>Consulter le catalogue (Lecture seule)</span>
                </a>

                <Link
                  href="/login"
                  className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3.5 text-sm font-bold text-white transition-all flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4 text-[#E9C46A]" />
                  <span>Se connecter / S&apos;inscrire</span>
                </Link>
              </div>

              {/* Métriques de réassurance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 pt-6 border-t border-[#2D6A4F]/70 text-xs">
                <div className="rounded-2xl bg-[#081C15]/40 border border-[#2D6A4F]/50 p-3 sm:p-0 sm:bg-transparent sm:border-0">
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#E9C46A] block">6</span>
                  <span className="text-[#A7C4B5] font-medium text-xs">Provinces de RDC couvertes</span>
                </div>
                <div className="rounded-2xl bg-[#081C15]/40 border border-[#2D6A4F]/50 p-3 sm:p-0 sm:bg-transparent sm:border-0">
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#E9C46A] block">100%</span>
                  <span className="text-[#A7C4B5] font-medium text-xs">Ateliers audités sur site</span>
                </div>
                <div className="rounded-2xl bg-[#081C15]/40 border border-[#2D6A4F]/50 p-3 sm:p-0 sm:bg-transparent sm:border-0">
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#E9C46A] block">Escrow</span>
                  <span className="text-[#A7C4B5] font-medium text-xs">Séquestre physique sécurisé</span>
                </div>
              </div>
            </div>

            {/* Carte de Démonstration */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-[#2D6A4F] bg-[#081C15]/85 p-5 shadow-2xl backdrop-blur-md">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#143728] to-[#081C15] flex items-center justify-center p-3 border border-[#2D6A4F]/60">
                  <img
                    src="/artworks/masque_pende.jpg"
                    alt="Masque Royal Pende"
                    className="h-full w-full object-contain drop-shadow-2xl"
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-[#1B4332]/95 border border-[#E9C46A]/50 px-3 py-1 text-xs font-bold text-[#E9C46A]">
                    Gungu • Kwilu
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-xs uppercase tracking-wider text-[#C86D3B] font-bold">
                      Masque traditionnel Mbuya
                    </span>
                    <span className="text-[11px] font-bold text-[#16A34A] bg-[#16A34A]/20 px-2.5 py-0.5 rounded-full border border-[#16A34A]/30">
                      ✓ Audit sur site
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-white">
                    Masque Royal Pende — Mbuya
                  </h3>

                  <p className="text-xs text-[#A7C4B5] leading-relaxed">
                    Sculpté à la main en bois de wengé noble par Maître Mukendi. Orné de fibres de raphia peignées et pigments naturels.
                  </p>

                  <div className="pt-3.5 border-t border-[#2D6A4F] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-[#A7C4B5] block font-medium uppercase tracking-wider">
                        Prix indicatif
                      </span>
                      <span className="font-serif text-2xl font-black text-white">
                        180 <span className="text-sm font-bold text-[#C86D3B]">STT</span>
                      </span>
                    </div>

                    <Link
                      href="/login"
                      className="rounded-xl bg-[#C86D3B] hover:bg-[#B65E2F] px-4 py-2.5 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 shadow-md shrink-0"
                    >
                      <Lock className="h-3.5 w-3.5 text-[#E9C46A]" />
                      <span>Commander sous séquestre</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Piliers de Confiance SENDA (À propos) */}
      <section id="a-propos" className="scroll-mt-20 py-14 bg-[#FAF7F2] border-b border-[#E8E1D5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 p-6 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs hover:border-[#1B4332]/30 transition-all h-full">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F0EC] text-[#1B4332]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-base font-bold text-[#1B4332]">
                  1. Traçabilité Culturelle Authentifiée
                </h4>
                <p className="text-xs text-[#6B5E55] leading-relaxed">
                  Contrôle physique des ateliers d&apos;artisanat en RDC, des essences de bois et pigments naturels employés.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4 p-6 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs hover:border-[#1B4332]/30 transition-all h-full">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FBF0EA] text-[#C86D3B]">
                <Lock className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-base font-bold text-[#1B4332]">
                  2. Séquestre Décentralisé
                </h4>
                <p className="text-xs text-[#6B5E55] leading-relaxed">
                  Paiement sécurisé via le contrat intelligent <code className="font-mono text-[#1B4332]">SendaEscrow</code>. Les fonds ne sont libérés qu&apos;après confirmation de la livraison physique.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4 p-6 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs hover:border-[#1B4332]/30 transition-all h-full">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAF0E6] text-[#8C5228]">
                <Award className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-base font-bold text-[#1B4332]">
                  3. Redevances Créateurs (ERC-2981)
                </h4>
                <p className="text-xs text-[#6B5E55] leading-relaxed">
                  L&apos;artisan créateur perçoit automatiquement 5% à 10% sur toute revente future de son œuvre.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Aperçu du Catalogue en Lecture Seule pour Visiteur */}
      <section id="catalogue" className="scroll-mt-20 py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#C86D3B] uppercase tracking-wider mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Aperçu des Collections Nationales</span>
            </div>
            <h2 className="font-serif text-3xl font-extrabold text-[#1B4332]">
              Catalogue en Consultation Libre
            </h2>
            <p className="text-sm text-[#6B5E55] mt-1">
              Explorez les chefs-d&apos;œuvre répertoriés. Connectez-vous avec un compte acheteur pour commander sous séquestre.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6B5E55] hidden sm:inline">
              <strong className="text-[#1B4332]">{filteredNFTs.length}</strong> œuvres disponibles
            </span>
            <Link
              href="/login"
              className="rounded-xl bg-[#1B4332] text-[#E9C46A] px-4 py-2.5 text-xs font-bold hover:bg-[#143728] transition-colors shadow-sm"
            >
              Se connecter pour commander
            </Link>
          </div>
        </div>

        {/* Filtres & Recherche Visiteur */}
        <div className="rounded-3xl border border-[#E8E1D5] bg-white p-4 shadow-sm mb-8 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C7A6B]" />
              <input
                type="text"
                placeholder="Rechercher une statue, masque, artisan, matière..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[#E8E1D5] bg-[#FAF7F2] pl-10 pr-4 py-2.5 text-xs text-[#2D231E] focus:outline-none focus:border-[#1B4332]"
              />
            </div>

            <div className="lg:col-span-3">
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full rounded-xl border border-[#E8E1D5] bg-[#FAF7F2] px-3 py-2.5 text-xs text-[#2D231E] focus:outline-none"
              >
                <option value="Toutes les provinces">Toutes les provinces</option>
                {CONGO_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full rounded-xl border border-[#E8E1D5] bg-[#FAF7F2] px-3 py-2.5 text-xs text-[#2D231E] focus:outline-none"
              >
                <option value="newest">Plus récents</option>
                <option value="price-asc">Prix croissant (STT)</option>
                <option value="price-desc">Prix décroissant (STT)</option>
              </select>
            </div>
          </div>

          {/* Catégories rapides */}
          <div className="flex items-center gap-2 overflow-x-auto py-2 px-0.5 text-xs scrollbar-none">
            <button
              onClick={() => setSelectedCategory("Toutes catégories")}
              className={`rounded-full px-3.5 py-1.5 font-bold whitespace-nowrap transition-colors shadow-2xs ${
                selectedCategory === "Toutes catégories"
                  ? "bg-[#1B4332] text-white"
                  : "bg-[#FAF7F2] text-[#6B5E55] hover:bg-[#EFE8DC] border border-[#E8E1D5]"
              }`}
            >
              Toutes
            </button>
            {SENDA_CATEGORIES.filter((c) => c !== "Toutes catégories").map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 font-bold whitespace-nowrap transition-colors shadow-2xs ${
                  selectedCategory === cat
                    ? "bg-[#1B4332] text-white"
                    : "bg-[#FAF7F2] text-[#6B5E55] hover:bg-[#EFE8DC] border border-[#E8E1D5]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grille d'œuvres Visiteur (Pas de bouton Acheter direct) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNFTs.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-[#E8E1D5] p-8 space-y-3">
              <Compass className="h-10 w-10 text-[#C86D3B] mx-auto opacity-70" />
              <h3 className="font-serif text-lg font-bold text-[#1B4332]">Aucune création trouvée</h3>
              <p className="text-xs text-[#6B5E55]">Essayez d&apos;élargir vos termes de recherche ou de réinitialiser les filtres.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Toutes catégories");
                  setSelectedProvince("Toutes les provinces");
                }}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] px-4 py-2 text-xs font-bold text-[#C86D3B] hover:bg-[#EFE8DC] transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            filteredNFTs.map((nft) => (
              <NFTCard key={nft.id} nft={nft} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
