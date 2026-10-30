"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Building2,
  MapPin,
  ExternalLink,
  Coins,
  Package,
  Users,
  Search,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface VerificationDossier {
  id: string;
  userId: string;
  artisanName: string;
  workshopName: string;
  province: string;
  walletAddress: string;
  bio: string;
  portfolioLinks: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  submittedAt: string;
}

interface EscrowOrder {
  id: string;
  orderIdHex: string;
  artworkId: string;
  buyer: string;
  seller: string;
  amount: string;
  tokenSymbol: string;
  status: string;
  depositTxHash?: string;
  releaseTxHash?: string;
  createdAt: string;
}

export default function AdminPage() {
  const { user, token } = useAuth();
  const [dossiers, setDossiers] = useState<VerificationDossier[]>([]);
  const [orders, setOrders] = useState<EscrowOrder[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal de décision avec motif écrit
  const [selectedDossier, setSelectedDossier] = useState<VerificationDossier | null>(null);
  const [decisionType, setDecisionType] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [rationale, setRationale] = useState("");
  const [actionInProgress, setActionInProgress] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  useEffect(() => {
    if (user?.role === "ADMIN" && token) {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [verifRes, ordersRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/admin/verifications`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const verifData = await verifRes.json();
      const ordersData = await ordersRes.json();
      const statsData = await statsRes.json();

      if (verifData.success) setDossiers(verifData.data.dossiers);
      if (ordersData.success) setOrders(ordersData.data.orders);
      if (statsData.success) setStats(statsData.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des données admin :", err);
      toast.error("Impossible de charger les données du panneau d'administration.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (dossier: VerificationDossier, type: "APPROVE" | "REJECT") => {
    setSelectedDossier(dossier);
    setDecisionType(type);
    setRationale(
      type === "APPROVE"
        ? "Atelier artisanal visité et contrôlé. Authenticité des techniques et localisation provinciale vérifiées."
        : ""
    );
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDossier || !token) return;

    if (!rationale || rationale.trim().length < 5) {
      toast.error("Un motif écrit détaillé est obligatoire (au moins 5 caractères).");
      return;
    }

    try {
      setActionInProgress(true);
      const res = await fetch(`${API_URL}/admin/verifications/${selectedDossier.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          decision: decisionType,
          rationale,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message || "Échec de l'enregistrement de la décision.");
        return;
      }

      toast.success(
        decisionType === "APPROVE"
          ? "Artisan certifié avec succès !"
          : "Dossier rejeté avec notification écrite."
      );

      setSelectedDossier(null);
      setRationale("");
      fetchAdminData();
    } catch (err) {
      toast.error("Erreur lors de la transmission de la décision.");
    } finally {
      setActionInProgress(false);
    }
  };

  // Si l'utilisateur n'est pas connecté en tant qu'administrateur
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#F8F5F0]">
        <div className="max-w-md w-full rounded-3xl bg-white p-8 text-center border border-[#E8E1D5] shadow-xl space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1B4332]">Accès Administrateur Restreint</h2>
            <p className="text-xs text-[#6B5A4E] mt-2">
              Cet espace de modération et de certification est strictement réservé au corps académique et aux vérificateurs de SENDA.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B4332] px-6 py-2.5 text-xs font-bold text-[#E9C46A] shadow-md hover:bg-[#143427] transition-all"
            >
              <span>Se connecter comme Administrateur</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Titre & Statut */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E1D5] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#1B4332]/10 px-3 py-1 text-xs font-bold text-[#1B4332] mb-2 border border-[#1B4332]/20">
              <Sparkles className="h-3 w-3 text-[#C86D3B]" />
              <span>UNIKIN Master 1 • Faculté des Sciences & Technologies</span>
            </div>
            <h1 className="font-serif text-3xl font-extrabold text-[#1B4332]">
              Espace de Modération & Certification
            </h1>
            <p className="text-xs text-[#6B5A4E] mt-1">
              Contrôle d&apos;authenticité des artisans congolais, traçabilité et supervision du séquestre physique.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-[#E8E1D5] bg-white px-4 py-2 shadow-xs">
              <p className="text-[10px] text-[#8C7A6B] font-bold uppercase tracking-wider">Modérateur connecté</p>
              <p className="text-xs font-bold text-[#1B4332]">{user.displayName}</p>
            </div>
          </div>
        </div>

        {/* 1. Tableau de bord KPI */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[#E8E1D5] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8C7A6B]">Artisans Inscrits</span>
                <Users className="h-4 w-4 text-[#C86D3B]" />
              </div>
              <p className="text-2xl font-black text-[#1B4332] mt-2">{stats.artisansCount}</p>
              <span className="text-[10px] text-[#2A9D8F] font-semibold">{stats.verifiedArtisansCount} certifiés officiellement</span>
            </div>

            <div className="rounded-2xl border border-[#E8E1D5] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8C7A6B]">Dossiers en Attente</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600 mt-2">{stats.pendingVerificationsCount}</p>
              <span className="text-[10px] text-[#8C7A6B]">Nécessite vérification sur le terrain</span>
            </div>

            <div className="rounded-2xl border border-[#E8E1D5] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8C7A6B]">Œuvres Référencées</span>
                <Package className="h-4 w-4 text-[#1B4332]" />
              </div>
              <p className="text-2xl font-black text-[#1B4332] mt-2">{stats.artworksCount}</p>
              <span className="text-[10px] text-[#8C7A6B]">8 certifiées sur Polygon Amoy</span>
            </div>

            <div className="rounded-2xl border border-[#E8E1D5] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8C7A6B]">Commandes Séquestre</span>
                <Coins className="h-4 w-4 text-[#C86D3B]" />
              </div>
              <p className="text-2xl font-black text-[#C86D3B] mt-2">{stats.ordersCount}</p>
              <span className="text-[10px] text-[#8C7A6B]">Fonds garantis par SendaEscrow</span>
            </div>
          </div>
        )}

        {/* 2. Liste des demandes de vérification des artisans */}
        <div className="rounded-3xl border border-[#E8E1D5] bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1B4332]">
                Dossiers d&apos;artisanat soumis pour certification
              </h2>
              <p className="text-xs text-[#6B5A4E]">
                Examen des ateliers, de la provenance provinciale et signature cryptographique du portefeuille.
              </p>
            </div>
            <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 text-xs font-bold">
              {dossiers.filter((d) => d.status === "PENDING").length} en attente
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#8C7A6B]">Chargement des dossiers...</div>
          ) : dossiers.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8C7A6B]">Aucun dossier d&apos;artisan pour le moment.</div>
          ) : (
            <div className="space-y-4">
              {dossiers.map((dossier) => (
                <div
                  key={dossier.id}
                  className="rounded-2xl border border-[#E8E1D5] bg-[#FAF8F5] p-5 transition-all hover:border-[#1B4332]/40"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-sm text-[#1B4332]">{dossier.artisanName}</span>
                        <span className="text-xs text-[#8C7A6B]">•</span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#C86D3B]">
                          <Building2 className="h-3 w-3" />
                          {dossier.workshopName}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white border border-[#E8E1D5] px-2 py-0.5 text-[10px] text-[#4A3B33]">
                          <MapPin className="h-3 w-3 text-[#C86D3B]" />
                          {dossier.province}
                        </span>
                      </div>

                      <p className="text-xs text-[#4A3B33] max-w-2xl">{dossier.bio}</p>

                      <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-[#8C7A6B]">
                        <span>Wallet certifié :</span>
                        <span className="bg-white px-2 py-0.5 rounded border border-[#E8E1D5] font-bold text-[#1B4332]">
                          {dossier.walletAddress}
                        </span>
                      </div>

                      {dossier.rejectionReason && (
                        <div className="rounded-xl bg-red-50 border border-red-200 p-2 text-xs text-red-700">
                          <strong>Motif de refus :</strong> {dossier.rejectionReason}
                        </div>
                      )}
                    </div>

                    {/* Actions de modération */}
                    <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                      {dossier.status === "PENDING" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenModal(dossier, "APPROVE")}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1B4332] px-3.5 py-2 text-xs font-bold text-[#E9C46A] hover:bg-[#143427] shadow-xs transition-all"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Valider certification</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenModal(dossier, "REJECT")}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition-all"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Rejeter avec motif</span>
                          </button>
                        </>
                      ) : (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            dossier.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {dossier.status === "APPROVED" ? "✓ Certifié" : "✕ Rejeté"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Supervision du Séquestre Physique */}
        <div className="rounded-3xl border border-[#E8E1D5] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-[#1B4332]">
              Commandes et Séquestre Physique (Smart Contract)
            </h2>
            <span className="text-xs text-[#8C7A6B]">Contrat SendaEscrow</span>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E8E1D5] p-8 text-center text-xs text-[#8C7A6B]">
              Aucune commande sous séquestre pour le moment. Les commandes passées via le catalogue apparaîtront ici.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8E1D5] text-[#8C7A6B]">
                    <th className="py-3 font-bold">ID Commande</th>
                    <th className="py-3 font-bold">Acheteur</th>
                    <th className="py-3 font-bold">Artisan Vendeur</th>
                    <th className="py-3 font-bold">Montant</th>
                    <th className="py-3 font-bold">Statut Séquestre</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D6]">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-3 font-mono font-bold text-[#1B4332]">{o.id}</td>
                      <td className="py-3 font-mono text-[#4A3B33]">{o.buyer.slice(0, 8)}...{o.buyer.slice(-6)}</td>
                      <td className="py-3 font-mono text-[#4A3B33]">{o.seller.slice(0, 8)}...{o.seller.slice(-6)}</td>
                      <td className="py-3 font-bold text-[#C86D3B]">{o.amount} {o.tokenSymbol}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 border border-emerald-200">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE PRISE DE DÉCISION DE MODÉRATION */}
      {selectedDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[#E8E1D5] space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E8E1D5] pb-3">
              <div className="flex items-center gap-2">
                {decisionType === "APPROVE" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <h3 className="font-serif text-base font-bold text-[#1B4332]">
                  {decisionType === "APPROVE"
                    ? "Certification de l'Artisan"
                    : "Rejet du Dossier d'Artisan"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDossier(null)}
                className="text-[#8C7A6B] hover:text-[#2D231E]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p>
                <strong>Artisan :</strong> {selectedDossier.artisanName}
              </p>
              <p>
                <strong>Atelier :</strong> {selectedDossier.workshopName} ({selectedDossier.province})
              </p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2D231E] mb-1.5">
                  Motif écrit obligatoire (justification de la décision) :
                </label>
                <textarea
                  required
                  rows={4}
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder={
                    decisionType === "APPROVE"
                      ? "Ex: Visite sur place confirmant l'authenticité de l'atelier, la maîtrise des techniques ancestrales..."
                      : "Ex: Dossier incomplet, absence de justificatifs de l'atelier à Tshikapa..."
                  }
                  className="w-full rounded-xl border border-[#E8E1D5] bg-[#FAF8F5] p-3 text-xs text-[#2D231E] focus:border-[#1B4332] focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDossier(null)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-[#6B5A4E] hover:bg-[#FAF8F5]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionInProgress}
                  className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all ${
                    decisionType === "APPROVE"
                      ? "bg-[#1B4332] hover:bg-[#143427]"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {actionInProgress
                    ? "Enregistrement..."
                    : decisionType === "APPROVE"
                    ? "Confirmer la certification"
                    : "Confirmer le rejet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
