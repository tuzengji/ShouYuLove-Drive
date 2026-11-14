---
version: 2
slug: "src-web-index-html"
primary_target: "src/web/index.html"
related_targets: ["src/web/style.css","src/web/app.js","src/web/auth-modal.css","branding/custom.css"]
---

# 心创云盘 · 深夜星轨编辑部工作台（复刻 Benchmarks' Last Exam）

Mode: Operate. Route: `/drive/` 与 `/drive/files/`.
保留全部当前功能与文案内容，并将视觉体系完整复刻回 `Benchmarks' Last Exam`（`https://benchmarks-last-exam.com/zh/benchmarks/`）深夜星轨暗黑风格，同时彻底修复页面刷新时字体切换闪烁的缺陷：（1）首页上方直接展示双栏发丝线云盘实时概览（存储空间使用率与文件、文件夹规模）；（2）统一通行证全程在当前页悬浮窗内登录与切换账号，零整页跳转；（3）文案详略得当、无目录与加密术语，最小字号清晰易读（桌面端与常规手机 `>= 15px`，`<= 380px` 超窄屏 `>= 14px`）；（4）预加载 `~50 KB` UI 中文子集字体 + `font-display: block` + 服务端同步注入首屏状态，刷新页面零字体切换、零布局跳动。

## Direction contract

THESIS: 复刻 `Benchmarks' Last Exam` 深空暗夜编辑部界面（`#05060b` 夜空画布、`#0b0d14` / `#10131c` 黑曜石台面、`0.5px` 结构发丝线、`#f4f1ea` 暖白主操作与 `#fff3df` 暖星光灯带），以开放式双栏发丝线概览带锚定存储空间与云盘规模，配合当前页免跳转统一通行证悬浮窗（`dialog.syl-auth-modal`），登录后就地切换至开放式发丝线「网盘文件」工作台。

OWN-WORLD: 遵循 `Benchmarks' Last Exam` 深夜仪器与学术编辑部纪律——`#05060b` 深空底色配顶部稀疏星尘与克制靛蓝/暖褐星云漫射光、`0.5px` 结构发丝线（`#1c1f2a` / `#2a2e3b` / `#3a3f4f`）、暖白主字 `#f4f1ea` / 次级 `#d8d5cd` / 辅助 `#a3a7b3`、`48x48` `#f6f4ee` 暖象牙白圆角图章（内嵌 `#07080d` 与 `#ff5a3c` 双色徽标）及翡翠绿 `#3ecf8e` / `#5fd39a`、琥珀 `#ecbd55`、珊瑚红 `#ff7f70` 语义色；自托管预加载 `Google Sans Flex` 与子集化 `HarmonyOS Sans SC`（`font-display: block`），数字统一 `tabular-nums`。

STORY: 未登录访客进入首屏即见 `<h1>心创云盘</h1>`、清爽单行导语与 `#f4f1ea` 暖白主登录按钮，下方紧接开放式双栏实时容量与文件统计概览带及三项 `#f6f4ee` 图章能力名录；点击登录直接在当前页弹出同步深空风格的悬浮窗验证；已授权成员登录后自动收起访客名录，直达开放式发丝线「网盘文件」列表（搜索、新建文件夹、上传、删除、进入完整网盘），并将成员名单、空间扩展与 Agent 令牌收纳于底部折叠抽屉中。

FIRST VIEWPORT: `68px` 半透明毛玻璃吸顶导航栏（`backdrop-filter: blur(18px) saturate(1.5)` + `0.5px solid #1c1f2a` + `1px` `#fff3df` 激活星光底线），首屏 `1280px` 左对齐编辑部标头 + 双栏发丝线云盘实时概览带，无横向溢出，零页面跳转，刷新零字体抖动。
