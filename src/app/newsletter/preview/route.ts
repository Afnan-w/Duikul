import { renderWelcomeEmail } from "@/lib/newsletter/email";

export const dynamic = "force-dynamic";

/**
 * Development-only preview of the welcome email. It is deliberately not
 * available in production: the template is rendered here, never sent.
 *
 *   /newsletter/preview?locale=bn
 *   /newsletter/preview?locale=en
 */
export function GET(request: Request): Response {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  const locale =
    new URL(request.url).searchParams.get("locale") === "en" ? "en" : "bn";
  const { html } = renderWelcomeEmail(locale);

  return new Response(html, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
