# Video isolation (2026-10-18)

Isolated headless Chrome, 1334x751 CSS px, DPR1.92. Each mode twice, reversed order. Title, orb, glow and CSS blend modes retained. At opening onset paused mode freezes the intro; removed mode pauses, unloads and removes both videos plus film canvas, leaving the black film background. A wall-time clock preserves opening and title reveal timings without requiring video playback. Production source unchanged.

Compare the first two seconds of waiting in each run, avoiding unequal total phase lengths.

| Mode | Gaps >33.5ms | Max gap ms | Video elements | Playing videos |
| --- | ---: | ---: | ---: | ---: |
| full | 13 | 62.5 | 2 | 1 |
| paused | 12 | 62.7 | 2 | 0 |
| removed | 12 | 54.0 | 0 | 0 |
| removed | 12 | 62.6 | 0 | 0 |
| paused | 11 | 62.5 | 2 | 0 |
| full | 12 | 45.9 | 2 | 1 |

Assertions confirm title revealed and paused/removed media state, with a full two-second sample. Removing video does not eliminate the reproduced long frame intervals. Dynamic video is not a necessary cause in this harness. This does not isolate individual orb effects or prove the precise native Electron hitch; headless RAF timing is not displayed FPS. Earlier all-blend ablation remains evidence about rendering paths, not proof that video blending specifically is the culprit.
