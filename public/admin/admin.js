const ADMIN_TOKEN_KEY = 'admin_token';

const enforceLocalHttp = () => {
  if (window.location.protocol === 'https:' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    const target = `http://${window.location.host}${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.replace(target);
  }
};

const getToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

const getCookieToken = () => {
  const match = document.cookie.match(/(?:^|; )admin_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const setToken = (token) => {
  if (!token) return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  document.cookie = `admin_token=${encodeURIComponent(token)}; Path=/; SameSite=Lax`;
};

const clearToken = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  document.cookie = 'admin_token=; Path=/; Max-Age=0';
};

const apiFetch = async (url, options = {}) => {
  const token = getToken() || getCookieToken();
  if (!token) {
    window.location.href = '/admin/login.html';
    return null;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'x-admin-token': token } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    clearToken();
    window.location.href = '/admin/login.html';
    return null;
  }

  return response;
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ro-RO', { dateStyle: 'medium', timeStyle: 'short' });
};

const safeJson = (value) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const requireAuthForPage = () => {
  const protectedPage = document.querySelector('[data-dashboard], [data-contacts], [data-leads]');
  if (!protectedPage) return;
  if (!getToken() && !getCookieToken()) {
    window.location.href = '/admin/login.html';
  }
};

const initLogin = () => {
  const form = document.querySelector('[data-login-form]');
  if (!form) return;

  if (getToken() || getCookieToken()) {
    window.location.href = '/admin/dashboard.html';
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const notice = document.querySelector('[data-login-notice]');
    const submitButton = form.querySelector('button[type="submit"]');

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Se verifica...';
    }

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username.value.trim(),
          password: form.password.value.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Autentificare esuata.');
      }

      setToken(getCookieToken());
      window.location.href = '/admin/dashboard.html';
    } catch (error) {
      if (notice) {
        notice.textContent = error.message;
        notice.classList.add('notice');
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
      }
    }
  });
};

const initLogout = () => {
  const logout = document.querySelector('[data-logout]');
  if (!logout) return;
  logout.addEventListener('click', () => {
    clearToken();
    window.location.href = '/admin/login.html';
  });
};

const initDashboard = async () => {
  const container = document.querySelector('[data-dashboard]');
  if (!container) return;

  const notice = document.querySelector('[data-dashboard-notice]');
  const statElements = Array.from(document.querySelectorAll('[data-stat]'));
  statElements.forEach((el) => {
    el.textContent = '—';
    if (el.classList.contains('badge')) {
      el.classList.add('loading');
    }
  });

  try {
    const contactsResponse = await apiFetch('/api/admin/contacts');
    const leadsResponse = await apiFetch('/api/admin/leads');
    if (!contactsResponse || !leadsResponse) return;

    const contactsData = await contactsResponse.json();
    const leadsData = await leadsResponse.json();

    const contacts = contactsData.rows || [];
    const leads = leadsData.rows || [];

    const now = Date.now();
    const last24h = [...contacts, ...leads].filter((item) => {
      const created = new Date(item.created_at).getTime();
      return now - created <= 24 * 60 * 60 * 1000;
    });

    const lastContact = contacts[0];

    const stats = {
      contacts: contacts.length,
      leads: leads.length,
      last24h: last24h.length,
      lastContact: lastContact ? `${lastContact.name} · ${lastContact.email}` : 'Niciun mesaj',
    };

    Object.entries(stats).forEach(([key, value]) => {
      const el = document.querySelector(`[data-stat="${key}"]`);
      if (el) {
        el.textContent = value;
        el.classList.remove('loading');
      }
    });

    if (notice) notice.style.display = 'none';
  } catch (error) {
    if (notice) {
      notice.textContent = 'Nu am putut incarca datele. Incearca din nou.';
      notice.style.display = 'block';
    }
    statElements.forEach((el) => el.classList.remove('loading'));
  }
};

const initContacts = async () => {
  const container = document.querySelector('[data-contacts]');
  if (!container) return;

  const body = document.querySelector('[data-contacts-body]');
  const empty = document.querySelector('[data-empty]');
  const response = await apiFetch('/api/admin/contacts');
  if (!response) return;

  const data = await response.json();
  const rows = data.rows || [];

  if (!rows.length) {
    if (empty) empty.style.display = 'block';
    return;
  }

  rows.forEach((row) => {
    const shortMessage = row.message.length > 80 ? `${row.message.slice(0, 80)}...` : row.message;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.name}</td>
      <td>${row.email}</td>
      <td>
        <button class="button secondary" data-message="${encodeURIComponent(row.message)}">${shortMessage}</button>
      </td>
      <td>${formatDate(row.created_at)}</td>
    `;
    body.appendChild(tr);
  });

  body.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-message]');
    if (!button) return;
    const full = decodeURIComponent(button.getAttribute('data-message'));
    button.textContent = full;
  });
};

const initLeads = async () => {
  const container = document.querySelector('[data-leads]');
  if (!container) return;

  const body = document.querySelector('[data-leads-body]');
  const empty = document.querySelector('[data-empty]');
  const modal = document.querySelector('[data-modal]');
  const modalBody = document.querySelector('[data-modal-body]');
  const modalClose = document.querySelector('[data-modal-close]');

  const response = await apiFetch('/api/admin/leads');
  if (!response) return;

  const data = await response.json();
  const rows = data.rows || [];

  if (!rows.length) {
    if (empty) empty.style.display = 'block';
    return;
  }

  rows.forEach((row) => {
    const tr = document.createElement('tr');
    tr.dataset.lead = JSON.stringify(row);
    tr.innerHTML = `
      <td>${row.name}</td>
      <td>${row.email}</td>
      <td>${row.business_type || '-'}</td>
      <td>${row.website_type || '-'}</td>
      <td>${row.budget_range || '-'}</td>
      <td>${row.deadline || '-'}</td>
      <td>${formatDate(row.created_at)}</td>
    `;
    body.appendChild(tr);
  });

  body.addEventListener('click', (event) => {
    const row = event.target.closest('tr[data-lead]');
    if (!row) return;
    const lead = JSON.parse(row.dataset.lead);
    const pages = safeJson(lead.pages).join(', ') || '-';
    const features = safeJson(lead.features).join(', ') || '-';

    modalBody.innerHTML = `
      <div class="kv"><strong>Nume</strong><span>${lead.name}</span></div>
      <div class="kv"><strong>Email</strong><span>${lead.email}</span></div>
      <div class="kv"><strong>Tip business</strong><span>${lead.business_type || '-'}</span></div>
      <div class="kv"><strong>Tip website</strong><span>${lead.website_type || '-'}</span></div>
      <div class="kv"><strong>Pagini</strong><span>${pages}</span></div>
      <div class="kv"><strong>Functionalitati</strong><span>${features}</span></div>
      <div class="kv"><strong>Preferinte design</strong><span>${lead.design_preferences || '-'}</span></div>
      <div class="kv"><strong>Buget</strong><span>${lead.budget_range || '-'}</span></div>
      <div class="kv"><strong>Deadline</strong><span>${lead.deadline || '-'}</span></div>
      <div class="kv"><strong>Mesaj</strong><span>${lead.message || '-'}</span></div>
      <div class="kv"><strong>Data</strong><span>${formatDate(lead.created_at)}</span></div>
    `;

    modal.classList.add('open');
  });

  modalClose.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.classList.remove('open');
    }
  });
};

enforceLocalHttp();
requireAuthForPage();
initLogin();
initLogout();
initDashboard();
initContacts();
initLeads();

