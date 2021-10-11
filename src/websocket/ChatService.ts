import { io } from '../http';
import { container } from 'tsyringe';
import { CreateUserService } from '../services/CreateUserService';
import { GetAllUsersService } from '../services/GetAllUsersService';
import { CreateChatRoomService } from '../services/CreateChatRoomService';
import { GetUserBySocketIdService } from '../services/GetUserBySocketId';
import { GetChatRoomByUsersService } from '../services/GetChatRoomByUsersService';
import { CreateMessageService } from '../services/CreateMessageService';
import { GetMessageByChatRoomService } from '../services/GetMessageByChatRoomService';

io.on('connect', (socket) => {
  socket.on('start', async (data) => {
    const { email, avatar, name } = data;
    const createUserService = container.resolve(CreateUserService);

    const user = await createUserService.execute({
      avatar,
      email,
      name,
      socket_id: socket.id,
    });

    socket.broadcast.emit('new_users', user);
  });

  socket.on('get_users', async (callback) => {
    const getAllUsersService = container.resolve(GetAllUsersService);

    const users = await getAllUsersService.execute();

    callback(users);
  });

  socket.on('start_chat', async (data, callback) => {
    const createChatRoomService = container.resolve(CreateChatRoomService);
    const getUserBySocketIdService = container.resolve(
      GetUserBySocketIdService
    );

    const getChatRoomByUsersService = container.resolve(
      GetChatRoomByUsersService
    );

    const getMessagesByChatRoomService = container.resolve(
      GetMessageByChatRoomService
    );

    const userLogged = await getUserBySocketIdService.execute(socket.id);

    let room = await getChatRoomByUsersService.execute([
      data.idUser,
      userLogged._id,
    ]);

    if (!room) {
      room = await createChatRoomService.execute([data.idUser, userLogged._id]);
    }

    socket.join(room.idChatRoom);

    const messages = await getMessagesByChatRoomService.execute(
      room.idChatRoom
    );

    callback({ room, messages });
  });

  socket.on('message', async (data) => {
    const getUserBySocketIdService = container.resolve(
      GetUserBySocketIdService
    );

    const user = await getUserBySocketIdService.execute(socket.id);

    const createMessageService = container.resolve(CreateMessageService);

    const message = await createMessageService.execute({
      to: user._id,
      text: data.message,
      roomId: data.idChatRoom,
    });

    io.to(data.idChatRoom).emit('message', {
      message,
      user,
    });
  });
});
