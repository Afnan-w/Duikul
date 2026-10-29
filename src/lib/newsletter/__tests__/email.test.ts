import { describe, expect, it } from "vitest";
import { renderWelcomeEmail } from "@/lib/newsletter/email";
import { SITE_URL } from "@/config/site";

describe("renderWelcomeEmail", () => {
  it("renders the Bangla welcome email with a plain-text alternative", () => {
    const email = renderWelcomeEmail("bn");

    expect(email.subject).toBe("দুইকুলে স্বাগতম");
    expect(email.preheader).toContain("তালিকায়");
    expect(email.html.startsWith("<!doctype html>")).toBe(true);
    expect(email.html).toContain('lang="bn"');
    expect(email.html).toContain("দুইকুল");
    expect(email.html).toContain("স্বাগতম।");
    expect(email.html).toContain("প্রতিদিনের");
    expect(email.html).toContain(`${SITE_URL}/privacy`);
    expect(email.html).toContain("utm_source=newsletter");
    expect(email.html).toContain('role="presentation"');
    expect(email.html).not.toContain("<script");
    expect(email.html).not.toContain("{{");
    expect(email.text).toContain("দুইকুল");
    expect(email.text).toContain("আজকের সংস্করণ");
    expect(email.text).toContain(`${SITE_URL}/privacy`);
  });

  it("renders the English welcome email when requested", () => {
    const email = renderWelcomeEmail("en");

    expect(email.subject).toBe("Welcome to Duikul");
    expect(email.preheader).toContain("You’re on the list");
    expect(email.html).toContain('lang="en"');
    expect(email.html).toContain("Welcome.");
    expect(email.html).toContain("Read today’s edition");
    expect(email.html).toContain("hello@duikul.com");
    expect(email.text).toContain("Welcome to Duikul");
    expect(email.text).toContain("Dhaka, Bangladesh");
  });

  it("keeps layout tables presentation-only", () => {
    const email = renderWelcomeEmail("bn");
    expect(email.html.match(/role="presentation"/g)?.length ?? 0).toBeGreaterThan(
      3,
    );
    expect(email.html).toContain("@media only screen and (max-width: 620px)");
  });
});
