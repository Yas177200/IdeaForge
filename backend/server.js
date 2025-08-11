require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');

const db = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

const sequelize = new Sequelize(process.env.DATABASE_URL);

sequelize
    .authenticate()
    .then(() => console.log('✅ Database connected'))
    .catch(err => console.error('❌ DB connection error:', err));

// ROOT
app.get('/', (req, res) => {
    res.send('Hello from IdeaForge backend');
});

// routes here
//1
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);
//2
const projectsRouter = require('./routes/projects');
app.use('/projects', projectsRouter);
//3
const cards = require('./routes/cards');
app.use('/', cards);


const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`Server listening on port ${PORT}`);
});