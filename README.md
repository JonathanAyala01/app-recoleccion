<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/19965f1e-00c4-4070-80bd-a68e8952a164

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy on Shared Hosting

This project can run on a shared host with a PHP backend and MySQL database.

1. Create a MySQL database in phpMyAdmin.
2. Import [`api/schema.sql`](./api/schema.sql) into that database.
3. Edit [`api/config.php`](./api/config.php) with your database credentials.
4. Build the frontend with `npm run build`.
5. Upload the generated `dist/` contents to `public_html/`.
6. Upload the `api/` folder to `public_html/api/`.

The app reads and writes state through `api/state.php`. If you deploy the frontend in a subfolder instead of the domain root, set `VITE_API_BASE_URL` before building, for example:

```bash
VITE_API_BASE_URL=/my-folder/api npm run build
```
