const express = require('express');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const upload = require('../middleware/upload');
const { compressToTarget } = require('../utils/image');
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


const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
const uploadsDir = process.env.UPLOADS_DIR || 'uploads';

router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const outDir = path.join(__dirname, '..', uploadsDir, 'avatars');
    await fsp.mkdir(outDir, { recursive: true });

    const { buffer } = await compressToTarget(req.file.buffer, {
      maxBytes: 100 * 1024,
      maxWidth: 256,
      maxHeight: 256
    });

    const filename = `user-${req.user.id}-${Date.now()}.webp`;
    const outPath = path.join(outDir, filename);
    await fsp.writeFile(outPath, buffer);

    const prev = req.user.avatarPath;
    if (prev && prev.startsWith('avatars/')) {
      const prevAbs = path.join(__dirname, '..', uploadsDir, prev);
      fs.existsSync(prevAbs) && (await fsp.unlink(prevAbs).catch(()=>{}));
    }

    req.user.avatarPath = `avatars/${filename}`;
    req.user.avatarUrl  = `${PUBLIC_BASE_URL}/uploads/${req.user.avatarPath}`;
    await req.user.save();

    res.status(201).json({
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        avatarUrl: req.user.avatarUrl,
        bio: req.user.bio
      }
    });
  } catch (e) {
    console.error('POST /me/avatar error:', e);
    if (e.message === 'Unsupported file type') {
      return res.status(400).json({ message: 'Only JPG/PNG/WEBP/GIF allowed' });
    }
    if (e.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large (max 5MB upload)' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
