---
name: "心创云盘 (ShouYuLove Drive)"
description: "暖纸面上的共享网盘工作台：左侧目录树与刻度尺存储条，右侧白色文件区；松绿墨色主操作、蜜色文件夹、按类型着色的文件色块，与统一通行证的浅色悬浮窗同系。"
colors:
  paper: "#fbfaf6"
  sheet: "#ffffff"
  sand: "#f4f0e7"
  sand-deep: "#e9e3d5"
  line: "#e8e2d6"
  line-strong: "#d3cbba"
  ink: "#1c2622"
  ink-soft: "#414d47"
  ink-quiet: "#5c6861"
  ink-faint: "#98a19b"
  placeholder-ink: "#626e66"
  pine: "#23332c"
  pine-hover: "#2f453b"
  on-pine: "#fbfaf6"
  leaf: "#2a7a55"
  leaf-deep: "#1f6b49"
  heart: "#f2553b"
  danger: "#b9321c"
  danger-hover: "#9f2814"
  danger-soft: "#fcebe6"
  mark: "#fdf2d0"
  mark-deep: "#f8e2a0"
  stage: "#161d1a"
  folder-back: "#e79a2b"
  folder-front: "#f8c35a"
  sky-butter: "#fff5df"
  sky-apricot: "#ffe7cc"
typography:
  display:
    fontFamily: "\"Google Sans Flex\", \"HarmonyOS Sans SC\", -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    fontSize: "clamp(42px, 6.4vw, 68px)"
    fontWeight: 700
    lineHeight: 1.12
  title:
    fontFamily: "\"Google Sans Flex\", \"HarmonyOS Sans SC\", -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.3
  heading:
    fontFamily: "\"Google Sans Flex\", \"HarmonyOS Sans SC\", -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "\"Google Sans Flex\", \"HarmonyOS Sans SC\", -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  control:
    fontFamily: "\"Google Sans Flex\", \"HarmonyOS Sans SC\", -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.4
  meta:
    fontFamily: "\"Google Sans Flex\", \"HarmonyOS Sans SC\", -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.4
  mono:
    fontFamily: "\"SF Mono\", \"JetBrains Mono\", ui-monospace, Menlo, Consolas, \"HarmonyOS Sans SC\", monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  xs: "5px"
  sm: "8px"
  md: "10px"
  tile: "9px"
  card: "14px"
  lg: "18px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  side-width: "272px"
  topbar-height: "68px"
components:
  button-primary:
    backgroundColor: "{colors.pine}"
    textColor: "{colors.on-pine}"
    typography: "control"
    rounded: "{rounded.md}"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.pine-hover}"
  button-secondary:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    borderColor: "{colors.line-strong}"
    rounded: "{rounded.md}"
    height: "40px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#ffffff"
  row:
    minHeight: "56px"
    borderColor: "{colors.line}"
  row-selected:
    backgroundColor: "{colors.mark}"
  search-field:
    backgroundColor: "{colors.sand}"
    rounded: "12px"
    height: "44px"
  dialog:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.lg}"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-pine}"
---

# Design System: 心创云盘 (ShouYuLove Drive)

## Overview

心创云盘是手语分社心创组每天要用的共享网盘。界面的任务是让人一眼找到文件、放心地存取，所以页面本身保持安静，颜色主要来自文件自己。

整体是一张暖纸面：左侧浅沙色侧栏放目录树、管理入口和存储刻度尺，右侧纯白的文件区放搜索、路径、操作按钮和文件列表。主操作用松绿墨色，文件夹是蜜色的牛皮纸夹，不同类型的文件用不同的浅色块区分，选中的行像被荧光笔划过一样变成淡黄色。徽标里的珊瑚色爱心只出现在徽标和刻度尺的指针上。

页面只有浅色一种外观（`color-scheme: only light`），与统一通行证登录悬浮窗的浅色主题同系。未登录页的那轮暖光呼应通行证的暖色天光。

三个最能代表这套设计的地方：

1. 存储刻度尺。取自徽标里托着云的那把尺，两端有立边，十等分刻度，松绿色填充表示已用空间，珊瑚色指针标出当前位置。
2. 文件类型色块。图片青绿、视频紫、音频玫红、PDF 朱红、文档蓝、表格绿、演示橙、压缩包棕、代码灰蓝、纯文本灰绿，文件夹不用色块而是直接画成蜜色文件夹。
3. 荧光笔选中。被选中的行和卡片使用 `mark`（`#fdf2d0`），多选后底部浮出松绿色的操作条。

## Colors

### Primary

- `pine` `#23332c`：主按钮、勾选框、存储条填充、多选操作条。悬停用 `pine-hover` `#2f453b`。
- `heart` `#f2553b`：只用于徽标爱心与刻度尺指针，不用于按钮和文字。
- `leaf` `#2a7a55` / `leaf-deep` `#1f6b49`：焦点环、输入框聚焦、文字链接、上传进度条、拖放目标的描边。

### Neutral

- `paper` `#fbfaf6`：门厅页底色、查看器正文背景。
- `sheet` `#ffffff`：文件区、对话框、菜单。
- `sand` `#f4f0e7`：侧栏、搜索框、悬停底色。`sand-deep` `#e9e3d5` 用于侧栏悬停与计数徽标。
- `line` `#e8e2d6` / `line-strong` `#d3cbba`：行分隔线与控件描边。
- `ink` `#1c2622`、`ink-soft` `#414d47`、`ink-quiet` `#5c6861`：三级文字。`ink-faint` `#98a19b` 只用于装饰性分隔符与禁用状态。

### Semantic

- `danger` `#b9321c`：删除、移除、停用等不可恢复操作的文字与确认按钮，浅底用 `danger-soft` `#fcebe6`。
- `mark` `#fdf2d0`：选中状态、管理员身份标签、一次性令牌提示。
- 文件类型色块的前景与背景成对定义在 `style.css` 的 `.ftile--*` 规则里。

### Named Rules

- 珊瑚色不当按钮色。主操作是松绿，危险操作是深红，两者不混用。
- 阴影带暖色（`rgba(58, 44, 20, …)`），不使用纯灰阴影。
- 正文与占位文字在各自底色上的对比度不低于 4.5:1。

## Typography

沿用自托管的 `Google Sans Flex`（拉丁字母与数字）和 `HarmonyOS Sans SC`（中文）。界面用到的中文字形由 `scripts/build-ui-fonts.py` 提取成约 60 KB 的预加载子集，`font-display: block`，刷新时不闪字。修改了界面文案后要重新运行这个脚本。

### Hierarchy

- 门厅大标题：`clamp(42px, 6.4vw, 68px)`，700。
- 当前文件夹名（路径末段）：22px，700；路径上其余各段 22px，500，`ink-quiet`。
- 对话框标题：19px，700。
- 文件名：15px，500。
- 按钮与菜单项：15px，500。
- 修改时间、大小、说明文字：14px，使用等宽数字。
- 代码与令牌：等宽字体 14px。

### Named Rules

- 全站最小字号 14px。
- 中文字体只有三档字重（400、500、600 以上），不要使用 550、650 这类中间值。
- 文件名过长时截断名称主体并保留扩展名。

## Layout

- 桌面端（宽度不小于 960px）：左侧 272px 固定侧栏，右侧文件区自适应。顶栏 68px 吸顶，列表表头吸附在顶栏下方。
- 960px 以下收起侧栏，顶栏左侧只留徽标，存储刻度尺与归属信息移到列表下方。
- 720px 以下列表改为两行式（名称在上，大小与时间在下），只保留「更多」按钮；「选择」和显示方式收进「更多」菜单，菜单改为底部面板。
- 文件区里的内容左对齐，数字列（大小）右对齐。
- 门厅页（未登录、未开通、读取失败）不显示侧栏，内容居中，未登录页桌面端左文右图。

## Elevation & Depth

- 文件区与侧栏之间只用一条 `line` 分隔，不加阴影。
- 菜单、上传卡片、提示条、多选操作条使用 `shadow-pop`；对话框与查看器使用 `shadow-dlg`，背后是 `rgba(28, 38, 34, 0.45)` 的遮罩。
- 提示条通过 popover 进入顶层，保证盖在对话框上面。

### Named Rules

- 不使用毛玻璃和渐变做装饰。唯一的渐变是门厅页背景的暖光和徽标背后的圆。

## Shapes

- 控件 10px 圆角，文件色块 9px，宫格卡片 14px，对话框 18px，标签和容量选项为胶囊形。
- 图标统一为 20 格线性图标，线宽 1.6，圆头圆角，集中定义在 `index.html` 顶部的 SVG 图标库里，页面和脚本都用 `<use href="#i-…">` 引用。

## Components

### Buttons

主按钮（松绿底）、次按钮（白底描边）、安静按钮（无边框，用于排序等次要操作）、危险按钮（深红底，只出现在确认对话框里）。图标按钮 36px 见方，手机端行内按钮 44px。

### Tags & Chips

身份标签用 `mark` 底色。容量选项是胶囊形，选中后变成松绿底，不可选的用虚线描边。

### File Rows & Cards

列表行高 56px，五列：勾选框、名称、修改时间、大小、操作。勾选框和行内操作在悬停、聚焦或已有选中项时才出现。点名称所在的整块区域打开文件或进入文件夹，右键或「更多」按钮打开操作菜单，行可以拖到文件夹、目录树或路径上完成移动。宫格视图使用同一份数据，图片不超过 3 MB 时显示缩略图。

### Inputs & Search

输入框 42px 高，聚焦时 `leaf` 描边加浅绿光晕。搜索框在顶栏里，浅沙色底，按 `/` 聚焦。

### Navigation

侧栏目录树按需展开加载。路径过深时折叠中间各段，点「…」展开。账号菜单在顶栏右侧，里面有管理设置、切换账号、退出登录和站点链接。

### Dialogs

命名与确认共用一个小对话框，错误提示显示在对话框内。移动使用带目录树的文件夹选择器。管理设置是一个带三个分页的对话框（成员名单、存储空间、接入令牌），手机端全屏。文件查看器占据大部分视口，图片和视频用深色舞台，文档用纸面版心，可以用左右方向键切换文件。

### Storage Gauge

`.gauge` 元素通过 `--pct` 控制填充与指针位置。侧栏、手机端页脚和管理设置里各有一把，由同一个函数更新。

## Do's and Don'ts

### Do:

- 让文件名和文件类型成为页面上最显眼的东西。
- 新增操作优先放进已有的菜单，保持工具栏只有「上传」和「新建」两个带文字的按钮。
- 不可恢复的操作先弹确认，并写清楚后果。
- 文案用成员听得懂的话，说清楚发生了什么、下一步怎么做。
- 改动后在 1440px、820px、390px、320px 四个宽度各检查一遍，不能出现横向滚动。

### Don't:

- 不要恢复深色外观，也不要添加跟随系统的深色模式。
- 不要把珊瑚色用在按钮、链接或大面积底色上。
- 不要在每一行重复摆放文字操作链接。
- 不要在页面上写 `ext4`、`SHA-256` 这类运维术语（管理设置里面向管理员的接口示例除外）。
- 不要使用行内 `style` 属性和外部资源，页面受 `style-src 'self'` 等内容安全策略约束，动态样式只能通过脚本设置。
