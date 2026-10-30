import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, ExternalLink, Award, FileCode2 } from "lucide-react";
import { DEFAULT_CONTRACTS } from "@/lib/contracts/abis";
import { formatAddress } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[#E5DCCE] bg-[#081C15] py-14 text-[#C1DBCF]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E9C46A] p-0.5">
                <span className="font-serif text-xl font-black text-[#1B4332]">S</span>
              </div>
              <span className="font-serif text-2xl font-bold tracking-wider text-white">
                SENDA
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[#A7C4B5]">
              Marketplace décentralisée de l&apos;artisanat de la République démocratique du Congo.
              Chaque création physique est enregistrée via un certificat NFT ERC-721 sur Polygon Amoy,
              protégée par un protocole de paiement sous séquestre conditionnel et conservée sur IPFS.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#E8F0EC]">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#1B4332] px-3 py-1.5 border border-[#2D6A4F]">
                <Lock className="h-3.5 w-3.5 text-[#E9C46A]" /> Séquestre Physique SendaEscrow
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#1B4332] px-3 py-1.5 border border-[#2D6A4F]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A]" /> Certification d&apos;Ateliers
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#1B4332] px-3 py-1.5 border border-[#2D6A4F]">
                <Award className="h-3.5 w-3.5 text-[#C86D3B]" /> Redevances Créateurs ERC-2981
              </span>
            </div>
          </div>

          {/* Projet académique & Équipe */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#E9C46A]">
              Projet Académique
            </h4>
            <div className="space-y-2 text-xs text-[#A7C4B5]">
              <p className="font-semibold text-white">Master 1 Informatique (2026–2027)</p>
              <p className="text-[11px] text-[#C1DBCF]">Groupe 02 :</p>
              <ul className="space-y-1 pl-2">
                <li>• Kabongo Mukola Nathan <span className="text-[10px] text-[#E9C46A]">(Frontend & Web3)</span></li>
                <li>• Losongo Kingombe Victor <span className="text-[10px] text-[#E9C46A]">(Smart Contracts)</span></li>
                <li>• Tuasansilu Lufuma Benie <span className="text-[10px] text-[#E9C46A]">(Backend & IPFS)</span></li>
              </ul>
            </div>
          </div>

          {/* Infrastructure Web3 */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#E9C46A]">
              Infrastructure On-Chain
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://amoy.polygonscan.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 transition-colors hover:text-[#E9C46A]"
                >
                  Polygon Amoy (Chain ID 80002) <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <span className="text-[#A7C4B5] block">Jeton de démonstration :</span>
                <span className="font-semibold text-white">STT (Senda Test Token)</span>
              </li>
              <li>
                <span className="text-[#A7C4B5] block">Stockage Décentralisé :</span>
                <span className="font-semibold text-white">IPFS via Pinata Gateway</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[#1B4332] pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-[#7B9E8D] gap-4">
          <p>
            © {new Date().getFullYear()} SENDA — L&apos;artisanat congolais, authentifié et valorisé.
          </p>
          <p className="text-[11px]">
            Plateforme conforme aux spécifications du document directeur PLANSENDA.pdf
          </p>
        </div>
      </div>
    </footer>
  );
}
