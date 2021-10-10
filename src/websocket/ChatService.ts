import { io } from '../http';

io.on('connect', (socket) => {
  socket.emit('chat_init', {
    message: 'Seu chat foi iniciado',
  });
});
