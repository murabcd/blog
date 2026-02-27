# Repository Guidelines

## Project Structure & Module Organization
This is a Next.js 16 App Router project with Convex-backed content storage.

- `app/`: routes, layouts, API route handlers, metadata images, and global styles.
- `components/`: reusable UI and feature components (`components/ui` for primitives).
- `content/`: source markdown/MDX content (`blog/`, `talk/`, `code/`, `chat.md`).
- `convex/`: schema, queries/mutations/actions, and generated API types.
- `scripts/`: utility scripts (notably `scripts/sync-content.ts` for MD/MDX sync).
- `lib/`, `hooks/`, `public/`: shared utilities, React hooks, and static assets.

## Build, Test, and Development Commands
- `bun install`: install dependencies.
- `bun run dev`: run Next.js locally on `localhost:3000`.
- `bun run dev:all`: run frontend and Convex backend in parallel.
- `bun run build` / `bun run start`: production build and local prod server.
- `bun run type-check`: TypeScript validation (`tsc --noEmit`).
- `bun run check`: Biome format + lint pass for `app/`.
- `bun run sync`: sync local content files into Convex.
- `bun run sync:prod`: sync against production env (`.env.production.local`).

## Coding Style & Naming Conventions
- TypeScript + React function components throughout.
- Formatting and linting use Biome (`biome.json`): tabs for indentation, double quotes, recommended lint rules.
- Route files follow Next.js App Router conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, `route.ts`).
- Use descriptive kebab-case slugs for content files (for example `agent-building-patterns.mdx`).

## Testing Guidelines
There is currently no dedicated unit/integration test suite configured. Minimum pre-PR quality checks:

- `bun run type-check`
- `bun run check`
- `bun run build`

For content changes, also run `bun run sync` and verify affected routes load correctly.

## Commit & Pull Request Guidelines
Follow the existing Conventional Commit style seen in history:

- `feat: ...`, `fix: ...`, `perf: ...`, `docs: ...`, `style: ...`

Keep commits focused and scoped. PRs should include:

- clear summary and rationale,
- linked issue (if applicable),
- screenshots/GIFs for UI changes,
- notes on env/schema/content sync impacts (for example Convex schema or `content/` updates).
