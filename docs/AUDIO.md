# Minimal combat soundscape

`battle-audio.js` uses the Web Audio API and 15 local CC0 MP3 files: 10 sword clashes, 4 short human grunts, 1 horse neigh. Credits and original sources: `audio/LICENSES.md` and `audio/SOURCES.json`.

- Sword sounds accompany selected human melee hits with a global pause of 0.45–0.75 seconds. A shuffle bag plays all ten variations before refilling and avoids immediate repeats.
- Human hurt/death vocalizations have a 5–9 second global pause and a maximum of three per battle; they are not used for zombies, lizards or dinosaurs.
- Horse neighs are only eligible while living cavalry is present, first after 3–5 seconds, then after 12–18 seconds; maximum two per battle.
- Voices and neighs never overlap each other. At most three sound sources play at once. Effects are deliberately quiet. No looping battle ambience or footsteps have been added.
- Audio unlocks from an actual touch/key/click. Fetch/decode failures never stop the game or create a queue of delayed sounds. Buffers are reused.
- Battle results, retry and changing levels stop active sounds. Backgrounding the app stops sounds; resuming resets cooldowns rather than playing missed events.
- The menu contains a sound toggle, persisted in localStorage. This controls battle effects only.
- All 15 sounds and the audio module are precached with the PWA for offline play. No external runtime audio requests.

Run `node tests/battle-audio.cjs`, `node tests/pwa-sw.cjs`, `node tests/pwa-lifecycle.cjs`. The audio test drives a dense 60-second mock battle and verifies variety, frequency limits, cavalry gating, polyphony, stopping, muting and background silence. All MP3 files were decoded/probed with FFmpeg. Physical iPhone playback still requires device testing.
