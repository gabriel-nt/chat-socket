const socket = io('http://localhost:3000');

socket.on('chat_init', (data) => {
  console.log(data);
});
