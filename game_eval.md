# Game Evaluation

Based on the design docs, here is critical feedback focused on gameplay feel, challenge curve, and replay desirability.

## Gameplay
- The core loop blends Tetris placement with match-3 cascades, which is strong, but it risks feeling "busy" because you are juggling rotation/placement and color matching plus diagonal matches; expect a steep cognitive load early on.
- Diagonal matching plus painting plus explosions can create huge, hard-to-predict swings; that is fun in bursts but can also make outcomes feel noisy rather than skillful.
- The single-ball piece plus larger multi-ball pieces is a good pacing lever, but it can also become too generous for fixing mistakes unless its frequency is carefully throttled.

## Challenge
- 90-second timed levels are longer and should allow more strategy, but they may reduce urgency; consider whether the pressure curve still feels compelling as speeds rise.
- Blocking balls that only die to explosions are a good pressure mechanic, but when they start rising (Rising Tide mode) they may create unavoidable failure if explosion RNG does not appear in time.
- The color unlock curve (3 to 8 colors) will dramatically spike difficulty; without a matching assist or preview depth, it may feel like a wall rather than a smooth ramp.

## Replay desirability
- Multiple modes and per-mode score tracking are strong motivators, but if levels are short and largely RNG-driven (special balls plus painting lines), runs may feel less "owned" by the player.
- There is a risk of "samey" runs because the core objectives do not change much beyond speed and blockers; mode-specific twists help but might not be enough without deeper meta goals.
- High score chasing works, but you may need more mid-run goals (combos, perfect clears, streaks) or unlockables to keep players coming back.

## Retention risks
- Outcome opacity: cascading chain reactions can feel like luck if players cannot predict why a huge clear happened.
- Spike difficulty: the introduction of more colors combined with diagonal matches may feel like the game suddenly turns against the player.
- Timer pressure in Classic/Gauntlet: if 90 seconds feels generous, the mode may rely more on speed scaling and blockers to maintain tension.

## Recommendations
- Add clearer cause-and-effect feedback for cascades (small arrows or brief highlight paths) to reduce outcome opacity.
- Consider guaranteed special pieces on a visible interval with a "next special" indicator, and make the interval longer as difficulty/level rises so early play feels guided and late play stays challenging.
- Use a "bag" system for piece shapes (and optionally specials): shuffle a fixed set of shapes, deal through all of them before refilling, and weight special balls to avoid long droughts or clusters.
- Tune special ball rates so explosions feel like a tool, not a lottery; consider a pity timer for explosive spawns in Rising Tide.
- Consider a soft fail-safe against blocker floods (cap active blockers, or grant a guaranteed explosive every N pieces once blockers exceed a threshold).
- Keep a max color cap of 3-4 during Levels 1-12, then ramp to 5-6 only after specials are well-understood.
- Add full-row clears as a secondary bonus (after match resolution) with modest score weight, so it feels familiar without overpowering color matching.
- Introduce lightweight goals per level (combo target, clear count, or "no block" bonus) as repeatable mastery targets with small, escalating bonuses per trigger and a per-level cap.
- Add a consecutive matching bonus tied to matches across separate piece locks (not within a single cascade), with a reset on a no-match lock and a small per-level cap.
- Balance bonus scoring so it is desirable but does not dominate base clears; target bonuses to be a meaningful add-on rather than the primary score source.
- Add difficulty modifiers that change decision-making, not just speed (e.g., reduced lock delay, higher diagonal bonus, or painter-only modes).
- Add a post-run recap (largest cascade, longest streak, specials used) to highlight mastery and encourage improvement goals.
- Add a short mid-run hint system that surfaces when a player is struggling (e.g., "try grouping colors"), and disable it by default for experts.
- Add optional "risk-reward" pickups (e.g., temporary score boost in exchange for faster drop speed) to create deliberate tradeoffs.
- Add a stake-based objective option where players choose a point stake before a task; success yields a multiplier, failure loses only the stake (no negative totals) to keep it skill-driven without gambling framing.

## Mode ideas
- Mission-based mode with rotating micro-goals (e.g., 3 consecutive matches, clear a row, trigger a 2x cascade), revealing the next task after completion and scaling difficulty over time. Example chain: "Match 3" → "Clear a full row" → "Trigger a 2x cascade" → "Clear 12 balls with explosions."
- Single-objective timed challenges where completing one harder task ends the level, and score is based on remaining time in milliseconds (or remaining seconds) to reward efficient play.
- Daily or weekly seeded challenge so players can compare scores on the same layout/seed.
- Practice/sandbox mode with slow speed and manual piece selection to help players learn advanced setups.

## Growth and monetization
- Add a "brag" feature that shares a score screen to email or mobile share targets so players can send results to friends.

## Proposed feature unlock schedule
- **Levels 1-2:** 3 colors, no specials.
- **Levels 3-4:** Introduce horizontal painters only.
- **Levels 5-6:** Add vertical painters.
- **Levels 7-8:** Add diagonal painters (one diagonal first, then the other).
- **Levels 9-10:** Introduce bombs at low spawn rate (tooling up before blockers).
- **Levels 11+:** Introduce blockers; slightly increase bomb rate to make them a reliable counter.
