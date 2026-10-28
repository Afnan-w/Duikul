import { readFile } from "node:fs/promises";
import { join } from "node:path";

let cached: Promise<Buffer> | null = null;

/**
 * The bundled, OFL-licensed Noto Serif Bengali subset. Loading it once at
 * module scope keeps ImageResponse generation fast and deterministic.
 *
 * The subset keeps the full Bengali block plus Latin and punctuation, so it
 * can render any headline we ingest without reaching for a remote font.
 */
export function loadOgFont(): Promise<Buffer> {
  cached ??= readFile(
    join(
      process.cwd(),
      "src/assets/fonts/NotoSerifBengali-Bold-subset.ttf",
    ),
  );
  return cached;
}

export const OG_FONT = {
  name: "Noto Serif Bengali",
  style: "normal" as const,
  weight: 700 as const,
};
