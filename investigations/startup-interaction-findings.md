# Interaction transition investigation (2026-10-18)

Production animation unchanged. Isolated headless Chrome at 1334x751 / DPR1.92; real CDP mouse move before orb appears. Each variant run twice in reversed order. All preserve normal phase progression and blending. no-button keeps button disabled and removes ready class; no-hover keeps pointer at center but forces proximity=0. Recorded hoverLight and disabled confirm intended variants took effect.

| Mode | Waiting state mutation ms | Gaps >33.5ms in previous second | Gaps >33.5ms in following second | Following second max gap ms |
| --- | ---: | ---: | ---: | ---: |
| away | 0.10 | 6 | 6 | 62.5 |
| center | 0.00 | 6 | 6 | 54.2 |
| no-button | 0.10 | 7 | 6 | 50.2 |
| no-hover | 0.10 | 7 | 6 | 66.5 |
| no-hover | 0.00 | 5 | 6 | 62.5 |
| no-button | 0.00 | 6 | 6 | 62.5 |
| center | 0.10 | 6 | 6 | 62.4 |
| away | 0.00 | 7 | 6 | 62.6 |

No measured synchronous state-transition spike. All variants have six long frame intervals during the following second; disabling button activation or hover response does not eliminate the gaps. No waiting-transition long task recorded. Timing instrumentation measures JS submission, not deferred layout/GPU work; the full-window ablations also cover subsequent frames. Headless frame intervals are comparative evidence, not Electron displayed FPS.

Conclusion: interaction activation and hover response are not supported as primary causes of the reproduced issue. Exact native-startup transient remains unconfirmed; a native timeline would be required before claiming the user's localized hitch is conclusively attributed. No production effect, timing or interaction was modified.
