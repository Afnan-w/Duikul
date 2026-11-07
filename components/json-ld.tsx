/*
  JSON-LD SCRIPT
  --------------
  Renders one (or a list of) structured-data entities into the page.
  A pure server component — no hooks, no client JS.
*/

export function JsonLd({ data }: { data: unknown | unknown[] }) {
  // JSON inside HTML must never contain a raw "<".
  const payload = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: payload }}
    />
  );
}
