# Validation

2026-10-17 video startup integration: the approved screenshot preset is stored in `startup/preset.json`. Existing 39 runtime tests and animation geometry checks passed. Three startup tests passed: production HTML/preset compilation, official renderer allowlist, and loopback HTTP range/auth/readiness behavior. PowerShell launcher and window helper parsed; native window API compiled. A standalone Edge startup smoke run confirmed the video-first-frame handshake before any Codex launch, and the startup window/service exited afterward. No current Codex process was restarted. Full cold-start logo coverage and screenshot-to-native-window handoff remain unverified until an actual restart. The bootstrap state-file location was moved into the workspace after the first smoke run reported a temporary-file removal permission error. The second smoke run passed with STARTUP_SHOWN and STATE_CLEANED: True.

v1.3 follow-up: user accepted a unified sidebar. Computed header/list backgrounds match in dark (rgb(28,28,28)) and light (rgb(231,232,235)); internal sidebar separator removed. Main titlebar backgrounds remain rgb(25,25,25) / rgb(227,229,233), with its CSS rules unchanged. The actual request reply container was inspected using CDP-forced focus-within: its ring is neutral #b9b9b9 in dark / #4e5663 in light. Forced state was cleared and the original polarity restored. Evidence: references-focus-dark-v13.png and references-focus-light-v13.png.

Markdown editor inline code uses runtime-generated highlight classes. The adapter identifies native rules by --color-codex-editor-inline-code-background plus --font-code-family; underlined link rules use --color-text-info. It generates scoped Markdown-only overrides without editing document content or native CSS rules. Runtime syntax passed, repeated hot update leaves one adapter stylesheet, and disposal clears its timer and removes its stylesheet. Purple links and code labels were visually inspected in both polarities. After feedback that dark labels were still too subtle, their background/foreground/border changed to #4a4a4a/#fff/#777777. Final dark screenshot: inline-contrast-final-v13.png. The light label palette remains #e1e4e9/#30343b/#b6bdc8. This does not validate every editor language or all app surfaces.

v1.3 (in progress): inspected actual app DOM and hot-updated the main renderer. Dark and light screenshots in controls-dark-v13.png / controls-light-v13.png show a single selected-tab surface, transparent breadcrumb nav inside its capsule, a single split-control perimeter, a softer sidebar selection without the thick side stripe, and the normal composer. controls-compact-light-v13.png confirms the compact composer keeps its native pill shape with a transparent inner body. No input text was modified. The first corner fix lost to the older grouped sidebar selector; replacing its nav type specificity with :where(nav) made the intended backing color take effect. After the user clarified the T-junction, the sidebar top-left internal corner was set to 0px. Computed corner radii are now 0px 0px 0px 12px. Latest light screenshot: junction-light-v13.png.

CDP-forced hover and focus-visible states were inspected for file search, the split dropdown and selected chat. Hover changed appearance without changing width/height. Forced states were cleared afterward. The final CSS keeps the split dropdown focus outline inside its clipped parent and uses a neutral sidebar focus outline; actual keyboard traversal has not been exercised. No toolbar action was clicked.

Dark colors were then revised to neutral grays, with darker navigation and lighter reading surfaces plus softer control borders. Actual screenshots: palette-dark-v13.png and controls-compact-dark-v13.png. Light colors were retained and checked in junction-light-v13.png. User reports some improvement and plans to annotate remaining issues; visual sign-off is pending. Settings, third-party pages, and all dialog variants remain outside this check.

v1.2: actual computed backgrounds verified for sidebar/nav/main/right panel in both polarities. Dark RGB 21/32/40; light RGB (233,233,230)/(250,250,248)/(240,240,237). Actual screenshots captured in panels-dark-v12.png and panels-light-v12.png. User confirmed panel contrast strength. Scroll region focus styling narrowed to .thread-scroll-container:focus-visible; a programmatic focus probe did not trigger focus-visible, so keyboard-triggered appearance remains for hands-on confirmation. No component geometry or input recommendation color changes in this revision.

v1.1: inspected actual main-window DOM and loaded CSS. Root token overrides were insufficient for scoped sidebar colors. Replaced heuristic mapping with explicit token groups and targeted text classes. Hot-applied without restart or replay. Actual dark and light screenshots inspected: sidebar titles visible, editor background transparent within composer, theme dock collapsed. Restored dark mode after light verification. Original CSS/JS saved as v1 backups. Full settings/dialog/editor coverage remains unverified.

Launcher repair: direct ChatGPT.exe launch returned a loopback CDP listener and Chrome/155.0.8059.40 on test port 19225. Confirmed actual main target app://-/index.html; excluded avatar, detached, and prewarm targets. PowerShell syntax passed. Full normal-profile theme injection still requires the next user launch; the diagnostic launch is not proof of end-to-end theme success.

2026-10-17, Windows.

- Node syntax checks passed for fade.js, inject.mjs, preview-server.mjs.
- PowerShell parser accepted launcher.ps1.
- Local HTTP preview returned 200.
- Independent headless Chrome: first stage waits indefinitely for user interaction; click starts second stage; second stage enters UI; underlying content is no longer inert; polarity switch works; restore removes runtime, theme attribute, overlay, and input lock.
- entry.png and dark.png visually inspected at desktop size. These are simulated preview UI, not screenshots of a modified official Codex window.
- Official installation detected: OpenAI.Codex 26.1007.9446.0. Actual CDP launch/injection is not yet verified: current application is hosting the active conversation and has not been restarted with the custom debugging port.

Rerun verify.mjs only against a separate headless Chrome preview on localhost:19224. It closes that test browser after verification.


## Floating file panel migration — 2026-10-17

Added src/file-panel.js and src/file-panel.css to the runtime build. Uses the approved card radius, glass colors, border, shadow, header spacing and responsive treatment. Native editor nodes and open/tree triggers remain mounted. Native panel sizing/resizing and tab switching are retained. Added absolute-path copy and local Explorer reveal via the installed app platform services (app-shared-30671c57ec82.js export fN); this adapter is specific to Codex 26.1007.9446.0 and fails closed on an incompatible service export. Remote/environment files cannot be revealed in local Explorer. Metadata is reread from native component props at click time.

Validation: node build-ui.mjs and node verify.mjs passed (19 tests plus existing animation/geometry checks). These are offline checks, not live visual or native-action verification. No hot update was attempted. Restart through the existing Fade entrypoint to load this build. Native panels without a recognized local-file header retain their original layout; tree controls are available where the native viewer supplies them.

2026-10-17 startup handoff refinement: Edge now uses fullscreen kiosk mode to remove browser chrome. Completion waits two animation frames plus a 200ms hold. Native handoff retains the topmost surface while requesting app focus, then fades only the startup window over 280ms. Four startup tests passed (including final-paint ordering/idempotency); Windows PowerShell 5.1 native API compilation passed. Standalone smoke returned STARTUP_SHOWN and OPACITY_OK and cleaned up without restarting Codex. Full cold-start visual handoff remains to be verified; fullscreen startup versus maximized app bounds may still produce a slight framing change.

## Unified Web window controls prototype

`Test Web Window.cmd` launches `.window-prototype/app/ChatGPT.exe` with a separate profile and debug port 19224, then loads the current Fade UI. It does not replace the installed application. Build with `node .work/review/20261018-legacy/startup/build-window-prototype.mjs <official app directory>` after `node build-ui.mjs`.

The copied main process disables the primary window's native caption overlay and exposes only state, minimize, maximize/restore, fullscreen and close through a validated preload bridge. The copied executable's ASAR header digest is updated to match the rebuilt archive; archive integrity verification stays enabled. This executable is a modified local test copy, not the original signed binary.

Verified on this machine: maximize/restore, enter/leave fullscreen, minimize, close, and rejection of unknown actions. Minimize and close button screenshots are byte-identical between maximized and fullscreen states. The titlebar retains Electron's drag region; manual drag/edge resize and Windows snap-layout hover remain outside this verification. Native snap-layout hover is not implemented by the Web maximize button.

### 启动动画交接修复

页面就绪后只等待欢迎页精确小球落点 6 秒，之后使用当前可见小球位置完成交接；就绪后不再重复请求新聊天或测量落点。动画帧内另有点击后 12 秒的独立退出计时，不依赖 CDP 轮询。动画通信异常单独记录，已成功加载的主题不再被标记为注入失败。Escape 仍可跳过启动覆盖层。此修复通过启动和异常交接回归测试，尚需下一次真实冷启动确认。

### 2026-10-18 启动画布预热

在实际启动画布上分两帧预热：视频时间约 0.25 秒准备球核、尖刺与粒子路径，约 0.55 秒通过 destination-in 采样原光晕纹理。预热输出为黑色，在已有 screen 混合与不透明视频背景上保持中性，不推进小球运动状态。每次预热绘图在下一帧清理；will-change: contents 提示保留至交接结束。跳过临近出现时间的工作，不阻塞播放；启动 iframe 销毁后释放所属画布引用。

验证：21 项相关回归测试通过；80 组原小球/光晕合成像素比较差异为 0；两种 DPR 下预热前、中、清理后的 6 组实际截图差异为 0。独立浏览器 1334×751、DPR 1.92 交替测试三组未预热与三组预热：opening 阶段超过 33.5 ms 的帧间隔分别为 12/13/12 与 8/10/9。预热同步步骤约 0.1–0.5 ms；视频阶段长帧次数分别为 1/2/1 与 0/1/2。未观察到一致的前段退化，但样本少且仍有波动；这些不是实际 Codex 冷启动帧率结论，也未测量 GPU 内存增量。原始记录：.work/review/20261018-legacy/investigations/startup-prewarm-profile.json。预热仍不能消除持续混合开销。

### 2026-10-18 独立 Electron 动画视图

用户真实启动的延迟原生入口对照支持原生初始化是那段短暂卡顿的主要来源。之前独立 Chrome 的长帧实验不能等同于这段真实启动停顿，也不能据此认定画布或混合模式是唯一根因。

新增 `tests/isolated-startup-electron.mjs`：从官方 Electron 二进制创建独立临时测试运行时，不运行原生应用，不读取其用户配置。通过真实 WebContentsView 验证两个 OS renderer PID 不同；原生模拟页执行 1500ms 同步忙循环时动画 renderer 的 RAF 继续跨越该时间段；验证客户区缩放、完整点击交接、Escape 和父窗口销毁后的 renderer 清理。测试窗口在屏幕外，关闭遮挡/帧率节流用于线程隔离验证；记录的 RAF 数量不是实际启动 FPS。未通过此测试声称真实 Codex 冷启动零掉帧或交接视觉完全无闪烁。

相关 13 项门控、首页覆盖暂停、交接及运行时生命周期测试通过。诊断模式仍保留；正常入口无需增加固定 5 秒等待。动画源画质和运动参数未改。

### 协议注册时序修复（2026-10-18）

真实启动暴露出主窗口 bundle 在 app.ready 之后加载；最初的独立测试将该 bundle 放在 ready 之前，遗漏了时序差异。已将 registerSchemesAsPrivileged 移至 package.json 指定的 early-bootstrap.js 最前部。构建器验证入口名称并把早期脚本纳入缓存指纹。回归测试现在明确在 app.whenReady 后初始化窗口模块，已通过进程隔离、首页 1500ms 阻塞、交接、Escape、销毁测试。重建后已检查 ASAR：协议注册位于真实早期入口，迟加载的 main bundle 不再注册协议。未自动重启用户的实际客户端。

### 本地动画协议兼容修复（2026-10-18）

实际日志显示独立视图的 fade-startup:// 页面被原生启动请求策略拒绝（ERR_BLOCKED_BY_CLIENT），失败清理后露出主界面。改为独立 session 内使用原生允许的 app://-/fade-startup.html，仅处理四个指定本地动画资源；不修改网络策略、不取消 webRequest 过滤器、不新增协议白名单。生产不再注册自定义特权协议。

回归测试现在同时模拟 ready 后加载窗口模块，以及 session-created 时安装的启动 URL 限制。动画加载、不同 PID、原生线程 1500ms 阻塞期间持续动画、交接、Escape、关闭清理均通过。另在当前实际 Codex 会话只读 fetch 动画 HTML/JS/循环视频，三者均为 200。修复源代码已就绪；当前运行的二进制不覆盖，完全退出后普通启动入口按源代码指纹自动重建。动画错误不再被日志误记为成功交接。

### 启动视图层级维护（2026-10-18）

用户反馈只有视频声音、屏幕仍为原生 logo/首页。本次读取真实会话确认：动画 renderer 仍 active、无错误、phase=waiting、host.ready=true、尺寸 1334x751；动画页面截图包含完整视频/标题/小球。这证明内容已渲染，但尚未直接取得主进程视图树，后续原生内容遮挡属于当前修复针对的解释。

新增启动视图置顶维护：在主窗口 show/restore/ready-to-show、主页面加载事件、动画加载完成、resize 及存活期间的 250ms 检查中，确保动画是 contentView 最后一个可见 child。仅顺序不正确时重新追加视图；退出时清理监听器。状态日志新增 topmost/visible/bounds。测试模拟原生初始化后来添加遮挡 View，确认动画恢复顶层，同时保留原生启动请求限制、ready 后加载、隔离/阻塞、交接和销毁验证。实际当前残留不可见动画已通过自己的完成接口清理，未重启客户端。代码随下次完全退出后正常启动自动重建，真实窗口观感仍需验证。
