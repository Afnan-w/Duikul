import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";
import { staticPages } from "@/lib/static-pages";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  path: "/contact",
  kicker: "যোগাযোগ — দুইকূল",
  title: "যোগাযোগ — চট্টগ্রাম, বাংলাদেশ | Contact Duikul",
  ogTitle: "যোগাযোগ — দুইকূল",
  description:
    "প্রশ্ন, পরামর্শ বা ভুল তথ্য জানাতে দুইকূলের সঙ্গে যোগাযোগ করুন — ইমেইল, ঠিকানা ও উত্তরের সময়। ৪৮ ঘণ্টার মধ্যে উত্তরপত্রের প্রতিশ্রুতি।",
});

export default function ContactPage() {
  return <StaticPage id="contact" />;
}
