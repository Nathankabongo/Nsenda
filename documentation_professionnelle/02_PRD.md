# SENDA — PRODUCT REQUIREMENTS DOCUMENT (PRD)
**Spécifications des Exigences Produit**  
**Projet :** SENDA — Marketplace décentralisée de l'artisanat congolais  
**Version :** 1.0 — Définition Formelle du Produit  
**Document source :** `PLANSENDA.pdf` (Chapitres 2, 4 et 5)  
**Auteurs :** Équipe Projet SENDA (Groupe 02 — Master 1 Informatique)  

---

## 1. Introduction et objet du document

Le présent **Product Requirements Document (PRD)** formalise l'intégralité des fonctionnalités, comportements, cas d'utilisation et exigences opérationnelles de la plateforme **SENDA**. Il constitue le contrat technique et fonctionnel unifié servant de guide de développement, de référence d'assurance qualité et de grille d'évaluation académique.

---

## 2. Personas et utilisateurs cibles

Pour garantir que les choix de conception répondent aux besoins réels du terrain, trois personas représentatifs guident l'ergonomie et la logique fonctionnelle du système :

### Persona 1 : Mukendi (L'Artisan Vendeur)
* **Profil :** Maître sculpteur sur bois à Kinshasa (quartier Ngaliema). 48 ans.
* **Compétences numériques :** Familiarisé avec WhatsApp et les transferts Mobile Money. Peu à l'aise avec la terminologie blockchain (gas, wei, seed phrase, smart contract).
* **Objectifs :** Exposer ses statuettes en bois de wengé et ses masques traditionnels à des acheteurs internationaux prêts à payer le juste prix artisanal.
* **Freins & Craintes :** Peur d'expédier un colis vers l'Europe sans certitude d'être payé ; complexité excessive de la gestion des clés cryptographiques.
* **Besoins adressés par SENDA :** Formulaire de mise en vente simple, prise en charge de la génération du certificat NFT, garantie de blocage préalable des fonds avant expédition physique, notification claire de déblocage du paiement.

### Persona 2 : Claire (L'Acheteuse Collectionneuse)
* **Profil :** Cadre supérieure dans la diaspora congolaise résidant à Bruxelles. 35 ans.
* **Compétences numériques :** Utilisatrice régulière du e-commerce moderne, détient un portefeuille MetaMask pour tester des applications décentralisées.
* **Objectifs :** Acquérir des pièces d'art authentiques de son pays d'origine pour décorer son intérieur et soutenir directement les artisans locaux sans intermédiaires spéculateurs.
* **Freins & Craintes :** Peur de recevoir une copie industrielle en plastique ; peur d'envoyer des fonds à un inconnu sans recours en cas de colis non livré.
* **Besoins adressés par SENDA :** Preuve d'audit de l'artisan par la plateforme, fiche produit enrichie avec historique immuable (IPFS), paiement sous séquestre bloqué tant qu'elle n'a pas validé la livraison physique.

### Persona 3 : Alain (L'Administrateur & Vérificateur Qualité)
* **Profil :** Expert en art et patrimoine congolais basé à Kinshasa, membre de l'équipe d'exploitation de SENDA.
* **Compétences numériques :** Bonne maîtrise des outils d'administration web et des explorateurs blockchain.
* **Objectifs :** Garantir l'intégrité du label SENDA en vérifiant physiquement l'existence des ateliers d'artisans et la conformité des créations déclarées.
* **Besoins adressés par SENDA :** Tableau de bord pour examiner les pièces justificatives des artisans, valider leur statut d'artisan certifié et certifier les métadonnées initiales.

---

## 3. Matrice des exigences fonctionnelles (FR)

Les fonctionnalités sont hiérarchisées selon la méthodologie MoSCoW :
* **P0 (Must Have - Indispensable au MVP) :** Fonctionnalité obligatoire sans laquelle le système ne peut être qualifié de prototype opérationnel.
* **P1 (Should Have - Important) :** Fonctionnalité à haute valeur ajoutée complétant le cœur de l'application.
* **P2 (Could Have - Amélioration future) :** Confort d'usage ou optimisation prévue post-MVP.

| Identifiant | Intitulé de l'exigence | Priorité | Description fonctionnelle détaillée | Acteurs impliqués |
| :--- | :--- | :---: | :--- | :--- |
| **FR-01** | Connexion du portefeuille | **P0** | L'utilisateur doit pouvoir connecter son portefeuille MetaMask ou compatible (EIP-1193) et basculer automatiquement sur le réseau Polygon Amoy. | Visiteur, Acheteur, Artisan |
| **FR-02** | Consultation du catalogue | **P0** | Afficher une grille paginée des œuvres disponibles avec photo, titre, nom de l'artisan, prix en jetons de test, catégorie et badge de vérification. Accessible sans connexion de portefeuille requise. | Tout utilisateur |
| **FR-03** | Consultation de la fiche détaillée | **P0** | Présenter la galerie de photos, la description complète, les dimensions, les matériaux, l'artisan créateur, l'origine déclarée, l'adresse du contrat NFT, le token ID et le lien direct vers le fichier de métadonnées IPFS. | Tout utilisateur |
| **FR-04** | Publication d'une œuvre | **P0** | Permettre à un artisan habilité de saisir les informations complètes d'une œuvre (titre, description, prix, dimensions, catégorie, provenance) et de téléverser des visuels. | Artisan autorisé |
| **FR-05** | Enregistrement IPFS | **P0** | Téléverser de manière automatisée les fichiers multimédias et le manifeste JSON standardisé vers le réseau décentralisé IPFS (via Pinata) et récupérer les URI de type `ipfs://<CID>`. | Artisan, Backend / Pinata |
| **FR-06** | Minting du NFT ERC-721 | **P0** | Déclencher la création du jeton non fongible sur Polygon Amoy associant le certificat numérique au créateur d'origine et à l'URI IPFS immuable. | Artisan, Contrat SendaNFT |
| **FR-07** | Achat avec jeton de test | **P0** | Permettre à l'acheteur d'approuver et d'engager un paiement en jetons de test ERC-20 (`SendaTestToken`) correspondant au prix fixé de l'œuvre. | Acheteur, Contrat SendaTestToken |
| **FR-08** | Séquestre des fonds (*Escrow*) | **P0** | Retenir de façon autonome et inviolable les fonds déposés dans le contrat `SendaEscrow.sol`. La commande passe à l'état `Funded`. Le vendeur ne peut pas retirer les fonds. | Acheteur, Contrat SendaEscrow |
| **FR-09** | Confirmation et libération des fonds | **P0** | Permettre à l'acheteur exclusif de la commande de confirmer la bonne réception physique du colis, déclenchant le transfert irrévocable des fonds vers le portefeuille de l'artisan vendeur. | Acheteur, Artisan, SendaEscrow |
| **FR-10** | Suivi et historique de commande | **P0** | Afficher dans l'espace utilisateur l'état en temps réel de la commande (`Created`, `Funded`, `Released`, `Refunded`), avec le hachage des transactions et les liens vers Polygon Amoy Explorer. | Acheteur, Artisan |
| **FR-11** | Redevances de revente (ERC-2981) | **P1** | Déclarer sur le contrat NFT le taux de redevance (ex: 5%) et l'adresse bénéficiaire de l'artisan pour toute revente secondaire sur les places de marché compatibles. | Artisan, SendaNFT |
| **FR-12** | Vérification des artisans et œuvres | **P1** | Dispositif administratif permettant d'attribuer le statut vérifié (`isVerified`) à un artisan après audit documentaire et physique de son atelier. | Administrateur, Artisan |
| **FR-13** | Filtres et recherches avancées | **P2** | Filtrage multi-critères : par tranche de prix, catégorie artisanale (bois, textile, bijou, poterie), région de RDC (Kongo Central, Grand Kasaï, Grand Bandundu, Kivu) et tri alphabétique/chronologique. | Visiteur, Acheteur |

---

## 4. Exigences non fonctionnelles (NFR)

* **NFR-01 : Sécurité des contrats intelligents :**
  Tous les contrats doivent implémenter des gardes anti-réentrance (`ReentrancyGuard`), respecter le patron *Checks-Effects-Interactions* et être protégés par un contrôle strict des accès (`Ownable` ou `AccessControl`). Les fonctions de retrait doivent être protégées contre le déni de service.
* **NFR-02 : Fiabilité et cohérence financière :**
  Une transaction échouée ou annulée ne doit jamais laisser le contrat de séquestre ou le compte de l'utilisateur dans un état financier corrompu ou bloqué indéfiniment.
* **NFR-03 : Traçabilité et observabilité on-chain :**
  Chaque changement d'état critique (`ArtworkPublished`, `OrderFunded`, `ReceiptConfirmed`, `FundsReleased`) doit émettre un événement Solidity formellement indexé pour permettre une écoute off-chain sans perte d'information.
* **NFR-04 : Ergonomie et utilisabilité Web3 :**
  L'interface utilisateur doit minimiser le jargon cryptographique hermétique. Les messages doivent expliciter les étapes de signature, le temps d'attente de minage des blocs, et préciser systématiquement que la devise manipulée est un jeton de simulation sans valeur marchande réelle.
* **NFR-05 : Performance et optimisation des médias :**
  Les images haute résolution hébergées sur IPFS doivent être servies via une passerelle de mise en cache rapide (*dedicated gateway* Pinata ou Cloudflare IPFS) et faire l'objet d'un lazy-loading côté frontend.
* **NFR-06 : Confidentialité et protection des données personnelles :**
  **Aucune donnée personnelle sensible** (nom réel complet, adresse physique de livraison du domicile, numéro de téléphone, document d'identité de l'artisan) ne doit être inscrite en clair sur la blockchain publique ni dans le fichier JSON public sur IPFS. Ces données doivent demeurer cantonnées à la base de données relationnelle sécurisée (PostgreSQL) et aux canaux off-chain chiffrés.
* **NFR-07 : Maintenabilité et assurance qualité :**
  Le code des contrats intelligents doit atteindre une couverture de tests automatisés exhaustive sur les scénarios nominaux et d'attaques. Le code TypeScript doit respecter des règles strictes de typage sans recours injustifié au type `any`.

---

## 5. Règles métier fondamentales (Business Rules - BR)

1. **BR-01 (Condition de publication certifiée) :** Seuls les comptes détenteurs du statut d'artisan vérifié (`verification_status = 'VERIFIED'`) sont autorisés à publier des œuvres officielles et à frapper des NFT avec le label de la plateforme.
2. **BR-02 (Règle d'inviolabilité du séquestre) :** Un vendeur ne peut en aucun cas réclamer ou retirer unilatéralement les fonds séquestrés d'une commande tant que l'acheteur n'a pas déclenché la confirmation de réception ou qu'un délai de forclusion prédéfini n'a pas été atteint.
3. **BR-03 (Exclusivité de confirmation) :** Seule l'adresse de portefeuille identifiée comme acheteur (`order.buyer`) est habilitée à appeler la fonction `confirmDeliveryAndRelease()` du contrat de séquestre.
4. **BR-04 (Interdiction du double achat) :** Dès qu'une commande est initiée et financée pour une œuvre physique unique (`Funded`), l'œuvre est immédiatement marquée comme `RESERVED` ou `SOLD` sur le catalogue afin d'empêcher tout achat concurrent.
5. **BR-05 (Interdiction de double libération) :** Une commande ayant fait l'objet d'une libération (`Released`) ou d'un remboursement (`Refunded`) voit son état définitivement clôturé dans le contrat intelligent ; tout appel ultérieur doit échouer immédiatement.
6. **BR-06 (Protection contre l'auto-achat) :** L'artisan créateur / propriétaire d'une œuvre ne peut pas acheter sa propre création pour manipuler artificiellement les volumes de transaction.

---

## 6. Cas d'utilisation détaillés (Use Cases)

```mermaid
usecaseDiagram
    actor "Visiteur" as V
    actor "Artisan" as Art
    actor "Acheteur" as Ach
    actor "Administrateur" as Adm
    actor "Contrat SendaEscrow" as Escrow

    package "SENDA Marketplace" {
        usecase "UC-01: Consulter le catalogue" as UC01
        usecase "UC-02: Connecter portefeuille MetaMask" as UC02
        usecase "UC-03: Publier une œuvre artisanale" as UC03
        usecase "UC-04: Frapper le NFT & IPFS" as UC04
        usecase "UC-05: Acheter & Déposer sous séquestre" as UC05
        usecase "UC-06: Confirmer réception physique" as UC06
        usecase "UC-07: Suivre l'état d'une commande" as UC07
        usecase "UC-08: Vérifier profil artisan" as UC08
        usecase "UC-09: Suivre historique & reventes" as UC09
    }

    V --> UC01
    V --> UC02
    Art --> UC02
    Art --> UC03
    Art --> UC04
    Ach --> UC02
    Ach --> UC05
    Ach --> UC06
    Ach --> UC07
    Art --> UC07
    Adm --> UC08
    UC05 ..> Escrow : Verrouille jetons
    UC06 ..> Escrow : Libère fonds
    Ach --> UC09
```

### UC-01 : Consulter le catalogue public
* **Acteur principal :** Visiteur.
* **Préconditions :** Accès à Internet et navigateur moderne. Aucune connexion de portefeuille requise.
* **Flux nominal :**
  1. L'utilisateur arrive sur la page d'accueil de SENDA.
  2. L'application charge la grille des créations depuis l'API ou le stockage indexé.
  3. L'utilisateur applique des filtres (catégorie "Sculpture", région "Kongo Central", tri par prix).
  4. L'application met à jour la liste sans rechargement complet de la page.
* **Flux d'exception :** En cas d'indisponibilité temporaire de l'API, un message bienveillant s'affiche avec possibilité de rafraîchissement.

### UC-04 : Publication, téléversement IPFS et minting NFT
* **Acteurs :** Artisan vérifié, Service IPFS/Pinata, Contrat `SendaNFT`.
* **Préconditions :** L'artisan a connecté son portefeuille, est reconnu avec le rôle vérifié, et dispose de MATIC de test pour les frais de gaz.
* **Flux nominal :**
  1. L'artisan renseigne le titre, la description, l'histoire culturelle, les dimensions, les matériaux et le prix.
  2. L'artisan sélectionne les photographies en haute définition.
  3. Le système téléverse les images sur IPFS via l'API Pinata et génère l'URI de l'image (`ipfs://...`).
  4. Le système assemble le document JSON standard ERC-721 (avec attributs artisanaux) et le pinne sur IPFS.
  5. L'artisan est invité à signer la transaction de création (`mintNFT`) sur son portefeuille MetaMask.
  6. Le contrat `SendaNFT` enregistre le nouveau `tokenId` associé à l'URI IPFS immuable.
  7. L'œuvre apparaît immédiatement dans le catalogue SENDA comme disponible à la vente.

### UC-05 & UC-06 : Parcours d'achat physique sous séquestre
* **Acteurs :** Acheteur, Artisan, Contrats `SendaTestToken` et `SendaEscrow`.
* **Préconditions :** L'œuvre est disponible (`AVAILABLE`), l'acheteur est connecté sur Polygon Amoy et dispose d'un solde suffisant de jetons `SendaTestToken`.
* **Flux nominal détaillé :**
  1. L'acheteur consulte la fiche produit et clique sur **« Acheter avec Séquestre »**.
  2. L'application vérifie si l'allocation (*allowance*) du jeton ERC-20 pour le contrat de séquestre est suffisante.
  3. Si l'allocation est insuffisante, l'acheteur signe une transaction `approve` sur le jeton de test ERC-20.
  4. L'acheteur confirme ensuite l'appel à la fonction `depositPayment(artworkId, amount)` sur le contrat `SendaEscrow`.
  5. Le contrat de séquestre transfère les jetons du portefeuille de l'acheteur vers son propre solde verrouillé et émet l'événement `PaymentLocked(orderId, artworkId, buyer, seller, amount)`.
  6. Le statut de la commande passe à `FUNDED` dans la base de données et l'artisan reçoit l'instruction d'expédier le colis physique.
  7. L'artisan emballe et expédie l'objet physique vers l'adresse communiquée off-chain.
  8. L'acheteur réceptionne le colis physique, inspecte la conformité de l'œuvre et clique sur **« Confirmer la réception »** dans son tableau de bord SENDA.
  9. L'acheteur valide la transaction `confirmReceiptAndRelease(orderId)` sur MetaMask.
  10. Le contrat `SendaEscrow` vérifie que l'appelant est bien l'acheteur, met à jour son état interne à `RELEASED` et transfère immédiatement les jetons ERC-20 vers le portefeuille de l'artisan vendeur.
  11. L'événement `PaymentReleased(orderId, seller, amount)` est émis sur la blockchain.
  12. L'application affiche un écran de félicitations avec les liens de vérification sur Polygonscan.
* **Scénarios d'échec et d'exception :**
  * *Solde ERC-20 insuffisant :* L'interface bloque l'action et propose un bouton direct vers le robinet de test (*faucet*).
  * *Transaction refusée par l'utilisateur :* L'interface réinitialise l'état du formulaire sans altérer l'état de la commande.
  * *Tentative d'achat d'une œuvre déjà séquestrée :* Le contrat intelligent ou l'API rejette l'opération avec le motif `Artwork already reserved`.
  * *Appel de libération par un tiers :* Le contrat revert immédiatement avec le message d'erreur explicite `Only designated buyer can confirm delivery`.

---

## 7. Périmètre du MVP et critères d'acceptation formels

Pour déclarer le prototype MVP SENDA officiellement réussi et validé, les **huit critères d'acceptation suivants doivent tous être satisfaits et vérifiés** :

| N° | Critère d'acceptation opérationnel | Méthode de vérification |
| :---: | :--- | :--- |
| **AC-01** | Un artisan autorisé peut publier une fiche complète avec médias. | Test fonctionnel sur le formulaire frontend. |
| **AC-02** | Les fichiers images et le manifeste JSON sont hébergés et lisibles sur IPFS. | Résolution directe de l'URI `ipfs://<CID>` via passerelle publique. |
| **AC-03** | Un jeton NFT ERC-721 valide est frappé sur Polygon Amoy. | Vérification de l'émission d'un `tokenId` sur l'explorateur Polygonscan. |
| **AC-04** | L'acheteur peut déposer le montant exact de la vente dans le séquestre. | Vérification du solde du contrat `SendaEscrow` après la transaction. |
| **AC-05** | Le vendeur ne peut prélever aucun fond tant que la commande est à l'état `Funded`. | Test d'intrusion / tentative de retrait unilatéral rejeté par le contrat. |
| **AC-06** | L'appel à la confirmation de réception libère intégralement les fonds au vendeur. | Vérification de l'augmentation du solde ERC-20 de l'artisan. |
| **AC-07** | L'historique des changements d'état est traçable via les événements on-chain. | Lecture des logs d'événements `PaymentLocked` et `PaymentReleased`. |
| **AC-08** | La suite de tests automatisés couvre 100% des cas limites de sécurité. | Exécution réussie des tests unitaires Hardhat sans aucune défaillance. |
