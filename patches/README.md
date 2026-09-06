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

On Vercel, the rendered route's `Vary` still overrides the configured field.
`vercel.json` appends `Accept` with a
[response header transform](https://vercel.com/docs/project-configuration/vercel-json#route-transforms)
at the delivery layer, preserving the framework's RSC fields.

Verify the deployed response with the same HTTP contracts:

```sh
PUBLIC_HTTP_ORIGIN=https://murabcd.vercel.app bunx vitest run --config vitest.http.config.ts
```

When upgrading Next.js, first check whether the upstream fix has shipped. Remove
this patch only when both local and deployed HTTP tests pass against the unpatched version.
