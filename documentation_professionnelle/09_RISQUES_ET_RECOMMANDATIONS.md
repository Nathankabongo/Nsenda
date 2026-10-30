# SENDA — GESTION DES RISQUES & RECOMMANDATIONS STRATÉGIQUES
**Analyse des Vulnérabilités, Limites Intrinsèques et Plan de Mitigation**  
**Projet :** SENDA — Marketplace décentralisée de l'artisanat congolais  
**Version :** 1.0 — Cadre de Gestion des Risques  
**Document source :** `PLANSENDA.pdf`  
**Auteurs :** Équipe Projet SENDA (Groupe 02 — Master 1 Informatique)  

---

## 1. Cartographie et matrice des risques

L'ingénierie d'une place de marché décentralisée connectée à des biens physiques fait émerger des défis complexes situés à l'intersection du monde matériel et de la blockchain :

```mermaid
quadrantChart
    title Matrice des Risques du Projet SENDA
    x-axis Faible Impact --> Fort Impact
    y-axis Faible Probabilité --> Forte Probabilité
    quadrant-1 Risques Critiques (Surveillance immédiate)
    quadrant-2 Risques Opérationnels (Plans de mitigation)
    quadrant-3 Risques Mineurs (Tolérance)
    quadrant-4 Risques Majeurs Latents (Architecture défensive)
    
    "R-01 Décorrélation physique/NFT": [0.85, 0.75]
    "R-02 Acheteur ne validant pas le séquestre": [0.70, 0.80]
    "R-03 Rupture de disponibilité IPFS": [0.65, 0.40]
    "R-04 Vulnérabilité réentrance Smart Contract": [0.90, 0.20]
    "R-05 Fuite de données personnelles on-chain": [0.80, 0.30]
    "R-06 Instabilité RPC testnet Polygon Amoy": [0.45, 0.65]
    "R-07 Fracture numérique des artisans": [0.75, 0.85]
```

---

## 2. Analyse détaillée des risques critiques et plans de mitigation

### 2.1. Risque R-01 : Décorrélation entre l'actif physique et le certificat NFT
* **Description du risque :** Un jeton NFT garantit la provenance cryptographique et l'intégrité de ses métadonnées on-chain, mais **il ne garantit en aucun cas qu'une statuette en bois physique envoyée par la poste est authentique**, qu'elle a été sculptée par l'artisan prétendu ou qu'elle n'est pas une réplique industrielle.
* **Impact :** Critique. Perte totale de réputation et de crédibilité du label SENDA.
* **Plan de mitigation :**
  1. **Audit préalable des artisans :** N'accorder le rôle de publication certifiée qu'après un contrôle documentaire et une visite d'atelier par un agent SENDA (attribution du statut `isVerified = true`).
  2. **Marquage physique de sécurité (Post-MVP) :** Associer l'œuvre physique à un scellé inviolable ou une puce NFC cryptographique gravée contenant la signature de l'artisan et l'ID du jeton.
  3. **Transparence visuelle dans l'UI :** L'interface doit clairement distinguer « Données déclarées par l'artisan », « Contrôle atelier réalisé par SENDA » et « Enregistrement on-chain ».

### 2.2. Risque R-02 : Asymétrie et blocage des fonds dans le contrat de séquestre (*Deadlock*)
* **Description du risque :** 
  * Cas A : L'artisan expédie l'œuvre, le colis est bien livré, mais l'acheteur néglige ou refuse délibérément de cliquer sur « Confirmer la réception », maintenant les fonds indéfiniment bloqués dans le smart contract.
  * Cas B : L'acheteur dépose les fonds, mais l'artisan n'expédie jamais le colis.
* **Impact :** Élevé. Spoliation de l'artisan ou de l'acheteur, insatisfaction client majeure.
* **Plan de mitigation technique dans `SendaEscrow.sol` :**
  1. **Mécanisme de délai de forclusion automatique (*Escrow Timeout*) :** Si après un délai contractuel prédéfini (ex: 21 jours après le passage à `Funded`) aucune contestation n'a été émise par l'acheteur, l'artisan peut déclencher un retrait automatique avec preuve d'expédition.
  2. **Rôle d'arbitre tiers multi-signature (*Dispute Resolution*) :** En cas de litige signalé, l'administrateur SENDA peut intervenir pour valider le remboursement de l'acheteur (`refundBuyer`) ou la libération forcée au vendeur sur présentation du bordereau de livraison signé.

### 2.3. Risque R-03 : Indisponibilité et perte des médias hébergés sur IPFS
* **Description du risque :** Contrairement à la croyance populaire, IPFS n'est pas un système de sauvegarde magique et perpétuel. Si le nœud hébergeant le fichier s'éteint et que personne d'autre ne le pinne, le lien devient mort (*broken link*).
* **Impact :** Élevé. La fiche produit et le certificat NFT perdent leur visuel.
* **Plan de mitigation :**
  1. **Abonnement de Pinning professionnel (Pinata) :** Inscrire l'infrastructure sur un compte payant avec garantie de disponibilité (*SLA*).
  2. **Archivage miroir off-chain :** Conserver systématiquement une copie de secours chiffrée de toutes les photographies dans le stockage d'objets du backend (S3 / MinIO).
  3. **Passerelles IPFS résilientes :** Configurer le frontend pour tester plusieurs passerelles en cascade (Passerelle dédiée Pinata -> Cloudflare IPFS -> `ipfs.io`).

### 2.4. Risque R-04 : Vulnérabilités de sécurité des Smart Contracts
* **Description du risque :** Vulnérabilités d'exécution réentrante, manipulation de prix, blocage de gaz lors de boucles de transfert, ou contournement des restrictions de rôles.
* **Impact :** Critique. Vol des fonds consignés dans le séquestre.
* **Plan de mitigation :**
  1. **Respect strict des standards éprouvés :** Utilisation exclusive des briques d'OpenZeppelin v5 (`ReentrancyGuard`, `SafeERC20`, `Ownable`).
  2. **Patron Checks-Effects-Interactions :** Toujours mettre à jour l'état de la commande à `Released` ou `Refunded` **avant** d'émettre l'ordre de transfert des jetons.
  3. **Audit statique Slither :** Exécution automatisée dans la chaîne CI/CD pour interdire tout commit introduisant un avertissement de haute sévérité.
  4. **Plafond de redevances et de frais :** Bloquer contractuellement les taux de royalties à un maximum de 10% pour interdire tout siphonage abusif.

### 2.5. Risque R-05 : Violation de la confidentialité et inscription de données personnelles (RGPD / Vie Privée)
* **Description du risque :** Enregistrer l'adresse physique du domicile de l'acheteur, son nom complet ou son numéro de téléphone sur la blockchain ou dans le fichier JSON public sur IPFS.
* **Impact :** Élevé. Violation flagrante des principes de protection des données personnelles, impossibilité légale d'exercer le "droit à l'oubli" sur un registre immuable.
* **Plan de mitigation :**
  1. **Sanctuaire étanche off-chain :** Les adresses postales de livraison et coordonnées de contact sont stockées **exclusivement dans la base relationnelle PostgreSQL chiffrée au repos**.
  2. **Zéro PII on-chain :** Aucun paramètre de smart contract ne doit accepter de données identifiantes civiles. Les transactions n'échangent que des UUID anonymisés et des adresses de portefeuilles pseudomorphes.

### 2.6. Risque R-06 : Fracture numérique et adoption par les artisans congolais
* **Description du risque :** Complexité perçue du Web3 (clés privées, MetaMask, gaz en POL/MATIC) rebutant les maîtres artisans de Kinshasa ou des provinces.
* **Impact :** Élevé. Manque de catalogue d'œuvres authentiques et abandon de la plateforme.
* **Plan de mitigation :**
  1. **Parcours assisté :** Mise en place d'un système de compte artisan simplifié avec accompagnement local par les coopératives partenaires.
  2. **Abstraction des frais :** Prévoir à terme des mécanismes de méta-transactions (*Account Abstraction* EIP-4337 / Biconomy) où la plateforme sponsorise les frais de gaz pour l'artisan.
  3. **Interface ultra-simplifiée :** Utiliser des termes familiers dans l'application (« Compte atelier », « Certificat d'authenticité », « Paiement réservé ») plutôt que le vocabulaire cryptographique rébarbatif.

---

## 3. Recommandations prioritaires pour l'équipe SENDA

1. **Recommandation R-TECH-01 (Urgence immédiate) :** Créer le contrat `SendaEscrow.sol` dès la phase 3 pour remplacer le contrat `AetherMarketplace.sol` inadapté aux livraisons physiques.
2. **Recommandation R-TECH-02 :** Activer sans délai l'API backend Express et le schéma PostgreSQL pour faire vivre le catalogue avec des œuvres artisanales réelles plutôt qu'avec des mock data statiques.
3. **Recommandation R-TECH-03 :** Brancher l'upload d'images du frontend Next.js 14 sur l'API Pinata (en réutilisant la logique isolée de `nft-marketplace-main/pages/api/upload.js`).
4. **Recommandation R-MGT-01 :** Valider formellement la démonstration de bout en bout sur une seule œuvre artisanale congolaise avant d'envisager des fonctionnalités annexes (enchères, multi-chaîne).
