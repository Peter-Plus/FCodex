# FC-016：Codex 26.1021.3705.0 适配

完成时间：2026-10-27（Asia/Shanghai）。官方安装包 ASAR 文件头 SHA-256：
`5bd1f1afeb64772e9dd2bb20c1d7aee48591e8b5ea15e626c936abcfda7cb785`。

## 原因与修改

图标补丁依赖旧压缩变量名，是第一个失败点；继续预检还发现退出保护、窗口构造、首页状态与前端模块布局改变。新版预览从 app-initial 移到 app-primary，原生状态也有延迟初始化。只改图标字符串或摘要不足以适配。

- 图标和 bootstrap 定位容忍相关压缩标识符变化，仍要求唯一匹配。
- 新增独立 26.1021 适配，覆盖主进程、首页草稿身份、窗口页面保留、GPT 原生接口及预览作用域。
- 原生状态通过实时 getter 访问，避免模块加载时永久捕获 undefined。
- 预览采用新版原生 mountedTabs、实例 key 与预加载替换项；保留全部打开标签的目录，但不额外挂载原生未挂载的编辑器实例。
- 文本虚拟视图在文件加载和布局完成后刷新现有实例，取消后台/卸载后的待执行刷新，不替换文档或撤销栈。
- EXE 内嵌摘要验证前移到写文件之前。新增 `--runtime-root` 支持独立验证副本。
- 成功构建的新版本可作为后续升级失败时的回退候选；回退仍检查 ASAR、可执行文件、归档内容及相关签名。

## 验证

使用本机真实官方 26.1021.3705.0 安装目录，Node.js 22.19.0：

1. 从空任务目录构建独立运行时，未借用 `.fade-runtime-isolated/build.json` 或旧副本。
2. 正式预检流程通过 14 项构建资产；诊断模式通过 16 项，全部修改后的 JS/CJS 通过语法检查。
3. 独立用户配置和端口 19326 冷启动，使用正式 `inject.mjs` 注入；验证原生后端连接、独立启动动画、小球交接与 Fade 页面就绪。
4. 真实客户端验证窗口模式 Codex/GPT 空白页、HTML 正文、文本内容、预览目录选择、文本/HTML 往返切换，以及新建 GPT 页签后预览保留；未发送聊天消息。最终断言未捕获 window error 或 unhandledrejection。
5. 回退校验通过新运行时的 21797 个归档条目及可执行文件完整性。
6. 下列回归测试 38 项全部通过，无跳过；另运行原预览作用域测试两项通过。

```powershell
$env:FADE_TEST_CODEX_APP='C:\Program Files\WindowsApps\OpenAI.Codex_26.1021.3705.0_x64__2p2nqsd0c76g0\app'
node --test tests/client-261021.test.mjs tests/prepare-runtime.test.mjs tests/runtime-unknown-build.test.mjs tests/runtime-fallback.test.mjs tests/gpt-tabs.test.mjs tests/gpt-cache-release.test.mjs tests/window-branding.test.mjs
node --test --test-name-pattern='retained scope|snapshot captures' tests/window-preview.test.mjs
node startup/prepare-runtime.mjs $env:FADE_TEST_CODEX_APP --verify-only
node startup/build-runtime.mjs $env:FADE_TEST_CODEX_APP --verify-only --diagnostic-hold
```

测试时 Windows 将独立窗口标记为隐藏，导致动画帧暂停。最终端到端检查通过测试窗口自身的最大化操作显示窗口，并在持续 CDP 连接中启用 focus emulation；不把隐藏窗口下的超时当作用户可见状态的验收结果。

## 边界与交付

未停止用户正在使用的正式客户端，未覆盖正式运行时；独立副本冷启动和注入已验证，但没有在用户正常退出后双击正式 `Fade Codex.cmd` 做完整冷启动验收。用户机器上的最终复测仍需完整更新项目后执行。未实测真实生成中的退出、跨系统窗口迁移或所有官方功能；未来未知构建仍可能有新的结构变化。

诊断文件、截图、脚本与独立客户端保留在 `.work/review/test-runs/fc016-compat-nK0Pzc`；这是本机证据，不是正式源码或测试依赖。保留 manifest 和结果记录，不自动清理。正式版本适配回归使用环境变量指定的官方安装包，不依赖此目录。
