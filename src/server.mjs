import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join } from 'node:path';
import { DriveStore, DriveError } from './drive-store.mjs';
import { createDriveHttpHandler } from './http-app.mjs';

const execFileAsync = promisify(execFile);

const stateDir = process.env.DRIVE_STATE_DIR || '/var/lib/shouyulove-drive';
const storageRoot = process.env.DRIVE_STORAGE_ROOT || '/srv/shouyulove-drive/files';
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 8768);
const filebrowserTarget = process.env.FILEBROWSER_TARGET || 'http://127.0.0.1:8769';
const resizeScript = process.env.DRIVE_RESIZE_CMD || '/usr/local/sbin/shouyulove-drive-resize';
const devMode = process.env.DRIVE_DEV_MODE === '1';
const allowedOrigins = (process.env.DRIVE_ALLOWED_ORIGINS || 'https://shouyulove.cn,https://www.shouyulove.cn')
  .split(',')
  .map(item => item.trim())
  .filter(Boolean);

const store = new DriveStore({
  statePath: join(stateDir, 'state.json'),
  storageRoot,
});

async function resizeVolume(targetGb) {
  const cmd = process.getuid && process.getuid() === 0 ? resizeScript : 'sudo';
  const args = process.getuid && process.getuid() === 0 ? [String(targetGb)] : ['-n', resizeScript, String(targetGb)];
  try {
    const { stdout } = await execFileAsync(cmd, args, { timeout: 60_000 });
    return stdout.trim();
  } catch (err) {
    const detail = String(err?.stderr || err?.stdout || err?.message || '在线扩容执行失败').trim();
    throw new DriveError('RESIZE_FAILED', detail, 400);
  }
}

const handler = createDriveHttpHandler({
  store,
  filebrowserTarget,
  allowedOrigins,
  resizeVolume,
  devMode,
});

const server = createServer(handler);
server.requestTimeout = 0;
server.headersTimeout = 60_000;

server.listen(port, host, () => {
  console.log(`shouyulove-drive listening on http://${host}:${port}`);
});
