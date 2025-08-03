const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');


const router = express.Router();

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) =>{
    try{
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(404).json({message: 'Email, password and name are required!'});
        }

        const existing = await User.findOne({where: { email } });
        if (existing) {
            return res.status(409).json({message: 'Email already in use, try to login.'});
        }

        const passwordHash = await bcrypt.hash( password, SALT_ROUNDS);

        const user = await User.create({email, passwordHash, name});

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            {expiresIn: '7d'}
        );

        res.status(201).json({
            user: {id: user.id, email: user.email, name: user.name},
            token
        });
    }catch (err) {
        console.error('Register error:', err);
        res.status(500).json({message: 'Internal server error.'});
    }
});


router.post('/login', async (req, res) => {
    try{
        const { email, password } = req.body;

        if ( !email || !password ) {
            return res.status(400).json({message: 'Email and password are required.'});
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'User not found - Invalid credentials.' });
        }

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            return res.status(401).json({ message: 'Email or Password wrong - Invalid credentials.' })
        }

        const token = jwt.sign(
            {userId: user.id, email: user.email},
            JWT_SECRET,
            {expiresIn: '7d'}
        );

        res.json({
            user: { id: user.id, email: user.email, name: user.name },
            token
        });
    }catch (err){
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;