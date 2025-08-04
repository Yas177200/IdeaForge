const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { Project, ProjectMembership } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

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

module.exports = router;