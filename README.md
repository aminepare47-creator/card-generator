# MyCard

> Une carte de visite numérique gratuite, sans compte, sans pub.
> Lien public + QR code + export vCard + statistiques de scan, plus un générateur de QR code universel.

## ✨ Fonctionnalités

1. **Générateur de carte de visite**
   - Formulaire avec aperçu en temps réel (recto/verso qui se retourne)
   - **10 modèles visuels** : `halo`, `blob`, `vagues`, `spherique`, `arche`, `vortex`, `modernix`, `prestige`, `fluide`, `hexagone`
   - 6 thèmes de couleur, couleur personnalisée, police, forme de la photo, taille du nom
   - Galerie de produits/services (jusqu'à 12, avec image)
   - Lien public permanent (`/c/<slug>`)
   - QR code du lien, généré à la volée
   - Bouton **« Enregistrer le contact »** qui télécharge un `.vcf`
   - Lien d'édition privé avec **jeton secret** (pas de compte, pas de mot de passe)
   - Partage via Web Share API (avec fallback presse-papier)
   - **OG image dynamique** (1200×630) pour les aperçus WhatsApp/Slack/Twitter
   - **Statistiques de scan** : compteur par jour, sparkline 30 jours, dernière vue

2. **Page « Mes cartes » (`/mes-cartes`)**
   - Liste les cartes créées/éditées depuis ce navigateur
   - Basé sur un cookie `cp_my_cards` (pas de compte)
   - Bouton « Oublier » pour retirer une carte de la liste

3. **Générateur de QR code universel** (`/qr`)
   - Types : texte, URL, téléphone (`tel:`), e-mail (`mailto:` avec sujet), WhatsApp (`wa.me`), Wi-Fi (payload standard scanné = connexion auto), vCard
   - Personnalisation : couleurs (QR + fond), style des points, style des coins, niveau de correction d'erreur, **logo central** uploadé depuis la galerie
   - Téléchargement **PNG** et **SVG**
   - Tout reste dans le navigateur — aucune donnée n'est envoyée à la base

4. **Upload d'images sécurisé**
   - Depuis la galerie, par glisser-déposer, ou collage (`Ctrl/⌘+V`)
   - Formats acceptés : **JPG, PNG, WEBP, GIF** (SVG refusé — protection XSS)
   - Vérification des magic bytes (un `.exe` renommé en `.png` est rejeté)
   - Compression auto via **sharp** : resize 1280px max, conversion en WebP (qualité 82)
   - Stockage : **Supabase Storage** (persistant) ou disque local `.data/uploads` en repli
   - Rate limit : 20 uploads / 10 min par IP

5. **Internationalisation FR/EN**
   - Détection automatique via `navigator.language`
   - Choix manuel persisté en localStorage
   - Sélecteur dans le header

## 🧱 Stack

- **Next.js 16** (App Router, Server Components + Route Handlers)
- **TypeScript**
- **Tailwind CSS v4**
- **PostgreSQL** via **Drizzle ORM** (`pg`)
- **Supabase Storage** pour les images uploadées
- **`@vercel/og`** pour les images Open Graph
- **`qrcode`** + **`qr-code-styling`** pour les QR codes
- **`sharp`** pour la compression d'images
- **`zod`** pour la validation côté serveur

## 🗄️ Modèle de données

Une table `cards` (une ligne par carte, ID = slug unique) plus une table `card_scans` pour les compteurs quotidiens :

| Table        | Champ        | Type            | Notes                                                  |
| ------------ | ------------ | --------------- | ------------------------------------------------------ |
| `cards`      | `slug`       | text PK         | Slug lisible + suffixe aléatoire, ex. `amine-k-a1b2`   |
| `cards`      | `edit_token` | text            | Jeton secret d'édition, généré via `crypto`            |
| `cards`      | `name`       | text NOT NULL   | Nom complet                                            |
| `cards`      | `title`      | text NOT NULL   | Poste / métier                                         |
| `cards`      | `company`    | text NULL       |                                                        |
| `cards`      | `phone`      | text NULL       |                                                        |
| `cards`      | `email`      | text NULL       |                                                        |
| `cards`      | `website`    | text NULL       |                                                        |
| `cards`      | `whatsapp`   | text NULL       | Numéro seul (sera passé à `wa.me/<num>`)               |
| `cards`      | `address`    | text NULL       |                                                        |
| `cards`      | `linkedin`   | text NULL       |                                                        |
| `cards`      | `facebook`   | text NULL       |                                                        |
| `cards`      | `instagram`  | text NULL       |                                                        |
| `cards`      | `theme`      | text            | `indigo` \| `emerald` \| `rose` \| `amber` \| `sky` \| `violet` |
| `cards`      | `template`   | text            | `halo` \| `blob` \| `vagues` \| `spherique` \| `arche` \| `vortex` \| `modernix` \| `prestige` \| `fluide` \| `hexagone` |
| `cards`      | `photo_url`  | text NULL       | URL de la photo (Supabase Storage ou externe)          |
| `cards`      | `logo_url`   | text NULL       | URL du logo                                            |
| `cards`      | `products`   | text NULL       | JSON des produits/services                             |
| `cards`      | `bio`        | text NULL       | « À propos » affiché au verso                          |
| `cards`      | `created_at` | timestamptz     |                                                        |
| `cards`      | `updated_at` | timestamptz     |                                                        |
| `card_scans` | `slug`       | text PK         | Référence à `cards.slug`                               |
| `card_scans` | `day`        | text PK         | `YYYY-MM-DD`                                           |
| `card_scans` | `count`      | integer         | Incrémenté à chaque scan unique                        |
| `card_scans` | `last_seen_at` | timestamptz   |                                                        |

## 🚀 Démarrer en local

```bash
# 1. Installer
npm install

# 2. Configurer l'environnement (Postgres gratuit chez Supabase)
cp .env.example .env
#   DATABASE_URL              -> Supabase > Project Settings > Database > Connection string > URI
#   SUPABASE_URL              -> Supabase > Project Settings > API > Project URL
#   SUPABASE_SERVICE_ROLE_KEY -> Supabase > Project Settings > API > service_role (SECRET)

# 3. Créer les tables
npm run db:push        # ou : npm run db:init

# 4. Lancer
npm run dev
# http://localhost:3000
```

> Sans les variables `SUPABASE_*`, les images uploadées sont écrites dans
> `.data/uploads/` — parfait en dev, mais éphémère en production.

## 🔐 Sécurité

- **Upload** : SVG refusés (XSS), magic bytes vérifiés, MIME strict, rate limit 20/10min/IP
- **Stats** : rate limit 60/h/IP/slug (anti-inflation)
- **Édition** : protégée par jeton secret
- **Lecture publique** sur `cards` : tout le monde peut consulter `/c/<slug>`
- **Création ouverte** : aucun compte requis, c'est le choix MVP

## 📦 Déploiement

L'app est **portable** : la base est un Postgres distant et les images vivent
dans Supabase Storage. Elle tourne donc sur n'importe quel hébergeur Node
(Docker, Render, Koyeb, Fly, Railway, un VPS...), y compris les offres
gratuites au filesystem éphémère.

### Étape 1 — Supabase (gratuit, sans carte bancaire)

1. Crée un projet sur https://supabase.com
2. **Storage** → *New bucket* → nom `uploads` → coche **Public bucket**
3. **SQL Editor** → colle le contenu de `drizzle/0000_init.sql` et exécute
   (ou bien lance `npm run db:push` / `npm run db:init` avec le `DATABASE_URL` de prod)
4. Note les 3 valeurs : `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

### Étape 2 — Hébergeur

| Hébergeur                | Offre gratuite                          | Remarques                                 |
| ------------------------ | --------------------------------------- | ----------------------------------------- |
| **Render** (Web Service) | Instance gratuite, sans carte bancaire  | Mise en veille après 15 min d'inactivité  |
| **Koyeb**                | 1 service gratuit, sans carte bancaire  | Déploiement Docker ou buildpack           |
| **Hugging Face Spaces**  | Docker gratuit, sans carte bancaire     | Le port doit être `7860`                  |
| VPS (OVH, Hetzner...)    | Payant (~3 €/mois)                      | Le plus rapide et le plus fiable          |

**Variables d'environnement à définir chez l'hébergeur :**

```
DATABASE_URL=postgresql://...            # Supabase (URI)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
SUPABASE_BUCKET=uploads
```

**Commandes :** build `npm run build`, start `npm run start`.

### Avec Docker

Un `Dockerfile` est fourni (Koyeb, Hugging Face, Fly.io, VPS...) :

```bash
docker build -t mycard .
docker run -p 3000:3000 --env-file .env mycard
```

## 📍 Routes

| Route                              | Description                                                |
| ---------------------------------- | ---------------------------------------------------------- |
| `/`                                | Page d'accueil                                             |
| `/creer`                           | Formulaire de création avec aperçu                         |
| `/creer/<slug>?token=<token>`      | Résultat (liens + QR) après création                       |
| `/c/<slug>`                        | Carte publique + OG image                                  |
| `/c/<slug>/modifier?token=...`     | Édition sécurisée par jeton + dashboard de stats           |
| `/mes-cartes`                      | Cartes créées depuis ce navigateur                         |
| `/qr`                              | Générateur de QR code universel                            |
| `/api/cards`                       | POST : créer une carte                                     |
| `/api/cards/[slug]`                | GET : lire / PATCH : éditer                                |
| `/api/cards/[slug]/scan`           | POST : enregistrer une vue                                 |
| `/api/cards/[slug]/stats`          | GET : stats (protégées par token)                          |
| `/api/my-cards`                    | DELETE : oublier une carte                                 |
| `/api/og/[slug]`                   | GET : image OG dynamique (PNG 1200×630)                    |
| `/api/upload`                      | POST : envoyer une image (compressée, sécurisée)           |
| `/api/uploads/[file]`              | GET : servir une image uploadée                            |
| `/api/health`                      | GET : ping base de données                                 |

## 📝 Licence

MIT — utilise, fork, améliore, c'est fait pour ça.