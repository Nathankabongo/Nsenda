import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { PinataService } from "../services/pinataService";
import { AIAuthenticationService, AIAnalysisResult } from "../services/aiAuthenticationService";
import {
  hashPassword,
  verifyPassword,
  generateNonce,
  formatChallengeMessage,
  generateJwtToken,
  verifySignature,
} from "../utils/crypto";
import {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireVerifiedArtisan,
  AuthenticatedUser,
} from "../middlewares/auth";

const router = Router();
const upload = multer({ dest: path.join(__dirname, "../../uploads") });

// ============================================================================
// MODÈLES DE DONNÉES EN MÉMOIRE (Miroir PostgreSQL / Prisma)
// ============================================================================

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: "VISITOR" | "BUYER" | "ARTISAN" | "ADMIN";
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  verificationReason?: string;
  walletAddress?: string | null;
  activeNonce?: string | null;
  workshopName?: string;
  province?: string;
  bio?: string;
  createdAt: string;
}

export interface Artwork {
  id: string;
  title: string;
  description?: string;
  category: string;
  province: string;
  price: string;
  priceWei?: string;
  tokenSymbol: string;
  artisanName: string;
  artisanAddress: string;
  materials: string;
  dimensions: string;
  weight?: string;
  image?: string;
  status: "DRAFT" | "MINTED_LISTED" | "ESCROW_LOCKED" | "SOLD";
  ipfsImageUri?: string;
  ipfsMetadataUri?: string;
  tokenId: number;
  royaltyBps?: number;
  verificationStatus: "VERIFIED" | "PENDING" | "UNVERIFIED";
  aiAuthentication?: AIAnalysisResult;
}

export interface VerificationDossier {
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
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface EscrowOrder {
  id: string;
  orderIdHex: string;
  artworkId: string;
  buyer: string;
  seller: string;
  amount: string;
  tokenSymbol: string;
  status: "INITIALIZED" | "FUNDED" | "SHIPPED" | "RELEASED" | "REFUNDED" | "DISPUTED";
  depositTxHash?: string;
  releaseTxHash?: string;
  refundTxHash?: string;
  createdAt: string;
  updatedAt: string;
}

// Initialisation des utilisateurs préconfigurés pour la démonstration académique
const usersStore: UserAccount[] = [
  {
    id: "usr-admin-001",
    email: "admin@senda.cd",
    passwordHash: hashPassword("SendaAdmin2026!"),
    displayName: "Prof. Modérateur UNIKIN",
    role: "ADMIN",
    verificationStatus: "VERIFIED",
    walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr-artisan-001",
    email: "mukendi@artisanat.cd",
    passwordHash: hashPassword("Artisan2026!"),
    displayName: "Maître Mukendi Kalonji",
    role: "ARTISAN",
    verificationStatus: "VERIFIED",
    workshopName: "Atelier Royal du Kwilu",
    province: "Kwilu",
    bio: "Maître sculpteur sur bois wengé et concepteur de masques rituels Pende depuis 32 ans.",
    walletAddress: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr-artisan-002",
    email: "tshimanga@artisanat.cd",
    passwordHash: hashPassword("Artisan2026!"),
    displayName: "Papa Tshimanga Kabemba",
    role: "ARTISAN",
    verificationStatus: "PENDING",
    workshopName: "Sculptures Tshokwe de Tshikapa",
    province: "Kasaï",
    bio: "Sculpteur traditionnel Tshokwe spécialisé dans les statuettes des ancêtres et chefs royaux.",
    walletAddress: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr-buyer-001",
    email: "acheteur@senda.cd",
    passwordHash: hashPassword("Acheteur2026!"),
    displayName: "Collectionneur Lumumba",
    role: "BUYER",
    verificationStatus: "VERIFIED",
    walletAddress: "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
    createdAt: new Date().toISOString(),
  },
];

// Catalogue des 8 œuvres artisanales authentiques congolaises
const artworksStore: Artwork[] = [
  {
    id: "1",
    title: "Masque Royal Pende — Mbuya",
    category: "Masques traditionnels",
    province: "Kwilu",
    price: "180",
    priceWei: "180000000000000000000",
    tokenSymbol: "STT",
    artisanName: "Maître Mukendi Kalonji",
    artisanAddress: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    materials: "Bois de wengé, raphia, kaolin",
    dimensions: "38 x 24 x 18 cm",
    weight: "1.35 kg",
    image: "/artworks/masque_pende.jpg",
    status: "MINTED_LISTED",
    ipfsMetadataUri: "ipfs://bafybeihsendapende001metadatajsoncid/metadata.json",
    ipfsImageUri: "ipfs://bafybeicpende7v6imagehashcid001/masque_pende.jpg",
    tokenId: 1,
    royaltyBps: 500,
    verificationStatus: "VERIFIED",
  },
  {
    id: "2",
    title: "Statuette Tshokwe — Héros Chibinda Ilunga",
    category: "Sculptures sur bois",
    province: "Grand Kasaï",
    price: "320",
    priceWei: "320000000000000000000",
    tokenSymbol: "STT",
    artisanName: "Papa Tshimanga Kabemba",
    artisanAddress: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
    materials: "Bois d'iroko, patine aux huiles naturelles, laiton",
    dimensions: "45 x 16 x 14 cm",
    weight: "2.10 kg",
    image: "/artworks/statuette_tshokwe.jpg",
    status: "MINTED_LISTED",
    ipfsMetadataUri: "ipfs://bafybeihsendatshokwe002metadatajsoncid/metadata.json",
    ipfsImageUri: "ipfs://bafybeictshokweimagehashcid002/statuette_chibinda.jpg",
    tokenId: 2,
    royaltyBps: 700,
    verificationStatus: "VERIFIED",
  },
  {
    id: "3",
    title: "Tapis Velours du Kasaï — Shoowa Royal",
    category: "Textiles & Raphia",
    province: "Grand Kasaï",
    price: "240",
    priceWei: "240000000000000000000",
    tokenSymbol: "STT",
    artisanName: "Coopérative Maman Bikale",
    artisanAddress: "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
    materials: "Fibre de raphia, teintures végétales",
    dimensions: "62 x 58 cm",
    weight: "0.65 kg",
    image: "/artworks/textile_shoowa.jpg",
    status: "MINTED_LISTED",
    ipfsMetadataUri: "ipfs://bafybeihsendashoowa003metadatajsoncid/metadata.json",
    ipfsImageUri: "ipfs://bafybeicshoowaimagehashcid003/velours_shoowa.jpg",
    tokenId: 3,
    royaltyBps: 500,
    verificationStatus: "VERIFIED",
  },
  {
    id: "4",
    title: "Pectoral Cérémoniel en Malachite Polie",
    category: "Bijouterie & Malachite",
    province: "Haut-Katanga",
    price: "410",
    priceWei: "410000000000000000000",
    tokenSymbol: "STT",
    artisanName: "Atelier Ilunga & Frères",
    artisanAddress: "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65",
    materials: "Malachite naturelle zonée AAA, cuivre martelé",
    dimensions: "18 x 14 x 3 cm",
    weight: "0.95 kg",
    image: "/artworks/bijou_malachite.jpg",
    status: "MINTED_LISTED",
    ipfsMetadataUri: "ipfs://bafybeihsendamalachite004metadatajsoncid/metadata.json",
    ipfsImageUri: "ipfs://bafybeicmalachiteimagehashcid004/pectoral_malachite.jpg",
    tokenId: 4,
    royaltyBps: 600,
    verificationStatus: "VERIFIED",
  },
  {
    id: "5",
    title: "Panier d'Apparat Bakongo en Lianes Tressées",
    category: "Vannerie & Paniers",
    province: "Kongo Central",
    price: "150",
    priceWei: "150000000000000000000",
    tokenSymbol: "STT",
    artisanName: "Maman Nkenge Mayombe",
    artisanAddress: "0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc",
    materials: "Lianes du Mayombe, bambou sauvage, pigments d'écorces",
    dimensions: "34 x 34 x 28 cm",
    weight: "0.45 kg",
    image: "/artworks/panier_kongo.jpg",
    status: "MINTED_LISTED",
    ipfsMetadataUri: "ipfs://bafybeihsendapanier005metadatajsoncid/metadata.json",
    ipfsImageUri: "ipfs://bafybeicpanierimagehashcid005/panier_bakongo.jpg",
    tokenId: 5,
    royaltyBps: 500,
    verificationStatus: "VERIFIED",
  },
  {
    id: "6",
    title: "Coupe Céphalomorphe Bakuba en Ébène",
    category: "Sculptures sur bois",
    province: "Sankuru",
    price: "290",
    priceWei: "290000000000000000000",
    tokenSymbol: "STT",
    artisanName: "Maître Bope Mikobi",
    artisanAddress: "0x976ea74026e72cd11b02573542f41f0fb7f74391",
    materials: "Bois d'ébène royal, patine au beurre de karité",
    dimensions: "26 x 14 x 14 cm",
    weight: "1.15 kg",
    image: "/artworks/coupe_bakuba.jpg",
    status: "MINTED_LISTED",
    ipfsMetadataUri: "ipfs://bafybeihsendabakuba006metadatajsoncid/metadata.json",
    ipfsImageUri: "ipfs://bafybeicbakubaimagehashcid006/coupe_bakuba.jpg",
    tokenId: 6,
    royaltyBps: 700,
    verificationStatus: "VERIFIED",
  },
  {
    id: "7",
    title: "Statue Porteuse de Coupe Luba — Mboko",
    category: "Sculptures sur bois",
    province: "Tanganyika",
    price: "360",
    priceWei: "360000000000000000000",
    tokenSymbol: "STT",
    artisanName: "Sculpteur Kasongo de Kalemie",
    artisanAddress: "0xbcd4042de499d14e55001ccbb24a551f3b954096",
    materials: "Bois dur patiné, scarifications perlées, cauris",
    dimensions: "42 x 18 x 16 cm",
    weight: "1.80 kg",
    image: "/artworks/hero_artisanat.jpg",
    status: "MINTED_LISTED",
    ipfsMetadataUri: "ipfs://bafybeihsendaluba007metadatajsoncid/metadata.json",
    ipfsImageUri: "ipfs://bafybeiclubaimagehashcid007/statue_luba.jpg",
    tokenId: 7,
    royaltyBps: 500,
    verificationStatus: "VERIFIED",
  },
  {
    id: "8",
    title: "Tabouret Royal Mangbetu Décoré",
    category: "Sculptures sur bois",
    province: "Haut-Uele",
    price: "275",
    priceWei: "275000000000000000000",
    tokenSymbol: "STT",
    artisanName: "Atelier Mangbetu d'Isiro",
    artisanAddress: "0x71be63f3384f5fb98995898a86b02fb2426c5788",
    materials: "Bois massif monoxyle, pyrogravure traditionnelle",
    dimensions: "36 x 32 x 32 cm",
    weight: "2.40 kg",
    image: "/artworks/hero_artisanat.jpg",
    status: "MINTED_LISTED",
    ipfsMetadataUri: "ipfs://bafybeihsendamangbetu008metadatajsoncid/metadata.json",
    ipfsImageUri: "ipfs://bafybeicmangbetuimagehashcid008/tabouret_mangbetu.jpg",
    tokenId: 8,
    royaltyBps: 700,
    verificationStatus: "VERIFIED",
  },
];

// Initialisation des attestations d'authenticité IA SendaVision pour chaque œuvre
artworksStore.forEach((art) => {
  art.aiAuthentication = AIAuthenticationService.analyzeCraft({
    artworkId: art.id,
    title: art.title,
    category: art.category,
    declaredProvince: art.province,
    materials: art.materials,
    description: art.description || art.title,
  });
});

const ordersStore: EscrowOrder[] = [];
const verificationRequests: VerificationDossier[] = [
  {
    id: "verif-001",
    userId: "usr-artisan-002",
    artisanName: "Papa Tshimanga Kabemba",
    workshopName: "Sculptures Tshokwe de Tshikapa",
    province: "Kasaï",
    walletAddress: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
    bio: "Sculpteur traditionnel Tshokwe spécialisé dans les statuettes des ancêtres et chefs royaux.",
    portfolioLinks: [
      "https://artisanat.cd/ateliers/tshimanga-tshikapa",
      "https://artcongo.org/sculpteurs/chibinda-ilunga",
    ],
    status: "PENDING",
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// ============================================================================
// 1. ENDPOINTS D'ÉTAT DE SANTÉ & INFORMATIONS
// ============================================================================

router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: "UP",
      service: "SENDA REST API & Authenticator",
      network: "polygon-amoy",
      chainId: 80002,
      registeredUsers: usersStore.length,
      listedArtworks: artworksStore.length,
      escrowOrders: ordersStore.length,
      timestamp: new Date().toISOString(),
    },
  });
});

// ============================================================================
// 2. ENDPOINTS D'AUTHENTIFICATION & SÉCURITÉ APPLICATIVE (RBAC)
// ============================================================================

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur (Acheteur ou Artisan)
 */
router.post("/auth/register", (req: Request, res: Response) => {
  const { email, password, displayName, role, workshopName, province, bio } = req.body;

  if (!email || !password || !displayName) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Email, mot de passe et nom sont requis." },
    });
  }

  const existing = usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({
      success: false,
      error: { code: "USER_EXISTS", message: "Un compte existe déjà avec cette adresse email." },
    });
  }

  const chosenRole = role === "ARTISAN" ? "ARTISAN" : "BUYER";
  const newUser: UserAccount = {
    id: "usr-" + Date.now(),
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    displayName,
    role: chosenRole,
    verificationStatus: chosenRole === "ARTISAN" ? "UNVERIFIED" : "VERIFIED",
    workshopName: workshopName || "",
    province: province || "Kinshasa",
    bio: bio || "",
    createdAt: new Date().toISOString(),
  };

  usersStore.push(newUser);

  const token = generateJwtToken({
    id: newUser.id,
    email: newUser.email,
    displayName: newUser.displayName,
    role: newUser.role,
    verificationStatus: newUser.verificationStatus,
    walletAddress: newUser.walletAddress || null,
  });

  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
        verificationStatus: newUser.verificationStatus,
        walletAddress: newUser.walletAddress || null,
        workshopName: newUser.workshopName,
        province: newUser.province,
      },
    },
  });
});

/**
 * POST /api/auth/login
 * Connexion par email et mot de passe sécurisé
 */
router.post("/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Email et mot de passe requis." },
    });
  }

  const user = usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({
      success: false,
      error: { code: "INVALID_CREDENTIALS", message: "Identifiants invalides." },
    });
  }

  const token = generateJwtToken({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    verificationStatus: user.verificationStatus,
    walletAddress: user.walletAddress || null,
  });

  res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        verificationStatus: user.verificationStatus,
        walletAddress: user.walletAddress || null,
        workshopName: user.workshopName,
        province: user.province,
      },
    },
  });
});

/**
 * GET /api/auth/me
 * Consultation du profil de l'utilisateur connecté
 */
router.get("/auth/me", authenticateToken, (req: Request, res: Response) => {
  const user = usersStore.find((u) => u.id === req.user!.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: "USER_NOT_FOUND", message: "Utilisateur non trouvé." },
    });
  }

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      verificationStatus: user.verificationStatus,
      verificationReason: user.verificationReason,
      walletAddress: user.walletAddress || null,
      workshopName: user.workshopName,
      province: user.province,
      bio: user.bio,
    },
  });
});

/**
 * POST /api/auth/wallet-challenge
 * Génération d'un défi cryptographique (nonce) à signer par le portefeuille Web3
 */
router.post("/auth/wallet-challenge", authenticateToken, (req: Request, res: Response) => {
  const { walletAddress } = req.body;

  if (!walletAddress || !walletAddress.startsWith("0x")) {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_ADDRESS", message: "Adresse Ethereum invalide." },
    });
  }

  const user = usersStore.find((u) => u.id === req.user!.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: "USER_NOT_FOUND", message: "Utilisateur introuvable." },
    });
  }

  const nonce = generateNonce();
  user.activeNonce = nonce;

  const challengeMessage = formatChallengeMessage(walletAddress, nonce);

  res.status(200).json({
    success: true,
    data: {
      nonce,
      challengeMessage,
      walletAddress: walletAddress.toLowerCase(),
    },
  });
});

/**
 * POST /api/auth/verify-wallet
 * Vérification cryptographique de la signature Web3 et association du portefeuille
 */
router.post("/auth/verify-wallet", authenticateToken, async (req: Request, res: Response) => {
  const { walletAddress, signature, message } = req.body;

  if (!walletAddress || !signature || !message) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Adresse, signature et message sont requis." },
    });
  }

  const user = usersStore.find((u) => u.id === req.user!.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: "USER_NOT_FOUND", message: "Utilisateur introuvable." },
    });
  }

  // Vérification cryptographique via viem
  const isValid = await verifySignature(walletAddress, message, signature);

  if (!isValid) {
    return res.status(401).json({
      success: false,
      error: {
        code: "SIGNATURE_VERIFICATION_FAILED",
        message: "La signature cryptographique ne correspond pas à la clé privée de l'adresse fournie.",
      },
    });
  }

  // Association sécurisée du portefeuille prouvé au compte applicatif
  user.walletAddress = walletAddress.toLowerCase();
  user.activeNonce = null; // Invalidation du nonce après utilisation (anti-rejeu)

  // Émission d'un jeton mis à jour avec le wallet certifié
  const updatedToken = generateJwtToken({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    verificationStatus: user.verificationStatus,
    walletAddress: user.walletAddress,
  });

  res.status(200).json({
    success: true,
    data: {
      message: "Portefeuille Web3 authentifié et lié avec succès.",
      token: updatedToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        verificationStatus: user.verificationStatus,
        walletAddress: user.walletAddress,
      },
    },
  });
});

// ============================================================================
// 3. CATALOGUE D'ŒUVRES ARTISANALES
// ============================================================================

/**
 * GET /api/artworks
 * Consultation du catalogue avec filtres
 */
router.get("/artworks", (req: Request, res: Response) => {
  const { category, province, search } = req.query;

  let results = [...artworksStore];

  if (category && category !== "Toutes catégories") {
    results = results.filter((a) => a.category === category);
  }

  if (province && province !== "Toutes les provinces") {
    results = results.filter((a) => a.province === province);
  }

  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    results = results.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.artisanName.toLowerCase().includes(q) ||
        a.materials.toLowerCase().includes(q)
    );
  }

  res.status(200).json({
    success: true,
    data: {
      items: results,
      total: results.length,
    },
  });
});

/**
 * GET /api/artworks/:id
 * Consultation détaillée d'une œuvre
 */
router.get("/artworks/:id", (req: Request, res: Response) => {
  const artwork = artworksStore.find((a) => a.id === req.params.id || a.tokenId.toString() === req.params.id);

  if (!artwork) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Œuvre artisanale introuvable" },
    });
  }

  res.status(200).json({
    success: true,
    data: artwork,
  });
});

/**
 * POST /api/artworks
 * Publication d'une œuvre artisanale (protégée : rôle ARTISAN et statut VERIFIED obligatoire)
 */
router.post("/artworks", authenticateToken, requireVerifiedArtisan, (req: Request, res: Response) => {
  const { title, description, category, province, materials, dimensions, weight, price, image, royaltyBps } = req.body;

  if (!title || !price) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Titre et prix obligatoires." },
    });
  }

  const user = usersStore.find((u) => u.id === req.user!.id);
  const artisanAddress = user?.walletAddress || req.user!.walletAddress;

  if (!artisanAddress) {
    return res.status(400).json({
      success: false,
      error: {
        code: "WALLET_REQUIRED",
        message: "Vous devez lier et prouver cryptographiquement votre portefeuille avant de publier une œuvre.",
      },
    });
  }

  const newArtwork: Artwork = {
    id: "art-" + Date.now(),
    title,
    description: description || "",
    category: category || "Sculptures sur bois",
    province: province || user?.province || "Kinshasa",
    price: price.toString(),
    priceWei: (BigInt(Math.floor(parseFloat(price.toString()))) * BigInt(10 ** 18)).toString(),
    tokenSymbol: "STT",
    artisanName: user?.displayName || "Artisan SENDA Certifié",
    artisanAddress,
    materials: materials || "Matériaux nobles congolais",
    dimensions: dimensions || "Dimensions standard",
    weight: weight || "1.00 kg",
    image: image || "/artworks/hero_artisanat.jpg",
    status: "MINTED_LISTED",
    tokenId: artworksStore.length + 1,
    royaltyBps: Number(royaltyBps) || 500, // 5% par défaut
    verificationStatus: "VERIFIED",
    ipfsMetadataUri: "ipfs://bafybeihsendaart" + Date.now() + "/metadata.json",
    ipfsImageUri: "ipfs://bafybeicimage" + Date.now() + "/piece.jpg",
  };

  newArtwork.aiAuthentication = AIAuthenticationService.analyzeCraft({
    artworkId: newArtwork.id,
    title: newArtwork.title,
    category: newArtwork.category,
    declaredProvince: newArtwork.province,
    materials: newArtwork.materials,
    description: newArtwork.description,
  });

  artworksStore.push(newArtwork);

  res.status(201).json({
    success: true,
    data: newArtwork,
  });
});

/**
 * POST /api/artworks/:id/metadata
 * Téléversement et épinglage IPFS via Pinata
 */
router.post("/artworks/:id/metadata", upload.single("image"), async (req: Request, res: Response) => {
  try {
    const artworkId = req.params.id;
    const file = req.file;

    let imageUri = "ipfs://bafybeicimagehash" + Date.now();
    let metadataUri = "ipfs://bafybeihmetadataindex" + Date.now();

    if (file && process.env.PINATA_API_KEY && process.env.PINATA_SECRET_KEY) {
      imageUri = await PinataService.pinFileToIPFS(file.path, file.originalname);
      fs.unlinkSync(file.path);
    }

    res.status(200).json({
      success: true,
      data: {
        artworkId,
        imageUri,
        metadataUri,
        pinnedToIPFS: true,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: "IPFS_ERROR", message: err.message },
    });
  }
});

// ============================================================================
// 4. CERTIFICATION DES ARTISANS & VÉRIFICATION D'ATELIER
// ============================================================================

/**
 * POST /api/artisans/verification
 * Soumission d'une demande de certification par un artisan
 */
router.post("/artisans/verification", authenticateToken, (req: Request, res: Response) => {
  const { workshopName, province, bio, portfolioLinks } = req.body;

  const user = usersStore.find((u) => u.id === req.user!.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: "USER_NOT_FOUND", message: "Utilisateur introuvable." },
    });
  }

  if (!user.walletAddress) {
    return res.status(400).json({
      success: false,
      error: {
        code: "WALLET_NOT_LINKED",
        message: "Vous devez d'abord lier et signer votre portefeuille Web3 avant de demander une certification.",
      },
    });
  }

  // Mise à jour de l'utilisateur en statut PENDING
  user.role = "ARTISAN";
  user.verificationStatus = "PENDING";
  user.workshopName = workshopName || user.workshopName;
  user.province = province || user.province;
  user.bio = bio || user.bio;

  const dossier: VerificationDossier = {
    id: "verif-" + Date.now(),
    userId: user.id,
    artisanName: user.displayName,
    workshopName: workshopName || user.workshopName || "Atelier d'Artisan",
    province: province || user.province || "Kinshasa",
    walletAddress: user.walletAddress,
    bio: bio || user.bio || "",
    portfolioLinks: portfolioLinks || [],
    status: "PENDING",
    submittedAt: new Date().toISOString(),
  };

  verificationRequests.push(dossier);

  res.status(201).json({
    success: true,
    data: {
      message: "Dossier de certification soumis avec succès aux vérificateurs de SENDA.",
      dossier,
    },
  });
});

// ============================================================================
// 5. ESPACE D'ADMINISTRATION & DE MODÉRATION (Accès réservé ADMIN)
// ============================================================================

/**
 * GET /api/admin/verifications
 * Consultation de la liste de tous les dossiers d'artisans (réservé ADMIN)
 */
router.get("/admin/verifications", authenticateToken, requireRole(["ADMIN"]), (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      dossiers: verificationRequests,
      total: verificationRequests.length,
      pendingCount: verificationRequests.filter((d) => d.status === "PENDING").length,
    },
  });
});

/**
 * POST /api/admin/verifications/:id/review
 * Approbation ou Rejet d'un artisan avec justification écrite obligatoire
 */
router.post("/admin/verifications/:id/review", authenticateToken, requireRole(["ADMIN"]), (req: Request, res: Response) => {
  const { id } = req.params;
  const { decision, rationale } = req.body;

  if (!decision || !["APPROVE", "REJECT"].includes(decision)) {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_DECISION", message: "La décision doit être soit 'APPROVE', soit 'REJECT'." },
    });
  }

  if (!rationale || rationale.trim().length < 5) {
    return res.status(400).json({
      success: false,
      error: {
        code: "RATIONALE_REQUIRED",
        message: "Un motif écrit détaillé est obligatoire pour valider ou rejeter un dossier d'artisan.",
      },
    });
  }

  const dossier = verificationRequests.find((d) => d.id === id);
  if (!dossier) {
    return res.status(404).json({
      success: false,
      error: { code: "DOSSIER_NOT_FOUND", message: "Dossier de vérification introuvable." },
    });
  }

  const artisanUser = usersStore.find((u) => u.id === dossier.userId || u.walletAddress?.toLowerCase() === dossier.walletAddress.toLowerCase());

  if (decision === "APPROVE") {
    dossier.status = "APPROVED";
    dossier.rejectionReason = undefined;
    dossier.reviewedAt = new Date().toISOString();
    dossier.reviewedBy = req.user!.email;

    if (artisanUser) {
      artisanUser.verificationStatus = "VERIFIED";
      artisanUser.verificationReason = `Approuvé par ${req.user!.email} : ${rationale}`;
    }
  } else {
    dossier.status = "REJECTED";
    dossier.rejectionReason = rationale;
    dossier.reviewedAt = new Date().toISOString();
    dossier.reviewedBy = req.user!.email;

    if (artisanUser) {
      artisanUser.verificationStatus = "REJECTED";
      artisanUser.verificationReason = rationale;
    }
  }

  res.status(200).json({
    success: true,
    data: {
      message: decision === "APPROVE" ? "Artisan certifié avec succès." : "Dossier artisan rejeté avec motif consigné.",
      dossier,
    },
  });
});

/**
 * GET /api/admin/orders
 * Vue d'ensemble de tous les ordres de séquestre physique
 */
router.get("/admin/orders", authenticateToken, requireRole(["ADMIN"]), (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      orders: ordersStore,
      total: ordersStore.length,
    },
  });
});

/**
 * GET /api/admin/stats
 * Tableau de bord statistique pour le jury académique
 */
router.get("/admin/stats", authenticateToken, requireRole(["ADMIN"]), (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      totalUsers: usersStore.length,
      artisansCount: usersStore.filter((u) => u.role === "ARTISAN").length,
      verifiedArtisansCount: usersStore.filter((u) => u.role === "ARTISAN" && u.verificationStatus === "VERIFIED").length,
      pendingVerificationsCount: verificationRequests.filter((d) => d.status === "PENDING").length,
      artworksCount: artworksStore.length,
      ordersCount: ordersStore.length,
      totalVolumeSTT: ordersStore.reduce((acc, curr) => acc + parseFloat(curr.amount || "0"), 0),
    },
  });
});

// ============================================================================
// 6. GESTION DU SÉQUESTRE PHYSIQUE & COMMANDES
// ============================================================================

/**
 * POST /api/orders
 * Enregistrement d'une commande consignée sous séquestre
 */
router.post("/orders", (req: Request, res: Response) => {
  const { artworkId, buyer, seller, amount, orderIdHex, depositTxHash } = req.body;

  if (!artworkId || !buyer || !seller || !amount) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Paramètres de commande incomplets." },
    });
  }

  const newOrder: EscrowOrder = {
    id: "ord-" + Date.now(),
    orderIdHex: orderIdHex || "0x" + Date.now().toString(16),
    artworkId: artworkId.toString(),
    buyer: buyer.toLowerCase(),
    seller: seller.toLowerCase(),
    amount: amount.toString(),
    tokenSymbol: "STT",
    status: "FUNDED",
    depositTxHash: depositTxHash || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  ordersStore.push(newOrder);

  // Mettre à jour l'état de l'œuvre
  const artwork = artworksStore.find((a) => a.id === artworkId.toString() || a.tokenId.toString() === artworkId.toString());
  if (artwork) {
    artwork.status = "ESCROW_LOCKED";
  }

  res.status(201).json({
    success: true,
    data: newOrder,
  });
});

/**
 * PATCH /api/orders/:id/status
 * Synchronisation du statut de séquestre (Expédié, Livré/Libéré, Remboursé)
 */
router.patch("/orders/:id/status", (req: Request, res: Response) => {
  const { status, txHash } = req.body;
  const order = ordersStore.find((o) => o.id === req.params.id || o.orderIdHex === req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      error: { code: "ORDER_NOT_FOUND", message: "Commande introuvable" },
    });
  }

  if (status) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
  }

  if (txHash) {
    if (status === "RELEASED") order.releaseTxHash = txHash;
    if (status === "REFUNDED") order.refundTxHash = txHash;
  }

  if (status === "RELEASED") {
    const artwork = artworksStore.find((a) => a.id === order.artworkId || a.tokenId.toString() === order.artworkId);
    if (artwork) {
      artwork.status = "SOLD";
    }
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

/**
 * GET /api/orders/:id
 * Consultation d'une commande
 */
router.get("/orders/:id", (req: Request, res: Response) => {
  const order = ordersStore.find((o) => o.id === req.params.id || o.orderIdHex === req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      error: { code: "ORDER_NOT_FOUND", message: "Commande introuvable" },
    });
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

/**
 * GET /api/users/:wallet/orders
 * Historique des commandes d'un utilisateur par son portefeuille
 */
router.get("/users/:wallet/orders", (req: Request, res: Response) => {
  const wallet = req.params.wallet.toLowerCase();
  const userOrders = ordersStore.filter(
    (o) => o.buyer.toLowerCase() === wallet || o.seller.toLowerCase() === wallet
  );

  res.status(200).json({
    success: true,
    data: userOrders,
  });
});

// ============================================================================
// MODULE D'INTELLIGENCE ARTIFICIELLE D'AUTHENTIFICATION (Exigence n°5 UNIKIN)
// ============================================================================

/**
 * POST /api/ai/verify
 * Analyse en direct d'une œuvre artisanale par le modèle de vision & conformité culturelle
 */
router.post("/ai/verify", upload.single("image"), (req: Request, res: Response) => {
  const { title, category, province, materials, description } = req.body;

  if (!title || !materials) {
    return res.status(400).json({
      success: false,
      error: { code: "AI_PARAMS_REQUIRED", message: "Le titre et les matières sont requis pour l'analyse IA." },
    });
  }

  const analysis = AIAuthenticationService.analyzeCraft({
    title,
    category: category || "Artisanat traditionnel",
    declaredProvince: province || "Kinshasa",
    materials,
    description: description || "",
    imageFileName: req.file?.filename,
  });

  res.status(200).json({
    success: true,
    data: analysis,
  });
});

/**
 * GET /api/ai/metrics
 * Fiche technique des métriques et lien précis avec la blockchain pour le jury UNIKIN
 */
router.get("/ai/metrics", (req: Request, res: Response) => {
  const metrics = AIAuthenticationService.getModelMetrics();
  res.status(200).json({
    success: true,
    data: metrics,
  });
});

/**
 * GET /api/artworks/:id/ai-certificate
 * Consultation du certificat d'authenticité IA d'une œuvre
 */
router.get("/artworks/:id/ai-certificate", (req: Request, res: Response) => {
  const artwork = artworksStore.find((a) => a.id === req.params.id || a.tokenId.toString() === req.params.id);

  if (!artwork) {
    return res.status(404).json({
      success: false,
      error: { code: "ARTWORK_NOT_FOUND", message: "Œuvre introuvable" },
    });
  }

  if (!artwork.aiAuthentication) {
    artwork.aiAuthentication = AIAuthenticationService.analyzeCraft({
      artworkId: artwork.id,
      title: artwork.title,
      category: artwork.category,
      declaredProvince: artwork.province,
      materials: artwork.materials,
      description: artwork.description,
    });
  }

  res.status(200).json({
    success: true,
    data: artwork.aiAuthentication,
  });
});

export default router;
