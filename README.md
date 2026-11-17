# 心创云盘 · ShouYuLove Drive

心创组一体化共享云盘与智能 Agent 协作存储空间，采用浅色暖纸面工作台设计（左侧目录树与存储刻度尺，右侧文件区，详见 `DESIGN.md`），接入「手语分社统一通行证」（`https://shouyulove.cn/auth/`）当前页悬浮窗免跳转登录，并与服务器本地 `/srv/drive` 目录实时互通。

## 核心能力

- **一体化完整网页云盘（零二级跳转）**：
  - 访问 `https://shouyulove.cn/drive/` 直接使用完整云盘工作台，无需跳转到其他子页面。
  - 支持侧栏目录树与路径导航、文件与整个文件夹拖拽/选择上传（带上传进度与取消、同名覆盖确认）、在线新建文件夹与文档、全盘搜索（支持直达所在文件夹）、列表与宫格两种显示方式、图片/音视频/PDF/Markdown/代码在线查看与文本直接编辑保存、重命名、用文件夹选择器或拖拽完成跨目录移动、多选批量下载/移动/删除，以及纯流式 UTF-8 `.zip` 打包下载。
- **精细化分级权限（超级管理员 / 云盘管理员 / 授权成员）**：
  - 所有 Web 访问经过 `shouyulove-auth`（项目作用域 `drive`）校验，依据单向加盐哈希 `X-Shouyu-User-Phone-Hash` 判定白名单，并结合 `X-Shouyu-User-Role` 判定项目级权限（不保存任何明文手机号）。
  - **超级管理员（`191****0323`、`152****6060`）与云盘管理员**：解锁「管理与接入设置」面板（白名单增删、项目管理员授权、存储池在线无损扩容、Agent 接入令牌签发与吊销）。
  - **普通授权成员**：未额外授予超级管理员或 `drive` 项目管理员权限的成员，登录后界面没有任何管理入口，完整享有上传资料、新建/编辑文档、多级整理、在线预览与打包下载等全部网盘文件能力。
- **服务器程序与授权伙伴零门槛自由读写**：
  - 独立可扩展稀疏卷 `/var/lib/shouyulove-drive/volume.img`（当前 `100 GB`，支持在线零停机扩容）挂载于 `/srv/shouyulove-drive`，统一文件根目录为 `/srv/drive`（以及各用户主目录下的 `~/drive`、`~/projects/drive`）。
  - 目录默认 `2777`、文件默认 `0666`、服务 `UMask=0000` 并配置递归与默认 POSIX ACL（`u::rwx,g::rwx,o::rwx`）：服务器上运行的任何其他程序（无需特定用户组或额外权限）以及拥有服务器访问权限的伙伴均可直接自由读取、写入、修改和使用网盘资料。
  - 同时提供本机免密回环接口 `http://127.0.0.1:8768/drive/api/agent/{tree,search,read,write,mkdir,move,delete,zip}` 与跨机 Bearer Token 协作接口。
- **通行证当前页悬浮窗免跳转登录与零字体闪烁**：
  - 侧栏常驻展示存储空间使用情况；点击登录或切换账号均在当前页打开 `<dialog class="syl-auth-modal">` 悬浮窗完成验证，零整页跳转。
  - 构建期自动提取全站 UI 字形生成约 `60 KB` `HarmonyOS Sans SC` 预加载子集（`scripts/build-ui-fonts.py`），配合 `Google Sans Flex` 实现页面刷新零字体跳变（Zero FOUT）。

## 目录结构

- `src/`：一体化云盘 HTTP 网关、分级白名单存储、纯流式 UTF-8 ZIP 打包器（`src/zip-stream.mjs`）、Agent HTTP API 与运维 CLI (`shouyulove-drive-cli`)
- `src/web/`：浅色暖纸面风格的完整云盘前端（`index.html`、`style.css`、`app.js`）、预加载子集化字体与矢量徽标（`logo.svg`、`favicon.svg`）
- `scripts/`：UI 字形扫描与 `woff2` 字体子集自动构建脚本（`scripts/build-ui-fonts.py`）
- `deploy/`：Systemd 服务、Nginx 片段、在线扩容脚本（`shouyulove-drive-resize`）、sudoers 规则与自动化部署脚本
- `PRODUCT.md` / `DESIGN.md` / `.impeccable/`：产品定位、设计契约与设计系统规范
- `tests/`：Node 内置自动化测试套件（`npm test`）

## 本地测试

```bash
cd 心创组内部使用/心创云盘
npm test
```
