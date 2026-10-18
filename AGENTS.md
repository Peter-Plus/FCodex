# FCodex 项目工作约定

## 工作产物分区

- 不在根目录散放一次性脚本、截图、性能记录、测试配置、客户端副本或废弃方案。
- 非正式产物统一放在 .work，任务独立目录，按生命周期分区：
  - active/<任务名>/：正在运行的测试、编译、临时浏览器配置及诊断客户端。不可批量清理。
  - disposable/<日期-任务名>/：已确认停用、无正式依赖、无唯一资料的纯垃圾。可直接清理，无须逐项审批。
  - review/<日期-任务名>/：可能有用的旧方案、证据、实验源码、性能记录和备份。清理前检查用途、依赖、唯一性和进程占用。
- 新测试使用 tests/work-area.mjs 创建 active 目录；关闭本任务进程后归入 review/test-runs，确认所有子进程退出且证据不再需要后再归入 disposable。运行中不得直接写 disposable。
- 跨任务保留的目录包含 manifest.json：purpose、createdAt（真实带时区时间）、status、rebuildCommand、safeToDelete。无法重建应明确说明；仅 disposable 中停用产物标记 safeToDelete=true。
- 旧 .work/tmp、validation、discarded 可能属于其他任务，不按名字推断可删；任务结束后检查并归入上述分区。

## 正式依赖与历史材料

- 正式源码、构建输入、测试基准、用户资料不得放入 disposable/review；生产程序和正式测试不得依赖这两个目录。
- 源码在 src/startup/tests/tools；测试基准在 tests/fixtures；正式资源在 Arts。design-previews 保留的文件仍有构建、预览或测试用途。
- investigations 保留长期引用的结论和精简证据；大采样、一次性探针及补丁脚本放 review。
- 历史备份和废弃设计放 review，可能是唯一副本，不宣称整个 .work 可安全删除。
- 正式运行时 .fade-runtime-isolated、会话和偏好留原位；诊断入口使用 .work/active/diagnostic-runtime，运行期间不可移动或清理。
- Arts 中带哈希的 ICO 是 Windows 任务栏正式资源，不按文件名判为旧图标。
- 移动必须同步消费者、构建脚本、测试和文档。历史归档脚本不保证直接可运行，重新使用前修复路径和缺失输入，禁止批量执行旧补丁。

## 清理与交付

- powershell -NoProfile -File tools/clean-work.ps1 预览纯垃圾；加 -Apply 只删除 disposable 内的内容，永不清 active/review。
- 归入 disposable 前确认进程不再使用、可重建或确无保留价值；目录名字或年龄不足以证明可删。
- 删除、递归移动前核实完整路径位于项目预期目录内；拒绝符号链接/目录联接，不跨链接清理，不结束其他任务进程。
- 测试用 finally 清理本任务资源；失败产物和无法确认停用的文件留 active/review 并说明原因，不强制删除。
- 交付前检查根目录无新增散落产物，更新清单及保留说明。不自行安排定时清理。

## Git

- .gitignore 排除整个 .work 及本机运行状态；AGENTS.md、.gitignore、正式源码和测试基准应提交。
- 不宽泛忽略 *.png、*.json 或整个 tests/Arts/design-previews/investigations。
- 已跟踪文件不因忽略规则自动取消跟踪；处理索引前检查具体路径。
