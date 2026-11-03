"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { useAuth } from "@/context/AuthContext";
import { formatAddress } from "@/lib/utils";
import {
  Compass,
  PlusCircle,
  PackageCheck,
  Menu,
  X,
  Coins,
  ShieldAlert,
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
  Power,
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
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();

  // Définition du menu selon le rôle exact (Composant de navigation unique)
  const getNavLinks = (): NavItem[] => {
    if (!user) {
      // 1. Visiteur (non connecté)
      return [
        { name: "Accueil", href: "/", icon: Home },
        { name: "Catalogue", href: "/#catalogue", icon: Compass },
        { name: "À propos", href: "/#a-propos", icon: Info },
      ];
    }

    switch (user.role) {
      case "ARTISAN":
        // 2. Artisan (ne voit pas le catalogue d'achat public, panier, favoris)
        return [
          { name: "Tableau de bord", href: "/", icon: LayoutDashboard },
          { name: "Mes œuvres", href: "/my-nfts?tab=artisan", icon: Palette },
          { name: "Ajouter une œuvre", href: "/create", icon: PlusCircle },
          { name: "Mes ventes", href: "/my-nfts?tab=orders", icon: PackageCheck },
        ];

      case "BUYER":
        // 3. Acheteur (ne voit pas ajouter une œuvre, mes ventes, admin)
        return [
          { name: "Accueil", href: "/", icon: Home },
          { name: "Catalogue", href: "/#catalogue", icon: Compass },
          { name: "Mes achats", href: "/my-nfts?tab=orders", icon: ShoppingBag },
          { name: "Favoris", href: "/#favoris", icon: Heart },
        ];

      case "ADMIN":
        // 4. Administrateur (ne voit pas actions d'achat ou de création)
        return [
          { name: "Tableau de bord", href: "/", icon: LayoutDashboard },
          { name: "Utilisateurs", href: "/admin#utilisateurs", icon: Users },
          { name: "Artisans (validation)", href: "/admin#artisans", icon: ShieldCheck },
          { name: "Œuvres (modération)", href: "/admin#oeuvres", icon: FileCheck2 },
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
    // À la déconnexion de l'utilisateur, déconnecter aussi le portefeuille et réinitialiser l'affichage
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
      return { label: "Maître Artisan", bg: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    }
    if (role === "BUYER") {
      return { label: "Acheteur d'Art", bg: "bg-blue-100 text-blue-800 border-blue-200" };
    }
    return { label: "Visiteur", bg: "bg-stone-100 text-stone-800 border-stone-200" };
  };

  const roleInfo = getRoleBadge(user?.role);
  const showWalletButton = user && (user.role === "ARTISAN" || user.role === "BUYER");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E8E1D5] bg-[#FDFBF7]/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 1. Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#1B4332] shadow-sm transition-transform group-hover:scale-105">
            <span className="font-serif text-lg font-black text-[#E9C46A] tracking-tighter">S</span>
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#C86D3B] border-2 border-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl font-black tracking-wider text-[#1B4332]">
              SENDA
            </span>
            <span className="rounded-full bg-[#1B4332]/10 px-2 py-0.5 text-[10px] font-bold text-[#1B4332] border border-[#1B4332]/15">
              RDC
            </span>
          </div>
        </Link>

        {/* 2. Menu de Navigation Unique Adapté au Rôle */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href.split("#")[0]) && link.href.split("#")[0] !== "/");
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
                  isActive
                    ? "bg-[#1B4332] text-white shadow-sm"
                    : "text-[#4A3B33] hover:bg-[#EFE8DC]/80 hover:text-[#1B4332]"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", isActive ? "text-[#E9C46A]" : "text-[#C86D3B]")} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* 3. Section Actions & Portefeuille (Rôle dépendant) */}
        <div className="flex items-center gap-3">
          {/* Robinet STT : Visible uniquement pour l'Acheteur ou l'Artisan */}
          {user && (user.role === "BUYER" || user.role === "ARTISAN") && (
            <Link
              href="/my-nfts"
              title="Devise de démonstration : Senda Test Token"
              className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-[#E8E1D5] bg-white px-2.5 py-1 text-xs font-semibold text-[#2D231E] hover:border-[#C86D3B] transition-colors shadow-xs"
            >
              <Coins className="h-3 w-3 text-[#C86D3B]" />
              <span className="text-[11px] font-bold text-[#1B4332]">STT</span>
            </Link>
          )}

          {/* Section Portefeuille : UNIQUEMENT après connexion (Artisan ou Acheteur) */}
          {showWalletButton && (
            <ConnectButton.Custom>
              {({
                account,
                chain,
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
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#C86D3B] hover:bg-[#B65E2F] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:scale-102"
                    >
                      <Wallet className="h-3.5 w-3.5 text-[#E9C46A]" />
                      <span>Connect Wallet</span>
                    </button>
                  );
                }

                return (
                  <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/90 px-2.5 py-1 text-xs shadow-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="text-[11px] font-mono font-bold text-[#1B4332] hidden sm:inline">
                      {formatAddress(account.address)}
                    </span>
                    <button
                      type="button"
                      onClick={() => disconnect()}
                      title="Déconnecter le portefeuille"
                      className="ml-0.5 p-1 rounded-full text-stone-400 hover:text-red-600 transition-colors"
                    >
                      <Power className="h-3 w-3" />
                    </button>
                  </div>
                );
              }}
            </ConnectButton.Custom>
          )}

          {/* Profil / Auth State Button */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-[#E8E1D5] bg-white px-2.5 py-1 text-xs font-bold text-[#1B4332] hover:border-[#1B4332] transition-all shadow-xs"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B4332] text-white text-[10px]">
                  {(user.displayName || "U").charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{(user.displayName || "Utilisateur").split(" ")[0]}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full border ${roleInfo.bg}`}>
                  {roleInfo.label}
                </span>
              </button>

              {/* Dropdown Menu Profil */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-[#E8E1D5] bg-white p-3 shadow-xl space-y-2 z-50 animate-in fade-in zoom-in-95 duration-150 ease-emil-out motion-reduce:animate-none">
                  <div className="border-b border-[#EAE3D6] pb-2">
                    <p className="text-xs font-bold text-[#1B4332]">{user.displayName || "Utilisateur"}</p>
                    <p className="text-[10px] text-[#8C7A6B] truncate">{user.email || ""}</p>
                    <div className="mt-1">
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border font-bold ${roleInfo.bg}`}>
                        {roleInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* État du wallet dans le profil */}
                  {address && (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Wallet : {formatAddress(address)}</span>
                    </div>
                  )}

                  {/* Bouton de déconnexion globale (déconnecte aussi le wallet) */}
                  <button
                    type="button"
                    onClick={handleUserLogout}
                    className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-red-600 font-semibold hover:bg-red-50 active:scale-95 transition-colors duration-micro"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Visiteur (non connecté) : Connexion et Inscription uniquement, PAS de Connect Wallet
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full px-3.5 py-1.5 text-xs font-bold text-[#1B4332] hover:bg-[#FAF8F5] active:scale-95 transition-colors duration-150"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[#1B4332] px-4 py-1.5 text-xs font-bold text-[#E9C46A] hover:bg-[#143427] active:scale-95 shadow-xs transition-colors duration-150"
              >
                Inscription
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8E1D5] bg-white text-[#2D231E] md:hidden hover:bg-[#EFE8DC]"
            aria-label="Ouvrir le menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (utilise les mêmes liens adaptés) */}
      {mobileMenuOpen && (
        <div className="border-b border-[#E8E1D5] bg-[#FDFBF7] px-4 py-4 md:hidden shadow-lg animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all",
                    isActive
                      ? "bg-[#1B4332] text-white shadow-sm"
                      : "text-[#4A3B33] hover:bg-[#EFE8DC]/80 hover:text-[#1B4332]"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-[#E9C46A]" : "text-[#C86D3B]")} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
