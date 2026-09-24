# Spécification de Sécurité Firestore - Plateforme Mansa
## Phase 0 : Invariants de Données et Scénarios de Test ("Dirty Dozen")

Ce document formalise les règles d'intégrité, les invariants cryptographiques et relationnels, ainsi que les 12 vecteurs d'attaque ("Dirty Dozen") à bloquer obligatoirement par les règles de sécurité `firestore.rules` et les points de contrôle backend de la plateforme Mansa.

---

### 1. Invariants Fondamentaux du Modèle de Données

1. **Isolation stricte de l'identité (Auth Identity)** :
   - Un utilisateur non authentifié ne peut effectuer aucune écriture sur les collections privées ou administratives.
   - Le champ `uid` / `ownerId` / `creatorId` / `userId` des documents créés doit correspondre exactement à `request.auth.uid`.
   - L'usurpation d'identité (`request.resource.data.creatorId != request.auth.uid`) est systématiquement rejetée.

2. **Immutabilité des Données Financières (Financial Ledger)** :
   - Les `transactions` une fois créées sont **strictement immutables** (`allow update, delete: if false`). Aucune modification de montant, de devise ou de statut n'est permise au client.
   - Les `withdrawals` (demandes de retrait) ne peuvent être modifiées ou validées par le client (`allow update, delete: if false`). Seul le serveur ou un administrateur peut modifier le statut d'un retrait.

3. **Protection PII et Confidentialité Financière** :
   - Les données PII et financières (numéros Wave/MoMo, IBAN/RIB, solde net, historique des retraits, workforce rates, B2B partner values) ne sont lisibles QUE par le propriétaire du compte (`request.auth.uid == userId` ou `request.auth.uid == creatorId`).
   - Aucune requête `list` ne peut exposer les transactions ou les retraits d'un tiers.

4. **Intégrité de la Propriété d'Entreprise (Companies & Storefronts)** :
   - La création d'une entreprise requiert une authentification valide avec `ownerId == request.auth.uid`.
   - La modification ou suppression d'une entreprise est strictement réservée à son propriétaire (`resource.data.ownerId == request.auth.uid`).

5. **Contrôle d'Accès aux Ressources (Ressources & Produits)** :
   - Les produits actifs sont publiquement consultables (catalogue marketplace), mais seuls les créateurs peuvent créer, modifier ou supprimer leurs propres produits (`resource.data.creatorId == request.auth.uid`).
   - L'accès effectif aux contenus privés (canaux Telegram VIP, salons Discord, e-books, cours) est validé côté backend via vérification de l'abonnement/achat actif.

6. **Interdiction de `localStorage` comme Source d'Autorité** :
   - Le `localStorage` agit uniquement en tant que cache UI optimiste.
   - Toute validation de droits, tout calcul de solde disponible et tout octroi de token/invite passent par des contrôles de sécurité Firestore et des endpoints serveurs authentifiés.

7. **Règle Deny-All Absolue** :
   - Suppression définitive de tout `allow read, write: if true`.
   - Fermeture par défaut (`match /{document=**} { allow read, write: if false; }`).

---

### 2. The "Dirty Dozen" : 12 Payloads d'Attaque Bloqués

| # | Vecteur d'Attaque | Payload Simulé | Résultat Attendu |
|---|---|---|---|
| 1 | **Usurpation d'entreprise** : Un utilisateur B tente de modifier le logo et nom de l'entreprise de l'utilisateur A | `UPDATE /companies/comp_A` avec `auth.uid = "user_B"` | `PERMISSION_DENIED` |
| 2 | **Altération de transaction** : Un acheteur tente de modifier le montant d'une transaction pour la passer à 1 FCFA | `UPDATE /transactions/tx_123` avec `amountNumber: 1` | `PERMISSION_DENIED` |
| 3 | **Suppression de transaction** : Un créateur tente d'effacer une trace de transaction financière | `DELETE /transactions/tx_123` | `PERMISSION_DENIED` |
| 4 | **Vol d'informations bancaires (PII)** : Un utilisateur tente de lire le document `users/user_A` pour extraire `bankIbanRib` et `momoNumber` | `GET /users/user_A` avec `auth.uid = "user_B"` sur champs privés | `PERMISSION_DENIED` |
| 5 | **Falsification de retrait** : Un utilisateur tente de créer un retrait pour un tiers ou avec un montant négatif | `CREATE /withdrawals/wdr_hack` avec `creatorId: "user_A"`, `auth.uid = "user_B"`, `amount: -50000` | `PERMISSION_DENIED` |
| 6 | **Auto-approbation de retrait** : Un utilisateur tente de passer le statut de son retrait à `completed` | `UPDATE /withdrawals/wdr_01` avec `status: "completed"` | `PERMISSION_DENIED` |
| 7 | **Pillage des deals B2B & Équipe** : Un concurrent tente de lister les données de `workforce` ou `partners` d'un créateur | `LIST /partners` ou `LIST /workforce` avec `creatorId = "user_A"`, `auth.uid = "user_B"` | `PERMISSION_DENIED` |
| 8 | **Création de produit usurpé** : Un utilisateur tente de publier un produit en usurpant l'identifiant du créateur Mansa | `CREATE /products/prod_fake` avec `creatorId: "creator_mansa"`, `auth.uid = "user_attacker"` | `PERMISSION_DENIED` |
| 9 | **Injection de champs fantômes (Shadow Fields)** : Un attaquant tente d'injecter des privilèges administrateur dans son profil | `UPDATE /users/my_uid` avec `role: "super_admin"`, `isAdmin: true` | `PERMISSION_DENIED` |
| 10 | **Lecture non autorisée des clients (Leak CRM)** : Un tiers tente de télécharger la liste des clients et emails d'une entreprise | `LIST /customers` avec `where("creatorId", "==", "victim_creator")`, `auth.uid = "attacker"` | `PERMISSION_DENIED` |
| 11 | **Suppression du catalogue d'autrui** : Un utilisateur tente de supprimer le cours ou l'offre d'un autre créateur | `DELETE /products/prod_victim` avec `auth.uid = "malicious_user"` | `PERMISSION_DENIED` |
| 12 | **Pénétration globale non autorisée** : Requête brute sur des collections internes ou inconnues | `GET /system_configs` ou `GET /webhook_logs` sans privilège | `PERMISSION_DENIED` |

---

### 3. Matrice des Rôles et des Collections

| Collection | Visiteur (Anonyme) | Membre / Client Authentifié | Créateur / Propriétaire | Serveur Backend / Admin |
|---|---|---|---|---|
| `users` | Lecture publique restreinte (profil public) | Lecture / Écriture de son propre profil (`auth.uid == id`) | Lecture / Écriture de son propre profil | Accès complet sécurisé |
| `companies` | Lecture publique | Lecture publique | Création / Mise à jour / Suppression (`ownerId == auth.uid`) | Gestion |
| `products` | Lecture publique des produits actifs | Lecture publique | Création / Mise à jour / Suppression de ses produits (`creatorId == auth.uid`) | Gestion |
| `transactions` | Aucun accès | Lecture de ses propres achats | Lecture de ses propres ventes (`creatorId == auth.uid`) | Création & Validation |
| `customers` | Aucun accès | Aucun accès direct | Lecture de sa clientèle (`creatorId == auth.uid`) | Mise à jour lors des achats |
| `workforce` | Aucun accès | Aucun accès | Lecture / Écriture de son équipe (`creatorId == auth.uid`) | Aucun accès tiers |
| `partners` | Aucun accès | Aucun accès | Lecture / Écriture de ses partenariats (`creatorId == auth.uid`) | Aucun accès tiers |
| `favorites` | Aucun accès | Lecture / Écriture de ses favoris (`userId == auth.uid`) | Lecture / Écriture de ses favoris | Non concerné |
| `withdrawals` | Aucun accès | Aucun accès | Création (demande) & Lecture de son historique (`creatorId == auth.uid`) | Traitement & Validation (update) |
| `reports` | Création autorisée (signalement) | Création autorisée (`auth.uid == reporterId`) | Aucun accès aux signalements le visant | Traitement modération |
| `community_messages`| Aucun accès | Création & Lecture des messages de sa commande | Lecture & Réponse aux messages de ses produits | Modération |
| `subscriptions` | Aucun accès | Lecture de ses abonnements actifs (`userId == auth.uid`) | Lecture des abonnés de son entreprise | Création, reconduction, révocation |
