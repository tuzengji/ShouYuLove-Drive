import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import {
  chmodSync,
  chownSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  statfsSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

export const PHONE_HASH_PREFIX = 'syl-phone-v1:';

export const SUPER_ADMIN_PHONE_HASHES = Object.freeze([
  'b0adc1362e6bc329700dda54206f3f7be21daa1d109f7cbdeb0301437c59ffd5', // 191****0323
  '66f0945a1d416a6276df7dbfb0f3c9e7741b605b10d2f4b1d715689e210b4247', // 152****6060
]);

export const ADMIN_PHONE_HASHES = SUPER_ADMIN_PHONE_HASHES;

export const DEFAULT_SEED_WHITELIST = Object.freeze([
  Object.freeze({
    hash: 'b0adc1362e6bc329700dda54206f3f7be21daa1d109f7cbdeb0301437c59ffd5',
    masked: '191****0323',
    note: '超级管理员',
    role: 'super_admin',
    addedAt: 1763097600000,
  }),
  Object.freeze({
    hash: '66f0945a1d416a6276df7dbfb0f3c9e7741b605b10d2f4b1d715689e210b4247',
    masked: '152****6060',
    note: '超级管理员',
    role: 'super_admin',
    addedAt: 1763124000000,
  }),
]);

export const OPEN_DIR_MODE = 0o2777;
export const OPEN_FILE_MODE = 0o666;

export class DriveError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function normalizedPhone(value) {
  if (typeof value !== 'string') {
    throw new DriveError('INVALID_PHONE', '请输入有效的中国大陆手机号。');
  }
  const phone = value.trim().replace(/^\+?86[\s-]*/, '').replace(/[\s-]/g, '');
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    throw new DriveError('INVALID_PHONE', '请输入有效的中国大陆手机号（11 位数字）。');
  }
  return phone;
}

export function maskPhone(phone) {
  if (typeof phone !== 'string' || phone.length < 7) return '***';
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}

export function hashPhone(phone) {
  const clean = normalizedPhone(phone);
  return createHash('sha256').update(PHONE_HASH_PREFIX + clean).digest('hex');
}

export function sha256Hex(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

function safeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length || a.length % 2 !== 0) {
    return false;
  }
  if (!/^[a-f0-9]+$/i.test(a) || !/^[a-f0-9]+$/i.test(b)) {
    return false;
  }
  return timingSafeEqual(Buffer.from(a.toLowerCase(), 'hex'), Buffer.from(b.toLowerCase(), 'hex'));
}

function resolveWhitelistIdentifier(identifier) {
  const target = String(identifier || '').trim();
  if (!target) {
    throw new DriveError('INVALID_INPUT', '请提供白名单手机号或哈希标识。');
  }
  let targetHash = target.toLowerCase();
  if (/^(\+?86[\s-]*)?1[3-9]\d{9}$/.test(target.replace(/[\s-]/g, ''))) {
    targetHash = hashPhone(target);
  }
  if (!/^[a-f0-9]{64}$/.test(targetHash)) {
    throw new DriveError('INVALID_INPUT', '白名单标识格式无效。');
  }
  return targetHash;
}

function normalizeRelativeUrlPath(rawPath) {
  const str = String(rawPath ?? '/').trim() || '/';
  if (str.includes('\0') || str.includes('\\')) {
    throw new DriveError('INVALID_PATH', '路径包含非法字符。', 400);
  }
  const parts = str.split('/').filter(part => part.length > 0 && part !== '.');
  for (const part of parts) {
    if (part === '..') {
      throw new DriveError('INVALID_PATH', '禁止访问存储根目录以外的路径。', 403);
    }
  }
  return parts;
}

export function ensureSharedDirectoryChain(realRoot, targetDir) {
  mkdirSync(targetDir, { recursive: true, mode: OPEN_DIR_MODE });
  let cursor = resolve(targetDir);
  const stop = resolve(realRoot);
  while (cursor.startsWith(stop) && cursor.length > stop.length) {
    try {
      chmodSync(cursor, OPEN_DIR_MODE);
    } catch {
      // Non-owner directory created by another server user already inherits group/ACL write access.
    }
    const parent = dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
}

export function resolveSafeStoragePath(storageRoot, rawPath, { mustExist = false, allowRoot = true } = {}) {
  const realRoot = realpathSync(storageRoot);
  const parts = normalizeRelativeUrlPath(rawPath);
  if (!allowRoot && parts.length === 0) {
    throw new DriveError('INVALID_PATH', '不允许直接操作存储根目录。', 400);
  }
  const candidate = resolve(realRoot, ...parts);
  const rel = relative(realRoot, candidate);
  if (rel.startsWith('..') || rel === '..') {
    throw new DriveError('INVALID_PATH', '禁止越权路径访问。', 403);
  }
  if (existsSync(candidate)) {
    const lstat = lstatSync(candidate);
    if (lstat.isSymbolicLink()) {
      const targetReal = realpathSync(candidate);
      const targetRel = relative(realRoot, targetReal);
      if (targetRel.startsWith('..') || targetRel === '..') {
        throw new DriveError('INVALID_PATH', '禁止通过符号链接越出网盘目录。', 403);
      }
    } else {
      const realCandidate = realpathSync(candidate);
      const realRel = relative(realRoot, realCandidate);
      if (realRel.startsWith('..') || realRel === '..') {
        throw new DriveError('INVALID_PATH', '禁止越权路径访问。', 403);
      }
    }
  } else {
    if (mustExist) {
      throw new DriveError('NOT_FOUND', '目标文件或目录不存在。', 404);
    }
    // Check nearest existing ancestor so symlink parents cannot escape root.
    let cursor = dirname(candidate);
    while (!existsSync(cursor)) {
      const next = dirname(cursor);
      if (next === cursor) break;
      cursor = next;
    }
    if (existsSync(cursor)) {
      const ancestorReal = realpathSync(cursor);
      const ancestorRel = relative(realRoot, ancestorReal);
      if (ancestorRel.startsWith('..') || ancestorRel === '..') {
        throw new DriveError('INVALID_PATH', '父目录指向越界位置。', 403);
      }
    }
  }
  return {
    realRoot,
    absPath: candidate,
    relPath: '/' + parts.join('/'),
    parts,
  };
}

export class DriveStore {
  constructor({
    statePath,
    storageRoot,
    seedDefaultWhitelist = true,
    adminPhoneHashes = ADMIN_PHONE_HASHES,
    now = Date.now,
  }) {
    this.statePath = statePath;
    this.storageRoot = storageRoot;
    this.seedDefaultWhitelist = seedDefaultWhitelist;
    this.adminPhoneHashes = Array.isArray(adminPhoneHashes) ? [...adminPhoneHashes] : [...ADMIN_PHONE_HASHES];
    this.now = now;
    this.stateStatKey = '';
    this.overviewCache = null;
    this.overviewCacheAt = 0;
    mkdirSync(dirname(statePath), { recursive: true, mode: 0o700 });
    mkdirSync(storageRoot, { recursive: true, mode: OPEN_DIR_MODE });
    try {
      chmodSync(storageRoot, OPEN_DIR_MODE);
    } catch {
      // Ignore chmod when storageRoot is owned by another user.
    }
    this.state = this.loadState();
  }

  getStateStatKey() {
    try {
      const st = statSync(this.statePath);
      return `${st.ino}:${st.mtimeMs}:${st.size}`;
    } catch {
      return '';
    }
  }

  syncIfChanged() {
    const key = this.getStateStatKey();
    if (key && key !== this.stateStatKey) {
      this.reload();
    }
  }

  loadState() {
    if (!existsSync(this.statePath)) {
      const initial = {
        version: 1,
        whitelist: this.seedDefaultWhitelist ? DEFAULT_SEED_WHITELIST.map(item => ({ ...item })) : [],
        tokens: [],
        updatedAt: this.now(),
      };
      this.writeState(initial);
      return initial;
    }
    const raw = JSON.parse(readFileSync(this.statePath, 'utf8'));
    const whitelist = Array.isArray(raw.whitelist) ? raw.whitelist : [];
    let upgraded = false;
    for (const entry of whitelist) {
      if (this.adminPhoneHashes.some(h => safeEqualHex(h, entry.hash))) {
        if (entry.role !== 'super_admin') {
          entry.role = 'super_admin';
          upgraded = true;
        }
        if (entry.note === '管理员' || entry.note === '授权成员' || !entry.note) {
          entry.note = '超级管理员';
          upgraded = true;
        }
      }
    }
    const state = {
      version: 1,
      whitelist,
      tokens: Array.isArray(raw.tokens) ? raw.tokens : [],
      updatedAt: upgraded ? this.now() : Number(raw.updatedAt || this.now()),
    };
    if (upgraded) {
      try {
        this.writeState(state);
      } catch {
        this.stateStatKey = this.getStateStatKey();
      }
    } else {
      this.stateStatKey = this.getStateStatKey();
    }
    return state;
  }

  writeState(nextState) {
    const tmp = `${this.statePath}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`;
    let ownerUid = null;
    let ownerGid = null;
    if (typeof process.getuid === 'function' && process.getuid() === 0 && existsSync(this.statePath)) {
      const existing = statSync(this.statePath);
      ownerUid = existing.uid;
      ownerGid = existing.gid;
    }
    writeFileSync(tmp, JSON.stringify(nextState, null, 2) + '\n', { mode: 0o600 });
    chmodSync(tmp, 0o600);
    if (ownerUid !== null && ownerGid !== null) {
      chownSync(tmp, ownerUid, ownerGid);
    }
    renameSync(tmp, this.statePath);
    this.state = nextState;
    this.stateStatKey = this.getStateStatKey();
  }

  reload() {
    this.state = this.loadState();
    return this.state;
  }

  isPhoneHashAllowed(phoneHash) {
    this.syncIfChanged();
    if (typeof phoneHash !== 'string' || !/^[a-f0-9]{64}$/i.test(phoneHash)) {
      return false;
    }
    return this.state.whitelist.some(item => safeEqualHex(item.hash, phoneHash));
  }

  isPhoneHashSuperAdmin(phoneHash) {
    if (typeof phoneHash !== 'string' || !/^[a-f0-9]{64}$/i.test(phoneHash)) {
      return false;
    }
    return this.adminPhoneHashes.some(h => safeEqualHex(h, phoneHash)) && this.isPhoneHashAllowed(phoneHash);
  }

  isPhoneHashAdmin(phoneHash) {
    this.syncIfChanged();
    if (typeof phoneHash !== 'string' || !/^[a-f0-9]{64}$/i.test(phoneHash)) {
      return false;
    }
    if (this.adminPhoneHashes.some(h => safeEqualHex(h, phoneHash)) && this.isPhoneHashAllowed(phoneHash)) {
      return true;
    }
    return this.state.whitelist.some(item => safeEqualHex(item.hash, phoneHash) && item.role === 'admin');
  }

  serializeWhitelistEntry(item) {
    const isSuperAdmin = this.adminPhoneHashes.some(h => safeEqualHex(h, item.hash));
    const role = isSuperAdmin ? 'super_admin' : item.role === 'admin' ? 'admin' : 'user';
    return {
      hash: item.hash,
      masked: item.masked,
      note: item.note || '',
      role,
      isSuperAdmin,
      isAdmin: role === 'super_admin' || role === 'admin',
      addedAt: item.addedAt,
    };
  }

  listWhitelist() {
    this.syncIfChanged();
    return this.state.whitelist.map(item => this.serializeWhitelistEntry(item));
  }

  addWhitelistPhone(phone, note = '', { role = 'user' } = {}) {
    this.syncIfChanged();
    const clean = normalizedPhone(phone);
    const hash = hashPhone(clean);
    const masked = maskPhone(clean);
    const cleanNote = String(note || '').trim().slice(0, 48);
    const requestedRole = role === 'admin' ? 'admin' : 'user';
    const existing = this.state.whitelist.find(item => safeEqualHex(item.hash, hash));
    if (existing) {
      let changed = false;
      if (cleanNote && existing.note !== cleanNote) {
        existing.note = cleanNote;
        changed = true;
      }
      if (!this.adminPhoneHashes.some(h => safeEqualHex(h, hash)) && role === 'admin' && existing.role !== 'admin') {
        existing.role = 'admin';
        changed = true;
      }
      if (changed) {
        this.state.updatedAt = this.now();
        this.writeState(this.state);
      }
      return {
        added: false,
        entry: this.serializeWhitelistEntry(existing),
      };
    }
    const isSuper = this.adminPhoneHashes.some(h => safeEqualHex(h, hash));
    const entry = {
      hash,
      masked,
      note: cleanNote,
      role: isSuper ? 'super_admin' : requestedRole,
      addedAt: this.now(),
    };
    this.state.whitelist.push(entry);
    this.state.updatedAt = this.now();
    this.writeState(this.state);
    return {
      added: true,
      entry: this.serializeWhitelistEntry(entry),
    };
  }

  setWhitelistRole(identifier, role, { currentPhoneHash = '' } = {}) {
    this.syncIfChanged();
    const targetHash = resolveWhitelistIdentifier(identifier);
    const nextRole = role === 'admin' ? 'admin' : role === 'user' ? 'user' : null;
    if (!nextRole) {
      throw new DriveError('INVALID_ROLE', '成员角色仅支持 admin（管理员）或 user（普通成员）。', 400);
    }
    if (this.adminPhoneHashes.some(h => safeEqualHex(h, targetHash))) {
      throw new DriveError('CANNOT_CHANGE_SUPER_ADMIN', '不能修改初始超级管理员的身份。', 400);
    }
    if (nextRole === 'user' && currentPhoneHash && safeEqualHex(targetHash, currentPhoneHash)) {
      throw new DriveError('CANNOT_DEMOTE_SELF', '不能在网页端取消当前正在使用的管理员权限。', 400);
    }
    const entry = this.state.whitelist.find(item => safeEqualHex(item.hash, targetHash));
    if (!entry) {
      throw new DriveError('NOT_FOUND', '未找到对应的白名单成员条目。', 404);
    }
    entry.role = nextRole;
    this.state.updatedAt = this.now();
    this.writeState(this.state);
    return {
      updated: true,
      entry: this.serializeWhitelistEntry(entry),
    };
  }

  removeWhitelistEntry(identifier, { currentPhoneHash = '', allowEmpty = false } = {}) {
    this.syncIfChanged();
    const targetHash = resolveWhitelistIdentifier(identifier);
    if (!allowEmpty && currentPhoneHash && safeEqualHex(targetHash, currentPhoneHash)) {
      throw new DriveError('CANNOT_REMOVE_SELF', '为防止误锁定，不能在网页端移除当前正在使用的手机号。', 400);
    }
    if (!allowEmpty && this.adminPhoneHashes.some(h => safeEqualHex(h, targetHash))) {
      throw new DriveError('CANNOT_REMOVE_ADMIN', '不能在网页端移除超级管理员账号。', 400);
    }
    if (!allowEmpty && this.state.whitelist.length <= 1) {
      throw new DriveError('LAST_ENTRY', '至少需保留一个白名单手机号。', 400);
    }
    const before = this.state.whitelist.length;
    this.state.whitelist = this.state.whitelist.filter(item => !safeEqualHex(item.hash, targetHash));
    if (this.state.whitelist.length === before) {
      throw new DriveError('NOT_FOUND', '未找到对应的白名单条目。', 404);
    }
    this.state.updatedAt = this.now();
    this.writeState(this.state);
    return true;
  }

  createAgentToken(name, createdByMasked = '管理员') {
    this.syncIfChanged();
    const cleanName = String(name || '').trim().slice(0, 48) || 'Agent 协作令牌';
    const rawToken = 'syl_drv_' + randomBytes(24).toString('base64url');
    const id = randomBytes(6).toString('hex');
    const record = {
      id,
      name: cleanName,
      prefix: rawToken.slice(0, 14) + '...',
      tokenHash: sha256Hex(rawToken),
      createdByMasked: String(createdByMasked || '管理员'),
      createdAt: this.now(),
      lastUsedAt: null,
    };
    this.state.tokens.push(record);
    this.state.updatedAt = this.now();
    this.writeState(this.state);
    return {
      id: record.id,
      name: record.name,
      prefix: record.prefix,
      token: rawToken,
      createdAt: record.createdAt,
      createdByMasked: record.createdByMasked,
    };
  }

  listAgentTokens() {
    this.syncIfChanged();
    return this.state.tokens.map(item => ({
      id: item.id,
      name: item.name,
      prefix: item.prefix,
      createdByMasked: item.createdByMasked,
      createdAt: item.createdAt,
      lastUsedAt: item.lastUsedAt,
    }));
  }

  verifyAgentToken(rawToken) {
    this.syncIfChanged();
    if (typeof rawToken !== 'string' || !rawToken.startsWith('syl_drv_') || rawToken.length < 20) {
      return null;
    }
    const digest = sha256Hex(rawToken);
    const matched = this.state.tokens.find(item => safeEqualHex(item.tokenHash, digest));
    if (!matched) return null;
    const now = this.now();
    if (!matched.lastUsedAt || now - matched.lastUsedAt > 60_000) {
      matched.lastUsedAt = now;
      this.state.updatedAt = now;
      this.writeState(this.state);
    }
    return {
      id: matched.id,
      name: matched.name,
      prefix: matched.prefix,
    };
  }

  revokeAgentToken(id) {
    this.syncIfChanged();
    const targetId = String(id || '').trim();
    const before = this.state.tokens.length;
    this.state.tokens = this.state.tokens.filter(item => item.id !== targetId);
    if (this.state.tokens.length === before) {
      throw new DriveError('NOT_FOUND', '未找到指定的访问令牌。', 404);
    }
    this.state.updatedAt = this.now();
    this.writeState(this.state);
    return true;
  }

  invalidateOverviewCache() {
    this.overviewCache = null;
    this.overviewCacheAt = 0;
  }

  getDriveOverview({ maxEntries = 5000, maxDepth = 6 } = {}) {
    const nowMs = this.now();
    if (this.overviewCache && nowMs - this.overviewCacheAt < 2500) {
      return this.overviewCache;
    }

    let fileCount = 0;
    let dirCount = 0;
    let rootCount = 0;
    let latestMtimeMs = 0;
    let scanned = 0;

    const visit = (absDir, depth) => {
      if (scanned >= maxEntries || depth > maxDepth) return;
      let names;
      try {
        names = readdirSync(absDir);
      } catch {
        return;
      }
      for (const name of names) {
        if (name === 'lost+found') continue;
        if (scanned >= maxEntries) break;
        const itemAbs = join(absDir, name);
        let lst;
        try {
          lst = lstatSync(itemAbs);
        } catch {
          continue;
        }
        if (lst.isSymbolicLink()) continue;
        scanned++;
        if (depth === 1) rootCount++;
        const mtime = Math.round(lst.mtimeMs || 0);
        if (mtime > latestMtimeMs) latestMtimeMs = mtime;
        if (lst.isDirectory()) {
          dirCount++;
          if (depth < maxDepth) {
            visit(itemAbs, depth + 1);
          }
        } else if (lst.isFile()) {
          fileCount++;
        }
      }
    };

    visit(this.storageRoot, 1);

    const summary = {
      fileCount,
      dirCount,
      rootCount,
      latestMtimeMs: latestMtimeMs > 0 ? latestMtimeMs : null,
    };
    this.overviewCache = summary;
    this.overviewCacheAt = nowMs;
    return summary;
  }

  getStorageStats() {
    const stats = statfsSync(this.storageRoot);
    const blockSize = Number(stats.bsize || stats.frsize || 4096);
    const totalBytes = Number(stats.blocks) * blockSize;
    const freeBytes = Number(stats.bfree) * blockSize;
    const availableBytes = Number(stats.bavail) * blockSize;
    const usedBytes = Math.max(0, totalBytes - freeBytes);
    const usedPercent = totalBytes > 0 ? Math.min(100, Math.round((usedBytes / totalBytes) * 1000) / 10) : 0;
    return {
      storageRoot: this.storageRoot,
      totalBytes,
      usedBytes,
      availableBytes,
      freeBytes,
      usedPercent,
    };
  }

  listDirectory(rawPath = '/', depth = 1) {
    const safeDepth = Math.max(1, Math.min(5, Number(depth) || 1));
    const resolved = resolveSafeStoragePath(this.storageRoot, rawPath, { mustExist: true });
    const st = statSync(resolved.absPath);
    if (!st.isDirectory()) {
      throw new DriveError('NOT_DIRECTORY', '指定路径不是文件夹。', 400);
    }

    const walk = (absDir, relDir, currentDepth) => {
      const names = readdirSync(absDir).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
      const items = [];
      for (const name of names) {
        if (name === 'lost+found') continue;
        const itemAbs = join(absDir, name);
        let lst;
        try {
          lst = lstatSync(itemAbs);
        } catch {
          continue;
        }
        if (lst.isSymbolicLink()) continue;
        const childRel = relDir === '/' ? `/${name}` : `${relDir}/${name}`;
        const isDir = lst.isDirectory();
        const entry = {
          name,
          path: childRel,
          parentPath: relDir,
          type: isDir ? 'dir' : 'file',
          size: isDir ? 0 : lst.size,
          mtimeMs: Math.round(lst.mtimeMs),
        };
        if (isDir && currentDepth < safeDepth) {
          entry.children = walk(itemAbs, childRel, currentDepth + 1);
        }
        items.push(entry);
      }
      items.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
        return a.name.localeCompare(b.name, 'zh-Hans-CN');
      });
      return items;
    };

    return {
      path: resolved.relPath,
      items: walk(resolved.absPath, resolved.relPath, 1),
    };
  }

  searchEntries(query, rawBasePath = '/', { maxResults = 300, maxDepth = 8 } = {}) {
    const q = String(query || '').trim().toLowerCase();
    const resolved = resolveSafeStoragePath(this.storageRoot, rawBasePath, { mustExist: true });
    const st = statSync(resolved.absPath);
    if (!st.isDirectory()) {
      throw new DriveError('NOT_DIRECTORY', '搜索起始路径不是文件夹。', 400);
    }
    if (!q) {
      return { query: '', basePath: resolved.relPath, items: [] };
    }

    const items = [];
    const visit = (absDir, relDir, depth) => {
      if (items.length >= maxResults || depth > maxDepth) return;
      let names;
      try {
        names = readdirSync(absDir);
      } catch {
        return;
      }
      for (const name of names) {
        if (name === 'lost+found') continue;
        if (items.length >= maxResults) break;
        const itemAbs = join(absDir, name);
        let lst;
        try {
          lst = lstatSync(itemAbs);
        } catch {
          continue;
        }
        if (lst.isSymbolicLink()) continue;
        const childRel = relDir === '/' ? `/${name}` : `${relDir}/${name}`;
        const isDir = lst.isDirectory();
        if (name.toLowerCase().includes(q)) {
          items.push({
            name,
            path: childRel,
            parentPath: relDir,
            type: isDir ? 'dir' : 'file',
            size: isDir ? 0 : lst.size,
            mtimeMs: Math.round(lst.mtimeMs),
          });
        }
        if (isDir && depth < maxDepth && items.length < maxResults) {
          visit(itemAbs, childRel, depth + 1);
        }
      }
    };

    visit(resolved.absPath, resolved.relPath, 1);
    items.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name, 'zh-Hans-CN');
    });

    return {
      query: String(query || '').trim(),
      basePath: resolved.relPath,
      items,
    };
  }

  statEntry(rawPath) {
    const resolved = resolveSafeStoragePath(this.storageRoot, rawPath, { mustExist: true });
    const st = statSync(resolved.absPath);
    return {
      ...resolved,
      isDir: st.isDirectory(),
      isFile: st.isFile(),
      size: st.size,
      mtimeMs: Math.round(st.mtimeMs),
    };
  }

  ensureDirectory(rawPath) {
    const resolved = resolveSafeStoragePath(this.storageRoot, rawPath, { allowRoot: false });
    ensureSharedDirectoryChain(resolved.realRoot, resolved.absPath);
    this.invalidateOverviewCache();
    return { ok: true, path: resolved.relPath };
  }

  writeFileBuffer(rawPath, buffer) {
    const resolved = resolveSafeStoragePath(this.storageRoot, rawPath, { allowRoot: false });
    ensureSharedDirectoryChain(resolved.realRoot, dirname(resolved.absPath));
    const tmp = `${resolved.absPath}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`;
    writeFileSync(tmp, buffer, { mode: OPEN_FILE_MODE });
    try {
      chmodSync(tmp, OPEN_FILE_MODE);
    } catch {
      // Ignore chmod restriction when non-owner.
    }
    renameSync(tmp, resolved.absPath);
    const st = statSync(resolved.absPath);
    this.invalidateOverviewCache();
    return {
      ok: true,
      path: resolved.relPath,
      size: st.size,
      mtimeMs: Math.round(st.mtimeMs),
    };
  }

  moveEntry(rawFrom, rawTo, { overwrite = false } = {}) {
    const fromResolved = resolveSafeStoragePath(this.storageRoot, rawFrom, { mustExist: true, allowRoot: false });
    const toResolved = resolveSafeStoragePath(this.storageRoot, rawTo, { mustExist: false, allowRoot: false });

    if (fromResolved.relPath === toResolved.relPath) {
      return { ok: true, from: fromResolved.relPath, to: toResolved.relPath };
    }

    const fromSt = lstatSync(fromResolved.absPath);
    if (fromSt.isDirectory() && toResolved.relPath.startsWith(`${fromResolved.relPath}/`)) {
      throw new DriveError('INVALID_MOVE', '不能将文件夹移动到其自身或子文件夹内。', 400);
    }

    if (existsSync(toResolved.absPath)) {
      const sameInode =
        (() => {
          try {
            const dstSt = lstatSync(toResolved.absPath);
            return dstSt.ino === fromSt.ino && dstSt.dev === fromSt.dev;
          } catch {
            return false;
          }
        })();
      if (!sameInode && !overwrite) {
        throw new DriveError('ALREADY_EXISTS', '目标位置已存在同名文件或文件夹。', 409);
      }
      if (!sameInode && overwrite) {
        rmSync(toResolved.absPath, { recursive: true, force: false });
      }
    }

    ensureSharedDirectoryChain(toResolved.realRoot, dirname(toResolved.absPath));
    renameSync(fromResolved.absPath, toResolved.absPath);
    this.invalidateOverviewCache();
    return {
      ok: true,
      from: fromResolved.relPath,
      to: toResolved.relPath,
    };
  }

  deleteEntry(rawPath) {
    const resolved = resolveSafeStoragePath(this.storageRoot, rawPath, { mustExist: true, allowRoot: false });
    rmSync(resolved.absPath, { recursive: true, force: false });
    this.invalidateOverviewCache();
    return { ok: true, deleted: resolved.relPath };
  }

  deleteEntries(rawPaths) {
    if (!Array.isArray(rawPaths) || rawPaths.length === 0) {
      throw new DriveError('INVALID_INPUT', '请选择要删除的文件或文件夹。', 400);
    }
    const deleted = [];
    for (const rawPath of rawPaths) {
      const resolved = resolveSafeStoragePath(this.storageRoot, rawPath, { mustExist: false, allowRoot: false });
      if (existsSync(resolved.absPath)) {
        rmSync(resolved.absPath, { recursive: true, force: false });
        deleted.push(resolved.relPath);
      }
    }
    this.invalidateOverviewCache();
    return { ok: true, deleted };
  }
}
