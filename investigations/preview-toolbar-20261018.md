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
