# onde-passa-data

Community feed of confirmed broadcasters for [Onde Passa](https://github.com/its-clouds/onde-passa): which channel shows each game, officially, in Brazil. Onde Passa instances import `feed.json` on a schedule, so a game confirmed once shows up confirmed on every instance.

## Using the feed

On your instance, set:

```bash
BROADCAST_FEED_URL=https://raw.githubusercontent.com/its-clouds/onde-passa-data/main/feed.json
```

and restart. Your own admin confirmations always override the feed. See Onde Passa's `docs/guides/shared-broadcasts.md`.

## Contributing

1. On your instance, open `/admin/transmissoes` and click "Exportar confirmações (JSON)".
2. Fork this repo, then merge your export into the feed:
   ```bash
   npm ci
   npm run merge -- ~/Downloads/onde-passa-transmissoes-2026-11-20.json
   npm run validate
   ```
   An entry for the same game (league, kickoff, home and away team) replaces the existing one. The feed is kept sorted by kickoff, so your diff only shows your games.
3. Open a pull request. Say where you confirmed the channels (the broadcaster's schedule, an official announcement).

The rules:
- **Official broadcasters only.** Provider ids are the rights holders in Onde Passa's default config, listed in `allowed.json`. No restreams.
- **No betting content** of any kind.
- **Only games you're sure about.** A wrong entry shows on every instance that imports the feed.
- Team games only (feed format v1): Brasileirão, Libertadores, Champions League, Premier League, LaLiga, Serie A, NBA, NFL.

CI checks every pull request against the JSON Schema and `allowed.json`. The maintainer reviews the channels before merging.

## Files

- `feed.json`: the feed (format version 1).
- `schemas/broadcast-feed.v1.schema.json`: its JSON Schema. A copy of `docs/schemas/broadcast-feed.v1.schema.json` in Onde Passa; change both together.
- `allowed.json`: league and provider ids accepted in the feed, from Onde Passa's default config (`src/config/default.json`). Update it when that config adds a league or provider.
- `scripts/validate.mjs`, `scripts/merge.mjs`: the checks CI runs, and the merge helper.

## Format

```json
{
  "version": 1,
  "generatedAt": "2026-11-20T12:00:00Z",
  "entries": [
    {
      "league": "brasileirao",
      "startsAt": "2026-11-22T19:00:00Z",
      "home": "Flamengo",
      "away": "Palmeiras",
      "providers": ["globo", "premiere"],
      "source": { "adapter": "espn", "eventId": "401234567" }
    }
  ]
}
```

Instances match an entry to a game by league, kickoff (within 3 hours) and team names, compared loosely (accents, case and words like "FC" or "Clube" are ignored). `source` is optional: an instance using the same data source matches on the event id exactly.
