const express = require('express');
const { all } = require('../db/sqlite');
const { issueToken, requireAdminApi } = require('../utils/adminAuth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASS) {
    return res.status(500).json({ ok: false, error: 'Admin credentials not configured.' });
  }

  if (username !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASS) {
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

module.exports = router;
