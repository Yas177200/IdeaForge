const express = require('express');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/me', auth, async (req, res) => {
  const u = req.user;
  res.json({
    user: {
      id: u.id,
      email: u.email,
      name: u.name,
      avatarUrl: u.avatarUrl,
      bio: u.bio
    }
  });
});

router.patch('/me', auth, async (req, res) => {
  try {
    const { name, avatarUrl, bio } = req.body;

    if (name && String(name).trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters.' });
    }

    if (typeof avatarUrl !== 'undefined') {
      req.user.avatarUrl = String(avatarUrl || '').trim() || null;
    }
    if (typeof bio !== 'undefined') {
      req.user.bio = String(bio || '').trim() || null;
    }
    if (typeof name !== 'undefined') {
      req.user.name = String(name).trim();
    }

    await req.user.save();

    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        avatarUrl: req.user.avatarUrl,
        bio: req.user.bio
      }
    });
  } catch (e) {
    console.error('PATCH /me error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/me/password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Both oldPassword and newPassword are required.' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const ok = await bcrypt.compare(oldPassword, req.user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Old password is incorrect.' });

    const SALT_ROUNDS = 10;
    req.user.passwordHash = await bcrypt.hash(String(newPassword), SALT_ROUNDS);
    await req.user.save();

    res.json({ ok: true, message: 'Password updated.' });
  } catch (e) {
    console.error('PATCH /me/password error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
