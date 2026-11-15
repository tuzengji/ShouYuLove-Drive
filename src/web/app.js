(() => {
  const driveBase = document.body.dataset.driveBase || '/drive';
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const TEXT_EXTS = new Set([
    '.txt', '.md', '.markdown', '.json', '.jsonl', '.yaml', '.yml', '.toml', '.ini', '.conf',
    '.csv', '.tsv', '.log', '.xml', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.vue',
    '.py', '.sh', '.bash', '.zsh', '.sql', '.c', '.cpp', '.h', '.hpp', '.rs', '.go', '.java',
    '.kt', '.swift', '.rb', '.php', '.r', '.tex', '.bib', '.html', '.css', '.scss', '.env',
    '.gitignore', '.dockerfile',
  ]);
  const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.bmp', '.ico', '.avif']);
  const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov', '.m4v']);
  const AUDIO_EXTS = new Set(['.mp3', '.wav', '.m4a', '.ogg', '.flac']);

  const els = {
    heroSection: document.getElementById('hero-section'),
    navStatusDot: document.getElementById('nav-status-dot'),
    navAccount: document.getElementById('nav-account-text'),
    navLogin: document.getElementById('nav-login-btn'),
    navSwitch: document.getElementById('nav-switch-btn'),
    navLogout: document.getElementById('nav-logout-btn'),
    guestLogin: document.getElementById('guest-login-btn'),
    errorLogin: document.getElementById('error-login-btn'),
    deniedSwitch: document.getElementById('denied-switch-btn'),
    verifiedRoleText: document.getElementById('verified-role-text'),
    overviewUsagePct: document.getElementById('overview-usage-pct'),
    overviewExpandBtn: document.getElementById('overview-expand-btn'),
    overviewMeter: document.getElementById('overview-meter'),
    overviewUsed: document.getElementById('overview-used'),
    overviewAvail: document.getElementById('overview-avail'),
    overviewTotal: document.getElementById('overview-total'),
    overviewFileCount: document.getElementById('overview-file-count'),
    overviewDirCount: document.getElementById('overview-dir-count'),
    overviewSyncDot: document.getElementById('overview-sync-dot'),
    overviewUpdatedText: document.getElementById('overview-updated-text'),
    adminDrawer: document.getElementById('admin-settings-drawer'),
    quotaSummaryLine: document.getElementById('quota-summary-line'),
    quotaProgress: document.getElementById('quota-progress'),
    notice: document.getElementById('drive-notice'),
    viewError: document.getElementById('view-error'),
    errorDesc: document.getElementById('error-desc'),
    retryLoadBtn: document.getElementById('retry-load-btn'),
    viewGuest: document.getElementById('view-guest'),
    guestBento: document.getElementById('guest-bento'),
    viewDenied: document.getElementById('view-denied'),
    heroConsoleActions: document.getElementById('hero-console-actions'),
    viewConsole: document.getElementById('view-console'),
    deniedPhone: document.getElementById('denied-phone'),
    deniedLogout: document.getElementById('denied-logout-btn'),
    consolePhone: document.getElementById('console-phone'),
    quickUploadLabel: document.getElementById('quick-upload-label'),
    quickUploadInput: document.getElementById('quick-upload-input'),
    quickUploadText: document.getElementById('quick-upload-text'),
    dirUploadLabel: document.getElementById('dir-upload-label'),
    dirUploadInput: document.getElementById('dir-upload-input'),
    quickRefresh: document.getElementById('quick-refresh-btn'),
    driveDropzone: document.getElementById('drive-dropzone'),
    dropzoneBanner: document.getElementById('dropzone-banner'),
    dropzoneBannerText: document.getElementById('dropzone-banner-text'),
    navUpBtn: document.getElementById('nav-up-btn'),
    breadcrumbs: document.getElementById('drive-breadcrumbs'),
    rootFilesCount: document.getElementById('root-files-count'),
    newFolderBtn: document.getElementById('new-folder-btn'),
    newDocBtn: document.getElementById('new-doc-btn'),
    zipDirBtn: document.getElementById('zip-dir-btn'),
    fileFilterInput: document.getElementById('file-filter-input'),
    sortSelect: document.getElementById('sort-select'),
    uploadProgressBox: document.getElementById('upload-progress-box'),
    uploadProgressText: document.getElementById('upload-progress-text'),
    uploadProgressPct: document.getElementById('upload-progress-pct'),
    uploadProgressBar: document.getElementById('upload-progress-bar'),
    batchBar: document.getElementById('batch-bar'),
    batchCountText: document.getElementById('batch-count-text'),
    batchZipBtn: document.getElementById('batch-zip-btn'),
    batchDeleteBtn: document.getElementById('batch-delete-btn'),
    batchClearBtn: document.getElementById('batch-clear-btn'),
    fileTableHead: document.getElementById('file-table-head'),
    selectAllCheckbox: document.getElementById('select-all-checkbox'),
    rootFilesEmpty: document.getElementById('root-files-empty'),
    rootFilesFilterEmpty: document.getElementById('root-files-filter-empty'),
    clearFilterBtn: document.getElementById('clear-filter-btn'),
    rootFilesList: document.getElementById('root-files-list'),
    resizeCurrentGb: document.getElementById('resize-current-gb'),
    resizeForm: document.getElementById('resize-form'),
    resizeGbInput: document.getElementById('resize-gb-input'),
    resizeSubmitBtn: document.getElementById('resize-submit-btn'),
    whitelistCount: document.getElementById('whitelist-count'),
    whitelistForm: document.getElementById('whitelist-form'),
    wlPhoneInput: document.getElementById('wl-phone-input'),
    wlNoteInput: document.getElementById('wl-note-input'),
    whitelistList: document.getElementById('whitelist-list'),
    tokenForm: document.getElementById('token-form'),
    tokenNameInput: document.getElementById('token-name-input'),
    issuedTokenBox: document.getElementById('issued-token-box'),
    issuedTokenVal: document.getElementById('issued-token-val'),
    copyTokenBtn: document.getElementById('copy-token-btn'),
    closeTokenBtn: document.getElementById('close-token-btn'),
    tokenList: document.getElementById('token-list'),
    agentCodePre: document.getElementById('agent-code-pre'),
    copyAgentCodeBtn: document.getElementById('copy-agent-code-btn'),
    previewModal: document.getElementById('file-preview-modal'),
    previewModalTitle: document.getElementById('preview-modal-title'),
    previewModalMeta: document.getElementById('preview-modal-meta'),
    previewEditBtn: document.getElementById('preview-edit-btn'),
    previewSaveBtn: document.getElementById('preview-save-btn'),
    previewDownloadLink: document.getElementById('preview-download-link'),
    previewCloseBtn: document.getElementById('preview-close-btn'),
    previewModalBody: document.getElementById('preview-modal-body'),
    actionModal: document.getElementById('drive-action-modal'),
    actionForm: document.getElementById('drive-action-form'),
    actionModalTitle: document.getElementById('action-modal-title'),
    actionModalDesc: document.getElementById('action-modal-desc'),
    actionCloseBtn: document.getElementById('action-close-btn'),
    actionInputWrap: document.getElementById('action-input-wrap'),
    actionInputLabel: document.getElementById('action-input-label'),
    actionTextInput: document.getElementById('action-text-input'),
    actionTextareaWrap: document.getElementById('action-textarea-wrap'),
    actionTextareaInput: document.getElementById('action-textarea-input'),
    actionCancelBtn: document.getElementById('action-cancel-btn'),
    actionSubmitBtn: document.getElementById('action-submit-btn'),
  };

  let latestTokenPlain = '';
  let currentDir = '/';
  let currentDirItems = [];
  let searchMode = false;
  let searchItems = [];
  let selectedPaths = new Set();
  let searchDebounceTimer = null;
  let activeActionHandler = null;
  let activePreviewState = null;

  function getFileExt(name) {
    const idx = String(name || '').lastIndexOf('.');
    return idx >= 0 ? String(name).slice(idx).toLowerCase() : '';
  }

  function isEditableTextFile(name) {
    const lower = String(name || '').toLowerCase();
    if (lower === 'makefile' || lower === 'dockerfile' || lower === 'license' || lower.startsWith('readme')) {
      return true;
    }
    return TEXT_EXTS.has(getFileExt(lower));
  }

  function joinDrivePath(baseDir, childRelative) {
    const cleanChild = String(childRelative || '')
      .replaceAll('\\', '/')
      .split('/')
      .map(s => s.trim())
      .filter(s => s && s !== '.' && s !== '..')
      .join('/');
    if (!cleanChild) return baseDir || '/';
    return baseDir === '/' ? `/${cleanChild}` : `${baseDir}/${cleanChild}`;
  }

  function getParentDir(relPath) {
    const parts = String(relPath || '/').split('/').filter(Boolean);
    if (parts.length <= 1) return '/';
    return '/' + parts.slice(0, -1).join('/');
  }

  function buildAgentSnippet() {
    const tok = latestTokenPlain || '<YOUR_AGENT_TOKEN>';
    return `# 服务器本机程序可直接免权限读写共享目录 /srv/drive
ls -la /srv/drive

# 远程 Agent 查看文件列表
curl -H "Authorization: Bearer ${tok}" \\
  "https://shouyulove.cn/drive/api/agent/tree?path=/"

# 远程 Agent 上传文件
curl -X PUT -H "Authorization: Bearer ${tok}" \\
  --data-binary @notes.md \\
  "https://shouyulove.cn/drive/api/agent/write?path=/notes.md"`;
  }

  function createSvgIcon(kind, className) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 20 20');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.75');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    if (className) svg.setAttribute('class', className);

    const paths = {
      dir: ['M3 5.5A1.5 1.5 0 0 1 4.5 4h4l1.5 2h5.5A1.5 1.5 0 0 1 17 7.5v7A1.5 1.5 0 0 1 15.5 16h-11A1.5 1.5 0 0 1 3 14.5v-9Z'],
      file: ['M5.5 3.5h5.8L15 7.2v9.3a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 4 16.5v-11A1.5 1.5 0 0 1 5.5 3.5Z', 'M11 3.5V7.5h4'],
      image: ['M4 5.5A1.5 1.5 0 0 1 5.5 4h9A1.5 1.5 0 0 1 16 5.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 14.5v-9Z', 'M7.5 8a1 1 0 1 0 0-.01', 'm4.5 14 3.8-3.8 2.7 2.7 2-2 2.5 2.6'],
      media: ['M4.5 4.5h11a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z', 'm8.5 7.5 4.5 2.5-4.5 2.5v-5Z'],
      shield: ['M10 2.5 16 5v4.8c0 3.7-2.5 6.8-6 7.7-3.5-.9-6-4-6-7.7V5l6-2.5Z', 'm7.2 10 2 2 3.8-4'],
      key: ['M12.5 8.5a3.5 3.5 0 1 0-2.47 3.34L12 14h2v2h2v-2.17l-2.34-2.34c.54-.84.84-1.88.84-2.99Z'],
      info: ['M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z', 'M10 9v4', 'M10 6.5h.01'],
      alert: ['M10 3.5 17 16H3L10 3.5Z', 'M10 8.5v3.5', 'M10 14.2h.01'],
    }[kind] || [];

    for (const d of paths) {
      const p = document.createElementNS(SVG_NS, 'path');
      p.setAttribute('d', d);
      svg.appendChild(p);
    }
    return svg;
  }

  function pickIconKind(item) {
    if (item.type === 'dir') return 'dir';
    const ext = getFileExt(item.name);
    if (IMAGE_EXTS.has(ext)) return 'image';
    if (VIDEO_EXTS.has(ext) || AUDIO_EXTS.has(ext)) return 'media';
    return 'file';
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) return '--';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let val = bytes;
    let idx = 0;
    while (val >= 1024 && idx < units.length - 1) {
      val /= 1024;
      idx++;
    }
    if (idx === 0) return `${Math.round(val)} B`;
    const numStr = val >= 10 ? val.toFixed(1).replace(/\.0$/, '') : val.toFixed(2);
    return `${numStr} ${units[idx]}`;
  }

  function formatTimestamp(ms) {
    if (!Number.isFinite(ms) || ms <= 0) return '';
    try {
      const parts = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(new Date(ms));
      const pick = type => parts.find(p => p.type === type)?.value || '';
      return `${pick('year')}-${pick('month')}-${pick('day')} ${pick('hour')}:${pick('minute')}`;
    } catch {
      const d = new Date(ms);
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
  }

  function showNotice(message, tone = 'info') {
    els.notice.textContent = '';
    if (!message) {
      els.notice.hidden = true;
      return;
    }
    els.notice.hidden = false;
    els.notice.dataset.tone = tone;
    const icon = createSvgIcon(tone === 'error' ? 'alert' : 'info', 'inline-icon');
    const span = document.createElement('span');
    span.textContent = message;
    els.notice.append(icon, span);
  }

  async function apiJson(path, options = {}) {
    const res = await fetch(`${driveBase}${path}`, {
      credentials: 'same-origin',
      ...options,
      headers: {
        ...(options.body && typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `请求失败（${res.status}）`);
    }
    return data;
  }

  function syncUrlWithDir(dir, replace = false) {
    const nextUrl = dir && dir !== '/' ? `${driveBase}/?dir=${encodeURIComponent(dir)}` : `${driveBase}/`;
    const cur = window.location.pathname + window.location.search;
    if (cur === nextUrl) return;
    if (replace) {
      window.history.replaceState({ dir }, '', nextUrl);
    } else {
      window.history.pushState({ dir }, '', nextUrl);
    }
  }

  function syncPresetHighlight() {
    const val = String(els.resizeGbInput?.value || '').trim();
    document.querySelectorAll('[data-resize-preset]').forEach(btn => {
      btn.classList.toggle('is-selected', btn.dataset.resizePreset === val);
    });
  }

  function renderStorage(storage) {
    if (!storage) return;
    const totalGb = Math.max(1, Math.round((storage.totalBytes || 0) / 1024 / 1024 / 1024));
    const pct = Math.max(0, Math.min(100, Number(storage.usedPercent) || 0));
    const hasUsed = (storage.usedBytes || 0) > 0;

    const safeAvail = Math.min(storage.availableBytes ?? 0, storage.totalBytes ?? 0);
    if (els.overviewUsed) els.overviewUsed.textContent = formatBytes(storage.usedBytes);
    if (els.overviewAvail) els.overviewAvail.textContent = formatBytes(safeAvail);
    if (els.overviewTotal) els.overviewTotal.textContent = formatBytes(storage.totalBytes);
    if (els.overviewUsagePct) {
      els.overviewUsagePct.textContent = !hasUsed
        ? '已用 0%'
        : pct < 0.1
          ? '已用 < 0.1%'
          : `已用 ${pct.toFixed(1)}%`;
    }
    if (els.overviewMeter) {
      els.overviewMeter.value = hasUsed ? Math.max(1.8, pct) : 0;
    }

    if (els.quotaSummaryLine) {
      els.quotaSummaryLine.textContent = `已使用 ${formatBytes(storage.usedBytes)}，剩余可用 ${formatBytes(safeAvail)}。`;
    }
    if (els.quotaProgress) {
      els.quotaProgress.value = hasUsed ? Math.max(2, pct) : 0;
    }

    if (els.resizeCurrentGb && els.resizeGbInput) {
      els.resizeCurrentGb.textContent = `当前上限 ${totalGb} GB`;
      const clampedMin = Math.min(500, Math.max(60, totalGb));
      const reachedCap = totalGb >= 500;
      els.resizeGbInput.min = String(clampedMin);
      els.resizeGbInput.max = '500';
      els.resizeGbInput.disabled = reachedCap;
      if (els.resizeSubmitBtn) els.resizeSubmitBtn.disabled = reachedCap;
      if (reachedCap) {
        els.resizeGbInput.value = '500';
      } else if (!els.resizeGbInput.value || Number(els.resizeGbInput.value) < clampedMin) {
        els.resizeGbInput.value = String(Math.min(500, Math.max(60, Math.ceil((totalGb + 15) / 20) * 20)));
      }
      document.querySelectorAll('[data-resize-preset]').forEach(btn => {
        const presetVal = Number(btn.dataset.resizePreset);
        btn.disabled = reachedCap || presetVal <= totalGb;
      });
      syncPresetHighlight();
    }
  }

  function renderOverview(overview, isAdmin) {
    if (els.overviewExpandBtn) {
      els.overviewExpandBtn.hidden = !isAdmin;
    }
    if (!overview) return;
    if (els.overviewFileCount) {
      els.overviewFileCount.textContent = String(Math.max(0, Number(overview.fileCount) || 0));
    }
    if (els.overviewDirCount) {
      els.overviewDirCount.textContent = String(Math.max(0, Number(overview.dirCount) || 0));
    }
    if (els.overviewUpdatedText) {
      const formatted = formatTimestamp(overview.latestMtimeMs);
      els.overviewUpdatedText.textContent = formatted
        ? `最近更新 ${formatted}`
        : '网页与 Agent 实时同步';
    }
  }

  function renderBreadcrumbs() {
    if (!els.breadcrumbs) return;
    els.breadcrumbs.innerHTML = '';

    const parts = currentDir.split('/').filter(Boolean);
    if (els.navUpBtn) {
      els.navUpBtn.hidden = parts.length === 0 && !searchMode;
    }

    const rootBtn = document.createElement('button');
    rootBtn.type = 'button';
    rootBtn.className = `crumb-btn${parts.length === 0 && !searchMode ? ' is-current' : ''}`;
    rootBtn.textContent = '全部文件';
    rootBtn.addEventListener('click', () => {
      clearSearchIfActive();
      navigateToDir('/');
    });
    els.breadcrumbs.appendChild(rootBtn);

    if (searchMode) {
      const sep = document.createElement('span');
      sep.className = 'crumb-sep';
      sep.textContent = '›';
      const searchLabel = document.createElement('span');
      searchLabel.className = 'crumb-btn is-current';
      searchLabel.textContent = `搜索结果`;
      els.breadcrumbs.append(sep, searchLabel);
      return;
    }

    let accum = '';
    parts.forEach((seg, idx) => {
      accum += `/${seg}`;
      const targetPath = accum;
      const sep = document.createElement('span');
      sep.className = 'crumb-sep';
      sep.textContent = '›';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `crumb-btn${idx === parts.length - 1 ? ' is-current' : ''}`;
      btn.textContent = seg;
      btn.addEventListener('click', () => navigateToDir(targetPath));
      els.breadcrumbs.append(sep, btn);
    });
  }

  function getSortedItems(list) {
    const sortBy = els.sortSelect?.value || 'name';
    return [...list].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      if (sortBy === 'mtime') {
        const diff = (b.mtimeMs || 0) - (a.mtimeMs || 0);
        if (diff !== 0) return diff;
      } else if (sortBy === 'size') {
        const diff = (b.size || 0) - (a.size || 0);
        if (diff !== 0) return diff;
      }
      return String(a.name || '').localeCompare(String(b.name || ''), 'zh-Hans-CN');
    });
  }

  function syncBatchBar(visibleItems) {
    if (!els.batchBar) return;
    for (const p of [...selectedPaths]) {
      if (!visibleItems.some(it => it.path === p)) {
        selectedPaths.delete(p);
      }
    }
    const count = selectedPaths.size;
    els.batchBar.hidden = count === 0;
    if (els.batchCountText) {
      els.batchCountText.textContent = `已选 ${count} 项`;
    }
    if (els.selectAllCheckbox) {
      els.selectAllCheckbox.checked = visibleItems.length > 0 && count === visibleItems.length;
      els.selectAllCheckbox.indeterminate = count > 0 && count < visibleItems.length;
    }
  }

  function triggerDownloadUrl(url) {
    const a = document.createElement('a');
    a.href = url;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function downloadZipForPaths(paths) {
    if (!Array.isArray(paths) || paths.length === 0) return;
    if (paths.length === 1) {
      triggerDownloadUrl(`${driveBase}/api/agent/zip?path=${encodeURIComponent(paths[0])}`);
      return;
    }
    const params = new URLSearchParams();
    for (const p of paths) params.append('paths', p);
    triggerDownloadUrl(`${driveBase}/api/agent/zip?${params.toString()}`);
  }

  function renderExplorerTable() {
    renderBreadcrumbs();
    const rawList = searchMode ? searchItems : currentDirItems;
    const sorted = getSortedItems(rawList);

    if (els.rootFilesCount) {
      els.rootFilesCount.textContent = searchMode ? `匹配 ${sorted.length} 项` : `${sorted.length} 项`;
    }
    if (els.dropzoneBannerText) {
      els.dropzoneBannerText.textContent = `松手即可上传文件或整个文件夹至 ${currentDir === '/' ? '根目录' : currentDir}`;
    }

    els.rootFilesList.innerHTML = '';
    syncBatchBar(sorted);

    if (!searchMode && sorted.length === 0) {
      if (els.fileTableHead) els.fileTableHead.hidden = true;
      els.rootFilesEmpty.hidden = false;
      els.rootFilesFilterEmpty.hidden = true;
      els.rootFilesList.hidden = true;
      return;
    }

    if (searchMode && sorted.length === 0) {
      if (els.fileTableHead) els.fileTableHead.hidden = true;
      els.rootFilesEmpty.hidden = true;
      els.rootFilesFilterEmpty.hidden = false;
      els.rootFilesList.hidden = true;
      return;
    }

    if (els.fileTableHead) els.fileTableHead.hidden = false;
    els.rootFilesEmpty.hidden = true;
    els.rootFilesFilterEmpty.hidden = true;
    els.rootFilesList.hidden = false;

    for (const item of sorted) {
      const li = document.createElement('li');
      li.className = 'file-entry';

      const isChecked = selectedPaths.has(item.path);
      const row = document.createElement('div');
      row.className = `file-row${isChecked ? ' is-selected' : ''}`;

      const checkLabel = document.createElement('label');
      checkLabel.className = 'file-check-wrap';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = isChecked;
      checkbox.setAttribute('aria-label', `选择 ${item.name}`);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          selectedPaths.add(item.path);
        } else {
          selectedPaths.delete(item.path);
        }
        row.classList.toggle('is-selected', checkbox.checked);
        syncBatchBar(sorted);
      });
      checkLabel.appendChild(checkbox);

      const main = document.createElement('div');
      main.className = 'file-row__main';

      const iconEl = createSvgIcon(
        pickIconKind(item),
        `file-row__icon ${item.type === 'dir' ? 'file-row__icon--dir' : 'file-row__icon--file'}`,
      );

      const titleStack = document.createElement('div');
      titleStack.className = 'file-row__title-stack';

      const nameBtn = document.createElement('button');
      nameBtn.type = 'button';
      nameBtn.className = 'file-row__name';
      nameBtn.textContent = item.name;
      nameBtn.addEventListener('click', () => {
        if (item.type === 'dir') {
          clearSearchIfActive();
          navigateToDir(item.path);
        } else {
          openPreviewModal(item);
        }
      });
      titleStack.appendChild(nameBtn);

      if (searchMode && item.parentPath) {
        const sub = document.createElement('span');
        sub.className = 'file-row__subpath';
        sub.textContent = item.parentPath === '/' ? '根目录' : item.parentPath;
        titleStack.appendChild(sub);
      }

      main.append(iconEl, titleStack);

      const mtimeSpan = document.createElement('span');
      mtimeSpan.className = 'file-row__mtime';
      mtimeSpan.textContent = formatTimestamp(item.mtimeMs) || '--';

      const sizeSpan = document.createElement('span');
      sizeSpan.className = 'file-row__size';
      sizeSpan.textContent = item.type === 'dir' ? '文件夹' : formatBytes(item.size);

      const actions = document.createElement('div');
      actions.className = 'file-row__actions';

      if (searchMode && item.parentPath) {
        const locateBtn = document.createElement('button');
        locateBtn.type = 'button';
        locateBtn.className = 'action-link action-link--muted';
        locateBtn.textContent = '所在目录';
        locateBtn.addEventListener('click', () => {
          clearSearchIfActive();
          navigateToDir(item.parentPath || '/');
        });
        actions.appendChild(locateBtn);
      }

      const dlBtn = document.createElement('button');
      dlBtn.type = 'button';
      dlBtn.className = 'action-link action-link--muted';
      dlBtn.textContent = item.type === 'dir' ? '打包下载' : '下载';
      dlBtn.addEventListener('click', () => {
        if (item.type === 'dir') {
          downloadZipForPaths([item.path]);
        } else {
          triggerDownloadUrl(`${driveBase}/api/agent/read?path=${encodeURIComponent(item.path)}&download=1`);
        }
      });

      const renameBtn = document.createElement('button');
      renameBtn.type = 'button';
      renameBtn.className = 'action-link action-link--muted';
      renameBtn.textContent = '重命名';
      renameBtn.addEventListener('click', () => openRenameModal(item));

      const moveBtn = document.createElement('button');
      moveBtn.type = 'button';
      moveBtn.className = 'action-link action-link--muted';
      moveBtn.textContent = '移动';
      moveBtn.addEventListener('click', () => openMoveModal(item));

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'action-link action-link--danger';
      delBtn.textContent = '删除';
      delBtn.addEventListener('click', () => openDeleteConfirmModal([item.path], `确定要删除「${item.name}」吗？`));

      actions.append(dlBtn, renameBtn, moveBtn, delBtn);
      row.append(checkLabel, main, mtimeSpan, sizeSpan, actions);
      li.appendChild(row);
      els.rootFilesList.appendChild(li);
    }
  }

  async function navigateToDir(targetDir, { pushHistory = true, silent = false } = {}) {
    const cleanDir = targetDir || '/';
    try {
      const data = await apiJson(`/api/agent/tree?path=${encodeURIComponent(cleanDir)}&depth=1`);
      currentDir = data.path || '/';
      currentDirItems = Array.isArray(data.items) ? data.items : [];
      selectedPaths.clear();
      if (data.stats) renderStorage(data.stats);
      if (data.overview) renderOverview(data.overview, !els.adminDrawer.hidden);
      if (pushHistory) syncUrlWithDir(currentDir);
      renderExplorerTable();
    } catch (err) {
      if (!silent) showNotice(err.message, 'error');
      if (cleanDir !== '/') {
        return navigateToDir('/', { pushHistory: true, silent: true });
      }
    }
  }

  function clearSearchIfActive() {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = null;
    }
    if (els.fileFilterInput) els.fileFilterInput.value = '';
    searchMode = false;
    searchItems = [];
  }

  async function runGlobalSearch(rawQuery) {
    const q = String(rawQuery || '').trim();
    if (!q) {
      searchMode = false;
      searchItems = [];
      renderExplorerTable();
      return;
    }
    try {
      const data = await apiJson(`/api/agent/search?q=${encodeURIComponent(q)}&path=/`);
      if ((els.fileFilterInput?.value || '').trim() !== q) return;
      searchMode = true;
      searchItems = Array.isArray(data.items) ? data.items : [];
      selectedPaths.clear();
      renderExplorerTable();
    } catch (err) {
      showNotice(err.message, 'error');
    }
  }

  // In-page File Preview & Editor Modal
  function closePreviewModal() {
    activePreviewState = null;
    if (els.previewModalBody) {
      els.previewModalBody.querySelectorAll('video, audio').forEach(media => {
        try {
          media.pause();
          media.removeAttribute('src');
        } catch {
          // Ignore media cleanup errors
        }
      });
      els.previewModalBody.innerHTML = '';
    }
    if (els.previewModal?.open) {
      els.previewModal.close();
    }
  }

  async function openPreviewModal(item) {
    if (!els.previewModal) return;
    const readUrl = `${driveBase}/api/agent/read?path=${encodeURIComponent(item.path)}`;
    const dlUrl = `${readUrl}&download=1`;
    const ext = getFileExt(item.name);

    els.previewModalTitle.textContent = item.name;
    els.previewModalMeta.textContent = `${item.path}（${formatBytes(item.size)}，${formatTimestamp(item.mtimeMs)}）`;
    els.previewDownloadLink.href = dlUrl;
    els.previewEditBtn.hidden = true;
    els.previewSaveBtn.hidden = true;
    els.previewModalBody.innerHTML = '';

    activePreviewState = { item, editing: false, textContent: '' };
    if (!els.previewModal.open) {
      els.previewModal.showModal();
    }

    if (IMAGE_EXTS.has(ext)) {
      const stage = document.createElement('div');
      stage.className = 'preview-media-stage';
      const img = document.createElement('img');
      img.src = readUrl;
      img.alt = item.name;
      stage.appendChild(img);
      els.previewModalBody.appendChild(stage);
      return;
    }

    if (VIDEO_EXTS.has(ext)) {
      const stage = document.createElement('div');
      stage.className = 'preview-media-stage';
      const video = document.createElement('video');
      video.controls = true;
      video.preload = 'metadata';
      video.src = readUrl;
      stage.appendChild(video);
      els.previewModalBody.appendChild(stage);
      return;
    }

    if (AUDIO_EXTS.has(ext)) {
      const stage = document.createElement('div');
      stage.className = 'preview-media-stage';
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.src = readUrl;
      stage.appendChild(audio);
      els.previewModalBody.appendChild(stage);
      return;
    }

    if (ext === '.pdf') {
      const frame = document.createElement('iframe');
      frame.className = 'preview-pdf-frame';
      frame.src = readUrl;
      frame.title = item.name;
      els.previewModalBody.appendChild(frame);
      return;
    }

    if (isEditableTextFile(item.name) && (item.size || 0) <= 2 * 1024 * 1024) {
      const loading = document.createElement('div');
      loading.className = 'preview-binary-card';
      loading.textContent = '正在读取文件内容…';
      els.previewModalBody.appendChild(loading);
      try {
        const res = await fetch(readUrl, { credentials: 'same-origin' });
        if (!res.ok) throw new Error('读取文件失败');
        const text = await res.text();
        if (!activePreviewState || activePreviewState.item.path !== item.path) return;
        activePreviewState.textContent = text;
        renderPreviewTextView();
      } catch (err) {
        loading.textContent = err.message || '无法在线预览此文件，请点击右上角「下载」。';
      }
      return;
    }

    const card = document.createElement('div');
    card.className = 'preview-binary-card';
    card.textContent = '该文件格式或体积暂不支持页内直接渲染，请点击右上角「下载」保存到本地查看。';
    els.previewModalBody.appendChild(card);
  }

  function renderPreviewTextView() {
    if (!activePreviewState || !els.previewModalBody) return;
    els.previewModalBody.innerHTML = '';
    if (activePreviewState.editing) {
      els.previewEditBtn.textContent = '取消编辑';
      els.previewEditBtn.hidden = false;
      els.previewSaveBtn.hidden = false;
      const ta = document.createElement('textarea');
      ta.className = 'drive-textarea preview-editor';
      ta.value = activePreviewState.textContent;
      ta.id = 'active-preview-textarea';
      els.previewModalBody.appendChild(ta);
      ta.focus();
    } else {
      els.previewEditBtn.textContent = '编辑文档';
      els.previewEditBtn.hidden = false;
      els.previewSaveBtn.hidden = true;
      const pre = document.createElement('pre');
      pre.className = 'preview-code';
      pre.textContent = activePreviewState.textContent || '（空文件）';
      els.previewModalBody.appendChild(pre);
    }
  }

  // Reusable In-Page Action Dialog (New Folder / New Doc / Rename & Move / Confirm Delete)
  function openActionDialog({
    title,
    desc = '',
    submitLabel = '确认',
    showInput = true,
    inputLabel = '名称',
    initialValue = '',
    placeholder = '',
    showTextarea = false,
    onSubmit,
  }) {
    if (!els.actionModal) return;
    activeActionHandler = onSubmit;
    els.actionModalTitle.textContent = title;
    els.actionModalDesc.textContent = desc;
    els.actionSubmitBtn.textContent = submitLabel;
    els.actionInputWrap.hidden = !showInput;
    els.actionTextInput.required = showInput;
    if (showInput) {
      els.actionInputLabel.textContent = inputLabel;
      els.actionTextInput.value = initialValue;
      els.actionTextInput.placeholder = placeholder;
    }
    els.actionTextareaWrap.hidden = !showTextarea;
    els.actionTextareaInput.value = '';
    if (!els.actionModal.open) {
      els.actionModal.showModal();
    }
    if (showInput) {
      els.actionTextInput.focus();
      const dotIdx = initialValue.lastIndexOf('.');
      if (dotIdx > 0) {
        els.actionTextInput.setSelectionRange(0, dotIdx);
      } else {
        els.actionTextInput.select();
      }
    } else {
      els.actionSubmitBtn.focus();
    }
  }

  function closeActionDialog() {
    activeActionHandler = null;
    if (els.actionModal?.open) {
      els.actionModal.close();
    }
  }

  function openNewFolderModal() {
    openActionDialog({
      title: '新建文件夹',
      desc: `将在 ${currentDir === '/' ? '根目录' : currentDir} 下创建文件夹`,
      submitLabel: '创建文件夹',
      inputLabel: '文件夹名称',
      placeholder: '例如：2026春季活动资料',
      onSubmit: async nameRaw => {
        const clean = nameRaw.trim().replace(/^\/+|\/+$/g, '');
        if (!clean) return;
        const fullPath = joinDrivePath(currentDir, clean);
        await apiJson('/api/agent/mkdir', {
          method: 'POST',
          body: JSON.stringify({ path: fullPath }),
        });
        showNotice(`已新建文件夹 ${clean}`);
        await navigateToDir(currentDir, { pushHistory: false });
      },
    });
  }

  function openNewDocModal() {
    openActionDialog({
      title: '新建文档',
      desc: `将在 ${currentDir === '/' ? '根目录' : currentDir} 下直接创建文本文档`,
      submitLabel: '保存文档',
      inputLabel: '文件名称',
      initialValue: '未命名笔记.md',
      placeholder: '例如：会议纪要.md',
      showTextarea: true,
      onSubmit: async (nameRaw, contentRaw) => {
        let clean = nameRaw.trim().replace(/^\/+|\/+$/g, '');
        if (!clean) return;
        if (!clean.includes('.')) clean += '.md';
        const fullPath = joinDrivePath(currentDir, clean);
        await apiJson('/api/agent/write', {
          method: 'POST',
          body: JSON.stringify({ path: fullPath, content: contentRaw || '' }),
        });
        showNotice(`已创建文档 ${clean}`);
        await navigateToDir(currentDir, { pushHistory: false });
      },
    });
  }

  function openRenameModal(item) {
    openActionDialog({
      title: '重命名或移动路径',
      desc: '直接修改名称即可重命名；输入以 / 开头的完整路径即可移动至其他文件夹。',
      submitLabel: '保存更改',
      inputLabel: '新名称或目标路径',
      initialValue: item.name,
      placeholder: item.path,
      onSubmit: async nextRaw => {
        const val = nextRaw.trim();
        if (!val) return;
        const parent = getParentDir(item.path);
        const destPath = val.startsWith('/') ? val : joinDrivePath(parent, val);
        if (destPath === item.path) return;
        await apiJson('/api/agent/move', {
          method: 'POST',
          body: JSON.stringify({ from: item.path, to: destPath }),
        });
        showNotice(`已更新为 ${destPath}`);
        if (searchMode) {
          await runGlobalSearch(els.fileFilterInput.value);
        } else {
          await navigateToDir(currentDir, { pushHistory: false });
        }
      },
    });
  }

  function openMoveModal(item) {
    const parent = getParentDir(item.path);
    openActionDialog({
      title: `移动「${item.name}」`,
      desc: '输入目标文件夹路径（如 / 代表根目录，不存在的子文件夹将自动创建）。',
      submitLabel: '确认移动',
      inputLabel: '目标文件夹路径',
      initialValue: parent,
      placeholder: '/目标文件夹',
      onSubmit: async dirRaw => {
        const targetFolder = (dirRaw.trim() || '/').startsWith('/')
          ? dirRaw.trim() || '/'
          : `/${dirRaw.trim()}`;
        const destPath = joinDrivePath(targetFolder, item.name);
        if (destPath === item.path) return;
        await apiJson('/api/agent/move', {
          method: 'POST',
          body: JSON.stringify({ from: item.path, to: destPath }),
        });
        showNotice(`已移动至 ${targetFolder}`);
        if (searchMode) {
          await runGlobalSearch(els.fileFilterInput.value);
        } else {
          await navigateToDir(currentDir, { pushHistory: false });
        }
      },
    });
  }

  function openDeleteConfirmModal(paths, promptDesc) {
    openActionDialog({
      title: '确认删除',
      desc: promptDesc,
      submitLabel: '确认删除',
      showInput: false,
      onSubmit: async () => {
        await apiJson('/api/agent/delete', {
          method: 'POST',
          body: JSON.stringify({ paths }),
        });
        selectedPaths.clear();
        showNotice(`已删除 ${paths.length} 项内容`);
        if (searchMode) {
          await runGlobalSearch(els.fileFilterInput.value);
          await loadState({ keepExplorer: true });
        } else {
          await navigateToDir(currentDir, { pushHistory: false });
        }
      },
    });
  }

  // Multi-file & Folder Upload Queue with XHR Byte Progress
  function uploadSingleFileWithProgress(targetPath, file, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', `${driveBase}/api/agent/write?path=${encodeURIComponent(targetPath)}`);
      xhr.withCredentials = true;
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.upload.onprogress = evt => {
        if (evt.lengthComputable && typeof onProgress === 'function') {
          onProgress(evt.loaded, evt.total);
        }
      };
      xhr.onload = () => {
        let data = {};
        try {
          data = JSON.parse(xhr.responseText || '{}');
        } catch {
          data = {};
        }
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(new Error(data.message || `上传失败（${xhr.status}）`));
        }
      };
      xhr.onerror = () => reject(new Error('网络中断，上传失败'));
      xhr.send(file);
    });
  }

  async function uploadBatchEntries(batch) {
    if (!Array.isArray(batch) || batch.length === 0) return;
    const dirEntries = batch.filter(x => x.kind === 'dir');
    const fileEntries = batch.filter(x => x.kind === 'file' && x.file);

    els.quickUploadInput.disabled = true;
    if (els.dirUploadInput) els.dirUploadInput.disabled = true;
    els.quickUploadLabel?.classList.add('is-busy');
    els.dirUploadLabel?.classList.add('is-busy');
    if (els.quickUploadText) els.quickUploadText.textContent = '上传中…';

    if (els.uploadProgressBox) {
      els.uploadProgressBox.hidden = false;
      els.uploadProgressBar.value = 0;
      els.uploadProgressPct.textContent = '0%';
    }

    try {
      for (const dirItem of dirEntries) {
        const destDir = joinDrivePath(currentDir, dirItem.relPath);
        await apiJson('/api/agent/mkdir', {
          method: 'POST',
          body: JSON.stringify({ path: destDir }),
        });
      }

      const totalCount = fileEntries.length;
      for (let i = 0; i < totalCount; i++) {
        const entry = fileEntries[i];
        const destPath = joinDrivePath(currentDir, entry.relPath);
        if (els.uploadProgressText) {
          els.uploadProgressText.textContent = `正在上传 (${i + 1}/${totalCount})：${entry.relPath}`;
        }
        await uploadSingleFileWithProgress(destPath, entry.file, (loaded, total) => {
          const fileFraction = total > 0 ? loaded / total : 1;
          const overallPct = Math.min(100, Math.round(((i + fileFraction) / totalCount) * 100));
          if (els.uploadProgressBar) els.uploadProgressBar.value = overallPct;
          if (els.uploadProgressPct) els.uploadProgressPct.textContent = `${overallPct}%`;
        });
      }

      clearSearchIfActive();
      await navigateToDir(currentDir, { pushHistory: false });
      showNotice(
        totalCount > 0
          ? `已成功上传 ${totalCount} 个文件至 ${currentDir === '/' ? '根目录' : currentDir}`
          : `已创建空文件夹结构`,
      );
    } catch (err) {
      showNotice(err.message || '上传过程中出现错误', 'error');
    } finally {
      els.quickUploadInput.value = '';
      if (els.dirUploadInput) els.dirUploadInput.value = '';
      els.quickUploadInput.disabled = false;
      if (els.dirUploadInput) els.dirUploadInput.disabled = false;
      els.quickUploadLabel?.classList.remove('is-busy');
      els.dirUploadLabel?.classList.remove('is-busy');
      if (els.quickUploadText) els.quickUploadText.textContent = '上传文件';
      if (els.uploadProgressBox) els.uploadProgressBox.hidden = true;
    }
  }

  async function readDroppedEntries(dataTransfer) {
    const out = [];
    const items = Array.from(dataTransfer?.items || []);
    const webkitRoots = items
      .filter(it => it.kind === 'file' && typeof it.webkitGetAsEntry === 'function')
      .map(it => it.webkitGetAsEntry())
      .filter(Boolean);

    if (webkitRoots.length === 0) {
      for (const f of Array.from(dataTransfer?.files || [])) {
        out.push({ kind: 'file', relPath: f.webkitRelativePath || f.name, file: f });
      }
      return out;
    }

    async function walkEntry(entry, prefix) {
      const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isFile) {
        const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
        out.push({ kind: 'file', relPath, file });
        return;
      }
      if (entry.isDirectory) {
        const reader = entry.createReader();
        const children = [];
        while (true) {
          const batch = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
          if (!batch || batch.length === 0) break;
          children.push(...batch);
        }
        if (children.length === 0) {
          out.push({ kind: 'dir', relPath });
          return;
        }
        for (const child of children) {
          await walkEntry(child, relPath);
        }
      }
    }

    for (const root of webkitRoots) {
      await walkEntry(root, '');
    }
    return out;
  }

  // Admin Whitelist & Agent Token Rendering (Admin Only)
  function renderWhitelist(list) {
    if (!els.whitelistList) return;
    els.whitelistList.innerHTML = '';
    if (els.whitelistCount) els.whitelistCount.textContent = `${list.length} 人`;
    for (const item of list) {
      const li = document.createElement('li');
      li.className = 'record-row';

      const left = document.createElement('div');
      left.className = 'record-row__info';
      const icon = createSvgIcon('shield', 'record-row__icon');
      const phone = document.createElement('span');
      phone.className = 'record-row__title';
      phone.textContent = item.masked;
      left.append(icon, phone);

      if (item.isSuperAdmin) {
        const badge = document.createElement('span');
        badge.className = 'meta-pill meta-pill--super';
        badge.textContent = '超级管理员';
        left.appendChild(badge);
      } else if (item.isAdmin) {
        const badge = document.createElement('span');
        badge.className = 'meta-pill meta-pill--admin';
        badge.textContent = '管理员';
        left.appendChild(badge);
      }

      const isDefaultRoleNote =
        (item.isSuperAdmin && item.note === '超级管理员') ||
        (item.isAdmin && item.note === '管理员');
      if (item.note && !isDefaultRoleNote) {
        const note = document.createElement('span');
        note.className = 'record-row__note';
        note.textContent = item.note;
        left.appendChild(note);
      }

      li.appendChild(left);

      if (!item.isSuperAdmin) {
        const actions = document.createElement('div');
        actions.className = 'record-row__actions';

        const roleBtn = document.createElement('button');
        roleBtn.type = 'button';
        roleBtn.className = 'action-link';
        const nextRole = item.isAdmin ? 'user' : 'admin';
        roleBtn.textContent = item.isAdmin ? '取消管理员' : '设为管理员';
        roleBtn.addEventListener('click', async () => {
          try {
            const data = await apiJson('/api/whitelist/role', {
              method: 'POST',
              body: JSON.stringify({ hash: item.hash, role: nextRole }),
            });
            renderWhitelist(data.whitelist);
            showNotice(nextRole === 'admin' ? `已将 ${item.masked} 设为云盘管理员` : `已取消 ${item.masked} 的云盘管理员权限`);
          } catch (err) {
            showNotice(err.message, 'error');
          }
        });
        actions.appendChild(roleBtn);

        if (!item.isAdmin) {
          const removeBtn = document.createElement('button');
          removeBtn.type = 'button';
          removeBtn.className = 'action-link action-link--danger';
          removeBtn.textContent = '移除';
          removeBtn.addEventListener('click', async () => {
            try {
              const data = await apiJson('/api/whitelist/remove', {
                method: 'POST',
                body: JSON.stringify({ hash: item.hash }),
              });
              renderWhitelist(data.whitelist);
              showNotice(`已移除 ${item.masked}`);
            } catch (err) {
              showNotice(err.message, 'error');
            }
          });
          actions.appendChild(removeBtn);
        }

        li.appendChild(actions);
      }

      els.whitelistList.appendChild(li);
    }
  }

  function renderTokens(tokens) {
    if (!els.tokenList) return;
    els.tokenList.innerHTML = '';
    if (!Array.isArray(tokens) || tokens.length === 0) {
      const li = document.createElement('li');
      li.className = 'record-row';
      const note = document.createElement('span');
      note.className = 'record-row__note';
      note.textContent = '尚未生成令牌。点击上方「生成令牌」即可创建。';
      li.appendChild(note);
      els.tokenList.appendChild(li);
      return;
    }

    for (const item of tokens) {
      const li = document.createElement('li');
      li.className = 'record-row';

      const left = document.createElement('div');
      left.className = 'record-row__info';

      const icon = createSvgIcon('key', 'record-row__icon');
      const name = document.createElement('span');
      name.className = 'record-row__title';
      name.textContent = item.name;

      const prefix = document.createElement('code');
      prefix.className = 'record-row__code';
      prefix.textContent = item.prefix;

      const by = document.createElement('span');
      by.className = 'record-row__note';
      by.textContent = `创建人 ${item.createdByMasked}`;

      left.append(icon, name, prefix, by);

      const revokeBtn = document.createElement('button');
      revokeBtn.type = 'button';
      revokeBtn.className = 'action-link action-link--danger';
      revokeBtn.textContent = '停用';
      revokeBtn.addEventListener('click', async () => {
        try {
          const data = await apiJson('/api/tokens/revoke', {
            method: 'POST',
            body: JSON.stringify({ id: item.id }),
          });
          renderTokens(data.tokens);
          showNotice(`已停用 ${item.name}`);
        } catch (err) {
          showNotice(err.message, 'error');
        }
      });

      li.append(left, revokeBtn);
      els.tokenList.appendChild(li);
    }
  }

  function renderAgentSnippet() {
    if (els.agentCodePre) {
      els.agentCodePre.textContent = buildAgentSnippet();
    }
  }

  let sdkFallbackPromise = null;

  async function ensurePassportSdk() {
    if (window.ShouyuAuth?.openModal) return window.ShouyuAuth;
    if (!sdkFallbackPromise) {
      sdkFallbackPromise = new Promise((resolve, reject) => {
        const fallbackCss = document.createElement('link');
        fallbackCss.rel = 'stylesheet';
        fallbackCss.href = './auth-modal.css';
        fallbackCss.dataset.sylModalCss = '1';
        document.head.appendChild(fallbackCss);

        const script = document.createElement('script');
        script.src = './auth-sdk.js';
        script.onload = () => {
          if (window.ShouyuAuth?.openModal) {
            resolve(window.ShouyuAuth);
          } else {
            reject(new Error('统一通行证悬浮窗组件加载失败，请刷新页面重试。'));
          }
        };
        script.onerror = () => reject(new Error('统一通行证悬浮窗组件加载失败，请刷新页面重试。'));
        document.head.appendChild(script);
      });
    }
    return sdkFallbackPromise;
  }

  async function openPassportModal({ prompt = '' } = {}) {
    try {
      const sdk = await ensurePassportSdk();
      const result = await sdk.openModal({
        issuer: '/auth',
        project: 'drive',
        appName: '心创云盘',
        theme: 'dark',
        prompt,
      });
      if (!result) return;
      const nextState = await loadState();
      if (nextState?.allowed) {
        showNotice(
          result.autoRegistered
            ? `已自动注册并进入心创云盘（${nextState.user.phoneMasked}）`
            : `已登录心创云盘（${nextState.user.phoneMasked}）`,
        );
      } else if (nextState?.authenticated) {
        showNotice(`当前通行证账号（${nextState.user.phoneMasked}）暂未加入云盘成员名单。`, 'error');
      }
    } catch (err) {
      showNotice(err.message || '打开登录悬浮窗失败，请稍后重试。', 'error');
    }
  }

  async function doLogout() {
    try {
      if (window.ShouyuAuth?.logout) {
        await window.ShouyuAuth.logout({ issuer: '/auth' });
      } else {
        await fetch('/auth/api/session', { method: 'GET', credentials: 'same-origin' });
        await fetch('/auth/api/logout', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        });
      }
    } finally {
      window.localStorage.removeItem('jwt');
      currentDir = '/';
      syncUrlWithDir('/', true);
      await loadState().catch(() => {});
      showNotice('已退出当前通行证账号');
    }
  }

  let hasLoadedOnce = false;

  function applyAdminVisibility(isAdmin, state) {
    if (!els.adminDrawer) return;
    if (isAdmin) {
      els.adminDrawer.hidden = false;
      renderWhitelist(state.whitelist || []);
      renderTokens(state.tokens || []);
      renderAgentSnippet();
    } else {
      els.adminDrawer.open = false;
      els.adminDrawer.hidden = true;
      if (els.whitelistList) els.whitelistList.innerHTML = '';
      if (els.tokenList) els.tokenList.innerHTML = '';
      if (els.agentCodePre) els.agentCodePre.textContent = '';
    }
  }

  function applyState(state, { keepExplorer = false } = {}) {
    if (!state || typeof state !== 'object') return state;
    const isAdmin = Boolean(state.allowed && state.isAdmin);
    if (els.viewError) els.viewError.hidden = true;
    renderStorage(state.storage);
    renderOverview(state.overview, isAdmin);
    applyAdminVisibility(isAdmin, state);

    if (!state.authenticated) {
      if (els.heroSection) els.heroSection.hidden = false;
      if (els.navAccount) els.navAccount.textContent = '未登录';
      if (els.verifiedRoleText) els.verifiedRoleText.hidden = true;
      if (els.navLogin) els.navLogin.hidden = false;
      if (els.navSwitch) els.navSwitch.hidden = true;
      if (els.navLogout) els.navLogout.hidden = true;
      if (els.viewGuest) els.viewGuest.hidden = false;
      if (els.guestBento) els.guestBento.hidden = true;
      if (els.viewDenied) els.viewDenied.hidden = true;
      if (els.heroConsoleActions) els.heroConsoleActions.hidden = true;
      if (els.viewConsole) els.viewConsole.hidden = true;
      return state;
    }

    if (els.heroSection) els.heroSection.hidden = true;
    if (els.navAccount) els.navAccount.textContent = state.user.phoneMasked;
    if (els.navLogin) els.navLogin.hidden = true;
    if (els.navSwitch) els.navSwitch.hidden = false;
    if (els.navLogout) els.navLogout.hidden = false;
    if (els.guestBento) els.guestBento.hidden = true;

    if (!state.allowed) {
      if (els.verifiedRoleText) els.verifiedRoleText.hidden = true;
      if (els.deniedPhone) els.deniedPhone.textContent = state.user.phoneMasked;
      if (els.viewGuest) els.viewGuest.hidden = true;
      if (els.viewDenied) els.viewDenied.hidden = false;
      if (els.heroConsoleActions) els.heroConsoleActions.hidden = true;
      if (els.viewConsole) els.viewConsole.hidden = true;
      return state;
    }

    if (els.verifiedRoleText) {
      els.verifiedRoleText.textContent = state.isSuperAdmin ? '超级管理员' : '管理员';
      els.verifiedRoleText.hidden = !isAdmin;
    }
    if (els.consolePhone) els.consolePhone.textContent = state.user.phoneMasked;
    if (els.viewGuest) els.viewGuest.hidden = true;
    if (els.viewDenied) els.viewDenied.hidden = true;
    if (els.heroConsoleActions) els.heroConsoleActions.hidden = false;
    if (els.viewConsole) els.viewConsole.hidden = false;

    if (!keepExplorer) {
      currentDir = state.currentDir || currentDir || '/';
      currentDirItems = Array.isArray(state.rootFiles) ? state.rootFiles : [];
      renderExplorerTable();
    }
    return state;
  }

  async function loadState({ keepExplorer = false } = {}) {
    try {
      const queryDir = currentDir && currentDir !== '/' ? `?dir=${encodeURIComponent(currentDir)}` : '';
      const state = await apiJson(`/api/state${queryDir}`);
      hasLoadedOnce = true;
      return applyState(state, { keepExplorer });
    } catch (err) {
      if (!hasLoadedOnce && els.viewError) {
        if (els.heroSection) els.heroSection.hidden = true;
        els.viewError.hidden = false;
        if (els.errorDesc) {
          els.errorDesc.textContent = `${err.message || '无法读取网盘状态'}，请点击下方按钮重试。`;
        }
      }
      throw err;
    }
  }

  // Event Bindings
  els.guestLogin?.addEventListener('click', () => openPassportModal());
  els.navLogin?.addEventListener('click', () => openPassportModal());
  els.errorLogin?.addEventListener('click', () => openPassportModal());
  els.navSwitch?.addEventListener('click', () => openPassportModal({ prompt: 'select_account' }));
  els.deniedSwitch?.addEventListener('click', () => openPassportModal({ prompt: 'select_account' }));
  els.navLogout?.addEventListener('click', doLogout);
  els.deniedLogout?.addEventListener('click', doLogout);

  els.overviewExpandBtn?.addEventListener('click', () => {
    if (!els.adminDrawer || els.adminDrawer.hidden) return;
    els.adminDrawer.open = true;
    els.resizeForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    els.resizeGbInput?.focus();
  });

  els.quickRefresh?.addEventListener('click', async () => {
    try {
      await loadState();
      if (searchMode && els.fileFilterInput?.value.trim()) {
        await runGlobalSearch(els.fileFilterInput.value);
      }
      showNotice('云盘列表已更新');
    } catch (err) {
      showNotice(err.message, 'error');
    }
  });

  els.retryLoadBtn?.addEventListener('click', () => {
    loadState().then(() => showNotice('已重新加载网盘状态')).catch(err => showNotice(err.message, 'error'));
  });

  els.navUpBtn?.addEventListener('click', () => {
    if (searchMode) {
      clearSearchIfActive();
      renderExplorerTable();
      return;
    }
    navigateToDir(getParentDir(currentDir));
  });

  els.newFolderBtn?.addEventListener('click', openNewFolderModal);
  els.newDocBtn?.addEventListener('click', openNewDocModal);
  els.zipDirBtn?.addEventListener('click', () => downloadZipForPaths([currentDir]));

  els.fileFilterInput?.addEventListener('input', () => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    const val = els.fileFilterInput.value.trim();
    if (!val) {
      searchMode = false;
      searchItems = [];
      renderExplorerTable();
      return;
    }
    searchDebounceTimer = setTimeout(() => runGlobalSearch(val), 180);
  });

  els.clearFilterBtn?.addEventListener('click', () => {
    clearSearchIfActive();
    renderExplorerTable();
    els.fileFilterInput?.focus();
  });

  els.sortSelect?.addEventListener('change', renderExplorerTable);

  els.selectAllCheckbox?.addEventListener('change', () => {
    const visible = getSortedItems(searchMode ? searchItems : currentDirItems);
    if (els.selectAllCheckbox.checked) {
      for (const it of visible) selectedPaths.add(it.path);
    } else {
      selectedPaths.clear();
    }
    renderExplorerTable();
  });

  els.batchZipBtn?.addEventListener('click', () => downloadZipForPaths([...selectedPaths]));
  els.batchDeleteBtn?.addEventListener('click', () => {
    const list = [...selectedPaths];
    if (list.length === 0) return;
    openDeleteConfirmModal(list, `确定要永久删除选中的 ${list.length} 项文件或文件夹吗？`);
  });
  els.batchClearBtn?.addEventListener('click', () => {
    selectedPaths.clear();
    renderExplorerTable();
  });

  els.quickUploadInput?.addEventListener('change', () => {
    const files = Array.from(els.quickUploadInput.files || []);
    if (files.length === 0) return;
    uploadBatchEntries(files.map(file => ({ kind: 'file', relPath: file.name, file })));
  });

  els.dirUploadInput?.addEventListener('change', () => {
    const files = Array.from(els.dirUploadInput.files || []);
    if (files.length === 0) return;
    uploadBatchEntries(files.map(file => ({ kind: 'file', relPath: file.webkitRelativePath || file.name, file })));
  });

  // Drag-and-Drop Files & Folders onto Drive Explorer
  let dragDepth = 0;
  els.driveDropzone?.addEventListener('dragenter', evt => {
    if (!evt.dataTransfer?.types?.includes('Files')) return;
    evt.preventDefault();
    dragDepth++;
    els.driveDropzone.classList.add('is-dragover');
    if (els.dropzoneBanner) els.dropzoneBanner.hidden = false;
  });

  els.driveDropzone?.addEventListener('dragover', evt => {
    if (!evt.dataTransfer?.types?.includes('Files')) return;
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
  });

  els.driveDropzone?.addEventListener('dragleave', () => {
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) {
      els.driveDropzone.classList.remove('is-dragover');
      if (els.dropzoneBanner) els.dropzoneBanner.hidden = true;
    }
  });

  els.driveDropzone?.addEventListener('drop', async evt => {
    evt.preventDefault();
    dragDepth = 0;
    els.driveDropzone.classList.remove('is-dragover');
    if (els.dropzoneBanner) els.dropzoneBanner.hidden = true;
    const dropped = await readDroppedEntries(evt.dataTransfer);
    if (dropped.length > 0) {
      await uploadBatchEntries(dropped);
    }
  });

  // Preview Modal Events
  els.previewCloseBtn?.addEventListener('click', closePreviewModal);
  els.previewModal?.addEventListener('click', evt => {
    if (evt.target === els.previewModal) closePreviewModal();
  });
  els.previewModal?.addEventListener('close', closePreviewModal);

  els.previewEditBtn?.addEventListener('click', () => {
    if (!activePreviewState) return;
    activePreviewState.editing = !activePreviewState.editing;
    renderPreviewTextView();
  });

  els.previewSaveBtn?.addEventListener('click', async () => {
    if (!activePreviewState) return;
    const ta = document.getElementById('active-preview-textarea');
    const nextContent = ta ? ta.value : activePreviewState.textContent;
    els.previewSaveBtn.disabled = true;
    try {
      const saved = await apiJson('/api/agent/write', {
        method: 'POST',
        body: JSON.stringify({ path: activePreviewState.item.path, content: nextContent }),
      });
      activePreviewState.textContent = nextContent;
      activePreviewState.editing = false;
      activePreviewState.item.size = saved.size;
      activePreviewState.item.mtimeMs = saved.mtimeMs;
      els.previewModalMeta.textContent = `${activePreviewState.item.path}（${formatBytes(saved.size)}，${formatTimestamp(saved.mtimeMs)}）`;
      renderPreviewTextView();
      await navigateToDir(currentDir, { pushHistory: false, silent: true });
      showNotice(`已保存 ${activePreviewState.item.name}`);
    } catch (err) {
      showNotice(err.message, 'error');
    } finally {
      els.previewSaveBtn.disabled = false;
    }
  });

  // Action Dialog Events
  els.actionCloseBtn?.addEventListener('click', closeActionDialog);
  els.actionCancelBtn?.addEventListener('click', closeActionDialog);
  els.actionModal?.addEventListener('click', evt => {
    if (evt.target === els.actionModal) closeActionDialog();
  });
  els.actionForm?.addEventListener('submit', async evt => {
    evt.preventDefault();
    if (typeof activeActionHandler !== 'function') return;
    const fn = activeActionHandler;
    els.actionSubmitBtn.disabled = true;
    try {
      await fn(els.actionTextInput.value, els.actionTextareaInput.value);
      closeActionDialog();
    } catch (err) {
      showNotice(err.message, 'error');
    } finally {
      els.actionSubmitBtn.disabled = false;
    }
  });

  window.addEventListener('popstate', () => {
    const nextDir = new URLSearchParams(window.location.search).get('dir') || '/';
    clearSearchIfActive();
    navigateToDir(nextDir, { pushHistory: false, silent: true });
  });

  // Admin Settings Forms
  document.querySelectorAll('[data-resize-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      els.resizeGbInput.value = btn.dataset.resizePreset;
      syncPresetHighlight();
    });
  });

  els.resizeGbInput?.addEventListener('input', syncPresetHighlight);

  els.resizeForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const sizeGb = Number(els.resizeGbInput.value);
    if (!Number.isInteger(sizeGb)) return;
    els.resizeSubmitBtn.disabled = true;
    try {
      const data = await apiJson('/api/storage/resize', {
        method: 'POST',
        body: JSON.stringify({ sizeGb }),
      });
      renderStorage(data.storage);
      showNotice(`空间上限已扩展至 ${sizeGb} GB`);
    } catch (err) {
      showNotice(err.message, 'error');
    } finally {
      els.resizeSubmitBtn.disabled = Boolean(els.resizeGbInput?.disabled);
    }
  });

  els.whitelistForm?.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      const data = await apiJson('/api/whitelist/add', {
        method: 'POST',
        body: JSON.stringify({
          phone: els.wlPhoneInput.value.trim(),
          note: els.wlNoteInput.value.trim(),
        }),
      });
      els.wlPhoneInput.value = '';
      els.wlNoteInput.value = '';
      renderWhitelist(data.whitelist);
      showNotice(`已添加成员：${data.entry.masked}`);
    } catch (err) {
      showNotice(err.message, 'error');
    }
  });

  els.tokenForm?.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      const data = await apiJson('/api/tokens/create', {
        method: 'POST',
        body: JSON.stringify({ name: els.tokenNameInput.value.trim() }),
      });
      els.tokenNameInput.value = '';
      latestTokenPlain = data.created.token;
      els.issuedTokenVal.textContent = latestTokenPlain;
      els.issuedTokenBox.hidden = false;
      renderTokens(data.tokens);
      renderAgentSnippet();
      showNotice('新令牌已生成，请复制保存。');
    } catch (err) {
      showNotice(err.message, 'error');
    }
  });

  els.copyTokenBtn?.addEventListener('click', () => {
    if (!latestTokenPlain) return;
    navigator.clipboard?.writeText(latestTokenPlain).then(() => showNotice('已复制令牌'));
  });

  els.closeTokenBtn?.addEventListener('click', () => {
    els.issuedTokenBox.hidden = true;
  });

  els.copyAgentCodeBtn?.addEventListener('click', () => {
    navigator.clipboard?.writeText(els.agentCodePre.textContent || '').then(() => showNotice('已复制示例命令'));
  });

  // Startup URL flags & SSR hydration
  const urlParams = new URLSearchParams(window.location.search);
  const deniedFlag = urlParams.get('denied') === '1';
  const loginFlag = urlParams.get('login') === '1';
  const initialDirParam = urlParams.get('dir') || '/';
  currentDir = initialDirParam.startsWith('/') ? initialDirParam : '/';

  if (deniedFlag || loginFlag || urlParams.has('next')) {
    syncUrlWithDir(currentDir, true);
  }
  if (deniedFlag) {
    showNotice('当前账号暂未开通网盘权限，请切换已授权账号。', 'error');
  }

  const rawInitial = document.body.dataset.initialState || '';
  if (rawInitial && rawInitial !== '__INITIAL_STATE__') {
    try {
      applyState(JSON.parse(rawInitial));
      hasLoadedOnce = true;
    } catch {
      // Fallback cleanly to /api/state
    }
  }

  loadState()
    .then(state => {
      if (loginFlag && !state?.authenticated) {
        openPassportModal();
      }
    })
    .catch(err => showNotice(err.message, 'error'));
})();
