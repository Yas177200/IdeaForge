const express = require('express');
const { OP, where } = require('sequelize');
const auth = require('../middleware/auth');
const { Card, Project, ProjectMembership } = require('../models');

const router = express.Router();

const ALLOWED_TYPES = new Set(['Feature', 'BUG', 'IDEA', 'SKETCH']);

async function canAccessProject(userId, projectId) {
    const project = await Project.findByPk(projectId);
    if (!project) return {ok: false, status: 404, message: 'Project not found.'};
    if (project.ownerId === userId) return {ok: true, project};

    const memebership = await ProjectMembership.findOne({where: {userId, projectId} });
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

module.exports = router;