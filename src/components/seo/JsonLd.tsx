import { serializeJsonLd, type JsonLd } from "@/lib/seo/jsonld";

/**
 * Renders one or more schema.org nodes as an inline JSON-LD script block.
 *
 * Uses `dangerouslySetInnerHTML` only through `serializeJsonLd`, which escapes
 * `<`, so no story text can break out of the script tag.
 */
export function JsonLd({ data }: { data: JsonLd | readonly JsonLd[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
