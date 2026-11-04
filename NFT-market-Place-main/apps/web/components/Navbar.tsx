"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect, useReadContract } from "wagmi";
import { formatEther } from "viem";
import { useAuth } from "@/context/AuthContext";
import { formatAddress } from "@/lib/utils";
import { DEFAULT_CONTRACTS, SENDA_TOKEN_ABI } from "@/lib/contracts/abis";
import {
  Compass,
  PlusCircle,
  PackageCheck,
  Menu,
  X,
  User,
  LogOut,
  Palette,
  ShoppingBag,
  Heart,
  Users,
  ShieldCheck,
  FileCheck2,
  History,
  Settings,
  LayoutDashboard,
  Home,
  Info,
  Wallet,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { user, logout } = useAuth();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Lecture du solde STT on-chain
  const { data: rawBalance } = useReadContract({
    address: DEFAULT_CONTRACTS.tokenAddress,
    abi: SENDA_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  const sttBalanceFormatted = useMemo(() => {
    if (rawBalance === undefined || rawBalance === null) return "0";
    try {
      const val = formatEther(rawBalance as bigint);
      const num = parseFloat(val);
      return num.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
    } catch {
      return "0";
    }
  }, [rawBalance]);

  // Définition du menu selon le rôle exact
  const getNavLinks = (): NavItem[] => {
    if (!user) {
      return [
        { name: "Accueil", href: "/", icon: Home },
        { name: "Catalogue", href: "/#catalogue", icon: Compass },
        { name: "À propos", href: "/#a-propos", icon: Info },
      ];
    }

    switch (user.role) {
      case "ARTISAN":
        return [
          { name: "Tableau de bord", href: "/", icon: LayoutDashboard },
          { name: "Mes œuvres", href: "/my-nfts?tab=artisan", icon: Palette },
          { name: "Ajouter une œuvre", href: "/create", icon: PlusCircle },
          { name: "Mes ventes", href: "/my-nfts?tab=orders", icon: PackageCheck },
        ];

      case "BUYER":
        return [
          { name: "Accueil", href: "/", icon: Home },
          { name: "Catalogue", href: "/#catalogue", icon: Compass },
          { name: "Mes achats", href: "/my-nfts?tab=orders", icon: ShoppingBag },
          { name: "Favoris", href: "/#favoris", icon: Heart },
        ];

      case "ADMIN":
        return [
          { name: "Tableau de bord", href: "/", icon: LayoutDashboard },
          { name: "Utilisateurs", href: "/admin#utilisateurs", icon: Users },
          { name: "Artisans", href: "/admin#artisans", icon: ShieldCheck },
          { name: "Œuvres", href: "/admin#oeuvres", icon: FileCheck2 },
          { name: "Transactions", href: "/admin#transactions", icon: History },
          { name: "Paramètres", href: "/admin#parametres", icon: Settings },
        ];

      default:
        return [
          { name: "Accueil", href: "/", icon: Home },
          { name: "Catalogue", href: "/#catalogue", icon: Compass },
        ];
    }
  };

  const navLinks = getNavLinks();

  const handleUserLogout = () => {
    if (isConnected) {
      disconnect();
    }
    logout();
    setUserDropdownOpen(false);
    router.push("/");
  };

  const getRoleBadge = (role?: string) => {
    if (role === "ADMIN") {
      return { label: "Administrateur", bg: "bg-purple-100 text-purple-800 border-purple-200" };
    }
    if (role === "ARTISAN") {
      return { label: "Artisan", bg: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    }
    if (role === "BUYER") {
      return { label: "Acheteur", bg: "bg-blue-100 text-blue-800 border-blue-200" };
    }
    return { label: "Visiteur", bg: "bg-stone-100 text-stone-800 border-stone-200" };
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E8E1D5] bg-[#FDFBF7]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* 1. Brand Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B4332] shadow-xs">
            <span className="font-serif text-base font-bold text-[#E9C46A]">S</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-serif text-lg font-bold tracking-wider text-[#1B4332]">
              SENDA
            </span>
            <span className="rounded bg-[#1B4332]/10 px-1.5 py-0.5 text-[9px] font-semibold text-[#1B4332] border border-[#1B4332]/15">
              RDC
            </span>
          </div>
        </Link>

        {/* 2. Menu Navigation (Bureau) */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== "/" &&
                pathname.startsWith(link.href.split("#")[0]) &&
                link.href.split("#")[0] !== "/");
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors duration-micro",
                  isActive
                    ? "bg-[#1B4332] text-white"
                    : "text-[#4A3B33] hover:bg-[#EFE8DC]/80 hover:text-[#1B4332]"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", isActive ? "text-[#E9C46A]" : "text-[#C86D3B]")} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* 3. Section Portefeuille & Authentification */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Bouton Portefeuille : Visible pour tous (visiteurs et connectés) */}
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              const ready = mounted && authenticationStatus !== "loading";
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus || authenticationStatus === "authenticated");

              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#1B4332] bg-[#1B4332] px-2.5 py-1.5 sm:px-3 text-xs font-medium text-white transition-colors duration-micro hover:bg-[#143427] active:scale-[0.98]"
                  >
                    <Wallet className="h-3.5 w-3.5 text-[#E9C46A]" />
                    <span className="hidden sm:inline">Connecter le portefeuille</span>
                    <span className="sm:hidden">Portefeuille</span>
                  </button>
                );
              }

              // Détection du réseau requis : Polygon Amoy (80002)
              if (chain.unsupported || chain.id !== 80002) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-900 transition-colors duration-micro hover:bg-amber-100 active:scale-[0.98]"
                    title="Le réseau actif n'est pas Polygon Amoy (80002). Cliquez pour changer."
                  >
                    <AlertCircle className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                    <span>Mauvais réseau</span>
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-[#E8E1D5] bg-white px-2 py-1 text-xs font-medium text-[#4A3B33] hover:border-[#1B4332] transition-colors duration-micro"
                    title="Réseau connecté. Cliquez pour changer."
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    <span className="truncate max-w-[90px]">{chain.name}</span>
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8E1D5] bg-white px-2.5 py-1 text-xs font-mono font-medium text-[#1B4332] hover:border-[#1B4332] transition-colors duration-micro"
                    title="Consulter le solde STT et les détails du compte"
                  >
                    <span className="font-sans font-semibold text-[#C86D3B] hidden md:inline border-r border-[#E8E1D5] pr-1.5">
                      {sttBalanceFormatted} STT
                    </span>
                    <span>{account.displayName}</span>
                  </button>
                </div>
              );
            }}
          </ConnectButton.Custom>

          {/* Section Profil Utilisateur */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 rounded-lg border border-[#E8E1D5] bg-white px-2.5 py-1 text-xs font-medium text-[#1B4332] hover:border-[#1B4332] transition-colors duration-micro"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1B4332] text-white text-[10px]">
                  {(user.displayName || "U").charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[90px] truncate">
                  {(user.displayName || "Utilisateur").split(" ")[0]}
                </span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded border ${roleInfo.bg} hidden sm:inline`}>
                  {roleInfo.label}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-[#E8E1D5] bg-white p-2.5 shadow-lg space-y-2 z-50 animate-in fade-in zoom-in-95 duration-100 ease-emil-out motion-reduce:animate-none">
                  <div className="border-b border-[#EAE3D6] pb-2">
                    <p className="text-xs font-semibold text-[#1B4332]">
                      {user.displayName || "Utilisateur"}
                    </p>
                    <p className="text-[10px] text-[#8C7A6B] truncate">{user.email || ""}</p>
                    <div className="mt-1">
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded border font-medium ${roleInfo.bg}`}>
                        {roleInfo.label}
                      </span>
                    </div>
                  </div>

                  {address && (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                      <span className="truncate font-mono">{formatAddress(address)}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleUserLogout}
                    className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-red-600 font-medium hover:bg-red-50 transition-colors duration-micro"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#1B4332] hover:bg-[#FAF8F5] transition-colors duration-micro"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-flex rounded-lg border border-[#E8E1D5] bg-white px-3 py-1.5 text-xs font-medium text-[#1B4332] hover:bg-[#FAF8F5] transition-colors duration-micro"
              >
                Inscription
              </Link>
            </div>
          )}

          {/* Bouton Menu Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8E1D5] bg-white text-[#2D231E] md:hidden hover:bg-[#EFE8DC] transition-colors duration-micro"
            aria-label="Ouvrir le menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Menu Déroulant Mobile */}
      {mobileMenuOpen && (
        <div className="border-b border-[#E8E1D5] bg-[#FDFBF7] px-4 py-3 md:hidden shadow-sm animate-in slide-in-from-top-1 duration-150 ease-emil-out motion-reduce:animate-none">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-micro",
                    isActive
                      ? "bg-[#1B4332] text-white"
                      : "text-[#4A3B33] hover:bg-[#EFE8DC]/80 hover:text-[#1B4332]"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-[#E9C46A]" : "text-[#C86D3B]")} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            {!user && (
              <div className="pt-2 mt-2 border-t border-[#E8E1D5] flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-medium text-[#1B4332] border border-[#E8E1D5] rounded-lg bg-white"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-medium text-white bg-[#1B4332] rounded-lg"
                >
                  Inscription
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
