const express = require('express');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');
const { Project, ProjectMembership, User } = require('../models');

const router = express.Router();

async function ownerOnly(userId, projectId) {
  const pid = Number(projectId);
  if (!Number.isFinite(pid)) return { ok:false, status:400, message:'Bad project id' };
  const project = await Project.findByPk(pid);
  if (!project) return { ok:false, status:404, message:'Project not found' };
  if (project.ownerId !== userId) return { ok:false, status:403, message:'Owner only' };
  return { ok:true, project };
}

router.get('/:id/members', auth, async (req, res) => {
  const guard = await ownerOnly(req.user.id, req.params.id);
  if (!guard.ok) return res.status(guard.status).json({ message: guard.message });

  const members = await ProjectMembership.findAll({
    where: { projectId: guard.project.id, role: 'MEMBER' },
    include: [{ model: User, attributes: ['id', 'name', 'email'] }],
    order: [['createdAt', 'ASC']]
  });

  res.json({
    members: members.map(m => ({
      userId: m.userId,
      name: m.User?.name || 'Unknown',
      email: m.User?.email || '',
      role: m.role,
      status: m.status
    }))
  });
});

router.patch('/:id/members/:userId', auth, async (req, res) => {
  const guard = await ownerOnly(req.user.id, req.params.id);
  if (!guard.ok) return res.status(guard.status).json({ message: guard.message });

  const targetUserId = Number(req.params.userId);
  if (!Number.isFinite(targetUserId)) return res.status(400).json({ message: 'Bad user id' });
  if (targetUserId === guard.project.ownerId) return res.status(400).json({ message: 'Cannot change owner' });

  const { status } = req.body;
  if (!['APPROVED', 'PENDING'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const m = await ProjectMembership.findOne({ where: { projectId: guard.project.id, userId: targetUserId } });
  if (!m) return res.status(404).json({ message: 'Membership not found' });

  await m.update({ status });
  res.json({ ok: true, membership: { userId: m.userId, status: m.status } });
});

router.delete('/:id/members/:userId', auth, async (req, res) => {
  const guard = await ownerOnly(req.user.id, req.params.id);
  if (!guard.ok) return res.status(guard.status).json({ message: guard.message });

  const targetUserId = Number(req.params.userId);
  if (!Number.isFinite(targetUserId)) return res.status(400).json({ message: 'Bad user id' });
  if (targetUserId === guard.project.ownerId) return res.status(400).json({ message: 'Cannot remove owner' });

  const m = await ProjectMembership.findOne({ where: { projectId: guard.project.id, userId: targetUserId } });
  if (!m) return res.status(404).json({ message: 'Membership not found' });

  await m.destroy();
  res.json({ ok: true });
});

module.exports = router;
