import { Request } from '@nestjs/common';
import { User } from 'src/features/users/entities/user.entity';

export type RequestWithUser = Request & { user: User };
