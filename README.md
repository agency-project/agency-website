# Agency website

A minimal React, TypeScript, Vite, and Tailwind CSS website for Agency.

## Local development

Use Node.js 24 LTS (for example, `nvm install && nvm use`), then run:

```sh
npm install
npm run dev
```

Run `npm run build` to type-check and create the static site in `dist/`. Run `npm run preview` to serve that build locally.

## Deploy to Vercel

Push this repository to your Git provider, then import it as a new project in Vercel. Select the Vite framework preset and Node.js 24 in the project settings. Vercel will run `npm run build` and publish `dist/` using the preset defaults. Deploy the project when ready.
