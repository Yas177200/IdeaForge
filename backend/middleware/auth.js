const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({message: 'No token provided'});

    const [scheme, token] = header.split(' ');
    if (!/^Bearer$/i.test(scheme)) return res.status(401).json({rToken: true, message: 'Bad token format'});
    try{
        const { userId } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(userId, {
            attributes: ['id', 'email', 'name', 'avatarUrl', 'bio']
        });
        if (!user) return res.status(401).json({rToken: true, message: 'User not found'});
        
        req.user = user;
        next();

    }catch(err){
        console.error('Auth middleware error:', err);
        res.status(401).json({rToken: true, message: 'Invalid token'});
    }
};