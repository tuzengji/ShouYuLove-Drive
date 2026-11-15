# 心创云盘

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

心创组内部成员与授权开发者/研究者（网页端面向已列入成员名单的手机号账号，初始内置全站超级管理员 `191****0323` 与 `152****6060`）；具备阿里云服务器 `shouyulove-aliyun` SSH 权限的成员及自动化 Agent 共用同一套底层存储池。

## Product Purpose

为北京大学学生爱心社手语分社心创组提供内部共享云盘与 Agent 协作存储空间，打通浏览器可视化文件管理与自动化读写，让成员上传整理与 Agent 产出于同一份存储卷内实时同步、按需扩容。

## Positioning

前置「手语分社统一通行证」单向哈希白名单与分级权限网关，挂载独立可在线无损扩容的稀疏 `ext4` 存储卷（`60 – 500 GB`，当前 `100 GB`），并在 `https://shouyulove.cn/drive/` 单页内直接交付完整云盘工作台（多级目录、拖拽上传文件与文件夹、在线预览与编辑、重命名移动、流式 ZIP 打包下载），彻底消除「进入完整网盘」二级页面跳转；同时使浏览器 `/drive/`、服务器开放共享目录 `/srv/drive`（`2777` / `0666` + 默认 POSIX ACL，服务器任意本地程序与授权 SSH 伙伴免权限阻碍直接使用）与 Agent HTTP 接口 `/drive/api/agent/*` 共享同一份文件空间。

## Operating Context

- 正式线上入口：`https://shouyulove.cn/drive/`（复刻 `Benchmarks' Last Exam` 深夜星轨编辑部暗黑视觉的一体化完整云盘工作台，旧 `/drive/files/` 路由自动归并跳转回 `/drive/`）。
- 站点导航来源：已接入以手予爱主站首页、`/portfolio/`「心创组内部使用」分区与 `/projects/xinchuang-drive/`。
- 底层协同通道：
  1. 网页端一体化云盘：经手语分社统一通行证悬浮窗认证与成员名单放行后直接在当前页完成全功能文件存取、在线预览编辑与打包下载。
  2. 服务器本地零门槛直读直写：服务器上运行的任意其他程序与具备服务器权限的伙伴可直接自由读写 `/srv/drive`（软链自 `/srv/shouyulove-drive/files`，`2777`/`0666` + 默认 ACL `o::rwx`）。
  3. Agent HTTP 接口：本机免密回环 `http://127.0.0.1:8768/drive/api/agent/*` 与跨机 Bearer Token 接口 `https://shouyulove.cn/drive/api/agent/*`。
- 底层稀疏存储卷：`/var/lib/shouyulove-drive/volume.img` 支持 `60 – 500 GB` 整数在线扩容（仅超级管理员与心创云盘项目管理员可见与操作）。

## Capabilities and Constraints

- 依据会话与分级权限状态自动切换视图，且**首页常驻展示双卡片云盘实时看板（存储空间已用/剩余/总容量进度与文件、文件夹统计）**，同时**全流程采用统一通行证当前页悬浮窗（`ShouyuAuth.openModal`）完成登录、自动注册、切换账号与退出，零整页跳转**：
  - 未登录访客视图：左右编排首屏、双卡片云盘实时看板（不暴露私有文件名）与三列功能卡片；点击「使用统一通行证登录」或顶栏「登录」直接在当前页面弹出悬浮窗登录。
  - 未开通权限视图：炭黑结构提示面板与当前页悬浮窗「切换其他账号」按钮。
  - 已授权普通成员视图：自动收起访客功能卡片，直接进入完整心创云盘（面包屑多级导航、上传文件/文件夹、新建文件夹/文档、全局搜索、排序、多选批量打包/删除、在线预览与编辑），**完全隐藏且接口不返回**「管理与接入设置」抽屉及「扩展容量」按钮；若未在通行证或云盘名单中被额外指定为管理员，权限即与普通成员一致。
  - 超级管理员（`191****0323`、`152****6060`）与云盘项目管理员视图：在完整网盘能力基础上，额外解锁容量看板「扩展容量」快捷入口与底部折叠式「管理与接入设置 · 成员名单 · 空间扩展 · Agent 接入令牌」管理面板，并可按项目隔离方式管理成员与云盘管理员角色（超级管理员身份受保护）。
- 隐私与安全红线：后端与页面均不存储、不回显明文手机号（仅核验单向 SHA-256 摘要 `X-Shouyu-User-Phone-Hash` 与展示脱敏尾号）；Agent Bearer Token 仅在生成当次展示明文，持久化仅保留哈希与前缀。
- 技术约束：Node.js 24 原生 HTTP 服务与静态原生 HTML/CSS/JS，全站静态资源（含兜底字体与 SVG）自托管并受严格 CSP（`default-src 'self'; style-src 'self'; font-src 'self'`）约束，不得引入外部 CDN；保留既有 `/api/*` 与 `/auth/` 接口契约。

## Brand Commitments

- 名称为「心创云盘」，归属以手予爱（ShouYuLove）心创组内部使用系列，设计者：涂增基；定制深空云盘矢量徽标（`logo.svg` / `favicon.svg`，`#f4f1ea` 暖白云轨括号配 `#ff5a3c` 朱砂橙刻度与爱心）。
- 视觉规范复刻 **`Benchmarks' Last Exam`（`https://benchmarks-last-exam.com/zh/benchmarks/`）深夜星轨编辑部暗黑设计体系**：
  - 页面主底色为深空夜色 `#05060b`（顶部配稀疏星尘与克制靛蓝 `#222e68` / 暖褐 `#62361c` 星云漫射光），采用黑曜石层级表面（`#0b0d14` -> `#0e1119` -> `#10131c` -> `#151924` -> `#222838`）、`0.5px` 结构发丝线（`#1c1f2a` / `#2a2e3b` / `#3a3f4f`）、暖白主字 `#f4f1ea`、次级 `#d8d5cd`、中性灰 `#a3a7b3`，主操作实心按钮采用 `#f4f1ea` 暖白底配 `#07080d` 深墨字（悬停暖星光 `#fff3df`），辅以 `#3ecf8e` / `#5fd39a` / `#ecbd55` / `#ff7f70` 语义色与 `#f6f4ee` 暖象牙白圆角图章（`48x48`，`13px` 圆角）。
  - 吸顶导航栏 `.topbar` 采用 `68px` 半透明毛玻璃（`backdrop-filter: blur(18px) saturate(1.5)` + `color-mix(in srgb, #05060b 82%, transparent)`）与 `0.5px` `#1c1f2a` 底边线，激活项底部以 `1px` `#fff3df` 暖星光灯带标记。
  - 字体体系采用自托管 `Google Sans Flex` 与 `HarmonyOS Sans SC`（提取全量 UI 字符生成约 `50 KB` 极小子集 `hos-ui-{regular,medium,bold}.woff2` 并在 `<head>` 预加载 + `font-display: block` + 精确 `100 499 / 500 599 / 600 1000` 字重区间，彻底消除刷新时的字体闪烁切换），Apple `SF Pro` / `PingFang SC` 兜底，代码采用 `SF Mono` / `JetBrains Mono`；桌面端与 `390px` 手机辅助控件及按钮字号 `>= 15px`、`<= 380px` 超窄屏底线 `>= 14px`。
  - 坚持详略得当与去目录术语：首页上方以双栏发丝线概览带直观呈现云盘存储空间使用进度（已用空间、剩余可用、总容量）与文件/文件夹规模（不堆砌 `/srv/drive`、`ext4`、`SHA-256` 等运维术语），并服务端直注首屏状态避免刷新跳动；统一通行证登录与切换账号一律在当前页悬浮窗内完成，绝不跳离当前页；登录后收起介绍区直接展示「网盘文件」，低频管理项默认折叠按需展开。
  - 统一通行证深色悬浮窗（`modal.css` / `auth-modal.css`）与内部 FileBrowser 文件工作台（`/drive/files/`，`branding/custom.css`）同步对齐 `#05060b` / `#0b0d14` / `#10131c` / `#f4f1ea` / `#fff3df` 设计令牌。

## Evidence on Hand

- 门户前端源码 `src/web/{index.html,style.css,app.js,logo.svg,favicon.svg}` 与 FileBrowser 主题 `branding/custom.css`。
- 服务与接口层 `src/{http-app.mjs,drive-store.mjs,server.mjs,cli.mjs}` 及单元测试 `tests/drive.test.mjs`。
- 实时空间配额与根目录条目直接来自 `/drive/api/state`。

## Product Principles

- 直观易懂、详略得当：公开页面去掉容量数字与路径术语，用最自然的语言讲清网盘用途；高频文件管理置于前景，低频配置折叠收纳。
- 任务优先的克制：Operate 模式聚焦浏览、搜索、建目录、上传与进入完整 FileBrowser，操作状态就地反馈不打断。
- 一致与防错：门户与 FileBrowser 共用统一深空暗夜星轨视觉体系；移除成员前禁止自删，扩容校验整数范围，删除前二次确认。

## Accessibility & Inclusion

- 覆盖桌面端与移动端（包括 `380px` / `320px` 超窄屏），所有状态零横向溢出（`scrollWidth <= innerWidth`）。
- 文本与占位提示对比度满足 ≥ `4.5:1`，全站保持 ≥ `14px` 最小可读字号，支持键盘完整导航、`focus-visible` 焦点环、`role="alert"` 实时通知及 `prefers-reduced-motion: reduce` 动效减弱偏好。
