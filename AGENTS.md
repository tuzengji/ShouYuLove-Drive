# 心创云盘（`shouyulove-drive`）维护指引

## 基本定位

- 项目位置：`心创组内部使用/心创云盘`
- 线上入口：`https://shouyulove.cn/drive/`（一体化完整心创云盘，不再跳转二级页面；旧 `/drive/files/` 浏览器访问自动归并回 `/drive/` 对应子目录）
- 认证与分级权限：
  - 复用同域「手语分社统一通行证」（`shouyulove-auth` Nginx `auth_request` 与 `X-Shouyu-User-Phone-Hash` 校验），全流程在当前页面悬浮窗（`ShouyuAuth.openModal()`）内完成登录、自动注册、切换账号与退出，零整页跳转。
  - **分级权限（RBAC）**：仅唯一管理员账号（`191****0323`，按单向加盐 SHA-256 哈希比对）拥有管理员权限，可见并调用「管理与接入设置」（成员名单、空间在线扩容、Agent 接入令牌）；其余白名单成员（如 `152****6060` 等）完全不可见该管理区域及接口返回的管理字段，但拥有完整的网盘文件操作权限（多级目录浏览、拖拽上传文件与文件夹、在线新建目录/文档、图片/音视频/PDF/代码/Markdown 在线预览与编辑、重命名/跨目录移动、单文件与 `.zip` 批量打包下载、删除）。
- 服务器与本地程序零门槛共享：所有授权网页成员、具备服务器登录权限的伙伴及服务器上运行的任意程序**共用同一份独立 100 GB 存储池**（挂载于 `/srv/shouyulove-drive`，共享目录 `/srv/shouyulove-drive/files`，便捷软链 `/srv/drive` 与 `~/drive`），采用 `2777` 目录 + `0666` 文件 + `UMask=0000` + 默认 POSIX ACL（`other::rwx`），服务器上的任意进程与授权 SSH 用户无需额外权限配置即可直接自由读写。

## 服务器部署边界

- 维护主机：SSH 别名 `shouyulove-aliyun`
- 代码发布目录：`/opt/shouyulove-drive/releases/<timestamp>` → `/opt/shouyulove-drive/current`
- FileBrowser 兼容底座二进制：`/opt/shouyulove-drive/bin/filebrowser`（Upstream `filebrowser/filebrowser v2.63.23`）
- 数据与镜像路径：
  - 独立可扩展稀疏镜像：`/var/lib/shouyulove-drive/volume.img`（当前扩展至 `100G` ext4 精简配置，仅按实际写入占用宿主机空间）
  - 挂载点与真实文件根目录：`/srv/shouyulove-drive`（文件目录 `/srv/shouyulove-drive/files`，软链 `/srv/drive`、`/home/*/drive`、`/home/*/projects/drive`）
  - 状态与密钥库：`/var/lib/shouyulove-drive/state.json`（仅存手机号 SHA-256 哈希、脱敏后缀、Agent Token SHA-256 哈希；禁止存入明文手机号）
  - FileBrowser 配置库：`/var/lib/shouyulove-drive/filebrowser.db`
- 系统服务（均归属 `system-shouyulove.slice`，`UMask=0000`）：
  - `shouyulove-drive.service`（Node 24 一体化云盘 Web 工作台、分级权限网关、流式 ZIP 与 Agent API，监听 `127.0.0.1:8768`）
  - `shouyulove-drive-fb.service`（底层兼容后端，监听 `127.0.0.1:8769`，仅接受 `127.0.0.1:8768` 受控调用）

## 操作与安全约束

1. 修改本机代码后，需先运行 `npm test` 通过全部单元测试，再使用 `python3 deploy/deploy_aliyun.py` 发布。
2. 在线扩容仅支持增大容量（`truncate` + `losetup -c` + `resize2fs`，无需卸载、业务零中断）；若需缩容，必须由管理员短暂停止 `shouyulove-drive-fb` 后卸载执行离线缩容。
3. 操作 Nginx 时必须持锁 `/run/lock/nginx-deploy.lock`，不得删除其他站点配置，不得在浏览器端或公共页面暴露真实白名单手机号明文或 Agent 明文 Token。
4. 不得将 `/var/lib/shouyulove-drive/`、`/srv/shouyulove-drive/` 下的私人/内部资料提交进本仓库。
