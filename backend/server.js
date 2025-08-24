require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const http = require('http');
const { Server } = require('socket.io');
const { Op } = require('sequelize');

//models
const db = require('./models');
const { User, Project, ProjectMembership, ChatMessage } = require('./models');

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

//socket.io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ 'http://localhost:5173' ],
    methods: ['GET','POST'],
    credentials: true
  },
  // when prod deploy, configure a path here like this: abdulmala.de/socket.io
});

async function canChat(userId, projectId) {
  const project = await Project.findByPk(projectId);
  if (!project) return { ok: false, status: 404, message: 'Project not found' };
  if (project.ownerId === userId) return { ok: true, project };
  const m = await ProjectMembership.findOne({
    where: { userId, projectId, status: { [Op.or]: ['APPROVED', null] } }
  });
  if (!m) return { ok: false, status: 403, message: 'Not a project member' };
  return { ok: true, project };
}

// backend/server.js (your io.use)
io.use(async (socket, next) => {
   try {
     const token = socket.handshake.auth?.token;
     if (!token) return next(new Error('No token'));

     let payload;
     try {
       payload = jwt.verify(token, process.env.JWT_SECRET);
     } catch (e) {
       if (e.name === 'TokenExpiredError') return next(new Error('Token expired'));
       return next(new Error('Bad token'));
     }
     const { userId } = payload;

     const projectId = Number(socket.handshake.query?.projectId);
     if (!Number.isFinite(projectId)) return next(new Error('Bad project id'));

     socket.data.userId = userId;
     socket.data.projectId = projectId;

     const access = await canChat(userId, projectId);
     if (!access.ok) return next(new Error(access.message)); // e.g., 'Not a project member'
     return next();
   } catch (e) {
     console.error('[socket auth error]', e);
     return next(new Error(e.message || 'Unauthorized'));
   }
});


io.on('connection', socket => {
  const { userId, projectId } = socket.data;
  const room = `project:${projectId}`;
  socket.join(room);

  console.log(`INFO chat: user ${userId} joined room ${room}`);

  // typing indicators
  socket.on('chat:typing', (isTyping) => {
    socket.to(room).emit('chat:typing', { userId, isTyping: !!isTyping });
  });

  // send message
  socket.on('chat:send', async (payload, ack) => {
    try {
      const content = String(payload?.content || '').trim();
      if (!content) return typeof ack === 'function' && ack({ ok: false, error: 'Empty message' });
      if (content.length > 1000) return typeof ack === 'function' && ack({ ok: false, error: 'Too long' });

      const msg = await ChatMessage.create({ content, senderId: userId, projectId });

      const wire = {
        id: msg.id,
        content,
        senderId: userId,
        senderName: (await User.findByPk(userId, { attributes: ['name'] }))?.name || 'User',
        projectId,
        createdAt: msg.createdAt
      };

      // broadcast to room
      io.to(room).emit('chat:new', wire);

      return typeof ack === 'function' && ack({ ok: true, message: wire });
    } catch (e) {
      console.error('chat:send error', e);
      return typeof ack === 'function' && ack({ ok: false, error: 'Server error' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`INFO chat: user ${userId} left room ${room}`);
  });
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
//4
const commentsRouter = require('./routes/comments');
app.use('/', commentsRouter);
//5
const likesRouter = require('./routes/likes');
app.use('/', likesRouter)
//6
const membersRouter = require('./routes/members');
app.use('/projects', membersRouter);
//7
const chatRouter = require('./routes/chat');
app.use('/projects', chatRouter);




const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>{
    console.log(`Socket.io server listening on port ${PORT}`);
});
app.listen(PORT, ()=>{
    console.log(`Server listening on port ${PORT}`);
});