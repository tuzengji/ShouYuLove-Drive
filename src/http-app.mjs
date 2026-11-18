import {
  createReadStream,
  readFileSync,
  statSync,
  chmodSync,
  renameSync,
  unlinkSync,
} from 'node:fs';
import { open } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { request as httpRequest } from 'node:http';
import { createHash, randomBytes } from 'node:crypto';
import { basename, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DriveError,
  OPEN_FILE_MODE,
  ensureSharedDirectoryChain,
  resolveSafeStoragePath,
} from './drive-store.mjs';
import { streamZipArchive } from './zip-stream.mjs';

const ROOT_DIR = dirname(dirname(fileURLToPath(import.meta.url)));
const WEB_DIR = join(ROOT_DIR, 'src', 'web');

const STATIC_ASSETS = {
  '/': { file: 'index.html', type: 'text/html; charset=utf-8', cache: 'private, no-store' },
  '/index.html': { file: 'index.html', type: 'text/html; charset=utf-8', cache: 'private, no-store' },
  '/style.css': { file: 'style.css', type: 'text/css; charset=utf-8', cache: 'public, max-age=300' },
  '/app.js': { file: 'app.js', type: 'application/javascript; charset=utf-8', cache: 'public, max-age=300' },
  '/auth-modal.css': { file: 'auth-modal.css', type: 'text/css; charset=utf-8', cache: 'public, max-age=300' },
  '/auth-sdk.js': { file: 'auth-sdk.js', type: 'application/javascript; charset=utf-8', cache: 'public, max-age=300' },
  '/logo.svg': { file: 'logo.svg', type: 'image/svg+xml', cache: 'public, max-age=86400' },
  '/favicon.svg': { file: 'favicon.svg', type: 'image/svg+xml', cache: 'public, max-age=86400' },
  '/google-sans-flex-latin.woff2': { file: 'google-sans-flex-latin.woff2', type: 'font/woff2', cache: 'public, max-age=31536000, immutable' },
  '/google-sans-flex-latin-ext.woff2': { file: 'google-sans-flex-latin-ext.woff2', type: 'font/woff2', cache: 'public, max-age=31536000, immutable' },
  '/hos-ui-regular.woff2': { file: 'hos-ui-regular.woff2', type: 'font/woff2', cache: 'public, max-age=31536000, immutable' },
  '/hos-ui-medium.woff2': { file: 'hos-ui-medium.woff2', type: 'font/woff2', cache: 'public, max-age=31536000, immutable' },
  '/hos-ui-bold.woff2': { file: 'hos-ui-bold.woff2', type: 'font/woff2', cache: 'public, max-age=31536000, immutable' },
  '/hos-regular.woff2': { file: 'hos-regular.woff2', type: 'font/woff2', cache: 'public, max-age=31536000, immutable' },
  '/hos-medium.woff2': { file: 'hos-medium.woff2', type: 'font/woff2', cache: 'public, max-age=31536000, immutable' },
  '/hos-bold.woff2': { file: 'hos-bold.woff2', type: 'font/woff2', cache: 'public, max-age=31536000, immutable' },
  '/shouyu-serif.woff2': { file: 'shouyu-serif.woff2', type: 'font/woff2', cache: 'public, max-age=31536000, immutable' },
};

// 这些文件的内容共同决定页面里的 ?v= 版本号，发布新版后浏览器不会继续使用缓存里的旧文件
const VERSIONED_ASSETS = [
  'style.css',
  'app.js',
  'logo.svg',
  'favicon.svg',
  'hos-ui-regular.woff2',
  'hos-ui-medium.woff2',
  'hos-ui-bold.woff2',
];

const MIME_BY_EXT = {
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.markdown': 'text/markdown; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jsonl': 'application/x-ndjson; charset=utf-8',
  '.yaml': 'text/plain; charset=utf-8',
  '.yml': 'text/plain; charset=utf-8',
  '.toml': 'text/plain; charset=utf-8',
  '.ini': 'text/plain; charset=utf-8',
  '.conf': 'text/plain; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.tsv': 'text/tab-separated-values; charset=utf-8',
  '.log': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8',
  '.ts': 'text/plain; charset=utf-8',
  '.tsx': 'text/plain; charset=utf-8',
  '.jsx': 'text/plain; charset=utf-8',
  '.py': 'text/plain; charset=utf-8',
  '.sh': 'text/plain; charset=utf-8',
  '.bash': 'text/plain; charset=utf-8',
  '.zsh': 'text/plain; charset=utf-8',
  '.sql': 'text/plain; charset=utf-8',
  '.c': 'text/plain; charset=utf-8',
  '.cpp': 'text/plain; charset=utf-8',
  '.h': 'text/plain; charset=utf-8',
  '.hpp': 'text/plain; charset=utf-8',
  '.rs': 'text/plain; charset=utf-8',
  '.go': 'text/plain; charset=utf-8',
  '.java': 'text/plain; charset=utf-8',
  '.tex': 'text/plain; charset=utf-8',
  '.bib': 'text/plain; charset=utf-8',
  '.html': 'text/plain; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.tar': 'application/x-tar',
  '.gz': 'application/gzip',
  '.tgz': 'application/gzip',
  '.7z': 'application/x-7z-compressed',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.m4v': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
  '.flac': 'audio/flac',
};

const CSP_HEADER =
  "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; frame-src 'self'; connect-src 'self'; font-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'";

function escapeHtmlAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildContentDisposition(dispositionType, filename) {
  const safeName = String(filename || 'download').replace(/[\r\n"]/g, '_');
  const asciiFallback = safeName.replace(/[^\x20-\x7E]/g, '_') || 'download';
  const encoded = encodeURIComponent(safeName).replace(/['()*]/g, ch => '%' + ch.charCodeAt(0).toString(16).toUpperCase());
  return `${dispositionType}; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}

function parseByteRange(rangeHeader, fileSize) {
  if (typeof rangeHeader !== 'string' || !rangeHeader.startsWith('bytes=') || fileSize <= 0) {
    return null;
  }
  const spec = rangeHeader.slice(6).split(',')[0].trim();
  const dash = spec.indexOf('-');
  if (dash < 0) return null;
  const startRaw = spec.slice(0, dash).trim();
  const endRaw = spec.slice(dash + 1).trim();

  let start;
  let end;
  if (startRaw === '') {
    const suffixLen = Number(endRaw);
    if (!Number.isInteger(suffixLen) || suffixLen <= 0) return null;
    start = Math.max(0, fileSize - suffixLen);
    end = fileSize - 1;
  } else {
    start = Number(startRaw);
    end = endRaw === '' ? fileSize - 1 : Number(endRaw);
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || start > end) {
      return null;
    }
    if (start >= fileSize) {
      return { unsatisfiable: true };
    }
    end = Math.min(end, fileSize - 1);
  }
  return { start, end };
}

function sendJson(res, status, payload, { cache = 'private, no-store' } = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': cache,
    'Vary': 'Cookie, Authorization, Origin',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(JSON.stringify(payload));
}

function parseBearerToken(authHeader) {
  if (typeof authHeader !== 'string') return null;
  const match = /^Bearer\s+([A-Za-z0-9._~+/-]+=*)$/i.exec(authHeader.trim());
  return match ? match[1] : null;
}

async function readBodyBytes(req, maxBytes = 65536) {
  const declared = Number(req.headers['content-length'] || 0);
  if (declared > maxBytes) {
    throw new DriveError('PAYLOAD_TOO_LARGE', '请求体超出限制。', 413);
  }
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > maxBytes) {
      throw new DriveError('PAYLOAD_TOO_LARGE', '请求体超出限制。', 413);
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function readJsonBody(req, maxBytes = 65536) {
  const contentType = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  if (contentType && contentType !== 'application/json') {
    throw new DriveError('INVALID_REQUEST', '请使用 application/json 格式提交请求。', 415);
  }
  const bytes = await readBodyBytes(req, maxBytes);
  if (bytes.length === 0) return {};
  try {
    const parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('NOT_OBJECT');
    }
    return parsed;
  } catch {
    throw new DriveError('INVALID_REQUEST', 'JSON 请求体解析失败。', 400);
  }
}

async function streamBodyToFile(req, realRoot, absTarget, maxBytes) {
  ensureSharedDirectoryChain(realRoot, dirname(absTarget));
  const tmp = join(dirname(absTarget), `.drive-write-${randomBytes(12).toString('hex')}.tmp`);
  let total = 0;
  const declared = Number(req.headers['content-length'] || 0);
  if (maxBytes && declared > maxBytes) {
    throw new DriveError('PAYLOAD_TOO_LARGE', '上传文件过大。', 413);
  }
  async function* checkedChunks() {
    for await (const chunk of req) {
      total += chunk.length;
      if (maxBytes && total > maxBytes) {
        throw new DriveError('PAYLOAD_TOO_LARGE', '上传文件过大。', 413);
      }
      yield chunk;
    }
  }
  const file = await open(tmp, 'wx', OPEN_FILE_MODE);
  try {
    try {
      await file.writeFile(checkedChunks());
    } finally {
      await file.close();
    }
    try {
      chmodSync(tmp, OPEN_FILE_MODE);
    } catch {
      // Ignore chmod when non-owner.
    }
    renameSync(tmp, absTarget);
    const st = statSync(absTarget);
    return { size: st.size, mtimeMs: Math.round(st.mtimeMs) };
  } catch (error) {
    try {
      unlinkSync(tmp);
    } catch {
      // Ignore missing temp file
    }
    throw error;
  }
}

function isLoopbackAddress(remoteAddress) {
  const addr = String(remoteAddress || '').trim();
  return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1';
}

function isBrowserHtmlRequest(req) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return false;
  const accept = String(req.headers['accept'] || '').toLowerCase();
  const dest = String(req.headers['sec-fetch-dest'] || '').toLowerCase();
  return dest === 'document' || accept.includes('text/html');
}

export function createDriveHttpHandler({
  store,
  filebrowserTarget = 'http://127.0.0.1:8769',
  filebrowserUser = 'shouyulove',
  allowedOrigins = ['https://shouyulove.cn', 'https://www.shouyulove.cn'],
  resizeVolume,
  maxAgentWriteBytes = 20 * 1024 * 1024 * 1024,
  devMode = false,
}) {
  const assetCache = new Map();
  const readAsset = filename => {
    if (!devMode && assetCache.has(filename)) return assetCache.get(filename);
    const content = readFileSync(join(WEB_DIR, filename));
    if (!devMode) assetCache.set(filename, content);
    return content;
  };

  let cachedAssetVersion = '';
  const getAssetVersion = () => {
    if (!devMode && cachedAssetVersion) return cachedAssetVersion;
    const hash = createHash('sha1');
    for (const name of VERSIONED_ASSETS) hash.update(readAsset(name));
    cachedAssetVersion = hash.digest('hex').slice(0, 10);
    return cachedAssetVersion;
  };

  const upstreamBase = new URL(filebrowserTarget);

  function verifySameOrigin(req) {
    if (req.method === 'GET' || req.method === 'HEAD') return true;
    const fetchSite = req.headers['sec-fetch-site'];
    if (fetchSite === 'cross-site') return false;
    const origin = req.headers['origin'];
    if (devMode && origin) return true;
    if (!origin) return false;
    return allowedOrigins.includes(origin);
  }

  function resolveCallerContext(req) {
    const fromNginx = req.headers['x-shouyu-from-nginx'] === '1';
    const userId = String(req.headers['x-shouyu-user-id'] || '').trim();
    const phoneMasked = String(req.headers['x-shouyu-user-phone'] || '').trim();
    const phoneHash = String(req.headers['x-shouyu-user-phone-hash'] || '').trim().toLowerCase();
    const userRoleHeader = String(req.headers['x-shouyu-user-role'] || '').trim().toLowerCase();
    const passRoleHeader = String(req.headers['x-shouyu-pass-role'] || '').trim().toLowerCase();

    const authenticated = Boolean(userId && phoneHash);
    const isSuperAdmin =
      authenticated &&
      (passRoleHeader === 'super_admin' ||
        userRoleHeader === 'super_admin' ||
        store.isPhoneHashSuperAdmin(phoneHash));
    const isPassportDriveAdmin = authenticated && (isSuperAdmin || userRoleHeader === 'admin');
    const webAllowed = authenticated && (isPassportDriveAdmin || store.isPhoneHashAllowed(phoneHash));
    const isAdmin = webAllowed && (isPassportDriveAdmin || store.isPhoneHashAdmin(phoneHash));
    const role = !webAllowed ? 'guest' : isSuperAdmin ? 'super_admin' : isAdmin ? 'admin' : 'user';

    const bearer = parseBearerToken(req.headers['authorization']);
    const agentToken = bearer ? store.verifyAgentToken(bearer) : null;

    const isDirectLocalAgent =
      !fromNginx &&
      isLoopbackAddress(req.socket?.remoteAddress) &&
      !req.headers['origin'] &&
      !req.headers['referer'] &&
      !req.headers['x-forwarded-for'] &&
      !req.headers['cookie'];

    return {
      fromNginx,
      authenticated,
      webAllowed,
      isSuperAdmin,
      isAdmin,
      role,
      user: authenticated ? { id: userId, phoneMasked, phoneHash } : null,
      agentToken,
      isDirectLocalAgent,
      canUseAgentApi: Boolean(agentToken || isDirectLocalAgent || webAllowed),
    };
  }

  function buildWebStatePayload(ctx, requestedDir = '/') {
    const stats = store.getStorageStats();
    const overview = store.getDriveOverview();
    const payload = {
      authenticated: ctx.authenticated,
      allowed: ctx.webAllowed,
      isSuperAdmin: Boolean(ctx.isSuperAdmin),
      isAdmin: Boolean(ctx.isAdmin),
      role: ctx.role,
      user: ctx.user ? { id: ctx.user.id, phoneMasked: ctx.user.phoneMasked } : null,
      storage: stats,
      overview,
    };
    if (ctx.webAllowed) {
      let listing;
      try {
        listing = store.listDirectory(requestedDir || '/', 1);
      } catch {
        listing = store.listDirectory('/', 1);
      }
      payload.currentDir = listing.path;
      payload.rootFiles = listing.items;
    }
    if (ctx.isAdmin) {
      payload.whitelist = store.listWhitelist();
      payload.tokens = store.listAgentTokens();
      payload.serverPath = '/srv/drive';
    }
    return payload;
  }

  function proxyToFileBrowser(req, res, targetPathWithQuery) {
    return new Promise(resolve => {
      const headers = { ...req.headers };
      delete headers['x-fbrowser-user'];
      delete headers['x-shouyu-from-nginx'];
      delete headers['x-shouyu-user-id'];
      delete headers['x-shouyu-user-phone'];
      delete headers['x-shouyu-user-phone-hash'];
      delete headers['x-shouyu-user-role'];
      delete headers['x-shouyu-pass-role'];
      delete headers['x-shouyu-super-admin'];
      headers['host'] = upstreamBase.host;
      headers['x-fbrowser-user'] = filebrowserUser;

      const proxyReq = httpRequest(
        {
          hostname: upstreamBase.hostname,
          port: upstreamBase.port || 80,
          method: req.method,
          path: targetPathWithQuery,
          headers,
        },
        upstreamRes => {
          const respHeaders = { ...upstreamRes.headers };
          if (!targetPathWithQuery.includes('/static/')) {
            respHeaders['cache-control'] = respHeaders['cache-control'] || 'private, no-store';
          }
          res.writeHead(upstreamRes.statusCode || 502, respHeaders);
          upstreamRes.pipe(res);
          upstreamRes.on('end', resolve);
          upstreamRes.on('error', resolve);
        },
      );

      proxyReq.on('error', () => {
        if (!res.headersSent) {
          sendJson(res, 502, { code: 'UPSTREAM_UNAVAILABLE', message: '网盘文件服务正在启动或暂不可用，请稍后重试。' });
        } else {
          res.end();
        }
        resolve();
      });

      req.on('aborted', () => {
        proxyReq.destroy();
        resolve();
      });

      req.pipe(proxyReq);
    });
  }

  return async function handleRequest(req, res) {
    try {
      const rawUrl = new URL(req.url || '/', 'http://localhost');
      const rawPathname = rawUrl.pathname;
      const mountBase =
        rawPathname === '/drive' || rawPathname.startsWith('/drive/') || req.headers['x-forwarded-prefix'] === '/drive'
          ? '/drive'
          : '';

      if (rawPathname === '/drive') {
        res.writeHead(308, { Location: '/drive/' + rawUrl.search, 'Cache-Control': 'no-store' });
        res.end();
        return;
      }

      // Standalone local-dev fallback for Unified Passport floating modal assets
      if ((req.method === 'GET' || req.method === 'HEAD') && (rawPathname === '/auth/sdk.js' || rawPathname === '/auth/modal.css')) {
        const isCss = rawPathname.endsWith('.css');
        const body = readAsset(isCss ? 'auth-modal.css' : 'auth-sdk.js');
        res.writeHead(200, {
          'Content-Type': isCss ? 'text/css; charset=utf-8' : 'application/javascript; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
          'X-Content-Type-Options': 'nosniff',
        });
        res.end(req.method === 'HEAD' ? undefined : body);
        return;
      }

      let pathname = rawPathname;
      if (pathname.startsWith('/drive/')) {
        pathname = pathname.slice(6) || '/';
      }

      if (pathname === '/healthz' && (req.method === 'GET' || req.method === 'HEAD')) {
        sendJson(res, 200, { ok: true });
        return;
      }

      const ctx = resolveCallerContext(req);

      // Legacy /files route: browser HTML requests stay directly on unified /drive/ console
      if (pathname === '/files' && (req.method === 'GET' || req.method === 'HEAD')) {
        res.writeHead(302, { Location: `${mountBase || '/drive'}/${rawUrl.search}`, 'Cache-Control': 'no-store' });
        res.end();
        return;
      }

      if (pathname.startsWith('/files/')) {
        const isPublicStatic =
          pathname.startsWith('/files/static/') && (req.method === 'GET' || req.method === 'HEAD');
        if (!isPublicStatic && !ctx.webAllowed && !ctx.agentToken && !ctx.isDirectLocalAgent) {
          if (!ctx.authenticated) {
            if (isBrowserHtmlRequest(req)) {
              const loginOnDriveUrl = `${mountBase || '/drive'}/?login=1`;
              res.writeHead(302, { Location: loginOnDriveUrl, 'Cache-Control': 'private, no-store' });
              res.end();
              return;
            }
            sendJson(res, 401, { code: 'UNAUTHORIZED', message: '请先使用手语分社统一通行证登录。' });
            return;
          }
          if (isBrowserHtmlRequest(req)) {
            res.writeHead(302, { Location: `${mountBase || '/drive'}/?denied=1`, 'Cache-Control': 'private, no-store' });
            res.end();
            return;
          }
          sendJson(res, 403, { code: 'NOT_WHITELISTED', message: '当前通行证手机号暂未在心创云盘白名单中。' });
          return;
        }

        if (!isPublicStatic && isBrowserHtmlRequest(req)) {
          let subDir = '';
          if (pathname.startsWith('/files/files/')) {
            try {
              subDir = '/' + decodeURIComponent(pathname.slice('/files/files/'.length)).replace(/\/+$/, '');
            } catch {
              subDir = '';
            }
          }
          const dest =
            subDir && subDir !== '/'
              ? `${mountBase || '/drive'}/?dir=${encodeURIComponent(subDir)}`
              : `${mountBase || '/drive'}/`;
          res.writeHead(302, { Location: dest, 'Cache-Control': 'private, no-store' });
          res.end();
          return;
        }

        const upstreamPath = `/drive${pathname}${rawUrl.search}`;
        await proxyToFileBrowser(req, res, upstreamPath);
        return;
      }

      // Portal static assets
      let decodedPathname = pathname;
      try {
        decodedPathname = decodeURIComponent(pathname);
      } catch {
        // Keep raw pathname if percent-decoding fails
      }
      if ((req.method === 'GET' || req.method === 'HEAD') && Object.hasOwn(STATIC_ASSETS, decodedPathname)) {
        const asset = STATIC_ASSETS[decodedPathname];
        const raw = readAsset(asset.file);
        let body = raw;
        const headers = {
          'Content-Type': asset.type,
          'Cache-Control': asset.cache,
          'X-Content-Type-Options': 'nosniff',
        };
        if (asset.type.startsWith('text/html')) {
          const initialDir = rawUrl.searchParams.get('dir') || '/';
          const initialStateJson = escapeHtmlAttribute(JSON.stringify(buildWebStatePayload(ctx, initialDir)));
          body = Buffer.from(
            raw
              .toString('utf8')
              .replaceAll('__DRIVE_BASE__', mountBase || '/drive')
              .replaceAll('__ASSET_VERSION__', getAssetVersion())
              .replaceAll('__INITIAL_STATE__', initialStateJson),
            'utf8',
          );
          headers['Content-Security-Policy'] = CSP_HEADER;
          headers['Vary'] = 'Cookie';
        } else if (asset.file === 'style.css') {
          body = Buffer.from(raw.toString('utf8').replaceAll('__ASSET_VERSION__', getAssetVersion()), 'utf8');
        }
        res.writeHead(200, headers);
        res.end(req.method === 'HEAD' ? undefined : body);
        return;
      }

      // Cloud Drive File & Agent API endpoints (/api/agent/*)
      if (pathname.startsWith('/api/agent/')) {
        if (!ctx.canUseAgentApi) {
          if (!ctx.authenticated && !ctx.agentToken) {
            sendJson(res, 401, {
              code: 'UNAUTHORIZED',
              message: '需要有效的 Agent Bearer Token、服务器本地回环访问权限或白名单登录会话。',
            });
            return;
          }
          sendJson(res, 403, { code: 'FORBIDDEN', message: '当前账号无权调用云盘接口。' });
          return;
        }
        // Web session mutations still enforce Same-Origin CSRF protection
        if (ctx.webAllowed && !ctx.agentToken && !ctx.isDirectLocalAgent && !verifySameOrigin(req)) {
          sendJson(res, 403, { code: 'INVALID_ORIGIN', message: '请在当前页面内完成操作。' });
          return;
        }

        if (pathname === '/api/agent/tree' && req.method === 'GET') {
          const relPath = rawUrl.searchParams.get('path') || '/';
          const depth = Number(rawUrl.searchParams.get('depth') || 1);
          const listing = store.listDirectory(relPath, depth);
          sendJson(res, 200, {
            ok: true,
            ...listing,
            stats: store.getStorageStats(),
            overview: store.getDriveOverview(),
          });
          return;
        }

        if (pathname === '/api/agent/search' && req.method === 'GET') {
          const q = rawUrl.searchParams.get('q') || '';
          const relPath = rawUrl.searchParams.get('path') || '/';
          const result = store.searchEntries(q, relPath);
          sendJson(res, 200, {
            ok: true,
            ...result,
          });
          return;
        }

        if (pathname === '/api/agent/read' && (req.method === 'GET' || req.method === 'HEAD')) {
          const relPath = rawUrl.searchParams.get('path') || '';
          const forceDownload = rawUrl.searchParams.get('download') === '1';
          const entry = store.statEntry(relPath);
          if (entry.isDir) {
            throw new DriveError('IS_DIRECTORY', '目标路径是文件夹，请使用打包下载或 /api/agent/tree 列目录。', 400);
          }
          const fileName = basename(entry.absPath);
          const ext = extname(entry.absPath).toLowerCase();
          const mime = forceDownload ? 'application/octet-stream' : MIME_BY_EXT[ext] || 'application/octet-stream';
          const dispositionType = forceDownload ? 'attachment' : 'inline';
          const baseHeaders = {
            'Content-Type': mime,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'private, no-store',
            'X-Content-Type-Options': 'nosniff',
            'X-Drive-Path': encodeURIComponent(entry.relPath),
            'Content-Disposition': buildContentDisposition(dispositionType, fileName),
          };

          const range = parseByteRange(req.headers['range'], entry.size);
          if (range?.unsatisfiable) {
            res.writeHead(416, {
              ...baseHeaders,
              'Content-Range': `bytes */${entry.size}`,
            });
            res.end();
            return;
          }
          if (range) {
            const chunkLen = range.end - range.start + 1;
            res.writeHead(206, {
              ...baseHeaders,
              'Content-Range': `bytes ${range.start}-${range.end}/${entry.size}`,
              'Content-Length': String(chunkLen),
            });
            if (req.method === 'HEAD') {
              res.end();
              return;
            }
            await pipeline(createReadStream(entry.absPath, { start: range.start, end: range.end }), res);
            return;
          }

          res.writeHead(200, {
            ...baseHeaders,
            'Content-Length': String(entry.size),
          });
          if (req.method === 'HEAD') {
            res.end();
            return;
          }
          await pipeline(createReadStream(entry.absPath), res);
          return;
        }

        if (pathname === '/api/agent/zip' && (req.method === 'GET' || req.method === 'POST')) {
          let requestedPaths = [];
          if (req.method === 'POST') {
            const body = await readJsonBody(req);
            if (Array.isArray(body.paths)) {
              requestedPaths = body.paths.map(p => String(p || '').trim()).filter(Boolean);
            } else if (body.path) {
              requestedPaths = [String(body.path).trim()];
            }
          } else {
            const multi = rawUrl.searchParams.getAll('paths').filter(Boolean);
            if (multi.length > 0) {
              requestedPaths = multi;
            } else {
              requestedPaths = [rawUrl.searchParams.get('path') || '/'];
            }
          }

          if (requestedPaths.length === 0) {
            throw new DriveError('INVALID_INPUT', '请指定要打包下载的路径。', 400);
          }

          const targets = [];
          let archiveTitle = '心创云盘打包下载';

          if (requestedPaths.length === 1) {
            const resolved = store.statEntry(requestedPaths[0]);
            if (resolved.relPath === '/') {
              archiveTitle = '心创云盘全部文件';
              targets.push({ absPath: resolved.absPath, archiveName: '' });
            } else {
              const base = basename(resolved.absPath);
              archiveTitle = base;
              targets.push({ absPath: resolved.absPath, archiveName: base });
            }
          } else {
            const usedNames = new Set();
            for (const rawP of requestedPaths) {
              const resolved = store.statEntry(rawP);
              if (resolved.relPath === '/') {
                targets.push({ absPath: resolved.absPath, archiveName: '' });
                continue;
              }
              let name = basename(resolved.absPath);
              if (usedNames.has(name)) {
                const ext = extname(name);
                const stem = ext ? name.slice(0, -ext.length) : name;
                let suffix = 2;
                while (usedNames.has(`${stem}-${suffix}${ext}`)) suffix++;
                name = `${stem}-${suffix}${ext}`;
              }
              usedNames.add(name);
              targets.push({ absPath: resolved.absPath, archiveName: name });
            }
            archiveTitle = `心创云盘精选-${targets.length}项`;
          }

          await streamZipArchive(res, targets, length => res.writeHead(200, {
            'Content-Type': 'application/zip',
            'Content-Length': String(length),
            'Cache-Control': 'private, no-store',
            'X-Content-Type-Options': 'nosniff',
            'Content-Disposition': buildContentDisposition('attachment', `${archiveTitle}.zip`),
          }));
          return;
        }

        if (pathname === '/api/agent/write' && (req.method === 'PUT' || req.method === 'POST')) {
          const contentType = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
          const queryPath = rawUrl.searchParams.get('path');
          if (!queryPath && contentType === 'application/json') {
            const body = await readJsonBody(req, Math.min(maxAgentWriteBytes, 16 * 1024 * 1024));
            if (typeof body.path !== 'string' || typeof body.content !== 'string') {
              throw new DriveError('INVALID_INPUT', 'JSON 写入需包含字符串字段 path 与 content。', 400);
            }
            const buf =
              body.encoding === 'base64'
                ? Buffer.from(body.content, 'base64')
                : Buffer.from(body.content, 'utf8');
            const written = store.writeFileBuffer(body.path, buf);
            sendJson(res, 200, written);
            return;
          }
          if (!queryPath) {
            throw new DriveError('INVALID_INPUT', '请通过查询参数 ?path=/... 指定写入目标路径。', 400);
          }
          const resolved = resolveSafeStoragePath(store.storageRoot, queryPath, { allowRoot: false });
          const written = await streamBodyToFile(req, resolved.realRoot, resolved.absPath, maxAgentWriteBytes);
          store.invalidateOverviewCache();
          sendJson(res, 200, {
            ok: true,
            path: resolved.relPath,
            size: written.size,
            mtimeMs: written.mtimeMs,
          });
          return;
        }

        if (pathname === '/api/agent/mkdir' && req.method === 'POST') {
          let targetPath = rawUrl.searchParams.get('path') || '';
          if (!targetPath) {
            const body = await readJsonBody(req);
            targetPath = String(body.path || '');
          }
          sendJson(res, 200, store.ensureDirectory(targetPath));
          return;
        }

        if (pathname === '/api/agent/move' && req.method === 'POST') {
          const body = await readJsonBody(req);
          const fromPath = String(body.from || '').trim();
          const toPath = String(body.to || '').trim();
          if (!fromPath || !toPath) {
            throw new DriveError('INVALID_INPUT', '请提供原路径 from 与目标路径 to。', 400);
          }
          if (body.overwrite !== undefined && typeof body.overwrite !== 'boolean') {
            throw new DriveError('INVALID_INPUT', 'overwrite 必须是布尔值。', 400);
          }
          sendJson(res, 200, store.moveEntry(fromPath, toPath, { overwrite: body.overwrite }));
          return;
        }

        if (pathname === '/api/agent/delete' && (req.method === 'DELETE' || req.method === 'POST')) {
          let targetPath = rawUrl.searchParams.get('path') || '';
          if (!targetPath && req.method === 'POST') {
            const body = await readJsonBody(req);
            if (Array.isArray(body.paths) && body.paths.length > 0) {
              sendJson(res, 200, store.deleteEntries(body.paths));
              return;
            }
            targetPath = String(body.path || '');
          }
          sendJson(res, 200, store.deleteEntry(targetPath));
          return;
        }

        sendJson(res, 404, { code: 'NOT_FOUND', message: '云盘接口不存在。' });
        return;
      }

      // Web Console API endpoints (/api/*)
      if (pathname.startsWith('/api/')) {
        if (!verifySameOrigin(req)) {
          sendJson(res, 403, { code: 'INVALID_ORIGIN', message: '请在当前站点页面内完成操作。' });
          return;
        }

        if (pathname === '/api/state' && req.method === 'GET') {
          const requestedDir = rawUrl.searchParams.get('dir') || '/';
          sendJson(res, 200, buildWebStatePayload(ctx, requestedDir));
          return;
        }

        if (req.method !== 'POST') {
          sendJson(res, 405, { code: 'METHOD_NOT_ALLOWED', message: '不支持的请求方法。' });
          return;
        }
        if (!ctx.authenticated) {
          sendJson(res, 401, { code: 'UNAUTHORIZED', message: '请先使用手语分社统一通行证登录。' });
          return;
        }
        if (!ctx.webAllowed) {
          sendJson(res, 403, { code: 'NOT_WHITELISTED', message: '当前手机号不在网盘访问白名单中。' });
          return;
        }
        if (!ctx.isAdmin) {
          sendJson(res, 403, { code: 'ADMIN_ONLY', message: '仅网盘管理员可执行此操作。' });
          return;
        }

        const body = await readJsonBody(req);

        if (pathname === '/api/whitelist/add') {
          const result = store.addWhitelistPhone(body.phone, body.note, {
            role: body.role === 'admin' ? 'admin' : 'user',
          });
          sendJson(res, 200, {
            ...result,
            whitelist: store.listWhitelist(),
          });
          return;
        }

        if (pathname === '/api/whitelist/role') {
          const result = store.setWhitelistRole(body.hash || body.phone, body.role, {
            currentPhoneHash: ctx.user.phoneHash,
          });
          sendJson(res, 200, {
            ...result,
            whitelist: store.listWhitelist(),
          });
          return;
        }

        if (pathname === '/api/whitelist/remove') {
          store.removeWhitelistEntry(body.hash || body.phone, {
            currentPhoneHash: ctx.user.phoneHash,
          });
          sendJson(res, 200, {
            removed: true,
            whitelist: store.listWhitelist(),
          });
          return;
        }

        if (pathname === '/api/tokens/create') {
          const created = store.createAgentToken(body.name, ctx.user.phoneMasked);
          sendJson(res, 200, {
            created,
            tokens: store.listAgentTokens(),
          });
          return;
        }

        if (pathname === '/api/tokens/revoke') {
          store.revokeAgentToken(body.id);
          sendJson(res, 200, {
            revoked: true,
            tokens: store.listAgentTokens(),
          });
          return;
        }

        if (pathname === '/api/storage/resize') {
          if (typeof resizeVolume !== 'function') {
            throw new DriveError('RESIZE_UNAVAILABLE', '当前运行环境未启用在线扩容命令。', 501);
          }
          const targetGb = Number(body.sizeGb);
          if (!Number.isInteger(targetGb) || targetGb < 60 || targetGb > 500) {
            throw new DriveError('INVALID_SIZE', '请输入 60 至 500 之间的整数容量（GB）。', 400);
          }
          const result = await resizeVolume(targetGb);
          sendJson(res, 200, {
            ok: true,
            result,
            storage: store.getStorageStats(),
          });
          return;
        }

        sendJson(res, 404, { code: 'NOT_FOUND', message: '接口不存在。' });
        return;
      }

      sendJson(res, 404, { code: 'NOT_FOUND', message: '页面不存在。' });
    } catch (error) {
      if (res.headersSent || res.destroyed) {
        res.destroy();
        return;
      }
      if (error instanceof DriveError) {
        sendJson(res, error.status || 400, { code: error.code, message: error.message });
        return;
      }
      sendJson(res, 500, { code: 'INTERNAL_ERROR', message: '云盘服务处理异常，请稍后再试。' });
    }
  };
}
