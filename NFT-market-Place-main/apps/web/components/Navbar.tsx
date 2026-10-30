"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";
import { useAuth } from "@/context/AuthContext";
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
  Link as LinkIcon,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { user, logout, linkWallet } = useAuth();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isLinking, setIsLinking] = useState(false);

  const navLinks = [
    { name: "Catalogue", href: "/", icon: Compass },
    { name: "Créer une œuvre", href: "/create", icon: PlusCircle },
    { name: "Mes Commandes", href: "/my-nfts", icon: PackageCheck },
  ];

  if (user?.role === "ADMIN") {
    navLinks.push({ name: "Administration", href: "/admin", icon: ShieldAlert });
  }

  const handleLinkWallet = async () => {
    if (!address) return;
    setIsLinking(true);
    await linkWallet(address, signMessageAsync);
    setIsLinking(false);
  };

  const getRoleBadge = (role?: string, verif?: string) => {
    if (role === "ADMIN") {
      return { label: "Admin", bg: "bg-purple-100 text-purple-800 border-purple-200" };
    }
    if (role === "ARTISAN") {
      if (verif === "VERIFIED") {
        return { label: "Artisan Certifié", bg: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      }
      return { label: "Artisan En Attente", bg: "bg-amber-100 text-amber-800 border-amber-200" };
    }
    return { label: "Acheteur", bg: "bg-blue-100 text-blue-800 border-blue-200" };
  };

  const roleInfo = getRoleBadge(user?.role, user?.verificationStatus);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E8E1D5] bg-[#FDFBF7]/90 backdrop-blur-md transition-all">
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

        {/* 2. Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
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

        {/* 3. Session & Web3 Actions */}
        <div className="flex items-center gap-2">
          {/* Faucet STT */}
          <Link
            href="/my-nfts"
            title="Devise de démonstration : Senda Test Token"
            className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-[#E8E1D5] bg-white px-2.5 py-1 text-xs font-semibold text-[#2D231E] hover:border-[#C86D3B] transition-colors shadow-xs"
          >
            <Coins className="h-3 w-3 text-[#C86D3B]" />
            <span className="text-[11px] font-bold text-[#1B4332]">STT</span>
          </Link>

          {/* RainbowKit Wallet Connect */}
          <ConnectButton
            showBalance={false}
            chainStatus="none"
            accountStatus="avatar"
          />

          {/* Auth State Button */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-[#E8E1D5] bg-white px-2.5 py-1 text-xs font-bold text-[#1B4332] hover:border-[#1B4332] transition-all shadow-xs"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B4332] text-white text-[10px]">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{user.displayName.split(" ")[0]}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full border ${roleInfo.bg}`}>
                  {roleInfo.label}
                </span>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#E8E1D5] bg-white p-3 shadow-xl space-y-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="border-b border-[#EAE3D6] pb-2">
                    <p className="text-xs font-bold text-[#1B4332]">{user.displayName}</p>
                    <p className="text-[10px] text-[#8C7A6B] truncate">{user.email}</p>
                    <div className="mt-1">
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border font-bold ${roleInfo.bg}`}>
                        {roleInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Liaison de portefeuille si non encore lié */}
                  {isConnected && (!user.walletAddress || user.walletAddress.toLowerCase() !== address?.toLowerCase()) ? (
                    <button
                      type="button"
                      onClick={handleLinkWallet}
                      disabled={isLinking}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#C86D3B] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#B05B2D] transition-all"
                    >
                      <LinkIcon className="h-3 w-3" />
                      <span>{isLinking ? "Signature..." : "Lier ce portefeuille (Signer)"}</span>
                    </button>
                  ) : user.walletAddress ? (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Wallet lié : {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</span>
                    </div>
                  ) : null}

                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-[#1B4332] font-semibold hover:bg-[#FAF8F5]"
                    >
                      <ShieldAlert className="h-3.5 w-3.5 text-[#C86D3B]" />
                      <span>Modération & Vérifications</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-red-600 font-semibold hover:bg-red-50 transition-colors"
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
                className="rounded-full px-3 py-1 text-xs font-bold text-[#1B4332] hover:bg-[#FAF8F5] transition-all"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[#1B4332] px-3 py-1 text-xs font-bold text-[#E9C46A] hover:bg-[#143427] shadow-xs transition-all"
              >
                S&apos;inscrire
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-[#E8E1D5] bg-[#FDFBF7] px-4 py-4 md:hidden shadow-lg animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
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
