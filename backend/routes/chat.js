const express = require('express');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');
const { Project, ProjectMembership, ChatMessage, User} = require('../models');

const router = express.Router();

async function canViewProject(userId, projectId) {
    const pid = Number(projectId);
    if (!Number.isFinite(pid)) return {ok: false, status: 400, message: 'Bad project id.'};
    const project = await Project.findByPk(pid);
    if (!project) return {ok: false, status: 404, message: 'Project not found.'};
    if (project.ownerId === userId) return {ok: true, project };
    const membership = await ProjectMembership.findOne({
        where: {userId, projectId: pid, status: { [Op.or]: ['APPROVED', null] }} 
    });
    if (!membership) return {ok: false, status: 403, message: 'Not a project member.'};
    return{ok: true, project};
}

router.get('/:id/chat', auth, async (req, res) => {
  const access = await canViewProject(req.user.id, req.params.id);
  if (!access.ok) return res.status(access.status).json({ message: access.message });

  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const before = req.query.before ? new Date(req.query.before) : null;

  const where = { projectId: Number(req.params.id) };
  if (before && !isNaN(before.valueOf())) where.createdAt = { [Op.lt]: before };

  const rows = await ChatMessage.findAll({
    where,
    include: [{ model: User, attributes: ['id', 'name'] }],
    order: [['createdAt', 'DESC']],
    limit
  });

  const messages = rows.map(r => ({
    id: r.id,
    content: r.content,
    senderId: r.User?.id || r.senderId,
    senderName: r.User?.name || 'Unknown',
    projectId: r.projectId,
    createdAt: r.createdAt
  }));

  res.json({ messages });
});

module.exports = router;