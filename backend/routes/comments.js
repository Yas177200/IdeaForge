const express = require('express');
const auth = require('../middleware/auth');
const { Comment, User } = require('../models');
const { canAccessByCard } = require('./_access');

const router = express.Router();

router.get('/cards/:cardId/comments', auth, async (req, res) =>{
    const {cardId} = req.params;
    const access = await canAccessByCard(req.user.id, cardId);
    if (!access.ok) return res.status(access.status).json({message: access.message});

    const comments = await Comment.findAll({
        where: {cardId},
        include: [{model: User, attributes: ['id', 'name']}],
        order: [['createdAt', 'ASC']]
    });

    res.json({
        comments: comments.map(c => ({
            id: c.id,
            content: c.content,
            authorId: c.authorId,
            authorName: c.User?.name ?? 'Unkown',
            createdAt: c.createdAt
        }))
    })
})


router.post('/cards/:cardId/comments', auth, async (req, res) => {
    const { cardId } = req.params;
    const { content } = req.body;

    const access = await canAccessByCard(req.user.id, cardId);
    if (!access.ok) return res.status(access.status).json({message: access.message});

    if (!content || !content.trim()) {
        return res.status(400).json({message: 'Content is required.'});
    }

    const comment = await Comment.create({
        content: content.trim(),
        authorId: req.user.id,
        cardId
    });

    res.status(201).json({ comment });
})

router.delete('/comments/:id', auth, async (req, res) => {
    const { id } = req.params;
    const comment = await Comment.findByPk(id);
    if (!comment) return res.status(404).json({ message: access.message });

    const access = await canAccessByCard(req.user.id, comment.cardId);
    if (!access.ok) return res.status(access.status).json({message: access.message});

    const isAuthor = comment.authorId === req.user.id;
    const isProjectOwner = access.project.ownerId === req.user.id;

    if (!isAuthor && !isProjectOwner) {
        return res.status(403).json({message: 'Not allowed to delete this comment.'});
    }

    await comment.destroy();
    res.json({ok: true});
});

module.exports = router;