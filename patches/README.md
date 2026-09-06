# Next.js response headers

`next@16.3.4.patch` fixes the App Router runtime overwriting `Vary` before
rendering a page. It merges existing fields with Next.js's required RSC fields,
deduplicates field names case-insensitively, and preserves `Vary: *` semantics.
Both shipped module formats receive the same change.

Upstream issue: https://github.com/vercel/next.js/issues/85999

Upstream proposed fix: https://github.com/vercel/next.js/pull/91039

The pinned version and Bun's `patchedDependencies` make the fix reproducible
on installation. `bun run test:http` verifies the actual production response;
testing Proxy alone would miss the overwrite.

When upgrading Next.js, first check whether the upstream fix has shipped. Remove
this patch only when the production HTTP tests pass against the unpatched version.
