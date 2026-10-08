# Instrumenta — Inventario de instrumentos

Aplicación Next.js lista para desplegar en Vercel. Registra quién carga cada equipo, nombre del instrumento, número de parte, número de serie y fotografía. Los metadatos se guardan en PostgreSQL (Neon conectado desde Vercel Marketplace) y las imágenes en Vercel Blob.

## Desarrollo local

1. Requiere Node.js 20.9 o superior.
2. Instalá dependencias con `npm install`.
3. Copiá `.env.example` a `.env.local` y completá `DATABASE_URL` y `BLOB_READ_WRITE_TOKEN`.
4. Ejecutá `npm run dev` y abrí `http://localhost:3000`.

La tabla `instruments` se crea automáticamente al consultar o guardar por primera vez. El SQL equivalente está en `db/schema.sql`.

## Despliegue en Vercel

1. Importá el repositorio desde el panel de Vercel.
2. En **Storage / Marketplace**, conectá una base PostgreSQL de Neon y una tienda Vercel Blob al proyecto.
3. Confirmá que la variable de conexión esté disponible como `DATABASE_URL` o `POSTGRES_URL` y que exista `BLOB_READ_WRITE_TOKEN` en Production, Preview y Development.
4. Desplegá. Vercel instala dependencias y ejecuta el build de Next.js automáticamente.

Las fotos aceptadas son JPG, PNG y WEBP, hasta 4 MB. La API usa URLs públicas de Blob para mostrar las fotos.

## Repositorio

El proyecto queda preparado en el repositorio Git local. Para publicarlo, configurá un remoto (`git remote add origin <URL-del-repositorio>`) y luego enviá la rama principal (`git push -u origin main`).This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
