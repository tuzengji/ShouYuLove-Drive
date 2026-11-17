import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ADMIN_PHONE_HASHES, DEFAULT_SEED_WHITELIST, DriveStore, SUPER_ADMIN_PHONE_HASHES, hashPhone } from '../src/drive-store.mjs';
import { createDriveHttpHandler } from '../src/http-app.mjs';

const TEST_ADMIN_PHONE = '13900000001';
const TEST_ADMIN_HASH = hashPhone(TEST_ADMIN_PHONE);
const TEST_MEMBER_PHONE = '13800138000';
const TEST_MEMBER_HASH = hashPhone(TEST_MEMBER_PHONE);
const TEST_GUEST_PHONE = '13700137000';
const TEST_GUEST_HASH = hashPhone(TEST_GUEST_PHONE);

function setupEnv() {
  const dir = mkdtempSync(join(tmpdir(), 'syl-drive-test-'));
  const statePath = join(dir, 'state.json');
  const storageRoot = join(dir, 'files');
  mkdirSync(storageRoot, { recursive: true });
  return { dir, statePath, storageRoot };
}

function listenServer(server) {
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      resolve(`http://127.0.0.1:${addr.port}`);
    });
  });
}

test('default seed whitelist grants super_admin to both 191****0323 and 152****6060 without plaintext', () => {
  const { dir, statePath, storageRoot } = setupEnv();
  try {
    assert.equal(SUPER_ADMIN_PHONE_HASHES.length, 2);
    assert.equal(ADMIN_PHONE_HASHES.length, 2);
    assert.equal(DEFAULT_SEED_WHITELIST.length, 2);

    const store = new DriveStore({ statePath, storageRoot });
    const list = store.listWhitelist();
    assert.equal(list.length, 2);

    const primarySuperAdmin = list.find(item => item.masked === '191****0323');
    const secondarySuperAdmin = list.find(item => item.masked === '152****6060');
    assert.ok(primarySuperAdmin);
    assert.ok(secondarySuperAdmin);
    assert.equal(primarySuperAdmin.role, 'super_admin');
    assert.equal(secondarySuperAdmin.role, 'super_admin');
    assert.equal(primarySuperAdmin.isSuperAdmin, true);
    assert.equal(secondarySuperAdmin.isSuperAdmin, true);

    assert.equal(store.isPhoneHashAllowed(primarySuperAdmin.hash), true);
    assert.equal(store.isPhoneHashAdmin(primarySuperAdmin.hash), true);
    assert.equal(store.isPhoneHashSuperAdmin(primarySuperAdmin.hash), true);

    assert.equal(store.isPhoneHashAllowed(secondarySuperAdmin.hash), true);
    assert.equal(store.isPhoneHashAdmin(secondarySuperAdmin.hash), true);
    assert.equal(store.isPhoneHashSuperAdmin(secondarySuperAdmin.hash), true);

    assert.equal(store.isPhoneHashAllowed(TEST_GUEST_HASH), false);
    assert.equal(store.isPhoneHashAdmin(TEST_GUEST_HASH), false);

    const diskText = readFileSync(statePath, 'utf8');
    assert.equal(/(?<!\d)1[3-9]\d{9}(?!\d)/.test(diskText), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('external CLI updates to state.json are synced automatically and created files are open-mode', () => {
  const { dir, statePath, storageRoot } = setupEnv();
  try {
    const serverStore = new DriveStore({ statePath, storageRoot, seedDefaultWhitelist: false });
    const cliStore = new DriveStore({ statePath, storageRoot, seedDefaultWhitelist: false });
    const created = cliStore.createAgentToken('cli-agent', 'CLI');
    cliStore.addWhitelistPhone(TEST_MEMBER_PHONE, 'CLI添加');

    assert.equal(serverStore.isPhoneHashAllowed(TEST_MEMBER_HASH), true);
    assert.ok(serverStore.verifyAgentToken(created.token));

    serverStore.writeFileBuffer('/open-dir/sample.txt', Buffer.from('shared-data'));
    const dirMode = statSync(join(storageRoot, 'open-dir')).mode & 0o777;
    const fileMode = statSync(join(storageRoot, 'open-dir', 'sample.txt')).mode & 0o777;
    assert.equal(dirMode, 0o777);
    assert.equal(fileMode, 0o666);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('path traversal, invalid moves, and symlink escapes are rejected', () => {
  const { dir, statePath, storageRoot } = setupEnv();
  try {
    const store = new DriveStore({ statePath, storageRoot });
    const secretFile = join(dir, 'outside-secret.txt');
    writeFileSync(secretFile, 'top-secret');
    symlinkSync(secretFile, join(storageRoot, 'escape-link.txt'));

    assert.throws(() => store.statEntry('../../etc/passwd'), err => err.code === 'INVALID_PATH');
    assert.throws(() => store.writeFileBuffer('../pwned.txt', Buffer.from('x')), err => err.code === 'INVALID_PATH');
    assert.throws(() => store.statEntry('/escape-link.txt'), err => err.code === 'INVALID_PATH');
    assert.throws(() => store.deleteEntry('/'), err => err.code === 'INVALID_PATH');

    store.ensureDirectory('/folder-a/sub');
    assert.throws(() => store.moveEntry('/folder-a', '/folder-a/sub/nested'), err => err.code === 'INVALID_MOVE');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('HTTP RBAC (admin vs member), unified native cloud drive operations, range, search, move, zip, and resize', async () => {
  const { dir, statePath, storageRoot } = setupEnv();
  const resizeCalls = [];

  const mockFb = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        url: req.url,
        fbrowserUser: req.headers['x-fbrowser-user'] || null,
        leakedShouyuHash: req.headers['x-shouyu-user-phone-hash'] || null,
      }),
    );
  });

  const store = new DriveStore({
    statePath,
    storageRoot,
    seedDefaultWhitelist: false,
    adminPhoneHashes: [TEST_ADMIN_HASH],
  });
  store.addWhitelistPhone(TEST_ADMIN_PHONE, '管理员');

  let appServer;
  try {
    const fbBase = await listenServer(mockFb);
    const handler = createDriveHttpHandler({
      store,
      filebrowserTarget: fbBase,
      filebrowserUser: 'shouyulove',
      allowedOrigins: ['https://shouyulove.cn'],
      resizeVolume: async sizeGb => {
        resizeCalls.push(sizeGb);
        return JSON.stringify({ ok: true, sizeGb });
      },
    });
    appServer = createServer(handler);
    const base = await listenServer(appServer);

    // 1. Portal HTML has zero jump links to /auth/ or /drive/files/, and admin entries are hidden by default
    const portalRes = await fetch(`${base}/drive/`);
    assert.equal(portalRes.status, 200);
    const portalHtml = await portalRes.text();
    assert.equal(portalHtml.includes('./app.js'), true);
    assert.equal(portalHtml.includes('./style.css'), true);
    assert.equal(portalHtml.includes('/auth/sdk.js'), true);
    assert.equal(portalHtml.includes('./auth-modal.css'), true);
    assert.equal(portalHtml.includes('id="drive-overview"'), true);
    assert.equal(/<a\b[^>]*href="\/auth\//i.test(portalHtml), false);
    assert.equal(portalHtml.includes('/drive/files/'), false);
    assert.equal(/<div[^>]*id="admin-nav"[^>]*hidden/i.test(portalHtml), true);
    assert.equal(/<dialog[^>]*id="admin-settings"/i.test(portalHtml), true);
    assert.equal(/<dialog[^>]*id="admin-settings"[^>]*\bopen\b/i.test(portalHtml), false);
    assert.equal(/\sstyle="/i.test(portalHtml), false);
    assert.equal(portalHtml.includes('__ASSET_VERSION__'), false);
    const assetVersion = /\.\/style\.css\?v=([0-9a-f]{10})"/.exec(portalHtml)?.[1];
    assert.ok(assetVersion);
    assert.equal(portalHtml.includes(`./app.js?v=${assetVersion}`), true);
    assert.equal(portalHtml.includes(`./logo.svg?v=${assetVersion}`), true);

    const cssText = await (await fetch(`${base}/drive/style.css`)).text();
    assert.equal(cssText.includes('--paper: #fbfaf6'), true);
    assert.equal(cssText.includes('--pine: #23332c'), true);
    assert.equal(cssText.includes('color-scheme: only light'), true);
    assert.equal(cssText.includes('__ASSET_VERSION__'), false);
    assert.equal(cssText.includes(`./hos-ui-regular.woff2?v=${assetVersion}`), true);
    const versionedCss = await fetch(`${base}/drive/style.css?v=${assetVersion}`);
    assert.equal(versionedCss.status, 200);
    assert.equal(cssText.includes('font-display: block'), true);

    for (const fontFile of [
      'google-sans-flex-latin.woff2',
      'hos-ui-regular.woff2',
      'hos-ui-medium.woff2',
      'hos-ui-bold.woff2',
    ]) {
      const fontRes = await fetch(`${base}/drive/${fontFile}`);
      assert.equal(fontRes.status, 200);
      assert.equal(fontRes.headers.get('content-type'), 'font/woff2');
    }

    // 2. Admin headers vs Member headers vs Denied headers
    const adminHeaders = {
      'X-Shouyu-From-Nginx': '1',
      'X-Shouyu-User-Id': 'usr_admin',
      'X-Shouyu-User-Phone': '139****0001',
      'X-Shouyu-User-Phone-Hash': TEST_ADMIN_HASH,
    };
    const memberHeaders = {
      'X-Shouyu-From-Nginx': '1',
      'X-Shouyu-User-Id': 'usr_member',
      'X-Shouyu-User-Phone': '138****8000',
      'X-Shouyu-User-Phone-Hash': TEST_MEMBER_HASH,
    };

    // Admin adds TEST_MEMBER_PHONE to whitelist
    const addRes = await fetch(`${base}/drive/api/whitelist/add`, {
      method: 'POST',
      headers: {
        ...adminHeaders,
        Origin: 'https://shouyulove.cn',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone: TEST_MEMBER_PHONE, note: '组内成员' }),
    });
    assert.equal(addRes.status, 200);

    // 3. Admin receives isAdmin: true + whitelist + tokens; Member receives allowed: true, isAdmin: false, NO whitelist/tokens!
    const adminState = await (await fetch(`${base}/drive/api/state`, { headers: adminHeaders })).json();
    assert.equal(adminState.allowed, true);
    assert.equal(adminState.isAdmin, true);
    assert.equal(Array.isArray(adminState.whitelist), true);
    assert.equal(Array.isArray(adminState.tokens), true);

    const memberState = await (await fetch(`${base}/drive/api/state`, { headers: memberHeaders })).json();
    assert.equal(memberState.allowed, true);
    assert.equal(memberState.isAdmin, false);
    assert.equal('whitelist' in memberState, false);
    assert.equal('tokens' in memberState, false);
    assert.equal(Array.isArray(memberState.rootFiles), true);

    // 4. Member is strictly blocked (403 ADMIN_ONLY) from all admin endpoints!
    for (const [ep, payload] of [
      ['/drive/api/whitelist/add', { phone: TEST_GUEST_PHONE }],
      ['/drive/api/whitelist/remove', { hash: TEST_ADMIN_HASH }],
      ['/drive/api/tokens/create', { name: 'rogue' }],
      ['/drive/api/tokens/revoke', { id: '123' }],
      ['/drive/api/storage/resize', { sizeGb: 120 }],
    ]) {
      const forbidden = await fetch(`${base}${ep}`, {
        method: 'POST',
        headers: {
          ...memberHeaders,
          Origin: 'https://shouyulove.cn',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      assert.equal(forbidden.status, 403);
      assert.equal((await forbidden.json()).code, 'ADMIN_ONLY');
    }

    // 5. Regular whitelisted member CAN perform all cloud drive file operations (mkdir, upload, read, range, rename/move, search, zip, delete)!
    const memberOriginHeaders = {
      ...memberHeaders,
      Origin: 'https://shouyulove.cn',
    };

    const mkRes = await fetch(`${base}/drive/api/agent/mkdir`, {
      method: 'POST',
      headers: { ...memberOriginHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: '/课程资料/2026春' }),
    });
    assert.equal(mkRes.status, 200);

    const upRes = await fetch(`${base}/drive/api/agent/write?path=${encodeURIComponent('/课程资料/2026春/手语讲义.md')}`, {
      method: 'PUT',
      headers: { ...memberOriginHeaders, 'Content-Type': 'application/octet-stream' },
      body: '第一章：手语基础问候语',
    });
    assert.equal(upRes.status, 200);

    // Subdirectory listing
    const subTree = await (
      await fetch(`${base}/drive/api/agent/tree?path=${encodeURIComponent('/课程资料/2026春')}`, {
        headers: memberHeaders,
      })
    ).json();
    assert.equal(subTree.items.length, 1);
    assert.equal(subTree.items[0].name, '手语讲义.md');

    // Global recursive search finds nested file
    const searchRes = await (
      await fetch(`${base}/drive/api/agent/search?q=${encodeURIComponent('讲义')}`, {
        headers: memberHeaders,
      })
    ).json();
    assert.equal(searchRes.items.length, 1);
    assert.equal(searchRes.items[0].parentPath, '/课程资料/2026春');

    // Byte-Range request returns 206 Partial Content
    const rangeRes = await fetch(
      `${base}/drive/api/agent/read?path=${encodeURIComponent('/课程资料/2026春/手语讲义.md')}`,
      {
        headers: { ...memberHeaders, Range: 'bytes=0-8' },
      },
    );
    assert.equal(rangeRes.status, 206);
    assert.equal((await rangeRes.arrayBuffer()).byteLength, 9);

    // Rename / Move
    const moveRes = await fetch(`${base}/drive/api/agent/move`, {
      method: 'POST',
      headers: { ...memberOriginHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: '/课程资料/2026春/手语讲义.md',
        to: '/课程资料/2026春/手语讲义-修订版.md',
      }),
    });
    assert.equal(moveRes.status, 200);

    // Folder ZIP streaming archive download
    const zipRes = await fetch(`${base}/drive/api/agent/zip?path=${encodeURIComponent('/课程资料')}`, {
      headers: memberHeaders,
    });
    assert.equal(zipRes.status, 200);
    assert.equal(zipRes.headers.get('content-type'), 'application/zip');
    const zipBuf = Buffer.from(await zipRes.arrayBuffer());
    assert.equal(zipBuf.readUInt32LE(0), 0x04034b50);
    assert.equal(zipBuf.includes(Buffer.from('手语讲义-修订版.md', 'utf8')), true);
    assert.equal(zipBuf.readUInt32LE(zipBuf.length - 22), 0x06054b50);

    // Legacy browser /drive/files/ redirects directly into unified /drive/
    const legacyBrowser = await fetch(`${base}/drive/files/files/%E8%AF%BE%E7%A8%8B%E8%B5%84%E6%96%99`, {
      headers: { ...memberHeaders, Accept: 'text/html' },
      redirect: 'manual',
    });
    assert.equal(legacyBrowser.status, 302);
    assert.equal(legacyBrowser.headers.get('location'), '/drive/?dir=%2F%E8%AF%BE%E7%A8%8B%E8%B5%84%E6%96%99');

    // Direct local loopback program on server reads & writes without any token or cookie
    const localWrite = await fetch(`${base}/drive/api/agent/write?path=/server-prog-out.txt`, {
      method: 'PUT',
      body: 'generated-by-local-program',
    });
    assert.equal(localWrite.status, 200);
    const localRead = await fetch(`${base}/drive/api/agent/read?path=/server-prog-out.txt`);
    assert.equal(await localRead.text(), 'generated-by-local-program');

    // Batch delete by member
    const batchDel = await fetch(`${base}/drive/api/agent/delete`, {
      method: 'POST',
      headers: { ...memberOriginHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths: ['/课程资料', '/server-prog-out.txt'] }),
    });
    assert.equal(batchDel.status, 200);

    // 6. Admin resize & token lifecycle still work
    const validResize = await fetch(`${base}/drive/api/storage/resize`, {
      method: 'POST',
      headers: {
        ...adminHeaders,
        Origin: 'https://shouyulove.cn',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sizeGb: 100 }),
    });
    assert.equal(validResize.status, 200);
    assert.deepEqual(resizeCalls, [100]);
  } finally {
    if (appServer) appServer.close();
    mockFb.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test('legacy state auto-upgrades 152****6060, X-Shouyu-User-Role and /api/whitelist/role work end to end', async () => {
  const { dir, statePath, storageRoot } = setupEnv();
  let appServer;
  try {
    writeFileSync(
      statePath,
      `${JSON.stringify({
        version: 1,
        targetGb: 100,
        whitelist: [
          { hash: SUPER_ADMIN_PHONE_HASHES[0], masked: '191****0323', role: 'admin', note: '管理员', addedAt: '2026-11-14T00:00:00.000Z' },
          { hash: SUPER_ADMIN_PHONE_HASHES[1], masked: '152****6060', role: 'user', note: '授权成员', addedAt: '2026-11-14T00:00:00.000Z' },
        ],
        agentTokens: [],
      }, null, 2)}\n`,
      'utf8',
    );

    const store = new DriveStore({ statePath, storageRoot });
    const upgraded = store.listWhitelist();
    const super0 = upgraded.find(item => item.hash === SUPER_ADMIN_PHONE_HASHES[0]);
    const super1 = upgraded.find(item => item.hash === SUPER_ADMIN_PHONE_HASHES[1]);
    assert.equal(super0?.role, 'super_admin');
    assert.equal(super0?.note, '超级管理员');
    assert.equal(super1?.role, 'super_admin');
    assert.equal(super1?.note, '超级管理员');

    store.addWhitelistPhone(TEST_MEMBER_PHONE, '协作同学');

    const handler = createDriveHttpHandler({
      store,
      filebrowserTarget: 'http://127.0.0.1:1',
      filebrowserUser: 'shouyulove',
      filebrowserPassword: 'test-password',
      resizer: async gb => gb,
    });
    appServer = createServer(handler);
    const base = await listenServer(appServer);

    const superHeaders = {
      'X-Shouyu-From-Nginx': '1',
      'X-Shouyu-User-Id': 'u_super_2',
      'X-Shouyu-User-Phone': '152****6060',
      'X-Shouyu-User-Phone-Hash': SUPER_ADMIN_PHONE_HASHES[1],
      'X-Shouyu-User-Role': 'super_admin',
      Origin: 'https://shouyulove.cn',
      'Content-Type': 'application/json',
    };
    const memberPlainHeaders = {
      'X-Shouyu-From-Nginx': '1',
      'X-Shouyu-User-Id': 'u_member_1',
      'X-Shouyu-User-Phone': '138****8000',
      'X-Shouyu-User-Phone-Hash': TEST_MEMBER_HASH,
    };
    const memberScopedAdminHeaders = {
      ...memberPlainHeaders,
      'X-Shouyu-User-Role': 'admin',
    };

    const plainState = await (await fetch(`${base}/drive/api/state`, { headers: memberPlainHeaders })).json();
    assert.equal(plainState.allowed, true);
    assert.equal(plainState.role, 'user');
    assert.equal(plainState.isAdmin, false);
    assert.equal(plainState.isSuperAdmin, false);
    assert.equal(plainState.whitelist, undefined);

    const scopedAdminState = await (await fetch(`${base}/drive/api/state`, { headers: memberScopedAdminHeaders })).json();
    assert.equal(scopedAdminState.allowed, true);
    assert.equal(scopedAdminState.role, 'admin');
    assert.equal(scopedAdminState.isAdmin, true);
    assert.equal(scopedAdminState.isSuperAdmin, false);
    assert.equal(Array.isArray(scopedAdminState.whitelist), true);

    const promoteRes = await fetch(`${base}/drive/api/whitelist/role`, {
      method: 'POST',
      headers: superHeaders,
      body: JSON.stringify({ hash: TEST_MEMBER_HASH, role: 'admin' }),
    });
    assert.equal(promoteRes.status, 200);
    const promoteJson = await promoteRes.json();
    const promotedEntry = promoteJson.whitelist.find(item => item.hash === TEST_MEMBER_HASH);
    assert.equal(promotedEntry?.role, 'admin');
    assert.equal(promotedEntry?.isAdmin, true);
    assert.equal(promotedEntry?.isSuperAdmin, false);

    const afterPromoteState = await (await fetch(`${base}/drive/api/state`, { headers: memberPlainHeaders })).json();
    assert.equal(afterPromoteState.role, 'admin');
    assert.equal(afterPromoteState.isAdmin, true);

    const rejectSuperDemote = await fetch(`${base}/drive/api/whitelist/role`, {
      method: 'POST',
      headers: { ...memberScopedAdminHeaders, Origin: 'https://shouyulove.cn', 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash: SUPER_ADMIN_PHONE_HASHES[1], role: 'user' }),
    });
    assert.equal(rejectSuperDemote.status, 400);
    const rejectJson = await rejectSuperDemote.json();
    assert.equal(rejectJson.code, 'CANNOT_CHANGE_SUPER_ADMIN');

    const demoteRes = await fetch(`${base}/drive/api/whitelist/role`, {
      method: 'POST',
      headers: superHeaders,
      body: JSON.stringify({ hash: TEST_MEMBER_HASH, role: 'user' }),
    });
    assert.equal(demoteRes.status, 200);
    const afterDemoteState = await (await fetch(`${base}/drive/api/state`, { headers: memberPlainHeaders })).json();
    assert.equal(afterDemoteState.role, 'user');
    assert.equal(afterDemoteState.isAdmin, false);
  } finally {
    if (appServer) appServer.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
