"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";

export type AppRole = "VISITOR" | "ARTISAN" | "BUYER" | "ADMIN";

interface RoleGuardProps {
  allowedRoles: AppRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectOnDeny?: boolean;
  showDeniedScreen?: boolean;
}

export function RoleGuard({
  allowedRoles,
  children,
  fallback = null,
  redirectOnDeny = false,
  showDeniedScreen = false,
}: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const currentRole: AppRole = user ? user.role : "VISITOR";
  const isAllowed = allowedRoles.includes(currentRole);

  useEffect(() => {
    if (!isLoading && redirectOnDeny && !isAllowed) {
      router.replace("/");
    }
  }, [isLoading, isAllowed, redirectOnDeny, router]);

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1B4332] border-t-transparent" />
          <p className="text-xs font-semibold text-[#6B5E55]">Vérification des droits d&apos;accès...</p>
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    if (showDeniedScreen) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 text-[#2D231E]">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8E1D5] p-8 text-center shadow-lg space-y-5 animate-in fade-in">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-serif text-2xl font-bold text-[#1B4332]">Accès Non Autorisé</h2>
              <p className="text-xs text-[#6B5E55] leading-relaxed">
                Cette page est exclusivement réservée aux profils :{" "}
                <strong className="text-[#1B4332]">{allowedRoles.join(", ")}</strong>.
                {user ? (
                  <span> Votre compte actuel a le profil <strong>{user.role}</strong>.</span>
                ) : (
                  <span> Vous n&apos;êtes pas actuellement connecté.</span>
                )}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1B4332] py-3 text-xs font-bold text-[#E9C46A] hover:bg-[#143427] shadow-sm transition-all"
              >
                <span>Retourner à mon tableau de bord</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
