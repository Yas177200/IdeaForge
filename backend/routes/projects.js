const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { Project, ProjectMembership, User, Card} = require('../models');
const auth = require('../middleware/auth');
const { Op, fn, literal, col } = require('sequelize');

const router = express.Router();

async function onwerOnly(userId, projectId) {
    const pid = Number(projectId);
    if (!Number.isFinite(pid)) return {ok: false, status: 400, message: 'Bad project id'};

    const project = await Project.findByPk(pid);
    if (!project) return {ok: false, status: 404, message: 'Project not found.'};

    if (project.ownerId !== userId) return {ok: false, status: 403, message: 'Owner only!!'}

    return {ok: true, project};
}

async function getCardCountsByProjectIds(projectIds) {
  if (!projectIds.length) return {};
  const rows = await Card.findAll({
    attributes: [
      'projectId',
      [fn('COUNT', col('id')), 'total'],
      // Postgres-safe CASE; `"completed"` is boolean
      [fn('SUM', literal('CASE WHEN "completed" = false THEN 1 ELSE 0 END')), 'open']
    ],
    where: { projectId: { [Op.in]: projectIds } },
    group: ['projectId']
  });

  const map = {};
  for (const r of rows) {
    const pid = Number(r.get('projectId'));
    map[pid] = {
      total: Number(r.get('total') || 0),
      open: Number(r.get('open') || 0),
    };
  }
  return map;
}

async function getPendingCountsByProjectIds(projectIds) {
  if (!projectIds.length) return {};
  const rows = await ProjectMembership.findAll({
    attributes: ['projectId', [fn('COUNT', col('userId')), 'pending']],
    where: { projectId: { [Op.in]: projectIds }, status: 'PENDING', role: 'MEMBER' },
    group: ['projectId']
  });
  const map = {};
  for (const r of rows) {
    map[Number(r.get('projectId'))] = Number(r.get('pending') || 0);
  }
  return map;
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
  const projects = await Project.findAll({
    where: { ownerId: req.user.id },
    order: [['createdAt', 'DESC']]
  });

  const ids = projects.map(p => p.id);
  const counts = await getCardCountsByProjectIds(ids);
  const pending = await getPendingCountsByProjectIds(ids);

  const payload = projects.map(p => {
    const c = counts[p.id] || { total: 0, open: 0 };
    return {
      id: p.id,
      name: p.name,
      shortSummary: p.shortSummary,
      fullDescription: p.fullDescription,
      tags: p.tags,
      joinLink: p.joinLink, 
      createdAt: p.createdAt,
      totalCards: c.total,
      openCards: c.open,
      completedCards: c.total - c.open,
      pendingMembers: pending[p.id] || 0
    };
  });

  res.json({ projects: payload });
});


router.get('/joined', auth, async (req, res) => {
  const memberships = await ProjectMembership.findAll({
    where: {
      userId: req.user.id,
      role: { [Op.ne]: 'OWNER' },
      status: { [Op.or]: ['APPROVED', null] }
    },
    include: [{ model: Project }],
    order: [['createdAt', 'DESC']]
  });

  const joinedProjects = memberships
    .map(m => m.Project)
    .filter(Boolean);

  const ids = joinedProjects.map(p => p.id);
  const counts = await getCardCountsByProjectIds(ids);

  const payload = joinedProjects.map(p => {
    const c = counts[p.id] || { total: 0, open: 0 };
    return {
      id: p.id,
      name: p.name,
      shortSummary: p.shortSummary,
      tags: p.tags,
      createdAt: p.createdAt,
      totalCards: c.total,
      openCards: c.open,
      completedCards: c.total - c.open
    };
  });

  res.json({ projects: payload });
});

router.post('/join', auth, async (req, res) => {
  const { joinLink } = req.body;
  if (!joinLink) return res.status(400).json({ message: 'joinLink is required' });

  const project = await Project.findOne({ where: { joinLink } });
  if (!project) return res.status(404).json({ message: 'Invalid invite code' });
  if (project.ownerId === req.user.id) {
    return res.status(400).json({ message: 'You are the project owner' });
  }

  const [membership, created] = await ProjectMembership.findOrCreate({
    where: { userId: req.user.id, projectId: project.id },
    defaults: { role: 'MEMBER', status: 'PENDING' }
  });

  if (!created) {
    if (membership.status === 'APPROVED' || membership.status == null) {
      return res.json({ ok: true, status: 'APPROVED', message: 'Already a member' });
    }
    return res.json({ ok: true, status: 'PENDING', message: 'Request already pending' });
  }

  return res.status(201).json({ ok: true, status: 'PENDING', message: 'Join request sent' });
});


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



router.get('/p/pending', auth, async (req, res) => {
  const memberships = await ProjectMembership.findAll({
    where: { userId: req.user.id, status: 'PENDING', role: 'MEMBER' },
    include: [{ model: Project }]
  });

 const payload = (memberships || [])
    .filter(m => m.Project)
    .map(m => ({
      id: m.Project.id,
      name: m.Project.name,
      shortSummary: m.Project.shortSummary,
      tags: m.Project.tags,
      createdAt: m.Project.createdAt,
      requestDate: m.createdAt
    }));

  res.json({ projects: payload });
});


module.exports = router;