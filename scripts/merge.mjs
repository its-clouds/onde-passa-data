// Merges one or more exports from an Onde Passa instance into feed.json.
// An entry for the same game (league, kickoff, home, away) replaces the existing one.
// Usage: npm run merge -- export.json [more.json...]
import { readFileSync, writeFileSync } from "node:fs";
import { compareEntries, entryKey } from "./entries.mjs";

const inputs = process.argv.slice(2);
if (inputs.length === 0) {
  console.error("usage: npm run merge -- <export.json> [more.json...]");
  process.exit(2);
}

const FEED = "feed.json";
const feed = JSON.parse(readFileSync(FEED, "utf8"));
const byKey = new Map(feed.entries.map((e) => [entryKey(e), e]));
let added = 0;
let replaced = 0;

for (const path of inputs) {
  const incoming = JSON.parse(readFileSync(path, "utf8"));
  if (incoming.version !== 1 || !Array.isArray(incoming.entries)) {
    console.error(`${path}: not a version 1 feed`);
    process.exit(1);
  }
  for (const e of incoming.entries) {
    const key = entryKey(e);
    if (byKey.has(key)) replaced++;
    else added++;
    byKey.set(key, e);
  }
}

feed.entries = [...byKey.values()].sort(compareEntries);
feed.generatedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
writeFileSync(FEED, JSON.stringify(feed, null, 2) + "\n");
console.log(`${FEED}: ${added} added, ${replaced} replaced, ${feed.entries.length} total. Run npm run validate next.`);
