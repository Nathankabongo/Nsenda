import crypto from "crypto";
import jwt from "jsonwebtoken";
import { verifyMessage } from "viem";

const JWT_SECRET = process.env.JWT_SECRET || "senda_secret_jwt_key_pour_signature_cryptographique_2026";
const JWT_EXPIRES_IN = "7d";

/**
 * Hache un mot de passe en utilisant scrypt (standard cryptographique sécurisé)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Vérifie un mot de passe en clair contre un hash scrypt stocké
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch (err) {
    return false;
  }
}

/**
 * Génère un nonce cryptographique aléatoire pour la signature Web3
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Génère le message textuel d'authentification à signer avec le portefeuille Web3 (SIWE style)
 */
export function formatChallengeMessage(walletAddress: string, nonce: string): string {
  return (
    `AUTHENTIFICATION SENDA RDC\n` +
    `===========================\n` +
    `Je certifie être le détenteur légitime de l'adresse :\n` +
    `${walletAddress.toLowerCase()}\n\n` +
    `Défi de sécurité (Nonce) : ${nonce}\n` +
    `Horodatage : ${new Date().toISOString()}\n\n` +
    `Cette signature ne génère aucun frais de gaz et prouve la possession de ma clé privée.`
  );
}

/**
 * Signe un jeton de session JWT
 */
export function generateJwtToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Vérifie un jeton JWT
 */
export function verifyJwtToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Vérifie la signature cryptographique d'un message par une clé privée Ethereum
 */
export async function verifySignature(
  address: string,
  message: string,
  signature: `0x${string}`
): Promise<boolean> {
  try {
    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature,
    });
    return isValid;
  } catch (err) {
    console.error("Échec de vérification cryptographique de signature :", err);
    return false;
  }
}
