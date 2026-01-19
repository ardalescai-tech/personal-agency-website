const crypto = require('crypto');

const activeTokens = new Set();

const parseCookies = (cookieHeader = '') => {
  return cookieHeader.split(';').reduce((acc, part) => {
    const [key, ...rest] = part.trim().split('=');
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
};

const getTokenFromRequest = (req) => {
  const headerToken = req.headers['x-admin-token'];
  if (headerToken) return headerToken;
  const cookies = parseCookies(req.headers.cookie);
  return cookies.admin_token || null;
};

const issueToken = () => {
  const token = crypto.randomBytes(24).toString('hex');
  activeTokens.add(token);
  return token;
};

const verifyToken = (token) => token && activeTokens.has(token);

const requireAdminApi = (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!verifyToken(token)) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  return next();
};

const requireAdminPage = (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (verifyToken(token)) {
    return next();
  }
  if (
    req.path.endsWith('/login.html') ||
    req.path.endsWith('.css') ||
    req.path.endsWith('.js') ||
    req.path.endsWith('.map') ||
    req.path.endsWith('.svg') ||
    req.path.endsWith('.png') ||
    req.path.endsWith('.jpg') ||
    req.path.endsWith('.jpeg')
  ) {
    return next();
  }
  return res.redirect('/admin/login.html');
};

module.exports = {
  issueToken,
  verifyToken,
  requireAdminApi,
  requireAdminPage,
  parseCookies,
};
