# Native frontend delay diagnostic

Launch `Fade Codex Diagnostic.cmd` after saving work and fully quitting Codex. The normal `Fade Codex.cmd` remains the control. The launcher will refuse the diagnostic run while Codex is open; it never stops processes.

The diagnostic runtime is built separately in `.fade-runtime-diagnostic/app`. Its HTML loads a small gate module instead of the native frontend entry and removes speculative module preloads. The native entry is dynamically imported five seconds after the startup iframe first enters `opening`. This means the entry is held from page startup, not suspended halfway through initialization. The animation's approved rendering and timing are unchanged. Clicking early can increase the wait for home readiness.

This isolates native frontend module loading/evaluation and the initialization it triggers. It does NOT stop Electron main, preload scripts, native services, initial CSS or other processes. No CPU throttling or debugger pause is applied to the shared renderer.

Watch the enlargement and following rotation for at least five seconds without clicking. Compare a fresh normal launch with a fresh diagnostic launch under similar conditions. Logs: `launch.log` for normal, `launch-diagnostic.log` for diagnostic. The diagnostic log includes held/opening/released timestamps and reason. A valid hold reports `opening-plus-5s`; `fallback-timeout` or `animation-finished-or-skipped` is not the intended five-second comparison. Gate timeout is 30 seconds if animation fails; Escape/disposal releases it early.

Validation: gate timing/fallback/HTML rewrite unit tests; real startup iframe browser integration confirms playback through held state, opening + 5001ms release, normal handoff and Escape/disposal cleanup. This verifies control plumbing, not actual Electron performance; the next manual cold launch supplies that evidence. The currently running app is not restarted.
