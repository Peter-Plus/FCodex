# FCodex

## 窗口模式（待真实客户端验收）

Fade 设置新增“窗口模式”：独立标签行、最多四个左右分栏、拖动调整宽度、同类型标签在分栏间移动，以及拖出创建独立系统窗口/拖回接收流程。关闭模式归并标签，重启不恢复分栏布局。首次使用需要完整退出并从 Fade 入口启动以加载新的原生补丁。

当前跨系统窗口只接收空闲的已保存聊天或空白页；未发送内容、附件、生成中的聊天会提示暂不能迁移。冷启动、多显示器和真实客户端跨窗口操作尚未验收，不能视为完整浏览器级标签迁移已经完成。实现、测试和限制见 [窗口模式验证记录](investigations/window-mode.md)。

## 正文纸纹背景

在右上角 **Fade 设置 → 正文背景** 中，亮色和暗色可分别选择“极简”“牛皮纸”或“自定义”。默认保留牛皮纸；极简恢复纸纹加入前的背景色。自定义支持 PNG/JPG/WebP（不超过 10 MB、4000 万像素），可调图片强度、旋转、水平/垂直位置、缩放、模糊及填充/平铺方式；可命名保存用户预设，在暗亮两栏分别应用。官方“极简”和“牛皮纸”固定保留，用户预设可以删除，删除不会改变已应用的背景，移除图片后恢复该主题的牛皮纸。更改自动保存到当前应用本机 IndexedDB，不上传图片；重新加载后恢复，同源窗口通过 BroadcastChannel 同步。

图片导入时将长边限制到 2560px 并编码为 WebP，以控制本机存储与解码开销。只有写入完成后才应用新背景，文件损坏或保存失败时保留原来的背景。切换内置背景会保留该主题已导入的自定义图片，再点“自定义”即可恢复。`node tests/background-settings.browser.mjs` 验证独立主题、导入、保存失败回滚、恢复、删除与宽窄窗口布局。

正文与新建聊天页采用浅纸纹，亮色为白纸、暗色为中性炭灰。材质静态平铺，不改变消息布局或交互。`src/paper-surface.css` 在 surface-polish 后加载，`Arts/paper-surface.jpg` 随 `node build-ui.mjs` 内联进主题。原始素材、生成提示词与撤销方法见 `Arts/paper-surface.md`。

纸面连续延伸到输入框两侧与滚动条预留区；底部仅消息内容渐隐，输入框保持独立实色底。渐隐边界随输入框高度和滚动更新，`node tests/paper-surface.browser.mjs` 可验证暗亮模式及相关交互。

## 启动效果

启动页采用黑白奶龙背景，左上角为紫色 logo 与 FCodex 字标。F 使用直立加粗字形与紫色 `#B8A0E0`，Codex 保持白色；logo 固定朝向，中央保留纯净的粒子小球与光晕。标题故障闪烁沿用现有频率，画面不增加操作提示。

![FCodex 启动页：紫色 logo、紫色 F 字标与粒子光球](Arts/screenshots/startup.png)

截图更新于 2026-10-19，使用正式启动动画页面生成器及 `startup/preset.json`，在独立浏览器中以 1440 × 900 渲染，等待标题和小球就绪后捕获悬停光晕效果，不含聊天或账户信息。可运行 `node tools/capture-startup-preview.mjs` 重新生成，需要本机安装 Chrome（或通过 `CHROME_PATH` 指定路径）。

## 工作目录与清理

目录约定见 `AGENTS.md`。临时任务使用 `.work/active/`；已确认无用且停用的产物放 `.work/disposable/`；可能有用的历史资料和备份放 `.work/review/`。不要整体删除 `.work`。

`powershell -NoProfile -File tools/clean-work.ps1` 预览可清理内容，加 `-Apply` 执行，只处理 disposable。诊断启动入口使用 `.work/active/diagnostic-runtime/app`，正式入口仍使用 `.fade-runtime-isolated/app`。

旧实验入口和源码已归档到 `.work/review/20261018-legacy/`，下文旧验证记录描述的是当时行为；历史脚本不能未经路径与输入检查直接重跑。

## 当前正式集成

适配 Codex 26.1013.4894.0。启动器从官方安装目录生成 `.fade-runtime-isolated/app` 副本，官方安装文件保持不变。副本使用自绘窗口按钮和固定 Codex 外壳；ChatGPT 内容在独立标签页内打开，不切换整个应用的模式，也不改写账户的模式偏好。

小球展开后位于中央，左侧为 ChatGPT 历史聊天，右侧为 Codex 项目。左右卡片的曲线、倾斜和遮罩镜像，文字正常阅读；不增加搜索框或模式标题。鼠标在哪一侧滚动，就滚动该侧列表。ChatGPT 历史使用客户端原生分页加载。

点击左侧历史会打开对应的新标签页；已经打开的聊天直接切到已有标签页。左上 + 新建 ChatGPT 聊天。各 ChatGPT 标签带关闭 ×，只关闭标签，不删除聊天；关闭当前标签后转到相邻标签，最后一个关闭后回到 Codex 首页。

关闭 ChatGPT 标签会请求原生页面缓存过期，等页面卸载及查询观察者释放后，重置该聊天的本地消息状态，移除该聊天的历史与详情查询缓存。历史列表、云端记录和磁盘快照不删除。正在提交、生成或实时语音中的聊天延后处理；重新打开同一聊天会取消待清理任务。实际内存回收仍由浏览器负责，不保证进程占用立即下降。

此适配复用当前版本的原生页面过期回调和本地状态重置函数，不手工删除原生 DOM。已实测历史标签关闭、重新加载、后台标签关闭与空白标签关闭；生成中保护、快速重开、外部观察者和账户切换由回归测试覆盖，尚未实测真实生成中的关闭。记录见 `investigations/chat-cache-release-evidence.json`。

## 启动与还原

任务栏标识现为 `FCodex.Purple.Desktop`，避免复用此前缓存官方图标的旧分组；本机已由用户确认底部任务栏显示紫色 F。手动使用 `refresh-icon.ps1` 时，它会一直等待目标应用退出，以保持由辅助进程加载的 HICON 有效，必须隐藏启动，不可执行后立即终止。正常启动仍由 Electron 持有图标，启动脚本设置窗口 Shell 属性。

任务栏还需要窗口级 Shell 属性：启动完成后 `startup/set-taskbar-icon.ps1` 通过 `SHGetPropertyStoreForWindow` 设置并读回 `AppUserModel` 的 RelaunchCommand、RelaunchIconResource、RelaunchDisplayNameResource 和 ID。此前仅更改 Electron 图标时，这些属性为空，无法保证任务栏采用新图标。该步骤只处理当前项目隔离副本的窗口，失败写入警告，不阻断应用启动。

窗口及托盘品牌图标现在由 `startup/branding-patch.mjs` 在构建副本时统一替换：窗口图标来源及主题刷新、托盘创建及主题刷新均使用打包的 FCodex PNG；原生 bootstrap 在创建窗口前设置 Fade 应用标识。修改后需要完整退出（包含托盘进程）并从 Fade 入口重新启动。`node --test tests/branding-patch.test.mjs tests/window-branding.test.mjs` 对已安装客户端的真实源码验证补丁定位，同时覆盖缺失可选窗口 API 的兼容性。

当前正式应用/窗口图标为 `Arts/fcodex-icon-purple-filled-v2.png`（紫色环、深灰内部填充、外部透明），已复制到构建入口 `Arts/fade-codex-icon.png` 并重新生成 ICO、启动器与快捷方式。窗口图标在下一次完整启动时随运行时更新。回复头像保留 30px 圆角框与 24px 图标，亮色主题用暗底，暗色主题用亮底。

应用图标已改为透明底，外部背景与编织空隙均使用 alpha 通道。透明原图为 `.work/review/20261018-legacy/Arts/fade-codex-icon-transparent.png`，正式入口仍为 `Arts/fade-codex-icon.png`。ICO 包含 16/20/24/32/40/48/64/128/256 像素，旧黑底设计保留在 `.work/review/20261018-legacy/Arts/fadecode-icon-v11.png`。深浅背景及小尺寸检查见 `.work/disposable/20261018-legacy/Arts/icon-transparency-check.png`。启动器与快捷方式已使用透明 ICO，运行中窗口需完整重启后加载新版资源。

正式图标采用确认后的 v11 设计，原图保存为 `Arts/fade-codex-icon.png`，多尺寸 Windows 图标为 `Arts/fade-codex.ico`（16/24/32/48/64/128/256）。`startup/build-icon.ps1` 可从原图重新生成 ICO，随后运行 `startup/build-shortcut.ps1` 更新启动器与快捷方式。应用窗口图标随隔离运行时构建打包，完全退出后通过 Fade 入口启动生效。已固定的旧任务栏入口若仍显示旧图标，可取消固定后重新固定 `Fade Codex.exe`。官方安装目录不修改。

支持双击项目根目录的 `Fade Codex.exe` 或 `Fade Codex.lnk` 启动，调用与 `Fade Codex.cmd` 相同的流程，不弹出 PowerShell 控制台；失败时弹窗提示查看 `launch.log`。右键 `Fade Codex.exe`，选择“固定到任务栏”（Windows 11 可能需要先点“显示更多选项”）。也可以把 `Fade Codex.lnk` 复制到桌面。固定的是这个启动器，运行中的 Codex 可能显示为另一个任务栏图标；不要将运行时目录内的 Codex.exe 当作 Fade 启动入口，否则会绕过启动脚本。移动项目目录后需要重新生成快捷方式并重新固定。

重新生成入口：`powershell -NoProfile -ExecutionPolicy Bypass -File startup/build-shortcut.ps1`。`Fade Codex.exe --check` 只检查入口脚本是否存在，不启动应用。

保存工作并完全退出 Codex，再双击 `Fade Codex.cmd`。启动器不会主动结束用户进程。首次构建副本需要一些时间；后续复用匹配的构建。官方版本不匹配时会停止适配并提示，不尝试套用旧补丁。完整性校验保留，副本内相应摘要随修改更新。

启动动画沿用 `startup/preset.json`。点击小球后，应用未就绪时继续旋转；主题、标签协调器和首页落点真正准备好才进入页面，不通过超时伪装完成。Escape 可主动退出动画。可用 `launcher.ps1 -NoStartup` 跳过动画。诊断见 `launch.log`。

启动视频使用隔离副本内的 `app://-/fade-intro.mp4` 和 `app://-/fade-loop.mp4`，不再通过 CDP 传输 Base64。3.9～5.1 秒往返片段已预生成为 `Arts/startup-loop.mp4`，按原来的 0.7 倍速度静音循环；启动时不再创建逐帧 Canvas 缓存。此次更新后的首次启动会重新构建一次副本，之后复用缓存；不会在启动时运行 FFmpeg。小球和过渡参数不变。

更换原视频或循环起止点后，先运行 `node startup/bake-loop.mjs <ffmpeg.exe 路径>`，生成视频和摘要清单，再启动应用。预览调参页面仍保留动态抽帧逻辑。`node tests/startup-media-browser.mjs` 使用独立无界面 Chrome 验证循环、特效采样和交接，不操作当前客户端。

小球绘制保留原画布尺寸、像素密度及坐标系，只清理上一帧实际占用的区域；聚拢阶段仍按全屏范围处理，故障特效结束后只清空一次。固定形态的球核和尖刺路径、粒子颜色及形成延迟提前缓存，形变、粒子运动和鼠标响应仍按原公式实时计算。`node tests/startup-orb-browser.mjs` 与 `tests/fixtures/startup-orb-before-optimization.html` 对比连续画面，覆盖深浅主题及不同尺寸、像素密度。

启动覆盖层存在时，背后的首页小球停止 Canvas 绘制和动画帧调度，首页布局与落点测量照常进行。撤掉覆盖层前按经过时间一次性推进小球运动并绘制首帧；正常交接、Escape 和清理退出共用恢复路径。原生 Codex 加载时序不变。

视频播放约 0.25 秒和 0.55 秒时，分别预热小球路径及光晕纹理，使用实际启动画布的中性黑色 screen 混合，不回放或切换小球。距小球出现不足 0.35 秒、视频未就绪或减少动态效果开启时，跳过尚未执行的预热，不延迟原定出现时间。进入首页时撤销预热图层提示，启动 iframe 移除后不再保留启动专用画布；浏览器内部 GPU 缓存仍由浏览器管理。`node tests/startup-prewarm-browser.mjs` 检查预热和清理前后的合成画面一致性。

启动器只连接本机调试端口，忽略失效进程留下的监听记录，并从备用端口选择可用端口；会话保存在 `.fade-session.json`。已运行的 Fade 会话可更新注入而不重播启动动画。

`Restore.cmd` 移除当前会话的主题与界面注入；副本内的窗口和模式适配需要完全退出后，从系统官方入口打开 Codex 才能恢复。还原主题不会关闭调试端口，完全退出客户端才会关闭。

## 已知边界

当前客户端的窗口对象可能不提供 `setAppDetails`。任务栏重启元数据仅在该方法存在时设置，且失败不阻断启动；独立应用标识和 `setIcon` 仍保留。不要将模拟 API 的测试视为目标客户端已支持该方法。

任务栏图标使用独立窗口 AppUserModelID `FadeCodex.Desktop`，并通过 Electron `setAppDetails` 指定正式 ICO、显示名称及 `Fade Codex.exe` 重新启动命令，避免沿用官方 Codex 的任务栏分组图标。此配置由 `launcher.ps1` 传入，下次完整启动生效；旧的官方固定项不会被自动移除。窗口打开后可取消旧固定项，并固定新的 Fade 窗口图标。

标签集合和各标签路由只在当前进程内存中保留，不保证重启恢复。历史聊天可重新从左侧打开。普通草稿切换已测试；临时聊天的未发送草稿在切换标签后仍可能丢失，不将临时聊天文字保存到磁盘补偿。

适配依赖当前客户端内部结构，官方更新后需要重新验证。当前窗口已进行功能检查，正式启动入口的完整冷启动仍待退出客户端后验收，不会为测试中断当前聊天。

## 开发与验证

- `node build-ui.mjs`：从源文件生成 `fade.js` 和 `theme.css`。
- `node --test tests/*.test.mjs`：49 项测试通过，包含标签切换、关闭、历史去重、启动等待与生命周期。
- `powershell -NoProfile -File tests/endpoint.test.ps1`：端口和进程归属检查通过。
- `startup/build-runtime.mjs`：构建当前官方版本的适配副本。
- `src/gpt-tabs.js`：标签、草稿路由与原生历史数据协调。
- `src/history-cards.js` / `src/history-cards.css`：左侧镜像卡片及独立滚动。
- `src/runtime.js`：交互与启动交接。

需要 Node.js 22 或更新版本。`Preview.cmd` 是不连接模型的本地预览。整合前备份位于 `.work/review/20261018-legacy/backups/integration-20261018/`，实验和验证记录位于 `investigations/`。

## 双区域标签（2026-10-18）

顶栏现在为 `fade | Codex ▾ 标签… + | GPT ▾ 标签… +`。Codex 和 GPT 分别打开各自的聊天目录，标签区域独立横向滚动。Codex 本地聊天随路由自动加入标签，同一会话去重；关闭当前标签切换到相邻 Codex 标签，最后一个关闭回首页。运行中与待处理任务显示状态标记。Codex 的 + 沿用原生新建入口及当前可识别的项目上下文，发送后形成会话路由时加入标签；尚未发送的新建页面沿用原生草稿机制，不创建多个独立空白草稿标签。

Codex 关闭标签后等待 15 秒。只有侧栏状态明确为空闲或完成、目标页面已经隐藏且没有未发送文字时，才调用原生页面过期回调。快速重开取消待释放任务；运行中、待审批、待回复、状态未知或包含草稿时保守保留。等待超过原生 10 分钟缓存周期后放弃自定义清理请求。此版本只主动释放本地 Codex 页面，不清空 Codex 任务存储、查询缓存、终端或命令，不删除历史；无法安全确认的资源继续由原生机制管理。标签和清理队列仅在当前进程中保留。

新增 `src/codex-tabs.js` 与延迟清理/标签去重回归测试。完整测试 83 项通过，已在实际窗口热更新验证两个目录入口、关闭入队、快速重开取消清理和延迟释放队列完成。原生更新后仍需重新验证页面过期回调的结构。


顶部 Codex/GPT 目录中的聊天条目和已有聊天标签支持右键菜单，并支持 Shift+F10 或菜单键。Codex 复用原生聊天入口；GPT 复用原生菜单生成器、聊天操作及确认对话框，小球历史卡片使用同一入口。空白新聊天标签不绑定菜单，发送并形成已保存聊天路由后自动启用。


## 独立进程启动动画（2026-10-18）

普通 `Fade Codex.cmd` 现在使用 `.fade-runtime-isolated/app`。启动动画通过同一窗口中的 `WebContentsView` 展示，使用独立会话和渲染进程；原生前端照常加载，不经过 5 秒诊断门控。视频、粒子、光晕、运动参数直接复用现有启动源文件。独立会话的本地协议只提供四个动画资源，原生应用页面不会加载到动画进程中。

首页就绪后只传递主题和小球落点；窗口尺寸或缩放变化时更新落点。交接时先让首页小球恢复绘制，再移除动画视图并关闭其 renderer。Escape 和关闭窗口会清理视图。正常日志 `launch.log` 包含两个进程 ID；若发现共用进程则退出动画视图，不把失效隔离当作成功。`-NoStartup` 跳过动画；`Fade Codex Diagnostic.cmd` 仍是旧 iframe 加延后原生入口的对照，不是正常优化启动方式。

请完全退出后用普通入口启动以应用新运行时；启动器不会覆盖正在运行的新版副本。当前窗口不做热迁移。需要实际冷启动确认目标机器上的观感和最终交接；进程隔离不能消除 CPU/GPU 总负载竞争。
