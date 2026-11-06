/*
  ============================================================
  STATIC PAGES CONTENT  (About, Contact, Privacy, Terms, ...)
  ============================================================
  One place for the text of every trust/legal page, in both languages.
  Stage F expands these into the full, publishable drafts.
*/

export type StaticPageContent = {
  title: { bn: string; en: string };
  intro: { bn: string; en: string };
  body: { bn: string[]; en: string[] };
};

export const staticPages: Record<string, StaticPageContent> = {
  about: {
    title: { bn: "আমাদের সম্পর্কে", en: "About Us" },
    intro: {
      bn: "Duikul একটি সংবাদ সংকলন সাইট — আমরা সংবাদ লিখি না, বিশ্বস্ত সংবাদমাধ্যমগুলোর প্রতিবেদন এক জায়গায় সাজিয়ে দিই।",
      en: "Duikul is a news aggregator — we do not write the news. We collect reporting from trusted outlets and present it in one place.",
    },
    body: {
      bn: [
        "প্রতিটি সংবাদ তার মূল সূত্রেই যুক্ত থাকে। আমরা কোনো পূর্ণ নিবন্ধ কপি করি না — শিরোনাম, ছবির ক্রেডিট, দুই-তিন বাক্যের সারসংক্ষেপ এবং ‘পূর্ণ সংবাদ পড়ুন’ বোতাম দেখাই।",
        "একই ঘটনা কয়েকটি বিশ্বস্ত সংবাদমাধ্যম যদি একসাথে প্রতিবেদন করে, তাহলে সেটি আমাদের হোমপেজে এগিয়ে থাকে এবং সেখানে লেখা থাকে ‘কতজন সূত্র প্রতিবেদন করেছে’।",
        "আমাদের সম্পাদনী নীতি ও সংশোধনী নীতি পাতায় পুরো পদ্ধতিটি বিস্তারিত লেখা আছে।",
      ],
      en: [
        "Every story stays linked to its original source. We never copy full articles — we show the headline, an image with credit, a two or three sentence excerpt, and a “Read full story” button.",
        "When several trusted outlets report the same event at the same time, that story rises to the top of our home page and shows exactly how many sources are reporting it.",
        "Our Editorial Policy and Corrections pages describe the full method in plain language.",
      ],
    },
  },

  contact: {
    title: { bn: "যোগাযোগ", en: "Contact" },
    intro: {
      bn: "প্রশ্ন, পরামর্শ বা ভুল তথ্য জানাতে আমাদের লিখুন।",
      en: "Write to us with questions, suggestions, or to flag something wrong.",
    },
    body: {
      bn: [
        "ইমেইল: hello@duikul.example.com",
        "সংবাদ সম্পাদক: editor@duikul.example.com",
        "ঠিকানা: ঢাকা, বাংলাদেশ",
        "আমরা সাধারণত ৪৮ ঘণ্টার মধ্যে উত্তর দিই।",
      ],
      en: [
        "Email: hello@duikul.example.com",
        "Editor: editor@duikul.example.com",
        "Address: Dhaka, Bangladesh",
        "We usually reply within 48 hours.",
      ],
    },
  },

  "editorial-policy": {
    title: { bn: "সম্পাদনী নীতি", en: "Editorial Policy" },
    intro: {
      bn: "কোন সংবাদ কীভাবে বেছে নেওয়া হয় এবং কীভাবে র‍্যাঙ্ক করা হয় — সহজ ভাষায়।",
      en: "How we choose and rank stories, in plain language.",
    },
    body: {
      bn: [
        "শুধুমাত্র সাদা তালিকাভুক্ত (whitelist) সংবাদমাধ্যম থেকেই সংবাদ আসে। প্রতিটি সূত্রের জন্য sources.ts ফাইলে একটি বিশ্বাসস্তর (trust level) নির্ধারিত।",
        "জনপ্রিয়তা মানে সংখ্যা: একই ঘটনা যত বেশি বিশ্বস্ত সংবাদমাধ্যম প্রতিবেদন করে, তত এগিয়ে থাকে। নতুন সংবাদকেও অগ্রাধিকার দেওয়া হয়।",
        "আমরা কখনো ‘১০০% যাচাইকৃত’ বলি না। ব্যাজে শুধু লেখা থাকে কতজন সূত্র প্রতিবেদন করেছে এবং তাদের নাম ও লিংক।",
      ],
      en: [
        "Only whitelisted outlets are used. Every source has a trust level set in the sources.ts file.",
        "Popularity means numbers: the more trusted outlets report the same story, the higher it ranks. Newer stories are also boosted.",
        "We never claim “100% verified”. Our badge only states how many outlets are reporting a story, with their names and links.",
      ],
    },
  },

  corrections: {
    title: { bn: "সংশোধনী নীতি", en: "Corrections Policy" },
    intro: {
      bn: "ভুল পেলে আমরা সংশোধন করি এবং স্বচ্ছভাবে জানাই।",
      en: "When something is wrong, we fix it and say so openly.",
    },
    body: {
      bn: [
        "Duikul নিজে সংবাদ লেখে না, তাই ভুল হলে সাধারণত মূল সূত্রেই সংশোধন হয়।",
        "আমাদের নিজের কোনো ভুল থাকলে (শিরোনাম, অনুবাদ, সময় বা বিভাগ) সেটি ঠিক করে সংশোধনী বার্তা যোগ করা হয়।",
        "অনুরোধ: editor@duikul.example.com",
      ],
      en: [
        "Duikul does not write its own articles, so factual errors are normally fixed at the original source.",
        "If we get something wrong — a headline, a translation, a time or a category — we correct it and add a correction note.",
        "Requests: editor@duikul.example.com",
      ],
    },
  },

  privacy: {
    title: { bn: "গোপনীয়তা নীতি", en: "Privacy Policy" },
    intro: {
      bn: "আপনার তথ্য আমরা কীভাবে ব্যবহার করি।",
      en: "How we handle your information.",
    },
    body: {
      bn: [
        "Duikul ব্যক্তিগত তথ্য সংগ্রহ করে না। থিম (ডার্ক/লাইট), ভাষা ও লেখার আকারের মতো পছন্দগুলো শুধু আপনার নিজের ব্রাউজারে সংরক্ষিত থাকে।",
        "বিশ্লেষণ হিসেবে আমরা Vercel Analytics ব্যবহার করি, যা কুকি ছাড়াই সাইটের সামগ্রিক দর্শন সংখ্যা মাপে।",
        "কোনো বিজ্ঞাপন নেই, কোনো তৃতীয় পক্ষের ট্র্যাকিং নেই।",
      ],
      en: [
        "Duikul collects no personal information. Preferences such as theme, language and text size are stored only in your own browser.",
        "For analytics we use Vercel Analytics, which measures overall page views without cookies.",
        "There are no advertisements and no third-party tracking.",
      ],
    },
  },

  terms: {
    title: { bn: "শর্তাবলি", en: "Terms of Use" },
    intro: {
      bn: "সাইটটি ব্যবহারের শর্ত।",
      en: "The terms for using this site.",
    },
    body: {
      bn: [
        "সকল সংবাদ ও ছবি তাদের নিজ নিজ সংবাদমাধ্যমের। আমরা শুধু শিরোনাম, সংক্ষিপ্ত সারসংক্ষেপ ও মূল লিংক দিই।",
        "সাইটটি ‘যেমন আছে’ ভাবে দেওয়া হয়। কোনো নির্দিষ্ট ফলাফলের নিশ্চয়তা নেই।",
        "ব্যবহারকারী যেকোনো সময় আমাদের সঙ্গে যোগাযোগ করতে পারেন।",
      ],
      en: [
        "All articles and images belong to their respective news organisations. We only provide headlines, a short excerpt and the original link.",
        "The site is provided “as is”, with no guarantee of any particular result.",
        "You may contact us at any time about these terms.",
      ],
    },
  },
};
