# ALVEO Lab — site Next.js

Site vitrine + prise de rendez-vous en ligne pour le laboratoire de prothèse dentaire (171 Bd Abdelmoumen, Casablanca).

## Lancer le projet
```bash
npm install
cp .env.example .env      # puis changer ADMIN_KEY
npm run dev               # http://localhost:3000
```
Production : `npm run build && npm start`

## Pages
| URL | Rôle |
|---|---|
| `/` | Accueil : intro animée, hero, prothèses, process, RDV, numérique, contact |
| `/rendez-vous` | Assistant de réservation en 4 étapes (`?service=collecte` pour présélectionner) |
| `/rendez-vous/[id]` | « Gérer mon rendez-vous » : détail, ajout agenda, annulation |
| `/admin?key=…` | Espace labo : tableau des RDV, filtres, recherche, annulation, export CSV |

## Changer le nom, les horaires, les photos
Tout est dans **`lib/site.ts`** (nom, adresse, téléphone, horaires, photos).

## Règles de rendez-vous — `lib/booking.ts`
- 4 prestations avec leur durée : collecte au cabinet (30 min), prise de teinte (45), visio CFAO (30), dépôt/retrait (15)
- Ressources et capacité : coursier ×1, technicien ×1 (teinte + visio), accueil ×2
- Grille de 15 min, délai minimum 2 h, réservation jusqu'à J+30, pause 13h–14h (sauf accueil)
- Dimanche et jours fériés fermés (`HOLIDAYS_FIXED` ; ajouter les fêtes religieuses dans `HOLIDAYS_EXTRA` chaque année)
- Double réservation impossible : le créneau est revérifié au moment de l'enregistrement (réponse 409)

## API
- `GET /api/rdv?service=X&month=AAAA-MM` → disponibilité de chaque jour
- `GET /api/rdv?service=X&date=AAAA-MM-JJ` → créneaux libres
- `POST /api/rdv` → création (validation zod, anti-spam)
- `GET|DELETE /api/rdv/[id]` → détail / annulation (`x-admin-key` pour l'admin)

## À faire avant la mise en ligne
1. **Stockage** : les RDV sont enregistrés dans `data/bookings.json` (OK sur un VPS / hébergement Node).
   Sur **Vercel**, remplacer `lib/store.ts` par une base (Supabase, Neon, Vercel KV…).
2. **Notifications** : brancher l'envoi d'e-mail/SMS dans `app/api/rdv/route.ts` (Resend, Brevo, Twilio…).
3. **Admin** : remplacer la clé dans l'URL par une vraie connexion si plusieurs personnes y accèdent.
4. **Contenus** : chiffres `[X]` (`app/page.tsx`, composant `Counter`), e-mail, formats de fichiers, photos réelles du labo.
