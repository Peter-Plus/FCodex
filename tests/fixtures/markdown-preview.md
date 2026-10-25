# Markdown 阅读样张

这是一份用于检查 FCodex 预览排版的长期测试样张。可以在窄侧栏与宽窗口之间切换，分别观察亮色和暗色下的阅读效果。文中数据仅为演示，不代表实际测量结果。

## 正文与强调

好的排版应该让内容自然地进入视线。中文、English、数字 0123456789 与标点符号混排时，需要保持稳定的行距和清晰的层次。这个段落故意写得稍长，用于观察窄侧栏中的自动换行，尤其是长句跨越多行时是否仍然容易阅读。

这段包含 **加粗文字**、*斜体文字*、***加粗斜体*** 和 ~~删除线~~。行内代码 `preview.scrollLeft` 应当容易辨认，但不应比正文更抢眼。

相邻段落之间应有适度留白。链接示例：[项目说明](../../README.md)，以及 [Markdown 语法参考](https://commonmark.org/help/)。

## 表格

### 常规表格

| 功能 | 当前示例 | 观察重点 |
| :--- | :---: | :--- |
| 正文字体 | 14px | 中英文混排与阅读密度 |
| 标题层级 | H1 / H2 / H3 | 字号递进、粗细与间距 |
| 代码块 | JavaScript | 等宽字体和语法高亮 |
| 文档主题 | 亮色 / 暗色 | 背景与文字的对比 |

### 数字对齐与长内容

| 文件 | 行数 | 示例耗时 | 说明 |
| :--- | ---: | ---: | :--- |
| `app.js` | 128 | 12 ms | 普通短文本 |
| `renderer.js` | 2048 | 168 ms | 这一列故意包含较长的说明文字，用于检查窄窗口中单元格的换行与列宽分配。 |
| `settings.json` | 36 | 3 ms | 包含数字、单位与行内代码 |

## 列表与任务

- 第一项：普通列表文字。
- 第二项：这是一条较长的列表内容，缩窄预览器后，观察续行与项目符号之间的对齐是否清楚。
  - 子项：保留合理缩进。
  - 子项：包含 **强调** 与 `inlineCode`。
- 第三项：回到主列表。

1. 打开 Markdown 预览。
2. 调整侧栏宽度，观察正文是否自然换行。
3. 切换主题，检查表格边线与代码背景。

- [x] 准备测试文档
- [x] 加入表格与代码示例
- [ ] 人工确认字体大小舒适
- [ ] 检查窄窗口阅读体验

## 引用

> 阅读界面应当让内容比装饰更突出。
> 这是一条跨越多行的引用，用于检查侧边线、背景和文字的对比度。

> **提示**：引用中也可以包含 `代码` 和 [链接](../../README.md)。
>
> 第二段引用应保持相同的视觉层级。

## 代码块

### JavaScript

```javascript
function scrollPreview(element, offset = 120) {
  const limit = element.scrollWidth - element.clientWidth;
  const target = Math.max(0, Math.min(limit, element.scrollLeft + offset));

  element.scrollTo({ left: target, behavior: "smooth" });
  return { target, canScroll: limit > 0 };
}

// 较长的一行，用于观察代码区域的布局与阅读体验。
const preferences = { theme: "dark", fontSize: 14, lineHeight: 1.75, previewCodeWrap: false, smoothTabScrolling: true };
```

### JSON

```json
{
  "reader": {
    "fontSize": 14,
    "theme": "system",
    "features": ["headings", "tables", "code", "quotes"]
  }
}
```

### 无语言标记

```
FCodex/
├── src/
│   └── markdown-preview.css
└── tests/
    └── fixtures/
        └── markdown-preview.md
```

## 图片

![FCodex 项目图标，用于检查本地图片加载与缩放](../../Arts/fcodex-avatar.png)

图片使用项目已有资源。上面的替代文字可用于检查图片不可用时的展示。

---

## 标题层级对照

### 三级标题：小节

三级标题适合划分较短的内容单元。

#### 四级标题：细项

四级标题应与正文有所区别，但不需要很大的字号。

##### 五级标题

###### 六级标题

## 边界情况

长路径：`G:/Toy/FCodex/tests/fixtures/a-very-long-directory-name/another-long-directory/markdown-preview-example.md`。

连续字符串：abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789。

特殊字符：`<div>`、`&&`、`"quotes"`、`\path\file`，以及中文全角括号（示例）、破折号——与省略号……。

文档结束。滚动到此处后，可回到顶部检查标题与正文的整体密度。
