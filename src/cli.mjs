#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { DriveStore } from './drive-store.mjs';

const stateDir = process.env.DRIVE_STATE_DIR || '/var/lib/shouyulove-drive';
const storageRoot = process.env.DRIVE_STORAGE_ROOT || '/srv/shouyulove-drive/files';
const resizeScript = process.env.DRIVE_RESIZE_CMD || '/usr/local/sbin/shouyulove-drive-resize';

function parseFlags(argv) {
  const flags = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (argv[i + 1] && !argv[i + 1].startsWith('--')) {
        flags[key] = argv[++i];
      } else {
        flags[key] = true;
      }
    } else {
      flags._.push(arg);
    }
  }
  return flags;
}

function printUsage() {
  console.log(`心创云盘管理工具 (shouyulove-drive-cli)

用法:
  shouyulove-drive-cli status
  shouyulove-drive-cli whitelist list
  shouyulove-drive-cli whitelist add <phone> [--note <备注>]
  shouyulove-drive-cli whitelist remove <phone_or_hash> [--force]
  shouyulove-drive-cli token list
  shouyulove-drive-cli token create --name <名称>
  shouyulove-drive-cli token revoke --id <id>
  shouyulove-drive-cli resize <size_gb>`);
}

function main() {
  const args = parseFlags(process.argv.slice(2));
  const [group, sub, arg3] = args._;

  if (!group || group === 'help' || args.help) {
    printUsage();
    return;
  }

  if (group === 'resize') {
    const targetGb = Number(sub || args.gb);
    if (!Number.isInteger(targetGb) || targetGb < 1 || targetGb > 2000) {
      throw new Error('请指定整数容量（GB），例如: shouyulove-drive-cli resize 100');
    }
    const output = execFileSync(resizeScript, [String(targetGb)], { encoding: 'utf8' });
    console.log(output.trim());
    return;
  }

  const store = new DriveStore({
    statePath: join(stateDir, 'state.json'),
    storageRoot,
  });

  if (group === 'status') {
    console.log(
      JSON.stringify(
        {
          storage: store.getStorageStats(),
          whitelistCount: store.listWhitelist().length,
          whitelist: store.listWhitelist().map(x => ({ masked: x.masked, role: x.role, note: x.note })),
          agentTokens: store.listAgentTokens().length,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (group === 'whitelist') {
    if (sub === 'list') {
      console.log(JSON.stringify(store.listWhitelist(), null, 2));
      return;
    }
    if (sub === 'add') {
      const phone = arg3 || args.phone;
      const result = store.addWhitelistPhone(phone, args.note || '');
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    if (sub === 'remove') {
      const target = arg3 || args.phone || args.hash;
      const removed = store.removeWhitelistEntry(target, { allowEmpty: Boolean(args.force) });
      console.log(JSON.stringify({ removed }, null, 2));
      return;
    }
  }

  if (group === 'token') {
    if (sub === 'list') {
      console.log(JSON.stringify(store.listAgentTokens(), null, 2));
      return;
    }
    if (sub === 'create') {
      const created = store.createAgentToken(args.name || arg3 || 'CLI Agent Token', 'CLI');
      console.log(JSON.stringify(created, null, 2));
      return;
    }
    if (sub === 'revoke') {
      const revoked = store.revokeAgentToken(args.id || arg3);
      console.log(JSON.stringify({ revoked }, null, 2));
      return;
    }
  }

  printUsage();
  process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(error?.message || String(error));
  process.exit(1);
}
