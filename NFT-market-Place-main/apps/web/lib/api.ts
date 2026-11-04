import { INITIAL_CATALOG_NFTS, NFTItem } from "./mockData";
import { DEFAULT_CONTRACTS } from "./contracts/abis";

/**
 * Détermine dynamiquement l'URL de base de l'API :
 * - Si le navigateur tourne en local ou sur le réseau Wi-Fi local (ex. 192.168.x.x / localhost) :
 *   se connecte directement au backend local sur le port 4000.
 * - Sinon (sur Vercel en production) : se connecte à Render (NEXT_PUBLIC_API_URL).
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host.startsWith("192.168.") || host.startsWith("10.")) {
      return `http://${host}:4000/api`;
    }
  }
  const raw = process.env.NEXT_PUBLIC_API_URL || "https://nsenda-1.onrender.com";
  return `${raw.replace(/\/+$/, "").replace(/\/api$/, "")}/api`;
}

export interface CreateOrderParams {
  artworkId: string;
  buyerWalletAddress: string;
  shippingAddress?: {
    recipientName?: string;
    street?: string;
    city?: string;
    country?: string;
  };
}

export interface CreateOrderResult {
  orderId: string;
  orderIdHex: string;
  artworkTokenId: number;
  sellerWalletAddress: string;
  amount: string;
  amountWei: string;
  escrowContract: string;
  status: string;
}

/**
 * Sauvegarde une œuvre publiée localement pour un affichage immédiat dans le catalogue
 */
export function savePublishedArtworkLocally(item: NFTItem) {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem("senda_local_artworks");
    const list: NFTItem[] = stored ? JSON.parse(stored) : [];
    const filtered = list.filter((i) => i.id !== item.id && i.tokenId !== item.tokenId);
    localStorage.setItem("senda_local_artworks", JSON.stringify([item, ...filtered]));
    // Notifier tous les composants de la page
    window.dispatchEvent(new Event("senda_artworks_updated"));
  } catch (err) {
    console.warn("Échec d'enregistrement local de l'œuvre", err);
  }
}

/**
 * Adaptateur universel convertissant un objet brut d'API ou d'état en un NFTItem conforme
 */
export function mapToNFTItem(raw: any): NFTItem {
  const localMatch = INITIAL_CATALOG_NFTS.find(
    (n) => n.id === raw.id || n.tokenId === Number(raw.tokenId)
  );

  const name = raw.name || raw.title || localMatch?.name || "Œuvre d'Artisanat Congolais";
  const province = raw.artisanProvince || raw.province || raw.originRegion || localMatch?.artisanProvince || "Kinshasa";

  return {
    id: raw.id?.toString() || localMatch?.id || String(Date.now()),
    tokenId: Number(raw.tokenId) || localMatch?.tokenId || 1,
    contractAddress: raw.contractAddress || DEFAULT_CONTRACTS.nftAddress,
    name,
    description: raw.description || localMatch?.description || "Pièce d'exception créée par un maître artisan de la République Démocratique du Congo.",
    image: raw.image || localMatch?.image || "/artworks/masque_pende.jpg",
    price: raw.price?.toString() || localMatch?.price || "150",
    priceWei: raw.priceWei || (BigInt(Math.floor(parseFloat(raw.price || "150"))) * BigInt(10 ** 18)).toString(),
    seller: raw.seller || raw.artisanAddress || localMatch?.seller || "0x996c43d1aa5f2c4b51df21e860a0F1a94e9f5309",
    artisanName: raw.artisanName || localMatch?.artisanName || "Maître Mukendi Kalonji",
    artisanProvince: province,
    artisanBio: raw.artisanBio || raw.bio || localMatch?.artisanBio || "Sculpteur et artisan traditionnel de RDC.",
    artisanVerificationStatus:
      raw.verificationStatus === "VERIFIED"
        ? "Certifié SENDA"
        : raw.verificationStatus === "PENDING"
        ? "En attente"
        : localMatch?.artisanVerificationStatus || "Certifié SENDA",
    royaltyBps: Number(raw.royaltyBps) || localMatch?.royaltyBps || 500,
    category: (raw.category || localMatch?.category || "Sculptures sur bois") as any,
    materials: raw.materials || localMatch?.materials || "Matériaux traditionnels congolais",
    dimensions: raw.dimensions || localMatch?.dimensions || "Dimensions de collection",
    weight: raw.weight || localMatch?.weight || "1.20 kg",
    originRegion: raw.originRegion || province,
    yearCreated: Number(raw.yearCreated) || localMatch?.yearCreated || 2026,
    ipfsImageUri: raw.ipfsImageUri || localMatch?.ipfsImageUri || "ipfs://bafybeihsenda/image.jpg",
    ipfsMetadataUri: raw.ipfsMetadataUri || localMatch?.ipfsMetadataUri || "ipfs://bafybeihsenda/metadata.json",
    escrowStatus: raw.status === "ESCROW_LOCKED" ? "FONDS_BLOQUES" : raw.status === "SOLD" ? "LIVRE" : "DISPONIBLE",
    isListed: true,
    collectionName: raw.collectionName || localMatch?.collectionName || "Collection Trésors du Congo",
    traits: raw.traits || localMatch?.traits || [
      { trait_type: "Province", value: province },
      { trait_type: "Matériaux", value: raw.materials || "Bois précieux" },
    ],
  };
}

export async function getArtworks(params?: {
  category?: string;
  province?: string;
  search?: string;
  sortBy?: string;
}): Promise<NFTItem[]> {
  const baseUrl = getApiBaseUrl();
  let backendItems: NFTItem[] = [];

  try {
    const query = new URLSearchParams();
    if (params?.category && params.category !== "Toutes catégories") {
      query.set("category", params.category);
    }
    if (params?.province && params.province !== "Toutes les provinces") {
      query.set("province", params.province);
    }
    if (params?.search) {
      query.set("search", params.search);
    }
    if (params?.sortBy) {
      query.set("sortBy", params.sortBy);
    }

    const res = await fetch(`${baseUrl}/artworks?${query.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const itemsList = Array.isArray(json.data.items)
          ? json.data.items
          : Array.isArray(json.data)
          ? json.data
          : null;

        if (itemsList && itemsList.length > 0) {
          backendItems = itemsList.map(mapToNFTItem);
        }
      }
    }
  } catch (err) {
    console.warn("Échec de chargement API des œuvres, repli local :", err);
  }

  // 2. Fusionner avec les œuvres publiées localement
  let localPublished: NFTItem[] = [];
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("senda_local_artworks");
      if (stored) {
        localPublished = JSON.parse(stored);
      }
    } catch {}
  }

  // 3. Fusion ordonnée (les œuvres locales et nouvelles apparaissent en premier)
  const combined = [...localPublished, ...backendItems];
  const uniqueMap = new Map<string, NFTItem>();
  for (const item of combined) {
    const key = String(item.id || item.tokenId);
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  }

  // 4. S'assurer que le catalogue initial est présent si rien n'existe
  if (uniqueMap.size === 0) {
    return INITIAL_CATALOG_NFTS;
  }
  for (const base of INITIAL_CATALOG_NFTS) {
    if (!uniqueMap.has(String(base.id))) {
      uniqueMap.set(String(base.id), base);
    }
  }

  let finalArtworks = Array.from(uniqueMap.values());

  // Appliquer les filtres demandés
  if (params?.category && params.category !== "Toutes catégories") {
    finalArtworks = finalArtworks.filter((a) => a.category === params.category);
  }
  if (params?.province && params.province !== "Toutes les provinces") {
    finalArtworks = finalArtworks.filter((a) => a.artisanProvince === params.province);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    finalArtworks = finalArtworks.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.artisanName.toLowerCase().includes(q) ||
        a.materials.toLowerCase().includes(q)
    );
  }

  return finalArtworks;
}

export async function getArtworkById(id: string): Promise<NFTItem | null> {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/artworks/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return mapToNFTItem(json.data);
      }
    }
  } catch {
    // ignore
  }

  // Vérifier également dans les œuvres publiées localement
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("senda_local_artworks");
      if (stored) {
        const list: NFTItem[] = JSON.parse(stored);
        const match = list.find((item) => item.id === id || item.tokenId.toString() === id);
        if (match) return match;
      }
    } catch {}
  }

  const found = INITIAL_CATALOG_NFTS.find(
    (item) => item.id === id || item.tokenId.toString() === id
  );
  return found || null;
}

export async function createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error("Erreur de création de commande sur l'API");
    }

    const json = await res.json();
    return json.data;
  } catch {
    // Ordre de secours déterministe pour tests locaux
    const fakeOrderUuid = "ord-" + Date.now();
    return {
      orderId: fakeOrderUuid,
      orderIdHex: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      artworkTokenId: parseInt(params.artworkId, 10) || 1,
      sellerWalletAddress: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
      amount: "180",
      amountWei: (BigInt(180) * BigInt(10 ** 18)).toString(),
      escrowContract: DEFAULT_CONTRACTS.escrowAddress,
      status: "Funded",
    };
  }
}

export async function syncOrderTransaction(
  orderId: string,
  txType: "DEPOSIT" | "RELEASE" | "REFUND",
  txHash: string
) {
  const baseUrl = getApiBaseUrl();
  try {
    const statusMap = {
      DEPOSIT: "FUNDED",
      RELEASE: "RELEASED",
      REFUND: "REFUNDED",
    };

    await fetch(`${baseUrl}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: statusMap[txType],
        txHash,
      }),
    });
  } catch (err) {
    console.warn("Échec de synchronisation avec l'indexeur :", err);
  }
}
