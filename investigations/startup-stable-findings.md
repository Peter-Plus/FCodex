# Stable startup rotation investigation (2026-10-18)

Production animation unchanged. Added profile-startup-stable.mjs, derived from the existing isolated headless harness, with per-frame videoTime, openingAge and looping plus no-title/no-loop diagnostic modes.

Environment: isolated Chrome, CSS viewport 1334x751, DPR1.92. These requestAnimationFrame timings are comparative diagnostics, not displayed Electron FPS or a native cold-start trace.

startup-stable-timing-profile.json: full / no-title / no-loop repeated twice. Removing title or preventing loop transition did not remove long frame intervals. Half-second bins relative to opening show recurring long intervals rather than a unique spike at the opening-to-waiting transition. No animation-time JS long tasks; waiting draw calls usually 0.5-0.8ms (submission time, excludes asynchronous GPU work).

startup-stable-profile.json: full / no-blend / no-canvas-blend repeated twice. Full waiting >33.5ms intervals: 19,21; disabling all CSS blend modes: 0,0. Full max intervals: 66.7/62.5ms; no-blend max: 29.3/29.2ms. Disabling canvas blending alone retains the problem. All-blend removal changes appearance and is strictly a diagnostic override.

Inference: strong evidence for ongoing rendering/compositing cost with blend layers, not a demonstrated one-time waiting-state initialization stall. Startup prewarm addresses first-use resource cost but cannot precompute changing video/orb/title composition. Native background initialization is not necessary to reproduce these diagnostic gaps, but could add cost in the real app. User's precise post-enlargement hitch still needs a native timeline to attribute exclusively.

Potential next work: preserve blending semantics while reducing affected composition bounds; verify pixel equivalence and performance before applying. Do not promise cache-only elimination or disable effects in production.
