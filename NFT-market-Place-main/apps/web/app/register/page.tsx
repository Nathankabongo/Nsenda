"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Palette, ShoppingBag, ArrowRight, Lock, Mail, User, MapPin } from "lucide-react";

const PROVINCES_RDC = [
  "Kinshasa",
  "Kwilu",
  "Grand Kasaï (Kasaï / Kasaï-Oriental / Kasaï-Central)",
  "Haut-Katanga",
  "Kongo Central",
  "Sankuru",
  "Tanganyika",
  "Haut-Uele",
  "Nord-Kivu",
  "Sud-Kivu",
  "Équateur",
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [role, setRole] = useState<"BUYER" | "ARTISAN">("BUYER");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workshopName, setWorkshopName] = useState("");
  const [province, setProvince] = useState("Kinshasa");
  const [bio, setBio] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) return;

    setSubmitting(true);
    const success = await register({
      email,
      password,
      displayName,
      role,
      workshopName: role === "ARTISAN" ? workshopName : undefined,
      province: role === "ARTISAN" ? province : undefined,
      bio: role === "ARTISAN" ? bio : undefined,
    });
    setSubmitting(false);

    if (success) {
      router.push("/");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#F8F5F0]">
      <div className="w-full max-w-lg space-y-8 bg-white p-8 rounded-3xl border border-[#E8E1D5] shadow-xl">
        {/* En-tête */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1B4332] text-[#E9C46A] shadow-md mb-2">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[#1B4332]">
            Rejoindre le Réseau SENDA
          </h2>
          <p className="text-xs text-[#6B5A4E]">
            L&apos;artisanat congolais, authentifié par NFT et valorisé sous séquestre
          </p>
        </div>

        {/* Sélection du Rôle */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("BUYER")}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all ${
              role === "BUYER"
                ? "border-[#1B4332] bg-[#1B4332]/5 text-[#1B4332] ring-2 ring-[#1B4332]/20"
                : "border-[#E8E1D5] bg-[#FAF8F5] text-[#6B5A4E] hover:border-[#1B4332]/40"
            }`}
          >
            <ShoppingBag className={`h-6 w-6 ${role === "BUYER" ? "text-[#1B4332]" : "text-[#8C7A6B]"}`} />
            <div>
              <p className="text-xs font-bold">Acheteur / Collectionneur</p>
              <p className="text-[10px] text-[#8C7A6B] mt-0.5">Découvrir et acquérir sous séquestre</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRole("ARTISAN")}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all ${
              role === "ARTISAN"
                ? "border-[#C86D3B] bg-[#C86D3B]/5 text-[#C86D3B] ring-2 ring-[#C86D3B]/20"
                : "border-[#E8E1D5] bg-[#FAF8F5] text-[#6B5A4E] hover:border-[#C86D3B]/40"
            }`}
          >
            <Palette className={`h-6 w-6 ${role === "ARTISAN" ? "text-[#C86D3B]" : "text-[#8C7A6B]"}`} />
            <div>
              <p className="text-xs font-bold">Maître Artisan Créateur</p>
              <p className="text-[10px] text-[#8C7A6B] mt-0.5">Certifier ses œuvres & percevoir royalties</p>
            </div>
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2D231E] mb-1.5">
              {role === "ARTISAN" ? "Nom de l'artisan ou responsable" : "Nom complet"}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-[#8C7A6B]" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={role === "ARTISAN" ? "Ex: Maître Mukendi Kalonji" : "Ex: Jean-Luc Lumumba"}
                className="w-full rounded-xl border border-[#E8E1D5] bg-[#FAF8F5] pl-10 pr-4 py-2.5 text-xs text-[#2D231E] placeholder:text-[#8C7A6B] focus:border-[#1B4332] focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D231E] mb-1.5">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#8C7A6B]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="artisan@senda.cd"
                className="w-full rounded-xl border border-[#E8E1D5] bg-[#FAF8F5] pl-10 pr-4 py-2.5 text-xs text-[#2D231E] placeholder:text-[#8C7A6B] focus:border-[#1B4332] focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D231E] mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#8C7A6B]" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
                className="w-full rounded-xl border border-[#E8E1D5] bg-[#FAF8F5] pl-10 pr-4 py-2.5 text-xs text-[#2D231E] placeholder:text-[#8C7A6B] focus:border-[#1B4332] focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Champs additionnels pour les artisans */}
          {role === "ARTISAN" && (
            <div className="space-y-4 pt-2 border-t border-[#EAE3D6]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C86D3B]">
                  Renseignements de l&apos;Atelier Congolais
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D231E] mb-1.5">
                  Nom commercial de l&apos;atelier
                </label>
                <input
                  type="text"
                  required
                  value={workshopName}
                  onChange={(e) => setWorkshopName(e.target.value)}
                  placeholder="Ex: Atelier Royal du Kwilu"
                  className="w-full rounded-xl border border-[#E8E1D5] bg-[#FAF8F5] px-4 py-2.5 text-xs text-[#2D231E] placeholder:text-[#8C7A6B] focus:border-[#C86D3B] focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D231E] mb-1.5">
                  Province d&apos;origine en RDC
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-[#8C7A6B]" />
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full rounded-xl border border-[#E8E1D5] bg-[#FAF8F5] pl-10 pr-4 py-2.5 text-xs text-[#2D231E] focus:border-[#C86D3B] focus:bg-white focus:outline-none transition-colors"
                  >
                    {PROVINCES_RDC.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D231E] mb-1.5">
                  Présentation des techniques artisanales
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ex: Sculpture sur bois précieux, perlage cérémoniel Kuba, extraction et taille de malachite..."
                  className="w-full rounded-xl border border-[#E8E1D5] bg-[#FAF8F5] p-3 text-xs text-[#2D231E] placeholder:text-[#8C7A6B] focus:border-[#C86D3B] focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div className="rounded-xl bg-[#FAF8F5] p-3 border border-[#EAE3D6] text-[11px] text-[#6B5A4E]">
            💡 <strong className="text-[#1B4332]">Preuve de détention Web3 :</strong> Vous pourrez lier votre portefeuille MetaMask après création de votre compte en signant un message cryptographique sécurisé.
          </div>

          <button
            type="submit"
            disabled={submitting || isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#1B4332] py-3 text-xs font-bold text-[#E9C46A] shadow-md hover:bg-[#143427] active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <span>{submitting ? "Création du compte..." : "Créer mon compte SENDA"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Pied de carte */}
        <div className="text-center pt-2 border-t border-[#EAE3D6]">
          <p className="text-xs text-[#6B5A4E]">
            Déjà inscrit sur SENDA ?{" "}
            <Link
              href="/login"
              className="font-bold text-[#1B4332] hover:text-[#143427] hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
