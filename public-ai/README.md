# CAR CASH — Public AI Edition

A 3D racing game on a ribbon of road floating in the sky. The ribbon loops over and under itself, so the
fastest line often **leaves the road**: drive off the edge on purpose, fly with nitro, land on a lower part
of the ribbon. Humans do it. Our bots don't. This edition is built to show you why, and to give you
everything you need to try to do better.

**Play online:** https://car-cash-git-public-ai-edition-scar1.vercel.app/public-ai/

## Play

- **Online:** the link above (desktop or phone).
- **Locally:** double-click `LANCER.command` (macOS) or `LANCER.bat` (Windows). They start a local web
  server with Python and open your browser. Without Python, they open `index.html` directly, which also works.
  On macOS the first launch may need right-click > Open.
- **Survivor mode** (the PLAY button): you and 7 bots on the same road. Every 60 seconds, whoever is last
  explodes. A crash or a fall is final. Everyone uses the same car physics, and there are no pickups.
  Only the driver differs.

| Keyboard | | Touch | |
|---|---|---|---|
| ← → / A D | steer (turn in the air) | left half of the screen | steering wheel (slide); in the air with nitro, slide up = dive, down = pull up |
| ↑ / W | gas; dive in the air (with nitro) | NITRO | right thumb; gas is automatic |
| ↓ / S | brake; pull up in the air (with nitro) | ⏸ | pause menu: inspector, code, hide HUD, help |
| Space / Shift | nitro (works in the air) | | |
| R · P · Enter | respawn on the road · pause · play again | | |
| **I** | Bot inspector (sensors drawn in 3D, live keys, state, speed, fitness) | | |
| **Tab** / click | select a bot | | |
| **C** | Bot code (read-only, syntax-highlighted, copy, GitHub links) | | |
| **H** | hide the whole HUD (clean video capture) | | |
| **X** | export telemetry (JSON) | | |
| **G** | ghost compare: your last run replayed next to the bots | | |
| M · F1 · Esc | sound · help · close panels | | |

## The bots

- **Brain:** a perceptron, 15 inputs → 16 hidden (tanh) → 4 outputs (tanh), 324 weights, run at 10 Hz.
- **Inputs (sensors):** speed, lateral position, heading vs road, nitro reserve, airborne flag, road
  curvature at 120 m and 300 m, shortcut gain ahead (a further part of the ribbon that is close in 3D),
  and in the air: height and offset over the landing target, vertical speed, flight heading, forward speed
  and sideways drift over the target, pitch of the velocity. All normalized to [-1, 1].
- **Outputs → keys:** the 4 outputs become the player's keys: steer left/right, UP (gas on the road, dive
  in the air), DOWN (brake / pull up), nitro. Bots cannot do anything a keyboard can't.
- **Policies:** `neural` (the network presses every key) or `hybrid` (default: a scripted driver handles
  the road and the network only decides **when to cut** and **how to fly and land**). Switch live in
  the inspector, or add `?policy=neural` to the URL.
- **The squad:** 7 champion brains from our runs (`brains/squad.json`; `brains/champion.json` is gen 70).

## Train

Title screen > **Training** (or `index.html?train=1&seed=42&policy=neural&warm=0&pop=24`).
24 cars race on a new track each round; after 3 rounds (`&tracks=3`) the cars are ranked, the better half
keeps its brain and the other half is replaced by mutated children. The first round of every generation
starts in mid-air, to practise landing. Fixed 1/60 s time step, one seeded RNG: **the same seed replays the same run at any
speed** (×1, ×10, MAX = no rendering). The panel shows the fitness curve per generation; **Watch best**
follows the previous generation's best brain; **S** downloads the best brain (same JSON format as
`brains/champion.json`); **Export log** downloads the per-generation stats.

Fitness = distance along the ribbon, +3000 (+40 per second left) for finishing, −2500 for crashing.

The original training bench (headless simulator, multi-seed runs, all saved champions) is in
[`ml/train/`](../ml/train/) of this repository.

## Telemetry export (`X`, or "Export data" on the end screen)

One JSON file per race: the human and the 7 bots, sampled at **20 Hz**.

```json
{
  "format": "carcash-telemetry", "version": 1, "hz": 20, "policy": "hybrid",
  "track":   { "seeds": [134782892, 99211] },
  "columns": ["t","zone","x","y","z","qx","qy","qz","qw","dist","s","lat","side","air","kmh",
              "nitroR","steer","gas","nitro","pitch","obs0", "...", "obs14"],
  "obsNames": ["speed", "lateral position", "..."],
  "agents": [
    { "id": "player", "kind": "human", "outcome": { "result": "died", "cause": "void", "t": 74.2,
      "dist": 6120, "rank": 3, "cuts": 2, "cutGain": 410 }, "frames": [[0.05, 0, 12.4, "..."]] },
    { "id": "bot1", "kind": "bot", "brain": "g70-n22", "policy": "hybrid", "outcome": { "...": "..." }, "frames": [] }
  ],
  "events": [ { "t": 31.7, "agent": "player", "type": "land", "gainNet": 214, "impact": 3.1 } ],
  "brains": { "g70-n22": { "in": 15, "hid": 16, "out": 4, "w": [324 floats] } }
}
```

| column | meaning |
|---|---|
| `t` | seconds since the start of the race |
| `zone` | track index; zone k is `buildTrack(track.seeds[k])`, the race goes through a portal to the next zone |
| `x y z`, `qx qy qz qw` | world position (m, Y up) and orientation of the car |
| `dist` | metres along the ribbon since the start (all zones): **the ranking** |
| `s`, `lat`, `side` | metres along the current ribbon, metres from its centre line, +1 top face / −1 underside |
| `air` | 1 when flying |
| `kmh`, `nitroR` | displayed speed, nitro reserve (0–2) |
| `steer gas nitro pitch` | **actions**: steer −1/0/+1 (+ = left; analog on touch), gas −1 brake / 0 / +1, nitro 0/1, pitch −1 dive / +1 pull up |
| `obs0…obs14` | **observations**: the 15 normalized sensors a bot sees (the human's too, computed by the same function) |

Events: `takeoff`, `land` (`gainNet` = metres gained along the ribbon − straight 3D distance flown;
above 20 m it is a real shortcut), `crash` (`why`: `void`, `airtime` (6 s max in the air), `idle`),
`eliminated`, `portal`, `zone`, `policy`. Outcome `cause` for the player: `void`, `airtime`, `idle`, `last`
(last when the 60 s clock hit zero), `quit`, or result `won`.
Brain weights: for each hidden unit `[bias, 15 weights]`, then for each output `[bias, 16 weights]`.

**Ghost compare** replays the player of a telemetry file as a gold ghost next to the bots, which drive live
on the same tracks from the same grid. The gold trail turns pink where the player flies: that's where you
cut and they don't. Load any exported file with "Load a run file".

## Where the bot code is

Everything is in `index.html`, in one place, and the **Bot code** panel (C) shows the exact functions that run:

| what | where in `index.html` |
|---|---|
| sensors | `function carBrainInput` |
| brain, policy | `function MLP`, `BOTS.act`, `BOTS.groundPilot` |
| fitness, evolution | `BOTS.fitness`, `BOTS.rankRound`, `BOTS.nextGeneration` |
| physics (shared with the player) | `function stepCar` → `carDrive`, `carFall`, `carTryLand` |
| squad loop (Survivor) | `NS.step` |
| training mode | the block `TRAINING MODE (?train=1)` |

In the browser console, `CARCASH` exposes `stepCar`, `makeCar`, `carBrainInput`, `buildTrack`, `MLP`,
`BOTS`, the squad (`CARCASH.NS.bots`) and the current track (`CARCASH.track`).

## The open question

**How would you get an agent to discover, and then reliably execute, the off-road cut?**

Our bots are either too cautious (safe, fast road drivers that never leave the road) or, when the reward
pushes them to fly, they all dive at the same spot and most never land. Neuroevolution, cloning human
games, and a hybrid scripted-driver + learned-jump policy all stopped there. The physics is deterministic
and runs in a browser; the telemetry gives you state, action and outcome for human and bot runs. We would
love to hear how you would attack it: a different observation space, a curriculum of cuts, planning with
the known dynamics, RL with shaped rewards, learning from human trajectories, or something else entirely.
