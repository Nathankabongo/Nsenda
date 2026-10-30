# SUITE DOCUMENTAIRE PROFESSIONNELLE — PROJET SENDA
**Marketplace Décentralisée de l'Artisanat Congolais**  
*L'artisanat congolais, authentifié et valorisé.*  

---

## 1. Contexte du projet et cadre académique

* **Intitulé du projet :** SENDA — Marketplace décentralisée de l'artisanat congolais
* **Niveau d'études :** Master 1 Informatique — Année académique 2026–2027
* **Équipe de développement (Groupe 02) :**
  * **Kabongo Mukola Nathan :** Frontend et intégration Web3
  * **Losongo Kingombe Victor :** Blockchain et contrats intelligents
  * **Tuasansilu Lufuma Benie :** Backend, IPFS et qualité logicielle
* **Document directeur de référence :** `PLANSENDA.pdf`
* **Emplacement des livrables :** `D:\SENDA\documentation_professionnelle\`

---

## 2. Organisation de la suite documentaire

Cette documentation a été rédigée avec un niveau d'exigence professionnel et académique pour servir de socle de référence complet au projet SENDA. Elle s'articule autour de 10 documents thématiques spécialisés :

| N° | Fichier | Objet et Contenu Principal | Destinataires privilégiés |
| :---: | :--- | :--- | :--- |
| **00** | [`00_INVENTAIRE_ET_DIAGNOSTIC.md`](./00_INVENTAIRE_ET_DIAGNOSTIC.md) | Audit exhaustif des fichiers locaux de `D:\SENDA`, cartographie des deux dépôts existants (`NFT-market-Place-main` et `nft-marketplace-main`), identification des écarts critiques. | Architecte, Évaluateurs |
| **01** | [`01_PRESENTATION_GENERALE.md`](./01_PRESENTATION_GENERALE.md) | Synthèse exécutive, justification du projet, problématique, vision, objectifs généraux/spécifiques, valeur ajoutée et limites fondamentales. | Direction, Tout public |
| **02** | [`02_PRD.md`](./02_PRD.md) | *Product Requirements Document* : Personas, exigences fonctionnelles P0/P1/P2 (FR-01 à FR-13), exigences non fonctionnelles, règles métier et cas d'utilisation. | Product Owner, QA |
| **03** | [`03_TRD.md`](./03_TRD.md) | *Technical Requirements Document* : Architecture 4 couches, justification des choix technologiques, architecture Frontend, Backend, IPFS et sécurité. | Architecte, Développeurs |
| **04** | [`04_UI_UX.md`](./04_UI_UX.md) | Charte graphique officielle (Vert profond, Ocre, Beige), design system, fiches d'œuvres, modales de séquestre et diagrammes de flux d'écrans (AppFlow). | Designer UI/UX, Frontend |
| **05** | [`05_ARCHITECTURE_BLOCKCHAIN.md`](./05_ARCHITECTURE_BLOCKCHAIN.md) | Spécifications des contrats intelligents (`SendaNFT`, `SendaEscrow`, `SendaTestToken`), machine à états du séquestre physique, redevances ERC-2981 et sécurité. | Ingénieur Blockchain |
| **06** | [`06_MODELE_DONNEES_ET_API.md`](./06_MODELE_DONNEES_ET_API.md) | Schéma conceptuel et relationnel (PostgreSQL), dictionnaire des tables, spécifications des endpoints REST, authentification SIWE et politique d'identifiants. | Développeur Backend |
| **07** | [`07_PLAN_IMPLEMENTATION.md`](./07_PLAN_IMPLEMENTATION.md) | Découpage en 6 phases de développement, feuille de route, jalons d'avancement, matrice de répartition des tâches entre Nathan, Victor et Benie, flux Git. | Chef de Projet, Équipe |
| **08** | [`08_MATRICE_CONFORMITE.md`](./08_MATRICE_CONFORMITE.md) | Matrice comparative d'alignement entre le document directeur `PLANSENDA.pdf` et le code existant dans `D:\SENDA`, taux de conformité par sous-domaine. | Qualité, Évaluateurs |
| **09** | [`09_RISQUES_ET_RECOMMANDATIONS.md`](./09_RISQUES_ET_RECOMMANDATIONS.md) | Cartographie des risques (décorrélation physique/NFT, fonds bloqués, disponibilité IPFS, vie privée), plan de mitigation et recommandations techniques. | Équipe Projet, Auditeur |
| **10** | [`10_GLOSSAIRE.md`](./10_GLOSSAIRE.md) | Répertoire terminologique exhaustif couvrant le Web3, la blockchain, l'e-commerce, le génie logiciel et le patrimoine artisanal congolais. | Tout lecteur |
| **—** | [`RAPPORT_CONSOLIDE_SENDA.md`](./RAPPORT_CONSOLIDE_SENDA.md) | Version intégrale consolidée du dossier technique et fonctionnel (prête pour impression ou consultation continue). | Évaluateurs académiques |

---

## 3. Guide de lecture par profil

* **Vous êtes évaluateur académique ou chef de projet :**
  Commencez par [`01_PRESENTATION_GENERALE.md`](./01_PRESENTATION_GENERALE.md), consultez la synthèse d'évaluation dans [`08_MATRICE_CONFORMITE.md`](./08_MATRICE_CONFORMITE.md) et la feuille de route d'équipe dans [`07_PLAN_IMPLEMENTATION.md`](./07_PLAN_IMPLEMENTATION.md).
* **Vous êtes ingénieur Blockchain :**
  Consultez en priorité [`05_ARCHITECTURE_BLOCKCHAIN.md`](./05_ARCHITECTURE_BLOCKCHAIN.md) pour comprendre le modèle de séquestre physique conditionnel et l'analyse de l'ERC-2981.
* **Vous êtes développeur Full-Stack (Frontend / Backend) :**
  Consultez [`03_TRD.md`](./03_TRD.md), [`04_UI_UX.md`](./04_UI_UX.md) pour l'intégration de la charte visuelle et [`06_MODELE_DONNEES_ET_API.md`](./06_MODELE_DONNEES_ET_API.md) pour la mise en place de la base PostgreSQL et des routes REST.

---

## 4. Synthèse du diagnostic technique

L'inventaire rigoureux de l'espace local `D:\SENDA` a permis d'établir avec certitude :
1. **La présence d'un socle technologique de qualité :** Le dossier `NFT-market-Place-main` fournit une base moderne sous Next.js 14, Tailwind CSS, TypeScript, Wagmi v2 et OpenZeppelin v5.
2. **Une divergence fondamentale à corriger :** Le code existant est configuré pour une place de marché NFT purement numérique avec swap atomique immédiat (nommé "Aetheria"), alors que **SENDA requiert impérativement un contrat de séquestre physique (`SendaEscrow.sol`)** pour retenir les fonds jusqu'à la livraison matérielle des œuvres congolaises.
3. **Des chantiers clairs à engager :** La mise en place du serveur backend Node.js/Express, du schéma PostgreSQL et le raccordement effectif du flux d'upload IPFS Pinata.

Les 10 documents ci-présents fournissent toutes les spécifications d'ingénierie nécessaires pour exécuter cette transition avec rigueur et succès.
