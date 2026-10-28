import { describe, expect, it } from "vitest";
import {
  findFeedImage,
  parseFeedDocument,
  parseWithFastXml,
} from "../fetch";
import { plainText } from "../text";

const RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Test feed</title>
    <link>https://example.com</link>
    <description>Test</description>
    <item>
      <title><![CDATA[Bangladesh signs <b>new</b> deal]]></title>
      <link>https://example.com/story?utm_source=rss</link>
      <pubDate>Wed, 28 Oct 2026 10:00:00 +0600</pubDate>
      <description><![CDATA[<p>A short summary with &amp; entity.</p><img src="https://example.com/thumb.jpg" width="640" height="360" />]]></description>
      <content:encoded><![CDATA[<p>Longer content.</p>]]></content:encoded>
      <media:content url="https://example.com/media.jpg" medium="image" width="1200" height="675" />
      <enclosure url="https://example.com/audio.mp3" type="audio/mpeg" />
    </item>
  </channel>
</rss>`;

const ATOM = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Atom test</title>
  <entry>
    <title>Global leaders meet for climate talks</title>
    <link rel="self" href="https://example.com/feed" />
    <link rel="alternate" href="https://example.com/climate" />
    <updated>2026-10-28T08:00:00Z</updated>
    <summary>Short summary of the climate meeting.</summary>
  </entry>
</feed>`;

const RDF = `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns="http://purl.org/rss/1.0/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel rdf:about="https://example.com/rss">
    <title>RDF test</title>
  </channel>
  <item rdf:about="https://example.com/rdf-story">
    <title>An RDF news item</title>
    <link>https://example.com/rdf-story</link>
    <dc:date>2026-10-28T07:30:00Z</dc:date>
    <description>A short RDF summary text.</description>
  </item>
</rdf:RDF>`;

describe("parseFeedDocument", () => {
  it("parses RSS and prefers media:content over description images", async () => {
    const items = await parseFeedDocument(RSS);
    expect(items).toHaveLength(1);
    expect(plainText(items[0].title)).toBe("Bangladesh signs new deal");
    expect(items[0].link).toBe("https://example.com/story?utm_source=rss");
    expect(items[0].publishedAt).toContain("2026");
    expect(items[0].imageUrl).toBe("https://example.com/media.jpg");
    expect(items[0].position).toBe(0);
  });

  it("parses Atom entries", async () => {
    const items = await parseFeedDocument(ATOM);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("Global leaders meet for climate talks");
    expect(items[0].link).toBe("https://example.com/climate");
    expect(items[0].publishedAt).toContain("2026-10-28");
    expect(items[0].summary).toContain("climate meeting");
  });

  it("falls back to fast-xml-parser when rss-parser rejects a document", async () => {
    const broken = RSS.replace("<title>Test feed</title>", "<title>Test & feed</title>");
    const items = await parseFeedDocument(broken);
    expect(items).toHaveLength(1);
    expect(plainText(items[0].title)).toBe("Bangladesh signs new deal");
  });

  it("rejects HTML error pages", async () => {
    await expect(parseFeedDocument("<html><body>Forbidden</body></html>")).rejects.toThrow(
      /not an RSS or Atom feed/i,
    );
  });
});

describe("parseWithFastXml", () => {
  it("parses RDF (DW-style) feeds", () => {
    const items = parseWithFastXml(RDF);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("An RDF news item");
    expect(items[0].link).toBe("https://example.com/rdf-story");
    expect(items[0].publishedAt).toContain("2026-10-28");
  });

  it("parses Atom entries with an alternate link", () => {
    const items = parseWithFastXml(ATOM);
    expect(items).toHaveLength(1);
    expect(items[0].link).toBe("https://example.com/climate");
  });
});

describe("findFeedImage", () => {
  it("uses the first usable image source in priority order", () => {
    expect(
      findFeedImage({
        mediaContent: { "@_url": "https://example.com/a.jpg", "@_medium": "image" },
        enclosure: { url: "https://example.com/b.jpg", type: "image/jpeg" },
      }),
    ).toBe("https://example.com/a.jpg");
  });

  it("skips video media and audio enclosures", () => {
    expect(
      findFeedImage({
        mediaContent: { "@_url": "https://example.com/video.mp4", "@_medium": "video" },
        enclosure: { url: "https://example.com/audio.mp3", type: "audio/mpeg" },
        html: '<img src="https://example.com/fallback.jpg" width="800" height="450" />',
      }),
    ).toBe("https://example.com/fallback.jpg");
  });

  it("ignores tracking pixels", () => {
    expect(
      findFeedImage({
        html: '<img src="https://example.com/pixel.gif" width="1" height="1" /><img src="https://example.com/real.jpg" width="800" height="450" />',
      }),
    ).toBe("https://example.com/real.jpg");
  });

  it("returns an empty string when nothing is usable", () => {
    expect(findFeedImage({})).toBe("");
    expect(findFeedImage({ html: "<p>No image</p>" })).toBe("");
  });
});
