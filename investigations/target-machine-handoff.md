# FCodex 目标机器排查交接说明

用途：由目标机器上的 Codex 就地取证，回传给维护端 Codex 集中定位、修复与验证。本文是排查任务说明，不是自动执行脚本。先读本机项目的 `AGENTS.md`，再围绕当前问题收集证据。

## 可直接发给目标机器 Codex 的任务

```text
请阅读本项目 investigations/target-machine-handoff.md，按其中流程排查我接下来描述的 FCodex 问题，并填写 investigations/target-machine-report-template.md 的副本。

目标是让另一台机器上的维护端 Codex 能根据你的报告定位问题、制作可复用修复。请先保留故障现场，以只读检查为主，不要一上来重启、热更新、重建或清理运行时。只有已有用户授权时才实施修复；若修复，也请先取证，再提供精确 diff 和修复前后的验证结果。

不要只给“应该是版本问题”等猜测。请区分事实、推断和未知，注明每个关键结论的证据来源。不要把维护端历史结论当作这台机器的事实。

回传：一份简明报告，以及报告明确引用的最少量证据。以报告模板为准，不要打包整个项目或用户资料。无法获取的项目写明原因；不要为填满模板反复打扰用户，也不要为取证打断正在运行的工作。

当前问题：
（在此填写现象、触发操作、截图或报错文字）
```

## 先做什么

1. 记录当前当地时间及 UTC 偏移、问题发生时间、触发步骤、预期与实际行为。已有截图应转录关键错误文字。先读取相关日志，避免新启动覆盖 `launch.log`。
2. 核对下述版本层次。目录里的文件、已安装软件和当前进程可能来自不同版本，不可互相代替。
3. 只检查与当前问题有关的接口和状态。能安全重现时执行最短操作，记录成功/失败次数、对应日志时间；涉及未保存内容、生成中任务或关闭标签时，先用隔离场景验证。
4. 给出最可能原因、相反证据和最小修复建议。只有已获授权才改动，并记录完整改动及生效方式。
5. 按[报告模板](target-machine-report-template.md)回传。没有证据的字段填写“未知：原因”，不要猜值。

## 必须核对的版本层次

| 层次 | 需要的信息 | 不能据此直接认定什么 |
| --- | --- | --- |
| 项目源码 | 分发来源/版本、Git commit（若有）、相关改动、关键文件 SHA-256 | commit 相同不代表未提交文件相同 |
| 磁盘上的生成文件 | `fade.js`、`theme.css` 及相关源码/桥接脚本的 SHA-256 | 修改源码不代表已重新生成或热更新 |
| 当前页面 | 运行状态、实际加载的 app-shared/app-initial URL、相关接口能力、是否热更新 | 磁盘 fade.js 不一定就是当前页面运行的代码 |
| 当前进程和隔离运行时 | 目标进程 PID/可执行路径/文件版本、`.fade-session.json` 的 appDir/port、对应运行时 build.json | 会话文件和 build.json 可能过期，需与进程交叉核对 |
| 官方安装 | 当前安装的 OpenAI.Codex 版本、安装位置 | 官方更新不代表 FCodex 已运行新版；也可能正在使用旧副本回退 |

读取实际使用的运行时目录下 `build.json`，优先回传 `revision`、`viewRevision`、`mediaRevision`、`oldHash`、`newHash`、`source`、`destination`。这些是构建记录，不是当前进程版本的独立证明。`window.__fadeCodex.version` 等通用版本号也不足以识别一次修复。

如果无 Git、无 build.json 或无日志，仍继续收集其余证据并说明缺项。不要为了获得版本信息触发重新构建。

## 最少量只读命令

在已确认的 FCodex 项目根目录执行，按需选用，不必全部执行。不要求目标机器目录与维护端相同。命令输出中的用户路径在回传前脱敏。权限不足、命令不存在或进程 Path 为空时，记录原始错误并继续，不能当作“未安装/未运行”。

```powershell
Get-Date -Format o
Get-CimInstance Win32_OperatingSystem | Select-Object Caption,Version,OSArchitecture
node --version
git rev-parse HEAD
git status --short
Get-AppxPackage -Name OpenAI.Codex | Select-Object Version,InstallLocation
Get-Process -Name ChatGPT,Codex -ErrorAction SilentlyContinue |
  Select-Object Id,Path,@{Name='FileVersion';Expression={if ($_.Path) {(Get-Item -LiteralPath $_.Path).VersionInfo.FileVersion}}}

# 查看会话定位信息；尚需与实际进程核对。
if (Test-Path -LiteralPath '.fade-session.json') {
  Get-Content -LiteralPath '.fade-session.json' -Raw
}

# 首轮只需这些指纹；后续加上与故障相关的少量文件。
@('fade.js','theme.css','src/native-theme.js','startup/window-controls.mjs','startup/diagnostics-bridge.mjs') |
  Where-Object {Test-Path -LiteralPath $_ -PathType Leaf} |
  ForEach-Object {Get-FileHash -LiteralPath $_ -Algorithm SHA256} |
  Select-Object Path,Hash
```

不要回传完整进程列表、环境变量、用户目录或配置树。若需确认调试端口，只查询会话指定端口的监听 PID，并核对其可执行路径；`FADE_PORT` 可能覆盖会话中的端口，参考 `startup/endpoint.mjs`。不要扫描任意端口，也不要连接到无法确认归属的服务。

## 如何取证当前页面

仅在已确认属于本次 FCodex 会话的本机调试端口读取；无权限或无端口时跳过，不为此重启应用。按照 `inject.mjs` 的目标筛选方式选择主 app 页面，排除预热、分离窗口、头像覆盖层等。回传以下小范围状态即可：

- `window.__fadeCodex?.status()` 的相关字段；经典模式下对象不存在是可能的正常情况。
- `typeof window.fadeDiagnostics?.report`、`typeof window.fadeDiagnostics?.openFolder`、`window.fadeDiagnostics?.bridgeVersion`。
- 与当前故障有关的原生平台能力是否存在；例如 `settings.read/write`，不要枚举/调用所有平台接口。
- DOM 中已加载的 app-shared/app-initial 脚本 URL。跟随实际 URL 检查模块，不能照抄别的机器上的哈希和混淆导出名。

读取页面状态不要顺便调用 `set`、`write`、`destroy`、`openFolder`、模式切换或热更新。这些属于功能操作，应在复现/验证步骤中单独记录。不要读取聊天正文、输入框内容、认证信息或整份 DOM。

注意：当前日志收集器按页面生命周期安装一次，热更新后旧收集器可能仍保留最初的 `uiRevision`；兼容桥接的 `uiBundle` 也可能是辅助进程启动时的快照。不能只凭这些字段断言当前 UI 就是该版本，需结合磁盘指纹、加载 URL、热更新时间与行为验证。可把此类不一致单独报告。

## 日志和失败证据

- 异常日志通常在启动器目录 `.fade-logs/errors.jsonl`，轮换文件为 `errors.jsonl.1`。原生桥接未通过启动器启动时可能使用 userData 下的 `.fade-logs`，以本机代码与实际文件为准。
- 普通启动日志为 `launch.log`；诊断启动日志在 `.work/active/diagnostic-runtime/launch.log`。记录文件大小、最后修改时间，并截取故障前后相关部分。
- 同时保留原始 `operation`、`message`、`stack`、时间和构建字段。先把 JSONL 的 UTC 时间换算成用户当地时间，再关联截图和操作，避免误配旧错误。
- 日志会去重、限流、轮换，部分捕获分支也可能未接入。没有记录不证明没有故障；明确写“未找到匹配记录”，并说明查了哪个时间范围、哪个文件及日志接口是否存在。
- 看到 `diagnostics.self-test` 等明确自检记录，不要当成用户故障。`ResizeObserver` 全局通知也不能直接解释业务操作失败。
- 接口返回失败时保留方法、状态码和后台错误文字；不要只转述提示框。成功回执也不等于用户结果成功：打开目录要确认目标窗口可见，主题要核对原生值与界面，模式切换要核对确实完成。

错误文本本身可能带路径、文件名和业务信息；自动脱敏不能保证覆盖所有内容。附件回传前人工复核，遮去聊天、账户、令牌、URL 查询参数及无关项目路径。保持堆栈函数名、行号、状态码、版本和路径结构；用 `[USER]`、`[PROJECT]` 等一致替换，不要把定位线索全删掉。

## 按故障补充，避免全量采样

| 问题 | 额外收集 | 验证标准 |
| --- | --- | --- |
| 启动/更新失败 | 当前启动入口、是否完全退出过、预检失败的第一个 hook、是否回退旧副本 | 实际进程来自预期目录；不只看脚本退出码 |
| 主题/经典模式 | 当前模式、主题值、设置接口能力、相关错误和最短步骤 | 原生主题和界面一致；退出经典模式流程不被可选同步阻断 |
| 文件预览/保存 | 本机/WSL/远程、文件类型、是否编辑或未保存、失败接口、脱敏路径形态 | 使用测试文件确认内容与磁盘状态，不能对用户文件冒险覆盖 |
| 日志目录入口 | 点击前后是否有匹配目录的 Explorer 窗口、可见/最小化状态、桥接版本 | 目标目录窗口实际可见，不能只确认 Explorer 进程存在 |
| 窗口/布局 | 缩放比例、分辨率、显示器数量、全屏/最大化、窗口模式、必要截图 | 按用户实际操作验证；截图只保留相关界面 |
| 卡顿/资源占用 | 触发动作、持续时间、空闲/故障时本应用相关 PID 的少量 CPU/内存样本 | 有可比较的前后数据；不用高频监控代替定位 |

## 维护端已有线索：仅供核对

以下来自维护端 2026-11-01 的观察，不代表目标机器也如此：

- 当时官方安装为 26.1023.6621.0，保留的隔离副本构建记录来自 26.1021.3705.0；新版完整构建在 branding hook 失败。功能热更新成功不等于新版运行时完整适配。
- 旧 `vscode://codex/get-setting` / `set-setting` 返回 432，新平台 `settings.read/write` 可用。现有 `src/native-theme.js` 已加入能力检测和可释放调用；经典模式不再因可选主题同步失败而退出失败。
- 旧版打开目录曾只检查 Explorer 启动且使用隐藏启动。现有兼容桥接 V2 使用 `startup/open-log-folder.ps1` 恢复/打开目标目录并检查可见性。
- 兼容日志桥接提供页面异常落盘；原生主进程/渲染进程崩溃监测仍依赖新版原生桥接，不能把两者覆盖范围混为一谈。

先核对目标机器是否真的包含并运行这些修复，随后才判断是旧包、未生效、回退副本还是新问题。不要为了让报错消失而直接吞错、禁用功能或把所有异常当作版本问题。

## 如果目标机器已做修复

先保留修复前证据。回传修改文件列表、精确 diff（包含新增文件）、基于的文件指纹/commit、修复原理和仍不确定之处。列出执行过的构建、热更新、重启及测试，区分逻辑测试、隔离客户端验证、用户当前会话验证。

生成文件需要说明是否由源码重新生成；不得只交付无法追溯的 fade.js。不要把本机绝对路径、端口、进程号或混淆模块名写死成通用修复。项目原有 `AGENTS.md` 的进程、目录、清理与正式资源约定继续适用。

## 回传产物位置

报告副本和截图/日志片段放在本任务 `.work/active/<任务名>/`。创建保留目录时写 manifest.json：purpose、真实带时区 createdAt、status、rebuildCommand、safeToDelete=false；无法重建的故障现场需说明。测试运行使用 `tests/work-area.mjs`；任务进程退出后按项目约定归档 review，不把资料直接写入 disposable，不清理其他任务。

向维护端发送报告正文和明确引用的少量附件。不要只给目标机器本地路径，另一台机器无法访问。路径可作为目录关系说明，但附件要实际随报告转交。
