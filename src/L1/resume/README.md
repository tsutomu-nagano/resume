# ReSUME L1

Next.js application for searching the Layer 1 metadata prepared by the ReSUME project.

## Getting Started

Install dependencies and start the development server from this directory:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Environment Variables

Copy `.env.example` to `.env.local` and set the server-side Hasura credentials:

```bash
cp .env.example .env.local
```

| Name | Required | Scope | Description |
| --- | --- | --- | --- |
| `HASURA_GRAPHQL_ENDPOINT` | No | Server only | Hasura GraphQL endpoint. Defaults to the current production endpoint when omitted. |
| `HASURA_ADMIN_SECRET` | Yes | Server only | Secret sent from the Next.js API route to Hasura. |
| `HASURA_GRAPHQL_ROLE` | No | Server only | Optional restricted Hasura role, for example a read-only role configured in Hasura permissions. |

Do **not** prefix these variables with `NEXT_PUBLIC_`. Values with that prefix are exposed to browser JavaScript by Next.js.

## GraphQL Proxy

Browser code sends Apollo Client requests to `/api/graphql`. The API route forwards the request to Hasura and attaches `HASURA_ADMIN_SECRET` on the server, so the admin secret is never bundled into client-side JavaScript. The route also rejects mutations, subscriptions, and introspection requests before forwarding to Hasura.

For defense in depth, configure a read-only Hasura role and set `HASURA_GRAPHQL_ROLE` so proxied requests do not execute with unrestricted admin permissions.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run storybook
npm run build-storybook
```
