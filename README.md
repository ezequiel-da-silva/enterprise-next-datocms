This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

Copy [`.env.example`](.env.example) to `.env` and configure DatoCMS tokens before fetching CMS content.

## For AI agents

Start with [AGENTS.md](AGENTS.md), then [docs/AI-PLAYBOOK.md](docs/AI-PLAYBOOK.md) and [docs/QUALITY-GATES.md](docs/QUALITY-GATES.md).

Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Cursor rules: `.cursor/rules/`. Skills: `.cursor/skills/`.

Quality gate: `npm run check-all` (typecheck, test, lint, build). GraphQL drift: `npm run codegen:check`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Segurança

Scripts de auditoria de dependências e validação de headers HTTP:

```bash
npm run security:audit
npm run build && npm run start:prod                  # terminal 1
NODE_ENV=production npm run security:headers         # terminal 2
```

Guia completo: [docs/SECURITY.md](docs/SECURITY.md). CI: [`.github/workflows/security.yml`](.github/workflows/security.yml).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
