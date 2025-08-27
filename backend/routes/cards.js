const express = require('express');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');
const { Card, Project, ProjectMembership } = require('../models');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const upload = require('../middleware/upload');
const { compressToTarget } = require('../utils/image');
const { canAccessByCard } = require('./_access');

const router = express.Router();

const ALLOWED_TYPES = new Set(['Feature', 'BUG', 'IDEA', 'SKETCH']);

async function canAccessProject(userId, projectId) {
    const project = await Project.findByPk(projectId);
    if (!project) return {ok: false, status: 404, message: 'Project not found.'};
    if (project.ownerId === userId) return {ok: true, project};

    const memebership = await ProjectMembership.findOne({
        where: {
            userId,
            projectId,
            status: {[Op.or]: ['APPROVED', null]}
        }
    });
    if (!memebership) return {ok: false, status: 403, message: 'not a project member.'};

    return {ok: true, project, memebership};
}

async function canEditCard(userId, cardId) {
    const cid = Number(cardId);
    if (!Number.isFinite(cid)) {
        return {ok: false, status: 400, message: 'Bad card id'};
    }
    const card = await Card.findByPk(cid)
    if (!card) return {ok: false, status: 404, message: 'Card not found'};

    const project = await Project.findByPk(card.projectId);
    if (!project) return {ok: false, status: 404, message: 'Project not found.'};

    const isAuthor = card.authorId === userId;
    const isOwner = project.ownerId === userId;
    if (!isAuthor && !isOwner) {
        return {ok: false, status: 403, message: 'Not allowed to edit this card.'}
    }
    return {ok: true, card}
}

router.get('/projects/:projectId/cards', auth, async (req, res) => {
    const { projectId } = req.params;

    const access = await canAccessProject(req.user.id, projectId);
    if (!access.ok) return res.status(access.status).json({message: access.message});

    const cards = await Card.findAll({
        where: {projectId},
        order: [['createdAt', 'DESC']]
    });

    res.json({cards});
})

router.post('/projects/:projectId/cards', auth, async (req, res) => {
    const { projectId } = req.params;
    const { type, title, description, imageUrl, completed } = req.body;

    const access = await canAccessProject(req.user.id, projectId);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    if (!type || !ALLOWED_TYPES.has(type)) {
        return res.status(400).json({message: 'Invalid or missing card type.'});
    } 

    if (!title) {
        return res.status(400).json({message: 'Title is required.'});
    }

    const card = await Card.create({
        type,
        title,
        description,
        imageUrl,
        completed: Boolean(completed), // false on default
        projectId,
        authorId: req.user.id
    });

    res.status(201).json({ card });
})


router.patch('/cards/:id', auth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
        return {ok: false, status: 400, message: 'Bad card id'};
    }
    const { completed, title, description, type, imageUrl } = req.body;

    const access = await canEditCard(req.user.id, id);
    if (!access.ok) return res.status(access.status).json({message: access.message});
    
    const up = {};
    if (typeof completed === 'boolean') up.completed = completed;
    if (typeof title === 'string') up.title = title;
    if (typeof description === 'string') up.description = description;
    if (typeof type === 'string') {
        const allowed = new Set(['FEATURE', 'BUG', 'IDEA', 'SKETCH']);
        if (!allowed.has(type)) return res.status(400).json({message: 'Invalid type.'});
        up.type = type;
    }
    if (typeof imageUrl === 'string') up.imageUrl = imageUrl;
    
    await access.card.update(up);
    res.json({card: access.card})
})


const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
const uploadsDir = process.env.UPLOADS_DIR || 'uploads';

router.post('/cards/:id/image', auth, upload.single('image'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const card = await Card.findByPk(id);
    if (!card) return res.status(404).json({ message: 'Card not found' });

    const access = await canAccessByCard(req.user.id, id);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const outDir = path.join(__dirname, '..', uploadsDir, 'cards');
    await fsp.mkdir(outDir, { recursive: true });

    const { buffer } = await compressToTarget(req.file.buffer, {
      maxBytes: 400 * 1024,
      maxWidth: 1280,
      maxHeight: 1280
    });

    // delete previous local card image if any
    if (card.imagePath && card.imagePath.startsWith('cards/')) {
      const prevAbs = path.join(__dirname, '..', uploadsDir, card.imagePath);
      fs.existsSync(prevAbs) && (await fsp.unlink(prevAbs).catch(()=>{}));
    }

    const filename = `card-${card.id}-${Date.now()}.webp`;
    const outPath = path.join(outDir, filename);
    await fsp.writeFile(outPath, buffer);

    card.imagePath = `cards/${filename}`;
    card.imageUrl  = `${PUBLIC_BASE_URL}/uploads/${card.imagePath}`; // if frontend uses imageUrl
    await card.save();

    res.status(201).json({ card });
  } catch (e) {
    console.error('POST /cards/:id/image error:', e);
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