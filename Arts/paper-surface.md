# 正文浅纸纹

- `paper-surface.png`：内置 imagegen 生成的原始材质，1254 × 1254，作为后续调整的正式源图保留。
- `paper-surface.jpg`：同尺寸 JPEG、质量 85，构建时内联到 CSS，运行时不访问网络。
- `src/paper-surface.css`：720px 平铺；亮色白底加 60% 遮色层，暗色炭灰底加 94% 遮色层。没有动画或覆盖正文的 DOM 层。
- 仅 orb 模式的聊天主区域铺一层纸面；滚动容器透明，滚动条预留区延续底下的纸纹。代码卡片与右侧文件面板保留原有背景。输入框局部采用柔白 / 中性深灰，保留细紫色聚焦边线并收敛阴影。
- `src/paper-surface.js` 只给消息内容加渐隐，按滚动位置、页脚高度、窗口大小和输入框自动隐藏状态更新边界；不重建消息 DOM、不改变滚动尺寸。原生底部纯色底板和渐变只在内容渐隐初始化成功后隐藏。销毁时移除观察器、监听器与标记。
- 验证：`node tests/paper-surface.browser.mjs`，使用独立 Chrome 检查暗亮背景、滚动、输入框增高、自动隐藏、窗口变化、草稿与布局尺寸不变，以及销毁恢复。
- `node build-ui.mjs` 重建。删除构建脚本中的 paperTexture 和对应 appendFileSync 两行即可撤销此背景层，再重建并重载样式。
- 日常切换使用 Fade 设置中的“正文背景”，无需改代码。亮暗分别提供纯色、牛皮纸和自定义；图片及选择保存在本机 `fcodex-backgrounds` IndexedDB 的 `themes` 存储中。新增实现位于 `src/background-settings.js/.css`。

生成方式：内置 imagegen。原图是生成结果，不保证按提示词重新生成得到相同像素；因此保留 PNG。

原始提示词：

Generate ONE production-ready square 1024x1024 seamless tileable material texture, flat full bleed, absolutely no text, UI, borders, objects, logos, shadows at edges or vignette. Matte neutral light gray-white pressed paper texture. Only extremely shallow soft small-to-medium natural paper undulations, faint tiny surface grain. Nearly smooth, gently handled white paper. No visible stringy cellulose fibers, no hairs, no spots, no deep folds, no sharp crease networks, no wrinkles larger than 10 percent of image width. Uniform diffuse frontal illumination, subtle monochrome luminance variations between approximately #dfdfdf and #f6f6f6 centered #eaeaea. Neutral grayscale only, zero yellow or brown. Seamless matching all edges, suitable repeated behind long-form text in a desktop app. Physical paper microtexture recognizable close up but very restrained at normal view. The user approved subtle paper with extremely shallow faint wrinkles, not coarse kraft pulp. Output just the flat texture.
