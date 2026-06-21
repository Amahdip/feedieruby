/**
 * One-off script to populate fa-IR.json from en-US.json via Google Translate.
 * Run: node apps/web/scripts/translate-fa-locale.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.join(__dirname, "../locales");
const SOURCE = path.join(LOCALES_DIR, "en-US.json");
const TARGET = path.join(LOCALES_DIR, "fa-IR.json");
const CACHE = path.join(LOCALES_DIR, ".fa-IR-translate-cache.json");

const DELAY_MS = 120;
const CONCURRENCY = 4;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function translateText(text, attempt = 1) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=fa&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) {
    if (attempt < 3) {
      await sleep(DELAY_MS * attempt * 2);
      return translateText(text, attempt + 1);
    }
    throw new Error(`Translate failed (${res.status})`);
  }
  const data = await res.json();
  return data[0].map((part) => part[0]).join("");
}

function collectStrings(value, strings = new Set()) {
  if (typeof value === "string") {
    strings.add(value);
    return strings;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, strings));
    return strings;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectStrings(item, strings));
  }
  return strings;
}

function applyTranslations(value, translations) {
  if (typeof value === "string") {
    return translations.get(value) ?? value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => applyTranslations(item, translations));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, applyTranslations(item, translations)])
    );
  }
  return value;
}

async function translateWithConcurrency(items, cache) {
  let index = 0;
  let completed = 0;

  const worker = async () => {
    while (index < items.length) {
      const currentIndex = index++;
      const text = items[currentIndex];
      if (cache[text]) {
        completed++;
        continue;
      }
      try {
        cache[text] = await translateText(text);
      } catch {
        cache[text] = text;
      }
      completed++;
      if (completed % 50 === 0) {
        fs.writeFileSync(CACHE, JSON.stringify(cache), "utf8");
        console.log(`Progress: ${completed}/${items.length}`);
      }
      await sleep(DELAY_MS);
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  fs.writeFileSync(CACHE, JSON.stringify(cache), "utf8");
  return cache;
}

async function main() {
  const source = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
  const uniqueStrings = [...collectStrings(source)];
  const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};

  const pending = uniqueStrings.filter((text) => !cache[text]);
  console.log(`Translating ${pending.length}/${uniqueStrings.length} strings to Persian...`);

  if (pending.length > 0) {
    await translateWithConcurrency(pending, cache);
  }

  const translations = new Map(Object.entries(cache));
  const translated = applyTranslations(source, translations);
  fs.writeFileSync(TARGET, `${JSON.stringify(translated, null, 2)}\n`, "utf8");
  console.log(`Wrote ${TARGET}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
