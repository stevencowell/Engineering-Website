# Codex Upgrade Notes

## Goal

Keep improving `Digger Dynamics` as a classroom-ready engineering game, not just an arcade toy.

The current version is intentionally static: one HTML page, inline CSS and JavaScript, no dependencies, no build process. Preserve that unless Steve explicitly asks for a framework.

## Current strengths

- Runs on GitHub Pages as plain static files.
- Uses a canvas game loop with destructible terrain.
- Includes keyboard and touch controls.
- Includes Engineering View for pivots, lever arms and force.
- Includes student missions, screenshot evidence and a tailgate-clearance mechanic that forces proper arm control and an over-tailgate arm angle challenge. Dumping remains achievable: rough angles spill soil rather than completely blocking progress.
- Includes local high score.

## Next improvements worth doing

1. Add selectable classroom modes:
   - easy practice
   - timed challenge
   - mechanical advantage challenge
   - free play / demo mode

2. Improve folio alignment:
   - add a printable instruction panel
   - add labelled screenshot overlays for boom, dipper, bucket, pivot and hydraulic cylinder
   - add teacher toggle to simplify/expand terminology

3. Improve physics lightly without overcomplicating it:
   - refine tailgate collision feedback and recovery
   - smoother bucket-soil contact
   - better load spill conditions
   - a clearer penalty for over-extension with heavy loads

4. Add saveable evidence cards:
   - screenshot
   - score
   - mechanical advantage reading
   - short reflection prompt

5. Add more visual polish:
   - excavator animation while tracks move
   - better soil pile collapse after digging
   - truck fill level
   - simple completion animation

## Guardrails

- Keep it school-device friendly.
- Do not add npm dependencies unless asked.
- Do not add internet-only assets.
- Keep the game fast on low-powered department computers.
- Keep the learning language aligned to Engineering Science: pivots, levers, effort, load, force, hydraulic systems and mechanical advantage.


## Latest balance change

The previous tailgate-angle rule was too strict and could prevent players from achieving the core objective. The current behaviour is:

- bucket must clear the tailgate and enter the tray before dumping;
- correct arm angle gives a clean full dump;
- rough-but-safe arm angle still dumps, but only part of the load is delivered and the rest is counted as spill.

Keep this balance: challenge the student, but do not turn the game into pixel-perfect frustration.
