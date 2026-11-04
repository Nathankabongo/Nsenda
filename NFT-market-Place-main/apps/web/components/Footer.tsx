"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lock,
  ShieldCheck,
  Award,
  ChevronDown,
  Globe,
  ExternalLink,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { FOOTER_CONFIG, TrustBadgeItem, FooterColumnSection } from "./footer.data";

/**
 * Icônes Réseaux Sociaux (SVG optimisés, accessibles WCAG 2.1 AA)
 */
function SocialIcon({ platform }: { platform: string }) {
  switch (platform) {
    case "X":
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "Instagram":
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );
    case "Discord":
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      );
    case "GitHub":
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      );
    case "LinkedIn":
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * Rendu de l'icône du badge de confiance
 */
function TrustBadgeIcon({
  iconName,
  accentColor,
}: {
  iconName: TrustBadgeItem["iconName"];
  accentColor: TrustBadgeItem["accentColor"];
}) {
  const colorMap = {
    gold: "text-[#E9C46A] bg-[#E9C46A]/10 border-[#E9C46A]/30",
    green: "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30",
    ochre: "text-[#C86D3B] bg-[#C86D3B]/10 border-[#C86D3B]/30",
  };

  const selectedStyle = colorMap[accentColor];

  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${selectedStyle} shadow-sm transition-transform duration-200 group-hover:scale-105`}
      aria-hidden="true"
    >
      {iconName === "lock" && <Lock className="h-5 w-5" />}
      {iconName === "shield" && <ShieldCheck className="h-5 w-5" />}
      {iconName === "award" && <Award className="h-5 w-5" />}
    </div>
  );
}

/**
 * Composant de Colonne avec support Accordéon accessible sur mobile (<640px)
 */
function AccordionColumn({
  section,
  isOpen,
  onToggle,
}: {
  section: FooterColumnSection;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentId = `footer-accordion-${section.id}`;
  const buttonId = `footer-btn-${section.id}`;

  return (
    <nav
      aria-label={section.navAriaLabel}
      className="border-b border-[#1B4332]/40 pb-4 sm:border-b-0 sm:pb-0"
    >
      {/* En-tête mobile (bouton accordéon accessible) */}
      <div className="sm:hidden">
        <button
          id={buttonId}
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={contentId}
          className="flex w-full min-h-[44px] items-center justify-between py-2 text-left text-xs font-semibold uppercase tracking-wider text-[#E9C46A] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E9C46A] rounded"
        >
          <span className="font-serif text-sm tracking-wider">{section.title}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-[#E9C46A] transition-transform duration-200 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* En-tête Desktop & Tablette (titre hiérarchique h3) */}
      <h3 className="hidden sm:block font-serif text-xs font-semibold uppercase tracking-wider text-[#E9C46A] mb-4">
        {section.title}
      </h3>

      {/* Liste des liens avec gestion de l'état mobile et affichage continu desktop */}
      <ul
        id={contentId}
        aria-labelledby={buttonId}
        className={`space-y-2.5 pt-2 sm:pt-0 ${isOpen ? "block" : "hidden sm:block"}`}
      >
        {section.links.map((link) => {
          const isExternal = link.href.startsWith("http") || link.href.startsWith("mailto:");

          return (
            <li key={link.label}>
              {isExternal ? (
                <a
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group inline-flex items-center gap-1.5 py-1 text-sm text-[#C1DBCF] leading-relaxed transition-colors duration-200 hover:text-[#E9C46A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E9C46A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#081C15] rounded"
                  aria-label={link.ariaLabel || link.label}
                >
                  <span className="group-hover:underline underline-offset-4">
                    {link.label}
                  </span>
                  {link.href.startsWith("http") && (
                    <ExternalLink
                      className="h-3 w-3 shrink-0 opacity-70 transition-opacity group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  )}
                </a>
              ) : (
                <Link
                  href={link.href}
                  className="group inline-flex items-center gap-2 py-1 text-sm text-[#C1DBCF] leading-relaxed transition-colors duration-200 hover:text-[#E9C46A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E9C46A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#081C15] rounded"
                  aria-label={link.ariaLabel || link.label}
                >
                  <span className="group-hover:underline underline-offset-4">
                    {link.label}
                  </span>
                  {link.badge && (
                    <span className="rounded-full bg-[#C86D3B]/20 border border-[#C86D3B]/50 px-2 py-0.5 text-[10px] font-semibold text-[#E9C46A]">
                      {link.badge}
                    </span>
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Pied de Page Principal — SENDA Marketplace
 * Conforme WCAG 2.1 AA • Mobile-first • Grille 12 colonnes
 */
export function Footer() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    collections: false,
    confiance: false,
    "aide-legal": false,
  });

  const [activeLang, setActiveLang] = useState<"FR" | "EN">("FR");

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const { brand, trustBadges, columns, provinces, blockchain, copyright } = FOOTER_CONFIG;

  return (
    <footer
      role="contentinfo"
      aria-label="Pied de page SENDA"
      className="mt-20 border-t border-[#1B4332]/80 bg-[#081C15] text-[#C1DBCF] py-10 sm:py-16 lg:py-20"
    >
      {/* Conteneur fluide standard 1200px max */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ============================================================ */}
        {/* BANDEAU SUPÉRIEUR : SIGNAUX DE CONFIANCE (3 badges séparés) */}
        {/* ============================================================ */}
        <section
          aria-label="Engagements et garanties de sécurité SENDA"
          className="pb-10 sm:pb-12 border-b border-[#1B4332]/60"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-6 lg:gap-8">
            {trustBadges.map((badge) => (
              <div
                key={badge.id}
                className="group flex items-center gap-4 rounded-2xl bg-[#0B251B]/80 p-4 sm:p-5 border border-[#1B4332]/80 shadow-sm transition-all duration-200 hover:border-[#2D6A4F] hover:bg-[#0F2E22]"
              >
                <TrustBadgeIcon
                  iconName={badge.iconName}
                  accentColor={badge.accentColor}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-white tracking-wide">
                    {badge.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-[#A7C4B5] leading-snug">
                    {badge.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* CORPS PRINCIPAL : GRILLE 12 COLONNES (4 colonnes desktop)   */}
        {/* 1. Marque (4 col.)                                          */}
        {/* 2. Collections (2 col.)                                      */}
        {/* 3. Confiance & Garanties (3 col.)                           */}
        {/* 4. Aide & Légal (3 col.)                                     */}
        {/* ============================================================ */}
        <div className="pt-10 sm:pt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">
          
          {/* Colonne 1 : MARQUE (4 colonnes sur desktop, pleine largeur tablette) */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-4 lg:pr-6">
            {/* Logo SENDA */}
            <Link
              href="/"
              className="inline-flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E9C46A] rounded-lg"
              aria-label="Accueil SENDA"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9C46A] text-[#1B4332] shadow-md transition-transform duration-200 group-hover:scale-105"
                aria-hidden="true"
              >
                <span className="font-serif text-xl font-black">{brand.logoBadge}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-widest text-white leading-none">
                  {brand.name}
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-[#E9C46A] mt-1">
                  {brand.tagline}
                </span>
              </div>
            </Link>

            {/* Description courte (2 lignes max) */}
            <p className="text-sm leading-relaxed text-[#A7C4B5] max-w-md">
              {brand.shortDescription}
            </p>

            {/* Réseaux Sociaux avec labels accessibles WCAG */}
            <div className="pt-1">
              <span className="sr-only">Réseaux sociaux officiels</span>
              <div className="flex items-center gap-2">
                {brand.socialLinks.map((social) => (
                  <a
                    key={social.platform}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.ariaLabel}
                    className="flex h-10 w-10 min-w-[40px] items-center justify-center rounded-xl bg-[#0F2E22] border border-[#1B4332] text-[#C1DBCF] transition-all duration-200 hover:bg-[#143D2D] hover:border-[#E9C46A] hover:text-[#E9C46A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E9C46A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#081C15]"
                  >
                    <SocialIcon platform={social.platform} />
                  </a>
                ))}
              </div>
            </div>

            {/* Signal Blockchain Amoy discret */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 rounded-lg bg-[#0B251B] px-3 py-1.5 border border-[#1B4332] text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[#8FAF9E] text-[11px]">
                  Réseau :{" "}
                  <a
                    href={blockchain.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E9C46A] font-medium hover:underline inline-flex items-center gap-1"
                    title="Consulter le contrat officiel sur Polygonscan Amoy"
                  >
                    {blockchain.networkName}
                    <ExternalLink className="h-2.5 w-2.5 opacity-70" aria-hidden="true" />
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* Colonne 2 : COLLECTIONS (2 colonnes sur desktop) */}
          <div className="sm:col-span-1 lg:col-span-2">
            <AccordionColumn
              section={columns.collections}
              isOpen={openSections.collections}
              onToggle={() => toggleSection("collections")}
            />
          </div>

          {/* Colonne 3 : CONFIANCE & GARANTIES (3 colonnes sur desktop) */}
          <div className="sm:col-span-1 lg:col-span-3">
            <AccordionColumn
              section={columns.trustAndGuarantees}
              isOpen={openSections.confiance}
              onToggle={() => toggleSection("confiance")}
            />
          </div>

          {/* Colonne 4 : AIDE & LÉGAL (3 colonnes sur desktop) */}
          <div className="sm:col-span-2 lg:col-span-3">
            <AccordionColumn
              section={columns.helpAndLegal}
              isOpen={openSections["aide-legal"]}
              onToggle={() => toggleSection("aide-legal")}
            />
          </div>
        </div>

        {/* ============================================================ */}
        {/* BANDE INFÉRIEURE : COPYRIGHT, PROVINCES & SÉLECTEUR LANGUE   */}
        {/* ============================================================ */}
        <div className="mt-12 sm:mt-16 border-t border-[#1B4332]/60 pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-xs text-[#8FAF9E]">
            
            {/* Gauche : Copyright */}
            <div className="order-2 md:order-1">
              <p className="leading-relaxed">
                {copyright.text}
              </p>
            </div>

            {/* Centre / Droite : Tags des provinces d'origine */}
            <div className="order-1 md:order-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-[#A7C4B5] font-medium mr-1 hidden sm:inline">
                Provinces d’origine :
              </span>
              {provinces.map((prov) => (
                <span
                  key={prov}
                  className="inline-flex items-center rounded-md bg-[#0F2E22] px-2 py-0.5 text-[11px] font-medium text-[#C1DBCF] border border-[#1B4332]"
                >
                  {prov}
                </span>
              ))}
            </div>

            {/* Droite : Sélecteur de langue discret */}
            <div className="order-3 flex items-center gap-2">
              <div
                role="group"
                aria-label="Choix de la langue d’affichage"
                className="inline-flex items-center rounded-lg bg-[#0B251B] p-0.5 border border-[#1B4332]"
              >
                <Globe className="h-3.5 w-3.5 text-[#E9C46A] ml-2 mr-1" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => setActiveLang("FR")}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors duration-150 ${
                    activeLang === "FR"
                      ? "bg-[#1B4332] text-[#E9C46A] shadow-sm"
                      : "text-[#8FAF9E] hover:text-white"
                  }`}
                  aria-pressed={activeLang === "FR"}
                  aria-label="Afficher en français"
                >
                  FR
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLang("EN")}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors duration-150 ${
                    activeLang === "EN"
                      ? "bg-[#1B4332] text-[#E9C46A] shadow-sm"
                      : "text-[#8FAF9E] hover:text-white"
                  }`}
                  aria-pressed={activeLang === "EN"}
                  aria-label="Display in English"
                >
                  EN
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </footer>
  );
}
