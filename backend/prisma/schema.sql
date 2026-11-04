-- ============================================================================
-- SENDA MARKETPLACE — DÉPLOIEMENT POSTGRESQL (DDL & INITIALISATION)
-- Conforme Prisma ORM & Schéma de Données Officiel SENDA 2026
-- Compatible avec Neon, Supabase, Railway, Render, Aiven, AWS RDS, etc.
-- ============================================================================

-- 1. Énumérations
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('VISITOR', 'BUYER', 'ARTISAN', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ArtworkStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'RESERVED', 'SOLD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "OrderStatus" AS ENUM ('INITIALIZED', 'FUNDED', 'SHIPPED', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EscrowStatus" AS ENUM ('CREATED', 'FUNDED', 'RELEASED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Tables Principales

-- Table des Utilisateurs & Maîtres Artisans
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "display_name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'BUYER',
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "bio" TEXT,
    "location_province" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Table des Catégories Culturelles d'Artisanat
CREATE TABLE IF NOT EXISTS "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- Table des Œuvres d'Art & Pièces Uniques
CREATE TABLE IF NOT EXISTS "artworks" (
    "id" TEXT NOT NULL,
    "artisan_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(18,4) NOT NULL,
    "token_symbol" TEXT NOT NULL DEFAULT 'STT',
    "ipfs_image_uri" TEXT,
    "ipfs_metadata_uri" TEXT,
    "materials" TEXT,
    "dimensions" TEXT,
    "origin_region" TEXT,
    "status" "ArtworkStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artworks_pkey" PRIMARY KEY ("id")
);

-- Table des Certificats d'Authenticité Numériques (NFTs ERC-721)
CREATE TABLE IF NOT EXISTS "nft_records" (
    "id" TEXT NOT NULL,
    "artwork_id" TEXT NOT NULL,
    "contract_address" TEXT NOT NULL,
    "token_id" DECIMAL(78,0) NOT NULL,
    "network" TEXT NOT NULL DEFAULT 'polygon-amoy',
    "mint_tx_hash" TEXT,
    "minted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nft_records_pkey" PRIMARY KEY ("id")
);

-- Table des Commandes & Transactions
CREATE TABLE IF NOT EXISTS "orders" (
    "id" TEXT NOT NULL,
    "artwork_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "payment_token" TEXT NOT NULL DEFAULT 'STT',
    "status" "OrderStatus" NOT NULL DEFAULT 'INITIALIZED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- Table du Protocole de Séquestre Conditionnel (SendaEscrow)
CREATE TABLE IF NOT EXISTS "escrow_records" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "contract_address" TEXT NOT NULL,
    "escrow_status" "EscrowStatus" NOT NULL DEFAULT 'CREATED',
    "deposit_tx_hash" TEXT,
    "release_tx_hash" TEXT,
    "deposited_at" TIMESTAMP(3),
    "released_at" TIMESTAMP(3),

    CONSTRAINT "escrow_records_pkey" PRIMARY KEY ("id")
);

-- 3. Index Uniques
CREATE UNIQUE INDEX IF NOT EXISTS "users_wallet_address_key" ON "users"("wallet_address");
CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_key" ON "categories"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_key" ON "categories"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "nft_records_artwork_id_key" ON "nft_records"("artwork_id");
CREATE UNIQUE INDEX IF NOT EXISTS "escrow_records_order_id_key" ON "escrow_records"("order_id");

-- 4. Contraintes de Clés Étrangères (Foreign Keys)
DO $$ BEGIN
    ALTER TABLE "artworks" ADD CONSTRAINT "artworks_artisan_id_fkey" FOREIGN KEY ("artisan_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "artworks" ADD CONSTRAINT "artworks_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "nft_records" ADD CONSTRAINT "nft_records_artwork_id_fkey" FOREIGN KEY ("artwork_id") REFERENCES "artworks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "orders" ADD CONSTRAINT "orders_artwork_id_fkey" FOREIGN KEY ("artwork_id") REFERENCES "artworks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "orders" ADD CONSTRAINT "orders_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "escrow_records" ADD CONSTRAINT "escrow_records_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Données Initiales (Seed des Catégories de RDC)
INSERT INTO "categories" ("id", "name", "slug", "description")
VALUES 
    ('cat-masques', 'Masques traditionnels', 'masques', 'Masques cérémoniels, initiatiques et rituels (Pende, Kuba, Tshokwe, Songye).'),
    ('cat-sculptures', 'Statuettes & Sculptures', 'sculptures', 'Sculptures sacrées en bois nobles et statues d’ancêtres (Luba, Hemba, Kongo).'),
    ('cat-textiles', 'Textiles & Velours Shoowa', 'textiles', 'Tissages traditionnels en raphia brodé aux motifs géométriques Kuba.'),
    ('cat-vannerie', 'Vannerie & Céramiques du Kwilu', 'vannerie', 'Paniers d’apparat, poteries utilitaires et récipients rituels en terre cuite.'),
    ('cat-bijoux', 'Bijoux & Pectoraux en Malachite', 'bijoux', 'Parures en malachite du Katanga, perles de cuivre et colliers royaux.')
ON CONFLICT ("name") DO NOTHING;
