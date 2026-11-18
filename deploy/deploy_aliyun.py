#!/usr/bin/env python3
"""Deploy 心创云盘 (shouyulove-drive) and FileBrowser backend to shouyulove-aliyun."""

from __future__ import annotations

import io
import os
import shlex
import subprocess
import sys
import tarfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SSH_HOST = os.environ.get("SHOUYU_DRIVE_SSH_HOST", "shouyulove-aliyun")
REMOTE_RELEASES = "/opt/shouyulove-drive/releases"
REMOTE_CURRENT = "/opt/shouyulove-drive/current"

PACKAGE_PATHS = [
    "package.json",
    "src",
    "branding",
    "deploy",
]


def build_tarball() -> bytes:
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        for rel in PACKAGE_PATHS:
            target = ROOT / rel
            if not target.exists():
                raise FileNotFoundError(f"Missing required deploy asset: {target}")
            if target.is_file():
                tar.add(target, arcname=rel)
            else:
                for path in sorted(target.rglob("*")):
                    if "__pycache__" in path.parts or path.name == ".DS_Store":
                        continue
                    tar.add(path, arcname=path.relative_to(ROOT).as_posix(), recursive=False)
    return buf.getvalue()


def main() -> int:
    skip_tests = "--skip-test" in sys.argv[1:]
    if not skip_tests:
        print("Running local unit tests...")
        subprocess.run(["npm", "test"], cwd=ROOT, check=True)

    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    release_dir = f"{REMOTE_RELEASES}/{stamp}"
    tar_bytes = build_tarball()

    print(f"Uploading release {stamp} ({len(tar_bytes)} bytes) to {SSH_HOST}...")
    subprocess.run(
        [
            "ssh",
            SSH_HOST,
            f"mkdir -p {shlex.quote(REMOTE_RELEASES)} && mkdir {shlex.quote(release_dir)} "
            f"&& tar --no-same-owner -xzf - -C {shlex.quote(release_dir)}",
        ],
        input=tar_bytes,
        check=True,
    )

    if "--app-only" in sys.argv[1:]:
        activate = r"""set -euo pipefail
release=$1
current=$2
previous=$(readlink -e "$current")
node=/opt/shouyulove-auth/node/bin/node
chown -hR root:shouyulove-drive -- "$release"
diff -qr "$previous/branding" "$release/branding"
diff -qr -x deploy_aliyun.py "$previous/deploy" "$release/deploy"
cmp "$previous/package.json" "$release/package.json"
for file in "$release"/src/*.mjs; do "$node" --check "$file"; done
switch_release() {
  ln -s "$1" "$current.next.$$"
  mv -Tf "$current.next.$$" "$current"
}
rollback() {
  switch_release "$previous"
  systemctl restart shouyulove-drive.service
}
trap rollback EXIT
switch_release "$release"
systemctl restart shouyulove-drive.service
curl -fsS --retry 12 --retry-delay 1 --retry-connrefused --max-time 3 \
  http://127.0.0.1:8768/drive/healthz | python3 -c 'import json,sys; sys.exit(json.load(sys.stdin).get("ok") is not True)'
trap - EXIT
"""
        subprocess.run(["ssh", SSH_HOST, "flock /run/lock/shouyulove-drive-deploy.lock bash -s -- "
                        + shlex.join([release_dir, REMOTE_CURRENT])], input=activate.encode(), check=True)
        print(f"DEPLOY_OK:{stamp}")
        return 0

    remote_script = f"""set -euo pipefail
RELEASE_DIR={shlex.quote(release_dir)}
CURRENT_LINK={shlex.quote(REMOTE_CURRENT)}
BIN_FB="/opt/shouyulove-drive/bin/filebrowser"
NODE_BIN="/opt/shouyulove-auth/node/bin/node"
STATE_DIR="/var/lib/shouyulove-drive"
MNT="/srv/shouyulove-drive"
FILES_ROOT="$MNT/files"
IMG="$STATE_DIR/volume.img"
FB_DB="$STATE_DIR/filebrowser.db"

if [ ! -x "$BIN_FB" ]; then
  echo "ERROR: FileBrowser binary missing at $BIN_FB" >&2
  exit 1
fi
if [ ! -x "$NODE_BIN" ]; then
  echo "ERROR: Node runtime missing at $NODE_BIN" >&2
  exit 1
fi

if ! command -v setfacl >/dev/null 2>&1; then
  DEBIAN_FRONTEND=noninteractive apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq acl
fi

# System group & service user
if ! getent group shouyulove-drive >/dev/null 2>&1; then
  groupadd --system shouyulove-drive
fi
if ! id shouyulove-drive >/dev/null 2>&1; then
  useradd --system --gid shouyulove-drive --home-dir /opt/shouyulove-drive --shell /usr/sbin/nologin shouyulove-drive
fi

for u in root $(awk -F: '$3 >= 1000 && $3 < 65534 {{print $1}}' /etc/passwd); do
  if id "$u" >/dev/null 2>&1; then
    usermod -aG shouyulove-drive "$u" || true
  fi
done

# Ensure shared Node runtime parent is traversable by shouyulove-drive
chmod o+rx /opt/shouyulove-auth /opt/shouyulove-drive /opt/shouyulove-drive/bin "$RELEASE_DIR" || true
chown -R root:shouyulove-drive "$RELEASE_DIR"
chmod -R a+rX "$RELEASE_DIR"

mkdir -p "$STATE_DIR" "$MNT"
chown shouyulove-drive:shouyulove-drive "$STATE_DIR"
chmod 0700 "$STATE_DIR"
chmod 0755 /srv "$MNT"

# Provision 100 GB sparse expandable ext4 volume if absent
if [ ! -f "$IMG" ]; then
  truncate -s 100G "$IMG"
  mkfs.ext4 -F -m 0 -L xinchuang-drive "$IMG" >/dev/null
  chown root:root "$IMG"
  chmod 0600 "$IMG"
fi

FSTAB_LINE="$IMG $MNT ext4 loop,discard,nofail 0 2"
if ! grep -Fqx "$FSTAB_LINE" /etc/fstab; then
  printf '%s\\n' "$FSTAB_LINE" >> /etc/fstab
fi

if ! mountpoint -q "$MNT"; then
  mount "$MNT"
fi
chmod 0755 "$MNT"

mkdir -p "$FILES_ROOT"
chown shouyulove-drive:shouyulove-drive "$FILES_ROOT"
chmod 2777 "$FILES_ROOT"

# Grant open read/write/traverse permissions & default POSIX ACLs inside /srv/drive
# so ALL local programs and authorized server users can freely read, write, and manage shared files.
find "$FILES_ROOT" -mindepth 1 -name 'lost+found' -prune -o -type d -exec chmod 2777 {{}} +
find "$FILES_ROOT" -mindepth 1 -name 'lost+found' -prune -o -type f -exec chmod 0666 {{}} +
setfacl -R -m u::rwx,g::rwx,g:shouyulove-drive:rwx,o::rwx "$FILES_ROOT" || true
find "$FILES_ROOT" -name 'lost+found' -prune -o -type d -exec setfacl -d -m u::rwx,g::rwx,g:shouyulove-drive:rwx,o::rwx {{}} + || true

ln -sfn "$FILES_ROOT" /srv/drive
for huser in $(awk -F: '$3 >= 1000 && $3 < 65534 {{print $1}}' /etc/passwd); do
  if [ -d "/home/$huser" ]; then
    ln -sfn "$FILES_ROOT" "/home/$huser/drive"
    chown -h "$huser:$huser" "/home/$huser/drive" || true
  fi
  if [ -d "/home/$huser/projects" ]; then
    ln -sfn "$FILES_ROOT" "/home/$huser/projects/drive"
    chown -h "$huser:$huser" "/home/$huser/projects/drive" || true
  fi
done

README_PATH="$FILES_ROOT/README-心创云盘使用说明.md"
if [ ! -f "$README_PATH" ]; then
  cat <<'EOF' > "$README_PATH"
# 心创云盘（共享存储池）

- 服务器共享路径：`/srv/drive`（或 `~/drive`）
- 网页端完整入口：https://shouyulove.cn/drive/
- 服务器上拥有权限的成员与本机任意程序均可直接免权限自由读写本目录下的全部文件；远程 Agent 可通过 `/drive/api/agent/*` 接口协同操作。
EOF
  chown shouyulove-drive:shouyulove-drive "$README_PATH"
  chmod 0666 "$README_PATH"
fi

ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

# Install privileged resize helper, sudoers rule, and CLI wrapper
install -m 0755 -o root -g root "$CURRENT_LINK/deploy/shouyulove-drive-resize" /usr/local/sbin/shouyulove-drive-resize
install -m 0440 -o root -g root "$CURRENT_LINK/deploy/sudoers-shouyulove-drive" /etc/sudoers.d/shouyulove-drive
visudo -cf /etc/sudoers.d/shouyulove-drive >/dev/null

cat <<'EOF' > /usr/local/bin/shouyulove-drive-cli
#!/usr/bin/env bash
set -euo pipefail
export DRIVE_STATE_DIR=/var/lib/shouyulove-drive
export DRIVE_STORAGE_ROOT=/srv/shouyulove-drive/files
export DRIVE_RESIZE_CMD=/usr/local/sbin/shouyulove-drive-resize
if [ "$(id -u)" -eq 0 ] && [ "${{1:-}}" != "resize" ]; then
  exec runuser -u shouyulove-drive -- /opt/shouyulove-auth/node/bin/node /opt/shouyulove-drive/current/src/cli.mjs "$@"
fi
exec /opt/shouyulove-auth/node/bin/node /opt/shouyulove-drive/current/src/cli.mjs "$@"
EOF
chmod 0755 /usr/local/bin/shouyulove-drive-cli

# Ensure existing state.json keeps service ownership before verifying via service user
if [ -f "$STATE_DIR/state.json" ]; then
  chown shouyulove-drive:shouyulove-drive "$STATE_DIR/state.json"
  chmod 0600 "$STATE_DIR/state.json"
fi
su -s /bin/bash shouyulove-drive -c "DRIVE_STATE_DIR=$STATE_DIR DRIVE_STORAGE_ROOT=$FILES_ROOT $NODE_BIN $CURRENT_LINK/src/cli.mjs status >/dev/null"
chown shouyulove-drive:shouyulove-drive "$STATE_DIR/state.json"
chmod 0600 "$STATE_DIR/state.json"

# Stop FileBrowser while updating its BoltDB config cleanly
systemctl stop shouyulove-drive-fb.service >/dev/null 2>&1 || true

FB_NEW=0
if [ ! -f "$FB_DB" ]; then
  FB_NEW=1
  "$BIN_FB" config init --database "$FB_DB" >/dev/null
fi

"$BIN_FB" config set \\
  --database "$FB_DB" \\
  --address 127.0.0.1 \\
  --port 8769 \\
  --root "$FILES_ROOT" \\
  --baseURL /drive/files \\
  --auth.method proxy \\
  --auth.header X-FBrowser-User \\
  --auth.logoutPage /drive/ \\
  --branding.files "$CURRENT_LINK/branding" \\
  --branding.name "心创云盘 · ShouYuLove Drive" \\
  --branding.disableExternal \\
  --branding.color "#05060b" \\
  --disableExec \\
  --locale zh-cn \\
  --dirMode 0o2777 \\
  --fileMode 0o666 \\
  --signup=false >/dev/null

if [ "$FB_NEW" -eq 1 ]; then
  RAND_PW=$(od -An -tx1 -N24 /dev/urandom | tr -d ' \\n')
  "$BIN_FB" users add shouyulove "$RAND_PW" \\
    --database "$FB_DB" \\
    --lockPassword \\
    --perm.admin=false \\
    --perm.execute=false \\
    --perm.share=false \\
    --locale zh-cn \\
    --scope . >/dev/null
fi

chown shouyulove-drive:shouyulove-drive "$FB_DB"
chmod 0600 "$FB_DB"

# Install systemd units and launch services
install -m 0644 -o root -g root "$CURRENT_LINK/deploy/shouyulove-drive-fb.service" /etc/systemd/system/shouyulove-drive-fb.service
install -m 0644 -o root -g root "$CURRENT_LINK/deploy/shouyulove-drive.service" /etc/systemd/system/shouyulove-drive.service
systemctl daemon-reload
systemctl enable shouyulove-drive-fb.service shouyulove-drive.service >/dev/null
systemctl restart shouyulove-drive-fb.service shouyulove-drive.service

# Wait for HTTP listeners
for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:8768/healthz >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
done
curl -fsS http://127.0.0.1:8768/healthz >/dev/null

# Install Nginx snippet and include inside shouyulove server block under shared deploy lock
install -m 0644 -o root -g root "$CURRENT_LINK/deploy/nginx-shouyulove-drive.conf" /etc/nginx/snippets/shouyulove-drive.conf
(
  flock -w 30 9
  SITE_CONF="/etc/nginx/sites-available/shouyulove"
  BACKUP_CONF="/tmp/shouyulove.nginx.bak.{stamp}"
  cp -a "$SITE_CONF" "$BACKUP_CONF"
  if ! grep -Fq "snippets/shouyulove-drive.conf" "$SITE_CONF"; then
    python3 - <<'PYEDIT'
from pathlib import Path
conf_path = Path('/etc/nginx/sites-available/shouyulove')
text = conf_path.read_text('utf-8')
anchor = 'include /etc/nginx/snippets/shouyulove-auth.conf;'
if anchor not in text:
    raise SystemExit('Anchor include /etc/nginx/snippets/shouyulove-auth.conf; not found')
text = text.replace(anchor, anchor + '\\n    include /etc/nginx/snippets/shouyulove-drive.conf;', 1)
conf_path.write_text(text, 'utf-8')
PYEDIT
  fi
  if ! nginx -t >/dev/null 2>&1; then
    cp -a "$BACKUP_CONF" "$SITE_CONF"
    nginx -t
    exit 1
  fi
  rm -f "$BACKUP_CONF"
  systemctl reload nginx
) 9>/run/lock/nginx-deploy.lock

# Prune old releases keeping latest 5
ls -1dt {REMOTE_RELEASES}/* 2>/dev/null | tail -n +6 | xargs -r rm -rf

echo "DEPLOY_OK:{stamp}"
"""

    print("Provisioning & restarting services on shouyulove-aliyun...")
    subprocess.run(["ssh", SSH_HOST, "flock /run/lock/shouyulove-drive-deploy.lock bash -s"],
                   input=remote_script.encode("utf-8"), check=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
