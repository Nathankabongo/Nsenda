import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Award, Compass, MapPin } from "lucide-react";

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
              Chaque création physique est enregistrée avec un certificat d&apos;authenticité numérique,
              protégée par un protocole de paiement sous séquestre conditionnel et conservée de façon permanente.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#E8F0EC]">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#1B4332] px-3 py-1.5 border border-[#2D6A4F]">
                <Lock className="h-3.5 w-3.5 text-[#E9C46A]" /> Séquestre Garanti
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#1B4332] px-3 py-1.5 border border-[#2D6A4F]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A]" /> Certification d&apos;Ateliers
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#1B4332] px-3 py-1.5 border border-[#2D6A4F]">
                <Award className="h-3.5 w-3.5 text-[#C86D3B]" /> Rémunération Équitable des Artisans
              </span>
            </div>
          </div>

          {/* Catégories d'Artisanat */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#E9C46A]">
              Collections & Artisanat
            </h4>
            <ul className="space-y-2 text-xs text-[#A7C4B5]">
              <li>
                <Link href="/#catalogue" className="hover:text-white transition-colors">
                  Masques traditionnels (Pende, Kuba)
                </Link>
              </li>
              <li>
                <Link href="/#catalogue" className="hover:text-white transition-colors">
                  Statuettes & Sculptures (Tshokwe, Luba)
                </Link>
              </li>
              <li>
                <Link href="/#catalogue" className="hover:text-white transition-colors">
                  Textiles & Velours Shoowa
                </Link>
              </li>
              <li>
                <Link href="/#catalogue" className="hover:text-white transition-colors">
                  Vannerie & Céramiques du Kwilu
                </Link>
              </li>
              <li>
                <Link href="/#catalogue" className="hover:text-white transition-colors">
                  Bijoux & Pectoraux en Malachite
                </Link>
              </li>
            </ul>
          </div>

          {/* Engagements & Confiance */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#E9C46A]">
              Garanties & Confiance
            </h4>
            <ul className="space-y-2 text-xs text-[#A7C4B5]">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A] shrink-0" />
                <span>Audit sur site des ateliers</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-[#E9C46A] shrink-0" />
                <span>Fonds bloqués jusqu&apos;à réception</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-[#C86D3B] shrink-0" />
                <span>Redevances reversées aux créateurs</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#E9C46A] shrink-0" />
                <span>Traçabilité des provinces de RDC</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[#1B4332] pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-[#7B9E8D] gap-4">
          <p>
            © {new Date().getFullYear()} SENDA — L&apos;artisanat congolais, authentifié et valorisé. Tous droits réservés.
          </p>
          <p className="text-[11px] text-[#A7C4B5]">
            Kinshasa • Kwilu • Kasaï • Katanga • Kongo Central
          </p>
        </div>
      </div>
    </footer>
  );
}
