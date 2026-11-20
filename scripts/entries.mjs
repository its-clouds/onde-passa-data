// Shared by validate.mjs and merge.mjs.

/** One game per (league, kickoff, home, away). Two entries with the same key are a duplicate. */
export const entryKey = (e) => [e.league, new Date(e.startsAt).toISOString(), e.home, e.away].join("|");

/** Stable order so diffs in pull requests stay small: kickoff, then league, then home team. */
export const compareEntries = (a, b) =>
  Date.parse(a.startsAt) - Date.parse(b.startsAt) || a.league.localeCompare(b.league) || a.home.localeCompare(b.home);
