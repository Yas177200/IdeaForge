const express = require('express');
const auth = require('../middleware/auth');
const { Comment, User } = require('../models');
const { canAccessByCard } = require('./_access');

const router = express.Router();

const toDTO = (c) => ({
  id: c.id,
  content: c.content,
  authorId: c.authorId,
  authorName: c.User?.name ?? 'Unknown',
  createdAt: c.createdAt
});


router.get('/cards/:cardId/comments', auth, async (req, res) => {
  try {
    const cardId = Number(req.params.cardId);
    if (!Number.isFinite(cardId)) return res.status(400).json({ message: 'Bad card id' });

    const access = await canAccessByCard(req.user.id, cardId);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const comments = await Comment.findAll({
      where: { cardId },
      include: [{ model: User, attributes: ['id', 'name'] }],
      order: [['createdAt', 'ASC']]
    });

    return res.json({ comments: comments.map(toDTO) });
  } catch (err) {
    console.error('GET comments error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/cards/:cardId/comments', auth, async (req, res) => {
  try {
    const cardId = Number(req.params.cardId);
    if (!Number.isFinite(cardId)) return res.status(400).json({ message: 'Bad card id' });

    const access = await canAccessByCard(req.user.id, cardId);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const content = String(req.body.content || '').trim();
    if (!content) return res.status(400).json({ message: 'Content is required.' });

    const created = await Comment.create({ content, authorId: req.user.id, cardId });
    // fetch with author for consistent DTO
    const withAuthor = await Comment.findByPk(created.id, {
      include: [{ model: User, attributes: ['id', 'name'] }]
    });

    return res.status(201).json({ comment: toDTO(withAuthor) });
  } catch (err) {
    console.error('POST comment error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


router.patch('/comments/:id', auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Bad comment id' });

    const comment = await Comment.findByPk(id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const access = await canAccessByCard(req.user.id, comment.cardId);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const isAuthor = comment.authorId === req.user.id;
    const isOwner = access.project?.ownerId === req.user.id;
    if (!isAuthor && !isOwner) {
      return res.status(403).json({ message: 'Not allowed to edit this comment.' });
    }

    const content = String(req.body.content || '').trim();
    if (!content) return res.status(400).json({ message: 'Content is required.' });

    comment.content = content;
    await comment.save();

    const withAuthor = await Comment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['id', 'name'] }]
    });
    return res.json({ comment: toDTO(withAuthor) });
  } catch (err) {
    console.error('PATCH comment error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/comments/:id', auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Bad comment id' });

    const comment = await Comment.findByPk(id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const access = await canAccessByCard(req.user.id, comment.cardId);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const isAuthor = comment.authorId === req.user.id;
    const isOwner = access.project?.ownerId === req.user.id;
    if (!isAuthor && !isOwner) {
      return res.status(403).json({ message: 'Not allowed to delete this comment.' });
    }

    await comment.destroy();
    return res.json({ ok: true });
  } catch (err) {
    console.error('DELETE comment error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
