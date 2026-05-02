# Birds progression spec

This is the source of truth for Birds progression economy tuning.

- Runtime spec object: `BIRD_PROGRESSION_SPEC`
- Code location: `JS Files/nature-challenge-tab-system.js`
- Console access: `window.BIRD_PROGRESSION_SPEC`

## Design goals

- Reward consistency without making the system feel grindy.
- Mix easy momentum wins with medium-term skill and variety goals.
- Encourage learning through taxonomy, seasonal timing, confidence, and evidence.
- Keep goals attainable with the current Birds dataset and log form inputs.

## Tuning rule

Adjust values in `BIRD_PROGRESSION_SPEC` (goal, xp, copy, limits) and keep render code unchanged.

## Progression ladder

The Birds system now uses a four-step ladder so the order and reward curve feel intentional instead of flat:

- **Beginner** — fast wins that teach the loop and create momentum.
- **Intermediate** — variety and consistency goals that ask for more deliberate field logging.
- **Advanced** — stronger identification, evidence, and taxonomy goals.
- **Seasonal / Mastery** — long-horizon or chapter-style goals meant to feel special.

Design intent:

- Lower tiers appear earlier in full collections and get a light priority bump in overview recommendations.
- Higher tiers pay out more XP on average and ask for stronger habits or longer timelines.
- Badge rarity still exists separately from tier, so a badge can be both `epic` and `advanced`.

## Reward presentation mode

Birds collection view now includes a presentation layer to make progression feel more educational and game-like.

### Tier learning copy

Each tier includes short instructional text shown on collection cards:

- `Beginner`: build consistency and core logging habits.
- `Intermediate`: expand variety across habitat/region/season contexts.
- `Advanced`: improve identification quality with confidence, evidence, and taxonomy.
- `Seasonal / Mastery`: sustain long-horizon progression and chapter milestones.

### Collection tier controls

In collection view (`Challenges`, `Badges`, `Seasonal Quests`), users can:

- See a compact **Path progress** header with overall completion percent and completed/total goals.
- When a specific tier filter is selected, also see a secondary progress row for that filtered tier.
- Filter cards by tier (`All`, `Beginner`, `Intermediate`, `Advanced`, `Seasonal / Mastery`).
- Toggle **Almost complete** mode to show only cards that are near finish (`remaining <= 1` or `>= 80%`).
- Toggle `Path mode` on/off.

### Card scannability tags

Progression cards now include a compact time-horizon chip to support planning at a glance:

- `Quick`
- `This week`
- `Seasonal`
- `Long-term`

UI preference persistence:

- `collectionTierFilter`
- `collectionPathMode`

Both are stored in Birds UI preferences (`BIRD_UI_PREFS_KEY`) and restored on load.

### Path mode behavior

Path mode is currently a **presentation-only** game layer:

- Tier lanes are displayed with completion counts.
- Lanes are considered unlocked when the prior tier reaches 60% completion.
- Higher-tier locked cards are visually dimmed and annotated.
- Core progression logic, XP, completion calculations, and unlock conditions are unchanged.

## Global controls

| Key | Meaning | Current |
|---|---|---:|
| `dailyPickCount` | Number of daily micro-challenges shown | 3 |
| `streak.freezeAwardEveryDays` | Days per freeze reward | 7 |
| `streak.maxFreezeCredits` | Cap on banked freeze credits | 3 |
| `bingo.tileCount` | Tiles shown in seasonal bingo | 9 |
| `bingo.rerollLimitPerSeason` | Allowed bingo rerolls per season | 1 |
| `bingo.badgeGoalTiles` | Tiles needed for bingo badge progress | 3 |

## Challenges

| Tier | ID | Title | Metric | Goal | XP |
|---|---|---|---|---:|---:|
| Beginner | `challenge-daily-pulse` | Daily Pulse | `todayLogCount` | 1 | 40 |
| Beginner | `challenge-weekly-wings` | Weekly Wings | `weeklySightedCount` | 3 | 80 |
| Beginner | `challenge-family-forager` | Family Forager | `familiesStarted` | 12 | 120 |
| Intermediate | `challenge-monthly-milestone` | Monthly Milestone | `monthlySightedCount` | 10 | 140 |
| Intermediate | `challenge-season-sweep` | `{seasonLabel} Sweep` | `inSeasonSightedCount` | 15 | 130 |
| Intermediate | `challenge-rare-radar` | Rare Radar | `rareSightedCount` | 5 | 170 |
| Intermediate | `challenge-migration-mapper` | Migration Mapper | `migrationSightedCount` | 8 | 150 |
| Intermediate | `challenge-habitat-hopper` | Habitat Hopper | `seasonHabitatCount` | 4 | 165 |
| Intermediate | `challenge-region-circuit` | Region Circuit | `seasonRegionCount` | 4 | 165 |
| Advanced | `challenge-confident-calls` | Confident Calls | `totalCertainLogCount` | 12 | 160 |
| Advanced | `challenge-proof-of-presence` | Proof of Presence | `evidenceLogCount` | 6 | 170 |
| Advanced | `challenge-genus-journey` | Genus Journey | `generaSightedCount` | 18 | 190 |
| Advanced | `challenge-quarterly-flight-plan` | Quarterly Flight Plan | `quarterlySightedCount` | 25 | 220 |
| Seasonal / Mastery | `challenge-season-questline` | Season Questline | `seasonalLogCount` | 12 | 180 |
| Seasonal / Mastery | `challenge-season-bridge` | Season Bridge | `loggedSeasonCount` | 2 | 175 |
| Seasonal / Mastery | `challenge-lifetime-lister` | Lifetime Lister | `totalSighted` | 100 | 300 |

## Daily Micro-Challenges

| ID | Title | Metric | Goal | XP |
|---|---|---|---:|---:|
| `daily-log-1` | Show Up Today | `todayLogCount` | 1 | 30 |
| `daily-new-species` | Fresh Feathers | `todayUniqueSpeciesCount` | 2 | 45 |
| `daily-context-mix` | Context Mixer | `todayContextMixCount` | 2 | 35 |
| `daily-rare` | Rare Radar (Daily) | `todayRareLogCount` | 1 | 55 |
| `daily-confidence` | Certain Signal | `todayCertainCount` | 2 | 40 |
| `daily-evidence` | Field Proof | `todayEvidenceLogCount` | 1 | 45 |
| `daily-family-mix` | Family Mix | `todayFamilyMixCount` | 2 | 45 |

## Seasonal questline

| Tier | ID | Title | Metric | Goal | XP |
|---|---|---|---|---:|---:|
| Beginner | `sq-1` | Scout Phase | `seasonalLogCount` | 5 | 80 |
| Intermediate | `sq-2` | Variety Phase | `seasonHabitatCount` | 3 | 90 |
| Advanced | `sq-3` | Rare Phase | `rareSightedCount` | 2 | 110 |
| Seasonal / Mastery | `sq-4` | Mastery Phase | `seasonalLogCount` | 15 | 140 |

## Badges

| Tier | ID | Title | Rarity | Metric | Goal | XP |
|---|---|---|---|---|---:|---:|
| Beginner | `badge-first-feather` | First Feather | common | `totalSighted` | 1 | 50 |
| Beginner | `badge-common-core` | Common Core | common | `commonSightedCount` | 25 | 120 |
| Intermediate | `badge-streak-keeper` | Streak Keeper | rare | `streak.currentStreak` | 7 | 210 |
| Intermediate | `badge-rare-find` | Rare Find | rare | `rareSightedCount` | 5 | 180 |
| Intermediate | `badge-migration-mapper` | Migration Mapper | rare | `migrationSightedCount` | 10 | 220 |
| Intermediate | `badge-habitat-naturalist` | Habitat Naturalist | rare | `totalHabitatCount` | 4 | 220 |
| Intermediate | `badge-region-ranger` | Region Ranger | rare | `totalRegionCount` | 4 | 220 |
| Advanced | `badge-season-spotter` | `{seasonLabel} Spotter` | epic | `inSeasonSightedCount` | 20 | 260 |
| Advanced | `badge-family-finisher` | Family Finisher | epic | `familiesCompleted` | 1 | 280 |
| Advanced | `badge-sharp-eyed` | Sharp-Eyed | epic | `totalCertainLogCount` | 30 | 290 |
| Advanced | `badge-proof-positive` | Proof Positive | epic | `evidenceLogCount` | 12 | 300 |
| Advanced | `badge-genus-guide` | Genus Guide | epic | `generaSightedCount` | 30 | 320 |
| Seasonal / Mastery | `badge-bingo-beginner` | Bingo Beginner | epic | `bingo.completedCount` | 3 | 240 |
| Seasonal / Mastery | `badge-ultra-rarity` | Ultra-Rarity | legendary | `veryRareSightedCount` | 1 | 350 |
| Seasonal / Mastery | `badge-season-chapter-clear` | Season Chapter Clear | legendary | `seasonQuestCompletedCount` | 4 | 320 |
| Seasonal / Mastery | `badge-year-round-birder` | Year-Round Birder | legendary | `loggedSeasonCount` | 4 | 360 |
| Seasonal / Mastery | `badge-legendary-lister` | Legendary Lister | legendary | `totalSighted` | 100 | 400 |

## Bingo objectives

| ID | Label | Metric | Goal | XP |
|---|---|---|---:|---:|
| `b1` | Log 2 birds this week | `weeklyLogCount` | 2 | 35 |
| `b2` | Log 6 birds this month | `monthlyLogCount` | 6 | 45 |
| `b3` | Spot 1 rare-or-better | `rareSightedCount` | 1 | 55 |
| `b4` | Mark 3 in-season birds | `inSeasonSightedCount` | 3 | 40 |
| `b5` | Log 2 habitats this season | `seasonHabitatCount` | 2 | 40 |
| `b6` | Start 4 families | `familiesStarted` | 4 | 40 |
| `b7` | Log 2 certain sightings today | `todayCertainCount` | 2 | 35 |
| `b8` | Reach 15 total species | `totalSighted` | 15 | 60 |
| `b9` | Log 2 unique species today | `todayUniqueSpeciesCount` | 2 | 35 |
| `b10` | Log 3 regions this season | `seasonRegionCount` | 3 | 40 |
| `b11` | Spot 2 migration birds | `migrationSightedCount` | 2 | 45 |
| `b12` | Complete 1 family | `familiesCompleted` | 1 | 70 |
| `b13` | Log 1 evidence-backed sighting this season | `seasonEvidenceLogCount` | 1 | 45 |
| `b14` | Reach 10 certain sightings | `totalCertainLogCount` | 10 | 50 |
| `b15` | Sight 10 genera | `generaSightedCount` | 10 | 55 |

## New supporting metrics

These derived metrics are now part of the Birds stats model and can be reused for future tuning without changing render code:

- `totalRegionCount`
- `totalHabitatCount`
- `totalCertainLogCount`
- `evidenceLogCount`
- `seasonEvidenceLogCount`
- `generaSightedCount`
- `loggedSeasonCount`
- `todayEvidenceLogCount`
- `todayFamilyMixCount`

