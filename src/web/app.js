(() => {
  const driveBase = document.body.dataset.driveBase || '/drive';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const ROOT_LABEL = '全部文件';
  const MAX_INLINE_TEXT_BYTES = 2 * 1024 * 1024;
  const MAX_THUMB_BYTES = 3 * 1024 * 1024;

  const TEXT_EXTS = new Set([
    '.txt', '.md', '.markdown', '.json', '.jsonl', '.yaml', '.yml', '.toml', '.ini', '.conf',
    '.csv', '.tsv', '.log', '.xml', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.vue',
    '.py', '.sh', '.bash', '.zsh', '.sql', '.c', '.cpp', '.h', '.hpp', '.rs', '.go', '.java',
    '.kt', '.swift', '.rb', '.php', '.r', '.tex', '.bib', '.html', '.css', '.scss', '.env',
    '.gitignore', '.dockerfile',
  ]);
  const KIND_BY_EXT = new Map();
  const registerKind = (kind, exts) => exts.forEach(ext => KIND_BY_EXT.set(ext, kind));
  registerKind('image', ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.bmp', '.ico', '.avif']);
  registerKind('video', ['.mp4', '.webm', '.mov', '.m4v']);
  registerKind('audio', ['.mp3', '.wav', '.m4a', '.ogg', '.flac']);
  registerKind('pdf', ['.pdf']);
  registerKind('doc', ['.doc', '.docx', '.pages', '.rtf', '.odt', '.wps']);
  registerKind('sheet', ['.xls', '.xlsx', '.csv', '.tsv', '.numbers', '.et']);
  registerKind('slides', ['.ppt', '.pptx', '.key', '.dps']);
  registerKind('archive', ['.zip', '.rar', '.7z', '.tar', '.gz', '.tgz', '.bz2', '.xz']);
  registerKind('text', ['.txt', '.md', '.markdown', '.log', '.ini', '.conf', '.tex', '.bib']);
  registerKind('code', [
    '.json', '.jsonl', '.yaml', '.yml', '.toml', '.xml', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx',
    '.vue', '.py', '.ipynb', '.sh', '.bash', '.zsh', '.sql', '.c', '.cpp', '.h', '.hpp', '.rs', '.go',
    '.java', '.kt', '.swift', '.rb', '.php', '.r', '.html', '.css', '.scss', '.env',
  ]);
  const KIND_ICON = {
    folder: 'i-folder', image: 't-image', video: 't-video', audio: 't-audio', pdf: 't-file',
    doc: 't-text', sheet: 't-sheet', slides: 't-slides', archive: 't-archive', code: 't-code',
    text: 't-text', file: 't-file',
  };

  const byId = id => document.getElementById(id);
  const els = {
    gate: byId('gate'),
    heroSection: byId('hero-section'),
    viewDenied: byId('view-denied'),
    viewError: byId('view-error'),
    viewConsole: byId('view-console'),
    navLogin: byId('nav-login-btn'),
    guestLogin: byId('guest-login-btn'),
    errorLogin: byId('error-login-btn'),
    errorDesc: byId('error-desc'),
    retryLoadBtn: byId('retry-load-btn'),
    deniedPhone: byId('denied-phone'),
    deniedSwitch: byId('denied-switch-btn'),
    deniedLogout: byId('denied-logout-btn'),
    folderTree: byId('folder-tree'),
    adminNav: byId('admin-nav'),
    accountBtn: byId('account-btn'),
    navAccount: byId('nav-account-text'),
    verifiedRoleText: byId('verified-role-text'),
    search: document.querySelector('.search'),
    fileFilterInput: byId('file-filter-input'),
    searchClearBtn: byId('search-clear-btn'),
    main: byId('main'),
    navUpBtn: byId('nav-up-btn'),
    breadcrumbs: byId('drive-breadcrumbs'),
    rootFilesCount: byId('root-files-count'),
    uploadMenuBtn: byId('upload-menu-btn'),
    quickUploadText: byId('quick-upload-text'),
    newMenuBtn: byId('new-menu-btn'),
    selectModeBtn: byId('select-mode-btn'),
    sortMenuBtn: byId('sort-menu-btn'),
    sortMenuLabel: byId('sort-menu-label'),
    viewListBtn: byId('view-list-btn'),
    viewGridBtn: byId('view-grid-btn'),
    moreMenuBtn: byId('more-menu-btn'),
    driveDropzone: byId('drive-dropzone'),
    fileTableHead: byId('file-table-head'),
    selectAllCheckbox: byId('select-all-checkbox'),
    rootFilesList: byId('root-files-list'),
    rootFilesEmpty: byId('root-files-empty'),
    emptyUploadBtn: byId('empty-upload-btn'),
    emptyFolderBtn: byId('empty-folder-btn'),
    rootFilesFilterEmpty: byId('root-files-filter-empty'),
    filterEmptyTitle: byId('filter-empty-title'),
    clearFilterBtn: byId('clear-filter-btn'),
    quickUploadInput: byId('quick-upload-input'),
    dirUploadInput: byId('dir-upload-input'),
    dropzoneBanner: byId('dropzone-banner'),
    dropzoneBannerText: byId('dropzone-banner-text'),
    batchBar: byId('batch-bar'),
    batchCountText: byId('batch-count-text'),
    batchZipBtn: byId('batch-zip-btn'),
    batchMoveBtn: byId('batch-move-btn'),
    batchDeleteBtn: byId('batch-delete-btn'),
    batchClearBtn: byId('batch-clear-btn'),
    uploadProgressBox: byId('upload-progress-box'),
    uploadProgressTitle: byId('upload-progress-title'),
    uploadProgressText: byId('upload-progress-text'),
    uploadProgressPct: byId('upload-progress-pct'),
    uploadProgressBar: byId('upload-progress-bar'),
    uploadCancelBtn: byId('upload-cancel-btn'),
    notice: byId('drive-notice'),
    previewModal: byId('file-preview-modal'),
    previewModalTile: byId('preview-modal-tile'),
    previewModalTitle: byId('preview-modal-title'),
    previewModalMeta: byId('preview-modal-meta'),
    previewEditBtn: byId('preview-edit-btn'),
    previewEditText: byId('preview-edit-text'),
    previewSaveBtn: byId('preview-save-btn'),
    previewDownloadLink: byId('preview-download-link'),
    previewCloseBtn: byId('preview-close-btn'),
    previewModalBody: byId('preview-modal-body'),
    previewPrevBtn: byId('preview-prev-btn'),
    previewNextBtn: byId('preview-next-btn'),
    actionModal: byId('drive-action-modal'),
    actionForm: byId('drive-action-form'),
    actionModalTitle: byId('action-modal-title'),
    actionModalDesc: byId('action-modal-desc'),
    actionCloseBtn: byId('action-close-btn'),
    actionInputWrap: byId('action-input-wrap'),
    actionInputLabel: byId('action-input-label'),
    actionTextInput: byId('action-text-input'),
    actionError: byId('action-error'),
    actionCancelBtn: byId('action-cancel-btn'),
    actionSubmitBtn: byId('action-submit-btn'),
    moveModal: byId('move-modal'),
    moveModalTitle: byId('move-modal-title'),
    moveCloseBtn: byId('move-close-btn'),
    moveTree: byId('move-tree'),
    moveDestText: byId('move-dest-text'),
    moveCancelBtn: byId('move-cancel-btn'),
    moveSubmitBtn: byId('move-submit-btn'),
    adminModal: byId('admin-settings'),
    adminCloseBtn: byId('admin-close-btn'),
    whitelistCount: byId('whitelist-count'),
    whitelistForm: byId('whitelist-form'),
    wlPhoneInput: byId('wl-phone-input'),
    wlNoteInput: byId('wl-note-input'),
    whitelistList: byId('whitelist-list'),
    quotaSummaryLine: byId('quota-summary-line'),
    resizeForm: byId('resize-form'),
    resizeGbInput: byId('resize-gb-input'),
    resizeSubmitBtn: byId('resize-submit-btn'),
    tokenForm: byId('token-form'),
    tokenNameInput: byId('token-name-input'),
    issuedTokenBox: byId('issued-token-box'),
    issuedTokenVal: byId('issued-token-val'),
    copyTokenBtn: byId('copy-token-btn'),
    closeTokenBtn: byId('close-token-btn'),
    tokenList: byId('token-list'),
    agentCodePre: byId('agent-code-pre'),
    copyAgentCodeBtn: byId('copy-agent-code-btn'),
  };

  const compactQuery = window.matchMedia('(max-width: 719px), (hover: none)');
  const narrowQuery = window.matchMedia('(max-width: 719px)');
  const dragQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

  function readStored(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeStored(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 隐私模式下写不进去也不影响使用
    }
  }

  const storedSort = readStored('syl-drive-sort', null);
  const state = {
    session: null,
    dir: '/',
    items: [],
    visible: [],
    search: { active: false, query: '', items: [] },
    selected: new Set(),
    selectMode: false,
    lastToggledPath: null,
    sort: {
      key: ['name', 'mtime', 'size'].includes(storedSort?.key) ? storedSort.key : 'name',
      dir: storedSort?.dir === 'desc' ? 'desc' : 'asc',
    },
    view: readStored('syl-drive-view', 'list') === 'grid' ? 'grid' : 'list',
    totalGb: 0,
    lastLoadedAt: 0,
  };
  const tree = { children: new Map(), expanded: new Set() };

  let latestTokenPlain = '';
  let searchDebounceTimer = null;
  let hasLoadedOnce = false;
  let sessionLostHandled = false;

  // ---------- 小工具 ----------

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function icon(name, className = 'icon') {
    const svg = document.createElementNS(SVG_NS, 'svg');
    if (className) svg.setAttribute('class', className);
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', `#${name}`);
    svg.appendChild(use);
    return svg;
  }

  function getFileExt(name) {
    const text = String(name || '');
    const idx = text.lastIndexOf('.');
    return idx > 0 ? text.slice(idx).toLowerCase() : idx === 0 ? text.toLowerCase() : '';
  }

  function splitName(name) {
    const text = String(name || '');
    const idx = text.lastIndexOf('.');
    if (idx <= 0 || text.length - idx > 9 || /\s/.test(text.slice(idx))) return [text, ''];
    return [text.slice(0, idx), text.slice(idx)];
  }

  function kindOf(item) {
    if (item.type === 'dir') return 'folder';
    return KIND_BY_EXT.get(getFileExt(item.name)) || 'file';
  }

  function isEditableTextFile(name) {
    const lower = String(name || '').toLowerCase();
    if (lower === 'makefile' || lower === 'dockerfile' || lower === 'license' || lower.startsWith('readme')) {
      return true;
    }
    return TEXT_EXTS.has(getFileExt(lower));
  }

  function isMarkdownFile(name) {
    const ext = getFileExt(name);
    return ext === '.md' || ext === '.markdown';
  }

  function tile(item) {
    const kind = kindOf(item);
    const span = el('span', `ftile ftile--${kind}`);
    span.appendChild(icon(KIND_ICON[kind], kind === 'folder' ? '' : 'icon'));
    return span;
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

  function baseName(relPath) {
    const parts = String(relPath || '/').split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1] : '';
  }

  function dirLabel(relPath) {
    return !relPath || relPath === '/' ? ROOT_LABEL : baseName(relPath);
  }

  function isInsidePath(candidate, ancestor) {
    return candidate === ancestor || candidate.startsWith(`${ancestor}/`);
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
    const digits = val >= 100 ? 0 : val >= 10 ? 1 : 2;
    return `${parseFloat(val.toFixed(digits))} ${units[idx]}`;
  }

  const shanghaiFormat = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  function timeParts(ms) {
    const out = {};
    for (const part of shanghaiFormat.formatToParts(new Date(ms))) out[part.type] = part.value;
    if (out.hour === '24') out.hour = '00';
    return out;
  }

  function formatFull(ms) {
    if (!Number.isFinite(ms) || ms <= 0) return '';
    const p = timeParts(ms);
    return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`;
  }

  function formatWhen(ms) {
    if (!Number.isFinite(ms) || ms <= 0) return '';
    const now = Date.now();
    const diff = now - ms;
    if (diff >= 0 && diff < 60_000) return '刚刚';
    if (diff >= 0 && diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
    const at = timeParts(ms);
    const today = timeParts(now);
    const yesterday = timeParts(now - 86_400_000);
    const sameDay = (a, b) => a.year === b.year && a.month === b.month && a.day === b.day;
    if (sameDay(at, today)) return `今天 ${at.hour}:${at.minute}`;
    if (sameDay(at, yesterday)) return `昨天 ${at.hour}:${at.minute}`;
    if (at.year === today.year) return `${Number(at.month)}月${Number(at.day)}日`;
    return `${at.year}年${Number(at.month)}月${Number(at.day)}日`;
  }

  function isTypingTarget(target) {
    return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
  }

  function anyDialogOpen() {
    return Boolean(document.querySelector('dialog[open]'));
  }

  // ---------- 提示条 ----------

  let toastTimer = null;

  function hideNotice() {
    clearTimeout(toastTimer);
    els.notice.classList.remove('is-open');
    try {
      if (els.notice.hidePopover && els.notice.matches(':popover-open')) els.notice.hidePopover();
    } catch {
      // 不支持 popover 的浏览器直接靠类名显隐
    }
  }

  function showNotice(message, tone = 'info') {
    clearTimeout(toastTimer);
    if (!message) {
      hideNotice();
      return;
    }
    const box = els.notice;
    box.textContent = '';
    box.dataset.tone = tone;
    box.setAttribute('role', tone === 'error' ? 'alert' : 'status');
    box.append(icon(tone === 'error' ? 'i-alert' : 'i-ok'), el('span', '', message));
    try {
      // 重新进入顶层，保证盖在后打开的对话框上面
      if (box.showPopover) {
        if (box.matches(':popover-open')) box.hidePopover();
        box.showPopover();
      }
    } catch {
      // 同上
    }
    box.classList.remove('is-open');
    void box.offsetWidth;
    box.classList.add('is-open');
    toastTimer = setTimeout(hideNotice, tone === 'error' ? 7000 : 3600);
  }

  els.notice.addEventListener('click', hideNotice);

  // ---------- 接口 ----------

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
      if (res.status === 401 && state.session?.authenticated && !sessionLostHandled) {
        sessionLostHandled = true;
        loadState()
          .catch(() => {})
          .finally(() => {
            sessionLostHandled = false;
            showNotice('登录已过期，请重新登录。', 'error');
          });
      }
      throw new Error(data.message || `请求失败（${res.status}）`);
    }
    return data;
  }

  function readUrlFor(path) {
    return `${driveBase}/api/agent/read?path=${encodeURIComponent(path)}`;
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

  function downloadItem(item) {
    if (item.type === 'dir') {
      downloadZipForPaths([item.path]);
    } else {
      triggerDownloadUrl(`${readUrlFor(item.path)}&download=1`);
    }
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

  // ---------- 菜单（宽屏为浮层，窄屏为底部面板） ----------

  let activeMenu = null;

  function closeMenu({ restoreFocus = true } = {}) {
    if (!activeMenu) return;
    const { menu, veil, anchor } = activeMenu;
    activeMenu = null;
    menu.remove();
    veil.remove();
    if (anchor) {
      anchor.setAttribute('aria-expanded', 'false');
      if (restoreFocus && document.contains(anchor)) anchor.focus({ preventScroll: true });
    }
  }

  function openMenu(anchor, items, { x, y, align = 'start' } = {}) {
    closeMenu({ restoreFocus: false });
    const sheet = narrowQuery.matches;
    const veil = el('div', `menu-veil${sheet ? ' menu-veil--dim' : ''}`);
    const menu = el('div', `menu${sheet ? ' menu--sheet' : ''}`);
    menu.setAttribute('role', 'menu');

    for (const item of items) {
      if (!item) continue;
      if (item.separator) {
        menu.appendChild(el('div', 'menu__sep'));
        continue;
      }
      if (item.heading) {
        const head = el('div', 'menu__head');
        head.append(el('span', '', item.heading));
        if (item.tag) head.append(el('span', 'tag tag--role', item.tag));
        menu.appendChild(head);
        continue;
      }
      const node = item.href ? el('a', 'menu__item') : el('button', 'menu__item');
      if (item.href) {
        node.href = item.href;
      } else {
        node.type = 'button';
      }
      node.setAttribute('role', item.checked == null ? 'menuitem' : 'menuitemradio');
      if (item.checked != null) node.setAttribute('aria-checked', String(Boolean(item.checked)));
      if (item.danger) node.classList.add('menu__item--danger');
      if (item.icon) node.appendChild(icon(item.icon));
      node.appendChild(el('span', '', item.label));
      if (item.checked) node.appendChild(icon('i-check', 'icon menu__tick'));
      node.addEventListener('click', () => {
        closeMenu({ restoreFocus: !item.href });
        if (typeof item.onSelect === 'function') item.onSelect();
      });
      menu.appendChild(node);
    }

    document.body.append(veil, menu);

    if (!sheet) {
      const width = menu.offsetWidth;
      const height = menu.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let left;
      let top;
      if (Number.isFinite(x) && Number.isFinite(y)) {
        left = x;
        top = y + height > vh - 8 ? y - height : y;
      } else {
        const rect = anchor.getBoundingClientRect();
        left = align === 'end' ? rect.right - width : rect.left;
        top = rect.bottom + 6;
        if (top + height > vh - 8) top = rect.top - height - 6;
      }
      menu.style.left = `${Math.max(8, Math.min(left, vw - width - 8))}px`;
      menu.style.top = `${Math.max(8, Math.min(top, vh - height - 8))}px`;
    }

    const focusables = () => Array.from(menu.querySelectorAll('.menu__item'));
    menu.addEventListener('keydown', evt => {
      const list = focusables();
      const idx = list.indexOf(document.activeElement);
      if (evt.key === 'ArrowDown') {
        evt.preventDefault();
        list[(idx + 1) % list.length]?.focus();
      } else if (evt.key === 'ArrowUp') {
        evt.preventDefault();
        list[(idx - 1 + list.length) % list.length]?.focus();
      } else if (evt.key === 'Home') {
        evt.preventDefault();
        list[0]?.focus();
      } else if (evt.key === 'End') {
        evt.preventDefault();
        list[list.length - 1]?.focus();
      } else if (evt.key === 'Escape') {
        evt.preventDefault();
        evt.stopPropagation();
        closeMenu();
      } else if (evt.key === 'Tab') {
        evt.preventDefault();
        closeMenu();
      }
    });
    veil.addEventListener('pointerdown', evt => {
      evt.preventDefault();
      closeMenu();
    });
    veil.addEventListener('contextmenu', evt => {
      evt.preventDefault();
      closeMenu();
    });

    if (anchor) anchor.setAttribute('aria-expanded', 'true');
    activeMenu = { menu, veil, anchor: anchor || null };
    focusables()[0]?.focus({ preventScroll: true });
  }

  window.addEventListener('resize', () => closeMenu({ restoreFocus: false }));
  window.addEventListener('blur', () => closeMenu({ restoreFocus: false }));

  // ---------- 对话框 ----------

  function bindBackdropClose(dialog, onClose) {
    let pressedOnBackdrop = false;
    dialog.addEventListener('pointerdown', evt => {
      pressedOnBackdrop = evt.target === dialog;
    });
    dialog.addEventListener('click', evt => {
      if (evt.target === dialog && pressedOnBackdrop) onClose();
      pressedOnBackdrop = false;
    });
  }

  // 打开时把焦点放在面板本身，避免第一个按钮无故出现焦点环
  function showDialog(dialog) {
    if (dialog.open) return;
    dialog.showModal();
    const panel = dialog.firstElementChild;
    if (panel) {
      panel.tabIndex = -1;
      panel.focus({ preventScroll: true });
    }
  }

  let activeActionHandler = null;

  function openActionDialog({ title, desc = '', submitLabel = '确认', danger = false, input = null, onSubmit }) {
    activeActionHandler = onSubmit;
    els.actionModalTitle.textContent = title;
    els.actionModalDesc.textContent = desc;
    els.actionSubmitBtn.textContent = submitLabel;
    els.actionSubmitBtn.classList.toggle('btn--danger', danger);
    els.actionSubmitBtn.classList.toggle('btn--primary', !danger);
    els.actionSubmitBtn.disabled = false;
    els.actionError.hidden = true;
    els.actionInputWrap.hidden = !input;
    if (input) {
      els.actionInputLabel.textContent = input.label || '名称';
      els.actionTextInput.value = input.value || '';
      els.actionTextInput.placeholder = input.placeholder || '';
    }
    if (!els.actionModal.open) els.actionModal.showModal();
    if (input) {
      els.actionTextInput.focus();
      const [stem, ext] = splitName(input.value || '');
      if (input.selectStem && ext) {
        els.actionTextInput.setSelectionRange(0, stem.length);
      } else {
        els.actionTextInput.select();
      }
    } else if (danger) {
      els.actionCancelBtn.focus();
    } else {
      els.actionSubmitBtn.focus();
    }
  }

  function closeActionDialog() {
    activeActionHandler = null;
    if (els.actionModal.open) els.actionModal.close();
  }

  els.actionCloseBtn.addEventListener('click', closeActionDialog);
  els.actionCancelBtn.addEventListener('click', closeActionDialog);
  els.actionModal.addEventListener('close', () => {
    activeActionHandler = null;
  });
  bindBackdropClose(els.actionModal, closeActionDialog);
  els.actionTextInput.addEventListener('input', () => {
    els.actionError.hidden = true;
  });
  els.actionForm.addEventListener('submit', async evt => {
    evt.preventDefault();
    const handler = activeActionHandler;
    if (typeof handler !== 'function') return;
    els.actionSubmitBtn.disabled = true;
    try {
      await handler(els.actionTextInput.value);
      if (activeActionHandler === handler) closeActionDialog();
    } catch (err) {
      els.actionError.textContent = err.message || '操作没有成功，请再试一次。';
      els.actionError.hidden = false;
    } finally {
      els.actionSubmitBtn.disabled = false;
    }
  });

  function cleanEntryName(raw) {
    const name = String(raw || '').trim();
    if (!name) throw new Error('名称不能为空。');
    if (/[\\/]/.test(name)) throw new Error('名称里不能包含斜杠。');
    if (name === '.' || name === '..') throw new Error('这个名称不能使用。');
    return name;
  }

  function nameTakenInCurrentDir(name, exceptPath = '') {
    return state.items.some(it => it.name === name && it.path !== exceptPath);
  }

  // ---------- 存储空间 ----------

  function syncPresetHighlight() {
    const val = String(els.resizeGbInput.value || '').trim();
    document.querySelectorAll('[data-resize-preset]').forEach(btn => {
      btn.classList.toggle('is-selected', btn.dataset.resizePreset === val);
    });
  }

  function renderStorage(storage) {
    if (!storage) return;
    const totalBytes = storage.totalBytes || 0;
    const usedBytes = storage.usedBytes || 0;
    const totalGb = Math.max(1, Math.round(totalBytes / 1024 / 1024 / 1024));
    const pct = Math.max(0, Math.min(100, Number(storage.usedPercent) || 0));
    const shownPct = usedBytes > 0 ? Math.max(1.5, pct) : 0;
    const safeAvail = Math.min(storage.availableBytes ?? 0, totalBytes);
    state.totalGb = totalGb;

    document.querySelectorAll('[data-gauge]').forEach(gauge => {
      gauge.style.setProperty('--pct', String(shownPct));
      gauge.setAttribute('aria-valuenow', String(Math.round(pct)));
      gauge.setAttribute('aria-valuetext', `已用 ${formatBytes(usedBytes)}，共 ${formatBytes(totalBytes)}`);
    });
    document.querySelectorAll('[data-storage-used]').forEach(node => {
      node.textContent = formatBytes(usedBytes);
    });
    document.querySelectorAll('[data-storage-total]').forEach(node => {
      node.textContent = formatBytes(totalBytes);
    });

    const usedText =
      usedBytes <= 0 ? '还没有存放文件' : pct < 0.1 ? '已用不到 0.1%' : `已用 ${parseFloat(pct.toFixed(1))}%`;
    els.quotaSummaryLine.textContent = `${usedText}，还剩 ${formatBytes(safeAvail)} 可用。`;

    const clampedMin = Math.min(500, Math.max(60, totalGb));
    const reachedCap = totalGb >= 500;
    els.resizeGbInput.min = String(clampedMin);
    els.resizeGbInput.max = '500';
    els.resizeGbInput.disabled = reachedCap;
    els.resizeSubmitBtn.disabled = reachedCap;
    if (reachedCap) {
      els.resizeGbInput.value = '500';
    } else if (!els.resizeGbInput.value || Number(els.resizeGbInput.value) <= totalGb) {
      els.resizeGbInput.value = String(Math.min(500, Math.max(60, Math.ceil((totalGb + 15) / 20) * 20)));
    }
    document.querySelectorAll('[data-resize-preset]').forEach(btn => {
      btn.disabled = reachedCap || Number(btn.dataset.resizePreset) <= totalGb;
    });
    syncPresetHighlight();
  }

  // ---------- 目录树 ----------

  function cacheTreeChildren(path, items) {
    tree.children.set(
      path,
      (Array.isArray(items) ? items : [])
        .filter(it => it.type === 'dir')
        .map(it => ({ name: it.name, path: it.path })),
    );
  }

  async function loadTreeChildren(path) {
    const data = await apiJson(`/api/agent/tree?path=${encodeURIComponent(path)}&depth=1`);
    cacheTreeChildren(data.path || path, data.items);
    return tree.children.get(path) || [];
  }

  function strictAncestors(dir) {
    const out = ['/'];
    const parts = String(dir || '/').split('/').filter(Boolean);
    let accum = '';
    for (let i = 0; i < parts.length - 1; i++) {
      accum += `/${parts[i]}`;
      out.push(accum);
    }
    return out;
  }

  function buildTreeNode(node, depth, ctx) {
    const isRoot = node.path === '/';
    const li = el('li');
    li.setAttribute('role', 'treeitem');
    const row = el('div', 'tree__row');
    row.style.setProperty('--depth', String(isRoot ? 0 : depth - 1));
    row.dataset.path = node.path;
    const disabled = ctx.isDisabled?.(node.path) || false;
    if (ctx.current === node.path) {
      row.classList.add('is-current');
      li.setAttribute('aria-selected', 'true');
    }
    if (disabled) row.classList.add('is-disabled');

    const kids = tree.children.get(node.path);
    const expanded = isRoot || ctx.expanded.has(node.path);
    if (!isRoot) {
      const toggle = el('button', 'tree__toggle');
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.setAttribute('aria-label', `${expanded ? '收起' : '展开'} ${node.name}`);
      toggle.appendChild(icon('i-chevron-right'));
      if (disabled || (kids && kids.length === 0)) toggle.classList.add('is-leaf');
      toggle.addEventListener('click', async () => {
        if (ctx.expanded.has(node.path)) {
          ctx.expanded.delete(node.path);
        } else {
          ctx.expanded.add(node.path);
          if (!tree.children.has(node.path)) {
            try {
              await loadTreeChildren(node.path);
            } catch (err) {
              ctx.expanded.delete(node.path);
              showNotice(err.message, 'error');
            }
          }
        }
        ctx.rerender();
      });
      row.appendChild(toggle);
      li.setAttribute('aria-expanded', String(expanded));
    }

    const label = el('button', 'tree__label');
    label.type = 'button';
    label.append(isRoot ? icon('i-drive') : icon('i-folder', ''), el('span', 'tree__name', node.name));
    label.title = node.name;
    if (disabled) {
      label.setAttribute('aria-disabled', 'true');
    } else {
      label.addEventListener('click', () => ctx.onPick(node.path));
    }
    if (isRoot) label.style.paddingLeft = '10px';
    row.appendChild(label);
    li.appendChild(row);
    if (ctx.dropTarget && !disabled) bindDropTarget(row, node.path);

    if (expanded && !disabled) {
      if (kids && kids.length > 0) {
        const ul = el('ul');
        ul.setAttribute('role', 'group');
        for (const child of kids) ul.appendChild(buildTreeNode(child, depth + 1, ctx));
        li.appendChild(ul);
      } else if (!kids) {
        const note = el('div', 'tree__note', '正在读取');
        note.style.setProperty('--depth', String(depth));
        li.appendChild(note);
      }
    }
    return li;
  }

  function renderTree() {
    els.folderTree.textContent = '';
    els.folderTree.appendChild(
      buildTreeNode({ name: ROOT_LABEL, path: '/' }, 0, {
        expanded: tree.expanded,
        current: state.search.active ? '' : state.dir,
        dropTarget: true,
        rerender: renderTree,
        onPick: path => {
          clearSearch();
          navigateToDir(path);
        },
      }),
    );
  }

  async function syncTreeToDir() {
    for (const path of strictAncestors(state.dir)) {
      if (path !== '/') tree.expanded.add(path);
      if (!tree.children.has(path)) {
        try {
          await loadTreeChildren(path);
        } catch {
          tree.expanded.delete(path);
        }
      }
    }
    renderTree();
  }

  async function refreshTree() {
    const paths = new Set(['/', ...tree.expanded, ...strictAncestors(state.dir)]);
    // 展开着的节点原地更新，收起的节点丢掉缓存，下次展开时重新读取
    for (const cached of [...tree.children.keys()]) {
      if (!paths.has(cached)) tree.children.delete(cached);
    }
    cacheTreeChildren(state.dir, state.items);
    await Promise.all(
      [...paths]
        .filter(path => path !== state.dir)
        .map(path =>
          loadTreeChildren(path).catch(() => {
            tree.expanded.delete(path);
          }),
        ),
    );
    renderTree();
  }

  // ---------- 文件列表 ----------

  function sortItems(list) {
    const { key, dir } = state.sort;
    const flip = dir === 'desc' ? -1 : 1;
    const byName = (a, b) =>
      String(a.name || '').localeCompare(String(b.name || ''), 'zh-Hans-CN', { numeric: true });
    return [...list].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      let diff = 0;
      if (key === 'mtime') diff = (a.mtimeMs || 0) - (b.mtimeMs || 0);
      else if (key === 'size' && a.type !== 'dir') diff = (a.size || 0) - (b.size || 0);
      else if (key === 'name') diff = byName(a, b);
      if (diff !== 0) return diff * flip;
      return byName(a, b);
    });
  }

  const SORT_LABELS = { name: '名称', mtime: '修改时间', size: '大小' };

  function setSort(key, dir) {
    if (key === state.sort.key && !dir) {
      state.sort.dir = state.sort.dir === 'asc' ? 'desc' : 'asc';
    } else {
      state.sort.key = key;
      state.sort.dir = dir || (key === 'name' ? 'asc' : 'desc');
    }
    writeStored('syl-drive-sort', state.sort);
    renderExplorer();
  }

  function setView(view) {
    state.view = view === 'grid' ? 'grid' : 'list';
    writeStored('syl-drive-view', state.view);
    renderExplorer();
  }

  function renderBreadcrumbs() {
    const nav = els.breadcrumbs;
    nav.textContent = '';
    const parts = state.dir.split('/').filter(Boolean);
    const searching = state.search.active;
    els.navUpBtn.hidden = !searching && parts.length === 0;
    els.navUpBtn.setAttribute('aria-label', searching ? '退出搜索' : '返回上一级');

    const addSep = () => nav.appendChild(icon('i-chevron-right', 'icon crumb-sep'));
    const addCrumb = (label, path, current) => {
      if (current) {
        const cur = el('span', 'crumb is-current', label);
        cur.setAttribute('aria-current', 'page');
        cur.title = label;
        nav.appendChild(cur);
        return;
      }
      const btn = el('button', 'crumb', label);
      btn.type = 'button';
      btn.title = label;
      btn.addEventListener('click', () => {
        clearSearch();
        navigateToDir(path);
      });
      bindDropTarget(btn, path);
      nav.appendChild(btn);
    };

    if (searching) {
      addCrumb(ROOT_LABEL, '/', false);
      addSep();
      addCrumb(`搜索「${state.search.query}」`, '', true);
      return;
    }

    const crumbs = [{ label: ROOT_LABEL, path: '/' }];
    let accum = '';
    for (const seg of parts) {
      accum += `/${seg}`;
      crumbs.push({ label: seg, path: accum });
    }
    const keepTail = narrowQuery.matches ? 1 : 3;
    const hidden = crumbs.length > keepTail + 1 ? crumbs.slice(1, crumbs.length - keepTail) : [];
    const shown = hidden.length ? [crumbs[0], null, ...crumbs.slice(crumbs.length - keepTail)] : crumbs;

    shown.forEach((crumb, idx) => {
      if (idx > 0) addSep();
      if (crumb === null) {
        const more = el('button', 'crumb', '…');
        more.type = 'button';
        more.setAttribute('aria-label', '显示中间的文件夹');
        more.setAttribute('aria-haspopup', 'menu');
        more.addEventListener('click', () => {
          openMenu(
            more,
            hidden.map(h => ({
              label: h.label,
              icon: 'i-folder-line',
              onSelect: () => navigateToDir(h.path),
            })),
          );
        });
        nav.appendChild(more);
        return;
      }
      addCrumb(crumb.label, crumb.path, idx === shown.length - 1);
    });
  }

  function renderSortUi() {
    document.querySelectorAll('.sort-btn[data-sort]').forEach(btn => {
      const active = btn.dataset.sort === state.sort.key;
      btn.classList.toggle('is-active', active);
      btn.classList.toggle('is-desc', active && state.sort.dir === 'desc');
      btn.setAttribute(
        'aria-label',
        `按${SORT_LABELS[btn.dataset.sort]}排序${active ? (state.sort.dir === 'desc' ? '，当前倒序' : '，当前正序') : ''}`,
      );
    });
    els.sortMenuLabel.textContent = SORT_LABELS[state.sort.key];
    els.viewListBtn.setAttribute('aria-pressed', String(state.view === 'list'));
    els.viewGridBtn.setAttribute('aria-pressed', String(state.view === 'grid'));
    els.viewConsole.dataset.view = state.view;
  }

  function metaParts(item) {
    if (state.search.active) {
      return [`位于 ${item.parentPath && item.parentPath !== '/' ? item.parentPath : ROOT_LABEL}`];
    }
    const when = formatWhen(item.mtimeMs);
    return item.type === 'dir' ? [when] : [formatBytes(item.size), when];
  }

  function buildNameNode(item, className) {
    const wrap = el('span', className);
    const [stem, ext] = item.type === 'dir' ? [item.name, ''] : splitName(item.name);
    wrap.appendChild(el('span', 'row__stem', stem));
    if (ext) wrap.appendChild(el('span', 'row__ext', ext));
    wrap.title = item.name;
    return wrap;
  }

  function toggleSelection(path, checked, { range = false } = {}) {
    if (range && state.lastToggledPath && state.lastToggledPath !== path) {
      const paths = state.visible.map(it => it.path);
      const from = paths.indexOf(state.lastToggledPath);
      const to = paths.indexOf(path);
      if (from >= 0 && to >= 0) {
        for (let i = Math.min(from, to); i <= Math.max(from, to); i++) {
          if (checked) state.selected.add(paths[i]);
          else state.selected.delete(paths[i]);
        }
      }
    } else if (checked) {
      state.selected.add(path);
    } else {
      state.selected.delete(path);
    }
    state.lastToggledPath = path;
    syncSelection();
  }

  function setSelectMode(on) {
    state.selectMode = Boolean(on);
    if (!state.selectMode) state.selected.clear();
    syncSelection();
  }

  function syncSelection() {
    const visiblePaths = new Set(state.visible.map(it => it.path));
    for (const p of [...state.selected]) {
      if (!visiblePaths.has(p)) state.selected.delete(p);
    }
    const count = state.selected.size;
    const selecting = state.selectMode || count > 0;
    document.body.classList.toggle('has-selection', count > 0);
    els.rootFilesList.classList.toggle('is-selecting', selecting);
    els.driveDropzone.classList.toggle('is-selecting', selecting);
    els.selectModeBtn.setAttribute('aria-pressed', String(state.selectMode));
    els.batchBar.hidden = count === 0;
    els.batchCountText.textContent = `已选 ${count} 项`;
    els.selectAllCheckbox.checked = state.visible.length > 0 && count === state.visible.length;
    els.selectAllCheckbox.indeterminate = count > 0 && count < state.visible.length;
    for (const node of els.rootFilesList.children) {
      const on = state.selected.has(node.dataset.path);
      node.classList.toggle('is-selected', on);
      const box = node.querySelector('.check input');
      if (box) box.checked = on;
    }
  }

  function openItem(item) {
    if (item.type === 'dir') {
      clearSearch();
      navigateToDir(item.path);
    } else {
      openPreview(item);
    }
  }

  function itemMenuItems(item) {
    const isDir = item.type === 'dir';
    return [
      { label: isDir ? '打开' : '查看', icon: isDir ? 'i-folder-line' : 't-file', onSelect: () => openItem(item) },
      { label: isDir ? '打包下载' : '下载', icon: 'i-download', onSelect: () => downloadItem(item) },
      state.search.active && {
        label: '打开所在文件夹',
        icon: 'i-external',
        onSelect: () => {
          clearSearch();
          navigateToDir(item.parentPath || '/');
        },
      },
      { separator: true },
      { label: '重命名', icon: 'i-pencil', onSelect: () => openRenameDialog(item) },
      { label: '移动到', icon: 'i-move', onSelect: () => openMoveDialog([item.path]) },
      compactQuery.matches && {
        label: '选择',
        icon: 'i-select',
        onSelect: () => {
          state.selectMode = true;
          toggleSelection(item.path, true);
        },
      },
      { separator: true },
      { label: '删除', icon: 'i-trash', danger: true, onSelect: () => openDeleteDialog([item]) },
    ];
  }

  function buildItemNode(item) {
    const grid = state.view === 'grid';
    const isDir = item.type === 'dir';
    const li = el('li', grid ? 'card' : 'row');
    li.dataset.path = item.path;
    if (isDir) li.classList.add('is-dir');

    const checkLabel = el('label', 'check');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.setAttribute('aria-label', `选择 ${item.name}`);
    checkLabel.appendChild(checkbox);
    checkLabel.addEventListener('click', evt => {
      if (evt.target !== checkbox) return;
      toggleSelection(item.path, checkbox.checked, { range: evt.shiftKey });
    });

    const open = el('div', grid ? 'card__open' : 'row__open');
    open.setAttribute('role', 'button');
    open.tabIndex = 0;
    open.setAttribute('aria-label', `${isDir ? '打开文件夹' : '查看'} ${item.name}`);

    const sub = el('span', grid ? 'card__meta' : 'row__sub');
    const parts = metaParts(item).filter(Boolean);
    if (grid) {
      sub.textContent = parts.join('　');
    } else {
      for (const part of parts) sub.appendChild(el('span', '', part));
    }

    if (grid) {
      const thumb = el('span', 'card__thumb');
      if (kindOf(item) === 'image' && (item.size || 0) <= MAX_THUMB_BYTES) {
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = '';
        img.draggable = false;
        img.src = readUrlFor(item.path);
        img.addEventListener('error', () => thumb.replaceChildren(tile(item)), { once: true });
        thumb.appendChild(img);
      } else {
        thumb.appendChild(tile(item));
      }
      open.append(thumb, buildNameNode(item, 'card__name'), sub);
    } else {
      const text = el('span', 'row__text');
      text.append(buildNameNode(item, 'row__name'), sub);
      open.append(tile(item), text);
    }

    const activate = () => {
      if (state.selectMode && compactQuery.matches) {
        toggleSelection(item.path, !state.selected.has(item.path));
      } else {
        openItem(item);
      }
    };
    open.addEventListener('click', activate);
    open.addEventListener('keydown', evt => {
      if (evt.key === 'Enter' || evt.key === ' ') {
        evt.preventDefault();
        activate();
      }
    });

    const moreBtn = el('button', grid ? 'icon-btn card__more' : 'icon-btn');
    moreBtn.type = 'button';
    moreBtn.setAttribute('aria-label', `${item.name} 的更多操作`);
    moreBtn.setAttribute('aria-haspopup', 'menu');
    moreBtn.appendChild(icon('i-more'));
    moreBtn.addEventListener('click', () => openMenu(moreBtn, itemMenuItems(item), { align: 'end' }));

    li.addEventListener('contextmenu', evt => {
      evt.preventDefault();
      openMenu(null, itemMenuItems(item), { x: evt.clientX, y: evt.clientY });
    });

    if (grid) {
      li.append(open, checkLabel, moreBtn);
    } else {
      const mtime = el('span', 'row__mtime', formatWhen(item.mtimeMs) || '--');
      mtime.title = formatFull(item.mtimeMs);
      const size = el('span', 'row__size', isDir ? '' : formatBytes(item.size));
      const actions = el('span', 'row__actions');
      const dlBtn = el('button', 'icon-btn row__download');
      dlBtn.type = 'button';
      dlBtn.title = isDir ? '打包下载' : '下载';
      dlBtn.setAttribute('aria-label', `${isDir ? '打包下载' : '下载'} ${item.name}`);
      dlBtn.appendChild(icon('i-download'));
      dlBtn.addEventListener('click', () => downloadItem(item));
      actions.append(dlBtn, moreBtn);
      li.append(checkLabel, open, mtime, size, actions);
    }

    if (dragQuery.matches) {
      li.draggable = true;
      li.addEventListener('dragstart', evt => {
        const paths = state.selected.has(item.path) ? [...state.selected] : [item.path];
        dragPaths = paths;
        evt.dataTransfer.effectAllowed = 'move';
        evt.dataTransfer.setData('application/x-syl-drive', JSON.stringify(paths));
        evt.dataTransfer.setData('text/plain', paths.map(baseName).join('\n'));
        for (const node of els.rootFilesList.children) {
          if (paths.includes(node.dataset.path)) node.classList.add('is-dragging');
        }
      });
      li.addEventListener('dragend', () => {
        dragPaths = null;
        document.querySelectorAll('.is-dragging, .is-drop').forEach(node => {
          node.classList.remove('is-dragging', 'is-drop');
        });
      });
    }
    if (isDir) bindDropTarget(li, item.path);
    return li;
  }

  function renderExplorer() {
    const searching = state.search.active;
    state.visible = sortItems(searching ? state.search.items : state.items);
    renderBreadcrumbs();
    renderSortUi();

    const count = state.visible.length;
    if (searching) {
      els.rootFilesCount.textContent = count >= 300 ? '找到 300 项以上，只显示前 300 项' : `找到 ${count} 项`;
    } else {
      els.rootFilesCount.textContent = count > 0 ? `${count} 项` : '';
    }
    els.rootFilesCount.hidden = !els.rootFilesCount.textContent;
    els.dropzoneBannerText.textContent = `松手上传到「${dirLabel(state.dir)}」`;

    const list = els.rootFilesList;
    list.textContent = '';
    list.classList.toggle('is-grid', state.view === 'grid');
    list.classList.toggle('is-search', searching);

    const empty = count === 0;
    els.rootFilesEmpty.hidden = !(empty && !searching);
    els.rootFilesFilterEmpty.hidden = !(empty && searching);
    if (empty && searching) {
      els.filterEmptyTitle.textContent = `没有找到名字里带「${state.search.query}」的文件`;
    }
    list.hidden = empty;
    els.fileTableHead.hidden = empty || state.view === 'grid';

    const frag = document.createDocumentFragment();
    for (const item of state.visible) frag.appendChild(buildItemNode(item));
    list.appendChild(frag);
    syncSelection();
  }

  async function navigateToDir(targetDir, { pushHistory = true, silent = false } = {}) {
    const cleanDir = targetDir || '/';
    try {
      const data = await apiJson(`/api/agent/tree?path=${encodeURIComponent(cleanDir)}&depth=1`);
      const changedDir = (data.path || '/') !== state.dir;
      state.dir = data.path || '/';
      state.items = Array.isArray(data.items) ? data.items : [];
      state.lastLoadedAt = Date.now();
      if (changedDir) {
        state.selected.clear();
        state.selectMode = false;
        state.lastToggledPath = null;
      }
      cacheTreeChildren(state.dir, state.items);
      if (data.stats) renderStorage(data.stats);
      if (pushHistory) syncUrlWithDir(state.dir);
      renderExplorer();
      syncTreeToDir();
      if (changedDir && pushHistory) window.scrollTo({ top: 0 });
    } catch (err) {
      if (!silent) showNotice(err.message, 'error');
      if (cleanDir !== '/') {
        await navigateToDir('/', { pushHistory: true, silent: true });
      }
    }
  }

  function clearSearch() {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = null;
    }
    els.fileFilterInput.value = '';
    els.search.classList.remove('has-value');
    els.searchClearBtn.hidden = true;
    state.search = { active: false, query: '', items: [] };
  }

  async function runGlobalSearch(rawQuery) {
    const q = String(rawQuery || '').trim();
    if (!q) {
      state.search = { active: false, query: '', items: [] };
      renderExplorer();
      renderTree();
      return;
    }
    try {
      const data = await apiJson(`/api/agent/search?q=${encodeURIComponent(q)}&path=/`);
      if (els.fileFilterInput.value.trim() !== q) return;
      state.search = { active: true, query: q, items: Array.isArray(data.items) ? data.items : [] };
      renderExplorer();
      renderTree();
    } catch (err) {
      showNotice(err.message, 'error');
    }
  }

  async function refreshListing() {
    await navigateToDir(state.dir, { pushHistory: false });
    if (state.search.active) await runGlobalSearch(state.search.query);
    await refreshTree();
  }

  // ---------- 新建、重命名、移动、删除 ----------

  function openNewFolderDialog() {
    openActionDialog({
      title: '新建文件夹',
      desc: `建在「${dirLabel(state.dir)}」里。`,
      submitLabel: '新建',
      input: { label: '文件夹名称', placeholder: '例如：2026 秋季活动' },
      onSubmit: async raw => {
        const name = cleanEntryName(raw);
        if (nameTakenInCurrentDir(name)) throw new Error(`这里已经有「${name}」了，换一个名称。`);
        await apiJson('/api/agent/mkdir', {
          method: 'POST',
          body: JSON.stringify({ path: joinDrivePath(state.dir, name) }),
        });
        clearSearch();
        await refreshListing();
        showNotice(`已新建文件夹「${name}」`);
      },
    });
  }

  function openNewDocDialog() {
    openActionDialog({
      title: '新建文档',
      desc: `建在「${dirLabel(state.dir)}」里，建好后直接开始写。`,
      submitLabel: '新建并编辑',
      input: { label: '文档名称', value: '未命名文档.md', placeholder: '例如：会议纪要.md', selectStem: true },
      onSubmit: async raw => {
        let name = cleanEntryName(raw);
        if (!name.includes('.')) name += '.md';
        if (nameTakenInCurrentDir(name)) throw new Error(`这里已经有「${name}」了，换一个名称。`);
        const path = joinDrivePath(state.dir, name);
        const saved = await apiJson('/api/agent/write', {
          method: 'POST',
          body: JSON.stringify({ path, content: '' }),
        });
        clearSearch();
        await refreshListing();
        closeActionDialog();
        const created = state.items.find(it => it.path === path) || {
          name,
          path,
          parentPath: state.dir,
          type: 'file',
          size: saved.size || 0,
          mtimeMs: saved.mtimeMs || Date.now(),
        };
        openPreview(created, { edit: true });
      },
    });
  }

  function openRenameDialog(item) {
    openActionDialog({
      title: '重命名',
      submitLabel: '保存',
      input: { label: '新名称', value: item.name, selectStem: item.type !== 'dir' },
      onSubmit: async raw => {
        const name = cleanEntryName(raw);
        if (name === item.name) return;
        await apiJson('/api/agent/move', {
          method: 'POST',
          body: JSON.stringify({ from: item.path, to: joinDrivePath(getParentDir(item.path), name) }),
        });
        await refreshListing();
        showNotice(`已重命名为「${name}」`);
      },
    });
  }

  function openDeleteDialog(items) {
    if (!items.length) return;
    const single = items.length === 1;
    const hasDir = items.some(it => it.type === 'dir');
    openActionDialog({
      title: single ? `删除「${items[0].name}」？` : `删除选中的 ${items.length} 项？`,
      desc: hasDir ? '文件夹里的内容会一起删除，删除后无法恢复。' : '删除后无法恢复。',
      submitLabel: '删除',
      danger: true,
      onSubmit: async () => {
        await apiJson('/api/agent/delete', {
          method: 'POST',
          body: JSON.stringify({ paths: items.map(it => it.path) }),
        });
        state.selected.clear();
        state.selectMode = false;
        await refreshListing();
        showNotice(single ? `已删除「${items[0].name}」` : `已删除 ${items.length} 项`);
      },
    });
  }

  async function moveEntries(paths, destDir) {
    const todo = paths.filter(p => getParentDir(p) !== destDir && !isInsidePath(destDir, p));
    if (todo.length === 0) return;
    let done = 0;
    const errors = [];
    for (const from of todo) {
      try {
        await apiJson('/api/agent/move', {
          method: 'POST',
          body: JSON.stringify({ from, to: joinDrivePath(destDir, baseName(from)) }),
        });
        done++;
      } catch (err) {
        errors.push(err.message);
      }
    }
    state.selected.clear();
    state.selectMode = false;
    await refreshListing();
    if (errors.length > 0) {
      showNotice(done > 0 ? `移动了 ${done} 项，另有 ${errors.length} 项没有成功：${errors[0]}` : errors[0], 'error');
    } else {
      const what = done === 1 ? `「${baseName(todo[0])}」` : ` ${done} 项`;
      showNotice(`已把${what}移动到「${dirLabel(destDir)}」`);
    }
  }

  // 移动对话框：在目录树里点选目标
  const movePicker = { paths: [], dest: '/', expanded: new Set() };

  function renderMovePicker() {
    els.moveTree.textContent = '';
    els.moveTree.appendChild(
      buildTreeNode({ name: ROOT_LABEL, path: '/' }, 0, {
        expanded: movePicker.expanded,
        current: movePicker.dest,
        dropTarget: false,
        rerender: renderMovePicker,
        isDisabled: path => movePicker.paths.some(p => isInsidePath(path, p)),
        onPick: async path => {
          movePicker.dest = path;
          movePicker.expanded.add(path);
          renderMovePicker();
          if (!tree.children.has(path)) {
            try {
              await loadTreeChildren(path);
            } catch {
              movePicker.expanded.delete(path);
            }
            renderMovePicker();
          }
        },
      }),
    );
    const alreadyThere = movePicker.paths.every(p => getParentDir(p) === movePicker.dest);
    els.moveSubmitBtn.disabled = alreadyThere;
    els.moveDestText.textContent = alreadyThere ? '已经在这个文件夹里' : `移动到「${dirLabel(movePicker.dest)}」`;
    els.moveTree.querySelector('.is-current')?.scrollIntoView({ block: 'nearest' });
  }

  async function openMoveDialog(paths) {
    if (!paths.length) return;
    movePicker.paths = [...paths];
    const startDir = getParentDir(paths[0]);
    movePicker.dest = startDir;
    movePicker.expanded = new Set([...strictAncestors(startDir), startDir].filter(p => p !== '/'));
    els.moveModalTitle.textContent = paths.length === 1 ? `把「${baseName(paths[0])}」移动到` : `把 ${paths.length} 项移动到`;
    renderMovePicker();
    showDialog(els.moveModal);
    for (const path of ['/', ...movePicker.expanded]) {
      if (!tree.children.has(path)) {
        try {
          await loadTreeChildren(path);
        } catch {
          movePicker.expanded.delete(path);
        }
      }
    }
    renderMovePicker();
  }

  function closeMoveDialog() {
    if (els.moveModal.open) els.moveModal.close();
  }

  els.moveCloseBtn.addEventListener('click', closeMoveDialog);
  els.moveCancelBtn.addEventListener('click', closeMoveDialog);
  bindBackdropClose(els.moveModal, closeMoveDialog);
  els.moveSubmitBtn.addEventListener('click', async () => {
    els.moveSubmitBtn.disabled = true;
    const { paths, dest } = movePicker;
    closeMoveDialog();
    await moveEntries(paths, dest);
  });

  // 把列表里的项目拖到文件夹、目录树或路径上完成移动
  let dragPaths = null;

  function canDropInto(destPath) {
    if (!dragPaths) return false;
    return dragPaths.some(p => getParentDir(p) !== destPath) && !dragPaths.some(p => isInsidePath(destPath, p));
  }

  function bindDropTarget(node, destPath) {
    node.addEventListener('dragover', evt => {
      if (!canDropInto(destPath)) return;
      evt.preventDefault();
      evt.dataTransfer.dropEffect = 'move';
      node.classList.add('is-drop');
    });
    node.addEventListener('dragleave', evt => {
      if (!node.contains(evt.relatedTarget)) node.classList.remove('is-drop');
    });
    node.addEventListener('drop', evt => {
      node.classList.remove('is-drop');
      if (!canDropInto(destPath)) return;
      evt.preventDefault();
      evt.stopPropagation();
      const paths = dragPaths;
      dragPaths = null;
      moveEntries(paths, destPath);
    });
  }

  // ---------- 上传 ----------

  let uploadJob = null;

  function uploadSingleFile(targetPath, file, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      uploadJob.xhr = xhr;
      xhr.open('PUT', `${driveBase}/api/agent/write?path=${encodeURIComponent(targetPath)}`);
      xhr.withCredentials = true;
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.upload.onprogress = evt => {
        if (evt.lengthComputable) onProgress(evt.loaded, evt.total);
      };
      xhr.onload = () => {
        let data = {};
        try {
          data = JSON.parse(xhr.responseText || '{}');
        } catch {
          data = {};
        }
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new Error(data.message || `上传失败（${xhr.status}）`));
      };
      xhr.onerror = () => reject(new Error('网络中断，上传没有完成。'));
      xhr.onabort = () => reject(new Error('已取消上传。'));
      xhr.send(file);
    });
  }

  function setUploadProgress(fraction, title, detail) {
    const pct = Math.max(0, Math.min(100, Math.round(fraction * 100)));
    els.uploadProgressBar.style.width = `${pct}%`;
    els.uploadProgressPct.textContent = `${pct}%`;
    if (title) els.uploadProgressTitle.textContent = title;
    if (detail != null) els.uploadProgressText.textContent = detail;
  }

  async function runUpload(batch, targetDir) {
    const dirEntries = batch.filter(x => x.kind === 'dir');
    const fileEntries = batch.filter(x => x.kind === 'file' && x.file);
    const totalBytes = fileEntries.reduce((sum, x) => sum + (x.file.size || 0), 0);
    uploadJob = { xhr: null, cancelled: false };
    els.uploadMenuBtn.classList.add('is-busy');
    els.quickUploadText.textContent = '上传中';
    els.uploadProgressBox.hidden = false;
    document.body.classList.add('is-uploading');
    setUploadProgress(0, '准备上传', '');

    let doneCount = 0;
    let doneBytes = 0;
    try {
      for (const entry of dirEntries) {
        await apiJson('/api/agent/mkdir', {
          method: 'POST',
          body: JSON.stringify({ path: joinDrivePath(targetDir, entry.relPath) }),
        });
      }
      for (const entry of fileEntries) {
        if (uploadJob.cancelled) throw new Error('已取消上传。');
        const title = fileEntries.length > 1 ? `正在上传第 ${doneCount + 1} 个，共 ${fileEntries.length} 个` : '正在上传';
        setUploadProgress(totalBytes > 0 ? doneBytes / totalBytes : 0, title, entry.relPath);
        await uploadSingleFile(joinDrivePath(targetDir, entry.relPath), entry.file, loaded => {
          const fraction = totalBytes > 0 ? (doneBytes + loaded) / totalBytes : (doneCount + 1) / fileEntries.length;
          setUploadProgress(fraction);
        });
        doneCount++;
        doneBytes += entry.file.size || 0;
      }
      showNotice(
        fileEntries.length > 0
          ? `已上传 ${fileEntries.length} 个文件到「${dirLabel(targetDir)}」`
          : '已建好文件夹',
      );
    } catch (err) {
      const partial = doneCount > 0 ? `前 ${doneCount} 个文件已经传完。` : '';
      showNotice(`${err.message || '上传时出了问题。'}${partial}`, 'error');
    } finally {
      uploadJob = null;
      els.quickUploadInput.value = '';
      els.dirUploadInput.value = '';
      els.uploadMenuBtn.classList.remove('is-busy');
      els.quickUploadText.textContent = '上传';
      els.uploadProgressBox.hidden = true;
      document.body.classList.remove('is-uploading');
      if (!state.search.active || state.dir === targetDir) {
        await refreshListing().catch(() => {});
      }
    }
  }

  function startUpload(batch) {
    if (!Array.isArray(batch) || batch.length === 0) return;
    if (uploadJob) {
      showNotice('上一批文件还在上传，等它传完再继续。', 'error');
      return;
    }
    const targetDir = state.dir;
    const topNames = new Set(batch.map(x => String(x.relPath || '').split('/')[0]));
    const clashes = state.items.filter(it => topNames.has(it.name));
    if (clashes.length === 0) {
      runUpload(batch, targetDir);
      return;
    }
    const sample = clashes.slice(0, 3).map(it => `「${it.name}」`).join('、');
    openActionDialog({
      title: '这里已经有同名的项目',
      desc: `${sample}${clashes.length > 3 ? ` 等 ${clashes.length} 项` : ''}已经存在。继续上传会用新文件替换同名文件。`,
      submitLabel: '继续上传',
      onSubmit: async () => {
        closeActionDialog();
        runUpload(batch, targetDir);
      },
    });
  }

  async function readDroppedEntries(dataTransfer) {
    const out = [];
    const items = Array.from(dataTransfer?.items || []);
    const roots = items
      .filter(it => it.kind === 'file' && typeof it.webkitGetAsEntry === 'function')
      .map(it => it.webkitGetAsEntry())
      .filter(Boolean);

    if (roots.length === 0) {
      for (const f of Array.from(dataTransfer?.files || [])) {
        out.push({ kind: 'file', relPath: f.webkitRelativePath || f.name, file: f });
      }
      return out;
    }

    async function walk(entry, prefix) {
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
          const chunk = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
          if (!chunk || chunk.length === 0) break;
          children.push(...chunk);
        }
        if (children.length === 0) {
          out.push({ kind: 'dir', relPath });
          return;
        }
        for (const child of children) await walk(child, relPath);
      }
    }

    for (const root of roots) await walk(root, '');
    return out;
  }

  els.quickUploadInput.addEventListener('change', () => {
    const files = Array.from(els.quickUploadInput.files || []);
    startUpload(files.map(file => ({ kind: 'file', relPath: file.name, file })));
  });
  els.dirUploadInput.addEventListener('change', () => {
    const files = Array.from(els.dirUploadInput.files || []);
    startUpload(files.map(file => ({ kind: 'file', relPath: file.webkitRelativePath || file.name, file })));
  });
  els.uploadCancelBtn.addEventListener('click', () => {
    if (!uploadJob) return;
    uploadJob.cancelled = true;
    uploadJob.xhr?.abort();
  });

  // 从桌面拖文件进来：整页提示，松手上传到当前文件夹
  let externalDragDepth = 0;
  const isExternalFileDrag = evt => !dragPaths && Array.from(evt.dataTransfer?.types || []).includes('Files');
  const canAcceptDrop = () => !els.viewConsole.hidden && !anyDialogOpen();

  function hideDropVeil() {
    externalDragDepth = 0;
    els.dropzoneBanner.hidden = true;
  }

  window.addEventListener('dragenter', evt => {
    if (!isExternalFileDrag(evt)) return;
    evt.preventDefault();
    externalDragDepth++;
    if (canAcceptDrop()) els.dropzoneBanner.hidden = false;
  });
  window.addEventListener('dragover', evt => {
    if (!isExternalFileDrag(evt)) return;
    evt.preventDefault();
    evt.dataTransfer.dropEffect = canAcceptDrop() ? 'copy' : 'none';
  });
  window.addEventListener('dragleave', evt => {
    if (!isExternalFileDrag(evt)) return;
    externalDragDepth = Math.max(0, externalDragDepth - 1);
    if (externalDragDepth === 0) hideDropVeil();
  });
  window.addEventListener('drop', async evt => {
    if (!isExternalFileDrag(evt)) return;
    evt.preventDefault();
    hideDropVeil();
    if (!canAcceptDrop()) return;
    const dropped = await readDroppedEntries(evt.dataTransfer);
    startUpload(dropped);
  });

  // ---------- Markdown（只生成节点，不拼接 HTML） ----------

  function safeLinkUrl(raw) {
    const url = String(raw || '').trim();
    return /^(https?:\/\/|mailto:)/i.test(url) ? url : '';
  }

  function renderInline(text, parent) {
    const pattern = /(`+)(.+?)\1|\*\*(.+?)\*\*|__(.+?)__|\*([^*\s](?:[^*]*[^*\s])?)\*|~~(.+?)~~|!?\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)|(https?:\/\/[^\s<>"'，。；、）)\]]+)/g;
    let last = 0;
    let match;
    while ((match = pattern.exec(text))) {
      if (match.index > last) parent.append(text.slice(last, match.index));
      if (match[2] != null) {
        parent.appendChild(el('code', '', match[2]));
      } else if (match[3] != null || match[4] != null) {
        renderInline(match[3] ?? match[4], parent.appendChild(el('strong')));
      } else if (match[5] != null) {
        renderInline(match[5], parent.appendChild(el('em')));
      } else if (match[6] != null) {
        renderInline(match[6], parent.appendChild(el('del')));
      } else if (match[7] != null || match[9] != null) {
        const url = safeLinkUrl(match[8] ?? match[9]);
        const label = match[7] ?? match[9];
        if (url) {
          const a = el('a', '', label);
          a.href = url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          parent.appendChild(a);
        } else {
          parent.append(label);
        }
      }
      last = pattern.lastIndex;
    }
    if (last < text.length) parent.append(text.slice(last));
  }

  function renderInlineLines(lines, parent) {
    lines.forEach((line, idx) => {
      if (idx > 0) parent.appendChild(el('br'));
      renderInline(line, parent);
    });
  }

  const MD_FENCE = /^\s{0,3}(```|~~~)/;
  const MD_HEADING = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
  const MD_RULE = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/;
  const MD_QUOTE = /^\s{0,3}>\s?/;
  const MD_LIST = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
  const MD_TABLE_RULE = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

  function splitTableRow(line) {
    return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => cell.trim());
  }

  function renderMarkdownBlocks(lines, root) {
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) {
        i++;
        continue;
      }

      const fence = MD_FENCE.exec(line);
      if (fence) {
        const body = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith(fence[1])) body.push(lines[i++]);
        i++;
        root.appendChild(el('pre')).appendChild(el('code', '', body.join('\n')));
        continue;
      }

      const heading = MD_HEADING.exec(line);
      if (heading) {
        renderInline(heading[2], root.appendChild(el(`h${Math.min(4, heading[1].length)}`)));
        i++;
        continue;
      }

      if (MD_RULE.test(line)) {
        root.appendChild(el('hr'));
        i++;
        continue;
      }

      if (MD_QUOTE.test(line)) {
        const body = [];
        while (i < lines.length && MD_QUOTE.test(lines[i])) body.push(lines[i++].replace(MD_QUOTE, ''));
        renderMarkdownBlocks(body, root.appendChild(el('blockquote')));
        continue;
      }

      const listStart = MD_LIST.exec(line);
      if (listStart) {
        const ordered = /\d/.test(listStart[2]);
        const list = root.appendChild(el(ordered ? 'ol' : 'ul'));
        const baseIndent = listStart[1].length;
        while (i < lines.length) {
          const m = MD_LIST.exec(lines[i]);
          if (!m) break;
          const li = list.appendChild(el('li'));
          const depth = Math.min(3, Math.max(0, Math.floor((m[1].length - baseIndent) / 2)));
          if (depth > 0) li.dataset.depth = String(depth);
          let content = m[3];
          const task = /^\[([ xX])\]\s+(.*)$/.exec(content);
          if (task) {
            const box = document.createElement('input');
            box.type = 'checkbox';
            box.disabled = true;
            box.checked = task[1] !== ' ';
            li.classList.add('md__task');
            li.appendChild(box);
            content = task[2];
          }
          const body = [content];
          i++;
          while (i < lines.length && lines[i].trim() && /^\s{2,}/.test(lines[i]) && !MD_LIST.test(lines[i])) {
            body.push(lines[i++].trim());
          }
          renderInlineLines(body, li);
        }
        continue;
      }

      if (line.includes('|') && i + 1 < lines.length && MD_TABLE_RULE.test(lines[i + 1])) {
        const wrap = root.appendChild(el('div', 'md__table'));
        const table = wrap.appendChild(el('table'));
        const headRow = table.appendChild(el('thead')).appendChild(el('tr'));
        for (const cell of splitTableRow(line)) renderInline(cell, headRow.appendChild(el('th')));
        const tbody = table.appendChild(el('tbody'));
        i += 2;
        while (i < lines.length && lines[i].trim() && lines[i].includes('|')) {
          const tr = tbody.appendChild(el('tr'));
          for (const cell of splitTableRow(lines[i])) renderInline(cell, tr.appendChild(el('td')));
          i++;
        }
        continue;
      }

      const para = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !MD_FENCE.test(lines[i]) &&
        !MD_HEADING.test(lines[i]) &&
        !MD_RULE.test(lines[i]) &&
        !MD_QUOTE.test(lines[i]) &&
        !(para.length > 0 && MD_LIST.test(lines[i]))
      ) {
        para.push(lines[i++].trim());
      }
      renderInlineLines(para, root.appendChild(el('p')));
    }
  }

  function renderMarkdown(source) {
    const root = el('div', 'md');
    renderMarkdownBlocks(String(source || '').replace(/\r\n?/g, '\n').split('\n'), root);
    return root;
  }

  // ---------- 文件查看与编辑 ----------

  let preview = null;

  function previewMetaText(item) {
    const full = formatFull(item.mtimeMs);
    return `${formatBytes(item.size)}${full ? `，修改于 ${full}` : ''}`;
  }

  function stopPreviewMedia() {
    els.previewModalBody.querySelectorAll('video, audio').forEach(media => {
      try {
        media.pause();
        media.removeAttribute('src');
        media.load();
      } catch {
        // 忽略媒体清理时的异常
      }
    });
  }

  function forceClosePreview() {
    preview = null;
    stopPreviewMedia();
    els.previewModalBody.textContent = '';
    if (els.previewModal.open) els.previewModal.close();
  }

  function confirmDiscardEdits(onDiscard) {
    openActionDialog({
      title: '放弃没保存的修改？',
      desc: '这份文档有修改还没有保存。',
      submitLabel: '放弃修改',
      danger: true,
      onSubmit: async () => {
        closeActionDialog();
        onDiscard();
      },
    });
  }

  function requestClosePreview() {
    if (preview?.editing && preview.dirty) {
      confirmDiscardEdits(forceClosePreview);
    } else {
      forceClosePreview();
    }
  }

  function previewNeighbors() {
    if (!preview) return { prev: null, next: null };
    const files = state.visible.filter(it => it.type !== 'dir');
    const idx = files.findIndex(it => it.path === preview.item.path);
    if (idx < 0) return { prev: null, next: null };
    return { prev: files[idx - 1] || null, next: files[idx + 1] || null };
  }

  function stepPreview(direction) {
    const target = previewNeighbors()[direction];
    if (!target) return;
    if (preview?.editing && preview.dirty) {
      confirmDiscardEdits(() => openPreview(target));
    } else {
      openPreview(target);
    }
  }

  function buildPreviewCard(item, title, desc, { newTab = false } = {}) {
    const card = el('div', 'viewer__card');
    card.append(tile(item), el('h3', '', title), el('p', '', desc));
    const btn = el('a', 'btn btn--primary');
    btn.href = newTab ? readUrlFor(item.path) : `${readUrlFor(item.path)}&download=1`;
    if (newTab) {
      btn.target = '_blank';
      btn.rel = 'noopener';
    }
    btn.append(icon(newTab ? 'i-external' : 'i-download'), el('span', '', newTab ? '在新标签页打开' : '下载文件'));
    card.appendChild(btn);
    return card;
  }

  function renderPreviewText() {
    if (!preview) return;
    const body = els.previewModalBody;
    body.textContent = '';
    els.previewEditBtn.hidden = false;
    els.previewEditBtn.classList.toggle('is-text', preview.editing);
    if (preview.editing) {
      els.previewEditText.textContent = '取消';
      els.previewSaveBtn.hidden = false;
      const editor = el('textarea', 'viewer__editor');
      editor.id = 'active-preview-textarea';
      editor.spellcheck = false;
      editor.setAttribute('aria-label', `编辑 ${preview.item.name}`);
      editor.placeholder = '在这里写内容';
      editor.value = preview.text;
      editor.addEventListener('input', () => {
        preview.dirty = true;
      });
      body.appendChild(editor);
      editor.focus();
      editor.setSelectionRange(0, 0);
      return;
    }

    els.previewEditText.textContent = '编辑';
    els.previewSaveBtn.hidden = true;
    const item = preview.item;
    if (!preview.text) {
      const doc = el('div', 'doc');
      doc.appendChild(el('p', 'doc__empty', '这份文档还是空的，点右上角的「编辑」开始写。'));
      body.appendChild(doc);
      return;
    }
    if (isMarkdownFile(item.name)) {
      const doc = el('article', 'doc');
      doc.appendChild(renderMarkdown(preview.text));
      body.appendChild(doc);
      return;
    }
    const doc = el('div', kindOf(item) === 'code' ? 'doc doc--code' : 'doc');
    doc.appendChild(el('pre', '', preview.text));
    body.appendChild(doc);
  }

  async function openPreview(item, { edit = false } = {}) {
    const readUrl = readUrlFor(item.path);
    const kind = kindOf(item);
    stopPreviewMedia();
    preview = { item, text: '', editing: false, dirty: false };

    els.previewModalTile.replaceChildren(tile(item));
    els.previewModalTitle.textContent = item.name;
    els.previewModalTitle.title = item.path;
    els.previewModalMeta.textContent = previewMetaText(item);
    els.previewDownloadLink.href = `${readUrl}&download=1`;
    els.previewEditBtn.hidden = true;
    els.previewSaveBtn.hidden = true;
    const body = els.previewModalBody;
    body.textContent = '';
    body.scrollTop = 0;

    const { prev, next } = previewNeighbors();
    els.previewPrevBtn.hidden = !prev;
    els.previewNextBtn.hidden = !next;
    els.previewEditBtn.classList.remove('is-text');
    els.previewEditText.textContent = '编辑';
    showDialog(els.previewModal);

    if (kind === 'image') {
      const stage = el('div', 'viewer__media');
      const img = document.createElement('img');
      img.src = readUrl;
      img.alt = item.name;
      stage.appendChild(img);
      body.appendChild(stage);
      return;
    }
    if (kind === 'video') {
      const stage = el('div', 'viewer__media');
      const video = document.createElement('video');
      video.controls = true;
      video.preload = 'metadata';
      video.playsInline = true;
      video.src = readUrl;
      stage.appendChild(video);
      body.appendChild(stage);
      return;
    }
    if (kind === 'audio') {
      const stage = el('div', 'viewer__media viewer__media--audio');
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.src = readUrl;
      stage.append(tile(item), audio);
      body.appendChild(stage);
      return;
    }
    if (kind === 'pdf') {
      if (window.matchMedia('(hover: none)').matches) {
        body.appendChild(buildPreviewCard(item, 'PDF 文档', '手机上请在新标签页里阅读，或者下载后查看。', { newTab: true }));
      } else {
        const frame = el('iframe', 'viewer__frame');
        frame.src = readUrl;
        frame.title = item.name;
        body.appendChild(frame);
      }
      return;
    }
    if (isEditableTextFile(item.name)) {
      if ((item.size || 0) > MAX_INLINE_TEXT_BYTES) {
        body.appendChild(buildPreviewCard(item, '文件比较大', '超过 2 MB 的文本不在页面里展开，请下载后查看。'));
        return;
      }
      const loading = el('div', 'viewer__card');
      loading.appendChild(el('p', '', '正在读取内容'));
      body.appendChild(loading);
      try {
        const res = await fetch(readUrl, { credentials: 'same-origin' });
        if (!res.ok) throw new Error('没有读到文件内容，请稍后再试。');
        const text = await res.text();
        if (!preview || preview.item.path !== item.path) return;
        preview.text = text;
        preview.editing = edit;
        renderPreviewText();
      } catch (err) {
        if (!preview || preview.item.path !== item.path) return;
        body.replaceChildren(buildPreviewCard(item, '暂时读不到内容', err.message || '请下载后查看。'));
      }
      return;
    }
    body.appendChild(buildPreviewCard(item, '这种文件不能在线查看', '下载到本地后用对应的软件打开。'));
  }

  async function savePreview() {
    if (!preview?.editing) return;
    const editor = byId('active-preview-textarea');
    const nextContent = editor ? editor.value : preview.text;
    const target = preview;
    els.previewSaveBtn.disabled = true;
    try {
      const saved = await apiJson('/api/agent/write', {
        method: 'POST',
        body: JSON.stringify({ path: target.item.path, content: nextContent }),
      });
      target.text = nextContent;
      target.editing = false;
      target.dirty = false;
      target.item.size = saved.size;
      target.item.mtimeMs = saved.mtimeMs;
      if (preview === target) {
        els.previewModalMeta.textContent = previewMetaText(target.item);
        renderPreviewText();
      }
      showNotice(`已保存「${target.item.name}」`);
      await navigateToDir(state.dir, { pushHistory: false, silent: true });
    } catch (err) {
      showNotice(err.message, 'error');
    } finally {
      els.previewSaveBtn.disabled = false;
    }
  }

  els.previewCloseBtn.addEventListener('click', requestClosePreview);
  bindBackdropClose(els.previewModal, requestClosePreview);
  els.previewModal.addEventListener('cancel', evt => {
    if (preview?.editing && preview.dirty) {
      evt.preventDefault();
      requestClosePreview();
    }
  });
  els.previewModal.addEventListener('close', () => {
    preview = null;
    stopPreviewMedia();
    els.previewModalBody.textContent = '';
  });
  els.previewEditBtn.addEventListener('click', () => {
    if (!preview) return;
    if (preview.editing && preview.dirty) {
      confirmDiscardEdits(() => {
        if (!preview) return;
        preview.editing = false;
        preview.dirty = false;
        renderPreviewText();
      });
      return;
    }
    preview.editing = !preview.editing;
    preview.dirty = false;
    renderPreviewText();
  });
  els.previewSaveBtn.addEventListener('click', savePreview);
  els.previewPrevBtn.addEventListener('click', () => stepPreview('prev'));
  els.previewNextBtn.addEventListener('click', () => stepPreview('next'));
  els.previewModal.addEventListener('keydown', evt => {
    if ((evt.metaKey || evt.ctrlKey) && evt.key.toLowerCase() === 's') {
      evt.preventDefault();
      savePreview();
      return;
    }
    if (isTypingTarget(evt.target) || evt.target instanceof HTMLMediaElement || els.actionModal.open) return;
    if (evt.key === 'ArrowLeft') stepPreview('prev');
    if (evt.key === 'ArrowRight') stepPreview('next');
  });

  window.addEventListener('beforeunload', evt => {
    if (uploadJob || (preview?.editing && preview.dirty)) {
      evt.preventDefault();
      evt.returnValue = '';
    }
  });

  // ---------- 管理设置（仅管理员） ----------

  function isAdminSession() {
    return Boolean(state.session?.allowed && state.session?.isAdmin);
  }

  function selectAdminPane(name) {
    document.querySelectorAll('[data-admin-pane]').forEach(tab => {
      const active = tab.dataset.adminPane === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      byId(`admin-pane-${tab.dataset.adminPane}`).hidden = !active;
    });
  }

  function openAdmin(pane = 'members') {
    if (!isAdminSession()) return;
    selectAdminPane(pane);
    showDialog(els.adminModal);
  }

  function closeAdmin() {
    if (els.adminModal.open) els.adminModal.close();
  }

  function buildRecordAction(label, onClick, danger = false) {
    const btn = el('button', `link-btn${danger ? ' link-btn--danger' : ''}`, label);
    btn.type = 'button';
    btn.addEventListener('click', onClick);
    return btn;
  }

  function renderWhitelist(list) {
    const rows = Array.isArray(list) ? list : [];
    els.whitelistList.textContent = '';
    els.whitelistCount.textContent = String(rows.length);
    for (const item of rows) {
      const li = el('li', 'record');
      const info = el('div', 'record__info');
      info.appendChild(el('span', 'record__title', item.masked));
      if (item.isSuperAdmin) info.appendChild(el('span', 'tag tag--role', '超级管理员'));
      else if (item.isAdmin) info.appendChild(el('span', 'tag tag--role', '管理员'));
      const isDefaultNote =
        (item.isSuperAdmin && item.note === '超级管理员') || (item.isAdmin && item.note === '管理员');
      if (item.note && !isDefaultNote) info.appendChild(el('span', 'record__note', item.note));
      li.appendChild(info);

      if (!item.isSuperAdmin) {
        const actions = el('div', 'record__actions');
        const nextRole = item.isAdmin ? 'user' : 'admin';
        actions.appendChild(
          buildRecordAction(item.isAdmin ? '取消管理员' : '设为管理员', async () => {
            try {
              const data = await apiJson('/api/whitelist/role', {
                method: 'POST',
                body: JSON.stringify({ hash: item.hash, role: nextRole }),
              });
              renderWhitelist(data.whitelist);
              showNotice(
                nextRole === 'admin' ? `已把 ${item.masked} 设为云盘管理员` : `已取消 ${item.masked} 的管理员身份`,
              );
            } catch (err) {
              showNotice(err.message, 'error');
            }
          }),
        );
        if (!item.isAdmin) {
          actions.appendChild(
            buildRecordAction(
              '移除',
              () => {
                openActionDialog({
                  title: `把 ${item.masked} 移出名单？`,
                  desc: '移除后这个手机号就不能再打开云盘，已有的文件不受影响。',
                  submitLabel: '移除',
                  danger: true,
                  onSubmit: async () => {
                    const data = await apiJson('/api/whitelist/remove', {
                      method: 'POST',
                      body: JSON.stringify({ hash: item.hash }),
                    });
                    renderWhitelist(data.whitelist);
                    showNotice(`已移除 ${item.masked}`);
                  },
                });
              },
              true,
            ),
          );
        }
        li.appendChild(actions);
      }
      els.whitelistList.appendChild(li);
    }
  }

  function renderTokens(tokens) {
    els.tokenList.textContent = '';
    if (!Array.isArray(tokens) || tokens.length === 0) {
      els.tokenList.appendChild(el('li', 'record record--empty', '还没有令牌。'));
      return;
    }
    for (const item of tokens) {
      const li = el('li', 'record');
      const info = el('div', 'record__info');
      info.append(
        el('span', 'record__title', item.name),
        el('code', 'record__code', item.prefix),
        el('span', 'record__note', `由 ${item.createdByMasked} 创建`),
      );
      const actions = el('div', 'record__actions');
      actions.appendChild(
        buildRecordAction(
          '停用',
          () => {
            openActionDialog({
              title: `停用令牌「${item.name}」？`,
              desc: '停用后，使用这个令牌的程序会立刻失去访问权限。',
              submitLabel: '停用',
              danger: true,
              onSubmit: async () => {
                const data = await apiJson('/api/tokens/revoke', {
                  method: 'POST',
                  body: JSON.stringify({ id: item.id }),
                });
                renderTokens(data.tokens);
                showNotice(`已停用令牌「${item.name}」`);
              },
            });
          },
          true,
        ),
      );
      li.append(info, actions);
      els.tokenList.appendChild(li);
    }
  }

  function renderAgentSnippet() {
    const tok = latestTokenPlain || '<你的令牌>';
    els.agentCodePre.textContent = `# 服务器上的程序：直接读写共享目录
ls -la /srv/drive

# 其他机器：查看文件列表
curl -H "Authorization: Bearer ${tok}" \\
  "https://shouyulove.cn/drive/api/agent/tree?path=/"

# 其他机器：上传文件
curl -X PUT -H "Authorization: Bearer ${tok}" \\
  --data-binary @notes.md \\
  "https://shouyulove.cn/drive/api/agent/write?path=/notes.md"`;
  }

  function applyAdminVisibility(isAdmin, session) {
    els.adminNav.hidden = !isAdmin;
    document.querySelectorAll('#overview-expand-btn, [data-admin-only]').forEach(node => {
      node.hidden = !isAdmin;
    });
    if (isAdmin) {
      renderWhitelist(session.whitelist || []);
      renderTokens(session.tokens || []);
      renderAgentSnippet();
    } else {
      closeAdmin();
      latestTokenPlain = '';
      els.whitelistList.textContent = '';
      els.tokenList.textContent = '';
      els.agentCodePre.textContent = '';
      els.issuedTokenVal.textContent = '';
      els.issuedTokenBox.hidden = true;
    }
  }

  async function copyText(text, doneMessage) {
    try {
      await navigator.clipboard.writeText(text);
      showNotice(doneMessage);
    } catch {
      showNotice('浏览器没有允许复制，请手动选中后复制。', 'error');
    }
  }

  document.querySelectorAll('[data-admin-tab]').forEach(btn => {
    btn.addEventListener('click', () => openAdmin(btn.dataset.adminTab));
  });
  document.querySelectorAll('[data-admin-pane]').forEach(tab => {
    tab.addEventListener('click', () => selectAdminPane(tab.dataset.adminPane));
    tab.addEventListener('keydown', evt => {
      if (evt.key !== 'ArrowRight' && evt.key !== 'ArrowLeft') return;
      const tabs = Array.from(document.querySelectorAll('[data-admin-pane]'));
      const next = tabs[(tabs.indexOf(tab) + (evt.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      selectAdminPane(next.dataset.adminPane);
      next.focus();
    });
  });
  els.adminCloseBtn.addEventListener('click', closeAdmin);
  bindBackdropClose(els.adminModal, closeAdmin);

  document.querySelectorAll('[data-resize-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      els.resizeGbInput.value = btn.dataset.resizePreset;
      syncPresetHighlight();
    });
  });
  els.resizeGbInput.addEventListener('input', syncPresetHighlight);

  els.resizeForm.addEventListener('submit', evt => {
    evt.preventDefault();
    const sizeGb = Number(els.resizeGbInput.value);
    if (!Number.isInteger(sizeGb) || sizeGb < 60 || sizeGb > 500) {
      showNotice('容量请填 60 到 500 之间的整数。', 'error');
      return;
    }
    if (sizeGb <= state.totalGb) {
      showNotice(`现在已经是 ${state.totalGb} GB，容量只能调大。`, 'error');
      return;
    }
    openActionDialog({
      title: `把容量调到 ${sizeGb} GB？`,
      desc: `现在是 ${state.totalGb} GB。扩容时云盘照常使用，调大以后不能在页面上调回去。`,
      submitLabel: '确认扩容',
      onSubmit: async () => {
        const data = await apiJson('/api/storage/resize', {
          method: 'POST',
          body: JSON.stringify({ sizeGb }),
        });
        renderStorage(data.storage);
        showNotice(`容量已调到 ${sizeGb} GB`);
      },
    });
  });

  els.whitelistForm.addEventListener('submit', async evt => {
    evt.preventDefault();
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
      showNotice(`已添加成员 ${data.entry.masked}`);
    } catch (err) {
      showNotice(err.message, 'error');
    }
  });

  els.tokenForm.addEventListener('submit', async evt => {
    evt.preventDefault();
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
      showNotice('新令牌已生成，请现在复制保存。');
    } catch (err) {
      showNotice(err.message, 'error');
    }
  });

  els.copyTokenBtn.addEventListener('click', () => {
    if (latestTokenPlain) copyText(latestTokenPlain, '已复制令牌');
  });
  els.closeTokenBtn.addEventListener('click', () => {
    els.issuedTokenBox.hidden = true;
  });
  els.copyAgentCodeBtn.addEventListener('click', () => {
    copyText(els.agentCodePre.textContent || '', '已复制示例');
  });

  // ---------- 统一通行证：登录、切换、退出 ----------

  let sdkFallbackPromise = null;

  async function ensurePassportSdk() {
    if (window.ShouyuAuth?.openModal) return window.ShouyuAuth;
    if (!sdkFallbackPromise) {
      sdkFallbackPromise = new Promise((resolve, reject) => {
        const failMessage = '登录窗口没有加载出来，请刷新页面再试。';
        const script = document.createElement('script');
        script.src = './auth-sdk.js';
        script.onload = () => {
          if (window.ShouyuAuth?.openModal) resolve(window.ShouyuAuth);
          else reject(new Error(failMessage));
        };
        script.onerror = () => reject(new Error(failMessage));
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
        theme: 'light',
        prompt,
      });
      if (!result) return;
      const next = await loadState();
      if (next?.allowed) {
        showNotice(result.autoRegistered ? `已注册并登录 ${next.user.phoneMasked}` : `已登录 ${next.user.phoneMasked}`);
      }
    } catch (err) {
      showNotice(err.message || '登录窗口没有打开，请稍后再试。', 'error');
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
    } catch {
      // 退出请求失败时仍然刷新一次状态，以实际会话为准
    } finally {
      try {
        window.localStorage.removeItem('jwt');
      } catch {
        // 忽略
      }
      state.dir = '/';
      syncUrlWithDir('/', true);
      const next = await loadState().catch(() => null);
      if (next && !next.authenticated) showNotice('已退出登录');
    }
  }

  // ---------- 会话状态与视图切换 ----------

  function showGate(section) {
    els.viewConsole.hidden = true;
    els.gate.hidden = false;
    els.heroSection.hidden = section !== 'guest';
    els.viewDenied.hidden = section !== 'denied';
    els.viewError.hidden = section !== 'error';
    els.navLogin.hidden = section === 'denied';
    closeMenu({ restoreFocus: false });
    document.querySelectorAll('dialog.dlg[open], dialog.viewer[open]').forEach(dialog => dialog.close());
    document.body.classList.remove('has-selection');
    els.batchBar.hidden = true;
  }

  function applyState(session, { keepExplorer = false } = {}) {
    if (!session || typeof session !== 'object') return session;
    state.session = session;
    const isAdmin = Boolean(session.allowed && session.isAdmin);
    renderStorage(session.storage);
    applyAdminVisibility(isAdmin, session);

    if (!session.authenticated) {
      showGate('guest');
      return session;
    }
    if (!session.allowed) {
      els.deniedPhone.textContent = session.user?.phoneMasked || '当前账号';
      showGate('denied');
      return session;
    }

    els.gate.hidden = true;
    els.viewConsole.hidden = false;
    els.navAccount.textContent = session.user.phoneMasked;
    els.verifiedRoleText.textContent = session.isSuperAdmin ? '超级管理员' : '管理员';
    els.verifiedRoleText.hidden = !isAdmin;

    if (!keepExplorer) {
      const nextDir = session.currentDir || state.dir || '/';
      if (nextDir !== state.dir) {
        state.selected.clear();
        state.selectMode = false;
      }
      state.dir = nextDir;
      state.items = Array.isArray(session.rootFiles) ? session.rootFiles : [];
      state.lastLoadedAt = Date.now();
      cacheTreeChildren(state.dir, state.items);
      renderExplorer();
      syncTreeToDir();
    }
    return session;
  }

  async function loadState({ keepExplorer = false } = {}) {
    try {
      const queryDir = state.dir && state.dir !== '/' ? `?dir=${encodeURIComponent(state.dir)}` : '';
      const session = await apiJson(`/api/state${queryDir}`);
      hasLoadedOnce = true;
      return applyState(session, { keepExplorer });
    } catch (err) {
      if (!hasLoadedOnce) {
        els.errorDesc.textContent = `${err.message || '没有读到网盘状态'}。可能是网络波动，或者服务正在重启。`;
        showGate('error');
      }
      throw err;
    }
  }

  // ---------- 事件绑定 ----------

  els.guestLogin.addEventListener('click', () => openPassportModal());
  els.navLogin.addEventListener('click', () => openPassportModal());
  els.errorLogin.addEventListener('click', () => openPassportModal());
  els.deniedSwitch.addEventListener('click', () => openPassportModal({ prompt: 'select_account' }));
  els.deniedLogout.addEventListener('click', doLogout);
  els.retryLoadBtn.addEventListener('click', () => {
    loadState().catch(err => showNotice(err.message, 'error'));
  });

  els.accountBtn.addEventListener('click', () => {
    const session = state.session;
    const admin = isAdminSession();
    openMenu(
      els.accountBtn,
      [
        {
          heading: session?.user?.phoneMasked || '',
          tag: admin ? (session.isSuperAdmin ? '超级管理员' : '管理员') : '',
        },
        admin && { label: '管理设置', icon: 'i-settings', onSelect: () => openAdmin('members') },
        { label: '切换账号', icon: 'i-swap', onSelect: () => openPassportModal({ prompt: 'select_account' }) },
        { label: '退出登录', icon: 'i-logout', onSelect: doLogout },
        { separator: true },
        { label: '以手予爱首页', icon: 'i-home', href: '/' },
        { label: '作品集', icon: 'i-grid', href: '/portfolio/' },
      ],
      { align: 'end' },
    );
  });

  els.uploadMenuBtn.addEventListener('click', () => {
    openMenu(els.uploadMenuBtn, [
      { label: '上传文件', icon: 't-file', onSelect: () => els.quickUploadInput.click() },
      { label: '上传文件夹', icon: 'i-folder-line', onSelect: () => els.dirUploadInput.click() },
    ]);
  });
  els.newMenuBtn.addEventListener('click', () => {
    openMenu(els.newMenuBtn, [
      { label: '新建文件夹', icon: 'i-folder-plus', onSelect: openNewFolderDialog },
      { label: '新建文档', icon: 'i-file-plus', onSelect: openNewDocDialog },
    ]);
  });
  els.emptyUploadBtn.addEventListener('click', () => els.quickUploadInput.click());
  els.emptyFolderBtn.addEventListener('click', openNewFolderDialog);

  els.sortMenuBtn.addEventListener('click', () => {
    const pick = key => ({
      label: SORT_LABELS[key],
      checked: state.sort.key === key,
      onSelect: () => setSort(key, state.sort.key === key ? state.sort.dir : undefined),
    });
    openMenu(
      els.sortMenuBtn,
      [
        pick('name'),
        pick('mtime'),
        pick('size'),
        { separator: true },
        { label: '正序', icon: 'i-arrow-up', checked: state.sort.dir === 'asc', onSelect: () => setSort(state.sort.key, 'asc') },
        { label: '倒序', icon: 'i-arrow-down', checked: state.sort.dir === 'desc', onSelect: () => setSort(state.sort.key, 'desc') },
      ],
      { align: 'end' },
    );
  });
  document.querySelectorAll('.sort-btn[data-sort]').forEach(btn => {
    btn.addEventListener('click', () => setSort(btn.dataset.sort));
  });
  els.viewListBtn.addEventListener('click', () => setView('list'));
  els.viewGridBtn.addEventListener('click', () => setView('grid'));

  els.moreMenuBtn.addEventListener('click', () => {
    const narrow = narrowQuery.matches;
    openMenu(
      els.moreMenuBtn,
      [
        narrow && state.visible.length > 0 && {
          label: state.selectMode ? '退出选择' : '选择文件',
          icon: 'i-select',
          onSelect: () => setSelectMode(!state.selectMode),
        },
        narrow && {
          label: state.view === 'grid' ? '用列表显示' : '用宫格显示',
          icon: state.view === 'grid' ? 'i-list' : 'i-grid',
          onSelect: () => setView(state.view === 'grid' ? 'list' : 'grid'),
        },
        narrow && { separator: true },
        {
          label: '刷新',
          icon: 'i-refresh',
          onSelect: async () => {
            await refreshListing();
            showNotice('列表已是最新');
          },
        },
        {
          label: state.dir === '/' ? '打包下载全部文件' : '打包下载这个文件夹',
          icon: 'i-download',
          onSelect: () => downloadZipForPaths([state.dir]),
        },
      ],
      { align: 'end' },
    );
  });

  els.selectModeBtn.addEventListener('click', () => setSelectMode(!state.selectMode));
  els.selectAllCheckbox.addEventListener('change', () => {
    if (els.selectAllCheckbox.checked) {
      for (const it of state.visible) state.selected.add(it.path);
    } else {
      state.selected.clear();
    }
    syncSelection();
  });

  const selectedItems = () => state.visible.filter(it => state.selected.has(it.path));
  els.batchZipBtn.addEventListener('click', () => {
    const items = selectedItems();
    if (items.length === 1) downloadItem(items[0]);
    else downloadZipForPaths(items.map(it => it.path));
  });
  els.batchMoveBtn.addEventListener('click', () => openMoveDialog(selectedItems().map(it => it.path)));
  els.batchDeleteBtn.addEventListener('click', () => openDeleteDialog(selectedItems()));
  els.batchClearBtn.addEventListener('click', () => setSelectMode(false));

  els.navUpBtn.addEventListener('click', () => {
    if (state.search.active) {
      clearSearch();
      renderExplorer();
      renderTree();
      return;
    }
    navigateToDir(getParentDir(state.dir));
  });

  els.fileFilterInput.addEventListener('input', () => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    const val = els.fileFilterInput.value.trim();
    els.search.classList.toggle('has-value', Boolean(els.fileFilterInput.value));
    els.searchClearBtn.hidden = !els.fileFilterInput.value;
    if (!val) {
      runGlobalSearch('');
      return;
    }
    searchDebounceTimer = setTimeout(() => runGlobalSearch(val), 200);
  });
  els.fileFilterInput.addEventListener('keydown', evt => {
    if (evt.key === 'Escape' && els.fileFilterInput.value) {
      evt.preventDefault();
      clearSearch();
      renderExplorer();
      renderTree();
    }
  });
  const resetSearch = () => {
    clearSearch();
    renderExplorer();
    renderTree();
    els.fileFilterInput.focus();
  };
  els.searchClearBtn.addEventListener('click', resetSearch);
  els.clearFilterBtn.addEventListener('click', resetSearch);

  document.addEventListener('keydown', evt => {
    if (els.viewConsole.hidden || anyDialogOpen() || activeMenu) return;
    if (isTypingTarget(evt.target)) return;
    if (evt.key === '/' && !evt.metaKey && !evt.ctrlKey && !evt.altKey) {
      evt.preventDefault();
      els.fileFilterInput.focus();
    } else if (evt.key === 'Escape' && (state.selected.size > 0 || state.selectMode)) {
      setSelectMode(false);
    } else if ((evt.key === 'Delete' || evt.key === 'Backspace') && state.selected.size > 0) {
      evt.preventDefault();
      openDeleteDialog(selectedItems());
    } else if ((evt.metaKey || evt.ctrlKey) && evt.key.toLowerCase() === 'a' && state.visible.length > 0) {
      evt.preventDefault();
      for (const it of state.visible) state.selected.add(it.path);
      syncSelection();
    }
  });

  window.addEventListener('popstate', () => {
    const nextDir = new URLSearchParams(window.location.search).get('dir') || '/';
    clearSearch();
    navigateToDir(nextDir, { pushHistory: false, silent: true });
  });

  narrowQuery.addEventListener('change', () => {
    if (!els.viewConsole.hidden) renderBreadcrumbs();
  });

  // 回到页面时静默同步一次，Agent 或服务器上新写入的文件能及时出现
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || els.viewConsole.hidden) return;
    if (Date.now() - state.lastLoadedAt < 20_000) return;
    if (anyDialogOpen() || activeMenu || uploadJob || state.selected.size > 0 || state.search.active) return;
    navigateToDir(state.dir, { pushHistory: false, silent: true });
  });

  // ---------- 启动 ----------

  const urlParams = new URLSearchParams(window.location.search);
  const loginFlag = urlParams.get('login') === '1';
  const initialDirParam = urlParams.get('dir') || '/';
  state.dir = initialDirParam.startsWith('/') ? initialDirParam : '/';
  if (urlParams.has('denied') || loginFlag || urlParams.has('next')) {
    syncUrlWithDir(state.dir, true);
  }

  const rawInitial = document.body.dataset.initialState || '';
  if (rawInitial && rawInitial !== '__INITIAL_STATE__') {
    try {
      applyState(JSON.parse(rawInitial));
      hasLoadedOnce = true;
    } catch {
      // 首屏数据解析失败时退回接口读取
    }
  }

  loadState()
    .then(session => {
      if (loginFlag && !session?.authenticated) openPassportModal();
    })
    .catch(err => showNotice(err.message, 'error'));
})();
