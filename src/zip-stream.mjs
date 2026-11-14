import { createReadStream, lstatSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { crc32 } from 'node:zlib';

function toDosDateTime(mtimeMs) {
  const d = new Date(Number.isFinite(mtimeMs) && mtimeMs > 0 ? mtimeMs : Date.now());
  const year = Math.max(1980, Math.min(2107, d.getFullYear()));
  const dosDate = ((year - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  const dosTime = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  return { dosDate, dosTime };
}

function writeChunk(writable, buf) {
  if (writable.destroyed || writable.writableEnded) return Promise.resolve();
  if (writable.write(buf)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const onDrain = () => {
      cleanup();
      resolve();
    };
    const onErr = err => {
      cleanup();
      reject(err);
    };
    const cleanup = () => {
      writable.off('drain', onDrain);
      writable.off('error', onErr);
    };
    writable.once('drain', onDrain);
    writable.once('error', onErr);
  });
}

function collectArchiveEntries(absTarget, archivePrefix, out, maxFiles = 10000) {
  if (out.length >= maxFiles) return;
  let lst;
  try {
    lst = lstatSync(absTarget);
  } catch {
    return;
  }
  if (lst.isSymbolicLink()) return;

  if (lst.isFile()) {
    out.push({
      type: 'file',
      absPath: absTarget,
      zipPath: archivePrefix,
      mtimeMs: lst.mtimeMs,
    });
    return;
  }

  if (lst.isDirectory()) {
    const dirZipPath = archivePrefix ? (archivePrefix.endsWith('/') ? archivePrefix : `${archivePrefix}/`) : '';
    if (dirZipPath) {
      out.push({
        type: 'dir',
        absPath: absTarget,
        zipPath: dirZipPath,
        mtimeMs: lst.mtimeMs,
      });
    }
    let names = [];
    try {
      names = readdirSync(absTarget).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
    } catch {
      return;
    }
    for (const name of names) {
      if (name === 'lost+found') continue;
      if (out.length >= maxFiles) break;
      const childPrefix = dirZipPath ? `${dirZipPath}${name}` : name;
      collectArchiveEntries(join(absTarget, name), childPrefix, out, maxFiles);
    }
  }
}

/**
 * Stream one or more resolved drive targets ({ absPath, archiveName }) as a standard UTF-8 ZIP archive.
 */
export async function streamZipArchive(writable, targets) {
  const entries = [];
  for (const target of targets) {
    collectArchiveEntries(target.absPath, target.archiveName, entries);
  }

  const centralRecords = [];
  let offset = 0;

  for (const item of entries) {
    if (writable.destroyed) return;
    const nameBytes = Buffer.from(item.zipPath.replaceAll('\\', '/'), 'utf8');
    const { dosDate, dosTime } = toDosDateTime(item.mtimeMs);
    const localHeaderOffset = offset;

    if (item.type === 'dir') {
      const flags = 0x0800; // UTF-8
      const lfh = Buffer.alloc(30 + nameBytes.length);
      lfh.writeUInt32LE(0x04034b50, 0);
      lfh.writeUInt16LE(20, 4);
      lfh.writeUInt16LE(flags, 6);
      lfh.writeUInt16LE(0, 8);
      lfh.writeUInt16LE(dosTime, 10);
      lfh.writeUInt16LE(dosDate, 12);
      lfh.writeUInt32LE(0, 14);
      lfh.writeUInt32LE(0, 18);
      lfh.writeUInt32LE(0, 22);
      lfh.writeUInt16LE(nameBytes.length, 26);
      lfh.writeUInt16LE(0, 28);
      nameBytes.copy(lfh, 30);

      await writeChunk(writable, lfh);
      offset += lfh.length;

      centralRecords.push({
        nameBytes,
        flags,
        dosTime,
        dosDate,
        crc: 0,
        size: 0,
        localHeaderOffset,
        externalAttr: 0x10, // DOS directory attribute
      });
      continue;
    }

    // Streaming file with Data Descriptor (bit 3) + UTF-8 (bit 11)
    const flags = 0x0808;
    const lfh = Buffer.alloc(30 + nameBytes.length);
    lfh.writeUInt32LE(0x04034b50, 0);
    lfh.writeUInt16LE(20, 4);
    lfh.writeUInt16LE(flags, 6);
    lfh.writeUInt16LE(0, 8);
    lfh.writeUInt16LE(dosTime, 10);
    lfh.writeUInt16LE(dosDate, 12);
    lfh.writeUInt32LE(0, 14);
    lfh.writeUInt32LE(0, 18);
    lfh.writeUInt32LE(0, 22);
    lfh.writeUInt16LE(nameBytes.length, 26);
    lfh.writeUInt16LE(0, 28);
    nameBytes.copy(lfh, 30);

    await writeChunk(writable, lfh);
    offset += lfh.length;

    let runningCrc = 0;
    let fileSize = 0;
    const rs = createReadStream(item.absPath);
    for await (const chunk of rs) {
      if (writable.destroyed) {
        rs.destroy();
        return;
      }
      runningCrc = crc32(chunk, runningCrc) >>> 0;
      fileSize += chunk.length;
      await writeChunk(writable, chunk);
      offset += chunk.length;
    }

    const size32 = fileSize >>> 0;
    const dd = Buffer.alloc(16);
    dd.writeUInt32LE(0x08074b50, 0);
    dd.writeUInt32LE(runningCrc, 4);
    dd.writeUInt32LE(size32, 8);
    dd.writeUInt32LE(size32, 12);
    await writeChunk(writable, dd);
    offset += dd.length;

    centralRecords.push({
      nameBytes,
      flags,
      dosTime,
      dosDate,
      crc: runningCrc,
      size: size32,
      localHeaderOffset,
      externalAttr: 0x00,
    });
  }

  const centralStart = offset;
  for (const rec of centralRecords) {
    const cdh = Buffer.alloc(46 + rec.nameBytes.length);
    cdh.writeUInt32LE(0x02014b50, 0);
    cdh.writeUInt16LE(20, 4); // version made by
    cdh.writeUInt16LE(20, 6); // version needed
    cdh.writeUInt16LE(rec.flags, 8);
    cdh.writeUInt16LE(0, 10); // method: store
    cdh.writeUInt16LE(rec.dosTime, 12);
    cdh.writeUInt16LE(rec.dosDate, 14);
    cdh.writeUInt32LE(rec.crc, 16);
    cdh.writeUInt32LE(rec.size, 20);
    cdh.writeUInt32LE(rec.size, 24);
    cdh.writeUInt16LE(rec.nameBytes.length, 28);
    cdh.writeUInt16LE(0, 30); // extra len
    cdh.writeUInt16LE(0, 32); // comment len
    cdh.writeUInt16LE(0, 34); // disk number start
    cdh.writeUInt16LE(0, 36); // internal file attrs
    cdh.writeUInt32LE(rec.externalAttr, 38);
    cdh.writeUInt32LE(rec.localHeaderOffset >>> 0, 42);
    rec.nameBytes.copy(cdh, 46);

    await writeChunk(writable, cdh);
    offset += cdh.length;
  }

  const centralSize = offset - centralStart;
  const count16 = Math.min(0xffff, centralRecords.length);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(count16, 8);
  eocd.writeUInt16LE(count16, 10);
  eocd.writeUInt32LE(centralSize >>> 0, 12);
  eocd.writeUInt32LE(centralStart >>> 0, 16);
  eocd.writeUInt16LE(0, 20);

  await writeChunk(writable, eocd);
  if (!writable.writableEnded && !writable.destroyed) {
    writable.end();
  }
}
