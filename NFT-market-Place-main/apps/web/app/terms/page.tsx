"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Award,
  Cpu,
  ArrowLeft,
  CheckCircle2,
  FileText,
  AlertCircle,
} from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8F5F0] py-12 px-4 sm:px-6 lg:px-8 text-[#2D231E]">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Navigation retour */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#1B4332] hover:text-[#C86D3B] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour à l&apos;accueil</span>
        </Link>

        {/* En-tête */}
        <div id="a-propos" className="scroll-mt-24 rounded-3xl border border-[#E8E1D5] bg-white p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B4332] text-[#E9C46A]">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-black text-[#1B4332]">
                Politique d&apos;Usage, Charte Éthique & FAQ
              </h1>
              <p className="text-xs text-[#8C7A6B]">
                Plateforme SENDA • Université de Kinshasa (UNIKIN) • Version certifiée 2026
              </p>
            </div>
          </div>
          <p className="text-xs text-[#6B5E55] leading-relaxed">
            La présente politique définit les règles simples et transparentes d&apos;utilisation de la plateforme décentralisée SENDA, conçue pour valoriser et protéger le patrimoine artisanal de la République Démocratique du Congo.
          </p>
        </div>

        {/* 5 Principes Clairs */}
        <div className="space-y-6">
          {/* 1. Cadre Réglementaire & Réseau de Test */}
          <div id="tracabilite" className="scroll-mt-24 rounded-3xl border border-[#E8E1D5] bg-white p-7 shadow-sm space-y-3">
            <div className="flex items-center gap-3 font-bold text-[#1B4332] text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B4332] text-white text-xs">1</span>
              <span>Cadre Technique, Traçabilité & Jetons de Démonstration</span>
            </div>
            <p className="text-xs text-[#6B5E55] leading-relaxed">
              SENDA est une plateforme décentralisée d&apos;artisanat d&apos;art congolais déployée sur le réseau de test public <strong>Polygon Amoy</strong>. Chaque œuvre est géolocalisée et rattachée à sa province d&apos;origine culturelle (Kinshasa, Kwilu, Kasaï, Katanga, Kongo Central).
            </p>
            <div className="rounded-xl bg-[#FAF7F2] p-3 text-[11px] text-[#4A3B33] border border-[#E8E1D5] flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0" />
              <span>
                Le jeton utilisé (<strong>STT — Senda Test Token</strong>) est un jeton de test strictement sans valeur marchande. Aucune levée de fonds ni spéculation n&apos;est autorisée.
              </span>
            </div>
          </div>

          {/* 2. Redevances & Droits des Artisans */}
          <div id="redevances" className="scroll-mt-24 rounded-3xl border border-[#E8E1D5] bg-white p-7 shadow-sm space-y-3">
            <div className="flex items-center gap-3 font-bold text-[#1B4332] text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B4332] text-white text-xs">2</span>
              <span>Protection du Patrimoine & Redevances des Artisans (ERC-2981)</span>
            </div>
            <p className="text-xs text-[#6B5E55] leading-relaxed">
              Chaque œuvre physique enregistrée donne lieu à l&apos;émission d&apos;un certificat numérique d&apos;authenticité NFT (ERC-721).
            </p>
            <ul className="text-xs text-[#6B5E55] space-y-1.5 list-disc pl-5">
              <li>L&apos;artisan créateur conserve l&apos;entièreté de sa paternité artistique et morale.</li>
              <li>Un droit de suite perpétuel de <strong>5% à 10% (standard ERC-2981)</strong> est automatiquement reversé au maître artisan créateur sur chaque revente ultérieure.</li>
            </ul>
          </div>

          {/* 3. Séquestre Physique */}
          <div id="sequestre" className="scroll-mt-24 rounded-3xl border border-[#E8E1D5] bg-white p-7 shadow-sm space-y-3">
            <div className="flex items-center gap-3 font-bold text-[#1B4332] text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B4332] text-white text-xs">3</span>
              <span>Paiement Sécurisé sous Séquestre Conditionnel (`SendaEscrow`)</span>
            </div>
            <p className="text-xs text-[#6B5E55] leading-relaxed">
              Pour éliminer les risques d&apos;arnaque lors de commandes d&apos;œuvres physiques :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-[#FAF7F2] p-3.5 border border-[#E8E1D5] space-y-1">
                <span className="font-bold text-[#1B4332] block">Protection Acheteur</span>
                <span className="text-[#6B5E55] text-[11px]">
                  Les fonds sont consignés dans le contrat intelligent et ne sont débloqués que lorsque l&apos;acheteur confirme la bonne réception physique du colis.
                </span>
              </div>
              <div className="rounded-xl bg-[#FAF7F2] p-3.5 border border-[#E8E1D5] space-y-1">
                <span className="font-bold text-[#1B4332] block">Garantie Vendeur</span>
                <span className="text-[#6B5E55] text-[11px]">
                  L&apos;artisan expédie l&apos;œuvre en sachant que les fonds sont irrévocablement verrouillés sur la blockchain.
                </span>
              </div>
            </div>
          </div>

          {/* 4. Rôle de l'IA & Audit des ateliers */}
          <div id="audit" className="scroll-mt-24 rounded-3xl border border-[#E8E1D5] bg-white p-7 shadow-sm space-y-3">
            <div className="flex items-center gap-3 font-bold text-[#1B4332] text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B4332] text-white text-xs">4</span>
              <span>Audit Terrain des Ateliers & Assistance IA (SendaVision)</span>
            </div>
            <p className="text-xs text-[#6B5E55] leading-relaxed">
              Le module d&apos;intelligence artificielle (réseau de neurones convolutif MobileNetV3) est un <strong>outil d&apos;assistance à l&apos;authentification</strong>.
            </p>
            <ul className="text-xs text-[#6B5E55] space-y-1.5 list-disc pl-5">
              <li>Il évalue la conformité des matières déclarées (bois nobles, raphia, kaolin vs plastiques industriels).</li>
              <li>L&apos;IA ne remplace pas l&apos;humain : la certification définitive d&apos;un atelier exige toujours un audit physique sur le terrain validé avec motif écrit par les modérateurs.</li>
              <li>L&apos;attestation d&apos;analyse est scellée sous forme d&apos;empreinte cryptographique SHA-256 dans les métadonnées IPFS du NFT.</li>
            </ul>
          </div>

          {/* 5. Données Personnelles & Confidentialité */}
          <div id="confidentialite" className="scroll-mt-24 rounded-3xl border border-[#E8E1D5] bg-white p-7 shadow-sm space-y-3">
            <div className="flex items-center gap-3 font-bold text-[#1B4332] text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B4332] text-white text-xs">5</span>
              <span>Confidentialité et Zéro Donnée Personnelle On-Chain</span>
            </div>
            <p className="text-xs text-[#6B5E55] leading-relaxed">
              Conformément aux exigences de sécurité et de respect de la vie privée du cours de Blockchain :
            </p>
            <div className="rounded-xl bg-[#E8F0EC] p-3 text-[11px] text-[#1B4332] border border-[#C1DBCF] space-y-1">
              <span className="font-bold block">Principe de Minimis Blockchain :</span>
              <span>
                <strong>Aucune donnée personnelle en clair (nom de famille civil, coordonnées téléphoniques, adresse physique privée) n&apos;est inscrite sur la blockchain.</strong> Seuls les pseudonymes d&apos;atelier et les adresses publiques cryptographiques de portefeuille sont utilisés.
              </span>
            </div>
          </div>

          {/* 6. Foire Aux Questions (FAQ) */}
          <div id="faq" className="scroll-mt-24 rounded-3xl border border-[#E8E1D5] bg-white p-7 shadow-sm space-y-3">
            <div className="flex items-center gap-3 font-bold text-[#1B4332] text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B4332] text-white text-xs">6</span>
              <span>Foire Aux Questions (FAQ)</span>
            </div>
            <div className="space-y-3 text-xs text-[#6B5E55]">
              <div className="border-b border-[#E8E1D5] pb-2">
                <p className="font-bold text-[#1B4332]">Comment puis-je vérifier un certificat NFT ?</p>
                <p className="mt-1">Chaque pièce est gravée d&apos;un identifiant unique (Token ID). Vous pouvez accéder à la fiche publique de l&apos;œuvre sur SENDA ou examiner le contrat sur Polygonscan Amoy.</p>
              </div>
              <div className="border-b border-[#E8E1D5] pb-2">
                <p className="font-bold text-[#1B4332]">Quand l&apos;artisan reçoit-il ses fonds ?</p>
                <p className="mt-1">Dès que l&apos;acheteur confirme la réception de la création physique via son interface d&apos;achat, le contrat SendaEscrow débloque automatiquement les fonds vers le portefeuille de l&apos;artisan.</p>
              </div>
              <div>
                <p className="font-bold text-[#1B4332]">Qui peut devenir artisan partenaire ?</p>
                <p className="mt-1">Tout maître artisan ou atelier coopératif basé en RDC (Kinshasa, Kwilu, Kasaï, Katanga, Kongo Central) après audit et certification par nos correspondants culturels.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info SENDA */}
        <div className="text-center text-xs text-[#8C7A6B] pt-4">
          Plateforme SENDA • Marché Décentralisé d&apos;Artisanat Congolais • Kinshasa 2026
        </div>
      </div>
    </div>
  );
}
