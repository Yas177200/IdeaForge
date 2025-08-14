const express = require('express');
const auth = require('../middleware/auth');
const { Like } = require('../models');
const { canAccessByCard } = require('./_access');

const router = express.Router();

router.post('/cards/:cardId/like', auth, async (req, res)=> {
    const { cardId } = req.params;

    const access = await canAccessByCard(req.user.id, cardId);
    if (!access.ok) return res.status(access.status).json({message: access.message});

    const existing = await Like.findOne({ where: {userId: req.user.id, cardId}});
    if (existing) {
        await existing.destroy();
        return res.json({liked: false});
    }
    await Like.create({ userId: req.user.id, cardId});
    res.json({liked: true});
})

router.get('/cards/:cardId/likes', auth, async (req, res) => {
    const { cardId } = req.params;

    const access = await canAccessByCard(req.user.id, cardId);
    if (!access.ok) return res.status(access.status).json({message: access.message});

    const [count, mine] = await Promise.all([
        Like.count({where: {cardId}}),
        Like.findOne({where: {userId: req.user.id, cardId}})
    ]);

    res.json({ count, likedByMe: Boolean(mine)});
})

module.exports = router;