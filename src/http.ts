import 'reflect-metadata';

import path from 'path';
import express from 'express';
import mongoose, { ConnectOptions } from 'mongoose';
import { Server } from 'socket.io';
import { createServer } from 'http';

const app = express();

const server = createServer(app);

mongoose.connect('mongodb://localhost/chatsocket', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as ConnectOptions);

const io = new Server(server);

io.on('connection', async (socket) => {
  console.log('Socket', socket.id);
});

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (request, response) => {
  return response.json({
    message: 'Hellow Websocket',
  });
});

export { server, io };
