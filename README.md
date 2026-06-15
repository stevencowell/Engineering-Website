# Digger Dynamics

A polished static browser game for Engineering Science / TAS classes.

Students drive a small excavator, dig a destructible soil mound, carry the load, dump it over the truck tailgate into the tray, with the arm angle affecting how cleanly the load lands, and use live engineering overlays to connect gameplay with:

- pivots
- levers
- load arms
- effort arms
- hydraulic force
- mechanical advantage
- folio evidence screenshots

No build tools, backend, package manager, or dependencies are required.

## Files

- `index.html` — landing page
- `digger-game.html` — full playable game
- `.nojekyll` — keeps GitHub Pages simple
- `README.md` — this file
- `CODEX_UPGRADE_NOTES.md` — notes for further Codex work

## Run locally

Open `index.html` directly, or run a simple server:

```powershell
py -m http.server 8765
```

Then open:

```text
http://127.0.0.1:8765/
```

## Upload to GitHub Pages

1. Upload all files to the root of the repository.
2. Commit the changes.
3. Go to `Settings > Pages`.
4. Choose `Deploy from a branch`.
5. Select branch `main`, folder `/root`.
6. Save.

The game will publish at:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY-NAME/
```

## Controls

| Action | Keyboard |
|---|---|
| Drive tracks | Left / Right arrows or J / L |
| Raise / lower boom | Up / Down arrows or I / K |
| Fold / unfold dipper | A / D |
| Extend / retract stick | W / S |
| Curl / open bucket | Q / E |
| Scoop / tip action | Space |
| Engineering view | V |
| Pause | P or Escape |
| Horn | H |

Touch controls are included for tablets and touch laptops.

## Classroom use

Suggested student instruction:

1. Play until you successfully dig, lift over the tailgate and dump at least one load.
2. Turn on Engineering View.
3. Take a screenshot showing the arm, pivots, load arm and force reading.
4. Paste the screenshot into the folio.
5. Answer the reflection prompt:

> Using your screenshot, explain how the digger arm position changed the load arm length, mechanical advantage and estimated hydraulic force. Use the terms pivot, load, effort, lever arm and mechanical advantage.

## What makes this version stronger

- Destructible soil mound with compacted soil and buried rock hits.
- Smoother continuous controls instead of jumpy one-tap movements.
- Clearer objective, live hints and feedback, including a tailgate-clearance task and a dump-angle challenge that rewards clean positioning without blocking progress.
- Canvas particles, dust, camera shake and visual dump zone.
- Engineering overlay with pivot labels, load arm, force arrow, hydraulic force arrow and estimated force meter.
- Student mission checklist tied directly to folio evidence.
- Screenshot evidence button.
- Local high score stored in the browser.
- No external libraries, so it is school-network friendly.


## Achievable tailgate-angle update

This version keeps the tailgate and arm-angle challenge, but avoids making the goal impossible. Once the bucket genuinely clears the gate and reaches the tray, students can tip. A poor angle still dumps the load, but spills some soil. A good angle gives a clean dump and better mission progress.
