# Senda Marketplace — dApp Web3 Décentralisée

Bienvenue dans la dApp **SENDA**, une marketplace décentralisée d'œuvres artisanales congolaises avec **paiement direct en POL** sur le réseau **Polygon Amoy Testnet** (Chain ID 80002).

---

## 🏛️ Architecture et Principes Clés

1. **Paiement Direct sans Tiers** : Le smart contract ne conserve jamais les fonds. Lorsqu'un acheteur passe commande, le montant en POL est transféré immédiatement et intégralement au portefeuille de l'artisan créateur via `call{value: msg.value}("")`.
2. **Identification Automatique** : L'adresse de l'artisan est directement déduite de `msg.sender` lors de l'enregistrement de l'œuvre. L'artisan ne saisit jamais d'adresse manuellement.
3. **Protection contre la Réentrance** : Le contrat applique le modèle *Checks-Effects-Interactions* ainsi qu'un verrou d'exclusion mutuelle (`nonReentrant`).
4. **Lecture Publique Gratuite** : Le catalogue lit l'état de la blockchain via le RPC public officiel de Polygon Amoy sans forcer l'acheteur à connecter un portefeuille tant qu'il ne passe pas commande.
5. **Sécurité Front-End** : Tous les textes (titres, descriptions) sont injectés via `textContent` afin d'éliminer tout risque d'attaque par injection XSS.

---

## 🚀 Étape 1 : Déploiement avec Remix IDE (Guide pas à pas)

1. Ouvrez votre navigateur et rendez-vous sur [Remix IDE](https://remix.ethereum.org/).
2. Dans le volet de gauche (**File Explorer**), créez un nouveau fichier nommé `SendaMarketplace.sol` dans le dossier `contracts/`.
3. Copiez et collez l'intégralité du code de `dapp-marketplace/contracts/SendaMarketplace.sol`.
4. Allez dans l'onglet **Solidity Compiler** (3ᵉ icône à gauche) :
   - Choisissez le compilateur `0.8.20` ou supérieur (ex: `0.8.24`).
   - Cliquez sur le bouton bleu **Compile SendaMarketplace.sol**. Une coche verte apparaît.
5. Allez dans l'onglet **Deploy & Run Transactions** (4ᵉ icône à gauche) :
   - Dans le menu déroulant **ENVIRONMENT**, sélectionnez **Injected Provider - MetaMask**.
   - MetaMask s'ouvre : assurez-vous d'être connecté sur le réseau **Polygon Amoy Testnet** (Chain ID 80002).
   - À côté du bouton orange **Deploy**, renseignez le paramètre du constructeur :
     ```text
     _validationRequise: false
     ```
     *(La valeur `false` permet à tout artisan de publier librement ses œuvres pour vos tests).*
   - Cliquez sur **Deploy** et confirmez la transaction dans MetaMask.
6. Une fois la transaction validée :
   - Dans la section **Deployed Contracts** en bas à gauche, repérez votre contrat `SendaMarketplace`.
   - Cliquez sur l'icône de copie à côté du nom pour **copier l'adresse du contrat** (ex: `0x71C...`).

---

## ⚙️ Étape 2 : Configuration Front-End

Ouvrez le fichier `dapp-marketplace/config.js` et remplacez l'adresse par celle que vous venez de copier :

```javascript
// dapp-marketplace/config.js
export const CONTRACT_ADDRESS = "0xVOTRE_ADRESSE_DE_CONTRAT_REMIX";
```

---

## 💻 Étape 3 : Lancer la dApp en Local

Dans votre terminal PowerShell, déplacez-vous dans le dossier `dapp-marketplace` et lancez le serveur statique :

```powershell
cd D:\SENDA\dapp-marketplace
node server.js
```

Le serveur démarre immédiatement sur le port **8080** :
- **Catalogue Acheteurs** : [http://localhost:8080/index.html](http://localhost:8080/index.html)
- **Portail Artisans** : [http://localhost:8080/artisan.html](http://localhost:8080/artisan.html)

---

## 🧪 Étape 4 : Checklist Complète de Test (Guide de validation)

### 1. Obtenir des POL de test (Faucet)
1. Rendez-vous sur le faucet officiel : [https://faucet.polygon.technology/](https://faucet.polygon.technology/).
2. Sélectionnez le réseau **Polygon Amoy**.
3. Demandez des jetons POL pour :
   - Votre **Compte 1 (Artisan)** : nécessaire pour payer le gas lors de la publication de l'œuvre.
   - Votre **Compte 2 (Acheteur)** : nécessaire pour payer le prix de l'œuvre + le gas de commande.

### 2. Publier une Œuvre (Compte 1 - Artisan)
1. Ouvrez `http://localhost:8080/artisan.html` dans Chrome avec le Compte 1 actif dans MetaMask.
2. Cliquez sur **Connecter Portefeuille Artisan** (si vous êtes sur un autre réseau, la dApp vous demandera automatiquement de basculer sur Polygon Amoy).
3. Remplissez le formulaire :
   - **Titre** : `Statuette Royale Luba`
   - **Description** : `Bois de muvula lustré, patine brune et perles anciennes. Pièce maîtresse de 24 cm.`
   - **Image** : `https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=60`
   - **Prix** : `0.001`
4. Cliquez sur **🚀 Enregistrer et Publier sur Amoy** et validez dans MetaMask.
5. Une fois minée, l'œuvre apparaît instantanément dans la section **Mes Pièces Répertoriées**.

### 3. Consulter le Catalogue Public (Acheteur)
1. Ouvrez un autre navigateur ou basculez sur le **Compte 2 (Acheteur)** dans MetaMask.
2. Ouvrez `http://localhost:8080/index.html`.
3. L'œuvre s'affiche automatiquement avec son titre, son image, son prix de `0.001 POL` et l'adresse raccourcie de l'artisan.

### 4. Passer Commande avec Paiement Direct
1. Cliquez sur **Connecter MetaMask** en haut à droite avec le Compte 2.
2. Cliquez sur le bouton **Commander** sous la statuette.
3. MetaMask s'ouvre en affichant un envoi exact de **0.001 POL**.
4. Validez la transaction.

### 5. Vérifications On-Chain
1. **Solde de l'artisan** : Ouvrez MetaMask sur le Compte 1 (Artisan), vous constaterez que son solde a augmenté de `+0.001 POL`.
2. **Solde du contrat** : Consultez l'adresse de votre contrat sur [Amoy Polygonscan](https://amoy.polygonscan.com/). Son solde en POL est strictement de **0 POL**, prouvant que le contrat ne garde aucun fonds.
3. **Explorateur Polygonscan** : Dans l'onglet **Internal Txns** de la transaction, vous verrez le transfert natif de 0.001 POL émis directement vers l'artisan.

---

## 🔮 Évolutions Futures Optionnelles

- **Commission de Marketplace Senda** : Ajouter un pourcentage (ex: 2.5%) automatiquement redirigé vers l'adresse de trésorerie Senda lors du paiement.
- **Variante Escrow (Séquestre)** : Conserver les fonds dans le contrat jusqu'à ce que l'acheteur ou le transporteur confirme la livraison physique du colis (déjà implémenté dans le contrat `SendaEscrow.sol`).
