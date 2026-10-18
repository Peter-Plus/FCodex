# Title isolation (2026-10-18)

Diagnostic only; production source unchanged. Derived from video-isolation harness, same viewport 1334x751, DPR1.92. Videos unloaded and removed at orb opening in all runs. Black film background retained. orb-only applies display:none to signature (including pseudo-elements), preserving orb/glow and their screen blend modes. Title timing JS remains but cannot paint. Assertions verified zero video elements and expected computed title display.

Two reversed-order repetitions; first two seconds of waiting:

| Title | Gaps >33.5ms | Max gap ms |
| --- | ---: | ---: |
| Visible | 11 | 50.1 |
| Hidden | 11 | 66.6 |
| Hidden | 12 | 70.7 |
| Visible | 12 | 62.5 |

No clear improvement from hiding title. Video and title rendering are not necessary for the reproduced gaps. Remaining candidates include orb/glow rendering and screen-blend composition, as well as headless-specific scheduling; this is not conclusive attribution of the native startup hitch. Diagnostic results are RAF intervals, not displayed FPS.
