"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, UserCheck, Palette, ShoppingBag, ArrowRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    const success = await login(email, password);
    setSubmitting(false);

    if (success) {
      router.push("/");
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#F8F5F0]">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl border border-[#E8E1D5] shadow-xl">
        {/* En-tête */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1B4332] text-[#E9C46A] shadow-md mb-2">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[#1B4332]">
            Connexion à SENDA
          </h2>
          <p className="text-xs text-[#6B5A4E]">
            Accédez à votre espace sécurisé d&apos;artisanat congolais authentifié
          </p>
        </div>

        {/* Boutons de démonstration rapide pour le jury académique */}
        <div className="rounded-2xl border border-[#EAE3D6] bg-[#FAF8F5] p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B]">
              Comptes de test (Jury UNIKIN)
            </span>
            <span className="text-[10px] text-[#C86D3B] font-semibold">1-clic pré-remplissage</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@senda.cd", "SendaAdmin2026!")}
              className="flex flex-col items-center gap-1 rounded-xl border border-[#E8E1D5] bg-white p-2 text-center hover:border-[#1B4332] hover:bg-[#1B4332]/5 transition-all group"
            >
              <UserCheck className="h-4 w-4 text-[#1B4332] group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-[#1B4332]">Admin</span>
              <span className="text-[8px] text-[#8C7A6B]">Modération</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("mukendi@artisanat.cd", "Artisan2026!")}
              className="flex flex-col items-center gap-1 rounded-xl border border-[#E8E1D5] bg-white p-2 text-center hover:border-[#C86D3B] hover:bg-[#C86D3B]/5 transition-all group"
            >
              <Palette className="h-4 w-4 text-[#C86D3B] group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-[#C86D3B]">Artisan</span>
              <span className="text-[8px] text-[#8C7A6B]">Certifié Kwilu</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("acheteur@senda.cd", "Acheteur2026!")}
              className="flex flex-col items-center gap-1 rounded-xl border border-[#E8E1D5] bg-white p-2 text-center hover:border-[#2A9D8F] hover:bg-[#2A9D8F]/5 transition-all group"
            >
              <ShoppingBag className="h-4 w-4 text-[#2A9D8F] group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-[#2A9D8F]">Acheteur</span>
              <span className="text-[8px] text-[#8C7A6B]">Collectionneur</span>
            </button>
          </div>
        </div>

        {/* Formulaire de connexion */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="nom@exemple.cd"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-[#E8E1D5] bg-[#FAF8F5] pl-10 pr-4 py-2.5 text-xs text-[#2D231E] placeholder:text-[#8C7A6B] focus:border-[#1B4332] focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#1B4332] py-3 text-xs font-bold text-[#E9C46A] shadow-md hover:bg-[#143427] active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <span>{submitting ? "Connexion en cours..." : "Se connecter"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Pied de carte */}
        <div className="text-center pt-2 border-t border-[#EAE3D6]">
          <p className="text-xs text-[#6B5A4E]">
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="font-bold text-[#C86D3B] hover:text-[#B05B2D] hover:underline"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
