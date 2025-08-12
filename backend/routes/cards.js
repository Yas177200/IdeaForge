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

    const memebership = await Project.findOne({where: {userId, projectId} });
    if (!memebership) return {ok: false, status: 403, message: 'not a project member.'};

    return {ok: true, project, memebership};
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

module.exports = router;