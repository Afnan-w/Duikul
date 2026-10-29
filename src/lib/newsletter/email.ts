import {
  CONTACT_EMAIL,
  SITE_NAME,
  SITE_NAME_BN,
  SITE_URL,
} from "@/lib/site";
import type { NewsletterLocale } from "@/lib/newsletter/validation";

export type RenderedNewsletterEmail = {
  subject: string;
  preheader: string;
  html: string;
  text: string;
};

type EmailCopy = {
  subject: string;
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  whatLabel: string;
  items: ReadonlyArray<{ title: string; body: string }>;
  cta: string;
  note: string;
  reason: string;
  unsubscribe: string;
  privacy: string;
  location: string;
};

const BANGLA: EmailCopy = {
  subject: "খবর ডেইলিতে স্বাগতম",
  preheader: "আপনি এখন তালিকায় আছেন — প্রতিদিনের জরুরি খবর, এক ইমেইলে।",
  eyebrow: "দৈনিক সংস্করণ",
  title: "স্বাগতম।",
  intro:
    "আপনি এখন খবর ডেইলির দৈনিক সংস্করণের তালিকায় আছেন। দেশি ও বিদেশি—দুই বিভাগের যাচাই করা জরুরি খবর আমরা এক ইমেইলে সাজিয়ে পাঠাব।",
  whatLabel: "যা পাবেন",
  items: [
    {
      title: "দুই বিভাগ, এক সংস্করণ",
      body: "দেশি ও বিদেশি খবর—শুধু যেটা জানা দরকার।",
    },
    {
      title: "একাধিক সূত্রে নিশ্চিত",
      body: "স্বাধীন সূত্র একমত হলে খবরটি ‘নিশ্চিত’ হিসেবে চিহ্নিত হয়।",
    },
    {
      title: "মূল সূত্রে সরাসরি লিংক",
      body: "আমরা প্রতিবেদন পুনর্লিখন বা অনুবাদ করি না; মূল প্রকাশকের কাছে যান।",
    },
  ],
  cta: "আজকের সংস্করণ পড়ুন",
  note: "দিনে একটি ইমেইল। কোনো স্প্যাম নয়।",
  reason:
    "এই ইমেইলটি পেয়েছেন কারণ আপনি খবর ডেইলির দৈনিক সংস্করণের জন্য সাইনআপ করেছেন।",
  unsubscribe:
    "পেতে না চাইলে এই ইমেইলের উত্তর দিন অথবা hello@khobordaily.com-এ লিখুন।",
  privacy: "গোপনীয়তা নীতি",
  location: "ঢাকা, বাংলাদেশ",
};

const ENGLISH: EmailCopy = {
  subject: "Welcome to KhoborDaily",
  preheader: "You’re on the list — the day’s essential news, in one email.",
  eyebrow: "The daily edition",
  title: "Welcome.",
  intro:
    "You’re on the list for KhoborDaily’s daily edition. We’ll bring Bangladesh and the world together in one calm, verified read.",
  whatLabel: "What you’ll get",
  items: [
    {
      title: "Two sections, one edition",
      body: "Bangladesh and the world — only what’s worth knowing.",
    },
    {
      title: "Confirmed across sources",
      body: "Stories are marked confirmed when independent outlets agree.",
    },
    {
      title: "A direct link to the source",
      body: "We don’t rewrite or translate the reporting. Read the original.",
    },
  ],
  cta: "Read today’s edition",
  note: "One email a day. No spam.",
  reason:
    "You received this because you signed up for KhoborDaily’s daily edition.",
  unsubscribe: `To stop receiving it, reply to this email or write to ${CONTACT_EMAIL}.`,
  privacy: "Privacy policy",
  location: "Dhaka, Bangladesh",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

/**
 * Builds the bilingual welcome email. It is intentionally a static,
 * table-based template: no remote images, no custom scripts, and no
 * personalization beyond the chosen locale. Nothing in the app sends it yet.
 */
export function renderWelcomeEmail(
  locale: NewsletterLocale,
): RenderedNewsletterEmail {
  const copy = locale === "en" ? ENGLISH : BANGLA;
  const year = new Date().getFullYear();
  const campaignUrl = `${SITE_URL}/?utm_source=newsletter&utm_medium=email&utm_campaign=welcome`;
  const privacyUrl = `${SITE_URL}/privacy`;

  const itemRows = copy.items
    .map(
      (item, index) => `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 ${
                index === copy.items.length - 1 ? 0 : 14
              }px;">
                <tr>
                  <td width="18" valign="top" style="padding-top:4px;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:1.4;color:#0f5b45;">&#9679;</td>
                  <td valign="top">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;line-height:1.5;color:#1f1d1a;">${escapeHtml(
                      item.title,
                    )}</p>
                    <p style="margin:2px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.65;color:#6b665e;">${escapeHtml(
                      item.body,
                    )}</p>
                  </td>
                </tr>
              </table>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="${locale}" dir="ltr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>${escapeHtml(copy.subject)}</title>
    <style>
      @media only screen and (max-width: 620px) {
        .kd-shell { padding: 20px 10px !important; }
        .kd-card { padding: 28px 20px !important; }
        .kd-title { font-size: 30px !important; }
        .kd-button { display: block !important; text-align: center !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f0ea;">
    <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(
      copy.preheader,
    )}</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f3f0ea">
      <tr>
        <td class="kd-shell" align="center" style="padding:32px 12px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
            <tr>
              <td style="padding:0 0 18px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="42" height="42" align="center" valign="middle" bgcolor="#0f5b45" style="border-radius:12px;font-family:Georgia,'Noto Serif Bengali',serif;font-size:21px;font-weight:bold;line-height:1;color:#faf8f5;">খ</td>
                    <td style="padding-left:12px;">
                      <div style="font-family:Georgia,'Noto Serif Bengali',serif;font-size:22px;font-weight:bold;line-height:1.25;color:#1f1d1a;">${SITE_NAME_BN}</div>
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:bold;line-height:1.4;letter-spacing:0.18em;text-transform:uppercase;color:#6b665e;">${SITE_NAME}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="background-color:#faf8f5;border:1px solid #e4dfd6;border-radius:14px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td height="4" bgcolor="#0f5b45" style="font-size:0;line-height:0;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td class="kd-card" style="padding:38px 40px 36px;">
                      <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:bold;line-height:1.5;letter-spacing:0.16em;text-transform:uppercase;color:#0f5b45;">${escapeHtml(
                        copy.eyebrow,
                      )}</p>
                      <h1 class="kd-title" style="margin:0;font-family:Georgia,'Noto Serif Bengali',serif;font-size:38px;font-weight:bold;line-height:1.25;color:#1f1d1a;">${escapeHtml(
                        copy.title,
                      )}</h1>
                      <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.75;color:#1f1d1a;">${escapeHtml(
                        copy.intro,
                      )}</p>

                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0;">
                        <tr>
                          <td height="1" bgcolor="#e4dfd6" style="font-size:0;line-height:0;">&nbsp;</td>
                        </tr>
                      </table>

                      <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:bold;line-height:1.5;letter-spacing:0.16em;text-transform:uppercase;color:#6b665e;">${escapeHtml(
                        copy.whatLabel,
                      )}</p>
                      ${itemRows}

                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;">
                        <tr>
                          <td bgcolor="#0f5b45" style="border-radius:999px;">
                            <a class="kd-button" href="${escapeHtml(
                              campaignUrl,
                            )}" style="display:inline-block;padding:14px 24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;line-height:1;color:#faf8f5;text-decoration:none;">${escapeHtml(
                              copy.cta,
                            )}</a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#6b665e;">${escapeHtml(
                        copy.note,
                      )}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:22px 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.7;color:#6b665e;">
                <p style="margin:0 0 10px;">${escapeHtml(copy.reason)}</p>
                <p style="margin:0 0 10px;">${escapeHtml(copy.unsubscribe)}</p>
                <p style="margin:0;">
                  <a href="${escapeHtml(
                    SITE_URL,
                  )}" style="color:#0f5b45;text-decoration:underline;">${SITE_NAME}</a>
                  &nbsp;·&nbsp;
                  <a href="${escapeHtml(
                    privacyUrl,
                  )}" style="color:#0f5b45;text-decoration:underline;">${escapeHtml(
                    copy.privacy,
                  )}</a>
                </p>
                <p style="margin:10px 0 0;">${escapeHtml(
                  copy.location,
                )} &nbsp;·&nbsp; © ${year} ${SITE_NAME}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const textItems = copy.items
    .map((item) => `• ${item.title}\n  ${item.body}`)
    .join("\n\n");

  const text = `${SITE_NAME_BN} — ${copy.subject}

${copy.intro}

${copy.whatLabel.toUpperCase()}

${textItems}

${copy.cta}: ${campaignUrl}

${copy.note}

${copy.reason}
${copy.unsubscribe}
${copy.privacy}: ${privacyUrl}

${copy.location} · © ${year} ${SITE_NAME}
`;

  return {
    subject: copy.subject,
    preheader: copy.preheader,
    html,
    text,
  };
}
