export interface AICertificate {
  score: number;
  verdict: string;
  detectedProvince: string;
  culturalCanon: string;
  materialsVerified: boolean;
  anomalyRisk: "Très faible" | "Faible" | "Modéré";
  hash: string;
  model: string;
}

export interface NFTItem {
  id: string;
  tokenId: number;
  contractAddress: string;
  name: string;
  description: string;
  image: string;
  price: string; // in STT (Senda Test Token)
  priceWei: string;
  seller: string;
  artisanName: string;
  artisanProvince: string;
  artisanBio: string;
  artisanVerificationStatus: "Vérifié sur site" | "En attente" | "Certifié SENDA";
  royaltyBps: number;
  category: "Sculptures sur bois" | "Masques traditionnels" | "Textiles & Raphia" | "Bijouterie & Malachite" | "Vannerie d'art";
  materials: string;
  dimensions: string;
  weight: string;
  originRegion: string;
  yearCreated: number;
  ipfsImageUri: string;
  ipfsMetadataUri: string;
  escrowStatus: "DISPONIBLE" | "FONDS_BLOQUES" | "LIVRE";
  isListed: boolean;
  collectionName: string;
  traits: { trait_type: string; value: string | number }[];
  aiCertificate?: AICertificate;
}

export const CONGO_PROVINCES = [
  "Toutes les provinces",
  "Kwilu",
  "Grand Kasaï",
  "Haut-Katanga",
  "Kongo Central",
  "Sankuru",
  "Haut-Lomami",
  "Haut-Uele",
  "Kinshasa",
] as const;

export const SENDA_CATEGORIES = [
  "Toutes catégories",
  "Sculptures sur bois",
  "Masques traditionnels",
  "Textiles & Raphia",
  "Bijouterie & Malachite",
  "Vannerie d'art",
] as const;

export const INITIAL_DEMO_NFTS: NFTItem[] = [
  {
    id: "1",
    tokenId: 1,
    contractAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    name: "Masque Royal Pende — Mbuya",
    description: "Masque traditionnel d'initiation Mukanda sculpté à la main en bois de wengé noble, orné de fibres de raphia teintes aux pigments végétaux naturels de la forêt équatoriale du Kwilu. Pièce authentifiée et issue de l'atelier de maître Mukendi.",
    image: "/artworks/masque_pende.jpg",
    price: "180",
    priceWei: "180000000000000000000",
    seller: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    artisanName: "Maître Mukendi Kalonji",
    artisanProvince: "Kwilu",
    artisanBio: "Maître sculpteur Pende depuis 28 ans à Gungu, reconnu par la corporation des artisans du Grand Bandundu pour la préservation des rituels Mukanda.",
    artisanVerificationStatus: "Certifié SENDA",
    royaltyBps: 500, // 5%
    collectionName: "Héritage Pende Sacré",
    category: "Masques traditionnels",
    materials: "Bois de wengé, fibres de raphia peignées, kaolin naturel, graines sauvages",
    dimensions: "38 x 24 x 18 cm",
    weight: "1.35 kg",
    originRegion: "Gungu, Province du Kwilu",
    yearCreated: 2026,
    ipfsImageUri: "ipfs://bafybeicpende7v6imagehashcid001/masque_pende.jpg",
    ipfsMetadataUri: "ipfs://bafybeihsendapende001metadatajsoncid/metadata.json",
    escrowStatus: "DISPONIBLE",
    isListed: true,
    traits: [
      { trait_type: "Ethnie", value: "Pende" },
      { trait_type: "Province", value: "Kwilu" },
      { trait_type: "Matière", value: "Bois de wengé" },
      { trait_type: "Usage rituel", value: "Mukanda" },
      { trait_type: "Certification", value: "Audité sur site SENDA" },
      { trait_type: "Score IA Authenticité", value: "97.4%" },
    ],
    aiCertificate: {
      score: 97.4,
      verdict: "Authentique — Conforme aux canons artistiques du Kwilu",
      detectedProvince: "Kwilu",
      culturalCanon: "Canon initiatique Mukanda (Pende / Gungu)",
      materialsVerified: true,
      anomalyRisk: "Très faible",
      hash: "0x8f2a6b31e9c20a4b7d51928374e6f1029384756102938475610293847561a01b",
      model: "SendaVision-ConvNet v1.2",
    },
  },
  {
    id: "2",
    tokenId: 2,
    contractAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    name: "Statuette Tshokwe — Héros Chibinda Ilunga",
    description: "Représentation majestueuse du chasseur royal Chibinda Ilunga, incarnation de la puissance et de la noblesse dans la cosmologie Tshokwe. Sculptée dans une racine d'iroko séchée, patine brune sombre obtenue par friction d'huiles végétales ancestrales.",
    image: "/artworks/statuette_tshokwe.jpg",
    price: "320",
    priceWei: "320000000000000000000",
    seller: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    artisanName: "Papa Tshimanga Kabemba",
    artisanProvince: "Grand Kasaï",
    artisanBio: "Atelier familial de sculpture statuaire à Tshikapa, perpétuant l'art des cours royales Tshokwe et Lunda avec patines rituelles lustrées.",
    artisanVerificationStatus: "Certifié SENDA",
    royaltyBps: 700, // 7%
    collectionName: "Dynastie & Statuaire Tshokwe",
    category: "Sculptures sur bois",
    materials: "Bois d'iroko, patine aux huiles naturelles, clous et filigranes en laiton forgé",
    dimensions: "45 x 16 x 14 cm",
    weight: "2.10 kg",
    originRegion: "Tshikapa, Kasaï",
    yearCreated: 2026,
    ipfsImageUri: "ipfs://bafybeictshokweimagehashcid002/statuette_chibinda.jpg",
    ipfsMetadataUri: "ipfs://bafybeihsendatshokwe002metadatajsoncid/metadata.json",
    escrowStatus: "DISPONIBLE",
    isListed: true,
    traits: [
      { trait_type: "Ethnie", value: "Tshokwe" },
      { trait_type: "Province", value: "Grand Kasaï" },
      { trait_type: "Matière", value: "Bois d'iroko & Laiton" },
      { trait_type: "Époque d'inspiration", value: "XVIIIe siècle" },
      { trait_type: "Certification", value: "Vérifié sur site" },
      { trait_type: "Score IA Authenticité", value: "96.8%" },
    ],
    aiCertificate: {
      score: 96.8,
      verdict: "Authentique — Statuaire dynastique Tshokwe certifiée",
      detectedProvince: "Grand Kasaï",
      culturalCanon: "Canon royal Chibinda Ilunga (Tshikapa)",
      materialsVerified: true,
      anomalyRisk: "Très faible",
      hash: "0x4b7c19283e5a0f2b8c9d1029384756102938475610293847561029384756b02c",
      model: "SendaVision-ConvNet v1.2",
    },
  },
  {
    id: "3",
    tokenId: 3,
    contractAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    name: "Tapis Velours du Kasaï — Shoowa Royal",
    description: "Pièce textile d'apparat exceptionnelle brodée au point de velours coupé sur toile de fond en raphia peigné. Les motifs géométriques asymétriques constituent un langage visuel non verbal transmis entre femmes artisanes depuis des générations.",
    image: "/artworks/textile_shoowa.jpg",
    price: "240",
    priceWei: "240000000000000000000",
    seller: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    artisanName: "Coopérative Maman Bikale",
    artisanProvince: "Grand Kasaï",
    artisanBio: "Collectif de 14 brodeuses traditionnelles du royaume Kuba (Mweka), œuvrant pour l'émancipation économique féminine et la sauvegarde textile.",
    artisanVerificationStatus: "Certifié SENDA",
    royaltyBps: 500, // 5%
    collectionName: "Textiles Royaux Kuba",
    category: "Textiles & Raphia",
    materials: "Fibre de palmier raphia vinifera, teintures végétales à base d'écorce de tukula et kaolin",
    dimensions: "62 x 58 cm",
    weight: "0.65 kg",
    originRegion: "Mweka, Kasaï",
    yearCreated: 2026,
    ipfsImageUri: "ipfs://bafybeicshoowaimagehashcid003/velours_shoowa.jpg",
    ipfsMetadataUri: "ipfs://bafybeihsendashoowa003metadatajsoncid/metadata.json",
    escrowStatus: "DISPONIBLE",
    isListed: true,
    traits: [
      { trait_type: "Tradition", value: "Kuba / Shoowa" },
      { trait_type: "Province", value: "Grand Kasaï" },
      { trait_type: "Matière", value: "Raphia & Teintures végétales" },
      { trait_type: "Durée de tissage", value: "6 semaines" },
      { trait_type: "Certification", value: "Coopérative auditée" },
      { trait_type: "Score IA Authenticité", value: "98.1%" },
    ],
    aiCertificate: {
      score: 98.1,
      verdict: "Authentique — Broderie raphia géométrique Shoowa certifiée",
      detectedProvince: "Grand Kasaï",
      culturalCanon: "Canon textile royal Bakuba / Shoowa",
      materialsVerified: true,
      anomalyRisk: "Très faible",
      hash: "0x19283e5a0f2b8c9d10293847561029384756102938475610293847561a3d03e",
      model: "SendaVision-ConvNet v1.2",
    },
  },
  {
    id: "4",
    tokenId: 4,
    contractAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    name: "Pectoral Cérémoniel en Malachite Polie",
    description: "Parure d'exception taillée dans un bloc massif de malachite veinée du Katanga, rehaussée de fils de cuivre rouge martelé à froid selon la tradition des maîtres métallurgistes Yeke.",
    image: "/artworks/bijou_malachite.jpg",
    price: "410",
    priceWei: "410000000000000000000",
    seller: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    artisanName: "Atelier Ilunga & Frères",
    artisanProvince: "Haut-Katanga",
    artisanBio: "Lapidaires d'art et artisans joailliers à Lubumbashi, spécialisés dans la taille et la valorisation éthique des minéraux précieux du Congo.",
    artisanVerificationStatus: "Certifié SENDA",
    royaltyBps: 600, // 6%
    collectionName: "Trésors Minéraux du Katanga",
    category: "Bijouterie & Malachite",
    materials: "Malachite naturelle zonée qualité AAA, cuivre rouge électrolytique martelé",
    dimensions: "18 x 14 x 3 cm",
    weight: "0.95 kg",
    originRegion: "Lubumbashi, Haut-Katanga",
    yearCreated: 2026,
    ipfsImageUri: "ipfs://bafybeicmalachiteimagehashcid004/pectoral_malachite.jpg",
    ipfsMetadataUri: "ipfs://bafybeihsendamalachite004metadatajsoncid/metadata.json",
    escrowStatus: "DISPONIBLE",
    isListed: true,
    traits: [
      { trait_type: "Minéral", value: "Malachite naturelle zonée" },
      { trait_type: "Métal", value: "Cuivre rouge martelé" },
      { trait_type: "Province", value: "Haut-Katanga" },
      { trait_type: "Certification", value: "Audit minéralogique SENDA" },
      { trait_type: "Score IA Authenticité", value: "95.9%" },
    ],
    aiCertificate: {
      score: 95.9,
      verdict: "Authentique — Lapidaire malachite pure du Katanga certifié",
      detectedProvince: "Haut-Katanga",
      culturalCanon: "Orfèvrerie et taille de malachite de Lubumbashi",
      materialsVerified: true,
      anomalyRisk: "Très faible",
      hash: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f04a",
      model: "SendaVision-ConvNet v1.2",
    },
  },
  {
    id: "5",
    tokenId: 5,
    contractAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    name: "Panier d'Art Tressé — Panier Kongo",
    description: "Vannerie fine à double paroi tressée avec des fibres de lianes sauvages du Mayombe. Utilisé historiquement pour la conservation des herbes médicinales et des objets précieux dans les chefferies du Kongo Central.",
    image: "/artworks/panier_kongo.jpg",
    price: "120",
    priceWei: "120000000000000000000",
    seller: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    artisanName: "Mama Nsimba Nzuzi",
    artisanProvince: "Kongo Central",
    artisanBio: "Maîtresse vannière à Mbanza-Ngungu, formatrice de jeunes apprenties pour la sauvegarde du patrimoine et du tissage spiralé Kongo.",
    artisanVerificationStatus: "Certifié SENDA",
    royaltyBps: 500, // 5%
    collectionName: "Vannerie du Royaume Kongo",
    category: "Vannerie d'art",
    materials: "Lianes de rotin, fibres de bambou sauvage, cire d'abeille protectrice naturelle",
    dimensions: "30 x 30 x 25 cm",
    weight: "0.48 kg",
    originRegion: "Mbanza-Ngungu, Kongo Central",
    yearCreated: 2026,
    ipfsImageUri: "ipfs://bafybeicpanierkongoimagehashcid005/panier_kongo.jpg",
    ipfsMetadataUri: "ipfs://bafybeihsendapanier005metadatajsoncid/metadata.json",
    escrowStatus: "DISPONIBLE",
    isListed: true,
    traits: [
      { trait_type: "Culture", value: "Bakongo" },
      { trait_type: "Province", value: "Kongo Central" },
      { trait_type: "Technique", value: "Tressage spiralé serré" },
      { trait_type: "Certification", value: "Certifié SENDA" },
    ],
  },
  {
    id: "6",
    tokenId: 6,
    contractAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    name: "Coupe Cérémonielle Céphalomorphe Bakuba",
    description: "Coupe en bois précieux sculptée en forme de tête humaine stylisée avec scarifications frontales et coiffe royale. Utilisée lors des libations d'intronisation dans la région du Sankuru.",
    image: "/artworks/coupe_bakuba.jpg",
    price: "290",
    priceWei: "290000000000000000000",
    seller: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
    artisanName: "Maître Bope Mikobi",
    artisanProvince: "Sankuru",
    artisanBio: "Descendant de la lignée des sculpteurs de cour du Sankuru, perpétuant les décors géométriques imbalembale et les coupes de dignitaires.",
    artisanVerificationStatus: "Certifié SENDA",
    royaltyBps: 500, // 5%
    collectionName: "Arts Cérémoniels Bakuba",
    category: "Sculptures sur bois",
    materials: "Bois d'ébène du Gabon, patine rituelle lustrée, huile de palme rouge",
    dimensions: "26 x 15 x 14 cm",
    weight: "0.85 kg",
    originRegion: "Lodja, Sankuru",
    yearCreated: 2026,
    ipfsImageUri: "ipfs://bafybeiccoupebakubaimagehashcid006/coupe_bakuba.jpg",
    ipfsMetadataUri: "ipfs://bafybeihsendabakuba006metadatajsoncid/metadata.json",
    escrowStatus: "DISPONIBLE",
    isListed: true,
    traits: [
      { trait_type: "Ethnie", value: "Bakuba" },
      { trait_type: "Province", value: "Sankuru" },
      { trait_type: "Matière", value: "Ébène & Patine rituelle" },
      { trait_type: "Certification", value: "Certifié SENDA" },
    ],
  },
  {
    id: "7",
    tokenId: 7,
    contractAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    name: "Statue Porteuse de Coupe — Luba Shankadi",
    description: "Sculpture sacrée féminine incarnant la lignée et la clairvoyance des devins de la confrérie Mbudye. La figure féminine tient la coupe d'offrandes rituelles (Kabila) ornée de scarifications abdominales royales.",
    image: "/artworks/statue_luba.jpg",
    price: "340",
    priceWei: "340000000000000000000",
    seller: "0x00a329c0648769A73afAc7F9381E08FB43dBEA72",
    artisanName: "Maître Kasongo Ilunga",
    artisanProvince: "Haut-Lomami",
    artisanBio: "Sculpteur traditionnel issu de l'école de la chefferie Shankadi à Kamina, gardien des répertoires symboliques Luba.",
    artisanVerificationStatus: "Certifié SENDA",
    royaltyBps: 600, // 6%
    collectionName: "Statuaire Royale Luba",
    category: "Sculptures sur bois",
    materials: "Bois dur de mulondo, perles de traite bleues, patine d'huile sacrée",
    dimensions: "42 x 18 x 16 cm",
    weight: "1.75 kg",
    originRegion: "Kamina, Haut-Lomami",
    yearCreated: 2026,
    ipfsImageUri: "ipfs://bafybeiclubaimagehashcid007/statue_luba.jpg",
    ipfsMetadataUri: "ipfs://bafybeihsendaluba007metadatajsoncid/metadata.json",
    escrowStatus: "DISPONIBLE",
    isListed: true,
    traits: [
      { trait_type: "Ethnie", value: "Luba Shankadi" },
      { trait_type: "Province", value: "Haut-Lomami" },
      { trait_type: "Usage rituel", value: "Confrérie Mbudye" },
      { trait_type: "Certification", value: "Certifié SENDA" },
    ],
  },
  {
    id: "8",
    tokenId: 8,
    contractAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    name: "Tabouret Royal d'Apparat — Mangbetu",
    description: "Siège de dignitaire monoxyle sculpté d'un seul tenant dans une pièce d'iroko sélectionnée. Les surfaces supérieures et les montants circulaires sont gravés de motifs géométriques et pyrogravés selon l'art de cour Mangbetu.",
    image: "/artworks/tabouret_mangbetu.jpg",
    price: "460",
    priceWei: "460000000000000000000",
    seller: "0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF",
    artisanName: "Atelier Royal Ndeye",
    artisanProvince: "Haut-Uele",
    artisanBio: "Ébénisterie d'art traditionnel à Isiro perpétuant le mobilier de chefferie et les assises protocolaires de la cour Mangbetu.",
    artisanVerificationStatus: "Certifié SENDA",
    royaltyBps: 700, // 7%
    collectionName: "Mobilier de Cour Mangbetu",
    category: "Sculptures sur bois",
    materials: "Bois d'iroko massif, pyrogravure traditionnelle, cire végétale",
    dimensions: "52 x 34 x 30 cm",
    weight: "3.40 kg",
    originRegion: "Isiro, Haut-Uele",
    yearCreated: 2026,
    ipfsImageUri: "ipfs://bafybeicmangbetuimagehashcid008/tabouret_mangbetu.jpg",
    ipfsMetadataUri: "ipfs://bafybeihsendamangbetu008metadatajsoncid/metadata.json",
    escrowStatus: "DISPONIBLE",
    isListed: true,
    traits: [
      { trait_type: "Peuple", value: "Mangbetu" },
      { trait_type: "Province", value: "Haut-Uele" },
      { trait_type: "Fonction", value: "Siège royal d'apparat" },
      { trait_type: "Certification", value: "Certifié SENDA" },
    ],
  },
];
