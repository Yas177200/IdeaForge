require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const http = require('http');
const { Server } = require('socket.io');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

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

//7
const chatRouter = require('./routes/chat');
app.use('/projects', chatRouter);



const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'], // add dev origins here
    methods: ['GET','POST'],
    credentials: true
  }
});

const preview = t => (typeof t === 'string' && t.length > 16 ? `${t.slice(0,8)}…${t.slice(-6)}` : t);

async function canChat(userId, projectId) {
  const project = await Project.findByPk(projectId);
  if (!project) return { ok:false, message:'Project not found' };
  if (project.ownerId === userId) return { ok:true };
  const m = await ProjectMembership.findOne({
    where: { userId, projectId, status: { [Op.or]: ['APPROVED', null] } }
  });
  return m ? { ok:true } : { ok:false, message:'Not a project member' };
}

// 🔎 handshake logger + strict auth
io.use(async (socket, next) => {
  const origin = socket.handshake.headers.origin;
  const rawToken = socket.handshake.auth?.token || socket.handshake.query?.token;
  const projectIdRaw = socket.handshake.query?.projectId;

  console.info('[SOCKET HANDSHAKE]', {
    origin,
    hasToken: !!rawToken,
    tokenPreview: rawToken ? preview(rawToken) : null,
    projectId: projectIdRaw
  });

  if (!rawToken) return next(new Error('No token'));

  // verify JWT with precise errors
  let payload;
  try {
    payload = jwt.verify(rawToken, process.env.JWT_SECRET);
  } catch (e) {
    console.error('[JWT VERIFY ERROR]', e.name, e.message);
    if (e.name === 'TokenExpiredError') return next(new Error('Token expired'));
    return next(new Error('Bad token'));
  }

  const projectId = Number(projectIdRaw);
  if (!Number.isFinite(projectId)) return next(new Error('Bad project id'));

  const access = await canChat(payload.userId, projectId);
  if (!access.ok) return next(new Error(access.message));

  socket.data.userId = payload.userId;
  socket.data.projectId = projectId;
  return next();
});

io.on('connection', (socket) => {
  const room = `project:${socket.data.projectId}`;
  socket.join(room);
  console.info(`[SOCKET] user ${socket.data.userId} connected to ${room}`);

  socket.on('chat:send', async (payload, ack) => {
    try {
      const content = String(payload?.content || '').trim();
      if (!content) return ack?.({ ok:false, error:'Empty message' });
      const msg = await ChatMessage.create({ content, senderId: socket.data.userId, projectId: socket.data.projectId });
      const sender = await User.findByPk(socket.data.userId, { attributes: ['name'] });
      const wire = { id: msg.id, content, senderId: socket.data.userId, senderName: sender?.name || 'User', projectId: socket.data.projectId, createdAt: msg.createdAt };
      io.to(room).emit('chat:new', wire);
      return ack?.({ ok:true, message: wire });
    } catch (e) {
      console.error('[chat:send error]', e);
      return ack?.({ ok:false, error:'Server error' });
    }
  });

  socket.on('disconnect', () => {
    console.info(`[SOCKET] user ${socket.data.userId} disconnected from ${room}`);
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
//8
const meRouter = require('./routes/me');
app.use('/', meRouter);



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`HTTP + Socket.IO listening on http://localhost:${PORT}`);
});