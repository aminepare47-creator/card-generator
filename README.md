# Carte Pro

> Une carte de visite numérique gratuite, sans compte, sans pub.
> Lien public + QR code + export vCard + statistiques de scan, plus un générateur de QR code universel.

## ✨ Fonctionnalités

1. **Générateur de carte de visite**
   - Formulaire avec aperçu en temps réel
   - 4 modèles visuels : **Classique**, **Minimaliste**, **Corporate**, **Créatif**
   - 6 thèmes de couleur
   - Lien public permanent (`/c/<slug>`)
   - QR code du lien, généré à la volée
   - Bouton **« Enregistrer le contact »** qui télécharge un `.vcf`
   - Lien d'édition privé avec **jeton secret** (pas de compte, pas de mot de passe)
   - Partage via Web Share API (avec fallback presse-papier)
   - **OG image dynamique** (1200×630) pour les aperçus WhatsApp/Slack/Twitter
   - **Statistiques de scan** : compteur par jour, sparkline 30 jours, dernière vue

2. **Page « Mes cartes » (`/mes-cartes`)**
   - Liste les cartes créées/éditées depuis ce navigateur
   - Basé sur un cookie `cp_my_cards` (pas de compte, pas de DB)
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
   - Rate limit : 20 uploads / 10 min par IP
   - Cache : 1h côté navigateur, 1j côté CDN

5. **Internationalisation FR/EN**
   - Détection automatique via `navigator.language`
   - Choix manuel persisté en localStorage
   - Sélecteur dans le header

## 🧱 Stack

- **Next.js 16** (App Router, Server Components + Route Handlers)
- **TypeScript**
- **Tailwind CSS v4**
- **PostgreSQL** via **Drizzle ORM**
- **`@vercel/og`** pour les images Open Graph
- **`qrcode`** + **`qr-code-styling`** pour les QR codes
- **`sharp`** pour la compression d'images
- **`zod`** pour la validation côté serveur

## 🗄️ Modèle de données

Une table `cards` (un document par carte, ID = slug unique) plus une table `card_scans` pour les compteurs quotidiens :

| Table        | Champ        | Type            | Notes                                                  |
| ------------ | ------------ | --------------- | ------------------------------------------------------ |
| `cards`      | `slug`       | varchar(80) PK  | Slug lisible + suffixe aléatoire, ex. `amine-k-a1b2`   |
| `cards`      | `edit_token` | text            | Jeton secret d'édition, généré via `crypto.randomUUID` |
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
| `cards`      | `theme`      | varchar(32)     | `indigo` \| `emerald` \| `rose` \| `amber` \| `sky` \| `violet` |
| `cards`      | `template`   | varchar(32)     | `classique` \| `minimaliste` \| `corporate` \| `creatif` |
| `cards`      | `photo_url`  | text NULL       | URL d'image externe (pas d'upload au MVP)              |
| `cards`      | `created_at` | timestamptz     |                                                        |
| `cards`      | `updated_at` | timestamptz     |                                                        |
| `card_scans` | `slug`       | varchar(80) PK  | Référence à `cards.slug`                               |
| `card_scans` | `day`        | date PK         | `YYYY-MM-DD`                                           |
| `card_scans` | `count`      | integer         | Incrémenté à chaque scan unique                        |
| `card_scans` | `last_seen_at` | timestamptz  |                                                        |

## 🚀 Démarrer en local

```bash
# 1. Installer
npm install

# 2. Configurer la base
cp .env.example .env
# Édite .env si besoin (par défaut : postgres://postgres:postgres@127.0.0.1:5432/app_db)

# 3. Pousser le schéma
npx drizzle-kit push --force

# 4. Lancer
npm run dev
# http://localhost:3000
```

## 🔐 Sécurité

- **Upload** : SVG refusés (XSS), magic bytes vérifiés, MIME strict, rate limit 20/10min/IP
- **Stats** : rate limit 60/h/IP/slug (anti-inflation)
- **Édition** : protégée par jeton secret
- **Lecture publique** sur `cards` : tout le monde peut consulter `/c/<slug>`
- **Création ouverte** : aucun compte requis, c'est le choix MVP

## 📦 Déploiement

```bash
npm run build
# Sur Vercel, Fly, Railway, etc.
```

Variables à fournir :
- `DATABASE_URL` — l'URL Postgres (Neon, Supabase, Vercel Postgres, etc.)
- `UPLOAD_DIR` — (optionnel) chemin du dossier d'upload. Par défaut `.data/uploads/`

> ⚠️ En production, monte un volume persistant sur `UPLOAD_DIR` (ou utilise S3/R2).
> Sur Vercel, le filesystem est éphémère — les uploads seront perdus à chaque deploy.

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

## 📝 Licence

MIT — utilise, fork, améliore, c'est fait pour ça.
