# Preview toolbar redesign — 2026-10-18

The card now integrates its close control into the visible native header (or native tab row), removing the separate 36px close-only strip. Verified adapters cover the two-slot review header, the nested three-slot file/code header, and the independent browser toolbar. Unknown structures retain native geometry and use a labelled fallback header.

The scope selector and action groups no longer have nested glass capsules or permanent button outlines. Native nodes, handlers, menus, editors, and web content remain owned by the original application. ResizeObserver chooses one/two rows from the pane width and intrinsic action widths; widening restores the compact row. Browser address entry takes the second row when narrow. Its native web surface has a small inset so it cannot paint across the outer card's lower corners.

Copy path and Explorer reveal remain direct file actions. Aggregate review and browser headers cannot borrow metadata from adjacent file panes. Diff rows own their own actions. Windows paths with a leading slash are normalized. The old hard-coded, missing platform bundle was replaced by discovery of the loaded shared asset and validation of its clipboard/openIn interface.

## Validation

- Real running FCodex: README Markdown, JavaScript source, multi-file diff, and a loaded example.com web page were visually inspected.
- Real pointer input: browser options, file open-options menu, review options, path copying (success toast), panel close, and reopening passed. Test-created file/browser tabs were closed; the original chat was restored. Explorer launch itself was not exercised.
- `node tests/file-panel-layout.browser.mjs`: 24 native-header combinations (four types, 320/470/760px, light/dark), with bounds, overlap, height, file-action ownership, and narrow → wide → narrow assertions passed. These are header-layout fixtures, not claims of full native behavior for every file format or split arrangement.
- `node --test tests/file-panel.test.mjs`: eight unit/lifecycle/metadata tests passed.
- `node verify.mjs`: all 62 unit tests passed. The subsequent existing `design-previews/check-horizon-motion.mjs` failed because its VM does not define `getComputedStyle` for `centerArcEnds`; that unrelated navigation-motion harness was not changed. The separate particle-orb check passed.

Permanent native DOM/CSS fixtures and the layout runner are in `tests/fixtures/file-panel/` and `tests/file-panel-layout.browser.mjs`. The fixture stylesheet is filtered to applicable native rules and excludes Fade overrides; the test loads the current built theme and preview source. Temporary screenshots and detailed results are under `.work/validation/20261018-preview-toolbar/`. Temporary browser profiles were closed and removed.

Native asset baseline: `app-shared-bbfeca5e5737.js`, `app-shared-dc7535e633d7.css`. Future native structure changes should be checked against these adapters; no original application package was modified.

### Follow-up: card height and resize grip

- Reduced desktop bottom margin from 76px to 22px and adjusted height; narrow-screen bottom inset is also 22px. Live card gained 54px of content height.
- Reset both CSS individual translate and transform on the native left resizer. Its 16px anchor is now inside the clipped card. The native separator hit region is 72px tall at the vertical center so it does not intercept header controls.
- Live CDP pointer drag passed: width 467.73 → 547.74 → 467.73px; grip hit testing passed and bottom stayed at 687.02px in a 713px viewport. Screenshot retained in `.work/validation/20261018-preview-card-resize/card.png`.
- Eight preview unit tests passed. The separate 24-case browser layout rerun could not complete: sandbox browser startup did not expose a port; an elevated retry failed its debugger connection. Prior layout results above are from the earlier toolbar revision, not a new pass.

### Browser card surface spacing follow-up

- Browser-only selectors remove the native fixed 48px header wrapper, letting it follow the adapted toolbar (including stacked layout).
- Move padding from the entire browser chrome to its measured content viewport: equal 8px left/right/bottom margins keep the separate native web surface inside card corners. The toolbar now spans the card width, without the old 4px height mismatch; bottom gutter is reduced from 14px.
- No webpage CSS injection or scrollbar override. File/code/review selectors and rendering logic unchanged.
- Validation: 24 native-header cases (four modes, three widths, light/dark) and all 10 preview unit tests passed. Live GitHub web preview screenshot visually checked after hot update. User switched chats during inspection; no final navigation override was applied.

### Browser card actual corner clipping

- Supersedes the 8px viewport gutters above: the browser viewport now meets the inner card edge with zero margins.
- Native browser content is a webview in a separate `[data-browser-host-root]` portal. The aside cannot clip that portal. Apply 21px bottom radii and overflow clipping to its right-panel webview wrapper, including the cursor overlay; preserve native clip-path, visibility and positioning.
- Only browser-specific selectors changed. No page CSS injection, native package patch or file/code/diff layout change.
- Live GitHub screenshot confirms rounded bottom corners and continuous card edges after hot update. All 10 preview unit tests passed. Evidence: `.work/review/test-runs/browser-rounded-view-xWruGe/rounded.png`.
- The 24 native-header regression cases also passed (file/code/review/browser, three widths, light/dark). Initial sandbox Chrome startup did not expose a debugger port; rerun outside the sandbox passed.

### Bounded action row

- File/code/review headers retain responsive one/two-row layout; stacked actions use a single nonwrapping horizontal scroller. Path/search/close remain on the first row. File shortcuts stay in the action row.
- Wheel input over an overflowing second row scrolls horizontally (pixel/line/page deltas supported); Ctrl+wheel remains native. Listener is disposed with header adaptation. Browser toolbar and background palette unchanged.
- All 11 unit tests and 24 native-header layouts passed, including horizontal wheel movement and row-height checks. Live file header at 446px: 88px total height, 422px action viewport, 467px scroll width; wheel moved 44px to the end.
- Screenshot and diagnostic scripts retained under `.work/review/test-runs/file-header-wrap-Uiieqx/`. No diagnostic child process remains attached to this directory.

### Preview palette refinement

- Header uses #F7F8FA / #272A32; file/review body uses #FCFCFD / #23262E via an aside-local document token. Separators use #E6E8EE / #343842. Action scrollbar uses #BDC3CF / #535A68 with stronger hover states.
- No geometry, syntax palette, diff semantic colors or webpage content changes. Live light/dark file screenshots visually checked. Before comparisons temporarily replay only the old palette on the same current file/geometry, then remove the temporary style; original light theme restored.
- Screenshots/scripts: `.work/review/test-runs/preview-palette-0aerUp/`. Capture script requires a running FCodex with the existing file chat; screenshots themselves are retained visual evidence, not fully reproducible without that session.

### Image viewer four-slot header (2026-10-19)

- Image viewer has four native slots: path, native copy group, search, trailing actions. Previous adapter rejected it and kept fallback title/chrome.
- Added four-slot recognition and grid placement without moving native controls. Image mode now inherits shared palette, integrated close, flattened controls and bounded second action row; native copy options remain intact.
- Added captured image header fixture and expanded browser layout suite to 30 cases (five modes × three widths × two themes). All passed, as did 11 unit tests. Actual image card visually checked after hot update.
- Diagnostic evidence retained in `.work/review/test-runs/image-preview-header-sRdLVH/`; capture requires this app session. No test child processes left running.
