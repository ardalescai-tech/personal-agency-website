const express = require('express');
const { all, run } = require('../db/sqlite');
const { issueToken, requireAdminApi } = require('../utils/adminAuth');

const router = express.Router();
const allowedStatuses = new Set(['new', 'contacted', 'in_progress', 'closed']);

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const cleanUsername = String(username || '').trim();
  const cleanPassword = String(password || '');
  const envUser = String(process.env.ADMIN_USER || '').trim();
  const envPass = String(process.env.ADMIN_PASS || '');

  if (!envUser || !envPass) {
    return res.status(500).json({ ok: false, error: 'Admin credentials not configured.' });
  }

  if (cleanUsername.toLowerCase() !== envUser.toLowerCase() || cleanPassword !== envPass) {
    return res.status(401).json({ ok: false, error: 'Invalid credentials' });
  }

  const token = issueToken();
  res.setHeader('Set-Cookie', `admin_token=${encodeURIComponent(token)}; Path=/; SameSite=Lax`);
  return res.json({ ok: true });
});

router.get('/contacts', requireAdminApi, async (req, res) => {
  try {
    const rows = await all('SELECT * FROM contacts ORDER BY created_at DESC');
    return res.json({ ok: true, rows });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Failed to fetch contacts.' });
  }
});

router.get('/leads', requireAdminApi, async (req, res) => {
  try {
    const rows = await all('SELECT * FROM leads ORDER BY created_at DESC');
    return res.json({ ok: true, rows });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Failed to fetch leads.' });
  }
});

router.patch('/leads/:id/status', requireAdminApi, async (req, res) => {
  const { status } = req.body || {};
  const cleanStatus = String(status || '').trim();
  if (!allowedStatuses.has(cleanStatus)) {
    return res.status(400).json({ ok: false, error: 'Invalid status.' });
  }

  try {
    await run('UPDATE leads SET status = ? WHERE id = ?', [cleanStatus, req.params.id]);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Failed to update status.' });
  }
});

router.patch('/contacts/:id/status', requireAdminApi, async (req, res) => {
  const { status } = req.body || {};
  const cleanStatus = String(status || '').trim();
  if (!allowedStatuses.has(cleanStatus)) {
    return res.status(400).json({ ok: false, error: 'Invalid status.' });
  }

  try {
    await run('UPDATE contacts SET status = ? WHERE id = ?', [cleanStatus, req.params.id]);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Failed to update status.' });
  }
});

module.exports = router;
