# Birds Progression Spec

This is the source of truth for Birds progression economy tuning.

- Runtime spec object: `BIRD_PROGRESSION_SPEC`
- Code location: `JS Files/nature-challenge-tab-system.js`
- Console access: `window.BIRD_PROGRESSION_SPEC`

## Tuning rule

Adjust values in `BIRD_PROGRESSION_SPEC` (goal, xp, copy, limits) and keep render code unchanged.

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

| ID | Title | Metric | Goal | XP |
|---|---|---|---:|---:|
| `challenge-daily-pulse` | Daily Pulse | `todayLogCount` | 1 | 40 |
| `challenge-weekly-wings` | Weekly Wings | `weeklySightedCount` | 3 | 80 |
| `challenge-monthly-milestone` | Monthly Milestone | `monthlySightedCount` | 10 | 140 |
| `challenge-quarterly-flight-plan` | Quarterly Flight Plan | `quarterlySightedCount` | 25 | 220 |
| `challenge-lifetime-lister` | Lifetime Lister | `totalSighted` | 100 | 300 |
| `challenge-season-sweep` | `{seasonLabel} Sweep` | `inSeasonSightedCount` | 15 | 130 |
| `challenge-rare-radar` | Rare Radar | `rareSightedCount` | 5 | 170 |
| `challenge-family-forager` | Family Forager | `familiesStarted` | 12 | 120 |
| `challenge-migration-mapper` | Migration Mapper | `migrationSightedCount` | 8 | 150 |
| `challenge-season-questline` | Season Questline | `seasonalLogCount` | 12 | 180 |

## Daily Micro-Challenges

| ID | Title | Metric | Goal | XP |
|---|---|---|---:|---:|
| `daily-log-1` | Show Up Today | `todayLogCount` | 1 | 30 |
| `daily-new-species` | Fresh Feathers | `todayUniqueSpeciesCount` | 2 | 45 |
| `daily-context-mix` | Context Mixer | `todayContextMixCount` | 2 | 35 |
| `daily-rare` | Rare Radar (Daily) | `todayRareLogCount` | 1 | 55 |
| `daily-confidence` | Certain Signal | `todayCertainCount` | 2 | 40 |

## Seasonal Questline

| ID | Title | Metric | Goal | XP |
|---|---|---|---:|---:|
| `sq-1` | Scout Phase | `seasonalLogCount` | 5 | 80 |
| `sq-2` | Variety Phase | `seasonHabitatCount` | 3 | 90 |
| `sq-3` | Rare Phase | `rareSightedCount` | 2 | 110 |
| `sq-4` | Mastery Phase | `seasonalLogCount` | 15 | 140 |

## Badges

| ID | Title | Rarity | Metric | Goal | XP |
|---|---|---|---|---:|---:|
| `badge-first-feather` | First Feather | common | `totalSighted` | 1 | 50 |
| `badge-common-core` | Common Core | common | `commonSightedCount` | 25 | 120 |
| `badge-rare-find` | Rare Find | rare | `rareSightedCount` | 5 | 180 |
| `badge-migration-mapper` | Migration Mapper | rare | `migrationSightedCount` | 10 | 220 |
| `badge-season-spotter` | `{seasonLabel} Spotter` | epic | `inSeasonSightedCount` | 20 | 260 |
| `badge-family-finisher` | Family Finisher | epic | `familiesCompleted` | 1 | 280 |
| `badge-legendary-lister` | Legendary Lister | legendary | `totalSighted` | 100 | 400 |
| `badge-ultra-rarity` | Ultra-Rarity | legendary | `veryRareSightedCount` | 1 | 350 |
| `badge-streak-keeper` | Streak Keeper | rare | `streak.currentStreak` | 7 | 210 |
| `badge-bingo-beginner` | Bingo Beginner | epic | `bingo.completedCount` | 3 | 240 |
| `badge-season-chapter-clear` | Season Chapter Clear | legendary | `seasonQuestCompletedCount` | 4 | 320 |

## Bingo Objectives

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

