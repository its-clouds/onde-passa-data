// Checks a feed file: the JSON Schema, then the rules a schema can't express
// (ids that exist in the default config, no duplicate games, sorted entries).
// Usage: node scripts/validate.mjs <file>
import { readFileSync } from "node:fs";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { compareEntries, entryKey } from "./entries.mjs";

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/validate.mjs <file>");
  process.exit(2);
}

const readJson = (path) => JSON.parse(readFileSync(new URL(path, `file://${process.cwd()}/`), "utf8"));
const schema = readJson("schemas/broadcast-feed.v1.schema.json");
const allowed = readJson("allowed.json");
const feed = readJson(file);

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(schema);

const errors = [];
if (!validate(feed)) {
  for (const e of validate.errors) errors.push(`${e.instancePath || "/"} ${e.message}`);
} else {
  const leagues = new Set(allowed.leagues);
  const providers = new Set(allowed.providers);
  const seen = new Map();
  feed.entries.forEach((e, i) => {
    const at = `/entries/${i}`;
    if (!leagues.has(e.league)) errors.push(`${at}/league unknown league "${e.league}" (see allowed.json)`);
    e.providers.forEach((p, j) => {
      if (!providers.has(p)) errors.push(`${at}/providers/${j} unknown provider "${p}" (see allowed.json)`);
    });
    if (new Set(e.providers).size !== e.providers.length) errors.push(`${at}/providers has duplicates`);
    const key = entryKey(e);
    if (seen.has(key)) errors.push(`${at} duplicates /entries/${seen.get(key)} (${e.home} x ${e.away})`);
    else seen.set(key, i);
    if (i > 0 && compareEntries(feed.entries[i - 1], e) > 0) errors.push(`${at} out of order: run npm run merge to sort`);
  });
}

if (errors.length) {
  console.error(`${file}: ${errors.length} problem(s)`);
  for (const e of errors.slice(0, 50)) console.error(`  ${e}`);
  process.exit(1);
}
console.log(`${file}: ok, ${feed.entries.length} entries`);
