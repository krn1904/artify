# Production Seed Data

JSON arrays for priming the `artify_prod` database. Each file is compatible with `mongoimport --jsonArray`.

## Files
- `users.json` – 5 artists, 3 customers (bcrypt hash matches `Artify!2024`, change if needed)
- `artworks.json` – Sample portfolio pieces tied to the artists
- `commissions.json` – Three requests covering REQUESTED/ACCEPTED/COMPLETED states
- `favorites.json` – Starter engagement data for dashboards

## Importing
1. Ensure your `.env` in Vercel/local is updated with the production cluster string and `MONGODB_DB_NAME`.
2. Download the files to the machine running `mongoimport`.
3. Run the following (replace `<connectionString>` and database name as needed):

```bash
mongoimport "<connectionString>" \
  --db artify_prod \
  --collection users \
  --jsonArray --file users.json --drop

mongoimport "<connectionString>" \
  --db artify_prod \
  --collection artworks \
  --jsonArray --file artworks.json --drop

mongoimport "<connectionString>" \
  --db artify_prod \
  --collection commissions \
  --jsonArray --file commissions.json --drop

mongoimport "<connectionString>" \
  --db artify_prod \
  --collection favorites \
  --jsonArray --file favorites.json --drop
```

- `--drop` clears the existing collection before import; omit it if you want to merge data instead.
- When you rotate passwords, regenerate the bcrypt hash in `users.json` to keep logins working.

## Quick sanity checks
- `db.users.countDocuments()` should return 8.
- `db.commissions.find({ status: "REQUESTED" }).pretty()` verifies request states.
- Hit `https://www.artify.karansoni.live/api/health/db` to ensure the app can read the new data.
