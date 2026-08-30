const entryUrl = new URL(
  '../.vercel/output/functions/__server.func/index.mjs',
  import.meta.url,
);

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000';

const { default: handler } = await import(entryUrl.href);
const response = await handler.fetch(new Request(new URL('/', siteUrl)));

if (!response.ok) {
  const body = (await response.text()).slice(0, 500);
  throw new Error(
    `Vercel runtime smoke test failed with ${response.status}: ${body}`,
  );
}

console.log(`Vercel runtime smoke test passed (${response.status}).`);
