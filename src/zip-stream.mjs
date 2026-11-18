import { constants, createReadStream } from 'node:fs';
import { lstat, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { crc32 } from 'node:zlib';
import { DriveError } from './drive-store.mjs';

const MAX_ENTRIES = 10000;
const ZIP32_MAX = 0xffffffff;

function toDosDateTime(mtimeMs) {
  const d = new Date(mtimeMs);
  const year = Math.max(1980, Math.min(2107, d.getFullYear()));
  return {
    date: ((year - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
    time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
  };
}

async function writeChunk(writable, buffer) {
  if (writable.destroyed || writable.writableEnded) throw new Error('Download closed');
  if (writable.write(buffer)) return;
  await new Promise((resolve, reject) => {
    const finish = error => {
      writable.off('drain', drained);
      writable.off('close', closed);
      writable.off('error', finish);
      if (error) reject(error);
      else resolve();
    };
    const drained = () => finish();
    const closed = () => finish(new Error('Download closed'));
    writable.once('drain', drained);
    writable.once('close', closed);
    writable.once('error', finish);
  });
}

async function collectEntries(absPath, archiveName, entries, writable) {
  if (writable.destroyed) throw new Error('Download closed');
  const st = await lstat(absPath);
  const directory = st.isDirectory();
  if (!directory && !st.isFile()) return;
  const name = directory && archiveName ? archiveName + '/' : archiveName;
  if (name) {
    if (entries.length >= MAX_ENTRIES) {
      throw new DriveError('ZIP_ENTRY_LIMIT', '一次最多打包 10000 个文件和文件夹，请分批下载。', 413);
    }
    entries.push({
      absPath, directory, name: Buffer.from(name, 'utf8'),
      size: directory ? 0 : st.size, ...toDosDateTime(st.mtimeMs),
    });
  }
  if (directory) {
    const children = (await readdir(absPath)).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
    for (const child of children) {
      if (child !== 'lost+found') await collectEntries(join(absPath, child), name + child, entries, writable);
    }
  }
}

function zip64Extra(values) {
  const extra = Buffer.alloc(4 + 8 * values.length);
  extra.writeUInt16LE(1, 0);
  extra.writeUInt16LE(extra.length - 4, 2);
  values.forEach((value, index) => extra.writeBigUInt64LE(BigInt(value), 4 + index * 8));
  return extra;
}

function localHeader(entry, zip64) {
  const extra = zip64 ? zip64Extra([entry.size, entry.size]) : Buffer.alloc(0);
  const header = Buffer.alloc(30 + entry.name.length + extra.length);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(zip64 ? 45 : 20, 4);
  header.writeUInt16LE(entry.directory ? 0x0800 : 0x0808, 6);
  header.writeUInt16LE(entry.time, 10);
  header.writeUInt16LE(entry.date, 12);
  header.writeUInt32LE(zip64 ? ZIP32_MAX : 0, 18);
  header.writeUInt32LE(zip64 ? ZIP32_MAX : 0, 22);
  header.writeUInt16LE(entry.name.length, 26);
  header.writeUInt16LE(extra.length, 28);
  entry.name.copy(header, 30);
  extra.copy(header, 30 + entry.name.length);
  return header;
}

function descriptor(entry, zip64) {
  const header = Buffer.alloc(zip64 ? 24 : 16);
  header.writeUInt32LE(0x08074b50, 0);
  header.writeUInt32LE(entry.crc, 4);
  if (zip64) {
    header.writeBigUInt64LE(BigInt(entry.size), 8);
    header.writeBigUInt64LE(BigInt(entry.size), 16);
  } else {
    header.writeUInt32LE(entry.size, 8);
    header.writeUInt32LE(entry.size, 12);
  }
  return header;
}

function centralHeader(entry, zip64) {
  const extra = zip64 ? zip64Extra([entry.size, entry.size, entry.offset]) : Buffer.alloc(0);
  const header = Buffer.alloc(46 + entry.name.length + extra.length);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(zip64 ? 45 : 20, 4);
  header.writeUInt16LE(zip64 ? 45 : 20, 6);
  header.writeUInt16LE(entry.directory ? 0x0800 : 0x0808, 8);
  header.writeUInt16LE(entry.time, 12);
  header.writeUInt16LE(entry.date, 14);
  header.writeUInt32LE(entry.crc, 16);
  header.writeUInt32LE(zip64 ? ZIP32_MAX : entry.size, 20);
  header.writeUInt32LE(zip64 ? ZIP32_MAX : entry.size, 24);
  header.writeUInt16LE(entry.name.length, 28);
  header.writeUInt16LE(extra.length, 30);
  header.writeUInt32LE(entry.directory ? 0x10 : 0, 38);
  header.writeUInt32LE(zip64 ? ZIP32_MAX : entry.offset, 42);
  entry.name.copy(header, 46);
  extra.copy(header, 46 + entry.name.length);
  return header;
}

function endRecords(count, centralStart, centralSize, zip64) {
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(count, 8);
  end.writeUInt16LE(count, 10);
  end.writeUInt32LE(zip64 ? ZIP32_MAX : centralSize, 12);
  end.writeUInt32LE(zip64 ? ZIP32_MAX : centralStart, 16);
  if (!zip64) return end;

  const record = Buffer.alloc(56);
  record.writeUInt32LE(0x06064b50, 0);
  record.writeBigUInt64LE(44n, 4);
  record.writeUInt16LE(45, 12);
  record.writeUInt16LE(45, 14);
  record.writeBigUInt64LE(BigInt(count), 24);
  record.writeBigUInt64LE(BigInt(count), 32);
  record.writeBigUInt64LE(BigInt(centralSize), 40);
  record.writeBigUInt64LE(BigInt(centralStart), 48);
  const locator = Buffer.alloc(20);
  locator.writeUInt32LE(0x07064b50, 0);
  locator.writeBigUInt64LE(BigInt(centralStart + centralSize), 8);
  locator.writeUInt32LE(1, 16);
  return Buffer.concat([record, locator, end]);
}

/** Call onReady only after all selected entries and their transfer length are known. */
export async function streamZipArchive(writable, targets, onReady = () => {}) {
  const entries = [];
  for (const target of targets) {
    await collectEntries(target.absPath, target.archiveName, entries, writable);
  }
  // ZIP32 local header (30), central header (46), optional data descriptor (16), trailer (22).
  const classicSize = 22 + entries.reduce((sum, e) =>
    sum + 76 + e.name.length * 2 + e.size + (e.directory ? 0 : 16), 0);
  const zip64 = classicSize >= ZIP32_MAX;
  // ZIP64 adds 20 local and 28 central bytes per entry, 8 per descriptor and a 76-byte trailer.
  const length = zip64 ? classicSize + 76 + entries.reduce((sum, e) => sum + 48 + (e.directory ? 0 : 8), 0) : classicSize;
  onReady(length);

  let offset = 0;
  for (const entry of entries) {
    entry.offset = offset;
    entry.crc = 0;
    const header = localHeader(entry, zip64);
    await writeChunk(writable, header);
    offset += header.length;
    if (entry.directory) continue;
    let bytes = 0;
    const file = createReadStream(entry.absPath, { flags: constants.O_RDONLY | constants.O_NOFOLLOW });
    for await (const chunk of file) {
      bytes += chunk.length;
      if (bytes > entry.size) throw new Error('File grew during download');
      entry.crc = crc32(chunk, entry.crc) >>> 0;
      await writeChunk(writable, chunk);
    }
    if (bytes !== entry.size) throw new Error('File size changed during download');
    const trailer = descriptor(entry, zip64);
    await writeChunk(writable, trailer);
    offset += bytes + trailer.length;
  }

  const centralStart = offset;
  for (const entry of entries) {
    const header = centralHeader(entry, zip64);
    await writeChunk(writable, header);
    offset += header.length;
  }
  await writeChunk(writable, endRecords(entries.length, centralStart, offset - centralStart, zip64));
  writable.end();
}
