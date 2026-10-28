import { describe, expect, it } from "vitest";
import { checkBlocklist, isBlocked } from "../blocklist";

describe("clickbait blocklist", () => {
  it("blocks explicit engagement bait", () => {
    expect(isBlocked("You won't believe what happened next in Dhaka")).toBe(
      true,
    );
    expect(isBlocked("This one trick will change your commute")).toBe(true);
  });

  it("blocks Bangla clickbait phrases", () => {
    expect(isBlocked("আপনি বিশ্বাস করবেন না, ঢাকায় এমন ঘটনা ঘটেছে")).toBe(true);
    expect(isBlocked("ভাইরাল ভিডিও দেখুন এখনই")).toBe(true);
  });

  it("blocks shouting headlines with enough words", () => {
    expect(
      isBlocked("BREAKING MASSIVE PROTEST SHUTS DOWN THE ENTIRE CITY TODAY"),
    ).toBe(true);
  });

  it("does not block acronym-heavy but calm headlines", () => {
    expect(isBlocked("IMF and World Bank meet Bangladesh officials in Dhaka")).toBe(
      false,
    );
    expect(
      isBlocked("BCB announces squad for the upcoming Asia Cup tournament"),
    ).toBe(false);
  });

  it("blocks punctuation abuse", () => {
    expect(isBlocked("Dhaka traffic is finally fixed!!!")).toBe(true);
  });

  it("keeps ordinary editorial headlines", () => {
    const clean = [
      "Bangladesh, Japan sign six deals and pledge two loan projects",
      "জাপানের সঙ্গে ছয়টি চুক্তি স্বাক্ষর করল বাংলাদেশ",
      "Bangladesh Bank holds policy rate at 10 percent",
      "Dhaka court sentences three in corruption case",
    ];
    for (const title of clean) {
      expect(checkBlocklist(title)).toEqual({ blocked: false });
    }
  });

  it("explains why a headline was blocked", () => {
    const verdict = checkBlocklist("SHOCKING news from the capital city today");
    expect(verdict.blocked).toBe(true);
    if (verdict.blocked) {
      expect(verdict.reason).toBeTruthy();
    }
  });
});
