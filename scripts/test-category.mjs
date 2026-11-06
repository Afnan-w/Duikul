/*
  Quick test of the category guesser. Run: node scripts/test-category.mjs
  (compiled on the fly with tsc would be heavy - we re-implement the
  same logic inline for a fast check, and also print what the real
  module says via a tiny tsx-free import trick.)
*/

// We can't import TS directly in plain node, so test the LOGIC by
// loading the compiled rule set from the source file text.
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../lib/rss.ts", import.meta.url), "utf8");

// Extract CATEGORY_KEYWORDS block and eval it safely (strip TS types).
const start = src.indexOf("const CATEGORY_KEYWORDS");
const end = src.indexOf("];", start) + 2;
const block = src
  .slice(start, end)
  .replace(/const CATEGORY_KEYWORDS:[^=]+=/, "const CATEGORY_KEYWORDS =");
const CATEGORY_KEYWORDS = eval(block + "; CATEGORY_KEYWORDS");

// Mirror of hasWord() in lib/rss.ts (kept in sync by hand for this test).
function hasWord(text, word) {
  const clean = word.trim();
  if (!clean) return false;

  if (/^[\x00-\x7F]+$/.test(clean)) {
    const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}(?:s|es)?\\b`, "i").test(text);
  }

  const bnLetter = /[\u0980-\u09FF]/;
  const bnContinuation = /[\u09BE-\u09CC\u09D7\u09CD\u0981-\u0983\u09BC\u09C1\u09C2\u09C4]/;
  const letters = [...clean].filter((ch) => bnLetter.test(ch)).length;
  if (letters >= 4) return text.includes(clean);

  let from = 0;
  for (;;) {
    const at = text.indexOf(clean, from);
    if (at === -1) return false;
    const before = at > 0 ? text[at - 1] : "";
    const after = text[at + clean.length] ?? "";
    const startsWord = before === "" || !bnLetter.test(before);
    const continuesWord =
      after !== "" && bnLetter.test(after) && !bnContinuation.test(after);
    if (startsWord && !continuesWord) return true;
    from = at + 1;
  }
}

function guess(title, labels = []) {
  for (const { slug, words } of CATEGORY_KEYWORDS) {
    if (labels.some((label) => words.some((w) => hasWord(label, w)))) return slug;
  }
  for (const { slug, words } of CATEGORY_KEYWORDS) {
    if (words.some((w) => hasWord(title, w))) return slug;
  }
  return "general";
}

const CASES = [
  ["হামলার পর ভ্যান্সের দাবি: ইরানের সঙ্গে আলোচনায় ভালো অগ্রগতি হচ্ছে!", "politics"],
  ["এবার বলিউড অভিনেত্রী দিয়া মির্জার ভিডিও বার্তা ফেরানোর নির্দেশ হাইকোর্টের", "entertainment"],
  ["US midterm elections: Voting gets underway", "politics"],
  ["LPG prices rise, 12kg cylinder now Tk 2,060", "business"],
  ["Measles outbreak: Death toll reaches 1,263 as 6 die in 24hrs", "health"],
  ["ডেঙ্গুতে ৬ জনের মৃত্যু, হাসপাতালে ভর্তি ২০১০", "health"],
  ["বিশ্বকাপ ফাইনালের চেয়েও বেশি চাহিদা ভারত-পাকিস্তান ম্যাচে", "sports"],
  ["বাংলালিংকের অ্যাপের নতুন রূপ মুক্ত", "technology"],
  ["Warsaw Modlin airport resumes operations after bomb threat", "general"],
  ["UK and EU agree draft deal to scrap Brexit red tape over food exports", "business"],
  ["Nahida to lead B'desh in Women's Emerging Nations Trophy", "sports"],
  ["Shafiqur, Singapore envoy discuss July Charter, state reforms", "politics"],
  ["‘ই’ টায়ারে রানার্স আপ, টুর্নামেন্টে ১৩০ তম", "sports"],
  ["ইরানের সঙ্গে আলোচনা চলছে", "politics"], // "রান" must NOT fire sports here
  ["কাপড়ের দাম বাড়লো বাজারে", "business"], // "কাপ" must NOT fire sports
  ["US conducts series of defensive strikes against Iran", "general"], // "series" must NOT fire entertainment
  ["Alaska Senate candidates trade accusations ahead of election", "politics"], // "trade" must NOT fire business
  ["Zelenskyy arrives in Berlin for talks with Merz on air defense", "politics"],
  ["টেকনাফে মানবপাচারকারীদের সঙ্গে যৌথ বাহিনীর গোলাগুলি, আহত সেনাসদস্যের মৃত্যু", "general"], // "গোল" must NOT fire sports
  ["গোলাপি ঘাসের সমুদ্র দেখতে ছুটছে মানুষ", "general"], // গোলাপি != গোল
];

console.log("=== CATEGORY GUESSER TEST ===");
let fails = 0;
for (const [title, expected] of CASES) {
  const got = guess(title);
  const ok = got === expected;
  if (!ok) fails++;
  console.log(`${ok ? "OK  " : "FAIL"} | expected ${expected.padEnd(14)} got ${got.padEnd(14)} | ${title.slice(0, 60)}`);
}
console.log(`\n${CASES.length - fails}/${CASES.length} passed`);
