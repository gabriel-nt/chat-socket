import { injectable } from 'tsyringe';
import { User } from '../schemas/User';

interface CreateUserDTO {
  email: string;
  socket_id: string;
  avatar: string;
  name: string;
}

@injectable()
class CreateUserService {
  async execute({
    name,
    email,
    avatar,
    socket_id,
  }: CreateUserDTO): Promise<User> {
    const userAlreadyExists = await User.findOne({
      email,
    }).exec();

    if (userAlreadyExists) {
      const user = await User.findOneAndUpdate(
        {
          _id: userAlreadyExists.id,
        },
        {
          $set: {
            socket_id,
            avatar,
            name,
          },
        },
        {
          new: true,
        }
      );

      return user;
    }

    const user = await User.create({
      email,
      socket_id,
      avatar,
      name,
    });

    return user;
  }
}

export { CreateUserService };
