# Component and canvas isolation (2026-10-18)

Diagnostic only; production source unchanged. Isolated headless Chrome at 1334x751 / DPR1.92, with video removed, title and glow hidden and glow drawing disabled. Each variant repeated in reverse order. Compare first two seconds of waiting.

## startup-components-profile

| Variant | Gaps >33.5ms | Max gap ms | RAF samples |
| --- | ---: | ---: | ---: |
| baseline | 12 | 66.9 | 282 |
| core | 12 | 58.4 | 293 |
| particles | 12 | 66.6 | 265 |
| normal | 12 | 66.6 | 287 |
| blank | 11 | 62.6 | 290 |
| hidden | 3 | 191.8 | 404 |
| hidden | 3 | 187.5 | 409 |
| blank | 12 | 62.5 | 293 |
| normal | 12 | 66.8 | 286 |
| particles | 11 | 62.6 | 286 |
| core | 11 | 62.5 | 274 |
| baseline | 12 | 62.6 | 283 |

## startup-canvas-control-profile

| Variant | Gaps >33.5ms | Max gap ms | RAF samples |
| --- | ---: | ---: | ---: |
| blank | 12 | 54.3 | 291 |
| blank-normal | 12 | 66.7 | 273 |
| static | 4 | 50.2 | 432 |
| static | 1 | 58.5 | 435 |
| blank-normal | 9 | 54.3 | 278 |
| blank | 12 | 70.8 | 276 |

Core/particle ablations remove actual drawing blocks, not just alpha. blank removes both but continues clearSurface/markSurface. hidden additionally hides scene canvas. normal changes scene blend to normal with both core and particles intact. blank-normal changes blend on the blank canvas. static leaves the blank canvas visible and screen-blended, skips only clearSurface(canvas,ctx) during waiting, preserving all other frame logic and state/DOM updates.

Finding: no single core/particle effect explains gaps. Even the blank canvas reproduces them while being cleared each frame. Hiding that canvas or stopping its clears substantially reduces recurrent gaps. Disabling blend alone does not consistently remove gaps here, so earlier all-blend evidence cannot establish blend mode as sole cause. Stronger current lead is the canvas update/presentation path; JS clear submission cost alone does not measure asynchronous raster/upload/compositing. These experiments do not isolate GPU substage, prove allocation/GC, or conclusively reproduce the exact native Electron hitch. Background variability remains (including occasional large gaps with hidden canvas). Need actual renderer trace or matched further canvas-bound tests before a production fix.
