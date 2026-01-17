# Studio Web MVP

Website MVP complet functional pentru un developer web independent. Include backend Node.js + Express, SQLite, formulare reale si pagini legale GDPR.

## Cerinte
- Node.js 18+
- NPM

## Setup local
```bash
npm install
copy .env.example .env
npm run start
```

Website: http://localhost:3000

## Variabile de mediu
- `PORT` - portul serverului.
- `TRUST_PROXY` - `true` pentru deploy pe Render/Railway.
- `SQLITE_PATH` - calea catre baza SQLite.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - SMTP pentru email.
- `SMTP_FROM` - expeditorul emailurilor.
- `OWNER_EMAIL` - unde se trimit notificarile.

## Rute API
- `POST /api/quote` - salveaza cereri de oferta.
- `POST /api/contact` - salveaza mesaje de contact.

## Deploy (Railway / Render / VPS)
1. Seteaza variabilele de mediu in platforma.
2. Asigura-te ca `SQLITE_PATH` indica un volum persistent.
3. Comanda de start: `npm run start`.

## Structura proiect
- `public/` - frontend static
- `server/` - backend Express
- `server/db/` - conexiunea SQLite
- `server/routes/` - rute API
- `server/controllers/` - controllere pentru logica
- `server/utils/` - utilitare (email, validare)
- `db/` - fisierul SQLite

