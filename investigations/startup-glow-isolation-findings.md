# Glow isolation (2026-10-18)

Diagnostic only, production unchanged. Isolated headless Chrome, 1334x751, DPR1.92. Videos unloaded/removed, title display:none. Compare original orb+particles+glow against intensity=0 plus orbLight display:none (removes soft purple glow and rim arcs together, including their blend layer). Scene/core/particles retain screen blending. Assertions verified title hidden, no video elements, and expected light display. Reversed-order repetitions.

First two seconds of waiting:

| Glow | Gaps >33.5ms | Maximum gap ms | RAF samples |
| --- | ---: | ---: | ---: |
| Present | 12 | 70.8 | 194 |
| Removed | 11 | 62.7 | 303 |
| Removed | 10 | 54.2 | 322 |
| Present | 12 | 50.2 | 298 |

Long gaps remain after removing glow. Counts slightly lower, but broad performance variation (including baseline sample counts) prevents a strong magnitude claim. No evidence that glow alone causes the reproduced stalls; cannot conclude it has zero cost. Remaining core/particle canvas and blending still active. RAF intervals in headless browser are comparative diagnostics, not displayed Electron FPS or attribution of the exact native hitch.
