/**
 * ShouyuAuth Browser SDK (https://shouyulove.cn/auth/sdk.js)
 * 支持三种零门槛接入方式：
 * 1. shouyulove.cn 同域悬浮窗免跳转登录（推荐）：ShouyuAuth.openModal() / ShouyuAuth.getUser() / ShouyuAuth.logout()
 * 2. 跨域名项目悬浮弹窗免跳转 OAuth 2.0 + PKCE：ShouyuAuth.openOAuthModal()
 * 3. 传统整页重定向兼容模式：ShouyuAuth.redirectToLogin() / ShouyuAuth.startOAuth() / ShouyuAuth.handleOAuthCallback()
 */
(function (global) {
  'use strict';

  const DEFAULT_ISSUER = 'https://shouyulove.cn/auth';
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function randomBase64Url(byteLength) {
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  async function sha256Base64Url(input) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  async function solveProof(proof) {
    const encoder = new TextEncoder();
    for (let start = 0; start <= proof.maximum; start += 64) {
      const batch = Array.from({ length: Math.min(64, proof.maximum + 1 - start) }, (_, idx) => start + idx);
      const digests = await Promise.all(
        batch.map(async num => {
          const buf = await crypto.subtle.digest('SHA-256', encoder.encode(`${proof.salt}:${num}`));
          return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
        }),
      );
      const hit = digests.indexOf(proof.target);
      if (hit >= 0) return batch[hit];
    }
    throw new Error('安全校验未完成，请重试。');
  }

  function formatMaskedPhone(text) {
    if (!text) return '';
    return String(text).replace(/^(\d{3})(\*{4})(\d{4})$/, '$1 **** $3');
  }

  function detectTheme(preferred) {
    if (preferred === 'dark' || preferred === 'light') return preferred;
    if (typeof document !== 'undefined') {
      const cs = global.getComputedStyle?.(document.documentElement)?.colorScheme || '';
      if (cs.includes('dark')) return 'dark';
      if (cs.includes('light')) return 'light';
    }
    if (global.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'dark';
  }

    function ensureModalStylesheet(base) {
      if (typeof document === 'undefined') return Promise.resolve();
      const href = `${base}/modal.css`;
      const existing = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find(link => {
        const raw = link.getAttribute('href') || '';
        return (
          raw === href ||
          raw.endsWith('/auth/modal.css') ||
          raw.endsWith('/auth-modal.css') ||
          link.dataset.sylModalCss === '1'
        );
      });
    if (existing) return Promise.resolve();

    return new Promise(resolve => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.dataset.sylModalCss = '1';
      const done = () => resolve();
      link.addEventListener('load', done, { once: true });
      link.addEventListener('error', done, { once: true });
      setTimeout(done, 1500);
      document.head.appendChild(link);
    });
  }

  function createSvg(viewBox, children) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', viewBox);
    svg.setAttribute('fill', 'none');
    svg.setAttribute('aria-hidden', 'true');
    for (const spec of children) {
      const node = document.createElementNS(SVG_NS, spec.tag);
      for (const [k, v] of Object.entries(spec.attrs)) {
        node.setAttribute(k, v);
      }
      svg.appendChild(node);
    }
    return svg;
  }

  let modalController = null;

  function getOrCreateModalController() {
    if (modalController) return modalController;

    const dialog = document.createElement('dialog');
    dialog.className = 'syl-auth-modal';
    dialog.setAttribute('aria-labelledby', 'syl-modal-title');

    const panel = document.createElement('div');
    panel.className = 'syl-modal-panel';

    // Header
    const head = document.createElement('div');
    head.className = 'syl-modal-head';

    const brand = document.createElement('div');
    brand.className = 'syl-modal-brand';

    const mark = document.createElement('span');
    mark.className = 'syl-modal-mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.appendChild(
      createSvg('0 0 28 28', [
        {
          tag: 'rect',
          attrs: { x: '3', y: '5', width: '22', height: '18', rx: '4.5', stroke: '#07080d', 'stroke-width': '2.2' },
        },
        {
          tag: 'circle',
          attrs: { cx: '11', cy: '14', r: '3.2', stroke: '#07080d', 'stroke-width': '2.1' },
        },
        {
          tag: 'path',
          attrs: { d: 'M14.2 14h6.8M18.5 14v2.6', stroke: '#ff5a3c', 'stroke-width': '2.2', 'stroke-linecap': 'round' },
        },
      ]),
    );

    const titles = document.createElement('div');
    titles.className = 'syl-modal-titles';
    const titleEl = document.createElement('h2');
    titleEl.id = 'syl-modal-title';
    titleEl.className = 'syl-modal-title';
    titleEl.textContent = '手语分社账号';
    const subtitleEl = document.createElement('p');
    subtitleEl.className = 'syl-modal-subtitle';
    titles.append(titleEl, subtitleEl);
    brand.append(mark, titles);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'syl-modal-close';
    closeBtn.setAttribute('aria-label', '关闭登录窗口');
    closeBtn.appendChild(
      createSvg('0 0 20 20', [
        {
          tag: 'path',
          attrs: {
            d: 'M5.5 5.5l9 9M14.5 5.5l-9 9',
            stroke: 'currentColor',
            'stroke-width': '1.75',
            'stroke-linecap': 'round',
          },
        },
      ]),
    );
    head.append(brand, closeBtn);

    const noticeEl = document.createElement('div');
    noticeEl.className = 'syl-modal-notice';
    noticeEl.setAttribute('role', 'alert');
    noticeEl.hidden = true;

    const currentSwitchBar = document.createElement('div');
    currentSwitchBar.className = 'syl-modal-current';
    currentSwitchBar.hidden = true;
    const currentSwitchLabel = document.createElement('span');
    currentSwitchLabel.textContent = '当前已登录';
    const currentSwitchPhone = document.createElement('strong');
    currentSwitchBar.append(currentSwitchLabel, currentSwitchPhone);

    // Logged-in quick confirmation view
    const accountView = document.createElement('div');
    accountView.className = 'syl-modal-account';
    accountView.hidden = true;

    const passBox = document.createElement('div');
    passBox.className = 'syl-modal-pass';
    const passStatus = document.createElement('span');
    passStatus.className = 'syl-modal-pass-status';
    const passDot = document.createElement('span');
    passDot.className = 'syl-modal-dot';
    passDot.setAttribute('aria-hidden', 'true');
    const passStatusText = document.createElement('span');
    passStatusText.textContent = '通行证有效';
    const passRoleBadge = document.createElement('span');
    passRoleBadge.className = 'syl-modal-role';
    passStatus.append(passDot, passStatusText, passRoleBadge);
    const passPhone = document.createElement('strong');
    passPhone.className = 'syl-modal-pass-phone';
    passBox.append(passStatus, passPhone);

    const continueBtn = document.createElement('button');
    continueBtn.type = 'button';
    continueBtn.className = 'syl-btn syl-btn--primary';
    continueBtn.textContent = '继续使用当前账号';

    const accountActions = document.createElement('div');
    accountActions.className = 'syl-modal-account-actions';
    const toChangeBtn = document.createElement('button');
    toChangeBtn.type = 'button';
    toChangeBtn.className = 'syl-btn syl-btn--secondary';
    toChangeBtn.textContent = '修改密码';
    const switchBtn = document.createElement('button');
    switchBtn.type = 'button';
    switchBtn.className = 'syl-btn syl-btn--secondary';
    switchBtn.textContent = '切换其他账号';
    accountActions.append(toChangeBtn, switchBtn);
    accountView.append(passBox, continueBtn, accountActions);

    // Form view
    const formWrap = document.createElement('div');

    const tabs = document.createElement('div');
    tabs.className = 'syl-modal-tabs';
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', '登录方式');
    const tabSms = document.createElement('button');
    tabSms.type = 'button';
    tabSms.className = 'syl-modal-tab is-active';
    tabSms.setAttribute('role', 'tab');
    tabSms.setAttribute('aria-selected', 'true');
    tabSms.textContent = '验证码登录';
    const tabPwd = document.createElement('button');
    tabPwd.type = 'button';
    tabPwd.className = 'syl-modal-tab';
    tabPwd.setAttribute('role', 'tab');
    tabPwd.setAttribute('aria-selected', 'false');
    tabPwd.textContent = '密码登录';
    tabs.append(tabSms, tabPwd);

    const form = document.createElement('form');
    form.className = 'syl-modal-form';
    form.noValidate = true;

    const phoneField = document.createElement('div');
    phoneField.className = 'syl-field';
    const phoneLabel = document.createElement('label');
    phoneLabel.className = 'syl-sr-only';
    phoneLabel.htmlFor = 'syl-modal-phone';
    phoneLabel.textContent = '手机号';
    const phoneShell = document.createElement('div');
    phoneShell.className = 'syl-input-shell';
    const phonePrefix = document.createElement('span');
    phonePrefix.className = 'syl-phone-prefix';
    phonePrefix.setAttribute('aria-hidden', 'true');
    phonePrefix.textContent = '+86';
    const phoneInput = document.createElement('input');
    phoneInput.id = 'syl-modal-phone';
    phoneInput.type = 'tel';
    phoneInput.inputMode = 'numeric';
    phoneInput.autocomplete = 'tel-national';
    phoneInput.maxLength = 16;
    phoneInput.placeholder = '输入 11 位手机号';
    phoneShell.append(phonePrefix, phoneInput);
    phoneField.append(phoneLabel, phoneShell);

    const codeField = document.createElement('div');
    codeField.className = 'syl-field';
    const codeLabel = document.createElement('label');
    codeLabel.className = 'syl-sr-only';
    codeLabel.htmlFor = 'syl-modal-code';
    codeLabel.textContent = '短信验证码';
    const codeRow = document.createElement('div');
    codeRow.className = 'syl-code-row';
    const codeShell = document.createElement('div');
    codeShell.className = 'syl-input-shell';
    const codeInput = document.createElement('input');
    codeInput.id = 'syl-modal-code';
    codeInput.type = 'text';
    codeInput.inputMode = 'numeric';
    codeInput.autocomplete = 'one-time-code';
    codeInput.maxLength = 6;
    codeInput.placeholder = '6 位短信验证码';
    codeShell.appendChild(codeInput);
    const sendCodeBtn = document.createElement('button');
    sendCodeBtn.type = 'button';
    sendCodeBtn.className = 'syl-btn syl-btn--secondary';
    sendCodeBtn.textContent = '获取验证码';
    codeRow.append(codeShell, sendCodeBtn);
    codeField.append(codeLabel, codeRow);

    const pwdField = document.createElement('div');
    pwdField.className = 'syl-field';
    pwdField.hidden = true;
    const pwdLabel = document.createElement('label');
    pwdLabel.className = 'syl-sr-only';
    pwdLabel.htmlFor = 'syl-modal-password';
    pwdLabel.textContent = '密码';
    const pwdShell = document.createElement('div');
    pwdShell.className = 'syl-input-shell';
    const pwdInput = document.createElement('input');
    pwdInput.id = 'syl-modal-password';
    pwdInput.type = 'password';
    pwdInput.autocomplete = 'current-password';
    pwdInput.minLength = 8;
    pwdInput.maxLength = 128;
    pwdInput.placeholder = '登录密码';
    const togglePwdBtn = document.createElement('button');
    togglePwdBtn.type = 'button';
    togglePwdBtn.className = 'syl-icon-btn';
    togglePwdBtn.setAttribute('aria-label', '显示密码');
    const eyeOpen = createSvg('0 0 20 20', [
      {
        tag: 'path',
        attrs: {
          d: 'M2.2 10S5 4.5 10 4.5 17.8 10 17.8 10 15 15.5 10 15.5 2.2 10 2.2 10Z',
          stroke: 'currentColor',
          'stroke-width': '1.6',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
        },
      },
      {
        tag: 'circle',
        attrs: { cx: '10', cy: '10', r: '2.6', stroke: 'currentColor', 'stroke-width': '1.6' },
      },
    ]);
    const eyeClosed = createSvg('0 0 20 20', [
      {
        tag: 'path',
        attrs: {
          d: 'M3 3l14 14M8.2 8.3a2.6 2.6 0 0 0 3.5 3.5M5.4 5.6C3.5 6.9 2.2 10 2.2 10s2.8 5.5 7.8 5.5c1.7 0 3.2-.6 4.5-1.4M9.2 4.6c.3 0 .5-.1.8-.1 5 0 7.8 5.5 7.8 5.5a13.4 13.4 0 0 1-2.1 2.9',
          stroke: 'currentColor',
          'stroke-width': '1.6',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
        },
      },
    ]);
    eyeClosed.setAttribute('hidden', '');
    togglePwdBtn.append(eyeOpen, eyeClosed);
    pwdShell.append(pwdInput, togglePwdBtn);
    pwdField.append(pwdLabel, pwdShell);

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'syl-btn syl-btn--primary';
    submitBtn.textContent = '登录';

    const autoHint = document.createElement('p');
    autoHint.className = 'syl-hint';
    autoHint.textContent = '未注册手机号验证通过后将自动创建账号';

    form.append(phoneField, codeField, pwdField, submitBtn, autoHint);

    const foot = document.createElement('div');
    foot.className = 'syl-modal-foot';
    const toRegisterBtn = document.createElement('button');
    toRegisterBtn.type = 'button';
    toRegisterBtn.className = 'syl-link-btn';
    toRegisterBtn.textContent = '密码注册';
    const footDot = document.createElement('span');
    footDot.className = 'syl-foot-dot';
    footDot.setAttribute('aria-hidden', 'true');
    footDot.textContent = '·';
    const toResetBtn = document.createElement('button');
    toResetBtn.type = 'button';
    toResetBtn.className = 'syl-link-btn';
    toResetBtn.textContent = '忘记密码';
    const toLoginBtn = document.createElement('button');
    toLoginBtn.type = 'button';
    toLoginBtn.className = 'syl-link-btn';
    toLoginBtn.textContent = '返回登录';
    toLoginBtn.hidden = true;
    foot.append(toRegisterBtn, footDot, toResetBtn, toLoginBtn);

    formWrap.append(tabs, form, foot);
    panel.append(head, noticeEl, currentSwitchBar, accountView, formWrap);
    dialog.appendChild(panel);
    document.body.appendChild(dialog);

    const state = {
      base: '/auth',
      appName: '',
      project: '',
      prompt: '',
      mode: 'login',
      forceForm: false,
      user: null,
      challengeId: '',
      retryUntil: 0,
      retryPhone: '',
      sending: false,
      busy: false,
      resolver: null,
      onSuccess: null,
      onCancel: null,
      timerId: null,
    };

    function cleanPhoneValue() {
      return phoneInput.value.trim().replace(/^\+?86[\s-]*/, '').replace(/[\s-]/g, '');
    }

    function setNotice(message, isOk = false) {
      if (!message) {
        noticeEl.hidden = true;
        noticeEl.textContent = '';
        noticeEl.classList.remove('is-ok');
        return;
      }
      noticeEl.textContent = message;
      noticeEl.classList.toggle('is-ok', Boolean(isOk));
      noticeEl.hidden = false;
    }

    async function apiGet(path) {
      const res = await fetch(`${state.base}/api/${path}`, {
        method: 'GET',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = new Error(data.message || '请求失败，请稍后重试。');
        err.retryAfter = Number(res.headers.get('Retry-After') || 0);
        throw err;
      }
      return data;
    }

    async function apiPost(path, payload) {
      const res = await fetch(`${state.base}/api/${path}`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = new Error(data.message || '操作未成功，请稍后再试。');
        err.code = data.code;
        err.retryAfter = Number(res.headers.get('Retry-After') || 0);
        throw err;
      }
      return data;
    }

    function updateSendCodeButton() {
      const activePhone = state.mode === 'change' ? '__current__' : cleanPhoneValue();
      const remaining =
        state.retryPhone === activePhone ? Math.max(0, Math.ceil((state.retryUntil - Date.now()) / 1000)) : 0;
      if (state.sending) {
        sendCodeBtn.textContent = '发送中…';
        sendCodeBtn.disabled = true;
        return;
      }
      if (remaining > 0) {
        sendCodeBtn.textContent = `${remaining}s 后重发`;
        sendCodeBtn.disabled = true;
        return;
      }
      sendCodeBtn.textContent = '获取验证码';
      const needsPhone = state.mode !== 'change';
      sendCodeBtn.disabled = state.busy || (needsPhone && cleanPhoneValue().length < 11);
    }

    function render() {
      const appSuffix = state.appName ? `「${state.appName}」` : '当前服务';
      const showQuickAccount =
        Boolean(state.user) && !state.forceForm && state.mode !== 'change' && state.prompt !== 'select_account' && state.prompt !== 'login';

      if (showQuickAccount) {
        titleEl.textContent = '手语分社统一通行证';
        subtitleEl.textContent = `当前通行证已就绪，可直接进入${appSuffix}`;
        currentSwitchBar.hidden = true;
        accountView.hidden = false;
        formWrap.hidden = true;
        passPhone.textContent = formatMaskedPhone(state.user.phoneMasked);
        const isSuperAdmin = Boolean(state.user.isSuperAdmin);
        const isAdmin = Boolean(state.user.isAdmin);
        passRoleBadge.textContent = isSuperAdmin
          ? '超级管理员'
          : state.project
            ? isAdmin
              ? '本项目管理员'
              : '普通用户'
            : '普通用户';
        passRoleBadge.classList.toggle('is-admin', isAdmin);
        toChangeBtn.textContent = state.user.hasPassword === false ? '设置密码' : '修改密码';
        continueBtn.textContent = state.appName ? `继续进入「${state.appName}」` : '继续使用当前账号';
        continueBtn.disabled = state.busy;
        return;
      }

      accountView.hidden = true;
      formWrap.hidden = false;

      if (state.user && state.mode !== 'change') {
        currentSwitchBar.hidden = false;
        currentSwitchLabel.textContent = '当前已登录账号';
        currentSwitchPhone.textContent = formatMaskedPhone(state.user.phoneMasked);
      } else if (state.user && state.mode === 'change') {
        currentSwitchBar.hidden = false;
        currentSwitchLabel.textContent = '正在为当前账号设置密码';
        currentSwitchPhone.textContent = formatMaskedPhone(state.user.phoneMasked);
      } else {
        currentSwitchBar.hidden = true;
      }

      const isLoginGroup = state.mode === 'login' || state.mode === 'password';
      const isSmsMode = state.mode !== 'password';
      const needsPassword = state.mode !== 'login';

      titleEl.textContent =
        state.mode === 'register'
          ? '密码注册通行证'
          : state.mode === 'reset'
            ? '找回通行证密码'
            : state.mode === 'change'
              ? state.user?.hasPassword === false
                ? '设置登录密码'
                : '修改登录密码'
              : state.prompt === 'select_account' && state.user
                ? '切换通行证账号'
                : '手语分社统一通行证';

      subtitleEl.textContent =
        state.prompt === 'select_account' && state.user
          ? `切换账号以访问${appSuffix}`
          : `登录以继续访问${appSuffix}`;

      tabs.hidden = !isLoginGroup;
      if (isLoginGroup) {
        const pwdActive = state.mode === 'password';
        tabSms.classList.toggle('is-active', !pwdActive);
        tabSms.setAttribute('aria-selected', String(!pwdActive));
        tabPwd.classList.toggle('is-active', pwdActive);
        tabPwd.setAttribute('aria-selected', String(pwdActive));
      }

      phoneField.hidden = state.mode === 'change';
      codeField.hidden = !isSmsMode;
      pwdField.hidden = !needsPassword;
      if (needsPassword) {
        pwdInput.placeholder =
          state.mode === 'password'
            ? '输入登录密码'
            : state.mode === 'register'
              ? '设置登录密码（至少 8 位）'
              : '设置新密码（至少 8 位）';
        pwdInput.autocomplete = state.mode === 'password' ? 'current-password' : 'new-password';
      }

      submitBtn.textContent = state.busy
        ? '正在验证…'
        : state.mode === 'register'
          ? '注册并登录'
          : state.mode === 'reset'
            ? '重置密码并登录'
            : state.mode === 'change'
              ? '保存新密码'
              : '登录';

      submitBtn.disabled =
        state.busy ||
        state.sending ||
        (isSmsMode && (!state.challengeId || codeInput.value.trim().length < 6)) ||
        (!isSmsMode && (!cleanPhoneValue() || !pwdInput.value));

      autoHint.hidden = state.mode !== 'login';
      toRegisterBtn.hidden = !isLoginGroup;
      footDot.hidden = !isLoginGroup;
      toResetBtn.hidden = !isLoginGroup;
      toLoginBtn.hidden = isLoginGroup;
      toLoginBtn.textContent = state.mode === 'change' && !state.forceForm ? '返回账号卡片' : '返回登录';

      updateSendCodeButton();
    }

    function setMode(nextMode) {
      state.mode = nextMode;
      state.challengeId = '';
      codeInput.value = '';
      pwdInput.value = '';
      setNotice('');
      render();
      if (nextMode !== 'change') {
        phoneInput.focus();
      } else {
        codeInput.focus();
      }
    }

    function finishAndClose(result) {
      if (state.timerId) {
        clearInterval(state.timerId);
        state.timerId = null;
      }
      if (dialog.open) {
        dialog.close();
      }
      const resolver = state.resolver;
      const onSuccess = state.onSuccess;
      const onCancel = state.onCancel;
      state.resolver = null;
      state.onSuccess = null;
      state.onCancel = null;

      if (result) {
        if (typeof global.CustomEvent === 'function') {
          global.dispatchEvent(new CustomEvent('shouyu-auth:change', { detail: result }));
        }
        if (typeof onSuccess === 'function') {
          onSuccess(result);
        }
      } else if (typeof onCancel === 'function') {
        onCancel();
      }
      if (typeof resolver === 'function') {
        resolver(result);
      }
    }

    async function handleSendCode() {
      const phone = state.mode === 'change' ? undefined : cleanPhoneValue();
      if (state.mode !== 'change' && !/^1[3-9]\d{9}$/.test(phone)) {
        setNotice('请输入有效的 11 位中国大陆手机号。');
        phoneInput.focus();
        return;
      }
      setNotice('');
      state.sending = true;
      updateSendCodeButton();
      try {
        await apiGet('session');
        const proof = await apiPost('proof', { phone, purpose: state.mode });
        const answer = await solveProof(proof);
        const sent = await apiPost('sms', {
          phone,
          purpose: state.mode,
          proofId: proof.id,
          answer,
        });
        state.challengeId = sent.challengeId;
        state.retryPhone = state.mode === 'change' ? '__current__' : phone;
        state.retryUntil = Date.now() + (sent.retryAfter || 60) * 1000;
        setNotice('验证码已发送，5 分钟内有效。', true);
        codeInput.focus();
      } catch (err) {
        setNotice(err.message);
        if (err.retryAfter) {
          state.retryPhone = state.mode === 'change' ? '__current__' : phone;
          state.retryUntil = Date.now() + err.retryAfter * 1000;
        }
      } finally {
        state.sending = false;
        render();
      }
    }

    tabSms.addEventListener('click', () => setMode('login'));
    tabPwd.addEventListener('click', () => setMode('password'));
    toRegisterBtn.addEventListener('click', () => setMode('register'));
    toResetBtn.addEventListener('click', () => setMode('reset'));
    toLoginBtn.addEventListener('click', () => {
      if (state.mode === 'change' && state.user && !state.forceForm) {
        state.mode = 'login';
        setNotice('');
        render();
        return;
      }
      setMode('login');
    });
    toChangeBtn.addEventListener('click', () => setMode('change'));
    switchBtn.addEventListener('click', () => {
      state.forceForm = true;
      state.prompt = 'select_account';
      phoneInput.value = '';
      setMode('login');
    });
    continueBtn.addEventListener('click', () => {
      if (state.user) {
        finishAndClose({ user: state.user, autoRegistered: false });
      }
    });

    phoneInput.addEventListener('input', () => {
      state.challengeId = '';
      render();
    });

    phoneInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && state.mode !== 'password' && !state.challengeId) {
        e.preventDefault();
        if (!sendCodeBtn.disabled) handleSendCode();
      }
    });

    codeInput.addEventListener('input', () => render());
    pwdInput.addEventListener('input', () => render());

    togglePwdBtn.addEventListener('click', () => {
      const reveal = pwdInput.type === 'password';
      pwdInput.type = reveal ? 'text' : 'password';
      eyeOpen.toggleAttribute('hidden', reveal);
      eyeClosed.toggleAttribute('hidden', !reveal);
      togglePwdBtn.setAttribute('aria-label', reveal ? '隐藏密码' : '显示密码');
    });

    sendCodeBtn.addEventListener('click', handleSendCode);

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const isSmsMode = state.mode !== 'password';
      const phone = state.mode === 'change' ? undefined : cleanPhoneValue();
      if (state.mode !== 'change' && !/^1[3-9]\d{9}$/.test(phone)) {
        setNotice('请输入有效的 11 位中国大陆手机号。');
        phoneInput.focus();
        return;
      }
      if (isSmsMode && !/^\d{6}$/.test(codeInput.value.trim())) {
        setNotice('请输入 6 位数字短信验证码。');
        codeInput.focus();
        return;
      }
      if (state.mode !== 'login' && pwdInput.value.length < 8) {
        setNotice('登录密码长度至少需 8 位。');
        pwdInput.focus();
        return;
      }

      setNotice('');
      state.busy = true;
      render();
      try {
        if (!isSmsMode) {
          const sessionPath = state.project
            ? `session?project=${encodeURIComponent(state.project)}`
            : 'session';
          await apiGet(sessionPath);
        }
        const payload = isSmsMode
          ? {
              phone,
              code: codeInput.value.trim(),
              password: state.mode === 'login' ? undefined : pwdInput.value,
              challengeId: state.challengeId,
              purpose: state.mode,
              ...(state.project ? { project: state.project } : {}),
            }
          : {
              phone,
              password: pwdInput.value,
              ...(state.project ? { project: state.project } : {}),
            };

        const snap = await apiPost(isSmsMode ? 'verify' : 'password', payload);
        state.user = snap.user;
        state.challengeId = '';
        state.retryUntil = 0;
        state.retryPhone = '';
        codeInput.value = '';
        pwdInput.value = '';
        finishAndClose({
          user: snap.user,
          autoRegistered: Boolean(snap.autoRegistered),
        });
      } catch (err) {
        setNotice(err.message);
      } finally {
        state.busy = false;
        if (dialog.open) render();
      }
    });

    closeBtn.addEventListener('click', () => finishAndClose(null));
    dialog.addEventListener('cancel', e => {
      e.preventDefault();
      finishAndClose(null);
    });
    dialog.addEventListener('click', e => {
      if (e.target === dialog) {
        finishAndClose(null);
      }
    });

    modalController = {
      async open(options = {}) {
        const base = (options.issuer || '/auth').replace(/\/+$/, '');
        await ensureModalStylesheet(base);

        if (dialog.open && state.resolver) {
          finishAndClose(null);
        }

        state.base = base;
        state.appName = String(options.appName || '').trim().slice(0, 32);
        state.project = String(options.project || '').trim();
        state.prompt = String(options.prompt || '').trim();
        state.mode =
          options.mode === 'password' || options.mode === 'register' || options.mode === 'reset' || options.mode === 'change'
            ? options.mode
            : 'login';
        state.forceForm = state.prompt === 'select_account' || state.prompt === 'login';
        state.challengeId = '';
        state.sending = false;
        state.busy = false;
        state.onSuccess = options.onSuccess || null;
        state.onCancel = options.onCancel || null;

        dialog.dataset.sylTheme = detectTheme(options.theme);
        phoneInput.value = '';
        codeInput.value = '';
        pwdInput.value = '';
        setNotice('');

        if (state.timerId) clearInterval(state.timerId);
        state.timerId = setInterval(() => {
          if (state.retryUntil > 0) {
            updateSendCodeButton();
            if (Date.now() >= state.retryUntil) state.retryUntil = 0;
          }
        }, 500);

        const resultPromise = new Promise(resolve => {
          state.resolver = resolve;
        });

        render();
        dialog.showModal();

        try {
          const sessionPath = state.project
            ? `session?project=${encodeURIComponent(state.project)}`
            : 'session';
          const snap = await apiGet(sessionPath);
          state.user = snap.user || null;
          if (dialog.open) {
            render();
            if (accountView.hidden && !phoneField.hidden) {
              phoneInput.focus();
            } else if (!accountView.hidden) {
              continueBtn.focus();
            }
          }
        } catch (err) {
          if (dialog.open) {
            setNotice(err.message);
            render();
          }
        }

        return resultPromise;
      },
      close() {
        finishAndClose(null);
      },
    };

    return modalController;
  }

  const ShouyuAuth = {
    /**
     * 同域读取当前已登录的手语分社账号（未登录返回 null）；传入 project 可查询指定项目的隔离权限（super_admin / admin / user）
     */
    async getUser(options = {}) {
      const base = (options.issuer || '/auth').replace(/\/+$/, '');
      const project = String(options.project || '').trim();
      const query = project ? `?project=${encodeURIComponent(project)}` : '';
      const res = await fetch(`${base}/api/me${query}`, {
        method: 'GET',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.authenticated ? data.user : null;
    },

    /**
     * 读取指定项目（或同域通行证）的管理员名单（需管理员会话或 OAuth Bearer 令牌）
     */
    async getRoles(options = {}) {
      const base = (options.issuer || (options.accessToken ? DEFAULT_ISSUER : '/auth')).replace(/\/+$/, '');
      const scope = String(options.scope || options.project || '').trim();
      if (options.accessToken) {
        const res = await fetch(`${base}/oauth/roles`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${options.accessToken}`,
          },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error_description || data.message || '读取项目权限失败。');
        return data;
      }
      const query = scope ? `?scope=${encodeURIComponent(scope)}` : '';
      const res = await fetch(`${base}/api/roles${query}`, {
        method: 'GET',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || '读取项目权限失败。');
      return data;
    },

    /**
     * 在当前项目内授予目标账号管理员权限（支持未注册手机号预授权，严格按项目隔离）
     */
    async grantAdmin(options = {}) {
      const base = (options.issuer || (options.accessToken ? DEFAULT_ISSUER : '/auth')).replace(/\/+$/, '');
      if (options.accessToken) {
        const res = await fetch(`${base}/oauth/roles/grant`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${options.accessToken}`,
          },
          body: JSON.stringify({
            phone: options.phone || undefined,
            userId: options.userId || undefined,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error_description || data.message || '授予管理员权限失败。');
        return data;
      }
      const res = await fetch(`${base}/api/roles/grant`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          scope: options.scope || options.project || '__pass__',
          phone: options.phone || undefined,
          userId: options.userId || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || '授予管理员权限失败。');
      return data;
    },

    /**
     * 在当前项目内撤销目标账号的管理员权限（严格按项目隔离）
     */
    async revokeAdmin(options = {}) {
      const base = (options.issuer || (options.accessToken ? DEFAULT_ISSUER : '/auth')).replace(/\/+$/, '');
      if (options.accessToken) {
        const res = await fetch(`${base}/oauth/roles/revoke`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${options.accessToken}`,
          },
          body: JSON.stringify({
            phone: options.phone || undefined,
            userId: options.userId || undefined,
            phoneHash: options.phoneHash || undefined,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error_description || data.message || '撤销管理员权限失败。');
        return data;
      }
      const res = await fetch(`${base}/api/roles/revoke`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          scope: options.scope || options.project || '__pass__',
          phone: options.phone || undefined,
          userId: options.userId || undefined,
          phoneHash: options.phoneHash || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || '撤销管理员权限失败。');
      return data;
    },

    /**
     * 同域在当前页面弹出统一通行证悬浮窗完成登录 / 注册 / 切换账号（零整页跳转）
     */
    async openModal(options = {}) {
      const ctrl = getOrCreateModalController();
      return ctrl.open(options);
    },

    /**
     * 关闭当前打开的悬浮窗登录框
     */
    closeModal() {
      if (modalController) modalController.close();
    },

    /**
     * 构造同域登录跳转地址（兼容旧版跳转调用）
     */
    loginUrl(options = {}) {
      const base = (options.issuer || '/auth').replace(/\/+$/, '');
      const params = new URLSearchParams();
      const target = options.returnTo || (global.location ? global.location.pathname + global.location.search : '/');
      if (target && target.startsWith('/')) params.set('return_to', target);
      if (options.appName) params.set('app', options.appName);
      if (options.project) params.set('project', options.project);
      if (options.mode) params.set('mode', options.mode);
      if (options.prompt) params.set('prompt', options.prompt);
      const qs = params.toString();
      return `${base}/${qs ? '?' + qs : ''}`;
    },

    /**
     * 同域跳转前往登录页（兼容旧版；新接入推荐使用 openModal 免跳转）
     */
    redirectToLogin(options = {}) {
      global.location.href = this.loginUrl(options);
    },

    /**
     * 同域退出登录（保持当前页面不跳转）
     */
    async logout(options = {}) {
      const base = (options.issuer || '/auth').replace(/\/+$/, '');
      await fetch(`${base}/api/session`, { method: 'GET', credentials: 'same-origin' });
      const res = await fetch(`${base}/api/logout`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ allDevices: Boolean(options.allDevices) }),
      });
      return res.ok;
    },

    /**
     * 跨域名 OAuth 2.0 + PKCE 悬浮小窗免跳转登录（宿主页面不发生整页跳转）
     */
    async openOAuthModal({ clientId, redirectUri, scope = 'openid', prompt = '', issuer = DEFAULT_ISSUER }) {
      const cleanIssuer = issuer.replace(/\/+$/, '');
      const issuerOrigin = new URL(cleanIssuer).origin;
      const state = randomBase64Url(18);
      const codeVerifier = randomBase64Url(32);
      const codeChallenge = await sha256Base64Url(codeVerifier);
      sessionStorage.setItem(
        `shouyu_oauth_${state}`,
        JSON.stringify({ clientId, redirectUri, codeVerifier, issuer: cleanIssuer, at: Date.now() }),
      );

      const url = new URL(`${cleanIssuer}/oauth/authorize`);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('client_id', clientId);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('scope', scope);
      url.searchParams.set('state', state);
      url.searchParams.set('code_challenge', codeChallenge);
      url.searchParams.set('code_challenge_method', 'S256');
      url.searchParams.set('display', 'popup');
      if (prompt) url.searchParams.set('prompt', prompt);

      const width = 440;
      const height = 620;
      const left = Math.max(0, Math.round((global.screenX || 0) + ((global.outerWidth || 1024) - width) / 2));
      const top = Math.max(0, Math.round((global.screenY || 0) + ((global.outerHeight || 768) - height) / 2));
      const popup = global.open(
        url.toString(),
        'shouyu_auth_popup',
        `popup=yes,width=${width},height=${height},left=${left},top=${top}`,
      );
      if (!popup) {
        throw new Error('浏览器拦截了登录小窗，请允许当前站点弹出窗口后重试。');
      }

      return new Promise((resolve, reject) => {
        let settled = false;
        const cleanup = () => {
          global.removeEventListener('message', onMessage);
          clearInterval(closeWatcher);
        };

        const onMessage = async event => {
          if (event.origin !== issuerOrigin && event.origin !== global.location?.origin) return;
          const msg = event.data;
          if (!msg || msg.type !== 'shouyu-auth:oauth-callback' || msg.state !== state) return;
          settled = true;
          cleanup();
          try {
            popup.close();
          } catch {
            // Ignore cross-origin close restrictions
          }
          try {
            const qs = `?code=${encodeURIComponent(msg.code)}&state=${encodeURIComponent(msg.state)}`;
            const tokenData = await ShouyuAuth.handleOAuthCallback(qs);
            resolve(tokenData);
          } catch (err) {
            reject(err);
          }
        };

        global.addEventListener('message', onMessage);
        const closeWatcher = setInterval(() => {
          if (popup.closed && !settled) {
            settled = true;
            cleanup();
            sessionStorage.removeItem(`shouyu_oauth_${state}`);
            resolve(null);
          }
        }, 400);
      });
    },

    /**
     * 跨域名 OAuth 2.0 + PKCE 发起登录跳转
     */
    async startOAuth({ clientId, redirectUri, scope = 'openid', prompt = '', issuer = DEFAULT_ISSUER }) {
      const cleanIssuer = issuer.replace(/\/+$/, '');
      const state = randomBase64Url(18);
      const codeVerifier = randomBase64Url(32);
      const codeChallenge = await sha256Base64Url(codeVerifier);
      sessionStorage.setItem(
        `shouyu_oauth_${state}`,
        JSON.stringify({ clientId, redirectUri, codeVerifier, issuer: cleanIssuer, at: Date.now() }),
      );
      const url = new URL(`${cleanIssuer}/oauth/authorize`);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('client_id', clientId);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('scope', scope);
      url.searchParams.set('state', state);
      url.searchParams.set('code_challenge', codeChallenge);
      url.searchParams.set('code_challenge_method', 'S256');
      if (prompt) url.searchParams.set('prompt', prompt);
      global.location.assign(url.toString());
    },

    /**
     * 跨域名 OAuth 2.0 + PKCE 处理回调并换取访问令牌与用户信息
     */
    async handleOAuthCallback(search = global.location ? global.location.search : '') {
      const params = new URLSearchParams(search);
      const code = params.get('code');
      const state = params.get('state');
      if (!code || !state) throw new Error('缺少 OAuth 回调参数');
      const storageKey = `shouyu_oauth_${state}`;
      const savedRaw = sessionStorage.getItem(storageKey);
      sessionStorage.removeItem(storageKey);
      if (!savedRaw) throw new Error('OAuth state 校验失败或已过期');
      const saved = JSON.parse(savedRaw);
      const res = await fetch(`${saved.issuer}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code,
          client_id: saved.clientId,
          redirect_uri: saved.redirectUri,
          code_verifier: saved.codeVerifier,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error_description || '令牌换取失败');
      return data;
    },
  };

  global.ShouyuAuth = ShouyuAuth;
})(typeof window !== 'undefined' ? window : globalThis);
