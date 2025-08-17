const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { Project, ProjectMembership, User} = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

async function onwerOnly(userId, projectId) {
    const pid = Number(projectId);
    if (!Number.isFinite(pid)) return {ok: false, status: 400, message: 'Bad project id'};

    const project = await Project.findByPk(pid);
    if (!project) return {ok: false, status: 404, message: 'Project not found.'};

    if (project.ownerId !== userId) return {ok: false, status: 403, message: 'Owner only!!'}

    return {ok: true, project};
}

router.post('/', auth, async (req, res) => {
    const {name, shortSummary, fullDescription, tags} = req.body;
    if (!name || ! shortSummary) {
        return res.status(400).json({message: 'Name and short summary are required.'});
    }

    const joinLink = uuidv4();

    const project = await Project.create({
        name,
        shortSummary,
        fullDescription,
        tags: tags || [],
        joinLink,
        ownerId: req.user.id
    });

    await ProjectMembership.create({
        projectId: project.id,
        userId: req.user.id,
        role: 'OWNER'
    });
    res.status(201).json({project});
});

router.get('/mine', auth, async (req, res) => {
    const projects = await Project.findAll({where: {ownerId: req.user.id} });
    res.json({projects});
});

router.get('/joined', auth, async (req, res) => {
    const memberships = await ProjectMembership.findAll({
        where: {
            userId: req.user.id,
            role:   { [Op.ne]: 'OWNER' }  // exclude OWNERSHIP
        },
        include: [ { model: Project } ]
    });
    const projects = memberships.map(m => m.Project);
    
    res.json({projects});
});

router.post('/join', auth, async (req, res) => {
    const { joinLink } = req.body;
    const project = await Project.findOne({where: {joinLink}});
    if (!project) {
        return res.status(404).json({message: 'Invalid invite link'});
    }

    const [memebership, created] = await ProjectMembership.findOrCreate({
        where: {
            projectId: project.id,
            userId: req.user.id
        },
        defaults: {role: 'MEMBER'}
    });
    res.json({project, joined: created});
})

router.get('/:id', auth, async (req, res) => {
    const pid = Number(req.params.id);
    if (!Number.isFinite(pid)) return res.status(400).json({message: 'Bad project id...'});

    const project = await Project.findByPk(pid, {
        include: [{model: User, attributes: ['id', 'name']}]
    });
    if (!project) return res.status(404).json({message: 'Project not found hehe'});

    if (project.ownerId !== req.user.id) {
        const m = await ProjectMembership.findOne({ where: {userId: req.user.id}, projectId: pid });
        if (!m) return res.status(403).json({message: 'Not a project member (get outta here a**hole)'});
    }

    res.json({
        project: {
            id: project.id,
            name: project.name,
            shortSummary: project.shortSummary,
            fullDescription: project.fullDescription,
            tags: project.tags,
            joinLink: project.joinLink,
            ownerId: project.ownerId,
            ownerName: project.User?.name || 'Owner',
            createdAt: project.createdAt
        }
    });
})

router.patch('/:id', auth, async (req, res) => {
    const guard = await onwerOnly(req.user.id, req.params.id);
    if (!guard.ok) return res.status(guard.status).json({message: guard.message});
    
    const { name, shortSummary, fullDescription, tags } = req.body;
    const up = {};
    if (typeof name === 'string') up.name = name.trim();
    if (typeof shortSummary === 'string') up.shortSummary = shortSummary.trim();
    if (typeof fullDescription === 'string') up.fullDescription = fullDescription.trim();
    if (Array.isArray(tags)) up.tags = tags.map(t => String(t).trim()).filter(Boolean);

    await guard.project.update(up);
    res.json({ project: guard.project});
})

router.delete('/:id', auth, async (req, res) => {
    const guard = await onwerOnly(req.user.id, req.params.id);
    if (!guard.ok) return res.status(guard.status).json({message: guard.message});

    await guard.project.destroy();
    res.json({ok: true});
})

module.exports = router;