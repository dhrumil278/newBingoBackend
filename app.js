const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { Server } = require('socket.io');

const app = express();
mongoose.connect(process.env.DB_URL);

const whitelist = ['https://dhrumil-bingo.netlify.app/'];

const corsOptions = {
  origin: (origin, callback) => {
    if (origin) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error());
      }
    } else {
      callback(null, true);
    }
  },
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

const { login } = require('./controller/User/userAuthController');
const {
  createGame,
  JoinGame,
  startMatch,
  userMove,
  winner,
} = require('./controller/Game/gameController');

const auth = require('./routes/authRoutes');
app.use('/', auth);

const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
  console.log('server running on port :', port);
});

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
});

io.on('connection', (socket) => {
  socket.on('login', async (data) => {
    console.log('login called...');
    console.log('data in socket login: ', data);
    const response = await login(data);
    io.emit('login-response', response);
  });
  socket.on('craeteRoom', async (data) => {
    console.log('craeteRoom called...');
    console.log('data in socket craeteRoom: ', data);
    const response = await createGame(data);
    let room = '';
    if (response.hasError === false) {
      room = response.data.game.code;
      socket.join(room);
    }
    io.to(room).emit('roomCreate-response', response);
  });
  socket.on('joinRoom', async (data) => {
    console.log('joinRoom called...');
    console.log('data in socket joinRoom: ', data);
    const response = await JoinGame(data);
    console.log('response: ', response);
    let room = '';
    if (response.hasError === false) {
      console.log('inside the join room response');
      room = response.data.game.code;
      await socket.join(room);
    }
    console.log('before the response send');
    io.emit('roomJoin-response', response);
    console.log('roomJoin-response: afte');

    io.to(room).emit('userJoinInRoom', response);
  });
  socket.on('startMatch', async (data) => {
    console.log('startMatch called...');
    const response = await startMatch(data);
    console.log('response: ', response);
    console.log('response.data.game.code: ', response.data.game.code);
    io.to(response.data.game.code).emit('firstPlayerTurn', response);
  });
  socket.on('userMove', async (data) => {
    console.log('userMove called...');
    const response = await userMove(data);
    console.log('response: ', response);
    io.to(response.data.game.code).emit('nextPlayerTurn', response);
  });
  socket.on('winner', async (data) => {
    console.log('winner called...');
    const response = await winner(data);
    console.log('response: ', response);
    io.to(data.code).emit('winner-response', response);
  });
});
