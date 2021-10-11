import { injectable } from 'tsyringe';
import { Message } from '../schemas/Message';

interface CreateMessageDTO {
  to: string;
  text: string;
  roomId: string;
}

@injectable()
class CreateMessageService {
  async execute({ roomId, text, to }: CreateMessageDTO) {
    const message = await Message.create({
      roomId,
      text,
      to,
    });

    return message;
  }
}

export { CreateMessageService };
