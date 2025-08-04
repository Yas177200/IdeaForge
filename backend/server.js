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

const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

const projectsRouter = require('./routes/projects');
app.use('/projects', projectsRouter);
// serve start

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`Server listening on port ${PORT}`);
});