"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: "VISITOR" | "BUYER" | "ARTISAN" | "ADMIN";
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  verificationReason?: string;
  walletAddress?: string | null;
  workshopName?: string;
  province?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    email: string;
    password: string;
    displayName: string;
    role: "BUYER" | "ARTISAN";
    workshopName?: string;
    province?: string;
    bio?: string;
  }) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  linkWallet: (walletAddress: string, signMessageAsync: (args: { message: string }) => Promise<`0x${string}`>) => Promise<boolean>;
  submitArtisanVerification: (data: {
    workshopName: string;
    province: string;
    bio: string;
    portfolioLinks?: string[];
  }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger la session stockée au démarrage
  useEffect(() => {
    const savedToken = localStorage.getItem("senda_auth_token");
    if (savedToken) {
      setToken(savedToken);
      fetchUserProfile(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async (jwtToken: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data);
      } else {
        localStorage.removeItem("senda_auth_token");
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération du profil :", err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.error?.message || "Identifiants invalides");
        return false;
      }

      setToken(data.data.token);
      setUser(data.data.user);
      localStorage.setItem("senda_auth_token", data.data.token);
      toast.success(`Bienvenue, ${data.data.user.displayName} !`);
      return true;
    } catch (err: any) {
      toast.error("Erreur de connexion au serveur d'authentification.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    displayName: string;
    role: "BUYER" | "ARTISAN";
    workshopName?: string;
    province?: string;
    bio?: string;
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!result.success) {
        toast.error(result.error?.message || "Échec de l'inscription");
        return false;
      }

      setToken(result.data.token);
      setUser(result.data.user);
      localStorage.setItem("senda_auth_token", result.data.token);
      toast.success("Compte SENDA créé avec succès !");
      return true;
    } catch (err: any) {
      toast.error("Erreur de connexion lors de l'inscription.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("senda_auth_token");
    toast.info("Vous avez été déconnecté.");
  };

  const refreshUser = async () => {
    if (token) {
      await fetchUserProfile(token);
    }
  };

  const linkWallet = async (
    walletAddress: string,
    signMessageAsync: (args: { message: string }) => Promise<`0x${string}`>
  ): Promise<boolean> => {
    if (!token) {
      toast.error("Veuillez d'abord vous connecter à votre compte SENDA.");
      return false;
    }

    try {
      // 1. Demande de défi (nonce) au backend
      const challengeRes = await fetch(`${API_URL}/auth/wallet-challenge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ walletAddress }),
      });
      const challengeData = await challengeRes.json();

      if (!challengeData.success) {
        toast.error(challengeData.error?.message || "Impossible de générer le défi cryptographique.");
        return false;
      }

      const { challengeMessage } = challengeData.data;

      toast.info("Veuillez signer le message dans votre portefeuille (MetaMask)...");

      // 2. Signature cryptographique via MetaMask / Wagmi
      const signature = await signMessageAsync({ message: challengeMessage });

      // 3. Validation de la preuve cryptographique par le backend
      const verifyRes = await fetch(`${API_URL}/auth/verify-wallet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          walletAddress,
          signature,
          message: challengeMessage,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        toast.error(verifyData.error?.message || "La signature cryptographique a échoué.");
        return false;
      }

      // Mise à jour de l'état
      setToken(verifyData.data.token);
      setUser(verifyData.data.user);
      localStorage.setItem("senda_auth_token", verifyData.data.token);
      toast.success("Portefeuille Web3 vérifié et associé avec succès !");
      return true;
    } catch (err: any) {
      console.error("Erreur de liaison portefeuille :", err);
      toast.error(err.message?.includes("User rejected") ? "Signature refusée par l'utilisateur." : "Erreur lors de la signature.");
      return false;
    }
  };

  const submitArtisanVerification = async (data: {
    workshopName: string;
    province: string;
    bio: string;
    portfolioLinks?: string[];
  }): Promise<boolean> => {
    if (!token) {
      toast.error("Veuillez vous connecter.");
      return false;
    }

    try {
      const res = await fetch(`${API_URL}/artisans/verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!result.success) {
        toast.error(result.error?.message || "Erreur lors de la soumission du dossier.");
        return false;
      }

      await refreshUser();
      toast.success("Dossier d'atelier transmis avec succès pour examen par les administrateurs.");
      return true;
    } catch (err) {
      toast.error("Erreur de communication avec le serveur.");
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        linkWallet,
        submitArtisanVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}
